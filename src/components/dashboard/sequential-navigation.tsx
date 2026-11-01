"use client";

import React from "react";
import Link from "next/link";
import {
  BookOpen,
  Layers,
  Cpu,
  FileCode2,
  Code2,
  Sparkles,
  MessageSquare,
  Compass,
  Workflow,
  Building2,
  Zap,
  ArrowRight,
  CheckCircle2,
  Flame,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StepItem {
  step: string;
  title: string;
  badge: string;
  badgeColor: string;
  icon: React.ElementType;
  iconColor: string;
  description: string;
  href: string;
  actionText: string;
  subLinks: { label: string; href: string }[];
}

interface PhaseSection {
  number: string;
  title: string;
  tagline: string;
  steps: StepItem[];
}

const PHASES: PhaseSection[] = [
  {
    number: "01",
    title: "Core Foundations & Systems Theory",
    tagline: "Build foundational mental models, open table formats, and runtime engine mechanics.",
    steps: [
      {
        step: "Step 01",
        title: "Key Concepts & 14-Pillar Mind Map",
        badge: "679 Concepts",
        badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        icon: BookOpen,
        iconColor: "text-emerald-400",
        description: "Searchable concept glossary with interactive 4-depth dynamic stretching mind map engine across 14 architectural pillars.",
        href: "/concepts",
        actionText: "Explore Concepts",
        subLinks: [
          { label: "Concept Glossary", href: "/concepts" },
          { label: "Interactive Mind Map", href: "/concepts?view=mindmap" },
          { label: "Flashcards", href: "/concepts?view=flashcards" },
        ],
      },
      {
        step: "Step 02",
        title: "Apache Spark Execution & Memory Lab",
        badge: "Live Simulator",
        badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
        icon: Cpu,
        iconColor: "text-cyan-400",
        description: "Visual runtime simulator for Catalyst optimizer AST rewrites, Tungsten memory management, and AQE dynamic stage adaptation.",
        href: "/spark-engine",
        actionText: "Open Spark Lab",
        subLinks: [
          { label: "Memory Lab", href: "/spark-engine" },
          { label: "Catalyst Optimizer", href: "/spark-catalyst" },
          { label: "Execution Visualizer", href: "/visualizer" },
        ],
      },
      {
        step: "Step 03",
        title: "42 Whiteboard Blueprints Hub",
        badge: "42 Visuals",
        badgeColor: "bg-teal-500/10 text-teal-400 border-teal-500/20",
        icon: Sparkles,
        iconColor: "text-teal-400",
        description: "Architect-grade hand-drawn systems blueprints with 5 role perspectives, failure modes, and executive trade-offs.",
        href: "/whiteboards",
        actionText: "View Blueprints",
        subLinks: [
          { label: "Master Blueprints", href: "/whiteboards" },
          { label: "Diagrams Gallery", href: "/architecture?tab=diagrams" },
        ],
      },
    ],
  },
  {
    number: "02",
    title: "System Design & Distributed DataOps",
    tagline: "Master enterprise lakehouse scenarios, cloud matrices, FinOps, and SDLC governance.",
    steps: [
      {
        step: "Step 04",
        title: "3,200+ Architecture Scenarios",
        badge: "3,214 Scenarios",
        badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        icon: Layers,
        iconColor: "text-purple-400",
        description: "Real-world trade-offs across storage formats, ACID concurrency, data skew remediation, and high-scale ingestion.",
        href: "/architecture",
        actionText: "Explore Scenarios",
        subLinks: [
          { label: "System Scenarios", href: "/architecture?tab=scenarios" },
          { label: "36-Keyword Filter Bar", href: "/architecture" },
        ],
      },
      {
        step: "Step 05",
        title: "Cloud × Table Matrix & FinOps Playbooks",
        badge: "15 Playbooks",
        badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        icon: Zap,
        iconColor: "text-amber-400",
        description: "Cross-cloud compatibility for Azure, AWS, and GCP plus 15 actionable FinOps playbooks for DBU and compute cost reduction.",
        href: "/modern-stack",
        actionText: "View Matrix & FinOps",
        subLinks: [
          { label: "Cloud Matrix", href: "/modern-stack?tab=compatibility" },
          { label: "FinOps Cost Playbooks", href: "/modern-stack?tab=cost" },
          { label: "Polyglot Code Matrix", href: "/modern-stack?tab=matrix" },
        ],
      },
      {
        step: "Step 06",
        title: "360° DataOps Lifecycle & Governance",
        badge: "152 Controls",
        badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        icon: Workflow,
        iconColor: "text-blue-400",
        description: "Production CI/CD pipelines, Databricks Asset Bundles (DABs), Key Vault secrets management, and NIST SSDF compliance controls.",
        href: "/dataops",
        actionText: "Open DataOps Hub",
        subLinks: [
          { label: "Tool Secrets", href: "/dataops?tab=connectivity" },
          { label: "CI/CD Pipelines", href: "/dataops?tab=cicd" },
          { label: "Architecture Flow", href: "/dataops?tab=diagram" },
        ],
      },
    ],
  },
  {
    number: "03",
    title: "Production Coding & Emergency Runbooks",
    tagline: "Hands-on implementation drills, memory triage runbooks, and vector PDF reference cards.",
    steps: [
      {
        step: "Step 07",
        title: "Code Practice Hub (178 Drills)",
        badge: "4 Languages",
        badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
        icon: Code2,
        iconColor: "text-cyan-400",
        description: "Runnable production code cards across PySpark (51), Spark SQL (50), Python & Polars (42), and T-SQL (35).",
        href: "/code-practice",
        actionText: "Practice Code",
        subLinks: [
          { label: "PySpark Drills", href: "/code-practice?db=pyspark" },
          { label: "Spark SQL Drills", href: "/code-practice?db=sparksql" },
          { label: "Python & Polars", href: "/code-practice?db=python" },
          { label: "T-SQL Drills", href: "/code-practice?db=mssql" },
        ],
      },
      {
        step: "Step 08",
        title: "Databricks Unified Coding Hub",
        badge: "148+ Operations",
        badgeColor: "bg-orange-500/10 text-orange-400 border-orange-500/20",
        icon: Flame,
        iconColor: "text-orange-400",
        description: "148+ operations covering PySpark, Spark SQL, Python SDK, memory triage (OOM, shuffle spill, small files), and 100-day curriculum.",
        href: "/code-practice/databricks",
        actionText: "Databricks Hub",
        subLinks: [
          { label: "Databricks 148+ Hub", href: "/code-practice/databricks" },
          { label: "Memory Triage", href: "/code-practice/databricks#triage" },
          { label: "100-Day Challenge", href: "/code-practice/databricks#day100" },
        ],
      },
      {
        step: "Step 09",
        title: "Emergency Cheat Sheets & 7 Master PDFs",
        badge: "7 Master PDFs",
        badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        icon: FileText,
        iconColor: "text-blue-400",
        description: "76 Sev-1 incident runbooks, 48 Databricks cheatsheets, and 7 compiled printable A4 vector PDFs available for instant download.",
        href: "/cheat-sheet",
        actionText: "Download Cheat Sheets",
        subLinks: [
          { label: "Incident Runbooks", href: "/cheat-sheet?tab=runbooks" },
          { label: "Databricks Sheets", href: "/cheat-sheet?tab=databricks" },
          { label: "PDF Downloads Hub", href: "/cheat-sheet?tab=pdf_hub" },
        ],
      },
    ],
  },
  {
    number: "04",
    title: "Interview Vetting & Enterprise Intelligence",
    tagline: "Active recall question drill bank and Tier-1 GCC hiring intelligence dossiers.",
    steps: [
      {
        step: "Step 10",
        title: "Interview Q&A Drill Bank (7,080+ Q&As)",
        badge: "7,080+ Q&As",
        badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        icon: MessageSquare,
        iconColor: "text-amber-400",
        description: "Verified interview scenarios with SM-2 spaced repetition active recall, scoring rubrics, and detailed architectural defense answers.",
        href: "/qa-prep",
        actionText: "Launch Q&A Drill",
        subLinks: [
          { label: "Question Bank", href: "/qa-prep" },
          { label: "Active Recall", href: "/qa-prep?mode=spaced" },
        ],
      },
      {
        step: "Step 11",
        title: "Target Company Tech Research (156 GCCs)",
        badge: "156 GCC Profiles",
        badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/20",
        icon: Building2,
        iconColor: "text-rose-400",
        description: "Deep-dive hiring dossiers for Tier-1 GCCs (Walmart, Lowe's, Target, JPMorgan, Optum) with real interview loops and salary bands.",
        href: "/company-research",
        actionText: "Explore Company Intel",
        subLinks: [
          { label: "All 156 GCC Profiles", href: "/company-research" },
          { label: "Salary Benchmarks", href: "/company-research?view=table" },
        ],
      },
    ],
  },
];

export function SequentialNavigation() {
  return (
    <section className="space-y-8 sm:space-y-10">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[var(--border)] pb-3 px-1">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-500 dark:text-blue-400 uppercase tracking-wider mb-1">
            <Compass size={13} />
            <span>Structured Platform Navigation</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--foreground)] tracking-tight">
            The 4-Stage Architectural Mastery Journey
          </h2>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-0.5 max-w-2xl">
            A logical, sequential path from foundational mental models to enterprise system design, production coding, and principal architect vetting.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/search-topics"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <span>Search All Topics</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Sequential Phases */}
      <div className="space-y-8">
        {PHASES.map((phase) => (
          <div key={phase.number} className="space-y-3.5">
            {/* Phase Header Strip */}
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/25 text-xs font-mono font-bold text-blue-500 dark:text-blue-400">
                {phase.number}
              </span>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[var(--foreground)]">
                  {phase.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-[var(--muted-foreground)]">
                  {phase.tagline}
                </p>
              </div>
            </div>

            {/* Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {phase.steps.map((step) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.step}
                    className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 hover:border-blue-500/30 hover:shadow-sm transition-all group"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                          {step.step}
                        </span>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                            step.badgeColor
                          )}
                        >
                          {step.badge}
                        </span>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <div className="p-2 rounded-lg bg-[var(--surface-2)] text-[var(--foreground)] group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-colors shrink-0 mt-0.5">
                          <Icon size={16} className={step.iconColor} />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-[var(--foreground)] group-hover:text-blue-500 transition-colors leading-snug">
                            {step.title}
                          </h4>
                        </div>
                      </div>

                      <p className="text-[11px] sm:text-xs text-[var(--muted-foreground)] leading-relaxed">
                        {step.description}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-[var(--border)] space-y-2">
                      <div className="flex items-center justify-between">
                        <Link
                          href={step.href}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-500 hover:text-blue-400 transition-colors"
                        >
                          <span>{step.actionText}</span>
                          <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-[var(--muted-foreground)]">
                        {step.subLinks.map((sub, i) => (
                          <Link
                            key={i}
                            href={sub.href}
                            className="hover:text-[var(--foreground)] hover:underline"
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
