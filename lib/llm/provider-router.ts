import type { PipelineConfig, ProviderUsage } from "@/lib/types/pipeline"
import { callOpenAIChat } from "@/lib/llm/openai"
import { callApertusChat } from "@/lib/llm/apertus"
import type {
  ProviderCallParams,
  ProviderCallResult,
  ProviderMessage,
  ProviderName,
} from "@/lib/llm/types"

export type ModelSlot = "light" | "light_alt" | "heavy"

interface ResolvedProvider {
  provider: ProviderName
  model: string
}

function resolveProvider(cfg: PipelineConfig, slot: ModelSlot): ResolvedProvider {
  if (cfg.provider === "mixed") {
    if (slot === "heavy") {
      return { provider: "openai", model: cfg.models.heavy }
    }
    if (slot === "light_alt" && cfg.models.lightAlt) {
      const chosen = cfg.models.lightAlt
      const provider: ProviderName = chosen.includes("gpt") ? "openai" : "apertus"
      return { provider, model: chosen }
    }
    return { provider: "apertus", model: cfg.models.light }
  }

  if (slot === "light_alt") {
    return {
      provider: cfg.provider,
      model: cfg.models.lightAlt ?? cfg.models.light,
    }
  }

  if (slot === "light") {
    return { provider: cfg.provider, model: cfg.models.light }
  }

  return { provider: cfg.provider, model: cfg.models.heavy }
}

export async function callProviderWithModel(
  provider: ProviderName,
  model: string,
  params: ProviderCallParams,
): Promise<ProviderCallResult> {
  if (provider === "apertus") {
    return callApertusChat(model, params)
  }
  return callOpenAIChat(model, params)
}

export async function callProvider(
  cfg: PipelineConfig,
  slot: ModelSlot,
  params: ProviderCallParams,
): Promise<ProviderCallResult> {
  const { provider, model } = resolveProvider(cfg, slot)
  return callProviderWithModel(provider, model, params)
}

export function sumUsage(usages: (ProviderUsage | undefined)[]): ProviderUsage | undefined {
  const filtered = usages.filter(Boolean) as ProviderUsage[]
  if (!filtered.length) return undefined
  return filtered.reduce(
    (acc, usage) => ({
      promptTokens: acc.promptTokens + usage.promptTokens,
      completionTokens: acc.completionTokens + usage.completionTokens,
      totalTokens: acc.totalTokens + usage.totalTokens,
    }),
    { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
  )
}

export type { ProviderMessage, ProviderCallParams, ProviderCallResult, ProviderName }
