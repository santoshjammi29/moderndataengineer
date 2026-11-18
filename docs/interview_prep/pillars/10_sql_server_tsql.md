# Pillar 10: SQL Server & T-SQL Mastery
**Category:** `SQL SERVER` | **Domain:** `Relational Databases & Enterprise T-SQL`

---

### Q1: Explain the architectural difference between Clustered and Non-Clustered Indexes at the B-Tree leaf node level.

**Difficulty:** `MEDIUM` | **Niche:** `Indexing Architecture`

**Direct 30-Second Answer:**
- **Clustered Index:** The leaf nodes of the B-Tree **ARE the actual physical data pages**. A table can have only one clustered index because data rows can be physically sorted in only one order.
- **Non-Clustered Index:** Leaf nodes contain index key values paired with a **row locator** (a clustering key pointer if the table has a clustered index, or a RID pointer if the table is a heap). If a query needs non-indexed columns, it must perform an expensive **Key Lookup** to the clustered index.

---

### Q2: How do Clustered Columnstore Indexes (CCI) work in SQL Server, and why do they transform analytical queries?

**Difficulty:** `HARD` | **Niche:** `Columnstore Indexes`

**Direct 30-Second Answer:**
CCI reorganizes data from row-based pages into columnar **Rowgroups** (~1 million rows per rowgroup) and **Column Segments**:
1. Column segments are compressed with dictionary and Lempel-Ziv compression, shrinking storage by 80%.
2. **Batch Mode Processing:** SQL Server processes chunks of ~900 rows simultaneously in CPU registers instead of row-by-row mode.
3. Queries scan only referenced columns and skip entire rowgroups using segment min/max metadata.

---

### Q3: How do you identify performance bottlenecks when reading a SQL Server Graphical Execution Plan?

**Difficulty:** `HARD` | **Niche:** `Execution Plan Triage`

**Execution Plan Triage Checklist:**
1. **Index Scans vs Index Seeks:** Scans indicate missing indexes or non-sargable predicates.
2. **Thick Pipe Arrows:** Disparity between **Estimated Number of Rows** and **Actual Number of Rows** indicates out-of-date table statistics, causing bad join operator selection.
3. **Key Lookups (Bookmark Lookups):** Indicates a non-clustered index is not covering the query. Resolve by adding `INCLUDE (col1, col2)` to the index.
4. **Warning Yellow Exclamation Marks:** Indicates implicit data type conversions (e.g. comparing VARCHAR to NVARCHAR) or TempDB spill during Sort/Hash joins.

---

### Q4: What is Parameter Sniffing in SQL Server, and how do you resolve it?

**Difficulty:** `HARD` | **Niche:** `Query Compilation & Sniffing`

**Direct 30-Second Answer:**
When a stored procedure executes for the first time, SQL Server inspects the passed parameter values and compiles an execution plan optimized specifically for that parameter's data distribution and caches it.
- If the first parameter is rare (1 row), an Index Seek plan is cached. If subsequent calls pass a common parameter (1,000,000 rows), the cached Index Seek plan triggers millions of key lookups, destroying performance.
**Remediation:**
1. `OPTION (RECOMPILE)`: Forces a recompile on every execution (best for complex, infrequent reporting queries).
2. `OPTION (OPTIMIZE FOR (@param = UNKNOWN))` or specific typical value.
3. Copy parameters into local variables inside the stored procedure.

---

### Q5: Explain SQL Server Partition Switching and how it achieves zero-downtime ETL staging loads.

**Difficulty:** `HARD` | **Niche:** `Table Partitioning & Switching`

**Direct 30-Second Answer:**
Partition Switching is a metadata-only operation ($O(1)$) that moves an entire partition of data between a staging table and a production partitioned table:
```sql
ALTER TABLE staging_orders SWITCH TO fact_orders PARTITION 15;
```
- **Requirements:** Staging and production tables must share identical schemas, indexes, partition columns, filegroups, and non-overlapping `CHECK` constraints.
- **Outcome:** Hundreds of millions of rows are loaded into production in milliseconds with zero row-by-row logging.

---

### Q6: What causes TempDB allocation page contention (PFS, GAM, SGAM) and how do you remediate it?

**Difficulty:** `HARD` | **Niche:** `TempDB Tuning`

**Direct 30-Second Answer:**
High-concurrency workloads creating temporary tables (`#table`, `@table_var`) simultaneously request allocations on shared allocation map pages (PFS/SGAM), resulting in `PAGELATCH_UP` wait states in TempDB.
**Remediation:**
1. **Multiple Data Files:** Configure 1 TempDB data file per logical CPU core (up to 8 files initially) with identical growth settings.
2. **Trace Flags & Server Flags:** Enable Trace Flag 1118 (allocates full extents instead of mixed extents; default in SQL Server 2016+).
3. Replace temporary tables with CTEs or table variables for small rowcounts.

---

### Q7: Compare Read Committed Snapshot Isolation (RCSI) with Snapshot Isolation in SQL Server.

**Difficulty:** `HARD` | **Niche:** `Isolation Levels & Concurrency`

**Comparison:**
- **RCSI (`READ_COMMITTED_SNAPSHOT`):** Database-level default setting. Statements read the latest version of data committed *before the statement started*. Zero application code change required; eliminates reader/writer blocking.
- **Snapshot Isolation (`ALLOW_SNAPSHOT_ISOLATION`):** Transaction-level setting (`SET TRANSACTION ISOLATION LEVEL SNAPSHOT`). Statements read the version committed *before the entire transaction started*, guaranteeing repeatable reads and preventing phantom reads.

---

### Q8: How do you capture, read, and prevent SQL Server deadlocks?

**Difficulty:** `HARD` | **Niche:** `Deadlock Triage`

**Deadlock Analysis & Prevention:**
1. **Capture:** Capture deadlock graphs via Extended Events (`system_health` session) or Trace Flag 1222 in the error log.
2. **Read XML Graph:** Identify the Victim process, the surviving process, and the mutually held resource locks (Key Lock, Page Lock).
3. **Prevention Guidelines:**
   - Access objects in the **exact same sequential order** across all transactions.
   - Keep transactions short; avoid user interaction inside transaction blocks.
   - Enable RCSI to eliminate shared read locks on tables.

---

### Q9: Which Dynamic Management Views (DMVs) do you query to diagnose server-wide CPU and I/O bottlenecks?

**Difficulty:** `HARD` | **Niche:** `DMV Profiling & Diagnostics`

**Core Diagnostic DMVs:**
1. **`sys.dm_os_wait_stats`:** Identifies primary server wait bottlenecks (e.g. `CXPACKET` for parallelism, `PAGEIOLATCH_SH` for disk read I/O, `LCK_M_X` for blocking locks).
2. **`sys.dm_exec_query_stats`:** Aggregates execution metrics (total worker time, logical reads, execution count) across cached plans.
3. **`sys.dm_exec_requests` & `sys.dm_exec_sessions`:** Real-time visibility into currently executing queries and blocking chains.

---

### Q10: Write a recursive Common Table Expression (CTE) to traverse an employee organizational hierarchy.

**Difficulty:** `MEDIUM` | **Niche:** `T-SQL Window Functions & CTEs`

**Production T-SQL:**
```sql
WITH OrgHierarchy AS (
    -- Anchor Member: Top-level CEO
    SELECT emp_id, emp_name, manager_id, 0 AS hierarchy_level
    FROM employees
    WHERE manager_id IS NULL
    UNION ALL
    -- Recursive Member: Subordinates
    SELECT e.emp_id, e.emp_name, e.manager_id, o.hierarchy_level + 1
    FROM employees e
    INNER JOIN OrgHierarchy o ON e.manager_id = o.emp_id
)
SELECT emp_id, emp_name, manager_id, hierarchy_level
FROM OrgHierarchy
ORDER BY hierarchy_level, manager_id
OPTION (MAXRECURSION 100);
```

---
