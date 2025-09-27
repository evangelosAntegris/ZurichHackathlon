"use client"

import { MessageSquare, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { DataService } from "@/lib/data-service"
import type { Conversation } from "@/lib/types"

interface ClientInsightsProps {
  selectedConversation: string | null
  labels?: string[]
}

export function ClientInsights({ selectedConversation, labels }: ClientInsightsProps) {
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
    <Card className="border border-slate-200 rounded-xl shadow-sm bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-slate-900">Client Insights</CardTitle>
        <p className="text-sm text-slate-600">
          AI-powered insights for the customer based on financial data and market conditions
        </p>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <div>
          <h3 className="font-semibold mb-2">AI Transcript Summary</h3>
          <p className="text-sm text-slate-600 mb-4">Select a conversation to view AI-generated summary</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-slate-500">Loading conversation...</div>
          </div>
        ) : conversation ? (
          <>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium mb-2 text-slate-900">Conversation Summary</h4>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {conversation.summary || "Summary not available for this conversation."}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-indigo-100 shadow-sm bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50">
              <div className="flex items-center gap-2 mb-3">
                <h4 className="font-semibold text-slate-900">Final Labels</h4>
                <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-white/70 border border-indigo-100 text-indigo-700">
                  AI-generated
                </span>
              </div>
              {labels && labels.length > 0 ? (
                <div className="flex flex-wrap gap-2.5">
                  {labels.map((label) => (
                    <span
                      key={label}
                      className="px-3 py-1.5 text-sm rounded-md bg-white/80 border border-indigo-100 text-slate-800 shadow-xs"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" style={{ animationDuration: '1.5s' }} />
                    <span className="bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent font-medium">
                      Thinking...
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <span
                        key={idx}
                        className="px-6 h-6 inline-block rounded-md bg-white/70 border border-indigo-100 animate-pulse"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
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
