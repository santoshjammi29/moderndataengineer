"""
Category 6: Nested Data, Arrays & Explode Explosions (Problems 51 - 60)
"""

CAT6_PROBLEMS = [
    {
        "id": 51,
        "title": "Querying Nested Struct Fields: Dot Notation vs Col Access Pitfalls",
        "category": "Nested Data & Arrays",
        "level": "Beginner",
        "scenario": "A data engineer writes a PySpark transformation to extract nested fields from a customer profile struct: `df.select('customer.address.city')`. When upstream sends a batch where the `address` struct itself is entirely missing from the schema, Spark throws `AnalysisException: No such struct field address in customer`.",
        "symptom": "`AnalysisException: No such struct field` halts the pipeline during Catalyst semantic analysis.",
        "root_cause": "Dot notation in string queries fails compilation if the nested field is not explicitly present in the schema definition. When schemas are dynamic or evolved, safe column access requires handling potential missing fields.",
        "failing_code": """# Failing PySpark Code:
# Schema in this batch only has: customer: struct<name: string> (missing address struct)
df = spark.read.json("s3://landing/profiles/")
# Throws AnalysisException: No such struct field address in customer
df.select("customer.address.city").show()""",
        "solution_code": """# Production-Grade Solution: Use Explicit Schema Definition or Safe Struct Access
from pyspark.sql.types import StructType, StructField, StringType
from pyspark.sql import functions as F

# Best Practice: Enforce explicit complete schema during read
expected_schema = StructType.fromJson(...) # defines customer.address.city as nullable

df = spark.read.schema(expected_schema).json("s3://landing/profiles/")
df.select(F.col("customer.address.city")).show()

# Alternatively, in Spark SQL, use try_element_at or safe struct expressions:
# SELECT try_eval(customer.address.city) FROM profiles;""",
        "interview_takeaway": "Never rely on schema inference for nested structs; provide an explicit schema where nested fields are declared nullable, ensuring queries against missing fields return NULL rather than crashing with `AnalysisException`."
    },
    {
        "id": 52,
        "title": "Memory Exhaustion from Naive Explode on Massive Arrays",
        "category": "Nested Data & Arrays",
        "level": "Beginner",
        "scenario": "An inventory report calculates total stock across retail stores. Each store row contains an array of 5,000 product stock objects. A junior engineer runs `F.explode('products')` on 1 million store records to calculate the sum of prices, multiplying the dataset from 1 million to 5 billion rows and crashing executors with OutOfMemoryError.",
        "symptom": "Physical row count multiplies 5,000x; Tungsten memory spills 300GB to disk before tasks crash with `java.lang.OutOfMemoryError: Java heap space`.",
        "root_cause": "`explode()` physically materializes every array element into an individual row, duplicating all other columns across the new rows and causing severe memory amplification.",
        "failing_code": """# Failing PySpark Code:
# stores_df has 1M rows; products array has 5,000 structs per store
stores_df = spark.read.table("silver.stores")

# Exploding 1M x 5,000 = 5 Billion Rows just to sum an attribute!
exploded = stores_df.withColumn("product", F.explode("products"))
summary = exploded.groupBy("store_id").agg(F.sum("product.price").alias("total_inventory_value"))""",
        "solution_code": """# Production-Grade Solution: Use Higher-Order Function aggregate() Without Exploding
from pyspark.sql import functions as F

# In-Place Array Aggregation: 0 row multiplication, 0 shuffle, 100x faster!
summary = stores_df.withColumn(
    "total_inventory_value",
    F.expr("aggregate(products, 0.0D, (acc, p) -> acc + p.price)")
).select("store_id", "total_inventory_value")

# In Spark SQL:
# SELECT store_id, aggregate(products, 0.0D, (acc, p) -> acc + p.price) AS total_inventory_value FROM stores;""",
        "interview_takeaway": "Never use `explode()` followed by `groupBy()` simply to calculate array aggregates; use the higher-order function `aggregate()` to compute totals in-place without multiplying rows or shuffling data."
    },
    {
        "id": 53,
        "title": "Preserving Records with Null or Empty Arrays using explode_outer",
        "category": "Nested Data & Arrays",
        "level": "Intermediate",
        "scenario": "A telecom billing pipeline explodes customer subscriptions to generate monthly line items. Out of 10 million customers, 500,000 are prepaid accounts with an empty array `subscriptions = []` or `NULL`. After calling `explode('subscriptions')`, all 500,000 prepaid customers disappear from the billing ledger.",
        "symptom": "Total customer count drops by 500,000 immediately after the explode transformation.",
        "root_cause": "`explode()` behaves like an INNER JOIN: rows where the array is `NULL` or empty `[]` are completely dropped from the resulting DataFrame.",
        "failing_code": """# Failing PySpark Code:
# 500,000 customers have subscriptions = [] or NULL
df = spark.read.table("customers")
# Silent drop of all 500k customers!
exploded = df.withColumn("sub", F.explode("subscriptions"))
print(exploded.select("customer_id").distinct().count()) # 9.5M instead of 10M!""",
        "solution_code": """# Production-Grade Solution: Use explode_outer()
from pyspark.sql import functions as F

# explode_outer() acts like a LEFT OUTER JOIN:
# Rows with empty or NULL arrays are preserved, emitting a single row with NULL for the exploded struct
exploded = df.withColumn("sub", F.explode_outer("subscriptions"))

# In Spark SQL:
# SELECT c.customer_id, s.* FROM customers c LATERAL VIEW OUTER explode(subscriptions) sub_table AS s;""",
        "interview_takeaway": "`explode()` drops rows where the array is empty or NULL; always use `explode_outer()` whenever you need to preserve the parent entity regardless of array cardinality."
    },
    {
        "id": 54,
        "title": "Maintaining Array Element Position with posexplode",
        "category": "Nested Data & Arrays",
        "level": "Intermediate",
        "scenario": "A clinical trial pipeline processes patient medication schedules stored as an ordered array of dosages: `['10mg', '20mg', '15mg']`. When exploded to analyze titration curves, the original order of administration is lost because distributed shuffle does not guarantee partition row order.",
        "symptom": "Medication sequence is randomized across distributed partitions; titration trends cannot be determined.",
        "root_cause": "`explode()` does not preserve or output array element indices; distributed row storage is inherently unordered without an explicit ordinal column.",
        "failing_code": """# Failing PySpark Code:
df = spark.read.table("patient_trials")
# Generates dosage rows, but sequence order (Day 1 vs Day 3) is lost:
df.select("patient_id", F.explode("dosages").alias("dosage")).show()""",
        "solution_code": """# Production-Grade Solution: Use posexplode() to Capture Element Position
from pyspark.sql import functions as F

# posexplode() outputs two columns: pos (0-based index) and col (the element value)
df_ordered = df.select(
    "patient_id",
    F.posexplode("dosages").alias("day_index", "dosage")
)

# In Spark SQL:
# SELECT patient_id, pos AS day_index, col AS dosage FROM patient_trials LATERAL VIEW posexplode(dosages) AS pos, col;""",
        "interview_takeaway": "When array order is significant (e.g. time-series, sequential trials), use `posexplode()` to capture the zero-based array index alongside the exploded value."
    },
    {
        "id": 55,
        "title": "Higher-Order Function transform() to Avoid Costly Explode-and-Group",
        "category": "Nested Data & Arrays",
        "level": "Intermediate",
        "scenario": "An ad-tech platform formats click URLs stored inside an array of impressions. The existing code explodes the array, applies string formatting, and runs `collect_list()` grouped by user. The pipeline takes 45 minutes and creates massive shuffle disk spill.",
        "symptom": "Stage contains two full shuffle exchanges (`Exchange hashpartitioning`) and heavy memory overhead in `collect_list`.",
        "root_cause": "Exploding an array to modify elements and re-aggregating with `collect_list()` is an anti-pattern that destroys data locality and forces expensive distributed shuffles.",
        "failing_code": """# Failing Anti-Pattern Code:
# Explode -> Transform -> Re-collect (2 shuffles!)
exploded = df.withColumn("url", F.explode("urls"))
modified = exploded.withColumn("url", F.lower(F.trim("url")))
recollected = modified.groupBy("user_id").agg(F.collect_list("url").alias("urls"))""",
        "solution_code": """# Production-Grade Solution: Use In-Place transform() (0 Shuffles!)
from pyspark.sql import functions as F

# transform() evaluates lambda expression on each element in-place within the existing row!
recollected = df.withColumn(
    "urls",
    F.expr("transform(urls, x -> lower(trim(x)))")
)

# In Spark SQL:
# SELECT user_id, transform(urls, x -> lower(trim(x))) AS urls FROM ad_impressions;""",
        "interview_takeaway": "Avoid the explode-and-recollect anti-pattern; use the higher-order function `transform(array, x -> expression)` to apply element-level transformations in-place with zero shuffle overhead."
    },
    {
        "id": 56,
        "title": "Higher-Order Function aggregate() for In-Array Running Totals",
        "category": "Nested Data & Arrays",
        "level": "Advanced",
        "scenario": "A gaming analytics engine calculates the cumulative experience points earned by a player across an array of match scores: `[100, 250, 50, 400]`. Exploding the array and running a window function over 50 million players causes executor container deaths.",
        "symptom": "Container killed by YARN/Kubernetes (Exit code 137) during window partitioning.",
        "root_cause": "Exploding 50 million arrays into 2 billion rows and running an analytical window function requires a full network shuffle and external sort across all player IDs.",
        "failing_code": """# Failing Window-Explode Anti-Pattern:
exploded = df.select("player_id", F.posexplode("match_scores").alias("match_idx", "score"))
w = Window.partitionBy("player_id").orderBy("match_idx")
running_scores = exploded.withColumn("running_total", F.sum("score").over(w))""",
        "solution_code": """# Production-Grade Solution: Custom In-Place Array Reduction with aggregate()
from pyspark.sql import functions as F

# aggregate(array, initial_state, merge_func, finish_func)
# Calculate total score directly inside the row:
total_scores = df.withColumn(
    "total_exp",
    F.expr("aggregate(match_scores, 0, (acc, x) -> acc + x)")
)

# To generate the running total array in-place without exploding:
running_array_df = df.withColumn(
    "running_totals",
    F.expr(\"\"\"
        aggregate(
            match_scores,
            named_struct('sum', 0, 'arr', array()),
            (acc, x) -> named_struct('sum', acc.sum + x, 'arr', array_union(acc.arr, array(acc.sum + x))),
            acc -> acc.arr
        )
    \"\"\")
)""",
        "interview_takeaway": "Use `aggregate(array, init, (acc, x) -> ...)` for in-array stateful reductions and running totals without blowing up row counts or invoking distributed window operators."
    },
    {
        "id": 57,
        "title": "Dynamically Flattening Deeply Nested Multi-Level Schemas via Recursion",
        "category": "Nested Data & Arrays",
        "level": "Advanced",
        "scenario": "A core banking migration requires flattening a JSON schema containing 8 levels of nested structs and arrays into a flat relational schema. Manually writing `select('a.b.c.d...')` for 400 fields is unmaintainable and breaks whenever upstream adds or renames nested attributes.",
        "symptom": "Hardcoded projection scripts become brittle, thousands of lines long, and fail on minor schema additions.",
        "root_cause": "Hierarchical schemas require dynamic recursive schema traversal to inspect `StructType` and `ArrayType` metadata programmatically at runtime.",
        "failing_code": """# Brittle Hardcoded Approach:
# Writing 400 lines of manual selections:
df.select(
    "id",
    "customer.details.name.first",
    "customer.details.name.last",
    "customer.address.home.street"
    # ... 400 manual lines that break on any schema change
)""",
        "solution_code": """# Production-Grade Solution: Generic Recursive Schema Flattener
from pyspark.sql.types import StructType, ArrayType
from pyspark.sql import functions as F

def flatten_dataframe(df):
    flat_cols = []
    nested_cols = []
    
    for field in df.schema.fields:
        if isinstance(field.dataType, StructType):
            for sub_field in field.dataType.fields:
                nested_cols.append(
                    F.col(f"{field.name}.{sub_field.name}").alias(f"{field.name}_{sub_field.name}")
                )
        elif isinstance(field.dataType, ArrayType):
            # Explode outer for arrays if desired, or retain as array
            flat_cols.append(F.col(field.name))
        else:
            flat_cols.append(F.col(field.name))
            
    df_transformed = df.select(flat_cols + nested_cols)
    
    # Recursively check if any struct fields remain
    has_struct = any(isinstance(f.dataType, StructType) for f in df_transformed.schema.fields)
    if has_struct:
        return flatten_dataframe(df_transformed)
    return df_transformed

# Clean, automated, handles arbitrary depths dynamically:
flat_df = flatten_dataframe(spark.read.json("s3://banking/complex_json/"))""",
        "interview_takeaway": "Use recursive metadata traversal over `df.schema.fields` to dynamically inspect `StructType` fields and project flattened alias expressions without hardcoding nested paths."
    },
    {
        "id": 58,
        "title": "Struct-of-Arrays vs Array-of-Structs Parquet Compression and Vectorization",
        "category": "Nested Data & Arrays",
        "level": "Advanced",
        "scenario": "A timeseries IoT platform stores 100 sensor readings per device heartbeat. The initial design uses an Array-of-Structs: `readings: ARRAY<STRUCT<sensor_id: INT, temp: DOUBLE, pressure: DOUBLE>>`. Analytical queries that only compute average `temp` scan the entire table, running 12x slower than expected and exhausting I/O bandwidth.",
        "symptom": "Parquet column projection fails to reduce read bytes; queries scanning 1 column read 90% of file size from S3/ADLS.",
        "root_cause": "In Parquet, an `ARRAY<STRUCT<...>>` interleaves all struct fields inside the same nested repetition/definition levels (Dremel encoding). The Parquet reader cannot cleanly isolate the `temp` physical column without reading the repetition markers for `sensor_id` and `pressure`.",
        "failing_code": """# Inefficient Array-of-Structs Design:
# Schema: ARRAY<STRUCT<sensor_id: INT, temp: DOUBLE, pressure: DOUBLE>>
df = spark.read.parquet("s3://iot/array_of_structs/")
# Reading just 'temp' still scans sensor_id and pressure data due to interleaved layout!
df.select(F.expr("transform(readings, x -> x.temp)")).write.format("noop").mode("overwrite").save()""",
        "solution_code": """# Production-Grade Solution: Struct-of-Arrays (Columnar Native Layout)
# Re-architect schema to Struct-of-Arrays:
# Schema: STRUCT<sensor_ids: ARRAY<INT>, temps: ARRAY<DOUBLE>, pressures: ARRAY<DOUBLE>>

# When querying temps:
df_optimized = spark.read.parquet("s3://iot/struct_of_arrays/")

# Parquet can now execute 100% pure columnar projection!
# It physically reads ONLY the 'temps' column chunks from disk, skipping 'sensor_ids' and 'pressures' entirely!
df_optimized.select("readings.temps").write.format("noop").mode("overwrite").save()
# Result: 75% reduction in read I/O, 4x faster query execution, superior Snappy compression!""",
        "interview_takeaway": "Array-of-Structs (`ARRAY<STRUCT>`) degrades Parquet columnar pruning because nested fields share definition levels; transform to Struct-of-Arrays (`STRUCT<ARRAY>`) to enable pure columnar sub-field projection and maximize compression."
    },
    {
        "id": 59,
        "title": "Vectorized from_json with Static Schema vs get_json_object Performance",
        "category": "Nested Data & Arrays",
        "level": "Architect",
        "scenario": "A real-time cybersecurity lakehouse parses 50 million JSON firewall logs per hour. The pipeline extracts 20 fields using `get_json_object(payload, '$.src_ip')`, `get_json_object(payload, '$.dest_ip')`, etc. The cluster requires 120 worker nodes to keep up with stream throughput, incurring $40,000/month in cloud compute.",
        "symptom": "CPU utilization on all executors is pegged at 100% in string parsing methods (`JacksonParser.nextToken()`); query throughput is severely bottlenecked.",
        "root_cause": "`get_json_object()` parses the raw JSON string from scratch independently for every single call. Extracting 20 fields parses the exact same string 20 separate times per row! Furthermore, `get_json_object` cannot be vectorized by Databricks Photon or Catalyst.",
        "failing_code": """# Failing Anti-Pattern (20 full JSON parses per row!):
parsed_df = raw_df.select(
    F.get_json_object("raw_json", "$.src_ip").alias("src_ip"),
    F.get_json_object("raw_json", "$.dest_ip").alias("dest_ip"),
    F.get_json_object("raw_json", "$.bytes_sent").alias("bytes_sent"),
    # ... 17 more get_json_object calls!
)""",
        "solution_code": """# Production-Grade Solution: Single-Pass from_json with Static Struct Schema
from pyspark.sql.types import StructType, StructField, StringType, LongType
from pyspark.sql import functions as F

# Define explicit static schema
firewall_schema = StructType([
    StructField("src_ip", StringType(), True),
    StructField("dest_ip", StringType(), True),
    StructField("bytes_sent", LongType(), True)
    # ... remaining fields
])

# Single-pass parsing with vectorized Jackson integration:
parsed_df = raw_df.withColumn("data", F.from_json("raw_json", firewall_schema)) \\
    .select("data.*")

# Cluster node count reduced from 120 nodes to 12 nodes (90% cost reduction)!""",
        "interview_takeaway": "Never use multiple `get_json_object()` calls on the same payload; use `from_json()` with a static schema to parse the entire JSON string in a single vectorized pass."
    },
    {
        "id": 60,
        "title": "Explode Join Multiplication in Graph Edge Generation",
        "category": "Nested Data & Arrays",
        "level": "Architect",
        "scenario": "A social network analytics pipeline generates a bidirectional follower graph from user profile documents. Each user has an array of `following_user_ids`. Joining the exploded follower edges back to a 200GB user attributes table generates massive shuffle write spikes of 4TB and crashes the cluster with disk exhaustion.",
        "symptom": "Shuffle service crashes with `No space left on device` as shuffle spill overwhelms local SSDs.",
        "root_cause": "Exploding edges creates high-cardinality foreign keys. Joining exploded edges before projecting necessary columns replicates wide user attribute payloads across billions of temporary rows.",
        "failing_code": """# Failing PySpark Code:
# user_profiles is 200GB (100 attributes per user)
exploded_edges = user_profiles.select("user_id", F.explode("following_ids").alias("target_id"))

# Joining exploded edges with the FULL 200GB user profiles table:
graph = exploded_edges.join(user_profiles, exploded_edges.target_id == user_profiles.user_id)
# Multiplies all 100 columns across 5 billion edges! Massive shuffle spill!""",
        "solution_code": """# Production-Grade Solution: Column Pruning and ID-Only Graph Traversal
# Step 1: Isolate ONLY minimal join keys for edge generation
minimal_profiles = user_profiles.select("user_id", "country_code") # Prune unneeded columns!

# Step 2: Generate pure lightweight adjacency pairs (LongType, LongType)
edges = user_profiles.select(
    F.col("user_id").alias("src"),
    F.explode("following_ids").alias("dst")
).repartition(400, "dst") # Balanced hash shuffle on primitive IDs

# Step 3: Join pruned attributes only after edge topology is computed:
enriched_graph = edges.join(minimal_profiles, edges.dst == minimal_profiles.user_id)""",
        "interview_takeaway": "When generating graph edges or exploding relationships, strictly prune DataFrame schemas down to primitive numeric IDs before the join, avoiding shuffle replication of wide attribute payloads."
    }
]
