# Modern Data Engineer & Lakehouse Architect (`moderndataengineer.uk`)

[![Next.js 16](https://img.shields.io/badge/Next.js-16_App_Router-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19_Server_Components-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x_Strict-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/Tests-49_Files_•_399_Passed-green?style=flat-square&logo=vitest)](https://vitest.dev/)
[![Edge Architecture](https://img.shields.io/badge/Deployment-Cloudflare_OpenNext-F38020?style=flat-square&logo=cloudflare)](https://developers.cloudflare.com/workers/)
[![Security Policy](https://img.shields.io/badge/Security-Policy_Active-blue?style=flat-square&logo=securityscorecard)](SECURITY.md)

> **Enterprise-Grade Cloud Educational Platform & Lakehouse Architecture Encyclopedia**  
> Tailored for Principal Data Architects, Staff Data Engineers, and Lead Analytics Engineers mastering Microsoft Fabric, Databricks, Apache Spark, Delta Lake, Apache Iceberg, Power BI, Azure Data Factory, dbt, Apache Airflow, and Modern Multi-Engine Lakehouse Design.  
> Live at: **[https://moderndataengineer.uk](https://moderndataengineer.uk)**

---

## 🏛️ System Architecture

Built on a **Zero-Bundle, Zero-Egress, Edge-Native Architecture**: massive data catalogs stay strictly server-side within React 19 `cache()` Data Access Layers (DAL), serving zero-bundle lightweight JSON payloads to 60 FPS virtualized client surfaces (`@tanstack/react-virtual` + HTML5 `<canvas>`). Large dataset shards are persistently cached in the browser's IndexedDB (`idb`), guaranteeing **0 bytes of repeat network egress** across tab switches and page reloads:

```
       ┌─────────────────────────────────────────────────────────────┐
       │             GLOBAL EDGE TIER (Cloudflare OpenNext)          │
       │       proxy.ts (Edge Routing, SWR Invalidation, R2 Cache)   │
       └──────────────────────────────┬──────────────────────────────┘
                                      │
              ┌───────────────────────┴───────────────────────┐
              ▼                                               ▼
┌───────────────────────────┐                   ┌───────────────────────────┐
│     SERVER DATA LAYER     │                   │   CLIENT BROWSING ENGINE  │
│  - React 19 cache() DAL   │                   │  - 0 KB Raw JSON Bundled  │
│  - Sharded R2 Artifacts   │                   │  - Persistent IndexedDB   │
│  - Edge SWR API Routes    │                   │  - TanStack Virtual DOM   │
│  - Google-Grade BM25F     │                   │  - Zero-Egress Tab Switch │
│  - Streaming PDF API      │                   │  - Cloudflare KV Progress │
│  - Bounded Redis Cache    │                   │  - 3-in-1 View Switchers  │
└───────────────────────────┘                   └───────────────────────────┘
```

---

## 📊 Curated Data Inventory (11,500+ Assets)

The platform hosts the industry's most rigorous, verified repository of data engineering scenarios, system design benchmarks, and architecture blueprints:

| Category | Module / Dataset | Count | Focus & Architectural Scope |
| :--- | :--- | :---: | :--- |
| **System Design** | Architecture Scenarios | **3,206** | End-to-end cloud designs, trade-off matrices, failure modes & 36-keyword multi-domain filter deck. |
| **Technical Q&A** | Data Engineering Practice | **3,615** | Distributed compute, streaming CDC, pipeline reliability & lakehouse design. |
| **Technical Q&A** | Core Platform Questions | **3,232** | Deep internals across Fabric, Power BI, Synapse, ADF, Spark & SQL Server. |
| **Staff+ Mastery** | Extreme Architect Scenarios | **125** | High-pressure Staff/Principal interview design problems across 5 domain blocks. |
| **Core Concepts** | Architectural Concepts | **679** | 14 pillars: Fabric, Databricks, Lakehouse, Spark, Power BI, ADF, Airflow, dbt, FinOps, etc. |
| **Curriculum** | Databricks 100 Mastery | **100** | 100-day structured roadmap with certification mappings (DE Associate & Pro). |
| **Visual Design** | Whiteboard Blueprints | **42** | High-resolution digital hand-drawn blueprints with detailed mechanics across 7 domains. |
| **Modern Stack** | Modern Architecture Blueprints | **18** | End-to-end modern lakehouse, vector pipeline, and CDC stream blueprints. |
| **Enterprise Guide**| GCC Enterprise Directory | **156** | Tier-1 Global Capability Centers (Bangalore/Hyderabad) with hiring rubrics & tech stacks. |
| **Coding Practice** | Engine Benchmark Exercises | **178** | Hands-on PySpark (51), Spark SQL (50), Python/DataOps (42), and MSSQL (35). |
| **Databricks Hub** | Unified Databricks Operations | **148+** | 48 suite cards + 100 architectural operations + 6 production memory triage playbooks. |
| **PDF Downloads** | Compiled Master Vector PDFs | **7** | Production vector PDFs (Architecture, PySpark, Python, Spark Core, Spark SQL, Incident Runbooks, Master Ref). |
| **Reference** | Cheatsheet Card Suites | **124** | 48 Databricks suite cards + 76 quick reference cards (Web, PDF, Poster). |
| **Polyglot Matrix** | Multi-Engine Code Matrix | **15** | Comparative code execution matrix across Databricks, Snowflake, BigQuery, Fabric, and DuckDB. |
| **Lakehouse FinOps**| Modern Cost Playbooks | **15** | Cloud Lakehouse FinOps & compute cost reduction playbooks with risk assessments. |
| **Roadmaps** | Learning Paths | **12** | Structured certification paths for DP-600, DP-203, PL-300, and Databricks. |

---

## 🎨 Enterprise Whiteboard Blueprints (42 Blueprints)

All blueprints are rendered as high-fidelity hand-drawn digital schematics (available in `src/data/diagrams.ts` and `/public/diagrams/` in WebP & AVIF formats) grouped into 7 core architectural domains:

| Architectural Domain | Count | Highlighted Production Blueprints |
| :--- | :---: | :--- |
| **Compute & Optimization** | **11** | Catalyst Optimizer & Photon Engine • Shuffle & Memory Architecture • Data Skew & AQE • SaveMode Handling • Join Strategy Decision Matrix • Tungsten Spill Mechanics • Structured Streaming State Store (RocksDB) • Photon vs. JVM • Broadcast & Accumulators • SQL Server Engine Internals |
| **Storage Engines & Formats** | **8** | Delta Lake ACID Under the Hood • Apache Iceberg Snapshot Tree • Open Table Formats (Delta vs. Iceberg vs. Hudi) • Open File Formats (Parquet vs. ORC vs. Avro) • 6 Delta Optimization Levers • Lakehouse ACID Concurrency Matrix • SCD Types 0–6 in Medallion • Master Enterprise Lakehouse Reference |
| **Pipelines & Ingestion** | **8** | Apache Airflow Distributed Architecture • dbt Modern Analytics Engineering DAG • Azure Data Factory Hybrid IR • Kafka Event Streaming • CDC with Debezium • Databricks Medallion Architecture • Delta Live Tables (DLT) • Databricks Asset Bundles (DABs) & Serverless CI/CD |
| **Platform Landscape** | **5** | Databricks Unified Platform Master • Enterprise RAG & Vector Data Pipelines • Modern Python Data (Arrow, Polars, DuckDB) • FinOps & Cloud Cost Optimization • Enterprise Edge & IoT Architecture |
| **Microsoft Fabric & Power BI**| **4** | Microsoft Fabric Unified Architecture & OneLake • Power BI Direct Lake & VertiPaq • Power BI DAX Engine Mechanics & Context Transition • Fabric OneLake Shortcuts & Direct Lake Mode |
| **Data Modeling & Architecture**| **4** | Kimball Dimensional Modeling & Star Schema • Data Vault 2.0 Enterprise Modeling • Distributed Systems Resilience & Consensus • Enterprise Data Mesh & Data Products |
| **Governance & Security** | **2** | Unity Catalog Unified Governance & 3-Level Namespace • Microsoft Purview Unified Metadata & Catalog |

---

## ⚡ Core Platform Capabilities & Recent Additions

- **Google-Grade BM25F Search Engine (`⌘K` / `Ctrl+K`)**:
  - Sub-millisecond client-side discovery engine indexing all 11,500+ assets with instant keyboard navigation.
  - Field-weighted scoring (Title $\times 3$, Subtitle $\times 2$, Content $\times 1$) with typo tolerance and zero-OOM memory optimization on Cloudflare Workers edge.
- **Single-Roof Concepts & Mind Map Hub (`/concepts`)**:
  - Unified view switcher seamlessly toggles between **Glossary & Cards (679 terms)**, **4-Level Interactive Mind Map (14 pillars)**, and **Active Recall Flashcards** without page reload.
- **Dedicated Databricks Coding Hub (`/code-practice/databricks`)**:
  - Consolidates 148+ operations with code templates, certification mappings, and native Unity Catalog Volumes and DBFS operations.
  - Dedicated production memory bottleneck triage playbooks: Driver OOM, Executor OOM, Shuffle Spill to Disk, Skew Joins, Small Files, and GC pauses.
- **PDF Downloads Hub & Streaming API (`/cheat-sheet` & `/api/download/pdf/[filename]`)**:
  - 7 compiled vector PDFs including the Lakehouse Enterprise Master Reference, Incident Runbooks, and 5 Databricks engineering sheets.
  - Direct browser attachment download headers with in-modal interactive preview.
- **36-Keyword Multi-Domain Scenario Filter (`/architecture`)**:
  - Interactive filter bar across 6 domain groups (Compute, Storage, Ingestion, FinOps, Governance, Modeling) with real-time matched counts and URL parameter synchronization.
- **2026 Cloud × Polyglot Matrix (`/modern-stack`)**:
  - Comparative execution matrices and cost playbooks across Databricks, Snowflake, BigQuery, Microsoft Fabric, and DuckDB.
- **Enterprise Security & Reliability**:
  - Strict Content Security Policy (CSP), bounded memory Redis LRU cache, Cloudflare KV/D1 authentication and progress synchronization, and security disclosure policy (`SECURITY.md` and `/.well-known/security.txt`).

---

## 🛠️ Quick Start & Developer Guide

### Prerequisites
- Node.js 18.17+ or 20+
- Python 3.10+ (for content sharding & validation scripts)

```bash
# 1. Install project dependencies
npm install

# 2. Run local Next.js development server
npm run dev
# Open http://localhost:3000

# 3. Execute automated test suite (49 test files, 399 passed tests)
npm test

# 4. Production build check (Cloudflare OpenNext build)
npm run build:cf

# 5. Full production deployment to Cloudflare with idempotent R2 sync
npm run deploy:cf

# 6. Fast-track code-only deployment (~35 seconds, skips R2 uploads)
npm run deploy:quick
```

---

## 🧪 Testing & Verification

Automated quality gates validate data schemas, bundle hygiene, accessibility, and search indexing:

- **49 Test Files**: 100% passing across unit, integration, and UI component tests.
- **399 Tests**: Comprehensive coverage spanning BM25F ranking, virtual scroll limits, SIMD worker offloads, responsive layout constraints, and PDF download streaming headers.
- **Zero-Bundle Enforcement**: Automated tests verify that no raw JSON data leaks into client JavaScript bundles.

---

## 📜 Documentation Directory

Detailed platform architecture guides and engineering runbooks are maintained in [`docs/`](docs/README.md):

| Documentation Pillar | Scope & Focus Areas | Direct Links |
| :--- | :--- | :--- |
| **[Architecture & Blueprints](docs/architecture/README.md)** | Lakehouse systems, storage internals, and engine blueprints | [`01_azure_synapse.md`](docs/architecture/01_azure_synapse.md) • [`02_microsoft_fabric.md`](docs/architecture/02_microsoft_fabric.md) • [`05_lakehouse_finops.md`](docs/architecture/05_lakehouse_finops.md) • [`06_enterprise_blueprints.md`](docs/architecture/06_enterprise_blueprints.md) • [`07_open_storage_formats.md`](docs/architecture/07_open_storage_formats.md) • [`08_delta_optimization.md`](docs/architecture/08_delta_optimization.md) |
| **[Databricks Operations & Triage](docs/databricks_master_operations_and_triage_guide.md)** | Operational reference: DBFS, Volumes, PySpark, SQL & OOM Triage | [`databricks_master_operations_and_triage_guide.md`](docs/databricks_master_operations_and_triage_guide.md) |
| **[Production Audits](docs/audits/README.md)** | Edge benchmarks, theme contrast, design system & accessibility | [`production_audit.md`](docs/audits/production_audit.md) • [`theme_audit.md`](docs/audits/theme_audit.md) • [`design_system_audit.md`](docs/audits/design_system_audit.md) |
| **[Design System](docs/design-system/README.md)** | Fluid tokens, typography scale & motion specifications | [`tokens_and_primitives.md`](docs/design-system/tokens_and_primitives.md) |
| **[Engineering & Operations](docs/engineering/README.md)** | App Router DAL, deployment guide & platform roadmap | [`development_guide.md`](docs/engineering/development_guide.md) • [`workers-for-platforms.md`](docs/engineering/workers-for-platforms.md) • [`roadmap.md`](docs/engineering/roadmap.md) |

👉 **[Browse Full Documentation Hub (`docs/README.md`)](docs/README.md)**
