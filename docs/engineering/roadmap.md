# Data Platform Architect — v2 Roadmap

This roadmap outlines achieved milestones and future planned expansions for **Version 2.0+** of the Data Platform Architect Prep platform (`moderndataengineer.uk`). Historical milestone counts below describe their release snapshots; the current inventory is generated in [`src/data/content-counts.json`](../../src/data/content-counts.json).

---

## 🏆 Recently Completed Architectural Initiatives (v1.0 – v2.0)

- [x] **Evidence-Led Lakehouse Expansion & Interactive Systems Modernization (v2.0)**:
  - **Sourced Evidence Expansion**: Synthesized 21 primary authoritative standards (DORA 2025, Thoughtworks Radar Vol. 35, dbt Labs 2026, OpenLineage, NIST SP 800-207 Zero Trust, OWASP Top 10 for LLMs, Uber Wukong, Delta Lake 3.2, Apache Iceberg v2/v3, AWS S3 Express One Zone).
  - **11,956+ Searchable Assets**: Expanded catalog to 7,098 Q&A, 3,294 architecture scenarios, 869 concepts, 283 code drills, 156 GCC company profiles, and 42 whiteboard blueprints.
  - **Governed Agentic Data Platforms Track**: Added Track 15 to `/guided-learning` spanning foundation-to-architect stages, agent tool sandbox boundaries, and provenance tracking.
  - **6 Modern Dynamic Simulators**: Upgraded `/modern-stack` with Spark 3.5 AQE Skew Join Splitting, Iceberg REST Catalog selector, S3 Express One Zone cost modeling, Driver/Executor memory overhead, HNSW RAG vector sizing, and RocksDB streaming state stores.
  - **Spark Engine & Catalyst Enhancements**: Added Spark 3.5 AQE skew split execution flow to `/spark-engine` and 3 cutting-edge plan scenarios (Delta Liquid Clustering scan, Iceberg v2 positional deletes, AQE runtime split) to `/spark-catalyst`.
  - **Vitest Suite Scale**: 58 test files and 472 unit/integration tests with 100% pass rate.
- [x] **Production Lakehouse Engineering & Day-Two Incident Triage (v1.9)**: Added 16-Week applied enterprise curriculum (Path 13 under `/learning-paths`), Triage Runbooks 5–7 for multi-layer retry storms (ADF $\times$ Databricks), Structured Streaming checkpoint recovery, two-phase watermark commit boundaries, +120 new Q&As/scenarios/cheatsheets (totaling 7,084 Q&As, 3,269 architecture scenarios, 86 cheatsheets), and BM25F catalog re-sharded to 11,627 assets.
- [x] **Universal Typography & Font Scaling System (v1.8)**: Dynamic font switcher (Inter, JetBrains Mono, Fira Code, System, Editorial Serif, OpenDyslexic), CSS custom property multiplier (`--font-scale-multiplier`), and instant propagation to code blocks, cards, and text across all viewports.
- [x] **Unified Stages & Lifecycles Hub (v1.7)**: Consolidated 5 enterprise lifecycle systems under `/stages` with interactive 5-tab switcher (4-Stage Mastery, 7-Stage Lakehouse Flow, 6-Stage Delivery Playbook with 152 controls, 5-Stage Spark Catalyst Engine, and 12-Factor Data Delivery Playbook).
- [x] **Consolidated Code Practice & Multi-Engine Runbooks (v1.7)**: Merged all coding workbenches under `/code-practice` spanning 326+ operations across 4 interactive tabs (`drills`, `databricks`, `matrix`, `runbooks`) with subpage `/code-practice/databricks`.
- [x] **Reorganized Cloud Platforms & Engine Matrix (v1.7)**: Reorganized `/modern-stack` into a structured 10-engine matrix, 15 FinOps cost playbooks, 6 interactive data platform simulators, and cloud primitives.
- [x] **Dynamic Ultrawide & High-Resolution Display Scaling (v1.7)**: Replaced fixed max-width caps with fluid multi-tier containers (`w-full max-w-7xl 2xl:max-w-[1800px] 3xl:max-w-[2200px] 4xl:max-w-none`) across all 16 client pages and navigation layouts for seamless 2K, 4K, and 3440px ultrawide support.
- [x] **Direct Routing Shortcuts & Permanent 301 Redirects (v1.7)**: Direct shortcuts currently route `/plan` -> `/guided-learning?tab=curricula`, `/goal` -> `/studio`, `/learn` -> `/guided-learning`, `/boost` -> `/qa-prep`, `/browser` -> `/search-topics`, `/blueprints` -> `/whiteboards`, `/deployments` -> `/studio`, and `/spark-visualizer` -> `/visualizer`.
- [x] **Vitest Test Suite Scale (v1.7)**: Expanded automated test gates to 57 test files and 464 unit/integration tests with 100% pass rate.
- [x] **Target Company Intel Hub Revamp (v1.5)**: High-density, space-efficient multi-view workbench (Compact Grid, Master-Detail Split, Dense Comparison Matrix) with GCC Hub selector, in-card drawers, and 1-click prompt copying.
- [x] **Architect-Grade Whiteboard Blueprints & 5-Role Breakdown (v1.5)**: All 42 blueprints elevated with 5 persona perspectives (Architect, Senior DE, DE, Data Steward, Business Analyst), technical mechanisms, failure triage runbooks, governance compliance, and interactive 4-tab inspector.
- [x] **Master Vector PDF Suite & Streaming API (v1.4)**: 7 production vector PDFs compiled with direct edge streaming API (`/api/download/pdf/[filename]`), attachment headers, and in-modal interactive preview.
- [x] **Google-Grade BM25F Search Engine (v1.4)**: In-memory field-weighted BM25F search algorithm with typo tolerance and zero-OOM memory optimization under 128 MB on Cloudflare Workers edge.
- [x] **2026 Cloud × Engine Polyglot Matrix (v1.4)**: Comparative cross-engine execution matrices and 15 FinOps cost playbooks covering Databricks, Snowflake, BigQuery, Microsoft Fabric, and DuckDB.
- [x] **Enterprise Security Hardening (v1.4)**: Canonical domain alignment (`moderndataengineer.uk`), active security policy (`SECURITY.md`), `/.well-known/security.txt`, bounded Redis LRU cache, and Cloudflare KV/D1 authentication.
- [x] **Single-Roof Concepts & 14-Pillar Mind Map (v1.3)**: 679 concepts merged with 3-in-1 view switcher (Glossary, Mindmap, Flashcards) under `/concepts` with zero page reload.
- [x] **Dedicated Databricks Coding Hub (v1.3)**: Unified `/code-practice/databricks` subpage with 148+ operations, Unity Catalog Volumes, DBFS, and 6 memory bottleneck triage runbooks (Driver/Executor OOM, Shuffle Spill, Skew Joins, Small Files, GC Pauses).
- [x] **36-Keyword Architecture Scenario Filter Deck (v1.3)**: 6 domain groups with live counts and URL query sync across 3,206 architecture scenarios.
- [x] **42 Whiteboard Architecture Blueprints (v1.2)**: Lossless WebP/AVIF digital whiteboard schematics across 7 domains with full-screen zoom inspection.
- [x] **Databricks 100 Day Challenge (v1.1)**: 100-day structured mastery curriculum with code snippets, certification mapping, and progressive tracking.
- [x] **6 Delta Lake Optimization Levers (v1.1)**: Under-the-hood blueprint and 50M-row hands-on benchmarking (Partitioning, Z-Order, OPTIMIZE, Auto Optimize, Liquid Clustering, VACUUM).
- [x] **Open Format Storage Types (v1.0)**: Whiteboard blueprints and technical deep-dive guide comparing Delta Lake, Apache Iceberg, Apache Hudi, Parquet, ORC, and Avro.
- [x] **Zero-Bundle Data Architecture**: React 19 `cache()` Server Data Access Layer (DAL) with Edge SWR caching and persistent IndexedDB (`idb`).
- [x] **Vitest Test Suite Scale**: Expanded automated test gates to 53 test files and 424 unit/integration tests with 100% pass rate.

---

## 🚀 Domain Expansions in Platform v2.0

### 1. AI & MLOps Engineering (Primary Domain 11)
- [x] **LLMOps & Vector Databases**: Pinecone, Qdrant, Milvus, Weaviate, pgvector
- [x] **RAG Architecture**: Chunking strategies, hybrid search, semantic caching, vector ingestion pipelines
- [ ] **Feature Stores**: Feast, Tecton, Hopsworks, Databricks Feature Store
- [ ] **Model Serving Infrastructure**: Triton Inference Server, TorchServe, vLLM, Seldon Core
- [ ] **Model Monitoring & Drift**: Evidently AI, Arize AI, Fiddler

### 2. High-Performance In-Process & Distributed Compute (Primary Domain 12)
- [x] **Single-Node In-Process Analytics**: DuckDB vectorized query execution, Polars Rust-backed DataFrames
- [x] **Zero-Copy Memory Interoperability**: Apache Arrow columnar format and Arrow C Data Interface
- [x] **Distributed Ray Compute**: Ray Core, Ray Data, Ray Train integration with Lakehouse tables
- [ ] **GPU-Accelerated Compute**: RAPIDS cuDF, Spark-RAPIDS, Polars-GPU
- [ ] **Apache Arrow Flight SQL**: High-throughput distributed database wire protocol

---

## ⚡ Concept Nodes Tracking Across Existing Domains

### Domain 1: Data Foundations
- [x] Apache Arrow / Memory Columnar Format
- [ ] Apache Arrow Flight SQL & ADBC Protocol
- [ ] GeoParquet & Spatial Indices (H3 / S2)
- [ ] BSON & FlexBuffers Serialization

### Domain 2: Data Ingestion & Streaming
- [x] Change Data Capture (CDC) with Debezium & Kafka
- [x] Kafka Event Streaming & High-Throughput Partitioning
- [ ] Vectorized CDC Ingestion (Estuary Flow, Striim)
- [ ] Airbyte & Meltano Open Ingestion Connectors
- [ ] Serverless Event Streaming (AWS EventBridge API Destinations)

### Domain 3: Data Storage & Lakehouse
- [x] Open Table Formats: Delta Lake, Apache Iceberg, Apache Hudi, Apache Paimon
- [x] Open File Formats: Apache Parquet, Apache ORC, Apache Avro
- [x] LanceDB & Vector Storage Format
- [x] In-Process Columnar Storage (DuckDB)
- [ ] ClickHouse Columnar OLAP Engine

### Domain 4: Data Processing & Query Engines
- [x] Apache Spark 3.5+ Catalyst Optimizer & Photon Engine
- [x] Adaptive Query Execution (AQE) & Skew Handling
- [x] Polars DataFrames Engine (Rust-backed)
- [x] Distributed Compute with Ray
- [ ] Daft Distributed Python Framework

### Domain 5: Data Modeling & Semantics
- [x] Kimball Dimensional Modeling & Star Schemas
- [x] Data Vault 2.0 (Hubs, Links, Satellites)
- [x] Power BI Semantic Models & Direct Lake VertiPaq
- [ ] Semantic Layer Standard (MetricFlow / Cube.dev)
- [ ] Activity Schema v2

### Domain 6: Orchestration & Workflow
- [x] Apache Airflow Distributed Architecture & Executors
- [x] dbt Analytics Engineering DAG & Transformation Framework
- [x] Databricks Asset Bundles (DABs) & Serverless Workflows
- [ ] Airflow 3.0 Task Isolation Engine
- [ ] Kestra Declarative Orchestrator
- [ ] Windmill Developer Workflow Platform

### Domain 7: Data Quality & Observability
- [x] Data Quality Validation Frameworks (Great Expectations)
- [x] Data Observability & Metric Telemetry
- [ ] Anomalo AI Automated Data Quality
- [ ] Synq Data Observability
- [ ] Metaplane Real-Time Warehouse Monitoring

### Domain 8: Data Governance & Security
- [x] Databricks Unity Catalog Centralized Governance & Lineage
- [x] Microsoft Purview Enterprise Unified Metadata Catalog
- [x] Row/Column-Level Security (RLS/CLS) & Dynamic Data Masking
- [ ] Immuta Data Security & Automated Policy Enforcement
- [ ] Privacera Unified Access Engine
- [ ] Zero-Trust Data Architecture Standards

### Domain 9: Analytics & Business Intelligence
- [x] Power BI DAX Engine Mechanics & Context Transition
- [x] Power BI Direct Lake Mode over OneLake
- [ ] Cube.dev Headless BI & Semantic Layer
- [ ] Evidence.dev Markdown-to-BI Framework
- [ ] GoodData Embedded Platform

### Domain 10: Architecture, DevOps & FinOps
- [x] Enterprise Lakehouse FinOps & Cloud Cost Optimization
- [x] Databricks Asset Bundles (DABs) CI/CD Automation
- [x] Distributed Systems Resilience & Consensus
- [x] Enterprise Data Mesh Architecture (Domain Ownership)
- [ ] Crossplane Cloud Native Infrastructure
- [ ] Cluster API & Cloud Native Data Operators

---

[← Back to Engineering Directory](./README.md) • [Documentation Hub](../README.md)

