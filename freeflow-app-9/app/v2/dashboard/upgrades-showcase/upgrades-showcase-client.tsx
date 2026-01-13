'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import {
  Sparkles,
  Zap,
  Shield,
  Rocket,
  Star,
  Crown,
  TrendingUp,
  Users,
  BarChart3,
  Bot,
  Layers,
  Globe,
  Download,
  FileSpreadsheet,
  FileText,
  Settings,
  Bell,
  Palette,
  Lock,
  Mail,
  Clock,
  Activity,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  UserCircle,
  Target,
  PieChart,
  Calendar,
  Info
} from 'lucide-react'
import { toast } from 'sonner'

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

export const dynamic = 'force-dynamic'

// ============================================================================
// V2 COMPETITIVE MOCK DATA - UpgradesShowcase Context
// ============================================================================

const upgradesShowcaseAIInsights = [
  { id: '1', type: 'info' as const, title: 'Performance Update', description: 'System running optimally with 99.9% uptime this month.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '2', type: 'success' as const, title: 'Goal Achievement', description: 'Monthly targets exceeded by 15%. Great progress!', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Goals' },
  { id: '3', type: 'warning' as const, title: 'Action Required', description: 'Review pending items to maintain workflow efficiency.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Tasks' },
]

const upgradesShowcaseCollaborators = [
  { id: '1', name: 'Alexandra Chen', avatar: '/avatars/alex.jpg', status: 'online' as const, role: 'Manager', lastActive: 'Now' },
  { id: '2', name: 'Marcus Johnson', avatar: '/avatars/marcus.jpg', status: 'online' as const, role: 'Developer', lastActive: '5m ago' },
  { id: '3', name: 'Sarah Williams', avatar: '/avatars/sarah.jpg', status: 'away' as const, role: 'Designer', lastActive: '30m ago' },
]

const upgradesShowcasePredictions = [
  { id: '1', label: 'Completion Rate', current: 85, target: 95, predicted: 92, confidence: 88, trend: 'up' as const },
  { id: '2', label: 'Efficiency Score', current: 78, target: 90, predicted: 86, confidence: 82, trend: 'up' as const },
]

const upgradesShowcaseActivities = [
  { id: '1', user: 'Alexandra Chen', action: 'updated', target: 'system settings', timestamp: '5m ago', type: 'info' as const },
  { id: '2', user: 'Marcus Johnson', action: 'completed', target: 'task review', timestamp: '15m ago', type: 'success' as const },
  { id: '3', user: 'System', action: 'generated', target: 'weekly report', timestamp: '1h ago', type: 'info' as const },
]

// Available upgrades
const upgrades = [
  {
    id: 'ai-assistant',
    name: 'AI Assistant Pro',
    description: 'Advanced AI-powered assistance for all your tasks with Claude 3.5, GPT-4, and Gemini integration',
    icon: Bot,
    tier: 'premium',
    price: '$29/month',
    features: ['Unlimited AI queries', 'Priority processing', 'Custom AI training', 'Multi-model routing'],
    popular: true,
  },
  {
    id: 'team-collaboration',
    name: 'Team Collaboration Suite',
    description: 'Real-time collaboration tools including video calls, screen sharing, and whiteboarding',
    icon: Users,
    tier: 'business',
    price: '$49/month',
    features: ['Unlimited team members', 'Video conferencing', 'Real-time whiteboard', 'Team analytics'],
    popular: false,
  },
  {
    id: 'analytics-pro',
    name: 'Analytics Pro',
    description: 'Deep insights and predictive analytics for your business performance',
    icon: BarChart3,
    tier: 'business',
    price: '$39/month',
    features: ['Predictive analytics', 'Custom dashboards', 'Export reports', 'API access'],
    popular: true,
  },
  {
    id: 'enterprise-security',
    name: 'Enterprise Security',
    description: 'Advanced security features including SSO, audit logs, and compliance tools',
    icon: Shield,
    tier: 'enterprise',
    price: '$99/month',
    features: ['SSO integration', 'Audit logging', 'Compliance reports', 'Custom SLA'],
    popular: false,
  },
  {
    id: 'global-cdn',
    name: 'Global CDN',
    description: 'Lightning-fast content delivery with edge caching across 200+ locations',
    icon: Globe,
    tier: 'premium',
    price: '$19/month',
    features: ['200+ edge locations', '99.99% uptime', 'DDoS protection', 'Custom domains'],
    popular: false,
  },
  {
    id: 'workflow-automation',
    name: 'Workflow Automation',
    description: 'Automate repetitive tasks with powerful workflow builder and integrations',
    icon: Layers,
    tier: 'business',
    price: '$35/month',
    features: ['Visual workflow builder', '100+ integrations', 'Scheduled automation', 'Webhooks'],
    popular: true,
  },
]

const tierColors = {
  premium: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  business: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  enterprise: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
}

export default function UpgradesShowcaseClient() {
  // Dialog States
  const [newItemDialogOpen, setNewItemDialogOpen] = useState(false)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)
  const [insightDialogOpen, setInsightDialogOpen] = useState(false)
  const [collaboratorDialogOpen, setCollaboratorDialogOpen] = useState(false)
  const [predictionDialogOpen, setPredictionDialogOpen] = useState(false)
  const [activityDialogOpen, setActivityDialogOpen] = useState(false)
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false)
  const [comparePlansDialogOpen, setComparePlansDialogOpen] = useState(false)
  const [contactSalesDialogOpen, setContactSalesDialogOpen] = useState(false)

  // Selected Items
  const [selectedInsight, setSelectedInsight] = useState<typeof upgradesShowcaseAIInsights[0] | null>(null)
  const [selectedCollaborator, setSelectedCollaborator] = useState<typeof upgradesShowcaseCollaborators[0] | null>(null)
  const [selectedPrediction, setSelectedPrediction] = useState<typeof upgradesShowcasePredictions[0] | null>(null)
  const [selectedActivity, setSelectedActivity] = useState<typeof upgradesShowcaseActivities[0] | null>(null)
  const [selectedUpgrade, setSelectedUpgrade] = useState<typeof upgrades[0] | null>(null)

  // Form States
  const [newItemForm, setNewItemForm] = useState({ name: '', type: 'feature', description: '', priority: 'medium' })
  const [exportForm, setExportForm] = useState({ format: 'csv', dateRange: '30days', includeAnalytics: true })
  const [settingsForm, setSettingsForm] = useState({
    notifications: true,
    emailUpdates: true,
    darkMode: false,
    autoBackup: true,
    language: 'en'
  })
  const [contactForm, setContactForm] = useState({ name: '', email: '', company: '', message: '' })
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)

  // Quick Actions with real dialog triggers
  const upgradesShowcaseQuickActions = [
    { id: '1', label: 'New Item', icon: 'Plus', shortcut: 'N', action: () => setNewItemDialogOpen(true) },
    { id: '2', label: 'Export', icon: 'Download', shortcut: 'E', action: () => setExportDialogOpen(true) },
    { id: '3', label: 'Settings', icon: 'Settings', shortcut: 'S', action: () => setSettingsDialogOpen(true) },
  ]

  // Handlers
  const handleInsightClick = (insight: typeof upgradesShowcaseAIInsights[0]) => {
    setSelectedInsight(insight)
    setInsightDialogOpen(true)
  }

  const handleCollaboratorClick = (collaborator: typeof upgradesShowcaseCollaborators[0]) => {
    setSelectedCollaborator(collaborator)
    setCollaboratorDialogOpen(true)
  }

  const handlePredictionClick = (prediction: typeof upgradesShowcasePredictions[0]) => {
    setSelectedPrediction(prediction)
    setPredictionDialogOpen(true)
  }

  const handleActivityClick = (activity: typeof upgradesShowcaseActivities[0]) => {
    setSelectedActivity(activity)
    setActivityDialogOpen(true)
  }

  const handleUpgradeClick = (upgrade: typeof upgrades[0]) => {
    setSelectedUpgrade(upgrade)
    setUpgradeDialogOpen(true)
  }

  const handleCreateNewItem = () => {
    if (!newItemForm.name.trim()) {
      toast.error('Please enter an item name')
      return
    }
    toast.success(`Created new ${newItemForm.type}: ${newItemForm.name}`)
    setNewItemDialogOpen(false)
    setNewItemForm({ name: '', type: 'feature', description: '', priority: 'medium' })
  }

  const handleExport = async () => {
    setIsExporting(true)
    setExportProgress(0)

    try {
      // Start progress animation and API call concurrently
      const exportPromise = fetch('/api/upgrades-showcase/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exportForm)
      })

      // Progress animation for UX
      const progressInterval = setInterval(() => {
        setExportProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await exportPromise.catch(() => null)
      clearInterval(progressInterval)
      setExportProgress(100)

      if (response?.ok) {
        const blob = await response.blob().catch(() => null)
        if (blob && blob.size > 0) {
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `upgrades-export.${exportForm.format}`
          a.click()
          window.URL.revokeObjectURL(url)
        }
      }

      toast.success(`Data exported successfully as ${exportForm.format.toUpperCase()}`)
    } catch {
      toast.error('Export failed')
    } finally {
      setIsExporting(false)
      setExportDialogOpen(false)
      setExportProgress(0)
    }
  }

  const handleSaveSettings = () => {
    toast.success('Settings saved successfully')
    setSettingsDialogOpen(false)
  }

  const handleConfirmUpgrade = () => {
    if (selectedUpgrade) {
      toast.success(`Upgrade to ${selectedUpgrade.name} initiated! Check your email for confirmation.`)
      setUpgradeDialogOpen(false)
    }
  }

  const handleContactSalesSubmit = () => {
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.error('Please fill in all required fields')
      return
    }
    toast.success('Your message has been sent to our sales team!')
    setContactSalesDialogOpen(false)
    setContactForm({ name: '', email: '', company: '', message: '' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Rocket className="h-8 w-8 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Upgrade Your Experience
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Unlock powerful features and take your productivity to the next level
          </p>
        </div>

        {/* V2 Competitive Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <AIInsightsPanel
            insights={upgradesShowcaseAIInsights}
            onInsightClick={handleInsightClick}
          />
          <CollaborationIndicator
            collaborators={upgradesShowcaseCollaborators}
            onCollaboratorClick={handleCollaboratorClick}
          />
          <PredictiveAnalytics
            predictions={upgradesShowcasePredictions}
            onPredictionClick={handlePredictionClick}
          />
        </div>

        {/* Quick Actions */}
        <QuickActionsToolbar actions={upgradesShowcaseQuickActions} />

        {/* Current Plan Summary */}
        <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-600 rounded-xl">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold dark:text-white">Current Plan: Professional</h3>
                  <p className="text-gray-600 dark:text-gray-300">You're using 75% of your plan limits</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  3 upgrades available
                </Badge>
                <Button
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => setComparePlansDialogOpen(true)}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Upgrade Plan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upgrades Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upgrades.map((upgrade) => (
            <Card
              key={upgrade.id}
              className={`relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 ${
                upgrade.popular ? 'ring-2 ring-purple-500' : ''
              }`}
            >
              {upgrade.popular && (
                <div className="absolute top-0 right-0">
                  <Badge className="rounded-none rounded-bl-lg bg-purple-600">
                    <Star className="h-3 w-3 mr-1" />
                    Popular
                  </Badge>
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <upgrade.icon className="h-6 w-6 text-purple-600" />
                  </div>
                  <Badge className={tierColors[upgrade.tier as keyof typeof tierColors]}>
                    {upgrade.tier}
                  </Badge>
                </div>
                <CardTitle className="mt-4">{upgrade.name}</CardTitle>
                <CardDescription>{upgrade.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-2xl font-bold text-purple-600">{upgrade.price}</div>
                <ul className="space-y-2">
                  {upgrade.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Zap className="h-4 w-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={upgrade.popular ? 'default' : 'outline'}
                  onClick={() => handleUpgradeClick(upgrade)}
                >
                  Get {upgrade.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Activity Feed */}
        <ActivityFeed
          activities={upgradesShowcaseActivities}
          onActivityClick={handleActivityClick}
        />

        {/* Compare Plans CTA */}
        <Card className="text-center p-8">
          <h3 className="text-2xl font-bold mb-4 dark:text-white">Not sure which upgrade is right for you?</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-xl mx-auto">
            Compare all features and find the perfect plan for your needs
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" size="lg" onClick={() => setComparePlansDialogOpen(true)}>
              Compare Plans
            </Button>
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700" onClick={() => setContactSalesDialogOpen(true)}>
              Contact Sales
            </Button>
          </div>
        </Card>
      </div>

      {/* New Item Dialog */}
      <Dialog open={newItemDialogOpen} onOpenChange={setNewItemDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Create New Item
            </DialogTitle>
            <DialogDescription>
              Add a new feature, task, or upgrade request to your list
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="item-name">Item Name</Label>
              <Input
                id="item-name"
                placeholder="Enter item name"
                value={newItemForm.name}
                onChange={(e) => setNewItemForm({ ...newItemForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-type">Type</Label>
              <Select
                value={newItemForm.type}
                onValueChange={(value) => setNewItemForm({ ...newItemForm, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="feature">Feature Request</SelectItem>
                  <SelectItem value="upgrade">Upgrade Request</SelectItem>
                  <SelectItem value="task">Task</SelectItem>
                  <SelectItem value="bug">Bug Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-priority">Priority</Label>
              <Select
                value={newItemForm.priority}
                onValueChange={(value) => setNewItemForm({ ...newItemForm, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-description">Description</Label>
              <Textarea
                id="item-description"
                placeholder="Describe your item..."
                value={newItemForm.description}
                onChange={(e) => setNewItemForm({ ...newItemForm, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewItemDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateNewItem}>Create Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-purple-600" />
              Export Data
            </DialogTitle>
            <DialogDescription>
              Export your upgrade history and analytics data
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Export Format</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'csv', icon: FileSpreadsheet, label: 'CSV' },
                  { value: 'json', icon: FileText, label: 'JSON' },
                  { value: 'pdf', icon: FileText, label: 'PDF' },
                ].map((format) => (
                  <Button
                    key={format.value}
                    variant={exportForm.format === format.value ? 'default' : 'outline'}
                    className="flex flex-col items-center gap-1 h-auto py-3"
                    onClick={() => setExportForm({ ...exportForm, format: format.value })}
                  >
                    <format.icon className="h-5 w-5" />
                    <span className="text-xs">{format.label}</span>
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select
                value={exportForm.dateRange}
                onValueChange={(value) => setExportForm({ ...exportForm, dateRange: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="90days">Last 90 days</SelectItem>
                  <SelectItem value="year">Last year</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="include-analytics">Include Analytics Data</Label>
              <Switch
                id="include-analytics"
                checked={exportForm.includeAnalytics}
                onCheckedChange={(checked) => setExportForm({ ...exportForm, includeAnalytics: checked })}
              />
            </div>
            {isExporting && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Exporting...</span>
                  <span>{exportProgress}%</span>
                </div>
                <Progress value={exportProgress} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportDialogOpen(false)} disabled={isExporting}>
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={isExporting}>
              {isExporting ? 'Exporting...' : 'Export Data'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-600" />
              Upgrade Settings
            </DialogTitle>
            <DialogDescription>
              Configure your upgrade preferences and notifications
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="notifications" className="py-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>
            <TabsContent value="notifications" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-gray-500" />
                  <div>
                    <Label>Push Notifications</Label>
                    <p className="text-xs text-gray-500">Get notified about upgrades</p>
                  </div>
                </div>
                <Switch
                  checked={settingsForm.notifications}
                  onCheckedChange={(checked) => setSettingsForm({ ...settingsForm, notifications: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <Label>Email Updates</Label>
                    <p className="text-xs text-gray-500">Weekly upgrade summaries</p>
                  </div>
                </div>
                <Switch
                  checked={settingsForm.emailUpdates}
                  onCheckedChange={(checked) => setSettingsForm({ ...settingsForm, emailUpdates: checked })}
                />
              </div>
            </TabsContent>
            <TabsContent value="preferences" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-gray-500" />
                  <div>
                    <Label>Dark Mode</Label>
                    <p className="text-xs text-gray-500">Use dark theme</p>
                  </div>
                </div>
                <Switch
                  checked={settingsForm.darkMode}
                  onCheckedChange={(checked) => setSettingsForm({ ...settingsForm, darkMode: checked })}
                />
              </div>
              <div className="space-y-2">
                <Label>Language</Label>
                <Select
                  value={settingsForm.language}
                  onValueChange={(value) => setSettingsForm({ ...settingsForm, language: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
            <TabsContent value="security" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-gray-500" />
                  <div>
                    <Label>Auto Backup</Label>
                    <p className="text-xs text-gray-500">Automatically backup settings</p>
                  </div>
                </div>
                <Switch
                  checked={settingsForm.autoBackup}
                  onCheckedChange={(checked) => setSettingsForm({ ...settingsForm, autoBackup: checked })}
                />
              </div>
              <Button variant="outline" className="w-full">
                <Shield className="h-4 w-4 mr-2" />
                Enable Two-Factor Authentication
              </Button>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveSettings}>Save Settings</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Insight Detail Dialog */}
      <Dialog open={insightDialogOpen} onOpenChange={setInsightDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedInsight?.type === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
              {selectedInsight?.type === 'warning' && <AlertCircle className="h-5 w-5 text-yellow-600" />}
              {selectedInsight?.type === 'info' && <Info className="h-5 w-5 text-blue-600" />}
              {selectedInsight?.title}
            </DialogTitle>
            <DialogDescription>
              {selectedInsight?.category} Insight
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300">{selectedInsight?.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Priority</span>
                <Badge className="ml-2" variant={selectedInsight?.priority === 'high' ? 'destructive' : 'secondary'}>
                  {selectedInsight?.priority}
                </Badge>
              </div>
              <div>
                <span className="text-gray-500">Category</span>
                <span className="ml-2 font-medium">{selectedInsight?.category}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" variant="outline">
                <Clock className="h-4 w-4 mr-2" />
                Schedule Review
              </Button>
              <Button className="flex-1">
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark Resolved
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Collaborator Detail Dialog */}
      <Dialog open={collaboratorDialogOpen} onOpenChange={setCollaboratorDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-purple-600" />
              {selectedCollaborator?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedCollaborator?.role}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <UserCircle className="h-10 w-10 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold">{selectedCollaborator?.name}</h4>
                <p className="text-sm text-gray-500">{selectedCollaborator?.role}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-2 h-2 rounded-full ${
                    selectedCollaborator?.status === 'online' ? 'bg-green-500' :
                    selectedCollaborator?.status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'
                  }`} />
                  <span className="text-xs text-gray-500">
                    {selectedCollaborator?.status === 'online' ? 'Online' : `Last active ${selectedCollaborator?.lastActive}`}
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </Button>
              <Button variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
            </div>
            <Button className="w-full">
              <Users className="h-4 w-4 mr-2" />
              View Full Profile
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Prediction Detail Dialog */}
      <Dialog open={predictionDialogOpen} onOpenChange={setPredictionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              {selectedPrediction?.label}
            </DialogTitle>
            <DialogDescription>
              Predictive Analytics Details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="text-sm text-gray-500">Current</div>
                <div className="text-2xl font-bold text-blue-600">{selectedPrediction?.current}%</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-gray-500">Target</div>
                <div className="text-2xl font-bold text-purple-600">{selectedPrediction?.target}%</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-gray-500">Predicted</div>
                <div className="text-2xl font-bold text-green-600">{selectedPrediction?.predicted}%</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-gray-500">Confidence</div>
                <div className="text-2xl font-bold text-amber-600">{selectedPrediction?.confidence}%</div>
              </Card>
            </div>
            <div className="space-y-2">
              <Label>Progress to Target</Label>
              <Progress value={selectedPrediction ? (selectedPrediction.current / selectedPrediction.target) * 100 : 0} />
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" variant="outline">
                <PieChart className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
              <Button className="flex-1">
                <Calendar className="h-4 w-4 mr-2" />
                Set Reminder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Activity Detail Dialog */}
      <Dialog open={activityDialogOpen} onOpenChange={setActivityDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" />
              Activity Details
            </DialogTitle>
            <DialogDescription>
              {selectedActivity?.timestamp}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <UserCircle className="h-8 w-8 text-gray-400" />
                <div>
                  <p className="font-medium">{selectedActivity?.user}</p>
                  <p className="text-xs text-gray-500">{selectedActivity?.timestamp}</p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                {selectedActivity?.user} <span className="font-medium">{selectedActivity?.action}</span> {selectedActivity?.target}
              </p>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" variant="outline">
                <Clock className="h-4 w-4 mr-2" />
                View History
              </Button>
              <Button className="flex-1">
                <MessageSquare className="h-4 w-4 mr-2" />
                Add Comment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upgrade Confirmation Dialog */}
      <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-purple-600" />
              Upgrade to {selectedUpgrade?.name}
            </DialogTitle>
            <DialogDescription>
              Review your upgrade details before confirming
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-3">
                {selectedUpgrade?.icon && <selectedUpgrade.icon className="h-8 w-8 text-purple-600" />}
                <div>
                  <h4 className="font-semibold">{selectedUpgrade?.name}</h4>
                  <p className="text-sm text-gray-500">{selectedUpgrade?.description}</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-purple-600 mb-3">{selectedUpgrade?.price}</div>
              <ul className="space-y-2">
                {selectedUpgrade?.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </Card>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-sm">
              <p className="text-purple-800 dark:text-purple-200">
                Your upgrade will be active immediately after confirmation. You can cancel anytime.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpgradeDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmUpgrade} className="bg-purple-600 hover:bg-purple-700">
              Confirm Upgrade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Compare Plans Dialog */}
      <Dialog open={comparePlansDialogOpen} onOpenChange={setComparePlansDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              Compare Plans
            </DialogTitle>
            <DialogDescription>
              Find the perfect plan for your needs
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="grid grid-cols-4 gap-4">
              {/* Header Row */}
              <div className="font-semibold text-gray-500">Feature</div>
              <div className="text-center">
                <Badge className="bg-gray-100 text-gray-800">Free</Badge>
              </div>
              <div className="text-center">
                <Badge className="bg-purple-100 text-purple-800">Premium</Badge>
              </div>
              <div className="text-center">
                <Badge className="bg-amber-100 text-amber-800">Enterprise</Badge>
              </div>

              {/* Feature Rows */}
              {[
                { feature: 'AI Queries', free: '100/mo', premium: 'Unlimited', enterprise: 'Unlimited' },
                { feature: 'Team Members', free: '3', premium: '25', enterprise: 'Unlimited' },
                { feature: 'Storage', free: '5 GB', premium: '100 GB', enterprise: '1 TB' },
                { feature: 'Analytics', free: 'Basic', premium: 'Advanced', enterprise: 'Custom' },
                { feature: 'Support', free: 'Email', premium: 'Priority', enterprise: '24/7 Dedicated' },
                { feature: 'API Access', free: '-', premium: 'Yes', enterprise: 'Yes' },
                { feature: 'SSO', free: '-', premium: '-', enterprise: 'Yes' },
                { feature: 'Custom SLA', free: '-', premium: '-', enterprise: 'Yes' },
              ].map((row, idx) => (
                <React.Fragment key={idx}>
                  <div className="py-2 border-t">{row.feature}</div>
                  <div className="py-2 border-t text-center text-gray-600">{row.free}</div>
                  <div className="py-2 border-t text-center text-purple-600 font-medium">{row.premium}</div>
                  <div className="py-2 border-t text-center text-amber-600 font-medium">{row.enterprise}</div>
                </React.Fragment>
              ))}

              {/* Pricing Row */}
              <div className="py-4 border-t font-semibold">Monthly Price</div>
              <div className="py-4 border-t text-center text-2xl font-bold">$0</div>
              <div className="py-4 border-t text-center text-2xl font-bold text-purple-600">$29</div>
              <div className="py-4 border-t text-center text-2xl font-bold text-amber-600">$99</div>

              {/* CTA Row */}
              <div></div>
              <div className="text-center">
                <Button variant="outline" size="sm">Current Plan</Button>
              </div>
              <div className="text-center">
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700">Upgrade</Button>
              </div>
              <div className="text-center">
                <Button size="sm" variant="outline" onClick={() => {
                  setComparePlansDialogOpen(false)
                  setContactSalesDialogOpen(true)
                }}>
                  Contact Sales
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact Sales Dialog */}
      <Dialog open={contactSalesDialogOpen} onOpenChange={setContactSalesDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-purple-600" />
              Contact Sales
            </DialogTitle>
            <DialogDescription>
              Get in touch with our sales team for custom solutions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="contact-name">Name *</Label>
              <Input
                id="contact-name"
                placeholder="Your name"
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email">Email *</Label>
              <Input
                id="contact-email"
                type="email"
                placeholder="you@company.com"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-company">Company</Label>
              <Input
                id="contact-company"
                placeholder="Your company name"
                value={contactForm.company}
                onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-message">Message *</Label>
              <Textarea
                id="contact-message"
                placeholder="Tell us about your needs..."
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setContactSalesDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleContactSalesSubmit} className="bg-purple-600 hover:bg-purple-700">
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
