"use client"
import { ChevronDown, Clock, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useEffect, useState, useRef } from "react"
import { DataService } from "@/lib/data-service"
import type { Client, Conversation } from "@/lib/types"

interface ClientSidebarProps {
  selectedConversation: string | null
  onConversationSelect: (conversationId: string) => void
}

export function ClientSidebar({ selectedConversation, onConversationSelect }: ClientSidebarProps) {
  const [client, setClient] = useState<Client | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const loadClientData = async () => {
      try {
        // For now, we'll load the first client (Alice Smith)
        const clientData = await DataService.getClientById("client-1")
        const conversationData = await DataService.getConversationsByClientId("client-1")

        setClient(clientData)
        setConversations(conversationData)
      } catch (error) {
        console.error("Failed to load client data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadClientData()
  }, [])

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    // TODO: Implement actual upload logic here
    console.log(
      "Files selected for upload:",
      Array.from(files).map((f) => f.name),
    )

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  if (loading || !client) {
    return (
      <div className="w-80 bg-[#1e293b] text-white flex flex-col h-full">
        <div className="p-4 text-center">Loading...</div>
      </div>
    )
  }

  const formatDateOfBirth = (dateOfBirth: string, age: number) => {
    const date = new Date(dateOfBirth)
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} (${age})`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
  }

  return (
    <div className="w-80 bg-[#1e293b] text-white flex flex-col h-full">
      {/* Client Dropdown */}
      <div className="p-4 border-b border-slate-700">
        <Button variant="ghost" className="w-full justify-between text-white hover:bg-slate-700 p-2">
          <span className="text-sm">Clients</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </div>

      {/* Client Profile */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-slate-600 text-white">
              {client.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{client.name}</h3>
            <p className="text-sm text-slate-300">{client.email}</p>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-300">Date of Birth:</span>
            <span>{formatDateOfBirth(client.dateOfBirth, client.age)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-300">Marital Status:</span>
            <span>{client.maritalStatus}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-300">Risk Profile:</span>
            <span>{client.riskProfile}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-300">Last Contact:</span>
            <span>{formatDate(client.lastContact)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-300">AUM:</span>
            <span className="font-semibold">{client.aum}</span>
          </div>
        </div>

        <div className="mt-4 p-3 bg-slate-800 rounded-lg">
          <h4 className="text-sm font-medium mb-2 text-slate-300">Additional Information:</h4>
          <p className="text-xs text-slate-400 leading-relaxed">{client.additionalInfo}</p>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-sm font-medium mb-3 text-slate-300">Last Conversations</h3>
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <Card
                key={conversation.id}
                className={`p-3 cursor-pointer transition-colors border-slate-600 ${
                  selectedConversation === conversation.id
                    ? "bg-slate-700 border-slate-500"
                    : "bg-slate-800 hover:bg-slate-700"
                }`}
                onClick={() => onConversationSelect(conversation.id)}
              >
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white truncate">{conversation.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-400">{formatDate(conversation.date)}</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-slate-400">{conversation.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-700">
            <Button
              onClick={triggerFileUpload}
              variant="outline"
              className="w-full bg-slate-800 border-slate-600 text-white hover:bg-slate-700 hover:border-slate-500"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Files
            </Button>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
              accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
