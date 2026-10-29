import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { CompanyResearchClient } from "@/app/company-research/company-research-client";
import { companyProfiles } from "@/data";

let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: vi.fn(),
    push: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => mockSearchParams,
  usePathname: () => "/company-research",
}));

describe("CompanyResearchClient UI & Compact Interactive Modes", () => {
  beforeEach(() => {
    mockSearchParams = new URLSearchParams();
    vi.clearAllMocks();
  });

  it("renders the compact command header, title, and live metrics ribbon", () => {
    render(<CompanyResearchClient initialProfiles={companyProfiles} />);

    expect(screen.getByText("Target Company Intel & Architectural Dossiers")).toBeDefined();
    expect(screen.getByText("156 Target Companies")).toBeDefined();
    expect(screen.getAllByText("156").length).toBeGreaterThan(0);
    expect(screen.getByText("Total")).toBeDefined();
    expect(screen.getByText("BigTech")).toBeDefined();
    expect(screen.getByText("FinTech")).toBeDefined();
    expect(screen.getByText("GCCs")).toBeDefined();
  });

  it("renders search input, hub dropdown, tier tabs, and view mode buttons", () => {
    render(<CompanyResearchClient initialProfiles={companyProfiles} />);

    // Search bar
    const searchInput = screen.getByPlaceholderText(/Search 156\+ companies/i);
    expect(searchInput).toBeDefined();

    // View mode buttons
    expect(screen.getByLabelText("Grid view")).toBeDefined();
    expect(screen.getByLabelText("Split view")).toBeDefined();
    expect(screen.getByLabelText("Table view")).toBeDefined();

    // Tier segmented tabs
    expect(screen.getAllByText("All Companies").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Tier 1 BigTech").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Tier 1 FinTech").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Enterprise GCCs").length).toBeGreaterThan(0);
  });

  it("renders compact cards in Grid View by default with dual salary benchmarks and archetype", () => {
    render(<CompanyResearchClient initialProfiles={companyProfiles} />);

    // Check first company
    const googleHeading = screen.getByText("Google (Alphabet)");
    expect(googleHeading).toBeDefined();

    // Salary badges
    const srDeTags = screen.getAllByText("Senior DE");
    expect(srDeTags.length).toBeGreaterThan(0);

    const archTags = screen.getAllByText("Principal Arch");
    expect(archTags.length).toBeGreaterThan(0);
  });

  it("toggles in-card tabs to reveal real prompts and interview focus without clutter", () => {
    render(<CompanyResearchClient initialProfiles={companyProfiles} />);

    // Find prompts toggle buttons
    const promptButtons = screen.getAllByRole("button", { name: /Prompts/i });
    expect(promptButtons.length).toBeGreaterThan(0);

    // Click the first prompt button to expand in-card prompt drawer
    fireEvent.click(promptButtons[0]);

    // Scenario Prompt label should now appear
    expect(screen.getAllByText(/Prompt #1/i).length).toBeGreaterThan(0);
  });

  it("switches to Master-Detail Split Workbench view smoothly", () => {
    render(<CompanyResearchClient initialProfiles={companyProfiles} />);

    // Switch to split view
    const splitButton = screen.getByLabelText("Split view");
    fireEvent.click(splitButton);

    // Left directory rail should appear
    expect(screen.getByText(/Directory \(/i)).toBeDefined();

    // Right detailed dossier should display the active company
    expect(screen.getByText("Target System Design Archetype")).toBeDefined();
    expect(screen.getByText("Core Engineering & Scale Bottleneck:")).toBeDefined();
  });

  it("switches to Dense Comparison Table view with sortable columns", () => {
    render(<CompanyResearchClient initialProfiles={companyProfiles} />);

    // Switch to table view
    const tableButton = screen.getByLabelText("Table view");
    fireEvent.click(tableButton);

    // Table headers
    expect(screen.getByText("Company")).toBeDefined();
    expect(screen.getByText("GCC Hubs")).toBeDefined();
    expect(screen.getByText("Tech Stack")).toBeDefined();
    expect(screen.getByText("Senior DE Band")).toBeDefined();
    expect(screen.getByText("Principal Architect Band")).toBeDefined();
  });

  it("filters companies when clicking a tier tab", () => {
    render(<CompanyResearchClient initialProfiles={companyProfiles} />);

    // Click BigTech button
    const bigTechButtons = screen.getAllByRole("button", { name: /Tier 1 BigTech/i });
    expect(bigTechButtons.length).toBeGreaterThan(0);
    fireEvent.click(bigTechButtons[0]);

    // Filter count should update to 52
    expect(screen.getAllByText("52").length).toBeGreaterThan(0);
  });

  it("searches companies dynamically by keyword", () => {
    render(<CompanyResearchClient initialProfiles={companyProfiles} />);

    const searchInput = screen.getByPlaceholderText(/Search 156\+ companies/i);
    fireEvent.change(searchInput, { target: { value: "Spanner" } });

    // Should match Google
    expect(screen.getByText("Google (Alphabet)")).toBeDefined();
  });

  it("opens full dossier modal when clicking inspect on a card and closes on Escape", () => {
    render(<CompanyResearchClient initialProfiles={companyProfiles} />);

    const inspectButtons = screen.getAllByTitle("Inspect Full Engineering Dossier");
    expect(inspectButtons.length).toBeGreaterThan(0);

    fireEvent.click(inspectButtons[0]);

    // Modal should be open
    expect(screen.getByText("Press Esc to close")).toBeDefined();

    // Press Escape
    fireEvent.keyDown(window, { key: "Escape" });

    // Modal should close
    expect(screen.queryByText("Press Esc to close")).toBeNull();
  });
});
