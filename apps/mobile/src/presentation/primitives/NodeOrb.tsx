import React from 'react';
import { Circle, Group } from '@shopify/react-native-skia';

interface NodeOrbProps {
  x: number;
  y: number;
  radius: number;
  color: string;
  glow: number;
  alpha?: number;
}

export function NodeOrb({
  x,
  y,
  radius,
  color,
  glow,
  alpha = 1,
}: NodeOrbProps) {
  return (
    <Group>
      <Circle
        cx={x}
        cy={y}
        r={radius + glow}
        color={color}
        opacity={0.12 * alpha}
      />
      <Circle cx={x} cy={y} r={radius} color={color} opacity={alpha} />
    </Group>
  );
}
