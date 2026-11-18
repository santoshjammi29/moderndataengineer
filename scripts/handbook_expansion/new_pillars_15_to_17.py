"""
Pillars 15, 16, and 17 (30 questions)
"""

NEW_PILLARS_15_17 = {
    "15": {
        "title": "Pillar 15: Apache Iceberg & Modern Open Table Formats",
        "category": "OPEN TABLE FORMATS",
        "domain": "Modern Open Table Formats",
        "questions": [
            {
                "id": "pil15-iceberg-metadata-tree",
                "category": "OPEN TABLE FORMATS",
                "domain": "Modern Open Table Formats",
                "subdomain": "Metadata Architecture",
                "niche": "Iceberg Metadata Tree",
                "difficulty": "ARCHITECT",
                "question": "Explain the 4-tier metadata tree architecture of Apache Iceberg and how it resolves snapshot queries.",
                "answer": "Apache Iceberg structures tables into a hierarchical metadata tree:\n1. **Iceberg Catalog:** Stores the current pointer to the latest **Metadata File** (`v3.metadata.json`).\n2. **Metadata File:** Contains table schema, partition spec, snapshot history, and an array of snapshots with timestamp/id.\n3. **Manifest List (`snap-*.avro`):** Represents a specific snapshot. Contains an entry for every **Manifest File**, along with partition summary min/max bounds.\n4. **Manifest File (`*.avro`):** Contains the list of actual **Data Files** (`*.parquet`), file path, size, record count, column-level min/max stats, null counts, and delete file references.\n**Query Resolution:** The query planner inspects partition bounds in the Manifest List to prune whole manifest files, then inspects column stats in remaining manifests to skip data files before reading Parquet footers.",
                "linked_concept_id": "lakehouse-table-formats"
            },
            {
                "id": "pil15-hidden-partitioning",
                "category": "OPEN TABLE FORMATS",
                "domain": "Modern Open Table Formats",
                "subdomain": "Partitioning & Layout",
                "niche": "Hidden Partitioning",
                "difficulty": "HARD",
                "question": "What is Hidden Partitioning in Apache Iceberg, and why does it eliminate Hive user query partition bugs?",
                "answer": "**Hive Partitioning Flaw:** In Hive/Spark, partitioning by date required adding a physical synthetic column `date_col = '2026-11-18'`. If a user queried `WHERE timestamp >= '2026-11-18 00:00:00'`, Hive failed to prune partitions because the query did not explicitly filter on `date_col`.\n**Iceberg Hidden Partitioning:**\n- Partition specs define transforms directly on source columns: `PARTITIONED BY (days(event_time), bucket(16, user_id))`.\n- Queries simply filter `WHERE event_time >= '2026-11-18 00:00:00'`. Iceberg's metadata planner automatically translates the timestamp filter into partition bounds, pruning files transparently without synthetic columns.",
                "linked_concept_id": "lakehouse-table-formats"
            },
            {
                "id": "pil15-positional-vs-equality-deletes",
                "category": "OPEN TABLE FORMATS",
                "domain": "Modern Open Table Formats",
                "subdomain": "ACID Mutations",
                "niche": "Iceberg Deletes (Positional vs Equality)",
                "difficulty": "HARD",
                "question": "Compare Positional Deletes vs Equality Deletes in Iceberg Merge-On-Read (MOR) tables.",
                "answer": "**1. Positional Deletes:** A delete file stores the exact file path and 0-based integer row ordinal position of deleted rows (`file_path: 's3://.../part-1.parquet', pos: 1042`). Very fast at read time: the reader loads positions into memory and skips rows.\n**2. Equality Deletes:** A delete file stores field equality conditions (`id = 4521`). Highly performant at write time (used in Flink CDC streaming writes), but expensive at read time because the reader must join equality delete rows with all candidate data files.\n*Best Practice:* Schedule background compaction (`RewriteDataFiles`) to merge Equality Deletes into clean Parquet files.",
                "linked_concept_id": "lakehouse-table-formats"
            },
            {
                "id": "pil15-schema-evolution-field-ids",
                "category": "OPEN TABLE FORMATS",
                "domain": "Modern Open Table Formats",
                "subdomain": "Schema Evolution",
                "niche": "Schema Evolution with Field IDs",
                "difficulty": "HARD",
                "question": "How do Field IDs in Iceberg prevent column corruption during renames and drops?",
                "answer": "Traditional Parquet readers map columns by column name or ordinal index position. Renaming a column or swapping positions in Parquet causes data misalignment or missing column errors.\n**Iceberg Field IDs:**\n- Every column is assigned an immutable 32-bit integer ID (`field_id: 1`).\n- Renaming `cust_name` (ID 1) to `customer_full_name` simply updates metadata; the physical Parquet file retains ID 1.\n- Dropping a column marks ID 1 deleted; new columns never reuse ID 1.\n- Parquet readers map data strictly by Field ID, guaranteeing 100% immune schema evolution.",
                "linked_concept_id": "lakehouse-table-formats"
            },
            {
                "id": "pil15-catalog-architectures-nessie-polaris",
                "category": "OPEN TABLE FORMATS",
                "domain": "Modern Open Table Formats",
                "subdomain": "Catalog Architectures",
                "niche": "Catalog Architectures (REST/Nessie/Polaris)",
                "difficulty": "ARCHITECT",
                "question": "Compare modern Iceberg catalog architectures: REST Catalog vs Project Nessie vs Apache Polaris.",
                "answer": "**1. Iceberg REST Catalog:** The official open standard HTTP specification for Iceberg catalogs. Decouples engines from storage backend; supported natively by Snowflake, Databricks, and Tabular.\n**2. Project Nessie:** A Git-like catalog for Iceberg. Provides branches (`git checkout branch`), tags, and atomic multi-table commits. Enables WAP (Write-Audit-Publish) workflows.\n**3. Apache Polaris (Snowflake):** Open-source enterprise REST catalog providing multi-cloud cross-engine role-based access control (RBAC) and credential vending.",
                "linked_concept_id": "lakehouse-table-formats"
            },
            {
                "id": "pil15-time-travel-snapshot-isolation",
                "category": "OPEN TABLE FORMATS",
                "domain": "Modern Open Table Formats",
                "subdomain": "Time Travel & Auditability",
                "niche": "Iceberg Snapshot Isolation",
                "difficulty": "MEDIUM",
                "question": "How do you execute point-in-time time-travel queries in Apache Iceberg using SQL and PySpark?",
                "answer": "```sql\n-- Query as of a specific historical timestamp:\nSELECT * FROM prod.db.orders FOR SYSTEM_TIME AS OF '2026-11-01 10:00:00';\n\n-- Query as of a specific Snapshot ID:\nSELECT * FROM prod.db.orders FOR SYSTEM_VERSION AS OF 84920491029482019;\n```\nIn PySpark:\n```python\nspark.read.option(\"as-of-timestamp\", \"1795000000000\").table(\"prod.db.orders\")\nspark.read.option(\"snapshot-id\", 84920491029482019).table(\"prod.db.orders\")\n```",
                "linked_concept_id": "lakehouse-table-formats"
            },
            {
                "id": "pil15-compaction-binpack-zorder",
                "category": "OPEN TABLE FORMATS",
                "domain": "Modern Open Table Formats",
                "subdomain": "Compaction & File Layout",
                "niche": "Compaction Strategies (Bin-pack vs Z-Order)",
                "difficulty": "HARD",
                "question": "What is the difference between bin-pack compaction and Z-order sort compaction in Iceberg?",
                "answer": "**1. Bin-Pack Compaction (`rewriteDataFiles(strategy = 'binpack')`):** Groups small files into optimal target sizes (e.g. 512MB) without sorting. Extremely low compute cost; fast, ideal for consolidating micro-batch streams.\n**2. Sort / Z-Order Compaction (`strategy = 'sort', sort_order = zorder(col1, col2)`):** Rewrites files sorted along multi-dimensional space-filling curves. Minimizes min/max range overlaps across files, allowing queries filtering on clustered columns to skip 90%+ of files.",
                "linked_concept_id": "lakehouse-table-formats"
            },
            {
                "id": "pil15-puffin-statistics-format",
                "category": "OPEN TABLE FORMATS",
                "domain": "Modern Open Table Formats",
                "subdomain": "Physical Storage & Statistics",
                "niche": "Puffin File Format & Sketches",
                "difficulty": "ARCHITECT",
                "question": "What is the Puffin file format in Apache Iceberg, and how does it accelerate Cost-Based Optimization?",
                "answer": "Puffin is a specialized file format designed by Apache Iceberg to store statistical sketches, indexes, and blobs outside data files.\n- **Theta Sketches & HyperLogLog (HLL):** Stores distinct count estimates for columns.\n- **Bloom Filters:** Stores probabilistic set membership filters.\n- *Why It Matters:* Query engines (Trino/Spark) read lightweight Puffin files during query planning to calculate exact join cardinalities and build DPP filters without scanning underlying Parquet files.",
                "linked_concept_id": "lakehouse-table-formats"
            },
            {
                "id": "pil15-branching-tagging-wap",
                "category": "OPEN TABLE FORMATS",
                "domain": "Modern Open Table Formats",
                "subdomain": "Git-Like Operations & WAP",
                "niche": "Branching, Tagging & WAP Pattern",
                "difficulty": "ARCHITECT",
                "question": "How do you implement the Write-Audit-Publish (WAP) pattern in Apache Iceberg using branches?",
                "answer": "1. **Write to Staging Branch:** Ingestion pipeline writes new batch into a dedicated branch: `ALTER TABLE orders CREATE BRANCH audit_branch;`\n2. **Audit Phase:** Data quality tests run against `audit_branch` (`SELECT * FROM orders.branch_audit_branch`). Assert zero anomalies.\n3. **Publish Phase (Fast-Forward):** If tests pass, fast-forward `main` branch to match `audit_branch` atomically via metadata commit.\nZero impact on production readers; dirty batches are dropped by deleting the branch without cleanup overhead.",
                "linked_concept_id": "lakehouse-table-formats"
            },
            {
                "id": "pil15-uniform-vs-native-iceberg",
                "category": "OPEN TABLE FORMATS",
                "domain": "Modern Open Table Formats",
                "subdomain": "Multi-Engine Interoperability",
                "niche": "UniForm vs Native Iceberg",
                "difficulty": "HARD",
                "question": "What are the trade-offs of using Delta Lake UniForm to generate Iceberg metadata vs maintaining a native Iceberg table?",
                "answer": "**Advantages of UniForm:** Single write pipeline in Databricks creates both Delta and Iceberg metadata over the same Parquet files; Snowflake/Athena can query as Iceberg.\n**Trade-offs vs Native Iceberg:**\n- *Latency:* UniForm metadata translation is asynchronous; external engines see up to a few minutes of metadata lag.\n- *Feature Parity:* Native Iceberg features like Puffin sketches, branch WAP workflows, and custom partition transforms may not be fully supported by UniForm translators.",
                "linked_concept_id": "lakehouse-table-formats"
            }
        ]
    },
    "16": {
        "title": "Pillar 16: Apache Flink & Stateful Real-Time Stream Processing",
        "category": "STREAMING & REAL-TIME",
        "domain": "Stateful Stream Processing",
        "questions": [
            {
                "id": "pil16-flink-architecture-task-slots",
                "category": "STREAMING & REAL-TIME",
                "domain": "Stateful Stream Processing",
                "subdomain": "Flink Architecture & Scheduling",
                "niche": "JobManager, TaskManager & Slots",
                "difficulty": "HARD",
                "question": "Explain the distributed architecture of Apache Flink: JobManager, TaskManager, and Task Slots.",
                "answer": "**JobManager:** Master coordinator. Translates user DataStream/SQL graphs into JobGraphs, schedules tasks, coordinates checkpoints, and handles failover.\n**TaskManager:** Worker node JVM. Executes individual tasks (subtasks).\n**Task Slots:** Units of resource isolation inside a TaskManager. Each TaskManager has $N$ slots. Task slots share JVM heap and off-heap memory, but subtasks from different stages execute in parallel threads within the same slot (Slot Sharing Groups), maximizing CPU and memory utilization.",
                "linked_concept_id": "kafka-streaming"
            },
            {
                "id": "pil16-chandy-lamport-checkpointing",
                "category": "STREAMING & REAL-TIME",
                "domain": "Stateful Stream Processing",
                "subdomain": "Fault Tolerance & Checkpointing",
                "niche": "Chandy-Lamport Checkpoint Barriers",
                "difficulty": "ARCHITECT",
                "question": "How does Flink's asynchronous barrier snapshotting (Chandy-Lamport) achieve fault tolerance without pausing the stream?",
                "answer": "Flink injects lightweight **Checkpoint Barriers** into the input stream at sources alongside event data.\n1. Barriers flow through the DAG operators alongside data without overtaking records.\n2. When an operator receives a barrier on all input channels (Barrier Alignment), it takes an asynchronous snapshot of its local state (RocksDB / heap) and dispatches it to remote storage.\n3. The operator forwards the barrier to downstream operators immediately while the state snapshot writes to storage asynchronously in the background.\nStream processing continues with sub-second latencies while snapshots are persisted.",
                "linked_concept_id": "kafka-streaming"
            },
            {
                "id": "pil16-hashmap-vs-rocksdb-statebackend",
                "category": "STREAMING & REAL-TIME",
                "domain": "Stateful Stream Processing",
                "subdomain": "State Backends & Memory",
                "niche": "HashMap vs RocksDB StateBackends",
                "difficulty": "HARD",
                "question": "Compare Flink HashMapStateBackend vs EmbeddedRocksDBStateBackend across performance, state scale, and GC pressure.",
                "answer": "**1. HashMapStateBackend:**\n- State stored as Java objects on TaskManager heap.\n- *Speed:* Blazing fast (direct memory reads/writes, zero serialization).\n- *Scale:* Limited by JVM heap (typically < 50GB); heavy GC pauses.\n**2. EmbeddedRocksDBStateBackend:**\n- State stored off-heap in out-of-core embedded RocksDB C++ instances.\n- *Speed:* Requires serialization/deserialization on read/write (slightly higher CPU).\n- *Scale:* Bound only by local NVMe disk size (terabytes of state); 0 JVM GC pauses.\n- *Incremental Checkpoints:* Snapshots write only new SST files, speeding up checkpoints 10x.",
                "linked_concept_id": "kafka-streaming"
            },
            {
                "id": "pil16-unaligned-checkpoints-backpressure",
                "category": "STREAMING & REAL-TIME",
                "domain": "Stateful Stream Processing",
                "subdomain": "Backpressure & Tuning",
                "niche": "Unaligned Checkpoints",
                "difficulty": "HARD",
                "question": "Why do aligned checkpoints fail during heavy backpressure, and how do Flink Unaligned Checkpoints fix this?",
                "answer": "**The Aligned Checkpoint Dilemma:** During backpressure, network output/input buffers are full of queued data. Checkpoint barriers get stuck behind millions of backlogged records, causing checkpoint timeouts and cascading failures.\n**Unaligned Checkpoints:**\n- Barriers overtake data buffers immediately.\n- The operator persists in-flight network channel buffers *into the checkpoint state* along with operator state.\n- Checkpoints succeed in constant time (< a few seconds) even under 100% backpressure.",
                "linked_concept_id": "kafka-streaming"
            },
            {
                "id": "pil16-watermark-alignment-idle-sources",
                "category": "STREAMING & REAL-TIME",
                "domain": "Stateful Stream Processing",
                "subdomain": "Event Time & Watermarks",
                "niche": "Watermark Alignment & Idle Detection",
                "difficulty": "HARD",
                "question": "How do you prevent a single idle or delayed Kafka partition from stalling global watermark progression in Flink?",
                "answer": "**The Idle Partition Problem:** Flink advances an operator's watermark to the minimum watermark of all input channels. If one Kafka partition has 0 events, its watermark never advances, causing downstream window operators to stall forever.\n**Remediation:**\n1. Enable **Idle Source Detection**:\n```java\nWatermarkStrategy.<Event>forBoundedOutOfOrderness(Duration.ofSeconds(10))\n    .withIdleness(Duration.ofMinutes(1));\n```\nIf a partition produces no events for 1 minute, Flink marks it IDLE and excludes it from downstream watermark calculation.\n2. **Watermark Alignment:** Restricts fast partitions from racing ahead of slow partitions by pausing consumer reads.",
                "linked_concept_id": "kafka-streaming"
            },
            {
                "id": "pil16-two-phase-commit-eos-sink",
                "category": "STREAMING & REAL-TIME",
                "domain": "Stateful Stream Processing",
                "subdomain": "Exactly-Once Semantics",
                "niche": "TwoPhaseCommitSinkFunction (EOS)",
                "difficulty": "ARCHITECT",
                "question": "How does Flink's TwoPhaseCommitSinkFunction guarantee end-to-end exactly-once semantics with Apache Kafka?",
                "answer": "Flink integrates its checkpointing protocol with Kafka transactions (`KafkaSink`):\n1. **Pre-Commit:** When a micro-batch starts, Flink begins a Kafka transaction. Records write to Kafka in `uncommitted` status.\n2. When checkpoint barrier reaches the sink, Flink completes the pre-commit by staging the transaction ID in checkpoint state.\n3. **Commit Phase:** Once the JobManager confirms the global checkpoint succeeded across all operators, it invokes the sink's `commit()` method to finalize the Kafka transaction.\nConsumers reading Kafka with `read_committed` see data strictly after commit, achieving true end-to-end exactly-once.",
                "linked_concept_id": "kafka-streaming"
            },
            {
                "id": "pil16-flink-cep-pattern-matching",
                "category": "STREAMING & REAL-TIME",
                "domain": "Stateful Stream Processing",
                "subdomain": "Complex Event Processing",
                "niche": "Flink CEP Pattern Matching",
                "difficulty": "MEDIUM",
                "question": "How do you detect fraud patterns (e.g. 3 consecutive failed logins within 60 seconds followed by a successful transfer) using Flink CEP?",
                "answer": "```java\nPattern<Event, ?> fraudPattern = Pattern.<Event>begin(\"failed_logins\")\n    .where(e -> e.getType().equals(\"LOGIN_FAILED\"))\n    .times(3).consecutive()\n    .followedBy(\"transfer\")\n    .where(e -> e.getType().equals(\"TRANSFER\") && e.getAmount() > 10000)\n    .within(Time.seconds(60));\n\nPatternStream<Event> patternStream = CEP.pattern(eventStream.keyBy(Event::getUserId), fraudPattern);\nDataStream<Alert> alerts = patternStream.select(new FraudAlertSelector());\n```",
                "linked_concept_id": "kafka-streaming"
            },
            {
                "id": "pil16-side-outputs-dead-letter",
                "category": "STREAMING & REAL-TIME",
                "domain": "Stateful Stream Processing",
                "subdomain": "Error Handling & Isolation",
                "niche": "Side Outputs & Quarantine",
                "difficulty": "MEDIUM",
                "question": "How do Flink Side Outputs enable zero-loss dead-letter queue routing for malformed payloads?",
                "answer": "```java\nfinal OutputTag<String> deadLetterTag = new OutputTag<String>(\"corrupted-records\"){};\n\nSingleOutputStreamOperator<CleanEvent> processedStream = inputStream.process(\n    new ProcessFunction<RawEvent, CleanEvent>() {\n        public void processElement(RawEvent value, Context ctx, Collector<CleanEvent> out) {\n            try {\n                out.collect(parseCleanEvent(value));\n            } catch (Exception e) {\n                ctx.output(deadLetterTag, value.getRawPayload());\n            }\n        }\n    }\n);\n// Route dead letters to DLQ Kafka topic or Delta quarantine table\nprocessedStream.getSideOutput(deadLetterTag).sinkTo(dlqSink);\n```",
                "linked_concept_id": "kafka-streaming"
            },
            {
                "id": "pil16-temporal-table-joins",
                "category": "STREAMING & REAL-TIME",
                "domain": "Stateful Stream Processing",
                "subdomain": "Flink SQL & Stream Encodings",
                "niche": "Temporal Table Joins in Flink SQL",
                "difficulty": "HARD",
                "question": "What is a Temporal Table Join in Flink SQL, and how does it enrich event streams with historical dimension snapshots?",
                "answer": "A Temporal Table Join enriches an event stream against a changing CDC dimension table at the **exact point in time** the event occurred.\n```sql\nSELECT \n  o.order_id, o.amount, o.order_time, c.currency, o.amount * r.rate AS amount_usd\nFROM orders o\nJOIN currency_rates FOR SYSTEM_TIME AS OF o.order_time AS r\n  ON o.currency = r.currency;\n```\nFlink buffers historical dimension versions in state and resolves the exchange rate that was valid at `o.order_time`, preventing state divergence.",
                "linked_concept_id": "kafka-streaming"
            },
            {
                "id": "pil16-reactive-mode-adaptive-scaling",
                "category": "STREAMING & REAL-TIME",
                "domain": "Stateful Stream Processing",
                "subdomain": "Autoscaling & Orchestration",
                "niche": "Reactive Mode & Dynamic Scaling",
                "difficulty": "ARCHITECT",
                "question": "How does Flink Reactive Mode dynamically scale streaming jobs up and down on Kubernetes without manual intervention?",
                "answer": "In classic Flink, changing job parallelism required stopping the job, taking a savepoint, altering cluster configuration, and restarting.\n**Reactive Mode (Kubernetes Native):**\n- Flink automatically configures job parallelism to match the total number of available task slots in the cluster.\n- When a Kubernetes Horizontal Pod Autoscaler (HPA) adds TaskManager pods based on CPU or Kafka consumer lag, Flink automatically rescales the job across new slots without external tooling.",
                "linked_concept_id": "kafka-streaming"
            }
        ]
    },
    "17": {
        "title": "Pillar 17: Distributed MPP Query Engines: Trino, Presto & DuckDB",
        "category": "QUERY ENGINES & ANALYTICS",
        "domain": "Distributed MPP Query Engines",
        "questions": [
            {
                "id": "pil17-trino-coordinator-worker-mpp",
                "category": "QUERY ENGINES & ANALYTICS",
                "domain": "Distributed MPP Query Engines",
                "subdomain": "Trino Architecture",
                "niche": "Coordinator-Worker Architecture",
                "difficulty": "HARD",
                "question": "Explain the distributed query execution lifecycle in Trino: Coordinator, Discovery, Workers, Splits, and Exchange Operators.",
                "answer": "1. **Coordinator:** Parses SQL, analyzes syntax, applies Cost-Based Optimization (CBO), and generates distributed execution stages.\n2. **Connector & Splits:** The coordinator requests splits from storage connectors (e.g. Hive/Iceberg connector generates 1 split per Parquet row group).\n3. **Workers:** Execute pipelined operators in memory. Tasks stream intermediate row batches directly over HTTP/gRPC via Exchange Operators without writing intermediate shuffle files to disk.\n4. **Pure In-Memory Streaming:** Output rows stream to the client while downstream stages are still processing, achieving ultra-low query latency.",
                "linked_concept_id": "database-architecture"
            },
            {
                "id": "pil17-trino-dynamic-filtering",
                "category": "QUERY ENGINES & ANALYTICS",
                "domain": "Distributed MPP Query Engines",
                "subdomain": "Query Optimization",
                "niche": "Dynamic Filtering in Trino",
                "difficulty": "ARCHITECT",
                "question": "How does Dynamic Filtering in Trino optimize large fact-dimension joins at runtime?",
                "answer": "In star-schema queries joining a massive fact table with a filtered dimension:\n1. As worker nodes scan and filter the small dimension table, they collect distinct join keys into an in-memory Bloom filter or exact value set.\n2. The dynamic filter is transmitted to the coordinator and broadcast to workers scanning the massive fact table.\n3. The fact table scan evaluates the dynamic filter at the storage connector level, skipping non-matching Parquet row groups and partitions *before* reading rows into memory.\nReduces scan I/O by 80-95% for selective dimension queries.",
                "linked_concept_id": "database-architecture"
            },
            {
                "id": "pil17-trino-memory-pools-spill",
                "category": "QUERY ENGINES & ANALYTICS",
                "domain": "Distributed MPP Query Engines",
                "subdomain": "Memory Management & Triage",
                "niche": "Trino Memory Pools & Spill-to-Disk",
                "difficulty": "HARD",
                "question": "How does Trino manage memory across queries, and what happens when a query exceeds max-memory-per-node?",
                "answer": "Trino allocates JVM memory into pools: **User Memory** (hash tables for joins/aggregations) and **System Memory** (reader buffers).\n- `query.max-memory-per-node` caps the maximum memory a single query can consume on one worker.\n**Exceeding Limits:**\n1. If spill-to-disk is disabled (`spill-enabled = false`), the query is aborted immediately with `EXCEEDED_LOCAL_MEMORY_LIMIT`.\n2. If **Spill-to-Disk** is enabled (`spill-enabled = true`), Trino spills hash join tables and aggregation states to local NVMe scratch disk, allowing large queries to complete at slightly reduced throughput.",
                "linked_concept_id": "database-architecture"
            },
            {
                "id": "pil17-trino-fault-tolerant-execution",
                "category": "QUERY ENGINES & ANALYTICS",
                "domain": "Distributed MPP Query Engines",
                "subdomain": "High Availability & Fault Tolerance",
                "niche": "Project Tardigrade (Fault Tolerance)",
                "difficulty": "ARCHITECT",
                "question": "How does Trino Fault-Tolerant Execution (Project Tardigrade) allow multi-hour ETL queries to survive worker failures?",
                "answer": "Historically, Trino used pure in-memory streaming; a single worker crash killed the entire query.\n**Fault-Tolerant Execution (`retry-policy = QUERY` or `TASK`):**\n- Decouples stages by buffering intermediate stage outputs to an external spooling exchange storage (e.g. S3, MinIO, or local disk).\n- If a worker dies while executing Task $T_{2,4}$, the coordinator restarts only that single failed task, reading inputs from the spooled output of Stage 1.\n- Enables Trino to run massive, multi-hour batch ETL workloads reliably alongside interactive queries.",
                "linked_concept_id": "database-architecture"
            },
            {
                "id": "pil17-trino-vs-presto-evolution",
                "category": "QUERY ENGINES & ANALYTICS",
                "domain": "Distributed MPP Query Engines",
                "subdomain": "Engine Evolution & Ecosystem",
                "niche": "Trino vs Presto Architecture",
                "difficulty": "MEDIUM",
                "question": "What is the historical relationship and technical divergence between PrestoDB and Trino?",
                "answer": "Trino was originally created as Presto at Facebook in 2012. In 2019, the original creators branched into PrestoSQL, which was rebranded as **Trino**.\n**Key Divergence:**\n- **Trino:** Maintained by the open-source Trino Foundation. Heavy enterprise adoption, leading support for open table formats (Iceberg, Delta Lake), native fault-tolerant execution, and dynamic filtering.\n- **Presto (PrestoDB):** Maintained by Meta under Linux Foundation. Optimized for Meta's internal infrastructure, Presto on Spark, and native C++ Prestissimo (Velox engine).",
                "linked_concept_id": "database-architecture"
            },
            {
                "id": "pil17-duckdb-architecture-vectorized",
                "category": "QUERY ENGINES & ANALYTICS",
                "domain": "Embedded Analytics Engines",
                "subdomain": "DuckDB Internals",
                "niche": "DuckDB Columnar SIMD Engine",
                "difficulty": "HARD",
                "question": "Why is DuckDB referred to as the 'SQLite for Analytics', and how does its vectorized execution engine achieve near-hardware speeds?",
                "answer": "DuckDB is an in-process, serverless columnar OLAP database written in C++ with zero external dependencies.\n**Vectorized SIMD Execution (Morsel-Driven Parallelism):**\n- Executes operations on 2,048-element column vectors that fit entirely within CPU L1/L2 cache.\n- Uses SIMD instruction vectorization for filter and aggregation loops.\n- **Morsel-Driven Scheduling:** Dynamically partitions tasks into small chunks (morsels) across available hardware threads with automatic work-stealing, avoiding global lock contention.\n- Runs directly inside Python, Node.js, or browser WebAssembly without running a client-server daemon.",
                "linked_concept_id": "database-architecture"
            },
            {
                "id": "pil17-duckdb-local-s3-parquet",
                "category": "QUERY ENGINES & ANALYTICS",
                "domain": "Embedded Analytics Engines",
                "subdomain": "Direct Storage Querying",
                "niche": "DuckDB Direct Parquet/S3 Querying",
                "difficulty": "MEDIUM",
                "question": "How do you query multi-gigabyte remote S3/GCS Parquet files directly in DuckDB without downloading the files?",
                "answer": "```sql\n-- Install and load httpfs extension:\nINSTALL httpfs; LOAD httpfs;\n\n-- Configure AWS credentials:\nSET s3_region='us-east-1';\nSET s3_access_key_id='AKIA...';\nSET s3_secret_access_key='...';\n\n-- Query remote Parquet files with automatic projection and filter pushdown:\nSELECT \n  customer_id, \n  SUM(amount) AS total_spend\nFROM read_parquet('s3://my-lakehouse/orders/*.parquet')\nWHERE order_date >= '2026-11-01'\nGROUP BY 1;\n```\nDuckDB issues HTTP Range Requests to read only Parquet footers and the specific required column chunks, reading a few megabytes over the network rather than gigabytes.",
                "linked_concept_id": "database-architecture"
            },
            {
                "id": "pil17-duckdb-arrow-zero-copy",
                "category": "QUERY ENGINES & ANALYTICS",
                "domain": "Embedded Analytics Engines",
                "subdomain": "Zero-Copy Data Transfer",
                "niche": "DuckDB + PyArrow Zero-Copy IPC",
                "difficulty": "HARD",
                "question": "How does DuckDB integrate with Apache Arrow and Polars to execute zero-copy analytical queries in Python?",
                "answer": "```python\nimport duckdb\nimport polars as pl\n\n# Create Polars DataFrame\npl_df = pl.DataFrame({\"id\": [1, 2, 3], \"val\": [10.5, 20.2, 30.1]})\n\n# Query Polars DataFrame in DuckDB with ZERO COPY:\ncon = duckdb.connect()\nresult = con.execute(\"\"\"\n    SELECT id, val * 2 AS doubled \n    FROM pl_df \n    WHERE val > 15.0\n\"\"\").arrow()\n\n# Convert back to Polars with zero serialization overhead:\noutput_df = pl.from_arrow(result)\n```\nDuckDB reads the underlying Apache Arrow record batch pointers directly from Python process memory without copying memory.",
                "linked_concept_id": "database-architecture"
            },
            {
                "id": "pil17-duckdb-vs-spark-single-node",
                "category": "QUERY ENGINES & ANALYTICS",
                "domain": "Embedded Analytics Engines",
                "subdomain": "Engine Selection & Trade-Offs",
                "niche": "DuckDB vs Single-Node Spark",
                "difficulty": "MEDIUM",
                "question": "When should an enterprise use DuckDB instead of a single-node Apache Spark cluster for batch transformations?",
                "answer": "**Choose DuckDB:**\n- Data fits on a single machine (up to a few terabytes using out-of-core spill-to-disk).\n- Eliminates JVM startup latency, memory tuning, and Py4J IPC socket serialization.\n- Embedded inside lightweight AWS Lambda, Docker containers, or Airflow worker pods.\n- 5x to 10x faster execution and 90% lower compute cost than local Spark.\n**Choose Spark:** When data exceeds single-node capacity (> 5TB), requires distributed cluster scaling across 100+ nodes, or requires stateful stream processing.",
                "linked_concept_id": "database-architecture"
            },
            {
                "id": "pil17-trino-iceberg-metadata-caching",
                "category": "QUERY ENGINES & ANALYTICS",
                "domain": "Distributed MPP Query Engines",
                "subdomain": "Connector Performance",
                "niche": "Trino Iceberg Metadata Caching",
                "difficulty": "HARD",
                "question": "How does Trino optimize query planning on 100TB Iceberg tables using metadata caching?",
                "answer": "On tables with 100,000+ files, fetching Iceberg manifest files over S3 during query planning adds 10-30 seconds of planning latency.\n**Trino Optimization:**\n1. **In-Memory Manifest Caching:** Caches Iceberg manifest files in Trino coordinator/worker memory (`iceberg.metadata-cache.enabled = true`).\n2. **Distributed Split Generation:** Delegates manifest file parsing to worker nodes in parallel rather than doing all planning on the single coordinator.\n3. Cuts planning latency from 30 seconds down to < 200 milliseconds.",
                "linked_concept_id": "database-architecture"
            }
        ]
    }
}
