import { describe, it, expect } from "vitest";
import { fisherYatesShuffle, createSeededRandom } from "@/lib/shuffle";

describe("Fisher–Yates Shuffle Engine (src/lib/shuffle.ts)", () => {
  it("handles empty arrays and single-item arrays safely", () => {
    expect(fisherYatesShuffle([])).toEqual([]);
    expect(fisherYatesShuffle(["only-item"])).toEqual(["only-item"]);
  });

  it("does not mutate the source array", () => {
    const original = ["a", "b", "c", "d", "e"];
    const originalCopy = [...original];
    const shuffled = fisherYatesShuffle(original, createSeededRandom(42));

    expect(original).toEqual(originalCopy);
    expect(shuffled).not.toBe(original);
  });

  it("preserves all elements and set cardinality", () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const shuffled = fisherYatesShuffle(items, createSeededRandom(12345));

    expect(shuffled.length).toBe(items.length);
    expect(new Set(shuffled)).toEqual(new Set(items));
  });

  it("produces deterministic permutations with the same seed", () => {
    const items = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8"];
    const shuffle1 = fisherYatesShuffle(items, createSeededRandom(999));
    const shuffle2 = fisherYatesShuffle(items, createSeededRandom(999));

    expect(shuffle1).toEqual(shuffle2);
  });

  it("produces different permutations with different seeds", () => {
    const items = ["alpha", "beta", "gamma", "delta", "epsilon", "zeta", "eta", "theta"];
    const shuffleA = fisherYatesShuffle(items, createSeededRandom(1));
    const shuffleB = fisherYatesShuffle(items, createSeededRandom(2));

    expect(shuffleA).not.toEqual(shuffleB);
  });

  it("preserves complex object references and stable IDs", () => {
    const questions = [
      { id: "qa-101", title: "Spark Skew Salting", diff: "ARCHITECT" },
      { id: "qa-102", title: "Delta Lake Deletion Vectors", diff: "HARD" },
      { id: "qa-103", title: "Airflow Deferrable Operators", diff: "MEDIUM" },
      { id: "qa-104", title: "Iceberg Manifest Metadata", diff: "ARCHITECT" },
      { id: "qa-105", title: "Photon SIMD Vectorization", diff: "HARD" },
    ];

    const shuffled = fisherYatesShuffle(questions, createSeededRandom(777));
    expect(shuffled.length).toBe(questions.length);

    // Verify all original IDs exist
    const shuffledIds = shuffled.map((q) => q.id);
    expect(shuffledIds.sort()).toEqual(questions.map((q) => q.id).sort());

    // Verify properties remain intact on elements
    for (const item of shuffled) {
      const original = questions.find((q) => q.id === item.id);
      expect(item).toEqual(original);
    }
  });

  it("uniform distribution check (Mulberry32 PRNG)", () => {
    const rng = createSeededRandom(100);
    const samples = Array.from({ length: 1000 }, () => rng());

    for (const val of samples) {
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }

    const average = samples.reduce((acc, v) => acc + v, 0) / samples.length;
    // Expected mean of uniform [0, 1) is 0.5. Tolerance ±0.05
    expect(average).toBeGreaterThan(0.45);
    expect(average).toBeLessThan(0.55);
  });
});
