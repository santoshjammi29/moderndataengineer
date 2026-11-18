# Pillar 07: dbt (Data Build Tool) & Analytics Engineering
**Category:** `DBT` | **Domain:** `Analytics Engineering & Transformation`

---

### Q1: Compare dbt materializations: View, Table, Incremental, Ephemeral, and Materialized View.

**Difficulty:** `HARD` | **Niche:** `dbt Materializations`

**Comparison Matrix:**
- **View:** `CREATE VIEW AS ...`. Fast build time with zero storage cost, but slow query latency on complex multi-table joins.
- **Table:** `CREATE TABLE AS ...`. Rebuilds table from scratch every run. Fast analytical queries, but expensive build times for large datasets.
- **Incremental:** `INSERT INTO / MERGE`. Ingests only new/modified records since the previous run. Scalable to billions of rows.
- **Ephemeral:** Interpolates model SQL directly into downstream models as a Common Table Expression (CTE). Creates no database objects.
- **Materialized View:** Managed database materialized view that refreshes incrementally on underlying database engine.

---

### Q2: Explain dbt incremental strategies: `merge`, `append`, and `insert_overwrite`. When do you use each?

**Difficulty:** `HARD` | **Niche:** `Incremental Strategies`

**Comparison:**
- **`merge` (Default):** Executes SQL `MERGE INTO` matching on `unique_key`. Updates existing rows and inserts new rows. Best for transactional updates with changing states.
- **`append`:** Executes `INSERT INTO`. Strictly appends new rows without deduplication. Fast and cheap; ideal for immutable event streams.
- **`insert_overwrite`:** Rewrites entire target partitions based on dynamic partition bounds. Eliminates row-by-row merge overhead; best for date-partitioned tables in Databricks and BigQuery.

---

### Q3: How does dbt implement SCD Type 2 tracking using Snapshots? Compare `check` vs `timestamp` strategy.

**Difficulty:** `HARD` | **Niche:** `dbt Snapshots & SCD2`

**Direct 30-Second Answer:**
dbt Snapshots track dimensional changes over time by automatically adding `dbt_valid_from`, `dbt_valid_to`, and `dbt_scd_id` columns:
- **`timestamp` Strategy (Preferred):** Compares an `updated_at` column in the source. If `updated_at` is greater than the snapshot's valid_from, dbt expires the old row and inserts the new version.
- **`check` Strategy:** Used when the source lacks an updated timestamp. dbt computes a hash across a list of specified columns (e.g. `check_cols = ['address', 'tier']`) to detect attribute divergence.

---

### Q4: Describe the standard 3-layer dbt modeling architecture: Staging, Intermediate, and Marts.

**Difficulty:** `MEDIUM` | **Niche:** `Dimensional Modeling Structure`

**3-Layer Architecture:**
1. **Staging (`stg_`):** 1-to-1 mapping with raw source tables. Cleans column names, casts data types, and normalizes values. Materialized as Views.
2. **Intermediate (`int_`):** Encapsulates complex business logic, multi-table joins, and early aggregations. Materialized as Ephemeral or Tables.
3. **Marts (`fct_`, `dim_`):** Business-facing presentation layer organized into Kimball dimensional star schemas. Materialized as Tables or Incremental models.

---

### Q5: Compare Generic Tests vs Singular Tests in dbt, and write custom generic test logic.

**Difficulty:** `MEDIUM` | **Niche:** `Data Quality & Testing`

**Comparison:**
- **Generic Tests:** Parametric test macros defined in YAML files (`unique`, `not_null`, `accepted_values`, `relationships`).
- **Singular Tests:** Standalone `.sql` queries located in the `tests/` directory that must return zero rows for the test to pass.
**Custom Generic Test (Macro):**
```sql
{% test is_positive(model, column_name) %}
SELECT * FROM {{ model }} WHERE {{ column_name }} <= 0
{% endtest %}
```

---

### Q6: How do Jinja macros in dbt establish DRY (Don't Repeat Yourself) SQL transformations?

**Difficulty:** `MEDIUM` | **Niche:** `Jinja Macros & Modularity`

**Direct 30-Second Answer:**
Macros are reusable Jinja functions that dynamically generate SQL. Instead of writing duplicate `CASE` statements across 20 models, encapsulate the logic in a macro:
```sql
{% macro cents_to_dollars(column_name, decimal_places=2) %}
    ROUND(CAST({{ column_name }} AS NUMERIC) / 100, {{ decimal_places }})
{% endmacro %}

-- In dbt model:
SELECT order_id, {{ cents_to_dollars('order_total_cents') }} AS order_total FROM {{ ref('stg_orders') }}
```

---

### Q7: What is the dbt Semantic Layer, and how does it prevent disparate business metric definitions across BI tools?

**Difficulty:** `HARD` | **Niche:** `Semantic Layer & Metrics`

**Direct 30-Second Answer:**
The dbt Semantic Layer defines business metrics (e.g. `monthly_recurring_revenue`, `churn_rate`) centrally in code alongside the underlying data models.
- Downstream BI tools (Tableau, Power BI, Hex) query the MetricFlow API rather than authoring divergent SQL aggregations.
- Guarantees that Revenue means the exact same number regardless of which dashboard or tool visualizes the data.

---

### Q8: How does dbt manage environment targets (`dev`, `prod`) to prevent accidental production overwrites?

**Difficulty:** `MEDIUM` | **Niche:** `Environment Isolation`

**Direct 30-Second Answer:**
dbt uses `profiles.yml` with distinct target configurations. In `dev`, dbt uses custom schema prefixes (e.g. `dbt_sjammi_marts`) so developers build models inside isolated developer sandboxes. In `prod`, CI/CD pipelines run with `--target prod`, deploying directly to governed enterprise schemas.

---

### Q9: How do you optimize dbt model execution performance when running on Databricks Lakehouse?

**Difficulty:** `HARD` | **Niche:** `Performance Tuning on Lakehouse`

**Optimization Strategies:**
1. Configure **Liquid Clustering** in model YAML: `config(materialized='incremental', incremental_strategy='merge', clustered_by=['customer_id', 'order_date'])`.
2. Filter incremental runs using `is_incremental()` macro to scan only updated partitions:
```sql
{% if is_incremental() %}
  WHERE updated_at > (SELECT MAX(updated_at) FROM {{ this }})
{% endif %}
```
3. Enable Deletion Vectors in target table properties.

---

### Q10: What is dbt Mesh, and how does it facilitate cross-project data contracts in large enterprises?

**Difficulty:** `ARCHITECT` | **Niche:** `dbt Mesh & Governance`

**Direct 30-Second Answer:**
dbt Mesh splits monolithic enterprise dbt projects into autonomous, domain-specific projects (e.g. Marketing dbt project, Finance dbt project):
- **Cross-Project `ref()`:** Allows Project B to reference models in Project A.
- **Data Contracts & Model Access:** Public models enforce strict schema contracts (`contract: {enforced: true}`). If upstream developers alter a contracted column, the dbt build fails, preventing downstream breaking changes.

---
