import fs from "fs/promises"
import path from "path"

export interface MetricSummary {
  profile: string
  accuracy?: number
  costUsd?: number
  latencyMs?: number
  heavyEscalationRate?: number
  perLabelCounts?: Record<string, { tp: number; fp: number; fn: number }>
}

export async function writeComparisonCharts(
  summaries: MetricSummary[],
  outDir: string,
): Promise<void> {
  await fs.mkdir(outDir, { recursive: true })
  const chartData = summaries.map((summary) => ({
    profile: summary.profile,
    accuracy: summary.accuracy ?? null,
    costUsd: summary.costUsd ?? null,
    latencyMs: summary.latencyMs ?? null,
    heavyEscalationRate: summary.heavyEscalationRate ?? null,
  }))

  const filePath = path.join(outDir, "comparison.json")
  await fs.writeFile(filePath, JSON.stringify({ chartData, summaries }, null, 2), "utf8")
}
