"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export const themeStorageKeys = {
  theme: "fullstack-templates-theme",
  scheme: "fullstack-templates-scheme",
  font: "fullstack-templates-font",
} as const;

export type ThemeName = "ink" | "sand" | "forest";
export type SchemeName = "light" | "dark" | "system";
export type FontName = "modern" | "editorial" | "friendly";

const defaults = { theme: "ink" as ThemeName, scheme: "system" as SchemeName, font: "modern" as FontName };

const themeInitScript = `(function(){try{
var t=localStorage.getItem("${themeStorageKeys.theme}")||"ink";
var s=localStorage.getItem("${themeStorageKeys.scheme}")||"system";
var f=localStorage.getItem("${themeStorageKeys.font}")||"modern";
var d=s==="system"?(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):s;
var r=document.documentElement;
r.setAttribute("data-theme",["ink","sand","forest"].indexOf(t)>-1?t:"ink");
r.setAttribute("data-scheme",["light","dark","system"].indexOf(s)>-1?s:"system");
r.setAttribute("data-scheme-resolved",d);
r.setAttribute("data-font",["modern","editorial","friendly"].indexOf(f)>-1?f:"modern");
r.style.colorScheme=d;
}catch(e){}})();`;

interface ThemeContextValue {
  theme: ThemeName;
  scheme: SchemeName;
  font: FontName;
  resolvedScheme: "light" | "dark";
  setTheme: (value: ThemeName) => void;
  setScheme: (value: SchemeName) => void;
  setFont: (value: FontName) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStored<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const value = window.localStorage.getItem(key);
  return value && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(defaults.theme);
  const [scheme, setSchemeState] = useState<SchemeName>(defaults.scheme);
  const [font, setFontState] = useState<FontName>(defaults.font);
  const [systemDark, setSystemDark] = useState(false);

  useEffect(() => {
    setThemeState(readStored(themeStorageKeys.theme, ["ink", "sand", "forest"] as const, defaults.theme));
    setSchemeState(readStored(themeStorageKeys.scheme, ["light", "dark", "system"] as const, defaults.scheme));
    setFontState(readStored(themeStorageKeys.font, ["modern", "editorial", "friendly"] as const, defaults.font));
    setSystemDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setSystemDark(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const resolvedScheme = scheme === "system" ? (systemDark ? "dark" : "light") : scheme;

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    root.setAttribute("data-scheme", scheme);
    root.setAttribute("data-scheme-resolved", resolvedScheme);
    root.setAttribute("data-font", font);
    root.style.colorScheme = resolvedScheme;
    window.localStorage.setItem(themeStorageKeys.theme, theme);
    window.localStorage.setItem(themeStorageKeys.scheme, scheme);
    window.localStorage.setItem(themeStorageKeys.font, font);
  }, [theme, scheme, font, resolvedScheme]);

  const setTheme = useCallback((value: ThemeName) => setThemeState(value), []);
  const setScheme = useCallback((value: SchemeName) => setSchemeState(value), []);
  const setFont = useCallback((value: FontName) => setFontState(value), []);

  const value = useMemo(
    () => ({ theme, scheme, font, resolvedScheme, setTheme, setScheme, setFont }),
    [theme, scheme, font, resolvedScheme, setTheme, setScheme, setFont],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme must be used inside ThemeProvider");
  return value;
}

export { themeInitScript };
