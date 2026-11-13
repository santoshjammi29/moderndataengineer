import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { architectureDiagrams } from "@/data/diagrams";
import { getLearningJourney, STAGE_METADATA } from "@/data/learning-journeys";
import { LearningJourneyViewer } from "@/components/architecture/learning-journey-viewer";
import { JourneyStageId } from "@/types/learning-journey";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe("8-Stage Learning Journey Data & Generator Verification", () => {
  const STAGES: JourneyStageId[] = [
    "map",
    "predict",
    "inspect",
    "experiment",
    "break",
    "diagnose",
    "explain",
    "operate",
  ];

  it("verifies STAGE_METADATA covers all 8 stages in correct order", () => {
    expect(Object.keys(STAGE_METADATA).length).toBe(8);
    STAGES.forEach((stageId, idx) => {
      expect(STAGE_METADATA[stageId].order).toBe(idx + 1);
      expect(STAGE_METADATA[stageId].name.length).toBeGreaterThan(0);
      expect(STAGE_METADATA[stageId].tagline.length).toBeGreaterThan(0);
    });
  });

  it("guarantees 100% of all 52 architecture diagrams generate a complete 8-stage learning journey", () => {
    expect(architectureDiagrams.length).toBe(52);

    architectureDiagrams.forEach((diagram) => {
      const journey = getLearningJourney(diagram);

      expect(journey.diagramId).toBe(diagram.id);
      expect(journey.title.length).toBeGreaterThan(0);
      expect(journey.targetOutcome.length).toBeGreaterThan(15);
      expect(journey.estimatedMinutes).toBeGreaterThanOrEqual(15);
      expect(journey.prerequisites.length).toBeGreaterThan(0);

      // Verify every single stage is populated
      STAGES.forEach((stageId) => {
        const stageData = journey.stages[stageId];
        expect(stageData, `Missing stageData for ${diagram.id}:${stageId}`).toBeDefined();
        expect(stageData.stage).toBe(stageId);
        expect(stageData.name).toBe(STAGE_METADATA[stageId].name);
        expect(stageData.summary.length).toBeGreaterThan(10);
        expect(stageData.keyPoints.length).toBeGreaterThan(0);
      });
    });
  });

  it("verifies the Pilot Blueprint (spark-data-skew-aqe-optimization) has rich bespoke data", () => {
    const skewDiagram = architectureDiagrams.find((d) => d.id === "spark-data-skew-aqe-optimization");
    expect(skewDiagram).toBeDefined();

    const journey = getLearningJourney(skewDiagram!);
    expect(journey.stages.predict.predictionOptions?.length).toBe(3);

    // Predict stage contains correct answer
    const correctOpt = journey.stages.predict.predictionOptions?.find((o) => o.isCorrect);
    expect(correctOpt).toBeDefined();
    expect(correctOpt?.label).toContain("straggler");

    // Inspect stage contains plan
    expect(journey.stages.inspect.codeOrPlanSnippet).toContain("SortMergeJoin");

    // Experiment stage has simulator and notebook links
    expect(journey.stages.experiment.simulatorUrl).toBe("/modern-stack#simulators");
    expect(journey.stages.experiment.notebookUrl).toContain("3_solving_data_skew_aqe_broadcast.ipynb");

    // Break stage contains failure exception
    expect(journey.stages.break.failureScenario).toBeDefined();
    expect(journey.stages.break.symptoms?.length).toBeGreaterThan(0);

    // Diagnose stage contains observable telemetry comparison
    expect(journey.stages.diagnose.observableMetrics?.length).toBeGreaterThanOrEqual(3);
    const taskDurationRow = journey.stages.diagnose.observableMetrics?.find((m) => m.metric.includes("Duration"));
    expect(taskDurationRow?.brokenObserved).toContain("11.32");

    // Explain stage contains formula
    expect(journey.stages.explain.formulaTitle).toContain("Salting");
    expect(journey.stages.explain.formulaTex).toContain("17,539,732");

    // Operate stage contains production configs
    expect(journey.stages.operate.productionConfigs?.length).toBeGreaterThanOrEqual(4);
    const skewJoinCfg = journey.stages.operate.productionConfigs?.find((c) =>
      c.parameter.includes("skewJoin.enabled")
    );
    expect(skewJoinCfg?.recommendedValue).toBe("true");
  });
});

describe("LearningJourneyViewer Interactive Component Verification", () => {
  const mockDiagram = architectureDiagrams.find((d) => d.id === "spark-data-skew-aqe-optimization")!;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the 8-stage stepper buttons with correct initial active state", () => {
    render(<LearningJourneyViewer diagram={mockDiagram} />);

    expect(screen.getByText("8-Stage Learning Journey")).toBeDefined();
    expect(screen.getByText("Map")).toBeDefined();
    expect(screen.getByText("Predict")).toBeDefined();
    expect(screen.getByText("Inspect")).toBeDefined();
    expect(screen.getByText("Experiment")).toBeDefined();
    expect(screen.getByText("Break")).toBeDefined();
    expect(screen.getByText("Diagnose")).toBeDefined();
    expect(screen.getByText("Explain")).toBeDefined();
    expect(screen.getByText("Operate")).toBeDefined();

    // Stage 1 (Map) is active by default
    const mapTab = screen.getByRole("tab", { name: /1.*Map/i });
    expect(mapTab.getAttribute("aria-selected")).toBe("true");
  });

  it("navigates forward through stages when clicking Next", () => {
    render(<LearningJourneyViewer diagram={mockDiagram} />);

    const nextBtn = screen.getByRole("button", { name: /Next: Predict/i });
    fireEvent.click(nextBtn);

    // Predict stage should now be active
    const predictTab = screen.getByRole("tab", { name: /2.*Predict/i });
    expect(predictTab.getAttribute("aria-selected")).toBe("true");
    expect(screen.getByText(/Hypothesis Challenge/i)).toBeDefined();
  });

  it("handles prediction challenge click and reveals feedback explanation", () => {
    render(<LearningJourneyViewer diagram={mockDiagram} initialStage="predict" />);

    // Click the straggler option
    const correctBtn = screen.getByText(/3 tasks finish in < 2 seconds, while 1 straggler/i);
    fireEvent.click(correctBtn);

    // Feedback explanation should appear
    expect(screen.getByText(/Because hash\('C0YDPQWPBJ'\) % 4 lands entirely on Partition 0/i)).toBeDefined();
  });

  it("renders the Diagnose telemetry table comparing Normal vs Broken metrics", () => {
    render(<LearningJourneyViewer diagram={mockDiagram} initialStage="diagnose" />);

    expect(screen.getByText("Observable Telemetry & Metrics Comparison Table")).toBeDefined();
    expect(screen.getByText("Max Task Duration")).toBeDefined();
    expect(screen.getByText("11.32 seconds (5.4x)")).toBeDefined();
    expect(screen.getByText("782 MB (4,344x)")).toBeDefined();
  });

  it("renders the Operate production configs table with copyable keys", () => {
    render(<LearningJourneyViewer diagram={mockDiagram} initialStage="operate" />);

    expect(screen.getByText("Production Configuration Guardrails")).toBeDefined();
    expect(screen.getByText("spark.sql.adaptive.skewJoin.enabled")).toBeDefined();
    expect(screen.getByText("spark.sql.adaptive.enabled")).toBeDefined();
  });
});
