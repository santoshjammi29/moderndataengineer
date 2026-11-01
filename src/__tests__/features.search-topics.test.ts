import { describe, it, expect } from "vitest";
import { executePortalSearch, tokenizeQuery, identifyTopicsFromTokens } from "@/lib/search-engine";
import { resolveKnowledgeItem, resolveKnowledgeItemsBatch } from "@/lib/content-resolver";

describe("Search Topics Engine & Content Resolver", () => {
  it("tokenizes single words, multi words, and sentences without punctuation artifacts", () => {
    const single = tokenizeQuery("Spark");
    expect(single).toEqual(["spark"]);

    const multi = tokenizeQuery("Broadcast Hash Join");
    expect(multi).toContain("broadcast");
    expect(multi).toContain("hash");
    expect(multi).toContain("join");

    const sentence = tokenizeQuery("How do you handle data skew in Spark 4.0?");
    expect(sentence).toContain("handle");
    expect(sentence).toContain("skew");
    expect(sentence).toContain("spark");
    expect(sentence).not.toContain("how");
    expect(sentence).not.toContain("do");
    expect(sentence).not.toContain("you");
  });

  it("identifies core topics accurately and ranks them by score", () => {
    const sparkTopics = identifyTopicsFromTokens(["skew", "spark"], "How do you handle data skew in Spark?");
    expect(sparkTopics.length).toBeGreaterThan(0);
    expect(sparkTopics[0].key).toBe("spark");

    const deltaTopics = identifyTopicsFromTokens(["delta", "lake"], "Delta lake ACID transactions");
    expect(deltaTopics.length).toBeGreaterThan(0);
    expect(["databricks", "datalake"]).toContain(deltaTopics[0].key);

    const modelingTopics = identifyTopicsFromTokens(["kimball", "vault"], "kimball vs data vault");
    expect(modelingTopics.length).toBeGreaterThan(0);
    expect(modelingTopics[0].key).toBe("modeling");
  });

  it("executes portal search successfully across multiple query styles", () => {
    // Single word
    const singleRes = executePortalSearch("spark", 10);
    expect(singleRes.total).toBeGreaterThan(0);
    expect(singleRes.items.length).toBeGreaterThan(0);

    // Multi word
    const multiRes = executePortalSearch("broadcast hash join", 10);
    expect(multiRes.total).toBeGreaterThan(0);
    expect(multiRes.items.some((i) => i.title.toLowerCase().includes("broadcast"))).toBe(true);

    // Full sentence
    const sentenceRes = executePortalSearch("How do you handle data skew in Spark?", 10);
    expect(sentenceRes.total).toBeGreaterThan(0);
    expect(sentenceRes.identifiedTopics.length).toBeGreaterThan(0);
    expect(sentenceRes.identifiedTopics[0].key).toBe("spark");
  });

  it("resolves full detailed content for Q&A, Architecture, and Concepts", async () => {
    // Q&A
    const qa = await resolveKnowledgeItem("qa-adf-ir-1");
    expect(qa).toBeDefined();
    expect(qa?.category).toBe("Q&A Prep");
    expect(qa?.details.answer).toBeDefined();

    // Architecture
    const arch = await resolveKnowledgeItem("arch-arch-spec-0001");
    expect(arch).toBeDefined();
    expect(arch?.category).toBe("Architecture");
    expect(arch?.details.architectureSolution || arch?.details.answer).toBeDefined();

    // Concept
    const concept = await resolveKnowledgeItem("concept-fabric-onelake");
    expect(concept).toBeDefined();
    expect(concept?.category).toBe("Concepts");
    expect(concept?.details.definition).toBeDefined();
  });

  it("batch resolves items in parallel", async () => {
    const batch = await resolveKnowledgeItemsBatch([
      "qa-adf-ir-1",
      "concept-fabric-onelake",
      "diagram-fabric-onelake-architecture",
      "topic-spark",
    ]);

    expect(Object.keys(batch).length).toBe(4);
    expect(batch["qa-adf-ir-1"]).toBeDefined();
    expect(batch["concept-fabric-onelake"]).toBeDefined();
    expect(batch["diagram-fabric-onelake-architecture"]).toBeDefined();
    expect(batch["topic-spark"]).toBeDefined();
  });
});
