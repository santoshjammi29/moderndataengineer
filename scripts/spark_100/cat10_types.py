"""
Category 10: Type Mismatch, Precision Loss & Serialization Pitfalls (Problems 91 - 100)
"""

CAT10_PROBLEMS = [
    {
        "id": 91,
        "title": "Floating-Point Imprecision in Financial Currency Calculations",
        "category": "Type Conversion & Precision",
        "level": "Beginner",
        "scenario": "A payments reconciliation pipeline calculates merchant balances by summing transaction fees stored as `DoubleType`. Adding fees of $0.10 and $0.20 yields $0.30000000000000004. Over millions of transactions, balance audits fail by thousands of dollars due to floating-point rounding accumulation.",
        "symptom": "Balance sheets fail exact zero-sum reconciliation audits; pennies drift across ledger accounts.",
        "root_cause": "IEEE 754 floating-point numbers (`FloatType`, `DoubleType`) represent base-10 fractional decimals in binary base-2, creating inherent binary rounding approximations.",
        "failing_code": """# Failing PySpark Code:
# Storing monetary values as DoubleType:
df = spark.createDataFrame([(0.10,), (0.20,)], ["fee"])
result = df.agg(F.sum("fee")).collect()[0][0]
print(result) # 0.30000000000000004 (NOT 0.30!)""",
        "solution_code": """# Production-Grade Solution: Use Fixed-Point DecimalType(18, 4) or DecimalType(38, 2)
from pyspark.sql.types import DecimalType
from pyspark.sql import functions as F

# Cast or declare financial fields as DecimalType:
df_decimal = df.withColumn("fee", F.col("fee").cast(DecimalType(18, 4)))

result = df_decimal.agg(F.sum("fee")).collect()[0][0]
print(result) # Decimal('0.3000') - Exact, deterministic mathematical precision!

# In Spark DDL:
# CREATE TABLE ledger (tx_id STRING, amount DECIMAL(18, 2)) USING DELTA;""",
        "interview_takeaway": "Never use `DoubleType` or `FloatType` for currency or monetary accounting; always use `DecimalType(precision, scale)` to avoid IEEE 754 binary floating-point drift."
    },
    {
        "id": 92,
        "title": "Silent Integer Overflow in Spark 3.x vs spark.sql.ansi.enabled",
        "category": "Type Conversion & Precision",
        "level": "Beginner",
        "scenario": "A telecommunications company calculates total bandwidth usage in bytes across subscribers using `IntegerType`. When total usage exceeds $2,147,483,647$ ($2^{31}-1$), the sum wraps into negative numbers (`-2,147,483,400`), resulting in negative customer bills.",
        "symptom": "Aggregated metrics suddenly turn negative without throwing any arithmetic exceptions or warnings.",
        "root_cause": "By default in non-ANSI mode (`spark.sql.ansi.enabled = false`), integer arithmetic overflow wraps around based on standard two's-complement binary arithmetic rather than failing or promoting to BIGINT.",
        "failing_code": """# Failing Non-ANSI Setup:
# Integer max is 2,147,483,647
df = spark.createDataFrame([(2147483640,), (100,)], ["bytes_used"]) # IntegerType
df.agg(F.sum("bytes_used")).show()
# Returns: -2147483556 ! Silent numeric corruption!""",
        "solution_code": """# Production-Grade Solution: Enable ANSI Mode or Cast to BIGINT / Decimal
# Option A: Cast to LongType (BIGINT) before aggregating:
df_safe = df.withColumn("bytes_used", F.col("bytes_used").cast("bigint"))
df_safe.agg(F.sum("bytes_used")).show() # Correct: 2147483740

# Option B: Enable ANSI SQL compliance (Spark 3.0+ / Default in Spark 4.0):
spark.conf.set("spark.sql.ansi.enabled", "true")
# When overflow occurs, Spark immediately throws ArithmeticException: integer overflow,
# preventing negative numbers from corrupting production tables!""",
        "interview_takeaway": "Non-ANSI Spark wraps integer overflows silently into negative numbers; protect pipelines by casting accumulation columns to `BIGINT` and enabling `spark.sql.ansi.enabled = true`."
    },
    {
        "id": 93,
        "title": "Decimal Precision and Scale Truncation in Multi-Step Calculations",
        "category": "Type Conversion & Precision",
        "level": "Intermediate",
        "scenario": "A bond pricing pipeline performs repeated compound interest calculations on `DECIMAL(38, 18)` numbers. When multiplying two high-precision decimals, Spark SQL truncates fractional digits, turning numbers like `0.000000000000123456` into `0.000000`, causing bond yield calculations to round to zero.",
        "symptom": "Fractional decimals lose precision and round down to zero during multiplication or division chains.",
        "root_cause": "Spark SQL enforces a maximum decimal precision of 38 digits. When multiplying `DECIMAL(p1, s1)` and `DECIMAL(p2, s2)`, result precision is $p1 + p2 + 1$. Because precision cannot exceed 38, Spark caps precision at 38 and trims the scale ($s$), sacrificing fractional digits.",
        "failing_code": """-- Failing Spark SQL:
-- Decimal multiplication capping at 38 precision:
SELECT CAST(1.000000000000000001 AS DECIMAL(38, 18)) * 
       CAST(0.000000000000000001 AS DECIMAL(38, 18)) AS result;
-- Truncates scale, returning 0.000000!""",
        "solution_code": """-- Production-Grade Solution: Right-Size Precision or Use Double for Scientific Chains
-- Rule: Do not declare arbitrary DECIMAL(38, 18) when unnecessary!
-- Size precision and scale to the minimum required:
SELECT CAST(1.000001 AS DECIMAL(14, 6)) * CAST(0.000001 AS DECIMAL(14, 6)) AS result;
-- Result precision = 29 <= 38, scale is 100% preserved without truncation!

-- In PySpark, tune decimal loss of precision policy:
-- spark.conf.set("spark.sql.decimalOperations.allowPrecisionLoss", "false")
-- Throws an exception if precision loss would occur rather than silently rounding to zero!""",
        "interview_takeaway": "Spark decimals cap at 38 precision; multiplying two `DECIMAL(38, 18)` numbers forces scale reduction and fractional truncation. Right-size precision (e.g. `DECIMAL(18, 6)`) and set `allowPrecisionLoss = false`."
    },
    {
        "id": 94,
        "title": "Implicit String-to-Numeric Casting Preventing Partition Pruning",
        "category": "Type Conversion & Precision",
        "level": "Intermediate",
        "scenario": "A 50TB partitioned lakehouse table is physically partitioned by `date_key STRING` (e.g. `'20241031'`). A user queries `WHERE date_key = 20241031` (integer literal). Catalyst evaluates the predicate by applying `CAST(date_key AS INT)` to every single partition, disabling directory pruning and scanning all 50TB.",
        "symptom": "Query scans 100% of physical storage; execution time increases from 2 seconds to 25 minutes.",
        "root_cause": "When comparing a String column to an Integer literal, type precedence rules dictate that the String column must be cast to Integer: `CAST(date_key AS INT) = 20241031`. Because the partition column is wrapped in a function, it is non-sargable, preventing storage partition pruning.",
        "failing_code": """-- Failing Spark SQL:
-- Table partitioned by date_key STRING ('20241031')
SELECT *
FROM fact_sales
WHERE date_key = 20241031; -- Integer literal! Forces full table scan of 50TB!""",
        "solution_code": """-- Production-Grade Solution: Sargable Matching Predicate Types
-- Always match the exact datatype of the partition column:
SELECT *
FROM fact_sales
WHERE date_key = '20241031'; -- String literal! 

-- Catalyst immediately matches partition path 'date_key=20241031' and reads only 500MB!

-- In PySpark:
# df.filter(F.col("date_key") == F.lit("20241031")) # Explicit string literal""",
        "interview_takeaway": "Passing numeric literals to string partition columns wraps the column in an implicit `CAST()`, destroying partition pruning and forcing a full table scan; always match filter literal types to partition schema types."
    },
    {
        "id": 95,
        "title": "Lexicographical String Ordering Bug in Date Comparisons",
        "category": "Type Conversion & Precision",
        "level": "Intermediate",
        "scenario": "A reporting query filters for events after September 1st using string comparison: `WHERE event_date > '2024-9-1'`. Because dates were unpadded strings, the comparison `'2024-10-01' > '2024-9-1'` evaluates to FALSE in lexicographical ASCII comparison. All October and November records are excluded from Q4 reports.",
        "symptom": "October and November data is missing from Q4 revenue calculations.",
        "root_cause": "In ASCII string comparison, character `'1'` has a lower ordinal value than `'9'`. Therefore, string `'2024-10-01'` is lexicographically smaller than `'2024-9-1'`.",
        "failing_code": """-- Failing String Comparison:
SELECT *
FROM audit_logs
WHERE date_str > '2024-9-1';
-- '2024-10-01' > '2024-9-1' evaluates to FALSE! Omits entire month of October!""",
        "solution_code": """-- Production-Grade Solution: Use Strongly Typed Date/Timestamp Types
-- Always cast strings to DATE or TIMESTAMP for chronological comparisons:
SELECT *
FROM audit_logs
WHERE to_date(date_str, 'yyyy-M-d') > DATE '2024-09-01';

-- Best Practice: In lakehouse schemas, never store dates as raw unstructured strings.
-- Always declare them as DateType or TimestampNTZType with ISO-8601 formatting ('yyyy-MM-dd').""",
        "interview_takeaway": "String date comparisons follow ASCII alphabetical rules where `'2024-10'` is less than `'2024-9'`; always cast to `DateType` or enforce zero-padded ISO-8601 formatting (`'2024-09-01'`) for date filters."
    },
    {
        "id": 96,
        "title": "Unicode Normalization Form Mismatch Breaking String Joins",
        "category": "Type Conversion & Precision",
        "level": "Advanced",
        "scenario": "A European customer master table joins identity records from an iOS app and a Windows legacy database on `customer_name`. The name `'Renée'` fails to match across systems. Visually the strings appear identical, but the join drops 8% of European customers.",
        "symptom": "Identical-looking text fails string equality checks and join conditions.",
        "root_cause": "Unicode allows characters with accents to be represented in two forms: NFC (Canonical Decomposition followed by Canonical Composition: single code point `U+00E9`) and NFD (Canonical Decomposition: base letter `e` + combining acute accent `U+0301`). In binary string comparison, NFC and NFD strings have different byte sequences.",
        "failing_code": """# Failing PySpark Code:
# iOS writes NFD ('Rene\\u0301e'), Windows writes NFC ('Ren\\u00e9e')
df_ios = spark.createDataFrame([("Rene\\u0301e",)], ["name"])
df_win = spark.createDataFrame([("Ren\\u00e9e",)], ["name"])

joined = df_ios.join(df_win, on="name")
print(joined.count()) # Returns 0 matches!""",
        "solution_code": """# Production-Grade Solution: Unicode Normalization (NFC Standard)
from pyspark.sql import functions as F
import unicodedata

# Option A: In Spark SQL / Databricks, use native normalize function:
# SELECT * FROM df1 JOIN df2 ON normalize(df1.name, 'NFC') = normalize(df2.name, 'NFC');

# Option B: PySpark Vectorized UDF using unicodedata:
@F.pandas_udf("string")
def normalize_unicode(s: pd.Series) -> pd.Series:
    return s.apply(lambda val: unicodedata.normalize('NFC', val) if val else None)

df_ios_clean = df_ios.withColumn("name", normalize_unicode("name"))
df_win_clean = df_win.withColumn("name", normalize_unicode("name"))

joined = df_ios_clean.join(df_win_clean, on="name")
print(joined.count()) # Returns 1 match! Perfect equality!""",
        "interview_takeaway": "Visually identical international strings fail joins when encoded in different Unicode forms (NFC vs NFD); normalize all text columns using `normalize(col, 'NFC')` during bronze ingestion."
    },
    {
        "id": 97,
        "title": "Parquet INT96 Deprecation and Nanosecond Timestamp Shifts",
        "category": "Type Conversion & Precision",
        "level": "Advanced",
        "scenario": "A legacy Hive/Impala pipeline wrote Parquet files using the legacy `INT96` timestamp format. When migrating to Spark 3.x with modern Parquet readers, timestamps shift by hundreds of years (e.g. year 1870) or fail with `IllegalArgumentException: Parquet INT96 is deprecated`.",
        "symptom": "Timestamps show bizarre dates (years 1870 or 2060) or query fails with INT96 rebasing exceptions.",
        "root_cause": "Legacy Hive used INT96 (12 bytes) for timestamps without timezone metadata, based on the Julian calendar. Modern Spark 3.0+ uses INT64 with Gregorian calendar rebasing (`spark.sql.parquet.datetimeRebaseModeInRead`).",
        "failing_code": """# Failing Spark 3.x Parquet Read:
# Reading legacy INT96 Parquet table:
df = spark.read.parquet("s3://legacy/hive_int96_table/")
# Fails with SparkUpgradeException: You may see a different result from Spark 2.4 because 
# Spark 3.0 uses the Proleptic Gregorian calendar...""",
        "solution_code": """# Production-Grade Solution: Configure Parquet Rebase Mode & Modern Output Types
# Step 1: For reading legacy INT96 files safely in Spark 3.x:
spark.conf.set("spark.sql.parquet.datetimeRebaseModeInRead", "LEGACY")
spark.conf.set("spark.sql.parquet.int96RebaseModeInRead", "LEGACY")

# Step 2: For writing modern, standard-compliant Parquet / Delta files:
# Configure output format to INT64 TIMESTAMP_MICROS (Standard Parquet format):
spark.conf.set("spark.sql.parquet.outputTimestampType", "TIMESTAMP_MICROS")

# Step 3: Permanently rewrite legacy tables to modern Delta format to eliminate INT96 forever.""",
        "interview_takeaway": "Legacy Hive Parquet tables used deprecated INT96 Julian timestamps; set `spark.sql.parquet.int96RebaseModeInRead = 'LEGACY'` to read them safely, and standardize writes on INT64 `TIMESTAMP_MICROS` in Delta Lake."
    },
    {
        "id": 98,
        "title": "Binary Serialization Header Shifts in Kafka Avro and Protobuf Streams",
        "category": "Type Conversion & Precision",
        "level": "Advanced",
        "scenario": "A streaming ingestion pipeline parses Confluent Kafka Avro payloads using `from_avro()`. Deserialization throws `AvroRuntimeException: Not an Avro file` on every single record, failing the streaming pipeline.",
        "symptom": "`org.apache.avro.AvroRuntimeException: Not an Avro data file` on valid Kafka messages.",
        "root_cause": "Confluent Schema Registry prepends a 5-byte wire protocol header to every Kafka message (Magic Byte 0x00 + 4-byte Schema ID). Standard Apache Avro readers expect the raw binary payload; the extra 5-byte header breaks the Avro magic number parser.",
        "failing_code": """# Failing Streaming Code:
# Standard from_avro on Confluent wire format:
stream_df = spark.readStream.format("kafka").load()
# Fails because bytes 0-4 are Schema Registry metadata, not Avro record body:
parsed = stream_df.select(F.from_avro("value", avro_schema).alias("data"))""",
        "solution_code": """# Production-Grade Solution: Strip 5-Byte Confluent Header or Use Schema Registry Provider
from pyspark.sql import functions as F

# Option A: Strip the 5-byte Confluent header using substring:
# In PySpark, substring on binary operates on 1-based byte index:
# Byte 1: Magic byte (0x00)
# Bytes 2-5: Schema ID (4 bytes)
# Bytes 6+: Real Avro binary body!
clean_binary = stream_df.withColumn(
    "avro_body",
    F.expr("substring(value, 6, length(value) - 5)")
)
parsed = clean_binary.select(F.from_avro("avro_body", avro_schema).alias("data"))

# Option B: Use Databricks Confluent Schema Registry Native Integration:
# from_avro("value", schemaRegistryAddress="http://registry:8081") (automatically handles header!)""",
        "interview_takeaway": "Confluent Avro streams prepend a 5-byte wire-format header to Kafka messages; strip bytes 1-5 via `substring(value, 6)` before calling `from_avro()`, or configure native Schema Registry integration."
    },
    {
        "id": 99,
        "title": "Cross-Platform Float and NaN Serialization Discrepancies",
        "category": "Type Conversion & Precision",
        "level": "Architect",
        "scenario": "A machine learning feature store computes aggregations in PySpark, exports them to Parquet, and reads them with Python Pandas. In Pandas, `NaN` values in integer columns force the entire column to cast to `float64`. Downstream feature lookups on customer IDs like `1042.0` fail to match integer `1042`.",
        "symptom": "Model training features fail join lookups in production Python services due to `.0` float suffix.",
        "root_cause": "Legacy Pandas uses IEEE 754 `NaN` (float) to represent missing values in numeric series. When reading Parquet files with nullable integer columns, older Pandas runtimes automatically promote the integer column to `float64`.",
        "failing_code": """# Incompatible Workflow:
# PySpark writes nullable Integer: [1001, 1002, NULL]
df_spark.write.parquet("s3://features/customer_ids/")

# In Python service:
pdf = pd.read_parquet("s3://features/customer_ids/")
print(pdf["customer_id"].dtype) # float64! Values are [1001.0, 1002.0, NaN]
# Lookup on '1001' fails because Pandas holds 1001.0!""",
        "solution_code": """# Production-Grade Solution: Enforce Int64 Extension Array or Fill Imputation
# Option A: In Pandas 1.0+, use nullable Integer extension type 'Int64':
import pandas as pd
pdf = pd.read_parquet("s3://features/customer_ids/")
pdf["customer_id"] = pdf["customer_id"].astype("Int64") # Preserves integer representation with pd.NA!

# Option B: In PySpark, eliminate NULLs on primary keys prior to export:
df_clean = df_spark.filter(F.col("customer_id").isNotNull())

# Option C: Use string representation for high-precision entity identifiers:
df_spark = df_spark.withColumn("customer_id", F.col("customer_id").cast("string"))""",
        "interview_takeaway": "Legacy Pandas casts nullable integers to `float64` to accommodate `NaN`, causing ID corruption; store primary identifiers as `StringType` or enforce Pandas `Int64` nullable integer extension types across the ML serving boundary."
    },
    {
        "id": 100,
        "title": "Schema Evolution Type Narrowing Lockouts & ANSI SQL Compliance Migration",
        "category": "Type Conversion & Precision",
        "level": "Architect",
        "scenario": "An enterprise lakehouse with 500 pipelines migrates from Spark 2.4 to Spark 3.4 with ANSI SQL compliance (`spark.sql.ansi.enabled = true`). Over 100 batch pipelines fail on day one with `ArithmeticException: overflow`, `DateTimeParseException`, and `AnalysisException: Cannot cast STRING to BIGINT safely`. The team considers disabling ANSI mode, sacrificing data quality.",
        "symptom": "Massive pipeline failures across production after Spark runtime upgrade; jobs fail on strict casting rules.",
        "root_cause": "Spark 3+ ANSI mode changes default behavior from lenient (where overflows return NULL and bad casts return NULL) to strict standard SQL (which throws exceptions on invalid casts or overflows).",
        "failing_code": """# Legacy Pipeline Code that crashes under ANSI mode:
# 'abc' is not a number; under non-ANSI, cast returns NULL. Under ANSI mode, it crashes!
df.select(F.col("raw_token").cast("bigint")).show()
# Crashes with NumberFormatException: For input string: "abc"!""",
        "solution_code": """-- Production-Grade Solution: ANSI SQL Migration Strategy using TRY_ Functions
-- Step 1: Migrate brittle CAST expressions to ANSI-compliant TRY_CAST / TRY_TO_NUMBER:
-- TRY_CAST returns NULL on invalid conversion without crashing the query!
SELECT TRY_CAST(raw_token AS BIGINT) AS safe_token
FROM raw_logs;

-- Step 2: Use TRY_ADD, TRY_MULTIPLY, TRY_DIVIDE for safe arithmetic:
SELECT TRY_DIVIDE(numerator, denominator) AS safe_ratio
FROM metrics;

-- Step 3: For timestamps, use TRY_TO_TIMESTAMP:
SELECT TRY_TO_TIMESTAMP(raw_date, 'yyyy-MM-dd') AS safe_date
FROM raw_logs;

-- Result: Full ANSI compliance, zero pipeline crash risk, clean nullification of corrupt inputs!""",
        "interview_takeaway": "When migrating to ANSI SQL compliance in Spark 3.x/4.x, replace standard `CAST()` and arithmetic operators with `TRY_CAST()`, `TRY_TO_TIMESTAMP()`, and `TRY_DIVIDE()` to preserve fault-tolerant NULL semantics on malformed inputs."
    }
]
