export type Label =
  | "plan_contact"
  | "schedule_meeting"
  | "update_contact_info_non_postal"
  | "update_contact_info_postal_address"
  | "update_kyc_activity"
  | "update_kyc_origin_of_assets"
  | "update_kyc_purpose_of_businessrelation"
  | "update_kyc_total_assets"

export interface SampleIn {
  sampleId: string
  path: string
  rawText: string
}

export interface CleanOut {
  sampleId: string
  cleanText: string
  stats: { charCount: number }
}

export type SupportedLanguage = "en" | "de" | "it" | "fr" | "mixed"

export interface RoutedOut {
  sampleId: string
  textForModel: string
  sourceLang: SupportedLanguage
  translated: boolean
  translatorProvider: "supertext" | "none"
  routingHint: "original_en" | "translated_en"
}

export interface EvidenceItem {
  label: Label
  quote?: string
  span?: { start: number; end: number }
  hint?: string
}

export interface ProviderUsage {
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

export interface ClassifierOut {
  labels: Label[]
  evidence: EvidenceItem[]
  logitInfo?: { available: boolean }
  meta: {
    modelId: string
    prompt: "zero_shot" | "few_shot" | "heavy"
    usage?: ProviderUsage
    raw?: string
    agreedBy?: string[]
  }
}

export interface GateOut {
  decision: "use_agreement" | "escalate_heavy"
  candidate?: ClassifierOut
  rationale?: string
}

export interface ScorerOut {
  scoresYesNo: Partial<Record<Label, number>>
  meta: {
    scoringModel: string
    calls: number
    latencyMs: number
    provider: string
    usage?: ProviderUsage[]
  }
}

export interface EvidenceCheckOut {
  verifiedLabels: Label[]
  perLabelConfidence: Partial<Record<Label, number>>
  evidenceQuotes: Partial<Record<Label, EvidenceItem[]>>
  issues: string[]
  explainabilityForAdvisor: Partial<Record<Label, string>>
}

export interface FinalOut {
  labelsFinal: Label[]
  confidence: Partial<Record<Label, number>>
  flags: string[]
  summary: { modelsUsed: string[]; latencyMs: number; costEstimateUsd: number }
}

export interface ThresholdConfig {
  defaultConf: number
  kycConf: number
}

export interface ScoringConfig {
  enabled: boolean
  provider: string
  model: string
  topLogprobs?: number
  parallelism?: number
  timeoutMs?: number
}

export interface EvidenceCheckerConfig {
  mode: "rules" | "rules+slm_optional"
  extractorModel?: string
  maxSlmCalls?: number
}

export interface RouterConfig {
  translateIfNonEn: boolean
  translator: "supertext" | "none"
}

export interface ClassificationConfig {
  promptAPath: string
  promptBPath: string
  requireLogprobs?: boolean
}

export interface ModelConfig {
  light: string
  lightAlt?: string
  heavy: string
}

export interface LoggingConfig {
  outDir: string
  saveDebugPrompts?: boolean
}

export interface EvaluationConfig {
  split: string
}

export interface PipelineConfig {
  profileName: string
  provider: "openai" | "apertus" | "mixed"
  models: ModelConfig
  classification: ClassificationConfig
  router: RouterConfig
  thresholds: ThresholdConfig
  scoring: ScoringConfig
  evidenceChecker: EvidenceCheckerConfig
  logging: LoggingConfig
  evaluation: EvaluationConfig
}

export interface PipelineRuntimeStats {
  latencyMs: number
  costUsd: number
  modelsUsed: string[]
}

export interface PipelineContext {
  sample: SampleIn
  config: PipelineConfig
  stats: PipelineRuntimeStats
  debug?: Record<string, unknown>
}
