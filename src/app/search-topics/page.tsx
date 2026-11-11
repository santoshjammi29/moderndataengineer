import { CONTENT_COUNTS, formatContentCount } from "@/data/content-counts";
import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchTopicsClient } from "./search-topics-client";
import { buildPageMetadata, generateFAQSchema, generateBreadcrumbSchema } from "@/lib/seo";

export const dynamic = "force-static";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: `Search ${formatContentCount(CONTENT_COUNTS.searchDocuments)} Data Engineering Topics & Questions`,
    description:
      `Search ${formatContentCount(CONTENT_COUNTS.searchDocuments)} learning items across interview questions, architecture scenarios, concepts, and code drills. Read full content inline.`,
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
        `The Search Topics engine uses field-weighted retrieval across ${formatContentCount(CONTENT_COUNTS.searchDocuments)} catalog items, with typo tolerance, domain acronym expansion, and multi-word matching.`,
    },
    {
      question: "Can I read full answers and architectural scenarios directly on this page?",
      answer:
        "Yes. Every search result item can be expanded inline to reveal the full structured content — including step-by-step solutions, code snippets, trade-offs, and failure mode triage.",
    },
    {
      question: "What categories of content are searchable?",
      answer:
        `You can search across Q&A Interview Prep, System Architecture Scenarios, ${formatContentCount(CONTENT_COUNTS.concepts)} Concepts, Code Practice Drills, Cheat Sheets, Whiteboard Blueprints, Guided Tracks, and Company Profiles.`,
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
      <div className="w-full max-w-7xl 2xl:max-w-[1800px] 3xl:max-w-[2200px] 4xl:max-w-none mx-auto px-2 sm:px-4 2xl:px-6 py-4 sm:py-6">
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
