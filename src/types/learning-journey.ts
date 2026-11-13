/**
 * 8-Stage Learning Journey Type Definitions
 * Pattern: Map → Predict → Inspect → Experiment → Break → Diagnose → Explain → Operate
 */

export type JourneyStageId =
  | "map"
  | "predict"
  | "inspect"
  | "experiment"
  | "break"
  | "diagnose"
  | "explain"
  | "operate";

export interface PredictionOption {
  id: string;
  label: string;
  isCorrect: boolean;
  explanation: string;
  impactAnalysis: string;
}

export interface ObservableMetric {
  metric: string;
  normalBaseline: string;
  brokenObserved: string;
  unit: string;
  significance: string;
}

export interface ProductionConfig {
  parameter: string;
  recommendedValue: string;
  impact: string;
  vendorOrEngine: string;
}

export interface LearningJourneyStageData {
  stage: JourneyStageId;
  name: string;
  tagline: string;
  summary: string;
  keyPoints: string[];
  
  // Predict Stage
  predictionQuestion?: string;
  predictionScenario?: string;
  predictionOptions?: PredictionOption[];

  // Inspect Stage
  codeOrPlanSnippet?: string;
  snippetLanguage?: string;
  snippetTitle?: string;
  inspectMechanisms?: string[];

  // Experiment Stage
  simulatorUrl?: string;
  simulatorLabel?: string;
  notebookUrl?: string;
  notebookLabel?: string;
  experimentSteps?: string[];

  // Break Stage
  failureScenario?: string;
  triggerCondition?: string;
  symptoms?: string[];
  exceptionSnippet?: string;

  // Diagnose Stage
  observableMetrics?: ObservableMetric[];
  diagnosticChecklist?: string[];

  // Explain Stage
  tradeOffComparison?: { option: string; pros: string; cons: string; recommendation: string }[];
  formulaTitle?: string;
  formulaTex?: string;
  formulaExplanation?: string;

  // Operate Stage
  productionConfigs?: ProductionConfig[];
  monitoringAlertRules?: string[];
  rollbackProcedure?: string;
}

export interface LearningJourney {
  diagramId: string;
  title: string;
  targetOutcome: string;
  prerequisites: string[];
  estimatedMinutes: number;
  stages: Record<JourneyStageId, LearningJourneyStageData>;
}
