# Standardized Architecture & Developer Guide

## 1. Overview & Core Philosophy

**Modern Data Engineer & Lakehouse Architect** (`moderndataengineer.uk`) is engineered for high-performance, real-time global access by thousands of concurrent engineers, architects, and interview candidates, deployed on **Cloudflare OpenNext / Workers** with R2 artifact synchronization.

To guarantee zero latency worldwide and seamless future maintenance, the codebase adheres to five architectural invariants:

1. **Strict Server/Client Boundary**: Every page uses a Server Component entry point (`page.tsx`) for metadata, SEO, and edge caching (ISR), paired with an interactive Client Component (`*-client.tsx`).
2. **Central Source of Truth**: All platform constants, brand metadata, caching rules, and UI presets reside in `src/config/platform.config.ts`.
3. **Data Access Layer (DAL)**: All datasets are queried through `src/lib/dal.ts` with React `cache()` request deduplication.
4. **Zero-Lag Continuous Reading Mode**: All card-centric views support instant "Read All" (`Shift + E`) with $O(1)$ inverse Set evaluation.
5. **Zero-Bundle Edge Mandate**: Zero raw JSON data bundled into client JavaScript; massive datasets are served via streaming R2 shards and cached in persistent IndexedDB.

---

## 2. Directory Layout & Roles

```text
src/
├── app/                           # App Router routes (Edge / OpenNext)
│   ├── qa-prep/
│   │   ├── page.tsx               # Server Component (ISR, metadata, JSON-LD, Suspense)
│   │   └── qa-prep-client.tsx     # Client Component (Virtualizer, Read All, filters)
│   ├── concepts/
│   │   ├── page.tsx
│   │   └── concepts-client.tsx    # 3-in-1 single-roof view switcher (Glossary, Mindmap, Flashcards)
│   ├── architecture/
│   │   ├── page.tsx
│   │   └── architecture-client.tsx # 36-keyword filter deck & 42 whiteboard blueprints
│   ├── code-practice/
│   │   ├── databricks/            # Unified Databricks hub (148+ operations & memory triage)
│   │   └── code-practice-client.tsx
│   ├── cheat-sheet/
│   │   └── cheat-sheet-client.tsx # 7 Master Vector PDFs & PDF Downloads Hub
│   ├── modern-stack/
│   │   └── modern-stack-client.tsx # 2026 Polyglot matrix & FinOps cost playbooks
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
│   ├── json/                      # Raw JSON knowledge bases (11,500+ assets)
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
