export const THEME = {
  bg: '#0a0a0f',
  surface: '#12121a',
  surfaceAlt: '#1a1a26',
  border: '#2a2a3d',

  purple: '#a78bfa',
  purpleDim: 'rgba(167,139,250,0.15)',
  purpleBorder: 'rgba(167,139,250,0.3)',

  teal: '#5eead4',
  tealDim: 'rgba(94,234,212,0.15)',

  coral: '#fb923c',
  coralDim: 'rgba(251,146,60,0.15)',

  blue: '#60a5fa',
  blueDim: 'rgba(96,165,250,0.15)',

  green: '#86efac',
  greenDim: 'rgba(134,239,172,0.15)',

  pink: '#f472b6',
  pinkDim: 'rgba(244,114,182,0.15)',

  textPrimary: '#f1f5f9',
  textSecondary: '#94a3b8',
  textMuted: '#475569',

  fontSans: "'Inter', 'Segoe UI', system-ui, sans-serif",
  fontMono: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",

  W: 1080,
  H: 1920,

  easing: {
    smooth: [0.4, 0, 0.2, 1] as const,
    spring: { damping: 18, stiffness: 120, mass: 1 },
    springFast: { damping: 20, stiffness: 200, mass: 0.8 },
  },
} as const;

export const ACCENT_COLORS: Record<string, string> = {
  purple: THEME.purple,
  teal: THEME.teal,
  coral: THEME.coral,
  blue: THEME.blue,
  green: THEME.green,
  pink: THEME.pink,
};

export const DIM_COLORS: Record<string, string> = {
  purple: THEME.purpleDim,
  teal: THEME.tealDim,
  coral: THEME.coralDim,
  blue: THEME.blueDim,
  green: THEME.greenDim,
  pink: THEME.pinkDim,
};