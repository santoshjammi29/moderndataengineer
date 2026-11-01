import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchTopicsClient } from "./search-topics-client";
import { buildPageMetadata, generateFAQSchema, generateBreadcrumbSchema } from "@/lib/seo";

export const dynamic = "force-static";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Search Topics & Questions — 11,500+ Lakehouse Architecture Assets",
    description:
      "Ask any question or topic across 11,500+ verified interview questions, architectural scenarios, key concepts, and code drills. Read full in-depth content directly inline without leaving the page.",
    path: "/search-topics",
    keywords: [
      "Search Topics",
      "Lakehouse Architecture Search",
      "Data Engineering Questions",
      "Spark Performance Tuning",
      "Delta Lake Architecture",
      "Microsoft Fabric Scenarios",
      "Databricks Architecture Questions",
      "Adaptive Query Execution",
      "Medallion Architecture Search",
      "Direct Lake Power BI",
    ],
  });
}

export default function SearchTopicsPage() {
  const faqJsonLd = generateFAQSchema([
    {
      question: "How does the Search Topics engine find relevant architecture and interview content?",
      answer:
        "The Search Topics engine uses Google-grade BM25F field-weighted retrieval across 11,500+ curated items, combining typo tolerance, domain acronym expansion, keyword in context (KWIC), and multi-word proximity scoring.",
    },
    {
      question: "Can I read full answers and architectural scenarios directly on this page?",
      answer:
        "Yes. Every search result item can be expanded inline to reveal the full structured content — including step-by-step solutions, code snippets, trade-offs, and failure mode triage.",
    },
    {
      question: "What categories of content are searchable?",
      answer:
        "You can search across Q&A Interview Prep, System Architecture Scenarios, 679 Concepts, Code Practice Drills, Emergency Cheat Sheets, Whiteboard Blueprints, Guided Tracks, and Tier-1 GCC Company Profiles.",
    },
  ]);

  const breadcrumbJsonLd = generateBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Search Topics", path: "/search-topics" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <Suspense
          fallback={
            <div className="p-12 text-center text-sm text-[var(--muted-foreground)]">
              Loading Universal Topic Search Engine...
            </div>
          }
        >
          <SearchTopicsClient />
        </Suspense>
      </div>
    </>
  );
}
