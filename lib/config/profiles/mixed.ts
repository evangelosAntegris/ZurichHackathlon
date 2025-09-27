import type { PipelineConfig } from "@/lib/types/pipeline"
import { PROMPT_FEW_SHOT, PROMPT_ZERO_SHOT } from "@/lib/constants/prompts"

const APERTUS_LIGHT = process.env.APERTUS_MODEL_LIGHT ?? process.env.APERTUS_MODEL ?? "apertus-8b-instruct"
const OPENAI_LIGHT_ALT = process.env.OPENAI_MODEL_LIGHT_ALT ?? "gpt-4o-mini"
const OPENAI_HEAVY = process.env.OPENAI_MODEL_HEAVY ?? "gpt-4o"
const OPENAI_SCORER = process.env.OPENAI_MODEL_SCORER ?? "gpt-4o-mini"

export const MIXED_PROFILE: PipelineConfig = {
  profileName: "mixed",
  provider: "mixed",
  models: {
    light: APERTUS_LIGHT,
    lightAlt: OPENAI_LIGHT_ALT,
    heavy: OPENAI_HEAVY,
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
    model: OPENAI_SCORER,
    topLogprobs: 2,
    parallelism: 4,
    timeoutMs: 15000,
  },
  evidenceChecker: {
    mode: "rules+slm_optional",
    extractorModel: OPENAI_SCORER,
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
