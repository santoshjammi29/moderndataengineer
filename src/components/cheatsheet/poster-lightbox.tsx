"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDiagramTheme, getWebpThemeClass } from "@/lib/diagram-theme";
import { WhiteboardThemeToggle } from "@/components/architecture/whiteboard-theme-toggle";

interface PosterLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  posterUrl: string;
  title: string;
  subtitle?: string;
}

export function PosterLightbox({
  isOpen,
  onClose,
  posterUrl,
  title,
  subtitle,
}: PosterLightboxProps) {
  const [zoom, setZoom] = useState<number>(1);
  const [diagramTheme] = useDiagramTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Reset zoom on open
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
    }
  }, [isOpen, posterUrl]);

  if (!isOpen) return null;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleReset = () => setZoom(1);
  const webpThemeClass = getWebpThemeClass(diagramTheme, posterUrl);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="poster-dialog-title"
      className="fixed inset-0 z-50 flex flex-col bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-1)] text-[var(--foreground)] shrink-0">
        <div className="min-w-0 pr-4">
          <h2 id="poster-dialog-title" className="text-sm sm:text-base font-bold truncate text-[var(--foreground)]">
            {title}
          </h2>
          <p className="text-[11px] text-[var(--muted-foreground)] truncate">
            {subtitle || "Panoramic Dual-Page Wall Poster • 4162 × 2924 • 250 DPI High-Res"}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <WhiteboardThemeToggle size="xs" showLabel={false} />

          {/* Zoom controls */}
          <div className="hidden sm:flex items-center gap-1 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg p-1">
            <button
              type="button"
              onClick={handleZoomOut}
              aria-label="Zoom out"
              disabled={zoom <= 0.5}
              className="p-1.5 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ZoomOut size={15} />
            </button>
            <span className="text-[11px] font-mono px-1.5 text-[var(--foreground)] min-w-11 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              aria-label="Zoom in"
              disabled={zoom >= 2.5}
              className="p-1.5 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ZoomIn size={15} />
            </button>
            <button
              type="button"
              onClick={handleReset}
              aria-label="Reset zoom"
              title="Reset zoom"
              className="p-1.5 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          {/* Download Full Poster */}
          <a
            href={posterUrl}
            download
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Download size={13} />
            <span className="hidden sm:inline">Download Poster</span>
            <span className="sm:hidden">Download</span>
          </a>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close poster viewer"
            className="p-2 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-[var(--border)] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Image Container */}
      <div
        ref={containerRef}
        onClick={onClose}
        className={cn(
          "flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center cursor-zoom-out transition-colors duration-300",
          diagramTheme === "dark" ? "whiteboard-container-dark" : "whiteboard-container-light"
        )}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative transition-transform duration-150 ease-out cursor-default shadow-2xl rounded-lg overflow-hidden border border-[var(--border)] max-w-full"
          style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={posterUrl}
            alt={title}
            className={cn(
              "w-auto h-auto max-h-[82vh] max-w-[94vw] object-contain rounded-lg transition-all duration-300",
              webpThemeClass
            )}
          />
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="px-4 py-2 border-t border-[var(--border)] bg-[var(--surface-1)] text-center text-[11px] text-[var(--muted-foreground)]">
        <span>Click anywhere outside the poster or press <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-2)] text-[var(--foreground)] border border-[var(--border)] font-mono text-[10px]">ESC</kbd> to close.</span>
      </div>
    </div>
  );
}
