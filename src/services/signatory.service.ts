import { promises as fs } from 'fs';
import path from 'path';

import { ApiError } from '../errors/ApiError';
import { fileToBase64 } from '../helpers/fileToBase64';
import { pickDefaultCoordinates } from '../helpers/coordinatePicker';
import { getOmniSwitchClient } from '../integrations/omniswitch';
import { getPrismaClient } from '../lib/prisma';
import { EventService } from './event.service';

type CreateSignatoryArgs = {
  requestId: string;
  organizationId: string;
  actorUserId: string;
  name: string;
  email: string;
  phone?: string;
  dni: string;
  override?: { x?: number; y?: number; page?: number };
  evidenceFile?: { mimetype: string; size: number; path: string };
};

export class SignatoryService {
  public static async addSignatory(args: CreateSignatoryArgs): Promise<{ id: string }> {
    const prisma = getPrismaClient();

    const request = await prisma.request.findFirst({
      where: { id: args.requestId, organizationId: args.organizationId },
      select: {
        id: true,
        organizationId: true,
        externalRequestId: true,
        status: true,
        sourceDocumentPath: true,
      },
    });

    if (!request) {
      throw new ApiError({ statusCode: 404, code: 'NOT_FOUND', message: 'Request not found' });
    }

    if (!request.externalRequestId) {
      throw new ApiError({ statusCode: 409, code: 'MISSING_EXTERNAL_ID', message: 'Request is missing externalRequestId' });
    }

    if (!request.sourceDocumentPath) {
      throw new ApiError({ statusCode: 409, code: 'MISSING_DOCUMENT', message: 'Request has no source document' });
    }

    const absolutePdfPath = path.join(process.cwd(), request.sourceDocumentPath);

    const coords = await pickDefaultCoordinates(absolutePdfPath);

    const x = args.override?.x ?? coords.x;
    const y = args.override?.y ?? coords.y;
    const page = args.override?.page ?? coords.page;

    let evidencePath: string | undefined;
    let evidenceBase64: string | undefined;

    if (args.evidenceFile) {
      if (args.evidenceFile.size <= 0) {
        throw new ApiError({ statusCode: 400, code: 'BAD_EVIDENCE', message: 'Evidence file is empty' });
      }

      const evidenceDir = path.join(process.cwd(), 'storage', args.organizationId, request.id, 'evidence');
      await fs.mkdir(evidenceDir, { recursive: true });

      const dest = path.join(evidenceDir, `${Date.now()}`);
      await fs.copyFile(args.evidenceFile.path, dest);

      evidencePath = path.relative(process.cwd(), dest);
      evidenceBase64 = await fileToBase64(dest);
    }

    const created = await prisma.signatory.create({
      data: {
        requestId: request.id,
        name: args.name,
        email: args.email,
        phone: args.phone,
        dni: args.dni,
        evidencePath,
        x,
        y,
        page,
      },
    });

    const client = getOmniSwitchClient();
    const providerRes = await client.post<
      {
        IdSolicitud: string;
        Name: string;
        Email: string;
        Phone?: string;
        Dni: string;
        EvidenceBase64?: string;
        x: number;
        y: number;
        page: number;
      },
      { ok: boolean }
    >({
      endpoint: '/SolicitudeCreateSignatory',
      payload: {
        IdSolicitud: request.externalRequestId,
        Name: created.name,
        Email: created.email,
        Phone: created.phone ?? undefined,
        Dni: created.dni,
        EvidenceBase64: evidenceBase64,
        x: created.x ?? x,
        y: created.y ?? y,
        page: created.page ?? page,
      },
    });

    if (!providerRes.ok) {
      throw new ApiError({ statusCode: 502, code: providerRes.code, message: providerRes.message, detail: providerRes.detail });
    }

    await prisma.request.update({
      where: { id: request.id },
      data: { status: 'SIGNATORIES_ADDED' },
    });

    await EventService.recordEvent({
      requestId: request.id,
      organizationId: args.organizationId,
      actorUserId: args.actorUserId,
      type: 'SIGNATORIES_ADDED',
      metadata: { signatoryId: created.id },
    });

    return { id: created.id };
  }
}
