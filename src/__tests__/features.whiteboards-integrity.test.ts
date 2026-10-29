import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { architectureDiagrams } from "@/data/diagrams";
import { WHITEBOARD_CATEGORIES, TOTAL_WHITEBOARDS_COUNT } from "@/data/whiteboards-learning-data";

describe("Whiteboard Blueprints Integrity & Asset Verification", () => {
  it("contains exactly 42 architect-grade whiteboard diagrams", () => {
    expect(architectureDiagrams.length).toBe(42);
    expect(TOTAL_WHITEBOARDS_COUNT).toBe(42);
  });

  it("ensures every whiteboard diagram points to an existing, non-empty WebP asset on disk", () => {
    architectureDiagrams.forEach((diagram) => {
      expect(diagram.image).toBeTruthy();
      expect(diagram.image.startsWith("/diagrams/")).toBe(true);

      const filePath = path.join(process.cwd(), "public", diagram.image);
      const exists = fs.existsSync(filePath);
      expect(exists, `Image file not found on disk: ${diagram.image} for diagram ${diagram.id}`).toBe(true);

      const stats = fs.statSync(filePath);
      expect(stats.size, `Image file is empty or corrupted: ${diagram.image}`).toBeGreaterThan(20000); // > 20 KB
    });
  });

  it("verifies the 3 edge/format blueprint images and their aliases all exist on disk", () => {
    const requiredFiles = [
      "public/diagrams/enterprise_edge_architecture.webp",
      "public/diagrams/enterprise_edge_client_architecture.webp",
      "public/diagrams/open_table_formats_lakehouse_architecture.webp",
      "public/diagrams/open_table_formats_lakehouse.webp",
      "public/diagrams/open_file_formats_storage_architecture.webp",
      "public/diagrams/open_file_formats_storage.webp",
    ];

    requiredFiles.forEach((relPath) => {
      const fullPath = path.join(process.cwd(), relPath);
      expect(fs.existsSync(fullPath), `Asset alias missing: ${relPath}`).toBe(true);
      expect(fs.statSync(fullPath).size).toBeGreaterThan(20000);
    });
  });

  it("verifies all 42 diagrams contain complete 5-role persona breakdowns and incident runbooks", () => {
    architectureDiagrams.forEach((diagram) => {
      expect(diagram.personaBreakdown, `Missing personaBreakdown for ${diagram.id}`).toBeDefined();
      if (diagram.personaBreakdown) {
        expect(diagram.personaBreakdown.architect.length).toBeGreaterThan(20);
        expect(diagram.personaBreakdown.seniorDe.length).toBeGreaterThan(20);
        expect(diagram.personaBreakdown.dataEngineer.length).toBeGreaterThan(20);
        expect(diagram.personaBreakdown.steward.length).toBeGreaterThan(20);
        expect(diagram.personaBreakdown.businessAnalyst.length).toBeGreaterThan(20);
      }

      expect(diagram.architectNotes && diagram.architectNotes.length).toBeGreaterThan(30);
      expect(diagram.technicalMechanisms && diagram.technicalMechanisms.length).toBeGreaterThanOrEqual(3);
      expect(diagram.failureModesAndTriage && diagram.failureModesAndTriage.length).toBeGreaterThanOrEqual(2);
      expect(diagram.governanceAndCompliance && diagram.governanceAndCompliance.length).toBeGreaterThanOrEqual(2);
    });
  });

  it("verifies all 7 master categories accurately link to all 42 diagrams", () => {
    const allCategoryDiagramIds = WHITEBOARD_CATEGORIES.flatMap((c) => c.diagrams.map((d) => d.id));
    expect(allCategoryDiagramIds.length).toBe(42);

    const uniqueCategoryIds = new Set(allCategoryDiagramIds);
    expect(uniqueCategoryIds.size).toBe(42);

    architectureDiagrams.forEach((d) => {
      expect(uniqueCategoryIds.has(d.id), `Diagram ${d.id} is not mapped in WHITEBOARD_CATEGORIES`).toBe(true);
    });
  });
});
