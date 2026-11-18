"""
Category 3: Schema Drift, Polymorphism & Evolution (Problems 21 - 30)
"""

CAT3_PROBLEMS = [
    {
        "id": 21,
        "title": "Parquet Column Case Sensitivity and spark.sql.caseSensitive Collisions",
        "category": "Schema Drift & Evolution",
        "level": "Beginner",
        "scenario": "A legacy ingestion pipeline creates Parquet files where some files have column `CustomerId` while other files created by another service have `customerid`. When reading the combined directory with Spark's default configuration, queries either fail or produce inconsistent results.",
        "symptom": "`AnalysisException: Found duplicate column(s) in the table schema: customerid` or silent column nullification.",
        "root_cause": "By default, Spark SQL is case-insensitive (`spark.sql.caseSensitive = false`), but Parquet file metadata is strictly case-sensitive. When schema inference encounters both `CustomerId` and `customerid`, Catalyst treats them as duplicates or fails during partition resolution.",
        "failing_code": """# Failing PySpark Code:
# Directory contains files with both 'CustomerId' and 'customerid'
df = spark.read.parquet("s3://lake/legacy_customers/")
# Throws AnalysisException: Reference 'customerid' is ambiguous or duplicate""",
        "solution_code": """# Production-Grade Solution: Standardize Case Upstream or Normalize Schema
# Option 1: If reading case-sensitively to differentiate exact fields:
spark.conf.set("spark.sql.caseSensitive", "true")

# Option 2: Production Standard - Normalize column names immediately upon ingestion:
def normalize_schema(df):
    for col_name in df.columns:
        df = df.withColumnRenamed(col_name, col_name.lower().strip())
    return df

# When writing to Delta Lake, column mapping mode handles case preservation:
# ALTER TABLE table_name SET TBLPROPERTIES ('delta.columnMapping.mode' = 'name');""",
        "interview_takeaway": "Spark SQL is case-insensitive by default while storage formats like Parquet are case-sensitive; enforce lowercase snake_case schema normalization at the raw ingestion layer to prevent ambiguous reference exceptions."
    },
    {
        "id": 22,
        "title": "Missing Columns in Historical Parquet Partitions during Schema Evolution",
        "category": "Schema Drift & Evolution",
        "level": "Beginner",
        "scenario": "A data warehouse reads a partitioned Parquet table spanning 3 years. On October 1st, upstream added a new column `loyalty_tier`. When downstream analytical queries select `loyalty_tier` across the entire 3-year date range, Spark throws `AnalysisException: cannot resolve 'loyalty_tier'` because schema inference only inspected older partitions.",
        "symptom": "`AnalysisException: cannot resolve 'loyalty_tier' given input columns: [...]` when reading partitioned Parquet directories.",
        "root_cause": "To avoid slow cloud storage metadata scans, Spark's Parquet reader only infers schema from a subset of files (or summary metadata files). If older files lack the new column and summary metadata is absent, Spark assumes the column does not exist across the dataset.",
        "failing_code": """# Failing PySpark Code:
# Older partitions (2021-2023) lack loyalty_tier; 2024 partitions contain it
df = spark.read.parquet("s3://warehouse/fact_sales/")
df.select("customer_id", "loyalty_tier").show()
# Fails with AnalysisException: cannot resolve loyalty_tier""",
        "solution_code": """# Production-Grade Solution: Enable mergeSchema or Migrate to Delta Lake
# Option 1: Enable mergeSchema option during Parquet read
df = spark.read.option("mergeSchema", "true").parquet("s3://warehouse/fact_sales/")
df.select("customer_id", "loyalty_tier").show()
# Older partitions will automatically output NULL for loyalty_tier

# Option 2: (Best Practice) Convert legacy Parquet to Delta Lake:
# Delta maintains an explicit ACID transaction log that tracks schema evolution globally:
# CONVERT TO DELTA parquet.`s3://warehouse/fact_sales/`;""",
        "interview_takeaway": "Reading evolved Parquet partitions requires `.option('mergeSchema', 'true')` to merge schemas across historical files; adopting Delta Lake eliminates this overhead by maintaining the canonical schema in its ACID transaction log."
    },
    {
        "id": 23,
        "title": "JSON Payload Field Polymorphism (Primitive String vs JSON Object)",
        "category": "Schema Drift & Evolution",
        "level": "Intermediate",
        "scenario": "A telemetry pipeline ingests mobile device logs from IoT devices. In firmware v1, the `metadata` field was serialized as a plain string: `\"metadata\": \"offline_mode\"`. In firmware v2, it was upgraded to a nested object: `\"metadata\": {\"network\": \"5G\", \"battery\": 92}`. Spark's JSON reader crashes with a schema parsing mismatch.",
        "symptom": "`SparkException: Malformed records are detected in record parsing` or `metadata` column becomes NULL for entire batches.",
        "root_cause": "Spark's DataFrame schema is strictly typed. A column cannot simultaneously be of type `StringType` and `StructType`. Schema inference either picks StructType (causing string payloads to be marked malformed) or StringType (failing nested queries).",
        "failing_code": """# Failing PySpark Code:
# Batch contains both: {"metadata": "v1_plain"} and {"metadata": {"network": "5G"}}
schema = "device_id STRING, metadata STRUCT<network: STRING, battery: INT>"
df = spark.read.schema(schema).json("s3://iot/telemetry/")
df.show() # Rows with string metadata become NULL and land in _corrupt_record!""",
        "solution_code": """# Production-Grade Solution: Read Field as Raw String and Parse Conditionally
from pyspark.sql import functions as F
from pyspark.sql.types import StructType, StructField, StringType, IntegerType

# Step 1: Read the polymorphic field generically as raw STRING
raw_schema = "device_id STRING, metadata STRING"
df = spark.read.schema(raw_schema).json("s3://iot/telemetry/")

# Step 2: Define struct schema for complex variant
meta_struct_schema = StructType([
    StructField("network", StringType(), True),
    StructField("battery", IntegerType(), True)
])

# Step 3: Parse conditionally using from_json and regex detection
processed_df = df.withColumn(
    "is_json_object", F.col("metadata").startswith("{")
).withColumn(
    "parsed_metadata",
    F.when(F.col("is_json_object"), F.from_json(F.col("metadata"), meta_struct_schema))
     .otherwise(F.lit(None))
).withColumn(
    "legacy_metadata_str",
    F.when(~F.col("is_json_object"), F.col("metadata")).otherwise(F.lit(None))
)""",
        "interview_takeaway": "When upstream schemas exhibit polymorphic fields (e.g. primitive vs struct), read the column as raw `StringType` and use `from_json()` inside conditional `F.when()` expressions to deserialize valid JSON objects without dropping legacy strings."
    },
    {
        "id": 24,
        "title": "Delta Lake mergeSchema vs overwriteSchema Dynamics",
        "category": "Schema Drift & Evolution",
        "level": "Intermediate",
        "scenario": "A daily ETL job reloads an aggregated gold table with `mode('overwrite')`. One day, upstream changes a column name from `total_rev` to `revenue`. The engineer uses `.option('mergeSchema', 'true')` with overwrite. Unexpectedly, the resulting Delta table now has BOTH `total_rev` (all NULLs for today) and `revenue`, permanently bloating the table schema.",
        "symptom": "The table schema grows monotonically with dead legacy columns; queries selecting old column names return NULL instead of failing.",
        "root_cause": "`.option('mergeSchema', 'true')` with `mode('overwrite')` merges the incoming schema with the existing historical schema; it does NOT delete missing columns. To completely replace the schema, `overwriteSchema` is required.",
        "failing_code": """# Failing PySpark Code:
# Desired behavior: Replace table schema completely with incoming DataFrame schema
df_today = spark.read.table("silver.daily_sales") # has new column 'revenue' instead of 'total_rev'

df_today.write.format("delta") \\
    .mode("overwrite") \\
    .option("mergeSchema", "true") \\ # TRAP: Keeps total_rev in schema forever!
    .saveAsTable("gold.fact_sales")""",
        "solution_code": """# Production-Grade Solution: Use overwriteSchema for Intentional Full Redefinition
# When intentionally redefining the schema during a table overwrite:
df_today.write.format("delta") \\
    .mode("overwrite") \\
    .option("overwriteSchema", "true") \\ # Cleanly replaces table schema
    .saveAsTable("gold.fact_sales")

# Use mergeSchema strictly for append operations where new optional columns are added:
# df_incoming.write.format("delta").mode("append").option("mergeSchema", "true").saveAsTable("gold.fact_sales")""",
        "interview_takeaway": "In Delta Lake, `.option('mergeSchema', 'true')` unions the schemas and preserves legacy columns; use `.option('overwriteSchema', 'true')` with `mode('overwrite')` to intentionally drop old columns and reset the table schema definition."
    },
    {
        "id": 25,
        "title": "Data Type Widening Failures in Parquet Dictionary Encoding",
        "category": "Schema Drift & Evolution",
        "level": "Intermediate",
        "scenario": "A financial transaction ID column exceeds $2^{31}-1$ (2.14 billion), requiring a type migration from `IntegerType` (INT) to `LongType` (BIGINT). Upstream starts writing INT64 Parquet files. When Spark reads historical INT32 Parquet files alongside new INT64 files, the job crashes with `ParquetDecodingException`.",
        "symptom": "`org.apache.parquet.io.ParquetDecodingException: Can not read value at 0 in block 0 in file ... INT32 is not compatible with INT64`.",
        "root_cause": "Parquet physical encoding stores primitive types at the page level. Reading physical INT32 data as INT64 requires vectorization support or explicit widening. In older Spark runtimes, vectorized Parquet readers fail to promote physical INT32 to logical INT64 on the fly.",
        "failing_code": """# Failing PySpark Code:
# Table contains a mix of older INT32 Parquet files and new INT64 files
spark.conf.set("spark.sql.parquet.enableVectorizedReader", "true")

df = spark.read.schema("tx_id BIGINT, amount DOUBLE").parquet("s3://lake/transactions/")
df.count() # Crashes with ParquetDecodingException: INT32 not compatible with INT64""",
        "solution_code": """# Production-Grade Solution: Enable Type Widening or Fall Back Vectorized Reader
# Option 1: In Delta Lake 3.2+ / Databricks Runtime 13+, enable automatic Type Widening:
# ALTER TABLE transactions SET TBLPROPERTIES('delta.enableTypeWidening' = 'true');
# ALTER TABLE transactions CHANGE COLUMN tx_id TYPE BIGINT;

# Option 2: For standard Parquet, disable vectorized reader for the schema transition job:
spark.conf.set("spark.sql.parquet.enableVectorizedReader", "false")
# Non-vectorized reader safely promotes INT32 to INT64 in JVM memory

# Option 3: Standardize by rewriting historical partitions:
# spark.read.schema("tx_id INT, amount DOUBLE").parquet("s3://old/").withColumn("tx_id", F.col("tx_id").cast("BIGINT")).write...""",
        "interview_takeaway": "Vectorized Parquet readers reject physical type mismatches (INT32 vs INT64); resolve this by enabling Delta Lake Type Widening or temporarily disabling `spark.sql.parquet.enableVectorizedReader` during migration pipelines."
    },
    {
        "id": 26,
        "title": "Auto Loader schemaEvolutionMode rescue and _rescued_data Column Triage",
        "category": "Schema Drift & Evolution",
        "level": "Advanced",
        "scenario": "A cloud ingestion pipeline uses Databricks Auto Loader (`cloudFiles`) to ingest telemetry JSON files. An upstream team unexpectedly changes `user_id` from integer `12345` to UUID string `'usr_98124a'`. With schema evolution set to rescue, the pipeline doesn't fail, but analytical queries suddenly report that 100% of new users have `user_id = NULL`.",
        "symptom": "No pipeline failure occurs, but critical business columns turn NULL silently, and the hidden column `_rescued_data` inflates in size.",
        "root_cause": "When `cloudFiles.schemaEvolutionMode = 'rescue'` is used, any incoming data that does not match the inferred or declared schema (e.g. string value for an integer column) is diverted into the `_rescued_data` JSON column to prevent ingestion failure.",
        "failing_code": """# Failing Ingestion Pattern:
stream_df = spark.readStream.format("cloudFiles") \\
    .option("cloudFiles.format", "json") \\
    .option("cloudFiles.schemaLocation", "s3://lake/checkpoints/schema/") \\
    .option("cloudFiles.schemaEvolutionMode", "rescue") \\ # Silently rescues mismatches
    .load("s3://lake/raw_landing/")

# Downstream ignores _rescued_data:
stream_df.writeStream.format("delta").table("bronze.telemetry")
# user_id is typed as INT; string UUIDs become NULL in user_id and are rescued!""",
        "solution_code": """# Production-Grade Solution: Active Rescued Data Monitoring and Type Evolution
from pyspark.sql import functions as F

# 1. Configure Auto Loader with addNewColumns to allow safe widening:
stream_df = spark.readStream.format("cloudFiles") \\
    .option("cloudFiles.format", "json") \\
    .option("cloudFiles.schemaLocation", "s3://lake/checkpoints/schema/") \\
    .option("cloudFiles.schemaEvolutionMode", "addNewColumns") \\
    .load("s3://lake/raw_landing/")

# 2. Add an automated Data Quality alert check on _rescued_data:
def alert_on_rescued_data(batch_df, batch_id):
    rescued_count = batch_df.filter(F.col("_rescued_data").isNotNull()).count()
    if rescued_count > 0:
        # Trigger automated PagerDuty / Slack webhook alert:
        print(f"WARNING: Batch {batch_id} contained {rescued_count} rescued records due to schema drift!")
    batch_df.write.format("delta").mode("append").saveAsTable("bronze.telemetry")""",
        "interview_takeaway": "Auto Loader's `rescue` mode prevents pipeline downtime by diverting type mismatches to `_rescued_data`; always implement monitoring on `_rescued_data` to detect silent column nullification caused by breaking upstream type changes."
    },
    {
        "id": 27,
        "title": "Struct Field Reordering in Parquet Causing Misaligned Column Values",
        "category": "Schema Drift & Evolution",
        "level": "Advanced",
        "scenario": "A healthcare system stores patient address as a struct: `STRUCT<street: STRING, city: STRING>`. An external microservice writes Parquet files where the struct fields are ordered `STRUCT<city: STRING, street: STRING>`. When Spark reads the combined dataset, patient street addresses appear in the `city` column and city names appear in the `street` column.",
        "symptom": "Values are silently swapped between adjacent struct fields without any error or warning.",
        "root_cause": "Legacy Parquet readers resolve struct fields positionally (by ordinal index) rather than by name. If two fields share the same datatype (`StringType`), Spark maps physical field 0 to logical field 0 regardless of field names.",
        "failing_code": """# Failing PySpark Setup:
# File A written with: struct<street: "123 Main St", city: "Seattle">
# File B written with: struct<city: "Austin", street: "456 Oak Ave">

# Default Spark Parquet Reader without by-name resolution:
df = spark.read.parquet("s3://health/patients/")
df.select("address.city", "address.street").show()
# File B displays: city = "456 Oak Ave", street = "Austin"! SILENT CORRUPTION!""",
        "solution_code": """# Production-Grade Solution: Enable Name-Based Struct Resolution or Column Mapping
# Option 1: Tell Spark to resolve Parquet fields by Name rather than Position:
spark.conf.set("spark.sql.parquet.fieldId.enabled", "true")

# Option 2: In Delta Lake, enable Column Mapping by Name:
# ALTER TABLE patients SET TBLPROPERTIES (
#   'delta.columnMapping.mode' = 'name',
#   'delta.minReaderVersion' = '2',
#   'delta.minWriterVersion' = '5'
# );
# Delta column mapping guarantees that fields are strictly mapped by metadata UUID/name,
# completely preventing physical ordinal alignment corruption.""",
        "interview_takeaway": "Positional schema resolution in Parquet silently swaps data between struct fields of identical types; eliminate positional ambiguity by enabling Delta Lake Column Mapping (`delta.columnMapping.mode = 'name'`)."
    },
    {
        "id": 28,
        "title": "Schema Evolution during Streaming MERGE INTO Delta Tables",
        "category": "Schema Drift & Evolution",
        "level": "Advanced",
        "scenario": "A CDC stream merges real-time database updates into a Delta silver table using `foreachBatch` and `MERGE INTO`. When the source database adds a new column `middle_name`, the streaming micro-batch fails with `AnalysisException: Cannot resolve [middle_name] in target table`.",
        "symptom": "Streaming pipeline crashes on micro-batch execution; retries fail repeatedly, halting real-time ingestion.",
        "root_cause": "Delta Lake `MERGE INTO` does not automatically evolve the target table schema by default unless explicit Spark configuration flags or merge clauses permit schema evolution.",
        "failing_code": """# Failing PySpark Streaming foreachBatch:
def upsert_to_delta(microBatchDF, batchId):
    # Fails when microBatchDF contains new column not yet present in target Delta table
    microBatchDF.createOrReplaceTempView("updates")
    microBatchDF._jdf.sparkSession().sql(\"\"\"
        MERGE INTO silver_table t
        USING updates s
        ON t.id = s.id
        WHEN MATCHED THEN UPDATE SET *
        WHEN NOT MATCHED THEN INSERT *
    \"\"\")

streaming_df.writeStream.foreachBatch(upsert_to_delta).start()""",
        "solution_code": """# Production-Grade Solution: Enable Schema Evolution on Delta Merge
# Enable automatic schema evolution for Delta MERGE operations in Spark session:
spark.conf.set("spark.databricks.delta.schema.autoMerge.enabled", "true")

# Alternative: In standard Delta Lake (Open Source), use the Python DeltaTable API:
from delta.tables import DeltaTable

def upsert_to_delta_with_evolution(microBatchDF, batchId):
    deltaTable = DeltaTable.forName(spark, "silver_table")
    
    # spark.conf.set("spark.databricks.delta.schema.autoMerge.enabled", "true")
    # allows Delta to automatically ALTER the target table to add incoming columns:
    (deltaTable.alias("t")
     .merge(microBatchDF.alias("s"), "t.id = s.id")
     .whenMatchedUpdateAll()
     .whenNotMatchedInsertAll()
     .execute())

streaming_df.writeStream.foreachBatch(upsert_to_delta_with_evolution).start()""",
        "interview_takeaway": "Delta Lake `MERGE INTO` requires `spark.databricks.delta.schema.autoMerge.enabled = true` to automatically widen the target table schema during streaming CDC micro-batches without manual DDL intervention."
    },
    {
        "id": 29,
        "title": "Multi-Tenant Bronze Lakehouse Ingestion with Dynamic Schemas",
        "category": "Schema Drift & Evolution",
        "level": "Architect",
        "scenario": "A SaaS enterprise ingests telemetry payloads from 5,000 corporate clients into a single Bronze lakehouse table. Each client adds custom JSON properties at will. Attempting to maintain a single merged tabular schema results in a Delta table with over 15,000 columns, causing metastore exhaustion, massive transaction log metadata, and query planning timeouts.",
        "symptom": "Driver takes 10+ minutes during query planning phase in Catalyst; Spark UI shows excessive time spent in `Inferring Schema` and `Catalog.getTable()`.",
        "root_cause": "Wide schemas with thousands of columns degrade Parquet metadata size and Catalyst optimizer rule application times (quadratic complexity in column resolution).",
        "failing_code": """# Failing Architecture Pattern: Flattening all client schemas into one global table
# Every client's custom properties become physical table columns:
df_client = spark.read.json("s3://tenant-landing/*/*")
df_client.write.format("delta").mode("append").option("mergeSchema", "true").saveAsTable("bronze.all_tenants")
# Table schema grows to 15,000+ sparse columns! Catalyst planning collapses.""",
        "solution_code": """# Production-Grade Solution: Semi-Structured Raw Payload + Virtual Tenant Projections
from pyspark.sql import functions as F

# 1. Bronze Table Standard: Store invariant metadata + Raw JSON String
# Schema: tenant_id (STRING), event_id (STRING), ingestion_time (TIMESTAMP), raw_payload (STRING)
bronze_df = raw_stream.select(
    F.col("tenant_id"),
    F.col("event_id"),
    F.current_timestamp().alias("ingestion_time"),
    F.col("value").cast("string").alias("raw_payload")
)
bronze_df.write.format("delta").mode("append").saveAsTable("bronze.tenant_events")

# 2. Silver/Gold Projection: Project tenant-specific typed schemas using from_json or DBSQL views:
# CREATE VIEW tenant_acme_silver AS
# SELECT tenant_id, event_id, from_json(raw_payload, 'schema_acme') as data
# FROM bronze.tenant_events WHERE tenant_id = 'acme_corp';""",
        "interview_takeaway": "Never allow multi-tenant dynamic schemas to widen a single physical Delta table into thousands of columns; store semi-structured data as a raw string/variant in Bronze and project strongly typed schemas via tenant-specific views in Silver."
    },
    {
        "id": 30,
        "title": "Delta Lake Column Mapping and Zero-Copy Renames and Drops",
        "category": "Schema Drift & Evolution",
        "level": "Architect",
        "scenario": "A 100TB production Delta table requires renaming 5 columns and dropping a deprecated PII column (`ssn`) to comply with GDPR regulations. Prior to Delta Column Mapping, executing `ALTER TABLE ... DROP COLUMN` required a full rewrite of 100TB of Parquet files, incurring $12,000 in cloud compute and 18 hours of downtime.",
        "symptom": "Rewriting entire tables just to rename or drop columns creates massive I/O, cost spikes, and potential transaction conflict aborts.",
        "root_cause": "Standard Parquet files store column names in the file footer. Dropping or renaming columns traditionally required reading and rewriting every single Parquet file on storage.",
        "failing_code": """# Legacy Heavyweight Workaround:
# Full Table Rewrite required:
df = spark.read.table("gold.customers").drop("ssn")
df.write.format("delta").mode("overwrite").saveAsTable("gold.customers_new")
# Rewrites 100TB of data! Expensive and risky.""",
        "solution_code": """-- Production-Grade Solution: Delta Lake Column Mapping
-- Enable Column Mapping (stores column metadata via physical IDs, decoupling logical names from Parquet files)
ALTER TABLE gold.customers SET TBLPROPERTIES (
  'delta.columnMapping.mode' = 'name',
  'delta.minReaderVersion' = '2',
  'delta.minWriterVersion' = '5'
);

-- Zero-Copy Column Rename (Instant metadata update in Delta Log, 0 files rewritten):
ALTER TABLE gold.customers RENAME COLUMN cust_addr TO customer_address;

-- Zero-Copy Column Drop (Instant metadata soft-delete):
ALTER TABLE gold.customers DROP COLUMN ssn;

-- Purge physical data from underlying Parquet files during scheduled maintenance:
-- REORG TABLE gold.customers APPLY (PURGE);""",
        "interview_takeaway": "Delta Lake Column Mapping (`delta.columnMapping.mode = 'name'`) decouples logical SQL column names from physical Parquet storage keys, enabling instantaneous, zero-copy column renames and drops without rewriting underlying data files."
    }
]
