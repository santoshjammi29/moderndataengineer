# Central Documentation Hub: `lakehouse-architect`

<p align="center">
  <a href="https://moderndataengineer.uk"><img src="https://img.shields.io/badge/Live_Site-moderndataengineer.uk-blueviolet?style=flat-square" alt="Live Site"></a>
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16_App_Router-black?style=flat-square&logo=next.js" alt="Next.js 16"></a>
  <a href="https://vitest.dev/"><img src="https://img.shields.io/badge/Tests-58_Files_%E2%80%A2_472_Passed-green?style=flat-square&logo=vitest" alt="Vitest 58/58"></a>
  <a href="../src/data/content-counts.json"><img src="https://img.shields.io/badge/Inventory-11%2C956%2B_Assets-blue?style=flat-square" alt="11,956+ Assets"></a>
  <a href="content-expansion-plan.md"><img src="https://img.shields.io/badge/Research-21_Authoritative_Sources-emerald?style=flat-square" alt="21 Research Sources"></a>
</p>

> **Unified Enterprise Knowledge Architecture & Operational Guidelines**  
> Comprehensive documentation library for the Modern Data Engineer and Lakehouse Architect platform (`moderndataengineer.uk`), deployed on Cloudflare OpenNext / Workers.

> [!NOTE]
> **Authoritative 2026 Lakehouse Architecture**: All guides and benchmarks in this documentation hub are aligned with current production standards: Apache Spark 3.5+ AQE runtime skew splitting, Delta Lake 3.2 Liquid Clustering & Deletion Vectors, Apache Iceberg v2/v3 REST Catalogs, AWS S3 Express One Zone tiering, NIST SP 800-207 Zero Trust, and OWASP Top 10 for LLMs.

---

## 🧭 Master Documentation Sitemaps

The documentation is organized into six specialized pillars designed for Lead Architects, Staff Engineers, Platform Developers, and Technical Leaders:

```
docs/
├── architecture/             # 8 Deep-Dive Modules + JSON Export + 42 Blueprints
├── audits/                   # Production Edge Benchmarks, Theme & Design System Audits
├── design-system/            # Design Token System 2.0, UI Primitives, Editorial Spec
├── engineering/              # Development Quickstart, Vitest Testing Runbook, Roadmap
├── content-expansion-plan.md # Evidence-led research ledger & 21 source standards
├── STANDARDIZED_ARCHITECTURE.md # Architectural invariants & Server/Client boundaries
└── databricks_master_operations_and_triage_guide.md # 148+ Databricks Operations & OOM Triage
```

---

## 1. 🏛️ Architecture & System Design (`docs/architecture/`)

In-depth technical guides, failure mode analysis, decision trees, and production walkthroughs:

| Module | Title | Core Technologies | Focus & Architectural Scope | Direct Link |
| :---: | :--- | :--- | :--- | :--- |
| **01** | **Azure Synapse Architecture** | Dedicated SQL Pools, Serverless SQL, Managed VNet | MPP architecture, 60 hash distributions, Workload Management (WLM), HTAP Synapse Link. | [`architecture/01_azure_synapse.md`](./architecture/01_azure_synapse.md) |
| **02** | **Microsoft Fabric Mastery** | OneLake, Direct Lake, Shortcuts, F-SKU Capacity | SaaS lakehouse convergence, VertiPaq memory mapping, capacity smoothing, and bursting curves. | [`architecture/02_microsoft_fabric.md`](./architecture/02_microsoft_fabric.md) |
| **03** | **NoSQL & Vector Databases** | Cosmos DB, ScyllaDB, pgvector, Qdrant, Milvus | RU/s optimization, multi-region writes, vector embeddings, semantic search, and RAG architectures. | [`architecture/03_nosql_vector_db.md`](./architecture/03_nosql_vector_db.md) |
| **04** | **Modern ETL/ELT & Streaming** | Spark, Flink, DuckDB, Polars, Delta UniForm | In-process analytical de-clustering, Apache Arrow zero-copy memory, real-time CEP vs micro-batching. | [`architecture/04_etl_stream_proc.md`](./architecture/04_etl_stream_proc.md) |
| **05** | **Lakehouse FinOps** | Databricks System Tables, Storage Lifecycle, Spot VMs | TCO models, Serverless SQL auto-scaling, Spot instance arbitrage, and cold data lifecycle policies. | [`architecture/05_lakehouse_finops.md`](./architecture/05_lakehouse_finops.md) |
| **06** | **Enterprise Blueprints** | End-to-End Enterprise Lakehouse Blueprints | 6 production walkthroughs + 42 Whiteboard Blueprints across 7 domains with Mermaid flows. | [`architecture/06_enterprise_blueprints.md`](./architecture/06_enterprise_blueprints.md) |
| **07** | **Open Storage Formats** | Delta Lake, Apache Iceberg, Apache Hudi, Paimon | Lakehouse metadata snapshot trees, ACID OCC, hidden partitioning, Parquet/ORC/Avro physical layouts. | [`architecture/07_open_storage_formats.md`](./architecture/07_open_storage_formats.md) |
| **08** | **6 Delta Lake Optimizations** | Liquid Clustering, Z-Order, OPTIMIZE, VACUUM | Benchmarking 6 Delta Lake performance and storage hygiene levers across a 50M-row dataset. | [`architecture/08_delta_optimization.md`](./architecture/08_delta_optimization.md) |
| **Data**| **Machine-Readable Export** | Full Dataset JSON (`knowledge_base_export.json`) | Machine-readable export with metadata, schema tags, questions, and code snippets for SSGs and RAG. | [`architecture/knowledge_base_export.json`](./architecture/knowledge_base_export.json) |

👉 **[Explore Full Architecture Library](./architecture/README.md)**

---

## 2. ⚡ Operations & Production Triage Guides

Comprehensive operational playbooks for enterprise cluster administration, memory tuning, and runbooks:

| Document | Primary Focus | Scope & Content | Direct Link |
| :--- | :--- | :--- | :--- |
| **Databricks Master Operations & Triage Guide** | DBFS, Volumes, PySpark, Spark SQL, Memory Models & Triage | 148+ operations, Unity Catalog Volumes, secret vaults, and step-by-step triage for Driver/Executor OOM, Shuffle Spill, Skew Joins, and Small Files | [`databricks_master_operations_and_triage_guide.md`](./databricks_master_operations_and_triage_guide.md) |
| **Content Expansion & Research Plan** | Sourced evidence ledger, 21 research reports, inventory manifest | Evidence boundary, DORA 2025, Thoughtworks Radar Vol. 35, dbt Labs 2026, 11,956+ verified assets | [`content-expansion-plan.md`](./content-expansion-plan.md) |
| **Standardized Architecture Spec** | Server/Client boundaries, DAL, SEO, and invariants | Architectural rules, Next.js 16 App Router conventions, zero-lag reading mode | [`STANDARDIZED_ARCHITECTURE.md`](./STANDARDIZED_ARCHITECTURE.md) |

---

## 3. 📊 Production Audits & Quality Reports (`docs/audits/`)

Verified edge network benchmarks, accessibility certifications, and Lighthouse audits:

| Document | Primary Focus | Key Score / Metric | Direct Link |
| :--- | :--- | :--- | :--- |
| **Enterprise Production Audit** | Edge TTFB, LCP, Zero-Bundle DAL, Test Coverage | **99/100 Lighthouse**, LCP: 0.78s, **472 Tests Passed (58 Suites)** | [`audits/production_audit.md`](./audits/production_audit.md) |
| **Theme & Contrast Audit** | Zero-Flash Theme Switch, Runtime Contrast Matrix | **<16ms Theme Toggle**, WCAG 2.1 AA Certified | [`audits/theme_audit.md`](./audits/theme_audit.md) |
| **Design System Audit** | Fluid Typography Clamp, 6 Responsive Breakpoints | **100% Pass Rate across 58 Test Suites** | [`audits/design_system_audit.md`](./audits/design_system_audit.md) |

👉 **[Explore Full Audits Directory](./audits/README.md)**

---

## 4. 🎨 Design System & Motion Specifications (`docs/design-system/`)

UI components, mathematical fluid typography, and hardware-accelerated canvas motion:

| Document | Primary Focus | Key Specifications | Direct Link |
| :--- | :--- | :--- | :--- |
| **Design Tokens & UI Primitives** | Design Token System 2.0 (`color`, `font`, `space`) | Surface elevation, fluid type scale, Heading/Card/Button API | [`design-system/tokens_and_primitives.md`](./design-system/tokens_and_primitives.md) |

👉 **[Explore Design System Specifications](./design-system/README.md)**

---

## 5. 🛠️ Engineering, Operations & Roadmap (`docs/engineering/`)

Developer onboarding, architecture rules, testing runbooks, and strategic planning:

| Document | Primary Focus | Operational Guide | Direct Link |
| :--- | :--- | :--- | :--- |
| **Development & Operations Guide** | Next.js 16 App Router, DAL, Vitest suite, Cloudflare OpenNext | Local setup, Zero-Bundle rule, 58-suite test runbook, R2 sync | [`engineering/development_guide.md`](./engineering/development_guide.md) |
| **Platform Engineering Roadmap** | Completed milestones & v2.0+ planned expansions | BM25F search, Databricks 148+ hub, 7 master PDFs, single-roof concepts | [`engineering/roadmap.md`](./engineering/roadmap.md) |
| **Workers for Platforms** | Dynamic tenant isolation and customer workers | Edge sandboxing, execution safety, and container isolation | [`engineering/workers-for-platforms.md`](./engineering/workers-for-platforms.md) |

👉 **[Explore Engineering Runbooks](./engineering/README.md)**

---

[← Back to Project Root](../README.md)
