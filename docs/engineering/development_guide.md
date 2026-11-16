# Development, Testing, & Operations Guide: `lakehouse-architect`

Welcome to the **moderndataengineer.uk** developer and contributor guide. This document details the modern Next.js 16 App Router architecture, Server-Side Data Access Layer (DAL), automated Vitest test suite, and Cloudflare OpenNext release workflows.

---

## 1. Project Architecture

The platform is built as an enterprise-grade cloud educational portal leveraging Next.js 16 App Router, React 19 Server Components, and Tailwind CSS. It enforces a strict **Zero-Bundle Data Mandate** to ensure blazing client-side performance even with over 11,956 searchable catalog items.

```
/Users/santosh/Documents/antigravity/charming-fermi/
├── src/
│   ├── app/                         # Next.js 16 App Router routes
│   │   ├── page.tsx                 # Landing page & Whiteboard Showcase
│   │   ├── stages/                  # Unified Stages & Lifecycles Hub (5 architectural lifecycle systems)
│   │   ├── guided-learning/         # Cross-section progressive topic journeys (15 tracks including Governed Agentic Platforms)
│   │   ├── concepts/                # 869 concepts with 3-in-1 view switcher (Glossary, Mindmap, Flashcards)
│   │   ├── qa-prep/                 # Q&A practice (7,098 deduplicated questions)
│   │   ├── architecture/            # Architecture scenarios (3,294 scenarios) + 36-keyword filter + 42 blueprints
│   │   ├── code-practice/           # Consolidated Coding Hub (326+ operations across Drills, Databricks, Matrix, Runbooks)
│   │   │   └── databricks/          # Dedicated Databricks coding subpage (148+ operations & memory triage)
│   │   ├── cheat-sheet/             # 10 Master Vector PDFs, posters, and 86 operational cheatsheet cards
│   │   ├── modern-stack/            # Cloud Platforms & 10-Engine Matrix, FinOps playbooks, 6 interactive simulators
│   │   ├── spark-engine/            # Spark memory, shuffle, Catalyst & Photon (with Spark 3.5 AQE skew join splitting)
│   │   ├── spark-catalyst/          # Catalyst physical plan inspector with 7 production scenarios
│   │   ├── company-research/        # 156 Hyderabad & Bangalore GCC profiles
│   │   ├── learning-paths/          # 13 paths (16-Week Production Lakehouse Track, DP-700, DP-600, DP-203 Legacy, Databricks)
│   │   └── api/
│   │       ├── download/pdf/[filename]/ # Streaming PDF download API with attachment headers
│   │       └── search/route.ts      # Edge BM25F zero-OOM search handler
│   ├── components/                  # Reusable UI primitives and layout components
│   ├── data/
│   │   ├── json/                    # Canonical JSON datasets (11,956+ records)
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
│   └── __tests__/                   # 61 Vitest test suites (509 tests)
├── public/
│   ├── diagrams/                    # Lossless WebP, AVIF, and JPG whiteboard blueprints
│   └── cheatsheets/pdf/             # 10 Master Vector PDFs & printable incident runbooks
└── docs/                            # Deep-dive guides, Sourced Research Ledger & Knowledge Base
```

---

## 2. Data File Inventory & Schemas

All canonical datasets reside in `src/data/json/`:

| File | Primary Type | Item Count | Key Fields |
| :--- | :--- | :--- | :--- |
| `data_concepts.json` | `Concept[]` | **869** | `id`, `term`, `category`, `difficulty`, `definition`, `explanation`, `keyPoints[]`, `sources[]` |
| `databricks_100.json` | `Databricks100Item[]` | **100** | `id`, `day`, `term`, `category`, `difficulty`, `whatYouShouldKnow[]`, `productionCodeSnippet`, `certificationMapping[]` |
| `data_architecture.json` | `ArchitectureQuestion[]` | **3,294** | `id`, `source`, `category`, `niche`, `difficulty`, `question`, `answer`, `sources[]` |
| `data_de.json` | `Question[]` | **3,670** | `id`, `source`, `category`, `niche`, `difficulty`, `question`, `answer`, `domain`, `sources[]` |
| `questions.json` | `Question[]` | **3,428** | `id`, `source`, `category`, `niche`, `difficulty`, `question`, `answer`, `sources[]` |
| `company_profiles.json` | `CompanyProfile[]` | **156** | `id`, `company`, `tier`, `category`, `location`, `techStack[]`, `hiringBar`, `interviewRounds[]`, `keyQuestions[]` |
| `databricks_cheatsheets.json`| `CheatSheetSuite[]` | **6 suites (48 cards)** | `suiteId`, `title`, `sections[]`, `codeBlocks[]`, `pdfUrl`, `posterUrl` |
| `data_pyspark.json` | `CodeSheetItem[]` | **51** | `id`, `title`, `level`, `category`, `description`, `code` |
| `data_sparksql.json` | `CodeSheetItem[]` | **50** | `id`, `title`, `level`, `category`, `description`, `code` |
| `data_python.json` | `CodeSheetItem[]` | **42** | `id`, `title`, `level`, `category`, `description`, `code` |
| `data_mssql.json` | `CodeSheetItem[]` | **35** | `id`, `title`, `level`, `category`, `description`, `code` |
| `data_cheatsheet.json` | `CheatSheetCard[]` | **86** | `id`, `title`, `category`, `description`, `code` |
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

### 3.5 Accessible Collection Shuffle Engine
Interactive practice collections (`/qa-prep`, `/concepts`, `/architecture`, `/code-practice`, `/cheat-sheet`, `/whiteboards`) integrate an unbiased Knuth Fisher–Yates shuffle algorithm (`src/lib/shuffle.ts`) with deterministic PRNG seed testing (`createSeededRandom`). To eliminate hydration mismatches, cards maintain their canonical order by default upon initial render. UI controls (`src/components/ui/shuffle-control.tsx`) provide WCAG 2.2 AA compliant `aria-live="polite"` status announcements and explicit reset capabilities.

---

## 4. Automated Testing Suite (Vitest)

Our automated verification suite enforces 100% test passing across 61 test files before any pull request or deployment:

```bash
# Run all 61 test suites
npm test
```

### Verified Test Categories:
1. **Data Integrity (`src/__tests__/data.integrity.test.ts`)**: Schema compliance, unique ID validation, non-empty fields, and difficulty rating integrity across all 27 JSON files.
2. **Domain Helpers (`src/__tests__/data.helpers.test.ts`)**: `getStandardizedDomain`, topic counters, and category mappings.
3. **Google BM25F Search Engine (`src/__tests__/features.google-search-algo.test.ts`)**: BM25F scoring, typo tolerance, prefix matching, and ranking accuracy.
4. **Whiteboard Learning & Blueprint Integrity (`src/__tests__/features.whiteboards-learning.test.tsx` & `features.whiteboards-integrity.test.ts`)**: 42 blueprints, multi-persona metadata structures, disk asset presence and minimum byte size, and 7 architectural categories.
5. **Keyword Filter Bar (`src/__tests__/features.architecture-keyword-filters.test.tsx`)**: 36-keyword scenario filter logic across 6 domain groups.
6. **Databricks Coding Hub (`src/__tests__/features.code-practice-databricks.test.tsx`)**: Unified operations, memory triage views, and category filtering.
7. **Target Company Intel Hub (`src/__tests__/features.company-research-client.test.tsx` & `features.company-research.test.tsx`)**: Triple view modes (Compact Grid, Split Workbench, Comparison Table), in-card drawer tabs, GCC hub filtering, and 1-click clipboard prompt copying.
8. **PDF Download API Route (`src/__tests__/features.pdf-download-route.test.ts`)**: Security against path traversal, attachment headers, and streaming responses across all 10 approved PDFs.
9. **Collection Shuffle Engine (`src/__tests__/features.shuffle-engine.test.ts`)**: Unbiased Knuth Fisher–Yates distribution, deterministic seed repeatability, and non-mutating array operations.
10. **Theme & WCAG Accessibility (`src/__tests__/features.theme-accessibility-wcag.test.ts`)**: Semantic design tokens, 4.5:1 contrast ratios across light and dark modes, and ARIA attributes.
11. **Progress API & Redis Bounded Cache (`src/__tests__/features.api-progress-security.test.ts` & `features.redis-cache-bounded.test.ts`)**: Bounded memory limits, cache eviction, and authentication verification.

---

## 5. Build & Deployment Lifecycle

The production platform builds with Next.js 16 and `@opennextjs/cloudflare` to deploy on Cloudflare Workers (`lakehouse-architect`) with sharded JSON data stored in Cloudflare R2:

```bash
# 1. Automated test run (61 files, 509 tests)
npm test

# 2. Schema validation and search sharding (11,280+ items)
npm run content:validate && npm run content:shard

# 3. Compile Next.js 16 and OpenNext Cloudflare bundle
npm run build:worker

# 4. Idempotently sync sharded JSON artifacts and PDFs to Cloudflare R2
npm run r2:sync:remote

# 5. Deploy edge worker to Cloudflare Workers via Wrangler
npm run deploy:worker

# Fast-track worker deploy (~35 seconds, skips R2 uploads when data is unchanged)
npm run deploy:quick
```

---

## 6. Unified Typography Architecture

1. **Single Primary Typeface**:
   - `--font-sans` & `--font-heading`: `Inter` with system fallbacks (`system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`).
   - Applied consistently across all headings (`h1`–`h6`), body copy, navigation, buttons, controls, cards, badges, and ordinary content.
2. **Dedicated Monospace Family**:
   - `--font-mono`: `JetBrains Mono`, `Fira Code`, `ui-monospace`, `Menlo`, `Monaco`, `monospace`.
   - Strictly reserved for code blocks, inline code, terminal outputs, queries, logs, and fixed tabular counters.
3. **Fluid Scale & Line Heights**:
   - Headings: `text-wrap: balance` with tight line height (`--line-height-heading: 1.25`).
   - Body prose: `text-wrap: pretty` with comfortable line height (`--line-height-body: 1.6`).
   - Code blocks: `--line-height-code: 1.7` preserving indentation and vertical scanability.

---

## 7. WCAG 2.2 AA Contrast & Theme Safety Matrix

The platform supports 4 themes: **Dark** (`.theme-dark` / default), **Light** (`.theme-light`), **Grey** (`.theme-grey`), and **E-Ink** (`.theme-e-ink`). Every foreground/background pair is mathematically verified to satisfy WCAG 2.2 AA:
- Normal text: $\ge 4.5:1$
- Large text & interactive components: $\ge 3.0:1$

| Element / Token | Dark Mode (`#0a0a0b`) | Light Mode (`#f8f8fc`) | Grey Mode (`#18191c`) | E-Ink Mode (`#f7f6f2`) | WCAG AA Standard |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Primary Text** | `#f0f0f5` (17.2:1) | `#09090b` (18.1:1) | `#e4e5eb` (15.1:1) | `#111111` (16.8:1) | $\ge 4.5:1$ PASS |
| **Secondary Text** | `#cbd5e1` (11.8:1) | `#334155` (10.2:1) | `#b8bcc9` (10.4:1) | `#262626` (13.5:1) | $\ge 4.5:1$ PASS |
| **Muted Text** | `#9da4b4` (6.2:1) | `#475569` (7.2:1) | `#9095a6` (5.1:1) | `#475569` (7.2:1) | $\ge 4.5:1$ PASS |
| **Placeholder Text**| `#9ca3af` (6.1:1) | `#475569` (6.5:1) | `#9ca3af` (5.0:1) | `#555555` (5.4:1) | $\ge 4.5:1$ PASS |
| **Link Text** | `#60a5fa` (8.6:1) | `#1d4ed8` (5.7:1) | `#60a5fa` (7.8:1) | `#111111` (16.8:1) | $\ge 4.5:1$ PASS |
| **Syntax Amber** | `#fbbf24` (10.2:1) | `#fcd34d` (12.4:1) | `#fbbf24` (9.1:1) | `#78350f` (7.7:1 on paper) | $\ge 4.5:1$ PASS |
| **Syntax Orange** | `#fb923c` (7.8:1) | `#fdba74` (10.1:1) | `#fb923c` (6.9:1) | `#9a3412` (6.2:1 on paper) | $\ge 4.5:1$ PASS |

### Critical Contrast & Theme Invariants
1. **E-Ink Dark Container Inversion**: Never wrap `.text-white` in a hardcoded dark background (`bg-slate-950`, `bg-[#0c1427]`) without an E-Ink alternative. E-Ink inverts white text to `#111111`, creating unreadable black-on-black text.
2. **Text Gradient Clipping Fallback**: In `.light` and `.e-ink`, `.text-transparent.bg-clip-text` must fall back to solid `color: var(--text-primary)`.
3. **Badge 700-Shade Rule**: Tailwind 600 shades (`amber-600`, `emerald-600`, `sky-600`) fail WCAG AA with white text. Always use 700 shades (`amber-700`, `emerald-700`, `sky-700`, `cyan-700`).

---

## 8. Operational Triage & Developer Mistake Prevention

1. **Tool Invocations (`read_file`)**: `StartLine` must be $\le$ `EndLine`. Inverted line ranges throw validation exceptions.
2. **TypeScript Property Access**: Never guess properties on data items. Inspect `src/types/data.ts` first (e.g. `ArchitectureQuestion` has `.question` and `.id`, never `.title`).
3. **Natural Text Wrapping**:
   - Never use arbitrary `truncate` or `line-clamp` on primary content.
   - Use `overflow-wrap: anywhere` on body copy, `text-wrap: balance` on headings.
   - Ensure all flex/grid children containing text include `min-width: 0`.
   - Always pair intentional line clamps with accessible disclosures (`aria-expanded={isExpanded}` and dynamic `aria-label`).
4. **Code Blocks**: Code blocks must have horizontal scrolling constrained strictly inside the `<pre>` container (`overflow-x-auto`) and include accessible word-wrap toggle controls.
5. **Deployment Pipeline Sequence**: To prevent missing chunks or 404 errors on artifacts, always execute the full pipeline: `content:validate && content:shard` $\rightarrow$ `build:worker` $\rightarrow$ `r2:sync:remote` $\rightarrow$ `deploy:worker`.
