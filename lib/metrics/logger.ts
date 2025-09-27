import fs from "fs/promises"
import path from "path"
import type { PipelineConfig } from "@/lib/types/pipeline"
import type { PipelineDebugArtifacts } from "@/lib/agents/orchestrator"

export interface LogAndEvaluateOptions {
  outDir?: string
  split?: string
}

export async function logAndEvaluate(
  sampleId: string,
  cfg: PipelineConfig,
  artifacts: PipelineDebugArtifacts,
  options: LogAndEvaluateOptions = {},
): Promise<void> {
  const baseDir = options.outDir ?? cfg.logging.outDir ?? "experiments"
  const split = options.split ?? cfg.evaluation.split ?? "dev"
  const folder = path.join(baseDir, cfg.profileName, split)

  try {
    await fs.mkdir(folder, { recursive: true })
  } catch (error) {
    console.warn("[logger] Unable to create directory", folder, error)
    return
  }

  const filePath = path.join(folder, `${sampleId}.json`)
  const payload = {
    sampleId,
    config: {
      profile: cfg.profileName,
      provider: cfg.provider,
    },
    transcriptSource: artifacts.transcriptSource,
    final: artifacts.final,
    gate: artifacts.gate,
    scores: artifacts.scorer,
    evidence: artifacts.evidence,
  }

  try {
    await fs.writeFile(filePath, JSON.stringify(payload, null, 2), "utf8")
  } catch (error) {
    console.warn("[logger] Failed to persist debug file", filePath, error)
  }
}
