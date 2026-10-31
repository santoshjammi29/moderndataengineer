"use client";

import React, { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Compass,
  Calendar,
  CheckCircle2,
  GitBranch,
  BookMarked,
  Award,
  ChevronDown,
  ArrowRight,
  Sparkles,
  Share2,
  RotateCcw,
  BookOpen,
  HelpCircle,
  ExternalLink,
  Code2,
  Layers,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { LearningPath, Difficulty } from "@/types/data";
import { DecisionLedger } from "@/components/learning-paths/decision-ledger";
import { TopicIcon } from "@/components/ui/topic-icon";

const difficultyColors: Record<Difficulty, { bg: string; text: string; border: string }> = {
  EASY: { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/20" },
  MEDIUM: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  HARD: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
  ARCHITECT: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
};

export interface CurriculumTrack {
  id: string;
  name: string;
  shortName: string;
  level: string;
  difficulty: "MEDIUM" | "HARD" | "ARCHITECT";
  difficultyBadge: string;
  badgeColor: string;
  description: string;
  slugs: string[];
}

export const CURRICULUM_TRACKS: CurriculumTrack[] = [
  {
    id: "track-1",
    name: "Track 1: BI, Semantic Modeling & Fabric Analytics",
    shortName: "Track 1: BI & Fabric",
    level: "Foundations & Intermediate",
    difficulty: "MEDIUM",
    difficultyBadge: "Medium to Hard",
    badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    description: "Enterprise DAX, VertiPaq optimization, OneLake shortcuts, Direct Lake mode, and Fabric capacity management.",
    slugs: ["powerbi-pl300", "fabric-dp600"],
  },
  {
    id: "track-2",
    name: "Track 2: Cloud Data Platforms & Distributed Engines",
    shortName: "Track 2: Cloud Platforms",
    level: "Associate to Professional",
    difficulty: "HARD",
    difficultyBadge: "Hard",
    badgeColor: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    description: "Azure & GCP cloud primitives, Apache Spark 4.0 migrations, and real-time Kafka event streaming pipelines.",
    slugs: ["azure-dp203", "bigquery-gcp", "spark-migration", "streaming-cdc"],
  },
  {
    id: "track-3",
    name: "Track 3: Lakehouse & Open Table Architects",
    shortName: "Track 3: Lakehouse Architects",
    level: "Solutions Architect",
    difficulty: "ARCHITECT",
    difficultyBadge: "Architect",
    badgeColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    description: "Databricks Photon C++, Snowflake SnowPro architecture, and deep open table formats (Delta Lake vs Iceberg vs Hudi).",
    slugs: ["databricks-photon", "snowflake-snowpro", "modern-lakehouse"],
  },
  {
    id: "track-4",
    name: "Track 4: Enterprise Scale, FinOps & AI Systems Mastery",
    shortName: "Track 4: Principal Systems",
    level: "Principal & Enterprise Master",
    difficulty: "ARCHITECT",
    difficultyBadge: "Staff & Principal",
    badgeColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    description: "Cloud FinOps cost engineering, LLM RAG data engineering pipelines, and 32-week enterprise architecture mastery.",
    slugs: ["serverless-finops", "ai-llm-de", "architecture-mastery"],
  },
];

const DIFFICULTY_FILTERS = [
  { id: "ALL", label: "All Levels" },
  { id: "MEDIUM", label: "Intermediate" },
  { id: "HARD", label: "Advanced" },
  { id: "ARCHITECT", label: "Architect" },
];

interface CareerCurriculaViewProps {
  paths: LearningPath[];
  selectedPathId?: string | null;
  onSelectPath?: (id: string) => void;
}

export function CareerCurriculaView({
  paths,
  selectedPathId: externalSelectedPathId,
  onSelectPath,
}: CareerCurriculaViewProps) {
  const [internalSelectedId, setInternalSelectedId] = useState<string>(
    externalSelectedPathId || paths[0]?.id || "path-fabric-dp600"
  );
  const [selectedTrackId, setSelectedTrackId] = useState<string>("ALL");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("ALL");
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());

  const currentSelectedId = externalSelectedPathId || internalSelectedId;

  const handleSelect = useCallback(
    (id: string) => {
      setInternalSelectedId(id);
      if (onSelectPath) {
        onSelectPath(id);
      } else if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("tab", "curricula");
        url.searchParams.set("id", id);
        url.searchParams.set("card", id);
        window.history.replaceState(null, "", url.toString());
      }
    },
    [onSelectPath]
  );

  const togglePhase = useCallback((phaseName: string) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(phaseName)) next.delete(phaseName);
      else next.add(phaseName);
      return next;
    });
  }, []);

  const selectedPath = useMemo(() => {
    return paths.find((p) => p.id === currentSelectedId) || paths[0];
  }, [currentSelectedId, paths]);

  // Group paths into the 4 progressive tracks
  const groupedTracks = useMemo(() => {
    return CURRICULUM_TRACKS.map((track) => {
      const trackPaths = paths.filter((p) => track.slugs.includes(p.slug || ""));
      const filteredTrackPaths = trackPaths.filter((p) => {
        if (difficultyFilter !== "ALL" && p.difficulty !== difficultyFilter) return false;
        return true;
      });
      return {
        ...track,
        paths: filteredTrackPaths,
      };
    }).filter((t) => {
      if (selectedTrackId !== "ALL" && t.id !== selectedTrackId) return false;
      return t.paths.length > 0;
    });
  }, [paths, difficultyFilter, selectedTrackId]);

  const copyShareLink = useCallback(() => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(window.location.href);
    toast.success("Curriculum link copied to clipboard!");
  }, []);

  return (
    <div className="space-y-3.5 animate-in fade-in duration-200">
      {/* ── Sub-header Banner (Ultra-Compact Reference Format) ── */}
      <div className="rounded-xl bg-[var(--surface-1)] border border-[var(--border)] p-3 sm:p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-[10px] font-semibold text-purple-400">
              <Award size={12} />
              <span>Progressive 4-Tier Career Roadmaps (Ordered by Difficulty)</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[var(--foreground)] tracking-tight">
              12 Structured Data Platform Career Curricula
            </h2>
            <p className="text-xs text-[var(--muted-foreground)] max-w-3xl leading-relaxed">
              Step-by-step role progression roadmaps ordered from Power BI PL-300 to 32-Week Principal Lakehouse Mastery.
              Organized into 4 progressive specialization tracks with week-by-week phases, capstone repos, and decision ledgers.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={copyShareLink}
              className="px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-xs font-semibold text-[var(--foreground)] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Share2 size={13} />
              <span>Share Roadmap</span>
            </button>
          </div>
        </div>

        {/* Filter Pills Deck: Progressive Track & Difficulty */}
        <div className="mt-2.5 pt-2.5 border-t border-[var(--border)] flex flex-wrap items-center gap-2">
          {/* Track Filter */}
          <div className="flex items-center gap-1 p-0.5 rounded-full bg-[var(--surface-2)] border border-[var(--border)] overflow-x-auto scrollbar-none max-w-fit shadow-2xs">
            <button
              type="button"
              onClick={() => setSelectedTrackId("ALL")}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap",
                selectedTrackId === "ALL"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              )}
            >
              All 4 Tracks
            </button>
            {CURRICULUM_TRACKS.map((track) => (
              <button
                key={track.id}
                type="button"
                onClick={() => setSelectedTrackId(track.id)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap",
                  selectedTrackId === track.id
                    ? "bg-purple-600 text-white shadow-xs"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                )}
              >
                {track.shortName}
              </button>
            ))}
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-1 p-0.5 rounded-full bg-[var(--surface-2)] border border-[var(--border)] overflow-x-auto scrollbar-none max-w-fit shadow-2xs">
            {DIFFICULTY_FILTERS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setDifficultyFilter(opt.id)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap",
                  difficultyFilter === opt.id
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Progressive 4-Track Grouping ── */}
      <div className="space-y-4">
        {groupedTracks.map((track) => (
          <div key={track.id} className="space-y-2">
            {/* Track Header Bar */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider", track.badgeColor)}>
                  {track.difficultyBadge}
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-[var(--foreground)]">
                  {track.name}
                </h3>
              </div>
              <span className="text-[11px] text-[var(--muted-foreground)] font-mono">
                {track.paths.length} {track.paths.length === 1 ? "Roadmap" : "Roadmaps"}
              </span>
            </div>

            {/* Dense Curricula Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {track.paths.map((path) => {
                const isSelected = selectedPath?.id === path.id;
                const diffStyle = difficultyColors[path.difficulty] || difficultyColors.MEDIUM;
                const cleanKey = path.id.replace("path-", "");

                return (
                  <button
                    key={path.id}
                    type="button"
                    onClick={() => handleSelect(path.id)}
                    className={cn(
                      "p-2.5 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between group cursor-pointer",
                      isSelected
                        ? "bg-[var(--surface-2)] border-purple-500 ring-1 ring-purple-500/40 shadow-xs"
                        : "bg-[var(--surface-1)] border-[var(--border)] hover:border-purple-500/30 hover:bg-[var(--surface-2)]/80"
                    )}
                  >
                    <div className="space-y-1.5 w-full">
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="w-6 h-6 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center shrink-0 group-hover:border-purple-500/40 transition-colors shadow-2xs">
                          <TopicIcon topicKey={cleanKey} size={14} />
                        </div>
                        <span
                          className={cn(
                            "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border shrink-0",
                            diffStyle.bg,
                            diffStyle.text,
                            diffStyle.border
                          )}
                        >
                          {path.difficulty}
                        </span>
                      </div>
                      <h4
                        className={cn(
                          "text-xs sm:text-[13px] font-bold leading-snug break-words whitespace-normal text-left",
                          isSelected ? "text-purple-400" : "text-[var(--foreground)] group-hover:text-purple-400 transition-colors"
                        )}
                      >
                        {path.title}
                      </h4>
                      <p className="text-[11px] text-[var(--muted-foreground)] line-clamp-2 leading-relaxed">
                        {path.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[var(--muted-foreground)] pt-1.5 mt-2 border-t border-[var(--border)] w-full">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar size={11} className="shrink-0 text-[var(--muted-foreground)]" />
                        <span>{path.weeks} Weeks</span>
                      </span>
                      <span className="font-semibold text-purple-400 font-mono text-[10px]">
                        {path.examQsCount ? `${path.examQsCount} Q&As` : `${path.phases.length} Phases`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ── Active Path Deep Dive View ── */}
      {selectedPath && (
        <div className="p-3.5 sm:p-5 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] space-y-4 shadow-sm">
          {/* Roadmap Header Summary */}
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3 pb-3 border-b border-[var(--border)]">
            <div className="space-y-1.5 max-w-3xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  {selectedPath.badge || "Career Track"}
                </span>
                <span className="text-[10px] font-mono text-[var(--muted-foreground)]">
                  {selectedPath.weeks} Weeks Total
                </span>
                <span className="text-[10px] font-mono text-[var(--muted-foreground)]">
                  Prerequisites: {selectedPath.prerequisites}
                </span>
              </div>
              <h3 className="text-base sm:text-xl font-bold text-[var(--foreground)]">
                {selectedPath.title}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
                {selectedPath.description}
              </p>
            </div>

            {/* Capstone Project Pill */}
            {selectedPath.handsOn && (
              <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-1.5 shrink-0 max-w-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1">
                    <Code2 size={12} /> Hands-On Capstone
                  </span>
                  {selectedPath.handsOn.repo && (
                    <a
                      href={selectedPath.handsOn.repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-0.5"
                    >
                      <span>Repo</span>
                      <ExternalLink size={10} />
                    </a>
                  )}
                </div>
                <div className="text-xs font-semibold text-[var(--foreground)]">
                  {selectedPath.handsOn.title}
                </div>
                <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                  {selectedPath.handsOn.description}
                </p>
              </div>
            )}
          </div>

          {/* Skill Tag Badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase mr-1">
              Core Competencies:
            </span>
            {selectedPath.skills.map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-[var(--surface-2)] border border-[var(--border)] text-[10px] font-medium text-[var(--foreground)]"
              >
                {skill}
              </span>
            ))}
          </div>

          {/* Timeline Breakdown / Phases */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[var(--foreground)]">
                Curriculum Milestone Timeline ({selectedPath.phases.length} Phases)
              </span>
              <button
                type="button"
                onClick={() => {
                  if (expandedPhases.size === selectedPath.phases.length) {
                    setExpandedPhases(new Set());
                  } else {
                    setExpandedPhases(new Set(selectedPath.phases.map((p) => p.name)));
                  }
                }}
                className="text-[11px] text-purple-400 hover:text-purple-300 font-semibold cursor-pointer"
              >
                {expandedPhases.size === selectedPath.phases.length ? "Collapse All" : "Expand All"}
              </button>
            </div>

            <div className="space-y-2">
              {selectedPath.phases.map((phase, idx) => {
                const isExpanded = expandedPhases.has(phase.name);
                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/60 overflow-hidden transition-all"
                  >
                    <div
                      onClick={() => togglePhase(phase.name)}
                      className="p-3 flex items-center justify-between cursor-pointer select-none hover:bg-[var(--surface-2)] transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center text-[10px] font-bold font-mono">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="text-xs sm:text-sm font-bold text-[var(--foreground)]">
                            {phase.name}
                          </div>
                          <div className="text-[10px] text-[var(--muted-foreground)] font-mono">
                            {phase.weeks}
                          </div>
                        </div>
                      </div>
                      <ChevronDown
                        size={14}
                        className={cn("text-[var(--muted-foreground)] transition-transform duration-200", isExpanded && "rotate-180")}
                      />
                    </div>

                    {isExpanded && (
                      <div className="px-3.5 pb-3.5 pt-1 border-t border-[var(--border)]/60 space-y-2.5 text-xs">
                        <div className="p-2.5 rounded-lg bg-[var(--surface-1)] border border-[var(--border)]">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block mb-0.5">
                            Milestone Deliverable
                          </span>
                          <p className="text-[11px] sm:text-xs text-[var(--foreground)] leading-relaxed">
                            {phase.milestone}
                          </p>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] block mb-1">
                            Phase Learning Topics:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {phase.topics.map((t, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-1.5 p-1.5 rounded-md bg-[var(--surface-1)] border border-[var(--border)] text-[11px] text-[var(--foreground)]"
                              >
                                <span className="text-purple-400 font-bold">•</span>
                                <span>{t}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Decision Ledger Integration for this track */}
          <div className="pt-2 border-t border-[var(--border)]">
            <DecisionLedger />
          </div>
        </div>
      )}
    </div>
  );
}
