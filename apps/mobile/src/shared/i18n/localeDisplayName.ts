import type { Locale } from '@nexa/types';
import { tr } from './tr';

export function getLocaleDisplayName(
  language: Locale,
  uiLocale: Locale,
): string {
  const keyMap: Record<Locale, string> = {
    en: 'languageName_en',
    tr: 'languageName_tr',
    de: 'languageName_de',
    es: 'languageName_es',
    ja: 'languageName_ja',
    'pt-BR': 'languageName_ptBR',
  };
  return tr(uiLocale, keyMap[language]);
}
