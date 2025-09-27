import type { Label } from "@/lib/types/pipeline"
import type { TriggerMatch } from "./evidence_rules"

export interface ConfidenceInputs {
  yesNoScore?: number
  trigger?: TriggerMatch
  quoteQuality?: number
  agreementWeight?: number
}

export function computeConfidence(label: Label, inputs: ConfidenceInputs): number {
  const yesNo = inputs.yesNoScore ?? 0
  const triggerScore = inputs.trigger?.score ?? 0
  const quote = inputs.quoteQuality ?? (inputs.trigger?.quote ? 0.5 : 0)
  const agreement = inputs.agreementWeight ?? 0

  const conf = 0.55 * yesNo + 0.25 * triggerScore + 0.15 * quote + 0.05 * agreement
  return Number(Math.max(0, Math.min(1, conf)).toFixed(3))
}

export function agreementWeight(labelsFromModels: Array<Set<Label>>, current: Label): number {
  if (!labelsFromModels.length) return 0
  const hits = labelsFromModels.reduce((acc, set) => acc + (set.has(current) ? 1 : 0), 0)
  return hits / labelsFromModels.length
}
