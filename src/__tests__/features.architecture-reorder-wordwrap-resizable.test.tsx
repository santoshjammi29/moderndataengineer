import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { NAV_GROUPS } from "@/data/navigation-data";
import { Sidebar } from "@/components/layout/sidebar";
import { AllPagesFooter } from "@/components/layout/all-pages-footer";
import { CONTENT_COUNTS, formatContentCount } from "@/data/content-counts";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/architecture",
  useSearchParams: () => new URLSearchParams("tab=scenarios"),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

describe("Architecture & Systems Reorder, Word Wrap & Resizable Sidebar Tests", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("places Modern Stack with Matrix pill as the first build and operate feature item", () => {
    const buildGroup = NAV_GROUPS.find((g) => g.title === "Build and operate");
    expect(buildGroup).toBeDefined();

    const items = buildGroup!.items;
    expect(items.length).toBeGreaterThanOrEqual(3);

    expect(items[0].label).toBe("Modern Stack");
    expect(items[0].href).toBe("/modern-stack");
    expect(items[0].pill?.text).toBe("Matrix");

    // Practise group has Architecture as first item
    const practiseGroup = NAV_GROUPS.find((g) => g.title === "Practise");
    expect(practiseGroup).toBeDefined();
    expect(practiseGroup!.items[0].label).toBe("Architecture");
    expect(practiseGroup!.items[0].href).toBe("/architecture");

    // Next is Spark Lab
    expect(practiseGroup!.items[1].label).toBe("Spark Lab");
    expect(practiseGroup!.items[1].href).toBe("/spark-engine");
  });

  it("renders Sidebar with word-wrap enabled classes and resizer handle", () => {
    const { container } = render(<Sidebar />);

    // Check that sidebar aside element is present
    const aside = container.querySelector("aside");
    expect(aside).not.toBeNull();

    // Check that resize separator handle is present
    const resizer = screen.getByRole("separator", { name: /resize nav bar width/i });
    expect(resizer).toBeDefined();
    expect(resizer.getAttribute("title")).toContain("Drag to resize nav bar width");

    // Check word-wrap text styling on navigation items
    const archLabel = screen.getByText("Architecture");
    expect(archLabel.className).toContain("break-words");
    expect(archLabel.className).toContain("whitespace-normal");
  });

  it("supports adjusting sidebar width via presets and local storage persistence", () => {
    render(<Sidebar />);

    // Open width preset menu
    const widthBtn = screen.getByRole("button", { name: /adjust sidebar width/i });
    expect(widthBtn).toBeDefined();
    fireEvent.click(widthBtn);

    // Click Wide View (430px) preset
    const widePreset = screen.getByText("Wide View");
    fireEvent.click(widePreset);

    // Verify localStorage was updated
    expect(localStorage.getItem("sidebar-width")).toBe("430");
  });

  it("verifies the bottom utility bar with Shortcuts and duplicate controls is completely removed from AllPagesFooter", () => {
    render(<AllPagesFooter />);

    // High signal content remains
    expect(screen.getByText("Lakehouse Architect Notes")).toBeDefined();
    expect(screen.getByText("2026 Edition")).toBeDefined();
    expect(screen.getByText(new RegExp(formatContentCount(CONTENT_COUNTS.searchDocuments)))).toBeDefined();

    // Shortcuts row is removed
    expect(screen.queryByText(/shortcuts:/i)).toBeNull();
    expect(screen.queryByText("Shift+E")).toBeNull();
  });
});
