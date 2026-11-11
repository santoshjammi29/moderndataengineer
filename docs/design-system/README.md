# Design System & Editorial Guidelines

<p align="center">
  <a href="https://moderndataengineer.uk"><img src="https://img.shields.io/badge/Live_Site-moderndataengineer.uk-blueviolet?style=flat-square" alt="Live Site"></a>
  <a href="tokens_and_primitives.md"><img src="https://img.shields.io/badge/Tokens-Design_Tokens_2.0-blue?style=flat-square" alt="Design Tokens"></a>
  <a href="../audits/design_system_audit.md"><img src="https://img.shields.io/badge/Audit-WCAG_2.1_AA-green?style=flat-square" alt="WCAG 2.1 AA"></a>
</p>

> **Visual Language, Design Tokens, Component Primitives & Motion Specifications**  
> Defining the quiet, data-dense, Apple- and Linear-inspired aesthetic of [`moderndataengineer.uk`](https://moderndataengineer.uk).

> [!NOTE]
> **Universal Typography & Dynamic Font Scaling**: The design system includes universal multi-font switching (`Inter`, `JetBrains Mono`, `Fira Code`, `System UI`, `Editorial Serif`, `OpenDyslexic`) and instant text scaling (`--font-scale-multiplier`) propagating across cards, code blocks, and arbitrary pixel utilities with zero layout shifting.

---

## 🎨 Design System Directory

| Specification | Primary Scope | Key Standards & Implementations | Direct Link |
| :--- | :--- | :--- | :--- |
| **Design Tokens & UI Primitives** | Color palette, fluid typography, 4px grid, component API | Surfaces (`base`, `raised`, `overlay`, `sunken`), `clamp()` fluid type scale, Heading/Card/Button/Badge primitives. | [`tokens_and_primitives.md`](./tokens_and_primitives.md) |
| **Design System Audit** | Responsive breakpoints, contrast matrix, WCAG 2.1 AA | 6 responsive breakpoints, fluid typography clamp, 100% pass rate across 58 test suites. | [`../audits/design_system_audit.md`](../audits/design_system_audit.md) |
| **Theme & Contrast Audit** | Zero-flash theme toggle, dark/light contrast | <16ms theme toggle, 9.8:1 dark and 8.4:1 light contrast ratios. | [`../audits/theme_audit.md`](../audits/theme_audit.md) |

---

## 📐 Core Aesthetic Principles

1. **Quiet, Restrained Typography**: High-legibility typography scale using system fonts (`SF Pro Display`, `Inter`, and `JetBrains Mono`) with mathematical fluid clamping (`clamp()`).
2. **Semantic Surface Elevation**: Clear hierarchical boundaries (`surface.base` `#0a0a0a` $\rightarrow$ `surface.raised` `#171717` $\rightarrow$ `surface.overlay` `#262626`) with 1px hairline borders (`#262626`).
3. **GPU-Accelerated Motion**: Motion models use hardware-accelerated canvas elements and transform-only CSS transitions with strict cubic-bezier easings (`cubic-bezier(0.22, 1, 0.36, 1)`).
4. **Universal Responsive Grid**: Dynamic multi-tier fluid containers (`w-full max-w-7xl 2xl:max-w-[1800px] 3xl:max-w-[2200px] 4xl:max-w-none mx-auto`) with multi-column responsive grid scaling supporting 1080p, 1440p, 2K, 4K, and 3440px ultrawide displays.
5. **Zero Fluff & Pure Signal**: Strict prohibition on marketing hype words (`seamless`, `cutting-edge`, `robust`, `powerful`), prioritizing concrete architecture parameters, throughputs, and code examples.

---

[← Back to Central Documentation Hub](../README.md)
