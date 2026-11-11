"use client";

import { CONTENT_COUNTS, formatContentCount } from "@/data/content-counts";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Compass,
  BookOpen,
  Layers,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Search,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { KbdShortcut } from "@/components/ui/kbd-shortcut";

const HERO_SUGGESTIONS = [
  "Data Skew in Spark",
  "Delta Lake ACID",
  "Direct Lake VertiPaq",
  "Liquid Clustering",
  "Kafka CDC Debezium",
  "Kimball Star Schema",
];

export function HeroCommandCenter() {
  const [heroSearch, setHeroSearch] = useState("");
  const router = useRouter();

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = heroSearch.trim();
    if (trimmed) {
      router.push(`/search-topics?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/search-topics");
    }
  };

  const openSearch = () => {
    window.dispatchEvent(new CustomEvent("open-command-palette"));
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">
      {/* ── 1. FOCUSED, MOTIVATIONAL HERO BANNER ───────────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] p-4 sm:p-6 lg:p-8 isolate shadow-sm">
        {/* Ambient atmospheric lighting */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.14)_0%,transparent_70%)] blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-20 w-[350px] h-[350px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.1)_0%,transparent_70%)] blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-4">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-[11px] font-semibold text-blue-600 dark:text-blue-300 backdrop-blur-md">
            <Sparkles size={12} className="text-blue-500 dark:text-blue-400 animate-pulse" />
            <span className="tracking-wide">2026 LAKEHOUSE ARCHITECT &amp; SYSTEMS MASTERCLASS</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span className="text-[11px] text-blue-500/90 font-mono font-bold">{formatContentCount(CONTENT_COUNTS.searchDocuments)} ITEMS</span>
          </div>

          {/* Main motivational title */}
          <div className="space-y-1.5">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-[var(--foreground)] leading-tight break-words">
              Lakehouse Architecture &amp; Systems Mastery
              <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-400 to-cyan-400">
                Enterprise Blueprints, Medallion Patterns &amp; Principal Systems Practice
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed max-w-3xl">
              The premier open-access knowledge base for Lakehouse Architects and Lead Data Engineers.
              Master Medallion Architecture, Microsoft Fabric OneLake, Databricks Delta Lake, Apache Spark 4.0, Iceberg, and distributed system design.
            </p>
          </div>

          {/* Prominent Search Topics Bar */}
          <form onSubmit={handleHeroSubmit} className="pt-1 max-w-2xl">
            <div className="relative flex items-center">
              <Search size={16} className="absolute left-3.5 text-blue-500 pointer-events-none" />
              <input
                type="text"
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                placeholder="Ask any question or topic (e.g. data skew in Spark, delta lake ACID, direct lake)..."
                className="w-full pl-10 pr-28 py-2.5 sm:py-3 text-xs sm:text-sm bg-[var(--card)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 shadow-xs transition-all"
              />
              <button
                type="submit"
                className="absolute right-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1"
              >
                <span>Search</span>
                <ArrowRight size={12} />
              </button>
            </div>

            {/* Quick search suggestions */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-2 no-scrollbar text-xs">
              <span className="text-[11px] font-semibold text-[var(--muted-foreground)] whitespace-nowrap flex items-center gap-1">
                <Zap size={11} className="text-amber-400" /> Popular:
              </span>
              {HERO_SUGGESTIONS.map((sug) => (
                <button
                  type="button"
                  key={sug}
                  onClick={() => router.push(`/search-topics?q=${encodeURIComponent(sug)}`)}
                  className="px-2 py-0.5 text-[11px] rounded-md bg-[var(--surface-2)] border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors whitespace-nowrap"
                >
                  {sug}
                </button>
              ))}
            </div>
          </form>

          {/* High-Intent Motivational Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Link
              href="/search-topics"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-all"
            >
              <Search size={13} />
              <span>Search Topics</span>
              <span className="px-1.5 py-0.2 rounded bg-white/20 text-[9px] uppercase tracking-wider font-extrabold">New</span>
            </Link>

            <Link
              href="/guided-learning"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--border)] hover:border-blue-500/40 text-[var(--foreground)] text-xs font-semibold transition-all"
            >
              <Compass size={13} className="text-blue-500 dark:text-blue-400" />
              <span>Guided Learning Tracks</span>
            </Link>

            <Link
              href="/concepts"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--border)] hover:border-blue-500/40 text-[var(--foreground)] text-xs font-semibold transition-all"
            >
              <BookOpen size={13} className="text-emerald-500 dark:text-emerald-400" />
              <span>Concepts &amp; Mind Map</span>
            </Link>

            <Link
              href="/qa-prep"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--border)] hover:border-blue-500/40 text-[var(--foreground)] text-xs font-semibold transition-all"
            >
              <MessageSquare size={13} className="text-amber-500 dark:text-amber-400" />
              <span>Interview Q&amp;A Bank</span>
            </Link>

            <button
              type="button"
              onClick={openSearch}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--surface-2)]/80 hover:bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
              aria-label="Universal command palette (Cmd/Ctrl+K)"
            >
              <span>Command Palette</span>
              <KbdShortcut shortcutKey="k" className="hidden sm:inline-flex bg-[var(--surface-3)]" />
            </button>
          </div>

          {/* Proof of Value Metrics Badges */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 pt-3 border-t border-[var(--border)]/60 text-xs text-[var(--muted-foreground)]">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-500 dark:text-emerald-400" />
              <span><strong className="text-[var(--foreground)]">{formatContentCount(CONTENT_COUNTS.concepts)}</strong> Concepts</span>
            </div>
            <span className="hidden sm:inline text-[var(--border)]">•</span>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-500 dark:text-emerald-400" />
              <span><strong className="text-[var(--foreground)]">{formatContentCount(CONTENT_COUNTS.scenarios)}</strong> Scenarios</span>
            </div>
            <span className="hidden sm:inline text-[var(--border)]">•</span>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-500 dark:text-emerald-400" />
              <span><strong className="text-[var(--foreground)]">{formatContentCount(CONTENT_COUNTS.qa)}</strong> Q&amp;As</span>
            </div>
            <span className="hidden sm:inline text-[var(--border)]">•</span>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-500 dark:text-emerald-400" />
              <span><strong className="text-[var(--foreground)]">42</strong> Whiteboard Blueprints</span>
            </div>
            <span className="hidden sm:inline text-[var(--border)]">•</span>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-500 dark:text-emerald-400" />
              <span><strong className="text-[var(--foreground)]">156</strong> GCC Profiles</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
