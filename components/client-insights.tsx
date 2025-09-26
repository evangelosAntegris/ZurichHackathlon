"use client"

import { MessageSquare } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { DataService } from "@/lib/data-service"
import type { Conversation } from "@/lib/types"

interface ClientInsightsProps {
  selectedConversation: string | null
}

export function ClientInsights({ selectedConversation }: ClientInsightsProps) {
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadConversation = async () => {
      if (!selectedConversation) {
        setConversation(null)
        return
      }

      setLoading(true)
      try {
        const conversationData = await DataService.getConversationById(selectedConversation)
        setConversation(conversationData)
      } catch (error) {
        console.error("Failed to load conversation:", error)
      } finally {
        setLoading(false)
      }
    }

    loadConversation()
  }, [selectedConversation])

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Client Insights</CardTitle>
        <p className="text-sm text-slate-600">
          AI-powered insights for Alice Smith based on financial data and market conditions
        </p>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <h3 className="font-semibold mb-2">AI Transcript Summary</h3>
          <p className="text-sm text-slate-600 mb-4">Select a conversation to view AI-generated summary</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-slate-500">Loading conversation...</div>
          </div>
        ) : conversation ? (
          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium mb-2">Conversation Summary</h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {conversation.summary || "Summary not available for this conversation."}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare className="w-16 h-16 text-slate-300 mb-4" />
            <p className="text-slate-500 text-sm max-w-xs">
              Select a conversation from the sidebar to view the AI-generated summary and insights.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
