import type { PipelineConfig } from "@/lib/types/pipeline"
import { PROMPT_FEW_SHOT, PROMPT_ZERO_SHOT } from "@/lib/constants/prompts"

const DEFAULT_LIGHT = "apertus-8b-instruct"
const DEFAULT_HEAVY = "apertus-70b-instruct"

const LIGHT_MODEL = process.env.APERTUS_MODEL_LIGHT ?? process.env.APERTUS_MODEL ?? DEFAULT_LIGHT
const LIGHT_ALT_MODEL = process.env.APERTUS_MODEL_LIGHT_ALT ?? LIGHT_MODEL
const HEAVY_MODEL = process.env.APERTUS_MODEL_HEAVY ?? process.env.APERTUS_MODEL ?? DEFAULT_HEAVY
const SCORER_MODEL = process.env.APERTUS_MODEL_SCORER ?? LIGHT_MODEL

export const APERTUS_PROFILE: PipelineConfig = {
  profileName: "apertus",
  provider: "apertus",
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
    provider: "apertus",
    model: SCORER_MODEL,
    topLogprobs: 2,
    parallelism: 4,
    timeoutMs: 15000,
  },
  evidenceChecker: {
    mode: "rules+slm_optional",
    extractorModel: LIGHT_MODEL,
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
