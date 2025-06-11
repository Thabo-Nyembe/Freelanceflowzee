'use client'

import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { 
  Brain, 
  Sparkles, 
  MessageCircle, 
  FileText, 
  BarChart3, 
  Loader2,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Target
} from 'lucide-react'

interface Comment {
  id: string
  content: string
  position?: { x: number; y: number }
  timestamp?: number
  author: string
}

interface AIAnalysisResult {
  category: string
  priority: string
  sentiment: string
  effort_estimate: string
  suggested_actions: string[]
  key_themes: string[]
  client_satisfaction_impact: string
  confidence_score: number
  ai_reasoning: string
}

interface FeedbackSummaryResult {
  summary: string
  recommendations: string[]
  feedback_metrics: {
    total_comments: number
    estimated_revision_time: string
    priority_distribution: {
      high_priority: number
      medium_priority: number
      low_priority: number
    }
  }
}

export function AIOpenAIIntegration() {
  const [loading, setLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null)
  const [summaryResult, setSummaryResult] = useState<FeedbackSummaryResult | null>(null)
  const [commentToAnalyze, setCommentToAnalyze] = useState('')
  const [projectType, setProjectType] = useState('Brand Identity Design')
  
  const sampleComments: Comment[] = [
    {
      id: '1',
      content: 'The color scheme is beautiful but the contrast ratio needs improvement for accessibility',
      author: 'Sarah Johnson',
      position: { x: 65, y: 40 }
    },
    {
      id: '2', 
      content: 'Love the typography choices! The header font works perfectly with the brand',
      author: 'Alex Chen',
      timestamp: 15
    },
    {
      id: '3',
      content: 'The mobile layout needs adjustment - buttons are too small for touch interaction',
      author: 'Mike Rodriguez',
      position: { x: 80, y: 60 }
    },
    {
      id: '4',
      content: 'Overall design direction is excellent, just need to refine the spacing between elements',
      author: 'Lisa Wang',
      position: { x: 45, y: 25 }
    }
  ]

  const callOpenAIFunction = useCallback(async (action: string, data: any) => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/openai-collaboration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          action,
          ...data
        })
      })

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`)
      }

      const result = await response.json()
      return result.data
    } catch (error) {
      console.error('OpenAI API Error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const analyzeComment = async () => {
    if (!commentToAnalyze.trim()) return

    try {
      const result = await callOpenAIFunction('analyze_comment', {
        content: commentToAnalyze,
        fileType: 'image',
        context: 'Brand identity design project feedback'
      })
      
      setAnalysisResult(result)
    } catch (error) {
      console.error('Comment analysis failed:', error)
    }
  }

  const generateFeedbackSummary = async () => {
    try {
      const result = await callOpenAIFunction('generate_feedback_summary', {
        comments: sampleComments,
        projectType,
        analysisType: 'summary'
      })
      
      setSummaryResult(result)
    } catch (error) {
      console.error('Feedback summary generation failed:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'negative': return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'constructive': return <TrendingUp className="w-4 h-4 text-blue-500" />
      default: return <MessageCircle className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Brain className="w-8 h-8 text-violet-600" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            AI-Powered Collaboration Analysis
          </h2>
        </div>
        <p className="text-gray-600">Leverage OpenAI to analyze feedback and generate insights</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Comment Analysis */}
        <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-600" />
              Comment Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Comment to Analyze
              </label>
              <Textarea
                placeholder="Enter a comment to get AI-powered analysis..."
                value={commentToAnalyze}
                onChange={(e) => setCommentToAnalyze(e.target.value)}
                className="bg-white/70 backdrop-blur-sm"
              />
            </div>
            
            <Button 
              onClick={analyzeComment}
              disabled={loading || !commentToAnalyze.trim()}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Analyze Comment
                </>
              )}
            </Button>

            {analysisResult && (
              <div className="space-y-3 mt-4">
                <div className="flex items-center gap-2">
                  <Badge className={getPriorityColor(analysisResult.priority)}>
                    {analysisResult.priority} Priority
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    {getSentimentIcon(analysisResult.sentiment)}
                    {analysisResult.sentiment}
                  </Badge>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">Category</p>
                  <p className="text-sm text-gray-900">{analysisResult.category}</p>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">Effort Estimate</p>
                  <p className="text-sm text-gray-900">{analysisResult.effort_estimate}</p>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">Suggested Actions</p>
                  <ul className="text-sm text-gray-900 space-y-1">
                    {analysisResult.suggested_actions?.map((action, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Target className="w-3 h-3 mt-0.5 text-violet-600 flex-shrink-0" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Confidence Score: {Math.round((analysisResult.confidence_score || 0) * 100)}%
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-violet-600 to-purple-600 h-2 rounded-full"
                      style={{ width: `${(analysisResult.confidence_score || 0) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Feedback Summary */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Feedback Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Project Type
              </label>
              <Input
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="bg-white/70 backdrop-blur-sm"
              />
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3">
              <p className="text-sm font-medium text-gray-700 mb-2">Sample Comments ({sampleComments.length})</p>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {sampleComments.map((comment, index) => (
                  <div key={comment.id} className="text-xs text-gray-600 p-2 bg-white/50 rounded">
                    <span className="font-medium">{comment.author}:</span> {comment.content.slice(0, 60)}...
                  </div>
                ))}
              </div>
            </div>
            
            <Button 
              onClick={generateFeedbackSummary}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Summary
                </>
              )}
            </Button>

            {summaryResult && (
              <div className="space-y-3 mt-4">
                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">AI Summary</p>
                  <p className="text-sm text-gray-900 leading-relaxed">{summaryResult.summary}</p>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Key Recommendations</p>
                  <ul className="text-sm text-gray-900 space-y-1">
                    {summaryResult.recommendations?.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 mt-0.5 text-blue-600 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Metrics</p>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-gray-600">Total Comments</p>
                      <p className="font-semibold">{summaryResult.feedback_metrics?.total_comments}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Est. Revision Time</p>
                      <p className="font-semibold">{summaryResult.feedback_metrics?.estimated_revision_time}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">High Priority</p>
                      <p className="font-semibold text-red-600">{summaryResult.feedback_metrics?.priority_distribution?.high_priority}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Medium Priority</p>
                      <p className="font-semibold text-yellow-600">{summaryResult.feedback_metrics?.priority_distribution?.medium_priority}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional AI Features */}
      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            Available AI Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-lg">
              <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900">File Analysis</h4>
              <p className="text-sm text-gray-600">AI quality assessment for images, videos, and documents</p>
            </div>
            <div className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-lg">
              <BarChart3 className="w-8 h-8 text-violet-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900">Project Insights</h4>
              <p className="text-sm text-gray-600">Collaboration patterns and progress analytics</p>
            </div>
            <div className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-lg">
              <Target className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900">Smart Categorization</h4>
              <p className="text-sm text-gray-600">Automatic content tagging and organization</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 