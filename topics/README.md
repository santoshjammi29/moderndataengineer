# 🧠 Curriculum Topics Directory — 921 Topics Covered

> **Curriculum Scope**: **921 Production Topics** verified against real-world lakehouse internals, query engines, and distributed architectures.
> **Organization**: Grouped by **Relevant Functional Sections** and then by **Difficulty Level**.
> **Navigation**: All sections are **collapsible and collapsed by default** for rapid scanning.
> **Live Web Hub**: Explore interactive search and mindmaps at [moderndataengineer.uk/concepts](https://moderndataengineer.uk/concepts).

---

## 📑 Topics Directory at a Glance

| Pillar / Module | Topics | Functional Sections Covered | Status |
|:---|:---:|:---|:---:|
| ⚡ **Apache Spark & Distributed Compute Engine** | **135** | Catalyst Optimizer & Execution Plans, Memory Management & Tungsten Engine, Partitioning, Shuffling & Skew Mitigation, and 3 more | ✅ Collapsible Deck |
| ⚡ **Databricks Platform, Unity Catalog & Delta Lake 3.x** | **132** | Unity Catalog 3-Tier Governance & Security, Delta Lake 3.x ACID Mechanics & Transaction Log, Physical Layout, Liquid Clustering & Deletion Vectors, and 2 more | ✅ Collapsible Deck |
| ⚡ **Relational SQL, Query Optimization & Transaction Engine** | **91** | Query Execution Plans & Optimization, Window Functions & Analytical Framing, CTEs, Recursion & Set Operations, and 2 more | ✅ Collapsible Deck |
| 🏛️ **Database Architecture, Distributed Sharding & Cloud MPP** | **79** | Distributed Consensus & Replication, Storage Engines, LSM & B-Trees, Sharding, Partitioning & Traffic Control, and 1 more | ✅ Collapsible Deck |
| 🌊 **Real-Time Streaming Lakehouse, CDC & Table Formats** | **76** | Open Table Formats (Iceberg, Delta, Hudi), Real-Time Streaming & Watermarking, Engine Vectorization & Hardware Acceleration, and 1 more | ✅ Collapsible Deck |
| 🌊 **Modern Data Lake Architecture, Storage Layouts & Formats** | **55** | Cloud Object Storage & Prefix Optimization, Columnar & Row Storage Formats (Parquet/ORC/Avro), Storage Compaction, Pruning & Data Layout | ✅ Collapsible Deck |
| 🏛️ **Distributed Systems Design & Fault Tolerance** | **68** | Distributed Theorems & Trade-Offs, Fault Tolerance, Rate Limiting & High Availability, Caching Topologies & Synchronization, and 1 more | ✅ Collapsible Deck |
| 🛠️ **dbt Core, Analytics Engineering & Semantic Modeling** | **57** | Project Architecture & Modeling Primitives, Incremental Materialization & Microbatch, Contracts, Testing & Governance, and 1 more | ✅ Collapsible Deck |
| 🌪️ **Apache Airflow & Pipeline Orchestration** | **52** | Core Engine & Decoupled Scheduler, DAG Authoring, Dynamic Task Mapping & Operators, Orchestration Resiliency, Datasets & Connections | ✅ Collapsible Deck |
| ⚡ **Microsoft Fabric & OneLake Architecture** | **39** | OneLake & Cross-Cloud Shortcuts, Direct Lake Mode & Semantic Models, Workload Engines, F-SKU Capacities & Governance | ✅ Collapsible Deck |
| 🔄 **Azure Data Factory (ADF) & Resilient Orchestration** | **27** | Control Flow, Pipelines & Parameterization, Integration Runtimes (Azure IR / Self-Hosted IR), Data Movement, Managed VNets & Security | ✅ Collapsible Deck |
| 📊 **Power BI & VertiPaq Analytics Engine** | **25** | VertiPaq Engine & Columnar Compression, DAX Evaluation Context & Calculations, Composite Models, Semantic Refresh & Aggregations | ✅ Collapsible Deck |
| 🐍 **Python & Vectorized Data Engineering Primitives** | **22** | CPython Internals & Memory Architecture, Vectorized & In-Memory IPC (Arrow / Polars), Language Idioms, Generators & Type Contracts | ✅ Collapsible Deck |
| 🚀 **General Data Engineering, Dimensional Modeling & Governance** | **63** | Dimensional Modeling & Kimball Standards, ETL Architecture, CDC & Idempotency | ✅ Collapsible Deck |

---

## 📚 Comprehensive Topic Specifications (Grouped by Section & Difficulty)

<details>
<summary><b>⚡ Apache Spark & Distributed Compute Engine (135 Topics across 6 Sections)</b> — <i>Click to expand module</i></summary>

<details>
<summary>&nbsp;&nbsp;📂 <b>Section: Catalyst Optimizer & Execution Plans (24 Topics)</b> — <i>Click to expand functional domain</i></summary>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟢 Easy: <b>🟢 Easy (Level 100) (2 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Managed vs External Tables** | `🟢 Easy` | Catalog table definitions specifying whether Spark manages both the metadata and the physical storage data. |
| 2 | **Temp Views & Global Temp Views** | `🟢 Easy` | Session-scoped and cluster-scoped virtual tables that provide temporary SQL query interfaces over DataFrames without persisting physical data files to storage. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟡 Intermediate: <b>🟡 Intermediate (Level 200) (8 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Adaptive Query Execution (AQE)** | `🟡 Intermediate` | An optimization framework that dynamically adjusts Spark physical execution plans during runtime based on intermediate stage statistics. |
| 2 | **Catalyst Optimizer** | `🟡 Intermediate` | The core query optimization engine powering Spark SQL and the DataFrame API. |
| 3 | **DAG & RDD Lineage** | `🟡 Intermediate` | The logical execution graph tracking all transformations applied to a dataset to enable fault-tolerance. |
| 4 | **DAG Scheduler** | `🟡 Intermediate` | The high-level scheduling layer in Apache Spark that converts a logical DAG of RDD transformations into a physical execution plan of stages. |
| 5 | **EXPLAIN Plan (Spark Query Plan)** | `🟡 Intermediate` | A Spark debugging tool that displays the logical and physical execution plan for a DataFrame or SQL query, enabling engineers to verify optimisations, diagnose performance issues, and understand data flow. |
| 6 | **Join Strategies** | `🟡 Intermediate` | The physical execution algorithms selected by the Catalyst optimizer for distributed table joins, including Broadcast Hash Join (BHJ), Sort-Merge Join (SMJ), and Shuffle Hash Join (SHJ). |
| 7 | **Shuffle Operations** | `🟡 Intermediate` | The distributed physical data redistribution process across cluster executor nodes triggered by wide transformations such as `groupBy()`, `join()`, `distinct()`, and `repartition()`. |
| 8 | **UDFs vs. Native Functions** | `🟡 Intermediate` | The architectural trade-offs between native Catalyst expressions and custom Python UDFs, highlighting serialization overhead, memory penalties, and whole-stage code generation boundaries. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🔴 Advanced: <b>🔴 Advanced (Level 300) (8 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **BroadcastNestedLoopJoin Anti-Pattern** | `🔴 Advanced` | The most dangerous physical join operator in Apache Spark, executing an $O(M \times N)$ Cartesian product comparison when equi-join conditions are missing. |
| 2 | **Catalyst Optimizer — Analysis Phase** | `🔴 Advanced` | The first phase of Spark's Catalyst Optimizer where unresolved logical plans are validated against the catalog to produce a resolved logical plan. |
| 3 | **Catalyst Optimizer — Physical Planning** | `🔴 Advanced` | The phase of Spark's Catalyst Optimizer that selects the most efficient physical execution strategy from multiple candidate plans using a cost model. |
| 4 | **Photon Execution Engine** | `🔴 Advanced` | Databricks' native vectorised query execution engine written in C++, replacing Spark's JVM-based Whole-Stage CodeGen for SQL and DataFrame workloads to deliver significantly higher throughput. |
| 5 | **PySpark Actions vs Transformations: Lazy Evaluation and Driver OOM** | `🔴 Advanced` | The foundational execution boundary in Apache Spark separating lazily evaluated DAG construction (Transformations) from physical execution triggers (Actions), along with memory safety guardrails. |
| 6 | **Spark Partitioning vs. Bucketing Architecture** | `🔴 Advanced` | The two primary storage organization techniques in Apache Spark that govern physical directory layouts, file pruning, and shuffle elimination. |
| 7 | **Tungsten Engine** | `🔴 Advanced` | Spark's physical execution optimizer that manages memory directly using raw off-heap byte arrays. |
| 8 | **Whole-Stage Code Generation (Tungsten)** | `🔴 Advanced` | Collapsing an entire physical query execution stage of multiple operators into a single optimized Java bytecode loop. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟣 Architect: <b>🟣 Staff Architect (Level 400) (6 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Adaptive Query Execution (AQE) Runtime Optimization** | `🟣 Architect` | Dynamic query re-optimization framework in Apache Spark inspecting physical shuffle statistics at stage boundaries to re-plan execution plans on the fly. |
| 2 | **AQE Query Stage Re-Optimization Boundaries** | `🟣 Architect` | The runtime execution boundaries in Apache Spark where completed shuffle stages materialize partition statistics, enabling the catalyst optimizer to dynamically alter downstream physical plans. |
| 3 | **Post-Shuffle Partition Coalescing** | `🟣 Architect` | An automated runtime optimization in Spark AQE that aggregates small contiguous shuffle partitions into larger logical partitions to minimize driver scheduling overhead. |
| 4 | **Spark Connect Architecture & Decoupled Python Drivers** | `🟣 Architect` | A decoupled client-server architecture in Apache Spark 3.4+ that transmits unresolved logical query plans via gRPC protocol buffers from a lightweight Python client to a remote Spark server. |
| 5 | **Spark DataFrame API: Catalyst Optimizer and Project Tungsten** | `🟣 Architect` | The high-level declarative query interface in Apache Spark that achieves superior throughput and memory efficiency over RDDs through automated Catalyst query planning and Tungsten byte-code generation. |
| 6 | **Spark Memory Management: Off-Heap, Storage vs Execution Dynamics** | `🟣 Architect` | The internal physical memory layout of a Spark JVM executor governed by UnifiedMemoryManager and Project Tungsten. |

</details>

</details>

<details>
<summary>&nbsp;&nbsp;📂 <b>Section: Memory Management & Tungsten Engine (26 Topics)</b> — <i>Click to expand functional domain</i></summary>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟡 Intermediate: <b>🟡 Intermediate (Level 200) (5 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Broadcast Variable** | `🟡 Intermediate` | A Spark mechanism to efficiently distribute a read-only value (e.g., a lookup table or configuration map) to every executor once, stored in executor memory for reuse across all tasks. |
| 2 | **Cache vs Persist Operations** | `🟡 Intermediate` | DataFrame operations used to store intermediate execution results in memory or disk to avoid recalculations. |
| 3 | **Reading the Spark UI** | `🟡 Intermediate` | The web-based performance monitoring and telemetry dashboard used to inspect execution plans, identify straggler tasks, detect memory spill, and profile shuffle I/O across Spark Jobs, Stages, and SQL DAGs. |
| 4 | **Shuffle Hash Join vs. Sort Merge Join** | `🟡 Intermediate` | The architectural trade-offs between sorting keys on disk (SMJ) versus building in-memory hash tables across partitions (SHJ). |
| 5 | **Storage Level: MEMORY_AND_DISK** | `🟡 Intermediate` | A Spark cache storage level that stores partitions in JVM heap memory and spills remaining partitions to local executor disk if memory is insufficient. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🔴 Advanced: <b>🔴 Advanced (Level 300) (15 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Executor Memory Overhead** | `🔴 Advanced` | The amount of non-heap off-JVM memory reserved per executor for native processes, Python workers, and JVM internal overhead, separate from spark.executor.memory. |
| 2 | **G1GC Garbage Collector in Spark** | `🔴 Advanced` | The Garbage-First (G1) GC is the recommended JVM garbage collector for Spark executors, offering predictable pause times and better heap region management than the older ParallelGC. |
| 3 | **G1GC Garbage Collector Tuning in Spark** | `🔴 Advanced` | Configuring the Garbage-First Garbage Collector (`-XX:+UseG1GC`) for low-pause heap reclamation in large Spark executors. |
| 4 | **Memory Management & Spill** | `🔴 Advanced` | The Spark Unified Memory architecture that dynamically shares RAM between Execution (shuffles/joins) and Storage (caching), spilling in-memory buffers to disk when executor memory limits are exceeded. |
| 5 | **Memory Spill to Disk** | `🔴 Advanced` | A performance degradation state where Spark runs out of executor RAM and writes execution buffers to disk. |
| 6 | **Off-Heap Memory** | `🔴 Advanced` | Memory allocated outside the JVM heap using native OS memory, bypassing garbage collection entirely and managed explicitly by Project Tungsten's memory manager. |
| 7 | **Shuffle Hash Join (SHJ)** | `🔴 Advanced` | A Spark join strategy that shuffles both tables by join key and builds an in-memory hash table from the smaller side of each partition to probe with the larger side. |
| 8 | **Small File Problem** | `🔴 Advanced` | A performance anti-pattern where a Delta/Parquet table accumulates thousands of tiny files, causing excessive file listing overhead, driver memory pressure during metadata operations, and poor read throughput. |
| 9 | **Spark Executor Memory Overhead Sizing** | `🔴 Advanced` | Allocating native off-heap memory via `spark.executor.memoryOverhead` for PyArrow, C++ libraries, and OS buffers. |
| 10 | **Spark Tungsten Off-Heap Memory Model** | `🔴 Advanced` | Project Tungsten's memory management system that allocates binary row representations directly in C-style off-heap memory using sun.misc.Unsafe. |
| 11 | **Spill to Disk** | `🔴 Advanced` | The mechanism by which Spark writes in-progress shuffle or sort buffers to executor local disk when execution memory is insufficient to hold all intermediate records. |
| 12 | **Stream-Stream Joins** | `🔴 Advanced` | A bidirectional stateful join between two continuous real-time data streams requiring event-time watermarking and time-interval constraints on both sides to bound in-memory state buffer growth. |
| 13 | **Tungsten Binary Row Format (UnsafeRow)** | `🔴 Advanced` | Apache Spark's off-heap binary row format that stores data as raw bytes using sun.misc.Unsafe, bypassing JVM object overhead and enabling cache-efficient processing. |
| 14 | **Watermarks & Late Data** | `🔴 Advanced` | A streaming state management mechanism (`withWatermark()`) that specifies the maximum allowable delay for incoming events, permitting Spark to evict expired state from memory. |
| 15 | **Whole-Stage Code Generation** | `🔴 Advanced` | A Project Tungsten optimisation that compiles an entire pipeline of Spark operators into a single Java function, eliminating virtual function dispatch overhead and enabling JIT optimisation. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟣 Architect: <b>🟣 Staff Architect (Level 400) (6 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Driver OutOfMemory (OOM)** | `🟣 Architect` | A fatal Spark application failure where the driver JVM process exhausts its heap memory, typically caused by collecting large results, broadcasting oversized DataFrames, or accumulating large metadata. |
| 2 | **Executor OutOfMemory (OOM)** | `🟣 Architect` | A Spark task failure where an executor JVM process runs out of heap memory during task execution, typically caused by data skew, oversized joins, or insufficient shuffle partition count. |
| 3 | **Spark SQL Broadcast Joins & Key Salting for Data Skew** | `🟣 Architect` | Distributed query execution techniques in Apache Spark to eliminate shuffle bottlenecks during asymmetric joins and mitigate executor memory exhaustion caused by skewed join keys. |
| 4 | **Spark Unified Memory Manager** | `🟣 Architect` | The memory management subsystem introduced in Apache Spark that unifies execution and storage memory into a single shared pool with dynamic borrowing. |
| 5 | **The 5 S's of Apache Spark Performance** | `🟣 Architect` | The 5 S's of Spark is a diagnostic framework categorizing all distributed big data bottlenecks into Storage, Skew, Spill, Shuffle, and Serialization. |
| 6 | **Volcano Iterator vs. Vectorized Execution** | `🟣 Architect` | The Volcano Iterator model processes queries tuple-at-a-time via a pull-based next() interface, whereas Vectorized Execution processes batches of column vectors directly in CPU cache. |

</details>

</details>

<details>
<summary>&nbsp;&nbsp;📂 <b>Section: Partitioning, Shuffling & Skew Mitigation (25 Topics)</b> — <i>Click to expand functional domain</i></summary>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟢 Easy: <b>🟢 Easy (Level 100) (2 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Narrow Transformation** | `🟢 Easy` | A Spark transformation where each output partition depends on exactly one input partition, requiring no data movement across the network. |
| 2 | **Wide Transformation** | `🟢 Easy` | A Spark transformation where each output partition may depend on multiple input partitions from different executors, requiring a full shuffle of data across the network. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟡 Intermediate: <b>🟡 Intermediate (Level 200) (6 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **coalesce() vs repartition()** | `🟡 Intermediate` | Two Spark functions for changing partition count: coalesce() reduces partitions without a full shuffle by merging local partitions, while repartition() performs a full shuffle to evenly redistribute data across any number of partitions. |
| 2 | **Dynamic Partition Overwrite** | `🟡 Intermediate` | A Spark write mode that overwrites only the partitions present in the incoming DataFrame, leaving partitions not touched by the current write intact. |
| 3 | **Partition Pruning** | `🟡 Intermediate` | A Spark read optimisation that skips entire partition directories in storage when a query's WHERE clause exactly matches or narrows the partitioning key, avoiding unnecessary I/O. |
| 4 | **Spark AQE Dynamic Shuffle Partition Coalescing** | `🟡 Intermediate` | A runtime optimization in Apache Spark 3.0+ that inspects post-shuffle partition sizes and automatically combines undersized partitions into target-sized task bundles. |
| 5 | **Spark Broadcast Hash Join (BHJ)** | `🟡 Intermediate` | A distributed join strategy in Apache Spark that distributes an entire small DataFrame to all executor nodes to eliminate costly shuffle operations. |
| 6 | **Stage Boundary** | `🟡 Intermediate` | A stage boundary in Spark marks the point where a wide transformation (shuffle) separates two stages, requiring all tasks in the upstream stage to complete before the downstream stage begins. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🔴 Advanced: <b>🔴 Advanced (Level 300) (12 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **AQE Dynamic Join Strategy Switching** | `🔴 Advanced` | A runtime optimization in Adaptive Query Execution that converts planned SortMergeJoins into BroadcastHashJoins based on post-shuffle partition size statistics. |
| 2 | **AQE Dynamic Skew Join Splitting** | `🔴 Advanced` | An AQE optimization that automatically identifies skewed shuffle partitions at runtime and splits them into smaller sub-partitions to balance executor workload. |
| 3 | **AQE Shuffle Partition Coalescing** | `🔴 Advanced` | An Adaptive Query Execution feature that merges small post-shuffle partitions at runtime into larger ones, eliminating the small-file and task-overhead problem from over-partitioning. |
| 4 | **Bucket Join** | `🔴 Advanced` | A Spark join optimisation that eliminates shuffle entirely by pre-bucketing both tables on the join key with the same number of buckets, co-locating matching keys on the same partitions. |
| 5 | **Data Skew & Salt Keys** | `🔴 Advanced` | A performance bottleneck where a few data partitions hold disproportionately more records, resolved by adding random salt keys. |
| 6 | **Data Skew: Detection & Mitigation** | `🔴 Advanced` | The process of diagnosing uneven record distributions across executor partitions using Spark UI percentiles, resolved via Adaptive Query Execution (AQE) skew join splitting or two-phase key salting. |
| 7 | **External Shuffle Service** | `🔴 Advanced` | A long-running service on each worker node that serves shuffle blocks independently of executor JVM processes, allowing executors to be removed during dynamic scaling without losing shuffle data. |
| 8 | **Pandas UDF — GROUPED_MAP Type** | `🔴 Advanced` | A PySpark UDF pattern that receives an entire partition group (keyed by groupBy columns) as a Pandas DataFrame, applies arbitrary Python/Pandas logic, and returns a Pandas DataFrame — enabling per-group custom transformations. |
| 9 | **Sort Merge Join (SMJ)** | `🔴 Advanced` | Spark's default join strategy for large-to-large table joins, where both datasets are shuffled by join key, sorted, and merged partition-by-partition on executor cores. |
| 10 | **Spark Data Skew & Salting Technique** | `🔴 Advanced` | A distributed data engineering pattern that redistributes skewed join or aggregation keys across multiple executor tasks by appending random numerical salt prefixes. |
| 11 | **Spark Join Skew Remediation via Key Salting** | `🔴 Advanced` | Key Salting is a distributed optimization technique where a pseudo-random integer suffix is appended to skewed join keys to distribute data uniformly across shuffle partitions. |
| 12 | **Task Duration Skew Detection** | `🔴 Advanced` | Using Spark Web UI task duration percentiles (75th vs Max) to diagnose unbalanced partition distributions. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟣 Architect: <b>🟣 Staff Architect (Level 400) (5 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Salted Join (Skew Mitigation)** | `🟣 Architect` | A technique to handle data skew in Spark joins by appending a random integer ('salt') to skewed keys, exploding the smaller table to match, thereby distributing hot partitions across multiple executors. |
| 2 | **Shuffle Fetch Failed** | `🟣 Architect` | A Spark task failure that occurs when a downstream task cannot retrieve shuffle data from an upstream executor, typically caused by executor loss, OOM, or network partition. |
| 3 | **Skewed Shuffle Partition Splitting** | `🟣 Architect` | A dynamic AQE mechanism that identifies disproportionately large shuffle partitions and divides them into parallel sub-tasks while duplicating opposing join data. |
| 4 | **Spark Data Skew Remediation: Salting & Isolated Broadcast Patterns** | `🟣 Architect` | Algorithmic architectural strategies to balance severely uneven data distributions across Spark cluster worker cores during shuffle-intensive joins. |
| 5 | **Zombie Worker** | `🟣 Architect` | A Databricks/Spark executor node that has been declared dead by the driver (due to heartbeat timeout or network partition) but continues running tasks in isolation, causing double-execution and potential data corruption. |

</details>

</details>

<details>
<summary>&nbsp;&nbsp;📂 <b>Section: Join Strategies & Broadcast Mechanics (2 Topics)</b> — <i>Click to expand functional domain</i></summary>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟡 Intermediate: <b>🟡 Intermediate (Level 200) (2 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Broadcast Join Auto-Threshold Tuning** | `🟡 Intermediate` | Configuring `spark.sql.autoBroadcastJoinThreshold` to safely broadcast lookup tables without driver OutOfMemoryError. |
| 2 | **Semi Join & Anti Join** | `🟡 Intermediate` | Spark join types that filter the left table based on existence (semi) or non-existence (anti) of matching rows in the right table, without including right-side columns in the output. |

</details>

</details>

<details>
<summary>&nbsp;&nbsp;📂 <b>Section: Streaming, Vectorization & UDFs (8 Topics)</b> — <i>Click to expand functional domain</i></summary>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟡 Intermediate: <b>🟡 Intermediate (Level 200) (5 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **foreachBatch Pattern** | `🟡 Intermediate` | A Structured Streaming sink API method that processes each micro-batch as a static DataFrame, enabling custom multi-table writes, MERGE upserts, and external API integrations. |
| 2 | **PySpark Pandas API on Spark (formerly Koalas)** | `🟡 Intermediate` | A PySpark API that implements the pandas DataFrame interface on top of distributed Spark DataFrames, allowing pandas code to scale across a cluster with minimal code changes. |
| 3 | **PySpark Vectorized Pandas UDF Architecture** | `🟡 Intermediate` | Using Apache Arrow record batches to pass columnar data between the JVM and Python worker processes with high efficiency. |
| 4 | **Stream-Static Joins** | `🟡 Intermediate` | A stateful stream enrichment pattern that joins real-time streaming DataFrames with static reference or dimensional tables without requiring unbounded streaming state retention. |
| 5 | **Structured Streaming Fundamentals** | `🟡 Intermediate` | The scalable, fault-tolerant stream processing engine in Apache Spark that models streaming data as append-only unbounded tables, leveraging Delta Lake sources and sinks with exactly-once guarantees. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🔴 Advanced: <b>🔴 Advanced (Level 300) (2 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Pandas UDF — SCALAR Type** | `🔴 Advanced` | A vectorised PySpark UDF that receives a batch of column values as a Pandas Series, applies a Python function, and returns a Pandas Series — using Apache Arrow for efficient zero-copy data transfer. |
| 2 | **Structured Streaming Watermark** | `🔴 Advanced` | A Spark Structured Streaming mechanism that defines how late an event can arrive and still be included in a windowed aggregation, enabling Spark to clean up state for windows that are no longer expected to receive late data. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟣 Architect: <b>🟣 Staff Architect (Level 400) (1 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Structured Streaming Checkpointing & Exactly-Once Semantics** | `🟣 Architect` | End-to-end fault tolerance mechanism guaranteeing each incoming stream event is processed and written to sink storage exactly once, even through cluster crashes. |

</details>

</details>

<details>
<summary>&nbsp;&nbsp;📂 <b>Section: Core Architecture & RDD/DataFrame Primitives (50 Topics)</b> — <i>Click to expand functional domain</i></summary>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟢 Easy: <b>🟢 Easy (Level 100) (5 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Common Table Expression (CTE) in Spark SQL** | `🟢 Easy` | A named temporary result set defined within a WITH clause in Spark SQL that can be referenced multiple times in the same query, improving readability and enabling recursive queries. |
| 2 | **DataFrame** | `🟢 Easy` | A distributed collection of data organized into named columns, equivalent to a table in a relational database. |
| 3 | **PySpark Try-Cast Graceful Degradation** | `🟢 Easy` | A fault-tolerant casting function returning NULL instead of terminating the Spark job when parsing corrupted data strings. |
| 4 | **Resilient Distributed Dataset (RDD)** | `🟢 Easy` | Spark's core abstraction representing a read-only, partitioned, fault-tolerant collection of elements. |
| 5 | **SparkSession** | `🟢 Easy` | The unified entry point for programming Apache Spark applications using DataFrames and SQL. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟡 Intermediate: <b>🟡 Intermediate (Level 200) (26 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Accumulator** | `🟡 Intermediate` | A Spark shared variable that allows tasks running on executors to additively update a counter or collection, which the driver can then read — used for diagnostics and monitoring. |
| 2 | **Apache Avro Format in Spark** | `🟡 Intermediate` | A row-oriented binary serialisation format used in Kafka/streaming pipelines and schema-registry-integrated workflows, supported in Spark via the spark-avro library. |
| 3 | **Complex Types: ARRAY, STRUCT, MAP** | `🟡 Intermediate` | Composite Spark SQL data types (ARRAY, STRUCT, MAP) representing hierarchical and nested data schemas, queried using dot-notation, array indexing, and higher-order functions. |
| 4 | **CTEs, PIVOT & Subqueries** | `🟡 Intermediate` | Advanced SQL query composition patterns—including Common Table Expressions, PIVOT aggregations, and subqueries—used to structure readable, modular, and optimized multi-step analytical transformations. |
| 5 | **Databricks Cluster Policies** | `🟡 Intermediate` | Databricks governance constructs that define JSON-based rules restricting or fixing cluster configuration parameters, enforced when users create new clusters in a workspace. |
| 6 | **Databricks Instance Pools** | `🟡 Intermediate` | A Databricks feature that maintains a pool of pre-provisioned, idle VM instances that clusters can attach to immediately, dramatically reducing cluster start time from minutes to seconds. |
| 7 | **Databricks Secrets** | `🟡 Intermediate` | A Databricks-managed key-value secret store that securely injects sensitive values (API keys, connection strings, passwords) into notebooks and job runs without exposing them as plaintext. |
| 8 | **Databricks Serverless Compute** | `🟡 Intermediate` | A Databricks compute model where Databricks manages the cluster lifecycle entirely — provisioning, scaling, and terminating compute resources instantly — with per-second DBU billing and zero cluster configuration. |
| 9 | **Delta Lake Schema Enforcement** | `🟡 Intermediate` | Delta Lake's default behaviour that rejects writes where the incoming DataFrame schema does not match the table's registered schema, preventing silent data corruption from schema drift. |
| 10 | **Delta Lake Schema Evolution** | `🟡 Intermediate` | Delta Lake's ability to automatically update a table's schema when new columns are added to an incoming DataFrame, without requiring manual schema changes or failing the write. |
| 11 | **Delta Lake Shallow Clone vs Deep Clone** | `🟡 Intermediate` | Two Delta Lake cloning strategies: shallow clone creates a new table pointing to the original's data files without copying them, while deep clone physically copies all data and log files to a new location. |
| 12 | **Delta Lake Time Travel** | `🟡 Intermediate` | Delta Lake's ability to query or restore a table to any previous version or timestamp by replaying the transaction log to reconstruct the historical table state. |
| 13 | **Higher-Order Functions** | `🟡 Intermediate` | Built-in Spark SQL functions (`transform`, `filter`, `exists`, `aggregate`) that manipulate nested arrays inline using anonymous lambda expressions without requiring expensive `explode()` operations. |
| 14 | **Lazy Evaluation** | `🟡 Intermediate` | An execution strategy where Spark delays query executions until an action is explicitly requested. |
| 15 | **Output Modes** | `🟡 Intermediate` | The streaming sink write configurations defining whether only newly processed rows are written (Append), the entire updated aggregation table is rewritten (Complete), or modified rows are updated in-place (Update). |
| 16 | **Parquet Columnar Storage** | `🟡 Intermediate` | An Apache Parquet file format that stores data column-by-column rather than row-by-row, enabling highly efficient compression and selective column reads for analytical workloads. |
| 17 | **Photon Engine (General)** | `🟡 Intermediate` | A native, vectorized query engine written in C++ that accelerates execution speeds of Spark SQL and DataFrame workloads. |
| 18 | **Predicate Pushdown** | `🟡 Intermediate` | Optimization technique that applies filter conditions early in query execution to reduce data movement and storage I/O before processing begins. |
| 19 | **RDD Lineage Graph** | `🟡 Intermediate` | The directed acyclic graph of transformations recorded for an RDD that allows Spark to reconstruct lost partitions by replaying only the transformations needed, rather than storing full data copies. |
| 20 | **Spark Connect (General)** | `🟡 Intermediate` | A client-server gRPC architecture that decouples the Spark driver from local client applications and developer IDEs. |
| 21 | **Spark Window Function** | `🟡 Intermediate` | A Spark SQL operation that performs calculations across a set of rows logically related to the current row (a 'window'), without collapsing the result into a single aggregate row. |
| 22 | **StructType & Explicit Schema** | `🟡 Intermediate` | The programmatic way to define the schema of a Spark DataFrame using StructType and StructField objects, avoiding the cost and risks of automatic schema inference from data. |
| 23 | **Table Constraints & Generated Columns** | `🟡 Intermediate` | Declarative relational integrity rules—including CHECK constraints, NOT NULL requirements, and computed generated columns—enforced by Delta Lake at write time to guarantee table quality. |
| 24 | **Task Scheduler** | `🟡 Intermediate` | The low-level component in Apache Spark responsible for assigning individual tasks to executor cores and handling task retries and speculative execution. |
| 25 | **VARIANT Type** | `🟡 Intermediate` | A native binary data type in Databricks and Spark designed to efficiently store semi-structured JSON data with sub-column shredding, indexing, and high-performance query execution. |
| 26 | **Windowed Aggregations** | `🟡 Intermediate` | Time-based streaming aggregations computed over fixed non-overlapping intervals (tumbling windows) or overlapping periodic intervals (sliding windows) bounded by event-time watermarks. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🔴 Advanced: <b>🔴 Advanced (Level 300) (15 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Databricks Auto Loader** | `🔴 Advanced` | A Databricks-native structured streaming source that incrementally ingests new files from cloud storage (S3/ADLS/GCS) as they arrive, using directory listing or file notification events to detect new files efficiently at scale. |
| 2 | **Delta Lake Change Data Feed (CDF)** | `🔴 Advanced` | A Delta Lake feature that records row-level change events (INSERT, UPDATE_PREIMAGE, UPDATE_POSTIMAGE, DELETE) in a special column, enabling downstream systems to consume only changed rows. |
| 3 | **Delta Lake Data Skipping** | `🔴 Advanced` | A Delta Lake read optimisation that uses per-file min/max column statistics stored in the transaction log to skip Parquet files entirely when their value ranges cannot contain query filter values. |
| 4 | **Delta Lake MERGE INTO (Upsert)** | `🔴 Advanced` | A Delta Lake SQL command that performs an atomic upsert — updating matched rows and inserting unmatched rows — in a single scan of both the target and source tables. |
| 5 | **Delta Lake OPTIMIZE with Z-Ordering** | `🔴 Advanced` | A Delta Lake maintenance operation that compacts small Parquet files (bin-packing) and optionally co-locates related data using Z-order multi-dimensional clustering to accelerate query data skipping. |
| 6 | **Delta Lake VACUUM** | `🔴 Advanced` | A Delta Lake maintenance command that physically deletes Parquet data files that are no longer referenced by any table version within the retention window. |
| 7 | **Delta Live Tables (DLT) (General)** | `🔴 Advanced` | A declarative SQL and Python framework for building, testing, and monitoring reliable batch and streaming data pipelines. |
| 8 | **Delta Log (_delta_log) Structure** | `🔴 Advanced` | The transaction log directory of a Delta table that records every change as JSON commit files, with periodic Parquet checkpoint files for efficient log replay. |
| 9 | **Dynamic Resource Allocation** | `🔴 Advanced` | A Spark feature that automatically scales executor count up and down based on workload demand, adding executors during high parallelism needs and releasing idle executors to the cluster manager. |
| 10 | **Executor Heartbeat Timeout** | `🔴 Advanced` | A Spark executor failure condition where the driver stops receiving heartbeat signals from an executor within the configured timeout window, causing the driver to declare the executor dead and reschedule its tasks. |
| 11 | **MERGE INTO & Upsert Patterns** | `🔴 Advanced` | The atomic `MERGE INTO` SQL operation used to coordinate simultaneous INSERT, UPDATE, and DELETE actions between source and target Delta tables in a single ACID transaction. |
| 12 | **Py4J Gateway** | `🔴 Advanced` | The bridge technology used by PySpark to enable Python processes to communicate with the JVM-based Spark driver, translating Python API calls into JVM method invocations over a local socket. |
| 13 | **Speculative Execution** | `🔴 Advanced` | A Spark fault-tolerance feature that launches a duplicate copy of a slow (straggler) task on another executor, using whichever copy finishes first and killing the other. |
| 14 | **Structured Streaming Checkpoint** | `🔴 Advanced` | A directory on durable storage where Spark Structured Streaming records the state of a streaming query — including offsets consumed and micro-batch progress — enabling recovery after failures without reprocessing. |
| 15 | **Unity Catalog (General)** | `🔴 Advanced` | A unified governance and catalog system for files, tables, dashboards, and notebooks across Databricks workspaces. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟣 Architect: <b>🟣 Staff Architect (Level 400) (4 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Databricks Photon Native C++ Engine** | `🟣 Architect` | A ground-up rewrite of Apache Spark's execution engine in native C++, utilizing SIMD vectorized instruction sets to accelerate SQL and DataFrame operations. |
| 2 | **Databricks Photon Vectorized Execution Engine** | `🟣 Architect` | A native, high-performance vectorized query engine written in C++ designed to accelerate modern lakehouse SQL and DataFrame workloads. |
| 3 | **Delta Lake Liquid Clustering** | `🟣 Architect` | A next-generation Delta Lake table layout feature that replaces partitioning and Z-Ordering with dynamic, incremental clustering that continuously optimises data layout without full rewrites. |
| 4 | **RocksDB State Store in Structured Streaming** | `🟣 Architect` | An embedded, disk-backed LSM-tree state store provider engineered to manage multi-gigabyte or multi-billion-key stateful streaming pipelines. |

</details>

</details>

</details>

<details>
<summary><b>⚡ Databricks Platform, Unity Catalog & Delta Lake 3.x (132 Topics across 5 Sections)</b> — <i>Click to expand module</i></summary>

<details>
<summary>&nbsp;&nbsp;📂 <b>Section: Unity Catalog 3-Tier Governance & Security (42 Topics)</b> — <i>Click to expand functional domain</i></summary>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟢 Easy: <b>🟢 Easy (Level 100) (7 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Cluster Policy** | `🟢 Easy` | A Cluster Policy is an administrative governance rule set that restricts the configuration options available to users when provisioning compute clusters. |
| 2 | **Data Explorer** | `🟢 Easy` | Data Explorer is the visual UI tool in the Databricks Workspace used to discover, manage, inspect, and grant permissions on Unity Catalog data assets. |
| 3 | **Databricks Workspace** | `🟢 Easy` | A Databricks Workspace is a software-as-a-service (SaaS) environment that provides a unified collaborative interface for data engineers, data scientists, and analysts to access compute, notebooks, and storage. |
| 4 | **Metastore** | `🟢 Easy` | A Metastore is the central metadata repository that catalogs schema definitions, table partition locations, data types, and access privileges for data stored in the lakehouse. |
| 5 | **Three-Level Namespace** | `🟢 Easy` | The standard 3-tier logical namespace (`catalog.schema.table_or_view`) introduced by Unity Catalog to structure enterprise data assets, manage permissions, and enforce data mesh boundaries. |
| 6 | **Unity Catalog** | `🟢 Easy` | Unity Catalog is Databricks' centralized, multi-cloud governance solution providing unified access control, data auditing, lineage tracking, and discovery across all workspace assets. |
| 7 | **Volumes** | `🟢 Easy` | Governed Unity Catalog storage abstractions that provide secure access, governance, and audit lineage for non-tabular files including raw CSVs, unstructured text, images, and machine learning models. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟡 Intermediate: <b>🟡 Intermediate (Level 200) (11 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Compute Policies & Cluster Governance** | `🟡 Intermediate` | Administrative governance guardrails that enforce compute provisioning boundaries—including allowed VM types, max worker limits, spot instance allocations, and idle auto-termination. |
| 2 | **Data Lineage** | `🟡 Intermediate` | The automated, real-time metadata tracking engine in Unity Catalog that captures column-level and table-level data flow lineage across queries, notebooks, workflows, and dashboards. |
| 3 | **Delta UniForm & Multi-Engine Interoperability** | `🟡 Intermediate` | Delta Lake Universal Format (UniForm), which automatically translates and maintains Apache Iceberg and Apache Hudi metadata alongside Delta logs, enabling multi-engine query access without data duplication. |
| 4 | **Dynamic Views for Security** | `🟡 Intermediate` | Security-hardened SQL views that evaluate user context functions (`CURRENT_USER()`, `IS_MEMBER()`) at runtime to provide row-level filtering and column-level masking without duplicating data. |
| 5 | **External Locations & Storage Credentials** | `🟡 Intermediate` | Unity Catalog securable objects that encapsulate cloud identity credentials (IAM roles, Managed Identities) and associate them with specific object storage URLs for governed external table access. |
| 6 | **Managed vs. External Tables: Architecture Tradeoffs** | `🟡 Intermediate` | The strategic trade-offs between Unity Catalog managed tables (lifecycle managed by Databricks, Predictive Optimization enabled) and external tables (custom storage locations, multi-engine access). |
| 7 | **Permission Model & Inheritance** | `🟡 Intermediate` | The hierarchical access control model in Unity Catalog where security privileges granted on parent securable objects (Catalogs) automatically cascade down to Schemas, Tables, and Views. |
| 8 | **System Tables for Operations** | `🟡 Intermediate` | Centrally governed, audit-grade operational telemetry tables in Unity Catalog (`system.billing`, `system.compute`, `system.access`) used for cost tracking, cluster audit logs, and FinOps analytics. |
| 9 | **Unity Catalog Lineage Tracking** | `🟡 Intermediate` | Automated capture of column-level and table-level data flow across queries, jobs, and dashboards. |
| 10 | **Unity Catalog Volumes (Managed vs. External)** | `🟡 Intermediate` | A Unity Catalog securable object that extends centralized catalog governance, audit trails, and SQL permissions to unstructured and semi-structured files. |
| 11 | **Vector Search** | `🟡 Intermediate` | Databricks Vector Search is a serverless vector database integrated into Unity Catalog that stores and indexes vector embeddings for real-time similarity search and RAG applications. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🔴 Advanced: <b>🔴 Advanced (Level 300) (9 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Audit Logging** | `🔴 Advanced` | Audit Logging captures, records, and exports detailed security audit trails of all user and system activities occurring across Databricks workspaces and Unity Catalog. |
| 2 | **Databricks DBU Allocation via system.billing.usage** | `🔴 Advanced` | The system catalog telemetry table in Unity Catalog that records minute-by-minute Databricks Unit (DBU) consumption across all workspaces, jobs, and users. |
| 3 | **Lakehouse Federation** | `🔴 Advanced` | Lakehouse Federation allows Unity Catalog to query external operational and analytical databases (Snowflake, BigQuery, PostgreSQL, MySQL, SQL Server) in place without moving data. |
| 4 | **Multi-Workspace Architecture** | `🔴 Advanced` | Enterprise platform deployment topology evaluating single-workspace versus multi-workspace designs for team isolation, regulatory compliance boundaries, and multi-region governance. |
| 5 | **Predictive Optimization** | `🔴 Advanced` | Predictive Optimization is an automated AI-driven service in Databricks that intelligently schedules OPTIMIZE and VACUUM maintenance operations on Unity Catalog managed tables. |
| 6 | **Row Filters & Column Masks** | `🔴 Advanced` | Applying row-level and column-level security directly to tables via SQL UDFs. |
| 7 | **SCIM Provisioning** | `🔴 Advanced` | SCIM (System for Cross-domain Identity Management) Provisioning automatically synchronizes users, service principals, and security groups from enterprise identity providers to Databricks. |
| 8 | **Unity Catalog Fine-Grained Access Control** | `🔴 Advanced` | Fine-Grained Access Control in Unity Catalog enforces cell-level security via Row Filters and Column Masks defined with standard SQL functions. |
| 9 | **Unity Catalog System Tables** | `🔴 Advanced` | Unity Catalog System Tables are analytical Delta tables hosted in the system catalog that expose operational metadata, cost telemetry, query history, and data lineage. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟣 Architect: <b>🟣 Staff Architect (Level 400) (15 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Data Mesh on Databricks** | `🟣 Architect` | An architectural implementation of the Data Mesh paradigm on Databricks, treating data as a product owned by decentralized domain teams governed by Unity Catalog. |
| 2 | **Databricks + dbt Integration** | `🟣 Architect` | The production architecture pairing dbt with Databricks SQL Serverless and Unity Catalog, leveraging the dbt-databricks adapter for high-performance lakehouse transformations. |
| 3 | **Databricks Genie Compound AI** | `🟣 Architect` | A natural language conversational interface translating business questions into certified SQL over Unity Catalog metric views. |
| 4 | **Databricks Lakeflow Connectors** | `🟣 Architect` | Native managed SaaS and database ingestion connectors for Salesforce, Workday, ServiceNow, and SQL databases into Unity Catalog. |
| 5 | **Databricks Split-Plane Cloud Architecture** | `🟣 Architect` | A dual-plane cloud security model that segregates management/control infrastructure from distributed compute execution and persistent customer storage. |
| 6 | **Databricks Unity Catalog Architecture** | `🟣 Architect` | The centralized governance, metadata, and fine-grained access control layer for all data and AI assets across multiple Databricks workspaces in a cloud tenant. |
| 7 | **DBU Cost Governance** | `🟣 Architect` | The architectural framework and operational policies used to monitor, allocate, forecast, and optimize Databricks Unit (DBU) consumption and cloud infrastructure costs. |
| 8 | **Governance with Unity Catalog + Purview** | `🟣 Architect` | The enterprise governance integration between Databricks Unity Catalog and Microsoft Purview, unifying lakehouse metadata with company-wide data governance. |
| 9 | **Mosaic AI Vector Search Continuous Delta Sync** | `🟣 Architect` | A serverless vector database integrated with Unity Catalog that automatically synchronizes vector embeddings with underlying Delta tables in real time. |
| 10 | **Multi-Cloud Databricks Deployment** | `🟣 Architect` | An enterprise deployment pattern operating Databricks across multiple cloud providers (AWS, Azure, GCP) while maintaining unified governance and consistent CI/CD pipelines. |
| 11 | **Unity Catalog Dynamic Column Masking & Row Filters** | `🟣 Architect` | Declarative SQL-based fine-grained access control policies enforced transparently at the Unity Catalog metadata layer. |
| 12 | **Unity Catalog Dynamic Row Filters & Column Masks** | `🟣 Architect` | Fine-grained SQL access control mechanisms in Unity Catalog that dynamically redact columns or filter table rows based on the querying user's group membership. |
| 13 | **Unity Catalog Enterprise Governance** | `🟣 Architect` | The enterprise governance operating model for Unity Catalog encompassing account-level identity management, catalog segregation, classification tagging, and regulatory audit compliance. |
| 14 | **Unity Catalog Multi-Workspace Topology** | `🟣 Architect` | An enterprise architecture design that connects multiple environment- or business-unit-specific workspaces to a single regional Unity Catalog metastore. |
| 15 | **Unity Catalog System Tables for Lakehouse FinOps** | `🟣 Architect` | Centrally governed, read-only analytical schemas providing real-time telemetry on compute usage, billing, audit access, and lineage across an entire account. |

</details>

</details>

<details>
<summary>&nbsp;&nbsp;📂 <b>Section: Delta Lake 3.x ACID Mechanics & Transaction Log (10 Topics)</b> — <i>Click to expand functional domain</i></summary>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟢 Easy: <b>🟢 Easy (Level 100) (4 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **ACID Transactions** | `🟢 Easy` | The set of transactional guarantees (Atomicity, Consistency, Isolation, Durability) enforced by Delta Lake on top of cloud object storage using an append-only transaction log and optimistic concurrency control. |
| 2 | **Delta Lake (Databricks)** | `🟢 Easy` | Delta Lake is an open-source storage framework that brings ACID transactions, scalable metadata handling, and unified streaming and batch data processing to Apache Spark and data lakes. |
| 3 | **Shallow vs. Deep Clones** | `🟢 Easy` | Delta Lake table cloning capabilities that either create zero-copy metadata pointers to source data files (SHALLOW CLONE) or create fully independent physical table copies (DEEP CLONE). |
| 4 | **Transaction Log (`_delta_log`)** | `🟢 Easy` | The ordered, append-only directory of JSON commit files and Parquet checkpoints (`_delta_log`) that serves as the single source of truth for all metadata, schema versions, and physical file operations in a Delta table. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟡 Intermediate: <b>🟡 Intermediate (Level 200) (4 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Databricks SQL Warehouse** | `🟡 Intermediate` | A Databricks SQL Warehouse is a specialized compute resource optimized for SQL workloads, business intelligence queries, and high-concurrency analytical dashboards. |
| 2 | **Delta Time Travel** | `🟡 Intermediate` | Delta Time Travel is the ability to query point-in-time historical snapshots of a Delta table using historical commit versions or timestamps. |
| 3 | **Shallow Clone vs Deep Clone** | `🟡 Intermediate` | Delta Cloning creates copies of a table: Shallow Clone copies only metadata references with zero data duplication, whereas Deep Clone creates a fully independent physical copy of data and metadata. |
| 4 | **VACUUM Command** | `🟡 Intermediate` | The VACUUM command permanently deletes historical data files from cloud storage that are no longer referenced by the active Delta table log and exceed a retention threshold. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🔴 Advanced: <b>🔴 Advanced (Level 300) (1 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Databricks Serverless SQL Warehouse** | `🔴 Advanced` | A fully managed, instant-starting compute tier in Databricks optimized for high-concurrency SQL and BI queries running inside Databricks-managed compute planes. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟣 Architect: <b>🟣 Staff Architect (Level 400) (1 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Stream-to-Table Commit Boundary** | `🟣 Architect` | The consistency boundary between a streaming engine's checkpoint progress and the durable commit visible in its table sink. |

</details>

</details>

<details>
<summary>&nbsp;&nbsp;📂 <b>Section: Physical Layout, Liquid Clustering & Deletion Vectors (12 Topics)</b> — <i>Click to expand functional domain</i></summary>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟢 Easy: <b>🟢 Easy (Level 100) (1 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Delta Lake Liquid Clustering vs Hive Partitioning** | `🟢 Easy` | A physical data layout protocol that dynamically groups data along multiple columns without the rigidity, small-file explosion, or partition skew of traditional Hive directory trees. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟡 Intermediate: <b>🟡 Intermediate (Level 200) (6 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Cluster Sizing & Autoscaling** | `🟡 Intermediate` | The operational strategy of balancing cluster node memory-to-core ratios and autoscaling worker limits to optimize workload parallelism while controlling cloud infrastructure spending. |
| 2 | **OPTIMIZE & File Compaction** | `🟡 Intermediate` | A Delta Lake table maintenance command that bin-packs small files (1MB–10MB) into optimal larger files (~1GB) to reduce cloud object storage API overhead and significantly accelerate analytical query scanning performance. |
| 3 | **OPTIMIZE Command** | `🟡 Intermediate` | The OPTIMIZE command compacts fragmented small Parquet files in a Delta table into larger, query-efficient files (typically ~1GB in size). |
| 4 | **VACUUM & Storage Lifecycle** | `🟡 Intermediate` | A Delta Lake table maintenance command that permanently purges unreferenced physical data files older than a configured retention safety threshold (default 7 days) to reclaim object storage capacity. |
| 5 | **Write Optimization** | `🟡 Intermediate` | Delta Lake write-time optimizations—such as `optimizeWrite` and auto-compaction—that dynamically coalesce and size Parquet data files during ingestion to avoid small-file fragmentation. |
| 6 | **Z-Ordering** | `🟡 Intermediate` | Z-Ordering is a multidimensional clustering technique that colocates related information in the same set of Parquet files to maximize file skipping during SQL queries. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🔴 Advanced: <b>🔴 Advanced (Level 300) (3 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Delta Table Properties & Configuration** | `🔴 Advanced` | Configurable table-level metadata properties in Delta Lake that govern engine behavior, including Change Data Feed enablement, Deletion Vector activation, column mapping mode, and checkpoint frequency. |
| 2 | **Liquid Clustering** | `🔴 Advanced` | Delta Lake 3.x's next-generation data layout engine (`CLUSTER BY`) that organizes data along space-filling curves to optimize multi-dimensional query pruning without hive partitioning or write amplification. |
| 3 | **MERGE Write Amplification** | `🔴 Advanced` | The storage I/O performance penalty in copy-on-write architectures where updating a single row forces the engine to rewrite the entire underlying Parquet file. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟣 Architect: <b>🟣 Staff Architect (Level 400) (2 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Delta Lake Deletion Vectors** | `🟣 Architect` | A storage optimization technique in Delta Lake that marks deleted or updated rows using lightweight bitmap index files instead of rewriting entire Parquet data files. |
| 2 | **Delta Lake Liquid Clustering Architecture** | `🟣 Architect` | A modern, dynamic data layout architecture that organizes Delta Lake Parquet files along a space-filling Hilbert curve without rigid Hive directory hierarchies. |

</details>

</details>

<details>
<summary>&nbsp;&nbsp;📂 <b>Section: Workflows, DLT & Lakeflow Pipelines (18 Topics)</b> — <i>Click to expand functional domain</i></summary>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟢 Easy: <b>🟢 Easy (Level 100) (4 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Databricks Job** | `🟢 Easy` | A Databricks Job is a scheduled or triggered execution unit that runs non-interactive code (notebooks, JARs, Python scripts, dbt models) on automated compute clusters. |
| 2 | **Databricks Workflow** | `🟢 Easy` | Databricks Workflows is the fully managed, native orchestration service within Databricks that designs, schedules, and monitors multi-task Directed Acyclic Graphs (DAGs). |
| 3 | **Job Cluster** | `🟢 Easy` | A Job Cluster is an ephemeral, dedicated compute cluster automatically provisioned by Databricks to execute a specific automated workload and terminated immediately upon completion. |
| 4 | **Parameterization: Widgets, Job Parameters, Task Values** | `🟢 Easy` | The runtime parameterization suite in Databricks—including notebook widgets, job-level parameters, and inter-task dynamic task values—used to construct dynamic and reusable workflows. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟡 Intermediate: <b>🟡 Intermediate (Level 200) (6 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **DBU Cost Model & Billing** | `🟡 Intermediate` | The consumption-based billing framework where platform workloads consume Databricks Units (DBUs) based on compute SKU tiers (All-Purpose, Automated Jobs, SQL Serverless, and Lakeflow). |
| 2 | **Delta Live Tables (DLT)** | `🟡 Intermediate` | Delta Live Tables (DLT) is a declarative ETL framework in Databricks that simplifies data pipeline development by managing dependencies, infrastructure scaling, and data quality enforcement. |
| 3 | **Expectations (Quality Rules)** | `🟡 Intermediate` | Declarative data quality rules in Lakeflow pipelines (`EXPECT`, `EXPECT OR DROP`, `EXPECT OR FAIL`) that audit record integrity and maintain automated telemetry on data quality metrics. |
| 4 | **Incremental Processing Patterns** | `🟡 Intermediate` | Data pipeline design architectures that ingest and transform only new or modified data since the prior execution checkpoint, leveraging Auto Loader, Change Data Feed, and streaming watermarks. |
| 5 | **Streaming Tables vs. Materialized Views** | `🟡 Intermediate` | The architectural distinction in Lakeflow between append-only Streaming Tables for continuous incremental ingestion and stateful Materialized Views for precomputed analytical query acceleration. |
| 6 | **Task Dependencies, Retries & Conditional Logic** | `🟡 Intermediate` | Workflow orchestration primitives in Lakeflow Jobs that define multi-task DAG dependencies, conditional branch routing, retry policies, and SLA timeout limits. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🔴 Advanced: <b>🔴 Advanced (Level 300) (7 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **CDC Processing: AUTO CDC INTO** | `🔴 Advanced` | Declarative CDC processing primitives in Lakeflow pipelines that automatically reconcile out-of-order change logs and maintain SCD Type 1 or SCD Type 2 dimension tables. |
| 2 | **Databricks Delta Live Tables (DLT) Expectations** | `🔴 Advanced` | Declarative data quality rules (`@dlt.expect`, `@dlt.expect_or_drop`, `@dlt.expect_or_fail`) embedded into streaming pipelines. |
| 3 | **DLT Expectations** | `🔴 Advanced` | DLT Expectations are declarative data quality assertions applied to Delta Live Tables that validate incoming records and govern pipeline behavior upon data quality violations. |
| 4 | **Error Handling & Dead Letter Patterns** | `🔴 Advanced` | A resilient pipeline design pattern that routes malformed or schema-violating records into quarantined Dead-Letter Queue (DLQ) tables for offline inspection without aborting the pipeline. |
| 5 | **Join Performance Diagnosis** | `🔴 Advanced` | When a join is the bottleneck: reading shuffle sizes, spill metrics, and task skew in Spark UI for join stages. |
| 6 | **Performance Troubleshooting Methodology** | `🔴 Advanced` | A structured diagnostic workflow for identifying lakehouse performance bottlenecks by analyzing Spark UI stages, query execution plans, shuffle spill, data skew, and cluster resource utilization. |
| 7 | **Serverless DLT** | `🔴 Advanced` | Serverless DLT executes Delta Live Tables pipelines on instant, fully managed serverless compute clusters operated within the Databricks cloud control plane. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟣 Architect: <b>🟣 Staff Architect (Level 400) (1 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Lakeflow Spark Declarative Pipelines (DLT)** | `🟣 Architect` | A declarative framework for building, testing, and operating reliable lakehouse ETL pipelines with managed orchestration, state, and data quality expectations. |

</details>

</details>

<details>
<summary>&nbsp;&nbsp;📂 <b>Section: Workspace, Serverless Compute & FinOps (50 Topics)</b> — <i>Click to expand functional domain</i></summary>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟢 Easy: <b>🟢 Easy (Level 100) (10 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **All-Purpose Cluster** | `🟢 Easy` | An All-Purpose Cluster is a shared interactive compute cluster designed for collaborative exploratory data analysis, interactive notebook development, and ad-hoc querying. |
| 2 | **Choosing Compute for Jobs** | `🟢 Easy` | The architectural decision framework for matching workloads to compute tiers: Serverless (zero startup delay, auto-managed), Classic Automated Jobs clusters (custom libraries), or All-Purpose clusters. |
| 3 | **Databricks Notebook** | `🟢 Easy` | A Databricks Notebook is a web-based interactive development document combining live executable code cells, interactive visualizations, and narrative markdown documentation. |
| 4 | **Databricks Repos** | `🟢 Easy` | Databricks Repos (now known as Git Folders) provides visual and programmatic Git version control integration directly inside the Databricks Workspace. |
| 5 | **DBFS (Databricks File System)** | `🟢 Easy` | DBFS (Databricks File System) is a distributed file system abstraction layer mounted over cloud object storage (S3 bucket, Azure container, GCS bucket) accessible across the workspace. |
| 6 | **dbutils** | `🟢 Easy` | Databricks Utilities (dbutils) is a built-in Python and Scala library that provides programmatic helper methods for file system operations, secret management, notebook workflows, and UI widgets. |
| 7 | **Magic Commands** | `🟢 Easy` | Magic Commands are special prefix directives (%python, %sql, %scala, %r, %sh, %fs) entered at the beginning of a notebook cell to alter the execution runtime or execute system utilities. |
| 8 | **Notebook Development Patterns** | `🟢 Easy` | Software engineering methodologies for Databricks notebooks, contrasting modular Python packages, Git Folders, and Databricks Connect against legacy `%run` script chaining. |
| 9 | **Secrets Management** | `🟢 Easy` | The secure credential management framework in Databricks (Secret Scopes backed by Azure Key Vault or encrypted storage) used to securely inject tokens, API keys, and connection strings at runtime. |
| 10 | **Serverless Compute Economics** | `🟢 Easy` | The FinOps cost and operational efficiency model of Databricks Serverless Compute, which eliminates idle capacity costs and cold-start latency through instant provisioning and per-workload DBU billing. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟡 Intermediate: <b>🟡 Intermediate (Level 200) (16 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **AI Functions for Data Engineers** | `🟡 Intermediate` | Built-in SQL functions (`ai_query()`, `ai_classify()`, `ai_extract()`) in Databricks SQL that invoke foundation LLMs directly within batch and streaming queries for automated data enrichment. |
| 2 | **Auto Loader** | `🟡 Intermediate` | Auto Loader is an optimized ingestion engine in Databricks that incrementally and efficiently ingests raw data files from cloud storage as they arrive without state tracking overhead. |
| 3 | **Change Data Feed (CDF)** | `🟡 Intermediate` | Change Data Feed (CDF) is a Delta Lake feature that captures and exposes row-level change events (inserts, updates, deletes) committed to a Delta table. |
| 4 | **Column Statistics & File Pruning** | `🟡 Intermediate` | Per-file min/max statistics collected for the first 32 columns by default (managed tables with Predictive Optimization choose columns intelligently). |
| 5 | **Databricks Feature Store** | `🟡 Intermediate` | The Databricks Feature Store is a centralized catalog that enables data scientists to discover, share, and reuse ML features with guaranteed online/offline consistency. |
| 6 | **Databricks Secret Scopes (Azure Key Vault)** | `🟡 Intermediate` | Secure credential storage backed by cloud key vaults, accessed in notebooks via `dbutils.secrets.get()`. |
| 7 | **Databricks Workspace File Sync (Repos)** | `🟡 Intermediate` | Bi-directional Git integration synchronizing branch code directly into Databricks workspace directories. |
| 8 | **Information Schema & Metadata Queries** | `🟡 Intermediate` | Querying `system.information_schema.tables`, `.columns`, `.table_privileges` to discover and audit catalog contents. |
| 9 | **Medallion Architecture on Databricks** | `🟡 Intermediate` | The Medallion Architecture is a lakehouse data design pattern that logically organizes data into Bronze (raw ingestion), Silver (cleaned/conformed), and Gold (curated business marts) quality layers. |
| 10 | **MLflow Model Registry** | `🟡 Intermediate` | The MLflow Model Registry provides a centralized model store, set of APIs, and UI to collaboratively manage the full lifecycle of MLflow models from development to production deployment. |
| 11 | **MLflow Tracking** | `🟡 Intermediate` | MLflow Tracking is an enterprise logging API and UI for recording machine learning experiment runs, hyperparameters, evaluation metrics, code versions, and serialized model artifacts. |
| 12 | **Monitoring, Alerting & SQL Alerts** | `🟡 Intermediate` | Automated operational monitoring and alert mechanisms in Databricks SQL that periodically evaluate query thresholds and dispatch notifications via Slack, PagerDuty, or Webhooks. |
| 13 | **Photon Engine** | `🟡 Intermediate` | Databricks' native, high-performance vectorized query execution engine written in C++ that leverages hardware SIMD acceleration and CPU cache locality to dramatically accelerate SQL and DataFrame workloads. |
| 14 | **Query Profile & Execution Plans** | `🟡 Intermediate` | Reading the DBSQL Query Profile (visual plan, statistics, bottleneck identification). |
| 15 | **Serverless vs Provisioned Auto-scaling Compute Economics** | `🟡 Intermediate` | The unit cost and utilization modeling comparing pay-per-second serverless execution runtimes against fixed, provisioned auto-scaling VM cluster pools. |
| 16 | **Service Principals & Managed Identity** | `🟡 Intermediate` | Using service principals for automated jobs instead of personal credentials. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🔴 Advanced: <b>🔴 Advanced (Level 300) (11 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Databricks Asset Bundles (DABs)** | `🔴 Advanced` | Databricks Asset Bundles (DABs) is an Infrastructure-as-Code (IaC) framework that allows developers to define, test, and deploy entire Databricks projects using version-controlled YAML configurations. |
| 2 | **Databricks Asset Bundles Multi-Environment Promotion** | `🔴 Advanced` | A declarative Infrastructure-as-Code (IaC) packaging framework that defines jobs, pipelines, notebooks, and permissions as versioned YAML for automated CI/CD promotion. |
| 3 | **Databricks Auto Loader (cloudFiles)** | `🔴 Advanced` | An optimized streaming source format in Databricks (`cloudFiles`) that incrementally and efficiently processes billions of new data files arriving in cloud storage without state file explosion. |
| 4 | **Databricks Connect v2** | `🔴 Advanced` | Databricks Connect v2 is a client library built on Spark Connect that allows developers to run PySpark code from local IDEs directly against remote Databricks compute clusters. |
| 5 | **Databricks Genie Spaces (Lakehouse AI)** | `🔴 Advanced` | An AI-powered conversational interface in Databricks that allows non-technical business stakeholders to query Lakehouse Delta tables using natural language. |
| 6 | **Databricks Structured Streaming** | `🔴 Advanced` | Databricks Structured Streaming is a scalable stream processing engine built on Spark SQL that processes continuous data streams with micro-batch or continuous processing semantics. |
| 7 | **Delta Lake Schema Enforcement vs. Evolution** | `🔴 Advanced` | Schema Enforcement prevents data corruption by blocking appends that deviate from table schema, while Schema Evolution allows controlled addition of new columns during write operations. |
| 8 | **Delta Sharing** | `🔴 Advanced` | Delta Sharing is an open, cross-platform protocol for securely sharing live data tables, schemas, and AI models across organizations and clouds without data duplication. |
| 9 | **SCD Type 1 & Type 2 Patterns** | `🔴 Advanced` | Dimensional modeling techniques in Delta Lake that either overwrite current dimension attribute values (SCD Type 1) or preserve historical state transitions using effective date ranges and active flags (SCD Type 2). |
| 10 | **Serverless Compute (Databricks)** | `🔴 Advanced` | Serverless Compute is an on-demand, fully managed compute architecture in Databricks that boots clusters in seconds and scales resources instantaneously within Databricks-managed cloud accounts. |
| 11 | **Spark Connect** | `🔴 Advanced` | Spark Connect is a decoupled client-server architecture for Apache Spark that enables thin clients and IDEs to execute Spark DataFrame queries via a lightweight gRPC protocol. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟣 Architect: <b>🟣 Staff Architect (Level 400) (13 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **CI/CD for Databricks with DABs** | `🟣 Architect` | The continuous integration and continuous deployment (CI/CD) architecture for Databricks using Databricks Asset Bundles (DABs) and Git automation pipelines. |
| 2 | **Databricks Asset Bundles (DABs) Infrastructure-as-Code** | `🟣 Architect` | A declarative Infrastructure-as-Code (IaC) standard for authoring, testing, deploying, and version-controlling Databricks data and AI projects. |
| 3 | **Databricks Asset Bundles (DABs) Multi-Target CI/CD** | `🟣 Architect` | The official Infrastructure-as-Code (IaC) standard for authoring, version-controlling, testing, and deploying Databricks Lakehouse workflows and pipelines across environments. |
| 4 | **Databricks Clean Rooms** | `🟣 Architect` | A secure multi-party collaboration environment allowing organizations to query shared datasets without exposing raw data. |
| 5 | **Databricks for Data Products** | `🟣 Architect` | The methodology and platform architecture for engineering, publishing, documenting, and monetizing curated data products on Databricks. |
| 6 | **Databricks Lakehouse vs Snowflake** | `🟣 Architect` | The enterprise architectural evaluation comparing Databricks' open, compute-flexible lakehouse platform against Snowflake's proprietary, SQL-centric cloud data warehouse platform. |
| 7 | **Databricks MLOps Platform** | `🟣 Architect` | An end-to-end Machine Learning Operations (MLOps) architecture on Databricks encompassing automated feature engineering, experiment tracking, model registry, and serverless model serving. |
| 8 | **Databricks Serverless Compute Architecture** | `🟣 Architect` | A cloud compute model where Databricks manages an instant warm pool of virtual machines in the Databricks compute plane, eliminating cluster startup latency. |
| 9 | **Databricks Serverless Compute Plane** | `🟣 Architect` | A fully managed, instant-start compute tier running inside Databricks-managed cloud subscriptions with pre-warmed container fleets and sub-second elasticity. |
| 10 | **Databricks Workflows vs Airflow** | `🟣 Architect` | The architectural decision framework comparing native Databricks Workflows with external general-purpose orchestrators like Apache Airflow. |
| 11 | **Disaster Recovery for Databricks** | `🟣 Architect` | The disaster recovery (DR) architecture for Databricks ensuring business continuity, minimal RPO, and near-zero RTO during regional cloud infrastructure outages. |
| 12 | **Petabyte-Scale ELT on Databricks** | `🟣 Architect` | The architectural principles and tuning strategies required to ingest, transform, and merge petabyte-scale data volumes on Databricks with predictable SLAs. |
| 13 | **Real-Time Lakehouse Architecture** | `🟣 Architect` | A unified lakehouse architecture that processes high-frequency real-time event streams (Kafka, Event Hubs) with sub-second to minute-level latency directly into Delta Lake. |

</details>

</details>

</details>

<details>
<summary><b>⚡ Relational SQL, Query Optimization & Transaction Engine (91 Topics across 5 Sections)</b> — <i>Click to expand module</i></summary>

<details>
<summary>&nbsp;&nbsp;📂 <b>Section: Query Execution Plans & Optimization (13 Topics)</b> — <i>Click to expand functional domain</i></summary>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟢 Easy: <b>🟢 Easy (Level 100) (2 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **GROUP BY: Stream Aggregate vs Hash Aggregate** | `🟢 Easy` | A relational aggregation operator that collapses rows sharing identical key values into single summary rows via physical Stream or Hash algorithms. |
| 2 | **ORDER BY: Quicksort vs External Merge Sort** | `🟢 Easy` | The physical sorting operator applied to an intermediate rowset to guarantee deterministic ordering across returned records. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟡 Intermediate: <b>🟡 Intermediate (Level 200) (5 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Database Statistics & Histograms** | `🟡 Intermediate` | System tables storing data distribution histograms used by the query optimizer to estimate rows and build execution plans. |
| 2 | **Query Store** | `🟡 Intermediate` | A database feature that automatically captures history of queries, execution plans, and runtime statistics to simplify performance tuning. |
| 3 | **SARGable Predicates and Index Seek Optimization** | `🟡 Intermediate` | SARGability refers to query predicates written in a structure that allows relational query optimizers to utilize B-tree index seeks rather than forcing full table or clustered index scans. |
| 4 | **SQL Server Query Store Regressions** | `🟡 Intermediate` | An internal flight recorder capturing execution plan history, runtime statistics, and forced plan pinning. |
| 5 | **Stored Procedures & Execution Plan Caching** | `🟡 Intermediate` | Precompiled collections of procedural and relational statements stored in the database catalog that reuse cached execution plans. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🔴 Advanced: <b>🔴 Advanced (Level 300) (5 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **COUNT(*) vs COUNT(1): Optimizer Equivalence & Semantics** | `🔴 Advanced` | The comparison between full-table tuple counting and scalar expression counting in SQL query engines. |
| 2 | **Parameter Sniffing & Query Plan Cache Mechanics** | `🔴 Advanced` | A database optimizer behavior where a query plan is compiled and cached using parameter values from its initial invocation, leading to severe performance degradation on subsequent runs with different data distributions. |
| 3 | **Query Optimizer Plan Hints: Force Order & Index Directives** | `🔴 Advanced` | Explicit syntax directives embedded in SQL queries that override cost-based optimizer choices regarding joins, indexes, or parallelism. |
| 4 | **Sargability & Search Argument Able Predicates** | `🔴 Advanced` | The property of a query predicate that allows the query optimizer to utilize a B-Tree index seek rather than an index scan or table scan. |
| 5 | **SARGability (Search Argument Able)** | `🔴 Advanced` | The property of a query predicate that enables the optimizer to execute an index seek across a B-Tree rather than falling back to an exhaustive index or table scan. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟣 Architect: <b>🟣 Staff Architect (Level 400) (1 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Physical Join Algorithms: Nested Loops, Merge, and Hash Joins** | `🟣 Architect` | The three physical execution operators employed by cost-based query optimizers to combine two data streams. |

</details>

</details>

<details>
<summary>&nbsp;&nbsp;📂 <b>Section: Window Functions & Analytical Framing (9 Topics)</b> — <i>Click to expand functional domain</i></summary>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟢 Easy: <b>🟢 Easy (Level 100) (1 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **ROW_NUMBER() vs. RANK() vs. DENSE_RANK()** | `🟢 Easy` | The three primary SQL ranking window functions that assign integer ordinals to rows based on an ORDER BY specification within a partition. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟡 Intermediate: <b>🟡 Intermediate (Level 200) (4 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Recursive CTEs: Anchor, Working Tables & Cycle Traps** | `🟡 Intermediate` | A hierarchical query structure that repeatedly executes an iterative subquery over intermediate working tables until an empty rowset is returned. |
| 2 | **The QUALIFY Clause in Modern SQL** | `🟡 Intermediate` | A specialized filtering clause in modern analytical engines (Snowflake, BigQuery, Databricks) that filters the results of window functions directly without wrapping queries in subqueries or CTEs. |
| 3 | **Window Frame Specifications: ROWS vs RANGE** | `🟡 Intermediate` | The explicit sliding boundary configuration (e.g. ROWS vs RANGE) that dictates which partition rows are included in a window function's accumulator. |
| 4 | **Window Functions** | `🟡 Intermediate` | Analytical functions that perform calculations across a partition of rows relative to the current row, without collapsing them. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🔴 Advanced: <b>🔴 Advanced (Level 300) (4 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Gaps & Islands Consecutive Sequence Analysis** | `🔴 Advanced` | The Gaps and Islands problem is a classical SQL analytical challenge that involves identifying contiguous sequences of records (islands) and missing intervals (gaps) in sequential data. |
| 2 | **Partial & Filtered Indexes** | `🔴 Advanced` | A B-Tree index built over a subset of a table's rows defined by an explicit predicate (e.g. WHERE active = true or WHERE status != 'ARCHIVED'). |
| 3 | **SQL Window Frame Specifications (ROWS vs. RANGE)** | `🔴 Advanced` | Window frame specifications define the exact subset of rows within a partition evaluated by an analytic or aggregate window function using physical row counts (ROWS) or logical value offsets (RANGE). |
| 4 | **Window Frame Specification: ROWS vs. RANGE** | `🔴 Advanced` | The sub-clause within OVER() that defines the physical or logical boundary of rows evaluated relative to the current row. |

</details>

</details>

<details>
<summary>&nbsp;&nbsp;📂 <b>Section: CTEs, Recursion & Set Operations (4 Topics)</b> — <i>Click to expand functional domain</i></summary>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟢 Easy: <b>🟢 Easy (Level 100) (1 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Common Table Expression (CTE)** | `🟢 Easy` | A temporary named result set defined within the execution scope of a single SELECT, INSERT, UPDATE, or DELETE query. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟡 Intermediate: <b>🟡 Intermediate (Level 200) (3 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Database Cursors: Row-by-Row Penalty & Tempdb Spooling** | `🟡 Intermediate` | A database control structure that enables procedural, iterative traversal of individual query result set rows, incurring severe performance penalties. |
| 2 | **LATERAL Joins & CROSS APPLY** | `🟡 Intermediate` | A correlated join mechanism that allows an inline subquery or table-valued function to reference column values provided by preceding outer rows. |
| 3 | **Recursive Common Table Expressions (WITH RECURSIVE)** | `🟡 Intermediate` | A Recursive CTE is a Common Table Expression that references itself iteratively to traverse hierarchical structures, graph trees, or generate sequential interval series. |

</details>

</details>

<details>
<summary>&nbsp;&nbsp;📂 <b>Section: Indexing Strategies & Storage Architecture (15 Topics)</b> — <i>Click to expand functional domain</i></summary>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟢 Easy: <b>🟢 Easy (Level 100) (4 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **B-Tree Indexes & Leaf Node Traversal** | `🟢 Easy` | Balanced multi-way search tree structures that maintain sorted key orders to facilitate logarithmic O(log N) point seeks and range scans. |
| 2 | **Clustered Index** | `🟢 Easy` | A database index that determines the physical storage order of rows inside a table. |
| 3 | **CREATE TABLE: Schema Metadata & Page Slot Layout** | `🟢 Easy` | The foundational DDL command that provisions table metadata in system catalogs and allocates initial extent/page structures on disk. |
| 4 | **Relational Data Types & Page Byte Alignment** | `🟢 Easy` | The logical specifications (e.g. INT, VARCHAR, DECIMAL) and underlying physical byte packing schemes used to store column values on 8KB database data pages. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟡 Intermediate: <b>🟡 Intermediate (Level 200) (3 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Covering Indexes & Stored Columns (INCLUDE)** | `🟡 Intermediate` | Non-key column payloads appended directly to the leaf nodes of a B-Tree index to satisfy queries without visiting the primary data table. |
| 2 | **Keyset Pagination (Seek Method)** | `🟡 Intermediate` | An optimal pagination strategy that uses the values of the last retrieved row within an inequality filter to seek directly to the next page via indexes. |
| 3 | **Non-Clustered Index** | `🟡 Intermediate` | A separate B-tree structure that maps index keys to clustered index keys or heap row identifiers. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🔴 Advanced: <b>🔴 Advanced (Level 300) (7 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Azure SQL Optimized Locking** | `🔴 Advanced` | Optimized Locking is a database engine capability in Azure SQL that replaces traditional multi-granularity page/row locks with Transaction-ID (XACT) locking and Lock-After-Qualification (LAQ). |
| 2 | **Clustered vs. Non-Clustered B-Tree Indexes** | `🔴 Advanced` | The two fundamental indexing physical storage structures in relational database engines that govern how data rows are stored and retrieved. |
| 3 | **Columnstore Indexes** | `🔴 Advanced` | An index technology that stores and compresses data in a column-oriented format on disk. |
| 4 | **Covering Indexes & Included Columns (INCLUDE)** | `🔴 Advanced` | An indexing design pattern where a non-clustered index contains all columns referenced by a query, completely eliminating Key/Bookmark Lookups. |
| 5 | **SQL Server Columnstore Batch Mode Execution** | `🔴 Advanced` | A relational database execution engine that processes rows in columnar batches of ~900 rows at a time using CPU hardware registers rather than row-by-row iteration. |
| 6 | **Synapse MPP Resource Classes & Columnstore Compression RAM** | `🔴 Advanced` | Workload management memory allocations required to prevent Clustered Columnstore row group spilling to TempDB during bulk loads. |
| 7 | **TempDB Contention** | `🔴 Advanced` | A performance bottleneck caused by allocation page concurrency bottlenecks inside the TempDB database files. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟣 Architect: <b>🟣 Staff Architect (Level 400) (1 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Columnstore Segment Elimination & Memory Grant Governance** | `🟣 Architect` | Low-level columnar storage engine optimization governing rowgroup health, min/max metadata dictionary pruning, and query memory grants. |

</details>

</details>

<details>
<summary>&nbsp;&nbsp;📂 <b>Section: Transactions, Locking & Concurrency (50 Topics)</b> — <i>Click to expand functional domain</i></summary>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟢 Easy: <b>🟢 Easy (Level 100) (12 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Aggregate Semantics: COUNT(*) vs. COUNT(1)** | `🟢 Easy` | Aggregate counting semantics define how the database engine evaluates relational cardinality across row counts, constant literals, and nullable column expressions. |
| 2 | **CRUD Lifecycle & Write-Ahead Logging (WAL)** | `🟢 Easy` | The end-to-end execution lifecycle of DML statements governed by ACID write-ahead logging protocols and buffer pool caching. |
| 3 | **FOREIGN KEY** | `🟢 Easy` | A constraint that links key columns in one table to key columns in another, enforcing referential integrity. |
| 4 | **Foreign Keys: Referential Actions & Lock Cascades** | `🟢 Easy` | Relational integrity constraints that enforce cross-table referential relationships and define automated cascade behaviors on mutations. |
| 5 | **High-Throughput SQL Ingestion via COPY INTO** | `🟢 Easy` | The standard high-performance T-SQL declarative command for parallel, distributed bulk ingestion from cloud storage into relational SQL tables. |
| 6 | **LIMIT & OFFSET Scanning Penalty** | `🟢 Easy` | A common pagination pattern that suffers from linear performance degradation due to mandatory scanning and discarding of preceding offset rows. |
| 7 | **Logical Query Processing Order (S-F-W-G-H-O)** | `🟢 Easy` | Logical Query Processing Order defines the strict conceptual sequence in which the relational database engine evaluates SQL clauses during query execution. |
| 8 | **NULL & Three-Valued Logic (3VL)** | `🟢 Easy` | The foundational relational logic system where boolean expressions evaluate to TRUE, FALSE, or UNKNOWN (NULL). |
| 9 | **Object-Relational Mapping (ORM) & Impedance Mismatch** | `🟢 Easy` | An abstraction layer that maps relational database tables and foreign keys to object-oriented domain classes and in-memory object graphs. |
| 10 | **PolyBase Distributed Query & External Tables** | `🟢 Easy` | A database virtualization and scale-out ingestion technology that maps non-relational storage files into SQL relational external tables. |
| 11 | **Relational JOIN Algorithms: Nested Loops, Hash & Merge** | `🟢 Easy` | The three fundamental physical algorithms employed by query engines to combine tuples from two distinct relational inputs. |
| 12 | **T-SQL OPENROWSET Serverless Data Lake Querying** | `🟢 Easy` | A built-in T-SQL table-valued function that enables instant, serverless querying of data lake files without provisioning managed tables. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟡 Intermediate: <b>🟡 Intermediate (Level 200) (13 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Always On Listener & Read Routing** | `🟡 Intermediate` | A virtual network name and IP address that routes application client connections to the active primary replica or read-scale replicas. |
| 2 | **Common Table Expressions: Optimization Fences vs Inlining** | `🟡 Intermediate` | Named temporary result sets defined via WITH clauses that act as logical subqueries, subject to engine-specific inlining or materialization fences. |
| 3 | **Computed Columns: Virtual vs Persisted** | `🟡 Intermediate` | Columns defined via deterministic expressions whose values are either calculated on-the-fly during query evaluation or physically written to disk. |
| 4 | **Decimal Precision & Scale Mismatch Pitfalls** | `🟡 Intermediate` | Incompatibilities between Spark/Parquet 128-bit decimal implementations and SQL relational decimal scale constraints. |
| 5 | **Ingestion Rejection Limits & Error File Quarantining** | `🟡 Intermediate` | Error tolerance thresholds and automated bad-record logging mechanisms in SQL bulk loading commands. |
| 6 | **Logical Query Execution Order** | `🟡 Intermediate` | The formal sequential order in which a relational database engine processes SQL query clauses, independent of written lexical order. |
| 7 | **ORDER BY in Aggregates: Deterministic String & Array Folding** | `🟡 Intermediate` | SQL syntax that enforces explicit internal sorting of values prior to reduction by array, JSON, or string accumulation functions. |
| 8 | **Outer Joins & Where Predicate Null-Suppression** | `🟡 Intermediate` | Relational joins that preserve unmatched tuples from one or both relations by padding missing attributes with NULLs, and the pitfalls of downstream filtering. |
| 9 | **Read Replicas & Read-Scale Out** | `🟡 Intermediate` | An availability group design that offloads read-only workloads (like reports or backups) to secondary database nodes. |
| 10 | **Schema Drift & Type Coercion during SQL Loading** | `🟡 Intermediate` | Structural and type discrepancies between source file formats and relational SQL target tables that cause ingest failures or data corruption. |
| 11 | **Three-Valued Logic & NULL Propagation** | `🟡 Intermediate` | SQL evaluates boolean expressions using three-valued logic (3VL): TRUE, FALSE, and UNKNOWN, where any direct comparison against NULL yields UNKNOWN. |
| 12 | **Three-Valued Logic (3VL) & The NULL In NOT IN Trap** | `🟡 Intermediate` | The SQL logic standard where boolean expressions evaluate to TRUE, FALSE, or UNKNOWN, and the critical failure pattern where subqueries containing NULL in NOT IN return zero rows. |
| 13 | **Transaction Isolation Levels** | `🟡 Intermediate` | Database settings that control how data modifications are locked and isolated from concurrent transactions. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🔴 Advanced: <b>🔴 Advanced (Level 300) (17 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Always On Availability Groups** | `🔴 Advanced` | A high-availability and disaster recovery solution providing multi-database failover capabilities. |
| 2 | **Database Triggers & Hidden Transaction Side Effects** | `🔴 Advanced` | Event-driven procedural routines executed automatically by the database engine in response to DML operations on a table. |
| 3 | **Deadlocks** | `🔴 Advanced` | A locking contention scenario where two transactions block each other by holding locks on resources the other requires. |
| 4 | **Deadlocks, Blocking & Concurrency Control** | `🔴 Advanced` | A concurrency collision where two or more database sessions hold locks on separate resources while each requests an exclusive lock on the resource held by the other, forming a cyclic dependency. |
| 5 | **GROUPING SETS, CUBE & ROLLUP Multidimensional Aggregations** | `🔴 Advanced` | Advanced aggregation extensions that compute multiple distinct group-by sub-aggregations across multiple dimensional levels in a single scan of the source data. |
| 6 | **MERGE Statement Concurrency Pitfalls & Atomic Upserts** | `🔴 Advanced` | A standard SQL DML command that synchronizes target tables with source data by combining INSERT, UPDATE, and DELETE logic into a single statement. |
| 7 | **Non-Splittable Compression & Multiline Record Bottlenecks** | `🔴 Advanced` | The serialization choke point where compressed text files cannot be split, forcing a distributed cluster down to a single core. |
| 8 | **NULLs in CHECK Constraints Are Truthy** | `🔴 Advanced` | The surprising relational behavior where a CHECK constraint allows an insert or update if the constraint expression evaluates to UNKNOWN (NULL). |
| 9 | **Parameter Sniffing** | `🔴 Advanced` | A database engine compilation behavior where a query plan is optimized based on the parameters passed during first execution. |
| 10 | **Parameter Sniffing & OPTIMIZE FOR Query Hints** | `🔴 Advanced` | Query plan cache degradation where a plan compiled for an outlier parameter value causes catastrophic performance on normal values. |
| 11 | **Read Committed Snapshot Isolation** | `🔴 Advanced` | A database setting that uses row versioning in TempDB to prevent read operations from blocking write operations. |
| 12 | **Read Committed Snapshot Isolation (RCSI)** | `🔴 Advanced` | RCSI is an optimistic concurrency model in Microsoft SQL Server that uses row versioning in TempDB to allow readers to access committed row versions without acquiring shared locks. |
| 13 | **SELECT FOR UPDATE & Concurrency Control (SKIP LOCKED / NOWAIT)** | `🔴 Advanced` | A pessimistic locking clause that acquires exclusive or update row locks on selected records to prevent concurrent modification until transaction commit. |
| 14 | **SQL Dynamic Management Views: sys.dm_exec_sessions and queryinsights** | `🔴 Advanced` | Real-time system catalog views and Fabric performance schemas used by DBAs and data architects to isolate active user sessions, running query statements, and resource bottlenecks. |
| 15 | **SQL Server Error 1205 Deadlock Resolution** | `🔴 Advanced` | A SQL Server Error 1205 deadlock occurs when two or more concurrent transactions hold locks on separate resources and each requests a lock on the other's resource, creating a cyclic dependency. |
| 16 | **TempDB Allocation Map Contention** | `🔴 Advanced` | Concurrency bottlenecks on PFS and SGAM pages in TempDB caused by simultaneous table creation across multiple threads. |
| 17 | **UTF-8 Byte Order Mark (BOM) & Header Alignment Corruption** | `🔴 Advanced` | Hidden 3-byte prefixes (0xEF, 0xBB, 0xBF) in Windows-generated text files that break column 1 mapping in relational bulk loaders. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟣 Architect: <b>🟣 Staff Architect (Level 400) (8 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Always On Availability Groups Multi-Subnet Disaster Recovery** | `🟣 Architect` | Enterprise database clustering architecture providing zero-data-loss synchronous local commit and cross-region asynchronous disaster recovery with automated client failover. |
| 2 | **Always On Availability Groups Quorum** | `🟣 Architect` | High-availability and disaster recovery architecture using Windows Server Failover Clustering quorum and synchronous replication. |
| 3 | **Cardinality Estimation Feedback & IQP** | `🟣 Architect` | Cardinality Estimation (CE) Feedback is an Intelligent Query Processing (IQP) mechanism in SQL Server 2022 that automatically identifies and corrects plan regressions caused by modern CE assumptions. |
| 4 | **Fabric Direct Lake Mode: Zero-ETL VertiPaq Paging** | `🟣 Architect` | A semantic layer breakthrough where Power BI's in-memory VertiPaq engine directly memory-maps Delta Parquet columns from OneLake. |
| 5 | **Partition Switching & Staging Architecture for High-Volume Ingestion** | `🟣 Architect` | Metadata-only table partition modification enabling millions of ingested rows to be swapped into a production table in under 10 milliseconds with zero write locks. |
| 6 | **Petabyte-Scale Staged Ingestion & Partition Switching** | `🟣 Architect` | An enterprise MPP ingestion architecture utilizing unindexed round-robin heap staging, CTAS, and atomic partition metadata swaps. |
| 7 | **Temporal Tables & Point-In-Time Bi-Temporal Auditing** | `🟣 Architect` | System-versioned relational table architecture automatically recording the full history of data modifications with UTC period start/end timestamps. |
| 8 | **The Halloween Problem & Mutation Spooling** | `🟣 Architect` | The Halloween Problem is a relational engine anomaly where an UPDATE operation modifies an indexed column used to locate qualifying rows, causing the query to repeatedly visit and update the same rows. |

</details>

</details>

</details>

<details>
<summary><b>🏛️ Database Architecture, Distributed Sharding & Cloud MPP (79 Topics across 4 Sections)</b> — <i>Click to expand module</i></summary>

<details>
<summary>&nbsp;&nbsp;📂 <b>Section: Distributed Consensus & Replication (8 Topics)</b> — <i>Click to expand functional domain</i></summary>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟡 Intermediate: <b>🟡 Intermediate (Level 200) (2 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **ACID Properties & Physical Engine Enforcements** | `🟡 Intermediate` | The four foundational guarantees—Atomicity, Consistency, Isolation, and Durability—enforced via low-level engine subsystems. |
| 2 | **Database Transactions & Two-Phase Commit (2PC)** | `🟡 Intermediate` | A consensus protocol ensuring atomic commit or rollback across multiple distributed database instances or heterogeneous resources. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🔴 Advanced: <b>🔴 Advanced (Level 300) (3 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Database Traffic Control: Read-After-Write Consistency & GTID Pinning** | `🔴 Advanced` | Routing architectures that decouple reads and writes across replicas while tracking Global Transaction Identifiers (GTIDs) to eliminate replication lag anomalies. |
| 2 | **Quorum Consensus & Redundancy: Multi-Raft, Paxos & Witness Nodes** | `🔴 Advanced` | Distributed consensus algorithms that guarantee fault-tolerant state machine replication across independent nodes through majority voting quorums. |
| 3 | **Read-Replica Replication Lag Mitigation** | `🔴 Advanced` | Architectural patterns preventing stale reads when distributing read traffic across asynchronous database replicas. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟣 Architect: <b>🟣 Staff Architect (Level 400) (3 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Causal Reverse Anomaly in Asynchronous Replication** | `🟣 Architect` | A distributed consistency anomaly where an effect appears to precede its cause in replica read logs due to asynchronous replication delays or clock skew. |
| 2 | **Distributed Two-Phase Commit & Cross-Shard Transaction Latency** | `🟣 Architect` | The distributed consensus protocol used to guarantee atomic transactions across multiple database shards, and the inherent latency and locking bottlenecks it introduces. |
| 3 | **Transaction Isolation Levels: Snapshot Isolation, SSI & Linearizability** | `🟣 Architect` | The spectrum of transactional safety guarantees in distributed databases, spanning Read Committed, Snapshot Isolation, Serializable SSI, and External Consistency (Linearizability). |

</details>

</details>

<details>
<summary>&nbsp;&nbsp;📂 <b>Section: Storage Engines, LSM & B-Trees (4 Topics)</b> — <i>Click to expand functional domain</i></summary>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟡 Intermediate: <b>🟡 Intermediate (Level 200) (1 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Storage Engine Trade-offs: LSM-Trees vs B+Trees & Compaction Dynamics** | `🟡 Intermediate` | The foundational architectural trade-offs between write-optimized Log-Structured Merge Trees (LSM) and read-optimized B+Tree storage engines in modern database design. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🔴 Advanced: <b>🔴 Advanced (Level 300) (2 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **MVCC Garbage Collection & Table Bloat (VACUUM / Undo Purge)** | `🔴 Advanced` | The internal storage engine processes responsible for reclaiming physical disk space occupied by obsolete, dead row versions under MVCC. |
| 2 | **Zigzag Join (Multi-Index Merge Intersection)** | `🔴 Advanced` | An advanced physical query optimization algorithm that finds matching rows across multiple B-Tree indexes by jumping back and forth across sorted leaf keys. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟣 Architect: <b>🟣 Staff Architect (Level 400) (1 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Compute & Storage Decoupling: Log-is-the-Database Paradigm** | `🟣 Architect` | A cloud-native database architecture where stateless SQL execution engines are separated from a distributed, purpose-built write-ahead log (WAL) storage tier. |

</details>

</details>

<details>
<summary>&nbsp;&nbsp;📂 <b>Section: Sharding, Partitioning & Traffic Control (6 Topics)</b> — <i>Click to expand functional domain</i></summary>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟢 Easy: <b>🟢 Easy (Level 100) (1 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Database Sharding Topologies & Live Dynamic Re-sharding** | `🟢 Easy` | Techniques for horizontally partitioning database tables across independent physical nodes and dynamically splitting shards in production with zero application downtime. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟡 Intermediate: <b>🟡 Intermediate (Level 200) (1 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Attribute-Based Dynamic Column Masking (ABAC)** | `🟡 Intermediate` | A runtime security policy engine that evaluates user attributes (role, department, clearance) to conditionally mask, hash, or redact sensitive column values without duplicating tables. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🔴 Advanced: <b>🔴 Advanced (Level 300) (1 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Database Sharding & Distributed Hash Routing** | `🔴 Advanced` | A shared-nothing horizontal scaling architecture where a large relational dataset is partitioned across independent physical database instances via a shard key. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟣 Architect: <b>🟣 Staff Architect (Level 400) (3 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Azure Synapse Table Distributions (Hash, Round-Robin, Replicated)** | `🟣 Architect` | The architectural data distribution strategies across 60 fixed storage buckets that govern data movement and query parallelization in Azure Synapse dedicated SQL pools. |
| 2 | **Database Cracking & Self-Organizing Adaptive Indexing** | `🟣 Architect` | An autonomous physical indexing architecture where queries adaptively partition and sort columns on-the-fly as a side-effect of query execution. |
| 3 | **Vitess Architecture & VSchema Declarative Sharding** | `🟣 Architect` | A cloud-native horizontal database scaling engine for MySQL that abstracts sharded storage behind stateless query proxies (VTGate) governed by declarative JSON schemas (VSchema). |

</details>

</details>

<details>
<summary>&nbsp;&nbsp;📂 <b>Section: Compute-Storage Decoupling & Modern MPP (61 Topics)</b> — <i>Click to expand functional domain</i></summary>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟢 Easy: <b>🟢 Easy (Level 100) (5 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **High Cardinality** | `🟢 Easy` | Column with many distinct values (like CustomerID with millions of unique customers). |
| 2 | **Low Cardinality** | `🟢 Easy` | Column with few distinct values (like ProductCategory with only 15 categories). |
| 3 | **OLAP (Online Analytical Processing)** | `🟢 Easy` | Workload pattern focused on complex queries, aggregations, and read-heavy analytics. |
| 4 | **OLTP (Online Transaction Processing)** | `🟢 Easy` | Workload pattern focused on transactional operations with frequent inserts, updates, and deletes. |
| 5 | **Rowstore Index** | `🟢 Easy` | Traditional row-based storage optimized for OLTP workloads with frequent inserts, updates, and single-row lookups. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟡 Intermediate: <b>🟡 Intermediate (Level 200) (13 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Columnstore Index** | `🟡 Intermediate` | A storage structure that organizes data by columns rather than rows, optimized for analytical queries that scan large datasets. |
| 2 | **Connection Pools & Thread/Process Multiplexing** | `🟡 Intermediate` | A persistent cache of open database connections that multiplexes high-volume client application requests over a fixed pool of server backends. |
| 3 | **Database Backpressure & Concurrency Admission Control** | `🟡 Intermediate` | Flow-control and overload-shedding mechanisms that regulate query ingress, enforcing Little's Law to prevent database CPU thrashing, memory exhaustion, and cascading collapse. |
| 4 | **Database Branching & Copy-on-Write CoW Virtual Forks** | `🟡 Intermediate` | A Git-like database lifecycle capability that instantly provisions isolated, fully functional database clones in seconds using Copy-on-Write pointer manipulation without duplicating physical data. |
| 5 | **Database Connection Pooling (PgBouncer)** | `🟡 Intermediate` | Maintaining an in-memory pool of reusable database connections to eliminate per-request connection handshake latency. |
| 6 | **Dictionary Encoding** | `🟡 Intermediate` | Compression technique that replaces repeating values with smaller numeric identifiers and stores a lookup dictionary. |
| 7 | **Inverted Indexes (GIN & Full-Text Search)** | `🟡 Intermediate` | An indexing structure that maps discrete elements (such as tokens, tags, or JSON keys) to sorted posting lists of containing document/row IDs. |
| 8 | **ORM Query Degradation & N+1 Cascade Problem** | `🟡 Intermediate` | The systemic performance degradation that occurs when object-relational mapping frameworks generate chatty, unindexed, or Cartesian queries. |
| 9 | **Query Plans & EXPLAIN ANALYZE Mechanics** | `🟡 Intermediate` | The tree of relational operators generated by the cost-based optimizer detailing physical access paths, join algorithms, and actual execution metrics. |
| 10 | **Relational Normal Forms (1NF through 5NF & BCNF)** | `🟡 Intermediate` | A mathematical progression of design rules based on functional dependencies designed to eliminate data redundancy and update anomalies. |
| 11 | **Run-Length Encoding (RLE)** | `🟡 Intermediate` | Compression method that stores consecutive identical values as a single value with a count. |
| 12 | **Segment Elimination** | `🟡 Intermediate` | Performance optimization where columnstore skips reading irrelevant data segments based on min/max statistics. |
| 13 | **The DUAL Table & Relational Projection Semantics** | `🟡 Intermediate` | A special single-row dummy table used in SQL engines (historically Oracle and MySQL) to evaluate scalar expressions within relational SELECT syntax. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🔴 Advanced: <b>🔴 Advanced (Level 300) (20 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Ambiguous Network Errors & Two-Generals Commit Dilemma** | `🔴 Advanced` | The distributed systems dilemma where a network socket drops during a COMMIT operation, leaving the client in an indeterminate transactional state. |
| 2 | **Ascending Key Problem in B-Trees** | `🔴 Advanced` | The severe concurrency and optimizer degradation that occurs when high-volume inserts target monotonically increasing primary keys. |
| 3 | **Batch Mode Processing** | `🔴 Advanced` | Query execution method that processes multiple rows simultaneously, available with columnstore indexes. |
| 4 | **Bit-Packing** | `🔴 Advanced` | Compression technique that uses minimum number of bits required to represent numerical values. |
| 5 | **Cost-Based Optimizers & Table Statistics Histograms** | `🔴 Advanced` | Statistical metadata describing column value distributions, null fractions, and density vectors used by optimizers to estimate query plan costs. |
| 6 | **Deploy Requests & Zero-Downtime Online Schema Migrations with gh-ost** | `🔴 Advanced` | An asynchronous schema migration methodology that modifies large tables without locking DDL, using shadow tables, continuous CDC binlog stream catchup, and atomic cutovers. |
| 7 | **MySQL utf8 Truncation Bug vs utf8mb4** | `🔴 Advanced` | The notorious legacy encoding issue in MySQL where the 'utf8' charset supported only 3 bytes, causing silent data truncation on modern 4-byte Unicode characters. |
| 8 | **PAGE Compression** | `🔴 Advanced` | Row-level compression technique that removes repetitive data within database pages, used in rowstore scenarios. |
| 9 | **Phantom Reads & Next-Key Locking** | `🔴 Advanced` | A concurrency anomaly where a transaction reads a set of rows satisfying a predicate, but a concurrent committed transaction inserts a new row matching that predicate. |
| 10 | **PostgreSQL BRIN (Block Range Index)** | `🔴 Advanced` | An index storing minimum and maximum values for physical disk block ranges, delivering compact indexing on ordered tables. |
| 11 | **PostgreSQL MVCC Table Bloat & VACUUM** | `🔴 Advanced` | Multi-Version Concurrency Control dead tuple accumulation and automated background vacuuming mechanics. |
| 12 | **Relational Denormalization Strategies** | `🔴 Advanced` | The intentional reintroduction of redundant data into a relational schema to optimize read latency and eliminate expensive multi-table joins. |
| 13 | **Serializable Restarts & SQLSTATE 40001 Retry Loops** | `🔴 Advanced` | The architectural requirement that applications executing under Serializable Snapshot Isolation must wrap all transactions in retry loops to handle serialization failures. |
| 14 | **Set-Returning Generator Functions & Cross Join Alignment** | `🔴 Advanced` | The distinct behavior of set-returning functions (SRFs) in SQL engines, contrasting row-wise zipping with Cartesian expansion. |
| 15 | **Star Schema vs Normalized 3NF Relational Engines** | `🔴 Advanced` | The architectural contrast between highly normalized 3NF schemas optimized for transactional write isolation and denormalized star schemas optimized for analytical OLAP scans. |
| 16 | **There Are No Non-Nullable Types in SQL** | `🔴 Advanced` | The relational truth that column-level NOT NULL constraints do not guarantee non-nullability across expressions, outer joins, and aggregations. |
| 17 | **TIMESTAMPTZ Does Not Store a Time Zone** | `🔴 Advanced` | The common misconception in PostgreSQL and relational standards regarding how timezone-aware timestamps are physically stored on disk. |
| 18 | **Transaction Contention, Latch Waits & Hotspots** | `🔴 Advanced` | The serialization bottleneck caused by concurrent sessions competing for identical logical row locks or physical in-memory page latches. |
| 19 | **Transaction Isolation Levels & Concurrency Anomalies** | `🔴 Advanced` | The formal ANSI/ISO standards defining transaction boundary guarantees and the specific concurrency anomalies each level permits or prohibits. |
| 20 | **Write Skew Anomaly in Snapshot Isolation** | `🔴 Advanced` | A subtle concurrency anomaly occurring under Snapshot Isolation where two concurrent transactions read overlapping data but modify disjoint rows, violating an invariant. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟣 Architect: <b>🟣 Staff Architect (Level 400) (23 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **'null'::jsonb IS NULL Evaluates to False** | `🟣 Architect` | The semantic distinction in PostgreSQL between a JSON-encoded null primitive and a relational SQL NULL value. |
| 2 | **Azure Data Explorer (ADX) vs Azure Synapse Analytics Workload Selection** | `🟣 Architect` | Architectural decision criteria for selecting between indexing-optimized real-time telemetry exploration (ADX/KQL) and massively parallel relational data warehousing (Synapse/Fabric Warehouse). |
| 3 | **Azure Synapse Resource Classes (Static vs. Dynamic)** | `🟣 Architect` | Pre-determined resource limits and memory allocation governance profiles assigned to database roles in Azure Synapse to control query memory grants and concurrency. |
| 4 | **Cost Models vs Physical Hardware Reality** | `🟣 Architect` | The systemic divergence between static relational query optimizer cost formulas and the physical realities of modern hardware (NVMe SSDs, tiered memory, and CPU caches). |
| 5 | **DEFERRABLE INITIALLY IMMEDIATE Constraints** | `🟣 Architect` | A relational constraint configuration that allows integrity checks (such as foreign keys or unique constraints) to be postponed until transaction commit. |
| 6 | **Every SQL Operator as a Relational Join** | `🟣 Architect` | The theoretical mathematical proof in relational algebra demonstrating that Selection, Projection, Union, and Intersection can be expressed as joins. |
| 7 | **EXPLAIN Catalog Approximations for Row Counts** | `🟣 Architect` | A technique that retrieves sub-millisecond approximate table row counts by inspecting system catalog metadata instead of executing full table scans. |
| 8 | **Fsyncgate: Linux Kernel Page Cache Error Dropping** | `🟣 Architect` | The critical 2018 discovery where the Linux kernel cleared dirty page flags upon writeback I/O error, causing subsequent fsync calls to falsely report success. |
| 9 | **Join Ordering Complexity (NP-Hard Search Space)** | `🟣 Architect` | The combinatorial explosion of possible join order permutations that makes finding the mathematically optimal query plan an NP-hard problem. |
| 10 | **Learned Index Structures (Recursive Model Indexes / RMI)** | `🟣 Architect` | The machine learning paradigm pioneered by Kraska et al. that replaces traditional B-Trees with recursive functional regression models to predict key positions. |
| 11 | **MATCH PARTIAL Composite Foreign Key Semantics** | `🟣 Architect` | An esoteric SQL standard rule for composite foreign keys that specifies validation behavior when only a subset of composite key columns contain NULL. |
| 12 | **NULL Equality in DISTINCT vs UNIQUE Constraints** | `🟣 Architect` | The formal divergence in SQL standard specifications where DISTINCT treats NULLs as identical duplicates, while UNIQUE constraints treat them as distinct. |
| 13 | **Relational NULL & Codd's Missing Information Foundations** | `🟣 Architect` | The formal mathematical critique of NULL in relational theory and E.F. Codd's distinction between 'Value Unknown' and 'Value Inapplicable'. |
| 14 | **SERIAL & Sequence Generation Non-Transactional Gaps** | `🟣 Architect` | The deliberate non-transactional design of database sequence generators (SERIAL, IDENTITY, SEQUENCE) that produce permanent gaps upon rollback. |
| 15 | **Slowly Changing Dimension (SCD) Type 2 in Microsoft Fabric** | `🟣 Architect` | The dimensional modeling pattern that maintains a complete history of attribute modifications by creating versioned records with validity timestamps and active flags using Delta Lake MERGE. |
| 16 | **TABLE_DEE and TABLE_DUM Relational Identities** | `🟣 Architect` | The two fundamental identity relations in formal relational theory (Date & Darwen) possessing zero attributes, representing boolean TRUE and FALSE. |
| 17 | **The 'allballs' Time Literal in PostgreSQL** | `🟣 Architect` | A historical, quirky reserved string literal in PostgreSQL that parses into '00:00:00.00' UTC time (all zeroes). |
| 18 | **The Halloween Problem & Update Mutation Scanning** | `🟣 Architect` | A database mutation phenomenon where an UPDATE operation modifies an indexed column, causing modified rows to advance forward and be mutated repeatedly. |
| 19 | **TPC-C Benchmark Specification & Artificial Keying Times** | `🟣 Architect` | The mandatory simulation of human interactive delay (keying and think times) codified in the TPC-C benchmark standard. |
| 20 | **Transaction ID (XTID) Exhaustion & Wraparound Emergency** | `🟣 Architect` | The catastrophic scenario in 32-bit MVCC engines where transaction counter limits threaten to treat all historical data as invisible, forcing database shutdown. |
| 21 | **Vectorized Execution vs Hardware SIMD Vectorization** | `🟣 Architect` | The distinction between block-oriented tuple-at-a-time engine pipelines and hardware-level CPU SIMD vector register instructions. |
| 22 | **Volcano Iterator Execution Model & Cache Misses** | `🟣 Architect` | The classical demand-driven query execution model where operators implement an open()-next()-close() iterator interface pulling one tuple at a time. |
| 23 | **Worst-Case Optimal Joins (WCOJ) & Leapfrog Triejoin** | `🟣 Architect` | A class of multiway join algorithms whose runtime is asymptotically bounded by the Atserias-Grohe-Marx (AGM) bound, bypassing binary join bottlenecks. |

</details>

</details>

</details>

<details>
<summary><b>🌊 Real-Time Streaming Lakehouse, CDC & Table Formats (76 Topics across 4 Sections)</b> — <i>Click to expand module</i></summary>

<details>
<summary>&nbsp;&nbsp;📂 <b>Section: Open Table Formats (Iceberg, Delta, Hudi) (22 Topics)</b> — <i>Click to expand functional domain</i></summary>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟢 Easy: <b>🟢 Easy (Level 100) (1 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Apache Iceberg Hidden Partitioning & Manifest List Architecture** | `🟢 Easy` | Decouples table partitioning from physical directory structures, avoiding Hive-style column path rewrites. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟡 Intermediate: <b>🟡 Intermediate (Level 200) (4 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Apache Hudi Copy-On-Write (COW)** | `🟡 Intermediate` | A table type that rewrites entire Parquet data files upon receiving row updates, maximizing subsequent read scan speeds. |
| 2 | **Delta Lake Column Mapping** | `🟡 Intermediate` | A Delta Lake metadata feature that decouples logical column names exposed to users from physical column identifiers stored inside Parquet files. |
| 3 | **Delta Lake Deletion Vectors (DV) vs Copy-on-Write (CoW)** | `🟡 Intermediate` | Soft-delete bitmap index avoiding full Parquet file rewrites on UPDATE and DELETE operations. |
| 4 | **Delta Standalone Reader & Writer** | `🟡 Intermediate` | A lightweight JVM library that allows reading and writing Delta Lake tables directly without requiring an active Apache Spark cluster or runtime. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🔴 Advanced: <b>🔴 Advanced (Level 300) (6 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Apache Hudi Merge-On-Read (MOR)** | `🔴 Advanced` | A table type storing real-time updates in compact columnar log files, merging with base Parquet files during query execution. |
| 2 | **Apache Iceberg Partition Evolution** | `🔴 Advanced` | A table format capability that updates partitioning schemas (e.g. from month to day) without rewriting historical data or invalidating existing queries. |
| 3 | **Copy-on-Write vs Merge-on-Read Table Format Trade-offs** | `🔴 Advanced` | The fundamental write-latency versus read-amplification trade-off between rewriting entire data files on mutation versus appending delta deletion files. |
| 4 | **Delta Lake Soft Deletion Vectors** | `🔴 Advanced` | Binary vector files recording deleted row positions, decoupling mutations from 500MB Parquet rewrites. |
| 5 | **Iceberg Equality Deletes vs. Position Deletes** | `🔴 Advanced` | The two deletion vector mechanisms supported by Apache Iceberg v2 to handle row-level deletions and updates without full data file rewrites. |
| 6 | **Iceberg Snapshot Expiration** | `🔴 Advanced` | Purging historical Iceberg table metadata and unreferenced Parquet data files to reclaim cloud storage and bound manifest list scan latency. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟣 Architect: <b>🟣 Staff Architect (Level 400) (11 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Apache Iceberg REST Catalog Open Specification** | `🟣 Architect` | A vendor-neutral OpenAPI protocol that standardizes how query engines discover namespaces, load table metadata pointers, and perform atomic multi-table commit transactions. |
| 2 | **Apache Iceberg REST Catalog Specification** | `🟣 Architect` | An open, vendor-neutral HTTP OpenAPI standard for metadata discovery, atomic commit coordination, and table credential vending across multi-engine lakehouses. |
| 3 | **Apache Polaris Catalog Federation** | `🟣 Architect` | An open-source centralized metadata catalog built on the Apache Iceberg REST specification, providing unified cross-cloud governance and multi-engine interoperability. |
| 4 | **Delta Lake Change Data Feed (CDC & table_changes TVF)** | `🟣 Architect` | A native Delta table capability that exposes row-level change events (inserts, update pre-images, update post-images, deletes) between table versions. |
| 5 | **Delta Lake Conflict Detection Matrix** | `🟣 Architect` | The formal concurrency matrix in Delta Lake defining which write operations (append, update, delete, compaction) can commit concurrently under WriteSerializable isolation. |
| 6 | **Delta Lake Deletion Vectors (Merge-on-Read)** | `🟣 Architect` | A storage optimization that shifts Delta Lake write operations from Copy-on-Write (CoW) to Merge-on-Read (MoR) using compact RoaringBitmap row tombstones. |
| 7 | **Delta Lake Liquid Clustering & Space-Filling Curves** | `🟣 Architect` | A dynamic layout optimization using Hilbert space-filling curves that replaces rigid Hive-style directory partitioning and manual Z-Ordering. |
| 8 | **Delta Lake UniForm (Universal Format)** | `🟣 Architect` | An open lakehouse capability that writes Delta Parquet data files once while generating Iceberg and Hudi metadata asynchronously for multi-engine zero-copy read interoperability. |
| 9 | **Lakehouse UniForm Hudi Interoperability** | `🟣 Architect` | Cross-engine interoperability standard converting Delta commit logs into Apache Hudi timeline commit files. |
| 10 | **Power BI Direct Lake Mode: In-Memory VertiPaq Paging** | `🟣 Architect` | Zero-copy semantic model serving directly from OneLake Delta Parquet without Import or DirectQuery latency. |
| 11 | **UniForm Iceberg Metadata Translator** | `🟣 Architect` | The background asynchronous daemon in Delta Lake that converts Delta action commits into Apache Iceberg metadata manifest trees. |

</details>

</details>

<details>
<summary>&nbsp;&nbsp;📂 <b>Section: Real-Time Streaming & Watermarking (3 Topics)</b> — <i>Click to expand functional domain</i></summary>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🔴 Advanced: <b>🔴 Advanced (Level 300) (2 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Apache Paimon Streaming Lakehouse** | `🔴 Advanced` | A streaming lakehouse storage format developed for high-throughput changelog ingestion, sub-second real-time streaming updates, and primary-key upserts with Apache Flink. |
| 2 | **Structured Streaming Watermarking & Allowed Lateness** | `🔴 Advanced` | Threshold specifying how far event-time can lag behind maximum observed event-time before data is dropped. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟣 Architect: <b>🟣 Staff Architect (Level 400) (1 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Debezium CDC & Analytical Stream Decoupling** | `🟣 Architect` | Debezium CDC is a distributed transaction log mining engine that captures row-level database changes in real time, streaming events into Kafka to decouple OLTP from analytical lakehouses. |

</details>

</details>

<details>
<summary>&nbsp;&nbsp;📂 <b>Section: Engine Vectorization & Hardware Acceleration (4 Topics)</b> — <i>Click to expand functional domain</i></summary>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟢 Easy: <b>🟢 Easy (Level 100) (2 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **In-Process Analytics Revolution: DuckDB and Polars via Apache Arrow Zero-Copy** | `🟢 Easy` | Serverless local analytical engines sharing columnar memory without serialization or network hops. |
| 2 | **Parquet Vectorized Decoding & Predicate Pushdown** | `🟢 Easy` | SIMD-accelerated column decoding combined with metadata-driven row group skipping via min/max statistics. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟡 Intermediate: <b>🟡 Intermediate (Level 200) (1 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Cross-Engine Data Manipulation (Rosetta Stone)** | `🟡 Intermediate` | The Cross-Engine Rosetta Stone is an architectural translation matrix mapping common data engineering operations across SQL, PySpark, Pandas, and Polars. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟣 Architect: <b>🟣 Staff Architect (Level 400) (1 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Databricks Serverless Compute & Photon Vectorized C++ Engine** | `🟣 Architect` | Instant-on, fully managed C++ query engine separating cluster provisioning from SQL execution. |

</details>

</details>

<details>
<summary>&nbsp;&nbsp;📂 <b>Section: Distributed State, CDC & Lakehouse Ingestion (47 Topics)</b> — <i>Click to expand functional domain</i></summary>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟡 Intermediate: <b>🟡 Intermediate (Level 200) (6 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Apache Airflow 3.0 Asset-Driven Scheduling & Deferrable Operators** | `🟡 Intermediate` | Event-driven DAG execution triggered by dataset updates combined with async triggerer workers. |
| 2 | **Hybrid Search Retrieval over Lakehouse Tables** | `🟡 Intermediate` | An enterprise retrieval architecture that merges sparse keyword search (BM25) with dense vector embeddings to provide accurate, hallucination-resistant context for RAG agents. |
| 3 | **OpenLineage & Spark UI DAG Task Skew Diagnostics** | `🟡 Intermediate` | Open-source standard for runtime lineage collection paired with Spark UI partition duration metrics. |
| 4 | **Parquet ZSTD Level 7 Recompression** | `🟡 Intermediate` | A high-ratio columnar compression algorithm developed by Facebook, offering 35-40% smaller disk footprint than Snappy with virtually identical decompression speed. |
| 5 | **QUALIFY Clause Window Filtering** | `🟡 Intermediate` | The QUALIFY clause filters the results of window functions directly within a single SELECT statement without requiring nested subqueries or Common Table Expressions. |
| 6 | **Spark 4.0 AQE Dynamic Shuffle Coalescing & Skew Join Mitigation** | `🟡 Intermediate` | Runtime query plan adjustments based on actual shuffle statistics collected during stage execution. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🔴 Advanced: <b>🔴 Advanced (Level 300) (9 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **AI Data Workload Unit Economics** | `🔴 Advanced` | The cost model for delivering one useful AI-enabled data task, including retrieval, query compute, model inference, storage, and human review. |
| 2 | **CAP & PACELC Theorem in Modern Data Stores** | `🔴 Advanced` | In a network partition (P), trade off Availability (A) vs Consistency (C). PACELC extends this: Else (E), trade off Latency (L) vs Consistency (C). |
| 3 | **Cosmos DB Request Units (RU/s) & Analytical Store (HTAP)** | `🔴 Advanced` | Hybrid Transactional/Analytical Processing isolating row-store OLTP from columnar analytical sync. |
| 4 | **Cross-Cloud Egress-Aware Data Placement** | `🔴 Advanced` | A placement decision that weighs compute location, data gravity, egress charges, latency, residency, and operational ownership across cloud boundaries. |
| 5 | **Databricks Asset Bundles (DABs) & Declarative DataOps Pipelines** | `🔴 Advanced` | Infrastructure-as-Code for lakehouses defining jobs, pipelines, and permissions in version-controlled YAML. |
| 6 | **Lakehouse Deletion Vectors for Right-to-be-Forgotten Compliance** | `🔴 Advanced` | The application of lightweight position deletion files to remove individual customer PII records from immutable Parquet tables in compliance with privacy regulations without rewriting historical files. |
| 7 | **Star Schema Many-to-Many Bridge Tables** | `🔴 Advanced` | A Bridge Table (junction table) is an intermediate modeling construct in a Kimball Star Schema that resolves many-to-many relationships between facts and dimensions without Cartesian fan-out. |
| 8 | **Unity Catalog 3-Level Namespace & Attribute-Based Access Control (ABAC)** | `🔴 Advanced` | Unified lakehouse governance with catalog.schema.table namespace and tag-based dynamic masking policies. |
| 9 | **Vector Indexing Architecture: HNSW vs IVF in Enterprise RAG** | `🔴 Advanced` | Trade-offs between graph-based Hierarchical Navigable Small World and inverted file cluster indexing. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟣 Architect: <b>🟣 Staff Architect (Level 400) (32 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Architectural Decision Records (ADRs) for Data Platforms** | `🟣 Architect` | A lightweight, immutable document capturing significant technical architecture decisions, the historical context, explored alternatives, and accepted long-term trade-offs. |
| 2 | **Blameless Data Incident Postmortems & Cost of Downtime** | `🟣 Architect` | A structured, blameless retrospective methodology for analyzing production data outages, identifying systemic root causes, quantifying financial impact, and implementing permanent safeguards. |
| 3 | **Canary Data Pipeline Deployment & Abort Circuit** | `🟣 Architect` | A release strategy where new pipeline code or transformation logic processes a small fraction of live data or runs in parallel shadow mode before full production cutover. |
| 4 | **Clustered Columnstore Rowgroup Health** | `🟣 Architect` | Columnstore rowgroup health measures the size, compaction state, and row count of columnar rowgroups, where the optimal target is exactly 1,048,576 rows per compressed rowgroup. |
| 5 | **Column-Level Encryption & Tokenization (FPE)** | `🟣 Architect` | Cryptographic data protection mechanisms that encrypt or tokenize sensitive PII attributes while preserving original data formats and enabling analytical queries. |
| 6 | **Data Asset Sunsetting & Graveyard Archiving** | `🟣 Architect` | A formal decommission and archival lifecycle process that safely retires obsolete data assets, reclaims storage costs, and satisfies legal record retention compliance. |
| 7 | **Data Contract Specification & Drift Prevention** | `🟣 Architect` | An explicit, version-controlled agreement between data producers and consumers specifying schema definitions, business semantics, SLA guarantees, and change management protocols. |
| 8 | **Data FinOps Unit Economics & Workload Right-Sizing** | `🟣 Architect` | The practice of measuring and optimizing cloud data platform expenditures by attributing costs to granular business units, product features, and computational workloads. |
| 9 | **Data Incident Severity Matrix & Escalation Routing** | `🟣 Architect` | A standardized taxonomy defining incident severity levels (SEV-1 to SEV-4) based on consumer impact, with automated paging and response time service levels. |
| 10 | **Data Mesh Federated Governance & Data Product Contracts (ODCS)** | `🟣 Architect` | Decentralized domain ownership with centralized automated compliance and declarative schema contracts. |
| 11 | **Data Product Intake & Problem Framing** | `🟣 Architect` | A formal engineering discovery gate that captures business problem statements, baseline metrics, downstream decision cycles, and platform risk tiering before technical design commences. |
| 12 | **Data SLA, SLO & Error Budget Specification** | `🟣 Architect` | A quantifiable framework translating business expectations into measurable pipeline metrics: Service Level Indicators (SLIs), Service Level Objectives (SLOs), and enforceable Service Level Agreements (SLAs). |
| 13 | **DataOps Testing Pyramid & Quality Assertions** | `🟣 Architect` | A structured testing hierarchy spanning unit tests, integration tests, contract verification, and production data quality assertions (Great Expectations, Soda). |
| 14 | **Dead-Letter Queue (DLQ) Quarantine Architecture** | `🟣 Architect` | An isolation mechanism that routes malformed, corrupted, or non-conforming data records to a quarantined storage queue without halting primary pipeline execution. |
| 15 | **Devcontainers & Ephemeral Data Sandboxes** | `🟣 Architect` | Containerized, reproducible local and cloud-based development environments that allow data engineers to spin up identical toolchains and isolated test databases in seconds. |
| 16 | **Dual-Region Lakehouse Disaster Recovery & RPO/RTO** | `🟣 Architect` | An enterprise business continuity architecture featuring automated metadata synchronization, cross-region object storage replication, and rehearsed failover procedures. |
| 17 | **Fabric Capacity Smoothing & Bursting 24-Hour Windows** | `🟣 Architect` | Resource management model amortizing heavy compute bursts over rolling multi-hour evaluation periods. |
| 18 | **Federated Metadata Control Plane** | `🟣 Architect` | A governance architecture that lets distributed catalogs and data products share discovery and policy context without requiring every dataset to move into one store. |
| 19 | **FinOps Cost Attribution Matrix for Shared Catalogs** | `🟣 Architect` | The allocation framework that attributes compute, storage, and egress spend back to specific business units and data products across shared enterprise lakehouse infrastructure. |
| 20 | **FinOps DBU/Credit Allocation & Query Result Cache Reuse** | `🟣 Architect` | System table telemetry tracking compute spend with multi-tier cache hits across SQL Warehouses. |
| 21 | **Idempotent Pipeline Patterns & Replay Safety** | `🟣 Architect` | A pipeline architectural design ensuring that executing a data transformation multiple times with identical inputs produces the exact same output without duplicates or data corruption. |
| 22 | **Lakehouse Active-Passive Multi-Region Disaster Recovery** | `🟣 Architect` | An enterprise disaster recovery pattern that replicates lakehouse table metadata and underlying object files to a secondary cloud region to meet strict RPO and RTO recovery mandates. |
| 23 | **Model Context Protocol (MCP) & Lakehouse RAG Vector Search** | `🟣 Architect` | Standardized protocol connecting LLMs to lakehouse metadata and managed vector search indexes. |
| 24 | **Multi-Signal Data Observability & SLO Management** | `🟣 Architect` | A comprehensive operational framework that continuously monitors the five pillars of data health (freshness, volume, schema, quality, and lineage) against defined Service Level Objectives (SLOs). |
| 25 | **Open Lakehouse Interoperability Contract** | `🟣 Architect` | A tested agreement for how multiple engines discover, read, write, and govern shared table data and metadata. |
| 26 | **Policy-as-Code Guardrails for Data Infrastructure** | `🟣 Architect` | The automated enforcement of organizational security, compliance, and FinOps policies through code-defined rules evaluated during CI/CD infrastructure deployments. |
| 27 | **Production Readiness Review (PRR) for Data Products** | `🟣 Architect` | A structured architectural review checklist conducted before promoting a data product to production, verifying operational readiness across security, reliability, observability, and support. |
| 28 | **ScyllaDB C++ Seastar Asynchronous Engine vs JVM Cassandra** | `🟣 Architect` | Share-nothing, thread-per-core asynchronous C++ database architecture eliminating JVM GC latency. |
| 29 | **Supply Chain Levels for Software Artifacts (SLSA) in Data** | `🟣 Architect` | A security framework of standards and verifiable build attestations that protect data pipeline packages, container images, and ML models from tampering throughout the software supply chain. |
| 30 | **The 11 Modern Database Paradigms** | `🟣 Architect` | The 11 Database Paradigms classify storage systems by data structure, access patterns, and consistency guarantees to prevent anti-patterns in polyglot persistence. |
| 31 | **Trunk-Based Development for Data Platforms** | `🟣 Architect` | A source-control branching strategy where data engineers merge small, frequent commits into a single core branch (trunk/main), avoiding long-lived feature branches and merge hell. |
| 32 | **Zero-Downtime Expand/Contract Data Migration** | `🟣 Architect` | A phased database and schema refactoring pattern that guarantees 100% continuous uptime and compatibility across active producers and consumers during major table schema evolutions. |

</details>

</details>

</details>

<details>
<summary><b>🌊 Modern Data Lake Architecture, Storage Layouts & Formats (55 Topics across 3 Sections)</b> — <i>Click to expand module</i></summary>

<details>
<summary>&nbsp;&nbsp;📂 <b>Section: Cloud Object Storage & Prefix Optimization (4 Topics)</b> — <i>Click to expand functional domain</i></summary>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟢 Easy: <b>🟢 Easy (Level 100) (1 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Cloud Object Storage Lifecycle Tiering and Transition Policies** | `🟢 Easy` | Automated storage class transition rules that move aged raw data files from hot storage classes to cold or archive tiers to drastically lower long-term lakehouse storage costs. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟡 Intermediate: <b>🟡 Intermediate (Level 200) (2 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Cloud Object Storage Strong Read-After-Write Consistency** | `🟡 Intermediate` | The durability and ordering guarantee in modern object storage where write and delete operations immediately become visible to all subsequent read and list requests. |
| 2 | **Object Storage** | `🟡 Intermediate` | Flat storage repositories (like ADLS Gen2, AWS S3, GCS) that manage data as objects rather than hierarchical filesystems. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟣 Architect: <b>🟣 Staff Architect (Level 400) (1 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Delta Lake Optimistic Concurrency Control (OCC) & Conflict Resolution** | `🟣 Architect` | ACID transaction coordination protocol managing concurrent multi-engine writes on distributed object storage without centralized locking servers. |

</details>

</details>

<details>
<summary>&nbsp;&nbsp;📂 <b>Section: Columnar & Row Storage Formats (Parquet/ORC/Avro) (13 Topics)</b> — <i>Click to expand functional domain</i></summary>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟢 Easy: <b>🟢 Easy (Level 100) (4 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Apache Avro Binary Row Format & Schema Evolution** | `🟢 Easy` | A compact, row-based binary serialization format with a JSON-encoded schema stored in the file header, designed for streaming and RPC. |
| 2 | **Apache ORC Stripe Architecture & Built-in Indexes** | `🟢 Easy` | An optimized columnar format dividing data into self-contained Stripes (typically 64MB-256MB) with built-in index streams and bloom filters. |
| 3 | **Apache Parquet Hybrid Columnar Anatomy** | `🟢 Easy` | A self-describing, hybrid columnar storage format organized into Row Groups, Column Chunks, and Pages with a Thrift metadata footer. |
| 4 | **Parquet** | `🟢 Easy` | An open-source, columnar storage file format optimized for high-performance analytical queries. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟡 Intermediate: <b>🟡 Intermediate (Level 200) (4 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Columnar Compression Codecs: Snappy vs ZSTD vs GZIP** | `🟡 Intermediate` | Algorithm trade-offs between compression ratio, CPU encode/decode throughput, and splittability for lakehouse columnar files. |
| 2 | **Delta Lake ACID Transaction Log & Checkpointing** | `🟡 Intermediate` | An ordered, append-only JSON log (_delta_log/) coupled with Parquet checkpoints that guarantees ACID isolation over raw cloud storage. |
| 3 | **Delta Lake Standard for Lakehouse Tables** | `🟡 Intermediate` | The open-source storage layer built on Apache Parquet that serves as the universal standard for lakehouse tables due to ACID transactions, schema evolution, and cross-engine interoperability. |
| 4 | **Storage Lifecycle Cold Tiering** | `🟡 Intermediate` | Automating cloud storage policies to migrate historical Parquet files to cool, cold, and archive storage tiers. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🔴 Advanced: <b>🔴 Advanced (Level 300) (5 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **CDC Transaction Log Mining vs Query Polling** | `🔴 Advanced` | The architectural comparison between extracting database mutations directly from binary redo logs versus repeatedly querying tables via SQL. |
| 2 | **Delta Lake Deletion Vectors (Roaring Bitmaps)** | `🔴 Advanced` | A soft-delete storage optimization that tracks deleted rows via Roaring Bitmap files, avoiding full Parquet file rewrites. |
| 3 | **Delta Lake Time Travel & Transaction Log Compaction** | `🔴 Advanced` | The mechanism where Delta Lake maintains ordered JSON commit logs (`_delta_log`) and checkpoint Parquet files to enable querying historical table snapshots and point-in-time recovery. |
| 4 | **Delta Lake VACUUM & Retention Governance** | `🔴 Advanced` | The maintenance command in Delta Lake that removes uncommitted and historical Parquet data files that are older than the specified retention threshold. |
| 5 | **Z-Ordering (General)** | `🔴 Advanced` | A multi-dimensional data clustering technique used to sort data columns inside Parquet files to optimize scan efficiency. |

</details>

</details>

<details>
<summary>&nbsp;&nbsp;📂 <b>Section: Storage Compaction, Pruning & Data Layout (38 Topics)</b> — <i>Click to expand functional domain</i></summary>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟢 Easy: <b>🟢 Easy (Level 100) (5 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **HDFS** | `🟢 Easy` | Hadoop Distributed File System, a Java-based file system providing redundant block storage across commoditized hardware nodes. |
| 2 | **Medallion Architecture Layer Invariants** | `🟢 Easy` | The strict data quality, mutation, and schema rules that establish explicit technical boundaries between Bronze (Raw), Silver (Curated), and Gold (Aggregated) lakehouse layers. |
| 3 | **Medallion Bronze Layer Immutability** | `🟢 Easy` | The architectural rule requiring Bronze lakehouse tables to append raw source events in original fidelity without modification. |
| 4 | **Partitioning** | `🟢 Easy` | The practice of structuring a data lake directory layout based on specific low-cardinality data columns. |
| 5 | **Silver Layer Curation** | `🟢 Easy` | The cleaned, validated, and semi-normalized layer in a medallion data architecture. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟡 Intermediate: <b>🟡 Intermediate (Level 200) (16 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Apache Iceberg** | `🟡 Intermediate` | An open-source, high-performance table format designed for massive analytical datasets, supporting schema evolution and hidden partitioning. |
| 2 | **Apache Iceberg Hierarchical Metadata Tree** | `🟡 Intermediate` | A 4-tier metadata hierarchy (Catalog -> Metadata JSON -> Manifest List -> Manifest Files) enabling partition evolution and snapshot isolation. |
| 3 | **Dead-Letter Queue (DLQ) Automated Replay Protocol** | `🟡 Intermediate` | A resilient pipeline pattern that isolates corrupt, malformed, or unparseable records into a quarantine sink while allowing valid data to continue flowing, paired with automated replay tooling. |
| 4 | **Delta Lake** | `🟡 Intermediate` | An open-source storage layer that brings ACID transactions and metadata management to Apache Spark data lakes. |
| 5 | **Dictionary Encoding & Run-Length Encoding (RLE)** | `🟡 Intermediate` | Lightweight compression techniques that replace repeated string values with compact bit-packed integer keys prior to page compression. |
| 6 | **Lakehouse Schema Evolution & Read-Time Schema Merging** | `🟡 Intermediate` | The non-blocking Delta Lake capability that accommodates structural schema changes across partitions without table locks, reconciling variations at query time with automatic NULL population. |
| 7 | **Medallion Gold Dimensional Marts** | `🟡 Intermediate` | The analytical serving layer organizing business metrics into dimensional star schemas and aggregated reporting tables. |
| 8 | **Medallion Silver Conformed Cleansing** | `🟡 Intermediate` | The transformation layer standardizing data types, deduplicating keys, and resolving foreign key references. |
| 9 | **OpenLineage Operational Telemetry Standard** | `🟡 Intermediate` | An open standard for automated collection of end-to-end dataset lineage, pipeline job execution metadata, and runtime assertions across data platforms. |
| 10 | **Reverse ETL Operational Analytics** | `🟡 Intermediate` | Syncing curated Gold lakehouse data back into operational SaaS tools (Salesforce, HubSpot, Zendesk) for frontline workers. |
| 11 | **Schema Evolution** | `🟡 Intermediate` | The ability of a data storage engine to dynamically accommodate schema changes without rewriting existing data. |
| 12 | **Schema-on-Write vs Schema-on-Read in Medallion Architecture** | `🟡 Intermediate` | Architectural principles governing data validation timing: schema-on-read offers flexibility for raw ingestion, whereas schema-on-write enforces strict structural integrity for curated reporting. |
| 13 | **Soda Core Declarative Data Quality Checks** | `🟡 Intermediate` | An open-source, CLI- and Python-driven declarative data testing framework that validates table metrics against YAML-defined SodaCL quality agreements. |
| 14 | **Streaming Schema Evolution Compatibility Modes** | `🟡 Intermediate` | Rules enforced by schema registries (BACKWARD, FORWARD, FULL) governing whether producer or consumer applications must update first during schema alterations. |
| 15 | **Streaming Small-File Compaction Debt** | `🟡 Intermediate` | The accumulating query and storage cost caused when frequent stream writes produce many undersized data files. |
| 16 | **The Small Files Problem** | `🟡 Intermediate` | A storage bottleneck where thousands of tiny files in a data lake degrade query execution times. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🔴 Advanced: <b>🔴 Advanced (Level 300) (10 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Apache Iceberg Format** | `🔴 Advanced` | An open-source, high-performance table format for massive analytical datasets, designed for engines like Spark and Trino. |
| 2 | **CDC Context Synchronization** | `🔴 Advanced` | The process of keeping analytical and AI-facing context aligned with changes captured from operational databases. |
| 3 | **Data Lake Small File Problem: Two-Stage OPTIMIZE and VACUUM** | `🔴 Advanced` | The metadata explosion and query performance degradation caused by millions of sub-optimal files in data lakes, resolved via a two-stage ingest-then-compact operational strategy. |
| 4 | **Delta Lake MERGE INTO & Auto Schema Merge** | `🔴 Advanced` | The declarative UPSERT mechanism in Delta Lake that coordinates atomic inserts, updates, and deletes in a single ACID transaction while automatically assimilating upstream schema drift. |
| 5 | **Delta Lake Z-Ordering: Space-Filling Curves and Data Skipping** | `🔴 Advanced` | A multi-dimensional clustering algorithm that organizes data along a space-filling Z-curve across 2 to 4 frequently queried columns to maximize Delta Lake file-level data skipping. |
| 6 | **Delta Sharing (General)** | `🔴 Advanced` | An open protocol for secure data sharing across organizations without moving or copying physical files. |
| 7 | **Liquid Clustering (General)** | `🔴 Advanced` | A self-tuning data layout optimization in Delta Lake that replaces static partitioning and Z-Ordering with incremental clustering keys. |
| 8 | **Schema Enforcement** | `🔴 Advanced` | A safety mechanism in Delta Lake that rejects data writes if the incoming schema does not match the target table. |
| 9 | **Time Travel** | `🔴 Advanced` | The capability in Delta Lake to query past snapshots of a table using transaction log version keys or timestamps. |
| 10 | **Universal Format (UniForm)** | `🔴 Advanced` | A Delta Lake technology that automatically generates Iceberg-compliant metadata, allowing Iceberg-centric engines to read Delta tables without copying. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟣 Architect: <b>🟣 Staff Architect (Level 400) (7 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Data Contracts (Producer-Side Guarantees)** | `🟣 Architect` | A formal, version-controlled agreement between upstream data producers and downstream consumers governing schema structure, semantic meaning, SLA, and quality invariants. |
| 2 | **Data Lake Storage Tiering Lifecycle & Zero-Egress Economics** | `🟣 Architect` | Cost-optimization architectural model moving petabyte-scale lakehouse data across Hot, Cool, Cold, and Archive storage tiers based on query access SLAs. |
| 3 | **Data Mesh Federated Governance** | `🟣 Architect` | A decentralized data governance framework balancing domain autonomy with standardized enterprise interoperability policies. |
| 4 | **Delta Lake Liquid Clustering vs Z-Order Architecture** | `🟣 Architect` | Next-generation flexible data layout algorithm in Delta Lake replacing static directory partitioning and manual Z-Order optimization. |
| 5 | **Lambda vs Kappa Architecture in Modern Cloud Platforms** | `🟣 Architect` | The fundamental architectural paradigm choice between dual-stream/batch processing pipelines (Lambda) versus unified stream-first real-time platforms (Kappa). |
| 6 | **Slowly Changing Dimensions (SCD Type 1 & 2) in Delta Lake** | `🟣 Architect` | The dimensional modeling implementation in Delta Lake that manages historical attribute changes using atomic `MERGE INTO` operations. |
| 7 | **Unified Lakehouse Catalog Federation & REST APIs** | `🟣 Architect` | Decoupled catalog architecture enabling disparate query engines (Spark, Trino, Snowflake, Synapse) to share Iceberg/Delta tables via REST. |

</details>

</details>

</details>

<details>
<summary><b>🏛️ Distributed Systems Design & Fault Tolerance (68 Topics across 4 Sections)</b> — <i>Click to expand module</i></summary>

<details>
<summary>&nbsp;&nbsp;📂 <b>Section: Distributed Theorems & Trade-Offs (7 Topics)</b> — <i>Click to expand functional domain</i></summary>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟢 Easy: <b>🟢 Easy (Level 100) (2 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **ACID Properties** | `🟢 Easy` | A set of four guarantees (Atomicity, Consistency, Isolation, Durability) that ensure database transactions are processed reliably, even in the event of errors or failures. |
| 2 | **Content Delivery Network (CDN)** | `🟢 Easy` | A geographically distributed network of proxy servers (Points of Presence) that cache and serve static and dynamic content closer to end users, reducing latency and origin server load. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟡 Intermediate: <b>🟡 Intermediate (Level 200) (2 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **CAP Theorem** | `🟡 Intermediate` | A distributed systems theorem stating that a system can guarantee at most two of three properties: Consistency, Availability, and Partition Tolerance simultaneously. |
| 2 | **Distributed Tracing** | `🟡 Intermediate` | An observability technique that tracks the flow of a request through multiple services in a distributed system, correlating all spans into a single trace to identify latency bottlenecks and failure points. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🔴 Advanced: <b>🔴 Advanced (Level 300) (3 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **CAP Theorem Trade-Offs in Big Data** | `🔴 Advanced` | The fundamental architectural constraint: a distributed system can guarantee at most two of Consistency, Availability, and Partition Tolerance. |
| 2 | **LSM-Tree vs. B+ Tree Storage Engines** | `🔴 Advanced` | The architectural comparison between append-only Log-Structured Merge-trees (optimized for write throughput) and B+ Trees (optimized for read latency). |
| 3 | **RAG (Retrieval-Augmented Generation)** | `🔴 Advanced` | An AI architecture pattern that enhances LLM responses by first retrieving relevant context from an external knowledge base using semantic search, then passing it to the LLM as grounding context. |

</details>

</details>

<details>
<summary>&nbsp;&nbsp;📂 <b>Section: Fault Tolerance, Rate Limiting & High Availability (7 Topics)</b> — <i>Click to expand functional domain</i></summary>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟡 Intermediate: <b>🟡 Intermediate (Level 200) (6 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Circuit Breaker Pattern** | `🟡 Intermediate` | A resilience design pattern that prevents cascading failures by automatically stopping requests to a failing downstream service and allowing it time to recover. |
| 2 | **Database Replication** | `🟡 Intermediate` | The process of copying and maintaining database data across multiple servers (replicas) to achieve high availability, disaster recovery, and read scalability. |
| 3 | **DNS Resolution & Load Balancing** | `🟡 Intermediate` | The process by which domain names are translated to IP addresses through a hierarchical distributed database, and how DNS is used for traffic distribution and failover in large-scale systems. |
| 4 | **Idempotency in Distributed APIs** | `🟡 Intermediate` | The property of an operation where performing it multiple times produces the same result as performing it once, making it safe to retry without causing unintended side effects. |
| 5 | **Token Bucket Algorithm** | `🟡 Intermediate` | A rate limiting algorithm that models a bucket holding a maximum of N tokens, where tokens are added at a fixed rate and each request consumes one token, allowing controlled burst traffic. |
| 6 | **Token Bucket Rate Limiting Algorithm** | `🟡 Intermediate` | An algorithm that meters API requests by accumulating tokens at a constant rate up to a bucket capacity. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🔴 Advanced: <b>🔴 Advanced (Level 300) (1 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Distributed Deadlock Detection** | `🔴 Advanced` | Algorithms detecting cyclic wait-for dependencies across distributed database locks to safely abort and retry transactions. |

</details>

</details>

<details>
<summary>&nbsp;&nbsp;📂 <b>Section: Caching Topologies & Synchronization (4 Topics)</b> — <i>Click to expand functional domain</i></summary>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟢 Easy: <b>🟢 Easy (Level 100) (1 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Cache-Aside Pattern** | `🟢 Easy` | A caching strategy where the application code is responsible for loading data into the cache on cache misses, reading from cache first and falling back to the database only when needed. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟡 Intermediate: <b>🟡 Intermediate (Level 200) (1 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Redis Data Structures** | `🟡 Intermediate` | Redis provides rich server-side data structures (Strings, Hashes, Lists, Sets, Sorted Sets, HyperLogLog, Streams, Geospatial indexes) that enable it to solve a wide range of use cases beyond simple caching. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🔴 Advanced: <b>🔴 Advanced (Level 300) (2 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Cache Stampede (Thundering Herd)** | `🔴 Advanced` | A distributed systems failure pattern where many cache misses occur simultaneously for the same key, causing all clients to query the database concurrently and overwhelming it. |
| 2 | **Redis Redlock Distributed Locking Algorithm** | `🔴 Advanced` | An algorithm proposed by Salvatore Sanfilippo that achieves fault-tolerant, mutually exclusive distributed locks across independent Redis master nodes. |

</details>

</details>

<details>
<summary>&nbsp;&nbsp;📂 <b>Section: Event-Driven Topologies & Decoupled Ingestion (50 Topics)</b> — <i>Click to expand functional domain</i></summary>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟢 Easy: <b>🟢 Easy (Level 100) (2 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Feature Flags (Feature Toggles)** | `🟢 Easy` | A software development technique that allows features to be enabled or disabled at runtime without deploying new code, enabling safe rollouts, A/B testing, and instant rollback. |
| 2 | **Horizontal vs Vertical Scaling** | `🟢 Easy` | Two fundamental scaling strategies: vertical scaling adds more resources (CPU, RAM) to a single server; horizontal scaling adds more servers to distribute the load. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟡 Intermediate: <b>🟡 Intermediate (Level 200) (13 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **API Gateway** | `🟡 Intermediate` | A server that acts as the single entry point for all API requests to a system, handling cross-cutting concerns like authentication, rate limiting, routing, load balancing, and observability. |
| 2 | **Cloud-Native Data Platform Operating Model** | `🟡 Intermediate` | The team, platform, and operational practices required to run data products on containerized or managed cloud-native infrastructure. |
| 3 | **Connection Pooling** | `🟡 Intermediate` | A technique that maintains a pool of pre-established database connections that are reused by multiple clients, reducing the overhead of creating and tearing down connections for each request. |
| 4 | **Eventual Consistency in Distributed Lakehouses** | `🟡 Intermediate` | A consistency model guaranteeing that in the absence of new updates, all replicas and readers eventually return identical data. |
| 5 | **gRPC** | `🟡 Intermediate` | A high-performance, open-source RPC framework developed by Google using Protocol Buffers for serialization and HTTP/2 for transport, supporting four communication patterns including bidirectional streaming. |
| 6 | **Load Balancing** | `🟡 Intermediate` | The process of distributing incoming network traffic across multiple backend servers to ensure no single server is overwhelmed, improving throughput, availability, and fault tolerance. |
| 7 | **Microservices Architecture** | `🟡 Intermediate` | An architectural style where an application is built as a suite of small, independently deployable services, each running in its own process and communicating via well-defined APIs. |
| 8 | **Observability: Metrics, Logs, Traces** | `🟡 Intermediate` | The three pillars of production system observability that provide visibility into system health and behaviour: Metrics (quantitative time-series), Logs (structured event records), and Traces (request-path visualization). |
| 9 | **PostgreSQL Index Types & Optimization** | `🟡 Intermediate` | PostgreSQL provides multiple index types (B-Tree, Hash, GIN, GiST, BRIN, SP-GiST) each optimized for different data types and query patterns, with strategic indexing being critical for query performance. |
| 10 | **Rate Limiting** | `🟡 Intermediate` | A technique for controlling the rate of requests a client can make to an API or service, used to prevent abuse, DDoS, and resource exhaustion. |
| 11 | **WebSockets** | `🟡 Intermediate` | A full-duplex communication protocol over a single persistent TCP connection, enabling real-time bidirectional data exchange between client and server. |
| 12 | **Write-Ahead Logging (WAL) Durability** | `🟡 Intermediate` | Writing transaction intent to append-only disk logs before mutating in-memory database pages, ensuring crash recovery. |
| 13 | **Zero-Downtime Deployment** | `🟡 Intermediate` | Deployment strategies that update production services without interrupting user traffic or causing downtime, using techniques like Blue-Green, Canary, and Rolling deployments. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🔴 Advanced: <b>🔴 Advanced (Level 300) (26 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Agent Execution Sandbox** | `🔴 Advanced` | An isolated execution environment that limits what an AI agent can read, run, and connect to while it performs a bounded task. |
| 2 | **Apache Kafka Architecture** | `🔴 Advanced` | A distributed event streaming platform based on a distributed commit log, providing high-throughput, durable, and fault-tolerant publish-subscribe messaging with configurable delivery guarantees. |
| 3 | **Bloom Filter** | `🔴 Advanced` | A space-efficient probabilistic data structure used to test whether an element is a member of a set, with zero false negatives but a configurable false positive rate. |
| 4 | **Bulkhead Pattern** | `🔴 Advanced` | A resilience pattern that isolates critical resources (thread pools, connection pools) into separate compartments so that failure in one part does not cascade to consume all resources and bring down other parts. |
| 5 | **Canary Pipeline Blue-Green Table Swapping** | `🔴 Advanced` | A deployment strategy for mission-critical pipelines that builds and validates a shadow table in parallel before atomically swapping catalog pointers to achieve zero-downtime upgrades. |
| 6 | **Change Data Capture (CDC in Distributed Systems)** | `🔴 Advanced` | A design pattern that captures and streams every row-level INSERT, UPDATE, and DELETE event from a source database as a continuous event stream, enabling real-time data integration and event-driven architectures. |
| 7 | **Consistent Hashing** | `🔴 Advanced` | A distributed hashing technique that minimizes data redistribution when nodes are added or removed from a cluster by mapping both nodes and keys onto a hash ring. |
| 8 | **Consistent Hashing with Virtual Nodes** | `🔴 Advanced` | A distributed partitioning scheme that maps keys and server nodes to a circular hash ring, minimizing key re-allocation when nodes join or leave the cluster. |
| 9 | **CQRS (Command Query Responsibility Segregation)** | `🔴 Advanced` | An architectural pattern that separates read (query) and write (command) operations into distinct models, allowing each to be independently scaled and optimized. |
| 10 | **Data Execution Boundary Prompt Injection Guardrails** | `🔴 Advanced` | Defensive controls deployed at the database and tool interface that prevent indirect prompt injection embedded in raw data from executing privileged data operations. |
| 11 | **Database Sharding** | `🔴 Advanced` | A horizontal database scaling technique that partitions data across multiple independent database servers (shards), where each shard holds a disjoint subset of the total data. |
| 12 | **Distributed ID Generation** | `🔴 Advanced` | Strategies for generating globally unique, sortable identifiers across multiple distributed nodes without coordination, avoiding the single-point-of-failure of auto-increment sequences. |
| 13 | **Distributed Two-Phase Commit vs Saga Compensation** | `🔴 Advanced` | Two foundational patterns for coordinating state across distributed systems: synchronous blocking 2PC versus asynchronous eventual-consistency Saga compensation. |
| 14 | **Event Sourcing** | `🔴 Advanced` | An architectural pattern where the state of a system is derived by replaying a sequence of immutable events stored in an append-only event log, rather than persisting current state directly. |
| 15 | **Gossip Protocol** | `🔴 Advanced` | A peer-to-peer communication protocol where nodes periodically exchange state information with random peers, enabling fast dissemination of information across a cluster without a central coordinator. |
| 16 | **Idempotent Pipeline Design** | `🔴 Advanced` | Architecting data pipelines such that executing the same run multiple times produces the identical target state without duplicate rows. |
| 17 | **Lakehouse Workload Identity Federation** | `🔴 Advanced` | A credentialless identity architecture that exchanges short-lived OIDC tokens from CI/CD runners or compute engines for cloud IAM permissions without storing permanent service account keys. |
| 18 | **Multi-Tenant Lakehouse Noisy Neighbor Resource Pools** | `🔴 Advanced` | The compute and storage governance mechanisms (hierarchical queues, worker isolation, and catalog namespaces) that prevent ad-hoc queries from starving mission-critical SLA pipelines. |
| 19 | **MVCC (Multi-Version Concurrency Control)** | `🔴 Advanced` | A concurrency control mechanism used by databases to allow multiple transactions to read and write data simultaneously without blocking each other, by maintaining multiple versions of each row. |
| 20 | **Outbox Pattern** | `🔴 Advanced` | A pattern that ensures reliable event publishing by atomically writing both the business entity change and the event to be published in the same database transaction, preventing dual-write inconsistency. |
| 21 | **Partition Filter Enforcement and Query Scan Cost Governance** | `🔴 Advanced` | Engine-level governance constraints and query optimizer rules that automatically block full-table scans that fail to supply required partition or clustering filters. |
| 22 | **Replication Strategies: Leader-Follower vs Multi-Leader vs Leaderless** | `🔴 Advanced` | Three fundamental approaches to replicating data across distributed nodes, each with different consistency guarantees, write scaling properties, and conflict handling requirements. |
| 23 | **SAGA Pattern** | `🔴 Advanced` | A design pattern for managing distributed transactions across multiple microservices without using 2PC, instead using a sequence of local transactions with compensating actions for rollback. |
| 24 | **Two-Phase Commit (2PC)** | `🔴 Advanced` | A distributed consensus protocol that ensures all participating nodes in a distributed transaction either all commit or all abort, providing atomicity across multiple databases. |
| 25 | **Vector Database** | `🔴 Advanced` | A database system optimized for storing, indexing, and querying high-dimensional vector embeddings, enabling semantic similarity search using approximate nearest neighbor algorithms. |
| 26 | **Write-Ahead Log (WAL)** | `🔴 Advanced` | An append-only log that records every database change before it is applied to the actual data files, providing durability and enabling crash recovery. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟣 Architect: <b>🟣 Staff Architect (Level 400) (9 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Agentic Data Engineering Control Plane** | `🟣 Architect` | The governed layer that lets software agents observe and propose data-platform work while enforcing identity, policy, approval, and audit boundaries. |
| 2 | **AI-Assisted Data Change Control** | `🟣 Architect` | A release process for AI-generated data code that preserves reviewability, test evidence, small changes, and rollback control. |
| 3 | **Data Product Platform Maturity** | `🟣 Architect` | A progression from manually coordinated data jobs toward a self-service platform that provides standard interfaces, policy, observability, and lifecycle controls for data products. |
| 4 | **Model Context Protocol (MCP) Architecture** | `🟣 Architect` | An open protocol developed by Anthropic that standardizes how AI applications and agents securely discover, query, and invoke tools and data assets. |
| 5 | **Monolith to Microservices Migration** | `🟣 Architect` | The incremental decomposition of a monolithic application into microservices using patterns like Strangler Fig, anti-corruption layers, and domain-driven design bounded contexts. |
| 6 | **Raft Consensus Algorithm** | `🟣 Architect` | A distributed consensus algorithm designed for understandability, providing leader election and replicated log management to ensure all nodes in a cluster agree on the same state sequence. |
| 7 | **Saga Pattern: Choreography vs. Orchestration** | `🟣 Architect` | A distributed design pattern that manages multi-service transactions through a sequence of local transactions coordinated via events or an explicit workflow orchestrator. |
| 8 | **Service Mesh** | `🟣 Architect` | A dedicated infrastructure layer for handling service-to-service communication in a microservices architecture, implemented as a network of sidecar proxies deployed alongside each service. |
| 9 | **Transactional Outbox Pattern for CDC** | `🟣 Architect` | A distributed system design pattern that guarantees atomic database state changes and event publishing to a message broker without dual-write inconsistencies. |

</details>

</details>

</details>

<details>
<summary><b>🛠️ dbt Core, Analytics Engineering & Semantic Modeling (57 Topics across 4 Sections)</b> — <i>Click to expand module</i></summary>

<details>
<summary>&nbsp;&nbsp;📂 <b>Section: Project Architecture & Modeling Primitives (24 Topics)</b> — <i>Click to expand functional domain</i></summary>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟢 Easy: <b>🟢 Easy (Level 100) (8 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **dbt Model** | `🟢 Easy` | A dbt model is a single SQL SELECT statement defined in a .sql file that compiles and materializes a table, view, or incremental dataset in the data warehouse. |
| 2 | **dbt run command** | `🟢 Easy` | The dbt run command is the core CLI command that compiles and executes SQL models in the target warehouse according to the project's dependency DAG. |
| 3 | **dbt Seed** | `🟢 Easy` | A dbt seed is a static CSV file placed in the seeds/ directory that dbt loads directly into the data warehouse as a version-controlled lookup table. |
| 4 | **dbt Source** | `🟢 Easy` | A dbt source represents an external raw table loaded by an ingestion tool (e.g. Fivetran, Airbyte) that is registered in dbt using YAML configuration files. |
| 5 | **profiles.yml** | `🟢 Easy` | The profiles.yml file stores warehouse connection configurations, authentication credentials, and environment target settings outside of the project code repository. |
| 6 | **ref() Function** | `🟢 Easy` | The ref() function is dbt's core interpolation macro used to reference other models within a project, automatically building the Directed Acyclic Graph (DAG) of dependencies. |
| 7 | **Table Materialization** | `🟢 Easy` | Table materialization rebuilds the target model as a physical relational table in the data warehouse on every dbt run using CREATE TABLE AS SELECT (CTAS) logic. |
| 8 | **View Materialization** | `🟢 Easy` | View materialization defines the model as a virtual database view using CREATE VIEW AS SELECT, storing only the SQL query definition without persisting physical data. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟡 Intermediate: <b>🟡 Intermediate (Level 200) (7 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Analyses** | `🟡 Intermediate` | Analyses are one-off SQL queries stored in the analyses/ directory that utilize dbt Jinja and ref() functions but are compiled without being materialized in the database. |
| 2 | **dbt build Command** | `🟡 Intermediate` | The dbt build command executes models, runs tests, creates snapshots, and loads seeds in a unified DAG sequence, halting downstream nodes if an upstream model or test fails. |
| 3 | **dbt Macros** | `🟡 Intermediate` | dbt Macros are reusable, parameterizable Jinja code blocks defined in the macros/ directory that compile into dynamic SQL during project execution. |
| 4 | **dbt Snapshot (SCD Type 2)** | `🟡 Intermediate` | A dbt snapshot captures and records changes to mutable source data over time, automatically maintaining a Slowly Changing Dimension (SCD Type 2) history table. |
| 5 | **dbt Snapshot Timestamp vs. Check Strategy** | `🟡 Intermediate` | Slowly Changing Dimension Type 2 implementation strategies comparing updated timestamps versus hashing column values. |
| 6 | **dbt-utils Package** | `🟡 Intermediate` | dbt-utils is the foundational open-source macro package maintained by dbt Labs that provides essential utility macros, cross-database SQL helpers, and advanced schema tests. |
| 7 | **Pre/Post Hooks** | `🟡 Intermediate` | Pre-hooks and post-hooks are SQL statements or macros executed immediately before or after a dbt model is materialized in the database. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🔴 Advanced: <b>🔴 Advanced (Level 300) (5 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **dbt Compile vs Run vs Build** | `🔴 Advanced` | The core architectural distinction between dbt compile (generating warehouse SQL), dbt run (executing model DDL/DML), and dbt build (unified execution of seeds, models, tests, and snapshots). |
| 2 | **dbt Model Contracts** | `🔴 Advanced` | Explicit schema constraints enforced by dbt at build time, guaranteeing column names, data types, and nullability. |
| 3 | **Manifest.json Internals** | `🔴 Advanced` | The manifest.json file is a comprehensive JSON artifact generated during compilation that contains the full semantic model, dependency graph, and metadata of the entire dbt project. |
| 4 | **Partial Parsing** | `🔴 Advanced` | Partial Parsing is a performance optimization engine in dbt Core that caches previously parsed project files in manifest.json, reparsing only modified files on subsequent runs. |
| 5 | **Source Freshness Checks** | `🔴 Advanced` | Source Freshness Checks are automated SLA validations executed via dbt source freshness that assert whether raw source tables have received recent data updates. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟣 Architect: <b>🟣 Staff Architect (Level 400) (4 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **dbt Core vs dbt Cloud** | `🟣 Architect` | The strategic architectural evaluation between hosting open-source dbt-core via custom orchestrators versus adopting the managed enterprise SaaS platform, dbt Cloud. |
| 2 | **dbt Mesh & Cross-Project Dependencies** | `🟣 Architect` | An enterprise multi-project architecture in dbt that enables decentralized teams to maintain independent dbt repositories while referencing public models across project boundaries. |
| 3 | **dbt Mesh (Cross-Project Refs)** | `🟣 Architect` | dbt Mesh is an enterprise data architecture that decomposes monolithic dbt repositories into multiple autonomous, domain-owned projects connected via cross-project ref() calls. |
| 4 | **Monorepo vs Multi-Project dbt** | `🟣 Architect` | The architectural trade-off between consolidating all corporate data transformations in a single Git monorepo versus establishing decentralized, domain-specific multi-project dbt repositories. |

</details>

</details>

<details>
<summary>&nbsp;&nbsp;📂 <b>Section: Incremental Materialization & Microbatch (7 Topics)</b> — <i>Click to expand functional domain</i></summary>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟢 Easy: <b>🟢 Easy (Level 100) (2 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Ephemeral Materialization** | `🟢 Easy` | Ephemeral materialization creates a reusable SQL code block that is not written to the database at all, but rather interpolated as a Common Table Expression (CTE) into downstream models. |
| 2 | **Incremental Materialization** | `🟢 Easy` | Incremental materialization allows dbt to transform and insert only newly arrived or modified records since the previous pipeline run, rather than rebuilding the entire table. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟡 Intermediate: <b>🟡 Intermediate (Level 200) (1 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Incremental Models (unique_key)** | `🟡 Intermediate` | The unique_key configuration in incremental models specifies the primary key column(s) used by dbt to update existing records and insert new records during MERGE operations. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🔴 Advanced: <b>🔴 Advanced (Level 300) (3 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Custom Materializations** | `🔴 Advanced` | Custom Materializations are user-defined dbt materialization macros that control the exact DDL, staging steps, and transaction mechanics used to persist models in the warehouse. |
| 2 | **dbt Incremental Microbatch Strategy** | `🔴 Advanced` | A partition-aware incremental loading strategy dividing large table updates into discrete time-based batches. |
| 3 | **Semantic Metric Verification for AI-Generated SQL** | `🔴 Advanced` | An automated validation layer that intercepts AI-generated analytical SQL and verifies its table joins, filter predicates, and metric grains against governed semantic contracts before execution. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟣 Architect: <b>🟣 Staff Architect (Level 400) (1 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Cost Governance with dbt** | `🟣 Architect` | Cost Governance in dbt involves implementing architectural practices, query tagging, incremental models, and compute warehouse sizing to optimize cloud data warehouse expenditures. |

</details>

</details>

<details>
<summary>&nbsp;&nbsp;📂 <b>Section: Contracts, Testing & Governance (10 Topics)</b> — <i>Click to expand functional domain</i></summary>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟢 Easy: <b>🟢 Easy (Level 100) (2 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Generic Tests** | `🟢 Easy` | Generic tests are parameterized, reusable schema validation tests defined in YAML that assert data quality constraints against columns or models. |
| 2 | **schema.yml** | `🟢 Easy` | A schema.yml file is a configuration file where models, columns, descriptions, tests, and documentation metadata are declaratively registered in dbt. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟡 Intermediate: <b>🟡 Intermediate (Level 200) (2 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Custom Schema Override** | `🟡 Intermediate` | Custom Schema Override is the pattern of overriding dbt's default `generate_schema_name` macro to control how schema names are generated across dev and prod environments. |
| 2 | **Singular Tests** | `🟡 Intermediate` | A singular test is a standalone SQL query stored in the tests/ directory that defines a custom business assertion that fails if the query returns any rows. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🔴 Advanced: <b>🔴 Advanced (Level 300) (2 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Data Product Contract and Service Objectives** | `🔴 Advanced` | A consumer-facing agreement that describes a data product's schema, semantics, quality checks, freshness, availability, ownership, and change policy. |
| 2 | **State-Based CI** | `🔴 Advanced` | State-Based CI (Slim CI) is a continuous integration testing strategy that compares pull request code against a production manifest to test strictly modified models and their first-order dependents. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟣 Architect: <b>🟣 Staff Architect (Level 400) (4 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **dbt Testing Pyramid** | `🟣 Architect` | The dbt Testing Pyramid is a quality architecture framework that structures data testing across unit tests, generic schema assertions, singular business assertions, and data observability. |
| 2 | **Open Data Contract Specification (ODCS)** | `🟣 Architect` | A standardized, vendor-neutral schema and metadata contract format that explicitly defines schema, semantics, SLA targets, and access permissions between data producers and consumers. |
| 3 | **Semantic Context Contract for Data Agents** | `🟣 Architect` | A versioned definition of business terms, metrics, entities, and permitted joins that an AI system can use when answering data questions. |
| 4 | **Slim CI for dbt** | `🟣 Architect` | Slim CI is an automated pull request verification pattern that uses state comparison artifacts to test exclusively modified models and their downstream dependencies in temporary sandboxes. |

</details>

</details>

<details>
<summary>&nbsp;&nbsp;📂 <b>Section: dbt Mesh & Semantic Layer Modeling (16 Topics)</b> — <i>Click to expand functional domain</i></summary>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟡 Intermediate: <b>🟡 Intermediate (Level 200) (5 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Data Trust Service-Level Objective** | `🟡 Intermediate` | A measurable commitment that a data product meets agreed freshness, quality, lineage, and ownership expectations for its consumers. |
| 2 | **dbt Semantic Layer** | `🟡 Intermediate` | The dbt Semantic Layer (powered by MetricFlow) allows organizations to centrally define metrics and dimensions on top of dbt models, providing consistent metric calculation across all BI tools. |
| 3 | **dbt Slim CI & State:Modified Execution** | `🟡 Intermediate` | A CI/CD optimization technique that compares the current Git branch against production manifest artifacts, running and testing only models modified in the pull request. |
| 4 | **Exposures** | `🟡 Intermediate` | Exposures are YAML declarations in dbt that document downstream consumers of dbt models, such as dashboards, ML models, and operational APIs. |
| 5 | **Jinja Templating in dbt** | `🟡 Intermediate` | Jinja is the Python-based templating engine embedded within dbt that compiles dynamic SQL, enables control flow loops and conditionals, and evaluates environment parameters. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🔴 Advanced: <b>🔴 Advanced (Level 300) (6 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **--defer Flag** | `🔴 Advanced` | The --defer flag allows dbt to resolve unbuilt upstream dependencies in a developer sandbox by pointing to production models recorded in a production manifest.json artifact. |
| 2 | **Adapter-Specific Macros** | `🔴 Advanced` | Adapter-Specific Macros use dbt's multiple-dispatch mechanism to execute different SQL implementations depending on the target database engine (Snowflake, BigQuery, Databricks). |
| 3 | **Cross-Database Macros** | `🔴 Advanced` | Cross-Database Macros provide standardized SQL syntax for functions that vary across database dialects, allowing dbt projects to run on any cloud warehouse platform. |
| 4 | **dbt Slim CI with Deferred State Modification** | `🔴 Advanced` | A CI/CD optimization pattern in dbt that runs and tests only newly modified or upstream/downstream impacted models by comparing git branch artifacts against production manifests. |
| 5 | **dbt-audit-helper** | `🔴 Advanced` | dbt-audit-helper is a dbt package that provides macros to compare row-by-row data parity between two relations, verifying refactored models against legacy tables. |
| 6 | **Graph Selection Syntax** | `🔴 Advanced` | Graph Selection Syntax is dbt's powerful query language used in CLI arguments (--select, --exclude) to selectively execute targeted subgraphs of models, tests, and sources. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟣 Architect: <b>🟣 Staff Architect (Level 400) (5 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **dbt + Airflow Orchestration** | `🟣 Architect` | The enterprise integration pattern combining Apache Airflow as the global workflow orchestrator with dbt as the specialized in-warehouse transformation engine. |
| 2 | **dbt + Databricks Integration** | `🟣 Architect` | The architectural design pairing dbt with Databricks, utilizing dbt-databricks adapters against Databricks SQL Serverless Warehouses and Unity Catalog. |
| 3 | **dbt Production Deployment** | `🟣 Architect` | The production deployment architecture for dbt encompassing containerization, blue/green environment promotion, automated rollback strategies, and observability integration. |
| 4 | **dbt Semantic Layer & MetricFlow** | `🟣 Architect` | A unified semantic specification defining business metrics (e.g. Net Revenue, Customer Churn) centrally in dbt. |
| 5 | **dbt Semantic Layer at Scale** | `🟣 Architect` | The enterprise deployment architecture for the dbt Semantic Layer, serving unified metric definitions to thousands of concurrent BI, dashboard, and AI consumption consumers. |

</details>

</details>

</details>

<details>
<summary><b>🌪️ Apache Airflow & Pipeline Orchestration (52 Topics across 3 Sections)</b> — <i>Click to expand module</i></summary>

<details>
<summary>&nbsp;&nbsp;📂 <b>Section: Core Engine & Decoupled Scheduler (11 Topics)</b> — <i>Click to expand functional domain</i></summary>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟢 Easy: <b>🟢 Easy (Level 100) (1 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Scheduler** | `🟢 Easy` | The Scheduler is the heartbeat service of Airflow that monitors DAG files, resolves dependencies, and queues task instances for executor dispatch. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟡 Intermediate: <b>🟡 Intermediate (Level 200) (3 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **CeleryExecutor** | `🟡 Intermediate` | CeleryExecutor is a distributed executor that distributes task execution across an independent, horizontally scalable fleet of worker nodes via a message broker. |
| 2 | **KubernetesExecutor** | `🟡 Intermediate` | KubernetesExecutor is a cloud-native executor that launches a dedicated, ephemeral Kubernetes pod for each individual task instance. |
| 3 | **LocalExecutor** | `🟡 Intermediate` | LocalExecutor is a single-node Airflow executor that runs tasks concurrently as separate OS subprocesses on the scheduler host using a process pool. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🔴 Advanced: <b>🔴 Advanced (Level 300) (6 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Airflow KubernetesPodOperator Isolation** | `🔴 Advanced` | Executing individual Airflow tasks inside dedicated, ephemeral Kubernetes pods with isolated dependencies and CPU/RAM limits. |
| 2 | **Celery Worker Autoscaling** | `🔴 Advanced` | Celery Worker Autoscaling dynamically scales the number of Celery worker processes or nodes based on active task queue depth and resource utilization. |
| 3 | **DAG Serialization** | `🔴 Advanced` | DAG Serialization is an architectural subsystem that parses Python DAG files, serializes them into JSON blobs, and stores them in the metadata database for fast webserver retrieval. |
| 4 | **High Availability Scheduler** | `🔴 Advanced` | The High Availability (HA) Scheduler architecture allows multiple Airflow scheduler instances to run concurrently in an active-active model without race conditions. |
| 5 | **KubernetesPodOperator (KPO)** | `🔴 Advanced` | KubernetesPodOperator (KPO) executes an arbitrary Docker container as an isolated Kubernetes pod, providing language-agnostic compute and complete dependency isolation. |
| 6 | **SLA Miss Callbacks** | `🔴 Advanced` | SLA Miss Callbacks are custom Python functions invoked by the Airflow scheduler when tasks breach their configured Service Level Agreement duration thresholds. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟣 Architect: <b>🟣 Staff Architect (Level 400) (1 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Airflow 2.x Architecture (DagProcessor)** | `🟣 Architect` | The standalone DagProcessor architecture isolates the Python DAG parsing loop into dedicated, decoupled processes outside the Airflow scheduler daemon. |

</details>

</details>

<details>
<summary>&nbsp;&nbsp;📂 <b>Section: DAG Authoring, Dynamic Task Mapping & Operators (21 Topics)</b> — <i>Click to expand functional domain</i></summary>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟢 Easy: <b>🟢 Easy (Level 100) (9 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Airflow Task SLA Alerting** | `🟢 Easy` | Defining service level agreement thresholds on tasks and triggering automated notifications when tasks exceed duration limits. |
| 2 | **DAG (Directed Acyclic Graph)** | `🟢 Easy` | A Directed Acyclic Graph (DAG) is a collection of all tasks you want to run, organized in a way that reflects their relationships and dependencies without any circular loops. |
| 3 | **DagRun** | `🟢 Easy` | A DagRun is an instantiation of an entire DAG representing a single execution instance for a specific logical date and trigger type. |
| 4 | **Operator** | `🟢 Easy` | An Operator is a template or blueprint class in Airflow that defines a single task's behavior, execution logic, and parameters. |
| 5 | **Task** | `🟢 Easy` | A Task is the basic unit of execution in Airflow, representing an instantiated node in a DAG that performs a specific piece of work. |
| 6 | **TaskInstance** | `🟢 Easy` | A TaskInstance represents a specific run of a Task for a particular DagRun point in time, holding runtime state, attempt counts, and execution metrics. |
| 7 | **Trigger Rules** | `🟢 Easy` | Trigger Rules dictate the exact upstream conditions required for a task to transition from queued to running. |
| 8 | **Worker Node** | `🟢 Easy` | A Worker Node is a dedicated compute instance or container responsible for pulling queued task instances and executing their payload logic. |
| 9 | **XCom (Cross-Communication)** | `🟢 Easy` | XCom (Cross-Communication) is Airflow's built-in mechanism that allows tasks within the same DAG run to exchange small metadata payloads, parameters, or state identifiers. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟡 Intermediate: <b>🟡 Intermediate (Level 200) (5 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Backfill** | `🟡 Intermediate` | Backfill is the process of executing a DAG across a past historical date range to populate historical data or reprocess data after logic modifications. |
| 2 | **Custom Operators** | `🟡 Intermediate` | Custom Operators are user-defined Python classes extending BaseOperator that implement specialized enterprise task execution logic. |
| 3 | **Dynamic Task Mapping** | `🟡 Intermediate` | Dynamic Task Mapping (Airflow 2.3+) is an orchestration pattern that generates a dynamic number of parallel task instances at runtime based on upstream data outputs. |
| 4 | **Pools (Airflow Pools)** | `🟡 Intermediate` | Airflow Pools are concurrency control mechanisms used to restrict the number of simultaneous task instances accessing a specific shared resource or database. |
| 5 | **Priority Weights** | `🟡 Intermediate` | Priority Weights determine the execution priority of queued task instances when multiple tasks compete for limited worker or pool slots. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🔴 Advanced: <b>🔴 Advanced (Level 300) (4 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Airflow Dynamic Task Mapping (`expand()`)** | `🔴 Advanced` | Dynamically generating parallel task instances at runtime based on the output of an upstream task. |
| 2 | **Astronomer Cosmos (dbt Airflow Orchestration)** | `🔴 Advanced` | An open-source library that parses a dbt project directory and renders each individual dbt model as a native, observable task in an Apache Airflow DAG. |
| 3 | **DAGs on Remote Storage** | `🔴 Advanced` | An enterprise deployment pattern where Airflow DAG definitions are synchronized from object storage (S3/GCS) or Git repositories rather than baked into container images. |
| 4 | **Grid View & Task Dependencies** | `🔴 Advanced` | Grid View is Airflow's primary operational UI dashboard combining hierarchical task dependency trees with historical run statuses, duration charts, and log access. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟣 Architect: <b>🟣 Staff Architect (Level 400) (3 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Airflow + dbt Integration** | `🟣 Architect` | The architectural integration between Airflow and dbt, leveraging orchestration frameworks like Cosmos to translate dbt models into native Airflow task dependency graphs. |
| 2 | **Airflow 3.0 Preview** | `🟣 Architect` | The architectural vision of Apache Airflow 3.0, introducing decoupled execution engines, multi-language task authoring, and native event-driven streaming primitives. |
| 3 | **Cross-DAG Dependencies with Datasets** | `🟣 Architect` | Cross-DAG Dependencies with Datasets models enterprise data pipelines as a decentralized, event-driven mesh of producer and consumer DAGs synchronized via data assets. |

</details>

</details>

<details>
<summary>&nbsp;&nbsp;📂 <b>Section: Orchestration Resiliency, Datasets & Connections (20 Topics)</b> — <i>Click to expand functional domain</i></summary>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟢 Easy: <b>🟢 Easy (Level 100) (3 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Airflow Connections** | `🟢 Easy` | Airflow Connections are centralized configuration objects that store credentials, hostnames, ports, and authentication parameters required to interface with external systems. |
| 2 | **Airflow Variables** | `🟢 Easy` | Airflow Variables are global key-value store entries maintained in the metadata database used to store non-sensitive runtime configurations and application constants. |
| 3 | **SLA (Service Level Agreement)** | `🟢 Easy` | An SLA (Service Level Agreement) is a time duration threshold configured on tasks or DAGs that triggers automated alerts if execution exceeds expected operational windows. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟡 Intermediate: <b>🟡 Intermediate (Level 200) (7 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Airflow Connection Secrets Backend** | `🟡 Intermediate` | Storing Airflow database and API connections in cloud secret managers (HashiCorp Vault, AWS Secrets Manager). |
| 2 | **Airflow Data-Aware Dataset Scheduling** | `🟡 Intermediate` | A declarative orchestration model in Apache Airflow 2.4+ where DAGs execute based on dataset updates produced by upstream tasks rather than fixed cron clocks. |
| 3 | **Airflow Data-Aware Scheduling (Datasets)** | `🟡 Intermediate` | An event-driven orchestration feature in Airflow 2.4+ where downstream DAGs trigger automatically when upstream tasks produce specific data assets. |
| 4 | **Dataset-Driven Scheduling** | `🟡 Intermediate` | Dataset-Driven Scheduling (Airflow 2.4+) is an event-based scheduling mechanism where DAGs trigger automatically when upstream producer tasks update defined data assets. |
| 5 | **Hooks** | `🟡 Intermediate` | Hooks are reusable client interfaces that encapsulate connection logic, authentication, and API communication with external databases, platforms, and services. |
| 6 | **Sensors (BaseSensorOperator)** | `🟡 Intermediate` | Sensors are specialized operators derived from BaseSensorOperator that poll an external system at regular intervals until a specific condition or criteria is met. |
| 7 | **TaskGroup** | `🟡 Intermediate` | A TaskGroup is a visual and organizational UI construct in Airflow that hierarchically groups related tasks together without the overhead of SubDAGs. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🔴 Advanced: <b>🔴 Advanced (Level 300) (4 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Airflow REST API** | `🔴 Advanced` | The Airflow REST API is an OpenAPI-compliant web interface providing programmatic access to trigger runs, manage variables, inspect logs, and audit cluster state. |
| 2 | **Custom Timetables** | `🔴 Advanced` | Custom Timetables (Airflow 2.2+) allow developers to author arbitrary, non-cron scheduling logic that accounts for business calendars, holidays, and fiscal intervals. |
| 3 | **Metadata Database Tuning** | `🔴 Advanced` | Metadata Database Tuning involves optimizing PostgreSQL/MySQL parameters, connection pooling, and table indexes to sustain high Airflow scheduling throughput. |
| 4 | **Statsd Metrics Integration** | `🔴 Advanced` | Statsd Metrics Integration exports low-level Airflow operational telemetry to monitoring backends like Prometheus, Datadog, or Grafana. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟣 Architect: <b>🟣 Staff Architect (Level 400) (6 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Airflow + Spark Integration** | `🟣 Architect` | The architectural pattern for orchestrating large-scale Apache Spark batch and streaming jobs from Airflow across distributed compute clusters. |
| 2 | **Astronomer Astro vs OSS** | `🟣 Architect` | The architectural evaluation between operating self-hosted open-source Apache Airflow versus managed enterprise platforms like Astronomer Astro. |
| 3 | **Custom Secret Backends** | `🟣 Architect` | Custom Secret Backends enable Airflow to retrieve Connections and Variables directly from enterprise secret management systems at runtime without storing secrets in the metadata database. |
| 4 | **Event-Driven Orchestration** | `🟣 Architect` | An architectural paradigm where Airflow pipelines trigger immediately in response to external real-time events (webhooks, Kafka messages, file arrivals) rather than static schedules. |
| 5 | **Multi-Tenant Airflow** | `🟣 Architect` | Multi-Tenant Airflow is an enterprise architectural model where multiple disparate teams or business units share Airflow infrastructure while maintaining strict workload isolation. |
| 6 | **RBAC in Airflow** | `🟣 Architect` | Role-Based Access Control (RBAC) in Airflow restricts user permissions to specific DAGs, connections, variables, and operational actions based on defined organizational roles. |

</details>

</details>

</details>

<details>
<summary><b>⚡ Microsoft Fabric & OneLake Architecture (39 Topics across 3 Sections)</b> — <i>Click to expand module</i></summary>

<details>
<summary>&nbsp;&nbsp;📂 <b>Section: OneLake & Cross-Cloud Shortcuts (18 Topics)</b> — <i>Click to expand functional domain</i></summary>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟢 Easy: <b>🟢 Easy (Level 100) (3 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Lakehouse** | `🟢 Easy` | An architecture that combines the flexible, cost-effective file storage of a data lake with the ACID transactions of a data warehouse. |
| 2 | **OneLake** | `🟢 Easy` | A single, unified, logical data lake for the entire organization, built on ADLS Gen2 using open Delta Parquet format. |
| 3 | **Shortcuts** | `🟢 Easy` | Virtual links in OneLake that point to other storage locations (internal or external) without copying the actual files. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟡 Intermediate: <b>🟡 Intermediate (Level 200) (4 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Dataflows Gen2** | `🟡 Intermediate` | A visual, low-code data transformation tool built on Power Query that ingests and transforms data, outputting results directly into Fabric data destinations (Lakehouse, Warehouse, SQL Database). |
| 2 | **Direct Lake Mode** | `🟡 Intermediate` | A Power BI storage mode that reads Delta Parquet files directly from OneLake without importing or running SQL queries. |
| 3 | **Fabric Warehouse COPY INTO Command** | `🟡 Intermediate` | A high-throughput, parallelized T-SQL bulk ingestion command in Microsoft Fabric Warehouse and Azure Synapse optimized for loading external Parquet, CSV, or ORC files from ADLS Gen2. |
| 4 | **Mirroring** | `🟡 Intermediate` | A zero-ETL, fully managed solution that replicates operational databases (Azure SQL, Cosmos DB, Snowflake) in near real-time directly into OneLake as Delta Lake tables. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🔴 Advanced: <b>🔴 Advanced (Level 300) (5 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Eventhouse OneLake Availability Synchronization** | `🔴 Advanced` | The streaming synchronization bridge in Microsoft Fabric Real-Time Intelligence that mirrors KQL database tables into OneLake Delta Parquet format without retroactively duplicating historical data. |
| 2 | **Fabric Eventstream Architecture: Event Hub to Lakehouse** | `🔴 Advanced` | Microsoft Fabric's no-code/low-code real-time ingestion service that streams high-throughput IoT telemetry from Azure Event Hubs through real-time processors into Lakehouse Delta tables. |
| 3 | **Fabric Real-Time Hub & Eventstreams** | `🔴 Advanced` | A unified SaaS event streaming hub capturing, transforming, and routing streaming data to OneLake and KQL databases. |
| 4 | **KQL Database (Real-Time Intelligence)** | `🔴 Advanced` | A high-performance database optimized for real-time telemetry, log analytics, and event streams, queried using Kusto Query Language (KQL) and integrated with OneLake. |
| 5 | **Purview Metadata Enrichment & Non-Destructive Cataloging** | `🔴 Advanced` | The architectural principle ensuring that metadata enrichment, classifications, and business definitions applied in Microsoft Purview do not modify source Fabric storage objects. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟣 Architect: <b>🟣 Staff Architect (Level 400) (6 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Fabric Storage Workload Decision Matrix: Warehouse vs Lakehouse vs KQL** | `🟣 Architect` | The architectural decision framework evaluating Microsoft Fabric Warehouse, Lakehouse, KQL Database, and OneLake based on transactional consistency, query engines, and data paradigms. |
| 2 | **Microsoft Fabric OneLake Shortcuts** | `🟣 Architect` | Zero-copy virtualization pointers linking external ADLS Gen2, AWS S3, or Google Cloud Storage buckets into OneLake. |
| 3 | **MPP 60-Distribution Storage Topology** | `🟣 Architect` | The MPP 60-Distribution Topology is the distributed storage architecture in Azure Synapse Analytics that partitions table storage across exactly 60 underlying database distributions. |
| 4 | **OneLake Data Mesh & Domain Governance Boundaries** | `🟣 Architect` | The multi-workspace decentralized domain architecture partitioning OneLake into autonomous product domains with automated governance gates. |
| 5 | **OneLake Tenant-Scoped Namespace & Shortcuts Architecture** | `🟣 Architect` | The unified SaaS data lake architecture of Microsoft Fabric where a single hierarchical namespace serves the entire enterprise tenant, eliminating data silos via zero-copy shortcuts. |
| 6 | **PolyBase & MPP Parallel Data Loading** | `🟣 Architect` | PolyBase is a data virtualization and high-speed ingestion technology in Azure Synapse and SQL Server that leverages MPP compute nodes to read external cloud storage blocks in parallel. |

</details>

</details>

<details>
<summary>&nbsp;&nbsp;📂 <b>Section: Direct Lake Mode & Semantic Models (5 Topics)</b> — <i>Click to expand functional domain</i></summary>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🔴 Advanced: <b>🔴 Advanced (Level 300) (3 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Power BI Service Cloud Refresh Schema Drift** | `🔴 Advanced` | Power BI Service Cloud Refresh Schema Drift is a production outage scenario where cloud scheduled data refreshes fail following backend database column deletions or renames. |
| 2 | **Semantic Link** | `🔴 Advanced` | A Python library ('sempy') that establishes a bidirectional bridge between Spark DataFrames and Power BI semantic models. |
| 3 | **XMLA Endpoint** | `🔴 Advanced` | An industry-standard communication protocol that allows external client tools to connect directly to Fabric semantic models. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟣 Architect: <b>🟣 Staff Architect (Level 400) (2 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Direct Lake Fallback & V-Order Columnar Optimization** | `🟣 Architect` | The in-memory columnar caching architecture where Power BI VertiPaq reads Delta Parquet directly without translation, and the architectural gates that prevent DirectQuery fallback. |
| 2 | **Fabric Automated Lineage & Decoupled Purview RBAC** | `🟣 Architect` | The governance security model where Fabric automated lineage capture requires specific workspace settings, while Purview enforces role-based access control completely independent of Fabric permissions. |

</details>

</details>

<details>
<summary>&nbsp;&nbsp;📂 <b>Section: Workload Engines, F-SKU Capacities & Governance (16 Topics)</b> — <i>Click to expand functional domain</i></summary>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟢 Easy: <b>🟢 Easy (Level 100) (1 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Copilot in Microsoft Fabric** | `🟢 Easy` | An AI-powered assistant integrated into Fabric to generate code, summarize datasets, and build reporting visuals. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟡 Intermediate: <b>🟡 Intermediate (Level 200) (5 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Fabric Capacities (F-SKUs)** | `🟡 Intermediate` | The shared pool of compute resources (expressed in Capacity Units or CUs) that powers all workloads in Microsoft Fabric. |
| 2 | **Fabric Deployment Pipelines** | `🟡 Intermediate` | Built-in CI/CD release management facilitating automated promotion of Fabric workspaces from dev to test to prod. |
| 3 | **Git Integration** | `🟡 Intermediate` | A feature that connects Fabric workspaces directly to Azure DevOps or GitHub repositories for source control of item metadata. |
| 4 | **Medallion Architecture** | `🟡 Intermediate` | A data curation pattern consisting of three distinct layers: Bronze (raw), Silver (cleansed), and Gold (curated). |
| 5 | **Real-Time Intelligence** | `🟡 Intermediate` | A workload suite in Fabric designed to ingest, process, and analyze high-volume streaming data in real-time. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🔴 Advanced: <b>🔴 Advanced (Level 300) (4 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Fabric KQL Database (Eventhouse)** | `🔴 Advanced` | A high-performance columnar time-series database optimized for real-time telemetry, logs, and free-text search. |
| 2 | **Purview Data Quality Rules: Definition vs Execution** | `🔴 Advanced` | The governance boundary establishing that data quality rules in Microsoft Purview are centralized definitions, whereas execution requires separate implementation across compute engines. |
| 3 | **V-Order Serialization** | `🔴 Advanced` | A Microsoft-proprietary optimization algorithm applied to Delta Parquet files to accelerate read speeds. |
| 4 | **Workspace Managed Identities** | `🔴 Advanced` | System-assigned identities created at the workspace level to secure access to Azure resources without storing credentials. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟣 Architect: <b>🟣 Staff Architect (Level 400) (6 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Fabric & Purview Tenant Co-location & Native Architecture** | `🟣 Architect` | The mandatory single-tenant governance architecture requiring Microsoft Purview and Microsoft Fabric to reside within the exact same Azure Active Directory (Microsoft Entra ID) tenant for native metadata, lineage, and policy integration. |
| 2 | **Fabric Capacity Unit (CU) Smoothing & Throttling** | `🟣 Architect` | The mathematical governor algorithm Microsoft Fabric uses to distribute interactive and background computational spikes over 24-hour moving averages. |
| 3 | **Fabric Declarative Git Integration & ALM Pipelines** | `🟣 Architect` | The enterprise Application Lifecycle Management (ALM) framework integrating Fabric workspaces with Git repositories and multi-stage deployment pipelines. |
| 4 | **Fabric Workspace Roles: Viewer vs Member vs Admin vs Capacity Admin** | `🟣 Architect` | The role-based access control (RBAC) hierarchy governing content authoring, access administration, and capacity resource allocation within Microsoft Fabric workspaces. |
| 5 | **Microsoft Fabric Capacity Unit (CU) Smoothing** | `🟣 Architect` | The multi-hour algorithmic capacity governance in Microsoft Fabric that averages high-intensity compute spikes over 24-hour evaluation windows. |
| 6 | **Microsoft Purview in Fabric & GDPR Compliance** | `🟣 Architect` | The unified data governance integration within Microsoft Fabric (via the Purview Hub) providing automated data discovery, PII classification, sensitivity labeling, and cross-workspace lineage essential for GDPR compliance. |

</details>

</details>

</details>

<details>
<summary><b>🔄 Azure Data Factory (ADF) & Resilient Orchestration (27 Topics across 3 Sections)</b> — <i>Click to expand module</i></summary>

<details>
<summary>&nbsp;&nbsp;📂 <b>Section: Control Flow, Pipelines & Parameterization (12 Topics)</b> — <i>Click to expand functional domain</i></summary>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟢 Easy: <b>🟢 Easy (Level 100) (2 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Pipeline** | `🟢 Easy` | A logical grouping of activities that coordinates and executes data workflows. |
| 2 | **Trigger** | `🟢 Easy` | The mechanism that defines when a data pipeline execution should be started. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟡 Intermediate: <b>🟡 Intermediate (Level 200) (3 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **ADF Bounded ForEach Concurrency** | `🟡 Intermediate` | Configuring the `batchCount` parameter on ForEach activities to limit parallel pipeline invocations. |
| 2 | **Schema Drift** | `🟡 Intermediate` | The capability of a data pipeline to gracefully handle changes in source schemas (added or renamed columns) without crashing. |
| 3 | **Tumbling Window Trigger** | `🟡 Intermediate` | A specialized time-slice trigger that supports state tracking, dependencies, and backfilling. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🔴 Advanced: <b>🔴 Advanced (Level 300) (3 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **ADF CI/CD and Global Parameters** | `🔴 Advanced` | The deployment pipeline process that promotes ADF configurations across environments using ARM Templates. |
| 2 | **ADF Tumbling Window Self-Dependency** | `🔴 Advanced` | Configuring tumbling window triggers to depend on the successful completion of the preceding time window slice. |
| 3 | **Metadata-driven Pipelines** | `🔴 Advanced` | A pipeline design pattern where the orchestration parameters are read from an external SQL control table. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟣 Architect: <b>🟣 Staff Architect (Level 400) (4 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **ADF Metadata-Driven Ingestion Framework** | `🟣 Architect` | An enterprise pipeline architecture where a single parameterized Azure Data Factory pipeline orchestrates extraction for thousands of tables guided by a SQL control database. |
| 2 | **ADF Pipeline Idempotency & Concurrency Governance** | `🟣 Architect` | Fault-tolerant orchestration patterns ensuring pipeline retries produce identical results without data duplication, race conditions, or connection pool exhaustion. |
| 3 | **Metadata-Driven Dynamic ETL Framework Architecture** | `🟣 Architect` | Universal pipeline architecture orchestrating thousands of heterogeneous table ingestions dynamically using database control tables and parameterized activities. |
| 4 | **Metadata-Driven Pipeline Orchestration: GetMetadata and ForEach** | `🟣 Architect` | A scalable Data Factory pipeline design pattern that dynamically controls data ingestion workflows by querying centralized metadata tables using Lookup, ForEach, and GetMetadata activities. |

</details>

</details>

<details>
<summary>&nbsp;&nbsp;📂 <b>Section: Integration Runtimes (Azure IR / Self-Hosted IR) (4 Topics)</b> — <i>Click to expand functional domain</i></summary>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟢 Easy: <b>🟢 Easy (Level 100) (1 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **SHIR Auto-Update** | `🟢 Easy` | The automated mechanism that downloads and applies updates to Self-Hosted Integration Runtime nodes. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟡 Intermediate: <b>🟡 Intermediate (Level 200) (1 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Self-hosted Integration Runtime (SHIR)** | `🟡 Intermediate` | The compute infrastructure used to run copy activities and scan metadata on private networks. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🔴 Advanced: <b>🔴 Advanced (Level 300) (1 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **ADF Self-Hosted Integration Runtime (SHIR)** | `🔴 Advanced` | An agent installed on an on-premises machine or private cloud virtual network that enables Azure Data Factory to securely access and copy data from protected internal network sources. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟣 Architect: <b>🟣 Staff Architect (Level 400) (1 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Self-Hosted Integration Runtime (SHIR) High-Availability Clustering** | `🟣 Architect` | Scalable multi-node agent topology linking cloud data factories to on-premises enterprise networks with automated failover and dynamic load balancing. |

</details>

</details>

<details>
<summary>&nbsp;&nbsp;📂 <b>Section: Data Movement, Managed VNets & Security (11 Topics)</b> — <i>Click to expand functional domain</i></summary>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟢 Easy: <b>🟢 Easy (Level 100) (2 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Linked Service** | `🟢 Easy` | The connection definition that defines connection strings and credentials to external resources in ADF. |
| 2 | **Variables vs Parameters** | `🟢 Easy` | Orchestration primitives defining constant configuration inputs (Parameters) vs dynamic execution values (Variables). |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟡 Intermediate: <b>🟡 Intermediate (Level 200) (5 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **ADF REST API Pagination Handling** | `🟡 Intermediate` | Configuring pagination rules (AbsoluteUrl, QueryParameters, NextSibling) to incrementally extract paginated JSON feeds. |
| 2 | **Data Factory Managed Airflow** | `🟡 Intermediate` | A managed service in ADF that hosts Apache Airflow environments, enabling Python-based DAG orchestration. |
| 3 | **Managed Private Endpoints** | `🟡 Intermediate` | Private IP addresses provisioned inside the ADF Managed Virtual Network to secure connections to Azure resources. |
| 4 | **Managed Virtual Network (Managed VNet)** | `🟡 Intermediate` | A secure networking feature that runs ADF Integration Runtimes inside a dedicated private network boundary, connecting to services via Private Endpoints. |
| 5 | **Mapping Data Flows** | `🟡 Intermediate` | A visual, code-free data transformation tool in ADF that executes on an underlying Spark cluster. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🔴 Advanced: <b>🔴 Advanced (Level 300) (3 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **ADF Mapping Data Flows vs. Azure Databricks** | `🔴 Advanced` | The architectural decision framework comparing ADF's visual, code-free Spark execution engine (Mapping Data Flows) against code-first Azure Databricks compute for enterprise ETL/ELT. |
| 2 | **Azure Synapse Link** | `🔴 Advanced` | A cloud-native, zero-ETL synchronization service that continuously replicates operational data into analytical stores. |
| 3 | **Dynamic Parameterization** | `🔴 Advanced` | The practice of using runtime parameters to configure connection strings, dataset schemas, and targets. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟣 Architect: <b>🟣 Staff Architect (Level 400) (1 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **ADF Managed Private Endpoint Provisioning & Timeout Bypass** | `🟣 Architect` | Enterprise network security architecture managing lifecycle, approval protocols, and timeout bypass for private endpoints inside ADF Managed Virtual Networks. |

</details>

</details>

</details>

<details>
<summary><b>📊 Power BI & VertiPaq Analytics Engine (25 Topics across 3 Sections)</b> — <i>Click to expand module</i></summary>

<details>
<summary>&nbsp;&nbsp;📂 <b>Section: VertiPaq Engine & Columnar Compression (5 Topics)</b> — <i>Click to expand functional domain</i></summary>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟢 Easy: <b>🟢 Easy (Level 100) (1 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Import Mode** | `🟢 Easy` | A storage mode where data is loaded and compressed directly into the Power BI Analysis Services memory engine. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟡 Intermediate: <b>🟡 Intermediate (Level 200) (1 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **DirectQuery Mode** | `🟡 Intermediate` | A storage mode where Power BI does not import data, but queries the source system in real-time. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🔴 Advanced: <b>🔴 Advanced (Level 300) (1 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **VertiPaq Engine** | `🔴 Advanced` | The in-memory columnar database engine that powers Power BI datasets and Analysis Services models. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟣 Architect: <b>🟣 Staff Architect (Level 400) (2 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Power BI Direct Lake Mode & VertiPaq Paging** | `🟣 Architect` | A semantic model connectivity mode in Microsoft Fabric where the VertiPaq engine loads Delta Parquet columnar files directly from OneLake into memory without scheduled refresh. |
| 2 | **VertiPaq Engine Columnar Compression & Cardinality Reduction** | `🟣 Architect` | Low-level memory optimization strategies governing dictionary encoding, Run-Length Encoding (RLE), and bit-packing in the VertiPaq engine. |

</details>

</details>

<details>
<summary>&nbsp;&nbsp;📂 <b>Section: DAX Evaluation Context & Calculations (6 Topics)</b> — <i>Click to expand functional domain</i></summary>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟢 Easy: <b>🟢 Easy (Level 100) (2 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Row Context** | `🟢 Easy` | The active row evaluation environment in DAX that occurs during calculated column evaluations or iterator loops. |
| 2 | **Visual Calculations** | `🟢 Easy` | DAX calculations defined and executed directly within a specific visual, bypassing semantic model structure changes. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟡 Intermediate: <b>🟡 Intermediate (Level 200) (2 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Calculation Groups** | `🟡 Intermediate` | A model design pattern that uses the SELECTEDMEASURE() function to define dynamic, reusable DAX calculations that can be applied to any visual metric. |
| 2 | **Filter Context** | `🟡 Intermediate` | The active filtering parameters applied to a visual at the time of DAX measure execution. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🔴 Advanced: <b>🔴 Advanced (Level 300) (2 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **CALCULATE Function** | `🔴 Advanced` | The primary DAX function used to modify the active Filter Context or trigger Context Transition. |
| 2 | **DAX Calculation Groups** | `🔴 Advanced` | Dynamic calculation modifiers in tabular models allowing a single calculation item (e.g. YTD, YoY%) to apply across all base measures. |

</details>

</details>

<details>
<summary>&nbsp;&nbsp;📂 <b>Section: Composite Models, Semantic Refresh & Aggregations (14 Topics)</b> — <i>Click to expand functional domain</i></summary>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟢 Easy: <b>🟢 Easy (Level 100) (1 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Star Schema** | `🟢 Easy` | A dimensional data modeling design containing central fact tables surrounded by descriptive dimension tables. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟡 Intermediate: <b>🟡 Intermediate (Level 200) (4 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Power BI Project (.pbip)** | `🟡 Intermediate` | A developer-focused directory save format that stores reports and semantic models as separate text-based files to enable Git source control and CI/CD. |
| 2 | **Query Folding** | `🟡 Intermediate` | The capability of Power Query to compile visual transformation steps into a single SQL statement executed by the source database. |
| 3 | **Row-Level Security (RLS)** | `🟡 Intermediate` | A security feature that restricts database row access for specific users based on active role filters. |
| 4 | **TMDL Declarative Semantic Modeling** | `🟡 Intermediate` | A human-readable, folder-based serialization format for Power BI semantic models designed for Git version control. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🔴 Advanced: <b>🔴 Advanced (Level 300) (5 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Composite Models** | `🔴 Advanced` | A model design that combines tables with different storage modes (Import and DirectQuery) in a single dataset. |
| 2 | **Hybrid Tables** | `🔴 Advanced` | A semantic model partition design that combines historical cached data (Import) with real-time live data (DirectQuery). |
| 3 | **Incremental Refresh** | `🔴 Advanced` | A pattern that partitions datasets so only recently changed data slices are refreshed. |
| 4 | **Power BI Aggregation Tables (Dual Storage)** | `🔴 Advanced` | Creating pre-aggregated in-memory tables mapped to detail tables, allowing visual queries to hit memory whenever possible. |
| 5 | **Tabular Model Definition Language (TMDL)** | `🔴 Advanced` | A human-readable, indentation-based YAML-like language used to define semantic model metadata and structures. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟣 Architect: <b>🟣 Staff Architect (Level 400) (4 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Composite Models & Hybrid Table Partitioning** | `🟣 Architect` | Multi-tiered storage engine architecture combining Import, DirectQuery, and Dual storage modes in a single enterprise semantic model. |
| 2 | **Object-Level Security (OLS) & Dynamic RLS at Scale** | `🟣 Architect` | Fine-grained security architecture enforcing dynamic row filters and complete column/table metadata obfuscation across enterprise user bases. |
| 3 | **Power BI Direct Lake Framing Operation & Capacity Units** | `🟣 Architect` | The sub-second, metadata-only refresh mechanism in Power BI Direct Lake mode that synchronizes Delta Lake table schemas and file pointers without loading or copying data, consuming minimal CUs. |
| 4 | **XMLA Endpoint Governance & Large Dataset Storage Format** | `🟣 Architect` | Programmatic semantic model manipulation, automated partition management, and scale-out architecture via XMLA read/write endpoints. |

</details>

</details>

</details>

<details>
<summary><b>🐍 Python & Vectorized Data Engineering Primitives (22 Topics across 3 Sections)</b> — <i>Click to expand module</i></summary>

<details>
<summary>&nbsp;&nbsp;📂 <b>Section: CPython Internals & Memory Architecture (10 Topics)</b> — <i>Click to expand functional domain</i></summary>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟢 Easy: <b>🟢 Easy (Level 100) (1 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Python Generators & Memory Efficiency** | `🟢 Easy` | Generators are iterator functions written with the yield statement that produce a sequence of values lazily on-demand rather than allocating the entire collection in RAM. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟡 Intermediate: <b>🟡 Intermediate (Level 200) (3 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Pandas Vectorization vs Itertuples** | `🟡 Intermediate` | Vectorization delegates operations to pre-compiled C/Fortran SIMD loops across contiguous memory buffers, avoiding the massive Python interpreter overhead of row-by-row iteration. |
| 2 | **Python Multiprocessing vs Multithreading** | `🟡 Intermediate` | Multithreading runs multiple threads within a single process sharing memory under the GIL, while multiprocessing spawns distinct OS processes with independent GILs and memory spaces. |
| 3 | **Python multiprocessing vs. multithreading in GIL** | `🟡 Intermediate` | Understanding the Global Interpreter Lock (GIL) and when to use CPU-bound multiprocessing versus I/O-bound threading. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🔴 Advanced: <b>🔴 Advanced (Level 300) (3 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Apache Arrow & Zero-Copy Memory Model** | `🔴 Advanced` | Apache Arrow is a standardized columnar in-memory format that enables zero-copy sharing of data arrays between different execution engines without serialization overhead. |
| 2 | **CPython GIL (Global Interpreter Lock)** | `🔴 Advanced` | The Global Interpreter Lock is a mutual exclusion lock used by CPython to prevent multiple native OS threads from executing Python bytecode simultaneously, protecting internal memory reference counts. |
| 3 | **Polars LazyFrame Streaming Execution** | `🔴 Advanced` | A Rust-based vectorized dataframe query engine that builds an optimized query plan and streams data in memory-capped batches for out-of-core execution. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟣 Architect: <b>🟣 Staff Architect (Level 400) (3 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Apache Arrow PyCapsule Zero-Copy Protocol** | `🟣 Architect` | The standard C data interface enabling Python data libraries (Polars, DuckDB, Pandas, PyTorch, PySpark) to exchange columnar memory buffers with zero copy or serialization. |
| 2 | **Arrow PyCapsule IPC Memory Sharing** | `🟣 Architect` | Standardized C memory protocol allowing zero-copy sharing of PyArrow tables directly to DuckDB or Polars. |
| 3 | **CPython Memory Internals & GC Tracemalloc** | `🟣 Architect` | CPython manages memory through reference counting supplemented by a cyclic generational garbage collector (Generations 0, 1, and 2) and the PyMalloc sub-allocator for small objects. |

</details>

</details>

<details>
<summary>&nbsp;&nbsp;📂 <b>Section: Vectorized & In-Memory IPC (Arrow / Polars) (2 Topics)</b> — <i>Click to expand functional domain</i></summary>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🔴 Advanced: <b>🔴 Advanced (Level 300) (1 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Polars LazyFrame & Query Optimization** | `🔴 Advanced` | Polars LazyFrame defers DataFrame computations into an Abstract Syntax Tree (AST) that undergoes logical optimization (predicate and projection pushdown) prior to vectorized execution. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟣 Architect: <b>🟣 Staff Architect (Level 400) (1 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **High-Throughput Polyglot Arrow IPC & Flight Architecture** | `🟣 Architect` | Arrow Flight is a high-performance RPC framework built on gRPC and Arrow columnar data, designed specifically for parallel stream transfer of large tabular datasets across distributed cluster nodes. |

</details>

</details>

<details>
<summary>&nbsp;&nbsp;📂 <b>Section: Language Idioms, Generators & Type Contracts (10 Topics)</b> — <i>Click to expand functional domain</i></summary>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟢 Easy: <b>🟢 Easy (Level 100) (3 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Python Context Managers & with Statement** | `🟢 Easy` | Context managers encapsulate setup and teardown logic around a code block using the __enter__ and __exit__ dunder methods invoked via the with statement. |
| 2 | **Python List & Dictionary Comprehensions** | `🟢 Easy` | Comprehensions provide a concise syntactic construct to generate lists, sets, or dictionaries by transforming and filtering iterables in optimized C-level bytecode. |
| 3 | **Python Type Hints & Static Typing** | `🟢 Easy` | Type hints (PEP 484) provide annotations on function signatures and variables, enabling static analysis tools like mypy and IDE autocompletion without impacting runtime performance. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟡 Intermediate: <b>🟡 Intermediate (Level 200) (4 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **DuckDB In-Process Vectorized OLAP** | `🟡 Intermediate` | An embeddable, columnar analytical SQL database engine that runs inside the host process without separate server daemon management. |
| 2 | **Pydantic Data Contracts & Validation** | `🟡 Intermediate` | Pydantic is a data validation and parsing library that enforces type hints at runtime, parsing raw dictionaries or JSON payloads into validated, immutable domain models. |
| 3 | **Pydantic v2 Rust-Core Validation** | `🟡 Intermediate` | A high-performance data validation library rewritten in Rust, validating dictionary payloads and enforcing type constraints. |
| 4 | **Python Decorators & Pipeline Interceptors** | `🟡 Intermediate` | Decorators are higher-order functions that dynamically wrap and extend the behavior of another function or method without altering its source code. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🔴 Advanced: <b>🔴 Advanced (Level 300) (1 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Python AsyncIO Event Loop & Non-Blocking I/O** | `🔴 Advanced` | AsyncIO provides single-threaded concurrent execution using cooperative multitasking managed by an event loop, scheduling coroutines using async and await keywords. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟣 Architect: <b>🟣 Staff Architect (Level 400) (2 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Distributed Python Runtimes: Ray vs PySpark Architecture** | `🟣 Architect` | Ray is an asynchronous distributed actor and task execution framework designed for Python-native distributed computing, contrasting with PySpark's JVM-centric BSP (Bulk Synchronous Parallel) execution model. |
| 2 | **Rust PyO3 Extension Architecture for Data Pipelines** | `🟣 Architect` | PyO3 provides Rust bindings for Python, allowing developers to write native Rust extension modules that compile into shared libraries (.so / .pyd) callable directly from Python code. |

</details>

</details>

</details>

<details>
<summary><b>🚀 General Data Engineering, Dimensional Modeling & Governance (63 Topics across 2 Sections)</b> — <i>Click to expand module</i></summary>

<details>
<summary>&nbsp;&nbsp;📂 <b>Section: Dimensional Modeling & Kimball Standards (6 Topics)</b> — <i>Click to expand functional domain</i></summary>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟢 Easy: <b>🟢 Easy (Level 100) (3 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Dimension Table** | `🟢 Easy` | A table in a dimensional database model containing descriptive attributes used to filter, group, and slice facts. |
| 2 | **Fact Table** | `🟢 Easy` | A central table in a dimensional database model containing quantitative metrics and keys referencing dimension tables. |
| 3 | **SCD Type 1 vs Type 3** | `🟢 Easy` | Dimensional design patterns defining overwrite updates (Type 1) vs limited historical tracking columns (Type 3). |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟡 Intermediate: <b>🟡 Intermediate (Level 200) (1 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Slowly Changing Dimensions Type 2 (SCD Type 2)** | `🟡 Intermediate` | A design pattern that tracks historical attribute changes by creating new records with effective start/end dates. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟣 Architect: <b>🟣 Staff Architect (Level 400) (2 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Apache Pinot Star-Tree Indexing** | `🟣 Architect` | A pre-aggregation index structure in Apache Pinot that enables sub-second OLAP queries across billions of rows by storing tree-structured multi-dimensional aggregations. |
| 2 | **SCD Type 4 vs Type 6 Enterprise Dimensional Architecture** | `🟣 Architect` | Advanced Kimball dimensional modeling strategies designed to handle rapid historical attribute tracking without explosive row duplication or query degradation. |

</details>

</details>

<details>
<summary>&nbsp;&nbsp;📂 <b>Section: ETL Architecture, CDC & Idempotency (57 Topics)</b> — <i>Click to expand functional domain</i></summary>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟢 Easy: <b>🟢 Easy (Level 100) (9 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Apache Arrow In-Memory Columnar Model** | `🟢 Easy` | A standardized, language-independent columnar memory layout that enables zero-copy data exchange across analytics engines and language runtimes. |
| 2 | **Data Freshness Service-Level Objective** | `🟢 Easy` | A measurable target for the delay between a source change and the point at which a consumer can use the corresponding trusted data. |
| 3 | **Data Quality Evidence with Lineage** | `🟢 Easy` | A record connecting a quality check result to the data version, pipeline run, rules, and upstream inputs that produced it. |
| 4 | **dbt (Data Build Tool)** | `🟢 Easy` | A transformation tool that lets developers build, test, and document SQL models inside their data warehouse using SELECT statements. |
| 5 | **ETL vs ELT** | `🟢 Easy` | Ingestion paradigms defining whether data transformation occurs before (ETL) or after (ELT) landing in the target storage system. |
| 6 | **Graceful Dataset Deprecation and Retirement Protocol** | `🟢 Easy` | A structured engineering lifecycle protocol that signals deprecation intent, redirects consumers, logs access telemetry, and decommissions obsolete data assets without breaking production systems. |
| 7 | **Idempotent High-Watermark API Ingestion** | `🟢 Easy` | An ingestion pattern that records the highest processed record modification timestamp to query only new or updated records while deduplicating replays at the destination. |
| 8 | **Lakehouse Paradigm** | `🟢 Easy` | An architectural pattern combining the cheap file storage of data lakes with the ACID transactions of warehouses. |
| 9 | **SLA-Driven Pipeline Alerting (PagerDuty)** | `🟢 Easy` | Instrumenting pipeline run durations against agreed business SLAs to trigger automated pager alerts before breach. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟡 Intermediate: <b>🟡 Intermediate (Level 200) (10 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Change Data Capture (CDC)** | `🟡 Intermediate` | A technology that monitors database logs in real-time to identify and capture insert, update, and delete actions. |
| 2 | **Data Mesh** | `🟡 Intermediate` | A decentralized architectural paradigm that shifts data ownership and governance from a central platform team to domain product teams. |
| 3 | **Data Observability** | `🟡 Intermediate` | The practice of monitoring, alerting, and diagnosing the health and quality of data pipelines in production. |
| 4 | **Data Orchestration** | `🟡 Intermediate` | The practice of automating, scheduling, and monitoring complex data workflows and pipeline dependencies. |
| 5 | **Data Platform Paved Path** | `🟡 Intermediate` | A supported, reusable route for teams to build, deploy, secure, and operate a common class of data workloads. |
| 6 | **FinOps Practices** | `🟡 Intermediate` | An operational framework that brings financial accountability to the variable spend of cloud resources. |
| 7 | **Human Approval Gate for Data Agents** | `🟡 Intermediate` | A review checkpoint that pauses an automated agent before a consequential action such as changing a production pipeline, granting access, or exporting sensitive data. |
| 8 | **OpenLineage Standard Operational Run Facets** | `🟡 Intermediate` | An open standard specification that captures job execution events, input/output dataset schemas, row counts, and error states emitted during pipeline runs. |
| 9 | **Redis Semantic Caching for LLMs** | `🟡 Intermediate` | A caching strategy that uses vector embeddings in Redis to return pre-computed LLM answers for semantically equivalent user queries. |
| 10 | **Streaming Dead Letter Queue (DLQ) Pattern** | `🟡 Intermediate` | An error-handling pattern in streaming pipelines that routes unparseable or schema-violating poison-pill messages to an isolated queue without stopping the pipeline. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🔴 Advanced: <b>🔴 Advanced (Level 300) (17 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Apache Flink RocksDB State Backend** | `🔴 Advanced` | An out-of-core state storage backend for Apache Flink that stores stateful stream operators in local embedded RocksDB instances rather than JVM heap memory. |
| 2 | **Apache Kafka KRaft (Kafka Raft) Consensus** | `🔴 Advanced` | The native consensus protocol that replaces Apache ZooKeeper in Apache Kafka, managing metadata quorum directly within Kafka broker processes. |
| 3 | **AsyncIO & Event Loops in High-Throughput REST Data Ingestion** | `🔴 Advanced` | Single-threaded cooperative multitasking utilizing non-blocking I/O multiplexers (epoll/kqueue) to ingest thousands of API endpoints concurrently with minimal OS thread memory overhead. |
| 4 | **Automated Source-to-Sink Ledger Reconciliation** | `🔴 Advanced` | A mathematical verification pipeline that continuously compares financial or transactional source balances against downstream warehouse aggregations. |
| 5 | **Data Contracts** | `🔴 Advanced` | Formal agreements between data producers and consumers defining schema structure, data quality constraints, and SLA expectations. |
| 6 | **Data Pipeline Idempotency Key Tracking** | `🔴 Advanced` | Using dedicated audit tables to verify whether an ingestion batch has already committed before executing transformations. |
| 7 | **Event-Driven Architecture** | `🔴 Advanced` | A decoupled software architecture where data is produced and consumed as asynchronous event messages. |
| 8 | **Idempotency** | `🔴 Advanced` | A data pipeline design property ensuring that executing a pipeline multiple times with the same input produces the exact same output. |
| 9 | **Idempotency in Data Pipelines** | `🔴 Advanced` | The architectural property of a data pipeline ensuring that executing the same pipeline multiple times with the exact same input produces the exact same destination state without duplicate records. |
| 10 | **Kappa Architecture** | `🔴 Advanced` | A software architecture design pattern that processes all data streams through a single streaming engine. |
| 11 | **Pydantic V2 Rust Core Data Validation & Serialization** | `🔴 Advanced` | A data validation and parsing library rewritten in Rust (pydantic-core) that enforces strict type contracts, schema evolution, and deserialization speed for Python ETL and streaming pipelines. |
| 12 | **Python Protocols (PEP 544) & Structural Subtyping in ETL Frameworks** | `🔴 Advanced` | Static duck typing mechanism in Python allowing data pipeline interfaces to enforce structural contracts at compile time without requiring rigid class inheritance hierarchies. |
| 13 | **RAG Semantic Chunking Strategies** | `🔴 Advanced` | Document partitioning techniques that divide raw text into retrieval chunks based on syntactic and semantic boundaries rather than arbitrary character or token counts. |
| 14 | **Reciprocal Rank Fusion (RRF) Hybrid Search** | `🔴 Advanced` | A rank aggregation algorithm that combines candidate search results from dense vector similarity and sparse BM25 lexical keyword retrieval into a single score. |
| 15 | **Small File Syndrome in Data Lake Ingestion** | `🔴 Advanced` | Performance degradation and storage throttling caused by millions of micro-batch files (under 10MB) flooding lakehouse directories. |
| 16 | **Stream Analytics Watermark Policies & Late Event Handling** | `🔴 Advanced` | The event-time tracking mechanism in stream processing engines that configures late-arrival and out-of-order tolerance windows to ensure accurate window calculation despite network latency. |
| 17 | **Vectorized Numerical & Array Operations via NumPy & Arrow** | `🔴 Advanced` | The technique of replacing scalar Python for-loops with contiguous C/Rust memory array operations evaluated via CPU SIMD (Single Instruction, Multiple Data) instructions. |

</details>

<details>
<summary>&nbsp;&nbsp;&nbsp;&nbsp;🟣 Architect: <b>🟣 Staff Architect (Level 400) (21 Topics)</b></summary>

| # | Topic / Concept | Difficulty | Architectural Definition & Core Principle |
|:---:|---|:---:|---|
| 1 | **Agent Data Access Delegation** | `🟣 Architect` | A policy pattern in which an agent uses bounded authority derived from a user or workload identity instead of broad, ambient platform credentials. |
| 2 | **Apache Arrow Zero-Copy Memory & C Data Interface in Python** | `🟣 Architect` | A standardized in-memory columnar format and C ABI specification that enables multiple runtimes (Python, JVM, Rust, C++) to share memory buffers without serialization overhead. |
| 3 | **Chaos Engineering in Big Data Pipelines** | `🟣 Architect` | Intentionally injecting cluster node failures, network partitions, and poison-pill files to verify system resilience. |
| 4 | **Cython & Numba JIT Compilation for CPU-Bound Python Pipelines** | `🟣 Architect` | Compiler tools that translate performance-critical Python algorithms into optimized native machine code (C/C++ or LLVM IR) to achieve near-C execution speeds. |
| 5 | **Data Contract Enforcement Engine & Semantic Versioning** | `🟣 Architect` | Automated CI/CD governance architecture enforcing schema backward-compatibility, semantic versioning, and dead-letter quarantine between microservices and lakehouses. |
| 6 | **Delta-RS: Rust-Backed Native Delta Lake in Python** | `🟣 Architect` | A lightweight, native Rust-powered library (deltalake Python package) that enables reading, writing, and ACID transaction log commits on Delta tables without requiring a Spark JVM runtime. |
| 7 | **DuckDB In-Memory Columnar OLAP Engine in Python** | `🟣 Architect` | An embeddable, vectorized SQL analytical database engine for Python that executes complex analytical queries over Parquet, Arrow, and CSV files directly from local disk and cloud object storage. |
| 8 | **FinOps for Cloud Data Platforms: Unit Economics & Governance** | `🟣 Architect` | Strategic financial engineering framework measuring cloud data platform expenditure against business revenue drivers and automated cost reclamation. |
| 9 | **High-Concurrency Relational Ingestion: SQLAlchemy 2.0 AsyncEngine** | `🟣 Architect` | An asynchronous database abstraction and connection management framework utilizing AsyncIO and non-blocking database drivers (asyncpg, aiomysql) for high-concurrency data workloads. |
| 10 | **Kafka Tiered Storage Architecture** | `🟣 Architect` | A storage architecture that separates Kafka compute from storage by offloading historical log segments to cost-effective cloud object storage (S3/ADLS/GCS). |
| 11 | **Low-Latency Streaming Ingestion in Python via confluent-kafka (librdkafka)** | `🟣 Architect` | High-performance Python Kafka client built on top of the native C library librdkafka, offering sub-millisecond message delivery, asynchronous batching, and exact-once semantics (EOS). |
| 12 | **Polars LazyFrame Query Optimization & Streaming Engine** | `🟣 Architect` | A high-performance query optimizer in Python that constructs an unresolved logical query plan, evaluates algebraic optimizations (pushdown, projection pruning), and executes out-of-core batches via an Arrow-native Rust engine. |
| 13 | **PyArrow Flight SQL: High-Throughput Columnar Wire Protocol** | `🟣 Architect` | An open-standard network protocol built on Apache Arrow Flight and gRPC designed to transfer tabular datasets between analytical databases and Python clients without serialization penalties. |
| 14 | **Python AST (Abstract Syntax Tree) & Metaprogramming in Data Pipelines** | `🟣 Architect` | The programmatic parsing, inspection, and transformation of Python source code into tree structures using the built-in ast module for static code analysis, lineage extraction, and dynamic query compilation. |
| 15 | **Python Data Contract Enforcement in CI/CD via Pydantic & JSON Schema** | `🟣 Architect` | A shift-left data architecture methodology where schema definitions, semantic constraints, and SLA rules are codified in version control and enforced programmatically in deployment pipelines before data reaches the Lakehouse. |
| 16 | **Python Generational Garbage Collection & Cyclic References** | `🟣 Architect` | CPython's dual memory management strategy combining deterministic immediate reference counting with an asynchronous generational cyclical garbage collector (Generation 0, 1, and 2). |
| 17 | **Python Global Interpreter Lock (GIL) & PEP 703 Free-Threading** | `🟣 Architect` | A mutex that protects access to Python objects, preventing multiple threads from executing Python bytecodes simultaneously in CPython, with PEP 703 introducing optional free-threaded build flags. |
| 18 | **Python Memory Profiling & Leak Triage (tracemalloc & objgraph)** | `🟣 Architect` | Diagnostic methodologies and tooling to trace memory allocation peaks, detect circular reference memory leaks, and prevent OOM kills in long-running Python worker containers. |
| 19 | **Python Shared Memory (multiprocessing.shared_memory) & Zero-Copy IPC** | `🟣 Architect` | A standard library facility introduced in Python 3.8 providing memory blocks that can be accessed and manipulated concurrently across independent Python processes without serialization or socket overhead. |
| 20 | **Resilient Distributed Pipeline Patterns: Decorators for Backoff & Circuit Breakers** | `🟣 Architect` | Advanced Python metaprogramming patterns using closures and decorators to enforce enterprise fault-tolerance: exponential backoff, jitter, circuit breakers, and distributed locks. |
| 21 | **Transactional Outbox Pattern & CDC Event Streaming** | `🟣 Architect` | Resilient microservice-to-lakehouse event streaming architecture ensuring relational database mutations and message bus publishing succeed atomically. |

</details>

</details>

</details>

---

## 🌐 Ecosystem Interlinking
All curriculum topics are synchronized across the 14-repository Modern Data Engineering ecosystem:
- [Modern Data Engineer Hub](https://github.com/santoshjammi29/moderndataengineer) — Central edge web platform and 921-topic encyclopedia
- [Databricks Handbook](https://github.com/santoshjammi29/databricks-handbook) — Unity Catalog, Delta Lake 3.x, and Lakeflow
- [PySpark Handbook](https://github.com/santoshjammi29/pyspark-handbook) — Distributed compute & PySpark internals
- [SQL Handbook](https://github.com/santoshjammi29/sql-handbook) — Query engine optimization & relational internals
- [dbt Handbook](https://github.com/santoshjammi29/dbt-handbook) — Analytics engineering, contracts, and modeling
- [Streaming Handbook](https://github.com/santoshjammi29/streaming-handbook) — Event streaming, Kafka, and Flink
- [DataOps & CI/CD Handbook](https://github.com/santoshjammi29/dataops-cicd-handbook) — Airflow, orchestration, and infrastructure
- [System Design Handbook](https://github.com/santoshjammi29/data-system-design-handbook) — Distributed architecture and scalability
- [Interview Handbook](https://github.com/santoshjammi29/data-engineering-interview-handbook) — 20 Knowledge Pillars & architectural defense
- [Azure Cheat Sheet](https://github.com/santoshjammi29/azure-cheat-sheet) — Fabric, OneLake, and ADF enterprise blueprints
- [Security Handbook](https://github.com/santoshjammi29/security-handbook) — Zero-trust, IAM, and lakehouse governance
