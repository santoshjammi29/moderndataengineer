import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MindmapClient } from "@/app/mindmap/mindmap-client";
import { ConceptsMindmapView } from "@/components/concepts/concepts-mindmap-view";
import { Concept } from "@/types/data";

const mockSampleConcepts: Concept[] = [
  {
    id: "fab-onelake",
    term: "OneLake",
    category: "FABRIC",
    difficulty: "EASY",
    definition: "Unified logical data lake for Microsoft Fabric.",
    explanation: "Acts as OneDrive for enterprise data.",
    keyPoints: ["Built on ADLS Gen2", "Eliminates silos"],
  },
  {
    id: "fab-directlake",
    term: "Direct Lake Mode",
    category: "FABRIC",
    difficulty: "ARCHITECT",
    definition: "Zero-copy semantic model serving mode in Power BI.",
    explanation: "Frames Delta Parquet directly into VertiPaq memory.",
    keyPoints: ["No data movement", "Sub-second queries"],
  },
  {
    id: "spark-catalyst",
    term: "Catalyst Optimizer",
    category: "SPARK & DATABRICKS",
    difficulty: "HARD",
    definition: "Extensible query optimization engine for Apache Spark.",
    explanation: "Applies rule-based and cost-based optimizations.",
    keyPoints: ["Logical optimization", "Physical planning"],
  },
  {
    id: "dbx-liquid",
    term: "Liquid Clustering",
    category: "DATABRICKS",
    difficulty: "HARD",
    definition: "Next-gen layout mechanism replacing Hive partitioning and Z-Order.",
    explanation: "Enables flexible incremental clustering without rewrites.",
    keyPoints: ["Zero partition skew", "Dynamic clustering keys"],
  },
];

describe("Linked Mind Map Feature Tests", () => {
  it("renders MindmapClient with Linked Mind Map mode enabled by default", () => {
    render(<MindmapClient concepts={mockSampleConcepts} />);

    // Header & metadata checks
    expect(screen.getByText("Enterprise Data Platform Concepts Mind Map")).toBeDefined();
    expect(screen.getByText(/4 architectural concepts/i)).toBeDefined();

    // Linked Mind Map Topology header & Level 0 Core Root node
    expect(screen.getByText("Linked Mind Map Topology")).toBeDefined();
    expect(screen.getByText("Level 0 • Platform Core")).toBeDefined();
    expect(screen.getByText("Enterprise Data & Lakehouse Platform")).toBeDefined();

    // Level 1 Domain nodes are present
    expect(screen.getByText("Microsoft Fabric")).toBeDefined();
    expect(screen.getByText("Apache Spark Core Engine")).toBeDefined();
    expect(screen.getByText("Databricks Lakehouse")).toBeDefined();

    // Level 3 Concept nodes display ONLY the names
    expect(screen.getByText("OneLake")).toBeDefined();
    expect(screen.getByText("Direct Lake Mode")).toBeDefined();
    expect(screen.getByText("Catalyst Optimizer")).toBeDefined();
    expect(screen.getByText("Liquid Clustering")).toBeDefined();
  });

  it("opens Concept Detail Inspector when a concept name pill is clicked in the mind map", () => {
    render(<ConceptsMindmapView concepts={mockSampleConcepts} initialLayoutMode="mindmap" />);

    // Click on OneLake name pill
    const onelakePill = screen.getByText("OneLake");
    fireEvent.click(onelakePill);

    // Inspector dialog opens with full definition and details
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeDefined();
    expect(screen.getByText("Official Definition")).toBeDefined();
    expect(screen.getByText("Unified logical data lake for Microsoft Fabric.")).toBeDefined();

    // Close dialog
    const closeBtn = screen.getByLabelText("Close Inspector");
    fireEvent.click(closeBtn);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("supports zooming in, zooming out, and resetting zoom on the mind map canvas", () => {
    render(<ConceptsMindmapView concepts={mockSampleConcepts} initialLayoutMode="mindmap" />);

    expect(screen.getByText("100%")).toBeDefined();

    // Zoom in
    const zoomInBtn = screen.getByLabelText("Zoom In");
    fireEvent.click(zoomInBtn);
    expect(screen.getByText("115%")).toBeDefined();

    // Zoom out
    const zoomOutBtn = screen.getByLabelText("Zoom Out");
    fireEvent.click(zoomOutBtn);
    expect(screen.getByText("100%")).toBeDefined();

    // Reset zoom
    const resetZoomBtn = screen.getByLabelText("Reset Zoom");
    fireEvent.click(resetZoomBtn);
    expect(screen.getByText("100%")).toBeDefined();
  });

  it("allows switching between Linked Mind Map, Hierarchical Tree, and Pillars Grid", () => {
    render(<ConceptsMindmapView concepts={mockSampleConcepts} initialLayoutMode="mindmap" />);

    // Initially in Mind Map mode
    expect(screen.getByText("Linked Mind Map Topology")).toBeDefined();

    // Switch to Hierarchical Tree mode
    const treeBtn = screen.getByLabelText("Hierarchical Tree Stretch");
    fireEvent.click(treeBtn);
    expect(screen.queryByText("Linked Mind Map Topology")).toBeNull();

    // Switch to Pillars Grid mode
    const gridBtn = screen.getByLabelText("Pillars Matrix Stretch");
    fireEvent.click(gridBtn);

    // Switch back to Mind Map mode
    const mindmapBtn = screen.getByLabelText("Linked Mind Map (Only Names)");
    fireEvent.click(mindmapBtn);
    expect(screen.getByText("Linked Mind Map Topology")).toBeDefined();
  });
});
