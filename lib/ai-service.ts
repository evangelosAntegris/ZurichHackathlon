// import { generateText, streamText, UIMessage, convertToModelMessages } from 'ai'

export interface ChatMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  clientId?: string
}

export interface AIAnalysisResult {
  summary: string
  insights: string[]
  recommendations: string[]
  riskAssessment?: string
  nextActions?: string[]
}

export class AIService {
  private static instance: AIService
  private apiKey: string | null = null

  private constructor() {
    // Initialize with environment variable when available
    // this.apiKey = process.env.OPENAI_API_KEY || null
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }

  // Mock function for now - will be replaced with actual OpenAI calls
  async generateChatResponse(messages: ChatMessage[], clientContext?: any): Promise<string> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock response based on context
    const lastMessage = messages[messages.length - 1]
    return `Based on your question "${lastMessage.content}", here's what I found about the client...`

    /* 
    // Actual OpenAI implementation (commented out for now):
    try {
      const systemPrompt = this.buildSystemPrompt(clientContext)
      const formattedMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map(msg => ({ role: msg.role, content: msg.content }))
      ]

      const result = await generateText({
        model: 'openai/gpt-4',
        messages: convertToModelMessages(formattedMessages),
        maxOutputTokens: 1000,
        temperature: 0.7,
      })

      return result.text
    } catch (error) {
      console.error('OpenAI API error:', error)
      throw new Error('Failed to generate AI response')
    }
    */
  }

  // Mock function for streaming responses
  async *streamChatResponse(messages: ChatMessage[], clientContext?: any): AsyncGenerator<string, void, unknown> {
    // Mock streaming response
    const response = await this.generateChatResponse(messages, clientContext)
    const words = response.split(" ")

    for (const word of words) {
      yield word + " "
      await new Promise((resolve) => setTimeout(resolve, 50))
    }

    /*
    // Actual streaming implementation (commented out for now):
    try {
      const systemPrompt = this.buildSystemPrompt(clientContext)
      const formattedMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map(msg => ({ role: msg.role, content: msg.content }))
      ]

      const result = streamText({
        model: 'openai/gpt-4',
        messages: convertToModelMessages(formattedMessages),
        maxOutputTokens: 1000,
        temperature: 0.7,
      })

      for await (const delta of result.textStream) {
        yield delta
      }
    } catch (error) {
      console.error('OpenAI streaming error:', error)
      throw new Error('Failed to stream AI response')
    }
    */
  }

  // Generate AI analysis of client conversations and data
  async analyzeClientData(clientId: string, conversations: any[], clientInfo: any): Promise<AIAnalysisResult> {
    // Mock analysis for now
    await new Promise((resolve) => setTimeout(resolve, 1500))

    return {
      summary: "Client shows strong interest in retirement planning with conservative risk profile.",
      insights: [
        "Recently updated risk profile to conservative",
        "Focused on wealth preservation strategies",
        "Interested in ESG investment options",
      ],
      recommendations: [
        "Schedule portfolio rebalancing review",
        "Discuss tax-loss harvesting opportunities",
        "Present ESG investment options",
      ],
      riskAssessment: "Low to moderate risk tolerance",
      nextActions: ["Portfolio review meeting", "Tax planning discussion", "ESG investment presentation"],
    }

    /*
    // Actual AI analysis implementation (commented out for now):
    try {
      const analysisPrompt = this.buildAnalysisPrompt(clientId, conversations, clientInfo)
      
      const result = await generateText({
        model: 'openai/gpt-4',
        messages: [{ role: 'user', content: analysisPrompt }],
        maxOutputTokens: 1500,
        temperature: 0.3,
      })

      return this.parseAnalysisResult(result.text)
    } catch (error) {
      console.error('AI analysis error:', error)
      throw new Error('Failed to analyze client data')
    }
    */
  }

  private buildSystemPrompt(clientContext?: any): string {
    return `You are UBS DialogueIQ, an AI assistant for UBS financial advisors. 
    You help analyze client data, provide insights, and suggest next actions.
    
    Client Context: ${JSON.stringify(clientContext, null, 2)}
    
    Guidelines:
    - Provide professional, accurate financial advice
    - Focus on client needs and risk profile
    - Suggest actionable next steps
    - Maintain confidentiality and compliance standards`
  }

  private buildAnalysisPrompt(clientId: string, conversations: any[], clientInfo: any): string {
    return `Analyze the following client data and provide insights:
    
    Client ID: ${clientId}
    Client Information: ${JSON.stringify(clientInfo, null, 2)}
    Recent Conversations: ${JSON.stringify(conversations, null, 2)}
    
    Please provide:
    1. A summary of the client's current situation
    2. Key insights from recent interactions
    3. Specific recommendations for next actions
    4. Risk assessment update if applicable
    
    Format the response as structured JSON.`
  }

  private parseAnalysisResult(aiResponse: string): AIAnalysisResult {
    // Parse AI response into structured format
    try {
      return JSON.parse(aiResponse)
    } catch {
      // Fallback parsing if JSON fails
      return {
        summary: aiResponse.substring(0, 200),
        insights: [],
        recommendations: [],
      }
    }
  }
}

export const aiService = AIService.getInstance()
