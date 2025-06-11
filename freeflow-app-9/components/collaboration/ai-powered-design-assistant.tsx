'use client'

import React, { useReducer, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Sparkles, 
  Wand2, 
  Palette, 
  Layout, 
  Type, 
  Image as ImageIcon,
  Zap,
  Target,
  TrendingUp,
  Brain,
  MessageSquare,
  Send,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Star,
  Download,
  Share
} from 'lucide-react'

// Context7 Pattern: Advanced State Management for AI Assistant
interface AIAssistantState {
  isAnalyzing: boolean
  currentAnalysis: AIAnalysis | null
  suggestions: AISuggestion[]
  chatHistory: AIMessage[]
  selectedSuggestion: string | null
  isGenerating: boolean
  userInput: string
  analysisMode: 'design' | 'color' | 'layout' | 'typography' | 'accessibility'
  confidence: number
}

interface AIAnalysis {
  id: string
  type: 'design' | 'color' | 'layout' | 'typography' | 'accessibility'
  score: number
  insights: string[]
  improvements: string[]
  strengths: string[]
  timestamp: string
}

interface AISuggestion {
  id: string
  title: string
  description: string
  type: 'color' | 'layout' | 'typography' | 'spacing' | 'accessibility'
  priority: 'low' | 'medium' | 'high' | 'critical'
  impact: string
  implementation: string
  examples: string[]
  confidence: number
}

interface AIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  suggestions?: AISuggestion[]
  analysis?: AIAnalysis
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
        confidence: action.analysis.score
      }
    
    case 'ADD_MESSAGE':
      return { 
        ...state, 
        chatHistory: [...state.chatHistory, action.message],
        userInput: ''
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

// Mock AI Analysis Data (in production, this would come from AI service)
const mockAnalysis: AIAnalysis = {
  id: 'analysis_1',
  type: 'design',
  score: 87,
  insights: [
    'Color contrast meets WCAG AA standards',
    'Typography hierarchy is well-established',
    'Layout follows grid system principles',
    'User flow is intuitive and clear'
  ],
  improvements: [
    'Consider reducing cognitive load in navigation',
    'Add more whitespace around CTAs',
    'Optimize mobile touch targets',
    'Improve loading state indicators'
  ],
  strengths: [
    'Strong visual hierarchy',
    'Consistent brand application',
    'Responsive design implementation',
    'Accessible color choices'
  ],
  timestamp: new Date().toISOString()
}

const mockSuggestions: AISuggestion[] = [
  {
    id: 'sug_1',
    title: 'Improve Button Contrast',
    description: 'Primary buttons need higher contrast for better accessibility',
    type: 'color',
    priority: 'high',
    impact: 'Improved accessibility and conversion rates',
    implementation: 'Change button background from #3B82F6 to #1E40AF',
    examples: ['Before: 3.1:1 contrast', 'After: 4.7:1 contrast'],
    confidence: 92
  },
  {
    id: 'sug_2',
    title: 'Optimize Mobile Spacing',
    description: 'Increase touch target sizes for mobile interactions',
    type: 'layout',
    priority: 'medium',
    impact: 'Better mobile user experience',
    implementation: 'Increase button height from 40px to 48px on mobile',
    examples: ['Current: 40px height', 'Recommended: 48px+ height'],
    confidence: 89
  },
  {
    id: 'sug_3',
    title: 'Typography Scale Adjustment',
    description: 'Refine heading hierarchy for better readability',
    type: 'typography',
    priority: 'low',
    impact: 'Enhanced content scanability',
    implementation: 'Increase h2 size from 1.5rem to 1.75rem',
    examples: ['Current scale', 'Optimized scale'],
    confidence: 78
  }
]

export function AIDesignAssistant({
  projectId,
  currentFile,
  onSuggestionApply,
  className = ''
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
    confidence: 0
  })

  // Simulate AI Analysis
  const runAnalysis = useCallback(async (mode: AIAssistantState['analysisMode']) => {
    dispatch({ type: 'START_ANALYSIS', mode })
    
    // Simulate API call delay
    setTimeout(() => {
      dispatch({ 
        type: 'COMPLETE_ANALYSIS', 
        analysis: { ...mockAnalysis, type: mode },
        suggestions: mockSuggestions 
      })
    }, 2000)
  }, [])

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
    dispatch({ type: 'START_GENERATING' })

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: AIMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: `Based on your question about "${state.userInput}", I recommend focusing on the design principles we've identified. Here are some specific suggestions:`,
        timestamp: new Date().toISOString(),
        suggestions: mockSuggestions.slice(0, 2)
      }
      
      dispatch({ type: 'ADD_MESSAGE', message: aiResponse })
      dispatch({ type: 'STOP_GENERATING' })
    }, 1500)
  }, [state.userInput])

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