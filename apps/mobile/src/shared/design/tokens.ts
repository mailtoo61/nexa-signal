import { motionTokens } from '../../presentation/motion/tokens';

export const designTokens = {
  colors: {
    bgPrimary: '#060B1B',
    bgSecondary: '#1A1030',
    cyan: '#6EF2FF',
    neonPurple: '#8D7DFF',
    textPrimary: '#E8EEFF',
    textMuted: '#98A2C9',
  },
  spacing: { xs: 8, sm: 12, md: 16, lg: 24, xl: 32, xxl: 44 },
  radii: { sm: 10, md: 16, lg: 24, round: 999 },
  typography: {
    title: 30,
    subtitle: 18,
    body: 16,
    caption: 13,
  },
  glow: {
    core: 18,
    node: 10,
    button: 12,
  },
  opacity: {
    panel: 0.55,
    overlay: 0.75,
  },
  particles: {
    ambientDensity: motionTokens.particles.ambientMax,
    reducedDensity: motionTokens.particles.reducedMax,
  },
  motion: motionTokens,
};
