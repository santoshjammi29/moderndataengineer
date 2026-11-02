"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { m, AnimatePresence } from "framer-motion";
import {
  FileCode2,
  Search,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  Lightbulb,
  Briefcase,
  Layers,
  BookOpen,
  MessageSquare,
  Shuffle,
  Terminal,
  Zap,
  Sparkles,
  Flame,
  ArrowRight,
  FileText,
  Code2,
  Table,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CodeSheetItem, CodeLevel, DatabricksSuiteData, Databricks100Concept } from "@/types/data";
import { PipelineExecutionFlow } from "@/components/code-practice/pipeline-execution-flow";
import { CodeBlock } from "@/components/ui/code-block";
import { SmoothAccordion } from "@/components/ui/smooth-accordion";
import { recordLastTopic } from "@/lib/user-progress";
import { TopicIcon } from "@/components/ui/topic-icon";
import { UnifiedSearchFilterBox } from "@/components/ui/unified-search-filter-box";
import { DatabricksCodingClient } from "@/app/code-practice/databricks/databricks-coding-client";
import {
  databricksCheatsheetData,
  databricks100Data,
  modernCodeMatrix,
  modernStackDb,
  pythonData,
} from "@/data";

type CodePracticeTab = "drills" | "databricks" | "matrix" | "runbooks";
type LanguageKey = "pyspark" | "sparksql" | "mssql" | "python";

const levelBadges: Record<CodeLevel, { bg: string; text: string; border: string }> = {
  beginner: { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/20" },
  intermediate: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  advanced: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
  architect: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
};

export interface CodePracticeClientProps {
  initialData: {
    pyspark: CodeSheetItem[];
    sparksql: CodeSheetItem[];
    mssql: CodeSheetItem[];
    python: CodeSheetItem[];
  };
  databricksData?: {
    suite: DatabricksSuiteData;
    operations: Databricks100Concept[];
  };
  initialDatabricksSuite?: DatabricksSuiteData;
  initialDatabricks100?: Databricks100Concept[];
}

export function CodePracticeClient({
  initialData,
  databricksData,
  initialDatabricksSuite,
  initialDatabricks100,
}: CodePracticeClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dbParam = searchParams.get("db")?.toLowerCase();
  const rawTabParam = searchParams.get("tab")?.toLowerCase();
  const tabParam = rawTabParam as CodePracticeTab | null;

  const [activeMainTab, setActiveMainTab] = useState<CodePracticeTab>("drills");
  const [activeLang, setActiveLang] = useState<LanguageKey>("pyspark");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [isShuffled, setIsShuffled] = useState(false);
  const [shuffleSeed, setShuffleSeed] = useState(0);

  // Polyglot Matrix state
  const [matrixSearch, setMatrixSearch] = useState("");
  const [matrixEngineFilter, setMatrixEngineFilter] = useState<
    "side_by_side" | "python" | "pyspark" | "duckdb" | "sparksql" | "snowflake" | "bigquery" | "trino" | "scala"
  >("side_by_side");

  // Python Runbooks state
  const [runbookSearch, setRunbookSearch] = useState("");
  const [runbookCategory, setRunbookCategory] = useState("all");

  const languageConfigs: Record<
    LanguageKey,
    { name: string; topicKey: string; data: CodeSheetItem[]; badgeColor: string }
  > = useMemo(
    () => ({
      pyspark: {
        name: "PySpark 3.4+ / 4.0",
        topicKey: "spark",
        data: initialData.pyspark,
        badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      },
      sparksql: {
        name: "Spark SQL & Unity",
        topicKey: "sql",
        data: initialData.sparksql,
        badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      },
      mssql: {
        name: "MS SQL / T-SQL",
        topicKey: "mssql",
        data: initialData.mssql,
        badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      },
      python: {
        name: "Python (Pandas & Polars)",
        topicKey: "python",
        data: initialData.python,
        badgeColor: "bg-green-500/10 text-green-400 border-green-500/20",
      },
    }),
    [initialData]
  );

  // Sync tab with URL search parameter (?tab= or ?db=)
  useEffect(() => {
    if (rawTabParam === "databricks" || dbParam === "databricks") {
      setActiveMainTab("databricks");
      return;
    }
    if (rawTabParam === "matrix") {
      setActiveMainTab("matrix");
      return;
    }
    if (rawTabParam === "runbooks" || rawTabParam === "python") {
      setActiveMainTab("runbooks");
      return;
    }
    if (rawTabParam === "drills") {
      setActiveMainTab("drills");
    }

    const validLangs: LanguageKey[] = ["pyspark", "sparksql", "mssql", "python"];
    if (dbParam && validLangs.includes(dbParam as LanguageKey)) {
      setActiveMainTab("drills");
      setActiveLang(dbParam as LanguageKey);
    }
  }, [rawTabParam, dbParam]);

  const handleMainTabChange = (tab: CodePracticeTab) => {
    setActiveMainTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    if (tab === "drills") {
      url.searchParams.set("db", activeLang);
    } else {
      url.searchParams.delete("db");
    }
    router.replace(url.toString(), { scroll: false });
  };

  const handleLangChange = (lang: LanguageKey) => {
    setActiveLang(lang);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", "drills");
    url.searchParams.set("db", lang);
    router.replace(url.toString(), { scroll: false });
  };

  const handleShuffle = () => {
    setIsShuffled(true);
    setShuffleSeed((s) => s + 1);
    toast.success(`Shuffled ${languageConfigs[activeLang].name} templates`);
  };

  const handleResetOrder = () => {
    setIsShuffled(false);
    toast.info("Reset to default order");
  };

  // Sync bookmarks from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("code_practice_bookmarks");
      if (stored) {
        setBookmarks(JSON.parse(stored));
      }
    } catch {
      // Ignore
    }
  }, []);

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarks((prev) => {
      const next = prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id];
      try {
        localStorage.setItem("code_practice_bookmarks", JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  const copyCode = (code: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Filtered drills
  const currentItems = languageConfigs[activeLang].data;
  const filteredDrills = useMemo(() => {
    let result = currentItems.filter((item) => {
      if (selectedLevel !== "ALL" && item.level !== selectedLevel) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDesc = item.description?.toLowerCase().includes(q);
        const matchesCode = item.code.toLowerCase().includes(q);
        const matchesUseCase = item.use_case?.toLowerCase().includes(q);
        return matchesTitle || matchesDesc || matchesCode || matchesUseCase;
      }
      return true;
    });

    if (isShuffled) {
      result = [...result];
      let mLen = result.length,
        t,
        i;
      let seed = (shuffleSeed + activeLang.charCodeAt(0)) * 9301 + 49297;
      const rnd = () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
      };
      while (mLen) {
        i = Math.floor(rnd() * mLen--);
        t = result[mLen];
        result[mLen] = result[i];
        result[i] = t;
      }
    }
    return result;
  }, [currentItems, selectedLevel, searchQuery, isShuffled, shuffleSeed, activeLang]);

  // Filtered Polyglot Code Matrix
  const filteredCodeMatrix = useMemo(() => {
    if (!matrixSearch.trim()) return modernCodeMatrix;
    const term = matrixSearch.toLowerCase();
    return modernCodeMatrix.filter(
      (m) =>
        m.topic.toLowerCase().includes(term) ||
        m.python.toLowerCase().includes(term) ||
        m.pyspark.toLowerCase().includes(term) ||
        m.duckdb.toLowerCase().includes(term) ||
        m.sparksql.toLowerCase().includes(term)
    );
  }, [matrixSearch]);

  // Combined Python Runbooks
  const combinedPythonRunbooks = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      category: string;
      level: string;
      description: string;
      code: string;
    }> = [];

    // From pythonData (CodeSheetItem)
    pythonData.forEach((item) => {
      list.push({
        id: item.id,
        title: item.title,
        category: item.category || "Data Engineering",
        level: item.level.toUpperCase(),
        description: item.description || item.use_case || "",
        code: item.code,
      });
    });

    // From modernStackDb (Python scenarios)
    modernStackDb.forEach((q) => {
      if (q.py_code) {
        list.push({
          id: q.id,
          title: q.question,
          category: q.category || "Modern Stack",
          level: q.difficulty,
          description: q.answer,
          code: q.py_code,
        });
      }
    });

    return list;
  }, []);

  const runbookCategories = useMemo(() => {
    const set = new Set<string>();
    combinedPythonRunbooks.forEach((r) => set.add(r.category));
    return ["all", ...Array.from(set)];
  }, [combinedPythonRunbooks]);

  const filteredRunbooks = useMemo(() => {
    return combinedPythonRunbooks.filter((r) => {
      if (runbookCategory !== "all" && r.category !== runbookCategory) return false;
      if (runbookSearch.trim()) {
        const q = runbookSearch.toLowerCase();
        return (
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.code.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [combinedPythonRunbooks, runbookCategory, runbookSearch]);

  // Databricks suite data fallback
  const resolvedDatabricksSuite =
    databricksData?.suite || initialDatabricksSuite || databricksCheatsheetData;
  const resolvedDatabricksOps =
    databricksData?.operations || initialDatabricks100 || databricks100Data;

  const totalDrillsCount =
    initialData.pyspark.length +
    initialData.sparksql.length +
    initialData.mssql.length +
    initialData.python.length;

  return (
    <div className="space-y-6 sm:space-y-8 pb-16 w-full max-w-7xl 2xl:max-w-[1800px] 3xl:max-w-[2200px] 4xl:max-w-none mx-auto px-2 sm:px-4 2xl:px-6">
      {/* ─── Hero Header ─── */}
      <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 via-cyan-950/30 to-[var(--surface-1)] border border-blue-500/20 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl 2xl:max-w-5xl 3xl:max-w-6xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400">
              <Code2 size={13} />
              <span>Unified Code Practice &amp; Runbooks Hub</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--foreground)] tracking-tight">
              Interactive Code Practice &amp; Production Runbooks
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
              Every data engineering coding resource in one roof: multi-engine practice drills (PySpark, SQL, Polars, T-SQL), Databricks 148+ operations &amp; memory triage, polyglot side-by-side translation matrix, and enterprise Python runbooks.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <div className="px-3 py-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-center">
              <div className="text-base font-bold text-blue-400 leading-none">{totalDrillsCount}</div>
              <div className="text-[10px] text-[var(--muted-foreground)] mt-0.5">Drills</div>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-center">
              <div className="text-base font-bold text-orange-400 leading-none">148+</div>
              <div className="text-[10px] text-[var(--muted-foreground)] mt-0.5">Databricks Ops</div>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-center">
              <div className="text-base font-bold text-purple-400 leading-none">{modernCodeMatrix.length}</div>
              <div className="text-[10px] text-[var(--muted-foreground)] mt-0.5">Polyglot Matrix</div>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-center">
              <div className="text-base font-bold text-emerald-400 leading-none">{combinedPythonRunbooks.length}</div>
              <div className="text-[10px] text-[var(--muted-foreground)] mt-0.5">Python Runbooks</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main Subtab Switcher ─── */}
      <div className="flex items-center gap-1.5 p-1 rounded-full bg-[var(--surface-2)] border border-[var(--border)] overflow-x-auto scrollbar-none max-w-fit shadow-xs">
        {[
          { id: "drills", label: `Interactive Drills (${totalDrillsCount})`, icon: Code2 },
          { id: "databricks", label: "Databricks Coding Hub (148+)", icon: Flame },
          { id: "matrix", label: `Polyglot Translation Matrix (${modernCodeMatrix.length})`, icon: Table },
          { id: "runbooks", label: `Python & Lakehouse Runbooks (${combinedPythonRunbooks.length})`, icon: Terminal },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeMainTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleMainTabChange(tab.id as CodePracticeTab)}
              className={cn(
                "flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer",
                isSelected
                  ? "bg-blue-600 text-white shadow-xs font-semibold"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              )}
            >
              <Icon size={13} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. INTERACTIVE DRILLS TAB */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeMainTab === "drills" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Pipeline Execution Flow Diagram */}
          <div className="p-3 sm:p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)]">
            <PipelineExecutionFlow />
          </div>

          {/* Engine Selector Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {(Object.keys(languageConfigs) as LanguageKey[]).map((key) => {
              const cfg = languageConfigs[key];
              const isSelected = activeLang === key;
              return (
                <button
                  key={key}
                  onClick={() => handleLangChange(key)}
                  className={cn(
                    "p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between",
                    isSelected
                      ? "bg-blue-600/15 border-blue-500 shadow-sm ring-1 ring-blue-500/50"
                      : "bg-[var(--surface-1)] border-[var(--border)] hover:border-blue-500/40 hover:bg-[var(--surface-2)]"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <TopicIcon topic={cfg.topicKey} size={18} />
                    <span className="text-[10px] font-mono text-[var(--muted-foreground)]">
                      {cfg.data.length} Drills
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="text-xs font-bold text-[var(--foreground)] leading-tight">{cfg.name}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border)]">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
              <input
                type="text"
                placeholder={`Search ${languageConfigs[activeLang].name} by keyword, function, or scenario...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {["ALL", "beginner", "intermediate", "advanced", "architect"].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={cn(
                    "px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer uppercase",
                    selectedLevel === lvl
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-[var(--surface-2)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  )}
                >
                  {lvl}
                </button>
              ))}

              <button
                onClick={handleShuffle}
                className="p-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                title="Shuffle Order"
              >
                <Shuffle size={14} />
              </button>
            </div>
          </div>

          {/* Drills List */}
          {filteredDrills.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-[var(--surface-1)] border border-[var(--border)]">
              <p className="text-sm font-semibold text-[var(--foreground)]">No drills match your filter criteria.</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">Try another keyword or difficulty level.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDrills.map((item) => {
                const isExpanded = expandedIds.has(item.id);
                const isBookmarked = bookmarks.includes(item.id);
                const lvlBadge = levelBadges[item.level] || levelBadges.intermediate;

                return (
                  <div
                    key={item.id}
                    id={`drill-${item.id}`}
                    className={cn(
                      "rounded-xl border transition-all duration-200 overflow-hidden bg-[var(--surface-1)] scroll-mt-20",
                      isExpanded ? "border-blue-500/40 shadow-xs" : "border-[var(--border)] hover:border-blue-500/30"
                    )}
                  >
                    <div
                      onClick={() => toggleExpand(item.id)}
                      className="p-3.5 sm:p-4 cursor-pointer flex flex-col space-y-2 select-none"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-mono text-[var(--muted-foreground)]">ID: {item.id}</span>
                            <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase", lvlBadge.bg, lvlBadge.text, lvlBadge.border)}>
                              {item.level}
                            </span>
                          </div>
                          <h3 className="text-sm sm:text-base font-bold text-[var(--foreground)] tracking-tight leading-snug">
                            {item.title}
                          </h3>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={(e) => toggleBookmark(item.id, e)}
                            className={cn(
                              "p-1.5 rounded-lg transition-colors cursor-pointer",
                              isBookmarked ? "text-amber-400 bg-amber-400/10" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                            )}
                            title={isBookmarked ? "Remove Bookmark" : "Save Bookmark"}
                          >
                            {isBookmarked ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
                          </button>
                          <button
                            onClick={(e) => copyCode(item.code, item.id, e)}
                            className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                            title="Copy Code"
                          >
                            {copiedId === item.id ? <Check size={15} className="text-green-400" /> : <Copy size={15} />}
                          </button>
                          <div className="p-1.5 text-[var(--muted-foreground)]">
                            <ChevronDown
                              size={15}
                              className={cn("transition-transform duration-300", isExpanded && "rotate-180 text-blue-400")}
                            />
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <SmoothAccordion isOpen={isExpanded} innerClassName="px-3.5 pb-3.5 pt-2 space-y-2.5 text-xs sm:text-sm bg-[var(--surface-2)]/30">
                      {item.use_case && (
                        <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[var(--foreground)] flex items-start gap-2">
                          <Briefcase size={14} className="text-blue-400 mt-0.5 shrink-0" />
                          <div className="space-y-0.5 min-w-0">
                            <span className="font-bold text-[10px] uppercase tracking-wider text-blue-400">
                              Enterprise Scenario:
                            </span>
                            <p className="text-xs text-[var(--foreground)]/90 leading-relaxed">{item.use_case}</p>
                          </div>
                        </div>
                      )}

                      <CodeBlock
                        code={item.code}
                        language={activeLang}
                        filename={`${item.id}.${activeLang === "sparksql" || activeLang === "mssql" ? "sql" : "py"}`}
                        badge={languageConfigs[activeLang].name}
                      />

                      {item.notes && item.notes.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-[var(--border)]">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)] flex items-center gap-1.5">
                            <Lightbulb size={14} className="text-amber-400" />
                            Architectural Tuning Notes:
                          </h4>
                          <ul className="space-y-1 text-xs text-[var(--muted-foreground)]">
                            {item.notes.map((note, ni) => (
                              <li key={ni} className="flex items-start gap-2">
                                <span className="text-amber-400 font-bold shrink-0">•</span>
                                <span className="leading-snug">{note}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </SmoothAccordion>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. DATABRICKS CODING HUB TAB */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeMainTab === "databricks" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <DatabricksCodingClient
            suiteData={resolvedDatabricksSuite}
            operationsData={resolvedDatabricksOps}
          />
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 3. POLYGLOT TRANSLATION MATRIX TAB (MOVED FROM MODERN-STACK) */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeMainTab === "matrix" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)]">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                <Table size={16} className="text-purple-400" />
                Polyglot Engine Translation Matrix ({filteredCodeMatrix.length} Patterns)
              </h3>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                Compare side-by-side implementations across PySpark, SQL, DuckDB, Polars, and Snowflake.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
              <input
                type="text"
                placeholder="Search patterns (e.g. time travel, cdc, join)..."
                value={matrixSearch}
                onChange={(e) => setMatrixSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-blue-500/50"
              />
            </div>
          </div>

          {/* Engine Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none p-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
            {[
              { id: "side_by_side", label: "Side-by-Side (3-Engine)" },
              { id: "python", label: "Polars (Python)" },
              { id: "pyspark", label: "PySpark" },
              { id: "duckdb", label: "DuckDB" },
              { id: "sparksql", label: "Spark SQL" },
              { id: "snowflake", label: "Snowflake" },
              { id: "bigquery", label: "BigQuery" },
              { id: "trino", label: "Trino" },
              { id: "scala", label: "Scala Spark" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setMatrixEngineFilter(tab.id as typeof matrixEngineFilter)}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer",
                  matrixEngineFilter === tab.id
                    ? "bg-blue-600 text-white shadow-xs font-semibold"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-1)]"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Matrix Cards */}
          <div className="space-y-3">
            {filteredCodeMatrix.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 sm:p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-bold text-[var(--foreground)] flex items-center gap-1.5">
                    <Sparkles size={14} className="text-purple-400" />
                    <span>{idx + 1}. {item.topic}</span>
                  </h4>
                  <span className="text-[10px] font-mono text-[var(--muted-foreground)]">
                    Pattern #{idx + 1}
                  </span>
                </div>

                {matrixEngineFilter === "side_by_side" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    <CodeBlock
                      code={item.python}
                      language="python"
                      filename="Python (Polars)"
                      badge="Polars"
                      showLineNumbers={false}
                    />
                    <CodeBlock
                      code={item.pyspark}
                      language="python"
                      filename="PySpark DataFrame"
                      badge="PySpark"
                      showLineNumbers={false}
                    />
                    <CodeBlock
                      code={item.duckdb}
                      language="sql"
                      filename="DuckDB SQL"
                      badge="DuckDB"
                      showLineNumbers={false}
                    />
                  </div>
                ) : (
                  <div>
                    <CodeBlock
                      code={
                        matrixEngineFilter === "python"
                          ? item.python
                          : matrixEngineFilter === "pyspark"
                          ? item.pyspark
                          : matrixEngineFilter === "duckdb"
                          ? item.duckdb
                          : matrixEngineFilter === "sparksql"
                          ? item.sparksql
                          : matrixEngineFilter === "snowflake"
                          ? item.snowflake
                          : matrixEngineFilter === "bigquery"
                          ? item.bigquery
                          : matrixEngineFilter === "trino"
                          ? item.trino
                          : item.scala
                      }
                      language={
                        matrixEngineFilter === "python" || matrixEngineFilter === "pyspark"
                          ? "python"
                          : matrixEngineFilter === "scala"
                          ? "scala"
                          : "sql"
                      }
                      filename={`${item.topic.toLowerCase().replace(/\s+/g, "_")}.${matrixEngineFilter}`}
                      badge={matrixEngineFilter.toUpperCase()}
                      showLineNumbers={false}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 4. PYTHON & LAKEHOUSE RUNBOOKS TAB (MOVED FROM MODERN-STACK & ARCHITECTURE) */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeMainTab === "runbooks" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)]">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                <Terminal size={16} className="text-emerald-400" />
                Python Lakehouse &amp; Architecture Runbooks ({filteredRunbooks.length})
              </h3>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                Full-code production Python scripts covering Delta Lake, Iceberg REST, CDC streaming, and data pipelines.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
              <input
                type="text"
                placeholder="Search Python runbooks..."
                value={runbookSearch}
                onChange={(e) => setRunbookSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-blue-500/50"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none p-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
            {runbookCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setRunbookCategory(cat)}
                className={cn(
                  "px-3 py-1 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer",
                  runbookCategory === cat
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-1)]"
                )}
              >
                {cat === "all" ? "All Categories" : cat}
              </button>
            ))}
          </div>

          {/* Runbook Cards */}
          <div className="grid grid-cols-1 2xl:grid-cols-2 gap-3">
            {filteredRunbooks.map((rb) => (
              <div
                key={rb.id}
                className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-[var(--muted-foreground)]">ID: {rb.id}</span>
                      <span className="text-[10px] font-semibold text-purple-400 uppercase">{rb.category}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {rb.level}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-[var(--foreground)]">{rb.title}</h4>
                  </div>
                </div>

                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                  {rb.description}
                </p>

                <CodeBlock
                  code={rb.code}
                  language="python"
                  filename={`${rb.id}.py`}
                  badge="Python 3.11+"
                  showLineNumbers={true}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
