"use client";

import { CONTENT_COUNTS, formatContentCount } from "@/data/content-counts";
import React, { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  GitBranch,
  Search,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  BookOpen,
  Sparkles,
  Layers,
  Copy,
  Check,
  X,
  SlidersHorizontal,
  FolderTree,
  Maximize2,
  Minimize2,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  Network,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Concept, Difficulty } from "@/types/data";
import { TopicIcon } from "@/components/ui/topic-icon";
import {
  buildConceptsMultiLevelTree,
  ConceptTopicPillar,
  ConceptSubtopicPillar,
} from "@/data/concepts-tree-data";

const difficultyColors: Record<Difficulty, { bg: string; text: string; border: string }> = {
  EASY: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  MEDIUM: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  HARD: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
  ARCHITECT: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
};

interface ConceptsMindmapViewProps {
  concepts: Concept[];
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  selectedCategory?: string;
  onCategoryChange?: (cat: string) => void;
  initialLayoutMode?: "mindmap" | "tree" | "grid";
}

export function ConceptsMindmapView({
  concepts,
  searchQuery = "",
  onSearchChange,
  selectedCategory = "ALL",
  onCategoryChange,
  initialLayoutMode = "tree",
}: ConceptsMindmapViewProps) {
  // Local or controlled search
  const [internalSearch, setInternalSearch] = useState("");
  const activeSearch = onSearchChange ? searchQuery : internalSearch;
  const handleSearch = onSearchChange ? onSearchChange : setInternalSearch;

  // Selected Topic Filter
  const [activeTopicFilter, setActiveTopicFilter] = useState<string>("ALL");
  const currentTopic = onCategoryChange ? selectedCategory : activeTopicFilter;
  const handleSelectTopic = onCategoryChange ? onCategoryChange : setActiveTopicFilter;

  // Difficulty Filter
  const [difficultyFilter, setDifficultyFilter] = useState<string>("ALL");

  // Stretch Depth:
  // 1 = Topics Only
  // 2 = Topics -> Subtopics
  // 3 = Topics -> Subtopics -> Concepts (Full Stretch)
  // 4 = Deep Stretch (Concepts with Definition Previews)
  const [stretchDepth, setStretchDepth] = useState<1 | 2 | 3 | 4>(3);

  // Layout presentation mode: 'mindmap' (Linked Mind Map), 'tree' (Tree Branches) or 'grid' (Pillar Columns)
  const [layoutMode, setLayoutMode] = useState<"mindmap" | "tree" | "grid">(initialLayoutMode);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Expanded nodes state
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [expandedSubtopics, setExpandedSubtopics] = useState<Set<string>>(new Set());

  // Selected Concept for Detail Inspector
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
  const [copied, setCopied] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem("dataprep_bookmarks");
      return new Set(saved ? JSON.parse(saved) : []);
    } catch {
      return new Set();
    }
  });

  // Build the complete 4-level stretch tree
  const fullTree = useMemo(() => {
    return buildConceptsMultiLevelTree(concepts);
  }, [concepts]);

  // Expand / collapse all based on depth
  const handleDepthChange = useCallback((depth: 1 | 2 | 3 | 4) => {
    setStretchDepth(depth);
    if (depth === 1) {
      setExpandedTopics(new Set());
      setExpandedSubtopics(new Set());
    } else if (depth === 2) {
      setExpandedTopics(new Set(fullTree.map((t) => t.id)));
      setExpandedSubtopics(new Set());
    } else {
      // 3 or 4: Expand all topics and all subtopics
      setExpandedTopics(new Set(fullTree.map((t) => t.id)));
      const allSub = new Set<string>();
      fullTree.forEach((t) => t.subtopics.forEach((s) => allSub.add(s.id)));
      setExpandedSubtopics(allSub);
    }
  }, [fullTree]);

  // Initial auto-expand to Level 3 on mount
  React.useEffect(() => {
    if (expandedTopics.size === 0) {
      setExpandedTopics(new Set(fullTree.map((t) => t.id)));
      const initialSubs = new Set<string>();
      // Expand subtopics for initial visible state
      fullTree.forEach((t) => {
        t.subtopics.slice(0, 3).forEach((s) => initialSubs.add(s.id));
      });
      setExpandedSubtopics(initialSubs);
    }
  }, [fullTree, expandedTopics.size]);

  // Auto-expand branches when searching
  React.useEffect(() => {
    if (activeSearch.trim().length > 1) {
      const q = activeSearch.toLowerCase();
      const matchingTopics = new Set<string>();
      const matchingSubtopics = new Set<string>();

      fullTree.forEach((topic) => {
        topic.subtopics.forEach((sub) => {
          const hasMatchingConcept = sub.concepts.some(
            (c) =>
              c.term.toLowerCase().includes(q) ||
              c.definition.toLowerCase().includes(q) ||
              c.explanation.toLowerCase().includes(q)
          );
          if (
            hasMatchingConcept ||
            sub.title.toLowerCase().includes(q) ||
            topic.title.toLowerCase().includes(q)
          ) {
            matchingTopics.add(topic.id);
            matchingSubtopics.add(sub.id);
          }
        });
      });

      if (matchingTopics.size > 0) {
        setExpandedTopics(matchingTopics);
        setExpandedSubtopics(matchingSubtopics);
      }
    }
  }, [activeSearch, fullTree]);

  const toggleTopic = (topicId: string) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) next.delete(topicId);
      else next.add(topicId);
      return next;
    });
  };

  const toggleSubtopic = (subId: string) => {
    setExpandedSubtopics((prev) => {
      const next = new Set(prev);
      if (next.has(subId)) next.delete(subId);
      else next.add(subId);
      return next;
    });
  };

  const handleBookmarkToggle = (concept: Concept) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      const isBookmarked = next.has(concept.id);
      if (isBookmarked) {
        next.delete(concept.id);
        toast.info(`Removed ${concept.term} from bookmarks`);
      } else {
        next.add(concept.id);
        toast.success(`Saved ${concept.term} to bookmarks`);
      }
      try {
        localStorage.setItem("dataprep_bookmarks", JSON.stringify([...next]));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleCopyDefinition = (concept: Concept) => {
    const text = `${concept.term} (${concept.category})\n\nDefinition: ${concept.definition}\n\nExplanation:\n${concept.explanation}\n\nKey Points:\n${concept.keyPoints?.map((p) => `• ${p}`).join("\n") || ""}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Concept definition copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Filtered tree
  const filteredTree = useMemo(() => {
    const q = activeSearch.trim().toLowerCase();

    return fullTree
      .filter((topic) => {
        if (currentTopic !== "ALL" && topic.categoryKey !== currentTopic && topic.id !== currentTopic) {
          return false;
        }
        return true;
      })
      .map((topic) => {
        const filteredSubtopics = topic.subtopics
          .map((sub) => {
            const filteredConcepts = sub.concepts.filter((concept) => {
              if (difficultyFilter !== "ALL" && concept.difficulty !== difficultyFilter) {
                return false;
              }
              if (!q) return true;
              return (
                concept.term.toLowerCase().includes(q) ||
                concept.definition.toLowerCase().includes(q) ||
                concept.explanation.toLowerCase().includes(q) ||
                sub.title.toLowerCase().includes(q) ||
                topic.title.toLowerCase().includes(q)
              );
            });

            return {
              ...sub,
              concepts: filteredConcepts,
            };
          })
          .filter((sub) => {
            if (!q && difficultyFilter === "ALL") return true;
            return sub.concepts.length > 0;
          });

        const totalMatchingConcepts = filteredSubtopics.reduce(
          (sum, sub) => sum + sub.concepts.length,
          0
        );

        return {
          ...topic,
          subtopics: filteredSubtopics,
          matchingCount: totalMatchingConcepts,
        };
      })
      .filter((topic) => {
        if (!q && difficultyFilter === "ALL") return true;
        return topic.matchingCount > 0;
      });
  }, [fullTree, currentTopic, difficultyFilter, activeSearch]);

  const totalVisibleConcepts = useMemo(() => {
    return filteredTree.reduce((sum, t) => sum + (t.matchingCount ?? 0), 0);
  }, [filteredTree]);

  const handleCopyHierarchy = useCallback(() => {
    let md = `# Enterprise Data Platform Concepts Hierarchy\n\n`;
    filteredTree.forEach((topic) => {
      md += `## ${topic.title} (${topic.matchingCount} concepts)\n`;
      topic.subtopics.forEach((sub) => {
        md += `### ${sub.title} (${sub.concepts.length} concepts)\n`;
        sub.concepts.forEach((c) => {
          md += `- **${c.term}** [${c.difficulty}]\n`;
        });
        md += `\n`;
      });
    });
    navigator.clipboard.writeText(md);
    toast.success("Complete concepts hierarchy copied to clipboard as Markdown!");
  }, [filteredTree]);

  // Flat list of visible concepts for sequential focus navigation
  const visibleConceptsList = useMemo(() => {
    const list: Concept[] = [];
    filteredTree.forEach((topic) => {
      topic.subtopics.forEach((sub) => {
        list.push(...sub.concepts);
      });
    });
    // Fallback to all concepts if selected concept is not in current tree filter
    if (selectedConcept && !list.some((c) => c.id === selectedConcept.id)) {
      return concepts;
    }
    return list.length > 0 ? list : concepts;
  }, [filteredTree, concepts, selectedConcept]);

  const currentConceptIndex = useMemo(() => {
    if (!selectedConcept) return -1;
    return visibleConceptsList.findIndex((c) => c.id === selectedConcept.id);
  }, [selectedConcept, visibleConceptsList]);

  const hasPrevConcept = currentConceptIndex > 0;
  const hasNextConcept =
    currentConceptIndex >= 0 && currentConceptIndex < visibleConceptsList.length - 1;

  const handlePrevConcept = useCallback(() => {
    if (currentConceptIndex > 0) {
      setSelectedConcept(visibleConceptsList[currentConceptIndex - 1]);
    }
  }, [currentConceptIndex, visibleConceptsList]);

  const handleNextConcept = useCallback(() => {
    if (
      currentConceptIndex >= 0 &&
      currentConceptIndex < visibleConceptsList.length - 1
    ) {
      setSelectedConcept(visibleConceptsList[currentConceptIndex + 1]);
    }
  }, [currentConceptIndex, visibleConceptsList]);

  // Keyboard navigation when focus mode / modal is open
  React.useEffect(() => {
    if (!selectedConcept) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        setSelectedConcept(null);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrevConcept();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNextConcept();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedConcept, handlePrevConcept, handleNextConcept]);

  return (
    <div className="space-y-4">
      {/* ─── MIND MAP HEADER & CONTROLS DECK ─── */}
      <div className="rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] p-4 sm:p-5 shadow-xs space-y-4">
        {/* Title, Counts & Layout Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
              <GitBranch size={13} />
              <span>Multi-Level Stretching Tree</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[var(--foreground)] tracking-tight">
              Concepts Multi-Level Mind Map
            </h2>
            <p className="text-xs text-[var(--muted-foreground)]">
              Explore the entire {formatContentCount(CONTENT_COUNTS.concepts)}+ concepts repository stretching from Top-Level Domains to Architectural Pillars and Deep Technical Mechanics.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Stretch Depth Switcher */}
            <div className="inline-flex items-center gap-1 p-1 rounded-full bg-[var(--surface-2)] border border-[var(--border)] text-xs">
              {[
                { depth: 1 as const, label: "Topics" },
                { depth: 2 as const, label: "Subtopics" },
                { depth: 3 as const, label: "Full Tree" },
                { depth: 4 as const, label: "Deep" },
              ].map((d) => (
                <button
                  key={d.depth}
                  type="button"
                  onClick={() => handleDepthChange(d.depth)}
                  className={cn(
                    "px-3.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap",
                    stretchDepth === d.depth
                      ? "bg-blue-600 text-white shadow-xs font-bold"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)]/60 font-medium"
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {/* Layout Mode Switcher */}
            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs">
              <button
                type="button"
                onClick={() => setLayoutMode("mindmap")}
                className={cn(
                  "px-2.5 py-1 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 font-semibold text-xs",
                  layoutMode === "mindmap"
                    ? "bg-blue-600 text-white"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                )}
                title="Linked Mind Map (Only Names)"
                aria-label="Linked Mind Map (Only Names)"
              >
                <Network size={14} />
                <span className="hidden sm:inline">Mind Map</span>
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode("tree")}
                className={cn(
                  "p-1.5 rounded-lg transition-colors cursor-pointer",
                  layoutMode === "tree"
                    ? "bg-blue-600 text-white"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                )}
                title="Hierarchical Tree Stretch"
                aria-label="Hierarchical Tree Stretch"
              >
                <FolderTree size={14} />
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode("grid")}
                className={cn(
                  "p-1.5 rounded-lg transition-colors cursor-pointer",
                  layoutMode === "grid"
                    ? "bg-blue-600 text-white"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                )}
                title="Pillars Matrix Stretch"
                aria-label="Pillars Matrix Stretch"
              >
                <Layers size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Search & Topic Filters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="relative md:col-span-6">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" size={15} />
            <input
              type="text"
              value={activeSearch}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search concepts across the multi-level tree (e.g., liquid clustering, catalyst, calculate)..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs sm:text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
            />
            {activeSearch && (
              <button
                type="button"
                onClick={() => handleSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] p-1 cursor-pointer"
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="md:col-span-6 flex items-center gap-2 flex-wrap justify-between md:justify-end">
            {/* Difficulty Filter */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-[11px] text-[var(--muted-foreground)] font-medium">Difficulty:</span>
              {["ALL", "EASY", "MEDIUM", "HARD", "ARCHITECT"].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setDifficultyFilter(lvl)}
                  className={cn(
                    "px-2 py-1 rounded-md text-[11px] font-semibold border transition-all cursor-pointer",
                    difficultyFilter === lvl
                      ? "bg-blue-600 text-white border-blue-500 shadow-xs"
                      : "bg-[var(--surface-2)] border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  )}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <span className="text-xs text-[var(--muted-foreground)] font-mono">
              <strong className="text-[var(--foreground)]">{totalVisibleConcepts}</strong> concepts visible
            </span>
          </div>
        </div>

        {/* Topic Filter Pills (Horizontal Wrapping) */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <button
            type="button"
            onClick={() => handleSelectTopic("ALL")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer",
              currentTopic === "ALL"
                ? "bg-blue-600 text-white border-blue-500 shadow-xs"
                : "bg-[var(--surface-2)] border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-3)]"
            )}
          >
            All 13 Topics ({concepts.length})
          </button>
          {fullTree.map((topic) => (
            <button
              key={topic.id}
              type="button"
              onClick={() => handleSelectTopic(topic.categoryKey)}
              className={cn(
                "px-2.5 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer",
                currentTopic === topic.categoryKey || currentTopic === topic.id
                  ? "bg-blue-600 text-white border-blue-500 shadow-xs"
                  : "bg-[var(--surface-2)] border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)]"
              )}
            >
              <TopicIcon topic={topic.icon} size={12} />
              <span>{topic.shortTitle}</span>
              <span className="text-[10px] opacity-75 font-mono">({topic.totalCount})</span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── TREE / GRID PRESENTATION ─── */}
      {filteredTree.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] space-y-2">
          <GitBranch size={32} className="mx-auto text-[var(--muted-foreground)] opacity-40" />
          <h3 className="text-sm font-semibold text-[var(--foreground)]">No concepts match your filter</h3>
          <p className="text-xs text-[var(--muted-foreground)]">Try clearing your search query or selecting "All Topics".</p>
          <button
            type="button"
            onClick={() => {
              handleSearch("");
              handleSelectTopic("ALL");
              setDifficultyFilter("ALL");
            }}
            className="mt-2 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <RotateCcw size={12} />
            <span>Reset All Filters</span>
          </button>
        </div>
      ) : layoutMode === "mindmap" ? (
        /* ─── LINKED MIND MAP (ONLY NAMES IN CONNECTED HIERARCHY) ─── */
        <div
          className={cn(
            "rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] overflow-hidden shadow-xs transition-all",
            isFullscreen && "fixed inset-0 z-50 rounded-none bg-[var(--background)] p-4 sm:p-6 overflow-auto"
          )}
        >
          {/* Canvas Control Toolbar */}
          <div className="p-3 sm:p-4 bg-[var(--surface-2)]/60 border-b border-[var(--border)] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 font-semibold">
                <Network size={13} />
                <span>Linked Mind Map Topology</span>
              </div>
              <span className="hidden sm:inline text-[var(--muted-foreground)]">•</span>
              <span className="text-[var(--muted-foreground)] text-[11px]">
                Showing <strong className="text-[var(--foreground)]">{totalVisibleConcepts}</strong> concept names linked across <strong className="text-[var(--foreground)]">{filteredTree.length}</strong> domains
              </span>
            </div>

            {/* Canvas Actions */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Zoom controls */}
              <div className="flex items-center gap-0.5 px-1 py-0.5 rounded-lg bg-[var(--surface-1)] border border-[var(--border)] text-xs">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.6))}
                  className="p-1 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] cursor-pointer"
                  title="Zoom Out"
                  aria-label="Zoom Out"
                >
                  <ZoomOut size={13} />
                </button>
                <span className="text-[11px] font-mono px-1.5 text-[var(--foreground)] min-w-[3rem] text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 1.5))}
                  className="p-1 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] cursor-pointer"
                  title="Zoom In"
                  aria-label="Zoom In"
                >
                  <ZoomIn size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel(1)}
                  className="p-1 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] cursor-pointer"
                  title="Reset Zoom"
                  aria-label="Reset Zoom"
                >
                  <RotateCcw size={13} />
                </button>
              </div>

              {/* Copy Hierarchy */}
              <button
                type="button"
                onClick={handleCopyHierarchy}
                className="px-2.5 py-1 rounded-lg bg-[var(--surface-1)] border border-[var(--border)] text-[11px] font-semibold text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                title="Copy hierarchy as Markdown"
              >
                <Copy size={12} />
                <span className="hidden sm:inline">Copy Tree</span>
              </button>

              {/* Fullscreen Toggle */}
              <button
                type="button"
                onClick={() => setIsFullscreen((prev) => !prev)}
                className="px-2.5 py-1 rounded-lg bg-[var(--surface-1)] border border-[var(--border)] text-[11px] font-semibold text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
              >
                {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
                <span className="hidden sm:inline">{isFullscreen ? "Exit" : "Fullscreen"}</span>
              </button>
            </div>
          </div>

          {/* Mind Map Canvas Area */}
          <div className="p-4 sm:p-8 overflow-x-auto min-h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[var(--surface-2)]/30 via-transparent to-transparent">
            <div
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: "top left",
                transition: "transform 0.15s ease-out",
              }}
              className="space-y-8 min-w-[700px]"
            >
              {/* Level 0: Platform Core Root Hub */}
              <div className="inline-flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-[var(--surface-2)] border-2 border-blue-500/40 shadow-sm">
                <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-xs">
                  <Network size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      Level 0 • Platform Core
                    </span>
                    <span className="text-xs font-mono font-semibold text-[var(--muted-foreground)]">
                      {totalVisibleConcepts} Concepts
                    </span>
                  </div>
                  <h2 className="text-sm sm:text-base font-bold text-[var(--foreground)] tracking-tight">
                    Enterprise Data &amp; Lakehouse Platform
                  </h2>
                </div>
              </div>

              {/* Level 1, 2, 3 Branches */}
              <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 before:top-0 before:bottom-4 before:w-0.5 before:bg-blue-500/30">
                {filteredTree.map((topic) => {
                  const isTopicExpanded = expandedTopics.has(topic.id);

                  return (
                    <div key={topic.id} className="relative group">
                      {/* Connector from spine to Level 1 */}
                      <div className="absolute -left-3 sm:-left-5 top-5 w-3 sm:w-5 h-0.5 bg-blue-500/30" />

                      {/* Level 1: Topic Domain Node */}
                      <div className="flex items-start gap-4">
                        <div
                          onClick={() => toggleTopic(topic.id)}
                          className={cn(
                            "inline-flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl border-2 transition-all cursor-pointer select-none shadow-xs",
                            isTopicExpanded
                              ? "bg-[var(--surface-2)] border-blue-500/60 ring-1 ring-blue-500/20"
                              : "bg-[var(--surface-1)] border-[var(--border)] hover:border-blue-500/40"
                          )}
                          style={{ borderColor: isTopicExpanded ? topic.colorHex : undefined }}
                        >
                          <button
                            type="button"
                            className="p-0.5 rounded text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] cursor-pointer"
                            aria-label={isTopicExpanded ? "Collapse Domain" : "Expand Domain"}
                          >
                            {isTopicExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </button>

                          <div
                            className="p-1.5 rounded-lg border text-white"
                            style={{ backgroundColor: `${topic.colorHex}20`, borderColor: `${topic.colorHex}40` }}
                          >
                            <TopicIcon topic={topic.icon} size={15} />
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-blue-400">
                                L1 Domain
                              </span>
                              <span
                                className="text-[9px] font-semibold px-1.5 py-0.2 rounded border"
                                style={{
                                  backgroundColor: `${topic.colorHex}15`,
                                  color: topic.colorHex,
                                  borderColor: `${topic.colorHex}30`,
                                }}
                              >
                                {topic.categoryKey}
                              </span>
                            </div>
                            <h3 className="text-xs sm:text-sm font-bold text-[var(--foreground)] tracking-tight">
                              {topic.title}
                            </h3>
                          </div>

                          <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-[var(--surface-1)] border border-[var(--border)] text-[var(--muted-foreground)] ml-1">
                            {topic.matchingCount}
                          </span>
                        </div>
                      </div>

                      {/* Level 2 Subtopics & Level 3 Concepts */}
                      {isTopicExpanded && (
                        <div className="relative pl-6 sm:pl-8 pt-3 space-y-4 before:absolute before:left-3 before:top-2 before:bottom-3 before:w-0.5 before:bg-amber-500/30">
                          {topic.subtopics.map((subtopic) => {
                            const isSubExpanded = expandedSubtopics.has(subtopic.id);

                            return (
                              <div key={subtopic.id} className="relative">
                                {/* Connector from Domain to Subtopic */}
                                <div className="absolute -left-3 sm:-left-5 top-4 w-3 sm:w-5 h-0.5 bg-amber-500/30" />

                                {/* Level 2: Subtopic Node */}
                                <div
                                  onClick={() => toggleSubtopic(subtopic.id)}
                                  className={cn(
                                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all cursor-pointer select-none",
                                    isSubExpanded
                                      ? "bg-[var(--surface-2)] border-amber-500/50"
                                      : "bg-[var(--surface-1)] border-[var(--border)] hover:border-amber-500/30"
                                  )}
                                >
                                  <button
                                    type="button"
                                    className="p-0.5 rounded text-[var(--muted-foreground)] cursor-pointer"
                                    aria-label={isSubExpanded ? "Collapse Subtopic" : "Expand Subtopic"}
                                  >
                                    {isSubExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                                  </button>

                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[9px] font-bold uppercase tracking-wider text-amber-500">
                                        L2 Subtopic
                                      </span>
                                      <span className="text-xs font-bold text-[var(--foreground)]">
                                        {subtopic.title}
                                      </span>
                                    </div>
                                  </div>

                                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface-1)] border border-[var(--border)] text-[var(--muted-foreground)] font-semibold ml-1">
                                    {subtopic.concepts.length}
                                  </span>
                                </div>

                                {/* Level 3: Concepts (ONLY THE NAMES!) */}
                                {isSubExpanded && subtopic.concepts.length > 0 && (
                                  <div className="relative pl-6 sm:pl-8 pt-2.5 pb-1 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-500/30">
                                    {/* Header for Level 3 */}
                                    <div className="flex items-center gap-2 pb-1.5">
                                      <div className="absolute -left-3 sm:-left-5 top-4 w-3 sm:w-5 h-0.5 bg-emerald-500/30" />
                                      <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                                        L3 Concepts ({subtopic.concepts.length} Terms • Only Names)
                                      </span>
                                    </div>

                                    {/* Concepts pills: ONLY THE NAMES! */}
                                    <div className="flex flex-wrap items-center gap-2 pt-1">
                                      {subtopic.concepts.map((concept) => {
                                        const isSelected = selectedConcept?.id === concept.id;
                                        const isBookmarked = bookmarkedIds.has(concept.id);
                                        const isMatch = activeSearch.trim() && (
                                          concept.term.toLowerCase().includes(activeSearch.toLowerCase()) ||
                                          concept.definition.toLowerCase().includes(activeSearch.toLowerCase())
                                        );

                                        // Difficulty dot color
                                        const dotColor =
                                          concept.difficulty === "EASY"
                                            ? "bg-emerald-500"
                                            : concept.difficulty === "MEDIUM"
                                            ? "bg-blue-500"
                                            : concept.difficulty === "HARD"
                                            ? "bg-amber-500"
                                            : "bg-purple-500";

                                        return (
                                          <button
                                            key={concept.id}
                                            type="button"
                                            onClick={() => setSelectedConcept(concept)}
                                            title={`${concept.term} (${concept.difficulty}): ${concept.definition}`}
                                            className={cn(
                                              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all cursor-pointer select-none text-left",
                                              isSelected
                                                ? "bg-blue-500/20 border-blue-500 text-blue-400 ring-2 ring-blue-500/40 shadow-xs"
                                                : isMatch
                                                ? "bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/40 font-bold"
                                                : "bg-[var(--surface-1)] border-[var(--border)] text-[var(--foreground)] hover:border-blue-500/50 hover:bg-[var(--surface-2)]"
                                            )}
                                          >
                                            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColor)} />
                                            <span className="truncate max-w-[240px] sm:max-w-none">{concept.term}</span>
                                            {isBookmarked && (
                                              <BookmarkCheck size={10} className="text-amber-400 shrink-0" />
                                            )}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : layoutMode === "tree" ? (
        /* ─── HORIZONTAL TREE BRANCHING MULTI-LEVEL STRETCH ─── */
        <div className="space-y-4">
          {filteredTree.map((topic) => {
            const isTopicExpanded = expandedTopics.has(topic.id);

            return (
              <div
                key={topic.id}
                className="rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] overflow-hidden shadow-xs transition-all"
              >
                {/* Level 1: Topic Header Node */}
                <div
                  onClick={() => toggleTopic(topic.id)}
                  className="p-3.5 sm:p-4 bg-[var(--surface-1)] hover:bg-[var(--surface-2)] cursor-pointer select-none flex items-center justify-between gap-3 border-b border-[var(--border)] transition-colors"
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <button
                      type="button"
                      className="p-1 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                      aria-label={isTopicExpanded ? "Collapse topic" : "Expand topic"}
                    >
                      {isTopicExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                    <div className="p-1.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-blue-400">
                      <TopicIcon topic={topic.icon} size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                          Level 1 Topic
                        </span>
                        <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-md border", topic.badgeColor)}>
                          {topic.categoryKey}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-[var(--foreground)] tracking-tight">
                        {topic.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--foreground)]">
                      {topic.matchingCount} concepts
                    </span>
                  </div>
                </div>

                {/* Level 2 & 3: Stretched Sub-Topics & Concepts */}
                {isTopicExpanded && (
                  <div className="p-3.5 sm:p-5 space-y-4 bg-[var(--surface-2)]/30">
                    <p className="text-xs text-[var(--muted-foreground)] leading-relaxed italic">
                      {topic.description}
                    </p>

                    <div className="grid grid-cols-1 gap-3.5">
                      {topic.subtopics.map((subtopic) => {
                        const isSubExpanded = expandedSubtopics.has(subtopic.id);

                        return (
                          <div
                            key={subtopic.id}
                            className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-3 sm:p-4 space-y-3 shadow-xs"
                          >
                            {/* Level 2 Sub-Topic Header */}
                            <div
                              onClick={() => toggleSubtopic(subtopic.id)}
                              className="flex items-center justify-between gap-2 cursor-pointer select-none group"
                            >
                              <div className="flex items-center gap-2">
                                <div className="text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors">
                                  {isSubExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                                      Level 2 Pillar
                                    </span>
                                    <span className="text-xs font-bold text-[var(--foreground)]">
                                      {subtopic.title}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-[var(--muted-foreground)]">
                                    {subtopic.description}
                                  </p>
                                </div>
                              </div>

                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[var(--surface-2)] border border-[var(--border)] text-[var(--muted-foreground)] shrink-0">
                                {subtopic.concepts.length}
                              </span>
                            </div>

                            {/* Level 3 & 4: Concept Cards stretching horizontally/vertically */}
                            {isSubExpanded && subtopic.concepts.length > 0 && (
                              <div className="pt-2 border-t border-[var(--border)] space-y-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                                  Level 3 Concepts ({subtopic.concepts.length})
                                </span>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
                                  {subtopic.concepts.map((concept) => {
                                    const diffMeta = difficultyColors[concept.difficulty] || difficultyColors.MEDIUM;
                                    const isBookmarked = bookmarkedIds.has(concept.id);
                                    const isSelected = selectedConcept?.id === concept.id;

                                    return (
                                      <div
                                        key={concept.id}
                                        onClick={() => setSelectedConcept(concept)}
                                        className={cn(
                                          "rounded-lg p-2.5 border transition-all cursor-pointer select-none space-y-1.5 flex flex-col justify-between text-left",
                                          isSelected
                                            ? "bg-blue-500/10 border-blue-500 ring-1 ring-blue-500 shadow-sm"
                                            : "bg-[var(--surface-2)] border-[var(--border)] hover:border-blue-500/50 hover:bg-[var(--surface-3)]"
                                        )}
                                      >
                                        <div className="space-y-1">
                                          <div className="flex items-center justify-between gap-1">
                                            <span
                                              className={cn(
                                                "text-[9px] font-semibold px-1.5 py-0.5 rounded-sm border uppercase",
                                                diffMeta.bg,
                                                diffMeta.text,
                                                diffMeta.border
                                              )}
                                            >
                                              {concept.difficulty}
                                            </span>
                                            {isBookmarked && (
                                              <BookmarkCheck size={11} className="text-amber-400 shrink-0" />
                                            )}
                                          </div>
                                          <h4 className="text-xs font-bold text-[var(--foreground)] tracking-tight break-words">
                                            {concept.term}
                                          </h4>
                                        </div>

                                        <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                                          {concept.definition}
                                        </p>

                                        {stretchDepth === 4 && concept.keyPoints && concept.keyPoints.length > 0 && (
                                          <div className="pt-1.5 border-t border-[var(--border)] text-[10px] text-[var(--muted-foreground)] space-y-0.5">
                                            <span className="font-semibold text-blue-400 block text-[9px] uppercase tracking-wider">
                                              Deep Mechanism:
                                            </span>
                                            <p className="italic">{concept.keyPoints[0]}</p>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* ─── GRID / PILLARS COMPARISON PRESENTATION ─── */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredTree.map((topic) => (
            <div
              key={topic.id}
              className="rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] p-4 space-y-3.5 shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-blue-400">
                      <TopicIcon topic={topic.icon} size={16} />
                    </div>
                    <div>
                      <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-md border", topic.badgeColor)}>
                        {topic.categoryKey}
                      </span>
                      <h3 className="text-sm font-bold text-[var(--foreground)] leading-tight pt-0.5">
                        {topic.title}
                      </h3>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[var(--foreground)] bg-[var(--surface-2)] px-2 py-0.5 rounded-md border border-[var(--border)]">
                    {topic.matchingCount}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {topic.subtopics.map((sub) => (
                    <div key={sub.id} className="p-2.5 rounded-xl bg-[var(--surface-2)]/60 border border-[var(--border)] space-y-1.5">
                      <div className="flex items-center justify-between gap-1 text-[11px]">
                        <span className="font-semibold text-[var(--foreground)] break-words">{sub.title}</span>
                        <span className="text-[10px] text-[var(--muted-foreground)] font-mono">({sub.concepts.length})</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {sub.concepts.slice(0, 8).map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setSelectedConcept(c)}
                            className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[var(--surface-1)] border border-[var(--border)] text-[var(--foreground)] hover:border-blue-500 hover:text-blue-400 transition-colors cursor-pointer"
                          >
                            {c.term}
                          </button>
                        ))}
                        {sub.concepts.length > 8 && (
                          <span className="text-[10px] text-[var(--muted-foreground)]">
                            +{sub.concepts.length - 8} more
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setLayoutMode("tree");
                  handleSelectTopic(topic.categoryKey);
                }}
                className="w-full py-1.5 rounded-lg text-xs font-semibold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-colors text-center cursor-pointer"
              >
                Expand Multi-Level Tree &rarr;
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ─── CONCEPT DETAIL INSPECTOR DRAWER / MODAL ─── */}
      {selectedConcept && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setSelectedConcept(null)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="concept-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 sm:p-5 bg-[var(--surface-2)]/50 border-b border-[var(--border)] flex items-start justify-between gap-3">
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20">
                    {selectedConcept.category}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase",
                      difficultyColors[selectedConcept.difficulty]?.bg,
                      difficultyColors[selectedConcept.difficulty]?.text,
                      difficultyColors[selectedConcept.difficulty]?.border
                    )}
                  >
                    {selectedConcept.difficulty}
                  </span>
                  {currentConceptIndex >= 0 && (
                    <span className="text-[10px] font-mono text-[var(--muted-foreground)] px-2 py-0.5 rounded-md bg-[var(--surface-2)] border border-[var(--border)]">
                      {currentConceptIndex + 1} of {visibleConceptsList.length}
                    </span>
                  )}
                </div>
                <h3 id="concept-modal-title" className="text-base sm:text-xl font-bold text-[var(--foreground)] tracking-tight">
                  {selectedConcept.term}
                </h3>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Prev / Next buttons in header */}
                <div className="flex items-center rounded-xl bg-[var(--surface-2)] border border-[var(--border)] p-0.5">
                  <button
                    type="button"
                    onClick={handlePrevConcept}
                    disabled={!hasPrevConcept}
                    className={cn(
                      "p-1.5 rounded-lg text-[var(--muted-foreground)] transition-colors",
                      hasPrevConcept
                        ? "hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] cursor-pointer"
                        : "opacity-30 cursor-not-allowed"
                    )}
                    title="Previous Concept (ArrowLeft)"
                    aria-label="Previous Concept"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextConcept}
                    disabled={!hasNextConcept}
                    className={cn(
                      "p-1.5 rounded-lg text-[var(--muted-foreground)] transition-colors",
                      hasNextConcept
                        ? "hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] cursor-pointer"
                        : "opacity-30 cursor-not-allowed"
                    )}
                    title="Next Concept (ArrowRight)"
                    aria-label="Next Concept"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleBookmarkToggle(selectedConcept)}
                  className="p-2 rounded-xl text-[var(--muted-foreground)] hover:text-amber-400 hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                  title="Bookmark Concept"
                  aria-label="Bookmark Concept"
                >
                  {bookmarkedIds.has(selectedConcept.id) ? (
                    <BookmarkCheck size={16} className="text-amber-400" />
                  ) : (
                    <Bookmark size={16} />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleCopyDefinition(selectedConcept)}
                  className="p-2 rounded-xl text-[var(--muted-foreground)] hover:text-emerald-400 hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                  title="Copy Definition"
                  aria-label="Copy Definition"
                >
                  {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedConcept(null)}
                  className="p-2 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                  title="Close Inspector"
                  aria-label="Close Inspector"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
                  <BookOpen size={12} /> Official Definition
                </span>
                <p className="text-sm text-[var(--foreground)] font-medium leading-relaxed bg-[var(--surface-2)]/60 p-3 rounded-xl border border-[var(--border)]">
                  {selectedConcept.definition}
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={12} /> Architectural Mechanics &amp; Context
                </span>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                  {selectedConcept.explanation}
                </p>
              </div>

              {selectedConcept.keyPoints && selectedConcept.keyPoints.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[var(--border)]">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 size={12} /> Key Engineering Points &amp; Trade-offs
                  </span>
                  <ul className="space-y-1.5">
                    {selectedConcept.keyPoints.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-[var(--foreground)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Footer with Cross-Platform Links and Navigation */}
            <div className="p-3.5 sm:p-4 bg-[var(--surface-2)]/50 border-t border-[var(--border)] flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={`/qa-prep?q=${encodeURIComponent(selectedConcept.term)}`}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-colors inline-flex items-center gap-1.5"
                >
                  <HelpCircle size={13} />
                  <span>Practice in Q&amp;A</span>
                </Link>
                <Link
                  href={`/architecture?tab=scenarios&q=${encodeURIComponent(selectedConcept.term)}`}
                  className="px-3 py-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors inline-flex items-center gap-1.5"
                >
                  <Layers size={13} />
                  <span>Architecture Scenarios</span>
                </Link>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrevConcept}
                  disabled={!hasPrevConcept}
                  className={cn(
                    "px-2.5 py-1.5 rounded-xl border border-[var(--border)] text-xs font-semibold inline-flex items-center gap-1 transition-colors",
                    hasPrevConcept
                      ? "bg-[var(--surface-2)] text-[var(--foreground)] hover:bg-[var(--surface-3)] cursor-pointer"
                      : "opacity-30 cursor-not-allowed text-[var(--muted-foreground)] bg-transparent"
                  )}
                  title="Previous Concept (ArrowLeft)"
                >
                  <ChevronLeft size={13} />
                  <span>Prev</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextConcept}
                  disabled={!hasNextConcept}
                  className={cn(
                    "px-2.5 py-1.5 rounded-xl border border-[var(--border)] text-xs font-semibold inline-flex items-center gap-1 transition-colors",
                    hasNextConcept
                      ? "bg-[var(--surface-2)] text-[var(--foreground)] hover:bg-[var(--surface-3)] cursor-pointer"
                      : "opacity-30 cursor-not-allowed text-[var(--muted-foreground)] bg-transparent"
                  )}
                  title="Next Concept (ArrowRight)"
                >
                  <span>Next</span>
                  <ChevronRight size={13} />
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedConcept(null)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                >
                  Close (Esc)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
