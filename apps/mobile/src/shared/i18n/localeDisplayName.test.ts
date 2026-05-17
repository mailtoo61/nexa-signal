import { describe, expect, it } from 'vitest';
import { getLocaleDisplayName } from './localeDisplayName';

describe('locale display names', () => {
  it('maps locale names to user-friendly labels', () => {
    expect(getLocaleDisplayName('en', 'en')).toBe('English');
    expect(getLocaleDisplayName('tr', 'en')).toBe('Türkçe');
    expect(getLocaleDisplayName('de', 'en')).toBe('Deutsch');
    expect(getLocaleDisplayName('es', 'en')).toBe('Español');
    expect(getLocaleDisplayName('ja', 'en')).toBe('日本語');
    expect(getLocaleDisplayName('pt-BR', 'en')).toBe('Português (Brasil)');
  });
});
