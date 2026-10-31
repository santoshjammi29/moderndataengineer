"use client";

import React from "react";
import {
  Layers,
  Database,
  FileArchive,
  Filter,
  BarChart3,
  Cpu,
  Bot,
} from "lucide-react";
import {
  InteractiveFlowDiagram,
  FlowStage,
} from "@/components/ui/interactive-flow-diagram";

interface LakehouseMedallionFlowProps {
  onSelectConceptQuery?: (query: string) => void;
  className?: string;
}

export function LakehouseMedallionFlow({
  onSelectConceptQuery,
  className,
}: LakehouseMedallionFlowProps) {
  const stages: FlowStage[] = [
    {
      id: "ingestion",
      name: "Source Ingestion",
      subtitle: "CDC & Event Streaming",
      icon: Database,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
      description:
        "High-velocity event streams (Kafka, Kinesis, Event Hubs) and transactional database change streams (Debezium, Fivetran) land asynchronously into object storage.",
      keyTechniques: [
        "Log-based CDC extraction",
        "Schema-on-read encapsulation",
        "Micro-batch / continuous streaming",
      ],
      actionLabel: "View Ingestion Concepts",
      onAction: onSelectConceptQuery
        ? () => onSelectConceptQuery("Ingestion")
        : undefined,
      actionHref: onSelectConceptQuery ? undefined : "/concepts?q=Ingestion",
    },
    {
      id: "bronze",
      name: "Bronze Layer",
      subtitle: "Raw Append-Only",
      icon: FileArchive,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30",
      description:
        "Preserves complete raw source fidelity with zero loss. Records are appended immutably to Delta Lake or Apache Iceberg tables with ingestion timestamps and source offsets.",
      keyTechniques: [
        "Append-only transactional log",
        "Audit history preservation",
        "Replay & backfill idempotence",
      ],
      actionLabel: "View Bronze Concepts",
      onAction: onSelectConceptQuery
        ? () => onSelectConceptQuery("Bronze")
        : undefined,
      actionHref: onSelectConceptQuery ? undefined : "/concepts?q=Bronze",
    },
    {
      id: "silver",
      name: "Silver Layer",
      subtitle: "Cleansed & Conformed",
      icon: Filter,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
      description:
        "Cleanses, deduplicates, and enriches raw events. Validates data against Data Contracts, handles late-arriving records, and maintains Slowly Changing Dimensions (SCD Type 1 & 2).",
      keyTechniques: [
        "Data contract validation",
        "Idempotent MERGE deduplication",
        "SCD Type 2 history tracking",
      ],
      actionLabel: "View Silver Concepts",
      onAction: onSelectConceptQuery
        ? () => onSelectConceptQuery("Silver")
        : undefined,
      actionHref: onSelectConceptQuery ? undefined : "/concepts?q=Silver",
    },
    {
      id: "gold",
      name: "Gold Layer",
      subtitle: "Aggregated Star Marts",
      icon: BarChart3,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30",
      description:
        "Transforms conformed data into business-aligned dimensional star schemas, aggregated KPI marts, and Kimball fact tables optimized for high-concurrency reporting.",
      keyTechniques: [
        "Kimball dimensional modeling",
        "Surrogate key hashing",
        "Liquid clustering & Z-Order",
      ],
      actionLabel: "View Gold Concepts",
      onAction: onSelectConceptQuery
        ? () => onSelectConceptQuery("Gold")
        : undefined,
      actionHref: onSelectConceptQuery ? undefined : "/concepts?q=Gold",
    },
    {
      id: "semantic",
      name: "Semantic Layer",
      subtitle: "Direct Lake In-Memory",
      icon: Cpu,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/30",
      description:
        "Exposes governed metrics and business logic without data duplication. Powers sub-second interactive slicing through Microsoft Fabric Direct Lake VertiPaq memory caching.",
      keyTechniques: [
        "Direct Lake zero-copy paging",
        "VertiPaq columnar compression",
        "Standardized metric definitions",
      ],
      actionLabel: "View Semantic Concepts",
      onAction: onSelectConceptQuery
        ? () => onSelectConceptQuery("Direct Lake")
        : undefined,
      actionHref: onSelectConceptQuery ? undefined : "/concepts?q=Direct%20Lake",
    },
    {
      id: "consumption",
      name: "Consumption",
      subtitle: "BI, RAG & Feature Stores",
      icon: Bot,
      color: "text-rose-400",
      bgColor: "bg-rose-500/10",
      borderColor: "border-rose-500/30",
      description:
        "Delivers governed data to diverse enterprise consumers: executive BI dashboards, sub-second operational APIs, real-time ML feature stores, and generative AI RAG embeddings.",
      keyTechniques: [
        "Sub-second BI reporting",
        "Low-latency feature retrieval",
        "Vector search & GenAI RAG",
      ],
      actionLabel: "Explore Use Cases",
      onAction: onSelectConceptQuery
        ? () => onSelectConceptQuery("Feature Store")
        : undefined,
      actionHref: onSelectConceptQuery ? undefined : "/concepts?q=Feature%20Store",
    },
  ];

  return (
    <InteractiveFlowDiagram
      title="Modern Lakehouse Medallion Architecture Lifecycle"
      badge="Interactive Architecture"
      subtitle="How streaming events and batch datasets flow through Bronze, Silver, and Gold layers into enterprise semantic models."
      icon={Layers}
      stages={stages}
      defaultStageId="silver"
      className={className}
    />
  );
}
