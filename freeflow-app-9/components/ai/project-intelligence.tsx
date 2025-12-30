'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Target,
  Loader2
} from 'lucide-react'
import { analyzeProjectIntelligence } from '@/lib/ai/business-intelligence'
import { createClient } from '@/lib/supabase/client'
import {
  createProjectAnalysis,
  bulkCreateInsights
} from '@/lib/ai-business-queries'

export function ProjectIntelligence() {
  const [loading, setLoading] = useState(false)
  const [insights, setInsights] = useState<any>(null)

  const [projectData, setProjectData] = useState({
    name: '',
    budget: '',
    timeline: '',
    clientType: 'startup',
    scope: ''
  })

  const handleAnalyze = async () => {
    if (!projectData.name || !projectData.budget || !projectData.timeline) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      // Get authenticated user
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Please log in to use AI Business Advisor')
        setLoading(false)
        return
      }

      // Run AI analysis
      const result = await analyzeProjectIntelligence({
        id: `project-${Date.now()}`,
        name: projectData.name,
        budget: parseFloat(projectData.budget),
        timeline: parseInt(projectData.timeline),
        clientType: projectData.clientType,
        scope: projectData.scope
      })

      // Save analysis to Supabase
      const { data: analysis, error: analysisError } = await createProjectAnalysis(user.id, {
        project_name: projectData.name,
        budget: parseFloat(projectData.budget),
        timeline: parseInt(projectData.timeline),
        client_type: projectData.clientType,
        scope: projectData.scope,
        profitability_score: result.profitabilityScore,
        risk_score: result.riskScore,
        estimated_profit: result.estimatedProfit,
        estimated_margin: result.estimatedMargin,
        recommendations: result.recommendations
      })

      if (analysisError || !analysis) {
        throw new Error('Failed to save analysis')
      }

      // Save insights to Supabase
      if (result.insights && result.insights.length > 0) {
        const insightsToSave = result.insights.map((insight: any) => ({
          analysis_id: analysis.id,
          category: insight.category,
          title: insight.title,
          description: insight.description,
          impact: insight.impact,
          is_actionable: insight.actionable,
          recommendation: insight.recommendation
        }))

        await bulkCreateInsights(insightsToSave)
      }

      setInsights(result)

      toast.success('Analysis complete', {
        description: `Profitability: ${result.profitabilityScore}/100 • Risk: ${result.riskScore}/100 • Saved to database`
      })
    } catch (error) {
      toast.error('Analysis failed', {
        description: error instanceof Error ? error.message : 'Please try again'
      })
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getImpactBadge = (impact: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    }
    return colors[impact as keyof typeof colors] || colors.medium
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Project Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="projectName">Project Name *</Label>
              <Input
                id="projectName"
                placeholder="E-commerce Website Redesign"
                value={projectData.name}
                onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="clientType">Client Type *</Label>
              <select
                id="clientType"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={projectData.clientType}
                onChange={(e) => setProjectData({ ...projectData, clientType: e.target.value })}
              >
                <option value="startup">Startup</option>
                <option value="small-business">Small Business</option>
                <option value="enterprise">Enterprise</option>
                <option value="agency">Agency</option>
                <option value="individual">Individual</option>
              </select>
            </div>

            <div>
              <Label htmlFor="budget">Budget (USD) *</Label>
              <Input
                id="budget"
                type="number"
                placeholder="10000"
                value={projectData.budget}
                onChange={(e) => setProjectData({ ...projectData, budget: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="timeline">Timeline (days) *</Label>
              <Input
                id="timeline"
                type="number"
                placeholder="30"
                value={projectData.timeline}
                onChange={(e) => setProjectData({ ...projectData, timeline: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="scope">Project Scope (Optional)</Label>
            <Textarea
              id="scope"
              placeholder="Brief description of what needs to be done..."
              value={projectData.scope}
              onChange={(e) => setProjectData({ ...projectData, scope: e.target.value })}
              rows={3}
            />
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing with AI...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Analyze Project
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {insights && (
        <div className="space-y-6">
          {/* Score Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-gray-600 mb-1">Profitability</div>
                <div className={`text-3xl font-bold ${getScoreColor(insights.profitabilityScore)} rounded px-2 inline-block`}>
                  {insights.profitabilityScore}
                </div>
                <div className="text-xs text-gray-500 mt-1">/100</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-gray-600 mb-1">Risk Level</div>
                <div className={`text-3xl font-bold ${getScoreColor(100 - insights.riskScore)} rounded px-2 inline-block`}>
                  {insights.riskScore}
                </div>
                <div className="text-xs text-gray-500 mt-1">/100</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-gray-600 mb-1">Est. Profit</div>
                <div className="text-2xl font-bold text-green-600">
                  ${insights.estimatedProfit.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {insights.estimatedMargin.toFixed(0)}% margin
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-gray-600 mb-1">Insights</div>
                <div className="text-2xl font-bold text-purple-600">
                  {insights.insights.length}
                </div>
                <div className="text-xs text-gray-500 mt-1">actionable items</div>
              </CardContent>
            </Card>
          </div>

          {/* Insights */}
          <Card>
            <CardHeader>
              <CardTitle>AI Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {insights.insights.map((insight: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {insight.category === 'profitability' && <TrendingUp className="w-5 h-5 text-green-600" />}
                      {insight.category === 'risk' && <AlertTriangle className="w-5 h-5 text-red-600" />}
                      {insight.category === 'opportunity' && <Target className="w-5 h-5 text-blue-600" />}
                      {insight.category === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-600" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold">{insight.title}</h4>
                        <Badge className={getImpactBadge(insight.impact)}>
                          {insight.impact} impact
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        {insight.description}
                      </p>
                      {insight.recommendation && (
                        <div className="flex items-start gap-2 mt-2 p-2 bg-blue-50 rounded">
                          <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-blue-900">
                            {insight.recommendation}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Key Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {insights.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                    <span className="text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
