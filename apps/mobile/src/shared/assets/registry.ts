import type { ImageSourcePropType } from 'react-native';

export type SignalAssetKey =
  | 'signalHeroCore'
  | 'signalRingGlow'
  | 'signalEnergyShell'
  | 'signalNoiseOverlay'
  | 'signalParticleSoft'
  | 'signalGlassHighlight'
  | 'signalNodeGlow'
  | 'iconDailySignal'
  | 'iconZenFlow'
  | 'iconArchive';

interface SignalAssetEntry {
  moduleId: number | null;
  expectedPath: string;
}

type SignalAssetRegistry = Record<SignalAssetKey, SignalAssetEntry>;

const signalAssets: SignalAssetRegistry = {
  signalHeroCore: {
    moduleId: require('../../../assets/signal/hero/signal_hero_core_512x512.png'),
    expectedPath: 'apps/mobile/assets/signal/hero/signal_hero_core_512x512.png',
  },
  signalRingGlow: {
    moduleId: require('../../../assets/signal/hero/signal_ring_glow_512x512.png'),
    expectedPath: 'apps/mobile/assets/signal/hero/signal_ring_glow_512x512.png',
  },
  signalEnergyShell: {
    moduleId: require('../../../assets/signal/hero/signal_energy_shell_512x512.png'),
    expectedPath:
      'apps/mobile/assets/signal/hero/signal_energy_shell_512x512.png',
  },
  signalNoiseOverlay: {
    moduleId: null,
    expectedPath: 'apps/mobile/assets/signal/fx/signal_noise_overlay_1024.png',
  },
  signalParticleSoft: {
    moduleId: null,
    expectedPath: 'apps/mobile/assets/signal/fx/signal_particle_soft_128.png',
  },
  signalGlassHighlight: {
    moduleId: null,
    expectedPath:
      'apps/mobile/assets/signal/fx/signal_glass_highlight_512x128.png',
  },
  signalNodeGlow: {
    moduleId: require('../../../assets/signal/fx/signal_node_glow_256x256.png'),
    expectedPath: 'apps/mobile/assets/signal/fx/signal_node_glow_256x256.png',
  },
  iconDailySignal: {
    moduleId: null,
    expectedPath: 'apps/mobile/assets/signal/icons/signal_icon_daily_256.png',
  },
  iconZenFlow: {
    moduleId: null,
    expectedPath: 'apps/mobile/assets/signal/icons/signal_icon_zen_256.png',
  },
  iconArchive: {
    moduleId: null,
    expectedPath: 'apps/mobile/assets/signal/icons/signal_icon_archive_256.png',
  },
};

export const assets = {
  signal: signalAssets,
};

export function getSignalAssetSource(
  key: SignalAssetKey,
): ImageSourcePropType | undefined {
  const moduleId = signalAssets[key].moduleId;
  return moduleId === null ? undefined : moduleId;
}

export function getSignalAssetExpectedPath(key: SignalAssetKey): string {
  return signalAssets[key].expectedPath;
}
