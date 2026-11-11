#!/usr/bin/env python3
"""Replace filler records with source-linked, differentiated learning content.

Run from the website repository root. The operation is deterministic and
idempotent: generated filler and this script's own IDs are removed before
curated records are appended.
"""
from __future__ import annotations

import json
import os
import re
import shutil
from pathlib import Path
from typing import Any

ROOT = Path.cwd()
DATA = ROOT / "src" / "data" / "json"

SOURCES = {
    "dora": {
        "title": "DORA Research: 2025 State of AI-assisted Software Development",
        "url": "https://dora.dev/research/2025/dora-report/",
    },
    "dbt26": {
        "title": "dbt Labs: 2026 State of Analytics Engineering report",
        "url": "https://www.getdbt.com/blog/new-dbt-labs-report-finds-ai-driven-acceleration-is-outpacing-trust-and-governance",
    },
    "thoughtworks": {
        "title": "Thoughtworks Technology Radar Vol. 35",
        "url": "https://www.thoughtworks.com/en-gb/about-us/news/2026/thoughtworks-technology-radar-highlights-stronger-controls",
    },
    "fowler": {
        "title": "Martin Fowler: Data Product Platform Navigator",
        "url": "https://martinfowler.com/articles/data-product-platform-nav.html",
    },
    "aws_streaming": {
        "title": "AWS Big Data Blog: Powering agentic AI with real-time streaming data",
        "url": "https://aws.amazon.com/blogs/big-data/powering-agentic-ai-with-real-time-streaming-data-on-aws/",
    },
    "aws_lakehouse": {
        "title": "AWS Big Data Blog: Multi-cloud lakehouse architecture for agentic AI",
        "url": "https://aws.amazon.com/blogs/big-data/multi-cloud-lakehouse-architecture-on-aws-for-agentic-ai-part-1-architecture-and-best-practices/",
    },
    "google": {
        "title": "Google Cloud Blog: Borderless lakehouse integrations for Gemini",
        "url": "https://cloud.google.com/blog/products/data-analytics/borderless-lakehouse-integrates-with-gemini/?hl=en",
    },
    "uber": {
        "title": "Uber Engineering: From batch to streaming in Uber's data lake",
        "url": "https://www.uber.com/us/en/blog/from-batch-to-streaming-accelerating-data-freshness-in-ubers-data-lake/",
    },
    "cncf": {
        "title": "CNCF Annual Cloud Native Survey",
        "url": "https://www.cncf.io/reports/the-cncf-annual-cloud-native-survey/",
    },
    "fabric": {
        "title": "Microsoft Community Hub: Building a medallion architecture with Fabric",
        "url": "https://techcommunity.microsoft.com/blog/AnalyticsonAzure/from-files-to-insights-building-a-medallion-architecture-with-microsoft-fabric/4571519",
    },
    "databricks": {
        "title": "Databricks Blog: Lakeflow and agentic data engineering",
        "url": "https://www.databricks.com/blog/lakeflow-new-era-agentic-data-engineering",
    },
}


def refs_md(sources: list[dict[str, str]]) -> str:
    links = " · ".join(f"[{s['title']}]({s['url']})" for s in sources)
    return f"\n\n**Sources:** {links}"


CONCEPTS: list[dict[str, Any]] = [
    {
        "id": "research-concept-agentic-data-engineering-control-plane",
        "term": "Agentic Data Engineering Control Plane",
        "category": "SYSTEM DESIGN",
        "difficulty": "ARCHITECT",
        "definition": "The governed layer that lets software agents observe and propose data-platform work while enforcing identity, policy, approval, and audit boundaries.",
        "explanation": "A control plane separates an agent's planning loop from the systems that execute jobs, query data, or change production configuration. It evaluates each requested tool against a human or workload identity, data scope, environment, and risk class. High-impact changes require approval or staged execution, while read-only actions can use narrower automatic permissions. The plane records the prompt context, tool request, result, and policy decision so operators can reconstruct an action.",
        "keyPoints": [
            "Keep planning separate from privileged execution tools.",
            "Authorize every tool call against the caller, target data, and environment.",
            "Route production writes and sensitive exports through explicit approval policies.",
            "Audit the decision and result, not only the final agent response.",
        ],
        "relatedTerms": ["Agent Execution Sandbox", "Human Approval Gate", "Data Access Delegation"],
        "sources": [SOURCES["thoughtworks"], SOURCES["aws_streaming"]],
    },
    {
        "id": "research-concept-agent-execution-sandbox",
        "term": "Agent Execution Sandbox",
        "category": "SYSTEM DESIGN",
        "difficulty": "HARD",
        "definition": "An isolated execution environment that limits what an AI agent can read, run, and connect to while it performs a bounded task.",
        "explanation": "The sandbox should apply resource quotas, network egress rules, filesystem boundaries, short-lived credentials, and a task-specific tool allowlist. A sandbox reduces blast radius but does not replace authorization at the data service: a valid identity can still request an unsafe query. Treat generated code and tool output as untrusted input, and capture resource use and policy events for review.",
        "keyPoints": [
            "Use per-task or per-session isolation with explicit CPU, memory, and time limits.",
            "Restrict network destinations and deny ambient cloud credentials.",
            "Pair runtime isolation with least-privilege checks at each data service.",
            "Test escape, exfiltration, prompt-injection, and cost-exhaustion paths.",
        ],
        "relatedTerms": ["Agentic Data Engineering Control Plane", "Least Privilege"],
        "sources": [SOURCES["thoughtworks"]],
    },
    {
        "id": "research-concept-agent-data-access-delegation",
        "term": "Agent Data Access Delegation",
        "category": "GENERAL DE",
        "difficulty": "ARCHITECT",
        "definition": "A policy pattern in which an agent uses bounded authority derived from a user or workload identity instead of broad, ambient platform credentials.",
        "explanation": "The platform should preserve identity and policy context from the initiating user through query planning, retrieval, and tool execution. Data filters such as tenant, row, column, and purpose restrictions must be evaluated by trusted services, not only described in the prompt. Delegation tokens should be scoped, short-lived, and auditable. If identity cannot be propagated safely, the agent should fall back to a non-sensitive source or refuse the operation.",
        "keyPoints": [
            "Propagate subject, tenant, and purpose context to the enforcement point.",
            "Use short-lived scoped tokens rather than shared service secrets.",
            "Enforce row and column policies in the governed data service.",
            "Record denied requests and avoid leaking protected values in explanations.",
        ],
        "relatedTerms": ["Agent Execution Sandbox", "Row-Level Security", "Data Context Layer"],
        "sources": [SOURCES["thoughtworks"], SOURCES["google"]],
    },
    {
        "id": "research-concept-human-approval-gate-for-data-agents",
        "term": "Human Approval Gate for Data Agents",
        "category": "GENERAL DE",
        "difficulty": "MEDIUM",
        "definition": "A review checkpoint that pauses an automated agent before a consequential action such as changing a production pipeline, granting access, or exporting sensitive data.",
        "explanation": "A useful approval gate presents the intended action, target, affected data, estimated cost, policy checks, and rollback plan in a form a reviewer can assess. Approval should be bound to the exact action payload and expire if that payload changes. Low-risk read-only work can remain automated, while production writes and access changes use explicit thresholds. Measure approval delay and rejected actions so the workflow can be improved without silently removing controls.",
        "keyPoints": [
            "Bind approval to the exact proposed action and target.",
            "Show impact, cost, authorization, and rollback evidence before approval.",
            "Revalidate policy if the action changes or the approval expires.",
            "Use risk tiers so human review focuses on consequential actions.",
        ],
        "relatedTerms": ["Agentic Data Engineering Control Plane", "Change Management"],
        "sources": [SOURCES["thoughtworks"], SOURCES["dora"]],
    },
    {
        "id": "research-concept-semantic-context-contract-for-agents",
        "term": "Semantic Context Contract for Data Agents",
        "category": "DBT",
        "difficulty": "ARCHITECT",
        "definition": "A versioned definition of business terms, metrics, entities, and permitted joins that an AI system can use when answering data questions.",
        "explanation": "The contract describes metric grain, dimensions, time semantics, filters, ownership, and freshness expectations in a machine-readable or queryable form. It limits an agent from inventing joins or choosing a technically valid but semantically wrong measure. Changes require review because a definition update can alter both human reports and generated answers. Consumers should receive the contract version and lineage with the query result.",
        "keyPoints": [
            "Declare metric grain, time window, dimensions, and default filters.",
            "Link measures to governed models and ownership metadata.",
            "Version changes and test representative questions against expected results.",
            "Return lineage and contract version with generated answers.",
        ],
        "relatedTerms": ["Semantic Layer", "Data Contract", "Agentic Data Engineering Control Plane"],
        "sources": [SOURCES["dbt26"], SOURCES["google"]],
    },
    {
        "id": "research-concept-data-product-platform-maturity",
        "term": "Data Product Platform Maturity",
        "category": "SYSTEM DESIGN",
        "difficulty": "ARCHITECT",
        "definition": "A progression from manually coordinated data jobs toward a self-service platform that provides standard interfaces, policy, observability, and lifecycle controls for data products.",
        "explanation": "At low maturity, teams depend on tickets and bespoke scripts to create or change datasets. A more capable platform supplies reusable build paths, contracts, access policy, deployment, monitoring, and ownership metadata. The platform should let domain teams work independently while keeping shared reliability and compliance rules consistent. Maturity is demonstrated by safe self-service and lower coordination overhead, not by the number of platform tools.",
        "keyPoints": [
            "Measure user tasks completed without platform-team intervention.",
            "Provide standard contracts, deployment paths, policy, and audit records.",
            "Include ownership, service objectives, migration, and retirement in the lifecycle.",
            "Keep platform abstractions optional where workload needs differ.",
        ],
        "relatedTerms": ["Data Product", "Internal Developer Platform", "Data Contract"],
        "sources": [SOURCES["fowler"]],
    },
    {
        "id": "research-concept-data-platform-paved-path",
        "term": "Data Platform Paved Path",
        "category": "GENERAL DE",
        "difficulty": "MEDIUM",
        "definition": "A supported, reusable route for teams to build, deploy, secure, and operate a common class of data workloads.",
        "explanation": "A paved path combines templates, approved dependencies, access patterns, deployment automation, observability defaults, and support boundaries. Teams can depart from it when requirements justify a different design, but the exception should be documented and operated deliberately. A path that only standardizes a tool without reducing delivery effort is not a useful platform capability. Track adoption alongside setup time, failure rate, and user satisfaction.",
        "keyPoints": [
            "Bundle templates with production controls and operational ownership.",
            "Make the safe default easier than the bespoke alternative.",
            "Allow documented exceptions for valid workload constraints.",
            "Measure adoption and task outcomes rather than template downloads.",
        ],
        "relatedTerms": ["Data Product Platform Maturity", "DataOps", "Platform Engineering"],
        "sources": [SOURCES["fowler"], SOURCES["cncf"]],
    },
    {
        "id": "research-concept-data-product-contract-slo",
        "term": "Data Product Contract and Service Objectives",
        "category": "DBT",
        "difficulty": "HARD",
        "definition": "A consumer-facing agreement that describes a data product's schema, semantics, quality checks, freshness, availability, ownership, and change policy.",
        "explanation": "The contract should identify the product's grain, keys, nullable fields, accepted values, and compatibility rules alongside freshness and completeness objectives. Producers run checks before publishing and emit measurable evidence after each release. Consumers need a deprecation window and a way to test changes before cutover. A contract is useful only when its guarantees are monitored and its failure path is clear.",
        "keyPoints": [
            "Define schema compatibility and semantic expectations at the product boundary.",
            "Attach freshness, completeness, and availability objectives to consumer needs.",
            "Validate releases and publish evidence with lineage and ownership.",
            "Specify deprecation, rollback, and incident communication procedures.",
        ],
        "relatedTerms": ["Data Contract", "Data Freshness SLO", "Data Product Platform Maturity"],
        "sources": [SOURCES["fowler"], SOURCES["dbt26"]],
    },
    {
        "id": "research-concept-data-freshness-slo",
        "term": "Data Freshness Service-Level Objective",
        "category": "GENERAL DE",
        "difficulty": "EASY",
        "definition": "A measurable target for the delay between a source change and the point at which a consumer can use the corresponding trusted data.",
        "explanation": "Freshness has at least two clocks: source event time and publication time. A useful objective names the table or product, the percentile or window, the consumer, and the consequence of missing the target. It should include late data and outage recovery rather than only normal processing time. Teams can then compare a scheduled batch, incremental micro-batch, and continuous stream against the same business requirement.",
        "keyPoints": [
            "Measure end-to-end source-to-consumer lag, not only job duration.",
            "Separate event time, ingestion time, and publication time.",
            "Include late arrival and recovery behavior in the objective.",
            "Choose batch or streaming based on required freshness and operating cost.",
        ],
        "relatedTerms": ["Streaming Freshness SLO", "Data Product Contract and Service Objectives"],
        "sources": [SOURCES["uber"]],
    },
    {
        "id": "research-concept-cdc-context-synchronization",
        "term": "CDC Context Synchronization",
        "category": "DATALAKE ARCHITECTURE",
        "difficulty": "HARD",
        "definition": "The process of keeping analytical and AI-facing context aligned with changes captured from operational databases.",
        "explanation": "A CDC pipeline needs to preserve source ordering, deletes, schema changes, and transaction boundaries while publishing usable context to downstream consumers. The serving layer can lag the raw change log, so it must expose a freshness watermark and a replay path. Consumers should distinguish a missing record from one that has not arrived yet. This pattern is especially important when an agent or application relies on recent customer, inventory, or policy state.",
        "keyPoints": [
            "Preserve source transaction identity and change ordering where required.",
            "Represent deletes and schema changes explicitly.",
            "Expose the last applied source position or freshness watermark.",
            "Reconcile serving state after replay or partial failure.",
        ],
        "relatedTerms": ["Change Data Capture", "Data Freshness Service-Level Objective", "Data Context Layer"],
        "sources": [SOURCES["aws_streaming"], SOURCES["google"]],
    },
    {
        "id": "research-concept-stream-to-table-commit-boundary",
        "term": "Stream-to-Table Commit Boundary",
        "category": "DATABRICKS",
        "difficulty": "ARCHITECT",
        "definition": "The consistency boundary between a streaming engine's checkpoint progress and the durable commit visible in its table sink.",
        "explanation": "A checkpoint may record that a source range was processed while a table sink commit may be delayed, retried, or written through a separate transaction protocol. Recovery must determine which source range is already represented in the target and replay only work that is safe to repeat. Stable batch identifiers, idempotent writes, and reconciliation queries help prevent gaps and duplicates. Compaction and retention should not remove evidence needed for recovery.",
        "keyPoints": [
            "Document the ordering between source progress, checkpoint, and sink commit.",
            "Make retried batches idempotent using stable transaction or batch identifiers.",
            "Reconcile source offsets with committed table versions after failure.",
            "Test process crash and network interruption at every commit boundary.",
        ],
        "relatedTerms": ["Checkpointing", "Idempotent Pipeline", "Change Data Capture"],
        "sources": [SOURCES["uber"]],
    },
    {
        "id": "research-concept-streaming-small-file-compaction-debt",
        "term": "Streaming Small-File Compaction Debt",
        "category": "DATALAKE ARCHITECTURE",
        "difficulty": "MEDIUM",
        "definition": "The accumulating query and storage cost caused when frequent stream writes produce many undersized data files.",
        "explanation": "Lower-latency writes often create smaller files, increasing object listing, metadata planning, and scan overhead. Compaction can restore efficient file sizes, but it consumes compute and must coordinate with concurrent readers and writers. A maintenance policy should use file-size distribution and query performance rather than a fixed schedule alone. Retention and stream freshness objectives determine how much compaction work can safely lag.",
        "keyPoints": [
            "Track file count, size distribution, metadata planning time, and scan amplification.",
            "Balance write latency against downstream read cost.",
            "Schedule compaction with concurrency and table-format semantics in mind.",
            "Measure net compute and storage impact after maintenance.",
        ],
        "relatedTerms": ["Small Files Problem", "Data Freshness Service-Level Objective"],
        "sources": [SOURCES["uber"]],
    },
    {
        "id": "research-concept-open-lakehouse-interoperability-contract",
        "term": "Open Lakehouse Interoperability Contract",
        "category": "MODERN LAKEHOUSE",
        "difficulty": "ARCHITECT",
        "definition": "A tested agreement for how multiple engines discover, read, write, and govern shared table data and metadata.",
        "explanation": "Open file formats alone do not guarantee interoperability. A production contract specifies catalog APIs, supported operations, commit behavior, schema and partition evolution, deletion semantics, identity propagation, and the engines that are allowed to write. Compatibility tests should exercise the actual operation matrix across versions and include concurrent writers. Teams should record unsupported features and recovery steps before claiming cross-engine access.",
        "keyPoints": [
            "Test catalog, metadata, and transaction behavior across the selected engines.",
            "Include schema evolution, deletes, concurrent writes, and time travel.",
            "Track engine versions and feature support as a compatibility matrix.",
            "Separate open-format claims from measured end-to-end interoperability.",
        ],
        "relatedTerms": ["Apache Iceberg REST Catalog", "Delta Lake", "Apache Hudi"],
        "sources": [SOURCES["google"], SOURCES["aws_lakehouse"]],
    },
    {
        "id": "research-concept-federated-metadata-control-plane",
        "term": "Federated Metadata Control Plane",
        "category": "MODERN LAKEHOUSE",
        "difficulty": "ARCHITECT",
        "definition": "A governance architecture that lets distributed catalogs and data products share discovery and policy context without requiring every dataset to move into one store.",
        "explanation": "Federation needs stable identifiers, ownership, lineage, classification, and policy translation across systems. A central view can improve discovery, but each source system must remain an enforcement point for access it owns. The design should define conflict precedence when metadata or policy differs and show how revocation propagates. Cross-cloud caching can improve access patterns but must respect residency, freshness, and egress constraints.",
        "keyPoints": [
            "Separate metadata discovery from authorization enforcement.",
            "Define identity mapping, policy precedence, and revocation behavior.",
            "Expose lineage and ownership across source catalogs.",
            "Include residency, freshness, and cache invalidation in the design.",
        ],
        "relatedTerms": ["Data Catalog", "Data Mesh", "Open Lakehouse Interoperability Contract"],
        "sources": [SOURCES["google"], SOURCES["aws_lakehouse"]],
    },
    {
        "id": "research-concept-cross-cloud-egress-aware-placement",
        "term": "Cross-Cloud Egress-Aware Data Placement",
        "category": "MODERN LAKEHOUSE",
        "difficulty": "HARD",
        "definition": "A placement decision that weighs compute location, data gravity, egress charges, latency, residency, and operational ownership across cloud boundaries.",
        "explanation": "A shortcut or federated query can avoid bulk copying but may still transfer bytes repeatedly during scans. Architects should estimate recurring query volume, cacheability, metadata calls, and failure recovery costs before choosing remote access. The decision can differ by workload: interactive exploration may use a cache, while durable transformation may run near the data. Record measured traffic and cost so the architecture can be revisited when usage changes.",
        "keyPoints": [
            "Estimate bytes transferred per workload and query frequency.",
            "Compare remote access, caching, and compute-near-data options.",
            "Include residency, identity, and failure-domain constraints.",
            "Recheck the decision using actual egress and latency measurements.",
        ],
        "relatedTerms": ["Data Gravity", "Federated Metadata Control Plane", "FinOps"],
        "sources": [SOURCES["aws_lakehouse"], SOURCES["google"]],
    },
    {
        "id": "research-concept-data-trust-slo",
        "term": "Data Trust Service-Level Objective",
        "category": "DBT",
        "difficulty": "MEDIUM",
        "definition": "A measurable commitment that a data product meets agreed freshness, quality, lineage, and ownership expectations for its consumers.",
        "explanation": "Trust is not a single quality score. A useful objective combines checks that matter to a specific decision, such as completeness, freshness, accepted-value ranges, and a known owner. The producer publishes evidence with each release and defines an incident path when an objective is missed. Teams should track false alarms and uncovered failures so the checks remain meaningful.",
        "keyPoints": [
            "Choose quality signals tied to consumer decisions.",
            "Publish check results, freshness, lineage, and ownership together.",
            "Define a response and communication path for objective breaches.",
            "Review false positives and missed incidents over time.",
        ],
        "relatedTerms": ["Data Product Contract and Service Objectives", "Data Quality"],
        "sources": [SOURCES["dbt26"], SOURCES["fowler"]],
    },
    {
        "id": "research-concept-data-quality-evidence-lineage",
        "term": "Data Quality Evidence with Lineage",
        "category": "GENERAL DE",
        "difficulty": "EASY",
        "definition": "A record connecting a quality check result to the data version, pipeline run, rules, and upstream inputs that produced it.",
        "explanation": "A failed check is actionable only when an operator can locate the affected data and identify the producing change. Evidence should include check name, result, scope, timestamp, dataset version, and lineage to source inputs. This supports incident triage and allows consumers to distinguish a trusted release from an incomplete run. It also makes quality history comparable across deployments.",
        "keyPoints": [
            "Record the dataset version and pipeline run with each check result.",
            "Attach rule definition, affected rows, and upstream lineage.",
            "Keep failed and passed results available for audit and trend analysis.",
            "Link consumer notifications to the affected product and owner.",
        ],
        "relatedTerms": ["Data Observability", "Data Trust Service-Level Objective", "OpenLineage"],
        "sources": [SOURCES["dbt26"], SOURCES["fowler"]],
    },
    {
        "id": "research-concept-ai-data-workload-unit-economics",
        "term": "AI Data Workload Unit Economics",
        "category": "MODERN LAKEHOUSE",
        "difficulty": "HARD",
        "definition": "The cost model for delivering one useful AI-enabled data task, including retrieval, query compute, model inference, storage, and human review.",
        "explanation": "An agent's cost is broader than token usage. Repeated context retrieval, warehouse scans, streaming freshness, tool retries, and reviewer time can dominate the bill. Measure cost per successful task or business outcome alongside latency and quality, then place budgets on each workflow. A fallback path should reduce spend without returning a less trustworthy result.",
        "keyPoints": [
            "Attribute model, query, retrieval, storage, and review costs to a workflow.",
            "Track cost per successful task with quality and latency guardrails.",
            "Set retry and spend limits at the agent and platform layers.",
            "Compare on-demand, cached, and precomputed context strategies.",
        ],
        "relatedTerms": ["FinOps", "Agentic Data Engineering Control Plane", "Cross-Cloud Egress-Aware Data Placement"],
        "sources": [SOURCES["dbt26"], SOURCES["aws_streaming"]],
    },
    {
        "id": "research-concept-ai-assisted-data-change-control",
        "term": "AI-Assisted Data Change Control",
        "category": "SYSTEM DESIGN",
        "difficulty": "ARCHITECT",
        "definition": "A release process for AI-generated data code that preserves reviewability, test evidence, small changes, and rollback control.",
        "explanation": "Generation speed does not guarantee safe delivery. Teams should keep changes reviewable, validate schemas and data invariants, run representative pipeline tests, and compare production delivery outcomes before scaling automation. A generated change should include its assumptions and affected datasets so a reviewer can understand its impact. Measure delivery stability and recovery as well as developer throughput.",
        "keyPoints": [
            "Keep generated changes small enough to review and revert.",
            "Run schema, data-quality, integration, and policy checks before release.",
            "Measure production stability separately from code-generation speed.",
            "Retain human ownership for architectural and policy decisions.",
        ],
        "relatedTerms": ["DataOps", "Change Management", "Human Approval Gate for Data Agents"],
        "sources": [SOURCES["dora"], SOURCES["dbt26"]],
    },
    {
        "id": "research-concept-cloud-native-data-platform-operating-model",
        "term": "Cloud-Native Data Platform Operating Model",
        "category": "SYSTEM DESIGN",
        "difficulty": "MEDIUM",
        "definition": "The team, platform, and operational practices required to run data products on containerized or managed cloud-native infrastructure.",
        "explanation": "The operating model includes service ownership, deployment paths, capacity controls, incident response, and the boundary between platform teams and domain teams. Kubernetes adoption is a signal that cloud-native operations are common, but it does not prove every analytics job belongs on Kubernetes. Compare managed services and self-operated clusters using workload needs, reliability obligations, security controls, and team capability.",
        "keyPoints": [
            "Assign explicit ownership for platform services and data products.",
            "Choose Kubernetes only when its control and portability justify its operating burden.",
            "Standardize deployment, telemetry, secrets, and recovery paths.",
            "Measure user outcomes and on-call burden alongside utilization.",
        ],
        "relatedTerms": ["Platform Engineering", "Data Product Platform Maturity", "FinOps"],
        "sources": [SOURCES["cncf"], SOURCES["fowler"]],
    },
]


QA_ITEMS: list[dict[str, Any]] = [
    {
        "id": "research-qa-dora-ai-change-control",
        "source": "DORA Research",
        "category": "DataOps & SDLC",
        "niche": "AI-assisted data engineering change control",
        "difficulty": "HARD",
        "domain": "DataOps & Architecture Governance",
        "subdomain": "AI-assisted delivery",
        "question": "A team reports that AI generates pipeline code faster, but production incidents and review effort are rising. How would you evaluate and improve the rollout?",
        "answer": """Treat code-generation speed as one input, not the success metric. DORA describes AI as an amplifier of the organization's existing engineering system, so first establish baselines for delivery throughput, change failure, recovery, review time, and batch size. Compare results by workflow and change risk instead of attributing every movement to AI adoption.

Keep generated changes small, require an accountable reviewer, and run schema, data-quality, security, and integration checks before release. Track whether changes reach production safely and whether the amount of rework or incident recovery changes. Expand the use case only when quality and stability remain within the team's agreed limits.""" + refs_md([SOURCES["dora"]]),
        "rubricPoints": [
            "Separates generation speed from delivery and reliability outcomes.",
            "Uses a baseline and measures throughput, stability, review effort, and recovery.",
            "Applies small changes with tests and human review.",
            "Treats the report as evidence about engineering systems, not a guarantee for every team.",
        ],
        "tags": ["AI", "DataOps", "DORA", "Change Control"],
        "sources": [SOURCES["dora"]],
    },
    {
        "id": "research-qa-dbt-trust-cost-survey",
        "source": "dbt Labs State of Analytics Engineering",
        "category": "DBT",
        "niche": "Trust, governance, and data platform costs",
        "difficulty": "ARCHITECT",
        "domain": "Data Governance & Quality",
        "subdomain": "Analytics engineering strategy",
        "question": "A data leader cites the 2026 dbt Labs survey to justify AI investment. How do you turn its trust and cost findings into a platform plan without treating survey results as universal benchmarks?",
        "answer": """The report is a vendor-sponsored survey signal, not a universal cost benchmark. It reports that trust in data is a leading organizational priority and that more respondents saw warehouse and compute spending rise than team budgets. Use those findings to prioritize measurement, then validate them against your own products and usage.

Build a cost baseline by workload and consumer; measure freshness, quality failures, and lineage coverage for the same products. Fund changes that improve trust and demonstrate cost per useful outcome, such as eliminating repeated scans or making expensive models incremental. Keep AI spend, platform compute, and staffing assumptions distinct so the survey does not get converted into an unsupported savings promise.""" + refs_md([SOURCES["dbt26"]]),
        "rubricPoints": [
            "Qualifies the report as a vendor-sponsored survey.",
            "Separates the report's findings from the organization's own baseline.",
            "Connects data trust measures to product-level cost and quality evidence.",
            "Avoids unsupported ROI or savings guarantees.",
        ],
        "tags": ["dbt", "FinOps", "Data Quality", "AI"],
        "sources": [SOURCES["dbt26"]],
    },
    {
        "id": "research-qa-thoughtworks-agent-guardrails",
        "source": "Thoughtworks Technology Radar",
        "category": "SYSTEM DESIGN",
        "niche": "Guarded agent execution in data platforms",
        "difficulty": "ARCHITECT",
        "domain": "Data Governance & Quality",
        "subdomain": "Agent security",
        "question": "How would you constrain a data agent that can query lakehouse tables, launch jobs, and modify pipeline configuration?",
        "answer": """Put a policy-enforced control plane between the agent and production tools. Give each task a short-lived identity and a narrow allowlist; enforce row, column, tenant, and environment permissions at the data or job service, not only in the prompt. Run generated code in a sandbox with resource quotas and restricted network access.

Classify actions by impact. Read-only queries can be automated within a budget, while access grants, production writes, and deployment changes require approval bound to the exact action. Log the request, policy decision, tool result, and cost. Exercise prompt injection, credential exposure, exfiltration, runaway retries, and rollback in threat-model and incident drills.""" + refs_md([SOURCES["thoughtworks"]]),
        "rubricPoints": [
            "Separates the agent planner from privileged execution.",
            "Uses least privilege, identity propagation, and service-side authorization.",
            "Adds sandboxing, risk-based approval, audit, and cost limits.",
            "Includes adversarial and recovery testing.",
        ],
        "tags": ["Agent Security", "Sandboxing", "Least Privilege", "Data Platform"],
        "sources": [SOURCES["thoughtworks"]],
    },
    {
        "id": "research-qa-fowler-data-product-platform",
        "source": "Martin Fowler",
        "category": "SYSTEM DESIGN",
        "niche": "Data product platform maturity",
        "difficulty": "HARD",
        "domain": "Data Lakehouse & Architecture",
        "subdomain": "Data products",
        "question": "A data platform team is overwhelmed by tickets for new tables, access, and deployment. What changes move it toward safe self-service data products?",
        "answer": """Move repeatable work into a supported platform path: product templates, schema and semantic contracts, ownership metadata, policy checks, deployment automation, and operational monitoring. Domain teams should be able to create and evolve products without waiting for a platform engineer for every routine action.

Retain central controls for identity, audit, reliability, and cost while letting domains own their models and service objectives. Include migration and retirement paths so abandoned products do not become permanent liabilities. Measure task completion without assistance, lead time, policy exceptions, incidents, and consumer satisfaction; tool count alone does not show platform maturity.""" + refs_md([SOURCES["fowler"]]),
        "rubricPoints": [
            "Identifies the shift from ticket-driven operations to governed self-service.",
            "Describes reusable contracts, policy, deployment, observability, and ownership.",
            "Includes data-product lifecycle, migration, and retirement.",
            "Defines outcome measures for users and platform operators.",
        ],
        "tags": ["Data Products", "Platform Engineering", "Self-service"],
        "sources": [SOURCES["fowler"]],
    },
    {
        "id": "research-qa-uber-stream-commit-recovery",
        "source": "Uber Engineering",
        "category": "KAFKA",
        "niche": "Streaming checkpoint and table-commit recovery",
        "difficulty": "ARCHITECT",
        "domain": "Data Pipelines & Ingestion",
        "subdomain": "Streaming reliability",
        "question": "A stream processor checkpoints source progress, then loses connectivity while committing to a lakehouse table. How do you prevent missing or duplicated records during recovery?",
        "answer": """Treat source progress and table visibility as separate state that must be reconciled. Use stable batch or transaction identifiers and an idempotent sink operation so a retried range cannot silently create a second logical result. Record the source interval associated with each committed table version, and on recovery compare the checkpoint, sink commits, and source offsets before advancing.

Test crashes between processing, checkpoint persistence, and table commit. Alert on lag and commit divergence, and preserve enough history to replay safely. Uber's case study emphasizes coordination between streaming checkpoints and table commits, plus small-file management; the exact mechanics depend on the stream engine and table format you choose.""" + refs_md([SOURCES["uber"]]),
        "rubricPoints": [
            "Distinguishes source offsets, processor checkpoints, and sink commits.",
            "Uses idempotent writes and durable batch identity.",
            "Defines reconciliation and replay after partial failure.",
            "Includes lag, commit divergence, and small-file monitoring.",
        ],
        "tags": ["Streaming", "Checkpointing", "Idempotency", "Lakehouse"],
        "sources": [SOURCES["uber"]],
    },
    {
        "id": "research-qa-aws-agentic-streaming-patterns",
        "source": "AWS Big Data Blog",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Real-time data patterns for agentic workflows",
        "difficulty": "MEDIUM",
        "domain": "Data Pipelines & Ingestion",
        "subdomain": "Streaming and AI",
        "question": "When is streaming data useful to an agentic workflow, and what distinct architecture patterns should an architect compare?",
        "answer": """Compare the business need before selecting an agent pattern. The AWS article describes three useful shapes: a stream updates features or context used for inference and action; an event triggers an agent workflow; or CDC keeps an operational context layer synchronized. These patterns have different freshness, cost, state, and safety requirements.

For each, specify event-time handling, deduplication, recovery, access policy, and the human boundary for actions. A stream that updates context does not automatically justify an autonomous agent, and an agent should not inherit broad rights from the streaming service. Start with a bounded use case and compare end-to-end freshness and operating cost with a scheduled batch design.""" + refs_md([SOURCES["aws_streaming"]]),
        "rubricPoints": [
            "Distinguishes feature/context update, event-triggered agent, and CDC synchronization patterns.",
            "States freshness, state, recovery, and access-control requirements.",
            "Compares streaming with a batch alternative.",
            "Separates real-time context from permission to take action.",
        ],
        "tags": ["Streaming", "Agentic AI", "CDC", "Architecture"],
        "sources": [SOURCES["aws_streaming"]],
    },
    {
        "id": "research-qa-google-open-lakehouse-context",
        "source": "Google Cloud Blog",
        "category": "MODERN LAKEHOUSE",
        "niche": "Cross-cloud metadata and semantic context",
        "difficulty": "ARCHITECT",
        "domain": "Data Lakehouse & Architecture",
        "subdomain": "Open lakehouse",
        "question": "How would you design a multi-cloud lakehouse so multiple engines can discover governed data and provide useful context to AI applications?",
        "answer": """Separate storage interoperability, metadata discovery, semantic context, and authorization. Select an open table and catalog interface only after testing the operations your engines need, including schema changes, deletes, concurrent writes, and recovery. A discovery layer should connect ownership, lineage, business definitions, and freshness to the table metadata.

Keep access enforcement at the systems that own the data and define how identity and policy travel to each engine. Model caching and remote scans against real query patterns, data residency, and egress cost. Treat performance statements in vendor integration posts as hypotheses to measure in your workload, not portability guarantees.""" + refs_md([SOURCES["google"], SOURCES["aws_lakehouse"]]),
        "rubricPoints": [
            "Separates open table formats from catalog and semantic interoperability.",
            "Defines policy enforcement and identity propagation across engines.",
            "Includes metadata, lineage, freshness, cache, residency, and egress.",
            "Calls for workload-specific compatibility and performance tests.",
        ],
        "tags": ["Iceberg", "Multi-cloud", "Metadata", "AI Context"],
        "sources": [SOURCES["google"], SOURCES["aws_lakehouse"]],
    },
    {
        "id": "research-qa-cncf-kubernetes-platform-fit",
        "source": "CNCF",
        "category": "SYSTEM DESIGN",
        "niche": "Kubernetes versus managed data services",
        "difficulty": "MEDIUM",
        "domain": "Compute & Orchestration",
        "subdomain": "Cloud-native platforms",
        "question": "A team cites Kubernetes adoption as a reason to move all data workloads onto Kubernetes. What evidence should determine the platform choice?",
        "answer": """Adoption statistics show ecosystem maturity, not that Kubernetes is the best runtime for every workload. The CNCF survey reports widespread production use among container users, but the decision should start from workload needs and the team's ability to operate the control plane.

Compare managed services and Kubernetes on stateful recovery, isolation, scheduling, autoscaling, network and storage behavior, upgrade ownership, security controls, and on-call burden. Pilot representative jobs, failure recovery, and cost. Use Kubernetes when its operational control or portability provides measurable value; retain a managed service when it meets requirements with less failure surface.""" + refs_md([SOURCES["cncf"]]),
        "rubricPoints": [
            "Frames survey adoption as ecosystem context rather than proof of fit.",
            "Compares operational ownership, recovery, isolation, and cost.",
            "Tests representative failures and workloads before migration.",
            "Allows managed and Kubernetes-based services to coexist.",
        ],
        "tags": ["Kubernetes", "Platform Engineering", "Cloud Native"],
        "sources": [SOURCES["cncf"]],
    },
    {
        "id": "research-qa-fabric-file-to-bronze-history",
        "source": "Microsoft Community Hub",
        "category": "FABRIC",
        "niche": "File ingestion, staging, and Bronze history",
        "difficulty": "EASY",
        "domain": "Data Pipelines & Ingestion",
        "subdomain": "Microsoft Fabric",
        "question": "A Fabric pipeline reads a folder of vendor workbooks on each run. How do you keep staging useful while ensuring Bronze preserves a trustworthy history?",
        "answer": """Treat staging as the current extraction result and Bronze as the accepted source history. Capture a stable file identity, source modification time, ingestion time, schema version, and a record hash; use those fields to detect replays and changes. A repeated folder scan should not blindly append every row again.

Promote a file only after schema and business checks pass. Preserve rejected files and reasons for review, then use idempotent merge or append rules appropriate to the source's change semantics. The Microsoft example demonstrates a staged file-to-lakehouse handoff; the exact history and replay policy should be designed for your source contract.""" + refs_md([SOURCES["fabric"]]),
        "rubricPoints": [
            "Distinguishes current staging from durable Bronze history.",
            "Uses source identity and metadata to make reprocessing idempotent.",
            "Defines validation, quarantine, and change-detection behavior.",
            "Links the policy to the source's update semantics.",
        ],
        "tags": ["Microsoft Fabric", "Medallion", "File Ingestion", "Idempotency"],
        "sources": [SOURCES["fabric"]],
    },
    {
        "id": "research-qa-integrated-data-workflow-platform",
        "source": "Databricks Blog",
        "category": "DATABRICKS",
        "niche": "Integrated versus composable data workflows",
        "difficulty": "HARD",
        "domain": "Data Lakehouse & Architecture",
        "subdomain": "Data platform evaluation",
        "question": "A vendor promotes an integrated data workflow platform with AI-assisted operations. How should an architect decide whether to adopt it or keep composable tools?",
        "answer": """Treat the product announcement as a capability signal, then score the actual workload. Compare source and target coverage, orchestration semantics, observability, governance, CI/CD, portability, failure recovery, and the effort to operate separate tools. Run a representative pipeline through deployment, incident response, and rollback in a non-production environment.

Evaluate AI assistance separately: constrain its permissions, preserve human review for consequential changes, and measure whether it reduces operational work without worsening reliability or cost. Record product preview or general-availability status with a review date because vendor capabilities change.""" + refs_md([SOURCES["databricks"], SOURCES["dora"]]),
        "rubricPoints": [
            "Separates a vendor capability claim from workload evidence.",
            "Compares integrated and composable designs across operations and portability.",
            "Evaluates AI permissions, approval, reliability, and cost independently.",
            "Tracks product availability and review date.",
        ],
        "tags": ["Databricks", "DataOps", "AI", "Vendor Evaluation"],
        "sources": [SOURCES["databricks"], SOURCES["dora"]],
    },
]


ARCHITECTURE_ITEMS: list[dict[str, Any]] = [
    {
        "id": "research-arch-factory-telemetry-freshness",
        "source": "Research-informed design exercise",
        "category": "Real-Time Streaming & Compute Optimization",
        "niche": "Factory telemetry freshness and batch-versus-stream",
        "difficulty": "EASY",
        "question": "A factory operations team receives sensor files every hour and needs a trusted equipment-health view within fifteen minutes. Design the first release and explain whether it needs continuous streaming.",
        "constraints": ["Hourly source cadence", "Late event arrival", "Read-only dashboard"],
        "answer": """### Proposed design
Start with incremental file ingestion on a short schedule and define event time, source file identity, and a fifteen-minute freshness objective. Land immutable source records in Bronze, deduplicate and validate them in Silver, then publish equipment-level aggregates to the dashboard. Keep the hourly history available for backfill and comparison.

### Operations and trade-offs
Measure end-to-end freshness, late-file rate, rejected records, and dashboard query latency. If measured demand requires lower than the scheduled pipeline can reliably provide, add a stream for new events while keeping batch replay as the recovery path. Streaming now would add state, checkpoint, and on-call complexity without evidence that the business needs it.""" + refs_md([SOURCES["uber"]]),
        "tradeoffs": ["A short-interval batch design is simpler; a stream can reduce lag but adds state and recovery work."],
        "sources": [SOURCES["uber"]],
    },
    {
        "id": "research-arch-retail-order-cdc",
        "source": "Research-informed design exercise",
        "category": "Apache Kafka & Real-Time CDC Architecture",
        "niche": "Retail order CDC with duplicate and late events",
        "difficulty": "MEDIUM",
        "question": "Design a lakehouse pipeline for retail orders, refunds, and inventory changes arriving through CDC and application events. Duplicate delivery is expected, and the operations dashboard has a ten-minute freshness target.",
        "constraints": ["The order database is the financial source of truth.", "Events may be redelivered or arrive out of order.", "A daily finance report must reconcile to the source database."],
        "answer": """### Proposed design
Capture database changes and application events with stable source keys and transaction metadata. Write raw, append-only records to Bronze, then build idempotent Silver state with explicit delete and correction handling. Use event time with a bounded lateness policy for streaming aggregates; retain the change log and batch reconciliation for finance.

### Reliability and trade-offs
Expose source offset, table commit version, and freshness watermark. Reconcile daily totals and refund states against the operational ledger. A streaming path serves the ten-minute view, while a batch correction path handles late events and backfills. The extra path increases operational surface, so keep one canonical transformation contract and monitor disagreement between views.""" + refs_md([SOURCES["uber"], SOURCES["aws_streaming"]]),
        "tradeoffs": ["Streaming improves dashboard freshness; daily reconciliation and replay add operational work."],
        "sources": [SOURCES["uber"], SOURCES["aws_streaming"]],
    },
    {
        "id": "research-arch-governed-analytics-agent",
        "source": "Research-informed design exercise",
        "category": "LLM & RAG Infrastructure Pipelines",
        "niche": "Governed analytics agent for finance and HR",
        "difficulty": "ARCHITECT",
        "question": "Design an internal analytics agent that answers questions over finance and HR data, can run read-only queries, and may create a draft report. It must preserve department-level access and never send data to unapproved destinations.",
        "constraints": ["Finance and HR have different row and column policies.", "The agent can call a SQL tool and a report-drafting tool.", "Production data access must be auditable."],
        "answer": """### Trust boundary
Resolve the user's identity before planning and pass a scoped identity to the query service. Enforce row and column rules in the catalog or query engine, filter retrieval by the same authorized scope, and do not rely on prompt instructions as the access boundary. Use an isolated tool runner with a strict destination allowlist and short-lived credentials.

### Action policy
Keep SQL read-only and apply row limits, timeout, and cost budget. Treat report creation as a draft; require the user to review it before sharing. Log prompt context references, policy decisions, query identifiers, output destination, and cost. Include adversarial tests for prompt injection, cross-department leakage, and attempts to export protected data.""" + refs_md([SOURCES["thoughtworks"], SOURCES["google"]]),
        "tradeoffs": ["Strict controls reduce automation breadth but keep data policy enforceable and auditable."],
        "sources": [SOURCES["thoughtworks"], SOURCES["google"]],
    },
    {
        "id": "research-arch-multicloud-open-lakehouse",
        "source": "Research-informed design exercise",
        "category": "Modern Storage & Lakehouse Table Formats",
        "niche": "Multi-cloud lakehouse interoperability",
        "difficulty": "ARCHITECT",
        "question": "A company has data in two clouds and wants analytics engines in both regions to discover and query selected shared tables without copying every dataset. Design the interoperability and governance boundaries.",
        "constraints": ["Data residency rules differ by region.", "Some workloads are read-heavy while others write.", "Table and catalog capabilities vary by engine."],
        "answer": """### Architecture
Inventory each workload's data location, read/write needs, residency, and egress profile. Select a table format and catalog interface only after testing required operations across the chosen engines. Keep authoritative writes within a defined ownership boundary and make read sharing explicit. Federate metadata such as owner, classification, lineage, and semantic definition while enforcing access at the system that owns each dataset.

### Validation
Test schema changes, deletes, concurrent writes, snapshot visibility, credential propagation, cache invalidation, and recovery. Measure remote bytes and query latency on representative workloads. Use local replicas or caches only where they meet freshness and residency rules. Treat vendor integration claims as hypotheses until verified against this matrix.""" + refs_md([SOURCES["google"], SOURCES["aws_lakehouse"]]),
        "tradeoffs": ["Federated access can reduce copy and migration work but adds catalog, identity, network, and egress complexity."],
        "sources": [SOURCES["google"], SOURCES["aws_lakehouse"]],
    },
    {
        "id": "research-arch-batch-to-stream-migration",
        "source": "Research-informed design exercise",
        "category": "Real-Time Streaming & Compute Optimization",
        "niche": "Batch-to-stream migration with safe recovery",
        "difficulty": "HARD",
        "question": "A logistics company needs to reduce delivery-status freshness from several hours to fifteen minutes across thousands of datasets. Design a phased migration that preserves correctness and avoids a streaming operations outage.",
        "constraints": ["Historical batch jobs remain the recovery source.", "The source system emits CDC and application events.", "Small-file growth and checkpoint recovery are known risks."],
        "answer": """### Migration
Start with a product-by-product freshness and cost inventory. Select a pilot with stable keys and a measurable consumer benefit. Ingest CDC into an append-only log, process with event-time handling, and write idempotently into the target table. Run batch and stream in parallel, then compare counts, keys, late-event corrections, and business aggregates before shifting consumers.

### Day-two controls
Track source lag, checkpoint health, sink commit versions, file-size distribution, and recovery time. Define replay boundaries and a runbook for offset-to-commit reconciliation. Roll out in waves and retain batch backfill until each product meets its freshness and correctness objectives. Uber's case study is a useful reference for freshness and checkpoint/commit coordination, but the migration plan must be measured on the company's own workloads.""" + refs_md([SOURCES["uber"]]),
        "tradeoffs": ["Streaming lowers freshness delay but increases state, alerting, and recovery obligations; batch remains useful for backfill and reconciliation."],
        "sources": [SOURCES["uber"]],
    },
    {
        "id": "research-arch-ai-assisted-engineering-rollout",
        "source": "Research-informed design exercise",
        "category": "DataOps & SDLC",
        "niche": "AI-assisted data engineering rollout",
        "difficulty": "HARD",
        "question": "A platform organization wants to enable AI-generated SQL and pipeline code for several teams. Design a rollout that measures value without increasing production instability.",
        "constraints": ["Teams have different test coverage and platform maturity.", "Generated changes can affect shared production tables.", "Leadership expects a measurable delivery outcome."],
        "answer": """### Rollout
Establish a baseline by team and change class. Start with low-risk tasks such as documentation, test scaffolding, and bounded code suggestions. Require human review, small pull requests, schema checks, data tests, and deployment safeguards for production changes. Keep a clear owner for each generated change.

### Measurement
Compare lead time and review effort with change failure rate, recovery time, rework, and escaped data defects. Segment results by use case and engineering maturity, and pause expansion when stability worsens. DORA's research frames AI as an amplifier of existing systems, so strengthen platform and testing fundamentals alongside tool adoption.""" + refs_md([SOURCES["dora"]]),
        "tradeoffs": ["Automation can reduce drafting time, but governance and verification remain part of delivery cost."],
        "sources": [SOURCES["dora"]],
    },
    {
        "id": "research-arch-health-data-products",
        "source": "Research-informed design exercise",
        "category": "Enterprise Data Governance & Cataloging",
        "niche": "Privacy-aware healthcare data products",
        "difficulty": "ARCHITECT",
        "question": "A healthcare organization wants research teams to discover governed patient data products while keeping sensitive fields restricted and data quality visible. Design ownership, access, and lifecycle.",
        "constraints": ["Research, clinical operations, and finance have different purposes.", "Sensitive fields require masking and audited access.", "Products are owned by multiple clinical domains."],
        "answer": """### Product and policy model
Assign domain owners and publish product contracts that declare grain, permitted purpose, schema, freshness, quality evidence, and retirement policy. Keep identity, consent, tenant, and purpose checks at the governed query layer. Minimize or tokenize direct identifiers before broad analytical use, and maintain lineage from source through transformation to each released product.

### Operating model
Provide self-service discovery and access requests with policy approval, not unrestricted dataset downloads. Monitor quality, freshness, policy denials, and consumer adoption. Review retention and purpose when a product changes or expires. Use the platform to standardize evidence and deployment while leaving domain teams accountable for semantics.""" + refs_md([SOURCES["fowler"], SOURCES["dbt26"]]),
        "tradeoffs": ["Central governance improves control but must keep approval and discovery workable for legitimate research."],
        "sources": [SOURCES["fowler"], SOURCES["dbt26"]],
    },
    {
        "id": "research-arch-kubernetes-managed-runtime-decision",
        "source": "Research-informed design exercise",
        "category": "Cloud-Native Data Platform",
        "niche": "Kubernetes versus managed runtime for analytics",
        "difficulty": "MEDIUM",
        "question": "An engineering group operates Kubernetes for application workloads and is considering moving Spark, Airflow, and streaming pipelines onto the same clusters. Define a decision framework and pilot.",
        "constraints": ["The Kubernetes platform has an on-call team but limited stateful-data experience.", "Managed analytics services are available.", "Workloads have different burst and recovery requirements."],
        "answer": """### Decision framework
Map each workload's state, runtime, isolation, autoscaling, storage, network, upgrade, and recovery requirements. Compare the total operating cost and on-call responsibility for Kubernetes with managed services. Shared cluster availability does not guarantee compatible scheduling, storage, or incident ownership.

### Pilot
Select one representative workload and test deployment, autoscaling, node loss, storage recovery, secret rotation, version upgrade, and cost attribution. Use Kubernetes when its portability or control produces a demonstrated benefit and the team can support its failure modes. Keep managed services for workloads where the managed control plane better meets the team's reliability target.""" + refs_md([SOURCES["cncf"]]),
        "tradeoffs": ["Kubernetes may improve control and portability but shifts more lifecycle and reliability work to the platform team."],
        "sources": [SOURCES["cncf"]],
    },
    {
        "id": "research-arch-fabric-vendor-file-ingestion",
        "source": "Research-informed design exercise",
        "category": "Microsoft Fabric Architecture",
        "niche": "Vendor workbook ingestion with source history",
        "difficulty": "EASY",
        "question": "A procurement team drops revised workbooks into a shared folder each day. Design a Fabric medallion pipeline that can trace each row back to its file and safely process corrections.",
        "constraints": ["Files may be resent or revised.", "Temporary workbook files must be ignored.", "Analysts need both current supplier state and historical changes."],
        "answer": """### Pipeline
Filter the controlled folder to supported workbook files, ignore temporary files, and attach file path, modified timestamp, and ingestion run ID. Use a staging table for the current extraction. In Bronze, preserve accepted observations with source metadata and a stable record hash. In Silver, deduplicate and apply the supplier's correction semantics; publish current state and history separately if consumers need both.

### Safety
Validate schema and required business keys before promoting records. Quarantine malformed files with reason and checksum. Make reruns idempotent and alert when file counts or row totals change unexpectedly. The cited Microsoft walkthrough demonstrates a similar file-to-Fabric staging handoff; adapt the history policy to the supplier contract.""" + refs_md([SOURCES["fabric"]]),
        "tradeoffs": ["A staging layer simplifies repeat reads; durable Bronze history requires explicit replay and correction rules."],
        "sources": [SOURCES["fabric"]],
    },
    {
        "id": "research-arch-ai-platform-finops",
        "source": "Research-informed design exercise",
        "category": "Storage & Compute Tiering Strategies",
        "niche": "FinOps controls for agentic data workloads",
        "difficulty": "HARD",
        "question": "An internal AI assistant performs vector retrieval, warehouse queries, and occasional streaming feature lookups. Usage grows quickly and compute cost exceeds the team's budget. Design cost controls that preserve answer quality.",
        "constraints": ["Different teams share the platform.", "Some questions are cacheable while others need current data.", "The assistant must report when it cannot answer within policy or budget."],
        "answer": """### Cost model
Attribute inference, retrieval, query scans, streaming context, storage, retries, and human review to a workflow and team. Track cost per successful task with answer quality, freshness, and latency; token totals alone omit data-platform costs. Set separate budgets for query scans, retries, and inference, with alerts before hard limits.

### Controls
Use governed result caching only when identity, freshness, and policy remain valid. Apply query limits and route routine questions to precomputed aggregates where appropriate. When a budget is reached, return a clear refusal or lower-cost approved path rather than silently using stale or unauthorized data. Review unit economics as usage and data freshness change.""" + refs_md([SOURCES["dbt26"], SOURCES["aws_streaming"]]),
        "tradeoffs": ["Caching and precomputation lower repeated cost but can increase freshness and invalidation complexity."],
        "sources": [SOURCES["dbt26"], SOURCES["aws_streaming"]],
    },
]

try:
    from catalog_data_expansion import (
        NEW_SOURCES,
        ADDITIONAL_CONCEPTS,
        ADDITIONAL_QA_ITEMS,
        ADDITIONAL_ARCHITECTURE_ITEMS,
    )
except ImportError:
    from scripts.catalog_data_expansion import (
        NEW_SOURCES,
        ADDITIONAL_CONCEPTS,
        ADDITIONAL_QA_ITEMS,
        ADDITIONAL_ARCHITECTURE_ITEMS,
    )

SOURCES.update(NEW_SOURCES)
CONCEPTS.extend(ADDITIONAL_CONCEPTS)
QA_ITEMS.extend(ADDITIONAL_QA_ITEMS)
ARCHITECTURE_ITEMS.extend(ADDITIONAL_ARCHITECTURE_ITEMS)


def load_array(name: str) -> list[dict[str, Any]]:
    value = json.loads((DATA / name).read_text(encoding="utf-8"))
    if not isinstance(value, list):
        raise TypeError(f"{name} must contain a JSON array")
    return value


def atomic_write(name: str, value: list[dict[str, Any]]) -> None:
    target = DATA / name
    temp = target.with_suffix(target.suffix + ".tmp")
    temp.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    os.replace(temp, target)


def assert_records(name: str, records: list[dict[str, Any]], required: tuple[str, ...]) -> None:
    ids = [str(row.get("id", "")) for row in records]
    assert all(ids), f"{name}: missing id"
    assert len(ids) == len(set(ids)), f"{name}: duplicate ids"
    for row in records:
        for key in required:
            assert str(row.get(key, "")).strip(), f"{name}: {row.get('id')} missing {key}"
        if row["id"].startswith("research-"):
            assert re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", row["id"]), f"{name}: invalid new id {row['id']}"
        assert isinstance(row.get("sources", []), list), f"{name}: sources must be a list"
        for source in row.get("sources", []):
            assert source.get("title") and re.fullmatch(r"https://\S+", source.get("url", "")), f"{name}: invalid source for {row['id']}"


def reconcile_concepts() -> int:
    concepts = load_array("data_concepts.json")
    before = len(concepts)
    pattern = re.compile(r"^.+ Operational Pattern #\d{3}$")
    concepts = [
        row for row in concepts
        if not pattern.fullmatch(str(row.get("term", "")))
        and not str(row.get("id", "")).startswith("research-concept-")
    ]
    existing_ids = {row.get("id") for row in concepts}
    existing_terms = {str(row.get("term", "")).strip().casefold() for row in concepts}
    for item in CONCEPTS:
        if item["id"] in existing_ids:
            raise ValueError(f"Concept ID already exists: {item['id']}")
        if item["term"].casefold() in existing_terms:
            raise ValueError(f"Concept term already exists: {item['term']}")
        concepts.append(item)
        existing_ids.add(item["id"])
        existing_terms.add(item["term"].casefold())
    assert_records("concepts", concepts, ("term", "definition", "explanation"))
    atomic_write("data_concepts.json", concepts)
    print(f"Concepts: {before} -> {len(concepts)} (removed generated filler; added {len(CONCEPTS)} cited concepts)")
    return len(concepts)


def reconcile_qa() -> int:
    questions = load_array("questions.json")
    before = len(questions)
    questions = [
        row for row in questions
        if not str(row.get("id", "")).startswith(("techblog-qa-", "research-qa-"))
    ]
    existing_ids = {row.get("id") for row in questions}
    for item in QA_ITEMS:
        if item["id"] in existing_ids:
            raise ValueError(f"Q&A ID already exists: {item['id']}")
        questions.append(item)
        existing_ids.add(item["id"])
    assert_records("questions", questions, ("question", "answer", "category", "difficulty"))
    atomic_write("questions.json", questions)
    print(f"Core Q&A: {before} -> {len(questions)} (replaced filler and unreferenced additions with {len(QA_ITEMS)} cited questions)")
    return len(questions)


def reconcile_architecture() -> int:
    scenarios = load_array("data_architecture.json")
    before = len(scenarios)
    scenarios = [
        row for row in scenarios
        if not str(row.get("id", "")).startswith(("arch-techblog-", "research-arch-"))
    ]
    existing_ids = {row.get("id") for row in scenarios}
    for item in ARCHITECTURE_ITEMS:
        if item["id"] in existing_ids:
            raise ValueError(f"Architecture ID already exists: {item['id']}")
        scenarios.append(item)
        existing_ids.add(item["id"])
    assert_records("architecture", scenarios, ("question", "answer", "category", "difficulty"))
    atomic_write("data_architecture.json", scenarios)
    print(f"Architecture: {before} -> {len(scenarios)} (replaced filler and unverified additions with {len(ARCHITECTURE_ITEMS)} cited scenarios)")
    return len(scenarios)


def install_repeatable_script() -> None:
    target = ROOT / "scripts" / "reconcile_content_catalog.py"
    source = Path(__file__).resolve()
    if source != target.resolve():
        shutil.copyfile(source, target)


def remove_concept_padding_from_legacy_script() -> None:
    target = ROOT / "scripts" / "expand_concepts_master.py"
    source = target.read_text(encoding="utf-8")
    start_marker = "    # If still below target, generate additional specialized concept entries"
    end_marker = '    print(f"Generated {len(systematic_concepts)} new concepts.")'
    if start_marker in source:
        start = source.index(start_marker)
        end = source.index(end_marker, start)
        source = source[:start] + "    # Do not pad the curated catalog with generated placeholder entries.\n\n" + source[end:]
        target.write_text(source, encoding="utf-8")


def deprecate_generic_qa_generator() -> None:
    target = ROOT / "scripts" / "enrich_scenarios_and_qa.py"
    target.write_text(
        '"""Compatibility entry point for the curated, source-linked catalog reconciler."""\n'
        "from reconcile_content_catalog import main\n\n"
        'if __name__ == "__main__":\n'
        "    main()\n",
        encoding="utf-8",
    )


def main() -> None:
    install_repeatable_script()
    concepts = reconcile_concepts()
    qa = reconcile_qa()
    architecture = reconcile_architecture()
    remove_concept_padding_from_legacy_script()
    deprecate_generic_qa_generator()
    print(f"Reconciled catalogs: concepts={concepts}, core_qa={qa}, architecture={architecture}")


if __name__ == "__main__":
    main()

