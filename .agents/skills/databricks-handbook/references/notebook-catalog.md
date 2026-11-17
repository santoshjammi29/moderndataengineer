# Databricks Handbook: Complete 105-Recipe Catalog

The Databricks Handbook contains **105 production-grade recipes, notebooks, runbooks, and architectural blueprints** structured in the official `# Databricks notebook source` format.

---

## Module 01: Platform Architecture, Workspaces & Security (001–010)

- **001 — Split-Plane Cloud Architecture**: Control Plane, Classic Compute & Serverless Networking (`dbutils`, VNet/VPC boundary, Storage Credentials).
- **002 — Databricks Workspace Topologies**: Multi-Workspace Hub-and-Spoke, Account Console & Private Link isolation.
- **003 — Cluster Types & Workload Isolation**: All-Purpose vs. Automated Job vs. SQL Warehouses, Single-User vs. Shared access.
- **004 — Cluster Policies, T-Shirt Sizing & Fleet Autoscaling**: Enforcing cost controls, node type restrictions, and max DBU limits.
- **005 — Databricks CLI v0.200+ Automation & OAuth M2M**: Service Principal authentication, profile management, and workspace CLI scripting.
- **006 — Databricks REST API 2.1 Programmatic Lifecycle**: Automating clusters, jobs, tokens, and workspace directories via REST API.
- **007 — Databricks Secrets & Cloud KMS Scopes**: `dbutils.secrets.get()`, Azure Key Vault / AWS Secrets Manager zero-trust credential injection.
- **008 — Workspace Filesystem vs. Volumes vs. DBFS**: Migrating legacy `/mnt/` DBFS mounts to Unity Catalog Volumes `/Volumes` and `/Workspace`.
- **009 — Service Principals, SCIM Provisioning & Enterprise Identity**: Entra ID / Okta SCIM sync, group mappings, and OAuth service principals.
- **010 — Workspace Audit Logging & Security Forensics**: Ingesting Azure Diagnostic Settings / AWS CloudWatch into Unity Catalog audit tables.

---

## Module 02: Unity Catalog — Governance, Security & Federation (011–021)

- **011 — Unity Catalog 3-Level Namespace Architecture**: Account-level metastores, catalogs, schemas, tables, and volumes topology.
- **012 — Managed Tables vs. External Tables**: Storage Credentials, External Locations, and cloud storage lifecycle decoupling.
- **013 — Unity Catalog Volumes for Unstructured Data**: Managed vs. External Volumes, PDF/image file operations, and path routing.
- **014 — Fine-Grained Row-Level Security (RLS)**: Creating dynamic row filter functions (`IS_ACCOUNT_GROUP_MEMBER()`) and binding to tables.
- **015 — Dynamic Column Masking for PII Protection**: Role-based masking functions (`sha2`, regex redaction) and compliance enforcement.
- **016 — Lakehouse Federation (PostgreSQL, MySQL, SQL Server)**: Setting up foreign catalogs and executing federated queries without ETL.
- **017 — Lakehouse Federation (Snowflake & Google BigQuery)**: Cross-cloud data virtualization, predicate pushdown, and query plans.
- **018 — Delta Sharing Open Protocol**: Zero-copy sharing with external non-Databricks consumers via bearer tokens and open REST APIs.
- **019 — Databricks-to-Databricks Delta Sharing**: Managed cross-account catalog sharing with zero token management and automatic lineage.
- **020 — Attribute-Based Access Control (ABAC) & PII Tagging**: Information Schema queries, system tags, and automated column governance.
- **021 — Clean Rooms**: Secure multi-party data collaboration with privacy-preserving differential privacy and query restrictions.

---

## Module 03: Delta Lake 3.x Deep Dive — Storage Engine & UniForm (022–032)

- **022 — Delta Transaction Log Internals**: Atomic JSON commits (`000.json`), compaction checkpoints (`.parquet`), CRC, and state reconstruction.
- **023 — Optimistic Concurrency Control (OCC) & Row-Level Concurrency**: Resolving concurrent write conflicts, write skew, and OCC retries.
- **024 — Deletion Vectors (Merge-on-Read vs. Copy-on-Write)**: Fast write paths via roaring bitmaps, query read path, and `REORG TABLE APPLY (PURGE)`.
- **025 — Liquid Clustering (`CLUSTER BY`) Internals**: Space-filling Hilbert curves, dynamic ZCubes, and zero-downtime migration from Hive partitioning.
- **026 — Delta Change Data Feed (CDF)**: Ingesting row-level changes (`_change_type`, `update_preimage`), micro-batch deduplication, and Gold merges.
- **027 — Predictive Optimization**: Enabling serverless automated compaction (`OPTIMIZE`), garbage collection (`VACUUM`), and `ANALYZE TABLE`.
- **028 — Delta UniForm (Universal Format)**: Asynchronously generating Apache Iceberg and Apache Hudi metadata for Snowflake and Trino access.
- **029 — Shallow Clones vs. Deep Clones**: Zero-copy sandboxes for testing, point-in-time auditing, and disaster recovery table duplication.
- **030 — Schema Evolution vs. Enforcement**: `mergeSchema`, `overwriteSchema`, column mapping, and table constraints (`CHECK`, `NOT NULL`).
- **031 — Delta Time Travel & Audit History**: `DESCRIBE HISTORY`, querying by timestamp or version, and safe `RESTORE TABLE` rollback.
- **032 — In-Place Parquet to Delta Migration**: Executing `CONVERT TO DELTA`, repairing partition schemas, and enabling Delta Lake features.

---

## Module 04: Lakeflow Ingestion, Auto Loader & Declarative Pipelines (033–043)

- **033 — Auto Loader (`cloudFiles`) Ingestion**: Incremental lexical Directory Listing vs. File Notification mode (SNS/SQS, Event Grid).
- **034 — Auto Loader Schema Inference & Evolution**: `addNewColumns` mode, schema location checkpoints, and `_rescued_data` column capture.
- **035 — High-Throughput Semi-Structured Ingestion**: Ingesting complex multi-line JSON, CSV with headers, and binary files at scale.
- **036 — Delta Live Tables (DLT) Foundations**: Streaming Tables (`@dlt.table`) vs. Materialized Views (`@dlt.view`) and DAG lineage.
- **037 — DLT Data Quality Expectations**: Implementing `@dlt.expect`, `@dlt.expect_or_drop`, and `@dlt.expect_or_fail` quality assertions.
- **038 — DLT Dead Letter Queue (DLQ) Quarantine**: Routing invalid records to a quarantine table with failure metadata for forensic inspection.
- **039 — DLT Change Data Capture (SCD Type 1)**: Ingesting database binlogs and executing in-place upserts via `dlt.apply_changes()`.
- **040 — DLT Change Data Capture (SCD Type 2)**: Historical timeline tracking (`is_current`, `start_ts`, `end_ts`) via `dlt.apply_changes()`.
- **041 — DLT Pipeline Execution Modes**: Triggered vs. Continuous execution, Development vs. Production mode, and Serverless DLT compute.
- **042 — DLT Event Log Forensics**: Querying system event tables for data quality pass/fail rates, data flow metrics, and SLA delays.
- **043 — Metaprogramming DLT Pipelines**: Dynamically generating `@dlt` tables from YAML configuration files and enterprise data contracts.

---

## Module 05: Lakeflow Jobs, Workflows & Orchestration (044–054)

- **044 — Multi-Task Lakeflow Jobs**: Configuring task dependency DAGs, failure thresholds, and conditional branching (`if/else`).
- **045 — Multi-Modal Task Types**: Orchestrating Notebooks, Python Wheels, DLT Pipelines, dbt models, and SQL queries in one workflow.
- **046 — Inter-Task Communication via Task Values**: Sharing context, record counts, and dates via `dbutils.jobs.taskValues.set()` and `.get()`.
- **047 — Production Security: Run As Service Principal**: Decoupling job ownership from developer identities using Service Principal tokens.
- **048 — Cluster Allocation Strategy**: Ephemeral Job Clusters vs. Shared Compute Pools: cost trade-offs, initialization time, and reuse.
- **049 — Advanced Job Triggers**: Configuring Quartz cron schedules, storage file arrival triggers, and continuous execution loops.
- **050 — Resilient Error Handling & Notifications**: Exponential backoff retry policies, timeout limits, and PagerDuty/Slack webhooks.
- **051 — Serverless Workflows**: Eliminating VM spin-up latency, sub-second task starting, and automatic elasticity.
- **052 — Repair and Rerun Workflows**: Surgically re-executing only failed downstream tasks without recomputing upstream successes.
- **053 — Dynamic Job Parameters & Widget Inheritance**: Passing dynamic runtime parameters across parent workflows and child notebooks.
- **054 — Orchestration Lineage & Monitoring**: Analyzing job execution history, run durations, and cost trends using System Tables.

---

## Module 06: Databricks SQL (DBSQL), Photon & Semantic Layer (055–065)

- **055 — Serverless SQL Warehouses**: Sizing T-shirts (2X-Small to 4X-Large), auto-stop timeouts, and instant serverless spin-up.
- **056 — Photon Engine Internals**: C++ vectorized query execution, SIMD hardware instructions, and off-heap columnar memory.
- **057 — Intelligent Workload Management (IWM)**: Dynamic query admission control, queueing mitigation, and spill avoidance.
- **058 — Multi-Tier Caching Architecture**: Result cache, local SSD Delta cache, and remote storage metadata caching mechanics.
- **059 — DBSQL Query Profile Analysis**: Diagnosing scan bottlenecks, shuffle exchanges, join spills, and pruning inefficiencies.
- **060 — Materialized Views & Streaming Tables in DBSQL**: Creating incremental lakehouse assets using pure ANSI SQL.
- **061 — AI/BI Dashboards (Lakeview)**: Interactive multi-canvas visualizations, cross-filtering, parameters, and draft/publish workflows.
- **062 — Databricks Genie Spaces**: Setting up conversational AI spaces, curating trusted SQL assets, and tuning semantic accuracy.
- **063 — Databricks Semantic Layer & Metric Views**: Defining enterprise dimensions, measures, and certified metrics for BI tools.
- **064 — DBSQL Alerts & Automated Refreshes**: Scheduled query alerts, threshold triggers, and Slack/Microsoft Teams notifications.
- **065 — SQL Warehouse Horizontal Concurrency**: Multi-cluster load balancing, maximum cluster scaling, and scaling policies (Economy vs. Pro).

---

## Module 07: Enterprise DevOps — DABs, CI/CD & Testing (066–076)

- **067 — Databricks Asset Bundles (DABs) Architecture**: `databricks.yml` root schema, target overrides, and variable substitutions.
- **067 — Multi-Resource Bundle Definitions**: Declaring Jobs, DLT Pipelines, Volumes, and Model Serving endpoints as Infrastructure as Code.
- **068 — DABs Multi-Environment Targeting**: Establishing `dev`, `staging`, and `prod` deployment boundaries with catalog mapping.
- **069 — Bundle Lifecycle CLI Automation**: Running `databricks bundle validate`, `bundle deploy -t prod`, and `bundle run` pipelines.
- **070 — GitHub Actions CI/CD Automation**: Automated PR linting, bundle validation, unit test execution, and production deployment.
- **071 — Service Principal Auth with Cloud OIDC**: Passwordless GitHub Actions authentication via Azure Federated Credentials / AWS OIDC.
- **072 — Infrastructure as Code with Terraform**: Provisioning Databricks workspaces, Unity Catalog metastores, and compute via Terraform.
- **073 — Databricks Connect v2 Development**: Local IDE development in VS Code / PyCharm connected directly to remote Databricks clusters.
- **074 — Unit Testing Pipelines with pytest & chispa**: Writing fast local DataFrame tests, schema assertions, and mock execution suites.
- **075 — Python Wheel Packaging & UC Volume Deployment**: Building Python wheels, uploading to UC Volumes, and attaching to jobs.
- **076 — Blue/Green Pipeline Deployment**: Zero-downtime pipeline promotion using catalog/schema aliases and atomic table pointers.

---

## Module 08: Databricks Apps & Mosaic AI (GenAI, Vector Search, RAG) (077–087)

- **077 — Databricks Apps Platform**: Serverless hosting for Streamlit, Dash, Gradio, and FastAPI applications inside the workspace.
- **078 — Databricks App Manifest (`app.yaml`)**: Specifying environment variables, Python dependencies, and Service Principal IAM roles.
- **079 — Databricks Vector Search Endpoints**: Creating managed vector endpoints and continuous Delta Sync Indexes from Delta tables.
- **080 — Foundation Model APIs & Embeddings**: Utilizing `databricks-bge-large-en`, OpenAI embeddings, and external model integrations.
- **081 — MLflow 2.15+ in Unity Catalog**: Tracking experiments, artifacts, and registering models in the 3-level namespace (`catalog.schema.model`).
- **082 — Mosaic AI Model Serving**: Deploying real-time serverless LLM endpoints, scale-to-zero compute, and provisioned throughput.
- **083 — Enterprise RAG Architecture**: Recursive text chunking, hybrid search (dense embeddings + BM25 sparse keyword), and re-ranking.
- **084 — Mosaic AI Agent Evaluation (MLflow Evaluate)**: Automated LLM scoring for groundedness, answer relevance, and safety guardrails.
- **085 — SQL AI Functions**: Utilizing `ai_query()`, `ai_summarize()`, `ai_classify()`, and `ai_analyze_sentiment()` in DBSQL queries.
- **086 — Lakehouse Monitoring**: Setting up automated data quality, statistical drift, and model drift monitors with metric tables.
- **087 — LLM Fine-Tuning with Mosaic AI**: Training custom foundation models and parameter-efficient LoRA adapters on enterprise lakehouse data.

---

## Module 09: FinOps, Observability & System Tables Masterclass (088–098)

- **088 — System Tables Architecture**: Enabling and configuring `system.billing`, `system.access`, and `system.compute` schemas.
- **089 — Calculating DBU Consumption & Costs**: Querying `system.billing.usage` to aggregate spend by workspace, SKU, and date range.
- **090 — Mandatory Cluster Tagging & Cost Attribution**: Enforcing `CostCenter`, `Owner`, and `Project` tags and analyzing tag-based costs.
- **091 — Cost Breakdown across Workload SKUs**: Comparing spend between Interactive, Automated Jobs, SQL Warehouses, Serverless, and DLT.
- **092 — Audit & Security Forensics**: Tracking user logins, IP addresses, DDL queries, and secret accesses via `system.access.audit`.
- **093 — Compute Right-Sizing Analytics**: Querying `system.compute.clusters` to detect underutilized nodes, zombie clusters, and oversized VMs.
- **094 — Predictive Optimization ROI**: Evaluating storage savings and query acceleration from automatic compaction via system tables.
- **095 — Automated FinOps Anomaly Alerts**: Establishing automated queries that fire alerts when daily DBU consumption exceeds standard deviations.
- **096 — Spot Instance & ARM Architecture Migrations**: Optimizing worker fleets with AWS Graviton / Azure ARM nodes for 30–40% cost reduction.
- **097 — Aggressive Auto-Stop Policies**: Configuring 5-10 minute idle termination across all interactive clusters and SQL warehouses.
- **098 — Multi-Tenant Showback & Chargeback**: Building automated executive dashboards that allocate exact cloud costs to business units.

---

## Module 10: Production Incidents, Triage & Architecture Blueprints (099–105)

- **099 — Incident 01: Driver & Executor OutOfMemory (OOM) Forensics**: Diagnosing `java.lang.OutOfMemoryError` (heap vs. off-heap), GC pauses, and heap dumps.
- **100 — Incident 02: Delta Concurrent Modification Conflicts**: Diagnosing concurrent append/delete OCC failures and implementing row-level concurrency.
- **101 — Incident 03: Straggler Tasks & Extreme Join Skew**: Forensic analysis of Spark UI 99% task hangs, identifying skewed keys, and applying two-phase salting.
- **102 — Incident 04: Streaming State Explosions & RocksDB Recovery**: Remedying unbounded state memory growth in stateful streaming and checkpoint recovery.
- **103 — Incident 05: Auto Loader Schema Drift & Poison Pill Triage**: Diagnosing pipeline failures caused by upstream schema mutations and isolating poison pills.
- **104 — Incident 06: Serverless SQL Warehouse Queue Saturation**: Diagnosing queue times, query memory spills, and tuning warehouse scaling policies.
- **105 — Enterprise Lakehouse Master Blueprint**: End-to-end multi-cloud production architecture specification spanning ingestion, governance, CI/CD, and AI.
