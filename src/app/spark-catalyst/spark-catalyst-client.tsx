"use client";

import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Zap,
  Cpu,
  Layers,
  Activity,
  Flame,
  ArrowRight,
  ChevronDown,
  RotateCcw,
  Download,
  BookOpen,
  ShieldCheck,
  CheckCircle2,
  Code2,
  GitMerge,
  Play,
  Terminal,
  FileCode2,
  Sparkles,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { architectureDiagrams, ArchitectureDiagramItem } from "@/data/diagrams";
import { CodeSheetItem } from "@/types/data";
import { WhiteboardCard } from "@/components/architecture/whiteboard-card";
import { WhiteboardThemeToggle } from "@/components/architecture/whiteboard-theme-toggle";
import { CodeBlock } from "@/components/ui/code-block";
import { SmoothAccordion } from "@/components/ui/smooth-accordion";
import { PrerequisiteBanner } from "@/components/ui/prerequisite-banner";
import { OptimizationFlow } from "@/components/cheatsheet/optimization-flow";

type CatalystSubtab = "visualizer" | "pipeline" | "inspector" | "blueprint" | "tuning";

interface SparkCatalystClientProps {
  initialPyspark?: CodeSheetItem[];
}

interface PlanQueryScenario {
  id: string;
  name: string;
  description: string;
  sql: string;
  unresolvedPlan: string;
  optimizedLogicalPlan: string;
  catalystRulesApplied: string[];
  physicalPlan: string;
  codegenSnippet: string;
}

const PLAN_SCENARIOS: PlanQueryScenario[] = [
  {
    id: "fact-dim-filter",
    name: "Fact-Dim Filter & Join",
    description: "Star-schema join with filter pushdown skipping Parquet row groups and pruning unneeded columns.",
    sql: `SELECT o.order_id, c.customer_name, o.amount
FROM fact_orders o
JOIN dim_customers c ON o.customer_id = c.customer_id
WHERE o.order_date >= '2026-01-01'
  AND c.country = 'United Kingdom';`,
    unresolvedPlan: `'Project ['o.order_id, 'c.customer_name, 'o.amount]
+- 'Filter (('o.order_date >= 2026-01-01) AND ('c.country = United Kingdom))
   +- 'Join Inner, ('o.customer_id = 'c.customer_id)
      :- 'UnresolvedRelation [fact_orders], [o]
      +- 'UnresolvedRelation [dim_customers], [c]`,
    optimizedLogicalPlan: `Project [order_id#101L, customer_name#202, amount#103]
+- Join Inner, (customer_id#102L = customer_id#201L)
   :- Project [order_id#101L, customer_id#102L, amount#103]
   :  +- Filter (order_date#104 >= 2026-01-01)
   :     +- Relation[fact_orders] (PushedFilters: [IsNotNull(order_date), GreaterThanOrEqual(order_date, 2026-01-01)])
   +- Project [customer_id#201L, customer_name#202]
      +- Filter (country#203 = 'United Kingdom')
         +- Relation[dim_customers] (PushedFilters: [IsNotNull(country), EqualTo(country, 'United Kingdom')])`,
    catalystRulesApplied: [
      "PushDownPredicates: Pushed order_date filter to fact_orders scan",
      "PushDownPredicates: Pushed country filter to dim_customers scan",
      "ColumnPruning: Pruned fact_orders columns to only [order_id, customer_id, amount]",
      "ColumnPruning: Pruned dim_customers columns to only [customer_id, customer_name]",
      "InferFiltersFromConstraints: Injected IsNotNull(customer_id) on both relations",
    ],
    physicalPlan: `*(2) Project [order_id#101L, customer_name#202, amount#103]
+- *(2) BroadcastHashJoin [customer_id#102L], [customer_id#201L], Inner, BuildRight
   :- *(2) Filter (isnotnull(order_date#104) AND (order_date#104 >= 2026-01-01))
   :  +- *(2) FileScan parquet fact_orders[order_id#101L,customer_id#102L,amount#103,order_date#104]
   +- BroadcastExchange HashedRelationBroadcastMode(List(input[0, bigint, false]))
      +- *(1) Project [customer_id#201L, customer_name#202]
         +- *(1) Filter (isnotnull(country#203) AND (country#203 = 'United Kingdom'))
            +- *(1) FileScan parquet dim_customers[customer_id#201L,customer_name#202,country#203]`,
    codegenSnippet: `// WholeStageCodegen Subtree (Stage 2)
while (inputAdapter.hasNext()) {
  InternalRow row = (InternalRow) inputAdapter.next();
  long customerId = row.getLong(1);
  UnsafeRow matchedCustomer = (UnsafeRow) broadcastRelation.getValue(customerId);
  if (matchedCustomer != null) {
    long orderId = row.getLong(0);
    double amount = row.getDouble(2);
    UTF8String custName = matchedCustomer.getUTF8String(1);
    outputRowWriter.reset();
    outputRowWriter.write(0, orderId);
    outputRowWriter.write(1, custName);
    outputRowWriter.write(2, amount);
    append(outputRowWriter.getRow());
  }
}`,
  },
  {
    id: "skew-join",
    name: "Adaptive Skew Join Mitigation",
    description: "High-volume shuffle join where AQE dynamically detects straggler partitions and splits them into sub-slices.",
    sql: `SELECT /*+ SKEW('web_logs', 'user_id', (0, 99999)) */
       l.event_time, l.url, u.user_tier
FROM web_logs l
JOIN dim_users u ON l.user_id = u.user_id;`,
    unresolvedPlan: `'Project ['l.event_time, 'l.url, 'u.user_tier]
+- 'Join Inner, ('l.user_id = 'u.user_id)
   :- 'UnresolvedRelation [web_logs], [l]
   +- 'UnresolvedRelation [dim_users], [u]`,
    optimizedLogicalPlan: `Project [event_time#301, url#302, user_tier#402]
+- Join Inner, (user_id#303L = user_id#401L)
   :- Project [event_time#301, url#302, user_id#303L]
   :  +- Relation[web_logs]
   +- Project [user_id#401L, user_tier#402]
      +- Relation[dim_users]`,
    catalystRulesApplied: [
      "AQE.OptimizeSkewedJoin: Detected partition #14 has 48M rows (12x median partition size)",
      "AQE.SplitSkewedPartitions: Split Partition #14 of web_logs into 8 sub-slices of 6M rows each",
      "AQE.ReplicateOppositeSide: Replicated corresponding dim_users partition across all 8 sub-tasks",
      "EnsureRequirements: Aligned partition specs for parallel sort-merge join without data skew delay",
    ],
    physicalPlan: `AdaptiveSparkPlan isFinalPlan=true
+- *(3) Project [event_time#301, url#302, user_tier#402]
   +- *(3) SortMergeJoin [user_id#303L], [user_id#401L], Inner
      :- *(1) Sort [user_id#303L ASC NULLS FIRST], false, 0
      :  +- AQEShuffleRead (isSkewed=true, splitParts=8)
      :     +- ShuffleExchange hashpartitioning(user_id#303L, 200), ENSURE_REQUIREMENTS
      :        +- *(1) FileScan parquet web_logs[event_time#301,url#302,user_id#303L]
      +- *(2) Sort [user_id#401L ASC NULLS FIRST], false, 0
         +- AQEShuffleRead (replicatedForSkew=true)
            +- ShuffleExchange hashpartitioning(user_id#401L, 200), ENSURE_REQUIREMENTS
               +- *(2) FileScan parquet dim_users[user_id#401L,user_tier#402]`,
    codegenSnippet: `// AQE Skew Join Worker Subtree (Partition 14, Sub-chunk 3 of 8)
// Processes strictly bytes 128MB-256MB of the skewed key (user_id = 0)
while (skewSubReader.hasNext()) {
  InternalRow skewedFactRow = skewSubReader.next();
  long userId = skewedFactRow.getLong(2);
  // Replicated dimension index lookup runs fully in L3 CPU Cache
  UnsafeRow dimMatch = dimIndex.lookup(userId);
  if (dimMatch != null) {
    emitJoinedRow(skewedFactRow, dimMatch);
  }
}`,
  },
  {
    id: "aggregation-combine",
    name: "Two-Phase HashAggregate",
    description: "Map-side combiner reduces row counts in Tungsten off-heap memory before shuffle exchange.",
    sql: `SELECT department_id,
       COUNT(*) AS total_employees,
       AVG(salary) AS avg_salary
FROM employees
GROUP BY department_id;`,
    unresolvedPlan: `'Aggregate ['department_id], ['department_id, 'COUNT(1) AS total_employees, 'AVG('salary) AS avg_salary]
+- 'UnresolvedRelation [employees]`,
    optimizedLogicalPlan: `Aggregate [department_id#501], [department_id#501, count(1) AS total_employees#601L, avg(salary#502) AS avg_salary#602]
+- Project [department_id#501, salary#502]
   +- Relation[employees]`,
    catalystRulesApplied: [
      "TwoPhaseAggregate: Injected Partial HashAggregate on map-side to reduce network payload by 98%",
      "TungstenBytesToBytesMap: Replaced Java HashMaps with 64-bit compact binary hash table",
      "WholeStageCodeGen: Collapsed aggregation loop into single high-throughput Janino function",
    ],
    physicalPlan: `*(2) HashAggregate(keys=[department_id#501], functions=[count(1), avg(salary#502)])
+- Exchange hashpartitioning(department_id#501, 200), ENSURE_REQUIREMENTS
   +- *(1) HashAggregate(keys=[department_id#501], functions=[partial_count(1), partial_avg(salary#502)])
      +- *(1) FileScan parquet employees[department_id#501,salary#502]`,
    codegenSnippet: `// Map-Side Partial HashAggregate in Tungsten Off-Heap Memory
BytesToBytesMap map = (BytesToBytesMap) executionMemory.getMap();
while (scanIterator.hasNext()) {
  InternalRow row = scanIterator.next();
  long deptId = row.getLong(0);
  double sal = row.getDouble(1);
  Location loc = map.lookup(deptId);
  if (loc.isDefined()) {
    loc.incrementCount(1);
    loc.addSum(sal);
  } else {
    loc.putNew(deptId, 1, sal);
  }
}`,
  },
  {
    id: "auto-broadcast-lookup",
    name: "Auto-Broadcast Join Threshold",
    description: "Cost-Based Optimizer checks table size against spark.sql.autoBroadcastJoinThreshold and promotes SMJ to BHJ.",
    sql: `SELECT t.tx_id, t.amount, c.currency_rate
FROM transactions t
JOIN currency_lookup c ON t.currency_code = c.currency_code;`,
    unresolvedPlan: `'Project ['t.tx_id, 't.amount, 'c.currency_rate]
+- 'Join Inner, ('t.currency_code = 'c.currency_code)
   :- 'UnresolvedRelation [transactions], [t]
   +- 'UnresolvedRelation [currency_lookup], [c]`,
    optimizedLogicalPlan: `Project [tx_id#701L, amount#702, currency_rate#802]
+- Join Inner, (currency_code#703 = currency_code#801)
   :- Project [tx_id#701L, amount#702, currency_code#703]
   :  +- Relation[transactions]
   +- Project [currency_code#801, currency_rate#802]
      +- Relation[currency_lookup] (sizeInBytes = 24.5 KB <= autoBroadcastJoinThreshold)`,
    catalystRulesApplied: [
      "CostBasedOptimizer: Measured currency_lookup size = 24.5 KB (well below 10MB default threshold)",
      "JoinSelection: Replaced SortMergeJoinExec with BroadcastHashJoinExec",
      "EliminateShuffles: Removed ShuffleExchange from transactions and currency_lookup branches",
    ],
    physicalPlan: `*(2) Project [tx_id#701L, amount#702, currency_rate#802]
+- *(2) BroadcastHashJoin [currency_code#703], [currency_code#801], Inner, BuildRight
   :- *(2) FileScan parquet transactions[tx_id#701L,amount#702,currency_code#703]
   +- BroadcastExchange HashedRelationBroadcastMode
      +- *(1) FileScan parquet currency_lookup[currency_code#801,currency_rate#802]`,
    codegenSnippet: `// Driver broadcasts 24KB hash table to executors via BitTorrent protocol
// Each executor thread evaluates millions of transactions without waiting on network shuffle
while (transScan.hasNext()) {
  InternalRow tx = transScan.next();
  UTF8String curr = tx.getUTF8String(2);
  double rate = broadcastHashTable.get(curr);
  emit(tx.getLong(0), tx.getDouble(1), rate);
}`,
  },
];

export function SparkCatalystClient({ initialPyspark }: SparkCatalystClientProps) {
  const searchParams = useSearchParams();
  const initialTabParam = searchParams.get("tab") as CatalystSubtab | null;
  const [activeTab, setActiveTab] = useState<CatalystSubtab>(
    initialTabParam && ["visualizer", "pipeline", "inspector", "blueprint", "tuning"].includes(initialTabParam)
      ? initialTabParam
      : "visualizer"
  );

  // Sync tab with URL
  const handleTabChange = useCallback((tab: CatalystSubtab) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.replaceState(null, "", url.toString());
    }
  }, []);

  // Simulator State
  const [flowType, setFlowType] = useState<"narrow" | "wide" | "broadcast" | "aggregation" | "skew">("narrow");
  const [simStep, setSimStep] = useState(0);
  const [isSimRunning, setIsSimRunning] = useState(false);
  const simTimersRef = useRef<NodeJS.Timeout[]>([]);

  const clearSimTimers = useCallback(() => {
    simTimersRef.current.forEach((t) => clearTimeout(t));
    simTimersRef.current = [];
  }, []);

  useEffect(() => {
    return () => clearSimTimers();
  }, [clearSimTimers]);

  const runSimulation = () => {
    clearSimTimers();
    setIsSimRunning(true);
    setSimStep(1);
    const t1 = setTimeout(() => setSimStep(2), 650);
    const t2 = setTimeout(() => {
      setSimStep(3);
      setIsSimRunning(false);
    }, 1400);
    simTimersRef.current.push(t1, t2);
  };

  const resetSimulation = () => {
    clearSimTimers();
    setIsSimRunning(false);
    setSimStep(0);
  };

  const simFlowDetails = {
    narrow: {
      title: "Narrow Dependency (Map / Filter / withColumn)",
      pipelinePhase: "Single-Stage Pipeline (Whole-Stage CodeGen)",
      mechanics: "Tasks execute completely in-place within each partition without data exchange over network interfaces. Zero shuffle boundaries.",
      benefit: "Extremely low serialization overhead. No stage boundaries; single Stage execution.",
      shuffled: "0 Bytes (Zero Network I/O)",
      tasks: "2 Tasks",
      stages: "1 Stage",
      catalystAction: "Collapsed into single Janino while-loop inside CPU registers.",
    },
    wide: {
      title: "Wide Dependency (Sort-Merge Shuffle Join)",
      pipelinePhase: "Multi-Stage Shuffle Boundary (Sort & Exchange)",
      mechanics: "All executor nodes write partition hash buckets to local disk, followed by a cluster-wide network exchange (Shuffle Fetch).",
      benefit: "Handles multi-terabyte unbroadcastable joins, but incurs heavy network serialization and disk I/O.",
      shuffled: "~18.4 GB",
      tasks: "200 Tasks",
      stages: "2 Stages",
      catalystAction: "Injected ShuffleExchangeExec and SortExec on both branches.",
    },
    broadcast: {
      title: "Map-Side Join (Broadcast Hash Join)",
      pipelinePhase: "Driver Broadcast via BitTorrent Protocol",
      mechanics: "The Driver JVM serializes the dimension table and broadcasts it via BitTorrent protocol to all worker nodes.",
      benefit: "Avoids whole-dataset shuffling. Fact table partitions are filtered and joined locally in memory.",
      shuffled: "~12 MB (Broadcast only)",
      tasks: "8 Tasks",
      stages: "1 Stage",
      catalystAction: "Demoted SortMergeJoinExec to BroadcastHashJoinExec via CBO stats.",
    },
    aggregation: {
      title: "Two-Phase Aggregation (HashAggregate)",
      pipelinePhase: "Map-Side Partial Combine -> Network Shuffle",
      mechanics: "Map-side combiner partially reduces rows inside Tungsten memory before sending compressed hash aggregates across network.",
      benefit: "Reduces raw network shuffle size by up to 90% compared to groupByKey.",
      shuffled: "~2.1 GB",
      tasks: "50 Tasks",
      stages: "2 Stages",
      catalystAction: "Generated partial_count / partial_sum map-side operators.",
    },
    skew: {
      title: "Adaptive Skew Join (Dynamic Sub-Partition Splitting)",
      pipelinePhase: "AQE Dynamic Runtime Re-planning",
      mechanics: "AQE runtime checks partition size histogram after shuffle map stage. Partitions > 5x median are split into sub-tasks.",
      benefit: "Prevents trailing stragglers from stalling 99% complete query batches.",
      shuffled: "~9.6 GB",
      tasks: "208 Tasks (8 split tasks)",
      stages: "2 Stages",
      catalystAction: "Dynamically rewrote stage DAG mid-flight using runtime statistics.",
    },
  };

  // SQL Inspector State
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("fact-dim-filter");
  const [inspectorViewMode, setInspectorViewMode] = useState<"sql" | "logical" | "physical" | "rules" | "codegen">("logical");

  const currentScenario = useMemo(() => {
    return PLAN_SCENARIOS.find((s) => s.id === selectedScenarioId) || PLAN_SCENARIOS[0];
  }, [selectedScenarioId]);

  // Whiteboard Blueprint
  const catalystDiagram = useMemo(() => {
    return architectureDiagrams.find((d) => d.id === "spark-catalyst-photon-engine");
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 space-y-4 pb-16">
      {/* ─── Hero Command Center Banner ─── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-500/10 via-amber-500/5 to-purple-500/10 border border-red-500/25 p-4 sm:p-5 shadow-xs isolate">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-4xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-red-500/15 border border-red-500/30 text-[10px] font-bold text-red-400">
              <Zap size={12} />
              <span>Spark 4.0 &amp; Databricks Compute Intelligence</span>
            </div>
            <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-[var(--foreground)] break-words">
              Spark Catalyst Optimizer &amp; Execution Visualizer
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed break-words">
              Deep dive into the 5-phase query optimization pipeline: Analysis, Rule-Based Logical Optimization,
              Cost-Based Planning (CBO), Whole-Stage CodeGen / Photon C++, and the live cluster partition visualizer.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <div className="px-3 py-1.5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] text-center shadow-2xs">
              <div className="text-xs sm:text-sm font-bold text-red-400 font-mono">5 Phases</div>
              <div className="text-[10px] text-[var(--muted-foreground)] font-medium">Catalyst Pipeline</div>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] text-center shadow-2xs">
              <div className="text-xs sm:text-sm font-bold text-purple-400 font-mono">AQE Active</div>
              <div className="text-[10px] text-[var(--muted-foreground)] font-medium">Dynamic Re-Planning</div>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] text-center shadow-2xs">
              <div className="text-xs sm:text-sm font-bold text-amber-400 font-mono">Photon Ready</div>
              <div className="text-[10px] text-[var(--muted-foreground)] font-medium">Vectorized C++</div>
            </div>
          </div>
        </div>

        {/* Quick Cross-Link to Spark Engine Internals & Memory Lab */}
        <div className="mt-3.5 pt-3 border-t border-[var(--border)]/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
            <Cpu size={14} className="text-blue-400 shrink-0" />
            <span>Companion Hub: Spark Unified JVM Memory Manager, Tungsten Formulas &amp; PySpark Curriculum</span>
          </div>
          <Link
            href="/spark-engine?tab=memory"
            className="inline-flex items-center gap-1 font-semibold text-blue-500 hover:text-blue-400 transition-colors"
          >
            <span>Open Spark Engine &amp; Memory Lab</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* Interactive Catalyst Optimization Flow Diagram */}
      <OptimizationFlow />

      {/* ─── Mode Switcher Navigation Pills ─── */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] overflow-x-auto scrollbar-none max-w-fit shadow-xs">
        {[
          { id: "visualizer", label: "Live Spark Visualizer", icon: Activity },
          { id: "pipeline", label: "5-Stage Catalyst Pipeline", icon: Layers },
          { id: "inspector", label: "SQL Plan Inspector", icon: Code2 },
          { id: "blueprint", label: "Whiteboard Blueprint", icon: Sparkles },
          { id: "tuning", label: "Production Rules & Tuning", icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id as CatalystSubtab)}
              className={cn(
                "flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer",
                isActive
                  ? "bg-red-600 text-white shadow-xs font-semibold"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              )}
            >
              <Icon size={13} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ════════════════════════════════════════════════════════════════════════════════════════
          TAB 1: LIVE SPARK VISUALIZER (PHYSICAL EXECUTION SIMULATOR)
      ════════════════════════════════════════════════════════════════════════════════════════ */}
      {activeTab === "visualizer" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 dark:text-red-400">
                  Interactive Cluster Simulator
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)] mt-0.5">
                  Physical Execution &amp; Partition Flow Visualizer
                </h3>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Simulate live task scheduling, byte compilation, and network shuffle exchanges across worker nodes.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={flowType}
                  onChange={(e) => {
                    setFlowType(e.target.value as any);
                    resetSimulation();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs font-semibold text-[var(--foreground)] outline-none cursor-pointer"
                  aria-label="Select execution flow type"
                >
                  <option value="narrow">Narrow Flow (Map / Filter)</option>
                  <option value="wide">Wide Flow (Sort-Merge Shuffle Join)</option>
                  <option value="broadcast">Map-Side Join (Broadcast Hash)</option>
                  <option value="aggregation">Two-Phase Hash Aggregate</option>
                  <option value="skew">AQE Skew Join (Dynamic Partition Split)</option>
                </select>

                <button
                  type="button"
                  onClick={runSimulation}
                  disabled={isSimRunning}
                  className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-all shadow-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <Play size={13} className={cn(isSimRunning && "animate-pulse")} />
                  <span>{isSimRunning ? "Simulating..." : "Run Execution Plan"}</span>
                </button>

                <button
                  type="button"
                  onClick={resetSimulation}
                  className="p-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                  title="Reset simulator"
                  aria-label="Reset simulation"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>

            {/* Visualizer Canvas & Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              {/* Live Cluster Topology */}
              <div className="lg:col-span-2 rounded-xl bg-[#090d13] border border-white/10 p-4 space-y-3 font-mono text-xs text-slate-300 shadow-inner">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                    <span className="text-[10px] text-slate-400 ml-1.5">spark-cluster-exec.scala</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-red-400 font-bold px-1.5 py-0.5 rounded bg-red-950/80 border border-red-800">
                      STEP {simStep} OF 3
                    </span>
                    <span className="text-[9px] text-purple-400 font-bold px-1.5 py-0.5 rounded bg-purple-950/80 border border-purple-800">
                      LIVE CLUSTER
                    </span>
                  </div>
                </div>

                {/* Node Columns */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-center">
                  {/* Column 1: Input Storage Partitions */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      1. Storage Slices (S3/OneLake)
                    </div>
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "p-2.5 rounded-lg border transition-all text-xs",
                          simStep >= 1
                            ? "bg-blue-950/70 border-blue-500/60 text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.3)] scale-[1.02]"
                            : "bg-slate-900/60 border-white/5 text-slate-400"
                        )}
                      >
                        <div className="font-semibold">Parquet Slice P{i}</div>
                        <div className="text-[9px] opacity-70">128MB RowGroup</div>
                        {simStep >= 1 && (
                          <div className="text-[9px] text-blue-400 font-mono mt-0.5">Scan Ingested ✔</div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Column 2: Executor CPU Cores */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      2. Executor JVM Cores
                    </div>
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "p-3 rounded-lg border transition-all text-xs flex flex-col items-center justify-center min-h-[70px]",
                          simStep === 2
                            ? "bg-purple-950/80 border-purple-500 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.4)] animate-pulse"
                            : simStep > 2
                            ? "bg-purple-950/40 border-purple-500/40 text-purple-300"
                            : "bg-slate-900/60 border-white/5 text-slate-400"
                        )}
                      >
                        <span className="flex items-center gap-1 font-semibold">
                          <Cpu size={12} className="text-purple-400" /> Executor Core #{i}
                        </span>
                        <span className="text-[9px] opacity-80 mt-1">
                          {simStep === 2
                            ? "Janino CodeGen / SIMD..."
                            : simStep === 3
                            ? "Execution Complete ✔"
                            : "Awaiting Schedule"}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Column 3: Tungsten Memory & Targets */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      3. Tungsten Memory Buffers
                    </div>
                    {[0, 1].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "p-2.5 rounded-lg border transition-all text-xs",
                          simStep === 3
                            ? "bg-green-950/70 border-green-500/70 text-green-300 shadow-[0_0_12px_rgba(34,197,94,0.3)] scale-[1.02]"
                            : "bg-slate-900/60 border-white/5 text-slate-400"
                        )}
                      >
                        <div className="font-semibold">Target Partition #{i}</div>
                        <div className="text-[9px] opacity-70">
                          {simStep === 3 ? "UnsafeRow Binary Format" : "Memory Buffer Standby"}
                        </div>
                        {simStep === 3 && (
                          <div className="text-[9px] text-green-400 font-mono mt-0.5">Materialized ✔</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live Console Output Bar */}
                <div className="mt-3 p-2.5 rounded-lg bg-black/60 border border-white/5 text-[11px] text-slate-400 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal size={13} className="text-red-400" />
                    <span>
                      {simStep === 0 && "Status: Cluster idle. Select a query flow pattern and click Run."}
                      {simStep === 1 && "Status: Stage 0 reading Parquet partitions into memory buffers..."}
                      {simStep === 2 && "Status: Stage 1 Whole-Stage CodeGen compiling bytecode to CPU registers..."}
                      {simStep === 3 && "Status: Query execution materialized. Output partitions buffered in Tungsten."}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-purple-400">
                    {simFlowDetails[flowType].pipelinePhase}
                  </span>
                </div>
              </div>

              {/* Metrics & Architectural Blueprint Breakdown */}
              <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-red-500 dark:text-red-400 uppercase tracking-wider">
                    Execution Telemetry
                  </span>
                  <h4 className="text-sm font-bold text-[var(--foreground)] mt-0.5">
                    {simFlowDetails[flowType].title}
                  </h4>
                </div>

                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                  {simFlowDetails[flowType].mechanics}
                </p>

                <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300">
                  <strong className="text-red-200">Catalyst Rule:</strong> {simFlowDetails[flowType].catalystAction}
                </div>

                {/* Real-time Stats */}
                <div className="pt-2 border-t border-[var(--border)] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--muted-foreground)]">Network Shuffled:</span>
                    <span className="font-mono font-bold text-orange-400">{simFlowDetails[flowType].shuffled}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--muted-foreground)]">Target Task Count:</span>
                    <span className="font-mono font-bold text-blue-400">{simFlowDetails[flowType].tasks}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--muted-foreground)]">Stage Boundaries:</span>
                    <span className="font-mono font-bold text-purple-400">{simFlowDetails[flowType].stages}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--border)] text-[11px] text-[var(--muted-foreground)]">
                  💡 <strong>Architect Takeaway:</strong> {simFlowDetails[flowType].benefit}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════════════════════
          TAB 2: 5-STAGE CATALYST PIPELINE DEEP DIVE
      ════════════════════════════════════════════════════════════════════════════════════════ */}
      {activeTab === "pipeline" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {[
              {
                step: "Phase 1",
                title: "Analysis & Catalog",
                color: "text-blue-400",
                badge: "Catalog Lookup",
                desc: "Antlr4 parses SQL text or DataFrame calls into an Unresolved Logical Plan. Resolves tables, schemas, and columns against Unity Catalog or Hive Metastore.",
                rules: ["ResolveRelations", "ResolveReferences", "TypeCoercion"],
              },
              {
                step: "Phase 2",
                title: "Logical Optimization",
                color: "text-purple-400",
                badge: "Rule-Based (RBO)",
                desc: "Applies standard relational algebra transforms to shrink tree size and push computations closer to source storage.",
                rules: ["PushDownPredicates", "ColumnPruning", "ConstantFolding", "NullPropagation"],
              },
              {
                step: "Phase 3",
                title: "Physical Planning",
                color: "text-amber-400",
                badge: "Cost-Based (CBO)",
                desc: "Translates logical operators into physical SparkPlans. Measures table size against thresholds to select Join algorithms.",
                rules: ["BroadcastHashJoin", "SortMergeJoin", "ShuffleHashJoin"],
              },
              {
                step: "Phase 4",
                title: "CodeGen & Photon",
                color: "text-red-400",
                badge: "Bytecode Compilation",
                desc: "Tungsten compiles whole-stage JVM bytecode using Janino, eliminating virtual function dispatch. Native Photon C++ executes vectorized SIMD instructions.",
                rules: ["WholeStageCodegen", "UnsafeRow Binary Format", "Photon SIMD"],
              },
              {
                step: "Phase 5",
                title: "Adaptive Execution",
                color: "text-emerald-400",
                badge: "Runtime Re-Plan (AQE)",
                desc: "Re-evaluates physical plan mid-flight using runtime statistics collected at shuffle stage barriers. Fixes skews and coalesces partitions.",
                rules: ["CoalesceShufflePartitions", "DemoteSortMergeJoinToBroadcast", "OptimizeSkewedJoin"],
              },
            ].map((p, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] space-y-2">
                <div className="flex items-center justify-between">
                  <span className={cn("text-[10px] font-bold uppercase tracking-wider", p.color)}>
                    {p.step}
                  </span>
                  <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-[var(--surface-2)] text-[var(--muted-foreground)] border border-[var(--border)]">
                    {p.badge}
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-[var(--foreground)]">{p.title}</h4>
                <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">{p.desc}</p>
                <div className="pt-1.5 border-t border-[var(--border)]">
                  <div className="text-[9px] font-bold text-[var(--foreground)] uppercase mb-1">Key Rules:</div>
                  <ul className="space-y-0.5 text-[10px] font-mono text-purple-400">
                    {p.rules.map((r, i) => (
                      <li key={i}>• {r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════════════════════
          TAB 3: SQL PLAN INSPECTOR (INTERACTIVE PLAYGROUND)
      ════════════════════════════════════════════════════════════════════════════════════════ */}
      {activeTab === "inspector" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Scenario Selectors */}
          <div className="flex items-center gap-1.5 overflow-x-auto p-1 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] max-w-fit shadow-xs scrollbar-none">
            {PLAN_SCENARIOS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedScenarioId(s.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer",
                  selectedScenarioId === s.id
                    ? "bg-red-600 text-white shadow-xs"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                )}
              >
                {s.name}
              </button>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] space-y-3">
            <div>
              <h4 className="text-sm sm:text-base font-bold text-[var(--foreground)]">
                {currentScenario.name}
              </h4>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                {currentScenario.description}
              </p>
            </div>

            {/* Plan Stage Subtab Switcher */}
            <div className="flex items-center gap-1.5 border-b border-[var(--border)] pb-2 flex-wrap">
              {[
                { id: "sql", label: "SQL Query" },
                { id: "logical", label: "Optimized Logical Plan" },
                { id: "rules", label: "Catalyst Rules Applied" },
                { id: "physical", label: "Physical Execution Plan" },
                { id: "codegen", label: "Decompiled Janino CodeGen" },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setInspectorViewMode(m.id as any)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer",
                    inspectorViewMode === m.id
                      ? "bg-red-500/15 text-red-400 font-bold border border-red-500/30"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Code / Plan Output */}
            <div>
              {inspectorViewMode === "sql" && (
                <CodeBlock code={currentScenario.sql} language="sql" filename="query.sql" />
              )}
              {inspectorViewMode === "logical" && (
                <CodeBlock code={currentScenario.optimizedLogicalPlan} language="text" filename="optimized_logical_plan.txt" />
              )}
              {inspectorViewMode === "rules" && (
                <div className="space-y-2 p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                  <div className="text-xs font-bold text-[var(--foreground)]">Catalyst Optimizer Rules Fired:</div>
                  <ul className="space-y-1.5 text-xs text-[var(--muted-foreground)]">
                    {currentScenario.catalystRulesApplied.map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-red-400 font-bold shrink-0">✔</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {inspectorViewMode === "physical" && (
                <CodeBlock code={currentScenario.physicalPlan} language="text" filename="physical_execution_plan.txt" />
              )}
              {inspectorViewMode === "codegen" && (
                <CodeBlock code={currentScenario.codegenSnippet} language="java" filename="GeneratedBytecode.java" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════════════════════
          TAB 4: WHITEBOARD BLUEPRINT INTEGRATION
      ════════════════════════════════════════════════════════════════════════════════════════ */}
      {activeTab === "blueprint" && catalystDiagram && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 dark:text-red-400">
                Visual System Blueprint
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)] mt-0.5">
                Databricks Compute: Catalyst Optimizer, AQE &amp; Photon Engine
              </h3>
            </div>
            <WhiteboardThemeToggle size="sm" showLabel={true} />
          </div>

          <div className="max-w-4xl mx-auto">
            <WhiteboardCard diagram={catalystDiagram} />
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════════════════════
          TAB 5: PRODUCTION RULES & TUNING
      ════════════════════════════════════════════════════════════════════════════════════════ */}
      {activeTab === "tuning" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {[
              {
                num: "01",
                title: "Always Collect Table & Column Statistics",
                desc: "The Cost-Based Optimizer (CBO) relies on accurate sizeInBytes, rowCount, and histogram stats. Run `ANALYZE TABLE table_name COMPUTE STATISTICS FOR ALL COLUMNS` to unlock optimal join ordering.",
                flag: "spark.sql.cbo.enabled = true",
              },
              {
                num: "02",
                title: "Tune Advisory Partition Sizes for AQE",
                desc: "By default, AQE targets 64MB coalesced partitions. In high-throughput clusters with fast NVMe SSDs, tune advisoryPartitionSize to 128MB to reduce metadata overhead.",
                flag: "spark.sql.adaptive.advisoryPartitionSizeInBytes = 134217728",
              },
              {
                num: "03",
                title: "Prevent Driver OOM with Broadcast Thresholds",
                desc: "Default broadcast limit is 10MB. Raising it to 100MB+ can crash the Driver JVM during BitTorrent serialization if multiple concurrent queries execute.",
                flag: "spark.sql.autoBroadcastJoinThreshold = 10485760",
              },
              {
                num: "04",
                title: "Avoid Black-Box Python UDFs",
                desc: "Standard Python UDFs are opaque black boxes to Catalyst: they prevent Predicate Pushdown and force Py4J row-by-row serialization. Use native Spark SQL functions or Pandas Vectorized UDFs.",
                flag: "Prefer pyspark.sql.functions over @udf",
              },
            ].map((rule) => (
              <div key={rule.num} className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-red-400 px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20">
                    Rule {rule.num}
                  </span>
                  <span className="text-[10px] font-mono text-[var(--muted-foreground)]">{rule.flag}</span>
                </div>
                <h4 className="text-sm font-bold text-[var(--foreground)]">{rule.title}</h4>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">{rule.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
