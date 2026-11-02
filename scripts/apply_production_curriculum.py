# scripts/apply_production_curriculum.py
import json
import os
import sys

from curriculum_production_de_1 import CURRICULUM_PART_1
from curriculum_production_de_2 import CURRICULUM_PART_2

DE_FILE = 'src/data/json/data_de.json'
ARCH_FILE = 'src/data/json/data_architecture.json'
CHEATSHEET_FILE = 'src/data/json/data_cheatsheet.json'

NEW_CHEATSHEET_CARDS = [
    {
        "id": "adf-tumbling-window-dependency",
        "title": "ADF Tumbling Window Dependency & Backfill Chaining",
        "category": "Orchestration",
        "categorySlug": "orchestration",
        "impact": "High Impact",
        "effort": "Low Effort",
        "problem": "Schedule triggers skip historical intervals during cluster downtime and cannot enforce sequential time-window dependency ordering.",
        "solution": "Configure Tumbling Window Triggers with dependsOn self-referencing offset and upstream trigger binding, specifying maxConcurrency and retry policies.",
        "codeSnippet": '{\n  "type": "TumblingWindowTrigger",\n  "typeProperties": {\n    "frequency": "Hour",\n    "interval": 1,\n    "startTime": "2026-01-01T00:00:00Z",\n    "delay": "00:05:00",\n    "maxConcurrency": 4,\n    "retryPolicy": { "count": 3, "intervalInSeconds": 60 },\n    "dependsOn": [\n      {\n        "type": "TumblingWindowTriggerDependencyReference",\n        "offset": "-01:00:00",\n        "size": "01:00:00",\n        "referenceTrigger": { "referenceName": "trig_upstream_bronze", "type": "TriggerReference" }\n      }\n    ]\n  }\n}',
        "language": "json",
        "whyItMatters": "Guarantees deterministic, out-of-the-box historical backfilling upon trigger reactivation and prevents downstream processing until upstream time slices complete.",
        "metrics": "100% automated chronological backfill; zero skipped intervals",
        "antiPattern": "Setting maxConcurrency to 50 during a 30-day backfill, overwhelming destination database DTUs and exceeding subscription limits.",
        "tags": ["ADF", "TumblingWindow", "Orchestration", "Triggers", "Backfill", "Azure"]
    },
    {
        "id": "adf-copy-diu-partition-slicing",
        "title": "ADF Copy Activity DIU & Dynamic Range Partition Slicing",
        "category": "Orchestration",
        "categorySlug": "orchestration",
        "impact": "High Impact",
        "effort": "Medium Effort",
        "problem": "Copy activity runs at slow single-threaded speeds even when allocated 64 DIUs because SQL queries execute as a single unpartitioned table scan.",
        "solution": "Enable DynamicRange partitionOption on the SQL source and bind partitionColumnName with upper and lower boundary bounds, matching parallelCopies.",
        "codeSnippet": '{\n  "source": {\n    "type": "SqlSource",\n    "partitionOption": "DynamicRange",\n    "partitionSettings": {\n      "partitionColumnName": "TransactionId",\n      "partitionUpperBound": "500000000",\n      "partitionLowerBound": "1"\n    }\n  },\n  "sink": { "type": "ParquetSink" },\n  "dataIntegrationUnits": 32,\n  "parallelCopies": 16\n}',
        "language": "json",
        "whyItMatters": "Slices single monolithic queries into parallel bounded range extracts, allowing all 32 DIUs to saturate available network bandwidth.",
        "metrics": "8x-12x throughput acceleration (up to 250 MB/s)",
        "antiPattern": "Over-allocating 128 DIUs for small <5GB files without partition slicing, incurring minimum 1-minute billing costs with zero performance gain.",
        "tags": ["ADF", "CopyActivity", "DIU", "Partitioning", "Performance", "Throughput"]
    },
    {
        "id": "adf-dead-letter-quarantine",
        "title": "ADF Activity Error Branching & Dead Letter Queue",
        "category": "Production Best Practices",
        "categorySlug": "best-practices",
        "impact": "High Impact",
        "effort": "Low Effort",
        "problem": "Single corrupted records crash entire pipeline batches, halting downstream analytics and leaving staging containers uncleaned.",
        "solution": "Branch activity failure dependencies to a Dead Letter Queue (DLQ) copy task that isolates rejected payloads, logs failure metadata, and terminates with a Fail activity.",
        "codeSnippet": '{\n  "name": "Quarantine_Bad_Data",\n  "type": "Copy",\n  "dependsOn": [\n    { "activity": "Transform_Orders", "dependencyConditions": ["Failed"] }\n  ],\n  "typeProperties": {\n    "source": { "type": "BinarySource" },\n    "sink": {\n      "type": "BinarySink",\n      "storeSettings": {\n        "type": "AzureBlobFSWriteSettings",\n        "copyBehavior": "PreserveHierarchy"\n      }\n    }\n  }\n}',
        "language": "json",
        "whyItMatters": "Preserves audit compliance by capturing faulty records into an isolated quarantine zone while keeping main production pipelines operational.",
        "metrics": "Zero dropped records; MTTR reduced from hours to minutes",
        "antiPattern": "Allowing a failed branch to terminate successfully without an explicit Fail activity, causing ADF to falsely mark the overall pipeline as Succeeded.",
        "tags": ["ADF", "ErrorHandling", "DLQ", "Quarantine", "FaultTolerance", "Azure"]
    },
    {
        "id": "adf-teams-adaptive-card-webhook",
        "title": "ADF Real-Time Webhook Alerting via Teams Adaptive Cards",
        "category": "Debugging & Observability",
        "categorySlug": "debugging",
        "impact": "Medium Impact",
        "effort": "Low Effort",
        "problem": "Pipeline failure notifications delivered via email get lost or delayed, leading to unnoticed SLA breaches.",
        "solution": "Use an ADF Web Activity attached to failed activity branches to format and POST dynamic JSON Adaptive Cards directly to a Microsoft Teams incoming webhook.",
        "codeSnippet": '{\n  "name": "Send_Teams_Incident_Card",\n  "type": "WebActivity",\n  "dependsOn": [{ "activity": "Copy_Sales", "dependencyConditions": ["Failed"] }],\n  "typeProperties": {\n    "url": "@pipeline().globalParameters.teams_webhook_url",\n    "method": "POST",\n    "body": {\n      "type": "message",\n      "attachments": [{\n        "contentType": "application/vnd.microsoft.card.adaptive",\n        "content": {\n          "type": "AdaptiveCard",\n          "body": [\n            { "type": "TextBlock", "text": "Pipeline Failure Alert", "weight": "Bolder", "color": "Attention" },\n            { "type": "FactSet", "facts": [\n              { "title": "Pipeline:", "value": "@{pipeline().Pipeline}" },\n              { "title": "Run ID:", "value": "@{pipeline().RunId}" },\n              { "title": "Error:", "value": "@{activity(\'Copy_Sales\').error.message}" }\n            ]}\n          ]\n        }\n      }]\n    }\n  }\n}',
        "language": "json",
        "whyItMatters": "Instantly notifies on-call data engineers in collaboration channels with direct run IDs and error messages for immediate triage.",
        "metrics": "Sub-minute incident notification; zero email lag",
        "antiPattern": "Failing to escape double quotes or newlines in error messages, causing the Web Activity JSON body to become invalid and swallow the alert.",
        "tags": ["ADF", "WebActivity", "Teams", "Alerting", "Webhooks", "IncidentResponse"]
    },
    {
        "id": "pyspark-exponential-backoff-retry",
        "title": "PySpark Production Retry Decorator with Full Jitter",
        "category": "Production Best Practices",
        "categorySlug": "best-practices",
        "impact": "High Impact",
        "effort": "Medium Effort",
        "problem": "Transient cloud storage throttling (HTTP 503/429) or temporary network blips terminate multi-hour Spark batch writes.",
        "solution": "Wrap write actions in an exponential backoff decorator with randomized jitter, retrying only transient errors while failing fast on deterministic code bugs.",
        "codeSnippet": 'import time, random\nfrom functools import wraps\n\ndef with_exponential_backoff(max_retries=4, base_delay=2.0):\n    def decorator(func):\n        @wraps(func)\n        def wrapper(*args, **kwargs):\n            for attempt in range(1, max_retries + 1):\n                try:\n                    return func(*args, **kwargs)\n                except Exception as e:\n                    if attempt == max_retries or not any(k in str(e).lower() for k in ["503", "429", "timeout"]):\n                        raise e\n                    delay = random.uniform(0, min(60.0, base_delay * (2 ** (attempt - 1))))\n                    time.sleep(delay)\n        return wrapper\n    return decorator\n\n@with_exponential_backoff(max_retries=3)\ndef write_delta(df, path):\n    df.write.format("delta").mode("append").save(path)',
        "language": "python",
        "whyItMatters": "Prevents the thundering herd problem when dozens of tasks fail simultaneously, allowing storage endpoints to recover without crashing jobs.",
        "metrics": "99.9% resilience against transient HTTP 503/429 throttling",
        "antiPattern": "Decorating lazy DataFrame transformations rather than the terminal action, giving a false illusion of retry protection.",
        "tags": ["PySpark", "Retry", "ExponentialBackoff", "Jitter", "FaultTolerance", "ADLS"]
    },
    {
        "id": "pyspark-idempotent-replacewhere",
        "title": "Delta Lake Atomic Partition Overwrite via replaceWhere",
        "category": "SQL & Storage",
        "categorySlug": "sql-storage",
        "impact": "High Impact",
        "effort": "Low Effort",
        "problem": "Standard Spark mode('overwrite') wipes entire table directories, destroying historical data on misconfigured jobs.",
        "solution": "Use Delta Lake replaceWhere option to atomically overwrite exactly the target partition without modifying historical partitions.",
        "codeSnippet": '# Atomically overwrite exactly one date partition\ndf_daily.write \\\n    .format("delta") \\\n    .mode("overwrite") \\\n    .option("replaceWhere", f"sale_date = \'{load_date}\'") \\\n    .option("mergeSchema", "false") \\\n    .saveAsTable("lakehouse_prod.gold.daily_sales")',
        "language": "python",
        "whyItMatters": "Guarantees that re-running a failed or backfilled pipeline is 100% idempotent and safe from accidental multi-partition data deletion.",
        "metrics": "100% partition-atomic ACID overwrite; zero historical deletion risk",
        "antiPattern": "Writing data containing dates outside the replaceWhere predicate, which triggers DeltaIllegalArgumentException and aborts the write.",
        "tags": ["DeltaLake", "replaceWhere", "Idempotency", "ACID", "PySpark", "Partitioning"]
    },
    {
        "id": "pyspark-autoloader-rescued-data",
        "title": "Auto Loader Streaming with Schema Evolution & Rescued Data",
        "category": "Spark Core",
        "categorySlug": "spark-core",
        "impact": "High Impact",
        "effort": "Low Effort",
        "problem": "Unexpected schema drift or corrupted columns in raw landing JSON files crash production streaming jobs.",
        "solution": "Configure Auto Loader cloudFiles with schemaEvolutionMode='addNewColumns' and leverage the automatic _rescued_data column to prevent dropped data.",
        "codeSnippet": '(spark.readStream\n    .format("cloudFiles")\n    .option("cloudFiles.format", "json")\n    .option("cloudFiles.schemaLocation", checkpoint_path + "schema/")\n    .option("cloudFiles.schemaEvolutionMode", "addNewColumns")\n    .option("cloudFiles.schemaHints", "event_time TIMESTAMP, user_id STRING")\n    .load(landing_path)\n    .writeStream\n    .format("delta")\n    .outputMode("append")\n    .option("checkpointLocation", checkpoint_path + "offsets/")\n    .option("mergeSchema", "true")\n    .trigger(availableNow=True)\n    .toTable("bronze.raw_events"))',
        "language": "python",
        "whyItMatters": "Preserves stream continuity while capturing malformed or unmapped columns into _rescued_data for inspection without human intervention.",
        "metrics": "Zero pipeline halts on schema drift; 100% unmapped field preservation",
        "antiPattern": "Sharing the same checkpoint directory across multiple independent streaming queries, corrupting WAL offsets.",
        "tags": ["AutoLoader", "cloudFiles", "Streaming", "SchemaEvolution", "DeltaLake", "Databricks"]
    },
    {
        "id": "pyspark-salted-skew-join",
        "title": "Skew Remediation via Mathematical Key Salting",
        "category": "Spark Optimization",
        "categorySlug": "spark-optimization",
        "impact": "High Impact",
        "effort": "High Effort",
        "problem": "Extreme data skew on a join key creates a single straggler task running 100x longer than the median, bottlenecking the entire cluster.",
        "solution": "Add a random salt [0..K-1] to the large table key and replicate the small table rows K times via explode(array) before joining on the salted key.",
        "codeSnippet": 'import pyspark.sql.functions as F\n\nSALT_K = 16\n# 1. Salt large table with random suffix [0..K-1]\nlarge_salted = large_df.withColumn(\n    "salted_key",\n    F.concat(F.col("join_id"), F.lit("_"), (F.rand() * SALT_K).cast("int"))\n)\n\n# 2. Explode small table across all K salt values\nsmall_exploded = small_df.withColumn(\n    "salted_key",\n    F.explode(F.array([F.concat(F.col("join_id"), F.lit(f"_{i}")) for i in range(SALT_K)]))\n)\n\n# 3. Join on salted key\njoined_df = large_salted.join(small_exploded, on="salted_key", how="inner").drop("salted_key")',
        "language": "python",
        "whyItMatters": "Evenly distributes skewed key records across all cluster workers, eliminating single-task executor memory saturation.",
        "metrics": "10x-50x runtime reduction on severely skewed joins",
        "antiPattern": "Salting massive dimension tables with high K values, causing memory explosion during the small table array replication phase.",
        "tags": ["PySpark", "Salting", "DataSkew", "SparkOptimization", "Joins", "Stragglers"]
    },
    {
        "id": "databricks-dabs-multitask-job",
        "title": "Databricks Asset Bundles Multi-Task Job with Shared Cluster",
        "category": "Orchestration",
        "categorySlug": "orchestration",
        "impact": "High Impact",
        "effort": "Medium Effort",
        "problem": "Multi-stage workflows spinning up separate new clusters for each task incur 5-minute VM provisioning delays per task and inflate DBU costs.",
        "solution": "Define a root job_clusters block in the DAB YAML and reference the shared cluster across all workflow tasks using job_cluster_key.",
        "codeSnippet": 'resources:\n  jobs:\n    daily_etl:\n      name: "${bundle.target}-daily-etl"\n      job_clusters:\n        - job_cluster_key: shared_cluster\n          new_cluster:\n            spark_version: 15.4.x-scala2.12\n            node_type_id: Standard_D8s_v5\n            num_workers: 4\n      tasks:\n        - task_key: bronze\n          job_cluster_key: shared_cluster\n          notebook_task: { notebook_path: ../src/bronze.py }\n        - task_key: silver\n          depends_on: [{ task_key: bronze }]\n          job_cluster_key: shared_cluster\n          notebook_task: { notebook_path: ../src/silver.py }',
        "language": "yaml",
        "whyItMatters": "Keeps worker VMs warm across all task stages, slashing pipeline execution overhead by 15-20 minutes and consolidating billing.",
        "metrics": "15-20 minutes eliminated per run; 40% DBU savings",
        "antiPattern": "Assigning All-Purpose interactive clusters to automated production jobs, incurring a 3x higher DBU price rate.",
        "tags": ["DABs", "Databricks", "AssetBundles", "Workflows", "FinOps", "CI/CD"]
    },
    {
        "id": "databricks-kql-failure-alerting",
        "title": "Azure Monitor KQL Diagnostic Query for Databricks SLAs",
        "category": "Debugging & Observability",
        "categorySlug": "debugging",
        "impact": "Medium Impact",
        "effort": "Low Effort",
        "problem": "Silent job failures or jobs exceeding expected SLA durations escape notice until business analysts report stale dashboard metrics.",
        "solution": "Deploy an Azure Monitor Alert Rule running a scheduled KQL query over DatabricksJobs diagnostic telemetry to alert on failure or execution spikes.",
        "codeSnippet": '// KQL Alert: Detect Failed Jobs & Runs Exceeding 2 Hours in last 15m\nDatabricksJobs\n| where TimeGenerated > ago(15m)\n| where ActionName in ("runFailed", "runSucceeded")\n| extend DurationMin = todouble(RequestParams.executionDuration) / 60000\n| extend JobName = tostring(RequestParams.jobName)\n| extend RunId = tostring(RequestParams.runId)\n| where ActionName == "runFailed" or DurationMin > 120\n| project TimeGenerated, JobName, RunId, ActionName, DurationMin, Response\n| order by TimeGenerated desc',
        "language": "kql",
        "whyItMatters": "Integrates Databricks telemetry directly into enterprise Azure Monitor / PagerDuty incident management with zero custom agent setup.",
        "metrics": "Near real-time alert trigger within 5 minutes of SLA breach",
        "antiPattern": "Streaming verbose driver stdout logs to Log Analytics, resulting in thousands of dollars in unexpected log ingestion costs.",
        "tags": ["KQL", "AzureMonitor", "Databricks", "Observability", "Alerting", "SRE"]
    }
]

def main():
    all_curriculum = CURRICULUM_PART_1 + CURRICULUM_PART_2
    print(f"Total curriculum items defined: {len(all_curriculum)}")

    # 1. Update data_de.json
    with open(DE_FILE, 'r', encoding='utf-8') as f:
        de_data = json.load(f)
    print(f"data_de.json before: {len(de_data)}")
    existing_de_ids = {d['id'] for d in de_data}

    de_added = 0
    de_skipped = 0
    for item in all_curriculum:
        de_id = item['de_id']
        if de_id in existing_de_ids:
            print(f"[data_de] SKIP duplicate: {de_id}")
            de_skipped += 1
            continue

        de_entry = {
            "id": de_id,
            "source": "Modern Stack Mastery",
            "category": item["category_de"],
            "niche": item["niche"],
            "difficulty": item["difficulty"],
            "question": item["question"],
            "answer": item["answer"],
            "domain": item.get("domain", "Compute & Orchestration"),
            "subdomain": item.get("subdomain", "Production Engineering")
        }
        existing_de_ids.add(de_id)
        de_data.append(de_entry)
        de_added += 1

    temp_de = DE_FILE + '.tmp'
    with open(temp_de, 'w', encoding='utf-8') as f:
        json.dump(de_data, f, indent=2, ensure_ascii=False)
    os.replace(temp_de, DE_FILE)
    print(f"data_de.json after: {len(de_data)} (Added: {de_added}, Skipped: {de_skipped})")

    # 2. Update data_architecture.json
    with open(ARCH_FILE, 'r', encoding='utf-8') as f:
        arch_data = json.load(f)
    print(f"data_architecture.json before: {len(arch_data)}")
    existing_arch_ids = {d['id'] for d in arch_data}

    arch_added = 0
    arch_skipped = 0
    for item in all_curriculum:
        arch_id = item['arch_id']
        if arch_id in existing_arch_ids:
            print(f"[data_architecture] SKIP duplicate: {arch_id}")
            arch_skipped += 1
            continue

        arch_entry = {
            "id": arch_id,
            "source": "Architecture Hub",
            "category": item["category_arch"],
            "niche": item["niche"],
            "difficulty": item["difficulty"],
            "question": item["question"],
            "answer": item["answer"]
        }
        existing_arch_ids.add(arch_id)
        arch_data.append(arch_entry)
        arch_added += 1

    temp_arch = ARCH_FILE + '.tmp'
    with open(temp_arch, 'w', encoding='utf-8') as f:
        json.dump(arch_data, f, indent=2, ensure_ascii=False)
    os.replace(temp_arch, ARCH_FILE)
    print(f"data_architecture.json after: {len(arch_data)} (Added: {arch_added}, Skipped: {arch_skipped})")

    # 3. Update data_cheatsheet.json
    with open(CHEATSHEET_FILE, 'r', encoding='utf-8') as f:
        cs_data = json.load(f)
    print(f"data_cheatsheet.json before: {len(cs_data)}")
    existing_cs_ids = {c['id'] for c in cs_data}

    cs_added = 0
    cs_skipped = 0
    for card in NEW_CHEATSHEET_CARDS:
        card_id = card['id']
        if card_id in existing_cs_ids:
            print(f"[data_cheatsheet] SKIP duplicate: {card_id}")
            cs_skipped += 1
            continue

        existing_cs_ids.add(card_id)
        cs_data.append(card)
        cs_added += 1

    temp_cs = CHEATSHEET_FILE + '.tmp'
    with open(temp_cs, 'w', encoding='utf-8') as f:
        json.dump(cs_data, f, indent=2, ensure_ascii=False)
    os.replace(temp_cs, CHEATSHEET_FILE)
    print(f"data_cheatsheet.json after: {len(cs_data)} (Added: {cs_added}, Skipped: {cs_skipped})")

if __name__ == '__main__':
    main()
