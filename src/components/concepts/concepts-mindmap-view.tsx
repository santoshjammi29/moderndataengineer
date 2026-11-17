"use client";

import { CONTENT_COUNTS, formatContentCount } from "@/data/content-counts";
import React, { useState, useMemo, useCallback, useRef } from "react";
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
  Info,
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

/**
 * Generates an organic, flexible S-curve or curved spline between two coordinates.
 * Dynamically bends and flexes as nodes are dragged freely across the canvas.
 */
function getOrganicFlexibleSpline(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  direction: "left" | "right" | "radial" = "radial"
): string {
  const dx = x2 - x1;
  const dy = y2 - y1;

  if (direction === "radial") {
    // Subtle organic quadratic curve
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    // Bow slightly outward for a hand-crafted brainstorm spline
    const perpX = -dy * 0.12;
    const perpY = dx * 0.12;
    const cpX = midX + perpX;
    const cpY = midY + perpY;
    return `M ${x1},${y1} Q ${cpX},${cpY} ${x2},${y2}`;
  }

  // Bilateral S-curve:
  const absDx = Math.max(Math.abs(dx), 24);
  const curvature = Math.max(absDx * 0.48, 16);
  const cp1X = x1 + (direction === "left" ? -curvature : curvature);
  const cp1Y = y1;
  const cp2X = x2 + (direction === "left" ? curvature : -curvature);
  const cp2Y = y2;
  return `M ${x1},${y1} C ${cp1X},${cp1Y} ${cp2X},${cp2Y} ${x2},${y2}`;
}

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
  const [mindmapStyle, setMindmapStyle] = useState<"bilateral" | "radial">("bilateral");
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Free movement offsets for draggable nodes (nodeId -> { x, y })
  const [nodeOffsets, setNodeOffsets] = useState<Record<string, { x: number; y: number }>>({});
  const draggingNodeRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    hasMoved: boolean;
  } | null>(null);
  const justDraggedRef = useRef<boolean>(false);

  const handleNodeMouseDown = useCallback(
    (e: React.MouseEvent, nodeId: string) => {
      if (e.button !== 0) return; // Left click only
      const target = e.target as HTMLElement;
      // Do not drag if clicking an inner action button (e.g. Info modal button) or input
      if (
        target.closest("input, select, textarea, a") ||
        (target.closest("button") && target.closest("button") !== e.currentTarget)
      ) {
        return;
      }
      e.stopPropagation(); // Prevent canvas panning

      const currentOffset = nodeOffsets[nodeId] || { x: 0, y: 0 };
      draggingNodeRef.current = {
        id: nodeId,
        startX: e.clientX,
        startY: e.clientY,
        initialX: currentOffset.x,
        initialY: currentOffset.y,
        hasMoved: false,
      };
    },
    [nodeOffsets]
  );

  const handleResetNodePositions = useCallback(() => {
    setNodeOffsets({});
    toast.info("Node positions reset to automatic distribution");
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button, input, a, select, [role='dialog']")) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
  }, [panOffset]);

  // Window-level mouse tracking for buttery-smooth dragging of nodes & canvas
  React.useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (draggingNodeRef.current) {
        const dx = (e.clientX - draggingNodeRef.current.startX) / zoomLevel;
        const dy = (e.clientY - draggingNodeRef.current.startY) / zoomLevel;

        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
          draggingNodeRef.current.hasMoved = true;
          justDraggedRef.current = true;
        }

        const targetId = draggingNodeRef.current.id;
        const newX = draggingNodeRef.current.initialX + dx;
        const newY = draggingNodeRef.current.initialY + dy;

        setNodeOffsets((prev) => ({
          ...prev,
          [targetId]: { x: Math.round(newX), y: Math.round(newY) },
        }));
        return;
      }

      if (isDragging) {
        setPanOffset({
          x: e.clientX - dragStartRef.current.x,
          y: e.clientY - dragStartRef.current.y,
        });
      }
    };

    const handleGlobalMouseUp = () => {
      if (draggingNodeRef.current) {
        if (draggingNodeRef.current.hasMoved) {
          setTimeout(() => {
            justDraggedRef.current = false;
          }, 80);
        }
        draggingNodeRef.current = null;
      }
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isDragging, zoomLevel]);

  const handleResetZoom = useCallback(() => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  const handleFitScreen = useCallback(() => {
    let optimalZoom = 0.7;
    if (stretchDepth === 1) optimalZoom = 1.0;
    else if (stretchDepth === 2) optimalZoom = 0.85;
    else optimalZoom = mindmapStyle === "radial" ? 0.58 : 0.68;
    setZoomLevel(optimalZoom);
    setPanOffset({ x: 0, y: 0 });
    toast.info(`Adjusted zoom to ${Math.round(optimalZoom * 100)}% to fit screen`);
  }, [stretchDepth, mindmapStyle]);

  // Expanded nodes state
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [expandedSubtopics, setExpandedSubtopics] = useState<Set<string>>(new Set());

  // Selected Concept for Detail Inspector
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);

  // Definitions toggle state: reveal definitions inline across Level 1, 2, and 3
  const [definitionsVisible, setDefinitionsVisible] = useState<boolean>(false);

  // Selected Topic Pillar for Domain Definition Inspector Dialog
  const [selectedTopicInfo, setSelectedTopicInfo] = useState<ConceptTopicPillar | null>(null);

  // Selected Subtopic Pillar for Subtopic Definition Inspector Dialog
  const [selectedSubtopicInfo, setSelectedSubtopicInfo] = useState<{
    topic: ConceptTopicPillar;
    subtopic: ConceptSubtopicPillar;
  } | null>(null);
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
    if (expandedTopics.size === 0 && stretchDepth > 1) {
      setExpandedTopics(new Set(fullTree.map((t) => t.id)));
      const initialSubs = new Set<string>();
      // Expand subtopics for initial visible state
      fullTree.forEach((t) => {
        t.subtopics.forEach((s) => initialSubs.add(s.id));
      });
      setExpandedSubtopics(initialSubs);
    }
  }, [fullTree, expandedTopics.size, stretchDepth]);

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

  // Keyboard navigation when focus mode / modal / fullscreen is open
  React.useEffect(() => {
    if (!selectedConcept && !selectedTopicInfo && !selectedSubtopicInfo && !isFullscreen) return;

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
        if (selectedConcept) setSelectedConcept(null);
        else if (selectedTopicInfo) setSelectedTopicInfo(null);
        else if (selectedSubtopicInfo) setSelectedSubtopicInfo(null);
        else if (isFullscreen) setIsFullscreen(false);
      } else if (e.key === "ArrowLeft" && selectedConcept) {
        e.preventDefault();
        handlePrevConcept();
      } else if (e.key === "ArrowRight" && selectedConcept) {
        e.preventDefault();
        handleNextConcept();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedConcept, selectedTopicInfo, selectedSubtopicInfo, isFullscreen, handlePrevConcept, handleNextConcept]);

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
        /* ─── CANVA-INSPIRED ORGANIC BRAINSTORM MIND MAP (ONLY NAMES) ─── */
        <div
          className={cn(
            "rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] overflow-hidden shadow-xs transition-all",
            isFullscreen && "fixed inset-0 z-50 rounded-none bg-[var(--background)] p-3 sm:p-5 flex flex-col overflow-hidden"
          )}
        >
          {/* Canvas Control Toolbar */}
          <div className="p-3 sm:p-4 bg-[var(--surface-2)]/70 border-b border-[var(--border)] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 font-semibold">
                <Network size={13} />
                <span>Linked Mind Map Topology</span>
              </div>
              <span className="hidden sm:inline text-[var(--muted-foreground)]">•</span>
              <span className="text-[var(--muted-foreground)] text-[11px]">
                Showing <strong className="text-[var(--foreground)]">{totalVisibleConcepts}</strong> concept names linked across <strong className="text-[var(--foreground)]">{filteredTree.length}</strong> domains
              </span>
            </div>

            {/* Canvas Actions & Mindmap Style Switcher */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Brainstorm Style Switcher */}
              <div className="inline-flex items-center gap-0.5 p-0.5 rounded-lg bg-[var(--surface-1)] border border-[var(--border)] text-xs">
                <button
                  type="button"
                  onClick={() => setMindmapStyle("bilateral")}
                  className={cn(
                    "px-2 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer",
                    mindmapStyle === "bilateral"
                      ? "bg-purple-600 text-white shadow-2xs"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  )}
                  title="Bilateral Organic Brainstorm (Canva Style)"
                  aria-label="Bilateral Flow"
                >
                  Bilateral Flow
                </button>
                <button
                  type="button"
                  onClick={() => setMindmapStyle("radial")}
                  className={cn(
                    "px-2 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer",
                    mindmapStyle === "radial"
                      ? "bg-purple-600 text-white shadow-2xs"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  )}
                  title="360° Radial Starburst Orbit"
                  aria-label="Radial Orbit"
                >
                  Radial Orbit
                </button>
              </div>

              {/* Level Minimizing & Expanding Options */}
              <div className="inline-flex items-center gap-0.5 p-0.5 rounded-lg bg-[var(--surface-1)] border border-[var(--border)] text-xs">
                <button
                  type="button"
                  onClick={() => handleDepthChange(1)}
                  className={cn(
                    "px-2 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer",
                    stretchDepth === 1
                      ? "bg-purple-600 text-white shadow-2xs font-bold"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  )}
                  title="Minimize to Level 1 Domains Only"
                  aria-label="Minimize to Level 1"
                >
                  L1 Only
                </button>
                <button
                  type="button"
                  onClick={() => handleDepthChange(2)}
                  className={cn(
                    "px-2 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer",
                    stretchDepth === 2
                      ? "bg-purple-600 text-white shadow-2xs font-bold"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  )}
                  title="Expand to Level 2 Subtopic Pillars"
                  aria-label="Expand to Level 2"
                >
                  L2 Pillars
                </button>
                <button
                  type="button"
                  onClick={() => handleDepthChange(3)}
                  className={cn(
                    "px-2 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer",
                    stretchDepth >= 3
                      ? "bg-purple-600 text-white shadow-2xs font-bold"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  )}
                  title="Expand to Level 3 All Concepts"
                  aria-label="Expand All to Level 3"
                >
                  All Levels
                </button>
              </div>

              {/* 3-Level Definitions Toggle Switch */}
              <button
                type="button"
                onClick={() => setDefinitionsVisible((v) => !v)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5 border",
                  definitionsVisible
                    ? "bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-2xs font-bold ring-1 ring-amber-400/30"
                    : "bg-[var(--surface-1)] border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
                )}
                title="Toggle 3-Level Definitions preview (Level 1 Domains, Level 2 Subtopics, Level 3 Concepts)"
                aria-label="Toggle Definitions"
              >
                <BookOpen size={12} className={definitionsVisible ? "text-amber-400" : ""} />
                <span>{definitionsVisible ? "Definitions: ON" : "Show Definitions"}</span>
              </button>

              {/* Zoom controls */}
              <div className="flex items-center gap-0.5 px-1 py-0.5 rounded-lg bg-[var(--surface-1)] border border-[var(--border)] text-xs">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.5))}
                  className="p-1 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] cursor-pointer"
                  title="Zoom Out"
                  aria-label="Zoom Out"
                >
                  <ZoomOut size={13} />
                </button>
                <span className="text-[11px] font-mono px-1.5 text-[var(--foreground)] min-w-[3rem] text-center font-semibold">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 1.6))}
                  className="p-1 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] cursor-pointer"
                  title="Zoom In"
                  aria-label="Zoom In"
                >
                  <ZoomIn size={13} />
                </button>
                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="p-1 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] cursor-pointer"
                  title="Reset Zoom & Pan (100%)"
                  aria-label="Reset Zoom"
                >
                  <RotateCcw size={13} />
                </button>
                <button
                  type="button"
                  onClick={handleFitScreen}
                  className="p-1 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] cursor-pointer"
                  title="Fit to 14-inch Screen (Auto-Scale)"
                  aria-label="Fit Screen"
                >
                  <Maximize2 size={13} />
                </button>
              </div>

              {/* Reset Dragged Node Positions */}
              {Object.keys(nodeOffsets).length > 0 && (
                <button
                  type="button"
                  onClick={handleResetNodePositions}
                  className="px-2.5 py-1 rounded-lg bg-[var(--surface-1)] border border-purple-500/30 text-[11px] font-semibold text-purple-400 hover:bg-purple-500/10 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  title="Reset custom node positions to automatic distribution"
                  aria-label="Reset Node Positions"
                >
                  <Sparkles size={12} />
                  <span>Reset Nodes</span>
                </button>
              )}

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
                aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
              >
                {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
                <span className="hidden sm:inline">{isFullscreen ? "Exit" : "Fullscreen"}</span>
              </button>
            </div>
          </div>

          {/* Quick Domain Filter Strip */}
          <div className="px-3 py-2 bg-[var(--surface-1)] border-b border-[var(--border)] flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
            <span className="text-[10px] uppercase font-bold text-[var(--muted-foreground)] shrink-0 mr-1">
              Focus Domain:
            </span>
            <button
              type="button"
              onClick={() => handleSelectTopic("ALL")}
              className={cn(
                "px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-all cursor-pointer shrink-0",
                currentTopic === "ALL"
                  ? "bg-purple-600 text-white border-purple-500 shadow-2xs"
                  : "bg-[var(--surface-2)] border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              )}
            >
              All Domains ({fullTree.length})
            </button>
            {fullTree.map((top) => (
              <button
                key={top.id}
                type="button"
                onClick={() => handleSelectTopic(top.categoryKey)}
                className={cn(
                  "px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-all cursor-pointer shrink-0 flex items-center gap-1",
                  currentTopic === top.categoryKey
                    ? "text-white shadow-2xs font-bold"
                    : "bg-[var(--surface-2)] border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                )}
                style={{
                  backgroundColor: currentTopic === top.categoryKey ? top.colorHex : undefined,
                  borderColor: currentTopic === top.categoryKey ? top.colorHex : undefined,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: top.colorHex }}
                />
                <span>{top.categoryKey}</span>
              </button>
            ))}
          </div>

          {/* Organic Mind Map Canvas Area */}
          <div
            className={cn(
              "relative overflow-hidden select-none transition-all",
              isFullscreen
                ? "flex-1 w-full h-full min-h-0 rounded-xl"
                : "h-[580px] sm:h-[620px] max-h-[calc(100vh-250px)] min-h-[480px]",
              isDragging ? "cursor-grabbing" : "cursor-grab"
            )}
            style={{
              backgroundColor: "var(--surface-1)",
              backgroundImage: `radial-gradient(rgba(148, 163, 184, 0.12) 1px, transparent 1px)`,
              backgroundSize: "24px 24px",
            }}
            onMouseDown={handleMouseDown}
          >
            {/* Floating Quick Exit Button in Fullscreen Mode */}
            {isFullscreen && (
              <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded-lg bg-[var(--surface-1)]/90 border border-[var(--border)] text-[var(--muted-foreground)] backdrop-blur-xs shadow-xs">
                  <kbd className="px-1 py-0.5 rounded bg-[var(--surface-2)] text-[10px] font-bold text-[var(--foreground)]">Esc</kbd>
                  <span>to exit</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsFullscreen(false)}
                  className="px-3 py-1.5 rounded-lg bg-[var(--surface-1)]/95 border border-[var(--border)] text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--surface-2)] shadow-md inline-flex items-center gap-1.5 cursor-pointer backdrop-blur-xs transition-colors"
                  title="Exit Fullscreen Mode"
                  aria-label="Exit Fullscreen"
                >
                  <Minimize2 size={13} />
                  <span>Exit Fullscreen</span>
                </button>
              </div>
            )}
            {/* Draggable & Scalable Workspace */}
            <div
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                transformOrigin: "center center",
                transition: isDragging ? "none" : "transform 0.15s ease-out",
              }}
              className="p-8 sm:p-16 min-w-max flex items-center justify-center"
            >
              {mindmapStyle === "bilateral" ? (
                /* ─── BILATERAL BRAINSTORM FLOW (CANVA STYLE WITH 3-LEVEL SUB-BRANCHES) ─── */
                (() => {
                  const leftTopics = filteredTree.slice(0, Math.ceil(filteredTree.length / 2));
                  const rightTopics = filteredTree.slice(Math.ceil(filteredTree.length / 2));

                  const getSubHeight = (sub: ConceptSubtopicPillar) => {
                    const isExp = expandedSubtopics.has(sub.id);
                    if (!isExp || sub.concepts.length === 0) return 50;
                    return Math.max(sub.concepts.length * (definitionsVisible ? 88 : 46), 50);
                  };

                  const getTopicHeight = (top: ConceptTopicPillar) => {
                    const isExp = expandedTopics.has(top.id);
                    if (!isExp || top.subtopics.length === 0) return 60;
                    const sHeights = top.subtopics.map(getSubHeight);
                    return Math.max(
                      sHeights.reduce((a, b) => a + b, 0) + (top.subtopics.length - 1) * 16,
                      60
                    );
                  };

                  const getWingHeight = (wingTopics: ConceptTopicPillar[]) => {
                    if (wingTopics.length === 0) return 240;
                    const heights = wingTopics.map(getTopicHeight);
                    return Math.max(
                      heights.reduce((a, b) => a + b, 0) + (wingTopics.length - 1) * 28,
                      240
                    );
                  };

                  const leftWingHeight = getWingHeight(leftTopics);
                  const rightWingHeight = getWingHeight(rightTopics);

                  const renderConceptPillOrCard = (concept: Concept, topic: ConceptTopicPillar, isLeft: boolean) => {
                    const isSelected = selectedConcept?.id === concept.id;
                    const isBookmarked = bookmarkedIds.has(concept.id);
                    const isMatch = activeSearch.trim() && (
                      concept.term.toLowerCase().includes(activeSearch.toLowerCase()) ||
                      concept.definition.toLowerCase().includes(activeSearch.toLowerCase())
                    );
                    const offset = nodeOffsets[concept.id] || { x: 0, y: 0 };
                    const isNodeDragged = offset.x !== 0 || offset.y !== 0;

                    const dotColor =
                      concept.difficulty === "EASY"
                        ? "bg-emerald-500"
                        : concept.difficulty === "MEDIUM"
                        ? "bg-blue-500"
                        : concept.difficulty === "HARD"
                        ? "bg-amber-500"
                        : "bg-purple-500";

                    const diffMeta = difficultyColors[concept.difficulty] || difficultyColors.MEDIUM;

                    if (definitionsVisible) {
                      return (
                        <div
                          key={concept.id}
                          onMouseDown={(e) => handleNodeMouseDown(e, concept.id)}
                          onClick={(e) => {
                            if (justDraggedRef.current) return;
                            setSelectedConcept(concept);
                          }}
                          className={cn(
                            "rounded-xl p-2.5 border transition-all cursor-grab active:cursor-grabbing select-none space-y-1 text-left shadow-2xs hover:scale-102 active:scale-98 max-w-[260px] relative",
                            isSelected
                              ? "bg-purple-600 text-white border-purple-500 shadow-md ring-2 ring-purple-400/40"
                              : isMatch
                              ? "bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/40 font-bold"
                              : "bg-[var(--surface-1)] border-[var(--border)] hover:border-purple-500/50 hover:bg-[var(--surface-2)]",
                            isNodeDragged && "ring-2 ring-purple-400/50 shadow-md"
                          )}
                          style={{
                            transform: `translate(${offset.x}px, ${offset.y}px)`,
                            [isLeft ? "borderRightColor" : "borderLeftColor"]: !isSelected && !isMatch ? topic.colorHex : undefined,
                            [isLeft ? "borderRightWidth" : "borderLeftWidth"]: !isSelected && !isMatch ? "3px" : undefined,
                          }}
                        >
                          <div className="flex items-center justify-between gap-1.5">
                            <span className={cn("text-xs font-bold truncate", isSelected ? "text-white" : "text-[var(--foreground)]")}>
                              {concept.term}
                            </span>
                            <span
                              className={cn(
                                "text-[8.5px] font-bold px-1.5 py-0.2 rounded-sm border uppercase shrink-0",
                                isSelected
                                  ? "bg-white/20 text-white border-white/30"
                                  : `${diffMeta.bg} ${diffMeta.text} ${diffMeta.border}`
                              )}
                            >
                              {concept.difficulty}
                            </span>
                          </div>
                          <p
                            className={cn(
                              "text-[10px] line-clamp-2 leading-tight",
                              isSelected ? "text-white/90" : "text-[var(--muted-foreground)]"
                            )}
                          >
                            {concept.definition}
                          </p>
                        </div>
                      );
                    }

                    return (
                      <button
                        key={concept.id}
                        type="button"
                        onMouseDown={(e) => handleNodeMouseDown(e, concept.id)}
                        onClick={(e) => {
                          if (justDraggedRef.current) return;
                          setSelectedConcept(concept);
                        }}
                        title={`${concept.term} (${concept.difficulty}): ${concept.definition}`}
                        className={cn(
                          "group/pill inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold transition-all cursor-grab active:cursor-grabbing select-none text-left shadow-2xs hover:scale-105 active:scale-95 relative",
                          isSelected
                            ? "bg-purple-600 text-white border-purple-500 shadow-md ring-2 ring-purple-400/40"
                            : isMatch
                            ? "bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/40 font-bold"
                            : "bg-[var(--surface-1)] border-[var(--border)] text-[var(--foreground)] hover:border-purple-500/50 hover:bg-[var(--surface-2)]",
                          isNodeDragged && "ring-2 ring-purple-400/50 shadow-md"
                        )}
                        style={{
                          transform: `translate(${offset.x}px, ${offset.y}px)`,
                          [isLeft ? "borderRightColor" : "borderLeftColor"]: !isSelected && !isMatch ? topic.colorHex : undefined,
                          [isLeft ? "borderRightWidth" : "borderLeftWidth"]: !isSelected && !isMatch ? "2.5px" : undefined,
                        }}
                      >
                        {isLeft && isBookmarked && (
                          <BookmarkCheck size={11} className="text-amber-400 shrink-0" />
                        )}
                        <span className="truncate max-w-[220px] sm:max-w-none">{concept.term}</span>
                        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColor)} />
                        {!isLeft && isBookmarked && (
                          <BookmarkCheck size={11} className="text-amber-400 shrink-0" />
                        )}
                      </button>
                    );
                  };

                  return (
                    <div className="relative flex items-center justify-center gap-6 sm:gap-10 min-w-max">
                      {/* ─── LEFT WING DOMAINS (BRANCHES & SUB-BRANCHES) ─── */}
                      <div className="flex flex-col justify-around gap-6 items-end shrink-0">
                        {leftTopics.map((topic, tIdx) => {
                          const isTopicExpanded = expandedTopics.has(topic.id);
                          const curTopicHeight = getTopicHeight(topic);

                          return (
                            <div
                              key={topic.id}
                              className="flex items-center justify-end group relative"
                              style={{ minHeight: curTopicHeight }}
                            >
                              {/* Level 3 Concepts & Level 2 Subtopics on Far Left */}
                              {isTopicExpanded && topic.subtopics.length > 0 && (
                                <div className="flex items-center justify-end">
                                  {/* Subtopics Column on Left */}
                                  <div
                                    className="flex flex-col justify-around gap-3.5 py-1 items-end"
                                    style={{ height: curTopicHeight }}
                                  >
                                    {topic.subtopics.map((subtopic) => {
                                      const isSubExpanded = expandedSubtopics.has(subtopic.id);
                                      const curSubHeight = getSubHeight(subtopic);

                                      return (
                                        <div
                                          key={subtopic.id}
                                          className="flex items-center justify-end"
                                          style={{ height: curSubHeight }}
                                        >
                                          {/* Level 3 Concepts (far left) & Organic Sub-Branches */}
                                          {isSubExpanded && subtopic.concepts.length > 0 && (
                                            <div className="flex items-center justify-end">
                                              {/* Vertical Concepts Column */}
                                              <div
                                                className="flex flex-col justify-around items-end gap-2 pr-0.5"
                                                style={{ minHeight: curSubHeight }}
                                              >
                                                {subtopic.concepts.map((concept) =>
                                                  renderConceptPillOrCard(concept, topic, true)
                                                )}
                                              </div>

                                              {/* Level 2 Subtopic -> Level 3 Concepts Flexible Organic Splines */}
                                              <svg
                                                width="48"
                                                height={curSubHeight}
                                                className="shrink-0 pointer-events-none overflow-visible"
                                                style={{ minWidth: 48 }}
                                              >
                                                {subtopic.concepts.map((concept, cIdx) => {
                                                  const K = subtopic.concepts.length;
                                                  const startX = 48;
                                                  const startY = curSubHeight / 2;
                                                  const cOffset = nodeOffsets[concept.id] || { x: 0, y: 0 };
                                                  const endX = 0 + cOffset.x;
                                                  const endY = ((cIdx + 0.5) / K) * curSubHeight + cOffset.y;
                                                  const pathD = getOrganicFlexibleSpline(startX, startY, endX, endY, "left");

                                                  return (
                                                    <g key={concept.id}>
                                                      <path
                                                        d={pathD}
                                                        fill="none"
                                                        stroke={topic.colorHex}
                                                        strokeWidth={definitionsVisible ? "2" : "1.75"}
                                                        strokeLinecap="round"
                                                        className="opacity-75 transition-all"
                                                      />
                                                      <circle cx={endX} cy={endY} r="2.5" fill={topic.colorHex} />
                                                    </g>
                                                  );
                                                })}
                                                <circle cx="48" cy={curSubHeight / 2} r="3" fill={topic.colorHex} />
                                              </svg>
                                            </div>
                                          )}

                                          {/* Level 2 Subtopic Node */}
                                          {(() => {
                                            const sOffset = nodeOffsets[subtopic.id] || { x: 0, y: 0 };
                                            const isSubDragged = sOffset.x !== 0 || sOffset.y !== 0;

                                            return (
                                              <div
                                                onMouseDown={(e) => handleNodeMouseDown(e, subtopic.id)}
                                                onClick={(e) => {
                                                  if (justDraggedRef.current) return;
                                                  toggleSubtopic(subtopic.id);
                                                }}
                                                style={{
                                                  transform: `translate(${sOffset.x}px, ${sOffset.y}px)`,
                                                }}
                                                className={cn(
                                                  "shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all cursor-grab active:cursor-grabbing select-none text-right shadow-2xs group/sub",
                                                  isSubExpanded
                                                    ? "bg-[var(--surface-2)] border-amber-500/60 ring-1 ring-amber-500/30"
                                                    : "bg-[var(--surface-1)] border-[var(--border)] hover:border-amber-500/40",
                                                  isSubDragged && "ring-2 ring-amber-400/50 shadow-md"
                                                )}
                                              >
                                                {/* Subtopic Definition Inspector Info Button */}
                                                <button
                                                  type="button"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedSubtopicInfo({ topic, subtopic });
                                                  }}
                                                  className="p-0.5 rounded text-[var(--muted-foreground)] hover:text-amber-400 cursor-pointer"
                                                  title={`View ${subtopic.title} Subtopic Architecture Definition`}
                                                  aria-label={`View ${subtopic.title} Subtopic Definition`}
                                                >
                                                  <Info size={11} />
                                                </button>
                                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--muted-foreground)] font-semibold">
                                                  {subtopic.concepts.length}
                                                </span>
                                                <div>
                                                  <div className="flex items-center justify-end gap-1.5">
                                                    <span className="text-xs font-semibold text-[var(--foreground)]">
                                                      {subtopic.title}
                                                    </span>
                                                    <span className="text-[9px] font-bold uppercase tracking-wider text-amber-500">
                                                      L2 Subtopic
                                                    </span>
                                                  </div>
                                                  {definitionsVisible && (
                                                    <p className="text-[9.5px] text-[var(--muted-foreground)] line-clamp-1 max-w-[180px] italic leading-tight">
                                                      {subtopic.description}
                                                    </p>
                                                  )}
                                                </div>
                                                <button
                                                  type="button"
                                                  className="p-0.5 rounded text-[var(--muted-foreground)] cursor-pointer"
                                                  aria-label={isSubExpanded ? "Collapse Subtopic" : "Expand Subtopic"}
                                                >
                                                  {isSubExpanded ? <ChevronDown size={12} /> : <ChevronLeft size={12} />}
                                                </button>
                                              </div>
                                            );
                                          })()}
                                        </div>
                                      );
                                    })}
                                  </div>

                                  {/* Level 1 Domain -> Level 2 Subtopics Flexible Branching Splines */}
                                  <svg
                                    width="48"
                                    height={curTopicHeight}
                                    className="shrink-0 pointer-events-none overflow-visible"
                                    style={{ minWidth: 48 }}
                                  >
                                    {topic.subtopics.map((sub, sIdx) => {
                                      let yOffset = 0;
                                      for (let i = 0; i < sIdx; i++) {
                                        yOffset += getSubHeight(topic.subtopics[i]) + 14;
                                      }
                                      const curSubH = getSubHeight(sub);
                                      const startX = 48;
                                      const startY = curTopicHeight / 2;
                                      const sOffset = nodeOffsets[sub.id] || { x: 0, y: 0 };
                                      const endX = 0 + sOffset.x;
                                      const endY = yOffset + curSubH / 2 + sOffset.y;
                                      const pathD = getOrganicFlexibleSpline(startX, startY, endX, endY, "left");

                                      return (
                                        <g key={sub.id}>
                                          <path
                                            d={pathD}
                                            fill="none"
                                            stroke={topic.colorHex}
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            className="opacity-80 transition-opacity"
                                          />
                                          <circle cx={endX} cy={endY} r="3" fill={topic.colorHex} />
                                        </g>
                                      );
                                    })}
                                    <circle cx="48" cy={curTopicHeight / 2} r="3.5" fill={topic.colorHex} />
                                  </svg>
                                </div>
                              )}

                              {/* Level 1 Domain Node */}
                              {(() => {
                                const tOffset = nodeOffsets[topic.id] || { x: 0, y: 0 };
                                const isTopicDragged = tOffset.x !== 0 || tOffset.y !== 0;

                                return (
                                  <div
                                    onMouseDown={(e) => handleNodeMouseDown(e, topic.id)}
                                    onClick={(e) => {
                                      if (justDraggedRef.current) return;
                                      toggleTopic(topic.id);
                                    }}
                                    className={cn(
                                      "shrink-0 flex items-center gap-2.5 px-3.5 py-2 rounded-2xl border-2 transition-all cursor-grab active:cursor-grabbing select-none shadow-sm group",
                                      isTopicExpanded
                                        ? "bg-[var(--surface-2)] shadow-md ring-2 ring-purple-500/20"
                                        : "bg-[var(--surface-1)] hover:border-purple-500/40",
                                      isTopicDragged && "ring-2 ring-purple-400/50 shadow-md"
                                    )}
                                    style={{
                                      transform: `translate(${tOffset.x}px, ${tOffset.y}px)`,
                                      borderColor: topic.colorHex,
                                    }}
                                  >
                                    {/* Domain Definition Inspector Info Button */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedTopicInfo(topic);
                                      }}
                                      className="p-1 rounded-lg text-[var(--muted-foreground)] hover:text-purple-400 hover:bg-[var(--surface-3)] transition-colors cursor-pointer"
                                      title={`View ${topic.title} Domain Definition & Architecture`}
                                      aria-label={`View ${topic.title} Domain Definition`}
                                    >
                                      <Info size={13} />
                                    </button>
                                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--muted-foreground)]">
                                      {topic.matchingCount}
                                    </span>
                                    <div className="text-right">
                                      <div className="flex items-center justify-end gap-1.5">
                                        <span
                                          className="text-[9px] font-semibold px-1.5 py-0.2 rounded-full border"
                                          style={{
                                            backgroundColor: `${topic.colorHex}15`,
                                            color: topic.colorHex,
                                            borderColor: `${topic.colorHex}30`,
                                          }}
                                        >
                                          {topic.categoryKey}
                                        </span>
                                        <span className="text-[9px] font-bold uppercase tracking-wider text-purple-400">
                                          L1 Domain
                                        </span>
                                      </div>
                                      <h3 className="text-xs sm:text-sm font-bold text-[var(--foreground)] tracking-tight">
                                        {topic.title}
                                      </h3>
                                      {definitionsVisible && (
                                        <p className="text-[10px] text-[var(--muted-foreground)] line-clamp-2 max-w-[220px] italic leading-tight mt-0.5">
                                          {topic.description}
                                        </p>
                                      )}
                                    </div>
                                    <div
                                      className="p-1.5 rounded-xl border text-white shadow-xs shrink-0"
                                      style={{ backgroundColor: `${topic.colorHex}25`, borderColor: `${topic.colorHex}50` }}
                                    >
                                      <TopicIcon topic={topic.icon} size={16} />
                                    </div>
                                    <button
                                      type="button"
                                      className="p-0.5 rounded text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] cursor-pointer"
                                      aria-label={isTopicExpanded ? "Collapse Domain" : "Expand Domain"}
                                    >
                                      {isTopicExpanded ? <ChevronDown size={14} /> : <ChevronLeft size={14} />}
                                    </button>
                                  </div>
                                );
                              })()}
                            </div>
                          );
                        })}
                      </div>

                      {/* Left SVG Branching Splines from Central Hub to Left Domains */}
                      <svg
                        width="56"
                        height={leftWingHeight}
                        className="shrink-0 pointer-events-none overflow-visible"
                        style={{ minWidth: 56 }}
                      >
                        {leftTopics.map((lt, lIdx) => {
                          let yOffset = 0;
                          for (let i = 0; i < lIdx; i++) {
                            yOffset += getTopicHeight(leftTopics[i]) + 24;
                          }
                          const curTopH = getTopicHeight(lt);
                          const startX = 56;
                          const startY = leftWingHeight / 2;
                          const tOffset = nodeOffsets[lt.id] || { x: 0, y: 0 };
                          const endX = 0 + tOffset.x;
                          const endY = yOffset + curTopH / 2 + tOffset.y;
                          const pathD = getOrganicFlexibleSpline(startX, startY, endX, endY, "left");

                          return (
                            <g key={lt.id}>
                              <path
                                d={pathD}
                                fill="none"
                                stroke={lt.colorHex}
                                strokeWidth="3"
                                strokeLinecap="round"
                                className="opacity-80 transition-opacity"
                              />
                              <circle cx={endX} cy={endY} r="3.5" fill={lt.colorHex} />
                            </g>
                          );
                        })}
                        <circle cx="56" cy={leftWingHeight / 2} r="4" fill="#a855f7" />
                      </svg>

                      {/* ─── LEVEL 0: CENTRAL CORE ROOT HUB (CANVA ORG ROOT) ─── */}
                      <div className="shrink-0 relative z-20 flex flex-col items-center px-2">
                        <div className="relative p-5 sm:p-6 rounded-3xl bg-[var(--surface-1)] border-2 border-purple-500/50 shadow-2xl text-center max-w-[280px] space-y-2.5 ring-4 ring-purple-500/10">
                          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
                            <Network size={26} />
                          </div>
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-wider">
                            Level 0 • Platform Core
                          </div>
                          <h2 className="text-base sm:text-lg font-extrabold text-[var(--foreground)] tracking-tight leading-snug">
                            Enterprise Data &amp; Lakehouse Platform
                          </h2>
                          <div className="text-xs font-mono font-semibold text-[var(--muted-foreground)]">
                            {totalVisibleConcepts} Concepts • {filteredTree.length} Domains
                          </div>
                        </div>
                      </div>

                      {/* Right SVG Branching Splines from Central Hub to Right Domains */}
                      <svg
                        width="56"
                        height={rightWingHeight}
                        className="shrink-0 pointer-events-none overflow-visible"
                        style={{ minWidth: 56 }}
                      >
                        {rightTopics.map((rt, rIdx) => {
                          let yOffset = 0;
                          for (let i = 0; i < rIdx; i++) {
                            yOffset += getTopicHeight(rightTopics[i]) + 24;
                          }
                          const curTopH = getTopicHeight(rt);
                          const startX = 0;
                          const startY = rightWingHeight / 2;
                          const tOffset = nodeOffsets[rt.id] || { x: 0, y: 0 };
                          const endX = 56 + tOffset.x;
                          const endY = yOffset + curTopH / 2 + tOffset.y;
                          const pathD = getOrganicFlexibleSpline(startX, startY, endX, endY, "right");

                          return (
                            <g key={rt.id}>
                              <path
                                d={pathD}
                                fill="none"
                                stroke={rt.colorHex}
                                strokeWidth="3"
                                strokeLinecap="round"
                                className="opacity-80 transition-opacity"
                              />
                              <circle cx={endX} cy={endY} r="3.5" fill={rt.colorHex} />
                            </g>
                          );
                        })}
                        <circle cx="0" cy={rightWingHeight / 2} r="4" fill="#a855f7" />
                      </svg>

                      {/* ─── RIGHT WING DOMAINS (BRANCHES & SUB-BRANCHES) ─── */}
                      <div className="flex flex-col justify-around gap-6 items-start shrink-0">
                        {rightTopics.map((topic, tIdx) => {
                          const isTopicExpanded = expandedTopics.has(topic.id);
                          const curTopicHeight = getTopicHeight(topic);

                          return (
                            <div
                              key={topic.id}
                              className="flex items-center group relative"
                              style={{ minHeight: curTopicHeight }}
                            >
                              {/* Level 1 Domain Node */}
                              {(() => {
                                const tOffset = nodeOffsets[topic.id] || { x: 0, y: 0 };
                                const isTopicDragged = tOffset.x !== 0 || tOffset.y !== 0;

                                return (
                                  <div
                                    onMouseDown={(e) => handleNodeMouseDown(e, topic.id)}
                                    onClick={(e) => {
                                      if (justDraggedRef.current) return;
                                      toggleTopic(topic.id);
                                    }}
                                    className={cn(
                                      "shrink-0 flex items-center gap-2.5 px-3.5 py-2 rounded-2xl border-2 transition-all cursor-grab active:cursor-grabbing select-none shadow-sm group",
                                      isTopicExpanded
                                        ? "bg-[var(--surface-2)] shadow-md ring-2 ring-purple-500/20"
                                        : "bg-[var(--surface-1)] hover:border-purple-500/40",
                                      isTopicDragged && "ring-2 ring-purple-400/50 shadow-md"
                                    )}
                                    style={{
                                      transform: `translate(${tOffset.x}px, ${tOffset.y}px)`,
                                      borderColor: topic.colorHex,
                                    }}
                                  >
                                    <button
                                      type="button"
                                      className="p-0.5 rounded text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] cursor-pointer"
                                      aria-label={isTopicExpanded ? "Collapse Domain" : "Expand Domain"}
                                    >
                                      {isTopicExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                    </button>
                                    <div
                                      className="p-1.5 rounded-xl border text-white shadow-xs shrink-0"
                                      style={{ backgroundColor: `${topic.colorHex}25`, borderColor: `${topic.colorHex}50` }}
                                    >
                                      <TopicIcon topic={topic.icon} size={16} />
                                    </div>
                                    <div className="text-left">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[9px] font-bold uppercase tracking-wider text-purple-400">
                                          L1 Domain
                                        </span>
                                        <span
                                          className="text-[9px] font-semibold px-1.5 py-0.2 rounded-full border"
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
                                      {definitionsVisible && (
                                        <p className="text-[10px] text-[var(--muted-foreground)] line-clamp-2 max-w-[220px] italic leading-tight mt-0.5">
                                          {topic.description}
                                        </p>
                                      )}
                                    </div>
                                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--muted-foreground)]">
                                      {topic.matchingCount}
                                    </span>
                                    {/* Domain Definition Inspector Info Button */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedTopicInfo(topic);
                                      }}
                                      className="p-1 rounded-lg text-[var(--muted-foreground)] hover:text-purple-400 hover:bg-[var(--surface-3)] transition-colors cursor-pointer"
                                      title={`View ${topic.title} Domain Definition & Architecture`}
                                      aria-label={`View ${topic.title} Domain Definition`}
                                    >
                                      <Info size={13} />
                                    </button>
                                  </div>
                                );
                              })()}

                              {/* Level 2 Subtopics & Level 3 Concepts on Right */}
                              {isTopicExpanded && topic.subtopics.length > 0 && (
                                <div className="flex items-center">
                                  {/* Level 1 Domain -> Level 2 Subtopics Flexible Branching Splines */}
                                  <svg
                                    width="48"
                                    height={curTopicHeight}
                                    className="shrink-0 pointer-events-none overflow-visible"
                                    style={{ minWidth: 48 }}
                                  >
                                    {topic.subtopics.map((sub, sIdx) => {
                                      let yOffset = 0;
                                      for (let i = 0; i < sIdx; i++) {
                                        yOffset += getSubHeight(topic.subtopics[i]) + 14;
                                      }
                                      const curSubH = getSubHeight(sub);
                                      const startX = 0;
                                      const startY = curTopicHeight / 2;
                                      const sOffset = nodeOffsets[sub.id] || { x: 0, y: 0 };
                                      const endX = 48 + sOffset.x;
                                      const endY = yOffset + curSubH / 2 + sOffset.y;
                                      const pathD = getOrganicFlexibleSpline(startX, startY, endX, endY, "right");

                                      return (
                                        <g key={sub.id}>
                                          <path
                                            d={pathD}
                                            fill="none"
                                            stroke={topic.colorHex}
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            className="opacity-80 transition-opacity"
                                          />
                                          <circle cx={endX} cy={endY} r="3" fill={topic.colorHex} />
                                        </g>
                                      );
                                    })}
                                    <circle cx="0" cy={curTopicHeight / 2} r="3.5" fill={topic.colorHex} />
                                  </svg>

                                  {/* Subtopics Column on Right */}
                                  <div
                                    className="flex flex-col justify-around gap-3.5 py-1"
                                    style={{ height: curTopicHeight }}
                                  >
                                    {topic.subtopics.map((subtopic) => {
                                      const isSubExpanded = expandedSubtopics.has(subtopic.id);
                                      const curSubHeight = getSubHeight(subtopic);

                                      return (
                                        <div
                                          key={subtopic.id}
                                          className="flex items-center"
                                          style={{ height: curSubHeight }}
                                        >
                                          {/* Level 2 Subtopic Node */}
                                          {(() => {
                                            const sOffset = nodeOffsets[subtopic.id] || { x: 0, y: 0 };
                                            const isSubDragged = sOffset.x !== 0 || sOffset.y !== 0;

                                            return (
                                              <div
                                                onMouseDown={(e) => handleNodeMouseDown(e, subtopic.id)}
                                                onClick={(e) => {
                                                  if (justDraggedRef.current) return;
                                                  toggleSubtopic(subtopic.id);
                                                }}
                                                style={{
                                                  transform: `translate(${sOffset.x}px, ${sOffset.y}px)`,
                                                }}
                                                className={cn(
                                                  "shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all cursor-grab active:cursor-grabbing select-none text-left shadow-2xs group/sub",
                                                  isSubExpanded
                                                    ? "bg-[var(--surface-2)] border-amber-500/60 ring-1 ring-amber-500/30"
                                                    : "bg-[var(--surface-1)] border-[var(--border)] hover:border-amber-500/40",
                                                  isSubDragged && "ring-2 ring-amber-400/50 shadow-md"
                                                )}
                                              >
                                                <button
                                                  type="button"
                                                  className="p-0.5 rounded text-[var(--muted-foreground)] cursor-pointer"
                                                  aria-label={isSubExpanded ? "Collapse Subtopic" : "Expand Subtopic"}
                                                >
                                                  {isSubExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                                </button>
                                                <div>
                                                  <div className="flex items-center gap-1.5">
                                                    <span className="text-[9px] font-bold uppercase tracking-wider text-amber-500">
                                                      L2 Subtopic
                                                    </span>
                                                    <span className="text-xs font-semibold text-[var(--foreground)]">
                                                      {subtopic.title}
                                                    </span>
                                                  </div>
                                                  {definitionsVisible && (
                                                    <p className="text-[9.5px] text-[var(--muted-foreground)] line-clamp-1 max-w-[180px] italic leading-tight">
                                                      {subtopic.description}
                                                    </p>
                                                  )}
                                                </div>
                                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--muted-foreground)] font-semibold">
                                                  {subtopic.concepts.length}
                                                </span>
                                                {/* Subtopic Definition Inspector Info Button */}
                                                <button
                                                  type="button"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedSubtopicInfo({ topic, subtopic });
                                                  }}
                                                  className="p-0.5 rounded text-[var(--muted-foreground)] hover:text-amber-400 cursor-pointer"
                                                  title={`View ${subtopic.title} Subtopic Architecture Definition`}
                                                  aria-label={`View ${subtopic.title} Subtopic Definition`}
                                                >
                                                  <Info size={11} />
                                                </button>
                                              </div>
                                            );
                                          })()}

                                          {/* Level 2 Subtopic -> Level 3 Concepts Flexible Organic Splines */}
                                          {isSubExpanded && subtopic.concepts.length > 0 && (
                                            <div className="flex items-center">
                                              <svg
                                                width="48"
                                                height={curSubHeight}
                                                className="shrink-0 pointer-events-none overflow-visible"
                                                style={{ minWidth: 48 }}
                                              >
                                                {subtopic.concepts.map((concept, cIdx) => {
                                                  const K = subtopic.concepts.length;
                                                  const startX = 0;
                                                  const startY = curSubHeight / 2;
                                                  const cOffset = nodeOffsets[concept.id] || { x: 0, y: 0 };
                                                  const endX = 48 + cOffset.x;
                                                  const endY = ((cIdx + 0.5) / K) * curSubHeight + cOffset.y;
                                                  const pathD = getOrganicFlexibleSpline(startX, startY, endX, endY, "right");

                                                  return (
                                                    <g key={concept.id}>
                                                      <path
                                                        d={pathD}
                                                        fill="none"
                                                        stroke={topic.colorHex}
                                                        strokeWidth={definitionsVisible ? "2" : "1.75"}
                                                        strokeLinecap="round"
                                                        className="opacity-75 transition-all"
                                                      />
                                                      <circle cx={endX} cy={endY} r="2.5" fill={topic.colorHex} />
                                                    </g>
                                                  );
                                                })}
                                                <circle cx="0" cy={curSubHeight / 2} r="3" fill={topic.colorHex} />
                                              </svg>

                                              {/* Vertical Concepts Column */}
                                              <div
                                                className="flex flex-col justify-around items-start gap-2 pl-0.5"
                                                style={{ minHeight: curSubHeight }}
                                              >
                                                {subtopic.concepts.map((concept) =>
                                                  renderConceptPillOrCard(concept, topic, false)
                                                )}
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
                    </div>
                  );
                })()
              ) : (
                /* ─── 360° RADIAL ORBIT STARBURST (CANVA RADIAL WITH 3 MULTI-LEVEL EXPANSION) ─── */
                (() => {
                  const cx = 1100;
                  const cy = 1000;
                  const totalTopics = filteredTree.length;
                  const isAllL1 = expandedTopics.size === 0;
                  const isAllL2Only = expandedTopics.size > 0 && expandedSubtopics.size === 0;

                  // Dynamic radii based on expanded levels (spaced generously to prevent overlapping)
                  const r1 = isAllL1 ? 280 : 230; // Orbit Ring 1: Level 1 Topics
                  const r2 = 450;                  // Orbit Ring 2: Level 2 Subtopics

                  // Build geometry tree for splines and node rendering
                  const radialTree = filteredTree.map((topic, tIdx) => {
                    const tAngle = (tIdx / Math.max(totalTopics, 1)) * 2 * Math.PI - Math.PI / 2;
                    const txBase = cx + r1 * Math.cos(tAngle);
                    const tyBase = cy + r1 * Math.sin(tAngle);
                    const tOffset = nodeOffsets[topic.id] || { x: 0, y: 0 };
                    const tx = txBase + tOffset.x;
                    const ty = tyBase + tOffset.y;

                    const isTopicExp = expandedTopics.has(topic.id);
                    const subCount = topic.subtopics.length;
                    const sectorSpan = (2 * Math.PI / Math.max(totalTopics, 1)) * 0.88;

                    const subtopicsData = topic.subtopics.map((sub, sIdx) => {
                      let sAngle = tAngle;
                      if (subCount > 1) {
                        sAngle = tAngle - sectorSpan / 2 + (sIdx / (subCount - 1)) * sectorSpan;
                      }
                      const sxBase = cx + r2 * Math.cos(sAngle);
                      const syBase = cy + r2 * Math.sin(sAngle);
                      const sOffset = nodeOffsets[sub.id] || { x: 0, y: 0 };
                      const sx = sxBase + sOffset.x;
                      const sy = syBase + sOffset.y;

                      const isSubExp = expandedSubtopics.has(sub.id);
                      // In radial layout, render concepts across 3 staggered concentric shells to guarantee zero stacking
                      const maxVisibleConcepts = 6;
                      const conceptsToRender = sub.concepts.slice(0, maxVisibleConcepts);
                      const cCount = conceptsToRender.length;
                      const cSectorSpan = Math.min(sectorSpan / Math.max(subCount, 1), 0.38);

                      const conceptsData = conceptsToRender.map((concept, cIdx) => {
                        let cAngle = sAngle;
                        if (cCount > 1) {
                          cAngle = sAngle - cSectorSpan / 2 + (cIdx / (cCount - 1)) * cSectorSpan;
                        }
                        // Stagger radiuses across 3 orbital tiers (640px, 780px, 920px)
                        const r3Tier = 640 + (cIdx % 3) * 140;
                        const kxBase = cx + r3Tier * Math.cos(cAngle);
                        const kyBase = cy + r3Tier * Math.sin(cAngle);
                        const cOffset = nodeOffsets[concept.id] || { x: 0, y: 0 };
                        const kx = kxBase + cOffset.x;
                        const ky = kyBase + cOffset.y;

                        return {
                          concept,
                          kx,
                          ky,
                          cAngle,
                          isDragged: cOffset.x !== 0 || cOffset.y !== 0,
                        };
                      });

                      return {
                        sub,
                        sx,
                        sy,
                        sAngle,
                        isSubExp,
                        isDragged: sOffset.x !== 0 || sOffset.y !== 0,
                        hasMoreConcepts: sub.concepts.length > maxVisibleConcepts,
                        remainingCount: sub.concepts.length - maxVisibleConcepts,
                        conceptsData,
                      };
                    });

                    return {
                      topic,
                      tx,
                      ty,
                      tAngle,
                      isTopicExp,
                      isDragged: tOffset.x !== 0 || tOffset.y !== 0,
                      subtopicsData,
                    };
                  });

                  return (
                    <div className="relative w-[2200px] h-[2000px] flex items-center justify-center">
                      {/* Background Orbit Guide Rings */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                        {/* Orbit Ring 1 Guide */}
                        <circle
                          cx={cx}
                          cy={cy}
                          r={r1}
                          fill="none"
                          stroke="rgba(148, 163, 184, 0.12)"
                          strokeWidth="1.5"
                          strokeDasharray="4 4"
                        />
                        {/* Orbit Ring 2 Guide */}
                        {expandedTopics.size > 0 && (
                          <circle
                            cx={cx}
                            cy={cy}
                            r={r2}
                            fill="none"
                            stroke="rgba(148, 163, 184, 0.09)"
                            strokeWidth="1.5"
                            strokeDasharray="6 6"
                          />
                        )}
                        {/* Orbit Tiered Shell Guides */}
                        {expandedSubtopics.size > 0 && (
                          <>
                            <circle
                              cx={cx}
                              cy={cy}
                              r={640}
                              fill="none"
                              stroke="rgba(148, 163, 184, 0.06)"
                              strokeWidth="1"
                              strokeDasharray="8 8"
                            />
                            <circle
                              cx={cx}
                              cy={cy}
                              r={780}
                              fill="none"
                              stroke="rgba(148, 163, 184, 0.05)"
                              strokeWidth="1"
                              strokeDasharray="10 10"
                            />
                            <circle
                              cx={cx}
                              cy={cy}
                              r={920}
                              fill="none"
                              stroke="rgba(148, 163, 184, 0.04)"
                              strokeWidth="1"
                              strokeDasharray="12 12"
                            />
                          </>
                        )}

                        {/* Splines Level 0 -> Level 1 */}
                        {radialTree.map(({ topic, tx, ty, isTopicExp, subtopicsData }) => {
                          const splineCoreToTopic = getOrganicFlexibleSpline(cx, cy, tx, ty, "radial");

                          return (
                            <g key={topic.id}>
                              <path
                                d={splineCoreToTopic}
                                fill="none"
                                stroke={topic.colorHex}
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                className="opacity-75"
                              />
                              <circle cx={tx} cy={ty} r="4" fill={topic.colorHex} />

                              {/* Splines Level 1 -> Level 2 */}
                              {isTopicExp &&
                                subtopicsData.map(({ sub, sx, sy, isSubExp, conceptsData }) => {
                                  const splineTopicToSub = getOrganicFlexibleSpline(tx, ty, sx, sy, "radial");

                                  return (
                                    <g key={sub.id}>
                                      <path
                                        d={splineTopicToSub}
                                        fill="none"
                                        stroke={topic.colorHex}
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        className="opacity-70"
                                      />
                                      <circle cx={sx} cy={sy} r="3" fill={topic.colorHex} />

                                      {/* Splines Level 2 -> Level 3 */}
                                      {isSubExp &&
                                        conceptsData.map(({ concept, kx, ky }) => {
                                          const splineSubToConcept = getOrganicFlexibleSpline(sx, sy, kx, ky, "radial");

                                          return (
                                            <g key={concept.id}>
                                              <path
                                                d={splineSubToConcept}
                                                fill="none"
                                                stroke={topic.colorHex}
                                                strokeWidth="1.25"
                                                strokeLinecap="round"
                                                strokeDasharray="2 2"
                                                className="opacity-60"
                                              />
                                              <circle cx={kx} cy={ky} r="2.5" fill={topic.colorHex} />
                                            </g>
                                          );
                                        })}
                                    </g>
                                  );
                                })}
                            </g>
                          );
                        })}
                      </svg>

                      {/* Central Node at (cx, cy) = (1100, 1000) */}
                      <div
                        style={{
                          position: "absolute",
                          left: `${cx}px`,
                          top: `${cy}px`,
                          transform: "translate(-50%, -50%)",
                        }}
                        className="z-20 flex flex-col items-center"
                      >
                        <div
                          onClick={() => {
                            if (isAllL1) handleDepthChange(3);
                            else handleDepthChange(1);
                          }}
                          className="p-5 sm:p-6 rounded-3xl bg-[var(--surface-1)] border-2 border-purple-500/50 shadow-2xl text-center max-w-[280px] space-y-2 ring-4 ring-purple-500/10 cursor-pointer hover:scale-103 transition-transform"
                          title="Click to toggle expand/collapse all"
                        >
                          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 text-white flex items-center justify-center shadow-md">
                            <Network size={24} />
                          </div>
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-wider">
                            Level 0 • Platform Core
                          </div>
                          <h2 className="text-sm font-extrabold text-[var(--foreground)] tracking-tight leading-tight">
                            Enterprise Data &amp; Lakehouse Platform
                          </h2>
                          <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-[var(--muted-foreground)]">
                            <span>{totalVisibleConcepts} Concepts</span>
                            <span>•</span>
                            <span className="text-purple-400 font-semibold">
                              {isAllL1 ? "L1 Minimal" : isAllL2Only ? "L2 Pillars" : "L3 Full"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Orbit Nodes: Level 1, Level 2, Level 3 */}
                      {radialTree.map(({ topic, tx, ty, isTopicExp, isDragged: isTopicDragged, subtopicsData }) => (
                        <React.Fragment key={topic.id}>
                          {/* ─── LEVEL 1: DOMAIN NODE ─── */}
                          <div
                            onMouseDown={(e) => handleNodeMouseDown(e, topic.id)}
                            style={{
                              position: "absolute",
                              left: `${tx}px`,
                              top: `${ty}px`,
                              transform: "translate(-50%, -50%)",
                            }}
                            className={cn(
                              "z-15 group cursor-grab active:cursor-grabbing",
                              isTopicDragged && "ring-2 ring-purple-400/50 shadow-xl"
                            )}
                          >
                            <div
                              onClick={() => {
                                if (justDraggedRef.current) return;
                                toggleTopic(topic.id);
                              }}
                              className="px-3 py-1.5 rounded-full border-2 bg-[var(--surface-1)] shadow-md hover:scale-105 transition-transform cursor-pointer flex items-center gap-1.5 select-none"
                              style={{ borderColor: topic.colorHex }}
                            >
                              <TopicIcon topic={topic.icon} size={13} />
                              <span className="text-xs font-bold text-[var(--foreground)] whitespace-nowrap">
                                {topic.title}
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[var(--surface-2)] text-[var(--muted-foreground)]">
                                {topic.matchingCount}
                              </span>
                              <span className="text-[var(--muted-foreground)]">
                                {isTopicExp ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTopicInfo(topic);
                                }}
                                className="p-0.5 rounded text-[var(--muted-foreground)] hover:text-purple-400 cursor-pointer"
                                title={`View ${topic.title} Domain Definition`}
                                aria-label={`View ${topic.title} Domain Definition`}
                              >
                                <Info size={11} />
                              </button>
                            </div>
                          </div>

                          {/* ─── LEVEL 2: SUBTOPIC NODES ─── */}
                          {isTopicExp &&
                            subtopicsData.map(
                              ({ sub, sx, sy, isSubExp, isDragged: isSubDragged, conceptsData }) => (
                                <React.Fragment key={sub.id}>
                                  <div
                                    onMouseDown={(e) => handleNodeMouseDown(e, sub.id)}
                                    style={{
                                      position: "absolute",
                                      left: `${sx}px`,
                                      top: `${sy}px`,
                                      transform: "translate(-50%, -50%)",
                                    }}
                                    className={cn(
                                      "z-12 group cursor-grab active:cursor-grabbing",
                                      isSubDragged && "ring-2 ring-amber-400/50 shadow-xl"
                                    )}
                                  >
                                    <div
                                      onClick={() => {
                                        if (justDraggedRef.current) return;
                                        toggleSubtopic(sub.id);
                                      }}
                                      className="px-2.5 py-1 rounded-full border bg-[var(--surface-1)] shadow-sm hover:scale-104 transition-transform cursor-pointer flex items-center gap-1.5 select-none max-w-[200px]"
                                      style={{
                                        borderColor: topic.colorHex,
                                        borderLeftWidth: "3px",
                                      }}
                                    >
                                      <span className="text-[11px] font-bold text-[var(--foreground)] truncate">
                                        {sub.title}
                                      </span>
                                      <span className="text-[9.5px] font-mono px-1 rounded-full bg-[var(--surface-2)] text-[var(--muted-foreground)] shrink-0">
                                        {sub.concepts.length}
                                      </span>
                                      <span className="text-[var(--muted-foreground)] shrink-0">
                                        {isSubExp ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedSubtopicInfo({ topic, subtopic: sub });
                                        }}
                                        className="p-0.5 rounded text-[var(--muted-foreground)] hover:text-blue-400 cursor-pointer shrink-0"
                                        title={`View ${sub.title} Subtopic Definition`}
                                        aria-label={`View ${sub.title} Subtopic Definition`}
                                      >
                                        <Info size={10} />
                                      </button>
                                    </div>
                                  </div>

                                  {/* ─── LEVEL 3: CONCEPT NODES ─── */}
                                  {isSubExp &&
                                    conceptsData.map(({ concept, kx, ky, isDragged: isConceptDragged }) => {
                                      const isSelected = selectedConcept?.id === concept.id;
                                      const isBookmarked = bookmarkedIds.has(concept.id);
                                      const isMatch =
                                        activeSearch.trim() &&
                                        (concept.term.toLowerCase().includes(activeSearch.toLowerCase()) ||
                                          concept.definition.toLowerCase().includes(activeSearch.toLowerCase()));

                                      const dotColor =
                                        concept.difficulty === "EASY"
                                          ? "bg-emerald-500"
                                          : concept.difficulty === "MEDIUM"
                                          ? "bg-blue-500"
                                          : concept.difficulty === "HARD"
                                          ? "bg-amber-500"
                                          : "bg-purple-500";

                                      const diffMeta =
                                        difficultyColors[concept.difficulty] || difficultyColors.MEDIUM;

                                      return (
                                        <div
                                          key={concept.id}
                                          onMouseDown={(e) => handleNodeMouseDown(e, concept.id)}
                                          style={{
                                            position: "absolute",
                                            left: `${kx}px`,
                                            top: `${ky}px`,
                                            transform: "translate(-50%, -50%)",
                                          }}
                                          className={cn(
                                            "z-10 group cursor-grab active:cursor-grabbing",
                                            isConceptDragged && "ring-2 ring-purple-400/50 shadow-xl"
                                          )}
                                        >
                                          {definitionsVisible ? (
                                            <div
                                              onClick={() => {
                                                if (justDraggedRef.current) return;
                                                setSelectedConcept(concept);
                                              }}
                                              className={cn(
                                                "rounded-xl p-2.5 border transition-all select-none space-y-1 text-left shadow-2xs hover:scale-105 active:scale-98 max-w-[210px]",
                                                isSelected
                                                  ? "bg-purple-600 text-white border-purple-500 shadow-md ring-2 ring-purple-400/40"
                                                  : isMatch
                                                  ? "bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/40 font-bold"
                                                  : "bg-[var(--surface-1)] border-[var(--border)] hover:border-purple-500/50 hover:bg-[var(--surface-2)]",
                                                isConceptDragged && "ring-2 ring-purple-400/50 shadow-md"
                                              )}
                                              style={{
                                                borderLeftColor: !isSelected && !isMatch ? topic.colorHex : undefined,
                                                borderLeftWidth: !isSelected && !isMatch ? "3px" : undefined,
                                              }}
                                            >
                                              <div className="flex items-center justify-between gap-1">
                                                <span
                                                  className={cn(
                                                    "text-[11px] font-bold truncate",
                                                    isSelected ? "text-white" : "text-[var(--foreground)]"
                                                  )}
                                                >
                                                  {concept.term}
                                                </span>
                                                <span
                                                  className={cn(
                                                    "text-[8px] font-bold px-1 py-0.2 rounded-sm border uppercase shrink-0",
                                                    isSelected
                                                      ? "bg-white/20 text-white border-white/30"
                                                      : `${diffMeta.bg} ${diffMeta.text} ${diffMeta.border}`
                                                  )}
                                                >
                                                  {concept.difficulty}
                                                </span>
                                              </div>
                                              <p
                                                className={cn(
                                                  "text-[9.5px] line-clamp-2 leading-tight",
                                                  isSelected ? "text-white/90" : "text-[var(--muted-foreground)]"
                                                )}
                                              >
                                                {concept.definition}
                                              </p>
                                            </div>
                                          ) : (
                                            <button
                                              type="button"
                                              onClick={() => {
                                                if (justDraggedRef.current) return;
                                                setSelectedConcept(concept);
                                              }}
                                              title={`${concept.term} (${concept.difficulty}): ${concept.definition}`}
                                              className={cn(
                                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-semibold transition-all select-none text-left shadow-2xs hover:scale-105 active:scale-95 whitespace-nowrap",
                                                isSelected
                                                  ? "bg-purple-600 text-white border-purple-500 shadow-md ring-2 ring-purple-400/40"
                                                  : isMatch
                                                  ? "bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/40 font-bold"
                                                  : "bg-[var(--surface-1)] border-[var(--border)] text-[var(--foreground)] hover:border-purple-500/50 hover:bg-[var(--surface-2)]",
                                                isConceptDragged && "ring-2 ring-purple-400/50 shadow-md"
                                              )}
                                              style={{
                                                borderLeftColor: !isSelected && !isMatch ? topic.colorHex : undefined,
                                                borderLeftWidth: !isSelected && !isMatch ? "2.5px" : undefined,
                                              }}
                                            >
                                              {isBookmarked && (
                                                <BookmarkCheck size={11} className="text-amber-400 fill-amber-400 shrink-0" />
                                              )}
                                              <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColor)} />
                                              <span className="truncate max-w-[140px]">{concept.term}</span>
                                            </button>
                                          )}
                                        </div>
                                      );
                                    })}
                                </React.Fragment>
                              )
                            )}
                        </React.Fragment>
                      ))}
                    </div>
                  );
                })()
              )}
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

      {/* ─── DOMAIN ARCHITECTURAL SCOPE & DEFINITION MODAL ─── */}
      {selectedTopicInfo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setSelectedTopicInfo(null)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="topic-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 sm:p-5 bg-[var(--surface-2)]/50 border-b border-[var(--border)] flex items-start justify-between gap-3">
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400">
                    Level 1 Domain
                  </span>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md border"
                    style={{
                      backgroundColor: `${selectedTopicInfo.colorHex}15`,
                      color: selectedTopicInfo.colorHex,
                      borderColor: `${selectedTopicInfo.colorHex}30`,
                    }}
                  >
                    {selectedTopicInfo.categoryKey}
                  </span>
                  <span className="text-[10px] font-mono text-[var(--muted-foreground)] px-2 py-0.5 rounded-md bg-[var(--surface-2)] border border-[var(--border)]">
                    {selectedTopicInfo.totalCount} Concepts • {selectedTopicInfo.subtopics.length} Pillars
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div
                    className="p-1.5 rounded-xl border text-white shadow-xs shrink-0"
                    style={{
                      backgroundColor: `${selectedTopicInfo.colorHex}25`,
                      borderColor: `${selectedTopicInfo.colorHex}50`,
                    }}
                  >
                    <TopicIcon topic={selectedTopicInfo.icon} size={20} />
                  </div>
                  <h3 id="topic-modal-title" className="text-base sm:text-xl font-bold text-[var(--foreground)] tracking-tight">
                    {selectedTopicInfo.title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTopicInfo(null)}
                className="p-2 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                title="Close Dialog"
                aria-label="Close Dialog"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
              {/* Official Domain Architectural Scope / Definition */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen size={12} /> Domain Architectural Scope &amp; Definition
                </span>
                <p className="text-sm text-[var(--foreground)] font-medium leading-relaxed bg-[var(--surface-2)]/60 p-3.5 rounded-xl border border-[var(--border)]">
                  {selectedTopicInfo.description}
                </p>
              </div>

              {/* Pillars / Subtopics Breakdown */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers size={12} /> Architectural Pillars ({selectedTopicInfo.subtopics.length})
                </span>
                <div className="space-y-2.5">
                  {selectedTopicInfo.subtopics.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-3 rounded-xl bg-[var(--surface-2)]/40 border border-[var(--border)] space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-amber-500">
                            Level 2 Pillar
                          </span>
                          <h4 className="text-xs font-bold text-[var(--foreground)]">{sub.title}</h4>
                        </div>
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-[var(--surface-1)] border border-[var(--border)] text-[var(--muted-foreground)]">
                          {sub.concepts.length} concepts
                        </span>
                      </div>
                      <p className="text-xs text-[var(--muted-foreground)] leading-relaxed italic">
                        {sub.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-1 pt-1">
                        {sub.concepts.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setSelectedTopicInfo(null);
                              setSelectedConcept(c);
                            }}
                            className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[var(--surface-1)] border border-[var(--border)] text-[var(--foreground)] hover:border-purple-500 hover:text-purple-400 transition-colors cursor-pointer"
                          >
                            {c.term}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3.5 sm:p-4 bg-[var(--surface-2)]/50 border-t border-[var(--border)] flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  handleSelectTopic(selectedTopicInfo.categoryKey);
                  setSelectedTopicInfo(null);
                }}
                className="px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 transition-colors cursor-pointer"
              >
                Filter Mind Map to {selectedTopicInfo.shortTitle}
              </button>
              <button
                type="button"
                onClick={() => setSelectedTopicInfo(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── SUBTOPIC ARCHITECTURAL DEFINITION MODAL ─── */}
      {selectedSubtopicInfo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setSelectedSubtopicInfo(null)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="subtopic-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 sm:p-5 bg-[var(--surface-2)]/50 border-b border-[var(--border)] flex items-start justify-between gap-3">
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-500">
                    Level 2 Subtopic Pillar
                  </span>
                  <span className="text-[10px] font-medium text-[var(--muted-foreground)]">
                    under <strong className="text-[var(--foreground)]">{selectedSubtopicInfo.topic.title}</strong>
                  </span>
                  <span className="text-[10px] font-mono text-[var(--muted-foreground)] px-2 py-0.5 rounded-md bg-[var(--surface-2)] border border-[var(--border)]">
                    {selectedSubtopicInfo.subtopic.concepts.length} Concepts
                  </span>
                </div>
                <h3 id="subtopic-modal-title" className="text-base sm:text-xl font-bold text-[var(--foreground)] tracking-tight">
                  {selectedSubtopicInfo.subtopic.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSubtopicInfo(null)}
                className="p-2 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                title="Close Dialog"
                aria-label="Close Dialog"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
              {/* Official Subtopic Architectural Definition */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen size={12} /> Pillar Architectural Definition
                </span>
                <p className="text-sm text-[var(--foreground)] font-medium leading-relaxed bg-[var(--surface-2)]/60 p-3.5 rounded-xl border border-[var(--border)]">
                  {selectedSubtopicInfo.subtopic.description}
                </p>
              </div>

              {/* Concepts under this Subtopic */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={12} /> Level 3 Technical Concepts ({selectedSubtopicInfo.subtopic.concepts.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedSubtopicInfo.subtopic.concepts.map((concept) => (
                    <div
                      key={concept.id}
                      onClick={() => {
                        setSelectedSubtopicInfo(null);
                        setSelectedConcept(concept);
                      }}
                      className="p-2.5 rounded-xl bg-[var(--surface-2)]/50 border border-[var(--border)] hover:border-amber-500/50 transition-all cursor-pointer space-y-1 text-left"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-[var(--foreground)] truncate">{concept.term}</h4>
                        <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-sm bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
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
            </div>

            {/* Footer */}
            <div className="p-3.5 sm:p-4 bg-[var(--surface-2)]/50 border-t border-[var(--border)] flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedSubtopicInfo(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
