"""
Category 1: Extreme Data Skew & Key Imbalance (Problems 1 - 10)
"""

CAT1_PROBLEMS = [
    {
        "id": 1,
        "title": "The 'Null Key' Skew Trap in Inner and Left Joins",
        "category": "Data Skew & Key Imbalance",
        "level": "Beginner",
        "scenario": "A transactional lakehouse joins an incoming fact table of 200 million web events with a users dimension table. However, 30% of the incoming events are from unauthenticated guest users where `user_id` is NULL. During the shuffle phase of a SortMergeJoin, the stage reaches 199/200 tasks in 45 seconds, while the final task (Task 200) hangs for 35 minutes before failing with an executor timeout.",
        "symptom": "Spark UI shows 199 tasks completed with ~5MB shuffle read each, but 1 task processed 45GB shuffle read with massive Tungsten disk spill and eventual `ExecutorLostFailure (heartbeat timed out)`.",
        "root_cause": "Hash partitioning computes `Murmur3Hash(null) % numPartitions = 0` (or a single fixed partition ID). Consequently, all 60 million records with `user_id IS NULL` are routed to the exact same reducer task, overwhelming that single core.",
        "failing_code": """# Failing PySpark Code:
events_df = spark.read.parquet("s3://lake/events/") # 200M rows, 30% NULL user_id
users_df = spark.read.parquet("s3://lake/users/")

# Unsanitized Join on nullable foreign key
joined_df = events_df.join(users_df, on="user_id", how="left")
joined_df.write.format("delta").save("s3://lake/gold_events/")""",
        "solution_code": """# Production-Grade Solution: Filter / Salt NULL keys before Shuffle
from pyspark.sql import functions as F

# Strategy 1: If NULLs will NEVER match the dimension, split or pre-filter
valid_events = events_df.filter(F.col("user_id").isNotNull())
null_events = events_df.filter(F.col("user_id").isNull())

# Perform the join strictly on populated keys
joined_valid = valid_events.join(users_df, on="user_id", how="left")

# Union back with null events (adding NULL columns for users dimension)
for col_name in users_df.columns:
    if col_name != "user_id":
        null_events = null_events.withColumn(col_name, F.lit(None))

final_df = joined_valid.unionByName(null_events)

# Strategy 2: For Inner Joins, an explicit IS NOT NULL filter pushes down to scan:
# events_df.filter(F.col("user_id").isNotNull()).join(users_df, "user_id", "inner")""",
        "interview_takeaway": "In any distributed join, NULL foreign keys provide zero join matches but hash to a single partition; always filter them before the shuffle or assign random negative surrogate IDs to distribute them evenly across reducers."
    },
    {
        "id": 2,
        "title": "Default Placeholder Skew in GroupBy Aggregations",
        "category": "Data Skew & Key Imbalance",
        "level": "Beginner",
        "scenario": "A retail analytics pipeline aggregates transaction volumes by store country. Upstream legacy point-of-sale systems populate `'UNKNOWN'` or `'N/A'` whenever GPS lookup fails. Out of 500 million transactions, 350 million contain `country = 'UNKNOWN'`. A simple `groupBy('country').agg(sum('amount'))` crashes with OutOfMemoryError.",
        "symptom": "Stage progress hangs at 99%. Spark UI Executor page shows one executor's heap memory climbing steadily to 100% until YARN/Kubernetes terminates the container with `Exit code 137 (OOMKilled)`.",
        "root_cause": "Tungsten uses an in-memory hash map (`BytesToBytesMap`) for aggregation. For the single key `'UNKNOWN'`, the hash map cannot be flushed efficiently, causing massive memory pressure and CPU thrashing during hash table resizing.",
        "failing_code": """# Failing PySpark Code:
tx_df = spark.read.parquet("s3://retail/transactions/")
# 350M rows out of 500M have country = 'UNKNOWN'
summary_df = tx_df.groupBy("country").agg(
    F.count("*").alias("tx_count"),
    F.sum("amount").alias("total_revenue")
)
summary_df.write.mode("overwrite").parquet("s3://retail/country_summary/")""",
        "solution_code": """# Production-Grade Solution: Two-Phase Aggregation with Key Salting on Placeholder
from pyspark.sql import functions as F

# Salt only the skewed key with 50 random buckets; leave normal keys untouched
salted_df = tx_df.withColumn(
    "salted_country",
    F.when(
        F.col("country") == "UNKNOWN",
        F.concat(F.col("country"), F.lit("_"), F.floor(F.rand() * 50))
    ).otherwise(F.col("country"))
)

# Phase 1: Partial Aggregation on Salted Key (distributes the 350M rows across 50 reducers)
partial_agg = salted_df.groupBy("salted_country").agg(
    F.count("*").alias("partial_count"),
    F.sum("amount").alias("partial_revenue")
)

# Phase 2: Strip Salt and Final Aggregation
final_summary = partial_agg.withColumn(
    "country",
    F.regexp_replace(F.col("salted_country"), "_[0-9]+$", "")
).groupBy("country").agg(
    F.sum("partial_count").alias("tx_count"),
    F.sum("partial_revenue").alias("total_revenue")
)""",
        "interview_takeaway": "When high-cardinality placeholder values skew an aggregation, apply two-phase aggregation: salt the hot key with random integers, aggregate partially across reducers, strip the salt, and aggregate globally."
    },
    {
        "id": 3,
        "title": "Asymmetric Dimension Join Skew Failing SortMergeJoin",
        "category": "Data Skew & Key Imbalance",
        "level": "Intermediate",
        "scenario": "A media streaming platform joins 1 billion stream events with an artists dimension table containing 2 million rows. Five pop megastars account for 40% of all streams. The query uses default `SortMergeJoin`. The shuffle stage spills 180 GB to disk, and the sort phase runs for 2 hours.",
        "symptom": "Spark UI shows `Shuffle Spill (Disk)` of 180 GB. Tasks handling megastar `artist_id` partitions spend 95% of execution time in `ExternalSorter.spill()`.",
        "root_cause": "SortMergeJoin forces both sides to shuffle and sort by join key. For hot keys, sorting 400 million rows in a single partition exceeds executor memory, spilling unsorted Tungsten pages to disk and thrashing I/O.",
        "failing_code": """# Failing PySpark Code:
# artists_df is 250MB uncompressed (exceeds default autoBroadcastJoinThreshold of 10MB)
events_df = spark.read.table("lakehouse.streaming_events") # 1B rows
artists_df = spark.read.table("lakehouse.dim_artists")     # 2M rows (~250MB)

# Default SortMergeJoin triggered due to size > 10MB
result_df = events_df.join(artists_df, on="artist_id", how="inner")
result_df.write.format("delta").saveAsTable("lakehouse.fact_enriched_streams")""",
        "solution_code": """# Production-Grade Solution: Force BroadcastHashJoin or Increase Broadcast Threshold
from pyspark.sql import functions as F

# Option A: Explicit Broadcast Hint (eliminates shuffle and sort entirely)
# Executor memory is 8GB+, so broadcasting 250MB is safe and optimal
result_df = events_df.join(F.broadcast(artists_df), on="artist_id", how="inner")

# Option B: Dynamically increase broadcast threshold in Spark session:
# spark.conf.set("spark.sql.autoBroadcastJoinThreshold", 500 * 1024 * 1024) # 500MB

# Option C: In Spark SQL:
# SELECT /*+ BROADCAST(a) */ * FROM streaming_events e JOIN dim_artists a ON e.artist_id = a.artist_id""",
        "interview_takeaway": "Broadcast Hash Join completely avoids the shuffle and sort phases; whenever a skewed dimension table fits safely in driver and executor memory (up to a few GBs), broadcasting it bypasses data skew entirely."
    },
    {
        "id": 4,
        "title": "Adaptive Query Execution (AQE) Skew Join Threshold Tuning",
        "category": "Data Skew & Key Imbalance",
        "level": "Intermediate",
        "scenario": "A retail bank runs a daily reconciliation join between payments and ledger entries on Apache Spark 3.3. Despite `spark.sql.adaptive.enabled=true`, one partition with a corporate clearinghouse ID runs 10x slower than all other partitions. AQE fails to split the skewed partition.",
        "symptom": "In the Spark UI SQL tab, the SortMergeJoin operator does not show `(skew=true)`, and no partition splitting sub-tasks are created.",
        "root_cause": "AQE skew join detection requires a partition to be both larger than `skewedPartitionThresholdInBytes` (default 256MB) AND larger than `skewedPartitionFactor` (default 5.0) times the median partition size. If median partitions are 60MB, a 280MB skewed partition is only 4.6x the median, failing the 5.0x factor rule.",
        "failing_code": """# Failing Setup (Default Spark Conf):
# Median partition: 60MB. Skewed partition: 280MB (4.6x median, factor requires 5x)
# AQE treats this partition as normal, leaving 1 executor to process 280MB while others do 60MB.
spark.conf.set("spark.sql.adaptive.enabled", "true")
# Default: spark.sql.adaptive.skewJoin.skewedPartitionFactor = 5.0
# Default: spark.sql.adaptive.skewJoin.skewedPartitionThresholdInBytes = 256MB

ledger_df.join(payments_df, on="account_id").write.mode("overwrite").parquet("s3://bank/recon/")""",
        "solution_code": """# Production-Grade Solution: Lower AQE Skew Join Detection Thresholds
spark.conf.set("spark.sql.adaptive.enabled", "true")
spark.conf.set("spark.sql.adaptive.skewJoin.enabled", "true")

# Lower the factor from 5.0 to 2.5 or 3.0 so moderate skews are intercepted
spark.conf.set("spark.sql.adaptive.skewJoin.skewedPartitionFactor", "2.5")

# Lower threshold to 128MB or 64MB depending on executor core count
spark.conf.set("spark.sql.adaptive.skewJoin.skewedPartitionThresholdInBytes", "67108864") # 64MB

# Verify in execution plan: SortMergeJoin will now display SortMergeJoin(skew=true)
# and Spark will dynamically split the 280MB partition into 4-5 parallel reader tasks.""",
        "interview_takeaway": "AQE skew join optimization uses dual criteria (absolute size and factor over median); in workloads with high-variance partitions, lower `skewedPartitionFactor` to 2.5-3.0 and `skewedPartitionThresholdInBytes` to 64MB so Spark automatically splits stragglers."
    },
    {
        "id": 5,
        "title": "Two-Phase Key Salting for Massive Non-Broadcastable Joins",
        "category": "Data Skew & Key Imbalance",
        "level": "Intermediate",
        "scenario": "A telecom operator joins two 500GB tables: call data records (CDR) and cell tower telemetry. A primary antenna in Manhattan handles 15% of all calls (75GB). Both tables are too large to broadcast. AQE cannot completely balance the load because the skewed key exceeds memory limits. The join crashes with `FetchFailedException`.",
        "symptom": "Stage fails repeatedly with `FetchFailedException: Connection reset by peer` as executors hosting the Manhattan cell tower become unresponsive under memory pressure.",
        "root_cause": "When both sides of a skewed join are massive (hundreds of GBs), neither can be broadcast. Hash partitioning maps the hot key to a single reducer on both tables.",
        "failing_code": """# Failing PySpark Code:
# Neither table can be broadcast (both 500GB+)
cdrs = spark.read.table("lake.cdrs")       # tower_id 'T-NYC-001' has 150M rows
telemetry = spark.read.table("lake.telemetry") # tower_id 'T-NYC-001' has 80M rows

joined = cdrs.join(telemetry, on="tower_id", how="inner")
joined.write.format("delta").save("s3://lake/enriched_cdrs/")""",
        "solution_code": """# Production-Grade Solution: Isolated Salting of the Skewed Key
from pyspark.sql import functions as F

SALT_FACTOR = 32 # Spread hot key across 32 buckets

# 1. Salt the large skewed fact table with a random integer [0, SALT_FACTOR-1]
cdrs_salted = cdrs.withColumn(
    "salt",
    F.when(F.col("tower_id") == "T-NYC-001", F.floor(F.rand() * SALT_FACTOR)).otherwise(F.lit(0))
).withColumn("join_key", F.concat(F.col("tower_id"), F.lit("_"), F.col("salt")))

# 2. Replicate the dimension/telemetry records for the hot key across all salt values using explode
salt_array = F.array([F.lit(i) for i in range(SALT_FACTOR)])

telemetry_replicated = telemetry.withColumn(
    "salt",
    F.when(F.col("tower_id") == "T-NYC-001", F.explode(salt_array)).otherwise(F.lit(0))
).withColumn("join_key", F.concat(F.col("tower_id"), F.lit("_"), F.col("salt")))

# 3. Join on the salted composite key; drops hot-key partition size from 75GB to ~2.3GB!
joined_salted = cdrs_salted.join(telemetry_replicated, on="join_key", how="inner") \\
    .drop("join_key", "salt")""",
        "interview_takeaway": "When both sides of a join are too large to broadcast and have a known skewed key, salt the fact table with a random integer and explode the second table across all salt values to parallelize the join across $N$ partitions."
    },
    {
        "id": 6,
        "title": "Explode-Induced Skew from Super-Entity Nested Arrays",
        "category": "Data Skew & Key Imbalance",
        "level": "Advanced",
        "scenario": "A B2B SaaS platform processes company invoice documents. While 99% of companies have 10-50 line items per invoice, 3 global enterprise conglomerates have invoices containing 600,000 line items. Running `F.explode('line_items')` causes the executor handling those 3 records to crash with `java.lang.OutOfMemoryError: Java heap space`.",
        "symptom": "Spark task begins normally, then CPU stalls and garbage collection time exceeds 85% of task run time before crashing with Heap OOM.",
        "root_cause": "`explode()` flattens arrays into individual rows within the same partition before writing. 600,000 complex struct objects instantiated in a single JVM thread create hundreds of millions of ephemeral Java objects, saturating Young and Old generation heap spaces.",
        "failing_code": """# Failing PySpark Code:
invoices_df = spark.read.json("s3://saas/invoices/") # 10M records
# Mega accounts have arrays with 600,000 line item structs
exploded_df = invoices_df.withColumn("item", F.explode("line_items")) \\
    .select("company_id", "invoice_id", "item.item_id", "item.amount")

exploded_df.write.format("delta").save("s3://saas/line_items/")""",
        "solution_code": """# Production-Grade Solution: Split Mega-Arrays or Batch Using PySpark Higher-Order Functions
from pyspark.sql import functions as F

# Strategy 1: If calculating summaries (e.g. total amount), use higher-order functions WITHOUT exploding:
summary_df = invoices_df.withColumn(
    "total_invoice_amount",
    F.expr("aggregate(line_items, 0.0D, (acc, x) -> acc + x.amount)")
)

# Strategy 2: If explode is mandatory, repartition before explode on (company_id, invoice_id)
# or chunk mega arrays using slice() before exploding:
array_len = F.size("line_items")
chunked_df = invoices_df.withColumn(
    "chunks",
    F.when(array_len > 10000,
           F.transform(F.sequence(F.lit(1), array_len, F.lit(10000)),
                       lambda start: F.slice(F.col("line_items"), start, 10000)))
     .otherwise(F.array(F.col("line_items")))
).withColumn("chunk", F.explode("chunks")) \\
 .withColumn("item", F.explode("chunk")) \\
 .repartition(2000, "company_id")""",
        "interview_takeaway": "Exploding multi-hundred-thousand element arrays creates JVM object allocation storms; replace naive `explode()` with higher-order functions (`aggregate`, `transform`) or chunk arrays into smaller batches before flattening."
    },
    {
        "id": 7,
        "title": "Window Function Skew with Unbounded Preceding Windows",
        "category": "Data Skew & Key Imbalance",
        "level": "Advanced",
        "scenario": "A fintech ledger calculates the cumulative running balance for all bank accounts using `SUM(amount) OVER (PARTITION BY account_id ORDER BY tx_timestamp ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)`. One central settlement account has 40 million transactions, while standard accounts have ~200. The stage running the window function spills 90 GB to disk and runs for 4 hours.",
        "symptom": "Spark UI shows 199 tasks completed in 2 minutes, while 1 task takes 4 hours, reading 40M rows in a single window frame with massive disk spill.",
        "root_cause": "A Window specification with `PARTITION BY account_id` forces all rows for a given account to be colocated on a single executor core in sorted order. Tungsten's `WindowExec` cannot distribute rows sharing the same partition key across multiple executors.",
        "failing_code": """# Failing PySpark Code:
from pyspark.sql.window import Window

tx_df = spark.read.table("lakehouse.bank_transactions")
window_spec = Window.partitionBy("account_id").orderBy("tx_timestamp") \\
    .rowsBetween(Window.unboundedPreceding, Window.currentRow)

running_df = tx_df.withColumn("running_balance", F.sum("amount").over(window_spec))
running_df.write.format("delta").saveAsTable("lakehouse.account_balances")""",
        "solution_code": """# Production-Grade Solution: Day-Level Pre-Aggregation & Rollup Prefix Sum
from pyspark.sql.window import Window
from pyspark.sql import functions as F

# Step 1: Calculate daily balances per account (drastically reduces rows for settlement account)
daily_balances = tx_df.groupBy("account_id", F.to_date("tx_timestamp").alias("tx_date")) \\
    .agg(F.sum("amount").alias("daily_total"))

# Step 2: Compute running balance of daily totals (compact data volume)
daily_window = Window.partitionBy("account_id").orderBy("tx_date") \\
    .rowsBetween(Window.unboundedPreceding, Window.currentRow)

daily_cumulative = daily_balances.withColumn("day_start_balance", F.sum("daily_total").over(daily_window) - F.col("daily_total"))

# Step 3: Compute intraday running balance partitioned by BOTH (account_id, tx_date)
intraday_window = Window.partitionBy("account_id", F.to_date("tx_timestamp")).orderBy("tx_timestamp") \\
    .rowsBetween(Window.unboundedPreceding, Window.currentRow)

final_df = tx_df.withColumn("tx_date", F.to_date("tx_timestamp")) \\
    .withColumn("intraday_running", F.sum("amount").over(intraday_window)) \\
    .join(daily_cumulative.select("account_id", "tx_date", "day_start_balance"), on=["account_id", "tx_date"]) \\
    .withColumn("running_balance", F.col("day_start_balance") + F.col("intraday_running"))""",
        "interview_takeaway": "When window functions partition by a skewed key, you cannot partition across workers directly; break the problem into a two-level prefix sum: pre-aggregate into coarse time buckets (e.g. daily) and compute intraday windows partitioned by (account_id, date)."
    },
    {
        "id": 8,
        "title": "Uneven S3/ADLS Object Sizes & Non-Splittable Gzip Stragglers",
        "category": "Data Skew & Key Imbalance",
        "level": "Advanced",
        "scenario": "A daily log ingestion job reads 5,000 files from cloud object storage. 4,999 files are 2MB each, but 1 file is an uncompressed or standard `.csv.gz` file of 42GB created by an upstream database dump. Reading the dataset generates 5,000 tasks, but task 5000 runs for 2.5 hours on a single executor while the cluster sits idle.",
        "symptom": "Spark cluster utilization drops to 2% (1 core active out of 100 cores), reading from a single massive `.csv.gz` object.",
        "root_cause": "Standard Gzip is non-splittable because it uses DEFLATE without sync markers. Spark cannot parallelize the read of a single `.gz` file across multiple tasks. Consequently, 1 core must sequentially decompress and parse all 42GB.",
        "failing_code": """# Failing PySpark Code:
# The bucket contains 4,999 small files and one 42GB file: 'dump_full_raw.csv.gz'
df = spark.read.option("header", "true").csv("s3://raw-logs/2024-10-01/*.csv.gz")
df.write.format("delta").save("s3://bronze/logs/")""",
        "solution_code": """# Production-Grade Solution: Pre-split Non-Splittable Archives or Enforce Splittable Formats
# 1. Enforce splittable compression (bzip2, snappy, zstd) or Parquet upstream.
# 2. If stuck with existing monolithic .csv.gz, isolate the large file with a dedicated node
# or convert via shell streaming into chunked files:
# zcat dump_full_raw.csv.gz | split -l 1000000 - chunk_

# 3. For splittable files (uncompressed, Parquet, Bzip2), tune maxPartitionBytes:
spark.conf.set("spark.sql.files.maxPartitionBytes", "134217728") # 128MB per partition
spark.conf.set("spark.sql.files.openCostInBytes", "4194304")      # 4MB packing cost

# Read splittable files: Spark will automatically carve 42GB into ~336 parallel tasks
df_splittable = spark.read.parquet("s3://raw-logs/2024-10-01/*.parquet")""",
        "interview_takeaway": "Standard Gzip (`.gz`) is fundamentally non-splittable in Hadoop/Spark; single giant gzip files bottleneck execution to a single core regardless of cluster size. Require splittable codecs (Bzip2, Snappy, Zstandard) or Parquet/ORC at ingestion boundaries."
    },
    {
        "id": 9,
        "title": "Stateful Structured Streaming Session Skew Ballooning State Store",
        "category": "Data Skew & Key Imbalance",
        "level": "Architect",
        "scenario": "A cybersecurity lakehouse processes IoT events using `flatMapGroupsWithState` to detect anomalous device sessions. A compromised router infected with malware emits 20,000 heartbeat packets per second, while regular devices emit 1 every 5 minutes. Within 4 hours, the streaming query latency spikes from 3 seconds to 12 minutes, and the executor hosting the malware state crashes with `StateStoreProvider OOM`.",
        "symptom": "Streaming query micro-batch processing time climbs continuously. Spark UI Structured Streaming tab shows watermark progressing but state store memory on one executor growing to 15GB+.",
        "root_cause": "The default HDFS/Memory StateStore keeps state in JVM heap. The hot key accumulates hundreds of thousands of state transitions in memory. Furthermore, hash partitioning sends all updates for that compromised device to one executor state partition.",
        "failing_code": """# Failing PySpark Code:
# Default in-memory state store
spark.conf.set("spark.sql.streaming.stateStore.providerClass",
               "org.apache.spark.sql.execution.streaming.state.HDFSBackedStateStoreProvider")

stream_df = spark.readStream.format("kafka").load() \\
    .selectExpr("CAST(key AS STRING) as device_id", "CAST(value AS STRING) as payload", "timestamp")

# Stateful mapping without state limits
def update_session(key, values, state):
    current = state.getOption() or []
    for v in values:
        current.append(v) # Unbounded accumulation for infected router
    state.update(current)
    return [Row(device_id=key, event_count=len(current))]""",
        "solution_code": """# Production-Grade Solution: RocksDB Off-Heap StateStore + Event Throttling & Watermarking
# 1. Switch to RocksDB State Store (stores state off-heap on local SSDs, preventing JVM heap OOM)
spark.conf.set(
    "spark.sql.streaming.stateStore.providerClass",
    "org.apache.spark.sql.execution.streaming.state.RocksDBStateStoreProvider"
)

# 2. Implement strict TTL and bounded state history in state function
from pyspark.sql.streaming import GroupStateTimeout

def update_session_bounded(key, values, state):
    if state.hasTimedOut:
        state.remove()
        return []
    
    current_count = state.getOption() or 0
    new_events = list(values)
    
    # Cap maximum accumulated state to prevent bot poison pills
    if current_count > 10000:
        # Flag alert and evict or drop
        state.setTimeoutDuration("1 hour")
        return [Row(device_id=key, status="ABUSE_THROTTLED")]
        
    state.update(current_count + len(new_events))
    state.setTimeoutDuration("30 minutes")
    return [Row(device_id=key, status="OK")]""",
        "interview_takeaway": "For stateful Spark streaming on skewed real-time streams, always switch from the default in-memory HDFS state store to the off-heap RocksDB state store and enforce strict per-key state bounding and timeouts."
    },
    {
        "id": 10,
        "title": "Skewed Ingestion in Delta Lake: Directory Partitioning vs Liquid Clustering",
        "category": "Data Skew & Key Imbalance",
        "level": "Architect",
        "scenario": "An ad-tech platform stores 50TB of clickstream data partitioned physically by `PARTITIONED BY (advertiser_id, date)`. Top advertisers (Google, Amazon) have billions of clicks generating 100,000 files per date folder, while long-tail advertisers generate 1KB files. Query performance collapses due to the small file problem for small advertisers and massive file scanning for large advertisers.",
        "symptom": "Metadata queries against the Delta transaction log take 4 minutes just to list partitions (`AnalysisException: Path does not exist / slow metastore`). Queries on small advertisers spend 99% of time in file open overhead.",
        "root_cause": "Hive-style directory partitioning on high-cardinality or skewed columns creates rigid directory trees. It leads to the 'small files problem' for low-volume keys and 'giant skewed partitions' for high-volume keys.",
        "failing_code": """-- Failing Delta DDL:
CREATE TABLE clickstream_events (
    click_id STRING,
    advertiser_id STRING,
    event_timestamp TIMESTAMP,
    bid_amount DECIMAL(10,2)
) USING DELTA
PARTITIONED BY (advertiser_id, date(event_timestamp));
-- Results in 500,000 directory paths in cloud storage!""",
        "solution_code": """-- Production-Grade Solution: Delta Lake 3.x Liquid Clustering
-- Liquid clustering avoids physical folder partitioning entirely.
-- It dynamically clusters data using Hilbert curves without partition rigidity.

CREATE TABLE clickstream_events (
    click_id STRING,
    advertiser_id STRING,
    event_timestamp TIMESTAMP,
    bid_amount DECIMAL(10,2)
) USING DELTA
CLUSTER BY (advertiser_id, event_timestamp);

-- Regular automated or scheduled maintenance:
OPTIMIZE clickstream_events;
-- Liquid clustering automatically balances skewed advertiser data across uniform 128MB-1GB files
-- and rewrites only the necessary cluster boundaries without locking entire partition trees.""",
        "interview_takeaway": "Never physically partition Delta tables by high-cardinality or skewed columns; adopt Delta Lake Liquid Clustering (`CLUSTER BY`), which dynamically groups data without directory proliferation and adapts to skew."
    }
]
