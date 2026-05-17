/* global require */
import React from 'react';
import { ExpoRoot } from 'expo-router';

export function App(): React.JSX.Element {
  const ctx = require.context('./src/app');
  return React.createElement(ExpoRoot, { context: ctx });
}
