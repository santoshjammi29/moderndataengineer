import type { Metadata } from "next";
import { buildPageMetadata, generateCourseSchema, generateHowToSchema, generateBreadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Apache Spark Catalyst Optimizer & Interactive Plan Visualizer",
  description:
    "Interactive Spark Catalyst query plan visualizer, multi-stage optimization pipeline (Analysis, Logical Optimization, Physical Planning, CodeGen), Adaptive Query Execution (AQE), and live physical execution simulator.",
  path: "/spark-catalyst",
  ogImage: "/diagrams/catalyst_photon_engine.webp",
  keywords: [
    "Catalyst Optimizer",
    "Spark Query Optimizer",
    "Spark Visualizer",
    "Adaptive Query Execution",
    "AQE",
    "Whole-Stage CodeGen",
    "Photon Engine",
    "Logical Plan Optimization",
    "Physical Plan Spark",
    "Predicate Pushdown",
    "Broadcast Hash Join",
  ],
});

export default function SparkCatalystLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const courseJsonLd = generateCourseSchema({
    name: "Apache Spark Catalyst Optimizer & Physical Execution Visualizer",
    description:
      "Deep dive into Spark Catalyst query optimization pipeline, rule-based transforms, cost-based planning, Whole-Stage CodeGen, and live physical stage simulator.",
    url: "/spark-catalyst",
  });

  const howToJsonLd = generateHowToSchema({
    name: "How Spark Catalyst Optimizes and Executes Distributed Queries",
    description:
      "Step-by-step breakdown of query compilation from unresolved AST to optimized physical execution plans and native bytecode.",
    steps: [
      { name: "Analysis & Catalog Resolution", text: "Resolve table names, column schemas, and types against Hive Metastore or Unity Catalog." },
      { name: "Logical Plan Optimization", text: "Apply rule-based heuristics: predicate pushdown, column pruning, and constant folding." },
      { name: "Physical Planning & CBO", text: "Select optimal physical join strategies (BHJ, SMJ, Shuffled Hash Join) using cost estimates." },
      { name: "Code Generation & Execution", text: "Compile whole-stage Java bytecode in memory using Janino and execute with native vectorized Photon C++." },
    ],
  });

  const breadcrumbsJsonLd = generateBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Spark Engine Lab", path: "/spark-engine" },
    { name: "Catalyst Optimizer & Visualizer", path: "/spark-catalyst" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
      {children}
    </>
  );
}
