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
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Video,
  Sparkles,
  Download,
  Share2,
  Settings,
  Plus,
  Wand2,
  Film,
  HelpCircle,
  Clock,
  Trash2,
  Copy,
  ExternalLink,
  Mail,
  Link2,
  Zap,
  Crown,
  RefreshCw,
  Upload
} from 'lucide-react'

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
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)
  const [showRenderQueueDialog, setShowRenderQueueDialog] = useState(false)
  const [showHelpDialog, setShowHelpDialog] = useState(false)
  const [showAIEnhanceDialog, setShowAIEnhanceDialog] = useState(false)
  const [showTemplatesDialog, setShowTemplatesDialog] = useState(false)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)

  // Form state
  const [projectName, setProjectName] = useState('')
  const [exportFormat, setExportFormat] = useState('mp4')
  const [shareEmail, setShareEmail] = useState('')
  const [shareLink, setShareLink] = useState('')
  const [videoPrompt, setVideoPrompt] = useState('')
  const [selectedModel, setSelectedModel] = useState('veo3')
  const [generateProgress, setGenerateProgress] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)

  // Mock render queue
  const [renderQueue, setRenderQueue] = useState([
    { id: '1', name: 'Product Demo', status: 'completed', progress: 100, duration: '8s' },
    { id: '2', name: 'Brand Intro', status: 'processing', progress: 65, duration: '12s' },
    { id: '3', name: 'Social Clip', status: 'queued', progress: 0, duration: '6s' },
  ])

  const aiVideoStudioQuickActions = [
    { id: '1', label: 'New Item', icon: 'Plus', shortcut: 'N', action: () => setShowNewProjectDialog(true) },
    { id: '2', label: 'Export', icon: 'Download', shortcut: 'E', action: () => setShowExportDialog(true) },
    { id: '3', label: 'Settings', icon: 'Settings', shortcut: 'S', action: () => setShowSettingsDialog(true) },
    { id: '4', label: 'Share', icon: 'Share2', shortcut: 'H', action: () => setShowShareDialog(true) },
    { id: '5', label: 'Generate', icon: 'Sparkles', shortcut: 'G', action: () => setShowGenerateDialog(true) },
    { id: '6', label: 'Queue', icon: 'Clock', shortcut: 'Q', action: () => setShowRenderQueueDialog(true) },
  ]

  const handleCreateProject = () => {
    if (!projectName.trim()) {
      toast.error('Please enter a project name')
      return
    }
    toast.success(`Video project "${projectName}" created successfully`)
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

  const handleShareVideo = () => {
    if (shareEmail) {
      toast.success(`Video shared with ${shareEmail}`)
      setShareEmail('')
    } else {
      toast.success('Share link copied to clipboard')
    }
    setShowShareDialog(false)
  }

  const handleCopyShareLink = () => {
    const link = `https://freeflow.app/video/${Date.now()}`
    setShareLink(link)
    navigator.clipboard.writeText(link)
    toast.success('Share link copied to clipboard')
  }

  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim()) {
      toast.error('Please enter a video prompt')
      return
    }
    setIsGenerating(true)
    setGenerateProgress(0)

    // Simulate video generation progress
    const interval = setInterval(() => {
      setGenerateProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsGenerating(false)
          toast.success('Video generated successfully!')
          setShowGenerateDialog(false)
          setVideoPrompt('')
          return 100
        }
        return prev + 10
      })
    }, 500)
  }

  const handleCancelGeneration = () => {
    setIsGenerating(false)
    setGenerateProgress(0)
    toast.info('Video generation cancelled')
  }

  const handleClearRenderQueue = () => {
    if (confirm('Are you sure you want to clear all completed items from the render queue?')) {
      setRenderQueue(prev => prev.filter(item => item.status === 'processing'))
      toast.success('Render queue cleared')
    }
  }

  const handleRemoveFromQueue = (id: string) => {
    if (confirm('Are you sure you want to remove this item from the render queue?')) {
      setRenderQueue(prev => prev.filter(item => item.id !== id))
      toast.success('Removed from render queue')
    }
  }

  const handleRetryRender = (id: string) => {
    setRenderQueue(prev => prev.map(item =>
      item.id === id ? { ...item, status: 'processing', progress: 0 } : item
    ))
    toast.info('Retrying render...')
  }

  const handleApplyTemplate = (template: string) => {
    setVideoPrompt(template)
    setShowTemplatesDialog(false)
    setShowGenerateDialog(true)
    toast.success('Template applied')
  }

  const handleAIEnhance = () => {
    toast.success('AI enhancement applied to your video')
    setShowAIEnhanceDialog(false)
  }

  const handleUpgrade = () => {
    toast.success('Redirecting to upgrade page...')
    setShowUpgradeDialog(false)
  }

  return (
    <>
      <AIVideoStudio />

      {/* Action Toolbar */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-wrap gap-2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
          <Button onClick={() => setShowNewProjectDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
          <Button variant="outline" onClick={() => setShowGenerateDialog(true)} className="gap-2">
            <Sparkles className="h-4 w-4" />
            Generate Video
          </Button>
          <Button variant="outline" onClick={() => setShowTemplatesDialog(true)} className="gap-2">
            <Film className="h-4 w-4" />
            Templates
          </Button>
          <Button variant="outline" onClick={() => setShowExportDialog(true)} className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" onClick={() => setShowShareDialog(true)} className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" onClick={() => setShowRenderQueueDialog(true)} className="gap-2">
            <Clock className="h-4 w-4" />
            Queue ({renderQueue.length})
          </Button>
          <div className="flex-1" />
          <Button variant="outline" onClick={() => setShowAIEnhanceDialog(true)} className="gap-2">
            <Wand2 className="h-4 w-4" />
            AI Enhance
          </Button>
          <Button variant="outline" onClick={() => setShowSettingsDialog(true)} className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          <Button variant="outline" onClick={() => setShowHelpDialog(true)} className="gap-2">
            <HelpCircle className="h-4 w-4" />
            Help
          </Button>
          <Button variant="default" onClick={() => setShowUpgradeDialog(true)} className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
            <Crown className="h-4 w-4" />
            Upgrade
          </Button>
        </div>
      </div>

      {/* Competitive Upgrade Components */}
      <div className="max-w-7xl mx-auto px-4 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <AIInsightsPanel insights={aiVideoStudioAIInsights} />
          <PredictiveAnalytics predictions={aiVideoStudioPredictions} />
          <CollaborationIndicator collaborators={aiVideoStudioCollaborators} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuickActionsToolbar actions={aiVideoStudioQuickActions} />
          <ActivityFeed activities={aiVideoStudioActivities} />
        </div>
      </div>

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
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
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

      {/* Share Video Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Video</DialogTitle>
            <DialogDescription>
              Share your video with collaborators or generate a public link.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="share-email">Share via Email</Label>
              <div className="flex gap-2">
                <Input
                  id="share-email"
                  type="email"
                  placeholder="Enter email address"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                />
                <Button onClick={() => {
                  if (shareEmail) {
                    /* TODO: Implement send email invitation API call */
                    toast.success(`Invitation sent to ${shareEmail}`)
                    setShareEmail('')
                  } else {
                    toast.error('Please enter an email address')
                  }
                }}>
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Share Link</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={shareLink || 'Click to generate link'}
                  className="bg-muted"
                />
                <Button variant="outline" onClick={handleCopyShareLink}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => {
                if (shareLink) {
                  window.open(shareLink, '_blank')
                } else {
                  toast.error('Please generate a share link first')
                }
              }}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Link
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => {
                if (shareLink) {
                  const embedCode = `<iframe src="${shareLink}" width="640" height="360" frameborder="0" allowfullscreen></iframe>`
                  navigator.clipboard.writeText(embedCode)
                  toast.success('Embedding code copied')
                } else {
                  toast.error('Please generate a share link first')
                }
              }}>
                <Link2 className="h-4 w-4 mr-2" />
                Embed
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleShareVideo}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate Video Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Generate AI Video</DialogTitle>
            <DialogDescription>
              Describe your video and let AI create it for you.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="video-prompt">Video Prompt</Label>
              <Textarea
                id="video-prompt"
                placeholder="Describe your video in detail... e.g., 'A serene sunset over a calm ocean with gentle waves'"
                value={videoPrompt}
                onChange={(e) => setVideoPrompt(e.target.value)}
                className="min-h-[100px]"
                disabled={isGenerating}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="gen-model">AI Model</Label>
                <select
                  id="gen-model"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  disabled={isGenerating}
                >
                  <option value="veo3">Veo 3 (Best Quality)</option>
                  <option value="kling">Kling (Fast)</option>
                  <option value="runway">Runway Gen-3</option>
                  <option value="pika">Pika Labs</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="gen-duration">Duration</Label>
                <select
                  id="gen-duration"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  disabled={isGenerating}
                >
                  <option value="4">4 seconds</option>
                  <option value="8">8 seconds</option>
                  <option value="12">12 seconds</option>
                  <option value="16">16 seconds</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowTemplatesDialog(true)}
                disabled={isGenerating}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Templates
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowAIEnhanceDialog(true)}
                disabled={isGenerating}
              >
                <Wand2 className="h-4 w-4 mr-2" />
                AI Enhance
              </Button>
            </div>
            {isGenerating && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Generating video...</span>
                  <span>{generateProgress}%</span>
                </div>
                <Progress value={generateProgress} />
              </div>
            )}
          </div>
          <DialogFooter>
            {isGenerating ? (
              <Button variant="destructive" onClick={handleCancelGeneration}>
                Cancel Generation
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleGenerateVideo}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Video
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Render Queue Dialog */}
      <Dialog open={showRenderQueueDialog} onOpenChange={setShowRenderQueueDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Render Queue</DialogTitle>
            <DialogDescription>
              Manage your video rendering queue and view progress.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <ScrollArea className="h-[300px]">
              {renderQueue.length > 0 ? (
                <div className="space-y-3">
                  {renderQueue.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{item.name}</span>
                          <Badge variant={
                            item.status === 'completed' ? 'default' :
                            item.status === 'processing' ? 'secondary' : 'outline'
                          }>
                            {item.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{item.duration}</span>
                        </div>
                        {item.status === 'processing' && (
                          <Progress value={item.progress} className="mt-2 h-1" />
                        )}
                      </div>
                      <div className="flex gap-1">
                        {item.status === 'completed' && (
                          <Button variant="ghost" size="icon" onClick={() => {
                            /* TODO: Implement actual video download - trigger file download */
                            toast.success('Video downloaded')
                          }}>
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        {item.status !== 'processing' && (
                          <Button variant="ghost" size="icon" onClick={() => handleRetryRender(item.id)}>
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveFromQueue(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Film className="h-12 w-12 mb-2 opacity-50" />
                  <p>No videos in queue</p>
                </div>
              )}
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClearRenderQueue}>
              Clear Completed
            </Button>
            <Button onClick={() => setShowRenderQueueDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Help Dialog */}
      <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI Video Studio Help</DialogTitle>
            <DialogDescription>
              Learn how to create amazing videos with AI.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <Wand2 className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Text to Video</h4>
                  <p className="text-sm text-muted-foreground">Describe your video and AI will generate it for you.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <Upload className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Image to Video</h4>
                  <p className="text-sm text-muted-foreground">Upload an image and animate it with AI.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <Film className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Keyframe Animation</h4>
                  <p className="text-sm text-muted-foreground">Create smooth transitions between two images.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <Plus className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Extend Video</h4>
                  <p className="text-sm text-muted-foreground">Add more content to existing videos.</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              window.open('https://docs.freeflow.app/ai-video-studio', '_blank')
            }}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Full Documentation
            </Button>
            <Button onClick={() => setShowHelpDialog(false)}>
              Got It
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Enhancement Dialog */}
      <Dialog open={showAIEnhanceDialog} onOpenChange={setShowAIEnhanceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI Enhancement</DialogTitle>
            <DialogDescription>
              Enhance your video with AI-powered improvements.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="font-medium">Upscale to 4K</p>
                    <p className="text-xs text-muted-foreground">Enhance resolution with AI</p>
                  </div>
                </div>
                <input type="checkbox" className="rounded" defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="font-medium">Frame Interpolation</p>
                    <p className="text-xs text-muted-foreground">Smooth motion at 60fps</p>
                  </div>
                </div>
                <input type="checkbox" className="rounded" />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Video className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Stabilization</p>
                    <p className="text-xs text-muted-foreground">Remove camera shake</p>
                  </div>
                </div>
                <input type="checkbox" className="rounded" />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Wand2 className="h-5 w-5 text-pink-500" />
                  <div>
                    <p className="font-medium">Color Grading</p>
                    <p className="text-xs text-muted-foreground">Cinematic color enhancement</p>
                  </div>
                </div>
                <input type="checkbox" className="rounded" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAIEnhanceDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAIEnhance}>
              <Sparkles className="h-4 w-4 mr-2" />
              Apply Enhancements
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Templates Dialog */}
      <Dialog open={showTemplatesDialog} onOpenChange={setShowTemplatesDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Video Templates</DialogTitle>
            <DialogDescription>
              Choose a template to get started quickly.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <ScrollArea className="h-[350px]">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'Cinematic Nature', prompt: 'A breathtaking aerial shot of a mountain range at golden hour with dramatic clouds', icon: '🏔️' },
                  { name: 'Urban Timelapse', prompt: 'City skyline timelapse from day to night with lights turning on', icon: '🌃' },
                  { name: 'Product Showcase', prompt: 'Elegant product rotating on a reflective surface with studio lighting', icon: '✨' },
                  { name: 'Abstract Flow', prompt: 'Colorful abstract liquid flowing and morphing in slow motion', icon: '🎨' },
                  { name: 'Tech Innovation', prompt: 'Futuristic tech visualization with glowing circuits and data streams', icon: '💻' },
                  { name: 'Ocean Waves', prompt: 'Calm ocean waves gently rolling onto a pristine beach at sunset', icon: '🌊' },
                  { name: 'Space Journey', prompt: 'Flying through a nebula in deep space with colorful cosmic clouds', icon: '🚀' },
                  { name: 'Forest Walk', prompt: 'Walking through a mystical forest with sunbeams filtering through trees', icon: '🌲' },
                ].map((template) => (
                  <Button
                    key={template.name}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start gap-2"
                    onClick={() => handleApplyTemplate(template.prompt)}
                  >
                    <span className="text-2xl">{template.icon}</span>
                    <span className="font-medium">{template.name}</span>
                    <span className="text-xs text-muted-foreground text-left line-clamp-2">{template.prompt}</span>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplatesDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade to Pro</DialogTitle>
            <DialogDescription>
              Unlock premium AI video generation features.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="text-center p-6 border-2 border-purple-500 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <Crown className="h-12 w-12 text-purple-500 mx-auto mb-3" />
              <h3 className="text-xl font-bold mb-2">Pro Plan</h3>
              <p className="text-2xl font-bold text-purple-600 mb-4">$29/month</p>
              <ul className="text-sm text-left space-y-2">
                <li className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  Unlimited video generation
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  4K resolution export
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  Priority rendering queue
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  All AI models included
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  Commercial usage rights
                </li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
              Maybe Later
            </Button>
            <Button onClick={handleUpgrade} className="bg-purple-600 hover:bg-purple-700">
              <Crown className="h-4 w-4 mr-2" />
              Upgrade Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
