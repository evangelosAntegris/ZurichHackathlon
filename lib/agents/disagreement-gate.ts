import type { ClassifierOut, GateOut, ProviderUsage } from "@/lib/types/pipeline"

function mergeUsage(usages: (ProviderUsage | undefined)[]): ProviderUsage | undefined {
  const valid = usages.filter(Boolean) as ProviderUsage[]
  if (!valid.length) return undefined
  return valid.reduce(
    (acc, usage) => ({
      promptTokens: acc.promptTokens + usage.promptTokens,
      completionTokens: acc.completionTokens + usage.completionTokens,
      totalTokens: acc.totalTokens + usage.totalTokens,
    }),
    { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
  )
}

export function disagreementGate(a: ClassifierOut, b: ClassifierOut): GateOut {
  const setA = new Set(a.labels)
  const setB = new Set(b.labels)

  const labelsUnion = new Set([...setA, ...setB])
  const labelsIntersection = new Set([...setA].filter((label) => setB.has(label)))

  if (labelsUnion.size === labelsIntersection.size) {
    const evidenceMap = new Map<string, typeof a.evidence[number]>()
    for (const ev of [...a.evidence, ...b.evidence]) {
      const key = `${ev.label}-${ev.quote ?? ""}-${ev.span?.start ?? ""}-${ev.span?.end ?? ""}`
      if (!evidenceMap.has(key)) {
        evidenceMap.set(key, ev)
      }
    }

    const combined: ClassifierOut = {
      labels: Array.from(labelsIntersection),
      evidence: Array.from(evidenceMap.values()),
      logitInfo: {
        available: Boolean(a.logitInfo?.available || b.logitInfo?.available),
      },
      meta: {
        modelId: `${a.meta.modelId}+${b.meta.modelId}`,
        prompt: a.meta.prompt,
        usage: mergeUsage([a.meta.usage, b.meta.usage]),
        agreedBy: [a.meta.modelId, b.meta.modelId],
      },
    }

    return {
      decision: "use_agreement",
      candidate: combined,
      rationale: "Classifier A and B agree on predicted labels",
    }
  }

  return {
    decision: "escalate_heavy",
    rationale: "Classifier A and B disagree on predicted labels",
  }
}
