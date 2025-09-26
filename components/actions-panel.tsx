"use client"

import { AlertTriangle, TrendingUp, Calendar, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { DataService } from "@/lib/data-service"
import type { RecommendedAction } from "@/lib/types"

const getActionIcon = (category: string) => {
  switch (category) {
    case "portfolio":
      return TrendingUp
    case "tax":
      return FileText
    case "meeting":
      return Calendar
    case "risk":
      return AlertTriangle
    default:
      return FileText
  }
}

const getPriorityNumber = (priority: string) => {
  switch (priority) {
    case "high":
      return "1"
    case "medium":
      return "2"
    case "low":
      return "3"
    default:
      return "4"
  }
}

interface ActionsPanelProps {
  clientId: string | null
}

export function ActionsPanel({ clientId }: ActionsPanelProps) {
  const [recommendedActions, setRecommendedActions] = useState<RecommendedAction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadActions = async () => {
      if (!clientId) {
        setRecommendedActions([])
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const actions = await DataService.getRecommendedActionsByClientId(clientId)
        setRecommendedActions(actions)
      } catch (error) {
        console.error("Failed to load recommended actions:", error)
      } finally {
        setLoading(false)
      }
    }

    loadActions()
  }, [clientId])

  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-slate-500">Loading actions...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-lg">AI-recommended Actions</CardTitle>
          <p className="text-sm text-slate-600">Prioritized next steps</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h4 className="font-semibold mb-3">Top Recommended Actions</h4>
        </div>

        <div className="space-y-3 mb-6">
          {recommendedActions.map((action) => (
            <div key={action.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                  action.priority === "high"
                    ? "bg-red-500"
                    : action.priority === "medium"
                      ? "bg-orange-500"
                      : "bg-yellow-500"
                }`}
              >
                {getPriorityNumber(action.priority)}
              </div>
              <div className="flex-1">
                <h5 className="font-medium text-sm">{action.title}</h5>
                <p className="text-xs text-slate-600 mt-1">{action.description}</p>
                {action.dueDate && (
                  <p className="text-xs text-slate-500 mt-1">Due: {new Date(action.dueDate).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <Button className="w-full bg-red-600 hover:bg-red-700 text-white">View All Recommended Actions</Button>
      </CardContent>
    </Card>
  )
}
