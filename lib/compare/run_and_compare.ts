#!/usr/bin/env -S node --loader tsx

import fs from "fs/promises"
import path from "path"
import process from "process"
import dotenv from "dotenv"
import { orchestratorRun } from "@/lib/agents/orchestrator"
import { OPENAI_PROFILE } from "@/lib/config/profiles/openai"
import { APERTUS_PROFILE } from "@/lib/config/profiles/apertus"
import type { PipelineConfig } from "@/lib/types/pipeline"
import { writeComparisonCharts, type MetricSummary } from "@/lib/compare/charts"

dotenv.config({ path: path.join(process.cwd(), ".env.local") })

interface DatasetSample {
  id: string
  text: string
  groundTruth: string[] | null
}

interface RunSummarySample {
  sampleId: string
  labels: string[]
  flags: string[]
  groundTruth: string[] | null
}

interface RunSummary {
  profile: string
  samples: RunSummarySample[]
  accuracy?: number
}

const ALLOWED_LABELS = [
  "plan_contact",
  "schedule_meeting",
  "update_contact_info_non_postal",
  "update_contact_info_postal_address",
  "update_kyc_activity",
  "update_kyc_origin_of_assets",
  "update_kyc_purpose_of_businessrelation",
  "update_kyc_total_assets",
] as const

type AllowedLabel = typeof ALLOWED_LABELS[number]

async function readTranscript(filePath: string): Promise<string> {
  const absPath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath)
  return fs.readFile(absPath, "utf8")
}

async function readGroundTruth(txtPath: string): Promise<string[] | null> {
  const jsonPath = txtPath.replace(/\.txt$/i, ".json")
  try {
    const json = await fs.readFile(jsonPath, "utf8")
    return extractTrueLabels(json)
  } catch {
    return null
  }
}

async function loadDataset(inputPath?: string): Promise<DatasetSample[]> {
  if (!inputPath) {
    const defaultPath = path.join(process.cwd(), "public/test.txt")
    const fallbackTxt = await readTranscript(defaultPath).catch(() => "")
    if (!fallbackTxt) {
      throw new Error("Impossibile trovare un transcript da elaborare. Specifica --input o aggiungi public/test.txt")
    }
    const gt = await readGroundTruth(defaultPath)
    return [{ id: "sample-test", text: fallbackTxt, groundTruth: gt }]
  }

  const stats = await fs.stat(inputPath)
  if (stats.isDirectory()) {
    const entries = await fs.readdir(inputPath)
    const txtFiles = entries.filter((name) => name.endsWith(".txt"))
    const out: DatasetSample[] = []
    for (const file of txtFiles) {
      const fullPath = path.join(inputPath, file)
      const text = await readTranscript(fullPath)
      const groundTruth = await readGroundTruth(fullPath)
      out.push({ id: path.parse(file).name, text, groundTruth })
    }
    return out
  }

  return [{
    id: path.parse(inputPath).name,
    text: await readTranscript(inputPath),
    groundTruth: await readGroundTruth(inputPath),
  }]
}

async function runProfile(profile: PipelineConfig, dataset: DatasetSample[]): Promise<RunSummary> {
  const samples: RunSummarySample[] = []
  const yTrue: AllowedLabel[][] = []
  const yPred: AllowedLabel[][] = []

  for (const item of dataset) {
    const result = await orchestratorRun(item.text, { config: profile })
    const predicted = result.final.labelsFinal as AllowedLabel[]
    samples.push({
      sampleId: item.id,
      labels: predicted,
      flags: result.final.flags,
      groundTruth: item.groundTruth,
    })
    if (item.groundTruth && item.groundTruth.length) {
      yTrue.push(item.groundTruth as AllowedLabel[])
      yPred.push(predicted)
    }
  }

  const accuracy = yTrue.length ? Number(evaluatePredictionsOfficial(yTrue, yPred).toFixed(3)) : undefined

  return { profile: profile.profileName, samples, accuracy }
}

function buildMetricSummary(run: RunSummary): MetricSummary {
  const labelsPerSample = run.samples.map((s) => s.labels.length)
  const avgLabels = labelsPerSample.reduce((acc, val) => acc + val, 0) / Math.max(labelsPerSample.length, 1)
  const heavyRate = run.samples.filter((s) => s.flags.some((flag) => flag === "heavy_model_used")).length / Math.max(run.samples.length, 1)

  // compute average TP/FP/FN per sample (use groundTruth when available)
  let totalTp = 0
  let totalFp = 0
  let totalFn = 0
  for (const s of run.samples) {
    const pred = new Set(s.labels || [])
    const truth = new Set((s.groundTruth as string[] | null) || [])
    let tp = 0
    for (const p of pred) if (truth.has(p)) tp++
    const fp = Math.max(0, pred.size - tp)
    const fn = Math.max(0, truth.size - tp)
    totalTp += tp
    totalFp += fp
    totalFn += fn
  }

  const nSamples = Math.max(run.samples.length, 1)
  const avgTp = totalTp / nSamples
  const avgFp = totalFp / nSamples
  const avgFn = totalFn / nSamples

  return {
    profile: run.profile,
    accuracy: run.accuracy,
    costUsd: 0,
    latencyMs: 0,
    heavyEscalationRate: Number(heavyRate.toFixed(3)),
    perLabelCounts: {
      avg_labels: { tp: Number(avgTp.toFixed(3)), fp: Number(avgFp.toFixed(3)), fn: Number(avgFn.toFixed(3)) },
    },
  }
}

function extractTrueLabels(jsonText: string): AllowedLabel[] {
  try {
    const data = JSON.parse(jsonText)
    if (Array.isArray(data)) {
      if (data.length && typeof data[0] === "object") {
        return data
          .map((o: any) => o?.task_type)
          .filter((l: any) => typeof l === "string" && (ALLOWED_LABELS as readonly string[]).includes(l))
      }
      if (data.length && typeof data[0] === "string") {
        return data.filter((l: any) => (ALLOWED_LABELS as readonly string[]).includes(l))
      }
    }
    if (Array.isArray((data as any)?.labels)) {
      return (data as any).labels.filter((l: string) => (ALLOWED_LABELS as readonly string[]).includes(l))
    }
  } catch {
    return []
  }
  return []
}

function evaluatePredictionsOfficial(y_true: AllowedLabel[][], y_pred: AllowedLabel[][]): number {
  const LABEL_TO_IDX = new Map((ALLOWED_LABELS as readonly string[]).map((l, i) => [l, i]))
  const FN_PENALTY = 2.0
  const FP_PENALTY = 1.0
  const n_samples = y_true.length
  const n_labels = ALLOWED_LABELS.length

  const yTrueBin = Array.from({ length: n_samples }, () => Array(n_labels).fill(0))
  const yPredBin = Array.from({ length: n_samples }, () => Array(n_labels).fill(0))

  for (let i = 0; i < n_samples; i++) {
    for (const lab of dedupeLabels(y_true[i], `y_true[${i}]`)) {
      const idx = LABEL_TO_IDX.get(lab)!
      yTrueBin[i][idx] = 1
    }
  }

  for (let i = 0; i < n_samples; i++) {
    for (const lab of dedupeLabels(y_pred[i], `y_pred[${i}]`)) {
      const idx = LABEL_TO_IDX.get(lab)!
      yPredBin[i][idx] = 1
    }
  }

  const perSampleScores: number[] = []
  for (let i = 0; i < n_samples; i++) {
    let fn = 0
    let fp = 0
    let trueCount = 0
    for (let j = 0; j < n_labels; j++) {
      const t = yTrueBin[i][j] === 1
      const p = yPredBin[i][j] === 1
      if (t) trueCount++
      if (t && !p) fn++
      if (!t && p) fp++
    }
    const maxErr = FN_PENALTY * trueCount + FP_PENALTY * (n_labels - trueCount)
    const weighted = FN_PENALTY * fn + FP_PENALTY * fp
    const score = maxErr > 0 ? 1 - weighted / maxErr : 1
    perSampleScores.push(score)
  }

  const avg = perSampleScores.reduce((acc, val) => acc + val, 0) / perSampleScores.length
  return Math.max(0, Math.min(1, avg))
}

function dedupeLabels(labels: AllowedLabel[], name: string): AllowedLabel[] {
  const seen = new Set<AllowedLabel>()
  const unique: AllowedLabel[] = []
  for (const label of labels) {
    if (!ALLOWED_LABELS.includes(label)) {
      throw new Error(`${name} contains invalid label: '${label}'. Allowed labels: ${ALLOWED_LABELS.join(", ")}`)
    }
    if (seen.has(label)) continue
    seen.add(label)
    unique.push(label)
  }
  return unique
}

async function main() {
  const args = process.argv.slice(2)
  const inputFlagIndex = args.findIndex((arg) => arg === "--input")
  let inputPath = inputFlagIndex >= 0 ? args[inputFlagIndex + 1] : undefined

  // If user passed --data, use the data/test folder
  const useDataFlag = args.includes("--data")
  if (useDataFlag) {
    inputPath = path.join(process.cwd(), "data", "test")
  }

  // If no input provided, prefer data/test when available
  if (!inputPath) {
    try {
      const candidate = path.join(process.cwd(), "data", "test")
      const stats = await fs.stat(candidate)
      if (stats.isDirectory()) {
        const entries = await fs.readdir(candidate)
        if (entries.some((name) => name.endsWith('.txt'))) {
          inputPath = candidate
        }
      }
    } catch {
      // ignore, fallback to loadDataset default
    }
  }

  const dataset = await loadDataset(inputPath)

  const runs = await Promise.all([
    runProfile(OPENAI_PROFILE, dataset),
    runProfile(APERTUS_PROFILE, dataset),
  ])

  const summaries = runs.map(buildMetricSummary)

  const metricsDir = path.join("experiments", "metrics")
  await fs.mkdir(metricsDir, { recursive: true })

  for (const run of runs) {
    const filePath = path.join(metricsDir, `${run.profile}_summary.json`)
    await fs.writeFile(filePath, JSON.stringify(run, null, 2), "utf8")
  }

  await writeComparisonCharts(summaries, metricsDir)

  console.log("Run completata. Risultati salvati in", metricsDir)
}

main().catch((error) => {
  console.error("[compare] run failed", error)
  process.exit(1)
})
