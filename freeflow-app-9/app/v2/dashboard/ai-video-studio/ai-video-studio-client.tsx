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

import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const dynamic = 'force-dynamic';

import { AIVideoStudio } from '@/components/ai/ai-video-studio'

export const metadata = {
  title: 'AI Video Studio | FreeFlow',
  description: 'Create stunning videos with Veo 3, Kling, and more AI models'
}


// ============================================================================
// V2 COMPETITIVE MOCK DATA - AiVideoStudio Context
// ============================================================================

const aiVideoStudioAIInsights = [
  { id: '1', type: 'info' as const, title: 'Performance Update', description: 'System running optimally with 99.9% uptime this month.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '2', type: 'success' as const, title: 'Goal Achievement', description: 'Monthly targets exceeded by 15%. Great progress!', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Goals' },
  { id: '3', type: 'warning' as const, title: 'Action Required', description: 'Review pending items to maintain workflow efficiency.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Tasks' },
]

const aiVideoStudioCollaborators = [
  { id: '1', name: 'Alexandra Chen', avatar: '/avatars/alex.jpg', status: 'online' as const, role: 'Manager', lastActive: 'Now' },
  { id: '2', name: 'Marcus Johnson', avatar: '/avatars/marcus.jpg', status: 'online' as const, role: 'Developer', lastActive: '5m ago' },
  { id: '3', name: 'Sarah Williams', avatar: '/avatars/sarah.jpg', status: 'away' as const, role: 'Designer', lastActive: '30m ago' },
]

const aiVideoStudioPredictions = [
  { id: '1', label: 'Completion Rate', current: 85, target: 95, predicted: 92, confidence: 88, trend: 'up' as const },
  { id: '2', label: 'Efficiency Score', current: 78, target: 90, predicted: 86, confidence: 82, trend: 'up' as const },
]

const aiVideoStudioActivities = [
  { id: '1', user: 'Alexandra Chen', action: 'updated', target: 'system settings', timestamp: '5m ago', type: 'info' as const },
  { id: '2', user: 'Marcus Johnson', action: 'completed', target: 'task review', timestamp: '15m ago', type: 'success' as const },
  { id: '3', user: 'System', action: 'generated', target: 'weekly report', timestamp: '1h ago', type: 'info' as const },
]

export default function AiVideoStudioClient() {
  // Dialog state variables
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)

  // Form state
  const [projectName, setProjectName] = useState('')
  const [exportFormat, setExportFormat] = useState('mp4')

  const aiVideoStudioQuickActions = [
    { id: '1', label: 'New Item', icon: 'Plus', shortcut: 'N', action: () => setShowNewProjectDialog(true) },
    { id: '2', label: 'Export', icon: 'Download', shortcut: 'E', action: () => setShowExportDialog(true) },
    { id: '3', label: 'Settings', icon: 'Settings', shortcut: 'S', action: () => setShowSettingsDialog(true) },
  ]

  const handleCreateProject = () => {
    toast.success(`Video project "${projectName || 'Untitled'}" created successfully`)
    setProjectName('')
    setShowNewProjectDialog(false)
  }

  const handleExport = () => {
    toast.success(`Video exported as ${exportFormat.toUpperCase()} successfully`)
    setShowExportDialog(false)
  }

  const handleSaveSettings = () => {
    toast.success('Video studio settings saved')
    setShowSettingsDialog(false)
  }

  return (
    <>
      <AIVideoStudio />

      {/* New Video Project Dialog */}
      <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Video Project</DialogTitle>
            <DialogDescription>
              Set up a new AI video project with your preferred settings.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                placeholder="Enter project name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="resolution">Resolution</Label>
              <select
                id="resolution"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="1080p">1080p (Full HD)</option>
                <option value="4k">4K (Ultra HD)</option>
                <option value="720p">720p (HD)</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ai-model">AI Model</Label>
              <select
                id="ai-model"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="veo3">Veo 3</option>
                <option value="kling">Kling</option>
                <option value="runway">Runway Gen-3</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewProjectDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateProject}>Create Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Video Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Video</DialogTitle>
            <DialogDescription>
              Choose your export format and quality settings.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="export-format">Format</Label>
              <select
                id="export-format"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
              >
                <option value="mp4">MP4</option>
                <option value="webm">WebM</option>
                <option value="mov">MOV</option>
                <option value="avi">AVI</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="export-quality">Quality</Label>
              <select
                id="export-quality"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="high">High (Original Quality)</option>
                <option value="medium">Medium (Balanced)</option>
                <option value="low">Low (Smaller File Size)</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="export-fps">Frame Rate</Label>
              <select
                id="export-fps"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="60">60 FPS</option>
                <option value="30">30 FPS</option>
                <option value="24">24 FPS (Cinematic)</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport}>Export Video</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Video Studio Settings</DialogTitle>
            <DialogDescription>
              Configure your AI Video Studio preferences.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="default-model">Default AI Model</Label>
              <select
                id="default-model"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="veo3">Veo 3</option>
                <option value="kling">Kling</option>
                <option value="runway">Runway Gen-3</option>
                <option value="pika">Pika Labs</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="default-resolution">Default Resolution</Label>
              <select
                id="default-resolution"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="4k">4K (Ultra HD)</option>
                <option value="1080p">1080p (Full HD)</option>
                <option value="720p">720p (HD)</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="auto-save">Auto-save Interval</Label>
              <select
                id="auto-save"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="1">Every 1 minute</option>
                <option value="5">Every 5 minutes</option>
                <option value="10">Every 10 minutes</option>
                <option value="off">Disabled</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="hardware-accel" className="rounded" defaultChecked />
              <Label htmlFor="hardware-accel">Enable hardware acceleration</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="preview-quality" className="rounded" defaultChecked />
              <Label htmlFor="preview-quality">High quality preview</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings}>Save Settings</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
