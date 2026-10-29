---
name: fabric-pbi-prep-dev
description: |
  Project-specific development workflow for the Modern Data Engineer & Lakehouse Architect Next.js app (moderndataengineer.uk).
  Activate when working on:
  - The Next.js app at /Users/santosh/Documents/antigravity/charming-fermi
  - Adding/modifying data in src/data/json/ (concepts, questions, architecture scenarios, company profiles, Databricks 100, polyglot matrix)
  - Building new pages under src/app/ (concepts with integrated mindmap, guided learning, company research, architecture hub, qa prep, modern stack, code practice with databricks hub, cheat sheet with pdf downloads hub, etc.)
  - Running tests, builds, commits, and Git operations for this project
  - Guided learning, Q&A prep, architecture hub, mind map, or concepts page features
  - Cloudflare OpenNext edge deployment, R2 asset syncing, BM25F search engine, or PDF downloads API

  DO NOT trigger for:
  - Other Next.js projects
  - General data engineering questions unrelated to this app
---

# fabric-pbi-prep Dev Skill (`moderndataengineer.uk`)

You are working on **Lakehouse Architect / Modern Data Engineer** (`moderndataengineer.uk`) — an enterprise-grade Next.js 16 App Router data engineering and cloud architect platform deployed to **Cloudflare OpenNext / Workers** with Cloudflare R2 artifact storage and edge caching.

---

## 1. Project Layout & Route Architecture

```
/Users/santosh/Documents/antigravity/charming-fermi/
├── src/
│   ├── app/                               # Next.js 16 App Router routes
│   │   ├── page.tsx                       # Home / Hero Command Center, rolling ticker, recent deployments
│   │   ├── guided-learning/               # 4-tier progressive cross-section learning journey
│   │   ├── concepts/                      # 679 concepts with 3-in-1 view switcher (Glossary, Mindmap, Flashcards)
│   │   ├── mindmap/                       # Standalone route (cross-links to /concepts single-roof view)
│   │   ├── qa-prep/                       # 6,847 Q&A scenarios (questions.json + data_de.json)
│   │   ├── architecture/                  # 3,206 architecture scenarios + 36-keyword filter bar + 42 whiteboard blueprints
│   │   ├── code-practice/                 # 178 practical code cards (PySpark 51, Spark SQL 50, Python 42, MSSQL 35)
│   │   │   └── databricks/                # Unified Databricks Coding Hub (148+ operations & memory triage)
│   │   ├── learning-paths/                # 12 structured career paths (Fabric, Databricks, Azure)
│   │   ├── company-research/              # 156 GCC company profiles (BigTech, FinTech, GCCs)
│   │   ├── modern-stack/                  # Modern stack Q&As, badges, 15 cost playbooks, 15 polyglot code matrix items
│   │   ├── spark-engine/                  # Spark engine internals, memory model, and AQE
│   │   ├── dataops/                       # DataOps, DABs, and CI/CD automation
│   │   ├── cheat-sheet/                   # Cheatsheets hub + PDF downloads hub (7 compiled master PDFs)
│   │   ├── studio/                        # Studio sandbox
│   │   └── api/                           # Serverless Edge API routes:
│   │       ├── download/pdf/[filename]/   # Streaming PDF download API with attachment headers
│   │       ├── search/                    # BM25F Google-grade zero-OOM search API
│   │       ├── questions/                 # Clamped question queries with edge validation
│   │       ├── concepts/                  # Concepts API
│   │       ├── progress/                  # Cloudflare KV/D1 & Redis bounded cache progress sync
│   │       └── artifacts/                 # Sharded JSON R2 artifact streaming
│   ├── components/
│   │   ├── ui/
│   │   │   └── unified-search-filter-box.tsx # 4-level accessible filter deck & keyboard navigation
│   │   ├── concepts/
│   │   │   └── concepts-mindmap-view.tsx    # 4-depth dynamic stretching mind map engine (14 pillars)
│   │   ├── architecture/
│   │   │   ├── diagrams-gallery.tsx         # 42 whiteboard blueprint modal viewer & zoom
│   │   │   └── keyword-filter-bar.tsx       # 36-keyword scenario filter section across 6 domain groups
│   │   ├── cheatsheet/
│   │   │   ├── databricks-cheatsheet-view.tsx # Interactive Databricks 48-card cheatsheet suite
│   │   │   └── pdf-downloads-hub.tsx        # High-density PDF downloads hub with modal preview & direct download
│   │   ├── command-palette.tsx              # BM25F universal command palette (⌘K / Ctrl+K)
│   │   ├── layout/                          # Header, breadcrumbs, HubSubnav, mobile drawer
│   │   └── dashboard/                       # Hero command center, rolling ticker, capsules
│   ├── data/
│   │   ├── json/                          # 27 production JSON datasets (11,500+ assets)
│   │   ├── index.ts                       # All dataset exports + getStandardizedDomain()
│   │   ├── diagrams.ts                    # 42 Whiteboard Architecture Blueprint items & metadata
│   │   ├── concepts-tree-data.ts          # 14 core topics & subtopic pillars for mindmap
│   │   ├── guided-learning-topics.ts      # Topic mapping for /guided-learning
│   │   └── navigation-data.ts             # Global navigation links, icons, and shortcuts
│   ├── lib/
│   │   ├── search-engine.ts               # Google-grade BM25F search engine with zero-OOM memory footprint
│   │   ├── dal.ts                         # React 19 cache() Server Data Access Layer
│   │   ├── db.ts                          # Serverless database adapter with memory fallback
│   │   ├── redis.ts                       # Bounded memory cache with LRU eviction
│   │   ├── qa-filters.ts                  # Dynamic ecosystem & difficulty filter utilities
│   │   ├── guided-learning.ts             # Topic-based cross-dataset aggregation
│   │   └── diagram-theme.ts               # Whiteboard blueprint styling & asset links
│   ├── types/data.ts                      # TypeScript interfaces & types
│   └── __tests__/                         # Vitest test suite (51 test files, 410 unit tests)
├── public/
│   ├── diagrams/                          # 42 Whiteboard Architecture Blueprints (.webp, .avif, .jpg)
│   └── cheatsheets/pdf/                   # 7 Master Vector PDFs & printable incident runbooks
└── docs/                                  # Architectural deep-dives, triage guides, and blueprints
```

---

## 2. Complete Data File Inventory (All 27 JSON Files)

| File | Export | Type | Count | Highlights |
|------|--------|------|-------|------------|
| `data_concepts.json` | `conceptsDb` | `Concept[]` | **679** | Merged modern lakehouse concepts with 4-tier difficulty and keyPoints. |
| `questions.json` | `questionsDb` | `Question[]` | **3,232** | Core cloud platform and Fabric architect scenarios. |
| `data_de.json` | `questionsDeDb` | `Question[]` | **3,615** | General data engineering, real-world production drills. |
| `data_architecture.json` | `architectureData` | `ArchitectureQuestion[]` | **3,206** | End-to-end system design and production troubleshooting. |
| `company_profiles.json` | `companyProfiles` | `CompanyProfile[]` | **156** | Tier-1 GCC hiring criteria, tech stacks, and rounds. |
| `databricks_100.json` | `databricks100Db` | `DatabricksConcept[]` | **100** | 100-day progressive Databricks mastery challenge with code. |
| `databricks_cheatsheets.json` | `databricksCheatsheets` | `CheatSheetSuite[]` | **6 suites (48 cards)** | 48 curated coding cards + 7 master PDF download references. |
| `data_pyspark.json` | `pysparkData` | `CodeSheetItem[]` | **51** | Windowing, AQE, broadcast joins, Delta optimizations. |
| `data_sparksql.json` | `sparksqlData` | `CodeSheetItem[]` | **50** | Catalyst plans, shuffle partitioning, CBO tuning. |
| `data_python.json` | `pythonData` | `CodeSheetItem[]` | **42** | Asyncio, generators, memory management, GIL, Arrow/Polars. |
| `data_mssql.json` | `mssqlData` | `CodeSheetItem[]` | **35** | Query store, index fragmentation, execution plans. |
| `data_paths.json` | `learningPathsDb` | `LearningPath[]` | **12** | Structured career learning journeys. |
| `data_cheatsheet.json` | `cheatsheetData` | `CheatSheetCard[]` | **76** | High-density cheatsheet reference cards. |
| `data_personalised.json` | `personalisedData` | `PersonalisedQuestion[]` | **50** | Targeted scenario-based interview drills. |
| `questions_unified_cleaned.json` | `questionsUnified` | `Question[]` | **2,906** | Cleaned and deduplicated core interview question bank. |
| `modern_blueprints.json` | `modernBlueprints` | `BlueprintItem[]` | **18** | Modern lakehouse architecture blueprints. |
| `modern_badges.json` | `modernBadges` | `BadgeItem[]` | **10** | Certification and skill mastery badges. |
| `modern_concepts.json` | `modernConcepts` | `ModernConcept[]` | **20** | Cutting-edge cloud data platform concepts. |
| `modern_stack.json` | `modernStack` | `StackItem[]` | **20** | Modern data stack component overviews. |
| `modern_subdomains.json` | `modernSubdomains` | `SubdomainItem[]` | **14** | Subdomain taxonomy mappings. |
| `modern_cost_playbooks.json` | `costPlaybooks` | `CostPlaybook[]` | **15** | Cloud Lakehouse FinOps & compute cost reduction playbooks. |
| `modern_code_matrix.json` | `codeMatrix` | `CodeMatrixItem[]` | **15** | Comparative polyglot code matrix across 5 engines. |
| `extreme_architect_questions_block1..5.json` | `extremeArchBlock1..5` | `ArchitectureQuestion[]` | **125** | 5 blocks of 25 extreme edge-case architect scenarios. |

---

## 3. 42 Enterprise Whiteboard Blueprints Catalog (Architect-Grade • 5 Roles)

All 42 blueprints follow the hand-drawn digital whiteboard sketch style with 100% white background, semantic colors (Red compute, Blue engine/dispatcher, Yellow raw source, Purple governance, Green Delta/Iceberg target), and are persisted in `src/data/diagrams.ts` and `public/diagrams/`. Every blueprint includes:
- **5 Role Perspectives (`personaBreakdown`)**: Lead Architect, Senior / Staff DE, Data Engineer, Data Steward, and Business Analyst.
- **Executive Architect Manifesto (`architectNotes`)**: Explicit architectural trade-offs, scalability limits, and FinOps models.
- **6–8 Key Architectural Pillars (`keyPoints`)**: Deep engine configurations and technical invariants.
- **Under-the-Hood Technical Mechanisms (`technicalMechanisms`)**: 4–6 specific engine mechanisms per blueprint.
- **Production Incident Triage Runbooks (`failureModesAndTriage`)**: Actionable incident cards with symptoms, root causes, and mitigations.
- **Governance & Compliance Guardrails (`governanceAndCompliance`)**: Audit trails, sensitivity labels, and regulatory standards.
- **Interactive 4-Tab Lightbox Inspector**: Full modal exploration across Architecture & Pillars, 5 Role Perspectives, Production Triage, and Governance.

| Blueprint ID | Title | Category |
| :--- | :--- | :--- |
| `fabric-onelake-architecture` | Microsoft Fabric Unified Architecture & OneLake | Fabric & Power BI |
| `powerbi-direct-lake-vertipaq` | Power BI Direct Lake Mode & VertiPaq Semantic Engine | Fabric & Power BI |
| `powerbi-dax-engine-context` | Power BI DAX Formula/Storage Engine Mechanics | Fabric & Power BI |
| `apache-airflow-distributed-architecture` | Apache Airflow Distributed Architecture & Schedulers | Data Pipelines & Ingestion |
| `dbt-analytics-engineering-dag` | dbt Analytics Engineering DAG & Transformation Mesh | Data Pipelines & Ingestion |
| `adf-hybrid-integration-runtime` | Azure Data Factory Hybrid Pipeline & SHIR | Data Pipelines & Ingestion |
| `kafka-event-streaming-pipeline` | Apache Kafka Event Streaming & High-Throughput Messaging | Data Pipelines & Ingestion |
| `cdc-debezium-lakehouse-pipeline` | CDC with Debezium & Streaming Lakehouse Ingestion | Data Pipelines & Ingestion |
| `databricks-medallion-pipeline` | Databricks Multi-Hop Medallion Architecture | Platform Landscape |
| `delta-live-tables-pipeline` | Databricks Delta Live Tables (DLT) Declarative ETL | Data Pipelines & Ingestion |
| `delta-lake-under-the-hood` | Delta Lake Under-The-Hood ACID Transaction Mechanics | Storage Engine |
| `apache-iceberg-open-table-format` | Apache Iceberg Open Table Format & Snapshot Trees | Storage Engine |
| `spark-catalyst-photon-engine` | Databricks Compute: Catalyst Optimizer, AQE & Native Photon C++ Engine | Compute & Optimization |
| `spark-shuffle-memory-internals` | Apache Spark Shuffle Internals & Unified JVM Memory | Compute & Optimization |
| `databricks-platform-master` | Databricks Unified Platform Master Blueprint | Platform Landscape |
| `rag-vector-search-data-pipeline` | Enterprise RAG & Vector Search Data Ingestion Pipeline | Platform Landscape |
| `unity-catalog-governance-lineage` | Databricks Unity Catalog Centralized Governance & Lineage | Governance & Security |
| `purview-enterprise-governance` | Microsoft Purview Enterprise Unified Governance & Metadata | Governance & Security |
| `open-table-formats-comparison` | Open Table Formats Comparison (Delta vs Iceberg vs Hudi) | Storage Engine |
| `open-file-formats-comparison` | Open File Formats Comparison (Parquet vs ORC vs Avro) | Storage Engine |
| `delta-lake-optimization-techniques` | 6 Delta Lake Optimization Levers (Partitioning, Z-Order, OPTIMIZE, Liquid Clustering, VACUUM) | Compute & Optimization |
| `sql-server-engine-internals` | SQL Server Relational Engine & Buffer Pool Mechanics | Compute & Optimization |
| `kimball-dimensional-star-schema` | Kimball Dimensional Modeling & Enterprise Star Schema | Data Modeling & Architecture |
| `data-vault-enterprise-architecture` | Data Vault 2.0 Enterprise Modeling (Hubs, Links, Satellites) | Data Modeling & Architecture |
| `enterprise-edge-iot-architecture` | Enterprise Edge Computing, IoT Hub & Distributed Gateways | Platform Landscape |
| `distributed-systems-resilience` | Distributed Systems Resilience & Circuit Breakers | Data Modeling & Architecture |
| `python-arrow-polars-duckdb` | Python High-Performance Data Engineering: Arrow, Polars & DuckDB | Platform Landscape |
| `enterprise-data-mesh-architecture` | Enterprise Data Mesh Architecture & Federated Governance | Data Modeling & Architecture |
| `spark-data-skew-aqe-optimization` | Apache Spark Data Skew Handling & Adaptive Query Execution | Compute & Optimization |
| `lakehouse-finops-cost-optimization` | Enterprise Lakehouse FinOps & Cloud Cost Optimization | Platform Landscape |
| `databricks-asset-bundles-cicd` | Databricks Asset Bundles (DABs) & Serverless CI/CD | Data Pipelines & Ingestion |
| `lakehouse-acid-concurrency-matrix` | Lakehouse ACID Concurrency & Conflict Detection Matrix | Storage Engine |
| `scd-types-medallion-architecture` | Slowly Changing Dimensions (SCD Types 0-6) in Medallion | Storage Engine |
| `structured-streaming-rocksdb-state` | Structured Streaming Stateful Operations & RocksDB State Store | Compute & Optimization |
| `spark-tungsten-memory-spill` | Spark Tungsten Engine Memory Management & Spill Mechanics | Compute & Optimization |
| `delta-savemode-concurrency-handling`| Delta Lake SaveMode Behaviors & Concurrent Append/Overwrite | Storage Engine |
| `spark-join-strategies-decision-matrix`| Apache Spark Distributed Join Strategy Decision Flowchart | Compute & Optimization |
| `photon-vectorized-vs-jvm-catalyst` | Photon Native Vectorized Execution vs JVM Whole-Stage CodeGen | Compute & Optimization |
| `broadcast-variables-accumulators` | Spark Broadcast Variables & Accumulator Internals | Compute & Optimization |
| `fabric-onelake-shortcuts-directlake`| Fabric OneLake Cross-Cloud Shortcuts & Direct Lake Paging | Fabric & Power BI |
| `enterprise-data-governance-lineage`| Enterprise Data Lineage, Auditing & Access Control | Governance & Security |
| `lakehouse-master-enterprise-architecture`| Master Enterprise Lakehouse Reference Blueprint | Platform Landscape |

---

## 4. Standard Dev Commands, Testing & Cloudflare Deployment

```bash
# 1. Run full test suite (must ALWAYS pass all 52 test files and 419 tests)
npm test

# 2. Production build check (OpenNext Cloudflare build)
npm run build:cf

# 3. Deploy full platform to Cloudflare OpenNext with idempotent R2 sync
npm run deploy:cf

# 4. Fast-track code deployment (~35 seconds, skips R2 uploads)
npm run deploy:quick

# 5. Verify JSON integrity
python3 -c "import json; d=json.load(open('src/data/json/data_concepts.json')); print('Concepts:', len(d))"

# 6. Git commit & sync to repository
git add -A
git commit -m "feat/fix/chore(scope): detailed description"
git push origin main
```

---

## 5. UI Architecture Patterns & Subpages

### 1. Unified Concepts Hub (`/concepts`)
Combines 679 concepts and the 14-pillar mind map into a single roof with a 3-way view switcher:
- **Glossary & Cards**: Virtualized searchable concept cards with 4 difficulty levels.
- **Multi-Level Mind Map**: 4-depth dynamic stretching mind map engine covering 14 pillars.
- **Flashcards Mode**: Interactive spaced-repetition card flip for active recall.

### 2. Dedicated Databricks Coding Hub (`/code-practice/databricks`)
- 148+ operations categorized across 6 suites (Architecture, PySpark, Spark SQL, Python SDK, Memory Triage, Streaming).
- Dedicated production memory triage playbooks: Driver OOM, Executor OOM, Shuffle Spill, Skew Joins, Small Files, GC Pauses.
- POSIX-compliant Unity Catalog Volumes, DBFS, and secret vault manipulation code.
- Seamless redirection from `/code-practice?db=databricks` and `/cheat-sheet?tab=databricks`.

### 3. PDF Downloads Hub (`src/components/cheatsheet/pdf-downloads-hub.tsx`)
- 7 Master Vector PDFs compiled and served via `/api/download/pdf/[filename]`:
  1. `databricks_master_cheatsheet.pdf`
  2. `databricks_pyspark_cheatsheet.pdf`
  3. `databricks_python_cheatsheet.pdf`
  4. `databricks_spark_core_cheatsheet.pdf`
  5. `databricks_sparksql_cheatsheet.pdf`
  6. `incident_runbooks.pdf`
  7. `lakehouse_enterprise_master_reference.pdf`
- Direct browser attachment download headers with in-modal PDF preview fallback.

### 4. 36-Keyword Scenario Filter Section (`src/components/architecture/keyword-filter-bar.tsx`)
- Filters 3,206 architecture scenarios across 6 domain groups (Compute, Storage, Ingestion, FinOps, Governance, Modeling) with real-time live counts and URL query parameter sync.

### 5. Google-Grade BM25F Search Engine (`src/lib/search-engine.ts`)
- Zero-OOM memory-optimized search catalog executing on Cloudflare Workers edge.
- Field-weighted BM25F scoring (Title $\times 3$, Subtitle $\times 2$, Content $\times 1$) with typo tolerance and keyboard command palette (`⌘K` / `Ctrl+K`).

### 6. Target Company Intel Workbench (`/company-research`)
- Space-efficient, dense layout following `nextjs-compact-ui` principles.
- 3 interactive view modes:
  - **Compact Grid**: Cards reduced in height by 50%+ with dual USD/INR salary benchmark strips, archetype badges, and in-card interactive accordion tabs (`Prompts`, `Interview Focus`, `Scale Challenge`).
  - **Master-Detail Split Workbench**: Left directory rail with company logos, tier dots, and quick salary indicators + sticky right full dossier pane.
  - **Dense Comparison Table**: Bloomberg-style matrix with sortable columns (name, tier, salary) and 1-click modal dossier action.
- Real interview loops with 1-click prompt copying and direct simulator links.
