#!/usr/bin/env python3
"""
Compacts all markdown (.md) files across the 15 repositories:
1. Strips trailing whitespace from lines (preserving intentional markdown double-space line breaks where applicable).
2. Collapses excessive blank lines (3+ consecutive newlines reduced to 2 newlines).
3. Ensures every markdown file ends with a single trailing newline.
4. Preserves code block indentation and semantics.
"""

import os
import re
import sys

BASE_DIR = "/Users/santosh/Documents/antigravity"
REPOSITORIES = [
    "SantoshJammiProfile",
    "azure-cheat-sheet",
    "azure-databricks-project-blueprints",
    "data-engineering-interview-handbook",
    "data-system-design-handbook",
    "databricks-handbook",
    "dataops-cicd-handbook",
    "dbt-handbook",
    "enterprise-banking-risk-alm-lakehouse",
    "charming-fermi",
    "pyspark-handbook",
    "security-handbook",
    "spark-experiments",
    "sql-handbook",
    "streaming-handbook",
]

def compact_markdown(text: str) -> str:
    lines = text.splitlines()
    compacted_lines = []
    in_code_block = False

    for line in lines:
        stripped = line.strip()
        if stripped.startswith("```"):
            in_code_block = not in_code_block
            compacted_lines.append(line.rstrip())
            continue

        if in_code_block:
            compacted_lines.append(line.rstrip(" \t"))
        else:
            if line.endswith("  ") and stripped != "":
                compacted_lines.append(line.rstrip(" \t") + "  ")
            else:
                compacted_lines.append(line.rstrip(" \t"))

    result = "\n".join(compacted_lines)
    # Collapse 3 or more newlines to 2 newlines (\n\n)
    result = re.sub(r"\n{3,}", "\n\n", result)
    return result.strip() + "\n"

def process_repository(repo_name: str, dry_run: bool = False):
    repo_path = os.path.join(BASE_DIR, repo_name)
    if not os.path.exists(repo_path):
        print(f"Skipping {repo_name} (path does not exist)")
        return 0, 0

    total_md = 0
    modified_md = 0

    for root, dirs, files in os.walk(repo_path):
        dirs[:] = [d for d in dirs if d not in (".git", "node_modules", ".next", "dist", "target", ".venv", "venv", ".build-artifacts")]
        for f in files:
            if f.endswith(".md"):
                total_md += 1
                file_path = os.path.join(root, f)
                try:
                    with open(file_path, "r", encoding="utf-8") as fp:
                        content = fp.read()
                    
                    new_content = compact_markdown(content)
                    if new_content != content:
                        modified_md += 1
                        if not dry_run:
                            with open(file_path, "w", encoding="utf-8") as fp:
                                fp.write(new_content)
                except Exception as e:
                    print(f"Error processing {file_path}: {e}")

    return total_md, modified_md

def main():
    dry_run = "--dry-run" in sys.argv
    mode_str = "(DRY RUN)" if dry_run else "(EXECUTING)"
    print(f"Starting Markdown Compaction {mode_str} across {len(REPOSITORIES)} repositories...\n")

    grand_total = 0
    grand_modified = 0

    for repo in REPOSITORIES:
        total, mod = process_repository(repo, dry_run=dry_run)
        grand_total += total
        grand_modified += mod
        action = "would be compacted" if dry_run else "compacted"
        print(f"✓ {repo:<40} : {mod:>3} of {total:>3} files {action}")

    print(f"\nCompleted! Total files { 'inspected' if dry_run else 'compacted' }: {grand_modified} of {grand_total} markdown files.")

if __name__ == "__main__":
    main()
