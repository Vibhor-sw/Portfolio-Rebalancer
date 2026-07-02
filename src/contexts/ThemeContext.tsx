import * as React from "react";

export type ThemeName = "light" | "dark" | "blue";

interface ThemeContextValue {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "portfolioRebalancer.theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<ThemeName>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored as ThemeName) || "light";
  });

  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "theme-blue");
    if (theme === "dark") root.classList.add("dark");
    if (theme === "blue") root.classList.add("theme-blue");
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = React.useCallback((t: ThemeName) => setThemeState(t), []);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
