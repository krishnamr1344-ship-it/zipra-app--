"use client";

import * as React from "react";

const ThemeContext = React.createContext({
  theme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = React.useState("light");

  React.useEffect(() => {
    const stored = localStorage.getItem("zipra-theme");
    if (stored) setThemeState(stored);
    else if (window.matchMedia("(prefers-color-scheme: dark)").matches)
      setThemeState("dark");
  }, []);

  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("zipra-theme", theme);
  }, [theme]);

  const setTheme = React.useCallback((t) => setThemeState(t), []);
  const toggleTheme = React.useCallback(
    () => setThemeState((p) => (p === "dark" ? "light" : "dark")),
    []
  );

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => React.useContext(ThemeContext);
