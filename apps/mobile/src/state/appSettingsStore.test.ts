import { beforeEach, describe, expect, it, vi } from 'vitest';

const { loadSettingsMock, saveSettingsMock } = vi.hoisted(() => ({
  loadSettingsMock: vi.fn(async () => ({
    selectedLanguage: 'en' as const,
    reducedMotionEnabled: false,
    hapticsEnabled: true,
    audioEnabled: true,
  })),
  saveSettingsMock: vi.fn(async () => {}),
}));

vi.mock('../shared/storage/persistence', () => ({
  DEFAULT_GAME_SETTINGS: {
    selectedLanguage: 'en',
    reducedMotionEnabled: false,
    hapticsEnabled: true,
    audioEnabled: true,
  },
  loadSettings: loadSettingsMock,
  saveSettings: saveSettingsMock,
}));

import { useAppSettingsStore } from './appSettingsStore';

describe('app settings store', () => {
  beforeEach(() => {
    useAppSettingsStore.setState({
      selectedLanguage: 'en',
      reducedMotionEnabled: false,
      hapticsEnabled: true,
      audioEnabled: true,
      hydrated: false,
    });
    loadSettingsMock.mockClear();
    saveSettingsMock.mockClear();
  });

  it('hydrates defaults from persistence loader', async () => {
    await useAppSettingsStore.getState().hydrate();
    expect(loadSettingsMock).toHaveBeenCalled();
    expect(useAppSettingsStore.getState().hydrated).toBe(true);
  });

  it('persists selected language changes', async () => {
    await useAppSettingsStore.getState().setSelectedLanguage('tr');
    expect(useAppSettingsStore.getState().selectedLanguage).toBe('tr');
    expect(saveSettingsMock).toHaveBeenCalled();
  });
});
