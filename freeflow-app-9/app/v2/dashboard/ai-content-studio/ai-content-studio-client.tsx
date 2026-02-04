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

import React, { useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Mail, FileText, Sparkles, Brain, Instagram, Twitter, Linkedin, Facebook, Copy, RefreshCw, Check, Wand2, Plus, Download, Settings, Save, Share2, Edit3, Trash2, History, Star, StarOff, Filter, Search, Bookmark, BookmarkCheck, Send, Eye, EyeOff, Palette, Zap, TrendingUp, Clock, Calendar, Users, Target, BarChart2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { useState } from 'react'
import { toast } from 'sonner'
import { SmartEmailTemplates } from '@/components/ai/smart-email-templates'
import { AIProposalGenerator } from '@/components/ai/ai-proposal-generator'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { useAnnouncer } from '@/lib/accessibility'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('AIContentStudio')


// ============================================================================
// V2 COMPETITIVE MOCK DATA - AiContentStudio Context
// ============================================================================

const aiContentStudioAIInsights = [
  { id: '1', type: 'info' as const, title: 'Performance Update', description: 'System running optimally with 99.9% uptime this month.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '2', type: 'success' as const, title: 'Goal Achievement', description: 'Monthly targets exceeded by 15%. Great progress!', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Goals' },
  { id: '3', type: 'warning' as const, title: 'Action Required', description: 'Review pending items to maintain workflow efficiency.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Tasks' },
]

const aiContentStudioCollaborators = [
  { id: '1', name: 'Alexandra Chen', avatar: '/avatars/alex.jpg', status: 'online' as const, role: 'Manager', lastActive: 'Now' },
  { id: '2', name: 'Marcus Johnson', avatar: '/avatars/marcus.jpg', status: 'online' as const, role: 'Developer', lastActive: '5m ago' },
  { id: '3', name: 'Sarah Williams', avatar: '/avatars/sarah.jpg', status: 'away' as const, role: 'Designer', lastActive: '30m ago' },
]

const aiContentStudioPredictions = [
  { id: '1', label: 'Completion Rate', current: 85, target: 95, predicted: 92, confidence: 88, trend: 'up' as const },
  { id: '2', label: 'Efficiency Score', current: 78, target: 90, predicted: 86, confidence: 82, trend: 'up' as const },
]

const aiContentStudioActivities = [
  { id: '1', user: 'Alexandra Chen', action: 'updated', target: 'system settings', timestamp: '5m ago', type: 'info' as const },
  { id: '2', user: 'Marcus Johnson', action: 'completed', target: 'task review', timestamp: '15m ago', type: 'success' as const },
  { id: '3', user: 'System', action: 'generated', target: 'weekly report', timestamp: '1h ago', type: 'info' as const },
]

export default function AiContentStudioClient() {
  const { userId, loading: _userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  // Dialog states for quick actions
  const [showNewContentDialog, setShowNewContentDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)

  // New content form state
  const [newContentTitle, setNewContentTitle] = useState('')
  const [newContentType, setNewContentType] = useState('social-post')
  const [newContentDescription, setNewContentDescription] = useState('')
  const [isCreatingContent, setIsCreatingContent] = useState(false)

  // Export form state
  const [exportFormat, setExportFormat] = useState('json')
  const [exportIncludeMetadata, setExportIncludeMetadata] = useState(true)
  const [exportDateRange, setExportDateRange] = useState('all')
  const [isExporting, setIsExporting] = useState(false)

  // Settings form state
  const [aiModel, setAiModel] = useState('gpt-4')
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [defaultTone, setDefaultTone] = useState('professional')
  const [maxTokens, setMaxTokens] = useState('2000')
  const [isSavingSettings, setIsSavingSettings] = useState(false)

  // Additional dialog states
  const [showHistoryDialog, setShowHistoryDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState(false)

  // Share form state
  const [shareEmail, setShareEmail] = useState('')
  const [shareMessage, setShareMessage] = useState('')
  const [sharePermission, setSharePermission] = useState('view')
  const [isSharing, setIsSharing] = useState(false)

  // Schedule form state
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [schedulePlatform, setSchedulePlatform] = useState('instagram')
  const [isScheduling, setIsScheduling] = useState(false)

  // Template form state
  const [templateName, setTemplateName] = useState('')
  const [templateCategory, setTemplateCategory] = useState('social')
  const [isSavingTemplate, setIsSavingTemplate] = useState(false)

  // History state
  const [contentHistory] = useState([
    { id: '1', title: 'Product Launch Post', platform: 'Instagram', createdAt: '2024-01-15', type: 'social' },
    { id: '2', title: 'Q4 Newsletter', platform: 'Email', createdAt: '2024-01-14', type: 'email' },
    { id: '3', title: 'LinkedIn Article Draft', platform: 'LinkedIn', createdAt: '2024-01-13', type: 'social' },
    { id: '4', title: 'Holiday Campaign Ad', platform: 'Facebook', createdAt: '2024-01-12', type: 'ad' },
    { id: '5', title: 'Customer Success Story', platform: 'Twitter', createdAt: '2024-01-11', type: 'social' },
  ])

  // Quick actions with dialog triggers
  const aiContentStudioQuickActions = [
    { id: '1', label: 'New Item', icon: 'Plus', shortcut: 'N', action: () => setShowNewContentDialog(true) },
    { id: '2', label: 'Export', icon: 'Download', shortcut: 'E', action: () => setShowExportDialog(true) },
    { id: '3', label: 'Settings', icon: 'Settings', shortcut: 'S', action: () => setShowSettingsDialog(true) },
    { id: '4', label: 'History', icon: 'History', shortcut: 'H', action: () => setShowHistoryDialog(true) },
    { id: '5', label: 'Share', icon: 'Share2', shortcut: 'R', action: () => setShowShareDialog(true) },
    { id: '6', label: 'Schedule', icon: 'Calendar', shortcut: 'C', action: () => setShowScheduleDialog(true) },
  ]

  // Handler for creating new content
  const handleCreateContent = async () => {
    if (!newContentTitle.trim()) {
      toast.error('Please enter a content title')
      return
    }
    setIsCreatingContent(true)
    try {
      const res = await fetch('/api/ai-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          title: newContentTitle,
          type: newContentType,
          description: newContentDescription
        })
      })
      if (!res.ok) throw new Error('Failed to create content')
      toast.success(`New ${newContentType.replace('-', ' ')} "${newContentTitle}" created successfully`)
      setShowNewContentDialog(false)
      setNewContentTitle('')
      setNewContentDescription('')
    } catch {
      toast.error('Failed to create content')
    } finally {
      setIsCreatingContent(false)
    }
  }

  // Handler for exporting content
  const handleExport = async () => {
    setIsExporting(true)
    try {
      const res = await fetch(`/api/ai-content?action=export&format=${exportFormat}&includeMetadata=${exportIncludeMetadata}&dateRange=${exportDateRange}`)
      if (!res.ok) throw new Error('Export failed')

      if (exportFormat === 'csv') {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `ai-content-export-${Date.now()}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else {
        const { data } = await res.json()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `ai-content-export-${Date.now()}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
      toast.success(`Content exported as ${exportFormat.toUpperCase()} successfully`)
      setShowExportDialog(false)
    } catch {
      toast.error('Failed to export content')
    } finally {
      setIsExporting(false)
    }
  }

  // Handler for saving settings
  const handleSaveSettings = async () => {
    setIsSavingSettings(true)
    try {
      const settings = {
        aiModel,
        autoSaveEnabled,
        defaultTone,
        maxTokens: parseInt(maxTokens)
      }
      const res = await fetch('/api/ai-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_settings', ...settings })
      })
      if (!res.ok) throw new Error('Failed to save settings')
      localStorage.setItem('aiContentStudioSettings', JSON.stringify(settings))
      toast.success('AI Content Studio settings saved successfully')
      setShowSettingsDialog(false)
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setIsSavingSettings(false)
    }
  }

  // Handler for sharing content
  const handleShare = async () => {
    if (!shareEmail.trim()) {
      toast.error('Please enter an email address')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shareEmail)) {
      toast.error('Please enter a valid email address')
      return
    }
    setIsSharing(true)
    try {
      const res = await fetch('/api/ai-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'share',
          email: shareEmail,
          message: shareMessage,
          permission: sharePermission
        })
      })
      if (!res.ok) throw new Error('Failed to share')
      toast.success(`Content shared with ${shareEmail} successfully`)
      setShowShareDialog(false)
      setShareEmail('')
      setShareMessage('')
    } catch {
      toast.error('Failed to share content')
    } finally {
      setIsSharing(false)
    }
  }

  // Handler for scheduling content
  const handleSchedule = async () => {
    if (!scheduleDate || !scheduleTime) {
      toast.error('Please select both date and time')
      return
    }
    setIsScheduling(true)
    try {
      const res = await fetch('/api/ai-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'schedule',
          date: scheduleDate,
          time: scheduleTime,
          platform: schedulePlatform
        })
      })
      if (!res.ok) throw new Error('Failed to schedule')
      const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`)
      toast.success(`Content scheduled for ${scheduledDateTime.toLocaleString()} on ${schedulePlatform}`)
      setShowScheduleDialog(false)
      setScheduleDate('')
      setScheduleTime('')
    } catch {
      toast.error('Failed to schedule content')
    } finally {
      setIsScheduling(false)
    }
  }

  // Handler for saving template
  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      toast.error('Please enter a template name')
      return
    }
    setIsSavingTemplate(true)
    try {
      const res = await fetch('/api/ai-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_template',
          name: templateName,
          category: templateCategory
        })
      })
      if (!res.ok) throw new Error('Failed to save template')
      // Also save to localStorage for quick access
      const templates = JSON.parse(localStorage.getItem('aiContentTemplates') || '[]')
      templates.push({
        id: Date.now().toString(),
        name: templateName,
        category: templateCategory,
        createdAt: new Date().toISOString()
      })
      localStorage.setItem('aiContentTemplates', JSON.stringify(templates))
      toast.success(`Template "${templateName}" saved successfully`)
      setShowTemplateDialog(false)
      setTemplateName('')
    } catch {
      toast.error('Failed to save template')
    } finally {
      setIsSavingTemplate(false)
    }
  }

  // Handler for loading history item
  const handleLoadHistoryItem = (item: typeof contentHistory[0]) => {
    toast.success(`Loading "${item.title}" from history`)
    setShowHistoryDialog(false)
  }

  // Handler for deleting history item
  const handleDeleteHistoryItem = (item: typeof contentHistory[0]) => {
    toast.success(`"${item.title}" removed from history`)
  }

  // Handler for viewing analytics
  const handleViewAnalytics = () => {
    setShowAnalyticsDialog(true)
  }

  // Handler for quick generate
  const handleQuickGenerate = () => {
    toast.success('Quick generate started - AI is creating content')
  }

  // Handler for toggling favorite
  const handleToggleFavorite = (itemId: string, isFavorite: boolean) => {
    toast.success(isFavorite ? 'Added to favorites' : 'Removed from favorites')
  }

  // Handler for filtering content
  const handleFilterContent = (filterType: string) => {
    toast.info(`Filtering by: ${filterType}`)
  }

  // Handler for searching content
  const handleSearchContent = (query: string) => {
    if (query.trim()) {
      toast.info(`Searching for: ${query}`)
    }
  }

  useEffect(() => {
    if (userId) {
      announce('AI Content Studio loaded', 'polite')
    }
  }, [userId, announce])

  // Load saved settings on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('aiContentStudioSettings')
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings)
        if (settings.aiModel) setAiModel(settings.aiModel)
        if (typeof settings.autoSaveEnabled === 'boolean') setAutoSaveEnabled(settings.autoSaveEnabled)
        if (settings.defaultTone) setDefaultTone(settings.defaultTone)
        if (settings.maxTokens) setMaxTokens(String(settings.maxTokens))
      } catch {
        // Ignore parse errors
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">AI Content Studio</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistoryDialog(true)}
            >
              <History className="w-4 h-4 mr-2" />
              History
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewAnalytics}
            >
              <BarChart2 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTemplateDialog(true)}
            >
              <Bookmark className="w-4 h-4 mr-2" />
              Templates
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleQuickGenerate}
            >
              <Zap className="w-4 h-4 mr-2" />
              Quick Generate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowScheduleDialog(true)}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Schedule
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowShareDialog(true)}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettingsDialog(true)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <p className="text-gray-600">
          Create professional emails, proposals, and marketing content with AI assistance
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="emails" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="emails">
            <Mail className="w-4 h-4 mr-2" />
            Email Templates
          </TabsTrigger>
          <TabsTrigger value="proposals">
            <FileText className="w-4 h-4 mr-2" />
            Proposal Generator
          </TabsTrigger>
          <TabsTrigger value="content">
            <Brain className="w-4 h-4 mr-2" />
            Marketing Content
          </TabsTrigger>
        </TabsList>

        <TabsContent value="emails" className="mt-6">
          <SmartEmailTemplates />
        </TabsContent>

        <TabsContent value="proposals" className="mt-6">
          <AIProposalGenerator />
        </TabsContent>

        <TabsContent value="content" className="mt-6">
          <MarketingContentGenerator aiContentStudioQuickActions={aiContentStudioQuickActions} />
        </TabsContent>
      </Tabs>

      {/* New Content Dialog */}
      <Dialog open={showNewContentDialog} onOpenChange={setShowNewContentDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-purple-600" />
              Create New Content
            </DialogTitle>
            <DialogDescription>
              Create a new AI-powered content piece. Fill in the details below to get started.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="content-title">Content Title</Label>
              <Input
                id="content-title"
                placeholder="Enter a title for your content..."
                value={newContentTitle}
                onChange={(e) => setNewContentTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content-type">Content Type</Label>
              <Select value={newContentType} onValueChange={setNewContentType}>
                <SelectTrigger id="content-type">
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="social-post">Social Media Post</SelectItem>
                  <SelectItem value="email-template">Email Template</SelectItem>
                  <SelectItem value="blog-article">Blog Article</SelectItem>
                  <SelectItem value="ad-copy">Advertisement Copy</SelectItem>
                  <SelectItem value="proposal">Proposal</SelectItem>
                  <SelectItem value="newsletter">Newsletter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content-description">Description (Optional)</Label>
              <Textarea
                id="content-description"
                placeholder="Describe what you want to create..."
                value={newContentDescription}
                onChange={(e) => setNewContentDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewContentDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateContent}
              disabled={isCreatingContent}
              className="bg-gradient-to-r from-purple-500 to-pink-600"
            >
              {isCreatingContent ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Content
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-purple-600" />
              Export Content
            </DialogTitle>
            <DialogDescription>
              Export your AI-generated content in your preferred format.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="export-format">Export Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger id="export-format">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="txt">Plain Text</SelectItem>
                  <SelectItem value="md">Markdown</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="export-date-range">Date Range</Label>
              <Select value={exportDateRange} onValueChange={setExportDateRange}>
                <SelectTrigger id="export-date-range">
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Content</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="include-metadata">Include Metadata</Label>
                <p className="text-sm text-muted-foreground">
                  Include creation dates, AI models used, etc.
                </p>
              </div>
              <Switch
                id="include-metadata"
                checked={exportIncludeMetadata}
                onCheckedChange={setExportIncludeMetadata}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="bg-gradient-to-r from-purple-500 to-pink-600"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-600" />
              AI Content Studio Settings
            </DialogTitle>
            <DialogDescription>
              Configure your AI content generation preferences.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="ai-model">AI Model</Label>
              <Select value={aiModel} onValueChange={setAiModel}>
                <SelectTrigger id="ai-model">
                  <SelectValue placeholder="Select AI model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4">GPT-4 (Most Capable)</SelectItem>
                  <SelectItem value="gpt-4-turbo">GPT-4 Turbo (Faster)</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Economical)</SelectItem>
                  <SelectItem value="claude-3">Claude 3 (Alternative)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="default-tone">Default Writing Tone</Label>
              <Select value={defaultTone} onValueChange={setDefaultTone}>
                <SelectTrigger id="default-tone">
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="persuasive">Persuasive</SelectItem>
                  <SelectItem value="informative">Informative</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="max-tokens">Max Output Length (Tokens)</Label>
              <Input
                id="max-tokens"
                type="number"
                min="100"
                max="4000"
                value={maxTokens}
                onChange={(e) => setMaxTokens(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Recommended: 1000-2000 for most content
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-save">Auto-Save Drafts</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically save content as you work
                </p>
              </div>
              <Switch
                id="auto-save"
                checked={autoSaveEnabled}
                onCheckedChange={setAutoSaveEnabled}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveSettings}
              disabled={isSavingSettings}
              className="bg-gradient-to-r from-purple-500 to-pink-600"
            >
              {isSavingSettings ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-purple-600" />
              Content History
            </DialogTitle>
            <DialogDescription>
              View and manage your previously created content.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search history..."
                  className="pl-9"
                  onChange={(e) => handleSearchContent(e.target.value)}
                />
              </div>
              <Select onValueChange={handleFilterContent}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="social">Social Posts</SelectItem>
                  <SelectItem value="email">Emails</SelectItem>
                  <SelectItem value="ad">Advertisements</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {contentHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <FileText className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.platform} - {item.createdAt}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleFavorite(item.id, true)}
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLoadHistoryItem(item)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteHistoryItem(item)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowHistoryDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-purple-600" />
              Share Content
            </DialogTitle>
            <DialogDescription>
              Share your AI-generated content with team members or collaborators.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="share-email">Email Address</Label>
              <Input
                id="share-email"
                type="email"
                placeholder="colleague@company.com"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="share-permission">Permission Level</Label>
              <Select value={sharePermission} onValueChange={setSharePermission}>
                <SelectTrigger id="share-permission">
                  <SelectValue placeholder="Select permission" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">View Only</SelectItem>
                  <SelectItem value="comment">Can Comment</SelectItem>
                  <SelectItem value="edit">Can Edit</SelectItem>
                  <SelectItem value="admin">Full Access</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="share-message">Message (Optional)</Label>
              <Textarea
                id="share-message"
                placeholder="Add a message for the recipient..."
                value={shareMessage}
                onChange={(e) => setShareMessage(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleShare}
              disabled={isSharing}
              className="bg-gradient-to-r from-purple-500 to-pink-600"
            >
              {isSharing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sharing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Share
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Schedule Content
            </DialogTitle>
            <DialogDescription>
              Schedule your content to be published at a specific date and time.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="schedule-platform">Platform</Label>
              <Select value={schedulePlatform} onValueChange={setSchedulePlatform}>
                <SelectTrigger id="schedule-platform">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="email">Email Campaign</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="grid gap-2">
                <Label htmlFor="schedule-date">Date</Label>
                <Input
                  id="schedule-date"
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="schedule-time">Time</Label>
                <Input
                  id="schedule-time"
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                />
              </div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-purple-700">
                <Clock className="h-4 w-4" />
                <span>Best posting times for {schedulePlatform}: 9:00 AM, 12:00 PM, 6:00 PM</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSchedule}
              disabled={isScheduling}
              className="bg-gradient-to-r from-purple-500 to-pink-600"
            >
              {isScheduling ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bookmark className="h-5 w-5 text-purple-600" />
              Save as Template
            </DialogTitle>
            <DialogDescription>
              Save your current content as a reusable template for future use.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                placeholder="e.g., Product Launch Post"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="template-category">Category</Label>
              <Select value={templateCategory} onValueChange={setTemplateCategory}>
                <SelectTrigger id="template-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="social">Social Media</SelectItem>
                  <SelectItem value="email">Email Marketing</SelectItem>
                  <SelectItem value="ad">Advertisements</SelectItem>
                  <SelectItem value="blog">Blog Posts</SelectItem>
                  <SelectItem value="newsletter">Newsletters</SelectItem>
                  <SelectItem value="proposal">Proposals</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveTemplate}
              disabled={isSavingTemplate}
              className="bg-gradient-to-r from-purple-500 to-pink-600"
            >
              {isSavingTemplate ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <BookmarkCheck className="w-4 h-4 mr-2" />
                  Save Template
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Analytics Dialog */}
      <Dialog open={showAnalyticsDialog} onOpenChange={setShowAnalyticsDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-purple-600" />
              Content Analytics
            </DialogTitle>
            <DialogDescription>
              View performance metrics for your AI-generated content.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
              <Card className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-green-600">2,450</p>
                <p className="text-xs text-muted-foreground">Total Views</p>
              </Card>
              <Card className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-blue-600">342</p>
                <p className="text-xs text-muted-foreground">Engagements</p>
              </Card>
              <Card className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Target className="h-5 w-5 text-purple-500" />
                </div>
                <p className="text-2xl font-bold text-purple-600">89%</p>
                <p className="text-xs text-muted-foreground">Quality Score</p>
              </Card>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Top Performing Content</h4>
              {contentHistory.slice(0, 3).map((item, index) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-purple-600">#{index + 1}</span>
                    <span className="text-sm">{item.title}</span>
                  </div>
                  <Badge variant="outline">{item.platform}</Badge>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAnalyticsDialog(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                toast.success('Full analytics report exported')
                setShowAnalyticsDialog(false)
              }}
              className="bg-gradient-to-r from-purple-500 to-pink-600"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Marketing Content Generator Component
interface MarketingContentGeneratorProps {
  aiContentStudioQuickActions: Array<{
    id: string
    label: string
    icon: string
    shortcut: string
    action: () => void
  }>
}

function MarketingContentGenerator({ aiContentStudioQuickActions }: MarketingContentGeneratorProps) {
  const [contentType, setContentType] = useState('social')
  const [platform, setPlatform] = useState('instagram')
  const [topic, setTopic] = useState('')
  const [generatedContent, setGeneratedContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState('')
  const [tone, setTone] = useState('professional')
  const [showPreview, setShowPreview] = useState(true)
  const [savedDraft, setSavedDraft] = useState(false)

  const platformIcons: Record<string, React.ReactNode> = {
    instagram: <Instagram className="w-4 h-4" />,
    twitter: <Twitter className="w-4 h-4" />,
    linkedin: <Linkedin className="w-4 h-4" />,
    facebook: <Facebook className="w-4 h-4" />
  }

  const contentTemplates: Record<string, Record<string, string>> = {
    instagram: {
      social: "✨ Exciting news! We're revolutionizing [TOPIC] with cutting-edge solutions.\n\n🚀 Here's what makes us different:\n• Innovation-first approach\n• Customer-centric design\n• Results that speak for themselves\n\nDouble tap if you're ready for the future! 💪\n\n#innovation #business #growth #success",
      ad: "🔥 Limited Time Offer!\n\nTransform your [TOPIC] strategy today.\n\n✅ 50% more efficiency\n✅ Save 10+ hours weekly\n✅ Join 10,000+ happy customers\n\n👉 Link in bio for exclusive access!\n\n#ad #sponsored"
    },
    twitter: {
      social: "🚀 Big things happening with [TOPIC]!\n\nWe've been working on something special that's going to change the game.\n\nStay tuned for the reveal 👀\n\n#tech #innovation",
      ad: "🎯 Ready to level up your [TOPIC] game?\n\nOur solution has helped 10,000+ professionals achieve more in less time.\n\nTry it free → [link]"
    },
    linkedin: {
      social: "I'm excited to share our latest insights on [TOPIC].\n\nAfter months of research and development, we've discovered key strategies that are transforming how businesses approach this challenge.\n\nHere are 3 key takeaways:\n\n1. Innovation requires commitment\n2. Customer feedback drives improvement\n3. Data-driven decisions lead to success\n\nWhat's your experience with [TOPIC]? I'd love to hear your thoughts in the comments.\n\n#businessgrowth #leadership #innovation",
      ad: "🎯 Attention [TOPIC] professionals!\n\nAre you struggling to keep up with industry changes?\n\nOur comprehensive solution helps you:\n• Streamline workflows\n• Increase productivity by 40%\n• Stay ahead of competition\n\nJoin 5,000+ industry leaders who trust us.\n\n[Learn More →]"
    },
    facebook: {
      social: "🌟 We're thrilled to share something amazing about [TOPIC]!\n\nOur team has been working hard to bring you the best experience possible, and the results are incredible.\n\n💬 Tell us what you think in the comments!\n\n❤️ Like and share if you agree!",
      ad: "📢 Special Announcement!\n\n[TOPIC] just got a whole lot easier.\n\n🎁 Get 30% off your first month\n⏰ Limited time offer\n🚀 Start seeing results in 7 days\n\n👉 Click 'Learn More' to get started!"
    }
  }

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic first')
      return
    }

    setIsGenerating(true)

    // Generate content from template
    const template = contentTemplates[platform]?.[contentType] || contentTemplates.instagram.social
    const generated = template.replace(/\[TOPIC\]/g, topic)

    setGeneratedContent(generated)
    setIsGenerating(false)
    toast.success('Content generated successfully!')
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  // Handler for toggling favorite
  const handleToggleFavorite = () => {
    setIsFavorited(!isFavorited)
    toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites')
  }

  // Handler for saving draft
  const handleSaveDraft = () => {
    if (!generatedContent) {
      toast.error('No content to save')
      return
    }
    const drafts = JSON.parse(localStorage.getItem('contentDrafts') || '[]')
    drafts.push({
      id: Date.now().toString(),
      content: generatedContent,
      platform,
      contentType,
      topic,
      savedAt: new Date().toISOString()
    })
    localStorage.setItem('contentDrafts', JSON.stringify(drafts))
    setSavedDraft(true)
    toast.success('Draft saved successfully')
    setTimeout(() => setSavedDraft(false), 2000)
  }

  // Handler for editing content
  const handleStartEdit = () => {
    setEditedContent(generatedContent)
    setIsEditing(true)
  }

  // Handler for saving edits
  const handleSaveEdit = () => {
    setGeneratedContent(editedContent)
    setIsEditing(false)
    toast.success('Content updated successfully')
  }

  // Handler for canceling edit
  const handleCancelEdit = () => {
    setEditedContent('')
    setIsEditing(false)
  }

  // Handler for downloading content
  const handleDownload = () => {
    if (!generatedContent) {
      toast.error('No content to download')
      return
    }
    const blob = new Blob([generatedContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${platform}-${contentType}-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Content downloaded successfully')
  }

  // Handler for clearing content
  const handleClearContent = () => {
    setGeneratedContent('')
    setTopic('')
    setIsFavorited(false)
    toast.info('Content cleared')
  }

  // Handler for changing tone
  const handleToneChange = (newTone: string) => {
    setTone(newTone)
    if (generatedContent) {
      toast.info(`Tone changed to ${newTone} - regenerate to apply`)
    }
  }

  // Handler for toggling preview
  const handleTogglePreview = () => {
    setShowPreview(!showPreview)
  }

  // Handler for sharing to platform
  const handleShareToPlatform = () => {
    if (!generatedContent) {
      toast.error('No content to share')
      return
    }
    // Copy to clipboard for sharing
    navigator.clipboard.writeText(generatedContent)
    toast.success(`Content copied - Ready to paste on ${platform}`)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Panel */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Wand2 className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold">Generate Marketing Content</h3>
        </div>

        <div className="space-y-4">
          
        {/* V2 Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <AIInsightsPanel insights={aiContentStudioAIInsights} />
          <PredictiveAnalytics predictions={aiContentStudioPredictions} />
          <CollaborationIndicator collaborators={aiContentStudioCollaborators} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <QuickActionsToolbar actions={aiContentStudioQuickActions} />
          <ActivityFeed activities={aiContentStudioActivities} />
        </div>
<div>
            <label className="text-sm font-medium mb-2 block">Content Type</label>
            <Select value={contentType} onValueChange={setContentType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="social">Social Media Post</SelectItem>
                <SelectItem value="ad">Advertisement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Platform</label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-6">
              {Object.entries(platformIcons).map(([key, icon]) => (
                <Button
                  key={key}
                  variant={platform === key ? 'default' : 'outline'}
                  className="flex items-center justify-center gap-2"
                  onClick={() => setPlatform(key)}
                >
                  {icon}
                  <span className="capitalize text-xs">{key}</span>
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Topic / Subject</label>
            <Textarea
              placeholder="e.g., product launch, industry trends, company milestone..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Content
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Output Panel */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold">Generated Content</h3>
          </div>
          {generatedContent && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                {platformIcons[platform]}
                <span className="capitalize">{platform}</span>
              </Badge>
              <Button variant="ghost" size="sm" onClick={handleToggleFavorite}>
                {isFavorited ? (
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                ) : (
                  <StarOff className="w-4 h-4" />
                )}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleTogglePreview}>
                {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          )}
        </div>

        {generatedContent ? (
          <div className="space-y-4">
            {showPreview && (
              <>
                {isEditing ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      rows={8}
                      className="w-full"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveEdit}>
                        <Check className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap text-sm">
                    {generatedContent}
                  </div>
                )}
              </>
            )}

            {/* Tone Selection */}
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Tone:</span>
              <div className="flex gap-1">
                {['professional', 'casual', 'friendly', 'persuasive'].map((t) => (
                  <Button
                    key={t}
                    variant={tone === t ? 'default' : 'ghost'}
                    size="sm"
                    className="text-xs h-7 px-2"
                    onClick={() => handleToneChange(t)}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={handleGenerate} disabled={isGenerating}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
              <Button variant="outline" size="sm" onClick={handleStartEdit} disabled={isEditing}>
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={handleSaveDraft}>
                {savedDraft ? <Check className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                {savedDraft ? 'Saved!' : 'Save Draft'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={handleShareToPlatform}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" onClick={handleClearContent}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>

            {/* Character Count */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{generatedContent.length} characters</span>
              <span>{generatedContent.split(/\s+/).filter(Boolean).length} words</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-400">
            <div className="text-center">
              <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Your generated content will appear here</p>
              <p className="text-sm mt-2">Enter a topic and click Generate Content to start</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
