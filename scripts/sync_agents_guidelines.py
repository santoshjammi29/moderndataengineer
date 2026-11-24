#!/usr/bin/env python3
"""
Syndicate CI/CD Quality Gates & Invariants block into AGENTS.md of all sister repositories.
"""

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

REPOS_WITH_AGENTS = [
    "azure-cheat-sheet",
    "azure-databricks-project-blueprints",
    "data-engineering-interview-handbook",
    "data-system-design-handbook",
    "databricks-handbook",
    "dataops-cicd-handbook",
    "dbt-handbook",
    "enterprise-banking-risk-alm-lakehouse",
    "pyspark-handbook",
    "security-handbook",
    "spark-experiments",
    "sql-handbook",
    "streaming-handbook",
]

CI_GATE_BLOCK = """
---

## 5. Multi-Repository CI/CD Quality Gates & Mistake Prevention
- **The Pre-Flight Test Invariant**: Never execute `git push` on `main` without running the local test runner (`python3 scripts/run_tests.py`, `python3 scripts/validate_notebooks.py`, or `pytest tests/`).
- **52 Whiteboard Blueprint Invariant**: The repository strictly enforces `len(assets/whiteboards/*.webp) == 52`. Never add non-canonical alias files (`enterprise_edge_client_architecture`, `data_edge_client_architecture`, `open_file_formats_storage`, `open_table_formats_lakehouse`) into `assets/whiteboards/`.
- **Mermaid Diagram Parser Rules**:
  - **No Unquoted Parentheses in Link Labels**: `-->|Label (text)|` fails syntax parsing. Use `-->|"Label (text)"|` or `-->|Label: text|`.
  - **No Raw Comparison Operators**: Never use `<`, `>`, or `<=` in labels (`-->|< 100 GB|` fails). Spell out (`under 100 GB`, `above 0.85`) or escape as `&lt;` / `&gt;`.
  - **No Semicolons in sequenceDiagram Notes**: In `sequenceDiagram`, `;` terminates the command. Use commas or colons (`Note over Sorter: Memory full, spilling to disk`).
  - **Escape Literal Dollar Signs**: Use `\\$` in prose and diagrams to prevent math-mode parsing conflicts.
- **Markdown Relative Link Resolution**: Verify link path relative to the document's directory depth. Never assume repository root. For cross-repo links, use canonical GitHub URLs.
- **Python Pip Cache Invariant**: Workflows with `cache: "pip"` MUST have a valid root `requirements.txt`.
- **Databricks Notebook AST Validation**: All `.py` source notebooks must parse cleanly via `ast.parse()` using `python3 scripts/validate_notebooks.py`.
- **Skill Reference**: Activate the agent skill `ecosystem-ci-cd-quality-gate` for multi-repository invariant defense protocols.
"""

def sync():
    for repo in REPOS_WITH_AGENTS:
        agents_file = BASE_DIR / repo / "AGENTS.md"
        if not agents_file.exists():
            continue
        content = agents_file.read_text(encoding="utf-8")
        if "## 5. Multi-Repository CI/CD Quality Gates" in content:
            # Replace existing section
            header_idx = content.find("## 5. Multi-Repository CI/CD Quality Gates")
            # find preceding separator if present
            sep_idx = content.rfind("---", 0, header_idx)
            start_idx = sep_idx if sep_idx != -1 else header_idx
            content = content[:start_idx].rstrip() + "\n" + CI_GATE_BLOCK.strip() + "\n"
        else:
            content = content.rstrip() + "\n" + CI_GATE_BLOCK.strip() + "\n"
        agents_file.write_text(content, encoding="utf-8")
        print(f"  ✓ Updated {repo}/AGENTS.md")

if __name__ == "__main__":
    sync()
