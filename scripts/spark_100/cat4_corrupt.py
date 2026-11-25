"""
Category 4: Corrupt, Malformed & Truncated Ingestion Records (Problems 31 - 40)
"""

CAT4_PROBLEMS = [
    {
        "id": 31,
        "title": "Malformed CSV Rows with Unescaped Commas and Field Shifts",
        "category": "Corrupt & Malformed Records",
        "level": "Beginner",
        "scenario": "A financial data pipeline ingests vendor payment files in CSV format. A vendor name contains an unescaped comma: `\"Acme Supplies, Inc.\"`. Spark reads the row with default CSV settings, splitting the name across two columns and shifting the transaction amount into a date column, causing catastrophic silent data corruption.",
        "symptom": "Analytical queries fail with `NumberFormatException` when aggregating the amount column, or revenue figures are corrupted with dates.",
        "root_cause": "By default, Spark CSV reader treats commas strictly as delimiters unless explicit quoting rules (`quote`, `escape`) are configured. Unquoted commas shift tokens into adjacent columns.",
        "failing_code": """# Failing PySpark Code:
# Data row: 101,Acme Supplies, Inc.,2024-05-01,1500.00
df = spark.read.option("header", "true").csv("s3://vendor/payments.csv")
# Results in:
# id: 101 | name: "Acme Supplies" | address: "Inc." | tx_date: "2024-05-01" | amount: NULL""",
        "solution_code": """# Production-Grade Solution: Robust Quoting, Escaping, and Schema Validation
df = spark.read \\
    .option("header", "true") \\
    .option("quote", "\"") \\
    .option("escape", "\\\\") \\
    .option("mode", "PERMISSIVE") \\
    .option("columnNameOfCorruptRecord", "_corrupt_record") \\
    .schema("id INT, vendor_name STRING, tx_date DATE, amount DECIMAL(12,2), _corrupt_record STRING") \\
    .csv("s3://vendor/payments.csv")

# Filter out and alert on malformed rows
valid_df = df.filter(F.col("_corrupt_record").isNull()).drop("_corrupt_record")
corrupt_df = df.filter(F.col("_corrupt_record").isNotNull())""",
        "interview_takeaway": "Never read CSV files without defining an explicit schema and configuring quote/escape delimiters; always capture shifted or malformed records using `columnNameOfCorruptRecord`."
    },
    {
        "id": 32,
        "title": "JSON Parse Modes: PERMISSIVE vs DROPMALFORMED vs FAILFAST",
        "category": "Corrupt & Malformed Records",
        "level": "Beginner",
        "scenario": "An ingestion pipeline uses `mode = 'DROPMALFORMED'` to ingest user feedback JSON files. When a third-party webhook sends 100,000 records with an unclosed bracket `{\"user\": 12, \"comment\": ...`, Spark silently drops all 100,000 rows. The team discovers 2 weeks later that 20% of customer feedback was completely lost.",
        "symptom": "Job succeeds with status SUCCESS, but total row count drops significantly with zero error traces.",
        "root_cause": "`DROPMALFORMED` silently discards any row that fails JSON parsing without notification or logging. In contrast, `FAILFAST` aborts immediately, and `PERMISSIVE` preserves the raw record in a designated corruption column.",
        "failing_code": """# Failing PySpark Code:
# DROPMALFORMED drops bad records into a black hole!
df = spark.read \\
    .option("mode", "DROPMALFORMED") \\
    .json("s3://webhooks/feedback/")
df.write.format("delta").save("s3://bronze/feedback/")""",
        "solution_code": """# Production-Grade Solution: Use PERMISSIVE with _corrupt_record Capture
from pyspark.sql.types import StructType, StructField, StringType, IntegerType

schema = StructType([
    StructField("user_id", IntegerType(), True),
    StructField("comment", StringType(), True),
    StructField("_corrupt_record", StringType(), True)
])

df = spark.read \\
    .option("mode", "PERMISSIVE") \\
    .option("columnNameOfCorruptRecord", "_corrupt_record") \\
    .schema(schema) \\
    .json("s3://webhooks/feedback/")

# Split valid records from corrupted payloads
valid_df = df.filter(F.col("_corrupt_record").isNull()).drop("_corrupt_record")
corrupt_df = df.filter(F.col("_corrupt_record").isNotNull())

valid_df.write.format("delta").mode("append").saveAsTable("bronze.feedback")
corrupt_df.write.format("delta").mode("append").saveAsTable("audit.corrupt_feedback")""",
        "interview_takeaway": "Never use `DROPMALFORMED` in production ingestion pipelines; use `PERMISSIVE` with `columnNameOfCorruptRecord` to safely isolate malformed payloads into an audit quarantine table without data loss."
    },
    {
        "id": 33,
        "title": "Multi-Line JSON and CSV Split Errors Across Distributed Chunks",
        "category": "Corrupt & Malformed Records",
        "level": "Intermediate",
        "scenario": "An API exporter writes pretty-printed JSON files (formatted with indentation and newlines across multiple lines). A Spark cluster reads the directory with standard `spark.read.json()`. Tasks fail with `SparkException: Malformed line` or read hundreds of garbage rows consisting of individual JSON property lines.",
        "symptom": "Single JSON documents are sliced into fragments across tasks; row counts are 20x higher than expected, with fields showing partial JSON syntax.",
        "root_cause": "By default, Spark assumes JSON and CSV are single-line records (one record per line). The reader splits files at arbitrary byte boundaries and expects newline characters to delimit records. For multi-line JSON, `multiLine=true` is required.",
        "failing_code": """# Failing PySpark Code:
# Reading multi-line / pretty-printed JSON with single-line assumptions
df = spark.read.json("s3://api-dumps/pretty_printed/*.json")
# Each line '{' or '  \"id\": 1,' is treated as an individual malformed record!""",
        "solution_code": """# Production-Grade Solution: Enable multiLine and Balance Split Trade-Offs
# Option A: Enable multiLine option
df = spark.read.option("multiLine", "true").json("s3://api-dumps/pretty_printed/*.json")

# PERFORMANCE WARNING: multiLine=true forces Spark to read each file in a single task (non-splittable)
# If files are massive (e.g. 10GB single file), pre-process or convert upstream to newline-delimited JSON (JSONL / NDJSON).

# Option B: Convert upstream to JSON Lines (ndjson) where each complete record is on a single line:
# {"id": 1, "name": "Acme"}
# {"id": 2, "name": "Beta"}""",
        "interview_takeaway": "Pretty-printed JSON requires `.option('multiLine', 'true')` because Spark defaults to single-line parsing; however, `multiLine=true` disables parallel file splitting, making JSON Lines (`NDJSON`) the preferred enterprise standard."
    },
    {
        "id": 34,
        "title": "Corrupted Parquet File Footers from Aborted Upstream Writers",
        "category": "Corrupt & Malformed Records",
        "level": "Intermediate",
        "scenario": "An upstream legacy Spark job killed by an out-of-memory error leaves a partial 0-byte or half-written Parquet file in an unmanaged S3 bucket. Downstream ETL queries reading the directory fail immediately with `IOException: Could not read footer for file`.",
        "symptom": "`java.io.IOException: Could not read footer for file: s3://landing/part-00123.parquet` halts the entire enterprise warehouse refresh.",
        "root_cause": "Parquet files store essential metadata (schema, row group offsets, dictionary pages) in the file footer at the very end of the file. If a writer is killed midway, the footer is never written, making the physical file unreadable.",
        "failing_code": """# Failing PySpark Code:
# Reading raw directory containing half-written Parquet files from aborted job:
df = spark.read.parquet("s3://landing/unmanaged_parquet/")
df.count() # Crashes with IOException: Could not read footer""",
        "solution_code": """# Production-Grade Solution: Ignore Corrupt Files or Migrate to Delta Lake
# Option 1: Tell Spark to skip corrupt files during emergency batch runs:
spark.conf.set("spark.sql.files.ignoreCorruptFiles", "true")
df = spark.read.parquet("s3://landing/unmanaged_parquet/")

# Option 2: Architectural Solution - Always use Delta Lake or Iceberg!
# Modern lakehouse formats commit files via an atomic transaction log (e.g. _delta_log/).
# A half-written or aborted file is NEVER referenced in the transaction log,
# completely immunizing readers from footer corruption or partial writes.""",
        "interview_takeaway": "Unmanaged Parquet files are vulnerable to missing footers from interrupted writes; use `spark.sql.files.ignoreCorruptFiles = true` for temporary recovery, and mandate Delta Lake for transactional ACID immunity."
    },
    {
        "id": 35,
        "title": "Zero-Byte Files and Partial Blocks in Cloud Object Storage",
        "category": "Corrupt & Malformed Records",
        "level": "Intermediate",
        "scenario": "An SFTP sync script creates zero-byte files (touch markers) while waiting for incoming partner data. When a daily Spark pipeline runs `spark.read.csv()`, tasks throw `EOFException` or `IllegalArgumentException: filePath is empty`.",
        "symptom": "Jobs crash during schema inference or initial partition calculation with `java.io.EOFException`.",
        "root_cause": "Zero-byte files confuse CSV/JSON schema inferrers and can crash split calculations when metadata exists without readable payload blocks.",
        "failing_code": """# Failing PySpark Code:
# SFTP folder contains: [data_1.csv (10MB), data_2.csv (0 bytes), data_3.csv (0 bytes)]
df = spark.read.option("header", "true").csv("s3://sftp/incoming/*.csv")
# Fails during schema inference on 0-byte file""",
        "solution_code": """# Production-Grade Solution: Filter Empty Files via Hadoop Path Filter or Auto Loader
# Option 1: Configure Spark to ignore empty/missing files:
spark.conf.set("spark.sql.files.ignoreMissingFiles", "true")

# Option 2: Pre-filter zero-byte paths using JVM Hadoop FileSystem:
sc = spark.sparkContext
conf = sc._jsc.hadoopConfiguration()
Path = sc._gateway.jvm.org.apache.hadoop.fs.Path
fs = Path("s3://sftp/incoming/").getFileSystem(conf)
valid_files = [str(status.getPath()) for status in fs.listStatus(Path("s3://sftp/incoming/")) if status.getLen() > 0]

df = spark.read.option("header", "true").csv(valid_files)

# Option 3: Auto Loader automatically ignores empty files without crashing:
# spark.readStream.format("cloudFiles").option("cloudFiles.format", "csv").load(...)""",
        "interview_takeaway": "Zero-byte marker files created by ingestion scripts crash schema inference; use Databricks Auto Loader or programmatic Hadoop FileSystem file-length filters to prune 0-byte objects before reading."
    },
    {
        "id": 36,
        "title": "Safe Isolation of Malformed Records with _corrupt_record",
        "category": "Corrupt & Malformed Records",
        "level": "Advanced",
        "scenario": "A health insurance claims pipeline receives JSON claims from 400 hospital networks. Approximately 0.05% of records have invalid JSON syntax (e.g. truncated packets). The business requires 100% processing of valid claims while quarantining invalid claims with full audit tracking.",
        "symptom": "Using `FAILFAST` causes 99.95% of legitimate claims to be delayed whenever a single corrupt record arrives.",
        "root_cause": "Strict parsing crashes whole micro-batches. Permissive parsing without capturing `_corrupt_record` leaves corrupt records as all-null rows, which contaminate downstream aggregations.",
        "failing_code": """# Failing PySpark Code:
# FAILFAST causes total pipeline blockage
df = spark.read.option("mode", "FAILFAST").json("s3://claims/incoming/")
df.write.format("delta").save("s3://bronze/claims/")""",
        "solution_code": """# Production-Grade Solution: Dedicated Schema with _corrupt_record Column
from pyspark.sql.types import StructType, StructField, StringType, DoubleType, LongType
from pyspark.sql import functions as F

claims_schema = StructType([
    StructField("claim_id", LongType(), True),
    StructField("patient_id", StringType(), True),
    StructField("claimed_amount", DoubleType(), True),
    StructField("_corrupt_record", StringType(), True) # Must match option name
])

df = spark.read \\
    .option("mode", "PERMISSIVE") \\
    .option("columnNameOfCorruptRecord", "_corrupt_record") \\
    .schema(claims_schema) \\
    .json("s3://claims/incoming/")

# 1. Clean Claims Path
clean_claims = df.filter(F.col("_corrupt_record").isNull()).drop("_corrupt_record")
clean_claims.write.format("delta").mode("append").saveAsTable("silver.claims")

# 2. Quarantine Dead-Letter Path
bad_claims = df.filter(F.col("_corrupt_record").isNotNull()) \\
    .withColumn("received_at", F.current_timestamp()) \\
    .withColumn("error_reason", F.lit("MALFORMED_JSON_SYNTAX"))

bad_claims.write.format("delta").mode("append").saveAsTable("quarantine.corrupt_claims")""",
        "interview_takeaway": "Include `_corrupt_record` in your declared schema and configure `columnNameOfCorruptRecord` to bifurcate streams into a clean silver table and an auditable quarantine table without stalling the pipeline."
    },
    {
        "id": 37,
        "title": "Non-UTF-8 Characters and High-Surrogate Code Points in String Functions",
        "category": "Corrupt & Malformed Records",
        "level": "Advanced",
        "scenario": "A web scraping pipeline extracts reviews and emoji comments. Upstream scraping bugs write corrupted UTF-16 surrogate pairs or legacy Windows-1252 / ISO-8859-1 byte sequences into Parquet string columns. When running regex extraction or tokenization, Spark tasks fail with `java.nio.charset.MalformedInputException` or JVM string index out-of-bounds.",
        "symptom": "`SparkException: Job aborted due to stage failure: java.nio.charset.MalformedInputException: Input length = 1` during regex or string manipulations.",
        "root_cause": "The JVM `String` implementation expects valid UTF-16 / UTF-8 sequences. Unpaired high-surrogates or raw binary bytes masquerading as strings violate UTF invariants, breaking JVM string encoders and C++ vectorized execution engines.",
        "failing_code": """# Failing PySpark Code:
# Text column contains raw invalid bytes or isolated surrogate characters: '\\\\uD83D' without low surrogate
df = spark.read.table("raw_reviews")
# Calling regex_replace or substring crashes on invalid surrogate code points
cleaned_df = df.withColumn("cleaned_text", F.regexp_replace("review_text", "[^a-zA-Z0-9 ]", ""))
cleaned_df.count() # Crashes with MalformedInputException""",
        "solution_code": """# Production-Grade Solution: Sanitize Non-UTF-8 Bytes at Ingestion Boundary
from pyspark.sql import functions as F

# Option 1: Read binary content and decode with UTF-8 replacement character (U+FFFD)
# In Spark SQL, encode and decode safely:
df_safe = df.withColumn(
    "clean_review_text",
    # Re-encodes string to binary and decodes strictly with replacement:
    F.expr("decode(encode(review_text, 'UTF-8'), 'UTF-8')")
)

# Option 2: Remove high/low surrogate characters using regex range:
# High surrogates: [\\\\uD800-\\\\uDBFF], Low surrogates: [\\\\uDC00-\\\\uDFFF]
sanitized_df = df.withColumn(
    "sanitized_text",
    F.regexp_replace("review_text", "[\\\\x00-\\\\x08\\\\x0B\\\\x0C\\\\x0E-\\\\x1F\\\\x7F]", "")
)""",
        "interview_takeaway": "Corrupt encodings and isolated surrogate code points crash JVM string parsers; sanitize raw strings by re-encoding through UTF-8 or stripping invalid surrogate byte sequences before applying downstream transformations."
    },
    {
        "id": 38,
        "title": "Auto Loader Rescued Data Column Architecture for Semi-Structured Ingestion",
        "category": "Corrupt & Malformed Records",
        "level": "Advanced",
        "scenario": "A gaming telemetry platform ingests 200 million player action events daily. Game client patches frequently alter field casing, rename attributes (e.g. `score` to `player_score`), or submit integers as strings. If the pipeline rejects these files, game telemetry is halted. If it accepts them blindly, the schema corrupts.",
        "symptom": "Frequent pipeline halts due to minor client-side format drift.",
        "root_cause": "Semi-structured data in production experiences inevitable non-breaking and breaking variations that tabular databases cannot ingest without either strict failure or silent data loss.",
        "failing_code": """# Failing Setup: Rigid Schema Enforcement
streaming_df = spark.readStream.format("cloudFiles") \\
    .option("cloudFiles.format", "json") \\
    .schema("player_id STRING, score INT, level INT") \\ # Rigid schema
    .load("s3://game/telemetry/")
# If client sends score: "100" (string) or adds new field 'guild_id', score becomes NULL and guild_id is lost!""",
        "solution_code": """# Production-Grade Solution: Auto Loader Rescued Data Pattern
# Auto Loader automatically stores mismatched types, case-mismatches, and undeclared columns in _rescued_data
streaming_df = spark.readStream.format("cloudFiles") \\
    .option("cloudFiles.format", "json") \\
    .option("cloudFiles.schemaLocation", "s3://lake/checkpoints/game_schema/") \\
    .option("cloudFiles.schemaEvolutionMode", "rescue") \\
    .schema("player_id STRING, score INT, level INT") \\
    .load("s3://game/telemetry/")

# In Silver processing, inspect _rescued_data for known migrations:
silver_df = streaming_df.withColumn(
    "effective_score",
    F.coalesce(
        F.col("score"),
        F.expr("CAST(_rescued_data['score'] AS INT)"),
        F.expr("CAST(_rescued_data['player_score'] AS INT)")
    )
)""",
        "interview_takeaway": "Auto Loader's `_rescued_data` column acts as an automated safety net for semi-structured data, capturing type mismatches and undeclared columns so downstream silver pipelines can recover data without ingestion halts."
    },
    {
        "id": 39,
        "title": "Dead-Letter Queue (DLQ) Quarantine Architecture for Kafka Streaming Payloads",
        "category": "Corrupt & Malformed Records",
        "level": "Architect",
        "scenario": "A payments streaming application reads real-time transactions from an Apache Kafka topic. Once every 3 days, a corrupted 'poison pill' packet (e.g. 0-byte payload or invalid Protobuf/Avro bytes) is published to the topic. The Spark Structured Streaming query fails on deserialization and restarts in an infinite retry crash loop.",
        "symptom": "Streaming job enters an unrecoverable failure loop (`StreamExecution: query failed with SerializationException`). Real-time SLAs are breached.",
        "root_cause": "Structured Streaming checkpoints track Kafka offsets. If the micro-batch cannot deserialize a message at offset $K$, restarting the query causes it to reread offset $K$, hitting the same crash indefinitely.",
        "failing_code": """# Failing Streaming Code:
kafka_stream = spark.readStream.format("kafka") \\
    .option("kafka.bootstrap.servers", "kafka:9092") \\
    .option("subscribe", "payments") \\
    .load()

# Naive Deserialization in Streaming Plan:
parsed = kafka_stream.select(
    F.from_json(F.col("value").cast("string"), payment_schema).alias("data")
).select("data.*")
# If payload is totally invalid binary, from_json produces all NULLs, or custom UDF deserializer crashes query!""",
        "solution_code": """# Production-Grade Solution: Non-Crashing Deserialization with Offset-Tracked DLQ Egress
from pyspark.sql import functions as F

raw_stream = spark.readStream.format("kafka") \\
    .option("kafka.bootstrap.servers", "kafka:9092") \\
    .option("subscribe", "payments") \\
    .load()

# Step 1: Retain Kafka metadata (topic, partition, offset, timestamp) alongside raw bytes
payload_df = raw_stream.select(
    F.col("topic"),
    F.col("partition"),
    F.col("offset"),
    F.col("timestamp"),
    F.col("value").cast("string").alias("raw_string")
)

# Step 2: Safe Parsing with PERMISSIVE from_json
parsed_df = payload_df.withColumn(
    "parsed_data",
    F.from_json(F.col("raw_string"), payment_schema, options={"mode": "PERMISSIVE"})
)

# Step 3: Branching in foreachBatch
def process_micro_batch(microBatchDF, batchId):
    microBatchDF.persist()

    # Clean records
    clean_records = microBatchDF.filter(F.col("parsed_data.payment_id").isNotNull()) \\
        .select("parsed_data.*")
    clean_records.write.format("delta").mode("append").saveAsTable("silver.payments")

    # Poison pill / Corrupt records -> Egress to Dead-Letter Topic or Quarantine Delta Table
    dead_letters = microBatchDF.filter(F.col("parsed_data.payment_id").isNull())
    if not dead_letters.isEmpty():
        dead_letters.write.format("delta").mode("append").saveAsTable("quarantine.kafka_dead_letters")

    microBatchDF.unpersist()

parsed_df.writeStream.foreachBatch(process_micro_batch).start()""",
        "interview_takeaway": "Never allow deserialization errors to kill a Kafka streaming loop; retain Kafka offsets and metadata, deserialize permissively, and branch poisoned payloads into a Dead-Letter Queue (DLQ) within `foreachBatch`."
    },
    {
        "id": 40,
        "title": "Zero-Copy Quarantine Pattern for Corrupt Bronze Records in Delta Lake",
        "category": "Corrupt & Malformed Records",
        "level": "Architect",
        "scenario": "A Tier-1 financial ledger ingests 10TB of raw partner transactions daily. Regulatory compliance mandates that no data may ever be discarded, even if corrupted or non-compliant. However, invalid rows must never enter gold accounting tables. Creating duplicate physical copies for quarantine would inflate cloud storage costs by $250,000/year.",
        "symptom": "Duplicating 10TB/day across valid and invalid buckets doubles egress, storage, and maintenance overhead.",
        "root_cause": "Naive quarantine architectures physically copy data into two separate storage locations (`s3://clean/` and `s3://quarantine/`), doubling ingestion I/O and storage fees.",
        "failing_code": """# Failing Architecture: Dual Physical Write Pattern
# Writes the same incoming 10TB dataset twice:
clean_df.write.format("delta").save("s3://storage/clean/")       # 10TB
quarantine_df.write.format("delta").save("s3://storage/corrupt/") # Duplicates storage & compute!""",
        "solution_code": """-- Production-Grade Solution: Single Bronze Ingestion Table with Quality Flags & Virtual Views
-- Step 1: Write 100% of raw records once into Bronze Delta table with validation metadata
-- Schema: raw_payload, ingestion_time, is_valid, validation_errors

-- Step 2: Create Zero-Copy Secured Views for Downstream Consumers:
CREATE OR REPLACE VIEW silver.clean_transactions AS
SELECT
    from_json(raw_payload, 'schema_definition') AS data,
    ingestion_time
FROM bronze.raw_transactions
WHERE is_valid = TRUE;

CREATE OR REPLACE VIEW audit.quarantined_transactions AS
SELECT
    raw_payload,
    validation_errors,
    ingestion_time
FROM bronze.raw_transactions
WHERE is_valid = FALSE;

-- Zero storage duplication, single write pipeline, 100% regulatory audit compliance!""",
        "interview_takeaway": "Implement the Zero-Copy Quarantine Pattern by writing all raw records to a single Bronze Delta table with validation flags, then projecting clean and quarantined datasets through virtual views without duplicating physical storage."
    }
]
