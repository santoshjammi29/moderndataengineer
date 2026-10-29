# Engineering & Operations Documentation

> **Developer Quickstart, Architecture Specifications, Test Runbooks & Strategic Roadmap**  
> Operational guidelines for building, testing, optimizing, and deploying the Cloudflare OpenNext application on `moderndataengineer.uk`.

---

## 🛠️ Engineering Directory

| Document | Primary Scope | Operational Focus | Link |
| :--- | :--- | :--- | :--- |
| **Development & Operations Guide** | Project architecture, Server Data Layer, Vitest suite, Cloudflare OpenNext | App Router folder layout, Zero-Bundle Data Mandate, 53-file test suite, deployment lifecycle. | [`development_guide.md`](./development_guide.md) |
| **Platform Engineering Roadmap** | Completed milestones & future architectural expansions | BM25F search, Databricks 148+ operations hub, 7 master PDFs, single-roof concepts & mindmap. | [`roadmap.md`](./roadmap.md) |
| **Workers for Platforms** | Dynamic tenant isolation and customer workers | Edge sandboxing, execution safety, and container isolation. | [`workers-for-platforms.md`](./workers-for-platforms.md) |

---

## ⚡ Fast Developer Cheat Sheet

```bash
# Start local development server
npm run dev

# Run full Vitest automated test suite (53 test files, 424 tests)
npm test

# Run Next.js production build for Cloudflare OpenNext
npm run build:cf

# Fast-track worker deploy (~35 seconds, skips R2 sync)
npm run deploy:quick

# Deploy generated R2 artifacts and the OpenNext Worker to Cloudflare
npm run deploy:cf
```

---

[← Back to Central Documentation Hub](../README.md)
