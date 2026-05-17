import React from 'react';
import { Circle, Group } from '@shopify/react-native-skia';
import type { AmbientParticle } from '../particles/particleSystem';

interface ParticleLayerProps {
  particles: AmbientParticle[];
  color: string;
}

export function ParticleLayer({ particles, color }: ParticleLayerProps) {
  return (
    <Group>
      {particles.map((particle) => (
        <Circle
          key={particle.id}
          cx={particle.x}
          cy={particle.y}
          r={particle.radius}
          color={color}
          opacity={particle.alpha}
        />
      ))}
    </Group>
  );
}
