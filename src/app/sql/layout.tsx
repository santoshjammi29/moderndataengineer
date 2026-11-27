import type { Metadata } from "next";
import {
  buildPageMetadata,
  generateCourseSchema,
  generateHowToSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
} from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Modern SQL Query Execution, Window Functions & Engine Internals Study Guide",
  description:
    "Master SQL from logical clause execution order (S-F-W-G-H-O) to live window function visualization, multi-engine rosetta stone (T-SQL, PostgreSQL, Spark SQL, Snowflake), and production query plan optimization.",
  path: "/sql",
  ogImage: "/diagrams/sql_server_query_engine_optimization-dark.webp",
  keywords: [
    "SQL Study Guide",
    "SQL Query Execution Order",
    "Window Functions Visualizer",
    "SQL Engine Internals",
    "Query Optimization",
    "Execution Plans",
    "T-SQL",
    "Spark SQL",
    "PostgreSQL",
    "Snowflake SQL",
    "Deadlock Triage",
    "Parameter Sniffing",
    "MPP Distribution",
    "Gaps and Islands",
  ],
});

export default function SqlLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const courseJsonLd = generateCourseSchema({
    name: "Modern SQL Mastery & Query Engine Internals",
    description:
      "Interactive comprehensive guide to SQL execution order, window function calculations, cross-engine polyglot syntax, 4-tier interview drills, and database engine internals.",
    url: "/sql",
  });

  const howToJsonLd = generateHowToSchema({
    name: "How Relational and Distributed Query Engines Process SQL Queries",
    description:
      "The logical and physical lifecycle of a SQL query from lexical parsing to row filtering, grouping, window evaluation, and projection.",
    steps: [
      {
        name: "FROM & JOIN Evaluation",
        text: "Resolve tables, evaluate table join conditions, and build the initial working cross-product dataset.",
      },
      {
        name: "WHERE Clause Row Filtering",
        text: "Evaluate sargable predicates against base table columns to discard non-qualifying rows prior to grouping.",
      },
      {
        name: "GROUP BY Aggregation",
        text: "Bucket surviving rows into distinct grouping keys using hash aggregate or sort aggregate operators.",
      },
      {
        name: "HAVING Group Filtering",
        text: "Filter grouped tuples based on aggregate metrics (e.g. COUNT, SUM, AVG) before column projection.",
      },
      {
        name: "SELECT & Window Function Evaluation",
        text: "Evaluate projected scalar expressions, assign aliases, and compute analytical window functions over defined partitions.",
      },
      {
        name: "ORDER BY & Paging",
        text: "Sort final tuples using memory worktables or TempDB spool, and apply LIMIT/OFFSET or FETCH FIRST boundaries.",
      },
    ],
  });

  const breadcrumbsJsonLd = generateBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Code Practice", path: "/code-practice" },
    { name: "SQL Mastery Guide", path: "/sql" },
  ]);

  const faqJsonLd = generateFAQSchema([
    {
      question: "What is the logical execution order of a SQL query?",
      answer:
        "The standard logical order is FROM/JOIN -> WHERE -> GROUP BY -> HAVING -> SELECT -> WINDOW -> DISTINCT -> ORDER BY -> LIMIT/OFFSET. This is why column aliases defined in the SELECT clause cannot be referenced in the WHERE or HAVING clauses in standard SQL.",
    },
    {
      question: "What is the difference between ROW_NUMBER(), RANK(), and DENSE_RANK()?",
      answer:
        "ROW_NUMBER assigns strictly sequential integers (1, 2, 3, 4). RANK assigns the same value to tied records and leaves gaps (1, 2, 2, 4). DENSE_RANK assigns the same value to tied records without leaving gaps (1, 2, 2, 3).",
    },
    {
      question: "What causes parameter sniffing in SQL query engines?",
      answer:
        "Parameter sniffing occurs when the cost-based optimizer compiles an execution plan tailored to the specific parameter values passed on the first execution. If subsequent executions pass parameter values with vastly different cardinality, the cached plan can cause catastrophic table scans or spill.",
    },
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {children}
    </>
  );
}
