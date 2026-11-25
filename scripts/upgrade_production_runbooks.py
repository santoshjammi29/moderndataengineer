#!/usr/bin/env python3
"""
Upgrade all 24 production runbooks across:
- streaming-handbook
- dbt-handbook
- dataops-cicd-handbook
- data-system-design-handbook

Replaces generic boilerplate (grep /var/log/pipeline.log, throttle_rate_per_sec = 5000)
with authentic, domain-specific, production-ready incident response procedures.
"""

import os

BASE_DIR = "/Users/santosh/Documents/antigravity"

RUNBOOKS = {
    "streaming-handbook": {
        "01_consumer_group_rebalance_storm_triage.md": '''# 🚨 Production Runbook 01: Consumer Group Rebalance Storm & Lag Surge Triage

> **Incident Severity**: `SEV-1`
> **Domain**: Apache Kafka & Real-Time Event Streaming
> **Target Systems**: Kafka Brokers (KRaft / ZooKeeper), Consumer Clients (Java / Python / Go), Prometheus / Grafana
> **Objective**: Stop cascading stop-the-world partition rebalances, eliminate lag spikes, and restore consumer group stability.

---

## 1. Emergency Decision Tree

```mermaid
flowchart TD
    Alert["SEV-1 Alert: Consumer Group<br/>Rebalance Storm & Extreme Lag"] --> InspectLag["Step 1: Check Group State via<br/>kafka-consumer-groups.sh"]
    InspectLag --> StateCheck{"Group State?"}

    StateCheck -->|"PreparingRebalance /<br/>CompletingRebalance"| StormDetect["Rebalance Storm Active"]
    StateCheck -->|"Dead / Empty"| DeadGroup["Consumers Disconnected or Crashed"]
    StateCheck -->|"Stable with Growing Lag"| SlowConsumers["Consumer Processing Bottleneck"]

    StormDetect --> PollCheck{"Poll Interval Exceeded?<br/>(max.poll.interval.ms)"}
    PollCheck -->|Yes| FixPoll["Reduce max.poll.records & Increase<br/>max.poll.interval.ms"]
    PollCheck -->|No| StickyCheck["Upgrade to<br/>CooperativeStickyAssignor"]

    SlowConsumers --> DownstreamCheck{"Downstream Sink Throttling<br/>(Delta/DB)?"}
    DownstreamCheck -->|Yes| SinkOptimize["Scale Sink Partitions & Batch<br/>Flush Size"]
    DownstreamCheck -->|No| ScaleConsumers["Scale Consumer Pod Replicas up to<br/>Partition Count"]
```

---

## 2. Immediate Diagnostic Procedures (First 5 Minutes)

### Step 1: Query Consumer Group State and Partition Lag
Run `kafka-consumer-groups.sh` to determine if the group is trapped in a continuous rebalance loop:
```bash
# Check group state and member assignment
kafka-consumer-groups.sh --bootstrap-server "$KAFKA_BOOTSTRAP_SERVERS" \
  --describe --group "payments-processing-group" --state

# Inspect per-partition lag and identify straggling client IDs
kafka-consumer-groups.sh --bootstrap-server "$KAFKA_BOOTSTRAP_SERVERS" \
  --describe --group "payments-processing-group"
```

### Step 2: Check Client Log Signatures for Poll Timeouts
Search consumer logs for heartbeat failures and revoked partitions:
```bash
# Look for max.poll.interval.ms expiration (client evicted by coordinator)
grep -E "CommitFailedException|Revoking previously assigned partitions|max.poll.interval.ms" /var/log/kafka/consumer.log | tail -n 25
```

---

## 3. Root Cause Analysis & Production Remediation

### Primary Root Cause
In 90% of production incidents, rebalance storms occur because:
1. **Batch Processing Time > `max.poll.interval.ms`**: Downstream writes (e.g. to Delta Lake or PostgreSQL) stall, causing consumer poll thread to miss the timeout window. The Group Coordinator assumes the consumer is dead and initiates a rebalance.
2. **Eager Assignment Protocol**: The default `RangeAssignor` revokes *all* partitions globally across *all* consumers during a rebalance, causing an entire cluster outage for 30–90 seconds per churn.

### Production Remediation & Configuration Tuning

#### Phase 1: Switch to Incremental Cooperative Rebalancing
Switch consumer client config from eager assignor to `CooperativeStickyAssignor`:
```properties
# kafka-consumer.properties
partition.assignment.strategy=org.apache.kafka.clients.consumer.CooperativeStickyAssignor
max.poll.records=100
max.poll.interval.ms=600000
session.timeout.ms=45000
heartbeat.interval.ms=15000
```

#### Phase 2: Production Python Consumer Ingestion Loop
```python
from confluent_kafka import Consumer, KafkaError, TopicPartition
import time

conf = {
    'bootstrap.servers': 'kafka-broker-1:9092,kafka-broker-2:9092',
    'group.id': 'payments-processing-group',
    'auto.offset.reset': 'earliest',
    'enable.auto.commit': False,
    'partition.assignment.strategy': 'cooperative-sticky',
    'max.poll.interval.ms': 600000,
    'session.timeout.ms': 45000,
}

consumer = Consumer(conf)
consumer.subscribe(['payments.tx.v1'])

try:
    while True:
        msg = consumer.poll(timeout=1.0)
        if msg is None:
            continue
        if msg.error():
            if msg.error().code() == KafkaError._PARTITION_EOF:
                continue
            else:
                raise Exception(msg.error())

        # Process transaction within bounded SLA (< 50ms)
        process_payment_event(msg.value())
        consumer.commit(asynchronous=True)
except KeyboardInterrupt:
    pass
finally:
    consumer.close()
```

---

## 4. Verification & Prevention
- [ ] Verify `kafka-consumer-groups.sh --describe` shows state `Stable`.
- [ ] Confirm `rebalance-rate` in Grafana drops to zero.
- [ ] Set alert on Prometheus metric `kafka_consumergroup_lag > 50000` with 5-minute sustained threshold.
''',

        "02_flink_backpressure_and_checkpoint_timeout_triage.md": r'''# 🚨 Production Runbook 02: Flink Backpressure & Checkpoint Timeout Triage

> **Incident Severity**: `SEV-1`
> **Domain**: Apache Flink Stream Processing
> **Target Systems**: Flink JobManager, TaskManagers, RocksDB StateBackend, ADLS/S3 Checkpoint Storage
> **Objective**: Eliminate downstream backpressure bottlenecks and resolve failing Flink checkpoints before state corruption.

---

## 1. Emergency Decision Tree

```mermaid
flowchart TD
    Alert["SEV-1 Alert: Flink Checkpoint<br/>Expired / Backpressure &gt; 0.8"] --> InspectBackpressure["Step 1: Query Flink REST API for<br/>Operator Backpressure"]
    InspectBackpressure --> IdentifyBottleneck{"Locate Bottleneck Operator"}

    IdentifyBottleneck -->|"Sink Operator"| SinkIssue["Downstream Delta/Kafka Storage<br/>Throttling"]
    IdentifyBottleneck -->|"Stateful Window / Join<br/>Operator"| StateIssue["RocksDB GC Pauses or State Bloat"]
    IdentifyBottleneck -->|"Deserialization / CPU Operator"| CpuIssue["Compute Resource Starvation"]

    SinkIssue --> EnableUnaligned["Enable Unaligned Checkpoints &<br/>Buffer Debloating"]
    StateIssue --> TuneRocksDB["Tune RocksDB Block Cache & Write<br/>Buffers"]
    CpuIssue --> ScaleTaskManagers["Scale TaskManager Slots & Heap<br/>Memory"]
```

---

## 2. Immediate Diagnostic Procedures (First 5 Minutes)

### Step 1: Query Flink REST API for Operator Backpressure Ratio
```bash
# Query JobManager for job topology and backpressure levels
JOB_ID=$(curl -s http://flink-jobmanager:8081/jobs | jq -r '.jobs[] | select(.status=="RUNNING") | .id')

# Inspect vertex backpressure
curl -s "http://flink-jobmanager:8081/jobs/${JOB_ID}/vertices" | jq -r '.vertices[] | "\(.name): backpressure-level=\(.backpressure-level)"'
```

### Step 2: Check Checkpoint Duration & Expired Counts
```bash
# Inspect checkpoint history and failure reasons
curl -s "http://flink-jobmanager:8081/jobs/${JOB_ID}/checkpoints" | jq '.latest.failed'
```

---

## 3. Root Cause Analysis & Production Remediation

### Primary Root Cause
1. **Aligned Checkpoint Barrier Delay**: High backpressure prevents checkpoint barrier tokens from flowing through operators, leading to `CheckpointExpiredException` after `execution.checkpointing.timeout` (typically 10 minutes).
2. **RocksDB Compaction Spikes**: High cardinality state keys cause RocksDB SST file compaction storms on TaskManager local disks.

### Production Remediation & Configuration Tuning

#### Phase 1: Enable Flink Unaligned Checkpoints & Buffer Debloating
Add these properties to `flink-conf.yaml` to decouple checkpointing from backpressured network buffers:
```yaml
execution.checkpointing.unaligned.enabled: true
execution.checkpointing.alignment-timeout: 2000ms
taskmanager.network.memory.buffer-debloat.enabled: true
taskmanager.network.memory.buffer-debloat.target: 50ms
state.backend.incremental: true
state.backend.rocksdb.memory.managed: true
state.backend.rocksdb.memory.fixed-per-slot: 512mb
```

#### Phase 2: PyFlink Production Pipeline State Configuration
```python
from pyflink.datastream import StreamExecutionEnvironment, CheckpointingMode
from pyflink.datastream.state_backend import EmbeddedRocksDBStateBackend

env = StreamExecutionEnvironment.get_execution_environment()

# Configure resilient checkpointing
env.enable_checkpointing(30000, CheckpointingMode.EXACTLY_ONCE)
cp_config = env.get_checkpoint_config()
cp_config.set_checkpoint_timeout(600000)
cp_config.set_min_pause_between_checkpoints(10000)
cp_config.set_max_concurrent_checkpoints(1)
cp_config.enable_unaligned_checkpoints()

# Production Incremental RocksDB State Store
state_backend = EmbeddedRocksDBStateBackend(enable_incremental_checkpointing=True)
env.set_state_backend(state_backend)
```

---

## 4. Verification & Prevention
- [ ] Verify `checkpoints/` directory on cloud storage is receiving new valid metadata files.
- [ ] Confirm Flink Web UI backpressure metric drops from `HIGH` (red) to `OK` (green).
- [ ] Monitor Prometheus metric `flink_taskmanager_job_task_operator_backPressuredTimeMsPerSecond`.
''',

        "03_cdc_schema_drift_and_wal_exhaustion.md": '''# 🚨 Production Runbook 03: CDC Schema Drift & WAL Disk Exhaustion

> **Incident Severity**: `SEV-1`
> **Domain**: Change Data Capture (Debezium) & Database Replication
> **Target Systems**: PostgreSQL Primary, Debezium Connect Cluster, Kafka Connect, Schema Registry
> **Objective**: Drain PostgreSQL WAL bloat before disk fills to 100%, realign Debezium schema history, and restore replication.

---

## 1. Emergency Decision Tree

```mermaid
flowchart TD
    Alert["SEV-1 Alert: PostgreSQL WAL Disk<br/>&gt; 85% & Debezium Lagging"] --> CheckDisk["Step 1: Check Replication Slot<br/>Disk Retained in Postgres"]
    CheckDisk --> SlotState{"Replication Slot Active?"}

    SlotState -->|"Active: Lagging"| ThrottleCheck["Debezium is Throttled or Blocked<br/>on Kafka"]
    SlotState -->|"Inactive: Abandoned"| DropSlot["Drop Abandoned Slot Immediately to<br/>Reclaim WAL Disk"]

    ThrottleCheck --> SchemaCheck{"Schema Registry Rejection?"}
    SchemaCheck -->|Yes| FixSchema["Update Schema Registry<br/>Compatibility Mode"]
    SchemaCheck -->|No| ScaleConnect["Scale Kafka Connect Worker Tasks &<br/>Memory"]
```

---

## 2. Immediate Diagnostic Procedures (First 5 Minutes)

### Step 1: Query PostgreSQL for Replication Slot WAL Lag
```sql
SELECT
    slot_name,
    plugin,
    active,
    pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn)) AS wal_backlog_size,
    pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), confirmed_flush_lsn)) AS unconfirmed_wal_size
FROM pg_replication_slots
ORDER BY pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn) DESC;
```

### Step 2: Check Debezium Connector Task Error Status
```bash
curl -s "http://kafka-connect:8083/connectors/debezium-postgres-orders/status" | jq '.tasks[] | {id: .id, state: .state, trace: .trace}'
```

---

## 3. Root Cause Analysis & Production Remediation

### Primary Root Cause
1. **Schema Evolution Deserialization Error**: An upstream `ALTER TABLE` added an unsupported type or broke backwards compatibility in Confluent Schema Registry. Debezium threw an exception and paused WAL consumption.
2. **WAL Disk Exhaustion**: Because the replication slot remained unconfirmed, PostgreSQL retained all WAL segments until disk usage approached 100%, threatening a full database crash.

### Production Remediation & Configuration Tuning

#### Phase 1: Set Schema Registry Compatibility & Safe Schema Evolution
```bash
# Update Schema Registry compatibility to BACKWARD or FULL_TRANSITIVE
curl -X PUT -H "Content-Type: application/json" \
  --data '{"compatibility": "BACKWARD"}' \
  "http://schema-registry:8081/config/orders_cdc_events-value"
```

#### Phase 2: Production Debezium Connector Configuration
```json
{
  "name": "debezium-postgres-orders",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "tasks.max": "1",
    "plugin.name": "pgoutput",
    "database.hostname": "postgres-primary.internal",
    "database.port": "5432",
    "database.user": "debezium_cdc",
    "database.password": "${file:/secrets/db.properties:password}",
    "database.dbname": "production_db",
    "database.server.name": "prod_cdc",
    "table.include.list": "public.orders,public.order_items,public.customers",
    "tombstones.on.delete": "true",
    "decimal.handling.mode": "double",
    "schema.history.internal.kafka.bootstrap.servers": "kafka:9092",
    "schema.history.internal.kafka.topic": "schema-history.orders",
    "max.queue.size": "8192",
    "max.batch.size": "2048",
    "poll.interval.ms": "500"
  }
}
```

#### Phase 3: Emergency Slot Cleanup (If WAL Disk > 95%)
```sql
-- DANGER: Drops replication slot and forces full resync, but prevents database outage
-- SELECT pg_drop_replication_slot('debezium_orders_slot');
```

---

## 4. Verification & Prevention
- [ ] Verify `pg_replication_slots` shows `wal_backlog_size < 1 GB`.
- [ ] Confirm Kafka Connect task returns `state: RUNNING`.
- [ ] Configure `max_slot_wal_keep_size = 50GB` in `postgresql.conf` to prevent disk saturation.
''',

        "04_poison_pill_deserialization_dead_letter_queue.md": '''# 🚨 Production Runbook 04: Corrupt Event Deserialization & Dead-Letter Queue (DLQ) Routing

> **Incident Severity**: `SEV-2`
> **Domain**: Event Streaming & Real-Time Processing
> **Target Systems**: Spark Structured Streaming, Kafka Brokers, Delta Lake Lakehouse
> **Objective**: Isolate poison pill payloads, prevent streaming query crashes, and route unparseable events into a transactional DLQ.

---

## 1. Emergency Decision Tree

```mermaid
flowchart TD
    Alert["SEV-2 Alert: Structured Streaming<br/>Query Crashed with Malformed JSON"] --> ParseError["Step 1: Check Driver Exception for<br/>Parse Mode"]
    ParseError --> ModeCheck{"Parse Mode?"}

    ModeCheck -->|"FAILFAST"| CrashDetected["FAILFAST crashed micro-batch"]
    ModeCheck -->|"PERMISSIVE"| PermissiveCheck["Check _corrupt_record column<br/>handling"]

    CrashDetected --> ApplyPermissive["Configure PERMISSIVE mode with<br/>columnNameOfCorruptRecord"]
    ApplyPermissive --> BranchStream["Split Stream into Valid Delta Sink<br/>and DLQ Kafka Sink"]
    BranchStream --> ResumeQuery["Restart Streaming Query from<br/>Checkpoint"]
```

---

## 2. Immediate Diagnostic Procedures (First 5 Minutes)

### Step 1: Query Spark Driver Error Logs for Corrupt Record Signatures
```bash
# Search for Jackson parsing exception or schema mismatch
grep -E "SparkException|JsonParseException|Malformed records are detected in record parsing" /var/log/spark/driver.log | tail -n 25
```

### Step 2: Inspect Incoming Raw Kafka Payloads
```bash
# Read the latest 5 raw messages to inspect payload deformation
kcat -b "$KAFKA_BOOTSTRAP_SERVERS" -C -t "events.raw" -o -5 -e
```

---

## 3. Root Cause Analysis & Production Remediation

### Primary Root Cause
By default, standard JSON deserialization in Spark Structured Streaming operates under `FAILFAST` mode. When an upstream producer emits malformed JSON (e.g. truncated buffer, missing quotes, non-UTF8 binary characters), the entire streaming micro-batch fails, halting the pipeline.

### Production Remediation: Resilient PySpark DLQ Pattern

```python
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, from_json, current_timestamp, to_json, struct
from pyspark.sql.types import StructType, StructField, StringType, DoubleType, LongType

spark = SparkSession.builder \\
    .appName("ProductionResilientStreamingWithDLQ") \\
    .getOrCreate()

# 1. Define explicit payload schema with corrupt record capture column
PAYLOAD_SCHEMA = StructType([
    StructField("transaction_id", StringType(), False),
    StructField("customer_id", StringType(), True),
    StructField("amount", DoubleType(), True),
    StructField("timestamp", LongType(), True),
    StructField("_corrupt_record", StringType(), True)  # Captures unparseable bytes
])

# 2. Ingest raw Kafka stream
raw_stream = spark.readStream \\
    .format("kafka") \\
    .option("kafka.bootstrap.servers", "kafka-1:9092,kafka-2:9092") \\
    .option("subscribe", "events.raw") \\
    .option("startingOffsets", "latest") \\
    .load()

# 3. Parse JSON with PERMISSIVE mode
parsed_stream = raw_stream.select(
    col("key").cast("string").alias("kafka_key"),
    col("value").cast("string").alias("raw_payload"),
    col("topic").alias("source_topic"),
    col("partition").alias("source_partition"),
    col("offset").alias("source_offset"),
    col("timestamp").alias("kafka_timestamp"),
    from_json(col("value").cast("string"), PAYLOAD_SCHEMA, {"mode": "PERMISSIVE", "columnNameOfCorruptRecord": "_corrupt_record"}).alias("data")
)

# 4. Route valid vs corrupt records via foreachBatch sink
def process_micro_batch(batch_df, batch_id):
    batch_df.cache()

    # Valid records: _corrupt_record is NULL and transaction_id is populated
    valid_df = batch_df.filter(col("data._corrupt_record").isNull() & col("data.transaction_id").isNotNull()) \\
        .select("kafka_key", "data.*", "kafka_timestamp")

    # Poison pill corrupt records: _corrupt_record is NOT NULL
    corrupt_df = batch_df.filter(col("data._corrupt_record").isNotNull()) \\
        .select(
            col("kafka_key").alias("key"),
            to_json(struct(
                col("source_topic"),
                col("source_partition"),
                col("source_offset"),
                col("raw_payload"),
                col("data._corrupt_record").alias("error_details"),
                current_timestamp().alias("quarantine_timestamp")
            )).alias("value")
        )

    # Write valid records to Delta Lake Silver table
    valid_df.write \\
        .format("delta") \\
        .mode("append") \\
        .saveAsTable("lakehouse.silver_transactions")

    # Write corrupt records to Dead-Letter Queue topic
    if corrupt_df.count() > 0:
        corrupt_df.write \\
            .format("kafka") \\
            .option("kafka.bootstrap.servers", "kafka-1:9092,kafka-2:9092") \\
            .option("topic", "events.dlq") \\
            .save()

    batch_df.unpersist()

# 5. Start streaming query
query = parsed_stream.writeStream \\
    .foreachBatch(process_micro_batch) \\
    .option("checkpointLocation", "abfss://checkpoints@datalake.dfs.core.windows.net/transactions_dlq_pipeline") \\
    .start()

query.awaitTermination()
```

---

## 4. Verification & Prevention
- [ ] Verify streaming query progresses through batches without crashing.
- [ ] Confirm bad records appear in `events.dlq` topic with diagnostic metadata.
- [ ] Configure Datadog / Prometheus alert on DLQ topic record production rate.
''',

        "05_rocksdb_offheap_memory_leak_triage.md": '''# 🚨 Production Runbook 05: RocksDB State Store Off-Heap Memory Leak Triage

> **Incident Severity**: `SEV-1`
> **Domain**: Spark Structured Streaming & Stateful Processing
> **Target Systems**: Spark Driver & Executors (Databricks / Kubernetes), RocksDB Native Engine
> **Objective**: Diagnose native C++ memory leaks in RocksDB state store, prevent Executor OOM (Exit code 137), and tune memory bounds.

---

## 1. Emergency Decision Tree

```mermaid
flowchart TD
    Alert["SEV-1 Alert: Spark Executor Killed<br/>(Exit Code 137 / OOMKilled)"] --> CheckLogs["Step 1: Inspect Executor Memory<br/>Logs (Off-Heap vs On-Heap)"]
    CheckLogs --> MemoryCategory{"Where is Memory Growing?"}

    MemoryCategory -->|"JVM Heap<br/>(java.lang.OutOfMemoryError)"| HeapLeak["Tune Spark Heap & State<br/>Watermarking"]
    MemoryCategory -->|"Native RSS Memory (Container<br/>Eviction)"| NativeLeak["RocksDB Native Block Cache &<br/>MemTable Unbounded"]

    NativeLeak --> SetBoundedMemory["Configure RocksDB Memory Bounds in<br/>spark.sql.streaming"]
    SetBoundedMemory --> TuneCompaction["Tune Block Cache Size & MemTable<br/>Count"]
    TuneCompaction --> RestartExecutors["Restart Stream with Memory Caps"]
```

---

## 2. Immediate Diagnostic Procedures (First 5 Minutes)

### Step 1: Check Kubernetes / YARN Container Kill Signal
```bash
# Check if container died due to Linux OOM killer (exit code 137)
kubectl describe pod <spark-executor-pod> | grep -E "OOMKilled|Exit Code"
```

### Step 2: Inspect Native Memory Resident Set Size (RSS)
```bash
# Verify Executor memory consumption vs request limits
kubectl top pod <spark-executor-pod>
```

---

## 3. Root Cause Analysis & Production Remediation

### Primary Root Cause
When using `RocksDBStateStoreProvider`, memory is split between JVM On-Heap and native off-heap C++ memory. If the RocksDB block cache and write buffers (memtables) are left unbounded across hundreds of state partitions, native memory allocations exceed the Kubernetes pod memory limit, triggering the OS OOM Killer (`SIGKILL` 137).

### Production Remediation & Configuration Tuning

#### Phase 1: Enforce Strict RocksDB Memory Bounds
Set these Spark configurations to cap native off-heap memory per executor:
```properties
# Cap RocksDB block cache across all state store instances
spark.sql.streaming.stateStore.providerClass=org.apache.spark.sql.execution.streaming.state.RocksDBStateStoreProvider
spark.sql.streaming.stateStore.rocksdb.blockCacheSizeMB=128
spark.sql.streaming.stateStore.rocksdb.lockAcquireTimeoutMs=60000
spark.sql.streaming.stateStore.rocksdb.writeBufferSizeMB=32
spark.sql.streaming.stateStore.rocksdb.maxWriteBufferNumber=3
spark.sql.streaming.stateStore.rocksdb.compactOnCommit=false

# Allocate container memory overhead for native RocksDB allocations (30-40% of heap)
spark.executor.memory=8g
spark.executor.memoryOverhead=4g
```

#### Phase 2: Watermark State Eviction Verification
Ensure streaming state is actively evicted rather than growing indefinitely:
```python
# Event-time watermarking forces state eviction in stateful joins & aggregations
stream_df = raw_df \
    .withWatermark("event_time", "2 hours") \
    .groupBy(
        window("event_time", "1 hour", "15 minutes"),
        col("merchant_id")
    ).agg(
        count("transaction_id").alias("tx_count"),
        sum("amount").alias("total_volume")
    )
```

---

## 4. Verification & Prevention
- [ ] Verify Executor pod RSS memory stabilizes below container limit.
- [ ] Confirm Spark UI Structured Streaming tab shows steady `memoryUsedBytes` metric.
- [ ] Set alert on `container_memory_working_set_bytes / container_spec_memory_limit_bytes > 0.85`.
''',

        "06_kafka_under_replicated_partitions_disaster_recovery.md": '''# 🚨 Production Runbook 06: Kafka Under-Replicated Partitions (URP) Disaster Recovery

> **Incident Severity**: `SEV-1`
> **Domain**: Apache Kafka Cluster Infrastructure
> **Target Systems**: Kafka Brokers (KRaft / ZooKeeper), OS Disk Subsystems, Network Fabric
> **Objective**: Recover degraded brokers, rebalance under-replicated partitions safely without saturating inter-broker network bandwidth.

---

## 1. Emergency Decision Tree

```mermaid
flowchart TD
    Alert["SEV-1 Alert: Kafka<br/>Under-Replicated Partitions &gt; 0"] --> IdentifyBrokers["Step 1: Identify Offline or<br/>Degraded Brokers"]
    IdentifyBrokers --> BrokerState{"Broker Health Status?"}

    BrokerState -->|"Broker Down / Hardware Failure"| RestartBroker["Restart Broker or Provision<br/>Replacement Node"]
    BrokerState -->|"Broker Online / Disk I/O<br/>Bottleneck"| DiskBottleneck["Disk Saturation / Slow Follower"]

    RestartBroker --> PartitionRebalance["Generate Throttled Partition<br/>Reassignment Plan"]
    DiskBottleneck --> ThrottleReplication["Apply Bandwidth Throttle on<br/>Inter-Broker Replication"]
    PartitionRebalance --> ExecuteRebalance["Execute<br/>kafka-reassign-partitions.sh"]
    ExecuteRebalance --> VerifyISR["Verify Partitions Rejoin In-Sync<br/>Replicas (ISR)"]
```

---

## 2. Immediate Diagnostic Procedures (First 5 Minutes)

### Step 1: Identify Under-Replicated Partitions and Degraded Topics
```bash
# Query cluster for all topics with under-replicated partitions
kafka-topics.sh --bootstrap-server "$KAFKA_BOOTSTRAP_SERVERS" \
  --describe --under-replicated-partitions
```

### Step 2: Check Broker Disk Utilization and I/O Wait
```bash
# Inspect disk space across data log directories on all brokers
ansible kafka_brokers -m shell -a "df -h /var/lib/kafka/data"
```

---

## 3. Root Cause Analysis & Production Remediation

### Primary Root Cause
Partitions become under-replicated when follower replicas fall behind the leader's High Watermark (HW) due to broker hardware failure, disk I/O saturation, or network packet drop. If unthrottled reassignment is triggered, massive replica fetch traffic saturates broker network links, causing healthy partitions to fail.

### Production Remediation: Safe Throttled Reassignment

#### Step 1: Create Topics JSON for Reassignment Plan
```json
{
  "topics": [
    {"topic": "transactions.core.v1"},
    {"topic": "user.events.v1"}
  ],
  "version": 1
}
```

#### Step 2: Generate and Execute Throttled Reassignment
```bash
# 1. Generate reassignment plan across surviving brokers (e.g. brokers 1, 2, 3)
kafka-reassign-partitions.sh --bootstrap-server "$KAFKA_BOOTSTRAP_SERVERS" \
  --topics-to-move-json-file topics.json \
  --broker-list "1,2,3" \
  --generate > reassignment.json

# 2. Execute plan with strict bandwidth throttle (50 MB/s = 50000000 bytes/sec)
kafka-reassign-partitions.sh --bootstrap-server "$KAFKA_BOOTSTRAP_SERVERS" \
  --reassignment-json-file reassignment.json \
  --execute \
  --throttle 50000000

# 3. Monitor reassignment progress until completed
kafka-reassign-partitions.sh --bootstrap-server "$KAFKA_BOOTSTRAP_SERVERS" \
  --reassignment-json-file reassignment.json \
  --verify

# 4. CRITICAL: Remove bandwidth throttle once reassignment finishes
kafka-reassign-partitions.sh --bootstrap-server "$KAFKA_BOOTSTRAP_SERVERS" \
  --reassignment-json-file reassignment.json \
  --verify
```

---

## 4. Verification & Prevention
- [ ] Confirm `kafka-topics.sh --describe --under-replicated-partitions` returns zero output.
- [ ] Verify Prometheus metric `kafka_server_replicamanager_underreplicatedpartitions == 0`.
- [ ] Set `min.insync.replicas=2` and `replication.factor=3` on all mission-critical topics.
'''
    }
}

def apply_runbooks():
    for repo, rbs in RUNBOOKS.items():
        repo_dir = os.path.join(BASE_DIR, repo, "runbooks")
        if not os.path.exists(repo_dir):
            print(f"Directory {repo_dir} does not exist!")
            continue
        for filename, content in rbs.items():
            filepath = os.path.join(repo_dir, filename)
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"Updated {repo}/runbooks/{filename}")

if __name__ == "__main__":
    apply_runbooks()

RUNBOOKS["dbt-handbook"] = {
    "01_incremental_schema_drift_and_merge_failures.md": '''# 🚨 Production Runbook 01: Incremental Schema Drift & MERGE Failure Triage

> **Incident Severity**: `SEV-1`
> **Domain**: Analytics Engineering & dbt Core / Cloud
> **Target Systems**: Snowflake, Databricks, BigQuery, dbt Core/Cloud
> **Objective**: Resolve upstream schema drift breaking incremental `MERGE` models without triggering expensive full refreshes.

---

## 1. Emergency Decision Tree

```mermaid
flowchart TD
    Alert["SEV-1 Alert: dbt Incremental MERGE<br/>Failed (Column Count / Type<br/>Mismatch)"] --> InspectError["Step 1: Inspect dbt Log for<br/>Missing / Added Column"]
    InspectError --> DriftType{"Schema Drift Type?"}

    DriftType -->|"New Column Added Upstream"| OnSchemaChange["Configure on_schema_change:<br/>append_new_columns"]
    DriftType -->|"Column Data Type Mutated"| TypeDrift["Apply Explicit CAST in Model SQL"]
    DriftType -->|"Column Renamed or Dropped"| ColumnDrop["Configure on_schema_change:<br/>sync_all_columns"]

    OnSchemaChange --> RunModel["Run Targeted dbt Model with<br/>--select"]
    TypeDrift --> RunModel
    ColumnDrop --> RunModel
    RunModel --> VerifyMerge["Verify Target Table Schema Updated<br/>& MERGE Succeeded"]
```

---

## 2. Immediate Diagnostic Procedures (First 5 Minutes)

### Step 1: Inspect dbt Failure Log
```bash
# Locate exact failing SQL and compilation target
grep -E "Database Error in model|Number of columns does not match|schema drift" target/dbt.log | tail -n 25
```

### Step 2: Compare Staging View vs Target Incremental Table Schema
```sql
-- Snowflake / Databricks: Check column differences
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'stg_orders'
EXCEPT
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'fct_orders';
```

---

## 3. Root Cause Analysis & Production Remediation

### Primary Root Cause
By default, dbt incremental models generate a `MERGE INTO target USING source` statement expecting identical schema columns. When an upstream migration adds a column without `on_schema_change` enabled, the SQL engine rejects the MERGE.

### Production Remediation: Model Contract & Incremental Strategy

```sql
-- models/marts/fct_orders.sql
{{
    config(
        materialized='incremental',
        incremental_strategy='merge',
        unique_key='order_id',
        on_schema_change='append_new_columns',
        merge_update_columns=['order_status', 'updated_at', 'order_total_usd']
    )
}}

SELECT
    order_id,
    customer_id,
    order_status,
    order_total_usd,
    created_at,
    updated_at
FROM {{ ref('stg_orders') }}

{% if is_incremental() %}
    -- Bounded incremental lookback window protects against out-of-order writes
    WHERE updated_at >= (SELECT MAX(updated_at) - INTERVAL '3 days' FROM {{ this }})
{% endif %}
```

#### Enforce Model Contracts in YAML
```yaml
# models/marts/schema.yml
version: 2
models:
  - name: fct_orders
    config:
      contract:
        enforced: true
    columns:
      - name: order_id
        data_type: string
        constraints:
          - type: not_null
          - type: primary_key
      - name: customer_id
        data_type: string
      - name: order_status
        data_type: string
      - name: order_total_usd
        data_type: numeric(18, 4)
      - name: updated_at
        data_type: timestamp
```

---

## 4. Verification & Prevention
- [ ] Run `dbt run --select fct_orders` and confirm successful incremental MERGE.
- [ ] Verify `dbt test --select fct_orders` passes all primary key and contract assertions.
- [ ] Ensure all incremental models specify `on_schema_change: 'append_new_columns'`.
''',

    "02_snapshot_scd2_timestamp_collision_triage.md": '''# 🚨 Production Runbook 02: dbt Snapshot SCD2 Timestamp Collision Triage

> **Incident Severity**: `SEV-2`
> **Domain**: Analytics Engineering & dbt Snapshots
> **Target Systems**: Snowflake, Databricks, PostgreSQL, dbt Core/Cloud
> **Objective**: Detect and repair overlapping `dbt_valid_to` records and duplicate active dimension rows.

---

## 1. Emergency Decision Tree

```mermaid
flowchart TD
    Alert["SEV-2 Alert: Duplicate Active Rows<br/>in SCD2 Snapshot (dbt_valid_to IS<br/>NULL &gt; 1)"] --> FindDuplicates["Step 1: Identify Duplicate Primary<br/>Keys in Snapshot Table"]
    FindDuplicates --> CauseCheck{"Collision Cause?"}

    CauseCheck -->|"Same updated_at Timestamp"| TimestampCollision["High-Frequency Updates within<br/>Single Microsecond"]
    CauseCheck -->|"Snapshot Interrupted Mid-Run"| PartialCommit["Uncommitted Snapshot Run"]

    TimestampCollision --> SwitchStrategy["Switch Snapshot Strategy to<br/>check_cols: 'all'"]
    PartialCommit --> RepairActive["Execute Atomic SQL Deduplication &<br/>Re-open Current State"]
    SwitchStrategy --> ReSnapshot["Execute dbt snapshot --select<br/>&lt;model>"]
    RepairActive --> ReSnapshot
```

---

## 2. Immediate Diagnostic Procedures (First 5 Minutes)

### Step 1: Detect Duplicate Active Rows per Entity
```sql
SELECT
    customer_id,
    COUNT(*) AS active_record_count
FROM snapshots.snap_customers
WHERE dbt_valid_to IS NULL
GROUP BY customer_id
HAVING COUNT(*) > 1;
```

### Step 2: Detect Overlapping Valid Time Ranges
```sql
SELECT
    a.customer_id,
    a.dbt_valid_from AS a_from,
    a.dbt_valid_to AS a_to,
    b.dbt_valid_from AS b_from,
    b.dbt_valid_to AS b_to
FROM snapshots.snap_customers a
JOIN snapshots.snap_customers b
  ON a.customer_id = b.customer_id
 AND a.dbt_scd_id != b.dbt_scd_id
 AND a.dbt_valid_from < COALESCE(b.dbt_valid_to, '9999-12-31')
 AND COALESCE(a.dbt_valid_to, '9999-12-31') > b.dbt_valid_from;
```

---

## 3. Root Cause Analysis & Production Remediation

### Primary Root Cause
When an upstream transactional system executes multiple mutations within the granularity of the timestamp column (e.g. within the same second), dbt's `timestamp` snapshot strategy generates identical `dbt_valid_from` timestamps, causing multiple records to remain active (`dbt_valid_to IS NULL`).

### Production Remediation: Switch to Check Strategy & SQL Repair

#### Phase 1: Robust dbt Snapshot Definition
```sql
-- snapshots/snap_customers.sql
{% snapshot snap_customers %}

{{
    config(
      target_schema='snapshots',
      unique_key='customer_id',
      strategy='check',
      check_cols=['email', 'tier', 'credit_limit', 'billing_address'],
      invalidate_hard_deletes=True
    )
}}

SELECT
    customer_id,
    email,
    tier,
    credit_limit,
    billing_address,
    updated_at
FROM {{ source('crm', 'raw_customers') }}

{% endsnapshot %}
```

#### Phase 2: Atomic Cleanup of Corrupted Active Records
```sql
-- Close earlier duplicate active records
UPDATE snapshots.snap_customers
SET dbt_valid_to = updated_at
WHERE dbt_scd_id IN (
    SELECT dbt_scd_id
    FROM (
        SELECT
            dbt_scd_id,
            ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY updated_at DESC, dbt_updated_at DESC) AS rn
        FROM snapshots.snap_customers
        WHERE dbt_valid_to IS NULL
    ) sub
    WHERE sub.rn > 1
);
```

---

## 4. Verification & Prevention
- [ ] Verify query for duplicate active rows returns zero records.
- [ ] Add `dbt-expectations` test: `expect_compound_columns_to_be_unique` on `(customer_id, dbt_valid_to)`.
''',

    "03_circular_dependency_and_dag_deadlock_triage.md": '''# 🚨 Production Runbook 03: Circular Dependency & dbt DAG Deadlock Triage

> **Incident Severity**: `SEV-2`
> **Domain**: Analytics Engineering & Lineage Graphs
> **Target Systems**: dbt Core / Cloud Compilation Engine
> **Objective**: Identify cycle paths in dbt ref graphs and refactor intermediate models to restore compilation.

---

## 1. Emergency Decision Tree

```mermaid
flowchart TD
    Alert["SEV-2 Alert: dbt Compilation<br/>Failed with Cycle in Model Graph"] --> ParseCycle["Step 1: Extract Cycle Path from<br/>dbt compile Error"]
    ParseCycle --> AnalyzeModels{"Where is the Cycle?"}

    AnalyzeModels -->|"Two Marts referencing each<br/>other"| CrossRef["Direct Cross-Reference between<br/>Marts"]
    AnalyzeModels -->|"Staging referencing Mart via<br/>View"| LayerViolation["Layer Boundary Violation (Staging<br/>-> Mart)"]

    CrossRef --> ExtractIntermediate["Create Common Intermediate Model<br/>(int_)"]
    LayerViolation --> EnforceStagingRule["Refactor Staging to depend<br/>strictly on source()"]
    ExtractIntermediate --> CompileCheck["Run dbt compile --select<br/>state:modified+"]
    EnforceStagingRule --> CompileCheck
```

---

## 2. Immediate Diagnostic Procedures (First 5 Minutes)

### Step 1: Locate Cycle Path from Compilation Output
```bash
# Compile project and isolate cycle trace
dbt compile 2>&1 | grep -A 10 "Found a cycle in the model graph"
```

### Step 2: Trace Dependency Lineage
```bash
# Print upstream and downstream lineage of offending model
dbt ls --select "+fct_orders+"
```

---

## 3. Root Cause Analysis & Production Remediation

### Primary Root Cause
Cycles occur when analytical models violate strict layered information architecture (e.g. Mart A refs Mart B, while Mart B refs a CTE derived from Mart A).

### Production Remediation: Decouple Shared Logic into Intermediate Layer

```
❌ Anti-Pattern:
fct_orders --> dim_customers --> fct_orders (Cycle!)

✅ Correct Architecture:
stg_orders ----> int_customer_order_metrics ----> dim_customers
stg_customers ->                                 ----> fct_orders
```

#### Intermediate Model Refactor:
```sql
-- models/intermediate/int_customer_order_metrics.sql
SELECT
    customer_id,
    COUNT(order_id) AS lifetime_order_count,
    SUM(order_total_usd) AS lifetime_revenue_usd,
    MAX(created_at) AS last_order_timestamp
FROM {{ ref('stg_orders') }}
GROUP BY customer_id
```

---

## 4. Verification & Prevention
- [ ] Run `dbt compile` and verify clean DAG generation without warnings.
- [ ] Install CI linter rule enforcing unidirectional layering: `sources -> stg_ -> int_ -> fct_/dim_`.
''',

    "04_warehouse_credit_exhaustion_from_full_refresh.md": '''# 🚨 Production Runbook 04: Warehouse Credit Exhaustion from Accidental Full Refresh

> **Incident Severity**: `SEV-1`
> **Domain**: FinOps & Data Warehouse Cost Governance
> **Target Systems**: Snowflake, Databricks SQL, BigQuery, dbt Cloud
> **Objective**: Terminate runaway multi-terabyte full refresh queries, isolate cost impact, and install CI/CD guardrails.

---

## 1. Emergency Decision Tree

```mermaid
flowchart TD
    Alert["SEV-1 Alert: Warehouse Spend Spike<br/>/ Accidental --full-refresh in<br/>Prod"] --> KillQuery["Step 1: Immediately Kill Active<br/>Full-Refresh Query"]
    KillQuery --> CheckTableSize["Step 2: Inspect Target Table Size<br/>& Scan Volume"]

    CheckTableSize --> TableStatus{"Table Corrupted / Dropped?"}
    TableStatus -->|"Table Dropped (dbt DROP TABLE)"| RestoreTimeTravel["Restore Table via Delta/Snowflake<br/>Time Travel"]
    TableStatus -->|"Query Killed Mid-Write"| RebuildIncremental["Rebuild Incremental Watermark"]

    RestoreTimeTravel --> InstallGuardrail["Deploy prevent_prod_full_refresh<br/>Macro"]
    RebuildIncremental --> InstallGuardrail
```

---

## 2. Immediate Diagnostic Procedures (First 5 Minutes)

### Step 1: Terminate Runaway Query Immediately
```sql
-- Snowflake: Find and abort full refresh query
SELECT query_id, user_name, warehouse_name, total_elapsed_time / 1000 AS seconds_running
FROM table(information_schema.query_history_by_warehouse('PROD_TRANSFORM_WH'))
WHERE execution_status = 'RUNNING' AND query_text ILIKE '%drop table%'
ORDER BY start_time DESC;

-- Kill query
SELECT SYSTEM$CANCEL_QUERY('<QUERY_ID>');
```

---

## 3. Root Cause Analysis & Production Remediation

### Primary Root Cause
A developer ran `dbt run --full-refresh` targeting production instead of staging, causing dbt to execute `DROP TABLE` and initiate a multi-billion-row full rescan on multi-cluster warehouses.

### Production Remediation: Full Refresh Guardrail Macro

```sql
-- macros/prevent_prod_full_refresh.sql
{% macro prevent_prod_full_refresh() %}
    {% if flags.FULL_REFRESH and target.name in ['prod', 'production'] %}
        {% set allow_override = var('allow_full_refresh', false) %}
        {% if not allow_override %}
            {{ exceptions.raise_compiler_error(
                "❌ BLOCKED: dbt --full-refresh is disabled in production! " ~
                "To force a full refresh, you must explicitly pass: --vars '{\"allow_full_refresh\": true}'"
            ) }}
        {% endif %}
    {% endif %}
{% endmacro %}
```

#### Hook Guardrail into dbt_project.yml
```yaml
# dbt_project.yml
on-run-start:
  - "{{ prevent_prod_full_refresh() }}"
```

---

## 4. Verification & Prevention
- [ ] Test `dbt run --full-refresh --target prod` locally and confirm compilation error blocks execution.
- [ ] Verify `dbt run --full-refresh --target prod --vars '{"allow_full_refresh": true}'` permits authorized bypass.
- [ ] Configure auto-suspension timeout on Snowflake warehouse to $\\le 60\text{ seconds}$.
''',

    "05_data_contract_breaking_change_quarantine.md": '''# 🚨 Production Runbook 05: Data Contract Breaking Change & Schema Quarantine

> **Incident Severity**: `SEV-2`
> **Domain**: Data Contracts & Quality Observability
> **Target Systems**: dbt Core 1.5+, Open Data Contract Standard (ODCS), Delta Lake, Snowflake
> **Objective**: Block downstream model corruption when an upstream contract breaks, routing raw data into quarantine.

---

## 1. Emergency Decision Tree

```mermaid
flowchart TD
    Alert["SEV-2 Alert: dbt Model Contract<br/>Violation Detected"] --> CheckContract["Step 1: Check Contract Diff in dbt<br/>test Output"]
    CheckContract --> ViolationType{"Violation Type?"}

    ViolationType -->|"Column Type Mismatch"| CastError["Upstream Changed Type (e.g.<br/>Integer -> String)"]
    ViolationType -->|"Missing Guaranteed Column"| DropError["Upstream Dropped Required Column"]
    ViolationType -->|"Constraint Check Failed"| NotNullError["NULL values violating NOT NULL<br/>constraint"]

    CastError --> QuarantineRoute["Route Batch to Quarantine Staging<br/>Table"]
    DropError --> AlertProducer["Trigger PagerDuty to Upstream<br/>Service Team"]
    NotNullError --> QuarantineRoute
```

---

## 2. Immediate Diagnostic Procedures (First 5 Minutes)

### Step 1: Run Contract Audit
```bash
# Check dbt contract enforcement error
dbt test --select test_type:contract
```

---

## 3. Root Cause Analysis & Production Remediation

### Production Model Contract Definition & Quarantine Staging
```sql
-- models/staging/stg_payments_contract.sql
{{
    config(
        materialized='table',
        contract={'enforced': true}
    )
}}

SELECT
    CAST(payment_id AS STRING) AS payment_id,
    CAST(customer_id AS STRING) AS customer_id,
    CAST(amount_cents AS INTEGER) AS amount_cents,
    CAST(currency AS STRING) AS currency,
    CAST(payment_status AS STRING) AS payment_status,
    CAST(created_at AS TIMESTAMP) AS created_at
FROM {{ source('billing', 'raw_payments') }}
```

---

## 4. Verification & Prevention
- [ ] Ensure contract tests execute in pre-merge CI/CD pipeline.
- [ ] Verify producer team publishes contract change notices $\\ge 14\text{ days}$ prior to deployment.
''',

    "06_slim_ci_state_deferred_deferral_failures.md": '''# 🚨 Production Runbook 06: Slim CI State Deferral & Missing Object Triage

> **Incident Severity**: `SEV-2`
> **Domain**: DataOps CI/CD & dbt Cloud / GitHub Actions
> **Target Systems**: dbt Core, GitHub Actions, AWS S3 / Azure Blob Storage
> **Objective**: Resolve `dbt --defer --state` failures caused by stale production `manifest.json` artifacts.

---

## 1. Emergency Decision Tree

```mermaid
flowchart TD
    Alert["SEV-2 Alert: PR CI Failed with<br/>Model Not Found in Deferred State"] --> DownloadManifest["Step 1: Check Production<br/>manifest.json Freshness"]
    DownloadManifest --> ManifestAge{"Manifest Age?"}

    ManifestAge -->|"&gt; 24 Hours Old"| StaleManifest["Manifest is Stale / Missing Newly<br/>Merged Models"]
    ManifestAge -->|"&lt; 24 Hours Old"| MissingObject["Deferred Object Does Not Exist in<br/>Production Database"]

    StaleManifest --> FetchLatestArtifact["Download Latest manifest.json from<br/>Production Deployment"]
    MissingObject --> FallbackBuild["Build Missing Dependencies in PR<br/>Schema"]
    FetchLatestArtifact --> RerunCI["Rerun CI: dbt build --select<br/>state:modified+ --defer"]
    FallbackBuild --> RerunCI
```

---

## 2. Immediate Diagnostic Procedures (First 5 Minutes)

### Step 1: Check CI Deferral Error Signature
```bash
# Look for object resolution error in CI log
grep -E "Database error: object does not exist|dbt was unable to find an upstream model" ci_run.log
```

---

## 3. Root Cause Analysis & Production Remediation

### Production GitHub Actions Workflow for Slim CI
```yaml
# .github/workflows/dbt_slim_ci.yml
name: dbt Slim CI
on: [pull_request]

jobs:
  slim_ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install dbt
        run: pip install dbt-snowflake

      - name: Download Production manifest.json
        run: |
          aws s3 cp s3://company-dbt-artifacts/prod/manifest.json ./prod_manifest/manifest.json

      - name: Run Modified Models with Deferral
        run: |
          dbt build \
            --select state:modified+ \
            --state ./prod_manifest \
            --defer \
            --target ci \
            --threads 4
```

---

## 4. Verification & Prevention
- [ ] Confirm PR runs compile successfully against production state without rebuilding unchanged models.
- [ ] Verify production merge workflow automatically publishes updated `manifest.json` to S3 after every run.
'''
}

RUNBOOKS["dataops-cicd-handbook"] = {
    "01_iac_state_lock_and_drift_disaster_recovery.md": '''# 🚨 Production Runbook 01: Terraform State Lock Deadlock & Drift Disaster Recovery

> **Incident Severity**: `SEV-1`
> **Domain**: Infrastructure as Code & Cloud Platform Engineering
> **Target Systems**: Terraform / OpenTofu, AWS S3 / DynamoDB, Azure Blob Storage
> **Objective**: Safely release deadlocked Terraform state locks, detect out-of-band resource drift, and restore CI/CD deployments.

---

## 1. Emergency Decision Tree

```mermaid
flowchart TD
    Alert["SEV-1 Alert: Terraform Apply<br/>Blocked by Error acquiring the<br/>state lock"] --> VerifyRunner["Step 1: Verify Active CI Runner<br/>Pipelines"]
    VerifyRunner --> IsRunnerDead{"Is Locking CI Pipeline Still<br/>Running?"}

    IsRunnerDead -->|"Yes: Legitimate Deployment"| WaitPipeline["Wait for Active Runner to Complete"]
    IsRunnerDead -->|"No: Crashed / Aborted Runner"| ForceUnlock["Step 2: Force Unlock Lock ID via<br/>CLI"]

    ForceUnlock --> RefreshState["Step 3: Run terraform refresh to<br/>Reconcile Drift"]
    RefreshState --> PlanReview["Review terraform plan<br/>-detailed-exitcode"]
```

---

## 2. Immediate Diagnostic Procedures (First 5 Minutes)

### Step 1: Query Error Output for Lock ID and Locking Identity
```bash
# Extract Lock ID from CI error message
grep -A 5 "Error acquiring the state lock" /var/log/terraform/run.log
```

### Step 2: Query DynamoDB Lock Table or Azure Blob Lease
```bash
# AWS DynamoDB: Check lock item
aws dynamodb get-item \
  --table-name "terraform-state-lock" \
  --key '{"LockID": {"S": "prod-lakehouse/terraform.tfstate"}}'
```

---

## 3. Root Cause Analysis & Production Remediation

### Production Force Unlock & Safe Drift Reconciliation
```bash
# 1. Release orphaned state lock using the exact LockID from error output
terraform force-unlock -force "9c8a4d2e-3f1b-4a5c-8d7e-9f0a1b2c3d4e"

# 2. Refresh state to detect any out-of-band portal changes
terraform refresh

# 3. Generate detailed execution plan
terraform plan -out=tfplan.binary -detailed-exitcode
```

---

## 4. Verification & Prevention
- [ ] Confirm `terraform plan` executes without state lock contention.
- [ ] Ensure CI runners configure job timeouts ($\\le 60\text{ minutes}$) to prevent orphaned leases.
''',

    "02_production_schema_migration_rollback_triage.md": '''# 🚨 Production Runbook 02: Database Schema Migration Rollback & Lock Triage

> **Incident Severity**: `SEV-1`
> **Domain**: DataOps & Relational Schema Migrations
> **Target Systems**: PostgreSQL, MySQL, Flyway, Liquibase, Alembic
> **Objective**: Clear failed migration locks, revert non-breaking DDL, and apply forward-only recovery.

---

## 1. Emergency Decision Tree

```mermaid
flowchart TD
    Alert["SEV-1 Alert: Migration Stalled or<br/>Failed on Production Database"] --> CheckLock["Step 1: Check Migration Lock Table<br/>(flyway_schema_history)"]
    CheckLock --> IsLocked{"Is Migration Locked?"}

    IsLocked -->|"Yes: Stalled Lock"| UnlockMigration["Release Migration Lock & Terminate<br/>Hanging DDL"]
    IsLocked -->|"No: Failed Execution"| EvaluateDDL["Evaluate Transactional vs<br/>Non-Transactional DDL"]

    UnlockMigration --> ForwardOnlyFix["Apply Forward-Only Non-Destructive<br/>Expand/Contract Migration"]
    EvaluateDDL --> ForwardOnlyFix
```

---

## 2. Immediate Diagnostic Procedures (First 5 Minutes)

### Step 1: Query Migration History Table for Failed Scripts
```sql
-- Flyway: Inspect latest failed migration
SELECT installed_rank, version, description, type, script, installed_by, installed_on, execution_time, success
FROM flyway_schema_history
ORDER BY installed_rank DESC
LIMIT 5;
```

---

## 3. Root Cause Analysis & Production Remediation

### Production Expand / Contract Migration Pattern
```sql
-- Phase 1: Expand (Add new nullable column, do NOT drop old column)
ALTER TABLE customers ADD COLUMN phone_e164 VARCHAR(32);

-- Phase 2: Dual Write (Application writes to both phone and phone_e164)
-- Phase 3: Backfill historical data in batches
UPDATE customers SET phone_e164 = phone WHERE phone_e164 IS NULL;

-- Phase 4: Contract (Drop old column after all consumers migrated)
-- ALTER TABLE customers DROP COLUMN phone;
```

---

## 4. Verification & Prevention
- [ ] Run `flyway repair` to align schema checksums.
- [ ] Never execute destructive DDL (`DROP COLUMN`, `ALTER TYPE`) in single-step migrations.
''',

    "03_data_quality_assertion_pipeline_blocker_triage.md": '''# 🚨 Production Runbook 03: Data Quality Assertion Pipeline Blocker & Circuit Breaker

> **Incident Severity**: `SEV-2`
> **Domain**: Data Quality Observability & Pipeline Orchestration
> **Target Systems**: Apache Airflow 2/3, Great Expectations, Soda Core, Delta Live Tables
> **Objective**: Triage failed data quality assertion gates without allowing corrupted data to pollute Gold marts.

---

## 1. Emergency Decision Tree

```mermaid
flowchart TD
    Alert["SEV-2 Alert: Pipeline Stalled by<br/>Quality Assertion Gate Failure"] --> InspectAssertion["Step 1: Inspect Assertion Failure<br/>Details"]
    InspectAssertion --> SeverityCheck{"Assertion Criticality?"}

    SeverityCheck -->|"Critical Primary Key / NULL<br/>Violation"| QuarantineBatch["Trigger Circuit Breaker & Route<br/>Batch to Quarantine"]
    SeverityCheck -->|"Non-Critical Volume Variance"| WarnAndProceed["Emit Warning Alert & Allow<br/>Pipeline to Proceed"]

    QuarantineBatch --> NotifyDataProductOwner["Dispatch Slack / PagerDuty Alert<br/>with Assertion Diagnostics"]
```

---

## 2. Immediate Diagnostic Procedures (First 5 Minutes)

### Step 1: Check Failed Task Assertion Report
```bash
# Query Airflow task logs for quality failure details
airflow tasks logs <DAG_ID> <TASK_ID> <EXECUTION_DATE> | grep -E "QualityAssertionError|Validation Failed"
```

---

## 3. Root Cause Analysis & Production Remediation

### Production Airflow Circuit Breaker Task with Slack Notification
```python
from airflow.decorators import task
from airflow.exceptions import AirflowFailException
import requests

@task
def validate_silver_dataset(df):
    null_count = df.filter(df["order_id"].isNull()).count()
    total_count = df.count()

    if null_count > 0:
        error_msg = f"❌ Quality Assertion Failed: Found {null_count} NULL order_ids out of {total_count} records."
        # Trigger Slack alert
        requests.post("https://hooks.slack.com/services/T00/B00/X00", json={"text": error_msg})
        raise AirflowFailException(error_msg)

    return df
```

---

## 4. Verification & Prevention
- [ ] Confirm corrupted batch is safely isolated in quarantine table `silver_orders_quarantine`.
- [ ] Verify downstream Gold aggregations did not consume bad records.
''',

    "04_kubernetes_node_memory_eviction_and_oom_triage.md": '''# 🚨 Production Runbook 04: Kubernetes Worker OOMKilled & Pod Eviction Triage

> **Incident Severity**: `SEV-1`
> **Domain**: Kubernetes & Distributed Data Infrastructure
> **Target Systems**: Kubernetes Cluster (EKS / AKS / GKE), Airflow Celery/K8s Workers, Spark on K8s
> **Objective**: Diagnose Exit Code 137 (OOMKilled) pod crashes and configure JVM cgroup memory caps.

---

## 1. Emergency Decision Tree

```mermaid
flowchart TD
    Alert["SEV-1 Alert: Kubernetes Worker Pod<br/>Terminated with ExitCode 137"] --> InspectPod["Step 1: Run kubectl describe pod"]
    InspectPod --> ReasonCheck{"Termination Reason?"}

    ReasonCheck -->|"OOMKilled (Exit Code 137)"| MemoryEviction["Pod Exceeded<br/>spec.resources.limits.memory"]
    ReasonCheck -->|"Node Eviction (DiskPressure)"| DiskEviction["Node Ephemeral Storage Full"]

    MemoryEviction --> TuneJVM["Set -XX:MaxRAMPercentage=75.0 &<br/>Increase Memory Limit"]
    DiskEviction --> CleanLogs["Prune Docker Container Images &<br/>Spark Local Scratch Dirs"]
```

---

## 2. Immediate Diagnostic Procedures (First 5 Minutes)

### Step 1: Inspect Pod Last Termination State
```bash
kubectl describe pod <pod-name> -n airflow | grep -A 8 "Last State"
```

---

## 3. Root Cause Analysis & Production Remediation

### Production Kubernetes Pod Configuration with JVM CGroup Support
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: airflow-worker-pod
spec:
  containers:
    - name: worker
      image: apache/airflow:2.9.1-python3.11
      env:
        - name: JAVA_TOOL_OPTIONS
          value: "-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError"
      resources:
        requests:
          memory: "4Gi"
          cpu: "2"
        limits:
          memory: "8Gi"
          cpu: "4"
```

---

## 4. Verification & Prevention
- [ ] Verify worker pod stabilizes and does not restart during peak batch transformations.
- [ ] Set Grafana alert on `container_memory_usage_bytes / container_spec_memory_limit_bytes > 0.85`.
''',

    "05_ci_runner_credential_compromise_and_token_rotation.md": '''# 🚨 Production Runbook 05: CI Runner Credential Compromise & Keyless OIDC Migration

> **Incident Severity**: `SEV-1`
> **Domain**: DevSecOps & Supply Chain Security
> **Target Systems**: GitHub Actions, AWS IAM, Azure Entra ID, HashiCorp Vault
> **Objective**: Invalidate compromised long-lived CI service account keys and enforce keyless OIDC workload identity.

---

## 1. Emergency Decision Tree

```mermaid
flowchart TD
    Alert["SEV-1 Alert: CI Secret Leaked in<br/>Build Logs or Compromised Runner"] --> RevokeCreds["Step 1: Immediately Invalidate<br/>Secret in Cloud IAM"]
    RevokeCreds --> AuditLogs["Step 2: Query CloudTrail / Azure<br/>Activity Log for Misuse"]
    AuditLogs --> MigrateOIDC["Step 3: Replace Static Secrets<br/>with Keyless OIDC Federation"]
```

---

## 2. Immediate Diagnostic Procedures (First 5 Minutes)

### Step 1: Invalidate Leaked Azure Service Principal Key
```bash
az ad app credential delete --id <CLIENT_ID> --key-id <KEY_ID>
```

---

## 3. Root Cause Analysis & Production Remediation

### Production GitHub Actions Keyless OIDC Workflow
```yaml
name: Deploy Data Pipelines
on:
  push:
    branches: [main]

permissions:
  id-token: write
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Azure OIDC Login
        uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
```

---

## 4. Verification & Prevention
- [ ] Confirm no long-lived static secret keys exist in repository secrets.
- [ ] Verify Azure federated credential trust is bound strictly to `repo:<org>/<repo>:ref:refs/heads/main`.
''',

    "06_data_observability_alert_fatigue_and_threshold_tuning.md": r'''# 🚨 Production Runbook 06: Data Observability Alert Fatigue & Dynamic Threshold Tuning

> **Incident Severity**: `SEV-2`
> **Domain**: Data Observability & Monitoring
> **Target Systems**: Datadog, Prometheus, Monte Carlo, Elementary
> **Objective**: Replace brittle static threshold monitors with dynamic statistical anomaly detection.

---

## 1. Emergency Decision Tree

```mermaid
flowchart TD
    Alert["SEV-2 Alert: On-Call Engineer<br/>Alert Fatigue (&gt; 20 False<br/>Alarms/Day)"] --> AnalyzeAlerts["Step 1: Categorize High-Volume<br/>False Positive Monitors"]
    AnalyzeAlerts --> MonitorType{"Monitor Type?"}

    MonitorType -->|"Static Row Count Threshold"| StaticVolume["Static Count Fails on Weekends /<br/>Holidays"]
    MonitorType -->|"Static Freshness Threshold"| StaticFreshness["Freshness Threshold Misses Batch<br/>Cadence"]

    StaticVolume --> DynamicIQR["Switch to 14-Day Moving Average &<br/>Interquartile Range (IQR)"]
    StaticFreshness --> DynamicFreshness["Configure Schedule-Aware SLA<br/>Windows"]
```

---

## 2. Immediate Diagnostic Procedures (First 5 Minutes)

### Step 1: Query Alert Volume by Monitor Rule
```bash
# Inspect top firing alerts over the past 7 days
curl -s -H "DD-API-KEY: $DD_API_KEY" "https://api.datadoghq.com/api/v1/monitor" | jq '.[] | {name: .name, query: .query}'
```

---

## 3. Root Cause Analysis & Production Remediation

### Python Dynamic Volume Anomaly Detection (IQR Algorithm)
```python
import numpy as np

def detect_volume_anomaly(historical_counts: list[int], current_count: int) -> bool:
    """
    Computes IQR boundaries over 14-day history, accounting for weekly seasonality.
    """
    q75, q25 = np.percentile(historical_counts, [75, 25])
    iqr = q75 - q25

    lower_bound = max(0, q25 - (1.5 * iqr))
    upper_bound = q75 + (1.5 * iqr)

    is_anomaly = current_count < lower_bound or current_count > upper_bound
    return is_anomaly, lower_bound, upper_bound
```

---

## 4. Verification & Prevention
- [ ] Confirm false positive alert rate drops by $> 80\%$.
- [ ] Require all monitors to pass through a 7-day silent observation period before paging on-call.
'''
}

RUNBOOKS["data-system-design-handbook"] = {
    "01_cross_region_split_brain_conflict_resolution.md": '''# 🚨 Production Runbook 01: Cross-Region Split-Brain & Lakehouse Conflict Resolution

> **Incident Severity**: `SEV-1`
> **Domain**: Distributed Lakehouse Architecture & Disaster Recovery
> **Target Systems**: Azure Databricks, ADLS Gen2 (Primary: East US, Secondary: West Europe), Delta Lake 3.x
> **Objective**: Reconcile divergent Delta Lake transaction logs following cross-region network partitioning.

---

## 1. Emergency Decision Tree

```mermaid
flowchart TD
    Alert["SEV-1 Alert: Active-Active<br/>Lakehouse Split-Brain Detected"] --> IsolateSecondary["Step 1: Quench Secondary Region<br/>Writes (Set Read-Only)"]
    IsolateSecondary --> CompareCommitLogs["Step 2: Compare Delta Log Versions<br/>across Primary & Secondary"]

    CompareCommitLogs --> DivergenceCheck{"Commit Log Diverged?"}
    DivergenceCheck -->|"Secondary has uncommitted<br/>transactions"| ExtractDiff["Step 3: Extract Delta Time Travel<br/>Delta Diff from Secondary"]

    ExtractDiff --> ReconcilePrimary["Step 4: Execute Deterministic<br/>MERGE into Primary Region"]
    ReconcilePrimary --> ResyncSecondary["Step 5: Overwrite Secondary<br/>Storage via Deep Clone"]
```

---

## 2. Immediate Diagnostic Procedures (First 5 Minutes)

### Step 1: Quench Secondary Storage Account Writes
```bash
# Set secondary ADLS Gen2 container access to read-only via Azure CLI
az storage container set-permission \
  --account-name "datalakewesteurope" \
  --name "silver" \
  --public-access off
```

### Step 2: Compare Transaction Log Version HEADs
```bash
# Inspect latest Delta commit JSON in primary vs secondary
PRIMARY_VERSION=$(az storage blob list --account-name datalakeeastus --container silver --prefix "_delta_log/" --query "[-1].name")
SECONDARY_VERSION=$(az storage blob list --account-name datalakewesteurope --container silver --prefix "_delta_log/" --query "[-1].name")

echo "Primary HEAD: $PRIMARY_VERSION | Secondary HEAD: $SECONDARY_VERSION"
```

---

## 3. Root Cause Analysis & Production Remediation

### Production Delta Lake Time Travel Reconciliation Script
```python
from pyspark.sql import SparkSession
from delta.tables import DeltaTable

spark = SparkSession.builder \
    .appName("SplitBrainDeltaReconciliation") \
    .config("spark.sql.extensions", "io.delta.sql.DeltaSparkSessionExtension") \
    .getOrCreate()

primary_path = "abfss://silver@datalakeeastus.dfs.core.windows.net/orders"
secondary_path = "abfss://silver@datalakewesteurope.dfs.core.windows.net/orders"

# Read latest state from primary
primary_table = DeltaTable.forPath(spark, primary_path)

# Extract records written to secondary during network partition
# Assuming partition started at version 1042
secondary_diff_df = spark.read \
    .format("delta") \
    .option("readChangeFeed", "true") \
    .option("startingVersion", 1042) \
    .load(secondary_path) \
    .filter("_change_type IN ('insert', 'update_postimage')")

# Apply deterministic MERGE into Primary (Last-Write-Wins based on event_timestamp)
primary_table.alias("target").merge(
    secondary_diff_df.alias("source"),
    "target.order_id = source.order_id"
).whenMatchedUpdate(
    condition="source.event_timestamp > target.event_timestamp",
    set={"order_status": "source.order_status", "updated_at": "source.updated_at"}
).whenNotMatchedInsertAll().execute()

print("Reconciliation complete. Refreshing secondary region via Deep Clone...")
spark.sql(f"CREATE OR REPLACE TABLE delta.`{secondary_path}` DEEP CLONE delta.`{primary_path}`")
```

---

## 4. Verification & Prevention
- [ ] Verify `_delta_log` version numbers on secondary match primary exactly.
- [ ] Confirm row counts across both storage accounts match 100%.
- [ ] Ensure architecture enforces Active-Passive writes during WAN degraded states.
''',

    "02_table_format_metadata_explosion_triage.md": '''# 🚨 Production Runbook 02: Table Format Metadata Explosion & Planning Lag Triage

> **Incident Severity**: `SEV-2`
> **Domain**: Open Table Formats & Storage Internals
> **Target Systems**: Delta Lake 3.x, Apache Iceberg, Databricks Catalyst Optimizer
> **Objective**: Compact millions of small JSON commit files, prune obsolete snapshots, and eliminate query planning delays.

---

## 1. Emergency Decision Tree

```mermaid
flowchart TD
    Alert["SEV-2 Alert: Spark Query Planning<br/>Exceeds 60s (Metadata Bloat)"] --> CountMetadata["Step 1: Count Commit Files in<br/>_delta_log or metadata/"]
    CountMetadata --> ThresholdCheck{"Commit File Count &gt; 10,000?"}

    ThresholdCheck -->|Yes| CompactionNeeded["Metadata File Explosion Detected"]
    ThresholdCheck -->|No| CheckDriverMemory["Check Driver Heap & GC Pauses"]

    CompactionNeeded --> ForceCheckpoint["Force Multi-Part Checkpoint<br/>Generation"]
    ForceCheckpoint --> RunVacuum["Execute VACUUM RETAIN 168 HOURS"]
    RunVacuum --> OptimizeBinPack["Execute OPTIMIZE ZORDER BY"]
```

---

## 2. Immediate Diagnostic Procedures (First 5 Minutes)

### Step 1: Count Delta Log Commit Files
```bash
# Count total JSON commit logs in table directory
az storage blob list --account-name datalake --container gold --prefix "orders/_delta_log/" \
  --query "[?ends_with(name, '.json')] | length(@)"
```

---

## 3. Root Cause Analysis & Production Remediation

### Primary Root Cause
High-frequency streaming writes (e.g. 10-second micro-batches) generate 8,640 commit JSON files every day. Over weeks, Catalyst must parse millions of files during query planning, leading to Driver OOM and planning delays.

### Production Compaction & Retention Script
```sql
-- 1. Force compact data files into 1GB Parquet files with Z-Ordering
OPTIMIZE gold.orders
ZORDER BY (order_date, customer_id);

-- 2. Clean up unreferenced Parquet files past 7-day retention
SET spark.databricks.delta.vacuum.parallelDelete.enabled = true;
VACUUM gold.orders RETAIN 168 HOURS;

-- 3. Configure automated checkpointing every 10 commits
ALTER TABLE gold.orders
SET TBLPROPERTIES (
    'delta.checkpointInterval' = '10',
    'delta.deletedFileRetentionDuration' = 'interval 7 days'
);
```

---

## 4. Verification & Prevention
- [ ] Verify query planning duration drops from $> 60\text{ seconds}$ to $< 1.5\text{ seconds}$.
- [ ] Confirm checkpoint parquet files (`.checkpoint.parquet`) exist for every 10 commits.
''',

    "03_data_lineage_and_audit_compliance_failure.md": '''# 🚨 Production Runbook 03: OpenLineage Telemetry Failure & Audit Gap Triage

> **Incident Severity**: `SEV-2`
> **Domain**: Governance, Lineage & Regulatory Compliance (BCBS 239 / GDPR)
> **Target Systems**: OpenLineage, Marquez, Microsoft Purview, Databricks Unity Catalog
> **Objective**: Restore missing data lineage run facets and repair audit trail compliance gaps.

---

## 1. Emergency Decision Tree

```mermaid
flowchart TD
    Alert["SEV-2 Alert: Broken OpenLineage<br/>Telemetry / Audit Lineage Gap"] --> TestEndpoint["Step 1: Test OpenLineage Backend<br/>Endpoint Reachability"]
    TestEndpoint --> Reachable{"HTTP 200 OK?"}

    Reachable -->|"No: Connection Refused"| RestoreBackend["Restart Marquez / Purview<br/>Ingestion Service"]
    Reachable -->|"Yes: Dropping Facets"| CheckSparkListener["Inspect Spark OpenLineage<br/>SparkListener Config"]

    RestoreBackend --> ResendRunEvents["Replay Missed RunEvents from<br/>Pipeline Run Logs"]
    CheckSparkListener --> PatchListener["Update openlineage-spark Jar & URL"]
```

---

## 2. Immediate Diagnostic Procedures (First 5 Minutes)

### Step 1: Verify OpenLineage SparkListener Output
```bash
grep -E "OpenLineage|io.openlineage.spark.agent" /var/log/spark/driver.log | tail -n 25
```

---

## 3. Root Cause Analysis & Production Remediation

### Production OpenLineage Spark Configuration
```properties
# spark-defaults.conf
spark.extraListeners=io.openlineage.spark.agent.OpenLineageSparkListener
spark.openlineage.transport.type=http
spark.openlineage.transport.url=https://lineage.internal.company.com:443
spark.openlineage.transport.auth.type=api_key
spark.openlineage.transport.auth.apiKey=${env:OPENLINEAGE_API_KEY}
spark.openlineage.namespace=production-lakehouse
```

---

## 4. Verification & Prevention
- [ ] Confirm line-level and dataset-level edges appear in Marquez / Purview UI.
- [ ] Set alert on `openlineage_emitted_events_total == 0` during active batch runs.
''',

    "04_multitenant_noisy_neighbor_starvation.md": '''# 🚨 Production Runbook 04: Multi-Tenant Compute Starvation & Noisy Neighbor Triage

> **Incident Severity**: `SEV-1`
> **Domain**: Cloud MPP, Databricks SQL & Concurrency Management
> **Target Systems**: Databricks SQL Warehouses, Snowflake Virtual Warehouses, Spark Clusters
> **Objective**: Terminate rogue analytical Cartesian queries starving SLA-critical production pipelines.

---

## 1. Emergency Decision Tree

```mermaid
flowchart TD
    Alert["SEV-1 Alert: Production SLA<br/>Pipeline Queued Behind Ad-Hoc<br/>Query"] --> IdentifyRogue["Step 1: Query Active Queries by<br/>Runtime & Memory Usage"]
    IdentifyRogue --> KillRogue["Step 2: Terminate Runaway Query<br/>Immediately"]
    KillRogue --> IsolateWorkloads["Step 3: Route Ad-Hoc Analytics to<br/>Dedicated Warehouse"]
```

---

## 2. Immediate Diagnostic Procedures (First 5 Minutes)

### Step 1: Identify Longest Running Active Query
```sql
-- Databricks SQL / Snowflake: Find queries exceeding 30 minutes
SELECT
    query_id,
    user_name,
    warehouse_id,
    duration_ms / 1000 AS running_seconds,
    statement_text
FROM system.query.history
WHERE execution_status = 'RUNNING'
ORDER BY duration_ms DESC
LIMIT 5;
```

---

## 3. Root Cause Analysis & Production Remediation

### Configure Query Watchdog and Auto-Termination Rules
```sql
-- Enforce hard runtime limits on ad-hoc analytical warehouses (max 20 minutes)
ALTER WAREHOUSE adhoc_analytics_wh
SET AUTO_TERMINATION_MINUTES = 10,
    MAX_CONCURRENT_QUERIES = 8;
```

---

## 4. Verification & Prevention
- [ ] Isolate SLA-bound production batch jobs to a dedicated, decoupled warehouse pool.
- [ ] Enable Databricks Query Watchdog to automatically kill Cartesian joins ($O(M \times N)$).
''',

    "05_lakehouse_catalog_lockout_and_disaster_recovery.md": '''# 🚨 Production Runbook 05: Lakehouse Catalog Outage & Emergency Bypass

> **Incident Severity**: `SEV-1`
> **Domain**: Metadata Catalogs & High Availability
> **Target Systems**: Databricks Unity Catalog, AWS Glue Catalog, Apache Iceberg REST Catalog
> **Objective**: Restore query access during a central catalog outage using direct object storage fallback mounts.

---

## 1. Emergency Decision Tree

```mermaid
flowchart TD
    Alert["SEV-1 Alert: Unity Catalog / Glue<br/>Unavailable (Metadata Resolution<br/>Failed)"] --> FailoverCatalog["Step 1: Switch to Read-Only<br/>Catalog Replica"]
    FailoverCatalog --> SuccessCheck{"Replica Responding?"}

    SuccessCheck -->|Yes| DirectTraffic["Route Query Engines to Secondary<br/>Catalog Endpoint"]
    SuccessCheck -->|No| DirectPathFallback["Bypass Catalog via Direct Object<br/>Storage Paths<br/>(delta.`abfss://...`)"]
```

---

## 2. Immediate Diagnostic Procedures (First 5 Minutes)

### Step 1: Verify Catalog Health Endpoint
```bash
curl -I -s "https://catalog-prod.internal.company.com/v1/health" | head -n 5
```

---

## 3. Root Cause Analysis & Production Remediation

### Emergency Direct Storage Path Bypass Script
```python
# During complete catalog outage, bypass catalog name resolution
# by referencing absolute Delta Lake cloud storage paths directly
df_orders = spark.read.format("delta").load("abfss://gold@datalake.dfs.core.windows.net/marts/orders")
df_customers = spark.read.format("delta").load("abfss://gold@datalake.dfs.core.windows.net/marts/customers")

# Critical queries continue executing without catalog dependency
df_orders.join(df_customers, "customer_id").createOrReplaceTempView("emergency_orders")
```

---

## 4. Verification & Prevention
- [ ] Confirm mission-critical dashboards load via fallback storage paths.
- [ ] Configure multi-region replication for Unity Catalog / Iceberg REST metadata backend.
''',

    "06_zero_trust_credential_leak_quarantine.md": '''# 🚨 Production Runbook 06: Storage Master Key Leak & Immediate Quarantine

> **Incident Severity**: `SEV-1`
> **Domain**: Cloud Storage Security & Access Revocation
> **Target Systems**: Azure ADLS Gen2, AWS S3, Azure Key Vault, AWS Secrets Manager
> **Objective**: Immediately rotate compromised cloud storage keys, invalidate active SAS tokens, and lock down network perimeters.

---

## 1. Emergency Decision Tree

```mermaid
flowchart TD
    Alert["SEV-1 Alert: Storage Account Key /<br/>SAS Token Leaked Publicly"] --> RotateKey["Step 1: Immediately Regenerate<br/>Secondary Storage Key"]
    RotateKey --> SwapApps["Step 2: Swap Applications to New<br/>Key"]
    SwapApps --> InvalidatePrimary["Step 3: Regenerate Leaked Primary<br/>Storage Key"]
    InvalidatePrimary --> RevokeSAS["Step 4: Invalidate All Active User<br/>Delegation SAS Tokens"]
```

---

## 2. Immediate Diagnostic Procedures (First 5 Minutes)

### Step 1: Regenerate Compromised Storage Key via Azure CLI
```bash
# 1. Regenerate key2
az storage account keys renew \
  --resource-group "rg-datalake-prod" \
  --account-name "prodstorageaccount" \
  --key "secondary"

# 2. Invalidate leaked key1
az storage account keys renew \
  --resource-group "rg-datalake-prod" \
  --account-name "prodstorageaccount" \
  --key "primary"
```

### Step 2: Invalidate Active User Delegation SAS Tokens
```bash
# Revoke all active user delegation keys to kill in-flight SAS tokens
az storage account revoke-delegation-keys \
  --resource-group "rg-datalake-prod" \
  --name "prodstorageaccount"
```

---

## 3. Root Cause Analysis & Production Remediation

### Eliminate Static Storage Keys via Azure Managed Identity
```bash
# Disable storage account key access entirely (forces Microsoft Entra / Azure RBAC)
az storage account update \
  --resource-group "rg-datalake-prod" \
  --name "prodstorageaccount" \
  --allow-shared-key-access false
```

---

## 4. Verification & Prevention
- [ ] Verify `--allow-shared-key-access` is set to `false`.
- [ ] Confirm all pipelines authenticate using Azure Managed Identity or AWS IAM Roles for Service Accounts (IRSA).
'''
}


apply_runbooks()
