import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { CONTENT_COUNTS, formatContentCount } from "@/data/content-counts";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Concepts Multi-Level Mind Map (Unified Under Single Roof)",
    description:
      `Interactive multi-level stretching mind map organizing ${formatContentCount(CONTENT_COUNTS.concepts)}+ concepts across Microsoft Fabric, Databricks, Apache Spark, Delta Lake, Airflow, and Distributed Systems.`,
    path: "/concepts?view=mindmap",
    keywords: [
      "Concepts Mind Map",
      "Data Engineering Mindmap",
      "Fabric Concept Tree",
      "Databricks Architecture Map",
      "Spark Core Mindmap",
      "Delta Lake Topography",
      "Distributed Systems Concepts",
    ],
  });
}

export default function MindmapPage() {
  redirect("/concepts?view=mindmap");
}
