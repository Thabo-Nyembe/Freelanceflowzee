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
import { Brain, DollarSign, TrendingUp, Target, ArrowUpRight, ArrowDownRight, Lightbulb, AlertCircle, Plus, Download, Settings, BarChart3 } from 'lucide-react'
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
    toast.success(`Created new ${newItemData.type}: "${newItemData.name}"`)
    logger.info('New business insight item created', { ...newItemData, userId })
    setNewItemData({ name: '', type: 'insight', description: '', priority: 'medium' })
    setNewItemDialogOpen(false)
  }

  // Handle export
  const handleExport = () => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 2000)),
      {
        loading: `Generating ${exportData.format.toUpperCase()} report...`,
        success: `AI insights exported as ${exportData.format.toUpperCase()}`,
        error: 'Export failed'
      }
    )
    logger.info('AI insights exported', { ...exportData, userId })
    setExportDialogOpen(false)
  }

  // Handle settings save
  const handleSaveSettings = () => {
    toast.success('AI Advisor settings saved')
    logger.info('AI Advisor settings updated', { ...settingsData, userId })
    setSettingsDialogOpen(false)
  }

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
            <Button onClick={handleExport} className="bg-blue-600 hover:bg-blue-700">
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
    </div>
  )
}
