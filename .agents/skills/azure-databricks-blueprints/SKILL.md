---
name: azure-databricks-blueprints
description: >
  Production-grade enterprise Azure Databricks project blueprints and interview defense playbooks. Covers Omnichannel Retail Sales & Inventory Lakehouse (Auto Loader, Liquid Clustering, Deletion Vectors, DLT SCD Type 2, DBSQL), Real-Time Payments Fraud & AML Monitoring (Azure Event Hubs, Structured Streaming, off-heap RocksDB state store, watermarking, idempotent alert egress, Unity Catalog dynamic masking), and Legacy Warehouse Modernization & Controlled Cutover (dependency graph wave phasing, automated dual-run parity verification, DABs GitOps, Delta Time Travel rollback).
metadata:
  short-description: Azure Databricks project blueprints & interview defense
---

# Azure Databricks Project Blueprints

Use this skill when designing, reviewing, or defending enterprise Azure Databricks Lakehouse architectures and Senior Data Engineer / Architect interview portfolios.

The bundled blueprint corpus is mirrored from **[santoshjammi29/azure-databricks-project-blueprints](https://github.com/santoshjammi29/azure-databricks-project-blueprints)** and covers three complete end-to-end production scenarios:

## 1. Omnichannel Retail Sales & Inventory Lakehouse
- **Flow**: ADF metadata-driven ingestion -> ADLS Gen2 landing -> Auto Loader (`cloudFiles`) with `addNewColumns` schema evolution and `_rescued_data` -> Lakeflow Declarative Pipelines with expectations -> Gold dimensional models (`fact_sales_line`, `fact_inventory_daily`).
- **Core Mechanisms**:
  - Grain modeling: Order line item fact with immutable compensating transactions for returns/cancellations.
  - Liquid Clustering (`CLUSTER BY`) replacing over-partitioned Hive directories.
  - Deletion Vectors (`delta.enableDeletionVectors = true`) for fast Merge-on-Read.
  - Out-of-order CDC processing into SCD Type 2 dimensions via `APPLY CHANGES INTO`.
  - Serverless Databricks SQL Warehouses with Photon C++ caching and Power BI Direct Lake mode.

## 2. Real-Time Payments Fraud & AML Monitoring
- **Flow**: Payment authorization gateways -> Azure Event Hubs (partitioned by `hashed_account_id`) -> Structured Streaming (Bronze) -> Silver stateful sliding velocity windows -> Stream-static joins with watchlists -> Gold real-time fraud alerts and operational dispatch.
- **Core Mechanisms**:
  - Off-heap **RocksDB State Store** with changelog checkpointing for scaling millions of keys.
  - Explicit **10-minute event-time watermark** preventing state store memory bloat.
  - Idempotent downstream alert egress with deterministic deduplication keys (`event_id + rule_id`) resolving dual-sink non-transactional boundaries.
  - Unity Catalog dynamic column masking (SHA-256 with Key Vault salt) and `system.access.table_lineage` audit trails.

## 3. Legacy Warehouse Modernization & Controlled Cutover
- **Flow**: Monolithic legacy warehouse (Teradata / SSIS / Synapse) -> ADF with Self-Hosted Integration Runtime (SHIR) -> Parameterized chunked historical hydration -> Medallion Lakeflow Jobs -> Automated dual-run parity verification -> Cutover.
- **Core Mechanisms**:
  - Topological dependency-graph migration across 4 waves (Master Dimensions -> Sales -> Supply Chain -> Financial Ledger).
  - Automated dual-run parity reconciliation engine checking row counts, checksum hashes, and financial variances (`ABS(legacy - lakehouse) < 0.01`).
  - Declarative Automation Bundles (DABs) for CI/CD across `dev`, `staging`, and `prod` with Azure Service Principals.
  - Delta Time Travel (`RESTORE TABLE ... TO VERSION AS OF`) for instant zero-loss rollback during backfill failures.

## Reference Repository
- 📦 **[Azure Databricks Project Blueprints](https://github.com/santoshjammi29/azure-databricks-project-blueprints)**: Full implementation repository with DABs `databricks.yml`, SQL DDL, PySpark engines, and Chispa tests.
