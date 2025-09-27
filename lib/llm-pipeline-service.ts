import { DataService } from "@/lib/data-service"
import type { PipelineResult } from "@/lib/agents/orchestrator"

interface PipelineResponse {
  conversationId?: string
  result: PipelineResult
}

interface RunOptions {
  profile?: "openai" | "apertus" | "mixed"
}

export const runLLMPipeline = async (
  conversationId: string,
  options: RunOptions = {},
): Promise<PipelineResponse> => {
  try {
    const conversation = await DataService.getConversationById(conversationId)
    let transcript = conversation?.transcript
    let transcriptSource = conversation?.transcript ? "supabase" : "sample"

    if (!transcript) {
      const sampleResponse = await fetch("/test1.txt")
      if (!sampleResponse.ok) {
        throw new Error("Impossibile recuperare il transcript di test (public/test.txt).")
      }
      transcript = await sampleResponse.text()
    }

    const response = await fetch("/api/orchestrator", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId,
        transcript,
        transcriptSource,
        profile: options.profile,
      }),
    })

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}))
      const message = typeof payload?.error === "string"
        ? payload.error
        : "Impossibile avviare la pipeline LLM."
      throw new Error(message)
    }

    const data = await response.json()
    console.log("Pipeline completata:", data)
    return data as PipelineResponse
  } catch (error) {
    console.error("Error in runLLMPipeline:", error)
    throw error
  }
}
