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
        x={0}
        y={height * 0.45}
        width={width}
        height={height * 0.55}
        color={theme.colors.bgBottom}
        opacity={0.9}
      />
    </Group>
  );
}
