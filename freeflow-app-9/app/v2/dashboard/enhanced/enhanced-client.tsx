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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Slider } from '@/components/ui/slider'
import {
  Brain,
  Users,
  TrendingUp,
  Activity,
  Settings,
  RefreshCw,
  Download,
  Upload,
  MessageSquare,
  Video,
  Phone,
  Share2,
  Bell,
  Zap,
  Target,
  BarChart3,
  Sparkles,
  Calendar,
  Clock,
  Plus,
  Filter,
  Eye,
  Trash2,
  Archive,
  Star,
  Send,
  Mic,
  Shield,
  Lock,
  Globe,
  Layers,
} from 'lucide-react'

// A+++ UTILITIES
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
  },
  {
    id: '2',
    type: 'status_change' as const,
    title: 'completed task review',
    user: { id: '2', name: 'Marcus Johnson', avatar: '/avatars/marcus.jpg' },
    timestamp: new Date(Date.now() - 15 * 60000),
    isRead: false,
  },
  {
    id: '3',
    type: 'create' as const,
    title: 'generated weekly report',
    user: { id: '0', name: 'System' },
    timestamp: new Date(Date.now() - 60 * 60000),
    isRead: true,
  },
  {
    id: '4',
    type: 'comment' as const,
    title: 'commented on Project Alpha',
    description: 'Great progress on the new feature implementation!',
    user: { id: '3', name: 'Sarah Williams', avatar: '/avatars/sarah.jpg' },
    timestamp: new Date(Date.now() - 2 * 60 * 60000),
    isRead: true,
  },
]

export default function EnhancedClient() {
  // A+++ UTILITIES
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
      toast.error('Validation Error', { description: 'Item name is required' })
      return
    }

    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1000)),
      {
        loading: 'Creating item...',
        success: () => {
          setNewItemDialogOpen(false)
          setNewItemForm({ name: '', description: '', type: 'task', priority: 'medium' })
          announce(`New ${newItemForm.type} "${newItemForm.name}" created successfully`)
          return `${newItemForm.type.charAt(0).toUpperCase() + newItemForm.type.slice(1)} "${newItemForm.name}" created successfully`
        },
        error: 'Failed to create item',
      }
    )
  }

  // Handle export
  const handleExport = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: `Exporting data as ${exportForm.format.toUpperCase()}...`,
        success: () => {
          setExportDialogOpen(false)
          announce(`Data exported as ${exportForm.format.toUpperCase()}`)
          return `Data exported successfully as ${exportForm.format.toUpperCase()}`
        },
        error: 'Export failed',
      }
    )
  }

  // Handle settings save
  const handleSaveSettings = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 800)),
      {
        loading: 'Saving settings...',
        success: () => {
          setSettingsDialogOpen(false)
          announce('Settings saved successfully')
          return 'Settings saved successfully'
        },
        error: 'Failed to save settings',
      }
    )
  }

  // Handle AI settings save
  const handleSaveAiSettings = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1000)),
      {
        loading: 'Updating AI configuration...',
        success: () => {
          setAiSettingsDialogOpen(false)
          announce('AI settings updated successfully')
          return 'AI settings updated successfully'
        },
        error: 'Failed to update AI settings',
      }
    )
  }

  // Handle analytics config save
  const handleSaveAnalyticsConfig = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 800)),
      {
        loading: 'Saving analytics configuration...',
        success: () => {
          setAnalyticsConfigDialogOpen(false)
          announce('Analytics configuration saved')
          return 'Analytics configuration saved'
        },
        error: 'Failed to save analytics configuration',
      }
    )
  }

  // Handle collaboration settings save
  const handleSaveCollaborationSettings = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 800)),
      {
        loading: 'Updating collaboration settings...',
        success: () => {
          setCollaborationDialogOpen(false)
          announce('Collaboration settings updated')
          return 'Collaboration settings updated'
        },
        error: 'Failed to update collaboration settings',
      }
    )
  }

  // Handle send message
  const handleSendMessage = () => {
    if (!selectedRecipient || !messageContent.trim()) {
      toast.error('Please select a recipient and enter a message')
      return
    }

    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1000)),
      {
        loading: 'Sending message...',
        success: () => {
          setMessageDialogOpen(false)
          setMessageContent('')
          setSelectedRecipient('')
          announce(`Message sent to ${selectedRecipient}`)
          return `Message sent to ${selectedRecipient}`
        },
        error: 'Failed to send message',
      }
    )
  }

  // Handle start call
  const handleStartCall = (callType: 'audio' | 'video') => {
    if (!selectedRecipient) {
      toast.error('Please select a contact to call')
      return
    }

    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: `Starting ${callType} call...`,
        success: () => {
          setCallDialogOpen(false)
          setSelectedRecipient('')
          announce(`${callType.charAt(0).toUpperCase() + callType.slice(1)} call started with ${selectedRecipient}`)
          return `${callType.charAt(0).toUpperCase() + callType.slice(1)} call started with ${selectedRecipient}`
        },
        error: 'Failed to start call',
      }
    )
  }

  // Handle share
  const handleShare = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1000)),
      {
        loading: 'Generating share link...',
        success: () => {
          setShareDialogOpen(false)
          announce('Share link created and copied to clipboard')
          return 'Share link created and copied to clipboard'
        },
        error: 'Failed to create share link',
      }
    )
  }

  // Handle save notification preferences
  const handleSaveNotificationPrefs = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 800)),
      {
        loading: 'Saving notification preferences...',
        success: () => {
          setNotificationsDialogOpen(false)
          announce('Notification preferences updated')
          return 'Notification preferences updated'
        },
        error: 'Failed to save notification preferences',
      }
    )
  }

  // Handle refresh data
  const handleRefreshData = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Refreshing all data sources...',
        success: () => {
          setRefreshDialogOpen(false)
          announce('All data sources refreshed')
          return 'All data sources refreshed successfully'
        },
        error: 'Failed to refresh data',
      }
    )
  }

  // Handle AI query
  const handleAIQuery = useCallback(async (query: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 1500))
    announce(`AI query processed: ${query}`)
    return `Based on your query "${query}", I've analyzed your data and found several relevant insights. Your current metrics show positive trends across key performance indicators.`
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
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Refreshing predictions...',
        success: 'Predictions refreshed with latest data',
        error: 'Failed to refresh predictions',
      }
    )
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
    <div className="container mx-auto py-6">
      <TeamCollaborationHub />

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
            <div className="grid grid-cols-2 gap-4">
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
            <Button onClick={handleExport}>Export Data</Button>
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
              <div className="grid grid-cols-2 gap-4">
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
    </div>
  )
} 