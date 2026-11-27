import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

function collectPdfFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectPdfFiles(fullPath));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".pdf")) {
      results.push(path.relative(ROOT, fullPath));
    }
  }
  return results;
}

describe("Repository-Only PDF Invariants", () => {
  it("contains zero .pdf files inside public/ and .build-artifacts/", () => {
    expect(collectPdfFiles(path.join(ROOT, "public"))).toEqual([]);
    expect(collectPdfFiles(path.join(ROOT, ".build-artifacts"))).toEqual([]);
    const openNextAssets = path.join(ROOT, ".open-next", "assets");
    if (fs.existsSync(openNextAssets)) {
      expect(collectPdfFiles(openNextAssets)).toEqual([]);
    }
  });

  it("removes PDF download API route and PDF hub components", () => {
    expect(fs.existsSync(path.join(ROOT, "src", "app", "api", "download", "pdf"))).toBe(false);
    expect(fs.existsSync(path.join(ROOT, "src", "components", "cheatsheet", "pdf-downloads-hub.tsx"))).toBe(false);
  });

  it("does not expose .pdf links or PDF Hub copy in llms.txt, sitemap.ts, or navigation-data.ts", () => {
    for (const rel of ["public/llms.txt", "src/app/sitemap.ts", "src/data/navigation-data.ts"]) {
      const content = fs.readFileSync(path.join(ROOT, rel), "utf-8");
      expect(content).not.toMatch(/\/api\/download\/pdf/i);
      expect(content).not.toMatch(/\.pdf\b/i);
      expect(content).not.toMatch(/\bPDF Hub\b/i);
    }
  });

  it("keeps all 11 vector A4 PDFs exclusively in docs/pdf/", () => {
    const docsPdfs = collectPdfFiles(path.join(ROOT, "docs", "pdf"));
    expect(docsPdfs.length).toBe(11);
  });
});
