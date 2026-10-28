import { Suspense } from "react";
import { getPysparkCodePracticeDAL } from "@/lib/dal";
import { SparkCatalystClient } from "./spark-catalyst-client";

export const dynamic = "force-static";

export default async function SparkCatalystPage() {
  const pysparkData = await getPysparkCodePracticeDAL();

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
          <div className="flex items-center gap-3 text-sm text-[var(--muted-foreground)]">
            <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading Catalyst Optimizer & Visualizer...</span>
          </div>
        </div>
      }
    >
      <SparkCatalystClient initialPyspark={pysparkData} />
    </Suspense>
  );
}
