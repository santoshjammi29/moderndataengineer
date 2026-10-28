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

const DIFFICULTY_FILTERS = [
  { id: "ALL", label: "All Levels" },
  { id: "EASY", label: "Beginner" },
  { id: "MEDIUM", label: "Intermediate" },
  { id: "HARD", label: "Advanced" },
  { id: "ARCHITECT", label: "Architect" },
];

const ROLE_FILTERS = [
  { id: "ALL", label: "All Specializations" },
  { id: "Fabric", label: "Microsoft Fabric" },
  { id: "Databricks", label: "Azure Databricks" },
  { id: "Architect", label: "Solutions Architect" },
  { id: "Engineer", label: "Data Engineer" },
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
  const [difficultyFilter, setDifficultyFilter] = useState<string>("ALL");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
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

  const filteredPaths = useMemo(() => {
    return paths.filter((p) => {
      if (difficultyFilter !== "ALL" && p.difficulty !== difficultyFilter) return false;
      if (roleFilter !== "ALL") {
        const titleLower = p.title.toLowerCase();
        if (roleFilter === "Fabric" && !titleLower.includes("fabric")) return false;
        if (roleFilter === "Databricks" && !titleLower.includes("databricks")) return false;
        if (roleFilter === "Architect" && !titleLower.includes("architect")) return false;
        if (roleFilter === "Engineer" && (!titleLower.includes("engineer") || titleLower.includes("architect"))) {
          return false;
        }
      }
      return true;
    });
  }, [paths, difficultyFilter, roleFilter]);

  const selectedPath = useMemo(() => {
    return filteredPaths.find((p) => p.id === currentSelectedId) || filteredPaths[0] || paths[0];
  }, [currentSelectedId, filteredPaths, paths]);

  const copyShareLink = useCallback(() => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(window.location.href);
    toast.success("Curriculum link copied to clipboard!");
  }, []);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* ── Sub-header Banner ── */}
      <div className="rounded-xl bg-[var(--surface-1)] border border-[var(--border)] p-3.5 sm:p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-[10px] font-semibold text-purple-400">
              <Award size={12} />
              <span>Role-Based Career Roadmaps</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[var(--foreground)] tracking-tight">
              12 Structured Data Platform Career Curricula
            </h2>
            <p className="text-xs text-[var(--muted-foreground)] max-w-3xl leading-relaxed">
              Step-by-step role progression roadmaps from Microsoft Fabric DP-600 to 32-Week Principal Lakehouse Mastery.
              Includes week-by-week phases, capstone repositories, decision ledgers, and technical interview rubrics.
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

        {/* Filter Pills Deck: Difficulty & Role */}
        <div className="mt-3 pt-3 border-t border-[var(--border)] flex flex-wrap items-center gap-2">
          {/* Difficulty */}
          <div className="flex items-center gap-1 p-0.5 rounded-full bg-[var(--surface-2)] border border-[var(--border)] overflow-x-auto scrollbar-none max-w-fit shadow-2xs">
            {DIFFICULTY_FILTERS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setDifficultyFilter(opt.id)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap",
                  difficultyFilter === opt.id
                    ? "bg-purple-600 text-white shadow-xs"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Role Specialization */}
          <div className="flex items-center gap-1 p-0.5 rounded-full bg-[var(--surface-2)] border border-[var(--border)] overflow-x-auto scrollbar-none max-w-fit shadow-2xs">
            {ROLE_FILTERS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setRoleFilter(opt.id)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap",
                  roleFilter === opt.id
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

      {/* ── 5-Column Grid of Curricula Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
        {filteredPaths.map((path) => {
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
                  <div className="w-7 h-7 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center shrink-0 group-hover:border-purple-500/40 transition-colors shadow-xs">
                    <TopicIcon topicKey={cleanKey} size={16} />
                  </div>
                  <span
                    className={cn(
                      "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border shrink-0",
                      diffStyle.bg,
                      diffStyle.text,
                      diffStyle.border
                    )}
                  >
                    {path.difficulty}
                  </span>
                </div>
                <h3
                  className={cn(
                    "text-xs sm:text-[13px] font-bold leading-snug break-words whitespace-normal text-left",
                    isSelected ? "text-purple-400" : "text-[var(--foreground)] group-hover:text-purple-400 transition-colors"
                  )}
                >
                  {path.title}
                </h3>
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

      {/* ── Selected Path Deep Dive ── */}
      {selectedPath && (
        <div className="p-4 sm:p-5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] space-y-4 animate-in fade-in duration-200 shadow-xs">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3.5 border-b border-[var(--border)]">
            <div className="space-y-1.5 max-w-4xl">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center shrink-0 shadow-xs">
                  <TopicIcon topicKey={selectedPath.id.replace("path-", "")} size={20} />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[var(--foreground)] tracking-tight break-words">
                    {selectedPath.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-[10px] text-purple-400 font-semibold uppercase tracking-wider bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                      {selectedPath.badge}
                    </span>
                    <span className="text-[var(--muted-foreground)]">•</span>
                    <span className="text-purple-300 font-medium">
                      {selectedPath.weeks} Weeks Total
                    </span>
                    <span className="text-[var(--muted-foreground)]">•</span>
                    <span className="text-[var(--muted-foreground)]">
                      Prerequisites: <strong className="text-[var(--foreground)]">{selectedPath.prerequisites}</strong>
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed break-words">
                {selectedPath.description}
              </p>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-[var(--surface-2)] border border-purple-500/30 shrink-0 text-left sm:text-right self-start sm:self-auto shadow-2xs">
              <div className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                Capstone Milestone
              </div>
              <div className="text-xs font-bold text-purple-300 mt-0.5 break-words">
                {selectedPath.capstone}
              </div>
            </div>
          </div>

          {/* Mastered Skills & Protocols */}
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[var(--foreground)]">
              Core Skills &amp; Protocols Mastered:
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {selectedPath.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-0.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs font-medium text-purple-300 flex items-center gap-1 break-words"
                >
                  <CheckCircle2 size={11} className="text-emerald-400 shrink-0" />
                  <span>{skill}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Week-by-Week Phases Timeline */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[var(--foreground)]">
                Phase-by-Phase Roadmap Timeline ({selectedPath.phases.length} Phases):
              </h4>
              <div className="flex items-center gap-2 text-[11px] text-[var(--muted-foreground)]">
                <button
                  type="button"
                  onClick={() => setExpandedPhases(new Set(selectedPath.phases.map((p) => p.name)))}
                  className="hover:text-[var(--foreground)] transition-colors cursor-pointer"
                >
                  Expand All
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setExpandedPhases(new Set())}
                  className="hover:text-[var(--foreground)] transition-colors cursor-pointer"
                >
                  Collapse All
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {selectedPath.phases.map((phase, pi) => {
                const isExpanded = expandedPhases.has(phase.name);
                return (
                  <div
                    key={phase.name}
                    className="rounded-xl bg-[var(--surface-2)] border border-[var(--border)] overflow-hidden transition-all duration-150"
                  >
                    <div
                      onClick={() => togglePhase(phase.name)}
                      className="p-3 sm:p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none hover:bg-[var(--surface-3)]/60 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-6 h-6 rounded-md bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                          {pi + 1}
                        </span>
                        <div className="min-w-0">
                          <h5 className="text-xs sm:text-sm font-bold text-[var(--foreground)] tracking-tight truncate">
                            {phase.name}
                          </h5>
                          <span className="text-[10px] text-purple-400 font-mono">
                            {phase.weeks}
                          </span>
                        </div>
                      </div>

                      <ChevronDown
                        size={15}
                        className={cn(
                          "text-[var(--muted-foreground)] transition-transform duration-150 shrink-0",
                          isExpanded && "rotate-180 text-purple-400"
                        )}
                      />
                    </div>

                    {isExpanded && (
                      <div className="px-3.5 pb-3.5 pt-1 space-y-2.5 border-t border-[var(--border)] bg-[var(--surface-1)] text-xs animate-in fade-in duration-150">
                        <div className="space-y-1">
                          <div className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase">
                            Topics Covered in this Phase:
                          </div>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[var(--foreground)]">
                            {phase.topics.map((t, ti) => (
                              <li key={ti} className="flex items-start gap-1.5">
                                <CheckCircle2 size={12} className="text-emerald-400 mt-0.5 shrink-0" />
                                <span>{t}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="pt-2 border-t border-[var(--border)] text-purple-300 font-medium flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold text-purple-400 uppercase font-mono shrink-0">
                            Phase Milestone:
                          </span>
                          <span>{phase.milestone}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hands-on Capstone Project */}
          {selectedPath.handsOn && (
            <div className="p-3.5 sm:p-4 rounded-xl bg-[var(--surface-2)] border border-purple-500/30 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-400 uppercase tracking-wider">
                <GitBranch size={13} /> <span>Hands-On Capstone Project</span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-[var(--foreground)] break-words">
                {selectedPath.handsOn.title}
              </h4>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed break-words">
                {selectedPath.handsOn.description}
              </p>
              <div className="pt-1">
                <span className="text-xs font-mono text-purple-300 bg-[var(--surface-1)] px-2.5 py-1 rounded-lg border border-[var(--border)] inline-block break-all">
                  Repository: {selectedPath.handsOn.repo}
                </span>
              </div>
            </div>
          )}

          {/* Architecture Decision Record (ADR) Ledger */}
          <DecisionLedger />
        </div>
      )}
    </div>
  );
}
