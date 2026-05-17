import { t } from '@nexa/i18n';
import type { Locale } from '@nexa/types';

export function tr(locale: Locale, key: string): string {
  return t(locale, key);
}
