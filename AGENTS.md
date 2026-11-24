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

### 4. Operational Invariants & Mistake Prevention
- **Tool Invocation Invariant (`read_file`)**: `StartLine` must ALWAYS be less than or equal to `EndLine`. Inverting line numbers causes immediate tool execution failure.
- **TypeScript Property Verification**: Never guess or assume property names on JSON data items. Check `src/types/data.ts` before writing JSX (e.g. `ArchitectureQuestion` uses `.question` and `.id`, NOT `.title`).
- **E-Ink Mode Dark Container Trap**: In E-Ink, `.e-ink .text-white` inverts to `#111111`. Wrapping white text in a hardcoded dark background (`bg-slate-950`, `bg-[#0c1427]`, `from-purple-950`) creates black-on-black invisible text. Always provide E-Ink overrides (`e-ink:bg-transparent` or semantic tokens).
- **Badge & Pill 700-Shade Rule**: Tailwind 600 shades (`amber-600`, `emerald-600`, `sky-600`) fail WCAG 2.2 AA when paired with white text (< 4.5:1). Always use 700 shades (`amber-700`, `emerald-700`, `sky-700`, `cyan-700`) which achieve $\ge 5.0:1$.
- **4-Step Deployment Pipeline**: Always run the full deployment pipeline:
  1. `npm run content:validate && npm run content:shard` (validates 11,280+ records)
  2. `npm run build:worker` (OpenNext Cloudflare build)
  3. `npm run r2:sync:remote` (idempotent sync of 106+ R2 shards)
  4. `npm run deploy:worker` (Wrangler edge deployment)
- **Zero Test Regressions**: All 62 test files (522 tests) and `tsc --noEmit` must pass with 100% success before any deployment or task completion.
- **Repository Asset & PDF Invariants**: The repository maintains 11 published vector A4 PDFs (`docs/pdf/` and `public/cheatsheets/pdf/`) including the 20-page Databricks Technical Manual generated via `scripts/generate_databricks_manual_pdf.py`. All 52 whiteboard blueprints are mirrored in `assets/whiteboards/` and documented in `docs/whiteboard_diagrams/README.md`.

### 5. Multi-Repository CI/CD Quality Gates & Mistake Prevention
- **The Pre-Flight Test Invariant**: Never execute `git push` on `main` across any of the 14 repositories without running its local test gate (`python3 scripts/run_tests.py`, `python3 scripts/validate_markdown.py`, or `npm test`).
- **52 Whiteboard Blueprint Invariant**: All 14 repositories strictly enforce `len(assets/whiteboards/*.webp) == 52`. Never sync from web presentation folders (`public/diagrams/`) to sibling repositories without explicitly pruning non-canonical aliases (`enterprise_edge_client_architecture`, `data_edge_client_architecture`, `open_file_formats_storage`, `open_table_formats_lakehouse`).
- **Mermaid Diagram Parser Rules**:
  - **No Unquoted Parentheses in Link Labels**: `-->|Label (text)|` fails syntax parsing. Use `-->|"Label (text)"|` or `-->|Label: text|`.
  - **No Raw Comparison Operators**: Never use `<`, `>`, or `<=` in labels (`-->|< 100 GB|` fails). Spell out (`under 100 GB`, `above 0.85`) or escape as `&lt;` / `&gt;`.
  - **No Semicolons in sequenceDiagram Notes**: In `sequenceDiagram`, `;` terminates the command. Use commas or colons (`Note over Sorter: Memory full, spilling to disk`).
  - **Escape Literal Dollar Signs**: Use `\$` in prose and diagrams to prevent math-mode parsing conflicts.
- **Markdown Relative Link Resolution**: Always verify link path relative to the document's directory depth (e.g. `docs/audits/doc.md` requires `../../CONTRIBUTING.md`, not `CONTRIBUTING.md`). For cross-repo references, use canonical GitHub URLs.
- **Python Pip Cache Invariant**: Workflows with `cache: "pip"` MUST have a valid root `requirements.txt`.
- **Databricks Notebook AST Validation**: All `.py` source notebooks must parse cleanly via `ast.parse()` using `python3 scripts/validate_notebooks.py`.
- **Ecosystem Health Audit**: Run `python3 scripts/verify_ecosystem_ci.py` to audit all 14 repositories before committing cross-repo changes.
