import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    title: "Mastery Stages & Systems Lifecycle | Unified Architecture & Delivery Stages",
    description:
      "Explore all architectural stages across the modern data platform: 4-Stage Mastery Progression, 7-Stage Lakehouse Stack Flow, 6-Stage SDLC Delivery Playbook, 5-Stage Spark Catalyst Pipeline, and interactive production flows.",
    path: "/stages",
    keywords: [
      "Architecture Stages",
      "Lakehouse Lifecycle",
      "4-Stage Mastery Progression",
      "7-Stage Lakehouse Flow",
      "6-Stage SDLC Playbook",
      "Spark Catalyst Pipeline",
      "Production Flow Diagrams",
      "DataOps Delivery Stages",
    ],
  });
}

export default function StagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
