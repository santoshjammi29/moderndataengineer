"""
Questions 11-15 for Pillars 08 through 14 (35 questions)
"""

PILLAR_EXTENSIONS_P8_P14 = {
    "08": [
        {
            "id": "pil08-onelake-shortcuts-namespace",
            "category": "MICROSOFT FABRIC",
            "domain": "Enterprise SaaS Lakehouse",
            "subdomain": "OneLake Storage & Shortcuts",
            "niche": "OneLake Storage & Shortcuts",
            "difficulty": "HARD",
            "question": "How do OneLake Shortcuts unify data across AWS S3, ADLS Gen2, and Google Cloud Storage without physical movement?",
            "answer": "OneLake Shortcuts are virtual metadata pointers embedded inside the Fabric OneLake filesystem (`https://onelake.dfs.fabric.microsoft.com`).\n- **Mechanism:** A shortcut references external cloud object storage (e.g. `s3://corp-lake/delta_tables/`) using cloud-native IAM credentials.\n- **Zero-ETL:** No data is physically copied or synced into Fabric. The Fabric Spark engine, SQL endpoint, and Power BI query external Parquet files in place.\n- **Unified Catalog:** External Delta/Parquet tables appear as native tables inside Fabric workspaces, unifying multi-cloud assets under a single governance boundary.",
            "linked_concept_id": "fabric-onelake"
        },
        {
            "id": "pil08-direct-lake-internals",
            "category": "MICROSOFT FABRIC",
            "domain": "Enterprise SaaS Lakehouse",
            "subdomain": "Power BI & Direct Lake",
            "niche": "Power BI Direct Lake Mode",
            "difficulty": "HARD",
            "question": "What is the internal execution path of Power BI Direct Lake mode, and how does it achieve Import mode speeds without data refreshes?",
            "answer": "**Import Mode vs DirectQuery:** Import mode loads data into in-memory VertiPaq columns (fast, but requires hours of scheduled refreshes). DirectQuery sends live SQL queries to the database (slow, high compute cost).\n**Direct Lake Mode:**\n- Bypasses the SQL translation and network serialization layer completely.\n- Power BI's Analysis Services VertiPaq engine reads the Parquet column chunks directly from OneLake into in-memory memory-mapped files.\n- Because Delta Lake Parquet is already columnar, VertiPaq directly maps column pages into memory without transcoding.\n- Yields instant in-memory reporting performance over multi-billion row tables with 0 minutes of data refresh latency.",
            "linked_concept_id": "fabric-onelake"
        },
        {
            "id": "pil08-lakehouse-vs-warehouse-fabric",
            "category": "MICROSOFT FABRIC",
            "domain": "Enterprise SaaS Lakehouse",
            "subdomain": "Engine Architecture",
            "niche": "Engine Comparison & Workloads",
            "difficulty": "MEDIUM",
            "question": "What is the architectural distinction between a Fabric Lakehouse and a Fabric Data Warehouse?",
            "answer": "**1. Fabric Lakehouse:**\n- Primary engine is **Apache Spark** (Python/Scala/R/SQL).\n- Supports unmanaged and managed Delta tables, unstructured files (images, audio), and sub-directories.\n- Optimized for data engineers and data scientists doing ETL, ML, and ad-hoc analytics.\n**2. Fabric Data Warehouse:**\n- Primary engine is the distributed **T-SQL Engine** (derived from SQL Server/Synapse MPP).\n- Supports full ACID transactions, cross-database queries, primary/foreign key constraints, and dynamic data masking.\n- Both write Delta Parquet to OneLake, enabling Spark to read Warehouse tables and T-SQL to query Lakehouse tables seamlessly.",
            "linked_concept_id": "fabric-onelake"
        },
        {
            "id": "pil08-capacity-smoothing-throttling",
            "category": "MICROSOFT FABRIC",
            "domain": "Enterprise SaaS Lakehouse",
            "subdomain": "Capacity & FinOps",
            "niche": "Capacity Units & Governance",
            "difficulty": "HARD",
            "question": "How does Fabric Capacity Smoothing handle heavy computational spikes, and what happens during throttling?",
            "answer": "Fabric compute is measured in Capacity Units (CUs) tied to F-SKUs (e.g. F64 = 64 CUs).\n**Capacity Smoothing:**\n- Evaluates compute consumption in a 24-hour rolling window for background jobs (Spark, Data Factory) and a 10-minute window for interactive queries (Power BI, SQL).\n- Spikes exceeding capacity are 'smoothed' over subsequent hours, allowing large Spark jobs to consume $400\\%$ of nominal capacity without failing.\n**Throttling Stages:**\n1. *Interactive Delay:* Queries experience artificial latency.\n2. *Interactive Rejection:* Power BI reports throw capacity overload errors.\n3. *Background Rejection:* Scheduled pipelines fail to trigger until rolling consumption drops below 100%.",
            "linked_concept_id": "fabric-onelake"
        },
        {
            "id": "pil08-realtime-intelligence-kql",
            "category": "MICROSOFT FABRIC",
            "domain": "Enterprise SaaS Lakehouse",
            "subdomain": "Streaming & Real-Time Intelligence",
            "niche": "Engine Comparison & Workloads",
            "difficulty": "MEDIUM",
            "question": "When should you use a Fabric KQL Database (Eventhouse) instead of a Spark Structured Streaming Lakehouse?",
            "answer": "**Use Fabric KQL (Azure Data Explorer engine):**\n- For high-frequency log, telemetry, IoT, and cybersecurity event streams requiring sub-second query latency.\n- Ingestion to query availability is < 1 second; indexes all text columns automatically with dynamic inverted index.\n- Queries use Kusto Query Language (KQL), which is 10x faster and more concise than SQL for timeseries filtering and regex.\n**Use Spark Lakehouse:** For complex multi-table dimensional joins, relational rollups, and machine learning model training.",
            "linked_concept_id": "fabric-onelake"
        }
    ],
    "09": [
        {
            "id": "pil09-btree-vs-lsm-amplification",
            "category": "DATABASE SYSTEMS",
            "domain": "Database Architecture & Internals",
            "subdomain": "Storage Engines & Indexes",
            "niche": "Storage Engines (B-Tree vs LSM)",
            "difficulty": "HARD",
            "question": "Compare B-Trees vs Log-Structured Merge (LSM) Trees across Read, Write, and Space Amplification.",
            "answer": "**1. B-Tree (PostgreSQL, MySQL InnoDB, SQL Server):**\n- *Write Amplification (High):* In-place updates modify random 8KB disk pages. Updating a 20-byte row writes a full 8KB page + WAL buffer.\n- *Read Amplification (Low):* $O(\\log N)$ point lookups require scanning only a single leaf page.\n- *Space Amplification (Moderate):* Fragmentation and fill-factor (typically 30% empty space).\n**2. LSM-Tree (RocksDB, Cassandra, Bigtable):**\n- *Write Amplification (Low in write path, high in compaction):* Appends to sequential in-memory MemTable and flushes immutable SSTables.\n- *Read Amplification (High):* Must check Bloom filters, MemTable, and multiple SSTable levels.\n- *Space Amplification (Low):* Compact, compressed sequential pages without internal page fragmentation.",
            "linked_concept_id": "database-architecture"
        },
        {
            "id": "pil09-mvcc-isolation-levels",
            "category": "DATABASE SYSTEMS",
            "domain": "Database Architecture & Internals",
            "subdomain": "Concurrency & Transactions",
            "niche": "Concurrency Control & MVCC",
            "difficulty": "HARD",
            "question": "How does Multi-Version Concurrency Control (MVCC) eliminate read-write locking conflicts in relational databases?",
            "answer": "MVCC allows reads to never block writes, and writes to never block reads.\n**Mechanism:**\n- Modifying a row does not overwrite physical data. The database inserts a new row version with metadata tags: `xmin` (creation transaction ID) and `xmax` (deletion/superseding transaction ID).\n- When Transaction $T$ reads, it evaluates an active transaction snapshot.\n- **Snapshot Isolation:** $T$ reads versions where `xmin` is committed before $T$'s start and `xmax` is either uncommitted or created after $T$.\n- **Garbage Collection (VACUUM):** A background worker purges historical row versions once no active transaction's snapshot requires them.",
            "linked_concept_id": "database-architecture"
        },
        {
            "id": "pil09-aries-crash-recovery",
            "category": "DATABASE SYSTEMS",
            "domain": "Database Architecture & Internals",
            "subdomain": "Fault Tolerance & Recovery",
            "niche": "Crash Recovery (ARIES Protocol)",
            "difficulty": "ARCHITECT",
            "question": "Explain the 3 phases of the ARIES crash recovery algorithm: Analysis, Redo, and Undo.",
            "answer": "ARIES (Algorithms for Recovery and Isolation Exploiting Semantics) uses Write-Ahead Logging (WAL) with physiological logging to restore ACID consistency after a sudden power loss.\n1. **Analysis Phase:** Scans WAL forward from the latest checkpoint to reconstruct the Dirty Page Table (pages dirty in RAM at crash) and the Transaction Table (active uncommitted transactions).\n2. **Redo Phase (Repeating History):** Replays all logged changes forward from the oldest un-flushed dirty page (`RecLSN`) to bring the database to the exact state it was in at the instant of the crash, including uncommitted updates.\n3. **Undo Phase:** Scans backward through active uncommitted transactions and executes Compensation Log Records (CLRs) to roll back all incomplete transactions.",
            "linked_concept_id": "database-architecture"
        },
        {
            "id": "pil09-distributed-sharding-vitess",
            "category": "DATABASE SYSTEMS",
            "domain": "Database Architecture & Internals",
            "subdomain": "Distributed Databases & Sharding",
            "niche": "Distributed Consensus & Sharding",
            "difficulty": "ARCHITECT",
            "question": "How does distributed database sharding (e.g. Vitess or Citus) handle cross-shard joins and distributed transactions?",
            "answer": "**Sharding Architecture:** Rows are partitioned across $K$ independent database instances using consistent hashing on a shard key (e.g. `hash(account_id) % K`).\n**Cross-Shard Joins:**\n- Queries filtering by the shard key are routed directly to the single target shard (Single-Shard Query).\n- Cross-shard queries require the query router (`vtgate` in Vitess) to fan out queries to all shards, pull intermediate record batches, and execute a distributed merge join in router memory.\n**Distributed Transactions:** Coordinated via **Two-Phase Commit (2PC)**: Prepare phase (shards vote YES/NO and lock WAL records) followed by Commit phase. Vitess avoids 2PC whenever possible by co-locating related entity tables on identical shard keys.",
            "linked_concept_id": "database-architecture"
        },
        {
            "id": "pil09-raft-consensus-mechanics",
            "category": "DATABASE SYSTEMS",
            "domain": "Database Architecture & Internals",
            "subdomain": "Distributed Consensus",
            "niche": "Distributed Consensus & Sharding",
            "difficulty": "ARCHITECT",
            "question": "How does the Raft consensus algorithm guarantee state machine replication and prevent split-brain?",
            "answer": "Raft decomposes consensus into 3 independent sub-problems:\n1. **Leader Election:** Nodes operate in 3 states: Follower, Candidate, Leader. If a follower misses leader heartbeats, it transitions to candidate, increments term number, and requests votes. Election requires a strict majority quorum ($Q = \\lfloor N/2 \\rfloor + 1$).\n2. **Log Replication:** Leader accepts client writes, appends entry to its log, and sends `AppendEntries` RPC to followers. Once a majority acknowledges, entry is committed.\n3. **Split-Brain Immunity:** Because a leader must hold a strict majority of votes and logs from the highest term, network partitions cannot form two competing majorities; the minority partition stalls writes, guaranteeing linearizable consistency.",
            "linked_concept_id": "database-architecture"
        }
    ],
    "10": [
        {
            "id": "pil10-columnstore-index-internals",
            "category": "RELATIONAL & TRANSACTIONAL SYSTEMS",
            "domain": "SQL Server & Relational Engine",
            "subdomain": "Columnstore Indexes",
            "niche": "Clustered Columnstore Indexes",
            "difficulty": "HARD",
            "question": "Explain the internal architecture of SQL Server Clustered Columnstore Indexes: Rowgroups, Dictionaries, and Delta Stores.",
            "answer": "**Internal Architecture:**\n- **Rowgroups:** Chunks of up to 1,048,576 rows compressed columnar into individual column segments.\n- **Column Segments:** Stores individual column data compressed with dictionary, bit-packing, and run-length encoding.\n- **Delta Store (B-Tree):** Small inserts (< 102,400 rows) are staged in a row-oriented B-tree Delta Store to avoid compressing tiny batches.\n- **Tuple Mover:** Background daemon scans closed Delta Stores (> 100k rows) and compresses them into columnar rowgroups.\n- Yields 10x compression and 100x query speedup on analytical aggregations.",
            "linked_concept_id": "sql-server-mastery"
        },
        {
            "id": "pil10-parameter-sniffing-remediation",
            "category": "RELATIONAL & TRANSACTIONAL SYSTEMS",
            "domain": "SQL Server & Relational Engine",
            "subdomain": "Query Optimizer & Execution Plans",
            "niche": "Parameter Sniffing Remediation",
            "difficulty": "HARD",
            "question": "What is Parameter Sniffing in SQL Server, and what are the 4 production remediation strategies?",
            "answer": "**Problem:** The query optimizer compiles and caches an execution plan based on the parameter value passed on the *first execution*. If the first parameter belongs to a rare customer (1 row), an Index Seek plan is cached. When subsequent queries execute with a common customer (1M rows), the Index Seek plan causes massive bookmark lookup I/O thrashing.\n**Remediation Strategies:**\n1. `OPTION (RECOMPILE)`: Forces plan re-evaluation on every call for variable queries.\n2. `OPTION (OPTIMIZE FOR (@val = 'UNKNOWN'))`: Compiles plan using typical average distribution.\n3. Local Variable Decoupling: Assign `@local_id = @param_id` (forces optimizer to use statistical density vector).\n4. Plan Guides / Query Store Plan Forcing.",
            "linked_concept_id": "sql-server-mastery"
        },
        {
            "id": "pil10-partition-switching-zero-log",
            "category": "RELATIONAL & TRANSACTIONAL SYSTEMS",
            "domain": "SQL Server & Relational Engine",
            "subdomain": "Table Partitioning & ETL",
            "niche": "Partition Switching Patterns",
            "difficulty": "HARD",
            "question": "How does SQL Server Partition Switching achieve instantaneous, zero-logging data archiving?",
            "answer": "Partition switching is a pure metadata pointer swap in the system catalog (`sys.partitions`); zero physical data rows are moved.\n```sql\n-- 1. Create identical staging table on same filegroup with check constraints\nCREATE TABLE Staging_Sales ( ... ) ON SalesFG;\nALTER TABLE Staging_Sales ADD CONSTRAINT chk_date CHECK (SaleDate >= '2026-10-01' AND SaleDate < '2026-11-01');\n\n-- 2. Populate staging table via bulk load\n\n-- 3. Instantaneous metadata switch (< 5 milliseconds):\nALTER TABLE Fact_Sales SWITCH PARTITION 10 TO Staging_Sales;\n```\n**Rules:** Source and target tables must share identical schemas, indexes, filegroups, and check constraints.",
            "linked_concept_id": "sql-server-mastery"
        },
        {
            "id": "pil10-rcsi-tempdb-version-store",
            "category": "RELATIONAL & TRANSACTIONAL SYSTEMS",
            "domain": "SQL Server & Relational Engine",
            "subdomain": "Concurrency & Isolation",
            "niche": "RCSI & Concurrency Control",
            "difficulty": "HARD",
            "question": "How does Read Committed Snapshot Isolation (RCSI) prevent reader-writer deadlocks, and how do you monitor TempDB version store pressure?",
            "answer": "**Mechanism:** `ALTER DATABASE db SET READ_COMMITTED_SNAPSHOT ON;`\nReaders read committed row versions from the **TempDB Version Store** rather than acquiring shared read locks (`S-locks`). Writers update rows and generate version records in TempDB, eliminating all reader-writer deadlocks.\n**TempDB Pressure:** Heavy update workloads fill TempDB version store space.\n**Monitoring:**\n```sql\nSELECT \n  SUM(version_store_reserved_page_count) * 8 / 1024 AS version_store_mb\nFROM sys.dm_db_file_space_usage;\n```",
            "linked_concept_id": "sql-server-mastery"
        },
        {
            "id": "pil10-execution-plan-dmv-diagnostics",
            "category": "RELATIONAL & TRANSACTIONAL SYSTEMS",
            "domain": "SQL Server & Relational Engine",
            "subdomain": "Performance Tuning & Diagnostics",
            "niche": "Query Optimizer & Execution Plans",
            "difficulty": "MEDIUM",
            "question": "How do you detect missing indexes and high-cost queries using SQL Server Dynamic Management Views (DMVs)?",
            "answer": "```sql\n-- Find top queries by CPU consumption with cached query plans\nSELECT TOP 5 \n  qs.total_worker_time / qs.execution_count AS avg_cpu,\n  SUBSTRING(st.text, (qs.statement_start_offset/2)+1, ((qs.statement_end_offset/2)+1)) AS query_text,\n  qp.query_plan\nFROM sys.dm_exec_query_stats qs\nCROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) st\nCROSS APPLY sys.dm_exec_query_plan(qs.plan_handle) qp\nORDER BY avg_cpu DESC;\n```",
            "linked_concept_id": "sql-server-mastery"
        }
    ],
    "11": [
        {
            "id": "pil11-cpython-gc-memory",
            "category": "SOFTWARE ENGINEERING & PIPELINES",
            "domain": "Python for Data Engineering",
            "subdomain": "CPython Internals & Garbage Collection",
            "niche": "CPython Memory & Cyclic GC",
            "difficulty": "HARD",
            "question": "How does CPython manage memory, and how do cyclic references trigger GC pauses in long-running pipelines?",
            "answer": "CPython relies primarily on **Reference Counting**.\n- Every object has an `ob_refcnt`. When reference count drops to 0, memory is immediately deallocated.\n**Cyclic References:** Object A points to Object B, and B points to A. When external references are removed, ref counts remain 1, leaking memory.\n**Generational GC (Generations 0, 1, 2):**\n- Scans reference graphs periodically using double-linked lists to detect isolated cycles.\n- *Pipeline Trap:* High-throughput streaming loops generating millions of cyclic objects trigger frequent Gen-2 full GC sweeps, pausing the Python process.\n- *Remediation:* Break cycles using `weakref`, invoke `gc.collect()` at end of micro-batches, or disable GC during tight loops.",
            "linked_concept_id": "python-data-engineering"
        },
        {
            "id": "pil11-pyarrow-zero-copy-ipc",
            "category": "SOFTWARE ENGINEERING & PIPELINES",
            "domain": "Python for Data Engineering",
            "subdomain": "Arrow & Columnar Memory",
            "niche": "Arrow Memory & Zero-Copy IPC",
            "difficulty": "ARCHITECT",
            "question": "How does Apache Arrow implement zero-copy data sharing between Python processes and external engines?",
            "answer": "Traditional Python multiprocessing serializes data into bytes via `pickle`, pipes it over IPC sockets, and deserializes it in worker processes, incurring heavy CPU and memory overhead.\n**Apache Arrow Zero-Copy:**\n- Standardizes columnar in-memory data representation (RecordBatches).\n- Writes Arrow buffers into shared memory (`/dev/shm` or POSIX `mmap`).\n- Worker processes map the memory address directly into their virtual address space. Reading a column access pointers in shared memory with **0 serialization, 0 copying, and 0 memory duplication**.",
            "linked_concept_id": "python-data-engineering"
        },
        {
            "id": "pil11-polars-lazy-evaluation",
            "category": "SOFTWARE ENGINEERING & PIPELINES",
            "domain": "Python for Data Engineering",
            "subdomain": "High-Performance DataFrames",
            "niche": "Polars vs Pandas 2.0 Engine",
            "difficulty": "HARD",
            "question": "Why is Polars significantly faster than Pandas 2.0 for single-node ETL pipelines?",
            "answer": "1. **Written in Rust:** Native machine code execution with zero GIL lock contention.\n2. **LazyFrame Optimization:** Constructs a logical query graph and applies Catalyst-like optimizations: predicate pushdown, projection pushdown, and type coercion before execution.\n3. **Multithreaded Parallelism:** Divides tasks across all available CPU cores using the Rayon work-stealing thread pool.\n4. **Arrow-Native Memory:** Directly implements Apache Arrow format for SIMD vectorization and cache locality.",
            "linked_concept_id": "python-data-engineering"
        },
        {
            "id": "pil11-asyncio-vs-multiprocessing",
            "category": "SOFTWARE ENGINEERING & PIPELINES",
            "domain": "Python for Data Engineering",
            "subdomain": "Concurrency & Concurrency Models",
            "niche": "Concurrency & Subprocesses",
            "difficulty": "MEDIUM",
            "question": "When should you use asyncio versus multiprocessing for high-throughput API extraction in Python?",
            "answer": "**`asyncio` (Network/IO-Bound):**\n- Single-threaded event loop utilizing non-blocking sockets (`aiohttp`, `asyncpg`).\n- Can sustain 10,000+ concurrent HTTP connections with tiny memory footprint (~2KB per task).\n- Ideal for REST API data extractors and webhook listeners.\n**`multiprocessing` (CPU-Bound):**\n- Bypasses the Global Interpreter Lock (GIL) by spawning separate OS processes with dedicated Python interpreters.\n- Ideal for CPU-intensive data transformations, JSON compression, and cryptographic hashing.",
            "linked_concept_id": "python-data-engineering"
        },
        {
            "id": "pil11-rust-pyo3-extensions",
            "category": "SOFTWARE ENGINEERING & PIPELINES",
            "domain": "Python for Data Engineering",
            "subdomain": "Native Extensions & Speed",
            "niche": "Arrow Memory & Zero-Copy IPC",
            "difficulty": "ARCHITECT",
            "question": "How do you author custom Rust extensions using PyO3 to accelerate performance-critical Python data transformations?",
            "answer": "PyO3 exposes Rust functions and structs as native Python modules.\n```rust\nuse pyo3::prelude::*;\n\n#[pyfunction]\nfn compute_checksum(data: &[u8]) -> PyResult<u32> {\n    Ok(crc32fast::hash(data))\n}\n\n#[pymodule]\nfn fast_de(m: &Bound<'_, PyModule>) -> PyResult<()> {\n    m.add_function(wrap_pyfunction!(compute_checksum, m)?)?;\n    Ok(())\n}\n```\nCompiled into a native `.so` wheel using `maturin`. It runs at bare-metal C/Rust speed, bypasses the GIL, and integrates seamlessly into existing Python pipelines.",
            "linked_concept_id": "python-data-engineering"
        }
    ],
    "12": [
        {
            "id": "pil12-scd-complete-taxonomy",
            "category": "DATA MODELING & TRANSFORMATION",
            "domain": "Data Warehousing & Architecture",
            "subdomain": "Dimensional Modeling",
            "niche": "SCD Types 1-6 Architecture",
            "difficulty": "HARD",
            "question": "Provide a complete architectural comparison of Slowly Changing Dimension (SCD) Types 1, 2, 3, 4, and 6.",
            "answer": "**Type 1 (Overwrite):** Overwrites historical data. Zero history, updates in-place.\n**Type 2 (Historical Rows):** Inserts a new row for each change with `start_date`, `end_date`, and `is_current` flag. Preserves infinite history.\n**Type 3 (Previous Column):** Adds a column `previous_address` to store the immediate predecessor state.\n**Type 4 (History Table):** Base dimension keeps current state (Type 1); historical changes are written to a separate `dim_customer_history` table.\n**Type 6 (Hybrid 1 + 2 + 3):** Combines historical rows (Type 2) with a current attribute column (Type 1) across all historical records, enabling both point-in-time and current-state reporting from a single table.",
            "linked_concept_id": "data-modeling"
        },
        {
            "id": "pil12-data-vault-2-internals",
            "category": "DATA MODELING & TRANSFORMATION",
            "domain": "Data Warehousing & Architecture",
            "subdomain": "Data Vault 2.0",
            "niche": "Data Vault 2.0 Modeling",
            "difficulty": "HARD",
            "question": "How does Data Vault 2.0 use Hash Keys to eliminate ETL loading dependencies between Hubs, Links, and Satellites?",
            "answer": "In traditional Data Vault 1.0, hubs generated integer surrogate keys (sequences), forcing links to wait for hubs to load before foreign keys could be resolved.\n**Data Vault 2.0 (Hash Keys):**\n- Replaces surrogate keys with cryptographic hashes (MD5 or SHA-256) of business keys: `HK_Customer = SHA256(UPPER(TRIM(tenant_id)) || '|' || UPPER(TRIM(customer_id)))`.\n- Because hashes are deterministic and calculated in parallel, Hubs, Links, and Satellites can be loaded **simultaneously in parallel** with zero ETL dependency bottlenecks.",
            "linked_concept_id": "data-modeling"
        },
        {
            "id": "pil12-cdc-debezium-outbox",
            "category": "DATA MODELING & TRANSFORMATION",
            "domain": "Data Warehousing & Architecture",
            "subdomain": "Change Data Capture (CDC)",
            "niche": "Change Data Capture (CDC)",
            "difficulty": "ARCHITECT",
            "question": "How does the Transactional Outbox Pattern combined with Debezium CDC prevent dual-write data inconsistency?",
            "answer": "**The Dual-Write Problem:** Microservice writes to relational DB and publishes to Kafka. If Kafka fails after the DB commits, data is lost; if the DB fails after publishing, phantom events are created.\n**Transactional Outbox Pattern:**\n1. The business transaction writes business entity records and writes an event payload into an `outbox_table` inside the **same local ACID database transaction**.\n2. **Debezium CDC:** Reads database transaction log (WAL / binlog) and extracts outbox table inserts into Kafka.\n3. Eliminates dual-write inconsistencies with guaranteed at-least-once delivery.",
            "linked_concept_id": "data-modeling"
        },
        {
            "id": "pil12-star-vs-snowflake-vs-obt",
            "category": "DATA MODELING & TRANSFORMATION",
            "domain": "Data Warehousing & Architecture",
            "subdomain": "Warehouse Schema Design",
            "niche": "Dimensional Modeling (Kimball)",
            "difficulty": "MEDIUM",
            "question": "Compare Star Schema vs Snowflake Schema vs One Big Table (OBT) in modern cloud data warehouses.",
            "answer": "**1. Star Schema (Kimball):** De-normalized dimensions surrounding fact tables. Clean semantic model, fast query joins, balanced storage.\n**2. Snowflake Schema:** Normalized dimensions (sub-dimensions branched out). Minimizes storage redundancy, but increases join overhead.\n**3. One Big Table (OBT):** Completely pre-joined denormalized table with 100+ columns. Zero joins, blazing query performance on columnar engines (BigQuery/ClickHouse/Snowflake), at the cost of higher storage and complex update synchronization.",
            "linked_concept_id": "data-modeling"
        },
        {
            "id": "pil12-bitemporal-data-modeling",
            "category": "DATA MODELING & TRANSFORMATION",
            "domain": "Data Warehousing & Architecture",
            "subdomain": "Advanced Temporal Modeling",
            "niche": "SCD Types 1-6 Architecture",
            "difficulty": "ARCHITECT",
            "question": "What is Bi-Temporal Data Modeling, and why is it mandatory for regulated financial risk engines?",
            "answer": "Bi-Temporal modeling tracks two distinct timelines for every record:\n1. **Valid Time (Business Time):** The time window during which the event was true in the real world (`valid_from`, `valid_to`).\n2. **Transaction Time (System Time):** The time window during which the record was physically stored in the database system (`system_from`, `system_to`).\n**Financial Audit Use Case:** A risk calculation executed on March 31st must be reproducible on December 31st, *even if retroactive corrections were entered in July*. System time allows querying the database exactly as it existed on March 31st.",
            "linked_concept_id": "data-modeling"
        }
    ],
    "13": [
        {
            "id": "pil13-vertipaq-engine-compression",
            "category": "BI & DATA SERVING",
            "domain": "Data Serving & Visualization",
            "subdomain": "VertiPaq Engine Internals",
            "niche": "VertiPaq Engine Internals",
            "difficulty": "HARD",
            "question": "How does the Power BI VertiPaq engine compress tabular data using Dictionary, Value, and Run-Length Encoding?",
            "answer": "VertiPaq achieves up to 10x-20x in-memory compression through 3 sequential encoding phases:\n1. **Value Encoding:** Subtracks the minimum value from integer columns to reduce bit-width (e.g. values $1001-1005$ store integers $1-5$, requiring 3 bits instead of 32 bits).\n2. **Dictionary Encoding:** Replaces strings with compact integer IDs and maintains an alphabetical dictionary.\n3. **Run-Length Encoding (RLE):** Compresses repeated adjacent values into `(Value, Count)` pairs. Sorting the table by high-frequency columns prior to compression maximizes RLE efficiency.",
            "linked_concept_id": "power-bi-serving"
        },
        {
            "id": "pil13-dax-context-transition",
            "category": "BI & DATA SERVING",
            "domain": "Data Serving & Visualization",
            "subdomain": "DAX Calculation Engine",
            "niche": "DAX Context Transition",
            "difficulty": "HARD",
            "question": "Explain DAX Context Transition and how CALCULATE() mutates Row Context into Filter Context.",
            "answer": "**Row Context:** Iterates row by row (e.g. inside `SUMX` or calculated columns); aware only of the current row's values, but does not filter the model.\n**Filter Context:** The active set of filters applied by slicers, report visuals, and DAX filters that restrict data across table relationships.\n**Context Transition:** When `CALCULATE()` (or a measure reference) is evaluated inside an existing Row Context, it automatically transforms all column values of the current row into an equivalent Filter Context, filtering related tables along active relationships.",
            "linked_concept_id": "power-bi-serving"
        },
        {
            "id": "pil13-composite-models-aggregations",
            "category": "BI & DATA SERVING",
            "domain": "Data Serving & Visualization",
            "subdomain": "Composite Models & Optimization",
            "niche": "Aggregation Tables & Composite Models",
            "difficulty": "HARD",
            "question": "How do Power BI Composite Models and Aggregation Tables eliminate DirectQuery latency on 100-billion row fact tables?",
            "answer": "Composite models allow mixing in-memory **Import mode** tables with live **DirectQuery** tables in the same model.\n**Aggregation Tables:**\n- Pre-aggregate the billion-row fact table to a coarse grain (e.g. `Year`, `Month`, `Store_ID`, `Sum(Sales)`).\n- Load the aggregation table in fast in-memory Import mode.\n- Map the aggregation table to the underlying DirectQuery detail table in Power BI relationship properties.\n- *Query Routing:* High-level dashboard queries hit the in-memory aggregation table (sub-second); detail drill-through queries automatically fall back to DirectQuery SQL.",
            "linked_concept_id": "power-bi-serving"
        },
        {
            "id": "pil13-xmla-endpoints-partitioning",
            "category": "BI & DATA SERVING",
            "domain": "Data Serving & Visualization",
            "subdomain": "Enterprise BI Operations",
            "niche": "Incremental Refresh & Partitioning",
            "difficulty": "HARD",
            "question": "How do XMLA endpoints enable programmatic partition refresh and deployment automation in Power BI Premium?",
            "answer": "Power BI Premium workspaces expose read/write **XMLA endpoints** identical to SQL Server Analysis Services (SSAS).\n- Data engineers use tools like Tabular Editor, PowerShell, or Azure Data Factory to connect to `powerbi://api.powerbi.com/v1.0/myorg/WorkspaceName`.\n- **Micro-Partition Refresh:** Instead of refreshing the entire semantic model, pipelines execute TMSL (Tabular Model Scripting Language) to refresh only the single daily partition: `{\"refresh\": {\"type\": \"full\", \"partition\": \"FactSales_20261118\"}}`.",
            "linked_concept_id": "power-bi-serving"
        },
        {
            "id": "pil13-rls-upn-dynamic-security",
            "category": "BI & DATA SERVING",
            "domain": "Data Serving & Visualization",
            "subdomain": "Security & Fine-Grained Access",
            "niche": "Row-Level Security Architecture",
            "difficulty": "MEDIUM",
            "question": "How do you implement Dynamic Row-Level Security (RLS) in Power BI using USERPRINCIPALNAME()?",
            "answer": "1. Create an `EmployeeSecurity` table mapping Azure AD emails to authorized branch IDs (`UserEmail`, `BranchID`).\n2. Establish a 1-to-many relationship from `EmployeeSecurity` to `Dim_Branch` with cross-filter direction set to 'Single' or 'Both'.\n3. Define an RLS Role in Power BI modeling tab:\n```dax\n[UserEmail] = USERPRINCIPALNAME()\n```\nWhen a user opens the report, `USERPRINCIPALNAME()` extracts their authenticated Azure AD identity, filters `Dim_Branch`, and cascades down to restrict fact table rows dynamically.",
            "linked_concept_id": "power-bi-serving"
        }
    ],
    "14": [
        {
            "id": "pil14-multitenant-lakehouse-isolation",
            "category": "SYSTEM DESIGN AT SCALE",
            "domain": "Enterprise Architecture & System Design",
            "subdomain": "Multi-Tenancy & Isolation",
            "niche": "Multi-Tenant Lakehouse Architecture",
            "difficulty": "ARCHITECT",
            "question": "How do you architect a multi-tenant Lakehouse serving 10,000 corporate clients balancing cost, data isolation, and query performance?",
            "answer": "**Tiered Multi-Tenant Architecture:**\n1. **Storage Isolation (Bronze/Silver):** Store multi-tenant data in shared tables partitioned physically by `tenant_id` or clustered via Liquid Clustering. Encrypt with tenant-specific keys or envelope encryption.\n2. **Access Isolation (Unity Catalog):** Implement dynamic row filtering (`WHERE tenant_id = current_user_tenant()`) so tenants can never query each other's data.\n3. **Compute Isolation (Gold/VIP Tenants):** High-tier enterprise clients receive dedicated serverless compute endpoints to prevent noisy-neighbor query starvation; standard tenants share autoscaling serverless SQL pools.",
            "linked_concept_id": "system-design"
        },
        {
            "id": "pil14-realtime-feature-store-design",
            "category": "SYSTEM DESIGN AT SCALE",
            "domain": "Enterprise Architecture & System Design",
            "subdomain": "Machine Learning Platforms",
            "niche": "Real-Time Feature Store Architecture",
            "difficulty": "ARCHITECT",
            "question": "Design a high-throughput, dual-storage Real-Time Feature Store achieving sub-10ms point lookups and point-in-time training reproducibility.",
            "answer": "**Dual-Storage Feature Store Architecture:**\n1. **Online Store (Low-Latency Serving):** Backed by Redis Cluster or AWS DynamoDB. Spark Streaming writes aggregated features (e.g. `user_clicks_last_10m`) into Redis key-value pairs, serving real-time model inference in < 5ms.\n2. **Offline Store (Historical Training):** Backed by Delta Lake / Iceberg tables. Stores complete historical feature logs with timestamps.\n3. **Point-in-Time Correctness:** Feature store joins training labels with feature state using an as-of join (`time_travel`), preventing future data leakage into ML models.",
            "linked_concept_id": "system-design"
        },
        {
            "id": "pil14-lakehouse-finops-autoscaling",
            "category": "SYSTEM DESIGN AT SCALE",
            "domain": "Enterprise Architecture & System Design",
            "subdomain": "FinOps & Cloud Economics",
            "niche": "Lakehouse FinOps & Cost Engineering",
            "difficulty": "HARD",
            "question": "What architectural strategies reduce cloud compute spend by 40% in enterprise Spark/Databricks deployments?",
            "answer": "1. **Aggressive Auto-Termination:** Set cluster auto-termination to 10-15 minutes on interactive developer clusters.\n2. **Spot / Preemptible Instance Fallback:** Configure worker pools with 70% Spot instances and 30% On-Demand instances, with auto-fallback on Spot reclamation.\n3. **Job Clusters Over All-Purpose Clusters:** Never run production ETL on all-purpose clusters; job clusters are billed at 50% lower DBU rates.\n4. **Photon ROI Gating:** Enable Photon strictly on I/O-heavy, vectorized join/aggregation queries; disable on simple Python/UDF workloads.\n5. **Serverless SQL Warehouses:** Automatically scales down to 0 instances when idle.",
            "linked_concept_id": "system-design"
        },
        {
            "id": "pil14-event-sourcing-cqrs-lakehouse",
            "category": "SYSTEM DESIGN AT SCALE",
            "domain": "Enterprise Architecture & System Design",
            "subdomain": "Event-Driven Architecture",
            "niche": "Event Sourcing & CQRS Lakehouses",
            "difficulty": "ARCHITECT",
            "question": "How do you implement Command Query Responsibility Segregation (CQRS) and Event Sourcing using Kafka and Delta Lake?",
            "answer": "**Event Sourcing:** Store state changes as an immutable sequence of events (`OrderCreated`, `PaymentAuthorized`, `OrderShipped`) in Kafka and append to Bronze Delta Lake.\n**CQRS Separation:**\n- **Command Side (Write):** Microservices validate business rules and append events to Kafka.\n- **Query Side (Read Projection):** Spark Structured Streaming consumes events from Kafka, builds denormalized read-optimized materialized views in Silver/Gold Delta tables, and indexes them for BI and API queries.",
            "linked_concept_id": "system-design"
        },
        {
            "id": "pil14-enterprise-data-lineage-framework",
            "category": "SYSTEM DESIGN AT SCALE",
            "domain": "Enterprise Architecture & System Design",
            "subdomain": "Metadata & Lineage Governance",
            "niche": "End-to-End Lineage Governance",
            "difficulty": "ARCHITECT",
            "question": "How does automated column-level data lineage operate in modern catalogs like Unity Catalog and Apache Atlas?",
            "answer": "**Mechanism:**\n1. During query planning and Whole-Stage Codegen, Catalyst traces the transformation expression graph linking output attributes to input source columns.\n2. When Spark writes to storage, Catalyst extracts the lineage DAG: `TargetTable.ColumnA = Expression(SourceTable1.ColX, SourceTable2.ColY)`.\n3. Lineage metadata is dispatched asynchronously to the catalog metastore (Unity Catalog / OpenLineage / Atlas) without adding latency to query execution.\n4. Enables instant upstream root-cause impact analysis and automated PII compliance tracking.",
            "linked_concept_id": "system-design"
        }
    ]
}
