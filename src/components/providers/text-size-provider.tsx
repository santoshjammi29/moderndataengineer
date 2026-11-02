"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";

export type TextSizeKey =
  | "3xs"
  | "2xs"
  | "xs"
  | "sm"
  | "md"
  | "base"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl";

export interface TextSizeOption {
  id: TextSizeKey;
  label: string;
  tagline: string;
  percent: number;
  scaleLabel: string;
}

export const TEXT_SIZE_OPTIONS: TextSizeOption[] = [
  {
    id: "3xs",
    label: "Micro",
    tagline: "Ultra-dense layout for split screens & 4K",
    percent: 75,
    scaleLabel: "75%",
  },
  {
    id: "2xs",
    label: "Mini",
    tagline: "Maximum data density for compact panels",
    percent: 80,
    scaleLabel: "80%",
  },
  {
    id: "xs",
    label: "Extra Small",
    tagline: "High density for multi-panel workflows",
    percent: 85,
    scaleLabel: "85%",
  },
  {
    id: "sm",
    label: "Small",
    tagline: "Compact view for fast reading & scanning",
    percent: 90,
    scaleLabel: "90%",
  },
  {
    id: "md",
    label: "Slim",
    tagline: "Subtle compact scale for clean readability",
    percent: 95,
    scaleLabel: "95%",
  },
  {
    id: "base",
    label: "Default",
    tagline: "Standard balanced scale",
    percent: 100,
    scaleLabel: "100%",
  },
  {
    id: "lg",
    label: "Medium",
    tagline: "Enhanced comfort for long reading sessions",
    percent: 110,
    scaleLabel: "110%",
  },
  {
    id: "xl",
    label: "Large",
    tagline: "High legibility and clear contrast",
    percent: 120,
    scaleLabel: "120%",
  },
  {
    id: "2xl",
    label: "Extra Large",
    tagline: "Focus mode and reduced eye strain",
    percent: 130,
    scaleLabel: "130%",
  },
  {
    id: "3xl",
    label: "Super Large",
    tagline: "Large display and distant reading view",
    percent: 140,
    scaleLabel: "140%",
  },
  {
    id: "4xl",
    label: "Maximum",
    tagline: "Maximum readability and high zoom",
    percent: 150,
    scaleLabel: "150%",
  },
  {
    id: "5xl",
    label: "Ultra",
    tagline: "Ultra-high visibility presentation scale",
    percent: 160,
    scaleLabel: "160%",
  },
];

export type FontFamilyKey =
  | "inter"
  | "jetbrains"
  | "fira"
  | "system"
  | "serif"
  | "dyslexic";

export interface FontFamilyOption {
  id: FontFamilyKey;
  label: string;
  tagline: string;
  fontFamily: string;
  codeFontFamily: string;
  previewSample: string;
}

export const FONT_FAMILY_OPTIONS: FontFamilyOption[] = [
  {
    id: "inter",
    label: "Inter Sans",
    tagline: "Clean, crisp geometric UI typography",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    codeFontFamily: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
    previewSample: "Aa 123",
  },
  {
    id: "jetbrains",
    label: "JetBrains Mono",
    tagline: "Full developer monospace across cards, text & code",
    fontFamily: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
    codeFontFamily: "'JetBrains Mono', ui-monospace, monospace",
    previewSample: "fn() {}",
  },
  {
    id: "fira",
    label: "Fira Code",
    tagline: "Technical code font with programming ligatures",
    fontFamily: "'Fira Code', 'JetBrains Mono', ui-monospace, monospace",
    codeFontFamily: "'Fira Code', 'JetBrains Mono', monospace",
    previewSample: "=> !==",
  },
  {
    id: "system",
    label: "System UI",
    tagline: "Native OS font (Apple San Francisco, Segoe, Roboto)",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    codeFontFamily: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
    previewSample: "Aa 4k",
  },
  {
    id: "serif",
    label: "Editorial Serif",
    tagline: "Elegant book typography for comfortable long reading",
    fontFamily: "Charter, 'Bitstream Charter', 'Sitka Text', Cambria, Georgia, serif",
    codeFontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    previewSample: "Tt Book",
  },
  {
    id: "dyslexic",
    label: "Dyslexia Friendly",
    tagline: "High readability with weighted letter bottoms",
    fontFamily: "'OpenDyslexic', 'Comic Sans MS', sans-serif",
    codeFontFamily: "'OpenDyslexicMono', monospace",
    previewSample: "Aa Read",
  },
];

const STORAGE_KEY = "fabric_text_size";
const FONT_STORAGE_KEY = "fabric_font_family";

const VALID_KEYS: TextSizeKey[] = [
  "3xs",
  "2xs",
  "xs",
  "sm",
  "md",
  "base",
  "lg",
  "xl",
  "2xl",
  "3xl",
  "4xl",
  "5xl",
];

const VALID_FONT_KEYS: FontFamilyKey[] = [
  "inter",
  "jetbrains",
  "fira",
  "system",
  "serif",
  "dyslexic",
];

interface TextSizeContextType {
  textSize: TextSizeKey;
  currentOption: TextSizeOption;
  options: TextSizeOption[];
  setTextSize: (size: TextSizeKey, notify?: boolean) => void;
  increaseTextSize: (notify?: boolean) => void;
  decreaseTextSize: (notify?: boolean) => void;
  resetTextSize: (notify?: boolean) => void;
  canIncrease: boolean;
  canDecrease: boolean;

  // Font Family additions
  fontFamily: FontFamilyKey;
  currentFontFamilyOption: FontFamilyOption;
  fontFamilyOptions: FontFamilyOption[];
  setFontFamily: (font: FontFamilyKey, notify?: boolean) => void;
}

const TextSizeContext = createContext<TextSizeContextType | null>(null);

function applyTextSizeToDom(size: TextSizeKey) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  // Remove existing size classes
  VALID_KEYS.forEach((k) => root.classList.remove(`text-size-${k}`));

  // Add active size class
  root.classList.add(`text-size-${size}`);

  // Set CSS property
  const opt = TEXT_SIZE_OPTIONS.find((o) => o.id === size);
  if (opt) {
    root.style.setProperty("--text-scale", `${opt.percent}%`);
    root.style.setProperty("--text-scale-num", `${opt.percent}`);
    root.style.setProperty("--font-scale-multiplier", `${opt.percent / 100}`);
  }
}

function applyFontFamilyToDom(font: FontFamilyKey) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  // Remove existing font classes
  VALID_FONT_KEYS.forEach((k) => root.classList.remove(`font-${k}`));

  // Add active font class
  root.classList.add(`font-${font}`);

  const opt = FONT_FAMILY_OPTIONS.find((o) => o.id === font);
  if (opt) {
    root.style.setProperty("--font-sans", opt.fontFamily);
    root.style.setProperty("--font-mono", opt.codeFontFamily);
    root.style.setProperty("--font-code", opt.codeFontFamily);
  }
}

export function TextSizeProvider({ children }: { children: React.ReactNode }) {
  const [textSize, setTextSizeState] = useState<TextSizeKey>("base");
  const [fontFamily, setFontFamilyState] = useState<FontFamilyKey>("inter");
  const [mounted, setMounted] = useState(false);

  // Sync with initial DOM / localStorage
  useEffect(() => {
    try {
      const savedSize = localStorage.getItem(STORAGE_KEY) as TextSizeKey | null;
      if (savedSize && VALID_KEYS.includes(savedSize)) {
        setTextSizeState(savedSize);
        applyTextSizeToDom(savedSize);
      } else {
        applyTextSizeToDom("base");
      }

      const savedFont = localStorage.getItem(FONT_STORAGE_KEY) as FontFamilyKey | null;
      if (savedFont && VALID_FONT_KEYS.includes(savedFont)) {
        setFontFamilyState(savedFont);
        applyFontFamilyToDom(savedFont);
      } else {
        applyFontFamilyToDom("inter");
      }
    } catch {
      applyTextSizeToDom("base");
      applyFontFamilyToDom("inter");
    }
    setMounted(true);
  }, []);

  const currentOption = useMemo(
    () =>
      TEXT_SIZE_OPTIONS.find((o) => o.id === textSize) ||
      TEXT_SIZE_OPTIONS.find((o) => o.id === "base") ||
      TEXT_SIZE_OPTIONS[0],
    [textSize]
  );

  const currentFontFamilyOption = useMemo(
    () =>
      FONT_FAMILY_OPTIONS.find((f) => f.id === fontFamily) ||
      FONT_FAMILY_OPTIONS[0],
    [fontFamily]
  );

  const currentIndex = useMemo(
    () => TEXT_SIZE_OPTIONS.findIndex((o) => o.id === textSize),
    [textSize]
  );

  const canDecrease = currentIndex > 0;
  const canIncrease = currentIndex < TEXT_SIZE_OPTIONS.length - 1;

  const setTextSize = useCallback(
    (newSize: TextSizeKey, notify = true) => {
      if (!VALID_KEYS.includes(newSize)) return;
      setTextSizeState(newSize);
      applyTextSizeToDom(newSize);
      try {
        localStorage.setItem(STORAGE_KEY, newSize);
      } catch {
        // Storage might be restricted
      }

      if (notify) {
        const opt = TEXT_SIZE_OPTIONS.find((o) => o.id === newSize);
        toast.success(`Text size: ${opt?.label} (${opt?.scaleLabel})`, {
          description: opt?.tagline,
          duration: 1800,
        });
      }
    },
    []
  );

  const setFontFamily = useCallback(
    (newFont: FontFamilyKey, notify = true) => {
      if (!VALID_FONT_KEYS.includes(newFont)) return;
      setFontFamilyState(newFont);
      applyFontFamilyToDom(newFont);
      try {
        localStorage.setItem(FONT_STORAGE_KEY, newFont);
      } catch {
        // Storage might be restricted
      }

      if (notify) {
        const opt = FONT_FAMILY_OPTIONS.find((f) => f.id === newFont);
        toast.success(`Font: ${opt?.label}`, {
          description: opt?.tagline,
          duration: 1800,
        });
      }
    },
    []
  );

  const increaseTextSize = useCallback(
    (notify = true) => {
      const idx = TEXT_SIZE_OPTIONS.findIndex((o) => o.id === textSize);
      if (idx < TEXT_SIZE_OPTIONS.length - 1) {
        const next = TEXT_SIZE_OPTIONS[idx + 1].id;
        setTextSize(next, notify);
      } else if (notify) {
        const maxOpt = TEXT_SIZE_OPTIONS[TEXT_SIZE_OPTIONS.length - 1];
        toast.info(`Maximum text size reached (${maxOpt.scaleLabel})`, { duration: 1500 });
      }
    },
    [textSize, setTextSize]
  );

  const decreaseTextSize = useCallback(
    (notify = true) => {
      const idx = TEXT_SIZE_OPTIONS.findIndex((o) => o.id === textSize);
      if (idx > 0) {
        const prev = TEXT_SIZE_OPTIONS[idx - 1].id;
        setTextSize(prev, notify);
      } else if (notify) {
        const minOpt = TEXT_SIZE_OPTIONS[0];
        toast.info(`Minimum text size reached (${minOpt.scaleLabel})`, { duration: 1500 });
      }
    },
    [textSize, setTextSize]
  );

  const resetTextSize = useCallback(
    (notify = true) => {
      setTextSize("base", false);
      if (notify) {
        toast.success("Text size reset to Default (100%)", {
          description: "Standard balanced scale",
          duration: 1800,
        });
      }
    },
    [setTextSize]
  );

  // Global hotkeys: Alt + Plus / Alt + Minus / Alt + 0
  useEffect(() => {
    if (!mounted) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when user is typing in input/textarea/editable
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      // Check Alt modifier
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        if (e.key === "=" || e.key === "+") {
          e.preventDefault();
          increaseTextSize(true);
        } else if (e.key === "-" || e.key === "_") {
          e.preventDefault();
          decreaseTextSize(true);
        } else if (e.key === "0") {
          e.preventDefault();
          resetTextSize(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mounted, increaseTextSize, decreaseTextSize, resetTextSize]);

  const value = useMemo<TextSizeContextType>(
    () => ({
      textSize,
      currentOption,
      options: TEXT_SIZE_OPTIONS,
      setTextSize,
      increaseTextSize,
      decreaseTextSize,
      resetTextSize,
      canIncrease,
      canDecrease,

      fontFamily,
      currentFontFamilyOption,
      fontFamilyOptions: FONT_FAMILY_OPTIONS,
      setFontFamily,
    }),
    [
      textSize,
      currentOption,
      setTextSize,
      increaseTextSize,
      decreaseTextSize,
      resetTextSize,
      canIncrease,
      canDecrease,
      fontFamily,
      currentFontFamilyOption,
      setFontFamily,
    ]
  );

  return (
    <TextSizeContext.Provider value={value}>{children}</TextSizeContext.Provider>
  );
}

const defaultOption =
  TEXT_SIZE_OPTIONS.find((o) => o.id === "base") || TEXT_SIZE_OPTIONS[0];

const defaultFontOption = FONT_FAMILY_OPTIONS[0];

const defaultContextValue: TextSizeContextType = {
  textSize: "base",
  currentOption: defaultOption,
  options: TEXT_SIZE_OPTIONS,
  setTextSize: () => {},
  increaseTextSize: () => {},
  decreaseTextSize: () => {},
  resetTextSize: () => {},
  canIncrease: true,
  canDecrease: true,

  fontFamily: "inter",
  currentFontFamilyOption: defaultFontOption,
  fontFamilyOptions: FONT_FAMILY_OPTIONS,
  setFontFamily: () => {},
};

export function useTextSize(): TextSizeContextType {
  const context = useContext(TextSizeContext);
  if (!context) {
    return defaultContextValue;
  }
  return context;
}
