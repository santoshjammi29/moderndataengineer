import type { Metadata } from "next";
import { buildPageMetadata, generateCourseSchema, generateBreadcrumbSchema } from "@/lib/seo";
import { CONTENT_COUNTS, formatContentCount } from "@/data/content-counts";

export const metadata: Metadata = buildPageMetadata({
  title: `Lakehouse Architecture & Systems Mind Map: ${formatContentCount(CONTENT_COUNTS.concepts)}+ Interactive Nodes`,
  description:
    `Interactive multi-level stretching mind map visualizing Lakehouse Architecture, Medallion layers, Delta Lake internals, Apache Spark, and distributed systems design across ${formatContentCount(CONTENT_COUNTS.concepts)}+ linked concepts.`,
  path: "/mindmap",
  keywords: [
    "Lakehouse Architecture Mind Map",
    "Lakehouse Mindmap",
    "Data Lakehouse Architecture",
    "Delta Lake Topography",
    "Medallion Architecture Tree",
    "Spark Core Mindmap",
    "Fabric Concept Tree",
    "Databricks Architecture Map",
  ],
});

export default function MindmapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = generateCourseSchema({
    name: "Enterprise Data Concepts Multi-Level Mind Map",
    description: `Multi-level stretching mind map organizing ${formatContentCount(CONTENT_COUNTS.concepts)}+ concepts across 13 core technology domains.`,
    url: "/mindmap",
  });

  const breadcrumbsJsonLd = generateBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Concepts Mind Map", path: "/mindmap" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
      {children}
    </>
  );
}
