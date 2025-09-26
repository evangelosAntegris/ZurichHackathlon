import { type NextRequest, NextResponse } from "next/server"
// import { streamText, convertToModelMessages, UIMessage } from 'ai'

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const { messages, clientContext } = await req.json()

    // Mock response for now
    const mockResponse = `Based on your query about ${clientContext?.name || "the client"}, here are the key insights...`

    return NextResponse.json({
      response: mockResponse,
      timestamp: new Date().toISOString(),
    })

    /*
    // Actual OpenAI implementation (commented out for now):
    const systemPrompt = `You are UBS DialogueIQ, an AI assistant for financial advisors.
    Client Context: ${JSON.stringify(clientContext)}
    
    Provide professional financial insights and recommendations.`

    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...convertToModelMessages(messages)
    ]

    const result = streamText({
      model: 'openai/gpt-4',
      messages: formattedMessages,
      maxOutputTokens: 1000,
      temperature: 0.7,
      abortSignal: req.signal,
    })

    return result.toUIMessageStreamResponse({
      onFinish: async ({ isAborted }) => {
        if (isAborted) {
          console.log('Chat request aborted')
        }
      },
    })
    */
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Failed to process chat request" }, { status: 500 })
  }
}
