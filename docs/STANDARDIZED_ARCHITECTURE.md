# Standardized Architecture & Developer Guide

<p align="center">
  <a href="https://moderndataengineer.uk"><img src="https://img.shields.io/badge/Production-moderndataengineer.uk-blueviolet?style=flat-square" alt="Live Site"></a>
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16_App_Router-black?style=flat-square&logo=next.js" alt="Next.js 16"></a>
  <a href="https://vitest.dev/"><img src="https://img.shields.io/badge/Vitest-58_Suites_%E2%80%A2_472_Tests-green?style=flat-square&logo=vitest" alt="Vitest 58/58"></a>
  <a href="content-expansion-plan.md"><img src="https://img.shields.io/badge/Research-21_Authoritative_Sources-emerald?style=flat-square" alt="21 Research Sources"></a>
</p>

> **Architectural Invariants, Server/Client Boundaries & Zero-Bundle Mandates**  
> Operational and architectural specifications for `moderndataengineer.uk`, deployed on Cloudflare OpenNext / Workers with R2 storage synchronization.

> [!NOTE]
> **Production Edge Standards**: Built with Next.js 16 App Router and React 19 Server Components. All 11,956+ searchable catalog records are served with **0 KB raw JSON in client bundles**, backed by React `cache()` Data Access Layers (DAL) and persistent browser IndexedDB caching.

---

## 1. Overview & Core Philosophy

**Modern Data Engineer & Lakehouse Architect** (`moderndataengineer.uk`) is engineered for high-performance, real-time global access by thousands of concurrent engineers, architects, and interview candidates, deployed on **Cloudflare OpenNext / Workers** with R2 artifact synchronization.

To guarantee zero latency worldwide and seamless future maintenance, the codebase adheres to six architectural invariants:

1. **Strict Server/Client Boundary**: Every page uses a Server Component entry point (`page.tsx`) for metadata, SEO, and edge caching (ISR), paired with an interactive Client Component (`*-client.tsx`).
2. **Central Source of Truth**: All platform constants, brand metadata, caching rules, and UI presets reside in `src/config/platform.config.ts`.
3. **Data Access Layer (DAL)**: All datasets are queried through `src/lib/dal.ts` with React `cache()` request deduplication.
4. **Zero-Lag Continuous Reading Mode**: All card-centric views support instant "Read All" (`Shift + E`) with $O(1)$ inverse Set evaluation.
5. **Zero-Bundle Edge Mandate**: Zero raw JSON data bundled into client JavaScript; massive datasets are served via streaming R2 shards and cached in persistent IndexedDB.
6. **Dynamic Display Scaling**: Utilize the full width across 1080p, 1440p, 2K, 4K, and 3440px ultrawide displays (`w-full max-w-7xl 2xl:max-w-[1800px] 3xl:max-w-[2200px] 4xl:max-w-none mx-auto`), scaling cards and code blocks into multi-column responsive grids.

---

## 2. Directory Layout & Roles

```text
src/
├── app/                           # App Router routes (Edge / OpenNext)
│   ├── stages/                    # Unified Stages Hub: Mastery, Lakehouse, SDLC, Catalyst, Flows
│   │   ├── page.tsx               # Server Component (ISR, metadata, Suspense)
│   │   └── stages-client.tsx      # Client Component (5 lifecycle tabs)
│   ├── qa-prep/
│   │   ├── page.tsx               # Server Component (ISR, metadata, JSON-LD, Suspense)
│   │   └── qa-prep-client.tsx     # Client Component (Virtualizer, Read All, filters)
│   ├── concepts/
│   │   ├── page.tsx
│   │   └── concepts-client.tsx    # 3-in-1 single-roof view switcher (Glossary, Mindmap, Flashcards)
│   ├── architecture/
│   │   ├── page.tsx
│   │   └── architecture-client.tsx # 36-keyword filter deck & 42 whiteboard blueprints
│   ├── code-practice/             # Unified Code Practice Hub (Drills, Databricks, Matrix, Runbooks)
│   │   ├── databricks/            # Dedicated Databricks Hub (148+ operations & memory triage)
│   │   └── code-practice-client.tsx
│   ├── cheat-sheet/
│   │   └── cheat-sheet-client.tsx # 7 Master Vector PDFs & PDF Downloads Hub
│   ├── modern-stack/
│   │   └── modern-stack-client.tsx # Cloud Platforms & Engine Matrix (10 engines, FinOps, 6 simulators)
│   ├── spark-engine/
│   │   └── spark-engine-client.tsx # Spark memory pools, shuffle, and AQE skew join splitting flow
│   ├── spark-catalyst/
│   │   └── spark-catalyst-client.tsx # Catalyst 5-stage plan inspector with 7 production scenarios
│   ├── guided-learning/
│   │   └── guided-learning-client.tsx # 15 progressive tracks including Governed Agentic Data Platforms
│   ├── plan/                      # Permanent 301 edge redirect to /guided-learning?tab=curricula
│   ├── goal/                      # Permanent 301 edge redirect to /studio
│   ├── learn/                     # Permanent 301 edge redirect to /guided-learning
│   ├── boost/                     # Permanent 301 edge redirect to /qa-prep
│   ├── browser/                   # Permanent 301 edge redirect to /search-topics
│   └── api/
│       ├── download/pdf/[filename]/ # Streaming PDF download API with attachment headers
│       └── search/                # BM25F zero-OOM search route
├── config/
│   └── platform.config.ts         # Single Source of Truth for brand, caching, & hubs
├── types/
│   ├── index.ts                   # Central barrel export
│   ├── data.ts                    # Core platform domain entities
│   └── progress.ts                # Study tracker state models
├── data/
│   ├── index.ts                   # Strong-typed dataset access
│   ├── json/                      # Raw JSON knowledge bases; exact generated counts are in `src/data/content-counts.json`
│   ├── diagrams.ts                # 42 Architect-grade blueprints (5 role perspectives, incident runbooks)
│   ├── navigation-data.ts         # Navigation items & hierarchies
│   └── guided-learning-topics.ts  # Curriculum topics & milestones
├── lib/
│   ├── dal.ts                     # Server-side Data Access Layer (React cache())
│   ├── search-engine.ts           # Google-grade BM25F search engine
│   ├── redis.ts                   # Bounded LRU cache
│   ├── seo.ts                     # Schema.org & OpenGraph generators
│   └── utils.ts                   # Utility functions & class merger
└── components/
    ├── layout/                    # Header, Footer, Subnav, Navigation
    ├── ui/                        # Reusable glassmorphic cards, accordions, badges
    ├── cheatsheet/                # PDF Downloads Hub & interactive card decks
    └── architecture/              # Lightbox, diagrams gallery, keyword filter bar
```

---

## 3. The Standard App Route Pattern

When creating a new route or modifying an existing one, always follow this standard 2-file pattern:

### 1. `src/app/[route]/page.tsx` (Server Component)
```tsx
import { Suspense } from "react";
import type { Metadata } from "next";
import { MyRouteClient } from "./my-route-client";
import { buildPageMetadata, generateCourseSchema } from "@/lib/seo";

// 1-Hour Incremental Static Regeneration at Edge CDN
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Feature Title",
    description: "Feature description for Google & Twitter cards.",
    path: "/my-route",
    keywords: ["Relevant", "Keywords"],
  });
}

export default async function MyRoutePage() {
  // 1. Fetch server data using DAL (deduplicated by React cache())
  const data = await getMyDataDAL();

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <MyRouteClient initialData={data} />
    </Suspense>
  );
}
```

### 2. `src/app/[route]/my-route-client.tsx` (Client Component)
```tsx
"use client";

import React, { useState, useCallback, useEffect } from "react";
// Import interactive state, TanStack virtualizer, or Read All mode handlers
```

---

## 4. How to Add or Modify Content

### Adding a New Architecture Whiteboard Diagram
1. Add the SVG or WebP diagram file to `public/diagrams/<id>.webp`.
2. Open `src/data/diagrams.ts` and add a new entry to `architectureDiagrams` with `id`, `title`, `category`, `image`, and `keyPoints`.
3. The diagram will automatically render in the Whiteboard Gallery (`/architecture?tab=diagrams`), Guided Learning lightboxes, and SEO schemas.

### Adding New Q&A or Concept Entries
1. Add structured entries to `src/data/json/questions.json` or `src/data/json/data_concepts.json`.
2. The DAL (`src/lib/dal.ts`) automatically validates and indexes the new items during build time and ISR revalidation.

---

## 5. Global Production Speed Architecture

- **Next.js 16 Static Regeneration**: All 25 routes pre-compile into static HTML/JSON with a 1-hour ISR revalidation window (`revalidate = 3600`).
- **Edge CDN Optimization**:
  - `Cache-Control: public, max-age=31536000, immutable` for static and hashed bundles.
  - `Cache-Control: public, max-age=31536000, stale-while-revalidate=86400, immutable` for diagrams and icons.
  - `compress: true` for Brotli/Gzip wire transfer compression.
  - Image optimization via modern AVIF/WebP formats with 1-year CDN TTL.
- **Zero-Stutter Virtualization**: TanStack virtualizer combined with $O(1)$ Read All lookups guarantees 60 FPS scrolling across 6,500+ items.
