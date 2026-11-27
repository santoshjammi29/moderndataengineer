import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { resolveQueryParam, pushUrlQuery } from "@/lib/url-tab-sync";
import { CheatSheetClient } from "@/app/cheat-sheet/cheat-sheet-client";
import { DataOpsClient } from "@/app/dataops/dataops-client";
import { cheatsheetData, databricksCheatsheetData, dataOpsData } from "@/data";
import nextConfig from "../../next.config";

let mockSearchParams = new URLSearchParams();
let mockPathname = "/cheat-sheet";

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

beforeEach(() => {
  mockSearchParams = new URLSearchParams();
  mockPathname = "/cheat-sheet";
  window.history.replaceState(null, "", "/cheat-sheet");
});

afterEach(() => {
  cleanup();
});

describe("URL Tab Sync, Initial Hydration & Redirect Alignment", () => {
  it("resolveQueryParam handles valid, aliased, missing, and unknown values cleanly", () => {
    const valid = ["runbooks", "databricks"] as const;
    expect(resolveQueryParam(new URLSearchParams("tab=databricks"), "tab", valid, "runbooks")).toBe("databricks");
    expect(resolveQueryParam(new URLSearchParams("tab=DATABRICKS"), "tab", valid, "runbooks")).toBe("databricks");
    expect(resolveQueryParam(new URLSearchParams("tab=unknown"), "tab", valid, "runbooks")).toBe("runbooks");
    expect(resolveQueryParam(new URLSearchParams(""), "tab", valid, "runbooks")).toBe("runbooks");
  });

  it("pushUrlQuery pushes new history entry only when URL changes", () => {
    const pushSpy = vi.spyOn(window.history, "pushState");
    window.history.replaceState(null, "", "/cheat-sheet?tab=runbooks");
    pushUrlQuery((p) => p.set("tab", "databricks"));
    expect(pushSpy).toHaveBeenCalledTimes(1);
    expect(pushSpy.mock.calls[0][2]).toBe("/cheat-sheet?tab=databricks");

    // Calling again with same state should not push a duplicate entry
    pushUrlQuery((p) => p.set("tab", "databricks"));
    expect(pushSpy).toHaveBeenCalledTimes(1);
    pushSpy.mockRestore();
  });

  it("renders Databricks view immediately on /cheat-sheet?tab=databricks without Runbooks flash", () => {
    mockPathname = "/cheat-sheet";
    mockSearchParams = new URLSearchParams("tab=databricks");

    render(<CheatSheetClient initialData={cheatsheetData} databricksData={databricksCheatsheetData} />);

    expect(
      screen.getByText(/All Databricks Coding Consolidated Under Single Subpage/i)
    ).toBeDefined();
    expect(screen.queryByText(/Data Engineering Production Incident Runbooks/i)).toBeNull();
  });

  it("falls back cleanly to default tab for unknown ?tab= values on /cheat-sheet and /dataops", () => {
    mockPathname = "/cheat-sheet";
    mockSearchParams = new URLSearchParams("tab=nonexistent");

    const { unmount } = render(
      <CheatSheetClient initialData={cheatsheetData} databricksData={databricksCheatsheetData} />
    );
    expect(screen.getByText(/Data Engineering Production Incident Runbooks/i)).toBeDefined();
    unmount();

    mockPathname = "/dataops";
    mockSearchParams = new URLSearchParams("tab=invalid-tab");
    render(<DataOpsClient initialData={dataOpsData} />);
    expect(screen.getAllByText(/ADF/i).length).toBeGreaterThan(0);
  });

  it("updates URL via pushState when switching tabs on /cheat-sheet", () => {
    mockPathname = "/cheat-sheet";
    mockSearchParams = new URLSearchParams();
    window.history.replaceState(null, "", "/cheat-sheet");
    const pushSpy = vi.spyOn(window.history, "pushState");

    render(<CheatSheetClient initialData={cheatsheetData} databricksData={databricksCheatsheetData} />);
    fireEvent.click(screen.getByRole("button", { name: /Databricks Cheat Sheets/i }));

    expect(pushSpy).toHaveBeenCalled();
    expect(pushSpy.mock.calls[0][2]).toBe("/cheat-sheet?tab=databricks");
    pushSpy.mockRestore();
  });

  it("aligns next.config.ts redirects for /blueprints, /repos, /deployments, /spark-engine/catalyst, and /spark-visualizer", async () => {
    const redirectsFn = typeof nextConfig.redirects === "function" ? nextConfig.redirects : async () => [];
    const redirects = (await redirectsFn()) as Array<{ source: string; destination: string; permanent?: boolean }>;
    const bySource = new Map(redirects.map((r) => [r.source, r]));

    expect(bySource.get("/blueprints")?.destination).toBe("/whiteboards");
    expect(bySource.get("/blueprints")?.permanent).toBe(true);
    expect(bySource.get("/repos")?.destination).toBe("/repositories");
    expect(bySource.get("/repos")?.permanent).toBe(true);
    expect(bySource.get("/deployments")?.destination).toBe("/studio");
    expect(bySource.get("/deployments")?.permanent).toBe(true);
    expect(bySource.get("/spark-engine/catalyst")?.destination).toBe("/spark-catalyst");
    expect(bySource.get("/spark-visualizer")?.destination).toBe("/visualizer");
  });
});
