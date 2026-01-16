import { ApiError } from '../errors/ApiError';
import { getOmniSwitchClient } from '../integrations/omniswitch';
import { getPrismaClient } from '../lib/prisma';
import { EventService } from './event.service';

export class SendService {
  public static async sendRequest(args: { requestId: string; organizationId: string; actorUserId: string }): Promise<void> {
    const prisma = getPrismaClient();

    const request = await prisma.request.findFirst({
      where: { id: args.requestId, organizationId: args.organizationId },
      select: { id: true, externalRequestId: true, status: true, evidenceRequired: true },
    });

    if (!request) {
      throw new ApiError({ statusCode: 404, code: 'NOT_FOUND', message: 'Request not found' });
    }

    if (!request.externalRequestId) {
      throw new ApiError({ statusCode: 409, code: 'MISSING_EXTERNAL_ID', message: 'Request is missing externalRequestId' });
    }

    if (request.status === 'SENT' || request.status === 'SIGNED') {
      throw new ApiError({ statusCode: 409, code: 'ALREADY_SENT', message: 'Request already sent' });
    }

    const signatories = await prisma.signatory.count({ where: { requestId: request.id } });
    if (signatories <= 0) {
      throw new ApiError({ statusCode: 400, code: 'NO_SIGNATORIES', message: 'Request has no signatories' });
    }

    if (request.evidenceRequired) {
      const missingEvidence = await prisma.signatory.count({ where: { requestId: request.id, evidencePath: null } });
      if (missingEvidence > 0) {
        throw new ApiError({
          statusCode: 409,
          code: 'EVIDENCE_REQUIRED',
          message: 'Evidence is required for all signatories before sending',
          detail: { missingEvidence },
        });
      }
    }

    const client = getOmniSwitchClient();
    const providerRes = await client.post<{ IdSolicitud: string; IDSolicitude?: string }, { ok: boolean }>({
      endpoint: '/api/v1/SolicitudeSend',
      payload: { IdSolicitud: request.externalRequestId, IDSolicitude: request.externalRequestId },
    });

    if (!providerRes.ok) {
      throw new ApiError({ statusCode: 502, code: providerRes.code, message: providerRes.message, detail: providerRes.detail });
    }

    await prisma.request.update({ where: { id: request.id }, data: { status: 'SENT' } });

    await EventService.recordEvent({
      requestId: request.id,
      organizationId: args.organizationId,
      actorUserId: args.actorUserId,
      type: 'SENT',
    });
  }
}
