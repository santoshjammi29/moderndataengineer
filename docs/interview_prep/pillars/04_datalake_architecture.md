# Pillar 04: Data Lake Architecture & Object Storage
**Category:** `DATALAKE ARCHITECTURE` | **Domain:** `Cloud Storage & Data Lake Infrastructure`

---

### Q1: How do modern cloud object storage consistency models (S3, ADLS Gen2, GCS) affect data lake engineering?

**Difficulty:** `HARD` | **Niche:** `Consistency Models`

**Direct 30-Second Answer:**
Both AWS S3 (since Dec 2020) and Azure ADLS Gen2 provide **strong read-after-write consistency** for all `PUT` and `DELETE` requests of objects.
- **Impact:** Eliminates the need for external consistency tools (like S3Guard/DynamoDB). Once a Spark executor writes a Parquet file to S3, a subsequent `LIST` or `GET` from any other node is guaranteed to observe the latest data.
- **Gotcha:** Hierarchical directory operations in S3 are still simulated object-key prefixes. In contrast, ADLS Gen2 implements a true POSIX-compliant **hierarchical namespace (HNS)**, allowing atomic directory renames and deletes ($O(1)$ operations instead of copying millions of objects).

---

### Q2: Explain Amazon S3 prefix request rate limits and how you architect high-concurrency data lake ingestion to avoid HTTP 503 Slow Down errors.

**Difficulty:** `HARD` | **Niche:** `Object Storage Request Limits`

**Direct 30-Second Answer:**
Amazon S3 throttles requests per partition prefix at **3,500 PUT/POST/DELETE** and **5,500 GET/HEAD requests per second**.
- **The Bottleneck:** Writing 5,000 files concurrently to a single date folder (`s3://lake/orders/2026-11-18/`) will exhaust prefix limits and trigger HTTP 503 Slow Down.
- **Architectural Solution:** Distribute writes across multiple unique prefixes using hash pre-pending (e.g. `s3://lake/orders/<hash_prefix>/2026-11-18/`) or leverage Delta Lake / Iceberg, where metadata files isolate writes while underlying Parquet files can be distributed across multi-prefix namespaces automatically.

---

### Q3: Compare the Azure Blob File System (ABFS) driver with the Hadoop S3A connector for Spark data access.

**Difficulty:** `HARD` | **Niche:** `Cloud Storage Connectors`

**Comparison:**
- **ABFS (`abfss://`):** Azure's purpose-built cloud storage driver optimized for ADLS Gen2 hierarchical namespace. Implements atomic file operations, server-side directory renames, multi-threaded read-ahead caching, and native OAuth 2.0 Azure Managed Identity integration.
- **S3A (`s3a://`):** Open-source Apache Hadoop connector for AWS S3. Uses multipart upload commits (Magic Committer / S3A Committer) to simulate atomic job directory commitments on top of S3's non-hierarchical object model.

---

### Q4: How do you architect an Active-Passive Disaster Recovery (DR) lakehouse with RPO < 15 minutes and RTO < 1 hour?

**Difficulty:** `ARCHITECT` | **Niche:** `Disaster Recovery & Business Continuity`

**Production DR Architecture:**
1. **Underlying Storage Replication:** Configure asynchronous cloud object replication (e.g. Azure GRS / AWS S3 Cross-Region Replication - CRR) replicating raw and Delta tables from Primary to Secondary region ($< 15\text{ min}$ RPO).
2. **Metastore Sync:** Replicate Unity Catalog / AWS Glue Data Catalog metadata using automated infrastructure-as-code or catalog sync jobs.
3. **Compute Failover:** Maintain a warm standby compute cluster definition in the DR region (or Databricks Serverless pool) deployed via Terraform / DABs.
4. **DNS Cutover:** Route BI and pipeline triggers to the secondary region using Traffic Manager / Route 53 health-check failover.

---

### Q5: Design a zero-trust security perimeter for an enterprise data lake on cloud object storage.

**Difficulty:** `ARCHITECT` | **Niche:** `Zero-Trust Data Lake Security`

**Security Perimeter Blueprint:**
1. **Network Isolation:** Disable public internet endpoints. All access routed through **Private Endpoints (VNet / VPC)** and private DNS zones.
2. **Identity & Access Management:** Eliminate long-lived access keys and connection strings; authenticate exclusively via **Managed Identities** or IAM Roles with short-lived STS tokens.
3. **Encryption:** Enforce Customer-Managed Encryption Keys (CMEK) via Key Vault / AWS KMS with automated key rotation. Enforce TLS 1.3 for data in transit.
4. **Data Governance & Masking:** Use Unity Catalog or AWS Lake Formation for centralized column masking, row-level security, and access audits.

---

### Q6: Why is the small file problem lethal to cloud object stores, and how do you design an automated compaction service?

**Difficulty:** `MEDIUM` | **Niche:** `Storage Compaction & Maintenance`

**Direct 30-Second Answer:**
Millions of small files ($< 10\text{MB}$) explode cloud storage metadata costs (billing per 1,000 HTTP GET/LIST operations) and cripple query planning because Spark must scan thousands of file footers.
**Automated Compaction Service:**
Run a daily daemon job that queries table metadata, identifies partitions with file counts $> 100$ and average size $< 64\text{MB}$, and executes bin-packing:
```sql
OPTIMIZE target_table WHERE partition_date = CURRENT_DATE() - INTERVAL 1 DAY;
```

---

### Q7: What is Metadata Catalog Federation, and how does it enable querying across disparate clouds and data warehouses?

**Difficulty:** `HARD` | **Niche:** `Catalog Federation`

**Direct 30-Second Answer:**
Catalog Federation allows a central query engine to query external catalogs (e.g. Unity Catalog querying Snowflake, AWS Glue, Google BigQuery, or Salesforce) without moving physical data into the lakehouse.
- The engine acts as a federated coordinator, pushing predicates and projections down to the remote database engine.
- Ideal for hybrid architectures where operational CRM databases must be joined with lakehouse telemetry.

---

### Q8: How do you implement storage lifecycle tiering policies for a 5 PB data lake to reduce storage costs by 60%?

**Difficulty:** `HARD` | **Niche:** `Storage FinOps`

**Storage Tiering Architecture:**
1. **Hot Tier (Standard S3 / ADLS Hot):** Retain data for 0 to 30 days. High query frequency.
2. **Cool Tier (Infrequent Access - IA):** Transition data aged 31 to 90 days. 50% cheaper storage; slight retrieval cost per GB.
3. **Archive Tier (Glacier Instant Retrieval / ADLS Cold):** Transition data aged 91 to 365 days. 70% cheaper storage.
4. **Deep Archive / Expiration:** Move audit logs to Glacier Deep Archive after 1 year; delete temporary staging/scratch folders after 7 days.

---

### Q9: Describe the 3 most dangerous data lake partitioning anti-patterns and their remediation.

**Difficulty:** `MEDIUM` | **Niche:** `Partitioning Anti-patterns`

**3 Dangerous Anti-patterns:**
1. **Over-Partitioning by High-Cardinality Keys:** Partitioning by `user_id` or `timestamp` creates millions of directories containing 1-row files, causing metastore exhaustion. *Fix:* Partition only by coarse date (`year/month`) or use Liquid Clustering.
2. **Uneven Partition Skew:** Partitioning by `country` where 90% of data is in 'US'. *Fix:* Cluster or bucket within the US partition.
3. **Changing Partition Keys Mid-Lifecycle:** Requires rewriting historical data folders. *Fix:* Adopt Apache Iceberg Hidden Partitioning or Delta Liquid Clustering.

---

### Q10: What are the trade-offs of POSIX-compliant file systems vs cloud object storage for big data analytics?

**Difficulty:** `HARD` | **Niche:** `File Systems vs Object Stores`

**Comparison:**
- **POSIX File Systems (HDFS, Lustre, NFS):** Supports byte-range random writes, atomic directory renames, and low-latency file system locks. However, tightly couples compute with storage, is expensive to scale to petabytes, and requires dedicated operational management.
- **Cloud Object Storage (S3, ADLS Gen2, GCS):** Infinite elasticity, 99.999999999% durability, and virtually zero operational maintenance. However, objects are immutable (no in-place random writes), directory renames in S3 are simulated through copy-and-delete, and HTTP network roundtrips require large batch reads.

---
