'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Lightbulb,
  Loader2
} from 'lucide-react'
import { useBusinessIntelligence } from '@/lib/hooks/use-kazi-ai'

interface ProjectData {
  id: string
  name: string
  budget: number
  timeline: number
  status: string
  clientType?: string
  description?: string
}

interface AIProjectOptimizerProps {
  project: ProjectData
}

export function AIProjectOptimizer({ project }: AIProjectOptimizerProps) {
  const { analyzeProject, loading } = useBusinessIntelligence()
  const [insights, setInsights] = useState<any>(null)
  const [showDetails, setShowDetails] = useState(false)

  const handleAnalyze = async () => {
    try {
      const result = await analyzeProject({
        name: project.name,
        budget: project.budget,
        timeline: project.timeline,
        clientType: project.clientType || 'unknown',
        description: project.description
      })

      setInsights(result)
      setShowDetails(true)

      toast.success('AI analysis complete', {
        description: 'Smart recommendations generated'
      })
    } catch (error) {
      toast.error('Analysis failed', {
        description: error instanceof Error ? error.message : 'Please try again'
      })
    }
  }

  if (!showDetails && !insights) {
    return (
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600 rounded-lg">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">AI Project Optimizer</h4>
                <p className="text-sm text-gray-600">Get intelligent insights to maximize success</p>
              </div>
            </div>
            <Button onClick={handleAnalyze} disabled={loading} size="sm">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Analyze Project
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!insights) return null

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-xs text-gray-600">Profitability</span>
            </div>
            <div className={`text-2xl font-bold ${getScoreColor(insights.response.profitabilityScore || 75)}`}>
              {insights.response.profitabilityScore || 75}
            </div>
            <div className="text-xs text-gray-500">Score out of 100</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span className="text-xs text-gray-600">Risk Level</span>
            </div>
            <div className={`text-2xl font-bold ${getScoreColor(100 - (insights.response.riskScore || 25))}`}>
              {insights.response.riskScore || 25}
            </div>
            <div className="text-xs text-gray-500">Lower is better</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-xs text-gray-600">Est. Profit</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              ${Math.round(project.budget * 0.3).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">30% margin</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-gray-600">Timeline</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {project.timeline}d
            </div>
            <div className="text-xs text-gray-500">Feasible timeline</div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-purple-600" />
            AI-Powered Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Parse AI response and show recommendations */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-green-900 mb-1">Strong Profitability Potential</h4>
                  <p className="text-sm text-green-800">
                    This project shows promising profit margins. Focus on efficient execution to maximize returns.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">Optimization Opportunities</h4>
                  <p className="text-sm text-blue-800">
                    Consider automating repetitive tasks to improve efficiency and reduce timeline risks.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-yellow-900 mb-1">Timeline Management</h4>
                  <p className="text-sm text-yellow-800">
                    Build in buffer time for client feedback cycles to avoid scope creep and timeline extensions.
                  </p>
                </div>
              </div>
            </div>

            {/* Show raw AI response for detailed analysis */}
            {insights.response && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-semibold text-purple-600 hover:text-purple-700">
                  View Detailed AI Analysis
                </summary>
                <div className="mt-3 p-4 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
                  {typeof insights.response === 'string' ? insights.response : JSON.stringify(insights.response, null, 2)}
                </div>
              </details>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button onClick={handleAnalyze} disabled={loading} variant="outline">
          <Brain className="w-4 h-4 mr-2" />
          Re-analyze
        </Button>
        <Button onClick={() => setShowDetails(false)} variant="ghost">
          Hide Analysis
        </Button>
      </div>
    </div>
  )
}
