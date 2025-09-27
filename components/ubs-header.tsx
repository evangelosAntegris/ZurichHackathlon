"use client"

import type React from "react"

import Image from "next/image"
import { Search, Bell, User, Phone } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"

interface UBSHeaderProps {
  onChatQuery?: (query: string) => void
}

export function UBSHeader({ onChatQuery }: UBSHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim() && onChatQuery) {
      onChatQuery(searchQuery.trim())
      setSearchQuery("")
    }
  }

  return (
    <header className="bg-[#1e293b] text-white px-6 py-3 flex items-center justify-between border-b border-slate-700">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Image
            src="/ubs_logo.png"
            alt="UBS Logo"
            width={60}
            height={60}
            className="w-10 h-10 rounded-lg"
            priority
          />
          <h1 className="text-xl font-semibold">UBS DialogueIQ</h1>
        </div>
      </div>

      <div className="flex-1 max-w-2xl mx-8">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-500 w-4 h-4" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ask UBS DialogueIQ anything about Alice Smith..."
            className="pl-10 bg-white text-slate-900 border-0 focus:ring-2 focus:ring-red-500"
          />
        </form>
      </div>

      <div className="flex items-center gap-4">
        <Button
          onClick={() => console.log("Start Voice Transcript clicked")}
          className="bg-red-600 hover:bg-red-700 text-white border border-red-700/30"
          size="sm"
        >
          <Phone className="w-4 h-4 mr-2" />
          Start Voice Transcript
        </Button>
        <Button variant="ghost" size="sm" className="relative text-white hover:bg-slate-700">
          <Bell className="w-5 h-5" />
          <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center p-0">
            1
          </Badge>
        </Button>
        <Button variant="ghost" size="sm" className="text-white hover:bg-slate-700">
          <User className="w-5 h-5" />
        </Button>
      </div>
    </header>
  )
}
