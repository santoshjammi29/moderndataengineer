import { Suspense } from "react";
import { SparkCatalystClient } from "./spark-catalyst-client";

export const dynamic = "force-static";

export default function SparkCatalystPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
          <div className="flex items-center gap-3 text-sm text-[var(--muted-foreground)]">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading Catalyst Optimizer & Visualizer...</span>
          </div>
        </div>
      }
    >
      <SparkCatalystClient />
    </Suspense>
  );
}
