"""
Category 8: Memory Pressure, Disk Spill & Out of Memory (OOM) (Problems 71 - 80)
"""

CAT8_PROBLEMS = [
    {
        "id": 71,
        "title": "Driver OOM Caused by Calling collect() or toPandas() on Distributed Datasets",
        "category": "Memory Pressure & OOM",
        "level": "Beginner",
        "scenario": "A junior data scientist attempts to generate a local matplotlib chart from a 50-million-row DataFrame by running `df.toPandas()` or `df.collect()`. The Spark driver freezes, drops heartbeat communication with the cluster manager, and crashes with `java.lang.OutOfMemoryError: Java heap space`.",
        "symptom": "Spark Driver process terminates abruptly. Cluster manager reports `Driver killed by orchestrator / lost connection`.",
        "root_cause": "`collect()` and `toPandas()` transfer all distributed partitions from across all executors over the network into the single Driver JVM memory space. If the dataset exceeds driver heap (`spark.driver.memory`), Driver crashes immediately.",
        "failing_code": """# Failing PySpark Anti-Pattern:
# df is 40GB distributed across 50 executors
df = spark.read.table("gold.web_traffic")

# Transfers 40GB to 4GB driver JVM:
pdf = df.toPandas() # Immediate Driver Crash!""",
        "solution_code": """# Production-Grade Solution: Aggregate or Sample in Distributed Spark Before Collecting
# Option A: Compute distributed aggregations first, then collect tiny summary (e.g. 100 rows):
summary_pdf = df.groupBy("traffic_source").agg(F.count("*").alias("visits")).toPandas()

# Option B: If raw distribution is needed for plotting, sample down to safe limits (< 100k rows):
sample_pdf = df.sample(fraction=0.001, seed=42).limit(10000).toPandas()

# Option C: Enforce Driver safety threshold:
# spark.conf.set("spark.sql.driver.maxResultSize", "2g") # Throws safe exception before OOM!""",
        "interview_takeaway": "`collect()` and `toPandas()` serialize distributed data onto the single driver; always push down filtering, sampling, or aggregation in Spark, and enforce `spark.sql.driver.maxResultSize` to protect driver stability."
    },
    {
        "id": 72,
        "title": "Driver OOM Caused by Forced broadcast() on Oversized DataFrames",
        "category": "Memory Pressure & OOM",
        "level": "Beginner",
        "scenario": "A developer adds an explicit broadcast hint `df_fact.join(broadcast(df_dim))` to avoid a shuffle. However, due to unexpected data growth, `df_dim` has grown to 8GB. During query execution, the driver attempts to collect and serialize the 8GB DataFrame to broadcast it to 100 executors, exhausting driver heap.",
        "symptom": "`SparkException: Job aborted due to stage failure: Total size of serialized results of ... is bigger than spark.driver.maxResultSize` or Driver Heap OOM.",
        "root_cause": "A Broadcast Hash Join requires the Driver to collect the entire broadcast table into its own memory, serialize it into a TorrentBroadcast block, and distribute it to all executors. Broadcasting multi-gigabyte tables overwhelms driver memory.",
        "failing_code": """# Failing PySpark Code:
# df_dim is 8GB (too large for driver to broadcast)
df_fact = spark.read.table("fact_transactions")
df_dim = spark.read.table("dim_products") # 8GB

# Forcing broadcast on 8GB table:
joined = df_fact.join(F.broadcast(df_dim), on="product_id")
joined.write.format("noop").mode("overwrite").save() # Crashes Driver!""",
        "solution_code": """# Production-Grade Solution: Let Catalyst Decide or Tune autoBroadcastJoinThreshold
# Option 1: Remove manual broadcast hint and allow SortMergeJoin or ShuffleHashJoin
joined = df_fact.join(df_dim, on="product_id")

# Option 2: If broadcasting is truly beneficial, ensure driver memory is sized >= 3x table size:
# spark.driver.memory = "32g"
# spark.sql.autoBroadcastJoinThreshold = 1073741824 # 1GB safe threshold

# Option 3: Pre-filter dimension columns and rows to broadcast only necessary subsets:
slim_dim = df_dim.select("product_id", "product_category").filter("is_active = true")
joined = df_fact.join(F.broadcast(slim_dim), on="product_id")""",
        "interview_takeaway": "Broadcasting requires the driver to collect and serialize the entire dataset in JVM memory; never force broadcast hints on tables exceeding a few hundred megabytes without explicitly sizing driver heap to 3x-4x the table footprint."
    },
    {
        "id": 73,
        "title": "Executor Container OOM (Exit Code 137 / SIGKILL) on High-Cardinality GroupBy",
        "category": "Memory Pressure & OOM",
        "level": "Intermediate",
        "scenario": "A digital analytics pipeline calculates unique visitor sessions across 5 billion log rows using `groupBy('user_uuid').agg(countDistinct('session_id'))`. An executor abruptly terminates with `Container killed by YARN for exceeding memory limits. 16.5 GB of 16.0 GB physical memory used`.",
        "symptom": "YARN/Kubernetes terminates the executor container with `Exit code 137 (SIGKILL)`. Stage fails after several executor retry attempts.",
        "root_cause": "High-cardinality aggregation with `countDistinct` prevents partial map-side aggregation (`AggregationIterator`) from freeing memory. The in-memory Tungsten hash map explodes, and off-heap execution memory overflows the physical container boundary.",
        "failing_code": """# Failing PySpark Code:
# 500 million unique user_uuids:
logs = spark.read.table("bronze.web_logs")
# Exact countDistinct on high cardinality creates massive aggregation buffers:
user_metrics = logs.groupBy("user_uuid").agg(
    F.countDistinct("session_id").alias("unique_sessions")
)""",
        "solution_code": """# Production-Grade Solution: HyperLogLog Approximation or Two-Phase Aggregation
from pyspark.sql import functions as F

# Option A: If 1-2% error is acceptable (Standard Industry Analytics):
# approx_count_distinct uses HyperLogLog++ with fixed, tiny memory footprint (1KB per key!)
user_metrics = logs.groupBy("user_uuid").agg(
    F.approx_count_distinct("session_id", rsd=0.01).alias("unique_sessions")
)

# Option B: If exact count is mandatory, use Two-Phase Deduplication to avoid hash map bloat:
# Step 1: Distinct pre-reduction
deduped = logs.select("user_uuid", "session_id").distinct()
# Step 2: Simple count (uses streaming/sorting aggregation instead of massive hash maps)
user_metrics = deduped.groupBy("user_uuid").agg(F.count("session_id").alias("unique_sessions"))

# Option C: Increase shuffle partitions to spread memory load:
spark.conf.set("spark.sql.shuffle.partitions", "2000")""",
        "interview_takeaway": "`countDistinct()` on high-cardinality keys prevents map-side aggregation and exhausts container memory; replace with `approx_count_distinct()` (HyperLogLog++) or pre-deduplicate with `.distinct()` before grouping."
    },
    {
        "id": 74,
        "title": "Tungsten Shuffle Spill (Memory vs Disk Spill) in UnsafeSort",
        "category": "Memory Pressure & OOM",
        "level": "Intermediate",
        "scenario": "A night batch job joining two 500GB tables takes 3.5 hours. Spark UI shows 200 shuffle partitions, and the shuffle stage reports `Spill (Memory): 450 GB` and `Spill (Disk): 120 GB`. Heavy disk I/O degrades executor throughput.",
        "symptom": "Spark UI Stages tab highlights yellow/red indicators for Spill (Memory) and Spill (Disk). Stage runtime is dominated by disk read/write wait times.",
        "root_cause": "When shuffle partitions are too large (e.g. 500GB / 200 = 2.5GB per partition), data cannot fit inside the executor's allocated Tungsten execution memory pool (`spark.memory.fraction * spark.memory.storageFraction`). Spark spills in-memory pointers and records to disk, compressing them into temporary files.",
        "failing_code": """# Inefficient Default Setup:
# 500GB table processed with default 200 shuffle partitions (2.5GB per task!):
spark.conf.set("spark.sql.shuffle.partitions", "200")

df1 = spark.read.table("fact_1")
df2 = spark.read.table("fact_2")
joined = df1.join(df2, on="account_id")
joined.write.format("delta").save("s3://lake/gold/")""",
        "solution_code": """# Production-Grade Solution: Right-Size Shuffle Partitions to 100-200MB per Task
# Calculate optimal partitions: Target 128MB to 200MB uncompressed per partition
# For 500GB input: 500,000MB / 150MB = ~3,300 partitions

# Option A: Static Sizing
spark.conf.set("spark.sql.shuffle.partitions", "3200")

# Option B: Adaptive Query Execution (AQE) Dynamic Coalescing & Sizing:
spark.conf.set("spark.sql.adaptive.enabled", "true")
spark.conf.set("spark.sql.adaptive.coalescePartitions.enabled", "true")
spark.conf.set("spark.sql.adaptive.advisoryPartitionSizeInBytes", "134217728") # 128MB target

# Eliminates disk spill completely; all Tungsten sorting occurs directly in L1/L2 cache and RAM!""",
        "interview_takeaway": "Tungsten shuffle spill occurs when partition sizes exceed available execution memory; eliminate spill by sizing shuffle partitions so each task processes between 100MB and 200MB of uncompressed data."
    },
    {
        "id": 75,
        "title": "Standard PySpark Python UDF Serialization Memory Overhead",
        "category": "Memory Pressure & OOM",
        "level": "Intermediate",
        "scenario": "A data engineer writes a custom Python parsing function and registers it as a standard PySpark UDF: `@udf('string') def parse_ua(ua): ...`. Processing 100 million records causes the Python worker processes to consume 30GB of memory, thrashing CPU and slowing the pipeline 20x compared to Scala.",
        "symptom": "Executors show high system CPU usage and excessive context-switching between JVM and Python daemon processes (`python3` processes consume 100% core memory).",
        "root_cause": "Standard Python UDFs require PySpark to serialize data row-by-row from the JVM heap, pipe it over a Unix domain socket / pipe via Py4J to a separate Python worker process, deserialize it, execute Python bytecode, and serialize the result back to the JVM.",
        "failing_code": """# Failing Anti-Pattern: Standard Row-by-Row Python UDF
from pyspark.sql.functions import udf

@udf(returnType="string")
def extract_domain(url):
    if not url: return None
    import urllib.parse
    return urllib.parse.urlparse(url).netloc

# Processes 100M rows row-by-row across IPC sockets:
df.withColumn("domain", extract_domain("url")).write.format("noop").mode("overwrite").save()""",
        "solution_code": """# Production-Grade Solution: Replace with Native Spark SQL Function or Pandas UDF
from pyspark.sql import functions as F

# Option 1: 100% Native Spark SQL Expression (Vectorized in JVM / C++ Photon, 0 IPC overhead!)
df_native = df.withColumn(
    "domain",
    # Native Catalyst regex or URL parsing runs at hardware speeds in Tungsten:
    F.expr("parse_url(url, 'HOST')")
)

# Option 2: If custom Python library is mandatory, use Vectorized Pandas UDF (PyArrow Batches):
import pandas as pd
from pyspark.sql.functions import pandas_udf

@pandas_udf("string")
def extract_domain_vectorized(url_series: pd.Series) -> pd.Series:
    import urllib.parse
    return url_series.apply(lambda u: urllib.parse.urlparse(u).netloc if u else None)

# Transfers Apache Arrow record batches instead of row-by-row sockets (10x faster)!""",
        "interview_takeaway": "Standard Python UDFs suffer severe IPC and row-by-row serialization overhead; replace them with native Spark SQL functions (`parse_url`, `regexp_extract`) or vectorized Pandas UDFs powered by Apache Arrow."
    },
    {
        "id": 76,
        "title": "PyArrow Vectorized Pandas UDF Memory Footprint & Batch Chunking",
        "category": "Memory Pressure & OOM",
        "level": "Advanced",
        "scenario": "An NLP inference pipeline runs an embedding model inside a PySpark `@pandas_udf`. While vectorized Pandas UDFs are faster, processing wide text columns causes the Python daemon process to suddenly allocate 18GB of off-heap Arrow memory, exceeding container limits and crashing with `SIGKILL`.",
        "symptom": "`Container killed by YARN for exceeding memory limits`. Yarn memory diagnostics show off-heap native Python memory exceeding allocation.",
        "root_cause": "By default, PyArrow loads large batches into Python memory (`spark.sql.execution.arrow.maxRecordsPerBatch = 10000`). For wide text or embedding columns, 10,000 rows in a single Arrow table chunk consume gigabytes of off-heap memory.",
        "failing_code": """# Failing PySpark Setup:
# spark.sql.execution.arrow.maxRecordsPerBatch defaults to 10,000
# With large article bodies, 10k rows in Arrow batch consumes 4GB+ per core!
@pandas_udf("array<float>")
def compute_embeddings(text_series: pd.Series) -> pd.Series:
    return model.encode(text_series.tolist())

df.withColumn("emb", compute_embeddings("long_article_text")).write.format("delta").save(...)""",
        "solution_code": """# Production-Grade Solution: Tune Arrow Batch Size and Executor Memory Overhead
# Step 1: Reduce Arrow chunk size to process 500 or 1,000 records per batch:
spark.conf.set("spark.sql.execution.arrow.maxRecordsPerBatch", "500")

# Step 2: Increase off-heap memory overhead to accommodate native Python / PyArrow buffers:
# Set spark.executor.memoryOverhead to at least 20-30% of executor memory:
# --conf spark.executor.memoryOverhead=4096m (4GB overhead for 12GB executor)

# Step 3: Implement batch garbage cleanup inside Pandas UDF:
@pandas_udf("array<float>")
def compute_embeddings_safe(text_series: pd.Series) -> pd.Series:
    import gc
    res = model.encode(text_series.tolist(), batch_size=64)
    gc.collect()
    return pd.Series(list(res))""",
        "interview_takeaway": "Vectorized Pandas UDFs can exhaust off-heap memory on wide text columns; reduce `spark.sql.execution.arrow.maxRecordsPerBatch` and increase `spark.executor.memoryOverhead` to prevent container `SIGKILL` terminations."
    },
    {
        "id": 77,
        "title": "High JVM Garbage Collection Overhead from Billions of Tiny Java Objects",
        "category": "Memory Pressure & OOM",
        "level": "Advanced",
        "scenario": "A legacy Spark job uses RDD transformations (`rdd.map(lambda r: ...)` or custom Scala case class objects) over 1 billion rows. Spark UI shows that 40% of overall stage execution time is spent in JVM Garbage Collection (`GC Time`), causing CPU saturation and high task latency.",
        "symptom": "Spark UI Task Details show GC Time > 15-20% of Task Deserialization and Execution Time. Nodes suffer frequent `G1GC pause (young / to-space exhausted)`.",
        "root_cause": "Creating billions of individual Java/Scala objects fills the JVM Eden space instantly. The Garbage Collector spends immense CPU cycles scanning pointer graphs and copying surviving objects between survivor spaces and old generation.",
        "failing_code": """# Failing RDD Anti-Pattern:
# Billions of ephemeral Python/Java object instantiations:
rdd = sc.textFile("s3://logs/*")
parsed_rdd = rdd.map(lambda line: line.split(",")) \\
                .filter(lambda tokens: len(tokens) > 5) \\
                .map(lambda tokens: (tokens[0], float(tokens[3])))
summary = parsed_rdd.reduceByKey(lambda a, b: a + b).collect()""",
        "solution_code": """# Production-Grade Solution: Use Tungsten Columnar DataFrames & G1GC Tuning
# 1. Migrate 100% of RDD code to Spark DataFrames / Datasets
# Tungsten manages memory off-heap in binary byte arrays, bypassing JVM GC entirely!
df = spark.read.option("header", "false").csv("s3://logs/*")
summary = df.filter(F.col("_c5").isNotNull()) \\
            .groupBy("_c0") \\
            .agg(F.sum(F.col("_c3").cast("double")))

# 2. Production JVM GC Flags for Spark Executors (in spark-defaults.conf):
# -XX:+UseG1GC
# -XX:InitiatingHeapOccupancyPercent=35 (Trigger background concurrent marking earlier)
# -XX:G1ReservePercent=15 (Prevent to-space exhaustion)
# -XX:MaxGCPauseMillis=200 (Target GC latency limit)""",
        "interview_takeaway": "RDDs instantiate billions of JVM objects causing massive GC pauses; migrate to DataFrame/SQL APIs where Project Tungsten stores data in compact off-heap binary format without JVM object allocation."
    },
    {
        "id": 78,
        "title": "Broadcast Nested Loop Join (BNLJ) Memory Blowup on Missing Join Conditions",
        "category": "Memory Pressure & OOM",
        "level": "Advanced",
        "scenario": "A developer writes an outer join between two tables but makes a syntax typo in the join condition: `df1.join(df2, df1.id == df1.id, 'left')` (referencing `df1.id` on both sides). Catalyst cannot find an equi-join condition between the two tables and silently falls back to a BroadcastNestedLoopJoin (BNLJ), causing immediate cluster memory collapse.",
        "symptom": "Spark UI shows physical plan operator `BroadcastNestedLoopJoin`. Query execution hangs, driver crashes with OOM, or executors run out of heap.",
        "root_cause": "Without an equi-join condition linking Table A and Table B, Spark cannot use SortMergeJoin or ShuffleHashJoin. It broadcasts one entire table to all executors and performs a quadratic $O(M \\times N)$ nested loop comparison.",
        "failing_code": """# Failing PySpark Typo:
# Typo: df1.customer_id == df1.customer_id (compares df1 to itself!)
joined = df_orders.join(
    df_customers,
    df_orders["customer_id"] == df_orders["customer_id"], # CATALYST FALLS BACK TO BNLJ!
    how="left"
)
joined.count() # Immediate Cluster OOM!""",
        "solution_code": """# Production-Grade Solution: Strict Equi-Join Keys & Disabling Fallback
# Step 1: Correct the equi-join condition:
joined = df_orders.join(df_customers, df_orders["customer_id"] == df_customers["customer_id"], "left")

# Step 2: In Spark SQL queries, verify Catalyst Physical Plan:
# df.explain() should show SortMergeJoin or BroadcastHashJoin, NEVER BroadcastNestedLoopJoin!

# Step 3: Production Safety - Disable Cartesian product / broadcast fallback if not desired:
# spark.conf.set("spark.sql.crossJoin.enabled", "false") # Throws AnalysisException on accidental cartesian!""",
        "interview_takeaway": "Typos in join predicates cause Catalyst to fall back to `BroadcastNestedLoopJoin` (BNLJ), leading to quadratic memory explosions; inspect query plans with `.explain()` to verify equi-joins and keep `spark.sql.crossJoin.enabled = false`."
    },
    {
        "id": 79,
        "title": "Sizing Driver vs Executor Memory Overhead for Off-Heap & Native Buffers",
        "category": "Memory Pressure & OOM",
        "level": "Architect",
        "scenario": "A 1,000-core Databricks cluster runs workloads involving PyArrow, RocksDB, and native C++ decompression libraries (Snappy/Zstandard). The executors have 32GB RAM allocated (`spark.executor.memory = 28g`), but the cluster manager kills 20-30 containers per hour for exceeding physical memory limits.",
        "symptom": "`Container [pid=...] is running 500MB beyond physical memory limits. Current usage: 32.5 GB of 32 GB physical memory used. Killing container.`",
        "root_cause": "The default memory overhead in Spark is `max(384MB, 0.10 * executorMemory)`. For a 28GB executor, default overhead is ~2.8GB. Native C++ memory allocated by RocksDB, PyArrow, or Photon lives outside the JVM heap in off-heap memory. When off-heap usage exceeds 2.8GB, the OS/YARN kills the container.",
        "failing_code": """# Failing Configuration:
spark.executor.memory 28g
# Default overhead: 10% (2.8GB)
# Total container allocation = 30.8GB
# Off-heap buffers allocate 4GB -> Container exceeds 30.8GB -> SIGKILL!""",
        "solution_code": """# Production-Grade Solution: Dedicated Off-Heap Overhead Sizing
# Increase spark.executor.memoryOverhead to 20-30% for workloads with native/off-heap libraries:
# Formula: Total Container = spark.executor.memory (Heap) + spark.executor.memoryOverhead (Off-Heap)

# Example Configuration for 32GB Physical VM Node:
spark.executor.memory           22g   # JVM Heap (Tungsten execution + storage)
spark.executor.memoryOverhead    8g    # Off-Heap (PyArrow, RocksDB, C++ Photon, OS buffers)
spark.memory.offHeap.enabled     true
spark.memory.offHeap.size        4g

# Container allocation is 30GB, leaving 2GB OS headroom. 0 container kills!""",
        "interview_takeaway": "Container Exit Code 137 occurs when off-heap allocations exceed memory overhead; for PyArrow, RocksDB, and Photon workloads, increase `spark.executor.memoryOverhead` to 25-30% of total container memory."
    },
    {
        "id": 80,
        "title": "Memory Triage of Off-Heap RocksDB State Store in 24/7 Streaming",
        "category": "Memory Pressure & OOM",
        "level": "Architect",
        "scenario": "A financial fraud detection streaming engine processes 100,000 transactions/second 24/7 using RocksDB State Store. After running continuously for 18 days, worker nodes experience node-level memory exhaustion, triggering Kubernetes node evictions and cascading cluster restarts.",
        "symptom": "Linux OOM-killer terminates the entire JVM or Kubernetes node enters `MemoryPressure` status after weeks of continuous streaming.",
        "root_cause": "RocksDB allocates native memory for its MemTables and Block Cache outside JVM control. Without bounded memory limits, RocksDB instances across dozens of state partitions continuously consume available host RAM.",
        "failing_code": """# Failing Streaming Configuration:
# RocksDB configured without memory bounds:
spark.conf.set("spark.sql.streaming.stateStore.providerClass",
               "org.apache.spark.sql.execution.streaming.state.RocksDBStateStoreProvider")
# No limits on block cache or memtable allocations! RocksDB leaks host memory over weeks!""",
        "solution_code": """# Production-Grade Solution: Bounded RocksDB State Store Configuration
# Cap block cache and write buffer memory in RocksDB state store provider:

# Enable bounded memory usage across all RocksDB instances on the executor:
spark.conf.set("spark.sql.streaming.stateStore.rocksdb.boundedMemoryUsage", "true")

# Set total memory cap for RocksDB (e.g. 40% of executor memory overhead):
spark.conf.set("spark.sql.streaming.stateStore.rocksdb.maxMemoryUsageMB", "4096") # 4GB

# Cap write buffer (MemTable) size:
spark.conf.set("spark.sql.streaming.stateStore.rocksdb.writeBufferSizeMB", "64")

# Enables automated compaction and bounded state footprint indefinitely!""",
        "interview_takeaway": "In 24/7 Structured Streaming, unconstrained RocksDB instances can exhaust host memory; enable `spark.sql.streaming.stateStore.rocksdb.boundedMemoryUsage = true` and specify `maxMemoryUsageMB` to strictly bound off-heap native memory."
    }
]
