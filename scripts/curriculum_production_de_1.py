# scripts/curriculum_production_de_1.py
"""
Part 1 of Production Data Engineering Curriculum (27 items):
- Items 1-15: Azure Data Factory (ADF) Pipeline Patterns & Production Operations
- Items 16-27: Spark Notebook Best Practices, Modular Design & Structured Streaming
"""

CURRICULUM_PART_1 = [
    # ── Item 1: ADF Tumbling Window Triggers vs Schedule Triggers ──
    {
        "de_id": "de-prod-adf-tumbling-window-001",
        "arch_id": "arch-prod-adf-tumbling-window-001",
        "category_de": "ETL & Pipelines",
        "category_arch": "Azure Data Platform Architecture",
        "niche": "ADF Tumbling Window Triggers & Backfill",
        "difficulty": "ARCHITECT",
        "domain": "Compute & Orchestration",
        "subdomain": "Azure Data Factory",
        "question": "How do ADF Tumbling Window triggers fundamentally differ from Schedule triggers in execution semantics, dependency chaining (dependsOn), state tracking, and historical backfill recovery?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
In Azure Data Factory (ADF), **Schedule Triggers** and **Tumbling Window Triggers** represent two fundamentally distinct orchestration models:

1. **Schedule Triggers (Point-in-Time Wall Clock)**:
   - Evaluated strictly against current wall-clock time using standard recurrence rules or CRON expressions.
   - **No Dependency Chaining**: A schedule trigger cannot inherently wait for its own prior execution or an upstream trigger window to complete.
   - **Backfill Blindness**: If a pipeline is paused, downstream compute is down, or trigger execution fails, the schedule trigger skips missed intervals by default upon restart unless manually re-executed via ad-hoc trigger runs.
   - State: Completely stateless between invocations.

2. **Tumbling Window Triggers (Periodic Time-Slice Intervals)**:
   - Operates on a continuous, non-overlapping series of deterministic time windows (`windowStartTime` to `windowEndTime`).
   - **Ordered Self-Dependency & Cross-Trigger Chaining**: Can declare `dependsOn` referencing either a prior window of itself (enforcing strict sequential chronological processing) or an upstream trigger (guaranteeing upstream tables finish before downstream starts).
   - **Deterministic Backfill Recovery**: If deactivated and reactivated, ADF automatically evaluates historical unprocessed windows from the specified `startTime` up to the current UTC timestamp, enqueuing them subject to `maxConcurrency`.
   - **Stateful Retries**: Maintains internal state per window with configurable retry policies (`count`, `intervalInSeconds`).

### Phase 2: Implementation & Production Code Artifacts
Below is the JSON definition of an hourly Tumbling Window Trigger with dependency on an upstream extraction trigger and automated retry policies:

```json
{
  "name": "trig_hourly_silver_processing",
  "properties": {
    "type": "TumblingWindowTrigger",
    "runtimeState": "Started",
    "typeProperties": {
      "frequency": "Hour",
      "interval": 1,
      "startTime": "2026-01-01T00:00:00Z",
      "delay": "00:05:00",
      "maxConcurrency": 4,
      "retryPolicy": {
        "count": 3,
        "intervalInSeconds": 60
      },
      "dependsOn": [
        {
          "type": "TumblingWindowTriggerDependencyReference",
          "offset": "-01:00:00",
          "size": "01:00:00",
          "referenceTrigger": {
            "referenceName": "trig_hourly_bronze_landing",
            "type": "TriggerReference"
          }
        }
      ]
    },
    "pipeline": {
      "pipelineReference": {
        "referenceName": "pl_process_silver_events",
        "type": "PipelineReference"
      },
      "parameters": {
        "windowStart": "@formatDateTime(trigger().outputs.windowStartTime, 'yyyy-MM-dd HH:mm:ss')",
        "windowEnd": "@formatDateTime(trigger().outputs.windowEndTime, 'yyyy-MM-dd HH:mm:ss')"
      }
    }
  }
}
```

### Phase 3: Production Pitfalls, Anti-Patterns & Failure Modes
- **The Backfill Flood Disaster**: Setting `maxConcurrency: 50` on a Tumbling Window trigger during a 30-day backfill will launch 720 pipeline runs concurrently, instantly exhausting Azure SQL Database DTU limits, Databricks cluster limits, or API rate limits. Always throttle `maxConcurrency` to 2–5 during active catch-up operations.
- **Clock Skew & Edge-of-Window Data Loss**: Late-arriving events within cloud object storage can land milliseconds after a window closes. Always configure a non-zero `delay` parameter (e.g., `00:05:00` or `00:10:00`) on tumbling windows to allow upstream landing zones to settle.
- **Deadlock from Self-Dependencies**: If a tumbling window trigger depends on its own prior window (`offset: "-01:00:00"`) and run `N` fails permanently after exhausted retries, all future windows (`N+1`, `N+2`...) are blocked indefinitely. Operations teams must explicitly rerun failed windows or cancel dependencies.

### Phase 4: High-Pressure Interview Talking Points
- *Why choose Tumbling Window over Schedule?* When data is partitioned chronologically and subsequent slices require strict ordered completeness, or when historical backfills must process deterministically without external state management.
- *How does ADF track window state?* ADF stores window state internally in its metadata engine. Tumbling windows can be queried, cancelled, or rerun by window start time through the Azure CLI (`az datafactory trigger-run rerun`) or REST API."""
    },

    # ── Item 2: ADF Storage Event-Based Triggers & At-Least-Once Semantics ──
    {
        "de_id": "de-prod-adf-storage-events-002",
        "arch_id": "arch-prod-adf-storage-events-002",
        "category_de": "ETL & Pipelines",
        "category_arch": "Azure Data Platform Architecture",
        "niche": "Event-Driven Ingestion & Storage Triggers",
        "difficulty": "HARD",
        "domain": "Compute & Orchestration",
        "subdomain": "Azure Data Factory",
        "question": "How do ADF Storage Event Triggers integrate with Azure Event Grid, how do you handle at-least-once delivery guarantees, and how do you prevent pipeline race conditions during high-volume micro-batch arrivals?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
ADF Storage Event Triggers provide event-driven execution by binding Azure Data Factory directly to **Azure Event Grid** system topics registered on an Azure Storage Account (ADLS Gen2 / Blob Storage).

1. **Architecture & Pub/Sub Flow**:
   - Upstream client writes file to `abfss://landing@dwhstorage.dfs.core.windows.net/orders/year=2026/month=03/orders_part1.json`.
   - Azure Storage fires an internal `Microsoft.Storage.BlobCreated` event into the Event Grid System Topic.
   - Event Grid matches trigger filter rules (`blobPathBeginsWith`, `blobPathEndsWith`, ignore case).
   - Event Grid pushes an HTTPS webhook notification to the ADF service endpoint, instantiating a pipeline execution with metadata parameters (`@trigger().outputs.body.fileName`, `@trigger().outputs.body.folderPath`).

2. **At-Least-Once Delivery & Duplicate Invocations**:
   - Azure Event Grid guarantees **at-least-once delivery**. Transient network timeouts or delayed webhook acknowledgments cause Event Grid to redeliver the exact same `BlobCreated` payload.
   - Consequently, ADF pipelines triggered by storage events **must be idempotent**. Processing must never assume an event executes strictly once.

### Phase 2: Implementation & Production Code Artifacts
Below is the ARM/JSON definition of an ADF Storage Event trigger with prefix/suffix filtering:

```json
{
  "name": "trig_adls_orders_arrival",
  "properties": {
    "type": "BlobEventsTrigger",
    "typeProperties": {
      "blobPathBeginsWith": "raw-landing/blobs/orders/",
      "blobPathEndsWith": ".json.gz",
      "ignoreEmptyBlobs": true,
      "events": [
        "Microsoft.Storage.BlobCreated"
      ],
      "scope": "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/rg-data-prod/providers/Microsoft.Storage/storageAccounts/stlakehouseprod"
    },
    "pipeline": {
      "pipelineReference": {
        "referenceName": "pl_ingest_landing_file",
        "type": "PipelineReference"
      },
      "parameters": {
        "folderPath": "@trigger().outputs.body.folderPath",
        "fileName": "@trigger().outputs.body.fileName"
      }
    }
  }
}
```

### Phase 3: Production Pitfalls, Anti-Patterns & Failure Modes
- **The Recursive Trigger Bomb**: An ADF pipeline triggered by `BlobCreated` writes intermediate transformed Parquet files into the same storage container under the same path prefix. This immediately creates an infinite recursive loop, triggering hundreds of thousands of pipeline executions and running up massive cloud bills within hours.
- **Race Conditions on Multipart / Staged Uploads**: Applications uploading large multi-gigabyte blobs in blocks may cause the blob to appear in the container before the write flush completes, or multiple temporary chunks trigger events. Always specify `ignoreEmptyBlobs: true` and ensure upstream writers write to a `_staging/` prefix and execute an atomic directory rename into the target path.
- **Concurrency Throttling**: When thousands of files land simultaneously, ADF attempts to launch thousands of pipeline runs, quickly exceeding factory-level concurrent pipeline execution quotas (default: 10,000 per factory). Use a queue/batching buffer or transition to Databricks Auto Loader for streaming file ingestion.

### Phase 4: High-Pressure Interview Talking Points
- *Why prefer Auto Loader over ADF Storage Event Triggers for millions of files?* ADF event triggers cost per execution and create pipeline metadata overhead. When file arrival rates exceed 100 files/minute, Databricks Auto Loader (`cloudFiles`) consuming directly from Event Grid / Storage Queue is substantially cheaper and avoids ADF concurrency ceilings."""
    },

    # ── Item 3: ADF Integration Runtime (IR) Architecture & Network Topography ──
    {
        "de_id": "de-prod-adf-ir-topography-003",
        "arch_id": "arch-prod-adf-ir-topography-003",
        "category_de": "ETL & Pipelines",
        "category_arch": "Azure Data Platform Architecture",
        "niche": "Integration Runtime Architecture & Network Boundaries",
        "difficulty": "HARD",
        "domain": "Compute & Orchestration",
        "subdomain": "Azure Data Factory",
        "question": "What is the architectural distinction between Azure IR, Managed VNet IR, and Self-Hosted IR (SHIR), and how do network security boundaries govern their selection?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
The **Integration Runtime (IR)** is the compute infrastructure used by Azure Data Factory to deliver data integration capabilities (Data Movement, Activity Dispatch, and Data Flow execution) across network topologies:

1. **Public Azure IR**:
   - Fully serverless, Microsoft-managed compute pool running in public Azure multi-tenant infrastructure.
   - Best for: Public cloud-to-cloud movement (e.g., ADLS Gen2 to Snowflake, Azure SQL to BigQuery).
   - Security Limitation: Cannot penetrate private corporate networks or storage accounts with firewalls enabled without adding extensive public IP whitelist ranges.

2. **Managed Virtual Network (Managed VNet) IR**:
   - Azure provisions an isolated, dedicated Virtual Network managed entirely by ADF for your factory.
   - Connectivity to private cloud assets (Private Endpoints to Azure SQL, ADLS Gen2, Key Vault) is established via **Managed Private Endpoints**.
   - Security Advantage: Eliminates public IP exposures; all traffic remains on the Azure backbone network; complies with enterprise zero-trust mandates.

3. **Self-Hosted Integration Runtime (SHIR)**:
   - Installed by the customer on dedicated on-premises Windows VMs or Azure IaaS VMs inside private customer VNets.
   - Best for: Connecting to on-prem databases (SQL Server, Oracle, Teradata, SAP, file shares) behind corporate firewalls without opening inbound ports.
   - Security Model: Operates via outbound-only HTTPS (port 443) connectivity to ADF control plane over Azure Relay / Service Bus.

### Phase 2: Implementation & Production Code Artifacts
Below is the Terraform declaration for provisioning a Managed VNet IR with a Managed Private Endpoint to an ADLS Gen2 storage account:

```hcl
resource "azurerm_data_factory_integration_runtime_azure" "managed_vnet_ir" {
  name                    = "ir-managed-vnet-prod"
  data_factory_id         = azurerm_data_factory.adf.id
  location                = "westeurope"
  virtual_network_enabled = true
  time_to_live_min        = 15
}

resource "azurerm_data_factory_managed_private_endpoint" "mpe_adls" {
  name               = "mpe-adls-lakehouse"
  data_factory_id    = azurerm_data_factory.adf.id
  target_resource_id = azurerm_storage_account.lakehouse.id
  subresource_name   = "dfs"
}
```

### Phase 3: Production Pitfalls, Anti-Patterns & Failure Modes
- **Copy Activity Bottlenecking on Azure IR Region**: If Azure IR is set to `AutoResolve` in a multi-region tenant, data moving between Azure East US and West Europe may resolve compute in East US, inducing unnecessary transatlantic network latency and cross-region egress costs. Explicitly bind Azure IR to the target storage region.
- **Managed Private Endpoint Approval Delays**: In strict corporate environments, Managed Private Endpoints created in ADF remain in `Pending` approval state until a Storage Account Administrator approves the private connection in the Azure Portal. CI/CD pipelines deploying new linked services fail until approval is automated via Azure CLI/RBAC.
- **Inbound Firewall Misconception**: Enterprise security teams often attempt to open inbound firewall rules on on-prem perimeter firewalls for SHIR. SHIR never requires inbound ports; all communications are outbound long-polling WebSockets/HTTPS to the ADF gateway.

### Phase 4: High-Pressure Interview Talking Points
- *When must you choose SHIR over Managed VNet IR?* Whenever data sources reside outside Azure without private VNet peering or ExpressRoute (e.g., on-prem legacy AS400, on-prem SAP RFC, or disconnected edge servers).
- *What is the role of TTL in Managed VNet IR?* Time-To-Live (TTL) keeps the underlying Spark clusters warm for Data Flow activities, avoiding the 4–5 minute cluster provisioning delay on successive pipeline executions."""
    },

    # ── Item 4: Self-Hosted IR (SHIR) High Availability & Scale-Out Topography ──
    {
        "de_id": "de-prod-adf-shir-ha-004",
        "arch_id": "arch-prod-adf-shir-ha-004",
        "category_de": "ETL & Pipelines",
        "category_arch": "Azure Data Platform Architecture",
        "niche": "SHIR High Availability & Scale-Out Architecture",
        "difficulty": "HARD",
        "domain": "Compute & Orchestration",
        "subdomain": "Azure Data Factory",
        "question": "How do you architect a multi-node Self-Hosted Integration Runtime (SHIR) cluster for high availability and load balancing, and what happens during primary node network isolation?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
A single-node SHIR is an unacceptable single point of failure (SPOF) for enterprise data operations. If the VM reboots for OS patching or experiences network exhaustion, all dependent pipelines fail immediately.

1. **Logical SHIR Cluster Architecture**:
   - A single logical SHIR registered in ADF can have up to **4 physical gateway nodes** joined via a common authentication key.
   - **Active-Active Processing**: Workloads are dynamically load-balanced across all available online nodes based on resource availability (CPU, available RAM, active concurrent jobs).
   - **Dispatcher Role**: The first installed node assumes the Dispatcher role, coordinating task allocations. If the Dispatcher node fails, ADF transparently fails over the coordinator role to the next healthy node in the cluster within 60–90 seconds.

2. **Network Topography & Intranet Sync**:
   - Nodes within the SHIR cluster communicate with each other over intranet port **8060** (TCP) for credential synchronization and heartbeats.
   - All nodes communicate with ADF cloud endpoints outbound over port **443** (HTTPS/TLS 1.2).

### Phase 2: Implementation & Production Code Artifacts
PowerShell verification script for SHIR multi-node health and automated node concurrency tuning:

```powershell
# Verify SHIR cluster health and node status via Azure CLI / Az PowerShell
$rg = "rg-data-prod"
$adf = "adf-prod-westeurope"
$irName = "shir-onprem-cluster"

$irStatus = Get-AzDataFactoryV2IntegrationRuntime -ResourceGroupName $rg -DataFactoryName $adf -Name $irName -Status

Write-Host "SHIR State: $($irStatus.State)"
Write-Host "Node Count: $($irStatus.Nodes.Count)"

foreach ($node in $irStatus.Nodes) {
    Write-Host "Node: $($node.NodeName) | Status: $($node.Status) | Concurrent Jobs: $($node.ConcurrentJobsLimit)"
    if ($node.Status -ne "Online") {
        Write-Error "ALERT: Node $($node.NodeName) is OFFLINE!"
    }
}

# Scale concurrent job capacity per node (default: based on core count; max: 144)
Update-AzDataFactoryV2IntegrationRuntimeNode `
    -ResourceGroupName $rg `
    -DataFactoryName $adf `
    -IntegrationRuntimeName $irName `
    -NodeName "SHIR-VM-NODE-01" `
    -ConcurrentJobsLimit 64
```

### Phase 3: Production Pitfalls, Anti-Patterns & Failure Modes
- **Intranet Port 8060 Blocked**: Enterprise firewall teams frequently block internal lateral movement between VMs. If port 8060 is closed between SHIR Node 1 and Node 2, credential synchronization fails, preventing node clustering and causing intermittent auth failures during node failover.
- **Version Skew Across Cluster Nodes**: Allowing automatic update on some nodes while disabling it on others produces mixed-version clusters. When ADF pushes jobs containing new features to an older node, activities crash with `SerializationException`. Always coordinate cluster updates synchronously across all nodes.
- **Resource Exhaustion from Unlimited Concurrent Jobs**: Setting `ConcurrentJobsLimit` too high on undersized VMs leads to severe RAM paging and CPU saturation, resulting in missed heartbeats to the ADF cloud service and causing ADF to falsely mark the node as `Offline`.

### Phase 4: High-Pressure Interview Talking Points
- *What is the maximum node count for a SHIR cluster?* 4 physical nodes per logical SHIR unit.
- *How are on-premises database credentials stored in a multi-node SHIR?* Credentials are encrypted using DPAPI (Data Protection API) and synchronized directly between nodes across intranet port 8060. They are never sent in plaintext to the ADF cloud control plane."""
    },

    # ── Item 5: SHIR Disaster Recovery & Hybrid Circuit Breaker Fallback ──
    {
        "de_id": "de-prod-adf-shir-dr-005",
        "arch_id": "arch-prod-adf-shir-dr-005",
        "category_de": "ETL & Pipelines",
        "category_arch": "Azure Data Platform Architecture",
        "niche": "Disaster Recovery & Hybrid Fallback Patterns",
        "difficulty": "ARCHITECT",
        "domain": "Compute & Orchestration",
        "subdomain": "Azure Data Factory",
        "question": "How do you design a resilient disaster recovery and automated fallback architecture in ADF when an on-premises datacenter hosting SHIR goes completely offline?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
When a primary on-premises datacenter loses connectivity (fiber cuts, hardware failure, regional disaster), all pipelines relying strictly on local SHIR nodes fail hard.

1. **Hybrid High-Availability & DR Topography**:
   - Maintain a split-node topology: Two physical SHIR nodes located on-premises, and two secondary SHIR nodes deployed on Azure IaaS VMs connected via ExpressRoute / Site-to-Site VPN.
   - If the on-prem nodes go dark, the cloud-based SHIR nodes continue servicing workloads for any network paths still reachable over VPN.

2. **Automated Dynamic Linked Service Routing (Circuit Breaker)**:
   - If direct on-prem extraction is severed, mission-critical operational reporting pipelines must automatically degrade gracefully:
     - Branch 1 (Primary): Copy directly from on-prem SQL Server via SHIR.
     - Branch 2 (Fallback): If Branch 1 fails, trigger an alert, trip a circuit breaker flag in Azure SQL / Cosmos DB, and switch the linked service dynamically to read from an Azure SQL Database Read Replica or secondary blob landing snapshot.

### Phase 2: Implementation & Production Code Artifacts
Below is the ADF pipeline dynamic routing pattern utilizing parameterized linked services and failure conditional execution:

```json
{
  "name": "pl_resilient_extract_with_fallback",
  "activities": [
    {
      "name": "Extract_Primary_OnPrem",
      "type": "Copy",
      "typeProperties": {
        "source": { "type": "SqlServerSource", "sqlReaderQuery": "SELECT * FROM ERP.Orders WHERE OrderDate = '@{pipeline().parameters.loadDate}'" },
        "sink": { "type": "ParquetSink", "storeSettings": { "type": "AzureBlobFSWriteSettings" } }
      },
      "linkedServiceName": {
        "referenceName": "ls_sqlserver_shir_onprem",
        "type": "LinkedServiceReference"
      },
      "policy": { "timeout": "00:30:00", "retry": 2, "retryIntervalInSeconds": 30 }
    },
    {
      "name": "Extract_Fallback_CloudReplica",
      "type": "Copy",
      "dependsOn": [
        { "activity": "Extract_Primary_OnPrem", "dependencyConditions": ["Failed"] }
      ],
      "typeProperties": {
        "source": { "type": "AzureSqlSource", "sqlReaderQuery": "SELECT * FROM ERP.Orders WHERE OrderDate = '@{pipeline().parameters.loadDate}'" },
        "sink": { "type": "ParquetSink", "storeSettings": { "type": "AzureBlobFSWriteSettings" } }
      },
      "linkedServiceName": {
        "referenceName": "ls_azuresql_managed_ir",
        "type": "LinkedServiceReference"
      }
    },
    {
      "name": "Notify_DR_Activation",
      "type": "WebActivity",
      "dependsOn": [
        { "activity": "Extract_Fallback_CloudReplica", "dependencyConditions": ["Succeeded"] }
      ],
      "typeProperties": {
        "url": "@pipeline().globalParameters.pagerduty_webhook_url",
        "method": "POST",
        "body": { "summary": "WARNING: Primary on-prem SHIR extraction failed. DR cloud replica activated for load date @{pipeline().parameters.loadDate}" }
      }
    }
  ]
}
```

### Phase 3: Production Pitfalls, Anti-Patterns & Failure Modes
- **Stale Cloud Replica Data**: Triggering a fallback to an asynchronous cloud read-replica when the underlying CDC/replication agent has been stalled for hours causes the pipeline to write stale data into the Lakehouse Gold layer without notifying downstream consumers. Always check replica latency (`sys.dm_geo_replication_link_status`) before reading.
- **Pipeline Failure Masking**: When using `Failed` dependency condition branches in ADF, if the fallback branch succeeds, ADF marks the **overall pipeline run as SUCCEEDED**. Downstream alerting systems checking for `Failed` pipeline status will miss the primary outage unless an explicit audit event is fired.

### Phase 4: High-Pressure Interview Talking Points
- *How do you prevent ADF from masking pipeline status when a fallback activity succeeds?* Insert an end-of-pipeline condition that logs an operational incident to Azure Log Analytics or throws a controlled termination (`Fail` activity) if the fallback path was taken."""
    },

    # ── Item 6: ADF Copy Activity Performance Tuning (DIU, Parallelism & Slicing) ──
    {
        "de_id": "de-prod-adf-copy-tuning-006",
        "arch_id": "arch-prod-adf-copy-tuning-006",
        "category_de": "ETL & Pipelines",
        "category_arch": "Azure Data Platform Architecture",
        "niche": "Copy Activity Performance Optimization & DIU",
        "difficulty": "HARD",
        "domain": "Compute & Orchestration",
        "subdomain": "Azure Data Factory",
        "question": "How do you mathematically size and tune Data Integration Units (DIU), parallelCopies, and partition slicing in ADF Copy Activity to achieve maximum gigabyte-per-second throughput without crippling source databases?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
The ADF **Copy Activity** utilizes a distributed execution engine powered by **Data Integration Units (DIUs)**:

1. **What is a DIU?**:
   - A DIU is a metric representing a bundle of compute resources (CPU, memory, network allocation) across Microsoft-managed backend nodes.
   - 1 DIU provides ~100–250 MB/s theoretical throughput depending on source and sink I/O characteristics.
   - Valid DIU values range from 2 to 256 (in increments of powers of 2: 4, 8, 16, 32, 64...).
   - **Cost Formula**: Cost = DIU Count * Execution Time (hours) * Price per DIU-Hour.

2. **The 3 Levers of Copy Performance**:
   - **DIU Allocation**: Allocates total aggregate cluster compute capacity.
   - **`parallelCopies` (Concurrency Limit)**: Determines the maximum number of simultaneous threads the Copy Activity can use to read from the source or write to the sink. Default is `auto` (up to 32); can be manually specified from 1 to 512.
   - **Source Partition Slicing**: Without partition slicing, an SQL source query executes as a single monopolized database thread, rendering high DIUs completely useless. Partition slicing splits the SQL read into multiple concurrent bounded queries.

### Phase 2: Implementation & Production Code Artifacts
Below is an optimized Copy Activity extracting a 100 GB SQL table using Dynamic Range partition slicing:

```json
{
  "name": "Copy_Massive_Fact_Table",
  "type": "Copy",
  "typeProperties": {
    "source": {
      "type": "SqlSource",
      "partitionOption": "DynamicRange",
      "partitionSettings": {
        "partitionColumnName": "TransactionId",
        "partitionUpperBound": "500000000",
        "partitionLowerBound": "1"
      },
      "isolationLevel": "ReadCommitted"
    },
    "sink": {
      "type": "ParquetSink",
      "storeSettings": { "type": "AzureBlobFSWriteSettings" },
      "formatSettings": { "type": "ParquetWriteSettings", "compressionCodec": "snappy" }
    },
    "dataIntegrationUnits": 32,
    "parallelCopies": 16,
    "enableStaging": false
  }
}
```

### Phase 3: Production Pitfalls, Anti-Patterns & Failure Modes
- **The Idle DIU FinOps Trap**: Allocating 128 DIUs to copy a 500 MB file. The copy activity takes 10 seconds to spin up, copies the file in 1 second, and bills for the minimum 1-minute round-up duration at 128 DIUs, burning money for zero throughput benefit. Use 4 DIUs for files under 5 GB.
- **Source Database CPU Exhaustion**: Setting `parallelCopies: 64` against an operational OLTP SQL Server fires 64 simultaneous heavy table scans across partition ranges. This spikes CPU to 100%, causing query timeouts and locking out customer-facing applications.
- **Physical Partition Skew**: Using `PhysicalPartitionsOfTable` when table partitions are wildly unbalanced (e.g., 90% of data in the current month's partition) results in 1 thread doing 90% of the work while the other threads sit idle.

### Phase 4: High-Pressure Interview Talking Points
- *Why did my 64 DIU copy run at the exact same speed as 4 DIU?* Because the source was read using a single monolithic SELECT query without partition slicing (`DynamicRange` or `PhysicalPartitionsOfTable`), forcing ADF to use a single executor thread.
- *How do you choose between DynamicRange and Hash physical partitioning?* DynamicRange is ideal when you have a monotonic indexed integer or date column; Hash is preferred for high-cardinality alphanumeric keys (UUIDs)."""
    },

    # ── Item 7: ADF Copy Staging & PolyBase / COPY INTO Bulk Ingestion ──
    {
        "de_id": "de-prod-adf-copy-staging-007",
        "arch_id": "arch-prod-adf-copy-staging-007",
        "category_de": "ETL & Pipelines",
        "category_arch": "Azure Data Platform Architecture",
        "niche": "Staged Copy Activity & Mass Data Warehouse Loading",
        "difficulty": "HARD",
        "domain": "Compute & Orchestration",
        "subdomain": "Azure Data Factory",
        "question": "How does ADF Copy Activity Staging work under the hood when loading into Azure Synapse Analytics / Fabric DW, and why is direct row-by-row JDBC loading considered a catastrophic anti-pattern?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
Loading massive volumes of data directly into Massively Parallel Processing (MPP) analytical databases (Azure Synapse Dedicated SQL Pools, Snowflake, Microsoft Fabric Warehouse) via row-by-row single-stream JDBC/ODBC inserts is an architectural failure.

1. **Why Direct Insert Fails**:
   - MPP systems utilize distributed compute nodes. Row-by-row JDBC streams must route through a single coordinator/control node, producing severe serialization bottlenecks and logging overhead that caps throughput at 5,000–10,000 rows/second.

2. **Staged Copy Mechanics (PolyBase / COPY INTO)**:
   - ADF bypasses direct JDBC insertion entirely by utilizing **Staging**:
     - Step 1: ADF copies data in parallel from the source (e.g., on-prem Oracle, S3, REST API) and writes it into an intermediate staging container in ADLS Gen2 in compressed Parquet or CSV format.
     - Step 2: ADF issues a high-performance native bulk-load command (`COPY INTO` or PolyBase) directly to the target MPP engine.
     - Step 3: All 60 Synapse compute distributions or Fabric compute nodes read directly from ADLS Gen2 in parallel, scaling ingestion throughput to gigabytes per second.
     - Step 4: ADF automatically cleans up the temporary staging blobs upon successful completion.

### Phase 2: Implementation & Production Code Artifacts
Below is the ADF Copy Activity configuration enabling Staged Copy with `COPY INTO` bulk loading:

```json
{
  "name": "Stage_And_Load_Synapse_DW",
  "type": "Copy",
  "typeProperties": {
    "source": { "type": "OracleSource", "oracleReaderQuery": "SELECT * FROM SALES.TXN_LOG" },
    "sink": {
      "type": "SqlDWSink",
      "allowCopyCommand": true,
      "copyCommandSettings": {
        "defaultValues": [],
        "additionalOptions": { "MAXERRORS": "100" }
      },
      "tableOption": "autoCreate"
    },
    "enableStaging": true,
    "stagingSettings": {
      "linkedServiceName": { "referenceName": "ls_adls_staging", "type": "LinkedServiceReference" },
      "path": "staging-temp/synapse-loads",
      "enableCompression": true
    },
    "dataIntegrationUnits": 64
  }
}
```

### Phase 3: Production Pitfalls, Anti-Patterns & Failure Modes
- **Staging Storage Firewall Denial**: The target Synapse/Fabric engine must have Managed Identity (SMI) or SAS read permissions to the intermediate staging storage account. If the staging ADLS Gen2 has network firewalls enabled and "Allow trusted Microsoft services" is unchecked, the `COPY INTO` command fails with `Cannot open storage file`.
- **Orphaned Staging Files on Pipeline Abort**: If a copy activity is killed mid-transfer or fails before cleanup, temporary staging files can accumulate over months, quietly burning terabytes of storage. Implement an ADLS Gen2 Lifecycle Management Policy to auto-delete blobs in `staging-temp/` older than 3 days.
- **PolyBase Schema Mismatch Crashes**: Older PolyBase implementations fail completely if string column lengths exceed the target table DDL size (e.g., reading 4001 characters into `VARCHAR(4000)`). Modern `COPY INTO` handles auto-truncation and loose parsing better.

### Phase 4: High-Pressure Interview Talking Points
- *Why prefer COPY INTO over legacy PolyBase?* `COPY INTO` does not require external data sources or external file format database credentials, supports non-admin users, handles complex delimiters and string escaping far better, and executes natively over Parquet and CSV without compute bottlenecks."""
    },

    # ── Item 8: ADF Dynamic Content Expressions & Variable Scope Mechanics ──
    {
        "de_id": "de-prod-adf-dynamic-expressions-008",
        "arch_id": "arch-prod-adf-dynamic-expressions-008",
        "category_de": "ETL & Pipelines",
        "category_arch": "Azure Data Platform Architecture",
        "niche": "Dynamic Expressions, String Interpolation & Escaping",
        "difficulty": "HARD",
        "domain": "Compute & Orchestration",
        "subdomain": "Azure Data Factory",
        "question": "How do ADF Dynamic Content expressions resolve during execution, what are the evaluation differences between string interpolation (@{...}) and explicit expressions (@func()), and how do you handle complex JSON escaping?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
ADF expressions are evaluated by the ADF control plane before submitting tasks to the Integration Runtime. Understanding expression evaluation semantics is critical for constructing robust metadata-driven pipelines:

1. **Evaluation Syntaxes**:
   - **Explicit Expression Mode (`@...`)**: When a field starts with `@`, ADF treats the entire string as an evaluated expression.
     - Example: `@concat('adls://lakehouse/', pipeline().parameters.layer, '/', formatDateTime(utcNow(), 'yyyy/MM/dd'))`
   - **String Interpolation Mode (`@{...}`)**: Used when embedding dynamic expressions inside static text.
     - Example: `SELECT * FROM tbl WHERE load_date = '@{pipeline().parameters.targetDate}'`
     - Rule: If you do not prepend `@`, ADF treats the input as a raw literal string unless wrapped in `@{}`.

2. **Function Library Scope**:
   - String functions: `concat`, `substring`, `toLower`, `toUpper`, `split`, `replace`, `trim`.
   - Date functions: `utcnow`, `addDays`, `formatDateTime`, `getPastTime`, `subtractFromTime`.
   - Collection & Logic: `length`, `first`, `last`, `equals`, `greater`, `and`, `or`, `coalesce`, `if`.

### Phase 2: Implementation & Production Code Artifacts
Below is a collection of production dynamic content expressions addressing common real-world orchestration challenges:

```json
{
  "path_expression": "@concat('abfss://raw@lake.dfs.core.windows.net/', pipeline().parameters.sourceSystem, '/', formatDateTime(pipeline().parameters.windowStart, 'yyyy/MM/dd/HH'), '/')",

  "dynamic_sql_query": "@concat('SELECT * FROM ', pipeline().parameters.schema, '.', pipeline().parameters.table, ' WHERE UpdatedAt >= ''', formatDateTime(addHours(utcNow(), -4), 'yyyy-MM-dd HH:mm:ss'), '''')",

  "conditional_environment_resolution": "@if(equals(pipeline().globalParameters.environment, 'prod'), 'https://prod-api.corp.com/v1', 'https://dev-api.corp.internal/v1')",

  "safe_coalesce_fallback": "@coalesce(pipeline().parameters.optionalOverrideDate, formatDateTime(addDays(utcNow(), -1), 'yyyy-MM-dd'))",

  "json_payload_construction": "@json(concat('{\"runId\":\"', pipeline().RunId, '\",\"rowsProcessed\":', string(activity('CopyRaw').output.rowsCopied), '}'))"
}
```

### Phase 3: Production Pitfalls, Anti-Patterns & Failure Modes
- **SQL Quote Escaping Disaster**: In ADF dynamic expressions, single quotes inside single-quoted strings must be escaped using **two single quotes (`''`)**, not backslashes. Forgetting this breaks query generation and causes cryptic syntax errors during pipeline execution.
- **The ForEach Variable Mutation Anti-Pattern**: Attempting to use `SetVariable` inside a `ForEach` activity running in parallel (`isSequential: false`). ADF variables have **pipeline-wide global scope**; parallel loop iterations will overwrite each other's values, inducing catastrophic data corruption and race conditions. Variables inside ForEach must either run sequentially or outputs must be passed directly into downstream activities.
- **Integer Type Coercion Crashes**: Passing string representation into functions expecting numbers. Always use explicit type conversion functions like `@int(activity('LookupCount').output.firstRow.Count)` when performing logical comparisons.

### Phase 4: High-Pressure Interview Talking Points
- *Can you use SetVariable inside a parallel ForEach activity?* Absolutely not. ADF variables are scoped to the pipeline instance, not the loop thread. Modifying a variable inside concurrent iterations causes non-deterministic race conditions.
- *How do you pass dynamic arrays between activities without SetVariable?* Use the direct activity output array reference: `@activity('LookupTables').output.value` directly into the `items` property of the `ForEach` activity."""
    },

    # ── Item 9: ADF Global Parameters & Multi-Environment Configuration ──
    {
        "de_id": "de-prod-adf-global-params-009",
        "arch_id": "arch-prod-adf-global-params-009",
        "category_de": "ETL & Pipelines",
        "category_arch": "Azure Data Platform Architecture",
        "niche": "Global Parameters & Multi-Environment Isolation",
        "difficulty": "MEDIUM",
        "domain": "Compute & Orchestration",
        "subdomain": "Azure Data Factory",
        "question": "How do ADF Global Parameters enable enterprise environment portability between Dev, Staging, and Prod without modifying pipeline code during CI/CD releases?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
In multi-environment data engineering (Dev -> QA -> Staging -> Prod), hardcoding environment identifiers, Key Vault names, endpoints, or storage accounts inside individual pipeline parameters is an enterprise anti-pattern.

1. **What are Global Parameters?**:
   - Factory-level constants accessible by any pipeline within the factory via the `@pipeline().globalParameters.<ParameterName>` syntax.
   - Decouples pipeline logic from environment topology: A pipeline simply references `@pipeline().globalParameters.LakehouseStorageUrl`.
   - In Dev, the factory's global parameter points to `abfss://lakehouse@devstorage.dfs.core.windows.net/`.
   - In Prod, the factory's global parameter points to `abfss://lakehouse@prodstorage.dfs.core.windows.net/`.

2. **Integration with CI/CD & ARM Templates**:
   - During the automated build and release process, global parameters are exported as parameters in the ARM deployment template (`ARMTemplateForFactory.json`).
   - The release pipeline overrides these values per deployment target without touching a single pipeline JSON file.

### Phase 2: Implementation & Production Code Artifacts
Below is the ADF Factory global parameter JSON specification and how it is overridden via Azure CLI during a release:

```json
{
  "name": "adf-corp-prod",
  "properties": {
    "globalParameters": {
      "Environment": { "type": "string", "value": "prod" },
      "KeyVaultName": { "type": "string", "value": "kv-lakehouse-prod" },
      "LakehouseStorageAccount": { "type": "string", "value": "stlakehouseprod" },
      "MaxParallelismLimit": { "type": "int", "value": 32 }
    }
  }
}
```

```bash
# Azure DevOps / GitHub Actions Release Step: Overriding Global Parameters via ARM Deployment
az deployment group create \
  --resource-group rg-lakehouse-prod \
  --name "adf-deployment-$(date +%Y%m%d%H%M%S)" \
  --template-file ./ARMTemplateForFactory.json \
  --parameters ./ARMTemplateParametersForFactory.json \
  --parameters \
    factoryName="adf-corp-prod" \
    Environment="prod" \
    KeyVaultName="kv-lakehouse-prod" \
    LakehouseStorageAccount="stlakehouseprod" \
    MaxParallelismLimit=32
```

### Phase 3: Production Pitfalls, Anti-Patterns & Failure Modes
- **The "Include in ARM Template" Checkbox Trap**: In the ADF Studio UI, under *Manage -> Global parameters*, there is a toggle switch: *"Include in ARM template"*. If this toggle is unchecked, global parameters will **not be exported** into `ARMTemplateForFactory.json`. During automated deployments, the target environment either fails to deploy or silently preserves stale dev parameter values.
- **Circular Secret Dependency**: Trying to store secret values directly inside Global Parameters. Global Parameters are plain-text strings visible to any user with Read access to the ADF resource. Secrets must **always** be stored in Azure Key Vault, using the Global Parameter solely to pass the Key Vault URI or name.

### Phase 4: High-Pressure Interview Talking Points
- *Where should environment names and Key Vault URLs live in ADF?* Inside factory-level Global Parameters, parameterized through ARM templates during CI/CD.
- *How do pipelines reference Global Parameters?* `@pipeline().globalParameters.ParamName`."""
    },

    # ── Item 10: ADF Error Handling & Dead Letter Queue (DLQ) Patterns ──
    {
        "de_id": "de-prod-adf-error-handling-010",
        "arch_id": "arch-prod-adf-error-handling-010",
        "category_de": "ETL & Pipelines",
        "category_arch": "Azure Data Platform Architecture",
        "niche": "Pipeline Error Handling & Dead Letter Queues",
        "difficulty": "HARD",
        "domain": "Compute & Orchestration",
        "subdomain": "Azure Data Factory",
        "question": "How do you architect resilient error handling in ADF using activity dependencies (Succeeded, Failed, Skipped, Completed) and implement an automated Dead Letter Queue (DLQ) pattern for faulty records?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
Enterprise data integration requires deterministic fault tolerance. Unhandled activity failures crash entire execution chains, leave partial staging tables orphaned, and prevent failure observability.

1. **Activity Dependency State Matrix**:
   - `Succeeded`: Executes only if the upstream activity finishes with code 0 / Success.
   - `Failed`: Executes only if the upstream activity throws an error, timeouts, or fails health checks (used for error branching and DLQ capture).
   - `Completed`: Executes regardless of whether the upstream activity succeeded or failed (used for mandatory cleanup: stopping compute, dropping temporary tables).
   - `Skipped`: Executes if the upstream activity was never evaluated because its own dependencies were not met.

2. **The Dead Letter Queue (DLQ) / Quarantine Pattern**:
   - Ingestion pipelines should not fail an entire 1,000,000-row batch because 3 records violate schema constraints or have malformed JSON.
   - The pipeline routes bad files or rejected rows into a dedicated `dead-letter/` container in ADLS Gen2, captures execution metadata (RunId, ErrorMessage, SourceFilePath), fires an operational telemetry event, and allows the remaining 999,997 records to proceed into the Silver Lakehouse.

### Phase 2: Implementation & Production Code Artifacts
Below is the structural JSON of a pipeline implementing automated error capture, DLQ quarantine copying, and failure notification:

```json
{
  "name": "pl_ingest_with_deadletter_branching",
  "activities": [
    {
      "name": "Execute_Data_Transform",
      "type": "ExecuteDataFlow",
      "typeProperties": {
        "dataflow": { "referenceName": "df_clean_orders", "type": "DataFlowReference" }
      },
      "policy": { "timeout": "01:00:00", "retry": 1, "retryIntervalInSeconds": 30 }
    },
    {
      "name": "Archive_To_Gold",
      "type": "Copy",
      "dependsOn": [
        { "activity": "Execute_Data_Transform", "dependencyConditions": ["Succeeded"] }
      ],
      "typeProperties": {
        "source": { "type": "ParquetSource" },
        "sink": { "type": "ParquetSink" }
      }
    },
    {
      "name": "Quarantine_Bad_Data_To_DLQ",
      "type": "Copy",
      "dependsOn": [
        { "activity": "Execute_Data_Transform", "dependencyConditions": ["Failed"] }
      ],
      "typeProperties": {
        "source": { "type": "BinarySource" },
        "sink": {
          "type": "BinarySink",
          "storeSettings": {
            "type": "AzureBlobFSWriteSettings",
            "copyBehavior": "PreserveHierarchy"
          }
        }
      }
    },
    {
      "name": "Log_Failure_Audit_Metadata",
      "type": "SqlServerStoredProcedure",
      "dependsOn": [
        { "activity": "Quarantine_Bad_Data_To_DLQ", "dependencyConditions": ["Succeeded"] }
      ],
      "typeProperties": {
        "storedProcedureName": "audit.usp_LogPipelineFailure",
        "storedProcedureParameters": {
          "PipelineRunId": { "value": "@pipeline().RunId", "type": "String" },
          "PipelineName": { "value": "@pipeline().Pipeline", "type": "String" },
          "ErrorMessage": { "value": "@activity('Execute_Data_Transform').error.message", "type": "String" }
        }
      }
    }
  ]
}
```

### Phase 3: Production Pitfalls, Anti-Patterns & Failure Modes
- **The "Succeeded" Pipeline Trap**: If an activity fails and routes into a `Failed` dependency branch that completes successfully, ADF marks the **top-level pipeline status as SUCCEEDED**. Downstream monitoring systems like Azure Monitor alerts configured for `Status == 'Failed'` will NOT trigger! To preserve pipeline failure status, the error branch must end with an explicit **Fail Activity** (`type: "Fail"`, error code: 500).
- **Overwriting DLQ Files**: When moving bad files to the quarantine zone, if multiple failed runs write to the exact same static path (`/quarantine/bad_file.json`), subsequent runs will overwrite earlier uninvestigated bad records. Always append dynamic run IDs or timestamps to the destination quarantine path (`/quarantine/@{pipeline().RunId}/`).

### Phase 4: High-Pressure Interview Talking Points
- *How do you intentionally fail a pipeline after completing an error handling branch?* Use the native ADF `Fail` activity, configuring a custom error code and dynamic error message extracted from the failed upstream activity (`@activity('SourceActivity').error.message`).
- *What is the difference between Completed and Succeeded conditions?* Completed runs regardless of success or failure (mandatory for cleanup); Succeeded requires zero errors."""
    },

    # ── Item 11: ADF Web Activity Alerting & Teams/Slack Integration ──
    {
        "de_id": "de-prod-adf-web-alerting-011",
        "arch_id": "arch-prod-adf-web-alerting-011",
        "category_de": "ETL & Pipelines",
        "category_arch": "Azure Data Platform Architecture",
        "niche": "Automated Alerting & Incident Webhooks",
        "difficulty": "MEDIUM",
        "domain": "Compute & Orchestration",
        "subdomain": "Azure Data Factory",
        "question": "How do you configure an ADF Web Activity to dispatch rich Adaptive Cards to Microsoft Teams or Slack incoming webhooks with dynamic pipeline failure metadata?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
Relying solely on delayed email alerts for production pipeline failures leads to prolonged mean time to recovery (MTTR). Real-time operational alerting requires pushing actionable incident payloads directly into engineering collaboration channels (Microsoft Teams or Slack).

1. **Web Activity Architecture**:
   - The ADF **Web Activity** can issue arbitrary HTTP/REST requests (POST, GET, PUT) against external webhooks.
   - When an activity fails, the Web Activity extracts runtime execution parameters: `@pipeline().Pipeline`, `@pipeline().RunId`, `@pipeline().TriggerTime`, and the root exception `@activity('TargetActivity').error.message`.
   - The payload is formatted as a Microsoft Teams **Adaptive Card JSON** or Slack **Block Kit JSON** and POSTed to an Incoming Webhook URI.

### Phase 2: Implementation & Production Code Artifacts
Below is the ADF Web Activity configuration dispatching a Microsoft Teams Adaptive Card on activity failure:

```json
{
  "name": "Send_Teams_Incident_Card",
  "type": "WebActivity",
  "dependsOn": [
    { "activity": "Copy_Sales_Transactions", "dependencyConditions": ["Failed"] }
  ],
  "typeProperties": {
    "url": "@pipeline().globalParameters.teams_incident_webhook",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json"
    },
    "body": {
      "type": "message",
      "attachments": [
        {
          "contentType": "application/vnd.microsoft.card.adaptive",
          "content": {
            "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
            "type": "AdaptiveCard",
            "version": "1.4",
            "body": [
              {
                "type": "TextBlock",
                "text": "Production Pipeline Failure Alert",
                "weight": "Bolder",
                "size": "Medium",
                "color": "Attention"
              },
              {
                "type": "FactSet",
                "facts": [
                  { "title": "Pipeline:", "value": "@{pipeline().Pipeline}" },
                  { "title": "Data Factory:", "value": "@{pipeline().DataFactory}" },
                  { "title": "Run ID:", "value": "@{pipeline().RunId}" },
                  { "title": "Failed Activity:", "value": "Copy_Sales_Transactions" },
                  { "title": "Error Message:", "value": "@{activity('Copy_Sales_Transactions').error.message}" },
                  { "title": "Execution Time:", "value": "@{pipeline().TriggerTime}" }
                ]
              }
            ],
            "actions": [
              {
                "type": "Action.OpenUrl",
                "title": "Open Run in Azure Portal",
                "url": "@concat('https://adf.azure.com/monitoring/pipelineruns/', pipeline().RunId, '?factory=/subscriptions/', pipeline().globalParameters.subscriptionId, '/resourceGroups/', pipeline().globalParameters.resourceGroup, '/providers/Microsoft.DataFactory/factories/', pipeline().DataFactory)"
              }
            ]
          }
        }
      ]
    }
  }
}
```

### Phase 3: Production Pitfalls, Anti-Patterns & Failure Modes
- **Payload String Escaping in Error Messages**: Upstream database error messages often contain raw unescaped double quotes (`"`), newlines (`\n`), or backslashes (`\`). Directly interpolating `@activity('...').error.message` into a JSON body without escaping can generate invalid JSON syntax, causing the Web Activity itself to crash with HTTP 400 Bad Request and swallowing the alert! Use string sanitization: `@replace(replace(activity('...').error.message, '"', '\\"'), '\n', ' ')`.
- **Exposing Webhook Keys in Plaintext**: Hardcoding incoming webhook URLs inside pipeline definitions exposes the channel security token. Always retrieve the webhook URL securely via Azure Key Vault using a **Web Activity + Key Vault REST API** or pass it through an AKV-linked service.

### Phase 4: High-Pressure Interview Talking Points
- *What happens if the Web Activity itself fails?* The pipeline will throw an error on the alert step. To safeguard against this, operational teams configure an Azure Monitor Metric Alert on `PipelineFailedRuns > 0` as a global fallback safety net."""
    },

    # ── Item 12: ADF Parent-Child Orchestration & Pipeline Parameter Passing ──
    {
        "de_id": "de-prod-adf-parent-child-012",
        "arch_id": "arch-prod-adf-parent-child-012",
        "category_de": "ETL & Pipelines",
        "category_arch": "Azure Data Platform Architecture",
        "niche": "Parent-Child Orchestration & Dynamic Invocation",
        "difficulty": "HARD",
        "domain": "Compute & Orchestration",
        "subdomain": "Azure Data Factory",
        "question": "How do you design a scalable Parent-Child orchestration framework in ADF using Execute Pipeline activities, and what are the concurrency and parameter-passing tradeoffs between synchronous (WaitOnCompletion) and asynchronous execution?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
Monolithic ADF pipelines containing 40+ sequential activities are brittle, impossible to test in isolation, and violate software engineering modularity.

1. **Parent-Child Architecture**:
   - **Parent (Master Controller)**: Responsible for reading orchestration control tables (metadata catalogs), determining batch slices, evaluating dependencies, and dynamically spawning child worker pipelines.
   - **Child (Worker Pipeline)**: Reusable, standardized, single-responsibility pipelines (e.g., `pl_generic_rdbms_to_bronze_lakehouse`) that accept parameterized inputs (`source_schema`, `source_table`, `watermark_column`, `target_path`).

2. **Synchronous vs Asynchronous Invocation (`waitOnCompletion`)**:
   - **Synchronous (`waitOnCompletion: true`)**:
     - The parent activity halts and waits until the child pipeline completes before moving to the next task.
     - Advantage: Parent can inspect child execution status, capture return values, and maintain strict chronological dependency.
     - Disadvantage: Consumes parent pipeline execution time and counts toward active pipeline concurrency limits.
   - **Asynchronous (`waitOnCompletion: false`)**:
     - The parent fires the child execution via the ADF REST control plane and immediately advances to the next activity.
     - Advantage: Enables high-throughput fire-and-forget patterns.
     - Disadvantage: Parent cannot capture downstream errors or enforce end-of-batch synchronization without polling.

### Phase 2: Implementation & Production Code Artifacts
Below is the parent pipeline configuration iterating over an array of tables and calling a child pipeline with parameter passing:

```json
{
  "name": "pl_master_orchestrator",
  "activities": [
    {
      "name": "Lookup_Active_Tables",
      "type": "Lookup",
      "typeProperties": {
        "source": {
          "type": "SqlSource",
          "sqlReaderQuery": "SELECT TableSchema, TableName, WatermarkCol FROM control.IngestionConfig WHERE IsActive = 1"
        },
        "firstRowOnly": false
      }
    },
    {
      "name": "ForEach_Table",
      "type": "ForEach",
      "dependsOn": [{ "activity": "Lookup_Active_Tables", "dependencyConditions": ["Succeeded"] }],
      "typeProperties": {
        "isSequential": false,
        "batchCount": 8,
        "items": "@activity('Lookup_Active_Tables').output.value",
        "activities": [
          {
            "name": "Invoke_Generic_Ingest_Child",
            "type": "ExecutePipeline",
            "typeProperties": {
              "pipeline": { "referenceName": "pl_child_table_ingest", "type": "PipelineReference" },
              "waitOnCompletion": true,
              "parameters": {
                "SchemaName": "@item().TableSchema",
                "TableName": "@item().TableName",
                "WatermarkColumn": "@item().WatermarkCol",
                "BatchDate": "@pipeline().parameters.masterBatchDate"
              }
            }
          }
        ]
      }
    }
  ]
}
```

### Phase 3: Production Pitfalls, Anti-Patterns & Failure Modes
- **Child Pipeline Concurrency Exhaustion**: If the parent loop processes 100 tables and executes child pipelines with `waitOnCompletion: true` at a high concurrency, each active child pipeline consumes a concurrent pipeline slot in the Azure subscription. Azure Data Factory enforces a strict limit of **10,000 concurrent pipeline runs**.
- **Child Pipeline Failure Not Propagating**: In older ADF patterns, if a child pipeline failed when `waitOnCompletion: false` was set, the parent marked itself as Succeeded. Downstream teams assumed data was loaded when the child was completely broken. Always use `waitOnCompletion: true` unless implementing external state queue polling.

### Phase 4: High-Pressure Interview Talking Points
- *Can a child pipeline return values back to the parent pipeline?* Yes, modern ADF supports the **Set Variable / Pipeline Return Value** feature where a child pipeline defines pipeline return values (`@pipeline().parameters`) that the parent accesses via `@activity('ExecuteChildPipeline').output.pipelineReturnValue.MyKey`."""
    },

    # ── Item 13: ADF ForEach Activity Parallelism & Batch Processing Guardrails ──
    {
        "de_id": "de-prod-adf-foreach-guardrails-013",
        "arch_id": "arch-prod-adf-foreach-guardrails-013",
        "category_de": "ETL & Pipelines",
        "category_arch": "Azure Data Platform Architecture",
        "niche": "ForEach Concurrency Limits & Throttling",
        "difficulty": "HARD",
        "domain": "Compute & Orchestration",
        "subdomain": "Azure Data Factory",
        "question": "What are the physical runtime limitations of the ADF ForEach activity (batchCount, array size, variable scoping), and how do you process arrays exceeding 5,000 items?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
The **ForEach** activity is ADF's primary iteration control structure, but it has strict physical boundary constraints designed to protect control plane memory:

1. **Physical Boundary Limits**:
   - **Maximum Array Item Count**: A single ForEach activity can only iterate over an array containing at most **5,000 items**. If an upstream Lookup activity returns 5,001 items, the ForEach activity fails instantly with `InvalidActivityValidation`.
   - **Concurrency Bounds (`batchCount`)**:
     - `isSequential: false`: Runs iterations in parallel. `batchCount` can be tuned from 1 to **50** (maximum concurrent iterations).
     - `isSequential: true`: Forces strict sequential 1-by-1 execution (batchCount is ignored).
   - **Variable Mutation Prohibition**: As covered in Item 8, `SetVariable` inside a parallel ForEach creates catastrophic race conditions.

2. **Handling Large Arrays (> 5,000 Items)**:
   - When processing tens of thousands of objects (e.g., migrating 50,000 tenant databases or files):
     - **Batch Chunking via SQL**: The upstream query partitions data into chunks of 2,000 rows using `NTILE()` or pagination (`OFFSET...FETCH NEXT`).
     - **Recursive Pipeline Invocation**: A master pipeline processes 1,000 items, and calls itself recursively passing the remaining offset token until completion.
     - **Offload to Spark**: When entity counts exceed 5,000, offload the iteration to a PySpark notebook on Databricks using distributed parallel processing (`ThreadPoolExecutor` or distributed DataFrames).

### Phase 2: Implementation & Production Code Artifacts
Below is the pagination query pattern used in an upstream Lookup activity to feed ForEach safely in chunks:

```sql
-- Upstream SQL Lookup Query for Chunked Processing
DECLARE @BatchNumber INT = 1;
DECLARE @PageSize INT = 2500;

SELECT 
    EntityId,
    SourcePath,
    TargetPath
FROM control.EntityRegistry
WHERE ProcessingStatus = 'PENDING'
ORDER BY EntityId
OFFSET (@BatchNumber - 1) * @PageSize ROWS
FETCH NEXT @PageSize ROWS ONLY;
```

```json
{
  "name": "ForEach_Chunked_Entities",
  "type": "ForEach",
  "typeProperties": {
    "isSequential": false,
    "batchCount": 25,
    "items": "@activity('Lookup_Paginated_Entities').output.value",
    "activities": [
      {
        "name": "Process_Single_Entity",
        "type": "Copy",
        "typeProperties": {
          "source": { "type": "BlobSource" },
          "sink": { "type": "ParquetSink" }
        }
      }
    ]
  }
}
```

### Phase 3: Production Pitfalls, Anti-Patterns & Failure Modes
- **Setting batchCount: 50 on Shared Connection Pools**: Configuring maximum parallelism (`batchCount: 50`) when connecting to on-prem databases via a single SHIR node exhausts the SHIR thread pool and exceeds the source database's `max_connections`, leading to connection refusal errors (`TCP 10054: Connection reset by peer`). Always size `batchCount` to 10–20 unless compute capacity has been benchmarked.
- **Lookup Activity 5,000 Row / 4 MB Ceiling**: The ADF `Lookup` activity itself has a hard ceiling of **5,000 rows** and **4 MB payload size**. If the query returns 5,001 rows, ADF truncates the output or throws an error.

### Phase 4: High-Pressure Interview Talking Points
- *What is the maximum concurrency for ForEach in ADF?* 50 concurrent threads (`batchCount: 50`).
- *How do you iterate over 20,000 files in ADF?* You don't use ForEach over 20,000 items; you either paginate via SQL control tables, pass a wildcard folder path to a single Copy Activity, or dispatch the task to a Databricks PySpark notebook."""
    },

    # ── Item 14: ADF CI/CD Git Integration & The adf_publish Mystery ──
    {
        "de_id": "de-prod-adf-git-publish-014",
        "arch_id": "arch-prod-adf-git-publish-014",
        "category_de": "ETL & Pipelines",
        "category_arch": "Azure Data Platform Architecture",
        "niche": "ADF Git Integration & adf_publish Lifecycle",
        "difficulty": "ARCHITECT",
        "domain": "Compute & Orchestration",
        "subdomain": "Azure Data Factory",
        "question": "How does ADF Git integration work under the hood, why does the adf_publish branch exist, and what causes the notorious 'Publish Drift' between main and deployed ARM templates?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
ADF provides native Git integration (GitHub or Azure Repos), but its deployment model diverges sharply from standard code repositories:

1. **Collaboration Branch (`main`) vs Deployment Branch (`adf_publish`)**:
   - **Collaboration Branch (`main` / `dev`)**:
     - Contains individual JSON definitions for every factory asset (`pipeline/`, `dataset/`, `linkedService/`, `trigger/`).
     - Engineers create feature branches (`feature/add-orders`), commit code, and submit Pull Requests to `main`.
     - **Crucial Fact**: The JSON files in `main` are **NOT** valid Azure Resource Manager (ARM) templates! They are raw entity definitions that Azure Resource Manager cannot deploy directly.
   - **Deployment Branch (`adf_publish`)**:
     - When an engineer clicks **Publish** in the ADF Studio UI from the collaboration branch, the ADF portal client-side web application compiles all individual entity JSON files into two compiled artifacts:
       1. `ARMTemplateForFactory.json` (the master ARM template)
       2. `ARMTemplateParametersForFactory.json` (parameterized environment overrides)
     - These compiled templates are committed directly to the `adf_publish` branch.

2. **Publish Drift & Automated Build Packaging**:
   - **The Anti-Pattern (Manual Publish)**: If deployment relies on manual UI publishing, an engineer might merge code into `main` via PR but forget to hit the "Publish" button. The `adf_publish` branch is now stale. When the CI/CD release pipeline triggers, it deploys old code!
   - **The Enterprise Solution (Automated npm build package)**: Modern enterprises bypass the manual UI "Publish" button completely by executing the official Microsoft `@microsoft/azure-data-factory-utilities` npm package inside their CI pipeline to compile ARM templates directly from `main`.

### Phase 2: Implementation & Production Code Artifacts
Below is an Azure DevOps pipeline stage compiling ADF ARM templates directly from the `main` branch without requiring manual UI publishing:

```yaml
# azure-pipelines-adf-ci.yml: Automated ADF ARM Compilation
trigger:
  branches:
    include:
      - main

pool:
  vmImage: 'ubuntu-latest'

steps:
  - task: NodeTool@0
    inputs:
      versionSpec: '18.x'
    displayName: 'Install Node.js'

  - script: |
      npm install @microsoft/azure-data-factory-utilities
      node -e "
        const { exportAdf } = require('@microsoft/azure-data-factory-utilities');
        exportAdf('.', '$(System.DefaultWorkingDirectory)', '$(Build.ArtifactStagingDirectory)/ArmTemplates')
          .then(() => console.log('ARM Template Generation Succeeded!'))
          .catch(err => { console.error(err); process.exit(1); });
      "
    displayName: 'Validate and Build ADF ARM Templates via npm'

  - task: PublishBuildArtifacts@1
    inputs:
      PathtoPublish: '$(Build.ArtifactStagingDirectory)/ArmTemplates'
      ArtifactName: 'adf-arm-package'
    displayName: 'Publish ARM Artifacts for CD Release'
```

### Phase 3: Production Pitfalls, Anti-Patterns & Failure Modes
- **Directly Editing JSON in adf_publish**: Manually editing or cherry-picking commits into `adf_publish`. The very next time someone clicks Publish from the UI, ADF overwrites the entire branch, completely erasing all manual commits.
- **Merge Conflicts in Master ARM Templates**: Attempting to resolve Git merge conflicts on `ARMTemplateForFactory.json`. Never merge `adf_publish`; always resolve conflicts on the individual entity files in feature branches against `main`.

### Phase 4: High-Pressure Interview Talking Points
- *Why should enterprise teams abandon manual UI publishing?* Because manual publishing depends on human action in the browser, creates drift between `main` and production, and prevents fully automated GitOps delivery.
- *What tool compiles ADF JSON files into ARM templates headlessly?* The official `@microsoft/azure-data-factory-utilities` npm package."""
    },

    # ── Item 15: ADF Automated Deployment via DevOps & Pre/Post Trigger Scripts ──
    {
        "de_id": "de-prod-adf-devops-deployment-015",
        "arch_id": "arch-prod-adf-devops-deployment-015",
        "category_de": "ETL & Pipelines",
        "category_arch": "Azure Data Platform Architecture",
        "niche": "Automated ARM Deployments & Trigger Management",
        "difficulty": "ARCHITECT",
        "domain": "Compute & Orchestration",
        "subdomain": "Azure Data Factory",
        "question": "Why is it mandatory to stop active triggers before deploying ADF ARM templates in CI/CD, and what is the exact execution sequence of pre-deployment and post-deployment automation scripts?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
Deploying updated ARM templates to a live production Azure Data Factory while triggers are running is one of the most common causes of production outages in cloud data engineering:

1. **The Live Trigger Mutation Hazard**:
   - Azure Resource Manager deployments are non-atomic across individual sub-resources.
   - If an active Trigger is referencing a Pipeline or Dataset whose definition is being modified during ARM template overwrites, the trigger may fire against an incomplete, half-deployed entity.
   - Furthermore, modifying an **active** trigger definition directly through ARM templates causes the Azure Resource Provider to return `409 Conflict: Cannot update active trigger`.

2. **The 3-Stage Deployment Lifecycle**:
   - **Stage 1 (Pre-Deployment)**: Identify all currently active triggers in the target factory, record their state, and issue a forceful stop (`Stop-AzDataFactoryV2Trigger`). Wait for running instances to drain.
   - **Stage 2 (ARM Deployment)**: Execute the incremental ARM template deployment (`az deployment group create`), updating pipelines, datasets, linked services, and triggers.
   - **Stage 3 (Post-Deployment)**: Clean up deleted resources (assets deleted from Git that still linger in the live factory), and restart only the triggers that were active prior to deployment.

### Phase 2: Implementation & Production Code Artifacts
Below is the battle-tested PowerShell pre/post deployment script pattern recommended for Azure DevOps or GitHub Actions:

```powershell
# PrePostDeploymentScript.ps1
param (
    [parameter(Mandatory = $true)] [string] $ResourceGroupName,
    [parameter(Mandatory = $true)] [string] $DataFactoryName,
    [parameter(Mandatory = $true)] [ValidateSet("PreDeployment", "PostDeployment")] [string] $Stage
)

if ($Stage -eq "PreDeployment") {
    Write-Host "--- STAGE 1: Pre-Deployment - Stopping Triggers in $DataFactoryName ---"
    $triggers = Get-AzDataFactoryV2Trigger -ResourceGroupName $ResourceGroupName -DataFactoryName $DataFactoryName
    
    # Save active trigger list to disk for post-deployment restart
    $activeTriggers = $triggers | Where-Object { $_.RuntimeState -eq "Started" }
    $activeTriggers | Select-Object -ExpandProperty Name | Out-File -FilePath "./active_triggers.txt"
    
    foreach ($trig in $activeTriggers) {
        Write-Host "Stopping trigger: $($trig.Name)"
        Stop-AzDataFactoryV2Trigger -ResourceGroupName $ResourceGroupName -DataFactoryName $DataFactoryName -Name $trig.Name -Force
    }
}
elseif ($Stage -eq "PostDeployment") {
    Write-Host "--- STAGE 3: Post-Deployment - Restarting Triggers in $DataFactoryName ---"
    if (Test-Path "./active_triggers.txt") {
        $triggerNames = Get-Content "./active_triggers.txt"
        foreach ($name in $triggerNames) {
            if ($name.Trim() -ne "") {
                Write-Host "Starting trigger: $name"
                Start-AzDataFactoryV2Trigger -ResourceGroupName $ResourceGroupName -DataFactoryName $DataFactoryName -Name $name -Force
            }
        }
    }
}
```

### Phase 3: Production Pitfalls, Anti-Patterns & Failure Modes
- **The 'Zombie Resource' Accumulation Bug**: When an engineer deletes an obsolete pipeline in Git, standard ARM template deployments in `Incremental` mode **do NOT delete** the resource from the target factory! Over time, production factories accumulate hundreds of orphaned, dead pipelines. CI/CD pipelines must include a post-deployment deletion loop that compares live factory assets against the ARM template and explicitly issues `Remove-AzDataFactoryV2Pipeline`.
- **Restarting Triggers That Were Intentionally Paused**: Blindly running `Start-AzDataFactoryV2Trigger` on all triggers in the factory after deployment will activate triggers that were disabled by operations for maintenance. Always capture the pre-deployment state and only re-enable triggers that were actively running before deployment.

### Phase 4: High-Pressure Interview Talking Points
- *Why does ARM template deployment fail if triggers aren't stopped?* The ADF resource provider prohibits altering pipelines that are actively referenced by running triggers, throwing HTTP 409 Conflict.
- *What is the difference between ARM Incremental and Complete mode for ADF?* Incremental mode does not delete resources removed from Git; Complete mode deletes everything not in the template but is unsupported for many child ADF resource types. Hence, a custom deletion script is required."""
    },

    # ── Item 16: Spark Notebook Modular Design Patterns ──
    {
        "de_id": "de-prod-spark-modular-design-016",
        "arch_id": "arch-prod-spark-modular-design-016",
        "category_de": "SPARK_PYSPARK",
        "category_arch": "Databricks Lakehouse Architecture",
        "niche": "Modular Pipeline Architecture & Code Separation",
        "difficulty": "HARD",
        "domain": "Data Lakehouse & Architecture",
        "subdomain": "Spark Notebook Best Practices",
        "question": "How do you decompose monolithic 1,000-line Databricks notebooks into enterprise-grade modular architectures, and what are the trade-offs between shared namespace (%run) vs subprocess execution (dbutils.notebook.run)?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
Monolithic Databricks notebooks where ingestion, cleansing, transformation, business logic, and reporting queries are concatenated into a single notebook represent a severe maintenance failure: impossible to unit-test, prone to global state collisions, and unmaintainable across large teams.

1. **Separation of Concerns Directory Hierarchy**:
   ```
   lakehouse_pipeline/
   |-- orchestrator.py             # Master entrypoint; workflow coordination
   |-- config/
   |   `-- config_loader.py       # Reads widgets, Key Vault, env metadata
   |-- core/
   |   |-- transforms.py          # Pure PySpark transformations (testable)
   |   `-- quality_checks.py      # Schema and assertion validation
   |-- io/
   |   |-- readers.py             # Bronze ingestion & Auto Loader logic
   |   `-- writers.py             # Delta MERGE and idempotent writes
   `-- utils/
       |-- retry_decorator.py     # Exponential backoff wrappers
       `-- structured_logging.py  # JSON audit logger
   ```

2. **`%run` vs `dbutils.notebook.run()` Execution Semantics**:
   - **`%run ./path/to/module` (In-Process Direct Inclusion)**:
     - Directly injects code from the target notebook into the caller's active Python namespace.
     - **Shared Scope**: All variables, functions, and DataFrame references are shared. Memory footprint is unified.
     - Best for: Loading utility libraries, functions, and class definitions into an interactive session.
   - **`dbutils.notebook.run("path", timeout_seconds, arguments)` (Isolated Subprocess)**:
     - Dispatches the child notebook as an isolated ephemeral execution.
     - **Isolated Scope**: Variables do NOT bleed between caller and child.
     - **Return Value**: Child can return a serialized string (up to 5 MB) via `dbutils.notebook.exit("json_string")`.
     - Best for: Parallel batch orchestration, distinct transactional stages, and failure isolation.

### Phase 2: Implementation & Production Code Artifacts
Below is the orchestrator pattern executing child notebook stages in parallel with thread pools and capturing typed exit metadata:

```python
# orchestrator.py: Production Parallel Subprocess Execution
from concurrent.futures import ThreadPoolExecutor, as_completed
import json

tables_to_process = ["fact_sales", "fact_inventory", "dim_customer"]
execution_date = "2026-03-01"

def execute_stage(table_name: str) -> dict:
    result_str = dbutils.notebook.run(
        "../io/process_single_table",
        timeout_seconds=3600,
        arguments={
            "table_name": table_name,
            "load_date": execution_date,
            "env": "prod"
        }
    )
    return json.loads(result_str)

results = {}
with ThreadPoolExecutor(max_workers=3) as executor:
    futures = {executor.submit(execute_stage, tbl): tbl for tbl in tables_to_process}
    for future in as_completed(futures):
        tbl = futures[future]
        try:
            results[tbl] = future.result()
            print(f"Stage Completed: {tbl} -> Rows Processed: {results[tbl].get('rows_written')}")
        except Exception as e:
            print(f"Stage FAILED: {tbl} -> Error: {str(e)}")
            raise e
```

### Phase 3: Production Pitfalls, Anti-Patterns & Failure Modes
- **The 5 MB Exit Payload Crash**: `dbutils.notebook.exit()` enforces a strict **5 megabyte output ceiling**. If a developer attempts to return a serialized Pandas DataFrame or massive list of IDs, the notebook crashes with `NotebookExecutionException: Output size exceeded limit`. Always write large datasets to a Delta staging table and return only the URI or row count.
- **Variable Mutation via `%run`**: Calling `%run` on three different notebooks that each declare a global variable `df = ...` or `load_date = ...` causes silent variable overwrites, leading to severe logical bugs where the wrong table is written.

### Phase 4: High-Pressure Interview Talking Points
- *Why prefer packaged Python Wheels (.whl) over %run for enterprise pipelines?* Wheels enforce strict versioning, enable semantic versioning (SemVer), run standard pytest unit tests in CI/CD, and eliminate global notebook namespace pollution.
- *How do you achieve parallel processing of multiple notebooks on a single cluster?* Use Python's `concurrent.futures.ThreadPoolExecutor` calling `dbutils.notebook.run()`. Every call runs concurrently on the shared SparkSession without blocking."""
    },

    # ── Item 17: Parameter Passing & Widget Management via dbutils.widgets ──
    {
        "de_id": "de-prod-spark-widgets-017",
        "arch_id": "arch-prod-spark-widgets-017",
        "category_de": "SPARK_PYSPARK",
        "category_arch": "Databricks Lakehouse Architecture",
        "niche": "Parameter Injection & Widget Management",
        "difficulty": "MEDIUM",
        "domain": "Data Lakehouse & Architecture",
        "subdomain": "Spark Notebook Best Practices",
        "question": "How do dbutils.widgets interact with Databricks Workflows and ADF parameter injection, and how do you design foolproof config loaders that handle missing parameters gracefully?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
Databricks **Widgets** provide parameterization capabilities for notebooks, enabling the same code asset to run interactively in development while accepting automated runtime arguments from Databricks Workflows, DABs, or Azure Data Factory.

1. **Widget Types & Lifecycle**:
   - `dbutils.widgets.text(name, defaultValue, label)`: Free-form string input.
   - `dbutils.widgets.dropdown(name, defaultValue, choices, label)`: Restricts interactive users to enumerated values.
   - `dbutils.widgets.combobox(name, defaultValue, choices, label)`: Dropdown with custom text input support.
   - `dbutils.widgets.multiselect(name, defaultValue, choices, label)`: Returns comma-separated selections.

2. **Runtime Binding Hierarchy**:
   - When executed by an automated orchestrator (ADF `baseParameters` or Databricks Job parameters), Databricks automatically binds incoming key-value pairs directly to matching widget names.
   - If a widget is declared with a default value, the automated runtime argument **overrides** the default value completely.

### Phase 2: Implementation & Production Code Artifacts
Below is a typed configuration loader module with strict schema validation and sensible fallbacks:

```python
# config_loader.py: Production Typed Configuration Loader
from dataclasses import dataclass
from datetime import datetime, date
import sys

@dataclass(frozen=True)
class PipelineConfig:
    env: str
    load_date: date
    target_catalog: str
    batch_size: int
    is_dry_run: bool

def load_pipeline_config() -> PipelineConfig:
    '''Safely extracts widgets, applies defaults, and validates types.'''
    # Declare widgets (creates UI elements in interactive mode; no-op in headless jobs if overridden)
    dbutils.widgets.dropdown("env", "dev", ["dev", "staging", "prod"], "Target Environment")
    dbutils.widgets.text("load_date", "", "Load Date (YYYY-MM-DD)")
    dbutils.widgets.text("batch_size", "50000", "Batch Processing Size")
    dbutils.widgets.dropdown("is_dry_run", "false", ["true", "false"], "Dry Run Simulation")

    # Extract values
    raw_env = dbutils.widgets.get("env").strip().lower()
    raw_date = dbutils.widgets.get("load_date").strip()
    raw_batch = dbutils.widgets.get("batch_size").strip()
    raw_dry = dbutils.widgets.get("is_dry_run").strip().lower()

    # Apply date fallback
    if not raw_date:
        parsed_date = date.today()
    else:
        parsed_date = datetime.strptime(raw_date, "%Y-%m-%d").date()

    # Determine Unity Catalog environment namespace
    catalog_map = {
        "dev": "lakehouse_dev",
        "staging": "lakehouse_staging",
        "prod": "lakehouse_prod"
    }
    
    if raw_env not in catalog_map:
        raise ValueError(f"Invalid environment '{raw_env}'. Must be one of: {list(catalog_map.keys())}")

    return PipelineConfig(
        env=raw_env,
        load_date=parsed_date,
        target_catalog=catalog_map[raw_env],
        batch_size=int(raw_batch),
        is_dry_run=(raw_dry == "true")
    )

# Execution
cfg = load_pipeline_config()
print(f"Loaded Config: Environment={cfg.env}, TargetCatalog={cfg.target_catalog}, Date={cfg.load_date}")
```

### Phase 3: Production Pitfalls, Anti-Patterns & Failure Modes
- **The Stale Widget Cache Bug**: In interactive Databricks notebooks, widgets persist in notebook session memory even after you delete their declaration cell. If you change a widget name in code, `dbutils.widgets.get()` can continue reading old cached UI widget values. Always execute `dbutils.widgets.removeAll()` when refactoring widget signatures.
- **Unsanitized Multiselect Parsing**: `multiselect` returns a comma-delimited string (e.g., `"sales, finance,hr"`). Splitting without stripping whitespace (`val.split(",")`) leaves leading spaces that break downstream SQL statements. Always use `[item.strip() for item in raw_val.split(",") if item.strip()]`.

### Phase 4: High-Pressure Interview Talking Points
- *What happens if a Databricks Job passes a parameter that wasn't defined via dbutils.widgets.text?* Databricks implicitly creates a widget for that parameter key, and `dbutils.widgets.get("param_name")` retrieves it successfully.
- *How do you clear all widgets programmatically?* `dbutils.widgets.removeAll()`."""
    },

    # ── Item 18: Production Secrets Management with Azure Key Vault & Scopes ──
    {
        "de_id": "de-prod-spark-secrets-018",
        "arch_id": "arch-prod-spark-secrets-018",
        "category_de": "SPARK_PYSPARK",
        "category_arch": "Databricks Lakehouse Architecture",
        "niche": "Secrets Scopes & Credential Governance",
        "difficulty": "HARD",
        "domain": "Data Lakehouse & Architecture",
        "subdomain": "Spark Notebook Best Practices",
        "question": "How do Azure Key Vault-backed secret scopes operate in Databricks, how does the control plane redact credentials, and how do you architect zero-trust credential access without leaking tokens?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
Hardcoding database passwords, service principal secrets, or third-party API tokens in notebooks or configuration files is a critical security vulnerability.

1. **Secret Scope Topography**:
   - **Databricks-Backed Secret Scopes**: Stored within an encrypted Databricks internal database managed by the control plane.
   - **Azure Key Vault (AKV)-Backed Secret Scopes**: Databricks does not store the secret; it creates a secure federated pointer to an Azure Key Vault resource.
   - **Resolution at Runtime**: When `dbutils.secrets.get(scope="kv-prod", key="db-password")` is called, the Databricks control plane invokes the Azure Key Vault REST API over managed identity / service principal, retrieves the secret in memory, and passes it to the cluster executor.

2. **Automatic Secret Redaction Engine**:
   - Databricks Runtime includes an output-filtering hook that intercepts standard output (`stdout`), standard error (`stderr`), and notebook cell execution results.
   - Any string value matching an active secret retrieved via `dbutils.secrets.get()` is automatically replaced with `[REDACTED]`.

### Phase 2: Implementation & Production Code Artifacts
Below is the complete pattern for creating an AKV-backed scope and safely consuming JDBC secrets without leaking them:

```bash
# Databricks CLI: Create Azure Key Vault-backed Secret Scope
databricks secrets create-scope \
  --scope "kv-lakehouse-prod" \
  --scope-backend-type AZURE_KEYVAULT \
  --resource-id "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/rg-prod/providers/Microsoft.KeyVault/vaults/kv-lakehouse-prod" \
  --dns-name "https://kv-lakehouse-prod.vault.azure.net/"
```

```python
# Notebook Consumption: Secure JDBC Connection
def get_secure_oracle_dataframe(table_name: str):
    scope = "kv-lakehouse-prod"
    
    # Retrieve secrets directly into memory
    db_user = dbutils.secrets.get(scope=scope, key="oracle-service-user")
    db_pass = dbutils.secrets.get(scope=scope, key="oracle-service-password")
    jdbc_host = dbutils.secrets.get(scope=scope, key="oracle-connection-string")

    # Pass directly into Spark options without intermediate print statements
    return (
        spark.read.format("jdbc")
        .option("url", jdbc_host)
        .option("dbtable", table_name)
        .option("user", db_user)
        .option("password", db_pass)
        .option("driver", "oracle.jdbc.driver.OracleDriver")
        .load()
    )
```

### Phase 3: Production Pitfalls, Anti-Patterns & Failure Modes
- **The Redaction Bypass Hazard**: While Databricks redacts the exact secret string, it **cannot redact transformed or encoded variants**! If code base64-encodes the secret (`base64.b64encode(db_pass)`), takes a substring, or iterates character-by-character into debug logs, the value is printed in plain text, completely bypassing the redaction engine.
- **Scope Access Control Lists (ACLs) Failure**: By default, creating a secret scope gives `MANAGE` permission only to the creator. When a Databricks Job runs under a Service Principal or different user identity, the job crashes with `SecretScopeDoesNotExistException`. Always grant explicit ACLs: `databricks secrets put-acl kv-lakehouse-prod <service-principal-id> READ`.

### Phase 4: High-Pressure Interview Talking Points
- *Can you view a secret value in the Databricks UI once created?* No. Neither the UI, the CLI, nor standard notebook output allows viewing secrets; all output is replaced with `[REDACTED]`.
- *Why prefer AKV-backed scopes over Databricks internal scopes?* Centralized enterprise key management, automated credential rotation in Key Vault without touching Databricks, hardware security module (HSM) compliance, and unified Azure RBAC auditing."""
    },

    # ── Item 19: Production PySpark Error Handling & Retry Decorators ──
    {
        "de_id": "de-prod-spark-retry-decorators-019",
        "arch_id": "arch-prod-spark-retry-decorators-019",
        "category_de": "SPARK_PYSPARK",
        "category_arch": "Databricks Lakehouse Architecture",
        "niche": "Fault Tolerance, Retry Decorators & Exponential Backoff",
        "difficulty": "HARD",
        "domain": "Data Lakehouse & Architecture",
        "subdomain": "Spark Notebook Best Practices",
        "question": "How do you design production-grade retry decorators with exponential backoff and jitter in PySpark, and how do you differentiate between transient cloud storage throttling (HTTP 503/429) versus fatal deterministic code errors?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
In distributed cloud systems, pipelines interact with remote object stores (ADLS Gen2, AWS S3) and external APIs that experience micro-outages, network partition hiccups, and egress throttling.

1. **Transient vs Fatal Exceptions**:
   - **Transient (Retryable)**:
     - Cloud storage throttling: `Azure Blob / ADLS Gen2 HTTP 503 Server Busy`, `HTTP 429 Too Many Requests`.
     - JDBC connection drops: `SocketTimeoutException`, `Communications link failure`.
     - Delta Lake concurrent write collisions: `ConcurrentAppendException` (where a retry with refreshed snapshot succeeds).
   - **Fatal (Non-Retryable)**:
     - Schema violations: `AnalysisException: Column 'x' does not exist`.
     - Data type casting failures: `ParseException`, `ArithmeticException: Division by zero`.
     - Access denial: `HTTP 403 Forbidden` / `AuthenticationException`.
   - **Rule**: Retrying a fatal error wastes compute, increases DBU costs, and prolongs pipeline failure detection. Only transient exceptions should trigger retries.

2. **Exponential Backoff with Full Jitter**:
   - Immediate retries exacerbate cloud storage throttling by compounding request bursts.
   - Exponential backoff doubles the delay between attempts: Base * 2^(attempt).
   - **Jitter**: Introduces random noise into the sleep interval to prevent all concurrent executor tasks from retrying in lockstep synchronization (the "thundering herd" problem).

### Phase 2: Implementation & Production Code Artifacts
Below is a reusable Python retry decorator specifically tailored for PySpark operations:

```python
# retry_framework.py: Production PySpark Retry Decorator with Jitter
import time
import random
import logging
from functools import wraps
from typing import Callable, Tuple, Type

logger = logging.getLogger("pipeline.retry")

# Define known transient exception types
TRANSIENT_EXCEPTIONS = (
    ConnectionResetError,
    TimeoutError,
)

def with_exponential_backoff(
    max_retries: int = 4,
    base_delay_sec: float = 2.0,
    max_delay_sec: float = 60.0,
    retryable_exceptions: Tuple[Type[Exception], ...] = TRANSIENT_EXCEPTIONS
):
    '''Decorator executing exponential backoff with full jitter on transient failures.'''
    def decorator(func: Callable):
        @wraps(func)
        def wrapper(*args, **kwargs):
            attempt = 0
            while True:
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    # Check if exception is fatal
                    if not isinstance(e, retryable_exceptions) and not any(kw in str(e).lower() for kw in ["503", "429", "timeout", "busy"]):
                        logger.error(f"Fatal non-retryable exception encountered in {func.__name__}: {str(e)}")
                        raise e
                    
                    attempt += 1
                    if attempt > max_retries:
                        logger.error(f"Exhausted all {max_retries} retries for {func.__name__}. Raising exception.")
                        raise e
                    
                    # Calculate sleep time: min(max_delay, base * 2^attempt) with full jitter
                    calculated_delay = min(max_delay_sec, base_delay_sec * (2 ** (attempt - 1)))
                    jittered_delay = random.uniform(0, calculated_delay)
                    
                    logger.warning(
                        f"Transient failure in {func.__name__} (Attempt {attempt}/{max_retries}): {str(e)}. "
                        f"Backing off for {jittered_delay:.2f}s..."
                    )
                    time.sleep(jittered_delay)
        return wrapper
    return decorator

# Usage Example on Delta Table Write
@with_exponential_backoff(max_retries=3, base_delay_sec=3.0)
def save_delta_with_retry(df, target_table: str):
    df.write.format("delta").mode("append").saveAsTable(target_table)
```

### Phase 3: Production Pitfalls, Anti-Patterns & Failure Modes
- **The RDD Transformation Retry Illusion**: Applying a retry decorator around a lazy PySpark transformation (e.g., `df = df.filter(...).withColumn(...)`). Because Spark transformations are lazily evaluated, the code inside the decorated function executes in 2 milliseconds without actually reading data. The real failure happens minutes later when an action (`df.write` or `df.count()`) is invoked outside the decorator! Always wrap the terminal **Action**, not the lazy transformation.
- **Unbounded Backoff Freezing Pipeline**: Setting `max_delay_sec: 1800` (30 minutes) on a pipeline with a 15-minute SLA. The pipeline will silently sleep for hours during an ongoing cloud outage, blocking downstream schedules.

### Phase 4: High-Pressure Interview Talking Points
- *Why is full jitter mandatory in distributed retries?* Without jitter, hundreds of executor tasks that failed simultaneously at second 0 will all retry simultaneously at second 2, second 4, and second 8, repeatedly DDOSing the storage endpoint.
- *What Delta Lake exception is safe to retry?* `ConcurrentAppendException` is safe to retry because Delta Lake will automatically read the latest transaction log commit and attempt to re-append without conflicting."""
    },

    # ── Item 20: Structured Pipeline Logging & Real-Time Audit Trails ──
    {
        "de_id": "de-prod-spark-audit-logging-020",
        "arch_id": "arch-prod-spark-audit-logging-020",
        "category_de": "SPARK_PYSPARK",
        "category_arch": "Databricks Lakehouse Architecture",
        "niche": "Structured Logging & Observability Frameworks",
        "difficulty": "HARD",
        "domain": "Data Lakehouse & Architecture",
        "subdomain": "Spark Notebook Best Practices",
        "question": "How do you implement high-performance structured JSON logging in Databricks notebooks, and how do you write transactional pipeline audit records to Delta Lake without slowing down execution?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
Standard unformatted `print()` statements in Databricks notebooks are an operational nightmare: they cannot be parsed by log collectors, lack timestamps, do not correlate with orchestrator Run IDs, and vanish when ephemeral clusters terminate.

1. **Structured JSON Logging Architecture**:
   - Emits log lines formatted as strictly valid single-line JSON objects containing standard contextual metadata:
     - `timestamp`: UTC ISO-8601 string.
     - `level`: INFO, WARN, ERROR.
     - `pipeline_name`, `run_id`, `job_id`: Injected dynamically from Spark conf or widgets.
     - `stage`: Ingestion, Transformation, QualityCheck, Egress.
     - `metrics`: Row counts, duration, memory spill bytes.

2. **Decoupled Asynchronous Audit Logging**:
   - Writing audit logs synchronously to an Azure SQL table via JDBC for every pipeline step introduces severe latency and network coupling.
   - **Production Pattern**: Maintain a localized append-only Delta audit table (`audit.pipeline_execution_log`) in Unity Catalog. Append audit records using small programmatic DataFrames directly into Delta Lake, enabling sub-second write times protected by ACID isolation.

### Phase 2: Implementation & Production Code Artifacts
Below is a structured JSON logging and Delta audit framework for Databricks notebooks:

```python
# structured_audit.py: Production Logging & Delta Audit Engine
import json
import logging
from datetime import datetime
from pyspark.sql.types import StructType, StructField, StringType, LongType, TimestampType

class JsonFormatter(logging.Formatter):
    def format(self, record):
        log_obj = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "pipeline_name": getattr(record, "pipeline_name", "unknown"),
            "run_id": getattr(record, "run_id", "manual")
        }
        if record.exc_info:
            log_obj["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_obj)

# Setup Logger
logger = logging.getLogger("LakehouseLogger")
handler = logging.StreamHandler()
handler.setFormatter(JsonFormatter())
logger.addHandler(handler)
logger.setLevel(logging.INFO)

# Delta Audit Writer
def log_pipeline_audit_event(
    stage: str,
    status: str,
    rows_affected: int = 0,
    error_message: str = None
):
    '''Writes an ACID audit record to the central Unity Catalog audit table.'''
    audit_schema = StructType([
        StructField("run_id", StringType(), False),
        StructField("pipeline_name", StringType(), False),
        StructField("stage", StringType(), False),
        StructField("status", StringType(), False),
        StructField("rows_affected", LongType(), True),
        StructField("error_message", StringType(), True),
        StructField("event_time", TimestampType(), False)
    ])
    
    run_id = spark.conf.get("spark.databricks.job.runId", "interactive-session")
    pipeline_name = spark.conf.get("spark.databricks.job.name", "adhoc_notebook")

    record = [(
        run_id,
        pipeline_name,
        stage,
        status,
        int(rows_affected),
        error_message,
        datetime.utcnow()
    )]
    
    audit_df = spark.createDataFrame(record, audit_schema)
    audit_df.write.format("delta").mode("append").saveAsTable("audit.pipeline_execution_log")
    
    # Emit matching structured stdout log
    extra = {"pipeline_name": pipeline_name, "run_id": run_id}
    logger.info(f"Stage '{stage}' finished with status '{status}'. Rows: {rows_affected}", extra=extra)
```

### Phase 3: Production Pitfalls, Anti-Patterns & Failure Modes
- **The Schema Mismatch in Audit Logs**: If `error_message` is typed as a String, but an uncaught exception returns an entire dict or nested stack trace, standard DataFrame creation fails. Always convert errors to truncated strings (`str(e)[:4000]`).
- **Concurrent Audit Collisions on Non-Delta Sinks**: If multiple tasks in a parallel job attempt to write audit records simultaneously to a raw Parquet or CSV file directory, file overwrites occur. Delta Lake completely eliminates this via Optimistic Concurrency Control (OCC) multi-part commits.

### Phase 4: High-Pressure Interview Talking Points
- *Where do stdout logs go when a Databricks Job cluster terminates?* If Log Delivery is configured, driver and executor logs are pushed to an ADLS Gen2/S3 storage bucket or streamed to Azure Log Analytics via the Databricks Monitoring agent.
- *How do you query pipeline duration trends across the last 30 days?* Query `audit.pipeline_execution_log` using SQL window functions (`LEAD(event_time) OVER (PARTITION BY run_id ORDER BY event_time)`) to compute elapsed time per stage."""
    },

    # ── Item 21: Structured Streaming Auto Loader (cloudFiles) Deep Dive ──
    {
        "de_id": "de-prod-spark-autoloader-021",
        "arch_id": "arch-prod-spark-autoloader-021",
        "category_de": "SPARK_PYSPARK",
        "category_arch": "Databricks Lakehouse Architecture",
        "niche": "Auto Loader Architecture & Schema Evolution",
        "difficulty": "HARD",
        "domain": "Ingestion & Real-Time Streaming",
        "subdomain": "Structured Streaming",
        "question": "How does Databricks Auto Loader (format='cloudFiles') scale file ingestion over millions of incoming cloud objects, what is the architectural difference between Directory Listing and File Notification modes, and how does schema evolution work?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
Traditional Spark streaming file readers (`spark.readStream.format("parquet")`) maintain file discovery state in driver memory. As millions of files accumulate in cloud object stores (ADLS Gen2 / S3), listing directory contents (`LIST` operations) degrades catastrophically, taking hours just to identify newly arrived files.

1. **Auto Loader (`cloudFiles`) Engine**:
   - Optimized, cloud-native file ingestion engine that incrementally and efficiently processes billions of files.
   - **Directory Listing Mode (Default)**:
     - Leverages optimized lexical listing APIs over cloud storage paths.
     - Automatically parallelizes directory scans on executor threads and caches state in RocksDB checkpoints.
     - Best for: Moderate file volumes (< 100,000 files/day) and simple directory hierarchies.
   - **File Notification Mode**:
     - Automatically provisions cloud event notification infrastructure (Azure Event Grid + Storage Queue; AWS SNS + SQS).
     - Storage automatically pushes a notification message into the queue whenever a new file lands.
     - Auto Loader pulls from the queue instead of listing directories.
     - Best for: Massive scale (> 1,000,000 files/day) with zero directory listing latency.

2. **Schema Evolution & The Rescued Data Column**:
   - Raw JSON/CSV landing files frequently arrive with unexpected new columns, altered case, or corrupted datatypes.
   - Auto Loader provides automatic **Schema Evolution**:
     - `addNewColumns`: Automatically amends the Delta table schema when new columns arrive.
     - `rescueDataColumn`: Any column that does not match the known schema or violates parsing types is automatically preserved in a special JSON column named `_rescued_data`, preventing stream failure while safeguarding data from drop loss.

### Phase 2: Implementation & Production Code Artifacts
Below is a production Auto Loader stream ingesting JSON landing files with schema hints and rescued data column enabled:

```python
# autoloader_production.py: Production Auto Loader Pipeline
from pyspark.sql.functions import current_timestamp, input_file_name

landing_path = "abfss://landing@dwhlakehouse.dfs.core.windows.net/iot_telemetry/"
checkpoint_path = "abfss://checkpoints@dwhlakehouse.dfs.core.windows.net/iot_stream_v1/"
target_table = "bronze.iot_telemetry_raw"

stream_query = (
    spark.readStream
    .format("cloudFiles")
    .option("cloudFiles.format", "json")
    .option("cloudFiles.schemaLocation", checkpoint_path + "schema/")
    .option("cloudFiles.schemaEvolutionMode", "addNewColumns")
    .option("cloudFiles.inferColumnTypes", "true")
    .option("cloudFiles.schemaHints", "deviceId STRING, eventTimestamp TIMESTAMP, batteryLevel DOUBLE")
    # File Notification Mode (uncomment for production high-volume Event Grid queue processing)
    # .option("cloudFiles.useNotifications", "true")
    .load(landing_path)
    .withColumn("_ingestion_timestamp", current_timestamp())
    .withColumn("_source_file_path", input_file_name())
    .writeStream
    .format("delta")
    .outputMode("append")
    .option("checkpointLocation", checkpoint_path + "offsets/")
    .option("mergeSchema", "true")
    .trigger(availableNow=True)  # Incremental micro-batch: process all backlogged files, then terminate cluster
    .toTable(target_table)
)

stream_query.awaitTermination()
```

### Phase 3: Production Pitfalls, Anti-Patterns & Failure Modes
- **The Shared Checkpoint Directory Corruption**: Reusing the same checkpoint path for two different streams or altering the underlying source format while keeping an old checkpoint. The stream fails immediately with `InvalidCheckpointException` or silently skips files. Every stream must have a strictly unique checkpoint URI.
- **The Event Grid Permission Bug**: In File Notification mode, Databricks requires Azure RBAC permissions (`EventGrid Contributor`, `Storage Queue Data Contributor`) to auto-provision Event Grid subscriptions. In locked-down enterprise subscriptions, automated provisioning fails. DevOps teams must manually provision the Storage Queue and Event Grid subscription and pass the queue URL via `.option("cloudFiles.queueUrl", "...")`.

### Phase 4: High-Pressure Interview Talking Points
- *What is trigger(availableNow=True)?* Introduced in Spark 3.3 / DBR 10.4, it combines the cost savings of batch execution with the state tracking of streaming. It processes all newly arrived files across multiple optimal micro-batches and terminates automatically when caught up, avoiding 24/7 idle cluster costs.
- *Where do unexpected columns land when schemaEvolutionMode is rescue?* In the `_rescued_data` column as a JSON string, allowing data engineers to inspect and backfill schema changes without stopping the stream."""
    },

    # ── Item 22: Structured Streaming Checkpoint Mechanics & Corruption Recovery ──
    {
        "de_id": "de-prod-spark-checkpoint-recovery-022",
        "arch_id": "arch-prod-spark-checkpoint-recovery-022",
        "category_de": "SPARK_PYSPARK",
        "category_arch": "Databricks Lakehouse Architecture",
        "niche": "Streaming Checkpoints & Disaster Recovery",
        "difficulty": "ARCHITECT",
        "domain": "Ingestion & Real-Time Streaming",
        "subdomain": "Structured Streaming",
        "question": "What is the physical directory structure and write-ahead log (WAL) protocol inside a Spark Structured Streaming checkpoint, and how do you recover when a checkpoint is corrupted?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
Spark Structured Streaming achieves **End-to-End Exactly-Once Processing** by coordinating idempotent sinks with a persistent **Checkpoint Directory** written to cloud object storage.

1. **Internal Checkpoint Directory Anatomy**:
   ```
   checkpoint_dir/
   |-- offsets/      # Write-Ahead Log (WAL) recording the exact input range for each micro-batch
   |   |-- 0
   |   |-- 1
   |   `-- 2
   |-- commits/      # Confirms successful completion of micro-batches (commit log)
   |   |-- 0
   |   |-- 1
   |   `-- 2
   |-- metadata      # Stream UUID and protocol version
   |-- sources/      # Source-specific tracking state (e.g., Auto Loader discovered files)
   `-- state/        # Stateful aggregation memory store (RocksDB / HDFS state provider)
       `-- 0/
           `-- 0.delta
   ```

2. **The Micro-Batch Two-Phase Commit Protocol**:
   - **Phase 1 (Offset Commit)**: The engine queries the source (e.g., Kafka topic partition offsets or ADLS Gen2 file list), constructs micro-batch `N`, and writes the offset ranges to `offsets/N`.
   - **Phase 2 (Compute & Sink Write)**: Executors process transformations and write output to the sink.
   - **Phase 3 (Batch Commit)**: The engine writes a confirmation file `commits/N`.
   - **Recovery Rule**: On restart, if `offsets/N` exists but `commits/N` is missing, Spark re-executes batch `N` from scratch. If the sink is idempotent (e.g., Delta Lake), duplicate rows are avoided.

### Phase 2: Implementation & Production Code Artifacts
Step-by-step operational runbook for diagnosing and recovering from checkpoint corruption:

```bash
# Step 1: Inspect the latest offset and commit numbers
az storage blob list \
  --account-name dwhlakehouse \
  --container-name checkpoints \
  --prefix "iot_stream_v1/offsets/" \
  --query "[].name" -o tsv | tail -n 5

az storage blob list \
  --account-name dwhlakehouse \
  --container-name checkpoints \
  --prefix "iot_stream_v1/commits/" \
  --query "[].name" -o tsv | tail -n 5

# Step 2: Diagnostic Python Script to inspect JSON metadata inside an offset file
cat << 'EOF' > inspect_offset.py
import json

offset_path = "checkpoints/iot_stream_v1/offsets/142"
with open(offset_path, 'r') as f:
    lines = f.readlines()
    version = lines[0]
    payload = json.loads("".join(lines[1:]))
    print(f"Engine Protocol: {version}")
    print(f"Source Offsets: {json.dumps(payload, indent=2)}")
EOF
python3 inspect_offset.py
```

### Phase 3: Production Pitfalls, Anti-Patterns & Failure Modes
- **The Blind Checkpoint Deletion Disaster**: In response to a stream crash, an inexperienced engineer deletes the entire checkpoint directory. **Catastrophe**: Spark forgets all historical progress! If reading from Kafka, it resets to `latest` (causing permanent data loss) or `earliest` (reprocessing months of data and producing duplicate sink records).
- **Incompatible Code Changes**: Adding, removing, or changing the order of stateful operations (e.g., adding a new `groupBy()` or changing the watermark column) invalidates the physical RocksDB binary layout in `state/`. The stream will fail with `Cannot mutate state schema`. Stateful changes require deploying a brand new stream with a new checkpoint and backfilling data.

### Phase 4: High-Pressure Interview Talking Points
- *What happens if offsets/10 exists but commits/10 is missing?* The driver knows batch 10 crashed midway. It discards partial state and re-reads the exact offset range specified in `offsets/10`, re-executing the batch.
- *Why is Delta Lake the ideal sink for Structured Streaming?* Because Delta Lake utilizes transaction log commits that bind directly with Spark streaming batch IDs, guaranteeing transactional exactly-once idempotency even during repeated batch retries."""
    },

    # ── Item 23: Streaming Stateful Aggregations & Watermarking Mechanics ──
    {
        "de_id": "de-prod-spark-watermarking-023",
        "arch_id": "arch-prod-spark-watermarking-023",
        "category_de": "SPARK_PYSPARK",
        "category_arch": "Databricks Lakehouse Architecture",
        "niche": "Watermarks & Stateful Stream Processing",
        "difficulty": "ARCHITECT",
        "domain": "Ingestion & Real-Time Streaming",
        "subdomain": "Structured Streaming",
        "question": "How does Spark Structured Streaming calculate event-time watermarks, how does state eviction occur under the hood in RocksDB, and what are the trade-offs between Append, Update, and Complete output modes?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
Real-world streaming data arrives out of order due to network latency, mobile offline queues, and clock drift. To perform aggregations over time windows (e.g., 5-minute rolling averages), the engine must buffer intermediate aggregates in a **State Store** (backed by RocksDB on executor local SSDs).

1. **Watermarking Mathematics**:
   - A **Watermark** is a dynamic threshold defining how long the engine will wait for late-arriving data before evicting a time window from memory:
     Watermark = max(EventTime seen so far) - DelayThreshold
   - Any record arriving with an `event_time < Watermark` is classified as *too late* and dropped from aggregation state.
   - Once the watermark advances past the end of a time window (`window.end < Watermark`), the window is frozen, finalized, and evicted from RocksDB memory, preventing RAM exhaustion.

2. **Output Modes Comparison**:
   - **Append Mode**: Only rows that are completely finalized (past the watermark) are emitted to the sink. Required for writing to append-only files or Delta tables.
   - **Update Mode**: Emits rows whenever their aggregated value changes within the active state window. Ideal for pushing updates to key-value stores (Cosmos DB, Redis).
   - **Complete Mode**: Emits the *entire* aggregated table on every micro-batch. Only feasible for low-cardinality data; state is never evicted.

### Phase 2: Implementation & Production Code Artifacts
Below is a windowed streaming aggregation with a 10-minute watermark and RocksDB state store enabled:

```python
# stateful_streaming.py: Production Watermarked Aggregation
from pyspark.sql.functions import col, window, count, avg

# Enable RocksDB State Store (Mandatory for large stateful workloads to avoid JVM GC pauses)
spark.conf.set(
    "spark.sql.streaming.stateStore.providerClass",
    "org.apache.spark.sql.execution.streaming.state.RocksDBStateStoreProvider"
)

stream_df = (
    spark.readStream
    .format("delta")
    .table("bronze.iot_telemetry_raw")
)

# 10-minute watermark with 5-minute tumbling windows
aggregated_stream = (
    stream_df
    .withWatermark("eventTimestamp", "10 minutes")
    .groupBy(
        window(col("eventTimestamp"), "5 minutes"),
        col("deviceId")
    )
    .agg(
        count("eventTimestamp").alias("total_readings"),
        avg("batteryLevel").alias("avg_battery")
    )
    .select(
        col("window.start").alias("window_start"),
        col("window.end").alias("window_end"),
        col("deviceId"),
        col("total_readings"),
        col("avg_battery")
    )
)

query = (
    aggregated_stream.writeStream
    .format("delta")
    .outputMode("append")  # Emits only finalized windows past the 10-minute watermark
    .option("checkpointLocation", "abfss://checkpoints@lake.dfs.core.windows.net/iot_aggregates/")
    .toTable("silver.iot_device_5min_aggregates")
)
```

### Phase 3: Production Pitfalls, Anti-Patterns & Failure Modes
- **The Default HDFS State Store OOM Crash**: By default, open-source Spark uses an in-memory JVM heap state store (`HDFSBackedStateStoreProvider`). In streams running for weeks with millions of unique keys, the JVM heap saturates, triggering catastrophic garbage collection (GC) pauses lasting minutes and culminating in `java.lang.OutOfMemoryError`. Always configure **RocksDB** (`RocksDBStateStoreProvider`), which offloads state to local NVMe SSDs and off-heap memory.
- **Watermark on Ingestion Time instead of Event Time**: Applying `.withWatermark()` to `current_timestamp()` instead of the real device event timestamp. If upstream systems pause and dump a 6-hour backlog, the engine evaluates all data against current wall-clock time, causing irregular window calculations.

### Phase 4: High-Pressure Interview Talking Points
- *Why is RocksDB preferred over the default HDFS state store in Databricks?* RocksDB stores state in native off-heap memory backed by local SSDs, avoiding Java GC pauses and supporting billions of concurrent state keys without blowing up executor heap limits.
- *Can you use Append mode on a streaming aggregation without a watermark?* No! Spark will throw an `AnalysisException`. Without a watermark, Spark has no way of knowing when an aggregation window is complete, meaning it can never safely emit an append row."""
    },

    # ── Item 24: foreachBatch Micro-Batch Sink Patterns & Delta MERGE ──
    {
        "de_id": "de-prod-spark-foreachbatch-024",
        "arch_id": "arch-prod-spark-foreachbatch-024",
        "category_de": "SPARK_PYSPARK",
        "category_arch": "Databricks Lakehouse Architecture",
        "niche": "foreachBatch Custom Sinks & Streaming Upserts",
        "difficulty": "HARD",
        "domain": "Ingestion & Real-Time Streaming",
        "subdomain": "Structured Streaming",
        "question": "How does foreachBatch bridge the gap between streaming and batch APIs, how do you implement an idempotent Delta MERGE inside foreachBatch, and how do you prevent write amplification?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
Standard Structured Streaming sinks (`.format("delta").outputMode("append")`) only support basic appends or full overwrites. They cannot natively perform complex relational operations like Change Data Capture (CDC) upserts (`MERGE INTO`), multi-table fan-outs, or writing to custom databases.

1. **`foreachBatch` Mechanics**:
   - Evaluates the streaming micro-batch as a standard, static **batch DataFrame** (`batch_df`) accompanied by a monotonically increasing `batch_id`:
     `def process_micro_batch(batch_df: DataFrame, batch_id: int): ...`
   - Inside the callback function, you can execute any batch PySpark, SQL, or Delta Lake API operation (`DeltaTable.merge()`, `.cache()`, writes to multiple databases).

2. **Idempotency Requirement**:
   - Because a micro-batch may fail and retry (as covered in Item 22), the logic inside `foreachBatch` **must be completely idempotent**.
   - If `batch_df` contains duplicate records within the same micro-batch, performing a direct Delta MERGE will throw a `DeltaConcurrentModificationException` or produce non-deterministic results unless deduplicated before merging.

### Phase 2: Implementation & Production Code Artifacts
Below is the production implementation of an idempotent streaming CDC upsert into a Delta Lake Silver table:

```python
# foreach_batch_merge.py: Idempotent Streaming Upsert via foreachBatch
from delta.tables import DeltaTable
from pyspark.sql.functions import col, row_number
from pyspark.sql.window import Window

target_delta_table = "silver.customers_scd1"

def upsert_to_delta(micro_batch_df, batch_id: int):
    '''Processes each micro-batch as an idempotent Delta MERGE.'''
    if micro_batch_df.isEmpty():
        return

    # Step 1: In-batch deduplication (keep latest record per primary key within the batch)
    window_spec = Window.partitionBy("customer_id").orderBy(col("updated_at").desc())
    deduped_batch_df = (
        micro_batch_df
        .withColumn("rk", row_number().over(window_spec))
        .filter(col("rk") == 1)
        .drop("rk")
    )
    
    # Cache batch DataFrame to avoid re-evaluating source DAG during multi-pass merge
    deduped_batch_df.cache()

    try:
        # Step 2: Execute Delta MERGE
        delta_target = DeltaTable.forName(spark, target_delta_table)
        
        (
            delta_target.alias("target")
            .merge(
                deduped_batch_df.alias("source"),
                "target.customer_id = source.customer_id"
            )
            .whenMatchedUpdateAll()
            .whenNotMatchedInsertAll()
            .execute()
        )
    finally:
        deduped_batch_df.unpersist()

# Streaming Query Attachment
stream_query = (
    spark.readStream
    .format("delta")
    .table("bronze.customers_cdc_raw")
    .writeStream
    .foreachBatch(upsert_to_delta)
    .option("checkpointLocation", "abfss://checkpoints@lake.dfs.core.windows.net/customers_upsert/")
    .trigger(processingTime="1 minute")
    .start()
)

stream_query.awaitTermination()
```

### Phase 3: Production Pitfalls, Anti-Patterns & Failure Modes
- **The Duplicate Key Merge Collision Crash**: If `micro_batch_df` contains multiple records with the same `customer_id` (e.g., an insert followed by an update within the same 1-minute window), Delta Lake throws `DeltaIllegalStateException: Cannot perform MERGE because multiple source rows matched the same target row`. Always apply **in-batch deduplication** using `row_number()` before invoking `.merge()`.
- **Forgetting to Cache the Batch DataFrame**: The Delta MERGE engine executes an internal 2-pass algorithm (an inner join to locate matching Parquet files, followed by an outer join to rewrite records). If `micro_batch_df` involves expensive transformations or an un-cached upstream join, Spark re-evaluates the entire streaming DAG twice. Always `.cache()` the batch DataFrame and `.unpersist()` in a `finally` block.

### Phase 4: High-Pressure Interview Talking Points
- *Why is in-batch deduplication mandatory before a Delta MERGE?* Because Delta Lake requires deterministic 1-to-1 matching; if two source rows match the same target row, Delta Lake cannot determine which update takes precedence and fails the transaction.
- *Can you write to multiple sinks inside a single foreachBatch?* Yes, you can write the `batch_df` to both a Delta table and an Azure Synapse DW or Cosmos DB within the same callback."""
    },

    # ── Item 25: Python Wheel Packaging & Unity Catalog Volume Distribution ──
    {
        "de_id": "de-prod-spark-wheel-packaging-025",
        "arch_id": "arch-prod-spark-wheel-packaging-025",
        "category_de": "SPARK_PYSPARK",
        "category_arch": "Databricks Lakehouse Architecture",
        "niche": "Code Reusability, Wheel Packaging & CI/CD",
        "difficulty": "HARD",
        "domain": "Data Lakehouse & Architecture",
        "subdomain": "Spark Notebook Best Practices",
        "question": "How do you package complex PySpark code into standard Python Wheels (.whl), publish them to Unity Catalog Volumes, and attach them to Databricks clusters without UI intervention?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
Copy-pasting helper functions between notebooks or relying on `%run` across repositories is an amateur anti-pattern. Enterprise data engineering treats data pipelines as production software engineering assets.

1. **Python Wheel Packaging Lifecycle**:
   - Pipeline logic is developed in local IDEs (VS Code, PyCharm) inside a standard Python package structure (`src/my_pipeline/`).
   - Standard unit tests are executed locally using `pytest` and `chispa` (for DataFrame equality assertions).
   - A CI/CD build runner compiles the package into a distributable binary wheel: `dist/corp_lakehouse_core-1.2.0-py3-none-any.whl`.
   
2. **Distribution via Unity Catalog Volumes**:
   - Unity Catalog **Volumes** provide governed, secure cloud storage for unstructured files, including Python libraries.
   - The compiled wheel is uploaded to a shared catalog volume: `/Volumes/prod_lakehouse/core_libs/wheels/`.
   - Databricks Jobs and clusters reference the wheel directly via its Unity Catalog Volume URI.

### Phase 2: Implementation & Production Code Artifacts
Below is the `pyproject.toml` / `setup.py` build configuration and automated deployment script:

```python
# setup.py: Python Wheel Packaging
from setuptools import setup, find_packages

setup(
    name="corp_lakehouse_core",
    version="1.2.0",
    description="Enterprise Data Platform Core Transformations and Utilities",
    author="Data Platform Engineering",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    install_requires=[
        "pydantic>=2.0.0",
    ],
    python_requires=">=3.10",
)
```

```bash
# Automated CI/CD Script: Build Wheel and Upload to Unity Catalog Volume
# Step 1: Clean and build wheel locally
rm -rf dist/ build/ *.egg-info
python3 setup.py bdist_wheel

WHEEL_FILE=$(ls dist/*.whl)
echo "Built Wheel: $WHEEL_FILE"

# Step 2: Upload to Unity Catalog Volume via Databricks CLI v0.200+
databricks fs cp "$WHEEL_FILE" \
  "dbfs:/Volumes/prod_lakehouse/core_libs/wheels/corp_lakehouse_core-1.2.0-py3-none-any.whl" \
  --overwrite

echo "Successfully deployed wheel to Unity Catalog Volume!"
```

```yaml
# In Databricks Asset Bundle (databricks.yml) or Job JSON:
libraries:
  - whl: "/Volumes/prod_lakehouse/core_libs/wheels/corp_lakehouse_core-1.2.0-py3-none-any.whl"
```

### Phase 3: Production Pitfalls, Anti-Patterns & Failure Modes
- **The DBFS Root Deprecation Hazard**: Storing production wheels in the legacy DBFS root (`dbfs:/FileStore/jars/...`). Legacy DBFS root lacks Unity Catalog access governance, audit logging, and data isolation. Modern Databricks architecture mandates storing all libraries inside **Unity Catalog Volumes**.
- **Cluster Restart Requirement for Wheel Updates**: If an interactive cluster has already imported `import corp_lakehouse_core`, uploading a new wheel with the same version number does **not** update the code in memory! Python caches imported modules in `sys.modules`. You must either detach/reattach the notebook and run `%pip install --force-reinstall`, or properly increment the SemVer version (`1.2.1`).

### Phase 4: High-Pressure Interview Talking Points
- *Why are Python Wheels superior to Databricks notebooks for business logic?* Wheels can be unit-tested in automated CI pipelines without spinning up expensive cloud clusters, enforce strict dependency pinning, prevent accidental code tampering in the UI, and eliminate namespace collisions.
- *Where should enterprise libraries be stored in Unity Catalog?* Inside Unity Catalog Volumes (`/Volumes/catalog/schema/volume_name/`), governed by standard UC `READ VOLUME` / `WRITE VOLUME` permissions."""
    },

    # ── Item 26: Databricks Connect v2 & Modern Local IDE Development ──
    {
        "de_id": "de-prod-spark-dbconnect-v2-026",
        "arch_id": "arch-prod-spark-dbconnect-v2-026",
        "category_de": "SPARK_PYSPARK",
        "category_arch": "Databricks Lakehouse Architecture",
        "niche": "Databricks Connect v2 & Spark Connect Protocol",
        "difficulty": "HARD",
        "domain": "Data Lakehouse & Architecture",
        "subdomain": "Spark Notebook Best Practices",
        "question": "How does Databricks Connect v2 leverage the Spark Connect gRPC architecture to enable local IDE development, and how does it fundamentally differ from legacy Databricks Connect v1?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
Historically, developing Spark code required either writing code in the browser notebook or using **Databricks Connect v1**, which had severe architectural limitations: it required matching exact minor versions of Java, Scala, and Python on the local machine and executed client-side JVM bytecode that was fragile and slow.

1. **Databricks Connect v2 (Powered by Spark Connect)**:
   - Introduced in Spark 3.4+ / Databricks Runtime 13.0+.
   - **Client-Server Thin Protocol**: Completely eliminates local Java/JVM requirements.
   - The local machine runs pure, lightweight Python (`databricks-connect` package).
   - DataFrame transformations constructed locally in VS Code or PyCharm are compiled into unresolved logical query plans and serialized into protocol buffers (Protobuf).
   - The Protobuf payload is transmitted over a secure **gRPC** stream over HTTP/2 directly to the Databricks cluster.
   - The remote Databricks cluster parses the plan, executes it using its full distributed compute, and streams back only the summarized results or metadata.

### Phase 2: Implementation & Production Code Artifacts
Below is the setup and verification script for connecting a local VS Code environment directly to a remote Databricks cluster:

```bash
# Local Terminal Setup
pip install --upgrade "databricks-connect>=14.0,<15.0"

# Set authentication environment variables (or configure via ~/.databrickscfg)
export DATABRICKS_HOST="https://adb-1234567890123456.7.azuredatabricks.net"
export DATABRICKS_TOKEN="<YOUR_DATABRICKS_PERSONAL_ACCESS_TOKEN>"
export DATABRICKS_CLUSTER_ID="1024-123456-abcdef12"
```

```python
# local_dev_test.py: Executed locally in VS Code with Step-Through Debugging
from databricks.connect import DatabricksSession
from pyspark.sql.functions import col, current_timestamp

# Initialize remote session using environment credentials
spark = DatabricksSession.builder.getOrCreate()

print("Connected to Databricks Cluster successfully via Spark Connect!")

# Execute distributed query on remote cluster while stepping through local breakpoints
df = spark.table("lakehouse_prod.silver.fact_orders")
filtered_df = (
    df.filter(col("total_amount") > 500)
    .withColumn("analyzed_at", current_timestamp())
    .limit(10)
)

# Only this small 10-row dataset travels over the gRPC network back to your IDE
local_results = filtered_df.collect()
for row in local_results:
    print(f"Order: {row['order_id']} | Amount: ${row['total_amount']}")
```

### Phase 3: Production Pitfalls, Anti-Patterns & Failure Modes
- **Unsupported Legacy APIs**: Spark Connect does **not** support low-level RDD APIs (`rdd.map()`, `rdd.reduceByKey()`) or legacy DBUtils file operations that expect direct driver filesystem access. All operations must utilize DataFrame and Dataset APIs.
- **Cluster Runtime Version Incompatibility**: Attempting to use `databricks-connect==14.3.0` against a cluster running Databricks Runtime 13.3 LTS. The client-side Protobuf definitions must match the major and minor version of the target Databricks Runtime cluster.

### Phase 4: High-Pressure Interview Talking Points
- *Does Databricks Connect v2 require Java on the developer's laptop?* No. It is a 100% pure Python library communicating over gRPC.
- *How does step-through debugging work?* You can place standard IDE breakpoints inside your local Python file. Local variables evaluate locally; DataFrame operations are sent as Protobuf query plans to the cluster and executed remotely."""
    },

    # ── Item 27: Unit Testing PySpark Pipelines in CI/CD ──
    {
        "de_id": "de-prod-spark-unit-testing-027",
        "arch_id": "arch-prod-spark-unit-testing-027",
        "category_de": "SPARK_PYSPARK",
        "category_arch": "Databricks Lakehouse Architecture",
        "niche": "Unit Testing, Pytest & DataFrame Assertions",
        "difficulty": "HARD",
        "domain": "Data Lakehouse & Architecture",
        "subdomain": "Spark Notebook Best Practices",
        "question": "How do you architect automated unit tests for PySpark data transformations in CI/CD pipelines without spinning up costly cloud Databricks clusters?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
Running unit tests by spinning up full cloud Databricks clusters inside CI/CD pipelines is slow (takes 5–7 minutes for cluster startup) and expensive.

1. **Decoupling Business Logic from Cloud I/O**:
   - Architecture Rule: **Separate Transformations from I/O**.
   - Functions must accept DataFrames as inputs and return DataFrames as outputs without calling `spark.read` or `df.write` inside the business logic function.
   - Example:
     - `clean_customer_records(df: DataFrame) -> DataFrame` (100% pure transformation; testable locally).
     - `ingest_customers()` (handles I/O; tested via integration tests).

2. **Local In-Memory PySpark Testing Engine**:
   - Modern CI runners (GitHub Actions `ubuntu-latest`) can spin up a local in-memory SparkSession in **local[*]** mode in under 3 seconds using Java 11/17 and the standard open-source `pyspark` pip package.
   - DataFrame comparisons are performed using native PySpark testing functions (`assertDataFrameEqual`) or libraries like `chispa`, comparing schema and values with rich diff visualization.

### Phase 2: Implementation & Production Code Artifacts
Below is a complete unit testing suite using `pytest` and PySpark's native `assertDataFrameEqual`:

```python
# test_transforms.py: Automated PySpark Unit Test Suite
import pytest
from pyspark.sql import SparkSession
from pyspark.sql.types import StructType, StructField, StringType, DoubleType
from pyspark.testing.utils import assertDataFrameEqual

# Session-scoped in-memory Spark fixture (initialized once per test run)
@pytest.fixture(scope="session")
def spark():
    return (
        SparkSession.builder
        .master("local[2]")
        .appName("unit-testing-pyspark")
        .config("spark.sql.shuffle.partitions", "2")
        .config("spark.default.parallelism", "2")
        .config("spark.ui.enabled", "false")
        .getOrCreate()
    )

# The Business Logic Function Under Test
def standardize_currency(df):
    '''Converts USD amounts to EUR and filters negative values.'''
    from pyspark.sql.functions import col, round
    return (
        df.filter(col("amount") >= 0)
        .withColumn("amount_eur", round(col("amount") * 0.92, 2))
    )

# The Unit Test
def test_standardize_currency(spark):
    schema = StructType([
        StructField("txn_id", StringType(), False),
        StructField("amount", DoubleType(), False)
    ])
    
    # Input synthetic test data
    input_data = [
        ("T1", 100.0),
        ("T2", -50.0),  # Should be filtered out
        ("T3", 250.0)
    ]
    input_df = spark.createDataFrame(input_data, schema)
    
    # Expected output data
    expected_schema = StructType([
        StructField("txn_id", StringType(), False),
        StructField("amount", DoubleType(), False),
        StructField("amount_eur", DoubleType(), False)
    ])
    expected_data = [
        ("T1", 100.0, 92.0),
        ("T3", 250.0, 230.0)
    ]
    expected_df = spark.createDataFrame(expected_data, expected_schema)
    
    # Execute transformation
    actual_df = standardize_currency(input_df)
    
    # Assert exact schema and row equality (introduced in PySpark 3.5+)
    assertDataFrameEqual(actual_df, expected_df)
```

```yaml
# GitHub Actions CI Workflow (.github/workflows/unit_test.yml)
name: PySpark Unit Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Java
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          pip install pytest pyspark==3.5.0
      - name: Run Pytest
        run: pytest tests/ -v
```

### Phase 3: Production Pitfalls, Anti-Patterns & Failure Modes
- **The Floating Point Assertion Trap**: Asserting exact equality on floating point calculations (`amount == 92.00000000001`) fails across different CPU architectures. Always round floats or use `assertDataFrameEqual(..., checkRowOrder=False, rtol=1e-5)` with relative tolerance thresholds.
- **The 200 Shuffle Partition Slowness**: Forgetting to set `spark.sql.shuffle.partitions = 2` on the local test SparkSession. Open-source Spark defaults to 200 shuffle partitions; running 200 partitions on a 2-core laptop CPU slows down unit test execution from 2 seconds to 45 seconds.

### Phase 4: High-Pressure Interview Talking Points
- *What tool in PySpark 3.5+ replaced third-party chispa for DataFrame assertions?* `pyspark.testing.utils.assertDataFrameEqual`.
- *How do you test Delta Lake features like MERGE or Time Travel locally?* Include the `io.delta:delta-spark_2.12:3.x` dependency in the local SparkSession configurations (`spark.jars.packages`)."""
    }
]

if __name__ == '__main__':
    print(f"Curriculum Part 1 loaded: {len(CURRICULUM_PART_1)} items")
