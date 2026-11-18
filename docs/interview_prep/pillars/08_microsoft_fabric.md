# Pillar 08: Microsoft Fabric & Unified Analytics
**Category:** `FABRIC` | **Domain:** `Unified SaaS Analytics & Microsoft Fabric`

---

### Q1: Explain OneLake architecture in Microsoft Fabric and the concept of 'OneDrive for Data'.

**Difficulty:** `HARD` | **Niche:** `OneLake Architecture`

**Direct 30-Second Answer:**
OneLake is a single, unified, logical data lake for the entire organization built on top of Azure Data Lake Storage Gen2 (ADLS Gen2):
- **Multi-Tenant Logical Store:** Every Microsoft Fabric tenant has exactly one OneLake, eliminating disparate storage silos across departments.
- **Open Format (Delta Lake):** All Fabric engines (Synapse Data Engineering, Synapse Data Warehouse, Real-Time Analytics, and Power BI) read and write to OneLake in open Delta-Parquet format.
- **Workspaces as Folders:** Fabric workspaces manifest as hierarchical folders inside OneLake, governed by unified Microsoft Entra ID permissions.

---

### Q2: What is Direct Lake mode in Power BI, and how does it outperform both Import mode and DirectQuery?

**Difficulty:** `HARD` | **Niche:** `Direct Lake Mode`

**Direct 30-Second Answer:**
- **Import Mode:** Loads data into Power BI's in-memory VertiPaq engine. Ultra-fast, but requires duplicate data storage and hours of scheduled batch refreshes.
- **DirectQuery:** Translates user clicks into live SQL queries sent to the database. Zero data duplication, but slow query latency on complex dashboards.
- **Direct Lake Mode (Fabric Standard):** The VertiPaq engine loads Delta-Parquet files directly from OneLake storage into memory on-demand **without executing SQL translation or importing duplicates**. Delivers the speed of Import mode with the real-time freshness of DirectQuery.

---

### Q3: How do OneLake Shortcuts eliminate data movement across ADLS Gen2, AWS S3, and Google Cloud Storage?

**Difficulty:** `HARD` | **Niche:** `OneLake Shortcuts`

**Direct 30-Second Answer:**
Shortcuts are embedded symbolic metadata links that point directly to data stored in external storage accounts (ADLS Gen2, Amazon S3, Google Cloud Storage, or Dataverse):
- **Zero ETL:** Data remains in the source cloud object store without copying or egress.
- **Unified Serving:** Fabric compute engines see the external bucket as a native local OneLake folder, querying Parquet/Delta files in place.

---

### Q4: Compare Fabric Lakehouse vs Fabric Warehouse: engines, transaction models, and developer personas.

**Difficulty:** `MEDIUM` | **Niche:** `Lakehouse vs Warehouse`

**Comparison:**
- **Fabric Lakehouse:** Spark-centric. Supports Python, Scala, R, and SQL. Code-first developer persona. Read/Write Delta Lake format with folder/table navigation.
- **Fabric Warehouse:** T-SQL enterprise engine. Supports ANSI SQL, full distributed cross-table transactions, primary/foreign key constraints, and dynamic data masking. Low-code / BI developer persona. Stores data natively in Delta-Parquet format.

---

### Q5: Explain Microsoft Fabric Capacity Smoothing and the 24-Hour Bursting algorithm for F-SKUs.

**Difficulty:** `HARD` | **Niche:** `Fabric FinOps & Capacity`

**Direct 30-Second Answer:**
Fabric capacities (e.g. F64 = 64 Capacity Units - CUs) support **Capacity Smoothing**:
- **Bursting:** A short, compute-intensive Spark job can temporarily burst up to $4\times$ the purchased capacity limit.
- **Smoothing (24-Hour Window):** The spike in CU consumption is automatically smoothed and averaged over a rolling 24-hour evaluation window, preventing throttling during peak morning ETL batches as long as off-peak consumption compensates.

---

### Q6: How does Fabric Real-Time Intelligence process streaming data using Eventstreams and KQL Databases?

**Difficulty:** `HARD` | **Niche:** `Real-Time Streaming & KQL`

**Direct 30-Second Answer:**
1. **Eventstreams:** Ingests live streaming events from Kafka, Event Hubs, or IoT Hubs with no-code data transformations and filtering.
2. **KQL Database (Kusto Engine):** Indexes streaming data automatically in memory using inverted indexes, enabling sub-second analytical queries across billions of log and telemetry records using Kusto Query Language (KQL).

---

### Q7: Compare Dataflows Gen2 in Fabric with traditional Azure Data Factory pipelines.

**Difficulty:** `MEDIUM` | **Niche:** `Dataflows Gen2`

**Comparison:**
- **Dataflows Gen2:** Powered by the Power Query M engine. Best for visual low-code ETL, rapid data profiling, and direct loading into OneLake Lakehouse/Warehouse staging.
- **ADF Pipelines:** Enterprise control flow orchestrator designed for scheduling, complex conditional logic, hybrid on-premises connectivity via SHIR, and calling external APIs and Databricks clusters.

---

### Q8: How is unified governance and sensitivity labeling enforced across OneLake using Microsoft Purview?

**Difficulty:** `HARD` | **Niche:** `Governance & Purview`

**Direct 30-Second Answer:**
Microsoft Purview integrates natively with Fabric OneLake:
- **Sensitivity Labels:** Applied at the OneLake item level (e.g. 'Highly Confidential'); automatically flow downstream to Power BI reports, encrypting exports and enforcing DLP (Data Loss Prevention) policies.
- **Automated Lineage:** Tracks data provenance end-to-end from source shortcuts to Lakehouse Delta tables, Warehouse models, and Power BI semantic models.

---

### Q9: Explain Git integration and Deployment Pipelines in Microsoft Fabric for enterprise ALM.

**Difficulty:** `MEDIUM` | **Niche:** `Application Lifecycle Management`

**Production ALM Workflow:**
1. Connect Fabric workspace to an Azure DevOps / GitHub Git repository.
2. Workspaces serialize assets (notebooks, reports, lakehouses) into source-controlled JSON/YAML files.
3. **Fabric Deployment Pipelines:** Facilitate moving content across **Development $ightarrow$ Test $ightarrow$ Production** workspaces with automated stage comparison and selective deployment.

---

### Q10: What is the recommended migration strategy from Azure Synapse Analytics to Microsoft Fabric?

**Difficulty:** `ARCHITECT` | **Niche:** `Cloud Migration Strategy`

**Migration Strategy:**
1. **Storage Link:** Create OneLake Shortcuts pointing to existing Synapse ADLS Gen2 storage accounts (immediate access with zero data migration).
2. **SQL Scripts:** Migrate Synapse Dedicated SQL Pool T-SQL scripts to Fabric Warehouse, updating non-supported syntax.
3. **Spark Notebooks:** Transfer PySpark notebooks to Fabric Spark workspaces; Fabric runs modern Spark 3.5 runtimes with out-of-the-box Delta Lake 3.x support.

---
