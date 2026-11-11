# Engineering & Operations Documentation

<p align="center">
  <a href="https://moderndataengineer.uk"><img src="https://img.shields.io/badge/Live_Site-moderndataengineer.uk-blueviolet?style=flat-square" alt="Live Site"></a>
  <a href="development_guide.md"><img src="https://img.shields.io/badge/Guide-Developer_Onboarding-blue?style=flat-square" alt="Developer Guide"></a>
  <a href="roadmap.md"><img src="https://img.shields.io/badge/Roadmap-v2.0_Active-emerald?style=flat-square" alt="v2.0 Roadmap"></a>
  <a href="https://vitest.dev/"><img src="https://img.shields.io/badge/Vitest-58_Suites_%E2%80%A2_472_Tests-green?style=flat-square&logo=vitest" alt="Vitest 58/58"></a>
</p>

> **Developer Quickstart, Architecture Specifications, Test Runbooks & Strategic Roadmap**  
> Operational guidelines for building, testing, optimizing, and deploying the Cloudflare OpenNext application on `moderndataengineer.uk`.

> [!NOTE]
> **Zero-Bundle Enforcement & Quality Gates**: Every code change is verified through strict automated quality gates: 58 Vitest test files (472 tests), content schema validation across 11,261 assets, strict TypeScript typecheck (`tsc --noEmit`), and zero-OOM edge bundle enforcement.

---

## 🛠️ Engineering Directory

| Document | Primary Scope | Operational Focus | Direct Link |
| :--- | :--- | :--- | :--- |
| **Development & Operations Guide** | Project architecture, Server Data Layer, Vitest suite, Cloudflare OpenNext | App Router folder layout, Zero-Bundle Data Mandate, 58-file test suite, deployment lifecycle. | [`development_guide.md`](./development_guide.md) |
| **Platform Engineering Roadmap** | Completed milestones & future architectural expansions | BM25F search, Databricks 148+ operations hub, 7 master PDFs, single-roof concepts & mindmap. | [`roadmap.md`](./roadmap.md) |
| **Workers for Platforms** | Dynamic tenant isolation and customer workers | Edge sandboxing, execution safety, and container isolation. | [`workers-for-platforms.md`](./workers-for-platforms.md) |

---

## ⚡ Fast Developer Cheat Sheet

```bash
# 1. Start local development server
npm run dev

# 2. Run full Vitest automated test suite (58 test files, 472 tests)
npm test

# 3. Validate canonical content schemas (11,261 assets)
npm run content:validate

# 4. Shard catalog and generate MiniSearch inverted index (11,956 items)
npm run content:shard

# 5. Run Next.js production build for Cloudflare OpenNext
npm run build:cf

# 6. Deploy generated R2 artifacts and the OpenNext Worker to Cloudflare
npm run deploy:cf

# 7. Fast-track worker deploy (~35 seconds, skips R2 sync)
npm run deploy:quick
```

---

[← Back to Central Documentation Hub](../README.md)
