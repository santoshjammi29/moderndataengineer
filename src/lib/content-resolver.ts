import type {
  Concept,
  ArchitectureQuestion,
  UnifiedQuestion,
  CompanyProfile,
  CodeSheetItem,
  CheatCode,
  ModernBlueprint,
  ModernCodeMatrix,
  ModernCostPlaybook,
  LearningPath,
  EvidenceSource,
} from "@/types/data";

export interface ResolvedKnowledgeItem {
  id: string;
  catalogId: string;
  title: string;
  category: string;
  difficulty?: string;
  domain?: string;
  subdomain?: string;
  href: string;
  badge?: string;
  summary?: string;
  details: {
    question?: string;
    answer?: string;
    rubricPoints?: string[];
    companyTargets?: string[];
    tags?: string[];
    problemStatement?: string;
    constraints?: string[];
    architectureSolution?: string;
    tradeoffs?: string[];
    blueprintId?: string;
    definition?: string;
    explanation?: string;
    keyPoints?: string[];
    language?: string;
    code?: string;
    use_case?: string;
    output?: string;
    problem?: string;
    solution?: string;
    whyItMatters?: string;
    impact?: string;
    subtitle?: string;
    description?: string;
    architectNotes?: string;
    technicalMechanisms?: string[];
    personaBreakdown?: Record<string, string>;
    failureModesAndTriage?: string[];
    governanceAndCompliance?: string[];
    image?: string;
    tier?: string;
    location?: string;
    seniorDeSalary?: string;
    architectSalary?: string;
    stack?: string[];
    interviewFocus?: string[];
    keyChallenges?: string;
    sampleQuestions?: string[];
    executiveSummary?: string;
    modules?: any[];
    savings?: string;
    topic?: string;
    python?: string;
    pyspark?: string;
    sparksql?: string;
    duckdb?: string;
    snowflake?: string;
    bigquery?: string;
    trino?: string;
    sources?: EvidenceSource[];
  };
}

// Memory caches for lazy-loaded datasets
let questionsCache: Promise<UnifiedQuestion[]> | null = null;
let archCache: Promise<ArchitectureQuestion[]> | null = null;
let conceptsCache: Promise<Concept[]> | null = null;
let codePracticeCache: Promise<Record<string, CodeSheetItem[]>> | null = null;
let cheatsheetsCache: Promise<{ core: CheatCode[]; dbx: any }> | null = null;
let companiesCache: Promise<CompanyProfile[]> | null = null;
let blueprintsCache: Promise<ModernBlueprint[]> | null = null;
let costPlaybooksCache: Promise<ModernCostPlaybook[]> | null = null;
let codeMatrixCache: Promise<ModernCodeMatrix[]> | null = null;
let pathsCache: Promise<LearningPath[]> | null = null;

async function getQuestions(): Promise<UnifiedQuestion[]> {
  if (!questionsCache) {
    questionsCache = Promise.all([
      import("@/data/json/questions.json").then((m) => m.default as unknown as UnifiedQuestion[]),
      import("@/data/json/data_de.json").then((m) => m.default as unknown as UnifiedQuestion[]),
    ]).then(([q1, q2]) => [...q1, ...q2]);
  }
  return questionsCache;
}

async function getArchitecture(): Promise<ArchitectureQuestion[]> {
  if (!archCache) {
    archCache = import("@/data/json/data_architecture.json").then(
      (m) => m.default as unknown as ArchitectureQuestion[]
    );
  }
  return archCache;
}

async function getConcepts(): Promise<Concept[]> {
  if (!conceptsCache) {
    conceptsCache = import("@/data/json/data_concepts.json").then(
      (m) => m.default as unknown as Concept[]
    );
  }
  return conceptsCache;
}

async function getCodePractice(): Promise<Record<string, CodeSheetItem[]>> {
  if (!codePracticeCache) {
    codePracticeCache = Promise.all([
      import("@/data/json/data_pyspark.json").then((m) => m.default as unknown as CodeSheetItem[]),
      import("@/data/json/data_sparksql.json").then((m) => m.default as unknown as CodeSheetItem[]),
      import("@/data/json/data_python.json").then((m) => m.default as unknown as CodeSheetItem[]),
      import("@/data/json/data_mssql.json").then((m) => m.default as unknown as CodeSheetItem[]),
      import("@/data/json/databricks_100.json").then((m) => m.default as any[]),
    ]).then(([pyspark, sparksql, python, mssql, dbx100]) => ({
      pyspark,
      sparksql,
      python,
      mssql,
      dbx100: dbx100.map((item: any) => ({
        id: `dbx100-${item.day}`,
        title: item.title,
        level: item.level || "ADVANCED",
        category: "Databricks 100",
        description: item.summary || item.description || "",
        code: item.code || item.implementation || "",
        use_case: item.realWorldContext || (item.keyPoints ? item.keyPoints.join("; ") : ""),
        notes: item.keyPoints || [],
      })),
    }));
  }
  return codePracticeCache;
}

async function getCheatsheets() {
  if (!cheatsheetsCache) {
    cheatsheetsCache = Promise.all([
      import("@/data/json/data_cheatsheet.json").then((m) => m.default as unknown as CheatCode[]),
      import("@/data/json/databricks_cheatsheets.json").then((m) => m.default),
    ]).then(([core, dbx]) => ({ core, dbx }));
  }
  return cheatsheetsCache;
}

async function getCompanies(): Promise<CompanyProfile[]> {
  if (!companiesCache) {
    companiesCache = import("@/data/json/company_profiles.json").then(
      (m) => m.default as unknown as CompanyProfile[]
    );
  }
  return companiesCache;
}

async function getModernBlueprints(): Promise<ModernBlueprint[]> {
  if (!blueprintsCache) {
    blueprintsCache = import("@/data/json/modern_blueprints.json").then(
      (m) => m.default as unknown as ModernBlueprint[]
    );
  }
  return blueprintsCache;
}

async function getCostPlaybooks(): Promise<ModernCostPlaybook[]> {
  if (!costPlaybooksCache) {
    costPlaybooksCache = import("@/data/json/modern_cost_playbooks.json").then(
      (m) => m.default as unknown as ModernCostPlaybook[]
    );
  }
  return costPlaybooksCache;
}

async function getCodeMatrix(): Promise<ModernCodeMatrix[]> {
  if (!codeMatrixCache) {
    codeMatrixCache = import("@/data/json/modern_code_matrix.json").then(
      (m) => m.default as unknown as ModernCodeMatrix[]
    );
  }
  return codeMatrixCache;
}

async function getLearningPaths(): Promise<LearningPath[]> {
  if (!pathsCache) {
    pathsCache = import("@/data/json/data_paths.json").then(
      (m) => m.default as unknown as LearningPath[]
    );
  }
  return pathsCache;
}

/**
 * Resolves a knowledge base item by its search catalog ID or direct ID.
 */
export async function resolveKnowledgeItem(
  catalogId: string,
  categoryHint?: string
): Promise<ResolvedKnowledgeItem | null> {
  const trimmedId = catalogId.trim();
  if (!trimmedId) return null;

  // 1. GUIDED TRACK (topic-*)
  if (trimmedId.startsWith("topic-")) {
    const key = trimmedId.replace(/^topic-/, "");
    const { GUIDED_TOPICS } = await import("@/data/guided-learning-topics");
    const found = GUIDED_TOPICS.find((t) => t.key.toLowerCase() === key.toLowerCase());
    if (found) {
      return {
        id: found.key,
        catalogId: trimmedId,
        title: found.label,
        category: "Guided Track",
        domain: found.domain,
        href: `/guided-learning?topic=${found.key}`,
        badge: `Track · ${found.domain}`,
        summary: found.description,
        details: {
          description: found.description,
          executiveSummary: found.executiveSummary,
          modules: found.description ? [found.description] : [],
          sources: found.sources || [],
        },
      };
    }
  }

  // 2. WHITEBOARD ARCHITECTURE BLUEPRINT (diagram-* or bp-*)
  if (trimmedId.startsWith("diagram-")) {
    const dId = trimmedId.replace(/^diagram-/, "");
    const { architectureDiagrams } = await import("@/data/diagrams");
    const found = architectureDiagrams.find((d) => d.id === dId);
    if (found) {
      return {
        id: found.id,
        catalogId: trimmedId,
        title: found.title,
        category: "Blueprints",
        domain: found.category,
        href: `/architecture#${found.id}`,
        badge: "Whiteboard Blueprint",
        summary: found.description,
        details: {
          subtitle: found.subtitle,
          description: found.description,
          keyPoints: found.keyPoints || [],
          architectNotes: found.architectNotes,
          technicalMechanisms: (found.technicalMechanisms as any[]) || [],
          personaBreakdown: (found.personaBreakdown as unknown as Record<string, string>) || {},
          failureModesAndTriage: (found.failureModesAndTriage as any[]) || [],
          governanceAndCompliance: (found.governanceAndCompliance as any[]) || [],
          image: found.image,
        },
      };
    }
  }

  if (trimmedId.startsWith("bp-")) {
    const bId = trimmedId.replace(/^bp-/, "");
    const blueprints = await getModernBlueprints();
    const found = blueprints.find((b) => b.id === bId);
    if (found) {
      return {
        id: found.id,
        catalogId: trimmedId,
        title: found.title,
        category: "Blueprints",
        domain: found.category,
        href: "/modern-stack#blueprints",
        badge: found.category,
        summary: found.costEstimate,
        details: {
          description: `${found.category} blueprint architecture.`,
          keyPoints: found.tags || [],
          savings: found.costEstimate,
        },
      };
    }
  }

  // 3. CONCEPTS (concept-*)
  if (trimmedId.startsWith("concept-") || categoryHint === "Concepts") {
    const cId = trimmedId.replace(/^concept-/, "");
    const concepts = await getConcepts();
    const found = concepts.find((c) => c.id === cId || c.term.toLowerCase() === cId.toLowerCase());
    if (found) {
      return {
        id: found.id,
        catalogId: trimmedId,
        title: found.term,
        category: "Concepts",
        difficulty: found.difficulty,
        domain: found.category,
        href: `/concepts?tab=concepts&category=${encodeURIComponent(found.category)}&term=${encodeURIComponent(found.term)}`,
        badge: found.difficulty || "Foundations",
        summary: found.definition,
        details: {
          definition: found.definition,
          explanation: found.explanation,
          keyPoints: found.keyPoints || [],
          sources: (found as any).sources || [],
        },
      };
    }
  }

  // 4. ARCHITECTURE SCENARIO (arch-*)
  if (trimmedId.startsWith("arch-") || categoryHint === "Architecture") {
    const aId = trimmedId.replace(/^arch-/, "");
    const arch = await getArchitecture();
    const found = arch.find((a) => a.id === aId || `arch-${a.id}` === trimmedId);
    if (found) {
      const anyFound = found as any;
      return {
        id: found.id,
        catalogId: trimmedId,
        title: anyFound.title || found.question || `Scenario ${found.id}`,
        category: "Architecture",
        difficulty: found.difficulty || "ARCHITECT",
        domain: found.category,
        subdomain: found.niche,
        href: `/architecture?category=${encodeURIComponent(found.category || "ALL")}&card=${encodeURIComponent(found.id)}`,
        badge: found.difficulty || "System Design",
        summary: found.question || anyFound.problemStatement,
        details: {
          question: found.question,
          problemStatement: anyFound.problemStatement || found.question,
          constraints: anyFound.constraints || [],
          architectureSolution: anyFound.architectureSolution || found.answer,
          tradeoffs: anyFound.tradeoffs || [],
          blueprintId: anyFound.blueprintId,
          sources: (anyFound.sources || (found as any).sources) || [],
        },
      };
    }
  }

  // 5. Q&A PREP (qa-*)
  if (trimmedId.startsWith("qa-") || categoryHint === "Q&A Prep") {
    const qId = trimmedId.replace(/^qa-/, "");
    const questions = await getQuestions();
    const found = questions.find((q) => q.id === qId || `qa-${q.id}` === trimmedId);
    if (found) {
      return {
        id: found.id,
        catalogId: trimmedId,
        title: found.question,
        category: "Q&A Prep",
        difficulty: found.difficulty || "HARD",
        domain: found.domain || found.category,
        subdomain: found.niche,
        href: `/qa-prep?category=${encodeURIComponent(found.category || "ALL")}&card=${encodeURIComponent(found.id)}`,
        badge: found.difficulty || "Interview Drill",
        summary: found.question,
        details: {
          question: found.question,
          answer: found.answer,
          rubricPoints: found.rubricPoints || [],
          companyTargets: found.companyTargets || [],
          tags: Array.isArray(found.tags) ? found.tags : found.niche ? [found.niche] : [],
          code: found.code,
          sources: (found as any).sources || [],
        },
      };
    }
  }

  // 6. CODE PRACTICE (code-*, matrix-pattern-*)
  if (trimmedId.startsWith("code-") || categoryHint === "Code Practice") {
    const code = await getCodePractice();
    let foundItem: CodeSheetItem | undefined;
    let language = "Code Practice";

    for (const [lang, items] of Object.entries(code)) {
      foundItem = items.find(
        (it) =>
          it.id === trimmedId ||
          `code-${lang}-${it.id}` === trimmedId ||
          trimmedId.endsWith(`-${it.id}`)
      );
      if (foundItem) {
        language = lang.toUpperCase();
        break;
      }
    }

    if (foundItem) {
      return {
        id: foundItem.id,
        catalogId: trimmedId,
        title: foundItem.title,
        category: "Code Practice",
        difficulty: String(foundItem.level),
        domain: foundItem.category || language,
        href: "/code-practice",
        badge: String(foundItem.level || language),
        summary: foundItem.description,
        details: {
          language,
          description: foundItem.description,
          code: foundItem.code,
          use_case: foundItem.use_case,
        },
      };
    }
  }

  if (trimmedId.startsWith("matrix-pattern-")) {
    const matrix = await getCodeMatrix();
    const idx = parseInt(trimmedId.replace(/^matrix-pattern-/, ""), 10) - 1;
    const found = matrix[idx];
    if (found) {
      return {
        id: `matrix-${idx + 1}`,
        catalogId: trimmedId,
        title: `${found.topic} (Polyglot Code Matrix)`,
        category: "Code Practice",
        domain: "Polyglot Matrix",
        href: "/modern-stack?tab=matrix",
        badge: "Comparative Matrix",
        summary: `Comparative code pattern for ${found.topic} across PySpark, Python, DuckDB, Snowflake, and BigQuery.`,
        details: {
          topic: found.topic,
          python: found.python,
          pyspark: found.pyspark,
          sparksql: found.sparksql,
          duckdb: found.duckdb,
          snowflake: found.snowflake,
          bigquery: found.bigquery,
          trino: found.trino,
        },
      };
    }
  }

  // 7. CHEAT SHEETS (cheat-*, dbx-cheat-*)
  if (trimmedId.startsWith("cheat-") || trimmedId.startsWith("dbx-cheat-") || categoryHint === "Cheat Sheets") {
    const { core, dbx } = await getCheatsheets();
    const cId = trimmedId.replace(/^cheat-/, "");
    const coreFound = core.find((c) => c.id === cId);
    if (coreFound) {
      return {
        id: coreFound.id,
        catalogId: trimmedId,
        title: coreFound.title,
        category: "Cheat Sheets",
        domain: coreFound.category,
        href: `/cheat-sheet?id=${coreFound.id}`,
        badge: coreFound.impact || "PROD",
        summary: coreFound.problem,
        details: {
          problem: coreFound.problem,
          solution: coreFound.solution,
          whyItMatters: coreFound.whyItMatters,
          impact: coreFound.impact,
          tags: coreFound.tags,
        },
      };
    }

    const dbxId = trimmedId.replace(/^dbx-cheat-/, "");
    const dbxCards = (dbx as any)?.cards || [];
    const dbxFound = dbxCards.find((c: any) => c.id === dbxId);
    if (dbxFound) {
      return {
        id: dbxFound.id,
        catalogId: trimmedId,
        title: `${dbxFound.title} (Databricks Cheat Sheet)`,
        category: "Cheat Sheets",
        domain: dbxFound.domainTitle || "Databricks",
        href: "/cheat-sheet",
        badge: dbxFound.tag || "Databricks",
        summary: dbxFound.description || dbxFound.title,
        details: {
          problem: dbxFound.title,
          solution: dbxFound.code || dbxFound.command,
          whyItMatters: dbxFound.whyItMatters || dbxFound.notes,
          impact: dbxFound.tag,
        },
      };
    }
  }

  // 8. FINOPS COST PLAYBOOKS (cost-playbook-*)
  if (trimmedId.startsWith("cost-playbook-")) {
    const playbooks = await getCostPlaybooks();
    const idx = parseInt(trimmedId.replace(/^cost-playbook-/, ""), 10) - 1;
    const found = playbooks[idx];
    if (found) {
      return {
        id: `cost-${idx + 1}`,
        catalogId: trimmedId,
        title: `${found.title} (FinOps Cost Playbook)`,
        category: "Architecture",
        domain: "FinOps",
        href: "/modern-stack?tab=cost",
        badge: found.savings ? found.savings.split("(")[0].trim() : "FinOps",
        summary: found.summary,
        details: {
          description: found.summary,
          savings: found.savings,
          code: found.code,
        },
      };
    }
  }

  // 9. COMPANY PROFILES (company-*)
  if (trimmedId.startsWith("company-") || categoryHint === "Companies") {
    const compId = trimmedId.replace(/^company-/, "");
    const companies = await getCompanies();
    const found = companies.find((c) => c.id === compId || c.name.toLowerCase().includes(compId.toLowerCase()));
    if (found) {
      return {
        id: found.id,
        catalogId: trimmedId,
        title: `${found.name} — GCC Tech Profile`,
        category: "Companies",
        domain: found.tier || "Enterprise GCC",
        href: "/company-research",
        badge: found.tier || "GCC",
        summary: found.keyChallenges,
        details: {
          tier: found.tier,
          location: found.location,
          seniorDeSalary: found.seniorDeSalary,
          architectSalary: found.architectSalary,
          stack: found.stack || [],
          interviewFocus: found.interviewFocus || [],
          keyChallenges: found.keyChallenges,
          sampleQuestions: found.sampleQuestions || [],
        },
      };
    }
  }

  // 10. LEARNING PATHS (path-*)
  if (trimmedId.startsWith("path-")) {
    const pId = trimmedId.replace(/^path-/, "");
    const paths = await getLearningPaths();
    const found = paths.find((p) => p.id === pId);
    if (found) {
      return {
        id: found.id,
        catalogId: trimmedId,
        title: `${found.title} (${found.weeks} Weeks)`,
        category: "Learning Paths",
        domain: "Learning Paths",
        href: `/learning-paths?id=${found.id}`,
        badge: `${found.weeks}w Roadmap`,
        summary: found.description,
        details: {
          description: found.description,
          keyPoints: found.skills || [],
        },
      };
    }
  }

  return null;
}

/**
 * Resolves a batch of knowledge base items by ID.
 */
export async function resolveKnowledgeItemsBatch(
  catalogIds: string[]
): Promise<Record<string, ResolvedKnowledgeItem>> {
  const results: Record<string, ResolvedKnowledgeItem> = {};
  await Promise.all(
    catalogIds.map(async (cid) => {
      try {
        const item = await resolveKnowledgeItem(cid);
        if (item) {
          results[cid] = item;
        }
      } catch (err) {
        console.warn(`[content-resolver] Failed to resolve ${cid}:`, err);
      }
    })
  );
  return results;
}
