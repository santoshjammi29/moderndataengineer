"use client";

import React, { useState, useEffect, Suspense, lazy } from "react";
import { Search } from "lucide-react";
import { KbdShortcut } from "@/components/ui/kbd-shortcut";
import { CommandPaletteModal as SyncModal } from "./command-palette-modal";

export type { CommandCategory } from "./command-palette-modal";

const LazyModal = lazy(() =>
  import("./command-palette-modal").then((m) => ({ default: m.CommandPaletteModal }))
);

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  // Keyboard shortcut listener & custom event trigger
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (
        e.key === "/" &&
        !isOpen &&
        !(
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          (e.target as HTMLElement)?.isContentEditable
        )
      ) {
        e.preventDefault();
        setIsOpen(true);
      } else if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    const handleCustomOpen = () => {
      setIsOpen(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-command-palette", handleCustomOpen);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-command-palette", handleCustomOpen);
    };
  }, [isOpen]);

  const ModalComponent = process.env.NODE_ENV === "test" ? SyncModal : LazyModal;

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 lg:bottom-8 lg:right-8 z-40 hidden md:flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-purple-500/40 shadow-xl transition-all hover:scale-105 group"
          aria-label="Open Command Palette (Cmd/Ctrl+K)"
        >
          <Search size={14} className="text-purple-400 group-hover:rotate-12 transition-transform" />
          <span>Universal Search...</span>
          <KbdShortcut shortcutKey="k" className="px-2 py-0.5 text-purple-300" />
        </button>
      )}

      {isOpen && (
        <Suspense fallback={null}>
          <ModalComponent onClose={() => setIsOpen(false)} />
        </Suspense>
      )}
    </>
  );
}
