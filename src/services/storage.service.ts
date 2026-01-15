import path from 'path';

import { ApiError } from '../errors/ApiError';

function assertSafeSegment(value: string, field: string): void {
  if (value.includes('..') || value.includes('/') || value.includes('\\')) {
    throw new ApiError({ statusCode: 400, code: 'BAD_REQUEST', message: `Invalid ${field}` });
  }
}

export function getRequestStorageDir(args: { organizationId: string; requestId: string }): string {
  assertSafeSegment(args.organizationId, 'organizationId');
  assertSafeSegment(args.requestId, 'requestId');

  return path.join(process.cwd(), 'storage', args.organizationId, args.requestId);
}

export function getFinalDocumentPath(args: { organizationId: string; requestId: string }): string {
  const dir = getRequestStorageDir(args);
  return path.join(dir, 'final.pdf');
}
