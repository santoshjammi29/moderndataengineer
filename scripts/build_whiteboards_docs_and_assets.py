#!/usr/bin/env python3
"""
Builds repository-accessible Whiteboard Diagrams documentation and assets.
Generates:
  - docs/whiteboard_diagrams/README.md (Complete 52-blueprint catalog with 2x2 grid tables and multi-persona breakdowns)
  - assets/whiteboards/ (Copies of all 52 diagram WebP files across charming-fermi and all 12 sibling repositories)
  - docs/pdf/README.md (Index of all 11 enterprise PDF references)

Author: Santosh Jammi | Principal Data Architect
Platform: moderndataengineer.uk
"""

import os
import shutil
import json
import subprocess

WORKSPACE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE_DIR = os.path.dirname(WORKSPACE)

DIAGRAMS_TS = os.path.join(WORKSPACE, "src", "data", "diagrams.ts")
PUBLIC_DIAGRAMS = os.path.join(WORKSPACE, "public", "diagrams")
ASSETS_WHITEBOARDS = os.path.join(WORKSPACE, "assets", "whiteboards")
DOCS_WHITEBOARDS = os.path.join(WORKSPACE, "docs", "whiteboard_diagrams")
DOCS_PDF = os.path.join(WORKSPACE, "docs", "pdf")

ALL_REPOSITORIES = [
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
]

os.makedirs(ASSETS_WHITEBOARDS, exist_ok=True)
os.makedirs(DOCS_WHITEBOARDS, exist_ok=True)
os.makedirs(DOCS_PDF, exist_ok=True)

def parse_diagrams():
    with open(DIAGRAMS_TS, encoding="utf-8") as f:
        content = f.read()

    marker = 'export const architectureDiagrams: ArchitectureDiagramItem[] ='
    idx = content.find(marker)
    if idx == -1:
        raise ValueError("Could not find marker")
    bracket_start = content.find('[', idx + len(marker))
    bracket_end = content.rfind('];')
    json_like = content[bracket_start : bracket_end + 1]

    try:
        diagrams = json.loads(json_like)
        return diagrams
    except Exception:
        cmd = [
            "node",
            "-e",
            "const fs = require('fs'); const content = fs.readFileSync('src/data/diagrams.ts', 'utf8'); const marker = 'export const architectureDiagrams: ArchitectureDiagramItem[] ='; const idx = content.indexOf(marker); const start = content.indexOf('[', idx + marker.length); const end = content.lastIndexOf('];'); console.log(content.slice(start, end+1));"
        ]
        res = subprocess.run(cmd, cwd=WORKSPACE, capture_output=True, text=True)
        return json.loads(res.stdout)

def main():
    diagrams = parse_diagrams()
    print(f"Loaded {len(diagrams)} diagrams from diagrams.ts")

    # 1. Copy diagrams to assets/whiteboards in charming-fermi and all sibling repos
    copied_count = 0
    diagram_files = []
    for d in diagrams:
        img_rel = d.get("image", "").lstrip("/")
        src = os.path.join(WORKSPACE, "public", img_rel)
        if os.path.exists(src):
            dst = os.path.join(ASSETS_WHITEBOARDS, os.path.basename(src))
            shutil.copy2(src, dst)
            copied_count += 1
            diagram_files.append((src, os.path.basename(src)))
    print(f"Copied {copied_count} diagrams to hub {ASSETS_WHITEBOARDS}")

    # Synchronize diagram files to all sibling repos
    for repo_name in ALL_REPOSITORIES:
        if repo_name == "charming-fermi":
            continue
        repo_assets_wb = os.path.join(BASE_DIR, repo_name, "assets", "whiteboards")
        os.makedirs(repo_assets_wb, exist_ok=True)
        for src, fname in diagram_files:
            dst = os.path.join(repo_assets_wb, fname)
            shutil.copy2(src, dst)
        print(f"  ✓ Synchronized 52 whiteboard assets to {repo_name}/assets/whiteboards/")

    # 2. Group diagrams by category
    categories = {}
    for d in diagrams:
        cat = d.get("category", "Uncategorized")
        categories.setdefault(cat, []).append(d)

    # 3. Generate docs/whiteboard_diagrams/README.md with 2x2 Grid Tables
    md_lines = [
        "# Modern Data Platform & Lakehouse Architecture Whiteboard Blueprints",
        "",
        "> **Repository Master Index**: 52 architect-grade, hand-drawn digital whiteboard schematics across 7 enterprise domains with 2x2 visual blueprint grids, 5-role persona breakdowns, engine-level mechanisms, failure mode playbooks, and primary documentation links.",
        "> ",
        "> 📘 **Complete Handbook Blueprints (20 Pillars & 8 Playbooks)**: See [`handbook_whiteboard_blueprints.md`](./handbook_whiteboard_blueprints.md) for the end-to-end Dual-Plane & 3-Panel Mermaid whiteboard diagrams covering all 20 Knowledge Pillars and 8 Playbooks from the [Data Engineering Interview Handbook](https://github.com/santoshjammi29/data-engineering-interview-handbook).",
        "",
        "All visual blueprint files are available in this repository under [`assets/whiteboards/`](../../assets/whiteboards) and [`public/diagrams/`](../../public/diagrams).",
        "They can also be interactively inspected with pan/zoom and theme controls on the live website at [/whiteboards](https://moderndataengineer.uk/whiteboards).",
        "",
        "## Domain Table of Contents",
        "",
    ]

    for cat_name, items in categories.items():
        anchor = cat_name.lower().replace(" ", "-").replace("&", "").replace("--", "-")
        md_lines.append(f"- [{cat_name} ({len(items)} Blueprints)](#{anchor})")

    md_lines.extend(["", "---", ""])

    for cat_name, items in categories.items():
        anchor = cat_name.lower().replace(" ", "-").replace("&", "").replace("--", "-")
        md_lines.append(f"## {cat_name}")
        md_lines.append(f"*{len(items)} Architecture Blueprints in this domain*\n")

        # 2x2 Grid Showcase Table for this domain
        md_lines.append(f"### 📐 {cat_name} — Visual Blueprints Grid (2x2)\n")
        md_lines.append("<table>")
        for i in range(0, len(items), 2):
            md_lines.append("  <tr>")
            for j in range(2):
                if i + j < len(items):
                    item = items[i + j]
                    img_name = os.path.basename(item.get("image", "").lstrip("/"))
                    anchor_id = item["id"]
                    tags_snippet = " · ".join(f"`{t}`" for t in item.get("tags", [])[:4])
                    md_lines.extend([
                        '    <td width="50%" valign="top">',
                        f'      <a href="#{anchor_id}">',
                        f'        <img src="../../assets/whiteboards/{img_name}" alt="{item["title"]}" width="100%" />',
                        '      </a>',
                        f'      <br><strong><a href="#{anchor_id}">{item["title"]}</a></strong><br>',
                        f'      <em>{item.get("subtitle", "")}</em><br>',
                        f'      <small>{tags_snippet}</small><br>',
                        f'      <a href="#{anchor_id}">🔍 Inspect Deep Dive & Architecture →</a>',
                        '    </td>'
                    ])
                else:
                    md_lines.append('    <td width="50%" valign="top"></td>')
            md_lines.append("  </tr>")
        md_lines.extend(["</table>", "", "---", ""])

        # Detailed Blueprints with Persona Breakdown
        for d in items:
            img_rel = d.get("image", "").lstrip("/")
            img_name = os.path.basename(img_rel)
            tags_str = " · ".join(f"`{t}`" for t in d.get("tags", []))
            doc_link = d.get("docLink", "")
            doc_badge = f"[📖 Official Docs]({doc_link})" if doc_link else ""
            anchor_id = d["id"]

            md_lines.extend([
                f'<a id="{anchor_id}"></a>',
                f"### {d['title']}",
                f"**{d.get('subtitle', '')}**",
                "",
                f"**Tags:** {tags_str} {('· ' + doc_badge) if doc_badge else ''}",
                "",
                f"![{d['title']}](../../assets/whiteboards/{img_name})",
                "",
                f"**Overview:** {d.get('description', '')}",
                "",
            ])

            if d.get("keyPoints"):
                md_lines.append("**Key Architecture Points:**")
                for kp in d["keyPoints"]:
                    md_lines.append(f"- {kp}")
                md_lines.append("")

            if d.get("architectNotes"):
                md_lines.append(f"> **Architect Note:** {d['architectNotes']}\n")

            if d.get("personaBreakdown"):
                pb = d["personaBreakdown"]
                md_lines.extend([
                    "<details>",
                    "<summary><strong>Multi-Persona Architectural Breakdown (Click to expand)</strong></summary>",
                    "",
                    f"- **Enterprise Architect:** {pb.get('architect', 'N/A')}",
                    f"- **Senior Data Engineer:** {pb.get('seniorDe', 'N/A')}",
                    f"- **Data Engineer:** {pb.get('dataEngineer', 'N/A')}",
                    f"- **Data Steward:** {pb.get('steward', 'N/A')}",
                    f"- **Business Analyst:** {pb.get('businessAnalyst', 'N/A')}",
                    "",
                    "</details>",
                    "",
                ])

            if d.get("technicalMechanisms"):
                md_lines.append("**Under-the-Hood Technical Mechanisms:**")
                for tm in d["technicalMechanisms"]:
                    md_lines.append(f"- {tm}")
                md_lines.append("")

            if d.get("failureModesAndTriage"):
                md_lines.append("**Production Failure Modes & Incident Triage:**")
                for fm in d["failureModesAndTriage"]:
                    md_lines.append(f"- {fm}")
                md_lines.append("")

            if d.get("governanceAndCompliance"):
                md_lines.append("**Governance & Regulatory Compliance:**")
                for gc in d["governanceAndCompliance"]:
                    md_lines.append(f"- {gc}")
                md_lines.append("")

            md_lines.extend([
                f"[↑ Return to {cat_name} 2x2 Grid](#{anchor}) · [Top of Catalog](#domain-table-of-contents)",
                "",
                "---",
                ""
            ])

    whiteboards_readme = os.path.join(DOCS_WHITEBOARDS, "README.md")
    with open(whiteboards_readme, "w", encoding="utf-8") as f:
        f.write("\n".join(md_lines))
    print(f"Generated {whiteboards_readme} ({len(md_lines)} lines)")

    # Synchronize docs/whiteboard_diagrams/README.md to all sibling repos
    for repo_name in ALL_REPOSITORIES:
        if repo_name == "charming-fermi":
            continue
        repo_docs_wb = os.path.join(BASE_DIR, repo_name, "docs", "whiteboard_diagrams")
        os.makedirs(repo_docs_wb, exist_ok=True)
        dest_readme = os.path.join(repo_docs_wb, "README.md")
        shutil.copy2(whiteboards_readme, dest_readme)
        print(f"  ✓ Synchronized 2x2 whiteboard catalog to {repo_name}/docs/whiteboard_diagrams/README.md")

    # 4. Generate docs/pdf/README.md
    pdf_docs_lines = [
        "# Enterprise Architecture Reference Guides & Master Cheatsheet PDFs",
        "",
        "> **Repository PDF Library**: Complete high-density, vector A4 printable references with hierarchical bookmarks, standard metadata, and zero truncation.",
        "",
        "All PDF files are committed to this repository in [`docs/pdf/`](./) and mirrored in [`public/cheatsheets/pdf/`](../../public/cheatsheets/pdf).",
        "",
        "| Document Name | Pages | Primary Domain | File Link |",
        "| :--- | :---: | :--- | :--- |",
        "| **Databricks Data Intelligence Platform: End-to-End Technical Manual** | **20** | Level 100 to 400 Lakehouse Architecture & Engineering | [Download PDF](./databricks_data_intelligence_platform_technical_manual.pdf) |",
        "| **Complete Lakehouse Architecture & Runbooks Enterprise Reference** | 47 | All-in-One Master Architecture & 76 Runbooks | [Download PDF](./lakehouse_enterprise_master_reference.pdf) |",
        "| **Databricks Unified Architecture & Coding Suite** | 8 | 48 Production Coding Cards Across 4 Domains | [Download PDF](./databricks_master_cheatsheet.pdf) |",
        "| **Apache Spark Catalyst Optimizer & Execution Plan Triage** | 2 | 12 Plan Reading, Physical Operators & Bottleneck Cards | [Download PDF](./spark_execution_plan_and_catalyst_triage_guide.pdf) |",
        "| **Lakehouse Table Formats: Delta Lake vs Apache Iceberg** | 2 | 12 Storage Format, Metadata & Interoperability Cards | [Download PDF](./lakehouse_table_formats_delta_iceberg_guide.pdf) |",
        "| **Data Engineering SDLC, Data Contracts & Testing Pyramid** | 2 | 12 Quality Engineering, CI/CD & Testing Cards | [Download PDF](./data_engineering_sdlc_and_data_contracts_guide.pdf) |",
        "| **Data Engineering Incident Runbooks** | 12 | 76 Emergency Production Incident Playbooks | [Download PDF](./incident_runbooks.pdf) |",
        "| **Databricks PySpark Architecture & Engine Suite** | 2 | 12 PySpark Core & Optimization Cards | [Download PDF](./databricks_pyspark_cheatsheet.pdf) |",
        "| **Databricks Spark SQL Architecture & Query Suite** | 2 | 12 ANSI SQL, Liquid Clustering & DLT Cards | [Download PDF](./databricks_sparksql_cheatsheet.pdf) |",
        "| **Databricks Spark Core Internals & JVM Tuning Suite** | 2 | 12 Memory, GC, Shuffle & Executor Tuning Cards | [Download PDF](./databricks_spark_core_cheatsheet.pdf) |",
        "| **Python in Databricks SDK, CLI & DABs Suite** | 2 | 12 Asset Bundles, SDK & Automation Cards | [Download PDF](./databricks_python_cheatsheet.pdf) |",
        "",
        "## How to View and Print",
        "- All PDFs are standard ISO A4 vector documents rendered at 300 DPI equivalent with embedded fonts (`Inter`, `JetBrains Mono`).",
        "- Open in Adobe Acrobat, Apple Preview, Chrome, or any PDF reader to view hierarchical Table of Contents (TOC) bookmarks.",
        "- In chat or browser, download directly via the web portal at [/cheat-sheet](https://moderndataengineer.uk/cheat-sheet) or via the API route `/api/download/pdf/<filename>`.",
    ]
    with open(os.path.join(DOCS_PDF, "README.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(pdf_docs_lines))
    print(f"Generated {os.path.join(DOCS_PDF, 'README.md')}")

if __name__ == "__main__":
    main()
