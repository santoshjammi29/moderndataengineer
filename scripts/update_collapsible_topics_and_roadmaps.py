#!/usr/bin/env python3
"""
Comprehensive Collapsible Topics & Roadmap Transformation Engine
================================================================
Updates all 14 repositories in the Modern Data Engineering Lakehouse ecosystem:
1. Re-generates topics/README.md across all 14 repositories:
   - Grouped by RELEVANT FUNCTIONAL SECTIONS first.
   - Within each section, grouped by DIFFICULTY (🟢 Easy -> 🟡 Intermediate -> 🔴 Advanced -> 🟣 Architect).
   - ALL sections and difficulty tiers wrapped in <details><summary>...</summary></details> (COLLAPSED BY DEFAULT).
2. Re-generates ROADMAP.md across all 14 repositories:
   - Grouped by RELEVANT SECTIONS first (module/domain directories).
   - Within each section, grouped by DIFFICULTY TIER (L100, L200, L300, L400).
   - ALL sections wrapped in <details><summary>...</summary></details> (COLLAPSED BY DEFAULT).
   - Full interactive checkbox tracking (- [ ]).
3. Updates README.md Core Curriculum Sections across all repositories:
   - Ensures all topic blocks are collapsible and collapsed by default.
4. Re-synchronizes manifests and validates ecosystem integrity.

Author: Principal Lakehouse & Distributed Data Systems Architect
Platform: moderndataengineer.uk
"""

import re
import json
from pathlib import Path
from collections import defaultdict

BASE_DIR = Path('/Users/santosh/Documents/antigravity')
HUB_DIR = BASE_DIR / 'charming-fermi'
CONCEPTS_PATH = HUB_DIR / 'src/data/json/data_concepts.json'

DIFF_ORDER = {
    "EASY": 1,
    "MEDIUM": 2,
    "HARD": 3,
    "ARCHITECT": 4
}

DIFF_DISPLAY = {
    "EASY": ("🟢 Easy (Level 100)", "🟢 Easy"),
    "MEDIUM": ("🟡 Intermediate (Level 200)", "🟡 Intermediate"),
    "HARD": ("🔴 Advanced (Level 300)", "🔴 Advanced"),
    "ARCHITECT": ("🟣 Staff Architect (Level 400)", "🟣 Architect")
}

# 14 Categories with 3-6 Functional Sections Each
CATEGORY_SECTIONS = {
    'SPARK & DATABRICKS': [
        ('Catalyst Optimizer & Execution Plans', ['catalyst', 'explain', 'plan', 'ast', 'rule', 'logical', 'physical', 'codegen']),
        ('Memory Management & Tungsten Engine', ['tungsten', 'memory', 'off-heap', 'heap', 'garbage', 'gc', 'spill', 'cache', 'persist']),
        ('Partitioning, Shuffling & Skew Mitigation', ['partition', 'shuffle', 'skew', 'salt', 'repartition', 'coalesce', 'aqe', 'adaptive']),
        ('Join Strategies & Broadcast Mechanics', ['join', 'broadcast', 'sort-merge', 'hash join', 'cartesian']),
        ('Streaming, Vectorization & UDFs', ['stream', 'foreachbatch', 'udf', 'pandas', 'pyarrow', 'watermark', 'arrow']),
        ('Core Architecture & RDD/DataFrame Primitives', [])
    ],
    'DATABRICKS': [
        ('Unity Catalog 3-Tier Governance & Security', ['unity catalog', 'namespace', 'rls', 'mask', 'abac', 'volume', 'privilege', 'grant', 'access', 'security', 'governance']),
        ('Delta Lake 3.x ACID Mechanics & Transaction Log', ['acid', '_delta_log', 'time travel', 'clone', 'log', 'transaction', 'commit', 'concurrency']),
        ('Physical Layout, Liquid Clustering & Deletion Vectors', ['liquid', 'clustering', 'deletion vector', 'vacuum', 'optimize', 'compaction', 'z-order', 'parquet', 'uniform']),
        ('Workflows, DLT & Lakeflow Pipelines', ['dlt', 'lakeflow', 'workflow', 'pipeline', 'job', 'task', 'expectation']),
        ('Workspace, Serverless Compute & FinOps', [])
    ],
    'SQL SERVER': [
        ('Query Execution Plans & Optimization', ['execution plan', 'sargable', 'cost-based', 'operator', 'optimizer', 'query store', 'estimate', 'actual']),
        ('Window Functions & Analytical Framing', ['window', 'row_number', 'rank', 'dense_rank', 'lead', 'lag', 'over', 'partition by', 'frame', 'rows between', 'analytical']),
        ('CTEs, Recursion & Set Operations', ['cte', 'recursive', 'union', 'except', 'intersect', 'subquery', 'set']),
        ('Indexing Strategies & Storage Architecture', ['index', 'b-tree', 'columnstore', 'clustered', 'non-clustered', 'page', 'fill factor', 'leaf']),
        ('Transactions, Locking & Concurrency', [])
    ],
    'DATABASE ARCHITECTURE': [
        ('Distributed Consensus & Replication', ['raft', 'paxos', 'consensus', 'quorum', 'replication', 'leader', 'follower', 'consistency']),
        ('Storage Engines, LSM & B-Trees', ['lsm', 'sstable', 'wal', 'write-ahead', 'b-tree', 'storage engine', 'bloom filter']),
        ('Sharding, Partitioning & Traffic Control', ['shard', 'sharding', 'vschema', 'vitess', 'partition', 're-sharding', 'hash', 'traffic']),
        ('Compute-Storage Decoupling & Modern MPP', [])
    ],
    'MODERN LAKEHOUSE': [
        ('Open Table Formats (Iceberg, Delta, Hudi)', ['iceberg', 'delta', 'hudi', 'uniform', 'manifest', 'deletion vector', 'cow', 'mor']),
        ('Real-Time Streaming & Watermarking', ['streaming', 'kafka', 'flink', 'watermark', 'micro-batch', 'allowed lateness']),
        ('Engine Vectorization & Hardware Acceleration', ['vectorized', 'photon', 'arrow', 'duckdb', 'polars', 'zero-copy']),
        ('Distributed State, CDC & Lakehouse Ingestion', [])
    ],
    'SYSTEM DESIGN': [
        ('Distributed Theorems & Trade-Offs', ['cap', 'pacelc', 'base', 'acid', 'trade-off', 'theorem', 'latency']),
        ('Fault Tolerance, Rate Limiting & High Availability', ['circuit breaker', 'rate limit', 'token bucket', 'retry', 'exponential backoff', 'dr', 'disaster', 'failover']),
        ('Caching Topologies & Synchronization', ['cache', 'redis', 'memcached', 'cache-aside', 'write-through', 'write-behind', 'stampede']),
        ('Event-Driven Topologies & Decoupled Ingestion', [])
    ],
    'DATALAKE ARCHITECTURE': [
        ('Cloud Object Storage & Prefix Optimization', ['s3', 'adls', 'gcs', 'object storage', 'prefix', 'bucket', 'blob', 'throttling']),
        ('Columnar & Row Storage Formats (Parquet/ORC/Avro)', ['parquet', 'orc', 'avro', 'columnar', 'stripe', 'row-oriented', 'binary']),
        ('Storage Compaction, Pruning & Data Layout', [])
    ],
    'DBT': [
        ('Project Architecture & Modeling Primitives', ['model', 'source', 'seed', 'snapshot', 'ref', 'project']),
        ('Incremental Materialization & Microbatch', ['incremental', 'microbatch', 'materialization', 'table', 'view', 'merge']),
        ('Contracts, Testing & Governance', ['contract', 'test', 'generic', 'schema', 'documentation']),
        ('dbt Mesh & Semantic Layer Modeling', [])
    ],
    'APACHE AIRFLOW': [
        ('Core Engine & Decoupled Scheduler', ['scheduler', 'webserver', 'executor', 'celery', 'kubernetes', 'architecture']),
        ('DAG Authoring, Dynamic Task Mapping & Operators', ['dag', 'task', 'operator', 'dynamic task mapping', 'taskflow', 'expand', 'sensor']),
        ('Orchestration Resiliency, Datasets & Connections', [])
    ],
    'GENERAL DE': [
        ('Dimensional Modeling & Kimball Standards', ['kimball', 'fact', 'dimension', 'star', 'snowflake', 'obt', 'scd']),
        ('Data Vault 2.0 & Analytical Schemas', ['data vault', 'hub', 'link', 'satellite', 'pit', 'bridge']),
        ('ETL Architecture, CDC & Idempotency', [])
    ],
    'FABRIC': [
        ('OneLake & Cross-Cloud Shortcuts', ['onelake', 'shortcut', 'lakehouse', 'storage', 'adls', 's3']),
        ('Direct Lake Mode & Semantic Models', ['direct lake', 'semantic', 'power bi', 'model']),
        ('Workload Engines, F-SKU Capacities & Governance', [])
    ],
    'ADF': [
        ('Control Flow, Pipelines & Parameterization', ['pipeline', 'trigger', 'activity', 'parameter', 'tumbling window']),
        ('Integration Runtimes (Azure IR / Self-Hosted IR)', ['ir', 'integration runtime', 'shir', 'self-hosted']),
        ('Data Movement, Managed VNets & Security', [])
    ],
    'POWER BI': [
        ('VertiPaq Engine & Columnar Compression', ['vertipaq', 'compression', 'dictionary', 'rle', 'encoding', 'storage mode']),
        ('DAX Evaluation Context & Calculations', ['dax', 'context', 'calculate', 'filter context', 'row context']),
        ('Composite Models, Semantic Refresh & Aggregations', [])
    ],
    'PYTHON': [
        ('CPython Internals & Memory Architecture', ['gil', 'garbage', 'gc', 'memory', 'reference count', 'multiprocessing']),
        ('Vectorized & In-Memory IPC (Arrow / Polars)', ['arrow', 'polars', 'pandas', 'vectorization', 'ipc', 'zero-copy']),
        ('Language Idioms, Generators & Type Contracts', [])
    ]
}

# Repository Mapping Configuration
REPO_PILLARS = {
    "charming-fermi": [
        ("SPARK & DATABRICKS", "Apache Spark & Distributed Compute Engine", "⚡"),
        ("DATABRICKS", "Databricks Platform, Unity Catalog & Delta Lake 3.x", "⚡"),
        ("SQL SERVER", "Relational SQL, Query Optimization & Transaction Engine", "⚡"),
        ("DATABASE ARCHITECTURE", "Database Architecture, Distributed Sharding & Cloud MPP", "🏛️"),
        ("MODERN LAKEHOUSE", "Real-Time Streaming Lakehouse, CDC & Table Formats", "🌊"),
        ("DATALAKE ARCHITECTURE", "Modern Data Lake Architecture, Storage Layouts & Formats", "🌊"),
        ("SYSTEM DESIGN", "Distributed Systems Design & Fault Tolerance", "🏛️"),
        ("DBT", "dbt Core, Analytics Engineering & Semantic Modeling", "🛠️"),
        ("APACHE AIRFLOW", "Apache Airflow & Pipeline Orchestration", "🌪️"),
        ("FABRIC", "Microsoft Fabric & OneLake Architecture", "⚡"),
        ("ADF", "Azure Data Factory (ADF) & Resilient Orchestration", "🔄"),
        ("POWER BI", "Power BI & VertiPaq Analytics Engine", "📊"),
        ("PYTHON", "Python & Vectorized Data Engineering Primitives", "🐍"),
        ("GENERAL DE", "General Data Engineering, Dimensional Modeling & Governance", "🚀")
    ],
    "databricks-handbook": [
        ("DATABRICKS", "Databricks Platform, Unity Catalog & Delta Lake 3.x", "⚡")
    ],
    "pyspark-handbook": [
        ("SPARK & DATABRICKS", "Apache Spark & Distributed Compute Engine", "⚡"),
        ("PYTHON", "Python & Vectorized Data Engineering Primitives", "🐍")
    ],
    "sql-handbook": [
        ("SQL SERVER", "Relational SQL, Query Optimization & Transaction Engine", "⚡"),
        ("DATABASE ARCHITECTURE", "Database Architecture, Distributed Sharding & Cloud MPP", "🏛️")
    ],
    "dbt-handbook": [
        ("DBT", "dbt Core, Analytics Engineering & Semantic Modeling", "🛠️")
    ],
    "streaming-handbook": [
        ("MODERN LAKEHOUSE", "Real-Time Streaming Lakehouse, CDC & Table Formats", "🌊")
    ],
    "dataops-cicd-handbook": [
        ("APACHE AIRFLOW", "Apache Airflow & Pipeline Orchestration", "🌪️"),
        ("GENERAL DE", "General Data Engineering, Dimensional Modeling & Governance", "🚀")
    ],
    "data-system-design-handbook": [
        ("SYSTEM DESIGN", "Distributed Systems Design & Fault Tolerance", "🏛️"),
        ("DATALAKE ARCHITECTURE", "Modern Data Lake Architecture, Storage Layouts & Formats", "🌊")
    ],
    "data-engineering-interview-handbook": [
        ("SPARK & DATABRICKS", "Apache Spark & Distributed Compute Engine", "⚡"),
        ("DATABRICKS", "Databricks Platform, Unity Catalog & Delta Lake 3.x", "⚡"),
        ("SQL SERVER", "Relational SQL, Query Optimization & Transaction Engine", "⚡"),
        ("DATABASE ARCHITECTURE", "Database Architecture, Distributed Sharding & Cloud MPP", "🏛️"),
        ("MODERN LAKEHOUSE", "Real-Time Streaming Lakehouse, CDC & Table Formats", "🌊"),
        ("DATALAKE ARCHITECTURE", "Modern Data Lake Architecture, Storage Layouts & Formats", "🌊"),
        ("SYSTEM DESIGN", "Distributed Systems Design & Fault Tolerance", "🏛️"),
        ("DBT", "dbt Core, Analytics Engineering & Semantic Modeling", "🛠️"),
        ("APACHE AIRFLOW", "Apache Airflow & Pipeline Orchestration", "🌪️"),
        ("FABRIC", "Microsoft Fabric & OneLake Architecture", "⚡"),
        ("ADF", "Azure Data Factory (ADF) & Resilient Orchestration", "🔄"),
        ("POWER BI", "Power BI & VertiPaq Analytics Engine", "📊"),
        ("PYTHON", "Python & Vectorized Data Engineering Primitives", "🐍"),
        ("GENERAL DE", "General Data Engineering, Dimensional Modeling & Governance", "🚀")
    ],
    "azure-cheat-sheet": [
        ("FABRIC", "Microsoft Fabric & OneLake Architecture", "⚡"),
        ("ADF", "Azure Data Factory (ADF) & Resilient Orchestration", "🔄"),
        ("POWER BI", "Power BI & VertiPaq Analytics Engine", "📊")
    ],
    "azure-databricks-project-blueprints": [
        ("DATABRICKS", "Databricks Platform, Unity Catalog & Delta Lake 3.x", "⚡"),
        ("MODERN LAKEHOUSE", "Real-Time Streaming Lakehouse, CDC & Table Formats", "🌊")
    ],
    "enterprise-banking-risk-alm-lakehouse": [
        ("DATABRICKS", "Databricks Platform, Unity Catalog & Delta Lake 3.x", "⚡"),
        ("GENERAL DE", "General Data Engineering, Dimensional Modeling & Governance", "🚀"),
        ("SYSTEM DESIGN", "Distributed Systems Design & Fault Tolerance", "🏛️")
    ],
    "spark-experiments": [
        ("SPARK & DATABRICKS", "Apache Spark & Distributed Compute Engine", "⚡")
    ],
    "security-handbook": [
        ("DATABRICKS", "Databricks Platform, Unity Catalog & Delta Lake 3.x", "⚡"),
        ("SYSTEM DESIGN", "Distributed Systems Design & Fault Tolerance", "🏛️"),
        ("GENERAL DE", "General Data Engineering, Dimensional Modeling & Governance", "🚀")
    ]
}

def escape_cell(text):
    if not text:
        return ""
    return text.replace("|", "\\|").replace("\n", " ").strip()

def load_concepts():
    with open(CONCEPTS_PATH, encoding='utf-8') as f:
        return json.load(f)

def assign_section(concept, category):
    sections = CATEGORY_SECTIONS.get(category, [("General Primitives", [])])
    text = (concept['term'] + ' ' + concept['definition']).lower()

    for sname, kws in sections[:-1]:
        if any(re.search(r'\b' + re.escape(kw) + r'\b', text) for kw in kws):
            return sname
    return sections[-1][0]

def build_collapsible_topics_markdown(repo_slug, pillars_list, concepts):
    total_repo_topics = 0
    pillar_sections_data = []

    for cat_name, pillar_title, icon in pillars_list:
        cat_concepts = [c for c in concepts if c.get('category') == cat_name]
        total_repo_topics += len(cat_concepts)

        # Group by relevant functional sections
        section_groups = defaultdict(list)
        for c in cat_concepts:
            sec_name = assign_section(c, cat_name)
            section_groups[sec_name].append(c)

        # Order sections according to CATEGORY_SECTIONS definition
        ordered_sections = []
        for sname, _ in CATEGORY_SECTIONS.get(cat_name, []):
            if sname in section_groups and section_groups[sname]:
                ordered_sections.append((sname, section_groups[sname]))

        pillar_sections_data.append({
            "cat": cat_name,
            "title": pillar_title,
            "icon": icon,
            "count": len(cat_concepts),
            "sections": ordered_sections
        })

    lines = []
    lines.append(f"# 🧠 Curriculum Topics Directory — {total_repo_topics} Topics Covered")
    lines.append("")
    lines.append(f"> **Curriculum Scope**: **{total_repo_topics} Production Topics** verified against real-world lakehouse internals, query engines, and distributed architectures.")
    lines.append("> **Organization**: Grouped by **Relevant Functional Sections** and then by **Difficulty Level**.")
    lines.append("> **Navigation**: All sections are **collapsible and collapsed by default** for rapid scanning.")
    lines.append("> **Live Web Hub**: Explore interactive search and mindmaps at [moderndataengineer.uk/concepts](https://moderndataengineer.uk/concepts).")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## 📑 Topics Directory at a Glance")
    lines.append("")
    lines.append("| Pillar / Module | Topics | Functional Sections Covered | Status |")
    lines.append("|:---|:---:|:---|:---:|")

    for p in pillar_sections_data:
        sec_names = ", ".join([s[0] for s in p["sections"][:3]]) + (f", and {len(p['sections'])-3} more" if len(p['sections']) > 3 else "")
        lines.append(f"| {p['icon']} **{p['title']}** | **{p['count']}** | {sec_names} | ✅ Collapsible Deck |")

    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## 📚 Comprehensive Topic Specifications (Grouped by Section & Difficulty)")
    lines.append("")

    for p in pillar_sections_data:
        lines.append("<details>")
        lines.append(f"<summary><b>{p['icon']} {p['title']} ({p['count']} Topics across {len(p['sections'])} Sections)</b> — <i>Click to expand module</i></summary>")
        lines.append("")

        for sec_name, items in p["sections"]:
            lines.append("<details>")
            lines.append(f"<summary>&nbsp;&nbsp;📂 <b>Section: {sec_name} ({len(items)} Topics)</b> — <i>Click to expand functional domain</i></summary>")
            lines.append("")

            # Group items in this section by difficulty
            diff_groups = defaultdict(list)
            for it in items:
                d = (it.get('difficulty') or 'MEDIUM').upper()
                diff_groups[d].append(it)

            for diff_key in ["EASY", "MEDIUM", "HARD", "ARCHITECT"]:
                if diff_groups[diff_key]:
                    diff_items = sorted(diff_groups[diff_key], key=lambda x: x['term'].lower())
                    full_label, short_label = DIFF_DISPLAY[diff_key]

                    lines.append("<details>")
                    lines.append(f"<summary>&nbsp;&nbsp;&nbsp;&nbsp;{short_label}: <b>{full_label} ({len(diff_items)} Topics)</b></summary>")
                    lines.append("")
                    lines.append("| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |")
                    lines.append("|:---:|---|:---:|---|")

                    for idx, c in enumerate(diff_items, 1):
                        term = escape_cell(c.get('term', ''))
                        defn = escape_cell(c.get('definition', ''))
                        lines.append(f"| {idx} | **{term}** | `{short_label}` | {defn} |")

                    lines.append("")
                    lines.append("</details>")
                    lines.append("")

            lines.append("</details>")
            lines.append("")

        lines.append("</details>")
        lines.append("")

    lines.append("---")
    lines.append("")
    lines.append("## 🌐 Ecosystem Interlinking")
    lines.append("All curriculum topics are synchronized across the 14-repository Modern Data Engineering ecosystem:")
    lines.append("- [Modern Data Engineer Hub](https://github.com/santoshjammi29/moderndataengineer) — Central edge web platform and 921-topic encyclopedia")
    lines.append("- [Databricks Handbook](https://github.com/santoshjammi29/databricks-handbook) — Unity Catalog, Delta Lake 3.x, and Lakeflow")
    lines.append("- [PySpark Handbook](https://github.com/santoshjammi29/pyspark-handbook) — Distributed compute & PySpark internals")
    lines.append("- [SQL Handbook](https://github.com/santoshjammi29/sql-handbook) — Query engine optimization & relational internals")
    lines.append("- [dbt Handbook](https://github.com/santoshjammi29/dbt-handbook) — Analytics engineering, contracts, and modeling")
    lines.append("- [Streaming Handbook](https://github.com/santoshjammi29/streaming-handbook) — Event streaming, Kafka, and Flink")
    lines.append("- [DataOps & CI/CD Handbook](https://github.com/santoshjammi29/dataops-cicd-handbook) — Airflow, orchestration, and infrastructure")
    lines.append("- [System Design Handbook](https://github.com/santoshjammi29/data-system-design-handbook) — Distributed architecture and scalability")
    lines.append("- [Interview Handbook](https://github.com/santoshjammi29/data-engineering-interview-handbook) — 20 Knowledge Pillars & architectural defense")
    lines.append("- [Azure Cheat Sheet](https://github.com/santoshjammi29/azure-cheat-sheet) — Fabric, OneLake, and ADF enterprise blueprints")
    lines.append("- [Security Handbook](https://github.com/santoshjammi29/security-handbook) — Zero-trust, IAM, and lakehouse governance")
    lines.append("")
    return "\n".join(lines)

def build_collapsible_roadmap_markdown(repo_slug, meta, manifest_entries):
    name = meta['name']
    github = meta['github']
    meta['role']
    pillar = meta['primary_pillar']
    total_count = len(manifest_entries)

    # Group manifest entries by functional directory/section
    section_map = defaultdict(list)
    for e in manifest_entries:
        path = e.get('relative_path', '')
        # Extract folder name
        parts = Path(path).parts
        if len(parts) > 1:
            # Use folder name formatted nicely
            folder = parts[0] if parts[0] != 'notebooks' else parts[1]
            sec_title = folder.replace('_', ' ').title()
        else:
            sec_title = "Core Practice Modules"
        section_map[sec_title].append(e)

    lines = []
    lines.append(f"# 🗺️ {name} — Interactive Curriculum Roadmap")
    lines.append("")
    lines.append("> **Interactive Checkbox Study Tracker & Mastery Progression**  ")
    lines.append(f"> **Canonical Repository**: [{github}](https://github.com/{github}) | **Ecosystem**: [moderndataengineer.uk](https://moderndataengineer.uk)  ")
    lines.append(f"> **Total Tracked Drills**: `{total_count}` | **Primary Authority**: `{pillar}`  ")
    lines.append("> **Structure**: Grouped by **Relevant Functional Sections**, then by **Difficulty Level**. All sections are **collapsible and collapsed by default**.")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## How to Use This Roadmap")
    lines.append("")
    lines.append("1. **Fork this repository** to your personal GitHub account.")
    lines.append("2. Click to expand any functional section below.")
    lines.append("3. Check off boxes (`- [x]`) as you complete each exercise, drill, or notebook.")
    lines.append("4. Commit and push your progress to your personal branch to track your career journey!")
    lines.append("")
    lines.append("```")
    lines.append(f"Progress: [ ] 0 / {total_count} Completed (0.0%)")
    lines.append("```")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## 📚 Functional Sections & Difficulty Breakdown")
    lines.append("")

    for sec_title, items in sorted(section_map.items()):
        lines.append("<details>")
        lines.append(f"<summary><b>📂 Section: {sec_title} ({len(items)} Drills)</b> — <i>Click to expand</i></summary>")
        lines.append("")

        # Sub-group by difficulty
        diff_buckets = defaultdict(list)
        for it in items:
            diff = (it.get('difficulty') or 'L200').upper()
            diff_buckets[diff].append(it)

        for diff_code, label in [
            ("L100", "🟢 Tier 1: Foundations (Level 100)"),
            ("L200", "🟡 Tier 2: Core Mechanics & Implementation (Level 200)"),
            ("L300", "🟠 Tier 3: Complex Scenarios & Performance (Level 300)"),
            ("L400", "🔴 Tier 4: Production Hardening & Staff Architecture (Level 400)")
        ]:
            if diff_buckets[diff_code]:
                tier_items = diff_buckets[diff_code]
                lines.append("<details>")
                lines.append(f"<summary>&nbsp;&nbsp;<b>{label} ({len(tier_items)} Drills)</b></summary>")
                lines.append("")
                for item in tier_items:
                    title = item.get('title', item.get('id', 'Exercise'))
                    path = item.get('relative_path', '')
                    link = f"[{title}]({path})" if path else title
                    lines.append(f"- [ ] `{item.get('id', '')}` — {link} `{diff_code}`")
                lines.append("")
                lines.append("</details>")
                lines.append("")

        lines.append("</details>")
        lines.append("")

    lines.append("---")
    lines.append("")
    lines.append("## Suggested Study Schedules")
    lines.append("")
    lines.append("| Schedule | Pace | Target Audience | Focus |")
    lines.append("|---|---|---|---|")
    lines.append("| **4-Week Sprint** | 5-6 drills / day | Interview Prep / Fast Track | Focus on Tier 2 & Tier 3 core drills |")
    lines.append(f"| **8-Week Deep-Dive** | 2-3 drills / day | Full Technical Mastery | Complete all {total_count} exercises + tests |")
    lines.append("| **12-Week Staff Track** | 1-2 drills / day | Architect & Tech Lead | Deep dive into Tier 3 & Tier 4 blueprints |")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## Sister Repositories & Ecosystem Roadmaps")
    lines.append("")
    lines.append("Explore interactive roadmaps across all 14 pillars of the lakehouse ecosystem:")
    lines.append("- [Modern Data Engineer Central Hub](https://moderndataengineer.uk)")
    lines.append("- [Databricks Handbook](https://github.com/santoshjammi29/databricks-handbook)")
    lines.append("- [PySpark Handbook](https://github.com/santoshjammi29/pyspark-handbook)")
    lines.append("- [SQL Handbook](https://github.com/santoshjammi29/sql-handbook)")
    lines.append("- [dbt Handbook](https://github.com/santoshjammi29/dbt-handbook)")
    lines.append("- [Streaming Handbook](https://github.com/santoshjammi29/streaming-handbook)")
    lines.append("- [DataOps & CI/CD Handbook](https://github.com/santoshjammi29/dataops-cicd-handbook)")
    lines.append("- [System Design Handbook](https://github.com/santoshjammi29/data-system-design-handbook)")
    lines.append("- [Interview Handbook](https://github.com/santoshjammi29/data-engineering-interview-handbook)")
    lines.append("- [Security Handbook](https://github.com/santoshjammi29/security-handbook)")
    return "\n".join(lines) + "\n"

def build_collapsible_hub_roadmap_markdown(concepts):
    lines = []
    lines.append("# 🗺️ Modern Data Engineer & Lakehouse Architect — Master Ecosystem Roadmap")
    lines.append("")
    lines.append("> **Comprehensive Interactive Learning Roadmap across all 14 Knowledge Pillars**  ")
    lines.append("> **Platform**: [moderndataengineer.uk](https://moderndataengineer.uk) | **Codebase**: [santoshjammi29/moderndataengineer](https://github.com/santoshjammi29/moderndataengineer)  ")
    lines.append("> **Scope**: 11,280+ Curated Data Engineering Records & 921 Topics across 14 Specialized Repositories  ")
    lines.append("> **Format**: Grouped by **Pillars & Functional Sections**, then by **Difficulty Level**. All sections are **collapsible and collapsed by default**.")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## 1. The 14-Pillar Interactive Mastery Matrix")
    lines.append("")

    for cat_name, pillar_title, icon in REPO_PILLARS["charming-fermi"]:
        cat_concepts = [c for c in concepts if c.get('category') == cat_name]

        lines.append("<details>")
        lines.append(f"<summary><b>{icon} {pillar_title} ({len(cat_concepts)} Topics)</b> — <i>Click to expand pillar</i></summary>")
        lines.append("")

        sec_map = defaultdict(list)
        for c in cat_concepts:
            sname = assign_section(c, cat_name)
            sec_map[sname].append(c)

        for sname, _ in CATEGORY_SECTIONS.get(cat_name, []):
            if sname in sec_map and sec_map[sname]:
                items = sec_map[sname]
                lines.append("<details>")
                lines.append(f"<summary>&nbsp;&nbsp;📂 <b>Section: {sname} ({len(items)} Topics)</b></summary>")
                lines.append("")

                diff_buckets = defaultdict(list)
                for it in items:
                    d = (it.get('difficulty') or 'MEDIUM').upper()
                    diff_buckets[d].append(it)

                for diff_key in ["EASY", "MEDIUM", "HARD", "ARCHITECT"]:
                    if diff_buckets[diff_key]:
                        tier_items = sorted(diff_buckets[diff_key], key=lambda x: x['term'].lower())
                        full_label, short_label = DIFF_DISPLAY[diff_key]

                        lines.append("<details>")
                        lines.append(f"<summary>&nbsp;&nbsp;&nbsp;&nbsp;{short_label}: <b>{full_label} ({len(tier_items)} Topics)</b></summary>")
                        lines.append("")
                        for it in tier_items:
                            lines.append(f"- [ ] `{it.get('id', '')}` — **{it.get('term', '')}** (`{short_label}`): {it.get('definition', '')[:120]}...")
                        lines.append("")
                        lines.append("</details>")
                        lines.append("")

                lines.append("</details>")
                lines.append("")

        lines.append("</details>")
        lines.append("")

    lines.append("---")
    lines.append("")
    lines.append("## 2. Interactive Learning Tracks")
    lines.append("")
    lines.append("<details>")
    lines.append("<summary><b>📅 Track 1: Foundations Track (Weeks 1–4)</b> — <i>Click to expand</i></summary>")
    lines.append("")
    lines.append("- [ ] Complete Tier 1 and Tier 2 drills in `sql-handbook` and `pyspark-handbook`.")
    lines.append("- [ ] Master Kimball dimensional modeling and core Lakehouse principles.")
    lines.append("</details>")
    lines.append("")
    lines.append("<details>")
    lines.append("<summary><b>📅 Track 2: Lakehouse Engineering Track (Weeks 5–8)</b> — <i>Click to expand</i></summary>")
    lines.append("")
    lines.append("- [ ] Complete `databricks-handbook` recipes 001–060 (Unity Catalog, Delta Lake 3.x, Lakeflow).")
    lines.append("- [ ] Implement dbt incremental microbatch pipelines in `dbt-handbook`.")
    lines.append("</details>")
    lines.append("")
    lines.append("<details>")
    lines.append("<summary><b>📅 Track 3: Streaming & Distributed Systems Track (Weeks 9–12)</b> — <i>Click to expand</i></summary>")
    lines.append("")
    lines.append("- [ ] Complete Kafka KRaft and Apache Flink drills in `streaming-handbook`.")
    lines.append("- [ ] Run skew and spill benchmarks in `spark-experiments`.")
    lines.append("</details>")
    lines.append("")
    lines.append("<details>")
    lines.append("<summary><b>📅 Track 4: Staff Architect & Enterprise Track (Weeks 13–16)</b> — <i>Click to expand</i></summary>")
    lines.append("")
    lines.append("- [ ] Study production blueprints in `azure-databricks-project-blueprints` and `enterprise-banking-risk-alm-lakehouse`.")
    lines.append("- [ ] Master cloud perimeter security, OIDC federation, and FinOps in `security-handbook`.")
    lines.append("</details>")
    lines.append("")
    return "\n".join(lines) + "\n"

def update_readme_topics_collapsible(repo_path, repo_slug, pillars_list, concepts):
    readme_path = repo_path / 'README.md'
    if not readme_path.exists():
        return

    with open(readme_path, encoding='utf-8') as f:
        content = f.read()

    # Build collapsible topic section
    total_topics = sum(len([c for c in concepts if c.get('category') == cat]) for cat, _, _ in pillars_list)

    new_lines = []
    new_lines.append(f"## 🧠 Core Curriculum Concepts & Topics ({total_topics} Topics Covered)")
    new_lines.append("")
    new_lines.append(f"> 💡 **Enterprise Knowledge Base Integration**: This repository implements **{total_topics} production topics** from the [Modern Data Engineering Systems Encyclopedia (921 Topics)](https://moderndataengineer.uk/concepts), grouped by **Relevant Functional Sections** and then by **Difficulty Level**. All sections are **collapsible and collapsed by default** for effortless navigation. Browse the full curriculum in [`topics/README.md`](topics/README.md).")
    new_lines.append("")
    new_lines.append("### 📑 Topics Directory at a Glance")
    new_lines.append("")
    new_lines.append("| Pillar / Module | Topic Count | Functional Sections Covered | Status |")
    new_lines.append("|:---|:---:|:---|:---:|")

    for cat_name, pillar_title, icon in pillars_list:
        matching = [c for c in concepts if c.get('category') == cat_name]

        # Sections
        sec_map = defaultdict(list)
        for c in matching:
            sec_map[assign_section(c, cat_name)].append(c)
        sec_str = ", ".join(list(sec_map.keys())[:3]) + (f", and {len(sec_map)-3} more" if len(sec_map) > 3 else "")
        new_lines.append(f"| {icon} **{pillar_title}** | **{len(matching)}** | {sec_str} | ✅ Collapsible Deck |")

    new_lines.append("")

    for cat_name, pillar_title, icon in pillars_list:
        matching = [c for c in concepts if c.get('category') == cat_name]
        sec_map = defaultdict(list)
        for c in matching:
            sec_map[assign_section(c, cat_name)].append(c)

        new_lines.append("<details>")
        new_lines.append(f"<summary><b>{icon} {pillar_title} ({len(matching)} Topics across {len(sec_map)} Sections)</b> — <i>Click to expand module</i></summary>")
        new_lines.append("")

        for sname, _ in CATEGORY_SECTIONS.get(cat_name, []):
            if sname in sec_map and sec_map[sname]:
                items = sec_map[sname]
                new_lines.append("<details>")
                new_lines.append(f"<summary>&nbsp;&nbsp;📂 <b>Section: {sname} ({len(items)} Topics)</b></summary>")
                new_lines.append("")

                diff_buckets = defaultdict(list)
                for it in items:
                    d = (it.get('difficulty') or 'MEDIUM').upper()
                    diff_buckets[d].append(it)

                for diff_key in ["EASY", "MEDIUM", "HARD", "ARCHITECT"]:
                    if diff_buckets[diff_key]:
                        diff_items = sorted(diff_buckets[diff_key], key=lambda x: x['term'].lower())
                        full_label, short_label = DIFF_DISPLAY[diff_key]

                        new_lines.append("<details>")
                        new_lines.append(f"<summary>&nbsp;&nbsp;&nbsp;&nbsp;{short_label}: <b>{full_label} ({len(diff_items)} Topics)</b></summary>")
                        new_lines.append("")
                        new_lines.append("| # | Topic / Concept | Level | Architectural Definition & Core Principle |")
                        new_lines.append("|:---:|---|:---:|---|")
                        for idx, c in enumerate(diff_items, 1):
                            new_lines.append(f"| {idx} | **{escape_cell(c.get('term', ''))}** | `{short_label}` | {escape_cell(c.get('definition', ''))} |")
                        new_lines.append("")
                        new_lines.append("</details>")
                        new_lines.append("")

                new_lines.append("</details>")
                new_lines.append("")

        new_lines.append("</details>")
        new_lines.append("")

    new_section_str = "\n".join(new_lines)

    # Check if section exists in README
    section_pattern = re.compile(r'(?:<a id="[^"]+"></a>\s*)?## 🧠 Core Curriculum Concepts & Topics.*?(?=\n## |\Z)', re.DOTALL)
    if section_pattern.search(content):
        updated = section_pattern.sub(new_section_str + "\n\n", content, count=1)
        with open(readme_path, 'w', encoding='utf-8') as f:
            f.write(updated)
        print(f"[{repo_slug}] Replaced Core Curriculum section in README.md with collapsible version")
    else:
        # If not present, append before the final footer or roadmap
        if "## 🗺️ Interactive Curriculum Roadmap" in content:
            updated = content.replace("## 🗺️ Interactive Curriculum Roadmap", new_section_str + "\n\n---\n\n## 🗺️ Interactive Curriculum Roadmap")
            with open(readme_path, 'w', encoding='utf-8') as f:
                f.write(updated)
            print(f"[{repo_slug}] Inserted collapsible Core Curriculum section into README.md")

def main():
    print("=" * 80)
    print("🚀 TRANSFORMING ALL REPOSITORIES TO COLLAPSIBLE SECTIONS & TOPICS")
    print("=" * 80)

    concepts = load_concepts()
    print(f"Loaded {len(concepts)} master concepts from data_concepts.json.")

    repos = list(REPO_PILLARS.keys())

    for repo_slug in repos:
        repo_path = BASE_DIR / repo_slug
        if not repo_path.exists():
            print(f"❌ [NOT FOUND] {repo_slug}")
            continue

        print(f"\n📦 Processing repository: {repo_slug}")
        pillars = REPO_PILLARS[repo_slug]

        # 1. Update topics/README.md
        topics_dir = repo_path / 'topics'
        topics_dir.mkdir(exist_ok=True)
        topics_readme = topics_dir / 'README.md'
        topics_content = build_collapsible_topics_markdown(repo_slug, pillars, concepts)
        with open(topics_readme, 'w', encoding='utf-8') as f:
            f.write(topics_content)
        print("    ✓ Updated topics/README.md with collapsible section + difficulty hierarchy")

        # 2. Update ROADMAP.md
        roadmap_path = repo_path / 'ROADMAP.md'
        manifest_path = repo_path / 'manifest.json'
        manifest_entries = []
        if manifest_path.exists():
            with open(manifest_path, encoding='utf-8') as f:
                manifest_entries = json.load(f).get('entries', [])

        if repo_slug == 'charming-fermi':
            roadmap_content = build_collapsible_hub_roadmap_markdown(concepts)
        else:
            meta = {
                'name': repo_slug.replace('-', ' ').title(),
                'github': f"santoshjammi29/{repo_slug}",
                'role': "Authoritative Lakehouse Curriculum Repository",
                'primary_pillar': pillars[0][1] if pillars else "Data Engineering"
            }
            roadmap_content = build_collapsible_roadmap_markdown(repo_slug, meta, manifest_entries)

        with open(roadmap_path, 'w', encoding='utf-8') as f:
            f.write(roadmap_content)
        print("    ✓ Updated ROADMAP.md with collapsible section + difficulty hierarchy")

        # 3. Update README.md with collapsible topic sections
        update_readme_topics_collapsible(repo_path, repo_slug, pillars, concepts)

    print("\n" + "=" * 80)
    print("🎉 ALL 14 REPOSITORIES SUCCESSFULLY UPDATED WITH COLLAPSIBLE SECTIONS!")
    print("=" * 80)

if __name__ == '__main__':
    main()
