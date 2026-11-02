import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { Sidebar } from "@/components/layout/sidebar";
import {
  TextSizeProvider,
  useTextSize,
  FONT_FAMILY_OPTIONS,
} from "@/components/providers/text-size-provider";
import { TextSizeController } from "@/components/ui/text-size-controller";
import { NAV_GROUPS } from "@/data/navigation-data";
import { modernConceptsDb } from "@/data";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/modern-stack",
  useSearchParams: () => new URLSearchParams("tab=concepts"),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

function FontTester() {
  const { fontFamily, setFontFamily, currentFontFamilyOption, fontFamilyOptions } = useTextSize();
  return (
    <div>
      <div data-testid="current-font">{fontFamily}</div>
      <div data-testid="current-font-label">{currentFontFamilyOption.label}</div>
      {fontFamilyOptions.map((f) => (
        <button key={f.id} data-testid={`select-${f.id}`} onClick={() => setFontFamily(f.id, false)}>
          {f.label}
        </button>
      ))}
    </div>
  );
}

describe("Global Typography & Font System Verification", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
    vi.restoreAllMocks();
  });

  it("provides 6 production-grade font family options", () => {
    expect(FONT_FAMILY_OPTIONS.length).toBe(6);
    const ids = FONT_FAMILY_OPTIONS.map((f) => f.id);
    expect(ids).toContain("inter");
    expect(ids).toContain("jetbrains");
    expect(ids).toContain("fira");
    expect(ids).toContain("system");
    expect(ids).toContain("serif");
    expect(ids).toContain("dyslexic");
  });

  it("updates DOM and localStorage when changing font family", () => {
    render(
      <TextSizeProvider>
        <FontTester />
      </TextSizeProvider>
    );

    expect(screen.getByTestId("current-font").textContent).toBe("inter");
    expect(document.documentElement.classList.contains("font-inter")).toBe(true);

    // Switch to JetBrains Mono (Developer Mode)
    fireEvent.click(screen.getByTestId("select-jetbrains"));
    expect(screen.getByTestId("current-font").textContent).toBe("jetbrains");
    expect(document.documentElement.classList.contains("font-jetbrains")).toBe(true);
    expect(document.documentElement.classList.contains("font-inter")).toBe(false);
    expect(localStorage.getItem("fabric_font_family")).toBe("jetbrains");

    // Switch to Editorial Serif
    fireEvent.click(screen.getByTestId("select-serif"));
    expect(screen.getByTestId("current-font").textContent).toBe("serif");
    expect(document.documentElement.classList.contains("font-serif")).toBe(true);
    expect(document.documentElement.classList.contains("font-jetbrains")).toBe(false);
    expect(localStorage.getItem("fabric_font_family")).toBe("serif");
  });

  it("TextSizeController allows toggling between Text Scale and Font Family tabs", () => {
    render(
      <TextSizeProvider>
        <TextSizeController />
      </TextSizeProvider>
    );

    // Open popover
    const trigger = screen.getByRole("button", { name: /Typography and font settings menu/i });
    fireEvent.click(trigger);

    // Tabs exist
    const fontTab = screen.getByRole("button", { name: /Font Family/i });
    expect(fontTab).toBeDefined();

    // Click Font Family tab
    fireEvent.click(fontTab);

    // Verify font family options are displayed
    expect(screen.getByText("JetBrains Mono")).toBeDefined();
    expect(screen.getByText("Editorial Serif")).toBeDefined();
    expect(screen.getByText("Fira Code")).toBeDefined();
    expect(screen.getByText("Dyslexia Friendly")).toBeDefined();

    // Select JetBrains Mono
    fireEvent.click(screen.getByText("JetBrains Mono"));
    expect(document.documentElement.classList.contains("font-jetbrains")).toBe(true);
  });
});

describe("Core Concepts in Table Matrix Page (/modern-stack)", () => {
  it("contains at least 30 enriched modern lakehouse concepts", () => {
    expect(modernConceptsDb.length).toBeGreaterThanOrEqual(30);
  });

  it("verifies cutting-edge 2026 Lakehouse concepts exist with technical depth", () => {
    const titles = modernConceptsDb.map((c) => c.title);
    expect(titles.some((t) => t.includes("UniForm") || t.includes("Universal Format"))).toBe(true);
    expect(titles.some((t) => t.includes("Iceberg") && t.includes("Delete"))).toBe(true);
    expect(titles.some((t) => t.includes("Paimon"))).toBe(true);
    expect(titles.some((t) => t.includes("LanceDB") || t.includes("Vector Storage"))).toBe(true);
    expect(titles.some((t) => t.includes("Arrow C Data Interface") || t.includes("Zero-Copy"))).toBe(true);
    expect(titles.some((t) => t.includes("Serverless SQL") && t.includes("FinOps"))).toBe(true);
    expect(titles.some((t) => t.includes("Optimistic Concurrency Control") || t.includes("OCC"))).toBe(true);
    expect(titles.some((t) => t.includes("OneLake Shortcuts"))).toBe(true);
    expect(titles.some((t) => t.includes("Liquid Clustering"))).toBe(true);
    expect(titles.some((t) => t.includes("Change Data Capture") || t.includes("CDC"))).toBe(true);
    expect(titles.some((t) => t.includes("Semantic Layer") || t.includes("MetricFlow"))).toBe(true);
    expect(titles.some((t) => t.includes("Data Contracts") || t.includes("ODCS"))).toBe(true);
  });
});

describe("Left Bar Navigation & Subpages Sequence", () => {
  it("verifies logical subpage sequence for Cloud × Table Matrix", () => {
    const modernStackItem = NAV_GROUPS[0].items.find((i) => i.href === "/modern-stack");
    expect(modernStackItem).toBeDefined();
    expect(modernStackItem?.subItems).toBeDefined();

    const subHrefs = modernStackItem!.subItems!.map((s) => s.href);
    expect(subHrefs[0]).toContain("tab=compatibility");
    expect(subHrefs[1]).toContain("tab=concepts");
    expect(subHrefs[2]).toContain("tab=simulators");
    expect(subHrefs[3]).toContain("tab=cost");
    expect(subHrefs[4]).toContain("tab=ai");
  });

  it("verifies logical subpage sequence for Architecture Scenarios", () => {
    const archItem = NAV_GROUPS[0].items.find((i) => i.href === "/architecture");
    expect(archItem).toBeDefined();
    expect(archItem?.subItems).toBeDefined();

    const subHrefs = archItem!.subItems!.map((s) => s.href);
    expect(subHrefs[0]).toContain("tab=scenarios");
    expect(subHrefs[1]).toBe("/whiteboards");
    expect(subHrefs[2]).toContain("tab=diagrams");
    expect(subHrefs[3]).toContain("tab=python");
  });

  it("renders expand/collapse controls and all subpages toggle in the left Sidebar", () => {
    render(<Sidebar />);

    // Toggle button for All Subpages is rendered
    const toggleAllBtn = screen.getByRole("button", { name: /All Subpages/i });
    expect(toggleAllBtn).toBeDefined();

    // Clicking All Subpages expands all subpages across the left bar
    act(() => {
      fireEvent.click(toggleAllBtn);
    });

    expect(screen.getByText("Collapse Subpages")).toBeDefined();
    expect(screen.getByText("Cloud Matrix")).toBeDefined();
    expect(screen.getByText("Lakehouse Primitives")).toBeDefined();
    expect(screen.getByText("Interactive Drills")).toBeDefined();
    expect(screen.getByText("Databricks Coding")).toBeDefined();
  });
});
