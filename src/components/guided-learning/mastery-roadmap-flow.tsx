"use client";

import React from "react";
import {
  GraduationCap,
  Cpu,
  Layers,
  Activity,
  ShieldCheck,
  Coins,
  Award,
} from "lucide-react";
import {
  InteractiveFlowDiagram,
  FlowStage,
} from "@/components/ui/interactive-flow-diagram";

interface MasteryRoadmapFlowProps {
  onSelectTrack?: (trackId: string) => void;
  className?: string;
}

export function MasteryRoadmapFlow({
  onSelectTrack,
  className,
}: MasteryRoadmapFlowProps) {
  const stages: FlowStage[] = [
    {
      id: "compute",
      name: "1. Distributed Compute",
      subtitle: "Spark, Catalyst & Tungsten",
      icon: Cpu,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
      description:
        "Master the physical mechanics of distributed execution: Catalyst AST analysis, rule-based and cost-based optimizations, whole-stage codegen, and shuffle partition tuning.",
      keyTechniques: [
        "Whole-Stage Code Generation",
        "Adaptive Query Execution (AQE)",
        "Off-heap memory management",
      ],
      actionLabel: "Explore Spark Track",
      actionHref: "/guided-learning?topic=pyspark",
    },
    {
      id: "storage",
      name: "2. Lakehouse Protocols",
      subtitle: "Delta Lake & Apache Iceberg",
      icon: Layers,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
      description:
        "Understand open storage engines: ACID transaction logs, optimistic concurrency control (OCC), Parquet columnar encoding, snapshot isolation, and Hilbert Liquid Clustering.",
      keyTechniques: [
        "Delta transaction log commits",
        "Iceberg manifest list trees",
        "Liquid Clustering Hilbert curves",
      ],
      actionLabel: "Explore Delta Track",
      actionHref: "/guided-learning?topic=delta",
    },
    {
      id: "streaming",
      name: "3. Streaming State",
      subtitle: "Kafka, Flink & Watermarks",
      icon: Activity,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30",
      description:
        "Architect real-time streaming architectures: event-time watermarking, stateful aggregations, RocksDB off-heap state management, and two-phase commit exactly-once semantics.",
      keyTechniques: [
        "Event-time watermark bounds",
        "RocksDB state store off-heap",
        "Two-Phase Commit (2PC) EOS",
      ],
      actionLabel: "Explore Streaming Track",
      actionHref: "/guided-learning?topic=streaming",
    },
    {
      id: "governance",
      name: "4. Platform Governance",
      subtitle: "Data Contracts & SLSA CI/CD",
      icon: ShieldCheck,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30",
      description:
        "Engineer enterprise trust: enforce version-controlled Data Contracts in CI/CD, implement SLSA Level 3 build provenance, trace OpenLineage, and configure fine-grained IAM.",
      keyTechniques: [
        "Declarative data contract YAML",
        "SLSA Level 3 cryptographic build",
        "OpenLineage runtime telemetry",
      ],
      actionLabel: "Explore Governance Track",
      actionHref: "/guided-learning?topic=security",
    },
    {
      id: "finops",
      name: "5. FinOps & SRE",
      subtitle: "Error Budgets & Unit Economics",
      icon: Coins,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/30",
      description:
        "Run platforms with rigor: calculate SLI/SLO error budgets, attribute query spend to business units, automate idle cluster teardown, and conduct blameless incident postmortems.",
      keyTechniques: [
        "SLO error budget management",
        "Cloud compute unit attribution",
        "Dual-region DR game days",
      ],
      actionLabel: "Explore FinOps Track",
      actionHref: "/guided-learning?topic=finops",
    },
    {
      id: "architect",
      name: "6. Principal System Design",
      subtitle: "Enterprise Mesh & Defense",
      icon: Award,
      color: "text-indigo-400",
      bgColor: "bg-indigo-500/10",
      borderColor: "border-indigo-500/30",
      description:
        "Achieve Principal mastery: evaluate distributed trade-offs, articulate architectural decision records (ADRs), defend solutions under senior cross-examination, and align executive vision.",
      keyTechniques: [
        "Architectural Decision Records",
        "Trade-off defense frameworks",
        "Enterprise technology roadmaps",
      ],
      actionLabel: "Explore Architecture Hub",
      actionHref: "/architecture",
    },
  ];

  return (
    <InteractiveFlowDiagram
      title="Principal Data Architect Mastery Roadmap"
      badge="Career Progression"
      subtitle="The 6 developmental milestones from Senior Data Engineer to Principal Enterprise Lakehouse Architect."
      icon={GraduationCap}
      stages={stages}
      defaultStageId="governance"
      className={className}
    />
  );
}
