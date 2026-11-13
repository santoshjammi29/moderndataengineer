import { ArchitectureDiagramItem } from "@/data/diagrams";
import {
  JourneyStageId,
  LearningJourney,
} from "@/types/learning-journey";

export const STAGE_METADATA: Record<
  JourneyStageId,
  { order: number; name: string; tagline: string; iconName: string }
> = {
  map: {
    order: 1,
    name: "Map",
    tagline: "System Landscape & Boundaries",
    iconName: "Compass",
  },
  predict: {
    order: 2,
    name: "Predict",
    tagline: "Retrieval Challenge & Hypothesis",
    iconName: "HelpCircle",
  },
  inspect: {
    order: 3,
    name: "Inspect",
    tagline: "Under-The-Hood Mechanics",
    iconName: "Search",
  },
  experiment: {
    order: 4,
    name: "Experiment",
    tagline: "Interactive Simulation & Code",
    iconName: "Sliders",
  },
  break: {
    order: 5,
    name: "Break",
    tagline: "Controlled Failure Injection",
    iconName: "AlertTriangle",
  },
  diagnose: {
    order: 6,
    name: "Diagnose",
    tagline: "Telemetry & Spark UI Signals",
    iconName: "Activity",
  },
  explain: {
    order: 7,
    name: "Explain",
    tagline: "Architectural Rationale & Trade-offs",
    iconName: "BookOpen",
  },
  operate: {
    order: 8,
    name: "Operate",
    tagline: "Production Runbook & Guardrails",
    iconName: "ShieldCheck",
  },
};

/**
 * Flagship Curated 8-Stage Learning Journeys
 */
const BESPOKE_JOURNEYS: Record<string, LearningJourney> = {
  data_skew_salting_repartition: {
    diagramId: "data_skew_salting_repartition",
    title: "Data Skew Mitigation, AQE Runtime Split & Two-Phase Salting",
    targetOutcome:
      "Diagnose severe partition skew in Spark shuffle joins, predict execution stragglers, simulate key salting rebalance, and configure production AQE skew mitigation.",
    prerequisites: [
      "Apache Spark Shuffle Mechanics",
      "SortMergeJoin vs BroadcastHashJoin",
      "Hash Partitioning Fundamentals",
    ],
    estimatedMinutes: 25,
    stages: {
      map: {
        stage: "map",
        name: "Map",
        tagline: "System Landscape & Boundaries",
        summary:
          "High-volume transaction join architecture where 39.8M fact transactions join against a 5,000-row customer dimension across distributed executor cores.",
        keyPoints: [
          "Data Source: 39,790,092 Parquet transaction records + 5,000 customer records partitioned across cluster storage.",
          "Shuffle Boundary: Default hash partitioning assigns rows via hash(cust_id) % num_partitions.",
          "Executor Cluster: 4 worker cores executing tasks in parallel across Stage boundaries.",
          "Downstream Consumer: Aggregation stage computing customer lifetime value and transaction summaries.",
        ],
      },
      predict: {
        stage: "predict",
        name: "Predict",
        tagline: "Retrieval Challenge & Hypothesis",
        summary:
          "Test your engineering intuition before executing the query. What happens when a single customer key accounts for 44.08% of all rows?",
        keyPoints: [
          "A single customer key ('C0YDPQWPBJ') contains 17,539,732 rows out of 39.8M total.",
          "Other 4,999 customers average ~4,451 rows each.",
        ],
        predictionScenario:
          "You run a standard SortMergeJoin in Spark with Adaptive Query Execution (AQE) disabled on 4 executor cores. How will the cluster behave?",
        predictionQuestion:
          "Which symptom will dominate the Spark UI Stage Execution timeline?",
        predictionOptions: [
          {
            id: "opt_balanced",
            label: "Tasks finish in roughly equal time (~3s each) because Spark dynamically load-balances tasks.",
            isCorrect: false,
            explanation:
              "Incorrect. Spark's standard hash partitioner blindly routes identical keys to the same partition. Spark does not dynamically balance tasks unless AQE Skew Join is explicitly enabled.",
            impactAnalysis: "Misconception: Assumes Spark has automatic runtime balancing by default.",
          },
          {
            id: "opt_straggler",
            label: "3 tasks finish in < 2 seconds, while 1 straggler task runs for 11+ seconds processing 17.5M rows, risking Tungsten disk spill.",
            isCorrect: true,
            explanation:
              "Correct! Because hash('C0YDPQWPBJ') % 4 lands entirely on Partition 0, 3 executor cores complete their tiny partitions almost instantly, while Core 0 is bottlenecked processing 17.5M records alone.",
            impactAnalysis:
              "Observed Evidence: Measured runtime of 11.32s where Task 0 duration dominates 90% of stage time.",
          },
          {
            id: "opt_driver_oom",
            label: "The Spark Driver immediately throws an OutOfMemoryError during query compilation.",
            isCorrect: false,
            explanation:
              "Incorrect. Key skew happens on the executors during shuffle read/sort, not on the Driver during logical optimization.",
            impactAnalysis: "Driver OOM typically occurs during broadcast collection or massive getPartitions metadata scans.",
          },
        ],
      },
      inspect: {
        stage: "inspect",
        name: "Inspect",
        tagline: "Under-The-Hood Mechanics",
        summary:
          "Deconstruct the physical SortMergeJoin execution plan and observe where the shuffle bottleneck occurs.",
        keyPoints: [
          "Exchange hashpartitioning(cust_id#10L, 200) reshuffles both datasets.",
          "SortMergeJoin requires sorting records by join key within each partition before streaming merge.",
          "Partition 0 receives 17.5M rows, consuming > 1.2 GB of off-heap Tungsten sort buffer memory.",
        ],
        codeOrPlanSnippet: `*(3) SortMergeJoin [cust_id#10L], [cust_id#20L], Inner
:- *(1) Sort [cust_id#10L ASC NULLS FIRST], false, 0
:  +- Exchange hashpartitioning(cust_id#10L, 4), ENSURE_REQUIREMENTS
:     +- *(1) FileScan parquet [cust_id#10L, txn_id#11L, amount#12] (39.8M rows)
+- *(2) Sort [cust_id#20L ASC NULLS FIRST], false, 0
   +- Exchange hashpartitioning(cust_id#20L, 4), ENSURE_REQUIREMENTS
      +- *(2) FileScan parquet [cust_id#20L, name#21] (5,000 rows)`,
        snippetLanguage: "text",
        snippetTitle: "Physical Execution Plan (Unmitigated SortMergeJoin)",
        inspectMechanisms: [
          "Tungsten In-Memory Sorter: Uses 8-byte pointer + 8-byte key prefix arrays. When partition exceeds available execution memory, Spark spills to local NVMe disk.",
          "Straggler Cascade: Downstream stages cannot begin until all 4 tasks complete, idling 75% of cluster compute.",
        ],
      },
      experiment: {
        stage: "experiment",
        name: "Experiment",
        tagline: "Interactive Simulation & Code",
        summary:
          "Interact with the Shuffle & Skew Sizer or inspect the reproducible PySpark benchmark notebook.",
        keyPoints: [
          "Adjust skew multiplier to 3.5x to observe the Core 0 straggler bar shoot up in real time.",
          "Review empirical measurements from 39.8M records across SortMergeJoin, AQE, and Broadcast.",
        ],
        simulatorUrl: "/modern-stack#simulators",
        simulatorLabel: "Open Shuffle & Skew Sizer",
        notebookUrl:
          "https://github.com/afaqueahmad7117/spark-experiments/blob/main/spark/1_data_skew/3_solving_data_skew_aqe_broadcast.ipynb",
        notebookLabel: "Run Skew Benchmark Notebook (39.8M Rows)",
        experimentSteps: [
          "Step 1: Open Shuffle & Skew Sizer and set Input Rows to 40M, Record Size to 250 bytes.",
          "Step 2: Increase Skew Multiplier from 1.0x to 4.0x. Watch predicted spill risk switch to 'High Disk Spill Risk'.",
          "Step 3: Compare runtime in the benchmark: SortMergeJoin takes 11.32s, while AQE Skew Join cuts it to 9.62s (-15%), and Broadcast cuts it to 2.78s (-75.5%).",
        ],
      },
      break: {
        stage: "break",
        name: "Break",
        tagline: "Controlled Failure Injection",
        summary:
          "Simulate what happens in production when skew severity escalates and container memory is exceeded.",
        keyPoints: [
          "When skewed partition exceeds memory.fraction * container_memory, Spark triggers disk spill.",
          "If disk spill volume exhausts local container storage or GC overhead limit is exceeded, the task crashes with Exit Code 137.",
        ],
        failureScenario:
          "Batch job with 200M rows where 80M rows have NULL or DEFAULT customer ID. Executor memory is restricted to 4 GB per container.",
        triggerCondition: "hash(NULL) % 200 routes 80M rows to a single partition. Sorter runs out of execution memory.",
        symptoms: [
          "Task 14 runs for 45 minutes while all other 199 tasks finished in 40 seconds.",
          "Executor logs report: 'org.apache.spark.memory.SparkOutOfMemoryError: Unable to acquire 67108864 bytes of memory'.",
          "YARN / Kubernetes Node Manager kills container: 'Container killed by YARN for exceeding memory limits (5.2 GB of 4.0 GB used)'.",
        ],
        exceptionSnippet: `26/11/13 14:22:01 ERROR Executor: Exception in task 14.0 in stage 3.0 (TID 842)
java.lang.OutOfMemoryError: Java heap space
  at org.apache.spark.util.collection.unsafe.sort.UnsafeExternalSorter.growPointerArray
  at org.apache.spark.sql.execution.joins.SortMergeJoinExec.doExecute`,
      },
      diagnose: {
        stage: "diagnose",
        name: "Diagnose",
        tagline: "Telemetry & Spark UI Signals",
        summary:
          "Use observable telemetry from the Spark UI and metrics to confirm data skew vs general cluster slowness.",
        keyPoints: [
          "Check Task Duration Distribution: Max task duration is > 5x the 75th percentile.",
          "Check Shuffle Read Size: Max partition read is orders of magnitude larger than median.",
          "Check Spill Metrics: Shuffle Spill (Memory) and Shuffle Spill (Disk) are non-zero only on the straggler task.",
        ],
        observableMetrics: [
          {
            metric: "Max Task Duration",
            normalBaseline: "2.1 seconds",
            brokenObserved: "11.32 seconds (5.4x)",
            unit: "seconds",
            significance: "Clear straggler signal: Max is severely decoupled from 75th percentile (1.8s).",
          },
          {
            metric: "Max Shuffle Read Size",
            normalBaseline: "180 KB",
            brokenObserved: "782 MB (4,344x)",
            unit: "megabytes",
            significance: "Severe partition volume imbalance caused by hot key 'C0YDPQWPBJ'.",
          },
          {
            metric: "Shuffle Spill (Disk)",
            normalBaseline: "0 MB",
            brokenObserved: "1.4 GB",
            unit: "gigabytes",
            significance: "Tungsten spilled internal row pointers to local disk due to heap exhaustion.",
          },
        ],
        diagnosticChecklist: [
          "Open Spark UI → Stage Details tab.",
          "Inspect the Task Metrics summary table (Min, 25th, Median, 75th, Max).",
          "If Max / Median ratio for Shuffle Read is > 3.0, data skew is confirmed.",
          "Check Executor Event Timeline for long light-blue (Shuffle Fetch) or dark-blue (Task Compute) bars on a single executor core.",
        ],
      },
      explain: {
        stage: "explain",
        name: "Explain",
        tagline: "Architectural Rationale & Trade-offs",
        summary:
          "Understand the engineering trade-offs between Broadcast Joins, AQE Adaptive Skew Join, and Two-Phase Key Salting.",
        keyPoints: [
          "BroadcastHashJoin: Best if dimension is < 10MB (eliminates shuffle entirely).",
          "AQE Skew Join: Best for general Spark 3.x queries without changing code.",
          "Two-Phase Salting: Mandatory when both tables are massive (> 100GB) and cannot be broadcasted.",
        ],
        tradeOffComparison: [
          {
            option: "BroadcastHashJoin",
            pros: "0 shuffle bytes; 4.07x speedup (2.78s runtime).",
            cons: "Fails with Driver OOM if dimension table exceeds executor memory threshold.",
            recommendation: "Use whenever small table fits safely in driver/executor RAM (default < 10MB).",
          },
          {
            option: "AQE Skew Join",
            pros: "Automatic runtime partition splitting; no code changes required.",
            cons: "Requires Spark 3.0+; opposite table partition must be replicated across split tasks.",
            recommendation: "Always enable spark.sql.adaptive.skewJoin.enabled = true in production.",
          },
          {
            option: "Two-Phase Salting",
            pros: "Flattens skew mathematically across any number of partitions for huge datasets.",
            cons: "Requires code changes; replicates dimension table N times, increasing network shuffle volume.",
            recommendation: "Use for multi-terabyte joins where neither side can be broadcasted.",
          },
        ],
        formulaTitle: "Salting Factor Calculation",
        formulaTex: "N = \\left\\lceil \\frac{\\text{Rows}_{\\text{hot\\_key}}}{\\text{Target\\_Partition\\_Rows}} \\right\\rceil = \\left\\lceil \\frac{17,539,732}{6,000,000} \\right\\rceil = 3",
        formulaExplanation:
          "Applying a salt range of [0 .. N-1] with N=3 splits the 17.5M records into 3 uniform partitions of ~5.8M rows, enabling 3 cores to process the hot key in parallel.",
      },
      operate: {
        stage: "operate",
        name: "Operate",
        tagline: "Production Runbook & Guardrails",
        summary:
          "Apply battle-tested Spark configurations, monitoring alert rules, and runbook guardrails to prevent skew incidents.",
        keyPoints: [
          "Enable Adaptive Query Execution and Skew Join in cluster defaults.",
          "Configure advisory partition size to align with cluster core count.",
          "Establish CI/CD quality gate checking for un-salted join keys with high null percentages.",
        ],
        productionConfigs: [
          {
            parameter: "spark.sql.adaptive.enabled",
            recommendedValue: "true",
            impact: "Enables runtime query re-optimization post-shuffle.",
            vendorOrEngine: "Apache Spark / Databricks / EMR",
          },
          {
            parameter: "spark.sql.adaptive.skewJoin.enabled",
            recommendedValue: "true",
            impact: "Automatically detects and splits partitions larger than skewFactor * median.",
            vendorOrEngine: "Apache Spark 3.0+",
          },
          {
            parameter: "spark.sql.adaptive.skewJoin.skewedPartitionFactor",
            recommendedValue: "5",
            impact: "Threshold multiplier above median partition size to qualify as skewed.",
            vendorOrEngine: "Apache Spark 3.0+",
          },
          {
            parameter: "spark.sql.adaptive.advisoryPartitionSizeInBytes",
            recommendedValue: "134217728 (128 MB)",
            impact: "Target size for coalesced and split shuffle partitions.",
            vendorOrEngine: "Apache Spark 3.0+",
          },
        ],
        monitoringAlertRules: [
          "Alert: SparkTaskSkewAlert fires when (max_task_duration / median_task_duration) > 4.0 for any stage running > 5 minutes.",
          "Alert: SparkShuffleSpillAlert fires when sum(stage_shuffle_spill_disk_bytes) > 50 GB across any production pipeline.",
        ],
        rollbackProcedure:
          "If AQE partition splitting causes excessive replication of the small side, disable skew join temporarily with 'SET spark.sql.adaptive.skewJoin.enabled = false' and apply explicit two-phase salting on the hot key.",
      },
    },
  },
  catalyst_photon_engine: {
    diagramId: "catalyst_photon_engine",
    title: "Databricks Compute: Catalyst Optimizer, AQE & Photon Engine",
    targetOutcome:
      "Master the 5-stage Catalyst query optimization pipeline, understand Janino whole-stage codegen vs native C++ Photon vectorization, and tune cost-based optimizer statistics.",
    prerequisites: ["SQL Relational Algebra", "Catalyst AST Trees", "Vectorized SIMD Execution"],
    estimatedMinutes: 30,
    stages: {
      map: {
        stage: "map",
        name: "Map",
        tagline: "System Landscape & Boundaries",
        summary:
          "Unified Databricks query execution stack bridging high-level SQL/DataFrame APIs to bare-metal CPU hardware via Catalyst and Photon.",
        keyPoints: [
          "Input: Declarative SQL / PySpark DataFrame parsed into an Unresolved Logical Plan.",
          "Catalyst Pipeline: Analysis → Logical Optimization → Physical Planning → Code Generation.",
          "Photon Engine: Native C++ execution engine replacing JVM Janino codegen with vectorized SIMD processing.",
        ],
      },
      predict: {
        stage: "predict",
        name: "Predict",
        tagline: "Retrieval Challenge & Hypothesis",
        summary: "Predict how Catalyst and Photon interact when executing custom Python UDFs vs native SQL functions.",
        keyPoints: [
          "Query contains a WHERE clause filtering 100M rows, followed by a Python @udf.",
        ],
        predictionScenario:
          "A query applies a custom Python @udf in the SELECT clause and filters on a Parquet date column in WHERE. What does Catalyst do?",
        predictionQuestion: "How will Catalyst handle predicate pushdown and Photon acceleration?",
        predictionOptions: [
          {
            id: "opt_full_photon",
            label: "Photon executes the entire query in C++, including the Python UDF, with 10x speedup.",
            isCorrect: false,
            explanation:
              "Incorrect. Photon cannot natively execute Python bytecode. Python UDFs force Spark to serialize data through Py4J to a Python worker process.",
            impactAnalysis: "Common trap: expecting native engines to magically accelerate black-box Python code.",
          },
          {
            id: "opt_hybrid_fallback",
            label: "Catalyst pushes the Parquet date filter down to storage, executes the scan in Photon, but falls back to the JVM/Py4J bridge for the Python UDF.",
            isCorrect: true,
            explanation:
              "Correct! Spark uses a hybrid execution model: Photon handles scan, filter, and projection, but hands off rows to the Python worker for the non-vectorized UDF.",
            impactAnalysis: "Best practice: replace Python UDFs with native pyspark.sql.functions or Pandas Vectorized UDFs.",
          },
        ],
      },
      inspect: {
        stage: "inspect",
        name: "Inspect",
        tagline: "Under-The-Hood Mechanics",
        summary: "Step through the 5 stages of the Catalyst optimization pipeline.",
        keyPoints: [
          "1. Unresolved Logical Plan: Validates syntax using Antlr4 grammar.",
          "2. Analyzed Logical Plan: Resolves column names and data types against the Catalog/Metastore.",
          "3. Optimized Logical Plan: Applies rule-based transformations (Constant Folding, Predicate Pushdown, Column Pruning).",
          "4. Physical Plan: Generates candidate physical operators (HashAggregate vs SortAggregate, BHJ vs SMJ) and scores via Cost-Based Optimizer (CBO).",
          "5. Code Generation / Photon: Generates whole-stage Java bytecode via Janino or native C++ vectorized operator pipelines.",
        ],
        codeOrPlanSnippet: `== Physical Plan ==
*(2) HashAggregate(keys=[department#10], functions=[sum(salary#12)])
+- Exchange hashpartitioning(department#10, 200), ENSURE_REQUIREMENTS
   +- *(1) HashAggregate(keys=[department#10], functions=[partial_sum(salary#12)])
      +- *(1) Project [department#10, salary#12]
         +- *(1) Filter (isnotnull(active#11) AND (active#11 = true))
            +- *(1) FileScan parquet [department#10,active#11,salary#12]
               PushedFilters: [IsNotNull(active), EqualTo(active,true)]`,
        snippetLanguage: "text",
        snippetTitle: "Catalyst Optimized Physical Plan with Predicate Pushdown",
        inspectMechanisms: [
          "RuleBatch: FixedPoint vs Once rule execution loops.",
          "Tree Transformation: Pattern matching using Scala PartialFunctions: plan.transform { case Filter(cond, child) => ... }",
        ],
      },
      experiment: {
        stage: "experiment",
        name: "Experiment",
        tagline: "Interactive Simulation & Code",
        summary: "Inspect query plans dynamically in the Spark Catalyst Visualizer.",
        keyPoints: [
          "Toggle between Unresolved, Analyzed, Optimized Logical, and Physical plans.",
          "Inspect the decompiled Janino Java bytecode snippet.",
        ],
        simulatorUrl: "/spark-catalyst",
        simulatorLabel: "Open Catalyst Plan Inspector",
        notebookUrl:
          "https://github.com/afaqueahmad7117/spark-experiments/blob/main/spark/2_reading_query_plans.ipynb",
        notebookLabel: "Run Query Plan Notebook (.explain(True))",
        experimentSteps: [
          "Step 1: Open /spark-catalyst and select the 'Aggregation & Partial Combine' scenario.",
          "Step 2: Inspect how Catalyst inserts HashAggregate twice (once before shuffle as partial_sum, and once after shuffle).",
          "Step 3: Switch to the Janino CodeGen tab to see the unrolled while() loop avoiding Java virtual method dispatch.",
        ],
      },
      break: {
        stage: "break",
        name: "Break",
        tagline: "Controlled Failure Injection",
        summary: "Inject a Cartesian Product / BroadcastNestedLoopJoin trap.",
        keyPoints: [
          "Missing or non-equi join condition forces Catalyst to pick CartesianProductExec or BroadcastNestedLoopJoin.",
        ],
        failureScenario: "Joining two tables on an inequality (e.g. table_a.date >= table_b.start_date).",
        triggerCondition: "No equality condition present; Catalyst cannot use HashJoin or SortMergeJoin.",
        symptoms: [
          "O(N * M) time complexity: 1M rows joined with 1M rows attempts 1,000,000,000,000 row evaluations.",
          "Executor GC time exceeds 80% as millions of temporary row tuples fill the JVM heap.",
          "Query hangs indefinitely at Stage 2.",
        ],
      },
      diagnose: {
        stage: "diagnose",
        name: "Diagnose",
        tagline: "Telemetry & Spark UI Signals",
        summary: "Identify plan degradation and CBO misestimations in the Spark UI.",
        keyPoints: [
          "Look for BroadcastNestedLoopJoin or CartesianProduct in the SQL Plan DAG.",
          "Check estimated row counts vs actual rows output in the stage visualizer.",
        ],
        observableMetrics: [
          {
            metric: "Estimated Rows vs Output Rows",
            normalBaseline: "Ratio ~ 1.0 (Accurate stats)",
            brokenObserved: "Est: 1,000 rows | Actual: 50,000,000 rows",
            unit: "rows",
            significance: "CBO picked BroadcastJoin based on stale metadata, causing Driver OOM during broadcast.",
          },
        ],
      },
      explain: {
        stage: "explain",
        name: "Explain",
        tagline: "Architectural Rationale & Trade-offs",
        summary: "Understand when Photon vectorization delivers 3x-8x speedups vs when it provides no benefit.",
        keyPoints: [
          "Photon excels at: columnar scans, string parsing, regex, decimal arithmetic, sort-merge joins, hash aggregates.",
          "Photon has no benefit for: network-bound shuffles, external REST API calls, Python UDFs, non-columnar formats (CSV/JSON).",
        ],
      },
      operate: {
        stage: "operate",
        name: "Operate",
        tagline: "Production Runbook & Guardrails",
        summary: "Production standards for table statistics and CBO configuration.",
        keyPoints: [
          "Schedule weekly ANALYZE TABLE jobs on gold tables.",
          "Enforce spark.sql.cbo.enabled = true.",
        ],
        productionConfigs: [
          {
            parameter: "spark.sql.cbo.enabled",
            recommendedValue: "true",
            impact: "Enables Cost-Based Optimizer using table size and column histograms.",
            vendorOrEngine: "Databricks / Apache Spark",
          },
          {
            parameter: "spark.sql.cbo.joinReorder.enabled",
            recommendedValue: "true",
            impact: "Reorders multi-table joins to minimize intermediate result cardinalities.",
            vendorOrEngine: "Databricks / Apache Spark",
          },
        ],
      },
    },
  },
  "delta-lake-acid-mechanics": {
    diagramId: "delta-lake-acid-mechanics",
    title: "Delta Lake ACID Transaction Log, Protocol & Optimistic Concurrency",
    targetOutcome:
      "Understand atomic commits via JSON transaction logs, optimistic concurrency control (OCC), checkpointing with Parquet, and conflict resolution during concurrent writes.",
    prerequisites: ["ACID Properties", "Object Storage Mechanics (S3/ADLS/GCS)", "Parquet File Format"],
    estimatedMinutes: 25,
    stages: {
      map: {
        stage: "map",
        name: "Map",
        tagline: "System Landscape & Boundaries",
        summary:
          "Storage architecture decoupling transaction metadata (_delta_log/*.json) from immutable Parquet data files on distributed cloud object stores.",
        keyPoints: [
          "Transaction Log: Ordered sequence of atomic commit files (_delta_log/000000.json, 000001.json).",
          "Data Files: Immutable columnar Parquet files containing row records.",
          "Checkpoint: Merged state file created every 10 commits (_delta_log/000010.checkpoint.parquet).",
          "Reader/Writer Clients: Spark, Trino, Flink, DuckDB reading consistent snapshots without table locks.",
        ],
      },
      predict: {
        stage: "predict",
        name: "Predict",
        tagline: "Retrieval Challenge & Hypothesis",
        summary: "Predict how Delta Lake handles concurrent writes without distributed locking.",
        keyPoints: [
          "Two concurrent streaming jobs attempt to commit to the same Delta table at commit version #42.",
        ],
        predictionScenario:
          "Job A and Job B both read commit #41 and begin writing. Job A commits '000042.json' first. Job B then attempts to write '000042.json'. What happens?",
        predictionQuestion: "What is Delta Lake's exact optimistic concurrency resolution?",
        predictionOptions: [
          {
            id: "opt_overwrite",
            label: "Job B overwrites Job A's commit, causing silent data loss of Job A's written records.",
            isCorrect: false,
            explanation:
              "Incorrect. Cloud storage atomic PUT-if-absent (or catalog commit protocols) prevents overwriting existing log files.",
            impactAnalysis: "Delta guarantees ACID atomicity and durability; silent overwrites are impossible.",
          },
          {
            id: "opt_retry_or_abort",
            label: "Job B's atomic PUT fails with a ConcurrentAppendException; Delta checks if Job B modified the same partitions as Job A: if not, it automatically retries as commit #43.",
            isCorrect: true,
            explanation:
              "Correct! Delta Lake uses Optimistic Concurrency Control (OCC). If the two jobs touched disjoint partitions, Delta automatically reconciles and commits Job B as version #43 without failing the user pipeline.",
            impactAnalysis: "Key takeaway: OCC enables high concurrency unless updates modify overlapping files.",
          },
        ],
      },
      inspect: {
        stage: "inspect",
        name: "Inspect",
        tagline: "Under-The-Hood Mechanics",
        summary: "Inspect the raw JSON commit structure inside _delta_log.",
        keyPoints: [
          "commitInfo: Operation type, user, timestamp, engine version.",
          "add: Adds new Parquet files with min/max statistics for data skipping.",
          "remove: Marks deleted or compacted files with a deletion timestamp (tombstone).",
        ],
        codeOrPlanSnippet: `{"commitInfo":{"timestamp":1700000000000,"operation":"MERGE","engineInfo":"Apache-Spark/3.5.0"}}
{"add":{"path":"part-00000-c000.snappy.parquet","size":142580,"dataChange":true,"stats":"{\\"numRecords\\":5000,\\"minValues\\":{\\"id\\":1},\\"maxValues\\":{\\"id\\":5000}}"}}
{"remove":{"path":"part-00000-b891.snappy.parquet","deletionTimestamp":1700000000000,"dataChange":true}}`,
        snippetLanguage: "json",
        snippetTitle: "Delta Log Atomic Commit Record (_delta_log/000042.json)",
        inspectMechanisms: [
          "Snapshot Reconstruction: State = Checkpoint Parquet + subsequent JSON deltas.",
          "Tombstone Lifecycle: Removed files remain physically on disk until VACUUM removes them after retention period (default 7 days).",
        ],
      },
      experiment: {
        stage: "experiment",
        name: "Experiment",
        tagline: "Interactive Simulation & Code",
        summary: "Experiment with Delta Lake table formats and vacuum life-cycles.",
        keyPoints: [
          "Explore how time-travel queries (VERSION AS OF 41) read previous consistent snapshots.",
        ],
        simulatorUrl: "/modern-stack#simulators",
        simulatorLabel: "Open Table Format & Catalog Selector",
        notebookUrl: "https://moderndataengineer.com/whiteboards?id=delta-lake-acid-mechanics",
        notebookLabel: "Inspect Delta ACID Whiteboard",
        experimentSteps: [
          "Step 1: Open /modern-stack#simulators and select 'Table Format & Catalog Selector'.",
          "Step 2: Choose 'Databricks UC' + 'Streaming Ingestion' to see recommended Delta log settings.",
          "Step 3: Review the storage cost vs time travel retention trade-offs.",
        ],
      },
      break: {
        stage: "break",
        name: "Break",
        tagline: "Controlled Failure Injection",
        summary: "Simulate a ConcurrentTransactionException caused by overlapping updates.",
        keyPoints: [
          "Two concurrent MERGE INTO statements targeting the exact same customer ID.",
        ],
        failureScenario: "Concurrent streaming updates both modifying row 'user_id = 99' at the exact same second.",
        triggerCondition: "Job B cannot rebase because Job A modified the exact same Parquet data file.",
        symptoms: [
          "Job B throws: 'io.delta.exceptions.ConcurrentAppendException: Files were added by a concurrent update'.",
          "Pipeline fails after exhausting max retries.",
        ],
      },
      diagnose: {
        stage: "diagnose",
        name: "Diagnose",
        tagline: "Telemetry & Spark UI Signals",
        summary: "Diagnose concurrency conflicts using DESCRIBE HISTORY.",
        keyPoints: [
          "Run 'DESCRIBE HISTORY table_name' to inspect commit timestamps, operation metrics, and user IDs.",
        ],
        diagnosticChecklist: [
          "Execute DESCRIBE HISTORY to inspect the conflicting commit operations.",
          "Check operationParameters to verify if partition predicates were missing in the MERGE condition.",
          "Partition the table on a coarse key (e.g. date) so concurrent writers touch isolated partitions.",
        ],
      },
      explain: {
        stage: "explain",
        name: "Explain",
        tagline: "Architectural Rationale & Trade-offs",
        summary: "Why Delta Lake uses OCC rather than pessimistic distributed locking (Zookeeper/Chubby).",
        keyPoints: [
          "Pessimistic locking adds network latency and creates single-point-of-failure bottlenecks.",
          "OCC provides lock-free reads and high throughput for typical analytical workloads.",
        ],
      },
      operate: {
        stage: "operate",
        name: "Operate",
        tagline: "Production Runbook & Guardrails",
        summary: "Production maintenance schedules for OPTIMIZE and VACUUM.",
        keyPoints: [
          "Schedule OPTIMIZE every 2-6 hours to bin-pack small files into 1GB targets.",
          "Never run VACUUM with retention < 168 hours (7 days) without overriding safety checks.",
        ],
        productionConfigs: [
          {
            parameter: "spark.databricks.delta.autoCompact.enabled",
            recommendedValue: "auto",
            impact: "Automatically coalesces small files into larger files during write commits.",
            vendorOrEngine: "Delta Lake / Databricks",
          },
          {
            parameter: "spark.databricks.delta.optimizeWrite.enabled",
            recommendedValue: "true",
            impact: "Dynamically re-partitions data prior to write to prevent small file explosion.",
            vendorOrEngine: "Delta Lake / Databricks",
          },
        ],
      },
    },
  },
};

const DIAGRAM_ALIASES: Record<string, string> = {
  "spark-data-skew-aqe-optimization": "data_skew_salting_repartition",
  "data_skew_salting_repartition": "data_skew_salting_repartition",
  "spark-catalyst-photon-engine": "catalyst_photon_engine",
  "catalyst_photon_engine": "catalyst_photon_engine",
  "delta-lake-under-the-hood": "delta-lake-acid-mechanics",
  "lakehouse-acid-concurrency": "delta-lake-acid-mechanics",
  "delta-lake-acid-mechanics": "delta-lake-acid-mechanics",
};

/**
 * Deterministic Adapter: Synthesizes a complete, rigorous 8-stage learning journey
 * for ANY of the 52 architecture diagrams from its existing metadata!
 */
export function getLearningJourney(diagram: ArchitectureDiagramItem): LearningJourney {
  if (!diagram || !diagram.id) {
    throw new Error("Invalid diagram item passed to getLearningJourney");
  }

  // 1. Check if a curated bespoke flagship journey exists directly or via alias
  const targetKey = DIAGRAM_ALIASES[diagram.id] || diagram.id;
  if (BESPOKE_JOURNEYS[targetKey]) {
    const bespoke = BESPOKE_JOURNEYS[targetKey];
    return {
      ...bespoke,
      diagramId: diagram.id, // preserve caller's exact diagram.id
      title: diagram.title,
    };
  }

  // 2. Synthesize a structured, deterministic 8-stage journey from the diagram's metadata
  const title = diagram.title;
  const category = diagram.category;
  const desc = diagram.description;
  const keyPoints = diagram.keyPoints || [];
  const mechanisms = diagram.technicalMechanisms || [];
  const failures = diagram.failureModesAndTriage || [];
  const governance = diagram.governanceAndCompliance || [];
  const architectNotes = diagram.architectNotes || "";

  // Extract first failure as the Break scenario
  const primaryFailure = failures.length > 0 ? failures[0] : "Unexpected resource exhaustion or network partition between compute and storage tier.";
  const secondaryFailure = failures.length > 1 ? failures[1] : "Downstream consumer latency breach or schema drift failure.";

  // Determine relevant simulator based on category and tags
  let simulatorUrl = "/modern-stack#simulators";
  let simulatorLabel = "Open Modern Stack Simulators";
  let notebookUrl = diagram.docLink || "https://moderndataengineer.com/whiteboards?id=" + diagram.id;
  let notebookLabel = "Inspect Official Reference & Blueprint";

  if (category === "Compute & Optimization" || diagram.tags.includes("spark") || diagram.tags.includes("catalyst")) {
    simulatorUrl = "/spark-engine";
    simulatorLabel = "Open Spark Engine Lab & Simulator";
    notebookUrl = "https://github.com/afaqueahmad7117/spark-experiments";
    notebookLabel = "Spark Experiments Repository";
  } else if (category === "Storage Engine" || diagram.tags.includes("delta") || diagram.tags.includes("iceberg")) {
    simulatorUrl = "/modern-stack#simulators";
    simulatorLabel = "Open Table Format & Catalog Selector";
  }

  const synthesized: LearningJourney = {
    diagramId: diagram.id,
    title: diagram.title,
    targetOutcome: `Deconstruct ${diagram.title}, understand its core mechanisms, predict system behavior under stress, diagnose production failures, and apply recommended operational guardrails.`,
    prerequisites: [
      `${category} Foundations`,
      "Distributed Systems Architecture",
      "Lakehouse Design Principles",
    ],
    estimatedMinutes: 20,
    stages: {
      map: {
        stage: "map",
        name: "Map",
        tagline: "System Landscape & Boundaries",
        summary: desc || `Architectural overview of ${title}, showing component boundaries, upstream sources, and downstream consumers.`,
        keyPoints: keyPoints.length > 0 ? keyPoints.slice(0, 4) : [
          "Core System Boundary: Decoupled compute engines and elastic cloud storage tier.",
          "Data Ingestion: Streaming and batch ingestion pipelines landing in open formats.",
          "Governance Layer: Unified catalog, role-based access control, and column-level auditing.",
          "Consumption Tier: BI dashboards, analytical SQL engines, and downstream ML models.",
        ],
      },
      predict: {
        stage: "predict",
        name: "Predict",
        tagline: "Retrieval Challenge & Hypothesis",
        summary: `Test your mental model of ${title}. What happens when traffic scales by 10x or network boundaries partition?`,
        keyPoints: [
          `Target Architecture: ${title}`,
          `Primary Domain: ${category}`,
        ],
        predictionScenario: `In this architecture (${title}), the upstream ingestion volume increases by 10x during an unexpected burst. How will the primary mechanism behave?`,
        predictionQuestion: "What is the primary architectural constraint that requires defensive engineering?",
        predictionOptions: [
          {
            id: "opt_correct",
            label: `The system's bottleneck shifts to ${mechanisms[0] || "the storage commit / network shuffle boundary"}, requiring backpressure or horizontal autoscaling.`,
            isCorrect: true,
            explanation: `Correct! Under 10x burst load, ${title} relies on ${mechanisms[0] || "elastic compute scaling and decoupled storage"} to prevent cascade failure.`,
            impactAnalysis: "Operational Focus: Always size buffer queues and configure advisory partition limits defensively.",
          },
          {
            id: "opt_incorrect",
            label: "The system requires zero scaling because cloud object stores offer infinite instantaneous compute without limits.",
            isCorrect: false,
            explanation: "Incorrect. While object storage offers massive bandwidth, compute clusters, metadata catalogs, and network interfaces have hard rate limits.",
            impactAnalysis: "Misconception: Conflating storage elasticity with compute capacity.",
          },
        ],
      },
      inspect: {
        stage: "inspect",
        name: "Inspect",
        tagline: "Under-The-Hood Mechanics",
        summary: `Examine the internal engine mechanics and protocol specifications powering ${title}.`,
        keyPoints: mechanisms.length > 0 ? mechanisms : [
          "Atomic State Transitions: Protocol-level ACID commits ensuring zero data corruption.",
          "Zero-Copy Virtualization: Metadata pointers avoiding physical data duplication.",
          "Distributed Shuffle Exchange: Parallel hash-partitioned data movement across cluster nodes.",
        ],
        inspectMechanisms: mechanisms,
        codeOrPlanSnippet: architectNotes ? `// Architect Design Protocol: ${title}\n${architectNotes}` : undefined,
        snippetLanguage: "text",
        snippetTitle: "Architect Design Specification",
      },
      experiment: {
        stage: "experiment",
        name: "Experiment",
        tagline: "Interactive Simulation & Code",
        summary: `Simulate configuration changes and observe the operational response for ${title}.`,
        keyPoints: [
          "Adjust parameters to test system resilience and cost trade-offs.",
          "Review canonical reference documentation and runnable code snippets.",
        ],
        simulatorUrl,
        simulatorLabel,
        notebookUrl,
        notebookLabel,
        experimentSteps: [
          `Step 1: Open ${simulatorLabel} and select parameters relevant to ${title}.`,
          "Step 2: Compare baseline metrics against scaled workloads.",
          "Step 3: Verify the architectural decisions against primary documentation.",
        ],
      },
      break: {
        stage: "break",
        name: "Break",
        tagline: "Controlled Failure Injection",
        summary: `Examine the primary failure mode and incident trigger in ${title}.`,
        keyPoints: [
          "Understand how failure propagates across component boundaries.",
          "Identify root-cause triggers before they impact production SLAs.",
        ],
        failureScenario: primaryFailure,
        triggerCondition: "High load, unexpected schema change, or network timeout exceeding retry thresholds.",
        symptoms: [
          "Pipeline latency breach exceeding P99 SLA.",
          "Worker task failure count exceeding maximum failure threshold (spark.task.maxFailures).",
          secondaryFailure,
        ],
      },
      diagnose: {
        stage: "diagnose",
        name: "Diagnose",
        tagline: "Telemetry & Spark UI Signals",
        summary: `Identify observable telemetry, error codes, and audit logs to isolate the root cause.`,
        keyPoints: [
          "Isolate symptoms to storage, compute, catalog, or networking.",
          "Follow a structured triage checklist to resolve incidents efficiently.",
        ],
        diagnosticChecklist: [
          "Check engine execution metrics and stage failure summaries.",
          "Verify catalog transaction logs for lock timeouts or concurrent update conflicts.",
          "Inspect cloud storage throttled request metrics (HTTP 503 Slow Down / 429 Too Many Requests).",
          "Validate schema evolution rules against recent upstream producer commits.",
        ],
        observableMetrics: [
          {
            metric: "Execution Latency",
            normalBaseline: "Nominal SLA (< 5m)",
            brokenObserved: "> 45m or Hung",
            unit: "minutes",
            significance: "Indicates straggler task, deadlocked commit, or resource contention.",
          },
          {
            metric: "Error Rate / Retries",
            normalBaseline: "0% retries",
            brokenObserved: "> 15% retries",
            unit: "percentage",
            significance: "Signifies transient network partition or API rate limiting.",
          },
        ],
      },
      explain: {
        stage: "explain",
        name: "Explain",
        tagline: "Architectural Rationale & Trade-offs",
        summary: `Executive architectural trade-offs, design rationale, and cost/performance implications for ${title}.`,
        keyPoints: [
          architectNotes || "Balances throughput, consistency, operational simplicity, and cloud FinOps cost.",
          "Evaluates alternatives and explains why this pattern was selected for enterprise production.",
        ],
        tradeOffComparison: [
          {
            option: `${title} Pattern`,
            pros: "High reliability, clear separation of concerns, enterprise governance.",
            cons: "Requires active metadata management and monitoring hygiene.",
            recommendation: "Standard pattern for high-scale enterprise lakehouse deployments.",
          },
          {
            option: "Traditional Monolithic Warehouse",
            pros: "Simple single-vendor operational model.",
            cons: "High compute vendor lock-in; cannot support unstructured or streaming data natively.",
            recommendation: "Avoid for new greenfield modern data platform architectures.",
          },
        ],
      },
      operate: {
        stage: "operate",
        name: "Operate",
        tagline: "Production Runbook & Guardrails",
        summary: `Production deployment checklists, configuration guardrails, and compliance controls for ${title}.`,
        keyPoints: governance.length > 0 ? governance : [
          "Automate weekly maintenance (vacuum, compaction, catalog stats).",
          "Enforce role-based access control and least-privilege service principals.",
          "Configure dead-letter queues and alerting on pipeline latency breaches.",
        ],
        productionConfigs: [
          {
            parameter: "auto.maintenance.enabled",
            recommendedValue: "true",
            impact: "Ensures background bin-packing and metadata cleanup.",
            vendorOrEngine: category,
          },
          {
            parameter: "governance.lineage.tracking",
            recommendedValue: "enabled",
            impact: "Captures column-level lineage across all pipeline transformations.",
            vendorOrEngine: "Unity Catalog / Purview",
          },
        ],
        monitoringAlertRules: [
          `Alert: ${diagram.id}_LatencyBreach fires when pipeline duration exceeds 2x median.`,
          `Alert: ${diagram.id}_ErrorSpike fires when consecutive task failures > 3.`,
        ],
        rollbackProcedure:
          "Restore previous table version via time travel or revert infrastructure deployment via Terraform / CI/CD pipeline.",
      },
    },
  };

  return synthesized;
}
