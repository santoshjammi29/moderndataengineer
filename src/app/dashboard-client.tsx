"use client";

import { HeroCommandCenter } from "@/components/dashboard/hero-command-center";
import { SequentialNavigation } from "@/components/dashboard/sequential-navigation";
import { MasteryRoadmapFlow } from "@/components/guided-learning/mastery-roadmap-flow";
import { ContinueLearning } from "@/components/dashboard/continue-learning";
import { TipOfDay } from "@/components/dashboard/tip-of-day";
import { HomeWhiteboardsShowcase } from "@/components/dashboard/home-whiteboards-showcase";
import { TrendingSpotlight } from "@/components/dashboard/trending-spotlight";
import { RecentDeploymentsRadar } from "@/components/dashboard/recent-deployments-radar";
import { StatCards } from "@/components/dashboard/stat-cards";

export function DashboardClient() {
  return (
    <div className="space-y-8 sm:space-y-12 pb-16 w-full max-w-7xl 2xl:max-w-[1800px] 3xl:max-w-[2200px] 4xl:max-w-none mx-auto px-2 sm:px-4 2xl:px-6">
      {/* 1. Motivational Hero & Universal Search Launcher */}
      <HeroCommandCenter />

      {/* 2. Sequential & Structured 4-Stage Mastery Journey (Steps 01 to 11) */}
      <SequentialNavigation />

      {/* 3. Interactive Principal Data Architect Mastery Roadmap Flow */}
      <section className="space-y-3 pt-2 border-t border-[var(--border)]">
        <div className="flex items-center justify-between px-1">
          <div>
            <div className="text-[11px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-wider">
              Role Evolution Roadmap
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[var(--foreground)] tracking-tight">
              Interactive Architect Career Roadmap
            </h2>
          </div>
        </div>
        <MasteryRoadmapFlow />
      </section>

      {/* 4. Personal Study Cockpit & Streak */}
      <section className="space-y-3 pt-2 border-t border-[var(--border)]">
        <div className="flex items-center justify-between px-1">
          <div>
            <div className="text-[11px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-wider">
              Study Command Center
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[var(--foreground)] tracking-tight">
              Resume Your Learning Momentum
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 sm:gap-4">
          <div className="lg:col-span-2">
            <ContinueLearning />
          </div>
          <div className="lg:col-span-1">
            <TipOfDay />
          </div>
        </div>
      </section>

      {/* 5. Whiteboard Architecture Blueprints Showcase (42 Blueprints) */}
      <section className="space-y-4 pt-2 border-t border-[var(--border)]">
        <HomeWhiteboardsShowcase />
      </section>

      {/* 6. Daily Curated Architecture Challenge & Simulator */}
      <section className="space-y-4 pt-2 border-t border-[var(--border)]">
        <TrendingSpotlight />
      </section>

      {/* 7. Platform Question Archives & Verified Metrics */}
      <section className="space-y-4 pt-2 border-t border-[var(--border)]">
        <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] px-1">
          <span className="font-bold uppercase tracking-wider text-[11px] text-[var(--foreground)]">
            Verified Question Bank Metrics
          </span>
          <span className="text-[11px] text-[var(--muted-foreground)] hidden sm:inline">
            7,080+ Verified Scenarios Across Core Technical Domains
          </span>
        </div>
        <StatCards />
      </section>

      {/* 8. Platform Release Radar & Deployments */}
      <section className="space-y-3 pt-2 border-t border-[var(--border)]">
        <RecentDeploymentsRadar />
      </section>
    </div>
  );
}
