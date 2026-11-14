#!/usr/bin/env python3
"""
Enterprise Reference Guides Generator & PDF Bookmark Enrichment Engine
Generates 3 new high-density 12-card A4 reference guides:
  1. Apache Spark Catalyst Optimizer & Physical Execution Plan Triage Guide
  2. Lakehouse Table Formats Architecture & Migration Guide: Delta Lake 3.2+ vs Apache Iceberg 1.5+
  3. Data Engineering SDLC, Data Contracts & Testing Pyramid Reference Guide

Enriches all 10 PDFs (7 existing + 3 new) with:
  - Hierarchical, accessible PDF bookmarks (TOC outlines)
  - Standard document metadata (Title, Author, Subject, Keywords, Creator)
  - High-resolution (250 DPI) thumbnail images & panoramic posters

Author: Santosh Jammi | Principal Data Architect
"""

import os
import sys
import shutil
import subprocess
import fitz  # PyMuPDF
from PIL import Image

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
WORKSPACE_DIR = os.path.dirname(SCRIPT_DIR)
OUTPUT_DIR = os.path.join(WORKSPACE_DIR, "public", "cheatsheets")
HTML_DIR = os.path.join(OUTPUT_DIR, "html")
PDF_DIR = os.path.join(OUTPUT_DIR, "pdf")
IMG_DIR = os.path.join(OUTPUT_DIR, "images")

os.makedirs(HTML_DIR, exist_ok=True)
os.makedirs(PDF_DIR, exist_ok=True)
os.makedirs(IMG_DIR, exist_ok=True)

def find_chrome():
    candidates = [
        os.environ.get("CHROME_BIN"),
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/usr/bin/google-chrome",
        "/usr/bin/chromium",
        "/usr/bin/chromium-browser",
    ]
    for c in candidates:
        if c and os.path.exists(c):
            return c
    return "google-chrome"

CHROME_BIN = find_chrome()

def get_base_css(theme_color="#f59e0b", title_color="#38bdf8"):
    return f"""
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

@page {{
  size: A4 portrait;
  margin: 0;
}}

* {{
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}}

body {{
  background: #080c15;
  color: #e2e8f0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 7.2px;
  line-height: 1.28;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}}

.page {{
  width: 210mm;
  height: 297mm;
  max-height: 297mm;
  padding: 5mm 6.5mm 4.5mm 6.5mm;
  background: #080c15;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  page-break-after: always;
  overflow: hidden;
  position: relative;
}}

/* Page Header */
.header-bar {{
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid {theme_color};
  padding-bottom: 3.5px;
  margin-bottom: 4px;
}}

.header-left {{
  display: flex;
  align-items: center;
  gap: 7px;
}}

.header-title-box h1 {{
  font-size: 13.5px;
  font-weight: 800;
  letter-spacing: -0.3px;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 5px;
}}

.header-title-box p {{
  font-size: 7.5px;
  color: #94a3b8;
  font-weight: 500;
}}

.header-badges {{
  display: flex;
  align-items: center;
  gap: 4px;
}}

.badge {{
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 6.8px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}}

.badge-primary {{ background: {theme_color}; color: #ffffff; }}
.badge-secondary {{ background: #1e293b; color: #38bdf8; border: 1px solid #334155; }}
.badge-dark {{ background: #0f172a; color: #a5b4fc; border: 1px solid #1e293b; }}
.badge-accent {{ background: #10b981; color: #042f2e; }}

/* Grid Layout: 3 Rows of 2 Cards */
.content-grid {{
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: repeat(3, 1fr);
  gap: 5px;
  margin-bottom: 3px;
}}

.card {{
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 5px;
  padding: 4.5px 6.5px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  height: 100%;
}}

.card-header {{
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #1e293b;
  padding-bottom: 2.5px;
  margin-bottom: 1px;
}}

.card-title {{
  font-size: 8.8px;
  font-weight: 700;
  color: {title_color};
  display: flex;
  align-items: center;
  gap: 4px;
}}

.card-tag {{
  font-size: 6.4px;
  background: #1e293b;
  color: #94a3b8;
  padding: 1.5px 4px;
  border-radius: 2px;
  font-weight: 600;
}}

/* Code Blocks */
pre.code {{
  background: #040711;
  border: 1px solid #141e33;
  border-radius: 3px;
  padding: 3px 5px;
  font-family: 'JetBrains Mono', Menlo, Monaco, Consolas, monospace;
  font-size: 6.5px;
  line-height: 1.24;
  color: #e2e8f0;
  overflow: hidden;
  white-space: pre-wrap;
  word-break: break-all;
}}

/* Syntax Highlighting */
.kw {{ color: #f43f5e; font-weight: 600; }}    /* keywords */
.fn {{ color: #38bdf8; font-weight: 600; }}    /* functions */
.str {{ color: #4ade80; }}                     /* strings */
.cm {{ color: #64748b; font-style: italic; }}  /* comments */
.num {{ color: #fb923c; }}                     /* numbers */
.cls {{ color: #fbbf24; font-weight: 600; }}   /* classes/types */
.var {{ color: #a78bfa; }}                     /* variables */
.typ {{ color: #facc15; }}                     /* SQL types */

/* Code Explanation Section (Below Every Code Block) */
.code-explain {{
  background: rgba(4, 7, 17, 0.75);
  border: 1px solid #1a253c;
  border-left: 2px solid {theme_color};
  border-radius: 3px;
  padding: 3px 5px;
  font-size: 6.4px;
  line-height: 1.24;
  color: #cbd5e1;
}}

.explain-head {{
  font-size: 6.2px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  gap: 3px;
}}

.explain-list {{
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1.8px;
}}

.explain-list li {{
  position: relative;
  padding-left: 7px;
  font-size: 6.3px;
  line-height: 1.23;
  color: #cbd5e1;
}}

.explain-list li::before {{
  content: "•";
  position: absolute;
  left: 1px;
  color: {theme_color};
  font-weight: bold;
}}

.explain-list li strong {{
  color: #ffffff;
  font-weight: 600;
}}

.explain-list li code {{
  background: #1e293b;
  padding: 0.5px 2.5px;
  border-radius: 2px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 5.8px;
  color: #38bdf8;
}}

/* Mini Alert */
.alert {{
  padding: 2.5px 4.5px;
  border-radius: 2.5px;
  font-size: 6.2px;
  line-height: 1.22;
  margin-top: 1.5px;
}}

.alert-pri {{
  background: rgba(245, 158, 11, 0.08);
  border-left: 2px solid {theme_color};
  color: #fde68a;
}}

.alert-sec {{
  background: rgba(56, 189, 248, 0.08);
  border-left: 2px solid #38bdf8;
  color: #bae6fd;
}}

/* Footer */
.page-footer {{
  border-top: 1px solid #1e293b;
  padding-top: 2.5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 6.8px;
  color: #64748b;
}}

.page-footer-left {{
  display: flex;
  align-items: center;
  gap: 6px;
}}

.page-footer-right {{
  font-weight: 600;
  color: #94a3b8;
}}
"""

def generate_full_html(title, theme_color, title_color, body_content):
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>{title}</title>
<style>
{get_base_css(theme_color, title_color)}
</style>
</head>
<body>
{body_content}
</body>
</html>"""

# ==============================================================================
# GUIDE 1: SPARK CATALYST OPTIMIZER & PHYSICAL EXECUTION PLAN TRIAGE GUIDE
# ==============================================================================
CATALYST_BODY = """
  <!-- PAGE 1: CATALYST PIPELINE & PLAN READING -->
  <div class="page">
    <div class="header-bar">
      <div class="header-left">
        <div class="header-title-box">
          <h1>🔬 SPARK CATALYST & PHYSICAL EXECUTION PLAN GUIDE</h1>
          <p>Production Reference: 5-Stage Catalyst Pipeline, EXPLAIN Plan Anatomy, Join Hierarchies & Optimizer Rules</p>
        </div>
      </div>
      <div class="header-badges">
        <span class="badge badge-primary">Spark 3.5+ / 4.0</span>
        <span class="badge badge-secondary">Catalyst Internals</span>
        <span class="badge badge-dark">Plan Anatomy</span>
        <span class="badge badge-accent">ISO 216 A4</span>
      </div>
    </div>

    <div class="content-grid">
      <!-- Card 1: 5-Stage Catalyst Compiler Pipeline -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">⚙️ 5-Stage Catalyst Compiler Pipeline</span>
          <span class="card-tag">Architecture</span>
        </div>
        <pre class="code"><span class="cm">-- Catalyst 5-Stage Transformation Flow</span>
<span class="kw">SQL / DataFrame API</span>
  ↳ <span class="cls">1. Unresolved Logical Plan</span> (AST syntax validated, types unverified)
  ↳ <span class="cls">2. Analyzed Logical Plan</span> (Catalog resolution: schemas, tables, functions)
  ↳ <span class="cls">3. Optimized Logical Plan</span> (Rule-based optimization: pruning, pushdowns)
  ↳ <span class="cls">4. Physical Plans (CBO)</span> (Cost-Based Optimizer selects best strategy)
  ↳ <span class="cls">5. Whole-Stage CodeGen (WSCG)</span> (Janino compiles Java bytecode RDDs)</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Compiler Mechanics & Invariants</div>
          <ul class="explain-list">
            <li><strong>Analyzer Phase:</strong> Uses <code>SessionCatalog</code> to verify column names and coerce mismatched data types.</li>
            <li><strong>Rule Execution:</strong> Batches of idempotent tree-transformation rules run fixed-point iterations until tree stops mutating.</li>
            <li><strong>CBO Cost Evaluation:</strong> Compares candidate physical plans using table row-counts, byte sizes, and column histograms.</li>
          </ul>
        </div>
      </div>

      <!-- Card 2: Anatomy of EXPLAIN FORMATTED -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">📜 Anatomy of EXPLAIN FORMATTED & Output</span>
          <span class="card-tag">Plan Reading</span>
        </div>
        <pre class="code"><span class="cm">-- Command to generate comprehensive operator tree</span>
<span class="kw">EXPLAIN FORMATTED</span> <span class="kw">SELECT</span> c.id, <span class="fn">sum</span>(o.amt) <span class="kw">FROM</span> orders o
<span class="kw">JOIN</span> customers c <span class="kw">ON</span> o.cust_id = c.id
<span class="kw">WHERE</span> o.status = <span class="str">'COMPLETE'</span> <span class="kw">GROUP BY</span> c.id;

<span class="cm">-- Tree Operator Output:</span>
== Physical Plan ==
* (3) HashAggregate(keys=[id#12], functions=[sum(amt#15)])
+- Exchange hashpartitioning(id#12, 200), ENSURE_REQUIREMENTS, [id=#84]
   +- * (2) HashAggregate(keys=[id#12], functions=[partial_sum(amt#15)])
      +- * (2) BroadcastHashJoin [cust_id#14], [id#12], Inner, BuildRight
         :- * (2) Filter (isnotnull(status#16) AND (status#16 = COMPLETE))
         :  +- FileScan parquet [cust_id#14,amt#15,status#16]
         +- BroadcastExchange HashedRelationBroadcastMode [id=#78]
            +- * (1) Filter isnotnull(id#12)
               +- FileScan parquet [id#12]</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Node Decoupling & Conventions</div>
          <ul class="explain-list">
            <li><code>*(N) Stage ID:</code> Denotes operator runs inside WholeStageCodegen pipeline <code>N</code> in a single JVM loop.</li>
            <li><code>Exchange:</code> Hard stage boundary forcing network shuffle across cluster; cuts code generation boundaries.</li>
            <li><code>+- Tree Hierarchy:</code> Read bottom-to-top from leaf scans to root sink; colons <code>:-</code> mark build vs probe branches.</li>
          </ul>
        </div>
      </div>

      <!-- Card 3: Join Strategy Selection Hierarchy -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🔀 Join Strategy Selection Hierarchy</span>
          <span class="card-tag">Performance</span>
        </div>
        <pre class="code"><span class="cm">-- Spark Join Evaluation Order (Descending Preference)</span>
1. <span class="cls">BroadcastHashJoin (BHJ):</span>
   Equi-join & size &lt; <span class="num">spark.sql.autoBroadcastJoinThreshold</span> (<span class="num">10MB</span>). Zero shuffle.
2. <span class="cls">ShuffleHashJoin (SHJ):</span>
   Equi-join, 1 side significantly smaller than other, build fits in executor memory.
3. <span class="cls">SortMergeJoin (SMJ):</span>
   Default for large equi-joins. Requires both sides partitioned & sorted on join keys.
4. <span class="cls">BroadcastNestedLoopJoin (BNLJ):</span>
   <span class="kw">CRITICAL HAZARD:</span> Triggered on non-equi joins (e.g. <code>o.amt &gt; t.limit</code>). <code>O(M×N)</code> cartesian scan!
5. <span class="cls">CartesianProduct:</span>
   Explicit <code>CROSS JOIN</code> without conditions; catastrophic at scale.</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Join Rules & Antidotes</div>
          <ul class="explain-list">
            <li><strong>Join Hints:</strong> Override optimizer with <code>/*+ BROADCAST(table) */</code> or <code>/*+ MERGE(table) */</code>.</li>
            <li><strong>BNLJ Avoidance:</strong> Rewrite range joins with bucketed bounds or explode windowed intervals to restore equi-join hash mechanics.</li>
          </ul>
        </div>
      </div>

      <!-- Card 4: Core Catalyst Optimizer Rules -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">⚡ Core Catalyst Optimizer Rules</span>
          <span class="card-tag">Optimization</span>
        </div>
        <pre class="code"><span class="cm">-- Key Transformation Rules in Optimizer Batch</span>
<span class="cls">PushDownPredicates:</span>
  Moves <code>Filter</code> below <code>Join</code> and <code>Aggregate</code> down to storage <code>FileScan</code>.
<span class="cls">ColumnPruning:</span>
  Drops unused columns immediately after file read, minimizing memory buffers.
<span class="cls">ConstantFolding:</span>
  Evaluates <code>1 + 1</code> or compile-time constants into literal values at planning.
<span class="cls">ReplaceDeduplicateWithAggregate:</span>
  Rewrites expensive <code>DISTINCT</code> or window deduplication into streaming aggregates.
<span class="cls">CollapseRepartition:</span>
  Merges consecutive <code>repartition()</code> or <code>coalesce()</code> into single exchange.</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 PushedFilter Verification</div>
          <ul class="explain-list">
            <li><strong>Scan Check:</strong> Verify <code>PushedFilters: [IsNotNull(id), EqualTo(status, 'COMPLETE')]</code> in leaf scan metadata.</li>
            <li><strong>Parquet Pruning:</strong> Predicates must match file statistics (min/max) to skip entire row groups without disk reads.</li>
          </ul>
        </div>
      </div>

      <!-- Card 5: Partitioning & Distribution Expressions -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">📦 Partitioning & Distribution Expressions</span>
          <span class="card-tag">Shuffling</span>
        </div>
        <pre class="code"><span class="cm">-- Spark Physical Data Distribution Operators</span>
<span class="cls">HashPartitioning(keys, numPartitions):</span>
  <code>Murmur3Hash(keys) % numPartitions</code>. Standard for joins and aggregations.
<span class="cls">RangePartitioning(order, numPartitions):</span>
  Samples key distribution to partition data into sorted buckets (used by <code>orderBy</code>).
<span class="cls">SinglePartition:</span>
  <span class="kw">DANGER:</span> Collects entire distributed dataset onto 1 executor! Triggered by <code>OVER ()</code>.
<span class="cls">RoundRobinPartitioning(numPartitions):</span>
  Uniformly scatters rows across tasks; disables join collocation optimizations.</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Shuffle Invariant Rules</div>
          <ul class="explain-list">
            <li><strong>SinglePartition Triage:</strong> Never write <code>ROW_NUMBER() OVER (ORDER BY col)</code> without a <code>PARTITION BY</code> key.</li>
            <li><strong>Co-partitioning:</strong> When two tables have identical hash partitioning, SMJ skips exchange completely.</li>
          </ul>
        </div>
      </div>

      <!-- Card 6: Whole-Stage Code Generation (WSCG) -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">⚡ Whole-Stage CodeGen (WSCG) Mechanics</span>
          <span class="card-tag">Compilation</span>
        </div>
        <pre class="code"><span class="cm">-- Janino Java Code Compilation & Limits</span>
<span class="kw">spark.sql.codegen.wholeStage</span> = <span class="str">true</span>  <span class="cm">-- Compiles tree into single Java loop</span>
<span class="kw">spark.sql.codegen.maxFields</span>  = <span class="num">100</span>   <span class="cm">-- Schema threshold before disabling WSCG</span>

<span class="cm">-- Symptom: Spark log warning "failed to compile: 64KB bytecode limit"</span>
<span class="cm">-- Root Cause: Wide tables (>150 cols) generate gigantic Java methods.</span>
<span class="cm">-- Remediation: Set config or project columns in stages:</span>
<span class="kw">spark.conf.set</span>(<span class="str">"spark.sql.codegen.hugeMethodLimit"</span>, <span class="num">8000</span>)
<span class="kw">spark.conf.set</span>(<span class="str">"spark.sql.codegen.splitExpressions.threshold"</span>, <span class="num">1024</span>)</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Fallback Indicators</div>
          <ul class="explain-list">
            <li><strong>Visual Missing Star:</strong> If operator lacks <code>*(N)</code> in plan, code runs in Volcano iterator mode (10x slower).</li>
            <li><strong>Black Boxes:</strong> Python UDFs and non-vectorized Hive SerDes break WSCG blocks into multiple stages.</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div class="page-footer-left">
        <span>Apache Spark Catalyst Optimizer Reference Guide</span>
        <span>•</span>
        <span>Section 1: Compiler Pipeline &amp; Plan Reading</span>
      </div>
      <div class="page-footer-right">
        <span>Page 1 of 2 • Modern Data Engineer</span>
      </div>
    </div>
  </div>

  <!-- PAGE 2: BOTTLENECKS, AQE & UI TRIAGE -->
  <div class="page">
    <div class="header-bar">
      <div class="header-left">
        <div class="header-title-box">
          <h1>🔬 SPARK PHYSICAL BOTTLENECKS & AQE TRIAGE</h1>
          <p>Production Reference: Adaptive Query Execution (AQE), Skew Joins, Exchange Bottlenecks & UI Metrics</p>
        </div>
      </div>
      <div class="header-badges">
        <span class="badge badge-primary">AQE 3.5+</span>
        <span class="badge badge-secondary">Tuning &amp; Triage</span>
        <span class="badge badge-dark">UI Metrics</span>
        <span class="badge badge-accent">ISO 216 A4</span>
      </div>
    </div>

    <div class="content-grid">
      <!-- Card 7: AQE 3 Engine Pillars -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🤖 Adaptive Query Execution (AQE) 3 Pillars</span>
          <span class="card-tag">Runtime Dynamic</span>
        </div>
        <pre class="code"><span class="cm">-- Enable Master Adaptive Query Execution</span>
<span class="kw">SET</span> spark.sql.adaptive.enabled = <span class="str">true</span>;

<span class="cm">-- Pillar 1: Dynamic Partition Coalescing</span>
<span class="kw">SET</span> spark.sql.adaptive.coalescePartitions.enabled = <span class="str">true</span>;
<span class="kw">SET</span> spark.sql.adaptive.advisoryPartitionSizeInBytes = <span class="num">134217728</span>; <span class="cm">-- 128MB</span>

<span class="cm">-- Pillar 2: Dynamic Switching to Broadcast Join</span>
<span class="kw">SET</span> spark.sql.adaptive.autoBroadcastJoinThreshold = <span class="num">20971520</span>;  <span class="cm">-- 20MB runtime</span>

<span class="cm">-- Pillar 3: Dynamic Skew Join Elimination</span>
<span class="kw">SET</span> spark.sql.adaptive.skewJoin.enabled = <span class="str">true</span>;
<span class="kw">SET</span> spark.sql.adaptive.skewJoin.skewedPartitionFactor = <span class="num">5</span>;
<span class="kw">SET</span> spark.sql.adaptive.skewJoin.skewedPartitionThresholdInBytes = <span class="num">268435456</span>; <span class="cm">-- 256MB</span></pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Runtime Feedback Mechanics</div>
          <ul class="explain-list">
            <li><strong>Stage Materialization:</strong> AQE pauses between shuffle stages, reads shuffle partition sizes, and re-optimizes physical plan.</li>
            <li><strong>Initial Setting:</strong> Set <code>spark.sql.shuffle.partitions = 2000</code>; AQE collapses empty partitions down to ideal 128MB chunks.</li>
          </ul>
        </div>
      </div>

      <!-- Card 8: Exchange & Shuffle Bottleneck Elimination -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🌐 Exchange & Shuffle Bottleneck Elimination</span>
          <span class="card-tag">Network I/O</span>
        </div>
        <pre class="code"><span class="cm">-- Symptoms: Stage takes 90% of job time on Exchange operator</span>
<span class="cm">-- Diagnostic: Check Spark UI Shuffle Write Size vs Records Read</span>

<span class="cm">-- 1. Redundant Exchange Elimination:</span>
<span class="cm">-- BAD: Successive groupBy on different keys triggers 2 shuffles</span>
df.groupBy(<span class="str">"country"</span>).agg(...)
  .groupBy(<span class="str">"region"</span>).agg(...)  <span class="cm">-- 2 shuffles</span>

<span class="cm">-- GOOD: Single multi-dimensional rollup/cube:</span>
df.rollup(<span class="str">"region"</span>, <span class="str">"country"</span>).agg(...) <span class="cm">-- 1 shuffle only!</span>

<span class="cm">-- 2. Bucketing Co-Location: Pre-shuffle on shared cluster key:</span>
df.write.bucketBy(<span class="num">64</span>, <span class="str">"cust_id"</span>).sortBy(<span class="str">"cust_id"</span>).saveAsTable(...)
<span class="cm">-- Joining two tables bucketed on same key generates zero Exchange nodes!</span></pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Shuffle Write Triage</div>
          <ul class="explain-list">
            <li><strong>Spill to Disk:</strong> Indicates shuffle buffer memory exhausted; tasks write intermediate blocks to local NVMe disk.</li>
            <li><strong>Remedy:</strong> Increase <code>spark.sql.shuffle.partitions</code> or increase executor memory to fit hash buffers in heap.</li>
          </ul>
        </div>
      </div>

      <!-- Card 9: Plan Anti-Patterns & Antidotes -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🚫 Plan Anti-Patterns & Production Antidotes</span>
          <span class="card-tag">Triage</span>
        </div>
        <pre class="code"><span class="cm">-- Anti-Pattern 1: Non-Deterministic Python UDF Black Box</span>
<span class="cm">-- BROKEN: @udf disables Catalyst predicate pushdown & vectorization</span>
<span class="kw">@udf</span>(<span class="str">"string"</span>)
<span class="kw">def</span> <span class="fn">clean</span>(val): <span class="kw">return</span> val.strip().lower() <span class="kw">if</span> val <span class="kw">else</span> <span class="str">""</span>
<span class="cm">-- FIX: Use native Spark SQL higher-order or expressions:</span>
df.withColumn(<span class="str">"clean"</span>, <span class="fn">trim</span>(<span class="fn">lower</span>(<span class="fn">col</span>(<span class="str">"val"</span>))))

<span class="cm">-- Anti-Pattern 2: Uncorrelated Subquery Non-Pushdown</span>
<span class="kw">SELECT</span> * <span class="kw">FROM</span> large_table
<span class="kw">WHERE</span> event_date = (<span class="kw">SELECT</span> <span class="fn">max</span>(d) <span class="kw">FROM</span> dates);
<span class="cm">-- FIX: Join directly or collect scalar date in driver prior to query:</span>
max_d = dates_df.select(<span class="fn">max</span>(<span class="str">"d"</span>)).first()[<span class="num">0</span>]
df.filter(<span class="fn">col</span>(<span class="str">"event_date"</span>) == max_d)  <span class="cm">-- Enables PartitionPruning!</span></pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Query Plan Signals</div>
          <ul class="explain-list">
            <li><code>BatchEvalPython:</code> Py4J serialization boundary; replace with Pandas Vectorized UDF (<code>arrow</code>) or Spark SQL built-in.</li>
            <li><code>SubqueryExec:</code> Subquery runs in sub-plan; evaluate whether dynamic partition pruning (DPP) is active.</li>
          </ul>
        </div>
      </div>

      <!-- Card 10: Skew Join Mitigation & Salting Plan -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">⚖️ Skew Join Mitigation & Two-Phase Salting</span>
          <span class="card-tag">Data Skew</span>
        </div>
        <pre class="code"><span class="cm">-- Manual Salting when AQE cannot split (e.g. non-Spark 3.x or custom ops)</span>
<span class="kw">from</span> pyspark.sql.functions <span class="kw">import</span> expr, lit, concat

SALT_FACTOR = <span class="num">16</span>  <span class="cm">-- Splits skewed key across 16 parallel tasks</span>

<span class="cm">-- 1. Salt the heavily skewed large table with random bucket [0..15]</span>
skewed_df = large_df.withColumn(
    <span class="str">"salt"</span>, <span class="fn">concat</span>(<span class="fn">col</span>(<span class="str">"join_key"</span>), <span class="fn">lit</span>(<span class="str">"_"</span>), (<span class="fn">expr</span>(<span class="str">"rand() * 16"</span>)).<span class="fn">cast</span>(<span class="str">"int"</span>))
)

<span class="cm">-- 2. Explode the small dimension table across all 16 buckets</span>
replicated_dim = dim_df.withColumn(<span class="str">"salt_bucket"</span>, <span class="fn">expr</span>(<span class="str">"sequence(0, 15)"</span>)) \
                       .selectExpr(<span class="str">"*"</span>, <span class="str">"explode(salt_bucket) as bucket"</span>) \
                       .withColumn(<span class="str">"salt"</span>, <span class="fn">concat</span>(<span class="fn">col</span>(<span class="str">"join_key"</span>), <span class="fn">lit</span>(<span class="str">"_"</span>), <span class="fn">col</span>(<span class="str">"bucket"</span>)))

<span class="cm">-- 3. Join on salted key (100% uniform partition distribution, zero stragglers!)</span>
joined_df = skewed_df.join(replicated_dim, on=<span class="str">"salt"</span>, how=<span class="str">"inner"</span>)</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Plan Verification</div>
          <ul class="explain-list">
            <li><strong>AQE Plan Output:</strong> Look for <code>SortMergeJoin(skew=true)</code> showing runtime split tasks.</li>
            <li><strong>Straggler Indicator:</strong> In Spark UI, task 75th percentile runtime is 2s, but max task runtime is 25m (salting needed).</li>
          </ul>
        </div>
      </div>

      <!-- Card 11: Spark UI SQL Tab & Stage Graph Triage -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">📊 Spark UI SQL Tab & Metric Triage</span>
          <span class="card-tag">Observability</span>
        </div>
        <pre class="code"><span class="cm">-- Metric Formulas & Critical Thresholds</span>
<span class="cls">1. GC Time Ratio:</span>
   <code>GC Time / Task Duration &gt; 10%</code> ➔ Severe Heap Exhaustion.
   <em>Action:</em> Increase executor memory or tune G1GC Region size (<code>-XX:G1HeapRegionSize=32m</code>).
<span class="cls">2. Shuffle Spill Ratio:</span>
   <code>Spill (Memory) / Spill (Disk) ≈ 2.5x to 4.0x</code> (due to Snappy/LZ4 compression).
   <em>Action:</em> Partition count too small; increase <code>spark.sql.shuffle.partitions</code>.
<span class="cls">3. Peak Execution Memory:</span>
   Memory used by hash tables & sort buffers during stage execution.
<span class="cls">4. Task Duration Distribution:</span>
   <code>Max / Median &gt; 3.0x</code> indicates structural data skew in stage.</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 DAG Visualization Inspection</div>
          <ul class="explain-list">
            <li><strong>Blue Rectangles:</strong> WholeStageCodegen blocks; click to reveal underlying operator pipeline details.</li>
            <li><strong>Dotted Lines:</strong> Shuffle exchange stage boundaries; identify network transfers and partition counts.</li>
          </ul>
        </div>
      </div>

      <!-- Card 12: Memory & Execution Sizing Formulas -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">📐 Memory & Execution Sizing Formulas</span>
          <span class="card-tag">Sizing</span>
        </div>
        <pre class="code"><span class="cm">-- Production Formula: Executor Total Memory Budget</span>
<span class="var">Total Container RAM</span> = <span class="cls">ExecutorMemory</span> + <span class="cls">MemoryOverhead</span> + <span class="cls">OffHeapMemory</span>

<span class="cm">-- Sizing Calculation Rules:</span>
<span class="cls">1. Memory Overhead:</span>
   <code>max(384MB, 0.10 * executorMemory)</code> (Required by YARN / K8s).
<span class="cls">2. Unified Memory Pool (spark.memory.fraction = 0.60):</span>
   <code>Usable Memory = (executorMemory - 300MB) * 0.60</code>
   ↳ <span class="fn">Storage Pool</span> (50%): DataFrame caching & broadcast variables.
   ↳ <span class="fn">Execution Pool</span> (50%): Shuffle, join, and sort buffers.
<span class="cls">3. Production Flags for 32GB Executor:</span>
   <code>--executor-memory 28g --conf spark.executor.memoryOverhead=4096m</code>
   <code>--conf spark.memory.offHeap.enabled=true --conf spark.memory.offHeap.size=2g</code></pre>
        <div class="code-explain">
          <div class="explain-head">🔍 OOM Exit Code 137 Defense</div>
          <ul class="explain-list">
            <li><strong>Container Killed:</strong> YARN/K8s kills container when off-heap memory + JVM exceeds container limit.</li>
            <li><strong>Remedy:</strong> Always size <code>memoryOverhead</code> to $\ge 15\%$ when using PyArrow, MLlib, or heavy Python UDFs.</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div class="page-footer-left">
        <span>Apache Spark Catalyst Optimizer Reference Guide</span>
        <span>•</span>
        <span>Section 2: Bottlenecks, AQE Runtime &amp; UI Triage</span>
      </div>
      <div class="page-footer-right">
        <span>Page 2 of 2 • Modern Data Engineer</span>
      </div>
    </div>
  </div>
"""

# ==============================================================================
# GUIDE 2: LAKEHOUSE TABLE FORMATS: DELTA LAKE 3.2+ VS APACHE ICEBERG 1.5+
# ==============================================================================
DELTA_ICEBERG_BODY = """
  <!-- PAGE 1: TRANSACTION LOGS, CONCURRENCY & DELETION VECTORS -->
  <div class="page">
    <div class="header-bar">
      <div class="header-left">
        <div class="header-title-box">
          <h1>🏛️ LAKEHOUSE TABLE FORMATS: DELTA VS ICEBERG</h1>
          <p>Production Reference: Transaction Logs, Concurrency Control, Deletion Vectors & Physical File Layouts</p>
        </div>
      </div>
      <div class="header-badges">
        <span class="badge badge-primary">Delta Lake 3.2+</span>
        <span class="badge badge-secondary">Apache Iceberg 1.5+</span>
        <span class="badge badge-dark">UniForm Interop</span>
        <span class="badge badge-accent">ISO 216 A4</span>
      </div>
    </div>

    <div class="content-grid">
      <!-- Card 1: Transaction Log Architecture -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">📜 Transaction Log Architecture: Delta vs Iceberg</span>
          <span class="card-tag">Storage Engine</span>
        </div>
        <pre class="code"><span class="cm">-- DELTA LAKE LOG STRUCTURE (_delta_log/)</span>
table_root/
  ├── _delta_log/
  │   ├── 00000000000000000000.json     <span class="cm">-- Atomic commit record</span>
  │   ├── 00000000000000000001.json
  │   └── 00000000000000000010.checkpoint.parquet <span class="cm">-- Compacted state every 10 commits</span>
  └── part-00000-xxxx.parquet

<span class="cm">-- APACHE ICEBERG METADATA TREE (metadata/)</span>
table_root/
  ├── metadata/
  │   ├── v1.metadata.json              <span class="cm">-- Table schema, partitions, snapshots</span>
  │   ├── snap-102938475.avro           <span class="cm">-- Manifest list: links all active manifests</span>
  │   └── manifest-uuid-1.avro          <span class="cm">-- Manifest file: individual data file stats</span>
  └── data/
      └── part-00000-yyyy.parquet</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Log Mechanics Comparison</div>
          <ul class="explain-list">
            <li><strong>Delta Lake:</strong> Linear JSON chain with periodic Parquet checkpoints; linear replay reconstructed forward.</li>
            <li><strong>Apache Iceberg:</strong> Hierarchical directed acyclic graph (DAG) of Avro manifests; permits zero-scan partition pruning.</li>
          </ul>
        </div>
      </div>

      <!-- Card 2: Concurrency & Snapshot Isolation -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🔒 Concurrency Control & Snapshot Isolation</span>
          <span class="card-tag">ACID Transactions</span>
        </div>
        <pre class="code"><span class="cm">-- Optimistic Concurrency Control (OCC) Collision Rules</span>
<span class="cls">1. Delta Lake OCC:</span>
   - Reads current table state version <code>V</code>.
   - Attempts to write commit file <code>V+1.json</code>.
   - If collision occurs, executes mutual conflict resolution:
     ↳ Checks if concurrent transaction modified disjoint files/partitions.
     ↳ If disjoint, re-bases and commits as <code>V+2.json</code> without failing!
<span class="cls">2. Apache Iceberg OCC:</span>
   - Validates snapshot <code>S_current</code> at catalog root.
   - Commits new snapshot <code>S_new</code> via atomic compare-and-swap (CAS).
   - Catalogs: REST Catalog, AWS Glue, DynamoDB, JDBC, or Hive Metastore.
<span class="cls">3. Cloud Store Mutex Requirements:</span>
   - S3 requires catalog lock or DynamoDB lock-manager (due to lack of put-if-absent).
   - Azure ADLS Gen2 & Google Cloud Storage support native conditional writes.</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Concurrency Invariants</div>
          <ul class="explain-list">
            <li><strong>Write Conflict Rule:</strong> Concurrent <code>UPDATE</code> or <code>MERGE</code> on overlapping partitions fails with <code>ConcurrentModificationException</code>.</li>
            <li><strong>Concurrent Append:</strong> Multiple concurrent append jobs commit seamlessly without retry in both formats.</li>
          </ul>
        </div>
      </div>

      <!-- Card 3: Deletion Mechanics: COW vs MOR vs Vectors -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🗑️ Deletion Mechanics: COW vs MOR vs Vectors</span>
          <span class="card-tag">Row Mutation</span>
        </div>
        <pre class="code"><span class="cm">-- Row-Level Modification Mechanics</span>
<span class="cls">1. Copy-On-Write (COW):</span>
   - Rewrites entire Parquet file containing modified/deleted row.
   - High write amplification, maximum read performance.
<span class="cls">2. Iceberg Merge-On-Read (MOR):</span>
   - Positional Deletes: Avro file stores (data_file_path, row_position).
   - Equality Deletes: Stores equality predicate (e.g. <code>id = 100</code>).
   - Read penalty: Engine must join data files with delete files on scan.
<span class="cls">3. Delta Lake Deletion Vectors (DVs):</span>
   - Roaring Bitmap written to small sibling Parquet file.
   - Indicates deleted row indexes within 1 Parquet file (1 bit per row).
   - Zero file rewrites on DELETE/UPDATE; amortized 10x faster writes!</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Deletion Vector Enablement</div>
          <ul class="explain-list">
            <li><strong>Enable Delta DVs:</strong> <code>ALTER TABLE tbl SET TBLPROPERTIES ('delta.enableDeletionVectors' = true);</code></li>
            <li><strong>Compaction Trigger:</strong> <code>OPTIMIZE tbl;</code> merges deletion vectors back into clean full Parquet files.</li>
          </ul>
        </div>
      </div>

      <!-- Card 4: Layout Optimization: Liquid vs Z-Order vs Iceberg -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">⚡ Layout Optimization: Liquid vs Transforms</span>
          <span class="card-tag">Clustering</span>
        </div>
        <pre class="code"><span class="cm">-- DELTA LAKE LIQUID CLUSTERING (DBR 13.3+ LTS)</span>
<span class="kw">CREATE TABLE</span> gold_events (
  event_id <span class="typ">STRING</span>, cust_id <span class="typ">BIGINT</span>, event_time <span class="typ">TIMESTAMP</span>, payload <span class="typ">STRING</span>
) <span class="kw">USING DELTA</span>
<span class="kw">CLUSTER BY</span> (cust_id, event_time); <span class="cm">-- Replaces rigid Hive partitioning & Z-Order!</span>

<span class="cm">-- APACHE ICEBERG HIDDEN PARTITIONING & TRANSFORMS</span>
<span class="kw">CREATE TABLE</span> iceberg_events (
  event_id <span class="typ">string</span>, cust_id <span class="typ">bigint</span>, event_time <span class="typ">timestamp</span>, payload <span class="typ">string</span>
) <span class="kw">USING ICEBERG</span>
<span class="kw">PARTITIONED BY</span> (
  <span class="fn">days</span>(event_time),      <span class="cm">-- Hidden transform: no synthetic col required!</span>
  <span class="fn">bucket</span>(<span class="num">16</span>, cust_id)     <span class="cm">-- Murmur3 hash bucket transform</span>
);</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Clustering Superiority</div>
          <ul class="explain-list">
            <li><strong>Liquid Clustering:</strong> Non-destructive; keys can be changed anytime via <code>ALTER TABLE ... CLUSTER BY</code> without rewriting data.</li>
            <li><strong>Hidden Partitioning:</strong> Iceberg prevents consumer query errors; <code>WHERE event_time &gt; '2026-01-01'</code> automatically prunes day partitions.</li>
          </ul>
        </div>
      </div>

      <!-- Card 5: Schema Evolution & Column Mapping -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🧬 Schema Evolution & Column Mapping</span>
          <span class="card-tag">Schema Governance</span>
        </div>
        <pre class="code"><span class="cm">-- 1. Delta Lake Column Mapping (Physical ID vs Logical Name)</span>
<span class="kw">ALTER TABLE</span> delta_orders <span class="kw">SET TBLPROPERTIES</span> (
  <span class="str">'delta.columnMapping.mode'</span> = <span class="str">'name'</span>,
  <span class="str">'delta.minReaderVersion'</span> = <span class="str">'2'</span>,
  <span class="str">'delta.minWriterVersion'</span> = <span class="str">'5'</span>
);
<span class="kw">ALTER TABLE</span> delta_orders <span class="kw">RENAME COLUMN</span> old_cust_id <span class="kw">TO</span> customer_id; <span class="cm">-- Zero data rewrite!</span>

<span class="cm">-- 2. Iceberg Native Field-ID Architecture</span>
<span class="cm">-- Iceberg schemas use immutable Integer field-ids in Parquet metadata.</span>
<span class="kw">ALTER TABLE</span> ice_orders <span class="kw">RENAME COLUMN</span> cust_id <span class="kw">TO</span> customer_id;
<span class="kw">ALTER TABLE</span> ice_orders <span class="kw">ALTER COLUMN</span> amount <span class="kw">TYPE DOUBLE</span>; <span class="cm">-- Safe widening (int ➔ long ➔ double)</span></pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Evolution Invariants</div>
          <ul class="explain-list">
            <li><strong>Safe Widening:</strong> Both formats permit widening conversions without file rewrites. Narrowing is forbidden.</li>
            <li><strong>Column Drop:</strong> Dropping columns marks field as tombstoned in metadata; data is reclaimed during subsequent <code>OPTIMIZE / VACUUM</code>.</li>
          </ul>
        </div>
      </div>

      <!-- Card 6: Time Travel & Historical Snapshot Auditing -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">⏳ Time Travel & Snapshot Auditing</span>
          <span class="card-tag">Auditability</span>
        </div>
        <pre class="code"><span class="cm">-- DELTA LAKE TIME TRAVEL</span>
<span class="kw">SELECT</span> * <span class="kw">FROM</span> silver_orders <span class="kw">VERSION AS OF</span> <span class="num">15</span>;
<span class="kw">SELECT</span> * <span class="kw">FROM</span> silver_orders <span class="kw">TIMESTAMP AS OF</span> <span class="str">'2026-11-10 12:00:00'</span>;
<span class="kw">RESTORE TABLE</span> silver_orders <span class="kw">TO VERSION AS OF</span> <span class="num">14</span>; <span class="cm">-- Instant rollback!</span>

<span class="cm">-- APACHE ICEBERG TIME TRAVEL & TAGS</span>
<span class="kw">SELECT</span> * <span class="kw">FROM</span> ice_orders <span class="kw">FOR SYSTEM_VERSION AS OF</span> <span class="num">102938475892</span>;
<span class="kw">SELECT</span> * <span class="kw">FROM</span> ice_orders <span class="kw">FOR SYSTEM_TIME AS OF</span> <span class="str">'2026-11-10 12:00:00'</span>;

<span class="cm">-- Iceberg Snapshot Tagging (Releases & Audits):</span>
<span class="kw">ALTER TABLE</span> ice_orders <span class="kw">CREATE TAG</span> audited_q3_2026 <span class="kw">RETAIN</span> <span class="num">365</span> <span class="kw">DAYS</span>;
<span class="kw">SELECT</span> * <span class="kw">FROM</span> ice_orders.tag_audited_q3_2026;</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Point-in-Time Mechanics</div>
          <ul class="explain-list">
            <li><strong>Metadata Pointers:</strong> Time travel reconstructs active files by reading historical snapshot records without moving data files.</li>
            <li><strong>Retention Dependency:</strong> Time travel is strictly bounded by <code>VACUUM</code> or <code>expire_snapshots</code> retention policies.</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div class="page-footer-left">
        <span>Lakehouse Table Formats: Delta Lake vs Apache Iceberg</span>
        <span>•</span>
        <span>Section 1: Architecture &amp; Mutation Mechanics</span>
      </div>
      <div class="page-footer-right">
        <span>Page 1 of 2 • Modern Data Engineer</span>
      </div>
    </div>
  </div>

  <!-- PAGE 2: OPERATIONS, UNIFORM & DECISION MATRIX -->
  <div class="page">
    <div class="header-bar">
      <div class="header-left">
        <div class="header-title-box">
          <h1>🏛️ DELTA & ICEBERG OPERATIONS & UNIFORM GUIDE</h1>
          <p>Production Reference: Compaction Runbooks, Delta UniForm, Zero-Copy Migrations & Architectural Decision Matrix</p>
        </div>
      </div>
      <div class="header-badges">
        <span class="badge badge-primary">Operations</span>
        <span class="badge badge-secondary">Delta UniForm</span>
        <span class="badge badge-dark">Migration</span>
        <span class="badge badge-accent">ISO 216 A4</span>
      </div>
    </div>

    <div class="content-grid">
      <!-- Card 7: Maintenance & Retention Runbook -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🧹 Table Compaction & Maintenance Runbook</span>
          <span class="card-tag">FinOps / Hygiene</span>
        </div>
        <pre class="code"><span class="cm">-- DELTA LAKE MAINTENANCE PROTOCOL</span>
<span class="cm">-- 1. Compact small files into 128MB-1GB Parquet files</span>
<span class="kw">OPTIMIZE</span> delta_tbl <span class="kw">WHERE</span> event_date &gt;= <span class="fn">current_date</span>() - <span class="num">7</span>;
<span class="cm">-- 2. Dry-run safety check before permanently deleting tombstoned files</span>
<span class="kw">VACUUM</span> delta_tbl <span class="kw">RETAIN</span> <span class="num">168</span> <span class="kw">HOURS DRY RUN</span>;
<span class="kw">VACUUM</span> delta_tbl <span class="kw">RETAIN</span> <span class="num">168</span> <span class="kw">HOURS</span>; <span class="cm">-- Default 7-day retention safety threshold</span>

<span class="cm">-- APACHE ICEBERG MAINTENANCE (Spark Stored Procedures)</span>
<span class="kw">CALL</span> spark_catalog.system.rewrite_data_files(
  table =&gt; <span class="str">'prod.orders'</span>, strategy =&gt; <span class="str">'binpack'</span>,
  options =&gt; <span class="fn">map</span>(<span class="str">'target-file-size-bytes'</span>, <span class="str">'536870912'</span>) <span class="cm">-- 512MB</span>
);
<span class="kw">CALL</span> spark_catalog.system.expire_snapshots(
  table =&gt; <span class="str">'prod.orders'</span>, older_than =&gt; <span class="fn">TIMESTAMP</span> <span class="str">'2026-11-01 00:00:00'</span>, retain_last =&gt; <span class="num">10</span>
);
<span class="kw">CALL</span> spark_catalog.system.remove_orphan_files(table =&gt; <span class="str">'prod.orders'</span>);</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Retention Caution</div>
          <ul class="explain-list">
            <li><strong>Safety Override:</strong> Never set <code>spark.databricks.delta.vacuum.parallelDelete.enabled</code> with zero retention unless restoring corrupted stages.</li>
            <li><strong>Orphan Removal:</strong> <code>remove_orphan_files</code> purges uncommitted staging files left by killed executor tasks.</li>
          </ul>
        </div>
      </div>

      <!-- Card 8: Delta UniForm (Universal Format) Deep Dive -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🌐 Delta UniForm (Universal Format) Deep Dive</span>
          <span class="card-tag">Cross-Engine</span>
        </div>
        <pre class="code"><span class="cm">-- Enable Delta Universal Format for Iceberg Clients</span>
<span class="kw">CREATE TABLE</span> uniform_telemetry (
  device_id <span class="typ">STRING</span>, temp <span class="typ">DOUBLE</span>, ts <span class="typ">TIMESTAMP</span>
) <span class="kw">USING DELTA</span>
<span class="kw">TBLPROPERTIES</span> (
  <span class="str">'delta.universalFormat.enabledFormats'</span> = <span class="str">'iceberg'</span>,
  <span class="str">'delta.enableDeletionVectors'</span> = <span class="str">'true'</span>
);

<span class="cm">-- Under the Hood Mechanics:</span>
1. Spark writes native Delta Lake Parquet files & <code>_delta_log/*.json</code>.
2. Async catalog task automatically generates Apache Iceberg metadata:
   - Converts Delta log commit into <code>vN.metadata.json</code> & Avro manifests.
3. Snowflake, AWS Athena, BigQuery, & Presto query identical Parquet files!
<span class="cm">-- Zero data duplication, zero dual-write overhead, 100% vector speeds!</span></pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Querying from Remote Engines</div>
          <ul class="explain-list">
            <li><strong>Snowflake External Table:</strong> Point Snowflake to Iceberg metadata location generated by UniForm; full read-performance.</li>
            <li><strong>UniForm Supported Features:</strong> Supports Deletion Vectors (translated to Iceberg positional deletes) and column mapping.</li>
          </ul>
        </div>
      </div>

      <!-- Card 9: In-Place Migration Blueprint -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🔄 In-Place Zero-Copy Migration Blueprint</span>
          <span class="card-tag">Migration</span>
        </div>
        <pre class="code"><span class="cm">-- 1. Migrate Parquet Table to Delta Lake in-place (Zero copy!)</span>
<span class="kw">CONVERT TO DELTA</span> parquet.`s3://prod-lake/legacy_orders/`
<span class="kw">PARTITIONED BY</span> (order_year <span class="typ">INT</span>, order_month <span class="typ">INT</span>);

<span class="cm">-- 2. Migrate Parquet Table to Apache Iceberg via Stored Procedure</span>
<span class="kw">CALL</span> spark_catalog.system.migrate(table =&gt; <span class="str">'hive_prod.legacy_orders'</span>);
<span class="cm">-- Or Non-destructive Snapshot migration (keeps original table intact):</span>
<span class="kw">CALL</span> spark_catalog.system.snapshot(
  source_table =&gt; <span class="str">'hive_prod.legacy_orders'</span>, table =&gt; <span class="str">'iceberg_prod.orders_ice'</span>
);

<span class="cm">-- 3. Ingesting Loose External Parquet Files into Iceberg Table</span>
<span class="kw">CALL</span> spark_catalog.system.add_files(
  table =&gt; <span class="str">'iceberg_prod.orders_ice'</span>,
  dir =&gt; <span class="str">'s3://external-bucket/incoming_parquet/'</span>
);</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Migration Invariants</div>
          <ul class="explain-list">
            <li><strong>Parquet Compatibility:</strong> Existing Parquet files must have consistent column types; no data re-write occurs during <code>CONVERT</code>.</li>
            <li><strong>Rollback Protocol:</strong> Snapshot migration generates an isolated metadata branch, preserving the original Hive table untouched.</li>
          </ul>
        </div>
      </div>

      <!-- Card 10: Streaming I/O & Change Data Feed (CDF) -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">📡 Streaming I/O & Change Data Feed (CDF)</span>
          <span class="card-tag">Streaming CDC</span>
        </div>
        <pre class="code"><span class="cm">-- 1. Delta Lake Change Data Feed (CDF)</span>
<span class="kw">ALTER TABLE</span> silver_customers <span class="kw">SET TBLPROPERTIES</span> (<span class="str">'delta.enableChangeDataFeed'</span> = <span class="str">'true'</span>);

<span class="cm">-- Read CDC stream in PySpark:</span>
cdc_stream = spark.readStream.format(<span class="str">"delta"</span>) \
  .option(<span class="str">"readChangeFeed"</span>, <span class="str">"true"</span>) \
  .option(<span class="str">"startingVersion"</span>, <span class="num">10</span>) \
  .table(<span class="str">"silver_customers"</span>)
<span class="cm">-- Emits: _change_type ('insert', 'update_preimage', 'update_postimage', 'delete')</span>

<span class="cm">-- 2. Apache Iceberg Incremental & CDC Reads</span>
ice_stream = spark.readStream.format(<span class="str">"iceberg"</span>) \
  .option(<span class="str">"streaming-skip-delete-markers"</span>, <span class="str">"true"</span>) \
  .load(<span class="str">"prod.customers"</span>)</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Downstream Propagation</div>
          <ul class="explain-list">
            <li><strong>Silver-to-Gold Pipeline:</strong> Consume <code>update_postimage</code> to maintain synchronized downstream materialized views.</li>
            <li><strong>Watermarking:</strong> Delta CDF supports stateful structured streaming watermarks on commit timestamp (<code>_commit_timestamp</code>).</li>
          </ul>
        </div>
      </div>

      <!-- Card 11: Multi-Engine Ecosystem & Catalog Matrix -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🏛️ Multi-Engine Catalog Integration</span>
          <span class="card-tag">Ecosystem</span>
        </div>
        <pre class="code"><span class="cm">-- Lakehouse Open Catalog Architectures</span>
<span class="cls">1. Unity Catalog (Delta & UniForm Iceberg):</span>
   - Centralized RBAC across Databricks, external Spark, & UniForm clients.
   - Native column-level masking, row-level filters, and lineage tracking.
<span class="cls">2. Apache Iceberg REST Catalog Standard:</span>
   - Open OpenAPI HTTP specification for table snapshot transactions.
   - Implementations: Apache Polaris, Project Nessie, AWS Glue, Tabular.
   - PyIceberg (Python native client) connects without Java/JVM runtime!
<span class="cls">3. Cross-Cloud Engine Query Compatibility:</span>
   - <span class="fn">Snowflake:</span> Reads Iceberg via REST Catalog; reads Delta via UniForm.
   - <span class="fn">Google BigQuery:</span> BigLake native integration for Iceberg & Delta.
   - <span class="fn">AWS Athena / EMR:</span> Native read/write on both formats via AWS Glue.</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Catalog Protocol</div>
          <ul class="explain-list">
            <li><strong>Vendor Neutrality:</strong> Iceberg REST catalog protocol prevents cloud vendor lock-in with standard HTTP commit calls.</li>
            <li><strong>PyIceberg:</strong> Enables lightweight AWS Lambda / Cloud Functions to execute ACID queries without starting Spark clusters.</li>
          </ul>
        </div>
      </div>

      <!-- Card 12: Architectural Decision Matrix -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">⚖️ Head-to-Head Architectural Decision Matrix</span>
          <span class="card-tag">Strategy</span>
        </div>
        <pre class="code"><span class="cm">-- Architectural Evaluation: Delta Lake vs Apache Iceberg</span>
┌───────────────────────┬──────────────────────────┬──────────────────────────┐
│ <span class="cls">Capability</span>            │ <span class="fn">Delta Lake 3.2+</span>          │ <span class="var">Apache Iceberg 1.5+</span>      │
├───────────────────────┼──────────────────────────┼──────────────────────────┤
│ Primary Engine        │ Spark / Photon Vector    │ Multi-Engine (Trino/Flin)│
│ Log Structure         │ Linear JSON + Checkpoint │ DAG of Avro Manifests    │
│ Row Mutations         │ Deletion Vectors (Bitmaps│ Positional/Equality Avro │
│ Layout Optimization   │ Liquid Clustering        │ Hidden Partitions + Sort │
│ Partition Evolution   │ Rewrite required         │ Native In-Place Metadata │
│ Catalog Requirement   │ Optional on cloud storage│ Mandatory (REST/Glue)    │
│ Multi-Engine Interop  │ UniForm (generates Ice)  │ Native across all engines│
│ Python Client         │ delta-rs (Rust/Python)   │ PyIceberg (Pure Python)  │
└───────────────────────┴──────────────────────────┴──────────────────────────┘</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Selection Recommendation</div>
          <ul class="explain-list">
            <li><strong>Choose Delta Lake:</strong> If primary compute is Databricks/Spark and workloads demand highest single-engine Photon throughput.</li>
            <li><strong>Choose Iceberg:</strong> If architecture spans heterogeneous engines (Trino, Flink, Snowflake, Spark) with dynamic partition evolution.</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div class="page-footer-left">
        <span>Lakehouse Table Formats: Delta Lake vs Apache Iceberg</span>
        <span>•</span>
        <span>Section 2: Operations, UniForm &amp; Decision Matrix</span>
      </div>
      <div class="page-footer-right">
        <span>Page 2 of 2 • Modern Data Engineer</span>
      </div>
    </div>
  </div>
"""

# ==============================================================================
# GUIDE 3: DATA ENGINEERING SDLC, DATA CONTRACTS & TESTING PYRAMID GUIDE
# ==============================================================================
SDLC_CONTRACTS_BODY = """
  <!-- PAGE 1: ODCS V3 CONTRACTS & TESTING PYRAMID -->
  <div class="page">
    <div class="header-bar">
      <div class="header-left">
        <div class="header-title-box">
          <h1>🛡️ DATA ENGINEERING SDLC & DATA CONTRACTS</h1>
          <p>Production Reference: Open Data Contract Standard (ODCS v3), Semantic Versioning & Shift-Left Testing Pyramid</p>
        </div>
      </div>
      <div class="header-badges">
        <span class="badge badge-primary">ODCS v3.0</span>
        <span class="badge badge-secondary">Shift-Left Testing</span>
        <span class="badge badge-dark">Data Contracts</span>
        <span class="badge badge-accent">ISO 216 A4</span>
      </div>
    </div>

    <div class="content-grid">
      <!-- Card 1: ODCS v3 Data Contract Specification -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">📜 Open Data Contract Standard (ODCS v3)</span>
          <span class="card-tag">Interface Design</span>
        </div>
        <pre class="code"><span class="cm"># orders_contract.yaml - Open Data Contract Standard v3</span>
<span class="kw">version:</span> <span class="str">"3.0.0"</span>
<span class="kw">dataset:</span> <span class="str">"prod_lakehouse.silver_ecommerce.orders"</span>
<span class="kw">owner:</span> <span class="str">"checkout-team@enterprise.com"</span>
<span class="kw">schema:</span>
  - <span class="var">name:</span> order_id
    <span class="var">type:</span> string
    <span class="var">required:</span> <span class="kw">true</span>
    <span class="var">unique:</span> <span class="kw">true</span>
  - <span class="var">name:</span> total_amount
    <span class="var">type:</span> decimal(18,2)
    <span class="var">required:</span> <span class="kw">true</span>
    <span class="var">logical_bounds:</span> { min: 0.01, max: 1000000.00 }
  - <span class="var">name:</span> order_status
    <span class="var">type:</span> string
    <span class="var">enum:</span> [<span class="str">"PENDING"</span>, <span class="str">"AUTHORIZED"</span>, <span class="str">"SHIPPED"</span>, <span class="str">"REFUNDED"</span>]
<span class="kw">sla:</span>
  <span class="var">freshness:</span> <span class="str">"15m"</span>        <span class="cm"># Maximum allowed pipeline delay</span>
  <span class="var">expected_daily_volume:</span> { min: 50000, max: 2000000 }</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Contract Primitives</div>
          <ul class="explain-list">
            <li><strong>Producer Responsibility:</strong> Upstream services validate against contract prior to landing payloads in Bronze Kafka/S3.</li>
            <li><strong>Automated Tooling:</strong> Parsed by CI/CD to generate JSONSchema, Great Expectations suites, and dbt schema yaml.</li>
          </ul>
        </div>
      </div>

      <!-- Card 2: Semantic Versioning for Data Assets -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🏷️ Semantic Versioning for Data Assets</span>
          <span class="card-tag">Governance</span>
        </div>
        <pre class="code"><span class="cm">-- Dataset SemVer Guidelines (MAJOR.MINOR.PATCH)</span>
<span class="cls">1. MAJOR Version Bump (v1.0.0 ➔ v2.0.0) [BREAKING]:</span>
   - Column removal or column rename.
   - Type narrowing (e.g. <code>DOUBLE</code> ➔ <code>INT</code>, or widening that breaks target systems).
   - Making previously nullable column <code>NOT NULL</code>.
   - Removing enum members or changing business definition of metric.
   <em>Protocol:</em> Dual-write to <code>orders_v1</code> and <code>orders_v2</code> for 90-day deprecation grace.

<span class="cls">2. MINOR Version Bump (v1.1.0 ➔ v1.2.0) [BACKWARD COMPATIBLE]:</span>
   - Adding new nullable column with default value.
   - Adding new valid enum members (if consumers handle open enums).
   - Relaxing constraint (e.g. <code>NOT NULL</code> ➔ nullable).

<span class="cls">3. PATCH Version Bump (v1.1.1 ➔ v1.1.2) [METADATA ONLY]:</span>
   - Documentation, description, or data dictionary updates.</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Migration Governance</div>
          <ul class="explain-list">
            <li><strong>Zero Breaking In-Place:</strong> Breaking changes in production without dual-write violates data contracts and triggers P1 outage.</li>
            <li><strong>Deprecation Alerting:</strong> Monitor audit logs to verify all consumers migrated before dropping <code>v1</code> endpoints.</li>
          </ul>
        </div>
      </div>

      <!-- Card 3: Shift-Left Testing Pyramid for Lakehouse -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🔺 Shift-Left Testing Pyramid for Lakehouse</span>
          <span class="card-tag">Quality Engineering</span>
        </div>
        <pre class="code"><span class="cm">-- 4-Tier Lakehouse Testing Architecture</span>
┌────────────────────────────────────────────────────────┐
│ <span class="cls">Tier 4: Reconciliation & Anomaly Detection</span>             │
│ Production monitoring: Volume drift, distribution shift│
├────────────────────────────────────────────────────────┤
│ <span class="fn">Tier 3: Medallion Integration Tests</span>                   │
│ Silver/Gold table assertions: End-to-end ACID pipeline │
├────────────────────────────────────────────────────────┤
│ <span class="var">Tier 2: Ingress Contract Verification</span>                  │
│ Schema validation, null checks, enum conformance (DLQ) │
├────────────────────────────────────────────────────────┤
│ <span class="str">Tier 1: Fast Local Unit Tests (80% of test suite)</span>      │
│ Pure business logic functions tested with PyTest/Chispa│
└────────────────────────────────────────────────────────┘</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Testing Pyramid Distribution</div>
          <ul class="explain-list">
            <li><strong>Unit Testing (PyTest + Chispa):</strong> Runs locally in &lt;15 seconds using mock DataFrames without spinning up cloud clusters.</li>
            <li><strong>Fast Feedback:</strong> 95% of logic bugs caught at Tier 1 before pushing git commit to remote branch.</li>
          </ul>
        </div>
      </div>

      <!-- Card 4: Dead Letter Queue (DLQ) & Quarantine -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🛡️ Dead Letter Queue (DLQ) & Quarantine</span>
          <span class="card-tag">Fault Tolerance</span>
        </div>
        <pre class="code"><span class="cm">-- PySpark Streaming Schema Quarantine & DLQ Flow</span>
valid_records = raw_df.filter(
    <span class="fn">col</span>(<span class="str">"order_id"</span>).isNotNull() &
    (<span class="fn">col</span>(<span class="str">"total_amount"</span>) &gt; <span class="num">0</span>) &
    <span class="fn">col</span>(<span class="str">"order_status"</span>).isin(<span class="str">"PENDING"</span>, <span class="str">"AUTHORIZED"</span>, <span class="str">"SHIPPED"</span>)
)

quarantined_records = raw_df.filter(
    <span class="fn">col</span>(<span class="str">"order_id"</span>).isNull() |
    (<span class="fn">col</span>(<span class="str">"total_amount"</span>) &lt;= <span class="num">0</span>) |
    ~<span class="fn">col</span>(<span class="str">"order_status"</span>).isin(<span class="str">"PENDING"</span>, <span class="str">"AUTHORIZED"</span>, <span class="str">"SHIPPED"</span>)
).withColumn(<span class="str">"rejection_reason"</span>, <span class="fn">lit</span>(<span class="str">"FAILED_CONTRACT_RULES"</span>)) \
 .withColumn(<span class="str">"rejected_at"</span>, <span class="fn">current_timestamp</span>())

<span class="cm">-- Divert invalid payloads to Bronze quarantine table; pipeline never crashes!</span>
quarantined_records.write.format(<span class="str">"delta"</span>).mode(<span class="str">"append"</span>).saveAsTable(<span class="str">"bronze.orders_dlq"</span>)</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Quarantine Principles</div>
          <ul class="explain-list">
            <li><strong>Non-Stop Pipeline:</strong> Corrupt source records are quarantined without blocking processing of valid downstream rows.</li>
            <li><strong>Automated PagerDuty:</strong> If <code>dlq_rate &gt; 1.5%</code> over 10-minute window, trigger emergency alert to source upstream.</li>
          </ul>
        </div>
      </div>

      <!-- Card 5: Pre-Commit & Local Developer Tooling -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">💻 Pre-Commit & Local Developer Tooling</span>
          <span class="card-tag">Developer Velocity</span>
        </div>
        <pre class="code"><span class="cm"># .pre-commit-config.yaml - Enforce quality locally before git push</span>
<span class="kw">repos:</span>
  - <span class="var">repo:</span> https://github.com/sqlfluff/sqlfluff
    <span class="var">rev:</span> 3.0.0
    <span class="var">hooks:</span>
      - <span class="var">id:</span> sqlfluff-lint
        <span class="var">args:</span> [<span class="str">"--dialect"</span>, <span class="str">"databricks"</span>]
  - <span class="var">repo:</span> https://github.com/astral-sh/ruff-pre-commit
    <span class="var">rev:</span> v0.4.0
    <span class="var">hooks:</span>
      - <span class="var">id:</span> ruff
        <span class="var">args:</span> [<span class="str">"--fix"</span>]
  - <span class="var">repo:</span> local
    <span class="var">hooks:</span>
      - <span class="var">id:</span> pytest-unit
        <span class="var">name:</span> PyTest Fast Logic Unit Tests
        <span class="var">entry:</span> pytest tests/unit -m <span class="str">"not slow"</span>
        <span class="var">language:</span> system
        <span class="var">pass_filenames:</span> <span class="kw">false</span></pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Dialect Rule Enforcement</div>
          <ul class="explain-list">
            <li><strong>SQLFluff Dialect:</strong> Enforces lowercase keywords, comma placement, explicit column aliasing, and qualified table references.</li>
            <li><strong>Ruff Speed:</strong> Executes Python linting and code formatting in &lt;50ms across entire repository.</li>
          </ul>
        </div>
      </div>

      <!-- Card 6: Contract-Driven Ingestion Verification -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🔍 Contract-Driven Ingestion Verification</span>
          <span class="card-tag">Automated Verification</span>
        </div>
        <pre class="code"><span class="cm"># Python Pydantic / Pandera Ingestion Gate</span>
<span class="kw">from</span> pandera.pyspark <span class="kw">import</span> DataFrameModel, Field
<span class="kw">from</span> pyspark.sql.types <span class="kw">import</span> StringType, DecimalType

<span class="kw">class</span> <span class="cls">OrdersContractModel</span>(DataFrameModel):
    order_id: StringType = Field(nullable=<span class="kw">False</span>, unique=<span class="kw">True</span>)
    customer_id: StringType = Field(nullable=<span class="kw">False</span>)
    total_amount: DecimalType = Field(ge=<span class="num">0.01</span>, le=<span class="num">1000000.0</span>)
    order_status: StringType = Field(isin=[<span class="str">"PENDING"</span>, <span class="str">"AUTHORIZED"</span>, <span class="str">"SHIPPED"</span>])

<span class="cm"># Validate Ingested DataFrame:</span>
<span class="kw">try</span>:
    validated_df = OrdersContractModel.validate(raw_df)
<span class="kw">except</span> <span class="cls">SchemaError</span> <span class="kw">as</span> err:
    logger.error(<span class="str">f"Contract breached: {err}"</span>)
    send_slack_alert(channel=<span class="str">"#data-ops"</span>, msg=str(err))</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Schema Verification Benefits</div>
          <ul class="explain-list">
            <li><strong>Type Strictness:</strong> Catches unexpected string floats, null IDs, and unmapped status codes before entering Silver tier.</li>
            <li><strong>Living Documentation:</strong> Pydantic/Pandera models serve as executable code contracts checked into version control.</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div class="page-footer-left">
        <span>Data Engineering SDLC &amp; Data Contracts Reference Guide</span>
        <span>•</span>
        <span>Section 1: ODCS Contracts &amp; Shift-Left Testing</span>
      </div>
      <div class="page-footer-right">
        <span>Page 1 of 2 • Modern Data Engineer</span>
      </div>
    </div>
  </div>

  <!-- PAGE 2: CI/CD GATES, BLUE/GREEN & TRIAGE -->
  <div class="page">
    <div class="header-bar">
      <div class="header-left">
        <div class="header-title-box">
          <h1>🛡️ CI/CD GATES, BLUE/GREEN & INCIDENT RUNBOOK</h1>
          <p>Production Reference: Ephemeral Slim CI, Zero-Downtime Blue/Green Swaps & SLA Breach Emergency Protocol</p>
        </div>
      </div>
      <div class="header-badges">
        <span class="badge badge-primary">CI/CD Gates</span>
        <span class="badge badge-secondary">Blue/Green Deploy</span>
        <span class="badge badge-dark">Slim CI</span>
        <span class="badge badge-accent">ISO 216 A4</span>
      </div>
    </div>

    <div class="content-grid">
      <!-- Card 7: Automated Ephemeral Slim CI Gates -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🚀 Automated Ephemeral Slim CI Gates</span>
          <span class="card-tag">CI/CD Pipeline</span>
        </div>
        <pre class="code"><span class="cm"># GitHub Actions: dbt Slim CI against Ephemeral Schema</span>
<span class="kw">name:</span> Pull Request Data Pipeline Gate
<span class="kw">on:</span> [pull_request]
<span class="kw">jobs:</span>
  <span class="var">slim_ci:</span>
    <span class="var">runs-on:</span> ubuntu-latest
    <span class="var">steps:</span>
      - <span class="var">uses:</span> actions/checkout@v4
      - <span class="var">name:</span> Download Production Manifest
        <span class="var">run:</span> aws s3 cp s3://prod-manifests/manifest.json ./prod-manifest.json
      - <span class="var">name:</span> Run Modified Models & First-Degree Downstream
        <span class="var">run:</span> |
          dbt build --target ci \
            --select "state:modified+" \
            --defer --state ./ \
            --vars 'schema_suffix: pr_${{ github.event.number }}'
      - <span class="var">name:</span> Teardown Ephemeral Schema on Merge/Close
        <span class="kw">if:</span> always()
        <span class="var">run:</span> dbt run-operation drop_pr_schema --args '{"pr_id": "${{ github.event.number }}"}'</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Slim CI Mechanics</div>
          <ul class="explain-list">
            <li><strong>State Deferral:</strong> Unmodified upstream models read production tables directly without recomputing historical data.</li>
            <li><strong>Cost Elimination:</strong> PR validation finishes in &lt;3 minutes while verifying exact column dependencies.</li>
          </ul>
        </div>
      </div>

      <!-- Card 8: Zero-Downtime Blue/Green Table Deployment -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🔄 Zero-Downtime Blue/Green Table Deployment</span>
          <span class="card-tag">Deployment</span>
        </div>
        <pre class="code"><span class="cm">-- 1. Create Staging Clone (Zero data copy via Delta Shallow Clone)</span>
<span class="kw">CREATE TABLE</span> gold_orders_green <span class="kw">SHALLOW CLONE</span> gold_orders_blue;

<span class="cm">-- 2. Execute High-Impact Transform & Backfill on Green Table</span>
<span class="kw">INSERT INTO</span> gold_orders_green <span class="kw">SELECT</span> ... <span class="kw">FROM</span> silver_orders_v2;

<span class="cm">-- 3. Execute Automated Acceptance Validation Suite on Green:</span>
<span class="kw">ASSERT</span> (<span class="kw">SELECT count</span>(*) <span class="kw">FROM</span> gold_orders_green) &gt; <span class="num">100000</span>;
<span class="kw">ASSERT</span> (<span class="kw">SELECT count</span>(*) <span class="kw">FROM</span> gold_orders_green <span class="kw">WHERE</span> id <span class="kw">IS NULL</span>) = <span class="num">0</span>;

<span class="cm">-- 4. Atomic View Pointer Swap (Zero downtime, sub-millisecond switch!)</span>
<span class="kw">CREATE OR REPLACE VIEW</span> gold.orders <span class="kw">AS SELECT</span> * <span class="kw">FROM</span> gold_orders_green;

<span class="cm">-- 5. Instant Rollback Capability (if metric anomaly surfaces):</span>
<span class="kw">CREATE OR REPLACE VIEW</span> gold.orders <span class="kw">AS SELECT</span> * <span class="kw">FROM</span> gold_orders_blue;</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Deployment Safeguards</div>
          <ul class="explain-list">
            <li><strong>Consumer Isolation:</strong> BI dashboards and ML inference services query stable <code>gold.orders</code> view; zero connection drops.</li>
            <li><strong>Blue Retention:</strong> Retain blue table for 48 hours before dropping storage to permit instantaneous rollback.</li>
          </ul>
        </div>
      </div>

      <!-- Card 9: Automated Schema Drift Detection -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">📡 Automated Schema Drift Detection</span>
          <span class="card-tag">Observability</span>
        </div>
        <pre class="code"><span class="cm">-- Delta Lake Auto-Merge Schema Evolution vs Drift Trap</span>
<span class="cm">-- SAFE: Controlled additive column evolution:</span>
<span class="kw">spark.conf.set</span>(<span class="str">"spark.databricks.delta.schema.autoMerge.enabled"</span>, <span class="str">"false"</span>)
<span class="cm">-- Keep autoMerge DISABLED in production to prevent silent corruption!</span>

<span class="cm">-- Explicit Drift Trap Detection Query:</span>
incoming_cols = set(incoming_df.columns)
contract_cols = set(contract.get_columns())

<span class="kw">if not</span> incoming_cols.issubset(contract_cols):
    unexpected_cols = incoming_cols - contract_cols
    logger.warn(<span class="str">f"UNAUTHORIZED SCHEMA DRIFT: {unexpected_cols}"</span>)
    divert_to_unmapped_payload(incoming_df)
<span class="kw">elif</span> missing := contract_cols - incoming_cols:
    <span class="kw">raise</span> <span class="cls">ContractViolationException</span>(<span class="str">f"Missing required contract columns: {missing}"</span>)</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Drift Prevention Rules</div>
          <ul class="explain-list">
            <li><strong>AutoMerge Hazard:</strong> Enabling <code>autoMerge=true</code> indiscriminately turns typos like <code>cusotmer_id</code> into permanent columns.</li>
            <li><strong>Alert Webhooks:</strong> Transmit schema drift anomalies directly to data platform Slack channel with author attribution.</li>
          </ul>
        </div>
      </div>

      <!-- Card 10: Data Product Lifecycle & Deprecation -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">📦 Data Product Lifecycle & Deprecation</span>
          <span class="card-tag">Product Management</span>
        </div>
        <pre class="code"><span class="cm">-- 4-Stage Deprecation Protocol</span>
<span class="cls">Phase 1: Announcement (T - 90 Days)</span>
  - Publish contract notice in Data Catalog (Unity Catalog / Purview).
  - Add tag <code>lifecycle: "deprecated"</code> and <code>sunset_date: "2027-02-15"</code>.
<span class="cls">Phase 2: Active Dual-Write (T - 60 Days)</span>
  - Ingestion pipeline mirrors writes to both <code>v1</code> and <code>v2</code> tables.
<span class="cls">Phase 3: Brownout Testing (T - 14 Days)</span>
  - Temporarily disable <code>v1</code> access for 4 hours during non-peak business window.
  - Surfaces undocumented or silent consumer pipelines before hard cutoff!
<span class="cls">Phase 4: Sunset & Archival (T = 0)</span>
  - Revoke read permissions on <code>v1</code>, snapshot final state, archive to cold tier.</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Brownout Best Practice</div>
          <ul class="explain-list">
            <li><strong>The Brownout Test:</strong> The only 100% reliable method to find legacy cron jobs and rogue spreadsheets querying deprecated assets.</li>
            <li><strong>Contact Registration:</strong> Maintain consumer owner metadata inside catalog for automated notifications.</li>
          </ul>
        </div>
      </div>

      <!-- Card 11: Production Contract Breach Protocol -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🚨 Production Contract Breach Protocol</span>
          <span class="card-tag">Emergency Ops</span>
        </div>
        <pre class="code"><span class="cm">-- Emergency Triage Sequence for Broken Data SLAs / Schemas</span>
<span class="kw">Step 1: Isolate & Divert</span>
  - Halt automated ingestion to Silver tables immediately:
    <code>ALTER PIPELINE orders_pipeline PAUSE;</code>
  - Divert raw incoming Kafka records to dead letter storage bucket.
<span class="kw">Step 2: Stakeholder Notification</span>
  - Post P1 incident ticket to status page: <em>"Silver Orders Degraded"</em>.
<span class="kw">Step 3: Root-Cause Classification</span>
  - Check whether failure is: (A) Source payload mutation, (B) Compute cluster OOM, or (C) Upstream database outage.
<span class="kw">Step 4: Remediation & Backfill</span>
  - Patch contract validation rules, run idempotent backfill:
    <code>REPLACE INTO silver_orders SELECT ... FROM raw_quarantine;</code></pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Incident Ownership</div>
          <ul class="explain-list">
            <li><strong>Producer Responsibility:</strong> When source teams mutate schemas unannounced, source team owns MTTR resolution.</li>
            <li><strong>SLA Impact:</strong> Document exact downstream dashboard impact and downtime minutes in post-mortem.</li>
          </ul>
        </div>
      </div>

      <!-- Card 12: FinOps & Lakehouse CI/CD Optimization -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">💰 FinOps & Lakehouse CI/CD Cost Controls</span>
          <span class="card-tag">Cost Engineering</span>
        </div>
        <pre class="code"><span class="cm">-- Lakehouse CI/CD Resource Rightsizing Rules</span>
<span class="cls">1. Auto-Termination for Test Clusters:</span>
   - Enforce <code>autotermination_minutes: 10</code> on all PR evaluation clusters.
<span class="cls">2. Ephemeral Serverless SQL Warehouses:</span>
   - Use Serverless 2X-Small warehouses for dbt testing; scales down in 5s!
<span class="cls">3. Partition Pruning in CI Suites:</span>
   - Restrict integration testing datasets to last 3 days:
   <code>dbt test --vars 'test_start_date: 2026-11-10'</code>
<span class="cls">4. Cache Layer Reuse:</span>
   - Cache Python virtual environments, dbt packages, and dependencies in CI.
<span class="cls">5. GitHub Actions Concurrency Cancellation:</span>
   - Cancel outdated PR builds when new commits are pushed to same branch.</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 FinOps Invariants</div>
          <ul class="explain-list">
            <li><strong>Cost Savings:</strong> Slim CI + 10-minute auto-termination cuts monthly data engineering compute spend by 65%.</li>
            <li><strong>Budget Alerts:</strong> Set daily workspace spend anomaly detection alerts at $200 variance.</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div class="page-footer-left">
        <span>Data Engineering SDLC &amp; Data Contracts Reference Guide</span>
        <span>•</span>
        <span>Section 2: CI/CD Gates, Blue/Green &amp; Emergency Protocol</span>
      </div>
      <div class="page-footer-right">
        <span>Page 2 of 2 • Modern Data Engineer</span>
      </div>
    </div>
  </div>
"""

def compile_pdf(html_path, pdf_path):
    print(f"Compiling PDF: {os.path.basename(html_path)} -> {os.path.basename(pdf_path)}...")
    cmd = [
        CHROME_BIN,
        "--headless",
        "--disable-gpu",
        "--no-pdf-header-footer",
        "--allow-file-access-from-files",
        f"--print-to-pdf={pdf_path}",
        html_path
    ]
    subprocess.run(cmd, check=True)
    size_kb = os.path.getsize(pdf_path) / 1024
    print(f"  ✓ Created {os.path.basename(pdf_path)} ({size_kb:.1f} KB)")

def render_images(pdf_path, prefix, dpi=250):
    print(f"Rendering high-res images from {os.path.basename(pdf_path)} at {dpi} DPI...")
    doc = fitz.open(pdf_path)
    page_images = []
    
    for i, page in enumerate(doc):
        pix = page.get_pixmap(dpi=dpi)
        img_name = f"{prefix}_page_{i+1}.png"
        img_path = os.path.join(IMG_DIR, img_name)
        pix.save(img_path)
        page_images.append(img_path)
        print(f"  ✓ Rendered Page {i+1}: {img_name} ({pix.width}x{pix.height})")
    
    # If 2 pages, create side-by-side poster
    if len(page_images) == 2:
        poster_name = f"{prefix}_poster.png"
        poster_path = os.path.join(IMG_DIR, poster_name)
        img1 = Image.open(page_images[0])
        img2 = Image.open(page_images[1])
        
        gap = 30
        total_width = img1.width + img2.width + gap
        max_height = max(img1.height, img2.height)
        
        poster = Image.new("RGB", (total_width, max_height), color=(8, 12, 21))
        poster.paste(img1, (0, 0))
        poster.paste(img2, (img1.width + gap, 0))
        poster.save(poster_path, quality=95)
        print(f"  ✓ Created Side-by-Side Panoramic Poster: {poster_name} ({total_width}x{max_height})")

def inject_bookmarks_and_metadata(pdf_path, toc_entries, metadata):
    print(f"Injecting TOC bookmarks & metadata into {os.path.basename(pdf_path)}...")
    doc = fitz.open(pdf_path)
    doc.set_toc(toc_entries)
    doc.set_metadata(metadata)
    
    # Save to temp and replace atomically
    temp_path = pdf_path + ".tmp"
    doc.save(temp_path)
    doc.close()
    os.replace(temp_path, pdf_path)
    
    # Verification read
    verify_doc = fitz.open(pdf_path)
    print(f"  ✓ Verified: {len(verify_doc.get_toc())} TOC entries, Title: '{verify_doc.metadata.get('title')}'")
    verify_doc.close()

def main():
    print("=" * 75)
    print("ENTERPRISE REFERENCE GUIDES GENERATOR & PDF BOOKMARK ENGINE")
    print("=" * 75)

    guides = [
        {
            "name": "spark_execution_plan_and_catalyst_triage_guide",
            "title": "Spark Catalyst Optimizer & Physical Execution Plan Triage Guide",
            "theme": "#f59e0b",
            "title_color": "#38bdf8",
            "body": CATALYST_BODY,
            "prefix": "spark_catalyst_plan",
            "pdf_name": "spark_execution_plan_and_catalyst_triage_guide.pdf",
            "subject": "Apache Spark Catalyst Compiler, Physical Execution Plans, AQE Runtime Optimization, and Memory Tuning",
            "keywords": "Spark, Catalyst Optimizer, EXPLAIN, WholeStageCodegen, AQE, Skew Join, Shuffle Spill, Performance Tuning",
            "toc": [
                [1, "Apache Spark Catalyst & Physical Execution Plan Guide", 1],
                [2, "Page 1: 5-Stage Catalyst Pipeline, EXPLAIN Anatomy & Optimizer Rules", 1],
                [3, "5-Stage Catalyst Compiler Pipeline", 1],
                [3, "Anatomy of EXPLAIN FORMATTED & Operator Hierarchy", 1],
                [3, "Join Strategy Selection Hierarchy (BHJ, SMJ, BNLJ)", 1],
                [3, "Core Catalyst Optimizer Rules (Pushdowns & Pruning)", 1],
                [3, "Partitioning & Distribution Expressions", 1],
                [3, "Whole-Stage CodeGen (WSCG) Mechanics & Bytecode Limits", 1],
                [2, "Page 2: Physical Bottlenecks, AQE Runtime Rules & UI Triage", 2],
                [3, "Adaptive Query Execution (AQE) 3 Engine Pillars", 2],
                [3, "Exchange & Shuffle Bottleneck Elimination", 2],
                [3, "Plan Anti-Patterns & Production Antidotes", 2],
                [3, "Skew Join Mitigation & Two-Phase Salting Plan", 2],
                [3, "Spark UI SQL Tab & Metric Triage (GC & Spill Ratios)", 2],
                [3, "Memory & Execution Sizing Formulas (Unified Pools & Off-Heap)", 2],
            ]
        },
        {
            "name": "lakehouse_table_formats_delta_iceberg_guide",
            "title": "Lakehouse Table Formats Architecture & Migration Guide: Delta Lake vs Apache Iceberg",
            "theme": "#06b6d4",
            "title_color": "#38bdf8",
            "body": DELTA_ICEBERG_BODY,
            "prefix": "lakehouse_table_formats",
            "pdf_name": "lakehouse_table_formats_delta_iceberg_guide.pdf",
            "subject": "Lakehouse Storage Formats: Delta Lake 3.2+ and Apache Iceberg 1.5+ Architecture, Concurrency, Deletions, and UniForm",
            "keywords": "Delta Lake, Apache Iceberg, Lakehouse, Deletion Vectors, Liquid Clustering, UniForm, ACID, Compaction, Migration",
            "toc": [
                [1, "Lakehouse Table Formats: Delta Lake vs Apache Iceberg Guide", 1],
                [2, "Page 1: Transaction Logs, Concurrency & Deletion Vectors", 1],
                [3, "Transaction Log Architecture: _delta_log vs Metadata Tree", 1],
                [3, "Concurrency Control & Snapshot Isolation (OCC & Mutexes)", 1],
                [3, "Deletion Mechanics: COW vs MOR vs Deletion Vectors", 1],
                [3, "Layout Optimization: Liquid Clustering vs Hidden Transforms", 1],
                [3, "Schema Evolution & Column Mapping (Field-IDs)", 1],
                [3, "Time Travel & Historical Snapshot Auditing", 1],
                [2, "Page 2: Operations, UniForm Interoperability & Decision Matrix", 2],
                [3, "Table Compaction & Maintenance Runbook (OPTIMIZE & VACUUM)", 2],
                [3, "Delta UniForm (Universal Format) Deep Dive & Zero-Copy Reads", 2],
                [3, "In-Place Zero-Copy Migration Blueprint (CONVERT TO DELTA)", 2],
                [3, "Streaming I/O & Change Data Feed (CDF)", 2],
                [3, "Multi-Engine Catalog Integration (Unity Catalog, REST Catalogs)", 2],
                [3, "Head-to-Head Architectural Decision Matrix (12-Factor)", 2],
            ]
        },
        {
            "name": "data_engineering_sdlc_and_data_contracts_guide",
            "title": "Data Engineering SDLC, Data Contracts & Testing Pyramid Reference Guide",
            "theme": "#10b981",
            "title_color": "#38bdf8",
            "body": SDLC_CONTRACTS_BODY,
            "prefix": "data_sdlc_contracts",
            "pdf_name": "data_engineering_sdlc_and_data_contracts_guide.pdf",
            "subject": "Data Engineering SDLC, Open Data Contract Standard (ODCS v3), Shift-Left Testing Pyramid, and Ephemeral Slim CI/CD",
            "keywords": "Data Contracts, ODCS, Data Engineering SDLC, Testing Pyramid, Slim CI, Blue Green Deployment, Schema Drift, Great Expectations",
            "toc": [
                [1, "Data Engineering SDLC & Data Contracts Reference Guide", 1],
                [2, "Page 1: ODCS Contracts, SemVer & Shift-Left Testing", 1],
                [3, "Open Data Contract Standard (ODCS v3) Specification", 1],
                [3, "Semantic Versioning for Data Assets (Breaking vs Non-Breaking)", 1],
                [3, "Shift-Left Testing Pyramid for Lakehouse (4 Tiers)", 1],
                [3, "Dead Letter Queue (DLQ) & Quarantine Architecture", 1],
                [3, "Pre-Commit & Local Developer Tooling (SQLFluff & Ruff)", 1],
                [3, "Contract-Driven Ingestion Verification (Pydantic / Pandera)", 1],
                [2, "Page 2: CI/CD Gates, Blue/Green Deployments & Incident Protocol", 2],
                [3, "Automated Ephemeral Slim CI Gates (dbt State Deferral)", 2],
                [3, "Zero-Downtime Blue/Green Table Deployment (Shallow Clones)", 2],
                [3, "Automated Schema Drift Detection & Quarantine", 2],
                [3, "Data Product Lifecycle & 4-Stage Deprecation Protocol", 2],
                [3, "Production Contract Breach Emergency Protocol (P1 Triage)", 2],
                [3, "FinOps & Lakehouse CI/CD Cost Controls", 2],
            ]
        }
    ]

    # 1. Compile 3 New Reference Guides
    for guide in guides:
        html_file = os.path.join(HTML_DIR, f"{guide['name']}.html")
        pdf_file = os.path.join(PDF_DIR, guide['pdf_name'])
        
        full_html = generate_full_html(
            title=guide["title"],
            theme_color=guide["theme"],
            title_color=guide["title_color"],
            body_content=guide["body"]
        )
        with open(html_file, "w", encoding="utf-8") as f:
            f.write(full_html)
        print(f"\n[1/3] Wrote HTML: {os.path.basename(html_file)}")
        
        compile_pdf(html_file, pdf_file)
        render_images(pdf_file, guide["prefix"], dpi=250)
        
        metadata = {
            "title": guide["title"],
            "author": "Santosh Jammi | Principal Data Architect",
            "subject": guide["subject"],
            "keywords": guide["keywords"],
            "creator": "Modern Data Engineer Reference Publishing Engine",
            "producer": "Headless Chrome / PyMuPDF High-Density Publishing Engine"
        }
        inject_bookmarks_and_metadata(pdf_file, guide["toc"], metadata)

    # 2. Enrich the 7 Existing Cheat Sheets with TOC Outlines & Metadata
    print("\n" + "=" * 75)
    print("ENRICHING EXISTING 7 CHEAT SHEET PDFS WITH ACCESSIBLE TOC OUTLINES")
    print("=" * 75)

    existing_enrichments = [
        {
            "filename": "databricks_sparksql_cheatsheet.pdf",
            "title": "Databricks Spark SQL Architecture & Query Suite",
            "subject": "Spark SQL Lakehouse Foundation, DDL, Liquid Clustering, Deletion Vectors, and AQE Optimization",
            "keywords": "Spark SQL, Databricks, Delta Lake, Liquid Clustering, Deletion Vectors, Window Functions, AQE",
            "toc": [
                [1, "Databricks Spark SQL Architecture & Query Suite", 1],
                [2, "Page 1: Lakehouse Foundation, DDL & Window Mechanics", 1],
                [3, "Unity Catalog 3-Level Namespace & DDL", 1],
                [3, "Window Frame Aggregations & QUALIFY Deduplication", 1],
                [3, "Complex Nested JSON & Higher-Order Array Transforms", 1],
                [3, "Liquid Clustering vs Z-Order Multi-Dimensional Indexing", 1],
                [3, "Delta Lake ACID Merge with Schema Evolution", 1],
                [3, "Adaptive Query Execution (AQE) Optimizer Hints", 1],
                [2, "Page 2: Advanced MERGE INTO, Deletion Vectors & Optimization", 2],
                [3, "Deletion Vectors & Fast In-Place Deletions", 2],
                [3, "Dynamic File Pruning (DFP) & Bloom Filters", 2],
                [3, "Photon Engine Vectorized Execution Acceleration", 2],
                [3, "Materialized Views & Streaming Tables in DLT", 2],
                [3, "Dynamic Table Partitions & Ingestion Staging", 2],
                [3, "FinOps Optimization & Query Profile Diagnostic Triage", 2],
            ]
        },
        {
            "filename": "databricks_pyspark_cheatsheet.pdf",
            "title": "Databricks PySpark Architecture & Engine Suite",
            "subject": "Distributed PySpark DataFrames, Broadcast Joins, Key Salting, Structured Streaming, and Arrow UDFs",
            "keywords": "PySpark, Databricks, Broadcast Hash Join, Salting, Structured Streaming, Arrow UDF, Watermarking",
            "toc": [
                [1, "Databricks PySpark Architecture & Engine Suite", 1],
                [2, "Page 1: Distributed DataFrame APIs & Broadcast Joins", 1],
                [3, "DataFrame Transformation Chains & Column Expressions", 1],
                [3, "Broadcast Hash Joins & Dynamic Memory Thresholds", 1],
                [3, "Key Salting for Extreme Stage Skew Elimination", 1],
                [3, "Dynamic Partition Pruning & Broadcast Exchange", 1],
                [3, "Bucket-Aware Joins & Zero-Shuffle Strategies", 1],
                [3, "DataFrame Persistence, Unpersisting & Storage Levels", 1],
                [2, "Page 2: Stateful Structured Streaming & Vectorized Arrow UDFs", 2],
                [3, "Stateful Structured Streaming with Watermarks", 2],
                [3, "Apache Arrow Vectorized Pandas UDFs", 2],
                [3, "Delta Lake Time Travel & Historical Point-in-Time Audits", 2],
                [3, "Window Aggregations & Analytical Lead/Lag Patterns", 2],
                [3, "Auto Loader (cloudFiles) Production Ingestion", 2],
                [3, "PySpark Unit Testing with Chispa & Schema Assertions", 2],
            ]
        },
        {
            "filename": "databricks_spark_core_cheatsheet.pdf",
            "title": "Databricks Spark Core Internals & JVM Tuning Suite",
            "subject": "Spark Core Memory Pools, JVM G1GC Flags, Tungsten Memory, Shuffle Spill Triage, and Task Scheduling",
            "keywords": "Spark Core, JVM Tuning, G1GC, Memory Pools, Tungsten, Shuffle Spill, Executor Allocation, OOM Exit 137",
            "toc": [
                [1, "Databricks Spark Core Internals & JVM Tuning Suite", 1],
                [2, "Page 1: JVM Memory Breakdown, Storage vs Execution Pools", 1],
                [3, "JVM On-Heap vs Off-Heap Memory Pool Breakdown", 1],
                [3, "Production G1GC Garbage Collection Flags for Large Heaps", 1],
                [3, "Tungsten Project: Binary Memory Management & Off-Heap Allocations", 1],
                [3, "Shuffle Spill Triage: Memory vs Disk Spill Mitigation", 1],
                [3, "Dynamic Allocation & Executor Rightsizing Calculations", 1],
                [3, "Task Serialization, Closure Capture & Kryo Registrations", 1],
                [2, "Page 2: Shuffle Spill Triage, Schedulers & Resource Allocation", 2],
                [3, "Shuffle Service Mechanics & Push-Based Shuffle Architecture", 2],
                [3, "Stage Failure Triage & FetchFailedException Remediation", 2],
                [3, "Spark Driver vs Executor Memory Budgeting Formulas", 2],
                [3, "Locality Levels & Task Scheduling Optimization", 2],
                [3, "Triaging Container Killed (Exit Code 137) OOM Scenarios", 2],
                [3, "Spark UI Metrics Interpretation & Execution Bottlenecks", 2],
            ]
        },
        {
            "filename": "databricks_python_cheatsheet.pdf",
            "title": "Python in Databricks SDK, CLI & DABs Suite",
            "subject": "Databricks Asset Bundles (DABs), dbutils Volumes, Secrets Retrieval, Workspace REST API v2.1, and Unity Catalog",
            "keywords": "Databricks Python, DABs, dbutils, Volumes, Secrets, REST API, Unity Catalog RBAC, CI/CD",
            "toc": [
                [1, "Python in Databricks SDK, CLI & DABs Suite", 1],
                [2, "Page 1: Databricks Asset Bundles (DABs) & dbutils Operations", 1],
                [3, "Databricks Asset Bundles (DABs) Declarative CI/CD Specs", 1],
                [3, "dbutils Filesystem & Unity Catalog Volume Operations", 1],
                [3, "Secure Multi-Cloud Secrets Retrieval (KeyVault & AWS KMS)", 1],
                [3, "Databricks CLI v0.200+ Authentication & Profile Switching", 1],
                [3, "Delta Live Tables (DLT) Python Declarative Pipelines", 1],
                [3, "Python SDK Workspace Client Initialization & Operations", 1],
                [2, "Page 2: Workspace REST API v2.1 Clients & Unity Catalog RBAC", 2],
                [3, "Workspace REST API v2.1 Programmatic Execution", 2],
                [3, "Programmatic Unity Catalog Permissions & Grants", 2],
                [3, "Databricks Repos & Git Provider Automation", 2],
                [3, "Cluster Policy Enforcement via Python SDK", 2],
                [3, "Model Serving & MLflow Registry Integrations", 2],
                [3, "Serverless Compute API & Job Run Triggers", 2],
            ]
        },
        {
            "filename": "databricks_master_cheatsheet.pdf",
            "title": "Databricks Unified Architecture & Coding Suite (Master Edition)",
            "subject": "Complete 48-Card Databricks Master Suite: Spark SQL, PySpark, Spark Core, and Python SDK",
            "keywords": "Databricks Master, Spark SQL, PySpark, Spark Core, Python SDK, Unity Catalog, Liquid Clustering, AQE",
            "toc": [
                [1, "Databricks Unified Architecture & Coding Suite (Master Edition)", 1],
                [2, "Domain 1: Spark SQL Architecture & Query Suite", 1],
                [3, "Page 1: Lakehouse Foundation, DDL & Window Mechanics", 1],
                [3, "Page 2: Advanced MERGE INTO, Deletion Vectors & AQE", 2],
                [2, "Domain 2: PySpark Architecture & Engine Suite", 3],
                [3, "Page 3: Distributed DataFrame APIs & Broadcast Joins", 3],
                [3, "Page 4: Stateful Structured Streaming & Arrow UDFs", 4],
                [2, "Domain 3: Spark Core Internals & JVM Tuning Suite", 5],
                [3, "Page 5: JVM Memory Pool Sizing & G1GC Flags", 5],
                [3, "Page 6: Shuffle Spill Elimination & Task Schedulers", 6],
                [2, "Domain 4: Python in Databricks Automation Suite", 7],
                [3, "Page 7: Databricks Asset Bundles (DABs) & dbutils", 7],
                [3, "Page 8: Workspace REST API v2.1 & Unity Catalog RBAC", 8],
            ]
        },
        {
            "filename": "incident_runbooks.pdf",
            "title": "Data Engineering Production Incident Runbooks (Master Reference)",
            "subject": "Comprehensive 39-Page A4 Reference: 76 Emergency Production Incident Triage Runbooks",
            "keywords": "Incident Runbooks, Data Engineering, Spark OOM, Exit Code 137, Airflow Triage, dbt Testing, Iceberg, Delta Lake",
            "toc": [
                [1, "Data Engineering Production Incident Runbooks (Master Reference)", 1],
                [2, "Page 1: Runbooks Overview & High-Impact Index", 1],
                [2, "Page 2: Surgical DataFrame Persistence & Cache Eviction", 2],
                [2, "Page 3: Lineage Truncation via Checkpoint & Cut-Off", 3],
                [2, "Page 4: Low-Overhead Custom Accumulators for Auditing", 4],
                [2, "Page 5: Kryo Serialization & Primitive Memory Layout", 5],
                [2, "Page 6: Join Tuning: BHJ, Bucketing & AQE Dynamic Switch", 6],
                [2, "Page 7: Key Salting & Two-Phase Skew Stage Elimination", 7],
                [2, "Page 8: Triage & Elimination of Tungsten Shuffle Spill", 8],
                [2, "Page 9: Bypassing the 64KB JVM Bytecode Method Limit", 9],
                [2, "Page 10: Separation of Concerns: Airflow Orchestration & dbt", 10],
                [2, "Page 11: Airflow Zombie Task Detection & Heartbeat Recovery", 11],
                [2, "Page 12: Bulletproof Idempotent Backfills & Partition Cleansing", 12],
                [2, "Page 13: Airflow DB Connection Pool Starvation Triage", 13],
                [2, "Page 14: Fail-Fast Observability & Exponential System Retries", 14],
                [2, "Page 15: SQL Triage: CPU-Bound vs Wait-Bottlenecks", 15],
                [2, "Page 16: Triaging Exit Code 137: OOMKilled vs JVM Heap Limit", 16],
                [2, "Page 17: JVM G1GC Pause Tuning for 32GB+ Heap Nodes", 17],
                [2, "Page 18: Kafka Consumer Lag & Rebalance Storm Triage", 18],
                [2, "Page 19: OpenTelemetry Distributed Tracing in PySpark", 19],
                [2, "Page 20: Safe VACUUM Operations: Dry-Runs & Retention Checks", 20],
                [2, "Page 21: Apache Iceberg: Copy-On-Write vs Merge-On-Read Tradeoffs", 21],
                [2, "Page 22: Eliminating T-SQL Parameter Sniffing Regressions", 22],
                [2, "Page 23: Bloom Filter Indexes for High-Speed Lookups", 23],
                [2, "Page 24: dbt Automated Data Integrity Gates & Fail-Fast Tests", 24],
                [2, "Page 25: Spot Instance Graceful Node Decommissioning", 25],
                [2, "Page 26: Runtime Data Contracts & Schema Quarantine (DLQ)", 26],
                [2, "Page 27: Stateful Idempotent MERGE with Watermarking", 27],
                [2, "Page 28: Zero-Downtime Schema Migration with gh-ost", 28],
                [2, "Page 29: Read-After-Write Consistency with GTID Tracking", 29],
                [2, "Page 30: Database Connection Pool Thrashing & Storms", 30],
                [2, "Page 31: Eliminate DynamoDB Hot Partitions via Key Salting", 31],
                [2, "Page 32: LSM Compaction Backlog & Write-Stall Recovery", 32],
                [2, "Page 33: Fabric Direct Lake Mode Fallback Troubleshooting", 33],
                [2, "Page 34: Delta Lake & Iceberg VACUUM Compaction Regressions", 34],
                [2, "Page 35: Lakehouse Small File Compaction & S3/ADLS Throttling", 35],
                [2, "Page 36: Snowflake Parquet Semi-Structured Loading Optimization", 36],
                [2, "Page 37: Microsoft Fabric & Purview Native Governance", 37],
                [2, "Page 38: Triage: Executor Container Killed (Exit Code 137)", 38],
                [2, "Page 39: Triage: Delta Lake Small File Metadata Degradation", 39],
            ]
        },
        {
            "filename": "lakehouse_enterprise_master_reference.pdf",
            "title": "Complete Lakehouse Architecture & Runbooks Enterprise Reference (All-in-One Master)",
            "subject": "Comprehensive 47-Page All-in-One Enterprise Handbook: 48 Architecture Coding Cards and 76 Incident Runbooks",
            "keywords": "Lakehouse Master, Enterprise Handbook, Spark SQL, PySpark, Spark Core, Python SDK, Incident Runbooks, Databricks",
            "toc": [
                [1, "Lakehouse Enterprise Master Reference: Architecture, Coding & Runbooks", 1],
                [2, "Part 1: Databricks Unified Architecture & Coding Suite", 1],
                [3, "Section 1: Spark SQL Architecture & Query Suite", 1],
                [4, "Page 1: Lakehouse Foundation, DDL & Window Mechanics", 1],
                [4, "Page 2: Advanced MERGE INTO, Deletion Vectors & AQE", 2],
                [3, "Section 2: PySpark Distributed Execution Suite", 3],
                [4, "Page 3: Distributed DataFrame APIs & Broadcast Joins", 3],
                [4, "Page 4: Stateful Structured Streaming & Arrow UDFs", 4],
                [3, "Section 3: Spark Core Internals & JVM Tuning", 5],
                [4, "Page 5: JVM Memory Pool Sizing & G1GC Flags", 5],
                [4, "Page 6: Shuffle Spill Elimination & Task Schedulers", 6],
                [3, "Section 4: Python in Databricks Automation", 7],
                [4, "Page 7: Databricks Asset Bundles (DABs) & dbutils", 7],
                [4, "Page 8: Workspace REST API v2.1 & Unity Catalog RBAC", 8],
                [2, "Part 2: Production Incident Triage Runbooks (76 Playbooks)", 9],
                [3, "Page 9: Architecture & Runbooks Overview Index", 9],
                [3, "Page 10: Surgical DataFrame Persistence & Cache Eviction", 10],
                [3, "Page 11: Lineage Truncation via Checkpoint & Cut-Off", 11],
                [3, "Page 12: Low-Overhead Custom Accumulators for Auditing", 12],
                [3, "Page 13: Kryo Serialization & Primitive Memory Layout", 13],
                [3, "Page 14: Join Tuning: BHJ, Bucketing & AQE Dynamic Switch", 14],
                [3, "Page 15: Key Salting & Two-Phase Skew Stage Elimination", 15],
                [3, "Page 16: Triage & Elimination of Tungsten Shuffle Spill", 16],
                [3, "Page 17: Bypassing the 64KB JVM Bytecode Method Limit", 17],
                [3, "Page 18: Separation of Concerns: Airflow Orchestration & dbt", 18],
                [3, "Page 19: Airflow Zombie Task Detection & Heartbeat Recovery", 19],
                [3, "Page 20: Bulletproof Idempotent Backfills & Partition Cleansing", 20],
                [3, "Page 21: Airflow DB Connection Pool Starvation Triage", 21],
                [3, "Page 22: Fail-Fast Observability & Exponential System Retries", 22],
                [3, "Page 23: SQL Triage: CPU-Bound vs Wait-Bottlenecks", 23],
                [3, "Page 24: Triaging Exit Code 137: OOMKilled vs JVM Heap Limit", 24],
                [3, "Page 25: JVM G1GC Pause Tuning for 32GB+ Heap Nodes", 25],
                [3, "Page 26: Kafka Consumer Lag & Rebalance Storm Triage", 26],
                [3, "Page 27: OpenTelemetry Distributed Tracing in PySpark", 27],
                [3, "Page 28: Safe VACUUM Operations: Dry-Runs & Retention Checks", 28],
                [3, "Page 29: Apache Iceberg: Copy-On-Write vs Merge-On-Read Tradeoffs", 29],
                [3, "Page 30: Eliminating T-SQL Parameter Sniffing Regressions", 30],
                [3, "Page 31: Bloom Filter Indexes for High-Speed Lookups", 31],
                [3, "Page 32: dbt Automated Data Integrity Gates & Fail-Fast Tests", 32],
                [3, "Page 33: Spot Instance Graceful Node Decommissioning", 33],
                [3, "Page 34: Runtime Data Contracts & Schema Quarantine (DLQ)", 34],
                [3, "Page 35: Stateful Idempotent MERGE with Watermarking", 35],
                [3, "Page 36: Zero-Downtime Schema Migration with gh-ost", 36],
                [3, "Page 37: Read-After-Write Consistency with GTID Tracking", 37],
                [3, "Page 38: Database Connection Pool Thrashing & Storms", 38],
                [3, "Page 39: Eliminate DynamoDB Hot Partitions via Key Salting", 39],
                [3, "Page 40: LSM Compaction Backlog & Write-Stall Recovery", 40],
                [3, "Page 41: Fabric Direct Lake Mode Fallback Troubleshooting", 41],
                [3, "Page 42: Delta Lake & Iceberg VACUUM Compaction Regressions", 42],
                [3, "Page 43: Lakehouse Small File Compaction & S3/ADLS Throttling", 43],
                [3, "Page 44: Snowflake Parquet Semi-Structured Loading Optimization", 44],
                [3, "Page 45: Microsoft Fabric & Purview Native Governance", 45],
                [3, "Page 46: Triage: Executor Container Killed (Exit Code 137)", 46],
                [3, "Page 47: Triage: Delta Lake Small File Metadata Degradation", 47],
            ]
        }
    ]

    for item in existing_enrichments:
        pdf_path = os.path.join(PDF_DIR, item["filename"])
        if os.path.exists(pdf_path):
            meta = {
                "title": item["title"],
                "author": "Santosh Jammi | Principal Data Architect",
                "subject": item["subject"],
                "keywords": item["keywords"],
                "creator": "Modern Data Engineer Reference Publishing Engine",
                "producer": "Headless Chrome / PyMuPDF High-Density Publishing Engine"
            }
            inject_bookmarks_and_metadata(pdf_path, item["toc"], meta)

    # 3. Synchronize All Outputs to Target Locations
    print("\n" + "=" * 75)
    print("SYNCHRONIZING PUBLISHED ASSETS ACROSS REPOSITORY MIRRORS")
    print("=" * 75)

    sync_targets = [
        os.path.join(WORKSPACE_DIR, "public", "_artifacts", "cheat-sheets"),
        os.path.join(WORKSPACE_DIR, ".build-artifacts", "r2", "cheat-sheets"),
    ]
    for target in sync_targets:
        try:
            os.makedirs(os.path.join(target, "pdf"), exist_ok=True)
            os.makedirs(os.path.join(target, "html"), exist_ok=True)
            os.makedirs(os.path.join(target, "images"), exist_ok=True)
            for f in os.listdir(PDF_DIR):
                shutil.copy2(os.path.join(PDF_DIR, f), os.path.join(target, "pdf", f))
            for f in os.listdir(HTML_DIR):
                shutil.copy2(os.path.join(HTML_DIR, f), os.path.join(target, "html", f))
            for f in os.listdir(IMG_DIR):
                shutil.copy2(os.path.join(IMG_DIR, f), os.path.join(target, "images", f))
            print(f"  ✓ Synchronized assets to: {target}")
        except Exception as e:
            print(f"  ⚠️ Warning syncing to {target}: {e}")

    # 4. Final Comprehensive Validation
    print("\n" + "=" * 75)
    print("FINAL 10-DOCUMENT COMPREHENSIVE VECTOR & TOC AUDIT")
    print("=" * 75)
    all_pdfs = sorted([f for f in os.listdir(PDF_DIR) if f.endswith(".pdf")])
    for f in all_pdfs:
        full_p = os.path.join(PDF_DIR, f)
        doc = fitz.open(full_p)
        toc_len = len(doc.get_toc())
        title = doc.metadata.get("title", "UNKNOWN")
        p1_chars = len(doc[0].get_text()) if doc.page_count > 0 else 0
        size_kb = os.path.getsize(full_p) / 1024
        print(f"  • {f:52} | {doc.page_count:2d} p | {toc_len:2d} TOC entries | {size_kb:6.1f} KB | {p1_chars:4d} text chars | {title[:32]}")
        assert toc_len > 0, f"Error: {f} has no TOC entries!"
        assert p1_chars > 500, f"Error: {f} has empty or non-selectable text!"
        doc.close()

    print("\n" + "=" * 75)
    print("ALL 10 PDF REFERENCE DOCUMENTS GENERATED, ENRICHED & VERIFIED (EXIT 0)")
    print("=" * 75)

if __name__ == "__main__":
    main()
