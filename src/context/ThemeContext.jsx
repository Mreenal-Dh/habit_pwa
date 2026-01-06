import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext({
  theme: "light",
  isDark: false,
  toggleTheme: () => {},
  setTheme: () => {},
  source: "system",
});

const STORAGE_KEY = "theme-preference";
const allowedThemes = new Set(["light", "dark"]);

const getSystemTheme = () => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

function getInitialTheme() {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && allowedThemes.has(stored)) return stored;
  return getSystemTheme();
}

function getInitialSource() {
  if (typeof window === "undefined") return "system";
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored && allowedThemes.has(stored) ? "user" : "system";
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme);
  const [source, setSource] = useState(getInitialSource);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    root.style.colorScheme = theme === "dark" ? "dark" : "light";
  }, [theme]);

  useEffect(() => {
    if (source !== "system" || typeof window === "undefined") return undefined;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event) => {
      setThemeState(event.matches ? "dark" : "light");
    };

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [source]);

  const setExplicitTheme = (value) => {
    if (!allowedThemes.has(value)) return;
    setThemeState(value);
    setSource("user");
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, value);
    }
  };

  const toggleTheme = () => {
    setExplicitTheme(theme === "dark" ? "light" : "dark");
  };

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === "dark",
      toggleTheme,
      setTheme: setExplicitTheme,
      source,
    }),
    [theme, source]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
