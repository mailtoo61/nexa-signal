import { create } from 'zustand';
import type { Locale } from '@nexa/types';
import {
  DEFAULT_GAME_SETTINGS,
  loadSettings,
  saveSettings,
  type ResetLocalProgressOptions,
} from '../shared/storage/persistence';

interface AppSettingsState {
  audioEnabled: boolean;
  hapticsEnabled: boolean;
  reducedMotionEnabled: boolean;
  selectedLanguage: Locale;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setAudioEnabled: (value: boolean) => Promise<void>;
  setHapticsEnabled: (value: boolean) => Promise<void>;
  setReducedMotionEnabled: (value: boolean) => Promise<void>;
  setSelectedLanguage: (value: Locale) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  applyPostReset: (options: ResetLocalProgressOptions) => Promise<void>;
}

async function persistState(
  state: Pick<
    AppSettingsState,
    | 'audioEnabled'
    | 'hapticsEnabled'
    | 'reducedMotionEnabled'
    | 'selectedLanguage'
  >,
): Promise<void> {
  await saveSettings({
    audioEnabled: state.audioEnabled,
    hapticsEnabled: state.hapticsEnabled,
    reducedMotionEnabled: state.reducedMotionEnabled,
    selectedLanguage: state.selectedLanguage,
  });
}

export const useAppSettingsStore = create<AppSettingsState>((set, get) => ({
  audioEnabled: DEFAULT_GAME_SETTINGS.audioEnabled,
  hapticsEnabled: DEFAULT_GAME_SETTINGS.hapticsEnabled,
  reducedMotionEnabled: DEFAULT_GAME_SETTINGS.reducedMotionEnabled,
  selectedLanguage: DEFAULT_GAME_SETTINGS.selectedLanguage,
  hydrated: false,

  hydrate: async () => {
    const loaded = await loadSettings();
    set({
      audioEnabled: loaded.audioEnabled,
      hapticsEnabled: loaded.hapticsEnabled,
      reducedMotionEnabled: loaded.reducedMotionEnabled,
      selectedLanguage: loaded.selectedLanguage,
      hydrated: true,
    });
  },

  setAudioEnabled: async (value) => {
    set({ audioEnabled: value });
    await persistState(get());
  },

  setHapticsEnabled: async (value) => {
    set({ hapticsEnabled: value });
    await persistState(get());
  },

  setReducedMotionEnabled: async (value) => {
    set({ reducedMotionEnabled: value });
    await persistState(get());
  },

  setSelectedLanguage: async (value) => {
    set({ selectedLanguage: value });
    await persistState(get());
  },

  resetToDefaults: async () => {
    set({
      audioEnabled: DEFAULT_GAME_SETTINGS.audioEnabled,
      hapticsEnabled: DEFAULT_GAME_SETTINGS.hapticsEnabled,
      reducedMotionEnabled: DEFAULT_GAME_SETTINGS.reducedMotionEnabled,
      selectedLanguage: DEFAULT_GAME_SETTINGS.selectedLanguage,
    });
    await persistState(get());
  },

  applyPostReset: async (options) => {
    if (!options.includeSettings) return;
    await get().resetToDefaults();
  },
}));
