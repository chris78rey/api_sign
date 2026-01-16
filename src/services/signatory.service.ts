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

function parseNumberEnv(name: string, defaultValue: number): number {
  const raw = process.env[name];
  if (raw === undefined) return defaultValue;
  const n = Number(raw);
  if (!Number.isFinite(n)) return defaultValue;
  return n;
}

function splitFullName(fullName: string): {
  primerNombre: string;
  segunNombre?: string;
  primerApellido: string;
  segApellido?: string;
} {
  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter((p) => p.length > 0);

  if (parts.length === 0) {
    return { primerNombre: 'N/A', primerApellido: 'N/A' };
  }

  if (parts.length === 1) {
    return { primerNombre: parts[0], primerApellido: parts[0] };
  }

  if (parts.length === 2) {
    return { primerNombre: parts[0], primerApellido: parts[1] };
  }

  if (parts.length === 3) {
    return { primerNombre: parts[0], segunNombre: parts[1], primerApellido: parts[2] };
  }

  const primerNombre = parts[0];
  const segunNombre = parts[1];
  const primerApellido = parts[2];
  const segApellido = parts.slice(3).join(' ');

  return { primerNombre, segunNombre, primerApellido, segApellido };
}

function isRealOmniSwitchMode(): boolean {
  return (process.env.OMNISWITCH_MODE ?? 'mock').toLowerCase() === 'real';
}

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

    const existingSignatories = await prisma.signatory.count({ where: { requestId: request.id } });
    const firmaPrincipal = existingSignatories <= 1 ? 1 : 0;

    const nameParts = splitFullName(created.name);

    const celular = created.phone ?? '';
    if (isRealOmniSwitchMode() && celular.trim().length === 0) {
      throw new ApiError({ statusCode: 400, code: 'PHONE_REQUIRED', message: 'phone is required for OmniSwitch signatory creation' });
    }

    const idPais = Math.trunc(parseNumberEnv('OMNISWITCH_DEFAULT_COUNTRY_ID', 0));
    const idProvincia = Math.trunc(parseNumberEnv('OMNISWITCH_DEFAULT_PROVINCE_ID', 0));
    const idCiudad = Math.trunc(parseNumberEnv('OMNISWITCH_DEFAULT_CITY_ID', 0));
    const address = process.env.OMNISWITCH_DEFAULT_ADDRESS ?? 'Unknown';

    const client = getOmniSwitchClient();
    const providerRes = await client.post<
      {
        IdSolicitud: string;
        IDSolicitude?: string;
        PrimerNombre: string;
        SegunNombre?: string;
        PrimerApellido: string;
        SegApellido?: string;
        Celular: string;
        Email: string;
        FirmaPrincipal: number;
        IdPais: number;
        IdProvincia: number;
        IdCiudad: number;
        address: string;
        DocumentoBase64?: string;
        IDClienteTrx?: string;
        Cedula?: string;
      },
      { resultCode?: number; resultText?: string }
    >({
      endpoint: '/api/v1/SolicitudeCreateSignatory',
      payload: {
        IdSolicitud: request.externalRequestId,
        IDSolicitude: request.externalRequestId,
        PrimerNombre: nameParts.primerNombre,
        SegunNombre: nameParts.segunNombre,
        PrimerApellido: nameParts.primerApellido,
        SegApellido: nameParts.segApellido,
        Celular: celular,
        Email: created.email,
        FirmaPrincipal: firmaPrincipal,
        IdPais: idPais,
        IdProvincia: idProvincia,
        IdCiudad: idCiudad,
        address,
        DocumentoBase64: evidenceBase64,
        IDClienteTrx: request.id,
        Cedula: created.dni,
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
