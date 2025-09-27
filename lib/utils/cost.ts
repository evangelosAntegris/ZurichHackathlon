export interface CostSample {
  model: string
  tokens: number
  costPer1k: number
  latencyMs?: number
}

export function estimateCostUsd(samples: CostSample[]): number {
  const total = samples.reduce((acc, sample) => acc + (sample.tokens / 1000) * sample.costPer1k, 0)
  return Number(total.toFixed(4))
}

export function sumLatency(samples: CostSample[]): number {
  return samples.reduce((acc, sample) => acc + (sample.latencyMs ?? 0), 0)
}
