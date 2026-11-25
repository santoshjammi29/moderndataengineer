#!/usr/bin/env python3
"""
Review and update incomplete or abruptly ending definitions in src/data/json/data_concepts.json.
Provides complete, authoritative, and grammatically complete architectural definitions.
"""

import json

CONCEPTS_PATH = "src/data/json/data_concepts.json"

UPDATED_DEFINITIONS = {
    "databricks-acid-transactions": (
        "The set of transactional guarantees (Atomicity, Consistency, Isolation, Durability) "
        "enforced by Delta Lake on top of cloud object storage using an append-only transaction log and optimistic concurrency control."
    ),
    "databricks-transaction-log-delta-log": (
        "The ordered, append-only directory of JSON commit files and Parquet checkpoints (`_delta_log`) "
        "that serves as the single source of truth for all metadata, schema versions, and physical file operations in a Delta table."
    ),
    "databricks-optimize-file-compaction": (
        "A Delta Lake table maintenance command that bin-packs small files (1MB–10MB) into optimal larger files (~1GB) "
        "to reduce cloud object storage API overhead and significantly accelerate analytical query scanning performance."
    ),
    "databricks-vacuum-storage-lifecycle": (
        "A Delta Lake table maintenance command that permanently purges unreferenced physical data files "
        "older than a configured retention safety threshold (default 7 days) to reclaim object storage capacity."
    ),
    "databricks-delta-table-properties-configuration": (
        "Configurable table-level metadata properties in Delta Lake that govern engine behavior, "
        "including Change Data Feed enablement, Deletion Vector activation, column mapping mode, and checkpoint frequency."
    ),
    "databricks-shuffle-operations": (
        "The distributed physical data redistribution process across cluster executor nodes "
        "triggered by wide transformations such as `groupBy()`, `join()`, `distinct()`, and `repartition()`."
    ),
    "databricks-join-strategies": (
        "The physical execution algorithms selected by the Catalyst optimizer for distributed table joins, "
        "including Broadcast Hash Join (BHJ), Sort-Merge Join (SMJ), and Shuffle Hash Join (SHJ)."
    ),
    "databricks-reading-the-spark-ui": (
        "The web-based performance monitoring and telemetry dashboard used to inspect execution plans, "
        "identify straggler tasks, detect memory spill, and profile shuffle I/O across Spark Jobs, Stages, and SQL DAGs."
    ),
    "databricks-data-skew-detection-mitigation": (
        "The process of diagnosing uneven record distributions across executor partitions using Spark UI percentiles, "
        "resolved via Adaptive Query Execution (AQE) skew join splitting or two-phase key salting."
    ),
    "databricks-memory-management-spill": (
        "The Spark Unified Memory architecture that dynamically shares RAM between Execution (shuffles/joins) "
        "and Storage (caching), spilling in-memory buffers to disk when executor memory limits are exceeded."
    ),
    "databricks-temp-views-global-temp-views": (
        "Session-scoped and cluster-scoped virtual tables that provide temporary SQL query interfaces over DataFrames "
        "without persisting physical data files to storage."
    ),
    "databricks-complex-types-array-struct-map": (
        "Composite Spark SQL data types (ARRAY, STRUCT, MAP) representing hierarchical and nested data schemas, "
        "queried using dot-notation, array indexing, and higher-order functions."
    ),
    "databricks-higher-order-functions": (
        "Built-in Spark SQL functions (`transform`, `filter`, `exists`, `aggregate`) that manipulate nested arrays "
        "inline using anonymous lambda expressions without requiring expensive `explode()` operations."
    ),
    "databricks-ctes-pivot-subqueries": (
        "Advanced SQL query composition patterns—including Common Table Expressions, PIVOT aggregations, and subqueries—"
        "used to structure readable, modular, and optimized multi-step analytical transformations."
    ),
    "databricks-udfs-vs-native-functions": (
        "The architectural trade-offs between native Catalyst expressions and custom Python UDFs, "
        "highlighting serialization overhead, memory penalties, and whole-stage code generation boundaries."
    ),
    "databricks-variant-type": (
        "A native binary data type in Databricks and Spark designed to efficiently store semi-structured JSON data "
        "with sub-column shredding, indexing, and high-performance query execution."
    ),
    "databricks-merge-into-upsert-patterns": (
        "The atomic `MERGE INTO` SQL operation used to coordinate simultaneous INSERT, UPDATE, and DELETE actions "
        "between source and target Delta tables in a single ACID transaction."
    ),
    "databricks-table-constraints-generated-columns": (
        "Declarative relational integrity rules—including CHECK constraints, NOT NULL requirements, and computed generated columns—"
        "enforced by Delta Lake at write time to guarantee table quality."
    ),
    "databricks-volumes": (
        "Governed Unity Catalog storage abstractions that provide secure access, governance, and audit lineage "
        "for non-tabular files including raw CSVs, unstructured text, images, and machine learning models."
    ),
    "databricks-incremental-processing-patterns": (
        "Data pipeline design architectures that ingest and transform only new or modified data since the prior execution checkpoint, "
        "leveraging Auto Loader, Change Data Feed, and streaming watermarks."
    ),
    "databricks-scd-type-1-type-2-patterns": (
        "Dimensional modeling techniques in Delta Lake that either overwrite current dimension attribute values (SCD Type 1) "
        "or preserve historical state transitions using effective date ranges and active flags (SCD Type 2)."
    ),
    "databricks-structured-streaming-fundamentals": (
        "The scalable, fault-tolerant stream processing engine in Apache Spark that models streaming data as append-only unbounded tables, "
        "leveraging Delta Lake sources and sinks with exactly-once guarantees."
    ),
    "databricks-output-modes": (
        "The streaming sink write configurations defining whether only newly processed rows are written (Append), "
        "the entire updated aggregation table is rewritten (Complete), or modified rows are updated in-place (Update)."
    ),
    "databricks-stream-static-joins": (
        "A stateful stream enrichment pattern that joins real-time streaming DataFrames with static reference or dimensional tables "
        "without requiring unbounded streaming state retention."
    ),
    "databricks-windowed-aggregations": (
        "Time-based streaming aggregations computed over fixed non-overlapping intervals (tumbling windows) "
        "or overlapping periodic intervals (sliding windows) bounded by event-time watermarks."
    ),
    "databricks-foreachbatch-pattern": (
        "A Structured Streaming sink API method that processes each micro-batch as a static DataFrame, "
        "enabling custom multi-table writes, MERGE upserts, and external API integrations."
    ),
    "databricks-watermarks-late-data": (
        "A streaming state management mechanism (`withWatermark()`) that specifies the maximum allowable delay for incoming events, "
        "permitting Spark to evict expired state from memory."
    ),
    "databricks-stream-stream-joins": (
        "A bidirectional stateful join between two continuous real-time data streams requiring event-time watermarking "
        "and time-interval constraints on both sides to bound in-memory state buffer growth."
    ),
    "databricks-serverless-compute-economics": (
        "The FinOps cost and operational efficiency model of Databricks Serverless Compute, "
        "which eliminates idle capacity costs and cold-start latency through instant provisioning and per-workload DBU billing."
    ),
    "databricks-photon-engine": (
        "Databricks' native, high-performance vectorized query execution engine written in C++ that leverages hardware SIMD acceleration "
        "and CPU cache locality to dramatically accelerate SQL and DataFrame workloads."
    ),
    "databricks-write-optimization": (
        "Delta Lake write-time optimizations—such as `optimizeWrite` and auto-compaction—"
        "that dynamically coalesce and size Parquet data files during ingestion to avoid small-file fragmentation."
    ),
    "databricks-cluster-sizing-autoscaling": (
        "The operational strategy of balancing cluster node memory-to-core ratios and autoscaling worker limits "
        "to optimize workload parallelism while controlling cloud infrastructure spending."
    ),
    "databricks-dbu-cost-model-billing": (
        "The consumption-based billing framework where platform workloads consume Databricks Units (DBUs) "
        "based on compute SKU tiers (All-Purpose, Automated Jobs, SQL Serverless, and Lakeflow)."
    ),
    "databricks-liquid-clustering": (
        "Delta Lake 3.x's next-generation data layout engine (`CLUSTER BY`) that organizes data along space-filling curves "
        "to optimize multi-dimensional query pruning without hive partitioning or write amplification."
    ),
    "databricks-deletion-vectors": (
        "A Delta Lake storage optimization (Merge-on-Read) that tracks deleted and updated rows in compact bitmap files, "
        "eliminating the need to rewrite entire Parquet data files during DML operations."
    ),
    "databricks-merge-write-amplification": (
        "The storage I/O performance penalty in copy-on-write architectures where updating a single row "
        "forces the engine to rewrite the entire underlying Parquet file."
    ),
    "databricks-three-level-namespace": (
        "The standard 3-tier logical namespace (`catalog.schema.table_or_view`) introduced by Unity Catalog "
        "to structure enterprise data assets, manage permissions, and enforce data mesh boundaries."
    ),
    "databricks-permission-model-inheritance": (
        "The hierarchical access control model in Unity Catalog where security privileges granted on parent securable objects "
        "(Catalogs) automatically cascade down to Schemas, Tables, and Views."
    ),
    "databricks-dynamic-views-for-security": (
        "Security-hardened SQL views that evaluate user context functions (`CURRENT_USER()`, `IS_MEMBER()`) at runtime "
        "to provide row-level filtering and column-level masking without duplicating data."
    ),
    "databricks-data-lineage": (
        "The automated, real-time metadata tracking engine in Unity Catalog that captures column-level and table-level data flow lineage "
        "across queries, notebooks, workflows, and dashboards."
    ),
    "databricks-row-level-security-column-masking": (
        "Native Unity Catalog table policies that dynamically mask sensitive column data and filter accessible table rows "
        "based on caller identity and group membership."
    ),
    "databricks-external-locations-storage-credentials": (
        "Unity Catalog securable objects that encapsulate cloud identity credentials (IAM roles, Managed Identities) "
        "and associate them with specific object storage URLs for governed external table access."
    ),
    "databricks-lakeflow-connect": (
        "Databricks' managed, serverless data ingestion service providing automated Change Data Capture (CDC) pipelines "
        "from enterprise databases (Postgres, MySQL, Oracle) and SaaS platforms directly into Delta tables."
    ),
    "databricks-lakeflow-declarative-pipelines-dlt": (
        "The declarative pipeline engineering framework (formerly Delta Live Tables) that orchestrates end-to-end data workflows "
        "with automated infrastructure sizing, dependency resolution, and data quality enforcement."
    ),
    "databricks-streaming-tables-vs-materialized-views": (
        "The architectural distinction in Lakeflow between append-only Streaming Tables for continuous incremental ingestion "
        "and stateful Materialized Views for precomputed analytical query acceleration."
    ),
    "databricks-expectations-quality-rules": (
        "Declarative data quality rules in Lakeflow pipelines (`EXPECT`, `EXPECT OR DROP`, `EXPECT OR FAIL`) "
        "that audit record integrity and maintain automated telemetry on data quality metrics."
    ),
    "databricks-cdc-processing-auto-cdc-into": (
        "Declarative CDC processing primitives in Lakeflow pipelines that automatically reconcile out-of-order change logs "
        "and maintain SCD Type 1 or SCD Type 2 dimension tables."
    ),
    "databricks-error-handling-dead-letter-patterns": (
        "A resilient pipeline design pattern that routes malformed or schema-violating records into quarantined Dead-Letter Queue (DLQ) tables "
        "for offline inspection without aborting the pipeline."
    ),
    "databricks-choosing-compute-for-jobs": (
        "The architectural decision framework for matching workloads to compute tiers: Serverless (zero startup delay, auto-managed), "
        "Classic Automated Jobs clusters (custom libraries), or All-Purpose clusters."
    ),
    "databricks-secrets-management": (
        "The secure credential management framework in Databricks (Secret Scopes backed by Azure Key Vault or encrypted storage) "
        "used to securely inject tokens, API keys, and connection strings at runtime."
    ),
    "databricks-parameterization-widgets-job-parameters-task-values": (
        "The runtime parameterization suite in Databricks—including notebook widgets, job-level parameters, and inter-task dynamic task values—"
        "used to construct dynamic and reusable workflows."
    ),
    "databricks-notebook-development-patterns": (
        "Software engineering methodologies for Databricks notebooks, contrasting modular Python packages, Git Folders, "
        "and Databricks Connect against legacy `%run` script chaining."
    ),
    "databricks-task-dependencies-retries-conditional-logic": (
        "Workflow orchestration primitives in Lakeflow Jobs that define multi-task DAG dependencies, conditional branch routing, "
        "retry policies, and SLA timeout limits."
    ),
    "databricks-monitoring-alerting-sql-alerts": (
        "Automated operational monitoring and alert mechanisms in Databricks SQL that periodically evaluate query thresholds "
        "and dispatch notifications via Slack, PagerDuty, or Webhooks."
    ),
    "databricks-system-tables-for-operations": (
        "Centrally governed, audit-grade operational telemetry tables in Unity Catalog (`system.billing`, `system.compute`, `system.access`) "
        "used for cost tracking, cluster audit logs, and FinOps analytics."
    ),
    "databricks-shallow-vs-deep-clones": (
        "Delta Lake table cloning capabilities that either create zero-copy metadata pointers to source data files (SHALLOW CLONE) "
        "or create fully independent physical table copies (DEEP CLONE)."
    ),
    "databricks-managed-vs-external-tables-architecture-tradeoffs": (
        "The strategic trade-offs between Unity Catalog managed tables (lifecycle managed by Databricks, Predictive Optimization enabled) "
        "and external tables (custom storage locations, multi-engine access)."
    ),
    "databricks-delta-uniform-multi-engine-interoperability": (
        "Delta Lake Universal Format (UniForm), which automatically translates and maintains Apache Iceberg and Apache Hudi metadata "
        "alongside Delta logs, enabling multi-engine query access without data duplication."
    ),
    "databricks-compute-policies-cluster-governance": (
        "Administrative governance guardrails that enforce compute provisioning boundaries—including allowed VM types, "
        "max worker limits, spot instance allocations, and idle auto-termination."
    ),
    "databricks-ai-functions-for-data-engineers": (
        "Built-in SQL functions (`ai_query()`, `ai_classify()`, `ai_extract()`) in Databricks SQL that invoke foundation LLMs "
        "directly within batch and streaming queries for automated data enrichment."
    ),
    "databricks-multi-workspace-architecture": (
        "Enterprise platform deployment topology evaluating single-workspace versus multi-workspace designs "
        "for team isolation, regulatory compliance boundaries, and multi-region governance."
    ),
    "databricks-performance-troubleshooting-methodology": (
        "A structured diagnostic workflow for identifying lakehouse performance bottlenecks by analyzing Spark UI stages, "
        "query execution plans, shuffle spill, data skew, and cluster resource utilization."
    )
}

def main():
    with open(CONCEPTS_PATH, encoding="utf-8") as f:
        concepts = json.load(f)

    updated_count = 0
    for c in concepts:
        cid = c["id"]
        if cid in UPDATED_DEFINITIONS:
            c["definition"] = UPDATED_DEFINITIONS[cid]
            updated_count += 1

    print(f"Updated {updated_count} concept definitions.")
    with open(CONCEPTS_PATH, "w", encoding="utf-8") as f:
        json.dump(concepts, f, indent=2, ensure_ascii=False)
        f.write("\n")

    print(f"Saved updated concepts to {CONCEPTS_PATH}.")

if __name__ == "__main__":
    main()
