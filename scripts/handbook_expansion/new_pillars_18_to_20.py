"""
Pillars 18, 19, and 20 (30 questions)
"""

NEW_PILLARS_18_20 = {
    "18": {
        "title": "Pillar 18: GenAI, Vector Search & Lakehouse Embeddings",
        "category": "GENAI & VECTOR DATA ENGINEERING",
        "domain": "GenAI & Vector Platforms",
        "questions": [
            {
                "id": "pil18-hnsw-vs-ivfpq-indexing",
                "category": "GENAI & VECTOR DATA ENGINEERING",
                "domain": "GenAI & Vector Platforms",
                "subdomain": "Vector Indexing Architectures",
                "niche": "HNSW vs IVF-PQ Vector Indexing",
                "difficulty": "HARD",
                "question": "Compare Hierarchical Navigable Small World (HNSW) vs Inverted File Product Quantization (IVF-PQ) vector indexes.",
                "answer": "**1. HNSW (Graph-Based):**\n- Constructs a multi-layer graph of vectors where upper layers have long-distance edges and lower layers have dense short-distance edges.\n- *Recall & Speed:* Exceptionally high recall (> 98%) and sub-5ms query latency.\n- *Memory:* High memory footprint (stores raw vectors and graph pointers in RAM).\n**2. IVF-PQ (Quantization-Based):**\n- Inverted File (IVF) clusters vectors into Voronoi cells; Product Quantization (PQ) compresses high-dimensional floating-point vectors into compact byte codes.\n- *Recall & Speed:* Moderate recall (85-95%); significantly lower memory (up to 95% RAM compression).\n- *Scale:* Ideal for billion-vector datasets that exceed available cluster memory.",
                "linked_concept_id": "system-design"
            },
            {
                "id": "pil18-databricks-vector-search",
                "category": "GENAI & VECTOR DATA ENGINEERING",
                "domain": "GenAI & Vector Platforms",
                "subdomain": "Managed Vector Search",
                "niche": "Databricks Vector Search Architecture",
                "difficulty": "HARD",
                "question": "How does Databricks Vector Search synchronize vector indexes with Delta Lake tables in real time?",
                "answer": "Databricks Vector Search provides two ingestion modes:\n1. **Delta Sync Index:** Vector Search monitors the source Delta Lake table's Change Data Feed (CDF). When new rows are inserted, updated, or deleted in Delta, Vector Search automatically updates the underlying HNSW index in the background without manual re-indexing.\n2. **Direct-Access Index:** Allows REST APIs to insert vectors directly for real-time applications.\nEnables Unity Catalog governance, column-level masking, and ACLs on vector embeddings identical to relational tables.",
                "linked_concept_id": "databricks-unity-catalog"
            },
            {
                "id": "pil18-chunking-strategies-rag",
                "category": "GENAI & VECTOR DATA ENGINEERING",
                "domain": "GenAI & Vector Platforms",
                "subdomain": "Document Preprocessing & Chunking",
                "niche": "Text Chunking Strategies for RAG",
                "difficulty": "MEDIUM",
                "question": "Compare Fixed-Size Chunking with Overlap vs Recursive Semantic Chunking for enterprise RAG pipelines.",
                "answer": "**1. Fixed-Size Chunking (e.g. 512 tokens with 50-token overlap):** Fast, simple, uniform vector size. *Flaw:* Slices sentences midway, splitting crucial context across chunk boundaries.\n**2. Recursive Semantic Chunking:** Splits text hierarchically using natural document delimiters (markdown headers `##`, paragraphs `\\n\\n`, sentences, words).\n- Preserves complete thoughts and semantic coherence within chunks.\n- Attaches parent document metadata (section title, document version, author) to each chunk to enhance retrieval filtering.",
                "linked_concept_id": "system-design"
            },
            {
                "id": "pil18-embedding-ingestion-gpu-spark",
                "category": "GENAI & VECTOR DATA ENGINEERING",
                "domain": "GenAI & Vector Platforms",
                "subdomain": "Distributed Embedding Pipelines",
                "niche": "Distributed Embedding Pipelines",
                "difficulty": "HARD",
                "question": "How do you vectorize 100 million document chunks in PySpark using GPU-accelerated Pandas UDFs?",
                "answer": "```python\nimport pandas as pd\nfrom pyspark.sql.functions import pandas_udf\nimport torch\nfrom sentence_transformers import SentenceTransformer\n\n# Initialize model once per worker GPU process:\ndevice = \"cuda\" if torch.cuda.is_available() else \"cpu\"\nmodel = SentenceTransformer(\"BAAI/bge-large-en-v1.5\", device=device)\n\n@pandas_udf(\"array<float>\")\ndef compute_embeddings(texts: pd.Series) -> pd.Series:\n    embeddings = model.encode(texts.tolist(), batch_size=256, normalize_embeddings=True)\n    return pd.Series(list(embeddings))\n\n# Tune batch size to avoid GPU Out-Of-Memory:\nspark.conf.set(\"spark.sql.execution.arrow.maxRecordsPerBatch\", \"1024\")\n\ndf_chunks.withColumn(\"vector\", compute_embeddings(\"chunk_text\")) \\\n         .write.format(\"delta\").saveAsTable(\"gold.document_vectors\")\n```",
                "linked_concept_id": "spark-catalyst"
            },
            {
                "id": "pil18-semantic-caching-llm",
                "category": "GENAI & VECTOR DATA ENGINEERING",
                "domain": "GenAI & Vector Platforms",
                "subdomain": "FinOps & Latency Optimization",
                "niche": "Semantic Caching Architecture",
                "difficulty": "MEDIUM",
                "question": "How does Semantic Caching reduce enterprise LLM API expenditure by up to 70%?",
                "answer": "**Exact String Caching Flaw:** Prompts like 'What is our return policy?' and 'How do I return an item?' have different strings, resulting in cache misses in Redis.\n**Semantic Caching:**\n1. Inbound user prompt is converted into an embedding vector.\n2. Query the vector cache (e.g. Redis VSS or Qdrant) for cosine similarity $> 0.95$.\n3. If a semantic match is found, return the cached LLM response in < 15ms with 0 token spend.\n4. If no match is found, invoke the LLM, serve the user, and store prompt vector + response in the cache.",
                "linked_concept_id": "system-design"
            },
            {
                "id": "pil18-hybrid-search-bm25-dense",
                "category": "GENAI & VECTOR DATA ENGINEERING",
                "domain": "GenAI & Vector Platforms",
                "subdomain": "RAG Information Retrieval",
                "niche": "Hybrid Search (BM25 + Dense Vectors)",
                "difficulty": "HARD",
                "question": "Why is Hybrid Search (BM25 Keyword Search + Dense Vector Search) superior to pure vector search for RAG?",
                "answer": "**Pure Vector Search Flaw:** Dense embeddings struggle with exact lexical matches: serial numbers, acronyms, product SKUs (`SKU-49102-X`), and domain-specific terminology.\n**Hybrid Search Architecture:**\n1. **Sparse Search (BM25 / Splade):** Scores exact keyword and token frequency.\n2. **Dense Search (Cosine Similarity):** Scores conceptual, semantic meaning.\n3. **Reciprocal Rank Fusion (RRF):** Combines results from both retrievers using rank scoring: $RRF(d) = \\sum \\frac{1}{60 + r_i(d)}$.\nGuarantees high relevance across both semantic concepts and exact product/ID lookups.",
                "linked_concept_id": "system-design"
            },
            {
                "id": "pil18-embedding-drift-model-upgrade",
                "category": "GENAI & VECTOR DATA ENGINEERING",
                "domain": "GenAI & Vector Platforms",
                "subdomain": "Lifecycle Management & Migrations",
                "niche": "Embedding Drift & Model Migrations",
                "difficulty": "ARCHITECT",
                "question": "How do you manage embedding model upgrades and vector re-indexing on a 50TB Delta lakehouse without downtime?",
                "answer": "Embeddings from different models (e.g. OpenAI `text-embedding-ada-002` [1536 dim] vs `text-embedding-3-large` [3072 dim]) live in completely incompatible vector spaces. Comparing them produces garbage similarity scores.\n**Zero-Downtime Migration Blueprint:**\n1. Add a versioned vector column to Delta table: `vector_v2 ARRAY<FLOAT>`.\n2. Run a background Spark GPU batch job to compute `vector_v2` for all document chunks.\n3. Build a shadow Vector Search index on `vector_v2`.\n4. Route staging RAG traffic to shadow index for evaluation.\n5. Atomic blue-green cutover: Update query service config to target index v2; drop legacy `vector_v1` column via Delta Column Mapping.",
                "linked_concept_id": "system-design"
            },
            {
                "id": "pil18-vector-metadata-filtering",
                "category": "GENAI & VECTOR DATA ENGINEERING",
                "domain": "GenAI & Vector Platforms",
                "subdomain": "Query Execution & Filtering",
                "niche": "Pre-Filtering vs Single-Stage Search",
                "difficulty": "HARD",
                "question": "Compare Pre-Filtering, Post-Filtering, and Single-Stage Filtering in Vector Search.",
                "answer": "**1. Post-Filtering:** Execute vector search first ($K$ nearest neighbors), then filter results by metadata (`tenant_id = 'acme'`). *Flaw:* If top 100 results belong to other tenants, post-filtering returns 0 results.\n**2. Pre-Filtering:** Filter by metadata first, then search vectors within the candidate subset. *Flaw:* Can be slow if the metadata filter returns millions of candidates.\n**3. Single-Stage Filtering (Modern Standard):** HNSW graph traversal evaluates the metadata filter dynamically while traversing graph nodes, pruning unpermitted edges immediately. Delivers high recall and low latency.",
                "linked_concept_id": "system-design"
            },
            {
                "id": "pil18-multimodal-lakehouse-storage",
                "category": "GENAI & VECTOR DATA ENGINEERING",
                "domain": "GenAI & Vector Platforms",
                "subdomain": "Multimodal Data Engineering",
                "niche": "Multimodal Embeddings in Delta Tables",
                "difficulty": "HARD",
                "question": "How do you store and index multimodal data (audio, image, video) in Delta Lake for cross-modal similarity search?",
                "answer": "- Store raw media binaries (JPEG, MP4) in cloud object storage; store canonical URIs in Bronze Delta table.\n- Extract joint multimodal embeddings using models like CLIP (Contrastive Language-Image Pretraining).\n- Project both image vectors and text descriptions into the **same shared embedding space**.\n- Querying with natural language ('Find red sports cars in video feed') computes text vector, queries image vectors in Delta Vector Search, and retrieves matching video timestamps in milliseconds.",
                "linked_concept_id": "system-design"
            },
            {
                "id": "pil18-pii-redaction-llm-pipelines",
                "category": "GENAI & VECTOR DATA ENGINEERING",
                "domain": "GenAI & Vector Platforms",
                "subdomain": "Data Governance & Compliance",
                "niche": "PII Redaction in LLM Ingestion",
                "difficulty": "ARCHITECT",
                "question": "How do you implement automated PII redaction and compliance guardrails before embedding customer documents?",
                "answer": "1. **Token-Level Entity Detection:** Run Microsoft Presidio or SpaCy NER inside PySpark streaming ingestion to detect SSNs, emails, credit cards, and names.\n2. **Replacement / Encryption:** Replace PII with anonymized surrogate tokens (`<CUSTOMER_EMAIL_HASH>`) or encrypt with tenant-specific format-preserving encryption (FPE).\n3. **Audit Log:** Record redaction metadata in a secure audit Delta table.\n4. **Embedding Stage:** Pass only sanitized text to the embedding model, ensuring that private PII is mathematically impossible to reconstruct from vector weights.",
                "linked_concept_id": "system-design"
            }
        ]
    },
    "19": {
        "title": "Pillar 19: Enterprise FinOps, Compute Governance & Cost Engineering",
        "category": "FINOPS & COST OPTIMIZATION",
        "domain": "Enterprise FinOps & Cost Engineering",
        "questions": [
            {
                "id": "pil19-databricks-dbu-optimization",
                "category": "FINOPS & COST OPTIMIZATION",
                "domain": "Enterprise FinOps & Cost Engineering",
                "subdomain": "Databricks FinOps",
                "niche": "Databricks DBU Cost Optimization",
                "difficulty": "HARD",
                "question": "What is the complete checklist for reducing Databricks DBU spend by 30-50% in an enterprise deployment?",
                "answer": "1. **Job Clusters Over All-Purpose:** Production workloads must use Automated Job Clusters (50% cheaper DBUs than interactive clusters).\n2. **Aggressive Auto-Termination:** 10-15 minute timeout on all interactive developer clusters.\n3. **Instance Selection:** Switch from general-purpose VMs to modern Graviton/ARM or AMD EPYC instances (20% better price-performance).\n4. **Spot Instances:** Configure 70% Spot worker nodes with automated on-demand driver/fallback.\n5. **Serverless SQL Warehouses:** Enable auto-stop (1 minute timeout) and autoscaling pools.\n6. **Photon Gating:** Audit Photon spend using System Tables; disable on jobs where I/O is not the bottleneck.",
                "linked_concept_id": "system-design"
            },
            {
                "id": "pil19-serverless-vs-classic-cost-curve",
                "category": "FINOPS & COST OPTIMIZATION",
                "domain": "Enterprise FinOps & Cost Engineering",
                "subdomain": "Compute Economics",
                "niche": "Serverless vs Classic Compute Cost Curves",
                "difficulty": "HARD",
                "question": "Under what utilization patterns does Serverless compute become significantly MORE expensive than Classic compute?",
                "answer": "**Cost Curves:**\n- **Serverless is Cheaper for:** Bursty, intermittent, or unpredictable workloads. Because serverless scales to 0 instantly and has zero startup time, you pay 0 during idle hours.\n- **Classic Compute is Cheaper for:** **24/7 Continuous Steady-State Workloads** (e.g. uninterrupted streaming jobs running 24 hours/day). Serverless carries a premium DBU rate per core-hour. For continuous 100% utilization, provisioning reserved cloud VM instances (3-year RI or Savings Plans) combined with classic compute reduces total cost by up to 55% compared to Serverless.",
                "linked_concept_id": "system-design"
            },
            {
                "id": "pil19-photon-roi-evaluation",
                "category": "FINOPS & COST OPTIMIZATION",
                "domain": "Enterprise FinOps & Cost Engineering",
                "subdomain": "Engine Cost Profiling",
                "niche": "Photon ROI Evaluation Framework",
                "difficulty": "HARD",
                "question": "How do you evaluate whether Databricks Photon delivers a positive Return on Investment (ROI) for a specific workload?",
                "answer": "Photon incurs a **$2\\times$ DBU multiplier** on cluster compute.\n**Positive ROI Equation:**\n$$\\text{Speedup Factor} > 2.0$$\nIf Photon makes a job run $3\\times$ faster, runtime drops by $66\\%$. Even with double the DBU rate, total DBUs consumed drop by $33\\%$ (Net Savings).\n**When Photon Wins:** Heavy SQL queries, large joins, complex aggregations, writing Parquet/Delta.\n**When Photon Loses:** Workloads dominated by non-vectorized Python UDFs, third-party REST API calls, or tiny datasets.",
                "linked_concept_id": "system-design"
            },
            {
                "id": "pil19-cloud-storage-finops-s3",
                "category": "FINOPS & COST OPTIMIZATION",
                "domain": "Enterprise FinOps & Cost Engineering",
                "subdomain": "Storage Economics",
                "niche": "Object Storage Cost Engineering",
                "difficulty": "MEDIUM",
                "question": "How do incomplete multipart uploads and excessive list operations drive up cloud storage bills on S3/ADLS?",
                "answer": "1. **Incomplete Multipart Uploads:** When a Spark job fails midway, staged multi-gigabyte upload parts remain hidden in S3 storage forever. Configure an S3 lifecycle rule to **Abort Incomplete Multipart Uploads after 7 days** (often reclaims 10-30% of total S3 storage cost).\n2. **LIST / GET Request Costs:** Repeatedly running `listStatus` on partitioned directories with millions of small files incurs thousands of dollars in S3 API fees. Adopting Delta Lake or Iceberg consolidates file listing into transaction log metadata reads.",
                "linked_concept_id": "storage-scaling"
            },
            {
                "id": "pil19-bigquery-slots-vs-ondemand",
                "category": "FINOPS & COST OPTIMIZATION",
                "domain": "Enterprise FinOps & Cost Engineering",
                "subdomain": "Data Warehouse Pricing",
                "niche": "BigQuery Slots vs On-Demand Pricing",
                "difficulty": "HARD",
                "question": "Compare Google BigQuery On-Demand pricing ($6.25/TB scanned) vs Capacity-Based Slot Commitments.",
                "answer": "**1. On-Demand Pricing:** Billed strictly on bytes scanned ($6.25 per TB). Ideal for low-frequency queries and predictable small scans. Highly risky on un-partitioned 50TB tables where an accidental query costs $300+.\n**2. Capacity Pricing (BigQuery Editions - Standard/Enterprise):** Billed on dedicated or autoscaling **Slots** per hour.\n- Caps maximum spending and provides predictable budgeting.\n- Features like BI Engine and dynamic slot allocation maximize utilization.\n- *Crossover Point:* When organization scans $> 1.5\\text{ PB/month}$, capacity slots deliver significant cost savings.",
                "linked_concept_id": "database-architecture"
            },
            {
                "id": "pil19-snowflake-finops-warehouses",
                "category": "FINOPS & COST OPTIMIZATION",
                "domain": "Enterprise FinOps & Cost Engineering",
                "subdomain": "Data Warehouse Pricing",
                "niche": "Snowflake Compute Optimization",
                "difficulty": "HARD",
                "question": "What configuration parameters eliminate runaway credit consumption in Snowflake Virtual Warehouses?",
                "answer": "1. **AUTO_SUSPEND = 60:** Suspend warehouse after 60 seconds of inactivity (default is often 10 minutes).\n2. **AUTO_RESUME = TRUE:** Resume instantly upon query arrival.\n3. **STATEMENT_TIMEOUT_IN_SECONDS = 3600:** Kill runaway queries automatically after 1 hour.\n4. **Multi-Cluster Scaling Policy:** Set to `ECONOMY` rather than `STANDARD` for batch reporting (queues queries briefly to avoid spinning up unnecessary compute clusters).\n5. **Resource Monitors:** Enforce hard credit caps per department with automatic warehouse suspension at 100% quota.",
                "linked_concept_id": "database-architecture"
            },
            {
                "id": "pil19-shuffle-spill-cloud-costs",
                "category": "FINOPS & COST OPTIMIZATION",
                "domain": "Enterprise FinOps & Cost Engineering",
                "subdomain": "Engine Performance & Cloud Costs",
                "niche": "Shuffle Spill Financial Waste",
                "difficulty": "HARD",
                "question": "How does Tungsten shuffle disk spill directly inflate cloud virtual machine compute and storage bills?",
                "answer": "When a Spark job spills hundreds of gigabytes to disk, two financial penalties occur:\n1. **Compute Runtime Inflation:** Spilling forces memory serialization, disk writes, disk reads, and decompression. A job that should take 15 minutes runs for 2 hours, burning 8x more DBU and VM hourly credits.\n2. **Cloud EBS/Disk IOPS Costs:** Cloud providers charge for provisioned IOPS or throttle burst balances. When burst balance exhausts, task throughput drops by 90%, prolonging cluster runtime further.",
                "linked_concept_id": "spark-memory"
            },
            {
                "id": "pil19-spot-instance-fallback-strategy",
                "category": "FINOPS & COST OPTIMIZATION",
                "domain": "Enterprise FinOps & Cost Engineering",
                "subdomain": "Infrastructure & Cloud Economics",
                "niche": "Spot Instance Fallback Strategies",
                "difficulty": "HARD",
                "question": "How do you architect a mission-critical ETL cluster using 80% Spot instances without risking SLA breaches?",
                "answer": "1. **Driver on On-Demand:** Never run the Spark Driver on a Spot instance; losing the driver terminates the entire application.\n2. **Worker Fleet Diversification:** Configure worker pools across 5-8 different VM instance types and availability zones (e.g. `m5.2xlarge`, `m5a.2xlarge`, `r5.2xlarge`) to minimize the chance of simultaneous Spot reclamation.\n3. **External Shuffle Service / Shuffle Tracking:** Enable `spark.dynamicAllocation.shuffleTracking.enabled = true` so when a Spot node is reclaimed, Spark re-fetches shuffle files from surviving nodes rather than failing the stage.",
                "linked_concept_id": "system-design"
            },
            {
                "id": "pil19-tagging-governance-crosscharge",
                "category": "FINOPS & COST OPTIMIZATION",
                "domain": "Enterprise FinOps & Cost Engineering",
                "subdomain": "Governance & Cost Allocation",
                "niche": "Tagging Governance & Chargebacks",
                "difficulty": "MEDIUM",
                "question": "How do you enforce automated tag propagation across cloud lakehouse assets for accurate chargebacks?",
                "answer": "1. **Terraform / DABs Enforcement:** Mandate tags (`Department`, `Project`, `Environment`, `Owner`) on all cluster, storage, and catalog resources.\n2. **Unity Catalog Catalog-Level Tags:** Inherit tags hierarchically from Catalog -> Schema -> Table.\n3. **System Tables Billing Reconciliation:** Query `system.billing.usage` grouping by `custom_tags['Department']` to generate monthly departmental chargeback reports.\n4. **Policy Enforcement:** Use Azure Policy / AWS Service Control Policies to reject creation of any compute cluster lacking mandatory cost center tags.",
                "linked_concept_id": "system-design"
            },
            {
                "id": "pil19-idle-cluster-remediation-daemon",
                "category": "FINOPS & COST OPTIMIZATION",
                "domain": "Enterprise FinOps & Cost Engineering",
                "subdomain": "Automated Governance & Daemons",
                "niche": "Idle Cluster Remediation Daemons",
                "difficulty": "MEDIUM",
                "question": "How do you build a lightweight automated daemon to detect and terminate zombie developer clusters?",
                "answer": "Deploy a serverless AWS Lambda / Azure Function on a 15-minute cron:\n1. Call Databricks Clusters API (`/api/2.0/clusters/list`).\n2. For active clusters, query the latest command execution timestamps via Workspace API.\n3. If a cluster has had 0 command activity for > 30 minutes and lacks an active override tag:\n   - Send a notification to the owner on Slack.\n   - Issue cluster termination API call (`/api/2.0/clusters/delete`).\nSaves tens of thousands of dollars in abandoned developer compute.",
                "linked_concept_id": "system-design"
            }
        ]
    },
    "20": {
        "title": "Pillar 20: Data Quality, Contracts, Circuit Breakers & Observability",
        "category": "DATA QUALITY & OBSERVABILITY",
        "domain": "Data Reliability & Quality Engineering",
        "questions": [
            {
                "id": "pil20-data-contracts-architecture",
                "category": "DATA QUALITY & OBSERVABILITY",
                "domain": "Data Reliability & Quality Engineering",
                "subdomain": "Data Contracts & Agreements",
                "niche": "Data Contracts Architecture",
                "difficulty": "ARCHITECT",
                "question": "What is a Data Contract, and how do you implement declarative schema and semantic validation at producer boundaries?",
                "answer": "A **Data Contract** is an explicit, versioned agreement between software engineering producers (microservices) and data consumers specifying schema, SLA, semantics, and quality expectations.\n```yaml\ndata_contract_specification: 0.9.3\nid: payments-service-contract\nschema:\n  type: object\n  properties:\n    payment_id: { type: string, format: uuid }\n    amount: { type: number, minimum: 0.01 }\n    currency: { type: string, enum: [USD, EUR, GBP] }\nquality_rules:\n  - rule: freshness\n    max_delay: 5m\n  - rule: null_check\n    column: payment_id\n    threshold: 0%\n```\n**Enforcement:** Evaluated via CI/CD test gates on producer PRs and validated at ingestion boundaries (Kafka Schema Registry, PySpark contract evaluators) before records reach the Lakehouse.",
                "linked_concept_id": "system-design"
            },
            {
                "id": "pil20-circuit-breaker-streaming",
                "category": "DATA QUALITY & OBSERVABILITY",
                "domain": "Data Reliability & Quality Engineering",
                "subdomain": "Pipeline Reliability Patterns",
                "niche": "Circuit Breakers in Streaming",
                "difficulty": "ARCHITECT",
                "question": "How does the Circuit Breaker pattern prevent corrupted streaming ingestion batches from contaminating downstream Gold marts?",
                "answer": "1. **Closed State (Normal):** Data flows normally from Bronze to Silver to Gold.\n2. **Validation Gate:** In `foreachBatch`, compute error metrics: `error_rate = corrupt_rows / total_rows`.\n3. **Trip Condition (Open State):** If `error_rate > 5%` or if financial reconciliation fails, the circuit breaker **TRIPS OPEN**:\n   - Micro-batch processing pauses or diverts incoming stream to a quarantine sink.\n   - Automated PagerDuty alert fires.\n   - Downstream Gold tables remain locked to prevent serving corrupt KPIs to dashboards.\n4. **Half-Open Recovery:** Once upstream fixes the issue, pipeline processes a small canary batch; if successful, circuit resets to Closed.",
                "linked_concept_id": "system-design"
            },
            {
                "id": "pil20-data-observability-5-pillars",
                "category": "DATA QUALITY & OBSERVABILITY",
                "domain": "Data Reliability & Quality Engineering",
                "subdomain": "Observability & Telemetry",
                "niche": "The 5 Pillars of Data Observability",
                "difficulty": "HARD",
                "question": "Detail the 5 pillars of enterprise Data Observability: Freshness, Distribution, Volume, Schema, and Lineage.",
                "answer": "1. **Freshness:** Is data updating within agreed SLAs? (Tracks `MAX(ingestion_time)` vs `current_timestamp()`).\n2. **Distribution:** Are statistical values healthy? (Monitors mean, median, null rate, and standard deviation shifts).\n3. **Volume:** Did an unexpected row drop occur? (Detects anomalous spikes or drops in daily ingested row counts).\n4. **Schema:** Has a field been renamed, dropped, or changed type? (Tracks transaction log schema evolution).\n5. **Lineage:** When an anomaly occurs, what downstream dashboards are broken, and which upstream service caused it?",
                "linked_concept_id": "system-design"
            },
            {
                "id": "pil20-automated-anomaly-detection-iqr",
                "category": "DATA QUALITY & OBSERVABILITY",
                "domain": "Data Reliability & Quality Engineering",
                "subdomain": "Statistical Data Quality",
                "niche": "Statistical Anomaly Detection (IQR / Z-Score)",
                "difficulty": "HARD",
                "question": "How do you implement automated volume and distribution anomaly detection using Interquartile Range (IQR) in PySpark?",
                "answer": "```python\n# Calculate Q1, Q3 and IQR over 30-day historical table row counts\nquantiles = history_df.approxQuantile(\"row_count\", [0.25, 0.75], 0.01)\nq1, q3 = quantiles[0], quantiles[1]\niqr = q3 - q1\nlower_bound = q1 - 1.5 * iqr\nupper_bound = q3 + 1.5 * iqr\n\ntoday_count = today_df.count()\nif today_count < lower_bound or today_count > upper_bound:\n    raise DataQualityAlert(f\"ANOMALY DETECTED: Ingested {today_count} rows. Expected [{lower_bound}, {upper_bound}]\")\n```\nAdapts dynamically to seasonal trends without hardcoding fragile static threshold numbers.",
                "linked_concept_id": "system-design"
            },
            {
                "id": "pil20-ge-vs-soda-vs-dbt-tests",
                "category": "DATA QUALITY & OBSERVABILITY",
                "domain": "Data Reliability & Quality Engineering",
                "subdomain": "Tool Comparison & Architecture",
                "niche": "Great Expectations vs Soda vs dbt Tests",
                "difficulty": "MEDIUM",
                "question": "Compare Great Expectations vs Soda Core vs dbt Tests for enterprise data quality validation.",
                "answer": "**1. dbt Tests:** Native to the transformation layer. Fast, SQL-based, zero extra infrastructure. Best for in-warehouse relational testing.\n**2. Soda Core:** Lightweight, human-readable YAML assertions (`checks.yml`). Fast CLI execution, easily integrated into CI/CD pipelines, Airflow, and Spark.\n**3. Great Expectations (GX):** Heavyweight, highly customizable Python framework. Generates rich HTML 'Data Docs', supports custom Python expectation suites, profile profiling, and complex multi-source validation.",
                "linked_concept_id": "system-design"
            },
            {
                "id": "pil20-schema-validation-gateways",
                "category": "DATA QUALITY & OBSERVABILITY",
                "domain": "Data Reliability & Quality Engineering",
                "subdomain": "Schema Gateways & API Boundaries",
                "niche": "Schema Validation Gateways",
                "difficulty": "HARD",
                "question": "How do Schema Validation Gateways reject breaking API payloads before they enter event streaming brokers?",
                "answer": "Deploy an API Gateway (Kong / Envoy) or Kafka Schema Registry enforcing JSON Schema or Protobuf validation.\n- **Compatibility Modes:** Configure `FULL_TRANSITIVE` or `BACKWARD_TRANSITIVE` compatibility in Schema Registry.\n- Producers attempting to publish events missing required fields receive HTTP 422 Unprocessable Entity or Kafka `SerializationException`.\n- Prevents malformed records from ever reaching Kafka, eliminating poison pills at the perimeter.",
                "linked_concept_id": "system-design"
            },
            {
                "id": "pil20-cdc-reconciliation-zero-loss",
                "category": "DATA QUALITY & OBSERVABILITY",
                "domain": "Data Reliability & Quality Engineering",
                "subdomain": "Reconciliation & Auditability",
                "niche": "Automated Reconciliation & Replay",
                "difficulty": "ARCHITECT",
                "question": "How do you build an automated reconciliation engine that verifies zero data loss between source OLTP databases and the Lakehouse?",
                "answer": "1. **Cryptographic Checksumming:** Nightly job computes incremental row count and hash checksums over immutable primary key ranges in Postgres/MySQL: `SELECT COUNT(*), SUM(hashtext(id || updated_at)) FROM orders WHERE date = yesterday`.\n2. **Lakehouse Mirror Check:** Compute the identical aggregation in Spark/Delta over the mirrored silver table.\n3. **Diff Verification:** If row counts or checksums mismatch, an automated replay DAG triggers an incremental backfill targeting only the specific mismatched primary key range.",
                "linked_concept_id": "system-design"
            },
            {
                "id": "pil20-freshness-sla-monitoring",
                "category": "DATA QUALITY & OBSERVABILITY",
                "domain": "Data Reliability & Quality Engineering",
                "subdomain": "SLA & Pipeline Lag Monitoring",
                "niche": "Data Freshness SLA Monitoring",
                "difficulty": "MEDIUM",
                "question": "How do you monitor end-to-end data pipeline freshness SLAs across hybrid multi-cloud pipelines?",
                "answer": "```sql\n-- Monitor freshness lag in Delta Lake tables\nSELECT \n  table_name,\n  max_event_timestamp,\n  current_timestamp() AS check_time,\n  TIMESTAMPDIFF(MINUTE, max_event_timestamp, current_timestamp()) AS latency_minutes,\n  CASE \n    WHEN TIMESTAMPDIFF(MINUTE, max_event_timestamp, current_timestamp()) > 30 THEN 'SLA_BREACH'\n    ELSE 'HEALTHY'\n  END AS sla_status\nFROM (\n  SELECT 'silver_orders' AS table_name, MAX(order_timestamp) AS max_event_timestamp FROM silver.orders\n);\n```\nExpose metrics via Prometheus/Grafana or Databricks Lakehouse Monitoring to alert on breaches before downstream BI users notice.",
                "linked_concept_id": "system-design"
            },
            {
                "id": "pil20-delta-check-constraints-vs-quarantine",
                "category": "DATA QUALITY & OBSERVABILITY",
                "domain": "Data Reliability & Quality Engineering",
                "subdomain": "Storage Constraints & Invariants",
                "niche": "Delta Constraints vs Rescued Data",
                "difficulty": "HARD",
                "question": "When should you use Delta Lake CHECK constraints vs a Rescued Data Quarantine pattern?",
                "answer": "**Use Delta CHECK Constraints:** On Gold/Reporting tables where strict transactional integrity is non-negotiable (`CHECK (balance >= 0)`). Any violation aborts the transaction immediately to prevent corrupt reports.\n**Use Rescued Data Quarantine:** On Bronze/Silver ingestion pipelines where external client traffic contains unpredictable errors. Aborting ingestion halts the entire pipeline; quarantining diverts corrupt rows to an audit table while continuing processing for valid data.",
                "linked_concept_id": "lakehouse-table-formats"
            },
            {
                "id": "pil20-silent-corruption-rca-runbook",
                "category": "DATA QUALITY & OBSERVABILITY",
                "domain": "Data Reliability & Quality Engineering",
                "subdomain": "Incident Triage & RCA",
                "niche": "Silent Data Corruption RCA Runbook",
                "difficulty": "ARCHITECT",
                "question": "What is the 5-step Root Cause Analysis (RCA) runbook when a silent data corruption bug is discovered 3 weeks after deployment?",
                "answer": "1. **Triage & Containment (Hour 0-2):** Freeze automated write pipelines to the corrupted table. Identify the exact commit version where the bug was introduced using Delta Lake Time Travel / CDF.\n2. **Blast Radius Analysis (Hour 2-6):** Trace downstream data lineage to catalog every derived table, BI dashboard, and external export affected by the corrupted data.\n3. **Rollback & Hotfix (Hour 6-12):** Deploy code fix to prevent ongoing corruption. Restore clean historical baseline using `RESTORE TABLE ... TO TIMESTAMP AS OF` or branch isolation.\n4. **Historical Backfill (Hour 12-24):** Re-run transformation logic over historical raw Bronze logs to re-materialize clean Silver and Gold datasets.\n5. **Post-Mortem & Prevention:** Author automated regression test (dbt singular test / Soda check) to ensure identical edge-case data patterns trigger automated circuit-breaker halts in the future.",
                "linked_concept_id": "system-design"
            }
        ]
    }
}
