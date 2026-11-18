"""
Category 9: Join Explosions, Cartesian Products & Cardinality Blowups (Problems 81 - 90)
"""

CAT9_PROBLEMS = [
    {
        "id": 81,
        "title": "Accidental Cartesian Product (CROSS JOIN) from Omitted Join Predicate",
        "category": "Join Explosions & Cardinality",
        "level": "Beginner",
        "scenario": "A query joins a 10-million row fact table with a 50,000-row dimension table. The developer accidentally writes `FROM sales, stores` without a `WHERE sales.store_id = stores.store_id` predicate. The query attempts to generate $10,000,000 \\times 50,000 = 500,000,000,000$ (500 billion) rows, crashing the cluster.",
        "symptom": "`AnalysisException: Detected implicit cartesian product for INNER join between logical plans... Use the CROSS JOIN syntax to allow cartesian products` or executor disk fill-up.",
        "root_cause": "Omitting a join condition creates a Cartesian product where every row of the left table joins with every row of the right table.",
        "failing_code": """-- Failing Spark SQL:
-- Omitted join predicate:
SELECT *
FROM sales_fact, store_dim; -- Cartesian explosion!""",
        "solution_code": """-- Production-Grade Solution: Explicit ANSI JOIN Syntax with Equi-Join Predicate
SELECT *
FROM sales_fact s
INNER JOIN store_dim d ON s.store_id = d.store_id;

-- Best Practice: Never use legacy comma-separated table syntax ('FROM a, b').
-- Enforce spark.sql.crossJoin.enabled = false in cluster configuration so that
-- accidental Cartesian products fail immediately during query planning rather than wasting compute!""",
        "interview_takeaway": "Legacy comma-separated joins easily cause accidental Cartesian explosions; always use explicit ANSI `INNER JOIN ... ON` syntax and set `spark.sql.crossJoin.enabled = false` to intercept missing join keys during planning."
    },
    {
        "id": 82,
        "title": "Many-to-Many Join Multiplying Fact Row Counts Silently",
        "category": "Join Explosions & Cardinality",
        "level": "Beginner",
        "scenario": "An analytics query joins an `orders` table (1M rows) with a `customer_addresses` table. Because customers have multiple historical shipping addresses, each order joins with an average of 4 addresses. The output row count explodes from 1 million to 4 million, quadrupling the reported order revenue in the executive BI report.",
        "symptom": "Analytical BI reports show revenue inflated by 400%; financial reconciliation audits fail.",
        "root_cause": "A 1:N or N:M relationship in what was assumed to be a 1:1 dimension lookup multiplies matching fact rows.",
        "failing_code": """# Failing PySpark Code:
orders = spark.read.table("gold.orders")             # 1M rows
addresses = spark.read.table("silver.addresses")     # Has 4 addresses per customer!

# Many-to-many join explosion:
exploded_orders = orders.join(addresses, on="customer_id", how="inner")
print(exploded_orders.count()) # 4M rows! Revenue is 4x too high!""",
        "solution_code": """# Production-Grade Solution: Filter to Active / Default Dimension Entity Pre-Join
# Filter dimension to exactly 1 row per entity (e.g. current default address):
current_addresses = addresses.filter(F.col("is_default_shipping") == True)

# Safe 1:1 join:
clean_orders = orders.join(current_addresses, on="customer_id", how="inner")

# Automated Pipeline Test Assertion:
# assert clean_orders.count() == orders.count(), "INTEGRITY VIOLATION: Join multiplied fact rows!" """,
        "interview_takeaway": "Joining facts with multi-record dimensions silently multiplies financial metrics; filter dimensions to unique primary keys (e.g. `is_current = true`) before joining and assert that row counts do not expand."
    },
    {
        "id": 83,
        "title": "Inadvertent Full Outer Join Exploding Table Size on Non-Matching Keys",
        "category": "Join Explosions & Cardinality",
        "level": "Intermediate",
        "scenario": "A data integration pipeline combines clickstream events from Web and Mobile apps. An engineer attempts to unify them using `FULL OUTER JOIN` on `session_id`. However, web and mobile apps generate completely disjoint session ID schemes (`web_xxx` vs `mob_yyy`). The join produces 0 matches, outputting a massive sparse table containing 100% NULLs on opposite sides.",
        "symptom": "Table size doubles; output contains billions of rows that are 50% NULL.",
        "root_cause": "Full Outer Join preserves all rows from both tables. When join keys are disjoint (0 overlap), `FULL OUTER JOIN` degenerates into a row union with double the width and full null-padding.",
        "failing_code": """-- Failing Spark SQL:
-- Web and mobile have disjoint session IDs:
SELECT *
FROM web_clicks w
FULL OUTER JOIN mobile_clicks m ON w.session_id = m.session_id;
-- 0 matches! Generates 100M + 100M = 200M rows with 50% NULL columns!""",
        "solution_code": """-- Production-Grade Solution: UnionByName for Disjoint Datasets
-- When unifying disjoint sources representing the same logical entity, use UNION ALL / unionByName:
SELECT 'WEB' AS platform, session_id, url AS page, event_time FROM web_clicks
UNION ALL
SELECT 'MOBILE' AS platform, session_id, screen_name AS page, event_time FROM mobile_clicks;

-- In PySpark:
# df_web.select("session_id", "page", "event_time").unionByName(df_mob.select("session_id", "page", "event_time"))""",
        "interview_takeaway": "Do not use `FULL OUTER JOIN` to merge disparate event streams sharing no common join keys; use `UNION ALL` or `unionByName()` to stack schemas vertically without creating sparse null-padded Cartesian row overhead."
    },
    {
        "id": 84,
        "title": "Non-Equi Join Performance Collapse and Cartesian Fallback",
        "category": "Join Explosions & Cardinality",
        "level": "Intermediate",
        "scenario": "A currency exchange pipeline converts transaction amounts using an exchange rates table that changes daily. The join condition is written as: `ON tx.currency = fx.currency AND tx.tx_time >= fx.valid_from AND tx.tx_time < fx.valid_to`. Catalyst cannot use a Hash or SortMergeJoin due to the inequalities, and query runtime balloons from 3 minutes to 4 hours.",
        "symptom": "Spark UI shows physical plan `CartesianProduct` or `SortMergeJoin` with massive residual filter time; execution is painfully slow.",
        "root_cause": "Hash joins and SortMergeJoins require at least one equi-join predicate (`a = b`). Pure range or inequality conditions prevent hash-based bucketing, forcing Catalyst to perform quadratic $O(M \\times N)$ comparisons.",
        "failing_code": """-- Failing Spark SQL:
SELECT tx.*, fx.rate * tx.amount AS usd_amount
FROM transactions tx
JOIN exchange_rates fx
    ON tx.currency = fx.currency
    AND tx.tx_timestamp >= fx.valid_from
    AND tx.tx_timestamp < fx.valid_to; -- Non-equi range check!""",
        "solution_code": """-- Production-Grade Solution: Discrete Date-Key Equi-Join Pre-Expansion
-- Step 1: Pre-join or expand FX rates to discrete daily calendar dates:
-- Create a daily fx lookup: (currency, date, rate)

-- Step 2: Rewrite join with an exact equi-join on BOTH currency AND date:
SELECT tx.*, fx.rate * tx.amount AS usd_amount
FROM transactions tx
JOIN exchange_rates_daily fx
    ON tx.currency = fx.currency
    AND to_date(tx.tx_timestamp) = fx.rate_date; -- Pure Equi-Join!

-- Catalyst now uses high-speed BroadcastHashJoin or SortMergeJoin (runs in 45 seconds)!""",
        "interview_takeaway": "Catalyst cannot hash-partition on inequality predicates; convert continuous range conditions into discrete calendar date equi-joins (`to_date(event_time) = fx.date`) to unlock high-speed SortMerge or BroadcastHash joins."
    },
    {
        "id": 85,
        "title": "Range Join Optimization for Point-in-Interval IP-to-Country Lookups",
        "category": "Join Explosions & Cardinality",
        "level": "Intermediate",
        "scenario": "A cybersecurity pipeline resolves 100 million client IP addresses to geographic countries using a MaxMind GeoIP database containing 4 million CIDR ranges: `WHERE client_ip_num BETWEEN range_start AND range_end`. The query triggers a Cartesian join and runs out of memory.",
        "symptom": "Job fails with `OutOfMemoryError` or runs for hours with 0 progress in `CartesianProductExec`.",
        "root_cause": "Point-in-interval queries (`A BETWEEN start AND end`) are non-equi joins. Without an exact equality key, Spark must test every IP against all 4 million IP blocks.",
        "failing_code": """-- Failing Spark SQL:
SELECT l.ip_string, g.country_code
FROM web_logs l
JOIN geo_ip_ranges g
    ON l.ip_numeric >= g.start_ip
    AND l.ip_numeric <= g.end_ip; -- Triggers Cartesian Product!""",
        "solution_code": """-- Production-Grade Solution: Range-Binning Equi-Join Optimization
-- Step 1: Deconstruct IP addresses into 16-bit prefix bins (Class B / /16 blocks = 65,536 bins)
-- Add bin_id = floor(ip_numeric / 65536) to both logs and IP ranges

-- Step 2: Expand geo ranges that span multiple bins using explode(sequence(start_bin, end_bin))
-- Step 3: Join on the equi-key bin_id FIRST, then apply residual range filter:
SELECT l.ip_string, g.country_code
FROM (
    SELECT *, floor(ip_numeric / 65536) AS ip_bin FROM web_logs
) l
JOIN geo_ranges_binned g
    ON l.ip_bin = g.range_bin -- EQUI-JOIN eliminates 99.99% of candidates!
    AND l.ip_numeric >= g.start_ip
    AND l.ip_numeric <= g.end_ip;

-- In Databricks, native Range Join Optimization can also be enabled:
-- spark.conf.set("spark.databricks.optimizer.rangeJoin.enabled", "true")""",
        "interview_takeaway": "Optimize point-in-interval range joins by discretizing ranges into coarse equi-join hash bins (e.g. 16-bit prefix bins) to eliminate 99.9% of candidate pairs before evaluating the inequality."
    },
    {
        "id": 86,
        "title": "Semi Join vs Inner Join + Distinct Performance Differential",
        "category": "Join Explosions & Cardinality",
        "level": "Advanced",
        "scenario": "A marketing pipeline finds all customers who made a purchase in the last 30 days. The developer writes: `SELECT DISTINCT c.* FROM customers c JOIN orders o ON c.id = o.customer_id`. With 200 million orders and 10 million customers, the join creates 150 million intermediate rows and forces a massive distributed distinct shuffle.",
        "symptom": "Stage spills 120GB to disk during the `DISTINCT` aggregation phase after the join.",
        "root_cause": "`INNER JOIN` multiplies customer rows for every matching order, and `DISTINCT` must then deduplicate all columns across the network. A `LEFT SEMI JOIN` stops scanning the right table as soon as the first match is found, emitting each customer at most once without duplication.",
        "failing_code": """-- Inefficient Anti-Pattern: Inner Join + Distinct
SELECT DISTINCT c.customer_id, c.name, c.email, c.tier
FROM customers c
INNER JOIN orders o ON c.customer_id = o.customer_id; -- Multiplies rows, forces heavy DISTINCT shuffle!""",
        "solution_code": """-- Production-Grade Solution: LEFT SEMI JOIN (Zero Row Multiplication!)
SELECT c.customer_id, c.name, c.email, c.tier
FROM customers c
LEFT SEMI JOIN orders o ON c.customer_id = o.customer_id;

-- In PySpark:
# customers.join(orders, on="customer_id", how="left_semi")

-- Catalyst short-circuits on first order match per customer.
-- 0 row multiplication, 0 intermediate duplicate rows, 0 DISTINCT shuffle! 5x faster!""",
        "interview_takeaway": "Never use `INNER JOIN` + `DISTINCT` when filtering for entity existence; use `LEFT SEMI JOIN` to short-circuit on the first match, preventing row multiplication and eliminating expensive distinct shuffles."
    },
    {
        "id": 87,
        "title": "Anti Join with NULL Keys Silently Discarding Records",
        "category": "Join Explosions & Cardinality",
        "level": "Advanced",
        "scenario": "A churn analysis query identifies inactive users who have not logged in for 90 days. The query is written as: `WHERE user_id NOT IN (SELECT user_id FROM logins_90d)`. A single test user record has `user_id = NULL` in `logins_90d`. The query returns 0 churned users.",
        "symptom": "Zero results returned in production without syntax or schema errors.",
        "root_cause": "Under SQL ANSI 3-valued logic, `x NOT IN (..., NULL)` is UNKNOWN. A `LEFT ANTI JOIN` avoids this trap because it operates on equality semantics rather than subquery value set expansion.",
        "failing_code": """-- Failing Subquery Pattern:
SELECT *
FROM users
WHERE user_id NOT IN (SELECT user_id FROM logins_90d); -- Single NULL kills entire query!""",
        "solution_code": """-- Production-Grade Solution: LEFT ANTI JOIN
SELECT u.*
FROM users u
LEFT ANTI JOIN logins_90d l ON u.user_id = l.user_id;

-- In PySpark:
# inactive_users = users.join(logins_90d, on="user_id", how="left_anti")

-- Left Anti Join guarantees correct exclusion regardless of NULLs on either side!""",
        "interview_takeaway": "`NOT IN` collapses to empty when the target subquery contains NULLs; use `LEFT ANTI JOIN` in Spark to guarantee accurate entity exclusion and optimal Catalyst join planning."
    },
    {
        "id": 88,
        "title": "Join Order Optimization Collapse in Multi-Table Snowflake Queries",
        "category": "Join Explosions & Cardinality",
        "level": "Advanced",
        "scenario": "An enterprise reporting query joins 7 tables: 1 massive fact table (5 billion rows) and 6 dimension tables. Catalyst generates an execution plan that joins the 5-billion-row fact table with a large dimension first, generating a 20-billion-row intermediate shuffle, instead of filtering small dimensions first.",
        "symptom": "Query takes 3 hours. Spark UI shows intermediate shuffle stages handling billions of unneeded records.",
        "root_cause": "Spark Cost-Based Optimizer (CBO) is disabled by default (`spark.sql.cbo.enabled = false`) or lacks accurate table/column statistics. Without statistics, Catalyst evaluates joins in left-to-right syntactic order or uses simple heuristics, picking suboptimal join trees.",
        "failing_code": """# Failing Setup: CBO disabled, missing statistics
spark.conf.set("spark.sql.cbo.enabled", "false")

# 7-table join executed in naive order:
df = fact.join(dim1, "k1").join(dim2, "k2").join(dim3, "k3").join(dim4, "k4")...""",
        "solution_code": """# Production-Grade Solution: Enable CBO and Compute Table Statistics
-- Step 1: Compute statistics on all tables prior to reporting runs:
ANALYZE TABLE fact_sales COMPUTE STATISTICS FOR ALL COLUMNS;
ANALYZE TABLE dim_customers COMPUTE STATISTICS FOR ALL COLUMNS;
ANALYZE TABLE dim_products COMPUTE STATISTICS FOR ALL COLUMNS;

-- Step 2: Enable Cost-Based Optimizer & Join Reordering:
SET spark.sql.cbo.enabled = true;
SET spark.sql.cbo.joinReorder.enabled = true;
SET spark.sql.cbo.joinReorder.dp.threshold = 12;

-- Catalyst will now compute the mathematical minimal cost join tree,
-- filtering small broadcastable dimensions first and reducing fact rows by 90% before the first shuffle!""",
        "interview_takeaway": "Catalyst can make disastrous join order decisions in multi-table queries without metadata; enable Cost-Based Optimizer (`spark.sql.cbo.enabled = true`) and run `ANALYZE TABLE ... COMPUTE STATISTICS` to let Spark find the optimal join tree."
    },
    {
        "id": 89,
        "title": "Dynamic Partition Pruning (DPP) Failure on Non-Broadcast Star Joins",
        "category": "Join Explosions & Cardinality",
        "level": "Architect",
        "scenario": "A 100TB fact table is partitioned by `date_key`. A BI query joins `fact_sales` with `dim_date` filtering for `quarter = 'Q3'`. Instead of reading only Q3 partitions (25TB), Spark reads all 100TB from cloud storage, exhausting cluster budget.",
        "symptom": "Spark UI shows 100% of partition files read; `DynamicPartitionPruning` operator is absent from the physical execution plan.",
        "root_cause": "Dynamic Partition Pruning (DPP) relies on the dimension table being broadcast. If `dim_date` exceeds the broadcast threshold or if the join is forced into a SortMergeJoin, DPP cannot inject runtime partition filters into the fact table scan.",
        "failing_code": """-- Failing Spark SQL:
-- dim_date has 50 columns and exceeds autoBroadcastJoinThreshold:
SELECT f.*
FROM fact_sales f
JOIN dim_date d ON f.date_key = d.date_key
WHERE d.quarter = 'Q3'; -- Scans ALL 100TB of fact partitions because DPP was not triggered!""",
        "solution_code": """-- Production-Grade Solution: Force Broadcast Hint on Dimension to Trigger DPP
-- Option 1: Broadcast the dimension to activate Dynamic Partition Pruning:
SELECT /*+ BROADCAST(d) */ f.*
FROM fact_sales f
JOIN dim_date d ON f.date_key = d.date_key
WHERE d.quarter = 'Q3';

-- In Physical Plan, look for:
-- "DynamicPruningExpression(date_key#123 IN dynamicpruning#456)"
-- Spark now skips 75TB of partitions at runtime during the initial storage scan!

-- Option 2: Ensure DPP configuration is active:
-- SET spark.sql.optimizer.dynamicPartitionPruning.enabled = true;
-- SET spark.sql.optimizer.dynamicPartitionPruning.useStats = true;""",
        "interview_takeaway": "Dynamic Partition Pruning (DPP) skips irrelevant fact table partitions at runtime based on dimension filters, but DPP requires the dimension side to be broadcast; use `/*+ BROADCAST */` hints on the filtering dimension to guarantee DPP activation."
    },
    {
        "id": 90,
        "title": "Enterprise Fact-Dimension Join Optimization: Runtime Bloom Filter Joins",
        "category": "Join Explosions & Cardinality",
        "level": "Architect",
        "scenario": "A lakehouse fact table of 10 billion rows cannot be broadcast, nor can the filtered dimension (50 million rows). Both tables must shuffle. Even with 1,000 partitions, the shuffle exchange transfers 8TB across the network. 80% of fact records will ultimately be discarded by the join.",
        "symptom": "Massive shuffle read/write metrics; 80% of shuffled data is immediately dropped post-join.",
        "root_cause": "SortMergeJoin shuffles all rows from both tables before filtering non-matching keys. If most fact rows have no match in the filtered dimension, massive network bandwidth is wasted shuffling doomed rows.",
        "failing_code": """# Standard SortMergeJoin without pre-filtering:
# 8TB fact table shuffled across network, only to discard 80% post-join!
joined = fact_sales.join(filtered_dim, on="customer_id")
joined.write.format("delta").save(...)""",
        "solution_code": """# Production-Grade Solution: Runtime Bloom Filter Join (Databricks / Spark 3.3+)
# Step 1: Enable Bloom Filter Join Optimization:
spark.conf.set("spark.sql.optimizer.runtime.bloomFilter.enabled", "true")
spark.conf.set("spark.sql.optimizer.runtime.bloomFilter.creationSideThreshold", "100MB")

# How it works internally:
# 1. Spark builds a probabilistic Bloom Filter (tiny bitset, ~10MB) from filtered_dim keys on Driver.
# 2. Spark pushes down the Bloom Filter to the fact_sales scan tasks.
# 3. Fact scanner evaluates the Bloom Filter at the Parquet reader level, discarding 80% of rows
#    BEFORE they are ever read into memory or sent to the shuffle buffer!
# 4. Shuffle data drops from 8TB to 1.6TB! 5x faster execution!""",
        "interview_takeaway": "Runtime Bloom Filter Joins (`spark.sql.optimizer.runtime.bloomFilter.enabled = true`) build an in-memory bitset from the dimension to prune non-matching fact rows at the Parquet scan level, slashing shuffle network traffic by up to 80%."
    }
]
