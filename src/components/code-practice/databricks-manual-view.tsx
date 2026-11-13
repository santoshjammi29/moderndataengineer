"use client";

import React, { useState, useMemo } from "react";
import {
  BookOpen,
  Cpu,
  Layers,
  ShieldCheck,
  Activity,
  Copy,
  Check,
  Search,
  ChevronDown,
  ChevronUp,
  Terminal,
  Database,
  AlertTriangle,
  Workflow,
  Sparkles,
  CheckCircle2,
  Sliders,
  DollarSign,
  Bot,
  Flame,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CodeBlock } from "@/components/ui/code-block";

interface ManualTier {
  id: "all" | "100" | "200" | "300" | "400";
  label: string;
  badge: string;
  description: string;
  color: string;
}

const TIERS: ManualTier[] = [
  {
    id: "all",
    label: "All Modules (Level 100–400)",
    badge: "Complete Reference",
    description: "Full end-to-end curriculum from cloud platform foundations to principal enterprise architecture.",
    color: "blue",
  },
  {
    id: "100",
    label: "Level 100: Foundational Architecture",
    badge: "Level 100",
    description: "Split-Plane Cloud Architecture, Classic vs. Serverless compute, ADLS Gen2/S3, DBUs, Workspace setup.",
    color: "sky",
  },
  {
    id: "200",
    label: "Level 200: Delta Lake & Medallion",
    badge: "Level 200",
    description: "_delta_log ACID protocol, Deletion Vectors (MoR), Liquid Clustering, Auto Loader, CDF & DLT.",
    color: "cyan",
  },
  {
    id: "300",
    label: "Level 300: Governance & Engine Internals",
    badge: "Level 300",
    description: "Unity Catalog 3-level namespace, Row/Column security, Catalyst AQE, Photon C++ SIMD, 5 S's diagnostics.",
    color: "purple",
  },
  {
    id: "400",
    label: "Level 400: Frameworks, DevOps & FinOps",
    badge: "Level 400",
    description: "Metadata frameworks, RocksDB stateful streaming, Databricks Asset Bundles (DABs), FinOps System Tables, Mosaic AI.",
    color: "amber",
  },
];

export function DatabricksManualView() {
  const [selectedTier, setSelectedTier] = useState<ManualTier["id"]>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "mod-1": true,
    "mod-2": true,
    "mod-3": true,
    "mod-4": true,
    "mod-5": true,
    "mod-6": true,
    "mod-7": true,
    "mod-8": true,
  });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const expandAll = () => {
    setExpandedSections({
      "mod-1": true,
      "mod-2": true,
      "mod-3": true,
      "mod-4": true,
      "mod-5": true,
      "mod-6": true,
      "mod-7": true,
      "mod-8": true,
    });
  };

  const collapseAll = () => {
    setExpandedSections({});
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-[var(--surface-1)] via-[var(--surface-2)] to-blue-500/5 border border-[var(--border)] relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Enterprise Architecture &amp; Engineering Reference
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Level 100 → Level 400
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-tight">
            Databricks Data Intelligence Platform: End-to-End Technical Manual
          </h2>

          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] max-w-4xl leading-relaxed">
            Structured progression from foundational cloud infrastructure to principal production architecture.
            Grounded in Delta Lake 3.2, DBR 15.4+ LTS Photon, Unity Catalog 3-tier governance, Lakeflow Pipelines,
            Databricks Asset Bundles (DABs), and System Tables FinOps.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-[var(--muted-foreground)] font-mono">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-400" /> 8 Technical Modules
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <CodeBlock code="" language="sql" className="hidden" />
              14 Production Code Blueprints
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <AlertTriangle size={13} className="text-amber-400" /> 6 Incident Triage Playbooks
            </span>
          </div>
        </div>
      </div>

      {/* Tier Filter & Search Bar */}
      <div className="space-y-3">
        {/* Tier Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {TIERS.map((tier) => {
            const isSelected = selectedTier === tier.id;
            return (
              <button
                key={tier.id}
                onClick={() => setSelectedTier(tier.id)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border flex items-center gap-1.5",
                  isSelected
                    ? "bg-blue-600 text-white border-blue-500 shadow-xs"
                    : "bg-[var(--surface-1)] border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
                )}
              >
                <span>{tier.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Collapse Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border)]">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <input
              type="text"
              placeholder="Search across all 8 manual modules (e.g. 'Liquid Clustering', 'RocksDB', 'DABs', 'FinOps')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-hidden focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              onClick={expandAll}
              className="px-2.5 py-1 text-[11px] font-medium rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] cursor-pointer"
            >
              Expand All
            </button>
            <span className="text-[var(--border)]">|</span>
            <button
              onClick={collapseAll}
              className="px-2.5 py-1 text-[11px] font-medium rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] cursor-pointer"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* Manual Content Sections */}
      <div className="space-y-4">
        {/* ════════════════════════════════════════════════════════════════ */}
        {/* MODULE 1: PLATFORM ARCHITECTURE & COMPUTE (LEVEL 100) */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {(selectedTier === "all" || selectedTier === "100") && (
          <div className="rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] overflow-hidden">
            <button
              onClick={() => toggleSection("mod-1")}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <Cpu size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-400">
                      Module 1 • Level 100
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
                    Platform Architecture &amp; Core Concepts
                  </h3>
                </div>
              </div>
              {expandedSections["mod-1"] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {expandedSections["mod-1"] && (
              <div className="p-4 sm:p-6 border-t border-[var(--border)] space-y-6 text-xs sm:text-sm text-[var(--foreground)] leading-relaxed">
                {/* 1.1 Split-Plane Architecture */}
                <div className="space-y-3">
                  <h4 className="text-sm sm:text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                    <span className="text-sky-400 font-mono">1.1</span> Split-Plane Cloud Architecture
                  </h4>
                  <p className="text-[var(--muted-foreground)]">
                    The Databricks Data Intelligence Platform is engineered on a split-plane security model that separates orchestration and metadata management from raw compute execution and persistent customer storage. This ensures proprietary enterprise data remains governed within customer storage accounts while automating infrastructure lifecycle tasks.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-1.5">
                      <span className="text-xs font-bold text-sky-400 block">Control Plane (Databricks-Managed)</span>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        Hosted in Databricks cloud subscription. Runs Workspace Web UI, Notebook command orchestration, Lakeflow Jobs scheduler, Cluster Manager, and Unity Catalog Metastore. Encrypted at rest and in transit.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-1.5">
                      <span className="text-xs font-bold text-blue-400 block">Compute Plane (Classic vs. Serverless)</span>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        Execution environment where Apache Spark, Photon, and Python processes transform data. Workloads run on either customer-hosted virtual networks (Classic) or Databricks-managed elastic compute pools (Serverless).
                      </p>
                    </div>
                  </div>

                  {/* Classic vs Serverless Comparison Table */}
                  <div className="space-y-1.5 pt-2">
                    <span className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider block">
                      Architectural Dimension: Classic vs. Serverless Compute Plane
                    </span>
                    <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[var(--surface-3)] text-[var(--muted-foreground)] uppercase text-[10px] font-mono">
                          <tr>
                            <th className="py-2.5 px-3">Architectural Dimension</th>
                            <th className="py-2.5 px-3">Classic Compute Plane</th>
                            <th className="py-2.5 px-3">Serverless Compute Plane</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)] bg-[var(--surface-2)]">
                          <tr>
                            <td className="py-2.5 px-3 font-semibold">Hosting Boundary</td>
                            <td className="py-2.5 px-3 text-[var(--muted-foreground)]">Customer cloud account (Azure VNet / AWS VPC)</td>
                            <td className="py-2.5 px-3 text-sky-400 font-semibold">Databricks-managed cloud subscription</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-3 font-semibold">Provisioning Latency</td>
                            <td className="py-2.5 px-3 text-amber-400 font-mono">3 to 7 minutes (VM allocation &amp; OS boot)</td>
                            <td className="py-2.5 px-3 text-emerald-400 font-mono font-bold">2 to 6 seconds (pre-warmed container pools)</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-3 font-semibold">Networking &amp; Security</td>
                            <td className="py-2.5 px-3 text-[var(--muted-foreground)]">Customer manages VNet injection, NSGs, NAT, subnets</td>
                            <td className="py-2.5 px-3 text-[var(--foreground)]">Databricks manages isolation + Private Link to storage</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-3 font-semibold">Autoscaling Mechanics</td>
                            <td className="py-2.5 px-3 text-[var(--muted-foreground)]">VM-level horizontal scaling based on task backlog</td>
                            <td className="py-2.5 px-3 text-sky-400 font-semibold">Sub-second workload-aware horizontal &amp; vertical elasticity</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-3 font-semibold">Operations &amp; Upgrades</td>
                            <td className="py-2.5 px-3 text-[var(--muted-foreground)]">Manual Databricks Runtime (DBR) selection &amp; tuning</td>
                            <td className="py-2.5 px-3 text-emerald-400 font-semibold">Fully versionless; automatic patching &amp; runtime upgrades</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* 1.2 Compute Resource Taxonomy & DBU Economics */}
                <div className="space-y-3 pt-3 border-t border-[var(--border)]">
                  <h4 className="text-sm sm:text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                    <span className="text-sky-400 font-mono">1.2</span> Compute Resource Taxonomy &amp; DBU Economics
                  </h4>
                  <p className="text-[var(--muted-foreground)]">
                    Selecting the appropriate compute type directly governs cloud infrastructure cost and workload isolation. Databricks bills platform usage in Databricks Units (DBUs), normalized units of processing capability per hour.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {[
                      {
                        title: "All-Purpose Compute",
                        sub: "Interactive & Exploration",
                        desc: "Ad-hoc notebook development, exploration, debugging. Shared via Unity Catalog Shared Access. 2x-3x higher DBU cost; never run scheduled production jobs.",
                        badge: "Higher DBU Rate",
                        badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
                      },
                      {
                        title: "Job Compute",
                        sub: "Automated Production ETL",
                        desc: "Ephemeral clusters provisioned automatically when a scheduled Lakeflow Job starts, terminating immediately upon completion. Cost-optimized for batch and streaming.",
                        badge: "Cost Optimized",
                        badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                      },
                      {
                        title: "SQL Warehouses",
                        sub: "Serverless / Pro",
                        desc: "Elastic compute clusters tuned for high-concurrency ANSI SQL queries, BI dashboards (Power BI, Tableau), and Photon-accelerated Intelligent Workload Management (IWM).",
                        badge: "Sub-Second Elasticity",
                        badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
                      },
                      {
                        title: "Lakeflow Pipelines",
                        sub: "Declarative DLT",
                        desc: "Managed compute clusters dedicated to running declarative streaming tables and materialized views with enhanced autoscaling and automatic checkpoint recovery.",
                        badge: "Managed State",
                        badgeColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
                      },
                    ].map((item, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-1.5 flex flex-col justify-between">
                        <div className="space-y-1">
                          <span className={cn("text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border inline-block", item.badgeColor)}>
                            {item.badge}
                          </span>
                          <h5 className="text-xs font-bold text-[var(--foreground)]">{item.title}</h5>
                          <span className="text-[10px] text-[var(--muted-foreground)] block">{item.sub}</span>
                          <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed pt-1">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* MODULE 2: DELTA LAKE STORAGE INTERNALS (LEVEL 200) */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {(selectedTier === "all" || selectedTier === "200") && (
          <div className="rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] overflow-hidden">
            <button
              onClick={() => toggleSection("mod-2")}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Database size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                      Module 2 • Level 200
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
                    Delta Lake Storage Internals &amp; Optimization
                  </h3>
                </div>
              </div>
              {expandedSections["mod-2"] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {expandedSections["mod-2"] && (
              <div className="p-4 sm:p-6 border-t border-[var(--border)] space-y-6 text-xs sm:text-sm text-[var(--foreground)] leading-relaxed">
                {/* 2.1 The ACID Transaction Log */}
                <div className="space-y-3">
                  <h4 className="text-sm sm:text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                    <span className="text-cyan-400 font-mono">2.1</span> The ACID Transaction Log (_delta_log)
                  </h4>
                  <p className="text-[var(--muted-foreground)]">
                    Delta Lake layers ACID transactional guarantees, scalable metadata handling, and schema enforcement directly atop immutable Apache Parquet files. Every Delta table contains a <code className="text-cyan-400 font-mono">_delta_log</code> subdirectory acting as the single source of truth for table state.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-1">
                      <span className="text-xs font-bold text-cyan-400 block font-mono">000000.json Commits</span>
                      <p className="text-[11px] text-[var(--muted-foreground)]">
                        Atomic JSON files recording discrete state actions: <code className="text-blue-300">add</code> (data files with min/max stats), <code className="text-red-300">remove</code> (tombstones), <code className="text-purple-300">metaData</code>, and <code className="text-emerald-300">protocol</code>.
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-1">
                      <span className="text-xs font-bold text-cyan-400 block font-mono">.checkpoint.parquet</span>
                      <p className="text-[11px] text-[var(--muted-foreground)]">
                        Every 10 commits, Delta aggregates all active actions into a columnar Parquet checkpoint, avoiding slow object storage listings during query planning.
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-1">
                      <span className="text-xs font-bold text-cyan-400 block font-mono">Row-Level Concurrency</span>
                      <p className="text-[11px] text-[var(--muted-foreground)]">
                        Optimistic Concurrency Control (OCC) with Row-Level Concurrency allows two concurrent UPDATE or MERGE statements on the same Parquet file to commit without conflict if they touch distinct rows.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2.2 Deletion Vectors */}
                <div className="space-y-3 pt-3 border-t border-[var(--border)]">
                  <h4 className="text-sm sm:text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                    <span className="text-cyan-400 font-mono">2.2</span> Deletion Vectors (Merge-on-Read vs. Copy-on-Write)
                  </h4>
                  <p className="text-[var(--muted-foreground)]">
                    Historically, Delta Lake relied exclusively on Copy-on-Write (CoW): deleting 1 row in a 512 MB file forced reading and rewriting the entire 512 MB file. Deletion Vectors (DVs) shift DML execution to Merge-on-Read (MoR):
                  </p>
                  <ul className="space-y-1.5 text-xs text-[var(--muted-foreground)] list-disc pl-5">
                    <li><strong className="text-[var(--foreground)]">Fast Write Path:</strong> Modifying rows leaves existing Parquet files untouched; Delta writes a roaring bitmap recording invalidated row offsets.</li>
                    <li><strong className="text-[var(--foreground)]">Read Path:</strong> Readers load the deletion vector bitmap and skip invalidated row offsets in memory during scan execution.</li>
                    <li><strong className="text-[var(--foreground)]">Physical Compaction:</strong> Purged asynchronously when <code className="text-cyan-300">OPTIMIZE</code> or <code className="text-cyan-300">REORG TABLE ... APPLY (PURGE)</code> runs.</li>
                  </ul>
                </div>

                {/* 2.3 Liquid Clustering vs Hive Partitioning */}
                <div className="space-y-3 pt-3 border-t border-[var(--border)]">
                  <h4 className="text-sm sm:text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                    <span className="text-cyan-400 font-mono">2.3</span> Liquid Clustering vs. Hive Partitioning &amp; Z-Ordering
                  </h4>
                  <p className="text-[var(--muted-foreground)]">
                    Liquid Clustering replaces rigid directory partitioning (<code className="text-cyan-400">PARTITIONED BY</code>) and <code className="text-cyan-400">ZORDER BY</code> using incremental Hilbert-curve space-filling curves:
                  </p>

                  <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[var(--surface-3)] text-[var(--muted-foreground)] uppercase text-[10px] font-mono">
                        <tr>
                          <th className="py-2.5 px-3">Feature</th>
                          <th className="py-2.5 px-3">Hive Partitioning</th>
                          <th className="py-2.5 px-3">Z-Ordering</th>
                          <th className="py-2.5 px-3">Liquid Clustering</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)] bg-[var(--surface-2)]">
                        <tr>
                          <td className="py-2.5 px-3 font-semibold">Physical Layout</td>
                          <td className="py-2.5 px-3 text-[var(--muted-foreground)]">Rigid directory folders (<code className="text-cyan-400 font-mono">col=val/</code>)</td>
                          <td className="py-2.5 px-3 text-[var(--muted-foreground)]">Co-located multi-dimensional sorting within files</td>
                          <td className="py-2.5 px-3 text-cyan-400 font-semibold">Hilbert curve ZCubes managed in metadata</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-semibold">Key Redefinition</td>
                          <td className="py-2.5 px-3 text-red-400">Requires full table rewrite</td>
                          <td className="py-2.5 px-3 text-amber-400">Re-sorts all files on next full OPTIMIZE</td>
                          <td className="py-2.5 px-3 text-emerald-400 font-bold">Instant metadata change via ALTER TABLE</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-semibold">Compaction Cost</td>
                          <td className="py-2.5 px-3 text-[var(--muted-foreground)]">Per-partition compaction</td>
                          <td className="py-2.5 px-3 text-amber-400">Idempotent only within partitions; costly on full table</td>
                          <td className="py-2.5 px-3 text-emerald-400 font-semibold">Fully incremental; clusters only new unclustered data</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-semibold">Skew Resilience</td>
                          <td className="py-2.5 px-3 text-red-400">Poor (uneven partition sizes)</td>
                          <td className="py-2.5 px-3 text-[var(--muted-foreground)]">Moderate</td>
                          <td className="py-2.5 px-3 text-emerald-400 font-bold">High (automatically balances files to 256MB–1GB)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Production DDL Code Block */}
                  <div className="space-y-1.5 pt-2">
                    <span className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider block">
                      Production DDL: Liquid Clustering, Deletion Vectors &amp; CDF
                    </span>
                    <CodeBlock
                      code={`-- Production DDL with Liquid Clustering, Deletion Vectors, and Change Data Feed
CREATE TABLE prod_catalog.silver.orders (
  order_id STRING NOT NULL,
  customer_id BIGINT NOT NULL,
  order_status STRING,
  order_ts TIMESTAMP,
  total_amount DECIMAL(18, 2)
)
CLUSTER BY (customer_id, order_ts)
TBLPROPERTIES (
  'delta.enableDeletionVectors' = true,
  'delta.enableRowTracking' = true,
  'delta.enableChangeDataFeed' = true
);

-- Evolve clustering keys dynamically without rewriting existing historical files
ALTER TABLE prod_catalog.silver.orders CLUSTER BY (order_ts, order_status);`}
                      language="sql"
                      filename="liquid_clustering_ddl.sql"
                    />
                  </div>
                </div>

                {/* 2.4 Predictive Optimization & UniForm */}
                <div className="space-y-3 pt-3 border-t border-[var(--border)]">
                  <h4 className="text-sm sm:text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                    <span className="text-cyan-400 font-mono">2.4</span> Predictive Optimization, VACUUM &amp; Delta UniForm
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-1">
                      <span className="text-xs font-bold text-cyan-400 block">Predictive Optimization</span>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        On Unity Catalog managed tables, Databricks automatically monitors query patterns and write frequency, executing background serverless <code className="text-cyan-300">OPTIMIZE</code>, <code className="text-cyan-300">VACUUM</code>, and <code className="text-cyan-300">ANALYZE</code> when cost-effective.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-1">
                      <span className="text-xs font-bold text-blue-400 block">Delta UniForm (Universal Format)</span>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        Generates Apache Iceberg and Apache Hudi metadata manifests asynchronously alongside <code className="text-blue-300">_delta_log</code> commits, allowing external engines (Snowflake, BigQuery, Trino) to query Delta tables with zero data duplication.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* MODULE 3: DATA ENGINEERING & MEDALLION PIPELINES (LEVEL 200-300) */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {(selectedTier === "all" || selectedTier === "200" || selectedTier === "300") && (
          <div className="rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] overflow-hidden">
            <button
              onClick={() => toggleSection("mod-3")}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Workflow size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400">
                      Module 3 • Level 200–300
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
                    Data Engineering &amp; Medallion Pipelines
                  </h3>
                </div>
              </div>
              {expandedSections["mod-3"] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {expandedSections["mod-3"] && (
              <div className="p-4 sm:p-6 border-t border-[var(--border)] space-y-6 text-xs sm:text-sm text-[var(--foreground)] leading-relaxed">
                {/* 3.1 Medallion Architecture */}
                <div className="space-y-3">
                  <h4 className="text-sm sm:text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                    <span className="text-purple-400 font-mono">3.1</span> The Medallion Lakehouse Architecture
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-1">
                      <span className="text-xs font-bold text-amber-500 block">🥉 Bronze (Raw Ingestion)</span>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        Append-only raw payloads enriched with audit columns (<code className="text-amber-400 font-mono">_metadata.file_path</code>, <code className="text-amber-400 font-mono">_ingest_ts</code>). Avoids destructive business filtering so downstream tables can be replayed.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-1">
                      <span className="text-xs font-bold text-slate-300 block">🥈 Silver (Cleansed &amp; Conformed)</span>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        Strict schema contracts, deduplication, null handling, timestamp standardization, and Slowly Changing Dimension (SCD Type 1 &amp; Type 2) merges. Single source of truth.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-1">
                      <span className="text-xs font-bold text-amber-400 block">🥇 Gold (Business Aggregates)</span>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        Dimensional star schemas (Fact &amp; Dimension tables) and pre-aggregated domain metrics optimized for low-latency BI dashboards (Power BI) and ML feature extraction.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3.2 Auto Loader Ingestion */}
                <div className="space-y-3 pt-3 border-t border-[var(--border)]">
                  <h4 className="text-sm sm:text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                    <span className="text-purple-400 font-mono">3.2</span> Incremental File Ingestion with Auto Loader (cloudFiles)
                  </h4>
                  <p className="text-[var(--muted-foreground)]">
                    Auto Loader ingests new files arriving in cloud storage incrementally and idempotently using Spark Structured Streaming. Eliminates expensive <code className="text-purple-300 font-mono">LIST</code> operations via File Notification Mode (Azure Event Grid / AWS SNS/SQS) and safely captures schema drift in <code className="text-purple-300 font-mono">_rescued_data</code>:
                  </p>

                  <CodeBlock
                    code={`from pyspark.sql import functions as F

df_bronze = (
    spark.readStream.format("cloudFiles")
    .option("cloudFiles.format", "json")
    .option("cloudFiles.schemaLocation", "/Volumes/prod_catalog/metadata/schemas/orders")
    .option("cloudFiles.inferColumnTypes", "true")
    .option("cloudFiles.schemaEvolutionMode", "addNewColumns")
    .option("rescuedDataColumn", "_rescued_data")
    .load("abfss://landing@storage.dfs.core.windows.net/raw/orders/")
    .select("*", "_metadata.file_path", F.current_timestamp().alias("_ingest_ts"))
)

(
    df_bronze.writeStream.format("delta")
    .option("checkpointLocation", "/Volumes/prod_catalog/metadata/checkpoints/orders_bronze")
    .option("mergeSchema", "true")
    .trigger(availableNow=True)
    .toTable("prod_catalog.bronze.orders_raw")
)`}
                    language="python"
                    filename="autoloader_bronze_ingest.py"
                  />
                </div>

                {/* 3.3 Change Data Capture & CDF Merge */}
                <div className="space-y-3 pt-3 border-t border-[var(--border)]">
                  <h4 className="text-sm sm:text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                    <span className="text-purple-400 font-mono">3.3</span> Change Data Capture (CDC) &amp; Delta Change Data Feed (CDF)
                  </h4>
                  <p className="text-[var(--muted-foreground)]">
                    When <code className="text-purple-400">delta.enableChangeDataFeed = true</code> is enabled, reading with <code className="text-purple-400">readChangeFeed</code> exposes <code className="text-purple-300 font-mono">_change_type</code>, <code className="text-purple-300 font-mono">_commit_version</code>, and <code className="text-purple-300 font-mono">_commit_timestamp</code>. Micro-batches must be deduplicated via Windowing before executing <code className="text-purple-400 font-mono">MERGE INTO</code> to prevent ambiguous match exceptions:
                  </p>

                  <CodeBlock
                    code={`from delta.tables import DeltaTable
from pyspark.sql import Window
import pyspark.sql.functions as F

cdf_stream = (
    spark.readStream.format("delta")
    .option("readChangeFeed", "true")
    .option("startingVersion", 1)
    .table("prod_catalog.silver.customers")
)

def upsert_cdf_to_gold(micro_batch_df, batch_id):
    if micro_batch_df.isEmpty():
        return

    # 1. Exclude pre-update images and retain only latest state per key in batch
    win_spec = Window.partitionBy("customer_id").orderBy(F.col("_commit_version").desc())
    deduped_changes = (
        micro_batch_df.filter(F.col("_change_type") != "update_preimage")
        .withColumn("_rn", F.row_number().over(win_spec))
        .filter(F.col("_rn") == 1)
        .drop("_rn", "_commit_version", "_commit_timestamp")
    )

    target_table = DeltaTable.forName(spark, "prod_catalog.gold.dim_customers")

    # 2. Execute idempotent MERGE handling updates, deletes, and inserts
    (
        target_table.alias("t")
        .merge(deduped_changes.alias("s"), "t.customer_id = s.customer_id")
        .whenMatchedDelete(condition="s._change_type = 'delete'")
        .whenMatchedUpdate(
            condition="s._change_type != 'delete'",
            set={"customer_name": "s.customer_name", "tier": "s.tier", "updated_at": "s.updated_at"}
        )
        .whenNotMatchedInsert(
            condition="s._change_type != 'delete'",
            values={"customer_id": "s.customer_id", "customer_name": "s.customer_name", "tier": "s.tier", "updated_at": "s.updated_at"}
        )
        .execute()
    )`}
                    language="python"
                    filename="cdf_window_dedup_merge.py"
                  />
                </div>

                {/* 3.4 Lakeflow Declarative Pipelines (DLT) */}
                <div className="space-y-3 pt-3 border-t border-[var(--border)]">
                  <h4 className="text-sm sm:text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                    <span className="text-purple-400 font-mono">3.4</span> Lakeflow Spark Declarative Pipelines (Delta Live Tables / DLT)
                  </h4>
                  <p className="text-[var(--muted-foreground)]">
                    Declarative pipelines replace imperative boilerplate with declarative SQL or Python definitions. Supports Streaming Tables, Materialized Views, Data Quality Expectations (<code className="text-purple-300 font-mono">EXPECT</code>, <code className="text-purple-300 font-mono">ON VIOLATION DROP ROW</code>, <code className="text-purple-300 font-mono">ON VIOLATION FAIL UPDATE</code>), and Declarative CDC via <code className="text-purple-300 font-mono">APPLY CHANGES INTO</code>:
                  </p>

                  <CodeBlock
                    code={`-- Declarative SQL Pipeline with Expectations and SCD Type 2 CDC
CREATE OR REFRESH STREAMING TABLE bronze_customers
AS SELECT *, _metadata.file_path AS source_file
FROM STREAM read_files('/Volumes/prod_catalog/landing/customers/', format => 'json');

CREATE OR REFRESH STREAMING TABLE silver_customers_scd2 (
  CONSTRAINT valid_customer_id EXPECT (customer_id IS NOT NULL) ON VIOLATION DROP ROW
);

APPLY CHANGES INTO LIVE.silver_customers_scd2
FROM STREAM(LIVE.bronze_customers)
KEYS (customer_id)
APPLY AS DELETE WHEN operation = 'DELETE'
SEQUENCE BY updated_timestamp
COLUMNS * EXCEPT (operation, source_file)
STORED AS SCD TYPE 2;`}
                    language="sql"
                    filename="lakeflow_declarative_scd2.sql"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* MODULE 4: UNIFIED GOVERNANCE WITH UNITY CATALOG (LEVEL 300) */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {(selectedTier === "all" || selectedTier === "300") && (
          <div className="rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] overflow-hidden">
            <button
              onClick={() => toggleSection("mod-4")}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                      Module 4 • Level 300
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
                    Unified Governance with Unity Catalog
                  </h3>
                </div>
              </div>
              {expandedSections["mod-4"] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {expandedSections["mod-4"] && (
              <div className="p-4 sm:p-6 border-t border-[var(--border)] space-y-6 text-xs sm:text-sm text-[var(--foreground)] leading-relaxed">
                {/* 4.1 Three-Level Namespace */}
                <div className="space-y-3">
                  <h4 className="text-sm sm:text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                    <span className="text-emerald-400 font-mono">4.1</span> Three-Level Namespace &amp; Securable Object Model
                  </h4>
                  <p className="text-[var(--muted-foreground)]">
                    Unity Catalog provides centralized access control, automated column-level lineage, auditing, and data discovery across all workspaces attached to a regional Metastore via <code className="text-emerald-400 font-mono">catalog.schema.table_or_view_or_volume</code>:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-1">
                      <span className="text-xs font-bold text-emerald-400 block font-mono">Metastore</span>
                      <p className="text-[11px] text-[var(--muted-foreground)]">Top-level regional container mapped to cloud storage credentials and linked across Dev, Staging, Prod workspaces.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-1">
                      <span className="text-xs font-bold text-emerald-400 block font-mono">Catalog</span>
                      <p className="text-[11px] text-[var(--muted-foreground)]">Primary isolation boundary representing environments (<code className="text-blue-300">dev_catalog</code>) or business domains (<code className="text-purple-300">finance_catalog</code>).</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-1">
                      <span className="text-xs font-bold text-emerald-400 block font-mono">Schema (Database)</span>
                      <p className="text-[11px] text-[var(--muted-foreground)]">Logical grouping of tables, views, volumes, functions, and ML models (<code className="text-amber-300">bronze</code>, <code className="text-slate-300">silver</code>, <code className="text-amber-400">gold</code>).</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-1">
                      <span className="text-xs font-bold text-emerald-400 block font-mono">Volumes</span>
                      <p className="text-[11px] text-[var(--muted-foreground)]">Governed POSIX filesystem paths (<code className="text-emerald-300">/Volumes/...</code>) for unstructured files and models, completely replacing uncurated DBFS root mounts.</p>
                    </div>
                  </div>
                </div>

                {/* 4.2 Row Filters & Column Masks */}
                <div className="space-y-3 pt-3 border-t border-[var(--border)]">
                  <h4 className="text-sm sm:text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                    <span className="text-emerald-400 font-mono">4.2</span> Fine-Grained Access Control: Row Filters &amp; Column Masks
                  </h4>
                  <p className="text-[var(--muted-foreground)]">
                    Enforces dynamic row-level security and column-level masking directly inside the table definition using SQL User-Defined Functions (UDFs):
                  </p>

                  <CodeBlock
                    code={`-- 1. Dynamic Column Masking UDF for PII Redaction
CREATE OR REPLACE FUNCTION prod_catalog.security.mask_pan(pan_number STRING)
RETURN CASE
  WHEN is_account_group_member('compliance_auditors') THEN pan_number
  ELSE CONCAT('XXXXXX', RIGHT(pan_number, 4))
END;

ALTER TABLE prod_catalog.silver.customers
ALTER COLUMN pan_number SET MASK prod_catalog.security.mask_pan;

-- 2. Dynamic Row-Level Security (RLS) UDF for Regional Data Isolation
CREATE OR REPLACE FUNCTION prod_catalog.security.region_rls(country_code STRING)
RETURN is_account_group_member('global_executives')
  OR is_account_group_member(CONCAT('analyst_region_', LOWER(country_code)));

ALTER TABLE prod_catalog.silver.customers
SET ROW FILTER prod_catalog.security.region_rls ON (country_code);`}
                    language="sql"
                    filename="unity_catalog_rls_masking.sql"
                  />
                </div>

                {/* 4.3 Lakehouse Federation & Delta Sharing */}
                <div className="space-y-3 pt-3 border-t border-[var(--border)]">
                  <h4 className="text-sm sm:text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                    <span className="text-emerald-400 font-mono">4.3</span> Lakehouse Federation &amp; Delta Sharing
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-1">
                      <span className="text-xs font-bold text-emerald-400 block">Lakehouse Federation (Zero-ETL Querying)</span>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        Registers external relational databases (Azure SQL, PostgreSQL, MySQL, Snowflake, Redshift) as read-only <code className="text-emerald-300 font-mono">FOREIGN CATALOG</code> objects via governed connections, pushing predicates down to remote engines while enforcing Unity Catalog RBAC.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-1">
                      <span className="text-xs font-bold text-blue-400 block">Delta Sharing (Open REST Protocol)</span>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        Open protocol enabling secure, live sharing of Delta tables, views, volumes, and AI models with external organizations or BI platforms without copying data or vendor lock-in.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* MODULE 5: COMPUTE ENGINE INTERNALS (LEVEL 300-400) */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {(selectedTier === "all" || selectedTier === "300" || selectedTier === "400") && (
          <div className="rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] overflow-hidden">
            <button
              onClick={() => toggleSection("mod-5")}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Activity size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400">
                      Module 5 • Level 300–400
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
                    Compute Engine Internals — Spark, Catalyst &amp; Photon
                  </h3>
                </div>
              </div>
              {expandedSections["mod-5"] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {expandedSections["mod-5"] && (
              <div className="p-4 sm:p-6 border-t border-[var(--border)] space-y-6 text-xs sm:text-sm text-[var(--foreground)] leading-relaxed">
                {/* 5.1 Catalyst & AQE */}
                <div className="space-y-3">
                  <h4 className="text-sm sm:text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                    <span className="text-purple-400 font-mono">5.1</span> Catalyst Optimizer &amp; Adaptive Query Execution (AQE)
                  </h4>
                  <p className="text-[var(--muted-foreground)]">
                    AQE intercepts shuffle stage boundaries at runtime and re-optimizes the physical execution plan using exact runtime byte and row statistics:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-1">
                      <span className="text-xs font-bold text-purple-400 block">Dynamic Partition Coalescing</span>
                      <p className="text-[11px] text-[var(--muted-foreground)]">
                        Merges small adjacent post-shuffle partitions into target sizes (<code className="text-purple-300 font-mono">spark.sql.shuffle.partitions = auto</code>), preventing thousands of tiny tasks and output files.
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-1">
                      <span className="text-xs font-bold text-purple-400 block">Dynamic Join Strategy Switching</span>
                      <p className="text-[11px] text-[var(--muted-foreground)]">
                        Converts planned Sort-Merge Joins (SMJ) into zero-shuffle Broadcast Hash Joins (BHJ) mid-query if filtered dimension size drops below threshold.
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-1">
                      <span className="text-xs font-bold text-purple-400 block">Dynamic Skew Join Optimization</span>
                      <p className="text-[11px] text-[var(--muted-foreground)]">
                        Detects skewed partitions exceeding median size by threshold factor, splitting the hot key into smaller parallel sub-tasks.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 5.2 Photon Vectorized Engine */}
                <div className="space-y-3 pt-3 border-t border-[var(--border)]">
                  <h4 className="text-sm sm:text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                    <span className="text-purple-400 font-mono">5.2</span> The Photon Vectorized Execution Engine
                  </h4>
                  <p className="text-[var(--muted-foreground)]">
                    Written in C++ to exploit modern CPU architectures with off-heap memory management and SIMD vectorization. Standard Python UDFs force Photon to convert columnar batches back into JVM rows (<code className="text-amber-400 font-mono">PhotonToSpark</code>) and serialize across sockets (<code className="text-amber-400 font-mono">BatchEvalPython</code>). Always replace with native functions or vectorized UDFs.
                  </p>
                </div>

                {/* 5.3 Spark UI & Photon Diagnostic Matrix (The 5 S's) */}
                <div className="space-y-3 pt-3 border-t border-[var(--border)]">
                  <h4 className="text-sm sm:text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                    <span className="text-purple-400 font-mono">5.3</span> Spark UI &amp; Photon Diagnostic Matrix (The 5 S&apos;s: Spill, Skew, Shuffle, Storage, Serialization)
                  </h4>

                  <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[var(--surface-3)] text-[var(--muted-foreground)] uppercase text-[10px] font-mono">
                        <tr>
                          <th className="py-2.5 px-3">Physical Plan Operator</th>
                          <th className="py-2.5 px-3">Engine Mode</th>
                          <th className="py-2.5 px-3">Execution Behavior</th>
                          <th className="py-2.5 px-3">Optimization Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)] bg-[var(--surface-2)]">
                        <tr>
                          <td className="py-2.5 px-3 font-mono font-semibold text-sky-400">PhotonScan / PhotonProject</td>
                          <td className="py-2.5 px-3 text-emerald-400 font-semibold">Photon C++</td>
                          <td className="py-2.5 px-3 text-[var(--muted-foreground)]">Vectorized columnar scan and filter evaluation</td>
                          <td className="py-2.5 px-3 text-[var(--foreground)]">Verify <code className="text-sky-300">PartitionFilters</code> and <code className="text-sky-300">DataFilters</code> are populated (predicate pushdown active).</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-mono font-semibold text-emerald-400">PhotonBroadcastHashJoin</td>
                          <td className="py-2.5 px-3 text-emerald-400 font-semibold">Photon C++</td>
                          <td className="py-2.5 px-3 text-[var(--muted-foreground)]">Zero-shuffle hash join using broadcasted small table</td>
                          <td className="py-2.5 px-3 text-emerald-400 font-medium">Optimal join strategy for dimension tables &lt; 100 MB.</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-mono font-semibold text-blue-400">SortMergeJoin</td>
                          <td className="py-2.5 px-3 text-blue-400 font-semibold">Spark / Photon</td>
                          <td className="py-2.5 px-3 text-[var(--muted-foreground)]">Shuffles and sorts both datasets across network</td>
                          <td className="py-2.5 px-3 text-[var(--foreground)]">Ensure AQE is enabled; apply Liquid Clustering on join keys or use Broadcast hint.</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-mono font-semibold text-red-400">BroadcastNestedLoopJoin</td>
                          <td className="py-2.5 px-3 text-red-400 font-semibold">Spark / Photon</td>
                          <td className="py-2.5 px-3 text-red-400">O(N × M) Cartesian loop caused by non-equi join condition</td>
                          <td className="py-2.5 px-3 text-red-300 font-medium">Rewrite inequality joins into equi-joins or enable Databricks Range Join optimization bin hints.</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-mono font-semibold text-amber-400">BatchEvalPython / ArrowEvalPython</td>
                          <td className="py-2.5 px-3 text-amber-400 font-semibold">Python Worker</td>
                          <td className="py-2.5 px-3 text-amber-400">Breaks out of Photon C++ to run Python code</td>
                          <td className="py-2.5 px-3 text-amber-300 font-medium">Refactor into native Spark SQL expressions or SQL UDFs so Photon remains 100% vectorized.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Explicit NULL Skew Split Code Block */}
                  <div className="space-y-1.5 pt-2">
                    <span className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider block">
                      Explicit Skew Mitigation Pattern: Splitting NULL Keys Before Left Outer Join
                    </span>
                    <CodeBlock
                      code={`import pyspark.sql.functions as F

df_orders_valid = orders_df.filter(F.col("customer_id").isNotNull())
df_orders_null = orders_df.filter(F.col("customer_id").isNull())

# Join only non-null keys to prevent millions of NULL rows from landing on a single executor
df_joined_valid = df_orders_valid.join(customers_df, on="customer_id", how="left")

# Union back the NULL rows with empty dimension columns
df_final = df_joined_valid.unionByName(df_orders_null, allowMissingColumns=True)`}
                      language="python"
                      filename="null_key_skew_split.py"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* MODULE 6: ADVANCED STATEFUL STREAMING & METADATA (LEVEL 400) */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {(selectedTier === "all" || selectedTier === "400") && (
          <div className="rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] overflow-hidden">
            <button
              onClick={() => toggleSection("mod-6")}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Sliders size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                      Module 6 • Level 400
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
                    Advanced Stateful Streaming &amp; Metadata Frameworks
                  </h3>
                </div>
              </div>
              {expandedSections["mod-6"] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {expandedSections["mod-6"] && (
              <div className="p-4 sm:p-6 border-t border-[var(--border)] space-y-6 text-xs sm:text-sm text-[var(--foreground)] leading-relaxed">
                {/* 6.1 RocksDB & Watermarking */}
                <div className="space-y-3">
                  <h4 className="text-sm sm:text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                    <span className="text-amber-400 font-mono">6.1</span> Stateful Structured Streaming with RocksDB &amp; Watermarking
                  </h4>
                  <p className="text-[var(--muted-foreground)]">
                    When running stateful operations—such as streaming aggregations, <code className="text-amber-400 font-mono">dropDuplicatesWithinWatermark</code>, or stream-to-stream joins—storing millions of active keys in the default JVM heap leads to OOM errors and long GC pauses. Production streaming pipelines configure the off-heap RocksDB State Store with changelog checkpointing:
                  </p>

                  <CodeBlock
                    code={`import pyspark.sql.functions as F

# 1. Enable off-heap RocksDB State Store and incremental changelog checkpointing
spark.conf.set(
    "spark.sql.streaming.stateStore.providerClass",
    "com.databricks.sql.streaming.state.RocksDBStateStoreProvider"
)
spark.conf.set("spark.sql.streaming.stateStore.rocksdb.changelogCheckpointing.enabled", "true")

# 2. Define event-time watermarks on both streams to bound RocksDB state retention
impressions = (
    spark.readStream.table("prod_catalog.bronze.ad_impressions")
    .withWatermark("impression_ts", "10 minutes")
    .alias("imp")
)

clicks = (
    spark.readStream.table("prod_catalog.bronze.ad_clicks")
    .withWatermark("click_ts", "20 minutes")
    .alias("clk")
)

# 3. Stream-to-Stream Left Outer Join with explicit time-range predicate for state eviction
ad_attribution_stream = impressions.join(
    clicks,
    F.expr("""
        imp.ad_id = clk.ad_id AND
        clk.click_ts >= imp.impression_ts AND
        clk.click_ts <= imp.impression_ts + interval 15 minutes
    """),
    "leftOuter"
)`}
                    language="python"
                    filename="rocksdb_stateful_streaming.py"
                  />
                </div>

                {/* 6.2 Metadata-Driven Ingestion Framework */}
                <div className="space-y-3 pt-3 border-t border-[var(--border)]">
                  <h4 className="text-sm sm:text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                    <span className="text-amber-400 font-mono">6.2</span> Enterprise Metadata-Driven Ingestion &amp; Merge Framework
                  </h4>
                  <p className="text-[var(--muted-foreground)]">
                    At scale, maintaining hundreds of individual PySpark notebooks creates technical debt. Principal architectures implement a Metadata-Driven Framework where source-to-target mappings, primary keys, watermark columns, data quality rules, and SCD types reside in a Unity Catalog control table. A single parameterized engine dynamically executes ingestion:
                  </p>

                  <CodeBlock
                    code={`-- Unity Catalog Metadata Control Table DDL
CREATE SCHEMA IF NOT EXISTS prod_catalog.control_framework;

CREATE TABLE IF NOT EXISTS prod_catalog.control_framework.pipeline_metadata (
  pipeline_id BIGINT GENERATED ALWAYS AS IDENTITY,
  source_system STRING NOT NULL,
  entity_name STRING NOT NULL,
  source_format STRING NOT NULL,
  landing_path STRING NOT NULL,
  bronze_table STRING NOT NULL,
  silver_table STRING NOT NULL,
  primary_keys ARRAY<STRING> NOT NULL,
  sequence_column STRING NOT NULL,
  dq_filter_expr STRING,
  is_active BOOLEAN DEFAULT true
)
CLUSTER BY (source_system, entity_name)
TBLPROPERTIES ('delta.enableDeletionVectors' = true);`}
                    language="sql"
                    filename="control_table_ddl.sql"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* MODULE 7: ENTERPRISE DEVOPS, CI/CD & DABS (LEVEL 400) */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {(selectedTier === "all" || selectedTier === "400") && (
          <div className="rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] overflow-hidden">
            <button
              onClick={() => toggleSection("mod-7")}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Terminal size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400">
                      Module 7 • Level 400
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
                    Enterprise DevOps, CI/CD &amp; Databricks Asset Bundles
                  </h3>
                </div>
              </div>
              {expandedSections["mod-7"] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {expandedSections["mod-7"] && (
              <div className="p-4 sm:p-6 border-t border-[var(--border)] space-y-6 text-xs sm:text-sm text-[var(--foreground)] leading-relaxed">
                {/* 7.1 DABs Architecture */}
                <div className="space-y-3">
                  <h4 className="text-sm sm:text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                    <span className="text-blue-400 font-mono">7.1</span> Databricks Asset Bundles (DABs) Architecture
                  </h4>
                  <p className="text-[var(--muted-foreground)]">
                    Databricks Asset Bundles (DABs) provide a unified Infrastructure-as-Code (IaC) specification to define notebooks, Python wheels, Lakeflow Jobs, Declarative Pipelines, and permissions in YAML files deployed via the Databricks CLI (<code className="text-blue-300 font-mono">databricks bundle validate</code>, <code className="text-blue-300 font-mono">deploy</code>, <code className="text-blue-300 font-mono">run</code>):
                  </p>

                  <CodeBlock
                    code={`# Root Bundle Configuration: databricks.yml
bundle:
  name: enterprise_lakehouse_bundle

include:
  - resources/*.yml

artifacts:
  core_transforms:
    type: whl
    build: poetry build
    path: .

variables:
  catalog_name:
    default: dev_catalog

targets:
  dev:
    mode: development
    default: true
    workspace:
      host: https://adb-111111111111.1.azuredatabricks.net
    variables:
      catalog_name: dev_catalog

  prod:
    mode: production
    workspace:
      host: https://adb-999999999999.9.azuredatabricks.net
      root_path: /Workspace/Users/sp-prod/.bundle/\${bundle.name}/\${bundle.target}
    variables:
      catalog_name: prod_catalog
    run_as:
      service_principal_name: "00000000-1111-2222-3333-444444444444"`}
                    language="yaml"
                    filename="databricks.yml"
                  />

                  {/* Multi-Task Lakeflow Job Resource */}
                  <div className="space-y-1.5 pt-2">
                    <span className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider block">
                      Multi-Task Lakeflow Job Resource: resources/lakeflow_etl_job.yml
                    </span>
                    <CodeBlock
                      code={`resources:
  jobs:
    medallion_etl_workflow:
      name: "[\${bundle.target}] Medallion Incremental Pipeline"
      trigger:
        table_update:
          table_names:
            - \${var.catalog_name}.bronze.orders_raw
          condition: ANY_UPDATED
          min_time_between_triggers_seconds: 300
      environments:
        - environment_key: serverless_default
          spec:
            client: "1"
            dependencies:
              - ./dist/*.whl
      tasks:
        - task_key: bronze_to_silver
          environment_key: serverless_default
          spark_python_task:
            python_file: ../src/ingestion/dynamic_engine.py
            parameters: ["orders"]
        - task_key: silver_to_gold
          depends_on:
            - task_key: bronze_to_silver
          environment_key: serverless_default
          spark_python_task:
            python_file: ../src/transformations/cdf_gold_merge.py
            parameters: ["--catalog", "\${var.catalog_name}"]`}
                      language="yaml"
                      filename="resources/lakeflow_etl_job.yml"
                    />
                  </div>
                </div>

                {/* 7.2 Automated PySpark Unit Testing */}
                <div className="space-y-3 pt-3 border-t border-[var(--border)]">
                  <h4 className="text-sm sm:text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                    <span className="text-blue-400 font-mono">7.2</span> Automated PySpark Unit Testing with Pytest &amp; Chispa
                  </h4>
                  <p className="text-[var(--muted-foreground)]">
                    Continuous Integration (CI) pipelines validate transformation logic in isolated local Spark sessions before code reaches a workspace. The <code className="text-blue-300 font-mono">chispa</code> library provides schema and row-level diff reporting when DataFrame assertions fail:
                  </p>

                  <CodeBlock
                    code={`import pytest
from pyspark.sql import SparkSession
from chispa.dataframe_comparer import assert_df_equality
import pyspark.sql.functions as F

@pytest.fixture(scope="session")
def spark():
    return (
        SparkSession.builder
        .master("local[2]")
        .appName("lakehouse-unit-tests")
        .config("spark.sql.shuffle.partitions", "2")
        .getOrCreate()
    )

def standardize_orders(df):
    return (
        df.filter(F.col("order_id").isNotNull())
        .withColumn("status", F.upper(F.trim(F.col("status"))))
        .dropDuplicates(["order_id"])
    )

def test_standardize_orders_cleans_and_deduplicates(spark):
    input_df = spark.createDataFrame(
        [("ORD-101", " shipped "), ("ORD-101", "shipped"), (None, "cancelled")],
        ["order_id", "status"]
    )
    expected_df = spark.createDataFrame(
        [("ORD-101", "SHIPPED")],
        ["order_id", "status"]
    )
    assert_df_equality(standardize_orders(input_df), expected_df, ignore_nullable=True)`}
                    language="python"
                    filename="test_orders_chispa.py"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* MODULE 8: DBSQL, FINOPS SYSTEM TABLES & INCIDENT PLAYBOOK (LEVEL 400) */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {(selectedTier === "all" || selectedTier === "400") && (
          <div className="rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] overflow-hidden">
            <button
              onClick={() => toggleSection("mod-8")}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <DollarSign size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                      Module 8 • Level 400
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
                    DBSQL, FinOps System Tables, Mosaic AI &amp; Troubleshooting
                  </h3>
                </div>
              </div>
              {expandedSections["mod-8"] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {expandedSections["mod-8"] && (
              <div className="p-4 sm:p-6 border-t border-[var(--border)] space-y-6 text-xs sm:text-sm text-[var(--foreground)] leading-relaxed">
                {/* 8.1 DBSQL & BI DirectQuery */}
                <div className="space-y-3">
                  <h4 className="text-sm sm:text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                    <span className="text-amber-400 font-mono">8.1</span> Databricks SQL (DBSQL) &amp; BI DirectQuery Integration
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-1">
                      <span className="text-xs font-bold text-amber-400 block">Intelligent Workload Management (IWM)</span>
                      <p className="text-[11px] text-[var(--muted-foreground)]">ML models predict incoming query memory/CPU requirements, dynamically admitting fast queries and provisioning clusters in 2-6s.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-1">
                      <span className="text-xs font-bold text-blue-400 block">Multi-Layer Caching</span>
                      <p className="text-[11px] text-[var(--muted-foreground)]">Query Result Cache (instant results) → local NVMe SSD Disk Cache (columnar blocks) → remote cloud storage via file-skipping.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-1">
                      <span className="text-xs font-bold text-emerald-400 block">Power BI &amp; Fabric SSO</span>
                      <p className="text-[11px] text-[var(--muted-foreground)]">Native partner connector with Microsoft Entra ID Single Sign-On (SSO) pass-through enforcing Unity Catalog Row Filters &amp; Masks.</p>
                    </div>
                  </div>
                </div>

                {/* 8.2 Enterprise FinOps via System Tables */}
                <div className="space-y-3 pt-3 border-t border-[var(--border)]">
                  <h4 className="text-sm sm:text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                    <span className="text-amber-400 font-mono">8.2</span> Enterprise FinOps &amp; Observability via System Tables
                  </h4>
                  <p className="text-[var(--muted-foreground)]">
                    Unity Catalog exposes operational telemetry across the account in the <code className="text-amber-400 font-mono">system</code> catalog. Platform teams run scheduled SQL queries to monitor spend and query health:
                  </p>

                  <CodeBlock
                    code={`-- 1. FinOps Query: 30-Day DBU & USD Spend by Workspace, SKU, and Job ID
SELECT
  u.usage_date,
  u.workspace_id,
  u.sku_name,
  u.custom_tags['cost_center'] AS cost_center,
  u.usage_metadata.job_id,
  ROUND(SUM(u.usage_quantity), 2) AS total_dbus,
  ROUND(SUM(u.usage_quantity * lp.pricing.default), 2) AS estimated_spend_usd
FROM system.billing.usage u
INNER JOIN system.billing.list_prices lp
  ON u.cloud = lp.cloud
  AND u.sku_name = lp.sku_name
  AND u.usage_start_time >= lp.price_start_time
  AND (u.usage_end_time <= lp.price_end_time OR lp.price_end_time IS NULL)
WHERE u.usage_date >= CURRENT_DATE() - INTERVAL 30 DAYS
GROUP BY ALL
ORDER BY estimated_spend_usd DESC;

-- 2. DBSQL Observability: Identify Queries with Disk Spill or High Scan Volume
SELECT
  statement_id,
  executed_by,
  warehouse_id,
  ROUND(total_duration_ms / 1000.0, 2) AS duration_sec,
  ROUND(read_bytes / (1024*1024*1024), 2) AS gb_scanned,
  ROUND(spilled_local_bytes / (1024*1024*1024), 2) AS gb_spilled,
  statement_text
FROM system.query.history
WHERE start_time >= CURRENT_TIMESTAMP() - INTERVAL 7 DAYS
  AND execution_status = 'FINISHED'
  AND (spilled_local_bytes > 0 OR total_duration_ms > 60000)
ORDER BY spilled_local_bytes DESC, total_duration_ms DESC
LIMIT 20;`}
                    language="sql"
                    filename="finops_system_tables.sql"
                  />
                </div>

                {/* 8.3 Mosaic AI & Governed Agent Systems */}
                <div className="space-y-3 pt-3 border-t border-[var(--border)]">
                  <h4 className="text-sm sm:text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                    <span className="text-amber-400 font-mono">8.3</span> Mosaic AI, Vector Search &amp; Governed Agent Systems
                  </h4>
                  <p className="text-[var(--muted-foreground)]">
                    Mosaic AI integrates generative AI directly with Unity Catalog and Delta Lake so RAG and tool-calling agents inherit enterprise governance:
                  </p>

                  <CodeBlock
                    code={`from databricks.vector_search.client import VectorSearchClient

vsc = VectorSearchClient()

# Provision a Continuous Delta-Synced Vector Index backed by a Foundation Model Endpoint
vsc.create_delta_sync_index(
    endpoint_name="prod_vector_search_endpoint",
    source_table_name="prod_catalog.gold.kb_document_chunks",
    index_name="prod_catalog.gold.kb_vector_index",
    pipeline_type="CONTINUOUS",
    primary_key="chunk_id",
    embedding_source_column="chunk_text",
    embedding_model_endpoint_name="databricks-gte-large-en"
)`}
                    language="python"
                    filename="mosaic_ai_vector_search.py"
                  />
                </div>

                {/* 8.4 Production Troubleshooting Playbook Table */}
                <div className="space-y-3 pt-3 border-t border-[var(--border)]">
                  <h4 className="text-sm sm:text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                    <span className="text-amber-400 font-mono">8.4</span> Production Troubleshooting &amp; Incident Resolution Playbook
                  </h4>

                  <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[var(--surface-3)] text-[var(--muted-foreground)] uppercase text-[10px] font-mono">
                        <tr>
                          <th className="py-2.5 px-3">Production Symptom</th>
                          <th className="py-2.5 px-3">Spark UI / Root Cause Diagnosis</th>
                          <th className="py-2.5 px-3">Actionable Engineering Resolution</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)] bg-[var(--surface-2)]">
                        <tr>
                          <td className="py-2.5 px-3 font-semibold text-amber-400">Straggler Task (199/200 finished, 1 task hanging)</td>
                          <td className="py-2.5 px-3 text-[var(--muted-foreground)]">
                            <strong className="text-[var(--foreground)]">Data Skew:</strong> Max task duration and Shuffle Read Size are 10x–100x larger than 75th percentile (joining/grouping on NULL or default keys).
                          </td>
                          <td className="py-2.5 px-3 text-emerald-300 font-medium">
                            1. Filter NULL keys before join &amp; union back.<br/>
                            2. Verify <code className="text-sky-300">spark.sql.adaptive.skewJoin.enabled = true</code>.<br/>
                            3. Apply salted keys: <code className="text-amber-300">concat(key, &apos;_&apos;, floor(rand() * 16))</code>.
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-semibold text-red-400">High Memory &amp; Disk Spill During Joins</td>
                          <td className="py-2.5 px-3 text-[var(--muted-foreground)]">
                            <strong className="text-[var(--foreground)]">Partition Memory Exhaustion:</strong> Shuffle partitions exceed executor RAM per core, forcing Spark to spill unsafe rows to local NVMe.
                          </td>
                          <td className="py-2.5 px-3 text-emerald-300 font-medium">
                            1. Set <code className="text-sky-300">spark.sql.shuffle.partitions = auto</code>.<br/>
                            2. Switch to memory-optimized worker VMs.<br/>
                            3. Eliminate unbounded Window functions lacking a PARTITION BY.
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-semibold text-red-400">Driver java.lang.OutOfMemoryError Crash</td>
                          <td className="py-2.5 px-3 text-[var(--muted-foreground)]">
                            <strong className="text-[var(--foreground)]">Driver Heap Exhaustion:</strong> Calling <code className="text-red-300">.collect()</code>, <code className="text-red-300">.toPandas()</code>, broadcasting huge tables, or building dictionaries in driver RAM.
                          </td>
                          <td className="py-2.5 px-3 text-emerald-300 font-medium">
                            1. Replace <code className="text-red-300">.collect()</code> with distributed writes.<br/>
                            2. Reduce <code className="text-sky-300">spark.sql.autoBroadcastJoinThreshold</code>.<br/>
                            3. Scale up Driver instance size vertically.
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-semibold text-amber-400">Slow Table Scans &amp; High Planning Latency</td>
                          <td className="py-2.5 px-3 text-[var(--muted-foreground)]">
                            <strong className="text-[var(--foreground)]">Small File Problem:</strong> Thousands of KB-sized Parquet files generated by streaming micro-batches or over-partitioned Hive directories.
                          </td>
                          <td className="py-2.5 px-3 text-emerald-300 font-medium">
                            1. Migrate to Liquid Clustering (<code className="text-cyan-300">CLUSTER BY</code>).<br/>
                            2. Enable Predictive Optimization or <code className="text-cyan-300">autoCompact = true</code>.<br/>
                            3. Execute <code className="text-cyan-300">OPTIMIZE table_name</code>.
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-semibold text-red-400">ConcurrentAppendException / Write Conflict</td>
                          <td className="py-2.5 px-3 text-[var(--muted-foreground)]">
                            <strong className="text-[var(--foreground)]">OCC Isolation Conflict:</strong> Two concurrent jobs updating or merging into overlapping physical Parquet files in the same table.
                          </td>
                          <td className="py-2.5 px-3 text-emerald-300 font-medium">
                            1. Enable Deletion Vectors (<code className="text-cyan-300">delta.enableDeletionVectors = true</code>) and Row Tracking.<br/>
                            2. Add explicit clustering key filters inside MERGE ON predicates for disjoint file pruning.
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-semibold text-amber-400">PhotonToSpark Transition Mid-Query Plan</td>
                          <td className="py-2.5 px-3 text-[var(--muted-foreground)]">
                            <strong className="text-[var(--foreground)]">Vectorization Breakout:</strong> Custom Python UDF or unsupported legacy expression forces Photon to convert columnar batches back to JVM rows.
                          </td>
                          <td className="py-2.5 px-3 text-emerald-300 font-medium">
                            1. Inspect DAG for <code className="text-amber-300">BatchEvalPython</code>.<br/>
                            2. Rewrite Python UDFs using native <code className="text-emerald-300">pyspark.sql.functions</code> or SQL Higher-Order Functions.
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
