"use client"

import { Calendar, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { DataService } from "@/lib/data-service"
import type { RecentInteraction, UpcomingMeeting } from "@/lib/types"

export function CalendarPanel() {
  const [recentInteractions, setRecentInteractions] = useState<RecentInteraction[]>([])
  const [upcomingMeetings, setUpcomingMeetings] = useState<UpcomingMeeting[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCalendarData = async () => {
      try {
        const [interactions, meetings] = await Promise.all([
          DataService.getRecentInteractionsByClientId("client-1"),
          DataService.getUpcomingMeetingsByClientId("client-1"),
        ])

        setRecentInteractions(interactions)
        setUpcomingMeetings(meetings)
      } catch (error) {
        console.error("Failed to load calendar data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadCalendarData()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
  }

  const formatMeetingDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-slate-500">Loading calendar...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Calendar</CardTitle>
        <p className="text-sm text-slate-600">Recent and upcoming interactions</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-semibold text-red-600 mb-3">Recent Interactions</h4>
          <div className="space-y-3">
            {recentInteractions.map((interaction) => (
              <div key={interaction.id} className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{formatDate(interaction.date)}</p>
                  <p className="text-sm text-slate-600">{interaction.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-red-600 mb-3">Upcoming Meetings</h4>
          <div className="space-y-3">
            {upcomingMeetings.map((meeting) => (
              <div key={meeting.id} className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-slate-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{formatMeetingDate(meeting.date)}</p>
                  <p className="text-sm text-slate-600">{meeting.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button variant="outline" className="w-full bg-transparent">
            Schedule Meeting
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
