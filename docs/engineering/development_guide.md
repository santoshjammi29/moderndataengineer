# Development, Testing, & Operations Guide: `lakehouse-architect`

Welcome to the **moderndataengineer.uk** developer and contributor guide. This document details the modern Next.js 16 App Router architecture, Server-Side Data Access Layer (DAL), automated Vitest test suite, and Cloudflare OpenNext release workflows.

---

## 1. Project Architecture

The platform is built as an enterprise-grade cloud educational portal leveraging Next.js 16 App Router, React 19 Server Components, and Tailwind CSS. It enforces a strict **Zero-Bundle Data Mandate** to ensure blazing client-side performance even with over 11,500 learning records.

```
/Users/santosh/Documents/antigravity/charming-fermi/
├── src/
│   ├── app/                         # Next.js 16 App Router routes
│   │   ├── page.tsx                 # Landing page & Whiteboard Showcase
│   │   ├── guided-learning/         # Cross-section progressive topic journeys
│   │   ├── concepts/                # 679 concepts with 3-in-1 view switcher (Glossary, Mindmap, Flashcards)
│   │   ├── qa-prep/                 # Q&A practice (3,232 core + 3,615 DE questions)
│   │   ├── architecture/            # Architecture scenarios (3,206 scenarios) + 36-keyword filter + 42 blueprints
│   │   ├── code-practice/           # 178 practical code exercises (PySpark, SQL, Python, MSSQL)
│   │   │   └── databricks/          # Unified Databricks hub (148+ operations & memory triage)
│   │   ├── cheat-sheet/             # 7 Master Vector PDFs, posters, and 124 code cards
│   │   ├── modern-stack/            # 15 Polyglot code matrix items & 15 FinOps cost playbooks
│   │   ├── spark-engine/            # Spark memory, shuffle, Catalyst & Photon
│   │   ├── company-research/        # 156 Hyderabad & Bangalore GCC profiles
│   │   ├── learning-paths/          # Certification paths (DP-600, DP-203, PL-300, Databricks)
│   │   └── api/
│   │       ├── download/pdf/[filename]/ # Streaming PDF download API with attachment headers
│   │       └── search/route.ts      # Edge BM25F zero-OOM search handler
│   ├── components/                  # Reusable UI primitives and layout components
│   ├── data/
│   │   ├── json/                    # Canonical JSON datasets (11,500+ records)
│   │   ├── diagrams.ts              # 42 Whiteboard Architecture Blueprints catalog
│   │   ├── concepts-tree-data.ts    # 14 Core pillars & subtopics for mindmap
│   │   ├── guided-learning-topics.ts# Topic configurations for /guided-learning
│   │   └── index.ts                 # Standardized exports & domain mapping
│   ├── lib/
│   │   ├── dal.ts                   # React 19 cache() Server Data Access Layer
│   │   ├── search-engine.ts         # Google-grade BM25F zero-OOM search engine
│   │   ├── redis.ts                 # Bounded LRU cache
│   │   └── guided-learning.ts       # Cross-section aggregation engine
│   ├── workers/                     # Web Workers for SIMD vector compute
│   └── __tests__/                   # 51 Vitest test suites (410 tests)
├── public/
│   ├── diagrams/                    # Lossless WebP, AVIF, and JPG whiteboard blueprints
│   └── cheatsheets/pdf/             # 7 Master Vector PDFs & printable incident runbooks
└── docs/                            # Deep-dive guides & Knowledge Base
```

---

## 2. Data File Inventory & Schemas

All canonical datasets reside in `src/data/json/`:

| File | Primary Type | Item Count | Key Fields |
| :--- | :--- | :--- | :--- |
| `data_concepts.json` | `Concept[]` | **679** | `id`, `term`, `category`, `difficulty`, `definition`, `explanation`, `keyPoints[]` |
| `databricks_100.json` | `Databricks100Item[]` | **100** | `id`, `day`, `term`, `category`, `difficulty`, `whatYouShouldKnow[]`, `productionCodeSnippet`, `certificationMapping[]` |
| `data_architecture.json` | `ArchitectureQuestion[]` | **3,206** | `id`, `source`, `category`, `niche`, `difficulty`, `question`, `answer` |
| `data_de.json` | `Question[]` | **3,615** | `id`, `source`, `category`, `niche`, `difficulty`, `question`, `answer`, `domain` |
| `questions.json` | `Question[]` | **3,232** | `id`, `source`, `category`, `niche`, `difficulty`, `question`, `answer` |
| `company_profiles.json` | `CompanyProfile[]` | **156** | `id`, `company`, `tier`, `category`, `location`, `techStack[]`, `hiringBar`, `interviewRounds[]`, `keyQuestions[]` |
| `databricks_cheatsheets.json`| `CheatSheetSuite[]` | **6 suites (48 cards)** | `suiteId`, `title`, `sections[]`, `codeBlocks[]`, `pdfUrl`, `posterUrl` |
| `data_pyspark.json` | `CodeSheetItem[]` | **51** | `id`, `title`, `level`, `category`, `description`, `code` |
| `data_sparksql.json` | `CodeSheetItem[]` | **50** | `id`, `title`, `level`, `category`, `description`, `code` |
| `data_python.json` | `CodeSheetItem[]` | **42** | `id`, `title`, `level`, `category`, `description`, `code` |
| `data_mssql.json` | `CodeSheetItem[]` | **35** | `id`, `title`, `level`, `category`, `description`, `code` |
| `data_cheatsheet.json` | `CheatSheetCard[]` | **76** | `id`, `title`, `category`, `description`, `code` |
| `modern_code_matrix.json` | `CodeMatrixItem[]` | **15** | `id`, `operation`, `description`, `engines` (Databricks, Snowflake, BigQuery, Fabric, DuckDB) |
| `modern_cost_playbooks.json` | `CostPlaybook[]` | **15** | `id`, `title`, `platform`, `savingsPotential`, `implementationRisk`, `steps[]` |

### Difficulty Enum:
`'EASY' | 'MEDIUM' | 'HARD' | 'ARCHITECT'`

### Standardized Domain Categories (`getStandardizedDomain`):
- `Compute & Orchestration`: Databricks, Apache Spark, Apache Airflow
- `Data Pipelines & Ingestion`: Azure Data Factory (ADF), dbt, Kafka, CDC
- `Storage Engine & Lakehouse`: OneLake, Delta Lake, Apache Iceberg, Storage
- `Semantic & BI`: Power BI, DAX, Fabric Semantic Models
- `Governance & Quality`: Microsoft Purview, Unity Catalog, Data Quality

---

## 3. High-Performance Engineering Patterns

### 3.1 Zero-Bundle Server Components
Direct client imports of `src/data/json` are prohibited. Instead, page components use Server Components or route handlers via `src/lib/dal.ts` with React 19 `cache()` request deduplication.

### 3.2 Persistent IndexedDB Caching
Heavy dataset shards are loaded once from Cloudflare R2 and persistently cached in IndexedDB via `idb` (`lakehouse-artifacts-cache-v1`), achieving sub-3ms reads with zero repeat network egress.

### 3.3 Google-Grade BM25F Search
Search requests are powered by an in-memory BM25F ranking engine with title ($3\times$), subtitle ($2\times$), and body ($1\times$) weighting, plus typo tolerance and zero-OOM memory optimization on Cloudflare Workers edge.

### 3.4 TanStack Virtual List Rendering
Lists containing hundreds or thousands of cards (`/qa-prep`, `/concepts`, `/architecture`) consume `@tanstack/react-virtual` with dynamic row heights, guaranteeing smooth 60 FPS scrolling and minimal DOM nodes.

---

## 4. Automated Testing Suite (Vitest)

Our automated verification suite enforces 100% test passing across 51 test files before any pull request or deployment:

```bash
# Run all 51 test suites
npm test
```

### Verified Test Categories:
1. **Data Integrity (`src/__tests__/data.integrity.test.ts`)**: Schema compliance, unique ID validation, non-empty fields, and difficulty rating integrity across all 27 JSON files.
2. **Domain Helpers (`src/__tests__/data.helpers.test.ts`)**: `getStandardizedDomain`, topic counters, and category mappings.
3. **Google BM25F Search Engine (`src/__tests__/features.google-search-algo.test.ts`)**: BM25F scoring, typo tolerance, prefix matching, and ranking accuracy.
4. **Whiteboard Learning & Blueprints (`src/__tests__/features.whiteboards-learning.test.tsx`)**: 42 blueprints, multi-persona metadata structures, and 7 architectural categories.
5. **Keyword Filter Bar (`src/__tests__/features.architecture-keyword-filters.test.tsx`)**: 36-keyword scenario filter logic across 6 domain groups.
6. **Databricks Coding Hub (`src/__tests__/features.code-practice-databricks.test.tsx`)**: Unified operations, memory triage views, and category filtering.
7. **PDF Download API Route (`src/__tests__/features.pdf-download-route.test.ts`)**: Security against path traversal, attachment headers, and streaming responses.
8. **Progress API & Redis Bounded Cache (`src/__tests__/features.api-progress-security.test.ts` & `features.redis-cache-bounded.test.ts`)**: Bounded memory limits, cache eviction, and authentication verification.

---

## 5. Build & Deployment Lifecycle

```bash
# 1. Type checking and Cloudflare OpenNext build
npm run build:cf

# 2. Automated test run (51 files, 410 tests)
npm test

# 3. Fast-track worker deploy (~35 seconds, skips R2 uploads)
npm run deploy:quick

# 4. Full production deployment to Cloudflare with idempotent R2 sync
npm run deploy:cf
```
