<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Design System & Typography Standards

### 1. Unified Font Architecture
- **Primary Typeface (`--font-sans` & `--font-heading`)**: Use `Inter` with robust system fallbacks (`system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`) across all headings, body copy, navigation, buttons, controls, cards, badges, and ordinary content. Do NOT introduce separate heading fonts or decorative font services.
- **Monospace Family (`--font-mono`)**: Reserved strictly for code blocks, inline code, terminal outputs, queries, logs, and fixed tabular counters (`JetBrains Mono`, `Fira Code`, `ui-monospace`, `Menlo`, `Monaco`, `monospace`).

### 2. WCAG 2.2 AA Contrast Compliance Across All Themes
- All foreground-to-background combinations MUST satisfy WCAG 2.2 AA:
  - Normal text ($< 18.66\text{px}$ bold or $< 24\text{px}$ regular): **$\ge 4.5:1$**.
  - Large text ($\ge 18.66\text{px}$ bold or $\ge 24\text{px}$ regular) & interactive components: **$\ge 3.0:1$**.
- Never use transparent text gradient clipping (`text-transparent bg-clip-text`) on light or e-ink backgrounds without solid fallback colors.
- Maintain high-contrast status tokens (e.g. emerald-700, amber-700, sky-700) on white and light raised surfaces.
- In E-Ink mode, syntax tokens on paper backgrounds (`#eeebe3`) must use deep contrast tokens (Amber: `#78350f` $\ge 7.6:1$, Orange: `#9a3412` $\ge 6.1:1$).

### 3. Natural Text Wrapping & Overflow Handling
- All body prose and descriptions must wrap naturally using `overflow-wrap: anywhere` and `text-wrap: pretty`.
- Headings use `text-wrap: balance` and tight line-height (`--line-height-heading: 1.25`).
- Flex and grid children containing text must include `min-width: 0` (or `.flex-1`) to allow text shrinking without clipping.
- Do NOT use arbitrary `truncate` or `line-clamp` on primary content, titles, or descriptions.
- When previews are intentionally clamped, provide an accessible reveal mechanism with `aria-expanded` and descriptive labels.
- Code blocks must contain horizontal scrolling within the panel (`overflow-x-auto`) and provide accessible word-wrap toggle controls.
