import { Suspense } from "react";
import type { Metadata } from "next";
import { WhiteboardsClient } from "./whiteboards-client";
import { buildPageMetadata, generateCourseSchema, generateBreadcrumbSchema } from "@/lib/seo";
import { TOTAL_WHITEBOARDS_COUNT, WHITEBOARD_CATEGORIES } from "@/data/whiteboards-learning-data";

export const dynamic = "force-static";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: `Whiteboard Architecture Mastery: ${TOTAL_WHITEBOARDS_COUNT} Blueprints across ${WHITEBOARD_CATEGORIES.length} Pillars | Lakehouse Architect`,
    description: `Interactive reference connecting ${TOTAL_WHITEBOARDS_COUNT} high-resolution digital whiteboard blueprints, key concepts, technical Q&A, and production system blueprints across ${WHITEBOARD_CATEGORIES.length} architectural categories.`,
    path: "/whiteboards",
    keywords: [
      "Whiteboard Architecture",
      "Data Platform Blueprints",
      "Lakehouse Architecture Diagrams",
      "Spark Optimization Whiteboards",
      "Delta Lake Under the Hood",
      "Fabric OneLake Architecture",
      "Airflow Architecture Whiteboard",
      "System Design Blueprints",
      "Data Engineer Architecture",
      "Distributed Systems Blueprints",
    ],
  });
}

export default function WhiteboardsPage() {
  const courseJsonLd = generateCourseSchema({
    name: "Enterprise Data Platform Whiteboard Architecture Mastery",
    description: `Complete category-by-category visual architecture curriculum combining ${TOTAL_WHITEBOARDS_COUNT} hand-drawn digital blueprints, core concepts, interview Q&A, and production system designs.`,
    url: "/whiteboards",
  });

  const breadcrumbJsonLd = generateBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Whiteboard Architecture Learning Hub", path: "/whiteboards" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Suspense
        fallback={
          <div className="py-24 text-center text-sm text-[var(--muted-foreground)] flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
            <p>Loading Whiteboard Architecture Learning Hub...</p>
          </div>
        }
      >
        <WhiteboardsClient />
      </Suspense>
    </>
  );
}
