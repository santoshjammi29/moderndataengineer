import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { Sidebar } from "@/components/layout/sidebar";
import { AllPagesNav } from "@/components/layout/all-pages-nav";
import { AllPagesFooter } from "@/components/layout/all-pages-footer";
import { NAV_GROUPS, ALL_FLAT_PAGES_AND_SUBPAGES, isSubHrefActive } from "@/data/navigation-data";
import { CONTENT_COUNTS, formatContentCount } from "@/data/content-counts";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe("Streamlined Navigation & Meaningful Bottom Page Notes", () => {
  it("defines all 21 pages and subpages in the centralized navigation catalog", () => {
    expect(ALL_FLAT_PAGES_AND_SUBPAGES.length).toBeGreaterThanOrEqual(20);
    const hrefs = ALL_FLAT_PAGES_AND_SUBPAGES.map((p) => p.href);

    // Verify key core subpages exist
    expect(hrefs).toContain("/guided-learning");
    expect(hrefs).toContain("/learning-paths");
    expect(hrefs).toContain("/concepts");
    expect(hrefs).toContain("/spark-engine");
    expect(hrefs).toContain("/modern-stack");
    expect(hrefs).toContain("/architecture?tab=scenarios");
    expect(hrefs).toContain("/architecture?tab=diagrams");
    expect(hrefs).toContain("/cheat-sheet");
    expect(hrefs).toContain("/code-practice?db=pyspark");
    expect(hrefs).toContain("/dataops?tab=connectivity");
    expect(hrefs).toContain("/dataops?tab=cicd");
    expect(hrefs).toContain("/qa-prep");
    expect(hrefs).toContain("/company-research");
    expect(hrefs).toContain("/studio");
  });

  it("renders ALL hubs and subpages in the left Sidebar as the primary navigation", () => {
    render(<Sidebar />);

    // Check that primary navigation hubs across all groups are cleanly rendered and visible in the left sidebar
    expect(screen.getByText("Modern Stack")).toBeDefined();
    expect(screen.getByText("Architecture")).toBeDefined();
    expect(screen.getByText("Spark Lab")).toBeDefined();
    expect(screen.getByText("DataOps")).toBeDefined();
    expect(screen.getAllByText("Concepts")[0]).toBeDefined();
    expect(screen.getByText("Code Practice")).toBeDefined();
    expect(screen.getByText("Cheat Sheets")).toBeDefined();
    expect(screen.getByText("Interview Practice")).toBeDefined();
    expect(screen.getByText("Guided Learning")).toBeDefined();
    expect(screen.getByText("Company Research")).toBeDefined();
    expect(screen.getByText("My Studio")).toBeDefined();

    // Verify Company Research is in Assess and explore careers
    const careerGroup = NAV_GROUPS.find((g) => g.title === "Assess and explore careers");
    const careerItems = careerGroup!.items.map((i) => i.label);
    expect(careerItems[careerItems.length - 1]).toBe("Company Research");

    // Verify Mind Map is moved under Concepts
    const conceptsItem = NAV_GROUPS.find((g) => g.title === "Learn")?.items.find((i) => i.label === "Concepts");
    expect(conceptsItem?.subItems?.map((s) => s.label)).toContain("Mind Map");

    // Verify Career Curricula is moved under Guided Learning
    const guidedItem = NAV_GROUPS.find((g) => g.title === "Learn")?.items.find((i) => i.label === "Guided Learning");
    expect(guidedItem?.subItems?.map((s) => s.label)).toContain("Career Curricula");

    // Verify Worker Deployments is removed from navigation
    const allLabels = NAV_GROUPS.flatMap((g) => g.items.map((i) => i.label));
    expect(allLabels).not.toContain("Worker Deployments");

    // Verify Spark Lab has execution simulator sub-item
    const sparkItem = NAV_GROUPS.find((g) => g.title === "Practise")?.items.find((i) => i.label === "Spark Lab");
    expect(sparkItem?.subItems?.map((s) => s.label)).toContain("Execution Simulator");
  });

  it("renders AllPagesNav with the universal search bar and horizontal subpage navigation", () => {
    render(<AllPagesNav />);

    // Search bar is rendered prominently with ⌘K badge
    expect(screen.getByRole("search")).toBeDefined();
    expect(screen.getByText(new RegExp(`Search ${formatContentCount(CONTENT_COUNTS.searchDocuments)} learning items`, "i"))).toBeDefined();
    expect(screen.getByText("⌘K")).toBeDefined();

    // Horizontal navigation with all sections is rendered
    expect(screen.getByRole("navigation", { name: /All Sections and Subpages Navigation/i })).toBeDefined();
    expect(screen.getByRole("link", { name: /Home/i })).toBeDefined();
    expect(screen.getByRole("link", { name: /Guided Learning/i })).toBeDefined();
    expect(screen.getByRole("link", { name: /Concepts/i })).toBeDefined();
    expect(screen.getByRole("link", { name: /Architecture/i })).toBeDefined();
    expect(screen.getByRole("link", { name: /Spark Lab/i })).toBeDefined();
    expect(screen.getByRole("link", { name: /Modern Stack & DataOps/i })).toBeDefined();
    expect(screen.getByRole("link", { name: /Code Practice/i })).toBeDefined();
    expect(screen.getByRole("link", { name: /Cheat Sheets/i })).toBeDefined();
    expect(screen.getByRole("link", { name: /Interview Bank/i })).toBeDefined();
    expect(screen.getByRole("link", { name: /My Studio/i })).toBeDefined();

    // Clicking a section's dropdown toggle reveals its subsections and subpages
    const sparkLabToggle = screen.getByRole("button", { name: /Show subsections for Spark Lab/i });
    act(() => {
      fireEvent.click(sparkLabToggle);
    });
    expect(screen.getByText("Spark Lab Subsections")).toBeDefined();
    expect(screen.getByRole("menuitem", { name: /Catalyst Optimizer/i })).toBeDefined();
    expect(screen.getByRole("menuitem", { name: /Execution Visualizer/i })).toBeDefined();
  });

  it("renders AllPagesFooter with revamped, simple, and meaningful platform notes and metrics", () => {
    render(<AllPagesFooter />);

    // High-signal platform notes and metrics
    expect(screen.getByText("Lakehouse Architect Notes")).toBeDefined();
    expect(screen.getByText("2026 Edition")).toBeDefined();
    expect(screen.getByText(formatContentCount(CONTENT_COUNTS.searchDocuments))).toBeDefined();
    expect(screen.getByText("Searchable Items")).toBeDefined();
    expect(screen.getByText("42 Blueprints")).toBeDefined();
    expect(screen.getByText("156 Profiles")).toBeDefined();
    expect(screen.getByText(`${formatContentCount(CONTENT_COUNTS.concepts)} Concepts`)).toBeDefined();

    // Redundant bottom bar controls removed
    expect(screen.queryByText("Shortcuts:")).toBeNull();
  });

  it("correctly identifies active subpage hrefs including default parameters", () => {
    // Exact match
    expect(isSubHrefActive("/guided-learning", new URLSearchParams(), "/guided-learning")).toBe(true);

    // Query param match
    expect(isSubHrefActive("/architecture", new URLSearchParams("tab=diagrams"), "/architecture?tab=diagrams")).toBe(true);
    expect(isSubHrefActive("/architecture", new URLSearchParams("tab=scenarios"), "/architecture?tab=diagrams")).toBe(false);

    // Default fallback when tab is not set on /architecture
    expect(isSubHrefActive("/architecture", new URLSearchParams(), "/architecture?tab=scenarios")).toBe(true);
  });

  it("ensures left navigation stays until the end of the page on desktop displays while preserving clean mobile layout", () => {
    const { container } = render(<Sidebar />);
    const aside = container.querySelector("aside");
    expect(aside).not.toBeNull();

    // Verify aside uses fixed, top-0, bottom-0, left-0, and h-dvh to stay pinned until the bottom of dynamic pages
    expect(aside?.className).toContain("fixed");
    expect(aside?.className).toContain("top-0");
    expect(aside?.className).toContain("bottom-0");
    expect(aside?.className).toContain("left-0");
    expect(aside?.className).toContain("h-dvh");
    expect(aside?.className).toContain("border-r");

    // Verify aside uses hidden lg:flex for responsive mobile layout
    expect(aside?.className).toContain("hidden lg:flex");
  });

  it("verifies left navigation maintains responsive collapsed and expanded modes", () => {
    const { container } = render(<Sidebar />);
    const aside = container.querySelector("aside");
    expect(aside).not.toBeNull();

    // In desktop/default mode, width is 285px
    expect(aside?.style.width).toBe("285px");

    // Clicking collapse toggles to 72px rail mode
    const collapseBtn = screen.getByRole("button", { name: /collapse sidebar/i });
    fireEvent.click(collapseBtn);
    expect(aside?.style.width).toBe("72px");

    // Clicking expand toggles back to 285px
    const expandBtn = screen.getByRole("button", { name: /expand sidebar/i });
    fireEvent.click(expandBtn);
    expect(aside?.style.width).toBe("285px");
  });
});
