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


import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Brain,
  Sparkles,
  CheckCircle,
  Eye,
  Palette,
  Share2,
  Download,
  Loader,
  Plus,
  Settings,
  Copy,
  Mail,
  Link2,
  RefreshCw,
  Trash2,
  Save,
  UserPlus
} from 'lucide-react'

import { CardSkeleton } from '@/components/ui/loading-skeleton'
import { NoDataEmptyState, ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { createSimpleLogger } from '@/lib/simple-logger'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { KAZI_CLIENT_DATA } from '@/lib/client-zone-utils'

const logger = createSimpleLogger('ClientZoneAICollaborate')

// ============================================================================
// AI DESIGN OPTION TYPES
// ============================================================================

interface AIDesignOption {
  id: number
  title: string
  description: string
  category: 'logo' | 'palette' | 'layout' | 'typography'
  style: string
  image: string
  generatedAt: string
  selected: boolean
  rating?: number
  feedback?: string
}

// ============================================================================
// AI GENERATED OPTIONS DATA
// ============================================================================

const AI_DESIGN_OPTIONS: AIDesignOption[] = [
  {
    id: 1,
    title: 'Modern Minimalist Logo',
    description: 'Clean, geometric logo with modern aesthetics',
    category: 'logo',
    style: 'Modern & Minimalist',
    image: 'https://via.placeholder.com/400x300?text=Modern+Logo',
    generatedAt: '2024-01-26T10:30:00Z',
    selected: false,
    rating: 4.5
  },
  {
    id: 2,
    title: 'Bold & Dynamic Logo',
    description: 'Energetic logo with vibrant colors and movement',
    category: 'logo',
    style: 'Bold & Dynamic',
    image: 'https://via.placeholder.com/400x300?text=Bold+Logo',
    generatedAt: '2024-01-26T10:32:00Z',
    selected: false,
    rating: 4.2
  },
  {
    id: 3,
    title: 'Professional Corporate Logo',
    description: 'Traditional yet sophisticated corporate identity',
    category: 'logo',
    style: 'Professional',
    image: 'https://via.placeholder.com/400x300?text=Corporate+Logo',
    generatedAt: '2024-01-26T10:34:00Z',
    selected: false,
    rating: 4.8
  },
  {
    id: 4,
    title: 'Cool Blues Color Palette',
    description: 'Calming blues and teals for tech industry',
    category: 'palette',
    style: 'Cool Tones',
    image: 'https://via.placeholder.com/400x300?text=Blue+Palette',
    generatedAt: '2024-01-26T11:00:00Z',
    selected: false,
    rating: 4.3
  },
  {
    id: 5,
    title: 'Warm Sunset Palette',
    description: 'Warm oranges, yellows for creative brands',
    category: 'palette',
    style: 'Warm Tones',
    image: 'https://via.placeholder.com/400x300?text=Warm+Palette',
    generatedAt: '2024-01-26T11:02:00Z',
    selected: false,
    rating: 4.1
  },
  {
    id: 6,
    title: 'Hero Image Layout',
    description: 'Bold header with full-width background image',
    category: 'layout',
    style: 'Hero-Focused',
    image: 'https://via.placeholder.com/400x300?text=Hero+Layout',
    generatedAt: '2024-01-26T11:30:00Z',
    selected: false,
    rating: 4.6
  }
]

const STYLE_PREFERENCES = [
  'Modern & Minimalist',
  'Professional',
  'Tech-focused',
  'Creative & Artistic',
  'Bold & Dynamic',
  'Luxury & Premium',
  'Playful & Fun',
  'Corporate'
]

// ============================================================================
// MAIN COMPONENT
// ============================================================================


// ============================================================================
// V2 COMPETITIVE MOCK DATA - AiCollaborate Context
// ============================================================================

const aiCollaborateAIInsights = [
  { id: '1', type: 'info' as const, title: 'Performance Update', description: 'System running optimally with 99.9% uptime this month.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '2', type: 'success' as const, title: 'Goal Achievement', description: 'Monthly targets exceeded by 15%. Great progress!', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Goals' },
  { id: '3', type: 'warning' as const, title: 'Action Required', description: 'Review pending items to maintain workflow efficiency.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Tasks' },
]

const aiCollaborateCollaborators = [
  { id: '1', name: 'Alexandra Chen', avatar: '/avatars/alex.jpg', status: 'online' as const, role: 'Manager', lastActive: 'Now' },
  { id: '2', name: 'Marcus Johnson', avatar: '/avatars/marcus.jpg', status: 'online' as const, role: 'Developer', lastActive: '5m ago' },
  { id: '3', name: 'Sarah Williams', avatar: '/avatars/sarah.jpg', status: 'away' as const, role: 'Designer', lastActive: '30m ago' },
]

const aiCollaboratePredictions = [
  { id: '1', label: 'Completion Rate', current: 85, target: 95, predicted: 92, confidence: 88, trend: 'up' as const },
  { id: '2', label: 'Efficiency Score', current: 78, target: 90, predicted: 86, confidence: 82, trend: 'up' as const },
]

const aiCollaborateActivities = [
  { id: '1', user: 'Alexandra Chen', action: 'updated', target: 'system settings', timestamp: '5m ago', type: 'info' as const },
  { id: '2', user: 'Marcus Johnson', action: 'completed', target: 'task review', timestamp: '15m ago', type: 'success' as const },
  { id: '3', user: 'System', action: 'generated', target: 'weekly report', timestamp: '1h ago', type: 'info' as const },
]

const aiCollaborateQuickActions = [
  { id: '1', label: 'New AI Design', icon: 'Plus', shortcut: 'N', action: () => {
    toast.promise(
      fetch('/api/ai-collaborate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create-session', name: 'New AI Design Session' })
      }).then(res => { if (!res.ok) throw new Error('Failed'); return res.json() }),
      {
        loading: 'Initializing AI design collaboration...',
        success: 'New AI design session created',
        error: 'Failed to create design session'
      }
    )
  }},
  { id: '2', label: 'Export Designs', icon: 'Download', shortcut: 'E', action: () => {
    toast.promise(
      fetch('/api/ai-collaborate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'export-designs', designIds: [], format: 'zip' })
      }).then(res => { if (!res.ok) throw new Error('Failed'); return res.json() }),
      {
        loading: 'Preparing AI designs for export...',
        success: 'AI designs exported successfully',
        error: 'Failed to export designs'
      }
    )
  }},
  { id: '3', label: 'AI Settings', icon: 'Settings', shortcut: 'S', action: () => {
    toast.promise(
      fetch('/api/ai-collaborate?type=settings').then(res => { if (!res.ok) throw new Error('Failed'); return res.json() }),
      {
        loading: 'Loading AI collaboration settings...',
        success: 'AI settings panel opened',
        error: 'Failed to load settings'
      }
    )
  }},
]

export default function AiCollaborateClient() {
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter()

  // AI OPTIONS STATE
  const [options, setOptions] = useState<AIDesignOption[]>(AI_DESIGN_OPTIONS)
  const [selectedOptions, setSelectedOptions] = useState<number[]>([])
  const [previewOption, setPreviewOption] = useState<AIDesignOption | null>(null)
  const [selectedStyles, setSelectedStyles] = useState<string[]>([
    'Modern & Minimalist',
    'Professional',
    'Tech-focused'
  ])
  const [category, setCategory] = useState<'all' | 'logo' | 'palette' | 'layout' | 'typography'>('all')
  const [filteredOptions, setFilteredOptions] = useState<AIDesignOption[]>(AI_DESIGN_OPTIONS)

  // DIALOG STATES
  const [createSessionDialogOpen, setCreateSessionDialogOpen] = useState(false)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false)

  // FORM STATES
  const [newSessionName, setNewSessionName] = useState('')
  const [newSessionDescription, setNewSessionDescription] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'viewer' | 'editor' | 'admin'>('viewer')
  const [shareLink, setShareLink] = useState('')
  const [shareMessage, setShareMessage] = useState('')
  const [aiSettings, setAiSettings] = useState({
    autoGenerate: true,
    notifyOnComplete: true,
    highQualityMode: false,
    maxOptions: 6,
    preferredStyles: selectedStyles
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const loadOptions = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Load AI options from API
        const response = await fetch('/api/client-zone/ai-collaborate')
        if (!response.ok) throw new Error('Failed to load AI options')

        setIsLoading(false)
        announce('AI design options loaded', 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load AI options')
        setIsLoading(false)
        announce('Error loading AI options', 'assertive')
      }
    }

    loadOptions()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Filter options by category
  useEffect(() => {
    const filtered = category === 'all'
      ? options
      : options.filter(opt => opt.category === category)
    setFilteredOptions(filtered)
  }, [category, options])

  // ============================================================================
  // HANDLER 1: GENERATE AI OPTIONS
  // ============================================================================

  const handleGenerateOptions = useCallback(async () => {
    try {
      setIsGenerating(true)      // Simulate API call
      const response = await fetch('/api/client-zone/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          styles: selectedStyles,
          category,
          clientId: KAZI_CLIENT_DATA.clientInfo.email,
          projectId: 1,
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate AI options')
      }
      toast.success('AI designs generated! New design options created based on your preferences')
    } catch (error) {
      logger.error('Failed to generate AI options', { error })
      toast.error('Failed to generate designs')
    } finally {
      setIsGenerating(false)
    }
  }, [selectedStyles, category])

  // ============================================================================
  // HANDLER 2: SELECT OPTION
  // ============================================================================

  const handleSelectOption = useCallback(async (optionId: number) => {
    try {
      const response = await fetch('/api/client-zone/ai/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          optionId,
          clientId: KAZI_CLIENT_DATA.clientInfo.email,
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to select option')
      }

      // Update options
      setOptions(options.map(opt =>
        opt.id === optionId
          ? { ...opt, selected: !opt.selected }
          : opt
      ))

      // Update selected list
      if (selectedOptions.includes(optionId)) {
        setSelectedOptions(selectedOptions.filter(id => id !== optionId))
      } else {
        setSelectedOptions([...selectedOptions, optionId])
      }
      toast.success('Option selected!')
    } catch (error) {
      logger.error('Failed to select option', { error, optionId })
      toast.error('Failed to select option')
    }
  }, [options, selectedOptions])

  // ============================================================================
  // HANDLER 3: RATE OPTION
  // ============================================================================

  const handleRateOption = useCallback(async (optionId: number, rating: number) => {
    try {
      const response = await fetch('/api/client-zone/ai/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          optionId,
          rating,
          clientId: KAZI_CLIENT_DATA.clientInfo.email
        })
      })

      if (!response.ok) {
        throw new Error('Failed to rate option')
      }

      setOptions(options.map(opt =>
        opt.id === optionId
          ? { ...opt, rating }
          : opt
      ))

      toast.success(`Rated ${rating} stars!`)
    } catch (error) {
      logger.error('Failed to rate option', { error })
      toast.error('Failed to rate option')
    }
  }, [options])

  // ============================================================================
  // HANDLER 4: UPDATE STYLE PREFERENCES
  // ============================================================================

  const handleToggleStyle = useCallback((style: string) => {
    if (selectedStyles.includes(style)) {
      setSelectedStyles(selectedStyles.filter(s => s !== style))
    } else {
      setSelectedStyles([...selectedStyles, style])
    }
  }, [selectedStyles])

  // ============================================================================
  // HANDLER 5: DOWNLOAD SELECTION
  // ============================================================================

  const handleDownloadSelection = useCallback(async () => {
    try {
      if (selectedOptions.length === 0) {
        toast.error('Please select at least one design')
        return
      }
      const response = await fetch('/api/client-zone/ai/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          optionIds: selectedOptions,
          clientId: KAZI_CLIENT_DATA.clientInfo.email
        })
      })

      if (!response.ok) {
        throw new Error('Failed to download designs')
      }

      toast.success('Downloads starting! ' + selectedOptions.length + ' design(s) downloading')
    } catch (error) {
      logger.error('Failed to download selection', { error })
      toast.error('Failed to download designs')
    }
  }, [selectedOptions])

  // ============================================================================
  // HANDLER 6: SHARE SELECTION
  // ============================================================================

  const handleShareSelection = useCallback(async () => {
    try {
      if (selectedOptions.length === 0) {
        toast.error('Please select at least one design')
        return
      }
      const response = await fetch('/api/client-zone/ai/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          optionIds: selectedOptions,
          clientId: KAZI_CLIENT_DATA.clientInfo.email
        })
      })

      if (!response.ok) {
        throw new Error('Failed to share designs')
      }

      toast.success('Share link copied!')
    } catch (error) {
      logger.error('Failed to share selection', { error })
      toast.error('Failed to share designs')
    }
  }, [selectedOptions])

  // ============================================================================
  // HANDLER 7: CREATE NEW SESSION
  // ============================================================================

  const handleCreateSession = useCallback(async () => {
    if (!newSessionName.trim()) {
      toast.error('Please enter a session name')
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch('/api/client-zone/ai/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSessionName,
          description: newSessionDescription,
          clientId: KAZI_CLIENT_DATA.clientInfo.email,
          styles: selectedStyles,
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create session')
      }
      toast.success('Session created! "' + newSessionName + '" is ready for collaboration')

      setNewSessionName('')
      setNewSessionDescription('')
      setCreateSessionDialogOpen(false)
      announce('New AI collaboration session created', 'polite')
    } catch (error) {
      logger.error('Failed to create session', { error })
      toast.error('Failed to create session')
    } finally {
      setIsSubmitting(false)
    }
  }, [newSessionName, newSessionDescription, selectedStyles, announce])

  // ============================================================================
  // HANDLER 8: INVITE COLLABORATORS
  // ============================================================================

  const handleInviteCollaborator = useCallback(async () => {
    if (!inviteEmail.trim()) {
      toast.error('Please enter an email address')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(inviteEmail)) {
      toast.error('Please enter a valid email address')
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch('/api/client-zone/ai/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
          clientId: KAZI_CLIENT_DATA.clientInfo.email,
          sessionId: 'current',
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send invitation')
      }
      toast.success('Invitation sent! ' + inviteEmail + ' has been invited as ' + inviteRole)

      setInviteEmail('')
      setInviteRole('viewer')
      setInviteDialogOpen(false)
      announce('Collaboration invitation sent', 'polite')
    } catch (error) {
      logger.error('Failed to invite collaborator', { error })
      toast.error('Failed to send invitation')
    } finally {
      setIsSubmitting(false)
    }
  }, [inviteEmail, inviteRole, announce])

  // ============================================================================
  // HANDLER 9: SHARE WITH DIALOG
  // ============================================================================

  const handleOpenShareDialog = useCallback(() => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    const generatedLink = `${baseUrl}/share/ai-designs/${Date.now()}`
    setShareLink(generatedLink)
    setShareDialogOpen(true)
  }, [])

  const handleCopyShareLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      toast.success('Link copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }, [shareLink])

  const handleShareViaEmail = useCallback(async () => {
    try {
      setIsSubmitting(true)
      const response = await fetch('/api/client-zone/ai/share-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          optionIds: selectedOptions,
          message: shareMessage,
          link: shareLink,
          clientId: KAZI_CLIENT_DATA.clientInfo.email
        })
      })

      if (!response.ok) {
        throw new Error('Failed to share via email')
      }

      toast.success('Shared successfully!')

      setShareMessage('')
      setShareDialogOpen(false)
    } catch (error) {
      logger.error('Failed to share via email', { error })
      toast.error('Failed to share')
    } finally {
      setIsSubmitting(false)
    }
  }, [selectedOptions, shareMessage, shareLink])

  // ============================================================================
  // HANDLER 10: SETTINGS
  // ============================================================================

  const handleSaveSettings = useCallback(async () => {
    try {
      setIsSubmitting(true)
      const response = await fetch('/api/client-zone/ai/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: aiSettings,
          clientId: KAZI_CLIENT_DATA.clientInfo.email,
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }
      toast.success('Settings saved!')

      setSettingsDialogOpen(false)
      announce('AI settings saved', 'polite')
    } catch (error) {
      logger.error('Failed to save settings', { error })
      toast.error('Failed to save settings')
    } finally {
      setIsSubmitting(false)
    }
  }, [aiSettings, announce])

  const handleResetSettings = useCallback(() => {
    setAiSettings({
      autoGenerate: true,
      notifyOnComplete: true,
      highQualityMode: false,
      maxOptions: 6,
      preferredStyles: ['Modern & Minimalist', 'Professional', 'Tech-focused']
    })
    toast.info('Settings reset to defaults')
  }, [])

  // ============================================================================
  // HANDLER 11: DELETE ALL SELECTIONS
  // ============================================================================

  const handleDeleteAllSelections = useCallback(async () => {
    try {
      setIsSubmitting(true)
      const response = await fetch('/api/client-zone/ai/selections', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          optionIds: selectedOptions,
          clientId: KAZI_CLIENT_DATA.clientInfo.email
        })
      })

      if (!response.ok) {
        throw new Error('Failed to delete selections')
      }

      setSelectedOptions([])
      setOptions(options.map(opt => ({ ...opt, selected: false })))
      toast.success('Selections cleared!')

      setConfirmDeleteDialogOpen(false)
      announce('All selections cleared', 'polite')
    } catch (error) {
      logger.error('Failed to delete selections', { error })
      toast.error('Failed to clear selections')
    } finally {
      setIsSubmitting(false)
    }
  }, [selectedOptions, options, announce])

  // ============================================================================
  // HANDLER 12: REGENERATE OPTIONS
  // ============================================================================

  const handleRegenerateOptions = useCallback(async () => {
    try {
      setIsGenerating(true)
      const response = await fetch('/api/client-zone/ai/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          styles: selectedStyles,
          clientId: KAZI_CLIENT_DATA.clientInfo.email,
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to regenerate options')
      }
      toast.success('Options regenerated!')

      announce('AI options regenerated', 'polite')
    } catch (error) {
      logger.error('Failed to regenerate options', { error })
      toast.error('Failed to regenerate')
    } finally {
      setIsGenerating(false)
    }
  }, [category, selectedStyles, announce])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900 p-6">
        <div className="container mx-auto space-y-6">
          
        {/* V2 Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <AIInsightsPanel insights={aiCollaborateAIInsights} />
          <PredictiveAnalytics predictions={aiCollaboratePredictions} />
          <CollaborationIndicator collaborators={aiCollaborateCollaborators} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <QuickActionsToolbar actions={aiCollaborateQuickActions} />
          <ActivityFeed activities={aiCollaborateActivities} />
        </div>
<CardSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900 p-6">
        <div className="container mx-auto">
          <ErrorEmptyState
            error={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent flex items-center gap-2">
              <Brain className="h-8 w-8" />
              AI Design Collaboration
            </h1>
            <p className="text-gray-600 mt-2">
              Generate, preview, and select AI-powered design options
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setCreateSessionDialogOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Session
            </Button>
            <Button
              variant="outline"
              onClick={() => setInviteDialogOpen(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Invite
            </Button>
            <Button
              variant="outline"
              onClick={() => setSettingsDialogOpen(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {selectedOptions.length} selected
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Design Options Grid */}
          <div className="lg:col-span-3 space-y-4">
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      <CardTitle>AI-Generated Design Options</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleRegenerateOptions}
                        disabled={isGenerating}
                      >
                        <RefreshCw className={`h-4 w-4 mr-1 ${isGenerating ? 'animate-spin' : ''}`} />
                        Regenerate
                      </Button>
                      <Badge variant="outline">{filteredOptions.length}</Badge>
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div className="flex gap-2 flex-wrap">
                    {(['all', 'logo', 'palette', 'layout', 'typography'] as const).map((cat) => (
                      <Button
                        key={cat}
                        size="sm"
                        variant={category === cat ? 'default' : 'outline'}
                        onClick={() => setCategory(cat)}
                      >
                        {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {filteredOptions.length === 0 ? (
                  <NoDataEmptyState
                    title="No designs found"
                    description="Adjust your filters or generate new designs"
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredOptions.map((option, index) => (
                      <motion.div
                        key={option.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`rounded-lg border-2 overflow-hidden transition-all cursor-pointer hover:shadow-lg ${
                          selectedOptions.includes(option.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-white'
                        }`}
                        onClick={() => setPreviewOption(option)}
                      >
                        {/* Image */}
                        <div className="relative h-48 bg-gray-100 overflow-hidden">
                          <img src={option.image}
                            alt={option.title}
                            className="w-full h-full object-cover"
                          loading="lazy" />
                          <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-all" />
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-3">
                          <div>
                            <p className="font-semibold text-gray-900">{option.title}</p>
                            <p className="text-sm text-gray-600 mb-2">
                              {option.description}
                            </p>
                            <Badge variant="secondary" className="text-xs">
                              {option.style}
                            </Badge>
                          </div>

                          {/* Rating */}
                          {option.rating && (
                            <div className="flex items-center gap-1 text-yellow-500 text-sm">
                              {'⭐'.repeat(Math.floor(option.rating))}
                              <span className="text-gray-600">({option.rating})</span>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2 pt-2 border-t">
                            <Button
                              size="sm"
                              className={`flex-1 ${
                                selectedOptions.includes(option.id)
                                  ? 'bg-blue-600 hover:bg-blue-700'
                                  : 'bg-gray-200 hover:bg-gray-300'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSelectOption(option.id)
                              }}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {selectedOptions.includes(option.id)
                                ? 'Selected'
                                : 'Select'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                setPreviewOption(option)
                              }}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar: Preferences & Controls */}
          <div className="space-y-4">
            {/* Style Preferences */}
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Style Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  {STYLE_PREFERENCES.map((style) => (
                    <button
                      key={style}
                      onClick={() => handleToggleStyle(style)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedStyles.includes(style)
                          ? 'bg-blue-100 text-blue-900 border-2 border-blue-300'
                          : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {selectedStyles.includes(style) && (
                          <CheckCircle className="h-4 w-4" />
                        )}
                        <span className="text-sm">{style}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  onClick={handleGenerateOptions}
                  disabled={isGenerating || selectedStyles.length === 0}
                >
                  {isGenerating ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate New Options
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Preview Card */}
            {previewOption && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">Preview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-lg overflow-hidden bg-gray-100 h-40">
                      <img src={previewOption.image}
                        alt={previewOption.title}
                        className="w-full h-full object-cover"
                      loading="lazy" />
                    </div>

                    <div>
                      <p className="font-semibold text-gray-900 mb-1">
                        {previewOption.title}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        {previewOption.description}
                      </p>
                      <Badge variant="secondary">{previewOption.style}</Badge>
                    </div>

                    {/* Rating Stars */}
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRateOption(previewOption.id, star)}
                          className="text-2xl hover:scale-125 transition-transform"
                        >
                          {star <= (previewOption.rating || 0) ? '⭐' : '☆'}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                        onClick={() => handleSelectOption(previewOption.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {selectedOptions.includes(previewOption.id)
                          ? 'Selected'
                          : 'Select'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Actions Card */}
            {selectedOptions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                      onClick={handleDownloadSelection}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download ({selectedOptions.length})
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleOpenShareDialog}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share ({selectedOptions.length})
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setConfirmDeleteDialogOpen(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Selection
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>

        {/* ============================================================================ */}
        {/* DIALOG: CREATE NEW SESSION */}
        {/* ============================================================================ */}
        <Dialog open={createSessionDialogOpen} onOpenChange={setCreateSessionDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-purple-600" />
                Create New AI Session
              </DialogTitle>
              <DialogDescription>
                Start a new AI design collaboration session with your preferred styles.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="session-name">Session Name</Label>
                <Input
                  id="session-name"
                  placeholder="e.g., Brand Redesign 2024"
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="session-description">Description (Optional)</Label>
                <Textarea
                  id="session-description"
                  placeholder="Describe the goals and scope of this design session..."
                  value={newSessionDescription}
                  onChange={(e) => setNewSessionDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Selected Styles</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedStyles.map((style) => (
                    <Badge key={style} variant="secondary">
                      {style}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  Styles are inherited from your current preferences
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCreateSessionDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateSession}
                disabled={isSubmitting || !newSessionName.trim()}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Session
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ============================================================================ */}
        {/* DIALOG: INVITE COLLABORATORS */}
        {/* ============================================================================ */}
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-blue-600" />
                Invite Collaborators
              </DialogTitle>
              <DialogDescription>
                Invite team members to collaborate on AI design options.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="invite-email">Email Address</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="colleague@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <div className="flex gap-2">
                  {(['viewer', 'editor', 'admin'] as const).map((role) => (
                    <Button
                      key={role}
                      size="sm"
                      variant={inviteRole === role ? 'default' : 'outline'}
                      onClick={() => setInviteRole(role)}
                      className={inviteRole === role ? 'bg-blue-600 hover:bg-blue-700' : ''}
                    >
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  {inviteRole === 'viewer' && 'Can view designs and leave comments'}
                  {inviteRole === 'editor' && 'Can select, rate, and modify designs'}
                  {inviteRole === 'admin' && 'Full access including settings and invites'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Current Collaborators</h4>
                <div className="space-y-2">
                  {aiCollaborateCollaborators.map((collab) => (
                    <div key={collab.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          collab.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'
                        }`} />
                        <span>{collab.name}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">{collab.role}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setInviteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleInviteCollaborator}
                disabled={isSubmitting || !inviteEmail.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Invite
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ============================================================================ */}
        {/* DIALOG: SHARE DESIGNS */}
        {/* ============================================================================ */}
        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5 text-green-600" />
                Share Designs
              </DialogTitle>
              <DialogDescription>
                Share your selected designs ({selectedOptions.length}) with others.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Share Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={shareLink}
                    readOnly
                    className="flex-1 bg-gray-50"
                  />
                  <Button
                    variant="outline"
                    onClick={handleCopyShareLink}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="share-message">Add a Message (Optional)</Label>
                <Textarea
                  id="share-message"
                  placeholder="Check out these AI-generated designs..."
                  value={shareMessage}
                  onChange={(e) => setShareMessage(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Selected Designs</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedOptions.map((optId) => {
                    const opt = options.find(o => o.id === optId)
                    return opt ? (
                      <Badge key={optId} variant="secondary" className="text-xs">
                        {opt.title}
                      </Badge>
                    ) : null
                  })}
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Share Options</h4>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyShareLink}
                    className="flex-1"
                  >
                    <Link2 className="h-4 w-4 mr-1" />
                    Copy Link
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleShareViaEmail}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    <Mail className="h-4 w-4 mr-1" />
                    Send Email
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShareDialogOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ============================================================================ */}
        {/* DIALOG: SETTINGS */}
        {/* ============================================================================ */}
        <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-600" />
                AI Collaboration Settings
              </DialogTitle>
              <DialogDescription>
                Configure your AI design generation preferences.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-Generate Designs</Label>
                    <p className="text-xs text-gray-500">Automatically generate new designs when styles change</p>
                  </div>
                  <Button
                    size="sm"
                    variant={aiSettings.autoGenerate ? 'default' : 'outline'}
                    onClick={() => setAiSettings({ ...aiSettings, autoGenerate: !aiSettings.autoGenerate })}
                    className={aiSettings.autoGenerate ? 'bg-green-600 hover:bg-green-700' : ''}
                  >
                    {aiSettings.autoGenerate ? 'On' : 'Off'}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notify on Completion</Label>
                    <p className="text-xs text-gray-500">Receive notifications when AI generation completes</p>
                  </div>
                  <Button
                    size="sm"
                    variant={aiSettings.notifyOnComplete ? 'default' : 'outline'}
                    onClick={() => setAiSettings({ ...aiSettings, notifyOnComplete: !aiSettings.notifyOnComplete })}
                    className={aiSettings.notifyOnComplete ? 'bg-green-600 hover:bg-green-700' : ''}
                  >
                    {aiSettings.notifyOnComplete ? 'On' : 'Off'}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>High Quality Mode</Label>
                    <p className="text-xs text-gray-500">Generate higher resolution designs (slower)</p>
                  </div>
                  <Button
                    size="sm"
                    variant={aiSettings.highQualityMode ? 'default' : 'outline'}
                    onClick={() => setAiSettings({ ...aiSettings, highQualityMode: !aiSettings.highQualityMode })}
                    className={aiSettings.highQualityMode ? 'bg-green-600 hover:bg-green-700' : ''}
                  >
                    {aiSettings.highQualityMode ? 'On' : 'Off'}
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Max Options Per Generation</Label>
                  <div className="flex gap-2">
                    {[3, 6, 9, 12].map((num) => (
                      <Button
                        key={num}
                        size="sm"
                        variant={aiSettings.maxOptions === num ? 'default' : 'outline'}
                        onClick={() => setAiSettings({ ...aiSettings, maxOptions: num })}
                        className={aiSettings.maxOptions === num ? 'bg-blue-600 hover:bg-blue-700' : ''}
                      >
                        {num}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetSettings}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset to Defaults
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSettingsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveSettings}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ============================================================================ */}
        {/* DIALOG: CONFIRM DELETE */}
        {/* ============================================================================ */}
        <Dialog open={confirmDeleteDialogOpen} onOpenChange={setConfirmDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                Clear All Selections?
              </DialogTitle>
              <DialogDescription>
                This will remove all {selectedOptions.length} selected designs from your selection.
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => setConfirmDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteAllSelections}
                disabled={isSubmitting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Clearing...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  )
}
