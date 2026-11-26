#!/usr/bin/env python3
"""
Ingest New Ecosystem Content into Website JSON Datasets (Idempotent)
====================================================================
1. Adds 14 new PySpark Handbook modules (Spark 4.0, Platform Adapters 096-099,
   Delta/Iceberg/Parquet comparison, SQL-to-PySpark Rosetta, Pytest patterns)
   into src/data/json/data_pyspark.json.
2. Adds all 105 SQL Handbook exercises (sql-handbook/exercises/*/*.sql) into
   src/data/json/data_sparksql.json.
3. Adds Databricks Lakehouse FinOps Monitor patterns into src/data/json/data_python.json.
4. Adds curated Q&A and Architecture scenarios from Databricks Handbook (FinOps Monitor,
   Databricks Apps, Mosaic AI), Security Handbook (OIDC Zero Trust, SLSA, Unity Catalog RLS),
   PySpark 4.0, and Interview Pillars 15-20 into questions.json and data_architecture.json.
5. Copies Pillars 15-20 into docs/interview_prep/pillars/.
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

HUB_DIR = Path(__file__).resolve().parent.parent
BASE_DIR = HUB_DIR.parent
DATA_DIR = HUB_DIR / "src" / "data" / "json"

LEVEL_RE = re.compile(r"\b(level\s+)([1-4])00\b", re.IGNORECASE)
L_RE = re.compile(r"\b([Ll])([1-4])00\b")


def normalize_levels(text: str) -> str:
    text = re.sub(
        r"\b(level\s+)([1-4])00(\s*(?:to|[–-])\s*(?:level\s+)?)([1-4])00\b",
        r"\g<1>\g<2>\g<3>\g<4>",
        text,
        flags=re.IGNORECASE,
    )
    text = LEVEL_RE.sub(r"\g<1>\g<2>", text)
    text = L_RE.sub(r"\g<1>\g<2>", text)
    return text


def parse_pyspark_module(py_path: Path, item_id: str, level: str, category: str) -> dict[str, Any]:
    text = normalize_levels(py_path.read_text(encoding="utf-8"))
    doc_match = re.match(r'\s*"""(.*?)"""', text, re.DOTALL)
    docstring = doc_match.group(1).strip() if doc_match else ""
    lines = [ln.strip() for ln in docstring.splitlines() if ln.strip()]
    raw_title = lines[0] if lines else py_path.stem.replace("_", " ").title()
    raw_title = re.sub(r"^Module\s+\d+\s*/\s*\d+:\s*", "", raw_title)
    raw_title = re.sub(r"^\d+\s*[—-]\s*", "", raw_title).strip()

    scen_m = re.search(r"Scenario\s*(?:&\s*Scale)?:\s*(.*?)(?=\n\s*(?:Goal:|Why|$))", docstring, re.DOTALL | re.IGNORECASE)
    goal_m = re.search(r"Goal:\s*(.*)", docstring, re.DOTALL | re.IGNORECASE)

    use_case = " ".join((scen_m.group(1) if scen_m else "").split()) or f"Production lakehouse implementation for {raw_title}."
    description = " ".join((goal_m.group(1) if goal_m else "").split()) or use_case

    # Strip leading module docstring for clean code display
    code_body = text[doc_match.end():].strip() if doc_match else text.strip()
    if len(code_body) > 4200:
        code_body = code_body[:4100] + "\n\n# ... [See pyspark-handbook repository for complete runnable module & tests]"

    # Extract diagnostic notes from trailing comments
    notes: list[str] = []
    for ln in reversed(text.splitlines()):
        s = ln.strip()
        if s.startswith("# - "):
            notes.append(s[4:].strip())
        elif notes and not s.startswith("#"):
            break
    notes.reverse()
    if not notes:
        notes = [
            f"Category: {category}",
            "Designed for Apache Spark 3.5+ / 4.0 and ANSI SQL mode compliance.",
            f"Source: pyspark-handbook ({py_path.parent.name}/{py_path.name})",
        ]

    return {
        "id": item_id,
        "title": raw_title,
        "level": level,
        "category": category,
        "description": description,
        "code": code_body,
        "notes": notes[:4],
        "use_case": use_case,
    }


def ingest_pyspark_new_modules() -> None:
    target = DATA_DIR / "data_pyspark.json"
    data: list[dict[str, Any]] = json.loads(target.read_text(encoding="utf-8"))
    # Remove previously ingested items from this script for idempotency
    new_prefix = "pyspark-hb-new-"
    data = [x for x in data if not str(x.get("id", "")).startswith(new_prefix)]

    ps_root = BASE_DIR / "pyspark-handbook"
    specs = [
        ("04_spark4_and_modern_api/001_spark_connect_decoupled_client_architecture.py", f"{new_prefix}spark4-001", "architect", "Spark 4.0 & Modern API"),
        ("04_spark4_and_modern_api/002_ansi_mode_default_and_spark35_to_40_migration_gotchas.py", f"{new_prefix}spark4-002", "advanced", "Spark 4.0 & Modern API"),
        ("04_spark4_and_modern_api/003_variant_semi_structured_data_type_and_shredding.py", f"{new_prefix}spark4-003", "advanced", "Spark 4.0 & Modern API"),
        ("04_spark4_and_modern_api/004_python_data_source_api_custom_connectors.py", f"{new_prefix}spark4-004", "architect", "Spark 4.0 & Modern API"),
        ("04_spark4_and_modern_api/005_polymorphic_python_udtfs_and_table_arguments.py", f"{new_prefix}spark4-005", "advanced", "Spark 4.0 & Modern API"),
        ("04_spark4_and_modern_api/006_sql_pipe_syntax_and_parameterized_sql.py", f"{new_prefix}spark4-006", "intermediate", "Spark 4.0 & Modern API"),
        ("04_spark4_and_modern_api/007_structured_json_logging_and_observability.py", f"{new_prefix}spark4-007", "intermediate", "Spark 4.0 & Modern API"),
        ("06_platform_adapters/096_microsoft_fabric_onelake_and_notebookutils_adapter.py", f"{new_prefix}adapter-096", "architect", "Cloud & Platform Adapters"),
        ("06_platform_adapters/097_aws_emr_glue_catalog_and_s3_committer_adapter.py", f"{new_prefix}adapter-097", "architect", "Cloud & Platform Adapters"),
        ("06_platform_adapters/098_gcp_dataproc_serverless_and_bigquery_connector.py", f"{new_prefix}adapter-098", "architect", "Cloud & Platform Adapters"),
        ("06_platform_adapters/099_kubernetes_spark_operator_and_volcano_adapter.py", f"{new_prefix}adapter-099", "architect", "Cloud & Platform Adapters"),
        ("05_lakehouse_formats/044_delta_vs_iceberg_vs_parquet_format_patterns.py", f"{new_prefix}formats-044", "architect", "Lakehouse Formats"),
        ("01_foundations/033_sql_to_pyspark_rosetta_stone.py", f"{new_prefix}foundations-033", "beginner", "PySpark Foundations"),
        ("02_production_patterns/012_pytest_and_assert_dataframe_equal_testing_patterns.py", f"{new_prefix}testing-012", "intermediate", "Testing & CI/CD"),
    ]

    added = 0
    for rel, item_id, lvl, cat in specs:
        p = ps_root / rel
        if p.exists():
            data.append(parse_pyspark_module(p, item_id, lvl, cat))
            added += 1

    target.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"✓ data_pyspark.json: added {added} new modules (total {len(data)})")


def map_sql_level(header_text: str) -> str:
    low = header_text.lower()
    if "beginner" in low:
        return "beginner"
    if "intermediate" in low:
        return "intermediate"
    if "architect" in low:
        return "architect"
    return "advanced"


def clean_sql_comment_block(raw: str) -> str:
    lines = []
    for ln in raw.splitlines():
        s = re.sub(r"^--\s?", "", ln).strip()
        if s and not set(s).issubset({"-", "="}):
            lines.append(s)
    return " ".join(lines).strip()


def ingest_sql_handbook_exercises() -> None:
    target = DATA_DIR / "data_sparksql.json"
    data: list[dict[str, Any]] = json.loads(target.read_text(encoding="utf-8"))
    data = [x for x in data if not str(x.get("id", "")).startswith("sql-hb-")]

    sql_root = BASE_DIR / "sql-handbook" / "exercises"
    sql_files = sorted(sql_root.glob("*/*.sql"))

    added = 0
    for sf in sql_files:
        text = normalize_levels(sf.read_text(encoding="utf-8"))
        m_num = re.match(r"^(\d{3})_(.+)\.sql$", sf.name)
        num_str = m_num.group(1) if m_num else sf.stem
        raw_title = (m_num.group(2) if m_num else sf.stem).replace("_", " ").title()
        # Restore common SQL acronyms
        for acr in ["Sql", "Cte", "Ctes", "Scd", "Mpp", "Acid", "Mvcc", "Olap", "Ddl", "Dml", "Sargable", "Rcsi", "Json", "Xml"]:
            raw_title = re.sub(rf"\b{acr}\b", acr.upper() if acr != "Ctes" else "CTEs", raw_title)

        mod_dir = sf.parent.name
        category = re.sub(r"^\d+_", "", mod_dir).replace("_", " ").title()
        for acr in ["Sql", "Ctes", "Scd", "Mpp"]:
            category = re.sub(rf"\b{acr}\b", acr.upper() if acr != "Ctes" else "CTEs", category)

        lvl_m = re.search(r"--\s*LEVEL:\s*(.+)", text)
        level = map_sql_level(lvl_m.group(1) if lvl_m else "Intermediate")

        eng_m = re.search(r"--\s*ENGINES:\s*(.+)", text)
        engines = eng_m.group(1).strip() if eng_m else "PostgreSQL, DuckDB, Databricks Spark SQL"

        arch_m = re.search(r"--\s*ARCHITECTURAL CONTEXT.*?:\n(.*?)(?=\n--\s*(?:BUSINESS CONTEXT|PROBLEM STATEMENT|={10,}))", text, re.DOTALL)
        prob_m = re.search(r"--\s*PROBLEM STATEMENT:\n(.*?)(?=\n--\s*={10,}|\n--\s*DISTRIBUTED)", text, re.DOTALL)

        use_case = clean_sql_comment_block(arch_m.group(1)) if arch_m else f"Production SQL engineering pattern for {raw_title}."
        description = clean_sql_comment_block(prob_m.group(1)) if prob_m else use_case

        # Extract solution query (prefer from [SOLUTION QUERY] onward, else after header)
        sol_idx = text.find("-- --- [SOLUTION QUERY] ---")
        if sol_idx != -1:
            code_body = text[sol_idx:].strip()
        else:
            # Strip leading comment header box
            parts = text.split("-- ============================================================================")
            code_body = parts[-1].strip() if len(parts) > 2 else text.strip()

        if len(code_body) > 4000:
            code_body = code_body[:3900] + "\n\n-- ... [See sql-handbook repository for full benchmark DDL and validation assertions]"

        data.append({
            "id": f"sql-hb-{num_str}",
            "title": f"#{num_str} {raw_title}",
            "level": level,
            "category": category,
            "description": description,
            "code": code_body,
            "notes": [
                f"Engines: {engines}",
                f"Module: {category}",
                f"Source: sql-handbook/exercises/{mod_dir}/{sf.name}",
            ],
            "use_case": use_case,
        })
        added += 1

    target.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"✓ data_sparksql.json: added {added} SQL Handbook exercises (total {len(data)})")


def ingest_databricks_finops_python() -> None:
    target = DATA_DIR / "data_python.json"
    data: list[dict[str, Any]] = json.loads(target.read_text(encoding="utf-8"))
    data = [x for x in data if not str(x.get("id", "")).startswith("py-dbx-finops-")]

    finops_data_path = BASE_DIR / "databricks-handbook" / "apps" / "lakehouse_finops_monitor" / "finops_data.py"
    if finops_data_path.exists():
        code_snippet = normalize_levels(finops_data_path.read_text(encoding="utf-8"))
        if len(code_snippet) > 3800:
            code_snippet = code_snippet[:3700] + "\n\n# ... [See databricks-handbook/apps/lakehouse_finops_monitor/finops_data.py]"
        data.append({
            "id": "py-dbx-finops-01",
            "title": "Databricks Apps: Lakehouse FinOps Monitor & System Tables SDK Fallback",
            "level": "architect",
            "category": "Databricks FinOps & Observability",
            "description": "Production Databricks App data layer querying system.billing.usage and system.billing.list_prices via Databricks SQL / SDK with deterministic demo fallback and date-range validation.",
            "code": code_snippet,
            "notes": [
                "Queries Unity Catalog system.billing.usage joined with list_prices for real-time DBU spend attribution.",
                "Supports offline CI & local demo execution via deterministic fallback when DATABRICKS_WAREHOUSE_ID is absent.",
                "Source: databricks-handbook/apps/lakehouse_finops_monitor/finops_data.py",
            ],
            "use_case": "Building governed FinOps observability dashboards hosted directly on Databricks Apps with zero credential leakage.",
        })

    target.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"✓ data_python.json: updated (total {len(data)})")


def ingest_curated_qa_and_scenarios() -> None:
    qa_path = DATA_DIR / "questions.json"
    qa_data: list[dict[str, Any]] = json.loads(qa_path.read_text(encoding="utf-8"))
    qa_data = [x for x in qa_data if not str(x.get("id", "")).startswith(("eco-new-qa-",))]

    new_qas = [
        {
            "id": "eco-new-qa-01",
            "domain": "Databricks Platform & Lakehouse",
            "category": "Databricks FinOps",
            "niche": "System Tables & Databricks Apps",
            "difficulty": "ARCHITECT",
            "source": "Databricks Handbook",
            "sourceDb": "databricks_handbook",
            "sourceLabel": "Databricks Handbook",
            "question": "How do you architect a real-time Lakehouse FinOps Monitor on Databricks Apps using Unity Catalog System Tables with safe local CI fallback?",
            "answer": "Query `system.billing.usage` joined to `system.billing.list_prices` on `sku_name` and `usage_end_time` intervals, filtering by `custom_tags` (team, env, cost_center) and `usage_metadata.job_id`. Host the Streamlit/FastAPI app on Databricks Apps with `app.yaml` resource bindings (`sql-warehouse`) and service-principal OAuth so end users never hold warehouse tokens. In `finops_data.py`, normalize tuple/single-date picker inputs, inject explicit `try/except` SDK fallback for offline unit testing, and aggregate serverless vs. all-purpose DBU ratios to surface runaway interactive clusters.",
            "tags": ["databricks", "finops", "system-tables", "databricks-apps", "unity-catalog"],
            "rubricPoints": [
                "Join system.billing.usage with system.billing.list_prices for dollar-accurate DBU attribution",
                "Bind SQL Warehouse permissions via app.yaml service principal rather than static PATs",
                "Provide deterministic offline fallback for pytest/unit verification",
            ],
            "sources": [
                {"title": "Databricks Documentation: Monitor costs with System Tables", "url": "https://docs.databricks.com/en/admin/system-tables/billing.html"},
                {"title": "Databricks Documentation: Databricks Apps", "url": "https://docs.databricks.com/en/dev-tools/databricks-apps/index.html"},
            ],
        },
        {
            "id": "eco-new-qa-02",
            "domain": "Security, Governance & Compliance",
            "category": "Zero-Trust Security",
            "niche": "OIDC Workload Identity",
            "difficulty": "ARCHITECT",
            "source": "Security Handbook",
            "sourceDb": "security_handbook",
            "sourceLabel": "Security Handbook",
            "question": "Why does OIDC Workload Identity Federation eliminate long-lived cloud secrets in DataOps CI/CD pipelines, and which JWT claims must be enforced?",
            "answer": "Static Service Principal client secrets and AWS IAM access keys stored in CI variables represent a persistent exfiltration risk. With OIDC Workload Identity Federation, the CI runner (GitHub Actions) requests an ephemeral, cryptographically signed JWT from `token.actions.githubusercontent.com` and exchanges it with Azure Entra ID or AWS STS for a short-lived (15–60 min) access token. You MUST lock down the trust policy on `aud` (e.g., `api://AzureADTokenExchange`), `iss`, and strict `sub` claims (`repo:org/repo:environment:prod`) so forks or unapproved feature branches cannot impersonate production deployment principals.",
            "tags": ["oidc", "zero-trust", "devsecops", "cicd", "security"],
            "rubricPoints": [
                "Eliminates static secrets via ephemeral OIDC JWT to STS token exchange",
                "Enforce strict sub claim scoping (org, repo, branch/environment)",
                "Validate aud and iss against cloud identity federation trust policies",
            ],
            "sources": [
                {"title": "GitHub Docs: OpenID Connect security hardening", "url": "https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/about-security-hardening-with-openid-connect"},
            ],
        },
        {
            "id": "eco-new-qa-03",
            "domain": "Security, Governance & Compliance",
            "category": "DevSecOps Supply Chain",
            "niche": "SLSA & Artifact Integrity",
            "difficulty": "HARD",
            "source": "Security Handbook",
            "sourceDb": "security_handbook",
            "sourceLabel": "Security Handbook",
            "question": "How do you enforce SLSA Build Level 3 supply chain integrity, vulnerability scanning, and container provenance in enterprise data platform CI/CD?",
            "answer": "Pin all third-party GitHub Actions to immutable 40-character commit SHAs instead of mutable tags (`@v4`). Generate a CycloneDX/SPDX Software Bill of Materials (SBOM), scan Python/container layers with Trivy (`--exit-code 1 --severity CRITICAL,HIGH`) and secret-scan commits with Gitleaks before artifacts leave CI. Sign container images and wheel packages keyless via Sigstore Cosign backed by OIDC and Rekor transparency logs, and emit verifiable SLSA provenance attestations validated by admission controllers (Kyverno/OPA) before Spark-on-K8s or Databricks Jobs execute.",
            "tags": ["slsa", "trivy", "cosign", "devsecops", "supply-chain"],
            "rubricPoints": [
                "Pin CI actions to immutable commit SHAs",
                "Run Trivy CVE gates, Gitleaks secret scanning, and SBOM generation",
                "Sign artifacts with Sigstore Cosign OIDC + SLSA provenance verification",
            ],
            "sources": [
                {"title": "SLSA Framework Specification", "url": "https://slsa.dev/spec/v1.0/"},
            ],
        },
        {
            "id": "eco-new-qa-04",
            "domain": "Apache Spark & Distributed Compute",
            "category": "Apache Spark 4.0",
            "niche": "Spark Connect & VARIANT",
            "difficulty": "ARCHITECT",
            "source": "PySpark Handbook",
            "sourceDb": "pyspark_handbook",
            "sourceLabel": "PySpark Handbook",
            "question": "How does Spark 4.0 Spark Connect decouple client applications from the JVM driver, and what legacy PySpark APIs break during migration?",
            "answer": "Spark Connect separates thin Python/Go/Rust clients from the remote Spark driver via gRPC, transmitting unresolved Catalyst `LogicalPlan` protobufs instead of running a local Py4J JVM bridge. This slashes microservice container memory overhead and isolates dependency conflicts. However, direct JVM internals (`spark._jvm`, `SparkContext`, `.rdd`, accumulators, and custom Scala UDFs relying on Py4J) raise `PySparkNotImplementedError` / `SparkConnectException`. Migrate to pure DataFrame/Column expressions, `F.try_cast()` for Spark 4.0 ANSI-by-default compliance, Polymorphic Python UDTFs, and `spark.addTag()` for remote Spark UI observability.",
            "tags": ["spark4", "spark-connect", "ansi-mode", "pyspark", "grpc"],
            "rubricPoints": [
                "gRPC LogicalPlan protobuf transport removes Py4J and local JVM driver",
                "SparkContext, _jvm, and .rdd APIs are unsupported on Spark Connect",
                "Use F.try_cast for ANSI mode defaults and spark.addTag for query tagging",
            ],
            "sources": [
                {"title": "Apache Spark 4.0: Spark Connect Overview", "url": "https://spark.apache.org/docs/latest/spark-connect-overview.html"},
            ],
        },
        {
            "id": "eco-new-qa-05",
            "domain": "Modern Lakehouse Architectures",
            "category": "Spark 4.0 & Semi-Structured",
            "niche": "VARIANT Shredding",
            "difficulty": "HARD",
            "source": "PySpark Handbook",
            "sourceDb": "pyspark_handbook",
            "sourceLabel": "PySpark Handbook",
            "question": "Why does Apache Spark 4.0 / Delta Lake VARIANT data type outperform storing JSON payloads in raw STRING columns?",
            "answer": "Storing JSON in `STRING` columns forces full-row text parsing (`from_json` / `get_json_object`) on every query and disables columnar min/max statistics pruning. The binary `VARIANT` type encodes semi-structured trees in a self-describing binary layout that supports fast field path extraction (`variant_get` / `try_variant_get`) and automatic **Variant Shredding** into typed Parquet sub-columns for frequently accessed keys. This achieves near-native Parquet columnar compression, predicate pushdown, and schema-evolution resilience without rigid `StructType` migrations.",
            "tags": ["variant", "spark4", "delta-lake", "parquet", "semi-structured"],
            "rubricPoints": [
                "Binary self-describing encoding avoids repeated JSON text parsing",
                "Variant shredding materializes hot paths as typed Parquet sub-columns",
                "Enables predicate pushdown and min/max data skipping on nested fields",
            ],
            "sources": [
                {"title": "Apache Spark 4.0 VARIANT Specification", "url": "https://spark.apache.org/docs/latest/sql-ref-datatypes.html"},
            ],
        },
    ]

    qa_data.extend(new_qas)
    qa_path.write_text(json.dumps(qa_data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"✓ questions.json: added {len(new_qas)} ecosystem Q&As (total {len(qa_data)})")

    arch_path = DATA_DIR / "data_architecture.json"
    arch_data: list[dict[str, Any]] = json.loads(arch_path.read_text(encoding="utf-8"))
    arch_data = [x for x in arch_data if not str(x.get("id", "")).startswith(("eco-new-arch-",))]

    new_archs = [
        {
            "id": "eco-new-arch-01",
            "source": "Security Handbook",
            "category": "Security & Governance",
            "niche": "Zero-Trust Lakehouse",
            "difficulty": "ARCHITECT",
            "question": "Design a Zero-Trust Cloud Perimeter and Fine-Grained Data Governance Architecture for a Multi-Business-Unit Databricks & Azure Lakehouse.",
            "answer": "### 1. Network Perimeter & Control/Compute Plane Isolation\n- Deploy compute planes into customer-managed VNets (`No Public IP` / Secure Cluster Connectivity) with Azure Private Link backhaul for both front-end Workspace access and back-end Control Plane relays.\n- Disable public network access on ADLS Gen2 and Azure Key Vault; route all storage traffic through dedicated Private Endpoints and egress firewall rules.\n\n### 2. Identity & Secretless CI/CD\n- Eliminate static Service Principal secrets by federating GitHub Actions OIDC tokens to Entra ID Workload Identities scoped to `prod` environments.\n- Use Unity Catalog Storage Credentials backed by Azure Access Connectors (Managed Identity) rather than SAS tokens or account keys.\n\n### 3. Fine-Grained Data Access & Compliance\n- Enforce Unity Catalog Row Filters (`CREATE FUNCTION ... RETURN ...`) and Dynamic Column Masks on PII tables so analysts only see unmasked values for their authorized region.\n- Stream `system.access.audit` logs to Microsoft Sentinel / SIEM for immutable forensic alerting.",
            "constraints": [
                "Zero public internet exposure for storage accounts and Spark worker nodes",
                "No long-lived cloud secrets in CI/CD or notebooks",
                "Row-level and column-level PII masking enforced consistently across SQL and PySpark",
            ],
            "tradeoffs": [
                "VNet injection + Private Link DNS adds initial IaC complexity vs. workspace-managed networks",
                "Serverless SQL/Compute relies on Databricks-managed NCC (Network Connectivity Config) private endpoints rather than customer VNet injection",
            ],
            "sources": [
                {"title": "Databricks Security & Trust Center: Private Link", "url": "https://docs.databricks.com/en/security/network/classic/private-link.html"},
            ],
        },
        {
            "id": "eco-new-arch-02",
            "source": "PySpark Handbook",
            "category": "Compute & Optimization",
            "niche": "Multi-Engine Spark 4.0 Adapters",
            "difficulty": "ARCHITECT",
            "question": "Architect a Cloud-Portable PySpark 4.0 Platform Layer Supporting Microsoft Fabric OneLake, AWS EMR Glue, GCP Dataproc Serverless, and Kubernetes Spark Operator.",
            "answer": "### 1. Decoupled Control & Client Plane\n- Standardize thin client services on **Spark Connect** (`sc://`) with ANSI mode enabled (`try_cast` for defensive casting) and structured JSON logging.\n\n### 2. Platform Adapter Boundary\n- Abstract cloud-specific secrets and filesystem prefixes behind typed Python `Protocol` adapters (`06_platform_adapters`):\n  - **Microsoft Fabric**: `notebookutils` credential injection + `abfss://<workspace>@onelake.dfs.fabric.microsoft.com/...` + `spark.sql.parquet.vorder.enabled=true` for Direct Lake.\n  - **AWS EMR**: Glue Data Catalog Hive metastore sync + S3A Magic Committer (`fs.s3a.committer.name=magic`) for zero-rename atomic writes.\n  - **GCP Dataproc Serverless**: `spark-bigquery-with-dependencies` indirect GCS staging + CMEK encryption.\n  - **Kubernetes**: Spark Operator `SparkApplication` CRD paired with **Volcano** gang scheduling to prevent executor pod deadlocks under cluster saturation.",
            "constraints": [
                "Business transformation code must remain 100% cloud-agnostic",
                "Zero `dbfs:/` or `mssparkutils` hardcoding in core transformation modules",
            ],
            "tradeoffs": [
                "Adapter abstraction adds thin boilerplate vs. direct vendor SDK calls, but prevents expensive multi-cloud rewrites",
            ],
            "sources": [
                {"title": "Apache Spark 4.0 Documentation", "url": "https://spark.apache.org/docs/latest/"},
            ],
        },
    ]

    arch_data.extend(new_archs)
    arch_path.write_text(json.dumps(arch_data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"✓ data_architecture.json: added {len(new_archs)} ecosystem scenarios (total {len(arch_data)})")


def sync_interview_pillars_15_to_20() -> None:
    src_dir = BASE_DIR / "data-engineering-interview-handbook" / "pillars"
    dst_dir = HUB_DIR / "docs" / "interview_prep" / "pillars"
    dst_dir.mkdir(parents=True, exist_ok=True)
    copied = 0
    for f in sorted(src_dir.glob("*.md")):
        if f.name.startswith(("15_", "16_", "17_", "18_", "19_", "20_", "all_20_")):
            content = normalize_levels(f.read_text(encoding="utf-8"))
            (dst_dir / f.name).write_text(content, encoding="utf-8")
            copied += 1
    print(f"✓ docs/interview_prep/pillars: synchronized {copied} Pillar 15-20 files")


def main() -> None:
    ingest_pyspark_new_modules()
    ingest_sql_handbook_exercises()
    ingest_databricks_finops_python()
    ingest_curated_qa_and_scenarios()
    sync_interview_pillars_15_to_20()


if __name__ == "__main__":
    main()
