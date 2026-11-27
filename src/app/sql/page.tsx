import { Suspense } from "react";
import { SqlClient } from "./sql-client";

export default function SqlPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
          <div className="flex items-center gap-3 text-sm text-[var(--muted-foreground)]">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading Interactive SQL Study Guide & Visualizer...</span>
          </div>
        </div>
      }
    >
      <SqlClient />
    </Suspense>
  );
}
