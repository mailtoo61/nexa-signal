import {
  DEFAULT_TUNING_PROFILE_TAG,
  sanitizeTuningProfileTag,
} from './tuningProfileTag';

export const MAX_SAVED_TUNING_TAGS = 12;
export const MAX_EXPERIMENT_NOTE_LENGTH = 240;

export function sanitizeSavedTuningTags(values: unknown[]): string[] {
  const next: string[] = [DEFAULT_TUNING_PROFILE_TAG];
  for (const value of values) {
    if (typeof value !== 'string') continue;
    const tag = sanitizeTuningProfileTag(value);
    if (next.includes(tag)) continue;
    next.push(tag);
    if (next.length >= MAX_SAVED_TUNING_TAGS) break;
  }
  return next;
}

export function addSavedTuningTag(savedTags: string[], tag: string): string[] {
  const sanitized = sanitizeSavedTuningTags(savedTags);
  const nextTag = sanitizeTuningProfileTag(tag);
  if (sanitized.includes(nextTag)) return sanitized;
  return sanitizeSavedTuningTags([...sanitized, nextTag]);
}

export function removeSavedTuningTag(
  savedTags: string[],
  tag: string,
  activeTag: string,
): { savedTags: string[]; activeTag: string } {
  const sanitized = sanitizeSavedTuningTags(savedTags);
  const target = sanitizeTuningProfileTag(tag);
  if (target === DEFAULT_TUNING_PROFILE_TAG) {
    return { savedTags: sanitized, activeTag };
  }
  const next = sanitized.filter((item) => item !== target);
  const normalizedActive = sanitizeTuningProfileTag(activeTag);
  const nextActive =
    normalizedActive === target ? DEFAULT_TUNING_PROFILE_TAG : normalizedActive;
  return { savedTags: sanitizeSavedTuningTags(next), activeTag: nextActive };
}

export function sanitizeExperimentNote(value: string): string {
  const noControl = [...value]
    .map((char) => {
      const code = char.charCodeAt(0);
      if ((code >= 0 && code <= 31) || code === 127) {
        return ' ';
      }
      return char;
    })
    .join('');
  return noControl
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_EXPERIMENT_NOTE_LENGTH);
}

export function sanitizeExperimentNotesByTag(
  input: unknown,
): Record<string, string> {
  if (!input || typeof input !== 'object') return {};
  const entries = Object.entries(input as Record<string, unknown>);
  const result: Record<string, string> = {};
  for (const [rawTag, rawNote] of entries) {
    if (typeof rawNote !== 'string') continue;
    const tag = sanitizeTuningProfileTag(rawTag);
    const note = sanitizeExperimentNote(rawNote);
    if (!note) continue;
    result[tag] = note;
    if (Object.keys(result).length >= MAX_SAVED_TUNING_TAGS) break;
  }
  return result;
}
