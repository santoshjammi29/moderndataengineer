import { CONTENT_COUNTS, formatContentCount } from "@/data/content-counts";
import { TopicIcon } from "@/components/ui/topic-icon";

export function HeroBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] dark:bg-slate-950 px-5 py-8 sm:px-8 sm:py-12 text-center sm:text-left isolate">
      {/* Aurora Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-tr from-transparent via-blue-500/10 to-purple-500/10 opacity-50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-pulse" />
        <div className="absolute -bottom-32 left-32 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="mx-auto max-w-4xl flex flex-col items-center sm:items-start space-y-4">
        <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1 text-xs font-medium text-[var(--muted-foreground)]">
          Data Architect Studio · Learning OS
        </span>

        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--foreground)] leading-tight">
          <span className="bg-gradient-to-r from-sky-500 via-blue-600 to-emerald-600 dark:from-sky-400 dark:via-blue-400 dark:to-emerald-400 bg-clip-text text-transparent [.light_&]:text-[var(--foreground)] [.e-ink_&]:text-[var(--foreground)] [.light_&]:bg-none [.e-ink_&]:bg-none">
            DataPlatform Architect
          </span>
          <br />
          Enterprise Fabric, Databricks &amp; Lakehouse Prep
        </h1>

        <p className="text-sm sm:text-base text-[var(--muted-foreground)] max-w-2xl leading-relaxed">
          {`Fabric DP-700 / DP-600, Databricks, Delta Lake, ${formatContentCount(CONTENT_COUNTS.qa)} Q&As`}
        </p>

        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
          {[
            { topicKey: "fabric", label: "Fabric DP-700 / DP-600" },
            { topicKey: "azure", label: "Azure & Lakehouse" },
            { topicKey: "powerbi", label: "Power BI PL-300" },
            { topicKey: "databricks", label: "Databricks Lakehouse" },
            { topicKey: "ai", label: "AI & RAG Pipelines" },
          ].map((badge) => (
            <div
              key={badge.label}
              className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1 text-xs font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-3)]"
            >
              <TopicIcon topic={badge.topicKey} size={14} />
              <span>{badge.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
