import json
import os

FILE = 'src/data/json/data_architecture.json'

with open(FILE, encoding='utf-8') as f:
    data = json.load(f)

before_count = len(data)
existing_ids = {item['id'] for item in data}
print(f"Existing scenarios count in {FILE}: {before_count}")

new_scenarios = [
    {
        "id": "arch-mpp-synapse-500m-distribution",
        "source": "Enterprise Cloud Data Warehouse Architecture",
        "category": "Cloud Data Warehousing & MPP",
        "niche": "Azure Synapse Distribution Topology",
        "difficulty": "ARCHITECT",
        "question": "How do you architect table distribution and indexing in an Azure Synapse Dedicated SQL Pool for an enterprise retail platform processing 500 million daily sales transactions, 2 million active customers, and a 10,000-row store dimension?",
        "answer": "Architectural Blueprint:\n\n1. Fact Table Architecture (fact.Sales):\n- Distribution Strategy: HASH(customer_id). Slices the 500M daily rows across the 60 distributions (~8.3M rows per distribution slice). Customer ID has high cardinality (2M unique values) and near-zero NULLs, ensuring even hash distribution without compute skew.\n- Index Type: CLUSTERED COLUMNSTORE INDEX (CCI). Achieves up to 10x columnar compression. Partition by OrderDate (daily or monthly depending on query patterns) to enable partition elimination.\n- Colocated Join Guarantee: Downstream joins against customer-level dimensions on customer_id execute locally within each compute slice without Data Movement Service (DMS) network shuffle.\n\n2. Medium Dimension Table (dim.Customer - 2M rows, ~350 MB):\n- Distribution Strategy: HASH(customer_id) on the identical surrogate key, or REPLICATE if under 2 GB.\n- Index Type: CLUSTERED INDEX (B-tree) on customer_id.\n\n3. Small Dimension Table (dim.Store - 10,000 rows, ~5 MB):\n- Distribution Strategy: REPLICATE. Synapse maintains a full local copy of the store table on every compute node, completely eliminating DMS broadcast data movement during joins with fact.Sales.\n\n4. Staging Ingestion Layer (stage.Sales_Load):\n- Distribution Strategy: ROUND_ROBIN on HEAP storage. Ensures incoming bulk streams from ADF / COPY INTO load at maximum theoretical storage write throughput without hash calculation overhead."
    },
    {
        "id": "arch-eventual-consistency-payment-state",
        "source": "Distributed Transaction Systems",
        "category": "Distributed Systems & Concurrency",
        "niche": "Transactional State Machines",
        "difficulty": "ARCHITECT",
        "question": "In a high-throughput ride-sharing platform, payment authorization holds are saved during trip start. Upon trip completion, a query inspects the secondary index to capture the hold. How do you re-architect the data plane to eliminate duplicate charges caused by eventual consistency race conditions?",
        "answer": "The Architectural Vulnerability:\nWhen secondary indexes are eventually consistent (common in NoSQL document or key-value stores), a read operation during 'End Trip' can query a secondary index replica before asynchronous replication of the authorization hold completes. The query returns a false negative ('Hold Not Found'), causing the payment state machine to execute fallback logic ('Create New Charge'), resulting in double charges to the customer.\n\nArchitectural Resolution:\n\n1. Strongly Consistent Read Paths:\n- Enforce read-your-own-writes or linearizable read consistency (e.g. DynamoDB ConsistentRead=true, Cosmos DB Strong/Bounded Staleness) for all payment authorization state queries.\n\n2. Partition-Key Colocation:\n- Redesign the primary partition key around the TripID rather than CustomerID. Store both the trip metadata and payment hold within the same partition item collection, allowing authorization lookups to execute as strongly consistent primary key point lookups in O(1) time without querying secondary indexes.\n\n3. Distributed Idempotency Token:\n- Pass a deterministic idempotency key (trip_id + '_capture') to the payment gateway (Stripe/Adyen). Even if a race condition causes multiple charge requests to fire, the payment processor deduplicates the token and processes only the first settlement."
    },
    {
        "id": "arch-cdc-oltp-decoupling-yelp",
        "source": "Enterprise Lakehouse Migration",
        "category": "Data Pipelines & Ingestion",
        "niche": "Change Data Capture (CDC)",
        "difficulty": "ARCHITECT",
        "question": "How do you decouple an enterprise analytical lakehouse from legacy operational databases (MySQL / Cassandra) using Change Data Capture, schema registries, and stateful stream processing to prevent transactional schema changes from breaking downstream reporting?",
        "answer": "Architectural Solution (The Yelp Architecture Standard):\n\n1. Non-Invasive Capture Layer (Debezium):\n- Deploy Debezium connectors against MySQL binary logs (binlog) and Cassandra commit logs. Changes are captured at the storage layer without executing SELECT queries or acquiring table locks on production OLTP databases.\n\n2. Event Streaming Backbone (Apache Kafka):\n- Mutation events (INSERT, UPDATE, DELETE) are serialized as structured envelope events containing before, after, source, and op metadata and published to partitioned Kafka topics.\n\n3. Schema Contract Governance (Apicurio / Confluent Schema Registry):\n- Every event is governed by an Avro/JSON schema registered in the Schema Registry. Schema compatibility mode is set to BACKWARD or FULL, blocking upstream application deployments that attempt to drop required attributes or alter column data types.\n\n4. Stateful Stream Normalization (Apache Flink / Apache Beam):\n- Flink consumes Kafka mutation streams, normalizes timestamps, cleanses malformed records, and manages stream joins and stateful deduplication using tumbling or sliding watermarked event-time windows.\n\n5. Canonical Lakehouse Landing (Delta Lake / Iceberg):\n- Enriched events are committed to Delta Lake Bronze/Silver layers using MERGE INTO or append-only write streams, exposing version-controlled SQL views to analysts and insulating reporting models from transactional alterations."
    },
    {
        "id": "arch-many-to-many-bridge-retail",
        "source": "Kimball Dimensional Architecture",
        "category": "Data Modeling & Architecture",
        "niche": "Star Schema Bridge Tables",
        "difficulty": "ARCHITECT",
        "question": "In an omnichannel retail enterprise, customers belong to multiple customer demographic segments simultaneously, and each segment contains millions of customers. How do you design a Star Schema and Power BI semantic model that allows multi-segment reporting without Cartesian metric inflation?",
        "answer": "Architectural Solution:\n\n1. Star Schema Modeling:\n- Fact Table (fact_Sales): Contains transaction grain: DateKey, StoreKey, CustomerKey, SalesAmount, Quantity.\n- Customer Dimension (dim_Customer): Contains single-grain customer attributes: CustomerKey, CustomerName, SignupDate.\n- Segment Dimension (dim_Segment): Contains segment definitions: SegmentKey, SegmentName, SegmentTier.\n- Intermediate Bridge Table (bridge_CustomerSegment): Contains distinct (CustomerKey, SegmentKey, AllocationWeight) tuples. If a customer belongs to 2 segments equally, AllocationWeight is 0.50.\n\n2. Relational Relationships:\n- fact_Sales (N) joins to dim_Customer (1) on CustomerKey.\n- dim_Customer (1) joins to bridge_CustomerSegment (N) on CustomerKey.\n- bridge_CustomerSegment (N) joins to dim_Segment (1) on SegmentKey.\n\n3. Power BI / DAX Modeling Best Practices:\n- Avoid bidirectional cross-filtering between bridge and customer dimensions if table sizes exceed 10 million rows, as bidirectional filters degrade VertiPaq memory scan efficiency.\n- Use DAX CALCULATE with CROSSFILTER or TREATAS to dynamically filter transactions during segment drill-downs:\nWeightedSales = SUMX(bridge_CustomerSegment, [TotalSales] * bridge_CustomerSegment[AllocationWeight])"
    },
    {
        "id": "arch-spark-driver-oom-collect",
        "source": "Distributed Systems Reliability",
        "category": "Compute & Optimization",
        "niche": "Spark Memory Architecture & OOM",
        "difficulty": "ARCHITECT",
        "question": "An enterprise nightly Spark job processing 2 TB of telemetry data crashes with 'OutOfMemoryError: Java heap space' on the driver node, while another job fails with 'Too Large Frame (>2GB)'. How do you resolve both distributed memory bottlenecks?",
        "answer": "Architectural Diagnosis & Resolution:\n\n1. Driver OutOfMemoryError (Java Heap Space):\n- Root Cause: Application code executed df.collect(), df.toPandas(), or broadcasted a DataFrame that exceeded spark.driver.memory. The driver is designed to coordinate tasks and compile execution graphs, not hold multi-gigabyte query result sets.\n- Remediation:\n  a. Eliminate all collect() calls in production. Replace with direct storage writes: df.write.format('delta').mode('append').save(path).\n  b. If sampling or inspection is needed, use df.take(50) or df.limit(50).show().\n  c. Enforce spark.driver.maxResultSize = '4g' as a circuit breaker to prevent rogue queries from killing the cluster driver.\n\n2. 'Too Large Frame' (>2GB Netty Buffer Limit):\n- Root Cause: During a wide shuffle transformation (join or groupBy), an individual shuffle partition exceeded 2 GB in serialized byte size, breaching Netty's frame buffer limit.\n- Remediation:\n  a. Increase spark.sql.shuffle.partitions. Formula: total_input_size_in_mb / 150. For 2 TB (2,000,000 MB), configure 13,333 partitions (default 200 causes individual partitions of 10 GB!).\n  b. Enable Adaptive Query Execution: spark.sql.adaptive.enabled = true, which dynamically coalesces and splits shuffle partitions at runtime."
    },
    {
        "id": "arch-powerbi-schema-drift-resilience",
        "source": "Enterprise BI Platform Governance",
        "category": "Fabric & Power BI",
        "niche": "Semantic Model Reliability",
        "difficulty": "ARCHITECT",
        "question": "How do you architect an enterprise data platform serving 500+ Power BI dashboards across 15 business departments so that backend database refactoring, column renames, and table migrations never cause cloud scheduled refresh outages?",
        "answer": "Architectural Strategy:\n\n1. The View Abstraction Layer (Zero Direct Physical Table Access):\n- Enforce a strict architectural policy: Power BI models and downstream BI tools must NEVER query physical base tables directly.\n- Build a curated analytical view layer (e.g. analytics.vw_Sales_v1). All column names, data types, and surrogate key mappings are explicitly declared in the view definition.\n\n2. Blue-Green Semantic Model Deployment:\n- When a major schema modification or backfill occurs, create analytics.vw_Sales_v2. Upstream models remain pointing to v1 while v2 undergoes automated regression testing.\n- Once validated, update the view definition (CREATE OR REPLACE VIEW analytics.vw_Sales_v1 AS SELECT ... FROM sales_v2), achieving zero-downtime, non-breaking schema transition.\n\n3. Schema Drift Circuit Breaker in CI/CD:\n- Implement pre-deployment schema verification scripts (using Tabular Editor CLI / PBIP in Azure DevOps/GitHub Actions) that parse .bim / .pbip model files and fail pipeline builds if referenced database attributes are missing from target environments."
    },
    {
        "id": "arch-sql-server-deadlock-prevention",
        "source": "High-Throughput Relational Systems",
        "category": "Databases, SQL & Storage",
        "niche": "Concurrency & Deadlock Prevention",
        "difficulty": "ARCHITECT",
        "question": "Design an enterprise database concurrency architecture for a core banking application handling 20,000 transactions per second in SQL Server, eliminating Error 1205 deadlocks between transactional deposits and bulk reconciliation jobs.",
        "answer": "Architectural Concurrency Blueprint:\n\n1. Isolation Level Architecture:\n- Enable Read Committed Snapshot Isolation (RCSI): ALTER DATABASE CoreBanking SET READ_COMMITTED_SNAPSHOT ON WITH ROLLBACK IMMEDIATE.\n- Readers (reconciliation queries and reporting) read row versions from the Persistent Version Store (PVS) without acquiring Shared (S) locks, completely preventing readers from blocking active transactional deposits.\n\n2. Strict Object Access Ordering:\n- Enforce enterprise-wide stored procedure coding standards requiring database objects to be locked in identical alphabetical order (e.g. Accounts -> Transactions -> AuditLog). Cyclic lock dependencies cannot form if all transactions acquire resources in the same order.\n\n3. Fine-Grained Locking & Index Covering:\n- Every transactional UPDATE/DELETE must seek on unique clustered index keys. Non-sargable scans or table scans that escalate from row locks to page or table locks are blocked by pre-commit pull request static analysis.\n\n4. Workload Separation & Read Replicas:\n- Configure Always On Availability Groups with Read-Only Routing. Heavy bulk reconciliation jobs connect with ApplicationIntent=ReadOnly to execute against secondary AG replicas, completely offloading reporting I/O from the primary transactional instance."
    },
    {
        "id": "arch-cross-cloud-polybase-cetas",
        "source": "Hybrid Multi-Cloud Lakehouse",
        "category": "Cloud Data Warehousing & MPP",
        "niche": "Data Ingestion & Export",
        "difficulty": "ARCHITECT",
        "question": "How do you architect an ELT data transformation pipeline in Azure Synapse Analytics that materializes aggregated gold marts to ADLS Gen2 as compressed Parquet files using CETAS while achieving automated column statistics and zero compute idle costs?",
        "answer": "Architectural Blueprint:\n\n1. CETAS (Create External Table As Select) Export Pattern:\n- Define an External Data Source pointing to the ADLS Gen2 gold container using Managed Identity authentication.\n- Define an External File Format configured for SNAPPY-compressed PARQUET.\n- Execute CETAS to materialize transformations directly from silver tables into cloud storage:\nCREATE EXTERNAL TABLE gold.MonthlyCustomerMetrics\nWITH (\n    LOCATION = 'metrics/monthly_customer/',\n    DATA_SOURCE = ADLSGen2GoldSource,\n    FILE_FORMAT = ParquetSnappy\n)\nAS\nSELECT customer_id, DATE_TRUNC('month', order_date) AS metric_month, COUNT(*) AS total_orders, SUM(amount) AS total_spend\nFROM silver.Orders\nGROUP BY customer_id, DATE_TRUNC('month', order_date);\n\n2. Automatic Statistics Advantage:\n- Synapse automatically creates single-column statistics on external tables upon the first query, allowing subsequent Serverless SQL queries to optimize join orders and partition pruning without manual CREATE STATISTICS maintenance.\n\n3. FinOps Pause/Resume & Serverless Querying:\n- For batch transformations, use Synapse Serverless SQL Pools (pay-per-TB-scanned: ~$5 per TB) instead of running a 24/7 dedicated pool. The compute spins up on demand, executes CETAS, and incurs zero cost once data is written to object storage."
    }
]

for item in new_scenarios:
    assert item['id'] not in existing_ids, f"Duplicate ID: {item['id']}"
    assert item['question'].strip(), "Question cannot be empty"
    assert item['answer'].strip(), "Answer cannot be empty"

data.extend(new_scenarios)

temp_file = FILE + '.tmp'
with open(temp_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

os.replace(temp_file, FILE)

print(f"Successfully updated {FILE}! New count: {len(data)} (+{len(new_scenarios)})")
