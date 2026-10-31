"use client";

import React from "react";
import {
  MessageSquare,
  HelpCircle,
  Network,
  Cpu,
  ShieldAlert,
  Scale,
} from "lucide-react";
import {
  InteractiveFlowDiagram,
  FlowStage,
} from "@/components/ui/interactive-flow-diagram";

interface InterviewDefenseFlowProps {
  onSelectArchetype?: (archetype: string) => void;
  className?: string;
}

export function InterviewDefenseFlow({
  onSelectArchetype,
  className,
}: InterviewDefenseFlowProps) {
  const stages: FlowStage[] = [
    {
      id: "scope",
      name: "1. Clarify Scope & Scale",
      subtitle: "Throughput, Freshness & Bounds",
      icon: HelpCircle,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
      description:
        "Begin every system design interview by clarifying ambiguity: establish read vs. write volume, payload sizes, event arrival rates, peak latency targets, consistency models, and disaster recovery bounds.",
      keyTechniques: [
        "Read/write traffic ratio estimation",
        "Data freshness SLA bounds",
        "Storage retention & growth envelope",
      ],
      actionLabel: "Explore Scope Drills",
      onAction: onSelectArchetype ? () => onSelectArchetype("HOTSPOTS") : undefined,
      actionHref: onSelectArchetype ? undefined : "/qa-prep?q=throughput",
    },
    {
      id: "topology",
      name: "2. High-Level Topology",
      subtitle: "End-to-End Architectural Flow",
      icon: Network,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
      description:
        "Draft the macro pipeline topology: trace data flow from sources (Kafka, Debezium CDC) through lakehouse storage layers (Bronze, Silver, Gold), catalog governance (Unity/Polaris), to serving engines.",
      keyTechniques: [
        "Decoupled compute & storage layout",
        "Medallion architectural boundaries",
        "Centralized catalog control plane",
      ],
      actionLabel: "Explore Topology Drills",
      onAction: onSelectArchetype ? () => onSelectArchetype("CODE_DRILLS") : undefined,
      actionHref: onSelectArchetype ? undefined : "/qa-prep?q=Medallion",
    },
    {
      id: "bottlenecks",
      name: "3. Deep-Dive Bottlenecks",
      subtitle: "Shuffle, Spill & Concurrency",
      icon: Cpu,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30",
      description:
        "Proactively address distributed system bottlenecks before the interviewer points them out: Spark shuffle boundary spills, executor GC pauses, driver OOM, and cloud object storage request throttling.",
      keyTechniques: [
        "AQE shuffle partition coalescing",
        "Off-heap memory & G1GC tuning",
        "Storage prefix hash sharding",
      ],
      actionLabel: "Explore Bottleneck Drills",
      onAction: onSelectArchetype ? () => onSelectArchetype("PERF_TUNING") : undefined,
      actionHref: onSelectArchetype ? undefined : "/qa-prep?q=shuffle",
    },
    {
      id: "edge-cases",
      name: "4. Mitigate Failure Cases",
      subtitle: "Out-of-Order, Skew & Drift",
      icon: ShieldAlert,
      color: "text-rose-400",
      bgColor: "bg-rose-500/10",
      borderColor: "border-rose-500/30",
      description:
        "Demonstrate production battle-hardening: handle out-of-order streaming events via watermarking, eliminate skew stragglers with dynamic split tasks, and quarantine schema violations via Dead-Letter Queues.",
      keyTechniques: [
        "Event-time watermarking & deduplication",
        "AQE skew join splitting",
        "Quarantined Dead-Letter Queues (DLQ)",
      ],
      actionLabel: "Explore Resilience Drills",
      onAction: onSelectArchetype ? () => onSelectArchetype("HOTSPOTS") : undefined,
      actionHref: onSelectArchetype ? undefined : "/qa-prep?q=skew",
    },
    {
      id: "tradeoffs",
      name: "5. Quantify Trade-Offs",
      subtitle: "Cost, Consistency & Complexity",
      icon: Scale,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30",
      description:
        "Conclude with Principal-level trade-off synthesis: evaluate latency vs. compute expenditure (batch vs. streaming), strong vs. eventual consistency, operational burden, and cloud FinOps unit economics.",
      keyTechniques: [
        "Streaming vs micro-batch cost curves",
        "Optimistic concurrency conflict rates",
        "FinOps unit cost attribution",
      ],
      actionLabel: "Explore Trade-off Drills",
      onAction: onSelectArchetype ? () => onSelectArchetype("ARCHITECT") : undefined,
      actionHref: onSelectArchetype ? undefined : "/qa-prep?q=tradeoff",
    },
  ];

  return (
    <InteractiveFlowDiagram
      title="The 5-Step Architecture Defense Framework"
      badge="Interview Masterclass"
      subtitle="How Principal Engineers structure high-stakes Lakehouse System Design and Technical Interview solutions."
      icon={MessageSquare}
      stages={stages}
      defaultStageId="bottlenecks"
      className={className}
    />
  );
}
