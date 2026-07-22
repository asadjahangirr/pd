import { createContext, useContext, useEffect, useLayoutEffect, useState } from "react";
import { fetchTheme, saveTheme } from "../api/theme.js";
import { generateScale } from "../lib/color.js";
import { useAutoRefresh } from "../lib/useAutoRefresh.js";

/* Applies the admin's chosen colours site-wide by overriding the CSS
   variables the whole UI reads from. Empty = the built-in default palette. */

const CACHE = "delight_theme";
const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

function applyTheme(primary, accent) {
  const root = document.documentElement;
  if (primary) {
    const scale = generateScale(primary);
    STEPS.forEach((k) => root.style.setProperty(`--color-brand-${k}`, scale[k]));
  } else {
    STEPS.forEach((k) => root.style.removeProperty(`--color-brand-${k}`));
  }
  if (accent) root.style.setProperty("--color-accent", accent);
  else root.style.removeProperty("--color-accent");
}

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE)) || { primary: "", accent: "" };
  } catch {
    return { primary: "", accent: "" };
  }
}
function writeCache(t) {
  try {
    localStorage.setItem(CACHE, JSON.stringify(t));
  } catch {
    /* ignore */
  }
}

const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readCache);

  // Apply the cached theme before first paint (no colour flash).
  useLayoutEffect(() => {
    applyTheme(theme.primary, theme.accent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pull = () =>
    fetchTheme()
      .then((t) => {
        setThemeState(t);
        applyTheme(t.primary, t.accent);
        writeCache(t);
      })
      .catch(() => {});

  // Load on mount, then keep in sync on tab focus (no polling, to avoid
  // fighting the admin's live preview on the Appearance page).
  useEffect(() => {
    pull();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useAutoRefresh(pull, 0);

  // Live preview (not saved) — used by the admin appearance page.
  const preview = (primary, accent) => applyTheme(primary, accent);
  // Re-apply the saved theme (e.g. when leaving preview without saving).
  const applySaved = () => applyTheme(theme.primary, theme.accent);

  const save = async (primary, accent) => {
    const saved = await saveTheme({ primary, accent });
    setThemeState(saved);
    writeCache(saved);
    applyTheme(saved.primary, saved.accent);
    return saved;
  };

  return (
    <ThemeContext.Provider value={{ theme, preview, applySaved, save }}>{children}</ThemeContext.Provider>
  );
}
