import { NextRequest, NextResponse } from "next/server"
import { orchestratorRun } from "@/lib/agents/orchestrator"

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { transcript, raw, classifierPromptPath, conversationId } = body || {}

    const rawTranscript = typeof transcript === "string" && transcript.trim().length
      ? transcript
      : typeof raw === "string" && raw.trim().length
        ? raw
        : null

    if (!rawTranscript) {
      return NextResponse.json(
        { error: "Transcript mancante per avviare l'orchestrator." },
        { status: 400 },
      )
    }

    const result = await orchestratorRun(
      rawTranscript,
      typeof classifierPromptPath === "string" ? classifierPromptPath : undefined,
    )

    return NextResponse.json({
      conversationId: typeof conversationId === "string" ? conversationId : undefined,
      result,
    })
  } catch (error) {
    console.error("Orchestrator API error:", error)
    const message = error instanceof Error ? error.message : "Errore sconosciuto"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
