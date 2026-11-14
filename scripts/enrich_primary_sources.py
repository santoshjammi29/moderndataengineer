import json
import os

CANONICAL_SOURCES = {
    # Apache Spark
    "spark_tuning": {
        "title": "Apache Spark Official Performance Tuning Guide",
        "url": "https://spark.apache.org/docs/latest/sql-performance-tuning.html",
        "publisher": "Apache Software Foundation"
    },
    "spark_memory": {
        "title": "Apache Spark Official Memory Management & Configuration Guide",
        "url": "https://spark.apache.org/docs/latest/tuning.html",
        "publisher": "Apache Software Foundation"
    },
    "spark_structured_streaming": {
        "title": "Apache Spark Structured Streaming Programming Guide",
        "url": "https://spark.apache.org/docs/latest/structured-streaming-programming-guide.html",
        "publisher": "Apache Software Foundation"
    },
    # Delta Lake
    "delta_clustering": {
        "title": "Delta Lake Official Liquid Clustering Guide",
        "url": "https://docs.delta.io/latest/delta-clustering.html",
        "publisher": "Delta Lake Project"
    },
    "delta_deletion_vectors": {
        "title": "Delta Lake Deletion Vectors Specification & Guide",
        "url": "https://docs.delta.io/latest/delta-deletion-vectors.html",
        "publisher": "Delta Lake Project"
    },
    "delta_uniform": {
        "title": "Delta Lake Universal Format (UniForm) Guide",
        "url": "https://docs.delta.io/latest/delta-uniform.html",
        "publisher": "Delta Lake Project"
    },
    "delta_acid": {
        "title": "Delta Lake ACID Transaction Protocol & Concurrency Control",
        "url": "https://docs.delta.io/latest/concurrency-control.html",
        "publisher": "Delta Lake Project"
    },
    # Apache Iceberg
    "iceberg_spec": {
        "title": "Apache Iceberg Table Specification V2",
        "url": "https://iceberg.apache.org/spec/",
        "publisher": "Apache Software Foundation"
    },
    "iceberg_evolution": {
        "title": "Apache Iceberg Schema & Partition Evolution Guide",
        "url": "https://iceberg.apache.org/docs/latest/evolution/",
        "publisher": "Apache Software Foundation"
    },
    "iceberg_maintenance": {
        "title": "Apache Iceberg Compaction & Maintenance Operations",
        "url": "https://iceberg.apache.org/docs/latest/maintenance/",
        "publisher": "Apache Software Foundation"
    },
    # Databricks
    "databricks_liquid": {
        "title": "Databricks Documentation: Use Liquid Clustering for Delta Tables",
        "url": "https://docs.databricks.com/en/optimizations/liquid-clustering.html",
        "publisher": "Databricks"
    },
    "databricks_photon": {
        "title": "Databricks Documentation: Photon Vector Engine Architecture",
        "url": "https://docs.databricks.com/en/compute/photon.html",
        "publisher": "Databricks"
    },
    "databricks_unity": {
        "title": "Databricks Documentation: Unity Catalog 3-Tier Namespace & Governance",
        "url": "https://docs.databricks.com/en/data-governance/unity-catalog/index.html",
        "publisher": "Databricks"
    },
    "databricks_dabs": {
        "title": "Databricks Documentation: Databricks Asset Bundles (DABs) Guide",
        "url": "https://docs.databricks.com/en/dev-tools/bundles/index.html",
        "publisher": "Databricks"
    },
    # Apache Airflow
    "airflow_deferrable": {
        "title": "Apache Airflow Documentation: Deferrable Operators & Triggerer",
        "url": "https://airflow.apache.org/docs/apache-airflow/stable/authoring-and-scheduling/deferring.html",
        "publisher": "Apache Software Foundation"
    },
    "airflow_datasets": {
        "title": "Apache Airflow Documentation: Data-Aware Scheduling & Datasets",
        "url": "https://airflow.apache.org/docs/apache-airflow/stable/authoring-and-scheduling/datasets.html",
        "publisher": "Apache Software Foundation"
    },
    "airflow_ha": {
        "title": "Apache Airflow High Availability Scheduler Architecture",
        "url": "https://airflow.apache.org/docs/apache-airflow/stable/administration-and-deployment/scheduler.html",
        "publisher": "Apache Software Foundation"
    },
    # Microsoft Fabric
    "fabric_onelake": {
        "title": "Microsoft Learn: Microsoft Fabric OneLake Architecture Overview",
        "url": "https://learn.microsoft.com/en-us/fabric/onelake/onelake-overview",
        "publisher": "Microsoft"
    },
    "fabric_direct_lake": {
        "title": "Microsoft Learn: Power BI Direct Lake Mode & VertiPaq Engine",
        "url": "https://learn.microsoft.com/en-us/fabric/get-started/direct-lake-overview",
        "publisher": "Microsoft"
    },
    # dbt
    "dbt_contracts": {
        "title": "dbt Docs: Model Contracts & Schema Guarantees",
        "url": "https://docs.getdbt.com/docs/build/model-contracts",
        "publisher": "dbt Labs"
    },
    "dbt_mesh": {
        "title": "dbt Docs: dbt Mesh & Multi-Project Governance",
        "url": "https://docs.getdbt.com/docs/collaborate/govern/about-model-governance",
        "publisher": "dbt Labs"
    },
}

def determine_sources(text: str):
    lower = text.lower()
    sources = []
    
    # Check Delta Lake Liquid Clustering
    if "liquid cluster" in lower or "cluster by" in lower:
        sources.append(CANONICAL_SOURCES["delta_clustering"])
        sources.append(CANONICAL_SOURCES["databricks_liquid"])
    elif "deletion vector" in lower:
        sources.append(CANONICAL_SOURCES["delta_deletion_vectors"])
    elif "uniform" in lower or "universal format" in lower:
        sources.append(CANONICAL_SOURCES["delta_uniform"])
    elif "delta" in lower and ("acid" in lower or "log" in lower or "checkpoint" in lower):
        sources.append(CANONICAL_SOURCES["delta_acid"])

    # Check Iceberg
    if "iceberg" in lower:
        if "evolution" in lower:
            sources.append(CANONICAL_SOURCES["iceberg_evolution"])
        elif "compaction" in lower or "maintenance" in lower:
            sources.append(CANONICAL_SOURCES["iceberg_maintenance"])
        else:
            sources.append(CANONICAL_SOURCES["iceberg_spec"])

    # Check Photon & Unity Catalog
    if "photon" in lower:
        sources.append(CANONICAL_SOURCES["databricks_photon"])
    if "unity catalog" in lower:
        sources.append(CANONICAL_SOURCES["databricks_unity"])
    if "asset bundle" in lower or "dabs" in lower:
        sources.append(CANONICAL_SOURCES["databricks_dabs"])

    # Check Spark
    if "aqe" in lower or "adaptive query" in lower or "skew join" in lower or "sortmergejoin" in lower:
        sources.append(CANONICAL_SOURCES["spark_tuning"])
    elif "off-heap" in lower or "tungsten" in lower or "kryo" in lower or "spill" in lower:
        sources.append(CANONICAL_SOURCES["spark_memory"])
    elif "structured streaming" in lower or "watermark" in lower:
        sources.append(CANONICAL_SOURCES["spark_structured_streaming"])

    # Check Airflow
    if "deferrable" in lower or "triggerer" in lower:
        sources.append(CANONICAL_SOURCES["airflow_deferrable"])
    elif "dataset" in lower and "scheduling" in lower:
        sources.append(CANONICAL_SOURCES["airflow_datasets"])
    elif "airflow" in lower and ("scheduler" in lower or "ha" in lower):
        sources.append(CANONICAL_SOURCES["airflow_ha"])

    # Check Fabric
    if "onelake" in lower or "shortcut" in lower:
        sources.append(CANONICAL_SOURCES["fabric_onelake"])
    if "direct lake" in lower or "vertipaq" in lower:
        sources.append(CANONICAL_SOURCES["fabric_direct_lake"])

    # Check dbt
    if "dbt" in lower and ("contract" in lower or "constraint" in lower):
        sources.append(CANONICAL_SOURCES["dbt_contracts"])
    elif "dbt" in lower and ("mesh" in lower or "governance" in lower):
        sources.append(CANONICAL_SOURCES["dbt_mesh"])

    # Deduplicate sources by URL
    seen = set()
    deduped = []
    for s in sources:
        if s["url"] not in seen:
            seen.add(s["url"])
            deduped.append(s)
    return deduped

def enrich_file(path: str, is_concept=False):
    if not os.path.exists(path):
        print(f"Skipping {path}: not found")
        return 0

    with open(path, "r", encoding="utf-8") as f:
        items = json.load(f)

    updated_count = 0
    for item in items:
        # If item already has sources, don't overwrite unless empty
        if item.get("sources"):
            continue

        text_to_check = ""
        if is_concept:
            text_to_check = f"{item.get('term', '')} {item.get('definition', '')} {item.get('explanation', '')}"
        else:
            text_to_check = f"{item.get('title', '')} {item.get('question', '')} {item.get('answer', '')} {item.get('problemStatement', '')} {item.get('architectureSolution', '')}"

        new_sources = determine_sources(text_to_check)
        if new_sources:
            item["sources"] = new_sources
            updated_count += 1

    temp_path = path + ".tmp"
    with open(temp_path, "w", encoding="utf-8") as f:
        json.dump(items, f, indent=2, ensure_ascii=False)
    os.replace(temp_path, path)

    print(f"✓ {os.path.basename(path)}: Enriched {updated_count} records with authoritative primary sources.")
    return updated_count

if __name__ == "__main__":
    enrich_file("src/data/json/data_concepts.json", is_concept=True)
    enrich_file("src/data/json/data_architecture.json", is_concept=False)
    enrich_file("src/data/json/questions.json", is_concept=False)
