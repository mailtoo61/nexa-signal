import { describe, expect, it } from 'vitest';
import {
  formatSettingsMetadata,
  unavailableLinkReason,
} from './settingsRuntime';
import {
  DEFAULT_MOBILE_RUNTIME_CONFIG,
  validateRuntimeConfig,
} from '../../shared/config/runtimeConfig';

describe('settings runtime helpers', () => {
  it('formats metadata lines from runtime config', () => {
    const lines = formatSettingsMetadata('en', {
      ...DEFAULT_MOBILE_RUNTIME_CONFIG,
      version: '1.2.3',
      buildNumber: '45',
      releaseChannel: 'preview',
      environment: 'preview',
      supportEmail: 'support@nexa.app',
    });

    expect(
      lines.some((line) => line.label === 'Version' && line.value === '1.2.3'),
    ).toBe(true);
    expect(
      lines.some((line) => line.label === 'Build' && line.value === '45'),
    ).toBe(true);
    expect(
      lines.some(
        (line) => line.label === 'Channel' && line.value === 'preview',
      ),
    ).toBe(true);
  });

  it('uses release configuration warning copy for unavailable links', () => {
    const invalid = validateRuntimeConfig({
      ...DEFAULT_MOBILE_RUNTIME_CONFIG,
      environment: 'production',
      releaseChannel: 'production',
      bundleId: 'com.nexa.signal',
      privacyPolicyUrl: null,
      termsUrl: null,
      supportUrl: null,
    });

    expect(unavailableLinkReason('en', invalid)).toBe(
      'Configure this link before release.',
    );
  });
});
