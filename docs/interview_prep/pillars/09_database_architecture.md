# Pillar 09: Database Architecture & Distributed Systems
**Category:** `DATABASE ARCHITECTURE` | **Domain:** `Database Internals & Distributed Storage`

---

### Q1: Compare OLTP (Row-Oriented) vs OLAP (Columnar) storage engines at the disk page, compression, and CPU level.

**Difficulty:** `HARD` | **Niche:** `Storage Engine Internals`

**Comparison Matrix:**
- **Disk Page Layout:** OLTP packs all columns of a single record contiguously on an 8KB data page (optimal for point reads/writes). OLAP packs values of a single column across thousands of records on contiguous pages.
- **Compression:** OLTP achieves modest compression (20-30%) due to heterogeneous column data types. OLAP achieves **$5\times \text{ to } 10\times$ compression** using dictionary encoding, run-length encoding (RLE), and bit-packing across homogeneous column values.
- **CPU Execution:** OLAP leverages vectorized SIMD CPU instructions to filter millions of values in CPU registers; OLTP is constrained by scalar pointer chasing.

---

### Q2: Compare B-Tree and Log-Structured Merge-Tree (LSM-Tree) storage engines in terms of Read and Write Amplification.

**Difficulty:** `HARD` | **Niche:** `B-Tree vs LSM-Tree`

**Comparison:**
- **B-Trees (PostgreSQL, MySQL, SQL Server):**
  - In-place updates on disk pages. High write amplification (writing 100 bytes modifies an entire 8KB page and WAL log).
  - Low read amplification: point lookups take $O(\log N)$ disk seeks.
- **LSM-Trees (Cassandra, RocksDB, ScyllaDB):**
  - Append-only writes. Writes hit in-memory MemTable and write-ahead log, flushing sequentially to immutable SSTables on disk (minimal write amplification, high write throughput).
  - Higher read amplification: reads must query MemTable and multiple SSTables via Bloom filters and merge-sort records.

---

### Q3: Explain the CAP and PACELC Theorems and classify PostgreSQL, Cassandra, and Spanner.

**Difficulty:** `HARD` | **Niche:** `Distributed Consistency Theorems`

**PACELC Theorem Definition:**
If there is a Partition (**P**), how does the system trade off Availability (**A**) vs Consistency (**C**); **E**lse, how does the system trade off Latency (**L**) vs Consistency (**C**)?
- **PostgreSQL (Traditional RDBMS):** PC/EC. Prioritizes consistency at all times.
- **Apache Cassandra:** PA/EL. Prioritizes availability during network partitions, and prioritizes low latency over immediate consistency in normal operation (eventual consistency).
- **Google Cloud Spanner:** PC/EC. True distributed CP system utilizing atomic clocks (TrueTime API) to guarantee external consistency with high availability across global regions.

---

### Q4: Explain Database Sharding Topologies (Range, Hash, Directory) and how Vitess implements VSchema sharding.

**Difficulty:** `ARCHITECT` | **Niche:** `Database Sharding & Vitess`

**Sharding Topologies:**
1. **Range Sharding:** Splits data by key ranges (e.g. A-D, E-H). Susceptible to write hotspotting on sequential keys (e.g. auto-increment IDs).
2. **Hash Sharding:** Computes `hash(key) % N`. Distributes writes uniformly; requires consistent hashing to avoid massive re-shuffling when nodes are added.
3. **Vitess VSchema Sharding:** Used to horizontally scale MySQL clusters. VSchema defines sharding keys and routes queries via VTGate proxies, enabling live dynamic re-sharding without application downtime.

---

### Q5: How does the Raft Consensus Algorithm establish leader election and log replication in distributed databases?

**Difficulty:** `HARD` | **Niche:** `Distributed Consensus`

**Direct 30-Second Answer:**
Raft achieves distributed consensus through two core phases:
1. **Leader Election:** Nodes operate in Follower, Candidate, or Leader states. If followers miss leader heartbeats (election timeout 150-300ms), they transition to Candidate, increment term, and request votes. A candidate wins with a majority vote ($> N/2$).
2. **Log Replication:** All client writes go to the Leader. The Leader appends entries to its log and sends `AppendEntries` RPCs to followers. Once a majority of followers acknowledge writing to their local logs, the Leader commits the write and notifies followers.

---

### Q6: Explain Multi-Version Concurrency Control (MVCC) and why 'Readers never block Writers, and Writers never block Readers'.

**Difficulty:** `HARD` | **Niche:** `MVCC & Concurrency Control`

**Direct 30-Second Answer:**
Instead of placing exclusive locks on rows during updates, MVCC creates a brand new version of the row with transaction timestamps (`xmin`, `xmax` in PostgreSQL):
- **Readers:** A reader takes a snapshot at transaction start and reads the latest version committed *before* its snapshot timestamp.
- **Writers:** Writers write new versions without locking existing versions.
- **Outcome:** Read queries never block update queries, and long-running reporting queries never block transactional writes.

---

### Q7: Why is connection pooling (e.g. PgBouncer, HikariCP) critical, and how do you implement admission control under load spikes?

**Difficulty:** `MEDIUM` | **Niche:** `Connection Pooling & Backpressure`

**Direct 30-Second Answer:**
Every database connection consumes dedicated process memory (e.g. 5-10MB in PostgreSQL) and OS thread context switching. Thousands of concurrent client connections cause server thread thrashing and memory exhaustion.
- **Connection Pooling:** Maintains a warm pool of reusable connections (e.g. 50 connections serving 5,000 clients).
- **Admission Control:** Queues client requests when all pool connections are busy; rejects requests with HTTP 429 / backpressure when the queue reaches capacity, protecting the database engine from collapse.

---

### Q8: Explain the ARIES Crash Recovery Algorithm and Write-Ahead Logging (WAL) mechanics.

**Difficulty:** `ARCHITECT` | **Niche:** `Crash Recovery & ARIES`

**ARIES 3-Phase Crash Recovery:**
1. **Analysis Phase:** Scans the WAL forward from the last checkpoint to identify dirty pages in the buffer pool and active uncommitted transactions at the time of crash.
2. **Redo Phase:** Scans forward from the oldest uncommitted log record, replaying all logged changes (both committed and uncommitted) to restore database memory to the exact state before crash.
3. **Undo Phase:** Scans backward, undoing the operations of all transactions that were active and uncommitted at the time of crash, logging Compensating Log Records (CLRs) to ensure idempotency.

---

### Q9: Compare Two-Phase Commit (2PC) with the Saga Pattern for distributed transactions across microservices.

**Difficulty:** `ARCHITECT` | **Niche:** `Distributed Transactions`

**Comparison:**
- **Two-Phase Commit (2PC):** Coordinator orchestrates Prepare and Commit phases. Guarantees strict ACID consistency across nodes. However, locks resources across all participating databases throughout both phases, creating a single point of failure and severe latency bottlenecks.
- **Saga Pattern (Event-Driven / Choreography):** Breaks a distributed transaction into a sequence of local transactions. Each transaction updates its local database and publishes an event. If a step fails, the Saga executes **Compensating Transactions** to undo previous changes. Delivers eventual consistency without distributed database locks.

---

### Q10: How do you solve replication lag in Read-Replica architectures using Global Transaction Identifiers (GTID)?

**Difficulty:** `HARD` | **Niche:** `Replication Lag & GTID Pinning`

**Direct 30-Second Answer:**
When users write data (e.g. update profile) and immediately refresh the page, read replicas might not have caught up with the primary, causing data to appear missing.
**GTID Pinning Solution:**
1. Primary returns the Global Transaction ID (GTID) of the committed write to the client/session.
2. When reading, the application proxy checks the replica's applied GTID.
3. If `replica_gtid < written_gtid`, the proxy automatically routes the read directly to the **Primary database** or pauses until the replica applies the GTID, guaranteeing Read-After-Write consistency.

---
