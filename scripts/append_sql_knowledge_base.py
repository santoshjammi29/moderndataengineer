import json
import os
import sys

CONCEPTS_FILE = 'src/data/json/data_concepts.json'
QUESTIONS_FILE = 'src/data/json/questions.json'
MSSQL_FILE = 'src/data/json/data_mssql.json'
MODERN_CONCEPTS_FILE = 'src/data/json/modern_concepts.json'

# --- 1. Define New Concepts ---
new_concepts = [
    {
        "id": "sql-logical-query-execution-order",
        "term": "Logical Query Execution Order",
        "category": "SQL SERVER",
        "difficulty": "MEDIUM",
        "definition": "The formal sequential order in which a relational database engine processes SQL query clauses, independent of written lexical order.",
        "explanation": "While queries syntactically begin with SELECT, the database engine logically processes clauses in the sequence: FROM -> ON -> JOIN -> WHERE -> GROUP BY -> WITH CUBE/ROLLUP -> HAVING -> SELECT -> DISTINCT -> ORDER BY -> TOP/LIMIT. This execution pipeline governs identifier scope, explaining why column aliases declared in SELECT are unavailable in WHERE or GROUP BY, and how predicates filter rows before and after aggregation.",
        "keyPoints": [
            "Logical processing follows: FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> DISTINCT -> ORDER BY -> TOP/LIMIT.",
            "Column aliases declared in SELECT cannot be referenced in WHERE because WHERE evaluates prior to SELECT.",
            "HAVING filters grouped aggregates; WHERE filters raw individual rows before group collapse.",
            "ORDER BY evaluates after SELECT, allowing it to reference projected column aliases.",
            "TOP/LIMIT evaluates last to constrain the final output cardinality."
        ],
        "sources": [
            {
                "title": "Logical Query Processing Order",
                "url": "https://learn.microsoft.com/en-us/sql/t-sql/queries/select-transact-sql",
                "publisher": "Microsoft Learn"
            }
        ]
    },
    {
        "id": "sql-sargability-predicate-optimization",
        "term": "SARGability (Search Argument Able)",
        "category": "SQL SERVER",
        "difficulty": "HARD",
        "definition": "The property of a query predicate that enables the optimizer to execute an index seek across a B-Tree rather than falling back to an exhaustive index or table scan.",
        "explanation": "A predicate is SARGable if the target column appears isolated on one side of a comparison operator without being wrapped in scalar functions, string manipulation, or arithmetic calculations. Wrapping indexed columns in functions (e.g., YEAR(date_col) = 2024 or UPPER(name) = 'DOE') forces the engine to compute the function across every single row in the table, destroying the ability to perform a binary B-Tree traversal.",
        "keyPoints": [
            "Index seeks require the indexed column to remain unmanipulated in comparison expressions.",
            "Functions on columns (e.g. SUBSTRING, DATEADD, YEAR, ROUND) invalidate SARGability.",
            "Arithmetic operations must be rewritten on literal constants: rewrite 'col + 10 > 100' to 'col > 90'.",
            "Leading wildcards (LIKE '%text') prevent B-Tree seek capability; trailing wildcards (LIKE 'text%') remain SARGable.",
            "Implicit data type conversions act as hidden non-SARGable wrappers."
        ],
        "sources": [
            {
                "title": "Query Tuning: SARGable Expressions",
                "url": "https://learn.microsoft.com/en-us/sql/relational-databases/indexes/indexes-overview",
                "publisher": "Microsoft Learn"
            }
        ]
    },
    {
        "id": "sql-row-number-vs-rank-vs-dense-rank",
        "term": "ROW_NUMBER() vs. RANK() vs. DENSE_RANK()",
        "category": "SQL SERVER",
        "difficulty": "EASY",
        "definition": "The three primary SQL ranking window functions that assign integer ordinals to rows based on an ORDER BY specification within a partition.",
        "explanation": "Each function handles identical values (ties) differently. Given input values [100, 100, 80, 70]: ROW_NUMBER() assigns strictly consecutive distinct integers [1, 2, 3, 4] with arbitrary tie-breaking; RANK() assigns identical ranks to ties and skips subsequent numbers [1, 1, 3, 4]; DENSE_RANK() assigns identical ranks to ties without skipping subsequent numbers [1, 1, 2, 3]. DENSE_RANK() is the standard industry choice for finding the Nth highest value without gaps.",
        "keyPoints": [
            "ROW_NUMBER(): Monotonically increasing unique integers [1, 2, 3, 4], regardless of value ties.",
            "RANK(): Tied values share ranks; subsequent rank skips positions [1, 1, 3, 4].",
            "DENSE_RANK(): Tied values share ranks; subsequent rank continues without gaps [1, 1, 2, 3].",
            "DENSE_RANK() is essential for calculating the Nth highest distinct value across departments.",
            "ROW_NUMBER() is the primary tool for deduplication keeping the earliest/latest record."
        ],
        "sources": [
            {
                "title": "Ranking Functions (Transact-SQL)",
                "url": "https://learn.microsoft.com/en-us/sql/t-sql/functions/ranking-functions-transact-sql",
                "publisher": "Microsoft Learn"
            }
        ]
    },
    {
        "id": "sql-rows-vs-range-window-frames",
        "term": "Window Frame Specification: ROWS vs. RANGE",
        "category": "SQL SERVER",
        "difficulty": "HARD",
        "definition": "The sub-clause within OVER() that defines the physical or logical boundary of rows evaluated relative to the current row.",
        "explanation": "When using window aggregation (SUM, AVG, COUNT), the window frame determines which rows contribute to the calculation. ROWS evaluates physical row offsets (e.g., ROWS BETWEEN 6 PRECEDING AND CURRENT ROW), making it deterministic and performant. RANGE evaluates logical value offsets based on the ORDER BY column. If ORDER BY is specified without an explicit frame, the ANSI standard default is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, which clumps all tied values together, leading to unexpected spikes in cumulative sums and high tempdb spooling.",
        "keyPoints": [
            "ROWS operates on physical row counts; RANGE operates on logical value intervals.",
            "Default window frame when ORDER BY is provided: RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW.",
            "RANGE default causes ties to produce identical cumulative sums rather than smooth running additions.",
            "ROWS BETWEEN ... is substantially faster and avoids memory spools because it does not evaluate ties.",
            "Sliding moving averages require ROWS BETWEEN (N-1) PRECEDING AND CURRENT ROW."
        ],
        "sources": [
            {
                "title": "OVER Clause (Transact-SQL)",
                "url": "https://learn.microsoft.com/en-us/sql/t-sql/queries/select-over-clause-transact-sql",
                "publisher": "Microsoft Learn"
            }
        ]
    },
    {
        "id": "sql-qualify-clause-window-filtering",
        "term": "The QUALIFY Clause in Modern SQL",
        "category": "SQL SERVER",
        "difficulty": "MEDIUM",
        "definition": "A specialized filtering clause in modern analytical engines (Snowflake, BigQuery, Databricks) that filters the results of window functions directly without wrapping queries in subqueries or CTEs.",
        "explanation": "In standard ANSI SQL, window functions cannot be referenced in WHERE or HAVING clauses because window functions are evaluated in the SELECT projection stage. Filtering window calculations traditionally required wrapping the query in a Common Table Expression (CTE) or derived subquery. The QUALIFY clause acts like a HAVING clause specifically for window functions, evaluating immediately after window calculations and simplifying analytical queries.",
        "keyPoints": [
            "Natively supported in Snowflake, Google BigQuery, Databricks Spark SQL, and Teradata.",
            "Eliminates boilerplate CTEs and nested subqueries when filtering top N records per partition.",
            "Evaluates after window functions and before final ORDER BY and LIMIT.",
            "Example: SELECT * FROM orders QUALIFY ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC) = 1.",
            "Engines lacking QUALIFY (PostgreSQL, SQL Server, MySQL) must use CTEs or subqueries."
        ],
        "sources": [
            {
                "title": "QUALIFY Clause - Snowflake Documentation",
                "url": "https://docs.snowflake.com/en/sql-reference/constructs/qualify",
                "publisher": "Snowflake"
            }
        ]
    },
    {
        "id": "sql-clustered-vs-nonclustered-indexes",
        "term": "Clustered vs. Non-Clustered B-Tree Indexes",
        "category": "SQL SERVER",
        "difficulty": "HARD",
        "definition": "The two fundamental indexing physical storage structures in relational database engines that govern how data rows are stored and retrieved.",
        "explanation": "A Clustered Index dictates the physical sort order of actual table rows on disk. A table can have exactly one clustered index because rows can only be physically sorted one way. The leaf level of a clustered index contains the actual data pages. A Non-Clustered Index is a separate secondary B-Tree structure containing the indexed key columns and a row locator. Reading unindexed columns through a non-clustered index requires an additional Key Lookup back to the clustered index.",
        "keyPoints": [
            "Clustered Index: Physical order = logical order; leaf nodes ARE the table data pages; maximum 1 per table.",
            "Non-Clustered Index: Secondary B-Tree structure; leaf nodes contain index keys and row pointers.",
            "Key Lookup (Bookmark Lookup): Extra I/O incurred when non-clustered index does not cover all requested SELECT columns.",
            "Heaps: Tables without a clustered index; rows are stored in arbitrary order without B-Tree organization.",
            "High-performance OLTP systems select monotonic, narrow clustered keys to prevent page splits."
        ],
        "sources": [
            {
                "title": "Clustered and Nonclustered Indexes Described",
                "url": "https://learn.microsoft.com/en-us/sql/relational-databases/indexes/clustered-and-nonclustered-indexes-described",
                "publisher": "Microsoft Learn"
            }
        ]
    },
    {
        "id": "sql-covering-indexes-and-included-columns",
        "term": "Covering Indexes & Included Columns (INCLUDE)",
        "category": "SQL SERVER",
        "difficulty": "HARD",
        "definition": "An indexing design pattern where a non-clustered index contains all columns referenced by a query, completely eliminating Key/Bookmark Lookups.",
        "explanation": "When an index covers a query, the query engine satisfies the entire query from the lightweight index B-Tree without touching the clustered index or heap data pages. The INCLUDE clause allows non-key columns to be added solely at the leaf level of the B-Tree index. This avoids increasing the index key size, preserves B-Tree shallow depth, and sidesteps maximum index key byte limits.",
        "keyPoints": [
            "A covering index satisfies a query entirely within the secondary index structure.",
            "Completely eliminates expensive Key Lookups / Bookmark Lookups from execution plans.",
            "INCLUDE columns exist only at leaf nodes, avoiding B-Tree branch page overhead and index depth bloat.",
            "Columns used in WHERE and JOIN belong in the primary index key; columns used only in SELECT belong in INCLUDE.",
            "Tradeoff: Increases table write overhead and storage consumption during INSERT/UPDATE operations."
        ],
        "sources": [
            {
                "title": "Create Indexes with Included Columns",
                "url": "https://learn.microsoft.com/en-us/sql/relational-databases/indexes/create-indexes-with-included-columns",
                "publisher": "Microsoft Learn"
            }
        ]
    },
    {
        "id": "sql-physical-join-algorithms-loops-merge-hash",
        "term": "Physical Join Algorithms: Nested Loops, Merge, and Hash Joins",
        "category": "SQL SERVER",
        "difficulty": "ARCHITECT",
        "definition": "The three physical execution operators employed by cost-based query optimizers to combine two data streams.",
        "explanation": "Nested Loops Join iterates through the outer table and performs an index lookup on the inner table for each row (O(M*log N)). Merge Join requires both input streams to be pre-sorted on join keys, reading both inputs concurrently in a single linear pass (O(M+N)). Hash Join hashes the smaller build input into an in-memory hash table, then probes it with rows from the larger probe input. It requires no sorting or indexes but demands substantial memory grants and risks spilling to tempdb under memory pressure.",
        "keyPoints": [
            "Nested Loops: O(M * log N); ideal for small outer set driving indexed inner lookups; terrible if outer explodes.",
            "Merge Join: O(M + N); fastest for large sorted inputs; requires pre-sorted streams or upstream Sort operator.",
            "Hash Join: O(M + N); best for large unsorted sets with equality joins; builds in-memory hash table.",
            "Hash Spill: When available query memory grant is insufficient, hash buckets spill to tempdb disk.",
            "Join hints should be avoided in production unless addressing optimizer cardinality errors."
        ],
        "sources": [
            {
                "title": "Joins (SQL Server) Architecture Guide",
                "url": "https://learn.microsoft.com/en-us/sql/relational-databases/performance/joins",
                "publisher": "Microsoft Learn"
            }
        ]
    },
    {
        "id": "sql-three-valued-logic-null-trap",
        "term": "Three-Valued Logic (3VL) & The NULL In NOT IN Trap",
        "category": "SQL SERVER",
        "difficulty": "MEDIUM",
        "definition": "The SQL logic standard where boolean expressions evaluate to TRUE, FALSE, or UNKNOWN, and the critical failure pattern where subqueries containing NULL in NOT IN return zero rows.",
        "explanation": "In SQL, NULL represents missing or unknown data. Comparisons involving NULL yield UNKNOWN. In WHERE clauses, rows are only returned if the predicate evaluates to TRUE. The critical production trap occurs with NOT IN: 'WHERE id NOT IN (SELECT id FROM t)' expands to 'id != val1 AND id != val2 AND id != NULL'. Because 'id != NULL' evaluates to UNKNOWN, the entire conjunction chain becomes UNKNOWN, causing the query to silently return zero rows. In contrast, NOT EXISTS uses two-valued boolean existence and is completely immune to NULLs.",
        "keyPoints": [
            "SQL boolean logic is three-valued: TRUE, FALSE, and UNKNOWN.",
            "NULL = NULL evaluates to UNKNOWN, not TRUE. Always use 'IS NULL' or 'IS NOT NULL'.",
            "If a subquery evaluated by NOT IN returns even one NULL, the outer query returns 0 rows.",
            "NOT EXISTS is immune to NULLs in subqueries and generally produces superior execution plans.",
            "COUNT(*) counts all rows including NULLs; COUNT(column) counts only non-null values."
        ],
        "sources": [
            {
                "title": "Null Values (Transact-SQL)",
                "url": "https://learn.microsoft.com/en-us/sql/t-sql/language-elements/null-and-unknown-transact-sql",
                "publisher": "Microsoft Learn"
            }
        ]
    },
    {
        "id": "sql-deadlock-detection-and-prevention",
        "term": "Deadlocks, Blocking & Concurrency Control",
        "category": "SQL SERVER",
        "difficulty": "HARD",
        "definition": "A concurrency collision where two or more database sessions hold locks on separate resources while each requests an exclusive lock on the resource held by the other, forming a cyclic dependency.",
        "explanation": "Relational engines resolve deadlocks via a background lock monitor thread that periodically scans the lock graph. When a cycle is detected, the engine terminates and rolls back the session with the lowest transaction rollback cost, throwing Error 1205. Deadlocks are prevented by ensuring all applications access tables and resources in identical deterministic order, keeping transactions brief, minimizing lock escalation via batching, and utilizing row versioning isolation levels (RCSI/Snapshot).",
        "keyPoints": [
            "Deadlocks occur when transactions request conflicting locks in circular dependency order (A->B and B->A).",
            "The engine kills the transaction with the lowest rollback cost as the deadlock victim.",
            "Prevention Rule 1: Always access tables and rows in the exact same order across all stored procedures.",
            "Prevention Rule 2: Keep transactions short; never place external HTTP calls inside transactions.",
            "Prevention Rule 3: Enable Read Committed Snapshot Isolation (RCSI) so readers do not block writers."
        ],
        "sources": [
            {
                "title": "Deadlocking Guide - SQL Server",
                "url": "https://learn.microsoft.com/en-us/sql/relational-databases/native-client-ole-db-transactions/isolation-levels",
                "publisher": "Microsoft Learn"
            }
        ]
    },
    {
        "id": "synapse-mpp-table-distributions",
        "term": "Azure Synapse Table Distributions (Hash, Round-Robin, Replicated)",
        "category": "DATABASE ARCHITECTURE",
        "difficulty": "ARCHITECT",
        "definition": "The architectural data distribution strategies across 60 fixed storage buckets that govern data movement and query parallelization in Azure Synapse dedicated SQL pools.",
        "explanation": "Azure Synapse uses a Massively Parallel Processing (MPP) architecture with a Control Node directing queries across 60 compute distributions. Table distribution determines how rows map to these 60 distributions. Hash Distributed tables assign rows based on a deterministic hash of a single key column; best for large Fact tables (>2GB) joined on that key. Round-Robin tables distribute rows sequentially and evenly; best for fast loading staging heaps. Replicated tables maintain a full local copy on every compute node; best for small Dimension tables (<2GB) to eliminate network shuffle during joins.",
        "keyPoints": [
            "Hash Distributed: Best for Fact tables > 2GB; choose high-cardinality, non-null, evenly distributed join keys.",
            "Never hash on date columns: Causes extreme data skew where today's transactions land on one distribution.",
            "Round-Robin: Default for staging tables; achieves maximum load throughput with zero hash overhead.",
            "Replicated: Best for Dimension tables < 2GB; eliminates Data Movement Service (DMS) shuffle broadcast during joins.",
            "Data Skew: When one distribution holds disproportionate rows, query performance degrades to the slowest node."
        ],
        "sources": [
            {
                "title": "Guidance for designing distributed tables using dedicated SQL pool",
                "url": "https://learn.microsoft.com/en-us/azure/synapse-analytics/sql-data-warehouse/sql-data-warehouse-tables-distribute",
                "publisher": "Microsoft Learn"
            }
        ]
    },
    {
        "id": "synapse-resource-classes",
        "term": "Azure Synapse Resource Classes (Static vs. Dynamic)",
        "category": "DATABASE ARCHITECTURE",
        "difficulty": "ARCHITECT",
        "definition": "Pre-determined resource limits and memory allocation governance profiles assigned to database roles in Azure Synapse to control query memory grants and concurrency.",
        "explanation": "In Azure Synapse dedicated SQL pools, memory and concurrency are managed via Resource Classes. Static Resource Classes (staticrc10 to staticrc80) allocate a fixed amount of memory to a query regardless of the current DWU level, making them ideal for predictable data loading and ETL jobs. Dynamic Resource Classes (smallrc, mediumrc, largerc, xlargerc) scale memory allocation proportionally with the provisioned DWU level, making them suitable for complex queries that require more memory as the cluster scales.",
        "keyPoints": [
            "Resource classes govern query memory grants and determine the number of concurrent queries supported.",
            "Static Resource Classes allocate fixed memory independent of DWU level (e.g. staticrc20).",
            "Dynamic Resource Classes allocate a percentage of total cluster memory, scaling automatically with DWU.",
            "Assigning users to overly large resource classes restricts cluster concurrency.",
            "Loading operations typically run under staticrc20 to staticrc40 for stable memory guarantees."
        ],
        "sources": [
            {
                "title": "Resource classes for workload management in Azure Synapse Analytics",
                "url": "https://learn.microsoft.com/en-us/azure/synapse-analytics/sql-data-warehouse/resource-classes-for-workload-management",
                "publisher": "Microsoft Learn"
            }
        ]
    },
    {
        "id": "sql-parameter-sniffing-plan-cache",
        "term": "Parameter Sniffing & Query Plan Cache Mechanics",
        "category": "SQL SERVER",
        "difficulty": "HARD",
        "definition": "A database optimizer behavior where a query plan is compiled and cached using parameter values from its initial invocation, leading to severe performance degradation on subsequent runs with different data distributions.",
        "explanation": "When a stored procedure executes for the first time, the query optimizer sniffs the input parameter to estimate cardinality and build a plan. If the initial run uses an atypical parameter (e.g. status='CANCELLED' matching 5 rows), the optimizer compiles a lightweight plan with Nested Loops and Index Seeks. If the next execution passes status='COMPLETED' matching 5,000,000 rows, reusing that cached plan forces millions of nested loop iterations, exhausting CPU and causing production timeouts.",
        "keyPoints": [
            "Initial execution parameter determines the cached execution plan for all subsequent executions.",
            "Causes intermittent, unpredictable latency spikes where the same stored procedure runs in 20ms or 4 minutes.",
            "Remediation 1: Use OPTION (OPTIMIZE FOR UNKNOWN) for balanced, average distribution plans.",
            "Remediation 2: Use OPTION (RECOMPILE) for queries where parameter cardinality variance is extreme.",
            "Remediation 3: Local variable masking hides parameter values from initial sniffing."
        ],
        "sources": [
            {
                "title": "Investigating and Resolving Parameter Sniffing Issues",
                "url": "https://learn.microsoft.com/en-us/sql/relational-databases/query-processing-architecture-guide",
                "publisher": "Microsoft Learn"
            }
        ]
    },
    {
        "id": "spark-sql-broadcast-joins-and-skew-salting",
        "term": "Spark SQL Broadcast Joins & Key Salting for Data Skew",
        "category": "SPARK & DATABRICKS",
        "difficulty": "ARCHITECT",
        "definition": "Distributed query execution techniques in Apache Spark to eliminate shuffle bottlenecks during asymmetric joins and mitigate executor memory exhaustion caused by skewed join keys.",
        "explanation": "Broadcast Hash Join (BHJ) copies a small DataFrame (<10MB default threshold) to all worker executors, eliminating expensive network shuffles and sort phases. When joining two massive DataFrames where one key is heavily skewed (e.g. 80% of rows share key='NULL' or key='UNKNOWN'), a single executor receives the majority of data and fails with OOM. Key Salting appends a random integer (salt between 0 and K-1) to the skewed key on the large table and replicates the matching dimension keys K times, distributing the bottleneck evenly across all executors.",
        "keyPoints": [
            "Broadcast Joins eliminate shuffle by broadcasting tables under spark.sql.autoBroadcastJoinThreshold to executors.",
            "Avoids sorting and shuffle files; delivers O(M) linear scan performance.",
            "Data Skew causes straggler tasks where 99% of tasks finish in seconds and 1 task runs for hours.",
            "Key Salting: Appends random(0, K-1) to the skewed key and explodes matching dimension table by K rows.",
            "Spark 3.0+ Adaptive Query Execution (AQE) dynamically mitigates skew via spark.sql.adaptive.skewJoin.enabled."
        ],
        "sources": [
            {
                "title": "Performance Tuning - Spark SQL Guide",
                "url": "https://spark.apache.org/docs/latest/sql-performance-tuning.html",
                "publisher": "Apache Spark Documentation"
            }
        ]
    },
    {
        "id": "spark-partitioning-vs-bucketing-internals",
        "term": "Spark Partitioning vs. Bucketing Architecture",
        "category": "SPARK & DATABRICKS",
        "difficulty": "HARD",
        "definition": "The two primary storage organization techniques in Apache Spark that govern physical directory layouts, file pruning, and shuffle elimination.",
        "explanation": "Partitioning divides data into physical subdirectories based on distinct column values (e.g., /year=2024/month=11/). It is optimal for coarse-grained filtering on low-to-medium cardinality columns (<10,000 distinct values). Bucketing pre-hashes and sorts high-cardinality columns into a fixed number of bucket files within partitions. When two datasets are bucketed on the same join key into identical bucket counts, Spark executes a Sort-Merge Join locally without any network shuffle.",
        "keyPoints": [
            "Partitioning: Creates physical filesystem directory hierarchies based on column values.",
            "High-cardinality partitioning causes the 'small file problem' and metastore metadata bloat.",
            "Bucketing: Hashes high-cardinality columns into a fixed number of pre-sorted bucket files.",
            "Co-bucketed joins eliminate shuffle exchange phases in Spark SQL query execution plans.",
            "Delta Lake Liquid Clustering modernizes this by dynamically clustering data without static directories."
        ],
        "sources": [
            {
                "title": "Spark SQL Architecture and Partitioning",
                "url": "https://spark.apache.org/docs/latest/sql-data-sources-parquet.html",
                "publisher": "Apache Spark Documentation"
            }
        ]
    }
]

# --- 2. Define New Questions ---
new_questions = [
    {
        "id": "q-sql-second-highest-salary-no-limit",
        "source": "SQL Archive & Lakehouse Architect",
        "category": "SQL SERVER",
        "niche": "Interview & Analytical SQL",
        "difficulty": "MEDIUM",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Analytic & Window Functions",
        "linked_concept_id": "sql-row-number-vs-rank-vs-dense-rank",
        "question": "How do you find the second-highest salary in an Employees table without using LIMIT, TOP, or OFFSET?",
        "answer": "To retrieve the second-highest salary without engine-specific row limiting clauses (LIMIT/TOP), you can use either DENSE_RANK() in a CTE or an ANSI subquery with MAX().\n\nMethod 1 (DENSE_RANK - Recommended for duplicate handling):\n```sql\nWITH RankedSalaries AS (\n    SELECT \n        salary, \n        DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk\n    FROM Employees\n)\nSELECT DISTINCT salary\nFROM RankedSalaries\nWHERE rnk = 2;\n```\n\nMethod 2 (Correlated MAX Subquery - Pure ANSI SQL):\n```sql\nSELECT MAX(salary) AS SecondHighestSalary\nFROM Employees\nWHERE salary < (\n    SELECT MAX(salary) \n    FROM Employees\n);\n```\n\nWhy DENSE_RANK() is preferred over RANK(): If multiple employees tie for the highest salary (e.g., $100k, $100k, $90k), RANK() assigns [1, 1, 3], skipping rank 2 entirely. DENSE_RANK() assigns [1, 1, 2], correctly returning $90k.",
        "sources": [
            {
                "title": "Ranking Functions (Transact-SQL)",
                "url": "https://learn.microsoft.com/en-us/sql/t-sql/functions/ranking-functions-transact-sql",
                "publisher": "Microsoft Learn"
            }
        ]
    },
    {
        "id": "q-sql-consecutive-active-days-islands-gaps",
        "source": "SQL Archive & Lakehouse Architect",
        "category": "SQL SERVER",
        "niche": "Interview & Analytical SQL",
        "difficulty": "HARD",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Analytic & Window Functions",
        "linked_concept_id": "sql-row-number-vs-rank-vs-dense-rank",
        "question": "How do you identify users who have logged in for 3 or more consecutive days using SQL (The Islands and Gaps Problem)?",
        "answer": "The classic solution uses the difference-of-row-numbers technique. When a sequential row number is subtracted from a continuous date sequence, the resulting date difference remains constant throughout an unbroken streak ('island').\n\n```sql\nWITH DeduplicatedLogins AS (\n    -- Step 1: Collapse multiple logins per day to one record\n    SELECT DISTINCT user_id, CAST(login_time AS DATE) AS login_date\n    FROM UserLogins\n),\nStreakGroups AS (\n    -- Step 2: Compute the island group key\n    SELECT \n        user_id,\n        login_date,\n        DATEADD(day, -ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY login_date), login_date) AS streak_group\n    FROM DeduplicatedLogins\n)\n-- Step 3: Filter groups with 3 or more continuous days\nSELECT \n    user_id,\n    MIN(login_date) AS streak_start,\n    MAX(login_date) AS streak_end,\n    COUNT(*) AS consecutive_days\nFROM StreakGroups\nGROUP BY user_id, streak_group\nHAVING COUNT(*) >= 3;\n```\n\nMathematical Proof: If dates are Day 1, Day 2, Day 3 with row numbers 1, 2, 3: (Day 1 - 1) = Day 0; (Day 2 - 2) = Day 0; (Day 3 - 3) = Day 0. The constant difference (Day 0) acts as the grouping anchor for the entire continuous streak.",
        "sources": [
            {
                "title": "Islands and Gaps in SQL",
                "url": "https://learn.microsoft.com/en-us/sql/t-sql/queries/select-over-clause-transact-sql",
                "publisher": "Microsoft Learn"
            }
        ]
    },
    {
        "id": "q-sql-delete-duplicate-rows-cte",
        "source": "SQL Archive & Lakehouse Architect",
        "category": "SQL SERVER",
        "niche": "Data Cleaning & Production DML",
        "difficulty": "MEDIUM",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Relational Foundations & Execution Order",
        "linked_concept_id": "sql-row-number-vs-rank-vs-dense-rank",
        "question": "How do you delete duplicate rows from a table while preserving exactly one record (e.g. the lowest ID)?",
        "answer": "In T-SQL, PostgreSQL, and Oracle, you can delete directly from a Common Table Expression (CTE) partitioned by duplicate columns and ordered by primary key.\n\n```sql\nWITH DuplicateCTE AS (\n    SELECT \n        id,\n        email,\n        ROW_NUMBER() OVER (\n            PARTITION BY email \n            ORDER BY id ASC\n        ) AS rn\n    FROM Customers\n)\nDELETE FROM DuplicateCTE\nWHERE rn > 1;\n```\n\nIn MySQL (which does not support deleting directly from CTEs prior to 8.0 or requires self-joins):\n```sql\nDELETE c1 FROM Customers c1\nINNER JOIN Customers c2 \n   ON c1.email = c2.email \n  AND c1.id > c2.id;\n```\n\nProduction Warning: For massive production tables (>1M rows), deleting in a single transaction can cause severe lock escalation (row to table lock) and transaction log exhaustion. Always batch deletions in chunks of 5,000 to 10,000 rows.",
        "sources": [
            {
                "title": "WITH common_table_expression (Transact-SQL)",
                "url": "https://learn.microsoft.com/en-us/sql/t-sql/queries/with-common-table-expression-transact-sql",
                "publisher": "Microsoft Learn"
            }
        ]
    },
    {
        "id": "q-sql-employees-earning-more-than-managers",
        "source": "SQL Archive & Lakehouse Architect",
        "category": "SQL SERVER",
        "niche": "Interview & Relational Queries",
        "difficulty": "EASY",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Relational Foundations & Execution Order",
        "linked_concept_id": "sql-logical-query-execution-order",
        "question": "Write an SQL query to find all employees who earn more than their direct managers.",
        "answer": "This problem is solved using a self-join where the Employee table is joined to itself under two distinct aliases: one representing the employee and the other representing the manager.\n\n```sql\nSELECT \n    e.employee_name AS EmployeeName,\n    e.salary AS EmployeeSalary,\n    m.employee_name AS ManagerName,\n    m.salary AS ManagerSalary\nFROM Employees e\nINNER JOIN Employees m \n   ON e.manager_id = m.employee_id\nWHERE e.salary > m.salary;\n```\n\nKey Concepts:\n1. Self-Join: e.manager_id matches m.employee_id.\n2. Filter: WHERE e.salary > m.salary ensures only employees exceeding their manager are output.\n3. Handling Top Executives: The CEO has a NULL manager_id. The INNER JOIN cleanly eliminates top executives without managers, avoiding false positives.",
        "sources": [
            {
                "title": "Joins (SQL Server)",
                "url": "https://learn.microsoft.com/en-us/sql/relational-databases/performance/joins",
                "publisher": "Microsoft Learn"
            }
        ]
    },
    {
        "id": "q-sql-not-in-null-trap-explanation",
        "source": "SQL Archive & Lakehouse Architect",
        "category": "SQL SERVER",
        "niche": "Production Pitfalls & Logic",
        "difficulty": "MEDIUM",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Relational Foundations & Execution Order",
        "linked_concept_id": "sql-three-valued-logic-null-trap",
        "question": "Why does a query using 'WHERE col NOT IN (SELECT col FROM subquery)' return zero rows if the subquery contains a single NULL value, and how do you fix it?",
        "answer": "In SQL three-valued logic (3VL), comparisons with NULL evaluate to UNKNOWN. The expression:\n`WHERE x NOT IN (1, 2, NULL)`\nexpands logically to:\n`WHERE x != 1 AND x != 2 AND x != NULL`\n\nBecause `x != NULL` evaluates to UNKNOWN, any truth table conjunction with UNKNOWN evaluates to UNKNOWN or FALSE. Rows are only returned when the WHERE predicate evaluates to TRUE. Thus, if a subquery produces even one NULL, the entire NOT IN expression evaluates to UNKNOWN for every outer row, silently suppressing all results.\n\nFix 1 (Recommended: NOT EXISTS):\n```sql\nSELECT u.* \nFROM Users u\nWHERE NOT EXISTS (\n    SELECT 1 \n    FROM Blacklist b \n    WHERE b.user_id = u.user_id\n);\n```\n\nFix 2 (Explicit NULL Filtering):\n```sql\nSELECT * \nFROM Users\nWHERE user_id NOT IN (\n    SELECT user_id \n    FROM Blacklist \n    WHERE user_id IS NOT NULL\n);\n```\n\nNOT EXISTS is vastly preferred because it utilizes two-valued boolean logic and allows the optimizer to perform an efficient Anti-Semi-Join.",
        "sources": [
            {
                "title": "Null Values (Transact-SQL)",
                "url": "https://learn.microsoft.com/en-us/sql/t-sql/language-elements/null-and-unknown-transact-sql",
                "publisher": "Microsoft Learn"
            }
        ]
    },
    {
        "id": "q-sql-deadlock-prevention-rules",
        "source": "SQL Archive & Lakehouse Architect",
        "category": "SQL SERVER",
        "niche": "Production Reliability & DBA",
        "difficulty": "HARD",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Production Reliability, Concurrency & Locking",
        "linked_concept_id": "sql-deadlock-detection-and-prevention",
        "question": "What is a database Deadlock, what causes it, and what are the top 4 rules to prevent deadlocks in high-throughput production systems?",
        "answer": "A Deadlock is an unresolvable concurrency condition where two or more sessions hold locks on separate resources while each requests an exclusive lock on the resource held by the other. The engine's deadlock monitor detects the cycle and terminates one transaction (the 'deadlock victim') with Error 1205.\n\nTop 4 Production Rules to Prevent Deadlocks:\n1. Strict Deterministic Resource Access Order: Ensure all application transactions and stored procedures update tables and rows in the identical sequence (e.g. always Table A then Table B; sort row updates by Primary Key).\n2. Minimize Transaction Duration: Keep transactions as brief as possible. Compute data outside transactions and never invoke external HTTP calls or user interactions inside an open transaction.\n3. Enable Read Committed Snapshot Isolation (RCSI): In SQL Server/PostgreSQL, MVCC/RCSI allows readers to read consistent point-in-time row snapshots without taking shared (S) locks, completely preventing readers and writers from blocking each other.\n4. Avoid Lock Escalation on Bulk Operations: Modify large tables in batches of 2,000–5,000 rows to prevent the engine from escalating granular row locks to a coarse table-level lock.",
        "sources": [
            {
                "title": "Deadlocking Guide - SQL Server",
                "url": "https://learn.microsoft.com/en-us/sql/relational-databases/native-client-ole-db-transactions/isolation-levels",
                "publisher": "Microsoft Learn"
            }
        ]
    },
    {
        "id": "q-sql-synapse-distribution-column-selection",
        "source": "SQL Archive & Lakehouse Architect",
        "category": "DATABASE ARCHITECTURE",
        "niche": "Cloud MPP & Azure Synapse",
        "difficulty": "ARCHITECT",
        "domain": "Data Lakehouse & Architecture",
        "subdomain": "Cloud MPP Data Warehousing",
        "linked_concept_id": "synapse-mpp-table-distributions",
        "question": "What are the rules and criteria for selecting an optimal Hash Distribution column for an analytical Fact table in Azure Synapse Analytics / SQL DW?",
        "answer": "Azure Synapse distributes table data across 60 fixed storage locations. Choosing an improper distribution column causes severe Data Skew, where a few distributions process the majority of data while others sit idle.\n\nOptimal Hash Distribution Criteria:\n1. High Cardinality: The column must possess a large number of distinct values (at least thousands) so data spreads uniformly across all 60 distributions.\n2. Uniform Value Distribution: Avoid columns with heavy frequency skew (e.g. a 'Status' column where 95% of rows are 'ACTIVE').\n3. Frequent Join / Group By Column: Select a column frequently used in equality joins (e.g. CustomerID, OrderID). Joining two tables hash-distributed on the same key executes locally on each node without network shuffle (co-located join).\n4. Zero or Minimal NULLs: All NULL values hash to the exact same distribution, causing massive skew.\n5. NEVER use Date Columns: Distributing on TransactionDate causes extreme temporal skew where all data for today is written to a single compute distribution.",
        "sources": [
            {
                "title": "Guidance for designing distributed tables using dedicated SQL pool",
                "url": "https://learn.microsoft.com/en-us/azure/synapse-analytics/sql-data-warehouse/sql-data-warehouse-tables-distribute",
                "publisher": "Microsoft Learn"
            }
        ]
    },
    {
        "id": "q-sql-count-star-vs-count-1-vs-count-col",
        "source": "SQL Archive & Lakehouse Architect",
        "category": "SQL SERVER",
        "niche": "Core SQL Semantics",
        "difficulty": "EASY",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Relational Foundations & Execution Order",
        "linked_concept_id": "sql-logical-query-execution-order",
        "question": "What is the difference between COUNT(*), COUNT(1), and COUNT(column_name) in terms of semantics and performance?",
        "answer": "Semantics:\n1. COUNT(*): Counts the total number of rows in the table/group, regardless of whether columns contain NULL values.\n2. COUNT(1): Evaluates the literal constant 1 for each row and counts it. Because 1 is never NULL, COUNT(1) returns the exact same result as COUNT(*).\n3. COUNT(column_name): Counts only the rows where column_name is NOT NULL.\n\nPerformance:\nIn modern cost-based query optimizers (SQL Server, PostgreSQL, MySQL, Oracle), COUNT(*) and COUNT(1) compile into the exact same physical execution plan. The optimizer chooses the narrowest available non-clustered index on the table to scan the fewest disk pages.\n\nHowever, COUNT(column_name) requires the engine to inspect the specific column value for NULLs. If that column is not indexed, it forces a scan of that specific column data, incurring higher I/O than a narrow non-clustered index scan.",
        "sources": [
            {
                "title": "COUNT (Transact-SQL)",
                "url": "https://learn.microsoft.com/en-us/sql/t-sql/functions/count-transact-sql",
                "publisher": "Microsoft Learn"
            }
        ]
    }
]

# --- 3. Define New MSSQL Code Sheets ---
new_mssql_sheets = [
    {
        "id": "sql-a-09",
        "title": "Safe Chunked Batch Deletion Pattern",
        "level": "advanced",
        "category": "Production Operations & Maintenance",
        "description": "Purges millions of historical records from high-throughput tables in iterative small chunks to prevent transaction log full errors and avoid table lock escalation.",
        "code": "SET NOCOUNT ON;\nDECLARE @BatchSize INT = 5000;\nDECLARE @RowsDeleted INT = 1;\nDECLARE @TotalDeleted INT = 0;\n\nWHILE @RowsDeleted > 0\nBEGIN\n    BEGIN TRANSACTION;\n    \n    DELETE TOP (@BatchSize)\n    FROM dbo.fact_audit_log WITH (ROWLOCK)\n    WHERE log_date < DATEADD(month, -6, GETUTCDATE());\n    \n    SET @RowsDeleted = @@ROWCOUNT;\n    SET @TotalDeleted = @TotalDeleted + @RowsDeleted;\n    \n    COMMIT TRANSACTION;\n    \n    -- Optional: checkpoint log breath and reduce CPU throttling\n    WAITFOR DELAY '00:00:01';\nEND;\n\nPRINT CONCAT('Successfully deleted total records: ', @TotalDeleted);",
        "notes": [
            "Keeps transaction size strictly under 5,000 rows to prevent lock escalation from ROWLOCK to TABLOCK",
            "Short transactions allow the database checkpoint engine to truncate the transaction log (.ldf)",
            "WAITFOR DELAY yields CPU cycles back to concurrent OLTP workloads"
        ],
        "use_case": "Archiving historical telemetry, GDPR data deletion, and high-throughput production table maintenance without downtime."
    },
    {
        "id": "sql-i-11",
        "title": "7-Day Moving Average & Running Total Analytical Query",
        "level": "intermediate",
        "category": "Window Functions",
        "description": "Calculates running cumulative revenue and a rolling 7-day moving average using explicit ROWS BETWEEN window frame specifications.",
        "code": "SELECT \n    sale_date,\n    daily_revenue_eur,\n    -- Running Total: Cumulative sum from start to current row\n    SUM(daily_revenue_eur) OVER (\n        ORDER BY sale_date \n        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\n    ) AS running_total_revenue_eur,\n    -- 7-Day Moving Average: Current row plus previous 6 rows\n    AVG(daily_revenue_eur) OVER (\n        ORDER BY sale_date \n        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW\n    ) AS moving_avg_7d_eur,\n    -- Moving 7-Day Total Transaction Count\n    COUNT(*) OVER (\n        ORDER BY sale_date \n        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW\n    ) AS moving_window_count\nFROM dbo.fact_daily_sales_summary\nORDER BY sale_date;",
        "notes": [
            "Always specify ROWS BETWEEN rather than RANGE BETWEEN to guarantee predictable performance and avoid tie clumping",
            "Notice that for the first 6 days of the dataset, AVG() smoothly averages available preceding rows (1 to 6 days)",
            "Explicit frame prevents expensive tempdb spooling incurred by the default RANGE specification"
        ],
        "use_case": "Financial analytics, SaaS revenue run-rates, and smoothing noisy daily telemetry on the Azure SQL Silver reporting layer."
    },
    {
        "id": "sql-i-12",
        "title": "Engine-Agnostic Matrix Pivoting via Conditional Aggregation",
        "level": "intermediate",
        "category": "Aggregation & Grouping",
        "description": "Transposes quarterly rows into structured columns without relying on vendor-specific PIVOT keywords, compatible across all relational and cloud platforms.",
        "code": "SELECT \n    department_id,\n    fiscal_year,\n    SUM(CASE WHEN quarter = 'Q1' THEN revenue_eur ELSE 0 END) AS q1_revenue_eur,\n    SUM(CASE WHEN quarter = 'Q2' THEN revenue_eur ELSE 0 END) AS q2_revenue_eur,\n    SUM(CASE WHEN quarter = 'Q3' THEN revenue_eur ELSE 0 END) AS q3_revenue_eur,\n    SUM(CASE WHEN quarter = 'Q4' THEN revenue_eur ELSE 0 END) AS q4_revenue_eur,\n    SUM(revenue_eur) AS total_annual_revenue_eur\nFROM dbo.fact_department_financials\nGROUP BY department_id, fiscal_year\nORDER BY fiscal_year DESC, department_id ASC;",
        "notes": [
            "Works identically across SQL Server, PostgreSQL, MySQL, Oracle, Snowflake, BigQuery, and Spark SQL",
            "Using SUM(CASE ...) is cleaner, faster, and more flexible than proprietary PIVOT syntax when combining multiple aggregations",
            "Easily extended with FILTER (WHERE ...) clause in modern PostgreSQL / DuckDB"
        ],
        "use_case": "Financial quarterly rollups, cohort analysis, and transposing EAV (Entity-Attribute-Value) models for Power BI matrix visual consumption."
    },
    {
        "id": "sql-a-10",
        "title": "Azure Synapse Maximum Throughput Staging Ingestion Pattern",
        "level": "architect",
        "category": "Cloud MPP & Synapse",
        "description": "Configures a dedicated staging table with Round-Robin distribution and Heap storage to achieve maximum ingestion throughput during ELT pipelines.",
        "code": "-- Step 1: Create Staging Table with Round-Robin and Heap\nCREATE TABLE stg.orders_raw_ingest\nWITH (\n    DISTRIBUTION = ROUND_ROBIN,\n    HEAP\n)\nAS\nSELECT * FROM dbo.fact_orders WHERE 1 = 0;\n\n-- Step 2: High-speed ingestion via COPY INTO\nCOPY INTO stg.orders_raw_ingest\nFROM 'https://mystorageaccount.dfs.core.windows.net/landing/orders/*.parquet'\nWITH (\n    FILE_TYPE = 'PARQUET',\n    CREDENTIAL = (IDENTITY = 'Managed Identity')\n);\n\n-- Step 3: Insert into Production Clustered Columnstore Fact Table\nINSERT INTO prod.fact_orders (order_id, customer_id, order_date, total_amount_eur)\nSELECT order_id, customer_id, order_date, total_amount_eur\nFROM stg.orders_raw_ingest;\n\n-- Step 4: Fast truncate staging table\nTRUNCATE TABLE stg.orders_raw_ingest;",
        "notes": [
            "Round-Robin spreads data uniformly across all 60 distributions with zero hash calculation overhead",
            "Heap storage avoids index maintenance and rowgroup compression overhead during bulk ingest",
            "Bulk loading into staging before inserting into production Fact ensures clean transaction boundaries and simple retry logic"
        ],
        "use_case": "High-volume data warehouse ingestion pipelines handling gigabytes to terabytes per hour in Azure Synapse Analytics."
    },
    {
        "id": "sql-a-11",
        "title": "Mitigating Parameter Sniffing via OPTIMIZE FOR and RECOMPILE",
        "level": "advanced",
        "category": "Performance Tuning",
        "description": "Hardens stored procedures against cached execution plan regressions caused by parameter sniffing across heavily skewed datasets.",
        "code": "CREATE OR ALTER PROCEDURE dbo.usp_get_orders_by_status\n    @order_status VARCHAR(20)\nAS\nBEGIN\n    SET NOCOUNT ON;\n    \n    -- Strategy 1: Standard query with OPTIMIZE FOR UNKNOWN\n    -- Generates a stable plan based on average statistical distribution\n    SELECT \n        order_id,\n        customer_id,\n        order_date,\n        total_amount_eur\n    FROM dbo.fact_orders\n    WHERE order_status = @order_status\n    OPTION (OPTIMIZE FOR (@order_status UNKNOWN));\n    \n    -- Strategy 2: For extreme cardinality differences, force statement-level recompile\n    -- SELECT * FROM dbo.fact_orders WHERE order_status = @order_status OPTION (RECOMPILE);\nEND;",
        "notes": [
            "OPTIMIZE FOR UNKNOWN instructs the query optimizer to use the density vector rather than sniffing the runtime value",
            "OPTION (RECOMPILE) produces an optimal plan per call at the cost of a few milliseconds of CPU compilation time",
            "Prevents production latency spikes where a 50ms procedure intermittently stalls for 60 seconds"
        ],
        "use_case": "Production OLTP APIs and ETL stored procedures filtering on volatile status or flag columns."
    },
    {
        "id": "sql-a-12",
        "title": "Deduplication with Earliest Record Preservation using CTE",
        "level": "intermediate",
        "category": "Data Quality & Cleansing",
        "description": "Eliminates duplicate entities across business keys while preserving the earliest original record using ROW_NUMBER() and a Common Table Expression.",
        "code": "WITH ranked_duplicates AS (\n    SELECT \n        customer_sk,\n        customer_id,\n        email,\n        created_at,\n        ROW_NUMBER() OVER (\n            PARTITION BY email \n            ORDER BY created_at ASC, customer_sk ASC\n        ) AS duplicate_rank\n    FROM dbo.dim_customers\n)\nDELETE FROM ranked_duplicates\nWHERE duplicate_rank > 1;\n\n-- Verify zero duplicates remain\nSELECT email, COUNT(*)\nFROM dbo.dim_customers\nGROUP BY email\nHAVING COUNT(*) > 1;",
        "notes": [
            "T-SQL and PostgreSQL allow direct DELETE operations through Common Table Expressions",
            "ORDER BY created_at ASC preserves the first seen record; DESC would preserve the most recent record",
            "For tables > 500,000 rows, combine with chunked deletion to prevent lock escalation"
        ],
        "use_case": "Silver-layer customer Master Data Management (MDM) deduplication and CRM reconciliation pipelines."
    }
]

# --- 4. Define New Modern Concepts ---
new_modern_concepts = [
    {
        "id": "mc-synapse-mpp-distribution",
        "title": "Azure Synapse 60-Distribution MPP Storage Architecture",
        "subdomain": "compute-engines",
        "difficulty": "ARCHITECT",
        "summary": "Azure Synapse distributes queries across 60 fixed storage buckets via Control Node orchestration and compute nodes, requiring deliberate Hash, Round-Robin, and Replicated data placement.",
        "details": "Massively Parallel Processing (MPP) achieves high throughput by breaking data across 60 distributions. Hash Distributed tables partition Fact data (>2GB) across nodes on high-cardinality join keys to enable co-located joins without network shuffle. Round-Robin tables spread staging data evenly for maximum write throughput. Replicated tables cache small Dimension data (<2GB) on every compute node, completely eliminating Data Movement Service (DMS) broadcast latency."
    },
    {
        "id": "mc-snowflake-qualify-filtering",
        "title": "Snowflake & BigQuery QUALIFY Clause Execution Pipeline",
        "subdomain": "compute-engines",
        "difficulty": "HARD",
        "summary": "The QUALIFY clause extends the SQL execution pipeline to filter window function results directly, eliminating boilerplate CTEs and nested subqueries.",
        "details": "Because window functions evaluate during the SELECT stage, standard SQL prevents window filtering in WHERE or HAVING clauses. Engines like Snowflake, BigQuery, and Databricks introduce QUALIFY as a post-window filter stage immediately preceding final ORDER BY. This provides dramatic syntax simplification for top-N ranking, sessionization, and deduplication queries."
    },
    {
        "id": "mc-spark-skew-salting",
        "title": "Apache Spark Distributed Join Skew Mitigation via Key Salting",
        "subdomain": "compute-engines",
        "difficulty": "ARCHITECT",
        "summary": "Salting mitigates data skew stragglers during distributed joins by appending random keys to heavy partitions and exploding matching dimension records.",
        "details": "In distributed shuffle joins, extreme key skew (e.g., 90% of rows sharing key='UNKNOWN') forces a single executor to process gigabytes while peer nodes idle, leading to container killed / OOM errors. Salting appends random(0, K-1) to the skewed key and cross-replicates the dimension table K times. Spark 3.0+ Adaptive Query Execution (AQE) can dynamically split skewed partitions at runtime."
    },
    {
        "id": "mc-delta-liquid-clustering",
        "title": "Delta Lake Liquid Clustering vs. Static Partitioning",
        "subdomain": "lakehouse-formats",
        "difficulty": "HARD",
        "summary": "Liquid clustering replaces legacy directory-based Hive partitioning and manual Z-ordering with flexible Hilbert curve multidimensional data organization.",
        "details": "Legacy partitioning (/year=2024/month=11/) causes small file fragmentation, partition skew, and costly full-table rewrites when query patterns change. Delta Lake Liquid Clustering decouples clustering keys from physical directory paths, allowing clustering columns to be added or modified dynamically without table rewrites, and automatically coalescing files during writes."
    }
]

def append_dataset(filepath, new_items, key_field='id'):
    print(f"\nProcessing {filepath}...")
    with open(filepath, 'r', encoding='utf-8') as f:
        existing = json.load(f)
    
    existing_ids = {item[key_field] for item in existing}
    added = 0
    for item in new_items:
        if item[key_field] in existing_ids:
            print(f"  [SKIPPED] ID already exists: {item[key_field]}")
        else:
            existing.append(item)
            existing_ids.add(item[key_field])
            added += 1
            print(f"  [ADDED] {item[key_field]}")
            
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(existing, f, indent=2, ensure_ascii=False)
        
    print(f"Completed {filepath}: Added {added} items. Total: {len(existing)}")
    return added

# Execute appends
c_added = append_dataset(CONCEPTS_FILE, new_concepts)
q_added = append_dataset(QUESTIONS_FILE, new_questions)
m_added = append_dataset(MSSQL_FILE, new_mssql_sheets)
mc_added = append_dataset(MODERN_CONCEPTS_FILE, new_modern_concepts)

print(f"\n=== SUMMARY OF APPENDED KNOWLEDGE BASE ITEMS ===")
print(f"Concepts added: {c_added}")
print(f"Questions added: {q_added}")
print(f"MSSQL Code Sheets added: {m_added}")
print(f"Modern Concepts added: {mc_added}")
