import json
import os

FILE = 'src/data/json/data_concepts.json'

with open(FILE, 'r', encoding='utf-8') as f:
    data = json.load(f)

before_count = len(data)
existing_ids = {item['id'] for item in data}
print(f"Existing concepts count: {before_count}")

new_concepts = [
    {
        "id": "sargability-query-optimization",
        "term": "SARGability (Search Argument Able)",
        "category": "SQL SERVER",
        "difficulty": "MEDIUM",
        "definition": "SARGability refers to query predicates written in a structure that allows relational query optimizers to utilize B-tree index seeks rather than forcing full table or clustered index scans.",
        "explanation": "Wrapping indexed columns inside functions (e.g. WHERE YEAR(order_date) = 2024 or WHERE SUBSTRING(phone, 1, 3) = '415') breaks SARGability because the engine cannot evaluate the B-tree boundary pointers without evaluating the function for every single row. Rewriting predicates to isolate the column (e.g. WHERE order_date >= '2024-01-01' AND order_date < '2025-01-01') enables logarithmic index seek traversal.",
        "keyPoints": [
            "Index Seek vs Scan: SARGable predicates allow traversing B-tree index pages from root to leaf in O(log N) operations.",
            "Function Invalidation: Avoid mathematical or string functions on indexed columns on the left-hand side of comparison operators.",
            "Implicit Conversions: Data type mismatches (e.g. comparing VARCHAR to NVARCHAR) cause CONVERT_IMPLICIT operators, breaking SARGability.",
            "Wildcard Traps: LIKE 'abc%' is SARGable (range seek), whereas LIKE '%abc' forces a full index scan."
        ]
    },
    {
        "id": "sql-window-frame-specifications",
        "term": "SQL Window Frame Specifications (ROWS vs. RANGE)",
        "category": "SQL SERVER",
        "difficulty": "HARD",
        "definition": "Window frame specifications define the exact subset of rows within a partition evaluated by an analytic or aggregate window function using physical row counts (ROWS) or logical value offsets (RANGE).",
        "explanation": "By default, an ORDER BY clause inside an OVER() specification applies RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, which can cause unexpected duplicate handling for tied values and higher spool memory usage. Specifying ROWS BETWEEN explicitly (e.g. ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) enables deterministic, high-performance physical row sliding frames for rolling metrics.",
        "keyPoints": [
            "Physical vs Logical: ROWS evaluates physical row offsets; RANGE evaluates logical value boundaries based on the ORDER BY expression.",
            "Default Frame Trap: Omitting the frame with ORDER BY defaults to RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, degrading performance.",
            "Rolling Calculations: ROWS BETWEEN N PRECEDING AND CURRENT ROW is the standard design pattern for rolling 7-day and 30-day moving averages.",
            "Ties Handling: RANGE includes all duplicate tied values up to the current row boundary, whereas ROWS slices strictly by row index."
        ]
    },
    {
        "id": "three-valued-logic-null-traps",
        "term": "Three-Valued Logic & NULL Propagation",
        "category": "SQL SERVER",
        "difficulty": "MEDIUM",
        "definition": "SQL evaluates boolean expressions using three-valued logic (3VL): TRUE, FALSE, and UNKNOWN, where any direct comparison against NULL yields UNKNOWN.",
        "explanation": "Because comparisons like col = NULL or col != 5 evaluate to UNKNOWN when col is NULL, WHERE clauses (which only retain rows evaluating strictly to TRUE) discard these records. A notorious production trap occurs in NOT IN subqueries: if a subquery returns a single NULL value, NOT IN evaluates to UNKNOWN for all outer records, resulting in an entirely empty result set.",
        "keyPoints": [
            "Ternary Evaluation: Boolean conditions evaluate to TRUE, FALSE, or UNKNOWN; WHERE filters discard both FALSE and UNKNOWN.",
            "NOT IN Subquery Trap: If subquery contains ANY NULL, NOT IN returns an empty set. Always use NOT EXISTS instead.",
            "Null-Safe Comparison: Use IS NULL or IS NOT NULL, or wrapper functions like COALESCE(col, default) for deterministic checks.",
            "CHECK Constraint Quirk: In CHECK constraints, rows pass if the expression evaluates to TRUE or UNKNOWN, meaning NULL values bypass validation."
        ]
    },
    {
        "id": "read-committed-snapshot-isolation-rcsi",
        "term": "Read Committed Snapshot Isolation (RCSI)",
        "category": "SQL SERVER",
        "difficulty": "HARD",
        "definition": "RCSI is an optimistic concurrency model in Microsoft SQL Server that uses row versioning in TempDB to allow readers to access committed row versions without acquiring shared locks.",
        "explanation": "Under standard pessimistic Read Committed isolation, select queries acquire shared (S) locks that block concurrent exclusive (X) update locks, leading to lock escalation and deadlocks. RCSI provides statement-level read consistency by directing readers to the Persistent Version Store or TempDB row versions, eliminating read-write blocking while keeping application query syntax unchanged.",
        "keyPoints": [
            "Zero Reader-Writer Blocking: Readers do not block writers, and writers do not block readers.",
            "TempDB Overhead: Row versions are stored in TempDB (or Persistent Version Store in SQL Server 2019+), requiring adequate I/O provisioning.",
            "Database-Level Activation: Enabled via ALTER DATABASE db_name SET READ_COMMITTED_SNAPSHOT ON WITH ROLLBACK IMMEDIATE.",
            "Deadlock Elimination: Resolves the majority of Error 1205 deadlocks arising from concurrent reporting reads during batch ETL writes."
        ]
    },
    {
        "id": "the-halloween-problem-mutation-anomaly",
        "term": "The Halloween Problem & Mutation Spooling",
        "category": "SQL SERVER",
        "difficulty": "ARCHITECT",
        "definition": "The Halloween Problem is a relational engine anomaly where an UPDATE operation modifies an indexed column used to locate qualifying rows, causing the query to repeatedly visit and update the same rows.",
        "explanation": "First discovered at IBM on Halloween 1976 during a query giving a 10% raise to employees earning under $25,000 (which repeatedly raised qualifying employees until all exceeded $25,000). Modern relational optimizers detect this condition and insert a blocking 'Eager Spool' or snapshot operator into the execution plan to fully read and stage qualifying row locators before executing any physical write modifications.",
        "keyPoints": [
            "Mutation Feedback Loop: Occurs when an UPDATE modifies the same indexed key that governs the scan order.",
            "Eager Spool Operator: Cost-based optimizer injects a blocking Table Spool to fully decouple the read phase from the write phase.",
            "TempDB Overhead: Spooling millions of modified rows can exhaust TempDB storage if not planned with sufficient allocation.",
            "Merge Statements: Modern MERGE and UPDATE FROM statements rely on mutation isolation to guarantee atomic, single-pass evaluation."
        ]
    },
    {
        "id": "clustered-columnstore-rowgroup-health",
        "term": "Clustered Columnstore Rowgroup Health",
        "category": "MODERN LAKEHOUSE",
        "difficulty": "ARCHITECT",
        "definition": "Columnstore rowgroup health measures the size, compaction state, and row count of columnar rowgroups, where the optimal target is exactly 1,048,576 rows per compressed rowgroup.",
        "explanation": "In Azure Synapse, SQL Server, and cloud data warehouses, Clustered Columnstore Indexes (CCI) compress data into horizontal rowgroups. If batches smaller than 102,400 rows are inserted, records land in uncompressed B-tree 'OPEN delta stores', degrading query performance. Monitoring sys.pdw_nodes_column_store_row_group_physical_stats ensures rowgroups remain trimmed and compressed via index rebuilds.",
        "keyPoints": [
            "Optimal Sizing: Exactly 1,048,576 rows per rowgroup yields maximum columnar dictionary and run-length compression.",
            "Delta Store Threshold: Inserts < 102,400 rows bypass columnar compression and land in rowstore delta stores.",
            "Memory Trimming: Insufficient query memory grants during index builds cause rowgroups to close prematurely with suboptimal row counts.",
            "Reorganization & Rebuild: Running ALTER INDEX ... REBUILD consolidates fragmented delta rowgroups into fully compressed columnar segments."
        ]
    },
    {
        "id": "volcano-iterator-vs-vectorized-execution",
        "term": "Volcano Iterator vs. Vectorized Execution",
        "category": "SPARK & DATABRICKS",
        "difficulty": "ARCHITECT",
        "definition": "The Volcano Iterator model processes queries tuple-at-a-time via a pull-based next() interface, whereas Vectorized Execution processes batches of column vectors directly in CPU cache.",
        "explanation": "Classic relational engines (SQL Server, Postgres) rely on the Volcano model, which incurs high virtual function call overhead and poor CPU instruction cache locality. Modern analytics engines (DuckDB, ClickHouse, Databricks Photon, Snowflake) use vectorized processing, streaming 1,024–4,096 column values per batch through SIMD CPU registers, achieving 10x–50x higher compute throughput.",
        "keyPoints": [
            "Volcano Overhead: Calling next() for every single row across billions of records saturates CPU with function call dispatch.",
            "Vectorized SIMD: Operates on columnar memory buffers directly within L1/L2 CPU cache, enabling SIMD vector parallel instructions.",
            "Photon & DuckDB: Native C++ vectorized execution engines designed specifically to saturate modern multi-core NVMe pipelines.",
            "Whole-Stage Code Generation: Alternative approach (Spark Tungsten) that flattens query plans into tight bytecode loops to minimize function calls."
        ]
    },
    {
        "id": "azure-sql-optimized-locking",
        "term": "Azure SQL Optimized Locking",
        "category": "SQL SERVER",
        "difficulty": "HARD",
        "definition": "Optimized Locking is a database engine capability in Azure SQL that replaces traditional multi-granularity page/row locks with Transaction-ID (XACT) locking and Lock-After-Qualification (LAQ).",
        "explanation": "In traditional Two-Phase Locking (2PL), large update operations acquire thousands of individual row and page locks, exhausting database lock memory and triggering lock escalation to table locks. Optimized Locking holds a single lock on the transaction itself and uses LAQ to evaluate predicates against row versions, acquiring update locks only when rows strictly qualify for modification.",
        "keyPoints": [
            "Transaction-ID (XACT) Locking: Replaces thousands of individual row locks with a single lock tied to the active transaction ID.",
            "Lock-After-Qualification (LAQ): Evaluates WHERE predicates without locking; acquires exclusive locks only upon confirmed match.",
            "Eliminates Lock Escalation: Prevents concurrent batch updates from escalating to exclusive table locks.",
            "Status Verification: Inspected via DATABASEPROPERTYEX(DB_NAME(), 'IsOptimizedLockingOn') and sys.dm_tran_locks."
        ]
    },
    {
        "id": "qualify-clause-window-filtering",
        "term": "QUALIFY Clause Window Filtering",
        "category": "MODERN LAKEHOUSE",
        "difficulty": "MEDIUM",
        "definition": "The QUALIFY clause filters the results of window functions directly within a single SELECT statement without requiring nested subqueries or Common Table Expressions.",
        "explanation": "In standard SQL, window functions cannot be filtered in WHERE or HAVING clauses due to logical execution order. Modern cloud analytical data warehouses (Snowflake, Google BigQuery, Databricks SQL, DuckDB, Teradata) introduced QUALIFY to evaluate predicates directly against window calculations, simplifying query syntax and enabling cleaner optimizer plan generation.",
        "keyPoints": [
            "Boilerplate Elimination: Replaces verbose WITH ranked_cte AS (...) SELECT ... WHERE rn = 1 patterns with a single line.",
            "Execution Order Placement: Evaluates after WINDOW, SELECT, and HAVING, but before DISTINCT and ORDER BY.",
            "Deduplication Standard: QUALIFY ROW_NUMBER() OVER (PARTITION BY id ORDER BY updated_at DESC) = 1 is the industry standard deduplication idiom.",
            "Dialect Availability: Supported in Snowflake, BigQuery, Databricks, DuckDB; unsupported in legacy SQL Server and PostgreSQL."
        ]
    },
    {
        "id": "cardinality-estimation-regressions-iqp",
        "term": "Cardinality Estimation Feedback & IQP",
        "category": "SQL SERVER",
        "difficulty": "ARCHITECT",
        "definition": "Cardinality Estimation (CE) Feedback is an Intelligent Query Processing (IQP) mechanism in SQL Server 2022 that automatically identifies and corrects plan regressions caused by modern CE assumptions.",
        "explanation": "When upgrading database compatibility levels, the post-2014 Cardinality Estimator assumes predicate independence, which often underestimates row counts for correlated columns, selecting nested loop joins instead of hash joins. CE Feedback monitors repeated query executions, detects estimation errors, and persists targeted hints in Query Store without requiring code changes.",
        "keyPoints": [
            "Autonomous Plan Correction: Learns from execution history and persists hints in Query Store across engine restarts.",
            "Legacy CE Fallback: Configured at database scope via ALTER DATABASE SCOPED CONFIGURATION SET LEGACY_CARDINALITY_ESTIMATION = ON.",
            "Predicate Correlation: Solves plan regressions occurring when columns share statistical relationships (e.g. City and Postal Code).",
            "Targeted Query Hint: Can be enforced per query using OPTION (USE HINT('FORCE_LEGACY_CARDINALITY_ESTIMATION'))."
        ]
    },
    {
        "id": "polybase-parallel-ingestion-architecture",
        "term": "PolyBase & MPP Parallel Data Loading",
        "category": "FABRIC",
        "difficulty": "ARCHITECT",
        "definition": "PolyBase is a data virtualization and high-speed ingestion technology in Azure Synapse and SQL Server that leverages MPP compute nodes to read external cloud storage blocks in parallel.",
        "explanation": "Standard bulk inserts (BCP, single-thread JDBC) route all incoming records through the Control/Coordinator node, creating an ingestion bottleneck of 1–9 MB/s. PolyBase and the modern T-SQL COPY statement bypass the coordinator, instructing all 60 underlying compute distributions to read chunked storage blobs in parallel, reaching sustained throughputs of 1,060–1,250 MB/s (>100x speedup).",
        "keyPoints": [
            "Parallel Storage Streams: Every compute node reads external Parquet/CSV files concurrently from Azure Blob or ADLS Gen2.",
            "Scale-Out Gateway: Self-Hosted Integration Runtimes scale linearly (1 node = 180 MB/s, 4 nodes = 510 MB/s).",
            "Auto Statistics Generation: Generates table column statistics automatically upon the first query over external data.",
            "Modern Replacement: Replaced in dedicated pools and Microsoft Fabric Warehouse by the simpler, credential-integrated COPY INTO command."
        ]
    },
    {
        "id": "11-database-paradigms-matrix",
        "term": "The 11 Modern Database Paradigms",
        "category": "MODERN LAKEHOUSE",
        "difficulty": "ARCHITECT",
        "definition": "The 11 Database Paradigms classify storage systems by data structure, access patterns, and consistency guarantees to prevent anti-patterns in polyglot persistence.",
        "explanation": "Enterprise lakehouse architectures require matching workload traits to specific engines: 1. RDBMS (ACID/3NF), 2. Columnar OLAP (vectorized aggregates), 3. NewSQL (global Raft ACID), 4. Document (JSON/BSON), 5. Key-Value (O(1) hash lookups), 6. In-Memory (RAM primary), 7. Graph (index-free adjacency), 8. Time-Series (TTL downsampling), 9. Vector (ANN embeddings), 10. Spatial (R-tree GIS), and 11. Ledger (cryptographic audit journals).",
        "keyPoints": [
            "Polyglot Persistence: Avoid the 'hammer and nail' trap of using a single database engine for all enterprise workloads.",
            "NewSQL vs Classic RDBMS: NewSQL (CockroachDB, Spanner, TiDB) achieves horizontal sharding with strict serializable ACID.",
            "Vector Search: Specialized vector engines (Milvus, Pinecone, pgvector) use HNSW/IVF index structures for sub-second similarity search.",
            "Ledger Databases: Cryptographically verifiable append-only ledgers (QLDB, Azure SQL Ledger) provide tamper-proof compliance logs."
        ]
    },
    {
        "id": "star-schema-many-to-many-bridge-tables",
        "term": "Star Schema Many-to-Many Bridge Tables",
        "category": "MODERN LAKEHOUSE",
        "difficulty": "HARD",
        "definition": "A Bridge Table (junction table) is an intermediate modeling construct in a Kimball Star Schema that resolves many-to-many relationships between facts and dimensions without Cartesian fan-out.",
        "explanation": "When an entity can belong to multiple categories simultaneously (e.g. a customer belonging to multiple demographic segments, or a patient having multiple simultaneous diagnoses), joining directly causes row duplication and inflated aggregation metrics. A Bridge Table containing unique (KeyA, KeyB) tuples maintains referential integrity and supports precise multi-allocation weighting.",
        "keyPoints": [
            "Cartesian Prevention: Isolates multi-valued attributes to prevent double-counting revenue and transaction counts.",
            "Weighting Factors: Advanced bridge tables include an allocation weight column (summing to 1.0) to distribute metrics proportionately.",
            "Direct Lake & VertiPaq: In Power BI, bridge tables should be modeled with single-direction cross-filtering where possible to avoid engine contention.",
            "Surrogate Concatenation: Alternative pattern where high-frequency combinations are pre-hashed into a single surrogate dimension key."
        ]
    },
    {
        "id": "spark-join-skew-salting",
        "term": "Spark Join Skew Remediation via Key Salting",
        "category": "SPARK & DATABRICKS",
        "difficulty": "HARD",
        "definition": "Key Salting is a distributed optimization technique where a pseudo-random integer suffix is appended to skewed join keys to distribute data uniformly across shuffle partitions.",
        "explanation": "When join keys contain hot values (such as nulls or default customer IDs representing 30%+ of transactions), standard hash partitioning sends all matching rows to a single executor task, causing execution stalls and OOM crashes. Salting appends a random 0–N suffix to the skewed fact rows and explodes the corresponding dimension rows N times, transforming a single massive partition into N evenly balanced tasks.",
        "keyPoints": [
            "Two-Phase Distribution: Random integer (e.g. floor(rand() * 10)) splits hot keys across 10 independent worker tasks.",
            "Dimension Replication: The dimension lookup table is exploded with matching salt values (0 to 9) to ensure joins remain exact.",
            "Null Key Isolation: Alternative pattern where NULLs are filtered, joined separately without shuffle, and unioned back.",
            "AQE Automation: Modern Spark 3.x Adaptive Query Execution automatically splits oversized skewed partitions without manual salting code."
        ]
    },
    {
        "id": "powerbi-service-schema-drift-failure",
        "term": "Power BI Service Cloud Refresh Schema Drift",
        "category": "FABRIC",
        "difficulty": "HARD",
        "definition": "Power BI Service Cloud Refresh Schema Drift is a production outage scenario where cloud scheduled data refreshes fail following backend database column deletions or renames.",
        "explanation": "While Power BI Desktop executes Visual Refresh, Data Refresh, and Schema Refresh simultaneously, the Power BI Service scheduled refresh triggers a Data Refresh only. If an underlying database view drops or renames an attribute, the cloud service model fails to bind incoming records to the expected schema, crashing the refresh pipeline until re-published from Desktop.",
        "keyPoints": [
            "Data vs Schema Refresh: Cloud scheduled refresh only updates row data; it does NOT alter table metadata or column definitions.",
            "Desktop Resolution: Requires opening .pbix in Power BI Desktop, triggering 'Close & Apply' in Power Query, and republishing.",
            "View Abstraction Defense: Always expose SQL views over base physical tables to decouple report models from backend column refactoring.",
            "CI/CD Verification: Automated regression testing using Tabular Editor or Fabric deployment pipelines prevents broken schema deployments."
        ]
    },
    {
        "id": "gaps-and-islands-streak-tracking",
        "term": "Gaps & Islands Consecutive Sequence Analysis",
        "category": "SQL SERVER",
        "difficulty": "HARD",
        "definition": "The Gaps and Islands problem is a classical SQL analytical challenge that involves identifying contiguous sequences of records (islands) and missing intervals (gaps) in sequential data.",
        "explanation": "Commonly encountered when tracking consecutive active login streaks, machine uptime intervals, or missing invoice ranges. The standard mathematical solution involves subtracting ROW_NUMBER() from the date or sequence column: because both increment by 1 in a contiguous sequence, their difference remains constant, producing an identical group identifier for every row within an island.",
        "keyPoints": [
            "The Date - RowNumber Invariant: date - ROW_NUMBER() yields a static anchor date for all contiguous rows in a sequence.",
            "Streak Aggregation: Grouping by the island anchor identifier allows computing MIN(date) (start), MAX(date) (end), and COUNT(*) (length).",
            "Lag & Cumulative Sum: Alternative pattern using CASE WHEN LAG(val) = val THEN 0 ELSE 1 END followed by SUM() OVER ().",
            "Missing Number Detection: Identifies missing sequential keys by checking id - ROW_NUMBER() != 0."
        ]
    },
    {
        "id": "recursive-cte-mechanics",
        "term": "Recursive Common Table Expressions (WITH RECURSIVE)",
        "category": "SQL SERVER",
        "difficulty": "MEDIUM",
        "definition": "A Recursive CTE is a Common Table Expression that references itself iteratively to traverse hierarchical structures, graph trees, or generate sequential interval series.",
        "explanation": "A recursive CTE consists of two unioned queries: an Anchor Member (which executes once to produce the initial base result) and a Recursive Member (which executes iteratively, referencing the CTE name until it returns an empty set). Dialects enforce a safety termination recursion limit (e.g. OPTION (MAXRECURSION 100)) to prevent infinite loops.",
        "keyPoints": [
            "Anchor & Recursive Members: Formed by an initial base query UNION ALL recursive query referencing the CTE.",
            "Calendar Spine Generation: Standard technique for generating 365 daily dates for left outer join reporting.",
            "Hierarchical Traversal: Resolves employee-to-manager parent-child hierarchies and bills of materials.",
            "Synapse Limitation: Unsupported in Azure Synapse Serverless SQL Pools, requiring chained self-outer joins as an alternative."
        ]
    },
    {
        "id": "mpp-60-distributions-topology",
        "term": "MPP 60-Distribution Storage Topology",
        "category": "FABRIC",
        "difficulty": "ARCHITECT",
        "definition": "The MPP 60-Distribution Topology is the distributed storage architecture in Azure Synapse Analytics that partitions table storage across exactly 60 underlying database distributions.",
        "explanation": "Azure Synapse Dedicated Pools divide all managed data into 60 fixed storage locations decoupled from compute. Compute nodes (scaling from 1 to 60 based on DWU) process these 60 distributions. Tables are designed as Hash (large fact tables), Replicated (dimensions < 2GB copied to each node), or Round-Robin (fast staging loads), minimizing cross-node network shuffles via the Data Movement Service (DMS).",
        "keyPoints": [
            "Fixed 60 Distributions: Regardless of DWU size, storage is always sharded into exactly 60 underlying compute slices.",
            "Colocated Joins: Joining two tables hash-distributed on identical keys executes entirely in-node without network shuffle.",
            "Replicated Dimensions: Replicating tables < 2GB eliminates DMS broadcast moves when joining against large fact tables.",
            "Data Movement Service (DMS): Internal interconnect coordinating data shuffle, broadcast, and round-robin transfers between nodes."
        ]
    },
    {
        "id": "delta-lake-schema-evolution-vs-enforcement",
        "term": "Delta Lake Schema Enforcement vs. Evolution",
        "category": "DATABRICKS",
        "difficulty": "HARD",
        "definition": "Schema Enforcement prevents data corruption by blocking appends that deviate from table schema, while Schema Evolution allows controlled addition of new columns during write operations.",
        "explanation": "Delta Lake enforces schema on write, throwing an AnalysisException if an incoming batch contains extra or incompatible columns. When schema drift represents legitimate upstream expansion, pipelines activate schema evolution via .option('mergeSchema', 'true') on appends or .option('overwriteSchema', 'true') on overwrites, updating the append-only JSON transaction log.",
        "keyPoints": [
            "AnalysisException Defense: Prevents accidental insertion of malformed or misaligned column types into production tables.",
            "mergeSchema Activation: Automatically adds newly detected columns to the Delta metadata without manual ALTER TABLE DDL.",
            "Type Widening: Delta Lake supports automated safe type widening (e.g. Byte to Short to Integer to Long) without rewriting Parquet files.",
            "Explicit DDL Governance: Best practice in production silver/gold layers is strict schema enforcement with explicit CI/CD DDL migration."
        ]
    },
    {
        "id": "sql-server-stored-procedure-deadlocks",
        "term": "SQL Server Error 1205 Deadlock Resolution",
        "category": "SQL SERVER",
        "difficulty": "HARD",
        "definition": "A SQL Server Error 1205 deadlock occurs when two or more concurrent transactions hold locks on separate resources and each requests a lock on the other's resource, creating a cyclic dependency.",
        "explanation": "SQL Server's internal deadlock monitor thread periodically checks for cyclic lock graphs, selects the transaction with the lowest rollback cost as the 'deadlock victim', rolls it back, and throws Error 1205. Triage involves inspecting Extended Events xml_deadlock_report graphs, enforcing uniform alphabetical object access order across all stored procedures, and activating RCSI.",
        "keyPoints": [
            "Deadlock Monitor: Background engine thread checks lock chains every 5 seconds (dropping to 100ms when deadlocks are detected).",
            "Uniform Object Access Order: Accessing tables in identical topological order across all procedures eliminates cyclic lock dependencies.",
            "Deadlock Priority: SET DEADLOCK_PRIORITY LOW/HIGH controls which transaction the engine prefers to sacrifice.",
            "Snapshot Isolation: Enabling READ COMMITTED SNAPSHOT ISOLATION eliminates shared read locks that block concurrent writes."
        ]
    },
    {
        "id": "sql-clause-logical-execution-order",
        "term": "Logical Query Processing Order (S-F-W-G-H-O)",
        "category": "SQL SERVER",
        "difficulty": "EASY",
        "definition": "Logical Query Processing Order defines the strict conceptual sequence in which the relational database engine evaluates SQL clauses during query execution.",
        "explanation": "Although written starting with SELECT, the engine evaluates clauses in the order: FROM -> ON -> JOIN -> WHERE -> GROUP BY -> HAVING -> SELECT -> WINDOW -> DISTINCT -> ORDER BY -> TOP/LIMIT. Understanding this sequence explains why aliases defined in SELECT cannot be referenced in WHERE, why aggregate functions require HAVING, and why window functions cannot filter in WHERE.",
        "keyPoints": [
            "Mnemonic: S-F-W-G-H-O ('Smelly Feet Will Give Horrible Odors') represents the core execution sequence.",
            "Where vs Having: WHERE filters individual records before grouping; HAVING filters aggregated groups after GROUP BY.",
            "Window Function Constraint: Window functions evaluate after SELECT/HAVING, requiring CTEs or QUALIFY for downstream filtering.",
            "Order By Projection: ORDER BY evaluates after SELECT, allowing it to reference projected aliases and expressions."
        ]
    },
    {
        "id": "aggregate-semantics-count-mechanics",
        "term": "Aggregate Semantics: COUNT(*) vs. COUNT(1)",
        "category": "SQL SERVER",
        "difficulty": "EASY",
        "definition": "Aggregate counting semantics define how the database engine evaluates relational cardinality across row counts, constant literals, and nullable column expressions.",
        "explanation": "A widespread database myth asserts that COUNT(1) is faster than COUNT(*). In reality, modern query optimizers parse COUNT(1) directly as COUNT(*) with identical physical execution plans. COUNT(*) computes the total row count of the relation including NULLs using the narrowest non-clustered index, whereas COUNT(column) evaluates the attribute and counts non-nulls only.",
        "keyPoints": [
            "Identical Optimizer Plans: Modern CBOs treat COUNT(1) and COUNT(*) as identical syntactic operations.",
            "Narrowest Index Scan: COUNT(*) does NOT read every column; it scans the index with the smallest byte width.",
            "Null Exclusion: COUNT(column) evaluates each row and increments the accumulator only when column IS NOT NULL.",
            "Ternary Semantics: If 10 rows of 100 contain NULL in a column, COUNT(*) returns 100 while COUNT(col) returns 90."
        ]
    },
    {
        "id": "cross-engine-rosetta-stone",
        "term": "Cross-Engine Data Manipulation (Rosetta Stone)",
        "category": "MODERN LAKEHOUSE",
        "difficulty": "MEDIUM",
        "definition": "The Cross-Engine Rosetta Stone is an architectural translation matrix mapping common data engineering operations across SQL, PySpark, Pandas, and Polars.",
        "explanation": "Modern data engineers frequently transition between SQL for warehouse transformations, PySpark for distributed lakehouse processing, and Pandas/Polars for local feature engineering and API services. Understanding direct syntactic equivalents (e.g. GROUP BY vs groupBy().agg() vs group_by().agg()) ensures consistent semantic behavior and optimal engine efficiency.",
        "keyPoints": [
            "Syntax Mapping: Standardizes equivalent expressions for filtering, sorting, joining, aggregating, and windowing.",
            "Eager vs Lazy: Pandas executes eagerly in-memory, whereas Polars and PySpark build optimized lazy evaluation DAGs.",
            "Arrow Zero-Copy: Polars and PySpark utilize Apache Arrow columnar memory for zero-copy data interchange.",
            "Vectorization Discipline: Eliminates slow Python for-loops and df.apply() in favor of native columnar expressions."
        ]
    },
    {
        "id": "spark-5s-performance-framework",
        "term": "The 5 S's of Apache Spark Performance",
        "category": "SPARK & DATABRICKS",
        "difficulty": "ARCHITECT",
        "definition": "The 5 S's of Spark is a diagnostic framework categorizing all distributed big data bottlenecks into Storage, Skew, Spill, Shuffle, and Serialization.",
        "explanation": "Distributed performance failures invariably stem from one of five root causes: 1. Storage (small files, unpartitioned I/O), 2. Skew (uneven key hashing crashing single tasks), 3. Spill (memory exhaustion forcing RAM to disk paging), 4. Shuffle (excessive network redistribution), and 5. Serialization (Python UDF crossing the JVM boundary).",
        "keyPoints": [
            "Storage: Sized via Delta OPTIMIZE targeting 128MB–1GB files to prevent metastore throttling.",
            "Skew: Remediated via AQE Skew Join or manual key salting (appending random 0-9 suffixes).",
            "Spill: Eliminated by tuning spark.sql.shuffle.partitions to match ~150MB per partition.",
            "Shuffle: Reduced via Broadcast Hash Joins (broadcast(small_df)) and write-time bucketing.",
            "Serialization: Optimized by replacing Python UDFs with native Spark SQL or vectorized @pandas_udf."
        ]
    },
    {
        "id": "debezium-cdc-stream-decoupling",
        "term": "Debezium CDC & Analytical Stream Decoupling",
        "category": "DATA PIPELINES & INGESTION",
        "difficulty": "ARCHITECT",
        "definition": "Debezium CDC is a distributed transaction log mining engine that captures row-level database changes in real time, streaming events into Kafka to decouple OLTP from analytical lakehouses.",
        "explanation": "Directly querying production OLTP databases for ETL introduces lock contention, CPU spikes, and fragile schema dependencies. As demonstrated in the Yelp architecture case study, deploying Debezium to read MySQL binlogs or Postgres WAL logs into Kafka topics enables stream processing engines (Flink, Spark Streaming) to normalize and enrich data before landing in the lakehouse.",
        "keyPoints": [
            "Zero Read Locking: Mines transaction log files directly without issuing SELECT queries against production tables.",
            "Full Mutation Fidelity: Captures before and after states for INSERT, UPDATE, and DELETE operations with microsecond latency.",
            "Schema Registry Contracts: Confluent/Apicurio Schema Registry enforces Avro/JSON schema evolution and prevents breaking changes.",
            "Decoupled Consumers: Allows multiple independent downstream systems (search indexes, cache, DWH) to consume the same event stream."
        ]
    }
]

for item in new_concepts:
    assert item['id'] not in existing_ids, f"Duplicate ID: {item['id']}"
    assert item['term'].strip(), "Term cannot be empty"
    assert len(item['keyPoints']) >= 3, f"Need >=3 keyPoints for {item['id']}"

data.extend(new_concepts)

temp_file = FILE + '.tmp'
with open(temp_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

os.replace(temp_file, FILE)

with open(FILE, 'r', encoding='utf-8') as f:
    verified = json.load(f)

print(f"Successfully updated! New count: {len(verified)} (+{len(new_concepts)})")
