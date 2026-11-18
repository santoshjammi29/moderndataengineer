# Pillar 14: Enterprise System Design at Scale
**Category:** `SYSTEM DESIGN` | **Domain:** `Enterprise Architecture & System Design`

---

### Q1: Design a multi-tenant enterprise lakehouse supporting 100 business units with strict tenant data isolation and cost chargeback.

**Difficulty:** `ARCHITECT` | **Niche:** `Multi-Tenant Architecture`

**System Design Architecture:**
1. **Storage Isolation:** Dedicated ADLS Gen2 storage container per business unit, encrypted with tenant-specific Customer-Managed Keys (CMEK).
2. **Catalog Governance:** Use Unity Catalog / Lake Formation with workspace isolation: `tenant_id.schema.table`. Enforce attribute-based access control (ABAC).
3. **Compute Isolation & Chargeback:** Dedicated serverless compute endpoints tagged with `CostCenter = Tenant_ID`. Databricks System Tables (`system.billing.usage`) automatically bill compute and storage consumption back to individual business unit cost centers.
4. **No Cross-Tenant Leaks:** Private Endpoints isolate network transit; cross-tenant joins blocked unless explicitly authorized via governed Delta Sharing.

---

### Q2: Architect an end-to-end real-time fraud detection engine evaluating 50,000 transactions/sec with < 20ms p99 latency.

**Difficulty:** `ARCHITECT` | **Niche:** `Real-Time System Design`

**Architecture Flow:**
1. **Ingest Tier:** Edge Payment Gateway writes to Apache Kafka (partitioned by `account_id`, 64 partitions).
2. **Processing Tier:** Apache Flink / Spark Structured Streaming consumes events with RocksDB state stores.
3. **Feature Enrichment:** Asynchronously enriches the event from an in-memory **Redis / DragonFly feature store** (sub-2ms lookup for 90-day avg spend, velocity counter).
4. **Inference:** Evaluates light ONNX gradient-boosted decision trees embedded in-process on the stream worker (sub-5ms inference).
5. **Egress:** If score $> 0.85$, publishes to `payments.blocked` and writes audit trail to Delta Lake.

---

### Q3: Design a zero-downtime, dual-run cross-cloud migration strategy moving 10 PB of data from on-premises Teradata/Hadoop to a Cloud Lakehouse.

**Difficulty:** `ARCHITECT` | **Niche:** `Migration & Cutover`

**Dual-Run Migration Blueprint:**
1. **Phase 1 (Historical Hydration):** Bulk transfer historical data using offline transfer appliances (AWS Snowball / Azure Data Box) into cloud object storage in Delta Lake format.
2. **Phase 2 (Dual Ingestion):** Divert upstream message queues (Kafka) to produce in parallel to both on-premises Hadoop and cloud Lakehouse.
3. **Phase 3 (Automated Parity Verification):** Run daily automated reconciliation scripts comparing row counts, checksum hashes, and financial metric aggregates between on-prem and cloud.
4. **Phase 4 (Controlled Wave Cutover):** Migrate downstream analytical users and BI dashboards domain-by-domain. Once parity is confirmed for 30 consecutive days, decommission legacy clusters.

---

### Q4: Design a high-throughput IoT telemetry ingestion platform handling 5 million sensor events per second with tiered retention.

**Difficulty:** `ARCHITECT` | **Niche:** `High-Throughput Ingestion`

**Architecture Blueprint:**
1. **Edge Tier:** IoT devices publish compressed Protobuf payloads over MQTT to cloud IoT Hub / Kinesis Streams with auto-partitioning.
2. **Ingest Engine:** Stateless streaming consumers batch raw streams into 5-minute micro-batches landing in S3 / ADLS Bronze.
3. **Tiered Storage:**
   - *Raw Streaming (0-7 Days):* Fast queryable Delta Bronze.
   - *Aggregated Metrics (0-2 Years):* 1-minute and 1-hour downsampled summary tables in Delta Gold for operational dashboards.
   - *Cold Archive (2+ Years):* Raw Bronze transitioned to S3 Glacier Deep Archive via automated lifecycle policies.

---

### Q5: Architect a Disaster Recovery (DR) data platform achieving RPO < 5 minutes and RTO < 30 minutes in the event of an entire cloud region failure.

**Difficulty:** `ARCHITECT` | **Niche:** `Disaster Recovery`

**Active-Passive Warm Standby Blueprint:**
1. **Data Replication:** Continuous cross-region object replication (CRR) with $< 5\text{ min}$ replication lag.
2. **Metastore Synchronization:** Continuous automated replication of Unity Catalog / Glue Data Catalog definitions to the DR region.
3. **Compute Automation:** Warm standby Databricks Serverless pool or pre-configured Terraform / DABs definitions in the secondary region.
4. **Automated Health-Check Failover:** Automated Route 53 / Traffic Manager DNS failover switches ingestion webhooks and client endpoints to the secondary region within 10 minutes of primary outage confirmation.

---

### Q6: Design an automated Cloud FinOps framework for a data engineering organization spending $500,000/month.

**Difficulty:** `ARCHITECT` | **Niche:** `Cloud FinOps`

**FinOps Governance Framework:**
1. **Tagging Policy Enforcement:** Block creation of any cluster, bucket, or pipeline lacking mandatory tags (`CostCenter`, `Owner`, `Environment`).
2. **Aggressive Auto-Termination:** Enforce maximum 15-minute idle timeout on all interactive clusters; convert all scheduled pipelines to automated Job clusters (saving ~50%).
3. **Worker Spot Fleet Orchestration:** Run 80% of batch ETL worker nodes on Spot VM instances with on-demand fallback.
4. **Budget Anomaly Detection:** Configure automated Azure Cost Management / AWS Budgets alerts triggering automated cluster suspension when a workspace exceeds 110% of monthly budget.

---

### Q7: Explain Data Mesh architecture: Domain Ownership, Data as a Product, Self-Serve Platform, and Federated Governance.

**Difficulty:** `ARCHITECT` | **Niche:** `Data Mesh Principles`

**4 Data Mesh Pillars:**
1. **Domain-Oriented Ownership:** Decentralizes data engineering. Business domains (e.g. Checkout, Logistics, Marketing) own their operational and analytical data pipelines end-to-end.
2. **Data as a Product:** Datasets are packaged as first-class products with discoverable metadata, explicit SLAs, data contracts, and versioned APIs.
3. **Self-Serve Data Platform:** Central platform engineering team provides automated tooling (infrastructure templates, CI/CD, compute provisioners) so domain teams build pipelines autonomously.
4. **Federated Computational Governance:** Global policies (security, compliance, PII masking) enforced programmatically across all domains via Unity Catalog / Lake Formation.

---

### Q8: Design an automated Data Observability framework tracking Freshness, Volume, Schema, Distribution, and Lineage.

**Difficulty:** `HARD` | **Niche:** `Data Observability`

**5 Pillars of Data Observability:**
1. **Freshness:** Monitors the time since last table update against expected SLA (e.g. alert if `max(ingestion_time) > current_time - 30 mins`).
2. **Volume:** Detects unexpected volume drops or surges (e.g. $\pm 30\%$ deviation from 7-day rolling average) indicating upstream producer failure.
3. **Schema:** Detects dropped columns, unexpected type conversions, or altered nullability.
4. **Distribution:** Tracks statistical drift (null percentages, min/max bounds, distribution histograms) using automated Great Expectations or Monte Carlo.
5. **Lineage:** Automatically traces downstream dashboard and report impact when an upstream data pipeline fails.

---

### Q9: Design a Zero-Trust security architecture for an enterprise lakehouse processing HIPAA and PCI-DSS data.

**Difficulty:** `ARCHITECT` | **Niche:** `Zero-Trust Architecture`

**Zero-Trust Security Controls:**
1. **Private Networking:** Disallow public internet ingress. Deploy compute within private VNet/VPC subnets accessing storage via Private Endpoints.
2. **Token-Based Authentication:** Identity propagation using Microsoft Entra ID / AWS IAM with multi-factor authentication; no static API keys or passwords.
3. **Dynamic Cryptographic Masking:** Encrypt data at rest using double encryption (cloud provider key + Customer-Managed Key). Mask card numbers and patient IDs on-the-fly using Unity Catalog column masks.
4. **Continuous Immutable Audit:** Every query, table read, and privilege modification logged to an immutable security audit trail (`system.access.audit`).

---

### Q10: Design an automated, blameless Incident Response & Disaster Recovery runbook for a critical enterprise data pipeline failure.

**Difficulty:** `HARD` | **Niche:** `Incident Response Runbook`

**4-Phase Incident Response Framework:**
1. **Alert & Assess (0-10m):** PagerDuty alert triggers on pipeline failure. Automated status page update notifies downstream stakeholders.
2. **Containment & Rollback (10-25m):** Pause broken pipeline; leverage Delta Lake Time Travel (`RESTORE TABLE ... TO VERSION AS OF`) to roll back corrupted downstream tables to the last healthy snapshot.
3. **Remediate & Idempotent Replay (25-45m):** Deploy hotfix to feature branch, run automated CI tests, and trigger idempotent replay (`MERGE INTO`) without generating duplicate records.
4. **Blameless Post-Mortem (48h):** Publish RCA document analyzing timeline, root cause, detection gap, and automated action items to eliminate single points of failure.

---
