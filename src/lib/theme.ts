// Theme manager — light/dark with localStorage persistence,
// system-preference default, and a GSAP-driven flash transition.

export type Theme = "light" | "dark";

const STORAGE_KEY = "ayesha.theme";
export const THEME_EVENT = "themechange";

export function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === "light" || v === "dark" ? v : null;
}

export function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function getInitialTheme(): Theme {
  return getStoredTheme() ?? getSystemTheme();
}

export function getCurrentTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return (document.documentElement.getAttribute("data-theme") as Theme) || "light";
}

export function applyTheme(theme: Theme, persist = true) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
  if (persist) {
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
  }
  window.dispatchEvent(new CustomEvent<Theme>(THEME_EVENT, { detail: theme }));
}

// Inline script body that runs in <head> before first paint to
// set the data-theme attribute and avoid a flash of wrong theme.
export const PREPAINT_SCRIPT = `
(function(){
  try {
    var k = "${STORAGE_KEY}";
    var stored = localStorage.getItem(k);
    var theme = (stored === "light" || stored === "dark")
      ? stored
      : (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "dark") document.documentElement.classList.add("dark");
    document.documentElement.style.colorScheme = theme;
  } catch (e) {}
})();
`;

export function readCssVar(name: string): string {
  if (typeof document === "undefined") return "";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
