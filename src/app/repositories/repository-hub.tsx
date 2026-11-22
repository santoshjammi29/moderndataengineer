"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Code2,
  Database,
  ExternalLink,
  Github,
  GraduationCap,
  Layers,
  Search,
  ShieldCheck,
  Sparkles,
  Terminal,
  X,
} from "lucide-react";
import {
  LEARNING_PATHS,
  REPOSITORIES,
  REPOSITORY_FILTERS,
  type RepositoryFilter,
  type ProjectRepository,
} from "@/data/repositories";

const CATEGORY_STYLES: Record<string, string> = {
  Platform: "border-cyan-400/25 bg-cyan-400/10 text-cyan-200",
  Handbooks: "border-blue-400/25 bg-blue-400/10 text-blue-200",
  "Azure & Blueprints": "border-violet-400/25 bg-violet-400/10 text-violet-200",
  Experiments: "border-amber-400/25 bg-amber-400/10 text-amber-200",
  Profile: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
};

const FEATURE_LINKS = [
  {
    title: "Architecture explorer",
    description: "Browse whiteboard blueprints, distributed-system scenarios, and visual architecture references.",
    href: "/architecture?tab=diagrams",
    label: "Open diagrams",
    icon: Layers,
    accent: "text-violet-300",
  },
  {
    title: "PySpark practice",
    description: "Work through hands-on DataFrame, Spark SQL, performance, and troubleshooting drills.",
    href: "/code-practice?db=pyspark",
    label: "Open PySpark drills",
    icon: Code2,
    accent: "text-cyan-300",
  },
  {
    title: "SQL practice",
    description: "Practise query patterns, execution order, joins, window functions, and optimization.",
    href: "/sql?tab=drills",
    label: "Open SQL drills",
    icon: Database,
    accent: "text-emerald-300",
  },
  {
    title: "Code and runbooks",
    description: "Read syntax-highlighted examples and production-oriented code across the engineering stack.",
    href: "/code-practice",
    label: "Explore code practice",
    icon: Terminal,
    accent: "text-amber-300",
  },
  {
    title: "Learning paths",
    description: "Follow a staged route from foundations through distributed compute to architecture.",
    href: "/learning-paths",
    label: "View learning paths",
    icon: GraduationCap,
    accent: "text-blue-300",
  },
  {
    title: "My progress",
    description: "Return to your personal study workspace, saved material, and learning progress.",
    href: "/studio",
    label: "Open my studio",
    icon: CheckCircle2,
    accent: "text-teal-300",
  },
];

function RepositoryCard({ repository }: { repository: ProjectRepository }) {
  return (
    <article
      className={[
        "group flex h-full flex-col rounded-2xl border p-5 transition-all duration-200",
        "border-[var(--border)] bg-[var(--surface-1)] hover:-translate-y-0.5 hover:border-blue-400/35 hover:bg-[var(--surface-2)] hover:shadow-xl",
        repository.featured ? "shadow-[0_0_0_1px_rgba(59,130,246,0.08)]" : "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--foreground)]">
            <Github size={19} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold tracking-tight text-[var(--foreground)] sm:text-base">
              {repository.title}
            </h3>
            <p className="mt-0.5 break-all font-mono text-[10px] text-[var(--muted-foreground)]">
              {repository.name}
            </p>
          </div>
        </div>
        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${CATEGORY_STYLES[repository.category]}`}>
          {repository.category}
        </span>
      </div>

      <p className="mt-4 flex-1 text-sm leading-6 text-[var(--muted-foreground)]">
        {repository.description}
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {repository.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 text-[10px] font-medium text-[var(--muted-foreground)]"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[var(--border)] pt-4">
        {repository.portalHref && (
          repository.portalHref.startsWith("http") ? (
            <a
              href={repository.portalHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-300 transition-colors hover:text-blue-200"
            >
              {repository.portalLabel ?? "Open project"}
              <ExternalLink size={12} />
            </a>
          ) : (
            <Link
              href={repository.portalHref}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-300 transition-colors hover:text-blue-200"
            >
              {repository.portalLabel ?? "Explore in portal"}
              <ArrowRight size={12} />
            </Link>
          )
        )}
        <a
          href={repository.githubUrl}
          target="_blank"
          rel="noreferrer"
          className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
        >
          GitHub
          <ArrowUpRight size={13} />
        </a>
      </div>
    </article>
  );
}

export function RepositoryHub() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<RepositoryFilter>("All");

  const filteredRepositories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return REPOSITORIES.filter((repository) => {
      const categoryMatches =
        activeFilter === "All" || repository.category === activeFilter;

      if (!categoryMatches) return false;
      if (!normalizedQuery) return true;

      const searchableText = [
        repository.title,
        repository.name,
        repository.description,
        repository.category,
        ...repository.tags,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [activeFilter, query]);

  const openGlobalSearch = () => {
    window.dispatchEvent(new Event("open-command-palette"));
  };

  const handbookCount = REPOSITORIES.filter(
    (repository) => repository.category === "Handbooks"
  ).length;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 pb-16">
      <section className="relative overflow-hidden rounded-3xl border border-blue-400/20 bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.18),transparent_42%),linear-gradient(135deg,#0b1220_0%,#101a2c_55%,#111827_100%)] p-6 shadow-2xl sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(260px,0.7fr)] lg:items-end">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-200">
              <Sparkles size={13} />
              Open engineering ecosystem
            </div>

            <div className="space-y-3">
              <h1 className="max-w-3xl text-3xl font-black tracking-tight text-white [text-wrap:balance] sm:text-4xl lg:text-5xl">
                One library. Every layer of modern data engineering.
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Explore the connected handbooks, architecture blueprints, experiments, and interactive learning tools behind the Modern Data Engineer platform.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={openGlobalSearch}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-950/40 transition-all hover:bg-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
              >
                <Search size={14} />
                Search the knowledge base
                <kbd className="rounded-md border border-white/20 bg-white/10 px-1.5 py-0.5 font-mono text-[10px]">
                  ⌘K
                </kbd>
              </button>
              <Link
                href="/learning-paths"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-white/10"
              >
                <GraduationCap size={14} />
                Explore learning paths
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-4 backdrop-blur">
              <p className="text-3xl font-black tabular-nums text-white">{REPOSITORIES.length}</p>
              <p className="mt-1 text-[11px] font-medium text-slate-400">Public repositories</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-4 backdrop-blur">
              <p className="text-3xl font-black tabular-nums text-white">{handbookCount}</p>
              <p className="mt-1 text-[11px] font-medium text-slate-400">Focused handbooks</p>
            </div>
            <div className="col-span-2 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06] p-4">
              <div className="flex items-center gap-2 text-cyan-200">
                <Github size={15} />
                <span className="text-xs font-bold">GitHub remains the source of truth</span>
              </div>
              <p className="mt-1.5 text-xs leading-5 text-slate-400">
                Each card opens its source repository. The portal adds a consistent discovery and learning layer without duplicating project history.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="repositories-heading" className="space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300">Project directory</p>
            <h2 id="repositories-heading" className="text-2xl font-extrabold tracking-tight text-[var(--foreground)]">
              Explore the repositories
            </h2>
            <p className="text-sm text-[var(--muted-foreground)]">
              Filter by domain or search across project names, descriptions, and technologies.
            </p>
          </div>

          <label className="relative block w-full lg:max-w-sm">
            <span className="sr-only">Search repositories</span>
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search Spark, SQL, Databricks..."
              className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-1)] pl-10 pr-10 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted-foreground)] focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/10"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear repository search"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                <X size={14} />
              </button>
            )}
          </label>
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter repositories by category">
          {REPOSITORY_FILTERS.map((filter) => {
            const selected = filter === activeFilter;
            return (
              <button
                key={filter}
                type="button"
                aria-pressed={selected}
                onClick={() => setActiveFilter(filter)}
                className={[
                  "rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors",
                  selected
                    ? "border-blue-400/40 bg-blue-400/15 text-blue-200"
                    : "border-[var(--border)] bg-[var(--surface-1)] text-[var(--muted-foreground)] hover:border-[var(--border-hover)] hover:text-[var(--foreground)]",
                ].join(" ")}
              >
                {filter}
              </button>
            );
          })}
          <span className="ml-auto self-center text-xs tabular-nums text-[var(--muted-foreground)]">
            {filteredRepositories.length} of {REPOSITORIES.length}
          </span>
        </div>

        {filteredRepositories.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredRepositories.map((repository) => (
              <RepositoryCard key={repository.slug} repository={repository} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-1)] px-6 py-12 text-center">
            <Search size={24} className="mx-auto text-[var(--muted-foreground)]" />
            <h3 className="mt-3 text-sm font-bold text-[var(--foreground)]">No matching repositories</h3>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">Try another keyword or clear the current filters.</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setActiveFilter("All");
              }}
              className="mt-4 text-xs font-semibold text-blue-300 hover:text-blue-200"
            >
              Reset filters
            </button>
          </div>
        )}
      </section>

      <section aria-labelledby="paths-heading" className="space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-300">Curated progression</p>
            <h2 id="paths-heading" className="text-2xl font-extrabold tracking-tight text-[var(--foreground)]">
              Learning paths through the ecosystem
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
              A practical sequence that connects the source repositories to the interactive lessons and labs already available in the portal.
            </p>
          </div>
          <Link href="/learning-paths" className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-300 hover:text-blue-200">
            Full learning catalogue <ArrowUpRight size={13} />
          </Link>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {LEARNING_PATHS.map((path) => (
            <article key={path.number} className="flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-violet-300">{path.number}</span>
                <span className="h-px w-12 bg-gradient-to-r from-violet-400/60 to-transparent" />
              </div>
              <h3 className="mt-4 text-sm font-bold text-[var(--foreground)]">{path.title}</h3>
              <p className="mt-2 flex-1 text-xs leading-5 text-[var(--muted-foreground)]">{path.description}</p>
              <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-violet-300">{path.focus}</p>
              <Link href={path.href} className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-blue-300 hover:text-blue-200">
                Start this stage <ArrowRight size={13} />
              </Link>
              <a
                href={REPOSITORIES.find((repository) => repository.slug === path.repository)?.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 font-mono text-[10px] text-[var(--muted-foreground)] transition-colors hover:text-blue-300"
              >
                Source: {path.repositoryLabel} <ExternalLink size={10} />
              </a>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="toolkit-heading" className="space-y-5">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">One connected workspace</p>
          <h2 id="toolkit-heading" className="text-2xl font-extrabold tracking-tight text-[var(--foreground)]">
            Learn, practise, visualize, and track
          </h2>
          <p className="text-sm text-[var(--muted-foreground)]">
            These are existing platform capabilities surfaced together here, not parallel tools that need separate accounts or setup.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {FEATURE_LINKS.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.title}
                href={feature.href}
                className="group rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-5 transition-all hover:border-blue-400/35 hover:bg-[var(--surface-2)]"
              >
                <div className="flex items-center justify-between">
                  <Icon size={19} className={feature.accent} />
                  <ArrowUpRight size={14} className="text-[var(--muted-foreground)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-blue-300" />
                </div>
                <h3 className="mt-4 text-sm font-bold text-[var(--foreground)]">{feature.title}</h3>
                <p className="mt-1.5 min-h-10 text-xs leading-5 text-[var(--muted-foreground)]">{feature.description}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-300">
                  {feature.label} <ArrowRight size={12} />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-emerald-400/20 bg-[linear-gradient(115deg,rgba(16,185,129,0.08),rgba(59,130,246,0.07))] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-2.5 text-emerald-300">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--foreground)]">Your learning progress stays in your workspace</h2>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-[var(--muted-foreground)]">
                Use My Studio to return to saved topics and review your progress. Repository browsing remains public; personal learning state stays in the existing study workspace.
              </p>
            </div>
          </div>
          <Link href="/studio" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-emerald-300/25 bg-emerald-300/10 px-4 py-2.5 text-xs font-bold text-emerald-200 transition-colors hover:bg-emerald-300/15">
            Open My Studio <ArrowUpRight size={13} />
          </Link>
        </div>
      </section>

      <p className="text-center text-[10px] leading-5 text-[var(--muted-foreground)]">
        Repository catalogue is a curated directory of public projects. Source code, history, issues, and contribution workflows remain in GitHub.
      </p>
    </div>
  );
}
