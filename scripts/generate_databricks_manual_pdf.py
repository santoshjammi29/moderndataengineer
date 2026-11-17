#!/usr/bin/env python3
"""
Databricks Data Intelligence Platform: End-to-End Technical Manual PDF Generator
Compiles the authoritative 20-page A4 manual with:
  - Pixel-perfect enterprise typography and layout (Level 100 - Level 400)
  - Hierarchical PDF bookmarks (TOC outline)
  - Full document metadata
  - High-res cover thumbnails and preview posters
  - Automatic synchronization across repository mirrors and public directories

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
DOCS_PDF_DIR = os.path.join(WORKSPACE_DIR, "docs", "pdf")

os.makedirs(HTML_DIR, exist_ok=True)
os.makedirs(PDF_DIR, exist_ok=True)
os.makedirs(IMG_DIR, exist_ok=True)
os.makedirs(DOCS_PDF_DIR, exist_ok=True)

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

CSS_STYLES = """
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

@page {
  size: A4 portrait;
  margin: 0;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background: #ffffff;
  color: #1e293b;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 8.8pt;
  line-height: 1.45;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.page {
  width: 210mm;
  height: 297mm;
  max-height: 297mm;
  padding: 14mm 16mm 14mm 16mm;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  page-break-after: always;
  overflow: hidden;
  position: relative;
}

/* Header & Titles */
.doc-eyebrow {
  font-size: 8pt;
  font-weight: 800;
  letter-spacing: 0.8px;
  color: #b91c1c;
  text-transform: uppercase;
  margin-bottom: 5px;
}

.doc-title {
  font-size: 19pt;
  font-weight: 800;
  line-height: 1.2;
  color: #0f172a;
  letter-spacing: -0.4px;
  margin-bottom: 5px;
}

.doc-subtitle {
  font-size: 9.5pt;
  font-weight: 500;
  color: #475569;
  line-height: 1.35;
  margin-bottom: 12px;
}

.title-divider {
  height: 3px;
  background: #991b1b;
  margin-bottom: 14px;
}

/* Module Section Header */
.module-header {
  font-size: 12.5pt;
  font-weight: 800;
  color: #991b1b;
  border-bottom: 1.5px solid #cbd5e1;
  padding-bottom: 4px;
  margin-top: 14px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.module-header:first-child {
  margin-top: 0;
}

.section-title {
  font-size: 10.5pt;
  font-weight: 700;
  color: #0f172a;
  margin-top: 10px;
  margin-bottom: 5px;
}

/* Callouts */
.callout-box {
  background: #fef2f2;
  border-left: 4px solid #b91c1c;
  border-top: 1px solid #fee2e2;
  border-right: 1px solid #fee2e2;
  border-bottom: 1px solid #fee2e2;
  border-radius: 4px;
  padding: 8px 12px;
  margin-bottom: 12px;
  font-size: 8.5pt;
  color: #334155;
  line-height: 1.4;
}

.callout-box strong {
  color: #991b1b;
  font-weight: 700;
}

/* Prose and Lists */
p {
  margin-bottom: 7px;
  color: #334155;
  text-align: justify;
}

ul {
  margin-left: 14px;
  margin-bottom: 8px;
}

li {
  margin-bottom: 4.5px;
  color: #334155;
  line-height: 1.4;
}

li strong {
  color: #0f172a;
}

/* Tables */
table.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 8.2pt;
  margin: 9px 0 12px 0;
}

table.data-table th {
  background: #0f172a;
  color: #ffffff;
  font-weight: 700;
  text-align: left;
  padding: 6px 9px;
  font-size: 8pt;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  border: 1px solid #0f172a;
}

table.data-table td {
  padding: 5.5px 9px;
  border: 1px solid #cbd5e1;
  color: #334155;
  vertical-align: top;
  line-height: 1.35;
}

table.data-table tr:nth-child(even) td {
  background: #f8fafc;
}

table.data-table tr td:first-child {
  font-weight: 600;
  color: #0f172a;
}

/* Code Snippets */
.code-container {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-left: 3.5px solid #b91c1c;
  border-radius: 4px;
  padding: 8px 11px;
  margin: 9px 0 11px 0;
  font-family: 'JetBrains Mono', Consolas, Monaco, monospace;
  font-size: 7.6pt;
  line-height: 1.38;
  color: #0f172a;
  white-space: pre-wrap;
  word-break: break-word;
  overflow: hidden;
}

code.inline-code {
  font-family: 'JetBrains Mono', Consolas, Monaco, monospace;
  font-size: 8pt;
  background: #f1f5f9;
  color: #0f172a;
  padding: 1px 4px;
  border-radius: 3px;
  border: 1px solid #e2e8f0;
}

/* Page Footer */
.page-footer {
  border-top: 1px solid #cbd5e1;
  padding-top: 5px;
  font-size: 7.2pt;
  color: #64748b;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.page-content {
  flex: 1;
}
"""

def generate_html():
    html_tmpl = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Databricks Data Intelligence Platform: End-to-End Technical Manual</title>
  <style>{{CSS_STYLES}}</style>
</head>
<body>

  <!-- ==================== PAGE 1 ==================== -->
  <div class="page">
    <div class="page-content">
      <div class="doc-eyebrow">ENTERPRISE ARCHITECTURE &amp; ENGINEERING REFERENCE</div>
      <h1 class="doc-title">Databricks Data Intelligence Platform: End-to-End Technical Manual</h1>
      <div class="doc-subtitle">Structured Progression from Foundational Concepts (Level 100) to Principal Production Architecture (Level 400)</div>
      <div class="title-divider"></div>

      <div class="callout-box">
        <strong>Document Curriculum Overview:</strong> This technical manual provides a complete architectural and implementation reference for the Databricks Lakehouse Platform. It is organized sequentially across four mastery tiers: <strong>Level 100 (Foundational Architecture)</strong>, <strong>Level 200 (Delta Lake Internals &amp; Medallion Engineering)</strong>, <strong>Level 300 (Unity Catalog Governance, Catalyst &amp; Photon Internals)</strong>, and <strong>Level 400 (Metadata Frameworks, Stateful Streaming, CI/CD Asset Bundles, FinOps &amp; Mosaic AI)</strong>.
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 16%;">Tier</th>
            <th style="width: 28%;">Core Domain</th>
            <th style="width: 56%;">Key Technical Capabilities Covered</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Level 100</strong><br><span style="font-weight:400; color:#64748b;">Foundational</span></td>
            <td>Platform Architecture &amp; Compute</td>
            <td>Control Plane vs. Classic/Serverless Compute Planes, ADLS Gen2/S3 integration, Cluster modes, DBUs, Workspace organization.</td>
          </tr>
          <tr>
            <td><strong>Level 200</strong><br><span style="font-weight:400; color:#64748b;">Intermediate</span></td>
            <td>Delta Lake Storage &amp; Medallion ETL</td>
            <td><code class="inline-code">_delta_log</code> ACID internals, Deletion Vectors, Liquid Clustering, Predictive Optimization, Auto Loader, Change Data Feed, Declarative Pipelines (DLT).</td>
          </tr>
          <tr>
            <td><strong>Level 300</strong><br><span style="font-weight:400; color:#64748b;">Advanced</span></td>
            <td>Unity Catalog Governance &amp; Spark/Photon Engine</td>
            <td>3-level namespace, Row Filters, Column Masks, Lakehouse Federation, Catalyst AQE, Photon C++ vectorization, Spark UI 5 S's diagnostics.</td>
          </tr>
          <tr>
            <td><strong>Level 400</strong><br><span style="font-weight:400; color:#64748b;">Expert / Principal</span></td>
            <td>Frameworks, DevOps, Streaming, FinOps &amp; AI</td>
            <td>Metadata-driven PySpark/DLT frameworks, RocksDB stateful streaming, Databricks Asset Bundles (DABs), pytest/chispa, System Tables FinOps, Mosaic AI RAG.</td>
          </tr>
        </tbody>
      </table>

      <div class="module-header">Module 1 (Level 100): Platform Architecture &amp; Core Concepts</div>
      <div class="section-title">1.1 Split-Plane Cloud Architecture</div>
      <p>
        The Databricks Data Intelligence Platform is engineered on a split-plane security model that separates orchestration and metadata management from raw compute execution and persistent customer storage. This separation ensures that proprietary enterprise data remains governed within customer storage accounts while automating infrastructure lifecycle tasks.
      </p>
      <ul>
        <li><strong>Control Plane (Databricks-Managed):</strong> Hosted in the Databricks cloud subscription. It runs the Workspace Web UI, Notebook command orchestration, Lakeflow Jobs scheduler, Cluster Manager, and the Unity Catalog Metastore service. Notebook code and query metadata are encrypted at rest and in transit.</li>
        <li><strong>Compute Plane (Classic vs. Serverless):</strong> The execution environment where Apache Spark, Photon, and Python processes transform data. Customers deploy workloads on either customer-hosted virtual networks (Classic) or Databricks-managed elastic compute pools (Serverless).</li>
      </ul>
    </div>
    <div class="page-footer">
      <span>Databricks End-to-End Technical Reference Manual (Level 100 – Level 400)</span>
      <span>Page 1 of 20</span>
    </div>
  </div>

  <!-- ==================== PAGE 2 ==================== -->
  <div class="page">
    <div class="page-content">
      <ul>
        <li><strong>Cloud Storage Layer (Customer-Owned):</strong> Persistent data resides in cloud object storage such as Azure Data Lake Storage Gen2 (ADLS Gen2), AWS S3, or Google Cloud Storage. Compute resources authenticate to object storage via Unity Catalog Storage Credentials (using Cloud Managed Identities or IAM Roles) rather than legacy DBFS root mounts or static storage keys.</li>
      </ul>

      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 25%;">Architectural Dimension</th>
            <th style="width: 37%;">Classic Compute Plane</th>
            <th style="width: 38%;">Serverless Compute Plane</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Hosting Boundary</td>
            <td>Customer cloud account (Azure VNet / AWS VPC)</td>
            <td>Databricks-managed cloud subscription</td>
          </tr>
          <tr>
            <td>Provisioning Latency</td>
            <td>3 to 7 minutes (VM allocation and OS boot)</td>
            <td>2 to 6 seconds (pre-warmed container pools)</td>
          </tr>
          <tr>
            <td>Networking &amp; Security</td>
            <td>Customer manages VNet injection, NSGs, NAT, and subnets</td>
            <td>Databricks manages network isolation + Private Link to storage</td>
          </tr>
          <tr>
            <td>Autoscaling Mechanics</td>
            <td>VM-level horizontal scaling based on task queue backlog</td>
            <td>Sub-second workload-aware horizontal and vertical elasticity</td>
          </tr>
          <tr>
            <td>Operations &amp; Upgrades</td>
            <td>Manual Databricks Runtime (DBR) version selection &amp; tuning</td>
            <td>Fully versionless; automatic patching and runtime upgrades</td>
          </tr>
        </tbody>
      </table>

      <div class="section-title">1.2 Compute Resource Taxonomy &amp; DBU Economics</div>
      <p>
        Selecting the appropriate compute type directly governs cloud infrastructure cost and workload isolation. Databricks bills platform usage in Databricks Units (DBUs), normalized units of processing capability per hour.
      </p>
      <ul>
        <li><strong>All-Purpose Compute (Interactive):</strong> Designed for collaborative ad-hoc data exploration, interactive notebook development, and debugging. Can be shared across multiple users via Unity Catalog Shared Access Mode. Carries a higher DBU rate (approximately 2x to 3x higher than Job Compute) and should never run scheduled production pipelines.</li>
        <li><strong>Job Compute (Automated):</strong> Ephemeral clusters provisioned automatically when a scheduled Lakeflow Job starts and terminated immediately upon task completion. Carries a lower DBU rate optimized for production ETL batch and streaming jobs.</li>
        <li><strong>SQL Warehouses (Serverless / Pro):</strong> Elastic compute clusters specifically tuned for high-concurrency ANSI SQL queries, BI dashboards (Power BI, Tableau), and ad-hoc analytics using the Photon engine and Intelligent Workload Management (IWM).</li>
        <li><strong>Lakeflow Declarative Pipeline Compute:</strong> Managed compute clusters dedicated to running declarative streaming tables and materialized views with enhanced autoscaling.</li>
      </ul>

      <div class="module-header">Module 2 (Level 200): Delta Lake Storage Internals &amp; Optimization</div>
      <div class="section-title">2.1 The ACID Transaction Log (_delta_log)</div>
      <p>
        Delta Lake layers ACID transactional guarantees, scalable metadata handling, and schema enforcement directly atop immutable Apache Parquet files. Every Delta table contains a <code class="inline-code">_delta_log</code> subdirectory that acts as the single source of truth for table state.
      </p>
    </div>
    <div class="page-footer">
      <span>Databricks End-to-End Technical Reference Manual (Level 100 – Level 400)</span>
      <span>Page 2 of 20</span>
    </div>
  </div>

  <!-- ==================== PAGE 3 ==================== -->
  <div class="page">
    <div class="page-content">
      <ul>
        <li><strong>Atomic JSON Commit Files (<code class="inline-code">000000.json</code>):</strong> Every transaction writes a sequential JSON file recording discrete state actions: <code class="inline-code">add</code> (new Parquet data file added with min/max column statistics), <code class="inline-code">remove</code> (logical tombstone marking an existing file invalid), <code class="inline-code">metaData</code> (schema or table property modification), and <code class="inline-code">protocol</code> (minimum reader/writer version requirements).</li>
        <li><strong>Compacted Checkpoints (<code class="inline-code">.checkpoint.parquet</code>):</strong> Every N commits (or based on transaction volume), Delta aggregates all active state actions up to that point into a columnar Parquet checkpoint file. When a reader queries the table, the Spark driver reads the latest checkpoint plus any subsequent tail JSON files, avoiding slow object-storage directory listings.</li>
        <li><strong>Optimistic Concurrency Control (OCC):</strong> Multiple writers operate concurrently against a table snapshot. At commit time, Delta checks if another transaction committed conflicting changes to the same physical files or rows. With Row-Level Concurrency enabled, two concurrent <code class="inline-code">UPDATE</code> or <code class="inline-code">MERGE</code> statements modifying distinct rows within the exact same Parquet file succeed without raising a <code class="inline-code">ConcurrentModificationException</code>.</li>
      </ul>

      <div class="section-title">2.2 Deletion Vectors (Merge-on-Read vs. Copy-on-Write)</div>
      <p>
        Historically, Delta Lake relied exclusively on Copy-on-Write (CoW): deleting or updating a single row inside a 512 MB Parquet file required reading the entire file and writing a brand-new 512 MB Parquet file excluding the modified row. Deletion Vectors (DVs) shift DML execution to <strong>Merge-on-Read (MoR)</strong>:
      </p>
      <ul>
        <li><strong>Fast Write Path:</strong> When <code class="inline-code">DELETE</code>, <code class="inline-code">UPDATE</code>, or <code class="inline-code">MERGE</code> executes, the existing Parquet file remains untouched. Delta writes a compact roaring bitmap (the deletion vector) to storage recording the physical row indices that were invalidated, plus a small Parquet file containing only newly updated rows.</li>
        <li><strong>Read Path:</strong> Downstream readers automatically load the deletion vector bitmap and skip invalidated row offsets in memory during scan execution.</li>
        <li><strong>Physical Compaction:</strong> Invalidated rows are physically purged and rewritten asynchronously when <code class="inline-code">OPTIMIZE</code> or <code class="inline-code">REORG TABLE ... APPLY (PURGE)</code> runs.</li>
      </ul>

      <div class="section-title">2.3 Liquid Clustering vs. Hive Partitioning &amp; Z-Ordering</div>
      <p>
        Traditional Hive-style directory partitioning (<code class="inline-code">PARTITIONED BY</code>) physically separates files into folder hierarchies. Partitioning on high-cardinality columns (such as <code class="inline-code">customer_id</code> or <code class="inline-code">timestamp</code>) creates millions of tiny files (the "small file problem"), while changing partition keys requires rewriting the entire table. <strong>Liquid Clustering</strong> replaces both Hive partitioning and <code class="inline-code">ZORDER BY</code> using incremental Hilbert-curve space-filling algorithms.
      </p>

      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 22%;">Feature</th>
            <th style="width: 26%;">Hive Partitioning</th>
            <th style="width: 26%;">Z-Ordering</th>
            <th style="width: 26%;">Liquid Clustering</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Physical Layout</td>
            <td>Rigid directory folders (<code class="inline-code">col=val/</code>)</td>
            <td>Co-located multi-dimensional sorting within files</td>
            <td>Hilbert curve ZCubes managed in metadata</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="page-footer">
      <span>Databricks End-to-End Technical Reference Manual (Level 100 – Level 400)</span>
      <span>Page 3 of 20</span>
    </div>
  </div>

  <!-- ==================== PAGE 4 ==================== -->
  <div class="page">
    <div class="page-content">
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 22%;">Feature</th>
            <th style="width: 26%;">Hive Partitioning</th>
            <th style="width: 26%;">Z-Ordering</th>
            <th style="width: 26%;">Liquid Clustering</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Key Redefinition</td>
            <td>Requires full table rewrite</td>
            <td>Re-sorts all files on next full <code class="inline-code">OPTIMIZE</code></td>
            <td>Instant metadata change via <code class="inline-code">ALTER TABLE</code></td>
          </tr>
          <tr>
            <td>Compaction Cost</td>
            <td>Per-partition compaction</td>
            <td>Idempotent only within partitions; costly on full tables</td>
            <td>Fully incremental; clusters only new unclustered data</td>
          </tr>
          <tr>
            <td>Skew Resilience</td>
            <td>Poor (uneven partition sizes)</td>
            <td>Moderate</td>
            <td>High (automatically balances file sizes to 256MB–1GB)</td>
          </tr>
        </tbody>
      </table>

      <div class="code-container">-- Production DDL with Liquid Clustering, Deletion Vectors, and Change Data Feed
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
ALTER TABLE prod_catalog.silver.orders CLUSTER BY (order_ts, order_status);</div>

      <div class="section-title">2.4 Predictive Optimization, VACUUM &amp; Delta UniForm</div>
      <ul>
        <li><strong>OPTIMIZE (Bin-Packing &amp; Clustering):</strong> Coalesces small Parquet files into optimal target sizes (256 MB to 1 GB) and applies Liquid Clustering layouts so readers benefit from file-skipping statistics.</li>
        <li><strong>VACUUM (Garbage Collection):</strong> Physically deletes unreferenced Parquet files and obsolete deletion vectors older than the retention threshold (default 7 days / 168 hours) from object storage.</li>
        <li><strong>Predictive Optimization:</strong> On Unity Catalog managed tables, Databricks monitors query patterns and write frequency, automatically executing background serverless <code class="inline-code">OPTIMIZE</code>, <code class="inline-code">VACUUM</code>, and <code class="inline-code">ANALYZE</code> (column statistics collection) when cost-effective.</li>
        <li><strong>Delta UniForm (Universal Format):</strong> Automatically generates Apache Iceberg and Apache Hudi metadata manifests asynchronously alongside <code class="inline-code">_delta_log</code> commits, allowing external engines (Snowflake, BigQuery, Trino) to read Delta tables without copying data.</li>
      </ul>
    </div>
    <div class="page-footer">
      <span>Databricks End-to-End Technical Reference Manual (Level 100 – Level 400)</span>
      <span>Page 4 of 20</span>
    </div>
  </div>

  <!-- ==================== PAGE 5 ==================== -->
  <div class="page">
    <div class="page-content">
      <div class="module-header">Module 3 (Level 200–300): Data Engineering &amp; Medallion Pipelines</div>
      <div class="section-title">3.1 The Medallion Lakehouse Architecture</div>
      <p>
        Enterprise pipelines organize data transformations across three logical quality layers to guarantee auditability, replayability, and downstream query performance:
      </p>
      <ul>
        <li><strong>1. Bronze Layer (Raw Ingestion &amp; Historical Archive):</strong> Stores raw source payloads in their native structure using append-only semantics. Enriches rows with technical audit columns (<code class="inline-code">_metadata.file_path</code>, <code class="inline-code">_metadata.file_modification_time</code>, <code class="inline-code">_ingest_ts</code>). Avoids destructive business filtering so downstream tables can be replayed from scratch if transformation logic changes.</li>
        <li><strong>2. Silver Layer (Filtered, Cleansed &amp; Conformed):</strong> Enforces strict schema contracts, deduplicates records, handles corrupt/null payloads, standardizes timestamps and data types, and executes Slowly Changing Dimension (SCD Type 1 overwrites or SCD Type 2 historical tracking) merges. Serves as the single source of truth for enterprise entities.</li>
        <li><strong>3. Gold Layer (Business Aggregates &amp; Star Schemas):</strong> Models dimensional star schemas (Fact and Dimension tables) and pre-aggregated domain metrics optimized for low-latency BI dashboards and machine learning feature extraction.</li>
      </ul>

      <div class="section-title">3.2 Incremental File Ingestion with Auto Loader (cloudFiles)</div>
      <p>
        Auto Loader ingests new files arriving in cloud storage incrementally and idempotently using Spark Structured Streaming. It eliminates expensive cloud storage <code class="inline-code">LIST</code> operations and handles schema drift automatically:
      </p>
      <ul>
        <li><strong>File Discovery Modes:</strong> Uses optimized incremental lexical Directory Listing by default, or File Notification Mode (which automatically provisions cloud event subscriptions such as Azure Event Grid + Storage Queues or AWS SNS/SQS) to scale to millions of files per hour.</li>
        <li><strong>Schema Inference, Evolution &amp; Rescued Data:</strong> Stores inferred schemas in <code class="inline-code">cloudFiles.schemaLocation</code>. When new columns appear upstream, <code class="inline-code">addNewColumns</code> evolves the target Delta table schema automatically and restarts the stream, while unexpected data types or unmapped fields are preserved safely in a JSON <code class="inline-code">_rescued_data</code> column.</li>
        <li><strong>RocksDB State Management:</strong> Tracks exact ingested filenames in a checkpointed RocksDB state store to guarantee exactly-once processing.</li>
      </ul>
    </div>
    <div class="page-footer">
      <span>Databricks End-to-End Technical Reference Manual (Level 100 – Level 400)</span>
      <span>Page 5 of 20</span>
    </div>
  </div>

  <!-- ==================== PAGE 6 ==================== -->
  <div class="page">
    <div class="page-content">
      <div class="code-container">from pyspark.sql import functions as F

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
)</div>

      <div class="section-title">3.3 Change Data Capture (CDC) &amp; Delta Change Data Feed (CDF)</div>
      <p>
        When <code class="inline-code">delta.enableChangeDataFeed = true</code> is enabled on a Delta table, Databricks records row-level change events across all <code class="inline-code">INSERT</code>, <code class="inline-code">UPDATE</code>, and <code class="inline-code">DELETE</code> operations. Reading the table with <code class="inline-code">.option("readChangeFeed", "true")</code> exposes three additional metadata columns: <code class="inline-code">_change_type</code> (<code class="inline-code">insert</code>, <code class="inline-code">update_preimage</code>, <code class="inline-code">update_postimage</code>, <code class="inline-code">delete</code>), <code class="inline-code">_commit_version</code>, and <code class="inline-code">_commit_timestamp</code>.
      </p>
      <p>
        When propagating changes into a downstream Silver or Gold table via <code class="inline-code">foreachBatch</code> and <code class="inline-code">MERGE INTO</code>, a single micro-batch may contain multiple updates for the same primary key (which causes <code class="inline-code">MERGE</code> to fail with an ambiguous match error unless deduplicated first). The production pattern below deduplicates each micro-batch using a Window function ordered by <code class="inline-code">_commit_version DESC</code> before executing the merge:
      </p>
    </div>
    <div class="page-footer">
      <span>Databricks End-to-End Technical Reference Manual (Level 100 – Level 400)</span>
      <span>Page 6 of 20</span>
    </div>
  </div>

  <!-- ==================== PAGE 7 ==================== -->
  <div class="page">
    <div class="page-content">
      <div class="code-container">from delta.tables import DeltaTable
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

    # 1. Exclude pre-update images and retain only the latest state per key in the batch
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
            set={
                "customer_name": "s.customer_name",
                "tier": "s.tier",
                "updated_at": "s.updated_at"
            }
        )
        .whenNotMatchedInsert(
            condition="s._change_type != 'delete'",
            values={
                "customer_id": "s.customer_id",
                "customer_name": "s.customer_name",
                "tier": "s.tier",
                "updated_at": "s.updated_at"
            }
        )
        .execute()
    )

(
    cdf_stream.writeStream
    .format("delta")
    .foreachBatch(upsert_cdf_to_gold)
    .option("checkpointLocation", "/Volumes/prod_catalog/metadata/checkpoints/cdf_gold_upsert")
    .trigger(availableNow=True)
    .start()
)</div>
    </div>
    <div class="page-footer">
      <span>Databricks End-to-End Technical Reference Manual (Level 100 – Level 400)</span>
      <span>Page 7 of 20</span>
    </div>
  </div>

  <!-- ==================== PAGE 8 ==================== -->
  <div class="page">
    <div class="page-content">
      <div class="section-title">3.4 Lakeflow Spark Declarative Pipelines (Delta Live Tables / DLT)</div>
      <p>
        Declarative pipelines replace imperative checkpoint and orchestration boilerplate with declarative SQL or Python definitions. The engine constructs the dependency graph, manages state checkpoints, enforces data quality constraints, and performs incremental maintenance:
      </p>
      <ul>
        <li><strong>Streaming Tables (<code class="inline-code">CREATE OR REFRESH STREAMING TABLE</code>):</strong> Stateful append or CDC targets reading incrementally from Auto Loader, Kafka, or upstream Delta tables.</li>
        <li><strong>Materialized Views (<code class="inline-code">CREATE OR REFRESH MATERIALIZED VIEW</code>):</strong> Pre-computed joins and aggregations refreshed incrementally using enzyme query optimization.</li>
        <li><strong>Declarative Data Quality Expectations:</strong> Rules evaluated on every record passing through the pipeline, logged automatically to the pipeline event log:
          <ul style="margin-top: 4px; margin-bottom: 4px;">
            <li><code class="inline-code">CONSTRAINT valid_id EXPECT (order_id IS NOT NULL)</code>: Retains invalid rows and logs violation metrics.</li>
            <li><code class="inline-code">CONSTRAINT positive_amt EXPECT (amount &gt; 0) ON VIOLATION DROP ROW</code>: Drops invalid rows prior to committing to target.</li>
            <li><code class="inline-code">CONSTRAINT valid_currency EXPECT (currency IN ('USD', 'EUR', 'INR')) ON VIOLATION FAIL UPDATE</code>: Halts pipeline execution immediately when critical regulatory invariants fail.</li>
          </ul>
        </li>
        <li><strong>APPLY CHANGES INTO (Declarative CDC):</strong> Processes out-of-order CDC streams into SCD Type 1 or SCD Type 2 tables automatically using a <code class="inline-code">SEQUENCE BY</code> watermark column.</li>
      </ul>

      <div class="code-container">-- Declarative SQL Pipeline with Expectations and SCD Type 2 CDC
CREATE OR REFRESH STREAMING TABLE bronze_customers
AS SELECT *, _metadata.file_path AS source_file
FROM STREAM read_files('/Volumes/prod_catalog/landing/customers/', format =&gt; 'json');

CREATE OR REFRESH STREAMING TABLE silver_customers_scd2 (
  CONSTRAINT valid_customer_id EXPECT (customer_id IS NOT NULL) ON VIOLATION DROP ROW
);

APPLY CHANGES INTO LIVE.silver_customers_scd2
FROM STREAM(LIVE.bronze_customers)
KEYS (customer_id)
APPLY AS DELETE WHEN operation = 'DELETE'
SEQUENCE BY updated_timestamp
COLUMNS * EXCEPT (operation, source_file)
STORED AS SCD TYPE 2;</div>
    </div>
    <div class="page-footer">
      <span>Databricks End-to-End Technical Reference Manual (Level 100 – Level 400)</span>
      <span>Page 8 of 20</span>
    </div>
  </div>

  <!-- ==================== PAGE 9 ==================== -->
  <div class="page">
    <div class="page-content">
      <div class="module-header">Module 4 (Level 300): Unified Governance with Unity Catalog</div>
      <div class="section-title">4.1 Three-Level Namespace &amp; Securable Object Model</div>
      <p>
        Unity Catalog provides centralized access control, automated lineage, auditing, and data discovery across all workspaces attached to a regional Metastore. All queries reference objects via a three-level namespace: <code class="inline-code">catalog.schema.table_or_view_or_volume</code>.
      </p>
      <ul>
        <li><strong>Metastore:</strong> Top-level regional container mapped to cloud storage credentials and linked to multiple workspaces (Dev, Staging, Prod).</li>
        <li><strong>Catalog:</strong> Primary isolation boundary representing environments (<code class="inline-code">dev_catalog</code>, <code class="inline-code">prod_catalog</code>) or business domains (<code class="inline-code">finance_catalog</code>, <code class="inline-code">supply_chain_catalog</code>).</li>
        <li><strong>Schema (Database):</strong> Logical grouping of tables, views, volumes, functions, and ML models (e.g., <code class="inline-code">bronze</code>, <code class="inline-code">silver</code>, <code class="inline-code">gold</code>).</li>
        <li><strong>Managed vs. External Tables:</strong> Managed tables delegate both metadata and physical file lifecycle to Unity Catalog (automatically benefiting from Predictive Optimization and physical file deletion upon <code class="inline-code">DROP TABLE</code>). External tables register existing cloud storage paths governed by Unity Catalog Storage Credentials and External Locations; dropping an external table removes only the metadata registration.</li>
        <li><strong>Volumes (Managed &amp; External):</strong> Provide governed POSIX-style filesystem paths (<code class="inline-code">/Volumes/catalog/schema/volume_name/file.pdf</code>) for unstructured documents, raw CSV/JSON landing files, and library wheels, completely replacing uncurated <code class="inline-code">dbfs:/</code> root mounts.</li>
      </ul>

      <div class="section-title">4.2 Fine-Grained Access Control: Row Filters &amp; Column Masks</div>
      <p>
        Beyond standard ANSI SQL privilege grants (<code class="inline-code">USE CATALOG</code>, <code class="inline-code">USE SCHEMA</code>, <code class="inline-code">SELECT</code>, <code class="inline-code">MODIFY</code>, <code class="inline-code">MANAGE</code>), Unity Catalog enforces dynamic row-level security and column-level masking directly inside the table definition using SQL User-Defined Functions (UDFs):
      </p>

      <div class="code-container">-- 1. Dynamic Column Masking UDF for PII Redaction
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
SET ROW FILTER prod_catalog.security.region_rls ON (country_code);</div>
    </div>
    <div class="page-footer">
      <span>Databricks End-to-End Technical Reference Manual (Level 100 – Level 400)</span>
      <span>Page 9 of 20</span>
    </div>
  </div>

  <!-- ==================== PAGE 10 ==================== -->
  <div class="page">
    <div class="page-content">
      <div class="section-title">4.3 Lakehouse Federation &amp; Delta Sharing</div>
      <ul>
        <li><strong>Lakehouse Federation (Zero-ETL Querying):</strong> Registers external relational databases (Azure SQL Database, Synapse, PostgreSQL, MySQL, Snowflake, Redshift) as read-only <code class="inline-code">FOREIGN CATALOG</code> objects via governed <code class="inline-code">CONNECTION</code> credentials. Queries push filters and aggregations down to the remote database engine while enforcing Unity Catalog RBAC and lineage.</li>
        <li><strong>Delta Sharing:</strong> An open REST protocol that enables secure, live sharing of Delta tables, views, volumes, and AI models with external organizations or BI platforms without copying data or locking recipients into Databricks.</li>
      </ul>

      <div class="module-header">Module 5 (Level 300–400): Compute Engine Internals — Spark, Catalyst &amp; Photon</div>
      <div class="section-title">5.1 Catalyst Optimizer &amp; Adaptive Query Execution (AQE)</div>
      <p>
        Apache Spark compiles SQL queries and DataFrame transformations through the Catalyst Optimizer pipeline: Unresolved Logical Plan &rarr; Analyzed Logical Plan (Catalog binding) &rarr; Optimized Logical Plan (Predicate Pushdown, Column Pruning, Constant Folding) &rarr; Physical Plan (Cost-Based Join Selection).
      </p>
      <p>
        Because static table statistics can be missing or outdated after complex filters, Adaptive Query Execution (AQE) intercepts shuffle stage boundaries at runtime and re-optimizes the remaining physical plan using exact runtime byte and row counts:
      </p>
      <ul>
        <li><strong>1. Dynamic Coalescing of Shuffle Partitions:</strong> Merges small adjacent post-shuffle partitions into larger target partition sizes (configured via <code class="inline-code">spark.sql.shuffle.partitions = auto</code>), preventing thousands of sub-millisecond tasks and tiny output files.</li>
        <li><strong>2. Dynamic Join Strategy Switching:</strong> Converts a planned Sort-Merge Join (SMJ) or Shuffle Hash Join (SHJ) into a zero-shuffle Broadcast Hash Join (BHJ) mid-query if runtime filters reduce one side of the join below <code class="inline-code">spark.sql.autoBroadcastJoinThreshold</code>.</li>
        <li><strong>3. Dynamic Skew Join Optimization:</strong> Detects skewed shuffle partitions where a single hot key causes a partition to exceed median size by a threshold factor, splitting the skewed partition into smaller sub-tasks and replicating the matching partition on the opposite side of the join.</li>
      </ul>

      <div class="section-title">5.2 The Photon Vectorized Execution Engine</div>
      <p>
        Photon is Databricks' native vectorized query engine written from the ground up in C++ to exploit modern CPU architectures:
      </p>
      <ul>
        <li><strong>Off-Heap Memory Management:</strong> Bypasses the Java Virtual Machine (JVM) during data processing, eliminating JVM garbage collection stalls and Java object header overhead.</li>
        <li><strong>SIMD Vectorization:</strong> Operates on columnar batches of data in L1/L2 CPU cache using Single Instruction, Multiple Data (SIMD) CPU instructions, delivering 2x to 5x speedups on scans, filters, hash joins, aggregations, and Delta/Parquet writes.</li>
      </ul>
    </div>
    <div class="page-footer">
      <span>Databricks End-to-End Technical Reference Manual (Level 100 – Level 400)</span>
      <span>Page 10 of 20</span>
    </div>
  </div>

  <!-- ==================== PAGE 11 ==================== -->
  <div class="page">
    <div class="page-content">
      <ul>
        <li><strong>Preserving Vectorization (Avoiding Python UDFs):</strong> Standard row-by-row Python UDFs force Photon to convert columnar batches back into JVM rows (<code class="inline-code">PhotonToSpark</code>) and serialize them over a local socket to a Python worker process (<code class="inline-code">BatchEvalPython</code>). Always replace Python UDFs with native <code class="inline-code">pyspark.sql.functions</code>, SQL Higher-Order Functions (<code class="inline-code">TRANSFORM</code>, <code class="inline-code">FILTER</code>, <code class="inline-code">AGGREGATE</code>), or Pandas/Arrow Vectorized UDFs.</li>
      </ul>

      <div class="section-title">5.3 Spark UI &amp; Photon Physical Plan Diagnostic Matrix (The 5 S's)</div>
      <p>
        Performance bottlenecks in distributed Spark workloads fall into five root causes—<strong>Spill, Skew, Shuffle, Storage, and Serialization (the 5 S's)</strong>. Engineers inspect the Spark UI SQL/DataFrame DAG and Stage Summary Metrics using the matrix below:
      </p>

      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 22%;">Physical Plan Operator</th>
            <th style="width: 17%;">Engine Mode</th>
            <th style="width: 31%;">Execution Behavior</th>
            <th style="width: 30%;">Optimization Action</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code class="inline-code">PhotonScan</code> / <code class="inline-code">PhotonProject</code></td>
            <td>Photon C++</td>
            <td>Vectorized columnar scan and filter evaluation</td>
            <td>Verify <code class="inline-code">PartitionFilters</code> and <code class="inline-code">DataFilters</code> are populated (predicate pushdown active).</td>
          </tr>
          <tr>
            <td><code class="inline-code">PhotonBroadcastHashJoin</code></td>
            <td>Photon C++</td>
            <td>Zero-shuffle hash join using broadcasted small table</td>
            <td>Optimal join strategy for dimension tables &lt; 100 MB.</td>
          </tr>
          <tr>
            <td><code class="inline-code">SortMergeJoin</code></td>
            <td>Spark / Photon</td>
            <td>Shuffles and sorts both datasets across network</td>
            <td>Ensure AQE is enabled; apply Liquid Clustering on join keys or use Broadcast hint if one side is small.</td>
          </tr>
          <tr>
            <td><code class="inline-code">BroadcastNestedLoopJoin</code></td>
            <td>Spark / Photon</td>
            <td>O(N &times; M) Cartesian loop caused by non-equi join condition</td>
            <td>Rewrite inequality joins into equi-joins or enable Databricks Range Join optimization bin hints.</td>
          </tr>
          <tr>
            <td><code class="inline-code">BatchEvalPython</code> / <code class="inline-code">ArrowEvalPython</code></td>
            <td>Python Worker</td>
            <td>Breaks out of Photon C++ to run Python code</td>
            <td>Refactor into native Spark SQL expressions or SQL UDFs so Photon remains 100% vectorized.</td>
          </tr>
        </tbody>
      </table>

      <div class="code-container"># Explicit Skew Mitigation Pattern: Splitting NULL Keys Before Left Outer Join
import pyspark.sql.functions as F

df_orders_valid = orders_df.filter(F.col("customer_id").isNotNull())
df_orders_null = orders_df.filter(F.col("customer_id").isNull())

# Join only non-null keys to prevent millions of NULL rows from landing on a single executor
df_joined_valid = df_orders_valid.join(customers_df, on="customer_id", how="left")

# Union back the NULL rows with empty dimension columns
df_final = df_joined_valid.unionByName(df_orders_null, allowMissingColumns=True)</div>
    </div>
    <div class="page-footer">
      <span>Databricks End-to-End Technical Reference Manual (Level 100 – Level 400)</span>
      <span>Page 11 of 20</span>
    </div>
  </div>

  <!-- ==================== PAGE 12 ==================== -->
  <div class="page">
    <div class="page-content">
      <div class="module-header">Module 6 (Level 400): Advanced Stateful Streaming &amp; Metadata-Driven Frameworks</div>
      <div class="section-title">6.1 Stateful Structured Streaming with RocksDB &amp; Watermarking</div>
      <p>
        When running stateful streaming operations—such as streaming aggregations, <code class="inline-code">dropDuplicatesWithinWatermark</code>, or stream-to-stream joins—storing millions of active keys in the default JVM heap state store leads to OutOfMemory errors and long GC pauses. Production streaming pipelines configure the RocksDB State Store with changelog checkpointing and explicit event-time watermarks:
      </p>

      <div class="code-container">import pyspark.sql.functions as F

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
    F.expr("'"'
        imp.ad_id = clk.ad_id AND
        clk.click_ts &gt;= imp.impression_ts AND
        clk.click_ts &lt;= imp.impression_ts + interval 15 minutes
    '"'"),
    "leftOuter"
)</div>
    </div>
    <div class="page-footer">
      <span>Databricks End-to-End Technical Reference Manual (Level 100 – Level 400)</span>
      <span>Page 12 of 20</span>
    </div>
  </div>

  <!-- ==================== PAGE 13 ==================== -->
  <div class="page">
    <div class="page-content">
      <div class="section-title">6.2 Enterprise Metadata-Driven Ingestion &amp; Merge Framework</div>
      <p>
        At scale, maintaining hundreds of individual PySpark notebooks creates technical debt. Principal architectures implement a Metadata-Driven Framework where source-to-target mappings, primary keys, watermark columns, data quality rules, and SCD types reside in a Unity Catalog control table. A single parameterized engine dynamically executes Bronze ingestion and Silver merges.
      </p>

      <div class="code-container">-- Unity Catalog Metadata Control Table DDL
CREATE SCHEMA IF NOT EXISTS prod_catalog.control_framework;

CREATE TABLE IF NOT EXISTS prod_catalog.control_framework.pipeline_metadata (
  pipeline_id BIGINT GENERATED ALWAYS AS IDENTITY,
  source_system STRING NOT NULL,
  entity_name STRING NOT NULL,
  source_format STRING NOT NULL,
  landing_path STRING NOT NULL,
  bronze_table STRING NOT NULL,
  silver_table STRING NOT NULL,
  primary_keys ARRAY&lt;STRING&gt; NOT NULL,
  sequence_column STRING NOT NULL,
  dq_filter_expr STRING,
  is_active BOOLEAN DEFAULT true
)
CLUSTER BY (source_system, entity_name)
TBLPROPERTIES ('delta.enableDeletionVectors' = true);</div>
    </div>
    <div class="page-footer">
      <span>Databricks End-to-End Technical Reference Manual (Level 100 – Level 400)</span>
      <span>Page 13 of 20</span>
    </div>
  </div>

  <!-- ==================== PAGE 14 ==================== -->
  <div class="page">
    <div class="page-content">
      <div class="code-container"># Reusable Parameterized PySpark Ingestion &amp; Dynamic Key Merge Engine
import sys
from delta.tables import DeltaTable
from pyspark.sql import Window
import pyspark.sql.functions as F

entity_arg = sys.argv[1]

# 1. Load metadata configuration for the requested entity
meta = (
    spark.table("prod_catalog.control_framework.pipeline_metadata")
    .filter((F.col("entity_name") == entity_arg) &amp; (F.col("is_active") == True))
    .collect()[0]
)

base_vol = "/Volumes/prod_catalog/control_framework/state"
schema_dir = f"{base_vol}/schemas/{meta.entity_name}"
chk_bronze = f"{base_vol}/checkpoints/{meta.entity_name}_bronze"
chk_silver = f"{base_vol}/checkpoints/{meta.entity_name}_silver"

# 2. Execute Auto Loader into Bronze Table
(
    spark.readStream.format("cloudFiles")
    .option("cloudFiles.format", meta.source_format)
    .option("cloudFiles.schemaLocation", schema_dir)
    .option("cloudFiles.inferColumnTypes", "true")
    .option("cloudFiles.schemaEvolutionMode", "addNewColumns")
    .load(meta.landing_path)
    .select("*", "_metadata.file_path", F.current_timestamp().alias("_ingest_ts"))
    .writeStream.format("delta")
    .option("checkpointLocation", chk_bronze)
    .option("mergeSchema", "true")
    .trigger(availableNow=True)
    .toTable(meta.bronze_table)
    .awaitTermination()
)

# 3. Dynamic Key-Driven Silver Upsert via foreachBatch
def dynamic_silver_upsert(micro_batch_df, batch_id):
    if micro_batch_df.isEmpty():
        return

    filtered_df = (
        micro_batch_df.filter(meta.dq_filter_expr)
        if meta.dq_filter_expr else micro_batch_df
    )
    pk_cols = [F.col(k) for k in meta.primary_keys]
    win = Window.partitionBy(*pk_cols).orderBy(F.col(meta.sequence_column).desc())
    deduped_df = (
        filtered_df.withColumn("_rn", F.row_number().over(win))
        .filter(F.col("_rn") == 1)
        .drop("_rn")
    )

    join_predicate = " AND ".join([f"t.{k} = s.{k}" for k in meta.primary_keys])
    target_tbl = DeltaTable.forName(spark, meta.silver_table)

    (
        target_tbl.alias("t")
        .merge(deduped_df.alias("s"), join_predicate)
        .whenMatchedUpdateAll()
        .whenNotMatchedInsertAll()
        .execute()
    )</div>
    </div>
    <div class="page-footer">
      <span>Databricks End-to-End Technical Reference Manual (Level 100 – Level 400)</span>
      <span>Page 14 of 20</span>
    </div>
  </div>

  <!-- ==================== PAGE 15 ==================== -->
  <div class="page">
    <div class="page-content">
      <div class="module-header">Module 7 (Level 400): Enterprise DevOps, CI/CD &amp; Databricks Asset Bundles</div>
      <div class="section-title">7.1 Databricks Asset Bundles (DABs) Architecture</div>
      <p>
        Databricks Asset Bundles (DABs) provide a unified Infrastructure-as-Code (IaC) specification to define notebooks, Python wheels, Lakeflow Jobs, Declarative Pipelines, and permissions in YAML files deployed via the Databricks CLI (<code class="inline-code">databricks bundle validate</code>, <code class="inline-code">databricks bundle deploy</code>, <code class="inline-code">databricks bundle run</code>).
      </p>

      <div class="code-container"># Root Bundle Configuration: databricks.yml
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
      root_path: /Workspace/Users/sp-prod/.bundle/${bundle.name}/${bundle.target}
    variables:
      catalog_name: prod_catalog
    run_as:
      service_principal_name: "00000000-1111-2222-3333-444444444444"</div>
    </div>
    <div class="page-footer">
      <span>Databricks End-to-End Technical Reference Manual (Level 100 – Level 400)</span>
      <span>Page 15 of 20</span>
    </div>
  </div>

  <!-- ==================== PAGE 16 ==================== -->
  <div class="page">
    <div class="page-content">
      <div class="code-container"># Multi-Task Lakeflow Job Resource: resources/lakeflow_etl_job.yml
resources:
  jobs:
    medallion_etl_workflow:
      name: "[${bundle.target}] Medallion Incremental Pipeline"
      trigger:
        table_update:
          table_names:
            - ${var.catalog_name}.bronze.orders_raw
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
            parameters: ["--catalog", "${var.catalog_name}"]</div>

      <div class="section-title">7.2 Automated PySpark Unit Testing with Pytest &amp; Chispa</div>
      <p>
        Continuous Integration (CI) pipelines validate transformation logic in isolated local Spark sessions before code reaches a workspace. The <code class="inline-code">chispa</code> library provides detailed schema and row-level diff reporting when DataFrame assertions fail:
      </p>
    </div>
    <div class="page-footer">
      <span>Databricks End-to-End Technical Reference Manual (Level 100 – Level 400)</span>
      <span>Page 16 of 20</span>
    </div>
  </div>

  <!-- ==================== PAGE 17 ==================== -->
  <div class="page">
    <div class="page-content">
      <div class="code-container">import pytest
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
    assert_df_equality(standardize_orders(input_df), expected_df, ignore_nullable=True)</div>

      <div class="module-header">Module 8 (Level 400): DBSQL, FinOps System Tables, Mosaic AI &amp; Troubleshooting</div>
      <div class="section-title">8.1 Databricks SQL (DBSQL) &amp; BI DirectQuery Integration</div>
      <ul>
        <li><strong>Intelligent Workload Management (IWM):</strong> Serverless SQL Warehouses use machine learning models to predict incoming query memory/CPU requirements, dynamically admitting fast queries and provisioning additional compute clusters in 2–6 seconds when concurrency spikes.</li>
        <li><strong>Multi-Layer Caching:</strong> Queries first check the deterministic Query Result Cache (returning instant results for identical SQL against unchanged Delta tables), followed by the local NVMe SSD Disk Cache (storing transcoded columnar data blocks), and finally reading remote cloud storage using Delta file-skipping statistics.</li>
        <li><strong>Power BI &amp; Microsoft Fabric Connectivity:</strong> Connects via the native Databricks partner connector using Microsoft Entra ID Single Sign-On (SSO) pass-through. DirectQuery and Composite models enforce Unity Catalog Row Filters and Column Masks per end-user identity.</li>
      </ul>
    </div>
    <div class="page-footer">
      <span>Databricks End-to-End Technical Reference Manual (Level 100 – Level 400)</span>
      <span>Page 17 of 20</span>
    </div>
  </div>

  <!-- ==================== PAGE 18 ==================== -->
  <div class="page">
    <div class="page-content">
      <div class="section-title">8.2 Enterprise FinOps &amp; Observability via System Tables</div>
      <p>
        Unity Catalog exposes operational telemetry across the entire account in the <code class="inline-code">system</code> catalog. Platform teams run scheduled SQL queries against <code class="inline-code">system.billing.usage</code>, <code class="inline-code">system.query.history</code>, and <code class="inline-code">system.access.table_lineage</code> to enforce cost governance and SLA monitoring:
      </p>

      <div class="code-container">-- 1. FinOps Query: 30-Day DBU &amp; USD Spend by Workspace, SKU, and Job ID
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
  AND u.usage_start_time &gt;= lp.price_start_time
  AND (u.usage_end_time &lt;= lp.price_end_time OR lp.price_end_time IS NULL)
WHERE u.usage_date &gt;= CURRENT_DATE() - INTERVAL 30 DAYS
GROUP BY ALL
ORDER BY estimated_spend_usd DESC;</div>

      <div class="code-container">-- 2. DBSQL Observability: Identify Queries with Disk Spill or High Scan Volume
SELECT
  statement_id,
  executed_by,
  warehouse_id,
  ROUND(total_duration_ms / 1000.0, 2) AS duration_sec,
  ROUND(read_bytes / (1024*1024*1024), 2) AS gb_scanned,
  ROUND(spilled_local_bytes / (1024*1024*1024), 2) AS gb_spilled,
  statement_text
FROM system.query.history
WHERE start_time &gt;= CURRENT_TIMESTAMP() - INTERVAL 7 DAYS
  AND execution_status = 'FINISHED'
  AND (spilled_local_bytes &gt; 0 OR total_duration_ms &gt; 60000)
ORDER BY spilled_local_bytes DESC, total_duration_ms DESC
LIMIT 20;</div>

      <div class="section-title">8.3 Mosaic AI, Vector Search &amp; Governed Agent Systems</div>
      <p>
        Databricks integrates generative AI directly with Unity Catalog and Delta Lake so Retrieval-Augmented Generation (RAG) and tool-calling agents inherit enterprise governance:
      </p>
    </div>
    <div class="page-footer">
      <span>Databricks End-to-End Technical Reference Manual (Level 100 – Level 400)</span>
      <span>Page 18 of 20</span>
    </div>
  </div>

  <!-- ==================== PAGE 19 ==================== -->
  <div class="page">
    <div class="page-content">
      <ul>
        <li><strong>Mosaic AI Vector Search (Delta Sync):</strong> Builds low-latency vector indexes directly over a Unity Catalog Delta table with Change Data Feed enabled. Whenever source document chunks are inserted, updated, or deleted in the Delta table, Vector Search automatically invokes the configured embedding model endpoint and updates the vector index incrementally.</li>
        <li><strong>Unity Catalog Agent Tools:</strong> SQL and Python UDFs registered in Unity Catalog (e.g., <code class="inline-code">prod_catalog.gold.get_customer_ltv(customer_id)</code>) serve as governed, deterministic tools invoked by LLM agents.</li>
        <li><strong>MLflow 3.0 &amp; AI Gateway:</strong> Logs multi-step agent execution traces, evaluates groundedness and safety against golden datasets using LLM judges, registers validated models in Unity Catalog with aliases (<code class="inline-code">@champion</code>, <code class="inline-code">@challenger</code>), and serves endpoints through the Mosaic AI Gateway with rate limits, PII guardrails, and automated payload logging to Delta inference tables.</li>
      </ul>

      <div class="code-container">from databricks.vector_search.client import VectorSearchClient

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
)</div>

      <div class="section-title">8.4 Production Troubleshooting &amp; Incident Resolution Playbook</div>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 25%;">Production Symptom</th>
            <th style="width: 35%;">Spark UI / System Root Cause Diagnosis</th>
            <th style="width: 40%;">Actionable Engineering Resolution</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Straggler Task<br><span style="font-size:7.5pt; color:#64748b;">(e.g., 199/200 tasks finished, 1 task hanging)</span></td>
            <td><strong>Data Skew:</strong> Stage Summary Metrics show Max task duration and Shuffle Read Size are 10x–100x larger than the 75th percentile (often caused by joining or grouping on NULL or default keys).</td>
            <td>
              1. Filter out NULL join keys before joining and union back afterward.<br>
              2. Verify <code class="inline-code">spark.sql.adaptive.skewJoin.enabled = true</code>.<br>
              3. For extreme skew or skewed aggregations, apply salted keys (<code class="inline-code">concat(key, '_', floor(rand() * 16))</code>).
            </td>
          </tr>
          <tr>
            <td>High Memory &amp; Disk Spill During Joins or Aggregations</td>
            <td><strong>Partition Memory Exhaustion:</strong> Shuffle partitions exceed executor RAM per core, forcing Spark to serialize unsafe rows to local NVMe disk and re-read them.</td>
            <td>
              1. Set <code class="inline-code">spark.sql.shuffle.partitions = auto</code> so AQE splits oversized partitions.<br>
              2. Switch to memory-optimized worker VMs.<br>
              3. Eliminate unbounded Window functions lacking a <code class="inline-code">PARTITION BY</code> clause.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="page-footer">
      <span>Databricks End-to-End Technical Reference Manual (Level 100 – Level 400)</span>
      <span>Page 19 of 20</span>
    </div>
  </div>

  <!-- ==================== PAGE 20 ==================== -->
  <div class="page">
    <div class="page-content">
      <table class="data-table" style="margin-top:0;">
        <thead>
          <tr>
            <th style="width: 25%;">Production Symptom</th>
            <th style="width: 35%;">Spark UI / System Root Cause Diagnosis</th>
            <th style="width: 40%;">Actionable Engineering Resolution</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Driver <code class="inline-code" style="font-size:7.2pt;">java.lang.OutOfMemoryError</code> Crash</td>
            <td><strong>Driver Heap Exhaustion:</strong> Calling <code class="inline-code">.collect()</code>, <code class="inline-code">.toPandas()</code>, broadcasting multiple huge tables concurrently, or building large Python dictionaries in driver memory.</td>
            <td>
              1. Replace <code class="inline-code">.collect()</code> and <code class="inline-code">.toPandas()</code> with distributed PySpark transformations and Delta writes.<br>
              2. Reduce <code class="inline-code">spark.sql.autoBroadcastJoinThreshold</code>.<br>
              3. Scale up the Driver node instance size vertically.
            </td>
          </tr>
          <tr>
            <td>Slow Table Scans &amp; High Metadata Planning Latency</td>
            <td><strong>Small File Problem:</strong> Thousands of KB-sized Parquet files generated by frequent streaming micro-batches or over-partitioned Hive directories.</td>
            <td>
              1. Migrate from Hive partitioning to <strong>Liquid Clustering</strong> (<code class="inline-code">CLUSTER BY</code>).<br>
              2. Enable Predictive Optimization or set <code class="inline-code">delta.autoOptimize.optimizeWrite = true</code> and <code class="inline-code">autoCompact = true</code>.<br>
              3. Execute <code class="inline-code">OPTIMIZE table_name</code>.
            </td>
          </tr>
          <tr>
            <td><code class="inline-code" style="font-size:7.2pt;">ConcurrentAppendException</code> / Write Conflict Failure</td>
            <td><strong>OCC Isolation Conflict:</strong> Two concurrent jobs updating or merging into overlapping physical Parquet files in the same Delta table.</td>
            <td>
              1. Enable <strong>Deletion Vectors</strong> (<code class="inline-code">delta.enableDeletionVectors = true</code>) and Row Tracking for row-level concurrency.<br>
              2. Add explicit target clustering key filters inside <code class="inline-code">MERGE ON</code> predicates so Delta prunes disjoint file sets.
            </td>
          </tr>
          <tr>
            <td><code class="inline-code" style="font-size:7.2pt;">PhotonToSpark</code> Transition Mid-Query Plan</td>
            <td><strong>Vectorization Breakout:</strong> Custom Python UDF or unsupported legacy expression forces Photon to convert columnar batches back into JVM rows.</td>
            <td>
              1. Inspect the SQL/DataFrame DAG for <code class="inline-code">BatchEvalPython</code>.<br>
              2. Rewrite Python UDFs using built-in <code class="inline-code">pyspark.sql.functions</code> or SQL Higher-Order Functions.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="page-footer">
      <span>Databricks End-to-End Technical Reference Manual (Level 100 – Level 400)</span>
      <span>Page 20 of 20</span>
    </div>
  </div>

</body>
</html>
"""
    return html_tmpl.replace("{{CSS_STYLES}}", CSS_STYLES)

def print_pdf_with_chrome(html_path, pdf_path):
    cmd = [
        CHROME_BIN,
        "--headless",
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={pdf_path}",
        html_path
    ]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0:
        raise RuntimeError(f"Chrome failed to render PDF: {res.stderr}")

def inject_bookmarks_and_metadata(pdf_path, toc, meta):
    doc = fitz.open(pdf_path)
    doc.set_toc(toc)
    doc.set_metadata(meta)
    temp_path = pdf_path + ".tmp.pdf"
    doc.save(temp_path, deflate=True)
    doc.close()
    os.replace(temp_path, pdf_path)

def generate_previews(pdf_path, base_name):
    doc = fitz.open(pdf_path)
    page_1 = doc[0]
    pix = page_1.get_pixmap(dpi=250)
    p1_path = os.path.join(IMG_DIR, f"{base_name}_page_1.png")
    pix.save(p1_path)

    # Poster image from page 1
    poster_path = os.path.join(IMG_DIR, f"{base_name}_poster.png")
    pix.save(poster_path)
    doc.close()

def main():
    filename_base = "databricks_data_intelligence_platform_technical_manual"
    html_file = os.path.join(HTML_DIR, f"{filename_base}.html")
    pdf_file = os.path.join(PDF_DIR, f"{filename_base}.pdf")

    print(f"Generating HTML: {html_file}")
    html_content = generate_html()
    with open(html_file, "w", encoding="utf-8") as f:
        f.write(html_content)

    print(f"Rendering PDF via Chrome: {pdf_file}")
    print_pdf_with_chrome(html_file, pdf_file)

    # Check page count
    doc = fitz.open(pdf_file)
    print(f"Rendered {doc.page_count} pages.")
    assert doc.page_count == 20, f"Expected 20 pages, got {doc.page_count}!"
    doc.close()

    # Hierarchical TOC
    toc = [
        [1, "Document Curriculum Overview", 1],
        [1, "Module 1 (Level 100): Platform Architecture & Core Concepts", 1],
        [2, "1.1 Split-Plane Cloud Architecture", 1],
        [2, "1.2 Compute Resource Taxonomy & DBU Economics", 2],
        [1, "Module 2 (Level 200): Delta Lake Storage Internals & Optimization", 2],
        [2, "2.1 The ACID Transaction Log (_delta_log)", 2],
        [2, "2.2 Deletion Vectors (Merge-on-Read vs. Copy-on-Write)", 3],
        [2, "2.3 Liquid Clustering vs. Hive Partitioning & Z-Ordering", 3],
        [2, "2.4 Predictive Optimization, VACUUM & Delta UniForm", 4],
        [1, "Module 3 (Level 200–300): Data Engineering & Medallion Pipelines", 5],
        [2, "3.1 The Medallion Lakehouse Architecture", 5],
        [2, "3.2 Incremental File Ingestion with Auto Loader (cloudFiles)", 5],
        [2, "3.3 Change Data Capture (CDC) & Delta Change Data Feed (CDF)", 6],
        [2, "3.4 Lakeflow Spark Declarative Pipelines (DLT)", 8],
        [1, "Module 4 (Level 300): Unified Governance with Unity Catalog", 9],
        [2, "4.1 Three-Level Namespace & Securable Object Model", 9],
        [2, "4.2 Fine-Grained Access Control: Row Filters & Column Masks", 9],
        [2, "4.3 Lakehouse Federation & Delta Sharing", 10],
        [1, "Module 5 (Level 300–400): Compute Engine Internals — Spark, Catalyst & Photon", 10],
        [2, "5.1 Catalyst Optimizer & Adaptive Query Execution (AQE)", 10],
        [2, "5.2 The Photon Vectorized Execution Engine", 10],
        [2, "5.3 Spark UI & Photon Diagnostic Matrix (The 5 S's)", 11],
        [1, "Module 6 (Level 400): Advanced Stateful Streaming & Metadata-Driven Frameworks", 12],
        [2, "6.1 Stateful Structured Streaming with RocksDB & Watermarking", 12],
        [2, "6.2 Enterprise Metadata-Driven Ingestion & Merge Framework", 13],
        [1, "Module 7 (Level 400): Enterprise DevOps, CI/CD & Databricks Asset Bundles", 15],
        [2, "7.1 Databricks Asset Bundles (DABs) Architecture", 15],
        [2, "7.2 Automated PySpark Unit Testing with Pytest & Chispa", 16],
        [1, "Module 8 (Level 400): DBSQL, FinOps System Tables, Mosaic AI & Troubleshooting", 17],
        [2, "8.1 Databricks SQL (DBSQL) & BI DirectQuery Integration", 17],
        [2, "8.2 Enterprise FinOps & Observability via System Tables", 18],
        [2, "8.3 Mosaic AI, Vector Search & Governed Agent Systems", 18],
        [2, "8.4 Production Troubleshooting & Incident Resolution Playbook", 19],
    ]

    meta = {
        "title": "Databricks Data Intelligence Platform: End-to-End Technical Manual",
        "author": "Santosh Jammi | Principal Data Architect",
        "subject": "Structured Progression from Foundational Concepts (Level 100) to Principal Production Architecture (Level 400)",
        "keywords": "Databricks, Lakehouse, Apache Spark, Delta Lake, Unity Catalog, Photon, Liquid Clustering, Deletion Vectors, Auto Loader, Change Data Feed, Lakeflow, DLT, RocksDB, DABs, Chispa, FinOps, Mosaic AI, Troubleshooting",
        "creator": "Modern Data Engineer Reference Publishing Engine",
        "producer": "Headless Chrome / PyMuPDF High-Density Publishing Engine"
    }

    print("Injecting TOC bookmarks and metadata...")
    inject_bookmarks_and_metadata(pdf_file, toc, meta)

    print("Generating thumbnails and preview images...")
    generate_previews(pdf_file, filename_base)
    # Also save as databricks_manual_poster.png and databricks_manual_page_1.png
    generate_previews(pdf_file, "databricks_manual")

    # Copy to docs/pdf/
    shutil.copy2(pdf_file, os.path.join(DOCS_PDF_DIR, f"{filename_base}.pdf"))
    print(f"Copied to {DOCS_PDF_DIR}")

    # Synchronize to mirrors
    sync_targets = [
        os.path.join(WORKSPACE_DIR, "public", "_artifacts", "cheat-sheets"),
        os.path.join(WORKSPACE_DIR, ".build-artifacts", "r2", "cheat-sheets"),
    ]
    for target in sync_targets:
        os.makedirs(os.path.join(target, "pdf"), exist_ok=True)
        os.makedirs(os.path.join(target, "html"), exist_ok=True)
        os.makedirs(os.path.join(target, "images"), exist_ok=True)
        shutil.copy2(pdf_file, os.path.join(target, "pdf", f"{filename_base}.pdf"))
        shutil.copy2(html_file, os.path.join(target, "html", f"{filename_base}.html"))
        for img_name in [f"{filename_base}_page_1.png", f"{filename_base}_poster.png", "databricks_manual_page_1.png", "databricks_manual_poster.png"]:
            src_img = os.path.join(IMG_DIR, img_name)
            if os.path.exists(src_img):
                shutil.copy2(src_img, os.path.join(target, "images", img_name))
        print(f"Synchronized to {target}")

    print("Done! 20-Page PDF successfully created, enriched, and synchronized.")

if __name__ == "__main__":
    main()
