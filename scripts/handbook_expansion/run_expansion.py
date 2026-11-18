#!/usr/bin/env python3
"""
Orchestrates the handbook expansion:
- Appends 70 questions to Pillars 01-14 (15 questions each)
- Adds 60 questions across 6 new Pillars (Pillars 15-20)
- Writes all updated markdown files and monolithic guide
- Exports updated JSON datasets (495 total questions)
- Updates README.md
"""

import sys
import os
import json
import glob

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from expand_pillars_1_to_7 import PILLAR_EXTENSIONS_P1_P7
from expand_pillars_8_to_14 import PILLAR_EXTENSIONS_P8_P14
from new_pillars_15_to_17 import NEW_PILLARS_15_17
from new_pillars_18_to_20 import NEW_PILLARS_18_20

HANDBOOK_DIR = "/Users/santosh/Documents/antigravity/data-engineering-interview-handbook"
PILLARS_DIR = os.path.join(HANDBOOK_DIR, "pillars")
DATA_DIR = os.path.join(HANDBOOK_DIR, "data")

def format_q_md(idx, q_item):
    return f"""### Q{idx}: {q_item['question']}

**Difficulty:** `{q_item['difficulty']}` | **Niche:** `{q_item['niche']}`

{q_item['answer']}

---
"""

def main():
    print("Starting Comprehensive Handbook Expansion to 495 Questions...")

    # Combine extensions 1-14
    extensions = {}
    extensions.update(PILLAR_EXTENSIONS_P1_P7)
    extensions.update(PILLAR_EXTENSIONS_P8_P14)

    # 1. Update Pillars 01 through 14
    pillar_files = {
        "01": "01_spark_and_databricks.md",
        "02": "02_databricks_lakehouse.md",
        "03": "03_modern_lakehouse.md",
        "04": "04_datalake_architecture.md",
        "05": "05_apache_airflow.md",
        "06": "06_azure_data_factory.md",
        "07": "07_dbt_data_build_tool.md",
        "08": "08_microsoft_fabric.md",
        "09": "09_database_architecture.md",
        "10": "10_sql_server_tsql.md",
        "11": "11_python_for_data_engineering.md",
        "12": "12_data_modeling_and_cdc.md",
        "13": "13_power_bi_and_serving.md",
        "14": "14_system_design_at_scale.md"
    }

    all_270_pillar_questions = []

    # Load existing questions_14_pillars.json
    with open(os.path.join(DATA_DIR, "questions_14_pillars.json"), "r", encoding="utf-8") as f:
        existing_140 = json.load(f)

    # Group existing by pillar number (from source string or id)
    # They have 10 per pillar in order
    idx_counter = 0
    for p_num in sorted(pillar_files.keys()):
        p_filename = pillar_files[p_num]
        p_path = os.path.join(PILLARS_DIR, p_filename)
        
        # Read existing file content
        with open(p_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Extract existing 10 questions for this pillar
        p_existing = existing_140[idx_counter:idx_counter+10]
        idx_counter += 10
        all_270_pillar_questions.extend(p_existing)

        # Append questions 11-15
        p_new_questions = extensions[p_num]
        append_md = []
        for i, q in enumerate(p_new_questions, start=11):
            append_md.append(format_q_md(i, q))
            # Format JSON item
            q_json = {
                "id": q["id"],
                "source": f"Master Knowledge Base - Pillar {p_num}: {p_filename.replace('.md','').replace('_',' ').title()}",
                "category": q["category"],
                "niche": q["niche"],
                "difficulty": q["difficulty"],
                "question": q["question"],
                "answer": q["answer"],
                "domain": q["domain"],
                "subdomain": q["subdomain"],
                "linked_concept_id": q["linked_concept_id"]
            }
            all_270_pillar_questions.append(q_json)

        # Write updated pillar file
        new_content = content.rstrip() + "\n\n" + "\n".join(append_md)
        with open(p_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Updated Pillar {p_num} ({p_filename}) -> 15 questions")

    # 2. Write New Pillars 15 to 20
    new_pillars_dict = {}
    new_pillars_dict.update(NEW_PILLARS_15_17)
    new_pillars_dict.update(NEW_PILLARS_18_20)

    new_pillar_files = {
        "15": "15_apache_iceberg_deep_dive.md",
        "16": "16_apache_flink_streaming.md",
        "17": "17_trino_presto_duckdb.md",
        "18": "18_genai_vector_lakehouse.md",
        "19": "19_finops_compute_optimization.md",
        "20": "20_data_quality_contracts_observability.md"
    }

    for p_num, p_info in new_pillars_dict.items():
        p_filename = new_pillar_files[p_num]
        p_path = os.path.join(PILLARS_DIR, p_filename)
        
        md_lines = [
            f"# {p_info['title']}",
            f"**Category:** `{p_info['category']}` | **Domain:** `{p_info['domain']}`",
            "\n---\n"
        ]

        for i, q in enumerate(p_info["questions"], start=1):
            md_lines.append(format_q_md(i, q))
            q_json = {
                "id": q["id"],
                "source": f"Master Knowledge Base - {p_info['title']}",
                "category": q["category"],
                "niche": q["niche"],
                "difficulty": q["difficulty"],
                "question": q["question"],
                "answer": q["answer"],
                "domain": q["domain"],
                "subdomain": q["subdomain"],
                "linked_concept_id": q["linked_concept_id"]
            }
            all_270_pillar_questions.append(q_json)

        with open(p_path, "w", encoding="utf-8") as f:
            f.write("\n".join(md_lines))
        print(f"Created New Pillar {p_num} ({p_filename}) -> 10 questions")

    assert len(all_270_pillar_questions) == 270, f"Expected 270, found {len(all_270_pillar_questions)}"

    # 3. Create all_20_pillars_master_guide.md
    print("Assembling all_20_pillars_master_guide.md...")
    monolithic_lines = [
        "# All 20 Technical Pillars: Master Data Engineering Reference Guide",
        "\n> **Complete 270-Question Deep-Dive Technical Manual across Modern Lakehouse Platforms**\n",
        "---\n"
    ]

    all_pillar_files_sorted = []
    for p_num in sorted(pillar_files.keys()):
        all_pillar_files_sorted.append((p_num, pillar_files[p_num]))
    for p_num in sorted(new_pillar_files.keys()):
        all_pillar_files_sorted.append((p_num, new_pillar_files[p_num]))

    for p_num, p_fn in all_pillar_files_sorted:
        p_path = os.path.join(PILLARS_DIR, p_fn)
        with open(p_path, "r", encoding="utf-8") as f:
            p_content = f.read()
        monolithic_lines.append(p_content.strip())
        monolithic_lines.append("\n\n---\n\n")

    mono_path = os.path.join(PILLARS_DIR, "all_20_pillars_master_guide.md")
    with open(mono_path, "w", encoding="utf-8") as f:
        f.write("\n".join(monolithic_lines))
    print(f"Wrote monolithic 20-pillar guide to {mono_path}")

    # Also update legacy all_14_pillars_master_guide.md for backward compatibility
    mono14_path = os.path.join(PILLARS_DIR, "all_14_pillars_master_guide.md")
    with open(mono14_path, "w", encoding="utf-8") as f:
        f.write("\n".join(monolithic_lines))

    # 4. Save JSON Datasets
    # data/questions_20_pillars.json
    p20_json_path = os.path.join(DATA_DIR, "questions_20_pillars.json")
    with open(p20_json_path, "w", encoding="utf-8") as f:
        json.dump(all_270_pillar_questions, f, indent=2)
    print(f"Saved {len(all_270_pillar_questions)} questions to {p20_json_path}")

    # Load 125 questions and 100 spark questions
    with open(os.path.join(DATA_DIR, "questions_125.json"), "r", encoding="utf-8") as f:
        q125 = json.load(f)

    with open(os.path.join(DATA_DIR, "100_spark_data_issues.json"), "r", encoding="utf-8") as f:
        spark100 = json.load(f)

    # Convert spark100 items to uniform schema
    spark_uniform = []
    for s in spark100:
        spark_uniform.append({
            "id": f"spark100-q{s['id']:02d}",
            "source": f"100 Spark Data Issues - {s['category']}",
            "category": "SPARK DATA ISSUES",
            "niche": s["category"],
            "difficulty": s["level"].upper(),
            "question": f"Problem {s['id']:02d} [{s['level']}]: {s['title']}",
            "answer": f"**Scenario:** {s['scenario']}\n\n**Symptom:** {s['symptom']}\n\n**Root Cause:** {s['root_cause']}\n\n**Failing Code:**\n```python\n{s['failing_code']}\n```\n\n**Solution:**\n```python\n{s['solution_code']}\n```\n\n**Architect Rule:** {s['interview_takeaway']}",
            "domain": "Apache Spark & Lakehouse Engine Triage",
            "subdomain": s["category"],
            "linked_concept_id": "spark-data-issues"
        })

    # Master 495 questions dataset
    all_495 = q125 + all_270_pillar_questions + spark_uniform
    master_json_path = os.path.join(DATA_DIR, "all_interview_questions.json")
    with open(master_json_path, "w", encoding="utf-8") as f:
        json.dump(all_495, f, indent=2)
    print(f"Saved complete master dataset ({len(all_495)} items) to {master_json_path}")

    # 5. Update README.md
    print("Updating README.md with 20 pillars and 495 questions...")
    update_readme(len(all_495), len(all_270_pillar_questions))
    print("Expansion Completed Successfully!")

def update_readme(total_q, pillar_q):
    readme_path = os.path.join(HANDBOOK_DIR, "README.md")
    readme_content = f"""# Data Engineering Interview Handbook & Architectural Defense Guide

A comprehensive, production-tested reference manual and interview defense playbook for Data Engineers, Lakehouse Architects, and Big Data Leads. 

This repository provides original technical explanations, production code implementations (SQL, PySpark, Python), performance triage runbooks, and enterprise system designs across **{total_q} problems and interview questions**.

---

## 📚 Repository Structure

```text
data-engineering-interview-handbook/
├── playbooks/                        # Core Interview Defense Playbooks (125 OCR Slides + 100 Spark Issues)
│   ├── 100_spark_data_issues_problems_and_answers.md # 100 Real-World Spark/PySpark/SQL Data Issues
│   ├── 01_sql_and_pyspark_125.md     # SQL & PySpark internals, Catalyst, Tungsten, GC triage
│   ├── 02_kafka_and_streaming_125.md # Apache Kafka, EOS, and Spark Structured Streaming
│   ├── 03_azure_databricks_125.md    # Delta Lake 3.x, Liquid Clustering, Unity Catalog
│   ├── 04_aws_cloud_125.md           # AWS Glue, EMR, S3 Lakehouse, Step Functions
│   ├── 05_project_defense_125.md     # STAR project narratives, scale-up strategies, triage
│   ├── 06_system_design_125.md       # High-throughput streaming, fraud detection, recovery
│   ├── 07_managerial_leadership_125.md # Technical disputes, FinOps, team leadership
│   └── 125_master_defense_playbook.md # Full consolidated 125-question playbook
├── pillars/                          # 20 Knowledge Base Technical Pillars ({pillar_q} Core Questions)
│   ├── 01_spark_and_databricks.md    # Spark 3.5, Catalyst custom rules, Tungsten spill, Photon
│   ├── 02_databricks_lakehouse.md    # Unity Catalog, DABs, Serverless, Lakeflow, System Tables
│   ├── 03_modern_lakehouse.md        # Delta Lake Liquid Clustering, UniForm, Deletion Vectors
│   ├── 04_datalake_architecture.md   # S3/ADLS prefix throttling, bin-packing, DR RPO/RTO
│   ├── 05_apache_airflow.md          # Airflow 2/3, Dynamic Task Mapping, Deferrable Operators
│   ├── 06_azure_data_factory.md      # SHIR HA clusters, watermark pipelines, Mapping Data Flows
│   ├── 07_dbt_data_build_tool.md     # Incremental merge/overwrite, dbt Mesh, Semantic Layer
│   ├── 08_microsoft_fabric.md        # OneLake Shortcuts, Direct Lake mode, Capacity Smoothing
│   ├── 09_database_architecture.md   # B-Tree vs LSM, ARIES crash recovery, MVCC, Raft consensus
│   ├── 10_sql_server_tsql.md         # Clustered Columnstore, parameter sniffing, partition switching
│   ├── 11_python_for_data_engineering.md # CPython GC, PyArrow zero-copy IPC, Polars LazyFrames, PyO3
│   ├── 12_data_modeling_and_cdc.md   # SCD 1-6, Data Vault 2.0, Debezium Outbox, Bi-Temporal
│   ├── 13_power_bi_and_serving.md    # VertiPaq compression, DAX context transition, Aggregations
│   ├── 14_system_design_at_scale.md  # Multi-tenant lakehouse, real-time feature store, FinOps
│   ├── 15_apache_iceberg_deep_dive.md # Metadata tree, hidden partitioning, positional deletes, REST/Nessie
│   ├── 16_apache_flink_streaming.md  # Chandy-Lamport barriers, RocksDB state, unaligned checkpoints
│   ├── 17_trino_presto_duckdb.md     # Trino MPP, dynamic filtering, DuckDB SIMD embedded analytics
│   ├── 18_genai_vector_lakehouse.md  # HNSW vs IVF-PQ, Databricks Vector Search, RAG hybrid search
│   ├── 19_finops_compute_optimization.md # DBU tuning, Serverless cost curves, Photon ROI, spot fallback
│   ├── 20_data_quality_contracts_observability.md # Data Contracts, streaming circuit breakers, IQR anomalies
│   └── all_20_pillars_master_guide.md # Consolidated 20-pillar reference manual (270 questions)
└── data/                             # Structured JSON datasets
    ├── questions_125.json            # 125 OCR slide questions
    ├── 100_spark_data_issues.json    # 100 Spark/PySpark data issue problems
    ├── questions_20_pillars.json     # 270 pillar questions across 20 domains
    └── all_interview_questions.json  # Complete {total_q}-question master dataset
```

---

## 🎯 The 20 Technical Curriculum Pillars

| # | Pillar | Questions | Key Production Topics Covered |
| :---: | :--- | :---: | :--- |
| **01** | **Spark & Databricks Architecture** | 15 | Catalyst optimizer rules, Tungsten off-heap memory, shuffle spill triage, AQE coalescing, RocksDB streaming, Photon C++ SIMD. |
| **02** | **Databricks Lakehouse & Unity Catalog** | 15 | Unity Catalog 3-tier namespace, DABs GitOps, dynamic row/column masking, Serverless compute, System Tables FinOps, Lakeflow. |
| **03** | **Modern Lakehouse Table Formats** | 15 | Delta Lake 3.x Liquid Clustering, UniForm metadata translation, Deletion Vectors Roaring Bitmaps, Shallow vs Deep Clone, OCC write conflicts. |
| **04** | **Data Lake Architecture & Storage** | 15 | S3/ADLS Gen2 prefix request throttling (HTTP 503), small file bin-packing, DR Active-Passive RPO/RTO, Glacier tiering traps, Zero-Trust security. |
| **05** | **Apache Airflow Orchestration** | 15 | Airflow 2 vs 3 decoupled scheduler, Dynamic Task Mapping (`.expand()`), Deferrable Operators & Triggerer daemon, Custom XCom S3 backends, Multi-Scheduler HA. |
| **06** | **Azure Data Factory & Integration** | 15 | Self-Hosted IR (SHIR) HA clustering, watermark incremental extraction, Mapping Data Flows cluster reuse, REST OAuth2 pagination, ARM CI/CD gates. |
| **07** | **dbt (Data Build Tool)** | 15 | Incremental strategies (`merge`, `append`, `insert_overwrite`), snapshots (SCD2), MetricFlow Semantic Layer, dbt Mesh cross-project contracts, unit tests. |
| **08** | **Microsoft Fabric & OneLake** | 15 | OneLake Shortcuts, Power BI Direct Lake mode over Delta, Lakehouse vs Warehouse, F-SKU Capacity Smoothing, KQL Real-Time Intelligence. |
| **09** | **Database Architecture & Systems** | 15 | B-Tree vs LSM-Tree amplification, MVCC snapshot isolation, ARIES WAL crash recovery (Analysis/Redo/Undo), distributed sharding (Vitess), Raft consensus. |
| **10** | **SQL Server & T-SQL Mastery** | 15 | Clustered Columnstore rowgroups, parameter sniffing remediation, partition switching zero-logging, RCSI TempDB version store, DMV execution plan analysis. |
| **11** | **Python for Data Engineering** | 15 | CPython reference counting and cyclic GC, PyArrow zero-copy IPC memory, Polars LazyFrame SIMD vectorization, asyncio vs multiprocessing, PyO3 Rust extensions. |
| **12** | **Data Modeling & CDC** | 15 | SCD Types 1-6 complete implementations, Data Vault 2.0 hash keys, Debezium Transactional Outbox CDC, Star vs Snowflake vs OBT, Bi-Temporal financial ledgers. |
| **13** | **Power BI & Serving Layer** | 15 | VertiPaq Value/Dict/RLE compression, DAX context transition (`CALCULATE()`), Composite Models & Aggregation Tables, XMLA partition refresh, Dynamic RLS. |
| **14** | **System Design at Scale** | 15 | Multi-tenant lakehouse isolation, dual-storage real-time feature store (< 5ms), Lakehouse FinOps auto-scaling, CQRS event sourcing, automated lineage. |
| **15** | **Apache Iceberg Deep Dive** | 10 | 4-tier metadata tree, hidden partitioning, positional vs equality deletes, schema evolution with Field IDs, REST/Nessie/Polaris catalogs, WAP pattern. |
| **16** | **Apache Flink & Stateful Streaming** | 10 | JobManager/TaskManager slots, Chandy-Lamport barriers, HashMap vs RocksDB backends, unaligned checkpoints, watermark alignment, two-phase commit EOS. |
| **17** | **Trino, Presto & DuckDB** | 10 | Trino coordinator MPP, dynamic filtering pushdown, memory pools and spill, Project Tardigrade fault tolerance, DuckDB morsel SIMD, Arrow zero-copy. |
| **18** | **GenAI, Vector Search & Embeddings** | 10 | HNSW vs IVF-PQ indexing, Databricks Vector Search Delta sync, recursive chunking, GPU Spark embedding batches, semantic caching, hybrid search (BM25 + Dense). |
| **19** | **FinOps & Cost Engineering** | 10 | DBU cost reduction checklist, Serverless vs Classic compute cost curves, Photon ROI profiling, S3 multipart aborts, BigQuery slots vs on-demand, Spot fallback. |
| **20** | **Data Quality, Contracts & Observability** | 10 | Data Contracts YAML specification, streaming circuit breakers, 5 pillars of observability, statistical IQR anomaly detection, CDC automated checksum reconciliation. |
| **Σ** | **TOTAL** | **{total_q}** | **Complete Full-Stack Data Engineering & Lakehouse Architecture Mastery** |

---

## ⚡ Master Playbooks

- 📖 **[100 Spark, PySpark & SQL Data Issue Problems & Solutions](playbooks/100_spark_data_issues_problems_and_answers.md)**
- 📖 **[125 Master Technical Defense Playbook](playbooks/125_master_defense_playbook.md)**
- 📖 **[All 20 Technical Pillars Master Guide](pillars/all_20_pillars_master_guide.md)**
"""
    with open(readme_path, "w", encoding="utf-8") as f:
        f.write(readme_content)

if __name__ == "__main__":
    main()
