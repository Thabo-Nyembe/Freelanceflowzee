'use client'

import Link from 'next/link'
import { useState, useMemo, useRef } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Mic,
  MicOff,
  Play,
  Pause,
  Plus,
  Upload,
  Brain,
  Eye,
  Share2,
  Settings,
  Wand2,
  Target,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  RefreshCw,
  Music,
  Volume2,
  VolumeX,
  Download,
  Sparkles,
  TrendingUp,
  Heart,
  Crown,
  History,
  Radio,
  AudioLines,
  Headphones,
  Speaker,
  Video,
  FileText,
  Zap
} from 'lucide-react'

// Types
type VoiceStatus = 'draft' | 'generating' | 'ready' | 'failed'
type VoiceType = 'text-to-speech' | 'voice-clone' | 'music' | 'sound-effect'
type VoiceStyle = 'natural' | 'professional' | 'casual' | 'dramatic' | 'cheerful' | 'calm'

interface GeneratedAudio {
  id: string
  title: string
  text: string
  type: VoiceType
  status: VoiceStatus
  style: VoiceStyle
  duration: number
  audioUrl?: string
  createdAt: string
  plays: number
  likes: number
}

interface VoiceStats {
  totalAudios: number
  totalPlays: number
  totalLikes: number
  creditsUsed: number
  creditsRemaining: number
  avgGenerationTime: number
}

// Helper functions
const getStatusColor = (status: VoiceStatus) => {
  const colors = {
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    generating: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    ready: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  }
  return colors[status]
}

const getTypeIcon = (type: VoiceType) => {
  const icons = {
    'text-to-speech': Mic,
    'voice-clone': Radio,
    'music': Music,
    'sound-effect': AudioLines
  }
  return icons[type]
}

export default function AIVoiceClient() {
  const [activeTab, setActiveTab] = useState('generate')
  const [searchQuery, setSearchQuery] = useState('')
  const [text, setText] = useState('')
  const [selectedType, setSelectedType] = useState<VoiceType>('text-to-speech')
  const [selectedStyle, setSelectedStyle] = useState<VoiceStyle>('natural')
  const [speed, setSpeed] = useState([1.0])
  const [pitch, setPitch] = useState([1.0])
  const [isGenerating, setIsGenerating] = useState(false)
  const [audios, setAudios] = useState<GeneratedAudio[]>([])
  const [isPlaying, setIsPlaying] = useState<string | null>(null)

  // Stats
  const stats: VoiceStats = useMemo(() => ({
    totalAudios: audios.length,
    totalPlays: audios.reduce((sum, a) => sum + a.plays, 0),
    totalLikes: audios.reduce((sum, a) => sum + a.likes, 0),
    creditsUsed: audios.length * 5,
    creditsRemaining: 500 - audios.length * 5,
    avgGenerationTime: 12
  }), [audios])

  // Generate audio
  const handleGenerate = async () => {
    if (!text.trim()) {
      toast.error('Please enter text to convert')
      return
    }

    setIsGenerating(true)
    toast.info('Generating audio...')

    // Simulate generation
    setTimeout(() => {
      const newAudio: GeneratedAudio = {
        id: Date.now().toString(),
        title: text.slice(0, 50),
        text,
        type: selectedType,
        status: 'ready',
        style: selectedStyle,
        duration: Math.ceil(text.length / 15), // Rough estimate
        createdAt: new Date().toISOString(),
        plays: 0,
        likes: 0
      }
      setAudios(prev => [newAudio, ...prev])
      setIsGenerating(false)
      setText('')
      toast.success('Audio generated successfully!')
    }, 2000)
  }

  // Filtered audios
  const filteredAudios = useMemo(() => {
    return audios.filter(a =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.text.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [audios, searchQuery])

  // Toggle play
  const togglePlay = (id: string) => {
    setIsPlaying(prev => prev === id ? null : id)
    toast.info(isPlaying === id ? 'Paused' : 'Playing...')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50/30 to-rose-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-full mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Voice Studio</h1>
              <p className="text-gray-600 dark:text-gray-400">Generate voices, music, and sound effects</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* AI Tools Navigation */}
            <div className="flex items-center gap-2">
              <Link href="/dashboard/ai-create-v2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden md:inline">Create Content</span>
                </Button>
              </Link>
              <Link href="/dashboard/ai-video-v2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Video className="w-4 h-4" />
                  <span className="hidden md:inline">Add to Video</span>
                </Button>
              </Link>
            </div>
            <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-500" />
                <span className="font-semibold text-gray-900 dark:text-white">{stats.creditsRemaining}</span>
                <span className="text-sm text-gray-500">credits</span>
              </div>
            </div>
            <Button variant="outline">
              <Crown className="w-4 h-4 mr-2" />
              Upgrade
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { label: 'Audios', value: stats.totalAudios, icon: Music, color: 'from-purple-500 to-pink-500' },
            { label: 'Total Plays', value: stats.totalPlays, icon: Headphones, color: 'from-blue-500 to-indigo-500' },
            { label: 'Total Likes', value: stats.totalLikes, icon: Heart, color: 'from-red-500 to-pink-500' },
            { label: 'Credits Used', value: stats.creditsUsed, icon: Zap, color: 'from-amber-500 to-orange-500' },
            { label: 'Avg Time', value: `${stats.avgGenerationTime}s`, icon: Clock, color: 'from-green-500 to-emerald-500' },
            { label: 'Success Rate', value: '99%', icon: Target, color: 'from-teal-500 to-cyan-500' }
          ].map((stat, idx) => (
            <Card key={idx} className="relative overflow-hidden border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm">
            <TabsTrigger value="generate" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-lg">
              <Wand2 className="w-4 h-4" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="library" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-lg">
              <Music className="w-4 h-4" />
              Library
            </TabsTrigger>
            <TabsTrigger value="voices" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-lg">
              <Radio className="w-4 h-4" />
              Voices
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-lg">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Generate Tab */}
          <TabsContent value="generate" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Text Input */}
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-purple-500" />
                      Text to Speech
                    </CardTitle>
                    <CardDescription>Enter text to convert to natural speech</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Enter the text you want to convert to speech..."
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="min-h-[200px] resize-none"
                    />

                    {/* Type Selection */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Audio Type</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {([
                          { type: 'text-to-speech', label: 'Text to Speech' },
                          { type: 'voice-clone', label: 'Voice Clone' },
                          { type: 'music', label: 'Music' },
                          { type: 'sound-effect', label: 'Sound Effect' }
                        ] as { type: VoiceType; label: string }[]).map(({ type, label }) => {
                          const Icon = getTypeIcon(type)
                          return (
                            <Button
                              key={type}
                              variant={selectedType === type ? 'default' : 'outline'}
                              className={`${selectedType === type ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : ''}`}
                              onClick={() => setSelectedType(type)}
                            >
                              <Icon className="w-4 h-4 mr-2" />
                              {label}
                            </Button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Style Selection */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Voice Style</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {(['natural', 'professional', 'casual', 'dramatic', 'cheerful', 'calm'] as VoiceStyle[]).map((style) => (
                          <Button
                            key={style}
                            variant={selectedStyle === style ? 'default' : 'outline'}
                            className={`capitalize ${selectedStyle === style ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : ''}`}
                            onClick={() => setSelectedStyle(style)}
                          >
                            {style}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Generate Button */}
                    <Button
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white"
                      size="lg"
                      onClick={handleGenerate}
                      disabled={isGenerating || !text.trim()}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Generate Audio
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Panel */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Volume2 className="w-5 h-5 text-purple-500" />
                      Voice Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label className="text-sm mb-2 block">Speed: {speed[0].toFixed(1)}x</Label>
                      <Slider
                        value={speed}
                        onValueChange={setSpeed}
                        min={0.5}
                        max={2.0}
                        step={0.1}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label className="text-sm mb-2 block">Pitch: {pitch[0].toFixed(1)}x</Label>
                      <Slider
                        value={pitch}
                        onValueChange={setPitch}
                        min={0.5}
                        max={2.0}
                        step={0.1}
                        className="w-full"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Enhance Audio</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Noise Reduction</Label>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Tips */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Quick Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                    <p>- Use punctuation for natural pauses</p>
                    <p>- CAPS can add emphasis</p>
                    <p>- Use [pause] for longer breaks</p>
                    <p>- Numbers are read naturally</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Library Tab */}
          <TabsContent value="library" className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search audio files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>

            {filteredAudios.length === 0 ? (
              <Card className="p-12 text-center">
                <Music className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">No audio files yet</h3>
                <p className="text-gray-500 mb-4">Generate your first audio to get started</p>
                <Button onClick={() => setActiveTab('generate')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Audio
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredAudios.map((audio) => {
                  const TypeIcon = getTypeIcon(audio.type)
                  return (
                    <Card key={audio.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardContent className="p-4 flex items-center gap-4">
                        <Button
                          variant="outline"
                          size="icon"
                          className="shrink-0"
                          onClick={() => togglePlay(audio.id)}
                        >
                          {isPlaying === audio.id ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-sm truncate">{audio.title}</h3>
                            <Badge className={getStatusColor(audio.status)}>{audio.status}</Badge>
                          </div>
                          <p className="text-xs text-gray-500 truncate">{audio.text}</p>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-500 shrink-0">
                          <span className="flex items-center gap-1">
                            <TypeIcon className="w-3 h-3" />
                            {audio.type}
                          </span>
                          <span className="flex items-center gap-1">
                            <Headphones className="w-3 h-3" />
                            {audio.plays}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {audio.duration}s
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Button variant="ghost" size="icon">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Share2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          {/* Voices Tab */}
          <TabsContent value="voices" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'Alloy', gender: 'Neutral', style: 'Professional', accent: 'American' },
                { name: 'Echo', gender: 'Male', style: 'Deep', accent: 'British' },
                { name: 'Fable', gender: 'Female', style: 'Warm', accent: 'American' },
                { name: 'Onyx', gender: 'Male', style: 'Authoritative', accent: 'British' },
                { name: 'Nova', gender: 'Female', style: 'Friendly', accent: 'American' },
                { name: 'Shimmer', gender: 'Female', style: 'Gentle', accent: 'Australian' }
              ].map((voice, idx) => (
                <Card key={idx} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        <Speaker className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{voice.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{voice.gender}</Badge>
                          <Badge variant="outline" className="text-xs">{voice.accent}</Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{voice.style}</p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Audio Generation Settings</CardTitle>
                <CardDescription>Configure your default audio generation preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label>Default Voice</Label>
                    <select className="w-full mt-2 p-2 border rounded-lg dark:bg-gray-800">
                      <option>Alloy (Neutral)</option>
                      <option>Echo (Male)</option>
                      <option>Fable (Female)</option>
                      <option>Nova (Female)</option>
                    </select>
                  </div>
                  <div>
                    <Label>Output Format</Label>
                    <select className="w-full mt-2 p-2 border rounded-lg dark:bg-gray-800">
                      <option>MP3 (High Quality)</option>
                      <option>WAV (Lossless)</option>
                      <option>OGG (Compressed)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div>
                    <Label>Auto-enhance audio</Label>
                    <p className="text-xs text-gray-500">Automatically improve audio quality</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div>
                    <Label>Email notifications</Label>
                    <p className="text-xs text-gray-500">Get notified when audio is ready</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
