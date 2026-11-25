import json
import os

# 1. Update data_mssql.json
MSSQL_FILE = 'src/data/json/data_mssql.json'
with open(MSSQL_FILE, encoding='utf-8') as f:
    mssql_data = json.load(f)

existing_mssql_ids = {item['id'] for item in mssql_data}

new_mssql_items = [
    {
        "id": "mssql-sargable-date-range",
        "title": "SARGable Date Range Filtering vs Date Functions",
        "level": "intermediate",
        "category": "Query Optimization",
        "description": "Demonstrates writing Search Argument Able (SARGable) date boundary queries that utilize B-tree index seeks rather than forcing full clustered index scans.",
        "code": "-- ❌ Non-SARGable Antipattern (forces full clustered index scan)\nSELECT OrderID, CustomerID, OrderDate, TotalAmount\nFROM dbo.Orders\nWHERE YEAR(OrderDate) = 2024 AND MONTH(OrderDate) = 6;\n\n-- ✅ SARGable Production Pattern (enables logarithmic index seek)\nSELECT OrderID, CustomerID, OrderDate, TotalAmount\nFROM dbo.Orders\nWHERE OrderDate >= '2024-06-01' \n  AND OrderDate < '2024-07-01';",
        "notes": [
            "Wrapping OrderDate in YEAR() and MONTH() requires the engine to evaluate the scalar function for every row in the table.",
            "Half-open interval (>= start AND < next_month) correctly handles datetime2 and datetime fractional second precision.",
            "Saves 90%+ CPU time and disk I/O on tables exceeding 1 million rows."
        ],
        "use_case": "Production report and ETL queries filtering time-series or transactional records by month/year."
    },
    {
        "id": "mssql-try-catch-transaction-template",
        "title": "Production Stored Procedure Template with TRY...CATCH & RCSI",
        "level": "advanced",
        "category": "Stored Procedures & Concurrency",
        "description": "Standard enterprise stored procedure template incorporating atomic transaction management, error throwing, and deadlock resilience.",
        "code": "CREATE OR ALTER PROCEDURE dbo.TransferFunds\n    @SourceAccountID      INT,\n    @DestinationAccountID INT,\n    @Amount               DECIMAL(18, 2)\nAS\nBEGIN\n    SET NOCOUNT ON;\n    SET XACT_ABORT ON; -- Automatically rolls back transaction if run-time error occurs\n\n    BEGIN TRY\n        BEGIN TRANSACTION;\n\n        -- Enforce uniform object access order (lock lower ID first to prevent deadlocks):\n        IF @SourceAccountID > @DestinationAccountID\n        BEGIN\n            -- Swap to guarantee uniform lock sequence:\n            DECLARE @TempID INT = @SourceAccountID;\n            SET @SourceAccountID = @DestinationAccountID;\n            SET @DestinationAccountID = @TempID;\n        END\n\n        UPDATE dbo.Accounts SET Balance = Balance - @Amount WHERE AccountID = @SourceAccountID;\n        UPDATE dbo.Accounts SET Balance = Balance + @Amount WHERE AccountID = @DestinationAccountID;\n\n        COMMIT TRANSACTION;\n    END TRY\n    BEGIN CATCH\n        IF @@TRANCOUNT > 0\n            ROLLBACK TRANSACTION;\n\n        -- Re-throw the original error with line number and state:\n        THROW;\n    END CATCH\nEND;",
        "notes": [
            "SET XACT_ABORT ON ensures orphaned locks are released if connection aborts.",
            "Locking accounts in uniform numerical order mathematically prevents cyclic deadlock chains.",
            "Structured THROW preserves original error number, severity, and call stack."
        ],
        "use_case": "High-throughput financial and transactional processing procedures."
    },
    {
        "id": "mssql-gaps-and-islands-streaks",
        "title": "Gaps & Islands Consecutive Sequence Analysis",
        "level": "advanced",
        "category": "Analytical Window Functions",
        "description": "Identifies contiguous active streaks (e.g. users logging in >= 3 consecutive days) using the Date - ROW_NUMBER() island grouping invariant.",
        "code": "WITH DailyLogins AS (\n    SELECT DISTINCT UserID, CAST(LoginTime AS DATE) AS LoginDate\n    FROM dbo.UserActivity\n),\nIslandGrouped AS (\n    SELECT \n        UserID,\n        LoginDate,\n        -- The invariant: Date - RowNumber produces a static anchor for consecutive days:\n        DATEADD(day, -ROW_NUMBER() OVER (PARTITION BY UserID ORDER BY LoginDate), LoginDate) AS IslandAnchor\n    FROM DailyLogins\n)\nSELECT \n    UserID,\n    MIN(LoginDate) AS StreakStart,\n    MAX(LoginDate) AS StreakEnd,\n    COUNT(*)       AS ConsecutiveDays\nFROM IslandGrouped\nGROUP BY UserID, IslandAnchor\nHAVING COUNT(*) >= 3\nORDER BY UserID, StreakStart;",
        "notes": [
            "DISTINCT in CTE ensures duplicate logins on the same calendar day do not corrupt the sequence.",
            "DATEADD(day, -rn, date) evaluates in a single pass without expensive self-joins.",
            "Applicable to sensor telemetry uptime, recurring billing streaks, and gaming engagement."
        ],
        "use_case": "Product engagement tracking, customer loyalty gamification, and machine sensor SLA monitoring."
    },
    {
        "id": "mssql-cardinality-estimator-feedback",
        "title": "Configuring Legacy Cardinality Estimation & Hints",
        "level": "architect",
        "category": "Query Engine Internals",
        "description": "Techniques to resolve query plan regressions caused by the post-2014 Cardinality Estimator at database, session, and query levels.",
        "code": "-- 1. Database Scoped Configuration (Fixes regressions across entire database):\nALTER DATABASE SCOPED CONFIGURATION \nSET LEGACY_CARDINALITY_ESTIMATION = ON;\n\n-- 2. Single-Query Targeted Hint (Preserves modern CE for other queries):\nSELECT \n    c.CustomerName,\n    o.OrderID,\n    o.TotalAmount\nFROM dbo.Customers c\nINNER JOIN dbo.Orders o ON c.CustomerID = o.CustomerID\nWHERE c.City = 'Seattle' AND c.PostalCode = '98101'\nOPTION (USE HINT('FORCE_LEGACY_CARDINALITY_ESTIMATION'));\n\n-- 3. Verify Query Store Plan Forcing:\nSELECT q.query_id, p.plan_id, p.is_forced_plan\nFROM sys.query_store_query q\nJOIN sys.query_store_plan p ON q.query_id = p.query_id\nWHERE p.is_forced_plan = 1;",
        "notes": [
            "Modern CE assumes predicate independence, underestimating row counts for correlated columns.",
            "Underestimation prompts the optimizer to select Nested Loops with row lookups over Hash Joins.",
            "Database-scoped configuration isolates the setting without requiring server-wide trace flag 9481."
        ],
        "use_case": "Migrating mission-critical databases from SQL Server 2008/2012 to 2019/2022 without query timeouts."
    },
    {
        "id": "mssql-rcsi-snapshot-isolation",
        "title": "Enabling Read Committed Snapshot Isolation (RCSI)",
        "level": "architect",
        "category": "Concurrency & Locking",
        "description": "Enables statement-level optimistic concurrency in SQL Server to completely eliminate reader-writer blocking.",
        "code": "-- Step 1: Terminate active connections and activate RCSI:\nALTER DATABASE CoreBanking\nSET READ_COMMITTED_SNAPSHOT ON\nWITH ROLLBACK IMMEDIATE;\n\n-- Step 2: Verify database isolation state:\nSELECT \n    name,\n    is_read_committed_snapshot_on,\n    snapshot_isolation_state_desc\nFROM sys.databases\nWHERE name = 'CoreBanking';\n\n-- Step 3: Monitor Persistent Version Store (PVS) memory:\nSELECT \n    db_name(database_id) AS DatabaseName,\n    pvs_in_row_version_store_size_kb,\n    pvs_off_row_version_store_size_kb\nFROM sys.dm_tran_persistent_version_store_stats\nWHERE database_id = DB_ID('CoreBanking');",
        "notes": [
            "Readers do not acquire Shared (S) locks, so they never block concurrent exclusive (X) update locks.",
            "Does not require modifying query syntax (unlike manual SNAPSHOT isolation or NOLOCK).",
            "SQL Server 2019+ utilizes Persistent Version Store (PVS) inside the user database, reducing TempDB overhead."
        ],
        "use_case": "High-throughput mixed OLTP and operational reporting databases suffering from blocking."
    }
]

for item in new_mssql_items:
    if item['id'] not in existing_mssql_ids:
        mssql_data.append(item)

with open(MSSQL_FILE + '.tmp', 'w', encoding='utf-8') as f:
    json.dump(mssql_data, f, indent=2, ensure_ascii=False)
os.replace(MSSQL_FILE + '.tmp', MSSQL_FILE)
print(f"Updated {MSSQL_FILE}: now has {len(mssql_data)} items.")

# 2. Update data_sparksql.json
SPARKSQL_FILE = 'src/data/json/data_sparksql.json'
with open(SPARKSQL_FILE, encoding='utf-8') as f:
    sparksql_data = json.load(f)

existing_sparksql_ids = {item['id'] for item in sparksql_data}

new_sparksql_items = [
    {
        "id": "sparksql-qualify-top-n-dedup",
        "title": "QUALIFY Clause for In-Line Window Filtering",
        "level": "intermediate",
        "category": "Window Functions",
        "description": "Uses the native QUALIFY clause in Spark SQL / Databricks to filter window function rankings without nested CTEs.",
        "code": "-- Deduplicate customer events, retaining only the latest state per customer\nSELECT \n    customer_id,\n    event_type,\n    event_timestamp,\n    payload\nFROM customer_events\nQUALIFY ROW_NUMBER() OVER (\n    PARTITION BY customer_id \n    ORDER BY event_timestamp DESC\n) = 1;",
        "notes": [
            "QUALIFY evaluates after the WINDOW and SELECT clauses, allowing filtering on window functions directly.",
            "Supported natively in Spark SQL 3.4+ and all Databricks Runtime versions.",
            "Catalyst pushes down the rank limit into the physical SortExec operator, avoiding full dataset buffering."
        ],
        "use_case": "Silver-layer deduplication in Medallion lakehouse ingestion pipelines."
    },
    {
        "id": "sparksql-skew-join-hint",
        "title": "Adaptive Query Execution Skew Join Hint",
        "level": "advanced",
        "category": "Distributed Joins",
        "description": "Enforces automatic partition splitting for known skewed join keys using Spark SQL SKEW hints.",
        "code": "-- Explicit SKEW hint targeting customer_id with hot values (0, NULL)\nSELECT /*+ SKEW('f', 'customer_id', (0, NULL)) */\n    f.order_id,\n    f.amount,\n    c.customer_name\nFROM fact_sales f\nINNER JOIN dim_customer c \n    ON f.customer_id = c.customer_id;",
        "notes": [
            "Instructs Catalyst to automatically split partitions containing customer_id in (0, NULL) into smaller sub-partitions.",
            "Replicates the corresponding dimension partition to match each sub-partition.",
            "Eliminates 99% task completion stalls without requiring manual key salting code."
        ],
        "use_case": "Joining multi-terabyte transactional tables against master dimensions with heavy default/guest keys."
    },
    {
        "id": "sparksql-delta-merge-scd2",
        "title": "Delta Lake SCD Type 2 MERGE INTO Implementation",
        "level": "advanced",
        "category": "Delta Lake Operations",
        "description": "Standard Delta Lake MERGE statement to expire changed records and insert new active versions for historical tracking.",
        "code": "-- Step 1: Stage incoming changes with null surrogate keys for inserts\nMERGE INTO dim_customer AS target\nUSING (\n    -- Join updates against target to identify changed records:\n    SELECT \n        updates.customer_id AS merge_key,\n        updates.*\n    FROM staged_customer_updates updates\n    UNION ALL\n    SELECT \n        NULL AS merge_key,\n        updates.*\n    FROM staged_customer_updates updates\n    JOIN dim_customer target \n        ON updates.customer_id = target.customer_id\n    WHERE target.is_current = 1 \n      AND (target.address <> updates.address OR target.email <> updates.email)\n) AS source\nON target.customer_id = source.merge_key\n-- Step 2: Expire existing active row\nWHEN MATCHED AND target.is_current = 1 AND (target.address <> source.address OR target.email <> source.email) THEN\n    UPDATE SET target.is_current = 0, target.end_date = CURRENT_DATE()\n-- Step 3: Insert new active row\nWHEN NOT MATCHED THEN\n    INSERT (customer_id, name, address, email, start_date, end_date, is_current)\n    VALUES (source.customer_id, source.name, source.address, source.email, CURRENT_DATE(), NULL, 1);",
        "notes": [
            "Single-pass MERGE executes atomically under Delta Lake ACID guarantees.",
            "Unioning with merge_key = NULL ensures new rows are inserted in the same transaction.",
            "Guarantees that no customer has overlapping active records (is_current = 1)."
        ],
        "use_case": "Kimball SCD Type 2 historical dimension processing in Databricks and Microsoft Fabric Lakehouse."
    },
    {
        "id": "sparksql-broadcast-hash-join",
        "title": "Forcing Broadcast Hash Joins with BROADCAST Hint",
        "level": "intermediate",
        "category": "Distributed Joins",
        "description": "Bypasses network shuffle exchange by broadcasting small dimension tables to all cluster worker nodes.",
        "code": "-- Force Broadcast Hash Join on dim_store (<100MB)\nSELECT /*+ BROADCAST(s) */\n    f.order_id,\n    f.amount,\n    s.store_name,\n    s.region\nFROM fact_sales f\nINNER JOIN dim_store s \n    ON f.store_id = s.store_id;",
        "notes": [
            "The driver collects dim_store and distributes a read-only copy to all executor memory pools.",
            "fact_sales remains entirely in place with ZERO network shuffle or disk spill.",
            "Recommended for dimension tables up to 100MB (autoBroadcastJoinThreshold defaults to 10MB)."
        ],
        "use_case": "Star-schema fact-to-dimension joins in Spark SQL."
    },
    {
        "id": "sparksql-date-spine-sequence",
        "title": "Generating Continuous Date Spines via SEQUENCE()",
        "level": "intermediate",
        "category": "Date Functions & Scaffolding",
        "description": "Generates a continuous sequence of calendar dates without recursive CTE overhead using native Spark sequence functions.",
        "code": "-- Generate 365 days of 2024 for outer join scaffolding:\nSELECT explode(sequence(\n    to_date('2024-01-01'), \n    to_date('2024-12-31'), \n    interval 1 day\n)) AS calendar_date;",
        "notes": [
            "sequence() generates an array of dates evaluated in parallel by Catalyst.",
            "explode() projects array elements into individual table rows.",
            "Significantly faster than recursive CTEs in distributed engines."
        ],
        "use_case": "Financial reporting, cohort retention, and filling zero-activity date gaps in telemetry."
    }
]

for item in new_sparksql_items:
    if item['id'] not in existing_sparksql_ids:
        sparksql_data.append(item)

with open(SPARKSQL_FILE + '.tmp', 'w', encoding='utf-8') as f:
    json.dump(sparksql_data, f, indent=2, ensure_ascii=False)
os.replace(SPARKSQL_FILE + '.tmp', SPARKSQL_FILE)
print(f"Updated {SPARKSQL_FILE}: now has {len(sparksql_data)} items.")
