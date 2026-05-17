import React from 'react';
import { Group, Rect } from '@shopify/react-native-skia';
import type { ThemeTokens } from '../themes/themes';

interface BackgroundLayerProps {
  width: number;
  height: number;
  theme: ThemeTokens;
}

export function BackgroundLayer({
  width,
  height,
  theme,
}: BackgroundLayerProps) {
  return (
    <Group>
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        color={theme.colors.bgTop}
      />
      <Rect
        x={-width * 0.18}
        y={-height * 0.22}
        width={width * 1.36}
        height={height * 0.34}
        color={theme.colors.link}
        opacity={0.028}
      />
      <Rect
        x={-width * 0.08}
        y={-height * 0.06}
        width={width * 1.16}
        height={height * 0.46}
        color={theme.colors.core}
        opacity={0.04}
      />
      <Rect
        x={0}
        y={height * 0.45}
        width={width}
        height={height * 0.55}
        color={theme.colors.bgBottom}
        opacity={0.88}
      />
      <Rect
        x={-width * 0.12}
        y={height * 0.58}
        width={width * 1.24}
        height={height * 0.5}
        color={theme.colors.link}
        opacity={0.038}
      />
      <Rect
        x={-width * 0.04}
        y={height * 0.18}
        width={width * 1.08}
        height={height * 0.28}
        color={theme.colors.core}
        opacity={0.024}
      />
    </Group>
  );
}
