# Pillar 02: Databricks Lakehouse & Unity Catalog
**Category:** `DATABRICKS` | **Domain:** `Lakehouse Governance & Databricks Platform`

---

### Q1: Explain Unity Catalog's 3-tier namespace and how dynamic row filters and column masks are implemented.

**Difficulty:** `HARD` | **Niche:** `Unity Catalog Governance`

**Direct 30-Second Answer:**
Unity Catalog organizes data in a 3-tier hierarchy: `catalog.schema.table`.
- **Centralized Governance:** Metastore is decoupled from individual workspaces; a single metastore spans multiple Azure regions, cloud accounts, and workspaces.
- **Dynamic Row Filtering & Column Masking:** Defined using native SQL UDFs without creating duplicate sanitized views:
```sql
-- Column Masking for PII
CREATE FUNCTION mask_ssn(ssn STRING) RETURN 
  CASE WHEN is_account_group_member('hr_admins') THEN ssn ELSE 'XXX-XX-' || RIGHT(ssn, 4) END;
ALTER TABLE hr_catalog.payroll.employees ALTER COLUMN ssn SET MASK mask_ssn;

-- Row Filtering for Region isolation
CREATE FUNCTION filter_region(country STRING) RETURN
  is_account_group_member('global_leads') OR country = current_user();
ALTER TABLE hr_catalog.payroll.employees SET ROW FILTER filter_region ON (country);
```

---

### Q2: What are Databricks Asset Bundles (DABs) and how do they establish GitOps CI/CD across Dev, Staging, and Prod?

**Difficulty:** `ARCHITECT` | **Niche:** `GitOps & Databricks Asset Bundles`

**Direct 30-Second Answer:**
Databricks Asset Bundles (DABs) provide an Infrastructure-as-Code (IaC) declarative framework for defining, testing, and deploying Databricks assets (jobs, pipelines, notebooks, compute settings, and permissions) via YAML:
- **Configuration:** A single `databricks.yml` file parameterizes targets (`dev`, `staging`, `prod`) with environment-specific workspace URLs, service principals, and catalog names.
- **GitOps Workflow:** Developers work on feature branches; CI runners validate bundles with `databricks bundle validate`. Merging to `main` executes `databricks bundle deploy -t prod`, ensuring 100% parity across environments without manual UI intervention.

---

### Q3: Compare Databricks Serverless Compute with Classic Compute in terms of architecture, startup latency, and cost.

**Difficulty:** `HARD` | **Niche:** `Serverless Compute & FinOps`

**Comparison Matrix:**
- **Startup Latency:** Serverless starts in **$< 10\text{ seconds}$** (instant pool warmup); Classic compute requires **3 to 7 minutes** to provision cloud VMs.
- **Cluster Plane Location:** Serverless compute runs in an optimized, isolated compute plane managed by Databricks, communicating via secure Private Link; Classic compute runs in the customer's VNet.
- **Idle Cost & Auto-Stop:** Serverless automatically scales down to zero instantly when idle; Classic compute has a minimum idle timeout (typically 10-15 mins) that continues incurring VM costs.
- **Ideal Workloads:** Serverless is best for ad-hoc SQL, sporadic batch jobs, and workflow tasks; Classic compute is used when specialized custom VNet firewalls or non-standard root init scripts are strictly required.

---

### Q4: How does the Photon engine accelerate Databricks SQL queries compared to standard Spark SQL?

**Difficulty:** `HARD` | **Niche:** `Vectorized Photon Engine`

**Direct 30-Second Answer:**
Photon is Databricks' vectorized query engine written entirely in **C++** from the ground up:
1. **Direct Hardware Vectorization (SIMD):** Photon processes columnar data in batches using Single Instruction, Multiple Data (SIMD) CPU registers, processing dozens of values per clock cycle.
2. **Eliminates JVM Heap & JIT Limits:** Bypasses Java garbage collection and the JVM runtime completely; avoids the method size limitations of Spark Janino Whole-Stage CodeGen.
3. **Optimal for String & Decimal Computations:** Outperforms standard Spark by **$3\times \text{ to } 8\times$** on heavy string parsing, regex, aggregation hash joins, and decimal arithmetic.

---

### Q5: Explain Delta Live Tables (DLT) / Lakeflow Pipelines and how data quality expectations are enforced.

**Difficulty:** `HARD` | **Niche:** `Lakeflow Pipelines & Data Quality`

**Direct 30-Second Answer:**
Lakeflow / DLT is a declarative framework where data engineers define tables using `@dlt.table` annotations, and Databricks manages the underlying DAG execution, batch/stream transitions, and cluster sizing.
**Enforcing Data Quality via Expectations:**
```python
import dlt
from pyspark.sql import functions as F

@dlt.table(
    name='silver_clean_orders',
    comment='Orders with validated totals'
)
# 1. Retain row, log metric
@dlt.expect('valid_order_id', 'order_id IS NOT NULL')
# 2. Drop corrupted row silently
@dlt.expect_or_drop('valid_amount', 'amount > 0')
# 3. Fail entire pipeline on critical invariant violation
@dlt.expect_or_fail('valid_currency', 'currency IN ("USD", "EUR", "GBP")')
def silver_clean_orders():
    return dlt.read_stream('bronze_raw_orders')
```

---

### Q6: What is Delta Lake Liquid Clustering (`CLUSTER BY`), and why does it replace legacy Hive partitioning and Z-Order?

**Difficulty:** `ARCHITECT` | **Niche:** `Liquid Clustering Architecture`

**Direct 30-Second Answer:**
Traditional Hive partitioning suffers from rigid hierarchical structures (e.g. `/year/month/day/`), and Z-Ordering requires expensive, full table rewrites during compaction.
**How Liquid Clustering Works:**
1. **Multi-Dimensional Space-Filling Curve:** Clusters data along specified columns (e.g. `CLUSTER BY (merchant_id, event_date)`) without hierarchical constraints.
2. **Incremental Clustering:** Unlike Z-Order, Liquid Clustering clusters data incrementally during write and compaction operations, reducing compute overhead by up to 70%.
3. **Flexibility:** Allows redefining cluster keys via `ALTER TABLE ... CLUSTER BY` without rewriting historical data.

---

### Q7: How do you enable and query Delta Change Data Feed (CDF) for downstream incremental consumers?

**Difficulty:** `HARD` | **Niche:** `Delta Change Data Feed`

**Direct 30-Second Answer:**
Enable CDF on the Delta table:
```sql
ALTER TABLE silver_orders SET TBLPROPERTIES (delta.enableChangeDataFeed = true);
```
**Querying Changes across Commit Versions:**
```python
# Read incremental changes between version 10 and 20
df_changes = (spark.read.format('delta')
    .option('readChangeFeed', 'true')
    .option('startingVersion', 10)
    .option('endingVersion', 20)
    .table('silver_orders'))
# Returns metadata columns: _change_type ('insert', 'update_preimage', 'update_postimage', 'delete')
```

---

### Q8: Explain Azure Databricks VNet Injection and how Private Link protects data in transit.

**Difficulty:** `ARCHITECT` | **Niche:** `Network & Cloud Security`

**Direct 30-Second Answer:**
- **VNet Injection:** Databricks deploys compute clusters into the customer's own Virtual Network across two dedicated subnets (`public-subnet` for host control, `private-subnet` for worker communication).
- **Front-End Private Link:** Secures user browser traffic connecting to the Databricks web UI and workspace over a private IP.
- **Back-End Private Link:** Directs traffic between the compute data plane in the customer's VNet and the managed Control Plane across the Microsoft backbone network, completely eliminating public internet traversal.

---

### Q9: How do Deletion Vectors work internally in Delta Lake 3.x, and how do they eliminate write amplification?

**Difficulty:** `ARCHITECT` | **Niche:** `Deletion Vectors & Storage`

**Direct 30-Second Answer:**
- **Without Deletion Vectors (Copy-on-Write):** Updating or deleting 1 row inside a 500 MB Parquet file forces Delta to read the entire 500 MB file, rewrite 499.9 MB of unchanged rows into a brand new Parquet file, and tombstone the old file (massive write amplification).
- **With Deletion Vectors (Soft Deletes via Bitmaps):** Delta leaves the original Parquet file intact and writes a tiny serialized bitmap file containing the row index of deleted rows. Readers read the base Parquet file and apply the deletion vector in-memory to skip deleted rows. When files accumulate many deletion vectors, `OPTIMIZE` consolidates them.

---

### Q10: Write a SQL query against Databricks System Tables to identify the top 5 most expensive jobs over the last 30 days.

**Difficulty:** `HARD` | **Niche:** `FinOps & Billing Analytics`

**Production SQL:**
```sql
SELECT
    usage.usage_metadata.job_id,
    usage.usage_metadata.job_name,
    ROUND(SUM(usage.usage_quantity), 2) AS total_dbus_consumed,
    ROUND(SUM(usage.usage_quantity * pricing.pricing.default), 2) AS estimated_usd_cost
FROM system.billing.usage usage
JOIN system.billing.list_prices pricing
  ON usage.cloud = pricing.cloud 
  AND usage.sku_name = pricing.sku_name
  AND usage.usage_start_time >= pricing.price_start_time
  AND (pricing.price_end_time IS NULL OR usage.usage_end_time < pricing.price_end_time)
WHERE usage.usage_start_time >= CURRENT_DATE() - INTERVAL 30 DAYS
  AND usage.usage_metadata.job_id IS NOT NULL
GROUP BY 1, 2
ORDER BY total_dbus_consumed DESC
LIMIT 5;
```

---
