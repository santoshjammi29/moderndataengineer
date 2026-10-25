"use client";

import React, { lazy, Suspense } from "react";

const hasClerkKey = Boolean(
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
);

const LazyClerkProvider = hasClerkKey
  ? lazy(() => import("@clerk/nextjs").then((mod) => ({ default: mod.ClerkProvider })))
  : null;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  if (!hasClerkKey || !LazyClerkProvider) {
    return <>{children}</>;
  }

  return (
    <Suspense fallback={<>{children}</>}>
      <LazyClerkProvider>{children}</LazyClerkProvider>
    </Suspense>
  );
}
