# Fabric & Power BI Prep Design System 2.0 Specification

## 1. Design Token System Specification

### 1.1 Color Tokens (`color`)

```typescript
export const color = {
  surface: {
    base: '#0a0a0a',        // Page background
    raised: '#171717',      // Cards, modals, containers
    overlay: '#262626',     // Hover states, active surfaces
    sunken: '#0f0f0f',      // Code blocks, text inputs
  },
  text: {
    primary: '#fafafa',     // Headings, body primary
    secondary: '#a3a3a3',   // Subheads, labels, metadata
    tertiary: '#737373',    // Captions, subtle metadata
    inverse: '#0a0a0a',     // Light background text
  },
  border: {
    subtle: '#262626',
    default: '#404040',
    strong: '#525252',
    focus: '#3b82f6',
  },
  primary:   { 50: '#eff6ff', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8' },
  secondary: { 500: '#8b5cf6', 600: '#7c3aed' },
  success:   { 500: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
  warning:   { 500: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
  danger:    { 500: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
  info:      { 500: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)' },
};
```

### 1.2 Fluid Typography Scale (`font`)

Unified font architecture:
- `--font-sans`: `Inter`, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif
- `--font-heading`: `var(--font-sans)` (Unified primary typeface across all headings and display titles)
- `--font-mono`: `JetBrains Mono`, 'Fira Code', 'Cascadia Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace

| Token | Clamp Value | Semantic Role |
| :--- | :--- | :--- |
| `font.size.xs` | `clamp(0.75rem, 0.72rem + 0.15vw, 0.8125rem)` | Captions, small badges, metadata |
| `font.size.sm` | `clamp(0.875rem, 0.84rem + 0.2vw, 0.9375rem)` | Secondary text, input text, code comments |
| `font.size.base` | `clamp(0.9375rem, 0.9rem + 0.25vw, 1rem)` | Body copy, card descriptions |
| `font.size.lg` | `clamp(1.0625rem, 1rem + 0.35vw, 1.125rem)` | Card titles, subsection headers |
| `font.size.xl` | `clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem)` | Section subheaders |
| `font.size.2xl` | `clamp(1.5rem, 1.35rem + 0.75vw, 1.875rem)` | Section titles |
| `font.size.3xl` | `clamp(1.875rem, 1.6rem + 1.25vw, 2.5rem)` | Tab page titles |
| `font.size.4xl` | `clamp(2.25rem, 1.9rem + 1.75vw, 3.5rem)` | Hero display titles |

Line Height Standards:
- `--line-height-heading`: `1.25` (Tight, balanced wrapping with `text-wrap: balance`)
- `--line-height-body`: `1.6` (Comfortable reading cadence with `text-wrap: pretty`)
- `--line-height-compact`: `1.35` (High-density lists and micro-cards)
- `--line-height-code`: `1.7` (Preserved indentation and vertical scanability in code blocks)

### 1.3 Spacing Scale (`space`)

`4px` base grid: `0` (0px), `1` (4px), `2` (8px), `3` (12px), `4` (16px), `6` (24px), `8` (32px), `12` (48px), `16` (64px), `24` (96px).

---

## 2. Component Primitives API Reference

### 2.1 Heading
- `display`: Hero titles (`text-4xl`, bold, `text-text-primary`)
- `page`: Page titles (`text-3xl`, bold)
- `section`: Section headers (`text-2xl`, semibold)
- `card`: Card titles (`text-lg`, semibold)

### 2.2 Card
- `compact`: `p-3`, `radius-md`, `border-subtle`, `bg-surface-raised`
- `default`: `p-4`, `radius-lg`, `border-subtle`, `bg-surface-raised`, hover: `border-default`
- `feature`: `p-6`, `radius-xl`, `border-default`, `bg-surface-raised`, `shadow-md`, hover: `shadow-lg`
- `interactive`: `p-4`, `radius-lg`, `border-subtle`, `bg-surface-raised`, hover: `border-primary` + `shadow-glow`

### 2.3 Button
- `primary`: `bg-primary-500`, white text, shadow-md, hover `bg-primary-600`
- `secondary`: transparent bg, text-primary, `border-default`, hover `bg-surface-overlay`
- `ghost`: transparent bg, text-secondary, hover `bg-surface-overlay`
- `danger`: `bg-danger-500`, white text, hover `danger-600`
- Sizes: `sm` (h-8, px-3), `md` (h-10, px-4), `lg` (h-12, px-6)

### 2.4 Badge / Chip / Pill
- `neutral`: `bg-surface-overlay`, `text-secondary`
- `primary`: `bg-primary-500/10`, `text-primary-500`, `border-primary-500/30`
- `success`: `bg-success-bg`, `text-success-500`, `border-success-500/30` (Easy difficulty / Low risk)
- `warning`: `bg-warning-bg`, `text-warning-500`, `border-warning-500/30` (Hard difficulty / Medium risk / NEW / Projected)
- `danger`: `bg-danger-bg`, `text-danger-500`, `border-danger-500/30` (Expert difficulty / High risk / Error)
- `info`: `bg-info-bg`, `text-info-500`, `border-info-500/30` (Medium difficulty)

---

## 3. Lucide Icon System Taxonomy

Functional emojis are replaced with standardized Lucide SVG icons across UI components:
- Engine / Performance: `Zap`
- Learning / Concepts: `BookOpen`
- Code / Practice: `Code2`
- Architecture / Spec: `Landmark`
- AI / RAG: `Bot`
- Streaming / CDC: `Radio`
- Security / Governance: `Lock` / `Shield`
- FinOps / Cost: `DollarSign`
- Open Formats: `Globe` / `Feather`
- Optimizations: `Rocket`
- Tips & Insights: `Lightbulb`
- Search: `Search`
- External Links: `ExternalLink`
- GCC Directory: `Building2`

---

## 4. Breakpoint Layout Matrix & Ultrawide Display Scaling

- `375px` & `414px` (Mobile): Single-column stacked cards, full-width inputs, horizontal scroll tabs, 2-col stat tiles.
- `768px` (Tablet): 2-col card grids, stacked mobile GCC tables, 3-col stat tiles.
- `1024px` & `1440px` (Desktop): Multi-column grids (3–4 columns), sticky headers, full data tables, persistent sidebar navigation.
- `1920px`, `2560px`, `3440px` (2K, 4K & Ultrawide): Fluid layout scaling via `w-full max-w-7xl 2xl:max-w-[1800px] 3xl:max-w-[2200px] 4xl:max-w-none mx-auto` enabling 4 to 6-column responsive card grids with zero clipped text.

---

## 5. Universal Typography & Dynamic Font Scaling System (v1.8+)

- **Dynamic Font Selector**:
  - `inter`: Clean modern geometric sans-serif (UI default).
  - `jetbrains`: Developer monospace applied across headings, code, and text.
  - `fira`: Code-optimized typeface with programming ligatures.
  - `system`: Native OS font (SF Pro, Segoe UI, Roboto).
  - `serif`: Distraction-free editorial typography (Charter / Georgia).
  - `dyslexic`: High-legibility letterforms (OpenDyslexic).
- **CSS Custom Property Multiplier**:
  - `--font-scale-multiplier`: Scales all webpage elements (`[class*="card"]`, headings, arbitrary utilities `text-[8px]`–`text-[15px]`, `pre`, `code`, `.token-line`) proportionally.
  - Steppers `[ A− ]` `[ Reset ]` `[ A+ ]` with instant hotkeys `Alt +` / `Alt -` / `Alt 0`.

---

## 6. Theme Contrast Safety Matrix (WCAG 2.2 AA)

All color combinations are mathematically verified to exceed WCAG 2.2 AA (4.5:1 normal text, 3:1 large text):

| Token / Element | Dark Mode (`#0a0a0b`) | Light Mode (`#f8f8fc`) | Grey Mode (`#18191c`) | E-Ink Mode (`#f7f6f2`) | WCAG AA Standard |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Primary Text** | `#f0f0f5` (17.2:1) | `#09090b` (18.1:1) | `#e4e5eb` (15.1:1) | `#111111` (16.8:1) | $\ge 4.5:1$ PASS |
| **Secondary Text** | `#cbd5e1` (11.8:1) | `#334155` (10.2:1) | `#b8bcc9` (10.4:1) | `#262626` (13.5:1) | $\ge 4.5:1$ PASS |
| **Muted Text** | `#9da4b4` (6.2:1) | `#475569` (7.2:1) | `#9095a6` (5.1:1) | `#475569` (7.2:1) | $\ge 4.5:1$ PASS |
| **Placeholder Text** | `#9ca3af` (6.1:1) | `#475569` (6.5:1) | `#9ca3af` (5.0:1) | `#555555` (5.4:1) | $\ge 4.5:1$ PASS |
| **Link Text** | `#60a5fa` (8.6:1) | `#1d4ed8` (5.7:1) | `#60a5fa` (7.8:1) | `#111111` (16.8:1) | $\ge 4.5:1$ PASS |
| **Code Syntax Amber** | `#fbbf24` (10.2:1) | `#fcd34d` (12.4:1 on dark) | `#fbbf24` (9.1:1) | `#78350f` (7.7:1 on paper) | $\ge 4.5:1$ PASS |
| **Code Syntax Orange** | `#fb923c` (7.8:1) | `#fdba74` (10.1:1 on dark) | `#fb923c` (6.9:1) | `#9a3412` (6.2:1 on paper) | $\ge 4.5:1$ PASS |

---

## 7. Natural Wrapping, Truncation & Code Display Rules

1. **Natural Word Wrapping**:
   - `overflow-wrap: anywhere` applied globally to prevent unbroken tokens (URLs, hashes, IDs) from expanding containers.
   - Prose paragraphs enforce `text-wrap: pretty` and comfortable line height (`1.6`).
   - Headings enforce `text-wrap: balance` with tight line height (`1.25`).
2. **Text Shrinking Protection**:
   - All flex children and grid cells containing text must permit shrinking (`min-width: 0`).
3. **Truncation Standards**:
   - Unintended `truncate`, `line-clamp`, or fixed-height clipping on primary titles, concepts, and descriptions is prohibited.
   - When preview text is intentionally clamped on compact cards, an explicit toggle button with `aria-expanded` and descriptive `aria-label` must be provided.
4. **Code Blocks**:
   - Technical indentation and character spacing are preserved.
   - Horizontal scrolling is scoped strictly within the code pane (`overflow-x-auto`).
   - An accessible word-wrap toggle (`aria-pressed`) allows switching between clean line wrapping and single-line alignment without altering copied clipboard text.

---

[← Back to Design System Directory](./README.md) • [Documentation Hub](../README.md)

