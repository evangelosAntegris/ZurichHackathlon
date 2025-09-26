import { DataService } from "@/lib/data-service"

interface PipelineResponse {
  conversationId?: string
  result: any
}

export const runLLMPipeline = async (conversationId: string): Promise<PipelineResponse> => {
  try {
    const conversation = await DataService.getConversationById(conversationId)
    let transcript = conversation?.transcript
    let transcriptSource = conversation?.transcript ? "supabase" : "sample"

    if (!transcript) {
      const sampleResponse = await fetch("/test.txt")
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
