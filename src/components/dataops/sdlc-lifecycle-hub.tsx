"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Search,
  ExternalLink,
  CheckCircle2,
  ChevronRight,
  Workflow,
  Sparkles,
  Layers,
  FileCode2,
  AlertTriangle,
  Folder,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SDLC_PHASES,
  SDLC_LIFECYCLE_GATES,
  SdlcPhase,
  SdlcTopic,
} from "@/data/sdlc-lifecycle-data";

export function SdlcLifecycleHub() {
  const [selectedPhaseNumber, setSelectedPhaseNumber] = useState<number>(1);
  const [selectedGroup, setSelectedGroup] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeViewMode, setActiveViewMode] = useState<"phases" | "gates">("phases");

  const stageGroups = [
    "ALL",
    "Discovery & Design",
    "Build & Test",
    "Deployment & Infrastructure",
    "Operations & Reliability",
    "Maintenance & Retirement",
  ] as const;

  const activePhase = useMemo(() => {
    return (
      SDLC_PHASES.find((p) => p.phaseNumber === selectedPhaseNumber) ||
      SDLC_PHASES[0]
    );
  }, [selectedPhaseNumber]);

  // Search filtering
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    const results: Array<{ phase: SdlcPhase; topic: SdlcTopic }> = [];

    SDLC_PHASES.forEach((phase) => {
      phase.topics.forEach((topic) => {
        if (
          topic.title.toLowerCase().includes(q) ||
          topic.summary.toLowerCase().includes(q) ||
          topic.labFolder.toLowerCase().includes(q) ||
          phase.title.toLowerCase().includes(q)
        ) {
          results.push({ phase, topic });
        }
      });
    });

    return results;
  }, [searchQuery]);

  const filteredPhases = useMemo(() => {
    if (selectedGroup === "ALL") return SDLC_PHASES;
    return SDLC_PHASES.filter((p) => p.stageGroup === selectedGroup);
  }, [selectedGroup]);

  return (
    <div className="space-y-4">
      {/* ── Subnav & View Controls ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-1)]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Workflow size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[var(--foreground)]">
                Enterprise 360° Data Engineering SDLC
              </h2>
              <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                19 Phases · 152 Controls · 8 Gates
              </span>
            </div>
            <p className="text-[11px] text-[var(--muted-foreground)]">
              Grounded in NIST SSDF, Google SRE, and Google Cloud Well-Architected Framework.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
          <button
            onClick={() => setActiveViewMode("phases")}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all",
              activeViewMode === "phases"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-[var(--surface-2)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            )}
          >
            19 Lifecycle Phases
          </button>
          <button
            onClick={() => setActiveViewMode("gates")}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all",
              activeViewMode === "gates"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-[var(--surface-2)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            )}
          >
            8 Lifecycle Gates
          </button>
        </div>
      </div>

      {/* ── Search Bar ─────────────────────────────────────────────── */}
      <div className="relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search 152 controls (e.g. data contracts, threat modeling, canary, rollback, SLSA)..."
          className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[var(--border)] bg-[var(--surface-1)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-hidden focus:border-blue-500 transition-colors"
        />
      </div>

      {/* ── Search Results (if searching) ───────────────────────────── */}
      {searchResults ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4 space-y-3">
          <div className="text-xs text-[var(--muted-foreground)] flex items-center justify-between">
            <span>Found <strong className="text-[var(--foreground)]">{searchResults.length}</strong> matching controls</span>
            <button
              onClick={() => setSearchQuery("")}
              className="text-blue-400 hover:underline text-[11px]"
            >
              Clear search
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {searchResults.map(({ phase, topic }) => (
              <div
                key={topic.id}
                onClick={() => {
                  setSelectedPhaseNumber(phase.phaseNumber);
                  setActiveViewMode("phases");
                  setSearchQuery("");
                }}
                className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] hover:border-blue-500/40 cursor-pointer transition-all space-y-1"
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-mono text-blue-400 font-bold">
                    Phase {phase.phaseNumber} ({phase.shortTitle}) · Control #{topic.code}
                  </span>
                  <span className="text-[var(--muted-foreground)] font-mono">
                    {topic.labFolder}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-[var(--foreground)]">
                  {topic.title}
                </h4>
                <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                  {topic.summary}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : activeViewMode === "gates" ? (
        /* ── 8 LIFECYCLE GATES & EVIDENCE VIEW ────────────────────────── */
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {SDLC_LIFECYCLE_GATES.map((gate, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-3.5 space-y-2 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      Gate #{idx + 1}
                    </span>
                    <span className="text-[10px] text-[var(--muted-foreground)]">
                      Phases {gate.phaseNumbers.join(", ")}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[var(--foreground)]">
                    {gate.gate} Gate
                  </h3>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                    {gate.evidence}
                  </p>
                </div>

                <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-[10px]">
                  <span className="text-emerald-400 flex items-center gap-1 font-medium">
                    <CheckCircle2 size={12} />
                    Audit Verified
                  </span>
                  <button
                    onClick={() => {
                      setSelectedPhaseNumber(gate.phaseNumbers[0]);
                      setActiveViewMode("phases");
                    }}
                    className="text-blue-400 hover:underline font-semibold"
                  >
                    View Phase {gate.phaseNumbers[0]} →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ── 19 LIFECYCLE PHASES WORKBENCH ────────────────────────────── */
        <div className="space-y-4">
          {/* Stage Group Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {stageGroups.map((group) => (
              <button
                key={group}
                onClick={() => setSelectedGroup(group)}
                className={cn(
                  "px-2.5 py-1 text-[11px] font-semibold rounded-lg border whitespace-nowrap transition-colors",
                  selectedGroup === group
                    ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                    : "bg-[var(--surface-2)] text-[var(--muted-foreground)] border-[var(--border)] hover:text-[var(--foreground)]"
                )}
              >
                {group === "ALL" ? "All 19 Phases" : group}
              </button>
            ))}
          </div>

          {/* Phase Grid Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-1.5">
            {filteredPhases.map((phase) => {
              const isActive = phase.phaseNumber === selectedPhaseNumber;
              return (
                <button
                  key={phase.phaseNumber}
                  onClick={() => setSelectedPhaseNumber(phase.phaseNumber)}
                  className={cn(
                    "p-2 rounded-lg border text-left transition-all duration-150 flex flex-col justify-between gap-1",
                    isActive
                      ? "bg-blue-600/10 border-blue-500 text-blue-400 shadow-xs"
                      : "bg-[var(--surface-2)] border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--border-hover)] hover:text-[var(--foreground)]"
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-mono font-bold">
                      {String(phase.phaseNumber).padStart(2, "0")}
                    </span>
                    <span className="text-xs">{phase.icon}</span>
                  </div>
                  <div className="text-[11px] font-bold truncate w-full text-[var(--foreground)]">
                    {phase.shortTitle}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Phase Detailed Inspector */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4 sm:p-5 space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Phase {String(activePhase.phaseNumber).padStart(2, "0")} / 19
                  </span>
                  <span className="text-xs text-[var(--muted-foreground)] font-semibold">
                    {activePhase.stageGroup}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
                  <span>{activePhase.icon}</span>
                  <span>{activePhase.title}</span>
                </h3>
              </div>

              {/* Research Anchors */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-[var(--muted-foreground)]">Research Anchors:</span>
                {activePhase.researchAnchors.map((anchor, idx) => (
                  <a
                    key={idx}
                    href={anchor.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-[var(--surface-2)] text-blue-400 border border-[var(--border)] hover:border-blue-500/40 hover:underline"
                  >
                    <span>{anchor.label}</span>
                    <ExternalLink size={10} />
                  </a>
                ))}
              </div>
            </div>

            {/* 8 Controls in this Phase */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {activePhase.topics.map((topic) => (
                <div
                  key={topic.id}
                  className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] hover:border-[var(--border-hover)] transition-all space-y-1.5 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        Control #{topic.code}
                      </span>
                      <span className="text-[10px] font-mono text-[var(--muted-foreground)] truncate max-w-[220px]">
                        {topic.labFolder}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-[var(--foreground)] leading-snug">
                      {topic.title}
                    </h4>
                    <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                      {topic.summary}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]/60 text-[10px]">
                    <span className="text-[var(--muted-foreground)] flex items-center gap-1">
                      <Folder size={11} className="text-amber-400" />
                      <span>labs/15-end-to-end-sdlc/{topic.labFolder}</span>
                    </span>
                    <Link
                      href={`/qa-prep?q=${encodeURIComponent(topic.title)}`}
                      className="text-blue-400 hover:underline flex items-center gap-0.5 font-medium shrink-0"
                    >
                      <span>Drill QA</span>
                      <ArrowRight size={10} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Prev / Next Phase Navigation */}
            <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
              <button
                disabled={activePhase.phaseNumber === 1}
                onClick={() => setSelectedPhaseNumber((prev) => Math.max(1, prev - 1))}
                className="px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-[var(--foreground)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--surface-3)]"
              >
                ← Previous Phase
              </button>
              <span className="text-xs text-[var(--muted-foreground)]">
                Phase {activePhase.phaseNumber} of 19
              </span>
              <button
                disabled={activePhase.phaseNumber === 19}
                onClick={() => setSelectedPhaseNumber((prev) => Math.min(19, prev + 1))}
                className="px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-[var(--foreground)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--surface-3)]"
              >
                Next Phase →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
