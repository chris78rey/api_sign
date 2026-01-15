import { promises as fs } from 'fs';
import path from 'path';

import { ApiError } from '../errors/ApiError';
import { getOmniSwitchClient } from '../integrations/omniswitch';
import { getPrismaClient } from '../lib/prisma';
import { EventService } from './event.service';
import { getFinalDocumentPath, getRequestStorageDir } from './storage.service';

export class DocumentService {
  public static async fetchAndStoreFinalDocument(args: {
    requestId: string;
    organizationId: string;
    actorUserId: string;
  }): Promise<{ absolutePath: string }> {
    const prisma = getPrismaClient();

    const request = await prisma.request.findFirst({
      where: { id: args.requestId, organizationId: args.organizationId },
      select: { id: true, organizationId: true, externalRequestId: true, status: true, finalDocumentPath: true },
    });

    if (!request) {
      throw new ApiError({ statusCode: 404, code: 'NOT_FOUND', message: 'Request not found' });
    }

    if (!request.externalRequestId) {
      throw new ApiError({ statusCode: 409, code: 'MISSING_EXTERNAL_ID', message: 'Request is missing externalRequestId' });
    }

    const storageDir = getRequestStorageDir({ organizationId: request.organizationId, requestId: request.id });
    await fs.mkdir(storageDir, { recursive: true });

    const client = getOmniSwitchClient();
    const res = await client.post<{ IdSolicitud: string }, { DocumentoBase64: string }>({
      endpoint: '/SolicitudeGetFinalDocument',
      payload: { IdSolicitud: request.externalRequestId },
    });

    if (!res.ok) {
      if (res.code === 'PENDING') {
        throw new ApiError({ statusCode: 409, code: 'PENDING', message: 'Final document not available yet' });
      }
      throw new ApiError({ statusCode: 502, code: res.code, message: res.message, detail: res.detail });
    }

    const bytes = Buffer.from(res.data.DocumentoBase64, 'base64');
    const absolutePath = getFinalDocumentPath({ organizationId: request.organizationId, requestId: request.id });

    await fs.writeFile(absolutePath, bytes);

    const relative = path.relative(process.cwd(), absolutePath);

    await prisma.request.update({ where: { id: request.id }, data: { finalDocumentPath: relative } });

    await EventService.recordEvent({
      requestId: request.id,
      organizationId: args.organizationId,
      actorUserId: args.actorUserId,
      type: 'SIGNED',
      metadata: { finalDocumentPath: relative },
    });

    return { absolutePath };
  }
}
