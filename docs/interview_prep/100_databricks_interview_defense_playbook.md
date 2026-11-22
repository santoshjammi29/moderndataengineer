# 100 Databricks Interview Defense Playbook: Explain the Choice. Defend the Trade-Off.

> **Authoritative Lead & Senior Data Engineer Interview Playbook**  
> Direct architectural answers, deep runtime mechanics, production code, and trade-off defenses for the 100 core Databricks interview questions across all 10 foundational domains.

---

## 🧭 Executive Matrix: 10 Core Domains

| # | Domain & Theme | Focus Area | Questions |
| :---: | :--- | :--- | :---: |
| **01** | **Architecture: Foundations of the Platform** | Control/Compute Planes, Serverless, Photon, Medallion | Q01–Q10 |
| **02** | **Delta Lake: Defend the Write** | ACID, Transaction Log, Conflicts, Schema Enforcement, VACUUM | Q11–Q20 |
| **03** | **Ingestion: Expect Messy Input** | Auto Loader, Checkpointing, Schema Drift, CDC, Quarantine | Q21–Q30 |
| **04** | **Transformations: Clean Data. Defensible Logic** | Deduplication, SCD Joins, Missing Keys, Row Inflation, UDFs | Q31–Q40 |
| **05** | **Streaming: Time Changes Everything** | Checkpoints, Watermarks, Late Data, State Bounding, foreachBatch | Q41–Q50 |
| **06** | **Performance & Triage: Stop the Spill** | Shuffle, Skew, Spill, Join Selection, OOM Exit 137, Memory Pools | Q51–Q60 |
| **07** | **Unity Catalog: Access is an Architecture Decision** | 3-Tier Namespace, Managed vs External, Row Filters, Lineage | Q61–Q70 |
| **08** | **Jobs & Deployment: From Notebook to Production** | Lakeflow, Task Dependencies, DABs, Retries, Parameterization | Q71–Q80 |
| **09** | **Incident Scenarios: The Job Passed. The Data Didn't** | Missing Data, Join Inflation, Stream Lag, Silent Corruptions | Q81–Q90 |
| **10** | **System Design: Own the Design. Defend the Trade-Off** | Freshness SLAs, Reruns, Multi-Region BCDR, 10x Scale Evolution | Q91–Q100 |

---

## Section 01: Architecture — Questions 01–10
*Tagline: Explain the choice. Defend the trade-off.*

### Q01: What makes a lakehouse different from a data lake?
* **30-Second Answer**: A data lake is passive, low-cost object storage (S3/ADLS/GCS) holding raw files with zero ACID transactional guarantees, schema enforcement, or metadata indexing, leading to corrupted reads and the "data swamp" problem. A lakehouse adds a transactional metadata layer (Delta Lake/Iceberg) on top of object storage to provide ACID guarantees, snapshot isolation, schema evolution, dynamic pruning, and warehouse-grade BI performance directly on open file formats without copying data to a proprietary data warehouse.
* **Explain the Choice**: The lakehouse unifies BI and AI workloads under a single storage copy and unified governance layer (Unity Catalog), eliminating dual-system ETL sync pipelines.
* **Defend the Trade-Off**: While a pure data warehouse (e.g. Snowflake) provides marginally lower sub-second latency for simple point-queries, the lakehouse avoids multi-million-dollar vendor lock-in, proprietary data export fees, and the cost of syncing petabytes across two platforms.

### Q02: How do control and compute planes differ?
* **30-Second Answer**: The **control plane** is the Databricks-managed SaaS layer hosting the UI, workspace management, notebook collaboration services, cluster manager coordinators, and job schedulers. The **compute (data) plane** is where the actual customer data resides (ADLS/S3) and where worker virtual machines (executors and driver) spin up inside the customer's cloud VPC/VNet to process queries.
* **Explain the Choice**: In Classic Compute, customer data never leaves the customer's own cloud security boundary. In Serverless Compute, the compute plane runs inside a hardened Databricks-managed cloud network using ephemeral, sandboxed firewalled containers.
* **Defend the Trade-Off**: Running compute in your own VPC gives maximum network isolation (private link, firewall rules), but you accept slower cold-start VM spin-up times (3–5 minutes) and cloud VM quotas. Serverless spins up in seconds, but requires trusting Databricks' zero-trust network boundaries.

### Q03: Which workloads suit serverless vs classic compute?
* **30-Second Answer**: **Serverless compute** suits bursty, interactive, or short-lived workloads: Databricks SQL Warehouses (BI dashboards), ad-hoc exploratory queries, Serverless Jobs (hourly/daily scheduled runs), and streaming with sporadic volumes where 0-second spin-up and instant scale-down to zero save massive costs. **Classic compute** suits long-running 24/7 heavy pipelines, workloads requiring custom low-level OS packages/init scripts, specialized GPU architectures, or strict compliance mandates requiring compute instances to reside physically inside a corporate VPC.
* **Defend the Trade-Off**: Serverless carries a higher per-DBU nominal price tag, but eliminates the 5–10 minute idle drain costs and VM startup overhead. For jobs running under 15 minutes, serverless is almost always cheaper overall.

### Q04: When would you choose a SQL warehouse?
* **30-Second Answer**: Choose a **Databricks SQL (DBSQL) Warehouse** when serving interactive SQL queries, BI tools (Power BI, Tableau), analysts, and semantic serving layers. SQL Warehouses use the C++ **Photon engine** by default, feature predictive I/O caching, and leverage automated horizontal auto-scaling (queuing and multi-cluster bursting) designed specifically for concurrent, multi-user SQL workloads rather than generic ETL pipelines.
* **Defend the Trade-Off**: Generic all-purpose interactive clusters support arbitrary Python libraries and ML models, but struggle with concurrent multi-user BI queries where single-tenant Spark schedulers queue tasks behind long queries.

### Q05: What belongs in Bronze, Silver and Gold?
* **30-Second Answer**:
  * **Bronze (Raw Ingestion)**: Append-only, raw source data ingested with zero transformations. Preserves the original schema, full historical timeline, arrival timestamps, source file metadata, and a `_rescued_data` column for corrupt payloads.
  * **Silver (Cleaned & Conformed)**: Cleaned, deduplicated, standardized, validated data. Schema enforced, business keys conformed, domain-level deduplication applied, and modeled into 3NF or SCD Type 1/Type 2 tables.
  * **Gold (Business Aggregates)**: Star-schema fact and dimension tables, aggregated metrics, feature stores, and customer-facing data products ready for executive dashboards, ML inference, and BI reporting.
* **Defend the Trade-Off**: Storing raw Bronze data incurs additional cloud storage costs, but guarantees that if a bug is discovered in Silver business logic, the entire historical pipeline can be replayed and reconstructed without querying transactional source databases.

### Q06: Why separate storage from compute?
* **30-Second Answer**: In legacy on-prem Hadoop clusters, storage and compute were co-located on the same physical disks/nodes, forcing organizations to buy expensive CPU nodes just to add storage capacity. Separating storage (infinitely scalable, low-cost cloud object stores like S3/ADLS) from compute (ephemeral VM clusters) allows independent autoscaling: you can spin up 1,000 CPU cores for a 10-minute heavy ETL job and terminate them immediately while paying pennies for idle cloud storage.
* **Defend the Trade-Off**: Decoupling introduces network I/O latency between cloud disks and compute nodes. This is mitigated by columnar Parquet formats, SSD caching (Delta Cache), pushdown predicate pruning, and Liquid Clustering.

### Q07: How would you isolate dev, test and production?
* **30-Second Answer**: Isolate environments using a **multi-workspace, multi-catalog architecture** under Unity Catalog:
  1. **Workspaces**: Separate workspaces for `dev`, `stage`, and `prod` to prevent developers from touching production compute or running runaway jobs on production clusters.
  2. **Catalogs**: Dedicated top-level Unity Catalog catalogs (`dev_catalog`, `stage_catalog`, `prod_catalog`) backed by isolated cloud storage containers/IAM roles.
  3. **Promotion**: Code is developed in Git feature branches, tested via automated CI/CD unit tests, packaged via **Databricks Asset Bundles (DABs)**, and promoted across environments using Service Principals.
* **Defend the Trade-Off**: Managing 3 workspaces adds configuration overhead, but prevents catastrophic data corruption, accidental production table drops, and credential leakage.

### Q08: What changes when a notebook moves into production?
* **30-Second Answer**:
  1. **Compute**: Moves from an interactive shared cluster to a dedicated, ephemeral **Job Cluster** running under a dedicated Service Principal.
  2. **Code**: Hardcoded credentials and paths are replaced with Unity Catalog 3-tier references and `dbutils.secrets` or task parameters.
  3. **Structure**: Monolithic notebook cells are refactored into modular Python modules or Databricks Asset Bundles (DABs).
  4. **Quality Gates**: Defensive assertions, DLT expectations, and automated schema enforcement are added.
  5. **Observability**: Job alerts (Slack/PagerDuty on failure), retry policies, cluster run timeouts, and structured logging are enforced.

### Q09: Which workloads benefit from Photon?
* **30-Second Answer**: Workloads dominated by **relational operations on tabular data**: large scans, heavy filter predicates, hash joins (Sort-Merge / Shuffle Hash), aggregations (`GROUP BY`), and complex string/date manipulations. Photon is written in vectorized C++ and bypasses the JVM entirely to execute queries directly using hardware SIMD registers and CPU cache lines.
* **Defend the Trade-Off**: Workloads that do **not** benefit: non-vectorized Python UDFs, RDD transformations, machine learning model training (TensorFlow/PyTorch), or small I/O-bound jobs where cluster startup dominates runtime. Photon costs additional DBUs, so verify speedup yields lower net cost.

### Q10: Design a lakehouse for daily sales reporting.
* **30-Second Answer**:
  1. **Ingestion (Bronze)**: Auto Loader (`cloudFiles`) ingests daily sales raw files incrementally into `bronze.orders` with `schemaEvolutionMode="addNewColumns"` and `_rescued_data`.
  2. **Transformation (Silver)**: Delta Live Tables (DLT) or scheduled jobs deduplicate orders on `order_id`, validate amounts (`amount >= 0`), join with conformed customer and store dimensions, and write to `silver.orders` clustered by `(order_date, store_id)`.
  3. **Serving (Gold)**: Aggregated daily sales marts (`gold.daily_sales_summary`) pre-calculated by date, region, and product category, queried by Power BI via a Serverless SQL Warehouse.

---

## Section 02: Delta Lake: Defend the Write — Questions 11–20
*Tagline: Think consistency, retries and retention.*

### Q11: What does Delta Lake add to Parquet?
* **30-Second Answer**: Delta Lake adds an ACID-compliant transactional metadata layer (`_delta_log/`) on top of immutable Parquet data files. This introduces:
  1. **ACID Transactions**: Atomic commits via commit logs.
  2. **Snapshot Isolation & Time Travel**: Querying historical versions.
  3. **Unified Batch and Streaming**: Reading and writing as streams.
  4. **Schema Enforcement & Evolution**: Rejecting bad schema writes.
  5. **Data Skipping & Compaction**: File-level min/max statistics, Z-Ordering, Liquid Clustering, and Deletion Vectors.

### Q12: How does the transaction log enable consistent reads?
* **30-Second Answer**: The `_delta_log/` records an ordered series of atomic JSON commit files (`000000.json`, `000001.json`). When a reader queries a table:
  1. It reads the log up to the latest commit (or checkpoint Parquet file).
  2. It constructs an in-memory snapshot of **only active data files**, ignoring files added by uncommitted transactions or tombstoned by deletes.
  3. Readers are completely isolated from concurrent writers and never see partial, uncommitted, or corrupted writes.

### Q13: Two jobs update the same data. What can conflict?
* **30-Second Answer**: Delta Lake uses **Optimistic Concurrency Control (OCC)**. Conflicts occur when two concurrent transactions attempt to modify the same logical partition or data file.
  * **Concurrent Append & Delete/Update**: Job A reads files to update rows, while Job B deletes or updates rows in those same files. Job A’s commit fails with a `ConcurrentAppendException` or `ConcurrentModificationException`.
  * **Mitigation**: Partition data logically, use **Deletion Vectors** (which avoid file-level write conflicts by writing soft-delete bitmaps), or enable **Row-Level Concurrency** in Delta Lake 3.x.

### Q14: A MERGE source has duplicate keys. How do you handle them?
* **30-Second Answer**: In standard SQL and Delta Lake, if multiple source rows match a single target row in a `MERGE INTO` operation, the engine throws a runtime error: `Cannot perform Merge as multiple source rows matched and wrote to the same target row`.
* **Solution**: Deduplicate the source dataset *before* the merge using a window function:
  ```python
  from pyspark.sql.window import Window
  from pyspark.sql.functions import row_number, col

  w = Window.partitionBy("business_key").orderBy(col("updated_at").desc())
  deduped_source = source_df.withColumn("rn", row_number().over(w)).filter("rn = 1").drop("rn")
  ```

### Q15: How do you make an upsert safe to retry?
* **30-Second Answer**: Ensure the upsert is strictly **idempotent**:
  1. Base the `MERGE` condition strictly on immutable natural business keys (e.g. `ON target.order_id = source.order_id`), never auto-incrementing identity keys.
  2. Include a source timestamp check: `WHEN MATCHED AND source.updated_at >= target.updated_at THEN UPDATE SET ...`.
  3. In streaming, use `foreachBatch` with Delta's native transaction ID option:
     `df.writeStream.foreachBatch(upsert_func).option("checkpointLocation", path).start()`
     and specify `merge_builder.execute()` inside an atomic block.

### Q16: When would you enforce a schema rather than evolve it?
* **30-Second Answer**: Enforce schema on **Silver and Gold production tables** where downstream reporting, BI dashboards, regulatory reports, and financial models depend on strict type contracts and column naming standards. Schema evolution (`mergeSchema = true`) is permitted in **Bronze ingestion tables** to guarantee no data is dropped when third-party APIs add new fields.

### Q17: Why can VACUUM remove time-travel history?
* **30-Second Answer**: `VACUUM` physically purges data files on cloud storage that are no longer referenced by the active table snapshot and are older than the retention period (`delta.deletedFileRetentionDuration`, default 7 days). Once those tombstoned Parquet files are physically deleted from storage, any attempt to run a time-travel query against an older commit version that referenced those files will fail with a `FileNotFoundException`.

### Q18: How is OPTIMIZE different from VACUUM?
* **30-Second Answer**:
  * **`OPTIMIZE`**: Compacts thousands of small data files into larger, uniform $1\text{ GB}$ Parquet files (bin-packing) and optionally applies Z-Ordering. It **creates new files** and marks the old small files as tombstoned in the transaction log; it **does not delete anything from storage**.
  * **`VACUUM`**: The garbage collector. It physically **deletes old, unreferenced tombstoned files** from cloud storage that have surpassed the retention threshold to reclaim storage space.

### Q19: Change data feed falls behind retention. What now?
* **30-Second Answer**: Delta Change Data Feed (CDF) relies on underlying commit logs and data files. If a consumer falls behind the table’s file retention threshold and `VACUUM` runs, the pre-image and post-image files needed to compute row-level diffs are gone.
* **Resolution**: You must trigger a **full historical re-sync / snapshot baseline**:
  1. Stop the downstream CDF consumer.
  2. Read the latest table snapshot as a full batch load.
  3. Reset the CDF consumer checkpoint to the latest table version: `.option("startingVersion", "latest")`.

### Q20: When would you overwrite data instead of using MERGE?
* **30-Second Answer**: Choose `INSERT OVERWRITE` (or dynamic partition overwrite) over `MERGE` when:
  1. Replacing an entire logical partition (e.g., daily recalculation of `order_date = '2026-03-31'`).
  2. Reloading small dimension tables ($< 100\text{ MB}$) where a full replace is $10\times$ faster than evaluating merge conditions.
  3. Overwriting avoids the expensive join-and-read scan phase of a `MERGE`, completing via simple atomic metadata pointer swaps.

---

## Section 03: Ingestion: Expect Messy Input — Questions 21–30
*Tagline: CDC = change data capture.*

### Q21: Millions of new files arrive. How would you ingest them?
* **30-Second Answer**: Ingest them using **Databricks Auto Loader (`cloudFiles`)** with **File Notification mode**. In file notification mode, Auto Loader hooks into cloud storage event streams (AWS SQS / Azure Event Grid) to receive instant notifications of new file arrivals rather than recursively scanning directory trees, scaling effortlessly to billions of files with sub-second discovery overhead.

### Q22: What does Auto Loader track in its checkpoint?
* **30-Second Answer**: Auto Loader tracks:
  1. **Discovered Files State**: The list of already processed file paths, file sizes, modification times, and event notifications (stored in an embedded RocksDB state store inside the checkpoint directory).
  2. **Inferred Schema Metadata**: The historical schema evolution ledger (`_schemas/`).
  3. **Streaming Offsets & Commits**: The standard Spark Structured Streaming progress log ensuring exactly-once processing across pipeline restarts.

### Q23: How would you handle an unexpected new column?
* **30-Second Answer**: Configure Auto Loader with schema evolution:
  ```python
  (spark.readStream.format("cloudFiles")
   .option("cloudFiles.format", "json")
   .option("cloudFiles.schemaLocation", "/checkpoints/schema")
   .option("cloudFiles.schemaEvolutionMode", "addNewColumns")
   .load(path))
  ```
  When an unexpected column arrives, Auto Loader halts the micro-batch, appends the new column to the schema definition file, and resumes processing automatically in the next batch without data loss.

### Q24: How would you preserve malformed input for investigation?
* **30-Second Answer**: Enable the **Rescued Data Column** in Auto Loader:
  `.option("cloudFiles.schemaEvolutionMode", "rescue")`
  Any records that contain malformed JSON, un-parseable datatypes, or fields that do not match the expected schema are automatically routed into a JSON column named `_rescued_data` while the valid fields are parsed normally. No records are dropped, and bad rows can be queried for debugging.

### Q25: A corrected file reuses its name. What would you check?
* **30-Second Answer**: By default, Auto Loader tracks files by path and assumes file immutability. If a file is overwritten with the same name, Auto Loader **will ignore it** because its path already exists in the RocksDB checkpoint state.
* **Resolution**: You must check:
  1. `.option("cloudFiles.allowOverwrites", "true")`: Forces Auto Loader to compare file modification timestamps and sizes, re-ingesting modified files.
  2. In pure batch: Ensure the ingestion query explicitly checks modification timestamps or uses partition-level overwrites.

### Q26: How would you ingest database inserts, updates and deletes?
* **30-Second Answer**: Ingest via a Change Data Capture (CDC) pipeline (e.g. Debezium, Fivetran, or Qlik) streaming into a Bronze Delta table. The records arrive with metadata headers (`_op: 'c'|'u'|'d'`, `_timestamp`). Apply the changes to the Silver table using a Delta `MERGE INTO` statement or Delta Live Tables `APPLY CHANGES INTO` syntax, which automatically handles out-of-order sequence keys and tombstone deletes.

### Q27: Which source key and timestamp would you trust?
* **30-Second Answer**: Trust the **source transaction commit timestamp / log sequence number (LSN)** generated by the source database's write-ahead log (WAL/Binlog), **never** the client device timestamp (subject to clock drift/spoofing) and **never** the file ingestion timestamp (subject to network latency and backfill delays). Use the business primary key defined at the source system.

### Q28: How would you combine an initial load with CDC?
* **30-Second Answer**:
  1. Extract a full snapshot dump of the source database at a specific LSN/Timestamp $T_0$.
  2. Write this snapshot directly to the Silver table.
  3. Start the CDC stream capturing changes from $T_0$ onwards into Bronze.
  4. Ensure your `MERGE INTO` or DLT `APPLY CHANGES` specifies the sequence by column:
     `SEQUENCE BY cdc_lsn`
     Any CDC records that occurred before or during the initial load are automatically reconciled or ignored if the target already has equal or newer data.

### Q29: How would you reconcile source and target counts?
* **30-Second Answer**: Run an automated reconciliation reconciliation audit job:
  1. Query row counts grouped by partition key (e.g. `date`) on both source and target:
     `SELECT date, COUNT(*), SUM(hash(primary_key)) FROM table GROUP BY date`
  2. Compare row counts and cryptographic checksums (hash sums of business keys + core metric columns).
  3. If CDC includes deletes, target active count must equal `Source_Inserts - Source_Deletes`.

### Q30: When would you choose batch over streaming?
* **30-Second Answer**: Choose **batch** when:
  1. Source data arrives in periodic chunks (e.g., daily vendor dump at 2 AM).
  2. Complex global aggregations, machine learning feature engineering, or multi-table historical reconciliations require full dataset scans.
  3. Cost optimization is prioritized over freshness: spinning up a batch cluster for 15 minutes once per day costs significantly less than running a 24/7 streaming cluster.

---

## Section 04: Transformations: Clean Data. Defensible Logic — Questions 31–40
*Tagline: A green job is not proof of correct data.*

### Q31: Where would you remove duplicates—and why?
* **30-Second Answer**: Remove duplicates at the **Bronze $\rightarrow$ Silver transition**.
  * **Why**: Bronze must retain raw duplicates as an immutable historical audit trail of what was delivered by upstream producers. Silver is the single source of truth for downstream reporting; storing duplicates in Silver will inflate metrics, corrupt joins, and invalidate financial dashboards.

### Q32: How would you join orders to changing customer details?
* **30-Second Answer**: Use a **Slowly Changing Dimension (SCD Type 2)** join on event time:
  ```sql
  SELECT o.order_id, o.order_amount, c.customer_name, c.address
  FROM orders o
  JOIN dim_customer_scd2 c
    ON o.customer_id = c.customer_id
   AND o.order_date >= c.valid_from
   AND o.order_date < COALESCE(c.valid_to, '9999-12-31');
  ```
  This ensures an order placed in 2024 reflects the customer's 2024 address, not their relocated 2026 address.

### Q33: How would you handle missing business keys?
* **30-Second Answer**: Never drop them silently in production.
  1. Route rows with null or invalid business keys to a **Quarantine Table** (`silver.orders_quarantine`) with error codes for data steward review.
  2. In the reporting layer, map missing keys to a standardized default dimension record: `-1` (`UNKNOWN_CUSTOMER`), preserving referential integrity in BI star schemas without losing the revenue metric.

### Q34: Why can a LEFT JOIN inflate row counts?
* **30-Second Answer**: A `LEFT JOIN` preserves all rows from the left table, but if the right table contains **duplicate keys** for a single matching key on the left, relational algebra produces a Cartesian match for each duplicate on the right, multiplying the left rows.
* **Triage**: Ensure the right-side table is deduplicated on the join key (`assert count(distinct key) == count(*)`) before executing the join.

### Q35: How would you choose the latest row per business key?
* **30-Second Answer**: Use the analytical `ROW_NUMBER()` window function partitioned by the business key:
  ```python
  from pyspark.sql.window import Window
  from pyspark.sql.functions import row_number, col

  w = Window.partitionBy("customer_id").orderBy(col("updated_timestamp").desc())
  latest_df = df.withColumn("rn", row_number().over(w)).filter("rn = 1").drop("rn")
  ```

### Q36: How would you validate business rules before publishing?
* **30-Second Answer**: Implement **Delta Live Tables (DLT) Expectations** or **Write-Audit-Publish (WAP)**:
  * In DLT: `@dlt.expect_or_fail("positive_revenue", "revenue >= 0")`
  * In standard pipelines: Write output to an isolated staging view/branch, run automated SQL assertion tests (zero null primary keys, total revenue matches source within $0.01\%$), and only execute `MERGE` into production Gold upon passing all tests.

### Q37: When should bad records fail, drop or be quarantined?
* **30-Second Answer**:
  * **Fail (`expect_or_fail`)**: When critical compliance, financial ledger, or schema contract violations occur where publishing partial data creates regulatory or legal liability.
  * **Drop (`expect_or_drop`)**: For non-critical telemetry/clickstream data where missing records do not impact aggregate statistical validity.
  * **Quarantine**: For transactional systems where business logic fails (e.g. invalid zip code) but rows must be preserved and reprocessed once upstream systems fix the record.

### Q38: How would you design incremental transformations?
* **30-Second Answer**: Design transformations using **Delta Change Data Feed (CDF)** or **Structured Streaming with `readStream`**:
  Instead of scanning the entire Silver table, the incremental job reads only the newly committed micro-batches since the last checkpoint, transforms only the delta slice, and merges it into the target Gold table.

### Q39: When would you use SQL functions instead of Python UDFs?
* **30-Second Answer**: Always use **built-in SQL functions (`pyspark.sql.functions`)** by default.
  * **Why**: Native SQL functions execute inside the optimized C++ Photon engine or JVM Tungsten Whole-Stage CodeGen without data serialization. Standard Python UDFs force Spark to serialize rows across IPC sockets to Python worker daemons (`pyspark.daemon`), destroying vectorized CPU execution, preventing predicate pushdown, and running $10\times - 50\times$ slower. Use Python UDFs only when importing third-party C/Python libraries (e.g. specialized ML models).

### Q40: How would you test a backfill against existing outputs?
* **30-Second Answer**:
  1. Write the backfill output to a shadow/staging table: `gold.sales_backfill_test`.
  2. Run an automated **except / full-outer-join reconciliation**:
     ```sql
     SELECT COALESCE(a.id, b.id) AS id, a.metric AS current_val, b.metric AS backfill_val
     FROM gold.sales_current a
     FULL OUTER JOIN gold.sales_backfill_test b ON a.id = b.id
     WHERE a.metric IS DISTINCT FROM b.metric;
     ```
  3. Validate that row count diffs are exactly zero before swapping production pointers.

---

## Section 05: Streaming: Time Changes Everything — Questions 41–50
*Tagline: Reason about state, replay and late events.*

### Q41: What does a streaming checkpoint recover?
* **30-Second Answer**: A streaming checkpoint recovers:
  1. **Read Offsets (`/offsets`)**: The exact message offset/position in the source system (Kafka offset, Auto Loader file index) committed per micro-batch.
  2. **Committed Batch IDs (`/commits`)**: Records which micro-batches completed successfully.
  3. **State Store Data (`/state`)**: The serialized in-memory state (aggregations, window buffers, watermarks) stored in HDFS or RocksDB, allowing the stream to resume without data loss.

### Q42: Why isn't end-to-end exactly-once always automatic?
* **30-Second Answer**: Exactly-once processing requires three cooperative systems:
  1. **Replayable Source**: Can re-read data from a specific offset (Kafka, Delta Lake).
  2. **Deterministic Engine**: Checkpoints offsets and state transitions (Spark Structured Streaming).
  3. **Idempotent Sink**: Can receive duplicate writes during crash recovery without producing duplicates (Delta Lake ACID transactions, upsert keys). If the sink is a plain database `INSERT` or an uncoordinated REST API, duplicate messages will be published on retries.

### Q43: How does event time differ from processing time?
* **30-Second Answer**:
  * **Event Time**: The timestamp embedded within the record indicating when the event physically took place at the edge/client device.
  * **Processing Time**: The wall-clock timestamp of the Spark executor node when the event is processed. Event time is mandatory for accurate time-window aggregations and late-arrival handling.

### Q44: What does a watermark control?
* **30-Second Answer**: A watermark defines the threshold of acceptable lateness:
  $$\text{Watermark} = \max(\text{EventTime seen}) - \text{Allowed Latency Delay}$$
  It controls:
  1. When stateful window aggregations are finalized and emitted to the sink.
  2. When the engine can safely **evict expired state** from the RocksDB state store to prevent out-of-memory crashes.

### Q45: Late events miss the watermark. What is your plan?
* **30-Second Answer**: Events arriving older than the watermark are dropped by stateful aggregation operators.
  * **Plan**: Split the pipeline into two tiers:
    1. Fast path: Streaming engine processes $99\%$ of data within a 2-hour watermark.
    2. Slow path: Route all raw ingested data to Bronze Delta Lake. Run a scheduled nightly batch reconciliation job that re-aggregates historical windows, automatically capturing extreme late-arriving data.

### Q46: How do you bound state in a streaming join?
* **30-Second Answer**: In stream-stream joins, Spark buffers unmatched rows in state memory indefinitely unless bounded. To bound state, you must declare **watermarks on both streams** AND specify an **event-time interval constraint** in the join predicate:
  ```sql
  SELECT *
  FROM impressions i
  JOIN clicks c
    ON i.ad_id = c.ad_id
   AND c.click_time >= i.impression_time
   AND c.click_time <= i.impression_time + INTERVAL 1 HOUR;
  ```

### Q47: When is foreachBatch useful?
* **30-Second Answer**: Use `foreachBatch` when:
  1. Executing a `MERGE INTO` (upsert) from a streaming micro-batch into a target Delta table.
  2. Writing streaming output to multiple destinations simultaneously (e.g. Delta Lake AND Redis cache).
  3. Interfacing with legacy relational databases or custom third-party SDKs that lack native Spark Structured Streaming connectors.

### Q48: How do you make foreachBatch writes safe to retry?
* **30-Second Answer**: Make writes idempotent by leveraging the provided `batchId` parameter:
  ```python
  def write_micro_batch(batch_df, batch_id):
      (batch_df.write
       .format("delta")
       .mode("append")
       .option("txnVersion", batch_id)
       .option("txnAppId", "orders_streaming_pipeline")
       .save(target_path))
  ```
  Delta Lake checks `txnAppId` and `txnVersion`; if a micro-batch fails mid-run and retries with the same `batch_id`, Delta ignores the duplicate write.

### Q49: What must you check before changing a checkpointed query?
* **30-Second Answer**: Check for **state schema compatibility**:
  1. Adding/removing columns inside a stateful aggregation or stream-stream join will corrupt the deserialization of the existing RocksDB state checkpoint.
  2. Changing watermark duration, trigger intervals, or join key logic requires planning a checkpoint reset or deploying as a new parallel stream.

### Q50: How would you recover after a streaming outage?
* **30-Second Answer**:
  1. Restart the stream from the existing checkpoint; Spark will automatically fetch from the last committed offset and resume.
  2. If the backlog is massive (e.g., 24 hours behind), increase cluster compute cores temporarily and configure:
     `spark.streaming.kafka.maxOffsetsPerTrigger = 500000`
     to prevent memory starvation during initial catch-up micro-batches.

---

## Section 06: Performance & Triage: Stop the Spill — Questions 51–60
*Tagline: Memory, shuffles and execution mechanics.*

### Q51: What causes a stage to spill to disk?
* **30-Second Answer**: Disk spill occurs when an executor’s **Execution Memory pool (RAM)** is exhausted during operations requiring large in-memory buffers (Sort-Merge Joins, hash aggregations, wide window functions). The engine is forced to serialize the buffer and flush compressed blocks to local SSDs (`Spill (Disk)`), incurring heavy serialization and I/O penalties.

### Q52: How does Adaptive Query Execution (AQE) fix data skew?
* **30-Second Answer**: AQE inspects runtime shuffle statistics between stages. If a partition’s size exceeds the median by `skewedPartitionFactor` (default 5) and is larger than `skewedPartitionThresholdInBytes` (default 256MB), AQE dynamically splits the oversized partition into smaller sub-slices and reads matching join partitions in parallel without code changes.

### Q53: When would you choose a Broadcast Hash Join over a Sort-Merge Join?
* **30-Second Answer**: Choose **Broadcast Hash Join (BHJ)** when one table is small ($< 10\text{ MB} - 100\text{ MB}$) and can fit in driver and executor RAM. BHJ replicates the small table to all nodes, building an in-memory hash table and eliminating the massive network shuffle and disk sorting overhead of a Sort-Merge Join.

### Q54: Why would you use Liquid Clustering instead of traditional partitioning?
* **30-Second Answer**: Traditional Hive partitioning (`PARTITIONED BY date, country`) is rigid, prone to the small file problem if over-partitioned, and causes partition skew if data distribution changes. Delta 3.x **Liquid Clustering (`CLUSTER BY`)** decouples data layout from physical folder structures, clusters data along a space-filling curve, and allows changing clustering columns without rewriting historical data.

### Q55: How do you diagnose and resolve an Executor OOM (Exit Code 137)?
* **30-Second Answer**: Exit Code 137 is a `SIGKILL` issued by the host OS or container manager when total container memory (JVM Heap + Off-Heap + Python Daemons + OS cache) exceeds physical container limits.
* **Resolution**: Increase `spark.executor.memoryOverhead` from default $10\%$ to $25\% - 30\%$, decrease executor core count (use 4–5 cores per executor to reduce concurrency), and eliminate Python UDFs.

### Q56: What is the difference between cache() and persist(), and when should you unpersist?
* **30-Second Answer**: `cache()` stores DataFrames in JVM memory using the default storage level `MEMORY_AND_DISK`. `persist()` allows configuring the exact storage level (`MEMORY_ONLY`, `OFF_HEAP`, `MEMORY_ONLY_SER`). Always call `df.unpersist()` immediately after the cached DataFrame is no longer needed in downstream branches to free Storage Memory for execution buffers.

### Q57: How do you calculate the optimal shuffle partition count?
* **30-Second Answer**: Apply the $100\text{ MB} - 200\text{ MB}$ partition sizing rule:
  $$\text{Target Partitions} = \frac{\text{Stage Shuffle Input Size in Bytes}}{134,217,728 \text{ Bytes } (128\text{ MB})}$$
  Ensure the partition count is at least $2\times - 3\times$ total available cluster cores to prevent idle executor slots.

### Q58: When does key salting beat AQE skew join optimization?
* **30-Second Answer**: Salting beats AQE when:
  1. The skew occurs on a non-AQE engine (open-source Spark without adaptive planning).
  2. The skew is on a `groupBy` aggregation rather than a join.
  3. Skew on a single key is so extreme (e.g. 50M rows on one customer) that AQE's internal split factor still leaves oversized partitions.

### Q59: How do Deletion Vectors improve MERGE, UPDATE, and DELETE performance?
* **30-Second Answer**: Traditional Delta writes use Copy-on-Write (CoW): deleting or updating 1 row in a $1\text{ GB}$ Parquet file forces rewriting the entire $1\text{ GB}$ file. **Deletion Vectors (DVs)** write a compact serialized Roaring Bitmap alongside the data file marking the deleted row IDs. The engine performs sub-second soft-deletes with zero data file rewriting, deferring compaction to scheduled maintenance.

### Q60: What makes Photon faster than standard Spark execution?
* **30-Second Answer**: Standard Spark compiles queries into Java bytecode executed on a JVM, subject to object overhead and garbage collection. Photon is a native vectorized execution engine written from scratch in C++ that operates directly on columnar memory formats, utilizing CPU register vectorization (SIMD) and eliminating virtual method dispatching.

---

## Section 07: Unity Catalog: Access is an Architecture Decision — Questions 61–70
*Tagline: Give the least access the work needs.*

### Q61: How do catalog, schema and table fit together?
* **30-Second Answer**: Unity Catalog organizes securable assets into a **3-tier namespace**:
  `catalog.schema.table`
  * **Catalog**: Represents an environment, business unit, or data product domain (e.g., `prod_lakehouse`).
  * **Schema (Database)**: Represents a logical zone or functional layer (e.g., `bronze_raw`, `silver_finance`).
  * **Table / View / Volume**: The physical tabular dataset or unstructured file directory. Permissions granted at the catalog level cascade down automatically via privilege inheritance.

### Q62: How do you grant the minimum required access?
* **30-Second Answer**: Follow the principle of least privilege:
  1. Assign permissions to **groups / roles**, never individual user accounts.
  2. For reporting analysts: grant `USE CATALOG`, `USE SCHEMA`, and `SELECT` only on specific Gold views or schemas.
  3. Restrict `MODIFY`, `CREATE`, and DDL privileges strictly to automated Service Principals running CI/CD jobs.

### Q63: When should a table be managed rather than external?
* **30-Second Answer**:
  * **Managed Table**: The default and recommended choice for all native Lakehouse tables. Unity Catalog manages both metadata and physical storage lifecycle. Dropping the table deletes underlying data.
  * **External Table**: Use only when underlying cloud storage files must be accessed by external engines outside Databricks (e.g. Snowflake, Trino, AWS Athena) or when compliance prohibits Databricks from managing storage lifecycles.

### Q64: How do storage credentials and external locations differ?
* **30-Second Answer**:
  * **Storage Credential**: Represents the cloud identity authentication primitive (an Azure Managed Identity or AWS IAM Role with storage read/write permissions).
  * **External Location**: Combines a Storage Credential with a specific cloud storage URI (`abfss://container@account.dfs.core.windows.net/path`). Access to read/write from that storage path is governed by granting access to the External Location object in Unity Catalog.

### Q65: How would you restrict sensitive rows or columns?
* **30-Second Answer**: Use native Unity Catalog security functions:
  * **Column Masks**: Mask PII for unauthorized users:
    ```sql
    CREATE OR REPLACE FUNCTION mask_ssn(ssn STRING)
    RETURN CASE WHEN IS_ACCOUNT_GROUP_MEMBER('hr_admins') THEN ssn ELSE 'XXX-XX-XXXX' END;
    ALTER TABLE employees ALTER COLUMN ssn SET MASK mask_ssn;
    ```
  * **Row Filters**: Filter rows by user region or department:
    ```sql
    CREATE OR REPLACE FUNCTION filter_region(region STRING)
    RETURN IS_ACCOUNT_GROUP_MEMBER('global_execs') OR region = CURRENT_USER();
    ALTER TABLE sales SET ROW FILTER filter_region ON (region);
    ```

### Q66: How would you keep secrets out of notebooks?
* **30-Second Answer**: Never hardcode credentials. Store API keys and connection strings in a **Databricks Secret Scope** backed by Azure Key Vault or AWS Secrets Manager. Retrieve them dynamically at runtime:
  `api_token = dbutils.secrets.get(scope="finance_vault", key="stripe_api_key")`
  The token is automatically redacted and replaced with `[REDACTED]` in notebook cell outputs and logs.

### Q67: How can lineage help assess a schema change?
* **30-Second Answer**: Unity Catalog automatically captures runtime **column-level data lineage** across notebooks, jobs, and SQL queries. Before dropping or renaming a column in a Silver table, an engineer inspects the Lineage Graph in the UI to see every downstream Gold table, BI dashboard, and ML feature store that references that column, preventing breaking production changes.

### Q68: How would you audit who accessed sensitive data?
* **30-Second Answer**: Query the Databricks **System Tables (`system.access.audit`)**:
  ```sql
  SELECT event_time, user_identity.email, request_params.table_full_name, action_name
  FROM system.access.audit
  WHERE request_params.table_full_name = 'prod_catalog.finance.payroll'
    AND event_date >= CURRENT_DATE() - INTERVAL 30 DAYS;
  ```

### Q69: Why run a production job as a service principal?
* **30-Second Answer**: Running production jobs under a human user account causes failure when that user leaves the company, changes passwords, or has permissions revoked. A **Service Principal (SP)** is an automated machine identity that does not expire with employee turnover, has dedicated auditable least-privilege credentials, and isolates production workloads from interactive user tampering.

### Q70: How would you share data without copying it?
* **30-Second Answer**: Use **Delta Sharing**, an open-source protocol built into Unity Catalog. Delta Sharing allows live, read-only access to specific Delta tables across different Databricks workspaces, cloud providers (Azure, AWS, GCP), or external platforms (Power BI, Apache Spark, Pandas) without data copying or replication fees.

---

## Section 08: Jobs & Deployment: From Notebook to Production — Questions 71–80
*Tagline: Make the release repeatable and observable.*

### Q71: How do Lakeflow Jobs and Lakeflow pipelines differ?
* **30-Second Answer**:
  * **Lakeflow Jobs (Workflows)**: A general-purpose multi-task orchestration DAG engine for scheduling diverse tasks (notebooks, Python scripts, SQL queries, dbt models).
  * **Lakeflow Pipelines (Delta Live Tables - DLT)**: A declarative ETL framework focused specifically on data pipelines. You declare source and target tables, and DLT automatically determines task execution order, schema management, and data quality validation.

### Q72: How would you order dependent tasks?
* **30-Second Answer**: In Databricks Workflows, define task dependencies via the `depends_on` parameter in the DAG UI or YAML bundle. Task B will not start until Task A finishes with status `SUCCESS`. Conditional run logic (`ALL_SUCCESS`, `AT_LEAST_ONE_SUCCESS`, `NONE_FAILED`) handles branching workflows.

### Q73: When should a failed task retry automatically?
* **30-Second Answer**: Retry automatically on **transient infrastructure failures**: API rate limits, temporary cloud storage network blips (HTTP 503), spot instance preemption, or database connection timeouts. Set retry count to `2` or `3` with exponential backoff. Never auto-retry deterministic data failures (schema mismatches, divide-by-zero, assertion errors) as they will fail identically every time.

### Q74: When would you repair a run instead of rerunning every task?
* **30-Second Answer**: Use **Repair Run** in Databricks Workflows when a failure occurs in a downstream task of a multi-task DAG (e.g. Task 4 out of 5 fails). "Repair Run" reruns only the failed task and its direct downstream dependents, preserving the completed outputs of upstream Tasks 1–3, saving hours of execution time and cloud compute cost.

### Q75: How would you prevent overlapping job runs?
* **30-Second Answer**: Configure **Maximum Concurrent Runs**:
  In job settings, set `max_concurrent_runs: 1`. If an hourly run takes 75 minutes due to heavy data volume, the next scheduled run is placed in a queue rather than launching concurrently and causing write conflict errors on target tables.

### Q76: How would you pass parameters without hardcoding them?
* **30-Second Answer**: Use **Task Parameters / Widgets**:
  Define job-level parameters (e.g. `processing_date`, `env`) and access them in code via:
  `processing_date = dbutils.widgets.get("processing_date")`
  Dynamic parameter expressions like `{{job.start_time.iso_date}}` allow passing real-time execution timestamps automatically.

### Q77: How would you promote the same code across environments?
* **30-Second Answer**: Use **Databricks Asset Bundles (DABs)**:
  Define your project, clusters, and workflows as declarative YAML:
  ```bash
  databricks bundle deploy -t dev
  databricks bundle deploy -t prod
  ```
  The CI/CD pipeline deploys the exact same Git commit hash to dev, stage, and prod workspaces, substituting environment-specific variables (catalogs, service principals) dynamically.

### Q78: What belongs in version control for a data pipeline?
* **30-Second Answer**:
  1. All transformation code (Python modules, SQL scripts, DLT definitions).
  2. DABs orchestration YAML bundles and pipeline configurations.
  3. Automated unit and integration test scripts.
  4. CI/CD workflow files (GitHub Actions / Azure DevOps).
  *Never commit*: Raw data, secrets, tokens, or hardcoded cluster IDs.

### Q79: Which tests should block a production deployment?
* **30-Second Answer**:
  1. **Unit Tests**: Mocked transformations testing business edge cases (nulls, date math).
  2. **Schema Contract Tests**: Validating column names and types match target definitions.
  3. **Linting & Typechecking**: Strict formatting and static analysis (`ruff`, `mypy`).
  4. **Integration Tests**: End-to-end execution on a dev cluster against synthetic test data validating output row counts and zero unhandled exceptions.

### Q80: How would you schedule dependent data products?
* **30-Second Answer**: Decouple schedules using **event-driven file/table triggers**:
  Instead of fragile cron schedules (e.g. Job A at 2 AM, Job B at 3 AM), configure Job B to trigger upon an event (file arrival in storage, or completion webhook from Job A) or orchestrate cross-pipeline dependencies via enterprise orchestrators (Airflow / Astronomer).

---

## Section 09: Incident Scenarios: The Job Passed. The Data Didn't — Questions 81–90
*Tagline: Contain the impact. Find the cause. Prevent a repeat.*

### Q81: A successful run published wrong data. What now?
* **30-Second Answer**:
  1. **Contain**: Roll back the production Gold table immediately using Delta Time Travel:
     `RESTORE TABLE gold.orders TO VERSION AS OF <previous_healthy_version>;`
  2. **Quarantine**: Pause downstream jobs to stop bad data propagation.
  3. **Root Cause**: Inspect upstream Bronze input files and commit diffs.
  4. **Prevent**: Add a DLT expectation or assertion check to catch this specific data anomaly before future commits.

### Q82: Yesterday's data is missing. Where do you start?
* **30-Second Answer**: Start by walking backwards through the pipeline lineage:
  1. Check Gold: Did the query filter out the data? (Check `where date = yesterday`).
  2. Check Silver: Did the records fail quality validation or get dropped during deduplication?
  3. Check Bronze: Did Auto Loader ingest the raw files yesterday?
  4. Check Source / Storage: Were files actually uploaded to cloud storage, or did the upstream source system fail to produce them?

### Q83: A join suddenly doubles revenue. How do you trace it?
* **30-Second Answer**: Revenue doubling indicates a **Cartesian fan-out caused by non-unique keys on the right side of a join**.
* **Trace**:
  1. Run `SELECT key, COUNT(*) FROM dim_table GROUP BY key HAVING COUNT(*) > 1`.
  2. Identify the duplicate key records in the dimension table that caused multiple rows to match a single sales transaction.
  3. Fix by deduplicating the dimension table using `ROW_NUMBER()`.

### Q84: A stream falls behind. How do you find the bottleneck?
* **30-Second Answer**: Open the **Structured Streaming tab in Spark UI**:
  1. Compare **Input Rate (records/sec)** vs. **Processing Rate (records/sec)**.
  2. If Input Rate > Processing Rate, the stream is falling behind.
  3. Inspect **Batch Duration**: Which stage takes the longest?
     * If duration is spent on write: Sink database is throttling / disk write bottleneck.
     * If duration is spent on shuffle/sort: Memory spill or data skew. Scale executor cores or increase micro-batch parallelism.

### Q85: A job runs out of memory. What evidence matters?
* **30-Second Answer**:
  1. **Exit Code**: Exit 137 indicates container memory overhead breach; generic Java heap OOM indicates executor memory exhaustion.
  2. **Spark UI Stages Tab**: Inspect **Spill (Memory)** and **Spill (Disk)** metrics.
  3. **Task Duration Skew**: Did 1 task process 100x more data than the median? (Data skew).
  4. **Driver vs. Executor**: Did driver crash during `.collect()` or did workers crash during wide joins?

### Q86: A deployment breaks table access. What do you inspect?
* **30-Second Answer**:
  1. **Unity Catalog Privileges**: Did the deployment re-create the schema/table, resetting object permissions?
  2. **Storage Credentials / External Location**: Was the underlying IAM role or storage token rotated or modified?
  3. **Service Principal Grants**: Does the runtime compute identity lack `USE CATALOG` or `SELECT` permissions on the new asset?

### Q87: The input schema changes overnight. How do you recover?
* **30-Second Answer**:
  1. If Auto Loader was configured with `schemaEvolutionMode="addNewColumns"`, the new columns are automatically merged into Bronze without intervention.
  2. If the pipeline crashed on a rigid downstream Silver table: inspect the `_rescued_data` column or schema diff, update the Silver DDL to accommodate the new type/column, and rerun the Silver stage.

### Q88: A checkpoint is lost. What risks must you plan for?
* **30-Second Answer**:
  * **Risk**: The streaming engine has lost its offset position and state history. Restarting without a checkpoint forces either reading from the beginning (causing massive duplicate data processing) or reading from `latest` (causing permanent data loss).
  * **Plan**: Re-read from a safe historical offset into a staging table, run an idempotent `MERGE INTO` target to deduplicate, and enforce automated cloud backups on checkpoint directories.

### Q89: A backfill overlaps live ingestion. How do you keep it safe?
* **30-Second Answer**:
  1. **Isolate Partitions**: Ensure the live stream writes only to current dates (`date >= CURRENT_DATE()`), while the backfill writes strictly to historical partitions (`date < CURRENT_DATE()`).
  2. If writing to the same table: Use Delta Lake’s ACID guarantees with **Row-Level Concurrency** or run backfills into a shadow table and merge during off-peak hours.

### Q90: What should a useful data incident review capture?
* **30-Second Answer**: A blameless post-mortem capturing:
  1. **Timeline**: Time of incident, detection time, containment time, resolution time (MTTD/MTTR).
  2. **Impact**: Which tables, dashboards, and business decisions were affected.
  3. **Root Cause**: Technical 5-Whys analysis (e.g. upstream schema change dropped a key).
  4. **Action Items**: Preventative automated tests, alerts, and architectural guardrails added to ensure this class of failure never recurs.

---

## Section 10: System Design: Own the Design. Defend the Trade-Off — Questions 91–100
*Tagline: Learn Data Engineering through real-time projects.*

### Q91: Design a pipeline for hourly inventory updates.
* **30-Second Answer**:
  1. **Ingestion**: Auto Loader streams warehouse inventory files hourly into `bronze.inventory_raw` using `trigger(availableNow=True)`.
  2. **Silver**: Incremental micro-batch cleanses inputs, dedupes on `(warehouse_id, sku)`, and executes an idempotent `MERGE INTO silver.inventory_current`.
  3. **Gold**: Aggregates total stock levels by product category into `gold.stock_availability` using Liquid Clustering on `sku`.

### Q92: How would you set a measurable data freshness target?
* **30-Second Answer**: Define a formal **Service Level Objective (SLO)**:
  $$\text{Freshness Latency} = \text{Current Wall-Clock Time} - \max(\text{Event Timestamp in Gold Table})$$
  Example: "Gold inventory data freshness must be $\le 60\text{ minutes}$ for $99.5\%$ of hourly runs." Monitor via automated Databricks Lakehouse Monitoring and alert on threshold breaches.

### Q93: When does low latency justify streaming complexity?
* **30-Second Answer**: Low latency justifies streaming only when **immediate automated action or financial loss prevention depends on sub-minute data**: real-time credit card fraud detection, dynamic airport baggage routing, or live IoT medical equipment monitoring. If human business decisions are made on daily or hourly meetings, micro-batch or batch pipelines provide $5\times$ lower cost and operational simplicity.

### Q94: How would you make reruns safe across the whole pipeline?
* **30-Second Answer**: Enforce **strict idempotency at every stage**:
  1. Avoid appending with non-deterministic auto-generated keys.
  2. In Bronze: Deduplicate files by name or source checksum.
  3. In Silver/Gold: Use deterministic natural keys in `MERGE INTO` or overwrite target partitions completely using `INSERT OVERWRITE`. Rerunning a job 10 times produces the exact same target state as running it once.

### Q95: How would you design recovery across cloud regions?
* **30-Second Answer**:
  1. **Storage**: Configure geo-redundant storage replication (Azure GRS / AWS S3 Cross-Region Replication) for underlying Delta Lake buckets.
  2. **Metadata**: Replicate Unity Catalog metastores across regions or sync catalog declarations via Databricks Asset Bundles (DABs).
  3. **Compute**: Maintain a standby warm or cold disaster-recovery workspace in the secondary region; trigger automated failover DNS switching if primary region suffers an outage.

### Q96: How would you balance reliability, speed and cost?
* **30-Second Answer**: Apply the **Tiered SLA Framework**:
  * **Critical Financial / Executive Assets**: Prioritize reliability and speed (Dedicated job clusters, Photon enabled, aggressive data quality expectations).
  * **Exploratory Analytics / Ad-Hoc Data**: Prioritize cost (Serverless compute with auto-termination, Spot instances, scheduled nightly batch runs).

### Q97: Which metrics reveal a healthy data product?
* **30-Second Answer**:
  1. **Data Freshness / SLA Compliance**: Time elapsed since last successful commit.
  2. **Data Quality Score**: Percentage of rows passing DLT expectations ($> 99.9\%$).
  3. **Query Latency P95**: Time taken for user queries to return on Gold tables.
  4. **Cost-per-Query / DBU Consumption**: Normalized compute cost trend per business entity.

### Q98: Explain a design you rejected—and why.
* **30-Second Answer**: "I rejected a proposal to implement a 24/7 real-time streaming pipeline into our reporting Gold warehouse. While the business requested 'real-time sales', our audit revealed that store registers uploaded batch transactions only once every 4 hours, and store managers only reviewed dashboards at 8 AM. Running a 24/7 streaming cluster would have cost $\$4,000/\text{month}$ in idle compute for zero business benefit. I implemented an hourly Auto Loader batch pipeline with `trigger(availableNow=True)`, saving $\$3,200/\text{month}$ while exceeding all business SLAs."

### Q99: Describe a performance fix and the evidence it worked.
* **30-Second Answer**: "Our daily reconciliation stage was failing with an Executor OOM (Exit 137) and taking 48 minutes due to severe data skew on a Sort-Merge Join where null customer IDs hashed into a single partition spilling $18\text{ GB}$ to disk. I filtered out nulls prior to the join, enabled AQE skew join splitting, and converted the dimension lookup into a Broadcast Hash Join. **Evidence**: Stage execution time dropped from 48 minutes to 3.5 minutes, disk spill fell from $18\text{ GB}$ to $0\text{ MB}$, and cluster costs dropped by $82\%$."

### Q100: What would you change if data volume grew tenfold?
* **30-Second Answer**:
  1. **Storage Layer**: Migrate remaining partitioned tables to **Delta Lake Liquid Clustering (`CLUSTER BY`)** and enable **Deletion Vectors**.
  2. **Compute Layer**: Transition to the native C++ **Photon engine** and configure **Serverless Autoscaling SQL Warehouses**.
  3. **Ingestion**: Ensure all file scanning uses **Auto Loader Notification Mode** (SQS/Event Grid) rather than directory listings.
  4. **Governance**: Enforce automated **Lakehouse Monitoring** to detect data drift and automate file compaction (`OPTIMIZE`) schedules.
