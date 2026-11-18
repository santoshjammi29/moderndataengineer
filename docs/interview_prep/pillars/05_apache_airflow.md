# Pillar 05: Apache Airflow & Orchestration
**Category:** `APACHE AIRFLOW` | **Domain:** `Pipeline Orchestration & Workflow Scheduling`

---

### Q1: What are the major architectural differences between Apache Airflow 2.x and Airflow 3.0?

**Difficulty:** `ARCHITECT` | **Niche:** `Airflow Architecture Evolution`

**Direct 30-Second Answer:**
Airflow 3.0 modernizes the core architecture into a cloud-native, decoupled platform:
1. **Decoupled API Server:** The Webserver and Scheduler are decoupled; workers interact via a high-performance, asynchronous REST API rather than direct access to the metadata database.
2. **Task Execution Isolation:** Tasks can execute inside isolated environments/containers with decoupled dependencies, eliminating Python dependency conflicts.
3. **Event-Driven Scheduling:** Native event triggers replace polling sensors, dramatically reducing scheduler CPU overhead.
4. **Modern UI:** Complete UI rewrite using modern reactive frameworks with real-time WebSocket state streaming.

---

### Q2: Compare Airflow Executors: CeleryExecutor vs KubernetesExecutor vs CeleryKubernetesExecutor.

**Difficulty:** `HARD` | **Niche:** `Airflow Executors`

**Comparison Matrix:**
- **CeleryExecutor:** Runs fixed worker instances backed by Redis/RabbitMQ message brokers. Fast task startup latency ($< 1\text{s}$), but difficult to scale down to zero and workers share Python dependencies.
- **KubernetesExecutor:** Spawns a dedicated Kubernetes Pod for every single task. Complete resource isolation and custom Docker images per task; however, task startup incurs pod scheduling latency (10-30s).
- **CeleryKubernetesExecutor:** Hybrid. Routes light, fast, high-frequency tasks to Celery workers, while routing heavy, compute-intensive, or custom-image jobs to Kubernetes pods via queue tags.

---

### Q3: How does Dynamic Task Mapping (`expand()` and `partial()`) work in Airflow 2.3+?

**Difficulty:** `MEDIUM` | **Niche:** `Dynamic Task Mapping`

**Direct 30-Second Answer:**
Dynamic Task Mapping allows generating tasks at runtime based on the output of an upstream task, replacing static DAG loops.
```python
from airflow.decorators import task, dag

@task
def get_active_partitions():
    return ['2026-11-01', '2026-11-02', '2026-11-03']

@task
def process_partition(partition_date, env):
    print(f'Processing {partition_date} in {env}')

@dag
def dynamic_pipeline():
    partitions = get_active_partitions()
    # partial() sets constant arguments; expand() dynamically fans out tasks
    process_partition.partial(env='prod').expand(partition_date=partitions)
```

---

### Q4: Explain Deferrable Operators and Triggerers in Airflow, and why they eliminate worker slot exhaustion.

**Difficulty:** `HARD` | **Niche:** `Async & Deferrable Operators`

**Direct 30-Second Answer:**
- **Standard Sensors (The Problem):** A sensor waiting for an S3 file or Spark job occupies a full worker thread slot for hours (`mode='poke'`), consuming resources while doing zero work.
- **Deferrable Operators (The Solution):** When waiting for an external event, the task yields its worker slot, serializes its state, and registers an asynchronous event with the **Triggerer** daemon (powered by Python `asyncio`). A single Triggerer process handles thousands of concurrent waiting tasks. Once the event occurs, the task is re-queued on an available worker slot, saving 90%+ worker compute.

---

### Q5: Compare the TaskFlow API (`@task`) with classic Airflow Operators, specifically regarding XCom handling.

**Difficulty:** `MEDIUM` | **Niche:** `TaskFlow API`

**Comparison:**
- **Classic Operators (`PythonOperator`, `BashOperator`):** Require explicit `ti.xcom_push()` and `ti.xcom_pull()` method calls, leading to boilerplate-heavy code.
- **TaskFlow API (`@task`):** Decorator-based. Functions return standard Python values which Airflow **automatically serializes to XCom**. Passing the return value of Task A into Task B implicitly creates the Airflow dependency (`A >> B`) and handles XCom deserialization transparently.

---

### Q6: Why does default XCom fail at scale, and how do you configure a Custom XCom Backend?

**Difficulty:** `HARD` | **Niche:** `XCom Sizing & Custom Backends`

**Direct 30-Second Answer:**
By default, XCom stores serialized pickled data directly in the metadata database (PostgreSQL/MySQL), which crashes or degrades database performance when tasks push DataFrames or multi-megabyte payloads.
**Custom XCom Backend Architecture:**
1. Implement a custom backend class overriding `serialize_value()` and `deserialize_value()`.
2. Serialize objects exceeding threshold ($> 1\text{KB}$) directly to **Amazon S3 / Azure Blob Storage**, storing only the cloud URI pointer in the Airflow metadata database.

---

### Q7: Explain the difference between `catchup=True` vs `catchup=False` and how to execute safe CLI backfills.

**Difficulty:** `MEDIUM` | **Niche:** `Backfilling & Catchup`

**Direct 30-Second Answer:**
- `catchup=True`: When a DAG is unpaused with a `start_date` in the past, the scheduler automatically triggers execution for **every historical interval** between `start_date` and current date (can overwhelm clusters with thousands of simultaneous runs).
- `catchup=False`: When unpaused, the scheduler executes only for the single most recent schedule interval.
- **Safe CLI Backfill:** Keep `catchup=False` in code; execute manual backfills via CLI with concurrency limits:
```bash
airflow dags backfill -s 2026-10-01 -e 2026-10-31 --max-active-runs 2 pipeline_daily
```

---

### Q8: How does Airflow achieve High Availability (HA) across multiple schedulers without duplicate task execution?

**Difficulty:** `HARD` | **Niche:** `High Availability & Schedulers`

**Direct 30-Second Answer:**
Airflow 2.0+ supports running multiple Scheduler instances concurrently in an active-active setup.
- **Concurrency Control:** Schedulers use row-level database locking (`SELECT ... FOR UPDATE` with `SKIP LOCKED` in PostgreSQL/MySQL).
- When querying for tasks in `SCHEDULED` state, each scheduler claims an exclusive batch of tasks using row locks. Schedulers never collide, and if one scheduler crashes, the surviving schedulers seamlessly continue processing remaining batches.

---

### Q9: How do you implement robust SLA miss alerting and automated incident escalation in Apache Airflow?

**Difficulty:** `MEDIUM` | **Niche:** `SLA & Alerting Architecture`

**Production Architecture:**
1. Define `sla` parameter on critical tasks (e.g. `sla=timedelta(hours=2)`).
2. Implement `sla_miss_callback` at the DAG level to dispatch rich alert payloads to **PagerDuty** and Slack webhooks with DAG run IDs and task durations.
3. Implement `on_failure_callback` with retry policies: `retries=3`, `retry_delay=timedelta(minutes=5)`, `retry_exponential_backoff=True`.

---

### Q10: Compare Managed Airflow options: AWS MWAA vs GCP Cloud Composer vs Astronomer Astro.

**Difficulty:** `HARD` | **Niche:** `Managed Orchestration`

**Comparison:**
- **AWS MWAA:** Fully managed by AWS. Automatic worker autoscaling. However, tightly coupled with AWS IAM and has slower deployment/update cycles.
- **GCP Cloud Composer:** Built on Google Kubernetes Engine (GKE). Deep integration with BigQuery and Dataproc. Excellent observability via Cloud Logging.
- **Astronomer Astro:** Best-in-class multi-cloud enterprise platform. Sub-second task worker scaling (KEDA-driven), fastest Airflow version releases, dedicated GitOps CLI, and fine-grained role-based access control.

---
