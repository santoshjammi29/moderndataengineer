---
name: moderndataengineer-dev
description: >
  Modern Data Engineer & Lakehouse Architect (moderndataengineer.uk) development workflow. Activate for editing Next.js 16 App Router routes in src/app/, updating datasets in src/data/json/, running Vitest suites (npm test), content validation (content:validate, content:shard), Cloudflare OpenNext edge deployment (build:worker, deploy:cf), or R2 asset syncing.
metadata:
  short-description: Modern Data Engineer & Lakehouse Architect Next.js development workflow
---

# Modern Data Engineer & Lakehouse Architect Dev Skill (`moderndataengineer.uk`)

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
│   │   ├── concepts/                      # 921 concepts with 3-in-1 view switcher (Glossary, Mindmap, Flashcards)
│   │   ├── mindmap/                       # Standalone route (cross-links to /concepts single-roof view)
│   │   ├── qa-prep/                       # 7,135 Q&A scenarios (questions.json [3,446] + data_de.json [3,689])
│   │   ├── architecture/                  # 3,305 architecture scenarios + 36-keyword filter bar + 52 whiteboard blueprints
│   │   ├── code-practice/                 # Unified Code Practice Hub: 178 Drills, 148+ Databricks Operations & Triage, 15 Polyglot Matrix, 62 Python Runbooks, 20-Page Level 1-4 Technical Manual
│   │   │   └── databricks/                # Dedicated Databricks Coding Hub (148+ operations, memory triage & 20-Page PDF manual download)
│   │   ├── learning-paths/                # 13 structured career paths (Fabric, Databricks, Azure, AWS, GCP, Snowflake, and 16-Week Production Lakehouse Track)
│   │   ├── company-research/              # 156 GCC company profiles (BigTech, FinTech, GCCs)
│   │   ├── modern-stack/                  # Cloud Platforms & Engine Matrix (10 engines, 15 FinOps playbooks, 32 primitives, 6 simulators, AI/RAG)
│   │   ├── spark-engine/                  # Spark engine internals, memory model, and AQE
│   │   │   └── catalyst/                  # Catalyst redirect to /spark-catalyst
│   │   ├── spark-catalyst/                # Spark Catalyst Optimizer & Execution Visualizer
│   │   ├── visualizer/                    # Spark Execution Visualizer
│   │   ├── whiteboards/                   # Dedicated Whiteboard Architecture Mastery Hub (52 hand-drawn blueprints & 10 system flows)
│   │   ├── dataops/                       # DataOps, DABs, and CI/CD automation
│   │   ├── cheat-sheet/                   # Cheatsheets hub (86 cards) + PDF downloads hub (11 compiled master PDFs including 20-page Databricks Manual)
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
│   └── __tests__/                         # Vitest test suite (61 test files, 509 unit/integration tests)
```

---

## 2. Key Commands & Cloudflare Deployment Pipeline

```bash
# Development server (port 3000)
npm run dev

# Run all 61 test files (509 unit & integration tests)
npm test

# Run tests in watch mode during development
npx vitest

# Validate search catalog integrity (11,280+ assets)
npm run content:validate

# Reshard & optimize BM25F search index
npm run content:shard

# Full 4-Step Cloudflare OpenNext Production Deployment
npm run content:validate && npm run content:shard   # 1. Validate & shard
npm run build:worker                                 # 2. OpenNext Cloudflare bundle
npm run r2:sync:remote                               # 3. Idempotent R2 asset sync (106+ objects)
npm run deploy:worker                                # 4. Cloudflare Worker deploy via Wrangler

# Fast-track worker deploy (~35 seconds, skips R2 sync)
npm run deploy:quick
```

---

## 3. Invariants & Rules

1. **Strict Server/Client Boundary**: Every page has `page.tsx` (Server Component for ISR/metadata) + `*-client.tsx` (Client Component for interactivity).
2. **Never bundle giant JSON directly into client chunks**: Load datasets via `src/lib/dal.ts` on server, or stream from R2 via `/api/artifacts/[shard]` on client.
3. **Responsive Display Scaling**: Use `w-full max-w-7xl 2xl:max-w-[1800px] 3xl:max-w-[2200px] 4xl:max-w-none mx-auto` to scale beautifully from laptops to 4K and 3440px ultrawide displays.
4. **Preserve Tests**: Always run `npm test` after modifying components, types, or data access code. All 61 test files (509 tests) must pass with 100% success.

---

## 4. Critical Failure Prevention & Accessibility Rules

### 1. Tool Invocation Invariant (`read_file`)
- When invoking `read_file`, **never invert line ranges** (e.g. `StartLine: 240, EndLine: 100`). `StartLine` must ALWAYS be less than or equal to `EndLine`. Inverted line arguments cause immediate tool validation errors.

### 2. TypeScript Property Verification
- **Never guess or assume property names** on JSON items when writing JSX or component logic.
- Always inspect the canonical definitions in `src/types/data.ts` first:
  - `ArchitectureQuestion` uses `.question` and `.id` (it does **NOT** have a `.title` property!). Setting `aria-label={scenario.title}` causes `TS2339: Property 'title' does not exist on type 'ArchitectureQuestion'`.
  - `Question` uses `.question`, `.answer`, `.category`, `.difficulty`, `.niche`, `.domain`.
  - `Concept` uses `.term`, `.definition`, `.explanation`, `.keyPoints`.
  - `CompanyProfile` uses `.company`, `.tier`, `.hiringBar`, `.techStack`.

### 3. E-Ink Mode Inversion & Dark Container Protection
- In E-Ink mode, `.e-ink .text-white { color: #111111 !important; }` inverts standard white text to near-black.
- **Trap**: Placing `.text-white` inside a hardcoded dark background (`bg-slate-950`, `bg-[#0c1427]`, `from-purple-950`) without theme scoping results in completely unreadable black-on-black text in E-Ink.
- **Rules**:
  1. Never hardcode dark container backgrounds without an explicit light/e-ink alternative (e.g. `bg-surface-raised` or `bg-slate-900 e-ink:bg-transparent`).
  2. The white text protection selector `.e-ink :where(...)` in `globals.css` must include `a[class*="bg-"]` and `[class*="bg-gradient-"]` in addition to `button[class*="bg-"]`, ensuring links styled as solid buttons keep white text against their colored background.
  3. Syntax highlighting tokens on `#eeebe3` paper background in E-Ink must use high-contrast dark ink tokens:
     - Amber: `#78350f` (Contrast: **7.69:1** $\ge 4.5:1$ PASS; standard `#b45309` is only 4.22:1 FAIL).
     - Orange: `#9a3412` (Contrast: **6.17:1** $\ge 4.5:1$ PASS; standard `#c2410c` is only 4.35:1 FAIL).

### 4. Light Mode & E-Ink Text-Transparent Gradient Clipping Fallback
- Applying `.text-transparent.bg-clip-text` with light gradient stops (e.g. `from-sky-400 to-amber-400`) washes out or completely vanishes against white or paper backgrounds.
- Always enforce a solid text fallback in `.light` and `.e-ink`:
  ```css
  .light .text-transparent.bg-clip-text,
  .e-ink .text-transparent.bg-clip-text {
    background: none !important;
    -webkit-text-fill-color: initial !important;
    color: var(--text-primary) !important;
  }
  ```

### 5. Badge & Status Pill Contrast (700 vs 600 Shades)
- White text on Tailwind 600 background shades fails WCAG 2.2 AA contrast:
  - `amber-600` on white text: 3.19:1 (**FAIL**)
  - `emerald-600` on white text: 3.77:1 (**FAIL**)
  - `sky-600` on white text: 4.10:1 (**FAIL**)
  - `cyan-600` on white text: 4.09:1 (**FAIL**)
- **Always use 700 shades** for solid colored badges and active filter pills with white text:
  - `amber-700`: **5.02:1** (PASS)
  - `emerald-700`: **5.48:1** (PASS)
  - `sky-700`: **5.93:1** (PASS)
  - `cyan-700`: **5.56:1** (PASS)

### 6. Natural Text Wrapping & Zero Unrevealed Truncation
- **Never use arbitrary `truncate` or `line-clamp`** on primary content, titles, headings, or definitions.
- Apply `overflow-wrap: anywhere` and `text-wrap: pretty` globally on body prose and descriptions.
- Headings use `text-wrap: balance` and tight line-height (`--line-height-heading: 1.25`).
- Ensure all flex children and grid cells containing text include `min-width: 0` (or `flex-1`) to allow text shrinking without clipping.
- When previews are intentionally clamped on compact cards, **always provide an accessible interactive reveal trigger** with `aria-expanded={isExpanded}` and dynamic, descriptive `aria-label` announcing the item being expanded.
- Code blocks must contain horizontal scrolling strictly within the panel (`overflow-x-auto`) and provide accessible word-wrap toggle controls.

### 7. Cloudflare Deployment Pipeline Sequence
To guarantee zero-downtime, no 404s on sharded JSON, and consistent asset hashes, always follow the complete 4-step sequence:
1. `npm run content:validate && npm run content:shard` — validates 11,280+ records and updates search catalogs.
2. `npm run build:worker` — compiles Next.js 16 and OpenNext Cloudflare Worker bundle.
3. `npm run r2:sync:remote` — synchronizes 106+ JSON artifact shards and PDFs to Cloudflare R2.
4. `npm run deploy:worker` — deploys the edge worker via Wrangler with `--cacheChunkSize 10`.
