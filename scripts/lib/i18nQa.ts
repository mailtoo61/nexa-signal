import { dictionaries, fallbackLocale } from '../../packages/i18n/src/index';
import type { Locale } from '../../packages/types/src';

export interface I18nQaResult {
  valid: boolean;
  errors: string[];
}

const PLACEHOLDER_PATTERN = /\b(TODO|TBD|lorem ipsum|\?\?\?)\b/i;
const TURKISH_MOJIBAKE_PATTERN = /Ä|Å|Ã|ï¿½|Titre\?/;

export function validateI18nDictionaries(): I18nQaResult {
  const errors: string[] = [];
  const locales = Object.keys(dictionaries) as Locale[];
  const fallback = dictionaries[fallbackLocale];
  const expectedKeys = new Set(Object.keys(fallback));

  for (const locale of locales) {
    const dict = dictionaries[locale];
    const keys = new Set(Object.keys(dict));

    for (const key of expectedKeys) {
      if (!keys.has(key)) {
        errors.push(`[${locale}] missing key: ${key}`);
      }
    }

    for (const key of keys) {
      if (!expectedKeys.has(key)) {
        errors.push(`[${locale}] unexpected key: ${key}`);
      }
    }

    for (const [key, value] of Object.entries(dict)) {
      if (!value.trim()) {
        errors.push(`[${locale}] empty value: ${key}`);
      }
      if (PLACEHOLDER_PATTERN.test(value)) {
        errors.push(`[${locale}] placeholder-like value: ${key}`);
      }
      if (locale === 'tr' && TURKISH_MOJIBAKE_PATTERN.test(value)) {
        errors.push(`[${locale}] mojibake-like value: ${key}`);
      }
    }

    for (const languageKey of [
      'languageName_en',
      'languageName_tr',
      'languageName_de',
      'languageName_es',
      'languageName_ja',
      'languageName_ptBR',
    ]) {
      const value = dict[languageKey];
      if (!value || !value.trim()) {
        errors.push(
          `[${locale}] missing language display name: ${languageKey}`,
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
