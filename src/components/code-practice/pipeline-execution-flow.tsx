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
        "Execute distributed reads from cloud object storage (S3 Express One Zone / ADLS Gen2): Catalyst evaluates pushdown predicates against Iceberg v2/Delta metadata and Parquet bloom filters, pruning unneeded column chunks and row groups before transferring bytes.",
      keyTechniques: [
        "Iceberg REST & Delta UniForm metadata pruning",
        "S3 Express One Zone sub-10ms object access",
        "Parquet bloom filter & min/max bound pushdown",
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
        "Transform intermediate rows at native CPU speed: Tungsten Whole-Stage CodeGen compiles pipeline stages into compact Java bytecode, while Apache Arrow IPC buffers enable zero-copy vectorized Python UDF execution without JVM serialization bottlenecks.",
      keyTechniques: [
        "Apache Arrow IPC zero-copy memory buffers",
        "Tungsten Whole-Stage Code Generation (Janino)",
        "Vectorized SIMD Python UDFs & Photon C++",
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
        "Redistribute data across cluster executors for wide dependencies: Spark 3.5 Adaptive Query Execution (AQE) dynamically inspects stage map statistics, coalesces small shuffle partitions, and splits skewed keys (>5x median) into parallel sub-tasks.",
      keyTechniques: [
        "Spark 3.5 AQE dynamic partition coalescing",
        "Runtime skew join automatic sub-task splitting",
        "Two-phase key salting with AQE fallback",
      ],
      actionLabel: "View Shuffle Tuning Code",
      onAction: onSelectLang ? () => onSelectLang("pyspark") : undefined,
      actionHref: onSelectLang ? undefined : "/code-practice?lang=pyspark",
    },
    {
      id: "commit",
      name: "4. ACID Table Commit",
      subtitle: "Delta Log & Iceberg Snapshot",
      icon: FileCheck,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30",
      description:
        "Commit output files transactionally: Delta Lake 3.2 writes Parquet data files alongside Deletion Vectors (Roaring Bitmaps) to eliminate file rewriting on updates, completing atomic commits with Optimistic Concurrency Control (OCC) and OpenLineage audit telemetry.",
      keyTechniques: [
        "Delta 3.2 Deletion Vectors (soft row-level deletes)",
        "Optimistic Concurrency Control (OCC) conflict retry",
        "OpenLineage runtime dataset commit facets",
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
        "Maintain sustained query performance over time: run background OPTIMIZE to compact small files, re-order rows along space-filling Hilbert curves (Liquid Clustering) to avoid partition rigidity, and reclaim expired tombstones via VACUUM.",
      keyTechniques: [
        "Multi-dimensional Hilbert curve Liquid Clustering",
        "Iceberg RewriteDataFiles & bin-pack compaction",
        "VACUUM retention & PURGE physical deletion",
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
      subtitle="How distributed PySpark code transforms, shuffles, and commits ACID transactions into modern lakehouse storage."
      icon={Terminal}
      stages={stages}
      defaultStageId="read"
      className={className}
    />
  );
}
