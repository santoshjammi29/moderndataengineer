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
│   │   ├── stages/                        # Unified Stages Hub: 4-Stage Mastery, 7-Stage Lakehouse Flow, 6-Stage SDLC, 5-Stage Catalyst, 8 Production Flows
│   │   ├── guided-learning/               # 4-tier progressive cross-section learning journey
│   │   ├── concepts/                      # 704 concepts with 3-in-1 view switcher (Glossary, Mindmap, Flashcards)
│   │   ├── mindmap/                       # Standalone route (cross-links to /concepts single-roof view)
│   │   ├── qa-prep/                       # 7,084 Q&A scenarios (questions.json [3,414] + data_de.json [3,670])
│   │   ├── architecture/                  # 3,269 architecture scenarios + 36-keyword filter bar + 42 whiteboard blueprints
│   │   ├── code-practice/                 # Unified Code Practice Hub: 178 Drills, 148+ Databricks Operations & Triage, 15 Polyglot Matrix, 62 Python Runbooks
│   │   │   └── databricks/                # Dedicated Databricks Coding Hub (148+ operations & memory triage)
│   │   ├── learning-paths/                # 13 structured career paths (Fabric, Databricks, Azure, AWS, GCP, Snowflake, and 16-Week Production Lakehouse Track)
│   │   ├── company-research/              # 156 GCC company profiles (BigTech, FinTech, GCCs)
│   │   ├── modern-stack/                  # Cloud Platforms & Engine Matrix (10 engines, 15 FinOps playbooks, 32 primitives, 6 simulators, AI/RAG)
│   │   ├── spark-engine/                  # Spark engine internals, memory model, and AQE
│   │   │   └── catalyst/                  # Catalyst redirect to /spark-catalyst
│   │   ├── spark-catalyst/                # Spark Catalyst Optimizer & Execution Visualizer
│   │   ├── visualizer/                    # Spark Execution Visualizer
│   │   ├── whiteboards/                   # Dedicated Whiteboard Architecture Mastery Hub (42 hand-drawn blueprints)
│   │   ├── dataops/                       # DataOps, DABs, and CI/CD automation
│   │   ├── cheat-sheet/                   # Cheatsheets hub (86 cards) + PDF downloads hub (7 compiled master PDFs)
│   │   ├── studio/                        # Personal learning studio sandbox & goal tracker
│   │   ├── search-topics/                 # Universal Topic Search Engine (BM25F client reader)
│   │   ├── security/                      # Security Policy & Responsible Disclosure
│   │   ├── blueprints/                    # Permanent 301 redirect to /whiteboards
│   │   ├── deployments/                   # Permanent 301 redirect to /studio
│   │   ├── spark-visualizer/              # Permanent 301 redirect to /visualizer
│   │   ├── plan/                          # Permanent 301 redirect to /guided-learning?tab=curricula
│   │   ├── goal/                          # Permanent 301 redirect to /studio
│   │   ├── learn/                         # Permanent 301 redirect to /guided-learning
│   │   ├── boost/                         # Permanent 301 redirect to /qa-prep
│   │   ├── browser/                       # Permanent 301 redirect to /search-topics
│   │   └── api/                           # Serverless Edge API routes:
│   │       ├── download/pdf/[filename]/   # Streaming PDF download API with attachment headers
│   │       ├── search/                    # BM25F Google-grade zero-OOM search API
│   │       ├── search/item/               # Single-item search API
│   │       ├── questions/                 # Clamped question queries with edge validation
│   │       ├── concepts/                  # Concepts API
│   │       ├── bookmarks/resolve/         # Studio bookmarks resolver API
│   │       ├── progress/                  # Cloudflare KV/D1 & Redis bounded cache progress sync
│   │       ├── customer-workers/          # Dynamic customer dispatch workers API
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
│   │   ├── layout/                          # Header, breadcrumbs, sidebar subpage tree, HubSubnav, AllPagesNav
│   │   └── dashboard/                       # Hero command center, rolling ticker, capsules
│   ├── data/
│   │   ├── json/                          # 28 production JSON datasets (~11,800+ assets, 182k lines)
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
│   └── __tests__/                         # Vitest test suite (58 test files, 472 unit/integration tests)
├── public/
│   ├── diagrams/                          # 42 Whiteboard Architecture Blueprints (.webp, .avif, .jpg)
│   └── cheatsheets/pdf/                   # 7 Master Vector PDFs & printable incident runbooks
└── docs/                                  # Architectural deep-dives, triage guides, and blueprints
```

---

## 2. Complete Data File Inventory (All 28 JSON Files)

| File | Export | Type | Count | Highlights |
|------|--------|------|-------|------------|
| `data_concepts.json` | `conceptsDb` | `Concept[]` | **704** | Merged modern lakehouse concepts with 4-tier difficulty and keyPoints. |
| `questions.json` | `questionsDb` | `Question[]` | **3,414** | Core cloud platform and Fabric architect scenarios. |
| `data_de.json` | `questionsDeDb` | `Question[]` | **3,615** | General data engineering, real-world production drills. |
| `data_architecture.json` | `architectureData` | `ArchitectureQuestion[]` | **3,214** | End-to-end system design and production troubleshooting. |
| `company_profiles.json` | `companyProfiles` | `CompanyProfile[]` | **156** | Tier-1 GCC hiring criteria, tech stacks, and rounds. |
| `databricks_100.json` | `databricks100Db` | `DatabricksConcept[]` | **100** | 100-day progressive Databricks mastery challenge with code. |
| `databricks_cheatsheets.json` | `databricksCheatsheets` | `CheatSheetSuite[]` | **7 suites** | 7 curated coding suites + 7 master PDF download references. |
| `data_pyspark.json` | `pysparkData` | `CodeSheetItem[]` | **51** | Windowing, AQE, broadcast joins, Delta optimizations. |
| `data_sparksql.json` | `sparksqlData` | `CodeSheetItem[]` | **50** | Catalyst plans, shuffle partitioning, CBO tuning. |
| `data_python.json` | `pythonData` | `CodeSheetItem[]` | **42** | Asyncio, generators, memory management, GIL, Arrow/Polars. |
| `data_mssql.json` | `mssqlData` | `CodeSheetItem[]` | **35** | Query store, index fragmentation, execution plans. |
| `data_paths.json` | `learningPathsDb` | `LearningPath[]` | **12** | Structured career learning journeys. |
| `data_cheatsheet.json` | `cheatsheetData` | `CheatSheetCard[]` | **76** | High-density cheatsheet reference cards. |
| `data_personalised.json` | `personalisedData` | `PersonalisedQuestion[]` | **50** | Targeted scenario-based interview drills. |
| `questions_unified_cleaned.json` | `questionsUnified` | `Question[]` | **3,088** | Cleaned and deduplicated core interview question bank. |
| `modern_blueprints.json` | `modernBlueprints` | `BlueprintItem[]` | **18** | Modern lakehouse architecture blueprints. |
| `modern_badges.json` | `modernBadges` | `BadgeItem[]` | **10** | Certification and skill mastery badges. |
| `modern_concepts.json` | `modernConcepts` | `ModernConcept[]` | **32** | Cutting-edge cloud data platform concepts (v1.8 expanded). |
| `modern_stack.json` | `modernStack` | `StackItem[]` | **20** | Modern data stack component overviews. |
| `modern_subdomains.json` | `modernSubdomains` | `SubdomainItem[]` | **14** | Subdomain taxonomy mappings. |
| `modern_cost_playbooks.json` | `costPlaybooks` | `CostPlaybook[]` | **15** | Cloud Lakehouse FinOps & compute cost reduction playbooks. |
| `modern_code_matrix.json` | `codeMatrix` | `CodeMatrixItem[]` | **15** | Comparative polyglot code matrix across 7 engines. |
| `extreme_architect_questions_block1..5.json` | `extremeArchBlock1..5` | `ArchitectureQuestion[]` | **125** | 5 blocks of 25 extreme edge-case architect scenarios. |
| `search_catalog.json` | `searchCatalog` | `object` | Build-time | Compact indexed catalog for zero-OOM BM25F edge search. |

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
| `powerbi-dax-engine-context` | Power BI DAX Engine Mechanics & Context Transition | Fabric & Power BI |
| `fabric-onelake-direct-lake-architecture` | Microsoft Fabric OneLake Shortcuts & Direct Lake Mode | Fabric & Power BI |
| `apache-airflow-distributed-architecture` | Apache Airflow Distributed Production Architecture | Data Pipelines & Ingestion |
| `dbt-analytics-engineering-dag` | dbt (Data Build Tool) Modern Analytics Engineering DAG | Data Pipelines & Ingestion |
| `adf-hybrid-integration-runtime` | Azure Data Factory Enterprise Hybrid Ingestion Architecture | Data Pipelines & Ingestion |
| `kafka-event-streaming-pipeline` | Real-Time Event Streaming & Kafka Architecture | Data Pipelines & Ingestion |
| `cdc-debezium-lakehouse-pipeline` | Real-Time Change Data Capture (CDC) Architecture | Data Pipelines & Ingestion |
| `databricks-medallion-pipeline` | Databricks Medallion Lakehouse Architecture | Data Pipelines & Ingestion |
| `delta-live-tables-pipeline` | Delta Live Tables (DLT) Pipeline Architecture | Data Pipelines & Ingestion |
| `databricks-dabs-devops-pipeline` | Databricks Asset Bundles (DABs) & Serverless CI/CD Architecture | Data Pipelines & Ingestion |
| `databricks-platform-master` | Databricks Unified Data Intelligence Platform | Platform Landscape |
| `rag-vector-search-data-pipeline` | Enterprise RAG & Vector Data Architecture | Platform Landscape |
| `enterprise-edge-client-architecture` | Enterprise Edge Architecture: Data, Edge & Client Flow | Platform Landscape |
| `distributed-systems-resilience-architecture` | Distributed Systems Design: High-Throughput & Resilient Architecture | Platform Landscape |
| `lakehouse-finops-cost-optimization` | Enterprise Lakehouse FinOps & Cloud Cost Optimization | Platform Landscape |
| `unity-catalog-governance` | Unity Catalog Unified Governance & 3-Level Namespace | Governance & Security |
| `purview-governance-catalog` | Microsoft Purview Enterprise Governance Architecture | Governance & Security |
| `delta-lake-under-the-hood` | How Delta Lake Works Under the Hood | Storage Engine |
| `apache-iceberg-open-table-format` | Apache Iceberg Open Table Format Mechanics | Storage Engine |
| `open-table-formats-lakehouse` | Open Table Formats Blueprint: Lakehouse Storage Engines | Storage Engine |
| `open-file-formats-storage` | Open File Formats Blueprint: Physical Storage Engines | Storage Engine |
| `databricks-optimization-techniques-architecture` | 6 Delta Lake Optimization Techniques: Lakehouse Performance & Storage Hygiene | Storage Engine |
| `spark-savemode-architecture` | Apache Spark SaveMode Handling & Storage Execution Architecture | Storage Engine |
| `delta-vs-iceberg-architecture` | Delta Lake vs. Apache Iceberg Storage & Metadata Architecture | Storage Engine |
| `lakehouse-acid-concurrency` | Lakehouse ACID Concurrency & Write Conflict Resolution Matrix | Storage Engine |
| `spark-catalyst-photon-engine` | Databricks Compute: Catalyst Optimizer, AQE & Photon | Compute & Optimization |
| `spark-shuffle-memory-execution` | Apache Spark Memory Architecture & Shuffle Mechanics | Compute & Optimization |
| `sql-server-query-engine-optimization` | SQL Server & Relational Query Engine Architecture | Compute & Optimization |
| `python-arrow-polars-architecture` | Modern Python Data Architecture: Apache Arrow, Polars & Zero-Copy IPC | Compute & Optimization |
| `spark-data-skew-aqe-optimization` | Apache Spark Data Skew Remediation & AQE Optimization | Compute & Optimization |
| `spark-join-decision-tree` | Apache Spark Join Strategy Selection Decision Tree | Compute & Optimization |
| `spark-aqe-dynamic-optimization` | Apache Spark Adaptive Query Execution (AQE) Architecture | Compute & Optimization |
| `spark-memory-management-spill` | Apache Spark Memory Management & Shuffle Spilling Mechanics | Compute & Optimization |
| `spark-streaming-state-store` | Spark Structured Streaming State Store & Watermarking Mechanics | Compute & Optimization |
| `photon-engine-vs-jvm` | Databricks Photon Native C++ Engine vs. Classic Spark JVM | Compute & Optimization |
| `spark-broadcast-accumulators` | Apache Spark Broadcast Variables vs. Accumulators Architecture | Compute & Optimization |
| `kimball-dimensional-star-schema` | Kimball Dimensional Modeling & Enterprise Star Schema | Data Modeling & Architecture |
| `data-vault-enterprise-architecture` | Data Vault 2.0 Architecture & Lakehouse Modeling | Data Modeling & Architecture |
| `data-mesh-enterprise-architecture` | Enterprise Data Mesh: Decentralized Domains & Data Products | Data Modeling & Architecture |
| `scd-types-lakehouse` | Slowly Changing Dimensions (SCD Types 1, 2, 3, 4, 6) in Modern Lakehouses | Data Modeling & Architecture |

---

## 4. Standard Dev Commands, Testing & Cloudflare Deployment

```bash
# 1. Run full test suite (must ALWAYS pass all 58 test files and 472 tests)
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
Combines 704 concepts and the 14-pillar mind map into a single roof with a 3-way view switcher:
- **Glossary & Cards**: Virtualized searchable concept cards with 4 difficulty levels.
- **Multi-Level Mind Map**: 4-depth dynamic stretching mind map engine covering 14 pillars.
- **Flashcards Mode**: Interactive spaced-repetition card flip for active recall.

### 2. Dedicated Databricks Coding Hub (`/code-practice/databricks`)
- 148+ operations categorized across 7 suites (Architecture, PySpark, Spark SQL, Python SDK, Memory Triage, Streaming).
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
- Filters 3,214 architecture scenarios across 6 domain groups (Compute, Storage, Ingestion, FinOps, Governance, Modeling) with real-time live counts and URL query parameter sync.

### 5. Google-Grade BM25F Search Engine (`src/lib/search-engine.ts`)
- Zero-OOM memory-optimized search catalog executing on Cloudflare Workers edge.
- Field-weighted BM25F scoring (Title $\times 3$, Subtitle $\times 2$, Content $\times 1$) with typo tolerance and keyboard command palette (`⌘K` / `Ctrl+K`) indexing 11,800+ assets.

### 6. Target Company Intel Workbench (`/company-research`)
- Space-efficient, dense layout following `nextjs-compact-ui` principles.
- 3 interactive view modes:
  - **Compact Grid**: Cards reduced in height by 50%+ with dual USD/INR salary benchmark strips, archetype badges, and in-card interactive accordion tabs (`Prompts`, `Interview Focus`, `Scale Challenge`).
  - **Master-Detail Split Workbench**: Left directory rail with company logos, tier dots, and quick salary indicators + sticky right full dossier pane.
  - **Dense Comparison Table**: Bloomberg-style matrix with sortable columns (name, tier, salary) and 1-click modal dossier action.
- Real interview loops with 1-click prompt copying and direct simulator links.

### 7. Progressive Batch Rendering & Zero-Blank-Space Scrolling
- **Never use absolute-positioned window virtualization** (`useWindowVirtualizer` with `position: absolute; translateY`) for content feeds where items dynamically expand, contain code blocks, or sit below variable-height headers/filters.
- **Pattern**: Progressive batch rendering with standard document flow:
  - Initialize with `visibleCount = 40`.
  - Connect an invisible bottom sentinel via `IntersectionObserver` with `rootMargin: "600px"` to seamlessly load the next batch before the user reaches the bottom.
  - Provide fallback "Load More (+40)" and "Show All ({total})" buttons.
  - Guarantees zero blank gaps, zero layout shift on card expansion, and native browser Ctrl+F search.

### 8. Stage 1 Default Rule Across All Diagrams & Lifecycles
- All interactive flow diagrams and multi-stage steppers (`InteractiveFlowDiagram`, `OptimizationFlow`, `MasteryRoadmapFlow`, `EnterpriseStackFlow`, `SdlcPipelineFlow`, `PipelineExecutionFlow`, `SystemDesignFlow`, `LakehouseMedallionFlow`, `InterviewDefenseFlow`) **MUST ALWAYS default to Stage 1** (`defaultStageId` set to the first stage ID or `stages[0].id`).

### 9. Always-Visible Horizontal Navigation Bar (`AllPagesNav`)
- Located in `src/components/layout/all-pages-nav.tsx`.
- Houses both the prominent Universal ⌘K Search bar and a responsive, horizontal category bar with dropdown menus exposing all subsections, subpages, live badges, and descriptions for clean 1-click navigation.

### 10. Global Scrolling & Layout Resilience
- `html` and `body` styles: `scroll-behavior: smooth; overflow-x: hidden; overscroll-behavior-y: auto;`
- Preserves native touch/trackpad inertia, rubber-banding, and scroll anchoring across macOS, iOS, Android, and Windows.

### 11. Dynamic Ultrawide & High-Resolution Display Scaling
- Never clamp content wrappers to restrictive `max-w-7xl` on large monitors.
- Standard container classes across all layouts and client components:
  `w-full max-w-7xl 2xl:max-w-[1800px] 3xl:max-w-[2200px] 4xl:max-w-none mx-auto px-2 sm:px-4 2xl:px-6`
- Grids expand dynamically to take advantage of wider viewports:
  - 4-item cards (e.g. Mastery Stages): `grid-cols-1 md:grid-cols-2 2xl:grid-cols-4`
  - 2-column code/runbook cards: `grid-cols-1 2xl:grid-cols-2`
  - Concept/Q&A cards: `grid-cols-1 md:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4`
  - Simulators and comparison matrix tables stretch seamlessly without horizontal scrollbars on 2K/4K displays.

### 12. Unified Stages Hub & Consolidated Coding Workbenches
- **Mastery Stages Hub (`/stages`)**: The single authoritative home for all stage frameworks:
  - `mastery`: 4-Stage Architectural Mastery Progression Framework (Foundations → Core DE → Advanced → Staff/Principal Architect).
  - `lakehouse`: 7-Stage Modern Lakehouse & AI Stack Flow canvas.
  - `sdlc`: 6-Stage Enterprise Data Delivery Playbook with 152 controls.
  - `catalyst`: 5-Stage Spark Catalyst Engine & Whole-Stage CodeGen pipeline.
  - `flows`: 8 interactive production flow diagrams gallery.
- **Unified Code Practice Hub (`/code-practice`)**: Combines 326+ operations across 4 tabs:
  - `drills`: Multi-engine interactive drills (PySpark, SQL, T-SQL, Python/Polars).
  - `databricks`: Databricks Coding Hub (148+ operations, cheatsheets, memory triage).
  - `matrix`: Polyglot Engine Translation Matrix (15 operations side-by-side).
  - `runbooks`: 62 Production Python Lakehouse & Architecture Runbooks.
- **Permanent Routing Redirects**:
  - `/blueprints` → `/whiteboards`
  - `/deployments` → `/studio`
  - `/spark-visualizer` → `/visualizer`
  - `/plan` → `/guided-learning?tab=curricula`
  - `/goal` → `/studio`
  - `/learn` → `/guided-learning`
  - `/boost` → `/qa-prep`
  - `/browser` → `/search-topics`

### 13. Universal Typography Engine & Dynamic Font Scaling
- Universal 6-font family selector (`inter`, `jetbrains`, `fira`, `system`, `serif`, `dyslexic`).
- CSS variable multipliers (`--font-scale-multiplier`, `--font-sans`, `--font-mono`) in `globals.css` that propagate size changes to cards, headings, code snippets (`pre`, `code`), and inline tokens.
- Interactive `TextSizeController` with steppers (`[ A− ]` `[ Reset ]` `[ A+ ]`) and keyboard shortcuts (`Alt +` / `Alt -` / `Alt 0`).

### 14. Left Sidebar Dynamic Subpage Tree Navigation
- Accordion chevrons on all parent navigation items allowing direct subpage access without navigating away from current page.
- Top-level 1-click "All Subpages" expand/collapse toggle.
- Visual branch guidelines (`border-l-2 border-blue-500/25`) with active path indicators and live asset badges.

### 15. Spark Catalyst Optimizer & Execution Visualizer
- `/spark-catalyst` and `/visualizer`: Interactive 5-stage Catalyst query planning simulator and AST graph visualizer.
- `/spark-engine`: Physical Spark 4.0 execution simulator, Tungsten memory layout, off-heap buffers, and AQE skew join resolution.
