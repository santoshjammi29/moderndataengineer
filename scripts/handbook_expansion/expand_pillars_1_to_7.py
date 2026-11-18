"""
Questions 11-15 for Pillars 01 through 07 (35 questions)
"""

PILLAR_EXTENSIONS_P1_P7 = {
    "01": [
        {
            "id": "pil01-catalyst-custom-rules",
            "category": "SPARK & DATABRICKS",
            "domain": "Distributed Compute & Execution Engines",
            "subdomain": "Catalyst Optimizer Internals",
            "niche": "Catalyst Optimizer Internals",
            "difficulty": "ARCHITECT",
            "question": "How do you author, inject, and test custom Catalyst optimization rules in Apache Spark?",
            "answer": "Custom Catalyst rules extend `Rule[LogicalPlan]` and implement pattern matching on TreeNode trees using partial functions.\n```scala\nimport org.apache.spark.sql.catalyst.plans.logical._\nimport org.apache.spark.sql.catalyst.rules.Rule\n\ncase class EnforceStorageTierFilter(tier: String) extends Rule[LogicalPlan] {\n  def apply(plan: LogicalPlan): LogicalPlan = plan transform {\n    case scan @ LogicalRelation(relation, _, _, _) =>\n      Filter(EqualTo(UnresolvedAttribute(\"tier\"), Literal(tier)), scan)\n  }\n}\n// Registering into SparkSessionExtensions:\nspark.experimental.extraOptimizations = Seq(EnforceStorageTierFilter(\"HOT\"))\n```\n**Injection Points:** Via `SparkSessionExtensions.injectOptimizerRule` or `injectResolutionRule`. Always ensure idempotency: applying a rule multiple times (`rule(rule(plan))`) must produce an identical tree to prevent infinite loops in the fixed-point rule executor.",
            "linked_concept_id": "spark-catalyst"
        },
        {
            "id": "pil01-shuffle-spill-triage",
            "category": "SPARK & DATABRICKS",
            "domain": "Distributed Compute & Execution Engines",
            "subdomain": "Memory Management & Tuning",
            "niche": "Tungsten Engine & Memory Layout",
            "difficulty": "HARD",
            "question": "Explain the difference between Spill (Memory) and Spill (Disk) in Spark UI and how Tungsten UnsafeExternalSorter handles them.",
            "answer": "**Spill (Memory):** The uncompressed size of data in JVM/off-heap Tungsten execution memory prior to serialization.\n**Spill (Disk):** The compressed physical byte size written to local NVMe/SSD scratch space (`/local_disk0`). Typically 2x to 5x smaller due to Snappy/LZ4 compression.\n**Mechanism:** When Tungsten's `UnsafeExternalSorter` exhausts its allocated memory block (`spark.memory.fraction * 0.5`), it sorts in-memory 8-byte pointer records and spills contiguous runs to disk. During the final merge phase, an external K-way merge sorter combines spilled files.\n**Remediation:** Increase `spark.sql.shuffle.partitions`, tune `spark.sql.adaptive.advisoryPartitionSizeInBytes` to 128MB, or increase executor memory fraction.",
            "linked_concept_id": "spark-memory"
        },
        {
            "id": "pil01-aqe-dynamic-coalescing",
            "category": "SPARK & DATABRICKS",
            "domain": "Distributed Compute & Execution Engines",
            "subdomain": "Adaptive Query Execution",
            "niche": "Shuffle Architecture & Sizing",
            "difficulty": "HARD",
            "question": "How does Adaptive Query Execution (AQE) dynamically coalesce post-shuffle partitions at runtime?",
            "answer": "Traditionally, `spark.sql.shuffle.partitions` (default 200) was fixed regardless of dataset size, causing either small-file I/O thrashing or out-of-memory spill.\n**AQE Runtime Coalescing:**\n1. At stage boundaries, shuffle write tasks output MapStatus statistics detailing exact byte sizes of each shuffle partition.\n2. The driver collects statistics and applies `CoalesceShufflePartitions` rule.\n3. Consecutive shuffle partitions whose combined size is less than `spark.sql.adaptive.advisoryPartitionSizeInBytes` (default 64MB-128MB) are merged into a single reader task.\n```python\nspark.conf.set(\"spark.sql.adaptive.enabled\", \"true\")\nspark.conf.set(\"spark.sql.adaptive.coalescePartitions.enabled\", \"true\")\nspark.conf.set(\"spark.sql.adaptive.advisoryPartitionSizeInBytes\", \"134217728\") # 128MB target\n```\nThis eliminates manual tuning and prevents the creation of thousands of tiny output files.",
            "linked_concept_id": "spark-catalyst"
        },
        {
            "id": "pil01-rocksdb-state-store-streaming",
            "category": "SPARK & DATABRICKS",
            "domain": "Distributed Compute & Execution Engines",
            "subdomain": "Structured Streaming Internals",
            "niche": "Query Optimization & Pruning",
            "difficulty": "ARCHITECT",
            "question": "Why is the off-heap RocksDB StateStore mandatory for production 24/7 stateful Structured Streaming?",
            "answer": "The default `HDFSBackedStateStoreProvider` stores state directly on the JVM heap. For high-cardinality stateful streams (e.g. 50M unique sessions or deduplication across 14-day watermarks), JVM heap explodes, causing prolonged Full GC pauses (>30s) and executor timeouts.\n**RocksDB StateStore:**\n- Stores state off-heap in local NVMe-backed RocksDB C++ instances.\n- Bypasses JVM garbage collection completely; memory footprint is strictly bounded via block cache (`spark.sql.streaming.stateStore.rocksdb.maxMemoryUsageMB`).\n- Checkpointing asynchronously syncs SST files to cloud storage (S3/ADLS/GCS).\n```python\nspark.conf.set(\"spark.sql.streaming.stateStore.providerClass\",\n               \"org.apache.spark.sql.execution.streaming.state.RocksDBStateStoreProvider\")\nspark.conf.set(\"spark.sql.streaming.stateStore.rocksdb.boundedMemoryUsage\", \"true\")\n```",
            "linked_concept_id": "spark-streaming"
        },
        {
            "id": "pil01-photon-cpp-vectorization",
            "category": "SPARK & DATABRICKS",
            "domain": "Distributed Compute & Execution Engines",
            "subdomain": "Native Execution Engines",
            "niche": "Catalyst Optimizer Internals",
            "difficulty": "ARCHITECT",
            "question": "How does Databricks Photon vectorization differ architecturally from Spark's native Whole-Stage Java Codegen?",
            "answer": "**Whole-Stage Codegen (Classic Spark):** Janino compiles physical operators into a single flat Java `while`-loop over rows. While it eliminates virtual dispatch, it is constrained by JVM JIT optimization limits, 64KB bytecode method limits, and Java's lack of explicit SIMD instruction utilization.\n**Databricks Photon:**\n- Rewrites the execution engine in native C++.\n- Vectorized execution: Processes columnar batches of 1,024-4,096 row vectors using CPU SIMD registers (AVX-512) for hardware-level parallelism.\n- Memory layout: Operates directly on native column vectors with zero JVM heap/deserialization overhead.\n- Seamless Fallback: Photon evaluates operators; if an unsupported operator (e.g. custom Python UDF) is encountered, it seamlessly passes data back to standard JVM execution.",
            "linked_concept_id": "spark-catalyst"
        }
    ],
    "02": [
        {
            "id": "pil02-dabs-gitops-cicd",
            "category": "LAKEHOUSE PLATFORMS",
            "domain": "Enterprise Lakehouse Governance",
            "subdomain": "DevOps & CI/CD",
            "niche": "Platform Architecture & Fabric",
            "difficulty": "HARD",
            "question": "How do Databricks Asset Bundles (DABs) implement multi-environment GitOps CI/CD across Dev, Staging, and Prod?",
            "answer": "Databricks Asset Bundles (DABs) declare jobs, pipelines (DLT), and notebooks as declarative YAML code managed in Git.\n```yaml\nbundle:\n  name: retail-lakehouse\ntargets:\n  dev:\n    default: true\n    workspace:\n      host: https://adb-dev.azuredatabricks.net\n  prod:\n    workspace:\n      host: https://adb-prod.azuredatabricks.net\n    run_as:\n      service_principal_name: sp-lakehouse-cicd\nresources:\n  jobs:\n    daily_etl:\n      tasks:\n        - task_key: dlt_pipeline\n          pipeline_task:\n            pipeline_id: ${resources.pipelines.sales_dlt.id}\n```\n**Workflow:** CI/CD runners (GitHub Actions/Azure DevOps) authenticate as a dedicated Service Principal, run `databricks bundle validate`, and deploy via `databricks bundle deploy -t prod`, ensuring 100% infrastructure-as-code reproducibility.",
            "linked_concept_id": "databricks-unity-catalog"
        },
        {
            "id": "pil02-uc-row-column-masking",
            "category": "LAKEHOUSE PLATFORMS",
            "domain": "Enterprise Lakehouse Governance",
            "subdomain": "Security & Fine-Grained Access Control",
            "niche": "Unity Catalog Governance",
            "difficulty": "HARD",
            "question": "How do you configure dynamic row filtering and column masking in Unity Catalog?",
            "answer": "Unity Catalog supports fine-grained access control using SQL user-defined functions (UDFs) evaluated dynamically at runtime based on caller groups:\n```sql\n-- 1. Column Masking Function\nCREATE OR REPLACE FUNCTION mask_ssn(ssn STRING)\nRETURNS STRING\nRETURN CASE \n  WHEN is_account_group_member('hr_admins') THEN ssn\n  ELSE CONCAT('XXX-XX-', RIGHT(ssn, 4))\nEND;\n\nALTER TABLE gold.employees ALTER COLUMN ssn SET MASK mask_ssn;\n\n-- 2. Row Filtering Function\nCREATE OR REPLACE FUNCTION filter_by_region(region STRING)\nRETURNS BOOLEAN\nRETURN is_account_group_member('executives') OR \n       (is_account_group_member('emea_sales') AND region = 'EMEA');\n\nALTER TABLE gold.sales SET ROW FILTER filter_by_region ON (region);\n```\nQueries run without code changes; unauthorized users automatically receive masked values and filtered rows.",
            "linked_concept_id": "databricks-unity-catalog"
        },
        {
            "id": "pil02-serverless-compute-architecture",
            "category": "LAKEHOUSE PLATFORMS",
            "domain": "Enterprise Lakehouse Governance",
            "subdomain": "Serverless Compute & FinOps",
            "niche": "Platform Architecture & Fabric",
            "difficulty": "ARCHITECT",
            "question": "What is the architectural difference between Databricks Serverless Compute and Classic Customer-Managed Compute?",
            "answer": "**Classic Compute:** Worker VMs are provisioned inside the customer's cloud VNet/VPC. Clusters take 3-7 minutes to spin up (VM bootstrapping), idle clusters burn cloud infrastructure costs, and the customer manages subnet IP exhaustion and VM quota limits.\n**Serverless Compute:**\n- Compute runs inside a secure, multi-tenant fleet managed by Databricks in the control plane.\n- **Instant Provisioning:** Workloads start in < 2 seconds because a warm pool of pre-warmed containerized executors is dynamically attached.\n- **True Zero Idle:** Scale-down to 0 is instantaneous upon query completion; zero DBU or VM cost when queries are idle.\n- **Network Isolation:** Databricks connects to customer storage via Secure Storage Connectors and Private Link endpoints.",
            "linked_concept_id": "databricks-unity-catalog"
        },
        {
            "id": "pil02-system-tables-finops",
            "category": "LAKEHOUSE PLATFORMS",
            "domain": "Enterprise Lakehouse Governance",
            "subdomain": "FinOps & Telemetry",
            "niche": "Platform Architecture & Fabric",
            "difficulty": "HARD",
            "question": "How do you query Databricks System Tables to detect cost anomalies and untagged cluster spend?",
            "answer": "Databricks system tables expose audit logs, billing usage, and access telemetry as standard Delta tables under the `system` catalog:\n```sql\n-- Track top 5 most expensive DLT pipelines over the last 30 days\nSELECT \n  usage_metadata.pipeline_id,\n  SUM(usage_quantity) AS total_dbus,\n  SUM(usage_quantity * 0.35) AS estimated_usd -- custom rate card\nFROM system.billing.usage\nWHERE sku_name LIKE '%DLT%'\n  AND usage_date >= current_date() - INTERVAL 30 DAYS\nGROUP BY 1\nORDER BY total_dbus DESC\nLIMIT 5;\n\n-- Audit untagged clusters\nSELECT cluster_id, SUM(usage_quantity) AS unallocated_dbus\nFROM system.billing.usage\nWHERE custom_tags['CostCenter'] IS NULL\nGROUP BY 1;\n```",
            "linked_concept_id": "databricks-unity-catalog"
        },
        {
            "id": "pil02-lakeflow-declarative-pipelines",
            "category": "LAKEHOUSE PLATFORMS",
            "domain": "Enterprise Lakehouse Governance",
            "subdomain": "Data Ingestion & Orchestration",
            "niche": "Platform Architecture & Fabric",
            "difficulty": "ARCHITECT",
            "question": "What are Databricks Lakeflow Pipelines, and how do they evolve Delta Live Tables (DLT)?",
            "answer": "**Lakeflow** unifies data ingestion (Lakeflow Connect for Salesforce, Postgres, Oracle), transformation (Lakeflow Pipelines), and orchestration (Lakeflow Jobs) into a single declarative platform.\n- **Lakeflow Connect:** Native, serverless change-data-capture (CDC) connectors that extract database log streams into Bronze Delta tables without third-party tools (Fivetran/Debezium).\n- **Evolution over Classic DLT:** Adds real-time micro-batch triggering with sub-second latencies, unified SQL/Python declarative syntax, native schema contracts, and automatic dead-letter queue (DLQ) branching.\n- **GitOps First:** Fully configured via DABs and deployed with automated blue-green cutover.",
            "linked_concept_id": "databricks-unity-catalog"
        }
    ],
    "03": [
        {
            "id": "pil03-liquid-clustering-mechanics",
            "category": "MODERN LAKEHOUSE FORMATS",
            "domain": "Lakehouse Storage Formats",
            "subdomain": "Physical Layout & Compaction",
            "niche": "Delta Lake 3.x Architecture",
            "difficulty": "HARD",
            "question": "How does Delta Lake 3.x Liquid Clustering work internally, and why does it supersede Hive partitioning and Z-Ordering?",
            "answer": "**Flaws of Hive Partitioning & Z-Order:** Hive partitioning creates rigid directory hierarchies and causes the 'small file problem' on skewed/high-cardinality keys. Z-Order requires full file rewrites across clustered columns and cannot incrementally cluster new data.\n**Liquid Clustering (`CLUSTER BY`):**\n- Decouples clustering from physical directories; writes files into flat folders.\n- Uses multi-dimensional space-filling curves (Hilbert curves) to group records with similar values in the same Parquet files.\n- **Incremental Clustering:** `OPTIMIZE` only reorganizes new unclustered files rather than rewriting the whole table.\n- **Dynamic Flexibility:** Clustering keys can be altered on an existing table (`ALTER TABLE ... CLUSTER BY (...)`) without rewriting historical files.",
            "linked_concept_id": "lakehouse-table-formats"
        },
        {
            "id": "pil03-uniform-universal-format",
            "category": "MODERN LAKEHOUSE FORMATS",
            "domain": "Lakehouse Storage Formats",
            "subdomain": "Multi-Engine Interoperability",
            "niche": "UniForm Multi-Format Interop",
            "difficulty": "HARD",
            "question": "How does Delta Lake Universal Format (UniForm) generate Iceberg and Hudi metadata without duplicating Parquet data files?",
            "answer": "All three formats (Delta, Iceberg, Hudi) use Apache Parquet as their physical data file format. They differ solely in transaction log metadata.\n**UniForm Mechanics:**\n1. Delta Lake writes standard Parquet files and records ACID commits in `_delta_log/`.\n2. In the background or inline upon commit, UniForm translates Delta commit actions into an Iceberg metadata tree (`.metadata.json`, manifest lists, and manifest files).\n3. External engines (Snowflake, BigQuery, AWS Athena) query the table as a native Apache Iceberg table using the generated Iceberg metadata pointers.\n```sql\nALTER TABLE gold.sales SET TBLPROPERTIES(\n  'delta.universalFormat.enabledFormats' = 'iceberg'\n);\n```\nZero physical data duplication; single-source storage saves 100% of redundant lakehouse storage costs.",
            "linked_concept_id": "lakehouse-table-formats"
        },
        {
            "id": "pil03-deletion-vectors-internals",
            "category": "MODERN LAKEHOUSE FORMATS",
            "domain": "Lakehouse Storage Formats",
            "subdomain": "ACID Mechanics & Mutation",
            "niche": "Delta Lake 3.x Architecture",
            "difficulty": "ARCHITECT",
            "question": "Explain the internal storage structure and read/write path of Delta Lake Deletion Vectors.",
            "answer": "**Write Path:** When updating or deleting rows in a 500MB Parquet file, Delta Lake avoids rewriting the 500MB file. Instead, it writes a tiny external **Roaring Bitmap** file (Deletion Vector) storing the 0-based integer row ordinals that are marked deleted.\n**Read Path:**\n1. The reader reads the Parquet file and the associated Deletion Vector bitmap.\n2. In vectorized scan (Photon or Spark vectorized reader), rows matching bit ordinals in the bitmap are dropped in memory at hardware speed.\n3. Write amplification drops from $500\\text{MB}$ down to a few kilobytes.\n**Compaction:** Background `OPTIMIZE` jobs purge Deletion Vectors by rewriting dirty files during scheduled maintenance.",
            "linked_concept_id": "lakehouse-table-formats"
        },
        {
            "id": "pil03-shallow-clone-vs-deep-clone",
            "category": "MODERN LAKEHOUSE FORMATS",
            "domain": "Lakehouse Storage Formats",
            "subdomain": "Cloning & Disaster Recovery",
            "niche": "Delta Lake 3.x Architecture",
            "difficulty": "MEDIUM",
            "question": "What is the operational difference between SHALLOW CLONE and DEEP CLONE in Delta Lake?",
            "answer": "**SHALLOW CLONE:** Copies only the Delta transaction log metadata; points to existing Parquet files in the source table storage.\n- *Cost & Speed:* Near-instantaneous (seconds), zero additional storage cost.\n- *Use Case:* Staging/testing environments, ML feature experimentation.\n- *Risk:* If source files are deleted via `VACUUM`, the shallow clone becomes corrupt.\n**DEEP CLONE:** Physically copies all transaction logs AND data files to a new storage location.\n- *Cost & Speed:* Full physical I/O copy.\n- *Use Case:* Disaster recovery, geographical failover, production sandbox isolation.",
            "linked_concept_id": "lakehouse-table-formats"
        },
        {
            "id": "pil03-optimistic-concurrency-conflicts",
            "category": "MODERN LAKEHOUSE FORMATS",
            "domain": "Lakehouse Storage Formats",
            "subdomain": "ACID Mechanics & Concurrency",
            "niche": "Delta Lake 3.x Architecture",
            "difficulty": "HARD",
            "question": "How does Optimistic Concurrency Control (OCC) resolve write conflicts in Delta Lake, and what triggers a ConcurrentModificationException?",
            "answer": "Delta Lake assumes transactions will not conflict. Each writer reads table version $N$, stages changes locally, and attempts to commit version $N+1$.\n**Commit Protocol:**\n1. If another writer committed version $N+1$ first, writer 2 checks if its modified files overlap with writer 1's commit.\n2. **Append Conflict:** Two concurrent appends never conflict; Delta automatically rebases writer 2's commit to version $N+2$.\n3. **Update/Delete Conflict:** If Writer 1 updated partition `date='2026-11-18'` and Writer 2 attempted to update the same partition, Delta checks file-level predicates.\n4. If both writers modified the exact same Parquet file, Delta Lake throws `ConcurrentModificationException` and rolls back.",
            "linked_concept_id": "lakehouse-table-formats"
        }
    ],
    "04": [
        {
            "id": "pil04-s3-prefix-throttling",
            "category": "STORAGE & DATA LAKES",
            "domain": "Cloud Object Storage & Layout",
            "subdomain": "Request Throttling & Scaling",
            "niche": "Cloud Object Storage & Consistency",
            "difficulty": "HARD",
            "question": "Why do massive Spark jobs hit HTTP 503 Slow Down errors on Amazon S3, and how do you remediate prefix throttling?",
            "answer": "**Root Cause:** Amazon S3 partitions storage keys into internal partition prefixes. Each prefix supports **3,500 PUT/POST/DELETE** and **5,500 GET** requests per second. When 1,000 Spark executor cores simultaneously write to `s3://bucket/table/year=2026/month=11/part-*.parquet`, all requests target a single prefix, triggering HTTP 503.\n**Remediation:**\n1. Use hash-prefixed directory keys or S3 Express One Zone.\n2. Adopt Delta Lake or Iceberg with modern direct committers (`magic committer` or S3A committer) to eliminate rename operations (`mv` calls that trigger thousands of copy/delete calls).\n3. Increase S3A retry limits: `fs.s3a.retry.limit=20` and `fs.s3a.retry.interval=500ms`.",
            "linked_concept_id": "storage-scaling"
        },
        {
            "id": "pil04-small-file-compaction-patterns",
            "category": "STORAGE & DATA LAKES",
            "domain": "Cloud Object Storage & Layout",
            "subdomain": "File Sizing & Maintenance",
            "niche": "Storage Optimization & Layout",
            "difficulty": "MEDIUM",
            "question": "What is the optimal Parquet file size in cloud object storage, and how do you orchestrate automated bin-packing?",
            "answer": "**Optimal Target:** **128 MB to 1 GB** per file. Smaller files (< 10MB) incur excessive HTTP metadata listing overhead and explode metastore memory. Massive files (> 2GB) degrade split parallelism and increase OOM risk.\n**Compaction Strategies:**\n1. **Auto-Compaction (Databricks):** Automatically packs micro-batches during write: `spark.databricks.delta.autoCompact.enabled = true`.\n2. **Scheduled Offline Compaction:** Nightly maintenance DAG runs `OPTIMIZE table_name` targeting uniform 128MB files.\n3. **Vacuum Hygiene:** `VACUUM table_name RETAIN 168 HOURS` to delete tombstoned Parquet files after 7 days, reclaiming storage costs.",
            "linked_concept_id": "storage-scaling"
        },
        {
            "id": "pil04-lakehouse-dr-rpo-rto",
            "category": "STORAGE & DATA LAKES",
            "domain": "Cloud Object Storage & Layout",
            "subdomain": "Disaster Recovery & Replication",
            "niche": "Disaster Recovery & High Availability",
            "difficulty": "ARCHITECT",
            "question": "How do you design an enterprise Lakehouse Disaster Recovery (DR) architecture satisfying RPO < 15 mins and RTO < 1 hour?",
            "answer": "**Architecture Blueprint: Active-Passive Warm Standby**\n1. **Data Replication (RPO < 15m):** Enable cloud-native asynchronous cross-region replication (e.g. AWS S3 Cross-Region Replication or Azure GRS/CRR). For transaction logs, stream Delta Change Data Feed (CDF) or run incremental `DEEP CLONE` every 15 minutes.\n2. **Metastore Sync:** Replicate Unity Catalog / AWS Glue Catalog metadata across regions using automated event-driven AWS Lambda / Azure Functions.\n3. **Compute Failover (RTO < 1h):** Standby region maintains 0 active compute nodes. Databricks Asset Bundles (DABs) or Terraform scripts pre-define cluster templates and DAGs in the DR region.\n4. **Failover Execution:** DNS routing (Route53/Traffic Manager) shifts traffic, Terraform scales standby cluster, and pipelines resume from the last replicated Delta log checkpoint.",
            "linked_concept_id": "storage-scaling"
        },
        {
            "id": "pil04-storage-tiering-access-patterns",
            "category": "STORAGE & DATA LAKES",
            "domain": "Cloud Object Storage & Layout",
            "subdomain": "FinOps & Storage Classes",
            "niche": "Storage Optimization & Layout",
            "difficulty": "HARD",
            "question": "What are the pitfalls of transitioning active Delta Lake or Iceberg tables to S3 Glacier or ADLS Cold tiers?",
            "answer": "**The Glacier / Deep Archive Pitfall:** S3 Glacier Flexible and Deep Archive objects are not immediately accessible; reading an object requires asynchronous retrieval taking minutes to hours. If a query runs against a Delta table where historical Parquet files were moved to Glacier, the query immediately crashes with `FileNotFoundException` or `403 Forbidden`.\n**Safe Tiering Strategy:**\n- Use **S3 Intelligent-Tiering** or **Glacier Instant Retrieval**, which offers millisecond access latency identical to S3 Standard.\n- For compliance archives (> 3 years), export snapshots to dedicated unmanaged archive tables and delete them from active queryable lakehouse catalogs before applying Glacier Deep Archive rules.",
            "linked_concept_id": "storage-scaling"
        },
        {
            "id": "pil04-zero-trust-lakehouse-security",
            "category": "STORAGE & DATA LAKES",
            "domain": "Cloud Object Storage & Layout",
            "subdomain": "Security & Network Perimeter",
            "niche": "Data Lake Security Architecture",
            "difficulty": "ARCHITECT",
            "question": "How do you implement a Zero-Trust network perimeter for a Cloud Lakehouse on AWS/Azure?",
            "answer": "1. **Storage Perimeter:** Disable all public Internet access on storage buckets. Enforce storage bucket policies requiring access via VPC Endpoints (AWS PrivateLink) or Azure Private Endpoints.\n2. **Customer-Managed Encryption Keys (CMK):** Encrypt all data at rest using cloud HSM keys (AWS KMS / Azure Key Vault) with annual key rotation.\n3. **Identity Federation:** Ban shared access keys/SAS tokens. Enforce short-lived IAM assume-role policies mapped directly to Unity Catalog or IAM identity providers.\n4. **Control Plane Isolation:** Front all BI and developer access through secure bastion hosts or corporate VPNs using private workspace connections.",
            "linked_concept_id": "storage-scaling"
        }
    ],
    "05": [
        {
            "id": "pil05-airflow-2-vs-3-architecture",
            "category": "ORCHESTRATION & PIPELINES",
            "domain": "Pipeline Orchestration & Schedulers",
            "subdomain": "Airflow Architecture & Evolution",
            "niche": "Scheduler Mechanics & Executors",
            "difficulty": "HARD",
            "question": "What are the architectural breakthroughs in Apache Airflow 3.0 compared to Airflow 2.x?",
            "answer": "**Airflow 2.x Constraints:** Monolithic scheduler that evaluates DAG code directly, tight coupling between scheduler and webserver, and database bottlenecks on large clusters (> 100k tasks/day).\n**Airflow 3.0 Breakthroughs:**\n1. **Decoupled Task Execution API:** Tasks no longer communicate directly with the backend database. Workers interact via a dedicated, secure gRPC Task Execution API, enabling multi-language task runners.\n2. **Stateless Scalable Scheduler:** Schedulers do not parse DAG files directly; dedicated DAG Processor pods isolate parsing from task scheduling.\n3. **Event-Driven DAGs:** Native data assets and event-driven triggers eliminate rigid cron scheduling, triggering downstream DAGs instantly when an upstream table updates.",
            "linked_concept_id": "airflow-orchestration"
        },
        {
            "id": "pil05-dynamic-task-mapping",
            "category": "ORCHESTRATION & PIPELINES",
            "domain": "Pipeline Orchestration & Schedulers",
            "subdomain": "Dynamic Workflows",
            "niche": "Task Scheduling & Dependency Graphs",
            "difficulty": "HARD",
            "question": "How does Dynamic Task Mapping (.expand()) work in Airflow 2.3+, and how does it prevent the DAG parsing bottleneck?",
            "answer": "Historically, creating dynamic tasks required generating tasks inside a Python loop during DAG parsing (`for f in files: PythonOperator(...)`), requiring external API calls that overloaded the Airflow scheduler.\n**Dynamic Task Mapping (`.expand()`):**\n```python\n@task\ndef list_tables():\n    return [\"customers\", \"orders\", \"payments\"]\n\n@task\ndef process_table(table_name: str):\n    # processes individual table\n    pass\n\n# Dynamic expansion occurs at RUNTIME, not parse time:\nprocess_table.expand(table_name=list_tables())\n```\nThe scheduler parses a single task definition. At runtime, when `list_tables` completes, the scheduler dynamically generates mapped task instances in the database without re-evaluating the Python DAG file.",
            "linked_concept_id": "airflow-orchestration"
        },
        {
            "id": "pil05-deferrable-operators-triggerer",
            "category": "ORCHESTRATION & PIPELINES",
            "domain": "Pipeline Orchestration & Schedulers",
            "subdomain": "Resource Efficiency & Async Execution",
            "niche": "Scheduler Mechanics & Executors",
            "difficulty": "ARCHITECT",
            "question": "Explain the internals of Airflow Deferrable Operators and the Triggerer daemon. How does it save worker slots?",
            "answer": "**Problem:** Standard sensors (e.g. `S3KeySensor` or `DatabricksSubmitRunOperator`) occupy an entire worker slot (Celery worker or K8s pod) in a blocking sleep loop, starving the cluster of resources for hours.\n**Deferrable Operators & Triggerer:**\n1. When an operator waits for an external event, it yields control by calling `self.defer(trigger=..., method_name=...)`.\n2. The worker releases the task slot immediately and terminates the task pod.\n3. A lightweight **Triggerer daemon** (running Python `asyncio` event loop) monitors thousands of deferred tasks in a single process.\n4. When the trigger condition is met (e.g. S3 file arrives), the Triggerer notifies the scheduler, which assigns the continuation method to an available worker slot.",
            "linked_concept_id": "airflow-orchestration"
        },
        {
            "id": "pil05-custom-xcom-backends",
            "category": "ORCHESTRATION & PIPELINES",
            "domain": "Pipeline Orchestration & Schedulers",
            "subdomain": "Data Sharing & State Management",
            "niche": "Airflow Production Runbooks",
            "difficulty": "MEDIUM",
            "question": "How do you configure a Custom XCom Backend to store large task outputs in S3/ADLS without bloat?",
            "answer": "By default, XCom stores return values directly in the Airflow metadata database (Postgres/MySQL). Returning large dataframes or arrays causes database connection pool exhaustion and metadata bloat.\n**Custom XCom Backend:**\n```python\nfrom airflow.models.xcom import BaseXCom\nimport json, uuid\n\nclass S3XComBackend(BaseXCom):\n    @staticmethod\n    def serialize_value(value):\n        s3_key = f\"xcom/{uuid.uuid4()}.json\"\n        s3_client.put_object(Bucket=\"airflow-xcom\", Key=s3_key, Body=json.dumps(value))\n        return BaseXCom.serialize_value(f\"s3://airflow-xcom/{s3_key}\")\n\n    @staticmethod\n    def deserialize_value(result):\n        s3_uri = BaseXCom.deserialize_value(result)\n        # Read JSON from S3 and return deserialized object\n        return read_from_s3(s3_uri)\n```\nSet `AIRFLOW__CORE__XCOM_BACKEND = my_module.S3XComBackend` in Airflow config.",
            "linked_concept_id": "airflow-orchestration"
        },
        {
            "id": "pil05-multi-scheduler-high-availability",
            "category": "ORCHESTRATION & PIPELINES",
            "domain": "Pipeline Orchestration & Schedulers",
            "subdomain": "High Availability & Scalability",
            "niche": "Scheduler Mechanics & Executors",
            "difficulty": "HARD",
            "question": "How do multiple active Airflow Schedulers coordinate without creating race conditions or duplicate task executions?",
            "answer": "Airflow 2.0+ supports active-active multi-scheduler high availability without distributed consensus protocols like ZooKeeper.\n**Coordination Mechanism:**\n- All state is synchronized through database-level row locking (`SELECT ... FOR UPDATE SKIP LOCKED`).\n- When scheduler instances query the `task_instance` table for queued tasks, they acquire exclusive row locks on candidate task instances.\n- `SKIP LOCKED` ensures other schedulers immediately ignore locked tasks and pick up subsequent tasks without blocking.\n- Schedulers register heartbeats in the database; if one scheduler dies, remaining schedulers adopt its orphaned tasks after the heartbeat timeout threshold.",
            "linked_concept_id": "airflow-orchestration"
        }
    ],
    "06": [
        {
            "id": "pil06-shir-ha-clustering",
            "category": "CLOUD & HYBRID DATA PLATFORMS",
            "domain": "Enterprise Integration & Ingestion",
            "subdomain": "On-Premises Hybrid Connectivity",
            "niche": "Integration Runtime Architecture",
            "difficulty": "HARD",
            "question": "How do you architect a High-Availability Self-Hosted Integration Runtime (SHIR) cluster in Azure Data Factory?",
            "answer": "A standalone SHIR node represents a single point of failure (SPOF) for on-premises/VNet database extraction.\n**HA Clustering Architecture:**\n1. Install SHIR on up to 4 nodes in a single high-availability cluster.\n2. Register all nodes to the same ADF authentication key.\n3. **Load Balancing:** ADF automatically balances pipeline copy tasks across online nodes based on CPU/RAM utilization.\n4. **Failover:** If the active dispatcher node crashes, another node in the cluster automatically assumes leadership in < 60 seconds with zero pipeline interruption.\n5. Enable concurrent job limits (up to 56 concurrent copy activities per node) based on physical memory.",
            "linked_concept_id": "azure-data-factory"
        },
        {
            "id": "pil06-watermark-delta-pipelines",
            "category": "CLOUD & HYBRID DATA PLATFORMS",
            "domain": "Enterprise Integration & Ingestion",
            "subdomain": "Incremental Ingestion Patterns",
            "niche": "Incremental Ingestion Patterns",
            "difficulty": "MEDIUM",
            "question": "How do you build a high-resilience incremental watermark extraction pipeline in ADF?",
            "answer": "1. **Watermark Control Table:** Store `TableName`, `LastProcessedTimestamp`, and `Status` in Azure SQL.\n2. **ADF Pipeline Flow:**\n   - Activity 1 (Lookup): Query high-watermark from source table (`SELECT MAX(UpdatedAt) FROM SourceTable`).\n   - Activity 2 (Lookup): Fetch last watermark from control table.\n   - Activity 3 (Copy Activity): Extract records using predicate: `WHERE UpdatedAt > LastProcessed AND UpdatedAt <= CurrentMax`.\n   - Activity 4 (Stored Procedure): Update control table with `CurrentMax` inside a database transaction only after Copy Activity succeeds.",
            "linked_concept_id": "azure-data-factory"
        },
        {
            "id": "pil06-mapping-data-flows-internals",
            "category": "CLOUD & HYBRID DATA PLATFORMS",
            "domain": "Enterprise Integration & Ingestion",
            "subdomain": "Serverless Spark Transformation",
            "niche": "ADF Security & Enterprise Architecture",
            "difficulty": "HARD",
            "question": "What happens under the hood when executing an Azure Data Factory Mapping Data Flow?",
            "answer": "ADF Mapping Data Flows translate visual GUI graph transformations into Scala/Spark code executed on managed Azure Databricks clusters behind the scenes.\n- **Provisioning:** Uses an Azure Integration Runtime with compute type (General Purpose vs Memory Optimized) and core count (e.g. 16+16 cores).\n- **Cold Start Remediation:** Enable **Quick Re-use / Time to Live (TTL)**: Keeps the underlying Spark cluster warm for 10-30 minutes after execution, reducing startup latency from 5 minutes to seconds for subsequent pipeline activities.",
            "linked_concept_id": "azure-data-factory"
        },
        {
            "id": "pil06-rest-api-pagination-tokens",
            "category": "CLOUD & HYBRID DATA PLATFORMS",
            "domain": "Enterprise Integration & Ingestion",
            "subdomain": "REST API Ingestion",
            "niche": "Incremental Ingestion Patterns",
            "difficulty": "HARD",
            "question": "How do you handle OAuth2 bearer token expiration and pagination in ADF REST Copy Activity?",
            "answer": "1. **Token Refresh:** Front the pipeline with a Web Activity calling the OAuth token endpoint (`/oauth/token`) with Client ID and Secret stored in Azure Key Vault.\n2. **Pagination:** Configure ADF Copy Activity RFC 5988 pagination rules (`AbsoluteUrl` or `QueryParameters['nextPage']`).\n3. **Looping:** For APIs requiring dynamic session tokens, wrap Copy Activity in an `Until` loop: check `hasMore` response property, update the token dynamically, and append results to ADLS Gen2 Bronze landing zone.",
            "linked_concept_id": "azure-data-factory"
        },
        {
            "id": "pil06-arm-git-cicd-release-gates",
            "category": "CLOUD & HYBRID DATA PLATFORMS",
            "domain": "Enterprise Integration & Ingestion",
            "subdomain": "CI/CD & ARM Parameterization",
            "niche": "ADF Security & Enterprise Architecture",
            "difficulty": "HARD",
            "question": "How do you automate ADF CI/CD deployments using ARM templates and Azure DevOps without exposing plain-text secrets?",
            "answer": "1. **Git Integration:** Develop in a collaboration branch (`main`). Publishing exports generated ARM templates to `adf_publish` branch.\n2. **Parameterization Template (`arm-template-parameters-definition.json`):** Parameterize Key Vault URLs, storage account endpoints, and linked service references.\n3. **Azure DevOps Release Pipeline:** Deploy via ARM Template Deployment task; link secrets dynamically to Azure Key Vault secrets, ensuring zero hardcoded credentials exist in source control.",
            "linked_concept_id": "azure-data-factory"
        }
    ],
    "07": [
        {
            "id": "pil07-dbt-incremental-strategies",
            "category": "DATA MODELING & TRANSFORMATION",
            "domain": "Data Build Tool (dbt)",
            "subdomain": "Incremental Models & Materializations",
            "niche": "Incremental Modeling Strategies",
            "difficulty": "HARD",
            "question": "Compare dbt incremental strategies: merge vs append vs insert_overwrite across BigQuery, Snowflake, and Databricks.",
            "answer": "**1. `merge` (Default for Snowflake/Databricks):** Executes SQL `MERGE INTO`. Updates matching primary keys, inserts new records. High write amplification on massive tables without Deletion Vectors.\n**2. `append`:** Pure `INSERT INTO`. Fastest, lowest compute, ideal for immutable clickstreams/logs.\n**3. `insert_overwrite` (Standard for BigQuery/Databricks Partitioned Tables):** Replaces entire matching partition partitions (e.g. `date(tx_time) = yesterday`). Avoids row-level update overhead; atomic and highly performant for date-partitioned warehouses.",
            "linked_concept_id": "dbt-transformation"
        },
        {
            "id": "pil07-dbt-snapshots-scd2",
            "category": "DATA MODELING & TRANSFORMATION",
            "domain": "Data Build Tool (dbt)",
            "subdomain": "Slowly Changing Dimensions (SCD2)",
            "niche": "Snapshots & SCD Architecture",
            "difficulty": "HARD",
            "question": "How do dbt snapshots implement SCD Type 2, and what is the difference between check and timestamp strategies?",
            "answer": "dbt snapshots maintain historical state by adding `dbt_valid_from`, `dbt_valid_to`, and `dbt_scd_id` columns.\n**1. `timestamp` Strategy:** Compares an `updated_at` column in the source table. If `source.updated_at > snapshot.dbt_valid_from`, it closes the previous row and inserts a new active row.\n**2. `check` Strategy:** Used when the source table lacks a reliable timestamp. dbt computes a hash of monitored columns (`check_cols = ['email', 'address']`). If the hash differs, the record state is updated.\n*Trap:* Source deletions are not marked dead unless `invalidate_hard_deletes=True` is enabled.",
            "linked_concept_id": "dbt-transformation"
        },
        {
            "id": "pil07-dbt-semantic-layer-metricflow",
            "category": "DATA MODELING & TRANSFORMATION",
            "domain": "Data Build Tool (dbt)",
            "subdomain": "Semantic Modeling & Metrics",
            "niche": "dbt Semantic Layer & Metrics",
            "difficulty": "ARCHITECT",
            "question": "How does the dbt Semantic Layer (MetricFlow) enforce governed metrics across disparate BI tools?",
            "answer": "Traditionally, business logic (e.g. `Gross Margin` or `Active ARR`) was defined inconsistently inside Tableau, Power BI, and Looker SQL models.\n**dbt Semantic Layer:**\n- Defines semantic models in YAML: entities, dimensions (time/categorical), and measures.\n- **MetricFlow Engine:** Automatically generates SQL queries with proper join paths and non-additive metric aggregations.\n- BI tools query dbt's semantic proxy via JDBC/GraphQL, ensuring identical metrics across all dashboards and downstream consumers.",
            "linked_concept_id": "dbt-transformation"
        },
        {
            "id": "pil07-dbt-mesh-multi-project",
            "category": "DATA MODELING & TRANSFORMATION",
            "domain": "Data Build Tool (dbt)",
            "subdomain": "Data Mesh & Multi-Project Governance",
            "niche": "dbt Semantic Layer & Metrics",
            "difficulty": "ARCHITECT",
            "question": "How does dbt Mesh enable decentralized Data Mesh architectures with cross-project dependencies and Model Contracts?",
            "answer": "In large enterprises, a single monolithic dbt project with 4,000 models causes dependency chaos and slow compilation.\n**dbt Mesh Architecture:**\n1. Splits repositories into domain-owned projects (e.g. Core Billing, Marketing, Logistics).\n2. **Public Models & Contracts:** Producers designate specific models as `access: public` and enforce strict schema contracts (`contract: {enforced: true}`).\n3. **Cross-Project Referencing:** Consumer projects reference upstream models using `ref('core_billing', 'dim_customers')`.\n4. Upstream producers cannot deploy breaking schema changes without passing CI contract tests.",
            "linked_concept_id": "dbt-transformation"
        },
        {
            "id": "pil07-dbt-testing-framework",
            "category": "DATA MODELING & TRANSFORMATION",
            "domain": "Data Build Tool (dbt)",
            "subdomain": "Data Quality & Unit Testing",
            "niche": "Testing, Documentation & Lineage",
            "difficulty": "MEDIUM",
            "question": "What is the difference between dbt Generic Tests, Singular Tests, and Unit Tests in dbt 1.8+?",
            "answer": "**1. Generic Tests:** Parameterized assertion tests (`unique`, `not_null`, `accepted_values`, `relationships`) declared in YAML.\n**2. Singular Tests:** Custom SQL queries in `tests/` directory that return failing rows (`SELECT * FROM payments WHERE amount < 0`). If the query returns 0 rows, the test passes.\n**3. Unit Tests (dbt 1.8+):** Mock-based unit testing. Feeds synthetic mock inputs to a model and asserts the output SQL logic without touching physical warehouse tables.",
            "linked_concept_id": "dbt-transformation"
        }
    ]
}
