"use client";

import React from "react";
import { Shuffle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ShuffleControlProps {
  /** Whether the collection is currently in shuffled order */
  isShuffled: boolean;
  /** Callback to trigger a shuffle */
  onShuffle: () => void;
  /** Callback to reset to canonical order */
  onReset: () => void;
  /** The noun describing the items (e.g. "Questions", "Flashcards", "Scenarios", "Cards") */
  itemLabel?: string;
  /** Optional total count to display in accessible name */
  count?: number;
  /** Live region polite announcement message */
  statusAnnouncement?: string;
  /** Additional container classes */
  className?: string;
  /** Size variant */
  size?: "sm" | "md";
}

/**
 * Universal, WCAG 2.2 AA Accessible Shuffle Control Component.
 *
 * Provides:
 * - Native `<button>` elements with keyboard accessibility (Space/Enter)
 * - Clear accessible names (`aria-label`) that describe scope and action
 * - Polite screen reader announcements (`aria-live="polite"`)
 * - Visible focus indicators using semantic theme tokens
 * - WCAG 2.2 touch target compliance
 * - Respect for prefers-reduced-motion
 */
export function ShuffleControl({
  isShuffled,
  onShuffle,
  onReset,
  itemLabel = "Items",
  count,
  statusAnnouncement,
  className,
  size = "md",
}: ShuffleControlProps) {
  const isSmall = size === "sm";

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      {/* Screen reader live region for status announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {statusAnnouncement}
      </div>

      {/* Main Shuffle / Reshuffle Button */}
      <button
        type="button"
        onClick={onShuffle}
        aria-label={
          isShuffled
            ? `Reshuffle ${itemLabel.toLowerCase()}${count !== undefined ? ` (${count} items)` : ""}`
            : `Shuffle ${itemLabel.toLowerCase()}${count !== undefined ? ` (${count} items)` : ""}`
        }
        className={cn(
          "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-all cursor-pointer select-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-indicator)] focus-visible:ring-offset-1",
          isSmall
            ? "px-2 py-1 text-xs min-h-[28px]"
            : "px-2.5 py-1.5 text-xs sm:text-sm min-h-[34px]",
          isShuffled
            ? "bg-blue-600 text-white hover:bg-blue-500 border border-blue-500 shadow-xs"
            : "bg-[var(--surface-1)] hover:bg-[var(--surface-2)] text-[var(--foreground)] border border-[var(--border)] hover:border-[var(--border-hover)]"
        )}
      >
        <Shuffle
          size={isSmall ? 12 : 14}
          className={cn(
            "shrink-0",
            isShuffled && "rotate-180 transition-transform duration-300 motion-reduce:transition-none"
          )}
          aria-hidden="true"
        />
        <span>{isShuffled ? "Reshuffle" : `Shuffle ${itemLabel}`}</span>
      </button>

      {/* Reset Order Button (Shown when shuffled) */}
      {isShuffled && (
        <button
          type="button"
          onClick={onReset}
          aria-label={`Reset ${itemLabel.toLowerCase()} to default canonical order`}
          title="Reset to default canonical order"
          className={cn(
            "inline-flex items-center justify-center gap-1 rounded-lg text-xs font-medium transition-colors cursor-pointer select-none",
            "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] border border-transparent hover:border-[var(--border)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-indicator)]",
            isSmall ? "px-1.5 py-1 min-h-[28px]" : "px-2 py-1.5 min-h-[34px]"
          )}
        >
          <RotateCcw size={12} aria-hidden="true" />
          <span>Reset Order</span>
        </button>
      )}
    </div>
  );
}
