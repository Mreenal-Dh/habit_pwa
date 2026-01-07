import { createContext, useContext, useEffect, useState } from "react";

const ColorThemeContext = createContext({
  colorTheme: "green",
  setColorTheme: () => {},
});

const STORAGE_KEY = "color-theme-preference";

// Color theme configurations
const COLOR_THEMES = {
  green: {
    light: {
      accent: "#66bb6a",
      accentStrong: "#4caf50",
      accentSoft: "#e8f5e9",
    },
    dark: {
      accent: "#66bb6a",
      accentStrong: "#4caf50",
      accentSoft: "#1f2f25",
    },
  },
  red: {
    light: {
      accent: "#d32f2f",
      accentStrong: "#c62828",
      accentSoft: "#ffebee",
    },
    dark: {
      accent: "#d32f2f",
      accentStrong: "#c62828",
      accentSoft: "#2f1f1f",
    },
  },
  saffron: {
    light: {
      accent: "#ff9800",
      accentStrong: "#f57c00",
      accentSoft: "#fff3e0",
    },
    dark: {
      accent: "#ff9800",
      accentStrong: "#f57c00",
      accentSoft: "#2f2619",
    },
  },
  blue: {
    light: {
      accent: "#1565c0",
      accentStrong: "#0d47a1",
      accentSoft: "#e3f2fd",
    },
    dark: {
      accent: "#1565c0",
      accentStrong: "#0d47a1",
      accentSoft: "#1a2533",
    },
  },
};

function getInitialColorTheme() {
  if (typeof window === "undefined") return "green";
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored && COLOR_THEMES[stored] ? stored : "green";
}

export function ColorThemeProvider({ children }) {
  const [colorTheme, setColorThemeState] = useState(getInitialColorTheme);

  useEffect(() => {
    const root = document.documentElement;
    const isDark = root.getAttribute("data-theme") === "dark";
    const colors = COLOR_THEMES[colorTheme][isDark ? "dark" : "light"];

    root.style.setProperty("--accent", colors.accent);
    root.style.setProperty("--accent-strong", colors.accentStrong);
    root.style.setProperty("--accent-soft", colors.accentSoft);
  }, [colorTheme]);

  // Listen for theme changes (light/dark) to update accent colors
  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      const isDark = root.getAttribute("data-theme") === "dark";
      const colors = COLOR_THEMES[colorTheme][isDark ? "dark" : "light"];

      root.style.setProperty("--accent", colors.accent);
      root.style.setProperty("--accent-strong", colors.accentStrong);
      root.style.setProperty("--accent-soft", colors.accentSoft);
    });

    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });

    return () => observer.disconnect();
  }, [colorTheme]);

  const setColorTheme = (theme) => {
    if (!COLOR_THEMES[theme]) return;
    setColorThemeState(theme);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, theme);
    }
  };

  return (
    <ColorThemeContext.Provider value={{ colorTheme, setColorTheme }}>
      {children}
    </ColorThemeContext.Provider>
  );
}

export function useColorTheme() {
  return useContext(ColorThemeContext);
}
