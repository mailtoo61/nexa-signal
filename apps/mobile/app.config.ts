import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'NEXA SIGNAL',
  slug: 'nexa-signal',
  orientation: 'portrait',
  web: {
    bundler: 'metro',
  },
  ios: {
    bundleIdentifier: 'com.yourcompany.nexasignal',
    supportsTablet: false,
  },
  plugins: ['expo-router'],
};

export default config;
