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

import { toast } from 'sonner'

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

const aiVideoStudioQuickActions = [
  { id: '1', label: 'New Item', icon: 'Plus', shortcut: 'N', action: () => toast.promise(
    new Promise(resolve => setTimeout(resolve, 800)),
    { loading: 'Creating new video project...', success: 'Video project created successfully', error: 'Failed to create project' }
  ) },
  { id: '2', label: 'Export', icon: 'Download', shortcut: 'E', action: () => toast.promise(
    new Promise(resolve => setTimeout(resolve, 1500)),
    { loading: 'Exporting video...', success: 'Video exported successfully', error: 'Export failed' }
  ) },
  { id: '3', label: 'Settings', icon: 'Settings', shortcut: 'S', action: () => toast.promise(
    new Promise(resolve => setTimeout(resolve, 500)),
    { loading: 'Opening video studio settings...', success: 'Settings loaded', error: 'Failed to load settings' }
  ) },
]

export default function AiVideoStudioClient() {
  return <AIVideoStudio />
}
