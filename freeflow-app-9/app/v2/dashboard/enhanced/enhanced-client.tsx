'use client'

import { useState } from 'react'

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

// A+++ UTILITIES
import { useCurrentUser } from '@/hooks/use-ai-data'
import { useAnnouncer } from '@/lib/accessibility'


// ============================================================================
// V2 COMPETITIVE MOCK DATA - Enhanced Context
// ============================================================================

const enhancedAIInsights = [
  { id: '1', type: 'info' as const, title: 'Performance Update', description: 'System running optimally with 99.9% uptime this month.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '2', type: 'success' as const, title: 'Goal Achievement', description: 'Monthly targets exceeded by 15%. Great progress!', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Goals' },
  { id: '3', type: 'warning' as const, title: 'Action Required', description: 'Review pending items to maintain workflow efficiency.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Tasks' },
]

const enhancedCollaborators = [
  { id: '1', name: 'Alexandra Chen', avatar: '/avatars/alex.jpg', status: 'online' as const, role: 'Manager', lastActive: 'Now' },
  { id: '2', name: 'Marcus Johnson', avatar: '/avatars/marcus.jpg', status: 'online' as const, role: 'Developer', lastActive: '5m ago' },
  { id: '3', name: 'Sarah Williams', avatar: '/avatars/sarah.jpg', status: 'away' as const, role: 'Designer', lastActive: '30m ago' },
]

const enhancedPredictions = [
  { id: '1', label: 'Completion Rate', current: 85, target: 95, predicted: 92, confidence: 88, trend: 'up' as const },
  { id: '2', label: 'Efficiency Score', current: 78, target: 90, predicted: 86, confidence: 82, trend: 'up' as const },
]

const enhancedActivities = [
  { id: '1', user: 'Alexandra Chen', action: 'updated', target: 'system settings', timestamp: '5m ago', type: 'info' as const },
  { id: '2', user: 'Marcus Johnson', action: 'completed', target: 'task review', timestamp: '15m ago', type: 'success' as const },
  { id: '3', user: 'System', action: 'generated', target: 'weekly report', timestamp: '1h ago', type: 'info' as const },
]

export default function EnhancedClient() {
  // A+++ UTILITIES
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  // Dialog states for quick actions
  const [newItemDialogOpen, setNewItemDialogOpen] = useState(false)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)

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

  // Quick actions with real dialog triggers
  const enhancedQuickActions = [
    { id: '1', label: 'New Item', icon: 'Plus', shortcut: 'N', action: () => setNewItemDialogOpen(true) },
    { id: '2', label: 'Export', icon: 'Download', shortcut: 'E', action: () => setExportDialogOpen(true) },
    { id: '3', label: 'Settings', icon: 'Settings', shortcut: 'S', action: () => setSettingsDialogOpen(true) },
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