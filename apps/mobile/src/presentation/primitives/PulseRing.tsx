import React from 'react';
import { Circle } from '@shopify/react-native-skia';

interface PulseRingProps {
  x: number;
  y: number;
  radius: number;
  color: string;
  opacity: number;
}

export function PulseRing({ x, y, radius, color, opacity }: PulseRingProps) {
  return (
    <Circle
      cx={x}
      cy={y}
      r={radius}
      color={color}
      style="stroke"
      strokeWidth={1.5}
      opacity={opacity}
    />
  );
}
