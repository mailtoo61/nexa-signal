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
        r={radius + glow + 2}
        color={color}
        opacity={0.07 * alpha}
      />
      <Circle
        cx={x}
        cy={y}
        r={radius + 1.4}
        color="#D8F6FF"
        opacity={0.13 * alpha}
      />
      <Circle cx={x} cy={y} r={radius} color={color} opacity={0.86 * alpha} />
      <Circle
        cx={x}
        cy={y}
        r={Math.max(2, radius * 0.68)}
        color={color}
        opacity={0.24 * alpha}
      />
      <Circle
        cx={x}
        cy={y}
        r={Math.max(2.1, radius * 0.42)}
        color="#E7F6FF"
        opacity={0.34 * alpha}
      />
    </Group>
  );
}
