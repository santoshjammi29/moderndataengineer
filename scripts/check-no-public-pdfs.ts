import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const REQUIRE_BUILT = process.argv.includes("--require-built");

function walkFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

function findPdfFiles(dir: string): string[] {
  return walkFiles(dir)
    .filter((file) => file.toLowerCase().endsWith(".pdf"))
    .map((file) => path.relative(ROOT, file));
}

function main() {
  const errors: string[] = [];

  // 1. Ensure ZERO .pdf files exist in public/, .build-artifacts/, or .open-next/assets/
  const webDirs = ["public", ".build-artifacts", path.join(".open-next", "assets")];
  for (const relDir of webDirs) {
    const absDir = path.join(ROOT, relDir);
    if (relDir === path.join(".open-next", "assets") && REQUIRE_BUILT && !fs.existsSync(absDir)) {
      errors.push(`Expected built assets directory "${relDir}" does not exist.`);
      continue;
    }
    const pdfs = findPdfFiles(absDir);
    if (pdfs.length > 0) {
      errors.push(`Found forbidden web-reachable PDF(s) in ${relDir}: ${pdfs.join(", ")}`);
    }
  }

  // 2. Ensure PDF download API route is absent
  const downloadRouteDir = path.join(ROOT, "src", "app", "api", "download", "pdf");
  if (fs.existsSync(downloadRouteDir)) {
    errors.push(`Forbidden PDF download API directory exists: ${path.relative(ROOT, downloadRouteDir)}`);
  }

  // 3. Ensure user-facing discovery files do not expose PDF URLs or download hubs
  const webManifestFiles = [
    path.join("public", "llms.txt"),
    path.join("src", "app", "sitemap.ts"),
    path.join("src", "data", "navigation-data.ts"),
  ];
  for (const relFile of webManifestFiles) {
    const absFile = path.join(ROOT, relFile);
    if (!fs.existsSync(absFile)) continue;
    const content = fs.readFileSync(absFile, "utf-8");
    if (/\/api\/download\/pdf/i.test(content) || /\.pdf\b/i.test(content) || /\bPDF Hub\b/i.test(content)) {
      errors.push(`Forbidden PDF reference found in ${relFile}`);
    }
  }

  // 4. Verify all 11 repo-only PDFs exist in docs/pdf/
  const docsPdfDir = path.join(ROOT, "docs", "pdf");
  const repoPdfs = findPdfFiles(docsPdfDir);
  if (repoPdfs.length !== 11) {
    errors.push(`Expected 11 repo-only PDFs in docs/pdf/, found ${repoPdfs.length}.`);
  }

  if (errors.length > 0) {
    console.error("✗ PDF exposure CI check FAILED:");
    for (const err of errors) {
      console.error(`  - ${err}`);
    }
    process.exit(1);
  }

  const openNextChecked = fs.existsSync(path.join(ROOT, ".open-next", "assets"))
    ? "including .open-next/assets"
    : "(note: .open-next/assets not built yet)";
  console.log(
    `✓ PDF exposure CI check passed: 0 PDFs in public/ & build artifacts ${openNextChecked}; ${repoPdfs.length} repo-only PDFs verified in docs/pdf/.`
  );
}

main();
