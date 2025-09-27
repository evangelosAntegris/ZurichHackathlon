import { textCleaner } from "@/lib/agents/text-cleaner"
import { languageRouter } from "@/lib/agents/language-router"
import { classifierA } from "@/lib/agents/classifier-a"
import { classifierB } from "@/lib/agents/classifier-b"
import { disagreementGate } from "@/lib/agents/disagreement-gate"
import { classifierHeavy } from "@/lib/agents/classifier-heavy"
import { labelScorer } from "@/lib/agents/label-scorer"
import { evidenceChecker } from "@/lib/agents/evidence-checker"
import { finalizer } from "@/lib/agents/finalizer"
import type {
  FinalOut,
  PipelineConfig,
  SampleIn,
  ClassifierOut,
} from "@/lib/types/pipeline"
import { OPENAI_PROFILE } from "@/lib/config/profiles/openai"
import { logAndEvaluate } from "@/lib/metrics/logger"

export interface RunPipelineOptions {
  config?: PipelineConfig
  conversationId?: string
  transcriptSource?: string
}

export interface PipelineDebugArtifacts {
  cleaned: Awaited<ReturnType<typeof textCleaner>>
  routed: Awaited<ReturnType<typeof languageRouter>>
  classifierA: ClassifierOut
  classifierB: ClassifierOut
  gate: ReturnType<typeof disagreementGate>
  candidate: ClassifierOut
  scorer: Awaited<ReturnType<typeof labelScorer>>
  evidence: Awaited<ReturnType<typeof evidenceChecker>>
  final: FinalOut
  transcriptSource?: string
}

export interface PipelineResult {
  final: FinalOut
  debug: PipelineDebugArtifacts
}

function buildSample(raw: string): SampleIn {
  return {
    sampleId: `sample-${Date.now()}`,
    path: "inline",
    rawText: raw,
  }
}

export async function orchestratorRun(
  raw: string,
  options: RunPipelineOptions = {},
): Promise<PipelineResult> {
  const cfg = options.config ?? OPENAI_PROFILE
  const sample = buildSample(raw)

  const cleaned = await textCleaner(sample)
  const routed = await languageRouter(cleaned, cfg)

  const [classA, classB] = await Promise.all([
    classifierA(routed, cfg),
    classifierB(routed, cfg),
  ])

  const gate = disagreementGate(classA, classB)
  const heavyNeeded = gate.decision === "escalate_heavy"

  const candidate: ClassifierOut = heavyNeeded
    ? await classifierHeavy(routed, cfg)
    : gate.candidate ?? classA

  if (heavyNeeded) {
    candidate.meta.agreedBy = [classA.meta.modelId, classB.meta.modelId, candidate.meta.modelId]
  }

  const scorer = await labelScorer(routed, cfg)

  const evidence = await evidenceChecker(
    {
      labels: candidate.labels,
      evidence: candidate.evidence,
      meta: candidate.meta,
      scoresYesNo: scorer.scoresYesNo,
    },
    routed,
    cfg,
  )

  const modelsUsed = new Set<string>([classA.meta.modelId, classB.meta.modelId])
  if (candidate.meta?.modelId) {
    modelsUsed.add(candidate.meta.modelId)
  }

  const final = await finalizer(evidence, cfg, {
    heavyEscalated: heavyNeeded,
    modelsUsed: Array.from(modelsUsed),
    latencyMs: 0,
    costEstimateUsd: 0,
  })

  const debug: PipelineDebugArtifacts = {
    cleaned,
    routed,
    classifierA: classA,
    classifierB: classB,
    gate,
    candidate,
    scorer,
    evidence,
    final,
    transcriptSource: options.transcriptSource,
  }

  await logAndEvaluate(sample.sampleId, cfg, debug)

  return { final, debug }
}

export default orchestratorRun
