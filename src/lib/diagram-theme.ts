/**
 * Whiteboard & Cheatsheet WebP Diagram Theme State Manager
 * Automatically follows the active site theme (dark, light, grey, e-ink)
 * while supporting optional per-view Dark Blueprint / Light Canvas overrides.
 */

import { useState, useEffect, useCallback } from "react";

export type DiagramTheme = "dark" | "light";
export type DiagramThemeOverride = "auto" | DiagramTheme;
export type SiteTheme = "dark" | "light" | "grey" | "e-ink";

const STORAGE_KEY = "fabric-prep-diagram-theme";
const SITE_THEME_STORAGE_KEY = "theme";

export function detectSiteTheme(): SiteTheme {
  if (typeof window === "undefined") return "dark";

  const root = document.documentElement;
  if (root.classList.contains("e-ink")) return "e-ink";
  if (root.classList.contains("light")) return "light";
  if (root.classList.contains("grey")) return "grey";
  if (root.classList.contains("dark")) return "dark";

  try {
    const saved = localStorage.getItem(SITE_THEME_STORAGE_KEY);
    if (saved === "light" || saved === "dark" || saved === "grey" || saved === "e-ink") {
      return saved;
    }
  } catch {
    // ignore storage errors
  }

  if (typeof window.matchMedia === "function" && window.matchMedia("(prefers-color-scheme: light)").matches) {
    return "light";
  }

  return "dark";
}

export function siteThemeToDiagramTheme(siteTheme: SiteTheme | string | undefined | null): DiagramTheme {
  return siteTheme === "light" || siteTheme === "e-ink" ? "light" : "dark";
}

export function getDiagramThemeOverride(): DiagramThemeOverride {
  if (typeof window === "undefined") return "auto";
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // ignore storage errors
  }
  return "auto";
}

export function getDiagramTheme(siteTheme?: SiteTheme): DiagramTheme {
  const override = getDiagramThemeOverride();
  if (override === "light" || override === "dark") {
    return override;
  }
  return siteThemeToDiagramTheme(siteTheme ?? detectSiteTheme());
}

export function clearDiagramThemeOverride() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore storage errors
  }
  const resolved = siteThemeToDiagramTheme(detectSiteTheme());
  document.documentElement.setAttribute("data-diagram-theme", resolved);
  window.dispatchEvent(new CustomEvent("diagram-theme-changed", { detail: "auto" }));
}

export function setDiagramTheme(theme: DiagramThemeOverride, currentSiteTheme?: SiteTheme) {
  if (typeof window === "undefined") return;
  const siteDefault = siteThemeToDiagramTheme(currentSiteTheme ?? detectSiteTheme());
  try {
    // Only persist an explicit override when it diverges from the active site theme;
    // selecting the scheme that matches the site theme removes the override so future
    // global theme switches continue to propagate cleanly.
    if (theme === "auto" || theme === siteDefault) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, theme);
    }
  } catch {
    // ignore storage errors
  }
  const resolved = theme === "auto" ? siteDefault : theme;
  document.documentElement.setAttribute("data-diagram-theme", resolved);
  window.dispatchEvent(new CustomEvent("diagram-theme-changed", { detail: resolved }));
}

const LIGHT_CANVAS_WEBP_PATTERNS = [
  "databricks_manual_",
  "databricks_data_intelligence_platform_technical_manual_",
  "incident_runbooks_page_",
  "spark_architecture_catalyst_cheatsheet",
  "spark_join_strategies_decision_matrix",
  "spark_performance_skew_spill_triage",
];

/**
 * Resolves the pre-rendered -dark.webp and -light.webp variant URLs for any
 * diagram or cheatsheet WebP asset so no CSS pixel inversion hacks are needed.
 */
export function getThemedWebpVariants(src: string): { dark: string; light: string } {
  if (!src || !/\.webp(?:$|\?)/i.test(src)) {
    return { dark: src, light: src };
  }
  const [pathname, query] = src.split("?");
  const normalized = pathname.replace(/-(?:dark|light)\.webp$/i, ".webp");
  const darkPath = normalized.replace(/\.webp$/i, "-dark.webp");
  const lightPath = normalized.replace(/\.webp$/i, "-light.webp");
  const suffix = query ? `?${query}` : "";
  return {
    dark: `${darkPath}${suffix}`,
    light: `${lightPath}${suffix}`,
  };
}

export function getThemedWebpSrc(src: string, diagramTheme: DiagramTheme): string {
  const variants = getThemedWebpVariants(src);
  return diagramTheme === "light" ? variants.light : variants.dark;
}

/**
 * Identifies whether a .webp asset was originally rendered on a light/white canvas
 * (8 cheatsheet/manual WebPs) vs dark-slate canvas (all 56 whiteboard diagrams + 29 dark cheatsheets).
 */
export function isLightCanvasWebp(src: string | undefined | null): boolean {
  if (!src) return false;
  return LIGHT_CANVAS_WEBP_PATTERNS.some((pattern) => src.includes(pattern));
}

/**
 * Returns the CSS filter class for a .webp image given the resolved diagram theme
 * and the image's native canvas polarity.
 */
export function getWebpThemeClass(diagramTheme: DiagramTheme, src?: string | null): string {
  const isNativeLight = isLightCanvasWebp(src);
  if (isNativeLight) {
    return diagramTheme === "dark" ? "webp-light-canvas-dark" : "webp-light-canvas-light";
  }
  return diagramTheme === "dark" ? "whiteboard-dark" : "whiteboard-light";
}

export interface DiagramThemeMeta {
  siteTheme: SiteTheme;
  isOverridden: boolean;
  resetToSiteTheme: () => void;
}

export function useDiagramTheme(): [
  DiagramTheme,
  (newTheme: DiagramTheme | ((prev: DiagramTheme) => DiagramTheme)) => void,
  () => void,
  DiagramThemeMeta
] {
  const [siteTheme, setSiteTheme] = useState<SiteTheme>("dark");
  const [override, setOverride] = useState<DiagramThemeOverride>("auto");

  const syncFromEnvironment = useCallback(() => {
    setSiteTheme(detectSiteTheme());
    setOverride(getDiagramThemeOverride());
  }, []);

  useEffect(() => {
    syncFromEnvironment();

    const handleDiagramThemeChange = () => {
      syncFromEnvironment();
    };

    const handleStorage = (e: StorageEvent) => {
      if (!e.key || e.key === STORAGE_KEY || e.key === SITE_THEME_STORAGE_KEY) {
        syncFromEnvironment();
      }
    };

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === "class") {
          syncFromEnvironment();
          break;
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    window.addEventListener("diagram-theme-changed", handleDiagramThemeChange);
    window.addEventListener("storage", handleStorage);

    return () => {
      observer.disconnect();
      window.removeEventListener("diagram-theme-changed", handleDiagramThemeChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, [syncFromEnvironment]);

  const resolvedTheme: DiagramTheme =
    override === "light" || override === "dark"
      ? override
      : siteThemeToDiagramTheme(siteTheme);

  const setTheme = useCallback(
    (newThemeOrUpdater: DiagramTheme | ((prev: DiagramTheme) => DiagramTheme)) => {
      const currentSite = detectSiteTheme();
      const currentResolved = getDiagramTheme(currentSite);
      const nextTheme =
        typeof newThemeOrUpdater === "function"
          ? newThemeOrUpdater(currentResolved)
          : newThemeOrUpdater;

      const siteDefault = siteThemeToDiagramTheme(currentSite);
      setOverride(nextTheme === siteDefault ? "auto" : nextTheme);
      setDiagramTheme(nextTheme, currentSite);
    },
    []
  );

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, [setTheme]);

  const resetToSiteTheme = useCallback(() => {
    setOverride("auto");
    clearDiagramThemeOverride();
  }, []);

  return [
    resolvedTheme,
    setTheme,
    toggleTheme,
    {
      siteTheme,
      isOverridden: override !== "auto" && override !== siteThemeToDiagramTheme(siteTheme),
      resetToSiteTheme,
    },
  ];
}
