#!/usr/bin/env python3
"""
Master Assembler for the 100 Spark, PySpark & Spark SQL Data-Issue Problems & Answers Playbook.
Combines 10 categories (100 problems) with executive taxonomy, cross-reference matrix,
reproducible code snippets, and production triage playbooks.
"""

import sys
import os
import json

import re

def make_slug(item_id, title):
    clean = re.sub(r'[^a-zA-Z0-9\s-]', '', title.lower())
    clean = re.sub(r'[\s/]+', '-', clean).strip('-')
    return f"problem-{item_id:02d}-{clean}"

from cat1_skew import CAT1_PROBLEMS
from cat2_nulls import CAT2_PROBLEMS
from cat3_schema import CAT3_PROBLEMS
from cat4_corrupt import CAT4_PROBLEMS
from cat5_duplicates import CAT5_PROBLEMS
from cat6_nested import CAT6_PROBLEMS
from cat7_timestamps import CAT7_PROBLEMS
from cat8_memory import CAT8_PROBLEMS
from cat9_joins import CAT9_PROBLEMS
from cat10_types import CAT10_PROBLEMS

ALL_CATEGORIES = [
    ("Category 1: Extreme Data Skew & Key Imbalance", CAT1_PROBLEMS),
    ("Category 2: Nulls, Three-Valued Logic & Missing Data Traps", CAT2_PROBLEMS),
    ("Category 3: Schema Drift, Polymorphism & Evolution", CAT3_PROBLEMS),
    ("Category 4: Corrupt, Malformed & Truncated Ingestion Records", CAT4_PROBLEMS),
    ("Category 5: Duplicate Records, CDC & Out-of-Order Updates", CAT5_PROBLEMS),
    ("Category 6: Nested Data, Arrays & Explode Explosions", CAT6_PROBLEMS),
    ("Category 7: Timestamp, Timezone & Late-Arriving Event Data", CAT7_PROBLEMS),
    ("Category 8: Memory Pressure, Disk Spill & Out of Memory (OOM)", CAT8_PROBLEMS),
    ("Category 9: Join Explosions, Cartesian Products & Cardinality Blowups", CAT9_PROBLEMS),
    ("Category 10: Type Mismatch, Precision Loss & Serialization Pitfalls", CAT10_PROBLEMS),
]

def build_markdown():
    total_problems = sum(len(problems) for _, problems in ALL_CATEGORIES)
    assert total_problems == 100, f"Expected 100 problems, found {total_problems}"

    # Level counts
    levels = {}
    for _, problems in ALL_CATEGORIES:
        for p in problems:
            levels[p["level"]] = levels.get(p["level"], 0) + 1

    lines = []
    lines.append("# 100 Spark, PySpark & Spark SQL Real-World Data Issue Problems & Solutions")
    lines.append("\n> **Comprehensive Engineering & Interview Defense Playbook**")
    lines.append("> *A systematic taxonomy of 100 concrete data-induced failures, silent corruptions, memory collapses, and production optimizations across Apache Spark, PySpark, Spark SQL, and Delta Lake.*")
    lines.append("\n---\n")

    lines.append("## Executive Curriculum & Taxonomy Matrix\n")
    lines.append("| Category | Total Problems | Beginner | Intermediate | Advanced | Architect |")
    lines.append("| :--- | :---: | :---: | :---: | :---: | :---: |")

    for cat_name, problems in ALL_CATEGORIES:
        b_count = sum(1 for p in problems if p["level"] == "Beginner")
        i_count = sum(1 for p in problems if p["level"] == "Intermediate")
        a_count = sum(1 for p in problems if p["level"] == "Advanced")
        arch_count = sum(1 for p in problems if p["level"] == "Architect")
        clean_cat = cat_name.split(":")[1].strip() if ":" in cat_name else cat_name
        lines.append(f"| **{clean_cat}** | {len(problems)} | {b_count} | {i_count} | {a_count} | {arch_count} |")

    lines.append(f"| **TOTAL** | **{total_problems}** | **{levels.get('Beginner',0)}** | **{levels.get('Intermediate',0)}** | **{levels.get('Advanced',0)}** | **{levels.get('Architect',0)}** |")
    lines.append("\n---\n")

    lines.append("## Table of Contents & Quick Navigation Index\n")
    for cat_name, problems in ALL_CATEGORIES:
        lines.append(f"### {cat_name}\n")
        for p in problems:
            slug = make_slug(p["id"], p["title"])
            lines.append(f"- **Problem {p['id']:02d}** `[{p['level']}]`: [{p['title']}](#{slug})")
        lines.append("")

    lines.append("\n---\n")

    # Now output each problem in detail
    for cat_title, problems in ALL_CATEGORIES:
        lines.append(f"# {cat_title}\n")
        for p in problems:
            slug = make_slug(p["id"], p["title"])
            lines.append(f"<a id=\"{slug}\"></a>")
            lines.append(f"## Problem {p['id']:02d} [{p['level']}]: {p['title']}\n")
            lines.append(f"**Category:** `{p['category']}`\n")
            lines.append(f"**Scenario & Symptom:**  \n{p['scenario']}  \n*Signature:* {p['symptom']}\n")
            lines.append(f"**Root Cause:**  \n{p['root_cause']}\n")
            code_lang = "sql" if "--" in p["failing_code"] else "python"
            lines.append(f"**Failing Pattern:**\n```{code_lang}\n{p['failing_code']}\n```\n")
            sol_lang = "sql" if "--" in p["solution_code"] else "python"
            lines.append(f"**Production Solution:**\n```{sol_lang}\n{p['solution_code']}\n```\n")
            lines.append(f"**Architect Rule:** {p['interview_takeaway']}\n")
            lines.append("\n---\n")

    return "\n".join(lines)

def main():
    print("Assembling 100 Spark Data-Issue Problems...")
    md_content = build_markdown()

    # Destination 1: charming-fermi docs/interview_prep/
    dest1 = "/Users/santosh/Documents/antigravity/charming-fermi/docs/interview_prep/100_spark_data_issues_problems_and_answers.md"
    os.makedirs(os.path.dirname(dest1), exist_ok=True)
    with open(dest1, "w", encoding="utf-8") as f:
        f.write(md_content)
    print(f"Wrote {len(md_content.splitlines())} lines to {dest1}")

    # Destination 2: data-engineering-interview-handbook playbooks/
    dest2 = "/Users/santosh/Documents/antigravity/data-engineering-interview-handbook/playbooks/100_spark_data_issues_problems_and_answers.md"
    os.makedirs(os.path.dirname(dest2), exist_ok=True)
    with open(dest2, "w", encoding="utf-8") as f:
        f.write(md_content)
    print(f"Wrote {len(md_content.splitlines())} lines to {dest2}")

    # Destination 3: Export Structured JSON for both repos
    all_problems_flat = []
    for _, problems in ALL_CATEGORIES:
        for p in problems:
            all_problems_flat.append(p)

    json_dest1 = "/Users/santosh/Documents/antigravity/data-engineering-interview-handbook/data/100_spark_data_issues.json"
    with open(json_dest1, "w", encoding="utf-8") as f:
        json.dump(all_problems_flat, f, indent=2)
    print(f"Wrote {len(all_problems_flat)} structured JSON items to {json_dest1}")

    print("Master Assembly Complete!")

if __name__ == "__main__":
    main()
