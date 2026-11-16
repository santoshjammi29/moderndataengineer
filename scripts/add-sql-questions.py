import json
import os

FILE = 'src/data/json/questions.json'
FILE_CLEANED = 'src/data/json/questions_unified_cleaned.json'

with open(FILE, 'r', encoding='utf-8') as f:
    data = json.load(f)

before_count = len(data)
existing_ids = {item['id'] for item in data}
print(f"Existing questions count in {FILE}: {before_count}")

new_questions = [
    {
        "id": "sql-qa-order-of-execution-01",
        "source": "Modern SQL Curriculum",
        "category": "SQL SERVER",
        "niche": "Query Optimization & Execution Plans",
        "difficulty": "EASY",
        "question": "What is the exact logical execution order of clauses in an ANSI SQL query, and why can aliases defined in the SELECT clause not be referenced in the WHERE clause?",
        "answer": "SQL queries are syntactically written starting with SELECT, but the database engine logically evaluates clauses in the following strict order:\n1. FROM & JOIN: Establishes the Cartesian and joined relational dataset.\n2. ON: Filters joined table records according to join conditions.\n3. WHERE: Filters individual rows before aggregation occurs.\n4. GROUP BY: Groups rows based on distinct values in grouping columns.\n5. HAVING: Filters grouped aggregate summary rows.\n6. SELECT: Evaluates expressions, calculations, and column aliases.\n7. WINDOW: Evaluates analytic window partition specifications.\n8. DISTINCT: Deduplicates identical projection tuples.\n9. ORDER BY: Sorts the final result set.\n10. LIMIT / TOP: Slices result cardinality.\n\nBecause the WHERE clause is evaluated in Step 3 while column aliases are only declared in Step 6 (SELECT), any reference to a SELECT alias in WHERE fails with an 'Invalid column name' error.",
        "domain": "Databases, SQL & Storage",
        "subdomain": "SQL Engine Foundations"
    },
    {
        "id": "sql-qa-count-semantics-02",
        "source": "Database Engineering Standards",
        "category": "SQL SERVER",
        "niche": "Query Optimization & Execution Plans",
        "difficulty": "EASY",
        "question": "Given a table 'Orders' with 100 total rows where 10 rows contain NULL in the 'discount_code' column, what are the exact results of SELECT COUNT(*), SELECT COUNT(1), and SELECT COUNT(discount_code)? Explain the optimizer execution plan difference between COUNT(*) and COUNT(1).",
        "answer": "Results:\n1. SELECT COUNT(*): Returns 100. It counts the total cardinality of the relation, preserving rows regardless of NULL content.\n2. SELECT COUNT(1): Returns 100. It evaluates whether the constant expression '1' is NULL for each row.\n3. SELECT COUNT(discount_code): Returns 90. It evaluates the attribute and increments the accumulator only for non-null records.\n\nIn modern cost-based query optimizers (SQL Server, PostgreSQL, MySQL 8+, Oracle), COUNT(1) and COUNT(*) generate identical physical execution plans. The optimizer parses COUNT(1) directly as COUNT(*) and selects the narrowest non-clustered index on disk to compute the total row count with minimum I/O. The widespread belief that COUNT(1) is faster than COUNT(*) is an outdated myth.",
        "domain": "Databases, SQL & Storage",
        "subdomain": "SQL Aggregation Semantics"
    },
    {
        "id": "sql-qa-null-three-valued-logic-03",
        "source": "LeetCode Benchmark & Interview Bank",
        "category": "SQL SERVER",
        "niche": "Query Optimization & Execution Plans",
        "difficulty": "MEDIUM",
        "question": "Why does the query 'SELECT name FROM Customers WHERE referee_id != 2' fail to return customers whose referee_id is NULL, and what are the two optimal ways to write null-safe inequality checks in production?",
        "answer": "In ANSI SQL, NULL represents an unknown value. Any comparison against NULL (e.g. NULL != 2 or NULL = 2) evaluates to UNKNOWN under three-valued logic (3VL). Because the WHERE clause only includes records where the predicate evaluates strictly to TRUE, all rows where referee_id IS NULL are dropped.\n\nTwo optimal ways to write null-safe inequality checks:\n1. Explicit NULL Check:\nSELECT name FROM Customers WHERE referee_id != 2 OR referee_id IS NULL;\n2. Null-Coalescing Substitution:\nSELECT name FROM Customers WHERE COALESCE(referee_id, 0) != 2;\n\nNote that using COALESCE on an indexed column can inhibit index seeks unless an index exists on the computed expression. The explicit 'OR referee_id IS NULL' structure allows modern optimizers to leverage filtered indexes.",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Three-Valued Logic"
    },
    {
        "id": "sql-qa-window-ranking-functions-04",
        "source": "Advanced Analytics Engineering",
        "category": "SQL SERVER",
        "niche": "Analytical Window Functions",
        "difficulty": "MEDIUM",
        "question": "Compare ROW_NUMBER(), RANK(), and DENSE_RANK() using an example where employees share identical salaries. Which function must be used to find the Nth highest salary in a company, and why?",
        "answer": "When multiple records share identical values in the ORDER BY expression:\n- ROW_NUMBER(): Assigns an arbitrary unique integer starting at 1 without gaps (e.g. 1, 2, 3, 4).\n- RANK(): Assigns identical rank numbers to ties, but skips subsequent numbers equal to the tie count (e.g. 1, 2, 2, 4).\n- DENSE_RANK(): Assigns identical rank numbers to ties without skipping subsequent numbers (e.g. 1, 2, 2, 3).\n\nTo find the Nth highest salary in a company, you MUST use DENSE_RANK(). If two top earners share the exact same salary of $200,000, RANK() will assign both rank 1 and the next highest earner ($180,000) rank 3. A query filtering for WHERE rnk = 2 would return 0 rows. DENSE_RANK() correctly assigns rank 2 to $180,000.",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Window Functions"
    },
    {
        "id": "sql-qa-nth-highest-salary-sql-05",
        "source": "Top Tech Interview Benchmark",
        "category": "SQL SERVER",
        "niche": "Analytical Window Functions",
        "difficulty": "MEDIUM",
        "question": "Write an ANSI SQL query to find the Nth highest salary from an Employee table without using vendor-specific clauses like LIMIT, TOP, or OFFSET.",
        "answer": "Solution using DENSE_RANK() in a Common Table Expression:\n\nWITH RankedSalaries AS (\n    SELECT \n        salary,\n        DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk\n    FROM Employee\n)\nSELECT DISTINCT salary\nFROM RankedSalaries\nWHERE rnk = :N;\n\nAlternative Correlated Subquery approach (ANSI compliant across all relational engines):\nSELECT DISTINCT e1.salary\nFROM Employee e1\nWHERE (:N - 1) = (\n    SELECT COUNT(DISTINCT e2.salary)\n    FROM Employee e2\n    WHERE e2.salary > e1.salary\n);\n\nThe DENSE_RANK() approach operates in O(N log N) sort time, whereas the correlated subquery operates in O(N^2) time on unindexed tables.",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Window Functions"
    },
    {
        "id": "sql-qa-gaps-and-islands-streak-06",
        "source": "Enterprise Interview Scenarios",
        "category": "SQL SERVER",
        "niche": "Analytical Window Functions",
        "difficulty": "HARD",
        "question": "Explain the mathematical principle behind using 'date - ROW_NUMBER()' to solve the Gaps and Islands problem when tracking consecutive user login streaks (>= 3 consecutive days). Provide the full working SQL query.",
        "answer": "Mathematical Principle:\nIn a contiguous sequence of dates (e.g. Day 10, Day 11, Day 12), the date increments by 1 day at each step. Simultaneously, ROW_NUMBER() increments by 1 at each row (1, 2, 3). If you subtract ROW_NUMBER() from the date, the two increments cancel each other out, producing a constant anchor date for all contiguous rows in that streak. When a gap occurs (e.g. Day 15), the difference shifts to a new constant value, effectively grouping consecutive streaks into distinct 'islands'.\n\nWorking SQL:\nWITH UserDailyLogins AS (\n    SELECT DISTINCT user_id, CAST(login_time AS DATE) AS login_date\n    FROM user_logins\n),\nIslandGroups AS (\n    SELECT \n        user_id,\n        login_date,\n        DATEADD(day, -ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY login_date), login_date) AS island_id\n    FROM UserDailyLogins\n)\nSELECT \n    user_id,\n    MIN(login_date) AS streak_start,\n    MAX(login_date) AS streak_end,\n    COUNT(*) AS streak_length\nFROM IslandGroups\nGROUP BY user_id, island_id\nHAVING COUNT(*) >= 3;",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Gaps and Islands"
    },
    {
        "id": "sql-qa-delete-duplicate-emails-07",
        "source": "LeetCode Top 20 Benchmarks",
        "category": "SQL SERVER",
        "niche": "DML & Relational Mutations",
        "difficulty": "EASY",
        "question": "Write an SQL statement to delete all duplicate emails from a 'Person(id, email)' table, keeping only the record with the smallest ID.",
        "answer": "Standard CTE Approach with ROW_NUMBER() (T-SQL, PostgreSQL):\nWITH DuplicatesCTE AS (\n    SELECT \n        id,\n        ROW_NUMBER() OVER (PARTITION BY email ORDER BY id ASC) AS rn\n    FROM Person\n)\nDELETE FROM DuplicatesCTE\nWHERE rn > 1;\n\nSelf-Join Deletion Approach (MySQL compliant):\nDELETE p1 \nFROM Person p1\nINNER JOIN Person p2 \n    ON p1.email = p2.email \n    AND p1.id > p2.id;\n\nBoth approaches ensure that for every group of duplicate emails, the tuple with the minimum ID has rn = 1 (or no matching p2 where p1.id > p2.id), preserving exactly one record.",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Data Deduplication"
    },
    {
        "id": "sql-qa-binary-tree-node-classification-08",
        "source": "Algorithmic SQL Benchmarks",
        "category": "SQL SERVER",
        "niche": "Hierarchical Data & Conditional Logic",
        "difficulty": "MEDIUM",
        "question": "Given a table BST(N, P) representing a binary tree where N is the node value and P is its parent, classify every node as 'Root', 'Inner', or 'Leaf'. What fatal edge case occurs if NULLs are not handled in the subquery?",
        "answer": "Working SQL:\nSELECT \n    N,\n    CASE\n        WHEN P IS NULL THEN 'Root'\n        WHEN N NOT IN (SELECT DISTINCT P FROM BST WHERE P IS NOT NULL) THEN 'Leaf'\n        ELSE 'Inner'\n    END AS NodeType\nFROM BST\nORDER BY N ASC;\n\nFatal Edge Case:\nThe Root node has P IS NULL. If you write 'N NOT IN (SELECT DISTINCT P FROM BST)' without filtering out NULLs, the subquery produces a set containing NULL. Under three-valued logic, 'N NOT IN (1, 2, NULL)' evaluates to UNKNOWN for every single node. As a result, the CASE statement bypasses 'Leaf' entirely and incorrectly categorizes every single child node as 'Inner'.",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Tree Structures in SQL"
    },
    {
        "id": "sql-qa-sargable-predicates-09",
        "source": "Database Performance Tuning",
        "category": "SQL SERVER",
        "niche": "Query Optimization & Execution Plans",
        "difficulty": "MEDIUM",
        "question": "Explain SARGability and provide three common non-SARGable query patterns with their drop-in SARGable rewrites.",
        "answer": "SARGability (Search Argument Able) describes query predicates structured to allow query optimizers to utilize B-tree index seeks (navigating index branch/leaf pages in O(log N)) rather than forcing full table or index scans.\n\nThree Common Non-SARGable Antipatterns & Rewrites:\n1. Date Function on Indexed Column:\n- ❌ Non-SARGable: WHERE YEAR(order_date) = 2024\n- ✅ SARGable: WHERE order_date >= '2024-01-01' AND order_date < '2025-01-01'\n\n2. Substring or Leading Wildcard:\n- ❌ Non-SARGable: WHERE SUBSTRING(account_number, 1, 3) = 'ACC'\n- ✅ SARGable: WHERE account_number LIKE 'ACC%'\n\n3. Implicit Data Type Conversion:\n- ❌ Non-SARGable: WHERE customer_id_varchar = 12345 (forces CONVERT_IMPLICIT on column)\n- ✅ SARGable: WHERE customer_id_varchar = '12345'",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Indexing & SARGability"
    },
    {
        "id": "sql-qa-scd-types-comparison-10",
        "source": "Kimball Dimensional Modeling Standards",
        "category": "MODERN LAKEHOUSE",
        "niche": "Slowly Changing Dimensions",
        "difficulty": "HARD",
        "question": "Compare Slowly Changing Dimension (SCD) Types 1, 2, 4, and 6. Explain when an enterprise data architect would choose SCD Type 6 over SCD Type 2.",
        "answer": "SCD Types Breakdown:\n- SCD Type 1: Overwrites historical values in place. No audit history retained. Best for correcting spelling mistakes or non-analytical attributes.\n- SCD Type 2: Inserts a new row with surrogate key, effective_start_date, effective_end_date, and is_current flag. Full historical audit trail preserved.\n- SCD Type 4: Base dimension maintains current state only; all historical mutations are archived into a dedicated history/audit table.\n- SCD Type 6 (Hybrid 1 + 2 + 3): Maintains current and historical values across rows (Type 2) while also maintaining a 'current_value' column updated across all versions (Type 1/3).\n\nWhy Choose SCD Type 6 Over SCD Type 2:\nIn pure SCD Type 2, reporting sales by an employee's current department requires a join or self-scan to locate the active record (is_current = 1). SCD Type 6 stamps the active current department across all historical rows of that employee, enabling queries to effortlessly aggregate historical transactions under both historical department and current department without complex self-joins.",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Dimensional Modeling"
    },
    {
        "id": "sql-qa-spark-5s-tuning-framework-11",
        "source": "Databricks Core Performance Runbook",
        "category": "SPARK & DATABRICKS",
        "niche": "Distributed Memory & Shuffle Tuning",
        "difficulty": "ARCHITECT",
        "question": "Detail the '5 S's' of Apache Spark Performance Tuning. For each 'S', provide one concrete operational symptom and its production remediation.",
        "answer": "The 5 S's Framework:\n1. Storage:\n- Symptom: Driver spends minutes in metadata planning; thousands of tasks process files < 1 MB.\n- Fix: Target 128 MB–1 GB output files; run Delta Lake 'OPTIMIZE ... ZORDER BY'.\n\n2. Skew:\n- Symptom: 99% of tasks complete in seconds; 1 task stalls for hours with executor OOM (Exit code 137).\n- Fix: Enable AQE Skew Join (spark.sql.adaptive.skewJoin.enabled = true) or implement manual key salting.\n\n3. Spill:\n- Symptom: Spark UI shows significant values in 'Spill (Memory)' and 'Spill (Disk)'.\n- Fix: Size shuffle partitions using 'data_size_in_mb / 150'; increase spark.sql.shuffle.partitions from default 200.\n\n4. Shuffle:\n- Symptom: Shuffle Read/Write exchange stages dominate cluster execution time.\n- Fix: Replace Sort-Merge Joins with Broadcast Hash Joins (broadcast(small_df)) for lookup tables < 100 MB.\n\n5. Serialization:\n- Symptom: Python workers (python3 process) consume 100% CPU while JVM remains idle.\n- Fix: Replace standard Python UDFs with native Spark SQL expressions or vectorized PyArrow Pandas UDFs (@pandas_udf).",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Spark SQL Performance"
    },
    {
        "id": "sql-qa-spark-join-skew-salting-12",
        "source": "Distributed Systems Interview Bank",
        "category": "SPARK & DATABRICKS",
        "niche": "Distributed Joins & Skew",
        "difficulty": "HARD",
        "question": "Write a PySpark code snippet demonstrating Key Salting to resolve a join skew bottleneck where 40% of records in a 10-billion-row fact table contain customer_id = 0.",
        "answer": "PySpark Implementation:\nfrom pyspark.sql import functions as F\n\n# 1. Salt the large fact table with random integers (0 to 9) for skewed keys\ndf_fact_salted = df_fact.withColumn(\n    \"salted_key\",\n    F.when(F.col(\"customer_id\") == 0, \n           F.concat(F.col(\"customer_id\"), F.lit(\"_\"), F.floor(F.rand() * 10)))\n     .otherwise(F.concat(F.col(\"customer_id\"), F.lit(\"_0\")))\n)\n\n# 2. Explode the small dimension table with matching salt keys (0 to 9)\ndf_dim_exploded = df_dim.withColumn(\"salt_array\", F.array([F.lit(i) for i in range(10)])) \\\n                        .withColumn(\"salt_val\", F.explode(\"salt_array\")) \\\n                        .withColumn(\"salted_key\", F.concat(F.col(\"customer_id\"), F.lit(\"_\"), F.col(\"salt_val\")))\n\n# 3. Join on the salted key (splits customer_id=0 across 10 executors uniformly)\ndf_joined = df_fact_salted.join(df_dim_exploded, on=\"salted_key\", how=\"inner\") \\\n                          .drop(\"salted_key\", \"salt_array\", \"salt_val\")",
        "domain": "Databases, SQL & Storage",
        "subdomain": "PySpark Join Optimization"
    },
    {
        "id": "sql-qa-synapse-mpp-distributions-13",
        "source": "Azure Synapse Data Warehousing",
        "category": "FABRIC",
        "niche": "MPP Architecture & Distributions",
        "difficulty": "ARCHITECT",
        "question": "How do Azure Synapse Dedicated SQL Pools distribute tables across their 60 distributions? Detail the criteria for choosing between Hash, Replicated, and Round-Robin distributions.",
        "answer": "Azure Synapse Dedicated Pools divide all managed data across exactly 60 underlying storage distributions.\n\nDistribution Selection Matrix:\n1. Replicated (DISTRIBUTION = REPLICATE):\n- Mechanics: A full copy of the table is cached on every Compute Node.\n- Criteria: Ideal for dimension tables < 2 GB. Eliminates Data Movement Service (DMS) broadcast operations during joins with fact tables.\n\n2. Hash Distributed (DISTRIBUTION = HASH(col)):\n- Mechanics: Rows are assigned to 1 of 60 distributions using a deterministic hash of the distribution column.\n- Criteria: Ideal for large fact tables (> 100 million rows). The hash key must have high cardinality, zero NULLs, and frequently participate in JOIN or GROUP BY clauses. NEVER hash on DATE columns.\n\n3. Round-Robin (DISTRIBUTION = ROUND_ROBIN):\n- Mechanics: Rows are distributed evenly in a circular fashion without hashing.\n- Criteria: Exclusively used for staging tables in ELT ingestion to maximize write throughput.",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Synapse MPP Architecture"
    },
    {
        "id": "sql-qa-polybase-copy-into-speedup-14",
        "source": "Cloud Data Warehousing Benchmarks",
        "category": "FABRIC",
        "niche": "High-Throughput Ingestion",
        "difficulty": "ARCHITECT",
        "question": "Why does PolyBase / COPY INTO achieve 1,060–1,250 MB/s ingestion throughput in Synapse, while standard Bulk Insert achieves only 1–9 MB/s? Explain the coordinator bottleneck.",
        "answer": "In standard Bulk Insert / BCP / JDBC ingestion, all incoming data streams must pass through the single Control/Coordinator node. The coordinator parses every row, computes hash distributions, and redistributes records across the 60 compute slices over the internal network, creating a hard physical CPU and network bottleneck of 1–9 MB/s.\n\nPolyBase and the modern T-SQL COPY INTO statement bypass the coordinator completely. The coordinator merely generates execution metadata, instructing all 60 underlying compute nodes to read chunked storage files (Parquet or CSV) directly and concurrently from cloud object storage (ADLS Gen2 / S3). Because compute nodes ingest data in parallel directly into their local storage slices, throughput scales linearly to 1,060–1,250 MB/s (>100x speedup).",
        "domain": "Databases, SQL & Storage",
        "subdomain": "PolyBase Parallel Ingestion"
    },
    {
        "id": "sql-qa-powerbi-schema-drift-cloud-failure-15",
        "source": "Enterprise BI Incident Triage",
        "category": "FABRIC",
        "niche": "Power BI & Semantic Model Architecture",
        "difficulty": "HARD",
        "question": "A nightly scheduled refresh in Power BI Service fails with 'The column X of the table was not found' after a database column was renamed, yet the local report opens without error. Why does this failure occur in the Cloud Service but not in Desktop, and how is it resolved?",
        "answer": "Root Cause:\nPower BI Desktop executes three distinct refresh operations concurrently upon clicking 'Refresh': Visual Refresh, Data Refresh, and Schema Refresh. In contrast, Power BI Service scheduled refresh triggers a Data Refresh only; it does NOT execute a Schema Refresh. When a backend database column is renamed or dropped, the cloud semantic model still expects the old schema, causing the data ingestion pipeline to crash with a missing column binding exception.\n\nResolution Runbook:\n1. Open the source .pbix in Power BI Desktop.\n2. Open Power Query ('Transform Data') to trigger schema evaluation.\n3. Remove references to the deleted column in applied steps, or update column rename mappings.\n4. Click 'Close & Apply' to execute a local Schema Refresh.\n5. Re-publish the dataset to the Power BI Service workspace to overwrite the cloud schema.\n\nArchitectural Defense: Always expose SQL Views over base physical tables to insulate reporting models from database column refactoring.",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Power BI Service Operations"
    },
    {
        "id": "sql-qa-stored-proc-deadlock-error-1205-16",
        "source": "SQL Server DBA Production Drills",
        "category": "SQL SERVER",
        "niche": "Concurrency, Locking & Deadlocks",
        "difficulty": "HARD",
        "question": "Explain the mechanics of SQL Server Error 1205: 'Transaction was deadlocked on lock resources and has been chosen as the deadlock victim'. Provide the 4-step production remediation runbook.",
        "answer": "A deadlock occurs when two concurrent transactions hold locks on separate resources (e.g. Transaction A holds exclusive lock on Orders and requests lock on Customers; Transaction B holds exclusive lock on Customers and requests lock on Orders). Because neither can proceed, SQL Server's background deadlock monitor detects the cycle, terminates the transaction with the lowest rollback cost, and issues Error 1205.\n\n4-Step Remediation Runbook:\n1. Uniform Access Order: Enforce that all stored procedures access tables in the identical alphabetical or topological order (e.g. always access Customers before Orders).\n2. Minimize Transaction Duration: Strip out all non-essential logic, network calls, and ETL parsing from inside BEGIN TRAN ... COMMIT blocks.\n3. Enable RCSI: Activate Read Committed Snapshot Isolation (ALTER DATABASE db SET READ_COMMITTED_SNAPSHOT ON) to eliminate shared read locks that block concurrent writes.\n4. Covering Indexes: Ensure update/delete statements perform index seeks with covering non-clustered indexes, preventing lock escalation to page or table locks.",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Concurrency & Locking"
    },
    {
        "id": "sql-qa-sql-server-ce-feedback-iqp-17",
        "source": "SQL Server 2022 Architecture",
        "category": "SQL SERVER",
        "niche": "Intelligent Query Processing (IQP)",
        "difficulty": "ARCHITECT",
        "question": "How does Cardinality Estimation (CE) Feedback in SQL Server 2022 automatically resolve execution plan regressions introduced by database upgrades?",
        "answer": "When databases are upgraded from compatibility level 110 (SQL Server 2012) to 120+ (SQL Server 2014+), the default Cardinality Estimator assumes predicate independence. For correlated predicates (e.g. Make = 'Audi' AND Model = 'A4'), the modern CE severely underestimates the row count, prompting the optimizer to choose Nested Loops joins with row-by-row lookups instead of Hash Joins, causing massive CPU and runtime spikes.\n\nSQL Server 2022 Cardinality Estimation Feedback operates autonomously:\n1. Identifies queries where actual execution row counts diverge significantly from estimated cardinalities.\n2. Tests alternative CE model assumptions (such as partial correlation or legacy CE).\n3. Validates whether the alternative plan provides a measurable performance improvement.\n4. Persists the optimal hint in Query Store across server restarts without modifying application code.\n\nTo remediate immediately at the database level: ALTER DATABASE SCOPED CONFIGURATION SET LEGACY_CARDINALITY_ESTIMATION = ON.",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Query Store & IQP"
    },
    {
        "id": "sql-qa-qualify-clause-modern-sql-18",
        "source": "Modern Lakehouse SQL Standards",
        "category": "MODERN LAKEHOUSE",
        "niche": "Modern Analytical Dialects",
        "difficulty": "MEDIUM",
        "question": "What is the QUALIFY clause in modern SQL dialects (Snowflake, BigQuery, Databricks, DuckDB), and how does it optimize deduplication queries?",
        "answer": "The QUALIFY clause filters the results of window functions in the same way HAVING filters aggregate functions, eliminating the need to wrap queries in Common Table Expressions (CTEs) or derived tables.\n\nComparison:\n\nLegacy Approach (Verbose CTE):\nWITH RankedRecords AS (\n    SELECT \n        id, name, updated_at,\n        ROW_NUMBER() OVER (PARTITION BY id ORDER BY updated_at DESC) AS rn\n    FROM raw_events\n)\nSELECT id, name, updated_at\nFROM RankedRecords\nWHERE rn = 1;\n\nModern QUALIFY Approach:\nSELECT id, name, updated_at\nFROM raw_events\nQUALIFY ROW_NUMBER() OVER (PARTITION BY id ORDER BY updated_at DESC) = 1;\n\nIn execution planning, QUALIFY evaluates after the WINDOW and SELECT stages but before DISTINCT and ORDER BY. It allows query engines to push down ranking filters directly into the scan and sort operators.",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Modern SQL Dialects"
    },
    {
        "id": "sql-qa-b-tree-vs-lsm-tree-storage-19",
        "source": "Storage Engine Internals",
        "category": "MODERN LAKEHOUSE",
        "niche": "Storage Engine Architecture",
        "difficulty": "ARCHITECT",
        "question": "Compare B-Tree and LSM-Tree storage engines in terms of read/write amplification, disk access patterns, and target workloads. Which engines use each?",
        "answer": "B-Tree Engines:\n- Mechanics: Multi-way balanced tree updating fixed-size (8KB–16KB) data pages in place on disk.\n- Read/Write Profile: Highly optimized for low-latency random reads (O(log N)); incurs write amplification due to random I/O and page splits.\n- Target Workload: Transactional OLTP systems requiring strict ACID.\n- Engines: PostgreSQL, MySQL (InnoDB), Microsoft SQL Server, Oracle.\n\nLSM-Tree (Log-Structured Merge-Tree) Engines:\n- Mechanics: Append-only write path: writes land in memory (MemTable) and a sequential WAL, subsequently flushing to immutable SSTables across hierarchical levels with background compaction.\n- Read/Write Profile: Highly optimized for massive sequential write throughput; read latency is higher due to multi-SSTable bloom filter and index checks.\n- Target Workload: High-ingestion append-heavy systems (telemetry, event streaming, time-series).\n- Engines: Apache Cassandra, RocksDB, ScyllaDB, InfluxDB, Google Cloud Bigtable.",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Storage Engines"
    },
    {
        "id": "sql-qa-the-halloween-problem-20",
        "source": "Relational Engine Mechanics",
        "category": "SQL SERVER",
        "niche": "Mutation Anomalies & Concurrency",
        "difficulty": "ARCHITECT",
        "question": "What is the Halloween Problem in database query processing, and how do modern relational query engines prevent it?",
        "answer": "The Halloween Problem is an execution anomaly where an UPDATE operation modifies a column that is also used by the index driving the search. If updating the column shifts the record to a position later in the index leaf sequence, the ongoing index scan re-encounters the same row and updates it again, potentially looping indefinitely.\n\nIt was discovered at IBM on Halloween 1976 during a query: UPDATE Emp SET Salary = Salary * 1.1 WHERE Salary < 25000. Employees whose raises kept them under $25,000 were repeatedly updated until all exceeded $25,000.\n\nPrevention in Modern Engines:\nThe query optimizer introduces an intermediate blocking phase: an 'Eager Spool' or snapshot operator that fully reads and stages qualifying row locators into temporary storage before executing any physical write modifications, strictly decoupling reading from writing.",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Relational Engine Mechanics"
    },
    {
        "id": "sql-qa-cross-engine-rosetta-stone-21",
        "source": "Polyglot Data Engineering",
        "category": "MODERN LAKEHOUSE",
        "niche": "Cross-Engine Interoperability",
        "difficulty": "MEDIUM",
        "question": "Demonstrate the syntax equivalence across Standard SQL, PySpark, Pandas, and Polars for: 1. Row filtering, 2. Adding a computed column, and 3. Computing a dense rank.",
        "answer": "1. Row Filtering (amount > 100 and status = 'A'):\n- SQL: WHERE amount > 100 AND status = 'A'\n- PySpark: df.filter((F.col('amount') > 100) & (F.col('status') == 'A'))\n- Pandas: df[(df['amount'] > 100) & (df['status'] == 'A')]\n- Polars: df.filter((pl.col('amount') > 100) & (pl.col('status') == 'A'))\n\n2. Adding a Computed Column (gross = amount * 1.1):\n- SQL: SELECT amount * 1.1 AS gross\n- PySpark: df.withColumn('gross', F.col('amount') * 1.1)\n- Pandas: df['gross'] = df['amount'] * 1.1\n- Polars: df.with_columns((pl.col('amount') * 1.1).alias('gross'))\n\n3. Dense Rank by Salary per Department:\n- SQL: DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC)\n- PySpark: F.dense_rank().over(Window.partitionBy('dept').orderBy(F.col('salary').desc()))\n- Pandas: df.groupby('dept')['salary'].rank(method='dense', ascending=False)\n- Polars: pl.col('salary').rank(method='dense', descending=True).over('dept')",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Rosetta Stone"
    },
    {
        "id": "sql-qa-delta-schema-evolution-22",
        "source": "Delta Lake Production Runbook",
        "category": "DATABRICKS",
        "niche": "Schema Governance & Evolution",
        "difficulty": "HARD",
        "question": "What is the difference between Schema Enforcement and Schema Evolution in Delta Lake? How do you activate schema evolution in PySpark, and what is the underlying metadata behavior?",
        "answer": "Delta Lake Schema Governance:\n- Schema Enforcement: The default behavior where Delta Lake verifies incoming DataFrame schemas against the existing table schema on write. If extra columns or incompatible types exist, the write is rejected with an AnalysisException, preventing silent schema corruption.\n- Schema Evolution: The controlled process of updating table schema during write operations to incorporate newly added columns without requiring manual ALTER TABLE DDL.\n\nPySpark Activation:\n# For append operations:\ndf.write.format('delta') \\\n  .mode('append') \\\n  .option('mergeSchema', 'true') \\\n  .save(table_path)\n\n# For complete table overwrites:\ndf.write.format('delta') \\\n  .mode('overwrite') \\\n  .option('overwriteSchema', 'true') \\\n  .save(table_path)\n\nUnderlying Metadata Behavior:\nDelta Lake does NOT rewrite existing Parquet data files. It appends a new JSON commit file to the _delta_log/ directory containing a metaData action with the updated StructType schema. Historical Parquet files lacking the new column return NULL when queried.",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Delta Lake Metadata"
    },
    {
        "id": "sql-qa-recursive-cte-calendar-spine-23",
        "source": "Advanced SQL Engineering",
        "category": "SQL SERVER",
        "niche": "Common Table Expressions",
        "difficulty": "MEDIUM",
        "question": "Write a recursive Common Table Expression to generate a complete 365-day calendar spine for the year 2024. Explain why calendar spines are essential for financial and operational reporting.",
        "answer": "Working SQL (ANSI / T-SQL / PostgreSQL):\nWITH RECURSIVE CalendarSpine(calendar_date) AS (\n    -- Anchor Member:\n    SELECT CAST('2024-01-01' AS DATE)\n    UNION ALL\n    -- Recursive Member:\n    SELECT DATEADD(day, 1, calendar_date)\n    FROM CalendarSpine\n    WHERE calendar_date < CAST('2024-12-31' AS DATE)\n)\nSELECT calendar_date \nFROM CalendarSpine\nOPTION (MAXRECURSION 400); -- T-SQL safety override for recursion depth\n\nWhy Calendar Spines are Essential:\nIn transaction databases, days with zero sales or zero website visits do not generate database rows. If you aggregate revenue directly (GROUP BY sale_date), inactive dates are completely missing from the output. Performing a LEFT JOIN from the Calendar Spine to the transactions table guarantees continuous daily rows, allowing COALESCE(SUM(amount), 0) to report accurate continuous trends and rolling averages.",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Recursive CTEs"
    },
    {
        "id": "sql-qa-azure-sql-optimized-locking-24",
        "source": "Azure SQL Engine Architecture",
        "category": "SQL SERVER",
        "niche": "Concurrency & Locking",
        "difficulty": "HARD",
        "question": "How does Azure SQL Optimized Locking eliminate lock memory exhaustion and lock escalation during massive concurrent updates?",
        "answer": "Traditional Locking Limitations (2PL):\nExecuting a batch UPDATE on 500,000 rows acquires 500,000 row-level exclusive locks and hundreds of intent-exclusive page locks. This consumes substantial database lock memory and triggers lock escalation to an exclusive table lock, blocking all concurrent transactions.\n\nOptimized Locking Mechanics:\n1. Transaction-ID (XACT) Locking: The engine holds a single lock on the active Transaction ID instead of thousands of individual row/key locks.\n2. Lock-After-Qualification (LAQ): When scanning tables to find qualifying rows, the engine checks row versions without acquiring update locks. Exclusive locks are acquired strictly at the moment a row is confirmed to qualify for modification, held momentarily, and released back to the transaction lock.\n\nOutcome: Lock memory usage remains flat regardless of update size, lock escalation is virtually eliminated, and concurrent write throughput increases by up to 10x.",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Azure SQL Concurrency"
    },
    {
        "id": "sql-qa-yelp-cdc-lakehouse-decoupling-25",
        "source": "Enterprise Architecture Case Studies",
        "category": "DATA PIPELINES & INGESTION",
        "niche": "Change Data Capture (CDC)",
        "difficulty": "ARCHITECT",
        "question": "Describe the architectural failure of tightly coupled OLTP-to-DWH replication (the Yelp Case Study) and how an event-driven CDC pipeline resolves it.",
        "answer": "The Architectural Failure:\nIn the legacy architecture, offline data warehouse consumers queried direct replicas of online OLTP production databases (MySQL / Cassandra). When feature development teams added, removed, or altered columns in transactional tables, analytical ETL pipelines crashed. Furthermore, ad-hoc analyst queries caused read replica CPU saturation and memory contention.\n\nEvent-Driven CDC Solution:\n1. Non-Invasive Capture: Debezium captures transaction log changes (MySQL binlog, PostgreSQL WAL) without issuing SELECT queries, introducing near-zero database load.\n2. Ingestion to Kafka: Mutations are streamed as before/after JSON/Avro events into partitioned Apache Kafka topics.\n3. Schema Registry Governance: A Confluent/Apicurio Schema Registry validates event schemas, blocking breaking schema modifications.\n4. Stream Normalization (Beam / Flink): Stateful streaming engines normalize and enrich events in-flight.\n5. Lakehouse Ingestion: Cleansed records land as append-only Delta Lake / Iceberg tables, completely insulating analytical consumers from transactional schema changes.",
        "domain": "Data Pipelines & Ingestion",
        "subdomain": "CDC Architecture"
    }
]

for item in new_questions:
    assert item['id'] not in existing_ids, f"Duplicate ID: {item['id']}"
    assert item['question'].strip(), "Question cannot be empty"
    assert item['answer'].strip(), "Answer cannot be empty"

data.extend(new_questions)

temp_file = FILE + '.tmp'
with open(temp_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

os.replace(temp_file, FILE)

# Also sync to questions_unified_cleaned.json if it exists
if os.path.exists(FILE_CLEANED):
    with open(FILE_CLEANED, 'r', encoding='utf-8') as f:
        data_cleaned = json.load(f)
    existing_cleaned_ids = {item['id'] for item in data_cleaned}
    for item in new_questions:
        if item['id'] not in existing_cleaned_ids:
            data_cleaned.append(item)
    temp_cleaned = FILE_CLEANED + '.tmp'
    with open(temp_cleaned, 'w', encoding='utf-8') as f:
        json.dump(data_cleaned, f, indent=2, ensure_ascii=False)
    os.replace(temp_cleaned, FILE_CLEANED)
    print(f"Updated {FILE_CLEANED} with new questions.")

print(f"Successfully updated {FILE}! New count: {len(data)} (+{len(new_questions)})")
