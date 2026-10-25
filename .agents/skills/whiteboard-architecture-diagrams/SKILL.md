---
name: whiteboard-architecture-diagrams
description: |
  Specialized skill and guideline for generating educational, polished hand-drawn whiteboard sketch style architecture diagrams, system design workflows, and technical infographic images.
  Activate when:
  - The user asks to generate an architecture diagram, flow chart, pipeline diagram, or system design image.
  - The user requests an image explanation in "this style", "whiteboard style", "hand-drawn sketch style", or "diagram style".
  - Designing visual explanations of data engineering architectures, cloud platforms (Azure, Fabric, Databricks, AWS, GCP), storage engines, or technical under-the-hood mechanisms.
---

# Whiteboard Architecture Diagrams Skill & Guidelines

This skill enforces the exact visual and architectural style for generating **clean, educational, hand-drawn whiteboard sketch diagrams** for technical systems, cloud architectures, data pipelines, and internal mechanisms.

---

## 1. Visual Style & Aesthetic Specifications

| Element | Specification |
| :--- | :--- |
| **Canvas Background** | Pure solid white (`#FFFFFF`) with high contrast. Never use dark mode, textures, or isometric grids. |
| **Art Style** | Polished digital whiteboard sketch with friendly hand-drawn marker linework and crisp borders. |
| **Containers / Cards** | Rounded rectangular boxes with visible 2-3px hand-drawn outlines and light pastel background fills. |
| **Typography** | Friendly, legible marker handwriting script for titles/headers; clean sans-serif for subtexts and bullets; monospace on light grey cards for code snippets. |
| **Logos & Icons** | Recognizable official cloud & tech icons (Databricks, Spark, Airflow, Azure Data Factory, Unity Catalog, storage cylinders, folders, lock icons, checkmarks). |
| **Arrow Semantics** | • **Dashed arrows (`- - - ->`)**: Control flow, triggers, job dispatches, metadata sync, reporting.<br>• **Solid arrows (`──────>`)**: Data flow, data reading, writing, transformations, payloads. |

### Semantic Color Palette

Use consistent semantic colors across components:
- **Red / Coral** (`#E03131` / light red fill): Schedulers, master orchestrators, and compute clusters (e.g., Apache Airflow, Azure Databricks, Spark, Flink).
- **Blue / Sky** (`#1971C2` / light blue fill): Execution dispatchers, conversion engines, and middleware (e.g., Azure Data Factory, Step Functions, dbt, conversion processors).
- **Yellow / Amber** (`#F08C00` / light yellow fill): Sources, raw landing zones, unmanaged files, and input datasets (e.g., Plain Parquet, ADLS Raw, S3 landing, Kafka topics).
- **Purple / Violet** (`#9C36B5` / light purple fill): Governance, catalogs, data access control, and quality centers (e.g., Unity Catalog, Collibra, Microsoft Purview, Great Expectations).
- **Green / Emerald** (`#2B8A3E` / light green fill): Target lakehouse tables, curated gold/silver layers, completed outputs, and unlocked features (e.g., Delta Parquet, Iceberg tables, verified badges).

---

## 2. Core Layout Archetypes

### Archetype A: Dual-Plane Enterprise Flow (Control Flow vs. Data Flow)
Use when explaining end-to-end production pipelines spanning orchestrators, compute, and governance.

- **Top Swimlane — Orchestration / Control Flow**:
  - Master scheduler (e.g., Airflow) triggers the workflow dispatcher (e.g., ADF).
  - Dispatcher triggers compute job (Databricks / Fabric Spark) via vertical downward dashed line.
  - Dispatcher triggers post-processing reporting and governance updates (e.g., Microsoft Purview, Unity Catalog).
- **Bottom Swimlane — Storage & Processing / Data Flow**:
  - Source storage (ADLS Gen2 / S3 / Kafka) read by compute engine.
  - Compute passes through Governance / Security catalog (Unity Catalog / Purview).
  - Governance routes writes to target storage layers (Bronze, Silver, Gold Delta / Iceberg).
- **Bottom-Left Legend**:
  - `- - - ->` Control flow
  - `──────>` Data flow

### Archetype B: 3-Panel Mechanism / Under-the-Hood Explanation
Use when explaining how a specific file format, algorithm, or conversion works step-by-step.

- **Left Panel (Yellow/Amber)**: *Starting State* (e.g., Plain Parquet files, directory contents, limitations: no ACID, no MERGE).
- **Center Panel (Blue)**: *Conversion Engine / Transition* (e.g., Spark/Databricks zero-copy engine, code command box, metadata scanning actions).
- **Right Panel (Green)**: *Resulting State* (e.g., Delta Parquet table showing `_delta_log/` + data files, badges with checkmarks for unlocked features: ACID, Time Travel, DML, Liquid Clustering).

---

## 3. Platform Production Blueprints Inventory (42 Blueprints)

The platform maintains 42 hand-drawn digital blueprints across 7 architectural domains (`src/data/diagrams.ts`):

### 1. Compute & Optimization (11)
- `spark-catalyst-photon-engine`: Catalyst Optimizer, AQE & Native Photon C++ Engine
- `spark-shuffle-memory-internals`: Apache Spark Shuffle Internals & Unified JVM Memory
- `sql-server-engine-internals`: SQL Server Relational Engine & Buffer Pool Mechanics
- `spark-data-skew-aqe-optimization`: Apache Spark Data Skew Handling & Adaptive Query Execution
- `delta-lake-optimization-techniques`: 6 Delta Lake Optimization Levers (Partitioning, Z-Order, OPTIMIZE, Liquid Clustering, VACUUM)
- `structured-streaming-rocksdb-state`: Structured Streaming Stateful Operations & RocksDB State Store
- `spark-tungsten-memory-spill`: Spark Tungsten Engine Memory Management & Spill Mechanics
- `spark-join-strategies-decision-matrix`: Apache Spark Distributed Join Strategy Decision Flowchart
- `photon-vectorized-vs-jvm-catalyst`: Photon Native Vectorized Execution vs JVM Whole-Stage CodeGen
- `broadcast-variables-accumulators`: Spark Broadcast Variables & Accumulator Internals
- `fabric-onelake-shortcuts-directlake`: Fabric OneLake Cross-Cloud Shortcuts & Direct Lake Paging

### 2. Storage Engines & Formats (8)
- `delta-lake-under-the-hood`: Delta Lake Under-The-Hood ACID Transaction Mechanics
- `apache-iceberg-open-table-format`: Apache Iceberg Open Table Format & Snapshot Trees
- `open-table-formats-comparison`: Open Table Formats Comparison (Delta vs Iceberg vs Hudi)
- `open-file-formats-comparison`: Open File Formats Comparison (Parquet vs ORC vs Avro)
- `lakehouse-acid-concurrency-matrix`: Lakehouse ACID Concurrency & Conflict Detection Matrix
- `scd-types-medallion-architecture`: Slowly Changing Dimensions (SCD Types 0-6) in Medallion
- `delta-savemode-concurrency-handling`: Delta Lake SaveMode Behaviors & Concurrent Append/Overwrite
- `lakehouse-master-enterprise-architecture`: Master Enterprise Lakehouse Reference Blueprint

### 3. Pipelines & Ingestion (8)
- `apache-airflow-distributed-architecture`: Apache Airflow Distributed Architecture & Schedulers
- `dbt-analytics-engineering-dag`: dbt Analytics Engineering DAG & Transformation Mesh
- `adf-hybrid-integration-runtime`: Azure Data Factory Hybrid Pipeline & SHIR
- `kafka-event-streaming-pipeline`: Apache Kafka Event Streaming & High-Throughput Messaging
- `cdc-debezium-lakehouse-pipeline`: CDC with Debezium & Streaming Lakehouse Ingestion
- `delta-live-tables-pipeline`: Databricks Delta Live Tables (DLT) Declarative ETL
- `databricks-asset-bundles-cicd`: Databricks Asset Bundles (DABs) & Serverless CI/CD
- `rag-vector-search-data-pipeline`: Enterprise RAG & Vector Search Data Ingestion Pipeline

### 4. Platform Landscape (5)
- `databricks-medallion-pipeline`: Databricks Multi-Hop Medallion Architecture
- `databricks-platform-master`: Databricks Unified Platform Master Blueprint
- `python-arrow-polars-duckdb`: Python High-Performance Data Engineering: Arrow, Polars & DuckDB
- `lakehouse-finops-cost-optimization`: Enterprise Lakehouse FinOps & Cloud Cost Optimization
- `enterprise-edge-iot-architecture`: Enterprise Edge Computing, IoT Hub & Distributed Gateways

### 5. Microsoft Fabric & Power BI (4)
- `fabric-onelake-architecture`: Microsoft Fabric Unified Architecture & OneLake
- `powerbi-direct-lake-vertipaq`: Power BI Direct Lake Mode & VertiPaq Semantic Engine
- `powerbi-dax-engine-context`: Power BI DAX Formula/Storage Engine Mechanics
- `fabric-onelake-shortcuts-directlake`: Fabric OneLake Cross-Cloud Shortcuts & Direct Lake Mode

### 6. Data Modeling & Architecture (4)
- `kimball-dimensional-star-schema`: Kimball Dimensional Modeling & Enterprise Star Schema
- `data-vault-enterprise-architecture`: Data Vault 2.0 Enterprise Modeling (Hubs, Links, Satellites)
- `distributed-systems-resilience`: Distributed Systems Resilience & Circuit Breakers
- `enterprise-data-mesh-architecture`: Enterprise Data Mesh Architecture & Federated Governance

### 7. Governance & Security (2)
- `unity-catalog-governance-lineage`: Databricks Unity Catalog Centralized Governance & Lineage
- `purview-enterprise-governance`: Microsoft Purview Enterprise Unified Governance & Metadata

---

## 4. Formula for `generate_image` Prompts

When invoking the `generate_image` tool, construct the prompt following this exact template:

```python
{
    "AspectRatio": "16:9",  # Use 16:9 for horizontal flows/swimlanes, 4:3 for compact maps
    "ImageName": "<descriptive_snake_case_name>",
    "Prompt": """
A clear, high-resolution digital architecture and infographic diagram explaining '<TOPIC_TITLE>' in a polished hand-drawn whiteboard sketch style on a clean solid white background, strictly matching the visual style, rounded colored cards, and friendly marker typography.

Title at top: '<MAIN_TITLE>'
Subtitle below: '<SUBTITLE_OR_CONTEXT>'

[STRUCTURE & LAYOUT SPECIFICATION]:
- Specify swimlanes or horizontal panels.
- For each box, explicitly define:
  1. Box color and fill (Red, Blue, Yellow, Purple, Green).
  2. Main label and icon (Airflow pinwheel, Databricks stacked diamonds, etc.).
  3. Subtext bullets and exact text lines.
- Specify every connecting arrow:
  - Dashed arrow for Control Flow / triggers / signals.
  - Solid arrow for Data Flow / reads / writes.
  - Text label on the arrow (e.g., 'Trigger', 'Read', 'Job activity', 'CONVERT TO DELTA').

[FOOTER / LEGEND]:
- Legend in bottom-left corner defining arrow semantics.

Clean linework, vibrant colored borders, high contrast, perfectly legible hand-drawn typography.
"""
}
```
