---
name: moderndataengineer-dev
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
```

---

## 2. Key Commands

```bash
# Development server (port 3000)
npm run dev

# Run all 58 test files (472 unit & integration tests)
npm test

# Run tests in watch mode during development
npx vitest

# Production build (Typecheck + Next.js build + OpenNext bundle)
npm run build

# Cloudflare OpenNext preview build
npm run preview

# Deploy to Cloudflare Workers via Wrangler
npm run deploy

# Validate search catalog integrity
npx tsx scripts/validate-catalog.ts

# Reshard & optimize search index
npx tsx scripts/generate-search-shards.ts
```

---

## 3. Invariants & Rules

1. **Strict Server/Client Boundary**: Every page has `page.tsx` (Server Component for ISR/metadata) + `*-client.tsx` (Client Component for interactivity).
2. **Never bundle giant JSON directly into client chunks**: Load datasets via `src/lib/dal.ts` on server, or stream from R2 via `/api/artifacts/[shard]` on client.
3. **Responsive Display Scaling**: Use `w-full max-w-7xl 2xl:max-w-[1800px] 3xl:max-w-[2200px] 4xl:max-w-none mx-auto` to scale beautifully from laptops to 4K and 3440px ultrawide displays.
4. **Preserve Tests**: Always run `npm test` after modifying components, types, or data access code.
