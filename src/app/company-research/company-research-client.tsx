"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Building2,
  Search,
  Sparkles,
  Globe,
  MapPin,
  Layers,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Briefcase,
  X,
  SlidersHorizontal,
  ArrowRight,
  TrendingUp,
  LayoutGrid,
  Columns2,
  Table as TableIcon,
  Maximize2,
  RotateCcw,
  Compass,
  ArrowUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TopicIcon } from "@/components/ui/topic-icon";
import type { CompanyProfile, CompanyTier } from "@/types/data";

const POPULAR_TECHS = [
  "All",
  "Apache Spark",
  "Kafka",
  "Databricks",
  "Snowflake",
  "Apache Flink",
  "Apache Iceberg",
  "BigQuery",
  "PostgreSQL",
  "Airflow",
  "dbt",
  "ClickHouse",
  "Cassandra",
  "Microsoft Fabric",
] as const;

const MAJOR_HUBS = [
  "All Hubs",
  "Bengaluru",
  "Hyderabad",
  "Pune",
  "Gurugram",
  "Mumbai",
  "Chennai",
  "Noida",
  "Remote / US",
] as const;

type ViewMode = "grid" | "split" | "table";
type ActiveTab = "prompts" | "interviewFocus" | "challenge";

const ITEMS_PER_PAGE = 24;

function getTierStyle(tier: CompanyTier) {
  switch (tier) {
    case "Tier 1 FAANG / BigTech":
      return {
        badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
        dot: "bg-blue-500",
        label: "Tier 1 BigTech",
      };
    case "Tier 1 Global FinTech":
      return {
        badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        dot: "bg-emerald-500",
        label: "Tier 1 FinTech",
      };
    case "Global Capability Center (GCC)":
    default:
      return {
        badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        dot: "bg-amber-500",
        label: "Enterprise GCC",
      };
  }
}

export function CompanyResearchClient({ initialProfiles }: { initialProfiles: CompanyProfile[] }) {
  const searchParams = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTier, setSelectedTier] = useState<string>("ALL");
  const [selectedTech, setSelectedTech] = useState<string>("All");
  const [selectedHub, setSelectedHub] = useState<string>("All Hubs");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // In-card tabs & modal state
  const [expandedCardTabs, setExpandedCardTabs] = useState<Record<string, ActiveTab | null>>({});
  const [globalExpandPrompts, setGlobalExpandPrompts] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(initialProfiles[0]?.id || "");
  const [modalCompany, setModalCompany] = useState<CompanyProfile | null>(null);

  // Copy indicator state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(ITEMS_PER_PAGE);

  // Table sorting
  const [sortField, setSortField] = useState<"default" | "name" | "tier" | "salary">("default");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Reactively synchronize from searchParams
  useEffect(() => {
    const qParam = searchParams.get("q") || searchParams.get("company") || searchParams.get("search");
    const tierParam = searchParams.get("tier");
    const techParam = searchParams.get("tech");
    const hubParam = searchParams.get("hub");
    const viewParam = searchParams.get("view") as ViewMode | null;

    if (qParam !== null) setSearchQuery(qParam);
    if (tierParam) setSelectedTier(tierParam);
    if (techParam) setSelectedTech(techParam);
    if (hubParam) setSelectedHub(hubParam);
    if (viewParam && ["grid", "split", "table"].includes(viewParam)) {
      setViewMode(viewParam);
    }
  }, [searchParams]);

  // Global Keyboard shortcuts (/ to focus, Esc to clear, Shift+E to expand all prompts)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === "Escape") {
        if (modalCompany) {
          setModalCompany(null);
        } else if (searchQuery) {
          setSearchQuery("");
          searchInputRef.current?.blur();
        }
      } else if (e.shiftKey && (e.key === "E" || e.key === "e")) {
        e.preventDefault();
        setGlobalExpandPrompts((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalCompany, searchQuery]);

  // Counts per tier
  const tierCounts = useMemo(() => {
    const counts = {
      ALL: initialProfiles.length,
      "Tier 1 FAANG / BigTech": 0,
      "Tier 1 Global FinTech": 0,
      "Global Capability Center (GCC)": 0,
    };
    initialProfiles.forEach((c) => {
      if (counts[c.tier] !== undefined) counts[c.tier]++;
    });
    return counts;
  }, [initialProfiles]);

  const handleCopyPrompt = useCallback((key: string, text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  }, []);

  const toggleCardTab = useCallback((companyId: string, tab: ActiveTab) => {
    setExpandedCardTabs((prev) => {
      const current = prev[companyId];
      return {
        ...prev,
        [companyId]: current === tab ? null : tab,
      };
    });
  }, []);

  // Filtered dataset
  const filteredCompanies = useMemo(() => {
    return initialProfiles.filter((c) => {
      // Tier filter
      if (selectedTier !== "ALL" && c.tier !== selectedTier) return false;

      // Tech filter
      if (selectedTech !== "All") {
        const targetTech = selectedTech.toLowerCase();
        const hasTech = c.stack.some((tech) => {
          const t = tech.toLowerCase();
          if (targetTech === "apache spark") return t.includes("spark");
          if (targetTech === "kafka") return t.includes("kafka");
          if (targetTech === "apache flink") return t.includes("flink");
          if (targetTech === "apache iceberg") return t.includes("iceberg");
          if (targetTech === "microsoft fabric") return t.includes("fabric") || t.includes("power bi");
          return t.includes(targetTech);
        });
        if (!hasTech) return false;
      }

      // Hub filter
      if (selectedHub !== "All Hubs") {
        const targetHub = selectedHub.toLowerCase();
        if (targetHub === "remote / us") {
          const isRemoteOrUS =
            c.location.toLowerCase().includes("remote") ||
            c.location.toLowerCase().includes("us") ||
            c.location.toLowerCase().includes("ca") ||
            c.location.toLowerCase().includes("ny") ||
            c.hiringGCCLocations?.some(
              (h) => h.toLowerCase().includes("remote") || h.toLowerCase().includes("global")
            );
          if (!isRemoteOrUS) return false;
        } else {
          const hasHub =
            c.hiringGCCLocations?.some((h) => h.toLowerCase().includes(targetHub)) ||
            c.location.toLowerCase().includes(targetHub);
          if (!hasHub) return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesLocation = c.location.toLowerCase().includes(q);
        const matchesHubs = c.hiringGCCLocations?.some((h) => h.toLowerCase().includes(q));
        const matchesStack = c.stack.some((s) => s.toLowerCase().includes(q));
        const matchesArchetype = c.systemDesignArchetype?.toLowerCase().includes(q);
        const matchesFocus = c.interviewFocus.some((f) => f.toLowerCase().includes(q));
        const matchesChallenge = c.keyChallenges.toLowerCase().includes(q);
        const matchesSample = c.sampleQuestions?.some((sq) => sq.toLowerCase().includes(q));

        return (
          matchesName ||
          matchesLocation ||
          matchesHubs ||
          matchesStack ||
          matchesArchetype ||
          matchesFocus ||
          matchesChallenge ||
          matchesSample
        );
      }

      return true;
    });
  }, [initialProfiles, selectedTier, selectedTech, selectedHub, searchQuery]);

  // Sorted list for table view
  const sortedCompanies = useMemo(() => {
    if (sortField === "default") return filteredCompanies;
    const list = [...filteredCompanies];
    if (sortField === "name") {
      list.sort((a, b) => (sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)));
    } else if (sortField === "tier") {
      list.sort((a, b) => (sortOrder === "asc" ? a.tier.localeCompare(b.tier) : b.tier.localeCompare(a.tier)));
    } else if (sortField === "salary") {
      // Extract numbers for comparison
      const extractNum = (str: string) => {
        const m = str.match(/\$(\d+)k/) || str.match(/₹(\d+)L/);
        return m ? parseInt(m[1], 10) : 0;
      };
      list.sort((a, b) => {
        const numA = extractNum(a.seniorDeSalary);
        const numB = extractNum(b.seniorDeSalary);
        return sortOrder === "asc" ? numA - numB : numB - numA;
      });
    }
    return list;
  }, [filteredCompanies, sortField, sortOrder]);

  // Displayed in Grid View (paginated)
  const displayedInGrid = useMemo(() => {
    return sortedCompanies.slice(0, visibleCount);
  }, [sortedCompanies, visibleCount]);

  // Active company for Split Workbench
  const activeCompany = useMemo(() => {
    const found = filteredCompanies.find((c) => c.id === selectedCompanyId);
    return found || filteredCompanies[0] || null;
  }, [filteredCompanies, selectedCompanyId]);

  const handleResetFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedTier("ALL");
    setSelectedTech("All");
    setSelectedHub("All Hubs");
    setVisibleCount(ITEMS_PER_PAGE);
  }, []);

  const hasActiveFilters =
    selectedTier !== "ALL" || selectedTech !== "All" || selectedHub !== "All Hubs" || searchQuery.trim().length > 0;

  return (
    <div className="space-y-2.5 pb-20 max-w-7xl mx-auto px-2 sm:px-4">
      {/* ─── COMPACT COMMAND HEADER (Space-Efficient) ─── */}
      <header className="rounded-xl bg-[var(--surface-1)] border border-[var(--border)] p-2.5 sm:p-3 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                <Building2 size={11} />
                <span>156 Target Companies</span>
              </span>
              <span className="text-[10px] text-[var(--muted-foreground)] font-mono">
                USD &amp; INR Bands • System Archetypes • Real Loops
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-bold text-[var(--foreground)] tracking-tight">
              Target Company Intel &amp; Architectural Dossiers
            </h1>
          </div>

          {/* Quick Metrics Ribbon */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar shrink-0">
            <div className="px-2 py-1 rounded-md bg-[var(--surface-2)] border border-[var(--border)] text-center min-w-[64px]">
              <div className="text-xs font-bold text-blue-500 dark:text-blue-400 leading-tight">156</div>
              <div className="text-[9px] text-[var(--muted-foreground)] uppercase tracking-wider font-semibold">Total</div>
            </div>
            <div className="px-2 py-1 rounded-md bg-[var(--surface-2)] border border-[var(--border)] text-center min-w-[64px]">
              <div className="text-xs font-bold text-emerald-500 dark:text-emerald-400 leading-tight">52</div>
              <div className="text-[9px] text-[var(--muted-foreground)] uppercase tracking-wider font-semibold">BigTech</div>
            </div>
            <div className="px-2 py-1 rounded-md bg-[var(--surface-2)] border border-[var(--border)] text-center min-w-[64px]">
              <div className="text-xs font-bold text-cyan-500 dark:text-cyan-400 leading-tight">52</div>
              <div className="text-[9px] text-[var(--muted-foreground)] uppercase tracking-wider font-semibold">FinTech</div>
            </div>
            <div className="px-2 py-1 rounded-md bg-[var(--surface-2)] border border-[var(--border)] text-center min-w-[64px]">
              <div className="text-xs font-bold text-amber-500 dark:text-amber-400 leading-tight">52</div>
              <div className="text-[9px] text-[var(--muted-foreground)] uppercase tracking-wider font-semibold">GCCs</div>
            </div>
            <div className="px-2 py-1 rounded-md bg-[var(--surface-2)] border border-[var(--border)] text-center min-w-[64px]">
              <div className="text-xs font-bold text-purple-500 dark:text-purple-400 leading-tight">312+</div>
              <div className="text-[9px] text-[var(--muted-foreground)] uppercase tracking-wider font-semibold">Prompts</div>
            </div>
          </div>
        </div>
      </header>

      {/* ─── UNIFIED ULTRA-COMPACT CONTROL DECK ─── */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-2 sm:p-2.5 space-y-2 shadow-xs">
        {/* ROW 1: Search Input + Hub Selector + View Mode Switcher + Prompts Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search 156+ companies by name, tech (Spark, Iceberg), hub, or archetype... (/ to focus)"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(ITEMS_PER_PAGE);
              }}
              className="w-full pl-8 pr-16 py-1.5 text-xs bg-[var(--surface-2)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery("")}
                  className="p-0.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
                  title="Clear search"
                >
                  <X size={12} />
                </button>
              ) : (
                <kbd className="hidden sm:inline-block px-1 py-0.2 text-[9px] bg-[var(--surface-3)] text-[var(--muted-foreground)] rounded border border-[var(--border)] font-mono">
                  /
                </kbd>
              )}
            </div>
          </div>

          {/* Hub Dropdown */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="relative">
              <select
                value={selectedHub}
                onChange={(e) => {
                  setSelectedHub(e.target.value);
                  setVisibleCount(ITEMS_PER_PAGE);
                }}
                className="appearance-none pl-6 pr-7 py-1.5 text-xs bg-[var(--surface-2)] border border-[var(--border)] rounded-lg text-[var(--foreground)] font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                {MAJOR_HUBS.map((hub) => (
                  <option key={hub} value={hub}>
                    {hub}
                  </option>
                ))}
              </select>
              <MapPin size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-cyan-500 pointer-events-none" />
              <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none" />
            </div>

            {/* View Mode Switcher (Grid | Split | Table) */}
            <div className="flex items-center gap-0.5 p-0.5 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-1.5 rounded-md text-xs transition-colors cursor-pointer",
                  viewMode === "grid"
                    ? "bg-[var(--surface-1)] text-blue-500 shadow-xs font-semibold"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                )}
                title="Compact Grid View"
                aria-label="Grid view"
              >
                <LayoutGrid size={13} />
              </button>
              <button
                onClick={() => setViewMode("split")}
                className={cn(
                  "p-1.5 rounded-md text-xs transition-colors cursor-pointer",
                  viewMode === "split"
                    ? "bg-[var(--surface-1)] text-blue-500 shadow-xs font-semibold"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                )}
                title="Master-Detail Split Workbench"
                aria-label="Split view"
              >
                <Columns2 size={13} />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={cn(
                  "p-1.5 rounded-md text-xs transition-colors cursor-pointer",
                  viewMode === "table"
                    ? "bg-[var(--surface-1)] text-blue-500 shadow-xs font-semibold"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                )}
                title="Dense Comparison Table"
                aria-label="Table view"
              >
                <TableIcon size={13} />
              </button>
            </div>

            {/* Expand All Prompts Toggle */}
            <button
              onClick={() => setGlobalExpandPrompts((prev) => !prev)}
              className={cn(
                "hidden sm:flex items-center gap-1 px-2 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer whitespace-nowrap",
                globalExpandPrompts
                  ? "bg-blue-500/15 border-blue-500/30 text-blue-600 dark:text-blue-300 font-semibold"
                  : "bg-[var(--surface-2)] border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              )}
              title="Toggle all real interview prompts (Shift+E)"
            >
              <HelpCircle size={11} className="text-blue-500" />
              <span>{globalExpandPrompts ? "Collapse Prompts" : "Expand Prompts"}</span>
            </button>
          </div>
        </div>

        {/* ROW 2: Tier Segmented Tabs */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-[var(--border)] flex-wrap">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: "ALL", label: "All Companies", count: tierCounts.ALL },
              { id: "Tier 1 FAANG / BigTech", label: "Tier 1 BigTech", count: tierCounts["Tier 1 FAANG / BigTech"] },
              { id: "Tier 1 Global FinTech", label: "Tier 1 FinTech", count: tierCounts["Tier 1 Global FinTech"] },
              { id: "Global Capability Center (GCC)", label: "Enterprise GCCs", count: tierCounts["Global Capability Center (GCC)"] },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setSelectedTier(t.id);
                  setVisibleCount(ITEMS_PER_PAGE);
                }}
                className={cn(
                  "px-2.5 py-1 text-[11px] rounded-md font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer",
                  selectedTier === t.id
                    ? "bg-blue-600 text-white font-semibold shadow-xs"
                    : "bg-[var(--surface-2)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                )}
              >
                <span>{t.label}</span>
                <span
                  className={cn(
                    "text-[10px] px-1 py-0.2 rounded-full",
                    selectedTier === t.id ? "bg-white/20 text-white" : "bg-[var(--surface-3)] text-[var(--muted-foreground)]"
                  )}
                >
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          {/* Matches Indicator */}
          <div className="text-[11px] text-[var(--muted-foreground)] shrink-0 flex items-center gap-1">
            <span>Showing</span>
            <span className="font-bold text-[var(--foreground)]">{filteredCompanies.length}</span>
            <span>of {initialProfiles.length}</span>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="ml-2 text-red-500 hover:text-red-400 font-medium inline-flex items-center gap-0.5 cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw size={10} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* ROW 3: Popular Tech Stack Micro-Chips (High-Density) */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-1 border-t border-[var(--border)]">
          <span className="text-[10px] uppercase font-bold text-[var(--muted-foreground)] shrink-0 flex items-center gap-0.5 pr-1">
            <SlidersHorizontal size={10} className="text-blue-500" /> Stack:
          </span>
          {POPULAR_TECHS.map((tech) => {
            const isSelected = selectedTech === tech;
            return (
              <button
                key={tech}
                onClick={() => {
                  setSelectedTech(tech);
                  setVisibleCount(ITEMS_PER_PAGE);
                }}
                className={cn(
                  "px-2 py-0.5 text-[10px] rounded font-mono font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 border",
                  isSelected
                    ? "bg-blue-500/20 border-blue-500/40 text-blue-600 dark:text-blue-300 font-semibold"
                    : "bg-[var(--surface-2)] border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                )}
              >
                {tech}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── EMPTY STATE ─── */}
      {filteredCompanies.length === 0 && (
        <div className="p-8 sm:p-12 text-center rounded-xl bg-[var(--surface-1)] border border-[var(--border)] space-y-2.5">
          <Building2 size={32} className="mx-auto text-[var(--muted-foreground)] opacity-40" />
          <h3 className="text-sm sm:text-base font-bold text-[var(--foreground)]">No companies match your filters</h3>
          <p className="text-xs text-[var(--muted-foreground)] max-w-md mx-auto">
            Try resetting your search query, choosing &ldquo;All Companies&rdquo;, or selecting a different tech stack or GCC hub.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-colors shadow-xs cursor-pointer inline-flex items-center gap-1.5"
          >
            <RotateCcw size={12} />
            <span>Reset All Filters</span>
          </button>
        </div>
      )}

      {/* ─── VIEW 1: COMPACT CARDS GRID ─── */}
      {viewMode === "grid" && filteredCompanies.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {displayedInGrid.map((company) => (
            <CompactCompanyCard
              key={company.id}
              company={company}
              activeTab={expandedCardTabs[company.id] || (globalExpandPrompts ? "prompts" : null)}
              onToggleTab={(tab) => toggleCardTab(company.id, tab)}
              onInspect={() => setModalCompany(company)}
              copiedKey={copiedKey}
              onCopyPrompt={handleCopyPrompt}
            />
          ))}
        </div>
      )}

      {/* ─── VIEW 2: MASTER-DETAIL SPLIT WORKBENCH ─── */}
      {viewMode === "split" && filteredCompanies.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
          {/* Left Rail: Ultra-dense scrollable company directory (5 columns on desktop) */}
          <div className="lg:col-span-5 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-1.5 space-y-1 max-h-[calc(100vh-210px)] overflow-y-auto">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] px-2 py-1 flex items-center justify-between border-b border-[var(--border)]">
              <span>Directory ({filteredCompanies.length})</span>
              <span className="text-[9px] font-mono">Select to inspect</span>
            </div>
            {filteredCompanies.map((c) => {
              const isSelected = activeCompany?.id === c.id;
              const tierStyle = getTierStyle(c.tier);
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCompanyId(c.id)}
                  className={cn(
                    "w-full text-left p-2 rounded-lg border transition-all flex items-start gap-2.5 cursor-pointer",
                    isSelected
                      ? "bg-blue-500/10 border-blue-500/50 shadow-xs"
                      : "bg-[var(--surface-2)]/60 border-[var(--border)] hover:bg-[var(--surface-2)] hover:border-blue-500/30"
                  )}
                >
                  <div className="w-7 h-7 rounded-md bg-[var(--surface-1)] border border-[var(--border)] flex items-center justify-center shrink-0 mt-0.5">
                    <TopicIcon topic={c.topicKey} size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-xs font-semibold text-[var(--foreground)] truncate">{c.name}</span>
                      <span className="text-[9px] font-semibold font-mono text-emerald-500 shrink-0">
                        {c.seniorDeSalary.split("(")[0]?.trim() || c.seniorDeSalary}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-[var(--muted-foreground)] flex-wrap">
                      <span className="flex items-center gap-0.5">
                        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", tierStyle.dot)} />
                        <span className="truncate max-w-[120px]">{tierStyle.label}</span>
                      </span>
                      <span>•</span>
                      <span className="truncate font-mono">{c.stack.slice(0, 2).join(", ")}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Pane: Sticky, full-fidelity dossier (7 columns on desktop) */}
          <div className="lg:col-span-7 sticky top-20 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-3 sm:p-4 space-y-3 max-h-[calc(100vh-210px)] overflow-y-auto shadow-xs">
            {activeCompany ? (
              <FullCompanyDossier
                company={activeCompany}
                copiedKey={copiedKey}
                onCopyPrompt={handleCopyPrompt}
              />
            ) : (
              <div className="py-20 text-center text-xs text-[var(--muted-foreground)]">
                Select a company from the left rail to view its complete engineering dossier.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── VIEW 3: DENSE COMPARISON TABLE ─── */}
      {viewMode === "table" && filteredCompanies.length > 0 && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[var(--surface-2)] border-b border-[var(--border)] text-[10px] uppercase font-bold text-[var(--muted-foreground)] tracking-wider">
                  <th
                    onClick={() => {
                      if (sortField === "name") setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
                      else {
                        setSortField("name");
                        setSortOrder("asc");
                      }
                    }}
                    className="py-2 px-3 cursor-pointer hover:text-[var(--foreground)]"
                  >
                    <div className="flex items-center gap-1">
                      <span>Company</span>
                      <ArrowUpDown size={10} />
                    </div>
                  </th>
                  <th
                    onClick={() => {
                      if (sortField === "tier") setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
                      else {
                        setSortField("tier");
                        setSortOrder("asc");
                      }
                    }}
                    className="py-2 px-2.5 cursor-pointer hover:text-[var(--foreground)]"
                  >
                    <div className="flex items-center gap-1">
                      <span>Tier</span>
                      <ArrowUpDown size={10} />
                    </div>
                  </th>
                  <th className="py-2 px-2.5">GCC Hubs</th>
                  <th className="py-2 px-2.5">Tech Stack</th>
                  <th
                    onClick={() => {
                      if (sortField === "salary") setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
                      else {
                        setSortField("salary");
                        setSortOrder("asc");
                      }
                    }}
                    className="py-2 px-2.5 cursor-pointer hover:text-[var(--foreground)]"
                  >
                    <div className="flex items-center gap-1">
                      <span>Senior DE Band</span>
                      <ArrowUpDown size={10} />
                    </div>
                  </th>
                  <th className="py-2 px-2.5">Principal Architect Band</th>
                  <th className="py-2 px-2.5">System Design Archetype</th>
                  <th className="py-2 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] font-normal">
                {sortedCompanies.map((c) => {
                  const tierStyle = getTierStyle(c.tier);
                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-[var(--surface-2)]/60 transition-colors group cursor-pointer"
                      onClick={() => setModalCompany(c)}
                    >
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center shrink-0">
                            <TopicIcon topic={c.topicKey} size={13} />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-[var(--foreground)] truncate max-w-[160px]">
                              {c.name}
                            </div>
                            <div className="text-[10px] text-[var(--muted-foreground)] truncate max-w-[160px]">
                              {c.location.split("/")[0]?.trim()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-2.5 whitespace-nowrap">
                        <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded-full border", tierStyle.badge)}>
                          {tierStyle.label}
                        </span>
                      </td>
                      <td className="py-2 px-2.5">
                        <div className="flex items-center gap-1 flex-wrap max-w-[140px]">
                          {c.hiringGCCLocations?.slice(0, 2).map((h) => (
                            <span
                              key={h}
                              className="text-[9px] px-1 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono"
                            >
                              {h.slice(0, 3).toUpperCase()}
                            </span>
                          ))}
                          {(c.hiringGCCLocations?.length || 0) > 2 && (
                            <span className="text-[9px] text-[var(--muted-foreground)] font-mono">
                              +{(c.hiringGCCLocations?.length || 0) - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-2.5">
                        <div className="flex items-center gap-1 flex-wrap max-w-[180px]">
                          {c.stack.slice(0, 3).map((s) => (
                            <span
                              key={s}
                              className="text-[9px] px-1 py-0.2 rounded bg-[var(--surface-2)] border border-[var(--border)] font-mono"
                            >
                              {s}
                            </span>
                          ))}
                          {c.stack.length > 3 && (
                            <span className="text-[9px] text-[var(--muted-foreground)] font-mono">
                              +{c.stack.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-2.5 whitespace-nowrap font-mono text-[11px] font-semibold text-emerald-500">
                        {c.seniorDeSalary.split("(")[0]?.trim()}
                      </td>
                      <td className="py-2 px-2.5 whitespace-nowrap font-mono text-[11px] font-semibold text-blue-500">
                        {c.architectSalary.split("(")[0]?.trim()}
                      </td>
                      <td className="py-2 px-2.5 max-w-[200px]">
                        <span className="text-[10px] text-[var(--foreground)] truncate block font-medium">
                          {c.systemDesignArchetype || "High-Throughput Lakehouse Architecture"}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setModalCompany(c);
                          }}
                          className="px-2 py-1 rounded-md bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-semibold transition-colors cursor-pointer"
                        >
                          Dossier
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── LOAD MORE PAGINATION (Grid View) ─── */}
      {viewMode === "grid" && displayedInGrid.length < filteredCompanies.length && (
        <div className="pt-2 text-center space-y-1.5">
          <p className="text-[11px] text-[var(--muted-foreground)]">
            Showing {displayedInGrid.length} of {filteredCompanies.length} companies
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              Load More (+{ITEMS_PER_PAGE})
            </button>
            <button
              onClick={() => setVisibleCount(filteredCompanies.length)}
              className="px-3 py-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--foreground)] border border-[var(--border)] text-xs font-semibold transition-all cursor-pointer"
            >
              Show All ({filteredCompanies.length})
            </button>
          </div>
        </div>
      )}

      {/* ─── FULL DOSSIER MODAL INSPECTOR ─── */}
      {modalCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-3xl max-h-[90vh] rounded-xl border border-[var(--border)] bg-[var(--surface-1)] shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-3 sm:p-3.5 border-b border-[var(--border)] bg-[var(--surface-2)]">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[var(--surface-1)] border border-[var(--border)] flex items-center justify-center shrink-0">
                  <TopicIcon topic={modalCompany.topicKey} size={18} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-bold text-[var(--foreground)] truncate">
                      {modalCompany.name}
                    </h2>
                    <span
                      className={cn(
                        "text-[9px] font-semibold px-1.5 py-0.2 rounded-full border",
                        getTierStyle(modalCompany.tier).badge
                      )}
                    >
                      {getTierStyle(modalCompany.tier).label}
                    </span>
                  </div>
                  <div className="text-[10px] text-[var(--muted-foreground)] truncate">{modalCompany.location}</div>
                </div>
              </div>

              <button
                onClick={() => setModalCompany(null)}
                className="p-1 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors cursor-pointer"
                title="Close (Esc)"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
              <FullCompanyDossier
                company={modalCompany}
                copiedKey={copiedKey}
                onCopyPrompt={handleCopyPrompt}
              />
            </div>

            {/* Modal Footer */}
            <div className="p-2.5 px-3.5 border-t border-[var(--border)] bg-[var(--surface-2)] flex items-center justify-between text-xs">
              <span className="text-[10px] text-[var(--muted-foreground)]">Press Esc to close</span>
              <div className="flex items-center gap-2">
                <Link
                  href={`/architecture?category=${encodeURIComponent("Databricks Lakehouse Architecture")}`}
                  className="px-2.5 py-1 rounded-md bg-blue-600 text-white text-[11px] font-semibold hover:bg-blue-500 transition-colors inline-flex items-center gap-1"
                >
                  <span>Practice Architecture Scenarios</span>
                  <ArrowRight size={11} />
                </Link>
                <button
                  onClick={() => setModalCompany(null)}
                  className="px-2.5 py-1 rounded-md bg-[var(--surface-3)] text-[var(--foreground)] text-[11px] font-medium border border-[var(--border)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   SUB-COMPONENT: COMPACT COMPANY CARD (Space-Optimized, ~220px default)
   ────────────────────────────────────────────────────────────────────────── */
interface CompactCompanyCardProps {
  company: CompanyProfile;
  activeTab: ActiveTab | null;
  onToggleTab: (tab: ActiveTab) => void;
  onInspect: () => void;
  copiedKey: string | null;
  onCopyPrompt: (key: string, text: string) => void;
}

function CompactCompanyCard({
  company,
  activeTab,
  onToggleTab,
  onInspect,
  copiedKey,
  onCopyPrompt,
}: CompactCompanyCardProps) {
  const tierStyle = getTierStyle(company.tier);

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] hover:border-blue-500/40 p-2.5 sm:p-3 space-y-2 shadow-xs transition-all duration-150 flex flex-col justify-between">
      <div className="space-y-1.5">
        {/* Top Header: Logo, Name, Tier Badge, Inspect */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center shrink-0 mt-0.5">
              <TopicIcon topic={company.topicKey} size={16} />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-[var(--foreground)] truncate leading-snug">
                {company.name}
              </h3>
              <div className="flex items-center gap-1 text-[10px] text-[var(--muted-foreground)] truncate mt-0.5">
                <Globe size={9} className="shrink-0" />
                <span className="truncate">{company.location.split("/")[0]?.trim()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded-full border whitespace-nowrap", tierStyle.badge)}>
              {tierStyle.label}
            </span>
            <button
              onClick={onInspect}
              className="p-1 rounded-md text-[var(--muted-foreground)] hover:text-blue-500 hover:bg-blue-500/10 transition-colors cursor-pointer"
              title="Inspect Full Engineering Dossier"
            >
              <Maximize2 size={11} />
            </button>
          </div>
        </div>

        {/* GCC Hubs Strip */}
        {company.hiringGCCLocations && company.hiringGCCLocations.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap text-[10px]">
            <span className="text-[9px] uppercase font-bold text-[var(--muted-foreground)] flex items-center gap-0.5">
              <MapPin size={9} className="text-cyan-400" /> Hubs:
            </span>
            {company.hiringGCCLocations.slice(0, 3).map((hub) => (
              <span
                key={hub}
                className="px-1 py-0.2 rounded bg-cyan-500/10 text-cyan-400 dark:text-cyan-300 border border-cyan-500/20 text-[9px] font-mono font-medium"
              >
                {hub.slice(0, 3).toUpperCase()}
              </span>
            ))}
            {company.hiringGCCLocations.length > 3 && (
              <span className="text-[9px] text-[var(--muted-foreground)] font-mono">
                +{company.hiringGCCLocations.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Compact Salary Strip (Dual-Level USD + INR) */}
        <div className="grid grid-cols-2 gap-1.5 p-1.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[10px]">
          <div className="min-w-0">
            <div className="text-[8px] uppercase tracking-wider font-bold text-[var(--muted-foreground)] flex items-center gap-0.5">
              <TrendingUp size={8} className="text-emerald-500" />
              <span>Senior DE</span>
            </div>
            <div className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-[10px] sm:text-[11px] truncate">
              {company.seniorDeSalary.split("(")[0]?.trim()}
            </div>
          </div>
          <div className="min-w-0 border-l border-[var(--border)] pl-1.5">
            <div className="text-[8px] uppercase tracking-wider font-bold text-[var(--muted-foreground)] flex items-center gap-0.5">
              <Briefcase size={8} className="text-blue-500" />
              <span>Principal Arch</span>
            </div>
            <div className="font-bold text-blue-600 dark:text-blue-400 font-mono text-[10px] sm:text-[11px] truncate">
              {company.architectSalary.split("(")[0]?.trim()}
            </div>
          </div>
        </div>

        {/* System Design Archetype Pill */}
        {company.systemDesignArchetype && (
          <div className="p-1.5 rounded-md bg-[var(--surface-2)]/70 border border-[var(--border)] flex items-center gap-1.5 text-[10px]">
            <Layers size={11} className="text-blue-500 shrink-0" />
            <span className="text-[var(--foreground)] truncate font-medium">
              {company.systemDesignArchetype}
            </span>
          </div>
        )}

        {/* Tech Stack Micro-Chips */}
        <div className="flex items-center gap-1 flex-wrap">
          {company.stack.slice(0, 5).map((tech) => (
            <span
              key={tech}
              className="px-1.5 py-0.2 rounded bg-[var(--surface-2)] text-[9px] font-mono text-[var(--foreground)] border border-[var(--border)]"
            >
              {tech}
            </span>
          ))}
          {company.stack.length > 5 && (
            <span className="text-[9px] text-[var(--muted-foreground)] font-mono">
              +{company.stack.length - 5}
            </span>
          )}
        </div>
      </div>

      {/* ─── INTERACTIVE TAB CONTROLS (Zero Clutter) ─── */}
      <div className="pt-1 border-t border-[var(--border)] space-y-1.5">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggleTab("prompts")}
            className={cn(
              "flex-1 flex items-center justify-center gap-1 py-1 rounded text-[10px] font-semibold border transition-colors cursor-pointer",
              activeTab === "prompts"
                ? "bg-blue-500/15 border-blue-500/30 text-blue-600 dark:text-blue-300"
                : "bg-[var(--surface-2)] border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            )}
          >
            <HelpCircle size={10} className="text-blue-500" />
            <span>Prompts ({company.sampleQuestions?.length || 0})</span>
            {activeTab === "prompts" ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
          </button>

          <button
            onClick={() => onToggleTab("interviewFocus")}
            className={cn(
              "flex-1 flex items-center justify-center gap-1 py-1 rounded text-[10px] font-semibold border transition-colors cursor-pointer",
              activeTab === "interviewFocus"
                ? "bg-purple-500/15 border-purple-500/30 text-purple-600 dark:text-purple-300"
                : "bg-[var(--surface-2)] border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            )}
          >
            <Sparkles size={10} className="text-purple-500" />
            <span>Focus ({company.interviewFocus.length})</span>
            {activeTab === "interviewFocus" ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
          </button>

          <button
            onClick={() => onToggleTab("challenge")}
            className={cn(
              "py-1 px-1.5 rounded text-[10px] font-semibold border transition-colors cursor-pointer",
              activeTab === "challenge"
                ? "bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-300"
                : "bg-[var(--surface-2)] border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            )}
            title="Scale Challenge"
          >
            <Compass size={10} className="text-amber-500" />
          </button>
        </div>

        {/* EXPANDED CONTENT DRAWER */}
        {activeTab === "prompts" && company.sampleQuestions && company.sampleQuestions.length > 0 && (
          <div className="space-y-1.5 p-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] animate-in fade-in-50 duration-150">
            {company.sampleQuestions.map((prompt, qIdx) => {
              const copyKey = `${company.id}-prompt-${qIdx}`;
              const isCopied = copiedKey === copyKey;
              return (
                <div
                  key={qIdx}
                  className="p-1.5 rounded bg-[var(--surface-1)] border border-[var(--border)] space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-blue-500">
                      Prompt #{qIdx + 1}
                    </span>
                    <button
                      onClick={() => onCopyPrompt(copyKey, prompt)}
                      className="flex items-center gap-0.5 text-[9px] font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                    >
                      {isCopied ? (
                        <>
                          <Check size={9} className="text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={9} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-[var(--foreground)] leading-relaxed italic break-words">
                    &ldquo;{prompt}&rdquo;
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "interviewFocus" && (
          <div className="p-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] animate-in fade-in-50 duration-150">
            <ul className="space-y-1 text-[10px] text-[var(--muted-foreground)]">
              {company.interviewFocus.map((focus, i) => (
                <li key={i} className="flex items-start gap-1 leading-snug">
                  <span className="text-purple-500 font-bold shrink-0">•</span>
                  <span className="text-[var(--foreground)] break-words">{focus}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === "challenge" && (
          <div className="p-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] animate-in fade-in-50 duration-150 text-[10px] text-[var(--muted-foreground)] leading-snug break-words">
            <span className="font-bold text-[var(--foreground)]">Scale Challenge: </span>
            {company.keyChallenges}
          </div>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   SUB-COMPONENT: FULL COMPANY DOSSIER (Rendered in Split View & Modal)
   ────────────────────────────────────────────────────────────────────────── */
interface FullCompanyDossierProps {
  company: CompanyProfile;
  copiedKey: string | null;
  onCopyPrompt: (key: string, text: string) => void;
}

function FullCompanyDossier({ company, copiedKey, onCopyPrompt }: FullCompanyDossierProps) {
  const tierStyle = getTierStyle(company.tier);

  return (
    <div className="space-y-3">
      {/* Header Banner */}
      <div className="flex items-start justify-between gap-3 pb-2.5 border-b border-[var(--border)]">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center shrink-0 shadow-xs">
            <TopicIcon topic={company.topicKey} size={22} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[var(--foreground)] tracking-tight">
              {company.name}
            </h2>
            <div className="text-[11px] text-[var(--muted-foreground)] flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="flex items-center gap-1">
                <Globe size={11} />
                <span>{company.location}</span>
              </span>
            </div>
          </div>
        </div>

        <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap", tierStyle.badge)}>
          {tierStyle.label}
        </span>
      </div>

      {/* GCC Hubs */}
      {company.hiringGCCLocations && company.hiringGCCLocations.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <span className="text-[10px] uppercase font-bold text-[var(--muted-foreground)] flex items-center gap-1">
            <MapPin size={11} className="text-cyan-400" /> Active Hiring Hubs:
          </span>
          {company.hiringGCCLocations.map((hub) => (
            <span
              key={hub}
              className="px-1.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 dark:text-cyan-300 border border-cyan-500/20 text-[10px] font-mono font-medium"
            >
              {hub}
            </span>
          ))}
        </div>
      )}

      {/* Salary Benchmarks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] space-y-0.5">
          <div className="text-[10px] text-[var(--muted-foreground)] uppercase font-semibold flex items-center gap-1">
            <TrendingUp size={10} className="text-emerald-500" />
            <span>Senior Data Engineer Band</span>
          </div>
          <div className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-xs sm:text-sm">
            {company.seniorDeSalary}
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] space-y-0.5">
          <div className="text-[10px] text-[var(--muted-foreground)] uppercase font-semibold flex items-center gap-1">
            <Briefcase size={10} className="text-blue-500" />
            <span>Principal Architect Band</span>
          </div>
          <div className="font-bold text-blue-600 dark:text-blue-400 font-mono text-xs sm:text-sm">
            {company.architectSalary}
          </div>
        </div>
      </div>

      {/* System Design Archetype */}
      {company.systemDesignArchetype && (
        <div className="p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-blue-500 font-bold uppercase tracking-wider">
            <Layers size={12} />
            <span>Target System Design Archetype</span>
          </div>
          <p className="text-xs text-[var(--foreground)] font-semibold leading-snug">
            {company.systemDesignArchetype}
          </p>
        </div>
      )}

      {/* Production Tech Stack */}
      <div className="space-y-1">
        <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
          Verified Production Stack:
        </div>
        <div className="flex flex-wrap gap-1">
          {company.stack.map((tech) => (
            <span
              key={tech}
              className="px-2 py-0.5 rounded-md bg-[var(--surface-2)] text-[11px] font-mono text-[var(--foreground)] border border-[var(--border)]"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Production Scale Challenge */}
      <div className="p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-xs leading-relaxed text-[var(--muted-foreground)] break-words space-y-1">
        <div className="font-bold text-[var(--foreground)] flex items-center gap-1">
          <Compass size={12} className="text-amber-500" />
          <span>Core Engineering &amp; Scale Bottleneck:</span>
        </div>
        <p className="text-[11px] sm:text-xs">{company.keyChallenges}</p>
      </div>

      {/* Architectural Interview Focus Topics */}
      <div className="space-y-1.5 pt-1 text-xs">
        <div className="text-xs font-bold text-[var(--foreground)] flex items-center gap-1.5">
          <Sparkles size={12} className="text-purple-500" />
          <span>Architectural Interview Focus Rubrics:</span>
        </div>
        <ul className="space-y-1.5 pl-1 text-[11px] sm:text-xs text-[var(--muted-foreground)]">
          {company.interviewFocus.map((focus, i) => (
            <li key={i} className="flex items-start gap-1.5 leading-snug">
              <span className="text-purple-500 font-bold shrink-0">•</span>
              <span className="text-[var(--foreground)] break-words">{focus}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Real Interview System Design Prompts */}
      {company.sampleQuestions && company.sampleQuestions.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-[var(--border)]">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-[var(--foreground)] flex items-center gap-1.5">
              <HelpCircle size={12} className="text-blue-500" />
              <span>Real Interview Prompts ({company.sampleQuestions.length})</span>
            </div>
            <Link
              href={`/architecture?category=${encodeURIComponent("Databricks Lakehouse Architecture")}`}
              className="text-[10px] text-blue-500 hover:underline flex items-center gap-0.5"
            >
              <span>Practice Scenarios</span>
              <ArrowRight size={10} />
            </Link>
          </div>

          <div className="space-y-2">
            {company.sampleQuestions.map((prompt, qIdx) => {
              const copyKey = `${company.id}-full-${qIdx}`;
              const isCopied = copiedKey === copyKey;
              return (
                <div
                  key={qIdx}
                  className="p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500">
                      Scenario Prompt #{qIdx + 1}
                    </span>
                    <button
                      onClick={() => onCopyPrompt(copyKey, prompt)}
                      className="flex items-center gap-1 text-[10px] font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
                    >
                      {isCopied ? (
                        <>
                          <Check size={11} className="text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={11} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] sm:text-xs text-[var(--foreground)] leading-relaxed italic break-words">
                    &ldquo;{prompt}&rdquo;
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
