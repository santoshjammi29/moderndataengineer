"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { Layers, Sparkles, BookOpen, Compass, Code2 } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { SITEMAP_SECTIONS } from "@/data/navigation-data";

function AllPagesFooterInner() {
  return (
    <footer
      className="mt-16 border-t border-[var(--border)] bg-[var(--surface-1)] text-[var(--foreground)]"
      role="contentinfo"
      aria-label="Platform Architecture Notes and Sitemap Footer"
    >
      <div className="mx-auto w-full max-w-7xl 2xl:max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Revamped High-Signal Platform Architecture Note */}
        <div className="p-4 sm:p-6 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-2xs">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <BrandLogo size={28} className="rounded-lg shadow-xs" />
              <h3 className="font-bold text-sm sm:text-base text-[var(--foreground)] tracking-tight">
                Lakehouse Architect Notes
              </h3>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                2026 Edition
              </span>
            </div>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              Curated enterprise reference platform and system design workbench for Principal Architects and Senior Data Engineers. Deep dives across Microsoft Fabric OneLake &amp; Direct Lake, Databricks Unity Catalog &amp; Photon Engine, Open Storage Formats (Delta Lake, Apache Iceberg, Apache Parquet), and high-scale Medallion Lakehouse architectures.
            </p>
          </div>

          {/* Meaningful Platform Metrics — Verified Real Counts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2 text-xs font-mono shrink-0">
            <div className="px-3 py-1.5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] flex items-center gap-2">
              <BookOpen size={13} className="text-blue-500 shrink-0" />
              <div>
                <span className="block font-bold text-[var(--foreground)]">11,500+</span>
                <span className="text-[10px] text-[var(--muted-foreground)]">Verified Assets</span>
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] flex items-center gap-2">
              <Layers size={13} className="text-emerald-500 shrink-0" />
              <div>
                <span className="block font-bold text-[var(--foreground)]">42 Blueprints</span>
                <span className="text-[10px] text-[var(--muted-foreground)]">Whiteboard Hub</span>
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] flex items-center gap-2">
              <Compass size={13} className="text-purple-500 shrink-0" />
              <div>
                <span className="block font-bold text-[var(--foreground)]">156 Profiles</span>
                <span className="text-[10px] text-[var(--muted-foreground)]">GCC &amp; BigTech</span>
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] flex items-center gap-2">
              <Sparkles size={13} className="text-amber-500 shrink-0" />
              <div>
                <span className="block font-bold text-[var(--foreground)]">679 Concepts</span>
                <span className="text-[10px] text-[var(--muted-foreground)]">Architecture Map</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Comprehensive All Pages & Subpages Visual Sitemap ── */}
        <div className="pt-2 border-t border-[var(--border)]">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              Platform Directory &amp; Navigation Tree
            </span>
            <span className="text-[10px] font-mono text-[var(--muted-foreground)]">
              All Hubs &amp; Subpages
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
            {SITEMAP_SECTIONS.map((section) => (
              <div key={section.title} className="space-y-3">
                <div className="flex items-center justify-between pb-1.5 border-b border-[var(--border)]">
                  <h4 className="font-semibold text-xs text-[var(--foreground)]">
                    {section.title}
                  </h4>
                  {section.badge && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface-2)] text-[var(--muted-foreground)]">
                      {section.badge}
                    </span>
                  )}
                </div>

                <ul className="space-y-2">
                  {section.pages.map((page) => (
                    <li key={page.href} className="space-y-1">
                      <div className="flex items-center justify-between group">
                        <Link
                          href={page.href}
                          className="font-medium text-[var(--foreground)] hover:text-blue-500 transition-colors flex items-center gap-1.5"
                        >
                          <span className="truncate">{page.label}</span>
                        </Link>
                        {page.badge && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                            {page.badge}
                          </span>
                        )}
                      </div>

                      {/* Subpages Tree */}
                      {page.subpages && page.subpages.length > 0 && (
                        <ul className="ml-2 pl-2.5 border-l border-[var(--border)] space-y-1 mt-1">
                          {page.subpages.map((sub) => (
                            <li key={sub.href} className="flex items-center justify-between text-[11px] group">
                              <Link
                                href={sub.href}
                                className="text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors truncate"
                              >
                                {sub.label}
                              </Link>
                              {sub.badge && (
                                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[var(--surface-2)] text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] shrink-0 ml-1">
                                  {sub.badge}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Minimal Copyright */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[var(--muted-foreground)] border-t border-[var(--border)]">
          <p>
            © 2026 Lakehouse Architect (<a href="https://moderndataengineer.uk" className="hover:text-blue-500 underline underline-offset-2">moderndataengineer.uk</a>) • Enterprise Data Platform Architecture &amp; System Design Portal.
          </p>
          <span className="font-mono text-[10px] text-[var(--muted-foreground)] hidden sm:inline">
            moderndataengineer.uk
          </span>
        </div>
      </div>
    </footer>
  );
}

export function AllPagesFooter() {
  return (
    <Suspense fallback={null}>
      <AllPagesFooterInner />
    </Suspense>
  );
}
