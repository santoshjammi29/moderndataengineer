import json
import os

# 1. Update modern_code_matrix.json
MATRIX_FILE = 'src/data/json/modern_code_matrix.json'
with open(MATRIX_FILE, 'r', encoding='utf-8') as f:
    matrix_data = json.load(f)

existing_topics = {item['topic'] for item in matrix_data}

new_matrix_items = [
    {
        "topic": "SQL Window Function QUALIFY Clause & Top-N Filtering",
        "python": "# Pandas alternative\ndf.sort_values('amount', ascending=False).groupby('customer_id').head(1)",
        "pyspark": "from pyspark.sql.window import Window\nfrom pyspark.sql import functions as F\n\nw = Window.partitionBy('customer_id').orderBy(F.col('amount').desc())\ndf.withColumn('rn', F.row_number().over(w)).filter(F.col('rn') == 1).drop('rn')",
        "sparksql": "-- Databricks / Spark SQL supports QUALIFY\nSELECT customer_id, order_id, amount\nFROM orders\nQUALIFY ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY amount DESC) = 1",
        "scala": "val w = Window.partitionBy(\"customer_id\").orderBy($\"amount\".desc)\ndf.withColumn(\"rn\", row_number().over(w)).filter($\"rn\" === 1).drop(\"rn\")",
        "duckdb": "-- DuckDB native QUALIFY\nSELECT customer_id, order_id, amount\nFROM orders\nQUALIFY ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY amount DESC) = 1",
        "snowflake": "-- Snowflake native QUALIFY\nSELECT customer_id, order_id, amount\nFROM orders\nQUALIFY ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY amount DESC) = 1",
        "bigquery": "-- Google BigQuery native QUALIFY\nSELECT customer_id, order_id, amount\nFROM orders\nQUALIFY ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY amount DESC) = 1",
        "trino": "-- Trino native QUALIFY\nSELECT customer_id, order_id, amount\nFROM orders\nQUALIFY ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY amount DESC) = 1"
    },
    {
        "topic": "Recursive CTE for Calendar Spine & Date Scaffolding",
        "python": "import pandas as pd\ncalendar_df = pd.DataFrame({'date': pd.date_range('2024-01-01', '2024-12-31')})",
        "pyspark": "spark.sql('''\nSELECT explode(sequence(to_date('2024-01-01'), to_date('2024-12-31'), interval 1 day)) AS calendar_date\n''')",
        "sparksql": "SELECT explode(sequence(to_date('2024-01-01'), to_date('2024-12-31'), interval 1 day)) AS calendar_date",
        "scala": "spark.sql(\"SELECT explode(sequence(to_date('2024-01-01'), to_date('2024-12-31'), interval 1 day)) AS calendar_date\")",
        "duckdb": "SELECT generate_series(DATE '2024-01-01', DATE '2024-12-31', INTERVAL 1 DAY) AS calendar_date",
        "snowflake": "WITH RECURSIVE CalendarSpine AS (\n  SELECT DATE '2024-01-01' AS dt\n  UNION ALL\n  SELECT DATEADD(day, 1, dt) FROM CalendarSpine WHERE dt < '2024-12-31'\n)\nSELECT dt FROM CalendarSpine",
        "bigquery": "SELECT calendar_date \nFROM UNNEST(GENERATE_DATE_ARRAY('2024-01-01', '2024-12-31', INTERVAL 1 DAY)) AS calendar_date",
        "trino": "SELECT dt \nFROM UNNEST(sequence(DATE '2024-01-01', DATE '2024-12-31', INTERVAL '1' DAY)) AS t(dt)"
    },
    {
        "topic": "Key Salting for Skewed Distributed Joins",
        "python": "# Pandas doesn't suffer from distributed shuffle skew\ndf_fact.merge(df_dim, on='customer_id', how='inner')",
        "pyspark": "df_fact_salted = df_fact.withColumn('salt', F.when(F.col('id') == 0, F.floor(F.rand() * 10)).otherwise(0)) \\\n                        .withColumn('salted_id', F.concat(F.col('id'), F.lit('_'), F.col('salt')))\ndf_dim_exploded = df_dim.withColumn('salt', F.explode(F.array([F.lit(i) for i in range(10)]))) \\\n                        .withColumn('salted_id', F.concat(F.col('id'), F.lit('_'), F.col('salt')))\ndf_fact_salted.join(df_dim_exploded, on='salted_id')",
        "sparksql": "SELECT /*+ SKEW('fact', 'customer_id', (0, NULL)) */ *\nFROM fact_sales fact\nJOIN dim_customer dim ON fact.customer_id = dim.customer_id",
        "scala": "val dfSalted = dfFact.withColumn(\"salted_id\", when($\"id\" === 0, concat($\"id\", lit(\"_\"), floor(rand() * 10))).otherwise(concat($\"id\", lit(\"_0\"))))\nval dfDimExp = dfDim.withColumn(\"salt\", explode(array((0 until 10).map(lit): _*))).withColumn(\"salted_id\", concat($\"id\", lit(\"_\"), $\"salt\"))\ndfSalted.join(dfDimExp, Seq(\"salted_id\"))",
        "duckdb": "-- Local columnar vectorized engine: uses in-memory parallel hash join\nSELECT * FROM fact_sales f JOIN dim_customer d ON f.customer_id = d.customer_id",
        "snowflake": "-- Snowflake auto-manages micro-partition skew; broadcast join for dimensions\nSELECT * FROM fact_sales f JOIN dim_customer d ON f.customer_id = d.customer_id",
        "bigquery": "-- BigQuery automatically detects data skew and re-partitions dynamically\nSELECT * FROM fact_sales f JOIN dim_customer d ON f.customer_id = d.customer_id",
        "trino": "-- Trino supports dynamic filtering to prune skewed join sides\nSELECT * FROM fact_sales f JOIN dim_customer d ON f.customer_id = d.customer_id"
    },
    {
        "topic": "Gaps and Islands Consecutive Event Grouping",
        "python": "import pandas as pd\ndf['group'] = df['date'].sub(pd.to_timedelta(df.groupby('user_id').cumcount(), unit='D'))\nstreaks = df.groupby(['user_id', 'group'])['date'].agg(['min', 'max', 'count'])",
        "pyspark": "w = Window.partitionBy('user_id').orderBy('event_date')\ndf.withColumn('island', F.date_sub(F.col('event_date'), F.row_number().over(w))) \\\n  .groupBy('user_id', 'island').agg(F.min('event_date').alias('start'), F.max('event_date').alias('end'), F.count('*').alias('streak'))",
        "sparksql": "SELECT user_id, MIN(event_date) AS streak_start, MAX(event_date) AS streak_end, COUNT(*) AS streak_days\nFROM (\n  SELECT user_id, event_date, date_sub(event_date, CAST(ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY event_date) AS INT)) AS island\n  FROM user_events\n)\nGROUP BY user_id, island HAVING COUNT(*) >= 3",
        "scala": "val w = Window.partitionBy(\"user_id\").orderBy(\"event_date\")\ndf.withColumn(\"island\", expr(\"date_sub(event_date, cast(row_number() over (partition by user_id order by event_date) as int))\")).groupBy(\"user_id\", \"island\").count()",
        "duckdb": "SELECT user_id, MIN(event_date) AS start_date, MAX(event_date) AS end_date, COUNT(*) AS streak\nFROM (\n  SELECT user_id, event_date, event_date - (ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY event_date) * INTERVAL 1 DAY) AS island\n  FROM user_events\n)\nGROUP BY user_id, island HAVING COUNT(*) >= 3",
        "snowflake": "SELECT user_id, MIN(event_date) AS start_date, MAX(event_date) AS end_date, COUNT(*) AS streak\nFROM (\n  SELECT user_id, event_date, DATEADD(day, -ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY event_date), event_date) AS island\n  FROM user_events\n)\nGROUP BY user_id, island HAVING COUNT(*) >= 3",
        "bigquery": "SELECT user_id, MIN(event_date) AS start_date, MAX(event_date) AS end_date, COUNT(*) AS streak\nFROM (\n  SELECT user_id, event_date, DATE_SUB(event_date, INTERVAL ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY event_date) DAY) AS island\n  FROM user_events\n)\nGROUP BY user_id, island HAVING COUNT(*) >= 3",
        "trino": "SELECT user_id, MIN(event_date) AS start_date, MAX(event_date) AS end_date, COUNT(*) AS streak\nFROM (\n  SELECT user_id, event_date, date_add('day', -ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY event_date), event_date) AS island\n  FROM user_events\n)\nGROUP BY user_id, island HAVING COUNT(*) >= 3"
    }
]

for item in new_matrix_items:
    if item['topic'] not in existing_topics:
        matrix_data.append(item)

with open(MATRIX_FILE + '.tmp', 'w', encoding='utf-8') as f:
    json.dump(matrix_data, f, indent=2, ensure_ascii=False)
os.replace(MATRIX_FILE + '.tmp', MATRIX_FILE)
print(f"Updated {MATRIX_FILE}: now has {len(matrix_data)} topics.")

# 2. Update data_cheatsheet.json
CHEATSHEET_FILE = 'src/data/json/data_cheatsheet.json'
with open(CHEATSHEET_FILE, 'r', encoding='utf-8') as f:
    cheatsheet_data = json.load(f)

existing_cs_ids = {item['id'] for item in cheatsheet_data}

new_cheatsheets = [
    {
        "id": "sql-window-functions-master-cheatsheet",
        "title": "SQL Window Functions Master Cheat Sheet",
        "category": "Databases & SQL",
        "categorySlug": "sql",
        "impact": "High (Analytics Performance & Code Elegance)",
        "effort": "Low (Drop-in Syntax)",
        "problem": "Developers write inefficient, convoluted correlated subqueries and multiple self-joins to calculate running totals, moving averages, and top-N category rankings.",
        "solution": "Leverage ANSI SQL Window Functions with explicit frame bounds (ROWS BETWEEN) and the modern QUALIFY clause to evaluate rankings and aggregates in a single logarithmic pass.",
        "codeSnippet": "-- Finding Top 1 Product per Category + Running Monthly Revenue\nSELECT \n    category_id,\n    product_id,\n    order_date,\n    revenue,\n    DENSE_RANK() OVER (PARTITION BY category_id ORDER BY revenue DESC) AS rank_in_cat,\n    SUM(revenue) OVER (\n        PARTITION BY category_id \n        ORDER BY order_date \n        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\n    ) AS running_monthly_revenue\nFROM fact_sales\nQUALIFY rank_in_cat = 1;",
        "language": "sql",
        "whyItMatters": "Window functions process partitions without collapsing rows, reducing time complexity from O(N^2) correlated subqueries to O(N log N) sorted passes.",
        "metrics": "Up to 80% faster execution; eliminates 5+ self-join roundtrips.",
        "antiPattern": "Using subqueries like '(SELECT COUNT(*) FROM t2 WHERE t2.val > t1.val)' for ranking; omitting 'ROWS BETWEEN' which causes default fallback to memory-heavy 'RANGE BETWEEN'.",
        "tags": ["SQL", "Window Functions", "DENSE_RANK", "QUALIFY", "Analytics Engineering"]
    },
    {
        "id": "sql-spark-pandas-polars-rosetta-stone",
        "title": "Cross-Engine Rosetta Stone (SQL ↔ PySpark ↔ Pandas ↔ Polars)",
        "category": "Databases & SQL",
        "categorySlug": "sql",
        "impact": "Critical (Multi-Engine Developer Velocity)",
        "effort": "Immediate (Syntax Reference)",
        "problem": "Data engineers working across SQL warehouses, distributed Spark clusters, and local Python pipelines waste time looking up equivalent syntax for common data manipulations.",
        "solution": "Use this drop-in translation matrix mapping SQL, PySpark, Pandas, and Polars expressions for filtering, sorting, column creation, aggregation, and ranking.",
        "codeSnippet": "-- SQL:\nSELECT dept, AVG(salary) AS avg_sal FROM emp WHERE status = 'A' GROUP BY dept;\n\n# PySpark:\ndf.filter(col('status') == 'A').groupBy('dept').agg(avg('salary').alias('avg_sal'))\n\n# Pandas:\ndf[df['status'] == 'A'].groupby('dept')['salary'].mean().reset_index(name='avg_sal')\n\n# Polars:\ndf.filter(pl.col('status') == 'A').group_by('dept').agg(pl.mean('salary').alias('avg_sal'))",
        "language": "python",
        "whyItMatters": "Eliminates cognitive load and avoids silent semantic differences (e.g. Pandas groupby dropping nulls by default vs SQL/Polars preserving them).",
        "metrics": "Zero semantic divergence; consistent data quality across multi-hop pipelines.",
        "antiPattern": "Writing procedural for-loops in Pandas/PySpark instead of native vectorized expressions.",
        "tags": ["Rosetta Stone", "SQL", "PySpark", "Pandas", "Polars", "Data Engineering"]
    },
    {
        "id": "spark-5s-triage-runbook-cheatsheet",
        "title": "Apache Spark 5S Performance Triage Runbook",
        "category": "Compute & Engine Optimization",
        "categorySlug": "spark",
        "impact": "Maximum (Cluster Stability & Cost Reduction)",
        "effort": "Medium (Configuration & Code Refactoring)",
        "problem": "Spark jobs fail with OOM crashes, stall indefinitely at 99% completion, or experience massive shuffle disk spill penalties.",
        "solution": "Triage performance issues across the 5 S's: Storage (compaction), Skew (salting/AQE), Spill (shuffle partition sizing), Shuffle (broadcast joins), and Serialization (vectorized Pandas UDFs).",
        "codeSnippet": "-- 1. SKEW: Enable AQE Skew Join\nspark.conf.set('spark.sql.adaptive.skewJoin.enabled', 'true')\n\n-- 2. SPILL: Size shuffle partitions dynamically (data_size_mb / 150)\nspark.conf.set('spark.sql.shuffle.partitions', str(int(input_mb / 150)))\n\n-- 3. SHUFFLE: Broadcast small dimensions (<100MB)\nfrom pyspark.sql.functions import broadcast\ndf_joined = df_fact.join(broadcast(df_dim), on='dim_id', how='inner')",
        "language": "python",
        "whyItMatters": "Eliminates 95% of production Spark job failures and prevents expensive cluster autoscaling overspend.",
        "metrics": "Reduces job runtimes by 50%–90%; eliminates disk spill I/O.",
        "antiPattern": "Leaving spark.sql.shuffle.partitions at the default 200 for terabyte-scale jobs; using df.collect() on distributed datasets.",
        "tags": ["Spark", "Performance", "5S", "AQE", "Data Skew", "Tungsten"]
    },
    {
        "id": "sql-server-deadlock-triage-cheatsheet",
        "title": "SQL Server Deadlock (Error 1205) Triage Cheat Sheet",
        "category": "Databases & SQL",
        "categorySlug": "sql",
        "impact": "High (Database Availability & Concurrency)",
        "effort": "Medium (Architecture & Scripting)",
        "problem": "Concurrent batch updates and analytical reporting queries generate frequent Error 1205 deadlock victim exceptions.",
        "solution": "Enforce uniform table access order across all stored procedures, enable Read Committed Snapshot Isolation (RCSI), and ensure covering indexes eliminate bookmark lookups.",
        "codeSnippet": "-- 1. Enable RCSI to eliminate reader-writer blocking:\nALTER DATABASE CoreBanking \nSET READ_COMMITTED_SNAPSHOT ON \nWITH ROLLBACK IMMEDIATE;\n\n-- 2. Stored Procedure Safe Pattern with TRY...CATCH & Uniform Order:\nBEGIN TRY\n    BEGIN TRANSACTION;\n    -- Always access Customers before Orders across ALL procedures:\n    UPDATE dbo.Customers SET LastActive = GETDATE() WHERE CustomerID = @cust_id;\n    UPDATE dbo.Orders SET Status = 'Processed' WHERE CustomerID = @cust_id;\n    COMMIT TRANSACTION;\nEND TRY\nBEGIN CATCH\n    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;\n    THROW;\nEND CATCH;",
        "language": "sql",
        "whyItMatters": "RCSI directs readers to row versions in TempDB, completely preventing select statements from blocking concurrent update statements.",
        "metrics": "Eliminates up to 98% of transactional deadlock events.",
        "antiPattern": "Using NOLOCK (dirty reads) which causes missing rows, duplicated reads, and corrupted reporting summaries.",
        "tags": ["SQL Server", "Deadlocks", "RCSI", "Error 1205", "Concurrency", "T-SQL"]
    },
    {
        "id": "synapse-mpp-distribution-cheatsheet",
        "title": "Azure Synapse MPP 60-Distribution Table Design Matrix",
        "category": "Databases & SQL",
        "categorySlug": "sql",
        "impact": "High (MPP Query Performance & FinOps)",
        "effort": "Low (DDL Sizing)",
        "problem": "Queries in Azure Synapse Analytics run slowly and exhaust DWU memory slots due to cross-node Data Movement Service (DMS) shuffle broadcasts.",
        "solution": "Apply the 60-distribution rule: Replicate dimension tables under 2 GB, Hash-distribute large fact tables (>100M rows) on high-cardinality join keys, and Round-Robin staging tables.",
        "codeSnippet": "-- 1. Staging Table: Maximum Ingestion Throughput\nCREATE TABLE stage.Orders (\n    OrderID INT NOT NULL, CustomerID INT NOT NULL, Amount DECIMAL(18,2)\n) WITH (DISTRIBUTION = ROUND_ROBIN, HEAP);\n\n-- 2. Replicated Dimension (< 2 GB): Eliminates DMS Broadcast Moves\nCREATE TABLE dbo.DimStore (\n    StoreID INT NOT NULL, StoreName VARCHAR(100) NOT NULL\n) WITH (DISTRIBUTION = REPLICATE, CLUSTERED COLUMNSTORE INDEX);\n\n-- 3. Hash Distributed Fact (> 100M Rows): Colocated Joins\nCREATE TABLE fact.Orders (\n    OrderID INT NOT NULL, CustomerID INT NOT NULL, Amount DECIMAL(18,2)\n) WITH (DISTRIBUTION = HASH(CustomerID), CLUSTERED COLUMNSTORE INDEX);",
        "language": "sql",
        "whyItMatters": "Colocated hash joins execute locally within each compute slice with zero inter-node network data movement.",
        "metrics": "Up to 10x faster analytical joins; eliminates DMS bottlenecks.",
        "antiPattern": "Hash distributing on DATE columns (causes time-based compute hotspots); replicating tables > 2 GB.",
        "tags": ["Synapse", "MPP", "Distributions", "Azure", "Columnstore", "Data Warehousing"]
    }
]

for item in new_cheatsheets:
    if item['id'] not in existing_cs_ids:
        cheatsheet_data.append(item)

with open(CHEATSHEET_FILE + '.tmp', 'w', encoding='utf-8') as f:
    json.dump(cheatsheet_data, f, indent=2, ensure_ascii=False)
os.replace(CHEATSHEET_FILE + '.tmp', CHEATSHEET_FILE)
print(f"Updated {CHEATSHEET_FILE}: now has {len(cheatsheet_data)} cheatsheets.")
