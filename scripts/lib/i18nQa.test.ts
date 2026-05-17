import { describe, expect, it } from 'vitest';
import { validateI18nDictionaries } from './i18nQa';

describe('validateI18nDictionaries', () => {
  it('passes with current locale dictionaries', () => {
    const result = validateI18nDictionaries();
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
