"use client"

import { useState, useCallback } from "react"
import { aiService, type ChatMessage, type AIAnalysisResult } from "./ai-service"

export function useAIChat(clientContext?: any) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return

      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content,
        timestamp: new Date(),
        clientId: clientContext?.id,
      }

      setMessages((prev) => [...prev, userMessage])
      setIsLoading(true)
      setError(null)

      try {
        const response = await aiService.generateChatResponse([...messages, userMessage], clientContext)

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response,
          timestamp: new Date(),
          clientId: clientContext?.id,
        }

        setMessages((prev) => [...prev, assistantMessage])
        return assistantMessage
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to get AI response"
        setError(errorMsg)

        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
          clientId: clientContext?.id,
        }

        setMessages((prev) => [...prev, errorMessage])
        return errorMessage
      } finally {
        setIsLoading(false)
      }
    },
    [messages, clientContext],
  )

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return {
    messages,
    sendMessage,
    clearMessages,
    isLoading,
    error,
  }
}

export function useAIAnalysis() {
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyzeClient = useCallback(async (clientId: string, conversations: any[], clientInfo: any) => {
    setIsAnalyzing(true)
    setError(null)

    try {
      const result = await aiService.analyzeClientData(clientId, conversations, clientInfo)
      setAnalysis(result)
      return result
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to analyze client data"
      setError(errorMsg)
      throw err
    } finally {
      setIsAnalyzing(false)
    }
  }, [])

  const clearAnalysis = useCallback(() => {
    setAnalysis(null)
    setError(null)
  }, [])

  return {
    analysis,
    analyzeClient,
    clearAnalysis,
    isAnalyzing,
    error,
  }
}
