import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { useAppSettingsStore } from '../state/appSettingsStore';

export default function RootLayout(): React.JSX.Element {
  const hydrateSettings = useAppSettingsStore((state) => state.hydrate);

  useEffect(() => {
    void hydrateSettings();
  }, [hydrateSettings]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
