"use client"

import { useState, useEffect } from "react"
import { UBSHeader } from "@/components/ubs-header"
import { ClientSidebar } from "@/components/client-sidebar"
import { ClientInsights } from "@/components/client-insights"
import { AIResponse } from "@/components/ai-response"
import { CustomerInfo } from "@/components/customer-info"
import { CalendarPanel } from "@/components/calendar-panel"
import { ActionsPanel } from "@/components/actions-panel"
import { ChatInterface } from "@/components/chat-interface"
import { DataService } from "@/lib/data-service"
import type { ChatMessage } from "@/lib/ai-service"
import type { ClientProfile } from "@/lib/types"

export default function UBSDashboard() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [aiResponse, setAiResponse] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => {
    const loadClientProfile = async () => {
      try {
        // Fetch first available client and load profile
        const clients = await DataService.getAllClients()
        if (clients && clients.length > 0) {
          const profile = await DataService.getClientProfile(clients[0].id)
          setClientProfile(profile)
        } else {
          setClientProfile(null)
        }
      } catch (error) {
        console.error("Failed to load client profile:", error)
      }
    }

    loadClientProfile()
  }, [])

  const handleChatQuery = async (query: string) => {
    try {
      // Log the query being sent
      console.log("[DialogueIQ] Sending query:", query)
      setAiLoading(true)
      setAiResponse(null)

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, clientContext: clientProfile?.client }),
      })

      if (!res.ok) {
        const txt = await res.text()
        console.error("[DialogueIQ] API error:", txt)
        return
      }

      const data = await res.json()
      // Put the model response into the AIResponse panel
      setAiResponse(data.response)
      // Optionally also keep a local log of the interaction in state
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: query,
        timestamp: new Date(),
        clientId: clientProfile?.client.id,
      }
      setChatMessages((prev) => [...prev, newMessage])
    } catch (err) {
      console.error("[DialogueIQ] Failed to send query:", err)
      setAiResponse("Sorry, I couldn't complete that request. Please try again.")
    }
    finally {
      setAiLoading(false)
    }
  }

  const handleNewChatMessage = (message: ChatMessage) => {
    setChatMessages((prev) => [...prev, message])
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <UBSHeader onChatQuery={handleChatQuery} />

      <div className="flex flex-1 overflow-hidden">
        <ClientSidebar selectedConversation={selectedConversation} onConversationSelect={setSelectedConversation} />

        <main className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Top Row: AIResponse above Client Insights */}
            <div className="lg:col-span-2 space-y-6">
              {(aiLoading || aiResponse) && (
                <AIResponse response={aiResponse} loading={aiLoading} />
              )}
              <ClientInsights selectedConversation={selectedConversation} />
            </div>

            {/* Bottom Row */}
            <CustomerInfo />
            <div className="grid grid-rows-2 gap-6">
              <CalendarPanel />
              <ActionsPanel />
            </div>
          </div>
        </main>
      </div>

      <ChatInterface clientContext={clientProfile?.client} onNewMessage={handleNewChatMessage} />
    </div>
  )
}
