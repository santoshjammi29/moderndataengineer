import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { InteractiveFlowDiagram, FlowStage } from "@/components/ui/interactive-flow-diagram";
import { LakehouseMedallionFlow } from "@/components/concepts/lakehouse-medallion-flow";
import { SystemDesignFlow } from "@/components/architecture/system-design-flow";
import { SdlcPipelineFlow } from "@/components/dataops/sdlc-pipeline-flow";
import { InterviewDefenseFlow } from "@/components/qa-prep/interview-defense-flow";
import { EnterpriseStackFlow } from "@/components/company-research/enterprise-stack-flow";
import { MasteryRoadmapFlow } from "@/components/guided-learning/mastery-roadmap-flow";
import { PipelineExecutionFlow } from "@/components/code-practice/pipeline-execution-flow";
import { Database, ShieldCheck } from "lucide-react";

describe("InteractiveFlowDiagram Base Component", () => {
  const sampleStages: FlowStage[] = [
    {
      id: "stage-1",
      name: "Stage Alpha",
      subtitle: "First Step",
      icon: Database,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
      description: "Description for stage alpha.",
      keyTechniques: ["Technique 1", "Technique 2"],
      actionLabel: "Action Alpha",
    },
    {
      id: "stage-2",
      name: "Stage Beta",
      subtitle: "Second Step",
      icon: ShieldCheck,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30",
      description: "Description for stage beta.",
      keyTechniques: ["Technique 3", "Technique 4"],
      actionLabel: "Action Beta",
    },
  ];

  it("renders the diagram header, stepper buttons, and default active stage", () => {
    const handleAction = vi.fn();
    render(
      <InteractiveFlowDiagram
        title="Test Pipeline Architecture"
        subtitle="A test pipeline diagram"
        stages={sampleStages}
        onStageAction={handleAction}
      />
    );

    expect(screen.getByText("Test Pipeline Architecture")).toBeDefined();
    expect(screen.getByText("A test pipeline diagram")).toBeDefined();
    expect(screen.getAllByText("Stage Alpha").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Stage Beta")).toBeDefined();
    expect(screen.getByText("Description for stage alpha.")).toBeDefined();
    expect(screen.getByText("Technique 1")).toBeDefined();
    expect(screen.getByText("Technique 2")).toBeDefined();

    // Fire stage action
    const actionBtn = screen.getByText("Action Alpha");
    fireEvent.click(actionBtn);
    expect(handleAction).toHaveBeenCalledWith("stage-1");
  });

  it("allows switching active stages via stepper buttons", () => {
    render(
      <InteractiveFlowDiagram
        title="Test Pipeline Architecture"
        subtitle="A test pipeline diagram"
        stages={sampleStages}
      />
    );

    const betaButton = screen.getByRole("button", { name: /Stage Beta/i });
    fireEvent.click(betaButton);

    expect(screen.getByText("Description for stage beta.")).toBeDefined();
    expect(screen.getByText("Technique 3")).toBeDefined();
    expect(screen.getByText("Technique 4")).toBeDefined();
  });

  it("supports collapsing and expanding the diagram body", () => {
    render(
      <InteractiveFlowDiagram
        title="Test Pipeline Architecture"
        subtitle="A test pipeline diagram"
        stages={sampleStages}
      />
    );

    const collapseButton = screen.getByRole("button", { name: /Collapse Diagram/i });
    fireEvent.click(collapseButton);

    // After collapse, stepper content should not be visible
    expect(screen.queryByText("Description for stage alpha.")).toBeNull();
    expect(screen.getByText("Expand Diagram")).toBeDefined();

    // Click expand
    const expandButton = screen.getByRole("button", { name: /Expand Diagram/i });
    fireEvent.click(expandButton);
    expect(screen.getByText("Description for stage alpha.")).toBeDefined();
  });
});

describe("Domain-Specific Flow Diagram Components", () => {
  it("renders LakehouseMedallionFlow with 6 stages", () => {
    render(<LakehouseMedallionFlow />);
    expect(screen.getByText("Modern Lakehouse Medallion Architecture Lifecycle")).toBeDefined();
    expect(screen.getAllByText("Source Ingestion").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Bronze Layer")).toBeDefined();
    expect(screen.getByText("Silver Layer")).toBeDefined();
    expect(screen.getByText("Gold Layer")).toBeDefined();
    expect(screen.getByText("Semantic Layer")).toBeDefined();
    expect(screen.getByText("Consumption")).toBeDefined();
  });

  it("renders SystemDesignFlow with 6 system design stages", () => {
    render(<SystemDesignFlow />);
    expect(screen.getByText("Staff & Principal System Design Architecture Framework")).toBeDefined();
    expect(screen.getByText("Requirements & SLOs")).toBeDefined();
    expect(screen.getAllByText("Storage & Table Format").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Compute & Engine")).toBeDefined();
    expect(screen.getByText("Resilience & DR")).toBeDefined();
    expect(screen.getByText("Security & Governance")).toBeDefined();
    expect(screen.getByText("FinOps Unit Economics")).toBeDefined();
  });

  it("renders SdlcPipelineFlow with 6 SDLC stages", () => {
    render(<SdlcPipelineFlow />);
    expect(screen.getByText("Enterprise 360° Data Engineering SDLC Deployment Pipeline")).toBeDefined();
    expect(screen.getAllByText("Discovery & Contracts").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Architecture & ADRs")).toBeDefined();
    expect(screen.getByText("Dev Sandboxes & Test")).toBeDefined();
    expect(screen.getByText("CI/CD & SLSA Build")).toBeDefined();
    expect(screen.getByText("Canary & Release")).toBeDefined();
    expect(screen.getByText("Observability & SRE")).toBeDefined();
  });

  it("renders InterviewDefenseFlow with 5 interview stages", () => {
    render(<InterviewDefenseFlow />);
    expect(screen.getByText("The 5-Step Architecture Defense Framework")).toBeDefined();
    expect(screen.getAllByText("1. Clarify Scope & Scale").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("2. High-Level Topology")).toBeDefined();
    expect(screen.getByText("3. Deep-Dive Bottlenecks")).toBeDefined();
    expect(screen.getByText("4. Mitigate Failure Cases")).toBeDefined();
    expect(screen.getByText("5. Quantify Trade-Offs")).toBeDefined();
  });

  it("renders EnterpriseStackFlow with 6 stack layers", () => {
    render(<EnterpriseStackFlow />);
    expect(screen.getByText("Tier-1 Enterprise Data Platform Stack Blueprint")).toBeDefined();
    expect(screen.getAllByText("1. Operational Systems").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("2. Message Bus Tier")).toBeDefined();
    expect(screen.getByText("3. Distributed Compute")).toBeDefined();
    expect(screen.getByText("4. Lakehouse Storage")).toBeDefined();
    expect(screen.getByText("5. Catalog & Security")).toBeDefined();
    expect(screen.getByText("6. Serving & Analytics")).toBeDefined();
  });

  it("renders MasteryRoadmapFlow with 6 roadmap stages", () => {
    render(<MasteryRoadmapFlow />);
    expect(screen.getByText("Principal Data Architect Mastery Roadmap")).toBeDefined();
    expect(screen.getAllByText("1. Distributed Compute").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("2. Lakehouse Protocols")).toBeDefined();
    expect(screen.getByText("3. Streaming State")).toBeDefined();
    expect(screen.getByText("4. Platform Governance")).toBeDefined();
    expect(screen.getByText("5. FinOps & SRE")).toBeDefined();
    expect(screen.getByText("6. Principal System Design")).toBeDefined();
  });

  it("renders PipelineExecutionFlow with 5 execution stages", () => {
    render(<PipelineExecutionFlow />);
    expect(screen.getByText("Production PySpark & Delta Lake Transformation Pipeline")).toBeDefined();
    expect(screen.getAllByText("1. Ingestion & Pushdown").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("2. Vectorized Transform")).toBeDefined();
    expect(screen.getByText("3. Shuffle & Partitioning")).toBeDefined();
    expect(screen.getByText("4. ACID Table Commit")).toBeDefined();
    expect(screen.getByText("5. Auto-Compaction")).toBeDefined();
  });
});
