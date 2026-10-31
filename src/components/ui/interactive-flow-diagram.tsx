"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface FlowStage {
  id: string;
  name: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  keyTechniques: string[];
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export interface InteractiveFlowDiagramProps {
  title: string;
  badge?: string;
  subtitle: string;
  icon?: React.ElementType;
  stages: FlowStage[];
  defaultStageId?: string;
  initialExpanded?: boolean;
  className?: string;
  onSelectStage?: (stageId: string) => void;
  onStageAction?: (stageId: string) => void;
}

export function InteractiveFlowDiagram({
  title,
  badge = "Interactive Flow",
  subtitle,
  icon: HeaderIcon = Zap,
  stages,
  defaultStageId,
  initialExpanded = true,
  className,
  onSelectStage,
  onStageAction,
}: InteractiveFlowDiagramProps) {
  const [selectedStageId, setSelectedStageId] = useState<string>(
    defaultStageId || (stages.length > 0 ? stages[0].id : "")
  );
  const [isExpanded, setIsExpanded] = useState<boolean>(initialExpanded);

  const activeStage =
    stages.find((s) => s.id === selectedStageId) || stages[0];

  const handleStageClick = (stageId: string) => {
    setSelectedStageId(stageId);
    if (onSelectStage) {
      onSelectStage(stageId);
    }
  };

  if (!stages || stages.length === 0) return null;

  const activeIndex = stages.findIndex((s) => s.id === activeStage.id);

  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5 shadow-lg backdrop-blur-xl transition-all",
        className
      )}
    >
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <HeaderIcon size={16} />
            </span>
            <h2 className="text-base font-bold text-[var(--foreground)] tracking-tight">
              {title}
            </h2>
            {badge && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            {subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="self-start sm:self-auto px-2.5 py-1 text-xs font-medium rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
        >
          {isExpanded ? "Collapse Diagram" : "Expand Diagram"}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 sm:mt-5 space-y-4">
          {/* Flow Stepper Buttons / Nodes */}
          <div
            className={cn(
              "grid gap-2.5",
              stages.length <= 4
                ? "grid-cols-2 sm:grid-cols-4"
                : stages.length === 5
                ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
                : "grid-cols-2 md:grid-cols-3 lg:grid-cols-6"
            )}
          >
            {stages.map((stage, idx) => {
              const Icon = stage.icon;
              const isSelected = stage.id === selectedStageId;

              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => handleStageClick(stage.id)}
                  className={cn(
                    "group relative flex flex-col p-3 rounded-xl border text-left transition-all cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-blue-500/40",
                    isSelected
                      ? `${stage.bgColor} ${stage.borderColor} shadow-md shadow-blue-500/5 ring-1 ring-blue-500/30`
                      : "bg-[var(--surface-1)] border-[var(--border)] hover:bg-[var(--surface-2)] hover:border-[var(--border-hover)]"
                  )}
                  aria-pressed={isSelected}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-md border text-xs",
                        isSelected
                          ? `${stage.bgColor} ${stage.color} ${stage.borderColor}`
                          : "bg-[var(--surface-2)] text-[var(--muted-foreground)] border-transparent group-hover:text-[var(--foreground)]"
                      )}
                    >
                      <Icon size={13} />
                    </span>
                    <span className="text-[10px] font-mono text-[var(--muted-foreground)] font-semibold">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <span
                    className={cn(
                      "text-xs font-semibold leading-tight",
                      isSelected ? stage.color : "text-[var(--foreground)]"
                    )}
                  >
                    {stage.name}
                  </span>
                  <span className="text-[10px] text-[var(--muted-foreground)] truncate mt-0.5">
                    {stage.subtitle}
                  </span>

                  {/* Active indicator dot */}
                  {isSelected && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 rounded-full bg-blue-500" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Detailed Inspector Panel for Selected Stage */}
          {activeStage && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider border",
                        activeStage.bgColor,
                        activeStage.color,
                        activeStage.borderColor
                      )}
                    >
                      Stage {activeIndex + 1} of {stages.length}
                    </span>
                    <h3 className="text-sm font-bold text-[var(--foreground)]">
                      {activeStage.name} — {activeStage.subtitle}
                    </h3>
                  </div>
                  <p className="text-xs text-[var(--foreground)] leading-relaxed">
                    {activeStage.description}
                  </p>

                  {/* Key Techniques / Sub-processes */}
                  {activeStage.keyTechniques && activeStage.keyTechniques.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] font-medium text-[var(--muted-foreground)]">
                        Key Mechanisms:
                      </span>
                      {activeStage.keyTechniques.map((tech) => (
                        <span
                          key={tech}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-[var(--surface-2)] text-[var(--foreground)] border border-[var(--border)]"
                        >
                          <CheckCircle2 size={10} className={activeStage.color} />
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action CTA Button */}
                {activeStage.actionHref ? (
                  <Link
                    href={activeStage.actionHref}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/15 hover:bg-blue-600/25 active:scale-95 text-blue-400 border border-blue-500/30 text-xs font-semibold transition-all cursor-pointer shadow-xs"
                  >
                    <Sparkles size={13} />
                    <span>{activeStage.actionLabel || "Explore Related"}</span>
                    <ChevronRight size={13} />
                  </Link>
                ) : (activeStage.onAction || onStageAction) ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (activeStage.onAction) {
                        activeStage.onAction();
                      } else if (onStageAction) {
                        onStageAction(activeStage.id);
                      }
                    }}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/15 hover:bg-blue-600/25 active:scale-95 text-blue-400 border border-blue-500/30 text-xs font-semibold transition-all cursor-pointer shadow-xs"
                  >
                    <Sparkles size={13} />
                    <span>{activeStage.actionLabel || "Explore Stage"}</span>
                    <ChevronRight size={13} />
                  </button>
                ) : null}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
