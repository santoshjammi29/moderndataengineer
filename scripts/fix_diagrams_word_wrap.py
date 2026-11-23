#!/usr/bin/env python3
"""
fix_diagrams_word_wrap.py
Audits and remediates diagram word-wrapping, unescaped HTML characters, and text truncation
across all Mermaid diagrams and diagram generators in the lakehouse ecosystem.

Key Remediation Invariants:
1. Revert any accidental `<br/>` or `<br/>` back to `<br/>`.
2. Split segments on `\\n` or `<br/>` before escaping so `<br/>` is never touched by `>` escaping.
3. Escape unescaped `<` comparisons (e.g. `< 200ms`, `< 1MB`, `< 85%`, `< 2s`, `< 1s`) to `&lt;`.
4. Escape `>` comparison operators to `&gt;` without matching `->`, `-->`, `==>`, or `/>`.
5. Word-wrap long node text (>34 chars) and edge labels (>30 chars) using `<br/>` at clean word boundaries.
6. Support multi-line quoted shapes [("...")], (["..."]), (("...")), {{"..."}}, ["..."], {"..."}, ("...").
7. Process all .md files in all 14 repositories, JSON datasets in charming-fermi, and Python generator scripts.
"""

import json
import os
import re
import sys
import textwrap

REPOSITORIES = [
    "charming-fermi",
    "databricks-handbook",
    "pyspark-handbook",
    "sql-handbook",
    "dbt-handbook",
    "streaming-handbook",
    "dataops-cicd-handbook",
    "data-system-design-handbook",
    "data-engineering-interview-handbook",
    "azure-cheat-sheet",
    "azure-databricks-project-blueprints",
    "enterprise-banking-risk-alm-lakehouse",
    "spark-experiments",
    "security-handbook",
]

TARGET_JSON_FILES = [
    "charming-fermi/src/data/json/questions.json",
    "charming-fermi/src/data/json/data_architecture.json",
    "charming-fermi/src/data/json/search_catalog.json",
    "charming-fermi/src/data/guided-topics-cache.json",
]

GENERATOR_SCRIPTS = [
    "charming-fermi/scripts/data_patches/patch_airflow_1_to_35.py",
    "charming-fermi/scripts/data_patches/patch_airflow_36_to_75.py",
    "charming-fermi/scripts/data_patches/patch_architect_airflow.py",
    "charming-fermi/scripts/data_patches/patch_architect_core.py",
    "charming-fermi/scripts/data_patches/patch_architect_databricks.py",
    "charming-fermi/scripts/data_patches/patch_architect_dbt.py",
    "charming-fermi/scripts/data_patches/patch_dbt_1_to_35.py",
    "charming-fermi/scripts/data_patches/patch_dbt_36_to_75.py",
    "charming-fermi/scripts/extreme_edge_cases_data.py",
    "charming-fermi/scripts/generate_architect_airflow.py",
    "charming-fermi/scripts/generate_architect_databricks.py",
    "charming-fermi/scripts/generate_architect_dbt.py",
    "charming-fermi/scripts/upgrade_production_runbooks.py",
    "databricks-handbook/scripts/build_readme.py",
    "pyspark-handbook/scripts/generate_readme.py",
    "sql-handbook/scripts/build_readme.py",
]


def clean_mermaid_label(text: str, max_len: int = 34) -> str:
    """
    Cleans, escapes, and word-wraps a Mermaid node or edge label.
    Splits on \\n or <br/> first so <br/> is never touched by > escaping.
    """
    # 0. Revert any accidental <br/> or <br/> back to clean <br/>
    text = text.replace("<br" + "/&gt;", "<br/>").replace("<br" + "&gt;", "<br/>")

    # 1. Split by literal \n or existing <br/>
    segments = re.split(r"\\n|<br\s*/?>", text)
    wrapped_segments = []

    for seg in segments:
        seg = seg.strip()
        if not seg:
            continue

        # 2. Escape unescaped < comparisons (e.g. < 200ms, < 1MB, < 85%, < 2s, < 1s, < 2MB, <= 0.85)
        # Protect structural arrows <-->, <--, <==>, <|--
        seg = re.sub(r"<(?!(?:--|==|\|--))", "&lt;", seg)

        # 3. Escape > when used as comparison (e.g. > 10 MB, >= Start, >85%, > 0.85)
        # Protect arrows ->, -->, ==>, and closing tag delimiters
        seg = re.sub(r"(?<![-=/\&])>(?=(?:\s*\d|\s*=|\s+[a-zA-Z]))", "&gt;", seg)

        # 4. Word-wrap if segment exceeds max_len
        if len(seg) <= max_len:
            wrapped_segments.append(seg)
        else:
            wrapped = textwrap.wrap(seg, width=max_len, break_long_words=False, break_on_hyphens=False)
            if wrapped:
                wrapped_segments.extend(wrapped)
            else:
                wrapped_segments.append(seg)

    return "<br/>".join(wrapped_segments)


def process_mermaid_code(code: str) -> str:
    """
    Parses and cleans all node shapes, link labels, subgraphs, and notes in a Mermaid diagram.
    """
    # Normalize any accidental br gt in raw code
    code = code.replace("<br" + "/&gt;", "<br/>").replace("<br" + "&gt;", "<br/>")
    lines = code.splitlines()
    new_lines = []
    is_gantt = "gantt" in code

    for line in lines:
        # Gantt chart tasks
        if is_gantt or any(k in line for k in [":a", ":b", ":c", ":d"]):
            line = re.sub(r"<(\d+)", r"under \1", line)

        # Sequence diagram notes: Note over / Note left of / Note right of
        if re.match(r"^\s*Note\s+(?:over|left of|right of)", line):
            line = re.sub(r"<(?!(?:br\s*/?>|--|==))", "&lt;", line)
            new_lines.append(line)
            continue

        # Sequence diagram messages: A->>B: message, A-->>B: message, etc.
        m_seq = re.match(r"^(\s*[a-zA-Z0-9_-]+\s*(?:->>|-->>|->|-->)\s*[a-zA-Z0-9_-]+\s*:\s*)(.*)$", line)
        if m_seq:
            prefix, msg = m_seq.groups()
            msg_clean = re.sub(r"<(?!(?:br\s*/?>|--|==))", "&lt;", msg)
            new_lines.append(f"{prefix}{msg_clean}")
            continue

        # Subgraphs: subgraph ID ["Title"] or subgraph ID [Title]
        m_sub = re.match(r"^(\s*subgraph\s+[a-zA-Z0-9_-]+\s*\[\")(.*)(\"\]\s*)$", line)
        if m_sub:
            prefix, title, suffix = m_sub.groups()
            title_clean = clean_mermaid_label(title, max_len=45)
            new_lines.append(f"{prefix}{title_clean}{suffix}")
            continue

        m_sub_unq = re.match(r"^(\s*subgraph\s+[a-zA-Z0-9_-]+\s*\[)([^\"\]]+)(\]\s*)$", line)
        if m_sub_unq:
            prefix, title, suffix = m_sub_unq.groups()
            title_clean = clean_mermaid_label(title, max_len=45)
            new_lines.append(f"{prefix}\"{title_clean}\"{suffix}")
            continue

        # 1. Quoted node shapes:
        # ID[("...")], ID(["..."]), ID(("...")), ID{{"..."}}, ID[/"..."/], ID[\"..."\], ID["..."], ID{"..."}, ID("...")
        def repl_node_quoted(m):
            node_id = m.group(1)
            open_b = m.group(2)
            inner = m.group(3)
            close_b = m.group(4)
            cleaned = clean_mermaid_label(inner, max_len=34)
            return f"{node_id}{open_b}\"{cleaned}\"{close_b}"

        pattern_quoted = (
            r'\b([a-zA-Z0-9_-]+)\s*'
            r'(\[\(|\(\[|\(\(|\{\{|\[/|\[\\|\[|\{|\()\s*'
            r'\"([^\"]+)\"\s*'
            r'(\)\]|\]\)|\)\)|\}\}|/\]|\\\]|\]|\}|\))'
        )
        line = re.sub(pattern_quoted, repl_node_quoted, line)

        # 2. Unquoted decision braces with comparisons or long text: e.g. Q1{Is latency < 500ms?}
        def repl_unq_brace(m):
            node_id = m.group(1)
            inner = m.group(2).strip()
            if "<" in inner or ">" in inner or len(inner) > 34:
                cleaned = clean_mermaid_label(inner, max_len=34)
                return f"{node_id}{{\"{cleaned}\"}}"
            return m.group(0)
        line = re.sub(r'\b([a-zA-Z0-9_-]+)\{([^\"\{\}]+)\}', repl_unq_brace, line)

        # 3. Unquoted cylinder: OneLake[(OneLake Storage)]
        def repl_unq_cylinder(m):
            node_id = m.group(1)
            inner = m.group(2).strip()
            if "<" in inner or ">" in inner or len(inner) > 34 or any(c in inner for c in ['(', ')', '/', '&', ':']):
                cleaned = clean_mermaid_label(inner, max_len=34)
                return f"{node_id}[(\"{cleaned}\")]"
            return m.group(0)
        line = re.sub(r'\b([a-zA-Z0-9_-]+)\[\(([^\"\[\]\(\)]+)\)\]', repl_unq_cylinder, line)

        # 4. Quoted link labels: -->|"..."| or -.->|"..."| or ==>|"..."| or ---|"..."|
        def repl_link_q(m):
            prefix, inner, suffix = m.groups()
            cleaned = clean_mermaid_label(inner, max_len=30)
            return f"{prefix}\"{cleaned}\"{suffix}"
        line = re.sub(r'(-->\||-\.->\||==>\||---\||\s*--\s*\|)\"([^\"]+)\"(\|)', repl_link_q, line)

        # 5. Unquoted link labels: -->|...| or -.->|...| or ==>|...| or ---|...|
        def repl_link_noq(m):
            prefix, inner, suffix = m.groups()
            if "<" in inner or ">" in inner or len(inner) > 30 or any(c in inner for c in ['(', ')', '/', '&', ':']):
                cleaned = clean_mermaid_label(inner, max_len=30)
                return f"{prefix}\"{cleaned}\"{suffix}"
            return m.group(0)
        line = re.sub(r'(-->\||-\.->\||==>\||---\||\s*--\s*\|)([^\"\|\n]+)(\|)', repl_link_noq, line)

        # 6. Quoted open links: Vol -- "< 100 GB..." -->
        def repl_open_link_q(m):
            inner = m.group(1)
            arrow = m.group(2)
            cleaned = clean_mermaid_label(inner, max_len=30)
            return f"-- \"{cleaned}\" {arrow}"
        line = re.sub(r'(?<!-)--\s*\"([^\"]+)\"\s*(-->|---|==>)', repl_open_link_q, line)

        # 7. Unquoted open links: Vol -- < 100 GB... -->
        def repl_open_link_unq(m):
            inner = m.group(1)
            arrow = m.group(2)
            if "<" in inner or ">" in inner or len(inner) > 30:
                cleaned = clean_mermaid_label(inner, max_len=30)
                return f"-- \"{cleaned}\" {arrow}"
            return m.group(0)
        line = re.sub(r'(?<!-)--\s+([a-zA-Z0-9_][^\"\n\->]*?)\s+(-->|---|==>)', repl_open_link_unq, line)

        new_lines.append(line)
    return "\n".join(new_lines)


def process_text_content(content: str) -> str:
    """Processes any text containing ```mermaid blocks and reverts accidental <br/>."""
    # Revert accidental br gt
    content = content.replace("<br" + "/&gt;", "<br/>").replace("<br" + "&gt;", "<br/>")

    def repl_block(m):
        code = m.group(1).strip()
        processed = process_mermaid_code(code)
        return f"```mermaid\n{processed}\n```"

    return re.sub(r"```mermaid([\s\S]*?)```", repl_block, content)


def process_markdown_file(file_path: str) -> bool:
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return False

    new_content = process_text_content(content)

    if new_content != content:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        return True
    return False


def process_python_file(file_path: str) -> bool:
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return False

    new_content = process_text_content(content)

    if new_content != content:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        return True
    return False


def process_json_file(file_path: str) -> bool:
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            raw_content = f.read()
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return False

    # Check if file has 2-space indentation or compact
    is_compact = not raw_content.startswith("[\n  ") and not raw_content.startswith("{\n  ")

    try:
        data = json.loads(raw_content)
    except Exception as e:
        print(f"Error parsing JSON {file_path}: {e}")
        return False

    modified = False

    def transform_value(val):
        nonlocal modified
        if isinstance(val, str):
            if ("<br" + "/&gt;") in val or ("<br" + "&gt;") in val or "```mermaid" in val:
                new_val = process_text_content(val)
                if new_val != val:
                    modified = True
                    return new_val
            return val
        elif isinstance(val, list):
            return [transform_value(item) for item in val]
        elif isinstance(val, dict):
            return {k: transform_value(v) for k, v in val.items()}
        return val

    new_data = transform_value(data)

    if modified:
        with open(file_path, "w", encoding="utf-8") as f:
            if is_compact:
                json.dump(new_data, f, ensure_ascii=False, separators=(",", ":"))
            else:
                json.dump(new_data, f, indent=2, ensure_ascii=False)
                f.write("\n")
        return True
    return False


def revert_br_gt_in_all_files(base_dir: str):
    """Reverts any accidental <br/> or <br/> across all text files."""
    print("🧹 Scanning for accidental <br/> and <br/> across all repositories...")
    reverted_count = 0
    total_tags_reverted = 0

    target_bad_1 = "<br" + "/&gt;"
    target_bad_2 = "<br" + "&gt;"

    for repo in REPOSITORIES:
        repo_dir = os.path.join(base_dir, repo)
        if not os.path.isdir(repo_dir):
            continue
        for root, dirs, files in os.walk(repo_dir):
            dirs[:] = [
                d
                for d in dirs
                if d not in [".git", "node_modules", ".next", ".open-next", "dist", "build", ".venv", "__pycache__"]
            ]
            for file in files:
                ext = os.path.splitext(file)[1].lower()
                if ext in [".md", ".json", ".py", ".ts", ".tsx", ".sql", ".yaml", ".yml"]:
                    full_path = os.path.join(root, file)
                    try:
                        with open(full_path, "r", encoding="utf-8") as f:
                            content = f.read()
                        if target_bad_1 in content or target_bad_2 in content:
                            tags = content.count(target_bad_1) + content.count(target_bad_2)
                            new_content = content.replace(target_bad_1, "<br/>").replace(target_bad_2, "<br/>")
                            with open(full_path, "w", encoding="utf-8") as f:
                                f.write(new_content)
                            reverted_count += 1
                            total_tags_reverted += tags
                    except Exception:
                        pass
    print(f"  ✓ Reverted {total_tags_reverted} accidental tags across {reverted_count} files.\n")


def main():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    if not os.path.exists(os.path.join(base_dir, "charming-fermi")):
        base_dir = "/Users/santosh/Documents/antigravity"

    print(f"🚀 Scanning ecosystem repositories at: {base_dir}")

    # Step 1: Revert all accidental <br/> and <br/> across all repositories
    revert_br_gt_in_all_files(base_dir)

    # Step 2: Process all .md files in all 14 repositories
    total_md_modified = 0
    print("📝 Processing Markdown files across 14 repositories...")
    for repo in REPOSITORIES:
        repo_dir = os.path.join(base_dir, repo)
        if not os.path.isdir(repo_dir):
            continue
        repo_modified = 0
        for root, dirs, files in os.walk(repo_dir):
            dirs[:] = [
                d
                for d in dirs
                if d not in [".git", "node_modules", ".next", ".open-next", "dist", "build", ".venv", "__pycache__"]
            ]
            for file in files:
                if file.endswith(".md"):
                    full_path = os.path.join(root, file)
                    if process_markdown_file(full_path):
                        repo_modified += 1
                        total_md_modified += 1
        print(f"  ✓ {repo}: {repo_modified} markdown files updated")
    print(f"Total markdown files updated: {total_md_modified}\n")

    # Step 3: Process target JSON files in charming-fermi
    print("📦 Processing target JSON dataset files...")
    json_modified = 0
    for rel_path in TARGET_JSON_FILES:
        full_path = os.path.join(base_dir, rel_path)
        if os.path.isfile(full_path):
            if process_json_file(full_path):
                print(f"  ✓ Updated {rel_path}")
                json_modified += 1
            else:
                print(f"  - No changes needed in {rel_path}")
        else:
            print(f"  ⚠️ File not found: {full_path}")
    print(f"Total JSON files updated: {json_modified}\n")

    # Step 4: Process Python generator scripts
    print("🐍 Processing Python generator scripts...")
    py_modified = 0
    for rel_path in GENERATOR_SCRIPTS:
        full_path = os.path.join(base_dir, rel_path)
        if os.path.isfile(full_path):
            if process_python_file(full_path):
                print(f"  ✓ Updated {rel_path}")
                py_modified += 1
            else:
                print(f"  - No changes needed in {rel_path}")
        else:
            print(f"  ⚠️ Script not found: {full_path}")
    print(f"Total Python generator scripts updated: {py_modified}\n")

    print("🎉 All diagram word wrapping and escaping updates completed successfully!")


if __name__ == "__main__":
    main()
