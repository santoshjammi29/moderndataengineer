"use client";

import React from "react";
import {
  Terminal,
  FileSearch,
  Code2,
  Shuffle,
  FileCheck,
  Sparkles,
} from "lucide-react";
import {
  InteractiveFlowDiagram,
  FlowStage,
} from "@/components/ui/interactive-flow-diagram";

interface PipelineExecutionFlowProps {
  onSelectLang?: (lang: string) => void;
  className?: string;
}

export function PipelineExecutionFlow({
  onSelectLang,
  className,
}: PipelineExecutionFlowProps) {
  const stages: FlowStage[] = [
    {
      id: "read",
      name: "1. Ingestion & Pushdown",
      subtitle: "Schema & Metadata Pruning",
      icon: FileSearch,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
      description:
        "Execute distributed reads from object storage: Catalyst evaluates pushdown filters against Parquet statistics (min/max bounds) and prunes unnecessary column chunks before transferring bytes over the network.",
      keyTechniques: [
        "Predicate pushdown into Parquet",
        "Column projection pruning",
        "Schema enforcement on read",
      ],
      actionLabel: "View Read Snippets",
      onAction: onSelectLang ? () => onSelectLang("pyspark") : undefined,
      actionHref: onSelectLang ? undefined : "/code-practice?lang=pyspark",
    },
    {
      id: "transform",
      name: "2. Vectorized Transform",
      subtitle: "Arrow & Whole-Stage CodeGen",
      icon: Code2,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
      description:
        "Transform intermediate rows at native CPU speed: Tungsten fuses pipeline operators into tight Java bytecode loops, while Apache Arrow vectors accelerate Python UDFs without JVM serialization penalties.",
      keyTechniques: [
        "Whole-Stage Code Generation",
        "Arrow-optimized Pandas UDFs",
        "Off-heap UnsafeRow memory",
      ],
      actionLabel: "View PySpark Transform Code",
      onAction: onSelectLang ? () => onSelectLang("pyspark") : undefined,
      actionHref: onSelectLang ? undefined : "/code-practice?lang=pyspark",
    },
    {
      id: "shuffle",
      name: "3. Shuffle & Partitioning",
      subtitle: "AQE & Skew Mitigation",
      icon: Shuffle,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30",
      description:
        "Redistribute data across executors for joins and aggregations: AQE dynamically inspects shuffle file sizes, coalesces tiny partitions, and splits skewed keys to eliminate straggler tasks.",
      keyTechniques: [
        "AQE dynamic partition coalescing",
        "Skew join task splitting",
        "Local shuffle reader bypass",
      ],
      actionLabel: "View Shuffle Tuning Code",
      onAction: onSelectLang ? () => onSelectLang("pyspark") : undefined,
      actionHref: onSelectLang ? undefined : "/code-practice?lang=pyspark",
    },
    {
      id: "commit",
      name: "4. ACID Table Commit",
      subtitle: "Delta Log OCC Protocol",
      icon: FileCheck,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30",
      description:
        "Commit output files transactionally: Delta Lake writes Parquet data files and attempts an atomic commit to the JSON transaction log using Optimistic Concurrency Control (OCC) to guarantee ACID correctness.",
      keyTechniques: [
        "Atomic JSON commit logging",
        "Optimistic Concurrency Control",
        "Idempotent MERGE INTO syntax",
      ],
      actionLabel: "View Delta Merge Code",
      onAction: onSelectLang ? () => onSelectLang("sparksql") : undefined,
      actionHref: onSelectLang ? undefined : "/code-practice?lang=sparksql",
    },
    {
      id: "maintenance",
      name: "5. Auto-Compaction",
      subtitle: "Liquid Clustering & Vacuum",
      icon: Sparkles,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/30",
      description:
        "Maintain high read throughput over time: run background OPTIMIZE to compact small files, re-order rows along space-filling Hilbert curves (Liquid Clustering), and reclaim expired tombstones via VACUUM.",
      keyTechniques: [
        "Hilbert curve Liquid Clustering",
        "Bin-packing bin file compaction",
        "VACUUM tombstone cleanup",
      ],
      actionLabel: "View Maintenance SQL",
      onAction: onSelectLang ? () => onSelectLang("sparksql") : undefined,
      actionHref: onSelectLang ? undefined : "/code-practice?lang=sparksql",
    },
  ];

  return (
    <InteractiveFlowDiagram
      title="Production PySpark & Delta Lake Transformation Pipeline"
      badge="Code Execution Lifecycle"
      subtitle="How distributed PySpark code transforms, shuffles, and commits ACID transactions into Delta Lake."
      icon={Terminal}
      stages={stages}
      defaultStageId="transform"
      className={className}
    />
  );
}
