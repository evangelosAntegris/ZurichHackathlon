"use client"

import { useEffect, useState } from "react"
import { MessageSquare } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AIResponseProps {
  response: string | null
  loading?: boolean
}

export function AIResponse({ response, loading = false }: AIResponseProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div
      className={[
        "transition-all duration-300 ease-out",
        mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2",
      ].join(" ")}
    >
      <Card className="max-h-64 overflow-auto">
        <CardHeader className="py-3">
          <CardTitle className="text-base">DialogueIQ Answer</CardTitle>
          <p className="text-xs text-slate-600">Result from OpenAI based on your question</p>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-slate-500 text-sm">Thinking...</div>
            </div>
          ) : response ? (
            <div className="bg-slate-50 p-3 rounded-lg">
              <div className="flex items-start gap-3">
                <MessageSquare className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium mb-2 text-sm">Answer</h4>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{response}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <MessageSquare className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-slate-500 text-sm max-w-xs">
                Ask a question in the top search bar to see DialogueIQ's answer here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
