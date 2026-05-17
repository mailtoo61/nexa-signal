import React from 'react';
import { Circle, Group, Rect } from '@shopify/react-native-skia';
import type { ThemeTokens } from '../themes/themes';

interface BackgroundLayerProps {
  width: number;
  height: number;
  theme: ThemeTokens;
  ambientPhase?: number;
  reducedMotion?: boolean;
}

export function BackgroundLayer({
  width,
  height,
  theme,
  ambientPhase = 0.45,
  reducedMotion = false,
}: BackgroundLayerProps) {
  const drift = reducedMotion ? 0.5 : ambientPhase;
  const hazeOffset = (drift - 0.5) * width * 0.08;
  const hazeYOffset = (0.5 - drift) * height * 0.06;

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
      <Circle
        cx={width * 0.34 + hazeOffset}
        cy={height * 0.3 + hazeYOffset}
        r={Math.min(width, height) * 0.33}
        color={theme.colors.core}
        opacity={reducedMotion ? 0.018 : 0.026}
      />
      <Circle
        cx={width * 0.72 - hazeOffset}
        cy={height * 0.62 - hazeYOffset}
        r={Math.min(width, height) * 0.38}
        color={theme.colors.link}
        opacity={reducedMotion ? 0.012 : 0.019}
      />
      <Rect
        x={-width * 0.24 + hazeOffset * 0.9}
        y={height * 0.5 + hazeYOffset * 0.7}
        width={width * 1.48}
        height={height * 0.24}
        color={theme.colors.core}
        opacity={reducedMotion ? 0.008 : 0.014}
      />
      <Rect
        x={-width * 0.18 - hazeOffset * 0.5}
        y={height * 0.08 - hazeYOffset * 0.7}
        width={width * 1.4}
        height={height * 0.18}
        color={theme.colors.link}
        opacity={reducedMotion ? 0.006 : 0.011}
      />
    </Group>
  );
}
