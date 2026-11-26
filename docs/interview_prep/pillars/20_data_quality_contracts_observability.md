> 🧭 **Modern Data Engineering Ecosystem Navigation**
> - 📘 **Architecture & Concept:** [Data System Design — Lakehouse Architecture](https://github.com/santoshjammi29/data-system-design-handbook/tree/main/modules/01_lakehouse_and_medallion_architecture)
> - 💻 **Hands-On Recipe:** [Databricks Handbook — 105 Production Recipes](https://github.com/santoshjammi29/databricks-handbook)
> - 🔬 **Empirical Lab:** [Spark Experiments — Empirical Laboratory](https://github.com/santoshjammi29/spark-experiments)
> - 🚨 **Incident Runbook:** [PySpark Performance & Triage Runbooks](https://github.com/santoshjammi29/pyspark-handbook/tree/main/runbooks)
> - 🎯 **Interview Defense:** [Interview Handbook Master Guide](https://github.com/santoshjammi29/data-engineering-interview-handbook/blob/main/pillars/all_20_pillars_master_guide.md) *(You are here)*
> - 🌐 **Interactive Web Practice:** [Practice on moderndataengineer.uk](https://moderndataengineer.uk/practice)

# Pillar 20: Data Quality, Contracts, Circuit Breakers & Observability
**Category:** `DATA QUALITY & OBSERVABILITY` | **Domain:** `Data Reliability & Quality Engineering`

---

### Q1: What is a Data Contract, and how do you implement declarative schema and semantic validation at producer boundaries?

**Difficulty:** `ARCHITECT` | **Niche:** `Data Contracts Architecture`

A **Data Contract** is an explicit, versioned agreement between software engineering producers (microservices) and data consumers specifying schema, SLA, semantics, and quality expectations.
```yaml
data_contract_specification: 0.9.3
id: payments-service-contract
schema:
  type: object
  properties:
    payment_id: { type: string, format: uuid }
    amount: { type: number, minimum: 0.01 }
    currency: { type: string, enum: [USD, EUR, GBP] }
quality_rules:
  - rule: freshness
    max_delay: 5m
  - rule: null_check
    column: payment_id
    threshold: 0%
```
**Enforcement:** Evaluated via CI/CD test gates on producer PRs and validated at ingestion boundaries (Kafka Schema Registry, PySpark contract evaluators) before records reach the Lakehouse.

---

### Q2: How does the Circuit Breaker pattern prevent corrupted streaming ingestion batches from contaminating downstream Gold marts?

**Difficulty:** `ARCHITECT` | **Niche:** `Circuit Breakers in Streaming`

1. **Closed State (Normal):** Data flows normally from Bronze to Silver to Gold.
2. **Validation Gate:** In `foreachBatch`, compute error metrics: `error_rate = corrupt_rows / total_rows`.
3. **Trip Condition (Open State):** If `error_rate > 5%` or if financial reconciliation fails, the circuit breaker **TRIPS OPEN**:
   - Micro-batch processing pauses or diverts incoming stream to a quarantine sink.
   - Automated PagerDuty alert fires.
   - Downstream Gold tables remain locked to prevent serving corrupt KPIs to dashboards.
4. **Half-Open Recovery:** Once upstream fixes the issue, pipeline processes a small canary batch; if successful, circuit resets to Closed.

---

### Q3: Detail the 5 pillars of enterprise Data Observability: Freshness, Distribution, Volume, Schema, and Lineage.

**Difficulty:** `HARD` | **Niche:** `The 5 Pillars of Data Observability`

1. **Freshness:** Is data updating within agreed SLAs? (Tracks `MAX(ingestion_time)` vs `current_timestamp()`).
2. **Distribution:** Are statistical values healthy? (Monitors mean, median, null rate, and standard deviation shifts).
3. **Volume:** Did an unexpected row drop occur? (Detects anomalous spikes or drops in daily ingested row counts).
4. **Schema:** Has a field been renamed, dropped, or changed type? (Tracks transaction log schema evolution).
5. **Lineage:** When an anomaly occurs, what downstream dashboards are broken, and which upstream service caused it?

---

### Q4: How do you implement automated volume and distribution anomaly detection using Interquartile Range (IQR) in PySpark?

**Difficulty:** `HARD` | **Niche:** `Statistical Anomaly Detection (IQR / Z-Score)`

```python
# Calculate Q1, Q3 and IQR over 30-day historical table row counts
quantiles = history_df.approxQuantile("row_count", [0.25, 0.75], 0.01)
q1, q3 = quantiles[0], quantiles[1]
iqr = q3 - q1
lower_bound = q1 - 1.5 * iqr
upper_bound = q3 + 1.5 * iqr

today_count = today_df.count()
if today_count < lower_bound or today_count > upper_bound:
    raise DataQualityAlert(f"ANOMALY DETECTED: Ingested {today_count} rows. Expected [{lower_bound}, {upper_bound}]")
```
Adapts dynamically to seasonal trends without hardcoding fragile static threshold numbers.

---

### Q5: Compare Great Expectations vs Soda Core vs dbt Tests for enterprise data quality validation.

**Difficulty:** `MEDIUM` | **Niche:** `Great Expectations vs Soda vs dbt Tests`

**1. dbt Tests:** Native to the transformation layer. Fast, SQL-based, zero extra infrastructure. Best for in-warehouse relational testing.
**2. Soda Core:** Lightweight, human-readable YAML assertions (`checks.yml`). Fast CLI execution, easily integrated into CI/CD pipelines, Airflow, and Spark.
**3. Great Expectations (GX):** Heavyweight, highly customizable Python framework. Generates rich HTML 'Data Docs', supports custom Python expectation suites, profile profiling, and complex multi-source validation.

---

### Q6: How do Schema Validation Gateways reject breaking API payloads before they enter event streaming brokers?

**Difficulty:** `HARD` | **Niche:** `Schema Validation Gateways`

Deploy an API Gateway (Kong / Envoy) or Kafka Schema Registry enforcing JSON Schema or Protobuf validation.
- **Compatibility Modes:** Configure `FULL_TRANSITIVE` or `BACKWARD_TRANSITIVE` compatibility in Schema Registry.
- Producers attempting to publish events missing required fields receive HTTP 422 Unprocessable Entity or Kafka `SerializationException`.
- Prevents malformed records from ever reaching Kafka, eliminating poison pills at the perimeter.

---

### Q7: How do you build an automated reconciliation engine that verifies zero data loss between source OLTP databases and the Lakehouse?

**Difficulty:** `ARCHITECT` | **Niche:** `Automated Reconciliation & Replay`

1. **Cryptographic Checksumming:** Nightly job computes incremental row count and hash checksums over immutable primary key ranges in Postgres/MySQL: `SELECT COUNT(*), SUM(hashtext(id || updated_at)) FROM orders WHERE date = yesterday`.
2. **Lakehouse Mirror Check:** Compute the identical aggregation in Spark/Delta over the mirrored silver table.
3. **Diff Verification:** If row counts or checksums mismatch, an automated replay DAG triggers an incremental backfill targeting only the specific mismatched primary key range.

---

### Q8: How do you monitor end-to-end data pipeline freshness SLAs across hybrid multi-cloud pipelines?

**Difficulty:** `MEDIUM` | **Niche:** `Data Freshness SLA Monitoring`

```sql
-- Monitor freshness lag in Delta Lake tables
SELECT
  table_name,
  max_event_timestamp,
  current_timestamp() AS check_time,
  TIMESTAMPDIFF(MINUTE, max_event_timestamp, current_timestamp()) AS latency_minutes,
  CASE
    WHEN TIMESTAMPDIFF(MINUTE, max_event_timestamp, current_timestamp()) > 30 THEN 'SLA_BREACH'
    ELSE 'HEALTHY'
  END AS sla_status
FROM (
  SELECT 'silver_orders' AS table_name, MAX(order_timestamp) AS max_event_timestamp FROM silver.orders
);
```
Expose metrics via Prometheus/Grafana or Databricks Lakehouse Monitoring to alert on breaches before downstream BI users notice.

---

### Q9: When should you use Delta Lake CHECK constraints vs a Rescued Data Quarantine pattern?

**Difficulty:** `HARD` | **Niche:** `Delta Constraints vs Rescued Data`

**Use Delta CHECK Constraints:** On Gold/Reporting tables where strict transactional integrity is non-negotiable (`CHECK (balance >= 0)`). Any violation aborts the transaction immediately to prevent corrupt reports.
**Use Rescued Data Quarantine:** On Bronze/Silver ingestion pipelines where external client traffic contains unpredictable errors. Aborting ingestion halts the entire pipeline; quarantining diverts corrupt rows to an audit table while continuing processing for valid data.

---

### Q10: What is the 5-step Root Cause Analysis (RCA) runbook when a silent data corruption bug is discovered 3 weeks after deployment?

**Difficulty:** `ARCHITECT` | **Niche:** `Silent Data Corruption RCA Runbook`

1. **Triage & Containment (Hour 0-2):** Freeze automated write pipelines to the corrupted table. Identify the exact commit version where the bug was introduced using Delta Lake Time Travel / CDF.
2. **Blast Radius Analysis (Hour 2-6):** Trace downstream data lineage to catalog every derived table, BI dashboard, and external export affected by the corrupted data.
3. **Rollback & Hotfix (Hour 6-12):** Deploy code fix to prevent ongoing corruption. Restore clean historical baseline using `RESTORE TABLE ... TO TIMESTAMP AS OF` or branch isolation.
4. **Historical Backfill (Hour 12-24):** Re-run transformation logic over historical raw Bronze logs to re-materialize clean Silver and Gold datasets.
5. **Post-Mortem & Prevention:** Author automated regression test (dbt singular test / Soda check) to ensure identical edge-case data patterns trigger automated circuit-breaker halts in the future.

---
