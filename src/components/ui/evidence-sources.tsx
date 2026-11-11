import type { EvidenceSource } from "@/types/data";

export function EvidenceSources({
  sources,
  className = "",
}: {
  sources?: EvidenceSource[];
  className?: string;
}) {
  if (!sources?.length) return null;

  return (
    <section className={`space-y-1.5 ${className}`} aria-label="Evidence sources">
      <h3 className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
        Evidence and further reading
      </h3>
      <ul className="space-y-1">
        {sources.map((source) => (
          <li key={source.url}>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:text-blue-500 break-words"
            >
              {source.title}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
