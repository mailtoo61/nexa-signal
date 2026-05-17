import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'NEXA SIGNAL',
  slug: 'nexa-signal',
  scheme: 'nexa-signal',
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/signal/hero/signal_hero_core_512x512.png',
  splash: {
    image: './assets/signal/hero/signal_hero_core_512x512.png',
    resizeMode: 'contain',
    backgroundColor: '#020817',
  },
  web: {
    bundler: 'metro',
  },
  ios: {
    bundleIdentifier: 'app.nexasignal.ios',
    buildNumber: '1',
    supportsTablet: false,
  },
  android: {
    package: 'app.nexasignal.android',
    versionCode: 1,
  },
  plugins: ['expo-router'],
};

export default config;
