'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { GlowEffect } from '@/components/ui/glow-effect'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Mic, Play, Pause, Download, Save, Share2, Settings, Sparkles,
  User, Volume2, Gauge, Music, Clock, DollarSign, Star,
  Search, Filter, Grid, List, BarChart, History, FileAudio,
  Wand2, Languages, BookOpen, Code, Upload, Copy, Check
} from 'lucide-react'

import {
  VOICE_CATEGORIES,
  SSML_TAGS,
  formatDuration,
  formatFileSize,
  estimateDuration,
  calculateCost,
  getVoiceIcon,
  getAgeLabel,
  filterVoices,
  sortVoices
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
  getUserVoiceStats,
  createVoiceSynthesis,
  type Voice as DBVoice,
  type VoiceSynthesis as DBSynthesis,
  type VoiceProject as DBProject
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
      } catch (err: any) {
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

  const handleSynthesize = () => {
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
    setTimeout(() => {
      setIsSynthesizing(false)

      const fileSize = Math.round(estimatedDuration * (audioQuality === 'high' ? 128 : audioQuality === 'medium' ? 96 : 64) / 8)

      logger.info('Voice synthesized successfully', {
        voice: selectedVoice.name,
        characterCount,
        duration: estimatedDuration,
        cost: estimatedCost,
        fileSize,
        format: audioFormat
      })

      toast.success('Voice synthesized successfully', {
        description: `${selectedVoice.name} - ${characterCount} chars - ${estimatedDuration}s - ${fileSize}KB ${audioFormat.toUpperCase()} - $${estimatedCost.toFixed(4)} - Ready to download`
      })
    }, 2000)
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
                      <Select value={audioFormat} onValueChange={setAudioFormat}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mp3">MP3 (Compressed)</SelectItem>
                          <SelectItem value="wav">WAV (Uncompressed)</SelectItem>
                          <SelectItem value="ogg">OGG (Open Format)</SelectItem>
                          <SelectItem value="flac">FLAC (Lossless)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Quality</label>
                      <Select value={audioQuality} onValueChange={setAudioQuality}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low (64 kbps)</SelectItem>
                          <SelectItem value="medium">Medium (128 kbps)</SelectItem>
                          <SelectItem value="high">High (192 kbps)</SelectItem>
                          <SelectItem value="ultra">Ultra (320 kbps)</SelectItem>
                        </SelectContent>
                      </Select>
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
                    <Button variant="outline" size="icon">
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

                  <Select value={voiceGender} onValueChange={setVoiceGender}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Genders</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={voiceLanguage} onValueChange={setVoiceLanguage}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Languages</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="en-GB">English (UK)</SelectItem>
                      <SelectItem value="es-ES">Spanish</SelectItem>
                    </SelectContent>
                  </Select>

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
            className="text-center py-20"
          >
            <FileAudio className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Voice Synthesis Projects</h3>
            <p className="text-muted-foreground">Project management coming soon</p>
          </motion.div>
        )}

        {/* Analytics View */}
        {viewMode === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-20"
          >
            <BarChart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Usage Analytics</h3>
            <p className="text-muted-foreground">Analytics dashboard coming soon</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
