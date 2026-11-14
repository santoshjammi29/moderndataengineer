"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Flame,
  Search,
  Download,
  FileCode2,
  Terminal,
  Cpu,
  Code2,
  ExternalLink,
  Layers,
  Sparkles,
  Maximize2,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  Eye,
  FileText,
} from "lucide-react";
import type {
  DatabricksSuiteData,
  DatabricksDomainId,
  DatabricksCheatCard,
  DatabricksDomainMeta,
} from "@/types/data";
import { DatabricksCard } from "@/components/cheatsheet/databricks-card";
import { toast } from "sonner";
import { fisherYatesShuffle, createSeededRandom } from "@/lib/shuffle";
import { ShuffleControl } from "@/components/ui/shuffle-control";
import { PosterLightbox } from "@/components/cheatsheet/poster-lightbox";
import { cn } from "@/lib/utils";

interface DatabricksCheatsheetViewProps {
  data: DatabricksSuiteData;
  initialDomain?: string;
  initialCardId?: string;
}

const DOMAIN_ICONS: Record<DatabricksDomainId, React.ElementType> = {
  sparksql: Terminal,
  pyspark: Flame,
  spark_core: Cpu,
  python: Code2,
};

export function DatabricksCheatsheetView({
  data,
  initialDomain,
  initialCardId,
}: DatabricksCheatsheetViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedDomain, setSelectedDomain] = useState<DatabricksDomainId | "ALL">(
    (initialDomain as DatabricksDomainId) || "ALL"
  );
  const [selectedPage, setSelectedPage] = useState<number | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [highlightedCardId, setHighlightedCardId] = useState<string | null>(initialCardId || null);

  const handleDomainSelect = (domId: DatabricksDomainId | "ALL") => {
    setSelectedDomain(domId);
    setSelectedPage("ALL");
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "databricks");
    if (domId === "ALL") {
      params.delete("domain");
    } else {
      params.set("domain", domId);
    }
    params.delete("card");
    router.replace(`/cheat-sheet?${params.toString()}`, { scroll: false });
  };

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [lightboxPoster, setLightboxPoster] = useState<{
    url: string;
    title: string;
    subtitle: string;
    pdfUrl: string;
  } | null>(null);

  // Shuffle state
  const [isShuffled, setIsShuffled] = useState(false);
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [statusAnnouncement, setStatusAnnouncement] = useState("");

  const handleShuffle = () => {
    setIsShuffled(true);
    setShuffleSeed((s) => s + 1);
    setStatusAnnouncement(`Shuffled Databricks cheat cards (${filteredCards.length} cards). Order randomized.`);
    toast.success("Shuffled Databricks cards");
  };

  const handleResetOrder = () => {
    setIsShuffled(false);
    setStatusAnnouncement("Reset Databricks cards to default order.");
    toast.info("Reset to default order");
  };

  // Auto-scroll to card if initialCardId exists
  useEffect(() => {
    if (initialCardId) {
      setHighlightedCardId(initialCardId);
      setTimeout(() => {
        const el = document.getElementById(initialCardId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 300);
    }
  }, [initialCardId]);

  // Current domain metadata if a single domain is selected
  const activeDomainMeta = useMemo<DatabricksDomainMeta | undefined>(() => {
    if (selectedDomain === "ALL") return undefined;
    return data.domains.find((d) => d.id === selectedDomain);
  }, [data.domains, selectedDomain]);

  // Filtered cards
  const filteredCards = useMemo(() => {
    return data.cards.filter((card) => {
      // Domain filter
      if (selectedDomain !== "ALL" && card.domain !== selectedDomain) {
        return false;
      }

      // Page filter
      if (selectedPage !== "ALL" && card.page !== selectedPage) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = card.title.toLowerCase().includes(q);
        const inTag = card.tag.toLowerCase().includes(q);
        const inCode = card.code.toLowerCase().includes(q);
        const inAlert = card.alert ? card.alert.text.toLowerCase().includes(q) : false;
        const inExplain = card.explain.some(
          (e) => e.text.toLowerCase().includes(q) || e.html.toLowerCase().includes(q)
        );

        if (!inTitle && !inTag && !inCode && !inAlert && !inExplain) {
          return false;
        }
      }

      return true;
    });
  }, [data.cards, selectedDomain, selectedPage, searchQuery]);

  const displayedCards = useMemo(() => {
    if (!isShuffled || filteredCards.length <= 1) return filteredCards;
    return fisherYatesShuffle(filteredCards, createSeededRandom(shuffleSeed));
  }, [filteredCards, isShuffled, shuffleSeed]);

  const handleOpenPoster = (domainMeta?: DatabricksDomainMeta) => {
    const target = domainMeta || activeDomainMeta || data.domains[0];
    setLightboxPoster({
      url: target.poster,
      title: `${target.title} Wall Poster`,
      subtitle: `${target.badge} • 4162 × 2924 • 250 DPI Print-Ready`,
      pdfUrl: target.pdf,
    });
    setLightboxOpen(true);
  };

  const handleResetFilters = () => {
    setSelectedDomain("ALL");
    setSelectedPage("ALL");
    setSearchQuery("");
    setHighlightedCardId(null);
    setIsShuffled(false);
  };

  return (
    <div className="space-y-4">
      {/* Lightbox Modal */}
      {lightboxPoster && (
        <PosterLightbox
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          posterUrl={lightboxPoster.url}
          title={lightboxPoster.title}
          subtitle={lightboxPoster.subtitle}
          pdfUrl={lightboxPoster.pdfUrl}
        />
      )}

      {/* Hero Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] dark:bg-gradient-to-br dark:from-[#0c1427] dark:via-[#080c15] dark:to-[#120e24] dark:border-amber-500/20 p-4 sm:p-5 shadow-lg isolate">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            {/* Databricks Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
              <Flame size={13} />
              <span>DBR 15.4 / 16.0 LTS • Production Engineering Suite</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--foreground)]">
              Databricks Architecture &amp;{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 dark:from-amber-400 dark:via-orange-400 dark:to-amber-300 [.light_&]:text-amber-800 [.e-ink_&]:text-[#111111] [.light_&]:bg-none [.e-ink_&]:bg-none">
                Coding Cheat Sheets
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed max-w-3xl">
              High-density, production-grade cheat sheets covering Spark SQL, PySpark, Spark Core &amp; Architecture Internals, and Python in Databricks. Complete with memory mechanics, shuffle formulas, code breakdowns, and vector PDFs.
            </p>

            {/* Quick Metrics Bar */}
            <div className="pt-1 flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-[var(--muted-foreground)]">
              <span className="flex items-center gap-1 text-[var(--foreground)] font-semibold bg-[var(--surface-2)] px-2.5 py-1 rounded-lg border border-[var(--border)]">
                <CheckCircle2 size={13} className="text-amber-600 dark:text-amber-400" />
                48 Production Cards
              </span>
              <span className="flex items-center gap-1 text-[var(--foreground)] font-semibold bg-[var(--surface-2)] px-2.5 py-1 rounded-lg border border-[var(--border)]">
                <CheckCircle2 size={13} className="text-sky-600 dark:text-sky-400" />
                5 Vector PDFs (Print-Ready)
              </span>
              <span className="flex items-center gap-1 text-[var(--foreground)] font-semibold bg-[var(--surface-2)] px-2.5 py-1 rounded-lg border border-[var(--border)]">
                <CheckCircle2 size={13} className="text-purple-600 dark:text-purple-400" />
                4 Panoramic Wall Posters (250 DPI)
              </span>
            </div>
          </div>

          {/* Master Downloads & Standalone Hub CTA */}
          <div className="flex flex-col sm:flex-row md:flex-col items-stretch gap-2 shrink-0">
            <a
              href="/api/download/pdf/databricks_master_cheatsheet.pdf"
              download="databricks_master_cheatsheet.pdf"
              className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-98 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              <Download size={14} />
              <span>Download Master PDF (8 Pages)</span>
            </a>

            <div className="flex items-center gap-2">
              <Link
                href="/cheat-sheet?tab=pdf_hub"
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-semibold border border-purple-500/30 transition-colors"
              >
                <FileText size={12} className="text-purple-400" />
                <span>PDF Hub</span>
              </Link>

              <button
                type="button"
                onClick={() => handleOpenPoster(activeDomainMeta || data.domains[0])}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
              >
                <Eye size={12} className="text-amber-400" />
                <span>Wall Posters</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Domain Navigation Pills */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] overflow-x-auto scrollbar-none">
        {/* All Cards pill */}
        <button
          type="button"
          onClick={() => handleDomainSelect("ALL")}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer",
            selectedDomain === "ALL"
              ? "bg-blue-600 text-white font-semibold shadow-xs"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
          )}
        >
          <Layers size={13} />
          <span>All 48 Cards</span>
        </button>

        {/* Domain Pills */}
        {data.domains.map((dom) => {
          const Icon = DOMAIN_ICONS[dom.id] || Flame;
          const isActive = selectedDomain === dom.id;
          return (
            <button
              key={dom.id}
              type="button"
              onClick={() => handleDomainSelect(dom.id)}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer",
                isActive
                  ? "bg-[var(--surface-2)] text-[var(--foreground)] font-semibold border border-[var(--border)] shadow-xs"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
              )}
            >
              <Icon
                size={13}
                style={{ color: isActive ? dom.accentColor : undefined }}
              />
              <span>{dom.shortTitle}</span>
              <span
                className="text-[10px] px-1.5 py-0.2 rounded-full font-mono font-semibold"
                style={{
                  backgroundColor: `${dom.accentColor}20`,
                  color: dom.accentColor,
                }}
              >
                12
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Domain Spotlight Bar (if a specific domain is selected) */}
      {activeDomainMeta && (
        <div className="p-3 sm:p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: activeDomainMeta.accentColor }}
                />
                {activeDomainMeta.title}
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--muted-foreground)] border border-[var(--border)]">
                {activeDomainMeta.badge}
              </span>
            </div>
            <p className="text-xs text-[var(--muted-foreground)]">{activeDomainMeta.subtitle}</p>
          </div>

          {/* Domain Action Buttons */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap w-full md:w-auto">
            {/* Page 1 vs Page 2 filter pills */}
            <div className="flex items-center gap-1 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setSelectedPage("ALL")}
                className={cn(
                  "px-2.5 py-1 rounded-md transition-colors cursor-pointer",
                  selectedPage === "ALL"
                    ? "bg-[var(--surface-1)] text-[var(--foreground)] font-semibold shadow-xs"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                )}
              >
                All 12
              </button>
              <button
                type="button"
                onClick={() => setSelectedPage(1)}
                className={cn(
                  "px-2.5 py-1 rounded-md transition-colors cursor-pointer",
                  selectedPage === 1
                    ? "bg-[var(--surface-1)] text-[var(--foreground)] font-semibold shadow-xs"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                )}
              >
                Page 1 (#1-#6)
              </button>
              <button
                type="button"
                onClick={() => setSelectedPage(2)}
                className={cn(
                  "px-2.5 py-1 rounded-md transition-colors cursor-pointer",
                  selectedPage === 2
                    ? "bg-[var(--surface-1)] text-[var(--foreground)] font-semibold shadow-xs"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                )}
              >
                Page 2 (#7-#12)
              </button>
            </div>

            {/* Download PDF button */}
            <a
              href={`/api/download/pdf/${activeDomainMeta.pdf.split('/').pop()}`}
              download={activeDomainMeta.pdf.split('/').pop()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--foreground)] text-xs font-semibold border border-[var(--border)] transition-colors cursor-pointer"
            >
              <Download size={13} className="text-sky-600 dark:text-sky-400" />
              <span>PDF ({activeDomainMeta.pdfSize})</span>
            </a>

            {/* View Poster button */}
            <button
              type="button"
              onClick={() => handleOpenPoster(activeDomainMeta)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 text-xs font-semibold border border-amber-500/30 transition-colors cursor-pointer"
            >
              <Maximize2 size={13} />
              <span>Wall Poster</span>
            </button>
          </div>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Search input */}
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search all 48 cards by title, tag, code syntax, or engine mechanics..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] text-xs text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] text-xs"
            >
              &times;
            </button>
          )}
        </div>

        {/* Results count, shuffle & reset */}
        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-[var(--muted-foreground)] shrink-0 flex-wrap">
          <span>
            Showing <strong className="text-[var(--foreground)] font-mono">{displayedCards.length}</strong> of{" "}
            <strong className="text-[var(--muted-foreground)] font-mono">{data.cards.length}</strong> cards
          </span>

          <ShuffleControl
            isShuffled={isShuffled}
            onShuffle={handleShuffle}
            onReset={handleResetOrder}
            itemLabel="Cards"
            count={filteredCards.length}
            statusAnnouncement={statusAnnouncement}
            size="sm"
          />

          {(searchQuery || selectedDomain !== "ALL" || selectedPage !== "ALL" || isShuffled) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="flex items-center gap-1 text-xs text-amber-500 hover:text-amber-400 dark:text-amber-400 dark:hover:text-amber-300 transition-colors cursor-pointer"
            >
              <RefreshCw size={11} />
              <span>Reset All</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of Cards */}
      {displayedCards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-3.5 sm:gap-4">
          {displayedCards.map((card) => (
            <DatabricksCard
              key={card.id}
              card={card}
              isHighlighted={highlightedCardId === card.id}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-1)] py-16 px-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-4">
            <Search size={22} />
          </div>
          <h3 className="text-base font-bold text-[var(--foreground)]">No Databricks Cheat Cards Found</h3>
          <p className="mt-1 text-xs text-[var(--muted-foreground)] max-w-sm">
            We couldn&apos;t find any cards matching your active filters. Try searching for &quot;Liquid Clustering&quot;, &quot;Photon&quot;, &quot;AQE&quot;, &quot;Auto Loader&quot;, &quot;G1GC&quot;, or &quot;DABs&quot;.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <RefreshCw size={13} />
            <span>Reset All Filters</span>
          </button>
        </div>
      )}
    </div>
  );
}
