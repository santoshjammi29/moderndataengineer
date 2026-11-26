"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Database,
  Sparkles,
  Zap,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  Layers,
  Search,
  Filter,
  Table as TableIcon,
  Eye,
  BookOpen,
  Code2,
  Terminal,
  Check,
  Copy,
  AlertTriangle,
  Play,
  ExternalLink,
  Cpu,
  ShieldCheck,
  Clock,
  FileCode2,
  Bookmark,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { architectureDiagrams, ArchitectureDiagramItem } from "@/data/diagrams";
import { WhiteboardCard } from "@/components/architecture/whiteboard-card";
import { CodeBlock } from "@/components/ui/code-block";
import { PrerequisiteBanner } from "@/components/ui/prerequisite-banner";

type SqlSubtab = "stepper" | "window" | "rosetta" | "drills" | "runbooks";

/* ==========================================================================
   TAB 1: INTERACTIVE QUERY CLAUSE EXECUTION STEPPER (S-F-W-G-H-O)
   ========================================================================== */

interface ExecutionStep {
  id: string;
  order: number;
  clause: string;
  name: string;
  summary: string;
  sqlSnippet: string;
  engineInternals: string;
  interviewTrap: string;
  rowExplanation: string;
  columns: string[];
  data: {
    id: number;
    merchant: string;
    category: string;
    amount: number;
    status: string;
    tx_count?: number;
    total_spend?: number;
    rank?: number;
    highlighted?: boolean;
    discarded?: boolean;
    discardReason?: string;
  }[];
}

const EXECUTION_STEPS: ExecutionStep[] = [
  {
    id: "step-from",
    order: 1,
    clause: "FROM & JOIN",
    name: "Table Resolution & Cartesian / Join Product",
    summary:
      "The relational engine identifies source tables, loads catalog metadata, and evaluates JOIN conditions (ON predicates) to build the working virtual relation.",
    sqlSnippet: `FROM transactions t
JOIN merchants m
  ON t.merchant_id = m.id`,
    engineInternals:
      "Buffer pool read-ahead engines bring 8KB data pages into cache. The query optimizer selects a physical join operator (Nested Loop for small indexed sets, Hash Match for large unindexed sets, or Merge Join for pre-sorted streams).",
    interviewTrap:
      "Outer Join Filter in ON vs WHERE: Placing a filter on the preserved right table in the ON clause filters matched rows but preserves the left row with NULLs. Moving it to the WHERE clause silently converts the OUTER JOIN into an INNER JOIN!",
    rowExplanation: "Raw joined dataset: 7 transaction records matched against merchants.",
    columns: ["Tx ID", "Merchant", "Category", "Amount ($)", "Status"],
    data: [
      { id: 101, merchant: "Acme Cloud", category: "SaaS", amount: 120.0, status: "COMPLETED" },
      { id: 102, merchant: "Apex Tech", category: "Hardware", amount: 450.0, status: "COMPLETED" },
      { id: 103, merchant: "Acme Cloud", category: "SaaS", amount: 85.0, status: "COMPLETED" },
      { id: 104, merchant: "QuickMart", category: "Retail", amount: 15.0, status: "COMPLETED" },
      { id: 105, merchant: "Acme Cloud", category: "SaaS", amount: 210.0, status: "FAILED", discarded: false },
      { id: 106, merchant: "Apex Tech", category: "Hardware", amount: 35.0, status: "COMPLETED" },
      { id: 107, merchant: "QuickMart", category: "Retail", amount: 95.0, status: "REFUNDED" },
    ],
  },
  {
    id: "step-where",
    order: 2,
    clause: "WHERE",
    name: "Base Row Filtering (Pre-Aggregation)",
    summary:
      "Evaluates search predicates against individual base rows. Discards rows evaluating to FALSE or UNKNOWN (NULL). Happens BEFORE any grouping or aggregate calculation.",
    sqlSnippet: `WHERE t.status = 'COMPLETED'
  AND t.amount >= 50.00`,
    engineInternals:
      "Optimizer leverages B-tree index seeks where sargable predicates exist. Non-sargable functions (e.g. WHERE YEAR(date) = 2024) prevent index seek and trigger full scans. Surviving rows feed the grouping operator.",
    interviewTrap:
      "Three-Valued Logic: In SQL, NULL = NULL evaluates to UNKNOWN, not TRUE. Writing WHERE status != 'FAILED' silently discards rows where status is NULL!",
    rowExplanation:
      "Filtered dataset: 4 rows qualify. Records with status != 'COMPLETED' or amount < $50 are discarded.",
    columns: ["Tx ID", "Merchant", "Category", "Amount ($)", "Status", "Filter Outcome"],
    data: [
      { id: 101, merchant: "Acme Cloud", category: "SaaS", amount: 120.0, status: "COMPLETED", highlighted: true },
      { id: 102, merchant: "Apex Tech", category: "Hardware", amount: 450.0, status: "COMPLETED", highlighted: true },
      { id: 103, merchant: "Acme Cloud", category: "SaaS", amount: 85.0, status: "COMPLETED", highlighted: true },
      { id: 104, merchant: "QuickMart", category: "Retail", amount: 15.0, status: "COMPLETED", discarded: true, discardReason: "amount < $50" },
      { id: 105, merchant: "Acme Cloud", category: "SaaS", amount: 210.0, status: "FAILED", discarded: true, discardReason: "status != COMPLETED" },
      { id: 106, merchant: "Apex Tech", category: "Hardware", amount: 35.0, status: "COMPLETED", discarded: true, discardReason: "amount < $50" },
      { id: 107, merchant: "QuickMart", category: "Retail", amount: 95.0, status: "REFUNDED", discarded: true, discardReason: "status != COMPLETED" },
    ],
  },
  {
    id: "step-groupby",
    order: 3,
    clause: "GROUP BY",
    name: "Bucket Partitioning into Distinct Keys",
    summary:
      "Rows sharing identical grouping keys are combined into summary groups. Individual row identities are collapsed into aggregate buckets.",
    sqlSnippet: `GROUP BY m.category, m.merchant_name`,
    engineInternals:
      "Query engine builds an in-memory hash table (Hash Aggregate) or sorts input rows (Stream Aggregate). If grouping cardinality exceeds memory grants, hash buckets spill into TempDB / disk.",
    interviewTrap:
      "Non-Grouped Column Error: In ANSI SQL, every column in the SELECT list that is not an aggregate function MUST be present in the GROUP BY clause.",
    rowExplanation: "Surviving 4 rows grouped into 2 distinct merchant-category buckets.",
    columns: ["Merchant", "Category", "Matching Tx IDs", "Raw Tx Count", "Sum Amount ($)"],
    data: [
      { id: 1, merchant: "Acme Cloud", category: "SaaS", amount: 0, status: "GROUPED", tx_count: 2, total_spend: 205.0, highlighted: true },
      { id: 2, merchant: "Apex Tech", category: "Hardware", amount: 0, status: "GROUPED", tx_count: 1, total_spend: 450.0, highlighted: true },
    ],
  },
  {
    id: "step-having",
    order: 4,
    clause: "HAVING",
    name: "Group Metric Filtering (Post-Aggregation)",
    summary:
      "Filters entire aggregated groups using conditions on aggregate metrics (COUNT, SUM, AVG). Groups failing the condition are pruned.",
    sqlSnippet: `HAVING COUNT(t.id) >= 2`,
    engineInternals:
      "Executed after grouping operator. Cannot utilize B-tree indexes because aggregate values are computed in memory during query runtime.",
    interviewTrap:
      "WHERE vs HAVING: Filtering non-aggregated columns in HAVING causes massive performance degradation because the engine must group millions of rows before discarding them. Always filter in WHERE first!",
    rowExplanation:
      "HAVING evaluation: Only 'Acme Cloud' has >= 2 qualifying transactions. 'Apex Tech' is pruned.",
    columns: ["Merchant", "Category", "Tx Count", "Total Spend ($)", "Having Result"],
    data: [
      { id: 1, merchant: "Acme Cloud", category: "SaaS", amount: 0, status: "PASSED", tx_count: 2, total_spend: 205.0, highlighted: true },
      { id: 2, merchant: "Apex Tech", category: "Hardware", amount: 0, status: "PRUNED", tx_count: 1, total_spend: 450.0, discarded: true, discardReason: "COUNT(t.id) < 2" },
    ],
  },
  {
    id: "step-select",
    order: 5,
    clause: "SELECT",
    name: "Expression Evaluation & Column Projection",
    summary:
      "Scalar expressions, mathematical transforms, and aliases are computed and assigned to final output columns.",
    sqlSnippet: `SELECT
  m.merchant_name,
  m.category,
  COUNT(t.id) AS completed_txs,
  ROUND(SUM(t.amount), 2) AS total_revenue`,
    engineInternals:
      "Column projection prunes unreferenced columns from the memory worktable, reducing network transmission and buffer serialization overhead.",
    interviewTrap:
      "Why aliases fail in WHERE/HAVING: Because SELECT executes at Step 5, column aliases defined here do not exist yet during WHERE (Step 2) or HAVING (Step 4) execution in standard SQL!",
    rowExplanation: "Surviving group projected into requested analytical columns with aliases.",
    columns: ["merchant_name", "category", "completed_txs", "total_revenue"],
    data: [
      { id: 1, merchant: "Acme Cloud", category: "SaaS", amount: 0, status: "PROJECTED", tx_count: 2, total_spend: 205.0, highlighted: true },
    ],
  },
  {
    id: "step-window",
    order: 6,
    clause: "WINDOW",
    name: "Analytical Window Functions Execution",
    summary:
      "Analytical window functions (ROW_NUMBER, RANK, SUM OVER) execute over the projected rowset without collapsing rows.",
    sqlSnippet: `DENSE_RANK() OVER (
  ORDER BY SUM(t.amount) DESC
) AS revenue_rank`,
    engineInternals:
      "Query engine uses a Segment / Sequence Project operator. It buffers rows per partition, evaluates window bounds, and assigns analytical values.",
    interviewTrap:
      "Window functions in WHERE: You cannot filter WHERE ROW_NUMBER() <= 3 in the same query block because WHERE executes at Step 2 and WINDOW executes at Step 6. You must wrap it in a CTE or subquery!",
    rowExplanation: "Window function computes analytical rank across the projected groups.",
    columns: ["merchant_name", "category", "completed_txs", "total_revenue", "revenue_rank"],
    data: [
      { id: 1, merchant: "Acme Cloud", category: "SaaS", amount: 0, status: "RANKED", tx_count: 2, total_spend: 205.0, rank: 1, highlighted: true },
    ],
  },
  {
    id: "step-orderby",
    order: 7,
    clause: "ORDER BY",
    name: "Tuple Sorting & Spooling",
    summary:
      "Sorts the final rowset in requested order. The ONLY phase in standard SQL where SELECT aliases can be safely referenced.",
    sqlSnippet: `ORDER BY total_revenue DESC`,
    engineInternals:
      "Sort operator requests memory grant. If data volume exceeds allocated sort buffer, the engine spills data runs to disk (TempDB), causing a 10x-100x latency spike.",
    interviewTrap:
      "Non-Deterministic Sorting: When sorting on columns with duplicate values, failing to provide a unique tie-breaker (e.g. primary key) causes erratic, non-reproducible pagination results across calls!",
    rowExplanation: "Final rowset sorted deterministically by total_revenue descending.",
    columns: ["merchant_name", "category", "completed_txs", "total_revenue", "revenue_rank"],
    data: [
      { id: 1, merchant: "Acme Cloud", category: "SaaS", amount: 0, status: "SORTED", tx_count: 2, total_spend: 205.0, rank: 1, highlighted: true },
    ],
  },
  {
    id: "step-limit",
    order: 8,
    clause: "LIMIT / OFFSET",
    name: "Resultset Windowing & Client Transmission",
    summary:
      "Restricts the row count returned to the caller cursor. Enables early termination (Top-N Sort) in query execution.",
    sqlSnippet: `LIMIT 10 OFFSET 0`,
    engineInternals:
      "A Top-N Sort operator maintains an in-memory priority queue heap of size N, discarding surplus rows dynamically without sorting the entire dataset.",
    interviewTrap:
      "Deep Pagination Performance Trap: OFFSET 1000000 LIMIT 10 forces the engine to materialize and discard 1,000,000 rows. Always migrate to Keyset Pagination (WHERE id > last_seen_id) for large scale pagination!",
    rowExplanation: "Top-N bounds applied. Result streams to client.",
    columns: ["merchant_name", "category", "completed_txs", "total_revenue", "revenue_rank"],
    data: [
      { id: 1, merchant: "Acme Cloud", category: "SaaS", amount: 0, status: "STREAMED", tx_count: 2, total_spend: 205.0, rank: 1, highlighted: true },
    ],
  },
];

/* ==========================================================================
   TAB 2: LIVE INTERACTIVE WINDOW FUNCTION VISUALIZER
   ========================================================================== */

interface WindowSampleRecord {
  id: number;
  department: string;
  employee: string;
  salary: number;
  experienceYears: number;
}

const WINDOW_RAW_DATA: WindowSampleRecord[] = [
  { id: 1, department: "Engineering", employee: "Elena Rostova", salary: 140000, experienceYears: 6 },
  { id: 2, department: "Engineering", employee: "Marcus Vance", salary: 140000, experienceYears: 7 },
  { id: 3, department: "Engineering", employee: "Devon Reed", salary: 115000, experienceYears: 3 },
  { id: 4, department: "Engineering", employee: "Siddharth Rao", salary: 95000, experienceYears: 2 },
  { id: 5, department: "Data Platform", employee: "Amina Al-Mansoor", salary: 155000, experienceYears: 8 },
  { id: 6, department: "Data Platform", employee: "Chen Wei", salary: 130000, experienceYears: 5 },
  { id: 7, department: "Data Platform", employee: "Sofia Silva", salary: 130000, experienceYears: 4 },
  { id: 8, department: "Data Platform", employee: "Tariq Aziz", salary: 105000, experienceYears: 2 },
];

/* ==========================================================================
   TAB 3: CROSS-ENGINE ROSETTA STONE ENTRIES
   ========================================================================== */

interface RosettaEntry {
  id: string;
  category: string;
  title: string;
  problem: string;
  architectNote: string;
  postgresAnsi: string;
  tsql: string;
  sparkSql: string;
  snowflakeBq: string;
  pysparkPolars: string;
}

const ROSETTA_ENTRIES: RosettaEntry[] = [
  {
    id: "date-trunc-intervals",
    category: "Date & Time",
    title: "Date Truncation & Interval Arithmetic",
    problem: "Truncate timestamp to start of month and add 3 months with end-of-month rollover safety.",
    architectNote:
      "Date arithmetic varies dramatically across engines. T-SQL uses DATEADD and DATEDIFF, whereas PostgreSQL uses native INTERVAL data types and Spark SQL provides date_trunc and add_months.",
    postgresAnsi: `-- PostgreSQL / ANSI SQL
SELECT
  DATE_TRUNC('month', order_date) AS month_start,
  DATE_TRUNC('month', order_date) + INTERVAL '3 months' AS plus_3m,
  (DATE_TRUNC('month', order_date) + INTERVAL '1 month - 1 day')::DATE AS month_end
FROM orders;`,
    tsql: `-- Microsoft T-SQL (SQL Server / Synapse / Fabric DW)
SELECT
  DATEFROMPARTS(YEAR(order_date), MONTH(order_date), 1) AS month_start,
  DATEADD(month, 3, DATEFROMPARTS(YEAR(order_date), MONTH(order_date), 1)) AS plus_3m,
  EOMONTH(order_date) AS month_end
FROM orders;`,
    sparkSql: `-- Apache Spark SQL / Databricks
SELECT
  date_trunc('month', order_date) AS month_start,
  add_months(date_trunc('month', order_date), 3) AS plus_3m,
  last_day(order_date) AS month_end
FROM orders;`,
    snowflakeBq: `-- Snowflake & BigQuery
-- Snowflake:
SELECT
  DATE_TRUNC('month', order_date) AS month_start,
  DATEADD(month, 3, DATE_TRUNC('month', order_date)) AS plus_3m,
  LAST_DAY(order_date) AS month_end
FROM orders;
-- BigQuery:
-- DATE_TRUNC(order_date, MONTH), DATE_ADD(..., INTERVAL 3 MONTH)`,
    pysparkPolars: `# Python: PySpark & Polars
# PySpark:
import pyspark.sql.functions as F
df.select(
    F.date_trunc("month", "order_date").alias("month_start"),
    F.add_months(F.date_trunc("month", "order_date"), 3).alias("plus_3m"),
    F.last_day("order_date").alias("month_end")
)

# Polars:
import polars as pl
df.select([
    pl.col("order_date").dt.truncate("1mo").alias("month_start"),
    pl.col("order_date").dt.offset_by("3mo").alias("plus_3m"),
    pl.col("order_date").dt.month_end().alias("month_end")
])`,
  },
  {
    id: "string-agg-split",
    category: "Strings & Arrays",
    title: "String Aggregation & Array Splitting",
    problem: "Group tags into a comma-delimited string and unnest/explode comma-separated strings into rows.",
    architectNote:
      "T-SQL introduced STRING_AGG in 2017. Big data engines (Spark, BigQuery) favor native ARRAY structures with array_join and explode rather than flat strings.",
    postgresAnsi: `-- PostgreSQL
-- Aggregate:
SELECT department_id, STRING_AGG(employee_name, ', ' ORDER BY salary DESC) AS team
FROM employees GROUP BY department_id;
-- Split / Unnest:
SELECT id, TRIM(tag) AS tag
FROM items, UNNEST(STRING_TO_ARRAY(tag_list, ',')) AS tag;`,
    tsql: `-- Microsoft T-SQL
-- Aggregate:
SELECT department_id, STRING_AGG(employee_name, ', ') WITHIN GROUP (ORDER BY salary DESC) AS team
FROM employees GROUP BY department_id;
-- Split:
SELECT id, TRIM(value) AS tag
FROM items CROSS APPLY STRING_SPLIT(tag_list, ',');`,
    sparkSql: `-- Spark SQL
-- Aggregate:
SELECT department_id, array_join(collect_list(employee_name), ', ') AS team
FROM employees GROUP BY department_id;
-- Explode:
SELECT id, trim(tag) AS tag
FROM items LATERAL VIEW explode(split(tag_list, ',')) AS tag;`,
    snowflakeBq: `-- Snowflake & BigQuery
-- Snowflake Aggregate:
SELECT department_id, LISTAGG(employee_name, ', ') WITHIN GROUP (ORDER BY salary DESC) AS team
FROM employees GROUP BY department_id;
-- BigQuery Aggregate:
SELECT department_id, STRING_AGG(employee_name, ', ' ORDER BY salary DESC) AS team
FROM employees GROUP BY department_id;`,
    pysparkPolars: `# Python: PySpark & Polars
# PySpark Aggregate & Explode:
df.groupBy("department_id").agg(F.concat_ws(", ", F.collect_list("employee_name")).alias("team"))
df.select("id", F.explode(F.split("tag_list", ",")).alias("tag"))

# Polars:
df.group_by("department_id").agg(pl.col("employee_name").str.concat(", ").alias("team"))
df.with_columns(pl.col("tag_list").str.split(",")).explode("tag_list")`,
  },
  {
    id: "json-extraction-shredding",
    category: "Semi-Structured JSON",
    title: "JSON Path Extraction & Array Shredding",
    problem: "Extract nested scalar fields and shred dynamic JSON arrays into tabular rows.",
    architectNote:
      "Never store large JSON payloads in relational columns without schema enforcement. In modern lakehouses, shred JSON into strongly typed Parquet structs and arrays during Bronze-to-Silver ETL.",
    postgresAnsi: `-- PostgreSQL (JSONB)
SELECT
  payload->'customer'->>'name' AS customer_name,
  (item->>'price')::NUMERIC AS item_price
FROM events,
LATERAL jsonb_array_elements(payload->'items') AS item;`,
    tsql: `-- Microsoft T-SQL (JSON)
SELECT
  JSON_VALUE(payload, '$.customer.name') AS customer_name,
  items.price AS item_price
FROM events
CROSS APPLY OPENJSON(payload, '$.items')
WITH (
  item_id INT '$.id',
  price DECIMAL(18,2) '$.price'
) AS items;`,
    sparkSql: `-- Spark SQL
SELECT
  get_json_object(payload, '$.customer.name') AS customer_name,
  item.price
FROM (
  SELECT from_json(payload, 'customer STRUCT<name: STRING>, items ARRAY<STRUCT<id: INT, price: DOUBLE>>') AS parsed
  FROM events
) LATERAL VIEW explode(parsed.items) AS item;`,
    snowflakeBq: `-- Snowflake (VARIANT) & BigQuery (JSON)
-- Snowflake:
SELECT
  payload:customer.name::STRING AS customer_name,
  item.value:price::NUMBER(18,2) AS item_price
FROM events,
LATERAL FLATTEN(input => payload:items) item;

-- BigQuery:
-- STRING(payload.customer.name), JSON_EXTRACT_ARRAY(payload.items)`,
    pysparkPolars: `# Python: PySpark & Polars
# PySpark:
from pyspark.sql.types import StructType, StructField, StringType, ArrayType, DoubleType
schema = "customer STRUCT<name: STRING>, items ARRAY<STRUCT<id: INT, price: DOUBLE>>"
df.select(F.from_json("payload", schema).alias("data")) \\
  .select("data.customer.name", F.explode("data.items").alias("item")) \\
  .select("name", "item.price")

# Polars:
# polars reads json into Struct / List columns directly via pl.col("json_col")`,
  },
  {
    id: "upsert-merge-mechanics",
    category: "Data Ingestion & ACID",
    title: "Idempotent UPSERT / MERGE Mechanics",
    problem: "Perform atomic INSERT for new keys and UPDATE for existing keys with deterministic concurrency.",
    architectNote:
      "MERGE statements require strict unique constraints or deduplicated source streams. A non-unique source key matching a single target row causes runtime failure ('MERGE target table row matched multiple times').",
    postgresAnsi: `-- PostgreSQL ON CONFLICT (Idempotent UPSERT)
INSERT INTO target_dim (user_id, email, updated_at)
SELECT user_id, email, updated_at FROM source_stg
ON CONFLICT (user_id) DO UPDATE SET
  email = EXCLUDED.email,
  updated_at = EXCLUDED.updated_at
WHERE target_dim.updated_at < EXCLUDED.updated_at;`,
    tsql: `-- Microsoft T-SQL MERGE
MERGE INTO target_dim AS target
USING (SELECT user_id, email, updated_at FROM source_stg) AS source
ON target.user_id = source.user_id
WHEN MATCHED AND target.updated_at < source.updated_at THEN
  UPDATE SET target.email = source.email, target.updated_at = source.updated_at
WHEN NOT MATCHED THEN
  INSERT (user_id, email, updated_at)
  VALUES (source.user_id, source.email, source.updated_at);`,
    sparkSql: `-- Delta Lake / Spark SQL MERGE INTO
MERGE INTO silver_dim_users AS target
USING source_updates AS source
ON target.user_id = source.user_id
WHEN MATCHED AND target.updated_at < source.updated_at THEN
  UPDATE SET target.email = source.email, target.updated_at = source.updated_at
WHEN NOT MATCHED THEN
  INSERT *;`,
    snowflakeBq: `-- Snowflake & BigQuery MERGE
MERGE INTO gold_customers t
USING staging_customers s
ON t.customer_id = s.customer_id
WHEN MATCHED THEN
  UPDATE SET t.name = s.name, t.address = s.address, t.last_seen = s.last_seen
WHEN NOT MATCHED THEN
  INSERT (customer_id, name, address, last_seen)
  VALUES (s.customer_id, s.name, s.address, s.last_seen);`,
    pysparkPolars: `# Delta Lake Python API (DeltaTable)
from delta.tables import DeltaTable

delta_table = DeltaTable.forPath(spark, "/lakehouse/silver/users")
delta_table.alias("target").merge(
    source_df.alias("source"),
    "target.user_id = source.user_id"
).whenMatchedUpdate(
    condition="target.updated_at < source.updated_at",
    set={"email": "source.email", "updated_at": "source.updated_at"}
).whenNotMatchedInsertAll().execute()`,
  },
];

/* ==========================================================================
   TAB 4: 4-TIER INTERACTIVE PRACTICE DRILLS & QUIZ
   ========================================================================== */

interface DrillItem {
  id: string;
  tier: "Junior" | "Mid" | "Senior" | "Architect";
  tierColor: string;
  title: string;
  domain: string;
  prompt: string;
  schemaDetails: string;
  hint: string;
  solutionSql: string;
  queryPlanTriage: string;
  rubricChecks: string[];
}

const DRILL_ITEMS: DrillItem[] = [
  {
    id: "drill-tier1-nulls",
    tier: "Junior",
    tierColor: "text-emerald-700 dark:text-emerald-400 border-emerald-700/30 bg-emerald-50/50 dark:bg-emerald-950/20",
    title: "Safe NULL Accounting in Sales Commission Aggregation",
    domain: "Fintech & Payroll",
    prompt:
      "Calculate total base pay, total commission, and total compensation per sales rep. Some reps earn 0% commission and have NULL commission_pct. Avoid returning NULL compensation totals!",
    schemaDetails: "sales_reps(rep_id INT, name VARCHAR, base_salary DECIMAL(10,2), commission_pct DECIMAL(5,4), deals_closed INT)",
    hint: "Use COALESCE() to substitute NULL values with 0 before performing scalar multiplication and addition.",
    solutionSql: `SELECT
  rep_id,
  name,
  base_salary,
  COALESCE(commission_pct, 0.0) AS commission_rate,
  ROUND(base_salary + (base_salary * COALESCE(commission_pct, 0.0)), 2) AS total_compensation
FROM sales_reps
ORDER BY total_compensation DESC;`,
    queryPlanTriage:
      "Simple Table Scan or Clustered Index Scan. Scalar expression evaluated in compute scalar operator. Zero risk of NULL propagation.",
    rubricChecks: [
      "Substituted NULL commission_pct with 0 using COALESCE or IFNULL",
      "Correctly applied order of operations (multiplication before addition)",
      "Preserved reps with zero deals or zero commission",
      "Rounded financial figures to 2 decimal places",
    ],
  },
  {
    id: "drill-tier2-running-total",
    tier: "Mid",
    tierColor: "text-sky-700 dark:text-sky-400 border-sky-700/30 bg-sky-50/50 dark:bg-sky-950/20",
    title: "Cumulative Account Balance with Sliding Moving Average",
    domain: "Retail Banking Ledger",
    prompt:
      "Given a ledger of debits and credits, calculate: 1) the real-time running balance per account, and 2) a 3-transaction moving average of transfer amounts per account.",
    schemaDetails: "ledger(txn_id BIGINT, account_id INT, txn_time TIMESTAMP, txn_type VARCHAR(10), amount DECIMAL(18,2))",
    hint: "Use SUM() with signed amount and window frame ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW. For moving average, use ROWS BETWEEN 2 PRECEDING AND CURRENT ROW.",
    solutionSql: `WITH normalized_ledger AS (
  SELECT
    txn_id,
    account_id,
    txn_time,
    amount,
    CASE WHEN txn_type = 'DEBIT' THEN -amount ELSE amount END AS signed_amount
  FROM ledger
)
SELECT
  txn_id,
  account_id,
  txn_time,
  signed_amount,
  SUM(signed_amount) OVER (
    PARTITION BY account_id
    ORDER BY txn_time, txn_id
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  ) AS running_balance,
  AVG(amount) OVER (
    PARTITION BY account_id
    ORDER BY txn_time, txn_id
    ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
  ) AS moving_avg_3_txns
FROM normalized_ledger
ORDER BY account_id, txn_time;`,
    queryPlanTriage:
      "Segment / Sequence Project operator. Requires sorting on (account_id, txn_time). Providing an index on (account_id, txn_time) avoids an expensive Sort operator entirely!",
    rubricChecks: [
      "Included tie-breaker (txn_id) in ORDER BY for deterministic sorting",
      "Explicitly specified ROWS BETWEEN instead of defaulting to RANGE BETWEEN",
      "Correctly distinguished signed debit/credit from absolute amount for moving average",
      "Partitioned cleanly by account_id",
    ],
  },
  {
    id: "drill-tier3-gaps-islands",
    tier: "Senior",
    tierColor: "text-amber-700 dark:text-amber-400 border-amber-700/30 bg-amber-50/50 dark:bg-amber-950/20",
    title: "Gaps and Islands: Server Uptime Streak Identification",
    domain: "Cloud Infrastructure SRE",
    prompt:
      "Given a daily health check table recording server pings, find all consecutive uptime streaks (islands) for each server where status = 'HEALTHY'. Output server_id, streak_start_date, streak_end_date, and streak_days.",
    schemaDetails: "server_health(server_id VARCHAR(50), check_date DATE, status VARCHAR(20))",
    hint: "The Classic ROW_NUMBER() Difference Trick: Subtracting ROW_NUMBER() from check_date produces an identical constant date (island group key) for all consecutive dates in a streak!",
    solutionSql: `WITH healthy_days AS (
  SELECT
    server_id,
    check_date,
    ROW_NUMBER() OVER (PARTITION BY server_id ORDER BY check_date) AS rn
  FROM server_health
  WHERE status = 'HEALTHY'
),
grouped_islands AS (
  SELECT
    server_id,
    check_date,
    -- Subtracting 'rn' days from check_date forms a fixed grouping anchor
    DATEADD(day, -rn, check_date) AS island_id
  FROM healthy_days
)
SELECT
  server_id,
  MIN(check_date) AS streak_start_date,
  MAX(check_date) AS streak_end_date,
  COUNT(*) AS streak_days
FROM grouped_islands
GROUP BY server_id, island_id
HAVING COUNT(*) >= 2
ORDER BY server_id, streak_start_date;`,
    queryPlanTriage:
      "Pipelined Stream Aggregate following a Window Spool. Cardinality estimation benefits from a composite index on server_health(server_id, status, check_date).",
    rubricChecks: [
      "Filtered status = 'HEALTHY' in WHERE clause prior to windowing",
      "Utilized date arithmetic difference with ROW_NUMBER() to identify contiguous islands",
      "Aggregated island groups with MIN(check_date) and MAX(check_date)",
      "Set streak_days = COUNT(*) to avoid off-by-one fencepost errors",
    ],
  },
  {
    id: "drill-tier4-skew-tuning",
    tier: "Architect",
    tierColor: "text-purple-700 dark:text-purple-400 border-purple-700/30 bg-purple-50/50 dark:bg-purple-950/20",
    title: "Distributed MPP Join Skew Elimination with Two-Phase Salting",
    domain: "Petabyte-Scale E-Commerce DW",
    prompt:
      "A 500-billion row fact table joins a customer dimension on customer_id. Key 'GUEST_USER' represents 38% of all rows, causing a severe 4-hour straggler bottleneck on distribution #17 in Azure Synapse / Spark. Architect a zero-skew query pattern.",
    schemaDetails: "fact_sales(order_id BIGINT, customer_id VARCHAR, amount DECIMAL), dim_customer(customer_id VARCHAR, segment VARCHAR)",
    hint: "Isolate the skewed hot-key or apply 2-phase salting: Append MOD(ABS(HASH(order_id)), 32) to the fact customer_id and CROSS JOIN the hot-key dimension row with an array of numbers 0..31.",
    solutionSql: `-- Strategy: Split-and-Union Skew Elimination
WITH fact_skewed AS (
  -- 1. Isolate hot-key and salt with 32 synthetic shards
  SELECT
    order_id,
    customer_id,
    CONCAT(customer_id, '_', CAST(ABS(HASH(order_id)) % 32 AS VARCHAR)) AS salted_key,
    amount
  FROM fact_sales
  WHERE customer_id = 'GUEST_USER'
),
dim_skewed_replicated AS (
  -- 2. Explode the single hot-key dimension across all 32 synthetic shards
  SELECT
    CONCAT(c.customer_id, '_', CAST(s.shard_id AS VARCHAR)) AS salted_key,
    c.customer_id,
    c.segment
  FROM dim_customer c
  CROSS JOIN (
    SELECT 0 AS shard_id UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3
    -- (Expanded to 32 shards in production DDL)
  ) s
  WHERE c.customer_id = 'GUEST_USER'
),
fact_normal AS (
  -- 3. Uniform normal keys execute standard MPP Hash Join
  SELECT f.order_id, f.customer_id, d.segment, f.amount
  FROM fact_sales f
  JOIN dim_customer d ON f.customer_id = d.customer_id
  WHERE f.customer_id != 'GUEST_USER'
)
SELECT f.order_id, f.customer_id, d.segment, f.amount
FROM fact_skewed f
JOIN dim_skewed_replicated d ON f.salted_key = d.salted_key
UNION ALL
SELECT order_id, customer_id, segment, amount
FROM fact_normal;`,
    queryPlanTriage:
      "Distributes the 38% single-node bottleneck across all 60 MPP compute distributions or Spark executor cores. Reduces maximum task runtime from 4.2 hours to 6.8 minutes.",
    rubricChecks: [
      "Identified root cause as MPP hash distribution skew on high-cardinality hot key",
      "Applied synthetic key salting to disperse hot records across all compute nodes",
      "Replicated the dimension slice to match the salt space without full Cartesian product",
      "Avoided non-deterministic rand() functions to ensure query repeatability",
    ],
  },
];

/* ==========================================================================
   MAIN COMPONENT
   ========================================================================== */

export function SqlClient() {
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();

  const [activeTab, setActiveTab] = useState<SqlSubtab>("stepper");

  useEffect(() => {
    const params = new URLSearchParams(searchKey);
    const paramTab = params.get("tab")?.toLowerCase() as SqlSubtab | undefined;
    if (paramTab && ["stepper", "window", "rosetta", "drills", "runbooks"].includes(paramTab)) {
      setActiveTab(paramTab);
    } else if (!paramTab) {
      setActiveTab("stepper");
    }
  }, [searchKey]);

  const handleTabChange = useCallback((tab: SqlSubtab) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.replaceState(null, "", url.toString());
    }
  }, []);

  // Stepper state
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  // Window Visualizer state
  const [partitionByDept, setPartitionByDept] = useState(true);
  const [frameBoundMode, setFrameBoundMode] = useState<"unbounded" | "sliding" | "range">("unbounded");
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(1);

  // Rosetta state
  const [rosettaSearch, setRosettaSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Drills state
  const [activeTier, setActiveTier] = useState<"All" | "Junior" | "Mid" | "Senior" | "Architect">("All");
  const [expandedSolutions, setExpandedSolutions] = useState<Record<string, boolean>>({});
  const [rubricAnswers, setRubricAnswers] = useState<Record<string, boolean>>({});

  // Whiteboard diagram
  const sqlServerDiagram = useMemo(
    () => architectureDiagrams.find((d) => d.id === "sql-server-query-engine-optimization"),
    []
  );

  const toggleSolution = useCallback((id: string) => {
    setExpandedSolutions((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const toggleRubric = useCallback((key: string) => {
    setRubricAnswers((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard`);
  }, []);

  /* --------------------------------------------------------------------------
     Computed Window Data
     -------------------------------------------------------------------------- */
  const computedWindowRows = useMemo(() => {
    // Clone and sort
    const rows = [...WINDOW_RAW_DATA].sort((a, b) => {
      if (partitionByDept) {
        if (a.department !== b.department) return a.department.localeCompare(b.department);
      }
      return b.salary - a.salary; // Descending by salary
    });

    // Compute ROW_NUMBER, RANK, DENSE_RANK, LEAD, LAG, RUNNING_SUM
    let currentDept = "";
    let deptRowCounter = 0;
    let deptRank = 1;
    let deptDenseRank = 1;
    let lastSalary = -1;
    let sameSalaryCount = 0;
    let runningSum = 0;

    return rows.map((row, idx, arr) => {
      if (!partitionByDept) {
        // Global
        if (idx === 0) {
          deptRowCounter = 1;
          deptRank = 1;
          deptDenseRank = 1;
          lastSalary = row.salary;
          sameSalaryCount = 1;
          runningSum = row.salary;
        } else {
          deptRowCounter++;
          if (row.salary === lastSalary) {
            sameSalaryCount++;
          } else {
            deptRank += sameSalaryCount;
            deptDenseRank += 1;
            sameSalaryCount = 1;
            lastSalary = row.salary;
          }
          runningSum += row.salary;
        }
      } else {
        // Partitioned
        if (row.department !== currentDept) {
          currentDept = row.department;
          deptRowCounter = 1;
          deptRank = 1;
          deptDenseRank = 1;
          lastSalary = row.salary;
          sameSalaryCount = 1;
          runningSum = row.salary;
        } else {
          deptRowCounter++;
          if (row.salary === lastSalary) {
            sameSalaryCount++;
          } else {
            deptRank += sameSalaryCount;
            deptDenseRank += 1;
            sameSalaryCount = 1;
            lastSalary = row.salary;
          }
          runningSum += row.salary;
        }
      }

      // Next and Prev for LEAD and LAG
      const prevRow = idx > 0 && (!partitionByDept || arr[idx - 1].department === row.department) ? arr[idx - 1] : null;
      const nextRow = idx < arr.length - 1 && (!partitionByDept || arr[idx + 1].department === row.department) ? arr[idx + 1] : null;

      return {
        ...row,
        rowNumber: deptRowCounter,
        rank: deptRank,
        denseRank: deptDenseRank,
        lagSalary: prevRow ? prevRow.salary : null,
        leadSalary: nextRow ? nextRow.salary : null,
        runningSum,
      };
    });
  }, [partitionByDept]);

  // Filtered Rosetta
  const filteredRosetta = useMemo(() => {
    return ROSETTA_ENTRIES.filter((entry) => {
      const matchCategory = selectedCategory === "All" || entry.category === selectedCategory;
      const matchSearch =
        !rosettaSearch ||
        entry.title.toLowerCase().includes(rosettaSearch.toLowerCase()) ||
        entry.problem.toLowerCase().includes(rosettaSearch.toLowerCase()) ||
        entry.architectNote.toLowerCase().includes(rosettaSearch.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, rosettaSearch]);

  const rosettaCategories = useMemo(() => {
    const cats = Array.from(new Set(ROSETTA_ENTRIES.map((r) => r.category)));
    return ["All", ...cats];
  }, []);

  // Filtered Drills
  const filteredDrills = useMemo(() => {
    if (activeTier === "All") return DRILL_ITEMS;
    return DRILL_ITEMS.filter((d) => d.tier === activeTier);
  }, [activeTier]);

  const activeStep = EXECUTION_STEPS[currentStepIdx];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-24">
      {/* Prerequisite Top Banner */}
      <PrerequisiteBanner
        moduleTitle="Modern SQL Mastery & Query Engine Internals"
        prerequisites={[
          {
            term: "Relational Query Engine Internals",
            conceptId: "sql-server-query-engine-optimization",
            whyNeeded: "Essential for understanding cost-based optimization and Buffer Pool caching.",
          },
          {
            term: "Window Functions",
            conceptId: "window-functions",
            whyNeeded: "Core analytical requirement for ranking, cumulative running totals, and moving averages.",
          },
          {
            term: "Distributed Joins & S-F-W-G-H-O",
            conceptId: "distributed-joins-mpp",
            whyNeeded: "Mandatory for understanding query clause execution order and MPP hash distributions.",
          },
        ]}
      />

      {/* Hero Header */}
      <header className="border-b border-[var(--border)] bg-[var(--card)]/50 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-8 transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-700/20">
                  <Database className="w-3.5 h-3.5" />
                  Flagship SQL Study Guide
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-700/20">
                  S-F-W-G-H-O Stepper
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border border-sky-700/20">
                  Window Visualizer
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-700/20">
                  4-Tier Drills
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                Modern SQL Query Execution, Window Functions & Engine Internals
              </h1>
              <p className="text-sm sm:text-base text-[var(--muted-foreground)] max-w-4xl text-pretty">
                Master SQL from logical clause execution order to live window function partitioning, multi-engine rosetta stone syntax (T-SQL, PostgreSQL, Spark SQL, Snowflake), and production query plan optimization.
              </p>
            </div>

            {/* Quick Metrics Badge Group */}
            <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
              <div className="px-3.5 py-2 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-xs text-center">
                <div className="text-lg font-bold text-indigo-700 dark:text-indigo-400">9 Steps</div>
                <div className="text-[11px] text-[var(--muted-foreground)] font-medium">Logical Order</div>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-xs text-center">
                <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">5 Engines</div>
                <div className="text-[11px] text-[var(--muted-foreground)] font-medium">Rosetta Matrix</div>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-xs text-center">
                <div className="text-lg font-bold text-amber-700 dark:text-amber-400">20 Drills</div>
                <div className="text-[11px] text-[var(--muted-foreground)] font-medium">Junior → Arch</div>
              </div>
            </div>
          </div>

          {/* Navigation Subtabs */}
          <div className="mt-8 flex items-center gap-2 border-b border-[var(--border)] overflow-x-auto pb-px">
            <button
              onClick={() => handleTabChange("stepper")}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors",
                activeTab === "stepper"
                  ? "border-indigo-600 text-indigo-700 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-t-lg"
                  : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              )}
            >
              <Play className="w-4 h-4" />
              1. Query Execution Stepper (S-F-W-G-H-O)
            </button>
            <button
              onClick={() => handleTabChange("window")}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors",
                activeTab === "window"
                  ? "border-indigo-600 text-indigo-700 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-t-lg"
                  : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              )}
            >
              <TableIcon className="w-4 h-4" />
              2. Window Function Visualizer
            </button>
            <button
              onClick={() => handleTabChange("rosetta")}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors",
                activeTab === "rosetta"
                  ? "border-indigo-600 text-indigo-700 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-t-lg"
                  : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              )}
            >
              <Code2 className="w-4 h-4" />
              3. Multi-Engine Rosetta Stone
            </button>
            <button
              onClick={() => handleTabChange("drills")}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors",
                activeTab === "drills"
                  ? "border-indigo-600 text-indigo-700 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-t-lg"
                  : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              )}
            >
              <Sparkles className="w-4 h-4" />
              4. 4-Tier Practice Drills
            </button>
            <button
              onClick={() => handleTabChange("runbooks")}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors",
                activeTab === "runbooks"
                  ? "border-indigo-600 text-indigo-700 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-t-lg"
                  : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              )}
            >
              <Terminal className="w-4 h-4" />
              5. Architecture & Runbooks
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ====================================================================
            TAB 1: CLAUSE EXECUTION STEPPER
            ==================================================================== */}
        {activeTab === "stepper" && (
          <div className="space-y-6">
            {/* Stage Progress Bar / Stepper Navigation */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-base font-bold flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-700 text-white text-xs font-bold">
                      {activeStep.order}
                    </span>
                    Logical Execution Order: {activeStep.clause} ({activeStep.name})
                  </h2>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                    Step {currentStepIdx + 1} of {EXECUTION_STEPS.length}: Written SQL starts with SELECT, but the database engine executes in this exact logical order.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={currentStepIdx === 0}
                    onClick={() => setCurrentStepIdx((i) => Math.max(0, i - 1))}
                    className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs font-semibold hover:bg-[var(--accent)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous Step
                  </button>
                  <button
                    disabled={currentStepIdx === EXECUTION_STEPS.length - 1}
                    onClick={() => setCurrentStepIdx((i) => Math.min(EXECUTION_STEPS.length - 1, i + 1))}
                    className="px-3 py-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-semibold shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next Step
                  </button>
                  <button
                    onClick={() => setCurrentStepIdx(0)}
                    title="Reset to Step 1"
                    className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Clickable Step Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                {EXECUTION_STEPS.map((step, idx) => {
                  const isActive = idx === currentStepIdx;
                  const isPast = idx < currentStepIdx;
                  return (
                    <button
                      key={step.id}
                      onClick={() => setCurrentStepIdx(idx)}
                      className={cn(
                        "flex flex-col p-2.5 rounded-xl border text-left transition-all",
                        isActive
                          ? "border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20"
                          : isPast
                          ? "border-emerald-700/30 bg-emerald-50/30 dark:bg-emerald-950/10 text-[var(--foreground)]"
                          : "border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] opacity-70 hover:opacity-100"
                      )}
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className={cn(isActive ? "text-indigo-700 dark:text-indigo-400" : isPast ? "text-emerald-700 dark:text-emerald-400" : "")}>
                          {step.order}. {step.clause}
                        </span>
                        {isPast && <Check className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />}
                      </div>
                      <span className="text-[10px] text-[var(--muted-foreground)] mt-1 truncate">
                        {step.name.split(" ")[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step Detail Cards: 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Code & Architecture Internals */}
              <div className="lg:col-span-5 space-y-4">
                {/* Active SQL Clause */}
                <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                      Active Clause Expression
                    </span>
                    <button
                      onClick={() => copyToClipboard(activeStep.sqlSnippet, "Clause Snippet")}
                      className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </button>
                  </div>
                  <CodeBlock
                    code={activeStep.sqlSnippet}
                    language="sql"
                    filename={`step_${activeStep.order}_${activeStep.id}.sql`}
                  />
                </div>

                {/* Under the Hood Engine Internals */}
                <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-xs space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-sky-700 dark:text-sky-400">
                    <Cpu className="w-4 h-4" />
                    Query Engine Under the Hood
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed text-pretty">
                    {activeStep.engineInternals}
                  </p>
                </div>

                {/* Interview Trap & Gotcha */}
                <div className="rounded-xl border border-amber-700/30 bg-amber-50/40 dark:bg-amber-950/20 p-4 shadow-xs space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    Interview Pitfall & Gotcha
                  </div>
                  <p className="text-xs text-amber-900 dark:text-amber-200/90 leading-relaxed text-pretty">
                    {activeStep.interviewTrap}
                  </p>
                </div>
              </div>

              {/* Right Column: Live Intermediate Resultset Simulator */}
              <div className="lg:col-span-7">
                <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xs space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
                    <div>
                      <h3 className="text-sm font-bold flex items-center gap-2">
                        <TableIcon className="w-4 h-4 text-indigo-700 dark:text-indigo-400" />
                        Intermediate Resultset Simulator
                      </h3>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {activeStep.rowExplanation}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border border-indigo-700/20">
                      {activeStep.data.filter((r) => !r.discarded).length} Active Rows
                    </span>
                  </div>

                  {/* Responsive Table */}
                  <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[var(--accent)] border-b border-[var(--border)] text-[var(--foreground)]">
                        <tr>
                          {activeStep.columns.map((col, idx) => (
                            <th key={idx} className="px-3.5 py-2.5 font-semibold text-[11px] whitespace-nowrap">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)] bg-[var(--card)]">
                        {activeStep.data.map((row, idx) => (
                          <tr
                            key={idx}
                            className={cn(
                              "transition-colors",
                              row.discarded
                                ? "bg-red-50/30 dark:bg-red-950/10 text-red-900/60 dark:text-red-400/50 line-through"
                                : row.highlighted
                                ? "bg-indigo-50/40 dark:bg-indigo-950/30 font-semibold"
                                : "hover:bg-[var(--accent)]/50"
                            )}
                          >
                            <td className="px-3.5 py-2 whitespace-nowrap">{row.id || idx + 1}</td>
                            <td className="px-3.5 py-2 whitespace-nowrap">{row.merchant}</td>
                            <td className="px-3.5 py-2 whitespace-nowrap">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-sans font-medium bg-[var(--accent)] text-[var(--foreground)]">
                                {row.category}
                              </span>
                            </td>
                            {row.amount !== 0 && (
                              <td className="px-3.5 py-2 whitespace-nowrap">${row.amount.toFixed(2)}</td>
                            )}
                            {row.tx_count !== undefined && (
                              <td className="px-3.5 py-2 whitespace-nowrap font-bold text-indigo-700 dark:text-indigo-400">
                                {row.tx_count}
                              </td>
                            )}
                            {row.total_spend !== undefined && (
                              <td className="px-3.5 py-2 whitespace-nowrap font-bold text-emerald-700 dark:text-emerald-400">
                                ${row.total_spend.toFixed(2)}
                              </td>
                            )}
                            {row.rank !== undefined && (
                              <td className="px-3.5 py-2 whitespace-nowrap">
                                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300">
                                  #{row.rank}
                                </span>
                              </td>
                            )}
                            <td className="px-3.5 py-2 whitespace-nowrap">
                              {row.discarded ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-sans font-semibold text-red-700 dark:text-red-400">
                                  Filtered: {row.discardReason}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-sans font-semibold text-emerald-700 dark:text-emerald-400">
                                  {row.status}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Tip Box */}
                  <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[var(--accent)]/50 text-xs text-[var(--muted-foreground)]">
                    <Info className="w-4 h-4 text-indigo-700 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <span>
                      Notice how the relational engine processes rows sequentially across relational operators in a plan tree. Understanding S-F-W-G-H-O allows data engineers to predict query bottlenecks before running <code className="px-1 py-0.5 rounded bg-[var(--card)] font-mono text-xs">EXPLAIN</code>.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            TAB 2: WINDOW FUNCTION VISUALIZER
            ==================================================================== */}
        {activeTab === "window" && (
          <div className="space-y-6">
            {/* Header & Controls Bar */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-700 dark:text-indigo-400" />
                    Interactive Window Function Calculator & Partition Inspector
                  </h2>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                    Compare ranking behaviors, lookahead/behind offsets, and cumulative running aggregates live over tied and distinct salaries.
                  </p>
                </div>

                {/* Partition Toggle Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center p-1 rounded-xl bg-[var(--accent)] border border-[var(--border)] text-xs font-semibold">
                    <button
                      onClick={() => setPartitionByDept(true)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg transition-colors",
                        partitionByDept
                          ? "bg-[var(--card)] text-indigo-700 dark:text-indigo-400 shadow-xs"
                          : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                      )}
                    >
                      PARTITION BY department
                    </button>
                    <button
                      onClick={() => setPartitionByDept(false)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg transition-colors",
                        !partitionByDept
                          ? "bg-[var(--card)] text-indigo-700 dark:text-indigo-400 shadow-xs"
                          : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                      )}
                    >
                      Global (No Partition)
                    </button>
                  </div>
                </div>
              </div>

              {/* Dynamic SQL Code Block reflecting user selection */}
              <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-3">
                <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] mb-1 font-mono">
                  <span>Dynamic Analytical Query</span>
                  <span>ORDER BY salary DESC</span>
                </div>
                <CodeBlock
                  code={`SELECT
  employee,
  department,
  salary,
  ROW_NUMBER() OVER (${partitionByDept ? "PARTITION BY department " : ""}ORDER BY salary DESC) AS row_num,
  RANK()       OVER (${partitionByDept ? "PARTITION BY department " : ""}ORDER BY salary DESC) AS rank_val,
  DENSE_RANK() OVER (${partitionByDept ? "PARTITION BY department " : ""}ORDER BY salary DESC) AS dense_rank_val,
  LAG(salary, 1)  OVER (${partitionByDept ? "PARTITION BY department " : ""}ORDER BY salary DESC) AS prev_salary,
  LEAD(salary, 1) OVER (${partitionByDept ? "PARTITION BY department " : ""}ORDER BY salary DESC) AS next_salary,
  SUM(salary) OVER (
    ${partitionByDept ? "PARTITION BY department " : ""}ORDER BY salary DESC
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  ) AS running_salary_sum
FROM employees;`}
                  language="sql"
                  filename="window_simulation.sql"
                />
              </div>
            </div>

            {/* Visualizer Table */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[var(--foreground)]">Ranking Legend:</span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-sky-700 dark:text-sky-400 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span> ROW_NUMBER (Sequential 1,2,3,4)
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-400 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> RANK (Leaves gaps: 1, 2, 2, 4)
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> DENSE_RANK (No gaps: 1, 2, 2, 3)
                  </span>
                </div>
                <span className="text-xs text-[var(--muted-foreground)]">
                  Click any row to inspect window boundary calculation
                </span>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[var(--accent)] border-b border-[var(--border)] text-[var(--foreground)]">
                    <tr>
                      <th className="px-3.5 py-3 font-semibold text-[11px]">Employee</th>
                      <th className="px-3.5 py-3 font-semibold text-[11px]">Department</th>
                      <th className="px-3.5 py-3 font-semibold text-[11px]">Salary ($)</th>
                      <th className="px-3.5 py-3 font-semibold text-[11px] text-sky-700 dark:text-sky-400">ROW_NUMBER</th>
                      <th className="px-3.5 py-3 font-semibold text-[11px] text-amber-700 dark:text-amber-400">RANK</th>
                      <th className="px-3.5 py-3 font-semibold text-[11px] text-emerald-700 dark:text-emerald-400">DENSE_RANK</th>
                      <th className="px-3.5 py-3 font-semibold text-[11px]">LAG (Prev)</th>
                      <th className="px-3.5 py-3 font-semibold text-[11px]">LEAD (Next)</th>
                      <th className="px-3.5 py-3 font-semibold text-[11px] text-indigo-700 dark:text-indigo-400">Running SUM ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)] bg-[var(--card)]">
                    {computedWindowRows.map((row) => {
                      const isSelected = selectedRecordId === row.id;
                      const isTied =
                        computedWindowRows.filter(
                          (r) =>
                            r.salary === row.salary &&
                            (!partitionByDept || r.department === row.department)
                        ).length > 1;

                      return (
                        <tr
                          key={row.id}
                          onClick={() => setSelectedRecordId(row.id)}
                          className={cn(
                            "cursor-pointer transition-colors",
                            isSelected
                              ? "bg-indigo-50/60 dark:bg-indigo-950/40 ring-1 ring-indigo-500/30"
                              : "hover:bg-[var(--accent)]/50"
                          )}
                        >
                          <td className="px-3.5 py-2.5 font-sans font-medium text-[var(--foreground)] whitespace-nowrap">
                            {row.employee}
                          </td>
                          <td className="px-3.5 py-2.5 font-sans whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[var(--accent)] text-[var(--foreground)]">
                              {row.department}
                            </span>
                          </td>
                          <td className="px-3.5 py-2.5 whitespace-nowrap font-bold">
                            ${row.salary.toLocaleString()}
                            {isTied && (
                              <span className="ml-1.5 px-1 py-0.2 rounded text-[9px] font-sans font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                                TIE
                              </span>
                            )}
                          </td>
                          <td className="px-3.5 py-2.5 whitespace-nowrap text-sky-700 dark:text-sky-400 font-bold">
                            {row.rowNumber}
                          </td>
                          <td className="px-3.5 py-2.5 whitespace-nowrap text-amber-700 dark:text-amber-400 font-bold">
                            {row.rank}
                          </td>
                          <td className="px-3.5 py-2.5 whitespace-nowrap text-emerald-700 dark:text-emerald-400 font-bold">
                            {row.denseRank}
                          </td>
                          <td className="px-3.5 py-2.5 whitespace-nowrap text-[var(--muted-foreground)]">
                            {row.lagSalary !== null ? `$${row.lagSalary.toLocaleString()}` : "NULL"}
                          </td>
                          <td className="px-3.5 py-2.5 whitespace-nowrap text-[var(--muted-foreground)]">
                            {row.leadSalary !== null ? `$${row.leadSalary.toLocaleString()}` : "NULL"}
                          </td>
                          <td className="px-3.5 py-2.5 whitespace-nowrap font-bold text-indigo-700 dark:text-indigo-400">
                            ${row.runningSum.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Selected Row Diagnostic Drilldown */}
              {selectedRecordId !== null && (
                <div className="rounded-xl border border-indigo-700/30 bg-indigo-50/30 dark:bg-indigo-950/20 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                      <Info className="w-4 h-4 text-indigo-700" />
                      Window Inspector: {computedWindowRows.find((r) => r.id === selectedRecordId)?.employee} (${computedWindowRows.find((r) => r.id === selectedRecordId)?.salary.toLocaleString()})
                    </span>
                    <span className="text-[11px] text-[var(--muted-foreground)] font-mono">
                      Department: {computedWindowRows.find((r) => r.id === selectedRecordId)?.department}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed text-pretty">
                    {(() => {
                      const row = computedWindowRows.find((r) => r.id === selectedRecordId);
                      if (!row) return "";
                      return `This record receives ROW_NUMBER = ${row.rowNumber} (strict sequential row index), RANK = ${row.rank} (skips numbers when predecessors tie), and DENSE_RANK = ${row.denseRank} (increments without gaps regardless of ties). Its running sum of $${row.runningSum.toLocaleString()} aggregates all preceding rows within this partition.`;
                    })()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ====================================================================
            TAB 3: MULTI-ENGINE ROSETTA STONE CONSOLE
            ==================================================================== */}
        {activeTab === "rosetta" && (
          <div className="space-y-6">
            {/* Header & Filter Controls */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-indigo-700 dark:text-indigo-400" />
                    Multi-Engine SQL & Polyglot Rosetta Stone
                  </h2>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                    Compare syntax and execution mechanics side-by-side across PostgreSQL, Microsoft T-SQL, Apache Spark SQL, Snowflake, and Python (PySpark/Polars).
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                  <input
                    type="text"
                    value={rosettaSearch}
                    onChange={(e) => setRosettaSearch(e.target.value)}
                    placeholder="Search patterns or engines..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[var(--border)]">
                {rosettaCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-semibold transition-colors",
                      selectedCategory === cat
                        ? "bg-indigo-700 text-white shadow-xs"
                        : "bg-[var(--accent)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Rosetta Entries List */}
            <div className="space-y-6">
              {filteredRosetta.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xs space-y-5"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border border-indigo-700/20">
                          {entry.category}
                        </span>
                        <h3 className="text-base font-bold">{entry.title}</h3>
                      </div>
                      <p className="text-xs text-[var(--muted-foreground)] mt-1">{entry.problem}</p>
                    </div>

                    <div className="text-xs text-amber-800 dark:text-amber-300/90 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-700/20 rounded-xl px-3 py-2 max-w-md">
                      <span className="font-bold">Architect Note: </span>
                      {entry.architectNote}
                    </div>
                  </div>

                  {/* Multi-Engine Code Comparison Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* PostgreSQL */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold text-sky-700 dark:text-sky-400">
                        <span>PostgreSQL / ANSI SQL</span>
                        <button
                          onClick={() => copyToClipboard(entry.postgresAnsi, "PostgreSQL SQL")}
                          className="text-[11px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                      <CodeBlock code={entry.postgresAnsi} language="sql" filename="postgres.sql" />
                    </div>

                    {/* Microsoft T-SQL */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold text-blue-700 dark:text-blue-400">
                        <span>Microsoft T-SQL (Fabric/Synapse)</span>
                        <button
                          onClick={() => copyToClipboard(entry.tsql, "T-SQL")}
                          className="text-[11px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                      <CodeBlock code={entry.tsql} language="sql" filename="tsql.sql" />
                    </div>

                    {/* Apache Spark SQL */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold text-amber-700 dark:text-amber-400">
                        <span>Apache Spark SQL (Databricks)</span>
                        <button
                          onClick={() => copyToClipboard(entry.sparkSql, "Spark SQL")}
                          className="text-[11px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                      <CodeBlock code={entry.sparkSql} language="sql" filename="spark.sql" />
                    </div>

                    {/* Snowflake & BigQuery */}
                    <div className="space-y-1.5 md:col-span-2 lg:col-span-1">
                      <div className="flex items-center justify-between text-xs font-semibold text-purple-700 dark:text-purple-400">
                        <span>Snowflake & BigQuery</span>
                        <button
                          onClick={() => copyToClipboard(entry.snowflakeBq, "Cloud DW SQL")}
                          className="text-[11px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                      <CodeBlock code={entry.snowflakeBq} language="sql" filename="cloud_dw.sql" />
                    </div>

                    {/* Python PySpark & Polars */}
                    <div className="space-y-1.5 md:col-span-2 lg:col-span-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        <span>Python DataFrame Equivalent (PySpark & Polars)</span>
                        <button
                          onClick={() => copyToClipboard(entry.pysparkPolars, "Python Code")}
                          className="text-[11px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                      <CodeBlock code={entry.pysparkPolars} language="python" filename="dataframe.py" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ====================================================================
            TAB 4: 4-TIER INTERACTIVE PRACTICE DRILLS & QUIZ
            ==================================================================== */}
        {activeTab === "drills" && (
          <div className="space-y-6">
            {/* Header & Difficulty Selector */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-700 dark:text-indigo-400" />
                    4-Tier Interview Drills & Candidate Evaluation Rubric
                  </h2>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                    Real-world scenarios from Junior DE to Principal Data Architect. Self-assess against production rubrics and query plan checklists.
                  </p>
                </div>

                {/* Tier Filter Buttons */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {(["All", "Junior", "Mid", "Senior", "Architect"] as const).map((tier) => (
                    <button
                      key={tier}
                      onClick={() => setActiveTier(tier)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                        activeTier === tier
                          ? "bg-indigo-700 text-white shadow-xs"
                          : "bg-[var(--accent)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                      )}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Drills List */}
            <div className="space-y-6">
              {filteredDrills.map((drill) => {
                const isRevealed = expandedSolutions[drill.id] || false;
                return (
                  <div
                    key={drill.id}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xs space-y-5"
                  >
                    {/* Drill Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-bold border", drill.tierColor)}>
                            {drill.tier} Tier
                          </span>
                          <span className="text-xs text-[var(--muted-foreground)] font-medium">
                            Domain: {drill.domain}
                          </span>
                        </div>
                        <h3 className="text-base font-bold">{drill.title}</h3>
                      </div>

                      <button
                        onClick={() => toggleSolution(drill.id)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 self-start sm:self-auto transition-colors",
                          isRevealed
                            ? "bg-[var(--accent)] text-[var(--foreground)] border border-[var(--border)]"
                            : "bg-indigo-700 hover:bg-indigo-800 text-white shadow-xs"
                        )}
                      >
                        <Eye className="w-4 h-4" />
                        {isRevealed ? "Hide Working Solution" : "Reveal Production Solution"}
                      </button>
                    </div>

                    {/* Problem Statement & Schema */}
                    <div className="space-y-3">
                      <div>
                        <span className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
                          Problem Scenario
                        </span>
                        <p className="text-sm font-medium mt-1 leading-relaxed text-pretty">{drill.prompt}</p>
                      </div>

                      <div className="p-3 rounded-lg bg-[var(--accent)]/50 border border-[var(--border)] font-mono text-xs text-[var(--muted-foreground)]">
                        <span className="font-bold text-[var(--foreground)]">Schema: </span>
                        {drill.schemaDetails}
                      </div>

                      {/* Strategy Hint */}
                      <div className="flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300/90 bg-amber-50/50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-700/20">
                        <Zap className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        <span>
                          <strong className="font-semibold">Strategy Hint: </strong>
                          {drill.hint}
                        </span>
                      </div>
                    </div>

                    {/* Revealed Solution & Rubric */}
                    {isRevealed && (
                      <div className="pt-4 border-t border-[var(--border)] space-y-5 animate-in fade-in duration-200">
                        {/* SQL Solution */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4" />
                              Production-Grade SQL Solution
                            </span>
                            <button
                              onClick={() => copyToClipboard(drill.solutionSql, "SQL Solution")}
                              className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-1"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              Copy Solution
                            </button>
                          </div>
                          <CodeBlock code={drill.solutionSql} language="sql" filename="solution.sql" />
                        </div>

                        {/* Query Plan & Optimization Analysis */}
                        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--background)] space-y-1.5">
                          <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                            <Cpu className="w-4 h-4" />
                            Query Plan & Optimization Analysis
                          </span>
                          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed text-pretty">
                            {drill.queryPlanTriage}
                          </p>
                        </div>

                        {/* Interactive Candidate Rubric */}
                        <div className="p-4 rounded-xl border border-indigo-700/20 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-3">
                          <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300">
                            Candidate Evaluation Rubric (Check what you fulfilled):
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {drill.rubricChecks.map((check, idx) => {
                              const key = `${drill.id}-rubric-${idx}`;
                              const isChecked = rubricAnswers[key] || false;
                              return (
                                <label
                                  key={idx}
                                  onClick={() => toggleRubric(key)}
                                  className={cn(
                                    "flex items-start gap-2.5 p-2 rounded-lg border text-xs cursor-pointer select-none transition-colors",
                                    isChecked
                                      ? "border-emerald-700/40 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300 font-semibold"
                                      : "border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:border-indigo-500/30"
                                  )}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    readOnly
                                    className="mt-0.5 rounded text-emerald-700 focus:ring-emerald-500"
                                  />
                                  <span>{check}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ====================================================================
            TAB 5: ARCHITECTURE WHITEBOARD & PRODUCTION RUNBOOKS
            ==================================================================== */}
        {activeTab === "runbooks" && (
          <div className="space-y-8">
            {/* Embedded Architecture Diagram */}
            {sqlServerDiagram && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-700 dark:text-indigo-400" />
                      Visual Architecture Blueprint: Query Engine & Storage Internals
                    </h2>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Explore the separation between Relational Engine (CBO) and Storage Engine (Buffer Pool, B-Trees, Query Store).
                    </p>
                  </div>
                  <Link
                    href={`/whiteboards?id=${sqlServerDiagram.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs font-semibold hover:bg-[var(--accent)] text-indigo-700 dark:text-indigo-400 transition-colors"
                  >
                    Open in Whiteboard Hub
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <WhiteboardCard diagram={sqlServerDiagram} priority={true} />
              </div>
            )}

            {/* Production Sev-1 Runbooks Grid */}
            <div className="space-y-4">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-700 dark:text-indigo-400" />
                Production SQL Triage & Incident Runbooks
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Runbook 1: Deadlocks */}
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-700/20">
                      Sev-1 Deadlock Triage
                    </span>
                    <span className="text-xs text-[var(--muted-foreground)] font-mono">Runbook #SQL-101</span>
                  </div>
                  <h4 className="text-sm font-bold">Deadlock Graph & Lock Escalation Resolution</h4>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed text-pretty">
                    When concurrent transactions acquire conflicting locks in opposing orders, the engine terminates one victim (Error 1205). Inspect blocking chains via DMVs and force consistent resource access order.
                  </p>
                  <CodeBlock
                    code={`-- Active Blocking Chain Diagnostic
SELECT
  tl.resource_type,
  tl.request_mode,
  tl.request_status,
  wt.blocking_session_id,
  wt.session_id AS waiting_session_id,
  wt.wait_duration_ms,
  st.text AS query_text
FROM sys.dm_tran_locks tl
JOIN sys.dm_os_waiting_tasks wt ON tl.lock_owner_address = wt.resource_address
CROSS APPLY sys.dm_exec_sql_text(wt.resource_address) st;`}
                    language="sql"
                    filename="deadlock_triage.sql"
                  />
                  <div className="text-xs text-[var(--muted-foreground)] space-y-1">
                    <p><strong className="text-[var(--foreground)]">Root-Cause Remediation:</strong></p>
                    <ul className="list-disc pl-4 space-y-0.5">
                      <li>Enforce uniform lock acquisition order across all microservices</li>
                      <li>Enable Read Committed Snapshot Isolation (RCSI) to prevent readers blocking writers</li>
                      <li>Keep transactions short; eliminate external API calls inside BEGIN TRAN blocks</li>
                    </ul>
                  </div>
                </div>

                {/* Runbook 2: Parameter Sniffing */}
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-700/20">
                      Performance Regression
                    </span>
                    <span className="text-xs text-[var(--muted-foreground)] font-mono">Runbook #SQL-102</span>
                  </div>
                  <h4 className="text-sm font-bold">Parameter Sniffing & Query Store Plan Forcing</h4>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed text-pretty">
                    A stored procedure runs in 20ms for small tenants but suddenly spikes to 45 seconds for enterprise tenants. The plan cache froze an inappropriate execution plan.
                  </p>
                  <CodeBlock
                    code={`-- Force Known Good Plan in Query Store
EXEC sp_query_store_force_plan
  @query_id = 482,
  @plan_id = 1205;

-- Or add compile hint for atypical parameter distributions:
SELECT * FROM orders
WHERE tenant_id = @tenant_id
OPTION (OPTIMIZE FOR (@tenant_id UNKNOWN));`}
                    language="sql"
                    filename="parameter_sniffing.sql"
                  />
                  <div className="text-xs text-[var(--muted-foreground)] space-y-1">
                    <p><strong className="text-[var(--foreground)]">Root-Cause Remediation:</strong></p>
                    <ul className="list-disc pl-4 space-y-0.5">
                      <li>Use Query Store plan forcing for emergency Sev-1 stabilization</li>
                      <li>Add <code className="font-mono text-xs">OPTIMIZE FOR (@param UNKNOWN)</code> for skewed parameters</li>
                      <li>Use local variables inside stored procedures to decouple compile-time sniffing</li>
                    </ul>
                  </div>
                </div>

                {/* Runbook 3: MPP Distribution Skew */}
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-700/20">
                      Cloud MPP Data Skew
                    </span>
                    <span className="text-xs text-[var(--muted-foreground)] font-mono">Runbook #SQL-103</span>
                  </div>
                  <h4 className="text-sm font-bold">Azure Synapse & Fabric DW: 60 Distribution Skew</h4>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed text-pretty">
                    Cloud DW MPP divides tables across 60 hash distributions. Inappropriate distribution keys cause 80% of rows to cluster on a single distribution node.
                  </p>
                  <CodeBlock
                    code={`-- Check Data Skew across 60 Distributions
SELECT
  distribution_id,
  rows_count
FROM sys.dm_pdw_nodes_db_partition_stats
WHERE object_id = OBJECT_ID('fact_orders')
ORDER BY rows_count DESC;

-- Remediate: Distribute on High-Cardinality Surrogate Key
CREATE TABLE fact_orders_rehash
WITH (
  DISTRIBUTION = HASH(order_surrogate_key),
  CLUSTERED COLUMNSTORE INDEX
) AS SELECT * FROM fact_orders;`}
                    language="sql"
                    filename="mpp_skew_triage.sql"
                  />
                  <div className="text-xs text-[var(--muted-foreground)] space-y-1">
                    <p><strong className="text-[var(--foreground)]">Root-Cause Remediation:</strong></p>
                    <ul className="list-disc pl-4 space-y-0.5">
                      <li>Never hash-distribute on dates, status flags, or nullable columns</li>
                      <li>Use REPLICATED distribution for dimension tables under 2GB</li>
                      <li>Ensure join keys match distribution keys to eliminate Data Movement Service (DMS) broadcast shuffles</li>
                    </ul>
                  </div>
                </div>

                {/* Runbook 4: TempDB Contention */}
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-700/20">
                      Storage Engine Latch
                    </span>
                    <span className="text-xs text-[var(--muted-foreground)] font-mono">Runbook #SQL-104</span>
                  </div>
                  <h4 className="text-sm font-bold">TempDB Allocation Bottlenecks (PAGELATCH_UP)</h4>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed text-pretty">
                    Heavy concurrent creation of temporary tables (#temp) causes latch contention on Page Free Space (PFS) and Global Allocation Map (GAM) pages in TempDB database file 2.
                  </p>
                  <CodeBlock
                    code={`-- Detect TempDB Allocation Contention
SELECT
  session_id,
  wait_type,
  wait_duration_ms,
  resource_description
FROM sys.dm_os_waiting_tasks
WHERE wait_type LIKE 'PAGELATCH_%'
  AND resource_description LIKE '2:%';`}
                    language="sql"
                    filename="tempdb_contention.sql"
                  />
                  <div className="text-xs text-[var(--muted-foreground)] space-y-1">
                    <p><strong className="text-[var(--foreground)]">Root-Cause Remediation:</strong></p>
                    <ul className="list-disc pl-4 space-y-0.5">
                      <li>Configure 1 TempDB data file per vCPU core (up to 8 files) with equal auto-growth</li>
                      <li>Enable Memory-Optimized TempDB Metadata (SQL Server 2019+)</li>
                      <li>Replace repetitive temporary tables with Common Table Expressions (CTEs) or table variables where appropriate</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
