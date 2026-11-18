# Pillar 03: Modern Lakehouse & ACID Table Formats
**Category:** `MODERN LAKEHOUSE` | **Domain:** `Storage Architectures & Table Formats`

---

### Q1: Compare Delta Lake, Apache Iceberg, and Apache Hudi across architecture, metadata layout, and optimal use cases.

**Difficulty:** `ARCHITECT` | **Niche:** `Table Format Architecture`

**Comparison Matrix:**
- **Delta Lake:** Structured commit log (`_delta_log/` JSON + Parquet checkpoints). Tightest integration with Apache Spark and Databricks. Best-in-class performance for streaming micro-batches and fast transactional MERGEs.
- **Apache Iceberg:** Tree-structured metadata (Iceberg Catalog -> Metadata File -> Manifest List -> Manifest Files). Highly independent of compute engine. Native support across Snowflake, Trino, Athena, and Spark. Supports hidden partitioning.
- **Apache Hudi:** Timeline service with instant file-level indexing (Hudi Key -> FileID). Highly optimized for fast Merge-on-Read (MoR) upserts in real-time streaming pipelines with change data capture.

---

### Q2: Explain the hierarchical metadata tree architecture of Apache Iceberg from Catalog down to Parquet data files.

**Difficulty:** `HARD` | **Niche:** `Apache Iceberg Internals`

**Hierarchical Architecture:**
1. **Iceberg Catalog:** Holds the current metadata pointer for a table (e.g. `s3://bucket/metadata/v4.metadata.json`).
2. **Metadata File:** Records table schema, partition spec, snapshot log, and points to the current **Snapshot**.
3. **Manifest List:** Represents a snapshot; contains an array of entries pointing to **Manifest Files**, storing min/max partition bounds for each manifest.
4. **Manifest File:** Stores the list of actual Parquet/ORC **Data Files**, tracking row counts, column metrics (null counts, min/max values), and file status (ADDED, EXISTING, DELETED).
5. **Data Files:** Actual columnar files containing table records.

---

### Q3: What is Hidden Partitioning in Apache Iceberg, and how does it prevent query user mistakes?

**Difficulty:** `HARD` | **Niche:** `Partition Evolution & Pruning`

**Direct 30-Second Answer:**
In Hive/Delta, users partition by derived columns (e.g. `event_date = to_date(timestamp)`). Queries filtering on `timestamp` often fail to prune partitions unless users explicitly filter on `event_date` as well.
**Hidden Partitioning:**
Iceberg understands relationship transforms (`day(ts)`, `bucket(16, id)`). Users query the natural column `WHERE ts >= '2026-11-18'`, and Iceberg **automatically converts the predicate into partition pruning**, eliminating human error and enabling seamless partition evolution without rewriting tables.

---

### Q4: Compare Copy-on-Write (CoW) vs Merge-on-Read (MoR) in lakehouse storage engines.

**Difficulty:** `HARD` | **Niche:** `Storage Engine Trade-offs`

**Direct 30-Second Answer:**
- **Copy-on-Write (CoW):** Every update/delete immediately rewrites affected Parquet files. High write cost/latency, but read queries are lightning-fast because data files are fully consolidated without join overhead.
- **Merge-on-Read (MoR):** Writes updates to lightweight delta log files (Avro/Parquet) alongside existing base files. Ingestion is extremely fast with low write amplification; however, read queries must merge base files and delta logs on-the-fly, incurring a read-time CPU penalty.

---

### Q5: Why do modern lakehouse table formats use Optimistic Concurrency Control (OCC) instead of 2-Phase Locking?

**Difficulty:** `HARD` | **Niche:** `Concurrency Control`

**Direct 30-Second Answer:**
Cloud object storage (S3/ADLS) does not support native file locking primitives.
- **OCC Advantages:** In analytical lakehouses, writes are typically batch or micro-batch operations touching mutually exclusive partitions. OCC allows multiple jobs (e.g. streaming ingestion and batch reporting) to write simultaneously without blocking readers.
- **Commit Conflict Resolution:** Transactions only conflict if they modify the exact same underlying files or partitions. In case of conflict, only the colliding transaction retries, ensuring maximum cluster write concurrency.

---

### Q6: What is Delta Lake UniForm (Universal Format), and how does it bridge Delta Lake and Apache Iceberg?

**Difficulty:** `ARCHITECT` | **Niche:** `Multi-Engine Interoperability`

**Direct 30-Second Answer:**
Delta UniForm automatically generates **Apache Iceberg metadata** alongside Delta Lake transaction logs when writing data:
- Underlying data files are stored once as standard Parquet files.
- Delta writes the native `_delta_log` commits and an asynchronous background service generates corresponding Iceberg `metadata.json` and manifest files.
- **Outcome:** Databricks/Spark writes data in Delta format; external engines like Snowflake, Trino, and Google BigQuery read the exact same data files as native Iceberg tables without data duplication or migration pipelines.

---

### Q7: Explain how schema evolution operates in Delta Lake and Apache Iceberg without breaking downstream readers.

**Difficulty:** `MEDIUM` | **Niche:** `Schema Evolution`

**Direct 30-Second Answer:**
Schema changes (adding non-null columns with defaults, renaming columns, or widening numeric types) are committed purely as **metadata events** in the transaction log.
- Historical Parquet files are never touched or rewritten.
- When a query scans historical files that lack a newly added column, the storage reader reads the schema definition from metadata and synthesizes the default or `NULL` value in-memory during decompression.

---

### Q8: Explain the difference between Serializable and WriteSerializable isolation in Delta Lake.

**Difficulty:** `ARCHITECT` | **Niche:** `ACID Isolation Levels`

**Direct 30-Second Answer:**
- **Serializable (Strictest):** Guarantees that the outcome of concurrent operations is identical to some purely sequential execution. If Transaction B modifies any data that was read by concurrent Transaction A, Transaction A will fail and retry.
- **WriteSerializable (Default):** Guarantees serializability strictly for write operations. Allows Transaction A to read data concurrently being appended by Transaction B without conflict, as long as Transaction A's writes do not overlap with Transaction B's writes. Offers significantly higher write concurrency for continuous streaming pipelines.

---

### Q9: How do you design an automated compaction and bin-packing strategy for a lakehouse table receiving 1,000 updates/min?

**Difficulty:** `HARD` | **Niche:** `Table Maintenance & Compaction`

**Production Architecture:**
1. **Ingest with Auto-Compaction:** Enable `delta.autoOptimize.autoCompact = true` during streaming micro-batches to merge tiny files immediately on write.
2. **Scheduled Bin-Packing (`OPTIMIZE`):** Run an hourly scheduled job executing `OPTIMIZE table_name` targeting 512 MB to 1 GB output file sizes.
3. **Partition/Cluster Targeted Compaction:** Instead of running `OPTIMIZE` over the entire petabyte table, run localized compaction on active partitions:
```sql
OPTIMIZE gold_orders WHERE order_date >= CURRENT_DATE() - INTERVAL 2 DAYS;
```

---

### Q10: How do you implement GDPR 'Right to be Forgotten' user deletions in an append-only, immutable lakehouse?

**Difficulty:** `ARCHITECT` | **Niche:** `Compliance & Privacy Architecture`

**Production Architecture:**
1. **Point Deletion via Deletion Vectors:** Execute `DELETE FROM customers WHERE customer_id = 'user_123'`. Delta records the deletion in a vector bitmap without rewriting the Parquet file.
2. **Cryptographic Erasure (Alternative Pattern):** Encrypt each user's PII with a unique user-specific encryption key managed in Key Vault. To delete the user, permanently destroy their encryption key; historical data files become mathematically irreversible garbage.
3. **Hard Deletion & Storage Purge:** Run `VACUUM customers RETAIN 0 HOURS` (in maintenance window) to remove tombstoned physical Parquet files and transaction logs past legal retention limits.

---
