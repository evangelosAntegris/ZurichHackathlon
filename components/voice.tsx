"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Mic, MicOff, User, Building2, Settings, Trash2 } from "lucide-react"

interface VoiceTranscriptPopupProps {
  isOpen: boolean
  onClose: () => void
}

export function VoiceTranscriptPopup({ isOpen, onClose }: VoiceTranscriptPopupProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [clientTranscript, setClientTranscript] = useState("")
  const [agentTranscript, setAgentTranscript] = useState("")
  const [currentSpeaker, setCurrentSpeaker] = useState<"client" | "agent">("client")
  const [selectedLanguage, setSelectedLanguage] = useState("en-US")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [alerts, setAlerts] = useState<string[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const recognitionRef = useRef<any>(null)

  // Languages for UBS
  const languages = [
    { code: "en-US", name: "English" },
    { code: "de-DE", name: "Deutsch" },
    { code: "fr-FR", name: "Français" },
    { code: "it-IT", name: "Italiano" },
  ]

  // Setup speech recognition
  useEffect(() => {
    if (typeof window !== "undefined" && isOpen) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = false
        recognition.lang = selectedLanguage

        recognition.onresult = (event) => {
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              const text = event.results[i][0].transcript
              const timestamp = new Date().toLocaleTimeString()
              const formattedText = `[${timestamp}] ${text}\n`

              if (currentSpeaker === "client") {
                setClientTranscript((prev) => prev + formattedText)
              } else {
                setAgentTranscript((prev) => prev + formattedText)
              }

              // Analyze conversation
              analyzeConversation(clientTranscript + agentTranscript + formattedText)
            }
          }
        }

        recognition.onerror = (event) => {
          console.error("Speech error:", event.error)
          setIsRecording(false)
        }

        recognition.onend = () => {
          setIsRecording(false)
        }

        recognitionRef.current = recognition
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [currentSpeaker, clientTranscript, agentTranscript, selectedLanguage, isOpen])

  const analyzeConversation = async (fullTranscript: string) => {
    if (fullTranscript.length < 20) return

    setIsAnalyzing(true)

    try {
      const response = await fetch("/api/ai-voice-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: fullTranscript }),
      })

      if (response.ok) {
        const analysis = await response.json()
        setSuggestions(analysis.suggestions || [])
        setAlerts(analysis.alerts || [])
      } else {
        setSuggestions(["Analysis temporarily unavailable"])
      }
    } catch (error) {
      console.error("Analysis failed:", error)
      setSuggestions(["Continue providing professional support to the client"])
    } finally {
      setIsAnalyzing(false)
    }
  }

  const startRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start()
        setIsRecording(true)
      } catch (error) {
        console.error("Failed to start recording:", error)
        alert(`Recording failed: ${error.message}. Please check microphone permissions.`)
      }
    } else {
      alert(
        "Speech recognition not supported. Please use Chrome or Edge browser and ensure you have microphone permissions.",
      )
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsRecording(false)
  }

  const clearTranscripts = () => {
    setClientTranscript("")
    setAgentTranscript("")
    setSuggestions([])
    setAlerts([])
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Live Voice Transcript</h2>
              <p className="text-sm text-gray-600">Real-time conversation analysis</p>
            </div>
          </div>
          <Button onClick={onClose} variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-gray-600" />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                disabled={isRecording}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-50 text-sm"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Speaker Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Speaking:</span>
              <Button
                onClick={() => setCurrentSpeaker(currentSpeaker === "client" ? "agent" : "client")}
                disabled={isRecording}
                variant={currentSpeaker === "client" ? "default" : "secondary"}
                size="sm"
                className={
                  currentSpeaker === "client"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }
              >
                {currentSpeaker === "client" ? (
                  <>
                    <User className="w-4 h-4 mr-2" />
                    Client
                  </>
                ) : (
                  <>
                    <Building2 className="w-4 h-4 mr-2" />
                    Agent
                  </>
                )}
              </Button>
            </div>

            {/* Recording Controls */}
            <div className="flex items-center gap-2">
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                className={`${
                  isRecording ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                } text-white`}
                size="sm"
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-4 h-4 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    Start Recording
                  </>
                )}
              </Button>

              <Button
                onClick={clearTranscripts}
                variant="outline"
                size="sm"
                className="text-gray-600 hover:text-gray-800 bg-transparent"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>

            {/* Recording Status */}
            {isRecording && (
              <div className="flex items-center gap-2 text-red-600">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Recording...</span>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
          {/* Client Transcript */}
          <div className="bg-blue-50 rounded-lg border border-blue-200 flex flex-col">
            <div className="p-4 border-b border-blue-200 bg-blue-100">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Client Transcript</h3>
                <Badge variant="secondary" className="bg-blue-200 text-blue-800">
                  {clientTranscript.split("\n").filter((line) => line.trim()).length} lines
                </Badge>
              </div>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              {clientTranscript ? (
                <div className="whitespace-pre-wrap text-sm text-blue-900 font-mono">{clientTranscript}</div>
              ) : (
                <div className="text-center text-blue-600 py-20">
                  <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">Client speech will appear here</p>
                </div>
              )}
            </div>
          </div>

          {/* Agent Transcript */}
          <div className="bg-green-50 rounded-lg border border-green-200 flex flex-col">
            <div className="p-4 border-b border-green-200 bg-green-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-900">Bank Agent Transcript</h3>
                <Badge variant="secondary" className="bg-green-200 text-green-800">
                  {agentTranscript.split("\n").filter((line) => line.trim()).length} lines
                </Badge>
              </div>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              {agentTranscript ? (
                <div className="whitespace-pre-wrap text-sm text-green-900 font-mono">{agentTranscript}</div>
              ) : (
                <div className="text-center text-green-600 py-20">
                  <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">Agent speech will appear here</p>
                </div>
              )}
            </div>
          </div>

          {/* AI Analysis */}
          <div className="bg-purple-50 rounded-lg border border-purple-200 flex flex-col">
            <div className="p-4 border-b border-purple-200 bg-purple-100">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-purple-900">AI Analysis</h3>
                {isAnalyzing && (
                  <div className="text-purple-600 text-sm">
                    <span className="animate-spin">⟳</span> Analyzing...
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {/* Alerts */}
              {alerts.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-700 mb-2 text-sm">🚨 Alerts</h4>
                  {alerts.map((alert, idx) => (
                    <div key={idx} className="bg-red-100 border border-red-200 rounded p-3 mb-2">
                      <div className="text-red-800 text-xs">{alert}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div>
                  <h4 className="font-medium text-green-700 mb-2 text-sm">💡 Suggestions</h4>
                  {suggestions.map((suggestion, idx) => (
                    <div key={idx} className="bg-green-100 border border-green-200 rounded p-3 mb-2">
                      <div className="text-green-800 text-xs">{suggestion}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {suggestions.length === 0 && alerts.length === 0 && !isAnalyzing && (
                <div className="text-center text-purple-600 py-20">
                  <div className="text-4xl mb-4">🎯</div>
                  <p className="text-sm">Start recording to get AI insights</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
