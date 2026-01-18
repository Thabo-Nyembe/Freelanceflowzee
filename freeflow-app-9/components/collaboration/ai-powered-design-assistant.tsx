'use client'

import { useReducer, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Wand2, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  MessageSquare, 
  Send, 
  Zap, 
  Download,
  Brain,
  RefreshCw,
  Sparkles,
  Palette,
  Layout,
  Type,
  Target
} from 'lucide-react'

type AISuggestion = {
  id: string
  title: string
  description: string
  type: string
  priority: string
  impact: string
  implementation: string
  examples: string[]
  confidence: number
}

type AIAnalysis = {
  id: string
  type: string
  score: number
  insights: string[]
  improvements: string[]
  strengths: string[]
  timestamp: string
}

type AIMessage = {
  id: string
  role: string
  content: string
  timestamp: string
  suggestions?: AISuggestion[]
}

type AIAssistantState = {
  isAnalyzing: boolean
  currentAnalysis: AIAnalysis | null
  suggestions: AISuggestion[]
  chatHistory: AIMessage[]
  selectedSuggestion: string | null
  isGenerating: boolean
  userInput: string
  analysisMode: string
  confidence: number
}

type AIAssistantAction =
  | { type: 'START_ANALYSIS'; mode: AIAssistantState['analysisMode'] }
  | { type: 'COMPLETE_ANALYSIS'; analysis: AIAnalysis; suggestions: AISuggestion[] }
  | { type: 'ADD_MESSAGE'; message: AIMessage }
  | { type: 'SET_USER_INPUT'; input: string }
  | { type: 'SELECT_SUGGESTION'; suggestionId: string }
  | { type: 'START_GENERATING' }
  | { type: 'STOP_GENERATING' }
  | { type: 'SET_ANALYSIS_MODE'; mode: AIAssistantState['analysisMode'] }

function aiAssistantReducer(state: AIAssistantState, action: AIAssistantAction): AIAssistantState {
  switch (action.type) {
    case 'START_ANALYSIS':
      return { 
        ...state, 
        isAnalyzing: true, 
        analysisMode: action.mode,
        confidence: 0
      }
    
    case 'COMPLETE_ANALYSIS':
      return { 
        ...state, 
        isAnalyzing: false,
        currentAnalysis: action.analysis,
        suggestions: action.suggestions,
        confidence: action.analysis.score,
      }
    
    case 'ADD_MESSAGE':
      return { 
        ...state, 
        chatHistory: [...state.chatHistory, action.message],
        userInput: '',
      }
    
    case 'SET_USER_INPUT':
      return { ...state, userInput: action.input }
    
    case 'SELECT_SUGGESTION':
      return { ...state, selectedSuggestion: action.suggestionId }
    
    case 'START_GENERATING':
      return { ...state, isGenerating: true }
    
    case 'STOP_GENERATING':
      return { ...state, isGenerating: false }
    
    case 'SET_ANALYSIS_MODE':
      return { ...state, analysisMode: action.mode }
    
    default:
      return state
  }
}

interface AIDesignAssistantProps {
  projectId: string
  currentFile?: {
    id: string
    name: string
    type: string
    url: string
  }
  onSuggestionApply?: (suggestion: AISuggestion) => void
  className?: string
}

// Convert API response to component types
function convertAnalysisResponse(apiResponse: {
  id?: string
  type: string
  score: number
  scores: { accessibility: number; performance: number; responsiveness: number; usability: number }
  recommendations: string[]
  timestamp: string
}): { analysis: AIAnalysis; suggestions: AISuggestion[] } {
  const analysis: AIAnalysis = {
    id: apiResponse.id || `analysis_${Date.now()}`,
    type: apiResponse.type,
    score: apiResponse.score,
    insights: [
      `Accessibility score: ${apiResponse.scores.accessibility}%`,
      `Performance score: ${apiResponse.scores.performance}%`,
      `Responsiveness score: ${apiResponse.scores.responsiveness}%`,
      `Usability score: ${apiResponse.scores.usability}%`
    ],
    improvements: apiResponse.recommendations,
    strengths: apiResponse.score >= 80
      ? ['Good overall design quality', 'Meets baseline standards']
      : ['Foundation is solid', 'Improvements identified'],
    timestamp: apiResponse.timestamp
  }

  // Generate suggestions from recommendations
  const priorityMap = ['high', 'medium', 'low'] as const
  const typeMap = ['accessibility', 'performance', 'layout', 'typography', 'color'] as const

  const suggestions: AISuggestion[] = apiResponse.recommendations.map((rec, index) => ({
    id: `sug_${Date.now()}_${index}`,
    title: rec.split('.')[0] || rec.substring(0, 50),
    description: rec,
    type: typeMap[index % typeMap.length],
    priority: priorityMap[Math.min(index, priorityMap.length - 1)],
    impact: 'Improves overall design quality',
    implementation: rec,
    examples: [`Before: Current state`, `After: Optimized`],
    confidence: Math.max(70, 95 - (index * 5))
  }))

  return { analysis, suggestions }
}

export function AIDesignAssistant({
  projectId,
  currentFile,
  onSuggestionApply,
  className,
}: AIDesignAssistantProps) {
  const [state, dispatch] = useReducer(aiAssistantReducer, {
    isAnalyzing: false,
    currentAnalysis: null,
    suggestions: [],
    chatHistory: [],
    selectedSuggestion: null,
    isGenerating: false,
    userInput: '',
    analysisMode: 'design',
    confidence: 0,
  })

  // Run AI Analysis via API
  const runAnalysis = useCallback(async (mode: AIAssistantState['analysisMode']) => {
    dispatch({ type: 'START_ANALYSIS', mode })

    try {
      const response = await fetch('/api/ai/design-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: mode,
          designDescription: currentFile?.url
            ? `Analyzing ${currentFile.type} file: ${currentFile.url}`
            : `General ${mode} analysis for project`,
          projectId
        })
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const data = await response.json()

      if (data.success && data.analysis) {
        const { analysis, suggestions } = convertAnalysisResponse(data.analysis)
        dispatch({
          type: 'COMPLETE_ANALYSIS',
          analysis,
          suggestions
        })
      } else {
        throw new Error(data.error || 'Analysis failed')
      }
    } catch (error) {
      console.error('AI Analysis error:', error)
      // Dispatch empty analysis on error
      dispatch({
        type: 'COMPLETE_ANALYSIS',
        analysis: {
          id: `error_${Date.now()}`,
          type: mode,
          score: 0,
          insights: ['Analysis failed - please try again'],
          improvements: [],
          strengths: [],
          timestamp: new Date().toISOString()
        },
        suggestions: []
      })
    }
  }, [projectId, currentFile])

  // Send message to AI
  const sendMessage = useCallback(async () => {
    if (!state.userInput.trim()) return

    const userMessage: AIMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: state.userInput,
      timestamp: new Date().toISOString()
    }

    dispatch({ type: 'ADD_MESSAGE', message: userMessage })
    dispatch({ type: 'SET_USER_INPUT', input: '' })
    dispatch({ type: 'START_GENERATING' })

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: state.userInput,
          taskType: 'design',
          systemPrompt: `You are an expert design assistant helping with ${state.analysisMode} analysis.
            Current analysis context: ${state.currentAnalysis ? `Score: ${state.currentAnalysis.score}, Type: ${state.currentAnalysis.type}` : 'No analysis yet'}.
            Provide specific, actionable design suggestions.`
        })
      })

      const data = await response.json()

      if (data.success && data.response) {
        // Convert API suggestions to component format
        const suggestions: AISuggestion[] = (data.response.suggestions || []).slice(0, 2).map((s: string, i: number) => ({
          id: `chat_sug_${Date.now()}_${i}`,
          title: s.substring(0, 40),
          description: s,
          type: state.analysisMode,
          priority: i === 0 ? 'high' : 'medium',
          impact: 'Based on your question',
          implementation: s,
          examples: [],
          confidence: 85 - (i * 10)
        }))

        const aiResponse: AIMessage = {
          id: `msg_${Date.now() + 1}`,
          role: 'assistant',
          content: data.response.content,
          timestamp: new Date().toISOString(),
          suggestions
        }

        dispatch({ type: 'ADD_MESSAGE', message: aiResponse })
      } else {
        throw new Error(data.error || 'Chat failed')
      }
    } catch (error) {
      console.error('AI Chat error:', error)
      const errorResponse: AIMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      }
      dispatch({ type: 'ADD_MESSAGE', message: errorResponse })
    } finally {
      dispatch({ type: 'STOP_GENERATING' })
    }
  }, [state.userInput, state.analysisMode, state.currentAnalysis])

  const analysisOptions = [
    { key: 'design', label: 'Overall Design', icon: Palette },
    { key: 'color', label: 'Color & Contrast', icon: Sparkles },
    { key: 'layout', label: 'Layout & Spacing', icon: Layout },
    { key: 'typography', label: 'Typography', icon: Type },
    { key: 'accessibility', label: 'Accessibility', icon: Target }
  ]

  const getPriorityColor = (priority: AISuggestion['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Design Assistant</h3>
            <p className="text-sm text-gray-600">Intelligent design analysis and suggestions</p>
          </div>
        </div>
        
        {state.confidence > 0 && (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {state.confidence}% Confidence
          </Badge>
        )}
      </div>

      {/* Analysis Controls */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Wand2 className="w-4 h-4" />
            Quick Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
            {analysisOptions.map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={state.analysisMode === key ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  dispatch({ type: 'SET_ANALYSIS_MODE', mode: key as any })
                  runAnalysis(key as any)
                }}
                disabled={state.isAnalyzing}
                className="flex flex-col items-center gap-1 h-auto p-3"
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs">{label}</span>
              </Button>
            ))}
          </div>
          
          {state.isAnalyzing && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Analyzing design patterns and accessibility...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {state.currentAnalysis && (
        <Card className="bg-white/70 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium text-green-700 mb-2 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Strengths
                </h4>
                <ul className="space-y-1 text-sm">
                  {state.currentAnalysis.strengths.map((strength, i) => (
                    <li key={i} className="text-gray-600">• {strength}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-blue-700 mb-2 flex items-center gap-1">
                  <Brain className="w-4 h-4" />
                  Insights
                </h4>
                <ul className="space-y-1 text-sm">
                  {state.currentAnalysis.insights.map((insight, i) => (
                    <li key={i} className="text-gray-600">• {insight}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-orange-700 mb-2 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Improvements
                </h4>
                <ul className="space-y-1 text-sm">
                  {state.currentAnalysis.improvements.map((improvement, i) => (
                    <li key={i} className="text-gray-600">• {improvement}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Suggestions */}
      {state.suggestions.length > 0 && (
        <Card className="bg-white/70 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              AI Suggestions ({state.suggestions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {state.suggestions.map((suggestion) => (
              <div 
                key={suggestion.id}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  state.selectedSuggestion === suggestion.id 
                    ? 'border-blue-300 bg-blue-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => dispatch({ type: 'SELECT_SUGGESTION', suggestionId: suggestion.id })}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(suggestion.priority)}>
                      {suggestion.priority}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {suggestion.confidence}%
                    </Badge>
                  </div>
                </div>
                
                <div className="text-sm space-y-1">
                  <p><strong>Impact:</strong> {suggestion.impact}</p>
                  <p><strong>Implementation:</strong> {suggestion.implementation}</p>
                </div>
                
                <div className="flex items-center gap-2 mt-3">
                  <Button 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation()
                      onSuggestionApply?.(suggestion)
                    }}
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    Apply
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="w-3 h-3 mr-1" />
                    Export
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* AI Chat Interface */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Ask AI Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Chat History */}
          {state.chatHistory.length > 0 && (
            <div className="max-h-64 overflow-y-auto space-y-3">
              {state.chatHistory.map((message) => (
                <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.role === 'assistant' && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-600 text-white">
                        AI
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                    message.role === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    {message.suggestions && (
                      <div className="mt-2 space-y-1">
                        {message.suggestions.map((sug) => (
                          <div key={sug.id} className="text-xs bg-white/20 rounded p-1">
                            {sug.title}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              
              {state.isGenerating && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-600 text-white">
                      AI
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 text-gray-900 px-3 py-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-xs text-gray-500">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Chat Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Ask about design improvements, accessibility, or best practices..."
              value={state.userInput}
              onChange={(e) => dispatch({ type: 'SET_USER_INPUT', input: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              disabled={state.isGenerating}
            />
            <Button 
              onClick={sendMessage}
              disabled={!state.userInput.trim() || state.isGenerating}
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 