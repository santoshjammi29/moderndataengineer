"""
Category 7: Timestamp, Timezone & Late-Arriving Event Data (Problems 61 - 70)
"""

CAT7_PROBLEMS = [
    {
        "id": 61,
        "title": "current_timestamp vs current_date Timezone Mismatch with Cluster UTC",
        "category": "Timestamps & Late Data",
        "level": "Beginner",
        "scenario": "A retail bank in New York runs an end-of-day batch at 8:00 PM EST (01:00 AM UTC next day). The query filters transactions using `WHERE tx_date = current_date()`. Because the cloud Spark cluster runs in UTC, `current_date()` resolves to tomorrow's date, causing the batch to return 0 transactions and report an empty ledger.",
        "symptom": "End-of-day batch jobs run at night return zero records despite active transaction flow.",
        "root_cause": "`current_date()` and `current_timestamp()` evaluate against the Spark session's configured timezone (`spark.sql.session.timeZone`, which defaults to the JVM host timezone or UTC in cloud environments).",
        "failing_code": """-- Failing Spark SQL:
-- Cluster runs in UTC. At 8:00 PM EST on 2024-10-31, current_date() is 2024-11-01 (UTC)!
SELECT *
FROM transactions
WHERE tx_date = current_date(); -- Returns 0 rows!""",
        "solution_code": """-- Production-Grade Solution: Explicit Session Timezone or from_utc_timestamp
-- Option A: Set Spark session timezone explicitly to business timezone
-- In PySpark:
spark.conf.set("spark.sql.session.timeZone", "America/New_York")

-- Option B: In Spark SQL using conversion functions:
SELECT *
FROM transactions
WHERE tx_date = to_date(from_utc_timestamp(current_timestamp(), 'America/New_York'));

-- Best Practice: Always store UTC in lakehouse tables, and project local dates via explicit business calendars.""",
        "interview_takeaway": "`current_date()` resolves to the cluster JVM timezone (typically UTC); always configure `spark.sql.session.timeZone` or use `from_utc_timestamp()` to align date boundaries with operational business hours."
    },
    {
        "id": 62,
        "title": "String-to-Timestamp Parsing Failures on Ambiguous Formats",
        "category": "Timestamps & Late Data",
        "level": "Beginner",
        "scenario": "A multinational airline merges flight logs from European (`dd/MM/yyyy`) and US (`MM/dd/yyyy`) reservation systems. When passing ambiguous strings like `'04/05/2024'` to `to_timestamp()`, Spark parses it as April 5th for all flights. For May 4th flights, timestamps are corrupted by a month.",
        "symptom": "Dates like `'15/04/2024'` throw parse exceptions or return NULL in Spark 3.x, while dates below 12 silently swap days and months.",
        "root_cause": "Spark 3.0+ uses Java 8 DateTimeFormatter with strict pattern matching. If no format string is provided or if format varies across sources, `to_timestamp()` either fails or misinterprets month/day ordinals.",
        "failing_code": """# Failing PySpark Code:
# '04/05/2024' (May 4 in UK) parsed with US format
df = spark.createDataFrame([("04/05/2024",), ("15/04/2024",)], ["raw_date"])
# Fails or corrupts:
parsed = df.withColumn("ts", F.to_timestamp("raw_date", "MM/dd/yyyy"))
# '15/04/2024' becomes NULL because month cannot be 15!""",
        "solution_code": """# Production-Grade Solution: Coalesced Multi-Pattern Parsing
from pyspark.sql import functions as F

# Try primary format, fallback to secondary format, capture failure in audit
df_parsed = df.withColumn(
    "clean_timestamp",
    F.coalesce(
        F.to_timestamp(F.col("raw_date"), "yyyy-MM-dd HH:mm:ss"),
        F.to_timestamp(F.col("raw_date"), "dd/MM/yyyy"),
        F.to_timestamp(F.col("raw_date"), "MM/dd/yyyy")
    )
)

# For disambiguation when formats conflict, require source_system tag:
# F.when(F.col("region") == "EU", F.to_timestamp(F.col("raw_date"), "dd/MM/yyyy"))
#  .otherwise(F.to_timestamp(F.col("raw_date"), "MM/dd/yyyy"))""",
        "interview_takeaway": "Never assume date string uniformity across heterogeneous sources; use `coalesce()` with multiple explicit `to_timestamp()` format patterns or condition parsing on source-system regional metadata."
    },
    {
        "id": 63,
        "title": "Daylight Savings Time (DST) Transitions Breaking Fixed Hourly Partitions",
        "category": "Timestamps & Late Data",
        "level": "Intermediate",
        "scenario": "An electric utility pipeline calculates hourly power consumption by bucketing timestamps with `date_trunc('hour', local_time)`. On the November DST fallback day, the 1:00 AM - 2:00 AM hour occurs twice, combining two distinct hours of power consumption into a single bucket and showing an impossible 200% power spike.",
        "symptom": "Power grid analytics report duplicate readings and phantom spikes during autumn DST fallback, and missing hours during spring DST spring-forward.",
        "root_cause": "Local wall-clock time is non-monotonic: it repeats an hour in autumn (25-hour day) and skips an hour in spring (23-hour day). Bucketing on local wall-clock hours creates non-unique chronological buckets.",
        "failing_code": """-- Failing Spark SQL:
-- Bucketing on wall-clock local time subject to DST:
SELECT 
    date_trunc('hour', local_timestamp) AS hour_bucket,
    meter_id,
    SUM(kwh) AS total_kwh
FROM smart_meters
GROUP BY 1, 2; -- Duplicates 01:00 AM on DST fallback!""",
        "solution_code": """-- Production-Grade Solution: Bucket on Monotonic UTC Epoch Seconds
-- Always truncate and group on UTC timestamps:
SELECT 
    date_trunc('hour', utc_timestamp) AS utc_hour_bucket,
    meter_id,
    SUM(kwh) AS total_kwh,
    -- Project local representation strictly for display:
    from_utc_timestamp(date_trunc('hour', utc_timestamp), 'America/New_York') AS local_hour_display
FROM smart_meters
GROUP BY 1, 2, 4;

-- Guaranteed exactly 24 contiguous, non-overlapping hourly buckets every single day!""",
        "interview_takeaway": "Local wall-clock time is discontinuous due to Daylight Savings Time; always perform timeseries aggregation, windowing, and partitioning on monotonic UTC timestamps and convert to local time only at presentation."
    },
    {
        "id": 64,
        "title": "TimestampNTZ (No Time Zone) vs TimestampType in Spark 3.4+",
        "category": "Timestamps & Late Data",
        "level": "Intermediate",
        "scenario": "A distributed team operates across London, New York, and Bangalore. A Parquet dataset stores flight departure times as `TimestampType`. When an engineer in London writes `'2024-06-01 12:00:00'`, an engineer in New York reading the same Parquet table sees `'2024-06-01 07:00:00'`, causing schedule reconciliation chaos.",
        "symptom": "Timestamps shift by 5 hours depending on who is querying the table or which cluster runs the job.",
        "root_cause": "Standard `TimestampType` in Spark represents an instant in time and is automatically converted to/from session local timezone upon reading and display. If local flight departure time was meant to represent local wall-clock time without timezone offset, `TimestampType` causes unintended shifts.",
        "failing_code": """# Failing PySpark Code:
# Storing flight local departures using standard TimestampType:
df = spark.createDataFrame([("Flight 101", "2024-06-01 12:00:00")], ["flight", "departure_time"])
df = df.withColumn("departure_time", F.to_timestamp("departure_time"))
# Reading this on clusters in different regions shifts the displayed hour!""",
        "solution_code": """# Production-Grade Solution: Use TimestampNTZType (No Time Zone)
from pyspark.sql.types import TimestampNTZType
from pyspark.sql import functions as F

# In Spark 3.4+ / Databricks Runtime 11.3+:
# TimestampNTZ stores wall-clock timestamp independent of any session timezone!
df_ntz = df.withColumn("departure_time", F.col("departure_time").cast("timestamp_ntz"))

df_ntz.write.format("delta").saveAsTable("gold.flights")

# Whether queried in London, Tokyo, or New York, departure_time is guaranteed
# to remain exactly '2024-06-01 12:00:00' everywhere!""",
        "interview_takeaway": "Use `TimestampNTZ` (timestamp without timezone) for wall-clock concepts like hotel check-ins or flight schedules that must remain invariant regardless of the reader's local session timezone."
    },
    {
        "id": 65,
        "title": "Late-Arriving Event Time Dropped by Overly Aggressive Watermarks",
        "category": "Timestamps & Late Data",
        "level": "Intermediate",
        "scenario": "A mobile ride-hailing app streams completed trips to compute driver earnings. Trip events from drivers entering subway tunnels or rural areas are uploaded 45 minutes late when connectivity resumes. The streaming query uses `.withWatermark('trip_end_time', '10 minutes')`. All offline trips are silently discarded, shortchanging drivers by $300,000.",
        "symptom": "Driver complaints of missing earnings; streaming job reports zero errors, but late events are omitted from sink.",
        "root_cause": "Structured Streaming watermarks track the maximum observed event time minus the delay threshold. Any record arriving with `event_time < (max_event_time - watermark_delay)` is considered too late and dropped immediately by the state store.",
        "failing_code": """# Failing Streaming Code:
# Watermark is set to 10 minutes, but mobile syncs can be delayed by 45 minutes:
streaming_earnings = rides_stream \\
    .withWatermark("trip_end_time", "10 minutes") \\
    .groupBy(F.window("trip_end_time", "1 hour"), "driver_id") \\
    .agg(F.sum("fare_amount").alias("earnings"))""",
        "solution_code": """# Production-Grade Solution: Right-Size Watermark + Multi-Speed Lakehouse Lambda Pattern
# Step 1: Expand streaming watermark to cover 99.5% of mobile latency (e.g. 2 hours):
streaming_earnings = rides_stream \\
    .withWatermark("trip_end_time", "2 hours") \\
    .groupBy(F.window("trip_end_time", "1 hour"), "driver_id") \\
    .agg(F.sum("fare_amount").alias("earnings"))

# Step 2: For extreme outliers (> 2 hours), append all raw events to Bronze Delta Lake,
# and run a nightly reconciliation batch job using MERGE INTO to correct late earnings:
# Nightly batch updates driver accounts with any stragglers that missed the real-time stream!""",
        "interview_takeaway": "Watermarks permanently discard events older than the threshold; size real-time watermarks to accommodate $p99$ mobile/network delays (e.g. 2-4 hours) and complement streaming with a nightly reconciliation batch for extreme stragglers."
    },
    {
        "id": 66,
        "title": "Dual-Watermarking Constraints Across Stream-Stream Joins",
        "category": "Timestamps & Late Data",
        "level": "Advanced",
        "scenario": "An ad-tech platform joins an `impressions` stream with a `clicks` stream in Structured Streaming. Users click on ads anywhere between 1 second and 30 minutes after seeing them. The engineer adds a watermark only on the impressions stream. The streaming query crashes with `AnalysisException: Cannot perform stream-stream join without watermark on both sides`.",
        "symptom": "`AnalysisException: Watermark must be defined on both streams for stream-stream outer joins`.",
        "root_cause": "In stream-stream joins, Spark must buffer unmatched events from both streams in the state store. Without a watermark AND a time range constraint on both sides, the engine would have to retain state indefinitely, leading to memory exhaustion.",
        "failing_code": """# Failing PySpark Streaming Code:
impressions = stream_1.withWatermark("impression_time", "1 hour")
clicks = stream_2 # Missing watermark and missing time range constraint!

# Crashes during query initialization:
joined = impressions.join(clicks, on="ad_id", how="leftOuter")""",
        "solution_code": """# Production-Grade Solution: Dual Watermarks with Time Range Join Condition
# 1. Define watermarks on BOTH streams:
impressions = stream_1.withWatermark("impression_time", "2 hours")
clicks = stream_2.withWatermark("click_time", "3 hours")

# 2. Join with explicit time interval constraint:
# Clicks must occur within 1 hour after impression:
joined = impressions.join(
    clicks,
    F.expr(\"\"\"
        impressions.ad_id = clicks.ad_id AND
        click_time >= impression_time AND
        click_time <= impression_time + interval 1 hour
    \"\"\"),
    how="leftOuter"
)

# Spark now safely evicts matched and unmatched events from state store after 3 hours!""",
        "interview_takeaway": "Stream-stream joins require watermarks on BOTH streams plus an explicit temporal range constraint (e.g. `clicks.time BETWEEN imp.time AND imp.time + INTERVAL 1 HOUR`) to allow deterministic state store eviction."
    },
    {
        "id": 67,
        "title": "Windowed Aggregation with Event Time vs Processing Time Skew",
        "category": "Timestamps & Late Data",
        "level": "Advanced",
        "scenario": "An IoT fraud detection system aggregates login attempts over a 5-minute sliding window. An attacker changes their device clock to `'2099-01-01 00:00:00'`. When this single rogue event enters the stream, Spark advances the global watermark to the year 2099, instantly causing all subsequent legitimate real-world events to be dropped as 'too late'.",
        "symptom": "Streaming pipeline instantly drops 100% of incoming real-time traffic; state store stops updating.",
        "root_cause": "Spark Structured Streaming advances the watermark based on the maximum event time observed across all partitions. A single future timestamp advances the watermark threshold into the future, causing legitimate real-time events to fall behind the cutoff.",
        "failing_code": """# Failing PySpark Code:
# Stream accepts future timestamps without validation:
# Attacker sends event_time: 2099-01-01T00:00:00Z
stream_df = spark.readStream.format("kafka").load() \\
    .select(F.from_json("value", schema).alias("data")).select("data.*")

# Watermark instantly jumps 75 years ahead!
windowed = stream_df.withWatermark("event_time", "10 minutes") \\
    .groupBy(F.window("event_time", "5 minutes")) \\
    .count()""",
        "solution_code": """# Production-Grade Solution: Sanitize Future Timestamps at Ingestion Gate
from pyspark.sql import functions as F

# Filter out rogue future timestamps before they poison the global watermark!
sanitized_stream = stream_df.filter(
    # Allow at most 5 minutes of clock drift ahead of cluster processing time:
    F.col("event_time") <= F.current_timestamp() + F.expr("INTERVAL 5 MINUTES")
).filter(
    # Filter out absurdly stale historical timestamps:
    F.col("event_time") >= F.current_timestamp() - F.expr("INTERVAL 7 DAYS")
)

# Safe watermark progression:
windowed = sanitized_stream.withWatermark("event_time", "10 minutes") \\
    .groupBy(F.window("event_time", "5 minutes")) \\
    .count()""",
        "interview_takeaway": "A single rogue future timestamp can poison the global streaming watermark and cause all subsequent real-time events to be dropped; always filter `event_time <= current_timestamp() + interval N minutes` at the stream boundary."
    },
    {
        "id": 68,
        "title": "Distributed Clock Drift across Worker Nodes Breaking Leases",
        "category": "Timestamps & Late Data",
        "level": "Advanced",
        "scenario": "A 100-node Spark on Kubernetes cluster runs across multiple physical VM hosts. Due to an NTP sync failure, two worker nodes experience a 45-second clock drift relative to the master. File commit locks, Delta Lake transaction log leases, and `current_timestamp()` metadata columns record inconsistent timestamps, causing out-of-order log verification errors.",
        "symptom": "Delta Lake transactions fail with `ProtocolVersionException` or unexpected timestamp sequencing.",
        "root_cause": "Distributed algorithms rely on hardware clocks being synchronized via NTP/Chrony. Unsynchronized worker clocks cause timestamp inconsistencies across partitions generated in the same task stage.",
        "failing_code": """# Inconsistent Pattern: Calling current_timestamp() in worker tasks
# If Worker A clock is 12:00:45 and Worker B clock is 12:00:00:
df_with_ts = df.withColumn("created_at", F.current_timestamp())
# Partitions generated on Worker A have timestamps 45 seconds ahead of Worker B!""",
        "solution_code": """# Production-Grade Solution: Driver-Injected Constant Timestamps & NTP Auditing
import datetime
from pyspark.sql import functions as F

# Option 1: Capture UTC timestamp once on Driver and broadcast as a literal:
batch_utc_now = datetime.datetime.now(datetime.timezone.utc)

# Every worker receives the identical, synchronized timestamp literal:
df_consistent = df.withColumn("created_at", F.lit(batch_utc_now).cast("timestamp"))

# Option 2: Enforce cluster-wide Chrony / NTP synchronization in Kubernetes DaemonSets / AMI init scripts:
# chronyd -q 'server time.google.com iburst'""",
        "interview_takeaway": "Do not rely on distributed worker system clocks for batch coordination; capture a single canonical timestamp on the driver and broadcast it via `F.lit(driver_timestamp)` to guarantee uniform audit metadata."
    },
    {
        "id": 69,
        "title": "Handling 7-Day Delayed Transactions in Financial Reconciliation Lakehouses",
        "category": "Timestamps & Late Data",
        "level": "Architect",
        "scenario": "A global card payment network clears merchant transactions. While 95% of transactions clear within 2 seconds, offline airline and cruise ship charges arrive up to 7 days late. Holding 7 days of raw state in a Structured Streaming state store requires 80TB of RAM and crashes executors.",
        "symptom": "State store memory requirements make pure real-time stream processing economically impossible.",
        "root_cause": "Long-tail arrival distributions (up to 7 days) exceed the practical memory capacity of in-memory streaming state stores.",
        "failing_code": """# Failing Architecture: Attempting 7-day streaming state store
streaming_df.withWatermark("tx_time", "7 days") \\ # 80TB State Store! OOM Crash!
    .groupBy("merchant_id", F.window("tx_time", "1 day")).sum("amount")""",
        "solution_code": """-- Production-Grade Solution: Two-Tier Medallion Architecture (Speed Layer + Batch Reconciliation)
-- Tier 1 (Speed Layer): Real-Time Stream with 2-Hour Watermark for Live Operational Dashboards
-- Writes raw events to Bronze Delta table immediately.

-- Tier 2 (Reconciliation Layer): Scheduled Micro-Batch / Hourly MERGE into Gold Fact Ledger:
-- Delta Lake MERGE INTO handles late-arriving transactions up to 30 days seamlessly:
MERGE INTO gold.fact_merchant_daily_sales target
USING (
    SELECT 
        merchant_id, 
        to_date(tx_time) AS tx_date,
        SUM(amount) AS daily_amount
    FROM bronze.transactions
    WHERE ingestion_time >= current_timestamp() - INTERVAL 12 HOURS -- Scan recently ingested files
    GROUP BY 1, 2
) source
ON target.merchant_id = source.merchant_id AND target.tx_date = source.tx_date
WHEN MATCHED THEN 
    UPDATE SET target.daily_amount = target.daily_amount + source.daily_amount
WHEN NOT MATCHED THEN 
    INSERT (merchant_id, tx_date, daily_amount) VALUES (source.merchant_id, source.tx_date, source.daily_amount);""",
        "interview_takeaway": "Do not force multi-day late arrival handling into streaming state stores; use a tight 2-hour watermark for streaming dashboards and reconcile multi-day delayed records via incremental Delta Lake `MERGE INTO` batch jobs."
    },
    {
        "id": 70,
        "title": "Time Travel Ingestion Reproducibility with Delta Lake CDF and As-Of Timestamps",
        "category": "Timestamps & Late Data",
        "level": "Architect",
        "scenario": "A hedge fund regulatory audit demands an exact recreation of the investment portfolio valuation as it existed on March 15th at 4:00 PM EST. However, historical backfills and late-arriving trade corrections were written into the Delta table on March 18th. Running a naive date filter `WHERE trade_date <= '2024-03-15'` includes the backfilled trades, distorting the audit.",
        "symptom": "Historical reports cannot be reproduced; backfilled records corrupt point-in-time audit requirements.",
        "root_cause": "Filtering on business date (`trade_date`) incorporates all modifications committed after the audit deadline. True point-in-time reproducibility requires traveling along the storage system commit timeline, not business event time.",
        "failing_code": """-- Failing Audit Query:
-- Includes trades backfilled on March 18th!
SELECT SUM(shares * price) AS portfolio_value
FROM gold.positions
WHERE trade_date <= '2024-03-15'; -- Corrupted by later backfills!""",
        "solution_code": """-- Production-Grade Solution: Delta Lake Time Travel using AS OF Timestamp or Version
-- Query the exact snapshot of the table as committed at 4:00 PM EST on March 15th:
SELECT SUM(shares * price) AS portfolio_value
FROM gold.positions TIMESTAMP AS OF '2024-03-15 16:00:00-05:00';

-- In PySpark:
# df_audit = spark.read.format("delta") \\
#     .option("timestampAsOf", "2024-03-15 16:00:00") \\
#     .table("gold.positions")

-- Using Delta Change Data Feed (CDF) to inspect exactly what changed between two versions:
-- SELECT * FROM table_changes('gold.positions', 1042, 1089);""",
        "interview_takeaway": "Business event dates do not guarantee historical audit integrity; use Delta Lake Time Travel (`TIMESTAMP AS OF` or `VERSION AS OF`) to query the immutable snapshot of data as it physically existed at the audit deadline."
    }
]
