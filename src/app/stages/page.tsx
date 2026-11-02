import React, { Suspense } from "react";
import { StagesClient } from "./stages-client";

export const dynamic = "force-static";

export default function StagesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
          <div className="flex items-center gap-3 text-sm text-[var(--muted-foreground)]">
            <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading Architecture & Delivery Stages Hub...</span>
          </div>
        </div>
      }
    >
      <StagesClient />
    </Suspense>
  );
}
