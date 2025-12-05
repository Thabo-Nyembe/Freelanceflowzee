'use client'

import React, { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Brain, DollarSign, TrendingUp, Zap, Target, Users, ArrowUpRight, ArrowDownRight, Lightbulb, CheckCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { ProjectIntelligence } from '@/components/ai/project-intelligence'
import { PricingIntelligence } from '@/components/ai/pricing-intelligence'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('AIBusinessAdvisor')

export default function AIBusinessAdvisorPage() {
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  useEffect(() => {
    if (userId) {
      logger.info('AI Business Advisor page loaded', { userId })
      announce('AI Business Advisor loaded', 'polite')
    }
  }, [userId, announce])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">AI Business Advisor</h1>
        </div>
        <p className="text-gray-600">
          Get intelligent insights to grow your business, optimize projects, and maximize profitability
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="project" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="project">
            <Brain className="w-4 h-4 mr-2" />
            Project Intelligence
          </TabsTrigger>
          <TabsTrigger value="pricing">
            <DollarSign className="w-4 h-4 mr-2" />
            Pricing Strategy
          </TabsTrigger>
          <TabsTrigger value="growth">
            <TrendingUp className="w-4 h-4 mr-2" />
            Growth Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="project" className="mt-6">
          <ProjectIntelligence />
        </TabsContent>

        <TabsContent value="pricing" className="mt-6">
          <PricingIntelligence />
        </TabsContent>

        <TabsContent value="growth" className="mt-6">
          <div className="space-y-6">
            {/* Growth Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Revenue Growth', value: '+23%', trend: 'up', color: 'text-green-600', bgColor: 'bg-green-50' },
                { label: 'Client Retention', value: '94%', trend: 'up', color: 'text-blue-600', bgColor: 'bg-blue-50' },
                { label: 'Market Position', value: 'Top 15%', trend: 'up', color: 'text-purple-600', bgColor: 'bg-purple-50' },
                { label: 'Profit Margin', value: '32%', trend: 'down', color: 'text-orange-600', bgColor: 'bg-orange-50' }
              ].map((metric, i) => (
                <Card key={i} className={metric.bgColor}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">{metric.label}</span>
                      {metric.trend === 'up' ? (
                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <div className={`text-2xl font-bold ${metric.color}`}>{metric.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Growth Forecast */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  12-Month Growth Forecast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-end justify-between gap-2 mb-4">
                  {[
                    { month: 'Jan', actual: 45, forecast: 48 },
                    { month: 'Feb', actual: 52, forecast: 55 },
                    { month: 'Mar', actual: 48, forecast: 52 },
                    { month: 'Apr', actual: 58, forecast: 60 },
                    { month: 'May', actual: 62, forecast: 65 },
                    { month: 'Jun', actual: 68, forecast: 72 },
                    { month: 'Jul', actual: null, forecast: 78 },
                    { month: 'Aug', actual: null, forecast: 82 },
                    { month: 'Sep', actual: null, forecast: 85 },
                    { month: 'Oct', actual: null, forecast: 88 },
                    { month: 'Nov', actual: null, forecast: 92 },
                    { month: 'Dec', actual: null, forecast: 95 }
                  ].map((data, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex gap-0.5" style={{ height: '100%' }}>
                        {data.actual && (
                          <div
                            className="flex-1 bg-purple-500 rounded-t"
                            style={{ height: `${data.actual}%` }}
                          />
                        )}
                        <div
                          className={`flex-1 ${data.actual ? 'bg-purple-200' : 'bg-gradient-to-t from-purple-300 to-purple-100'} rounded-t`}
                          style={{ height: `${data.forecast}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-500">{data.month}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded" />
                    <span>Actual</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-200 rounded" />
                    <span>AI Forecast</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    Growth Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { title: 'Expand to Enterprise Market', impact: 'High', confidence: 87, description: 'Your portfolio suggests readiness for larger clients' },
                    { title: 'Add Subscription Services', impact: 'High', confidence: 82, description: 'Recurring revenue could increase by 40%' },
                    { title: 'Partner with Agencies', impact: 'Medium', confidence: 75, description: 'Potential for 3x client referrals' }
                  ].map((opp, i) => (
                    <div key={i} className="p-4 rounded-lg border bg-white hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{opp.title}</h4>
                        <Badge variant={opp.impact === 'High' ? 'default' : 'secondary'}>{opp.impact}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{opp.description}</p>
                      <div className="flex items-center gap-2">
                        <Progress value={opp.confidence} className="flex-1 h-2" />
                        <span className="text-xs text-gray-500">{opp.confidence}% confidence</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-red-500" />
                    Risk Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { title: 'Client Concentration Risk', severity: 'High', action: 'Diversify client base - top 3 clients = 65% revenue' },
                    { title: 'Seasonal Revenue Dip', severity: 'Medium', action: 'Q1 typically sees 20% drop - plan campaigns' },
                    { title: 'Skill Gap Emerging', severity: 'Low', action: 'AI/ML skills in demand - consider upskilling' }
                  ].map((risk, i) => (
                    <div key={i} className={`p-4 rounded-lg border-l-4 ${
                      risk.severity === 'High' ? 'border-l-red-500 bg-red-50' :
                      risk.severity === 'Medium' ? 'border-l-yellow-500 bg-yellow-50' :
                      'border-l-blue-500 bg-blue-50'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className={`w-4 h-4 ${
                          risk.severity === 'High' ? 'text-red-500' :
                          risk.severity === 'Medium' ? 'text-yellow-500' :
                          'text-blue-500'
                        }`} />
                        <h4 className="font-medium">{risk.title}</h4>
                      </div>
                      <p className="text-sm text-gray-600">{risk.action}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
