"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  ExternalLink,
  Folder,
  FileCode2,
  ChevronRight,
  ChevronDown,
  Layers,
  Sparkles,
  BookOpen,
  Workflow,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Database,
  ArrowRight,
  FileText,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PRODUCTION_DEEP_DIVES,
  ProductionDomain,
  ProductionTopic,
} from "@/data/production-deep-dives-data";
import {
  COMPLETE_LEARNING_TREE,
  LabTreeNode,
} from "@/data/learning-tree-data";

export function LabTreeView() {
  const [activeSubTab, setActiveSubTab] = useState<"dives" | "tree">("dives");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomainId, setSelectedDomainId] = useState<string>("ALL");
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    root: true,
    curriculum: true,
    "guided-tiers": true,
    "career-paths": false,
    concepts: true,
    glossary: true,
    labs: true,
    "lab-14": true,
    "lab-15": true,
  });

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const expandAll = () => {
    const allIds: Record<string, boolean> = {};
    const traverse = (node: LabTreeNode) => {
      allIds[node.id] = true;
      if (node.children) node.children.forEach(traverse);
    };
    traverse(COMPLETE_LEARNING_TREE);
    setExpandedNodes(allIds);
  };

  const collapseAll = () => {
    setExpandedNodes({ root: true });
  };

  // Filter 130 topics
  const filteredDomains = useMemo(() => {
    return PRODUCTION_DEEP_DIVES.map((domain) => {
      if (selectedDomainId !== "ALL" && domain.id !== selectedDomainId) {
        return null;
      }

      const matchingTopics = domain.topics.filter((topic) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          topic.title.toLowerCase().includes(q) ||
          topic.summary.toLowerCase().includes(q) ||
          topic.labFolder.toLowerCase().includes(q) ||
          domain.title.toLowerCase().includes(q)
        );
      });

      if (matchingTopics.length === 0) return null;

      return {
        ...domain,
        topics: matchingTopics,
      };
    }).filter(Boolean) as ProductionDomain[];
  }, [searchQuery, selectedDomainId]);

  const totalFilteredTopics = useMemo(() => {
    return filteredDomains.reduce((acc, d) => acc + d.topics.length, 0);
  }, [filteredDomains]);

  return (
    <div className="space-y-6">
      {/* ── Summary & Stats Header ────────────────────────────────────── */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4 sm:p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                130 Production Deep Dives
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                16 Lab Suites
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                152 SDLC Controls
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[var(--foreground)] tracking-tight">
              Production Engineering Deep Dives &amp; Master Lab Tree
            </h2>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              Researched against primary vendor documentation, Apache specifications, and production incident postmortems.
              Explore 13 cutting-edge production tracks or browse the multi-level hands-on lab tree.
            </p>
          </div>

          {/* Sub-view switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] shrink-0 self-start md:self-center">
            <button
              onClick={() => setActiveSubTab("dives")}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-md transition-all",
                activeSubTab === "dives"
                  ? "bg-[var(--surface-1)] text-[var(--foreground)] shadow-xs"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              )}
            >
              130 Deep Dives (13 Domains)
            </button>
            <button
              onClick={() => setActiveSubTab("tree")}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-md transition-all",
                activeSubTab === "tree"
                  ? "bg-[var(--surface-1)] text-[var(--foreground)] shadow-xs"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              )}
            >
              Full Lab Directory Tree
            </button>
          </div>
        </div>
      </div>

      {/* ── SUB-VIEW 1: 130 PRODUCTION DEEP DIVES ───────────────────────── */}
      {activeSubTab === "dives" && (
        <div className="space-y-4">
          {/* Search and Domain Pill Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 130 production topics, mechanisms, or lab folders..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[var(--border)] bg-[var(--surface-1)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-hidden focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="text-xs text-[var(--muted-foreground)] flex items-center gap-2">
              <span>Showing <strong className="text-[var(--foreground)]">{totalFilteredTopics}</strong> of 130 topics</span>
              {selectedDomainId !== "ALL" && (
                <button
                  onClick={() => setSelectedDomainId("ALL")}
                  className="text-blue-400 hover:underline"
                >
                  Reset Domain Filter
                </button>
              )}
            </div>
          </div>

          {/* Domain Category Filter Badges */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
            <button
              onClick={() => setSelectedDomainId("ALL")}
              className={cn(
                "px-2.5 py-1 text-[11px] font-semibold rounded-lg border whitespace-nowrap transition-colors",
                selectedDomainId === "ALL"
                  ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                  : "bg-[var(--surface-2)] text-[var(--muted-foreground)] border-[var(--border)] hover:text-[var(--foreground)]"
              )}
            >
              All 13 Domains (130)
            </button>
            {PRODUCTION_DEEP_DIVES.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDomainId(d.id)}
                className={cn(
                  "px-2.5 py-1 text-[11px] font-semibold rounded-lg border whitespace-nowrap transition-colors flex items-center gap-1.5",
                  selectedDomainId === d.id
                    ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                    : "bg-[var(--surface-2)] text-[var(--muted-foreground)] border-[var(--border)] hover:text-[var(--foreground)]"
                )}
              >
                <span>{d.icon}</span>
                <span>{d.title}</span>
              </button>
            ))}
          </div>

          {/* Domain Groups Grid */}
          <div className="space-y-4">
            {filteredDomains.map((domain) => (
              <div
                key={domain.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] overflow-hidden shadow-xs"
              >
                {/* Domain Header */}
                <div className="p-3.5 sm:p-4 border-b border-[var(--border)] bg-[var(--surface-2)] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl shrink-0">{domain.icon}</span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface-3)] text-[var(--muted-foreground)] border border-[var(--border)]">
                          Track {domain.domainNumber}
                        </span>
                        <h3 className="text-sm font-bold text-[var(--foreground)]">
                          {domain.title}
                        </h3>
                        <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {domain.topics.length} Production Topics
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Research Anchors */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-[var(--muted-foreground)]">Research Anchors:</span>
                    {domain.researchAnchors.map((anchor, idx) => (
                      <a
                        key={idx}
                        href={anchor.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-[var(--surface-1)] text-blue-400 border border-[var(--border)] hover:border-blue-500/40 hover:underline"
                      >
                        <span>{anchor.label}</span>
                        <ExternalLink size={10} />
                      </a>
                    ))}
                  </div>
                </div>

                {/* Topics Grid */}
                <div className="p-3 sm:p-4 grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {domain.topics.map((topic) => (
                    <div
                      key={topic.id}
                      className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] hover:border-[var(--border-hover)] transition-all flex flex-col justify-between gap-2"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            #{topic.id}
                          </span>
                          <span className="text-[10px] font-mono text-[var(--muted-foreground)] truncate max-w-[200px]">
                            {topic.labFolder}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-[var(--foreground)] leading-snug">
                          {topic.title}
                        </h4>
                        <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                          {topic.summary}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]/60 text-[10px] gap-2">
                        <span className="text-[var(--muted-foreground)] flex items-center gap-1 min-w-0 truncate">
                          <Folder size={11} className="text-amber-400 shrink-0" />
                          <span className="truncate">labs/14-production-deep-dives/{topic.labFolder}</span>
                        </span>
                        <div className="flex items-center gap-2 shrink-0 font-medium">
                          <Link
                            href={`/concepts?q=${encodeURIComponent(topic.title)}`}
                            className="text-emerald-400 hover:underline"
                            title="View Related Concepts"
                          >
                            Concept
                          </Link>
                          <Link
                            href={`/qa-prep?q=${encodeURIComponent(topic.title)}`}
                            className="text-blue-400 hover:underline"
                            title="Drill Interview Q&A"
                          >
                            Drill QA
                          </Link>
                          <Link
                            href={`/architecture?search=${encodeURIComponent(topic.title)}`}
                            className="text-purple-400 hover:underline flex items-center gap-0.5"
                            title="Explore Scenarios"
                          >
                            <span>Scenarios</span>
                            <ArrowRight size={10} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SUB-VIEW 2: FULL LAB DIRECTORY TREE ───────────────────────── */}
      {activeSubTab === "tree" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-[var(--muted-foreground)]">
              Hierarchical view of the unified curriculum, paths, checklists, concepts glossary, and 16 hands-on lab suites.
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={expandAll}
                className="px-2.5 py-1 text-xs rounded border border-[var(--border)] bg-[var(--surface-2)] text-[var(--foreground)] hover:bg-[var(--surface-3)]"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="px-2.5 py-1 text-xs rounded border border-[var(--border)] bg-[var(--surface-2)] text-[var(--foreground)] hover:bg-[var(--surface-3)]"
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* Tree Container */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4 font-mono text-xs overflow-x-auto">
            <TreeNodeItem
              node={COMPLETE_LEARNING_TREE}
              depth={0}
              expandedNodes={expandedNodes}
              onToggle={toggleNode}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function TreeNodeItem({
  node,
  depth,
  expandedNodes,
  onToggle,
}: {
  node: LabTreeNode;
  depth: number;
  expandedNodes: Record<string, boolean>;
  onToggle: (id: string) => void;
}) {
  const isExpanded = expandedNodes[node.id] ?? false;
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="space-y-1">
      <div
        className={cn(
          "flex items-center gap-2 py-1 px-2 rounded-md hover:bg-[var(--surface-2)] transition-colors select-none",
          depth > 0 && "ml-4"
        )}
      >
        {hasChildren ? (
          <button
            onClick={() => onToggle(node.id)}
            className="p-0.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <span className="w-4" />
        )}

        {node.type === "folder" ? (
          <Folder size={15} className="text-amber-400 shrink-0" />
        ) : (
          <FileCode2 size={15} className="text-blue-400 shrink-0" />
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-[var(--foreground)]">{node.name}</span>
          {node.badge && (
            <span className="text-[10px] font-sans px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
              {node.badge}
            </span>
          )}
          {node.description && (
            <span className="text-[11px] font-sans text-[var(--muted-foreground)]">
              — {node.description}
            </span>
          )}
          {node.href && (
            <Link
              href={node.href}
              className="text-[10px] font-sans text-blue-400 hover:underline flex items-center gap-0.5"
            >
              <span>View</span>
              <ArrowRight size={10} />
            </Link>
          )}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="border-l border-[var(--border)] ml-3 pl-1">
          {node.children!.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              expandedNodes={expandedNodes}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
