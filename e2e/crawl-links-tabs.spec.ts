import { test, expect, type Page } from "@playwright/test";

const PRIMARY_ROUTES = [
  "/",
  "/repositories",
  "/search-topics",
  "/guided-learning",
  "/concepts",
  "/mindmap",
  "/learning-paths",
  "/stages",
  "/sql",
  "/architecture",
  "/spark-engine",
  "/spark-catalyst",
  "/visualizer",
  "/code-practice",
  "/code-practice/databricks",
  "/whiteboards",
  "/modern-stack",
  "/dataops",
  "/cheat-sheet",
  "/qa-prep",
  "/company-research",
  "/studio",
  "/security",
];

const REDIRECT_CASES: Array<{ from: string; toPathname: string; toSearch?: string }> = [
  { from: "/blueprints", toPathname: "/whiteboards" },
  { from: "/repos", toPathname: "/repositories" },
  { from: "/deployments", toPathname: "/studio" },
  { from: "/learn", toPathname: "/guided-learning" },
  { from: "/plan", toPathname: "/guided-learning", toSearch: "tab=curricula" },
  { from: "/goal", toPathname: "/studio" },
  { from: "/boost", toPathname: "/qa-prep" },
  { from: "/browser", toPathname: "/search-topics" },
  { from: "/spark-engine/catalyst", toPathname: "/spark-catalyst" },
  { from: "/spark-visualizer", toPathname: "/visualizer" },
];

interface TabCase {
  url: string;
  expectedText: RegExp;
  forbiddenText?: RegExp;
}

const TAB_AND_VIEW_CASES: TabCase[] = [
  // /cheat-sheet
  {
    url: "/cheat-sheet?tab=databricks",
    expectedText: /All Databricks Coding Consolidated Under Single Subpage/i,
    forbiddenText: /Data Engineering Production Incident Runbooks/i,
  },
  {
    url: "/cheat-sheet?tab=runbooks",
    expectedText: /Data Engineering Production Incident Runbooks/i,
    forbiddenText: /All Databricks Coding Consolidated Under Single Subpage/i,
  },
  {
    url: "/cheat-sheet?tab=unknown_invalid_tab",
    expectedText: /Data Engineering Production Incident Runbooks/i,
  },

  // /architecture
  {
    url: "/architecture?tab=scenarios",
    expectedText: /System Design Framework/i,
  },
  {
    url: "/architecture?tab=diagrams",
    expectedText: /Showing 52 blueprints|Canvas View/i,
  },
  {
    url: "/architecture?tab=python",
    expectedText: /Showing \d+ of \d+ runbooks|Pure Python \/ AsyncIO/i,
  },
  {
    url: "/architecture?tab=polyglot",
    expectedText: /Cross-Engine Translation/i,
  },
  {
    url: "/architecture?tab=distributed",
    expectedText: /Production Distributed Scenarios/i,
  },
  {
    url: "/architecture?tab=unknown_invalid_tab",
    expectedText: /System Design Framework/i,
  },

  // /code-practice
  {
    url: "/code-practice?db=pyspark",
    expectedText: /PySpark 3\.4\+ \/ 4\.0/i,
  },
  {
    url: "/code-practice?db=sparksql",
    expectedText: /Spark SQL & Unity/i,
  },
  {
    url: "/code-practice?db=mssql",
    expectedText: /MS SQL \/ T-SQL/i,
  },
  {
    url: "/code-practice?db=python",
    expectedText: /Python \(Pandas & Polars\)/i,
  },
  {
    url: "/code-practice?tab=matrix",
    expectedText: /Polyglot Engine Translation Matrix/i,
  },
  {
    url: "/code-practice?tab=runbooks",
    expectedText: /Python Lakehouse & Architecture Runbooks/i,
  },
  {
    url: "/code-practice?tab=databricks",
    expectedText: /Databricks Polyglot Coding Hub/i,
  },
  {
    url: "/code-practice?tab=unknown_invalid_tab",
    expectedText: /PySpark 3\.4\+ \/ 4\.0/i,
  },

  // /code-practice/databricks
  {
    url: "/code-practice/databricks?view=manual",
    expectedText: /Databricks Data Intelligence Platform: End-to-End Technical Manual/i,
  },
  {
    url: "/code-practice/databricks?view=d100",
    expectedText: /Databricks 100/i,
  },
  {
    url: "/code-practice/databricks?view=bottlenecks",
    expectedText: /Driver OOM: Heap Space Exhaustion/i,
  },
  {
    url: "/code-practice/databricks?view=dbfs",
    expectedText: /Directory Listing with Metadata Extraction/i,
  },

  // /stages
  {
    url: "/stages?tab=mastery",
    expectedText: /The 4-Stage Architectural Mastery Journey/i,
  },
  {
    url: "/stages?tab=lakehouse",
    expectedText: /Enterprise Modern Lakehouse & AI Stack Flow/i,
  },
  {
    url: "/stages?tab=sdlc",
    expectedText: /The 6-Stage Enterprise Data Delivery Playbook/i,
  },
  {
    url: "/stages?tab=catalyst",
    expectedText: /The 5-Stage Apache Spark Catalyst Engine Pipeline/i,
  },
  {
    url: "/stages?tab=flows",
    expectedText: /8 Interactive Production Flow Diagrams/i,
  },
  {
    url: "/stages?tab=unknown_invalid_tab",
    expectedText: /The 4-Stage Architectural Mastery Journey/i,
  },

  // /sql
  {
    url: "/sql?tab=stepper",
    expectedText: /Logical Execution Order:/i,
  },
  {
    url: "/sql?tab=window",
    expectedText: /Window Function/i,
  },
  {
    url: "/sql?tab=rosetta",
    expectedText: /Rosetta/i,
  },
  {
    url: "/sql?tab=drills",
    expectedText: /Practice Drills/i,
  },
  {
    url: "/sql?tab=runbooks",
    expectedText: /Architecture & Runbooks/i,
  },
  {
    url: "/sql?tab=unknown_invalid_tab",
    expectedText: /Logical Execution Order:/i,
  },

  // /spark-engine
  {
    url: "/spark-engine?tab=simulator",
    expectedText: /Interactive Execution Simulator/i,
  },
  {
    url: "/spark-engine?tab=memory",
    expectedText: /JVM Executor Heap Allocation Breakdown/i,
  },
  {
    url: "/spark-engine?tab=curriculum",
    expectedText: /32-Level/i,
  },
  {
    url: "/spark-engine?tab=lexicon",
    expectedText: /Broadcast Hash Join/i,
  },

  // /spark-catalyst
  {
    url: "/spark-catalyst?tab=inspector",
    expectedText: /Fact-Dim Filter & Join/i,
  },
  {
    url: "/spark-catalyst?tab=tuning",
    expectedText: /AQE/i,
  },

  // /modern-stack
  {
    url: "/modern-stack?tab=compatibility",
    expectedText: /Databricks/i,
  },
  {
    url: "/modern-stack?tab=cost",
    expectedText: /FinOps/i,
  },
  {
    url: "/modern-stack?tab=simulators",
    expectedText: /Shuffle & Data Skew Sizer/i,
  },
  {
    url: "/modern-stack?tab=concepts",
    expectedText: /Lakehouse Primitives/i,
  },
  {
    url: "/modern-stack?tab=ai",
    expectedText: /Vector/i,
  },
  {
    url: "/modern-stack?tab=overview",
    expectedText: /Unified into the Architecture & Delivery Stages Hub/i,
  },
  {
    url: "/modern-stack?tab=matrix",
    expectedText: /Unified into Code Practice Hub/i,
  },

  // /dataops
  {
    url: "/dataops?tab=connectivity",
    expectedText: /Tool Connectivity & Secrets/i,
  },
  {
    url: "/dataops?tab=cicd",
    expectedText: /CI\/CD Alternatives & Pipelines/i,
  },
  {
    url: "/dataops?tab=lifecycle",
    expectedText: /Architecture Inception/i,
  },
  {
    url: "/dataops?tab=diagram",
    expectedText: /Visual Hierarchy/i,
  },
  {
    url: "/dataops?tab=unknown_invalid_tab",
    expectedText: /Tool Connectivity & Secrets/i,
  },

  {
    url: "/concepts",
    expectedText: /All Categories|Glossary|Concepts/i,
  },
  {
    url: "/concepts?view=study",
    expectedText: /Flashcard/i,
  },
  {
    url: "/concepts?tab=concepts",
    expectedText: /All Categories|Concepts/i,
  },

  // /guided-learning
  {
    url: "/guided-learning?tab=curricula",
    expectedText: /Curricula|Learning Path/i,
  },
  {
    url: "/guided-learning?tab=tree",
    expectedText: /Topic Tree|Dives/i,
  },
  {
    url: "/guided-learning?topic=spark",
    expectedText: /Apache Spark/i,
  },

  // /company-research
  {
    url: "/company-research?view=table",
    expectedText: /Target Company Intel/i,
  },
  {
    url: "/company-research?location=hyderabad",
    expectedText: /Hyderabad/i,
  },

  // /whiteboards
  {
    url: "/whiteboards?tab=diagrams",
    expectedText: /Whiteboard/i,
  },
];

function attachErrorListeners(page: Page) {
  const pageErrors: string[] = [];
  const hydrationErrors: string[] = [];

  page.on("pageerror", (err) => {
    pageErrors.push(err.message);
  });
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const text = msg.text();
      if (/hydration|did not match/i.test(text)) {
        hydrationErrors.push(text);
      }
    }
  });

  return { pageErrors, hydrationErrors };
}

test.describe("Site Link, Redirect, Tab & Navigation Crawl", () => {
  test("all primary routes return HTTP 200 without 404 or hydration errors", async ({ page }) => {
    const { pageErrors, hydrationErrors } = attachErrorListeners(page);

    for (const route of PRIMARY_ROUTES) {
      const response = await page.goto(route, { waitUntil: "domcontentloaded" });
      expect(response, `Expected response for ${route}`).not.toBeNull();
      expect(response!.status(), `Expected 200 for ${route}`).toBe(200);
      await expect(page.locator("#main-content")).toBeVisible();
      expect(await page.locator("main").count(), `Duplicate <main> on ${route}`).toBe(1);
      expect(await page.locator("h1").count(), `Multiple <h1> on ${route}`).toBeLessThanOrEqual(1);
      await expect(page.locator("body")).not.toContainText("This page could not be found");
    }

    expect(pageErrors, `Uncaught page errors: ${pageErrors.join("; ")}`).toEqual([]);
    expect(hydrationErrors, `Hydration errors: ${hydrationErrors.join("; ")}`).toEqual([]);
  });

  test("all legacy and orphan redirects resolve cleanly to canonical destinations", async ({ page }) => {
    for (const redir of REDIRECT_CASES) {
      const response = await page.goto(redir.from, { waitUntil: "domcontentloaded" });
      expect(response).not.toBeNull();
      expect(response!.status(), `Redirect ${redir.from} failed`).toBe(200);
      const finalUrl = new URL(page.url());
      expect(finalUrl.pathname, `Redirect ${redir.from} pathname mismatch`).toBe(redir.toPathname);
      if (redir.toSearch) {
        expect(finalUrl.search).toContain(redir.toSearch);
      }
    }
  });

  test("every ?tab=, ?view=, and ?db= route renders the matching view and handles unknown params", async ({ page }) => {
    const { pageErrors, hydrationErrors } = attachErrorListeners(page);

    for (const tc of TAB_AND_VIEW_CASES) {
      const response = await page.goto(tc.url, { waitUntil: "domcontentloaded" });
      expect(response, `Response missing for ${tc.url}`).not.toBeNull();
      expect(response!.status(), `Non-200 for ${tc.url}`).toBe(200);
      const main = page.locator("#main-content");
      await expect(main, `Missing expected content on ${tc.url}`).toContainText(tc.expectedText, {
        timeout: 10_000,
      });
      if (tc.forbiddenText) {
        await expect(main, `Wrong tab content leaked on ${tc.url}`).not.toContainText(tc.forbiddenText);
      }
    }

    expect(pageErrors, `Uncaught page errors on tab routes: ${pageErrors.join("; ")}`).toEqual([]);
    expect(hydrationErrors, `Hydration errors on tab routes: ${hydrationErrors.join("; ")}`).toEqual([]);
  });

  test("clicking tabs updates URL and supports browser Back/Forward", async ({ page }) => {
    // 1. Cheat sheet tab sync + Back/Forward
    await page.goto("/cheat-sheet", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /Databricks Cheat Sheets/i }).click();
    await expect(page).toHaveURL(/\/cheat-sheet\?tab=databricks/);
    await expect(page.locator("main")).toContainText(/All Databricks Coding Consolidated Under Single Subpage/i);

    await page.goBack({ waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/cheat-sheet$/);
    await expect(page.locator("main")).toContainText(/Data Engineering Production Incident Runbooks/i);

    await page.goForward({ waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/cheat-sheet\?tab=databricks/);
    await expect(page.locator("main")).toContainText(/All Databricks Coding Consolidated Under Single Subpage/i);

    // 2. Stages hub tab sync + Back/Forward
    await page.goto("/stages", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /7-Stage Lakehouse Flow/i }).click();
    await expect(page).toHaveURL(/\/stages\?tab=lakehouse/);
    await expect(page.locator("main")).toContainText(/Enterprise Modern Lakehouse & AI Stack Flow/i);

    await page.goBack({ waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/stages$/);
    await expect(page.locator("main")).toContainText(/The 4-Stage Architectural Mastery Journey/i);

    // 3. DataOps tab sync + Back/Forward
    await page.goto("/dataops", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /2\. CI\/CD Alternatives & Pipelines/i }).click();
    await expect(page).toHaveURL(/\/dataops\?tab=cicd/);
    await expect(page.locator("main")).toContainText(/CI\/CD/i);

    await page.goBack({ waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/dataops$/);
  });

  test("crawls all internal links rendered across key hubs with zero 404s and checks hash anchors", async ({ page, request }) => {
    const discoveredHrefs = new Set<string>();

    for (const seed of ["/", "/repositories", "/architecture", "/stages", "/sql", "/modern-stack", "/dataops", "/cheat-sheet", "/code-practice", "/studio"]) {
      await page.goto(seed, { waitUntil: "domcontentloaded" });
      const hrefs = await page.evaluate(() => {
        return Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href]"))
          .map((a) => a.getAttribute("href") || "")
          .filter((h) => h.startsWith("/") && !h.startsWith("//"));
      });
      for (const h of hrefs) {
        if (h.endsWith(".pdf") || h.startsWith("/api/download")) continue;
        discoveredHrefs.add(h);
      }
    }

    expect(discoveredHrefs.size).toBeGreaterThan(30);

    // Deduplicate by pathname+search (without hash) for HTTP check
    const uniqueTargets = new Set<string>();
    for (const h of discoveredHrefs) {
      uniqueTargets.add(h.split("#")[0] || "/");
    }

    for (const target of uniqueTargets) {
      const res = await request.get(target);
      expect(res.status(), `Broken internal link ${target} returned ${res.status()}`).toBeLessThan(400);
    }

    // Verify key hash anchors exist on their destination pages
    await page.goto("/studio#bookmarks", { waitUntil: "domcontentloaded" });
    await expect(page.locator("#bookmarks")).toBeVisible();

    await page.goto("/modern-stack#simulators", { waitUntil: "domcontentloaded" });
    await expect(page.locator("#simulators")).toBeVisible();
  });

  test("mobile navigation at 375px works cleanly without double-active Explore tab", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/code-practice", { waitUntil: "domcontentloaded" });

    const mobileNav = page.getByRole("navigation", { name: "Mobile Navigation" });
    await expect(mobileNav).toBeVisible();

    const practiseLink = mobileNav.getByRole("link", { name: /Practise/i });
    await expect(practiseLink).toHaveAttribute("aria-current", "page");

    const exploreBtn = mobileNav.getByRole("button", { name: /Open all modules menu/i });
    await expect(exploreBtn).not.toHaveClass(/text-blue-600/);

    await exploreBtn.click();
    const drawer = page.getByRole("dialog", { name: /Study Navigation Drawer/i });
    await expect(drawer).toBeVisible();
  });
});
