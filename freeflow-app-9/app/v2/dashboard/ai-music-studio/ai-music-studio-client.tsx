'use client'
// Enhanced & Competitive Upgrade Components







export const dynamic = 'force-dynamic';

import AIMusicStudio from '@/components/ai/ai-music-studio'
import { toast } from 'sonner'
import { CollapsibleInsightsPanel, InsightsToggleButton, useInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Activity, BarChart3, Zap } from 'lucide-react'



// ============================================================================
// V2 COMPETITIVE MOCK DATA - AiMusicStudio Context
// ============================================================================

const aiMusicStudioAIInsights = [
  { id: '1', type: 'info' as const, title: 'Performance Update', description: 'System running optimally with 99.9% uptime this month.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '2', type: 'success' as const, title: 'Goal Achievement', description: 'Monthly targets exceeded by 15%. Great progress!', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Goals' },
  { id: '3', type: 'warning' as const, title: 'Action Required', description: 'Review pending items to maintain workflow efficiency.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Tasks' },
]

const aiMusicStudioCollaborators = [
  { id: '1', name: 'Alexandra Chen', avatar: '/avatars/alex.jpg', status: 'online' as const, role: 'Manager', lastActive: 'Now' },
  { id: '2', name: 'Marcus Johnson', avatar: '/avatars/marcus.jpg', status: 'online' as const, role: 'Developer', lastActive: '5m ago' },
  { id: '3', name: 'Sarah Williams', avatar: '/avatars/sarah.jpg', status: 'away' as const, role: 'Designer', lastActive: '30m ago' },
]

const aiMusicStudioPredictions = [
  { id: '1', label: 'Completion Rate', current: 85, target: 95, predicted: 92, confidence: 88, trend: 'up' as const },
  { id: '2', label: 'Efficiency Score', current: 78, target: 90, predicted: 86, confidence: 82, trend: 'up' as const },
]

const aiMusicStudioActivities = [
  { id: '1', user: 'Alexandra Chen', action: 'updated', target: 'system settings', timestamp: '5m ago', type: 'info' as const },
  { id: '2', user: 'Marcus Johnson', action: 'completed', target: 'task review', timestamp: '15m ago', type: 'success' as const },
  { id: '3', user: 'System', action: 'generated', target: 'weekly report', timestamp: '1h ago', type: 'info' as const },
]

const aiMusicStudioQuickActions = [
  { id: '1', label: 'New Item', icon: 'Plus', shortcut: 'N', action: () => {
    toast.promise(
      fetch('/api/music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', name: 'New Track', genre: 'electronic', tempo: 120 })
      }).then(res => {
        if (!res.ok) throw new Error('Failed to create track')
        return res.json()
      }),
      {
        loading: 'Creating new music track...',
        success: 'New music track created successfully',
        error: 'Failed to create music track'
      }
    )
  }},
  { id: '2', label: 'Export', icon: 'Download', shortcut: 'E', action: () => {
    toast.promise(
      fetch('/api/music?action=export').then(res => {
        if (!res.ok) throw new Error('Export failed')
        return res.json()
      }),
      {
        loading: 'Exporting audio files...',
        success: 'Audio files exported successfully',
        error: 'Failed to export audio files'
      }
    )
  }},
  { id: '3', label: 'Settings', icon: 'Settings', shortcut: 'S', action: () => {
    toast.promise(
      fetch('/api/music?action=settings').then(res => {
        if (!res.ok) throw new Error('Failed to load settings')
        return res.json()
      }),
      {
        loading: 'Loading music studio settings...',
        success: 'Settings loaded',
        error: 'Failed to load settings'
      }
    )
  }},
]

export default function AiMusicStudioClient() {
  const insightsPanel = useInsightsPanel(false)

  return (
    <div className="space-y-6">
      {/* Header with Insights Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Music Studio</h1>
          <p className="text-muted-foreground">Create and compose music with AI</p>
        </div>
        <InsightsToggleButton isOpen={insightsPanel.isOpen} onToggle={insightsPanel.toggle} />
      </div>

      {/* Main Content */}
      <AIMusicStudio />

      {/* Collapsible Insights Panel */}
      {insightsPanel.isOpen && (
        <CollapsibleInsightsPanel title="AI Insights & Analytics" defaultOpen={true}>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tracks Created</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">847</div>
                <p className="text-xs text-muted-foreground">+18% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Composition Speed</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.8s</div>
                <p className="text-xs text-muted-foreground">Average generation time</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Audio Quality</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">96.1%</div>
                <p className="text-xs text-muted-foreground">AI quality assessment</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">15</div>
                <p className="text-xs text-muted-foreground">Current active users</p>
              </CardContent>
            </Card>
          </div>
        </CollapsibleInsightsPanel>
      )}
    </div>
  )
}
