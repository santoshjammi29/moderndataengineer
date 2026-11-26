---
name: databricks-handbook
description: >
  Architect, build, review, debug, and tune Databricks Data Intelligence Platform workloads using the authoritative 105-recipe handbook corpus. Covers Unity Catalog, Delta Lake 3.x, Lakeflow Jobs & Pipelines (DLT), Serverless Compute, Databricks SQL (DBSQL), Photon, Databricks Asset Bundles (DABs), Databricks Apps, Mosaic AI & Vector Search, System Tables FinOps, and incident triage runbooks.
metadata:
  short-description: Databricks Data Intelligence Platform engineering
---

# Databricks Handbook

Use this skill for production-grade engineering and architecture on the Databricks Data Intelligence Platform. The bundled handbook provides 105 production recipes across ten learning tracks, complete Databricks Asset Bundles (DABs) infrastructure, battle-tested incident runbooks, architectural blueprints, and interview preparation guides.

Start by consulting [the notebook catalog](references/notebook-catalog.md) to locate the exact recipe, runbook, or architecture specification.

## Core Capabilities & Tracks

1. **Platform Architecture & Security (001–010)**: Split-plane cloud security, VNet injection, Private Link, cluster policies, DBR matrix, Databricks CLI v0.200+, REST API 2.1, KMS secrets, `/Workspace` vs. `/Volumes`, and SCIM federation.
2. **Unity Catalog & Federation (011–021)**: 3-level namespace (`catalog.schema.table_or_volume`), Managed vs. External tables, UC Volumes, Dynamic Row Filters (RLS), Column Masking (sha2/regex), Lakehouse Federation (Snowflake, BigQuery, Postgres), Delta Sharing, ABAC, and Clean Rooms.
3. **Delta Lake 3.x Storage Engine (022–032)**: `_delta_log` ACID commits and checkpoints, Deletion Vectors (MoR), Row-Level Concurrency, Liquid Clustering (`CLUSTER BY`), Change Data Feed (CDF), Predictive Optimization, UniForm (Iceberg/Hudi), clones, and in-place `CONVERT TO DELTA`.
4. **Lakeflow Ingestion & DLT (033–043)**: Auto Loader (`cloudFiles`), schema evolution (`addNewColumns`), `_rescued_data`, Delta Live Tables (`@dlt.table`, `@dlt.view`), Data Quality Expectations (`expect`, `expect_or_drop`, `expect_or_fail`), DLQ quarantine patterns, and `dlt.apply_changes()` CDC (SCD 1 & 2).
5. **Lakeflow Jobs & Orchestration (044–054)**: Multi-task DAGs, conditional routing, task values (`dbutils.jobs.taskValues`), Run As Service Principal, ephemeral job clusters, file arrival triggers, resilient retry policies, serverless scheduling, and partial DAG rerun.
6. **Databricks SQL & Photon (055–065)**: Serverless SQL Warehouses, Photon C++ SIMD vectorization, Intelligent Workload Management (IWM), multi-tier caching (Result, Disk/Delta, Remote), Query Profile bottleneck triage, AI/BI Lakeview dashboards, Genie Spaces, and Metric Views.
7. **Enterprise DevOps & DABs (066–076)**: Databricks Asset Bundles (`databricks.yml`), multi-environment targeting (dev/staging/prod), GitHub Actions CI/CD with OAuth/OIDC, Databricks Terraform Provider, Databricks Connect v2, chispa unit testing, and blue/green rollouts.
8. **Databricks Apps & Mosaic AI (077–087)**: Serverless Python Apps (Streamlit/FastAPI), managed Vector Search endpoints, Delta Sync Index, MLflow 2.15+ in Unity Catalog, Mosaic AI Model Serving, enterprise RAG, Agent Evaluation, and SQL `ai_query()` functions.
9. **FinOps & System Tables (088–098)**: `system.billing.usage` DBU cost analysis, mandatory cluster tagging, cost attribution across SKUs, `system.access.audit` forensics, cluster rightsizing, Predictive Optimization ROI, budget anomaly alerts, and Graviton/ARM savings.
10. **Incident Runbooks & Architecture Blueprints (099–105)**: Production incident forensics (OOMs, Delta OCC conflicts, join skew, RocksDB checkpoint loss, schema poisoning, warehouse saturation) and multi-cloud enterprise lakehouse reference architectures.

## Production Guidelines & Invariants

- **Runtime Target**: Baseline Databricks Runtime 15.4+ LTS, Apache Spark 3.5+, Delta Lake 3.2, Python 3.9–3.12, and Databricks CLI v0.200+.
- **Zero-Interactive Production**: All scheduled production workloads must run on Job Compute or Serverless Compute owned by Service Principals, never on All-Purpose Compute or personal user accounts.
- **Unity Catalog Exclusivity**: Modern Databricks architectures must use the 3-level namespace (`catalog.schema.table`) and UC Volumes (`/Volumes/catalog/schema/volume`). Avoid legacy Hive metastores (`hive_metastore`) and root DBFS mounts (`/mnt/`).
- **Liquid Clustering Standard**: Prefer `CLUSTER BY` over legacy Hive directory partitioning (`PARTITIONED BY`) and `ZORDER BY` for scalable, skew-resilient file organization.
- **Merge-on-Read Optimization**: Enable Deletion Vectors (`delta.enableDeletionVectors = true`) on high-churn tables to prevent full-file copy-on-write latency.
- **Asset Bundles Deployment**: Manage infrastructure and code declaratively via Databricks Asset Bundles (`databricks bundle deploy -t <target>`).

## Reference Manuals & Technical Documentation

- 📘 **[Databricks Data Intelligence Platform 20-Page Technical Manual (PDF)](https://github.com/santoshjammi29/moderndataengineer/blob/main/docs/pdf/databricks_data_intelligence_platform_technical_manual.pdf)**: Complete curriculum across Level 1 (Architecture), Level 2 (Delta Lake), Level 3 (Unity Catalog & Photon), and Level 4 (DevOps, Streaming, FinOps & AI).
- 📖 **[Authoritative Technical Manual Markdown](https://github.com/santoshjammi29/moderndataengineer/blob/main/docs/architecture/09_databricks_intelligence_platform_manual.md)**: Full platform architectural manual covering 8 modules and 14 production blueprints.
- 📐 **[52 Architecture Whiteboard Blueprints](https://github.com/santoshjammi29/moderndataengineer/blob/main/docs/whiteboard_diagrams/README.md)**: Master whiteboard schematics across 7 lakehouse domains.
- 📦 **[The Databricks Handbook Repository](https://github.com/santoshjammi29/databricks-handbook)**: Pinned production repository containing 105 runnable notebooks, DABs YAML definitions, incident runbooks, and CI test runner.
- 🚀 **[Azure Databricks Project Blueprints](https://github.com/santoshjammi29/azure-databricks-project-blueprints)**: Production-grade interview and enterprise design blueprints covering Omnichannel Retail, Real-Time Fraud & AML, and Warehouse Modernization.

## Source and License

The Databricks Handbook recipes, runbooks, and configurations are distributed under the MIT License by Santosh Jammi. Upstream repository: [santoshjammi29/databricks-handbook](https://github.com/santoshjammi29/databricks-handbook).
