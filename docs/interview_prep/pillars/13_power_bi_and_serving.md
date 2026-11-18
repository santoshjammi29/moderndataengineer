# Pillar 13: Power BI, Semantic Layer & Serving
**Category:** `POWER BI` | **Domain:** `Business Intelligence & Serving Layer`

---

### Q1: Compare Direct Lake mode vs Import mode vs DirectQuery in Power BI enterprise deployments.

**Difficulty:** `HARD` | **Niche:** `Power BI Storage Modes`

**Comparison Matrix:**
- **Import Mode:** Data imported into VertiPaq memory. Fastest sub-second report interactivity. Drawback: memory size limits (typically 10-100GB), data staleness between scheduled refreshes, and duplicate data storage.
- **DirectQuery:** Translates DAX queries into live SQL on underlying warehouse/lakehouse. Data is always 100% fresh. Drawback: slow visual render times, high query concurrency burdens on database engines.
- **Direct Lake Mode (Fabric):** VertiPaq engine loads Delta-Parquet files directly from OneLake storage into memory on-demand without data copying or SQL translation. Combines the speed of Import with the real-time freshness of DirectQuery.

---

### Q2: Why does a Kimball Star Schema significantly outperform a single flat wide table in the Power BI VertiPaq engine?

**Difficulty:** `HARD` | **Niche:** `VertiPaq Engine & Star Schema`

**Direct 30-Second Answer:**
VertiPaq compresses columns independently using **Dictionary Encoding**:
- **Flat Wide Table (Anti-pattern):** Storing customer attributes (name, address, city) repeated across 100 million order rows explodes dictionary sizes and destroys compression efficiency.
- **Star Schema (Best Practice):** Normalizing attributes into dimension tables leaves small integer surrogate keys in the fact table. Fact table integer columns compress via Bit-Packing into negligible memory, maximizing CPU cache utilization and speeding up aggregations.

---

### Q3: Explain the architectural difference between Row Context and Filter Context in DAX, and what is Context Transition?

**Difficulty:** `HARD` | **Niche:** `DAX Internals & Context`

**Direct 30-Second Answer:**
- **Row Context:** The concept of the 'current row' during iterative calculations (e.g. calculated columns, `SUMX`, `FILTER`). Does NOT filter the table automatically.
- **Filter Context:** The set of active filters applied to the data model by report slicers, visuals, page filters, and `CALCULATE()` statements.
- **Context Transition:** Occurs when `CALCULATE()` is invoked inside a Row Context. It automatically converts the current row's column values into an equivalent Filter Context, filtering the entire data model.

---

### Q4: Explain the 3 primary compression algorithms utilized by the Power BI VertiPaq engine.

**Difficulty:** `HARD` | **Niche:** `VertiPaq Compression Internals`

**3 Core Compression Encodings:**
1. **Value Encoding:** Subtracts the minimum value of an integer column from all values, shrinking the bit-width required to store numbers.
2. **Dictionary Encoding:** Replaces strings with integer IDs and builds an in-memory dictionary. Memory footprint is determined by column **cardinality**, not row count.
3. **Run-Length Encoding (RLE):** Compresses consecutive duplicate values into `(value, count)` pairs. Extremely efficient when tables are sorted by the encoded column.

---

### Q5: How do User-Defined Aggregation Tables optimize query performance over billion-row lakehouses?

**Difficulty:** `HARD` | **Niche:** `Aggregation Tables & Composite Models`

**Direct 30-Second Answer:**
In Composite Models, create a pre-aggregated table (e.g. `agg_sales_monthly`) cached in **Import Mode**, while keeping the underlying billion-row `fact_sales` in **DirectQuery Mode**:
- **Automatic Query Routing:** When an executive visual asks for monthly sales, Power BI intercepts the query and answers it from the fast in-memory aggregation table ($< 100\text{ms}$).
- If a user drills down to individual invoice line items, Power BI automatically falls back to DirectQuery against the lakehouse.

---

### Q6: Compare Row-Level Security (RLS) vs Object-Level Security (OLS) in Power BI semantic models.

**Difficulty:** `MEDIUM` | **Niche:** `Security & RLS/OLS`

**Comparison:**
- **Row-Level Security (RLS):** Restricts data access at the row level based on user identity (e.g. `[Region] = USERPRINCIPALNAME()`). Users can still see the table and visual structure, but only their authorized rows appear.
- **Object-Level Security (OLS):** Completely secures and conceals entire tables or sensitive columns (e.g. `SSN`, `Executive Salary`) from unauthorized users. To restricted users, the column appears non-existent.

---

### Q7: How do you configure Incremental Refresh and Hybrid Tables in Power BI Premium?

**Difficulty:** `MEDIUM` | **Niche:** `Incremental Refresh`

**Configuration Steps:**
1. Define reserved `RangeStart` and `RangeEnd` datetime parameters in Power Query.
2. Configure incremental refresh policy: e.g., **Store 5 years of history**, but **Refresh only last 7 days**.
3. **Hybrid Tables (Real-Time):** In Power BI Premium, configure the latest day/partition in **DirectQuery** mode while keeping historical partitions in **Import Mode**, providing real-time data with sub-second historical reporting.

---

### Q8: How do you size and cluster On-Premises Data Gateways for high-throughput enterprise Power BI refreshes?

**Difficulty:** `MEDIUM` | **Niche:** `Enterprise Gateway Infrastructure`

**Gateway Clustering Best Practice:**
1. Deploy at least **2 high-spec Gateway VMs** in an active-active cluster to eliminate single points of failure.
2. Enable **Load Balancing:** Automatically distributes concurrent scheduled refresh jobs across cluster nodes.
3. Allocate at least 8 CPU cores, 32GB RAM, and 1 Gbps dedicated network link per node to prevent spooling bottlenecks during massive multi-million row extracts.

---

### Q9: Compare Power BI Datamarts/Semantic Models with dedicated semantic platforms (Cube, AtScale, dbt Semantic Layer).

**Difficulty:** `HARD` | **Niche:** `Semantic Layer Comparison`

**Comparison:**
- **Power BI Semantic Models:** Deeply optimized for Microsoft Power BI consumers with DAX calculations and VertiPaq caching. However, vendor-locked and difficult for non-Microsoft tools (Tableau, Python) to consume.
- **Universal Semantic Layers (Cube, AtScale, dbt):** Vendor-agnostic. Expose a single unified metric layer accessible via SQL, REST, and GraphQL, serving Power BI, Tableau, Excel, and AI agents interchangeably.

---

### Q10: How do you identify DAX bottlenecks and visual latency using the Power BI Performance Analyzer and DAX Studio?

**Difficulty:** `HARD` | **Niche:** `Performance Profiling`

**Profiling Workflow:**
1. Run **Performance Analyzer** in Power BI Desktop to capture visual duration breakdown: DAX Query, Visual Display, and Other wait time.
2. Copy the query into **DAX Studio**; enable **Server Timings**.
3. Inspect the split between **Storage Engine (SE)** and **Formula Engine (FE)**:
   - If Formula Engine $> 30\%$: DAX query contains un-vectorized row-by-row iteration (e.g. non-sargable `IF` inside `SUMX`). Rewrite to push filtering into the VertiPaq Storage Engine.

---
