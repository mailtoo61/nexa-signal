export type ThemeId =
  | 'defaultSignal'
  | 'aurora'
  | 'obsidian'
  | 'solar'
  | 'sakura'
  | 'oceanPulse';

export interface ThemeTokens {
  id: ThemeId;
  colors: {
    bgTop: string;
    bgBottom: string;
    core: string;
    link: string;
    linkWeak: string;
    node: string;
    textPrimary: string;
    textSecondary: string;
    danger: string;
  };
  glow: {
    soft: number;
    medium: number;
    strong: number;
  };
  opacity: {
    haze: number;
    panel: number;
    overlay: number;
  };
}

export const themes: Record<ThemeId, ThemeTokens> = {
  defaultSignal: {
    id: 'defaultSignal',
    colors: {
      bgTop: '#060B1B',
      bgBottom: '#1A1030',
      core: '#6EF2FF',
      link: '#7DA6FF',
      linkWeak: '#455A8C',
      node: '#9BE9FF',
      textPrimary: '#E8EEFF',
      textSecondary: '#9CACD8',
      danger: '#FF6B8B',
    },
    glow: { soft: 4, medium: 9, strong: 18 },
    opacity: { haze: 0.26, panel: 0.55, overlay: 0.7 },
  },
  aurora: {
    id: 'aurora',
    colors: {
      bgTop: '#08171D',
      bgBottom: '#1A1242',
      core: '#86F7FF',
      link: '#7EFFC7',
      linkWeak: '#3F6E6A',
      node: '#B0FFF0',
      textPrimary: '#E8F7FF',
      textSecondary: '#9DC5D1',
      danger: '#FF7AA5',
    },
    glow: { soft: 4, medium: 9, strong: 18 },
    opacity: { haze: 0.26, panel: 0.55, overlay: 0.7 },
  },
  obsidian: {
    id: 'obsidian',
    colors: {
      bgTop: '#080808',
      bgBottom: '#121426',
      core: '#89B5FF',
      link: '#8FA6D9',
      linkWeak: '#3D4258',
      node: '#CAD8FF',
      textPrimary: '#F0F3FF',
      textSecondary: '#A9AFCC',
      danger: '#FF7D9D',
    },
    glow: { soft: 3, medium: 8, strong: 15 },
    opacity: { haze: 0.2, panel: 0.62, overlay: 0.76 },
  },
  solar: {
    id: 'solar',
    colors: {
      bgTop: '#18120A',
      bgBottom: '#2A1C18',
      core: '#FFD46E',
      link: '#FFB67D',
      linkWeak: '#7C5C3A',
      node: '#FFE3A4',
      textPrimary: '#FFF4DB',
      textSecondary: '#D1B994',
      danger: '#FF7A6E',
    },
    glow: { soft: 4, medium: 10, strong: 19 },
    opacity: { haze: 0.24, panel: 0.58, overlay: 0.72 },
  },
  sakura: {
    id: 'sakura',
    colors: {
      bgTop: '#1A1019',
      bgBottom: '#2A1628',
      core: '#FF9CE6',
      link: '#F5A7FF',
      linkWeak: '#74517A',
      node: '#FFC8F3',
      textPrimary: '#FDEEFF',
      textSecondary: '#D7A9D6',
      danger: '#FF7A9B',
    },
    glow: { soft: 4, medium: 9, strong: 17 },
    opacity: { haze: 0.22, panel: 0.56, overlay: 0.72 },
  },
  oceanPulse: {
    id: 'oceanPulse',
    colors: {
      bgTop: '#07151F',
      bgBottom: '#10293A',
      core: '#63E5FF',
      link: '#60C5FF',
      linkWeak: '#355A74',
      node: '#A4EFFF',
      textPrimary: '#E6F7FF',
      textSecondary: '#95BFD1',
      danger: '#FF718D',
    },
    glow: { soft: 4, medium: 10, strong: 20 },
    opacity: { haze: 0.23, panel: 0.56, overlay: 0.72 },
  },
};

export function getTheme(themeId: ThemeId): ThemeTokens {
  return themes[themeId];
}
