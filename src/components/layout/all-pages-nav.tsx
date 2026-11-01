"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Search,
  ChevronDown,
  Route,
  BookOpen,
  Layers,
  Cpu,
  Zap,
  Code2,
  FileCode2,
  MessageSquare,
  User,
  Home,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { isSubHrefActive } from "@/data/navigation-data";

interface SubpageLink {
  label: string;
  href: string;
  badge?: string;
  description?: string;
}

interface NavSection {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  subpages?: SubpageLink[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    id: "home",
    label: "Home",
    href: "/",
    icon: Home,
  },
  {
    id: "search-topics",
    label: "Search Topics",
    href: "/search-topics",
    icon: Search,
    badge: "New",
  },
  {
    id: "guided-learning",
    label: "Guided Learning",
    href: "/guided-learning",
    icon: Route,
    badge: "Tracks",
    subpages: [
      { label: "Topic Tracks", href: "/guided-learning", description: "Structured step-by-step learning tracks" },
      { label: "Career Curricula", href: "/guided-learning?tab=curricula", badge: "12 Paths", description: "Role-based roadmaps for architects" },
      { label: "Lab & Topic Tree", href: "/guided-learning?tab=tree", badge: "130 Dives", description: "Interactive deep-dive concept inventory" },
      { label: "Learning Portal", href: "/learning-paths", description: "Modular self-paced learning portal" },
    ],
  },
  {
    id: "concepts",
    label: "Concepts",
    href: "/concepts",
    icon: BookOpen,
    badge: "679",
    subpages: [
      { label: "Glossary & Cards", href: "/concepts", badge: "679", description: "Searchable core concept definitions" },
      { label: "Concepts Mind Map", href: "/concepts?view=mindmap", badge: "14 Pillars", description: "Visual node graph of lakehouse ideas" },
      { label: "Lakehouse Concepts", href: "/modern-stack?tab=concepts", badge: "FinOps", description: "Storage, compute, and transaction primitives" },
    ],
  },
  {
    id: "architecture",
    label: "Architecture",
    href: "/architecture",
    icon: Layers,
    badge: "3.2k+",
    subpages: [
      { label: "Whiteboard Mastery Hub", href: "/whiteboards", badge: "42 Blueprints", description: "Illustrated whiteboard systems blueprints" },
      { label: "System Scenarios", href: "/architecture?tab=scenarios", badge: "3,214", description: "End-to-end distributed system designs" },
      { label: "Whiteboard Diagrams", href: "/architecture?tab=diagrams", badge: "42", description: "Detailed architectural SVG diagrams" },
      { label: "Python Runbooks", href: "/architecture?tab=python", badge: "42", description: "Production Python lakehouse runbooks" },
    ],
  },
  {
    id: "spark-engine",
    label: "Spark Lab",
    href: "/spark-engine",
    icon: Cpu,
    badge: "Live",
    subpages: [
      { label: "Engine & Memory Lab", href: "/spark-engine", badge: "85 Rules", description: "Internal memory, GC, and execution mechanics" },
      { label: "Catalyst Optimizer", href: "/spark-catalyst", badge: "Interactive", description: "AST rewrites, cost-based optimizer & AQE" },
      { label: "Execution Visualizer", href: "/visualizer", badge: "Simulator", description: "Step-by-step query execution animator" },
    ],
  },
  {
    id: "modern-stack",
    label: "Modern Stack & DataOps",
    href: "/modern-stack",
    icon: Zap,
    badge: "Matrix",
    subpages: [
      { label: "Cloud × Table Matrix", href: "/modern-stack?tab=compatibility", badge: "Compatibility", description: "Azure, AWS, GCP table format support" },
      { label: "FinOps & Cost Playbooks", href: "/modern-stack?tab=cost", description: "DBU, compute, and warehouse cost engineering" },
      { label: "Polyglot Code Matrix", href: "/modern-stack?tab=matrix", badge: "Matrix", description: "Side-by-side PySpark, SQL, DuckDB, Polars" },
      { label: "Tool Secrets & Connectivity", href: "/dataops?tab=connectivity", badge: "Secrets", description: "Key Vault, Managed Identity, and PATs" },
      { label: "CI/CD Pipelines", href: "/dataops?tab=cicd", badge: "5 Paths", description: "GitHub Actions, Azure DevOps, DABs" },
      { label: "360° SDLC Lifecycle", href: "/dataops?tab=lifecycle", badge: "152 Controls", description: "NIST SSDF & SRE production controls" },
      { label: "Architecture Flow", href: "/dataops?tab=diagram", badge: "Flow", description: "5-column interactive architecture canvas" },
    ],
  },
  {
    id: "code-practice",
    label: "Code Practice",
    href: "/code-practice",
    icon: Code2,
    badge: "178",
    subpages: [
      { label: "Coding Hub", href: "/code-practice", description: "All practice drills across languages" },
      { label: "Databricks Coding Hub", href: "/code-practice/databricks", badge: "148 Drills", description: "Interactive PySpark, SQL, and DBFS triage" },
      { label: "PySpark Drills", href: "/code-practice?db=pyspark", badge: "51", description: "DataFrame transformations & window functions" },
      { label: "Spark SQL Drills", href: "/code-practice?db=sparksql", badge: "50", description: "Advanced SQL analytics & CTE patterns" },
      { label: "T-SQL Drills", href: "/code-practice?db=mssql", badge: "35", description: "Fabric warehouse & SQL database queries" },
      { label: "Python & Polars", href: "/code-practice?db=python", badge: "42", description: "Modern zero-copy DataFrame engineering" },
    ],
  },
  {
    id: "cheat-sheet",
    label: "Cheat Sheets",
    href: "/cheat-sheet",
    icon: FileCode2,
    badge: "PDFs",
    subpages: [
      { label: "Production Runbooks", href: "/cheat-sheet?tab=runbooks", badge: "76", description: "Severity-1 triage & emergency commands" },
      { label: "Databricks Cheat Sheets", href: "/cheat-sheet?tab=databricks", badge: "48", description: "Photon, Spark conf, and DBFS cheat codes" },
      { label: "A4 PDF Reference Hub", href: "/cheat-sheet?tab=pdf_hub", badge: "7 PDFs", description: "Printable high-density architect sheets" },
    ],
  },
  {
    id: "qa-prep",
    label: "Interview Bank",
    href: "/qa-prep",
    icon: MessageSquare,
    badge: "7.1k+",
    subpages: [
      { label: "Question Drill Bank", href: "/qa-prep", badge: "7,080+", description: "Architect scenarios with SM-2 spaced repetition" },
      { label: "Target Company Intel", href: "/company-research", badge: "156 GCCs", description: "Interview rubrics, hiring GCCs & salary bands" },
    ],
  },
  {
    id: "studio",
    label: "My Studio",
    href: "/studio",
    icon: User,
    badge: "Personal",
  },
];

function AllPagesNavInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams?.toString();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const navContainerRef = useRef<HTMLDivElement | null>(null);

  const openSearch = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-command-palette"));
    }
  };

  // Close dropdown on outside click or escape
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (navContainerRef.current && !navContainerRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Close dropdown when route/URL search changes
  useEffect(() => {
    setOpenDropdown(null);
  }, [pathname, searchParamsString]);

  const isSectionActive = (section: NavSection) => {
    if (!pathname) return false;
    if (section.href === "/" && pathname === "/") return true;
    if (section.href !== "/" && pathname.startsWith(section.href)) return true;
    if (section.subpages?.some((sub) => isSubHrefActive(pathname, searchParams, sub.href))) {
      return true;
    }
    return false;
  };

  return (
    <div
      ref={navContainerRef}
      className="w-full bg-[var(--surface-1)] border-b border-[var(--border)] select-none shadow-2xs relative z-20"
    >
      <div className="mx-auto w-full max-w-7xl 2xl:max-w-[1600px] px-3 sm:px-6 lg:px-8 py-2.5 space-y-2">
        {/* Universal Search Bar */}
        <div role="search" aria-label="Universal Search Header">
          <button
            type="button"
            onClick={openSearch}
            className="w-full flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--border)] hover:border-blue-500/40 text-left transition-all duration-150 group shadow-2xs cursor-pointer"
            aria-label="Universal search across all Q&As, concepts, architecture blueprints, and topics"
          >
            <div className="flex items-center gap-2.5 min-w-0 text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]">
              <Search size={15} className="shrink-0 text-blue-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs sm:text-sm font-medium truncate">
                Search 11,500+ Q&As, concepts, 42 architecture blueprints, system design...
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-medium text-[var(--muted-foreground)]">
                Quick Open
              </span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-semibold rounded-md bg-[var(--surface-1)] text-[var(--muted-foreground)] border border-[var(--border)] shadow-2xs">
                ⌘K
              </kbd>
            </div>
          </button>
        </div>

        {/* All Subsections & Subpages Navigation Bar */}
        <nav
          aria-label="All Sections and Subpages Navigation"
          className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1 -mx-1 px-1"
        >
          {NAV_SECTIONS.map((section) => {
            const Icon = section.icon;
            const active = isSectionActive(section);
            const hasSubpages = Boolean(section.subpages && section.subpages.length > 0);
            const isOpen = openDropdown === section.id;

            return (
              <div key={section.id} className="relative shrink-0">
                <div
                  className={cn(
                    "flex items-center rounded-lg border text-xs font-semibold transition-all duration-150",
                    active
                      ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                      : "bg-[var(--surface-2)] text-[var(--muted-foreground)] border-[var(--border)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)]"
                  )}
                >
                  <Link
                    href={section.href}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-l-lg hover:text-[var(--foreground)] transition-colors whitespace-nowrap"
                  >
                    <Icon size={13} className={cn(active ? "text-blue-400" : "text-[var(--muted-foreground)]")} />
                    <span>{section.label}</span>
                    {section.badge && (
                      <span
                        className={cn(
                          "text-[9px] px-1.5 py-0.2 rounded font-mono font-normal border hidden sm:inline-block",
                          active
                            ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                            : "bg-[var(--surface-1)] text-[var(--muted-foreground)] border-[var(--border)]"
                        )}
                      >
                        {section.badge}
                      </span>
                    )}
                  </Link>

                  {hasSubpages && (
                    <button
                      type="button"
                      onClick={() => setOpenDropdown((prev) => (prev === section.id ? null : section.id))}
                      className={cn(
                        "p-1.5 rounded-r-lg border-l transition-colors cursor-pointer",
                        active ? "border-blue-500/30 hover:bg-blue-500/20" : "border-[var(--border)] hover:bg-[var(--surface-1)]"
                      )}
                      aria-expanded={isOpen}
                      aria-label={`Show subsections for ${section.label}`}
                      title={`View all ${section.label} subsections and subpages`}
                    >
                      <ChevronDown
                        size={12}
                        className={cn("transition-transform duration-200", isOpen && "rotate-180")}
                      />
                    </button>
                  )}
                </div>

                {/* Subsections Dropdown Menu */}
                {hasSubpages && isOpen && (
                  <div
                    role="menu"
                    className="absolute left-0 top-full mt-1.5 w-64 sm:w-72 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 space-y-0.5"
                  >
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] flex items-center justify-between border-b border-[var(--border)]/60 mb-1">
                      <span>{section.label} Subsections</span>
                      <span className="text-[9px] font-normal">{section.subpages?.length} subpages</span>
                    </div>

                    {section.subpages?.map((sub) => {
                      const isSubActive = isSubHrefActive(pathname, searchParams, sub.href);
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          role="menuitem"
                          onClick={() => setOpenDropdown(null)}
                          className={cn(
                            "flex items-start justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors",
                            isSubActive
                              ? "bg-blue-500/15 text-blue-300 font-semibold"
                              : "hover:bg-[var(--surface-2)] text-[var(--foreground)] font-medium"
                          )}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="truncate">{sub.label}</span>
                              {isSubActive && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
                            </div>
                            {sub.description && (
                              <p className="text-[10px] text-[var(--muted-foreground)] truncate mt-0.5 font-normal">
                                {sub.description}
                              </p>
                            )}
                          </div>
                          {sub.badge && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-[var(--surface-2)] text-blue-400 border border-[var(--border)] shrink-0">
                              {sub.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export function AllPagesNav() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-24 bg-[var(--surface-1)] border-b border-[var(--border)] animate-pulse" />
      }
    >
      <AllPagesNavInner />
    </Suspense>
  );
}
