#!/usr/bin/env python3
"""Generate theme-native -dark.webp and -light.webp variants for all diagrams and cheatsheets.

Does NOT modify docs/pdf/*, scripts/generate_reference_guides.py, or assets/whiteboards/*.
Outputs:
  - 56 diagrams in public/diagrams/: <name>-dark.webp and <name>-light.webp
  - 9 reference guide images in public/cheatsheets/images/: *-dark.webp and *-light.webp
  - 4 Databricks manual preview images in public/cheatsheets/images/: *-dark.webp and *-light.webp
  - 3 static Spark whiteboard cheatsheets in public/cheatsheets/images/: *-dark.webp and *-light.webp
  - Wires theme handling into reference guide & manual HTML files in public/cheatsheets/html/
"""

import glob
import os
import subprocess
import sys
import tempfile

import fitz  # PyMuPDF
from PIL import Image

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
WORKSPACE_DIR = os.path.dirname(SCRIPT_DIR)
PUBLIC_DIAGRAMS = os.path.join(WORKSPACE_DIR, "public", "diagrams")
CHEATSHEET_IMG_DIR = os.path.join(WORKSPACE_DIR, "public", "cheatsheets", "images")
CHEATSHEET_HTML_DIR = os.path.join(WORKSPACE_DIR, "public", "cheatsheets", "html")

if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

import convert_whiteboards_to_dark_bg as dark_conv  # noqa: E402
import generate_cheatsheets as gc  # noqa: E402
import generate_databricks_manual_pdf as gdm  # noqa: E402
import generate_reference_guides as grg  # noqa: E402


def get_reference_guide_css(theme_color: str, title_color: str, theme: str = "dark") -> str:
    """Return CSS for 2-page reference guides supporting both dark and light native renders."""
    base = gc.get_base_css(theme_color=theme_color, title_color=title_color, theme=theme)
    is_light = theme == "light"
    pri_bg = "#fffbeb" if is_light else "rgba(245, 158, 11, 0.08)"
    pri_fg = "#78350f" if is_light else "#fde68a"
    strong_fg = "#0f172a" if is_light else "#ffffff"
    extra = f"""
.explain-list li strong {{ color: {strong_fg}; font-weight: 600; }}
.alert-pri {{ background: {pri_bg}; border-left: 2px solid {theme_color}; color: {pri_fg}; }}
"""
    if not is_light:
        extra += """
html.light .explain-list li strong, html.e-ink .explain-list li strong { color: #0f172a; }
html.light .alert-pri, html.e-ink .alert-pri { background: #fffbeb; color: #78350f; }
"""
    return base + extra


def get_manual_dark_overrides() -> str:
    """Return dark-slate CSS overrides for the Databricks 20-page Technical Manual."""
    return """
body, .page { background: #080c15 !important; color: #e2e8f0 !important; }
.doc-eyebrow { color: #f87171 !important; }
.doc-title, .section-title { color: #f8fafc !important; }
.doc-subtitle { color: #94a3b8 !important; }
.title-divider { background: #ef4444 !important; }
.module-header { color: #fca5a5 !important; border-bottom-color: #334155 !important; }
.callout-box {
  background: rgba(239, 68, 68, 0.12) !important;
  border-color: #334155 !important;
  border-left-color: #f87171 !important;
  color: #e2e8f0 !important;
}
.callout-box strong { color: #fca5a5 !important; }
p, li { color: #cbd5e1 !important; }
li strong { color: #f8fafc !important; }
table.data-table th { background: #1e293b !important; color: #f8fafc !important; border-color: #334155 !important; }
table.data-table td { border-color: #334155 !important; color: #cbd5e1 !important; }
table.data-table tr:nth-child(even) td { background: #0f172a !important; }
table.data-table tr td:first-child { color: #f8fafc !important; }
.code-container { background: #040711 !important; border-color: #1e293b !important; border-left-color: #f87171 !important; color: #e2e8f0 !important; }
code.inline-code { background: #1e293b !important; color: #38bdf8 !important; border-color: #334155 !important; }
.page-footer { border-top-color: #334155 !important; color: #94a3b8 !important; }
"""


def get_manual_adaptive_css() -> str:
    """Return adaptive theme CSS rules for browser-viewed Technical Manual HTML."""
    return """
html.grey body, html.grey .page { background: #18191c !important; color: #e4e5eb !important; }
html.dark body, html.dark .page { background: #080c15 !important; color: #e2e8f0 !important; }
html.e-ink body, html.e-ink .page { background: #f7f6f2 !important; color: #111111 !important; }
html.dark .doc-eyebrow, html.grey .doc-eyebrow { color: #f87171 !important; }
html.dark .doc-title, html.dark .section-title, html.grey .doc-title, html.grey .section-title { color: #f8fafc !important; }
html.dark .doc-subtitle, html.grey .doc-subtitle { color: #94a3b8 !important; }
html.dark .module-header, html.grey .module-header { color: #fca5a5 !important; border-bottom-color: #334155 !important; }
html.dark .callout-box, html.grey .callout-box { background: rgba(239, 68, 68, 0.12) !important; border-color: #334155 !important; border-left-color: #f87171 !important; color: #e2e8f0 !important; }
html.dark .callout-box strong, html.grey .callout-box strong { color: #fca5a5 !important; }
html.dark p, html.dark li, html.grey p, html.grey li { color: #cbd5e1 !important; }
html.dark li strong, html.grey li strong { color: #f8fafc !important; }
html.dark table.data-table th, html.grey table.data-table th { background: #1e293b !important; color: #f8fafc !important; border-color: #334155 !important; }
html.dark table.data-table td, html.grey table.data-table td { border-color: #334155 !important; color: #cbd5e1 !important; }
html.dark table.data-table tr:nth-child(even) td, html.grey table.data-table tr:nth-child(even) td { background: #0f172a !important; }
html.dark table.data-table tr td:first-child, html.grey table.data-table tr td:first-child { color: #f8fafc !important; }
html.dark .code-container, html.grey .code-container { background: #040711 !important; border-color: #1e293b !important; color: #e2e8f0 !important; }
html.dark code.inline-code, html.grey code.inline-code { background: #1e293b !important; color: #38bdf8 !important; border-color: #334155 !important; }
html.dark .page-footer, html.grey .page-footer { border-top-color: #334155 !important; color: #94a3b8 !important; }
"""


def build_diagram_variants() -> int:
    """Create -dark.webp and -light.webp for all 56 diagrams in public/diagrams/."""
    all_webps = sorted(
        f
        for f in glob.glob(os.path.join(PUBLIC_DIAGRAMS, "*.webp"))
        if not f.endswith("-dark.webp") and not f.endswith("-light.webp")
    )
    print(f"[Diagrams] Processing {len(all_webps)} canonical diagrams in {PUBLIC_DIAGRAMS}...")
    for path in all_webps:
        fname = os.path.basename(path)
        stem = fname[:-5]
        dark_path = os.path.join(PUBLIC_DIAGRAMS, f"{stem}-dark.webp")
        light_path = os.path.join(PUBLIC_DIAGRAMS, f"{stem}-light.webp")

        # 1. -dark.webp from HEAD (or current dark file)
        dark_bytes = subprocess.check_output(["git", "show", f"HEAD:public/diagrams/{fname}"], cwd=WORKSPACE_DIR)
        with open(dark_path, "wb") as f:
            f.write(dark_bytes)

        # 2. -light.webp from pre-dark-conversion commit (15d703c~1: original whiteboards)
        light_bytes = subprocess.check_output(["git", "show", f"15d703c~1:public/diagrams/{fname}"], cwd=WORKSPACE_DIR)
        with open(light_path, "wb") as f:
            f.write(light_bytes)

    print(f"  ✓ Created -dark.webp and -light.webp for {len(all_webps)} diagrams.")
    return len(all_webps)


def build_reference_guide_variants() -> None:
    """Render -dark.webp and -light.webp for the 3 reference guides (9 images) + theme HTML."""
    guides = [
        {
            "name": "spark_execution_plan_and_catalyst_triage_guide",
            "title": "Spark Catalyst Optimizer & Physical Execution Plan Triage Guide",
            "theme": "#f59e0b",
            "title_color": "#38bdf8",
            "body": grg.CATALYST_BODY,
            "prefix": "spark_catalyst_plan",
        },
        {
            "name": "lakehouse_table_formats_delta_iceberg_guide",
            "title": "Lakehouse Table Formats Architecture & Migration Guide: Delta Lake vs Apache Iceberg",
            "theme": "#06b6d4",
            "title_color": "#38bdf8",
            "body": grg.DELTA_ICEBERG_BODY,
            "prefix": "lakehouse_table_formats",
        },
        {
            "name": "data_engineering_sdlc_and_data_contracts_guide",
            "title": "Data Engineering SDLC, Data Contracts & Testing Pyramid Reference Guide",
            "theme": "#10b981",
            "title_color": "#38bdf8",
            "body": grg.SDLC_CONTRACTS_BODY,
            "prefix": "data_sdlc_contracts",
        },
    ]

    with tempfile.TemporaryDirectory() as tmp_dir:
        for guide in guides:
            html_file = os.path.join(CHEATSHEET_HTML_DIR, f"{guide['name']}.html")
            dark_css = get_reference_guide_css(guide["theme"], guide["title_color"], theme="dark")
            dark_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>{guide['title']}</title>
{gc.THEME_SYNC_SCRIPT}
<style>
{dark_css}
</style>
</head>
<body>
{guide['body']}
</body>
</html>"""
            with open(html_file, "w", encoding="utf-8") as f:
                f.write(dark_html)

            dark_pdf = os.path.join(tmp_dir, f"{guide['prefix']}-dark.pdf")
            gc.compile_pdf(html_file, dark_pdf)
            gc.render_images(dark_pdf, guide["prefix"], dpi=250, theme_suffix="-dark", write_canonical=True)

            light_css = get_reference_guide_css(guide["theme"], guide["title_color"], theme="light")
            light_html_file = os.path.join(tmp_dir, f"{guide['prefix']}-light.html")
            light_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>{guide['title']}</title>
<style>
{light_css}
</style>
</head>
<body>
{guide['body']}
</body>
</html>"""
            with open(light_html_file, "w", encoding="utf-8") as f:
                f.write(light_html)
            light_pdf = os.path.join(tmp_dir, f"{guide['prefix']}-light.pdf")
            gc.compile_pdf(light_html_file, light_pdf)
            gc.render_images(light_pdf, guide["prefix"], dpi=250, theme_suffix="-light", write_canonical=False)


def build_manual_preview_variants() -> None:
    """Render -light.webp and -dark.webp for the Databricks Technical Manual previews (4 images)."""
    filename_base = "databricks_data_intelligence_platform_technical_manual"
    base_html = gdm.generate_html()

    # Wire adaptive theme support into the browser-viewable HTML
    browser_html = base_html.replace(
        "<title>",
        f"{gc.THEME_SYNC_SCRIPT}\n  <title>",
        1,
    ).replace(
        "</style>",
        f"{get_manual_adaptive_css()}\n</style>",
        1,
    )
    html_file = os.path.join(CHEATSHEET_HTML_DIR, f"{filename_base}.html")
    with open(html_file, "w", encoding="utf-8") as f:
        f.write(browser_html)
    print(f"  ✓ Wired theme sync into {os.path.basename(html_file)}")

    dark_html = base_html.replace(
        "</style>",
        f"{get_manual_dark_overrides()}\n</style>",
        1,
    )

    with tempfile.TemporaryDirectory() as tmp_dir:
        for variant, html_src, write_canonical in [
            ("light", base_html, True),
            ("dark", dark_html, False),
        ]:
            tmp_html = os.path.join(tmp_dir, f"manual-{variant}.html")
            tmp_pdf = os.path.join(tmp_dir, f"manual-{variant}.pdf")
            with open(tmp_html, "w", encoding="utf-8") as f:
                f.write(html_src)
            gdm.print_pdf_with_chrome(tmp_html, tmp_pdf)

            doc = fitz.open(tmp_pdf)
            pix = doc[0].get_pixmap(dpi=250)
            im = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            doc.close()

            for base in [filename_base, "databricks_manual"]:
                for kind in ["page_1", "poster"]:
                    im.save(
                        os.path.join(CHEATSHEET_IMG_DIR, f"{base}_{kind}-{variant}.webp"),
                        "WEBP",
                        quality=90,
                        method=6,
                    )
                    if write_canonical:
                        im.save(
                            os.path.join(CHEATSHEET_IMG_DIR, f"{base}_{kind}.webp"),
                            "WEBP",
                            quality=90,
                            method=6,
                        )
            print(f"  ✓ Rendered Technical Manual {variant} previews (4 WebP files)")


def build_static_spark_cheatsheet_variants() -> None:
    """Create -light.webp and -dark.webp for the 3 static hand-drawn Spark cheatsheet WebPs."""
    names = [
        "spark_architecture_catalyst_cheatsheet",
        "spark_join_strategies_decision_matrix",
        "spark_performance_skew_spill_triage",
    ]
    for stem in names:
        fname = f"{stem}.webp"
        canonical_path = os.path.join(CHEATSHEET_IMG_DIR, fname)
        light_path = os.path.join(CHEATSHEET_IMG_DIR, f"{stem}-light.webp")
        dark_path = os.path.join(CHEATSHEET_IMG_DIR, f"{stem}-dark.webp")

        raw_bytes = subprocess.check_output(
            ["git", "show", f"HEAD:public/cheatsheets/images/{fname}"],
            cwd=WORKSPACE_DIR,
        )
        with open(canonical_path, "wb") as f:
            f.write(raw_bytes)
        with open(light_path, "wb") as f:
            f.write(raw_bytes)

        im = Image.open(light_path)
        dark_im = dark_conv.transform_to_dark_bg(im)
        dark_im.save(dark_path, "WEBP", quality=90, method=6)
        print(f"  ✓ Rendered {stem}-light.webp and {stem}-dark.webp")


def main() -> None:
    print("=== GENERATING THEME-NATIVE WEBP VARIANTS (-dark / -light) ===")
    build_diagram_variants()
    build_reference_guide_variants()
    build_manual_preview_variants()
    build_static_spark_cheatsheet_variants()
    print("\n✅ All 56 diagrams and remaining 16 cheatsheet images processed cleanly.")


if __name__ == "__main__":
    main()
