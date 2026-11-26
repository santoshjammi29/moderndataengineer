> 🧭 **Modern Data Engineering Ecosystem Navigation**
> - 📘 **Architecture & Concept:** [Data System Design — Lakehouse Architecture](https://github.com/santoshjammi29/data-system-design-handbook/tree/main/modules/01_lakehouse_and_medallion_architecture)
> - 💻 **Hands-On Recipe:** [Databricks Handbook — 105 Production Recipes](https://github.com/santoshjammi29/databricks-handbook)
> - 🔬 **Empirical Lab:** [Spark Experiments — Empirical Laboratory](https://github.com/santoshjammi29/spark-experiments)
> - 🚨 **Incident Runbook:** [PySpark Performance & Triage Runbooks](https://github.com/santoshjammi29/pyspark-handbook/tree/main/runbooks)
> - 🎯 **Interview Defense:** [Interview Handbook Master Guide](https://github.com/santoshjammi29/data-engineering-interview-handbook/blob/main/pillars/all_20_pillars_master_guide.md) *(You are here)*
> - 🌐 **Interactive Web Practice:** [Practice on moderndataengineer.uk](https://moderndataengineer.uk/practice)

# Pillar 15: Apache Iceberg & Modern Open Table Formats
**Category:** `OPEN TABLE FORMATS` | **Domain:** `Modern Open Table Formats`

---

### Q1: Explain the 4-tier metadata tree architecture of Apache Iceberg and how it resolves snapshot queries.

**Difficulty:** `ARCHITECT` | **Niche:** `Iceberg Metadata Tree`

Apache Iceberg structures tables into a hierarchical metadata tree:
1. **Iceberg Catalog:** Stores the current pointer to the latest **Metadata File** (`v3.metadata.json`).
2. **Metadata File:** Contains table schema, partition spec, snapshot history, and an array of snapshots with timestamp/id.
3. **Manifest List (`snap-*.avro`):** Represents a specific snapshot. Contains an entry for every **Manifest File**, along with partition summary min/max bounds.
4. **Manifest File (`*.avro`):** Contains the list of actual **Data Files** (`*.parquet`), file path, size, record count, column-level min/max stats, null counts, and delete file references.
**Query Resolution:** The query planner inspects partition bounds in the Manifest List to prune whole manifest files, then inspects column stats in remaining manifests to skip data files before reading Parquet footers.

---

### Q2: What is Hidden Partitioning in Apache Iceberg, and why does it eliminate Hive user query partition bugs?

**Difficulty:** `HARD` | **Niche:** `Hidden Partitioning`

**Hive Partitioning Flaw:** In Hive/Spark, partitioning by date required adding a physical synthetic column `date_col = '2026-11-18'`. If a user queried `WHERE timestamp >= '2026-11-18 00:00:00'`, Hive failed to prune partitions because the query did not explicitly filter on `date_col`.
**Iceberg Hidden Partitioning:**
- Partition specs define transforms directly on source columns: `PARTITIONED BY (days(event_time), bucket(16, user_id))`.
- Queries simply filter `WHERE event_time >= '2026-11-18 00:00:00'`. Iceberg's metadata planner automatically translates the timestamp filter into partition bounds, pruning files transparently without synthetic columns.

---

### Q3: Compare Positional Deletes vs Equality Deletes in Iceberg Merge-On-Read (MOR) tables.

**Difficulty:** `HARD` | **Niche:** `Iceberg Deletes (Positional vs Equality)`

**1. Positional Deletes:** A delete file stores the exact file path and 0-based integer row ordinal position of deleted rows (`file_path: 's3://.../part-1.parquet', pos: 1042`). Very fast at read time: the reader loads positions into memory and skips rows.
**2. Equality Deletes:** A delete file stores field equality conditions (`id = 4521`). Highly performant at write time (used in Flink CDC streaming writes), but expensive at read time because the reader must join equality delete rows with all candidate data files.
*Best Practice:* Schedule background compaction (`RewriteDataFiles`) to merge Equality Deletes into clean Parquet files.

---

### Q4: How do Field IDs in Iceberg prevent column corruption during renames and drops?

**Difficulty:** `HARD` | **Niche:** `Schema Evolution with Field IDs`

Traditional Parquet readers map columns by column name or ordinal index position. Renaming a column or swapping positions in Parquet causes data misalignment or missing column errors.
**Iceberg Field IDs:**
- Every column is assigned an immutable 32-bit integer ID (`field_id: 1`).
- Renaming `cust_name` (ID 1) to `customer_full_name` simply updates metadata; the physical Parquet file retains ID 1.
- Dropping a column marks ID 1 deleted; new columns never reuse ID 1.
- Parquet readers map data strictly by Field ID, guaranteeing 100% immune schema evolution.

---

### Q5: Compare modern Iceberg catalog architectures: REST Catalog vs Project Nessie vs Apache Polaris.

**Difficulty:** `ARCHITECT` | **Niche:** `Catalog Architectures (REST/Nessie/Polaris)`

**1. Iceberg REST Catalog:** The official open standard HTTP specification for Iceberg catalogs. Decouples engines from storage backend; supported natively by Snowflake, Databricks, and Tabular.
**2. Project Nessie:** A Git-like catalog for Iceberg. Provides branches (`git checkout branch`), tags, and atomic multi-table commits. Enables WAP (Write-Audit-Publish) workflows.
**3. Apache Polaris (Snowflake):** Open-source enterprise REST catalog providing multi-cloud cross-engine role-based access control (RBAC) and credential vending.

---

### Q6: How do you execute point-in-time time-travel queries in Apache Iceberg using SQL and PySpark?

**Difficulty:** `MEDIUM` | **Niche:** `Iceberg Snapshot Isolation`

```sql
-- Query as of a specific historical timestamp:
SELECT * FROM prod.db.orders FOR SYSTEM_TIME AS OF '2026-11-01 10:00:00';

-- Query as of a specific Snapshot ID:
SELECT * FROM prod.db.orders FOR SYSTEM_VERSION AS OF 84920491029482019;
```
In PySpark:
```python
spark.read.option("as-of-timestamp", "1795000000000").table("prod.db.orders")
spark.read.option("snapshot-id", 84920491029482019).table("prod.db.orders")
```

---

### Q7: What is the difference between bin-pack compaction and Z-order sort compaction in Iceberg?

**Difficulty:** `HARD` | **Niche:** `Compaction Strategies (Bin-pack vs Z-Order)`

**1. Bin-Pack Compaction (`rewriteDataFiles(strategy = 'binpack')`):** Groups small files into optimal target sizes (e.g. 512MB) without sorting. Extremely low compute cost; fast, ideal for consolidating micro-batch streams.
**2. Sort / Z-Order Compaction (`strategy = 'sort', sort_order = zorder(col1, col2)`):** Rewrites files sorted along multi-dimensional space-filling curves. Minimizes min/max range overlaps across files, allowing queries filtering on clustered columns to skip 90%+ of files.

---

### Q8: What is the Puffin file format in Apache Iceberg, and how does it accelerate Cost-Based Optimization?

**Difficulty:** `ARCHITECT` | **Niche:** `Puffin File Format & Sketches`

Puffin is a specialized file format designed by Apache Iceberg to store statistical sketches, indexes, and blobs outside data files.
- **Theta Sketches & HyperLogLog (HLL):** Stores distinct count estimates for columns.
- **Bloom Filters:** Stores probabilistic set membership filters.
- *Why It Matters:* Query engines (Trino/Spark) read lightweight Puffin files during query planning to calculate exact join cardinalities and build DPP filters without scanning underlying Parquet files.

---

### Q9: How do you implement the Write-Audit-Publish (WAP) pattern in Apache Iceberg using branches?

**Difficulty:** `ARCHITECT` | **Niche:** `Branching, Tagging & WAP Pattern`

1. **Write to Staging Branch:** Ingestion pipeline writes new batch into a dedicated branch: `ALTER TABLE orders CREATE BRANCH audit_branch;`
2. **Audit Phase:** Data quality tests run against `audit_branch` (`SELECT * FROM orders.branch_audit_branch`). Assert zero anomalies.
3. **Publish Phase (Fast-Forward):** If tests pass, fast-forward `main` branch to match `audit_branch` atomically via metadata commit.
Zero impact on production readers; dirty batches are dropped by deleting the branch without cleanup overhead.

---

### Q10: What are the trade-offs of using Delta Lake UniForm to generate Iceberg metadata vs maintaining a native Iceberg table?

**Difficulty:** `HARD` | **Niche:** `UniForm vs Native Iceberg`

**Advantages of UniForm:** Single write pipeline in Databricks creates both Delta and Iceberg metadata over the same Parquet files; Snowflake/Athena can query as Iceberg.
**Trade-offs vs Native Iceberg:**
- *Latency:* UniForm metadata translation is asynchronous; external engines see up to a few minutes of metadata lag.
- *Feature Parity:* Native Iceberg features like Puffin sketches, branch WAP workflows, and custom partition transforms may not be fully supported by UniForm translators.

---
