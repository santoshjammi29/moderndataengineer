# Modern Data Engineer & Lakehouse Architect (`moderndataengineer.uk`)

<p align="center">
  <img src="assets/og_modern_stack.svg" alt="Modern Data Engineer & Lakehouse Architect Hub" width="100%">
</p>

<p align="center">
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16_App_Router-black?style=flat-square&logo=next.js" alt="Next.js 16"></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19_Server_Components-61DAFB?style=flat-square&logo=react" alt="React 19"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.x_Strict-3178C6?style=flat-square&logo=typescript" alt="TypeScript"></a>
  <a href="https://vitest.dev/"><img src="https://img.shields.io/badge/Tests-58_Files_%E2%80%A2_472_Passed-green?style=flat-square&logo=vitest" alt="Vitest"></a>
  <a href="https://developers.cloudflare.com/workers/"><img src="https://img.shields.io/badge/Deployment-Cloudflare_OpenNext-F38020?style=flat-square&logo=cloudflare" alt="Edge Architecture"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" alt="MIT License"></a>
  <a href="SECURITY.md"><img src="https://img.shields.io/badge/Security-Policy_Active-blue?style=flat-square&logo=securityscorecard" alt="Security Policy"></a>
</p>

> **The Definitive Open-Access Enterprise Data Engineering & Lakehouse Systems Encyclopedia**  
> 11,800+ verified scenarios, system design drills, and high-resolution architecture blueprints covering **Microsoft Fabric (DP-600), Databricks, Apache Spark 4.0, Delta Lake, Apache Iceberg, Unity Catalog, dbt, Apache Airflow, and Medallion Lakehouse Architecture**.  
> 
> 🌐 **Live Web Application**: **[https://moderndataengineer.uk](https://moderndataengineer.uk)**  
> 📦 **Sister Repository**: **[The PySpark Handbook (105 Production Recipes)](https://github.com/santoshjammi29/pyspark-handbook)** • **[Azure Enterprise Cheat Sheet](https://github.com/santoshjammi29/azure-cheat-sheet)**

---

## 🏛️ System Architecture

Built on a **Zero-Bundle, Zero-Egress, Edge-Native Architecture**: massive data catalogs stay strictly server-side within React 19 `cache()` Data Access Layers (DAL), serving zero-bundle lightweight JSON payloads to 60 FPS virtualized client surfaces (`@tanstack/react-virtual` + HTML5 `<canvas>`). Large dataset shards are persistently cached in the browser's IndexedDB (`idb`), guaranteeing **0 bytes of repeat network egress** across tab switches and page reloads:

```mermaid
flowchart TD
    subgraph EDGE["Global Edge Tier (Cloudflare OpenNext)"]
        direction TB
        E1["proxy.ts (Edge Routing, SWR Invalidation, R2 Cache)"]
    end

    subgraph SERVER["Server Data Layer"]
        direction TB
        S1["React 19 cache() DAL"]
        S2["Sharded R2 Artifacts"]
        S3["Edge SWR API Routes"]
        S4["Google-Grade BM25F Search Engine"]
        S5["Streaming PDF Attachment API"]
        S6["Bounded Redis LRU Memory Cache"]
    end

    subgraph CLIENT["Client Browsing Engine"]
        direction TB
        C1["0 KB Raw JSON Bundled in Client"]
        C2["Persistent Browser IndexedDB Cache"]
        C3["TanStack Virtual DOM (60 FPS)"]
        C4["Zero-Egress Tab Switch & Navigation"]
        C5["Cloudflare KV Progress Sync"]
        C6["3-in-1 View Switchers (Glossary, Mindmap, Cards)"]
    end

    EDGE --> SERVER
    EDGE --> CLIENT
```

---

## 📊 Curated Data Inventory (11,800+ Assets)

The platform hosts the industry's most rigorous, verified repository of data engineering scenarios, system design benchmarks, and architecture blueprints:

| Category | Module / Dataset | Count | Focus & Architectural Scope |
| :--- | :--- | :---: | :--- |
| **Lifecycle Hub** | Unified Mastery Stages Hub | **5 Systems** | 4-Stage Mastery Journey, 7-Stage Lakehouse Flow, 6-Stage SDLC (152 controls), 5-Stage Catalyst Pipeline, and 8 Production Flow diagrams (`/stages`). |
| **System Design** | Architecture Scenarios | **3,269** | End-to-end cloud designs, trade-off matrices, failure modes & 36-keyword multi-domain filter deck (`/architecture`). |
| **Technical Q&A** | Data Engineering Practice | **3,670** | Distributed compute, streaming CDC, pipeline reliability & lakehouse design (`data_de.json`). |
| **Technical Q&A** | Core Platform Questions | **3,414** | Deep internals across Fabric, Power BI, Synapse, ADF, Spark & SQL Server (`questions.json`). |
| **Unified Q&A** | Total Q&A Question Bank | **7,084** | Unified technical drill bank with progressive batch rendering & zero-OOM edge delivery (`/qa-prep`). |
| **Staff+ Mastery** | Extreme Architect Scenarios | **125** | High-pressure Staff/Principal interview design problems across 5 domain blocks. |
| **Core Concepts** | Architectural Concepts | **704** | 14 pillars: Fabric, Databricks, Lakehouse, Spark, Power BI, ADF, Airflow, dbt, FinOps, etc. (`/concepts`). |
| **Modern Concepts** | Cutting-Edge Primitives | **32** | UniForm, Iceberg v2/v3, Paimon, LanceDB, Arrow C Data, Liquid Clustering, Data Contracts, ODCS standard (`/modern-stack`). |
| **Curriculum** | Databricks 100 Mastery | **100** | 100-day structured roadmap with certification mappings (DE Associate & Pro). |
| **Visual Design** | Whiteboard Blueprints | **42** | High-resolution digital hand-drawn blueprints with 5 role perspectives (Architect, Senior DE, DE, Steward, BA), failure triage & engine mechanics across 7 domains (`/whiteboards`). |
| **Coding Hub** | Unified Code Practice Hub | **326+ Ops** | 178 Interactive Drills, 148+ Databricks Operations & Memory Triage, 15 Polyglot Matrix, and 62 Python Runbooks (`/code-practice`). |
| **Cloud Matrix** | Cloud Platforms & Engine Matrix | **10 Engines** | Cross-engine compatibility across 10 distributed engines vs. Delta/Iceberg/Hudi, 15 FinOps cost playbooks, and 6 interactive calculators (`/modern-stack`). |
| **Modern Stack** | Modern Architecture Blueprints | **18** | End-to-end modern lakehouse, vector pipeline, and CDC stream blueprints. |
| **Enterprise Guide** | GCC Enterprise Directory | **156** | Tier-1 Global Capability Centers (Bangalore/Hyderabad) with hiring rubrics & tech stacks (`/company-research`). |
| **Coding Practice** | Engine Benchmark Exercises | **178** | Hands-on PySpark (51), Spark SQL (50), Python/DataOps (42), and MSSQL (35). |
| **Databricks Hub** | Unified Databricks Operations | **148+** | 7 suite cards + 100 architectural operations + 6 production memory triage playbooks (`/code-practice/databricks`). |
| **PDF Downloads** | Compiled Master Vector PDFs | **7** | Production vector PDFs (Architecture, PySpark, Python, Spark Core, Spark SQL, Incident Runbooks, Master Ref) (`/cheat-sheet`). |
| **Reference** | Cheatsheet Suites & Cards | **7 Suites / 134+** | 7 Databricks suites (48 cards) + 86 quick reference cards (Web, PDF, Poster). |
| **Polyglot Matrix** | Multi-Engine Code Matrix | **15** | Comparative code execution matrix across Databricks, Snowflake, BigQuery, Fabric, DuckDB, Trino, and Scala. |
| **Lakehouse FinOps** | Modern Cost Playbooks | **15** | Cloud Lakehouse FinOps & compute cost reduction playbooks with risk assessments. |
| **Roadmaps** | Learning Paths | **13** | 13 curated tracks including Path 13: 16-Week Production Lakehouse Engineer, and legacy note on DP-203 retirement on March 31, 2025 (`/learning-paths`). |

---

## 🎨 Enterprise Whiteboard Blueprints (42 Architect-Grade Blueprints)

All 42 blueprints are rendered as high-fidelity hand-drawn digital schematics (available in `src/data/diagrams.ts` and `/public/diagrams/` in WebP & AVIF formats) grouped into 7 core architectural domains. Every single blueprint has been elevated with **exhaustive technical granularity and multi-persona engineering depth**:

- **5 Distinct Role Perspectives per Blueprint**:
  - 🏛️ **Lead Data Architect**: Macro system design, multi-cloud federation, SLA/SLO definition, FinOps unit economics, disaster recovery.
  - ⚙️ **Senior / Staff Data Engineer**: Low-level engine internals, CPU cache line alignment, AST query plans, off-heap Tungsten memory, shuffle spill triage, ACID log serialization.
  - 🔧 **Data Engineer**: Daily ELT pipeline engineering, partition/clustering choices, idempotency, streaming checkpoints, schema evolution, and CDC ingestion.
  - 🛡️ **Data Steward & Governance**: Unity Catalog 3-level namespace (`catalog.schema.table`), Purview lineage graphs, dynamic row/column masks, PII classification, and GDPR deletion workflows.
  - 📊 **Business Analyst & BI**: Power BI Direct Lake sub-second DAX response, VertiPaq memory limits, metric consistency across dimensional bus matrices, and self-service exploration.
- **Executive Architect Manifesto (`architectNotes`)**: Explicit trade-offs, scaling limits, anti-patterns, and cost burndown models.
- **Under-the-Hood Technical Mechanisms**: 4–6 concrete engine mechanisms per blueprint (e.g. V-Order Parquet sorting, Netty socket buffers, HNSW vector indexing, RocksDB LSM memtables, OCC commit protocols).
- **Production Triage & Incident Runbooks**: Detailed incident cards featuring alert symptoms, root causes, and step-by-step engineering mitigations.
- **Interactive 4-Tab Lightbox Inspector**: Modal viewer across `/architecture` and `/whiteboards` enabling seamless switching between **Architecture & Pillars**, **5 Role Perspectives**, **Production Triage**, and **Governance & Compliance**.

| Architectural Domain | Count | Highlighted Production Blueprints |
| :--- | :---: | :--- |
| **Compute & Optimization** | **11** | Catalyst Optimizer & Photon Engine<br>• Shuffle & Memory Architecture<br>• Data Skew & AQE<br>• SaveMode Handling<br>• Join Strategy Decision Matrix<br>• Tungsten Spill Mechanics<br>• Structured Streaming State Store (RocksDB)<br>• Photon vs. JVM<br>• Broadcast & Accumulators<br>• SQL Server Engine Internals |
| **Storage Engines & Formats** | **8** | Delta Lake ACID Under the Hood<br>• Apache Iceberg Snapshot Tree<br>• Open Table Formats (Delta vs. Iceberg vs. Hudi)<br>• Open File Formats (Parquet vs. ORC vs. Avro)<br>• 6 Delta Optimization Levers<br>• Lakehouse ACID Concurrency Matrix<br>• SCD Types 0–6 in Medallion<br>• Master Enterprise Lakehouse Reference |
| **Pipelines & Ingestion** | **8** | Apache Airflow Distributed Architecture<br>• dbt Modern Analytics Engineering DAG<br>• Azure Data Factory Hybrid IR<br>• Kafka Event Streaming<br>• CDC with Debezium<br>• Databricks Medallion Architecture<br>• Delta Live Tables (DLT)<br>• Databricks Asset Bundles (DABs) & Serverless CI/CD |
| **Platform Landscape** | **5** | Databricks Unified Platform Master<br>• Enterprise RAG & Vector Data Pipelines<br>• Modern Python Data (Arrow, Polars, DuckDB)<br>• FinOps & Cloud Cost Optimization<br>• Enterprise Edge & IoT Architecture |
| **Microsoft Fabric & Power BI** | **4** | Microsoft Fabric Unified Architecture & OneLake<br>• Power BI Direct Lake & VertiPaq<br>• Power BI DAX Engine Mechanics & Context Transition<br>• Fabric OneLake Shortcuts & Direct Lake Mode |
| **Data Modeling & Architecture** | **4** | Kimball Dimensional Modeling & Star Schema<br>• Data Vault 2.0 Enterprise Modeling<br>• Distributed Systems Resilience & Consensus<br>• Enterprise Data Mesh & Data Products |
| **Governance & Security** | **2** | Unity Catalog Unified Governance & 3-Level Namespace<br>• Microsoft Purview Unified Metadata & Catalog |

---

## ⚡ Core Platform Capabilities & Recent Additions

- **16-Week Production Lakehouse Engineer Track & Incident Triage (`/learning-paths` & `docs/databricks_master_operations_and_triage_guide.md`)**:
  - **Applied 16-Week Curriculum (Path 13)**: Master day-two operational workflows across ADF, Databricks, SQL Server/Azure SQL, PySpark, and Delta Lake.
    - *Weeks 1–4*: ADF Production Ingestion & Control Flow (Tumbling Windows, REST API Pagination, High-Watermark Delta Ingestion, Bounded ForEach concurrency).
    - *Weeks 5–8*: Spark Notebook Engineering & Delta Lake Under the Hood (Thin orchestrators, Liquid Clustering, UniForm, Schema Evolution, Checkpoint internals).
    - *Weeks 9–12*: Enterprise CI/CD with Declarative Automation Bundles (DABs) & OIDC Keyless Deployments (Topological DAG verification, PR checks, environment promotion).
    - *Weeks 13–16*: SRE Observability, Incident Triage & Disaster Recovery (ADF $\times$ Databricks Retry Multipliers, Watermark Desync Reconciliation, Point-in-time Restore).
  - **Certification Lifecycle & DP-203 Retirement**: Marked DP-203 with a **Legacy Reference** badge (exam retired March 31, 2025) and directed candidates to **DP-700** (Fabric Data Engineer) and **DP-600** (Fabric Analytics Engineer).
  - **7 Master Production Incident Triage Runbooks**: Concrete runbooks addressing Driver OOM, Executor OOM, Tungsten Disk Spill, OCC Conflicts, Multi-Layer Retry Multiplication Storms ($(1+R_{\text{ADF}}) \times (1+R_{\text{DB}}) = 16$), Streaming Checkpoint Invalidation, and Two-Phase Watermark Commit desynchronization.
- **Universal Typography & Dynamic Font Scaling System**:
  - Universal multi-font switcher supporting 6 production typography systems: **Inter Sans** (Clean modern geometric UI), **JetBrains Mono** (Full developer monospace), **Fira Code** (Programming ligatures), **System UI** (Native OS font), **Editorial Serif** (Distraction-free reading), and **OpenDyslexic** (High-legibility letterforms).
  - Universal CSS custom properties (`--font-scale-multiplier`, `--font-sans`, `--font-mono`) propagating font size and family changes instantly across cards, headings, arbitrary pixel utilities (`text-[8px]` through `text-[15px]`), and code blocks (`pre`, `code`, `.token-line`).
  - Interactive `TextSizeController` with steppers (`[ A− ]` `[ Reset ]` `[ A+ ]`) and instant hotkeys (`Alt +` / `Alt -` / `Alt 0`).
- **Dynamic Left Sidebar Subpage Tree Navigation**:
  - Full subpage tree directly accessible from `Sidebar` with individual accordion expansion chevrons for all platform categories without needing to navigate to parent routes.
  - 1-click global "All Subpages" expand/collapse toggle button at the top of the sidebar navigation.
  - Indented visual guide branches (`border-l-2 border-blue-500/25`) displaying active state pills and real-time asset counts.
- **Mastery Stages & Systems Lifecycle Hub (`/stages`)**:
  - The single authoritative home consolidating 5 architectural stage systems: **4-Stage Mastery Progression Framework** (Foundations to Principal Architect), **7-Stage Modern Lakehouse & AI Stack Flow** (Ingestion to FinOps), **6-Stage Enterprise Data Delivery Playbook** (152 SDLC controls), **5-Stage Spark Catalyst Engine Execution Pipeline**, and an interactive gallery of **8 Production Flow Diagrams**.
- **Spark Catalyst Optimizer & Physical Execution Visualizer (`/spark-catalyst` & `/visualizer`)**:
  - Interactive 5-stage Catalyst visualization pipeline: Unresolved Logical Plan → Analyzed Logical Plan → Optimized Logical Plan (rule-based optimization, pushdown predicates, column pruning) → Physical Plan (Cost-Based Optimizer, join selection) → Adaptive Query Execution (AQE) runtime re-planning and Whole-Stage Code Generation (Tungsten).
- **Spark 4.0 Engine Architecture & Memory Simulator (`/spark-engine`)**:
  - Low-level JVM memory breakdown (On-Heap, Off-Heap, Storage vs Execution memory pools with borrowing mechanics), Shuffle Service architecture, Netty socket buffers, and AQE skew join resolution simulator.
- **Enterprise DataOps, DABs & CI/CD Hub (`/dataops`)**:
  - Modern analytics engineering workflows, Databricks Asset Bundles (DABs), Terraform automation, Git-backed declarative pipelines, and production test quality gates.
- **Dedicated Whiteboards Architecture Mastery Hub (`/whiteboards`)**:
  - Standalone high-resolution gallery of all 42 digital whiteboard blueprints across 7 architectural domains with full multi-persona inspector, technical under-the-hood engine mechanisms, and production triage playbooks.
- **Personal Learning Studio & Progress Tracker (`/studio`)**:
  - Offline-first interactive learning studio with custom bookmark management, certification goal tracking, and local progress persistence.
- **Universal Topic Search Engine (`/search-topics`)**:
  - Google-grade client-side topic reader indexing all 11,800+ assets with instant keyboard navigation, category filtering, and snippet previews.
- **Cloud Platforms & Engine Matrix (`/modern-stack`)**:
  - 10-engine cross-cloud compatibility matrix (Databricks, Snowflake, Microsoft Fabric, BigQuery, AWS EMR/Athena, DuckDB, Trino, ClickHouse, Redshift, Azure Synapse) vs. open table formats (Delta Lake, Apache Iceberg, Apache Hudi).
  - 15 Cloud Lakehouse FinOps cost reduction playbooks, 32 cutting-edge Lakehouse primitives, and 6 interactive platform calculators (DBU sizing, storage tiering, shuffle spill estimation).
- **Unified Code Practice & Production Runbooks Hub (`/code-practice`)**:
  - Consolidates 326+ coding operations under a single roof with 4 dedicated tabs: **Interactive Drills** (178 drills in PySpark 4.0, Spark SQL, T-SQL, Python/Polars), **Databricks Coding Hub** (148+ operations & memory triage playbooks), **Polyglot Matrix** (15 operations side-by-side across 7 engines), and **Python Runbooks** (62 production Lakehouse scripts).
- **Target Company Intel & Architect Dossiers Hub (`/company-research`)**:
  - Ultra-dense, space-efficient architectural dossiers across 156 verified enterprises (52 BigTech, 52 FinTech, 52 GCCs).
  - Triple-view workbench: **Compact Grid** (space-optimized cards with in-card accordion drawers), **Master-Detail Split Workbench** (directory rail on left, full interactive dossier on right), and **Dense Comparison Matrix** (sortable by USD/INR compensation and tier).
  - Real system design interview loops with 1-click prompt copying and direct architecture simulator links.
- **Single-Roof Concepts & Mind Map Hub (`/concepts`)**:
  - Unified view switcher seamlessly toggles between **Glossary & Cards (704 terms)**, **4-Level Interactive Mind Map (14 pillars)**, and **Active Recall Flashcards** without page reload.
- **Direct Navigation Shortcuts & Permanent Edge Redirects**:
  - Dedicated shortcuts and 301 edge redirects for `/blueprints` (→ `/whiteboards`), `/deployments` (→ `/studio`), `/spark-visualizer` (→ `/visualizer`), `/plan` (→ `/guided-learning?tab=curricula`), `/goal` (→ `/studio`), `/learn` (→ `/guided-learning`), `/boost` (→ `/qa-prep`), and `/browser` (→ `/search-topics`).
- **Dynamic Ultrawide & High-Resolution Display Scaling**:
  - Full dynamic viewport utilization across 1080p, 1440p, 2K, 4K, and 3440px ultrawide displays (`w-full max-w-7xl 2xl:max-w-[1800px] 3xl:max-w-[2200px] 4xl:max-w-none mx-auto`) with multi-column responsive grid scaling (e.g. 4-column mastery progression, 2-column code runbooks).
- **Google-Grade BM25F Search Engine (`⌘K` / `Ctrl+K`)**:
  - Sub-millisecond client-side discovery engine indexing all 11,800+ assets with instant keyboard navigation.
  - Field-weighted scoring (Title: 3×, Subtitle: 2×, Content: 1×) with typo tolerance and zero-OOM memory optimization on Cloudflare Workers edge.
- **Dedicated Databricks Coding Hub (`/code-practice/databricks`)**:
  - Consolidates 148+ operations with code templates, certification mappings, and native Unity Catalog Volumes and DBFS operations.
  - Dedicated production memory bottleneck triage playbooks: Driver OOM, Executor OOM, Shuffle Spill to Disk, Skew Joins, Small Files, and GC pauses.
- **PDF Downloads Hub & Streaming API (`/cheat-sheet` & `/api/download/pdf/[filename]`)**:
  - 7 compiled vector PDFs including the Lakehouse Enterprise Master Reference, Incident Runbooks, and 5 Databricks engineering sheets.
  - Direct browser attachment download headers with in-modal interactive preview.
- **36-Keyword Multi-Domain Scenario Filter (`/architecture`)**:
  - Interactive filter bar across 6 domain groups (Compute, Storage, Ingestion, FinOps, Governance, Modeling) with real-time matched counts and URL parameter synchronization.
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

# 3. Execute automated test suite (58 test files, 472 passed tests)
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

- **58 Test Files**: 100% passing across unit, integration, and UI component tests.
- **472 Tests**: Comprehensive coverage spanning BM25F ranking, virtual scroll limits, SIMD worker offloads, responsive layout constraints, 42 blueprint persona structures, whiteboard asset integrity verification, dynamic font scaling, and PDF download streaming headers.
- **Zero-Bundle Enforcement**: Automated tests verify that no raw JSON data leaks into client JavaScript bundles.

---

## 📜 Documentation Directory

Detailed platform architecture guides and engineering runbooks are maintained in [`docs/`](docs/README.md):

| Documentation Pillar | Scope & Focus Areas | Direct Links |
| :--- | :--- | :--- |
| **[Architecture & Blueprints](docs/architecture/README.md)** | Lakehouse systems, storage internals, and engine blueprints | [`01_azure_synapse.md`](docs/architecture/01_azure_synapse.md)<br>• [`02_microsoft_fabric.md`](docs/architecture/02_microsoft_fabric.md)<br>• [`05_lakehouse_finops.md`](docs/architecture/05_lakehouse_finops.md)<br>• [`06_enterprise_blueprints.md`](docs/architecture/06_enterprise_blueprints.md)<br>• [`07_open_storage_formats.md`](docs/architecture/07_open_storage_formats.md)<br>• [`08_delta_optimization.md`](docs/architecture/08_delta_optimization.md) |
| **[Databricks Operations & Triage](docs/databricks_master_operations_and_triage_guide.md)** | Operational reference: DBFS, Volumes, PySpark, SQL & OOM Triage | [`Master Operations & Triage Guide`](docs/databricks_master_operations_and_triage_guide.md) |
| **[Production Audits](docs/audits/README.md)** | Edge benchmarks, theme contrast, design system & accessibility | [`production_audit.md`](docs/audits/production_audit.md)<br>• [`theme_audit.md`](docs/audits/theme_audit.md)<br>• [`design_system_audit.md`](docs/audits/design_system_audit.md) |
| **[Design System](docs/design-system/README.md)** | Fluid tokens, typography scale & motion specifications | [`tokens_and_primitives.md`](docs/design-system/tokens_and_primitives.md) |
| **[Engineering & Operations](docs/engineering/README.md)** | App Router DAL, deployment guide & platform roadmap | [`development_guide.md`](docs/engineering/development_guide.md)<br>• [`workers-for-platforms.md`](docs/engineering/workers-for-platforms.md)<br>• [`roadmap.md`](docs/engineering/roadmap.md) |

👉 **[Browse Full Documentation Hub (`docs/README.md`)](docs/README.md)**
