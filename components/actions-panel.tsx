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
  clientId?: string | null
  labels?: string[]
  loading?: boolean
}

export function ActionsPanel({ clientId = null, labels, loading: externalLoading = false }: ActionsPanelProps) {
  const [recommendedActions, setRecommendedActions] = useState<RecommendedAction[]>([])
  const [loading, setLoading] = useState(true)

  // Map label keys to one or more professional actions with priorities
  const labelToActions = (keys: string[]): RecommendedAction[] => {
    const out: RecommendedAction[] = []
    const now = new Date().toISOString()
    const push = (
      title: string,
      description: string,
      priority: RecommendedAction['priority'],
      category: RecommendedAction['category'] = 'meeting',
    ) => {
      out.push({
        id: `${title}-${Math.random().toString(36).slice(2, 8)}`,
        clientId: clientId ?? 'unknown',
        title,
        description,
        priority,
        category,
        completed: false,
        createdAt: now,
        updatedAt: now,
      })
    }

    const has = (k: string) => keys.includes(k)

    if (has('schedule_meeting')) {
      push(
        'Schedule Client Meeting',
        'Arrange a meeting to discuss recent topics and align on next steps.',
        'high',
        'meeting',
      )
    }

    if (has('plan_contact')) {
      push(
        'Plan Follow-up Contact',
        'Prepare a concise follow-up with key points and proposed dates.',
        'medium',
        'meeting',
      )
    }

    if (has('update_contact_info_non_postal')) {
      push(
        'Update Contact Details (Email/Phone)',
        'Verify and update the client’s email and phone information in the CRM.',
        'medium',
        'compliance',
      )
    }
    if (has('update_contact_info_postal_address')) {
      push(
        'Update Postal Address',
        'Confirm the client’s mailing address and update records accordingly.',
        'low',
        'compliance',
      )
    }

    if (has('update_kyc_activity')) {
      push(
        'Refresh KYC – Activity',
        'Review and update the client’s professional activity to remain compliant.',
        'high',
        'compliance',
      )
    }
    if (has('update_kyc_origin_of_assets')) {
      push(
        'Refresh KYC – Origin of Assets',
        'Confirm origin of assets documentation and record any changes.',
        'high',
        'compliance',
      )
    }
    if (has('update_kyc_purpose_of_businessrelation')) {
      push(
        'Refresh KYC – Purpose of Business Relation',
        'Validate the stated purpose and ensure documentation is current.',
        'medium',
        'compliance',
      )
    }
    if (has('update_kyc_total_assets')) {
      push(
        'Refresh KYC – Total Assets',
        'Reconcile declared total assets and update supporting information.',
        'medium',
        'compliance',
      )
    }

    // Add a general action to ensure there can be more recommendations than raw labels
    if (keys.length) {
      push(
        'Document Client Interaction',
        'Summarise the conversation in the CRM and attach relevant materials.',
        'low',
        'meeting',
      )
    }

    // Sort by priority number
    const order = { high: 1, medium: 2, low: 3 } as const
    return out.sort((a, b) => order[a.priority] - order[b.priority])
  }

  useEffect(() => {
    // If no conversation selected (labels === undefined), do nothing and show placeholder
    if (labels === undefined) {
      setRecommendedActions([])
      setLoading(false)
      return
    }

    // If labels provided (possibly empty while loading), derive actions once available
    if (Array.isArray(labels)) {
      setRecommendedActions(labels.length ? labelToActions(labels) : [])
      setLoading(false)
      return
    }
  }, [labels])

  // Placeholder when no conversation is selected
  if (labels === undefined) {
    return (
      <Card className="h-full bg-gradient-to-b from-red-50 to-amber-50 border-red-100">
        <CardContent className="flex flex-col h-full pt-4">
          <div className="mb-4">
            <CardTitle className="text-lg text-red-700">AI-recommended Actions</CardTitle>
            <p className="text-sm text-slate-700">Recommendations are generated based on AI labels.</p>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
            <FileText className="w-12 h-12 text-red-400 mb-3" />
            <p className="text-sm text-slate-600 max-w-xs">
              Select a conversation from the sidebar to generate professional, prioritized actions.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (externalLoading && (!labels || labels.length === 0)) {
    return (
      <Card className="h-full bg-gradient-to-b from-red-50 to-amber-50 border-red-100">
        <CardContent className="h-full pt-4">
          <div className="mb-4">
            <CardTitle className="text-lg text-red-700">AI-recommended Actions</CardTitle>
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <TrendingUp className="w-4 h-4 text-red-500 animate-spin" style={{ animationDuration: '1.5s' }} />
              <span>Deriving recommendations...</span>
            </div>
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-3 rounded-lg bg-white/70 border border-red-100 animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className="h-full bg-gradient-to-b from-red-50 to-amber-50 border-red-100">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-slate-600">Loading actions...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full bg-gradient-to-b from-red-50 to-amber-50 border-red-100">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-lg text-red-700">AI-recommended Actions</CardTitle>
          <p className="text-sm text-slate-700">Prioritized next steps</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h4 className="font-semibold mb-3 text-red-700">Top Recommended Actions</h4>
        </div>

        <div className="space-y-3 mb-6">
          {recommendedActions.map((action) => (
            <div key={action.id} className="flex items-start gap-3 p-3 bg-white/70 border border-red-100 rounded-lg backdrop-blur-[1px]">
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
                <h5 className="font-medium text-sm text-slate-900">{action.title}</h5>
                <p className="text-xs text-slate-700 mt-1">{action.description}</p>
                {action.dueDate && (
                  <p className="text-xs text-slate-600 mt-1">Due: {new Date(action.dueDate).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <Button className="w-full bg-red-600 hover:bg-red-700 text-white border border-red-700/30">View All Recommended Actions</Button>
      </CardContent>
    </Card>
  )
}
