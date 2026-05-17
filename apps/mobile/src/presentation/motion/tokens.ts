export const motionTokens = {
  duration: {
    micro: 120,
    quick: 220,
    medium: 420,
    ambient: 1600,
    long: 2600,
  },
  easing: {
    standard: [0.2, 0.0, 0.0, 1.0] as const,
    smoothInOut: [0.42, 0.0, 0.58, 1.0] as const,
    calmOut: [0.14, 1.0, 0.34, 1.0] as const,
  },
  pulse: {
    baseScale: 1,
    peakScale: 1.08,
    glowMin: 0.45,
    glowMax: 1,
  },
  particles: {
    ambientMax: 26,
    reducedMax: 10,
  },
};
