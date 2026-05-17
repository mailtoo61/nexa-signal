import type { Locale } from '@nexa/types';

export type ReleaseEnvironment = 'development' | 'preview' | 'production';
export type ReleaseChannel = 'dev' | 'preview' | 'production';

export interface MobileRuntimeConfig {
  appName: string;
  appSlug: string;
  bundleId: string;
  version: string;
  buildNumber: string;
  releaseChannel: ReleaseChannel;
  environment: ReleaseEnvironment;
  privacyPolicyUrl: string | null;
  termsUrl: string | null;
  supportUrl: string | null;
  marketingUrl: string | null;
  supportEmail: string | null;
  defaultLanguage: Locale;
}

export interface RuntimeConfigValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

function isDevRuntime(): boolean {
  return (
    typeof globalThis !== 'undefined' &&
    '__DEV__' in globalThis &&
    Boolean((globalThis as { __DEV__?: boolean }).__DEV__)
  );
}

export const DEFAULT_MOBILE_RUNTIME_CONFIG: MobileRuntimeConfig = {
  appName: 'NEXA SIGNAL',
  appSlug: 'nexa-signal',
  bundleId: 'app.nexasignal.ios',
  version: '0.1.0',
  buildNumber: '1',
  releaseChannel: isDevRuntime() ? 'dev' : 'production',
  environment: isDevRuntime() ? 'development' : 'production',
  privacyPolicyUrl: 'https://nexasignal.app/privacy',
  termsUrl: 'https://nexasignal.app/terms',
  supportUrl: 'https://nexasignal.app/support',
  marketingUrl: 'https://nexasignal.app',
  supportEmail: 'support@nexasignal.app',
  defaultLanguage: 'en',
};

function isUrl(value: string | null): boolean {
  if (!value) return false;
  return /^https:\/\/.+/i.test(value);
}

export function validateRuntimeConfig(
  config: MobileRuntimeConfig,
): RuntimeConfigValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!config.appName.trim()) errors.push('appName is required');
  if (!config.appSlug.trim()) errors.push('appSlug is required');
  if (!config.version.trim()) errors.push('version is required');
  if (!config.buildNumber.trim()) errors.push('buildNumber is required');

  if (
    config.releaseChannel !== 'dev' &&
    config.releaseChannel !== 'preview' &&
    config.releaseChannel !== 'production'
  ) {
    errors.push('releaseChannel must be dev, preview, or production');
  }

  if (
    config.environment !== 'development' &&
    config.environment !== 'preview' &&
    config.environment !== 'production'
  ) {
    errors.push('environment must be development, preview, or production');
  }

  if (config.environment === 'production') {
    if (
      config.bundleId.includes('yourcompany') ||
      config.bundleId.includes('example')
    ) {
      errors.push('bundleId must be production-ready');
    }
    if (!isUrl(config.privacyPolicyUrl)) {
      errors.push('privacyPolicyUrl must be a valid https URL in production');
    }
    if (!isUrl(config.termsUrl)) {
      errors.push('termsUrl must be a valid https URL in production');
    }
    if (!isUrl(config.supportUrl) && !config.supportEmail?.trim()) {
      errors.push(
        'supportUrl must be a valid https URL in production or supportEmail must be configured',
      );
    }
  } else {
    if (!isUrl(config.privacyPolicyUrl)) {
      warnings.push('privacyPolicyUrl should be configured before release');
    }
    if (!isUrl(config.termsUrl)) {
      warnings.push('termsUrl should be configured before release');
    }
    if (!isUrl(config.supportUrl) && !config.supportEmail?.trim()) {
      warnings.push(
        'supportUrl should be configured before release or supportEmail should be configured',
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export const mobileRuntimeConfig: MobileRuntimeConfig = {
  ...DEFAULT_MOBILE_RUNTIME_CONFIG,
};

const validationResult = validateRuntimeConfig(mobileRuntimeConfig);
if (
  isDevRuntime() &&
  (!validationResult.valid || validationResult.warnings.length > 0)
) {
  const message = [
    ...validationResult.errors.map((item) => `ERROR: ${item}`),
    ...validationResult.warnings.map((item) => `WARN: ${item}`),
  ].join(' | ');
  if (message) {
    console.warn(`[runtime-config] ${message}`);
  }
}
