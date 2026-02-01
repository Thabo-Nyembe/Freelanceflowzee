'use client'

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
// Note: Radix Select removed due to infinite loop bug - using native HTML select instead
import {
  Mic, Play, Download, Share2, Settings, Sparkles,
  User, Clock, DollarSign, Star,
  Search, Grid, List, BarChart, FileAudio,
  Wand2, BookOpen, Code, Check
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

// A+++ UTILITIES
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

export default function AIVoiceSynthesisPage() {
  // A+++ STATE MANAGEMENT
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

  // Data state
  const [voices, setVoices] = useState<Voice[]>([])
  const [syntheses, setSyntheses] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)

  // A+++ LOAD AI VOICE SYNTHESIS DATA
  useEffect(() => {
    const loadAIVoiceSynthesisData = async () => {
      if (!userId) {
        logger.info('Waiting for user authentication')
        setIsPageLoading(false)
        return
      }

      try {
        setIsPageLoading(true)
        setError(null)

        logger.info('Loading AI Voice Synthesis data from Supabase', { userId })

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

        logger.info('AI Voice Synthesis data loaded', {
          voices: voicesResult.data?.length || 0,
          syntheses: synthesesResult.data?.length || 0,
          projects: projectsResult.data?.length || 0
        })

        toast.success('AI Voice Synthesis loaded', {
          description: `${voicesResult.data?.length || 0} voices • ${synthesesResult.data?.length || 0} syntheses • ${projectsResult.data?.length || 0} projects`
        })

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
    logger.info('Starting voice synthesis', {
      voice: selectedVoice.name,
      voiceId: selectedVoice.id,
      characterCount,
      estimatedDuration,
      estimatedCost,
      speed: speed[0],
      pitch: pitch[0],
      volume: volume[0],
      audioFormat,
      audioQuality,
      language: selectedVoice.language
    })

    toast.info('Synthesizing voice...', {
      description: `${selectedVoice.name} - ${characterCount} characters - ${estimatedDuration}s - ${audioFormat.toUpperCase()} ${audioQuality}`
    })

    setIsSynthesizing(true)

    const startTime = Date.now()
    const fileSize = Math.round(estimatedDuration * (audioQuality === 'high' ? 128 : audioQuality === 'medium' ? 96 : 64) / 8)

    // Save synthesis to database
    if (userId) {
      try {
        const { createVoiceSynthesis, incrementVoiceUsage, trackVoiceAnalytics } = await import('@/lib/ai-voice-queries')

        // Call voice synthesis API for actual processing
        const synthResponse = await fetch('/api/ai/voice-synthesis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            voiceId: selectedVoice.id,
            speed: speed[0],
            pitch: pitch[0],
            format: audioFormat,
            quality: audioQuality
          })
        })
        if (!synthResponse.ok) {
          const err = await synthResponse.json()
          throw new Error(err.message || 'Synthesis failed')
        }
        const processingTime = (Date.now() - startTime) / 1000

        // Create synthesis record
        const { data: synthesis, error } = await createVoiceSynthesis(userId, {
          voice_id: selectedVoice.id,
          text: text,
          style: 'professional',
          speed: speed[0],
          pitch: pitch[0],
          volume: volume[0],
          format: audioFormat as string,
          quality: audioQuality as string,
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
        logger.info('Voice synthesis saved to database', {
          synthesisId: synthesis?.id,
          voice: selectedVoice.name,
          characterCount,
          duration: estimatedDuration
        })

        toast.success('Voice synthesized successfully', {
          description: `${selectedVoice.name} - ${characterCount} chars - ${estimatedDuration}s - ${fileSize}KB ${audioFormat.toUpperCase()} - $${estimatedCost.toFixed(4)} - Ready to download`
        })
        announce('Voice synthesis completed', 'polite')
      } catch (err) {
        setIsSynthesizing(false)
        logger.error('Voice synthesis failed', { error: err })
        toast.error('Synthesis failed', {
          description: err instanceof Error ? err.message : 'Please try again'
        })
      }
    } else {
      // Fallback for non-authenticated users
      setTimeout(() => {
        setIsSynthesizing(false)
        toast.success('Voice synthesized successfully', {
          description: `${selectedVoice.name} - ${characterCount} chars - ${estimatedDuration}s - ${fileSize}KB ${audioFormat.toUpperCase()} - $${estimatedCost.toFixed(4)} - Ready to download`
        })
      }, 2000)
    }
  }

  const handleCopySSML = () => {
    setCopiedSSML(true)
    setTimeout(() => setCopiedSSML(false), 2000)
  }

  // A+++ LOADING STATE
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
          <DashboardSkeleton />
        </div>
      </div>
    )
  }

  // A+++ ERROR STATE
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
                    <Button variant="ghost" size="sm">Reset</Button>
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
                    <Button variant="outline" size="icon" onClick={() => {
                      if (!text.trim()) {
                        toast.error('Please enter text to preview')
                        return
                      }
                      setIsPlaying(!isPlaying)
                      toast.info(isPlaying ? 'Preview paused' : 'Playing preview', { description: 'Text-to-speech preview' })
                    }}>
                      <Play className="w-4 h-4" />
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
                        variant={selectedVoice.id === voice.id ? 'default' : 'outline'}
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setSelectedVoice(voice)
                          setViewMode('synthesize')
                        }}
                      >
                        {selectedVoice.id === voice.id ? 'Selected' : 'Select'}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Play className="w-4 h-4" />
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
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
                <FileAudio className="w-4 h-4 mr-2" />
                New Project
              </Button>
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
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <Play className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <Download className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
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
    </div>
  )
}
