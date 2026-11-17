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

  it("toggles inline definitions across all 3 levels via the toolbar toggle", () => {
    render(<ConceptsMindmapView concepts={mockSampleConcepts} initialLayoutMode="mindmap" />);

    // Initially definitions are toggled off (Names Only mode)
    const toggleBtn = screen.getByLabelText("Toggle Definitions");
    expect(screen.getByText("Show Definitions")).toBeDefined();

    // Toggle ON
    fireEvent.click(toggleBtn);
    expect(screen.getByText("Definitions: ON")).toBeDefined();

    // Concept definitions are now visible inline
    expect(screen.getByText("Unified logical data lake for Microsoft Fabric.")).toBeDefined();

    // Toggle OFF
    fireEvent.click(toggleBtn);
    expect(screen.getByText("Show Definitions")).toBeDefined();
  });

  it("opens Domain Architectural Scope modal when domain info button is clicked", () => {
    render(<ConceptsMindmapView concepts={mockSampleConcepts} initialLayoutMode="mindmap" />);

    const domainInfoBtn = screen.getByLabelText("View Microsoft Fabric Domain Definition");
    fireEvent.click(domainInfoBtn);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeDefined();
    expect(screen.getByText("Domain Architectural Scope & Definition")).toBeDefined();

    // Close dialog
    const closeBtn = screen.getByLabelText("Close Dialog");
    fireEvent.click(closeBtn);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens Subtopic Architectural Definition modal when subtopic info button is clicked", () => {
    render(<ConceptsMindmapView concepts={mockSampleConcepts} initialLayoutMode="mindmap" />);

    const subtopicInfoBtn = screen.getByLabelText("View OneLake & ADLS Storage Substrate Subtopic Definition");
    fireEvent.click(subtopicInfoBtn);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeDefined();
    expect(screen.getByText("Pillar Architectural Definition")).toBeDefined();

    // Close dialog
    const closeBtn = screen.getByLabelText("Close Dialog");
    fireEvent.click(closeBtn);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("controls tree expansion depth with L1 Only, L2 Pillars, and All Levels buttons", () => {
    render(<ConceptsMindmapView concepts={mockSampleConcepts} initialLayoutMode="mindmap" />);

    // Initially All Levels (L3) is expanded
    expect(screen.getByText("OneLake")).toBeDefined();
    expect(screen.getByText("OneLake & ADLS Storage Substrate")).toBeDefined();

    // Click "L1 Only" button
    const l1Btn = screen.getByText("L1 Only");
    fireEvent.click(l1Btn);

    // Level 1 Domain nodes are still visible
    expect(screen.getByText("Microsoft Fabric")).toBeDefined();
    // Subtopics and Concepts are collapsed / minimized
    expect(screen.queryByText("OneLake & ADLS Storage Substrate")).toBeNull();
    expect(screen.queryByText("OneLake")).toBeNull();

    // Click "L2 Pillars" button
    const l2Btn = screen.getByText("L2 Pillars");
    fireEvent.click(l2Btn);

    // Subtopics are now visible, but individual concepts remain minimized
    expect(screen.getByText("OneLake & ADLS Storage Substrate")).toBeDefined();
    expect(screen.queryByText("OneLake")).toBeNull();

    // Click "All Levels" button
    const allBtn = screen.getByText("All Levels");
    fireEvent.click(allBtn);

    // Both subtopics and concepts are visible again
    expect(screen.getByText("OneLake & ADLS Storage Substrate")).toBeDefined();
    expect(screen.getByText("OneLake")).toBeDefined();
  });

  it("renders 360° Radial Orbit flow with multi-level expansion and interactivity", () => {
    render(<ConceptsMindmapView concepts={mockSampleConcepts} initialLayoutMode="mindmap" />);

    // Switch to Radial Orbit style
    const radialRadio = screen.getByRole("button", { name: "Radial Orbit" });
    fireEvent.click(radialRadio);

    // Level 0 Core is rendered in radial mode
    expect(screen.getByText("Enterprise Data & Lakehouse Platform")).toBeDefined();

    // Level 1 Domain nodes are present in radial mode
    expect(screen.getByText("Microsoft Fabric")).toBeDefined();
    expect(screen.getByText("Apache Spark Core Engine")).toBeDefined();

    // Level 2 Subtopics and Level 3 Concepts are present in radial mode
    expect(screen.getByText("OneLake & ADLS Storage Substrate")).toBeDefined();
    expect(screen.getByText("OneLake")).toBeDefined();

    // Clicking concept in Radial Orbit opens Concept Detail Inspector
    const conceptBtn = screen.getByText("OneLake");
    fireEvent.click(conceptBtn);
    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByText("Unified logical data lake for Microsoft Fabric.")).toBeDefined();

    // Close dialog
    fireEvent.click(screen.getByLabelText("Close Inspector"));
    expect(screen.queryByRole("dialog")).toBeNull();

    // Minimize to L1 Only in Radial mode
    fireEvent.click(screen.getByText("L1 Only"));
    expect(screen.getByText("Microsoft Fabric")).toBeDefined();
    expect(screen.queryByText("OneLake & ADLS Storage Substrate")).toBeNull();
    expect(screen.queryByText("OneLake")).toBeNull();
  });

  it("triggers auto-scale when Fit to 14-inch Screen button is clicked", () => {
    render(<ConceptsMindmapView concepts={mockSampleConcepts} initialLayoutMode="mindmap" />);

    // Click Fit Screen button
    const fitScreenBtn = screen.getByLabelText("Fit Screen");
    fireEvent.click(fitScreenBtn);

    // For all levels, zoom scales to 68%
    expect(screen.getByText("68%")).toBeDefined();
  });

  it("supports toggling fullscreen mode with Escape key and floating exit button", () => {
    render(<ConceptsMindmapView concepts={mockSampleConcepts} initialLayoutMode="mindmap" />);

    // Click Fullscreen button in toolbar
    const fullscreenBtn = screen.getByLabelText("Fullscreen View");
    fireEvent.click(fullscreenBtn);

    // Fullscreen is active: toolbar button shows Exit, and floating exit button appears
    expect(screen.getAllByLabelText("Exit Fullscreen").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("to exit")).toBeDefined();

    // Pressing Escape exits fullscreen
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByLabelText("Exit Fullscreen")).toBeNull();
    expect(screen.getByLabelText("Fullscreen View")).toBeDefined();
  });

  it("supports free dragging of nodes and resetting positions via Reset Nodes button", () => {
    render(<ConceptsMindmapView concepts={mockSampleConcepts} initialLayoutMode="mindmap" />);

    // Initially no custom offsets, so "Reset Nodes" button is not visible
    expect(screen.queryByLabelText("Reset Node Positions")).toBeNull();

    // Find a draggable concept node
    const conceptNode = screen.getByText("OneLake");
    expect(conceptNode).toBeDefined();

    // Trigger drag by mousedown on the node and mousemove on window
    fireEvent.mouseDown(conceptNode, { clientX: 100, clientY: 100, button: 0 });
    fireEvent.mouseMove(window, { clientX: 180, clientY: 220 });
    fireEvent.mouseUp(window);

    // Now node has custom offset, so "Reset Nodes" button appears
    const resetNodesBtn = screen.getByLabelText("Reset Node Positions");
    expect(resetNodesBtn).toBeDefined();
    expect(screen.getByText("Reset Nodes")).toBeDefined();

    // Click "Reset Nodes" button to clear all offsets
    fireEvent.click(resetNodesBtn);
    expect(screen.queryByLabelText("Reset Node Positions")).toBeNull();
  });
});
