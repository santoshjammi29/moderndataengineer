"use client";

import React from "react";
import {
  Building2,
  Server,
  Radio,
  Cpu,
  HardDrive,
  ShieldCheck,
  BarChart,
} from "lucide-react";
import {
  InteractiveFlowDiagram,
  FlowStage,
} from "@/components/ui/interactive-flow-diagram";

interface EnterpriseStackFlowProps {
  onSelectTier?: (tier: string) => void;
  className?: string;
}

export function EnterpriseStackFlow({
  onSelectTier,
  className,
}: EnterpriseStackFlowProps) {
  const stages: FlowStage[] = [
    {
      id: "sources",
      name: "1. Operational Systems",
      subtitle: "OLTP, ERP & SaaS APIs",
      icon: Server,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
      description:
        "Mission-critical transaction backends: core banking engines, healthcare EHRs, retail ERPs (SAP/Oracle), relational OLTP databases (PostgreSQL/SQL Server), and external SaaS APIs.",
      keyTechniques: [
        "Write-Ahead Log (WAL) capture",
        "CDC connector agents (Debezium)",
        "API pagination & rate-limit throttling",
      ],
      actionLabel: "View Banking GCC Profiles",
      actionHref: "/company-research?search=Banking",
    },
    {
      id: "streaming",
      name: "2. Message Bus Tier",
      subtitle: "Kafka & Event Streams",
      icon: Radio,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
      description:
        "High-throughput decoupled event backbone: multi-cluster Apache Kafka, Confluent Cloud, or cloud-native event brokers handling millions of events/sec with schema registries.",
      keyTechniques: [
        "Ordered partition keying",
        "Avro / Protobuf Schema Registry",
        "Transactional producers (EOS)",
      ],
      actionLabel: "View Kafka Stacks",
      actionHref: "/company-research?search=Kafka",
    },
    {
      id: "compute",
      name: "3. Distributed Compute",
      subtitle: "Databricks, Spark & Flink",
      icon: Cpu,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30",
      description:
        "Unified analytical processing: Apache Spark and Databricks clusters for batch/micro-batch, Apache Flink for sub-second stateful streaming, and serverless warehouse engines.",
      keyTechniques: [
        "Adaptive Query Execution (AQE)",
        "Photon vectorized execution engine",
        "RocksDB streaming state stores",
      ],
      actionLabel: "View Databricks Stacks",
      actionHref: "/company-research?search=Databricks",
    },
    {
      id: "storage",
      name: "4. Lakehouse Storage",
      subtitle: "Delta Lake & Iceberg",
      icon: HardDrive,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30",
      description:
        "Petabyte-scale open table formats running on cloud object storage (ADLS Gen2, AWS S3, GCS). Implements ACID transactions, time travel, and Hilbert-curve Liquid Clustering.",
      keyTechniques: [
        "Delta Lake / Apache Iceberg formats",
        "Liquid Clustering & compaction",
        "Immutable transaction logs",
      ],
      actionLabel: "View Lakehouse Stacks",
      actionHref: "/company-research?search=Lakehouse",
    },
    {
      id: "catalog",
      name: "5. Catalog & Security",
      subtitle: "Unity, Purview & Polaris",
      icon: ShieldCheck,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/30",
      description:
        "Centralized governance control plane: federated metadata catalogs, dynamic column-level masking, row-level tenant filtering, and automated end-to-end data lineage tracking.",
      keyTechniques: [
        "Federated REST Catalogs",
        "Fine-grained row & column masking",
        "OpenLineage runtime telemetry",
      ],
      actionLabel: "View Catalog Profiles",
      actionHref: "/company-research?search=Security",
    },
    {
      id: "serving",
      name: "6. Serving & Analytics",
      subtitle: "Power BI Direct Lake & RAG",
      icon: BarChart,
      color: "text-teal-400",
      bgColor: "bg-teal-500/10",
      borderColor: "border-teal-500/30",
      description:
        "Low-latency business consumption: Microsoft Fabric Direct Lake semantic models with in-memory VertiPaq caching, operational GraphQL APIs, and GenAI vector search pipelines.",
      keyTechniques: [
        "Direct Lake sub-second queries",
        "Semantic metrics repository",
        "Hybrid vector search retrieval",
      ],
      actionLabel: "View Modern Analytics Stacks",
      actionHref: "/company-research?search=Snowflake",
    },
  ];

  return (
    <InteractiveFlowDiagram
      title="Tier-1 Enterprise Data Platform Stack Blueprint"
      badge="Enterprise Blueprint"
      subtitle="The standardized 6-tier architecture powering Global Capability Centers (GCCs) and Fortune 500 data platforms."
      icon={Building2}
      stages={stages}
      defaultStageId="compute"
      className={className}
    />
  );
}
