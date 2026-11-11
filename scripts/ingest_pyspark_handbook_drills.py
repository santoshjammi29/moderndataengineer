#!/usr/bin/env python3
"""
Ingest all 105 PySpark Handbook production use cases into src/data/json/data_pyspark.json
Transforms Databricks .py source notebooks into CodeSheetItem entries for the Code Practice Hub.
"""

import json
import re
import os
from pathlib import Path

NOTEBOOKS_DIR = Path("/Users/santosh/Documents/antigravity/pyspark-handbook/notebooks")
TARGET_FILE = Path("src/data/json/data_pyspark.json")

def map_difficulty(diff_str: str) -> str:
    d = diff_str.upper().strip()
    if "BEGINNER" in d:
        return "beginner"
    elif "INTERMEDIATE" in d:
        return "intermediate"
    elif "ADVANCED" in d:
        return "advanced"
    return "architect"

def extract_notebook_data(nb_path: Path):
    text = nb_path.read_text(encoding="utf-8")
    
    # Extract number & title
    m_title = re.search(r"# MAGIC # Notebook (\d+):\s*(.+)", text)
    if not m_title:
        return None
    num_str, title = m_title.group(1), m_title.group(2).strip()
    num = int(num_str)
    
    # Extract module
    m_mod = re.search(r"\*\*Module:\*\*\s*(.+)", text)
    mod_raw = m_mod.group(1).strip() if m_mod else nb_path.parent.name
    # Clean module name for category tag
    clean_cat = re.sub(r"^Module \d+:\s*", "", mod_raw).split("—")[0].strip()
    
    # Extract difficulty
    m_diff = re.search(r"\*\*Difficulty:\*\*\s*`?([A-Za-z]+)`?", text)
    diff_str = m_diff.group(1) if m_diff else "Intermediate"
    level = map_difficulty(diff_str)
    
    # Extract scenario
    m_scen = re.search(r"### Business Scenario & Real-World Context\n# MAGIC\s*(.+?)(?=\n# MAGIC\n|\n# COMMAND)", text, re.DOTALL)
    use_case = m_scen.group(1).replace("# MAGIC", "").strip().replace("\n", " ") if m_scen else "Enterprise production lakehouse use case."
    
    # Extract technical requirement
    m_req = re.search(r"### Technical Requirement & Problem Statement\n# MAGIC\s*(.+?)(?=\n# MAGIC\n|\n# COMMAND)", text, re.DOTALL)
    description = m_req.group(1).replace("# MAGIC", "").strip().replace("\n", " ") if m_req else title
    
    # Extract architecture notes
    m_arch = re.search(r"### Spark & Databricks Architecture Notes\n# MAGIC\s*(.+?)(?=\n# MAGIC\n|\n# COMMAND)", text, re.DOTALL)
    arch_notes = m_arch.group(1).replace("# MAGIC", "").strip() if m_arch else ""
    notes = [line.strip("- *").strip() for line in arch_notes.splitlines() if line.strip() and not line.strip().startswith("#")]
    if not notes:
        notes = [f"Module: {clean_cat}", f"Difficulty: {diff_str}", "Optimized for Apache Spark 3.5+ & Databricks Runtime 15.4+ LTS."]
    
    # Extract code cells
    commands = text.split("# COMMAND ----------")
    core_code_parts = []
    
    for cmd in commands:
        cmd_stripped = cmd.strip()
        if not cmd_stripped or "# MAGIC %md" in cmd_stripped:
            continue
        lines = [l for l in cmd_stripped.splitlines() if not l.strip().startswith("# MAGIC") and not l.strip().startswith("%")]
        code = "\n".join(lines).strip()
        if not code:
            continue
        # Skip pure boilerplate session init
        if "SparkSession.builder" in code and "getOrCreate()" in code and len(code.splitlines()) < 25:
            continue
        core_code_parts.append(code)
        
    core_code = "\n\n# --- Execution Step ---\n".join(core_code_parts) if core_code_parts else "# See source notebook for full execution logic."
    
    # Ensure code is under reasonable length for display
    if len(core_code) > 4000:
        core_code = core_code[:3900] + "\n\n# ... [Additional production assertions truncated for display]"
        
    item_id = f"pyspark-hb-{num:03d}"
    
    return {
        "id": item_id,
        "title": f"#{num:03d} {title}",
        "level": level,
        "category": clean_cat,
        "description": description,
        "code": core_code,
        "notes": notes[:4],
        "use_case": use_case
    }

def main():
    if not TARGET_FILE.exists():
        print(f"Target file {TARGET_FILE} not found.", file=sys.stderr)
        return
        
    with open(TARGET_FILE, "r", encoding="utf-8") as f:
        existing_data = json.load(f)
        
    before_count = len(existing_data)
    existing_ids = {x["id"] for x in existing_data}
    print(f"Existing PySpark drills count: {before_count}")
    
    notebooks = sorted(NOTEBOOKS_DIR.glob("*/*.py"))
    print(f"Discovered {len(notebooks)} notebooks in {NOTEBOOKS_DIR}")
    
    new_items = []
    for nb in notebooks:
        parsed = extract_notebook_data(nb)
        if parsed and parsed["id"] not in existing_ids:
            new_items.append(parsed)
            existing_ids.add(parsed["id"])
            
    print(f"Extracted {len(new_items)} new PySpark handbook drills.")
    
    existing_data.extend(new_items)
    
    temp_file = str(TARGET_FILE) + ".tmp"
    with open(temp_file, "w", encoding="utf-8") as f:
        json.dump(existing_data, f, indent=2, ensure_ascii=False)
        
    os.replace(temp_file, TARGET_FILE)
    
    with open(TARGET_FILE, "r", encoding="utf-8") as f:
        verified = json.load(f)
        
    print(f"Successfully updated {TARGET_FILE}! New total count: {len(verified)} (+{len(new_items)})")

if __name__ == "__main__":
    main()
