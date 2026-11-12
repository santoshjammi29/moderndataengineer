"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Layers,
  Workflow,
  Cpu,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Code2,
  Copy,
  Check,
  Zap,
  Activity,
  GitBranch,
  ShieldCheck,
  ChevronDown,
  Terminal,
  FileCode2,
  Flame,
  MessageSquare,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { TopicIcon } from "@/components/ui/topic-icon";
import { CodeBlock } from "@/components/ui/code-block";
import { MasteryRoadmapFlow } from "@/components/guided-learning/mastery-roadmap-flow";
import { LakehouseMedallionFlow } from "@/components/concepts/lakehouse-medallion-flow";
import { LakehouseArchitectureGuide } from "@/components/dashboard/lakehouse-architecture-guide";
import { EnterpriseStackFlow } from "@/components/company-research/enterprise-stack-flow";
import { SdlcPipelineFlow } from "@/components/dataops/sdlc-pipeline-flow";
import { PipelineExecutionFlow } from "@/components/code-practice/pipeline-execution-flow";
import { SystemDesignFlow } from "@/components/architecture/system-design-flow";
import { InterviewDefenseFlow } from "@/components/qa-prep/interview-defense-flow";
import { OptimizationFlow } from "@/components/cheatsheet/optimization-flow";

type StageTab = "mastery" | "lakehouse" | "sdlc" | "catalyst" | "flows";

interface CanvasStage {
  step: string;
  topicKey: string;
  title: string;
  tech: string;
  summary: string;
  standards: string;
  failureModes: string[];
  code: string;
  codeLang: string;
  codeFilename: string;
}

export function StagesClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryTab = searchParams.get("tab") as StageTab | null;

  const [activeTab, setActiveTab] = useState<StageTab>("mastery");
  const [selectedCanvasStage, setSelectedCanvasStage] = useState<number>(0);
  const [selectedSdlcStage, setSelectedSdlcStage] = useState<number>(0);
  const [selectedCatalystStage, setSelectedCatalystStage] = useState<number>(0);
  const [selectedFlowId, setSelectedFlowId] = useState<string>("mastery");

  // Sync tab with URL query parameter
  useEffect(() => {
    const validTabs: StageTab[] = ["mastery", "lakehouse", "sdlc", "catalyst", "flows"];
    if (queryTab && validTabs.includes(queryTab)) {
      setActiveTab(queryTab);
    }
  }, [queryTab]);

  const handleTabChange = (tab: StageTab) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    router.replace(url.toString(), { scroll: false });
  };

  // 1. 4-Stage Mastery Data
  const masteryStages = [
    {
      stageNum: 1,
      name: "Foundations & Open Formats",
      level: "Associate Engineer",
      color: "emerald",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      description: "Master open columnar storage, ACID transactional logs, and fundamental distributed computing primitives.",
      topics: [
        "Parquet, ORC, Avro binary serialization formats",
        "Delta Lake 4.0 & Apache Iceberg v3 transaction logs",
        "Medallion architecture (Bronze -> Silver -> Gold)",
        "ACID isolation levels (Snapshot Isolation vs Serializable)",
        "PySpark DataFrame API basics & lazy evaluation",
      ],
      deliverables: "Build an ingestion pipeline consuming raw JSON into append-only Bronze Delta tables with schema enforcement.",
      interviewCriteria: "Can you explain why Parquet requires immutable rewrites during updates and how ACID transaction logs solve this?",
      link: "/guided-learning?stage=1",
    },
    {
      stageNum: 2,
      name: "Core Engineering & Distributed Pipelines",
      level: "Senior Data Engineer",
      color: "blue",
      badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      description: "Design fault-tolerant batch and streaming pipelines, optimize execution engines, and implement dimensional modeling.",
      topics: [
        "Structured Streaming with checkpointing and state stores",
        "Spark shuffle mechanics, partitions, and hash aggregations",
        "Kimball star schemas & SCD Type 2 dimension management",
        "Data quality assertions via Great Expectations & dbt tests",
        "Vectorized execution with Apache Arrow and Polars",
      ],
      deliverables: "Implement an exactly-once streaming CDC pipeline from Kafka to Silver Delta with Microbatch watermarking and deduplication.",
      interviewCriteria: "How do you mitigate data skew in a high-cardinality join when 5% of keys represent 80% of rows?",
      link: "/guided-learning?stage=2",
    },
    {
      stageNum: 3,
      name: "Advanced Distributed Patterns & Reliability",
      level: "Lead / Staff Engineer",
      color: "orange",
      badgeColor: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      description: "Engineer high-scale memory tuning, adaptive query execution, cross-engine interoperability, and cost optimization.",
      topics: [
        "Tungsten execution engine, off-heap memory, and G1GC tuning",
        "Adaptive Query Execution (AQE): dynamic coalescing & skew joins",
        "UniForm & Polaris REST catalog multi-engine synchronization",
        "FinOps unit cost modeling, cluster rightsizing, and spot instances",
        "Disaster recovery, geo-replication, and point-in-time recovery",
      ],
      deliverables: "Architect a multi-tenant Databricks / Fabric platform supporting 200+ concurrent analysts with sub-second Direct Lake SLA.",
      interviewCriteria: "Walk me through how AQE dynamically adapts physical shuffle partitions at runtime based on map output statistics.",
      link: "/guided-learning?stage=3",
    },
    {
      stageNum: 4,
      name: "Staff & Principal Lakehouse Architect",
      level: "Principal Architect",
      color: "purple",
      badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      description: "Define global data strategy, cross-cloud governance, AI agent infrastructure, and enterprise data mesh topologies.",
      topics: [
        "Federated catalog architecture (Unity Catalog OSS & Apache Polaris)",
        "Zero-copy cross-cloud data sharing protocols (Delta Sharing)",
        "LLM & RAG pipelines with vector databases and MCP protocols",
        "NIST SSDF supply-chain security, RBAC/ABAC row-level security",
        "Decoupled storage and compute economics at petabyte scale",
      ],
      deliverables: "Design an enterprise Lakehouse operating model across Azure, AWS, and GCP with centralized zero-trust governance.",
      interviewCriteria: "Defend your choice between Apache Iceberg and Delta Lake for a Fortune 50 organization operating in multi-cloud environments.",
      link: "/guided-learning?stage=4",
    },
  ];

  // 2. 7-Stage Lakehouse Flow Data
  const canvasStages: CanvasStage[] = [
    {
      step: "Ingestion",
      topicKey: "kafka",
      title: "Stage 1: Real-Time & Event-Driven Ingestion",
      tech: "Kafka · Flink · Debezium · Event Hubs",
      summary: "Distributed high-throughput streaming fabric decoupling producers from downstream Lakehouse storage. Implements zero-loss CDC capture, exactly-once stream processing, and schema validation at entry.",
      standards: "CloudEvents 1.0, Apache Avro / Protobuf schema registries, Kafka idempotent producers (acks=all).",
      failureModes: [
        "Consumer group lag spikes during downstream backpressure.",
        "Poison-pill messages lacking valid schemas crashing stream workers.",
        "Partition rebalancing storms causing duplicate processing windows.",
      ],
      code: `# PySpark Structured Streaming with Idempotent CDC Ingestion
from pyspark.sql.functions import from_json, col

raw_stream = (spark.readStream
    .format("kafka")
    .option("kafka.bootstrap.servers", "kafka:9092")
    .option("subscribe", "cdc.orders.v1")
    .option("startingOffsets", "latest")
    .option("failOnDataLoss", "false")
    .load())

parsed = (raw_stream
    .selectExpr("CAST(key AS STRING)", "CAST(value AS STRING)")
    .select(from_json(col("value"), schema).alias("data"))
    .select("data.*"))

query = (parsed.writeStream
    .format("delta")
    .outputMode("append")
    .option("checkpointLocation", "/mnt/lake/checkpoints/orders_bronze")
    .start("/mnt/lake/bronze/orders"))`,
      codeLang: "python",
      codeFilename: "streaming_ingestion.py",
    },
    {
      step: "Storage",
      topicKey: "delta",
      title: "Stage 2: Open Lakehouse Storage & Table Formats",
      tech: "Delta Lake 4.0 · Apache Iceberg v3 · Parquet · V-Order",
      summary: "ACID transactional layer decoupling compute from commodity object storage (ADLS Gen2, AWS S3, GCS). Enforces schema evolution, deletion vectors, and multi-format compatibility (UniForm).",
      standards: "Open table format specification v3, Parquet columnar storage, zstandard compression.",
      failureModes: [
        "Small file proliferation degrading scan throughput without auto-compaction.",
        "Concurrent commit conflicts on append/update collisions without deletion vectors.",
        "Unbounded transaction log growth without periodic VACUUM retention cleanup.",
      ],
      code: `-- Delta Lake 4.0: Zero-Copy Iceberg UniForm with Liquid Clustering
ALTER TABLE silver.customer_transactions SET TBLPROPERTIES (
  'delta.universalFormat.enabledFormats' = 'iceberg',
  'delta.enableDeletionVectors' = 'true',
  'delta.autoOptimize.autoCompact' = 'true'
);

OPTIMIZE silver.customer_transactions 
CLUSTER BY (customer_region, transaction_date);`,
      codeLang: "sql",
      codeFilename: "storage_optimization.sql",
    },
    {
      step: "Catalog",
      topicKey: "unity",
      title: "Stage 3: Metadata Control Plane & Governance",
      tech: "Unity Catalog OSS · Apache Polaris REST · Purview",
      summary: "Unified metadata control plane enforcing centralized security, fine-grained access control (RBAC/ABAC), automated column-level lineage, and cross-engine catalog federation.",
      standards: "Apache Polaris REST Catalog API, OAuth 2.0 bearer token authentication, OpenLineage standard.",
      failureModes: [
        "Token expiration during multi-hour distributed batch query jobs.",
        "Catalog sync latency between primary writes and secondary federated read replicas.",
        "Permissive IAM role escalation bypassing row-level security masking policies.",
      ],
      code: `-- Unity Catalog: Fine-Grained Row & Column Level Masking
CREATE OR REPLACE FUNCTION mask_email(email STRING)
RETURNS STRING
RETURN CASE 
  WHEN IS_ACCOUNT_GROUP_MEMBER('admin_role') THEN email
  ELSE CONCAT(LEFT(email, 2), '****@', SPLIT(email, '@')[1])
END;

ALTER TABLE gold.customer_dim 
ALTER COLUMN email SET MASK mask_email;`,
      codeLang: "sql",
      codeFilename: "catalog_security.sql",
    },
    {
      step: "Compute",
      topicKey: "spark",
      title: "Stage 4: Vectorized Compute & Transformation",
      tech: "Apache Spark 4.0 · Databricks Photon · Trino · DuckDB",
      summary: "Decoupled distributed processing engines executing complex batch transformations, joins, and aggregations using SIMD hardware acceleration and Whole-Stage Code Generation.",
      standards: "ANSI SQL:2016 compliance, Apache Arrow in-memory format, C++ vectorized execution.",
      failureModes: [
        "Executor out-of-memory (OOM) crashes from unoptimized JVM GC pressure.",
        "Disk spill thrashing during wide distributed shuffle operations.",
        "Data skew causing single task stragglers to dominate 90% of total stage duration.",
      ],
      code: `# Spark 4.0 AQE Optimization Configuration
spark.conf.set("spark.sql.adaptive.enabled", "true")
spark.conf.set("spark.sql.adaptive.coalescePartitions.enabled", "true")
spark.conf.set("spark.sql.adaptive.skewJoin.enabled", "true")
spark.conf.set("spark.sql.adaptive.localShuffleReader.enabled", "true")
spark.conf.set("spark.sql.shuffle.partitions", "auto")

# Vectorized join with skew mitigation
df_joined = df_fact.join(df_dim.hint("broadcast"), "tenant_id")`,
      codeLang: "python",
      codeFilename: "spark_compute_engine.py",
    },
    {
      step: "Serving",
      topicKey: "fabric",
      title: "Stage 5: Low-Latency Semantic Serving",
      tech: "Power BI Direct Lake · Snowflake Cortex · ClickHouse",
      summary: "Zero-copy semantic layer enabling sub-second analytical queries directly against Parquet data in storage, eliminating redundant caching and expensive ETL exports.",
      standards: "VertiPaq in-memory columnar paging, Direct Lake metadata binding, open JDBC/ODBC.",
      failureModes: [
        "Silent fallback to DirectQuery when DAX formulas or data models exceed SKU limits.",
        "Concurrency throttling during peak reporting hours on fixed capacity SKUs.",
        "Cold-start latency spikes on initial memory page load from cloud object storage.",
      ],
      code: `# Fabric Notebook: Generating V-Order Parquet for Sub-Second Direct Lake
spark.conf.set("spark.sql.parquet.vorder.enabled", "true")

(df_gold.write
    .format("delta")
    .mode("overwrite")
    .option("overwriteSchema", "true")
    .save("abfss://workspace@onelake.dfs.fabric.microsoft.com/lakehouse/Tables/fact_revenue"))`,
      codeLang: "python",
      codeFilename: "direct_lake_serving.py",
    },
    {
      step: "AI & Agents",
      topicKey: "rag",
      title: "Stage 6: AI, Vector Search & Agentic Protocol",
      tech: "DSPy · LangChain · Vector Embeddings · Model Context Protocol (MCP)",
      summary: "AI data plane integrating LLMs with structured lakehouse assets. Provides semantic chunking, vector indexing, real-time embeddings, and tool-augmented agent workflows.",
      standards: "Model Context Protocol (MCP), HNSW vector index, cosine similarity distance.",
      failureModes: [
        "Vector drift and hallucination without continuous RAG evaluation gates.",
        "Embedding token cost explosion on uncontrolled batch re-indexing jobs.",
        "Context window overflow when stuffing excessive unstructured table chunks.",
      ],
      code: `import dspy
from databricks.vector_search.client import VectorSearchClient

client = VectorSearchClient()
index = client.get_index(endpoint_name="vs_endpoint", index_name="lakehouse.ai.doc_index")

class RAGQuery(dspy.Module):
    def __init__(self):
        super().__init__()
        self.retrieve = dspy.Retrieve(k=5)
        self.generate = dspy.ChainOfThought("context, question -> answer")

    def forward(self, question):
        context = self.retrieve(question).passages
        return self.generate(context=context, question=question)`,
      codeLang: "python",
      codeFilename: "lakehouse_rag_agent.py",
    },
    {
      step: "FinOps",
      topicKey: "governance",
      title: "Stage 7: Governance, Lineage & FinOps Engineering",
      tech: "Great Expectations · OpenLineage · Cost Attribution",
      summary: "Continuous quality gates, automated SLA tracking, and compute cost optimization ensuring enterprise stability and predictable return on data platform investments.",
      standards: "OpenLineage 1.0, NIST SSDF supply chain standards, FinOps Foundation framework.",
      failureModes: [
        "Idle cluster compute burn without automated 2-minute inactivity shutdown.",
        "Orphaned storage snapshots consuming petabytes of unmonitored object storage.",
        "Silent schema drift downstream without automated contract testing alerts.",
      ],
      code: `# Databricks Asset Bundle (DAB) FinOps Governance Resource Definition
bundle:
  name: finops_governance_pipeline

resources:
  jobs:
    nightly_maintenance:
      name: "Lakehouse Storage Compaction & Vacuum"
      tasks:
        - task_key: vacuum_stale_snapshots
          spark_python_task:
            python_file: "scripts/vacuum_tables.py"
          job_cluster_key: cost_optimized_single_node
      job_clusters:
        - job_cluster_key: cost_optimized_single_node
          new_cluster:
            spark_version: "14.3.x-scala2.12"
            node_type_id: "Standard_D4s_v5"
            autostop_mins: 10
            spark_conf:
              "spark.databricks.cluster.profile": "singleNode"`,
      codeLang: "yaml",
      codeFilename: "databricks_bundle_finops.yml",
    },
  ];

  // 3. 6-Stage SDLC Delivery Data
  const sdlcStages = [
    {
      stageNum: 1,
      phase: "Product Discovery & Work Shaping",
      badge: "Governance & Scoping",
      color: "blue",
      tagline: "Define concrete business outcomes, latency SLAs, and schema contracts before writing code.",
      deliverables: [
        "Product Requirements Document (PRD) with quantitative SLOs (p95 latency, daily freshness).",
        "Schema Contract v1 specifying nullable constraints, types, and primary key uniqueness.",
        "Data classification tagging (PII, PCI-DSS, Confidential) and access policy plan.",
      ],
      risks: "Vague upstream requirements leading to mid-project pipeline redesigns and schema breaking changes.",
      mitigation: "Enforce bi-directional contract testing between source producers and data engineering consumers.",
    },
    {
      stageNum: 2,
      phase: "Ingestion & Raw Landing (Bronze)",
      badge: "Raw Storage & CDC",
      color: "emerald",
      tagline: "Capture source changes with zero data loss, immutable append semantics, and replayability.",
      deliverables: [
        "Idempotent CDC ingestion pipelines using Debezium, Event Hubs, or Cloud Object Storage triggers.",
        "Append-only Bronze Delta / Iceberg tables with strict audit headers (_ingest_ts, _source_file).",
        "Dead-letter queues (DLQ) isolating malformed payloads without halting stream consumers.",
      ],
      risks: "Schema evolution breaking downstream parsers, or poison-pill events causing stream task restarts.",
      mitigation: "Configure schema rescue columns (`_rescued_data`) and schema evolution modes.",
    },
    {
      stageNum: 3,
      phase: "Transformation & Semantic Modeling (Silver/Gold)",
      badge: "Data Quality & Curated",
      color: "purple",
      tagline: "Cleanse, deduplicate, validate, and conform raw inputs into curated business entities.",
      deliverables: [
        "Deterministic SCD Type 2 dimension pipelines and conformed star-schema facts.",
        "Automated data quality assertion suites (Great Expectations / Soda Core / dbt tests).",
        "Z-Order / Liquid Clustering optimization aligning storage layout with query filter patterns.",
      ],
      risks: "Data skew causing executor OOM during wide joins, or duplicate key collisions in merge statements.",
      mitigation: "Implement AQE skew hints, deletion vectors, and deterministic row-number deduplication.",
    },
    {
      stageNum: 4,
      phase: "Quality Gates & Pre-Deployment Testing",
      badge: "CI/CD & Verification",
      color: "orange",
      tagline: "Run automated unit, integration, and contract tests against isolated ephemeral test environments.",
      deliverables: [
        "100% test coverage on transformation logic using local PySpark / DuckDB test runners.",
        "Ephemeral test lakehouses seeded with synthetic datasets to validate schema migrations.",
        "Static code analysis, credential scanning (Gitleaks), and type validation (mypy / flake8).",
      ],
      risks: "Hardcoded production storage paths or credentials leaking into git repositories.",
      mitigation: "Enforce pre-commit hooks, Azure Key Vault / HashiCorp secrets, and environment abstraction.",
    },
    {
      stageNum: 5,
      phase: "CI/CD Automated Production Deployment",
      badge: "Release & IaC",
      color: "cyan",
      tagline: "Deploy infrastructure and pipelines predictably using Declarative Asset Bundles and GitOps.",
      deliverables: [
        "Databricks Asset Bundles (DABs) or Terraform Lakehouse resource configurations.",
        "Blue/green or zero-downtime canary deployment pipelines via GitHub Actions or Azure DevOps.",
        "Automated rollback scripts reversing schema migrations upon production assertion failure.",
      ],
      risks: "Concurrent job executions locking Delta tables or failing dependent upstream DAG runs.",
      mitigation: "Implement orchestrator pool limits, mutex locks, and semantic versioned release tags.",
    },
    {
      stageNum: 6,
      phase: "SRE Observability & FinOps Governance",
      badge: "Operations & Cost",
      color: "rose",
      tagline: "Monitor end-to-end data freshness, pipeline latency, compute unit consumption, and data drift.",
      deliverables: [
        "Real-time OpenTelemetry & Prometheus metrics tracking pipeline duration and executor CPU/RAM.",
        "Automated FinOps cost attribution tagging every job run with project, team, and cost-center IDs.",
        "On-call pager duty escalation trees with automated runbooks for Sev-1 recovery.",
      ],
      risks: "Silent data corruption going undetected for weeks, or zombie clusters inflating monthly cloud spend.",
      mitigation: "Implement anomaly detection on row-count distributions and 2-minute cluster auto-termination.",
    },
  ];

  // 4. 5-Stage Spark Catalyst Pipeline Data
  const catalystStages = [
    {
      stageNum: 1,
      name: "Analysis & Catalog Resolution",
      input: "Unresolved Logical Plan (AST)",
      output: "Resolved Logical Plan",
      color: "blue",
      description: "Resolves relations, table names, attributes, and column types against the catalog metastore (Hive, Unity, Polaris). Verifies data types and functions exist.",
      keyTechniques: ["Metastore metadata lookup", "Attribute resolution", "Type coercion & implicit casting"],
      pitfall: "Catalog lookup latency spikes on deeply nested schemas or remote REST metastores.",
    },
    {
      stageNum: 2,
      name: "Logical Optimization (Rule-Based)",
      input: "Resolved Logical Plan",
      output: "Optimized Logical Plan",
      color: "emerald",
      description: "Applies dozens of deterministic algebraic transformation rules to minimize intermediate data volume before execution.",
      keyTechniques: ["Constant Folding", "Predicate Pushdown (PPD)", "Column Projection Pruning", "Null Propagation"],
      pitfall: "Complex UDFs that act as black boxes, blocking predicate pushdown down into storage layers.",
    },
    {
      stageNum: 3,
      name: "Physical Planning & Join Selection",
      input: "Optimized Logical Plan",
      output: "Selected Physical Plan",
      color: "purple",
      description: "Transforms logical operations into physical execution operators. Uses Cost-Based Optimizer (CBO) to choose join algorithms.",
      keyTechniques: ["BroadcastHashJoin (BHJ)", "ShuffleHashJoin (SHJ)", "SortMergeJoin (SMJ)", "Cost-Based Cardinality Estimation"],
      pitfall: "Missing table statistics causing Catalyst to choose expensive SortMergeJoin instead of Broadcast join.",
    },
    {
      stageNum: 4,
      name: "Adaptive Dynamic Stage Adaptation (AQE)",
      input: "Initial Physical Plan",
      output: "Adapted Runtime Physical Plan",
      color: "orange",
      description: "Re-optimizes remaining physical stages dynamically at runtime based on real-time map output statistics after each shuffle stage boundary.",
      keyTechniques: ["Dynamically Coalescing Shuffle Partitions", "Converting SortMergeJoin to BroadcastHashJoin", "Handling Skew Joins dynamically"],
      pitfall: "AQE cannot optimize across non-shuffle boundaries or when broadcast thresholds are disabled.",
    },
    {
      stageNum: 5,
      name: "Whole-Stage Code Generation (Tungsten)",
      input: "Physical Plan Subtrees",
      output: "Compiled Java Bytecode / Photon C++",
      color: "cyan",
      description: "Collapses multi-operator pipelines into a single tight loop compiled to raw bytecode. Executes against off-heap binary memory without JVM object overhead.",
      keyTechniques: ["Janino runtime bytecode compiler", "UnsafeRow off-heap memory layout", "SIMD vector register optimization"],
      pitfall: "Very large queries exceeding Java 64KB bytecode method limit, triggering silent fallback to slower interpreted mode.",
    },
  ];

  // 5. Interactive Production Flows
  const productionFlows = [
    { id: "mastery", label: "Mastery Roadmap Flow", component: <MasteryRoadmapFlow /> },
    { id: "lakehouse", label: "Lakehouse Medallion Flow", component: <LakehouseMedallionFlow /> },
    { id: "enterprise", label: "Enterprise Stack Flow", component: <EnterpriseStackFlow /> },
    { id: "sdlc", label: "SDLC Pipeline Flow", component: <SdlcPipelineFlow /> },
    { id: "execution", label: "Pipeline Execution Flow", component: <PipelineExecutionFlow /> },
    { id: "design", label: "System Design Flow", component: <SystemDesignFlow /> },
    { id: "defense", label: "Interview Defense Flow", component: <InterviewDefenseFlow /> },
    { id: "optimization", label: "Optimization Flow", component: <OptimizationFlow /> },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 pb-16 w-full max-w-7xl 2xl:max-w-[1800px] 3xl:max-w-[2200px] 4xl:max-w-none mx-auto px-2 sm:px-4 2xl:px-6">
      {/* ─── Hero Header ─── */}
      <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-purple-950/40 via-blue-950/30 to-[var(--surface-1)] border border-purple-500/20 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl 2xl:max-w-5xl 3xl:max-w-6xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-400">
              <Layers size={13} />
              <span>Unified Architecture &amp; Delivery Stages Hub</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--foreground)] tracking-tight">
              Mastery Stages &amp; Systems Lifecycle
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
              The single authoritative hub grouping all architectural stages, delivery lifecycles, and query execution pipelines across the modern data platform: from career progression and Lakehouse flow to production SDLC and Spark Catalyst optimization.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <div className="px-3 py-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-center">
              <div className="text-base font-bold text-purple-400 leading-none">4 Stages</div>
              <div className="text-[10px] text-[var(--muted-foreground)] mt-0.5">Mastery Path</div>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-center">
              <div className="text-base font-bold text-blue-400 leading-none">7 Stages</div>
              <div className="text-[10px] text-[var(--muted-foreground)] mt-0.5">Lakehouse Flow</div>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-center">
              <div className="text-base font-bold text-emerald-400 leading-none">6 Stages</div>
              <div className="text-[10px] text-[var(--muted-foreground)] mt-0.5">SDLC Playbook</div>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-center">
              <div className="text-base font-bold text-cyan-400 leading-none">5 Stages</div>
              <div className="text-[10px] text-[var(--muted-foreground)] mt-0.5">Catalyst Engine</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main Subtab Switcher ─── */}
      <div className="flex items-center gap-1.5 p-1 rounded-full bg-[var(--surface-2)] border border-[var(--border)] overflow-x-auto scrollbar-none max-w-fit shadow-xs">
        {[
          { id: "mastery", label: "4-Stage Mastery Journey", icon: GraduationCap },
          { id: "lakehouse", label: "7-Stage Lakehouse Flow", icon: Workflow },
          { id: "sdlc", label: "6-Stage SDLC Playbook", icon: GitBranch },
          { id: "catalyst", label: "5-Stage Catalyst Pipeline", icon: Cpu },
          { id: "flows", label: "8 Interactive Production Flows", icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id as StageTab)}
              className={cn(
                "flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer",
                isSelected
                  ? "bg-purple-600 text-white shadow-xs font-semibold"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              )}
            >
              <Icon size={13} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. 4-STAGE MASTERY JOURNEY TAB */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === "mastery" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)]">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
                <GraduationCap size={18} className="text-purple-400" />
                The 4-Stage Architectural Mastery Journey
              </h2>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                Structured progressive curriculum from open table foundations to Staff &amp; Principal Lakehouse systems architecture.
              </p>
            </div>
            <Link
              href="/guided-learning"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors shrink-0 shadow-xs"
            >
              <span>Explore Guided Topics</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4">
            {masteryStages.map((stage) => (
              <div
                key={stage.stageNum}
                className="p-4 sm:p-5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-4 shadow-xs"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn("text-xs font-bold px-2.5 py-0.5 rounded-full border", stage.badgeColor)}>
                      Stage {stage.stageNum} · {stage.level}
                    </span>
                    <span className="text-[11px] font-mono text-[var(--muted-foreground)]">
                      0{stage.stageNum} / 04
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[var(--foreground)] tracking-tight">
                    {stage.name}
                  </h3>

                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                    {stage.description}
                  </p>

                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-[var(--foreground)] uppercase tracking-wider block">
                      Core Competencies &amp; Pillars:
                    </span>
                    <ul className="space-y-1 text-xs text-[var(--muted-foreground)]">
                      {stage.topics.map((topic, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 size={13} className="text-purple-400 shrink-0 mt-0.5" />
                          <span>{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--border)] space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] space-y-1">
                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
                      Hands-On Deliverable:
                    </span>
                    <p className="text-[11px] text-[var(--foreground)] leading-relaxed">
                      {stage.deliverables}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-purple-950/20 border border-purple-500/20 space-y-1">
                    <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider block">
                      Architectural Defense Question:
                    </span>
                    <p className="text-[11px] text-purple-200 leading-relaxed italic">
                      &ldquo;{stage.interviewCriteria}&rdquo;
                    </p>
                  </div>

                  <div className="pt-1 flex items-center justify-between">
                    <Link
                      href={stage.link}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      <span>Launch Stage {stage.stageNum} Track</span>
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Career Flow Component */}
          <div className="p-4 sm:p-5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] space-y-3">
            <h3 className="text-sm sm:text-base font-bold text-[var(--foreground)] flex items-center gap-2">
              <Workflow size={16} className="text-purple-400" />
              Role Evolution Roadmap Flow
            </h3>
            <MasteryRoadmapFlow />
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. 7-STAGE LAKEHOUSE FLOW TAB (MOVED FROM MODERN-STACK) */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === "lakehouse" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)]">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
                <Workflow size={18} className="text-purple-400" />
                Enterprise Modern Lakehouse &amp; AI Stack Flow (7 Stages)
              </h2>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                Click any stage to inspect the technical architecture, SLAs, standards, failure modes, and verified production code.
              </p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 self-start sm:self-auto">
              Stage {selectedCanvasStage + 1} of {canvasStages.length} Active
            </span>
          </div>

          {/* 7-Stage Horizontal Nav */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {canvasStages.map((stage, idx) => {
              const isSelected = selectedCanvasStage === idx;
              return (
                <button
                  key={stage.step}
                  onClick={() => setSelectedCanvasStage(idx)}
                  className={cn(
                    "p-2.5 rounded-xl border text-left transition-all relative group cursor-pointer",
                    isSelected
                      ? "bg-purple-600/15 border-purple-500 shadow-sm shadow-purple-500/15 ring-1 ring-purple-500/50"
                      : "bg-[var(--surface-1)] border-[var(--border)] hover:border-purple-500/40 hover:bg-[var(--surface-2)]"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <TopicIcon topic={stage.topicKey} size={18} />
                    <span className="text-[10px] font-mono text-[var(--muted-foreground)]">
                      0{idx + 1}
                    </span>
                  </div>
                  <div className="font-bold text-xs text-[var(--foreground)] mt-2 break-words">
                    {stage.step}
                  </div>
                  <div className="text-[10px] text-[var(--muted-foreground)] mt-0.5 truncate">
                    {stage.tech.split("·")[0]}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Stage Detail Card */}
          {(() => {
            const cur = canvasStages[selectedCanvasStage];
            return (
              <div className="p-4 sm:p-5 rounded-xl bg-[var(--surface-1)] border border-purple-500/30 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border)]">
                  <div className="space-y-0.5">
                    <div className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider">
                      Stage {selectedCanvasStage + 1} Architecture Deep Dive
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
                      {cur.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg self-start sm:self-auto">
                    <CheckCircle2 size={13} />
                    <span>{cur.tech}</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[var(--foreground)] leading-relaxed">
                  {cur.summary}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] space-y-1.5">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                      Industry Tech Standards
                    </span>
                    <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                      {cur.standards}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-orange-950/20 border border-orange-500/20 space-y-1.5">
                    <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider block flex items-center gap-1">
                      <AlertTriangle size={11} />
                      Production Pitfalls &amp; Mitigations
                    </span>
                    <ul className="space-y-1 text-xs text-orange-200/80">
                      {cur.failureModes.map((fm, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-orange-400 font-bold">•</span>
                          <span>{fm}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                      <Code2 size={13} className="text-purple-400" />
                      Production Reference Implementation ({cur.codeFilename})
                    </span>
                  </div>
                  <CodeBlock
                    code={cur.code}
                    language={cur.codeLang}
                    filename={cur.codeFilename}
                    showLineNumbers={true}
                  />
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 3. 6-STAGE SDLC DELIVERY PLAYBOOK TAB */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === "sdlc" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)]">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
                <GitBranch size={18} className="text-purple-400" />
                The 6-Stage Enterprise Data Delivery Playbook
              </h2>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                From product discovery and schema contracts to SRE observability and FinOps governance.
              </p>
            </div>
            <Link
              href="/dataops?tab=lifecycle"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--border)] text-xs font-semibold text-[var(--foreground)] transition-colors shrink-0"
            >
              <span>View Full 152 Controls</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {/* 6-Stage Horizontal Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {sdlcStages.map((stage, idx) => {
              const isSelected = selectedSdlcStage === idx;
              return (
                <button
                  key={stage.stageNum}
                  onClick={() => setSelectedSdlcStage(idx)}
                  className={cn(
                    "p-3 rounded-xl border text-left transition-all relative cursor-pointer",
                    isSelected
                      ? "bg-purple-600/15 border-purple-500 shadow-sm ring-1 ring-purple-500/50"
                      : "bg-[var(--surface-1)] border-[var(--border)] hover:border-purple-500/40 hover:bg-[var(--surface-2)]"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                      Stage 0{stage.stageNum}
                    </span>
                  </div>
                  <div className="font-bold text-xs text-[var(--foreground)] mt-1.5 line-clamp-1">
                    {stage.phase.split("&")[0]}
                  </div>
                  <div className="text-[10px] text-[var(--muted-foreground)] mt-0.5 truncate">
                    {stage.badge}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected SDLC Stage Deep Dive */}
          {(() => {
            const cur = sdlcStages[selectedSdlcStage];
            return (
              <div className="p-4 sm:p-5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border)]">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                      Stage {cur.stageNum} Breakdown
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
                      {cur.phase}
                    </h3>
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                      {cur.tagline}
                    </p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 self-start sm:self-auto font-medium">
                    {cur.badge}
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider block">
                    Core Technical Deliverables:
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                    {cur.deliverables.map((item, i) => (
                      <div key={i} className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] space-y-1">
                        <div className="text-[11px] font-bold text-purple-400">Deliverable {i + 1}</div>
                        <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="p-3 rounded-lg bg-orange-950/20 border border-orange-500/20 space-y-1">
                    <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider block">
                      Architectural Risk
                    </span>
                    <p className="text-xs text-orange-200/90 leading-relaxed">{cur.risks}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 space-y-1">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                      Production Mitigation
                    </span>
                    <p className="text-xs text-emerald-200/90 leading-relaxed">{cur.mitigation}</p>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Interactive SDLC Flow Diagram */}
          <div className="p-4 sm:p-5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] space-y-3">
            <h3 className="text-sm sm:text-base font-bold text-[var(--foreground)] flex items-center gap-2">
              <Workflow size={16} className="text-purple-400" />
              Interactive SDLC Delivery Canvas
            </h3>
            <SdlcPipelineFlow />
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 4. 5-STAGE SPARK CATALYST PIPELINE TAB */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === "catalyst" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)]">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
                <Cpu size={18} className="text-purple-400" />
                The 5-Stage Apache Spark Catalyst Engine Pipeline
              </h2>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                Physical query execution pipeline: from unresolved abstract syntax trees to dynamic AQE and Whole-Stage CodeGen.
              </p>
            </div>
            <Link
              href="/spark-catalyst"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors shrink-0 shadow-xs"
            >
              <span>Launch Live Simulator</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5">
            {catalystStages.map((stage, idx) => {
              const isSelected = selectedCatalystStage === idx;
              return (
                <button
                  key={stage.stageNum}
                  onClick={() => setSelectedCatalystStage(idx)}
                  className={cn(
                    "p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between",
                    isSelected
                      ? "bg-purple-600/15 border-purple-500 shadow-sm ring-1 ring-purple-500/50"
                      : "bg-[var(--surface-1)] border-[var(--border)] hover:border-purple-500/40 hover:bg-[var(--surface-2)]"
                  )}
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                      Stage 0{stage.stageNum}
                    </span>
                    <h4 className="text-xs font-bold text-[var(--foreground)] leading-tight">
                      {stage.name}
                    </h4>
                  </div>
                  <div className="text-[10px] text-[var(--muted-foreground)] mt-3 pt-2 border-t border-[var(--border)]">
                    {stage.input}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Catalyst Stage Details */}
          {(() => {
            const cur = catalystStages[selectedCatalystStage];
            return (
              <div className="p-4 sm:p-5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border)]">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                      Catalyst Execution Stage {cur.stageNum} of 5
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
                      {cur.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-[var(--muted-foreground)]">
                    <span className="px-2 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--border)]">
                      Input: {cur.input}
                    </span>
                    <span>→</span>
                    <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      Output: {cur.output}
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[var(--foreground)] leading-relaxed">
                  {cur.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] space-y-1.5">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                      Core Optimization Techniques:
                    </span>
                    <ul className="space-y-1 text-xs text-[var(--muted-foreground)]">
                      {cur.keyTechniques.map((tech, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 size={12} className="text-cyan-400 shrink-0 mt-0.5" />
                          <span>{tech}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-lg bg-orange-950/20 border border-orange-500/20 space-y-1.5">
                    <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider block flex items-center gap-1">
                      <AlertTriangle size={11} />
                      Production Gotcha
                    </span>
                    <p className="text-xs text-orange-200/90 leading-relaxed">
                      {cur.pitfall}
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 5. 8 INTERACTIVE PRODUCTION FLOWS TAB */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === "flows" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)]">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
                <Sparkles size={18} className="text-purple-400" />
                8 Interactive Production Flow Diagrams
              </h2>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                Every architectural flow on the platform, initialized to Stage 1 with interactive step-by-step inspector panels.
              </p>
            </div>
            <span className="text-xs font-mono px-2 py-1 rounded bg-[var(--surface-2)] text-[var(--muted-foreground)] border border-[var(--border)]">
              8 Flow Diagrams
            </span>
          </div>

          {/* Flow Diagram Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] overflow-x-auto scrollbar-none">
            {productionFlows.map((flow) => {
              const isSelected = selectedFlowId === flow.id;
              return (
                <button
                  key={flow.id}
                  onClick={() => setSelectedFlowId(flow.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer shrink-0",
                    isSelected
                      ? "bg-purple-600 text-white shadow-xs"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
                  )}
                >
                  {flow.label}
                </button>
              );
            })}
          </div>

          {/* Active Flow Rendered */}
          <div className="p-4 sm:p-5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] space-y-3 shadow-xs">
            {productionFlows.find((f) => f.id === selectedFlowId)?.component}
          </div>
        </div>
      )}

      {/* ── Comprehensive Lakehouse Architecture Blueprint & Educational Guide ── */}
      <div className="pt-4">
        <LakehouseArchitectureGuide />
      </div>
    </div>
  );
}
