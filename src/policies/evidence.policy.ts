import { ApiError } from '../errors/ApiError';

function parseBooleanEnv(name: string, defaultValue: boolean): boolean {
  const raw = process.env[name];
  if (raw === undefined) return defaultValue;

  const normalized = raw.trim().toLowerCase();
  if (['1', 'true', 'yes', 'y', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'n', 'off'].includes(normalized)) return false;

  throw new ApiError({ statusCode: 500, code: 'ENV_INVALID', message: `${name} has invalid value` });
}

export function isEvidenceRequiredDefaultForNewOrganizations(): boolean {
  return parseBooleanEnv('EVIDENCE_REQUIRED', false);
}
