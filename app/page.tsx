"use client"

import { useState, useEffect } from "react"
import { UBSHeader } from "@/components/ubs-header"
import { ClientSidebar } from "@/components/client-sidebar"
import { ClientInsights } from "@/components/client-insights"
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

  useEffect(() => {
    const loadClientProfile = async () => {
      try {
        // Using Alice Smith's ID from mock data
        const profile = await DataService.getClientProfile("1")
        setClientProfile(profile)
      } catch (error) {
        console.error("Failed to load client profile:", error)
      }
    }

    loadClientProfile()
  }, [])

  const handleChatQuery = (query: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: query,
      timestamp: new Date(),
      clientId: clientProfile?.client.id,
    }
    setChatMessages((prev) => [...prev, newMessage])
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
            {/* Top Row */}
            <div className="lg:col-span-2">
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
