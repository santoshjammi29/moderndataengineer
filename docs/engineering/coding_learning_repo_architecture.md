# Coding-Based Learning Repository Architecture & Curriculum Engineering

This guide documents the structural and content principles synthesized from analyzing **25 of the most-starred GitHub educational repositories** (~5,000,000+ aggregate stars). It serves as the engineering standard for authoring, structuring, and maintaining coding-based learning platforms and technical handbooks.

---

## 1. Top 25 GitHub Educational Repositories Analyzed

| # | Repository | Stars | Architectural Archetype | Key Pedagogical Pattern |
|---|---|---|---|---|
| 1 | **`codecrafters-io/build-your-own-x`** | ~564k | First-Principles Systems | Rebuilding databases, Git, Docker, and OS kernels from first principles. |
| 2 | **`sindresorhus/awesome`** | ~540k | Deterministic Knowledge Catalog | Machine-linted curated directory with strict 1-sentence summaries. |
| 3 | **`freeCodeCamp/freeCodeCamp`** | ~459k | Challenge Monorepo Curriculum | Micro-challenges with YAML frontmatter, seed code, and test assertions. |
| 4 | **`EbookFoundation/free-programming-books`** | ~401k | Sub-Indexed Directory | Sharded language/topic files and automated CI dead-link checking. |
| 5 | **`donnemartin/system-design-primer`** | ~378k | Visual System Blueprint | Hand-drawn architectural blueprints, latency tables, and trade-off matrices. |
| 6 | **`kamranahmedse/developer-roadmap`** | ~372k | Visual Decision Tree | Role-based interactive path diagrams with progressive drill-down guides. |
| 7 | **`jwasham/coding-interview-university`** | ~364k | Master Syllabus & Checklists | Multi-month timeline, checkbox tracking `[ ]`, prerequisite sequencing. |
| 8 | **`practical-tutorials/project-based-learning`** | ~290k | Project Categorization | Hands-on application building categorized by language and domain. |
| 9 | **`vinta/awesome-python`** | ~230k | Ecosystem Cartography | Vetted ecosystem directory with strict quality filtering and activity checks. |
| 10 | **`TheAlgorithms/Python`** | ~195k | Executable Algorithms | Pure idiomatic Python with inline doctests and zero external dependencies. |
| 11 | **`trekhleb/javascript-algorithms`** | ~190k | Code-Test-Doc Triad | 3-file pattern per concept (`README.md` + code + test) with `[B]`eginner/`[A]`dvanced tags. |
| 12 | **`ossu/computer-science`** | ~180k | Complete CS Degree | University-grade curriculum with prerequisite graphs and credit-hour estimates. |
| 13 | **`labuladong/fucking-algorithm`** | ~125k | Reusable Problem Templates | Algorithmic skeletons (Sliding Window, Backtracking, DP state machines). |
| 14 | **`yangshun/tech-interview-handbook`** | ~120k | Cognitive Cheat Sheets | Pattern-to-algorithm cognitive cheat sheets and end-to-end interview lifecycle. |
| 15 | **`30-seconds/30-seconds-of-code`** | ~120k | Atomic Micro-Snippets | < 30 LOC bite-sized units, metadata frontmatter, and static search generation. |
| 16 | **`goldbergyoni/nodebestpractices`** | ~105k | Golden Rules & Anti-Patterns | Numbered sections, priority badges, "Otherwise" risk analysis, Good vs Bad code. |
| 17 | **`ryanmcdermott/clean-code-javascript`** | ~95k | Anti-Pattern Contrast | Principle statement followed directly by side-by-side `Bad:` vs `Good:`. |
| 18 | **`iluwatar/java-design-patterns`** | ~90k | Design Pattern Monorepo | Module pattern: Intent, Real-world Analogy, Code, UML Diagram, JUnit tests. |
| 19 | **`florinpop17/app-ideas`** | ~80k | Tiered Challenge Specs | User stories + acceptance criteria + bonus tasks across Tier 1/2/3 difficulties. |
| 20 | **`kelseyhightower/kubernetes-the-hard-way`** | ~70k | Step-by-Step Lab | Zero-magic modular numbered labs (`01-`, `02-`), copyable CLI, verification checks. |
| 21 | **`AsimTahir/python-clean-code`** | ~55k | Language Idioms | Clean code principles adapted specifically to idiomatic Python paradigms. |
| 22 | **`firstcontributions/first-contributions`** | ~45k | Git Onboarding | Zero-friction fork/PR tutorial with automated GitHub Actions merge verification. |
| 23 | **`charlax/professional-programming`** | ~38k | Staff Engineer Maturity | High-density synthesis of seminal research papers, design lessons, and operations. |
| 24 | **`trekhleb/learn-python`** | ~18k | Assertion Playground | Executable Python script modules with native `assert` self-testing statements. |
| 25 | **`karan/Projects`** | ~35k | Real-World Problem Bank | Categorized domain problem prompts (Networking, Algorithms, Web scrapers). |

---

## 2. The 8 Structural Archetypes

1. **The Code-Test-Doc Triad**: `README.md` (theory + Big-O) + `solution.{ext}` (executable code) + `solution.test.{ext}` (automated test suite).
2. **The Step-by-Step Lab ("The Hard Way")**: Sequentially numbered chapters (`01-`, `02-`), zero magic wrappers, explicit CLI verification checks, and mandatory teardown labs.
3. **The Golden Rule & Anti-Pattern Taxonomy**: Numbered rules, priority badges, "Otherwise" disaster analysis, and side-by-side Bad vs. Good comparisons.
4. **Visual System Blueprint**: Architecture diagrams, concrete benchmark numbers, trade-off matrices, and systematic interview frameworks.
5. **First-Principles Rebuilding**: Learning through reverse engineering and rebuilding production systems from scratch.
6. **Interactive Challenge Monorepo**: Declarative challenge schemas with instructions, seed code, assert tests, and solutions.
7. **Master Syllabus & Checkbox Tracker**: Time-budgeted multi-month paths with interactive `- [ ]` checkboxes and prerequisite DAGs.
8. **Atomic Micro-Snippets**: Single-concept atomic code units under 30 lines with metadata tags.

---

## 3. The 4-Tier Progressive Disclosure Model

All technical curricula must structure modules across four progressive skill tiers:
- **Level 1 (Foundations)**: High-level mental model, physical analogies, and minimal runnable snippets ($\le 15$ lines).
- **Level 2 (Core Mechanics)**: Idiomatic, production-ready code with unit tests and Big-O complexity bounds.
- **Level 3 (Complex Scenarios & Edge Cases)**: Concurrency, memory allocation, skew, failure modes, and benchmarks.
- **Level 4 (Production Hardening & Architecture)**: Multi-tenancy, FinOps cost economics, zero-trust security, and operational triage runbooks.

---

## 4. Associated Agent Skill

This playbook is encoded as an operational agent skill located at:
`file:///Users/santosh/Documents/antigravity/charming-fermi/.agents/skills/coding-learning-repo-architect/SKILL.md`
