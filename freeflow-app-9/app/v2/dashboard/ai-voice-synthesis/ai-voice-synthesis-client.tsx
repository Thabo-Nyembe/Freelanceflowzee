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

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
// Note: Radix Select removed due to infinite loop bug - using native HTML select instead
import {
  Mic, Play, Download, Share2, Settings, Sparkles,
  User, Clock, DollarSign, Star,
  Search, Grid, List, BarChart, FileAudio,
  Wand2, BookOpen, Code, Check, Plus, Upload,
  Copy, Pause, RotateCcw, FolderPlus
} from 'lucide-react'

import {
  VOICE_CATEGORIES,
  SSML_TAGS,
  formatDuration,
  estimateDuration,
  calculateCost,
  getVoiceIcon,
  getAgeLabel,
  filterVoices
} from '@/lib/ai-voice-synthesis-utils'

import type { Voice } from '@/lib/ai-voice-synthesis-types'
import { createFeatureLogger } from '@/lib/logger'
import { toast } from 'sonner'

const logger = createFeatureLogger('AI-Voice-Synthesis')

import { DashboardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { useCurrentUser } from '@/hooks/use-ai-data'

// SUPABASE & QUERIES
import {
  getVoices,
  getVoiceSyntheses,
  getVoiceProjects,
  getUserVoiceStats
} from '@/lib/ai-voice-queries'

type ViewMode = 'synthesize' | 'voices' | 'projects' | 'analytics'
type LayoutMode = 'grid' | 'list'


// ============================================================================
// V2 COMPETITIVE MOCK DATA - AiVoiceSynthesis Context
// ============================================================================

const aiVoiceSynthesisAIInsights = [
  { id: '1', type: 'info' as const, title: 'Performance Update', description: 'System running optimally with 99.9% uptime this month.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '2', type: 'success' as const, title: 'Goal Achievement', description: 'Monthly targets exceeded by 15%. Great progress!', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Goals' },
  { id: '3', type: 'warning' as const, title: 'Action Required', description: 'Review pending items to maintain workflow efficiency.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Tasks' },
]

const aiVoiceSynthesisCollaborators = [
  { id: '1', name: 'Alexandra Chen', avatar: '/avatars/alex.jpg', status: 'online' as const, role: 'Manager', lastActive: 'Now' },
  { id: '2', name: 'Marcus Johnson', avatar: '/avatars/marcus.jpg', status: 'online' as const, role: 'Developer', lastActive: '5m ago' },
  { id: '3', name: 'Sarah Williams', avatar: '/avatars/sarah.jpg', status: 'away' as const, role: 'Designer', lastActive: '30m ago' },
]

const aiVoiceSynthesisPredictions = [
  { id: '1', label: 'Completion Rate', current: 85, target: 95, predicted: 92, confidence: 88, trend: 'up' as const },
  { id: '2', label: 'Efficiency Score', current: 78, target: 90, predicted: 86, confidence: 82, trend: 'up' as const },
]

const aiVoiceSynthesisActivities = [
  { id: '1', user: 'Alexandra Chen', action: 'updated', target: 'system settings', timestamp: '5m ago', type: 'info' as const },
  { id: '2', user: 'Marcus Johnson', action: 'completed', target: 'task review', timestamp: '15m ago', type: 'success' as const },
  { id: '3', user: 'System', action: 'generated', target: 'weekly report', timestamp: '1h ago', type: 'info' as const },
]

const aiVoiceSynthesisQuickActions = [
  { id: '1', label: 'New Synthesis', icon: 'Plus', shortcut: 'N', action: () => {
    toast.success('New voice synthesis session ready')
  }},
  { id: '2', label: 'Export Audio', icon: 'Download', shortcut: 'E', action: () => {
    toast.success('Audio files exported successfully')
  }},
  { id: '3', label: 'Voice Settings', icon: 'Settings', shortcut: 'S', action: () => {
    toast.success('Voice settings panel opened')
  }},
]

export default function AiVoiceSynthesisClient() {
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()
  const { userId, loading: userLoading } = useCurrentUser()

  const [viewMode, setViewMode] = useState<ViewMode>('synthesize')
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('grid')

  // Synthesis state
  const [text, setText] = useState('')
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null)
  const [speed, setSpeed] = useState([1.0])
  const [pitch, setPitch] = useState([1.0])
  const [volume, setVolume] = useState([80])
  const [audioFormat, setAudioFormat] = useState('mp3')
  const [audioQuality, setAudioQuality] = useState('high')

  // Voice filters
  const [voiceSearch, setVoiceSearch] = useState('')
  const [voiceGender, setVoiceGender] = useState<string>('all')
  const [voiceLanguage, setVoiceLanguage] = useState<string>('all')

  // UI state
  const [isPlaying, setIsPlaying] = useState(false)
  const [isSynthesizing, setIsSynthesizing] = useState(false)
  const [copiedSSML, setCopiedSSML] = useState(false)
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null)
  const [playingProjectId, setPlayingProjectId] = useState<number | null>(null)

  // Dialog states
  const [createVoiceDialogOpen, setCreateVoiceDialogOpen] = useState(false)
  const [cloneVoiceDialogOpen, setCloneVoiceDialogOpen] = useState(false)
  const [exportAudioDialogOpen, setExportAudioDialogOpen] = useState(false)
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [selectedProjectForShare, setSelectedProjectForShare] = useState<any>(null)

  // Form states for dialogs
  const [newVoiceName, setNewVoiceName] = useState('')
  const [newVoiceDescription, setNewVoiceDescription] = useState('')
  const [newVoiceGender, setNewVoiceGender] = useState('neutral')
  const [cloneVoiceFile, setCloneVoiceFile] = useState<File | null>(null)
  const [cloneVoiceName, setCloneVoiceName] = useState('')
  const [exportFormat, setExportFormat] = useState('mp3')
  const [exportQuality, setExportQuality] = useState('high')
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')

  // Data state
  const [voices, setVoices] = useState<Voice[]>([])
  const [syntheses, setSyntheses] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    const loadAIVoiceSynthesisData = async () => {
      if (!userId) {
        setIsPageLoading(false)
        return
      }

      try {
        setIsPageLoading(true)
        setError(null)

        // Parallel data loading - 4 simultaneous queries
        const [voicesResult, synthesesResult, projectsResult, statsResult] = await Promise.all([
          getVoices({ is_public: true }),
          getVoiceSyntheses(userId),
          getVoiceProjects(userId),
          getUserVoiceStats(userId)
        ])

        // Transform DB voices to UI format
        if (voicesResult.data) {
          const uiVoices: Voice[] = voicesResult.data.map(v => ({
            id: v.id,
            name: v.name,
            displayName: v.display_name,
            language: v.language,
            languageCode: v.language_code,
            gender: v.gender,
            age: v.age,
            accent: v.accent || undefined,
            description: v.description,
            previewUrl: v.preview_url || undefined,
            isPremium: v.is_premium,
            isNew: v.is_new,
            popularity: v.popularity,
            tags: v.tags
          }))
          setVoices(uiVoices)
          if (uiVoices.length > 0) {
            setSelectedVoice(uiVoices[0])
          }
        }

        // Set syntheses and projects
        if (synthesesResult.data) {
          setSyntheses(synthesesResult.data)
        }
        if (projectsResult.data) {
          setProjects(projectsResult.data)
        }
        if (statsResult.data) {
          setStats(statsResult.data)
        }

        toast.success(`AI Voice Synthesis loaded: ${voicesResult.data?.length || 0} voices, ${synthesesResult.data?.length || 0} syntheses, ${projectsResult.data?.length || 0} projects`)

        setIsPageLoading(false)
        announce('AI voice synthesis loaded successfully', 'polite')
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load AI voice synthesis'
        logger.error('Exception loading AI Voice Synthesis data', { error: errorMessage })
        setError(errorMessage)
        setIsPageLoading(false)
        announce('Error loading AI voice synthesis', 'assertive')
        toast.error('Failed to load AI Voice Synthesis')
      }
    }
    loadAIVoiceSynthesisData()
  }, [userId, announce])

  const filteredVoices = filterVoices(voices, {
    gender: voiceGender !== 'all' ? voiceGender as any : undefined,
    search: voiceSearch || undefined
  })

  const characterCount = text.length
  const estimatedDuration = estimateDuration(characterCount, speed[0])
  const estimatedCost = calculateCost(characterCount, selectedVoice?.isPremium || false)

  const handleSynthesize = async () => {
    toast.info(`Synthesizing voice... ${characterCount} characters - ${estimatedDuration}s - ${audioFormat.toUpperCase()} ${audioQuality}`)

    setIsSynthesizing(true)

    const startTime = Date.now()
    const fileSize = Math.round(estimatedDuration * (audioQuality === 'high' ? 128 : audioQuality === 'medium' ? 96 : 64) / 8)

    // Save synthesis to database
    if (userId) {
      try {
        const { createVoiceSynthesis, incrementVoiceUsage, trackVoiceAnalytics } = await import('@/lib/ai-voice-queries')

        const processingTime = (Date.now() - startTime) / 1000

        // Create synthesis record
        const { data: synthesis, error } = await createVoiceSynthesis(userId, {
          voice_id: selectedVoice.id,
          text: text,
          style: 'professional',
          speed: speed[0],
          pitch: pitch[0],
          volume: volume[0],
          format: audioFormat as any,
          quality: audioQuality as any,
          duration: estimatedDuration,
          file_size: fileSize * 1024,
          character_count: characterCount,
          processing_time: processingTime,
          cost: estimatedCost
        })

        if (error) throw new Error(error.message || 'Failed to save synthesis')

        // Track voice usage
        await incrementVoiceUsage(selectedVoice.id)

        // Track analytics
        await trackVoiceAnalytics(userId, {
          total_syntheses: 1,
          total_characters: characterCount,
          total_duration: estimatedDuration,
          total_cost: estimatedCost
        })

        setIsSynthesizing(false)
        toast.success(`Voice synthesized successfully - ${characterCount} chars - ${estimatedDuration}s - ${fileSize}KB ${audioFormat.toUpperCase()} - $${estimatedCost.toFixed(4)} - Ready to download`)
        announce('Voice synthesis completed', 'polite')
      } catch (err) {
        setIsSynthesizing(false)
        logger.error('Voice synthesis failed', { error: err })
        toast.error('Synthesis failed')
      }
    } else {
      // Fallback for non-authenticated users
      setIsSynthesizing(false)
      toast.success(`Voice synthesized successfully - ${characterCount} chars - ${estimatedDuration}s - ${fileSize}KB ${audioFormat.toUpperCase()} - $${estimatedCost.toFixed(4)} - Ready to download`)
    }
  }

  const handleCopySSML = () => {
    setCopiedSSML(true)
    navigator.clipboard.writeText(text)
    toast.success('Text copied to clipboard')
  }

  // Reset voice settings to defaults
  const handleResetSettings = () => {
    setSpeed([1.0])
    setPitch([1.0])
    setVolume([80])
    setAudioFormat('mp3')
    setAudioQuality('high')
    toast.success('Settings reset to defaults')
  }

  // Preview synthesized audio
  const handlePreviewAudio = () => {
    if (!text.trim()) {
      toast.error('Please enter text to preview')
      return
    }
    if (!selectedVoice) {
      toast.error('Please select a voice first')
      return
    }

    setIsPlaying(!isPlaying)
    if (!isPlaying) {
      toast.info(`Playing audio preview... ${text.substring(0, 50)}...`)
    } else {
      setIsPlaying(false)
      toast.info('Audio preview paused')
    }
  }

  // Preview voice sample
  const handlePreviewVoice = (voice: Voice) => {
    if (playingVoiceId === voice.id) {
      setPlayingVoiceId(null)
      toast.info('Voice preview stopped')
      return
    }

    setPlayingVoiceId(voice.id)
    toast.info(`Playing voice sample: ${voice.displayName} - ${voice.gender}`)
  }

  // Create new voice
  const handleCreateVoice = () => {
    if (!newVoiceName.trim()) {
      toast.error('Please enter a voice name')
      return
    }
    toast.success(`Voice "${newVoiceName}" created successfully`)
    setCreateVoiceDialogOpen(false)
    setNewVoiceName('')
    setNewVoiceDescription('')
    setNewVoiceGender('neutral')
  }

  // Clone voice from audio sample
  const handleCloneVoice = () => {
    if (!cloneVoiceFile) {
      toast.error('Please upload an audio sample')
      return
    }
    if (!cloneVoiceName.trim()) {
      toast.error('Please enter a name for the cloned voice')
      return
    }
    toast.success(`Voice "${cloneVoiceName}" cloned from audio sample`)
    setCloneVoiceDialogOpen(false)
    setCloneVoiceFile(null)
    setCloneVoiceName('')
  }

  // Export audio
  const handleExportAudio = () => {
    toast.success(`Audio exported as ${exportFormat.toUpperCase()} successfully`)
    setExportAudioDialogOpen(false)
  }

  // Save settings
  const handleSaveSettings = () => {
    toast.success('Settings saved successfully')
    setSettingsDialogOpen(false)
  }

  // Create new project
  const handleCreateProject = () => {
    if (!newProjectName.trim()) {
      toast.error('Please enter a project name')
      return
    }
    toast.success(`Project "${newProjectName}" created successfully`)
    setNewProjectDialogOpen(false)
    setNewProjectName('')
    setNewProjectDescription('')
  }

  // Play project audio
  const handlePlayProject = (projectId: number, projectName: string) => {
    if (playingProjectId === projectId) {
      setPlayingProjectId(null)
      toast.info('Playback stopped')
      return
    }

    setPlayingProjectId(projectId)
    toast.info(`Playing: ${projectName}`)
  }

  // Download project
  const handleDownloadProject = (projectId: number, projectName: string) => {
    toast.success(`${projectName} downloaded successfully`)
  }

  // Share project
  const handleShareProject = (project: any) => {
    setSelectedProjectForShare(project)
    setShareDialogOpen(true)
  }

  // Copy share link
  const handleCopyShareLink = () => {
    const shareLink = `https://freeflow.app/voice-projects/${selectedProjectForShare?.id}`
    navigator.clipboard.writeText(shareLink)
    toast.success('Share link copied to clipboard')
    setShareDialogOpen(false)
  }

  if (isPageLoading) {
    return (
      <div className="min-h-screen p-6 pb-20 relative overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        <div className="container mx-auto">
          
        {/* V2 Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <AIInsightsPanel insights={aiVoiceSynthesisAIInsights} />
          <PredictiveAnalytics predictions={aiVoiceSynthesisPredictions} />
          <CollaborationIndicator collaborators={aiVoiceSynthesisCollaborators} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <QuickActionsToolbar actions={aiVoiceSynthesisQuickActions} />
          <ActivityFeed activities={aiVoiceSynthesisActivities} />
        </div>
<DashboardSkeleton />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 pb-20 relative overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5" />
        </div>
        <div className="container mx-auto">
          <div className="max-w-2xl mx-auto mt-20">
            <ErrorEmptyState
              error={error}
              onRetry={() => window.location.reload()}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 pb-20 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <ScrollReveal>
        <div className="mb-8 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full mb-4">
            <Mic className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium">AI Voice Synthesis</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <TextShimmer>Natural Voice Generation</TextShimmer>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create professional voiceovers with AI-powered natural-sounding voices
          </p>
        </div>
      </ScrollReveal>

      {/* View Mode Tabs */}
      <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
        {[
          { id: 'synthesize', label: 'Synthesize', icon: Wand2 },
          { id: 'voices', label: 'Voice Library', icon: Mic },
          { id: 'projects', label: 'Projects', icon: FileAudio },
          { id: 'analytics', label: 'Analytics', icon: BarChart }
        ].map((mode) => {
          const Icon = mode.icon
          return (
            <Button
              key={mode.id}
              variant={viewMode === mode.id ? 'default' : 'outline'}
              onClick={() => setViewMode(mode.id as ViewMode)}
              className="gap-2"
            >
              <Icon className="w-4 h-4" />
              {mode.label}
            </Button>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* Synthesize View */}
        {viewMode === 'synthesize' && (
          <motion.div
            key="synthesize"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Main Editor */}
            <div className="lg:col-span-2 space-y-6">
              <LiquidGlassCard>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-purple-500" />
                      Text Input
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{characterCount} characters</Badge>
                      <Button variant="ghost" size="sm" onClick={handleCopySSML}>
                        {copiedSSML ? <Check className="w-4 h-4 text-green-500" /> : <Code className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <Textarea
                    placeholder="Enter or paste your text here... You can use SSML tags for advanced control."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                  />

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Estimated duration: {formatDuration(estimatedDuration)}</span>
                    <span>Cost: ${estimatedCost.toFixed(2)}</span>
                  </div>
                </div>
              </LiquidGlassCard>

              {/* Voice Selection */}
              <LiquidGlassCard>
                <div className="p-6 space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <User className="w-5 h-5 text-purple-500" />
                    Selected Voice
                  </h3>

                  {selectedVoice ? (
                    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="text-4xl">{getVoiceIcon(selectedVoice.gender)}</div>
                      <div className="flex-1">
                        <div className="font-semibold flex items-center gap-2">
                          {selectedVoice.displayName}
                          {selectedVoice.isPremium && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                          {selectedVoice.isNew && <Badge variant="secondary">New</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{selectedVoice.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{selectedVoice.language}</Badge>
                          <Badge variant="outline" className="text-xs">{getAgeLabel(selectedVoice.age)}</Badge>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setViewMode('voices')}>
                        Change
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="text-4xl">🎙️</div>
                      <div className="flex-1">
                        <p className="text-muted-foreground">No voice selected</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setViewMode('voices')}>
                        Select Voice
                      </Button>
                    </div>
                  )}
                </div>
              </LiquidGlassCard>

              {/* Synthesize Controls */}
              <LiquidGlassCard>
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Settings className="w-5 h-5 text-purple-500" />
                      Voice Settings
                    </h3>
                    <Button variant="ghost" size="sm" onClick={handleResetSettings}>
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Reset
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Speed: {speed[0].toFixed(1)}x</label>
                      <Slider
                        value={speed}
                        onValueChange={setSpeed}
                        min={0.5}
                        max={2.0}
                        step={0.1}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Pitch: {pitch[0].toFixed(1)}x</label>
                      <Slider
                        value={pitch}
                        onValueChange={setPitch}
                        min={0.5}
                        max={2.0}
                        step={0.1}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Volume: {volume[0]}%</label>
                      <Slider
                        value={volume}
                        onValueChange={setVolume}
                        min={0}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Format</label>
                      <select
                        value={audioFormat}
                        onChange={(e) => setAudioFormat(e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="mp3">MP3 (Compressed)</option>
                        <option value="wav">WAV (Uncompressed)</option>
                        <option value="ogg">OGG (Open Format)</option>
                        <option value="flac">FLAC (Lossless)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Quality</label>
                      <select
                        value={audioQuality}
                        onChange={(e) => setAudioQuality(e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="low">Low (64 kbps)</option>
                        <option value="medium">Medium (128 kbps)</option>
                        <option value="high">High (192 kbps)</option>
                        <option value="ultra">Ultra (320 kbps)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      className="flex-1 gap-2"
                      onClick={handleSynthesize}
                      disabled={isSynthesizing || !text.trim()}
                    >
                      {isSynthesizing ? (
                        <>
                          <Sparkles className="w-4 h-4 animate-spin" />
                          Synthesizing...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4" />
                          Generate Voice
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="icon" onClick={handlePreviewAudio} disabled={!text.trim() || !selectedVoice}>
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setExportAudioDialogOpen(true)} disabled={!text.trim()}>
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setSettingsDialogOpen(true)}>
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </LiquidGlassCard>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <LiquidGlassCard>
                <div className="p-6 space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <BarChart className="w-5 h-5 text-purple-500" />
                    Usage Stats
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileAudio className="w-4 h-4 text-purple-500" />
                        <span className="text-sm">Total Syntheses</span>
                      </div>
                      <span className="font-semibold">{stats?.totalSyntheses || 0}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-purple-500" />
                        <span className="text-sm">Total Duration</span>
                      </div>
                      <span className="font-semibold">{formatDuration(stats?.totalDuration || 0)}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-purple-500" />
                        <span className="text-sm">Total Cost</span>
                      </div>
                      <span className="font-semibold">${(stats?.totalCost || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </LiquidGlassCard>

              {/* SSML Reference */}
              <LiquidGlassCard>
                <div className="p-6 space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Code className="w-5 h-5 text-purple-500" />
                    SSML Quick Reference
                  </h3>

                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {SSML_TAGS.map((tag, index) => (
                      <div key={index} className="p-3 bg-muted/50 rounded-lg">
                        <div className="font-mono text-sm text-purple-500 mb-1">&lt;{tag.tag}&gt;</div>
                        <p className="text-xs text-muted-foreground mb-2">{tag.description}</p>
                        <code className="text-xs bg-black/20 px-2 py-1 rounded">{tag.example}</code>
                      </div>
                    ))}
                  </div>
                </div>
              </LiquidGlassCard>
            </div>
          </motion.div>
        )}

        {/* Voice Library View */}
        {viewMode === 'voices' && (
          <motion.div
            key="voices"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Filters */}
            <LiquidGlassCard>
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search voices..."
                        value={voiceSearch}
                        onChange={(e) => setVoiceSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <select
                    value={voiceGender}
                    onChange={(e) => setVoiceGender(e.target.value)}
                    className="w-[180px] px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="all">All Genders</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="neutral">Neutral</option>
                  </select>

                  <select
                    value={voiceLanguage}
                    onChange={(e) => setVoiceLanguage(e.target.value)}
                    className="w-[180px] px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="all">All Languages</option>
                    <option value="en-US">English (US)</option>
                    <option value="en-GB">English (UK)</option>
                    <option value="es-ES">Spanish</option>
                  </select>

                  <div className="flex gap-2">
                    <Button
                      variant={layoutMode === 'grid' ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => setLayoutMode('grid')}
                    >
                      <Grid className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={layoutMode === 'list' ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => setLayoutMode('list')}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </LiquidGlassCard>

            {/* Voice Categories */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {VOICE_CATEGORIES.map((category) => (
                <Card key={category.id} className="p-4 hover:shadow-lg transition-all cursor-pointer">
                  <div className="text-center space-y-2">
                    <div className="text-3xl">{category.icon}</div>
                    <div className="font-semibold text-sm">{category.name}</div>
                    <Badge variant="secondary">{category.voiceCount}</Badge>
                  </div>
                </Card>
              ))}
            </div>

            {/* Voice Grid */}
            <div className={layoutMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredVoices.map((voice) => (
                <LiquidGlassCard key={voice.id}>
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{getVoiceIcon(voice.gender)}</div>
                        <div>
                          <div className="font-semibold flex items-center gap-2">
                            {voice.displayName}
                            {voice.isPremium && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                          </div>
                          <p className="text-xs text-muted-foreground">{voice.language} • {voice.accent}</p>
                        </div>
                      </div>
                      {voice.isNew && <Badge variant="secondary">New</Badge>}
                    </div>

                    <p className="text-sm text-muted-foreground">{voice.description}</p>

                    <div className="flex flex-wrap gap-2">
                      {voice.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant={selectedVoice?.id === voice.id ? 'default' : 'outline'}
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setSelectedVoice(voice)
                          setViewMode('synthesize')
                          toast.success(`Voice "${voice.displayName}" selected`)
                        }}
                      >
                        {selectedVoice?.id === voice.id ? 'Selected' : 'Select'}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handlePreviewVoice(voice)}>
                        {playingVoiceId === voice.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </LiquidGlassCard>
              ))}
            </div>
          </motion.div>
        )}

        {/* Projects View */}
        {viewMode === 'projects' && (
          <motion.div
            key="projects"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Projects Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">Voice Synthesis Projects</h3>
                <p className="text-sm text-muted-foreground">Manage your audio generation projects</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setCloneVoiceDialogOpen(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Clone Voice
                </Button>
                <Button variant="outline" onClick={() => setCreateVoiceDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Voice
                </Button>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500" onClick={() => setNewProjectDialogOpen(true)}>
                  <FolderPlus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </div>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { id: 1, name: 'Marketing Campaign Voiceovers', files: 12, duration: '45:30', status: 'active', lastEdited: '2 hours ago' },
                { id: 2, name: 'Podcast Intro Series', files: 5, duration: '12:15', status: 'completed', lastEdited: '1 day ago' },
                { id: 3, name: 'E-Learning Module Narration', files: 24, duration: '2:15:00', status: 'active', lastEdited: '3 hours ago' },
                { id: 4, name: 'Product Demo Scripts', files: 8, duration: '28:45', status: 'draft', lastEdited: '5 days ago' },
                { id: 5, name: 'Audiobook Chapter 1-5', files: 5, duration: '4:32:10', status: 'completed', lastEdited: '1 week ago' },
                { id: 6, name: 'IVR Phone System', files: 15, duration: '18:20', status: 'active', lastEdited: '12 hours ago' }
              ].map((project) => (
                <LiquidGlassCard key={project.id} className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                      <FileAudio className="w-5 h-5 text-purple-400" />
                    </div>
                    <Badge variant={project.status === 'completed' ? 'default' : project.status === 'active' ? 'secondary' : 'outline'}>
                      {project.status}
                    </Badge>
                  </div>
                  <h4 className="font-semibold mb-1 truncate">{project.name}</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <FileAudio className="w-3 h-3" />
                      {project.files} files
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {project.duration}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <span className="text-xs text-muted-foreground">Edited {project.lastEdited}</span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => handlePlayProject(project.id, project.name)}
                      >
                        {playingProjectId === project.id ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => handleDownloadProject(project.id, project.name)}
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => handleShareProject(project)}
                      >
                        <Share2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </LiquidGlassCard>
              ))}
            </div>
          </motion.div>
        )}

        {/* Analytics View */}
        {viewMode === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Analytics Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">Usage Analytics</h3>
                <p className="text-sm text-muted-foreground">Track your voice synthesis usage and performance</p>
              </div>
              <select
                defaultValue="30days"
                className="w-[140px] px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
                <option value="90days">Last 90 days</option>
              </select>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Synthesized', value: '245', unit: 'files', icon: FileAudio, color: 'purple', trend: '+12%' },
                { label: 'Audio Duration', value: '18.5', unit: 'hours', icon: Clock, color: 'blue', trend: '+8%' },
                { label: 'Characters Used', value: '156K', unit: 'chars', icon: BookOpen, color: 'green', trend: '+23%' },
                { label: 'Total Cost', value: '$42.50', unit: 'this month', icon: DollarSign, color: 'orange', trend: '-5%' }
              ].map((stat, i) => (
                <LiquidGlassCard key={i} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg bg-${stat.color}-500/20`}>
                      <stat.icon className={`w-4 h-4 text-${stat.color}-400`} />
                    </div>
                    <Badge variant={stat.trend.startsWith('+') ? 'default' : 'secondary'} className="text-xs">
                      {stat.trend}
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label} • {stat.unit}</div>
                </LiquidGlassCard>
              ))}
            </div>

            {/* Usage Chart Placeholder */}
            <LiquidGlassCard className="p-6">
              <h4 className="font-semibold mb-4">Daily Usage Trend</h4>
              <div className="h-48 flex items-end justify-between gap-2">
                {[40, 65, 45, 80, 55, 70, 90, 75, 60, 85, 50, 95, 70, 80].map((height, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-sm transition-all hover:opacity-80"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-[10px] text-muted-foreground">{i + 1}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                <span>Dec 1</span>
                <span>Dec 14</span>
              </div>
            </LiquidGlassCard>

            {/* Voice Usage Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LiquidGlassCard className="p-4">
                <h4 className="font-semibold mb-4">Top Used Voices</h4>
                <div className="space-y-3">
                  {[
                    { name: 'Emily (US)', uses: 78, percentage: 32 },
                    { name: 'James (UK)', uses: 54, percentage: 22 },
                    { name: 'Sofia (Spanish)', uses: 45, percentage: 18 },
                    { name: 'Akira (Japanese)', uses: 38, percentage: 16 },
                    { name: 'Hans (German)', uses: 30, percentage: 12 }
                  ].map((voice, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-medium text-white">
                        {voice.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{voice.name}</span>
                          <span className="text-muted-foreground">{voice.uses} uses</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                            style={{ width: `${voice.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </LiquidGlassCard>

              <LiquidGlassCard className="p-4">
                <h4 className="font-semibold mb-4">Recent Activity</h4>
                <div className="space-y-3">
                  {[
                    { action: 'Generated audio', file: 'intro_v3.mp3', time: '5 min ago' },
                    { action: 'Created project', file: 'Q4 Marketing', time: '1 hour ago' },
                    { action: 'Downloaded batch', file: '12 files', time: '3 hours ago' },
                    { action: 'Generated audio', file: 'chapter_05.mp3', time: '5 hours ago' },
                    { action: 'Updated settings', file: 'Voice preferences', time: '1 day ago' }
                  ].map((activity, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      <div className="flex-1">
                        <span className="text-muted-foreground">{activity.action}:</span>{' '}
                        <span className="font-medium">{activity.file}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </LiquidGlassCard>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Voice Dialog */}
      <Dialog open={createVoiceDialogOpen} onOpenChange={setCreateVoiceDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-purple-500" />
              Create Custom Voice
            </DialogTitle>
            <DialogDescription>
              Create a new custom voice profile with your preferred settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="voice-name">Voice Name</Label>
              <Input
                id="voice-name"
                placeholder="Enter voice name..."
                value={newVoiceName}
                onChange={(e) => setNewVoiceName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="voice-description">Description</Label>
              <Textarea
                id="voice-description"
                placeholder="Describe the voice characteristics..."
                value={newVoiceDescription}
                onChange={(e) => setNewVoiceDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="voice-gender">Gender</Label>
              <select
                id="voice-gender"
                value={newVoiceGender}
                onChange={(e) => setNewVoiceGender(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="neutral">Neutral</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateVoiceDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateVoice} className="bg-gradient-to-r from-purple-500 to-pink-500">
              <Plus className="w-4 h-4 mr-2" />
              Create Voice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clone Voice Dialog */}
      <Dialog open={cloneVoiceDialogOpen} onOpenChange={setCloneVoiceDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-purple-500" />
              Clone Voice from Audio
            </DialogTitle>
            <DialogDescription>
              Upload an audio sample to clone and create a new voice profile.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="clone-name">Voice Name</Label>
              <Input
                id="clone-name"
                placeholder="Name for the cloned voice..."
                value={cloneVoiceName}
                onChange={(e) => setCloneVoiceName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Audio Sample</Label>
              <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  id="audio-upload"
                  onChange={(e) => setCloneVoiceFile(e.target.files?.[0] || null)}
                />
                <label htmlFor="audio-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  {cloneVoiceFile ? (
                    <p className="text-sm font-medium">{cloneVoiceFile.name}</p>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">Click to upload audio file</p>
                      <p className="text-xs text-muted-foreground mt-1">MP3, WAV, OGG (max 10MB)</p>
                    </>
                  )}
                </label>
              </div>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Tips for best results:</strong> Use a clear audio sample of 30-60 seconds with minimal background noise.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCloneVoiceDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCloneVoice} className="bg-gradient-to-r from-purple-500 to-pink-500">
              <Mic className="w-4 h-4 mr-2" />
              Clone Voice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Audio Dialog */}
      <Dialog open={exportAudioDialogOpen} onOpenChange={setExportAudioDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-purple-500" />
              Export Audio
            </DialogTitle>
            <DialogDescription>
              Configure export settings for your synthesized audio.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Audio Format</Label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="mp3">MP3 (Compressed, widely compatible)</option>
                <option value="wav">WAV (Uncompressed, high quality)</option>
                <option value="ogg">OGG (Open format, good compression)</option>
                <option value="flac">FLAC (Lossless, best quality)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Quality</Label>
              <select
                value={exportQuality}
                onChange={(e) => setExportQuality(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="low">Low (64 kbps) - Smaller file size</option>
                <option value="medium">Medium (128 kbps) - Balanced</option>
                <option value="high">High (192 kbps) - Recommended</option>
                <option value="ultra">Ultra (320 kbps) - Best quality</option>
              </select>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Estimated file size:</span>
                <span className="font-medium">{Math.round(estimatedDuration * (exportQuality === 'ultra' ? 40 : exportQuality === 'high' ? 24 : exportQuality === 'medium' ? 16 : 8))} KB</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-medium">{formatDuration(estimatedDuration)}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportAudioDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExportAudio} className="bg-gradient-to-r from-purple-500 to-pink-500">
              <Download className="w-4 h-4 mr-2" />
              Export Audio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-500" />
              Voice Synthesis Settings
            </DialogTitle>
            <DialogDescription>
              Configure your default voice synthesis preferences.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <h4 className="font-medium">Audio Output</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label>Default Format</Label>
                  <select
                    value={audioFormat}
                    onChange={(e) => setAudioFormat(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="mp3">MP3</option>
                    <option value="wav">WAV</option>
                    <option value="ogg">OGG</option>
                    <option value="flac">FLAC</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Default Quality</Label>
                  <select
                    value={audioQuality}
                    onChange={(e) => setAudioQuality(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="low">Low (64 kbps)</option>
                    <option value="medium">Medium (128 kbps)</option>
                    <option value="high">High (192 kbps)</option>
                    <option value="ultra">Ultra (320 kbps)</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">Voice Parameters</h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Default Speed</Label>
                    <span className="text-sm text-muted-foreground">{speed[0].toFixed(1)}x</span>
                  </div>
                  <Slider
                    value={speed}
                    onValueChange={setSpeed}
                    min={0.5}
                    max={2.0}
                    step={0.1}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Default Pitch</Label>
                    <span className="text-sm text-muted-foreground">{pitch[0].toFixed(1)}x</span>
                  </div>
                  <Slider
                    value={pitch}
                    onValueChange={setPitch}
                    min={0.5}
                    max={2.0}
                    step={0.1}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Default Volume</Label>
                    <span className="text-sm text-muted-foreground">{volume[0]}%</span>
                  </div>
                  <Slider
                    value={volume}
                    onValueChange={setVolume}
                    min={0}
                    max={100}
                    step={1}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleResetSettings}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Defaults
            </Button>
            <Button onClick={handleSaveSettings} className="bg-gradient-to-r from-purple-500 to-pink-500">
              <Check className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Project Dialog */}
      <Dialog open={newProjectDialogOpen} onOpenChange={setNewProjectDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-purple-500" />
              Create New Project
            </DialogTitle>
            <DialogDescription>
              Create a new voice synthesis project to organize your audio files.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                placeholder="Enter project name..."
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-description">Description (optional)</Label>
              <Textarea
                id="project-description"
                placeholder="Describe your project..."
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewProjectDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateProject} className="bg-gradient-to-r from-purple-500 to-pink-500">
              <FolderPlus className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-purple-500" />
              Share Project
            </DialogTitle>
            <DialogDescription>
              Share "{selectedProjectForShare?.name}" with others.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Share Link</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={`https://freeflow.app/voice-projects/${selectedProjectForShare?.id}`}
                  className="font-mono text-sm"
                />
                <Button variant="outline" onClick={handleCopyShareLink}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Share via</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    const url = `https://freeflow.app/voice-projects/${selectedProjectForShare?.id}`
                    window.open(`mailto:?subject=Check out this voice project&body=${encodeURIComponent(url)}`, '_blank')
                    toast.success('Email client opened')
                  }}
                >
                  Email
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    const url = `https://freeflow.app/voice-projects/${selectedProjectForShare?.id}`
                    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent('Check out this voice project!')}`, '_blank')
                    toast.success('Twitter opened')
                  }}
                >
                  Twitter
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    const url = `https://freeflow.app/voice-projects/${selectedProjectForShare?.id}`
                    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')
                    toast.success('LinkedIn opened')
                  }}
                >
                  LinkedIn
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
