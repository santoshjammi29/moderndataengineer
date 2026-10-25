import { NextResponse } from "next/server";

export const dynamic = "force-static";

export async function GET() {
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://moderndataengineer.uk";
  const feedXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Lakehouse Architect - Modern Lakehouse Architecture &amp; Systems</title>
  <link>${BASE_URL}</link>
  <description>The definitive open-access enterprise reference platform for Lakehouse Architecture, Medallion Architecture, Microsoft Fabric OneLake, Databricks Delta Lake, and Apache Spark 4.0.</description>
  <language>en-us</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />
  
  <item>
    <title>Lakehouse Architecture: The Definitive Systems Blueprint</title>
    <link>${BASE_URL}/</link>
    <guid>${BASE_URL}/#blueprint</guid>
    <pubDate>${new Date().toUTCString()}</pubDate>
    <description>Comprehensive architectural guide to building, governing, and scaling high-performance modern data lakehouses using Delta Lake, Apache Iceberg, Unity Catalog, and Microsoft Fabric.</description>
  </item>
  
  <item>
    <title>Enterprise Lakehouse Architecture Hub (3,206+ Scenarios)</title>
    <link>${BASE_URL}/architecture</link>
    <guid>${BASE_URL}/architecture</guid>
    <pubDate>${new Date().toUTCString()}</pubDate>
    <description>3,206+ real-world production system design scenarios, distributed failure modes, and architectural trade-offs for Lead Data Engineers and Architects.</description>
  </item>

  <item>
    <title>Lakehouse Concepts &amp; Architecture Glossary (679 Terms)</title>
    <link>${BASE_URL}/concepts</link>
    <guid>${BASE_URL}/concepts</guid>
    <pubDate>${new Date().toUTCString()}</pubDate>
    <description>Complete architectural lexicon covering Delta Lake internals, Liquid Clustering, Apache Iceberg metadata tree, and Unity Catalog 3-level namespace.</description>
  </item>

  <item>
    <title>Production Cheat Sheets &amp; Compiled Master Vector PDFs</title>
    <link>${BASE_URL}/cheat-sheet</link>
    <guid>${BASE_URL}/cheat-sheet</guid>
    <pubDate>${new Date().toUTCString()}</pubDate>
    <description>124+ production runbooks and 7 downloadable high-resolution vector PDFs covering PySpark, Databricks, Incident Runbooks, and Master Reference.</description>
  </item>

  <item>
    <title>Databricks Unified Operations Hub &amp; Memory Bottleneck Triage</title>
    <link>${BASE_URL}/code-practice/databricks</link>
    <guid>${BASE_URL}/code-practice/databricks</guid>
    <pubDate>${new Date().toUTCString()}</pubDate>
    <description>148+ Databricks operations with code snippets, Unity Catalog Volumes, DBFS commands, and Sev-1 Driver OOM, Executor OOM, and Skew Join triage runbooks.</description>
  </item>

  <item>
    <title>Apache Spark 4.0 Lakehouse Compute Engine Lab</title>
    <link>${BASE_URL}/spark-engine</link>
    <guid>${BASE_URL}/spark-engine</guid>
    <pubDate>${new Date().toUTCString()}</pubDate>
    <description>Interactive visual runtime simulator of Apache Spark 4.0 Catalyst Optimizer, Tungsten memory allocator, and shuffle stage mechanics.</description>
  </item>
</channel>
</rss>`;

  return new NextResponse(feedXml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
