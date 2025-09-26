"use client"

import { useState, useEffect } from "react"
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAIAnalysis } from "@/lib/ai-hooks"
import type { ClientProfile } from "@/lib/types"

interface AIInsightsPanelProps {
  clientProfile: ClientProfile | null
  className?: string
}

export function AIInsightsPanel({ clientProfile, className }: AIInsightsPanelProps) {
  const { analysis, analyzeClient, isAnalyzing, error } = useAIAnalysis()
  const [lastAnalyzed, setLastAnalyzed] = useState<Date | null>(null)

  const handleAnalyze = async () => {
    if (!clientProfile) return

    try {
      await analyzeClient(clientProfile.client.id, clientProfile.conversations, clientProfile.client)
      setLastAnalyzed(new Date())
    } catch (error) {
      console.error("Analysis failed:", error)
    }
  }

  // Auto-analyze when client profile loads
  useEffect(() => {
    if (clientProfile && !analysis && !isAnalyzing) {
      handleAnalyze()
    }
  }, [clientProfile])

  if (!clientProfile) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-500" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500">Select a client to view AI insights</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-500" />
            AI Insights
          </CardTitle>
          <Button onClick={handleAnalyze} disabled={isAnalyzing} size="sm" variant="outline">
            {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Refresh"}
          </Button>
        </div>
        {lastAnalyzed && <p className="text-xs text-slate-500">Last analyzed: {lastAnalyzed.toLocaleTimeString()}</p>}
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {isAnalyzing && (
          <div className="flex items-center gap-2 text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Analyzing client data...</span>
          </div>
        )}

        {analysis && (
          <>
            {/* Summary */}
            <div>
              <h4 className="font-medium text-slate-900 mb-2">Summary</h4>
              <p className="text-sm text-slate-600">{analysis.summary}</p>
            </div>

            {/* Key Insights */}
            {analysis.insights.length > 0 && (
              <div>
                <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  Key Insights
                </h4>
                <ul className="space-y-1">
                  {analysis.insights.map((insight, index) => (
                    <li key={index} className="text-sm text-slate-600 flex items-start gap-2">
                      <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {analysis.recommendations.length > 0 && (
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Recommendations</h4>
                <div className="space-y-2">
                  {analysis.recommendations.map((rec, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {rec}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Risk Assessment */}
            {analysis.riskAssessment && (
              <div>
                <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  Risk Assessment
                </h4>
                <p className="text-sm text-slate-600">{analysis.riskAssessment}</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
