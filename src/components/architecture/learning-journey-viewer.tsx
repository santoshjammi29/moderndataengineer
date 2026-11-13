"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Compass,
  HelpCircle,
  Search,
  Sliders,
  AlertTriangle,
  Activity,
  BookOpen,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Cpu,
  Layers,
  Terminal,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ArchitectureDiagramItem } from "@/data/diagrams";
import {
  JourneyStageId,
  LearningJourney,
  LearningJourneyStageData,
} from "@/types/learning-journey";
import { getLearningJourney, STAGE_METADATA } from "@/data/learning-journeys";
import { CodeBlock } from "@/components/ui/code-block";

const STAGE_ICONS: Record<JourneyStageId, React.ComponentType<{ size?: number; className?: string }>> = {
  map: Compass,
  predict: HelpCircle,
  inspect: Search,
  experiment: Sliders,
  break: AlertTriangle,
  diagnose: Activity,
  explain: BookOpen,
  operate: ShieldCheck,
};

const STAGE_ORDER: JourneyStageId[] = [
  "map",
  "predict",
  "inspect",
  "experiment",
  "break",
  "diagnose",
  "explain",
  "operate",
];

interface LearningJourneyViewerProps {
  diagram: ArchitectureDiagramItem;
  initialStage?: JourneyStageId;
  onNavigateSimulator?: (url: string) => void;
  className?: string;
}

export function LearningJourneyViewer({
  diagram,
  initialStage = "map",
  onNavigateSimulator,
  className,
}: LearningJourneyViewerProps) {
  const journey: LearningJourney = React.useMemo(() => {
    return getLearningJourney(diagram);
  }, [diagram]);

  const [activeStage, setActiveStage] = useState<JourneyStageId>(initialStage);
  const [selectedPrediction, setSelectedPrediction] = useState<string | null>(null);
  const [showPredictionFeedback, setShowPredictionFeedback] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const currentStageData: LearningJourneyStageData = journey.stages[activeStage];
  const activeIndex = STAGE_ORDER.indexOf(activeStage);
  const progressPercent = Math.round(((activeIndex + 1) / STAGE_ORDER.length) * 100);

  const handleSelectPrediction = (optionId: string) => {
    setSelectedPrediction(optionId);
    setShowPredictionFeedback(true);
  };

  const handleResetPrediction = () => {
    setSelectedPrediction(null);
    setShowPredictionFeedback(false);
  };

  const handleNextStage = () => {
    if (activeIndex < STAGE_ORDER.length - 1) {
      setActiveStage(STAGE_ORDER[activeIndex + 1]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevStage = () => {
    if (activeIndex > 0) {
      setActiveStage(STAGE_ORDER[activeIndex - 1]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className={cn("flex flex-col space-y-4", className)}>
      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. Header & Learning Journey Stepper Ribbon */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="space-y-3 p-3.5 sm:p-5 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                8-Stage Learning Journey
              </span>
              <span className="text-[10px] font-mono text-[var(--muted-foreground)]">
                ⏱ ~{journey.estimatedMinutes} mins
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
              {journey.title}
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5 line-clamp-2">
              {journey.targetOutcome}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            <div className="text-right">
              <span className="text-[10px] font-mono text-[var(--muted-foreground)] block">Stage Progress</span>
              <span className="text-xs font-mono font-bold text-blue-400">
                {activeIndex + 1} of {STAGE_ORDER.length} ({progressPercent}%)
              </span>
            </div>
            <div className="w-14 sm:w-20 h-2 bg-[var(--surface-3)] rounded-full overflow-hidden border border-[var(--border)]">
              <div
                className="h-full bg-blue-500 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* 8-Stage Stepper Buttons (Keyboard Accessible) */}
        <div
          role="tablist"
          aria-label="Learning Journey Stages"
          className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 pt-2 border-t border-[var(--border)]"
        >
          {STAGE_ORDER.map((stageId, idx) => {
            const Icon = STAGE_ICONS[stageId];
            const meta = STAGE_METADATA[stageId];
            const isActive = activeStage === stageId;
            const isCompleted = idx < activeIndex;

            return (
              <button
                key={stageId}
                role="tab"
                id={`stage-tab-${stageId}`}
                aria-selected={isActive}
                aria-controls={`stage-panel-${stageId}`}
                onClick={() => setActiveStage(stageId)}
                className={cn(
                  "p-2 rounded-xl flex flex-col items-center justify-center text-center transition-all cursor-pointer relative border min-h-[56px] sm:min-h-[64px]",
                  isActive
                    ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20"
                    : isCompleted
                    ? "bg-[var(--surface-2)] text-blue-400 border-blue-500/30 hover:border-blue-500/60"
                    : "bg-[var(--surface-2)] text-[var(--muted-foreground)] border-[var(--border)] hover:text-[var(--foreground)] hover:border-[var(--border-hover)]"
                )}
                title={`${meta.order}. ${meta.name} — ${meta.tagline}`}
              >
                <div className="flex items-center gap-1 mb-0.5">
                  <span className={cn(
                    "text-[9px] font-mono font-bold px-1 rounded",
                    isActive ? "bg-white/20 text-white" : isCompleted ? "text-blue-400" : "text-[var(--muted-foreground)]"
                  )}>
                    {idx + 1}
                  </span>
                  <Icon size={12} className={isActive ? "text-white" : isCompleted ? "text-blue-400" : ""} />
                </div>
                <span className="text-[11px] font-bold leading-tight truncate w-full">
                  {meta.name}
                </span>
                <span className={cn(
                  "text-[8px] font-medium hidden md:block truncate max-w-full opacity-80 mt-0.5",
                  isActive ? "text-blue-100" : "text-[var(--muted-foreground)]"
                )}>
                  {meta.tagline.split(" ")[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. Active Stage Body */}
      {/* ────────────────────────────────────────────────────────── */}
      <div
        role="tabpanel"
        id={`stage-panel-${activeStage}`}
        aria-labelledby={`stage-tab-${activeStage}`}
        className="p-4 sm:p-6 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] space-y-4 animate-in fade-in duration-200"
      >
        {/* Stage Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2">
            {React.createElement(STAGE_ICONS[activeStage], { size: 18, className: "text-blue-500" })}
            <div>
              <span className="text-[10px] font-mono font-bold text-blue-500 uppercase tracking-wider">
                Stage {activeIndex + 1} of 8
              </span>
              <h4 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
                {currentStageData.name}: {currentStageData.tagline}
              </h4>
            </div>
          </div>
          <span className="text-[11px] font-mono text-[var(--muted-foreground)] hidden sm:inline-block">
            {diagram.title}
          </span>
        </div>

        {/* Stage Summary */}
        <p className="text-xs sm:text-sm text-[var(--foreground)] leading-relaxed">
          {currentStageData.summary}
        </p>

        {/* ── STAGE 1: MAP ── */}
        {activeStage === "map" && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentStageData.keyPoints.map((point, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-start gap-2.5 text-xs text-[var(--foreground)]"
                >
                  <span className="p-1 rounded bg-blue-500/10 text-blue-400 font-mono font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{point}</span>
                </div>
              ))}
            </div>

            {journey.prerequisites.length > 0 && (
              <div className="p-3 rounded-xl bg-[var(--surface-2)]/60 border border-[var(--border)] flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold text-blue-400 flex items-center gap-1">
                  <Sparkles size={13} /> Prerequisites:
                </span>
                {journey.prerequisites.map((req, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-[var(--surface-3)] text-[var(--muted-foreground)] border border-[var(--border)] text-[11px]"
                  >
                    {req}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── STAGE 2: PREDICT ── */}
        {activeStage === "predict" && (
          <div className="space-y-4 pt-2">
            {currentStageData.predictionScenario && (
              <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/25 space-y-1.5">
                <div className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <HelpCircle size={14} /> Technical Scenario
                </div>
                <p className="text-xs sm:text-sm text-[var(--foreground)] leading-relaxed">
                  {currentStageData.predictionScenario}
                </p>
              </div>
            )}

            {currentStageData.predictionQuestion && (
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)] flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-400" />
                  Hypothesis Challenge: {currentStageData.predictionQuestion}
                </div>

                <div className="space-y-2">
                  {currentStageData.predictionOptions?.map((option) => {
                    const isSelected = selectedPrediction === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleSelectPrediction(option.id)}
                        className={cn(
                          "w-full text-left p-3.5 rounded-xl border text-xs transition-all flex items-start gap-3 cursor-pointer",
                          isSelected
                            ? option.isCorrect
                              ? "bg-emerald-500/10 border-emerald-500 text-emerald-300"
                              : "bg-red-500/10 border-red-500 text-red-300"
                            : "bg-[var(--surface-2)] border-[var(--border)] hover:border-blue-500/40 text-[var(--foreground)]"
                        )}
                      >
                        <div
                          className={cn(
                            "w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]",
                            isSelected
                              ? option.isCorrect
                                ? "bg-emerald-500 text-black border-emerald-400"
                                : "bg-red-500 text-white border-red-400"
                              : "border-[var(--border)] text-[var(--muted-foreground)] bg-[var(--surface-3)]"
                          )}
                        >
                          {isSelected ? (option.isCorrect ? "✓" : "✗") : option.id.charAt(option.id.length - 1).toUpperCase()}
                        </div>
                        <div className="space-y-1">
                          <div className="font-semibold leading-relaxed">{option.label}</div>
                          {showPredictionFeedback && isSelected && (
                            <div className="pt-2 text-[11px] space-y-1 border-t border-[var(--border)]">
                              <p className={option.isCorrect ? "text-emerald-400 font-medium" : "text-amber-400 font-medium"}>
                                {option.explanation}
                              </p>
                              {option.impactAnalysis && (
                                <p className="text-[var(--muted-foreground)] italic font-mono text-[10px]">
                                  {option.impactAnalysis}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {showPredictionFeedback && (
                  <div className="pt-1 flex justify-end">
                    <button
                      type="button"
                      onClick={handleResetPrediction}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] bg-[var(--surface-2)] border border-[var(--border)] cursor-pointer"
                    >
                      <RotateCcw size={12} /> Test Another Option
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── STAGE 3: INSPECT ── */}
        {activeStage === "inspect" && (
          <div className="space-y-4 pt-2">
            {currentStageData.codeOrPlanSnippet && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-[var(--foreground)]">
                  <span className="flex items-center gap-1.5">
                    <Terminal size={14} className="text-blue-400" />
                    {currentStageData.snippetTitle || "Internal Engine Execution Plan"}
                  </span>
                </div>
                <CodeBlock
                  code={currentStageData.codeOrPlanSnippet}
                  language={currentStageData.snippetLanguage || "text"}
                  filename={currentStageData.snippetTitle}
                />
              </div>
            )}

            {currentStageData.inspectMechanisms && currentStageData.inspectMechanisms.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                  <Cpu size={14} /> Under-The-Hood Architecture Mechanisms
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {currentStageData.inspectMechanisms.map((mech, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--foreground)] flex items-start gap-2"
                    >
                      <span className="text-blue-400 font-mono font-bold shrink-0">#{idx + 1}</span>
                      <span className="leading-relaxed">{mech}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STAGE 4: EXPERIMENT ── */}
        {activeStage === "experiment" && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {currentStageData.simulatorUrl && (
                <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-purple-500/25 space-y-2 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                        Interactive Stack Simulator
                      </span>
                      <Sliders size={14} className="text-purple-400" />
                    </div>
                    <h5 className="text-sm font-bold text-[var(--foreground)]">
                      {currentStageData.simulatorLabel || "Launch Simulator"}
                    </h5>
                    <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                      Adjust input rows, record size, and data skew multiplier to observe the physical partition rebalance in real time.
                    </p>
                  </div>

                  <div className="pt-2">
                    {onNavigateSimulator ? (
                      <button
                        type="button"
                        onClick={() => onNavigateSimulator(currentStageData.simulatorUrl!)}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <span>Open Simulator</span>
                        <ArrowRight size={13} />
                      </button>
                    ) : (
                      <Link
                        href={currentStageData.simulatorUrl}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition-colors"
                      >
                        <span>Open Simulator</span>
                        <ArrowRight size={13} />
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {currentStageData.notebookUrl && (
                <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-emerald-500/25 space-y-2 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Runnable Code &amp; Benchmarks
                      </span>
                      <ExternalLink size={14} className="text-emerald-400" />
                    </div>
                    <h5 className="text-sm font-bold text-[var(--foreground)]">
                      {currentStageData.notebookLabel || "Inspect Runnable Benchmark"}
                    </h5>
                    <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                      Run real PySpark code on 39.8M rows. Verify SortMergeJoin (11.32s), AQE (9.62s), and Broadcast (2.78s) execution metrics.
                    </p>
                  </div>

                  <div className="pt-2">
                    <a
                      href={currentStageData.notebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
                    >
                      <span>Open Notebook ↗</span>
                    </a>
                  </div>
                </div>
              )}
            </div>

            {currentStageData.experimentSteps && (
              <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                  Guided Experimentation Steps:
                </div>
                <ul className="space-y-1.5 text-xs text-[var(--muted-foreground)]">
                  {currentStageData.experimentSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-400 font-bold shrink-0">→</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* ── STAGE 5: BREAK ── */}
        {activeStage === "break" && (
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/25 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider">
                <AlertTriangle size={15} /> Controlled Failure Injection Scenario
              </div>
              <p className="text-xs sm:text-sm text-[var(--foreground)] leading-relaxed">
                {currentStageData.failureScenario}
              </p>
              {currentStageData.triggerCondition && (
                <div className="pt-1 text-xs text-[var(--muted-foreground)]">
                  <span className="font-bold text-red-300">Trigger Condition: </span>
                  {currentStageData.triggerCondition}
                </div>
              )}
            </div>

            {currentStageData.symptoms && currentStageData.symptoms.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                  Observable Incident Symptoms:
                </div>
                <div className="space-y-2">
                  {currentStageData.symptoms.map((symptom, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-[var(--surface-2)] border border-red-500/20 text-xs text-[var(--foreground)] flex items-start gap-2"
                    >
                      <XCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{symptom}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentStageData.exceptionSnippet && (
              <div className="space-y-1.5">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Exception Stack Trace:
                </div>
                <CodeBlock code={currentStageData.exceptionSnippet} language="text" filename="error_trace.log" />
              </div>
            )}
          </div>
        )}

        {/* ── STAGE 6: DIAGNOSE ── */}
        {activeStage === "diagnose" && (
          <div className="space-y-4 pt-2">
            {currentStageData.observableMetrics && currentStageData.observableMetrics.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)] flex items-center gap-1.5">
                  <Activity size={14} className="text-blue-400" />
                  Observable Telemetry &amp; Metrics Comparison Table
                </div>

                <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[var(--surface-3)] text-[var(--muted-foreground)] uppercase text-[10px] font-mono">
                      <tr>
                        <th className="py-2.5 px-3">Telemetry Metric</th>
                        <th className="py-2.5 px-3">Normal Baseline</th>
                        <th className="py-2.5 px-3">Observed Broken State</th>
                        <th className="py-2.5 px-3">Architectural Significance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)] bg-[var(--surface-2)]">
                      {currentStageData.observableMetrics.map((row, idx) => (
                        <tr key={idx} className="hover:bg-[var(--surface-1)] transition-colors">
                          <td className="py-2.5 px-3 font-semibold text-[var(--foreground)]">{row.metric}</td>
                          <td className="py-2.5 px-3 text-emerald-400 font-mono">{row.normalBaseline}</td>
                          <td className="py-2.5 px-3 text-red-400 font-mono font-bold">{row.brokenObserved}</td>
                          <td className="py-2.5 px-3 text-[var(--muted-foreground)]">{row.significance}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {currentStageData.diagnosticChecklist && (
              <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  Step-by-Step Triage Checklist:
                </div>
                <div className="space-y-2">
                  {currentStageData.diagnosticChecklist.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-[var(--foreground)]">
                      <span className="p-0.5 rounded bg-blue-500/10 text-blue-400 font-mono font-bold text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STAGE 7: EXPLAIN ── */}
        {activeStage === "explain" && (
          <div className="space-y-4 pt-2">
            {currentStageData.tradeOffComparison && (
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)] flex items-center gap-1.5">
                  <Layers size={14} className="text-purple-400" /> Architectural Trade-offs &amp; Alternative Patterns
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {currentStageData.tradeOffComparison.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-2 flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <span className="text-xs font-bold text-[var(--foreground)] block">{item.option}</span>
                        <div className="text-[11px] text-emerald-400">
                          <span className="font-bold">✔ Pro: </span>
                          {item.pros}
                        </div>
                        <div className="text-[11px] text-red-400">
                          <span className="font-bold">✗ Con: </span>
                          {item.cons}
                        </div>
                      </div>
                      <div className="pt-2 text-[10px] text-[var(--muted-foreground)] border-t border-[var(--border)] italic">
                        {item.recommendation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentStageData.formulaTex && (
              <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-blue-500/25 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  {currentStageData.formulaTitle || "Mathematical Sizing Formulation"}
                </div>
                <div className="p-3 rounded-lg bg-[var(--surface-3)] border border-[var(--border)] font-mono text-xs sm:text-sm text-center text-blue-300 overflow-x-auto">
                  {currentStageData.formulaTex}
                </div>
                {currentStageData.formulaExplanation && (
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                    {currentStageData.formulaExplanation}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── STAGE 8: OPERATE ── */}
        {activeStage === "operate" && (
          <div className="space-y-4 pt-2">
            {currentStageData.productionConfigs && currentStageData.productionConfigs.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck size={14} /> Production Configuration Guardrails
                </div>

                <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[var(--surface-3)] text-[var(--muted-foreground)] uppercase text-[10px] font-mono">
                      <tr>
                        <th className="py-2.5 px-3">Configuration Parameter</th>
                        <th className="py-2.5 px-3">Recommended Value</th>
                        <th className="py-2.5 px-3">Impact &amp; Behavior</th>
                        <th className="py-2.5 px-3 text-right">Copy</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)] bg-[var(--surface-2)]">
                      {currentStageData.productionConfigs.map((cfg, idx) => (
                        <tr key={idx} className="hover:bg-[var(--surface-1)] transition-colors">
                          <td className="py-2.5 px-3 font-mono text-blue-400 font-semibold">{cfg.parameter}</td>
                          <td className="py-2.5 px-3 font-mono text-emerald-400 font-bold">{cfg.recommendedValue}</td>
                          <td className="py-2.5 px-3 text-[var(--muted-foreground)]">{cfg.impact}</td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleCopyText(`${cfg.parameter}=${cfg.recommendedValue}`, `cfg-${idx}`)}
                              className="p-1 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] cursor-pointer"
                              title="Copy configuration line"
                            >
                              {copiedKey === `cfg-${idx}` ? (
                                <Check size={13} className="text-emerald-400" />
                              ) : (
                                <Copy size={13} />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {currentStageData.monitoringAlertRules && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Recommended Monitoring &amp; Alert Rules:
                </div>
                <div className="space-y-1.5">
                  {currentStageData.monitoringAlertRules.map((alert, idx) => (
                    <div key={idx} className="text-xs text-[var(--foreground)] font-mono flex items-start gap-2">
                      <span className="text-amber-400 shrink-0">🔔</span>
                      <span>{alert}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentStageData.rollbackProcedure && (
              <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                  Disaster Recovery &amp; Rollback Procedure:
                </div>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                  {currentStageData.rollbackProcedure}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ────────────────────────────────────────────────────────── */}
        {/* Stage Bottom Navigation Buttons */}
        {/* ────────────────────────────────────────────────────────── */}
        <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handlePrevStage}
            disabled={activeIndex === 0}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer",
              activeIndex === 0
                ? "opacity-40 cursor-not-allowed text-[var(--muted-foreground)] bg-[var(--surface-2)]"
                : "bg-[var(--surface-2)] text-[var(--foreground)] hover:bg-[var(--surface-3)] border border-[var(--border)]"
            )}
          >
            <ChevronLeft size={14} />
            <span>Previous</span>
          </button>

          <span className="text-[11px] font-mono text-[var(--muted-foreground)]">
            Stage {activeIndex + 1} / {STAGE_ORDER.length}
          </span>

          {activeIndex < STAGE_ORDER.length - 1 ? (
            <button
              type="button"
              onClick={handleNextStage}
              className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs shadow-blue-500/20 transition-all cursor-pointer"
            >
              <span>Next: {STAGE_METADATA[STAGE_ORDER[activeIndex + 1]].name}</span>
              <ChevronRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                toast.success("Congratulations! You completed the 8-Stage Learning Journey!");
                setActiveStage("map");
              }}
              className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <CheckCircle2 size={14} />
              <span>Journey Completed!</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
