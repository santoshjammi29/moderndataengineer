"use client";

import React from "react";
import {
  GitBranch,
  FileCode,
  CheckCircle,
  Package,
  Rocket,
  Activity,
} from "lucide-react";
import {
  InteractiveFlowDiagram,
  FlowStage,
} from "@/components/ui/interactive-flow-diagram";

interface SdlcPipelineFlowProps {
  onSelectPhase?: (phaseNumber: number) => void;
  className?: string;
}

export function SdlcPipelineFlow({
  onSelectPhase,
  className,
}: SdlcPipelineFlowProps) {
  const stages: FlowStage[] = [
    {
      id: "discovery",
      name: "Discovery & Contracts",
      subtitle: "Phases 01 - 02 · Intake & SLAs",
      icon: FileCode,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
      description:
        "Formal engineering discovery gate: capture problem statement, name authoritative data owners, define Data Contracts with schema types, and establish freshness SLOs before provisioning compute.",
      keyTechniques: [
        "Business value & baseline metrics",
        "Declarative data contract YAML",
        "Target consumer SLA agreement",
      ],
      actionLabel: "View Phase 01 Controls",
      onAction: onSelectPhase ? () => onSelectPhase(1) : undefined,
      actionHref: onSelectPhase ? undefined : "/dataops?tab=lifecycle",
    },
    {
      id: "architecture",
      name: "Architecture & ADRs",
      subtitle: "Phases 03 - 04 · Design Governance",
      icon: GitBranch,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
      description:
        "Document core architectural choices via immutable Architectural Decision Records (ADRs). Review entity grains, trace sensitive data flows for threat modeling, and estimate steady-state capacity.",
      keyTechniques: [
        "Architectural Decision Records (ADRs)",
        "Threat modeling data flows",
        "Trunk-based branch protections",
      ],
      actionLabel: "View Phase 03 Controls",
      onAction: onSelectPhase ? () => onSelectPhase(3) : undefined,
      actionHref: onSelectPhase ? undefined : "/dataops?tab=lifecycle",
    },
    {
      id: "dev-test",
      name: "Dev Sandboxes & Test",
      subtitle: "Phases 05 - 08 · Quality Pyramids",
      icon: CheckCircle,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30",
      description:
        "Develop in isolated containerized devcontainers with synthetic data. Execute multi-tier testing: in-memory unit tests, integration DAG checks, and automated data quality assertions (Soda / Great Expectations).",
      keyTechniques: [
        "Devcontainers & ephemeral sandboxes",
        "Synthetic mock data generators",
        "Great Expectations quality gates",
      ],
      actionLabel: "View Phase 08 Controls",
      onAction: onSelectPhase ? () => onSelectPhase(8) : undefined,
      actionHref: onSelectPhase ? undefined : "/dataops?tab=lifecycle",
    },
    {
      id: "build-ci",
      name: "CI/CD & SLSA Build",
      subtitle: "Phases 09 - 11 · Supply Chain",
      icon: Package,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30",
      description:
        "Package pipelines deterministically in ephemeral build runners. Pin dependency hashes, scan SBOMs for CVEs, generate SLSA Level 3 cryptographic provenance, and enforce Terraform policy-as-code.",
      keyTechniques: [
        "SLSA Level 3 build provenance",
        "Hash-pinned dependency lockfiles",
        "Terraform policy-as-code (OPA)",
      ],
      actionLabel: "View Phase 10 Controls",
      onAction: onSelectPhase ? () => onSelectPhase(10) : undefined,
      actionHref: onSelectPhase ? undefined : "/dataops?tab=lifecycle",
    },
    {
      id: "release",
      name: "Canary & Release",
      subtitle: "Phases 12 - 13 · Safe Deployment",
      icon: Rocket,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/30",
      description:
        "Deploy without downtime using Canary and Shadow pipeline execution. Validate statistical output parity, conduct formal Production Readiness Reviews (PRRs), and utilize zero-downtime expand/contract cutovers.",
      keyTechniques: [
        "Shadow pipeline verification",
        "Automated deployment abort circuits",
        "Production Readiness Review (PRR)",
      ],
      actionLabel: "View Phase 12 Controls",
      onAction: onSelectPhase ? () => onSelectPhase(12) : undefined,
      actionHref: onSelectPhase ? undefined : "/dataops?tab=lifecycle",
    },
    {
      id: "operations",
      name: "Observability & SRE",
      subtitle: "Phases 14 - 19 · Reliability",
      icon: Activity,
      color: "text-violet-400",
      bgColor: "bg-violet-500/10",
      borderColor: "border-violet-500/30",
      description:
        "Operate with high reliability: ingest OpenLineage run telemetry, monitor SLO error budgets, conduct blameless incident postmortems, rehearse dual-region DR game days, and execute compliant sunsetting.",
      keyTechniques: [
        "OpenTelemetry + OpenLineage",
        "Blameless postmortems & MTTR",
        "Dual-region DR game days",
      ],
      actionLabel: "View Phase 14 Controls",
      onAction: onSelectPhase ? () => onSelectPhase(14) : undefined,
      actionHref: onSelectPhase ? undefined : "/dataops?tab=lifecycle",
    },
  ];

  return (
    <InteractiveFlowDiagram
      title="Enterprise 360° Data Engineering SDLC Deployment Pipeline"
      badge="NIST SSDF & SRE Aligned"
      subtitle="How mission-critical lakehouse pipelines progress from intake to safe retirement grounded in NIST SSDF and Google SRE."
      icon={GitBranch}
      stages={stages}
      defaultStageId="release"
      className={className}
    />
  );
}
