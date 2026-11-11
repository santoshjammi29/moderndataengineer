import generatedCounts from "./content-counts.json";

export const CONTENT_COUNTS = generatedCounts;

export function formatContentCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}
