import { describe, expect, it } from 'vitest';
import {
  DEFAULT_MOBILE_RUNTIME_CONFIG,
  validateRuntimeConfig,
} from './runtimeConfig';

describe('runtime config', () => {
  it('has required default shape', () => {
    expect(DEFAULT_MOBILE_RUNTIME_CONFIG.appName.length).toBeGreaterThan(0);
    expect(DEFAULT_MOBILE_RUNTIME_CONFIG.appSlug.length).toBeGreaterThan(0);
    expect(DEFAULT_MOBILE_RUNTIME_CONFIG.version.length).toBeGreaterThan(0);
    expect(DEFAULT_MOBILE_RUNTIME_CONFIG.releaseChannel).toBeDefined();
    expect(DEFAULT_MOBILE_RUNTIME_CONFIG.environment).toBeDefined();
  });

  it('fails production validation on placeholder bundle id', () => {
    const result = validateRuntimeConfig({
      ...DEFAULT_MOBILE_RUNTIME_CONFIG,
      bundleId: 'com.yourcompany.nexasignal',
      environment: 'production',
      releaseChannel: 'production',
      privacyPolicyUrl: 'https://example.com/privacy',
      termsUrl: 'https://example.com/terms',
      supportUrl: 'https://example.com/support',
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.includes('bundleId'))).toBe(
      true,
    );
  });

  it('fails production validation on missing legal urls', () => {
    const result = validateRuntimeConfig({
      ...DEFAULT_MOBILE_RUNTIME_CONFIG,
      environment: 'production',
      releaseChannel: 'production',
      bundleId: 'com.nexa.signal',
      privacyPolicyUrl: null,
      termsUrl: null,
      supportUrl: null,
      supportEmail: null,
    });

    expect(result.valid).toBe(false);
    expect(
      result.errors.some((error) => error.includes('privacyPolicyUrl')),
    ).toBe(true);
    expect(result.errors.some((error) => error.includes('termsUrl'))).toBe(
      true,
    );
    expect(result.errors.some((error) => error.includes('supportUrl'))).toBe(
      true,
    );
  });
});
