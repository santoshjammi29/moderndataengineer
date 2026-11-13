import { describe, it, expect, vi, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { StagesClient } from "@/app/stages/stages-client";
import { CodePracticeClient } from "@/app/code-practice/code-practice-client";
import { ModernStackClient } from "@/app/modern-stack/modern-stack-client";
import nextConfig from "../../next.config";
import {
  NAV_GROUPS,
  ALL_FLAT_PAGES_AND_SUBPAGES,
  isSubHrefActive,
} from "@/data/navigation-data";
import {
  pysparkData,
  sparksqlData,
  mssqlData,
  pythonData,
  databricksCheatsheetData,
  databricks100Data,
} from "@/data";

// Mocks
let mockSearchParams = new URLSearchParams();
let mockPathname = "/stages";

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

afterEach(() => {
  cleanup();
});

describe("Consolidated Stages, Code Practice, and Clubbed Redirects Verification", () => {
  describe("1. Unified Stages Hub (/stages)", () => {
    it("is cataloged in NAV_GROUPS and ALL_FLAT_PAGES_AND_SUBPAGES", () => {
      const stagesNav = NAV_GROUPS.flatMap((g) => g.items).find(
        (i) => i.href === "/stages"
      );
      expect(stagesNav).toBeDefined();
      expect(stagesNav?.label).toBe("Mastery Stages Hub");
      expect(stagesNav?.subItems?.length).toBe(5);

      const stagesFlat = ALL_FLAT_PAGES_AND_SUBPAGES.find(
        (p) => p.href === "/stages"
      );
      expect(stagesFlat).toBeDefined();
      expect(stagesFlat?.category).toBe("Learn");
    });

    it("defaults to mastery tab when search params are empty on /stages", () => {
      expect(isSubHrefActive("/stages", new URLSearchParams(), "/stages?tab=mastery")).toBe(true);
      expect(isSubHrefActive("/stages", new URLSearchParams("tab=lakehouse"), "/stages?tab=mastery")).toBe(false);
    });

    it("renders StagesClient with all 5 lifecycle and progression tabs", () => {
      mockPathname = "/stages";
      mockSearchParams = new URLSearchParams();

      render(<StagesClient />);

      // Main header and badges
      expect(screen.getByRole("heading", { level: 1, name: /Mastery Stages & Systems Lifecycle/i })).toBeDefined();
      expect(screen.getByText(/Unified Architecture & Delivery Stages Hub/i)).toBeDefined();

      // Navigation tab buttons
      expect(screen.getByRole("button", { name: /4-Stage Mastery Journey/i })).toBeDefined();
      expect(screen.getByRole("button", { name: /7-Stage Lakehouse Flow/i })).toBeDefined();
      expect(screen.getByRole("button", { name: /6-Stage SDLC Playbook/i })).toBeDefined();
      expect(screen.getByRole("button", { name: /5-Stage Catalyst Pipeline/i })).toBeDefined();
      expect(screen.getByRole("button", { name: /8 Interactive Production Flows/i })).toBeDefined();

      // Mastery Tab Content
      expect(screen.getByText(/The 4-Stage Architectural Mastery Journey/i)).toBeDefined();
      expect(screen.getByText(/Foundations & Open Formats/i)).toBeDefined();
      expect(screen.getByText(/Staff & Principal Lakehouse Architect/i)).toBeDefined();
    });

    it("switches to 7-Stage Modern Lakehouse & AI Stack tab", () => {
      mockPathname = "/stages";
      mockSearchParams = new URLSearchParams();

      render(<StagesClient />);

      const lakehouseBtn = screen.getByRole("button", { name: /7-Stage Lakehouse Flow/i });
      fireEvent.click(lakehouseBtn);

      expect(screen.getByText(/Enterprise Modern Lakehouse & AI Stack Flow/i)).toBeDefined();
      expect(screen.getByText(/Stage 1: Real-Time & Event-Driven Ingestion/i)).toBeDefined();
      expect(screen.getByText("FinOps")).toBeDefined();
    });

    it("switches to 6-Stage Enterprise SDLC tab", () => {
      mockPathname = "/stages";
      mockSearchParams = new URLSearchParams();

      render(<StagesClient />);

      const sdlcBtn = screen.getByRole("button", { name: /6-Stage SDLC Playbook/i });
      fireEvent.click(sdlcBtn);

      expect(screen.getByText(/The 6-Stage Enterprise Data Delivery Playbook/i)).toBeDefined();
      expect(screen.getByText(/Product Discovery & Work Shaping/i)).toBeDefined();
      expect(screen.getAllByText(/SRE Observability/i).length).toBeGreaterThanOrEqual(1);
    });

    it("switches to 5-Stage Spark Catalyst Engine tab", () => {
      mockPathname = "/stages";
      mockSearchParams = new URLSearchParams();

      render(<StagesClient />);

      const catalystBtn = screen.getByRole("button", { name: /5-Stage Catalyst Pipeline/i });
      fireEvent.click(catalystBtn);

      expect(screen.getByText(/The 5-Stage Apache Spark Catalyst Engine Pipeline/i)).toBeDefined();
      expect(screen.getAllByText(/Analysis & Catalog Resolution/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Whole-Stage Code Generation/i).length).toBeGreaterThanOrEqual(1);
    });

    it("switches to Interactive Production Flows tab", () => {
      mockPathname = "/stages";
      mockSearchParams = new URLSearchParams();

      render(<StagesClient />);

      const flowsBtn = screen.getByRole("button", { name: /8 Interactive Production Flows/i });
      fireEvent.click(flowsBtn);

      expect(screen.getByText(/8 Interactive Production Flow Diagrams/i)).toBeDefined();
      expect(screen.getByRole("button", { name: /Mastery Roadmap Flow/i })).toBeDefined();
      expect(screen.getByRole("button", { name: /Lakehouse Medallion Flow/i })).toBeDefined();
      expect(screen.getByRole("button", { name: /Optimization Flow/i })).toBeDefined();
    });
  });

  describe("2. Cloud Platforms & Engine Matrix Reorganization (/modern-stack)", () => {
    it("renders page header as 'Cloud Platforms & Engine Matrix'", () => {
      render(
        <ModernStackClient
          initialModernStack={{
            stack: [],
            blueprints: [],
            matrix: [],
            costPlaybooks: [],
            concepts: [],
            subdomains: [],
          }}
          initialPython={[]}
        />
      );

      expect(screen.getByRole("heading", { level: 1, name: /Cloud Platforms & Engine Matrix/i })).toBeDefined();
      expect(screen.getAllByText(/10 Engines/i).length).toBeGreaterThanOrEqual(1);
    });

    it("provides clean migration banner on overview tab directing users to /stages", () => {
      render(
        <ModernStackClient
          initialModernStack={{
            stack: [],
            blueprints: [],
            matrix: [],
            costPlaybooks: [],
            concepts: [],
            subdomains: [],
          }}
          initialPython={[]}
        />
      );

      const overviewBtn = screen.getByRole("button", { name: /Hub Overview/i });
      fireEvent.click(overviewBtn);

      expect(
        screen.getByText(/Unified into the Architecture & Delivery Stages Hub/i)
      ).toBeDefined();
      expect(screen.getByRole("link", { name: /Open in Stages Hub/i })).toBeDefined();
    });

    it("provides clean migration banner on matrix tab directing users to /code-practice", () => {
      render(
        <ModernStackClient
          initialModernStack={{
            stack: [],
            blueprints: [],
            matrix: [],
            costPlaybooks: [],
            concepts: [],
            subdomains: [],
          }}
          initialPython={[]}
        />
      );

      const matrixBtn = screen.getByRole("button", { name: /Polyglot Matrix/i });
      fireEvent.click(matrixBtn);

      expect(
        screen.getByText(/Unified into Code Practice Hub/i)
      ).toBeDefined();
      expect(screen.getByRole("link", { name: /Open in Code Practice/i })).toBeDefined();
    });
  });

  describe("3. Unified Code Practice Hub (/code-practice)", () => {
    it("renders all 4 tabs: Interactive Drills, Databricks, Polyglot Matrix, and Python Runbooks", () => {
      mockPathname = "/code-practice";
      mockSearchParams = new URLSearchParams();

      render(
        <CodePracticeClient
          initialData={{
            pyspark: pysparkData,
            sparksql: sparksqlData,
            mssql: mssqlData,
            python: pythonData,
          }}
          initialDatabricksSuite={databricksCheatsheetData}
          initialDatabricks100={databricks100Data}
        />
      );

      expect(screen.getByRole("heading", { level: 1, name: /Interactive Code Practice & Production Runbooks/i })).toBeDefined();
      expect(screen.getByText("Unified Code Practice & Runbooks Hub")).toBeDefined();
      expect(screen.getByRole("button", { name: /Interactive Drills/i })).toBeDefined();
      expect(screen.getByRole("button", { name: /Databricks Coding Hub/i })).toBeDefined();
      expect(screen.getByRole("button", { name: /Polyglot Translation Matrix/i })).toBeDefined();
      expect(screen.getByRole("button", { name: /Python & Lakehouse Runbooks/i })).toBeDefined();
    });

    it("switches to Databricks Hub tab and shows Databricks coding operations", () => {
      mockPathname = "/code-practice";
      mockSearchParams = new URLSearchParams();

      render(
        <CodePracticeClient
          initialData={{
            pyspark: pysparkData,
            sparksql: sparksqlData,
            mssql: mssqlData,
            python: pythonData,
          }}
          initialDatabricksSuite={databricksCheatsheetData}
          initialDatabricks100={databricks100Data}
        />
      );

      const dbxTabBtn = screen.getByRole("button", { name: /Databricks Coding Hub/i });
      fireEvent.click(dbxTabBtn);

      expect(screen.getByText("Databricks Polyglot Coding Hub")).toBeDefined();
      expect(screen.getByText(/48 Cheatsheet Cards/i)).toBeDefined();
      expect(screen.getByText(/100 Architecture Ops/i)).toBeDefined();
    });

    it("switches to Polyglot Matrix tab and shows multi-engine code comparisons", () => {
      mockPathname = "/code-practice";
      mockSearchParams = new URLSearchParams();

      render(
        <CodePracticeClient
          initialData={{
            pyspark: pysparkData,
            sparksql: sparksqlData,
            mssql: mssqlData,
            python: pythonData,
          }}
          initialDatabricksSuite={databricksCheatsheetData}
          initialDatabricks100={databricks100Data}
        />
      );

      const matrixTabBtn = screen.getByRole("button", { name: /Polyglot Translation Matrix/i });
      fireEvent.click(matrixTabBtn);

      expect(screen.getByText(/Polyglot Engine Translation Matrix/i)).toBeDefined();
      expect(screen.getByText(/Side-by-Side \(3-Engine\)/i)).toBeDefined();
    });

    it("switches to Python Runbooks tab and displays architecture runbooks", () => {
      mockPathname = "/code-practice";
      mockSearchParams = new URLSearchParams();

      render(
        <CodePracticeClient
          initialData={{
            pyspark: pysparkData,
            sparksql: sparksqlData,
            mssql: mssqlData,
            python: pythonData,
          }}
          initialDatabricksSuite={databricksCheatsheetData}
          initialDatabricks100={databricks100Data}
        />
      );

      const runbooksTabBtn = screen.getByRole("button", { name: /Python & Lakehouse Runbooks/i });
      fireEvent.click(runbooksTabBtn);

      expect(screen.getByText(/Python Lakehouse & Architecture Runbooks/i)).toBeDefined();
      expect(screen.getByPlaceholderText(/Search Python runbooks/i)).toBeDefined();
    });
  });

  describe("4. Redirects & Clubbed Pages Integrity (/plan, /goal, /learn, /boost, /browser)", () => {
    it("configures next.config.ts permanent redirects for all clubbed routes", async () => {
      const redirectsFn = typeof nextConfig.redirects === "function" ? nextConfig.redirects : async () => [];
      const redirects = (await redirectsFn()) as Array<{ source: string; destination: string; permanent?: boolean }>;

      const redirectSources = redirects.map((r) => ({
        source: r.source,
        destination: r.destination,
        permanent: r.permanent,
      }));

      // Check /plan -> /guided-learning?tab=curricula
      const planRedirect = redirectSources.find((r) => r.source === "/plan");
      expect(planRedirect).toBeDefined();
      expect(planRedirect?.destination).toBe("/guided-learning?tab=curricula");
      expect(planRedirect?.permanent).toBe(true);

      // Check /goal -> /studio
      const goalRedirect = redirectSources.find((r) => r.source === "/goal");
      expect(goalRedirect).toBeDefined();
      expect(goalRedirect?.destination).toBe("/studio");
      expect(goalRedirect?.permanent).toBe(true);

      // Check /learn -> /guided-learning
      const learnRedirect = redirectSources.find((r) => r.source === "/learn");
      expect(learnRedirect).toBeDefined();
      expect(learnRedirect?.destination).toBe("/guided-learning");
      expect(learnRedirect?.permanent).toBe(true);

      // Check /boost -> /qa-prep
      const boostRedirect = redirectSources.find((r) => r.source === "/boost");
      expect(boostRedirect).toBeDefined();
      expect(boostRedirect?.destination).toBe("/qa-prep");
      expect(boostRedirect?.permanent).toBe(true);

      // Check /browser -> /search-topics
      const browserRedirect = redirectSources.find((r) => r.source === "/browser");
      expect(browserRedirect).toBeDefined();
      expect(browserRedirect?.destination).toBe("/search-topics");
      expect(browserRedirect?.permanent).toBe(true);
    });
  });
});
