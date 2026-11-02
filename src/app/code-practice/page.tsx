import { Metadata } from "next";
import { Suspense } from "react";
import { getCodePracticeDataDAL, getDatabricksCodingHubDAL } from "@/lib/dal";
import { CodePracticeClient } from "./code-practice-client";
import { generatePageMetadata, generateCourseSchema } from "@/lib/seo";

export const dynamic = "force-static";

export async function generateMetadata(): Promise<Metadata> {
  const [data, databricksData] = await Promise.all([
    getCodePracticeDataDAL(),
    getDatabricksCodingHubDAL(),
  ]);
  const total =
    data.pyspark.length +
    data.sparksql.length +
    data.mssql.length +
    data.python.length +
    databricksData.suite.cards.length +
    databricksData.operations.length;
  return generatePageMetadata({
    title: `Unified Code Practice Hub (${total}+ Operations) | PySpark, SQL, Databricks & Runbooks`,
    description: `The definitive code practice and production runbooks reference for data engineers: PySpark 4.0, Spark SQL, T-SQL, Python & Polars, Databricks 148+ operations, and polyglot translation matrix.`,
    path: "/code-practice",
    keywords: [
      "PySpark Code Practice",
      "Databricks Coding Hub",
      "Spark SQL Exercises",
      "Polyglot Translation Matrix",
      "Data Engineering Python Runbooks",
    ],
  });
}

export default async function CodePracticePage() {
  const [data, databricksData] = await Promise.all([
    getCodePracticeDataDAL(),
    getDatabricksCodingHubDAL(),
  ]);

  const courseSchema = generateCourseSchema(
    "Unified Data Engineering Code Practice & Runbooks Hub",
    "Production-grade coding drills and incident runbooks across PySpark, Spark SQL, T-SQL, Python, and Databricks."
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
            <div className="flex items-center gap-3 text-sm text-[var(--muted-foreground)]">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span>Loading Unified Code Practice Hub...</span>
            </div>
          </div>
        }
      >
        <CodePracticeClient initialData={data} databricksData={databricksData} />
      </Suspense>
    </>
  );
}
