"use client";

import { CONTENT_COUNTS, formatContentCount } from "@/data/content-counts";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Layers,
  MessageSquare,
  BookOpen,
  Code2,
  FileCode2,
  Sparkles,
  Route,
  Building2,
  ExternalLink,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  Filter,
  ArrowRight,
  Cpu,
  Zap,
  SlidersHorizontal,
  ChevronRight,
  Maximize2,
  Minimize2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { SearchResultItem, TopicIdentification, NavigationalJump } from "@/lib/search-types";
import type { SearchResponse } from "@/lib/search-engine";
import type { ResolvedKnowledgeItem } from "@/lib/content-resolver";
import { EvidenceSources } from "@/components/ui/evidence-sources";
import dynamic from "next/dynamic";

const AnswerRenderer = dynamic(
  () => import("@/components/ui/answer-renderer").then((mod) => mod.AnswerRenderer),
  { ssr: false }
);

const CodeBlock = dynamic(
  () => import("@/components/ui/code-block").then((mod) => mod.CodeBlock),
  { ssr: false }
);

const CATEGORY_TABS = [
  { id: "All", label: "All Categories", icon: Layers },
  { id: "Q&A Prep", label: "Q&A Prep", icon: MessageSquare, color: "text-amber-400" },
  { id: "Architecture", label: "Architecture", icon: Cpu, color: "text-purple-400" },
  { id: "Concepts", label: "Concepts", icon: BookOpen, color: "text-emerald-400" },
  { id: "Code Practice", label: "Code Practice", icon: Code2, color: "text-cyan-400" },
  { id: "Cheat Sheets", label: "Cheat Sheets", icon: FileCode2, color: "text-blue-400" },
  { id: "Blueprints", label: "Blueprints", icon: Sparkles, color: "text-teal-400" },
  { id: "Guided Track", label: "Guided Tracks", icon: Route, color: "text-indigo-400" },
  { id: "Companies", label: "Companies", icon: Building2, color: "text-rose-400" },
];

const SUGGESTED_QUERIES = [
  "How do you handle data skew in Spark?",
  "Adaptive Query Execution (AQE)",
  "Delta Lake ACID & Time Travel",
  "Fabric OneLake vs Synapse DW",
  "Direct Lake VertiPaq Compression",
  "Kafka CDC with Debezium",
  "Kimball Star Schema vs Data Vault 2.0",
  "Liquid Clustering vs Z-Order",
  "Broadcast Hash Join vs Sort Merge Join",
  "Unity Catalog 3-Level Namespace",
  "Apache Airflow Dynamic DAGs",
  "dbt Incremental Models & Snapshots",
];

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  "Q&A Prep": { bg: "bg-amber-500/10", text: "text-amber-500 dark:text-amber-400", border: "border-amber-500/20" },
  "Architecture": { bg: "bg-purple-500/10", text: "text-purple-500 dark:text-purple-400", border: "border-purple-500/20" },
  "Concepts": { bg: "bg-emerald-500/10", text: "text-emerald-500 dark:text-emerald-400", border: "border-emerald-500/20" },
  "Code Practice": { bg: "bg-cyan-500/10", text: "text-cyan-500 dark:text-cyan-400", border: "border-cyan-500/20" },
  "Cheat Sheets": { bg: "bg-blue-500/10", text: "text-blue-500 dark:text-blue-400", border: "border-blue-500/20" },
  "Blueprints": { bg: "bg-teal-500/10", text: "text-teal-500 dark:text-teal-400", border: "border-teal-500/20" },
  "Guided Track": { bg: "bg-indigo-500/10", text: "text-indigo-500 dark:text-indigo-400", border: "border-indigo-500/20" },
  "Companies": { bg: "bg-rose-500/10", text: "text-rose-500 dark:text-rose-400", border: "border-rose-500/20" },
};

function getCategoryIcon(cat: string) {
  switch (cat) {
    case "Q&A Prep": return MessageSquare;
    case "Architecture": return Cpu;
    case "Concepts": return BookOpen;
    case "Code Practice": return Code2;
    case "Cheat Sheets": return FileCode2;
    case "Blueprints": return Sparkles;
    case "Guided Track": return Route;
    case "Companies": return Building2;
    default: return Layers;
  }
}

export function SearchTopicsClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialQ = searchParams.get("q") || "";
  const initialCat = searchParams.get("category") || "All";
  const initialCardId = searchParams.get("id") || "";

  const [query, setQuery] = useState(initialQ);
  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [sortBy, setSortBy] = useState<"relevance" | "category" | "title">("relevance");

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCounts, setPageCounts] = useState<Record<string, number>>({});
  const [identifiedTopics, setIdentifiedTopics] = useState<TopicIdentification[]>([]);
  const [navigationalJump, setNavigationalJump] = useState<NavigationalJump | null>(null);

  // Expanded items state: Set of catalog IDs
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    return initialCardId ? new Set([initialCardId]) : new Set();
  });

  // Cached full details for expanded items
  const [detailsCache, setDetailsCache] = useState<Record<string, ResolvedKnowledgeItem>>({});
  const [loadingDetails, setLoadingDetails] = useState<Record<string, boolean>>({});

  // Bookmarks
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  // Copied state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Pagination / progressive batch rendering
  const [visibleCount, setVisibleCount] = useState(30);

  const inputRef = useRef<HTMLInputElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Load saved bookmarks from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("search_topics_bookmarks");
      if (saved) {
        setBookmarkedIds(new Set(JSON.parse(saved)));
      }
    } catch {}
  }, []);

  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast.info("Removed from saved items");
      } else {
        next.add(id);
        toast.success("Saved to your local bookmarks");
      }
      try {
        localStorage.setItem("search_topics_bookmarks", JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

  const handleCopy = (id: string, text: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Keyboard shortcut: '/' focuses search, 'Esc' clears
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === "Escape" && document.activeElement === inputRef.current) {
        setQuery("");
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Execute search via API or search engine
  const executeSearch = useCallback(
    async (q: string, category: string) => {
      const trimmed = q.trim();
      if (!trimmed) {
        setResults([]);
        setTotalCount(0);
        setIdentifiedTopics([]);
        setPageCounts({});
        setNavigationalJump(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const catParam = category !== "All" ? `&category=${encodeURIComponent(category)}` : "";
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}${catParam}&limit=100`);
        if (res.ok) {
          const data: SearchResponse = await res.json();
          setResults(data.items || []);
          setTotalCount(data.total || 0);
          setPageCounts(data.pageCounts || {});
          setIdentifiedTopics(data.identifiedTopics || []);
          setNavigationalJump(data.navigationalJump || null);
          setVisibleCount(30);
        }
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Debounced search trigger & URL sync
  useEffect(() => {
    const timer = setTimeout(() => {
      executeSearch(query, selectedCategory);

      // Sync URL params without triggering full reload
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (selectedCategory && selectedCategory !== "All") params.set("category", selectedCategory);
      const newUrl = params.toString() ? `/search-topics?${params.toString()}` : "/search-topics";
      window.history.replaceState(null, "", newUrl);
    }, 180);

    return () => clearTimeout(timer);
  }, [query, selectedCategory, executeSearch]);

  // Fetch full details when an item is expanded
  const fetchItemDetails = useCallback(
    async (catalogId: string, category?: string) => {
      if (detailsCache[catalogId] || loadingDetails[catalogId]) return;

      setLoadingDetails((prev) => ({ ...prev, [catalogId]: true }));
      try {
        const catQuery = category ? `&category=${encodeURIComponent(category)}` : "";
        const res = await fetch(`/api/search/item?id=${encodeURIComponent(catalogId)}${catQuery}`);
        if (res.ok) {
          const item: ResolvedKnowledgeItem = await res.json();
          setDetailsCache((prev) => ({ ...prev, [catalogId]: item }));
        }
      } catch (err) {
        console.warn(`Failed to fetch details for ${catalogId}:`, err);
      } finally {
        setLoadingDetails((prev) => ({ ...prev, [catalogId]: false }));
      }
    },
    [detailsCache, loadingDetails]
  );

  // Toggle single item accordion expansion
  const toggleExpand = (catalogId: string, category?: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(catalogId)) {
        next.delete(catalogId);
      } else {
        next.add(catalogId);
        fetchItemDetails(catalogId, category);
      }
      return next;
    });
  };

  // Expand / Collapse all visible items
  const toggleExpandAll = async () => {
    const visibleItems = sortedResults.slice(0, visibleCount);
    const allExpanded = visibleItems.every((item) => expandedIds.has(item.id));

    if (allExpanded) {
      setExpandedIds(new Set());
    } else {
      const newSet = new Set(expandedIds);
      const idsToFetch: string[] = [];
      visibleItems.forEach((item) => {
        newSet.add(item.id);
        if (!detailsCache[item.id]) idsToFetch.push(item.id);
      });
      setExpandedIds(newSet);

      if (idsToFetch.length > 0) {
        try {
          const res = await fetch("/api/search/item", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: idsToFetch }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.items) {
              setDetailsCache((prev) => ({ ...prev, ...data.items }));
            }
          }
        } catch (err) {
          console.warn("Batch fetch error:", err);
        }
      }
    }
  };

  // Auto-fetch if initial card was provided in URL
  useEffect(() => {
    if (initialCardId) {
      fetchItemDetails(initialCardId);
    }
  }, [initialCardId, fetchItemDetails]);

  // Infinite scroll intersection observer
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 30, results.length));
        }
      },
      { rootMargin: "400px" }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [results.length]);

  // Filter and sort results
  const sortedResults = useMemo(() => {
    const list = [...results];
    if (sortBy === "category") {
      list.sort((a, b) => a.category.localeCompare(b.category));
    } else if (sortBy === "title") {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }
    return list;
  }, [results, sortBy]);

  const visibleResults = sortedResults.slice(0, visibleCount);

  return (
    <div className="space-y-6">
      {/* 1. Header Hero Banner */}
      <div className="flex flex-col gap-2 pt-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-[11px] font-semibold text-blue-500 dark:text-blue-400 w-fit">
          <Sparkles size={12} />
          <span>Instant Knowledge Base Search &amp; Inline Reader</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--foreground)]">
              Search Topics
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-0.5 max-w-2xl">
              Ask any question, keyword, or sentence across {formatContentCount(CONTENT_COUNTS.searchDocuments)} catalog items. Expand and read architectural answers, trade-offs, and code inline.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-[var(--muted-foreground)] px-2.5 py-1 bg-[var(--surface-2)] rounded-md border border-[var(--border)]">
              {formatContentCount(CONTENT_COUNTS.searchDocuments)} Catalog Items
            </span>
          </div>
        </div>
      </div>

      {/* 2. Unified Search Input Box */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 sm:p-4 shadow-sm space-y-3">
        <div className="relative flex items-center">
          <Search size={16} className="absolute left-3.5 text-blue-500 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask a question or search topics (e.g. 'How do you handle data skew in Spark?', 'Liquid clustering', 'AQE')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-24 py-2.5 text-xs sm:text-sm bg-[var(--surface-1)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
          />
          <div className="absolute right-3 flex items-center gap-1.5">
            {query && (
              <button
                onClick={() => setQuery("")}
                className="p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded transition-colors"
                title="Clear query (Esc)"
              >
                <X size={14} />
              </button>
            )}
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-[var(--surface-3)] text-[var(--muted-foreground)] rounded border border-[var(--border)] font-mono">
              /
            </kbd>
          </div>
        </div>

        {/* Suggested Quick Search Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-[11px] font-semibold text-[var(--muted-foreground)] whitespace-nowrap flex items-center gap-1">
            <Zap size={11} className="text-amber-400" /> Suggestions:
          </span>
          {SUGGESTED_QUERIES.map((sq) => (
            <button
              key={sq}
              onClick={() => setQuery(sq)}
              className={cn(
                "px-2.5 py-1 text-[11px] rounded-md font-medium whitespace-nowrap transition-colors border",
                query === sq
                  ? "bg-blue-500/20 border-blue-500 text-blue-400"
                  : "bg-[var(--surface-1)] border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
              )}
            >
              {sq}
            </button>
          ))}
        </div>

        {/* Category Filter Pills Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-[var(--border)] no-scrollbar">
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md font-medium whitespace-nowrap transition-all border",
                  isSelected
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-[var(--surface-1)] border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
                )}
              >
                <Icon size={12} className={isSelected ? "text-white" : tab.color} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Topic Intelligence Banner (If topic recognized) */}
      {identifiedTopics.length > 0 && query.trim().length > 0 && (
        <div className="rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xl">{identifiedTopics[0].icon}</span>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  {identifiedTopics[0].domain} · Primary Topic
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
                {identifiedTopics[0].label}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed max-w-3xl">
                {identifiedTopics[0].executiveSummary || identifiedTopics[0].description}
              </p>
            </div>
            <Link
              href={identifiedTopics[0].href}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white whitespace-nowrap transition-all shadow-sm w-fit"
            >
              <span>Explore Guided Track</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      )}

      {/* 4. Navigational Jump Banner (If strong tool/route intent detected) */}
      {navigationalJump && query.trim().length > 0 && (
        <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Sparkles size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-[var(--foreground)]">
                Direct Jump: {navigationalJump.title}
              </div>
              <div className="text-[11px] text-[var(--muted-foreground)]">
                {navigationalJump.description}
              </div>
            </div>
          </div>
          <Link
            href={navigationalJump.href}
            className="px-3 py-1 text-xs font-semibold rounded-md bg-blue-600 hover:bg-blue-500 text-white whitespace-nowrap transition-colors"
          >
            Open {navigationalJump.page}
          </Link>
        </div>
      )}

      {/* 5. Results Status & Action Bar */}
      {query.trim().length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-1 py-1 text-xs text-[var(--muted-foreground)] border-b border-[var(--border)] pb-2.5">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[var(--foreground)]">
              {loading ? "Searching..." : `Found ${totalCount.toLocaleString()} matching items`}
            </span>
            {totalCount > 0 && (
              <span className="text-[11px] text-[var(--muted-foreground)]">
                (Showing top {Math.min(visibleCount, totalCount)})
              </span>
            )}
          </div>

          {totalCount > 0 && (
            <div className="flex items-center gap-3">
              <button
                onClick={toggleExpandAll}
                className="flex items-center gap-1 text-[11px] font-medium text-blue-500 hover:text-blue-400 transition-colors"
              >
                {visibleResults.every((item) => expandedIds.has(item.id)) ? (
                  <>
                    <Minimize2 size={12} />
                    <span>Collapse All</span>
                  </>
                ) : (
                  <>
                    <Maximize2 size={12} />
                    <span>Expand All</span>
                  </>
                )}
              </button>

              <div className="h-3 w-px bg-[var(--border)]" />

              <div className="flex items-center gap-1.5">
                <SlidersHorizontal size={12} />
                <span>Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-[var(--surface-1)] border border-[var(--border)] rounded px-1.5 py-0.5 text-[11px] text-[var(--foreground)] focus:outline-none"
                >
                  <option value="relevance">Relevance</option>
                  <option value="category">Category</option>
                  <option value="title">Title A-Z</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. Results List or Empty State */}
      {query.trim().length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto">
            <Search size={22} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[var(--foreground)]">
              Ready to Explore the Knowledge Base
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] max-w-md mx-auto">
              Type any single word, multi-word term, or complete question above to see matching topics with full answers and explanations you can read directly on this page.
            </p>
          </div>
          <div className="pt-2 flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
            {CATEGORY_TABS.filter((t) => t.id !== "All").map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setSelectedCategory(tab.id);
                    setQuery(tab.id);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md bg-[var(--surface-2)] border border-[var(--border)] hover:bg-[var(--surface-3)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                >
                  <Icon size={12} className={tab.color} />
                  <span>Browse {tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-2 animate-pulse"
            >
              <div className="flex items-center gap-2">
                <div className="h-5 w-20 bg-[var(--surface-2)] rounded" />
                <div className="h-5 w-28 bg-[var(--surface-2)] rounded" />
              </div>
              <div className="h-5 w-3/4 bg-[var(--surface-2)] rounded" />
              <div className="h-4 w-1/2 bg-[var(--surface-2)] rounded" />
            </div>
          ))}
        </div>
      ) : visibleResults.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
            <Filter size={20} />
          </div>
          <h3 className="text-sm font-bold text-[var(--foreground)]">No matching results found</h3>
          <p className="text-xs text-[var(--muted-foreground)] max-w-md mx-auto">
            We couldn&apos;t find items matching &ldquo;{query}&rdquo; in category &ldquo;{selectedCategory}&rdquo;. Try broader terms like &ldquo;Spark&rdquo;, &ldquo;Delta Lake&rdquo;, or &ldquo;Architecture&rdquo;.
          </p>
          <button
            onClick={() => {
              setSelectedCategory("All");
              setQuery("");
            }}
            className="px-3 py-1.5 text-xs rounded-md bg-blue-600 text-white font-medium hover:bg-blue-500 transition-colors"
          >
            Reset Search
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleResults.map((item) => {
            const isExpanded = expandedIds.has(item.id);
            const isBookmarked = bookmarkedIds.has(item.id);
            const isCopied = copiedId === item.id;
            const details = detailsCache[item.id];
            const isLoadingDetail = loadingDetails[item.id];

            const CategoryIcon = getCategoryIcon(item.category);
            const catStyle = CATEGORY_STYLES[item.category] || {
              bg: "bg-blue-500/10",
              text: "text-blue-400",
              border: "border-blue-500/20",
            };

            return (
              <div
                key={item.id}
                className={cn(
                  "rounded-xl border transition-all duration-150 overflow-hidden",
                  isExpanded
                    ? "border-blue-500/40 bg-[var(--card)] shadow-md"
                    : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--border)]/80 hover:bg-[var(--surface-1)]/40"
                )}
              >
                {/* Card Header / Summary Row */}
                <div
                  onClick={(e) => toggleExpand(item.id, item.category, e)}
                  className="p-3 sm:p-4 cursor-pointer select-none space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Category Pill */}
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                          catStyle.bg,
                          catStyle.text,
                          catStyle.border
                        )}
                      >
                        <CategoryIcon size={11} />
                        <span>{item.category}</span>
                      </span>

                      {/* Source Page Pill */}
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[var(--surface-2)] text-[var(--muted-foreground)] border border-[var(--border)]">
                        {item.page}
                      </span>

                      {/* Badge (Difficulty / Subdomain) */}
                      {item.badge && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/20">
                          {item.badge}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleCopy(item.id, item.title, e)}
                        className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded transition-colors"
                        title="Copy title"
                      >
                        {isCopied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
                      </button>

                      <button
                        onClick={(e) => toggleBookmark(item.id, e)}
                        className={cn(
                          "p-1.5 rounded transition-colors",
                          isBookmarked
                            ? "text-amber-400"
                            : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                        )}
                        title={isBookmarked ? "Saved" : "Save bookmark"}
                      >
                        {isBookmarked ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
                      </button>

                      <Link
                        href={item.href}
                        className="p-1.5 text-[var(--muted-foreground)] hover:text-blue-400 rounded transition-colors"
                        title="Open in dedicated Hub page"
                        target="_blank"
                      >
                        <ExternalLink size={13} />
                      </Link>

                      <button
                        onClick={(e) => toggleExpand(item.id, item.category, e)}
                        className="p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded ml-1 transition-transform"
                        title={isExpanded ? "Collapse" : "Expand"}
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Title / Question */}
                  <h3 className="text-xs sm:text-sm font-bold text-[var(--foreground)] hover:text-blue-500 transition-colors leading-snug">
                    {item.title}
                  </h3>

                  {/* Snippet Preview (When Collapsed) */}
                  {!isExpanded && item.snippet && (
                    <p className="text-[11px] sm:text-xs text-[var(--muted-foreground)] line-clamp-2 leading-relaxed">
                      {item.snippet}
                    </p>
                  )}

                  {/* Read inline prompt button */}
                  {!isExpanded && (
                    <div className="pt-1 flex items-center justify-between">
                      <span className="text-[11px] font-medium text-blue-500 hover:underline flex items-center gap-1">
                        <span>Click to read full content inline</span>
                        <ChevronRight size={11} />
                      </span>
                      {item.score > 0 && (
                        <span className="text-[10px] text-[var(--muted-foreground)] font-mono">
                          Relevance: {item.score}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Inline Expanded Content Drawer */}
                {isExpanded && (
                  <div className="border-t border-[var(--border)] bg-[var(--surface-1)] p-4 sm:p-5 space-y-4">
                    {isLoadingDetail ? (
                      <div className="py-6 text-center space-y-2">
                        <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent" />
                        <div className="text-xs text-[var(--muted-foreground)]">
                          Loading detailed architectural content...
                        </div>
                      </div>
                    ) : details ? (
                      <div className="space-y-4 text-xs sm:text-sm">
                        {/* 1. Q&A PREP CONTENT */}
                        {details.category === "Q&A Prep" && details.details && (
                          <div className="space-y-3">
                            {details.details.tags && details.details.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 text-[10px]">
                                {details.details.tags.map((tag, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-0.5 bg-[var(--surface-2)] text-[var(--muted-foreground)] rounded border border-[var(--border)] font-medium"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            {details.details.answer && (
                              <div className="space-y-2">
                                <div className="text-[11px] font-bold uppercase tracking-wider text-blue-500">
                                  Verified Solution &amp; Answer
                                </div>
                                <div className="text-[var(--foreground)] leading-relaxed rounded-lg p-3 bg-[var(--card)] border border-[var(--border)]">
                                  <AnswerRenderer text={details.details.answer} />
                                </div>
                              </div>
                            )}

                            {details.details.rubricPoints && details.details.rubricPoints.length > 0 && (
                              <div className="rounded-lg p-3 bg-amber-500/5 border border-amber-500/20 space-y-1.5">
                                <div className="text-[11px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1">
                                  <CheckCircle2 size={12} />
                                  <span>Interview Scoring Rubric Points</span>
                                </div>
                                <ul className="list-disc pl-4 space-y-1 text-xs text-[var(--foreground)]">
                                  {details.details.rubricPoints.map((pt, i) => (
                                    <li key={i}>{pt}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {details.details.companyTargets && details.details.companyTargets.length > 0 && (
                              <div className="flex items-center gap-1.5 flex-wrap text-[11px] pt-1">
                                <span className="text-[var(--muted-foreground)] font-semibold flex items-center gap-1">
                                  <Building2 size={12} /> Asked by:
                                </span>
                                {details.details.companyTargets.map((c, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--foreground)] font-medium border border-[var(--border)]"
                                  >
                                    {c}
                                  </span>
                                ))}
                              </div>
                            )}

                            <EvidenceSources sources={details.details.sources} className="pt-2" />
                          </div>
                        )}

                        {/* 2. ARCHITECTURE SCENARIO CONTENT */}
                        {details.category === "Architecture" && details.details && (
                          <div className="space-y-3">
                            {details.details.problemStatement && (
                              <div className="space-y-1">
                                <div className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
                                  Scenario &amp; Problem Statement
                                </div>
                                <p className="text-xs text-[var(--foreground)] bg-[var(--card)] p-3 rounded-lg border border-[var(--border)] leading-relaxed">
                                  {details.details.problemStatement}
                                </p>
                              </div>
                            )}

                            {details.details.constraints && details.details.constraints.length > 0 && (
                              <div className="rounded-lg p-3 bg-purple-500/5 border border-purple-500/20 space-y-1">
                                <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
                                  Technical Constraints &amp; Scale Invariants
                                </div>
                                <ul className="list-disc pl-4 space-y-1 text-xs text-[var(--foreground)]">
                                  {details.details.constraints.map((c, i) => (
                                    <li key={i}>{c}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {details.details.architectureSolution && (
                              <div className="space-y-1.5">
                                <div className="text-[11px] font-bold uppercase tracking-wider text-blue-500">
                                  Architectural Blueprint &amp; Implementation
                                </div>
                                <div className="text-[var(--foreground)] bg-[var(--card)] p-3 rounded-lg border border-[var(--border)] leading-relaxed">
                                  <AnswerRenderer text={details.details.architectureSolution} />
                                </div>
                              </div>
                            )}

                            {details.details.tradeoffs && details.details.tradeoffs.length > 0 && (
                              <div className="rounded-lg p-3 bg-amber-500/5 border border-amber-500/20 space-y-1">
                                <div className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">
                                  Architectural Trade-offs &amp; Alternatives Evaluated
                                </div>
                                <ul className="list-disc pl-4 space-y-1 text-xs text-[var(--foreground)]">
                                  {details.details.tradeoffs.map((t, i) => (
                                    <li key={i}>{t}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            <EvidenceSources sources={details.details.sources} className="pt-2" />
                          </div>
                        )}

                        {/* 3. CONCEPTS CONTENT */}
                        {details.category === "Concepts" && details.details && (
                          <div className="space-y-3">
                            {details.details.definition && (
                              <div className="rounded-lg p-3 bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                                <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                                  Formal Definition
                                </div>
                                <p className="text-xs sm:text-sm font-medium text-[var(--foreground)] leading-relaxed">
                                  {details.details.definition}
                                </p>
                              </div>
                            )}

                            {details.details.explanation && (
                              <div className="space-y-1.5">
                                <div className="text-[11px] font-bold uppercase tracking-wider text-blue-500">
                                  Deep-Dive Internals &amp; Mechanisms
                                </div>
                                <div className="text-[var(--foreground)] bg-[var(--card)] p-3 rounded-lg border border-[var(--border)] leading-relaxed">
                                  <AnswerRenderer text={details.details.explanation} />
                                </div>
                              </div>
                            )}

                            {details.details.keyPoints && details.details.keyPoints.length > 0 && (
                              <div className="rounded-lg p-3 bg-[var(--card)] border border-[var(--border)] space-y-1">
                                <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--foreground)]">
                                  Architectural Invariants &amp; Rules
                                </div>
                                <ul className="list-disc pl-4 space-y-1 text-xs text-[var(--muted-foreground)]">
                                  {details.details.keyPoints.map((kp, i) => (
                                    <li key={i}>{kp}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            <EvidenceSources sources={details.details.sources} className="pt-2" />
                          </div>
                        )}

                        {/* 4. CODE PRACTICE CONTENT */}
                        {details.category === "Code Practice" && details.details && (
                          <div className="space-y-3">
                            {details.details.description && (
                              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                                {details.details.description}
                              </p>
                            )}

                            {details.details.code && (
                              <div className="space-y-1">
                                <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                                  {details.details.language || "Code"} Solution
                                </div>
                                <div className="rounded-lg overflow-hidden border border-[var(--border)]">
                                  <CodeBlock
                                    code={details.details.code}
                                    language={(details.details.language || "python").toLowerCase()}
                                  />
                                </div>
                              </div>
                            )}

                            {details.details.use_case && (
                              <div className="rounded-lg p-3 bg-[var(--card)] border border-[var(--border)]">
                                <div className="text-[11px] font-bold text-[var(--foreground)] uppercase tracking-wider">
                                  Production Use Case
                                </div>
                                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                                  {details.details.use_case}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* 5. CHEAT SHEET CONTENT */}
                        {details.category === "Cheat Sheets" && details.details && (
                          <div className="space-y-3">
                            {details.details.problem && (
                              <div className="rounded-lg p-3 bg-[var(--card)] border border-[var(--border)]">
                                <div className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
                                  Incident / Problem
                                </div>
                                <p className="text-xs text-[var(--foreground)] mt-0.5">
                                  {details.details.problem}
                                </p>
                              </div>
                            )}

                            {details.details.solution && (
                              <div className="space-y-1">
                                <div className="text-[11px] font-bold text-[var(--foreground)] uppercase tracking-wider">
                                  Remediation Commands / Script
                                </div>
                                <div className="rounded-lg overflow-hidden border border-[var(--border)]">
                                  <CodeBlock
                                    code={details.details.solution}
                                    language="python"
                                  />
                                </div>
                              </div>
                            )}

                            {details.details.whyItMatters && (
                              <div className="rounded-lg p-3 bg-amber-500/10 border border-amber-500/20 text-xs">
                                <span className="font-bold text-amber-400">Why It Matters: </span>
                                <span className="text-[var(--foreground)]">{details.details.whyItMatters}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* 6. BLUEPRINT CONTENT */}
                        {details.category === "Blueprints" && details.details && (
                          <div className="space-y-3">
                            {details.details.subtitle && (
                              <p className="text-xs font-semibold text-teal-400">
                                {details.details.subtitle}
                              </p>
                            )}

                            {details.details.description && (
                              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                                {details.details.description}
                              </p>
                            )}

                            {details.details.keyPoints && details.details.keyPoints.length > 0 && (
                              <div className="rounded-lg p-3 bg-[var(--card)] border border-[var(--border)] space-y-1">
                                <div className="text-[11px] font-bold text-teal-400 uppercase tracking-wider">
                                  Core Architectural Pillars
                                </div>
                                <ul className="list-disc pl-4 space-y-1 text-xs text-[var(--foreground)]">
                                  {details.details.keyPoints.map((kp, i) => (
                                    <li key={i}>{kp}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {details.details.technicalMechanisms && details.details.technicalMechanisms.length > 0 && (
                              <div className="rounded-lg p-3 bg-[var(--card)] border border-[var(--border)] space-y-1">
                                <div className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
                                  Under-the-Hood Technical Mechanisms
                                </div>
                                <ul className="list-disc pl-4 space-y-1 text-xs text-[var(--muted-foreground)]">
                                  {details.details.technicalMechanisms.map((mech: any, i: number) => (
                                    <li key={i}>{typeof mech === "string" ? mech : `${mech.title}: ${mech.detail}`}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {details.details.personaBreakdown && (
                              <div className="rounded-lg p-3 bg-[var(--card)] border border-[var(--border)] space-y-2">
                                <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
                                  5-Role Perspective Analysis
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                  {Object.entries(details.details.personaBreakdown).map(([role, take]) => (
                                    <div key={role} className="p-2 rounded bg-[var(--surface-2)]">
                                      <span className="font-bold capitalize text-blue-400">{role}: </span>
                                      <span className="text-[var(--muted-foreground)]">{take}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* 7. COMPANY PROFILE CONTENT */}
                        {details.category === "Companies" && details.details && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              {details.details.location && (
                                <div className="p-2.5 rounded-lg bg-[var(--card)] border border-[var(--border)]">
                                  <span className="text-[var(--muted-foreground)]">Location: </span>
                                  <span className="font-semibold text-[var(--foreground)]">{details.details.location}</span>
                                </div>
                              )}
                              {details.details.architectSalary && (
                                <div className="p-2.5 rounded-lg bg-[var(--card)] border border-[var(--border)]">
                                  <span className="text-[var(--muted-foreground)]">Architect Band: </span>
                                  <span className="font-semibold text-green-400">{details.details.architectSalary}</span>
                                </div>
                              )}
                            </div>

                            {details.details.stack && details.details.stack.length > 0 && (
                              <div className="space-y-1">
                                <div className="text-[11px] font-bold text-[var(--foreground)] uppercase tracking-wider">
                                  Tech Stack
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {details.details.stack.map((s, i) => (
                                    <span key={i} className="px-2 py-0.5 rounded bg-[var(--surface-2)] text-[11px] text-[var(--foreground)] font-medium border border-[var(--border)]">
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {details.details.sampleQuestions && details.details.sampleQuestions.length > 0 && (
                              <div className="rounded-lg p-3 bg-rose-500/10 border border-rose-500/20 space-y-1">
                                <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">
                                  Real Interview Scenarios Asked
                                </div>
                                <ul className="list-disc pl-4 space-y-1 text-xs text-[var(--foreground)]">
                                  {details.details.sampleQuestions.map((q, i) => (
                                    <li key={i}>{q}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}

                        {/* 8. GUIDED TRACK CONTENT */}
                        {details.category === "Guided Track" && details.details && (
                          <div className="space-y-3">
                            {details.details.description && (
                              <p className="text-xs text-[var(--foreground)] leading-relaxed">
                                {details.details.description}
                              </p>
                            )}
                            {details.details.executiveSummary && (
                              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed italic border-l-2 border-indigo-500 pl-2.5 py-0.5 bg-indigo-500/5 rounded-r">
                                &ldquo;{details.details.executiveSummary}&rdquo;
                              </p>
                            )}
                            <EvidenceSources sources={details.details.sources} className="pt-1" />
                          </div>
                        )}

                        {/* Footer row with direct Hub link */}
                        <div className="pt-2 flex items-center justify-between border-t border-[var(--border)] text-[11px]">
                          <span className="text-[var(--muted-foreground)]">
                            Full asset verified across the Lakehouse Architect knowledge base.
                          </span>
                          <Link
                            href={details.href || item.href}
                            className="font-semibold text-blue-500 hover:text-blue-400 flex items-center gap-1"
                          >
                            <span>Open in {item.page}</span>
                            <ExternalLink size={12} />
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="py-4 text-center text-xs text-[var(--muted-foreground)]">
                        Detailed content preview could not be loaded. You can view it directly on the{" "}
                        <Link href={item.href} className="text-blue-400 underline font-medium">
                          {item.page}
                        </Link>{" "}
                        page.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Sentinel for infinite scroll */}
          <div ref={sentinelRef} className="h-6" />

          {/* Load More Fallback Button */}
          {visibleCount < sortedResults.length && (
            <div className="pt-2 text-center">
              <button
                onClick={() => setVisibleCount((prev) => Math.min(prev + 40, sortedResults.length))}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--foreground)] border border-[var(--border)] transition-colors"
              >
                Load More (+40) · {sortedResults.length - visibleCount} Remaining
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
