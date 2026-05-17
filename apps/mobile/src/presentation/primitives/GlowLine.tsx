import React from 'react';
import { Line } from '@shopify/react-native-skia';

interface GlowLineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  weak?: boolean;
  broken?: boolean;
  critical?: boolean;
  highlight?: boolean;
}

export function GlowLine({
  x1,
  y1,
  x2,
  y2,
  color,
  weak,
  broken,
  critical,
  highlight = false,
}: GlowLineProps) {
  if (broken) {
    return (
      <>
        <Line
          p1={{ x: x1, y: y1 }}
          p2={{ x: (x1 + x2) / 2 - 6, y: (y1 + y2) / 2 - 6 }}
          color={color}
          strokeWidth={highlight ? 1.6 : 1}
          opacity={highlight ? 0.42 : 0.16}
        />
        <Line
          p1={{ x: (x1 + x2) / 2 + 6, y: (y1 + y2) / 2 + 6 }}
          p2={{ x: x2, y: y2 }}
          color={color}
          strokeWidth={highlight ? 1.6 : 1}
          opacity={highlight ? 0.42 : 0.16}
        />
      </>
    );
  }

  if (weak) {
    return (
      <>
        <Line
          p1={{ x: x1, y: y1 }}
          p2={{ x: (x1 + x2) / 2, y: (y1 + y2) / 2 }}
          color={color}
          strokeWidth={highlight ? 2 : 1.3}
          opacity={highlight ? 0.58 : 0.34}
        />
        <Line
          p1={{ x: (x1 + x2) / 2 + 3, y: (y1 + y2) / 2 + 3 }}
          p2={{ x: x2, y: y2 }}
          color={color}
          strokeWidth={highlight ? 2 : 1.3}
          opacity={highlight ? 0.58 : 0.34}
        />
      </>
    );
  }

  return (
    <>
      {critical ? (
        <Line
          p1={{ x: x1, y: y1 }}
          p2={{ x: x2, y: y2 }}
          color={color}
          strokeWidth={3.6}
          opacity={0.18}
        />
      ) : null}
      <Line
        p1={{ x: x1, y: y1 }}
        p2={{ x: x2, y: y2 }}
        color={color}
        strokeWidth={highlight ? 2.4 : 1.9}
        opacity={highlight ? 0.88 : 0.68}
      />
    </>
  );
}
