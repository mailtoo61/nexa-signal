export interface AmbientParticle {
  id: number;
  x: number;
  y: number;
  radius: number;
  alpha: number;
  speed: number;
}

export function createAmbientParticles(
  width: number,
  height: number,
  maxCount: number,
): AmbientParticle[] {
  const particles: AmbientParticle[] = [];
  for (let i = 0; i < maxCount; i += 1) {
    const ratio = (i + 1) / maxCount;
    particles.push({
      id: i,
      x: (width * ratio) % width,
      y: (height * ((ratio * 3) % 1)) % height,
      radius: 1 + ((i % 4) + 1) * 0.6,
      alpha: 0.12 + (i % 5) * 0.03,
      speed: 0.06 + (i % 4) * 0.03,
    });
  }
  return particles;
}

export function stepAmbientParticles(
  prev: AmbientParticle[],
  width: number,
  height: number,
): AmbientParticle[] {
  return prev.map((p, index) => {
    const nx = (p.x + p.speed) % width;
    const ny = (p.y + (index % 2 === 0 ? 0.04 : -0.03) + height) % height;
    return { ...p, x: nx, y: ny };
  });
}
