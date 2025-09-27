import type { PipelineConfig } from "@/lib/types/pipeline"
import { PROMPT_FEW_SHOT, PROMPT_ZERO_SHOT } from "@/lib/constants/prompts"

const LIGHT_MODEL = process.env.OPENAI_MODEL_LIGHT ?? "gpt-4o-mini"
const LIGHT_ALT_MODEL = process.env.OPENAI_MODEL_LIGHT_ALT ?? LIGHT_MODEL
const HEAVY_MODEL = process.env.OPENAI_MODEL_HEAVY ?? "gpt-4o"
const SCORER_MODEL = process.env.OPENAI_MODEL_SCORER ?? LIGHT_MODEL

export const OPENAI_PROFILE: PipelineConfig = {
  profileName: "openai",
  provider: "openai",
  models: {
    light: LIGHT_MODEL,
    lightAlt: LIGHT_ALT_MODEL,
    heavy: HEAVY_MODEL,
  },
  classification: {
    promptAPath: PROMPT_ZERO_SHOT,
    promptBPath: PROMPT_FEW_SHOT,
    requireLogprobs: true,
  },
  router: {
    translateIfNonEn: true,
    translator: "supertext",
  },
  thresholds: {
    defaultConf: 0.6,
    kycConf: 0.7,
  },
  scoring: {
    enabled: true,
    provider: "openai",
    model: SCORER_MODEL,
    topLogprobs: 2,
    parallelism: 4,
    timeoutMs: 15000,
  },
  evidenceChecker: {
    mode: "rules+slm_optional",
    extractorModel: SCORER_MODEL,
    maxSlmCalls: 1,
  },
  logging: {
    outDir: "experiments",
    saveDebugPrompts: true,
  },
  evaluation: {
    split: "validation",
  },
}
