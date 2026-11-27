import type { Metadata } from "next";
import { buildPageMetadata, generateCourseSchema } from "@/lib/seo";
import { CONTENT_COUNTS } from "@/data/content-counts";

export const metadata: Metadata = buildPageMetadata({
  title: `Data Architecture & System Design Whiteboards (${CONTENT_COUNTS.whiteboards} Blueprints)`,
  description:
    "Production-grade architecture diagrams, system design blueprints, and trade-off matrices for Microsoft Fabric, OneLake, Databricks Unity Catalog, Delta Lake, and Apache Airflow.",
  path: "/architecture",
  ogImage: "/diagrams/fabric_onelake_architecture-dark.webp",
  keywords: [
    "Lakehouse System Design",
    "Data Architecture Diagrams",
    "Fabric OneLake Whiteboard",
    "Databricks Medallion Blueprint",
    "Unity Catalog Governance Architecture",
    "Kafka Debezium CDC Pipeline",
  ],
});

export default function ArchitectureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = generateCourseSchema({
    name: "Enterprise Data Platform System Design & Whiteboard Architecture",
    description: `${CONTENT_COUNTS.whiteboards} production-grade whiteboard blueprints and interactive system design trade-offs.`,
    url: "/architecture",
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
