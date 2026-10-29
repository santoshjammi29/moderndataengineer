"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Cpu,
  Database,
  Workflow,
  Cloud,
  Zap,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Circle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Maximize2,
  Download,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  BookOpen,
  MessageSquare,
  Compass,
  Code2,
  Check,
  Share2,
  Bookmark,
  BookmarkCheck,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  FolderGit2,
  LayoutGrid,
  List,
  AlertTriangle,
  Users,
  Wrench,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  WHITEBOARD_CATEGORIES,
  TOTAL_WHITEBOARDS_COUNT,
  type WhiteboardCategoryData,
} from "@/data/whiteboards-learning-data";
import { type ArchitectureDiagramItem } from "@/data/diagrams";
import { useDiagramTheme } from "@/lib/diagram-theme";
import { WhiteboardThemeToggle } from "@/components/architecture/whiteboard-theme-toggle";

const ICON_MAP: Record<string, React.ElementType> = {
  Cpu,
  Database,
  Workflow,
  Cloud,
  Zap,
  Layers,
  ShieldCheck,
};

type ViewMode = "master" | "diagrams" | "concepts" | "blueprints" | "qa";
type DifficultyLevel = "ALL" | "EASY" | "MEDIUM" | "HARD" | "ARCHITECT";

export function WhiteboardsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Category Selection
  const initialCatId = searchParams.get("category") || WHITEBOARD_CATEGORIES[0].id;
  const [selectedCatId, setSelectedCatId] = useState<string>(initialCatId);

  // Pillar Modality Tab
  const initialTab = (searchParams.get("tab") as ViewMode) || "master";
  const [activeTab, setActiveTab] = useState<ViewMode>(initialTab);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyLevel>("ALL");
  const [isCompact, setIsCompact] = useState(false);

  // Lightbox Modal for Full Resolution Blueprint Inspection
  const [activeDiagram, setActiveDiagram] = useState<ArchitectureDiagramItem | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [theme] = useDiagramTheme();
  const isDark = theme === "dark";
  const [modalTab, setModalTab] = useState<"architecture" | "personas" | "triage" | "governance">("architecture");
  const [activePersona, setActivePersona] = useState<"architect" | "seniorDe" | "dataEngineer" | "steward" | "businessAnalyst">("architect");

  // Mastery Tracking (persisted in localStorage)
  const [masteredCategories, setMasteredCategories] = useState<string[]>([]);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  // Sync state from URL params
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat && WHITEBOARD_CATEGORIES.some((c) => c.id === cat)) {
      setSelectedCatId(cat);
    }
    const tab = searchParams.get("tab") as ViewMode;
    if (tab && ["master", "diagrams", "concepts", "blueprints", "qa"].includes(tab)) {
      setActiveTab(tab);
    }
    const diagramParam = searchParams.get("diagram");
    if (diagramParam) {
      for (const category of WHITEBOARD_CATEGORIES) {
        const found = category.diagrams.find((d) => d.id === diagramParam);
        if (found) {
          setSelectedCatId(category.id);
          setActiveTab("diagrams");
          setActiveDiagram(found);
          break;
        }
      }
    }
  }, [searchParams]);

  // Load mastered state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("whiteboard-mastered-categories");
      if (saved) {
        setMasteredCategories(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  // Update URL params when category or tab changes
  const updateUrl = useCallback(
    (newCatId: string, newTab: ViewMode, diagramId?: string) => {
      const params = new URLSearchParams(window.location.search);
      params.set("category", newCatId);
      params.set("tab", newTab);
      if (diagramId) {
        params.set("diagram", diagramId);
      } else {
        params.delete("diagram");
      }
      router.replace(`/whiteboards?${params.toString()}`, { scroll: false });
    },
    [router]
  );

  const handleSelectCategory = (catId: string) => {
    setSelectedCatId(catId);
    updateUrl(catId, activeTab);
  };

  const handleSelectTab = (tab: ViewMode) => {
    setActiveTab(tab);
    updateUrl(selectedCatId, tab);
  };

  const toggleMastered = (catId: string) => {
    setMasteredCategories((prev) => {
      const isAlready = prev.includes(catId);
      const next = isAlready ? prev.filter((id) => id !== catId) : [...prev, catId];
      try {
        localStorage.setItem("whiteboard-mastered-categories", JSON.stringify(next));
      } catch {
        // ignore
      }
      if (!isAlready) {
        toast.success("Category marked as Mastered! 🎉");
      } else {
        toast.info("Category marked as In Progress");
      }
      return next;
    });
  };

  // Keyboard navigation for Lightbox (Esc to close, +/- zoom)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveDiagram(null);
        setZoomLevel(1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Active Category Data
  const currentCategory = useMemo(() => {
    return WHITEBOARD_CATEGORIES.find((c) => c.id === selectedCatId) || WHITEBOARD_CATEGORIES[0];
  }, [selectedCatId]);

  const currentIndex = useMemo(() => {
    return WHITEBOARD_CATEGORIES.findIndex((c) => c.id === currentCategory.id);
  }, [currentCategory.id]);

  const prevCategory = useMemo(() => {
    const idx = (currentIndex - 1 + WHITEBOARD_CATEGORIES.length) % WHITEBOARD_CATEGORIES.length;
    return WHITEBOARD_CATEGORIES[idx];
  }, [currentIndex]);

  const nextCategory = useMemo(() => {
    const idx = (currentIndex + 1) % WHITEBOARD_CATEGORIES.length;
    return WHITEBOARD_CATEGORIES[idx];
  }, [currentIndex]);

  // Filtered Items within the current category
  const query = searchQuery.trim().toLowerCase();

  const filteredDiagrams = useMemo(() => {
    if (!query) return currentCategory.diagrams;
    return currentCategory.diagrams.filter((d) => {
      return (
        d.title.toLowerCase().includes(query) ||
        d.subtitle.toLowerCase().includes(query) ||
        d.description.toLowerCase().includes(query) ||
        d.tags.some((t) => t.toLowerCase().includes(query)) ||
        d.keyPoints.some((p) => p.toLowerCase().includes(query))
      );
    });
  }, [currentCategory.diagrams, query]);

  const filteredConcepts = useMemo(() => {
    return currentCategory.concepts.filter((c) => {
      const matchDiff = difficultyFilter === "ALL" || c.difficulty === difficultyFilter;
      if (!matchDiff) return false;
      if (!query) return true;
      return (
        c.term.toLowerCase().includes(query) ||
        c.definition.toLowerCase().includes(query) ||
        (c.explanation && c.explanation.toLowerCase().includes(query)) ||
        (c.keyPoints && c.keyPoints.some((kp) => kp.toLowerCase().includes(query)))
      );
    });
  }, [currentCategory.concepts, difficultyFilter, query]);

  const filteredQuestions = useMemo(() => {
    return currentCategory.questions.filter((q) => {
      const matchDiff = difficultyFilter === "ALL" || q.difficulty === difficultyFilter;
      if (!matchDiff) return false;
      if (!query) return true;
      return (
        q.question.toLowerCase().includes(query) ||
        q.answer.toLowerCase().includes(query) ||
        (q.niche && q.niche.toLowerCase().includes(query)) ||
        (q.category && q.category.toLowerCase().includes(query))
      );
    });
  }, [currentCategory.questions, difficultyFilter, query]);

  const filteredBlueprints = useMemo(() => {
    if (!query) return currentCategory.blueprints;
    return currentCategory.blueprints.filter((b) => {
      return (
        b.title.toLowerCase().includes(query) ||
        b.category.toLowerCase().includes(query) ||
        b.tags.some((t) => t.toLowerCase().includes(query)) ||
        (b.costEstimate && b.costEstimate.toLowerCase().includes(query))
      );
    });
  }, [currentCategory.blueprints, query]);

  const filteredScenarios = useMemo(() => {
    if (!query) return currentCategory.scenarios;
    return currentCategory.scenarios.filter((s) => {
      return (
        s.question.toLowerCase().includes(query) ||
        s.answer.toLowerCase().includes(query) ||
        (s.niche && s.niche.toLowerCase().includes(query))
      );
    });
  }, [currentCategory.scenarios, query]);

  const toggleCardExpanded = (id: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleDownload = (diagram: ArchitectureDiagramItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const link = document.createElement("a");
    link.href = diagram.image;
    link.download = `${diagram.id}.webp`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Downloading ${diagram.title}`);
  };

  const handleCopy = (text: string, label: string = "Content") => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const isCurrentMastered = masteredCategories.includes(currentCategory.id);
  const percentComplete = Math.round((masteredCategories.length / WHITEBOARD_CATEGORIES.length) * 100);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-20">
      {/* ── TOP HERO COMMAND CENTER ────────────────────────────────────────── */}
      <section className="relative border-b border-[var(--border)] bg-[var(--surface-1)] pt-8 pb-10 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-6 relative z-10">
          {/* Badge & Breadcrumb */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20">
                <Sparkles size={13} className="text-purple-500" />
                42 Master Whiteboard Blueprints
              </span>
              <span className="text-xs text-[var(--muted-foreground)] hidden sm:inline">•</span>
              <span className="text-xs text-[var(--muted-foreground)] hidden sm:inline">
                7 Core Architectural Pillars
              </span>
            </div>

            {/* Quick Global Progress Pill */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[var(--surface-2)] border border-[var(--border)] text-xs">
              <span className="text-[var(--muted-foreground)]">Curriculum Progress:</span>
              <div className="w-20 sm:w-28 h-2 rounded-full bg-[var(--surface-3)] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${percentComplete}%` }}
                />
              </div>
              <span className="font-mono font-bold text-[var(--foreground)]">
                {masteredCategories.length}/{WHITEBOARD_CATEGORIES.length}
              </span>
            </div>
          </div>

          {/* Main Title & Editorial Pitch */}
          <div className="max-w-3xl space-y-2">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[var(--foreground)]">
              Architecture Whiteboards Mastery Hub
            </h1>
            <p className="text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
              Learn enterprise data platform design category by category. Each pillar unifies
              high-resolution hand-drawn digital blueprints, core concepts, interview Q&amp;A, and production system topologies
              into a structured architectural curriculum.
            </p>
          </div>

          {/* High-Level Metrics Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]">
              <div className="text-[11px] font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                Digital Whiteboards
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-[var(--foreground)] mt-0.5">
                {TOTAL_WHITEBOARDS_COUNT}
              </div>
              <div className="text-[11px] text-purple-600 dark:text-purple-400 mt-0.5">
                Hand-drawn vector blueprints
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]">
              <div className="text-[11px] font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                Core Concepts
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-[var(--foreground)] mt-0.5">
                168+
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                Definitions &amp; mechanisms
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]">
              <div className="text-[11px] font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                Architect Drills
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-[var(--foreground)] mt-0.5">
                210+
              </div>
              <div className="text-[11px] text-blue-600 dark:text-blue-400 mt-0.5">
                Real-world Q&amp;A scenarios
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]">
              <div className="text-[11px] font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                System Designs
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-[var(--foreground)] mt-0.5">
                53
              </div>
              <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">
                Mermaid flows &amp; topologies
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STICKY CATEGORY NAVIGATION DECK ───────────────────────────────── */}
      <section className="sticky top-0 z-30 bg-[var(--background)]/90 backdrop-blur-md border-b border-[var(--border)] py-3 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Scrollable Categories List */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {WHITEBOARD_CATEGORIES.map((cat, idx) => {
              const Icon = ICON_MAP[cat.icon] || Cpu;
              const isSelected = cat.id === selectedCatId;
              const isMastered = masteredCategories.includes(cat.id);

              return (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat.id)}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 border cursor-pointer shrink-0 select-none",
                    isSelected
                      ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20"
                      : "bg-[var(--surface-2)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--surface-3)]"
                  )}
                >
                  <Icon size={14} className={isSelected ? "text-white" : "text-purple-400"} />
                  <span>{cat.shortTitle}</span>
                  <span
                    className={cn(
                      "px-1.5 py-0.2 rounded text-[10px] font-mono",
                      isSelected ? "bg-white/20 text-white" : "bg-[var(--surface-3)] text-[var(--muted-foreground)]"
                    )}
                  >
                    {cat.diagrams.length}
                  </span>
                  {isMastered && (
                    <CheckCircle2
                      size={12}
                      className={isSelected ? "text-emerald-300" : "text-emerald-500"}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Search & Stepper Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Search Input */}
            <div className="relative flex-1 md:w-56">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter current category..."
                className="w-full pl-8 pr-7 py-1.5 rounded-lg text-xs bg-[var(--surface-2)] border border-[var(--border)] focus:outline-none focus:border-purple-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Stepper buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleSelectCategory(prevCategory.id)}
                className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors cursor-pointer"
                title={`Previous Category: ${prevCategory.shortTitle}`}
              >
                <ArrowLeft size={14} />
              </button>
              <button
                onClick={() => handleSelectCategory(nextCategory.id)}
                className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors cursor-pointer"
                title={`Next Category: ${nextCategory.shortTitle}`}
              >
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── ACTIVE CATEGORY CONTENT CONTAINER ─────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Category Header Milestone Card */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-5 sm:p-7 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20">
                  Category {currentIndex + 1} of {WHITEBOARD_CATEGORIES.length}
                </span>
                <span className="text-xs font-medium text-[var(--muted-foreground)]">
                  {currentCategory.diagramCategory}
                </span>
              </div>

              <h2 className="text-xl sm:text-3xl font-extrabold text-[var(--foreground)]">
                {currentCategory.title}
              </h2>

              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                {currentCategory.tagline}
              </p>

              <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
                {currentCategory.overview}
              </p>
            </div>

            {/* Category Actions */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
              <button
                onClick={() => toggleMastered(currentCategory.id)}
                className={cn(
                  "flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border",
                  isCurrentMastered
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25"
                    : "bg-[var(--surface-2)] text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--surface-3)]"
                )}
              >
                <CheckCircle2 size={16} className={isCurrentMastered ? "text-emerald-500" : "text-[var(--muted-foreground)]"} />
                <span>{isCurrentMastered ? "Category Mastered" : "Mark as Mastered"}</span>
              </button>

              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--muted-foreground)]">
                <span>Diagram Theme:</span>
                <WhiteboardThemeToggle size="xs" showLabel={false} />
              </div>
            </div>
          </div>

          {/* Learning Milestones Checklist */}
          <div className="mt-5 pt-5 border-t border-[var(--border)]">
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-2.5">
              Core Architectural Milestones for this Category:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {currentCategory.learningMilestones.map((milestone, mIdx) => (
                <div
                  key={mIdx}
                  className="flex items-start gap-2 p-2.5 rounded-lg bg-[var(--surface-2)] text-xs text-[var(--foreground)] border border-[var(--border)]/60"
                >
                  <Check size={14} className="text-purple-500 shrink-0 mt-0.5" />
                  <span className="leading-snug">{milestone}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 4-PILLAR MODALITY TABS (Executive View Switcher) ──────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => handleSelectTab("master")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                activeTab === "master"
                  ? "bg-purple-600 text-white"
                  : "bg-[var(--surface-2)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              )}
            >
              <Compass size={14} />
              <span>360° Master Overview</span>
            </button>

            <button
              onClick={() => handleSelectTab("diagrams")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                activeTab === "diagrams"
                  ? "bg-purple-600 text-white"
                  : "bg-[var(--surface-2)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              )}
            >
              <Maximize2 size={14} />
              <span>Whiteboard Diagrams</span>
              <span className="font-mono text-[10px] px-1 rounded bg-black/20 text-current">
                {currentCategory.diagrams.length}
              </span>
            </button>

            <button
              onClick={() => handleSelectTab("concepts")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                activeTab === "concepts"
                  ? "bg-purple-600 text-white"
                  : "bg-[var(--surface-2)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              )}
            >
              <BookOpen size={14} />
              <span>Core Concepts</span>
              <span className="font-mono text-[10px] px-1 rounded bg-black/20 text-current">
                {currentCategory.concepts.length}
              </span>
            </button>

            <button
              onClick={() => handleSelectTab("blueprints")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                activeTab === "blueprints"
                  ? "bg-purple-600 text-white"
                  : "bg-[var(--surface-2)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              )}
            >
              <Layers size={14} />
              <span>System Blueprints</span>
              <span className="font-mono text-[10px] px-1 rounded bg-black/20 text-current">
                {currentCategory.blueprints.length + currentCategory.scenarios.length}
              </span>
            </button>

            <button
              onClick={() => handleSelectTab("qa")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                activeTab === "qa"
                  ? "bg-purple-600 text-white"
                  : "bg-[var(--surface-2)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              )}
            >
              <MessageSquare size={14} />
              <span>Technical Q&amp;A</span>
              <span className="font-mono text-[10px] px-1 rounded bg-black/20 text-current">
                {currentCategory.questions.length}
              </span>
            </button>
          </div>

          {/* Density & Difficulty Filter */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {(activeTab === "concepts" || activeTab === "qa") && (
              <div className="flex items-center gap-1 bg-[var(--surface-2)] p-0.5 rounded-lg border border-[var(--border)] text-[11px]">
                {(["ALL", "EASY", "MEDIUM", "HARD", "ARCHITECT"] as DifficultyLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setDifficultyFilter(lvl)}
                    className={cn(
                      "px-2 py-0.5 rounded font-medium transition-colors cursor-pointer",
                      difficultyFilter === lvl
                        ? "bg-purple-600 text-white"
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    )}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => setIsCompact(!isCompact)}
              className={cn(
                "p-1.5 rounded-lg border border-[var(--border)] transition-colors cursor-pointer",
                isCompact
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-[var(--surface-2)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              )}
              title={isCompact ? "Switch to detailed cards" : "Switch to compact view"}
            >
              {isCompact ? <List size={14} /> : <LayoutGrid size={14} />}
            </button>
          </div>
        </div>

        {/* ── TAB 1: 360° MASTER OVERVIEW ────────────────────────────────────── */}
        {activeTab === "master" && (
          <div className="space-y-8">
            {/* Featured Whiteboard of the Category */}
            {currentCategory.diagrams.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-purple-500" />
                    <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
                      Featured Whiteboard Blueprint
                    </h3>
                  </div>
                  <button
                    onClick={() => handleSelectTab("diagrams")}
                    className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View all {currentCategory.diagrams.length} blueprints</span>
                    <ArrowRight size={12} />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-4 sm:p-6">
                  {/* Blueprint Image Preview */}
                  <div
                    onClick={() => setActiveDiagram(currentCategory.diagrams[0])}
                    className={cn(
                      "lg:col-span-7 relative aspect-[16/10] rounded-xl overflow-hidden border border-[var(--border)] cursor-pointer group flex items-center justify-center p-3 select-none transition-colors",
                      isDark ? "whiteboard-container-dark" : "whiteboard-container-light"
                    )}
                  >
                    <Image
                      src={currentCategory.diagrams[0].image}
                      alt={currentCategory.diagrams[0].title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className={cn(
                        "object-contain p-2 transition-transform duration-300 group-hover:scale-[1.02]",
                        isDark && "whiteboard-image-dark"
                      )}
                      priority
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <span className="px-3 py-1.5 rounded-lg bg-black/75 text-white text-xs font-semibold backdrop-blur-sm flex items-center gap-1.5 shadow-lg">
                        <Maximize2 size={13} />
                        Inspect in High-Res Lightbox
                      </span>
                    </div>
                  </div>

                  {/* Blueprint Highlights & Points */}
                  <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20">
                        {currentCategory.diagrams[0].category}
                      </span>
                      <h4 className="text-base sm:text-xl font-bold text-[var(--foreground)]">
                        {currentCategory.diagrams[0].title}
                      </h4>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {currentCategory.diagrams[0].subtitle}
                      </p>
                      <p className="text-xs text-[var(--foreground)] leading-relaxed pt-1">
                        {currentCategory.diagrams[0].description}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
                        Architectural Takeaways:
                      </div>
                      <ul className="space-y-1 text-xs text-[var(--foreground)]">
                        {currentCategory.diagrams[0].keyPoints.slice(0, 3).map((kp, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-purple-500 font-bold">•</span>
                            <span className="leading-tight">{kp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => setActiveDiagram(currentCategory.diagrams[0])}
                        className="flex-1 py-2 px-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Maximize2 size={13} />
                        <span>Inspect Blueprint</span>
                      </button>
                      <button
                        onClick={(e) => handleDownload(currentCategory.diagrams[0], e)}
                        className="p-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                        title="Download WebP Diagram"
                      >
                        <Download size={14} />
                      </button>
                      {currentCategory.diagrams[0].docLink && (
                        <a
                          href={currentCategory.diagrams[0].docLink}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                          title="Official Documentation"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tri-Pillar Previews: Concepts, System Blueprints & Q&A */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Top Concepts */}
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-emerald-500" />
                    <h4 className="text-sm font-bold text-[var(--foreground)]">Core Concepts</h4>
                  </div>
                  <button
                    onClick={() => handleSelectTab("concepts")}
                    className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-semibold"
                  >
                    All {currentCategory.concepts.length} →
                  </button>
                </div>

                <div className="space-y-3">
                  {currentCategory.concepts.slice(0, 3).map((concept) => (
                    <div
                      key={concept.id}
                      className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs text-[var(--foreground)]">
                          {concept.term}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                          {concept.difficulty}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--muted-foreground)] line-clamp-2 leading-relaxed">
                        {concept.definition}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top System Blueprints */}
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                  <div className="flex items-center gap-2">
                    <Layers size={16} className="text-blue-500" />
                    <h4 className="text-sm font-bold text-[var(--foreground)]">System Designs</h4>
                  </div>
                  <button
                    onClick={() => handleSelectTab("blueprints")}
                    className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-semibold"
                  >
                    All {currentCategory.blueprints.length + currentCategory.scenarios.length} →
                  </button>
                </div>

                <div className="space-y-3">
                  {currentCategory.blueprints.slice(0, 2).map((bp) => (
                    <div
                      key={bp.id}
                      className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h5 className="font-bold text-xs text-[var(--foreground)] line-clamp-1">
                          {bp.title}
                        </h5>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold shrink-0">
                          Blueprint
                        </span>
                      </div>
                      {bp.costEstimate && (
                        <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                          💰 {bp.costEstimate}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {bp.tags.slice(0, 3).map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[var(--surface-3)] text-[var(--muted-foreground)]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Technical Q&A */}
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={16} className="text-amber-500" />
                    <h4 className="text-sm font-bold text-[var(--foreground)]">Interview Drills</h4>
                  </div>
                  <button
                    onClick={() => handleSelectTab("qa")}
                    className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-semibold"
                  >
                    All {currentCategory.questions.length} →
                  </button>
                </div>

                <div className="space-y-3">
                  {currentCategory.questions.slice(0, 3).map((q) => (
                    <div
                      key={q.id}
                      className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono uppercase text-purple-600 dark:text-purple-400 font-bold truncate">
                          {q.niche || q.category}
                        </span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                          {q.difficulty}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[var(--foreground)] line-clamp-2">
                        {q.question}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: WHITEBOARD DIAGRAMS ────────────────────────────────────── */}
        {activeTab === "diagrams" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold text-[var(--foreground)]">
                Showing {filteredDiagrams.length} Whiteboard Blueprints for {currentCategory.shortTitle}
              </h3>
              <div className="text-xs text-[var(--muted-foreground)]">
                Click any blueprint to inspect with zoom &amp; dark mode
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDiagrams.map((diagram) => (
                <div
                  key={diagram.id}
                  id={`diagram-${diagram.id}`}
                  onClick={() => setActiveDiagram(diagram)}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] hover:border-purple-500/40 transition-all duration-200 overflow-hidden flex flex-col group cursor-pointer shadow-sm hover:shadow-lg hover:shadow-purple-500/5"
                >
                  {/* Canvas Container */}
                  <div
                    className={cn(
                      "relative aspect-[16/10] w-full overflow-hidden border-b border-[var(--border)] flex items-center justify-center p-3 select-none transition-colors",
                      isDark ? "whiteboard-container-dark" : "whiteboard-container-light"
                    )}
                  >
                    <Image
                      src={diagram.image}
                      alt={diagram.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className={cn(
                        "object-contain p-2 transition-transform duration-300 group-hover:scale-105",
                        isDark && "whiteboard-image-dark"
                      )}
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <span className="px-3 py-1.5 rounded-lg bg-black/80 text-white text-xs font-semibold backdrop-blur-sm flex items-center gap-1.5 shadow-md">
                        <Maximize2 size={13} />
                        Inspect Blueprint
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 flex flex-col justify-between flex-1 space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                          {diagram.category}
                        </span>
                        {diagram.personaBreakdown && (
                          <span className="text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20">
                            5 Roles
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-[var(--foreground)] group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-1">
                        {diagram.title}
                      </h4>
                      <p className="text-xs text-[var(--muted-foreground)] line-clamp-2">
                        {diagram.subtitle}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-[var(--border)]">
                      <div className="flex flex-wrap gap-1">
                        {diagram.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface-2)] text-[var(--muted-foreground)]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-xs text-purple-600 dark:text-purple-400 font-semibold pt-1">
                        <span>Inspect in Lightbox</span>
                        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredDiagrams.length === 0 && (
              <div className="py-16 text-center text-sm text-[var(--muted-foreground)] border border-dashed border-[var(--border)] rounded-2xl">
                No whiteboard blueprints match &quot;{searchQuery}&quot; in this category.
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: CORE CONCEPTS ──────────────────────────────────────────── */}
        {activeTab === "concepts" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold text-[var(--foreground)]">
                {filteredConcepts.length} Architectural Concepts &amp; Definitions
              </h3>
              <span className="text-xs text-[var(--muted-foreground)]">
                Difficulty: {difficultyFilter}
              </span>
            </div>

            <div
              className={cn(
                "grid gap-4",
                isCompact ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
              )}
            >
              {filteredConcepts.map((concept) => {
                const isExpanded = expandedCards[concept.id];
                return (
                  <div
                    key={concept.id}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-4 sm:p-5 transition-all hover:border-purple-500/30 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-[var(--foreground)]">
                            {concept.term}
                          </h4>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            {concept.difficulty}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-[var(--muted-foreground)] uppercase tracking-wider">
                          {concept.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopy(concept.definition, "Concept definition")}
                          className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                          title="Copy Definition"
                        >
                          <Share2 size={13} />
                        </button>
                        <button
                          onClick={() => toggleCardExpanded(concept.id)}
                          className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                          title={isExpanded ? "Collapse" : "Expand Deep-Dive"}
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Definition */}
                    <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs sm:text-sm text-[var(--foreground)] leading-relaxed">
                      {concept.definition}
                    </div>

                    {/* Expandable Deep Dive Explanation */}
                    {isExpanded && (
                      <div className="space-y-3 pt-2 text-xs sm:text-sm border-t border-[var(--border)]">
                        {concept.explanation && (
                          <div className="space-y-1">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                              In-Depth Mechanism:
                            </span>
                            <p className="text-[var(--foreground)] leading-relaxed">
                              {concept.explanation}
                            </p>
                          </div>
                        )}

                        {concept.keyPoints && concept.keyPoints.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                              Key Architectural Takeaways:
                            </span>
                            <ul className="space-y-1 text-xs text-[var(--foreground)]">
                              {concept.keyPoints.map((kp, kIdx) => (
                                <li key={kIdx} className="flex items-start gap-1.5">
                                  <span className="text-emerald-500 font-bold">•</span>
                                  <span>{kp}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs pt-1">
                      <button
                        onClick={() => toggleCardExpanded(concept.id)}
                        className="text-purple-600 dark:text-purple-400 hover:underline font-semibold cursor-pointer"
                      >
                        {isExpanded ? "Show Less" : "Deep Dive Explanation & Key Points →"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredConcepts.length === 0 && (
              <div className="py-16 text-center text-sm text-[var(--muted-foreground)] border border-dashed border-[var(--border)] rounded-2xl">
                No concepts found matching your filters.
              </div>
            )}
          </div>
        )}

        {/* ── TAB 4: SYSTEM BLUEPRINTS & SCENARIOS ──────────────────────────── */}
        {activeTab === "blueprints" && (
          <div className="space-y-8">
            {/* Modern Lakehouse Blueprints */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers size={18} className="text-blue-500" />
                  <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
                    Production Architecture Blueprints ({filteredBlueprints.length})
                  </h3>
                </div>
                <span className="text-xs text-[var(--muted-foreground)]">
                  End-to-End System Topologies
                </span>
              </div>

              <div className="space-y-6">
                {filteredBlueprints.map((bp) => (
                  <div
                    key={bp.id}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-5 sm:p-7 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                          {bp.category}
                        </span>
                        <h4 className="text-base sm:text-xl font-bold text-[var(--foreground)]">
                          {bp.title}
                        </h4>
                      </div>

                      {bp.costEstimate && (
                        <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-mono font-semibold text-amber-600 dark:text-amber-400 self-start sm:self-auto">
                          💰 Cost: {bp.costEstimate}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {bp.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-xs font-mono px-2 py-0.5 rounded-md bg-[var(--surface-2)] text-[var(--muted-foreground)] border border-[var(--border)]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Architecture Topology View (ASCII / Flow) */}
                    {bp.ascii && (
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
                          Pipeline Flow Topology:
                        </div>
                        <pre className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] font-mono text-xs overflow-x-auto text-[var(--foreground)] leading-relaxed">
                          {bp.ascii}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Architecture Production Scenarios */}
            {filteredScenarios.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <Cpu size={18} className="text-purple-500" />
                  <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
                    Deep Architectural Troubleshooting &amp; Scenarios ({filteredScenarios.length})
                  </h3>
                </div>

                <div className="space-y-4">
                  {filteredScenarios.map((scenario) => {
                    const isExpanded = expandedCards[scenario.id];
                    return (
                      <div
                        key={scenario.id}
                        className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-4 sm:p-5 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                              {scenario.niche || scenario.category}
                            </span>
                            <h4 className="text-sm sm:text-base font-bold text-[var(--foreground)]">
                              {scenario.question}
                            </h4>
                          </div>

                          <button
                            onClick={() => toggleCardExpanded(scenario.id)}
                            className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer shrink-0"
                          >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>

                        {/* Collapsed vs Expanded Answer */}
                        <div
                          className={cn(
                            "p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs sm:text-sm text-[var(--foreground)] leading-relaxed",
                            !isExpanded && "line-clamp-3"
                          )}
                        >
                          <div className="whitespace-pre-line">{scenario.answer}</div>
                        </div>

                        <button
                          onClick={() => toggleCardExpanded(scenario.id)}
                          className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-semibold cursor-pointer"
                        >
                          {isExpanded ? "Collapse Analysis" : "Expand Architectural Rationale →"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 5: TECHNICAL Q&A INTERVIEW DRILLS ─────────────────────────── */}
        {activeTab === "qa" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold text-[var(--foreground)]">
                {filteredQuestions.length} Practice Questions &amp; Architectural Answers
              </h3>
              <span className="text-xs text-[var(--muted-foreground)]">
                Difficulty: {difficultyFilter}
              </span>
            </div>

            <div className="space-y-3">
              {filteredQuestions.map((q) => {
                const isExpanded = expandedCards[q.id];
                return (
                  <div
                    key={q.id}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-4 sm:p-5 transition-all hover:border-purple-500/30 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                            {q.niche || q.category}
                          </span>
                          <span
                            className={cn(
                              "text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border",
                              q.difficulty === "HARD" || q.difficulty === "ARCHITECT"
                                ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20"
                                : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                            )}
                          >
                            {q.difficulty}
                          </span>
                        </div>
                        <h4 className="text-sm sm:text-base font-bold text-[var(--foreground)]">
                          {q.question}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleCopy(q.answer, "Answer")}
                          className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                          title="Copy Answer"
                        >
                          <Share2 size={13} />
                        </button>
                        <button
                          onClick={() => toggleCardExpanded(q.id)}
                          className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Answer Block */}
                    <div
                      className={cn(
                        "p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs sm:text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-line font-sans",
                        !isExpanded && "line-clamp-2"
                      )}
                    >
                      {q.answer}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <button
                        onClick={() => toggleCardExpanded(q.id)}
                        className="text-purple-600 dark:text-purple-400 hover:underline font-semibold cursor-pointer"
                      >
                        {isExpanded ? "Collapse Answer" : "View Comprehensive Answer →"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredQuestions.length === 0 && (
              <div className="py-16 text-center text-sm text-[var(--muted-foreground)] border border-dashed border-[var(--border)] rounded-2xl">
                No questions found matching your filter criteria.
              </div>
            )}
          </div>
        )}

        {/* ── BOTTOM GUIDED LEARNING STEPPER FOOTER ─────────────────────────── */}
        <section className="mt-12 pt-8 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={() => handleSelectCategory(prevCategory.id)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] hover:bg-[var(--surface-2)] text-xs font-bold transition-all cursor-pointer"
          >
            <ArrowLeft size={14} />
            <div className="text-left">
              <div className="text-[10px] text-[var(--muted-foreground)] font-normal uppercase">
                Previous Category
              </div>
              <div className="text-xs font-bold text-[var(--foreground)]">{prevCategory.shortTitle}</div>
            </div>
          </button>

          <div className="text-center">
            <span className="text-xs text-[var(--muted-foreground)]">
              Category {currentIndex + 1} of {WHITEBOARD_CATEGORIES.length} • {percentComplete}% Curriculum Mastered
            </span>
          </div>

          <button
            onClick={() => handleSelectCategory(nextCategory.id)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-purple-500/30 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-purple-600/20"
          >
            <div className="text-right">
              <div className="text-[10px] text-purple-200 font-normal uppercase">Next Category</div>
              <div className="text-xs font-bold text-white">{nextCategory.shortTitle}</div>
            </div>
            <ArrowRight size={14} />
          </button>
        </section>
      </main>

      {/* ── HIGH-RESOLUTION BLUEPRINT LIGHTBOX MODAL ──────────────────────── */}
      {activeDiagram && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setActiveDiagram(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl sm:rounded-3xl border border-[var(--border)] bg-[var(--surface-1)] shadow-2xl overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[var(--border)] bg-[var(--surface-2)] shrink-0">
              <div className="space-y-0.5 min-w-0 pr-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg bg-purple-500/15 text-purple-400 border border-purple-500/30">
                    {activeDiagram.category}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-[var(--foreground)] truncate">
                    {activeDiagram.title}
                  </h3>
                </div>
                <p className="text-[11px] text-[var(--muted-foreground)] truncate hidden sm:block">
                  {activeDiagram.subtitle}
                </p>
              </div>

              {/* Controls: Theme Toggle + Zoom + Close */}
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="hidden sm:block">
                  <WhiteboardThemeToggle size="xs" showLabel={false} />
                </div>

                <button
                  onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.2))}
                  className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut size={16} />
                </button>
                <span className="text-[10px] font-mono font-semibold text-[var(--muted-foreground)] w-10 text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
                  className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn size={16} />
                </button>
                <button
                  onClick={() => setZoomLevel(1)}
                  className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors cursor-pointer"
                  title="Reset Zoom"
                >
                  <RotateCcw size={14} />
                </button>

                <div className="h-4 w-px bg-[var(--border)] mx-1" />

                <button
                  onClick={() => setActiveDiagram(null)}
                  className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors cursor-pointer"
                  title="Close (Esc)"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Canvas with Dark/Light Support & Zoom */}
            <div
              className={cn(
                "relative flex-1 min-h-[300px] sm:min-h-[460px] max-h-[60vh] overflow-auto p-4 sm:p-8 flex items-center justify-center select-none transition-colors duration-300",
                isDark ? "whiteboard-container-dark" : "whiteboard-container-light"
              )}
            >
              <div
                style={{ transform: `scale(${zoomLevel})`, transition: "transform 0.15s ease-out" }}
                className="relative max-w-full max-h-full flex items-center justify-center"
              >
                <Image
                  src={activeDiagram.image}
                  alt={activeDiagram.title}
                  width={1400}
                  height={900}
                  className={cn(
                    "object-contain max-h-[55vh] w-auto h-auto rounded-xl drop-shadow-md",
                    isDark && "whiteboard-image-dark"
                  )}
                  priority
                />
              </div>
            </div>

            {/* Modal Footer with Multi-Perspective Architectural Context & Runbooks */}
            <div className="border-t border-[var(--border)] bg-[var(--surface-2)] flex flex-col max-h-[46vh] sm:max-h-[48vh] overflow-hidden">
              {/* Modal Sub-Tabs */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-2 border-b border-[var(--border)] bg-[var(--surface-1)] shrink-0 gap-2">
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setModalTab("architecture")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer",
                      modalTab === "architecture"
                        ? "bg-purple-600 text-white shadow-xs"
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
                    )}
                  >
                    <Compass size={13} />
                    <span>Architecture &amp; Pillars</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalTab("personas")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer",
                      modalTab === "personas"
                        ? "bg-purple-600 text-white shadow-xs"
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
                    )}
                  >
                    <Users size={13} />
                    <span>5 Role Perspectives</span>
                    <span className="text-[10px] px-1 rounded bg-black/20 font-mono">5</span>
                  </button>

                  {activeDiagram.failureModesAndTriage && activeDiagram.failureModesAndTriage.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setModalTab("triage")}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer",
                        modalTab === "triage"
                          ? "bg-amber-600 text-white shadow-xs"
                          : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
                      )}
                    >
                      <AlertTriangle size={13} />
                      <span>Production Triage</span>
                      <span className="text-[10px] px-1 rounded bg-black/20 font-mono">
                        {activeDiagram.failureModesAndTriage.length}
                      </span>
                    </button>
                  )}

                  {activeDiagram.governanceAndCompliance && activeDiagram.governanceAndCompliance.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setModalTab("governance")}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer",
                        modalTab === "governance"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
                      )}
                    >
                      <ShieldCheck size={13} />
                      <span>Governance &amp; Compliance</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={(e) => handleDownload(activeDiagram, e)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Download size={13} />
                    <span className="hidden sm:inline">Download</span>
                  </button>

                  {activeDiagram.docLink && (
                    <a
                      href={activeDiagram.docLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <span className="hidden sm:inline">Docs</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>

              {/* Tab Content Body (Scrollable) */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
                {/* 1. Architecture & Pillars Tab */}
                {modalTab === "architecture" && (
                  <div className="space-y-4">
                    <p className="text-xs sm:text-sm text-[var(--foreground)] leading-relaxed">
                      {activeDiagram.description}
                    </p>

                    {/* Architect Manifesto Box */}
                    {activeDiagram.architectNotes && (
                      <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/25 space-y-1">
                        <div className="text-xs font-bold text-purple-600 dark:text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Compass size={14} className="text-purple-500" /> Executive Architect Manifesto &amp; Trade-offs
                        </div>
                        <p className="text-xs text-[var(--foreground)] leading-relaxed">
                          {activeDiagram.architectNotes}
                        </p>
                      </div>
                    )}

                    {/* Key Architectural Pillars */}
                    <div className="space-y-2 pt-1 border-t border-[var(--border)]">
                      <div className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)] flex items-center gap-1.5">
                        <Sparkles size={13} className="text-purple-500" /> Key Architectural Pillars ({activeDiagram.keyPoints.length})
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-[var(--muted-foreground)]">
                        {activeDiagram.keyPoints.map((point, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 p-2 rounded-lg bg-[var(--surface-1)] border border-[var(--border)]/60">
                            <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                            <span className="leading-relaxed text-[var(--foreground)]">{point}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Under-The-Hood Technical Mechanisms */}
                    {activeDiagram.technicalMechanisms && activeDiagram.technicalMechanisms.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-[var(--border)]">
                        <div className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                          <Cpu size={14} /> Under-The-Hood Engine Mechanisms
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {activeDiagram.technicalMechanisms.map((mech, idx) => (
                            <div key={idx} className="p-2.5 rounded-lg bg-[var(--surface-1)] border border-[var(--border)] text-xs text-[var(--foreground)] flex items-start gap-2">
                              <span className="text-purple-500 font-mono font-bold shrink-0">#{idx + 1}</span>
                              <span className="leading-snug">{mech}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Persona Perspectives Tab */}
                {modalTab === "personas" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                      {[
                        { id: "architect", label: "Lead Architect", icon: Compass, color: "text-purple-400" },
                        { id: "seniorDe", label: "Senior / Staff DE", icon: Cpu, color: "text-blue-400" },
                        { id: "dataEngineer", label: "Data Engineer", icon: Wrench, color: "text-emerald-400" },
                        { id: "steward", label: "Data Steward", icon: ShieldCheck, color: "text-amber-400" },
                        { id: "businessAnalyst", label: "Business Analyst", icon: BarChart3, color: "text-pink-400" },
                      ].map((p) => {
                        const Icon = p.icon;
                        const isSelected = activePersona === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setActivePersona(p.id as any)}
                            className={cn(
                              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border",
                              isSelected
                                ? "bg-purple-600 border-purple-500 text-white"
                                : "bg-[var(--surface-1)] border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                            )}
                          >
                            <Icon size={13} className={isSelected ? "text-white" : p.color} />
                            <span>{p.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {activeDiagram.personaBreakdown && (
                      <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                            Role Responsibility &amp; Tactical Ownership:
                          </span>
                          <span className="text-[11px] font-mono text-[var(--muted-foreground)]">
                            Perspective: {activePersona.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-[var(--foreground)] leading-relaxed">
                          {activeDiagram.personaBreakdown[activePersona]}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Production Triage & Runbooks Tab */}
                {modalTab === "triage" && activeDiagram.failureModesAndTriage && (
                  <div className="space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <AlertTriangle size={14} /> Production Incident Scenarios &amp; Engineering Triage Runbooks
                    </div>
                    <div className="space-y-2.5">
                      {activeDiagram.failureModesAndTriage.map((failure, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1.5"
                        >
                          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-[10px] font-mono">
                              INCIDENT #{idx + 1}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--foreground)] leading-relaxed">
                            {failure}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Governance & Compliance Tab */}
                {modalTab === "governance" && activeDiagram.governanceAndCompliance && (
                  <div className="space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <ShieldCheck size={14} /> Regulatory Compliance, Lineage &amp; Security Guardrails
                    </div>
                    <div className="space-y-2">
                      {activeDiagram.governanceAndCompliance.map((gov, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-2 text-xs text-[var(--foreground)]"
                        >
                          <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{gov}</span>
                        </div>
                      ))}
                    </div>
                    {activeDiagram.docLink && (
                      <div className="pt-2 flex justify-end">
                        <a
                          href={activeDiagram.docLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
                        >
                          <span>Official Technical Documentation</span>
                          <ExternalLink size={13} />
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
