"""
Category 5: Duplicate Records, CDC & Out-of-Order Updates (Problems 41 - 50)
"""

CAT5_PROBLEMS = [
    {
        "id": 41,
        "title": "dropDuplicates vs distinct Semantic Differences across Key Subsets",
        "category": "Duplicates & CDC",
        "level": "Beginner",
        "scenario": "A marketing pipeline deduplicates customer signups. The engineer runs `df.distinct()`, but the final table still contains multiple signups for the same email address because the `signup_timestamp` column differs across rows. The customer receives duplicate welcome emails.",
        "symptom": "Duplicate records persist in production even after calling `distinct()`.",
        "root_cause": "`distinct()` computes uniqueness across ALL columns in the DataFrame row. If any column (e.g. timestamp, click_id) varies, the rows are considered distinct. Deduplication on a business key requires `dropDuplicates(['email'])`.",
        "failing_code": """# Failing PySpark Code:
# Customer signed up twice with different timestamps:
# Row 1: email="alice@test.com", ts="2024-01-01 10:00:00"
# Row 2: email="alice@test.com", ts="2024-01-01 10:05:00"

df = spark.read.table("raw_signups")
deduped_df = df.distinct() # Does NOT deduplicate by email! Both rows kept!""",
        "solution_code": """# Production-Grade Solution: Use dropDuplicates with Explicit Key Subsets
from pyspark.sql import functions as F

# Option A: Quick deduplication keeping an arbitrary row:
deduped_df = df.dropDuplicates(["email"])

# Option B: Deterministic deduplication keeping the EARLIEST or LATEST timestamp:
from pyspark.sql.window import Window
w = Window.partitionBy("email").orderBy(F.col("signup_timestamp").asc())

deterministic_deduped = df.withColumn("row_num", F.row_number().over(w)) \\
    .filter(F.col("row_num") == 1) \\
    .drop("row_num")""",
        "interview_takeaway": "`distinct()` operates across all columns in a row; use `dropDuplicates(['business_key'])` for subset deduplication, and prefer `row_number()` over an explicit timestamp window for deterministic retention."
    },
    {
        "id": 42,
        "title": "Many-to-Many Join Multiplying Row Counts and Corrupting Metrics",
        "category": "Duplicates & CDC",
        "level": "Beginner",
        "scenario": "An order analytics query joins an `orders` fact table (10 million rows, $50M revenue) with a `promotions` table on `promo_code`. Due to an upstream bug, `promotions` contains duplicate rows for promo code `'SUMMER20'`. After the join, the reported revenue doubles to $100M.",
        "symptom": "Fact table row count expands unexpectedly after a join, inflating financial and operational metrics.",
        "root_cause": "If the join key is not unique on the dimension side, an equi-join generates a Cartesian product for matching keys ($M \\times N$ rows), multiplying fact table rows.",
        "failing_code": """# Failing PySpark Code:
orders = spark.read.table("fact_orders")     # 10M rows, total revenue $50M
promos = spark.read.table("dim_promotions") # Contains duplicate 'SUMMER20' promo codes!

# Non-unique dimension causes join explosion:
enriched = orders.join(promos, on="promo_code", how="inner")
# enriched now has 18M rows and $100M revenue!""",
        "solution_code": """# Production-Grade Solution: Deduplicate Dimension and Validate Cardinality Pre-Join
# Step 1: Enforce uniqueness on the dimension side before joining:
unique_promos = promos.dropDuplicates(["promo_code"])

# Step 2: Perform the join safely
enriched = orders.join(unique_promos, on="promo_code", how="inner")

# Step 3: Production Invariant Check: Verify row count did not expand:
# assert enriched.count() <= orders.count(), "DATA INTEGRITY ERROR: Join expanded fact row count!" """,
        "interview_takeaway": "Non-unique dimension tables trigger many-to-many join explosions; always enforce uniqueness on dimension keys via `dropDuplicates()` or validate 1:N cardinality prior to joining with fact tables."
    },
    {
        "id": 43,
        "title": "Deterministic Deduplication with Conflicting Timestamps using Windowing",
        "category": "Duplicates & CDC",
        "level": "Intermediate",
        "scenario": "An e-commerce order service emits order status updates (`CREATED`, `SHIPPED`, `DELIVERED`). Multiple updates arrive in a single batch with different timestamps for the same `order_id`. A simple `dropDuplicates(['order_id'])` arbitrarily retains an older `CREATED` status instead of `DELIVERED`.",
        "symptom": "Customers see orders reverted to `CREATED` or `PENDING` status in the gold data mart.",
        "root_cause": "`dropDuplicates(['order_id'])` is non-deterministic; Spark picks whatever row finishes first in the shuffle buffer, discarding newer updates.",
        "failing_code": """# Failing PySpark Code:
# Non-deterministic pick:
clean_orders = raw_orders.dropDuplicates(["order_id"])
# May pick CREATED (older) instead of DELIVERED (newer)!""",
        "solution_code": """# Production-Grade Solution: Deterministic Window Ranking
from pyspark.sql.window import Window
from pyspark.sql import functions as F

# Define window partitioned by business key and sorted by event timestamp descending
order_window = Window.partitionBy("order_id").orderBy(
    F.col("updated_at").desc(),
    F.col("ingestion_id").desc() # Tie-breaker
)

latest_orders = raw_orders \\
    .withColumn("rank", F.row_number().over(order_window)) \\
    .filter(F.col("rank") == 1) \\
    .drop("rank")

# Guaranteed to always preserve the latest state deterministically!""",
        "interview_takeaway": "`dropDuplicates()` provides no ordering guarantees; for CDC streams and state updates, always use `row_number() OVER (PARTITION BY key ORDER BY timestamp DESC)` with a secondary tie-breaker."
    },
    {
        "id": 44,
        "title": "Out-of-Order Kafka Offsets Overwriting Newer State in Delta Lake",
        "category": "Duplicates & CDC",
        "level": "Intermediate",
        "scenario": "A logistics tracking system streams driver GPS coordinates from Kafka into a Delta Lake table. Due to network retries, a driver update from 10:00 AM arrives at 10:15 AM, after the 10:10 AM update has already been merged. The 10:00 AM update overwrites the 10:10 AM update, showing the driver moving backwards in time.",
        "symptom": "Target table state regresses to stale historical values; latest records have older timestamps.",
        "root_cause": "A naive `MERGE INTO` statement with `WHEN MATCHED THEN UPDATE SET *` blindly updates the target row whenever the keys match, regardless of which record was created first.",
        "failing_code": """-- Failing Spark SQL Merge:
MERGE INTO silver.driver_status target
USING incoming_stream source
ON target.driver_id = source.driver_id
WHEN MATCHED THEN UPDATE SET * -- Blindly overwrites with older data!
WHEN NOT MATCHED THEN INSERT *;""",
        "solution_code": """-- Production-Grade Solution: Conditional MERGE with Timestamp Watermark Gate
MERGE INTO silver.driver_status target
USING incoming_stream source
ON target.driver_id = source.driver_id
WHEN MATCHED AND source.event_timestamp > target.event_timestamp THEN 
    UPDATE SET 
        target.latitude = source.latitude,
        target.longitude = source.longitude,
        target.event_timestamp = source.event_timestamp,
        target.updated_at = current_timestamp()
-- Out-of-order stale updates are ignored when target is already newer!
WHEN NOT MATCHED THEN INSERT *;""",
        "interview_takeaway": "Never execute unconditional `WHEN MATCHED THEN UPDATE SET *` in streaming CDC; always add a temporal gate `WHEN MATCHED AND source.event_time > target.event_time` to prevent stale updates from overwriting fresh state."
    },
    {
        "id": 45,
        "title": "Delta Lake MERGE INTO Multiple Source Rows Matched Error",
        "category": "Duplicates & CDC",
        "level": "Intermediate",
        "scenario": "A CDC batch updates a Delta table containing customer profiles. Within the incoming 15-minute micro-batch, a customer updated their address twice. When running `MERGE INTO`, Spark crashes with `DeltaAnalysisException: Cannot perform MERGE as multiple source rows matched and attempted to modify the same target row in the Delta table`.",
        "symptom": "Pipeline crashes with `DeltaAnalysisException: Cannot perform MERGE as multiple source rows matched`.",
        "root_cause": "The SQL standard mandates that a single target row can only be updated once during a MERGE transaction. If the source DataFrame contains duplicate primary keys, Delta Lake throws an exception to prevent ambiguous updates.",
        "failing_code": """# Failing PySpark Code:
# incoming_batch contains 2 rows for customer_id = 'CUST_1001'
delta_target.merge(
    incoming_batch.alias("s"),
    "t.customer_id = s.customer_id"
).whenMatchedUpdateAll().whenNotMatchedInsertAll().execute()
# Crashes with DeltaAnalysisException!""",
        "solution_code": """# Production-Grade Solution: In-Batch Source Deduplication Before Merge
from pyspark.sql.window import Window
from pyspark.sql import functions as F

# Deduplicate the incoming source batch so each customer_id appears exactly once
dedup_window = Window.partitionBy("customer_id").orderBy(F.col("cdc_timestamp").desc())

clean_source = incoming_batch \\
    .withColumn("row_num", F.row_number().over(dedup_window)) \\
    .filter(F.col("row_num") == 1) \\
    .drop("row_num")

# Now the merge is guaranteed to match at most one source row per target row:
delta_target.alias("t").merge(
    clean_source.alias("s"),
    "t.customer_id = s.customer_id"
).whenMatchedUpdateAll().whenNotMatchedInsertAll().execute()""",
        "interview_takeaway": "Delta Lake `MERGE INTO` requires target rows to match at most one source row; always deduplicate the source micro-batch using `row_number()` over the primary key before executing the merge."
    },
    {
        "id": 46,
        "title": "Idempotent Streaming Ingestion with dropDuplicates Within Watermark",
        "category": "Duplicates & CDC",
        "level": "Advanced",
        "scenario": "A payments platform processes credit card authorizations from an event broker that guarantees at-least-once delivery. Retried authorizations arrive 2-5 minutes after the original. Calling `dropDuplicates(['auth_id'])` in a stateful Structured Streaming job without a watermark causes the state store to grow infinitely until the cluster crashes after 14 days.",
        "symptom": "Streaming state store size climbs monotonically by 20GB daily; query restarts take 45 minutes; eventually fails with `Container killed by YARN for exceeding memory limits`.",
        "root_cause": "Without a watermark, Spark has no eviction policy for `dropDuplicates()`. It must retain every `auth_id` it has ever seen since the inception of the stream in memory forever.",
        "failing_code": """# Failing Streaming Code:
# Unbounded state store accumulation:
stream_df = spark.readStream.format("kafka").load() \\
    .select(F.from_json("value", auth_schema).alias("data")).select("data.*")

# State store retains all auth_ids forever!
deduped_stream = stream_df.dropDuplicates(["auth_id"])
deduped_stream.writeStream.format("delta").start("s3://lake/auths/")""",
        "solution_code": """# Production-Grade Solution: Watermark-Bounded Streaming Deduplication
# Define watermark and event-time based deduplication
stream_with_watermark = stream_df \\
    .withWatermark("auth_timestamp", "2 hours") \\
    .dropDuplicates(["auth_id", "auth_timestamp"])

# Spark will now evict auth_ids older than 2 hours from the RocksDB state store,
# bounding memory consumption to a predictable, flat footprint!

deduped_stream.writeStream \\
    .format("delta") \\
    .option("checkpointLocation", "s3://lake/checkpoints/auths/") \\
    .start("s3://lake/auths/")""",
        "interview_takeaway": "Stateful deduplication in Structured Streaming (`dropDuplicates`) requires an event-time watermark (`withWatermark`); otherwise, the state store retains keys indefinitely and inevitably crashes with an out-of-memory error."
    },
    {
        "id": 47,
        "title": "CDC Hard Delete Propagation via MERGE INTO with Debezium Op Flags",
        "category": "Duplicates & CDC",
        "level": "Advanced",
        "scenario": "A PostgreSQL database is replicated to a Delta Lake table via Debezium CDC and Kafka. When a user deletes their account in Postgres, Debezium emits a CDC tombstone record with `op = 'D'`. The standard `MERGE INTO` pipeline ignores the delete flag, leaving deleted user data in the silver table and violating data privacy regulations.",
        "symptom": "Deleted records in the operational database remain active in the analytics lakehouse indefinitely.",
        "root_cause": "Most CDC merge scripts only implement `WHEN MATCHED THEN UPDATE` and `WHEN NOT MATCHED THEN INSERT`. Propagating hard deletes requires handling `WHEN MATCHED AND source.op = 'D' THEN DELETE`.",
        "failing_code": """-- Failing Merge Pattern:
MERGE INTO silver.accounts target
USING cdc_stream source
ON target.account_id = source.account_id
WHEN MATCHED THEN UPDATE SET * -- Updates record with delete payload instead of deleting it!
WHEN NOT MATCHED THEN INSERT *;""",
        "solution_code": """-- Production-Grade Solution: Debezium CDC Merge with Hard Delete Support
MERGE INTO silver.accounts target
USING (
    -- Take latest state per account_id in micro-batch
    SELECT * FROM (
        SELECT *, ROW_NUMBER() OVER (PARTITION BY account_id ORDER BY cdc_timestamp DESC) as rn
        FROM cdc_micro_batch
    ) WHERE rn = 1
) source
ON target.account_id = source.account_id

-- 1. Hard Delete Handling:
WHEN MATCHED AND source.op = 'D' THEN DELETE

-- 2. Update Handling:
WHEN MATCHED AND source.op IN ('U', 'C') THEN UPDATE SET *

-- 3. Insert Handling:
WHEN NOT MATCHED AND source.op IN ('I', 'C') THEN INSERT *;""",
        "interview_takeaway": "Complete CDC synchronization requires three merge branches: `WHEN MATCHED AND op = 'D' THEN DELETE`, `WHEN MATCHED THEN UPDATE`, and `WHEN NOT MATCHED AND op != 'D' THEN INSERT`."
    },
    {
        "id": 48,
        "title": "In-Batch Deduplication for SCD Type 2 Ingestion Pipelines",
        "category": "Duplicates & CDC",
        "level": "Advanced",
        "scenario": "An SCD Type 2 dimensional pipeline tracks customer address changes. In a single daily batch, a customer moved twice: Address A -> Address B at 10 AM, and Address B -> Address C at 3 PM. A naive SCD2 merge only checks the existing target table, resulting in conflicting overlapping date ranges (`is_current = true` for both Address B and Address C).",
        "symptom": "Downstream dimension lookups return multiple active rows for the same entity (`WHERE is_current = TRUE` returns 2 rows).",
        "root_cause": "Standard SCD Type 2 merge patterns compare incoming rows against the target table. When multiple state changes occur for the same entity within a single incoming batch, they must first be sequenced and chained in-batch before merging into target.",
        "failing_code": """# Failing PySpark Code:
# Both transitions arrive in the same batch:
# (cust_1, Addr_B, 10:00) and (cust_1, Addr_C, 15:00)
# Running naive SCD2 merge treats both as current or fails date boundaries!""",
        "solution_code": """# Production-Grade Solution: In-Batch Window Chaining Before Target Merge
from pyspark.sql.window import Window
from pyspark.sql import functions as F

batch_window = Window.partitionBy("customer_id").orderBy("change_timestamp")

# Step 1: Sequence changes within the batch and set end_date to lead timestamp
staged_batch = incoming_batch.withColumn(
    "next_timestamp", F.lead("change_timestamp").over(batch_window)
).withColumn(
    "end_timestamp",
    F.coalesce(F.col("next_timestamp"), F.to_timestamp(F.lit("9999-12-31 23:59:59")))
).withColumn(
    "is_current",
    F.when(F.col("next_timestamp").isNull(), F.lit(True)).otherwise(F.lit(False))
)

# Step 2: Now each record in the batch has non-overlapping, contiguous validity intervals!
# Step 3: Close existing current records in target table, then insert staged_batch.""",
        "interview_takeaway": "When building SCD Type 2 pipelines, always use `LEAD()` window functions to chain multiple state transitions within the incoming batch before merging against the target table to ensure non-overlapping validity intervals."
    },
    {
        "id": 49,
        "title": "High-Throughput CDC Upsert with Delta Deletion Vectors",
        "category": "Duplicates & CDC",
        "level": "Architect",
        "scenario": "A 50TB Delta table ingests 5,000 upserts per minute. Each `MERGE INTO` statement modifies ~200 rows scattered across 200 different 500MB Parquet files. Because Delta traditionally rewrites entire Parquet files on update, the system writes 100GB of Parquet files every minute to update 200KB of data, causing massive write amplification and transaction conflicts.",
        "symptom": "Storage write I/O is 500,000x larger than incoming payload size; jobs abort with `ConcurrentModificationException`.",
        "root_cause": "Prior to Deletion Vectors, Delta Lake used copy-on-write (COW): updating a single row in a Parquet file required reading the entire file, writing a new file with the update, and soft-deleting the old file.",
        "failing_code": """-- Failing Performance Configuration (Default Delta Lake Copy-on-Write):
-- Modifying 10 rows in a 1GB file rewrites the full 1GB file!
MERGE INTO gold.orders t
USING micro_batch s ON t.order_id = s.order_id
WHEN MATCHED THEN UPDATE SET *;""",
        "solution_code": """-- Production-Grade Solution: Enable Deletion Vectors in Delta Lake 3.x
-- Step 1: Enable Deletion Vectors on target table:
ALTER TABLE gold.orders SET TBLPROPERTIES ('delta.enableDeletionVectors' = 'true');

-- How it works:
-- When a row is updated/deleted, Delta writes a tiny Roaring Bitmap (Deletion Vector)
-- indicating which row ordinals are deleted, without rewriting the 500MB Parquet file!
-- Write amplification drops from 100GB/min to < 10MB/min!

-- Step 2: Periodically purge and materialize Deletion Vectors during low-traffic maintenance:
OPTIMIZE gold.orders; -- Compacts Deletion Vectors into clean Parquet files""",
        "interview_takeaway": "Enable Delta Lake Deletion Vectors (`delta.enableDeletionVectors = true`) for high-frequency CDC workloads to eliminate copy-on-write amplification; updates and deletes write tiny Roaring Bitmaps instead of rewriting massive Parquet files."
    },
    {
        "id": 50,
        "title": "End-to-End Exactly-Once Guarantees Across Streaming, Delta, and External Sinks",
        "category": "Duplicates & CDC",
        "level": "Architect",
        "scenario": "A payments ledger processes real-time transfers from Kafka and writes to both a Delta Lake silver table and an external PostgreSQL relational database. If a worker node crashes midway through a micro-batch, the pipeline retries. While Delta Lake is idempotent via its transaction log, PostgreSQL receives duplicate insert statements, crediting user balances twice.",
        "symptom": "PostgreSQL relational sink contains duplicate financial transactions while Delta Lake table remains clean.",
        "root_cause": "Structured Streaming guarantees end-to-end exactly-once ONLY if the target sink supports idempotent or transactional writes. Relational databases using standard `INSERT` without unique constraint upsert (`ON CONFLICT DO NOTHING`) suffer duplicate writes on micro-batch retries.",
        "failing_code": """# Failing Streaming foreachBatch Pattern:
def write_dual_sinks(batch_df, batch_id):
    # Delta sink is transactional and idempotent:
    batch_df.write.format("delta").mode("append").saveAsTable("silver.ledger")
    
    # Non-idempotent relational write! If this fails or crashes later, retrying batch_id writes duplicates!
    batch_df.write.format("jdbc") \\
        .option("url", "jdbc:postgresql://db:5432/bank") \\
        .option("dbtable", "ledger") \\
        .mode("append") \\ # Appends duplicate rows on retry!
        .save()""",
        "solution_code": """# Production-Grade Solution: Idempotent Relational Write via Batch ID Tracking or Upsert
def write_dual_sinks_idempotent(batch_df, batch_id):
    # 1. Delta Sink (ACID Idempotent)
    batch_df.write.format("delta").mode("append").saveAsTable("silver.ledger")
    
    # 2. Relational Sink: Use Upsert / ON CONFLICT or Staging Table with Batch ID Transaction
    # In PostgreSQL, write to staging table and commit atomically:
    properties = {"user": "admin", "password": "secret", "driver": "org.postgresql.Driver"}
    
    # Write to a temporary batch-specific staging table:
    staging_table = f"staging_ledger_{batch_id}"
    batch_df.write.jdbc(url="jdbc:postgresql://db:5432/bank", table=staging_table, mode="overwrite", properties=properties)
    
    # Atomically upsert from staging to target table using single SQL transaction:
    upsert_sql = f\"\"\"
        INSERT INTO ledger (tx_id, user_id, amount, tx_time)
        SELECT tx_id, user_id, amount, tx_time FROM {staging_table}
        ON CONFLICT (tx_id) DO NOTHING;
        DROP TABLE {staging_table};
    \"\"\"
    # Execute upsert_sql via direct JDBC connection""",
        "interview_takeaway": "Spark Structured Streaming provides at-least-once execution; true end-to-end exactly-once semantics requires an idempotent target sink using transactional batch IDs or `ON CONFLICT DO NOTHING` upsert logic."
    }
]
