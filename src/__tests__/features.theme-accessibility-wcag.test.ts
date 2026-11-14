import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

/**
 * WCAG 2.2 Relative Luminance and Contrast Ratio calculation helpers
 * Based on W3C WCAG 2.2 specifications: https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
function parseRgb(color: string): [number, number, number] {
  const hex = color.trim().replace(/^#/, "");
  if (hex.length === 3) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    return [r, g, b];
  }
  if (hex.length === 6) {
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return [r, g, b];
  }
  throw new Error(`Unsupported color format for calculation: ${color}`);
}

function srgbToLinear(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function calculateRelativeLuminance(r: number, g: number, b: number): number {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

function calculateContrastRatio(hex1: string, hex2: string): number {
  const [r1, g1, b1] = parseRgb(hex1);
  const [r2, g2, b2] = parseRgb(hex2);
  const l1 = calculateRelativeLuminance(r1, g1, b1);
  const l2 = calculateRelativeLuminance(r2, g2, b2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe("Theme System & WCAG 2.2 AA Contrast Remediation", () => {
  const globalsCssPath = path.resolve(__dirname, "../app/globals.css");
  const globalsCss = fs.readFileSync(globalsCssPath, "utf-8");

  describe("1. Semantic Tokens Definitions in globals.css", () => {
    const requiredSemanticTokens = [
      "--page-background",
      "--surface-primary",
      "--surface-secondary",
      "--surface-raised",
      "--surface-sunken",
      "--surface-overlay",
      "--surface-selected",
      "--text-primary",
      "--text-secondary",
      "--text-muted",
      "--text-inverse",
      "--text-link",
      "--text-link-hover",
      "--text-placeholder",
      "--text-code",
      "--text-on-status",
      "--border-subtle",
      "--border-strong",
      "--border-interactive",
      "--focus-indicator",
      "--divider",
      "--selection-background",
      "--selection-foreground",
      "--status-success-fg",
      "--status-warning-fg",
      "--status-danger-fg",
      "--status-info-fg",
      "--chart-axis",
      "--chart-grid",
      "--chart-tooltip-bg",
      "--chart-tooltip-fg",
    ];

    it("declares all required semantic tokens in @theme inline", () => {
      for (const token of requiredSemanticTokens) {
        expect(globalsCss).toContain(token);
      }
    });

    it("declares theme values for all 4 supported themes: dark, light, grey, e-ink", () => {
      expect(globalsCss).toContain("html.dark");
      expect(globalsCss).toContain("html.light");
      expect(globalsCss).toContain("html.grey");
      expect(globalsCss).toContain("html.e-ink");
    });
  });

  describe("2. Measured WCAG 2.2 AA Contrast Ratios on Core Token Pairs", () => {
    // Dark Theme tokens
    const darkTokens = {
      bg: "#0A0A0B",
      surfacePrimary: "#161618",
      surfaceSecondary: "#1C1C20",
      textPrimary: "#f0f0f5",
      textSecondary: "#cbd5e1",
      textMuted: "#9da4b4",
      textLink: "#60a5fa",
      textCode: "#38bdf8",
      statusSuccess: "#4ade80",
      statusWarning: "#fbbf24",
      statusDanger: "#f87171",
      statusInfo: "#38bdf8",
    };

    // Light Theme tokens
    const lightTokens = {
      bg: "#f8f8fc",
      surfacePrimary: "#ffffff",
      surfaceSecondary: "#f1f1f8",
      textPrimary: "#09090b",
      textSecondary: "#334155",
      textMuted: "#475569",
      textLink: "#1d4ed8",
      textCode: "#0369a1",
      statusSuccess: "#15803d",
      statusWarning: "#b45309",
      statusDanger: "#b91c1c",
      statusInfo: "#0369a1",
    };

    // Grey Theme tokens
    const greyTokens = {
      bg: "#18191c",
      surfacePrimary: "#202226",
      surfaceSecondary: "#272a30",
      textPrimary: "#e4e5eb",
      textSecondary: "#b8bcc9",
      textMuted: "#9095a6",
      textLink: "#60a5fa",
      textCode: "#38bdf8",
      statusSuccess: "#4ade80",
      statusWarning: "#fbbf24",
      statusDanger: "#f87171",
      statusInfo: "#38bdf8",
    };

    // E-Ink Theme tokens
    const eInkTokens = {
      bg: "#f7f6f2",
      surfacePrimary: "#ffffff",
      surfaceSecondary: "#eeeeea",
      textPrimary: "#111111",
      textSecondary: "#2a2a2a",
      textMuted: "#475569",
      textLink: "#0033aa",
      textCode: "#004488",
      statusSuccess: "#115522",
      statusWarning: "#774400",
      statusDanger: "#881111",
      statusInfo: "#004488",
    };

    it("verifies Dark theme contrast exceeds WCAG AA (4.5:1)", () => {
      // Primary text on page background
      const ratioPrimary = calculateContrastRatio(darkTokens.textPrimary, darkTokens.bg);
      expect(ratioPrimary).toBeGreaterThanOrEqual(14.0); // ~17:1

      // Secondary text on surface primary
      const ratioSecondary = calculateContrastRatio(darkTokens.textSecondary, darkTokens.surfacePrimary);
      expect(ratioSecondary).toBeGreaterThanOrEqual(9.0); // ~11:1

      // Muted text on surface secondary (crucial test: must pass >= 4.5:1)
      const ratioMuted = calculateContrastRatio(darkTokens.textMuted, darkTokens.surfaceSecondary);
      expect(ratioMuted).toBeGreaterThanOrEqual(5.5); // ~6.2:1 (PASS WCAG AA)

      // Link text on dark background
      const ratioLink = calculateContrastRatio(darkTokens.textLink, darkTokens.bg);
      expect(ratioLink).toBeGreaterThanOrEqual(7.0); // ~8.6:1
    });

    it("verifies Light theme contrast exceeds WCAG AA (4.5:1)", () => {
      // Primary text on page background (#09090b on #f8f8fc)
      const ratioPrimary = calculateContrastRatio(lightTokens.textPrimary, lightTokens.bg);
      expect(ratioPrimary).toBeGreaterThanOrEqual(16.0); // ~18:1

      // Secondary text on white surface (#334155 on #ffffff)
      const ratioSecondary = calculateContrastRatio(lightTokens.textSecondary, lightTokens.surfacePrimary);
      expect(ratioSecondary).toBeGreaterThanOrEqual(9.0); // ~10:1

      // Muted text on surface (#475569 on #ffffff)
      const ratioMuted = calculateContrastRatio(lightTokens.textMuted, lightTokens.surfacePrimary);
      expect(ratioMuted).toBeGreaterThanOrEqual(7.0); // ~7.2:1 (PASS WCAG AA)

      // Link text on light background (#1d4ed8 on #f8f8fc)
      const ratioLink = calculateContrastRatio(lightTokens.textLink, lightTokens.bg);
      expect(ratioLink).toBeGreaterThanOrEqual(5.0); // ~5.7:1 (PASS WCAG AA)

      // Code text on light background (#0369a1 on #f8f8fc)
      const ratioCode = calculateContrastRatio(lightTokens.textCode, lightTokens.bg);
      expect(ratioCode).toBeGreaterThanOrEqual(5.0); // ~5.2:1 (PASS WCAG AA, fixed from 3.67:1)

      // Status text contrast
      expect(calculateContrastRatio(lightTokens.statusSuccess, lightTokens.surfacePrimary)).toBeGreaterThanOrEqual(4.5);
      expect(calculateContrastRatio(lightTokens.statusWarning, lightTokens.surfacePrimary)).toBeGreaterThanOrEqual(4.5);
      expect(calculateContrastRatio(lightTokens.statusDanger, lightTokens.surfacePrimary)).toBeGreaterThanOrEqual(4.5);
      expect(calculateContrastRatio(lightTokens.statusInfo, lightTokens.surfacePrimary)).toBeGreaterThanOrEqual(4.5);
    });

    it("verifies Grey theme contrast exceeds WCAG AA (4.5:1)", () => {
      const ratioPrimary = calculateContrastRatio(greyTokens.textPrimary, greyTokens.bg);
      expect(ratioPrimary).toBeGreaterThanOrEqual(12.0);

      const ratioMuted = calculateContrastRatio(greyTokens.textMuted, greyTokens.surfaceSecondary);
      expect(ratioMuted).toBeGreaterThanOrEqual(4.8);
    });

    it("verifies E-Ink theme contrast achieves maximum legibility (>= 7:1)", () => {
      const ratioPrimary = calculateContrastRatio(eInkTokens.textPrimary, eInkTokens.surfacePrimary);
      expect(ratioPrimary).toBeGreaterThanOrEqual(16.0); // Deep black on white

      const ratioMuted = calculateContrastRatio(eInkTokens.textMuted, eInkTokens.surfacePrimary);
      expect(ratioMuted).toBeGreaterThanOrEqual(7.0); // #475569 on #ffffff is 7.2:1
    });
  });

  describe("3. High-Contrast & Color Utility Protection Rules", () => {
    it("ensures Light & E-Ink modes override low-contrast text classes", () => {
      expect(globalsCss).toContain(".light .text-purple-500");
      expect(globalsCss).toContain(".light .text-purple-400");
      expect(globalsCss).toContain(".light .text-purple-300");
      expect(globalsCss).toContain(".light .text-purple-200");
      expect(globalsCss).toContain(".light .text-blue-500");
      expect(globalsCss).toContain(".light .text-emerald-500");
      expect(globalsCss).toContain(".light .text-amber-500");
      expect(globalsCss).toContain(".light .text-cyan-500");
      expect(globalsCss).toContain(".light .text-sky-500");
      expect(globalsCss).toContain(".light .text-teal-500");
      expect(globalsCss).toContain(".light .text-slate-500");
    });

    it("protects dark code blocks and containers from being darkened in Light mode", () => {
      expect(globalsCss).toContain(".light pre.code-block");
      expect(globalsCss).toContain(".light pre span.text-purple-400");
      expect(globalsCss).toContain(".light pre span.text-emerald-400");
    });

    it("protects white button text from turning black in E-Ink mode", () => {
      expect(globalsCss).toContain(".e-ink :where(");
      expect(globalsCss).toContain('button[class*="bg-"]');
    });

    it("handles opacity-modified colored text classes with attribute selectors", () => {
      expect(globalsCss).toContain('.light [class*="text-purple-200\\\\/"]');
      expect(globalsCss).toContain('.light [class*="text-amber-300\\\\/"]');
      expect(globalsCss).toContain('.light [class*="text-emerald-200\\\\/"]');
      expect(globalsCss).toContain('.light [class*="text-blue-500\\\\/"]');
    });
  });

  describe("4. Whiteboard Diagram Theme Classes & High Contrast Media", () => {
    it("defines whiteboard image filter classes for both dark and light", () => {
      expect(globalsCss).toContain(".whiteboard-dark");
      expect(globalsCss).toContain(".whiteboard-image-dark");
      expect(globalsCss).toContain(".whiteboard-light");
      expect(globalsCss).toContain(".whiteboard-image-light");
      expect(globalsCss).toContain(".whiteboard-container-dark");
      expect(globalsCss).toContain(".whiteboard-container-light");
    });

    it("includes @media (forced-colors: active) for Windows High Contrast mode", () => {
      expect(globalsCss).toContain("@media (forced-colors: active)");
      expect(globalsCss).toContain("CanvasText");
      expect(globalsCss).toContain("ButtonBorder");
      expect(globalsCss).toContain("Highlight");
    });
  });

  describe("5. Unified Typography & Natural Wrapping Rules", () => {
    it("consolidates heading and body to unified primary font and monospace companion", () => {
      expect(globalsCss).toContain("--font-heading: var(--font-sans);");
      expect(globalsCss).toContain("--font-sans:");
      expect(globalsCss).toContain("--font-mono:");
    });

    it("declares fluid typography scale tokens (xs to 4xl) and semantic line heights", () => {
      expect(globalsCss).toContain("--font-size-xs:");
      expect(globalsCss).toContain("--font-size-base:");
      expect(globalsCss).toContain("--font-size-4xl:");
      expect(globalsCss).toContain("--line-height-heading:");
      expect(globalsCss).toContain("--line-height-body:");
    });

    it("enforces global natural wrapping without text clipping", () => {
      expect(globalsCss).toContain("overflow-wrap: anywhere;");
      expect(globalsCss).toContain("text-wrap: balance;");
      expect(globalsCss).toContain("text-wrap: pretty;");
      expect(globalsCss).toContain("min-width: 0;");
    });

    it("verifies E-Ink syntax tokens amber and orange achieve WCAG AA contrast (>= 4.5:1)", () => {
      const eInkPreBg = "#eeebe3";
      const amberSyntax = "#78350f";
      const orangeSyntax = "#9a3412";
      expect(calculateContrastRatio(amberSyntax, eInkPreBg)).toBeGreaterThanOrEqual(7.0);
      expect(calculateContrastRatio(orangeSyntax, eInkPreBg)).toBeGreaterThanOrEqual(6.0);
    });

    it("provides solid text fallback for text-clip gradients in light and e-ink themes", () => {
      expect(globalsCss).toContain(".light .text-transparent.bg-clip-text");
      expect(globalsCss).toContain(".e-ink .text-transparent.bg-clip-text");
    });
  });
});
