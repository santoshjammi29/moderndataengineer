> 🧭 **Modern Data Engineering Ecosystem Navigation**
> - 📘 **Architecture & Concept:** [Data System Design — Lakehouse Architecture](https://github.com/santoshjammi29/data-system-design-handbook/tree/main/modules/01_lakehouse_and_medallion_architecture)
> - 💻 **Hands-On Recipe:** [Databricks Handbook — 105 Production Recipes](https://github.com/santoshjammi29/databricks-handbook)
> - 🔬 **Empirical Lab:** [Spark Experiments — Empirical Laboratory](https://github.com/santoshjammi29/spark-experiments)
> - 🚨 **Incident Runbook:** [PySpark Performance & Triage Runbooks](https://github.com/santoshjammi29/pyspark-handbook/tree/main/runbooks)
> - 🎯 **Interview Defense:** [Interview Handbook Master Guide](https://github.com/santoshjammi29/data-engineering-interview-handbook/blob/main/pillars/all_20_pillars_master_guide.md) *(You are here)*
> - 🌐 **Interactive Web Practice:** [Practice on moderndataengineer.uk](https://moderndataengineer.uk/practice)

# Pillar 18: GenAI, Vector Search & Lakehouse Embeddings
**Category:** `GENAI & VECTOR DATA ENGINEERING` | **Domain:** `GenAI & Vector Platforms`

---

### Q1: Compare Hierarchical Navigable Small World (HNSW) vs Inverted File Product Quantization (IVF-PQ) vector indexes.

**Difficulty:** `HARD` | **Niche:** `HNSW vs IVF-PQ Vector Indexing`

**1. HNSW (Graph-Based):**
- Constructs a multi-layer graph of vectors where upper layers have long-distance edges and lower layers have dense short-distance edges.
- *Recall & Speed:* Exceptionally high recall (> 98%) and sub-5ms query latency.
- *Memory:* High memory footprint (stores raw vectors and graph pointers in RAM).
**2. IVF-PQ (Quantization-Based):**
- Inverted File (IVF) clusters vectors into Voronoi cells; Product Quantization (PQ) compresses high-dimensional floating-point vectors into compact byte codes.
- *Recall & Speed:* Moderate recall (85-95%); significantly lower memory (up to 95% RAM compression).
- *Scale:* Ideal for billion-vector datasets that exceed available cluster memory.

---

### Q2: How does Databricks Vector Search synchronize vector indexes with Delta Lake tables in real time?

**Difficulty:** `HARD` | **Niche:** `Databricks Vector Search Architecture`

Databricks Vector Search provides two ingestion modes:
1. **Delta Sync Index:** Vector Search monitors the source Delta Lake table's Change Data Feed (CDF). When new rows are inserted, updated, or deleted in Delta, Vector Search automatically updates the underlying HNSW index in the background without manual re-indexing.
2. **Direct-Access Index:** Allows REST APIs to insert vectors directly for real-time applications.
Enables Unity Catalog governance, column-level masking, and ACLs on vector embeddings identical to relational tables.

---

### Q3: Compare Fixed-Size Chunking with Overlap vs Recursive Semantic Chunking for enterprise RAG pipelines.

**Difficulty:** `MEDIUM` | **Niche:** `Text Chunking Strategies for RAG`

**1. Fixed-Size Chunking (e.g. 512 tokens with 50-token overlap):** Fast, simple, uniform vector size. *Flaw:* Slices sentences midway, splitting crucial context across chunk boundaries.
**2. Recursive Semantic Chunking:** Splits text hierarchically using natural document delimiters (markdown headers `##`, paragraphs `\n\n`, sentences, words).
- Preserves complete thoughts and semantic coherence within chunks.
- Attaches parent document metadata (section title, document version, author) to each chunk to enhance retrieval filtering.

---

### Q4: How do you vectorize 100 million document chunks in PySpark using GPU-accelerated Pandas UDFs?

**Difficulty:** `HARD` | **Niche:** `Distributed Embedding Pipelines`

```python
import pandas as pd
from pyspark.sql.functions import pandas_udf
import torch
from sentence_transformers import SentenceTransformer

# Initialize model once per worker GPU process:
device = "cuda" if torch.cuda.is_available() else "cpu"
model = SentenceTransformer("BAAI/bge-large-en-v1.5", device=device)

@pandas_udf("array<float>")
def compute_embeddings(texts: pd.Series) -> pd.Series:
    embeddings = model.encode(texts.tolist(), batch_size=256, normalize_embeddings=True)
    return pd.Series(list(embeddings))

# Tune batch size to avoid GPU Out-Of-Memory:
spark.conf.set("spark.sql.execution.arrow.maxRecordsPerBatch", "1024")

df_chunks.withColumn("vector", compute_embeddings("chunk_text")) \
         .write.format("delta").saveAsTable("gold.document_vectors")
```

---

### Q5: How does Semantic Caching reduce enterprise LLM API expenditure by up to 70%?

**Difficulty:** `MEDIUM` | **Niche:** `Semantic Caching Architecture`

**Exact String Caching Flaw:** Prompts like 'What is our return policy?' and 'How do I return an item?' have different strings, resulting in cache misses in Redis.
**Semantic Caching:**
1. Inbound user prompt is converted into an embedding vector.
2. Query the vector cache (e.g. Redis VSS or Qdrant) for cosine similarity $> 0.95$.
3. If a semantic match is found, return the cached LLM response in < 15ms with 0 token spend.
4. If no match is found, invoke the LLM, serve the user, and store prompt vector + response in the cache.

---

### Q6: Why is Hybrid Search (BM25 Keyword Search + Dense Vector Search) superior to pure vector search for RAG?

**Difficulty:** `HARD` | **Niche:** `Hybrid Search (BM25 + Dense Vectors)`

**Pure Vector Search Flaw:** Dense embeddings struggle with exact lexical matches: serial numbers, acronyms, product SKUs (`SKU-49102-X`), and domain-specific terminology.
**Hybrid Search Architecture:**
1. **Sparse Search (BM25 / Splade):** Scores exact keyword and token frequency.
2. **Dense Search (Cosine Similarity):** Scores conceptual, semantic meaning.
3. **Reciprocal Rank Fusion (RRF):** Combines results from both retrievers using rank scoring: $RRF(d) = \sum \frac{1}{60 + r_i(d)}$.
Guarantees high relevance across both semantic concepts and exact product/ID lookups.

---

### Q7: How do you manage embedding model upgrades and vector re-indexing on a 50TB Delta lakehouse without downtime?

**Difficulty:** `ARCHITECT` | **Niche:** `Embedding Drift & Model Migrations`

Embeddings from different models (e.g. OpenAI `text-embedding-ada-002` [1536 dim] vs `text-embedding-3-large` [3072 dim]) live in completely incompatible vector spaces. Comparing them produces garbage similarity scores.
**Zero-Downtime Migration Blueprint:**
1. Add a versioned vector column to Delta table: `vector_v2 ARRAY<FLOAT>`.
2. Run a background Spark GPU batch job to compute `vector_v2` for all document chunks.
3. Build a shadow Vector Search index on `vector_v2`.
4. Route staging RAG traffic to shadow index for evaluation.
5. Atomic blue-green cutover: Update query service config to target index v2; drop legacy `vector_v1` column via Delta Column Mapping.

---

### Q8: Compare Pre-Filtering, Post-Filtering, and Single-Stage Filtering in Vector Search.

**Difficulty:** `HARD` | **Niche:** `Pre-Filtering vs Single-Stage Search`

**1. Post-Filtering:** Execute vector search first ($K$ nearest neighbors), then filter results by metadata (`tenant_id = 'acme'`). *Flaw:* If top 100 results belong to other tenants, post-filtering returns 0 results.
**2. Pre-Filtering:** Filter by metadata first, then search vectors within the candidate subset. *Flaw:* Can be slow if the metadata filter returns millions of candidates.
**3. Single-Stage Filtering (Modern Standard):** HNSW graph traversal evaluates the metadata filter dynamically while traversing graph nodes, pruning unpermitted edges immediately. Delivers high recall and low latency.

---

### Q9: How do you store and index multimodal data (audio, image, video) in Delta Lake for cross-modal similarity search?

**Difficulty:** `HARD` | **Niche:** `Multimodal Embeddings in Delta Tables`

- Store raw media binaries (JPEG, MP4) in cloud object storage; store canonical URIs in Bronze Delta table.
- Extract joint multimodal embeddings using models like CLIP (Contrastive Language-Image Pretraining).
- Project both image vectors and text descriptions into the **same shared embedding space**.
- Querying with natural language ('Find red sports cars in video feed') computes text vector, queries image vectors in Delta Vector Search, and retrieves matching video timestamps in milliseconds.

---

### Q10: How do you implement automated PII redaction and compliance guardrails before embedding customer documents?

**Difficulty:** `ARCHITECT` | **Niche:** `PII Redaction in LLM Ingestion`

1. **Token-Level Entity Detection:** Run Microsoft Presidio or SpaCy NER inside PySpark streaming ingestion to detect SSNs, emails, credit cards, and names.
2. **Replacement / Encryption:** Replace PII with anonymized surrogate tokens (`<CUSTOMER_EMAIL_HASH>`) or encrypt with tenant-specific format-preserving encryption (FPE).
3. **Audit Log:** Record redaction metadata in a secure audit Delta table.
4. **Embedding Stage:** Pass only sanitized text to the embedding model, ensuring that private PII is mathematically impossible to reconstruct from vector weights.

---
