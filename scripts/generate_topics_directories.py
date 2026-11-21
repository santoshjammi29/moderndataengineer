#!/usr/bin/env python3
"""
Generate dedicated topics/README.md across all repositories in the Modern Data Engineering ecosystem.
Extracts relevant concepts from src/data/json/data_concepts.json and maps them to:
- Architectural definition
- Difficulty badge
- Local repository modules, runbooks, and whiteboard blueprints
- Central web hub (moderndataengineer.uk/concepts)
"""

import json
import os
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

def format_level_badge(diff):
    d = (diff or "").upper()
    if d == "EASY":
        return "`🟢 Easy`"
    if d == "MEDIUM":
        return "`🟡 Intermediate`"
    if d == "HARD":
        return "`🔴 Advanced`"
    if d == "ARCHITECT":
        return "`🟣 Architect`"
    return "`🟡 Intermediate`"

def escape_cell(text):
    if not text:
        return ""
    return text.replace("|", "\\|").replace("\n", " ").strip()

def build_repo_topics_readme(repo_name, title, intro, pillars_config, concepts, local_mappings=None):
    term_map = {c["term"]: c for c in concepts}
    
    # Collect items per pillar
    pillar_data = []
    total_count = 0
    
    for item in pillars_config:
        pillar_title = item["title"]
        icon = item["icon"]
        desc = item.get("description", "")
        
        if "category" in item:
            matching = [c for c in concepts if c["category"] == item["category"]]
        elif "terms" in item:
            matching = [term_map[t] for t in item["terms"] if t in term_map]
        else:
            matching = []
            
        # Sort by difficulty, then term
        sorted_matching = sorted(
            matching,
            key=lambda c: (DIFF_ORDER.get((c.get("difficulty") or "").upper(), 2), c.get("term", "").lower())
        )
        pillar_data.append({
            "title": pillar_title,
            "icon": icon,
            "description": desc,
            "items": sorted_matching
        })
        total_count += len(sorted_matching)

    lines = []
    lines.append(f"# 🧠 {title} — Curriculum Topics Directory")
    lines.append("")
    lines.append(f"> **Curriculum Scope**: **{total_count} Production Topics** verified against real-world lakehouse internals, query engines, and distributed architectures.")
    lines.append(f"> **Live Web Hub**: Explore interactive search and full visual graph at [moderndataengineer.uk/concepts](https://moderndataengineer.uk/concepts).")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## 📖 Overview & Learning Path")
    lines.append("")
    lines.append(intro)
    lines.append("")
    lines.append("### 🎯 Difficulty Progression")
    lines.append("- `🟢 Easy`: Foundational primitives, syntax, and operational core concepts.")
    lines.append("- `🟡 Intermediate`: Production configuration, optimization patterns, and pipeline resiliency.")
    lines.append("- `🔴 Advanced`: Engine internals, memory management, shuffle mechanics, and fault recovery.")
    lines.append("- `🟣 Architect`: Cross-region distributed systems, enterprise governance, high-availability, and FinOps.")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## 📑 Topics Directory at a Glance")
    lines.append("")
    lines.append("| Module / Pillar | Topics | Key Primitives Covered | Reference Links |")
    lines.append("|:---|:---:|:---|:---|")
    
    for p in pillar_data:
        items = p["items"]
        sample = ", ".join([c["term"] for c in items[:3]]) + (f", and {len(items)-3} more" if len(items) > 3 else "")
        slug = p["title"].lower().replace(" ", "-").replace("&", "").replace(",", "").replace(":", "")
        lines.append(f"| {p['icon']} **[{p['title']}](#{slug})** | **{len(items)}** | {sample} | [Jump to Section](#{slug}) |")
    
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## 📚 Comprehensive Topic Specifications")
    lines.append("")

    for p in pillar_data:
        items = p["items"]
        lines.append(f"### {p['icon']} {p['title']}")
        if p["description"]:
            lines.append(f"*{p['description']}*")
        lines.append("")
        lines.append(f"**Total Topics**: {len(items)}")
        lines.append("")
        lines.append("| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |")
        lines.append("|:---:|---|:---:|---|")
        for idx, c in enumerate(items, 1):
            term = escape_cell(c.get("term", ""))
            level = format_level_badge(c.get("difficulty", ""))
            defn = escape_cell(c.get("definition", ""))
            lines.append(f"| {idx} | **{term}** | {level} | {defn} |")
        lines.append("")

    lines.append("---")
    lines.append("")
    lines.append("## 📐 Related Whiteboard Blueprints")
    lines.append("For deep visual architecture walkthroughs of these topics, consult:")
    lines.append("- 🖼️ [Master Whiteboard Blueprints](../docs/whiteboard_diagrams/handbook_whiteboard_blueprints.md)")
    lines.append("- 📊 [Spark Catalyst & Architecture Cheatsheet](../assets/whiteboards/spark_architecture_catalyst_cheatsheet.jpg)")
    lines.append("- 🔀 [Join Strategies Decision Matrix](../assets/whiteboards/spark_join_strategies_decision_matrix.jpg)")
    lines.append("- ⚡ [Skew & Spill Memory Triage](../assets/whiteboards/spark_performance_skew_spill_triage.jpg)")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## 🌐 Ecosystem Interlinking")
    lines.append("All curriculum topics are synchronized across the 14-repository Modern Data Engineering ecosystem:")
    lines.append("- [Modern Data Engineer Hub](https://github.com/santoshjammi29/moderndataengineer) — Central edge web platform and 921-topic encyclopedia")
    lines.append("- [PySpark Handbook](https://github.com/santoshjammi29/pyspark-handbook) — Distributed compute & PySpark internals")
    lines.append("- [Databricks Handbook](https://github.com/santoshjammi29/databricks-handbook) — Unity Catalog, Delta Lake 3.x, and Lakeflow")
    lines.append("- [SQL Handbook](https://github.com/santoshjammi29/sql-handbook) — Query engine optimization & relational internals")
    lines.append("- [Streaming Handbook](https://github.com/santoshjammi29/streaming-handbook) — Event streaming, Kafka, and Flink")
    lines.append("- [Security Handbook](https://github.com/santoshjammi29/security-handbook) — Zero-trust, IAM, and lakehouse governance")
    lines.append("- [Data System Design Handbook](https://github.com/santoshjammi29/data-system-design-handbook) — Distributed architecture and scalability")
    lines.append("- [DataOps & CI/CD Handbook](https://github.com/santoshjammi29/dataops-cicd-handbook) — Airflow, orchestration, and infrastructure")
    lines.append("- [dbt Handbook](https://github.com/santoshjammi29/dbt-handbook) — Analytics engineering, contracts, and modeling")
    lines.append("- [Azure Cheat Sheet](https://github.com/santoshjammi29/azure-cheat-sheet) — Fabric, OneLake, and ADF enterprise blueprints")
    lines.append("- [Data Engineering Interview Handbook](https://github.com/santoshjammi29/data-engineering-interview-handbook) — 20 Knowledge Pillars & architectural defense")
    lines.append("")
    
    return "\n".join(lines)

def main():
    concepts = load_concepts()
    print(f"Loaded {len(concepts)} concepts.")
    
    repos_config = {
        "pyspark-handbook": {
            "title": "Apache Spark & Python Data Engineering",
            "intro": "The PySpark curriculum covers distributed execution mechanics, Catalyst optimizer transformations, Tungsten memory management, PyArrow IPC serialization, and analytical window functions.",
            "pillars": [
                {"title": "Apache Spark & Distributed Compute Engine", "icon": "⚡", "category": "SPARK & DATABRICKS", "description": "Catalyst compiler, Tungsten memory, AQE, skew salting, and execution plans."},
                {"title": "Python & Vectorized Data Engineering Primitives", "icon": "🐍", "category": "PYTHON", "description": "Vectorized Pandas UDFs, PyArrow IPC memory sharing, Polars, and CPython internals."}
            ]
        },
        "databricks-handbook": {
            "title": "Databricks Data Intelligence Platform & Lakehouse",
            "intro": "The Databricks handbook curriculum covers Unity Catalog 3-tier governance, Delta Lake 3.x ACID mechanics, Liquid Clustering, Deletion Vectors, Serverless Compute, and Lakeflow pipelines.",
            "pillars": [
                {"title": "Databricks Platform, Unity Catalog & Delta Lake 3.x", "icon": "⚡", "category": "DATABRICKS", "description": "Unity Catalog, Liquid Clustering, Serverless compute, DABs, and Delta Live Tables."}
            ]
        },
        "sql-handbook": {
            "title": "Relational SQL, Query Optimization & Database Architecture",
            "intro": "The SQL curriculum covers query execution engines, physical operator plans, B-Tree and Columnstore indexing, transaction isolation levels, distributed sharding, and analytical window functions.",
            "pillars": [
                {"title": "Relational SQL, Query Optimization & Transaction Engine", "icon": "⚡", "category": "SQL SERVER", "description": "T-SQL execution plans, index tuning, locking/blocking, and analytical windowing."},
                {"title": "Database Architecture, Distributed Sharding & Cloud MPP", "icon": "🏛️", "category": "DATABASE ARCHITECTURE", "description": "B-Tree vs LSM trees, MVCC, distributed consensus (Raft/Paxos), and cloud MPP engines."}
            ]
        },
        "dbt-handbook": {
            "title": "dbt Core, Analytics Engineering & Semantic Modeling",
            "intro": "The dbt curriculum covers dimensional transformation pipelines, incremental strategies (microbatch, merge, delete+insert), schema contracts, testing frameworks, and semantic metrics.",
            "pillars": [
                {"title": "dbt Core, Analytics Engineering & Semantic Modeling", "icon": "🛠️", "category": "DBT", "description": "Incremental models, snapshots, Jinja macros, dbt Mesh, and data contracts."}
            ]
        },
        "azure-cheat-sheet": {
            "title": "Microsoft Azure Data Platform, Fabric, ADF & Power BI",
            "intro": "The Azure data engineering curriculum covers Microsoft Fabric OneLake, Direct Lake mode, Azure Data Factory orchestration, Managed Private Endpoints, and Power BI VertiPaq performance.",
            "pillars": [
                {"title": "Microsoft Fabric & OneLake Architecture", "icon": "⚡", "category": "FABRIC", "description": "OneLake shortcuts, Delta Lake storage, Direct Lake semantic models, and capacity management."},
                {"title": "Azure Data Factory & Resilient Orchestration", "icon": "🔄", "category": "ADF", "description": "Pipelines, Self-Hosted Integration Runtimes, Managed VNets, and incremental loads."},
                {"title": "Power BI & VertiPaq Analytics Engine", "icon": "📊", "category": "POWER BI", "description": "VertiPaq columnar compression, DAX evaluation context, and aggregations."}
            ]
        },
        "dataops-cicd-handbook": {
            "title": "Apache Airflow, DataOps, CI/CD & Pipeline Governance",
            "intro": "The DataOps curriculum covers Apache Airflow DAG authoring, dynamic task mapping, deferrable operators, Infrastructure as Code, CI/CD automated promotion, and Write-Audit-Publish patterns.",
            "pillars": [
                {"title": "Apache Airflow & Pipeline Orchestration", "icon": "🌪️", "category": "APACHE AIRFLOW", "description": "Airflow 2/3 scheduler, deferrable sensors, task mapping, and retry policies."},
                {"title": "General Data Engineering, Dimensional Modeling & Governance", "icon": "🚀", "category": "GENERAL DE", "description": "Kimball star schemas, Data Vault 2.0, CI/CD pipelines, and observability."}
            ]
        },
        "data-system-design-handbook": {
            "title": "Distributed Systems Design & Modern Data Lake Architecture",
            "intro": "The system design curriculum covers distributed consensus, multi-region replication, fault tolerance, storage partitioning layouts, table formats, and high-throughput ingestion architectures.",
            "pillars": [
                {"title": "Distributed Systems Design & Fault Tolerance", "icon": "🏛️", "category": "SYSTEM DESIGN", "description": "CAP/PACELC trade-offs, consensus protocols, backpressure, and multi-region failover."},
                {"title": "Modern Data Lake Architecture, Storage Layouts & Formats", "icon": "🌊", "category": "DATALAKE ARCHITECTURE", "description": "Object storage prefix throttling, Parquet layouts, partition pruning, and compaction."}
            ]
        },
        "streaming-handbook": {
            "title": "Real-Time Streaming Lakehouse, CDC & Open Table Formats",
            "intro": "The real-time streaming curriculum covers event streaming with Apache Kafka, stream processing with Apache Flink and Spark Structured Streaming, RocksDB state stores, watermarks, and CDC.",
            "pillars": [
                {"title": "Real-Time Streaming Lakehouse, CDC & Table Formats", "icon": "🌊", "category": "MODERN LAKEHOUSE", "description": "Kafka partitioning, Flink state snapshots, watermarking, dead-letter queues, and Delta/Iceberg streaming sinks."}
            ]
        },
        "security-handbook": {
            "title": "Enterprise Cloud Perimeter, Lakehouse Security & Governance",
            "intro": "The security curriculum covers zero-trust network boundaries, keyless OIDC workload identity federation, Unity Catalog attribute-based access control, envelope encryption, and regulatory auditing.",
            "pillars": [
                {
                    "title": "Zero-Trust Identity, Authentication & Secrets Management", "icon": "🔐",
                    "terms": [
                        'Databricks Secrets', 'Databricks Secret Scopes (Azure Key Vault)', 'Secrets Management',
                        'Custom Secret Backends', 'Airflow Connection Secrets Backend', 'Token Bucket Algorithm',
                        'Token Bucket Rate Limiting Algorithm'
                    ],
                    "description": "OIDC federation, eliminating static credentials, secret vault backends, and rate limiting."
                },
                {
                    "title": "Cloud Network Isolation & Perimeter Defense", "icon": "🌐",
                    "terms": [
                        'Managed Virtual Network (Managed VNet)', 'Managed Private Endpoints',
                        'ADF Managed Private Endpoint Provisioning & Timeout Bypass'
                    ],
                    "description": "Private Link, Managed VNets, Private Endpoints, and egress filtering."
                },
                {
                    "title": "Unity Catalog, Fine-Grained Access Control & Dynamic Data Masking", "icon": "🏛️",
                    "terms": [
                        'Unity Catalog', 'Unity Catalog Architecture', 'Unity Catalog Enterprise Governance',
                        'Unity Catalog Fine-Grained Access Control', 'Unity Catalog 3-Level Namespace & Attribute-Based Access Control (ABAC)',
                        'Dynamic Views for Security', 'Unity Catalog Dynamic Row Filters & Column Masks',
                        'Unity Catalog Dynamic Column Masking & Row Filters', 'Attribute-Based Dynamic Column Masking (ABAC)',
                        'Row-Level Security (RLS)', 'Object-Level Security (OLS) & Dynamic RLS at Scale',
                        'Unity Catalog Volumes (Managed vs. External)'
                    ],
                    "description": "3-tier namespaces, ABAC dynamic row filters, column masks, and volume isolation."
                },
                {
                    "title": "Data Lineage, Auditing & Regulatory Governance", "icon": "📜",
                    "terms": [
                        'Audit Logging', 'Unity Catalog System Tables', 'Unity Catalog System Tables for Lakehouse FinOps',
                        'Data Lineage', 'Unity Catalog Lineage Tracking', 'OpenLineage Operational Telemetry Standard',
                        'OpenLineage Standard Operational Run Facets', 'Data Quality Evidence with Lineage',
                        'Column-Level Encryption & Tokenization (FPE)', 'Temporal Tables & Point-In-Time Bi-Temporal Auditing',
                        'Data Mesh Federated Governance & Data Product Contracts (ODCS)', 'Data Mesh Federated Governance',
                        'Governance with Unity Catalog + Purview', 'Purview Metadata Enrichment & Non-Destructive Cataloging',
                        'Delta Lake VACUUM & Retention Governance', 'FinOps Cost Attribution Matrix for Shared Catalogs'
                    ],
                    "description": "System tables audit logs, OpenLineage, Purview metadata enrichment, and bi-temporal auditing."
                }
            ]
        },
        "data-engineering-interview-handbook": {
            "title": "Data Engineering Technical Interview Curriculum & Architectural Defense",
            "intro": "The master interview defense curriculum spans all 14 technical domains (921 topics) covering distributed compute, cloud lakehouses, streaming, query optimization, and system design.",
            "pillars": [
                {"title": "Apache Spark & Distributed Compute Engine", "icon": "⚡", "category": "SPARK & DATABRICKS"},
                {"title": "Databricks Platform, Unity Catalog & Delta Lake 3.x", "icon": "⚡", "category": "DATABRICKS"},
                {"title": "Real-Time Streaming Lakehouse, CDC & Table Formats", "icon": "🌊", "category": "MODERN LAKEHOUSE"},
                {"title": "Modern Data Lake Architecture, Storage Layouts & Formats", "icon": "🌊", "category": "DATALAKE ARCHITECTURE"},
                {"title": "Apache Airflow & Pipeline Orchestration", "icon": "🌪️", "category": "APACHE AIRFLOW"},
                {"title": "Azure Data Factory (ADF) & Resilient Orchestration", "icon": "🔄", "category": "ADF"},
                {"title": "dbt Core, Analytics Engineering & Semantic Modeling", "icon": "🛠️", "category": "DBT"},
                {"title": "Microsoft Fabric & OneLake Architecture", "icon": "⚡", "category": "FABRIC"},
                {"title": "Database Architecture, Distributed Sharding & Cloud MPP", "icon": "🏛️", "category": "DATABASE ARCHITECTURE"},
                {"title": "Relational SQL, Query Optimization & Transaction Engine", "icon": "⚡", "category": "SQL SERVER"},
                {"title": "Python & Vectorized Data Engineering Primitives", "icon": "🐍", "category": "PYTHON"},
                {"title": "General Data Engineering, Dimensional Modeling & Governance", "icon": "🚀", "category": "GENERAL DE"},
                {"title": "Power BI & VertiPaq Analytics Engine", "icon": "📊", "category": "POWER BI"},
                {"title": "Distributed Systems Design & Fault Tolerance", "icon": "🏛️", "category": "SYSTEM DESIGN"}
            ]
        },
        "azure-databricks-project-blueprints": {
            "title": "Azure Databricks Production Project Blueprints",
            "intro": "Production architectural topics and lakehouse engine primitives implemented across the 3 enterprise project blueprints.",
            "pillars": [
                {
                    "title": "Scenario 1: Retail Sales & Inventory Lakehouse", "icon": "🛒",
                    "terms": [
                        'Fact Table', 'Dimension Table', 'Databricks Auto Loader',
                        'Delta Lake Liquid Clustering & Space-Filling Curves',
                        'Delta Lake Deletion Vectors (Merge-on-Read)',
                        'Slowly Changing Dimensions Type 2 (SCD Type 2)',
                        'Databricks Serverless Compute', 'Direct Lake Mode',
                        'Medallion Architecture Layer Invariants', 'Delta Lake (Databricks)',
                        'Clustered Columnstore Rowgroup Health', 'Delta Lake Column Mapping'
                    ]
                },
                {
                    "title": "Scenario 2: Real-Time Payments Fraud & AML Monitoring", "icon": "💳",
                    "terms": [
                        'Apache Kafka Architecture', 'Structured Streaming Fundamentals',
                        'RocksDB State Store in Structured Streaming',
                        'Structured Streaming Watermarking & Allowed Lateness',
                        'Stream-Stream Joins', 'Idempotent Pipeline Patterns & Replay Safety',
                        'Dead-Letter Queue (DLQ) Quarantine Architecture', 'Unity Catalog',
                        'Debezium CDC & Analytical Stream Decoupling', 'Transactional Outbox Pattern for CDC',
                        'Low-Latency Streaming Ingestion in Python via confluent-kafka (librdkafka)',
                        'Stream-Static Joins'
                    ]
                },
                {
                    "title": "Scenario 3: Legacy Warehouse Modernization & Controlled Cutover", "icon": "🔄",
                    "terms": [
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
                }
            ]
        },
        "enterprise-banking-risk-alm-lakehouse": {
            "title": "Enterprise European Banking Risk & Regulatory Lakehouse",
            "intro": "Production regulatory engineering and lakehouse primitives implemented across the 3 European banking analytics engines.",
            "pillars": [
                {
                    "title": "Project 1: Enterprise ALM & IRRBB Dynamic Simulation", "icon": "📈",
                    "terms": [
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
                },
                {
                    "title": "Project 2: IFRS 9 Multi-Scenario Expected Credit Loss Engine", "icon": "🛡️",
                    "terms": [
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
                },
                {
                    "title": "Project 3: Early Warning System (EWS) for Lending", "icon": "🚨",
                    "terms": [
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
                }
            ]
        },
        "spark-experiments": {
            "title": "Apache Spark Visual Execution, Memory & Tuning Experiments",
            "intro": "Advanced Apache Spark execution engine, Tungsten memory management, and Catalyst optimizer concepts benchmarked across visual experiment suites.",
            "pillars": [
                {
                    "title": "Apache Spark Execution, Memory & Query Optimization", "icon": "⚡",
                    "terms": [
                        'EXPLAIN Plan (Spark Query Plan)', 'Catalyst Optimizer — Analysis Phase',
                        'Catalyst Optimizer — Physical Planning', 'Whole-Stage Code Generation',
                        'Stage Boundary', 'Tungsten Engine', 'Tungsten Binary Row Format (UnsafeRow)',
                        'Off-Heap Memory', 'Spark Unified Memory Manager', 'Memory Spill to Disk',
                        'Shuffle Operations', 'Shuffle Fetch Failed', 'Spark Partitioning vs. Bucketing Architecture',
                        'coalesce() vs repartition()', 'Bucket Join', 'Cache vs Persist Operations',
                        'Storage Level: MEMORY_AND_DISK', 'Data Skew: Detection & Mitigation',
                        'Spark Data Skew Remediation: Salting & Isolated Broadcast Patterns',
                        'Adaptive Query Execution (AQE)', 'AQE Shuffle Partition Coalescing',
                        'Skewed Shuffle Partition Splitting', 'AQE Dynamic Join Strategy Switching',
                        'Spark Broadcast Hash Join (BHJ)', 'Shuffle Hash Join (SHJ)',
                        'Sort Merge Join (SMJ)', 'BroadcastNestedLoopJoin Anti-Pattern',
                        'PySpark Vectorized Pandas UDF Architecture', 'Reading the Spark UI',
                        'Task Duration Skew Detection', 'G1GC Garbage Collector in Spark',
                        'Speculative Execution', 'The 5 S\'s of Apache Spark Performance', 'Lazy Evaluation'
                    ]
                }
            ]
        },
        "charming-fermi": {
            "title": "Modern Data Engineering Systems Encyclopedia (Master Hub)",
            "intro": "The central master topics index of the Modern Data Engineering platform, encompassing 921 concepts across 14 architectural domains.",
            "pillars": [
                {"title": "Apache Spark & Distributed Compute Engine", "icon": "⚡", "category": "SPARK & DATABRICKS"},
                {"title": "Databricks Platform, Unity Catalog & Delta Lake 3.x", "icon": "⚡", "category": "DATABRICKS"},
                {"title": "Real-Time Streaming Lakehouse, CDC & Table Formats", "icon": "🌊", "category": "MODERN LAKEHOUSE"},
                {"title": "Modern Data Lake Architecture, Storage Layouts & Formats", "icon": "🌊", "category": "DATALAKE ARCHITECTURE"},
                {"title": "Apache Airflow & Pipeline Orchestration", "icon": "🌪️", "category": "APACHE AIRFLOW"},
                {"title": "Azure Data Factory (ADF) & Resilient Orchestration", "icon": "🔄", "category": "ADF"},
                {"title": "dbt Core, Analytics Engineering & Semantic Modeling", "icon": "🛠️", "category": "DBT"},
                {"title": "Microsoft Fabric & OneLake Architecture", "icon": "⚡", "category": "FABRIC"},
                {"title": "Database Architecture, Distributed Sharding & Cloud MPP", "icon": "🏛️", "category": "DATABASE ARCHITECTURE"},
                {"title": "Relational SQL, Query Optimization & Transaction Engine", "icon": "⚡", "category": "SQL SERVER"},
                {"title": "Python & Vectorized Data Engineering Primitives", "icon": "🐍", "category": "PYTHON"},
                {"title": "General Data Engineering, Dimensional Modeling & Governance", "icon": "🚀", "category": "GENERAL DE"},
                {"title": "Power BI & VertiPaq Analytics Engine", "icon": "📊", "category": "POWER BI"},
                {"title": "Distributed Systems Design & Fault Tolerance", "icon": "🏛️", "category": "SYSTEM DESIGN"}
            ]
        }
    }
    
    for repo_name, config in repos_config.items():
        repo_dir = os.path.join(BASE_DIR, repo_name)
        if not os.path.exists(repo_dir):
            print(f"Skipping missing repo {repo_name}")
            continue
            
        topics_dir = os.path.join(repo_dir, "topics")
        os.makedirs(topics_dir, exist_ok=True)
        readme_path = os.path.join(topics_dir, "README.md")
        
        md_content = build_repo_topics_readme(
            repo_name=repo_name,
            title=config["title"],
            intro=config["intro"],
            pillars_config=config["pillars"],
            concepts=concepts
        )
        
        with open(readme_path, "w", encoding="utf-8") as f:
            f.write(md_content)
        print(f"Generated {readme_path}")

if __name__ == "__main__":
    main()
