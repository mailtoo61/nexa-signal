import { describe, expect, it } from 'vitest';
import {
  DEFAULT_TUNING_PROFILE_TAG,
  sanitizeTuningProfileTag,
} from './tuningProfileTag';

describe('tuningProfileTag', () => {
  it('sanitizes valid tags to normalized format', () => {
    expect(sanitizeTuningProfileTag('V1 Soft Intro')).toBe('v1-soft-intro');
  });

  it('falls back to baseline for invalid tags', () => {
    expect(sanitizeTuningProfileTag('***')).toBe(DEFAULT_TUNING_PROFILE_TAG);
  });
});
