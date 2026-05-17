import { describe, expect, it } from 'vitest';
import { DEFAULT_MOBILE_RUNTIME_CONFIG } from '../../apps/mobile/src/shared/config/runtimeConfig';
import { validateReleaseConfigReadiness } from './releaseConfigCheck';

describe('validateReleaseConfigReadiness', () => {
  it('fails when runtime config is not release-ready', () => {
    const result = validateReleaseConfigReadiness({
      ...DEFAULT_MOBILE_RUNTIME_CONFIG,
      bundleId: 'com.yourcompany.nexasignal',
      privacyPolicyUrl: null,
      termsUrl: null,
      supportUrl: null,
      supportEmail: null,
      environment: 'production',
      releaseChannel: 'production',
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((item) => item.includes('bundleId'))).toBe(true);
  });
});
