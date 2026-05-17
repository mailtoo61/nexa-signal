import {
  type MobileRuntimeConfig,
  mobileRuntimeConfig,
  validateRuntimeConfig,
} from '../../apps/mobile/src/shared/config/runtimeConfig';

export interface ReleaseConfigCheckResult {
  valid: boolean;
  errors: string[];
}

export function validateReleaseConfigReadiness(
  config: MobileRuntimeConfig = mobileRuntimeConfig,
): ReleaseConfigCheckResult {
  const errors: string[] = [];
  const base = validateRuntimeConfig(config);

  errors.push(...base.errors);

  if (
    !config.bundleId ||
    /yourcompany|example|placeholder/i.test(config.bundleId)
  ) {
    errors.push('bundleId is placeholder-like');
  }
  if (!config.version.trim()) {
    errors.push('version is required');
  }
  if (!config.buildNumber.trim()) {
    errors.push('buildNumber is required');
  }
  if (!['production', 'preview', 'dev'].includes(config.releaseChannel)) {
    errors.push('releaseChannel is invalid');
  }
  if (!['production', 'preview', 'development'].includes(config.environment)) {
    errors.push('environment is invalid');
  }
  if (
    config.environment === 'production' &&
    config.releaseChannel !== 'production'
  ) {
    errors.push('production environment must use production releaseChannel');
  }

  const hasSupportUrl = Boolean(config.supportUrl?.trim());
  const hasSupportEmail = Boolean(config.supportEmail?.trim());
  if (!hasSupportUrl && !hasSupportEmail) {
    errors.push('supportUrl or supportEmail must be configured');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
