import { type NextRequest, NextResponse } from "next/server"

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { messages, clientContext, query } = body || {}

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY
    if (!OPENAI_API_KEY) {
      return NextResponse.json({ error: "Missing OPENAI_API_KEY server env" }, { status: 500 })
    }

    // Determine the user prompt
    let userPrompt: string | undefined = query
    if (!userPrompt && Array.isArray(messages) && messages.length > 0) {
      const lastUser = [...messages].reverse().find((m: any) => m.role === "user")
      userPrompt = lastUser?.content
    }

    if (!userPrompt) {
      return NextResponse.json({ error: "Missing query or messages" }, { status: 400 })
    }

    const systemPrompt = `You are UBS DialogueIQ, an AI assistant for financial advisors.
Client Context (JSON): ${clientContext ? JSON.stringify(clientContext) : "{}"}
Respond concisely and professionally.`

    const payload = {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
    }

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(payload),
    })

    if (!resp.ok) {
      const errText = await resp.text()
      console.error("OpenAI error:", resp.status, errText)
      const details = process.env.NODE_ENV === 'development' ? errText : undefined
      return NextResponse.json({ error: "OpenAI request failed", status: resp.status, details }, { status: 502 })
    }

    const data = await resp.json()
    const content = data?.choices?.[0]?.message?.content ?? ""

    return NextResponse.json({
      response: content,
      model: data?.model,
      usage: data?.usage,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Failed to process chat request" }, { status: 500 })
  }
}
