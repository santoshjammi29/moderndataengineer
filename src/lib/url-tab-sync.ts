"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Returns true only after client hydration completes, preventing SSR/hydration
 * mismatches when layout chrome reads query parameters on static pages.
 */
export function useHasMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}

type SearchParamsLike = Pick<URLSearchParams, "get">;

/**
 * Resolves a query parameter against an allowlist (with optional aliases),
 * returning `fallback` when missing or unknown. Safe for SSR/initial state.
 */
export function resolveQueryParam<T extends string>(
  searchParams: SearchParamsLike | null | undefined,
  key: string,
  validValues: readonly T[],
  fallback: T,
  aliases?: Record<string, T>
): T {
  const raw = searchParams?.get(key)?.trim().toLowerCase();
  if (!raw) return fallback;
  if (aliases && raw in aliases) {
    return aliases[raw];
  }
  return (validValues as readonly string[]).includes(raw) ? (raw as T) : fallback;
}

/**
 * Pushes a new browser history entry when the resulting URL differs from the
 * current location, preserving Back/Forward navigation without full reloads.
 */
export function pushUrlQuery(
  mutate: (params: URLSearchParams) => void,
  options?: { clearHash?: boolean }
): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  mutate(url.searchParams);
  if (options?.clearHash) {
    url.hash = "";
  }
  const nextUrl = `${url.pathname}${url.search}${url.hash}`;
  const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (nextUrl !== currentUrl) {
    window.history.pushState(null, "", nextUrl);
  }
}

/**
 * Subscribes to browser `popstate` (and optionally `hashchange`) so Back/Forward
 * navigation always re-synchronizes client tab/view state.
 */
export function usePopstateSync(
  onLocationChange: () => void,
  options?: { includeHashChange?: boolean }
): void {
  const callbackRef = useRef(onLocationChange);

  useEffect(() => {
    callbackRef.current = onLocationChange;
  }, [onLocationChange]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => callbackRef.current();
    window.addEventListener("popstate", handler);
    if (options?.includeHashChange) {
      window.addEventListener("hashchange", handler);
    }
    return () => {
      window.removeEventListener("popstate", handler);
      if (options?.includeHashChange) {
        window.removeEventListener("hashchange", handler);
      }
    };
  }, [options?.includeHashChange]);
}
