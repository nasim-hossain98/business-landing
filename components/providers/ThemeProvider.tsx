"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
} from "react";

type Theme = "light" | "dark";

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
}>({
  theme: "light",
  toggleTheme: () => {},
});

/**
 * ThemeProvider — manages dark/light mode toggle.
 * Stores preference in localStorage and sets data-theme attribute on <html>.
 *
 * The theme value lives in a tiny external store consumed via
 * useSyncExternalStore, which is SSR/hydration-safe: the server renders the
 * default ("light"), the client hydrates with the stored/system theme without
 * any setState-inside-effect (React reconciles the two snapshots itself), and
 * toggles only ever flow through event callbacks or store subscriptions.
 */

const listeners = new Set<() => void>();
let cachedTheme: Theme | null = null;

function readTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getSnapshot(): Theme {
  if (cachedTheme === null) cachedTheme = readTheme();
  return cachedTheme;
}

function getServerSnapshot(): Theme {
  return "light";
}

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Follow OS-level changes while the user has no explicit choice stored.
  const onPossibleChange = () => {
    if (!localStorage.getItem("theme")) {
      cachedTheme = null; // force a re-read on the next getSnapshot
      emit();
    }
  };
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", onPossibleChange);
  window.addEventListener("storage", onPossibleChange);
  return () => {
    listeners.delete(listener);
    media.removeEventListener("change", onPossibleChange);
    window.removeEventListener("storage", onPossibleChange);
  };
}

function writeTheme(next: Theme) {
  localStorage.setItem("theme", next);
  cachedTheme = next;
  emit();
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Reflect the theme onto <html> for CSS. This syncs an external system
  // (a DOM attribute), not React state, so it is effect-safe by design.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    writeTheme(getSnapshot() === "light" ? "dark" : "light");
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
