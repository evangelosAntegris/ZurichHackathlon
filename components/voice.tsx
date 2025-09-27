"use client";

import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [currentSpeaker, setCurrentSpeaker] = useState('advisor');
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [suggestions, setSuggestions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [labelsItems, setLabelsItems] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const recognitionRef = useRef(null);

  // Languages for UBS 
  const languages = [
    { code: 'en-US', name: 'English' },
    { code: 'de-DE', name: 'Deutsch' },
    { code: 'fr-FR', name: 'Français' },
    { code: 'it-IT', name: 'Italiano' },
  ];

  // Setup speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = selectedLanguage;

        recognition.onresult = (event) => {
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              const text = event.results[i][0].transcript;
              const speakerText = `${currentSpeaker === 'client' ? 'Client' : 'Advisor'}: ${text}\n`;
              setTranscript(prev => prev + speakerText);
              
              // Analyze conversation
              analyzeConversation(transcript + speakerText);
            }
          }
        };

        recognition.onerror = (event) => {
          console.error('Speech error:', event.error);
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [currentSpeaker, transcript, selectedLanguage]);

  const analyzeConversation = async (fullTranscript) => {
    if (fullTranscript.length < 20) return;

    setIsAnalyzing(true);
    
    try {
      const response = await fetch('/api/ai-voice-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: fullTranscript })
      });

      if (response.ok) {
        const analysis = await response.json();
        
        setSuggestions(analysis.suggestions || []);
        setAlerts(analysis.alerts || []);
        setLabelsItems(analysis.labelsItems || []);
      } else {
        setSuggestions(["Analysis temporarily unavailable"]);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      setSuggestions(["Continue providing professional support to the client"]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Failed to start recording:', error);
        alert(`Recording failed: ${error.message}. Please check microphone permissions.`);
      }
    } else {
      alert('Speech recognition not supported. Please use Chrome or Edge browser and ensure you have microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  const clearAll = () => {
    setTranscript('');
    setSuggestions([]);
    setAlerts([]);
    setLabelsItems([]);
  };

  const formatChange = (change) => {
    const num = parseFloat(change);
    const color = num >= 0 ? 'text-green-600' : 'text-red-600';
    const symbol = num >= 0 ? '+' : '';
    return <span className={color}>{symbol}{change}%</span>;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <h1 className="text-4xl font-bold text-center mb-8">UBS Client Advisor Assistant</h1>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            
            {/* Language Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Language:
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                disabled={isRecording}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Speaker Toggle */}
            <button
              onClick={() => setCurrentSpeaker(currentSpeaker === 'client' ? 'advisor' : 'client')}
              disabled={isRecording}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                currentSpeaker === 'client' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-green-500 text-white'
              } disabled:opacity-50`}
            >
              {currentSpeaker === 'client' ? '👤 Client Speaking' : '🏦 Advisor Speaking'}
            </button>

            {/* Recording Button */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`px-8 py-3 rounded-lg font-bold text-white ${
                isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isRecording ? '⏹️ Stop Recording' : '▶️ Start Recording'}
            </button>

            {/* Clear Button */}
            <button
              onClick={clearAll}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              🗑️ Clear
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Transcript */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold mb-4">📝 Live Transcript</h2>
            <div className="bg-gray-50 rounded border p-4 h-96 overflow-y-auto">
              {transcript ? (
                <div className="whitespace-pre-wrap">
                  {transcript.split('\n').map((line, idx) => (
                    <div key={idx} className={`mb-2 ${
                      line.startsWith('Client:') ? 'text-blue-700' : 'text-green-700'
                    }`}>
                      {line}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-20">
                  Click "Start Recording" to begin transcription
                </div>
              )}
              
              {isRecording && (
                <div className="flex items-center mt-4">
                  <span className="animate-pulse text-red-500 text-2xl">●</span>
                  <span className="ml-2 text-gray-600">Recording...</span>
                </div>
              )}
            </div>
          </div>

          {/* AI Assistant */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">🤖 AI Assistant</h2>
              {isAnalyzing && (
                <div className="text-blue-600">
                  <span className="animate-spin">⟳</span> Analyzing...
                </div>
              )}
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {/* Alerts */}
              {alerts.length > 0 && (
                <div>
                  <h3 className="font-semibold text-red-600 mb-2">🚨 Alerts</h3>
                  {alerts.map((alert, idx) => (
                    <div key={idx} className="bg-red-50 border border-red-200 rounded p-3 mb-2">
                      <div className="text-red-800 text-sm">{alert}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div>
                  <h3 className="font-semibold text-green-600 mb-2">💡 Suggestions</h3>
                  {suggestions.map((suggestion, idx) => (
                    <div key={idx} className="bg-green-50 border border-green-200 rounded p-3 mb-2">
                      <div className="text-green-800 text-sm">{suggestion}</div>
                    </div>
                  ))}
                </div>
              )}

              {}
             

              {/* Labels Items */}
              {labelsItems.length > 0 && (
                <div>
                  <h3 className="font-semibold text-purple-600 mb-2">📋 Labels Items</h3>
                  {labelsItems.map((item, idx) => (
                    <div key={idx} className="bg-purple-50 border border-purple-200 rounded p-3 mb-2">
                      <div className="text-purple-800 text-sm">{item}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {suggestions.length === 0 && alerts.length === 0 && labelsItems.length === 0 && !isAnalyzing && (
                <div className="text-center text-gray-500 py-10">
                  <div className="text-4xl mb-2">🎯</div>
                  <div className="text-sm">Start recording to get AI assistance</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}