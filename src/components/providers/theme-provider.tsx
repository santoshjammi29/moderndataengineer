"use client";

import { useEffect, useRef } from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { clearDiagramThemeOverride } from "@/lib/diagram-theme";

const COLOR_SCHEME_BY_THEME: Record<string, { scheme: "light" | "dark"; bg: string }> = {
  dark: { scheme: "dark", bg: "#0A0A0B" },
  grey: { scheme: "dark", bg: "#18191c" },
  light: { scheme: "light", bg: "#f8f8fc" },
  "e-ink": { scheme: "light", bg: "#f7f6f2" },
};

function ThemeMetaSync() {
  const { theme, setTheme } = useTheme();
  const prevThemeRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!theme) return;
    const config = COLOR_SCHEME_BY_THEME[theme] || COLOR_SCHEME_BY_THEME.dark;

    const meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) {
      meta.setAttribute("content", config.scheme);
    }

    document.documentElement.style.colorScheme = config.scheme;
    document.documentElement.style.backgroundColor = config.bg;

    // When the user actively switches the global site theme, clear any temporary
    // whiteboard override so all .webp diagrams follow the newly selected theme.
    if (prevThemeRef.current && prevThemeRef.current !== theme) {
      clearDiagramThemeOverride();
    }
    prevThemeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "theme" && e.newValue && COLOR_SCHEME_BY_THEME[e.newValue]) {
        setTheme(e.newValue);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [setTheme]);

  return null;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      storageKey="theme"
      themes={["dark", "light", "grey", "e-ink"]}
    >
      <ThemeMetaSync />
      {children}
    </NextThemesProvider>
  );
}
