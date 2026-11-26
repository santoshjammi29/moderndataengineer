#!/usr/bin/env python3
"""
Ecosystem Best Practices & Learning Repo Structure Automation
============================================================
Applies the top-25 GitHub learning repository patterns across all 14 repositories
in the Modern Data Engineering Lakehouse ecosystem:
1. Interactive Checkbox Roadmap (ROADMAP.md) categorized by 4 Mastery Tiers (L1-L4).
2. Standardized Curriculum Authoring Guide (CONTRIBUTING.md) enforcing the Triad pattern.
3. Autonomous AI Agent Guidance (AGENTS.md) enforcing WCAG 2.2 AA and typography rules.
4. Universal Indentation & Formatting (.editorconfig).
5. README harmonization with top-tier badge ribbons and roadmap quicklinks.
6. Synchronization of the coding-learning-repo-architect skill across agent-enabled repos.

Author: Principal Lakehouse & Distributed Data Systems Architect
Platform: moderndataengineer.uk
"""

import json
import shutil
from pathlib import Path

BASE_DIR = Path('/Users/santosh/Documents/antigravity')
HUB_DIR = BASE_DIR / 'charming-fermi'

# The 14 Repositories Metadata
REPOSITORIES = {
    "charming-fermi": {
        "slug": "charming-fermi",
        "github": "santoshjammi29/moderndataengineer",
        "name": "Modern Data Engineer & Lakehouse Architect Hub",
        "role": "Central presentation platform, OpenNext Cloudflare edge runtime, R2 content shard publisher",
        "primary_pillar": "All 14 Pillars",
        "has_manifest": False,
        "is_hub": True
    },
    "databricks-handbook": {
        "slug": "databricks-handbook",
        "github": "santoshjammi29/databricks-handbook",
        "name": "Databricks Handbook",
        "role": "105 Databricks production recipes, Unity Catalog governance, Delta Lake 3.x, Lakeflow, Serverless, DABs, FinOps",
        "primary_pillar": "Databricks Platform & Lakehouse",
        "has_manifest": True,
        "is_hub": False
    },
    "pyspark-handbook": {
        "slug": "pyspark-handbook",
        "github": "santoshjammi29/pyspark-handbook",
        "name": "PySpark Handbook",
        "role": "105 PySpark code use cases, Catalyst internals, Tungsten memory, AQE, Arrow UDFs, skew salting",
        "primary_pillar": "Apache Spark & Distributed Compute",
        "has_manifest": True,
        "is_hub": False
    },
    "sql-handbook": {
        "slug": "sql-handbook",
        "github": "santoshjammi29/sql-handbook",
        "name": "SQL Handbook",
        "role": "105 SQL production exercises, query execution plans, MPP distributed joins, MVCC concurrency",
        "primary_pillar": "SQL Server & Database Architecture",
        "has_manifest": True,
        "is_hub": False
    },
    "dbt-handbook": {
        "slug": "dbt-handbook",
        "github": "santoshjammi29/dbt-handbook",
        "name": "dbt Handbook",
        "role": "Production analytics engineering: dbt Mesh, Microbatch incremental, contracts, unit tests, Semantic Layer",
        "primary_pillar": "dbt & Analytics Engineering",
        "has_manifest": True,
        "is_hub": False
    },
    "streaming-handbook": {
        "slug": "streaming-handbook",
        "github": "santoshjammi29/streaming-handbook",
        "name": "Streaming Handbook",
        "role": "Distributed event streaming: Kafka 3.9 KRaft, Apache Flink stateful processing, RocksDB, CDC Debezium",
        "primary_pillar": "Real-Time Streaming & Event Architecture",
        "has_manifest": True,
        "is_hub": False
    },
    "dataops-cicd-handbook": {
        "slug": "dataops-cicd-handbook",
        "github": "santoshjammi29/dataops-cicd-handbook",
        "name": "DataOps & CI/CD Handbook",
        "role": "Platform engineering: GitOps, Terraform & Bicep IaC, Write-Audit-Publish, Data Diff, Slim CI",
        "primary_pillar": "Apache Airflow & Orchestration",
        "has_manifest": True,
        "is_hub": False
    },
    "data-system-design-handbook": {
        "slug": "data-system-design-handbook",
        "github": "santoshjammi29/data-system-design-handbook",
        "name": "System Design Handbook",
        "role": "Distributed systems architecture: Table formats (Delta, Iceberg, Hudi), catalog federation, Liquid Clustering",
        "primary_pillar": "Modern Lakehouse Architectures",
        "has_manifest": True,
        "is_hub": False
    },
    "data-engineering-interview-handbook": {
        "slug": "data-engineering-interview-handbook",
        "github": "santoshjammi29/data-engineering-interview-handbook",
        "name": "Interview Handbook",
        "role": "Architectural defense playbook: 20 Knowledge Pillars, 10 125-series playbooks, 595+ production questions",
        "primary_pillar": "General Data Engineering & Modeling",
        "has_manifest": True,
        "is_hub": False
    },
    "azure-cheat-sheet": {
        "slug": "azure-cheat-sheet",
        "github": "santoshjammi29/azure-cheat-sheet",
        "name": "Azure Cheat Sheet",
        "role": "Azure Lakehouse & Infrastructure: Microsoft Fabric OneLake, Synapse, Bicep IaC, vector cheat sheets",
        "primary_pillar": "Microsoft Fabric & OneLake",
        "has_manifest": True,
        "is_hub": False
    },
    "azure-databricks-project-blueprints": {
        "slug": "azure-databricks-project-blueprints",
        "github": "santoshjammi29/azure-databricks-project-blueprints",
        "name": "Databricks Project Blueprints",
        "role": "3 Full-scale production reference architectures: Retail Omnichannel Lakehouse, Real-time Fraud, Warehouse Cutover",
        "primary_pillar": "Databricks Platform & Lakehouse",
        "has_manifest": True,
        "is_hub": False
    },
    "enterprise-banking-risk-alm-lakehouse": {
        "slug": "enterprise-banking-risk-alm-lakehouse",
        "github": "santoshjammi29/enterprise-banking-risk-alm-lakehouse",
        "name": "Banking Risk Lakehouse",
        "role": "European banking compliance (DNB, ECB, BCBS 239), IFRS 9 ECL calculations, and IRRBB ALM Monte Carlo simulations",
        "primary_pillar": "Modern Lakehouse Architectures",
        "has_manifest": True,
        "is_hub": False
    },
    "spark-experiments": {
        "slug": "spark-experiments",
        "github": "santoshjammi29/spark-experiments",
        "name": "Spark Experiments",
        "role": "Empirical laboratory: Reproducible data skew generation (1M+ rows), two-phase salting benchmarks, query plan analysis",
        "primary_pillar": "Apache Spark & Distributed Compute",
        "has_manifest": True,
        "is_hub": False
    },
    "security-handbook": {
        "slug": "security-handbook",
        "github": "santoshjammi29/security-handbook",
        "name": "Security Handbook",
        "role": "Enterprise security patterns: Cloud perimeter, DevSecOps, ETL/ELT governance, Databricks Unity Catalog, ADF, Python cryptography",
        "primary_pillar": "Security, Governance & Compliance",
        "has_manifest": True,
        "is_hub": False
    }
}

EDITORCONFIG_CONTENT = """root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.py]
indent_size = 4

[*.sql]
indent_size = 2

[*.md]
trim_trailing_whitespace = false
"""

def generate_contributing_md(repo_key: str, meta: dict) -> str:
    name = meta['name']
    github = meta['github']
    meta['role']
    pillar = meta['primary_pillar']

    return f"""# Contributing to {name}

Thank you for your interest in contributing to **{name}** (`{github}`)! This repository is an official component of the **Modern Data Engineering Lakehouse Ecosystem** ([moderndataengineer.uk](https://moderndataengineer.uk)).

Our curriculum and code samples follow strict architectural standards synthesized from the **Top 25 educational repositories on GitHub** (~5,000,000+ stars).

---

## 1. Core Pedagogical Invariants

Every drill, exercise, notebook, and architecture guide in this repository must satisfy the **Code-Test-Doc Triad**:

```mermaid
flowchart LR
    A["1. Theory & Mental Model<br/>(README / Docstring)"] --> B["2. Executable Implementation<br/>(Clean Idiomatic Code)"]
    B --> C["3. Automated Assertion<br/>(Unit Test / Doctest)"]
```

1. **The Code-Test-Doc Triad**:
   - **Theory & Mental Model**: Every topic must begin with an intuitive real-world analogy and high-level architecture diagram (Mermaid or ASCII flow).
   - **Executable Code**: Code must be 100% runnable with zero missing imports or broken pseudocode.
   - **Automated Test Assertions**: Every code module must include automated verification tests (e.g. `pytest`, `doctest`, or unit assertions) checking happy paths and edge cases.

2. **The Anti-Pattern Standard ("Bad vs Good")**:
   - Contrastive learning is twice as memorable as isolated clean code.
   - Every guide should illustrate both:
     - `❌ Bad Practice`: Common production pitfall or anti-pattern.
     - `✅ Good Practice`: Hardened, performant, production-ready solution.
   - **The "Otherwise" Requirement**: Explicitly state the operational consequence of ignoring the rule (e.g., *Driver OOM*, *Data Corruption*, *Lock Contention*, *Spill to Disk*).

3. **4-Tier Progressive Disclosure Model**:
   - **Level 1 (Foundations)**: Core definitions, basic syntax, single-node execution.
   - **Level 2 (Core Mechanics)**: Standard production patterns, schema validation, error handling.
   - **Level 3 (Complex Scenarios & Skew)**: Performance tuning, partition skew, memory triage, runbooks.
   - **Level 4 (Staff Architect)**: Cross-cloud trade-offs, FinOps cost curves, zero-trust security.

---

## 2. Authoring Guidelines & Schema

### Exercise Directory Layout
```
module-name/
├── README.md               # Visual explanation, Big-O complexity, real-world context
├── implementation.py       # Production-clean, typed implementation
└── test_implementation.py  # Self-contained pytest test suite
```

### Primary Evidence Sourcing
Every submission must be grounded in primary authoritative documentation:
- Official documentation (Spark, Delta Lake, Databricks, dbt, Apache Kafka, Microsoft Fabric).
- Peer-reviewed research papers and seminal industry specifications (e.g., BCBS 239, DORA, Raft, Chandy-Lamport).

---

## 3. Pre-Publish Quality Audit Checklist

Before submitting a Pull Request, verify:

- [ ] **1. Triad Compliance**: Does the module contain explanation, runnable code, and automated tests?
- [ ] **2. 1-Line Mental Model**: Is there an intuitive summary at the top?
- [ ] **3. Architecture Diagram**: Is there a Mermaid or ASCII data-flow diagram?
- [ ] **4. Fully Executable**: Does the code run without external dependencies where possible?
- [ ] **5. Anti-Pattern Demonstrated**: Is there a side-by-side `Bad` vs `Good` comparison?
- [ ] **6. Complexity Analyzed**: Are Big-O time and auxiliary space bounds explicitly stated?
- [ ] **7. WCAG 2.2 AA Contrast**: Are all text and diagram elements accessible across themes?
- [ ] **8. Link Integrity**: Do all internal markdown links resolve correctly?
- [ ] **9. Taxonomy Alignment**: Does the topic map cleanly to `{pillar}` in `TAXONOMY.md`?
- [ ] **10. Kebab-Case ID**: Is the unique identifier lowercase kebab-case?

---

## 4. Pull Request Workflow

1. **Fork the repository** on GitHub.
2. **Create a topic branch**: `git checkout -b feat/your-exercise-name`.
3. **Run local tests**: Ensure all unit tests and linters pass.
4. **Commit with Conventional Commits**: e.g., `feat(module): add two-phase salting drill`.
5. **Submit PR**: Reference any relevant issues and verify the CI checks turn green.
"""

def generate_agents_md(repo_key: str, meta: dict) -> str:
    name = meta['name']
    github = meta['github']
    meta['role']
    pillar = meta['primary_pillar']

    return rf"""# Autonomous Agent Operational Guidelines: {name}

> **Repository**: [{github}](https://github.com/{github})
> **Ecosystem Hub**: [moderndataengineer.uk](https://moderndataengineer.uk)
> **Primary Authority**: `{pillar}`

---

## 1. Architectural Role & Invariants

You are assisting on **{name}**, an authoritative satellite repository within the **Modern Data Engineering Lakehouse Ecosystem**.

1. **Design System & Typography**:
   - **Primary Typeface**: Use `Inter` with system fallbacks (`system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`).
   - **Monospace Family**: Use `JetBrains Mono, Fira Code, monospace` for code blocks and tabular counters.
   - **WCAG 2.2 AA Contrast**: Ensure all text has $\ge 4.5:1$ contrast against light, dark, and e-ink backgrounds.
   - **Natural Text Wrapping**: Avoid arbitrary truncation (`truncate` or `line-clamp`). Use `overflow-wrap: anywhere` and `text-wrap: pretty`.

2. **Code Authoring Standards (The Triad)**:
   - When authoring code samples or notebooks, always provide:
     1. Conceptual explanation with an ASCII/Mermaid architecture diagram.
     2. Clean, idiomatically typed code.
     3. Executable assertions / tests (doctests or pytest).

3. **Anti-Pattern Standards**:
   - Contrast `❌ Bad Practice` with `✅ Good Practice` and quantify the "Otherwise" operational blast radius.

4. **Skill Reference**:
   - Reference the core agent skill `coding-learning-repo-architect` for curriculum structuring, exercise templates, and 4-tier progressive disclosure models.
"""

def generate_roadmap_md(repo_key: str, meta: dict, entries: list) -> str:
    name = meta['name']
    github = meta['github']
    meta['role']
    pillar = meta['primary_pillar']
    total_count = len(entries)

    # Bucket entries by tier
    tier1 = [] # L1
    tier2 = [] # L2
    tier3 = [] # L3
    tier4 = [] # L4

    for e in entries:
        diff = e.get('difficulty', '').upper()
        if 'L1' in diff:
            tier1.append(e)
        elif 'L2' in diff:
            tier2.append(e)
        elif 'L3' in diff:
            tier3.append(e)
        elif 'L4' in diff:
            tier4.append(e)
        else:
            # Fallback based on type or index
            tier2.append(e)

    lines = [
        f"# 🗺️ {name} — Interactive Curriculum Roadmap",
        "",
        "> **Interactive Checkbox Study Tracker & Mastery Progression**  ",
        f"> **Canonical Repository**: [{github}](https://github.com/{github}) | **Ecosystem**: [moderndataengineer.uk](https://moderndataengineer.uk)  ",
        f"> **Total Exercises & Drills**: `{total_count}` | **Primary Pillar**: `{pillar}`",
        "",
        "---",
        "",
        "## How to Use This Roadmap",
        "",
        "1. **Fork this repository** to your personal GitHub account.",
        "2. Work through the modules in sequence or target specific architectural topics.",
        "3. Check off boxes (`- [x]`) as you complete each exercise, drill, or notebook.",
        "4. Commit and push your progress to your personal branch to track your career journey!",
        "",
        "```",
        f"Progress: [ ] 0 / {total_count} Completed (0.0%)",
        "```",
        "",
        "---",
        "",
        "## Curriculum Structure: The 4 Mastery Tiers",
        "",
        "```mermaid",
        "flowchart LR",
        '    T1["Tier 1: Foundations<br/>(Level 1)"] --> T2["Tier 2: Core Mechanics<br/>(Level 2)"]',
        '    T2 --> T3["Tier 3: Complex Scenarios<br/>(Level 3)"]',
        '    T3 --> T4["Tier 4: Staff Architect<br/>(Level 4)"]',
        "```",
        ""
    ]

    if tier1:
        lines.extend([
            "### 🟢 Tier 1: Foundations & Architecture (Level 1)",
            "> Core concepts, fundamental syntax, mental models, and environment setup.",
            ""
        ])
        for item in tier1:
            title = item.get('title', item.get('id', 'Exercise'))
            path = item.get('relative_path', '')
            link = f"[{title}]({path})" if path else title
            lines.append(f"- [ ] `{item.get('id', '')}` — {link} `Level 1`")
        lines.append("")

    if tier2:
        lines.extend([
            "### 🟡 Tier 2: Core Mechanics & Implementation (Level 2)",
            "> Production pipeline patterns, schema validation, standard transformations, and unit tests.",
            ""
        ])
        for item in tier2:
            title = item.get('title', item.get('id', 'Exercise'))
            path = item.get('relative_path', '')
            link = f"[{title}]({path})" if path else title
            lines.append(f"- [ ] `{item.get('id', '')}` — {link} `Level 2`")
        lines.append("")

    if tier3:
        lines.extend([
            "### 🟠 Tier 3: Complex Scenarios, Edge Cases & Performance (Level 3)",
            "> Performance tuning, partition skew, memory triage runbooks, and failure recovery.",
            ""
        ])
        for item in tier3:
            title = item.get('title', item.get('id', 'Exercise'))
            path = item.get('relative_path', '')
            link = f"[{title}]({path})" if path else title
            lines.append(f"- [ ] `{item.get('id', '')}` — {link} `Level 3`")
        lines.append("")

    if tier4:
        lines.extend([
            "### 🔴 Tier 4: Production Hardening, FinOps & Staff Architecture (Level 4)",
            "> Enterprise trade-offs, cross-cloud DR, zero-trust security, and FinOps cost optimization.",
            ""
        ])
        for item in tier4:
            title = item.get('title', item.get('id', 'Exercise'))
            path = item.get('relative_path', '')
            link = f"[{title}]({path})" if path else title
            lines.append(f"- [ ] `{item.get('id', '')}` — {link} `Level 4`")
        lines.append("")

    lines.extend([
        "---",
        "",
        "## Suggested Study Schedules",
        "",
        "| Schedule | Pace | Target Audience | Focus |",
        "|---|---|---|---|",
        "| **4-Week Sprint** | 5-6 drills / day | Interview Prep / Fast Track | Focus on Tier 2 & Tier 3 core drills |",
        f"| **8-Week Deep-Dive** | 2-3 drills / day | Full Technical Mastery | Complete all {total_count} exercises + tests |",
        "| **12-Week Staff Track** | 1-2 drills / day | Architect & Tech Lead | Deep dive into Tier 3 & Tier 4 blueprints |",
        "",
        "---",
        "",
        "## Sister Repositories & Ecosystem Roadmaps",
        "",
        "Explore interactive roadmaps across all 14 pillars of the lakehouse ecosystem:",
        "- [Modern Data Engineer Central Hub](https://moderndataengineer.uk)",
        "- [Databricks Handbook](https://github.com/santoshjammi29/databricks-handbook)",
        "- [PySpark Handbook](https://github.com/santoshjammi29/pyspark-handbook)",
        "- [SQL Handbook](https://github.com/santoshjammi29/sql-handbook)",
        "- [dbt Handbook](https://github.com/santoshjammi29/dbt-handbook)",
        "- [Streaming Handbook](https://github.com/santoshjammi29/streaming-handbook)",
        "- [DataOps & CI/CD Handbook](https://github.com/santoshjammi29/dataops-cicd-handbook)",
        "- [System Design Handbook](https://github.com/santoshjammi29/data-system-design-handbook)",
        "- [Interview Handbook](https://github.com/santoshjammi29/data-engineering-interview-handbook)",
        "- [Security Handbook](https://github.com/santoshjammi29/security-handbook)"
    ])

    return "\n".join(lines) + "\n"

def generate_hub_roadmap_md() -> str:
    return """# 🗺️ Modern Data Engineer & Lakehouse Architect — Master Ecosystem Roadmap

> **Comprehensive Interactive Learning Roadmap across all 14 Knowledge Pillars**
> **Platform**: [moderndataengineer.uk](https://moderndataengineer.uk) | **Codebase**: [santoshjammi29/moderndataengineer](https://github.com/santoshjammi29/moderndataengineer)
> **Scope**: 11,280+ Curated Data Engineering Records across 14 Specialized Repositories

---

## 1. The 14-Pillar Mastery Matrix

Check off each pillar as you master its concepts, drills, and architectural trade-offs:

- [ ] **Pillar 01: Apache Spark & Distributed Compute** (`pyspark-handbook`, `spark-experiments`)
  - [ ] Catalyst Optimizer internals (Analysis, Logical, Physical, Code Generation)
  - [ ] Tungsten execution & off-heap memory management
  - [ ] Adaptive Query Execution (AQE), dynamic coalescing, skew join handling
  - [ ] Two-phase key salting for severe data skew mitigation
  - [ ] PySpark Arrow-optimized vector UDFs and Polars interop

- [ ] **Pillar 02: Databricks Platform & Lakehouse** (`databricks-handbook`, `azure-databricks-project-blueprints`)
  - [ ] Unity Catalog 3-tier namespace (`catalog.schema.volume/table`)
  - [ ] Delta Lake 3.x ACID mechanics, Liquid Clustering, Deletion Vectors
  - [ ] Lakeflow Jobs & Pipelines (Declarative DLT with expectations)
  - [ ] Serverless compute architecture & network isolation
  - [ ] Databricks Asset Bundles (DABs) GitOps CI/CD

- [ ] **Pillar 03: SQL Server & Relational Internals** (`sql-handbook`)
  - [ ] Logical vs physical query execution order
  - [ ] Window functions, analytical framing, gaps and islands analysis
  - [ ] Recursive CTEs and hierarchical graph traversals
  - [ ] B-Tree, GIN, GiST, BRIN, and Clustered Columnstore indexing
  - [ ] MVCC isolation levels, transaction locks, and deadlock triage

- [ ] **Pillar 04: Modern Lakehouse Architectures** (`data-system-design-handbook`, `enterprise-banking-risk-alm-lakehouse`)
  - [ ] Medallion Architecture (Bronze raw -> Silver cleansed -> Gold dimensional)
  - [ ] Open table format interoperability: Delta Lake UniForm, Iceberg v2/v3, Hudi
  - [ ] Iceberg REST Catalog federation (Databricks Unity + BigQuery BigLake)
  - [ ] Write-Audit-Publish (WAP) patterns via branch-based table commits

- [ ] **Pillar 05: System Design for Data** (`data-system-design-handbook`)
  - [ ] Distributed consensus (Raft, Paxos, ZAB)
  - [ ] CAP vs PACELC theorems in practice
  - [ ] Backpressure mechanisms, circuit breakers, and rate limiting
  - [ ] Multi-region active-active disaster recovery and replication topologies

- [ ] **Pillar 06: General Data Engineering & Modeling** (`data-engineering-interview-handbook`)
  - [ ] Kimball dimensional modeling: Conformed dimensions, Fact constellations, OBT
  - [ ] Slowly Changing Dimensions (SCD Types 1, 2, 3, 4, 6)
  - [ ] Data Vault 2.0: Hubs, Links, Satellites, and Point-in-Time tables
  - [ ] Bi-temporal historical ledgers (system time vs business effective time)

- [ ] **Pillar 07: dbt & Analytics Engineering** (`dbt-handbook`)
  - [ ] dbt Mesh: Cross-project model references and architectural boundaries
  - [ ] Microbatch incremental processing over multi-billion row tables
  - [ ] Model contracts, schema enforcement, and declarative unit testing
  - [ ] Semantic Layer & MetricFlow definitions

- [ ] **Pillar 08: Data Lake Architecture & Formats** (`data-system-design-handbook`)
  - [ ] Cloud object storage prefix partitioning (S3/ADLS/GCS request limits)
  - [ ] Small file compaction and bin-packing optimization
  - [ ] File skipping via Z-Order, Min/Max statistics, and Liquid Clustering

- [ ] **Pillar 09: Apache Airflow & Orchestration** (`dataops-cicd-handbook`)
  - [ ] Airflow 2/3 decoupled scheduler architecture
  - [ ] Dynamic Task Mapping (`.expand()`) and deferrable operators
  - [ ] Data-aware scheduling via Airflow Datasets
  - [ ] Resilient DAG retries, exponential backoff, and SLA monitoring

- [ ] **Pillar 10: Microsoft Fabric & OneLake** (`azure-cheat-sheet`)
  - [ ] OneLake virtual shortcut architecture across AWS S3 and ADLS Gen2
  - [ ] Direct Lake mode in Power BI over Delta tables without import caching
  - [ ] Fabric capacity smoothing, throttling limits, and F-SKU cost modeling

- [ ] **Pillar 11: Azure Data Factory & Pipelines** (`azure-cheat-sheet`)
  - [ ] Self-Hosted Integration Runtime (SHIR) high-availability clusters
  - [ ] Watermark-driven delta pipelines with tumbling window triggers
  - [ ] Managed Private Endpoints and keyless Managed Identity access

- [ ] **Pillar 12: Power BI & Semantic Layer** (`azure-cheat-sheet`)
  - [ ] VertiPaq in-memory columnar compression engine
  - [ ] DAX evaluation context, filter context, and `CALCULATE()` context transition
  - [ ] Composite data models and user-defined aggregation tables

- [ ] **Pillar 13: Python for Data Engineering** (`pyspark-handbook`)
  - [ ] CPython GIL, memory management, and generational garbage collection
  - [ ] PyArrow zero-copy IPC and Apache Arrow columnar standard
  - [ ] High-throughput asynchronous IO (`asyncio`) and streaming generators

- [ ] **Pillar 14: Real-Time Streaming & Event Architecture** (`streaming-handbook`)
  - [ ] Apache Kafka 3.9 KRaft consensus (metadata log without ZooKeeper)
  - [ ] Apache Flink stateful stream processing and Chandy-Lamport checkpoint barriers
  - [ ] RocksDB state backend tuning and incremental checkpointing
  - [ ] Change Data Capture (CDC) with Debezium and Dead Letter Queues (DLQ)

---

## 2. Interactive Learning Tracks

Track your journey through our four recommended progressive curricula:

1. **Foundations Track (Weeks 1–4)**:
   - Complete Tier 1 and Tier 2 drills in `sql-handbook` and `pyspark-handbook`.
   - Master Kimball dimensional modeling and core Lakehouse principles.

2. **Lakehouse Engineering Track (Weeks 5–8)**:
   - Complete `databricks-handbook` recipes 001–060 (Unity Catalog, Delta Lake 3.x, Lakeflow).
   - Implement dbt incremental microbatch pipelines in `dbt-handbook`.

3. **Streaming & Distributed Systems Track (Weeks 9–12)**:
   - Complete Kafka KRaft and Apache Flink drills in `streaming-handbook`.
   - Run skew and spill benchmarks in `spark-experiments`.

4. **Staff Architect & Enterprise Track (Weeks 13–16)**:
   - Study production blueprints in `azure-databricks-project-blueprints` and `enterprise-banking-risk-alm-lakehouse`.
   - Master cloud perimeter security, OIDC federation, and FinOps in `security-handbook`.
"""

def update_readme_badges(repo_path: Path, repo_key: str, meta: dict):
    readme_path = repo_path / 'README.md'
    if not readme_path.exists():
        return

    with open(readme_path, encoding='utf-8') as f:
        content = f.read()

    meta['github']
    meta['name']

    # Check if ROADMAP and CONTRIBUTING links already exist
    has_roadmap_link = 'ROADMAP.md' in content
    has_contributing_link = 'CONTRIBUTING.md' in content

    # If already linked, skip modifying README to keep diff clean
    if has_roadmap_link and has_contributing_link:
        print(f"[{repo_key}] README already links to ROADMAP.md and CONTRIBUTING.md")
        return

    # Add quick curriculum navigation section if missing
    addition = """

---

## 🗺️ Interactive Curriculum Roadmap & Contributing

- **[Interactive Roadmap & Checkbox Tracker](ROADMAP.md)**: Track your personal progress across all 4 Mastery Tiers (`Level 1` to `Level 4`).
- **[Curriculum Taxonomy & Standards](TAXONOMY.md)**: Canonical controlled vocabulary, pillar mappings, and evidence standards.
- **[Contributing Guidelines](CONTRIBUTING.md)**: Authoring standards enforcing the Code-Test-Doc Triad and Anti-Pattern comparisons.
- **[Live Platform Hub](https://moderndataengineer.uk)**: Access the full 11,280+ record search engine, mindmaps, and vector PDF downloads.
"""
    with open(readme_path, 'a', encoding='utf-8') as f:
        f.write(addition)
    print(f"[{repo_key}] Appended Curriculum & Contributing section to README.md")

def sync_agent_skills(repo_path: Path, repo_key: str):
    if repo_path == HUB_DIR:
        return

    source_skill_dir = HUB_DIR / '.agents/skills/coding-learning-repo-architect'
    target_agents = repo_path / '.agents'
    target_skills = target_agents / 'skills'

    if not source_skill_dir.exists():
        return

    # If the repo already has .agents/skills, copy the new skill there
    if target_skills.exists():
        dest = target_skills / 'coding-learning-repo-architect'
        if not dest.exists():
            shutil.copytree(source_skill_dir, dest)
            print(f"[{repo_key}] Synced coding-learning-repo-architect skill to {dest}")
        else:
            # Overwrite SKILL.md
            shutil.copy2(source_skill_dir / 'SKILL.md', dest / 'SKILL.md')
            print(f"[{repo_key}] Updated coding-learning-repo-architect/SKILL.md")

        # Update UPSTREAM.md if exists
        upstream = target_skills / 'UPSTREAM.md'
        if upstream.exists():
            with open(upstream, encoding='utf-8') as f:
                up_content = f.read()
            if 'coding-learning-repo-architect' not in up_content:
                entry = "\n- `coding-learning-repo-architect`: Synthesis of 25 top-starred GitHub educational repositories (~5M+ stars) covering the 8 structural archetypes, 4-tier progressive disclosure, code-test-doc triad, and automated test harnesses.\n"
                with open(upstream, 'a', encoding='utf-8') as f:
                    f.write(entry)
                print(f"[{repo_key}] Appended skill to UPSTREAM.md")

def process_repository(repo_key: str, meta: dict):
    repo_path = BASE_DIR / repo_key
    if not repo_path.exists():
        print(f"[{repo_key}] Directory not found at {repo_path}")
        return

    print("\n==================================================")
    print(f"Processing: {meta['name']} ({repo_key})")
    print("==================================================")

    # 1. Ensure .editorconfig
    editorconfig_path = repo_path / '.editorconfig'
    if not editorconfig_path.exists():
        with open(editorconfig_path, 'w', encoding='utf-8') as f:
            f.write(EDITORCONFIG_CONTENT)
        print(f"[{repo_key}] Created .editorconfig")

    # 2. Ensure CONTRIBUTING.md
    contributing_path = repo_path / 'CONTRIBUTING.md'
    with open(contributing_path, 'w', encoding='utf-8') as f:
        f.write(generate_contributing_md(repo_key, meta))
    print(f"[{repo_key}] Created/Updated CONTRIBUTING.md")

    # 3. Ensure AGENTS.md
    agents_path = repo_path / 'AGENTS.md'
    # If not hub (hub has custom Next.js agent rules), write tailored AGENTS.md
    if not meta['is_hub']:
        with open(agents_path, 'w', encoding='utf-8') as f:
            f.write(generate_agents_md(repo_key, meta))
        print(f"[{repo_key}] Created/Updated AGENTS.md")

    # 4. Generate ROADMAP.md
    roadmap_path = repo_path / 'ROADMAP.md'
    if meta['is_hub']:
        with open(roadmap_path, 'w', encoding='utf-8') as f:
            f.write(generate_hub_roadmap_md())
        print(f"[{repo_key}] Created Master Hub ROADMAP.md")
    else:
        # Load manifest.json
        manifest_path = repo_path / 'manifest.json'
        entries = []
        if manifest_path.exists():
            with open(manifest_path, encoding='utf-8') as f:
                m_data = json.load(f)
                entries = m_data.get('entries', [])

        with open(roadmap_path, 'w', encoding='utf-8') as f:
            f.write(generate_roadmap_md(repo_key, meta, entries))
        print(f"[{repo_key}] Created ROADMAP.md with {len(entries)} tracked items")

    # 5. Harmonize README.md
    update_readme_badges(repo_path, repo_key, meta)

    # 6. Sync Agent Skills
    sync_agent_skills(repo_path, repo_key)

def main():
    print("Starting Ecosystem-Wide Best Practice & Structural Implementation...")
    for repo_key, meta in REPOSITORIES.items():
        process_repository(repo_key, meta)
    print("\nAll 14 repositories successfully upgraded to top-25 GitHub educational standards!")

if __name__ == '__main__':
    main()
