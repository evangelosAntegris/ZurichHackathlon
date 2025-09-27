import OpenAI from "openai"
import type { ProviderCallParams, ProviderCallResult, ProviderMessage } from "@/lib/llm/types"

let client: OpenAI | null = null

function getClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY mancante. Impostare l'env per usare il profilo OpenAI.")
    }
    client = new OpenAI({ apiKey })
  }
  return client
}

function toOpenAIMessages(messages: ProviderMessage[]): OpenAI.ChatCompletionMessageParam[] {
  return messages.map((message) => ({
    role: message.role,
    content: message.content,
  }))
}

export async function callOpenAIChat(
  model: string,
  params: ProviderCallParams,
): Promise<ProviderCallResult> {
  const cli = getClient()
  const response = await cli.chat.completions.create({
    model,
    temperature: params.temperature ?? 0,
    max_tokens: params.maxTokens ?? 600,
    messages: toOpenAIMessages(params.messages),
    response_format: params.expectJson ? { type: "json_object" } : undefined,
    logprobs: params.topLogprobs ? { top_logprobs: params.topLogprobs } : undefined,
  })

  const content = response.choices?.[0]?.message?.content ?? ""
  const usage = response.usage
    ? {
        promptTokens: response.usage.prompt_tokens ?? 0,
        completionTokens: response.usage.completion_tokens ?? 0,
        totalTokens: response.usage.total_tokens ?? 0,
      }
    : undefined

  return {
    content,
    model: response.model ?? model,
    usage,
    raw: response,
    logprobs: response.choices?.[0]?.logprobs,
  }
}
