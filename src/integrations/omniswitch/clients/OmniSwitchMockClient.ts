import crypto from 'crypto';

import type { OmniSwitchClient, OmniSwitchPostArgs, OmniSwitchResult } from '../types/omniswitch.types';

type MockState = {
  requests: Map<string, { documentBase64?: string; signatories: number; sent: boolean }>;
};

const state: MockState = {
  requests: new Map(),
};

export class OmniSwitchMockClient implements OmniSwitchClient {
  public async post<TPayload, TResponse>(
    args: OmniSwitchPostArgs<TPayload>
  ): Promise<OmniSwitchResult<TResponse>> {
    const endpoint = args.endpoint;

    if (endpoint === '/SolicitudeCreate') {
      const externalRequestId = `REQ_${crypto.randomUUID()}`;
      state.requests.set(externalRequestId, { signatories: 0, sent: false });

      return { ok: true, data: { IdSolicitud: externalRequestId } as unknown as TResponse };
    }

    if (endpoint === '/SolicitudeCreateDocument') {
      const payload = args.payload as { IdSolicitud?: string; DocumentoBase64?: string };
      if (!payload.IdSolicitud || !state.requests.has(payload.IdSolicitud)) {
        return { ok: false, code: 'NOT_FOUND', message: 'Unknown IdSolicitud' };
      }

      const request = state.requests.get(payload.IdSolicitud);
      if (!request) {
        return { ok: false, code: 'NOT_FOUND', message: 'Unknown IdSolicitud' };
      }

      request.documentBase64 = payload.DocumentoBase64;
      return { ok: true, data: { ok: true } as unknown as TResponse };
    }

    if (endpoint === '/SolicitudeCreateSignatory') {
      const payload = args.payload as { IdSolicitud?: string };
      if (!payload.IdSolicitud || !state.requests.has(payload.IdSolicitud)) {
        return { ok: false, code: 'NOT_FOUND', message: 'Unknown IdSolicitud' };
      }

      const request = state.requests.get(payload.IdSolicitud);
      if (!request) {
        return { ok: false, code: 'NOT_FOUND', message: 'Unknown IdSolicitud' };
      }

      request.signatories += 1;
      return { ok: true, data: { ok: true } as unknown as TResponse };
    }

    if (endpoint === '/SolicitudeSend') {
      const payload = args.payload as { IdSolicitud?: string };
      if (!payload.IdSolicitud || !state.requests.has(payload.IdSolicitud)) {
        return { ok: false, code: 'NOT_FOUND', message: 'Unknown IdSolicitud' };
      }

      const request = state.requests.get(payload.IdSolicitud);
      if (!request) {
        return { ok: false, code: 'NOT_FOUND', message: 'Unknown IdSolicitud' };
      }

      if (request.signatories <= 0) {
        return { ok: false, code: 'INVALID_STATE', message: 'No signatories present' };
      }

      if (request.sent) {
        return { ok: false, code: 'ALREADY_SENT', message: 'Request already sent' };
      }

      request.sent = true;
      return { ok: true, data: { ok: true } as unknown as TResponse };
    }

    if (endpoint === '/SolicitudeGetFinalDocument') {
      const payload = args.payload as { IdSolicitud?: string };
      if (!payload.IdSolicitud || !state.requests.has(payload.IdSolicitud)) {
        return { ok: false, code: 'NOT_FOUND', message: 'Unknown IdSolicitud' };
      }

      const request = state.requests.get(payload.IdSolicitud);
      if (!request) {
        return { ok: false, code: 'NOT_FOUND', message: 'Unknown IdSolicitud' };
      }

      if (!request.sent) {
        return { ok: false, code: 'PENDING', message: 'Document not available yet' };
      }

      const minimalPdf = Buffer.from(
        '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 44 >>\nstream\nBT /F1 12 Tf 10 100 Td (signed mock) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000117 00000 n \n0000000210 00000 n \ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n305\n%%EOF\n',
        'utf8'
      );

      return { ok: true, data: { DocumentoBase64: minimalPdf.toString('base64') } as unknown as TResponse };
    }

    return { ok: false, code: 'UNKNOWN_ENDPOINT', message: `Unknown endpoint: ${endpoint}` };
  }
}
