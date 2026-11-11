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
        "Frame the computational envelope: quantify peak ingress QPS, p99 analytical query latency (<1.5s), streaming freshness SLAs (<60s), consistency requirements (linearizable vs eventual), and RPO/RTO disaster recovery tiers.",
      keyTechniques: [
        "Tiered SLOs (p99 query < 1.5s, freshness < 60s)",
        "RPO = 0 / RTO < 15m multi-region envelope",
        "Backpressure & queue depth headroom bounds",
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
        "Select the open table format matching enterprise ecosystem constraints: implement Apache Iceberg v2/v3 REST catalogs or Delta Lake 3.2 Liquid Clustering (Hilbert curves) with Deletion Vectors to eliminate Parquet rewrite amplification.",
      keyTechniques: [
        "Apache Iceberg REST Catalog (Polaris, Unity, Tabular)",
        "Delta Lake 3.2 Liquid Clustering & Deletion Vectors",
        "S3 Express One Zone sub-10ms tiering economics",
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
        "Architect distributed execution engines: configure Spark 3.5 AQE runtime query stage re-optimization, RocksDB NVMe off-heap streaming state stores, and native vectorized execution (Photon C++ & Apache Arrow SIMD).",
      keyTechniques: [
        "Spark 3.5+ AQE runtime skew splitting & coalescing",
        "RocksDB NVMe off-heap streaming state stores",
        "Vectorized C++ Photon & Apache Arrow SIMD",
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
        "Design fail-safe topologies: asynchronous cross-region object replication (S3 CRR with RTC / GCS Dual-Region), multi-zone catalog pointer mirroring, and automated DNS circuit health-check failover.",
      keyTechniques: [
        "Active-Passive S3 CRR & GCS Dual-Region replication",
        "Catalog snapshot pointer atomic synchronization",
        "Automated Route 53 / Cloudflare DNS failover",
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
      subtitle: "Zero-Trust & OWASP LLM",
      icon: ShieldCheck,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/30",
      description:
        "Enforce end-to-end zero-trust security: NIST SP 800-207 continuous verification, declarative Data Contracts in CI/CD, attribute-based access control (ABAC row/column masks), and OWASP LLM01/06 sandboxed tool execution for AI data agents.",
      keyTechniques: [
        "NIST SP 800-207 Zero Trust least-privilege RBAC/ABAC",
        "Declarative Data Contracts in CI/CD (OpenLineage facets)",
        "OWASP LLM 2025 agent tool sandbox & approval gates",
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
      color: "text-teal-400",
      bgColor: "bg-teal-500/10",
      borderColor: "border-teal-500/30",
      description:
        "Engineer cloud cost guardrails: automated idle cluster termination, spot compute arbitrage for stateless transformations, policy-as-code resource tagging, and per-query cost attribution aligned with FinOps Foundation standards.",
      keyTechniques: [
        "FinOps Foundation unit economics ($/pipeline, $/query)",
        "Auto-terminating serverless warehouses & spot arbitrage",
        "Mandatory multi-tenant cost allocation tagging",
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
      defaultStageId="requirements"
      className={className}
    />
  );
}
