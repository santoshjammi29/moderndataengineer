# Central Documentation Hub: `lakehouse-architect`

> **Unified Enterprise Knowledge Architecture & Operational Guidelines**  
> Comprehensive documentation library for the Modern Data Engineer and Lakehouse Architect platform (`moderndataengineer.uk`), deployed on Cloudflare OpenNext / Workers.

---

## 🧭 Master Documentation Sitemaps

The documentation is structured into five specialized pillars designed for Data Architects, Staff Engineers, UI Engineers, and Technical Leaders:

```
docs/
├── architecture/      # 8 Deep-Dive Modules + JSON Export + 42 Blueprints
├── audits/            # Production Edge Benchmarks, Theme & Design System Audits
├── design-system/     # Design Token System 2.0, UI Primitives, Editorial Spec
├── engineering/       # Development Quickstart, Vitest Testing Runbook, Roadmap
└── databricks_master_operations_and_triage_guide.md # 148+ Databricks Operations & OOM Triage
```

---

## 1. 🏛️ Architecture & System Design (`docs/architecture/`)

In-depth technical guides, failure mode analysis, decision trees, and production walkthroughs:

| Module | Title | Topic Highlights | Link |
| :---: | :--- | :--- | :--- |
| **01** | **Azure Synapse Architecture** | Dedicated SQL Pools (MPP), Serverless SQL, Managed VNet, WLM, skews | [`architecture/01_azure_synapse.md`](./architecture/01_azure_synapse.md) |
| **02** | **Microsoft Fabric Mastery** | OneLake Shortcuts, Lakehouse vs Warehouse, Direct Lake, F-SKU Capacity | [`architecture/02_microsoft_fabric.md`](./architecture/02_microsoft_fabric.md) |
| **03** | **NoSQL & Vector Databases** | Cosmos DB RU/s tuning, multi-region write, pgvector & Qdrant for RAG | [`architecture/03_nosql_vector_db.md`](./architecture/03_nosql_vector_db.md) |
| **04** | **Modern ETL/ELT & Streaming** | Spark vs Flink vs DuckDB/Polars, Delta UniForm vs Iceberg, Airflow | [`architecture/04_etl_stream_proc.md`](./architecture/04_etl_stream_proc.md) |
| **05** | **Lakehouse FinOps** | TCO models, Serverless SQL auto-scaling, Spot instance arbitrage, VACUUM | [`architecture/05_lakehouse_finops.md`](./architecture/05_lakehouse_finops.md) |
| **06** | **Enterprise Blueprints** | 6 End-to-End Enterprise Blueprints with Mermaid sequence flows & 42 Whiteboard schematics | [`architecture/06_enterprise_blueprints.md`](./architecture/06_enterprise_blueprints.md) |
| **07** | **Open Storage Formats** | Delta Lake, Apache Iceberg, Apache Hudi, Paimon, Parquet, ORC, Avro | [`architecture/07_open_storage_formats.md`](./architecture/07_open_storage_formats.md) |
| **08** | **6 Delta Lake Optimizations** | Benchmarking 6 Delta Lake optimization levers across 50M rows | [`architecture/08_delta_optimization.md`](./architecture/08_delta_optimization.md) |
| **Data**| **Machine-Readable Export** | Full structured JSON dataset with metadata tags for SSGs & RAG | [`architecture/knowledge_base_export.json`](./architecture/knowledge_base_export.json) |

👉 **[Explore Full Architecture Library](./architecture/README.md)**

---

## 2. ⚡ Operations & Production Triage Guides

Comprehensive operational playbooks for enterprise cluster administration, memory tuning, and runbooks:

| Document | Primary Focus | Scope & Content | Link |
| :--- | :--- | :--- | :--- |
| **Databricks Master Operations & Triage Guide** | DBFS, Volumes, PySpark, Spark SQL, Memory Models & Triage | 148+ operations, Unity Catalog Volumes, secret vaults, and step-by-step triage for Driver/Executor OOM, Shuffle Spill, Skew Joins, and Small Files | [`databricks_master_operations_and_triage_guide.md`](./databricks_master_operations_and_triage_guide.md) |
| **Standardized Architecture Spec** | Server/Client boundaries, DAL, SEO, and invariants | Architectural rules, Next.js 16 App Router conventions, zero-lag reading mode | [`STANDARDIZED_ARCHITECTURE.md`](./STANDARDIZED_ARCHITECTURE.md) |

---

## 3. 📊 Production Audits & Quality Reports (`docs/audits/`)

Verified edge network benchmarks, accessibility certifications, and Lighthouse audits:

| Document | Primary Focus | Key Score / Metric | Link |
| :--- | :--- | :--- | :--- |
| **Enterprise Production Audit** | Edge TTFB, LCP, Zero-Bundle DAL, Test Coverage | **99/100 Lighthouse**, LCP: 0.78s, **424 Tests Passed (53 Suites)** | [`audits/production_audit.md`](./audits/production_audit.md) |
| **Theme & Contrast Audit** | Zero-Flash Theme Switch, Runtime Contrast Matrix | **<16ms Theme Toggle**, WCAG 2.1 AA Certified | [`audits/theme_audit.md`](./audits/theme_audit.md) |
| **Design System Audit** | Fluid Typography Clamp, 6 Responsive Breakpoints | **100% Pass Rate across 53 Test Suites** | [`audits/design_system_audit.md`](./audits/design_system_audit.md) |

👉 **[Explore Full Audits Directory](./audits/README.md)**

---

## 4. 🎨 Design System & Motion Specifications (`docs/design-system/`)

UI components, mathematical fluid typography, and hardware-accelerated canvas motion:

| Document | Primary Focus | Key Specifications | Link |
| :--- | :--- | :--- | :--- |
| **Design Tokens & UI Primitives** | Design Token System 2.0 (`color`, `font`, `space`) | Surface elevation, fluid type scale, Heading/Card/Button API | [`design-system/tokens_and_primitives.md`](./design-system/tokens_and_primitives.md) |

👉 **[Explore Design System Specifications](./design-system/README.md)**

---

## 5. 🛠️ Engineering, Operations & Roadmap (`docs/engineering/`)

Developer onboarding, architecture rules, testing runbooks, and strategic planning:

| Document | Primary Focus | Operational Guide | Link |
| :--- | :--- | :--- | :--- |
| **Development & Operations Guide** | Next.js 16 App Router, DAL, Vitest suite, Cloudflare OpenNext | Local setup, Zero-Bundle rule, 51-suite test runbook, R2 sync | [`engineering/development_guide.md`](./engineering/development_guide.md) |
| **Platform Engineering Roadmap** | Completed milestones & v2.0+ planned expansions | BM25F search, Databricks 148+ hub, 7 master PDFs, single-roof concepts | [`engineering/roadmap.md`](./engineering/roadmap.md) |
| **Workers for Platforms** | Dynamic tenant isolation and customer workers | Edge sandboxing, execution safety, and container isolation | [`engineering/workers-for-platforms.md`](./engineering/workers-for-platforms.md) |

👉 **[Explore Engineering Runbooks](./engineering/README.md)**

---

[← Back to Project Root](../README.md)
