export const DEFAULT_TUNING_PROFILE_TAG = 'baseline';
const TAG_REGEX = /^[a-z0-9-]{1,32}$/;

export function sanitizeTuningProfileTag(input: string): string {
  const normalized = input.trim().toLowerCase().replace(/\s+/g, '-');
  const compact = normalized.replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');
  const trimmed = compact.replace(/^-+|-+$/g, '').slice(0, 32);
  if (!trimmed || !TAG_REGEX.test(trimmed)) {
    return DEFAULT_TUNING_PROFILE_TAG;
  }
  return trimmed;
}

export function isValidTuningProfileTag(input: string): boolean {
  return sanitizeTuningProfileTag(input) === input.trim().toLowerCase();
}
