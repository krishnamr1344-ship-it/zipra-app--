/**
 * Zipra Design System — central tokens.
 * Single source of truth for colors, spacing, radius, shadows.
 * Orange primary (#FF7A00), 8px spacing grid, 16–24px corners.
 */

export const palette = {
  brand: {
    50: "#FFF4E8",
    100: "#FFE6CC",
    200: "#FFCB99",
    300: "#FFB066",
    400: "#FF9633",
    500: "#FF7A00", // primary
    600: "#E66E00",
    700: "#BF5B00",
    800: "#994900",
    900: "#733700",
    gradient: ["#FF9A3D", "#FF7A00"],
  },
  accent: {
    green: "#1FB574",
    red: "#E5484D",
    yellow: "#FFB020",
  },
  neutral: {
    50: "#FAFAFA",
    100: "#F4F4F5",
    200: "#E8E8EA",
    300: "#D9D9DD",
    400: "#A1A1A8",
    500: "#71717A",
    600: "#52525B",
    700: "#3F3F46",
    800: "#27272A",
    900: "#18181B",
  },
} as const;

export const colors = {
  light: {
    background: "#FFFFFF",
    surface: "#FFFFFF",
    surfaceAlt: "#F7F7F8",
    card: "#FFFFFF",
    text: "#18181B",
    textSecondary: "#71717A",
    textTertiary: "#A1A1A8",
    border: "#ECECEE",
    primary: palette.brand[500],
    primaryText: "#FFFFFF",
    success: palette.accent.green,
    danger: palette.accent.red,
    warning: palette.accent.yellow,
    overlay: "rgba(24,24,27,0.45)",
  },
  dark: {
    background: "#0E0E10",
    surface: "#161618",
    surfaceAlt: "#1C1C1F",
    card: "#1A1A1D",
    text: "#F4F4F5",
    textSecondary: "#A1A1A8",
    textTertiary: "#71717A",
    border: "#2A2A2E",
    primary: palette.brand[500],
    primaryText: "#FFFFFF",
    success: palette.accent.green,
    danger: palette.accent.red,
    warning: palette.accent.yellow,
    overlay: "rgba(0,0,0,0.6)",
  },
} as const;

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 32,
  8: 40,
  9: 48,
  10: 64,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  full: 999,
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 22,
  "2xl": 26,
  "3xl": 32,
} as const;

export const shadow = {
  light: {
    sm: "0px 1px 2px rgba(24,24,27,0.06), 0px 1px 3px rgba(24,24,27,0.05)",
    md: "0px 4px 16px rgba(24,24,27,0.08)",
    lg: "0px 12px 32px rgba(24,24,27,0.12)",
    brand: "0px 8px 24px rgba(255,122,0,0.28)",
  },
  dark: {
    sm: "0px 1px 2px rgba(0,0,0,0.4)",
    md: "0px 4px 16px rgba(0,0,0,0.5)",
    lg: "0px 12px 32px rgba(0,0,0,0.6)",
    brand: "0px 8px 24px rgba(255,122,0,0.35)",
  },
} as const;

export const layout = {
  maxWidth: 480,
  bottomTabHeight: 60,
  headerHeight: 56,
};
