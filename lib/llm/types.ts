import type { ProviderUsage } from "@/lib/types/pipeline"

export type ProviderName = "openai" | "apertus"

export type ProviderMessageRole = "system" | "user" | "assistant"

export interface ProviderMessage {
  role: ProviderMessageRole
  content: string
}

export interface ProviderCallParams {
  messages: ProviderMessage[]
  temperature?: number
  maxTokens?: number
  expectJson?: boolean
  topLogprobs?: number
}

export interface ProviderCallResult {
  content: string
  model: string
  usage?: ProviderUsage
  raw?: unknown
  logprobs?: unknown
}
