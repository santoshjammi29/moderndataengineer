import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  WHITEBOARD_CATEGORIES,
  TOTAL_WHITEBOARDS_COUNT,
  TOTAL_CATEGORIES_COUNT,
  getCategoryById,
  getAdjacentCategories,
} from "@/data/whiteboards-learning-data";
import { architectureDiagrams } from "@/data/diagrams";
import { WhiteboardsClient } from "@/app/whiteboards/whiteboards-client";

// Mock next/navigation
const mockReplace = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: (url: string) => {
      mockReplace(url);
      const query = url.split("?")[1] || "";
      mockSearchParams = new URLSearchParams(query);
    },
    push: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => mockSearchParams,
  usePathname: () => "/whiteboards",
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe("Whiteboard Learning Data & Architecture", () => {
  it("contains exactly 7 Master Architectural Categories", () => {
    expect(WHITEBOARD_CATEGORIES.length).toBe(7);
    expect(TOTAL_CATEGORIES_COUNT).toBe(7);
  });

  it("covers all 42 whiteboard architecture diagrams across categories", () => {
    expect(TOTAL_WHITEBOARDS_COUNT).toBe(42);
    expect(architectureDiagrams.length).toBe(42);

    const mappedDiagramIds = new Set<string>();
    WHITEBOARD_CATEGORIES.forEach((cat) => {
      cat.diagrams.forEach((d) => mappedDiagramIds.add(d.id));
    });

    expect(mappedDiagramIds.size).toBe(42);
    architectureDiagrams.forEach((diagram) => {
      expect(mappedDiagramIds.has(diagram.id)).toBe(true);
    });
  });

  it("every category has complete metadata, overview, and milestones", () => {
    WHITEBOARD_CATEGORIES.forEach((cat) => {
      expect(cat.id).toBeDefined();
      expect(cat.title.length).toBeGreaterThan(3);
      expect(cat.shortTitle.length).toBeGreaterThan(1);
      expect(cat.tagline.length).toBeGreaterThan(10);
      expect(cat.overview.length).toBeGreaterThan(50);
      expect(cat.learningMilestones.length).toBeGreaterThanOrEqual(4);
      expect(cat.diagrams.length).toBeGreaterThanOrEqual(2);
      expect(cat.concepts.length).toBeGreaterThanOrEqual(15);
      expect(cat.questions.length).toBeGreaterThanOrEqual(20);
      expect(cat.blueprints.length + cat.scenarios.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("getCategoryById retrieves the expected category", () => {
    const compute = getCategoryById("compute-optimization");
    expect(compute).toBeDefined();
    expect(compute?.title).toBe("Compute & Optimization");
    expect(compute?.diagrams.length).toBe(11);

    const storage = getCategoryById("storage-engine");
    expect(storage).toBeDefined();
    expect(storage?.diagrams.length).toBe(8);

    const fabric = getCategoryById("fabric-powerbi");
    expect(fabric).toBeDefined();
    expect(fabric?.diagrams.length).toBe(4);
  });

  it("getAdjacentCategories cycles circularly through categories", () => {
    const firstCat = WHITEBOARD_CATEGORIES[0];
    const { prev, next } = getAdjacentCategories(firstCat.id);

    expect(prev.id).toBe(WHITEBOARD_CATEGORIES[WHITEBOARD_CATEGORIES.length - 1].id);
    expect(next.id).toBe(WHITEBOARD_CATEGORIES[1].id);
  });
});

describe("WhiteboardsClient Interactive Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(HTMLElement.prototype, "clientHeight", { configurable: true, value: 300 });
    Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, value: 500 });
  });

  it("renders the main title, metrics ribbon, and category stepper", () => {
    render(<WhiteboardsClient />);

    expect(screen.getByText("Architecture Whiteboards Mastery Hub")).toBeDefined();
    expect(screen.getByText("Digital Whiteboards")).toBeDefined();
    expect(screen.getAllByText("Core Concepts").length).toBeGreaterThan(0);
    expect(screen.getByText("Architect Drills")).toBeDefined();
    expect(screen.getAllByText("System Designs").length).toBeGreaterThan(0);
  });

  it("renders all 7 category navigation pills", () => {
    render(<WhiteboardsClient />);

    WHITEBOARD_CATEGORIES.forEach((cat) => {
      const elements = screen.getAllByText(cat.shortTitle);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  it("switches view tabs when clicked", () => {
    render(<WhiteboardsClient />);

    // Click Whiteboard Diagrams tab
    const diagramsTab = screen.getByRole("button", { name: /Whiteboard Diagrams/i });
    fireEvent.click(diagramsTab);

    expect(screen.getByText(/Showing.*Whiteboard Blueprints/i)).toBeDefined();

    // Click Core Concepts tab
    const conceptsTab = screen.getByRole("button", { name: /Core Concepts/i });
    fireEvent.click(conceptsTab);

    expect(screen.getByText(/Architectural Concepts & Definitions/i)).toBeDefined();

    // Click System Blueprints tab
    const blueprintsTab = screen.getByRole("button", { name: /System Blueprints/i });
    fireEvent.click(blueprintsTab);

    expect(screen.getByText(/Production Architecture Blueprints/i)).toBeDefined();

    // Click Technical Q&A tab
    const qaTab = screen.getByRole("button", { name: /Technical Q&A/i });
    fireEvent.click(qaTab);

    expect(screen.getByText(/Practice Questions & Architectural Answers/i)).toBeDefined();
  });

  it("switches categories when a category button is clicked", () => {
    render(<WhiteboardsClient />);

    // Click category pill for Storage in the navigation bar
    const storageText = screen.getAllByText("Storage")[0];
    const storageBtn = storageText.closest("button");
    expect(storageBtn).not.toBeNull();
    fireEvent.click(storageBtn!);

    expect(screen.getByText("Storage Engines & Table Formats")).toBeDefined();
  });

  it("filters content when searching in the search box", () => {
    render(<WhiteboardsClient />);

    // Switch to concepts tab
    const conceptsTab = screen.getByRole("button", { name: /Core Concepts/i });
    fireEvent.click(conceptsTab);

    const searchInput = screen.getByPlaceholderText("Filter current category...");
    fireEvent.change(searchInput, { target: { value: "Catalyst" } });

    // Should find Catalyst Optimizer
    expect(screen.getAllByText(/Catalyst/i).length).toBeGreaterThan(0);
  });
});
