"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import {
  Search,
  X,
  Download,
  Sparkles,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Compass,
  Users,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Cpu,
  Wrench,
  BarChart3,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { architectureDiagrams, type ArchitectureDiagramItem } from "@/data/diagrams";
import { useDiagramTheme } from "@/lib/diagram-theme";
import { WhiteboardCard } from "./whiteboard-card";
import { WhiteboardThemeToggle } from "./whiteboard-theme-toggle";

const CATEGORIES = [
  "All",
  "Fabric & Power BI",
  "Platform Landscape",
  "Data Pipelines & Ingestion",
  "Governance & Security",
  "Storage Engine",
  "Compute & Optimization",
  "Data Modeling & Architecture",
] as const;

export function ArchitectureDiagramsGallery() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDiagram, setActiveDiagram] = useState<ArchitectureDiagramItem | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [theme] = useDiagramTheme();
  const [modalTab, setModalTab] = useState<"architecture" | "personas" | "triage" | "governance">("architecture");
  const [activePersona, setActivePersona] = useState<"architect" | "seniorDe" | "dataEngineer" | "steward" | "businessAnalyst">("architect");

  const isDark = theme === "dark";

  // Check URL query param ?diagram=xyz to auto-open or scroll into view
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const diagramParam = params.get("diagram") || params.get("id");
      if (diagramParam) {
        const match = architectureDiagrams.find((d) => d.id === diagramParam);
        if (match) {
          setActiveDiagram(match);
          setTimeout(() => {
            const el = document.getElementById(`diagram-${match.id}`);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }, 150);
        }
      }
    }
  }, []);

  // Close lightbox on Escape key
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

  const filteredDiagrams = useMemo(() => {
    return architectureDiagrams.filter((item) => {
      const matchesCat = selectedCategory === "All" || item.category === selectedCategory;
      if (!matchesCat) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q)) ||
        item.keyPoints.some((p) => p.toLowerCase().includes(q))
      );
    });
  }, [selectedCategory, searchQuery]);

  const handleDownload = (diagram: ArchitectureDiagramItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = diagram.image;
    link.download = `${diagram.id}.webp`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Downloading high-resolution blueprint");
  };

  return (
    <div className="space-y-6">
      {/* Search & Global Viewport Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search whiteboard diagrams (e.g., Unity Catalog, Liquid Clustering, DLT, Photon, Medallion)..."
            className="w-full pl-10 pr-12 py-2.5 sm:py-3 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Global Dark Mode / Light Canvas Option Switch */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hidden md:flex">
            <Sparkles size={13} className="text-blue-500 dark:text-blue-400" />
            <span>Canvas View:</span>
          </div>
          <WhiteboardThemeToggle size="sm" showLabel={true} />
        </div>
      </div>

      {/* Category Pills (Edge-to-edge swipeable on mobile) */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border shrink-0 touch-manipulation cursor-pointer",
                isSelected
                  ? "bg-blue-600 border-blue-500 text-white shadow-xs"
                  : "bg-[var(--surface-1)] border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
              )}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Diagrams Grid (1 Col Mobile, 2 Col Desktop) using Second Layout Style */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-7">
        {filteredDiagrams.map((diagram, idx) => (
          <WhiteboardCard
            key={diagram.id}
            diagram={diagram}
            onExpand={(d) => {
              setActiveDiagram(d);
              setZoomLevel(1);
            }}
            priority={idx < 2}
          />
        ))}
      </div>

      {/* Fullscreen High-Resolution Lightbox Modal with Interactive Dark Mode Option */}
      {activeDiagram && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 animate-in fade-in duration-200"
          onClick={() => {
            setActiveDiagram(null);
            setZoomLevel(1);
          }}
        >
          <div
            className="relative w-full max-w-6xl max-h-[96vh] sm:max-h-[92vh] bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-3 py-2.5 sm:px-6 sm:py-4 border-b border-[var(--border)] bg-[var(--surface-2)] gap-2">
              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-lg bg-blue-500/10 border border-blue-500/20 shrink-0">
                    {activeDiagram.category}
                  </span>
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-[var(--foreground)] truncate">
                    {activeDiagram.title}
                  </h3>
                </div>
                <p className="text-[10px] sm:text-xs text-[var(--muted-foreground)] truncate hidden xs:block">
                  {activeDiagram.subtitle}
                </p>
              </div>

              {/* Modal Toolbar: Theme Switch + Zoom + Download + Close */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {/* Whiteboard Theme Toggle inside Modal */}
                <div className="hidden sm:block">
                  <WhiteboardThemeToggle size="xs" showLabel={false} />
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center gap-0.5 sm:gap-1 bg-[var(--surface-1)] border border-[var(--border)] rounded-lg sm:rounded-xl p-0.5 sm:p-1">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
                    className="p-1 sm:p-1.5 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] touch-manipulation cursor-pointer"
                    title="Zoom Out"
                    aria-label="Zoom Out"
                  >
                    <ZoomOut size={14} className="sm:w-4 sm:h-4" />
                  </button>
                  <span className="text-[10px] sm:text-xs font-mono px-1 sm:px-2 text-[var(--muted-foreground)] select-none">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
                    className="p-1 sm:p-1.5 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] touch-manipulation cursor-pointer"
                    title="Zoom In"
                    aria-label="Zoom In"
                  >
                    <ZoomIn size={14} className="sm:w-4 sm:h-4" />
                  </button>
                  <button
                    onClick={() => setZoomLevel(1)}
                    className="p-1 sm:p-1.5 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] touch-manipulation hidden sm:inline-flex cursor-pointer"
                    title="Reset Zoom"
                    aria-label="Reset Zoom"
                  >
                    <RotateCcw size={13} />
                  </button>
                </div>

                <button
                  onClick={(e) => handleDownload(activeDiagram, e)}
                  className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-[var(--surface-1)] border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors flex items-center gap-1 text-[11px] sm:text-xs font-medium touch-manipulation cursor-pointer"
                  title="Download blueprint"
                  aria-label="Download blueprint"
                >
                  <Download size={14} />
                  <span className="hidden sm:inline">Download</span>
                </button>

                <button
                  onClick={() => {
                    setActiveDiagram(null);
                    setZoomLevel(1);
                  }}
                  className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-[var(--surface-1)] border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors touch-manipulation cursor-pointer"
                  title="Close modal"
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body / Blueprint View with Dark/Light Mode Filter */}
            <div
              className={cn(
                "flex-1 overflow-auto p-3 sm:p-8 flex items-center justify-center min-h-[240px] sm:min-h-[380px] touch-pan-x touch-pan-y transition-colors duration-300",
                isDark ? "whiteboard-container-dark" : "whiteboard-container-light"
              )}
            >
              <div
                className="transition-transform duration-200 origin-center max-w-full"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                <Image
                  src={activeDiagram.image}
                  alt={activeDiagram.title}
                  width={1400}
                  height={788}
                  sizes="(max-width: 768px) 100vw, 85vw"
                  className={cn(
                    "max-h-[60vh] sm:max-h-[66vh] w-auto h-auto object-contain mx-auto shadow-sm transition-all duration-300",
                    isDark ? "whiteboard-dark" : "whiteboard-light"
                  )}
                  priority
                />
              </div>
            </div>

            {/* Modal Footer / Multi-Perspective Architectural Context */}
            <div className="border-t border-[var(--border)] bg-[var(--surface-2)] flex flex-col max-h-[46vh] sm:max-h-[48vh] overflow-hidden">
              {/* Modal Sub-Tabs */}
              <div className="flex items-center gap-1 px-4 sm:px-6 py-2 border-b border-[var(--border)] bg-[var(--surface-1)] overflow-x-auto scrollbar-none shrink-0">
                <button
                  type="button"
                  onClick={() => setModalTab("architecture")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer",
                    modalTab === "architecture"
                      ? "bg-blue-600 text-white shadow-xs"
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
                        <Sparkles size={13} className="text-blue-500" /> Key Architectural Pillars ({activeDiagram.keyPoints.length})
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
                        <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                          <Cpu size={14} /> Under-The-Hood Engine Mechanisms
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {activeDiagram.technicalMechanisms.map((mech, idx) => (
                            <div key={idx} className="p-2.5 rounded-lg bg-[var(--surface-1)] border border-[var(--border)] text-xs text-[var(--foreground)] flex items-start gap-2">
                              <span className="text-blue-500 font-mono font-bold shrink-0">#{idx + 1}</span>
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
