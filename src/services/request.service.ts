import { promises as fs } from 'fs';
import path from 'path';

import { ApiError } from '../errors/ApiError';
import { getOmniSwitchClient } from '../integrations/omniswitch';
import { getPrismaClient } from '../lib/prisma';
import { fileToBase64 } from '../helpers/fileToBase64';
import { EventService } from './event.service';

type CreateRequestArgs = {
  organizationId: string;
  actorUserId: string;
  uploadedPdf: {
    originalname: string;
    mimetype: string;
    size: number;
    path: string;
  };
};

export class RequestService {
  public static async createRequest(args: CreateRequestArgs): Promise<{ id: string }> {
    if (args.uploadedPdf.size <= 0) {
      throw new ApiError({ statusCode: 400, code: 'BAD_PDF', message: 'PDF file is empty' });
    }

    if (args.uploadedPdf.mimetype !== 'application/pdf') {
      throw new ApiError({ statusCode: 400, code: 'BAD_PDF', message: 'Invalid PDF mimetype' });
    }

    const prisma = getPrismaClient();

    const org = await prisma.organization.findUnique({
      where: { id: args.organizationId },
      select: { evidenceRequiredDefault: true },
    });

    if (!org) {
      throw new ApiError({ statusCode: 404, code: 'ORG_NOT_FOUND', message: 'Organization not found' });
    }

    const evidenceRequired = org.evidenceRequiredDefault;

    const created = await prisma.request.create({
      data: {
        organizationId: args.organizationId,
        status: 'CREATED',
        clientTrxId: `${args.organizationId}-${Date.now()}`,
        evidenceRequired,
      },
    });

    await EventService.recordEvent({
      requestId: created.id,
      organizationId: args.organizationId,
      actorUserId: args.actorUserId,
      type: 'CREATED',
      metadata: { evidenceRequired },
    });

    const storageDir = path.join(process.cwd(), 'storage', args.organizationId, created.id);
    await fs.mkdir(storageDir, { recursive: true });

    const destPath = path.join(storageDir, 'original.pdf');
    await fs.copyFile(args.uploadedPdf.path, destPath);

    const base64 = await fileToBase64(destPath);

    const client = getOmniSwitchClient();

    const createRes = await client.post<
      {
        IdProcess: number;
        PaymentRequired: string | number;
        BiometricRequired: number;
        amount: number;
        IDClienteTrx?: string;
      },
      { IdSolicitud: string }
    >({
      endpoint: '/api/v1/SolicitudeCreate',
      payload: {
        IdProcess: Number(process.env.OMNISWITCH_ID_PROCESS ?? 0),
        PaymentRequired: process.env.OMNISWITCH_PAYMENT_REQUIRED ?? 0,
        BiometricRequired: Number(process.env.OMNISWITCH_BIOMETRIC_REQUIRED ?? 0),
        amount: Number(process.env.OMNISWITCH_AMOUNT ?? 0),
        IDClienteTrx: created.clientTrxId ?? created.id,
      },
    });

    if (!createRes.ok) {
      throw new ApiError({ statusCode: 502, code: createRes.code, message: createRes.message, detail: createRes.detail });
    }

    const externalRequestId = createRes.data.IdSolicitud;

    const uploadRes = await client.post<
      {
        IdSolicitud: string;
        IDSolicitude?: string;
        NombreDocumento: string;
        DocumentoBase64: string;
        IDClienteTrx?: string;
      },
      { FileName?: string }
    >({
      endpoint: '/api/v1/SolicitudeCreateDocument',
      payload: {
        IdSolicitud: externalRequestId,
        IDSolicitude: externalRequestId,
        NombreDocumento: args.uploadedPdf.originalname,
        DocumentoBase64: base64,
        IDClienteTrx: created.clientTrxId ?? created.id,
      },
    });

    if (!uploadRes.ok) {
      throw new ApiError({ statusCode: 502, code: uploadRes.code, message: uploadRes.message, detail: uploadRes.detail });
    }

    await prisma.request.update({
      where: { id: created.id },
      data: {
        externalRequestId,
        status: 'DOCUMENT_UPLOADED',
        sourceDocumentPath: path.relative(process.cwd(), destPath),
        providerDocumentName: uploadRes.ok ? (uploadRes.data.FileName ?? args.uploadedPdf.originalname) : args.uploadedPdf.originalname,
      },
    });

    await EventService.recordEvent({
      requestId: created.id,
      organizationId: args.organizationId,
      actorUserId: args.actorUserId,
      type: 'DOCUMENT_UPLOADED',
      metadata: { sourceDocumentPath: path.relative(process.cwd(), destPath) },
    });

    return { id: created.id };
  }

  public static async getRequest(args: { id: string; organizationId: string }) {
    const prisma = getPrismaClient();

    const request = await prisma.request.findFirst({
      where: { id: args.id, organizationId: args.organizationId },
      select: {
        id: true,
        organizationId: true,
        externalRequestId: true,
        clientTrxId: true,
        status: true,
        evidenceRequired: true,
        amountPaidCents: true,
        amountPaidCurrency: true,
        paymentReference: true,
        paidAt: true,
        sourceDocumentPath: true,
        providerDocumentName: true,
        finalDocumentPath: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!request) {
      throw new ApiError({ statusCode: 404, code: 'NOT_FOUND', message: 'Request not found' });
    }

    const signatoriesCount = await prisma.signatory.count({
      where: { requestId: request.id, request: { organizationId: args.organizationId } },
    });

    return { ...request, signatoriesCount };
  }

  public static async recordPayment(args: {
    id: string;
    organizationId: string;
    actorUserId: string;
    amountPaidCents: number;
    currency: string;
    reference?: string;
  }) {
    const prisma = getPrismaClient();

    const existing = await prisma.request.findFirst({
      where: { id: args.id, organizationId: args.organizationId },
      select: { id: true, organizationId: true },
    });

    if (!existing) {
      throw new ApiError({ statusCode: 404, code: 'NOT_FOUND', message: 'Request not found' });
    }

    const updated = await prisma.request.update({
      where: { id: existing.id },
      data: {
        amountPaidCents: args.amountPaidCents,
        amountPaidCurrency: args.currency,
        paymentReference: args.reference ?? null,
        paidAt: new Date(),
      },
      select: {
        id: true,
        organizationId: true,
        externalRequestId: true,
        clientTrxId: true,
        status: true,
        evidenceRequired: true,
        amountPaidCents: true,
        amountPaidCurrency: true,
        paymentReference: true,
        paidAt: true,
        sourceDocumentPath: true,
        providerDocumentName: true,
        finalDocumentPath: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await EventService.recordEvent({
      requestId: updated.id,
      organizationId: args.organizationId,
      actorUserId: args.actorUserId,
      type: 'PAYMENT_RECORDED',
      metadata: {
        amountPaidCents: args.amountPaidCents,
        currency: args.currency,
        reference: args.reference ?? undefined,
      },
    });

    const signatoriesCount = await prisma.signatory.count({
      where: { requestId: updated.id, request: { organizationId: args.organizationId } },
    });

    return { ...updated, signatoriesCount };
  }
}
