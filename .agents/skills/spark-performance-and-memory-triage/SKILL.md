---
name: spark-performance-and-memory-triage
description: >
  Operational runbook and triage skill for diagnosing and fixing Apache Spark and Databricks performance bottlenecks. Use for Driver OutOfMemoryError (heap space, GC limits), Executor OOM (Exit code 137 / container killed), Tungsten shuffle disk spill, partition sizing calculations, data skew mitigation via two-phase key salting and AQE skew join, execution plan analysis (BroadcastNestedLoopJoin and Cartesian product traps), G1GC pauses, and Delta Lake small file hygiene.
metadata:
  short-description: Spark & Databricks performance and memory bottleneck triage
---

# Spark Performance & Production Memory Triage Skill

You are a **Master Spark & Databricks Production Systems SRE / Performance Architect**. This skill provides step-by-step diagnostic workflows, calculation formulas, and surgical code fixes for production Spark and Lakehouse incidents.

---

## 1. When to Activate

Activate immediately when the user reports or pastes:
- A Spark or Databricks job failure with memory or timeout errors.
- Driver OOM (`java.lang.OutOfMemoryError: Java heap space`, `driver heartbeat lost`).
- Executor OOM (`Exit code 137`, `Container killed by YARN/K8s for exceeding memory limits`).
- Severe task skew (e.g. 199/200 tasks finish in seconds, 1 task runs for hours).
- High Tungsten Disk Spill in the Spark UI.
- Inquiries about tuning `spark.sql.shuffle.partitions`, `spark.executor.memoryOverhead`, or AQE parameters.

---

## 2. Immediate Diagnostic Triage Workflow

```text
Step 1: Identify Failure Node & Signature
  ├── Driver Node Died? ───> Inspect code for .collect(), .toPandas(), or oversized broadcast joins.
  └── Executor Node Died? ──> Check task duration distribution (Skew) or off-heap native memory leak.

Step 2: Inspect Spark Web UI Metrics
  ├── Stages Tab: Check "Spill (Memory)" and "Spill (Disk)" columns.
  ├── Tasks Table: Compare 75th percentile duration vs. Max duration.
  └── Executors Tab: Check "Task Time (GC Time)" percentage.

Step 3: Apply Targeted Remediation
  ├── Skew Detected? ────────> Two-phase salting (F.rand()) or enable AQE skew join.
  ├── Spill Detected? ───────> Boost spark.sql.shuffle.partitions to achieve 128MB targets.
  └── Container Killed 137? ──> Increase spark.executor.memoryOverhead to 20-30% of heap.
```

---

## 3. Surgical Code Solutions for Top 4 Bottlenecks

### 1. Eliminating Driver OOM (`java.lang.OutOfMemoryError`)
```python
# Anti-pattern: Pulling distributed dataset into single driver JVM
# rows = df.collect()

# Fix 1: Stream directly to storage
df.write.format("delta").mode("append").save("/Volumes/prod/gold/summary")

# Fix 2: Cap driver collection for inspection
sample_df = df.limit(50).toPandas()

# Fix 3: Lower broadcast threshold if a large table was accidentally broadcasted
spark.conf.set("spark.sql.autoBroadcastJoinThreshold", "33554432") # 32MB cap
```

### 2. Eliminating Data Skew via Two-Phase Key Salting
```python
from pyspark.sql import functions as F

# Step 1: Add salt (0 to N-1) to skewed left table
SALT_BUCKETS = 16
df_salted = df_large.withColumn("salt", F.floor(F.rand() * SALT_BUCKETS))

# Step 2: Explode right dimension table with all possible salt values
salt_df = spark.range(SALT_BUCKETS).withColumnRenamed("id", "salt")
df_dim_exploded = df_small.crossJoin(salt_df)

# Step 3: Join on compound key (join_key + salt) to distribute work evenly across all 16 workers
joined_df = df_salted.join(
    df_dim_exploded,
    on=["join_key", "salt"],
    how="inner"
).drop("salt")
```

### 3. Sizing Shuffle Partitions to Eliminate Tungsten Disk Spill
```python
# Target partition size = 128 MB (0.128 GB)
# Formula: Total Stage Shuffle Input (GB) / 0.128 GB = Target Shuffle Partitions
# Example: 250 GB shuffle stage -> 250 / 0.128 = 1953 -> set to 2000 partitions
spark.conf.set("spark.sql.shuffle.partitions", "2000")

# Enable AQE dynamic partition coalescing
spark.conf.set("spark.sql.adaptive.enabled", "true")
spark.conf.set("spark.sql.adaptive.coalescePartitions.enabled", "true")
spark.conf.set("spark.sql.adaptive.advisoryPartitionSizeInBytes", "134217728") # 128MB
```

### 4. Mitigating Executor OOM (Exit Code 137 / Container Killed)
```properties
# Allocate 25% of executor heap as off-heap memory overhead for PyArrow/C++ allocations
spark.executor.memory = 16g
spark.executor.memoryOverhead = 4g

# Enable Tungsten off-heap memory
spark.memory.offHeap.enabled = true
spark.memory.offHeap.size = 4g

# Enable G1GC collector for low-pause heap reclamation
spark.executor.extraJavaOptions = -XX:+UseG1GC -XX:InitiatingHeapOccupancyPercent=45
```

---

## 4. The 5 S's Physical Plan Diagnostic Matrix

Performance bottlenecks in distributed Spark workloads fall into five root causes—**Spill, Skew, Shuffle, Storage, and Serialization (the 5 S's)**:

| Physical Plan Operator | Engine Mode | Execution Behavior | Optimization Action |
| :--- | :--- | :--- | :--- |
| `PhotonScan` / `PhotonProject` | Photon C++ | Vectorized columnar scan and filter evaluation | Verify `PartitionFilters` and `DataFilters` are populated (predicate pushdown active). |
| `PhotonBroadcastHashJoin` | Photon C++ | Zero-shuffle hash join using broadcasted small table | Optimal join strategy for dimension tables < 100 MB. |
| `SortMergeJoin` | Spark / Photon | Shuffles and sorts both datasets across network | Ensure AQE is enabled; apply Liquid Clustering on join keys or use Broadcast hint if one side is small. |
| `BroadcastNestedLoopJoin` | Spark / Photon | O(N × M) Cartesian loop caused by non-equi join condition | Rewrite inequality joins into equi-joins or enable Databricks Range Join optimization bin hints. |
| `BatchEvalPython` / `ArrowEvalPython` | Python Worker | Breaks out of Photon C++ to run Python code | Refactor into native Spark SQL expressions or SQL UDFs so Photon remains 100% vectorized. |

### Explicit Skew Mitigation Pattern: Splitting NULL Keys Before Left Outer Join
```python
import pyspark.sql.functions as F

df_orders_valid = orders_df.filter(F.col("customer_id").isNotNull())
df_orders_null = orders_df.filter(F.col("customer_id").isNull())

# Join only non-null keys to prevent millions of NULL rows from landing on a single executor
df_joined_valid = df_orders_valid.join(customers_df, on="customer_id", how="left")

# Union back the NULL rows with empty dimension columns
df_final = df_joined_valid.unionByName(df_orders_null, allowMissingColumns=True)
```

---

## 5. Production Incident Resolution Playbook (Level 400 Reference)

| Production Symptom | Spark UI / System Root Cause Diagnosis | Actionable Engineering Resolution |
| :--- | :--- | :--- |
| **Straggler Task** *(199/200 tasks finished, 1 hanging)* | **Data Skew:** Max task duration and Shuffle Read Size are 10x–100x larger than 75th percentile. | 1. Filter out NULL join keys before joining and union back afterward.<br>2. Verify `spark.sql.adaptive.skewJoin.enabled = true`.<br>3. Apply salted keys (`concat(key, '_', floor(rand() * 16))`). |
| **High Memory & Disk Spill** | **Partition Memory Exhaustion:** Shuffle partitions exceed executor RAM per core. | 1. Set `spark.sql.shuffle.partitions = auto` so AQE splits oversized partitions.<br>2. Switch to memory-optimized worker VMs.<br>3. Eliminate unbounded Window functions lacking a `PARTITION BY` clause. |
| **Driver `OutOfMemoryError`** | **Driver Heap Exhaustion:** Calling `.collect()`, `.toPandas()`, or broadcasting large tables. | 1. Replace `.collect()` with distributed PySpark writes.<br>2. Reduce `spark.sql.autoBroadcastJoinThreshold`.<br>3. Scale up the Driver node instance size vertically. |
| **Slow Scans & High Metadata Latency** | **Small File Problem:** Thousands of KB-sized Parquet files from streaming or over-partitioning. | 1. Migrate from Hive partitioning to **Liquid Clustering** (`CLUSTER BY`).<br>2. Enable Predictive Optimization or `autoOptimize`.<br>3. Execute `OPTIMIZE table_name`. |
| **`ConcurrentAppendException`** | **OCC Conflict:** Two concurrent jobs updating overlapping Parquet files. | 1. Enable **Deletion Vectors** and Row Tracking for row-level concurrency.<br>2. Add explicit target clustering key filters inside `MERGE ON` predicates. |
| **`PhotonToSpark` Transition** | **Vectorization Breakout:** Custom Python UDF forces Photon to convert batches to JVM rows. | 1. Inspect SQL DAG for `BatchEvalPython`.<br>2. Rewrite Python UDFs using native `pyspark.sql.functions` or SQL Higher-Order Functions. |

---

## 6. Reference Manuals, Guides & Diagnostic Tools

- 📘 **[Databricks Data Intelligence Platform 20-Page Manual (PDF)](https://github.com/santoshjammi29/moderndataengineer/blob/main/docs/pdf/databricks_data_intelligence_platform_technical_manual.pdf)**: Complete curriculum covering compute, Delta Lake, Photon, and incident resolution.
- 📄 **[Catalyst Optimizer & Execution Plan Triage Guide (PDF)](https://github.com/santoshjammi29/moderndataengineer/blob/main/docs/pdf/spark_execution_plan_and_catalyst_triage_guide.pdf)**: 12 high-impact cards on plan reading, physical operators, and bottleneck elimination.
- 🚨 **[Production Triage Decision Matrix](./references/production_triage_decision_matrix.md)**: Fast symptom-to-fix lookup table.
- 📊 **[Spark UI & EventLog Analysis Guide](./references/spark_ui_eventlog_analysis.md)**: Reading stage timelines, executor metrics, and query plans.
- ⚙️ **[AQE Configuration & Tuning Reference](./references/aqe_configuration_reference.md)**: Dynamic coalescing, join switching, and skew join configs.
- 🔍 **[Execution Plan Diagnostic Script](./scripts/diagnose_spark_plan.py)**: Static analyzer detecting BroadcastNestedLoopJoin and Cartesian products.
