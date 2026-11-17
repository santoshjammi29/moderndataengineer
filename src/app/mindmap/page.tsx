import type { Metadata } from "next";
import { getConceptsDAL } from "@/lib/dal";
import { buildPageMetadata } from "@/lib/seo";
import { CONTENT_COUNTS, formatContentCount } from "@/data/content-counts";
import { MindmapClient } from "./mindmap-client";

export const dynamic = "force-static";

export async function generateMetadata(): Promise<Metadata> {
  const concepts = await getConceptsDAL();
  return buildPageMetadata({
    title: `Enterprise Data Platform Concepts Linked Mind Map (${concepts.length} Terms)`,
    description:
      `Interactive linked mind map visualizing ${concepts.length} concepts across 14 technology domains and 46 subtopics with hierarchical links and names-only node topology.`,
    path: "/mindmap",
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

export default async function MindmapPage() {
  const concepts = await getConceptsDAL();
  return <MindmapClient concepts={concepts} />;
}
