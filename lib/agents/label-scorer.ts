import type { PipelineConfig, ProviderUsage, RoutedOut, ScorerOut } from "@/lib/types/pipeline"
import type { Label } from "@/lib/types/pipeline"
import { evaluateTriggers } from "@/lib/utils/evidence_rules"
import { PROMPT_SCORER_TEMPLATE } from "@/lib/constants/prompts"
import { LABEL_DESCRIPTIONS } from "@/lib/constants/label_scorer_yesno"
import { callProviderWithModel } from "@/lib/llm/provider-router"
import type { ProviderMessage, ProviderName } from "@/lib/llm/types"

const ALL_LABELS: Label[] = [
  "plan_contact",
  "schedule_meeting",
  "update_contact_info_non_postal",
  "update_contact_info_postal_address",
  "update_kyc_activity",
  "update_kyc_origin_of_assets",
  "update_kyc_purpose_of_businessrelation",
  "update_kyc_total_assets",
]

export async function labelScorer(routed: RoutedOut, cfg: PipelineConfig): Promise<ScorerOut> {
  const triggerMatches = evaluateTriggers(routed.textForModel)
  const fallbackScores: Partial<Record<Label, number>> = {}

  for (const label of ALL_LABELS) {
    const match = triggerMatches.find((t) => t.label === label)
    if (match) {
      fallbackScores[label] = Number(Math.max(0, Math.min(1, match.score + 0.15)).toFixed(3))
    } else {
      fallbackScores[label] = 0.1
    }
  }

  if (!cfg.scoring.enabled) {
    return {
      scoresYesNo: fallbackScores,
      meta: {
        scoringModel: cfg.scoring.model,
        calls: 0,
        latencyMs: 0,
        provider: cfg.scoring.provider,
      },
    }
  }

  const scores: Partial<Record<Label, number>> = { ...fallbackScores }
  const usageList: ProviderUsage[] = []
  const provider: ProviderName =
    cfg.scoring.provider === "openai" || cfg.scoring.provider === "apertus"
      ? cfg.scoring.provider
      : cfg.provider === "mixed"
        ? "openai"
        : (cfg.provider as ProviderName)
  const model = cfg.scoring.model

  for (const label of ALL_LABELS) {
    const desc = LABEL_DESCRIPTIONS[label] ?? label
    const question = PROMPT_SCORER_TEMPLATE.replace("{label}", desc)
    const messages: ProviderMessage[] = [
      {
        role: "system",
        content: "Rispondi esclusivamente con YES o NO. Nessun testo aggiuntivo.",
      },
      {
        role: "user",
        content: `Transcript:\n${routed.textForModel}\n\n${question}`,
      },
    ]

    try {
      const result = await callProviderWithModel(provider, model, {
        messages,
        temperature: 0,
        maxTokens: 4,
      })
      if (result.usage) usageList.push(result.usage)
      const raw = result.content.trim().toUpperCase()
      if (raw.startsWith("YES")) {
        scores[label] = 0.9
      } else if (raw.startsWith("NO")) {
        scores[label] = 0.1
      } else {
        try {
          const parsed = JSON.parse(result.content)
          const answer = String(parsed.answer ?? parsed.result ?? "").toUpperCase()
          if (answer.startsWith("YES")) scores[label] = 0.9
          else if (answer.startsWith("NO")) scores[label] = 0.1
        } catch {
          // leave fallback score
        }
      }
    } catch (error) {
      console.warn(`[labelScorer] Fallback per ${label}:`, error)
      // keep fallback score
    }
  }

  return {
    scoresYesNo: scores,
    meta: {
      scoringModel: model,
      calls: ALL_LABELS.length,
      latencyMs: 0,
      provider: cfg.scoring.provider,
      usage: usageList,
    },
  }
}
