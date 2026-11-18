# Pillar 11: Python for Data Engineering & High-Performance Pipelines
**Category:** `PYTHON` | **Domain:** `Software Engineering & Data Processing`

---

### Q1: Explain Python's memory management: Reference Counting and the Cyclic Garbage Collector.

**Difficulty:** `HARD` | **Niche:** `Python Internals & Memory`

**Direct 30-Second Answer:**
Python manages memory using two collaborative systems:
1. **Reference Counting:** Every Python object contains an internal `ob_refcnt` counter. When an object is referenced, counter increments; when a variable goes out of scope or is deleted, it decrements. When `ob_refcnt == 0`, the memory is immediately freed.
2. **Cyclic Garbage Collector (Generations 0, 1, 2):** Reference counting fails to detect reference cycles (Object A references B, and B references A). The cyclic GC inspects container objects (lists, dicts, custom classes), organizes them into 3 age generations, and breaks isolated reference cycles.

---

### Q2: Why are Python Generators (`yield`) essential for processing massive multi-gigabyte files on memory-constrained workers?

**Difficulty:** `MEDIUM` | **Niche:** `Generators & Iterators`

**Direct 30-Second Answer:**
Reading a 20 GB CSV file into memory using `file.readlines()` or standard lists loads all 20 GB into RAM at once, triggering an immediate OS OOM crash.
- **Generators (`yield`):** Maintain execution state lazily, yielding exactly **one record at a time** on-demand.
- **Memory Footprint:** Memory consumption remains constant ($O(1)$ memory $\approx 4\text{KB}$ buffer) regardless of whether the file contains 1,000 lines or 1,000,000,000 lines.

---

### Q3: Explain the Global Interpreter Lock (GIL) and when to use Threading vs Multiprocessing vs AsyncIO.

**Difficulty:** `HARD` | **Niche:** `Concurrency & The GIL`

**Selection Framework:**
- **The GIL:** A mutex lock that prevents multiple native OS threads from executing Python bytecodes simultaneously in a single process.
- **`threading`:** Best for **I/O-bound** tasks (downloading files, waiting for REST API responses, database queries). The GIL is released during OS socket I/O calls.
- **`multiprocessing`:** Best for **CPU-bound** tasks (heavy regex, compression, mathematical hashing). Bypasses the GIL by spawning separate Python interpreter processes with isolated memory spaces.
- **`asyncio`:** Best for massive concurrent I/O connections (e.g. querying 5,000 REST APIs asynchronously using a single-threaded event loop with non-blocking sockets).

---

### Q4: What is Apache Arrow (`pyarrow`), and how does it achieve zero-copy data sharing between Python and C/C++ engines?

**Difficulty:** `HARD` | **Niche:** `PyArrow & Columnar Memory`

**Direct 30-Second Answer:**
Apache Arrow defines a standardized, language-independent columnar in-memory format:
- **Zero-Copy Sharing:** Multiple runtimes (Python, Rust Polars, C++ DuckDB, JVM Spark) can map directly to the same shared memory buffer without serializing or copying bytes.
- **CPU Cache Alignment:** Stores columnar arrays in 64-byte aligned contiguous memory blocks, maximizing CPU SIMD vectorization.

---

### Q5: Compare Polars vs Pandas 2.0: memory usage, lazy evaluation, and multi-threaded execution.

**Difficulty:** `HARD` | **Niche:** `Polars vs Pandas`

**Comparison Matrix:**
- **Polars:** Written in Rust on top of Apache Arrow. Fully multi-threaded out-of-the-box (utilizes all CPU cores). Features a **Lazy API** (`lazy().collect()`) with a query optimizer that applies predicate pushdown and projection pruning before execution.
- **Pandas 2.0:** Primarily single-threaded. Python GIL constraints limit parallelism. Even with PyArrow backends, it evaluates expressions eagerly, consuming significantly more memory on intermediate transformations.

---

### Q6: Write a custom Python Context Manager using both class-based (`__enter__`, `__exit__`) and generator (`@contextmanager`) approaches.

**Difficulty:** `MEDIUM` | **Niche:** `Context Managers & Resources`

**Production Python Code:**
```python
# Approach 1: Class-based
class DatabaseConnection:
    def __enter__(self):
        self.conn = pool.get_connection()
        return self.conn
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.conn.close()
        return False # Propagate exceptions

# Approach 2: Generator Decorator
from contextlib import contextmanager

@contextmanager
def managed_cursor():
    conn = pool.get_connection()
    cursor = conn.cursor()
    try:
        yield cursor
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()
```

---

### Q7: Author a robust Python decorator that implements exponential backoff retries for transient database network failures.

**Difficulty:** `MEDIUM` | **Niche:** `Decorators & Resilience`

**Production Decorator:**
```python
import time
import functools
import logging

def retry_with_backoff(retries=3, backoff_in_seconds=1):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            x = 0
            while True:
                try:
                    return func(*args, **kwargs)
                except (ConnectionError, TimeoutError) as e:
                    if x == retries:
                        raise e
                    sleep_duration = (backoff_in_seconds * 2 ** x)
                    logging.warning(f'Retrying {func.__name__} in {sleep_duration}s due to {e}')
                    time.sleep(sleep_duration)
                    x += 1
        return wrapper
    return decorator
```

---

### Q8: How do you enforce Data Contracts and schema validation in Python pipelines using Pydantic V2?

**Difficulty:** `MEDIUM` | **Niche:** `Data Contracts & Pydantic`

**Production Code:**
```python
from pydantic import BaseModel, Field, field_validator
from datetime import datetime

class OrderContract(BaseModel):
    order_id: str
    customer_id: str
    amount: float = Field(gt=0, description='Amount must be strictly positive')
    order_timestamp: datetime
    currency: str

    @field_validator('currency')
    def validate_currency(cls, v):
        allowed = {'USD', 'EUR', 'GBP'}
        if v not in allowed:
            raise ValueError(f'Currency {v} not in supported list {allowed}')
        return v
```

---

### Q9: Why is `uv` revolutionizing Python dependency management for containerized data pipelines?

**Difficulty:** `MEDIUM` | **Niche:** `Python Tooling & uv`

**Direct 30-Second Answer:**
`uv` is an extremely fast Python package installer and resolver written in **Rust** by the Astral team:
- **$10\times \text{ to } 100\times$ Faster than `pip`:** Installs packages in milliseconds using global content-addressable caches and copy-on-write (reflink) file cloning.
- **Deterministic Resolution:** Resolves universal `uv.lock` files across platforms, dramatically speeding up Docker container build times in CI/CD data pipelines.

---

### Q10: When should you introduce Cython or Rust PyO3 extensions to eliminate Python computation bottlenecks?

**Difficulty:** `HARD` | **Niche:** `C-Extensions & PyO3`

**Direct 30-Second Answer:**
When tight numeric loops, custom hashing, or binary parsing consume 90%+ of pipeline CPU time and cannot be expressed as vectorized NumPy/Polars operations:
- Compiling algorithms via Cython or Rust PyO3 compiles the logic directly to native C machine instructions, eliminating dynamic Python type checking and bytecode overhead, providing a **$50\times \text{ to } 200\times$ performance increase**.

---
