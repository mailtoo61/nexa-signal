import { describe, expect, it } from 'vitest';
import { mergeReducedMotionPreference } from './reducedMotionPreference';

describe('reduced motion merge', () => {
  it('returns true when system reduced motion is enabled', () => {
    expect(mergeReducedMotionPreference(true, false)).toBe(true);
  });

  it('returns true when user forces reduced motion', () => {
    expect(mergeReducedMotionPreference(false, true)).toBe(true);
  });

  it('returns false when both are disabled', () => {
    expect(mergeReducedMotionPreference(false, false)).toBe(false);
  });
});
