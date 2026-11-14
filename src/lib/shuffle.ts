import { useState, useMemo, useCallback } from "react";

/**
 * Creates a deterministic pseudo-random number generator using the Mulberry32 algorithm.
 * Produces uniform 32-bit numbers mapped to [0, 1), ideal for reproducible shuffle testing.
 */
export function createSeededRandom(seed: number): () => number {
  let s = Math.floor(seed) >>> 0;
  return function mulberry32(): number {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Performs an unbiased Fisher–Yates (Knuth) shuffle on an array of items.
 *
 * Mathematical guarantee:
 * Every permutation of N items has an exact 1/N! probability of being produced.
 *
 * @param items The input array to shuffle (never mutated)
 * @param randomSource Optional function returning float in [0, 1), defaults to Math.random
 * @returns A new shuffled array containing all original elements with stable object identities
 */
export function fisherYatesShuffle<T>(
  items: readonly T[],
  randomSource: () => number = Math.random
): T[] {
  if (!items || items.length <= 1) {
    return items ? [...items] : [];
  }

  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    // Generate uniform random integer in [0, i]
    const j = Math.floor(randomSource() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }

  return result;
}

export interface UseShuffledCollectionOptions {
  /**
   * The noun describing the items being shuffled (e.g. "questions", "flashcards", "scenarios").
   */
  label?: string;
  /**
   * Optional custom random function (useful for deterministic tests).
   */
  randomSource?: (seed: number) => () => number;
}

export interface UseShuffledCollectionReturn<T> {
  /** The final list of items (canonical when isShuffled=false, shuffled when isShuffled=true) */
  items: T[];
  /** Whether the collection is currently in shuffled order */
  isShuffled: boolean;
  /** Sequential shuffle revision number */
  shuffleCount: number;
  /** Function to trigger a new random shuffle */
  handleShuffle: () => void;
  /** Function to reset to original canonical order */
  handleResetOrder: () => void;
  /** Screen-reader polite announcement string */
  statusAnnouncement: string;
}

/**
 * Reusable React hook for dynamic collections that require user-controlled shuffle.
 *
 * Rules:
 * 1. Default order is canonical (never randomized on initial load or server render).
 * 2. Order remains stable across unrelated renders or state updates.
 * 3. Does not scramble until the user explicitly clicks the shuffle action.
 * 4. Preserves filtered scopes, item selections, and stable IDs.
 */
export function useShuffledCollection<T>(
  sourceItems: T[],
  options: UseShuffledCollectionOptions = {}
): UseShuffledCollectionReturn<T> {
  const { label = "items", randomSource = createSeededRandom } = options;

  const [isShuffled, setIsShuffled] = useState<boolean>(false);
  const [shuffleSeed, setShuffleSeed] = useState<number>(0);
  const [statusAnnouncement, setStatusAnnouncement] = useState<string>("");

  const handleShuffle = useCallback(() => {
    setIsShuffled(true);
    setShuffleSeed((prev) => prev + 1);
    const count = sourceItems.length;
    setStatusAnnouncement(`Shuffled ${count} ${label}. Order randomized.`);
  }, [sourceItems.length, label]);

  const handleResetOrder = useCallback(() => {
    setIsShuffled(false);
    setStatusAnnouncement(`Reset ${label} to default order.`);
  }, [label]);

  const items = useMemo(() => {
    if (!isShuffled || sourceItems.length <= 1) {
      return sourceItems;
    }
    const rng = randomSource(shuffleSeed);
    return fisherYatesShuffle(sourceItems, rng);
  }, [sourceItems, isShuffled, shuffleSeed, randomSource]);

  return {
    items,
    isShuffled,
    shuffleCount: shuffleSeed,
    handleShuffle,
    handleResetOrder,
    statusAnnouncement,
  };
}
