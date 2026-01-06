'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Music,
  Mic,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Rewind,
  FastForward,
  Upload,
  Download,
  Settings,
  AudioWaveform,
  Sliders,
  Clock,
  Trash2,
  Plus,
  Headphones,
  Radio,
  Disc,
  Guitar,
  Piano,
  Layers,
  Copy,
  Lock,
  MoreHorizontal,
  Repeat,
  Save,
  FolderOpen,
  Share2,
  Wand2,
  TrendingUp,
  Activity,
  Cpu,
  HardDrive,
  Grid3X3,
  Search,
  Terminal,
  RefreshCw,
  AlertCircle
} from 'lucide-react'

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

// Types
type TrackType = 'audio' | 'midi' | 'aux' | 'master' | 'bus'
type TrackStatus = 'recording' | 'playing' | 'stopped' | 'muted' | 'solo'
type EffectCategory = 'dynamics' | 'eq' | 'reverb' | 'delay' | 'modulation' | 'distortion' | 'utility'
type InstrumentCategory = 'synth' | 'sampler' | 'drums' | 'keys' | 'strings' | 'brass' | 'woodwind'
type AutomationType = 'volume' | 'pan' | 'send' | 'plugin'
type ExportFormat = 'wav' | 'mp3' | 'flac' | 'aiff' | 'ogg'

interface AudioRegion {
  id: string
  name: string
  startTime: number
  endTime: number
  color: string
  fadeIn: number
  fadeOut: number
  gain: number
  muted: boolean
}

interface Track {
  id: string
  name: string
  type: TrackType
  color: string
  volume: number
  pan: number
  muted: boolean
  solo: boolean
  armed: boolean
  locked: boolean
  visible: boolean
  regions: AudioRegion[]
  effects: string[]
  sends: { busId: string; amount: number }[]
  automationEnabled: boolean
  inputSource?: string
  outputBus: string
  order: number
}

interface MixerChannel {
  id: string
  trackId: string
  name: string
  type: TrackType
  volume: number
  pan: number
  muted: boolean
  solo: boolean
  peakLevel: number
  effects: string[]
  sends: { name: string; amount: number }[]
}

interface Effect {
  id: string
  name: string
  category: EffectCategory
  brand: string
  description: string
  presets: string[]
  parameters: { name: string; value: number; min: number; max: number }[]
  active: boolean
  cpuUsage: number
}

interface Instrument {
  id: string
  name: string
  category: InstrumentCategory
  brand: string
  description: string
  presets: string[]
  polyphony: number
  cpuUsage: number
  icon: string
}

interface AutomationLane {
  id: string
  trackId: string
  parameter: AutomationType
  parameterName: string
  points: { time: number; value: number }[]
  color: string
  visible: boolean
}

interface ExportSettings {
  format: ExportFormat
  sampleRate: number
  bitDepth: number
  normalize: boolean
  dither: boolean
  startTime: number
  endTime: number
}

interface ProjectStats {
  totalTracks: number
  totalRegions: number
  projectLength: number
  sampleRate: number
  bitDepth: number
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
}

// Helper functions
const getTrackTypeColor = (type: TrackType): string => {
  const colors: Record<TrackType, string> = {
    audio: 'bg-blue-500',
    midi: 'bg-purple-500',
    aux: 'bg-orange-500',
    master: 'bg-red-500',
    bus: 'bg-green-500'
  }
  return colors[type]
}

const getEffectCategoryColor = (category: EffectCategory): string => {
  const colors: Record<EffectCategory, string> = {
    dynamics: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    eq: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    reverb: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    delay: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    modulation: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    distortion: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    utility: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
  }
  return colors[category]
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 100)
  return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
}

const formatBars = (seconds: number, bpm: number): string => {
  const beatsPerSecond = bpm / 60
  const totalBeats = seconds * beatsPerSecond
  const bars = Math.floor(totalBeats / 4) + 1
  const beats = Math.floor(totalBeats % 4) + 1
  return `${bars}.${beats}`
}

// Mock data
const mockTracks: Track[] = [
  {
    id: 't1',
    name: 'Lead Vocals',
    type: 'audio',
    color: '#3B82F6',
    volume: 0,
    pan: 0,
    muted: false,
    solo: false,
    armed: false,
    locked: false,
    visible: true,
    regions: [
      { id: 'r1', name: 'Verse 1', startTime: 0, endTime: 32, color: '#3B82F6', fadeIn: 0.5, fadeOut: 0.5, gain: 0, muted: false },
      { id: 'r2', name: 'Chorus', startTime: 32, endTime: 64, color: '#3B82F6', fadeIn: 0, fadeOut: 0, gain: 2, muted: false }
    ],
    effects: ['Compressor', 'EQ', 'De-Esser', 'Reverb Send'],
    sends: [{ busId: 'bus1', amount: -12 }],
    automationEnabled: true,
    inputSource: 'Input 1',
    outputBus: 'master',
    order: 1
  },
  {
    id: 't2',
    name: 'Backing Vocals',
    type: 'audio',
    color: '#8B5CF6',
    volume: -6,
    pan: -30,
    muted: false,
    solo: false,
    armed: false,
    locked: false,
    visible: true,
    regions: [
      { id: 'r3', name: 'BV Chorus', startTime: 32, endTime: 64, color: '#8B5CF6', fadeIn: 0, fadeOut: 1, gain: 0, muted: false }
    ],
    effects: ['EQ', 'Chorus', 'Reverb Send'],
    sends: [{ busId: 'bus1', amount: -8 }],
    automationEnabled: false,
    inputSource: 'Input 2',
    outputBus: 'master',
    order: 2
  },
  {
    id: 't3',
    name: 'Piano',
    type: 'midi',
    color: '#10B981',
    volume: -3,
    pan: 10,
    muted: false,
    solo: false,
    armed: false,
    locked: false,
    visible: true,
    regions: [
      { id: 'r4', name: 'Piano Intro', startTime: 0, endTime: 16, color: '#10B981', fadeIn: 0, fadeOut: 0, gain: 0, muted: false },
      { id: 'r5', name: 'Piano Verse', startTime: 16, endTime: 64, color: '#10B981', fadeIn: 0, fadeOut: 0, gain: 0, muted: false }
    ],
    effects: ['EQ', 'Compressor'],
    sends: [{ busId: 'bus1', amount: -18 }],
    automationEnabled: true,
    outputBus: 'master',
    order: 3
  },
  {
    id: 't4',
    name: 'Synth Lead',
    type: 'midi',
    color: '#F59E0B',
    volume: -8,
    pan: -20,
    muted: false,
    solo: false,
    armed: true,
    locked: false,
    visible: true,
    regions: [
      { id: 'r6', name: 'Synth Hook', startTime: 48, endTime: 64, color: '#F59E0B', fadeIn: 0, fadeOut: 0, gain: 0, muted: false }
    ],
    effects: ['Filter', 'Delay', 'Reverb Send'],
    sends: [{ busId: 'bus1', amount: -10 }],
    automationEnabled: true,
    outputBus: 'master',
    order: 4
  },
  {
    id: 't5',
    name: 'Drums',
    type: 'audio',
    color: '#EF4444',
    volume: -2,
    pan: 0,
    muted: false,
    solo: false,
    armed: false,
    locked: true,
    visible: true,
    regions: [
      { id: 'r7', name: 'Drum Loop', startTime: 0, endTime: 64, color: '#EF4444', fadeIn: 0, fadeOut: 0, gain: 0, muted: false }
    ],
    effects: ['Transient Shaper', 'EQ', 'Compressor', 'Limiter'],
    sends: [],
    automationEnabled: false,
    outputBus: 'master',
    order: 5
  },
  {
    id: 't6',
    name: 'Bass',
    type: 'midi',
    color: '#EC4899',
    volume: -4,
    pan: 0,
    muted: false,
    solo: false,
    armed: false,
    locked: false,
    visible: true,
    regions: [
      { id: 'r8', name: 'Bass Line', startTime: 0, endTime: 64, color: '#EC4899', fadeIn: 0, fadeOut: 0, gain: 0, muted: false }
    ],
    effects: ['Saturation', 'EQ', 'Compressor'],
    sends: [],
    automationEnabled: true,
    outputBus: 'master',
    order: 6
  },
  {
    id: 'bus1',
    name: 'Reverb Bus',
    type: 'bus',
    color: '#6366F1',
    volume: -6,
    pan: 0,
    muted: false,
    solo: false,
    armed: false,
    locked: false,
    visible: true,
    regions: [],
    effects: ['Plate Reverb', 'EQ'],
    sends: [],
    automationEnabled: false,
    outputBus: 'master',
    order: 7
  },
  {
    id: 'master',
    name: 'Master',
    type: 'master',
    color: '#DC2626',
    volume: 0,
    pan: 0,
    muted: false,
    solo: false,
    armed: false,
    locked: true,
    visible: true,
    regions: [],
    effects: ['EQ', 'Multiband Compressor', 'Limiter', 'Meter'],
    sends: [],
    automationEnabled: false,
    outputBus: 'output',
    order: 8
  }
]

const mockEffects: Effect[] = [
  {
    id: 'e1',
    name: 'Pro Compressor',
    category: 'dynamics',
    brand: 'StudioFX',
    description: 'Professional dynamics processor with vintage character',
    presets: ['Vocal', 'Drums', 'Bus Glue', 'Transparent', 'Aggressive'],
    parameters: [
      { name: 'Threshold', value: -18, min: -60, max: 0 },
      { name: 'Ratio', value: 4, min: 1, max: 20 },
      { name: 'Attack', value: 10, min: 0.1, max: 100 },
      { name: 'Release', value: 100, min: 10, max: 1000 }
    ],
    active: true,
    cpuUsage: 2.3
  },
  {
    id: 'e2',
    name: 'Parametric EQ',
    category: 'eq',
    brand: 'StudioFX',
    description: '8-band parametric equalizer with spectrum analyzer',
    presets: ['Vocal Presence', 'Kick Punch', 'High Pass', 'Low Shelf'],
    parameters: [
      { name: 'Low Cut', value: 80, min: 20, max: 500 },
      { name: 'Low Shelf', value: 2, min: -12, max: 12 },
      { name: 'Mid', value: 0, min: -12, max: 12 },
      { name: 'High Shelf', value: 1, min: -12, max: 12 }
    ],
    active: true,
    cpuUsage: 1.8
  },
  {
    id: 'e3',
    name: 'Plate Reverb',
    category: 'reverb',
    brand: 'VintageAudio',
    description: 'Classic plate reverb with warm, musical decay',
    presets: ['Small Room', 'Large Hall', 'Cathedral', 'Plate Classic'],
    parameters: [
      { name: 'Decay', value: 2.5, min: 0.1, max: 10 },
      { name: 'Pre-delay', value: 20, min: 0, max: 200 },
      { name: 'Damping', value: 5000, min: 1000, max: 20000 },
      { name: 'Mix', value: 30, min: 0, max: 100 }
    ],
    active: true,
    cpuUsage: 4.2
  },
  {
    id: 'e4',
    name: 'Tape Delay',
    category: 'delay',
    brand: 'VintageAudio',
    description: 'Warm tape delay with modulation and saturation',
    presets: ['Slapback', 'Ping Pong', 'Dotted Eighth', 'Ambient'],
    parameters: [
      { name: 'Time', value: 375, min: 1, max: 2000 },
      { name: 'Feedback', value: 40, min: 0, max: 100 },
      { name: 'Modulation', value: 20, min: 0, max: 100 },
      { name: 'Mix', value: 25, min: 0, max: 100 }
    ],
    active: true,
    cpuUsage: 3.1
  },
  {
    id: 'e5',
    name: 'Chorus Ensemble',
    category: 'modulation',
    brand: 'ModFX',
    description: 'Lush chorus with multiple voice modes',
    presets: ['Classic', 'Wide Stereo', 'Subtle', 'Thick'],
    parameters: [
      { name: 'Rate', value: 0.5, min: 0.01, max: 10 },
      { name: 'Depth', value: 50, min: 0, max: 100 },
      { name: 'Voices', value: 4, min: 2, max: 8 },
      { name: 'Mix', value: 50, min: 0, max: 100 }
    ],
    active: false,
    cpuUsage: 2.8
  },
  {
    id: 'e6',
    name: 'Tube Saturation',
    category: 'distortion',
    brand: 'VintageAudio',
    description: 'Analog tube warmth and harmonic saturation',
    presets: ['Warm', 'Crunch', 'Heavy', 'Subtle Grit'],
    parameters: [
      { name: 'Drive', value: 30, min: 0, max: 100 },
      { name: 'Tone', value: 5000, min: 1000, max: 10000 },
      { name: 'Output', value: 0, min: -12, max: 12 },
      { name: 'Mix', value: 100, min: 0, max: 100 }
    ],
    active: true,
    cpuUsage: 1.5
  },
  {
    id: 'e7',
    name: 'Limiter Pro',
    category: 'dynamics',
    brand: 'StudioFX',
    description: 'Transparent mastering limiter with true peak detection',
    presets: ['Mastering', 'Loud', 'Transparent', 'Broadcast'],
    parameters: [
      { name: 'Ceiling', value: -0.3, min: -6, max: 0 },
      { name: 'Release', value: 100, min: 10, max: 1000 },
      { name: 'Lookahead', value: 5, min: 0, max: 20 }
    ],
    active: true,
    cpuUsage: 1.2
  },
  {
    id: 'e8',
    name: 'De-Esser',
    category: 'dynamics',
    brand: 'VocalTools',
    description: 'Intelligent sibilance control for vocals',
    presets: ['Male Vocal', 'Female Vocal', 'Aggressive', 'Gentle'],
    parameters: [
      { name: 'Frequency', value: 6000, min: 4000, max: 10000 },
      { name: 'Threshold', value: -20, min: -40, max: 0 },
      { name: 'Range', value: 6, min: 0, max: 12 }
    ],
    active: true,
    cpuUsage: 0.8
  }
]

const mockInstruments: Instrument[] = [
  { id: 'i1', name: 'Analog Synth', category: 'synth', brand: 'SynthLab', description: 'Classic analog synthesizer with warm oscillators', presets: ['Lead', 'Pad', 'Bass', 'Arp'], polyphony: 16, cpuUsage: 5.2, icon: 'synth' },
  { id: 'i2', name: 'Wavetable Pro', category: 'synth', brand: 'SynthLab', description: 'Modern wavetable synthesis with morphing', presets: ['Evolving', 'Digital', 'Hybrid'], polyphony: 32, cpuUsage: 8.1, icon: 'synth' },
  { id: 'i3', name: 'Grand Piano', category: 'keys', brand: 'AcousticSamples', description: 'Concert grand piano with 88 velocity layers', presets: ['Concert', 'Intimate', 'Bright', 'Mellow'], polyphony: 64, cpuUsage: 12.5, icon: 'piano' },
  { id: 'i4', name: 'Electric Piano', category: 'keys', brand: 'VintageKeys', description: 'Classic electric piano with tremolo', presets: ['Rhodes', 'Wurlitzer', 'DX7'], polyphony: 32, cpuUsage: 4.8, icon: 'piano' },
  { id: 'i5', name: 'Drum Machine', category: 'drums', brand: 'BeatMaker', description: 'Classic drum machines and acoustic kits', presets: ['808', '909', 'Acoustic', 'Electronic'], polyphony: 16, cpuUsage: 6.2, icon: 'drums' },
  { id: 'i6', name: 'Bass Station', category: 'synth', brand: 'SynthLab', description: 'Powerful bass synthesizer', presets: ['Sub Bass', 'Acid', 'Funk', 'Dubstep'], polyphony: 8, cpuUsage: 3.5, icon: 'synth' },
  { id: 'i7', name: 'String Ensemble', category: 'strings', brand: 'OrchestralSounds', description: 'Full string orchestra with articulations', presets: ['Legato', 'Staccato', 'Pizzicato', 'Tremolo'], polyphony: 48, cpuUsage: 15.3, icon: 'strings' },
  { id: 'i8', name: 'Sampler Pro', category: 'sampler', brand: 'SampleLab', description: 'Advanced sampler with time-stretching', presets: ['Custom'], polyphony: 128, cpuUsage: 7.8, icon: 'sampler' }
]

const mockStats: ProjectStats = {
  totalTracks: 8,
  totalRegions: 12,
  projectLength: 240,
  sampleRate: 48000,
  bitDepth: 24,
  cpuUsage: 32,
  memoryUsage: 2.4,
  diskUsage: 156
}

interface AudioStudioClientProps {
  initialTracks?: Track[]
  initialStats?: ProjectStats
}

// Competitive Upgrade Mock Data - Pro Tools/Logic Pro-level Audio Intelligence
const mockAudioAIInsights = [
  { id: '1', type: 'success' as const, title: 'Mix Clarity', description: 'Frequency balance is optimal across all stems!', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Mixing' },
  { id: '2', type: 'warning' as const, title: 'Clipping Detected', description: 'Track 3 peaks at -0.1dB - add limiter to prevent distortion.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Mastering' },
  { id: '3', type: 'info' as const, title: 'AI Suggestion', description: 'Adding subtle reverb to vocals can improve spatial depth.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'AI Assist' },
]

const mockAudioCollaborators = [
  { id: '1', name: 'Mix Engineer', avatar: '/avatars/mix.jpg', status: 'online' as const, role: 'Engineer' },
  { id: '2', name: 'Producer', avatar: '/avatars/producer.jpg', status: 'online' as const, role: 'Producer' },
  { id: '3', name: 'Session Musician', avatar: '/avatars/musician.jpg', status: 'away' as const, role: 'Musician' },
]

const mockAudioPredictions = [
  { id: '1', title: 'Master Completion', prediction: 'Final master will be ready for distribution in 2 hours', confidence: 88, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'LUFS Target', prediction: 'Current mix will hit -14 LUFS after mastering chain', confidence: 91, trend: 'up' as const, impact: 'medium' as const },
]

const mockAudioActivities = [
  { id: '1', user: 'Mix Engineer', action: 'Applied', target: 'multiband compression to master bus', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'Producer', action: 'Approved', target: 'vocal take #7', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'Session Musician', action: 'Recorded', target: 'guitar overdub', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'success' as const },
]

const mockAudioQuickActions = [
  { id: '1', label: 'New Track', icon: 'plus', action: () => toast.promise(new Promise(r => setTimeout(r, 600)), { loading: 'Creating track...', success: 'New audio track added to timeline', error: 'Failed to create' }), variant: 'default' as const },
  { id: '2', label: 'Record', icon: 'circle', action: () => toast.promise(new Promise(r => setTimeout(r, 800)), { loading: 'Initializing recording...', success: 'Recording started! Press again to stop', error: 'Microphone unavailable' }), variant: 'default' as const },
  { id: '3', label: 'Export', icon: 'download', action: () => toast.promise(new Promise(r => setTimeout(r, 2000)), { loading: 'Exporting audio mix...', success: 'Exported to master-mix.wav (48kHz/24bit)', error: 'Export failed' }), variant: 'outline' as const },
]

export default function AudioStudioClient({ initialTracks, initialStats }: AudioStudioClientProps) {
  const [activeTab, setActiveTab] = useState('tracks')
  const [tracks, setTracks] = useState<Track[]>(mockTracks)
  const [effects] = useState<Effect[]>(mockEffects)
  const [instruments] = useState<Instrument[]>(mockInstruments)
  const [stats] = useState<ProjectStats>(mockStats)
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null)
  const [showTrackDialog, setShowTrackDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [settingsTab, setSettingsTab] = useState('general')

  // Transport state
  const [isPlaying, setIsPlaying] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [loopEnabled, setLoopEnabled] = useState(false)
  const [loopStart, setLoopStart] = useState(0)
  const [loopEnd, setLoopEnd] = useState(64)
  const [bpm, setBpm] = useState(120)
  const [timeSignature, setTimeSignature] = useState('4/4')
  const [snapEnabled, setSnapEnabled] = useState(true)
  const [zoomLevel, setZoomLevel] = useState(100)

  // Mixer state
  const [masterVolume, setMasterVolume] = useState(0)
  const [masterPeak, setMasterPeak] = useState(-6)

  // Computed values
  const audioTracks = useMemo(() => tracks.filter(t => t.type === 'audio'), [tracks])
  const midiTracks = useMemo(() => tracks.filter(t => t.type === 'midi'), [tracks])
  const busTracks = useMemo(() => tracks.filter(t => t.type === 'bus' || t.type === 'aux'), [tracks])
  const masterTrack = useMemo(() => tracks.find(t => t.type === 'master'), [tracks])

  const filteredEffects = useMemo(() => {
    if (!searchQuery) return effects
    return effects.filter(e =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.brand.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [effects, searchQuery])

  const filteredInstruments = useMemo(() => {
    if (!searchQuery) return instruments
    return instruments.filter(i =>
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.brand.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [instruments, searchQuery])

  const totalCpuUsage = useMemo(() => {
    return effects.filter(e => e.active).reduce((sum, e) => sum + e.cpuUsage, 0)
  }, [effects])

  // Track actions
  const toggleTrackMute = (trackId: string) => {
    setTracks(prev => prev.map(t =>
      t.id === trackId ? { ...t, muted: !t.muted } : t
    ))
  }

  const toggleTrackSolo = (trackId: string) => {
    setTracks(prev => prev.map(t =>
      t.id === trackId ? { ...t, solo: !t.solo } : t
    ))
  }

  const toggleTrackArm = (trackId: string) => {
    setTracks(prev => prev.map(t =>
      t.id === trackId ? { ...t, armed: !t.armed } : t
    ))
  }

  const updateTrackVolume = (trackId: string, volume: number) => {
    setTracks(prev => prev.map(t =>
      t.id === trackId ? { ...t, volume } : t
    ))
  }

  const updateTrackPan = (trackId: string, pan: number) => {
    setTracks(prev => prev.map(t =>
      t.id === trackId ? { ...t, pan } : t
    ))
  }

  const openTrackDetail = (track: Track) => {
    setSelectedTrack(track)
    setShowTrackDialog(true)
  }

  // Dialog states
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [showInstrumentDialog, setShowInstrumentDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showProjectDialog, setShowProjectDialog] = useState(false)
  const [exportFormat, setExportFormat] = useState<string>('WAV')
  const [sampleRateSetting, setSampleRateSetting] = useState<string>('44.1kHz')
  const [bitDepthSetting, setBitDepthSetting] = useState<string>('16-bit')

  // Handlers
  const handleUploadAudio = () => setShowUploadDialog(true)
  const handleStartRecording = () => toast.promise(new Promise(r => setTimeout(r, 600)), { loading: 'Initializing recording...', success: 'Recording started - microphone active', error: 'Failed to start recording' })
  const handleStopRecording = () => toast.promise(new Promise(r => setTimeout(r, 1000)), { loading: 'Finalizing recording...', success: 'Recording saved to project', error: 'Failed to save recording' })
  const handleExportAudio = (n: string) => toast.promise(new Promise(r => setTimeout(r, 2000)), { loading: `Exporting "${n}"...`, success: 'Export complete!', error: 'Export failed' })
  const handleApplyEffect = (n: string) => toast.promise(new Promise(r => setTimeout(r, 1500)), { loading: `Applying ${n}...`, success: `${n} applied successfully`, error: 'Effect failed to apply' })

  // Stat cards
  const statCards = [
    { label: 'Tracks', value: stats.totalTracks, icon: Layers, color: 'from-blue-500 to-indigo-600', change: '+2' },
    { label: 'Regions', value: stats.totalRegions, icon: AudioWaveform, color: 'from-purple-500 to-violet-600', change: '+5' },
    { label: 'Duration', value: formatTime(stats.projectLength), icon: Clock, color: 'from-green-500 to-emerald-600', change: '' },
    { label: 'Sample Rate', value: `${stats.sampleRate / 1000}kHz`, icon: Activity, color: 'from-orange-500 to-red-600', change: '' },
    { label: 'Bit Depth', value: `${stats.bitDepth}-bit`, icon: Grid3X3, color: 'from-pink-500 to-rose-600', change: '' },
    { label: 'CPU', value: `${stats.cpuUsage}%`, icon: Cpu, color: 'from-cyan-500 to-blue-600', change: '-5%' },
    { label: 'Memory', value: `${stats.memoryUsage}GB`, icon: HardDrive, color: 'from-amber-500 to-orange-600', change: '' },
    { label: 'Disk', value: `${stats.diskUsage}MB`, icon: Save, color: 'from-teal-500 to-cyan-600', change: '+12MB' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/30 to-pink-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Music className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Audio Studio</h1>
              <p className="text-muted-foreground">Professional DAW for music production</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2" onClick={() => setShowProjectDialog(true)}>
              <FolderOpen className="w-4 h-4" />
              Open
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => toast.promise(new Promise(r => setTimeout(r, 1200)), { loading: 'Saving project...', success: 'Project saved successfully', error: 'Failed to save project' })}>
              <Save className="w-4 h-4" />
              Save
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => handleExportAudio('Project')}>
              <Share2 className="w-4 h-4" />
              Export
            </Button>
            <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 gap-2" onClick={() => toast.promise(new Promise(r => setTimeout(r, 800)), { loading: 'Creating new audio track...', success: 'New audio track added to timeline', error: 'Failed to create track' })}>
              <Plus className="w-4 h-4" />
              Add Track
            </Button>
          </div>
        </div>

        {/* Transport Controls */}
        <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              {/* Time Display */}
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-3xl font-mono font-bold">{formatTime(currentTime)}</div>
                  <div className="text-xs text-gray-400">Time</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-mono font-bold">{formatBars(currentTime, bpm)}</div>
                  <div className="text-xs text-gray-400">Bars.Beats</div>
                </div>
                <div className="h-10 w-px bg-gray-700" />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">BPM</span>
                  <Input
                    type="number"
                    value={bpm}
                    onChange={(e) => setBpm(Number(e.target.value))}
                    className="w-20 bg-gray-800 border-gray-700 text-white text-center"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Time Sig</span>
                  <span className="px-3 py-1 bg-gray-800 rounded text-white font-mono">{timeSignature}</span>
                </div>
              </div>

              {/* Transport Buttons */}
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-white hover:bg-gray-700" onClick={() => setCurrentTime(0)}>
                  <Rewind className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-white hover:bg-gray-700" onClick={() => setCurrentTime(Math.max(0, currentTime - 1))}>
                  <SkipBack className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`text-white hover:bg-gray-700 ${isPlaying ? 'bg-green-600 hover:bg-green-700' : ''}`}
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-gray-700"
                  onClick={() => { setIsPlaying(false); setCurrentTime(0) }}
                >
                  <Square className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`text-white hover:bg-gray-700 ${isRecording ? 'bg-red-600 hover:bg-red-700 animate-pulse' : ''}`}
                  onClick={() => setIsRecording(!isRecording)}
                >
                  <div className={`w-4 h-4 rounded-full ${isRecording ? 'bg-white' : 'bg-red-500'}`} />
                </Button>
                <Button variant="ghost" size="icon" className="text-white hover:bg-gray-700" onClick={() => setCurrentTime(currentTime + 1)}>
                  <SkipForward className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-white hover:bg-gray-700">
                  <FastForward className="w-5 h-5" />
                </Button>
                <div className="h-8 w-px bg-gray-700 mx-2" />
                <Button
                  variant="ghost"
                  size="icon"
                  className={`text-white hover:bg-gray-700 ${loopEnabled ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                  onClick={() => setLoopEnabled(!loopEnabled)}
                >
                  <Repeat className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`text-white hover:bg-gray-700 ${snapEnabled ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                  onClick={() => setSnapEnabled(!snapEnabled)}
                >
                  <Grid3X3 className="w-5 h-5" />
                </Button>
              </div>

              {/* Master Level */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Zoom</span>
                  <Slider
                    value={[zoomLevel]}
                    onValueChange={(v) => setZoomLevel(v[0])}
                    min={25}
                    max={400}
                    step={25}
                    className="w-24"
                  />
                  <span className="text-xs text-gray-400 w-12">{zoomLevel}%</span>
                </div>
                <div className="h-8 w-px bg-gray-700" />
                <div className="flex items-center gap-3">
                  <Volume2 className="w-5 h-5 text-gray-400" />
                  <div className="w-32 h-6 bg-gray-800 rounded overflow-hidden relative">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                      style={{ width: `${Math.min(100, (masterPeak + 60) * 100 / 60)}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-mono">
                      {masterVolume.toFixed(1)} dB
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {statCards.map((stat, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
                {stat.change && <span className="text-xs text-green-500 font-medium">{stat.change}</span>}
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 p-1 h-auto flex-wrap">
            <TabsTrigger value="tracks" className="gap-2">
              <Layers className="w-4 h-4" />
              Tracks
              <Badge variant="secondary" className="ml-1">{tracks.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="mixer" className="gap-2">
              <Sliders className="w-4 h-4" />
              Mixer
            </TabsTrigger>
            <TabsTrigger value="effects" className="gap-2">
              <Wand2 className="w-4 h-4" />
              Effects
              <Badge variant="secondary" className="ml-1">{effects.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="instruments" className="gap-2">
              <Piano className="w-4 h-4" />
              Instruments
              <Badge variant="secondary" className="ml-1">{instruments.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="automation" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Automation
            </TabsTrigger>
            <TabsTrigger value="export" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Tracks Tab - Timeline View */}
          <TabsContent value="tracks" className="space-y-4">
            {/* Tracks Overview Banner */}
            <div className="bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Audio Production Studio</h2>
                  <p className="text-purple-100">Professional multi-track recording and mixing</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{tracks.length}</p>
                    <p className="text-purple-200 text-sm">Tracks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{bpm}</p>
                    <p className="text-purple-200 text-sm">BPM</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{timeSignature}</p>
                    <p className="text-purple-200 text-sm">Time Sig</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: Plus, label: 'New Track', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', action: () => toast.promise(new Promise(r => setTimeout(r, 800)), { loading: 'Creating new track...', success: 'New audio track added', error: 'Failed to create track' }) },
                { icon: Mic, label: 'Record', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', action: handleStartRecording },
                { icon: Upload, label: 'Import', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', action: handleUploadAudio },
                { icon: Wand2, label: 'Add Effect', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', action: () => handleApplyEffect('New Effect') },
                { icon: Piano, label: 'Instrument', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', action: () => setShowInstrumentDialog(true) },
                { icon: TrendingUp, label: 'Automate', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', action: () => { setActiveTab('automation'); toast.promise(new Promise(r => setTimeout(r, 600)), { loading: 'Loading automation lanes...', success: 'Automation lanes ready - draw curves now', error: 'Failed to load automation' }) } },
                { icon: Download, label: 'Export', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', action: () => handleExportAudio('Project') },
                { icon: Share2, label: 'Share', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', action: () => setShowShareDialog(true) },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.action}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>Arrangement</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => toast.promise(new Promise(r => setTimeout(r, 700)), { loading: 'Creating audio track...', success: 'New audio track added to arrangement', error: 'Failed to create track' })}>
                      <Plus className="w-4 h-4" /> Audio
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => toast.promise(new Promise(r => setTimeout(r, 700)), { loading: 'Creating MIDI track...', success: 'New MIDI track added to arrangement', error: 'Failed to create track' })}>
                      <Plus className="w-4 h-4" /> MIDI
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => toast.promise(new Promise(r => setTimeout(r, 700)), { loading: 'Creating bus track...', success: 'New bus track added for routing', error: 'Failed to create track' })}>
                      <Plus className="w-4 h-4" /> Bus
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Timeline Header */}
                <div className="flex border-b dark:border-gray-700 mb-2">
                  <div className="w-64 flex-shrink-0 p-2 text-xs text-muted-foreground">Track</div>
                  <div className="flex-1 flex">
                    {Array.from({ length: 16 }, (_, i) => (
                      <div key={i} className="flex-1 p-2 text-xs text-muted-foreground text-center border-l dark:border-gray-700">
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tracks */}
                <div className="space-y-1">
                  {tracks.filter(t => t.visible).map(track => (
                    <div
                      key={track.id}
                      className={`flex items-stretch border rounded-lg overflow-hidden transition-all ${
                        selectedTrack?.id === track.id ? 'ring-2 ring-indigo-500' : ''
                      } ${track.muted ? 'opacity-50' : ''}`}
                      onClick={() => openTrackDetail(track)}
                    >
                      {/* Track Header */}
                      <div className="w-64 flex-shrink-0 p-2 bg-gray-50 dark:bg-gray-800 border-r dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded ${getTrackTypeColor(track.type)}`} />
                          <span className="font-medium truncate flex-1">{track.name}</span>
                          {track.locked && <Lock className="w-3 h-3 text-gray-400" />}
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-6 w-6 p-0 ${track.muted ? 'bg-red-100 text-red-600' : ''}`}
                            onClick={(e) => { e.stopPropagation(); toggleTrackMute(track.id) }}
                          >
                            M
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-6 w-6 p-0 ${track.solo ? 'bg-yellow-100 text-yellow-600' : ''}`}
                            onClick={(e) => { e.stopPropagation(); toggleTrackSolo(track.id) }}
                          >
                            S
                          </Button>
                          {track.type !== 'master' && track.type !== 'bus' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`h-6 w-6 p-0 ${track.armed ? 'bg-red-500 text-white' : ''}`}
                              onClick={(e) => { e.stopPropagation(); toggleTrackArm(track.id) }}
                            >
                              R
                            </Button>
                          )}
                          <div className="flex-1" />
                          <span className="text-xs text-muted-foreground">{track.volume > 0 ? '+' : ''}{track.volume}dB</span>
                        </div>
                      </div>

                      {/* Track Timeline */}
                      <div className="flex-1 relative h-16 bg-gray-100 dark:bg-gray-900">
                        {/* Grid lines */}
                        <div className="absolute inset-0 flex">
                          {Array.from({ length: 16 }, (_, i) => (
                            <div key={i} className="flex-1 border-l dark:border-gray-800" />
                          ))}
                        </div>

                        {/* Regions */}
                        {track.regions.map(region => {
                          const startPercent = (region.startTime / 64) * 100
                          const widthPercent = ((region.endTime - region.startTime) / 64) * 100
                          return (
                            <div
                              key={region.id}
                              className="absolute top-1 bottom-1 rounded-md shadow-sm flex items-center px-2 text-xs text-white font-medium truncate"
                              style={{
                                left: `${startPercent}%`,
                                width: `${widthPercent}%`,
                                backgroundColor: track.color,
                                opacity: region.muted ? 0.5 : 1
                              }}
                            >
                              {region.name}
                            </div>
                          )
                        })}

                        {/* Playhead */}
                        {currentTime < 64 && (
                          <div
                            className="absolute top-0 bottom-0 w-px bg-red-500 z-10"
                            style={{ left: `${(currentTime / 64) * 100}%` }}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mixer Tab */}
          <TabsContent value="mixer" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex gap-2 overflow-x-auto pb-4">
                  {tracks.map(track => (
                    <div
                      key={track.id}
                      className={`flex-shrink-0 w-24 rounded-lg border p-3 ${
                        track.type === 'master' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-gray-50 dark:bg-gray-800'
                      }`}
                    >
                      {/* Channel Strip */}
                      <div className="text-center mb-2">
                        <div className={`w-3 h-3 rounded mx-auto mb-1 ${getTrackTypeColor(track.type)}`} />
                        <span className="text-xs font-medium truncate block">{track.name}</span>
                      </div>

                      {/* Meter */}
                      <div className="h-32 w-4 mx-auto bg-gray-200 dark:bg-gray-700 rounded relative mb-2">
                        <div
                          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-500 via-yellow-500 to-red-500 rounded"
                          style={{ height: `${Math.random() * 80 + 10}%` }}
                        />
                      </div>

                      {/* Fader */}
                      <div className="mb-3">
                        <Slider
                          orientation="vertical"
                          value={[track.volume + 60]}
                          onValueChange={(v) => updateTrackVolume(track.id, v[0] - 60)}
                          min={0}
                          max={66}
                          step={0.1}
                          className="h-24 mx-auto"
                        />
                        <div className="text-center text-xs mt-1">{track.volume > 0 ? '+' : ''}{track.volume.toFixed(1)}</div>
                      </div>

                      {/* Pan */}
                      <div className="mb-2">
                        <Slider
                          value={[track.pan + 50]}
                          onValueChange={(v) => updateTrackPan(track.id, v[0] - 50)}
                          min={0}
                          max={100}
                          className="w-full"
                        />
                        <div className="text-center text-xs mt-1">
                          {track.pan === 0 ? 'C' : track.pan > 0 ? `R${track.pan}` : `L${Math.abs(track.pan)}`}
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="flex justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-6 w-6 p-0 text-xs ${track.muted ? 'bg-red-500 text-white' : ''}`}
                          onClick={() => toggleTrackMute(track.id)}
                        >
                          M
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-6 w-6 p-0 text-xs ${track.solo ? 'bg-yellow-500 text-white' : ''}`}
                          onClick={() => toggleTrackSolo(track.id)}
                        >
                          S
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Effects Tab */}
          <TabsContent value="effects" className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search effects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Cpu className="w-4 h-4" />
                CPU: {totalCpuUsage.toFixed(1)}%
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredEffects.map(effect => (
                <Card key={effect.id} className={`transition-all ${effect.active ? 'ring-2 ring-indigo-500' : 'opacity-60'}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{effect.name}</CardTitle>
                      <Badge className={getEffectCategoryColor(effect.category)}>{effect.category}</Badge>
                    </div>
                    <CardDescription className="text-xs">{effect.brand}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{effect.description}</p>
                    <div className="space-y-2 mb-3">
                      {effect.parameters.slice(0, 3).map(param => (
                        <div key={param.name} className="flex items-center gap-2">
                          <span className="text-xs w-20 truncate">{param.name}</span>
                          <Slider
                            value={[((param.value - param.min) / (param.max - param.min)) * 100]}
                            className="flex-1"
                          />
                          <span className="text-xs w-12 text-right">{param.value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">CPU: {effect.cpuUsage}%</span>
                      <Button variant="outline" size="sm" onClick={() => handleApplyEffect(effect.name)}>Add to Track</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Instruments Tab */}
          <TabsContent value="instruments" className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search instruments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredInstruments.map(instrument => (
                <Card key={instrument.id} className="hover:shadow-md transition-all cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        {instrument.category === 'keys' && <Piano className="w-6 h-6 text-white" />}
                        {instrument.category === 'synth' && <Radio className="w-6 h-6 text-white" />}
                        {instrument.category === 'drums' && <Disc className="w-6 h-6 text-white" />}
                        {instrument.category === 'strings' && <Guitar className="w-6 h-6 text-white" />}
                        {instrument.category === 'sampler' && <Layers className="w-6 h-6 text-white" />}
                      </div>
                      <div>
                        <CardTitle className="text-base">{instrument.name}</CardTitle>
                        <CardDescription className="text-xs">{instrument.brand}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{instrument.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <span>Polyphony: {instrument.polyphony}</span>
                      <span>CPU: {instrument.cpuUsage}%</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {instrument.presets.slice(0, 4).map(preset => (
                        <Badge key={preset} variant="outline" className="text-xs">{preset}</Badge>
                      ))}
                    </div>
                    <Button className="w-full" size="sm" onClick={() => toast.promise(new Promise(r => setTimeout(r, 1800)), { loading: `Loading ${instrument.name}...`, success: `${instrument.name} loaded and ready to play`, error: 'Failed to load instrument' })}>Load Instrument</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Automation Lanes</CardTitle>
                <CardDescription>Draw and edit automation curves for track parameters</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tracks.filter(t => t.automationEnabled).map(track => (
                    <div key={track.id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-3 h-3 rounded ${getTrackTypeColor(track.type)}`} />
                        <span className="font-medium">{track.name}</span>
                        <Badge variant="outline">Volume</Badge>
                        <Badge variant="outline">Pan</Badge>
                        <Button variant="ghost" size="sm" className="ml-auto gap-1" onClick={() => toast.promise(new Promise(r => setTimeout(r, 600)), { loading: 'Adding automation lane...', success: `New automation lane added to "${track.name}"`, error: 'Failed to add lane' })}>
                          <Plus className="w-3 h-3" /> Add Lane
                        </Button>
                      </div>
                      <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded relative">
                        {/* Automation curve visualization */}
                        <svg className="w-full h-full">
                          <path
                            d={`M 0 60 Q 25 20 50 50 T 100 30 T 150 60 T 200 40 T 250 50 T 300 30`}
                            fill="none"
                            stroke={track.color}
                            strokeWidth="2"
                          />
                          {/* Automation points */}
                          {[0, 50, 100, 150, 200, 250, 300].map((x, i) => (
                            <circle
                              key={i}
                              cx={x}
                              cy={[60, 50, 30, 60, 40, 50, 30][i]}
                              r="4"
                              fill={track.color}
                              className="cursor-pointer hover:r-6"
                            />
                          ))}
                        </svg>
                      </div>
                    </div>
                  ))}

                  {tracks.filter(t => t.automationEnabled).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No tracks have automation enabled</p>
                      <p className="text-sm">Enable automation on a track to edit curves here</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Export Settings</CardTitle>
                  <CardDescription>Configure your audio export options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Format</label>
                    <div className="flex gap-2">
                      {['WAV', 'MP3', 'FLAC', 'AIFF', 'OGG'].map(format => (
                        <Button key={format} variant="outline" size="sm" onClick={() => { setExportFormat(format); toast.promise(new Promise(r => setTimeout(r, 400)), { loading: 'Updating format...', success: `Export format set to ${format}`, error: 'Failed to update format' }) }}>{format}</Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Sample Rate</label>
                    <div className="flex gap-2">
                      {['44.1 kHz', '48 kHz', '96 kHz', '192 kHz'].map(rate => (
                        <Button key={rate} variant="outline" size="sm" onClick={() => { setSampleRateSetting(rate); toast.promise(new Promise(r => setTimeout(r, 400)), { loading: 'Updating sample rate...', success: `Sample rate set to ${rate}`, error: 'Failed to update sample rate' }) }}>{rate}</Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Bit Depth</label>
                    <div className="flex gap-2">
                      {['16-bit', '24-bit', '32-bit float'].map(depth => (
                        <Button key={depth} variant="outline" size="sm" onClick={() => { setBitDepthSetting(depth); toast.promise(new Promise(r => setTimeout(r, 400)), { loading: 'Updating bit depth...', success: `Bit depth set to ${depth}`, error: 'Failed to update bit depth' }) }}>{depth}</Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Range</label>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <span className="text-xs text-muted-foreground">Start</span>
                        <Input type="text" defaultValue="1.1.1" className="font-mono" />
                      </div>
                      <div className="flex-1">
                        <span className="text-xs text-muted-foreground">End</span>
                        <Input type="text" defaultValue="17.1.1" className="font-mono" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span className="text-sm">Normalize</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Dither</span>
                    </label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Export Preview</CardTitle>
                  <CardDescription>Review your export settings before rendering</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Output Format:</span>
                      <span className="font-medium">WAV (48kHz, 24-bit)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium">{formatTime(stats.projectLength)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Estimated Size:</span>
                      <span className="font-medium">~45 MB</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tracks Included:</span>
                      <span className="font-medium">{tracks.filter(t => !t.muted).length} / {tracks.length}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Export Progress</span>
                      <span>Ready</span>
                    </div>
                    <Progress value={0} />
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700" onClick={() => handleExportAudio('Project')}>
                      <Download className="w-4 h-4 mr-2" />
                      Export Audio
                    </Button>
                    <Button variant="outline" onClick={handleUploadAudio}>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload to Cloud
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3">
                <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-6">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings className="w-5 h-5 text-purple-500" />
                      Settings
                    </CardTitle>
                    <CardDescription>Configure audio studio</CardDescription>
                  </CardHeader>
                  <CardContent className="p-2">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', label: 'General', icon: Sliders },
                        { id: 'audio', label: 'Audio', icon: Volume2 },
                        { id: 'recording', label: 'Recording', icon: Mic },
                        { id: 'plugins', label: 'Plugins', icon: Wand2 },
                        { id: 'sync', label: 'Sync', icon: RefreshCw },
                        { id: 'advanced', label: 'Advanced', icon: Terminal },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                            settingsTab === item.id
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 font-medium'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                          {item.label}
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <>
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sliders className="w-5 h-5 text-purple-500" />
                          General Settings
                        </CardTitle>
                        <CardDescription>Basic project preferences</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="auto-save" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Auto-Save</span>
                            <span className="text-sm text-slate-500">Save project automatically</span>
                          </Label>
                          <Switch id="auto-save" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="undo-history" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Extended Undo</span>
                            <span className="text-sm text-slate-500">Keep 1000+ undo steps</span>
                          </Label>
                          <Switch id="undo-history" defaultChecked />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Auto-Save Interval (min)</Label>
                            <Input type="number" defaultValue="5" />
                          </div>
                          <div className="space-y-2">
                            <Label>Max Undo Levels</Label>
                            <Input type="number" defaultValue="1000" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>Display Settings</CardTitle>
                        <CardDescription>Visual preferences</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="show-grid" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Show Grid</span>
                            <span className="text-sm text-slate-500">Display timeline grid</span>
                          </Label>
                          <Switch id="show-grid" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="waveform-colors" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Colored Waveforms</span>
                            <span className="text-sm text-slate-500">Color-code by track type</span>
                          </Label>
                          <Switch id="waveform-colors" defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Audio Settings */}
                {settingsTab === 'audio' && (
                  <>
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Volume2 className="w-5 h-5 text-purple-500" />
                          Audio Interface
                        </CardTitle>
                        <CardDescription>Configure audio I/O settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Sample Rate</Label>
                            <Input defaultValue="48000 Hz" />
                          </div>
                          <div className="space-y-2">
                            <Label>Buffer Size</Label>
                            <Input defaultValue="256 samples" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Bit Depth</Label>
                            <Input defaultValue="24-bit" />
                          </div>
                          <div className="space-y-2">
                            <Label>Latency</Label>
                            <Input defaultValue="5.3 ms" disabled />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>Processing</CardTitle>
                        <CardDescription>Audio processing options</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="hi-quality" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">High-Quality Mode</span>
                            <span className="text-sm text-slate-500">64-bit processing</span>
                          </Label>
                          <Switch id="hi-quality" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="dither" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Auto Dither</span>
                            <span className="text-sm text-slate-500">Apply dithering on export</span>
                          </Label>
                          <Switch id="dither" />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Recording Settings */}
                {settingsTab === 'recording' && (
                  <>
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Mic className="w-5 h-5 text-purple-500" />
                          Recording Settings
                        </CardTitle>
                        <CardDescription>Configure recording behavior</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="count-in" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Count-In</span>
                            <span className="text-sm text-slate-500">1 bar count-in before recording</span>
                          </Label>
                          <Switch id="count-in" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="punch-in" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Auto Punch Mode</span>
                            <span className="text-sm text-slate-500">Record within loop region</span>
                          </Label>
                          <Switch id="punch-in" />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="monitor" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Input Monitoring</span>
                            <span className="text-sm text-slate-500">Hear input while recording</span>
                          </Label>
                          <Switch id="monitor" defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>Metronome</CardTitle>
                        <CardDescription>Click track settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="metronome" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Enable Metronome</span>
                            <span className="text-sm text-slate-500">Play click during recording</span>
                          </Label>
                          <Switch id="metronome" defaultChecked />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Click Volume</Label>
                            <Input type="number" defaultValue="-6" />
                          </div>
                          <div className="space-y-2">
                            <Label>Accent First Beat</Label>
                            <Input defaultValue="Yes" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Plugins Settings */}
                {settingsTab === 'plugins' && (
                  <>
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Wand2 className="w-5 h-5 text-purple-500" />
                          Plugin Settings
                        </CardTitle>
                        <CardDescription>Manage audio plugins</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="vst3" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">VST3 Support</span>
                            <span className="text-sm text-slate-500">Enable VST3 plugins</span>
                          </Label>
                          <Switch id="vst3" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="au" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Audio Units</span>
                            <span className="text-sm text-slate-500">Enable AU plugins (macOS)</span>
                          </Label>
                          <Switch id="au" defaultChecked />
                        </div>
                        <Button variant="outline" className="w-full" onClick={() => toast.promise(new Promise(r => setTimeout(r, 3000)), { loading: 'Scanning plugin directories...', success: 'Plugin scan complete!', error: 'Scan failed' })}>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Rescan Plugins
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>Plugin Paths</CardTitle>
                        <CardDescription>Plugin search directories</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>VST3 Path</Label>
                          <Input defaultValue="/Library/Audio/Plug-Ins/VST3" />
                        </div>
                        <div className="space-y-2">
                          <Label>AU Path</Label>
                          <Input defaultValue="/Library/Audio/Plug-Ins/Components" />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Sync Settings */}
                {settingsTab === 'sync' && (
                  <>
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <RefreshCw className="w-5 h-5 text-purple-500" />
                          Sync Settings
                        </CardTitle>
                        <CardDescription>External sync and MIDI</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="ext-sync" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">External Sync</span>
                            <span className="text-sm text-slate-500">Sync to external clock</span>
                          </Label>
                          <Switch id="ext-sync" />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="mtc" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Send MTC</span>
                            <span className="text-sm text-slate-500">Transmit MIDI Time Code</span>
                          </Label>
                          <Switch id="mtc" />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="midi-clock" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Send MIDI Clock</span>
                            <span className="text-sm text-slate-500">Sync external devices</span>
                          </Label>
                          <Switch id="midi-clock" defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <>
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Terminal className="w-5 h-5 text-purple-500" />
                          Advanced Options
                        </CardTitle>
                        <CardDescription>Expert configuration</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="multi-thread" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Multi-Threading</span>
                            <span className="text-sm text-slate-500">Use all CPU cores</span>
                          </Label>
                          <Switch id="multi-thread" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="gpu-accel" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">GPU Acceleration</span>
                            <span className="text-sm text-slate-500">Use GPU for visuals</span>
                          </Label>
                          <Switch id="gpu-accel" defaultChecked />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Process Priority</Label>
                            <Input defaultValue="High" />
                          </div>
                          <div className="space-y-2">
                            <Label>Max Plugin Instances</Label>
                            <Input type="number" defaultValue="64" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                          <AlertCircle className="w-5 h-5" />
                          Danger Zone
                        </CardTitle>
                        <CardDescription>Irreversible actions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Clear Plugin Cache</p>
                            <p className="text-sm text-red-600 dark:text-red-400/80">Rescan all plugins</p>
                          </div>
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-100" onClick={() => toast.promise(new Promise(r => setTimeout(r, 2000)), { loading: 'Clearing plugin cache...', success: 'Cache cleared, rescanning...', error: 'Clear failed' })}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Clear
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Reset Preferences</p>
                            <p className="text-sm text-red-600 dark:text-red-400/80">Restore default settings</p>
                          </div>
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-100" onClick={() => toast.promise(new Promise(r => setTimeout(r, 1000)), { loading: 'Resetting preferences...', success: 'All settings restored to defaults', error: 'Reset failed' })}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Reset
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockAudioAIInsights}
              title="Audio Intelligence"
              onInsightAction={(insight) => toast.promise(new Promise(r => setTimeout(r, 1000)), { loading: `Processing ${insight.title}...`, success: `AI insight "${insight.title}" applied successfully`, error: 'Failed to apply insight' })}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockAudioCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockAudioPredictions}
              title="Mix Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockAudioActivities}
            title="Studio Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mockAudioQuickActions}
            variant="grid"
          />
        </div>

        {/* Track Detail Dialog */}
        <Dialog open={showTrackDialog} onOpenChange={setShowTrackDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded ${getTrackTypeColor(selectedTrack?.type || 'audio')}`} />
                <DialogTitle>{selectedTrack?.name}</DialogTitle>
                <Badge variant="outline">{selectedTrack?.type}</Badge>
              </div>
            </DialogHeader>

            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-6">
                {/* Track Settings */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Volume</label>
                    <div className="flex items-center gap-2">
                      <Slider
                        value={[(selectedTrack?.volume || 0) + 60]}
                        onValueChange={(v) => selectedTrack && updateTrackVolume(selectedTrack.id, v[0] - 60)}
                        min={0}
                        max={66}
                        className="flex-1"
                      />
                      <span className="text-sm w-16 text-right">{selectedTrack?.volume}dB</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Pan</label>
                    <div className="flex items-center gap-2">
                      <Slider
                        value={[(selectedTrack?.pan || 0) + 50]}
                        onValueChange={(v) => selectedTrack && updateTrackPan(selectedTrack.id, v[0] - 50)}
                        min={0}
                        max={100}
                        className="flex-1"
                      />
                      <span className="text-sm w-16 text-right">
                        {selectedTrack?.pan === 0 ? 'C' : (selectedTrack?.pan || 0) > 0 ? `R${selectedTrack?.pan}` : `L${Math.abs(selectedTrack?.pan || 0)}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Effects Chain */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Effects Chain</h4>
                  <div className="space-y-2">
                    {selectedTrack?.effects.map((effect, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <span className="w-6 h-6 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900 rounded text-xs">{i + 1}</span>
                        <span className="flex-1">{effect}</span>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => toast.promise(new Promise(r => setTimeout(r, 500)), { loading: 'Loading effect options...', success: `${effect} settings panel opened`, error: 'Failed to load effect settings' })}>
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="w-full gap-1" onClick={() => handleApplyEffect('New Effect')}>
                      <Plus className="w-4 h-4" /> Add Effect
                    </Button>
                  </div>
                </div>

                {/* Regions */}
                {selectedTrack && selectedTrack.regions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Regions</h4>
                    <div className="space-y-2">
                      {selectedTrack.regions.map(region => (
                        <div key={region.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <div className="w-3 h-3 rounded" style={{ backgroundColor: region.color }} />
                          <span className="flex-1">{region.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(region.startTime)} - {formatTime(region.endTime)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className={selectedTrack?.muted ? 'bg-red-100 text-red-600' : ''}
                  onClick={() => selectedTrack && toggleTrackMute(selectedTrack.id)}
                >
                  {selectedTrack?.muted ? <VolumeX className="w-4 h-4 mr-1" /> : <Volume2 className="w-4 h-4 mr-1" />}
                  {selectedTrack?.muted ? 'Unmute' : 'Mute'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={selectedTrack?.solo ? 'bg-yellow-100 text-yellow-600' : ''}
                  onClick={() => selectedTrack && toggleTrackSolo(selectedTrack.id)}
                >
                  <Headphones className="w-4 h-4 mr-1" />
                  {selectedTrack?.solo ? 'Unsolo' : 'Solo'}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1" onClick={() => toast.promise(new Promise(r => setTimeout(r, 800)), { loading: 'Duplicating track...', success: `"${selectedTrack?.name}" duplicated successfully`, error: 'Failed to duplicate track' })}>
                  <Copy className="w-4 h-4" /> Duplicate
                </Button>
                <Button variant="outline" size="sm" className="gap-1 text-red-500" onClick={() => toast.promise(new Promise(r => setTimeout(r, 600)), { loading: 'Removing track...', success: `"${selectedTrack?.name}" has been deleted`, error: 'Failed to delete track' })}>
                  <Trash2 className="w-4 h-4" /> Delete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
