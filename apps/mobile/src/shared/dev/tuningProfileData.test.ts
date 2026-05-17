import { describe, expect, it } from 'vitest';
import {
  MAX_EXPERIMENT_NOTE_LENGTH,
  MAX_SAVED_TUNING_TAGS,
  addSavedTuningTag,
  removeSavedTuningTag,
  sanitizeExperimentNote,
  sanitizeExperimentNotesByTag,
  sanitizeSavedTuningTags,
} from './tuningProfileData';

describe('tuningProfileData', () => {
  it('sanitizes and deduplicates saved tags with baseline default', () => {
    const tags = sanitizeSavedTuningTags([
      'BASELINE',
      'v1 soft intro',
      'v1-soft-intro',
    ]);
    expect(tags[0]).toBe('baseline');
    expect(tags).toContain('v1-soft-intro');
    expect(tags.filter((t) => t === 'v1-soft-intro')).toHaveLength(1);
  });

  it('respects max saved tag cap', () => {
    const source = Array.from({ length: 50 }, (_, i) => `tag-${i}`);
    const tags = sanitizeSavedTuningTags(source);
    expect(tags.length).toBeLessThanOrEqual(MAX_SAVED_TUNING_TAGS);
  });

  it('prevents duplicates when adding', () => {
    const next = addSavedTuningTag(
      ['baseline', 'v1-soft-intro'],
      'v1 soft intro',
    );
    expect(next.filter((t) => t === 'v1-soft-intro')).toHaveLength(1);
  });

  it('does not remove baseline and falls back active tag after deletion', () => {
    const baselineAttempt = removeSavedTuningTag(
      ['baseline', 'v1'],
      'baseline',
      'baseline',
    );
    expect(baselineAttempt.savedTags).toContain('baseline');

    const removed = removeSavedTuningTag(['baseline', 'v1'], 'v1', 'v1');
    expect(removed.activeTag).toBe('baseline');
    expect(removed.savedTags).not.toContain('v1');
  });

  it('trims notes to max length and strips control chars', () => {
    const raw = `${'a'.repeat(MAX_EXPERIMENT_NOTE_LENGTH + 10)}\n\u0000`;
    const sanitized = sanitizeExperimentNote(raw);
    expect(sanitized.length).toBeLessThanOrEqual(MAX_EXPERIMENT_NOTE_LENGTH);
    expect(sanitized.includes('\u0000')).toBe(false);
  });

  it('sanitizes notes-by-tag object safely', () => {
    const notes = sanitizeExperimentNotesByTag({
      'V1 Soft Intro': '  note  ',
      invalid: 42,
    });
    expect(notes['v1-soft-intro']).toBe('note');
  });
});
