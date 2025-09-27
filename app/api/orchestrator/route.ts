import { NextRequest, NextResponse } from "next/server"
import { orchestratorRun } from "@/lib/agents/orchestrator"
import { OPENAI_PROFILE } from "@/lib/config/profiles/openai"
import { APERTUS_PROFILE } from "@/lib/config/profiles/apertus"
import { MIXED_PROFILE } from "@/lib/config/profiles/mixed"

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { transcript, raw, conversationId, transcriptSource, profile } = body || {}

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

    let config = OPENAI_PROFILE
    if (profile === "apertus") {
      config = APERTUS_PROFILE
    } else if (profile === "mixed") {
      config = MIXED_PROFILE
    }

    const result = await orchestratorRun(rawTranscript, {
      config,
      transcriptSource: typeof transcriptSource === "string" ? transcriptSource : undefined,
    })

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
