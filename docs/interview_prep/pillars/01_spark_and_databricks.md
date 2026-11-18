# Pillar 01: Apache Spark & Databricks Engine Architecture
**Category:** `SPARK & DATABRICKS` | **Domain:** `Distributed Compute & Execution Engines`

---

### Q1: Explain the end-to-end execution lifecycle of a Spark query through the Catalyst Optimizer.

**Difficulty:** `HARD` | **Niche:** `Catalyst Optimizer Internals`

**Direct 30-Second Answer:**
Spark translates DataFrame/SQL operations through 5 discrete Catalyst phases before submitting tasks to the cluster:
1. **Unresolved Logical Plan:** Represents query syntax as an Abstract Syntax Tree (AST) where table/column names are unverified.
2. **Resolved Logical Plan (Analysis):** Spark Catalog resolves column names, data types, and table existence from the metastore.
3. **Optimized Logical Plan:** Applies standard rule-based optimizations: predicate pushdown, projection pruning, constant folding, and boolean simplification.
4. **Physical Planning:** Generates multiple candidate physical execution plans and uses Cost-Based Optimization (CBO) (table stats, column cardinality) to select the optimal physical plan.
5. **Whole-Stage Code Generation (Janino):** Compiles physical plan operators into flattened, optimized Java bytecode loops, eliminating virtual function dispatch and leveraging CPU L1/L2 registers.

---

### Q2: How does Project Tungsten manage memory off-heap, and why does it outperform standard JVM on-heap execution?

**Difficulty:** `ARCHITECT` | **Niche:** `Tungsten Engine & Memory Layout`

**Direct 30-Second Answer:**
Tungsten eliminates JVM overhead through 3 architectural pillars:
1. **Off-Heap Binary Memory (`sun.misc.Unsafe`):** Stores Spark rows in compact 8-byte aligned raw binary memory rather than Java objects. A 4-byte Java string overhead is reduced from ~48 bytes on the JVM heap down to 4 bytes in Tungsten.
2. **Zero JVM Garbage Collection:** Because Tungsten memory is allocated off-heap outside the JVM garbage-collected space, massive 100GB+ shuffles avoid JVM GC pauses.
3. **Cache-Aware Computation:** Designs sorting and hash join algorithms around CPU cache lines (L1/L2/L3), placing 64-bit integer cache-friendly sort pointers in continuous memory to maximize hardware cache hits.

---

### Q3: How do you calculate the optimal shuffle partition count for a 500 GB dataset in Apache Spark 3.5?

**Difficulty:** `HARD` | **Niche:** `Shuffle Architecture & Sizing`

**Direct 30-Second Answer:**
Target **100 MB to 200 MB per partition** in memory to maximize throughput while avoiding spill:
$$\text{Partitions} = \frac{\text{Total Stage Shuffle Size (500 GB)}}{128\text{ MB Target}} \approx 4000\text{ partitions}$$
**Core Alignment Check:** Total partitions must be an integer multiple ($2\times \text{ to } 4\times$) of total available executor CPU cores to ensure balanced worker task scheduling.
**Modern Production Practice:** In Spark 3.0+, enable Adaptive Query Execution (AQE):
```python
spark.conf.set('spark.sql.adaptive.enabled', 'true')
spark.conf.set('spark.sql.adaptive.coalescePartitions.enabled', 'true')
spark.conf.set('spark.sql.adaptive.advisoryPartitionSizeInBytes', '134217728') # 128MB
```
AQE dynamically merges small post-shuffle partitions down to the 128MB advisory target.

---

### Q4: What is Dynamic Partition Pruning (DPP) in Spark 3.x, and how does it optimize star-schema joins?

**Difficulty:** `HARD` | **Niche:** `Query Optimization & Pruning`

**Direct 30-Second Answer:**
Static Partition Pruning works when filters are applied directly to the partitioned table (e.g. `WHERE date = '2026-11-18'`). In star schemas, filters are typically applied to dimension tables (e.g. `dim_date.quarter = 'Q4'`).
**How DPP Works:**
1. Spark executes a broadcast filter on the small filtered dimension table.
2. A dynamic subquery extracts the resulting distinct partition keys into a broadcast Bloom filter / Hash Set.
3. The hash set is pushed directly down to the file scan of the massive partitioned fact table before reading Parquet files from cloud storage, skipping unneeded partitions dynamically.

---

### Q5: Explain the decision hierarchy Spark uses to select join strategies, and when each strategy is picked.

**Difficulty:** `HARD` | **Niche:** `Join Selection Mechanics`

**Decision Hierarchy:**
1. **Broadcast Hash Join (BHJ):** Selected if one side is smaller than `spark.sql.autoBroadcastJoinThreshold` (default 10MB) or has a `/*+ BROADCAST */` hint. Zero shuffle on the large table.
2. **Shuffle Hash Join (SHJ):** Selected if one side is significantly smaller than the other, records can be hashed into memory, and `spark.sql.join.preferSortMergeJoin = false`.
3. **Sort-Merge Join (SMJ):** Default for equi-joins between large datasets. Both sides are hashed into $N$ buckets across the network, sorted locally on disk/RAM, and merged.
4. **Broadcast Nested Loop Join (BNLJ):** Fallback for non-equi joins (e.g. `ON a.id > b.id`) with broadcast hints. Avoid in production; $O(M \times N)$ complexity.
5. **Cartesian Product Join:** Fallback for full cross joins without equi-conditions. Extremely expensive.

---

### Q6: Write production PySpark code to resolve a severe data skew issue on an equi-join using the salting technique.

**Difficulty:** `HARD` | **Niche:** `Data Skew Mitigation`

**Production PySpark Code:**
```python
from pyspark.sql import functions as F

SALT_FACTOR = 16 # Split skewed key across 16 sub-partitions

# 1. Salt the large skewed dataset with a random integer (0..15)
df_large_salted = df_large.withColumn(
    'salted_key',
    F.concat(F.col('skewed_key'), F.lit('_'), F.floor(F.rand() * SALT_FACTOR))
)

# 2. Replicate the dimension table 16 times using an exploded array
df_dim_replicated = df_dim.withColumn(
    'salt_array',
    F.array([F.lit(i) for i in range(SALT_FACTOR)])
).withColumn('salt_val', F.explode('salt_array')).withColumn(
    'salted_key',
    F.concat(F.col('skewed_key'), F.lit('_'), F.col('salt_val'))
).drop('salt_array', 'salt_val')

# 3. Perform the join on the salted key (perfectly balanced shuffle)
df_joined = df_large_salted.join(df_dim_replicated, on='salted_key', how='inner')
```

---

### Q7: Why are PyArrow Vectorized Pandas UDFs significantly faster than standard Python UDFs in PySpark?

**Difficulty:** `HARD` | **Niche:** `Vectorized Processing & Arrow`

**Direct 30-Second Answer:**
- **Standard Python UDF:** Operates row-by-row. Every row must be converted from Java objects, serialized into a byte stream, sent over an IPC socket pipe to a Python worker process, deserialized into Python objects, processed, and serialized back to the JVM. Causes massive serialization CPU waste.
- **Vectorized Pandas UDF (PyArrow):** Batches data into **Apache Arrow columnar memory buffers**. Data is passed directly between JVM and Python worker via shared memory or C-pipes with zero deserialization overhead. The Python worker executes vectorized C/NumPy SIMD operations over entire columns at once, achieving a **$10\times \text{ to } 50\times$ speedup**.

---

### Q8: What is the difference between `cache()` and `persist()`, and when should you use `StorageLevel.MEMORY_AND_DISK_SER`?

**Difficulty:** `MEDIUM` | **Niche:** `Caching & Memory Hygiene`

**Direct 30-Second Answer:**
- `cache()` is simply an alias for `persist(StorageLevel.MEMORY_AND_DISK)` (deserialized in memory).
- `StorageLevel.MEMORY_AND_DISK_SER` stores data in memory as serialized byte arrays (one byte array per partition).
**Why use `_SER` in Production:**
1. Deserialized Java objects consume $2\times \text{ to } 4\times$ more memory than serialized bytes.
2. Serialized partitions reduce GC overhead dramatically because thousands of rows are encapsulated within a single raw byte buffer instead of millions of distinct Java heap objects.
**Golden Rule:** Always call `df.unpersist()` as soon as the cached DataFrame has finished serving its multi-branch downstream consumers.

---

### Q9: Explain how Broadcast Variables work internally in Spark and why they prevent driver/executor network bottlenecks.

**Difficulty:** `HARD` | **Niche:** `Distributed Variables & Network`

**Direct 30-Second Answer:**
Without broadcast variables, if a task references a local lookup dictionary, Spark serializes the dictionary and ships a separate copy across the network for **every single task** (e.g. 5,000 tasks = 5,000 network transfers).
**With `sc.broadcast(data)`:**
1. The driver serializes the object once and stores it in its local BlockManager.
2. Data is transferred to executors using a **BitTorrent-like peer-to-peer gossip protocol**, where executors download blocks from each other rather than overwhelming the driver.
3. The broadcast object is cached in memory **once per executor JVM**, shared read-only across all task worker threads on that node.

---

### Q10: How do you distinguish between an Executor Heap OOM and an Executor Off-Heap OOM (Exit Code 137)?

**Difficulty:** `ARCHITECT` | **Niche:** `Memory Triage & Runbooks`

**Direct 30-Second Answer:**
- **Executor Heap OOM (`java.lang.OutOfMemoryError: Java heap space`):**
  - *Root Cause:* On-heap execution or user memory exhausted. Caused by massive join hash tables, skewed partitions, or caching huge DataFrames.
  - *Remediation:* Increase `spark.executor.memory`, increase shuffle partitions, or resolve data skew.
- **Off-Heap OOM (Exit Code 137 / SIGKILL by YARN or Kubernetes):**
  - *Root Cause:* Total physical RAM consumed by the container (JVM Heap + Off-Heap + Python Daemons + OS buffers) exceeded the container limit set by the cluster manager.
  - *Remediation:* Increase `spark.executor.memoryOverhead` from 10% to 20-30% (`spark.executor.memoryOverhead = 2048MB`), especially when using PyArrow or heavy C-libraries.

---
