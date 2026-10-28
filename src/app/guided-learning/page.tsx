import { Suspense } from "react";
import type { Metadata } from "next";
import { GuidedLearningClient } from "./guided-learning-client";
import { buildPageMetadata, generateCourseSchema } from "@/lib/seo";
import { GUIDED_TOPICS } from "@/data/guided-learning-topics";
import { getLearningPathsDAL } from "@/lib/dal";

export const dynamic = "force-static";

export async function generateMetadata(): Promise<Metadata> {
  const paths = await getLearningPathsDAL();
  return buildPageMetadata({
    title: `Guided Learning, Technical Roadmaps & Career Curricula (${GUIDED_TOPICS.length} Tracks · ${paths.length} Paths)`,
    description: `Structured curriculum covering ${GUIDED_TOPICS.length} specialized topic tracks and ${paths.length} week-by-week career roadmaps from data fundamentals to Principal Data Architect mastery with continuous reading mode.`,
    path: "/guided-learning",
    keywords: [
      "Data Engineering Roadmap",
      "Fabric Learning Path",
      "Databricks Certification Path",
      "PySpark Mastery",
      "Architect Milestones",
      "Lakehouse Curriculum",
      "Career Curricula",
    ],
  });
}

export default async function GuidedLearningPage() {
  const paths = await getLearningPathsDAL();

  const courseJsonLd = generateCourseSchema({
    name: "Enterprise Data Platform Guided Learning Paths & Career Curricula",
    description: `Structured multi-stage roadmaps across ${GUIDED_TOPICS.length} topics and ${paths.length} role-based career paths for mastering modern lakehouse engineering and architecture.`,
    url: "/guided-learning",
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />
      <Suspense
        fallback={
          <div className="py-20 text-center text-sm text-[var(--muted-foreground)]">
            Loading Guided Learning Journeys &amp; Career Curricula...
          </div>
        }
      >
        <GuidedLearningClient initialPaths={paths} />
      </Suspense>
    </>
  );
}
