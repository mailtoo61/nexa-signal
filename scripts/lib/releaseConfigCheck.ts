import {
  type MobileRuntimeConfig,
  mobileRuntimeConfig,
  validateRuntimeConfig,
} from '../../apps/mobile/src/shared/config/runtimeConfig';
import expoConfig from '../../apps/mobile/app.config';
import fs from 'node:fs';
import path from 'node:path';

export interface ReleaseConfigCheckResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateReleaseConfigReadiness(
  config: MobileRuntimeConfig = mobileRuntimeConfig,
): ReleaseConfigCheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];
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

  const appScheme = expoConfig.scheme;
  if (!appScheme || String(appScheme).trim().length === 0) {
    warnings.push('expo.scheme is missing (beta readiness)');
  }

  const iosBundleId = expoConfig.ios?.bundleIdentifier;
  if (!iosBundleId || /yourcompany|example|placeholder/i.test(iosBundleId)) {
    errors.push('expo.ios.bundleIdentifier is placeholder-like or missing');
  }

  const androidPackage = expoConfig.android?.package;
  if (
    !androidPackage ||
    /yourcompany|example|placeholder/i.test(androidPackage)
  ) {
    warnings.push('expo.android.package is missing or placeholder-like');
  }

  const iconPath = expoConfig.icon;
  if (!iconPath) {
    warnings.push('expo.icon is missing (beta readiness)');
  } else {
    const resolvedIconPath = path.resolve('apps/mobile', iconPath);
    if (!fs.existsSync(resolvedIconPath)) {
      errors.push(`expo.icon path does not exist: ${iconPath}`);
    }
  }

  const splashImagePath = expoConfig.splash?.image;
  if (!splashImagePath) {
    warnings.push('expo.splash.image is missing (beta readiness)');
  } else {
    const resolvedSplashPath = path.resolve('apps/mobile', splashImagePath);
    if (!fs.existsSync(resolvedSplashPath)) {
      errors.push(`expo.splash.image path does not exist: ${splashImagePath}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
