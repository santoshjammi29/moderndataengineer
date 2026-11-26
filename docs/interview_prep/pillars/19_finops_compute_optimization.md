> 🧭 **Modern Data Engineering Ecosystem Navigation**
> - 📘 **Architecture & Concept:** [Data System Design — Lakehouse Architecture](https://github.com/santoshjammi29/data-system-design-handbook/tree/main/modules/01_lakehouse_and_medallion_architecture)
> - 💻 **Hands-On Recipe:** [Databricks Handbook — 105 Production Recipes](https://github.com/santoshjammi29/databricks-handbook)
> - 🔬 **Empirical Lab:** [Spark Experiments — Empirical Laboratory](https://github.com/santoshjammi29/spark-experiments)
> - 🚨 **Incident Runbook:** [PySpark Performance & Triage Runbooks](https://github.com/santoshjammi29/pyspark-handbook/tree/main/runbooks)
> - 🎯 **Interview Defense:** [Interview Handbook Master Guide](https://github.com/santoshjammi29/data-engineering-interview-handbook/blob/main/pillars/all_20_pillars_master_guide.md) *(You are here)*
> - 🌐 **Interactive Web Practice:** [Practice on moderndataengineer.uk](https://moderndataengineer.uk/practice)

# Pillar 19: Enterprise FinOps, Compute Governance & Cost Engineering
**Category:** `FINOPS & COST OPTIMIZATION` | **Domain:** `Enterprise FinOps & Cost Engineering`

---

### Q1: What is the complete checklist for reducing Databricks DBU spend by 30-50% in an enterprise deployment?

**Difficulty:** `HARD` | **Niche:** `Databricks DBU Cost Optimization`

1. **Job Clusters Over All-Purpose:** Production workloads must use Automated Job Clusters (50% cheaper DBUs than interactive clusters).
2. **Aggressive Auto-Termination:** 10-15 minute timeout on all interactive developer clusters.
3. **Instance Selection:** Switch from general-purpose VMs to modern Graviton/ARM or AMD EPYC instances (20% better price-performance).
4. **Spot Instances:** Configure 70% Spot worker nodes with automated on-demand driver/fallback.
5. **Serverless SQL Warehouses:** Enable auto-stop (1 minute timeout) and autoscaling pools.
6. **Photon Gating:** Audit Photon spend using System Tables; disable on jobs where I/O is not the bottleneck.

---

### Q2: Under what utilization patterns does Serverless compute become significantly MORE expensive than Classic compute?

**Difficulty:** `HARD` | **Niche:** `Serverless vs Classic Compute Cost Curves`

**Cost Curves:**
- **Serverless is Cheaper for:** Bursty, intermittent, or unpredictable workloads. Because serverless scales to 0 instantly and has zero startup time, you pay 0 during idle hours.
- **Classic Compute is Cheaper for:** **24/7 Continuous Steady-State Workloads** (e.g. uninterrupted streaming jobs running 24 hours/day). Serverless carries a premium DBU rate per core-hour. For continuous 100% utilization, provisioning reserved cloud VM instances (3-year RI or Savings Plans) combined with classic compute reduces total cost by up to 55% compared to Serverless.

---

### Q3: How do you evaluate whether Databricks Photon delivers a positive Return on Investment (ROI) for a specific workload?

**Difficulty:** `HARD` | **Niche:** `Photon ROI Evaluation Framework`

Photon incurs a **$2\times$ DBU multiplier** on cluster compute.
**Positive ROI Equation:**
$$\text{Speedup Factor} > 2.0$$
If Photon makes a job run $3\times$ faster, runtime drops by $66\%$. Even with double the DBU rate, total DBUs consumed drop by $33\%$ (Net Savings).
**When Photon Wins:** Heavy SQL queries, large joins, complex aggregations, writing Parquet/Delta.
**When Photon Loses:** Workloads dominated by non-vectorized Python UDFs, third-party REST API calls, or tiny datasets.

---

### Q4: How do incomplete multipart uploads and excessive list operations drive up cloud storage bills on S3/ADLS?

**Difficulty:** `MEDIUM` | **Niche:** `Object Storage Cost Engineering`

1. **Incomplete Multipart Uploads:** When a Spark job fails midway, staged multi-gigabyte upload parts remain hidden in S3 storage forever. Configure an S3 lifecycle rule to **Abort Incomplete Multipart Uploads after 7 days** (often reclaims 10-30% of total S3 storage cost).
2. **LIST / GET Request Costs:** Repeatedly running `listStatus` on partitioned directories with millions of small files incurs thousands of dollars in S3 API fees. Adopting Delta Lake or Iceberg consolidates file listing into transaction log metadata reads.

---

### Q5: Compare Google BigQuery On-Demand pricing ($6.25/TB scanned) vs Capacity-Based Slot Commitments.

**Difficulty:** `HARD` | **Niche:** `BigQuery Slots vs On-Demand Pricing`

**1. On-Demand Pricing:** Billed strictly on bytes scanned ($6.25 per TB). Ideal for low-frequency queries and predictable small scans. Highly risky on un-partitioned 50TB tables where an accidental query costs $300+.
**2. Capacity Pricing (BigQuery Editions - Standard/Enterprise):** Billed on dedicated or autoscaling **Slots** per hour.
- Caps maximum spending and provides predictable budgeting.
- Features like BI Engine and dynamic slot allocation maximize utilization.
- *Crossover Point:* When organization scans $> 1.5\text{ PB/month}$, capacity slots deliver significant cost savings.

---

### Q6: What configuration parameters eliminate runaway credit consumption in Snowflake Virtual Warehouses?

**Difficulty:** `HARD` | **Niche:** `Snowflake Compute Optimization`

1. **AUTO_SUSPEND = 60:** Suspend warehouse after 60 seconds of inactivity (default is often 10 minutes).
2. **AUTO_RESUME = TRUE:** Resume instantly upon query arrival.
3. **STATEMENT_TIMEOUT_IN_SECONDS = 3600:** Kill runaway queries automatically after 1 hour.
4. **Multi-Cluster Scaling Policy:** Set to `ECONOMY` rather than `STANDARD` for batch reporting (queues queries briefly to avoid spinning up unnecessary compute clusters).
5. **Resource Monitors:** Enforce hard credit caps per department with automatic warehouse suspension at 100% quota.

---

### Q7: How does Tungsten shuffle disk spill directly inflate cloud virtual machine compute and storage bills?

**Difficulty:** `HARD` | **Niche:** `Shuffle Spill Financial Waste`

When a Spark job spills hundreds of gigabytes to disk, two financial penalties occur:
1. **Compute Runtime Inflation:** Spilling forces memory serialization, disk writes, disk reads, and decompression. A job that should take 15 minutes runs for 2 hours, burning 8x more DBU and VM hourly credits.
2. **Cloud EBS/Disk IOPS Costs:** Cloud providers charge for provisioned IOPS or throttle burst balances. When burst balance exhausts, task throughput drops by 90%, prolonging cluster runtime further.

---

### Q8: How do you architect a mission-critical ETL cluster using 80% Spot instances without risking SLA breaches?

**Difficulty:** `HARD` | **Niche:** `Spot Instance Fallback Strategies`

1. **Driver on On-Demand:** Never run the Spark Driver on a Spot instance; losing the driver terminates the entire application.
2. **Worker Fleet Diversification:** Configure worker pools across 5-8 different VM instance types and availability zones (e.g. `m5.2xlarge`, `m5a.2xlarge`, `r5.2xlarge`) to minimize the chance of simultaneous Spot reclamation.
3. **External Shuffle Service / Shuffle Tracking:** Enable `spark.dynamicAllocation.shuffleTracking.enabled = true` so when a Spot node is reclaimed, Spark re-fetches shuffle files from surviving nodes rather than failing the stage.

---

### Q9: How do you enforce automated tag propagation across cloud lakehouse assets for accurate chargebacks?

**Difficulty:** `MEDIUM` | **Niche:** `Tagging Governance & Chargebacks`

1. **Terraform / DABs Enforcement:** Mandate tags (`Department`, `Project`, `Environment`, `Owner`) on all cluster, storage, and catalog resources.
2. **Unity Catalog Catalog-Level Tags:** Inherit tags hierarchically from Catalog -> Schema -> Table.
3. **System Tables Billing Reconciliation:** Query `system.billing.usage` grouping by `custom_tags['Department']` to generate monthly departmental chargeback reports.
4. **Policy Enforcement:** Use Azure Policy / AWS Service Control Policies to reject creation of any compute cluster lacking mandatory cost center tags.

---

### Q10: How do you build a lightweight automated daemon to detect and terminate zombie developer clusters?

**Difficulty:** `MEDIUM` | **Niche:** `Idle Cluster Remediation Daemons`

Deploy a serverless AWS Lambda / Azure Function on a 15-minute cron:
1. Call Databricks Clusters API (`/api/2.0/clusters/list`).
2. For active clusters, query the latest command execution timestamps via Workspace API.
3. If a cluster has had 0 command activity for > 30 minutes and lacks an active override tag:
   - Send a notification to the owner on Slack.
   - Issue cluster termination API call (`/api/2.0/clusters/delete`).
Saves tens of thousands of dollars in abandoned developer compute.

---
