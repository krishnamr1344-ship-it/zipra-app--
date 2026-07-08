import React from "react";
import { colors, spacing, radius, fontSize, shadow, layout, palette } from "./tokens";

type ThemeMode = "light" | "dark";

interface ThemeContextValue {
  mode: ThemeMode;
  toggle: () => void;
  setMode: (m: ThemeMode) => void;
}

const ThemeContext = React.createContext<ThemeContextValue>({
  mode: "light",
  toggle: () => {},
  setMode: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = React.useState<ThemeMode>("light");
  const toggle = React.useCallback(
    () => setMode((m) => (m === "light" ? "dark" : "light")),
    []
  );
  return (
    <ThemeContext.Provider value={{ mode, toggle, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeMode = () => React.useContext(ThemeContext);

/** Resolved theme tokens for components. */
export function useAppTheme() {
  const { mode } = useThemeMode();
  const c = colors[mode];
  const s = shadow[mode];
  return {
    mode,
    color: c,
    spacing,
    radius,
    fontSize,
    shadow: s,
    layout,
    palette,
    isDark: mode === "dark",
  };
}
