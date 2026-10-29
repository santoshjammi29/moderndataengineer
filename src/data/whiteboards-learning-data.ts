import { architectureDiagrams, type ArchitectureDiagramItem } from "@/data/diagrams";
import rawCatalog from "./whiteboards-learning-catalog.json";
import type { Concept, UnifiedQuestion, ModernBlueprint, ArchitectureQuestion } from "@/types/data";

export interface WhiteboardCategoryStats {
  diagramsCount: number;
  conceptsCount: number;
  qaCount: number;
  blueprintsCount: number;
}

export interface WhiteboardCategoryData {
  id: string;
  title: string;
  shortTitle: string;
  icon: string;
  themeColor: string;
  tagline: string;
  diagramCategory: string;
  overview: string;
  learningMilestones: string[];
  diagramIds: string[];
  diagrams: ArchitectureDiagramItem[];
  stats: WhiteboardCategoryStats;
  concepts: Concept[];
  questions: UnifiedQuestion[];
  blueprints: ModernBlueprint[];
  scenarios: ArchitectureQuestion[];
}

/**
 * Enriched Whiteboard Learning Catalog
 * Resolves each category's diagram IDs to full ArchitectureDiagramItem objects
 */
export const WHITEBOARD_CATEGORIES: WhiteboardCategoryData[] = (rawCatalog as any[]).map((cat) => {
  const resolvedDiagrams = cat.diagramIds
    .map((id: string) => architectureDiagrams.find((d) => d.id === id))
    .filter((d: any): d is ArchitectureDiagramItem => Boolean(d));

  return {
    ...cat,
    diagrams: resolvedDiagrams,
    stats: {
      diagramsCount: resolvedDiagrams.length,
      conceptsCount: cat.concepts.length,
      qaCount: cat.questions.length,
      blueprintsCount: cat.blueprints.length + (cat.scenarios?.length || 0),
    },
  };
});

export const TOTAL_WHITEBOARDS_COUNT = architectureDiagrams.length;
export const TOTAL_CATEGORIES_COUNT = WHITEBOARD_CATEGORIES.length;

export function getCategoryById(id: string): WhiteboardCategoryData | undefined {
  return WHITEBOARD_CATEGORIES.find((c) => c.id === id);
}

export function getAdjacentCategories(currentId: string): { prev: WhiteboardCategoryData; next: WhiteboardCategoryData } {
  const currentIndex = WHITEBOARD_CATEGORIES.findIndex((c) => c.id === currentId);
  const safeIndex = currentIndex === -1 ? 0 : currentIndex;
  const prevIndex = (safeIndex - 1 + WHITEBOARD_CATEGORIES.length) % WHITEBOARD_CATEGORIES.length;
  const nextIndex = (safeIndex + 1) % WHITEBOARD_CATEGORIES.length;
  return {
    prev: WHITEBOARD_CATEGORIES[prevIndex],
    next: WHITEBOARD_CATEGORIES[nextIndex],
  };
}
