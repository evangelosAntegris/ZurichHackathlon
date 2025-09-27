import type { EvidenceCheckOut, FinalOut, PipelineConfig, Label } from "@/lib/types/pipeline"

export interface FinalizerOptions {
  heavyEscalated?: boolean
  modelsUsed?: string[]
  latencyMs?: number
  costEstimateUsd?: number
}

function thresholdFor(label: Label, cfg: PipelineConfig): number {
  return label.startsWith("update_kyc") ? cfg.thresholds.kycConf : cfg.thresholds.defaultConf
}

export async function finalizer(
  evidence: EvidenceCheckOut,
  cfg: PipelineConfig,
  options: FinalizerOptions = {},
): Promise<FinalOut> {
  const labelsFinal: Label[] = []
  const flags: string[] = []

  for (const [label, confidence] of Object.entries(evidence.perLabelConfidence)) {
    const typedLabel = label as Label
    if (confidence === undefined) continue
    const threshold = thresholdFor(typedLabel, cfg)
    if (confidence >= threshold) {
      labelsFinal.push(typedLabel)
    } else if (confidence >= threshold - 0.05) {
      flags.push(`human_review_recommended:${typedLabel}`)
    }
  }

  if (options.heavyEscalated) {
    flags.push("heavy_model_used")
  }

  const summary = {
    modelsUsed: Array.from(new Set(options.modelsUsed ?? [])),
    latencyMs: options.latencyMs ?? 0,
    costEstimateUsd: Number((options.costEstimateUsd ?? 0).toFixed(4)),
  }

  return {
    labelsFinal,
    confidence: evidence.perLabelConfidence,
    flags,
    summary,
  }
}
