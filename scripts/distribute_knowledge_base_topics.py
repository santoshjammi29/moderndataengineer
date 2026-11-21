#!/usr/bin/env python3
"""
Distribute Knowledge Base Topics across Git Repositories
Covers all 921 concepts from src/data/json/data_concepts.json into the beginning of each repository.
Formats Level with icon above and text below (<icon><br><text>).
Sorts topics by increasing order of difficulty (EASY -> MEDIUM -> HARD -> ARCHITECT).
Keeps all <details> minimized by default.
"""

import json
import os
import re
import subprocess
import sys

BASE_DIR = "/Users/santosh/Documents/antigravity"
CONCEPTS_PATH = os.path.join(BASE_DIR, "charming-fermi/src/data/json/data_concepts.json")

DIFF_ORDER = {
    "EASY": 1,
    "MEDIUM": 2,
    "HARD": 3,
    "ARCHITECT": 4
}

def load_concepts():
    with open(CONCEPTS_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def format_level(diff):
    d = (diff or "").upper()
    if d == "EASY":
        return "🟢<br>Easy"
    if d == "MEDIUM":
        return "🟡<br>Intermediate"
    if d == "HARD":
        return "🔴<br>Advanced"
    if d == "ARCHITECT":
        return "🟣<br>Architect"
    return "🟡<br>Intermediate"

def escape_cell(text):
    if not text:
        return ""
    return text.replace("|", "\\|").replace("\n", " ").strip()

def build_category_table(items, title, icon="📚"):
    # Sort strictly by increasing order of difficulty, then alphabetically by term
    sorted_items = sorted(
        items,
        key=lambda c: (
            DIFF_ORDER.get((c.get("difficulty") or "").upper(), 2),
            c.get("term", "").lower()
        )
    )

    lines = []
    # By default keep minimized (no "open" attribute on <details>)
    lines.append("<details>")
    lines.append(f"<summary><b>{icon} {title} ({len(sorted_items)} Topics)</b> — <i>Click to expand topic index (sorted by difficulty)</i></summary>")
    lines.append("")
    lines.append("| # | Topic / Concept | Level | Architectural Definition & Core Principle |")
    lines.append("|:---:|---|:---:|---|")
    for idx, c in enumerate(sorted_items, 1):
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
    lines.append(f"> 💡 **Enterprise Knowledge Base Integration**: This repository implements **{total_topics} production topics** from the [Modern Data Engineering Systems Encyclopedia (921 Topics)](https://moderndataengineer.uk/concepts), arranged in increasing order of difficulty. Browse the full curriculum in [`topics/README.md`](topics/README.md).")
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
        lines.append(build_category_table(matching, pillar_title, icon))
        lines.append("")

    lines.append("---")
    return "\n".join(lines)

def replace_or_insert_section(readme_path, new_section_md, target_fallback=None):
    with open(readme_path, "r", encoding="utf-8") as f:
        content = f.read()

    section_pattern = re.compile(r'(?:<a id="[^"]+"></a>\s*)?## 🧠 Core Curriculum Concepts & Topics.*?\n---\n', re.DOTALL)
    if section_pattern.search(content):
        new_content = section_pattern.sub(new_section_md + "\n", content, count=1)
        with open(readme_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        return True
    elif target_fallback and target_fallback in content:
        new_content = content.replace(target_fallback, new_section_md + "\n\n" + target_fallback)
        with open(readme_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        return True
    else:
        print(f"ERROR: Could not find section or fallback in {readme_path}")
        return False

def update_handbook_readme(repo_name, pillars, concepts):
    readme_path = os.path.join(BASE_DIR, repo_name, "README.md")
    repo_cats = [p[0] for p in pillars]
    total_topics = sum(len([c for c in concepts if c["category"] == cat]) for cat in repo_cats)

    anchor = "core-concepts" if repo_name == "databricks-handbook" else None
    section_md = build_handbook_section(repo_name, pillars, total_topics, concepts, anchor)

    if replace_or_insert_section(readme_path, section_md, "## 🎯 Overview & Mission"):
        print(f"Updated {repo_name} ({total_topics} topics)")

def update_blueprints_readme(concepts):
    repo_name = "azure-databricks-project-blueprints"
    readme_path = os.path.join(BASE_DIR, repo_name, "README.md")

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
    lines.append(f"> 💡 **Enterprise Knowledge Base Integration**: Production architectural topics and lakehouse engine primitives implemented across the 3 project blueprints, cross-linked with the [Modern Data Engineering Systems Encyclopedia (921 Topics)](https://moderndataengineer.uk/concepts), arranged in increasing order of difficulty. Browse the full curriculum in [`topics/README.md`](topics/README.md).")
    lines.append("")
    lines.append("### 📑 Project Topics Directory at a Glance")
    lines.append("")
    lines.append("| Project Blueprint | Topic Count | Key Primitives Covered | Status |")
    lines.append("|:---|:---:|:---|:---:|")
    lines.append(f"| 🛒 **Scenario 1: Retail Sales & Inventory** | **{len(s1_items)}** | Auto Loader, Liquid Clustering, Deletion Vectors, SCD Type 2 | ✅ Documented |")
    lines.append(f"| 💳 **Scenario 2: Payments Fraud & AML** | **{len(s2_items)}** | RocksDB State Store, Watermarks, Exactly-Once, Idempotent Egress | ✅ Documented |")
    lines.append(f"| 🔄 **Scenario 3: Warehouse Modernization** | **{len(s3_items)}** | Expand/Contract Migration, Dual-Run Parity, DABs CI/CD | ✅ Documented |")
    lines.append("")
    lines.append(build_category_table(s1_items, "Scenario 1: Omnichannel Retail Sales & Inventory Lakehouse", "🛒"))
    lines.append("")
    lines.append(build_category_table(s2_items, "Scenario 2: Real-Time Payments Fraud & AML Monitoring", "💳"))
    lines.append("")
    lines.append(build_category_table(s3_items, "Scenario 3: Legacy Warehouse Modernization & Controlled Cutover", "🔄"))
    lines.append("")
    lines.append("---")
    section_md = "\n".join(lines)

    if replace_or_insert_section(readme_path, section_md, "## Master Project Index"):
        print(f"Updated {repo_name} ({total} topics)")

def update_banking_readme(concepts):
    repo_name = "enterprise-banking-risk-alm-lakehouse"
    readme_path = os.path.join(BASE_DIR, repo_name, "README.md")

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
    lines.append(f"> 💡 **Enterprise Knowledge Base Integration**: Production regulatory engineering and lakehouse primitives implemented across the 3 European banking analytics engines, cross-linked with the [Modern Data Engineering Systems Encyclopedia (921 Topics)](https://moderndataengineer.uk/concepts), arranged in increasing order of difficulty. Browse the full curriculum in [`topics/README.md`](topics/README.md).")
    lines.append("")
    lines.append("### 📑 Regulatory & Engine Topics Directory at a Glance")
    lines.append("")
    lines.append("| Regulatory Analytics Project | Topic Count | Key Primitives Covered | Status |")
    lines.append("|:---|:---:|:---|:---:|")
    lines.append(f"| 📈 **Project 1: ALM & IRRBB Dynamic Simulation** | **{len(p1_items)}** | Vectorized PyArrow UDFs, Photon SIMD, Liquid Clustering | ✅ Documented |")
    lines.append(f"| 🛡️ **Project 2: IFRS 9 Multi-Scenario ECL Engine** | **{len(p2_items)}** | Delta CDF, DLT Expectations, Financial Reconciliation | ✅ Documented |")
    lines.append(f"| 🚨 **Project 3: Commercial & Agri EWS** | **{len(p3_items)}** | Structured Streaming, RocksDB, Mosaic AI Vector Search | ✅ Documented |")
    lines.append("")
    lines.append(build_category_table(p1_items, "Project 1: Enterprise ALM & IRRBB Dynamic Simulation", "📈"))
    lines.append("")
    lines.append(build_category_table(p2_items, "Project 2: IFRS 9 Multi-Scenario Expected Credit Loss (ECL) Engine", "🛡️"))
    lines.append("")
    lines.append(build_category_table(p3_items, "Project 3: Early Warning System (EWS) for Commercial & Agri Lending", "🚨"))
    lines.append("")
    lines.append("---")
    section_md = "\n".join(lines)

    if replace_or_insert_section(readme_path, section_md, "## Architecture Portfolio"):
        print(f"Updated {repo_name} ({total} topics)")

def update_spark_experiments_readme(concepts):
    repo_name = "spark-experiments"
    readme_path = os.path.join(BASE_DIR, repo_name, "README.md")

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
    lines.append(f"> 💡 **Enterprise Knowledge Base Integration**: Advanced Apache Spark optimization and execution engine concepts covered throughout the visual experiments, cross-linked with the [Modern Data Engineering Systems Encyclopedia (921 Topics)](https://moderndataengineer.uk/concepts), arranged in increasing order of difficulty. Browse the full curriculum in [`topics/README.md`](topics/README.md).")
    lines.append("")
    lines.append("### 📑 Spark Experiments Topics Directory at a Glance")
    lines.append("")
    lines.append("| Focus Domain | Topic Count | Core Primitives Covered | Status |")
    lines.append("|:---|:---:|:---|:---:|")
    lines.append(f"| ⚡ **Spark Internals & Tuning** | **{total}** | Catalyst Optimizer, Tungsten Off-Heap, AQE, Data Skew Salting | ✅ Documented |")
    lines.append("")
    lines.append(build_category_table(exp_items, "Apache Spark Execution, Memory & Query Optimization", "⚡"))
    lines.append("")
    lines.append("---")
    section_md = "\n".join(lines)

    if replace_or_insert_section(readme_path, section_md, "## Contact"):
        print(f"Updated {repo_name} ({total} topics)")

def update_security_handbook_readme(concepts):
    repo_name = "security-handbook"
    readme_path = os.path.join(BASE_DIR, repo_name, "README.md")
    term_map = {c["term"]: c for c in concepts}

    p1_terms = [
        'Databricks Secrets', 'Databricks Secret Scopes (Azure Key Vault)', 'Secrets Management',
        'Custom Secret Backends', 'Airflow Connection Secrets Backend', 'Token Bucket Algorithm',
        'Token Bucket Rate Limiting Algorithm'
    ]
    p2_terms = [
        'Managed Virtual Network (Managed VNet)', 'Managed Private Endpoints',
        'ADF Managed Private Endpoint Provisioning & Timeout Bypass'
    ]
    p3_terms = [
        'Unity Catalog', 'Unity Catalog Architecture', 'Unity Catalog Enterprise Governance',
        'Unity Catalog Fine-Grained Access Control', 'Unity Catalog 3-Level Namespace & Attribute-Based Access Control (ABAC)',
        'Dynamic Views for Security', 'Unity Catalog Dynamic Row Filters & Column Masks',
        'Unity Catalog Dynamic Column Masking & Row Filters', 'Attribute-Based Dynamic Column Masking (ABAC)',
        'Row-Level Security (RLS)', 'Object-Level Security (OLS) & Dynamic RLS at Scale',
        'Unity Catalog Volumes (Managed vs. External)'
    ]
    p4_terms = [
        'Audit Logging', 'Unity Catalog System Tables', 'Unity Catalog System Tables for Lakehouse FinOps',
        'Data Lineage', 'Unity Catalog Lineage Tracking', 'OpenLineage Operational Telemetry Standard',
        'OpenLineage Standard Operational Run Facets', 'Data Quality Evidence with Lineage',
        'Column-Level Encryption & Tokenization (FPE)', 'Temporal Tables & Point-In-Time Bi-Temporal Auditing',
        'Data Mesh Federated Governance & Data Product Contracts (ODCS)', 'Data Mesh Federated Governance',
        'Governance with Unity Catalog + Purview', 'Purview Metadata Enrichment & Non-Destructive Cataloging',
        'Delta Lake VACUUM & Retention Governance', 'FinOps Cost Attribution Matrix for Shared Catalogs'
    ]

    p1_items = [term_map[t] for t in p1_terms if t in term_map]
    p2_items = [term_map[t] for t in p2_terms if t in term_map]
    p3_items = [term_map[t] for t in p3_terms if t in term_map]
    p4_items = [term_map[t] for t in p4_terms if t in term_map]
    total = len(p1_items) + len(p2_items) + len(p3_items) + len(p4_items)

    lines = []
    lines.append(f"## 🧠 Core Curriculum Concepts & Topics ({total} Security & Governance Topics Covered)")
    lines.append("")
    lines.append(f"> 💡 **Enterprise Knowledge Base Integration**: Core zero-trust, identity, encryption, and governance primitives implemented throughout the security handbook, cross-linked with the [Modern Data Engineering Systems Encyclopedia (921 Topics)](https://moderndataengineer.uk/concepts), arranged in increasing order of difficulty. Browse the full curriculum in [`topics/README.md`](topics/README.md).")
    lines.append("")
    lines.append("### 📑 Security & Governance Topics Directory at a Glance")
    lines.append("")
    lines.append("| Security Pillar | Topic Count | Key Core Primitives Covered | Status |")
    lines.append("|:---|:---:|:---|:---:|")
    lines.append(f"| 🔐 **Zero-Trust Identity & Secrets** | **{len(p1_items)}** | Databricks Secrets, Key Vault Scopes, Airflow Secrets, Token Bucket | ✅ Documented |")
    lines.append(f"| 🌐 **Perimeter & Network Isolation** | **{len(p2_items)}** | Managed VNets, Managed Private Endpoints, Private Link | ✅ Documented |")
    lines.append(f"| 🏛️ **Unity Catalog & Access Control** | **{len(p3_items)}** | 3-Level Namespaces, Dynamic Row Filters & Column Masks, ABAC | ✅ Documented |")
    lines.append(f"| 📜 **Lineage, Audit & Governance** | **{len(p4_items)}** | OpenLineage, System Tables, Purview Metadata, Bi-Temporal Auditing | ✅ Documented |")
    lines.append("")
    lines.append(build_category_table(p1_items, "Zero-Trust Identity, Authentication & Secrets Management", "🔐"))
    lines.append("")
    lines.append(build_category_table(p2_items, "Cloud Network Isolation & Perimeter Defense", "🌐"))
    lines.append("")
    lines.append(build_category_table(p3_items, "Unity Catalog, Fine-Grained Access Control & Dynamic Data Masking", "🏛️"))
    lines.append("")
    lines.append(build_category_table(p4_items, "Data Lineage, Auditing & Regulatory Governance", "📜"))
    lines.append("")
    lines.append("---")
    section_md = "\n".join(lines)

    if replace_or_insert_section(readme_path, section_md, "## 📚 Curriculum Modules Overview"):
        print(f"Updated {repo_name} ({total} topics)")

def update_interview_handbook_readme(concepts):
    repo_name = "data-engineering-interview-handbook"
    readme_path = os.path.join(BASE_DIR, repo_name, "README.md")

    categories = [
        ("SPARK & DATABRICKS", "Apache Spark & Distributed Compute Engine", "⚡"),
        ("DATABRICKS", "Databricks Platform, Unity Catalog & Delta Lake 3.x", "⚡"),
        ("MODERN LAKEHOUSE", "Real-Time Streaming Lakehouse, CDC & Table Formats", "🌊"),
        ("DATALAKE ARCHITECTURE", "Modern Data Lake Architecture, Storage Layouts & Formats", "🌊"),
        ("APACHE AIRFLOW", "Apache Airflow & Pipeline Orchestration", "🌪️"),
        ("ADF", "Azure Data Factory (ADF) & Resilient Orchestration", "🔄"),
        ("DBT", "dbt Core, Analytics Engineering & Semantic Modeling", "🛠️"),
        ("FABRIC", "Microsoft Fabric & OneLake Architecture", "⚡"),
        ("DATABASE ARCHITECTURE", "Database Architecture, Distributed Sharding & Cloud MPP", "🏛️"),
        ("SQL SERVER", "Relational SQL, Query Optimization & Transaction Engine", "⚡"),
        ("PYTHON", "Python & Vectorized Data Engineering Primitives", "🐍"),
        ("GENERAL DE", "General Data Engineering, Dimensional Modeling & Governance", "🚀"),
        ("POWER BI", "Power BI & VertiPaq Analytics Engine", "📊"),
        ("SYSTEM DESIGN", "Distributed Systems Design & Fault Tolerance", "🏛️")
    ]

    total_topics = len(concepts)

    lines = []
    lines.append(f"## 🧠 Core Curriculum Concepts & Topics ({total_topics} Interview Defense Topics Covered)")
    lines.append("")
    lines.append(f"> 💡 **Enterprise Knowledge Base Integration**: This handbook provides production-grade architectural defense, internal mechanics, and code implementations across **all {total_topics} verified concepts** from the [Modern Data Engineering Systems Encyclopedia (921 Topics)](https://moderndataengineer.uk/concepts), arranged in increasing order of difficulty. Browse the full curriculum in [`topics/README.md`](topics/README.md).")
    lines.append("")
    lines.append("### 📑 Technical Curriculum Topics Directory at a Glance")
    lines.append("")
    lines.append("| Knowledge Pillar Domain | Topic Count | Sample Core Primitives Covered | Status |")
    lines.append("|:---|:---:|:---|:---:|")

    for cat_name, pillar_title, icon in categories:
        matching = [c for c in concepts if c["category"] == cat_name]
        sample_terms = ", ".join([c["term"] for c in matching[:4]]) + f", and {len(matching)-4} more"
        lines.append(f"| {icon} **{pillar_title}** | **{len(matching)}** | {sample_terms} | ✅ Fully Documented |")
    lines.append("")

    for cat_name, pillar_title, icon in categories:
        matching = [c for c in concepts if c["category"] == cat_name]
        lines.append(build_category_table(matching, pillar_title, icon))
        lines.append("")

    lines.append("---")
    section_md = "\n".join(lines)

    if replace_or_insert_section(readme_path, section_md, "## 🌐 The Modern Data Engineering Lakehouse Ecosystem (14 Repositories)"):
        print(f"Updated {repo_name} ({total_topics} topics)")

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
    update_security_handbook_readme(concepts)
    update_interview_handbook_readme(concepts)
    print("\nAll repositories updated with sorted topics and minimized details!")

if __name__ == "__main__":
    main()
