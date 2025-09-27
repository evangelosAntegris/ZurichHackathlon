import type { ProviderCallParams, ProviderCallResult, ProviderMessage } from "@/lib/llm/types"

interface ApertusResponse {
  choices?: Array<{
    message?: { content?: string }
  }>
  usage?: {
    prompt_tokens?: number
    completion_tokens?: number
    total_tokens?: number
  }
  model?: string
  [key: string]: unknown
}

function serializeMessages(messages: ProviderMessage[]) {
  return messages.map((message) => ({
    role: message.role,
    content: message.content,
  }))
}

export async function callApertusChat(
  model: string,
  params: ProviderCallParams,
): Promise<ProviderCallResult> {
  const baseUrl = process.env.APERTUS_API_URL
  const apiKey = process.env.APERTUS_API_KEY

  if (!baseUrl || !apiKey) {
    throw new Error("APERTUS_API_URL o APERTUS_API_KEY mancanti. Configurare l'ambiente per usare il profilo Apertus.")
  }

  const resp = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: params.temperature ?? 0,
      max_tokens: params.maxTokens ?? 600,
      messages: serializeMessages(params.messages),
      response_format: params.expectJson ? { type: "json_object" } : undefined,
      top_logprobs: params.topLogprobs,
    }),
  })

  if (!resp.ok) {
    const text = await resp.text()
    try {
      const parsed = JSON.parse(text)
      const code = parsed?.error?.code
      if (code === "invalid_plan_model_error") {
        throw new Error(
          `Apertus model '${model}' non disponibile per il tuo account. ` +
          `Imposta APERTUS_MODEL_LIGHT / APERTUS_MODEL_HEAVY nel file .env.local con modelli autorizzati. ` +
          `Risposta API: ${text}`,
        )
      }
    } catch {
      // ignore JSON parse error, fall back to generic message below
    }
    throw new Error(`Apertus API request failed (${resp.status}): ${text}`)
  }

  const data = (await resp.json()) as ApertusResponse
  const content = data.choices?.[0]?.message?.content ?? ""
  const usage = data.usage
    ? {
        promptTokens: data.usage.prompt_tokens ?? 0,
        completionTokens: data.usage.completion_tokens ?? 0,
        totalTokens: data.usage.total_tokens ?? 0,
      }
    : undefined

  return {
    content,
    model: data.model ?? model,
    usage,
    raw: data,
  }
}
