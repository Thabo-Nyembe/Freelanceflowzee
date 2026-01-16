'use client'

import { useState, useCallback } from 'react'

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

import { TeamCollaborationHub } from '@/components/team-collaboration-hub'
import { toast } from 'sonner'

// UI Components for Dialogs
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import {
  Brain,
  Users,
  TrendingUp,
  Activity,
  Settings,
  RefreshCw,
  Download,
  MessageSquare,
  Video,
  Phone,
  Share2,
  Bell,
  Target,
  BarChart3,
  Sparkles,
  Plus,
  Send,
} from 'lucide-react'

import { useCurrentUser } from '@/hooks/use-ai-data'
import { useAnnouncer } from '@/lib/accessibility'


// ============================================================================
// V2 COMPETITIVE MOCK DATA - Enhanced Context
// ============================================================================

const enhancedAIInsights = [
  { id: '1', type: 'recommendation' as const, title: 'Performance Update', description: 'System running optimally with 99.9% uptime this month.', impact: 'medium' as const, createdAt: new Date() },
  { id: '2', type: 'opportunity' as const, title: 'Goal Achievement', description: 'Monthly targets exceeded by 15%. Great progress!', impact: 'high' as const, createdAt: new Date() },
  { id: '3', type: 'alert' as const, title: 'Action Required', description: 'Review pending items to maintain workflow efficiency.', impact: 'medium' as const, createdAt: new Date() },
]

const enhancedCollaborators = [
  { id: '1', name: 'Alexandra Chen', avatar: '/avatars/alex.jpg', status: 'online' as const, color: '#3B82F6', isTyping: false },
  { id: '2', name: 'Marcus Johnson', avatar: '/avatars/marcus.jpg', status: 'online' as const, color: '#10B981', isTyping: true },
  { id: '3', name: 'Sarah Williams', avatar: '/avatars/sarah.jpg', status: 'away' as const, color: '#F59E0B', isTyping: false },
  { id: '4', name: 'David Park', avatar: '/avatars/david.jpg', status: 'offline' as const, color: '#6366F1', isTyping: false },
]

const enhancedPredictions = [
  {
    label: 'Completion Rate',
    currentValue: 85,
    predictedValue: 92,
    confidence: 88,
    trend: 'up' as const,
    timeframe: 'Next Month',
    factors: [
      { name: 'Team velocity increase', impact: 'positive' as const, weight: 0.4 },
      { name: 'Resource allocation', impact: 'positive' as const, weight: 0.3 },
      { name: 'Holiday schedule', impact: 'negative' as const, weight: 0.2 },
    ]
  },
  {
    label: 'Efficiency Score',
    currentValue: 78,
    predictedValue: 86,
    confidence: 82,
    trend: 'up' as const,
    timeframe: 'Q1 2026',
    factors: [
      { name: 'Process automation', impact: 'positive' as const, weight: 0.5 },
      { name: 'Team training', impact: 'positive' as const, weight: 0.3 },
    ]
  },
]

const enhancedActivities = [
  {
    id: '1',
    type: 'update' as const,
    title: 'updated system settings',
    user: { id: '1', name: 'Alexandra Chen', avatar: '/avatars/alex.jpg' },
    timestamp: new Date(Date.now() - 5 * 60000),
    isRead: false,
    isPinned: false,
  },
  {
    id: '2',
    type: 'status_change' as const,
    title: 'completed task review',
    user: { id: '2', name: 'Marcus Johnson', avatar: '/avatars/marcus.jpg' },
    timestamp: new Date(Date.now() - 15 * 60000),
    isRead: false,
    isPinned: true,
  },
  {
    id: '3',
    type: 'create' as const,
    title: 'generated weekly report',
    user: { id: '0', name: 'System' },
    timestamp: new Date(Date.now() - 60 * 60000),
    isRead: true,
    isPinned: false,
  },
  {
    id: '4',
    type: 'comment' as const,
    title: 'commented on Project Alpha',
    description: 'Great progress on the new feature implementation!',
    user: { id: '3', name: 'Sarah Williams', avatar: '/avatars/sarah.jpg' },
    timestamp: new Date(Date.now() - 2 * 60 * 60000),
    isRead: true,
    isPinned: false,
  },
]

export default function EnhancedClient() {
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  // Dialog states for quick actions
  const [newItemDialogOpen, setNewItemDialogOpen] = useState(false)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)

  // Additional dialog states
  const [aiSettingsDialogOpen, setAiSettingsDialogOpen] = useState(false)
  const [analyticsConfigDialogOpen, setAnalyticsConfigDialogOpen] = useState(false)
  const [collaborationDialogOpen, setCollaborationDialogOpen] = useState(false)
  const [messageDialogOpen, setMessageDialogOpen] = useState(false)
  const [callDialogOpen, setCallDialogOpen] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [notificationsDialogOpen, setNotificationsDialogOpen] = useState(false)
  const [refreshDialogOpen, setRefreshDialogOpen] = useState(false)

  // Activity states
  const [activities, setActivities] = useState(enhancedActivities)
  const [selectedRecipient, setSelectedRecipient] = useState('')
  const [messageContent, setMessageContent] = useState('')

  // New Item form state
  const [newItemForm, setNewItemForm] = useState({
    name: '',
    description: '',
    type: 'task',
    priority: 'medium',
  })

  // Export form state
  const [exportForm, setExportForm] = useState({
    format: 'csv',
    dateRange: 'all',
    includeMetadata: true,
    includeAttachments: false,
  })

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    notifications: true,
    emailDigest: false,
    autoSave: true,
    theme: 'system',
    language: 'en',
  })

  // AI Settings form state
  const [aiSettingsForm, setAiSettingsForm] = useState({
    aiEnabled: true,
    naturalLanguageQueries: true,
    predictiveAnalytics: true,
    autoInsights: true,
    confidenceThreshold: 75,
    dataRefreshInterval: '1h',
    aiModel: 'advanced',
  })

  // Analytics Config form state
  const [analyticsConfigForm, setAnalyticsConfigForm] = useState({
    enablePredictions: true,
    showConfidenceScores: true,
    factorAnalysis: true,
    trendAnalysis: true,
    predictionTimeframe: '30d',
    dataSource: 'all',
  })

  // Collaboration form state
  const [collaborationForm, setCollaborationForm] = useState({
    realTimeSync: true,
    showPresence: true,
    typingIndicators: true,
    cursorSharing: false,
    sessionRecording: false,
  })

  // Notification preferences
  const [notificationPrefs, setNotificationPrefs] = useState({
    activityUpdates: true,
    mentions: true,
    comments: true,
    statusChanges: true,
    aiInsights: true,
    pushNotifications: false,
    soundAlerts: false,
  })

  // Share form state
  const [shareForm, setShareForm] = useState({
    shareType: 'link',
    accessLevel: 'view',
    expiresIn: 'never',
    password: '',
  })

  // Handle new item creation
  const handleCreateItem = () => {
    if (!newItemForm.name.trim()) {
      toast.error('Validation Error')
      return
    }

    const itemType = newItemForm.type.charAt(0).toUpperCase() + newItemForm.type.slice(1)
    toast.success(`${itemType} "${newItemForm.name}" created successfully`)
    announce(`New ${newItemForm.type} "${newItemForm.name}" created successfully`)
    setNewItemDialogOpen(false)
    setNewItemForm({ name: '', description: '', type: 'task', priority: 'medium' })
  }

  // Handle export
  const handleExport = () => {
    toast.success(`Data exported successfully as ${exportForm.format.toUpperCase()}`)
    announce(`Data exported as ${exportForm.format.toUpperCase()}`)
    setExportDialogOpen(false)
  }

  // Handle settings save
  const handleSaveSettings = () => {
    toast.success('Settings saved successfully')
    announce('Settings saved successfully')
    setSettingsDialogOpen(false)
  }

  // Handle AI settings save
  const handleSaveAiSettings = () => {
    toast.success('AI settings updated successfully')
    announce('AI settings updated successfully')
    setAiSettingsDialogOpen(false)
  }

  // Handle analytics config save
  const handleSaveAnalyticsConfig = () => {
    toast.success('Analytics configuration saved')
    announce('Analytics configuration saved')
    setAnalyticsConfigDialogOpen(false)
  }

  // Handle collaboration settings save
  const handleSaveCollaborationSettings = () => {
    toast.success('Collaboration settings updated')
    announce('Collaboration settings updated')
    setCollaborationDialogOpen(false)
  }

  // Handle send message
  const handleSendMessage = () => {
    if (!selectedRecipient || !messageContent.trim()) {
      toast.error('Please select a recipient and enter a message')
      return
    }

    toast.success(`Message sent to ${selectedRecipient}`)
    announce(`Message sent to ${selectedRecipient}`)
    setMessageDialogOpen(false)
    setMessageContent('')
    setSelectedRecipient('')
  }

  // Handle start call
  const handleStartCall = (callType: 'audio' | 'video') => {
    if (!selectedRecipient) {
      toast.error('Please select a contact to call')
      return
    }

    const callTypeDisplay = callType.charAt(0).toUpperCase() + callType.slice(1)
    toast.success(`${callTypeDisplay} call started with ${selectedRecipient}`)
    announce(`${callTypeDisplay} call started with ${selectedRecipient}`)
    setCallDialogOpen(false)
    setSelectedRecipient('')
  }

  // Handle share
  const handleShare = () => {
    toast.success('Share link created and copied to clipboard')
    announce('Share link created and copied to clipboard')
    setShareDialogOpen(false)
  }

  // Handle save notification preferences
  const handleSaveNotificationPrefs = () => {
    toast.success('Notification preferences updated')
    announce('Notification preferences updated')
    setNotificationsDialogOpen(false)
  }

  // Handle refresh data
  const handleRefreshData = () => {
    toast.success('All data sources refreshed successfully')
    announce('All data sources refreshed')
    setRefreshDialogOpen(false)
  }

  // Handle AI query
  const handleAIQuery = useCallback((query: string): Promise<string> => {
    announce(`AI query processed: ${query}`)
    return Promise.resolve(`Based on your query "${query}", I've analyzed your data and found several relevant insights. Your current metrics show positive trends across key performance indicators.`)
  }, [announce])

  // Handle mark activity read
  const handleMarkActivityRead = useCallback((id: string) => {
    setActivities(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a))
    toast.success('Activity marked as read')
  }, [])

  // Handle mark all activities read
  const handleMarkAllRead = useCallback(() => {
    setActivities(prev => prev.map(a => ({ ...a, isRead: true })))
    toast.success('All activities marked as read')
    announce('All activities marked as read')
  }, [announce])

  // Handle pin activity
  const handlePinActivity = useCallback((id: string) => {
    setActivities(prev => prev.map(a =>
      a.id === id ? { ...a, isPinned: !a.isPinned } : a
    ))
    toast.success('Activity pin toggled')
  }, [])

  // Handle archive activity
  const handleArchiveActivity = useCallback((id: string) => {
    setActivities(prev => prev.filter(a => a.id !== id))
    toast.success('Activity archived')
    announce('Activity archived')
  }, [announce])

  // Handle refresh predictions
  const handleRefreshPredictions = useCallback(() => {
    toast.success('Predictions refreshed with latest data')
  }, [])

  // Quick actions with real dialog triggers
  const enhancedQuickActions = [
    { id: '1', label: 'New Item', icon: <Plus className="h-4 w-4" />, shortcut: 'N', action: () => setNewItemDialogOpen(true), category: 'Create' },
    { id: '2', label: 'Export', icon: <Download className="h-4 w-4" />, shortcut: 'E', action: () => setExportDialogOpen(true), category: 'Data' },
    { id: '3', label: 'Settings', icon: <Settings className="h-4 w-4" />, shortcut: 'S', action: () => setSettingsDialogOpen(true), category: 'Settings' },
    { id: '4', label: 'AI Config', icon: <Brain className="h-4 w-4" />, shortcut: 'A', action: () => setAiSettingsDialogOpen(true), category: 'AI' },
    { id: '5', label: 'Analytics', icon: <BarChart3 className="h-4 w-4" />, shortcut: 'Y', action: () => setAnalyticsConfigDialogOpen(true), category: 'Analytics' },
    { id: '6', label: 'Collaborate', icon: <Users className="h-4 w-4" />, shortcut: 'C', action: () => setCollaborationDialogOpen(true), category: 'Team' },
    { id: '7', label: 'Message', icon: <MessageSquare className="h-4 w-4" />, shortcut: 'M', action: () => setMessageDialogOpen(true), category: 'Communication' },
    { id: '8', label: 'Call', icon: <Video className="h-4 w-4" />, shortcut: 'V', action: () => setCallDialogOpen(true), category: 'Communication' },
    { id: '9', label: 'Share', icon: <Share2 className="h-4 w-4" />, shortcut: 'H', action: () => setShareDialogOpen(true), category: 'Share' },
    { id: '10', label: 'Notifications', icon: <Bell className="h-4 w-4" />, shortcut: 'B', action: () => setNotificationsDialogOpen(true), category: 'Settings' },
    { id: '11', label: 'Refresh', icon: <RefreshCw className="h-4 w-4" />, shortcut: 'R', action: () => setRefreshDialogOpen(true), category: 'Data' },
  ]

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header with Quick Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enhanced Dashboard</h1>
          <p className="text-muted-foreground">AI-powered insights and real-time collaboration</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setNotificationsDialogOpen(true)}>
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
          <Button variant="outline" onClick={() => setRefreshDialogOpen(true)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setSettingsDialogOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Collaboration Indicator */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Active Collaborators</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={() => setCollaborationDialogOpen(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <CollaborationIndicator collaborators={enhancedCollaborators} maxVisible={4} showTyping={true} />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setMessageDialogOpen(true)}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCallDialogOpen(true)}>
                <Video className="h-4 w-4 mr-2" />
                Start Call
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Insights Panel */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-lg">AI Insights</CardTitle>
                <Badge variant="secondary">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Powered by AI
                </Badge>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setAiSettingsDialogOpen(true)}>
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <AIInsightsPanel
              insights={enhancedAIInsights}
              onQuery={handleAIQuery}
            />
          </CardContent>
        </Card>

        {/* Predictive Analytics */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg">Predictive Analytics</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={handleRefreshPredictions}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setAnalyticsConfigDialogOpen(true)}>
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <PredictiveAnalytics
              predictions={enhancedPredictions}
              onRefresh={handleRefreshPredictions}
            />
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-orange-600" />
                <CardTitle className="text-lg">Activity Feed</CardTitle>
                <Badge variant="secondary">{activities.filter(a => !a.isRead).length} unread</Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
                  Mark All Read
                </Button>
                <Button variant="outline" size="sm" onClick={() => setExportDialogOpen(true)}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ActivityFeed
              activities={activities}
              onMarkRead={handleMarkActivityRead}
              onMarkAllRead={handleMarkAllRead}
              onPin={handlePinActivity}
              onArchive={handleArchiveActivity}
            />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Toolbar */}
      <QuickActionsToolbar
        actions={enhancedQuickActions}
        variant="grid"
        className="mt-6"
      />

      {/* Team Collaboration Hub */}
      <TeamCollaborationHub />

      {/* ===== DIALOGS ===== */}

      {/* New Item Dialog */}
      <Dialog open={newItemDialogOpen} onOpenChange={setNewItemDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Item</DialogTitle>
            <DialogDescription>
              Add a new item to your enhanced dashboard. Fill in the details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="item-name">Name *</Label>
              <Input
                id="item-name"
                placeholder="Enter item name"
                value={newItemForm.name}
                onChange={(e) => setNewItemForm({ ...newItemForm, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="item-description">Description</Label>
              <Textarea
                id="item-description"
                placeholder="Enter item description"
                value={newItemForm.description}
                onChange={(e) => setNewItemForm({ ...newItemForm, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="grid gap-2">
                <Label htmlFor="item-type">Type</Label>
                <Select
                  value={newItemForm.type}
                  onValueChange={(value) => setNewItemForm({ ...newItemForm, type: value })}
                >
                  <SelectTrigger id="item-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="task">Task</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="milestone">Milestone</SelectItem>
                    <SelectItem value="note">Note</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="item-priority">Priority</Label>
                <Select
                  value={newItemForm.priority}
                  onValueChange={(value) => setNewItemForm({ ...newItemForm, priority: value })}
                >
                  <SelectTrigger id="item-priority">
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
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewItemDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateItem}>Create Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Export Data</DialogTitle>
            <DialogDescription>
              Configure your export settings and download your data.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="export-format">Export Format</Label>
              <Select
                value={exportForm.format}
                onValueChange={(value) => setExportForm({ ...exportForm, format: value })}
              >
                <SelectTrigger id="export-format">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (Comma Separated)</SelectItem>
                  <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="pdf">PDF Report</SelectItem>
                  <SelectItem value="xml">XML</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date-range">Date Range</Label>
              <Select
                value={exportForm.dateRange}
                onValueChange={(value) => setExportForm({ ...exportForm, dateRange: value })}
              >
                <SelectTrigger id="date-range">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-metadata"
                  checked={exportForm.includeMetadata}
                  onCheckedChange={(checked) =>
                    setExportForm({ ...exportForm, includeMetadata: checked as boolean })
                  }
                />
                <Label htmlFor="include-metadata" className="text-sm font-normal">
                  Include metadata (timestamps, IDs)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-attachments"
                  checked={exportForm.includeAttachments}
                  onCheckedChange={(checked) =>
                    setExportForm({ ...exportForm, includeAttachments: checked as boolean })
                  }
                />
                <Label htmlFor="include-attachments" className="text-sm font-normal">
                  Include attachments (may increase file size)
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport} aria-label="Export data">
                  <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Dashboard Settings</DialogTitle>
            <DialogDescription>
              Customize your enhanced dashboard experience.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Notifications</h4>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications for updates
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={settingsForm.notifications}
                  onCheckedChange={(checked) =>
                    setSettingsForm({ ...settingsForm, notifications: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-digest">Email Digest</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive daily email summary
                  </p>
                </div>
                <Switch
                  id="email-digest"
                  checked={settingsForm.emailDigest}
                  onCheckedChange={(checked) =>
                    setSettingsForm({ ...settingsForm, emailDigest: checked })
                  }
                />
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Preferences</h4>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-save">Auto-Save</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically save changes
                  </p>
                </div>
                <Switch
                  id="auto-save"
                  checked={settingsForm.autoSave}
                  onCheckedChange={(checked) =>
                    setSettingsForm({ ...settingsForm, autoSave: checked })
                  }
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={settingsForm.theme}
                    onValueChange={(value) => setSettingsForm({ ...settingsForm, theme: value })}
                  >
                    <SelectTrigger id="theme">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={settingsForm.language}
                    onValueChange={(value) => setSettingsForm({ ...settingsForm, language: value })}
                  >
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="pt">Portuguese</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings}>Save Settings</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Settings Dialog */}
      <Dialog open={aiSettingsDialogOpen} onOpenChange={setAiSettingsDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              AI Configuration
            </DialogTitle>
            <DialogDescription>
              Configure AI-powered features and preferences.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Core Features</h4>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="ai-enabled">Enable AI Features</Label>
                  <p className="text-sm text-muted-foreground">
                    Master toggle for all AI capabilities
                  </p>
                </div>
                <Switch
                  id="ai-enabled"
                  checked={aiSettingsForm.aiEnabled}
                  onCheckedChange={(checked) =>
                    setAiSettingsForm({ ...aiSettingsForm, aiEnabled: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="nlp-queries">Natural Language Queries</Label>
                  <p className="text-sm text-muted-foreground">
                    Ask questions in plain language
                  </p>
                </div>
                <Switch
                  id="nlp-queries"
                  checked={aiSettingsForm.naturalLanguageQueries}
                  onCheckedChange={(checked) =>
                    setAiSettingsForm({ ...aiSettingsForm, naturalLanguageQueries: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="predictive">Predictive Analytics</Label>
                  <p className="text-sm text-muted-foreground">
                    Generate forecasts and predictions
                  </p>
                </div>
                <Switch
                  id="predictive"
                  checked={aiSettingsForm.predictiveAnalytics}
                  onCheckedChange={(checked) =>
                    setAiSettingsForm({ ...aiSettingsForm, predictiveAnalytics: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-insights">Auto-Generate Insights</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically surface important insights
                  </p>
                </div>
                <Switch
                  id="auto-insights"
                  checked={aiSettingsForm.autoInsights}
                  onCheckedChange={(checked) =>
                    setAiSettingsForm({ ...aiSettingsForm, autoInsights: checked })
                  }
                />
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Advanced Settings</h4>
              <div className="grid gap-2">
                <Label htmlFor="confidence-threshold">
                  Confidence Threshold: {aiSettingsForm.confidenceThreshold}%
                </Label>
                <Slider
                  id="confidence-threshold"
                  value={[aiSettingsForm.confidenceThreshold]}
                  onValueChange={([value]) =>
                    setAiSettingsForm({ ...aiSettingsForm, confidenceThreshold: value })
                  }
                  min={50}
                  max={100}
                  step={5}
                />
                <p className="text-xs text-muted-foreground">
                  Minimum confidence level for AI predictions
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="refresh-interval">Data Refresh</Label>
                  <Select
                    value={aiSettingsForm.dataRefreshInterval}
                    onValueChange={(value) =>
                      setAiSettingsForm({ ...aiSettingsForm, dataRefreshInterval: value })
                    }
                  >
                    <SelectTrigger id="refresh-interval">
                      <SelectValue placeholder="Select interval" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5m">Every 5 minutes</SelectItem>
                      <SelectItem value="15m">Every 15 minutes</SelectItem>
                      <SelectItem value="30m">Every 30 minutes</SelectItem>
                      <SelectItem value="1h">Every hour</SelectItem>
                      <SelectItem value="manual">Manual only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ai-model">AI Model</Label>
                  <Select
                    value={aiSettingsForm.aiModel}
                    onValueChange={(value) =>
                      setAiSettingsForm({ ...aiSettingsForm, aiModel: value })
                    }
                  >
                    <SelectTrigger id="ai-model">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fast">Fast (Lower accuracy)</SelectItem>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="advanced">Advanced (Highest accuracy)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAiSettingsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAiSettings}>
              <Sparkles className="h-4 w-4 mr-2" />
              Save AI Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Analytics Config Dialog */}
      <Dialog open={analyticsConfigDialogOpen} onOpenChange={setAnalyticsConfigDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Analytics Configuration
            </DialogTitle>
            <DialogDescription>
              Configure predictive analytics and forecasting settings.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Display Options</h4>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enable-predictions">Enable Predictions</Label>
                  <p className="text-sm text-muted-foreground">
                    Show AI-generated forecasts
                  </p>
                </div>
                <Switch
                  id="enable-predictions"
                  checked={analyticsConfigForm.enablePredictions}
                  onCheckedChange={(checked) =>
                    setAnalyticsConfigForm({ ...analyticsConfigForm, enablePredictions: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="confidence-scores">Show Confidence Scores</Label>
                  <p className="text-sm text-muted-foreground">
                    Display prediction confidence levels
                  </p>
                </div>
                <Switch
                  id="confidence-scores"
                  checked={analyticsConfigForm.showConfidenceScores}
                  onCheckedChange={(checked) =>
                    setAnalyticsConfigForm({ ...analyticsConfigForm, showConfidenceScores: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="factor-analysis">Factor Analysis</Label>
                  <p className="text-sm text-muted-foreground">
                    Show contributing factors for predictions
                  </p>
                </div>
                <Switch
                  id="factor-analysis"
                  checked={analyticsConfigForm.factorAnalysis}
                  onCheckedChange={(checked) =>
                    setAnalyticsConfigForm({ ...analyticsConfigForm, factorAnalysis: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="trend-analysis">Trend Analysis</Label>
                  <p className="text-sm text-muted-foreground">
                    Display historical trend indicators
                  </p>
                </div>
                <Switch
                  id="trend-analysis"
                  checked={analyticsConfigForm.trendAnalysis}
                  onCheckedChange={(checked) =>
                    setAnalyticsConfigForm({ ...analyticsConfigForm, trendAnalysis: checked })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="grid gap-2">
                <Label htmlFor="prediction-timeframe">Prediction Timeframe</Label>
                <Select
                  value={analyticsConfigForm.predictionTimeframe}
                  onValueChange={(value) =>
                    setAnalyticsConfigForm({ ...analyticsConfigForm, predictionTimeframe: value })
                  }
                >
                  <SelectTrigger id="prediction-timeframe">
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">7 Days</SelectItem>
                    <SelectItem value="30d">30 Days</SelectItem>
                    <SelectItem value="90d">90 Days</SelectItem>
                    <SelectItem value="1y">1 Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="data-source">Data Source</Label>
                <Select
                  value={analyticsConfigForm.dataSource}
                  onValueChange={(value) =>
                    setAnalyticsConfigForm({ ...analyticsConfigForm, dataSource: value })
                  }
                >
                  <SelectTrigger id="data-source">
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="projects">Projects Only</SelectItem>
                    <SelectItem value="tasks">Tasks Only</SelectItem>
                    <SelectItem value="team">Team Metrics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAnalyticsConfigDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAnalyticsConfig}>
              <Target className="h-4 w-4 mr-2" />
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Collaboration Settings Dialog */}
      <Dialog open={collaborationDialogOpen} onOpenChange={setCollaborationDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Collaboration Settings
            </DialogTitle>
            <DialogDescription>
              Configure real-time collaboration features.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Real-Time Features</h4>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="realtime-sync">Real-Time Sync</Label>
                  <p className="text-sm text-muted-foreground">
                    Sync changes instantly with collaborators
                  </p>
                </div>
                <Switch
                  id="realtime-sync"
                  checked={collaborationForm.realTimeSync}
                  onCheckedChange={(checked) =>
                    setCollaborationForm({ ...collaborationForm, realTimeSync: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-presence">Show Presence</Label>
                  <p className="text-sm text-muted-foreground">
                    Display online/offline status
                  </p>
                </div>
                <Switch
                  id="show-presence"
                  checked={collaborationForm.showPresence}
                  onCheckedChange={(checked) =>
                    setCollaborationForm({ ...collaborationForm, showPresence: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="typing-indicators">Typing Indicators</Label>
                  <p className="text-sm text-muted-foreground">
                    Show when others are typing
                  </p>
                </div>
                <Switch
                  id="typing-indicators"
                  checked={collaborationForm.typingIndicators}
                  onCheckedChange={(checked) =>
                    setCollaborationForm({ ...collaborationForm, typingIndicators: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="cursor-sharing">Cursor Sharing</Label>
                  <p className="text-sm text-muted-foreground">
                    Show collaborator cursor positions
                  </p>
                </div>
                <Switch
                  id="cursor-sharing"
                  checked={collaborationForm.cursorSharing}
                  onCheckedChange={(checked) =>
                    setCollaborationForm({ ...collaborationForm, cursorSharing: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="session-recording">Session Recording</Label>
                  <p className="text-sm text-muted-foreground">
                    Record collaboration sessions
                  </p>
                </div>
                <Switch
                  id="session-recording"
                  checked={collaborationForm.sessionRecording}
                  onCheckedChange={(checked) =>
                    setCollaborationForm({ ...collaborationForm, sessionRecording: checked })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCollaborationDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCollaborationSettings}>
              <Users className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Message Dialog */}
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              Send Message
            </DialogTitle>
            <DialogDescription>
              Send a message to a team member.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="recipient">Recipient</Label>
              <Select
                value={selectedRecipient}
                onValueChange={setSelectedRecipient}
              >
                <SelectTrigger id="recipient">
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent>
                  {enhancedCollaborators.map((collaborator) => (
                    <SelectItem key={collaborator.id} value={collaborator.name}>
                      {collaborator.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message-content">Message</Label>
              <Textarea
                id="message-content"
                placeholder="Type your message..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMessageDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendMessage}>
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Call Dialog */}
      <Dialog open={callDialogOpen} onOpenChange={setCallDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-green-600" />
              Start Call
            </DialogTitle>
            <DialogDescription>
              Start an audio or video call with a team member.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="call-recipient">Select Contact</Label>
              <Select
                value={selectedRecipient}
                onValueChange={setSelectedRecipient}
              >
                <SelectTrigger id="call-recipient">
                  <SelectValue placeholder="Select contact" />
                </SelectTrigger>
                <SelectContent>
                  {enhancedCollaborators
                    .filter((c) => c.status === 'online')
                    .map((collaborator) => (
                      <SelectItem key={collaborator.id} value={collaborator.name}>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full" />
                          {collaborator.name}
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 justify-center pt-4">
              <Button
                variant="outline"
                size="lg"
                className="flex-1"
                onClick={() => handleStartCall('audio')}
              >
                <Phone className="h-5 w-5 mr-2" />
                Audio Call
              </Button>
              <Button
                size="lg"
                className="flex-1"
                onClick={() => handleStartCall('video')}
              >
                <Video className="h-5 w-5 mr-2" />
                Video Call
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCallDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-purple-600" />
              Share Dashboard
            </DialogTitle>
            <DialogDescription>
              Share your dashboard with others.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="share-type">Share Type</Label>
              <Select
                value={shareForm.shareType}
                onValueChange={(value) => setShareForm({ ...shareForm, shareType: value })}
              >
                <SelectTrigger id="share-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="link">Share Link</SelectItem>
                  <SelectItem value="email">Email Invite</SelectItem>
                  <SelectItem value="embed">Embed Code</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="access-level">Access Level</Label>
              <Select
                value={shareForm.accessLevel}
                onValueChange={(value) => setShareForm({ ...shareForm, accessLevel: value })}
              >
                <SelectTrigger id="access-level">
                  <SelectValue placeholder="Select access" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">View Only</SelectItem>
                  <SelectItem value="comment">Can Comment</SelectItem>
                  <SelectItem value="edit">Can Edit</SelectItem>
                  <SelectItem value="admin">Full Access</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="grid gap-2">
                <Label htmlFor="expires">Link Expiration</Label>
                <Select
                  value={shareForm.expiresIn}
                  onValueChange={(value) => setShareForm({ ...shareForm, expiresIn: value })}
                >
                  <SelectTrigger id="expires">
                    <SelectValue placeholder="Select expiration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">1 Hour</SelectItem>
                    <SelectItem value="24h">24 Hours</SelectItem>
                    <SelectItem value="7d">7 Days</SelectItem>
                    <SelectItem value="30d">30 Days</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password (Optional)</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Set password"
                  value={shareForm.password}
                  onChange={(e) => setShareForm({ ...shareForm, password: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleShare} aria-label="Share">
                  <Share2 className="h-4 w-4 mr-2" />
              Generate Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notifications Dialog */}
      <Dialog open={notificationsDialogOpen} onOpenChange={setNotificationsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-orange-600" />
              Notification Preferences
            </DialogTitle>
            <DialogDescription>
              Customize what notifications you receive.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Activity Notifications</h4>
              <div className="flex items-center justify-between">
                <Label htmlFor="activity-updates">Activity Updates</Label>
                <Switch
                  id="activity-updates"
                  checked={notificationPrefs.activityUpdates}
                  onCheckedChange={(checked) =>
                    setNotificationPrefs({ ...notificationPrefs, activityUpdates: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="mentions">Mentions</Label>
                <Switch
                  id="mentions"
                  checked={notificationPrefs.mentions}
                  onCheckedChange={(checked) =>
                    setNotificationPrefs({ ...notificationPrefs, mentions: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="comments">Comments</Label>
                <Switch
                  id="comments"
                  checked={notificationPrefs.comments}
                  onCheckedChange={(checked) =>
                    setNotificationPrefs({ ...notificationPrefs, comments: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="status-changes">Status Changes</Label>
                <Switch
                  id="status-changes"
                  checked={notificationPrefs.statusChanges}
                  onCheckedChange={(checked) =>
                    setNotificationPrefs({ ...notificationPrefs, statusChanges: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="ai-insights">AI Insights</Label>
                <Switch
                  id="ai-insights"
                  checked={notificationPrefs.aiInsights}
                  onCheckedChange={(checked) =>
                    setNotificationPrefs({ ...notificationPrefs, aiInsights: checked })
                  }
                />
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Delivery Methods</h4>
              <div className="flex items-center justify-between">
                <Label htmlFor="push-notifications">Push Notifications</Label>
                <Switch
                  id="push-notifications"
                  checked={notificationPrefs.pushNotifications}
                  onCheckedChange={(checked) =>
                    setNotificationPrefs({ ...notificationPrefs, pushNotifications: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="sound-alerts">Sound Alerts</Label>
                <Switch
                  id="sound-alerts"
                  checked={notificationPrefs.soundAlerts}
                  onCheckedChange={(checked) =>
                    setNotificationPrefs({ ...notificationPrefs, soundAlerts: checked })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotificationsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNotificationPrefs}>
              <Bell className="h-4 w-4 mr-2" />
              Save Preferences
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refresh Data Dialog */}
      <Dialog open={refreshDialogOpen} onOpenChange={setRefreshDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-blue-600" />
              Refresh Data
            </DialogTitle>
            <DialogDescription>
              Refresh all dashboard data sources.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Brain className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium text-sm">AI Insights</p>
                  <p className="text-xs text-muted-foreground">Last updated 5 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-sm">Predictive Analytics</p>
                  <p className="text-xs text-muted-foreground">Last updated 15 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Activity className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium text-sm">Activity Feed</p>
                  <p className="text-xs text-muted-foreground">Real-time sync active</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-sm">Collaboration Status</p>
                  <p className="text-xs text-muted-foreground">4 active collaborators</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefreshDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRefreshData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 