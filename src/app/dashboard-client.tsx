"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Code2,
  Layers,
  Workflow,
  Search,
  Sparkles,
  CheckCircle2,
  Bookmark,
  Cpu,
  User,
  MessageSquare,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/useUserStore";
import { getLastTopic, getStoredExperienceTier, hasRealUserProgress } from "@/lib/user-progress";

export function DashboardClient() {
  const [isClient, setIsClient] = useState(false);
  const activeTier = getStoredExperienceTier();
  const topic = getLastTopic(activeTier);
  const bookmarks = useUserStore((s) => s.bookmarks);
  const userData = useUserStore((s) => s.userData);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const hasProgress = isClient && hasRealUserProgress();
  const bookmarksCount = bookmarks.length;
  const reviewedCount = userData.reviewedCount;
  const displayProgress = isClient && hasProgress ? Math.max(topic.progress, 15) : 0;

  return (
    <div className="space-y-8 sm:space-y-10 pb-16 w-full max-w-7xl 2xl:max-w-[1800px] 3xl:max-w-[2200px] 4xl:max-w-none mx-auto px-2 sm:px-4 2xl:px-6">
      {/* ── 1. Welcome & Concise Workspace Header ── */}
      <header className="space-y-3 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-xs font-semibold text-blue-600 dark:text-blue-400">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" aria-hidden="true" />
            <span className="uppercase tracking-wider">Guided Study Workspace</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/guided-learning?tab=curricula"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              <Zap size={13} className="text-amber-500" />
              <span>What&apos;s new in 2026: Spark 4.0 &amp; OneLake</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--foreground)] leading-tight">
              Build your data engineering skills, one step at a time.
            </h1>
            <p className="text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
              A structured workbench for modern data engineering and lakehouse architecture. Choose a goal below or follow the four-step sequence from mental models to production systems.
            </p>
          </div>

          <div className="shrink-0">
            <Link
              href="/search-topics"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--border)] text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors shadow-2xs"
            >
              <Search size={14} className="text-blue-500" />
              <span>Search all lessons &amp; tools</span>
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-1)] border border-[var(--border)] text-[10px] font-mono">
                ⌘K
              </kbd>
            </Link>
          </div>
        </div>
      </header>

      {/* ── 2. Continue Learning OR Clear Study Goals ── */}
      {hasProgress ? (
        <section
          aria-labelledby="continue-learning-title"
          className="rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-950/20 via-[var(--surface-1)] to-[var(--surface-1)] p-5 sm:p-6 shadow-xs relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="space-y-3 flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-500 dark:text-blue-400">
                <BookOpen size={14} />
                <span>Continue Learning · {topic.category}</span>
                {bookmarksCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-amber-500 font-medium ml-2">
                    <Bookmark size={12} className="fill-amber-500/20" />
                    {bookmarksCount} saved
                  </span>
                )}
              </div>

              <div>
                <h2 id="continue-learning-title" className="text-lg sm:text-xl font-bold text-[var(--foreground)] tracking-tight">
                  {topic.title}
                </h2>
                <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1">
                  Resume your active study track from where you left off.
                </p>
              </div>

              <div className="space-y-1.5 max-w-md">
                <div className="flex items-center justify-between text-xs font-medium text-[var(--muted-foreground)]">
                  <span>Track Progress</span>
                  <span className="font-mono">{displayProgress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[var(--surface-3)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-600 dark:bg-blue-500 transition-all duration-500 ease-out"
                    style={{ width: `${displayProgress}%` }}
                  />
                </div>
                {reviewedCount > 0 && (
                  <div className="text-[11px] text-[var(--muted-foreground)] flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-green-500" />
                    <span>{reviewedCount} items reviewed in this workspace</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
              <Link
                href={topic.href}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm transition-all shadow-xs active:scale-98"
              >
                <span>Resume Lesson</span>
                <ArrowRight size={14} />
              </Link>
              <Link
                href="/studio"
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--border)] text-[var(--foreground)] font-semibold text-xs sm:text-sm transition-colors"
              >
                My Studio
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Goal Choices */}
          <section
            aria-labelledby="goal-title"
            className="lg:col-span-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-5 sm:p-6 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 id="goal-title" className="text-base sm:text-lg font-bold text-[var(--foreground)] tracking-tight">
                  What would you like to work on?
                </h2>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  Start with the area that best matches your learning goal today.
                </p>
              </div>
              <Link
                href="/guided-learning"
                className="text-xs text-blue-500 hover:text-blue-400 font-semibold inline-flex items-center gap-1"
              >
                <span>All study tracks</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <Link
                href="/guided-learning"
                className="flex items-start gap-3 p-3.5 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--border)] hover:border-blue-500/30 transition-all group"
              >
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                  01
                </span>
                <div className="min-w-0">
                  <strong className="block text-xs sm:text-sm font-semibold text-[var(--foreground)] group-hover:text-blue-500 transition-colors">
                    Learn the foundations
                  </strong>
                  <span className="block text-[11px] text-[var(--muted-foreground)] mt-0.5 leading-snug">
                    Build core concepts, mental models, and structured curricula
                  </span>
                </div>
              </Link>

              <Link
                href="/code-practice"
                className="flex items-start gap-3 p-3.5 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--border)] hover:border-cyan-500/30 transition-all group"
              >
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-500 font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                  02
                </span>
                <div className="min-w-0">
                  <strong className="block text-xs sm:text-sm font-semibold text-[var(--foreground)] group-hover:text-cyan-500 transition-colors">
                    Practise with code
                  </strong>
                  <span className="block text-[11px] text-[var(--muted-foreground)] mt-0.5 leading-snug">
                    Work through hands-on exercises in PySpark, SQL, and Python
                  </span>
                </div>
              </Link>

              <Link
                href="/dataops"
                className="flex items-start gap-3 p-3.5 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--border)] hover:border-emerald-500/30 transition-all group"
              >
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                  03
                </span>
                <div className="min-w-0">
                  <strong className="block text-xs sm:text-sm font-semibold text-[var(--foreground)] group-hover:text-emerald-500 transition-colors">
                    Run production systems
                  </strong>
                  <span className="block text-[11px] text-[var(--muted-foreground)] mt-0.5 leading-snug">
                    Master CI/CD pipelines, secret management, and SDLC controls
                  </span>
                </div>
              </Link>

              <Link
                href="/architecture"
                className="flex items-start gap-3 p-3.5 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--border)] hover:border-purple-500/30 transition-all group"
              >
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                  04
                </span>
                <div className="min-w-0">
                  <strong className="block text-xs sm:text-sm font-semibold text-[var(--foreground)] group-hover:text-purple-400 transition-colors">
                    Prepare for architecture
                  </strong>
                  <span className="block text-[11px] text-[var(--muted-foreground)] mt-0.5 leading-snug">
                    Compare system designs, scenarios, and production trade-offs
                  </span>
                </div>
              </Link>
            </div>
          </section>

          {/* Recommended Starting Topic Card */}
          <section
            aria-labelledby="focus-title"
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">
                Recommended First Step
              </div>
              <h3 id="focus-title" className="text-sm sm:text-base font-bold text-[var(--foreground)] leading-snug">
                Understand Delta Lake &amp; Iceberg storage mechanics
              </h3>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                Learn how ACID transaction logs, Parquet columnar files, and catalog synchronization decouple compute from storage in modern lakehouses.
              </p>
            </div>

            <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between">
              <span className="text-[10px] font-mono text-[var(--muted-foreground)]">
                Storage &amp; Transactions
              </span>
              <Link
                href="/concepts"
                className="text-xs text-blue-500 hover:text-blue-400 font-semibold inline-flex items-center gap-1"
              >
                <span>Browse concepts</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </section>
        </div>
      )}

      {/* ── 3. Four-Step Learning Sequence ── */}
      <section aria-labelledby="sequence-title" className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 id="sequence-title" className="text-base sm:text-lg font-bold text-[var(--foreground)] tracking-tight">
              Your learning sequence
            </h2>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
              Move forward one stage at a time from foundations to production operations.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Step 1 */}
          <div className="relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] hover:border-blue-500/40 transition-all group shadow-2xs">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-500 text-white font-bold text-xs shadow-xs">
                  1
                </span>
                <span className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider">
                  Phase 1
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--foreground)] group-hover:text-blue-500 transition-colors">
                  Learn
                </h3>
                <p className="text-xs text-[var(--muted-foreground)] mt-1 leading-relaxed">
                  Build foundations with concepts, glossaries, and guided topic tracks.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-[var(--border)]">
              <Link
                href="/guided-learning"
                className="text-xs text-blue-500 hover:text-blue-400 font-semibold inline-flex items-center gap-1.5"
              >
                <span>Open guided learning</span>
                <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] hover:border-cyan-500/40 transition-all group shadow-2xs">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-cyan-600 text-white font-bold text-xs shadow-xs">
                  2
                </span>
                <span className="text-[10px] font-semibold text-cyan-500 uppercase tracking-wider">
                  Phase 2
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--foreground)] group-hover:text-cyan-500 transition-colors">
                  Practise
                </h3>
                <p className="text-xs text-[var(--muted-foreground)] mt-1 leading-relaxed">
                  Apply ideas in code drills, Spark labs, and execution visualizers.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-[var(--border)]">
              <Link
                href="/code-practice"
                className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-semibold inline-flex items-center gap-1.5"
              >
                <span>Choose an exercise</span>
                <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] hover:border-purple-500/40 transition-all group shadow-2xs">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-purple-600 text-white font-bold text-xs shadow-xs">
                  3
                </span>
                <span className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider">
                  Phase 3
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--foreground)] group-hover:text-purple-400 transition-colors">
                  Design
                </h3>
                <p className="text-xs text-[var(--muted-foreground)] mt-1 leading-relaxed">
                  Work through system scenarios, diagrams, and trade-offs.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-[var(--border)]">
              <Link
                href="/architecture"
                className="text-xs text-purple-500 hover:text-purple-400 font-semibold inline-flex items-center gap-1.5"
              >
                <span>Explore architecture</span>
                <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Step 4 */}
          <div className="relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] hover:border-emerald-500/40 transition-all group shadow-2xs">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs shadow-xs">
                  4
                </span>
                <span className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider">
                  Phase 4
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--foreground)] group-hover:text-emerald-500 transition-colors">
                  Operate &amp; review
                </h3>
                <p className="text-xs text-[var(--muted-foreground)] mt-1 leading-relaxed">
                  Connect delivery, reliability runbooks, and interview practice.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-[var(--border)]">
              <Link
                href="/dataops"
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold inline-flex items-center gap-1.5"
              >
                <span>Open DataOps</span>
                <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Direct Study Tools & Connected Workspace Note ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Direct Study Tools */}
        <section
          aria-labelledby="tools-title"
          className="lg:col-span-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-5 sm:p-6 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 id="tools-title" className="text-base sm:text-lg font-bold text-[var(--foreground)] tracking-tight">
                Go straight to a study tool
              </h2>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                Quick direct access to technical workbenches and laboratories.
              </p>
            </div>
            <Link
              href="/search-topics"
              className="text-xs text-blue-500 hover:text-blue-400 font-semibold inline-flex items-center gap-1"
            >
              <span>Search everything</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
            <Link
              href="/concepts"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--border)] hover:border-blue-500/30 text-xs font-semibold transition-all group"
            >
              <BookOpen size={15} className="text-blue-500 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="text-[var(--foreground)] truncate">Concepts Glossary</span>
            </Link>

            <Link
              href="/spark-engine"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--border)] hover:border-purple-500/30 text-xs font-semibold transition-all group"
            >
              <Cpu size={15} className="text-purple-400 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="text-[var(--foreground)] truncate">Spark Lab</span>
            </Link>

            <Link
              href="/architecture"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--border)] hover:border-purple-500/30 text-xs font-semibold transition-all group"
            >
              <Layers size={15} className="text-purple-400 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="text-[var(--foreground)] truncate">Architecture Hub</span>
            </Link>

            <Link
              href="/code-practice"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--border)] hover:border-cyan-500/30 text-xs font-semibold transition-all group"
            >
              <Code2 size={15} className="text-cyan-500 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="text-[var(--foreground)] truncate">Code Practice</span>
            </Link>

            <Link
              href="/qa-prep"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--border)] hover:border-amber-500/30 text-xs font-semibold transition-all group"
            >
              <MessageSquare size={15} className="text-amber-500 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="text-[var(--foreground)] truncate">Interview Practice</span>
            </Link>

            <Link
              href="/studio"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--border)] hover:border-blue-500/30 text-xs font-semibold transition-all group"
            >
              <User size={15} className="text-blue-500 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="text-[var(--foreground)] truncate">My Studio</span>
            </Link>
          </div>
        </section>

        {/* Connected Learning Note */}
        <aside
          aria-label="Workspace continuity note"
          className="rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--surface-1)] to-[var(--surface-2)] p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-3"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-500 uppercase tracking-wider">
              <Sparkles size={14} />
              <span>Workspace Continuity</span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-[var(--foreground)]">
              Keep your learning connected
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              Save any concept, drill, or scenario to My Studio. Your place and review notes persist locally in your browser across sessions.
            </p>
          </div>

          <div className="pt-2 border-t border-[var(--border)]">
            <Link
              href="/studio"
              className="text-xs text-blue-500 hover:text-blue-400 font-semibold inline-flex items-center gap-1.5"
            >
              <span>Open My Studio</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
