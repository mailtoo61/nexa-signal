import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockGetItemAsync, mockSetItemAsync, mockDeleteItemAsync } = vi.hoisted(
  () => ({
    mockGetItemAsync: vi.fn<(key: string) => Promise<string | null>>(
      async () => null,
    ),
    mockSetItemAsync: vi.fn<(key: string, value: string) => Promise<void>>(
      async () => {},
    ),
    mockDeleteItemAsync: vi.fn<(key: string) => Promise<void>>(async () => {}),
  }),
);

vi.mock('./keyValueStorage', () => ({
  keyValueStorage: {
    getItem: mockGetItemAsync,
    setItem: mockSetItemAsync,
    deleteItem: mockDeleteItemAsync,
  },
}));

import {
  DEFAULT_GAME_SETTINGS,
  loadSettings,
  resetLocalProgress,
  saveSettings,
} from './persistence';

describe('settings persistence', () => {
  beforeEach(() => {
    mockGetItemAsync.mockReset();
    mockSetItemAsync.mockReset();
    mockDeleteItemAsync.mockReset();
    mockGetItemAsync.mockResolvedValue(null);
    mockSetItemAsync.mockResolvedValue();
    mockDeleteItemAsync.mockResolvedValue();
  });

  it('returns safe defaults when no settings are saved', async () => {
    const loaded = await loadSettings();
    expect(loaded).toEqual(DEFAULT_GAME_SETTINGS);
  });

  it('persists settings with versioned envelope', async () => {
    await saveSettings({
      audioEnabled: false,
      hapticsEnabled: false,
      reducedMotionEnabled: true,
      selectedLanguage: 'tr',
    });

    expect(mockSetItemAsync).toHaveBeenCalledTimes(1);
    const storedPayload = mockSetItemAsync.mock.calls[0]?.[1] ?? '';
    expect(storedPayload).toContain('"version":1');
    expect(storedPayload).toContain('"selectedLanguage":"tr"');
  });

  it('migrates legacy locale/reducedMotion shape safely', async () => {
    mockGetItemAsync.mockResolvedValueOnce(
      JSON.stringify({
        version: 1,
        settings: {
          locale: 'de',
          reducedMotion: true,
          audioEnabled: false,
          hapticsEnabled: true,
        },
      }),
    );

    const loaded = await loadSettings();
    expect(loaded.selectedLanguage).toBe('de');
    expect(loaded.reducedMotionEnabled).toBe(true);
    expect(loaded.audioEnabled).toBe(false);
    expect(loaded.hapticsEnabled).toBe(true);
  });

  it('falls back to english for invalid language values', async () => {
    mockGetItemAsync.mockResolvedValueOnce(
      JSON.stringify({
        version: 1,
        settings: {
          selectedLanguage: 'xx',
          reducedMotionEnabled: false,
          audioEnabled: true,
          hapticsEnabled: true,
        },
      }),
    );

    const loaded = await loadSettings();
    expect(loaded.selectedLanguage).toBe('en');
  });

  it('reset local progress clears intended keys only', async () => {
    await resetLocalProgress({ includeSettings: false });
    const withoutSettings = mockDeleteItemAsync.mock.calls.map(
      (call) => call[0],
    );
    expect(withoutSettings).toContain('nexa.bestScore.v1');
    expect(withoutSettings).toContain('nexa.resumableSessionSnapshot.v1');
    expect(withoutSettings).not.toContain('nexa.settings.v1');

    mockDeleteItemAsync.mockClear();

    await resetLocalProgress({ includeSettings: true });
    const withSettings = mockDeleteItemAsync.mock.calls.map((call) => call[0]);
    expect(withSettings).toContain('nexa.settings.v1');
  });
});
