import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Apache Spark Physical Execution Visualizer & Catalyst Optimizer",
  description:
    "Interactive Spark physical cluster visualizer: task scheduling, byte compilation, whole-stage codegen, and shuffle partition flow across worker nodes.",
  path: "/visualizer",
  ogImage: "/diagrams/catalyst_photon_engine.webp",
  keywords: [
    "Spark Visualizer",
    "Catalyst Optimizer",
    "Spark Query Optimizer",
    "Physical Plan Spark",
    "Adaptive Query Execution",
    "Tungsten Memory Simulator",
  ],
});

export default function VisualizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
