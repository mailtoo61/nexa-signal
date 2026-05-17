import React, { useEffect, useMemo, useState } from 'react';
import { createAmbientParticles, stepAmbientParticles } from './particleSystem';

export function useAmbientParticles(
  width: number,
  height: number,
  maxCount: number,
  reducedMotion: boolean,
): ReturnType<typeof createAmbientParticles> {
  const count = reducedMotion
    ? Math.max(4, Math.floor(maxCount / 2))
    : maxCount;
  const initial = useMemo(
    () => createAmbientParticles(width, height, count),
    [width, height, count],
  );
  const [particles, setParticles] = useState(initial);

  useEffect(() => {
    setParticles(initial);
  }, [initial]);

  useEffect(() => {
    if (reducedMotion) return;
    const id = setInterval(() => {
      setParticles((prev) => stepAmbientParticles(prev, width, height));
    }, 50);
    return () => clearInterval(id);
  }, [height, reducedMotion, width]);

  return particles;
}
