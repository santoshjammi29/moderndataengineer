'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Star,
  GitFork,
  ExternalLink,
  FileText,
  LayoutGrid,
  Table as TableIcon,
  Layers,
  Sparkles,
  Calendar,
  Lock,
  Check,
  Copy,
  X,
  BookOpen,
  ArrowUpDown,
  ShieldCheck,
} from 'lucide-react';

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  topics: string[];
  updated_at: string;
  pushed_at: string;
  created_at: string;
  archived: boolean;
  fork: boolean;
}

// Fallback seed data if GitHub public API rate-limits or is offline
const SEED_REPOS: GitHubRepo[] = [
  {
    id: 1,
    name: 'moderndataengineer',
    full_name: 'santoshjammi29/moderndataengineer',
    description: 'The Open-Access Enterprise Data Engineering & Lakehouse Systems Encyclopedia. 11,360+ verified assets across 921 concepts.',
    html_url: 'https://github.com/santoshjammi29/moderndataengineer',
    homepage: 'https://moderndataengineer.uk',
    stargazers_count: 142,
    forks_count: 38,
    open_issues_count: 0,
    language: 'TypeScript',
    topics: ['lakehouse', 'apache-spark', 'delta-lake', 'databricks', 'nextjs', 'featured'],
    updated_at: new Date().toISOString(),
    pushed_at: new Date().toISOString(),
    created_at: '2024-01-15T00:00:00Z',
    archived: false,
    fork: false,
  },
  {
    id: 2,
    name: 'databricks-handbook',
    full_name: 'santoshjammi29/databricks-handbook',
    description: '105 Production Coding Recipes, Unity Catalog Governance, Delta Lake 3.x, Lakeflow, Photon & Incident Runbooks.',
    html_url: 'https://github.com/santoshjammi29/databricks-handbook',
    homepage: 'https://moderndataengineer.uk/code-practice',
    stargazers_count: 89,
    forks_count: 24,
    open_issues_count: 0,
    language: 'Python',
    topics: ['databricks', 'delta-lake', 'unity-catalog', 'photon', 'dabs', 'featured'],
    updated_at: new Date().toISOString(),
    pushed_at: new Date().toISOString(),
    created_at: '2024-02-10T00:00:00Z',
    archived: false,
    fork: false,
  },
  {
    id: 3,
    name: 'pyspark-handbook',
    full_name: 'santoshjammi29/pyspark-handbook',
    description: '105 Production Coding Use Cases, Performance Tuning Recipes, Lakehouse Masterclass & Incident Runbooks.',
    html_url: 'https://github.com/santoshjammi29/pyspark-handbook',
    homepage: 'https://moderndataengineer.uk/code-practice',
    stargazers_count: 94,
    forks_count: 31,
    open_issues_count: 0,
    language: 'Python',
    topics: ['pyspark', 'apache-spark', 'catalyst-optimizer', 'lakehouse', 'featured'],
    updated_at: new Date().toISOString(),
    pushed_at: new Date().toISOString(),
    created_at: '2024-02-12T00:00:00Z',
    archived: false,
    fork: false,
  },
  {
    id: 4,
    name: 'sql-handbook',
    full_name: 'santoshjammi29/sql-handbook',
    description: '105 Production Coding Use Cases, Query Optimization Recipes, MPP Architectures & Incident Runbooks.',
    html_url: 'https://github.com/santoshjammi29/sql-handbook',
    homepage: 'https://moderndataengineer.uk/sql',
    stargazers_count: 76,
    forks_count: 19,
    open_issues_count: 0,
    language: 'SQL',
    topics: ['sql', 'query-optimization', 'data-modeling', 'duckdb', 'mpp'],
    updated_at: new Date().toISOString(),
    pushed_at: new Date().toISOString(),
    created_at: '2024-03-01T00:00:00Z',
    archived: false,
    fork: false,
  },
  {
    id: 5,
    name: 'streaming-handbook',
    full_name: 'santoshjammi29/streaming-handbook',
    description: 'Enterprise Reference Architecture for Real-Time Event Streaming, Kafka, Azure Event Hubs, RocksDB & Structured Streaming.',
    html_url: 'https://github.com/santoshjammi29/streaming-handbook',
    homepage: 'https://moderndataengineer.uk/architecture',
    stargazers_count: 65,
    forks_count: 14,
    open_issues_count: 0,
    language: 'Python',
    topics: ['streaming', 'kafka', 'event-hubs', 'structured-streaming', 'rocksdb'],
    updated_at: new Date().toISOString(),
    pushed_at: new Date().toISOString(),
    created_at: '2024-03-15T00:00:00Z',
    archived: false,
    fork: false,
  },
  {
    id: 6,
    name: 'security-handbook',
    full_name: 'santoshjammi29/security-handbook',
    description: 'Enterprise Cloud Perimeter Defense, Zero-Trust OIDC, Envelope Encryption & Unity Catalog Access Control.',
    html_url: 'https://github.com/santoshjammi29/security-handbook',
    homepage: 'https://moderndataengineer.uk/security',
    stargazers_count: 58,
    forks_count: 12,
    open_issues_count: 0,
    language: 'Python',
    topics: ['security', 'zero-trust', 'oidc', 'encryption', 'gdpr', 'unity-catalog'],
    updated_at: new Date().toISOString(),
    pushed_at: new Date().toISOString(),
    created_at: '2024-03-20T00:00:00Z',
    archived: false,
    fork: false,
  },
  {
    id: 7,
    name: 'azure-cheat-sheet',
    full_name: 'santoshjammi29/azure-cheat-sheet',
    description: 'The Modern Microsoft Azure Developer & Architect Cheat Sheet. 300+ Services, Fabric (DP-600), GenAI & Bicep IaC.',
    html_url: 'https://github.com/santoshjammi29/azure-cheat-sheet',
    homepage: 'https://azurecheatsheet.com',
    stargazers_count: 83,
    forks_count: 22,
    open_issues_count: 0,
    language: 'Bicep',
    topics: ['azure', 'microsoft-fabric', 'bicep', 'finops', 'cheatsheet'],
    updated_at: new Date().toISOString(),
    pushed_at: new Date().toISOString(),
    created_at: '2024-01-20T00:00:00Z',
    archived: false,
    fork: false,
  },
  {
    id: 8,
    name: 'data-system-design-handbook',
    full_name: 'santoshjammi29/data-system-design-handbook',
    description: 'Enterprise Lakehouse Reference Architecture, High-Throughput Ingestion & Medallion Design Patterns.',
    html_url: 'https://github.com/santoshjammi29/data-system-design-handbook',
    homepage: 'https://moderndataengineer.uk/blueprints',
    stargazers_count: 67,
    forks_count: 16,
    open_issues_count: 0,
    language: 'Markdown',
    topics: ['system-design', 'architecture', 'lakehouse', 'distributed-systems'],
    updated_at: new Date().toISOString(),
    pushed_at: new Date().toISOString(),
    created_at: '2024-04-01T00:00:00Z',
    archived: false,
    fork: false,
  },
  {
    id: 9,
    name: 'data-engineering-interview-handbook',
    full_name: 'santoshjammi29/data-engineering-interview-handbook',
    description: 'Architectural Defense Playbook & 595 Problems across 20 Knowledge Pillars for Senior & Staff Data Engineers.',
    html_url: 'https://github.com/santoshjammi29/data-engineering-interview-handbook',
    homepage: 'https://moderndataengineer.uk/qa-prep',
    stargazers_count: 72,
    forks_count: 20,
    open_issues_count: 0,
    language: 'Python',
    topics: ['interview-prep', 'data-engineering', 'spark', 'system-design'],
    updated_at: new Date().toISOString(),
    pushed_at: new Date().toISOString(),
    created_at: '2024-04-10T00:00:00Z',
    archived: false,
    fork: false,
  },
  {
    id: 10,
    name: 'dbt-handbook',
    full_name: 'santoshjammi29/dbt-handbook',
    description: 'Enterprise dbt Mesh, Semantic Layer, Incremental Models, Contracts & Slim CI Verification.',
    html_url: 'https://github.com/santoshjammi29/dbt-handbook',
    homepage: 'https://moderndataengineer.uk',
    stargazers_count: 49,
    forks_count: 11,
    open_issues_count: 0,
    language: 'SQL',
    topics: ['dbt', 'analytics-engineering', 'data-modeling', 'dbt-mesh'],
    updated_at: new Date().toISOString(),
    pushed_at: new Date().toISOString(),
    created_at: '2024-04-15T00:00:00Z',
    archived: false,
    fork: false,
  },
  {
    id: 11,
    name: 'dataops-cicd-handbook',
    full_name: 'santoshjammi29/dataops-cicd-handbook',
    description: 'DataOps, Multi-Environment Databricks Asset Bundles (DABs), Terraform IaC & Zero-Downtime Lakehouse Cutover.',
    html_url: 'https://github.com/santoshjammi29/dataops-cicd-handbook',
    homepage: 'https://moderndataengineer.uk/dataops',
    stargazers_count: 53,
    forks_count: 13,
    open_issues_count: 0,
    language: 'HCL',
    topics: ['dataops', 'cicd', 'terraform', 'dabs', 'github-actions'],
    updated_at: new Date().toISOString(),
    pushed_at: new Date().toISOString(),
    created_at: '2024-04-20T00:00:00Z',
    archived: false,
    fork: false,
  },
  {
    id: 12,
    name: 'azure-databricks-project-blueprints',
    full_name: 'santoshjammi29/azure-databricks-project-blueprints',
    description: 'Production blueprints for Retail Lakehouse, Real-Time Fraud AML & Legacy Warehouse Cutover.',
    html_url: 'https://github.com/santoshjammi29/azure-databricks-project-blueprints',
    homepage: 'https://moderndataengineer.uk/blueprints',
    stargazers_count: 61,
    forks_count: 15,
    open_issues_count: 0,
    language: 'Python',
    topics: ['azure', 'databricks', 'lakehouse', 'blueprints', 'fraud-detection'],
    updated_at: new Date().toISOString(),
    pushed_at: new Date().toISOString(),
    created_at: '2024-05-01T00:00:00Z',
    archived: false,
    fork: false,
  },
  {
    id: 13,
    name: 'enterprise-banking-risk-alm-lakehouse',
    full_name: 'santoshjammi29/enterprise-banking-risk-alm-lakehouse',
    description: 'European Banking Regulations Reference Architecture (DNB, ECB, BCBS 239, IFRS 9, IRRBB) on Azure Databricks.',
    html_url: 'https://github.com/santoshjammi29/enterprise-banking-risk-alm-lakehouse',
    homepage: 'https://moderndataengineer.uk/blueprints',
    stargazers_count: 44,
    forks_count: 8,
    open_issues_count: 0,
    language: 'Python',
    topics: ['banking', 'risk-management', 'alm', 'ifrs9', 'databricks'],
    updated_at: new Date().toISOString(),
    pushed_at: new Date().toISOString(),
    created_at: '2024-05-15T00:00:00Z',
    archived: false,
    fork: false,
  },
  {
    id: 14,
    name: 'spark-experiments',
    full_name: 'santoshjammi29/spark-experiments',
    description: 'Deep-dive Spark performance tuning experiments, shuffle spill diagnostics, and skew salting benchmarks.',
    html_url: 'https://github.com/santoshjammi29/spark-experiments',
    homepage: 'https://youtube.com',
    stargazers_count: 38,
    forks_count: 9,
    open_issues_count: 0,
    language: 'Python',
    topics: ['spark', 'performance-tuning', 'benchmarks', 'skew-salting'],
    updated_at: new Date().toISOString(),
    pushed_at: new Date().toISOString(),
    created_at: '2024-06-01T00:00:00Z',
    archived: false,
    fork: false,
  },
  {
    id: 15,
    name: 'SantoshJammiProfile',
    full_name: 'santoshjammi29/SantoshJammiProfile',
    description: 'Official GitHub profile configuration and interactive portfolio assets.',
    html_url: 'https://github.com/santoshjammi29/SantoshJammiProfile',
    homepage: 'https://santoshjammi29.github.io/SantoshJammiProfile',
    stargazers_count: 27,
    forks_count: 5,
    open_issues_count: 0,
    language: 'HTML',
    topics: ['portfolio', 'resume', 'svg-banners', 'profile'],
    updated_at: new Date().toISOString(),
    pushed_at: new Date().toISOString(),
    created_at: '2023-11-01T00:00:00Z',
    archived: false,
    fork: false,
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Repositories', icon: '⚡' },
  { id: 'featured', label: '⭐ Flagship Hubs', icon: '⭐' },
  { id: 'compute', label: '⚡ Spark & Compute', icon: '⚡' },
  { id: 'lakehouse', label: '🏛️ Architecture & Blueprints', icon: '🏛️' },
  { id: 'sql-dbt', label: '🛠️ SQL & Analytics Engineering', icon: '🛠️' },
  { id: 'security', label: '🔒 Cloud Security & DevOps', icon: '🔒' },
  { id: 'streaming', label: '🌊 Real-Time Streaming', icon: '🌊' },
  { id: 'interview', label: '🎯 Interview Defense', icon: '🎯' },
];

export default function ReposPortalPage() {
  const [repos, setRepos] = useState<GitHubRepo[]>(SEED_REPOS);
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'stars' | 'name'>('stars');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [activeReadmeRepo, setActiveReadmeRepo] = useState<GitHubRepo | null>(null);
  const [readmeContent, setReadmeContent] = useState<string>('');
  const [readmeLoading, setReadmeLoading] = useState<boolean>(false);
  const [copiedClone, setCopiedClone] = useState<boolean>(false);

  // Fetch real-time public repositories from GitHub
  useEffect(() => {
    setLoading(true);
    fetch('https://api.github.com/users/santoshjammi29/repos?per_page=100&sort=updated')
      .then((res) => {
        if (!res.ok) throw new Error('API Rate Limited');
        return res.json();
      })
      .then((data: GitHubRepo[]) => {
        if (Array.isArray(data) && data.length > 0) {
          // Merge topics if missing from public response
          const merged = data.map((d) => {
            const seed = SEED_REPOS.find((s) => s.name === d.name);
            return {
              ...d,
              topics: d.topics && d.topics.length > 0 ? d.topics : seed?.topics || [],
            };
          });
          setRepos(merged);
        }
        setLoading(false);
      })
      .catch(() => {
        // Fallback to verified seed dataset
        setRepos(SEED_REPOS);
        setLoading(false);
      });

    // Keyboard shortcut '/' to focus search
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        document.getElementById('repo-search-input')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Drawer README fetch
  useEffect(() => {
    if (!activeReadmeRepo) return;
    setReadmeLoading(true);
    fetch(`https://raw.githubusercontent.com/${activeReadmeRepo.full_name}/main/README.md`)
      .then((res) => {
        if (!res.ok) throw new Error('Could not fetch README');
        return res.text();
      })
      .then((text) => {
        setReadmeContent(text);
        setReadmeLoading(false);
      })
      .catch(() => {
        setReadmeContent('# ' + activeReadmeRepo.name + '\n\n' + (activeReadmeRepo.description || ''));
        setReadmeLoading(false);
      });

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveReadmeRepo(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [activeReadmeRepo]);

  // Compute stats
  const totalStars = useMemo(() => repos.reduce((acc, r) => acc + r.stargazers_count, 0), [repos]);
  const totalForks = useMemo(() => repos.reduce((acc, r) => acc + r.forks_count, 0), [repos]);
  const availableLanguages = useMemo(() => {
    const set = new Set<string>();
    repos.forEach((r) => {
      if (r.language) set.add(r.language);
    });
    return Array.from(set).sort();
  }, [repos]);

  // Filter & Sort
  const filteredRepos = useMemo(() => {
    return repos
      .filter((repo) => {
        if (selectedLanguage && repo.language !== selectedLanguage) return false;

        if (selectedCategory !== 'all') {
          const name = repo.name.toLowerCase();
          const t = repo.topics || [];
          if (selectedCategory === 'featured' && !t.includes('featured') && name !== 'moderndataengineer') return false;
          if (selectedCategory === 'compute' && !name.includes('spark') && !name.includes('databricks')) return false;
          if (selectedCategory === 'lakehouse' && !name.includes('blueprints') && !name.includes('system-design') && !name.includes('banking')) return false;
          if (selectedCategory === 'sql-dbt' && !name.includes('sql') && !name.includes('dbt')) return false;
          if (selectedCategory === 'security' && !name.includes('security') && !name.includes('dataops') && !name.includes('azure-cheat')) return false;
          if (selectedCategory === 'streaming' && !name.includes('streaming')) return false;
          if (selectedCategory === 'interview' && !name.includes('interview')) return false;
        }

        if (search) {
          const q = search.toLowerCase();
          const matchName = repo.name.toLowerCase().includes(q);
          const matchDesc = (repo.description || '').toLowerCase().includes(q);
          const matchTopic = (repo.topics || []).some((topic) => topic.toLowerCase().includes(q));
          if (!matchName && !matchDesc && !matchTopic) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'stars') return b.stargazers_count - a.stargazers_count;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime();
      });
  }, [repos, selectedLanguage, selectedCategory, search, sortBy]);

  const copyCloneUrl = (url: string) => {
    navigator.clipboard.writeText(`git clone ${url}.git`);
    setCopiedClone(true);
    setTimeout(() => setCopiedClone(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top Banner Navigation */}
      <div className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-cyan-500 to-emerald-500 p-0.5 flex items-center justify-center">
              <div className="h-full w-full bg-slate-950 rounded-[7px] flex items-center justify-center">
                <Layers className="h-5 w-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold tracking-tight text-white">
                  santoshjammi29
                </span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
                  REPOSITORIES
                </span>
              </div>
              <p className="text-xs text-slate-400">Production Lakehouse Ecosystem &amp; Coding Handbooks</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 transition"
            >
              ← Back to Main Hub
            </Link>
            <a
              href="https://github.com/santoshjammi29"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-600 transition"
            >
              <span>GitHub Profile</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Telemetry Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
              <span>Total Repositories</span>
              <BookOpen className="h-4 w-4 text-cyan-400" />
            </div>
            <p className="mt-2 font-mono text-2xl font-bold text-white">{repos.length}</p>
            <p className="text-[11px] text-slate-500">Public production assets</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
              <span>Community Stars</span>
              <Star className="h-4 w-4 text-amber-400" />
            </div>
            <p className="mt-2 font-mono text-2xl font-bold text-white">{totalStars}</p>
            <p className="text-[11px] text-slate-500">Verified endorsements</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
              <span>Forks &amp; Clones</span>
              <GitFork className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="mt-2 font-mono text-2xl font-bold text-white">{totalForks}</p>
            <p className="text-[11px] text-slate-500">Downstream deployments</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
              <span>Governance Standard</span>
              <ShieldCheck className="h-4 w-4 text-purple-400" />
            </div>
            <p className="mt-2 font-mono text-2xl font-bold text-white">Zero Trust</p>
            <p className="text-[11px] text-slate-500">GDPR &amp; EU AI Act Ready</p>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="mt-8 flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                    : 'bg-slate-900/70 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search, Filter & View Controls */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3 items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-3">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              id="repo-search-input"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by topic, keyword, or name (Press '/' to focus)..."
              className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 pl-9 pr-9 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-300 focus:border-cyan-500 focus:outline-none"
            >
              <option value="">All Languages</option>
              {availableLanguages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none rounded-lg border border-slate-800 bg-slate-950 pl-8 pr-8 py-2 text-xs text-slate-300 focus:border-cyan-500 focus:outline-none"
              >
                <option value="stars">Most Stars</option>
                <option value="updated">Recently Updated</option>
                <option value="name">Alphabetical</option>
              </select>
              <ArrowUpDown className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            </div>

            <div className="flex items-center rounded-lg border border-slate-800 bg-slate-950 p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded-md p-1.5 transition ${
                  viewMode === 'grid' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Bento Grid"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`rounded-md p-1.5 transition ${
                  viewMode === 'table' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Technical Table"
              >
                <TableIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="mt-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-500">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
              <p className="mt-3 font-mono text-xs">Querying GitHub Public APIs...</p>
            </div>
          ) : filteredRepos.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400 font-mono text-xs">
              No matching repositories found. Adjust search terms or category selection.
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRepos.map((repo, idx) => (
                <div
                  key={repo.id}
                  className={`flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-cyan-500/40 hover:-translate-y-0.5 shadow-sm ${
                    idx === 0 && selectedCategory === 'all'
                      ? 'sm:col-span-2 border-cyan-500/30 bg-gradient-to-br from-cyan-950/20 via-slate-900/60 to-emerald-950/20'
                      : ''
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {repo.language && (
                          <span className="rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 font-mono text-[11px] text-slate-300">
                            {repo.language}
                          </span>
                        )}
                        {idx === 0 && selectedCategory === 'all' && (
                          <span className="rounded-full border border-cyan-500/40 bg-cyan-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-cyan-300 uppercase">
                            FLAGSHIP
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 font-mono text-xs text-slate-400">
                        <span className="flex items-center gap-1 text-slate-300">
                          <Star className="h-3.5 w-3.5 text-amber-400" />
                          {repo.stargazers_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <GitFork className="h-3.5 w-3.5 text-slate-400" />
                          {repo.forks_count}
                        </span>
                      </div>
                    </div>

                    <h3 className="mt-3 font-mono text-base font-bold text-white hover:text-cyan-400 transition">
                      <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                        {repo.name}
                      </a>
                    </h3>

                    <p className="mt-2 text-xs leading-relaxed text-slate-400 line-clamp-2">
                      {repo.description || 'Enterprise data engineering reference repository.'}
                    </p>

                    {repo.topics && repo.topics.length > 0 && (
                      <div className="mt-3.5 flex flex-wrap gap-1.5">
                        {repo.topics.slice(0, 4).map((topic) => (
                          <span
                            key={topic}
                            className="rounded border border-slate-800 bg-slate-950 px-2 py-0.5 font-mono text-[10px] text-slate-400"
                          >
                            #{topic}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-800 pt-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5 font-mono text-[11px]">
                      <Calendar className="h-3 w-3 text-slate-600" />
                      {new Date(repo.pushed_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveReadmeRepo(repo)}
                        className="flex items-center gap-1 rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-200 hover:bg-slate-700"
                      >
                        <FileText className="h-3 w-3 text-cyan-400" />
                        README
                      </button>

                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-md border border-slate-800 p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                        title="Open on GitHub"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="border-b border-slate-800 bg-slate-950/60 font-mono text-[11px] uppercase tracking-wider text-slate-400">
                  <tr>
                    <th scope="col" className="px-4 py-3">Repository</th>
                    <th scope="col" className="px-4 py-3">Language</th>
                    <th scope="col" className="px-4 py-3">Stars</th>
                    <th scope="col" className="px-4 py-3">Forks</th>
                    <th scope="col" className="px-4 py-3">Updated</th>
                    <th scope="col" className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredRepos.map((repo) => (
                    <tr key={repo.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-4 py-3.5">
                        <div className="font-mono font-bold text-white hover:text-cyan-400">
                          <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                            {repo.name}
                          </a>
                        </div>
                        <p className="mt-0.5 max-w-lg truncate text-slate-400">{repo.description}</p>
                      </td>

                      <td className="px-4 py-3.5 font-mono">
                        {repo.language || <span className="text-slate-600">—</span>}
                      </td>

                      <td className="px-4 py-3.5 font-mono text-slate-300">
                        <span className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 text-amber-400" />
                          {repo.stargazers_count}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-slate-400">
                        <span className="flex items-center gap-1">
                          <GitFork className="h-3.5 w-3.5 text-slate-500" />
                          {repo.forks_count}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-slate-500 whitespace-nowrap">
                        {new Date(repo.pushed_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setActiveReadmeRepo(repo)}
                            className="rounded border border-slate-700 bg-slate-800 p-1 text-slate-300 hover:bg-slate-700 hover:text-white"
                            title="View README"
                          >
                            <FileText className="h-3.5 w-3.5 text-cyan-400" />
                          </button>
                          <a
                            href={repo.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded border border-slate-700 bg-slate-800 p-1 text-slate-300 hover:bg-slate-700 hover:text-white"
                            title="Open on GitHub"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Slide-over README Drawer */}
      {activeReadmeRepo && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm">
          <div
            className="w-full max-w-3xl border-l border-slate-800 bg-slate-900 p-6 shadow-2xl flex flex-col justify-between overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-cyan-400" />
                  <h2 className="font-mono text-lg font-bold text-white">{activeReadmeRepo.name}</h2>
                </div>
                <button
                  onClick={() => setActiveReadmeRepo(null)}
                  className="rounded-lg border border-slate-700 p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs">
                <div className="flex items-center gap-4 text-slate-300 font-mono">
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-amber-400" />
                    {activeReadmeRepo.stargazers_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitFork className="h-3.5 w-3.5 text-slate-400" />
                    {activeReadmeRepo.forks_count}
                  </span>
                  <span>{activeReadmeRepo.language || 'Documentation'}</span>
                </div>

                <button
                  onClick={() => copyCloneUrl(activeReadmeRepo.html_url)}
                  className="flex items-center gap-1.5 rounded border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] text-slate-200 hover:bg-slate-700"
                >
                  {copiedClone ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedClone ? 'Copied' : 'Clone Repo'}</span>
                </button>
              </div>

              <div className="mt-6">
                {readmeLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
                    <p className="mt-3 font-mono text-xs">Fetching repository README...</p>
                  </div>
                ) : (
                  <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-slate-300 rounded-lg border border-slate-800 bg-slate-950 p-4 overflow-x-auto">
                    {readmeContent}
                  </pre>
                )}
              </div>
            </div>

            <div className="mt-8 border-t border-slate-800 pt-4 flex justify-between items-center text-xs">
              <span className="text-slate-500 font-mono">Verified Production Repository</span>
              <a
                href={activeReadmeRepo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 font-medium text-cyan-400 hover:underline"
              >
                Open on GitHub
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
