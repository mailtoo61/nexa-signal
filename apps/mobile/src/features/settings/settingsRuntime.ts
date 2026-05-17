import type { Locale } from '@nexa/types';
import { tr } from '../../shared/i18n/tr';
import type {
  MobileRuntimeConfig,
  RuntimeConfigValidationResult,
} from '../../shared/config/runtimeConfig';

export interface SettingsMetadataLine {
  label: string;
  value: string;
}

export function formatSettingsMetadata(
  locale: Locale,
  config: MobileRuntimeConfig,
): SettingsMetadataLine[] {
  return [
    { label: tr(locale, 'versionLabel'), value: config.version },
    { label: tr(locale, 'buildLabel'), value: config.buildNumber },
    { label: tr(locale, 'channelLabel'), value: config.releaseChannel },
    { label: tr(locale, 'environmentLabel'), value: config.environment },
    {
      label: tr(locale, 'supportEmailLabel'),
      value: config.supportEmail ?? tr(locale, 'notConfigured'),
    },
  ];
}

export function unavailableLinkReason(
  locale: Locale,
  validation: RuntimeConfigValidationResult,
): string {
  if (validation.valid) return tr(locale, 'linkUnavailableBody');
  return tr(locale, 'configureLinkBeforeRelease');
}
