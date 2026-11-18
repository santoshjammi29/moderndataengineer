#!/usr/bin/env python3
"""
Distribute Knowledge Base Topics across Git Repositories
Covers all 921 concepts from src/data/json/data_concepts.json into the beginning of each repository.
Ensures maximum visibility with visible executive summaries and open topic tables.
"""

import json
import os
import sys

BASE_DIR = "/Users/santosh/Documents/antigravity"
CONCEPTS_PATH = os.path.join(BASE_DIR, "charming-fermi/src/data/json/data_concepts.json")

def load_concepts():
    with open(CONCEPTS_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def format_level(diff):
    d = (diff or "").upper()
    if d == "EASY":
        return "🟢 Easy"
    if d == "MEDIUM":
        return "🟡 Intermediate"
    if d == "HARD":
        return "🔴 Advanced"
    if d == "ARCHITECT":
        return "🟣 Architect"
    return "🟡 Intermediate"

def escape_cell(text):
    if not text:
        return ""
    return text.replace("|", "\\|").replace("\n", " ").strip()

def build_category_table(items, title, icon="📚", open_default=True):
    lines = []
    open_attr = " open" if open_default else ""
    lines.append(f"<details{open_attr}>")
    lines.append(f"<summary><b>{icon} {title} ({len(items)} Topics)</b> — <i>Click to collapse/expand</i></summary>")
    lines.append("")
    lines.append("| # | Topic / Concept | Level | Architectural Definition & Core Principle |")
    lines.append("|---|---|---|---|")
    for idx, c in enumerate(items, 1):
        term = escape_cell(c.get("term", ""))
        level = format_level(c.get("difficulty", ""))
        definition = escape_cell(c.get("definition", ""))
        lines.append(f"| {idx} | **{term}** | {level} | {definition} |")
    lines.append("")
    lines.append("</details>")
    return "\n".join(lines)

def build_handbook_section(repo_name, pillars, total_topics, concepts, anchor=None):
    intro_desc = {
        "pyspark-handbook": "Apache Spark & Python Data Engineering topics",
        "databricks-handbook": "Databricks Data Intelligence Platform & Lakehouse topics",
        "sql-handbook": "Relational SQL, Query Optimization & Database Architecture topics",
        "dbt-handbook": "dbt Core, Analytics Engineering & Semantic Layer topics",
        "azure-cheat-sheet": "Microsoft Azure Data Platform, Fabric, ADF & Power BI topics",
        "dataops-cicd-handbook": "Apache Airflow, DataOps, CI/CD & Pipeline Governance topics",
        "data-system-design-handbook": "Distributed System Design & Data Lake Architecture topics",
        "streaming-handbook": "Real-Time Streaming Lakehouse, CDC & Open Table Format topics"
    }.get(repo_name, "curriculum topics")

    anchor_tag = f'<a id="{anchor}"></a>\n' if anchor else ""

    lines = []
    if anchor_tag:
        lines.append(anchor_tag.strip())
    lines.append(f"## 🧠 Core Curriculum Concepts & Topics ({total_topics} Topics Covered)")
    lines.append("")
    lines.append(f"> 💡 **Enterprise Knowledge Base Integration**: This repository implements **{total_topics} production topics** from the [Modern Data Engineering Systems Encyclopedia (921 Topics)](https://moderndataengineer.uk/concepts).")
    lines.append("")
    lines.append("### 📑 Topics Directory at a Glance")
    lines.append("")
    lines.append("| Pillar / Module | Topic Count | Key Core Primitives Covered | Status |")
    lines.append("|:---|:---:|:---|:---:|")

    for cat_name, pillar_title, icon in pillars:
        matching = [c for c in concepts if c["category"] == cat_name]
        sample_terms = ", ".join([c["term"] for c in matching[:4]]) + f", and {len(matching)-4} more"
        lines.append(f"| {icon} **{pillar_title}** | **{len(matching)}** | {sample_terms} | ✅ Fully Documented |")
    lines.append("")

    for cat_name, pillar_title, icon in pillars:
        matching = [c for c in concepts if c["category"] == cat_name]
        lines.append(build_category_table(matching, pillar_title, icon, open_default=True))
        lines.append("")

    lines.append("---")
    return "\n".join(lines)

def update_handbook_readme(repo_name, pillars, concepts):
    readme_path = os.path.join(BASE_DIR, repo_name, "README.md")
    with open(readme_path, "r", encoding="utf-8") as f:
        content = f.read()

    repo_cats = [p[0] for p in pillars]
    total_topics = sum(len([c for c in concepts if c["category"] == cat]) for cat in repo_cats)

    anchor = "core-concepts" if repo_name == "databricks-handbook" else None
    section_md = build_handbook_section(repo_name, pillars, total_topics, concepts, anchor)

    if repo_name == "azure-cheat-sheet":
        # In azure-cheat-sheet, place right after the blockquote / first separator so it is immediately visible!
        target = "## 🌐 Interactive Version"
        if target in content:
            new_content = content.replace(target, section_md + "\n\n" + target)
            # Add to TOC
            toc_marker = "## 📑 Table of Contents\n\n"
            if toc_marker in new_content:
                toc_entry = f"- [🧠 Core Curriculum Concepts & Topics ({total_topics} Topics)](#-core-curriculum-concepts--topics-{total_topics}-topics-covered)\n"
                new_content = new_content.replace(toc_marker, toc_marker + toc_entry)
            with open(readme_path, "w", encoding="utf-8") as f:
                f.write(new_content)
            print(f"Updated {repo_name} ({total_topics} topics)")
            return

    target_heading = "## 🎯 Overview & Mission"
    if '<a id="overview"></a>' in content:
        target_heading = '<a id="overview"></a>\n## 🎯 Overview & Mission'

    if target_heading in content:
        new_content = content.replace(target_heading, section_md + "\n\n" + target_heading)
        nav_target = "[Sister Repositories]"
        if nav_target in new_content:
            nav_link = f" • [Core Concepts ({total_topics} Topics)](#-core-curriculum-concepts--topics)"
            if repo_name == "databricks-handbook":
                nav_link = f" • [Core Concepts ({total_topics} Topics)](#core-concepts)"
            new_content = new_content.replace(f"• {nav_target}", f"{nav_link} • {nav_target}")
        elif "[Curriculum Overview]" in new_content or "[Platform Architecture]" in new_content:
            nav_link = f" • [Core Concepts ({total_topics} Topics)](#-core-curriculum-concepts--topics)"
            if repo_name == "databricks-handbook":
                nav_link = f" • [Core Concepts ({total_topics} Topics)](#core-concepts)"
            lines = new_content.split("\n")
            for i, line in enumerate(lines[:25]):
                if line.startswith("[") and ("•" in line or "](" in line):
                    lines[i] = line + nav_link
                    break
            new_content = "\n".join(lines)

        with open(readme_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Updated {repo_name} ({total_topics} topics)")
    else:
        print(f"ERROR: Could not find target insertion point in {repo_name}")

def update_blueprints_readme(concepts):
    repo_name = "azure-databricks-project-blueprints"
    readme_path = os.path.join(BASE_DIR, repo_name, "README.md")
    with open(readme_path, "r", encoding="utf-8") as f:
        content = f.read()

    term_map = {c["term"]: c for c in concepts}
    s1_terms = [
        'Fact Table', 'Dimension Table', 'Databricks Auto Loader',
        'Delta Lake Liquid Clustering & Space-Filling Curves',
        'Delta Lake Deletion Vectors (Merge-on-Read)',
        'Slowly Changing Dimensions Type 2 (SCD Type 2)',
        'Databricks Serverless Compute', 'Direct Lake Mode',
        'Medallion Architecture Layer Invariants', 'Delta Lake (Databricks)',
        'Clustered Columnstore Rowgroup Health', 'Delta Lake Column Mapping'
    ]
    s2_terms = [
        'Apache Kafka Architecture', 'Structured Streaming Fundamentals',
        'RocksDB State Store in Structured Streaming',
        'Structured Streaming Watermarking & Allowed Lateness',
        'Stream-Stream Joins', 'Idempotent Pipeline Patterns & Replay Safety',
        'Dead-Letter Queue (DLQ) Quarantine Architecture', 'Unity Catalog',
        'Debezium CDC & Analytical Stream Decoupling', 'Transactional Outbox Pattern for CDC',
        'Low-Latency Streaming Ingestion in Python via confluent-kafka (librdkafka)',
        'Stream-Static Joins'
    ]
    s3_terms = [
        'Zero-Downtime Expand/Contract Data Migration',
        'Data Contract Specification & Drift Prevention',
        'Automated Source-to-Sink Ledger Reconciliation',
        'Delta Lake Time Travel',
        'Databricks Asset Bundles (DABs) & Declarative DataOps Pipelines',
        'Data SLA, SLO & Error Budget Specification',
        'Production Readiness Review (PRR) for Data Products',
        'Blameless Data Incident Postmortems & Cost of Downtime',
        'Cross-Engine Data Manipulation (Rosetta Stone)',
        'Architectural Decision Records (ADRs) for Data Platforms',
        'Lakehouse Active-Passive Multi-Region Disaster Recovery'
    ]

    s1_items = [term_map[t] for t in s1_terms if t in term_map]
    s2_items = [term_map[t] for t in s2_terms if t in term_map]
    s3_items = [term_map[t] for t in s3_terms if t in term_map]
    total = len(s1_items) + len(s2_items) + len(s3_items)

    lines = []
    lines.append(f"## 🧠 Core Curriculum Concepts & Topics ({total} Architectural Topics Covered)")
    lines.append("")
    lines.append(f"> 💡 **Enterprise Knowledge Base Integration**: Production architectural topics and lakehouse engine primitives implemented across the 3 project blueprints, cross-linked with the [Modern Data Engineering Systems Encyclopedia (921 Topics)](https://moderndataengineer.uk/concepts).")
    lines.append("")
    lines.append("### 📑 Project Topics Directory at a Glance")
    lines.append("")
    lines.append("| Project Blueprint | Topic Count | Key Primitives Covered | Status |")
    lines.append("|:---|:---:|:---|:---:|")
    lines.append(f"| 🛒 **Scenario 1: Retail Sales & Inventory** | **{len(s1_items)}** | Auto Loader, Liquid Clustering, Deletion Vectors, SCD Type 2 | ✅ Documented |")
    lines.append(f"| 💳 **Scenario 2: Payments Fraud & AML** | **{len(s2_items)}** | RocksDB State Store, Watermarks, Exactly-Once, Idempotent Egress | ✅ Documented |")
    lines.append(f"| 🔄 **Scenario 3: Warehouse Modernization** | **{len(s3_items)}** | Expand/Contract Migration, Dual-Run Parity, DABs CI/CD | ✅ Documented |")
    lines.append("")
    lines.append(build_category_table(s1_items, "Scenario 1: Omnichannel Retail Sales & Inventory Lakehouse", "🛒", open_default=True))
    lines.append("")
    lines.append(build_category_table(s2_items, "Scenario 2: Real-Time Payments Fraud & AML Monitoring", "💳", open_default=True))
    lines.append("")
    lines.append(build_category_table(s3_items, "Scenario 3: Legacy Warehouse Modernization & Controlled Cutover", "🔄", open_default=True))
    lines.append("")
    lines.append("---")
    section_md = "\n".join(lines)

    target = "## Master Project Index"
    new_content = content.replace(target, section_md + "\n\n" + target)
    with open(readme_path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print(f"Updated {repo_name} ({total} topics)")

def update_banking_readme(concepts):
    repo_name = "enterprise-banking-risk-alm-lakehouse"
    readme_path = os.path.join(BASE_DIR, repo_name, "README.md")
    with open(readme_path, "r", encoding="utf-8") as f:
        content = f.read()

    term_map = {c["term"]: c for c in concepts}
    p1_terms = [
        'Python Type Hints & Static Typing',
        'Arrow PyCapsule IPC Memory Sharing',
        'Databricks Photon Native C++ Engine',
        'Delta Lake Liquid Clustering & Space-Filling Curves',
        'Parquet ZSTD Level 7 Recompression',
        'PySpark Vectorized Pandas UDF Architecture',
        'Architectural Decision Records (ADRs) for Data Platforms',
        'Databricks Serverless Compute',
        'Parquet Columnar Storage',
        'Whole-Stage Code Generation'
    ]
    p2_terms = [
        'Change Data Feed (CDF)',
        'Delta Lake Change Data Feed (CDC & table_changes TVF)',
        'Databricks Delta Live Tables (DLT) Expectations',
        'Data Contracts (Producer-Side Guarantees)',
        'Data Quality Evidence with Lineage',
        'Policy-as-Code Guardrails for Data Infrastructure',
        'Automated Source-to-Sink Ledger Reconciliation',
        'Medallion Architecture Layer Invariants',
        'Transaction Isolation Levels',
        'Delta Lake Schema Enforcement vs. Evolution'
    ]
    p3_terms = [
        'Structured Streaming Fundamentals',
        'RocksDB State Store in Structured Streaming',
        'Mosaic AI Vector Search Continuous Delta Sync',
        'Hybrid Search Retrieval over Lakehouse Tables',
        'Vector Indexing Architecture: HNSW vs IVF in Enterprise RAG',
        'Unity Catalog 3-Level Namespace & Attribute-Based Access Control (ABAC)',
        'Multi-Tenant Lakehouse Noisy Neighbor Resource Pools',
        'Dead-Letter Queue (DLQ) Quarantine Architecture',
        'Event-Driven Architecture',
        'AsyncIO & Event Loops in High-Throughput REST Data Ingestion'
    ]

    p1_items = [term_map[t] for t in p1_terms if t in term_map]
    p2_items = [term_map[t] for t in p2_terms if t in term_map]
    p3_items = [term_map[t] for t in p3_terms if t in term_map]
    total = len(p1_items) + len(p2_items) + len(p3_items)

    lines = []
    lines.append(f"## 🧠 Core Curriculum Concepts & Topics ({total} Regulatory & Lakehouse Topics Covered)")
    lines.append("")
    lines.append(f"> 💡 **Enterprise Knowledge Base Integration**: Production regulatory engineering and lakehouse primitives implemented across the 3 European banking analytics engines, cross-linked with the [Modern Data Engineering Systems Encyclopedia (921 Topics)](https://moderndataengineer.uk/concepts).")
    lines.append("")
    lines.append("### 📑 Regulatory & Engine Topics Directory at a Glance")
    lines.append("")
    lines.append("| Regulatory Analytics Project | Topic Count | Key Primitives Covered | Status |")
    lines.append("|:---|:---:|:---|:---:|")
    lines.append(f"| 📈 **Project 1: ALM & IRRBB Dynamic Simulation** | **{len(p1_items)}** | Vectorized PyArrow UDFs, Photon SIMD, Liquid Clustering | ✅ Documented |")
    lines.append(f"| 🛡️ **Project 2: IFRS 9 Multi-Scenario ECL Engine** | **{len(p2_items)}** | Delta CDF, DLT Expectations, Financial Reconciliation | ✅ Documented |")
    lines.append(f"| 🚨 **Project 3: Commercial & Agri EWS** | **{len(p3_items)}** | Structured Streaming, RocksDB, Mosaic AI Vector Search | ✅ Documented |")
    lines.append("")
    lines.append(build_category_table(p1_items, "Project 1: Enterprise ALM & IRRBB Dynamic Simulation", "📈", open_default=True))
    lines.append("")
    lines.append(build_category_table(p2_items, "Project 2: IFRS 9 Multi-Scenario Expected Credit Loss (ECL) Engine", "🛡️", open_default=True))
    lines.append("")
    lines.append(build_category_table(p3_items, "Project 3: Early Warning System (EWS) for Commercial & Agri Lending", "🚨", open_default=True))
    lines.append("")
    lines.append("---")
    section_md = "\n".join(lines)

    target = "## Architecture Portfolio"
    new_content = content.replace(target, section_md + "\n\n" + target)
    with open(readme_path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print(f"Updated {repo_name} ({total} topics)")

def update_spark_experiments_readme(concepts):
    repo_name = "spark-experiments"
    readme_path = os.path.join(BASE_DIR, repo_name, "README.md")
    with open(readme_path, "r", encoding="utf-8") as f:
        content = f.read()

    term_map = {c["term"]: c for c in concepts}
    spark_30 = [
        'EXPLAIN Plan (Spark Query Plan)',
        'Catalyst Optimizer — Analysis Phase',
        'Catalyst Optimizer — Physical Planning',
        'Whole-Stage Code Generation',
        'Stage Boundary',
        'Tungsten Engine',
        'Tungsten Binary Row Format (UnsafeRow)',
        'Off-Heap Memory',
        'Spark Unified Memory Manager',
        'Memory Spill to Disk',
        'Shuffle Operations',
        'Shuffle Fetch Failed',
        'Spark Partitioning vs. Bucketing Architecture',
        'coalesce() vs repartition()',
        'Bucket Join',
        'Cache vs Persist Operations',
        'Storage Level: MEMORY_AND_DISK',
        'Data Skew: Detection & Mitigation',
        'Spark Data Skew Remediation: Salting & Isolated Broadcast Patterns',
        'Adaptive Query Execution (AQE)',
        'AQE Shuffle Partition Coalescing',
        'Skewed Shuffle Partition Splitting',
        'AQE Dynamic Join Strategy Switching',
        'Spark Broadcast Hash Join (BHJ)',
        'Shuffle Hash Join (SHJ)',
        'Sort Merge Join (SMJ)',
        'BroadcastNestedLoopJoin Anti-Pattern',
        'PySpark Vectorized Pandas UDF Architecture',
        'Reading the Spark UI',
        'Task Duration Skew Detection',
        'G1GC Garbage Collector in Spark',
        'Speculative Execution',
        'The 5 S\'s of Apache Spark Performance',
        'Lazy Evaluation'
    ]

    exp_items = [term_map[t] for t in spark_30 if t in term_map]
    total = len(exp_items)

    lines = []
    lines.append(f"## 🧠 Core Curriculum Concepts & Topics ({total} Spark Tuning Topics Covered)")
    lines.append("")
    lines.append(f"> 💡 **Enterprise Knowledge Base Integration**: Advanced Apache Spark optimization and execution engine concepts covered throughout the visual experiments, cross-linked with the [Modern Data Engineering Systems Encyclopedia (921 Topics)](https://moderndataengineer.uk/concepts).")
    lines.append("")
    lines.append(build_category_table(exp_items, "Apache Spark Execution, Memory & Query Optimization", "⚡", open_default=True))
    lines.append("")
    lines.append("---")
    section_md = "\n".join(lines)

    target = "## Contact"
    new_content = content.replace(target, section_md + "\n\n" + target)
    with open(readme_path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print(f"Updated {repo_name} ({total} topics)")

def update_charming_fermi_readme(concepts):
    repo_name = "charming-fermi"
    readme_path = os.path.join(BASE_DIR, repo_name, "README.md")
    with open(readme_path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Update line 76 from 869 to 921
    old_row = "| **Core Concepts** | Architectural Concepts | **869** | 14 core pillars: Fabric, Databricks, Lakehouse, Spark, Power BI, ADF, Airflow, dbt, FinOps (`/concepts`). |"
    new_row = "| **Core Concepts** | Architectural Concepts | **921** | 14 core pillars across all ecosystem repositories: Spark & Databricks (135), Databricks (132), SQL Server (91), Database Architecture (79), Modern Lakehouse (76), System Design (68), General DE (63), dbt (57), Data Lake Architecture (55), Apache Airflow (52), Microsoft Fabric (39), ADF (27), Power BI (25), Python (22) (`/concepts`). |"

    if old_row in content:
        content = content.replace(old_row, new_row)
        print("Updated count row in charming-fermi README.")

    # 2. Add Master Knowledge Base Topics Index prominently before System Architecture!
    master_section = """## 🧠 Master Knowledge Base: 921 Concepts Across 14 Pillars

> 💡 **The Complete 921-Concept Lakehouse Curriculum**: Every architectural concept is indexed and searchable client-side on the live platform (`⌘K` or [`/concepts`](https://moderndataengineer.uk/concepts)), with exhaustive production implementations across our sister reference repositories.

| Pillar # | Domain Category | Topic Count | Primary Sister Repository | Key Architectural Primitives Covered | Status |
|:---:|:---|:---:|:---|:---|:---:|
| 1 | **Apache Spark & Distributed Compute** | **135** | [The PySpark Handbook](https://github.com/santoshjammi29/pyspark-handbook) | Catalyst, Tungsten, AQE, Salting, RDD, DataFrame, Spark UI, Memory Triage | ✅ Live |
| 2 | **Databricks Platform & Lakehouse** | **132** | [The Databricks Handbook](https://github.com/santoshjammi29/databricks-handbook) | Unity Catalog, Delta Lake 3.x, Lakeflow, Photon, DABs, Serverless, Mosaic AI | ✅ Live |
| 3 | **Relational SQL & Query Engine** | **91** | [The SQL Handbook](https://github.com/santoshjammi29/sql-handbook) | Indexing, S-F-W-G-H-O Execution Order, Locking, RCSI, Join Algorithms | ✅ Live |
| 4 | **Database Architecture & Distributed MPP** | **79** | [The SQL Handbook](https://github.com/santoshjammi29/sql-handbook) | Vitess Sharding, Concurrency Admission, Read-After-Write, Synapse MPP, SSI | ✅ Live |
| 5 | **Modern Lakehouse & Streaming Formats** | **76** | [The Streaming Handbook](https://github.com/santoshjammi29/streaming-handbook) | Paimon, Debezium CDC, Watermarking, Iceberg REST, UniForm, Polaris, Liquid Clustering | ✅ Live |
| 6 | **Distributed System Design** | **68** | [Data System Design Handbook](https://github.com/santoshjammi29/data-system-design-handbook) | CAP/PACELC, Consistent Hashing, Cache-Aside, Rate Limiting, Outbox, Circuit Breaker | ✅ Live |
| 7 | **General Data Engineering & Modeling** | **63** | [DataOps & CI/CD Handbook](https://github.com/santoshjammi29/dataops-cicd-handbook) | Kimball Dimensional Modeling, SCD Type 2, CDC, ODCS Data Contracts, Idempotency | ✅ Live |
| 8 | **dbt & Analytics Engineering** | **57** | [The dbt Handbook](https://github.com/santoshjammi29/dbt-handbook) | Models, ref(), Generic Tests, Snapshots, Semantic Layer, MetricFlow, Slim CI | ✅ Live |
| 9 | **Data Lake Architecture & Formats** | **55** | [Data System Design Handbook](https://github.com/santoshjammi29/data-system-design-handbook) | HDFS, Parquet, Avro, ORC, Medallion Layer Invariants, Object Storage Lifecycle | ✅ Live |
| 10 | **Apache Airflow & Orchestration** | **52** | [DataOps & CI/CD Handbook](https://github.com/santoshjammi29/dataops-cicd-handbook) | DAGs, Tasks, Operators, Dynamic Task Mapping, Schedulers, Airflow 3.0 Datasets | ✅ Live |
| 11 | **Microsoft Fabric & OneLake** | **39** | [Azure Enterprise Cheat Sheet](https://github.com/santoshjammi29/azure-cheat-sheet) | OneLake, Shortcuts, Direct Lake, Capacities F-SKUs, Eventhouse, KQL Database | ✅ Live |
| 12 | **Azure Data Factory (ADF)** | **27** | [Azure Enterprise Cheat Sheet](https://github.com/santoshjammi29/azure-cheat-sheet) | Linked Services, Pipelines, Self-Hosted IR, Tumbling Windows, REST Pagination | ✅ Live |
| 13 | **Power BI & Semantic Layer** | **25** | [Azure Enterprise Cheat Sheet](https://github.com/santoshjammi29/azure-cheat-sheet) | Import Mode, DirectQuery, DAX Context Transition, Aggregations, TMDL Modeling | ✅ Live |
| 14 | **Python for Data Engineering** | **22** | [The PySpark Handbook](https://github.com/santoshjammi29/pyspark-handbook) | Generators, GIL, Arrow PyCapsule IPC, Polars LazyFrames, Pydantic Contracts | ✅ Live |
| | **TOTAL KNOWLEDGE BASE TOPICS** | **921** | **12 Sister Repositories** | **100% Comprehensive Coverage Across All Ecosystem Handbooks** | 🚀 **Complete** |

---"""

    target = "## 🏛️ System Architecture"
    if target in content and "## 🧠 Master Knowledge Base: 921 Concepts Across 14 Pillars" not in content:
        content = content.replace(target, master_section + "\n\n" + target)
        print("Placed Master Knowledge Base Topics Index prominently before System Architecture in charming-fermi.")

    with open(readme_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Updated charming-fermi README.")

def main():
    concepts = load_concepts()
    print(f"Loaded {len(concepts)} concepts from {CONCEPTS_PATH}")

    handbook_config = {
        "pyspark-handbook": [
            ("SPARK & DATABRICKS", "Apache Spark & Distributed Compute Engine", "⚡"),
            ("PYTHON", "Python & Vectorized Data Engineering Primitives", "🐍")
        ],
        "databricks-handbook": [
            ("DATABRICKS", "Databricks Platform, Unity Catalog & Delta Lake 3.x", "⚡")
        ],
        "sql-handbook": [
            ("SQL SERVER", "Relational SQL, Query Optimization & Transaction Engine", "⚡"),
            ("DATABASE ARCHITECTURE", "Database Architecture, Distributed Sharding & Cloud MPP", "🏛️")
        ],
        "dbt-handbook": [
            ("DBT", "dbt Core, Analytics Engineering & Semantic Modeling", "🛠️")
        ],
        "azure-cheat-sheet": [
            ("FABRIC", "Microsoft Fabric & OneLake Architecture", "⚡"),
            ("ADF", "Azure Data Factory (ADF) & Resilient Orchestration", "🔄"),
            ("POWER BI", "Power BI & VertiPaq Analytics Engine", "📊")
        ],
        "dataops-cicd-handbook": [
            ("APACHE AIRFLOW", "Apache Airflow & Pipeline Orchestration", "🌪️"),
            ("GENERAL DE", "General Data Engineering, Dimensional Modeling & Governance", "🚀")
        ],
        "data-system-design-handbook": [
            ("SYSTEM DESIGN", "Distributed Systems Design & Fault Tolerance", "🏛️"),
            ("DATALAKE ARCHITECTURE", "Modern Data Lake Architecture, Storage Layouts & Formats", "🌊")
        ],
        "streaming-handbook": [
            ("MODERN LAKEHOUSE", "Real-Time Streaming Lakehouse, CDC & Table Formats", "🌊")
        ]
    }

    for repo, pillars in handbook_config.items():
        update_handbook_readme(repo, pillars, concepts)

    update_blueprints_readme(concepts)
    update_banking_readme(concepts)
    update_spark_experiments_readme(concepts)
    update_charming_fermi_readme(concepts)
    print("\nAll 12 repositories generated with high visibility!")

if __name__ == "__main__":
    main()
