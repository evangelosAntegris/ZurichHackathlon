"use client"

import { ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { DataService } from "@/lib/data-service"
import type { ProfessionalBackground, FinancialPreferences, CommunicationPreferences } from "@/lib/types"

export function CustomerInfo() {
  const [professionalBackground, setProfessionalBackground] = useState<ProfessionalBackground | null>(null)
  const [financialPreferences, setFinancialPreferences] = useState<FinancialPreferences | null>(null)
  const [communicationPreferences, setCommunicationPreferences] = useState<CommunicationPreferences | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCustomerInfo = async () => {
      try {
        const [profBg, finPref, commPref] = await Promise.all([
          DataService.getProfessionalBackgroundByClientId("client-1"),
          DataService.getFinancialPreferencesByClientId("client-1"),
          DataService.getCommunicationPreferencesByClientId("client-1"),
        ])

        setProfessionalBackground(profBg)
        setFinancialPreferences(finPref)
        setCommunicationPreferences(commPref)
      } catch (error) {
        console.error("Failed to load customer info:", error)
      } finally {
        setLoading(false)
      }
    }

    loadCustomerInfo()
  }, [])

  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-slate-500">Loading customer information...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-lg">Detailed Customer Info</CardTitle>
          <p className="text-sm text-slate-600">Comprehensive client profile</p>
        </div>
        <ExternalLink className="w-4 h-4 text-slate-400" />
      </CardHeader>
      <CardContent className="space-y-6">
        {professionalBackground && (
          <div>
            <h4 className="font-semibold text-red-600 mb-3">Professional Background</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-600">Occupation:</span>
                <p className="font-medium">{professionalBackground.occupation}</p>
              </div>
              <div>
                <span className="text-slate-600">Education:</span>
                <p className="font-medium">{professionalBackground.education}</p>
              </div>
              <div className="col-span-2">
                <span className="text-slate-600">Industry:</span>
                <p className="font-medium">{professionalBackground.industry}</p>
              </div>
            </div>
          </div>
        )}

        {financialPreferences && (
          <div>
            <h4 className="font-semibold text-red-600 mb-3">Financial Preferences</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-600">Investment Style:</span>
                <p className="font-medium">{financialPreferences.investmentStyle}</p>
              </div>
              <div>
                <span className="text-slate-600">ESG Preference:</span>
                <p className="font-medium">{financialPreferences.esgPreference}</p>
              </div>
              <div className="col-span-2">
                <span className="text-slate-600">Liquidity Needs:</span>
                <p className="font-medium">{financialPreferences.liquidityNeeds}</p>
              </div>
            </div>
          </div>
        )}

        {communicationPreferences && (
          <div>
            <h4 className="font-semibold text-red-600 mb-3">Communication Preferences</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-600">Preferred Contact:</span>
                <p className="font-medium">{communicationPreferences.preferredContact}</p>
              </div>
              <div>
                <span className="text-slate-600">Meeting Frequency:</span>
                <p className="font-medium">{communicationPreferences.meetingFrequency}</p>
              </div>
              <div className="col-span-2">
                <span className="text-slate-600">Report Detail Level:</span>
                <p className="font-medium">{communicationPreferences.reportDetailLevel}</p>
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 border-t">
          <Button variant="outline" className="w-full bg-transparent">
            View Full Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
