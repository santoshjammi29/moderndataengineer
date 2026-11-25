"""
Category 2: Nulls, Three-Valued Logic & Missing Data Traps (Problems 11 - 20)
"""

CAT2_PROBLEMS = [
    {
        "id": 11,
        "title": "NOT IN Subquery Returning Zero Rows Due to a Single NULL",
        "category": "Nulls & Three-Valued Logic",
        "level": "Beginner",
        "scenario": "A compliance reporting pipeline extracts active customers who have not received marketing opt-out notices. The query uses `WHERE customer_id NOT IN (SELECT customer_id FROM opt_out_notices)`. Although there are 5 million active customers and only 2,000 opt-outs, the query returns zero rows in production.",
        "symptom": "Query returns an empty result set (0 records) without throwing any syntax or runtime errors.",
        "root_cause": "Under ANSI three-valued logic (3VL), if the subquery returns even a single row with `customer_id IS NULL`, `x NOT IN (val1, val2, NULL)` evaluates to `UNKNOWN` (equivalent to FALSE). Because `x = NULL` is UNKNOWN, `NOT (UNKNOWN)` remains UNKNOWN, discarding every single record.",
        "failing_code": """-- Failing Spark SQL:
-- If opt_out_notices contains even 1 row where customer_id IS NULL, entire query returns 0 rows!
SELECT *
FROM customers
WHERE customer_id NOT IN (
    SELECT customer_id FROM opt_out_notices
);""",
        "solution_code": """-- Production-Grade Solution: Use NOT EXISTS or LEFT ANTI JOIN
-- Option A: NOT EXISTS (Null-Safe)
SELECT c.*
FROM customers c
WHERE NOT EXISTS (
    SELECT 1 FROM opt_out_notices o
    WHERE c.customer_id = o.customer_id
);

-- Option B: PySpark Left Anti Join (Optimized Catalyst Plan)
# df_customers.join(df_opt_outs, on="customer_id", how="left_anti")

-- Option C: If NOT IN is mandatory, explicitly filter NULLs in subquery:
-- WHERE customer_id NOT IN (SELECT customer_id FROM opt_out_notices WHERE customer_id IS NOT NULL)""",
        "interview_takeaway": "`NOT IN` with a nullable subquery is an infamous SQL trap: a single NULL collapses the entire predicate to UNKNOWN; always use `LEFT ANTI JOIN` or `NOT EXISTS` in production Spark pipelines."
    },
    {
        "id": 12,
        "title": "COUNT(column) vs COUNT(*) vs COUNT(1) Metric Inaccuracies",
        "category": "Nulls & Three-Valued Logic",
        "level": "Beginner",
        "scenario": "A financial KPI dashboard reports that total transactions dropped by 40% month-over-month. Upon investigation, total transactions did not drop; rather, a new mobile app release temporarily stopped sending optional `session_id` tags, and the pipeline calculated transaction count as `COUNT(session_id)`.",
        "symptom": "Executive metrics show phantom drops in business volume without any system outages or error alerts.",
        "root_cause": "`COUNT(column_name)` counts only non-null values for that specific column. `COUNT(*)` and `COUNT(1)` count all rows in the group regardless of nullability.",
        "failing_code": """# Failing PySpark Code:
tx_df = spark.read.table("lakehouse.transactions")

# session_id was made optional, introducing 40% NULLs
daily_metrics = tx_df.groupBy("tx_date").agg(
    F.count("session_id").alias("total_transactions"), # SILENT METRIC CORRUPTION
    F.sum("amount").alias("gross_revenue")
)""",
        "solution_code": """# Production-Grade Solution: Explicit COUNT(*) or COUNT(1) for Total Row Volume
from pyspark.sql import functions as F

daily_metrics = tx_df.groupBy("tx_date").agg(
    F.count(F.lit(1)).alias("total_transactions"), # Correctly counts all rows
    F.count("session_id").alias("sessions_with_id"),
    F.sum("amount").alias("gross_revenue")
)

# In Spark SQL:
# SELECT tx_date, COUNT(*) AS total_tx, COUNT(session_id) AS valid_sessions FROM transactions GROUP BY tx_date""",
        "interview_takeaway": "`COUNT(column)` ignores NULL values while `COUNT(*)` counts physical records; never use `COUNT(column)` for business volume metrics unless deliberately filtering missing values."
    },
    {
        "id": 13,
        "title": "Equality Comparison with NULL: col = NULL vs eqNullSafe (<=>)",
        "category": "Nulls & Three-Valued Logic",
        "level": "Beginner",
        "scenario": "A data quality reconciliation job checks whether records in staging match records in gold. When matching nullable discount codes (`discount_code = 'NONE'` or `NULL`), matching rows with `NULL` on both sides are dropped. The reconciliation flags 250,000 false-positive discrepancies.",
        "symptom": "Records with NULL on both source and target fail join or filter conditions and are reported as non-matching.",
        "root_cause": "In standard SQL, `NULL = NULL` is NOT TRUE; it evaluates to `NULL` (UNKNOWN). Therefore, `staging.discount_code = gold.discount_code` evaluates to NULL, dropping rows from INNER JOIN or equality checks.",
        "failing_code": """# Failing PySpark Code:
# Comparing two DataFrames with nullable columns
mismatches = staging_df.join(gold_df, on="record_id") \\
    .filter(staging_df["discount_code"] != gold_df["discount_code"])
# Rows where both are NULL are excluded from the comparison, silently hiding or creating discrepancies!""",
        "solution_code": """# Production-Grade Solution: Use eqNullSafe (<=>) Operator
from pyspark.sql import functions as F

# eqNullSafe (<=>) evaluates NULL <=> NULL as TRUE, and NULL <=> 'VALUE' as FALSE
mismatches = staging_df.join(gold_df, on="record_id") \\
    .filter(~(staging_df["discount_code"].eqNullSafe(gold_df["discount_code"])))

# In Spark SQL:
# SELECT * FROM staging s JOIN gold g ON s.record_id = g.record_id
# WHERE NOT (s.discount_code <=> g.discount_code)""",
        "interview_takeaway": "In SQL and Spark, `NULL = NULL` is UNKNOWN; always use the null-safe equality operator `<=>` (`eqNullSafe` in PySpark) when comparing nullable attributes or joining on nullable dimensions."
    },
    {
        "id": 14,
        "title": "Silent NULL Infiltration in String Concatenation",
        "category": "Nulls & Three-Valued Logic",
        "level": "Intermediate",
        "scenario": "A customer profile service concatenates name fields: `title`, `first_name`, `middle_name`, and `last_name` to create a `full_name` column. Customers with no middle name (60% of the customer base) end up with `full_name = NULL`.",
        "symptom": "Customer identity directory displays NULL for majority of user names, leading to critical downstream export failures.",
        "root_cause": "The SQL standard `CONCAT(a, b, c)` function returns `NULL` if any individual argument is `NULL`.",
        "failing_code": """# Failing PySpark Code:
users = spark.read.table("lakehouse.dim_users")
# If middle_name is NULL, entire full_name becomes NULL!
users_with_name = users.withColumn(
    "full_name",
    F.concat(F.col("first_name"), F.lit(" "), F.col("middle_name"), F.lit(" "), F.col("last_name"))
)""",
        "solution_code": """# Production-Grade Solution: Use concat_ws() or coalesce()
from pyspark.sql import functions as F

# concat_ws (Concatenate With Separator) automatically ignores NULL values!
users_with_name = users.withColumn(
    "full_name",
    F.concat_ws(" ", F.col("first_name"), F.col("middle_name"), F.col("last_name"))
)

# In Spark SQL:
# SELECT concat_ws(' ', first_name, middle_name, last_name) AS full_name FROM dim_users;""",
        "interview_takeaway": "`concat()` is poisoned by a single NULL operand; always use `concat_ws()` (concatenate with separator), which inherently skips NULL values and prevents silent data nullification."
    },
    {
        "id": 15,
        "title": "Outer Join Predicate Placement Turning Outer Joins into Inner Joins",
        "category": "Nulls & Three-Valued Logic",
        "level": "Intermediate",
        "scenario": "An audit query needs all registered suppliers, along with their active purchase orders if any exist. The developer writes a `LEFT OUTER JOIN` between suppliers and purchase orders, but adds `WHERE po.order_status = 'ACTIVE'`. As a result, all 10,000 suppliers with zero purchase orders are eliminated from the report.",
        "symptom": "Suppliers with no purchase orders are missing; query returns only suppliers who currently have active orders.",
        "root_cause": "The `WHERE` clause is evaluated after the `LEFT JOIN`. For suppliers with no purchase orders, `po.order_status` is `NULL`. The predicate `WHERE NULL = 'ACTIVE'` evaluates to FALSE, discarding all unmatched left-table rows and mutating the LEFT JOIN into an INNER JOIN.",
        "failing_code": """-- Failing Spark SQL:
SELECT s.supplier_id, s.supplier_name, po.order_id, po.amount
FROM suppliers s
LEFT JOIN purchase_orders po ON s.supplier_id = po.supplier_id
WHERE po.order_status = 'ACTIVE'; -- Kills the LEFT JOIN!""",
        "solution_code": """-- Production-Grade Solution: Move Filter Predicate into ON Join Condition
SELECT s.supplier_id, s.supplier_name, po.order_id, po.amount
FROM suppliers s
LEFT JOIN purchase_orders po
    ON s.supplier_id = po.supplier_id
    AND po.order_status = 'ACTIVE'; -- Filters right table BEFORE the join!

-- In PySpark:
# suppliers_df.join(
#     po_df.filter(F.col("order_status") == "ACTIVE"),
#     on="supplier_id",
#     how="left"
# )""",
        "interview_takeaway": "Filtering right-table columns in the `WHERE` clause eliminates rows with generated NULLs, turning a LEFT OUTER JOIN into an INNER JOIN; always push right-side predicates into the `ON` clause or pre-filter the right DataFrame."
    },
    {
        "id": 16,
        "title": "PySpark Namespace Collision: F.coalesce() vs DataFrame.coalesce()",
        "category": "Nulls & Three-Valued Logic",
        "level": "Intermediate",
        "scenario": "A data engineer attempting to replace null phone numbers with secondary phone numbers writes: `df.withColumn('phone', coalesce('primary_phone', 'secondary_phone'))`. However, because they did `from pyspark.sql.functions import *` and had existing DataFrame references, the pipeline throws `AttributeError` or runs partition reduction unexpectedly.",
        "symptom": "`TypeError: Invalid argument, not a string or column` or unexpected shuffle behavior.",
        "root_cause": "`DataFrame.coalesce(numPartitions)` reduces the number of partitions without shuffling. `pyspark.sql.functions.coalesce(*cols)` returns the first non-null column. In wildcard imports or careless aliasing, namespace collisions create obscure runtime errors.",
        "failing_code": """# Failing PySpark Code:
from pyspark.sql import *
from pyspark.sql.functions import *

# Ambiguous function resolution / anti-pattern wildcard import
# If coalesce is overwritten or called on wrong object:
df = spark.read.table("contacts")
df = df.withColumn("phone", coalesce("mobile", "home", "office"))""",
        "solution_code": """# Production-Grade Solution: Strict Namespace Aliasing
from pyspark.sql import functions as F

df = spark.read.table("contacts")

# F.coalesce strictly references the column-level null-replacement expression
df = df.withColumn(
    "phone",
    F.coalesce(F.col("mobile"), F.col("home"), F.col("office"), F.lit("NO_PHONE"))
)

# DataFrame.coalesce is used strictly for partition reduction:
# df = df.coalesce(4)""",
        "interview_takeaway": "Never use wildcard imports (`from pyspark.sql.functions import *`); always import `from pyspark.sql import functions as F` to prevent namespace collisions between `F.coalesce()` (null replacement) and `DataFrame.coalesce()` (partition reduction)."
    },
    {
        "id": 17,
        "title": "Window Frame Specification NULL Ordering in LAG and LEAD",
        "category": "Nulls & Three-Valued Logic",
        "level": "Advanced",
        "scenario": "A crypto exchange calculates the price delta between consecutive trades using `LAG(price) OVER (PARTITION BY symbol ORDER BY trade_timestamp)`. Due to an upstream sensor bug, 1% of trades have `trade_timestamp IS NULL`. In Spark SQL, the default ordering places NULLs first, resulting in distorted price deltas for the earliest legitimate trades.",
        "symptom": "The first legitimate trade of the day compares its price against a null timestamp trade, resulting in wrong deltas.",
        "root_cause": "In Spark SQL, default ascending order treats NULLs as the lowest value (`ASC NULLS FIRST`). If timestamps contain NULLs, they cluster at the start of the window frame, displacing the true earliest trades.",
        "failing_code": """# Failing PySpark Code:
from pyspark.sql.window import Window

trades = spark.read.table("lake.trades")
# Default orderBy places NULL timestamps first!
w = Window.partitionBy("symbol").orderBy("trade_timestamp")

trades_with_delta = trades.withColumn("prev_price", F.lag("price", 1).over(w)) \\
    .withColumn("price_delta", F.col("price") - F.col("prev_price"))""",
        "solution_code": """# Production-Grade Solution: Explicit Null Ordering & Pre-Filtering
from pyspark.sql.window import Window
from pyspark.sql import functions as F

# Step 1: Filter out or isolate corrupt trades with NULL timestamps
clean_trades = trades.filter(F.col("trade_timestamp").isNotNull())

# Step 2: Enforce explicit NULL ordering in Window definition
w = Window.partitionBy("symbol").orderBy(F.col("trade_timestamp").asc_nulls_last())

trades_with_delta = clean_trades.withColumn("prev_price", F.lag("price", 1).over(w)) \\
    .withColumn("price_delta", F.col("price") - F.col("prev_price"))

# In Spark SQL:
# LAG(price) OVER (PARTITION BY symbol ORDER BY trade_timestamp ASC NULLS LAST)""",
        "interview_takeaway": "Spark's default sort behavior is `ASC NULLS FIRST`; in time-series window functions (`LAG`, `LEAD`), always specify `asc_nulls_last()` or filter NULL timestamps upstream to avoid window boundary poisoning."
    },
    {
        "id": 18,
        "title": "Null Key Shuffling to a Single Reducer during repartition(col)",
        "category": "Nulls & Three-Valued Logic",
        "level": "Advanced",
        "scenario": "A data engineer wants to prepare a 1TB dataset for high-speed downstream filtering by running `df.repartition(200, 'region_code')`. Because 25% of legacy records have `region_code IS NULL`, the repartitioning job creates 199 partitions of ~3.7GB and 1 partition of 250GB, causing severe out-of-memory errors in downstream stages.",
        "symptom": "Downstream jobs fail with `FetchFailedException` or `GC overhead limit exceeded` when reading the single 250GB partition.",
        "root_cause": "Hash partitioning computes hash codes using `Murmur3Hash`. All NULL values yield a hash of 0 (or a fixed bucket), sending all 250GB of NULL records into a single physical partition.",
        "failing_code": """# Failing PySpark Code:
df = spark.read.parquet("s3://lake/raw_transactions/")
# 25% of rows have region_code = NULL
repartitioned_df = df.repartition(200, "region_code")
repartitioned_df.write.format("parquet").save("s3://lake/partitioned_tx/")""",
        "solution_code": """# Production-Grade Solution: Salt NULLs Before Repartitioning
from pyspark.sql import functions as F

# Assign random synthetic keys to NULLs so they scatter across all 200 partitions
salted_df = df.withColumn(
    "repart_key",
    F.when(F.col("region_code").isNull(), F.concat(F.lit("NULL_"), F.floor(F.rand() * 200)))
     .otherwise(F.col("region_code"))
)

repartitioned_df = salted_df.repartition(200, "repart_key").drop("repart_key")
repartitioned_df.write.format("parquet").save("s3://lake/partitioned_tx/")""",
        "interview_takeaway": "`df.repartition(N, 'col')` routes all NULL values to a single partition; when partitioning on a nullable column with high nullity, salt the NULL values with random integers to distribute them evenly across physical partitions."
    },
    {
        "id": 19,
        "title": "Three-Valued Logic in CASE WHEN Expressions Without ELSE Default",
        "category": "Nulls & Three-Valued Logic",
        "level": "Advanced",
        "scenario": "A medical risk model categorizes patient blood pressure using a `CASE WHEN` statement: `CASE WHEN bp < 120 THEN 'NORMAL' WHEN bp >= 120 THEN 'ELEVATED' END`. Upstream sensor telemetry frequently sends `bp = NULL`. Because there is no `ELSE` branch, these records become `NULL`, breaking downstream mandatory categorical encoders.",
        "symptom": "Downstream ML feature pipeline crashes with `IllegalArgumentException: Field status contains unexpected null values`.",
        "root_cause": "If no `WHEN` clause evaluates to TRUE and no `ELSE` clause is specified, SQL `CASE WHEN` defaults to `NULL`. With three-valued logic, `NULL < 120` is UNKNOWN and `NULL >= 120` is UNKNOWN, falling through to the omitted ELSE.",
        "failing_code": """-- Failing Spark SQL:
SELECT patient_id,
       CASE
           WHEN systolic < 120 THEN 'NORMAL'
           WHEN systolic >= 120 AND systolic < 140 THEN 'ELEVATED'
           WHEN systolic >= 140 THEN 'HIGH'
       END AS bp_category -- Missing ELSE! If systolic is NULL, returns NULL
FROM vitals_stream;""",
        "solution_code": """-- Production-Grade Solution: Explicit Null Check and Fallback ELSE Clause
SELECT patient_id,
       CASE
           WHEN systolic IS NULL THEN 'UNKNOWN_MISSING'
           WHEN systolic < 120 THEN 'NORMAL'
           WHEN systolic < 140 THEN 'ELEVATED'
           ELSE 'HIGH'
       END AS bp_category
FROM vitals_stream;

-- In PySpark:
# F.when(F.col("systolic").isNull(), "UNKNOWN_MISSING") \\
#  .when(F.col("systolic") < 120, "NORMAL") \\
#  .when(F.col("systolic") < 140, "ELEVATED") \\
#  .otherwise("HIGH")""",
        "interview_takeaway": "In SQL `CASE WHEN` constructs, omitted `ELSE` clauses silently evaluate to `NULL`; in production pipelines, always provide an explicit `otherwise()`/`ELSE` clause and handle NULL input states explicitly."
    },
    {
        "id": 20,
        "title": "Enforcing Non-Null Constraints in Delta Lake & Handling Ingestion Violations",
        "category": "Nulls & Three-Valued Logic",
        "level": "Architect",
        "scenario": "An enterprise lakehouse serves a gold dimensional table `dim_customers`. Business requirements mandate that `customer_id` and `tax_id` must never be NULL. However, periodic ingestion batches containing corrupted NULL tax IDs cause the entire pipeline write to fail midway, leaving the orchestration DAG in a failed state.",
        "symptom": "`DeltaInvariantViolationException: CHECK constraint check_tax_id (tax_id IS NOT NULL) violated by row with tax_id: null`.",
        "root_cause": "Delta Lake CHECK constraints and NOT NULL invariants abort the entire transaction when a single violating row is encountered to preserve ACID guarantees.",
        "failing_code": """-- Failing Setup:
ALTER TABLE gold.dim_customers ADD CONSTRAINT check_tax_id CHECK (tax_id IS NOT NULL);

-- Later, an ingestion batch with 1 NULL tax_id out of 10 million rows fails the entire job:
-- df.write.format("delta").mode("append").saveAsTable("gold.dim_customers")""",
        "solution_code": """# Production-Grade Solution: Zero-Loss Quarantine Split Before Gold Append
from pyspark.sql import functions as F

incoming_df = spark.read.table("silver.customers_staging")

# Split incoming batch into Valid Records and Quarantine Records
valid_records = incoming_df.filter(F.col("customer_id").isNotNull() & F.col("tax_id").isNotNull())
quarantined_records = incoming_df.filter(F.col("customer_id").isNull() | F.col("tax_id").isNull()) \\
    .withColumn("quarantine_reason", F.lit("VIOLATION: tax_id or customer_id IS NULL")) \\
    .withColumn("quarantine_timestamp", F.current_timestamp())

# 1. Append valid records safely to Gold (guaranteed to satisfy constraints)
valid_records.write.format("delta").mode("append").saveAsTable("gold.dim_customers")

# 2. Divert corrupt records to Dead-Letter Quarantine table for automated alerting
quarantined_records.write.format("delta").mode("append").saveAsTable("audit.quarantined_customers")""",
        "interview_takeaway": "Delta Lake constraints strictly enforce ACID integrity by throwing invariant exceptions on violation; protect production pipelines by implementing a pre-write split pattern that diverts violating rows to a quarantine table while committing valid records."
    }
]
