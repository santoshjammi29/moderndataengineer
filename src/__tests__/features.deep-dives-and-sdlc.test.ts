import { describe, it, expect } from "vitest";
import { PRODUCTION_DEEP_DIVES } from "@/data/production-deep-dives-data";
import { SDLC_PHASES, SDLC_LIFECYCLE_GATES } from "@/data/sdlc-lifecycle-data";
import { COMPLETE_LEARNING_TREE } from "@/data/learning-tree-data";
import { PLATFORM_CONFIG } from "@/config/platform.config";

describe("Production Deep Dives Dataset (130 Topics)", () => {
  it("contains exactly 13 production domains", () => {
    expect(PRODUCTION_DEEP_DIVES.length).toBe(13);
  });

  it("contains exactly 130 production deep dive topics with 10 topics per domain", () => {
    let totalTopics = 0;
    const seenIds = new Set<number>();
    const seenSlugs = new Set<string>();

    PRODUCTION_DEEP_DIVES.forEach((domain) => {
      expect(domain.topics.length).toBe(10);
      expect(domain.researchAnchors.length).toBeGreaterThan(0);

      domain.topics.forEach((topic) => {
        totalTopics++;
        expect(seenIds.has(topic.id)).toBe(false);
        seenIds.add(topic.id);
        expect(seenSlugs.has(topic.slug)).toBe(false);
        seenSlugs.add(topic.slug);
        expect(topic.title.length).toBeGreaterThan(0);
        expect(topic.summary.length).toBeGreaterThan(0);
        expect(topic.labFolder.length).toBeGreaterThan(0);
      });
    });

    expect(totalTopics).toBe(130);
    // Verify IDs cover 1 to 130 continuously
    for (let i = 1; i <= 130; i++) {
      expect(seenIds.has(i)).toBe(true);
    }
  });
});

describe("End-to-End SDLC Dataset (19 Phases · 152 Controls · 8 Gates)", () => {
  it("contains exactly 19 SDLC phases", () => {
    expect(SDLC_PHASES.length).toBe(19);
  });

  it("contains exactly 152 controls with 8 controls per phase", () => {
    let totalControls = 0;
    const seenIds = new Set<number>();
    const seenCodes = new Set<string>();

    SDLC_PHASES.forEach((phase) => {
      expect(phase.topics.length).toBe(8);
      expect(phase.researchAnchors.length).toBeGreaterThan(0);

      phase.topics.forEach((topic) => {
        totalControls++;
        expect(seenIds.has(topic.id)).toBe(false);
        seenIds.add(topic.id);
        expect(seenCodes.has(topic.code)).toBe(false);
        seenCodes.add(topic.code);
        expect(topic.title.length).toBeGreaterThan(0);
        expect(topic.summary.length).toBeGreaterThan(0);
      });
    });

    expect(totalControls).toBe(152);
    // Verify codes 001 to 152 continuously
    for (let i = 1; i <= 152; i++) {
      const code = String(i).padStart(3, "0");
      expect(seenCodes.has(code)).toBe(true);
    }
  });

  it("contains all 8 SDLC lifecycle gates", () => {
    expect(SDLC_LIFECYCLE_GATES.length).toBe(8);
    const gateNames = SDLC_LIFECYCLE_GATES.map((g) => g.gate);
    expect(gateNames).toContain("Intake");
    expect(gateNames).toContain("Design");
    expect(gateNames).toContain("Merge");
    expect(gateNames).toContain("Build");
    expect(gateNames).toContain("Deploy");
    expect(gateNames).toContain("Production Handoff");
    expect(gateNames).toContain("Operate & Update");
    expect(gateNames).toContain("Retire");
  });
});

describe("Master Lab & Learning Tree", () => {
  it("contains top-level nodes for curriculum, concepts, labs, datasets, and architecture", () => {
    expect(COMPLETE_LEARNING_TREE.children).toBeDefined();
    const topNodeNames = COMPLETE_LEARNING_TREE.children!.map((c) => c.name);
    expect(topNodeNames).toContain("curriculum");
    expect(topNodeNames).toContain("concepts");
    expect(topNodeNames).toContain("labs");
    expect(topNodeNames).toContain("datasets");
    expect(topNodeNames).toContain("architecture");
  });

  it("contains all 16 lab suites in the labs node", () => {
    const labsNode = COMPLETE_LEARNING_TREE.children!.find((c) => c.name === "labs");
    expect(labsNode).toBeDefined();
    expect(labsNode?.children?.length).toBe(16);
  });
});

describe("Platform Metadata & Hubs Alignment", () => {
  it("has updated platform config with 679 concepts and 42 whiteboards", () => {
    expect(PLATFORM_CONFIG.hubs.concepts.badge).toContain("679");
    expect(PLATFORM_CONFIG.hubs.architecture.description).toContain("42 whiteboard blueprints");
  });
});
