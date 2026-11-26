> 🧭 **Modern Data Engineering Ecosystem Navigation**
> - 📘 **Architecture & Concept:** [Data System Design — Lakehouse Architecture](https://github.com/santoshjammi29/data-system-design-handbook/tree/main/modules/01_lakehouse_and_medallion_architecture)
> - 💻 **Hands-On Recipe:** [Databricks Handbook — 105 Production Recipes](https://github.com/santoshjammi29/databricks-handbook)
> - 🔬 **Empirical Lab:** [Spark Experiments — Empirical Laboratory](https://github.com/santoshjammi29/spark-experiments)
> - 🚨 **Incident Runbook:** [PySpark Performance & Triage Runbooks](https://github.com/santoshjammi29/pyspark-handbook/tree/main/runbooks)
> - 🎯 **Interview Defense:** [Interview Handbook Master Guide](https://github.com/santoshjammi29/data-engineering-interview-handbook/blob/main/pillars/all_20_pillars_master_guide.md) *(You are here)*
> - 🌐 **Interactive Web Practice:** [Practice on moderndataengineer.uk](https://moderndataengineer.uk/practice)

# Pillar 17: Distributed MPP Query Engines: Trino, Presto & DuckDB
**Category:** `QUERY ENGINES & ANALYTICS` | **Domain:** `Distributed MPP Query Engines`

---

### Q1: Explain the distributed query execution lifecycle in Trino: Coordinator, Discovery, Workers, Splits, and Exchange Operators.

**Difficulty:** `HARD` | **Niche:** `Coordinator-Worker Architecture`

1. **Coordinator:** Parses SQL, analyzes syntax, applies Cost-Based Optimization (CBO), and generates distributed execution stages.
2. **Connector & Splits:** The coordinator requests splits from storage connectors (e.g. Hive/Iceberg connector generates 1 split per Parquet row group).
3. **Workers:** Execute pipelined operators in memory. Tasks stream intermediate row batches directly over HTTP/gRPC via Exchange Operators without writing intermediate shuffle files to disk.
4. **Pure In-Memory Streaming:** Output rows stream to the client while downstream stages are still processing, achieving ultra-low query latency.

---

### Q2: How does Dynamic Filtering in Trino optimize large fact-dimension joins at runtime?

**Difficulty:** `ARCHITECT` | **Niche:** `Dynamic Filtering in Trino`

In star-schema queries joining a massive fact table with a filtered dimension:
1. As worker nodes scan and filter the small dimension table, they collect distinct join keys into an in-memory Bloom filter or exact value set.
2. The dynamic filter is transmitted to the coordinator and broadcast to workers scanning the massive fact table.
3. The fact table scan evaluates the dynamic filter at the storage connector level, skipping non-matching Parquet row groups and partitions *before* reading rows into memory.
Reduces scan I/O by 80-95% for selective dimension queries.

---

### Q3: How does Trino manage memory across queries, and what happens when a query exceeds max-memory-per-node?

**Difficulty:** `HARD` | **Niche:** `Trino Memory Pools & Spill-to-Disk`

Trino allocates JVM memory into pools: **User Memory** (hash tables for joins/aggregations) and **System Memory** (reader buffers).
- `query.max-memory-per-node` caps the maximum memory a single query can consume on one worker.
**Exceeding Limits:**
1. If spill-to-disk is disabled (`spill-enabled = false`), the query is aborted immediately with `EXCEEDED_LOCAL_MEMORY_LIMIT`.
2. If **Spill-to-Disk** is enabled (`spill-enabled = true`), Trino spills hash join tables and aggregation states to local NVMe scratch disk, allowing large queries to complete at slightly reduced throughput.

---

### Q4: How does Trino Fault-Tolerant Execution (Project Tardigrade) allow multi-hour ETL queries to survive worker failures?

**Difficulty:** `ARCHITECT` | **Niche:** `Project Tardigrade (Fault Tolerance)`

Historically, Trino used pure in-memory streaming; a single worker crash killed the entire query.
**Fault-Tolerant Execution (`retry-policy = QUERY` or `TASK`):**
- Decouples stages by buffering intermediate stage outputs to an external spooling exchange storage (e.g. S3, MinIO, or local disk).
- If a worker dies while executing Task $T_{2,4}$, the coordinator restarts only that single failed task, reading inputs from the spooled output of Stage 1.
- Enables Trino to run massive, multi-hour batch ETL workloads reliably alongside interactive queries.

---

### Q5: What is the historical relationship and technical divergence between PrestoDB and Trino?

**Difficulty:** `MEDIUM` | **Niche:** `Trino vs Presto Architecture`

Trino was originally created as Presto at Facebook in 2012. In 2019, the original creators branched into PrestoSQL, which was rebranded as **Trino**.
**Key Divergence:**
- **Trino:** Maintained by the open-source Trino Foundation. Heavy enterprise adoption, leading support for open table formats (Iceberg, Delta Lake), native fault-tolerant execution, and dynamic filtering.
- **Presto (PrestoDB):** Maintained by Meta under Linux Foundation. Optimized for Meta's internal infrastructure, Presto on Spark, and native C++ Prestissimo (Velox engine).

---

### Q6: Why is DuckDB referred to as the 'SQLite for Analytics', and how does its vectorized execution engine achieve near-hardware speeds?

**Difficulty:** `HARD` | **Niche:** `DuckDB Columnar SIMD Engine`

DuckDB is an in-process, serverless columnar OLAP database written in C++ with zero external dependencies.
**Vectorized SIMD Execution (Morsel-Driven Parallelism):**
- Executes operations on 2,048-element column vectors that fit entirely within CPU L1/L2 cache.
- Uses SIMD instruction vectorization for filter and aggregation loops.
- **Morsel-Driven Scheduling:** Dynamically partitions tasks into small chunks (morsels) across available hardware threads with automatic work-stealing, avoiding global lock contention.
- Runs directly inside Python, Node.js, or browser WebAssembly without running a client-server daemon.

---

### Q7: How do you query multi-gigabyte remote S3/GCS Parquet files directly in DuckDB without downloading the files?

**Difficulty:** `MEDIUM` | **Niche:** `DuckDB Direct Parquet/S3 Querying`

```sql
-- Install and load httpfs extension:
INSTALL httpfs; LOAD httpfs;

-- Configure AWS credentials:
SET s3_region='us-east-1';
SET s3_access_key_id='AKIA...';
SET s3_secret_access_key='...';

-- Query remote Parquet files with automatic projection and filter pushdown:
SELECT
  customer_id,
  SUM(amount) AS total_spend
FROM read_parquet('s3://my-lakehouse/orders/*.parquet')
WHERE order_date >= '2026-11-01'
GROUP BY 1;
```
DuckDB issues HTTP Range Requests to read only Parquet footers and the specific required column chunks, reading a few megabytes over the network rather than gigabytes.

---

### Q8: How does DuckDB integrate with Apache Arrow and Polars to execute zero-copy analytical queries in Python?

**Difficulty:** `HARD` | **Niche:** `DuckDB + PyArrow Zero-Copy IPC`

```python
import duckdb
import polars as pl

# Create Polars DataFrame
pl_df = pl.DataFrame({"id": [1, 2, 3], "val": [10.5, 20.2, 30.1]})

# Query Polars DataFrame in DuckDB with ZERO COPY:
con = duckdb.connect()
result = con.execute("""
    SELECT id, val * 2 AS doubled
    FROM pl_df
    WHERE val > 15.0
""").arrow()

# Convert back to Polars with zero serialization overhead:
output_df = pl.from_arrow(result)
```
DuckDB reads the underlying Apache Arrow record batch pointers directly from Python process memory without copying memory.

---

### Q9: When should an enterprise use DuckDB instead of a single-node Apache Spark cluster for batch transformations?

**Difficulty:** `MEDIUM` | **Niche:** `DuckDB vs Single-Node Spark`

**Choose DuckDB:**
- Data fits on a single machine (up to a few terabytes using out-of-core spill-to-disk).
- Eliminates JVM startup latency, memory tuning, and Py4J IPC socket serialization.
- Embedded inside lightweight AWS Lambda, Docker containers, or Airflow worker pods.
- 5x to 10x faster execution and 90% lower compute cost than local Spark.
**Choose Spark:** When data exceeds single-node capacity (> 5TB), requires distributed cluster scaling across 100+ nodes, or requires stateful stream processing.

---

### Q10: How does Trino optimize query planning on 100TB Iceberg tables using metadata caching?

**Difficulty:** `HARD` | **Niche:** `Trino Iceberg Metadata Caching`

On tables with 100,000+ files, fetching Iceberg manifest files over S3 during query planning adds 10-30 seconds of planning latency.
**Trino Optimization:**
1. **In-Memory Manifest Caching:** Caches Iceberg manifest files in Trino coordinator/worker memory (`iceberg.metadata-cache.enabled = true`).
2. **Distributed Split Generation:** Delegates manifest file parsing to worker nodes in parallel rather than doing all planning on the single coordinator.
3. Cuts planning latency from 30 seconds down to < 200 milliseconds.

---
