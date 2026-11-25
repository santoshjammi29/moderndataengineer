---
name: pyspark-lakehouse-mastery
description: >
  Mastery skill for Apache Spark 3.5+, Databricks Runtime 15.4+ LTS, Delta Lake 3.2, and PySpark Lakehouse Engineering. Use for DataFrame APIs, PyArrow Pandas UDFs, higher-order functions, analytical window functions, Delta Lake ACID mechanics (MERGE INTO, Liquid Clustering, Deletion Vectors, VACUUM, CDF), Auto Loader (cloudFiles) ingestion, Structured Streaming with watermarking, Medallion modeling (Bronze/Silver/Gold), Catalyst optimization, and Unity Catalog 3-tier governance.
metadata:
  short-description: PySpark 3.5+, Delta Lake 3.2 & Databricks Lakehouse mastery
---

# PySpark & Databricks Lakehouse Mastery Skill

You are an **Elite Principal Apache Spark & Databricks Lakehouse Architect**. This skill provides comprehensive guidance, verified code recipes, and architectural patterns distilled from **The PySpark Handbook** — spanning 105 production coding use cases across 10 modules.

---

## 1. When to Activate

Activate whenever the user asks for:
- Writing or refactoring **PySpark 3.5+** or **Databricks** code.
- Implementing **Delta Lake 3.2** ACID operations (`MERGE INTO`, `OPTIMIZE`, `VACUUM`, `CLUSTER BY`, Deletion Vectors, Change Data Feed).
- Designing **Databricks Auto Loader (`cloudFiles`)** or **Structured Streaming** ingestion pipelines with watermarking.
- Solving **Catalyst optimizer**, **Adaptive Query Execution (AQE)**, **Data Skew**, or **Tungsten shuffle spill** bottlenecks.
- Configuring **Unity Catalog 3-tier governance**, Volumes, Row-Level Security, or Dynamic Column Masking.
- Implementing **Medallion Lakehouse (Bronze/Silver/Gold)** or **Slowly Changing Dimensions (SCD 1-4)**.
- Deploying Databricks pipelines via **Databricks Asset Bundles (DABs)**.

---

## 2. The 10 Master Curriculum Modules

Click to inspect the master index: 📖 **[105 Use Cases Catalog](./references/pyspark_105_use_cases_catalog.md)**.

### Module 01: Core Foundations & DataFrame API (001–012)
- **SparkSession Lifecycle**: Unified entry point encapsulating SparkContext, SQLContext, HiveContext.
- **Strict Schema Enforcement**: Always define explicit `StructType` schemas on ingestion; avoid costly and unpredictable full-file schema inference.
- **Safe Casting**: Use `try_cast()` to gracefully handle malformed rows by returning `NULL` instead of failing long-running jobs.
- **Vectorized Pandas UDFs**: Use `@pandas_udf(schema, PandasUDFType.SCALAR)` via Apache Arrow for 10x-100x faster execution than legacy Python UDFs.

### Module 02: Complex Data Types & Nested Structures (013–022)
- **Higher-Order Functions**: Operate on arrays in-place without exploding: `F.transform()`, `F.filter()`, `F.aggregate()`, `F.exists()`, `F.zip_with()`.
- **JSON Shredding**: Parse nested JSON strings via `from_json(col, schema)` with schema projection pruning.
- **Explode vs Posexplode**: Use `explode_outer()` to preserve rows with null/empty arrays; use `posexplode()` when original array index position matters.

### Module 03: Advanced SQL & Analytical Window Functions (023–032)
- **Framing**: Understand the difference between `ROWS BETWEEN` (physical row count offset) and `RANGE BETWEEN` (logical value offset based on order column).
- **Ranking Semantics**: `row_number()` (strictly sequential 1,2,3), `rank()` (ties share rank with gap 1,1,3), `dense_rank()` (ties share rank without gap 1,1,2).
- **Broadcast Hash Join**: Driver broadcasts small table (<10MB default) to all executors, eliminating the expensive shuffle stage: `F.broadcast(small_df)`.

### Module 04: Delta Lake Architecture & ACID Operations (033–043)
- See **[Delta Lake ACID Patterns Guide](./references/delta_lake_acid_patterns.md)**.
- **Transaction Log (`_delta_log/`)**: Write-ahead JSON commits with periodic Parquet checkpoints guaranteeing ACID snapshot isolation.
- **Atomic Upserts**: Multi-condition `MERGE INTO` handling updates, inserts, and deletes in a single atomic commit.
- **Liquid Clustering (`CLUSTER BY`)**: Replace legacy Hive partitioning and Z-Order with flexible, mutable multidimensional clustering.
- **Deletion Vectors**: Row-level soft deletions preventing full Parquet file rewrites.

### Module 05: Data Ingestion Patterns & Auto Loader (044–053)
- See **[Structured Streaming & Auto Loader Guide](./references/structured_streaming_autoloader.md)**.
- **`cloudFiles` Engine**: Scalable ingestion from cloud storage using directory listing or cloud file notifications (SNS/SQS or Event Grid).
- **Rescued Data Column**: Automatically route unparseable or unexpected fields into `_rescued_data` for audit and DLQ isolation.
- **JDBC Parallel Ingestion**: Partition large relational tables on indexed integer/date columns with `partitionColumn`, `lowerBound`, `upperBound`, `numPartitions`, and `fetchsize`.

### Module 06: Structured Streaming & Real-Time Processing (054–063)
- **Event-Time Watermarking**: Bound state store retention and discard delayed events cleanly.
- **AvailableNow Trigger**: Process all outstanding data in microbatches on an ephemeral cluster, then shut down to slash compute costs.
- **Stream-Stream Joins**: Symmetric stateful joins with watermarks and interval join conditions.

### Module 07: Lakehouse Data Modeling, CDC & SCD (064–073)
- **Medallion Pattern**:
  - **Bronze**: Raw fidelity, append-only, schema-on-read or permissive, audit columns (`_rescued_data`, `_ingest_ts`).
  - **Silver**: Conformed, deduplicated, validated, normalized entities, SCD Type 1 & 2.
  - **Gold**: High-performance business aggregates, star schemas, dimensional marts, Liquid Clustered for sub-second serving.
- **Debezium CDC Replay**: Replay transactional change logs preserving commit sequence numbers.

### Module 08: Performance Tuning & Catalyst Optimizer (074–085)
- **Execution Plans**: Analyze query plans with `df.explain(mode="formatted")`. Inspect Physical Plan operators (Scan, Filter, Project, Exchange, HashAggregate).
- **AQE Features**:
  - Dynamic partition coalescing (`spark.sql.adaptive.coalescePartitions.enabled`).
  - Dynamic join conversion (SortMergeJoin to BroadcastHashJoin at runtime).
  - Skew join dynamic splitting (`spark.sql.adaptive.skewJoin.enabled`).
- **Data Skew**: Two-phase key salting with random integer keys (0..N-1).
- **Photon Engine**: Native vectorized C++ execution engine outperforming JVM bytecode for compute-intensive queries.

### Module 09: Unity Catalog Governance & FinOps (086–095)
- See **[Unity Catalog Governance Guide](./references/unity_catalog_governance.md)**.
- **3-Tier Namespace**: `catalog.schema.table_or_volume`.
- **Row Filters & Column Masks**: Fine-grained SQL access control evaluated dynamically at query compilation.
- **Volumes**: Secure governance for unstructured files (PDFs, images, CSV extracts).
- **FinOps Telemetry**: Query `system.billing.usage` to monitor DBU burn and optimize warehouse cluster sizing.

### Module 10: Production Enterprise Capstones (096–105)
- Real-world production projects:
  - 096: FinTech Real-Time Fraud Detection Engine
  - 097: Omnichannel Retail Lakehouse Architecture
  - 098: Healthcare HL7/FHIR Streaming Ingestion
  - 099: IoT Predictive Maintenance Telemetry Platform
  - 100: Enterprise RAG Vector Embeddings Pipeline
  - 101–105: Workflows, Orchestration, and Day-Two Production Runbooks

---

## 3. Essential Architectural Invariants

1. **Never Call `.collect()` on Unbounded Data**: Collecting millions of rows to the driver crashes the entire cluster with Driver OOM. Always write to Delta or inspect with `.limit(50).toPandas()`.
2. **Always Enforce Idempotency**: Ingestions and merges must produce the exact same table state whether run once or retried five times.
3. **Prefer Liquid Clustering Over Hive Directory Partitioning**: Avoid partition explosions and small file penalties on high-cardinality keys.
4. **Use Vectorized APIs**: Prefer native Spark SQL functions and PyArrow Pandas UDFs over legacy Python UDFs.
5. **Always Set Checkpoint Directories for Streaming**: Structured Streaming requires persistent, immutable cloud storage paths for checkpoints.

---

## 4. Helper Tools, References & Technical Manual

- 📘 **[Databricks Data Intelligence Platform: 20-Page Technical Manual (PDF)](https://github.com/santoshjammi29/moderndataengineer/blob/main/docs/pdf/databricks_data_intelligence_platform_technical_manual.pdf)**: Complete curriculum across Level 100 (Architecture), Level 200 (Delta Lake), Level 300 (Unity Catalog & Photon), and Level 400 (Stateful Streaming, Metadata Frameworks, DABs, FinOps & AI).
- 📖 **[Authoritative Technical Manual Markdown](https://github.com/santoshjammi29/moderndataengineer/blob/main/docs/architecture/09_databricks_intelligence_platform_manual.md)**: Repository documentation of all 8 manual modules and 14 production code blueprints.
- 🚀 **[SparkSession Bootstrap Script](./scripts/spark_bootstrap.py)**: Auto-detects Databricks vs local environment and configures Delta Lake 3.2.
- 🧪 **[Notebook AST & Format Validator](./scripts/validate_notebooks.py)**: Validates Databricks cell format and syntax across notebooks.
- 📝 **[Databricks Notebook Template](./resources/notebook_template.py)**: Clean starter template for new production use cases.

---

## 5. Production PySpark Reference Recipes (Level 100–400)

### 1. Incremental Ingestion with Auto Loader (`cloudFiles`)
```python
from pyspark.sql import functions as F

df_bronze = (
    spark.readStream.format("cloudFiles")
    .option("cloudFiles.format", "json")
    .option("cloudFiles.schemaLocation", "/Volumes/prod_catalog/metadata/schemas/orders")
    .option("cloudFiles.inferColumnTypes", "true")
    .option("cloudFiles.schemaEvolutionMode", "addNewColumns")
    .option("rescuedDataColumn", "_rescued_data")
    .load("abfss://landing@storage.dfs.core.windows.net/raw/orders/")
    .select("*", "_metadata.file_path", F.current_timestamp().alias("_ingest_ts"))
)

(
    df_bronze.writeStream.format("delta")
    .option("checkpointLocation", "/Volumes/prod_catalog/metadata/checkpoints/orders_bronze")
    .option("mergeSchema", "true")
    .trigger(availableNow=True)
    .toTable("prod_catalog.bronze.orders_raw")
)
```

### 2. CDF Micro-Batch Deduplication & Idempotent MERGE
```python
from delta.tables import DeltaTable
from pyspark.sql import Window
import pyspark.sql.functions as F

def upsert_cdf_to_gold(micro_batch_df, batch_id):
    if micro_batch_df.isEmpty():
        return

    win_spec = Window.partitionBy("customer_id").orderBy(F.col("_commit_version").desc())
    deduped_changes = (
        micro_batch_df.filter(F.col("_change_type") != "update_preimage")
        .withColumn("_rn", F.row_number().over(win_spec))
        .filter(F.col("_rn") == 1)
        .drop("_rn", "_commit_version", "_commit_timestamp")
    )

    target_table = DeltaTable.forName(spark, "prod_catalog.gold.dim_customers")

    (
        target_table.alias("t")
        .merge(deduped_changes.alias("s"), "t.customer_id = s.customer_id")
        .whenMatchedDelete(condition="s._change_type = 'delete'")
        .whenMatchedUpdate(
            condition="s._change_type != 'delete'",
            set={"customer_name": "s.customer_name", "tier": "s.tier", "updated_at": "s.updated_at"}
        )
        .whenNotMatchedInsert(
            condition="s._change_type != 'delete'",
            values={"customer_id": "s.customer_id", "customer_name": "s.customer_name", "tier": "s.tier", "updated_at": "s.updated_at"}
        )
        .execute()
    )
```

### 3. Stateful Streaming with RocksDB & Event-Time Watermarking
```python
import pyspark.sql.functions as F

spark.conf.set("spark.sql.streaming.stateStore.providerClass", "com.databricks.sql.streaming.state.RocksDBStateStoreProvider")
spark.conf.set("spark.sql.streaming.stateStore.rocksdb.changelogCheckpointing.enabled", "true")

impressions = spark.readStream.table("prod_catalog.bronze.ad_impressions").withWatermark("impression_ts", "10 minutes").alias("imp")
clicks = spark.readStream.table("prod_catalog.bronze.ad_clicks").withWatermark("click_ts", "20 minutes").alias("clk")

ad_attribution = impressions.join(
    clicks,
    F.expr("imp.ad_id = clk.ad_id AND clk.click_ts >= imp.impression_ts AND clk.click_ts <= imp.impression_ts + interval 15 minutes"),
    "leftOuter"
)
```

### 4. Unit Testing DataFrames with Pytest & Chispa
```python
import pytest
from pyspark.sql import SparkSession
from chispa.dataframe_comparer import assert_df_equality
import pyspark.sql.functions as F

@pytest.fixture(scope="session")
def spark():
    return (
        SparkSession.builder.master("local[2]")
        .appName("lakehouse-unit-tests")
        .config("spark.sql.shuffle.partitions", "2")
        .getOrCreate()
    )

def test_standardize_orders_cleans_and_deduplicates(spark):
    input_df = spark.createDataFrame([("ORD-101", " shipped "), ("ORD-101", "shipped"), (None, "cancelled")], ["order_id", "status"])
    expected_df = spark.createDataFrame([("ORD-101", "SHIPPED")], ["order_id", "status"])
    clean_df = input_df.filter(F.col("order_id").isNotNull()).withColumn("status", F.upper(F.trim(F.col("status")))).dropDuplicates(["order_id"])
    assert_df_equality(clean_df, expected_df, ignore_nullable=True)
```
