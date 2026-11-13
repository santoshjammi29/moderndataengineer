"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { TextSizeController } from "@/components/ui/text-size-controller";
import { ChevronLeft, Columns2, ChevronDown, Search } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { NAV_GROUPS, isSubHrefActive, NavItem } from "@/data/navigation-data";

const pillVariants: Record<string, string> = {
  easy: "bg-green-500/10 text-green-400 border-green-500/20",
  medium: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  hard: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  architect: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  new: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

const DEFAULT_WIDTH = 285;
const MIN_WIDTH = 230;
const MAX_WIDTH = 520;
const COLLAPSED_WIDTH_DESKTOP = 72;

function SidebarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [collapsed, setCollapsed] = useState(false);
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [isDragging, setIsDragging] = useState(false);
  const [showWidthMenu, setShowWidthMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Desktop subpages are expanded by default
  const [manualExpanded, setManualExpanded] = useState<Record<string, boolean>>({});
  const [defaultExpanded, setDefaultExpanded] = useState<boolean>(true);

  const itemsWithSub = useMemo(() => {
    return NAV_GROUPS.flatMap((g) => g.items).filter((i) => i.subItems && i.subItems.length > 0);
  }, []);

  const isItemExpanded = (item: NavItem) => {
    if (manualExpanded[item.href] !== undefined) {
      return manualExpanded[item.href];
    }
    return defaultExpanded;
  };

  const areAllExpanded = useMemo(() => {
    return itemsWithSub.every((i) => {
      return manualExpanded[i.href] !== undefined ? manualExpanded[i.href] : defaultExpanded;
    });
  }, [itemsWithSub, manualExpanded, defaultExpanded]);

  const toggleItemExpanded = (href: string) => {
    setManualExpanded((prev) => {
      const current = prev[href] !== undefined ? prev[href] : defaultExpanded;
      return {
        ...prev,
        [href]: !current,
      };
    });
  };

  const toggleAllSubpages = () => {
    if (areAllExpanded) {
      // Collapse every group, including active group
      const newMap: Record<string, boolean> = {};
      itemsWithSub.forEach((i) => {
        newMap[i.href] = false;
      });
      setManualExpanded(newMap);
      setDefaultExpanded(false);
    } else {
      // Expand every group
      const newMap: Record<string, boolean> = {};
      itemsWithSub.forEach((i) => {
        newMap[i.href] = true;
      });
      setManualExpanded(newMap);
      setDefaultExpanded(true);
    }
  };

  useEffect(() => {
    const savedCollapsed = localStorage.getItem("sidebar-collapsed");
    if (savedCollapsed === "true") {
      setCollapsed(true);
    } else if (savedCollapsed === "false") {
      setCollapsed(false);
    }

    const savedWidth = localStorage.getItem("sidebar-width");
    if (savedWidth) {
      const num = parseInt(savedWidth, 10);
      if (!isNaN(num) && num >= MIN_WIDTH && num <= MAX_WIDTH) {
        setWidth(num);
      }
    }
  }, []);

  // Close width menu on outside click
  useEffect(() => {
    if (!showWidthMenu) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowWidthMenu(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [showWidthMenu]);

  // Handle Drag Resizing
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, e.clientX));
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  // Persist width changes
  useEffect(() => {
    if (width >= MIN_WIDTH && width <= MAX_WIDTH) {
      localStorage.setItem("sidebar-width", String(width));
    }
  }, [width]);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const setPresetWidth = (newWidth: number) => {
    setWidth(newWidth);
    setShowWidthMenu(false);
  };

  const isItemActive = (item: NavItem) => {
    if (!pathname) return false;
    if (item.href === "/") return pathname === "/";
    if (item.matches && item.matches.some((m) => pathname === m || pathname.startsWith(m + "/"))) {
      return true;
    }
    if (item.href.includes("?")) {
      const [itemPath, itemQuery] = item.href.split("?");
      if (pathname !== itemPath) return false;
      const subParams = new URLSearchParams(itemQuery);
      return Array.from(subParams.entries()).every(
        ([k, v]) => searchParams?.get(k) === v
      );
    }
    return pathname === item.href || pathname.startsWith(item.href + "/");
  };

  const openSearch = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-command-palette"));
    }
  };

  const currentWidth = collapsed ? COLLAPSED_WIDTH_DESKTOP : width;

  return (
    <>
      {/* In-flow flex spacer ensuring the main content stays aligned beside the fixed desktop sidebar */}
      <div
        style={{ width: currentWidth }}
        className={cn(
          "hidden lg:block shrink-0",
          isDragging ? "transition-none" : "transition-[width] duration-200 ease-in-out"
        )}
        aria-hidden="true"
      />

      <aside
        style={{ width: currentWidth }}
        aria-label="Study workspace navigation"
        className={cn(
          "hidden lg:flex fixed top-0 bottom-0 left-0 z-30 flex-col h-dvh border-r shrink-0",
          "bg-[var(--surface-1)] border-[var(--border)]",
          isDragging ? "transition-none select-none" : "transition-[width] duration-200 ease-in-out"
        )}
      >
        {/* Brand & Resize Controls */}
        <div
          className={cn(
            "flex items-center h-14 sm:h-16 px-3 sm:px-4 border-b border-[var(--border)] shrink-0",
            collapsed ? "flex-col justify-center gap-1 py-2 h-auto" : "justify-between"
          )}
        >
          <Link
            href="/"
            className="flex items-center gap-2.5 sm:gap-3 min-w-0 group"
            title="Modern Data Engineer - Home"
          >
            <BrandLogo
              size={collapsed ? 28 : 32}
              className="transition-transform duration-200 group-hover:scale-105 shrink-0"
            />
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <h1 className="text-sm font-bold text-[var(--foreground)] tracking-tight break-words leading-tight group-hover:text-blue-500 transition-colors">
                  Modern Data Engineer
                </h1>
                <span className="text-[10px] font-medium text-[var(--muted-foreground)] block -mt-0.5">
                  Study Workspace
                </span>
              </div>
            )}
          </Link>

          {/* Action Controls: Width Preset Menu & Collapse Button */}
          <div className={cn("flex items-center gap-1", collapsed && "flex-col")}>
            {!collapsed && (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setShowWidthMenu(!showWidthMenu)}
                  className={cn(
                    "p-1.5 rounded-lg hover:bg-[var(--surface-3)] transition-colors cursor-pointer text-xs flex items-center gap-1",
                    showWidthMenu
                      ? "bg-[var(--surface-3)] text-blue-500 font-semibold"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  )}
                  title="Adjust sidebar width"
                  aria-label="Adjust sidebar width"
                  aria-haspopup="dialog"
                  aria-expanded={showWidthMenu}
                >
                  <Columns2 size={14} />
                  <span className="text-[10px] font-mono hidden xl:inline">{width}px</span>
                </button>

                {showWidthMenu && (
                  <div
                    className="absolute right-0 top-full mt-1.5 w-48 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                    role="dialog"
                    aria-label="Sidebar Width Presets"
                  >
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] border-b border-[var(--border)] mb-1">
                      Sidebar Width
                    </div>
                    {[
                      { label: "Compact", val: 240 },
                      { label: "Default", val: 295 },
                      { label: "Comfortable", val: 350 },
                      { label: "Wide View", val: 430 },
                    ].map((preset) => (
                      <button
                        key={preset.val}
                        type="button"
                        onClick={() => setPresetWidth(preset.val)}
                        className={cn(
                          "w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left",
                          width === preset.val
                            ? "bg-blue-500/10 text-blue-500 font-semibold"
                            : "text-[var(--foreground)] hover:bg-[var(--surface-3)]"
                        )}
                      >
                        <span>{preset.label}</span>
                        <span className="font-mono text-[10px] text-[var(--muted-foreground)]">
                          {preset.val}px
                        </span>
                      </button>
                    ))}
                    <div className="mt-1 pt-1 border-t border-[var(--border)] px-2 text-[10px] text-[var(--muted-foreground)]">
                      Tip: Drag right border to resize
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Collapse/Expand Toggle Button */}
            <button
              type="button"
              onClick={toggleCollapsed}
              className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors cursor-pointer"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ChevronLeft
                size={16}
                className={cn("transition-transform duration-200", collapsed && "rotate-180")}
              />
            </button>
          </div>
        </div>

        {/* Search Tool & Global Subpage Toggle */}
        {!collapsed && (
          <div className="p-2 sm:px-3 sm:py-2 border-b border-[var(--border)] shrink-0 space-y-2 bg-[var(--surface-1)]">
            <button
              type="button"
              onClick={openSearch}
              className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--border)] text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer group"
              aria-label="Search lessons and tools"
            >
              <span className="flex items-center gap-2 truncate">
                <Search size={13} className="text-blue-500 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="truncate">Search lessons &amp; tools</span>
              </span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-medium rounded bg-[var(--surface-1)] border border-[var(--border)] text-[var(--muted-foreground)]">
                ⌘K
              </kbd>
            </button>

            <div className="flex items-center justify-between px-1 text-[10px] text-[var(--muted-foreground)]">
              <span className="font-bold uppercase tracking-wider text-[9px]">Study Navigation</span>
              <button
                type="button"
                onClick={toggleAllSubpages}
                aria-expanded={areAllExpanded}
                aria-label={areAllExpanded ? "Collapse all subpages" : "Expand all subpages"}
                className="text-blue-500 hover:text-blue-400 font-semibold transition-colors cursor-pointer flex items-center gap-1"
                title="Toggle all subpages across all groups"
              >
                <span>{areAllExpanded ? "Collapse subpages" : "Expand all subpages"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tree — Independently Scrollable */}
        <nav
          className="flex-1 overflow-y-auto py-2.5 sm:py-3 px-1 sm:px-2 scrollbar-thin min-h-0 overscroll-contain"
          aria-label="All sections and subpages"
        >
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi} className={cn(gi > 0 && "mt-3 sm:mt-4")}>
              {group.title && !collapsed && (
                <div className="px-3 mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--muted-foreground)] break-words whitespace-normal leading-tight">
                  {group.title}
                </div>
              )}
              {group.title && collapsed && gi > 0 && (
                <div className="mx-2 sm:mx-3 mb-2 border-t border-[var(--border)]" />
              )}
              <ul className="space-y-0.5" role="list">
                {group.items.map((item) => {
                  const active = isItemActive(item);
                  const expanded = isItemExpanded(item);
                  const Icon = item.icon;
                  const hasChildren = Boolean(item.subItems && item.subItems.length > 0);

                  return (
                    <li key={item.href}>
                      <div className="flex items-center justify-between w-full group/navitem">
                        <Link
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex items-start gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 flex-1 min-w-0",
                            "hover:bg-[var(--surface-3)]",
                            active
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold shadow-[inset_2px_0_0_rgb(59,130,246)]"
                              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
                            collapsed && "justify-center px-0 py-2.5 items-center"
                          )}
                          title={collapsed ? item.label : undefined}
                        >
                          <Icon
                            size={18}
                            className={cn(
                              "shrink-0 transition-colors mt-0.5",
                              active ? "text-blue-600 dark:text-blue-400" : "text-blue-500 dark:text-blue-400",
                              collapsed && "mt-0"
                            )}
                            aria-hidden="true"
                          />
                          {!collapsed && (
                            <>
                              <span className="flex-1 break-words whitespace-normal leading-snug text-left">
                                {item.label}
                              </span>
                              {item.pill && (
                                <span
                                  className={cn(
                                    "text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 leading-tight mt-0.5",
                                    pillVariants[item.pill.variant]
                                  )}
                                >
                                  {item.pill.text}
                                </span>
                              )}
                            </>
                          )}
                        </Link>

                        {!collapsed && hasChildren && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleItemExpanded(item.href);
                            }}
                            className="p-1.5 rounded-lg hover:bg-[var(--surface-3)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer shrink-0 ml-0.5"
                            aria-label={expanded ? `Collapse ${item.label} subpages` : `Expand ${item.label} subpages`}
                            aria-expanded={expanded}
                            title={expanded ? "Collapse subpages" : "Expand subpages"}
                          >
                            <ChevronDown
                              size={13}
                              className={cn(
                                "transition-transform duration-200",
                                expanded ? "rotate-0 text-blue-400" : "-rotate-90 text-[var(--muted-foreground)]"
                              )}
                              aria-hidden="true"
                            />
                          </button>
                        )}
                      </div>

                      {/* Sub-navigation items when parent is expanded */}
                      {expanded && !collapsed && hasChildren && item.subItems && (
                        <ul className="ml-5 pl-2.5 border-l-2 border-blue-500/25 my-1.5 space-y-1" role="list">
                          {item.subItems.map((sub) => {
                            const isSubActive = isSubHrefActive(pathname, searchParams, sub.href);
                            return (
                              <li key={sub.href}>
                                <Link
                                  href={sub.href}
                                  scroll={false}
                                  aria-current={isSubActive ? "page" : undefined}
                                  className={cn(
                                    "flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150",
                                    isSubActive
                                      ? "bg-blue-600/15 text-blue-500 font-semibold"
                                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)]"
                                  )}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span
                                      className={cn(
                                        "w-1.5 h-1.5 rounded-full shrink-0 transition-all",
                                        isSubActive
                                          ? "bg-blue-500 scale-125 shadow-[0_0_6px_rgba(59,130,246,0.8)]"
                                          : "bg-[var(--muted-foreground)]/30"
                                      )}
                                      aria-hidden="true"
                                    />
                                    <span className="truncate">{sub.label}</span>
                                  </div>
                                  {sub.badge && (
                                    <span
                                      className={cn(
                                        "text-[10px] font-mono px-1.5 py-0.2 rounded shrink-0",
                                        isSubActive
                                          ? "bg-blue-500/20 text-blue-400 font-bold"
                                          : "bg-[var(--surface-3)] text-[var(--muted-foreground)]"
                                      )}
                                    >
                                      {sub.badge}
                                    </span>
                                  )}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Studio Quick Reference & Progress Hub */}
        {!collapsed && (
          <div className="p-2.5 sm:px-3 text-[11px] text-[var(--muted-foreground)] border-t border-[var(--border)] shrink-0 bg-[var(--surface-2)]/40 flex items-center justify-between">
            <span>Keep your place:</span>
            <Link
              href="/studio"
              className="text-blue-500 hover:text-blue-400 font-semibold inline-flex items-center gap-0.5"
            >
              My Studio →
            </Link>
          </div>
        )}

        {/* Footer — Text Size & Theme switchers */}
        <div className={cn("p-2 sm:p-3 border-t border-[var(--border)] shrink-0", collapsed ? "space-y-1.5 sm:space-y-2" : "space-y-2.5")}>
          <TextSizeController collapsed={collapsed} direction="up" align="start" />
          <ThemeSwitcher collapsed={collapsed} direction="up" align="start" />
        </div>

        {/* Draggable Resizer Handle on Right Border */}
        {!collapsed && (
          <div
            onMouseDown={handleMouseDown}
            onDoubleClick={() => setWidth(DEFAULT_WIDTH)}
            className={cn(
              "absolute top-0 -right-1 w-2.5 h-full cursor-col-resize z-40 select-none hidden lg:flex items-center justify-center",
              "hover:bg-blue-500/25 active:bg-blue-500/40 transition-colors group",
              isDragging && "bg-blue-500/35"
            )}
            title="Drag to resize nav bar width • Double-click to reset width"
            aria-label="Resize nav bar width"
            role="separator"
            aria-orientation="vertical"
          >
            <div
              className={cn(
                "w-0.5 h-8 rounded-full bg-[var(--border)] group-hover:bg-blue-400 transition-colors",
                isDragging && "bg-blue-500 h-12"
              )}
            />
          </div>
        )}
      </aside>
    </>
  );
}

export function Sidebar() {
  return (
    <Suspense
      fallback={
        <aside
          className="hidden lg:flex flex-col h-dvh fixed top-0 left-0 border-r shrink-0 z-30 w-[295px] bg-[var(--surface-1)] border-[var(--border)]"
          aria-hidden="true"
        />
      }
    >
      <SidebarInner />
    </Suspense>
  );
}
