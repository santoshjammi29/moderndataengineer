"use client";

import React from "react";
import {
  Compass,
  FileCheck2,
  HardDrive,
  Cpu,
  ShieldCheck,
  Coins,
} from "lucide-react";
import {
  InteractiveFlowDiagram,
  FlowStage,
} from "@/components/ui/interactive-flow-diagram";

interface SystemDesignFlowProps {
  onSelectSearchQuery?: (query: string) => void;
  className?: string;
}

export function SystemDesignFlow({
  onSelectSearchQuery,
  className,
}: SystemDesignFlowProps) {
  const stages: FlowStage[] = [
    {
      id: "requirements",
      name: "Requirements & SLOs",
      subtitle: "Throughput & Latency Bounds",
      icon: FileCheck2,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
      description:
        "Frame the computational envelope: quantify peak ingress QPS, p99 query latency, freshness SLAs, consistency requirements (linearizable vs eventual), and RPO/RTO disaster recovery tiers.",
      keyTechniques: [
        "Read vs write ratio modeling",
        "RPO < 15m / RTO < 1h tiering",
        "Backpressure headroom planning",
      ],
      actionLabel: "View SLO Scenarios",
      onAction: onSelectSearchQuery
        ? () => onSelectSearchQuery("SLO")
        : undefined,
      actionHref: onSelectSearchQuery ? undefined : "/architecture?search=SLO",
    },
    {
      id: "storage",
      name: "Storage & Table Format",
      subtitle: "Delta vs. Iceberg vs. Hudi",
      icon: HardDrive,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
      description:
        "Select the open table protocol matching enterprise ecosystem constraints. Design partition schemes, Hilbert space Liquid Clustering, file compaction schedules, and manifest tree hierarchies.",
      keyTechniques: [
        "Apache Iceberg REST Catalog",
        "Delta Lake Liquid Clustering",
        "Parquet dictionary & V-Order encoding",
      ],
      actionLabel: "View Table Format Blueprints",
      onAction: onSelectSearchQuery
        ? () => onSelectSearchQuery("Iceberg")
        : undefined,
      actionHref: onSelectSearchQuery ? undefined : "/architecture?search=Iceberg",
    },
    {
      id: "compute",
      name: "Compute & Engine",
      subtitle: "Shuffle & Spill Optimization",
      icon: Cpu,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30",
      description:
        "Architect distributed execution engines. Configure Spark AQE query stage re-optimization boundaries, RocksDB off-heap streaming state stores, and Photon native vectorized execution.",
      keyTechniques: [
        "Adaptive Query Execution (AQE)",
        "RocksDB off-heap streaming state",
        "Skew join task splitting",
      ],
      actionLabel: "View Spark Engine Scenarios",
      onAction: onSelectSearchQuery
        ? () => onSelectSearchQuery("AQE")
        : undefined,
      actionHref: onSelectSearchQuery ? undefined : "/architecture?search=AQE",
    },
    {
      id: "resilience",
      name: "Resilience & DR",
      subtitle: "Multi-Region High Availability",
      icon: Compass,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30",
      description:
        "Design fail-safe topologies: asynchronous cross-region object storage replication (S3 CRR / GCS Dual-Region), multi-zone catalog pointer mirroring, and automated DNS failover orchestration.",
      keyTechniques: [
        "Active-Passive replication with RTC",
        "Catalog state synchronization",
        "Automated DNS circuit failover",
      ],
      actionLabel: "View Disaster Recovery Scenarios",
      onAction: onSelectSearchQuery
        ? () => onSelectSearchQuery("Disaster Recovery")
        : undefined,
      actionHref: onSelectSearchQuery
        ? undefined
        : "/architecture?search=Disaster%20Recovery",
    },
    {
      id: "security",
      name: "Security & Governance",
      subtitle: "Zero-Trust Data Mesh",
      icon: ShieldCheck,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/30",
      description:
        "Enforce end-to-end security: declarative Data Contracts, format-preserving column encryption, dynamic row-level security policies, OpenLineage runtime telemetry, and SLSA Level 3 supply chains.",
      keyTechniques: [
        "Data contracts in CI/CD",
        "Unity Catalog row-level filters",
        "SLSA Level 3 build provenance",
      ],
      actionLabel: "View Governance Blueprints",
      onAction: onSelectSearchQuery
        ? () => onSelectSearchQuery("Contract")
        : undefined,
      actionHref: onSelectSearchQuery ? undefined : "/architecture?search=Contract",
    },
    {
      id: "finops",
      name: "FinOps Unit Economics",
      subtitle: "Cost Attribution & Right-Sizing",
      icon: Coins,
      color: "text-rose-400",
      bgColor: "bg-rose-500/10",
      borderColor: "border-rose-500/30",
      description:
        "Engineer cloud cost guardrails: automated idle cluster termination, spot compute arbitrage for stateless transformations, policy-as-code resource tagging, and per-query cost attribution.",
      keyTechniques: [
        "Mandatory cluster tagging policies",
        "Spot instance arbitrage in DLT",
        "Unit cost per query / 1M records",
      ],
      actionLabel: "View FinOps Architecture",
      onAction: onSelectSearchQuery
        ? () => onSelectSearchQuery("FinOps")
        : undefined,
      actionHref: onSelectSearchQuery ? undefined : "/architecture?search=FinOps",
    },
  ];

  return (
    <InteractiveFlowDiagram
      title="Staff & Principal System Design Architecture Framework"
      badge="System Design Framework"
      subtitle="The 6-stage enterprise methodology for evaluating trade-offs, storage engines, distributed compute, and failure domains."
      icon={Compass}
      stages={stages}
      defaultStageId="storage"
      className={className}
    />
  );
}
