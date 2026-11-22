#!/usr/bin/env python3
"""
Ecosystem-Wide Git Commit & Push Automation
==========================================
Iterates through all 14 repositories in the Modern Data Engineering Lakehouse ecosystem,
stages all educational standard enhancements (ROADMAP, CONTRIBUTING, AGENTS, .editorconfig,
README updates, manifest syndications, and agent skills), commits them with clean Conventional Commits,
and pushes them to GitHub.

Author: Principal Lakehouse & Distributed Data Systems Architect
Platform: moderndataengineer.uk
"""

import subprocess
from pathlib import Path

BASE_DIR = Path('/Users/santosh/Documents/antigravity')

REPOSITORIES = [
    ("charming-fermi", "santoshjammi29/moderndataengineer", "Modern Data Engineer Web Hub"),
    ("databricks-handbook", "santoshjammi29/databricks-handbook", "Databricks Handbook"),
    ("pyspark-handbook", "santoshjammi29/pyspark-handbook", "PySpark Handbook"),
    ("sql-handbook", "santoshjammi29/sql-handbook", "SQL Handbook"),
    ("dbt-handbook", "santoshjammi29/dbt-handbook", "dbt Handbook"),
    ("streaming-handbook", "santoshjammi29/streaming-handbook", "Streaming Handbook"),
    ("dataops-cicd-handbook", "santoshjammi29/dataops-cicd-handbook", "DataOps & CI/CD Handbook"),
    ("data-system-design-handbook", "santoshjammi29/data-system-design-handbook", "System Design Handbook"),
    ("data-engineering-interview-handbook", "santoshjammi29/data-engineering-interview-handbook", "Interview Handbook"),
    ("azure-cheat-sheet", "santoshjammi29/azure-cheat-sheet", "Azure Cheat Sheet"),
    ("azure-databricks-project-blueprints", "santoshjammi29/azure-databricks-project-blueprints", "Databricks Project Blueprints"),
    ("enterprise-banking-risk-alm-lakehouse", "santoshjammi29/enterprise-banking-risk-alm-lakehouse", "Banking Risk Lakehouse"),
    ("spark-experiments", "santoshjammi29/spark-experiments", "Spark Experiments"),
    ("security-handbook", "santoshjammi29/security-handbook", "Security Handbook"),
]

COMMIT_MSG = "feat: organize topics and roadmaps by functional section then difficulty with default collapsed decks"

def run_cmd(cmd, cwd):
    return subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)

def main():
    print("=" * 80)
    print("🚀 ECOSYSTEM-WIDE GIT COMMIT & PUSH TO GITHUB (ALL 14 REPOSITORIES)")
    print("=" * 80)
    
    results = []

    for slug, gh_repo, name in REPOSITORIES:
        repo_path = BASE_DIR / slug
        if not repo_path.exists():
            print(f"❌ [NOT FOUND] {slug}")
            results.append((slug, "NOT FOUND", "N/A", "Failed"))
            continue

        # Check status
        st = run_cmd(['git', 'status', '--porcelain'], repo_path)
        changed_files = [line.strip() for line in st.stdout.splitlines() if line.strip()]

        if not changed_files:
            print(f"⚪ [CLEAN] {slug:35} (No uncommitted changes)")
            results.append((slug, 0, "main", "Clean / Already Pushed"))
            continue

        print(f"\n📦 [{slug}] Staging {len(changed_files)} changed items...")
        for cf in changed_files[:5]:
            print(f"    - {cf}")
        if len(changed_files) > 5:
            print(f"    ... and {len(changed_files) - 5} more")

        # Stage
        add_res = run_cmd(['git', 'add', '-A'], repo_path)
        if add_res.returncode != 0:
            print(f"❌ Error adding files in {slug}: {add_res.stderr}")
            results.append((slug, len(changed_files), "main", "Add Failed"))
            continue

        # Commit
        commit_res = run_cmd(['git', 'commit', '-m', COMMIT_MSG], repo_path)
        if commit_res.returncode != 0:
            print(f"❌ Error committing in {slug}: {commit_res.stderr}")
            results.append((slug, len(changed_files), "main", "Commit Failed"))
            continue

        # Get commit hash
        commit_hash = run_cmd(['git', 'rev-parse', '--short', 'HEAD'], repo_path).stdout.strip()
        print(f"    ✓ Committed as {commit_hash}")

        # Push
        print(f"    ⏳ Pushing to origin main ({gh_repo})...")
        push_res = run_cmd(['git', 'push', 'origin', 'main'], repo_path)
        if push_res.returncode != 0:
            print(f"❌ Push failed in {slug}: {push_res.stderr}")
            results.append((slug, len(changed_files), commit_hash, f"Push Failed: {push_res.stderr.strip()}"))
        else:
            print(f"    ✅ Pushed successfully to origin/main!")
            results.append((slug, len(changed_files), commit_hash, "Pushed Successfully"))

    print("\n" + "=" * 80)
    print("📊 PUSH EXECUTION SUMMARY")
    print("=" * 80)
    print(f"{'Repository Slug':36} | {'Files':5} | {'Commit':7} | {'Status'}")
    print("-" * 80)
    for slug, f_count, chash, status in results:
        print(f"{slug:36} | {str(f_count):5} | {chash:7} | {status}")
    print("=" * 80)

if __name__ == '__main__':
    main()
