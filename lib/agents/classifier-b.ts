import fs from "fs/promises"
import path from "path"
import type { ClassifierOut, EvidenceItem, Label, PipelineConfig, ProviderUsage, RoutedOut } from "@/lib/types/pipeline"
import { evaluateTriggers, buildEvidenceFromTriggers } from "@/lib/utils/evidence_rules"
import { LABEL_SET } from "@/lib/constants/labels"
import { callProvider } from "@/lib/llm/provider-router"
import type { ProviderMessage } from "@/lib/llm/types"

const FALLBACK_THRESHOLD = 0.45

async function loadPrompt(filePath: string): Promise<string> {
  const abs = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath)
  return fs.readFile(abs, "utf8")
}

function normalizeLabels(rawLabels: unknown): Label[] {
  if (!Array.isArray(rawLabels)) return []
  return rawLabels
    .map((label) => (typeof label === "string" && LABEL_SET.has(label) ? (label as Label) : null))
    .filter((label): label is Label => Boolean(label))
}

function normalizeEvidence(rawEvidence: unknown): EvidenceItem[] {
  if (!Array.isArray(rawEvidence)) return []
  return rawEvidence
    .map((item: any) => {
      if (!item || typeof item !== "object") return null
      if (typeof item.label !== "string" || !LABEL_SET.has(item.label)) return null
      const ev: EvidenceItem = { label: item.label as Label }
      if (typeof item.quote === "string") ev.quote = item.quote
      if (item.span && typeof item.span.start === "number" && typeof item.span.end === "number") {
        ev.span = { start: item.span.start, end: item.span.end }
      }
      if (typeof item.hint === "string") ev.hint = item.hint
      return ev
    })
    .filter((item): item is EvidenceItem => Boolean(item))
}

function fallbackFromTriggers(text: string): { labels: Label[]; evidence: EvidenceItem[] } {
  const triggerMatches = evaluateTriggers(text)
  const evidenceMap = buildEvidenceFromTriggers(triggerMatches)
  const selected = triggerMatches
    .filter((match) => match.score >= FALLBACK_THRESHOLD)
    .map((match) => match.label)
  return {
    labels: Array.from(new Set(selected)),
    evidence: selected.flatMap((label) => evidenceMap[label] ?? []),
  }
}

export async function classifierB(routed: RoutedOut, cfg: PipelineConfig): Promise<ClassifierOut> {
  const prompt = await loadPrompt(cfg.classification.promptBPath)
  const messages: ProviderMessage[] = [
    { role: "system", content: prompt },
    { role: "user", content: routed.textForModel },
  ]

  let labels: Label[] = []
  let evidence: EvidenceItem[] = []
  let raw = ""
  let usage: ProviderUsage | undefined
  let modelId = cfg.models.lightAlt ?? cfg.models.light

  try {
    const providerResult = await callProvider(cfg, "light_alt", {
      messages,
      expectJson: true,
      temperature: 0,
      maxTokens: 600,
    })
    raw = providerResult.content
    modelId = providerResult.model
    usage = providerResult.usage

    const parsed = JSON.parse(providerResult.content)
    labels = normalizeLabels(parsed?.labels)
    evidence = normalizeEvidence(parsed?.evidence)
  } catch (error) {
    console.warn("[classifierB] Falling back to triggers:", error)
  }

  if (!labels.length) {
    const fallback = fallbackFromTriggers(routed.textForModel)
    labels = fallback.labels
    evidence = fallback.evidence
  }

  return {
    labels,
    evidence,
    logitInfo: { available: false },
    meta: {
      modelId,
      prompt: "few_shot",
      usage,
      raw,
    },
  }
}
