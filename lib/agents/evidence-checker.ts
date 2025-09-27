import type {
  EvidenceCheckOut,
  EvidenceItem,
  PipelineConfig,
  RoutedOut,
  Label,
} from "@/lib/types/pipeline"
import { evaluateTriggers } from "@/lib/utils/evidence_rules"
import { agreementWeight, computeConfidence } from "@/lib/utils/scoring"

interface EvidenceCheckerInput {
  labels: Label[]
  evidence: EvidenceItem[]
  meta?: Record<string, unknown>
  scoresYesNo: Partial<Record<Label, number>>
}

const MIN_CONFIDENCE = 0.35

export async function evidenceChecker(
  candidate: EvidenceCheckerInput,
  routed: RoutedOut,
  cfg: PipelineConfig,
): Promise<EvidenceCheckOut> {
  const triggerMatches = evaluateTriggers(routed.textForModel)
  const triggerMap = new Map<Label, typeof triggerMatches[number]>()
  for (const match of triggerMatches) {
    if (!triggerMap.has(match.label) || (triggerMap.get(match.label)?.score ?? 0) < match.score) {
      triggerMap.set(match.label, match)
    }
  }

  const evidenceByLabel = new Map<Label, EvidenceItem[]>()
  for (const ev of candidate.evidence) {
    const arr = evidenceByLabel.get(ev.label) ?? []
    arr.push(ev)
    evidenceByLabel.set(ev.label, arr)
  }

  const perLabelConfidence: Partial<Record<Label, number>> = {}
  const explainability: Partial<Record<Label, string>> = {}
  const verifiedLabels: Label[] = []
  const issues: string[] = []

  const modelSets: Array<Set<Label>> = []
  if (candidate.meta?.agreedBy) {
    modelSets.push(new Set(candidate.labels))
  }

  for (const label of new Set([...candidate.labels])) {
    const yesNoScore = candidate.scoresYesNo[label]
    const trigger = triggerMap.get(label)
    const quoteQuality = (evidenceByLabel.get(label)?.[0]?.quote?.length ?? 0) > 0 ? 0.6 : 0
    const agreement = agreementWeight(modelSets, label)
    const confidence = computeConfidence(label, {
      yesNoScore,
      trigger,
      quoteQuality,
      agreementWeight: agreement,
    })
    perLabelConfidence[label] = confidence

    if (confidence >= MIN_CONFIDENCE) {
      verifiedLabels.push(label)
      const quote = evidenceByLabel.get(label)?.[0]?.quote ?? trigger?.quote ?? ""
      explainability[label] = quote ? `"${quote.slice(0, 120)}"` : "Evidence available"
    } else {
      issues.push(`Low confidence for ${label} (${confidence})`)
    }
  }

  // If scoring disabled, still check triggers to recover labels
  if (!cfg.scoring.enabled) {
    for (const [label, trigger] of triggerMap.entries()) {
      if (perLabelConfidence[label]) continue
      const confidence = computeConfidence(label, {
        yesNoScore: trigger.score,
        trigger,
        quoteQuality: trigger.quote ? 0.5 : 0,
        agreementWeight: 0,
      })
      perLabelConfidence[label] = confidence
      if (confidence >= MIN_CONFIDENCE) {
        verifiedLabels.push(label)
        explainability[label] = trigger.quote ? `"${trigger.quote.slice(0, 120)}"` : "Trigger evidence"
      }
    }
  }

  return {
    verifiedLabels: Array.from(new Set(verifiedLabels)),
    perLabelConfidence,
    evidenceQuotes: Object.fromEntries(
      [...evidenceByLabel.entries()].map(([label, items]) => [label, items]),
    ),
    issues,
    explainabilityForAdvisor: explainability,
  }
}
