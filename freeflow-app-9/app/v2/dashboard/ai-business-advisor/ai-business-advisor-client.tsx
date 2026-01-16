'use client'
// Enhanced & Competitive Upgrade Components
import {
  AIInsightsPanel,
  CollaborationIndicator,
  PredictiveAnalytics,
} from '@/components/ui/competitive-upgrades'

import {
  ActivityFeed,
  QuickActionsToolbar,
} from '@/components/ui/competitive-upgrades-extended'


export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Brain, DollarSign, TrendingUp, Target, ArrowUpRight, ArrowDownRight, Lightbulb, AlertCircle, Plus, Download, Settings, BarChart3, Eye, CheckCircle, Bell, RefreshCw, FileText, Share2, Bookmark, Play } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ProjectIntelligence } from '@/components/ai/project-intelligence'
import { PricingIntelligence } from '@/components/ai/pricing-intelligence'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

const logger = createFeatureLogger('AIBusinessAdvisor')


// ============================================================================
// V2 COMPETITIVE MOCK DATA - AiBusinessAdvisor Context
// ============================================================================

const aiBusinessAdvisorAIInsights = [
  { id: '1', type: 'info' as const, title: 'Performance Update', description: 'System running optimally with 99.9% uptime this month.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '2', type: 'success' as const, title: 'Goal Achievement', description: 'Monthly targets exceeded by 15%. Great progress!', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Goals' },
  { id: '3', type: 'warning' as const, title: 'Action Required', description: 'Review pending items to maintain workflow efficiency.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Tasks' },
]

const aiBusinessAdvisorCollaborators = [
  { id: '1', name: 'Alexandra Chen', avatar: '/avatars/alex.jpg', status: 'online' as const, role: 'Manager', lastActive: 'Now' },
  { id: '2', name: 'Marcus Johnson', avatar: '/avatars/marcus.jpg', status: 'online' as const, role: 'Developer', lastActive: '5m ago' },
  { id: '3', name: 'Sarah Williams', avatar: '/avatars/sarah.jpg', status: 'away' as const, role: 'Designer', lastActive: '30m ago' },
]

const aiBusinessAdvisorPredictions = [
  { id: '1', label: 'Completion Rate', current: 85, target: 95, predicted: 92, confidence: 88, trend: 'up' as const },
  { id: '2', label: 'Efficiency Score', current: 78, target: 90, predicted: 86, confidence: 82, trend: 'up' as const },
]

const aiBusinessAdvisorActivities = [
  { id: '1', user: 'Alexandra Chen', action: 'updated', target: 'system settings', timestamp: '5m ago', type: 'info' as const },
  { id: '2', user: 'Marcus Johnson', action: 'completed', target: 'task review', timestamp: '15m ago', type: 'success' as const },
  { id: '3', user: 'System', action: 'generated', target: 'weekly report', timestamp: '1h ago', type: 'info' as const },
]

// Quick actions will be defined inside the component to access useState setters

export default function AiBusinessAdvisorClient() {
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  // Dialog states
  const [newItemDialogOpen, setNewItemDialogOpen] = useState(false)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)

  // New Item form state
  const [newItemData, setNewItemData] = useState({
    name: '',
    type: 'insight',
    description: '',
    priority: 'medium'
  })

  // Export form state
  const [exportData, setExportData] = useState({
    format: 'pdf',
    dateRange: 'last30days',
    includeCharts: true,
    includeRecommendations: true
  })

  // Settings state
  const [settingsData, setSettingsData] = useState({
    autoAnalysis: true,
    notifyInsights: true,
    predictionFrequency: 'daily',
    confidenceThreshold: '75',
    enableAIRecommendations: true
  })

  // Additional dialog states for opportunities and risks
  const [opportunityDetailDialogOpen, setOpportunityDetailDialogOpen] = useState(false)
  const [riskDetailDialogOpen, setRiskDetailDialogOpen] = useState(false)
  const [shareInsightDialogOpen, setShareInsightDialogOpen] = useState(false)
  const [generateReportDialogOpen, setGenerateReportDialogOpen] = useState(false)
  const [selectedOpportunity, setSelectedOpportunity] = useState<{title: string; impact: string; confidence: number; description: string} | null>(null)
  const [selectedRisk, setSelectedRisk] = useState<{title: string; severity: string; action: string} | null>(null)

  // Share insight form state
  const [shareData, setShareData] = useState({
    email: '',
    message: '',
    includeAnalysis: true
  })

  // Report generation state
  const [reportData, setReportData] = useState({
    reportType: 'comprehensive',
    focus: 'all',
    timeframe: 'quarterly'
  })

  // Quick actions with dialog openers
  const aiBusinessAdvisorQuickActions = [
    { id: '1', label: 'New Item', icon: 'Plus', shortcut: 'N', action: () => setNewItemDialogOpen(true) },
    { id: '2', label: 'Export', icon: 'Download', shortcut: 'E', action: () => setExportDialogOpen(true) },
    { id: '3', label: 'Settings', icon: 'Settings', shortcut: 'S', action: () => setSettingsDialogOpen(true) },
  ]

  // Handle new item creation
  const handleCreateItem = () => {
    if (!newItemData.name.trim()) {
      toast.error('Please enter an item name')
      return
    }
    toast.success(`Created new ${newItemData.type}: "${newItemData.name}"`)    setNewItemData({ name: '', type: 'insight', description: '', priority: 'medium' })
    setNewItemDialogOpen(false)
  }

  // Handle export
  const handleExport = () => {
    toast.promise(
      fetch(`/api/ai-advisor?action=export&format=${exportData.format}`)
        .then(res => {
          if (!res.ok) throw new Error('Export failed')
          return exportData.format === 'csv' ? res.text() : res.json()
        })
        .then(data => {
          const content = exportData.format === 'csv' ? data : JSON.stringify(data, null, 2)
          const blob = new Blob([content], { type: exportData.format === 'csv' ? 'text/csv' : 'application/json' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `ai-insights.${exportData.format}`
          a.click()
          URL.revokeObjectURL(url)
        }),
      {
        loading: `Generating ${exportData.format.toUpperCase()} report...`,
        success: `AI insights exported as ${exportData.format.toUpperCase()}`,
        error: 'Export failed'
      }
    )    setExportDialogOpen(false)
  }

  // Handle settings save
  const handleSaveSettings = () => {
    toast.success('AI Advisor settings saved')    setSettingsDialogOpen(false)
  }

  // Handle opportunity actions
  const handleViewOpportunity = (opp: {title: string; impact: string; confidence: number; description: string}) => {
    setSelectedOpportunity(opp)
    setOpportunityDetailDialogOpen(true)
  }

  const handleImplementOpportunity = (title: string) => {
    toast.promise(
      fetch('/api/ai-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'implement_opportunity', title })
      }).then(res => {
        if (!res.ok) throw new Error('Failed')
        return res.json()
      }),
      {
        loading: 'Creating implementation plan...',
        success: `Implementation plan created for "${title}"`,
        error: 'Failed to create plan'
      }
    )  }

  const handleBookmarkOpportunity = (title: string) => {
    toast.success(`Bookmarked: "${title}"`)  }

  // Handle risk actions
  const handleViewRisk = (risk: {title: string; severity: string; action: string}) => {
    setSelectedRisk(risk)
    setRiskDetailDialogOpen(true)
  }

  const handleAcknowledgeRisk = (title: string) => {
    toast.success(`Risk acknowledged: "${title}"`)  }

  const handleSetRiskAlert = (title: string) => {
    toast.success(`Alert set for: "${title}"`)  }

  // Handle share insight
  const handleShareInsight = () => {
    if (!shareData.email.trim()) {
      toast.error('Please enter an email address')
      return
    }
    toast.promise(
      fetch('/api/ai-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'share_insight', ...shareData })
      }).then(res => {
        if (!res.ok) throw new Error('Failed')
        return res.json()
      }),
      {
        loading: 'Sending insight...',
        success: `Insight shared with ${shareData.email}`,
        error: 'Failed to share insight'
      }
    )    setShareData({ email: '', message: '', includeAnalysis: true })
    setShareInsightDialogOpen(false)
  }

  // Handle generate report
  const handleGenerateReport = () => {
    toast.promise(
      fetch('/api/ai-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate_report', ...reportData })
      }).then(res => {
        if (!res.ok) throw new Error('Failed')
        return res.json()
      }),
      {
        loading: 'Generating AI report...',
        success: 'AI Business Report generated successfully',
        error: 'Report generation failed'
      }
    )    setGenerateReportDialogOpen(false)
  }

  // Handle refresh insights
  const handleRefreshInsights = () => {
    toast.promise(
      fetch('/api/ai-advisor?action=insights')
        .then(res => {
          if (!res.ok) throw new Error('Failed')
          return res.json()
        }),
      {
        loading: 'Refreshing AI insights...',
        success: 'Insights updated with latest data',
        error: 'Failed to refresh insights'
      }
    )  }

  // Handle metric card click
  const handleMetricClick = (metricLabel: string) => {
    toast.info(`Viewing detailed analytics for: ${metricLabel}`)  }

  useEffect(() => {
    if (userId) {      announce('AI Business Advisor loaded', 'polite')
    }
  }, [userId, announce])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">AI Business Advisor</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshInsights}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShareInsightDialogOpen(true)}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setGenerateReportDialogOpen(true)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Report
            </Button>
            <Button
              size="sm"
              onClick={() => setNewItemDialogOpen(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Insight
            </Button>
          </div>
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
            
        {/* V2 Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <AIInsightsPanel insights={aiBusinessAdvisorAIInsights} />
          <PredictiveAnalytics predictions={aiBusinessAdvisorPredictions} />
          <CollaborationIndicator collaborators={aiBusinessAdvisorCollaborators} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <QuickActionsToolbar actions={aiBusinessAdvisorQuickActions} />
          <ActivityFeed activities={aiBusinessAdvisorActivities} />
        </div>
{/* Growth Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Revenue Growth', value: '+23%', trend: 'up', color: 'text-green-600', bgColor: 'bg-green-50' },
                { label: 'Client Retention', value: '94%', trend: 'up', color: 'text-blue-600', bgColor: 'bg-blue-50' },
                { label: 'Market Position', value: 'Top 15%', trend: 'up', color: 'text-purple-600', bgColor: 'bg-purple-50' },
                { label: 'Profit Margin', value: '32%', trend: 'down', color: 'text-orange-600', bgColor: 'bg-orange-50' }
              ].map((metric, i) => (
                <Card
                  key={i}
                  className={`${metric.bgColor} cursor-pointer hover:shadow-md transition-shadow`}
                  onClick={() => handleMetricClick(metric.label)}
                >
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
                      <div className="flex items-center gap-2 mb-3">
                        <Progress value={opp.confidence} className="flex-1 h-2" />
                        <span className="text-xs text-gray-500">{opp.confidence}% confidence</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewOpportunity(opp)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleImplementOpportunity(opp.title)}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Implement
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleBookmarkOpportunity(opp.title)}
                        >
                          <Bookmark className="h-3 w-3" />
                        </Button>
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
                      <p className="text-sm text-gray-600 mb-3">{risk.action}</p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewRisk(risk)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAcknowledgeRisk(risk.title)}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Acknowledge
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSetRiskAlert(risk.title)}
                        >
                          <Bell className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* New Item Dialog */}
      <Dialog open={newItemDialogOpen} onOpenChange={setNewItemDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-purple-600" />
              Create New Business Insight
            </DialogTitle>
            <DialogDescription>
              Add a new insight, goal, or action item to track in your AI Business Advisor.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="item-name">Name</Label>
              <Input
                id="item-name"
                placeholder="Enter insight name..."
                value={newItemData.name}
                onChange={(e) => setNewItemData({ ...newItemData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="item-type">Type</Label>
              <Select
                value={newItemData.type}
                onValueChange={(value) => setNewItemData({ ...newItemData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="insight">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Insight
                    </div>
                  </SelectItem>
                  <SelectItem value="goal">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Goal
                    </div>
                  </SelectItem>
                  <SelectItem value="metric">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Metric
                    </div>
                  </SelectItem>
                  <SelectItem value="opportunity">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Opportunity
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="item-priority">Priority</Label>
              <Select
                value={newItemData.priority}
                onValueChange={(value) => setNewItemData({ ...newItemData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="item-description">Description</Label>
              <Textarea
                id="item-description"
                placeholder="Describe the insight or goal..."
                value={newItemData.description}
                onChange={(e) => setNewItemData({ ...newItemData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewItemDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateItem} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-600" />
              Export AI Insights Report
            </DialogTitle>
            <DialogDescription>
              Generate a comprehensive report of your business insights and AI recommendations.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="export-format">Export Format</Label>
              <Select
                value={exportData.format}
                onValueChange={(value) => setExportData({ ...exportData, format: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Document</SelectItem>
                  <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                  <SelectItem value="csv">CSV File</SelectItem>
                  <SelectItem value="json">JSON Data</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date-range">Date Range</Label>
              <Select
                value={exportData.dateRange}
                onValueChange={(value) => setExportData({ ...exportData, dateRange: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last7days">Last 7 Days</SelectItem>
                  <SelectItem value="last30days">Last 30 Days</SelectItem>
                  <SelectItem value="last90days">Last 90 Days</SelectItem>
                  <SelectItem value="lastYear">Last Year</SelectItem>
                  <SelectItem value="allTime">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Include Charts & Visualizations</Label>
                  <p className="text-sm text-gray-500">Add graphs and trend charts to the report</p>
                </div>
                <Switch
                  checked={exportData.includeCharts}
                  onCheckedChange={(checked) => setExportData({ ...exportData, includeCharts: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Include AI Recommendations</Label>
                  <p className="text-sm text-gray-500">Add AI-generated insights and suggestions</p>
                </div>
                <Switch
                  checked={exportData.includeRecommendations}
                  onCheckedChange={(checked) => setExportData({ ...exportData, includeRecommendations: checked })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport} className="bg-blue-600 hover:bg-blue-700" aria-label="Export data">
                  <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-gray-600" />
              AI Advisor Settings
            </DialogTitle>
            <DialogDescription>
              Configure how the AI Business Advisor analyzes your data and provides recommendations.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Automatic Analysis</Label>
                  <p className="text-sm text-gray-500">Continuously analyze business data for insights</p>
                </div>
                <Switch
                  checked={settingsData.autoAnalysis}
                  onCheckedChange={(checked) => setSettingsData({ ...settingsData, autoAnalysis: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Insight Notifications</Label>
                  <p className="text-sm text-gray-500">Receive alerts when new insights are discovered</p>
                </div>
                <Switch
                  checked={settingsData.notifyInsights}
                  onCheckedChange={(checked) => setSettingsData({ ...settingsData, notifyInsights: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>AI Recommendations</Label>
                  <p className="text-sm text-gray-500">Enable AI-powered business recommendations</p>
                </div>
                <Switch
                  checked={settingsData.enableAIRecommendations}
                  onCheckedChange={(checked) => setSettingsData({ ...settingsData, enableAIRecommendations: checked })}
                />
              </div>
            </div>
            <div className="grid gap-2 pt-2">
              <Label htmlFor="prediction-frequency">Prediction Update Frequency</Label>
              <Select
                value={settingsData.predictionFrequency}
                onValueChange={(value) => setSettingsData({ ...settingsData, predictionFrequency: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="realtime">Real-time</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confidence-threshold">Confidence Threshold (%)</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="confidence-threshold"
                  type="number"
                  min="0"
                  max="100"
                  value={settingsData.confidenceThreshold}
                  onChange={(e) => setSettingsData({ ...settingsData, confidenceThreshold: e.target.value })}
                  className="w-24"
                />
                <p className="text-sm text-gray-500">
                  Only show predictions with confidence above this threshold
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings}>
              <Settings className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Opportunity Detail Dialog */}
      <Dialog open={opportunityDetailDialogOpen} onOpenChange={setOpportunityDetailDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Growth Opportunity Details
            </DialogTitle>
            <DialogDescription>
              Detailed analysis and implementation recommendations for this opportunity.
            </DialogDescription>
          </DialogHeader>
          {selectedOpportunity && (
            <div className="py-4 space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedOpportunity.title}</h3>
                <Badge className="mt-2" variant={selectedOpportunity.impact === 'High' ? 'default' : 'secondary'}>
                  {selectedOpportunity.impact} Impact
                </Badge>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Description</Label>
                <p className="mt-1">{selectedOpportunity.description}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">AI Confidence Score</Label>
                <div className="flex items-center gap-3 mt-1">
                  <Progress value={selectedOpportunity.confidence} className="flex-1 h-3" />
                  <span className="font-semibold">{selectedOpportunity.confidence}%</span>
                </div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <Label className="text-sm text-purple-700 font-medium">AI Recommendation</Label>
                <p className="mt-1 text-sm text-purple-600">
                  Based on your current metrics, implementing this opportunity could result in
                  a {selectedOpportunity.impact === 'High' ? '25-40%' : '10-20%'} improvement in related KPIs
                  within the next quarter.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpportunityDetailDialogOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                if (selectedOpportunity) {
                  handleImplementOpportunity(selectedOpportunity.title)
                }
                setOpportunityDetailDialogOpen(false)
              }}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Implementation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Risk Detail Dialog */}
      <Dialog open={riskDetailDialogOpen} onOpenChange={setRiskDetailDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Risk Alert Details
            </DialogTitle>
            <DialogDescription>
              Detailed risk analysis and recommended mitigation strategies.
            </DialogDescription>
          </DialogHeader>
          {selectedRisk && (
            <div className="py-4 space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedRisk.title}</h3>
                <Badge
                  className="mt-2"
                  variant={selectedRisk.severity === 'High' ? 'destructive' : selectedRisk.severity === 'Medium' ? 'default' : 'secondary'}
                >
                  {selectedRisk.severity} Severity
                </Badge>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Recommended Action</Label>
                <p className="mt-1">{selectedRisk.action}</p>
              </div>
              <div className={`p-4 rounded-lg ${
                selectedRisk.severity === 'High' ? 'bg-red-50' :
                selectedRisk.severity === 'Medium' ? 'bg-yellow-50' : 'bg-blue-50'
              }`}>
                <Label className={`text-sm font-medium ${
                  selectedRisk.severity === 'High' ? 'text-red-700' :
                  selectedRisk.severity === 'Medium' ? 'text-yellow-700' : 'text-blue-700'
                }`}>AI Mitigation Strategy</Label>
                <p className={`mt-1 text-sm ${
                  selectedRisk.severity === 'High' ? 'text-red-600' :
                  selectedRisk.severity === 'Medium' ? 'text-yellow-600' : 'text-blue-600'
                }`}>
                  {selectedRisk.severity === 'High'
                    ? 'Immediate attention required. Consider scheduling a strategy session to address this risk within the next 2 weeks.'
                    : selectedRisk.severity === 'Medium'
                    ? 'Monitor closely and implement preventive measures within the next month.'
                    : 'Add to quarterly review agenda and track progress over time.'}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRiskDetailDialogOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                if (selectedRisk) {
                  handleAcknowledgeRisk(selectedRisk.title)
                }
                setRiskDetailDialogOpen(false)
              }}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Acknowledge & Monitor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Insight Dialog */}
      <Dialog open={shareInsightDialogOpen} onOpenChange={setShareInsightDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-blue-600" />
              Share AI Insights
            </DialogTitle>
            <DialogDescription>
              Share your business insights and AI recommendations with team members or stakeholders.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="share-email">Recipient Email</Label>
              <Input
                id="share-email"
                type="email"
                placeholder="colleague@company.com"
                value={shareData.email}
                onChange={(e) => setShareData({ ...shareData, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="share-message">Personal Message (Optional)</Label>
              <Textarea
                id="share-message"
                placeholder="Add a note about these insights..."
                value={shareData.message}
                onChange={(e) => setShareData({ ...shareData, message: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Include AI Analysis</Label>
                <p className="text-sm text-gray-500">Share detailed AI-generated insights and charts</p>
              </div>
              <Switch
                checked={shareData.includeAnalysis}
                onCheckedChange={(checked) => setShareData({ ...shareData, includeAnalysis: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareInsightDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleShareInsight} className="bg-blue-600 hover:bg-blue-700">
              <Share2 className="h-4 w-4 mr-2" />
              Send Insights
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate Report Dialog */}
      <Dialog open={generateReportDialogOpen} onOpenChange={setGenerateReportDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              Generate AI Business Report
            </DialogTitle>
            <DialogDescription>
              Create a comprehensive AI-powered business intelligence report.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="report-type">Report Type</Label>
              <Select
                value={reportData.reportType}
                onValueChange={(value) => setReportData({ ...reportData, reportType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comprehensive">Comprehensive Analysis</SelectItem>
                  <SelectItem value="executive">Executive Summary</SelectItem>
                  <SelectItem value="actionable">Action Items Only</SelectItem>
                  <SelectItem value="trends">Trends & Forecasts</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="report-focus">Focus Area</Label>
              <Select
                value={reportData.focus}
                onValueChange={(value) => setReportData({ ...reportData, focus: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select focus area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Areas</SelectItem>
                  <SelectItem value="growth">Growth & Opportunities</SelectItem>
                  <SelectItem value="risk">Risk Assessment</SelectItem>
                  <SelectItem value="financial">Financial Insights</SelectItem>
                  <SelectItem value="operations">Operational Efficiency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="report-timeframe">Time Frame</Label>
              <Select
                value={reportData.timeframe}
                onValueChange={(value) => setReportData({ ...reportData, timeframe: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time frame" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateReportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateReport} className="bg-green-600 hover:bg-green-700">
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
