'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Music, Play, Pause, Download, RefreshCw, Sparkles, Mic, FileText, Zap, Settings2, Volume2, SkipBack, SkipForward, Loader2,
  Trash2, Heart, Share2, Sliders, ListMusic, Layers, ChevronDown, Plus, Crown,
  Music2, Radio, Repeat, Shuffle, Waves, BookmarkPlus, User, Copy, Check
} from 'lucide-react'
import { useSunoMusic, type SunoModel, promptTemplates } from '@/lib/hooks/use-suno-music'
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

const sunoModels: { value: SunoModel; label: string; badge?: string; description: string; quality: string }[] = [
  { value: 'V5', label: 'Suno V5', badge: 'Latest', description: 'Best quality, studio sound', quality: 'Ultra' },
  { value: 'V4_5PLUS', label: 'V4.5 Plus', badge: 'Premium', description: 'Enhanced vocal clarity', quality: 'High' },
  { value: 'V4_5', label: 'V4.5', badge: 'Pro', description: 'Professional quality', quality: 'High' },
  { value: 'V4', label: 'V4', badge: 'Fast', description: 'Quick & reliable', quality: 'Good' },
  { value: 'V3_5', label: 'V3.5', badge: '', description: 'Classic sound', quality: 'Standard' }
]

const genres = [
  { value: 'pop', label: 'Pop', emoji: '🎤', color: 'from-pink-500 to-rose-500' },
  { value: 'electronic', label: 'Electronic', emoji: '🎧', color: 'from-cyan-500 to-blue-500' },
  { value: 'hip-hop', label: 'Hip-Hop', emoji: '🎤', color: 'from-amber-500 to-orange-500' },
  { value: 'rock', label: 'Rock', emoji: '🎸', color: 'from-red-500 to-rose-600' },
  { value: 'jazz', label: 'Jazz', emoji: '🎷', color: 'from-indigo-500 to-purple-500' },
  { value: 'classical', label: 'Classical', emoji: '🎻', color: 'from-yellow-500 to-amber-500' },
  { value: 'lo-fi', label: 'Lo-Fi', emoji: '☕', color: 'from-violet-500 to-purple-600' },
  { value: 'cinematic', label: 'Cinematic', emoji: '🎬', color: 'from-slate-600 to-gray-700' },
  { value: 'ambient', label: 'Ambient', emoji: '🌌', color: 'from-teal-500 to-cyan-600' },
  { value: 'r&b', label: 'R&B', emoji: '💫', color: 'from-fuchsia-500 to-pink-600' },
  { value: 'country', label: 'Country', emoji: '🤠', color: 'from-orange-500 to-amber-600' },
  { value: 'reggae', label: 'Reggae', emoji: '🏝️', color: 'from-green-500 to-emerald-600' }
]

const moods = [
  { value: 'happy', label: 'Happy', emoji: '😊', description: 'Upbeat & joyful' },
  { value: 'sad', label: 'Sad', emoji: '😢', description: 'Melancholic' },
  { value: 'energetic', label: 'Energetic', emoji: '⚡', description: 'High energy' },
  { value: 'calm', label: 'Calm', emoji: '🧘', description: 'Peaceful' },
  { value: 'epic', label: 'Epic', emoji: '🏔️', description: 'Grand & dramatic' },
  { value: 'romantic', label: 'Romantic', emoji: '💕', description: 'Love & passion' },
  { value: 'dark', label: 'Dark', emoji: '🌙', description: 'Mysterious' },
  { value: 'uplifting', label: 'Uplifting', emoji: '🌟', description: 'Inspiring' }
]

const durationOptions = [
  { value: 30, label: '30s', description: 'Short clip' },
  { value: 60, label: '1 min', description: 'Standard' },
  { value: 120, label: '2 min', description: 'Full song' },
  { value: 240, label: '4 min', description: 'Extended' },
  { value: 480, label: '8 min', description: 'Maximum', premium: true }
]

const exportFormats = [
  { value: 'mp3', label: 'MP3', description: 'Universal, smaller' },
  { value: 'wav', label: 'WAV', description: 'Lossless, studio', premium: true },
  { value: 'stems', label: 'Stems', description: '12 separate tracks', premium: true },
  { value: 'midi', label: 'MIDI', description: 'For DAW editing', premium: true }
]

interface Persona {
  id: string
  name: string
  genre: string
  mood: string
  style: string
  description: string
}

export default function AIMusicStudio() {
  const [prompt, setPrompt] = useState('')
  const [title, setTitle] = useState('')
  const [selectedModel, setSelectedModel] = useState<SunoModel>('V5')
  const [selectedGenre, setSelectedGenre] = useState('')
  const [selectedMood, setSelectedMood] = useState('')
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [isInstrumental, setIsInstrumental] = useState(false)
  const [customMode, setCustomMode] = useState(false)
  const [customLyrics, setCustomLyrics] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showPersonas, setShowPersonas] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [weirdness, setWeirdness] = useState(50)
  const [targetDuration, setTargetDuration] = useState(120)
  const [exportFormat, setExportFormat] = useState('mp3')
  const [personas, setPersonas] = useState<Persona[]>([])
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null)
  const [uploadedAudio, setUploadedAudio] = useState<string | null>(null)
  const [showWaveform, setShowWaveform] = useState(true)
  const [repeat, setRepeat] = useState(false)
  const [shuffle, setShuffle] = useState(false)
  const [activeTab, setActiveTab] = useState<'create' | 'extend' | 'remix' | 'vocals'>('create')
  const [showLibraryDialog, setShowLibraryDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [savedTracks, setSavedTracks] = useState<string[]>([])
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [linkCopied, setLinkCopied] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationRef = useRef<number | null>(null)

  const {
    isGenerating,
    status,
    currentTrack,
    tracks,
    error,
    lyrics,
    generateMusic,
    generateLyrics,
    extendMusic,
    separateVocals,
    reset,
    clearTracks
  } = useSunoMusic()

  // Audio visualizer
  useEffect(() => {
    const audio = audioRef.current
    const canvas = canvasRef.current
    if (!audio || !canvas || !showWaveform) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      analyserRef.current = audioContextRef.current.createAnalyser()
      const source = audioContextRef.current.createMediaElementSource(audio)
      source.connect(analyserRef.current)
      analyserRef.current.connect(audioContextRef.current.destination)
      analyserRef.current.fftSize = 256
    }

    const analyser = analyserRef.current!
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw)
      analyser.getByteFrequencyData(dataArray)

      ctx.fillStyle = 'rgba(17, 24, 39, 0.2)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const barWidth = (canvas.width / bufferLength) * 2.5
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.8

        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height)
        gradient.addColorStop(0, '#ec4899')
        gradient.addColorStop(1, '#8b5cf6')
        ctx.fillStyle = gradient

        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)
        x += barWidth + 1
      }
    }

    if (isPlaying) draw()
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [isPlaying, showWaveform])

  // Audio player controls
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => {
      setIsPlaying(false)
      if (repeat) {
        audio.currentTime = 0
        audio.play()
        setIsPlaying(true)
      }
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [currentTrack, repeat])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = Number(e.target.value)
    setCurrentTime(Number(e.target.value))
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    const newVolume = Number(e.target.value)
    setVolume(newVolume)
    if (audio) audio.volume = newVolume
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => {
      if (prev.includes(genre)) return prev.filter(g => g !== genre)
      if (prev.length >= 3) return prev
      return [...prev, genre]
    })
  }

  const handleGenerate = async () => {
    if (!prompt.trim() && !customLyrics.trim()) return

    let finalPrompt = prompt
    const genreStr = selectedGenres.length > 0 ? selectedGenres.join(' ') : selectedGenre
    if (genreStr && selectedMood) {
      finalPrompt = `${selectedMood} ${genreStr} song: ${prompt}`
    } else if (genreStr) {
      finalPrompt = `${genreStr} song: ${prompt}`
    } else if (selectedMood) {
      finalPrompt = `${selectedMood} song: ${prompt}`
    }

    // Add weirdness modifier
    if (weirdness > 70) {
      finalPrompt += ', experimental, unique, unconventional'
    } else if (weirdness < 30) {
      finalPrompt += ', traditional, familiar, classic structure'
    }

    await generateMusic({
      prompt: finalPrompt,
      model: selectedModel,
      customMode,
      style: genreStr ? `${selectedMood} ${genreStr}`.trim() : undefined,
      title: title || undefined,
      instrumental: isInstrumental,
      lyrics: customMode ? customLyrics : undefined
    })
  }

  const handleGenerateLyrics = async () => {
    const lyricsPrompt = prompt || `Write lyrics for a ${selectedMood} ${selectedGenres.join(' ')} song`
    const result = await generateLyrics({ prompt: lyricsPrompt })
    if (result) {
      setCustomLyrics(result.text)
      setCustomMode(true)
    }
  }

  const handleDownload = async (url: string, filename: string) => {
    const response = await fetch(url)
    const blob = await response.blob()
    const downloadUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = `${filename}.${exportFormat}`
    a.click()
    URL.revokeObjectURL(downloadUrl)
  }

  const savePersona = () => {
    if (!currentTrack) return
    const newPersona: Persona = {
      id: Date.now().toString(),
      name: title || `Persona ${personas.length + 1}`,
      genre: selectedGenres.join(', ') || selectedGenre,
      mood: selectedMood,
      style: currentTrack.style || '',
      description: prompt.slice(0, 100)
    }
    setPersonas(prev => [...prev, newPersona])
  }

  const applyPersona = (persona: Persona) => {
    setSelectedPersona(persona)
    if (persona.genre) {
      const genreList = persona.genre.split(', ')
      setSelectedGenres(genreList)
    }
    setSelectedMood(persona.mood)
    setPrompt(persona.description)
  }

  const handleSkipBack = () => {
    if (tracks.length === 0) {
      toast.info('No tracks in playlist')
      return
    }
    const newIndex = currentTrackIndex > 0 ? currentTrackIndex - 1 : tracks.length - 1
    setCurrentTrackIndex(newIndex)
    const track = tracks[newIndex]
    if (audioRef.current && track) {
      audioRef.current.src = track.audioUrl
      audioRef.current.play()
      setIsPlaying(true)
      toast.success(`Playing: ${track.title}`)
    }
  }

  const handleSkipForward = () => {
    if (tracks.length === 0) {
      toast.info('No tracks in playlist')
      return
    }
    const newIndex = currentTrackIndex < tracks.length - 1 ? currentTrackIndex + 1 : 0
    setCurrentTrackIndex(newIndex)
    const track = tracks[newIndex]
    if (audioRef.current && track) {
      audioRef.current.src = track.audioUrl
      audioRef.current.play()
      setIsPlaying(true)
      toast.success(`Playing: ${track.title}`)
    }
  }

  const handleSaveTrack = () => {
    if (!currentTrack) {
      toast.error('No track to save')
      return
    }
    if (savedTracks.includes(currentTrack.id)) {
      setSavedTracks(prev => prev.filter(id => id !== currentTrack.id))
      toast.success('Track removed from favorites')
    } else {
      setSavedTracks(prev => [...prev, currentTrack.id])
      toast.success('Track saved to favorites!')
    }
  }

  const handleShareTrack = () => {
    if (!currentTrack) {
      toast.error('No track to share')
      return
    }
    setShowShareDialog(true)
  }

  const handleCopyShareLink = () => {
    if (!currentTrack) return
    const shareUrl = `${window.location.origin}/shared/music/${currentTrack.id}`
    navigator.clipboard.writeText(shareUrl)
    setLinkCopied(true)
    toast.success('Link copied to clipboard!')
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const handleSocialShare = (platform: string) => {
    if (!currentTrack) return
    const shareUrl = `${window.location.origin}/shared/music/${currentTrack.id}`
    const text = `Check out this AI-generated track: ${currentTrack.title}`

    let url = ''
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`
        break
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
        break
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
        break
    }

    if (url) {
      window.open(url, '_blank', 'width=600,height=400')
      toast.success(`Sharing to ${platform}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 dark:bg-none dark:bg-gray-900">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 text-white">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Music className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  AI Music Studio
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium">Pro</span>
                </h1>
                <p className="text-white/80 mt-1">Powered by Suno V5 - Create studio-quality music with AI</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPersonas(!showPersonas)}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
              >
                <User className="w-5 h-5" />
                Personas ({personas.length})
              </button>
              <button
                onClick={() => setShowLibraryDialog(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
              >
                <ListMusic className="w-5 h-5" />
                Library ({tracks.length})
              </button>
            </div>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-2 mt-6">
            {[
              { icon: Waves, label: 'Studio 44.1kHz Audio' },
              { icon: Layers, label: '12-Stem Export' },
              { icon: Music2, label: 'MIDI Export' },
              { icon: Radio, label: '1200+ Genres' },
              { icon: User, label: 'Personas' },
              { icon: Sliders, label: 'Weirdness Control' }
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full text-sm">
                <feature.icon className="w-4 h-4" />
                {feature.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6">
          {[
            { id: 'create', label: 'Create', icon: Sparkles },
            { id: 'extend', label: 'Extend', icon: Plus },
            { id: 'remix', label: 'Remix', icon: RefreshCw },
            { id: 'vocals', label: 'Vocal Separation', icon: Mic }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/25'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Model Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-rose-500" />
                AI Model
              </h3>
              <div className="flex gap-2 flex-wrap">
                {sunoModels.map((model) => (
                  <button
                    key={model.value}
                    onClick={() => setSelectedModel(model.value)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
                      selectedModel === model.value
                        ? 'bg-rose-600 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <span className="font-medium">{model.label}</span>
                    {model.badge && (
                      <span className={`px-1.5 py-0.5 text-xs rounded ${
                        model.badge === 'Latest' ? 'bg-amber-400 text-amber-900' :
                        model.badge === 'Premium' ? 'bg-violet-400 text-violet-900' :
                        'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
                      }`}>
                        {model.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Genre Selection - Multi-select with Mashup */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Music2 className="w-4 h-4 text-rose-500" />
                  Genre
                  {selectedGenres.length > 1 && (
                    <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-xs rounded-full">
                      Mashup Mode
                    </span>
                  )}
                </h3>
                <span className="text-xs text-gray-400">Select up to 3 for mashup</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {genres.map((genre) => (
                  <button
                    key={genre.value}
                    onClick={() => toggleGenre(genre.value)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                      selectedGenres.includes(genre.value)
                        ? `bg-gradient-to-br ${genre.color} text-white shadow-lg scale-105`
                        : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    <span className="text-xl">{genre.emoji}</span>
                    <span className="text-xs font-medium">{genre.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mood Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500" />
                Mood
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {moods.map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() => setSelectedMood(selectedMood === mood.value ? '' : mood.value)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                      selectedMood === mood.value
                        ? 'bg-pink-600 text-white shadow-lg scale-105'
                        : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    <span className="text-xl">{mood.emoji}</span>
                    <span className="text-xs font-medium">{mood.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Input */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-rose-500" />
                  Describe Your Song
                </h3>
                <div className="flex gap-2">
                  {Object.keys(promptTemplates).slice(0, 3).map((key) => (
                    <button
                      key={key}
                      onClick={() => setPrompt(promptTemplates[key as keyof typeof promptTemplates].replace('{genre}', selectedGenres[0] || 'pop').replace('{mood}', selectedMood || 'upbeat'))}
                      className="text-xs px-2 py-1 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors capitalize"
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="An upbeat summer anthem with catchy hooks, perfect for driving with the windows down..."
                className="w-full h-24 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl resize-none focus:ring-2 focus:ring-rose-500 focus:border-transparent dark:text-white text-sm"
              />

              <div className="flex items-center gap-4 mt-4">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Song title (optional)"
                  className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl dark:text-white text-sm"
                />
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isInstrumental}
                    onChange={(e) => setIsInstrumental(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Instrumental</span>
                </label>
              </div>
            </div>

            {/* Weirdness Slider */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-rose-500" />
                  Weirdness
                </h3>
                <span className="text-sm font-medium text-rose-600">{weirdness}%</span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={weirdness}
                  onChange={(e) => setWeirdness(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-rose-500"
                />
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>Traditional</span>
                  <span>Balanced</span>
                  <span>Experimental</span>
                </div>
              </div>
            </div>

            {/* Custom Lyrics Mode */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
              <button
                onClick={() => setCustomMode(!customMode)}
                className="w-full px-6 py-4 flex items-center justify-between text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <span className="flex items-center gap-2 font-medium">
                  <Mic className="w-4 h-4 text-rose-500" />
                  Custom Lyrics Mode
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${customMode ? 'rotate-180' : ''}`} />
              </button>
              {customMode && (
                <div className="px-6 pb-6 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between mt-4 mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Write or generate lyrics</span>
                    <button
                      onClick={handleGenerateLyrics}
                      disabled={isGenerating}
                      className="flex items-center gap-1 text-sm text-rose-600 hover:text-rose-700 disabled:opacity-50"
                    >
                      <Sparkles className="w-4 h-4" />
                      AI Generate
                    </button>
                  </div>
                  <textarea
                    value={customLyrics}
                    onChange={(e) => setCustomLyrics(e.target.value)}
                    placeholder={`[Verse 1]\nWrite your lyrics here...\n\n[Chorus]\n...`}
                    className="w-full h-40 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl resize-none focus:ring-2 focus:ring-rose-500 focus:border-transparent dark:text-white font-mono text-sm"
                  />
                </div>
              )}
            </div>

            {/* Advanced Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full px-6 py-4 flex items-center justify-between text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <span className="flex items-center gap-2 font-medium">
                  <Settings2 className="w-4 h-4 text-rose-500" />
                  Advanced Settings
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
              </button>
              {showAdvanced && (
                <div className="px-6 pb-6 space-y-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="pt-4">
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Duration</label>
                    <div className="flex gap-2">
                      {durationOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setTargetDuration(opt.value)}
                          className={`flex-1 p-2 rounded-lg text-xs text-center transition-all relative ${
                            targetDuration === opt.value
                              ? 'bg-rose-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {opt.label}
                          {opt.premium && <Crown className="w-3 h-3 absolute top-1 right-1 text-amber-400" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Export Format</label>
                    <div className="flex gap-2">
                      {exportFormats.map((fmt) => (
                        <button
                          key={fmt.value}
                          onClick={() => setExportFormat(fmt.value)}
                          className={`flex-1 p-2 rounded-lg text-xs text-center transition-all relative ${
                            exportFormat === fmt.value
                              ? 'bg-rose-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {fmt.label}
                          {fmt.premium && <Crown className="w-3 h-3 absolute top-1 right-1 text-amber-400" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || (!prompt.trim() && !customLyrics.trim())}
              className="w-full py-4 bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 text-white font-semibold rounded-2xl shadow-lg shadow-rose-500/25 hover:shadow-xl hover:shadow-rose-500/30 transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  {status?.message || 'Generating...'}
                  {status?.progress && ` ${Math.round(status.progress)}%`}
                </>
              ) : (
                <>
                  <Music className="w-6 h-6" />
                  Generate Music
                </>
              )}
            </button>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
                {error.message}
              </div>
            )}
          </div>

          {/* Right Panel - Player & Tracks */}
          <div className="space-y-6">
            {/* Now Playing */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Now Playing</h3>
                {currentTrack && (
                  <button
                    onClick={savePersona}
                    className="text-xs px-2 py-1 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-md hover:bg-rose-100 transition-colors flex items-center gap-1"
                  >
                    <BookmarkPlus className="w-3 h-3" />
                    Save as Persona
                  </button>
                )}
              </div>

              {!currentTrack && !isGenerating && (
                <div className="h-48 flex flex-col items-center justify-center text-gray-400">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <Music className="w-8 h-8 opacity-40" />
                  </div>
                  <p className="text-sm">Your music will appear here</p>
                </div>
              )}

              {isGenerating && (
                <div className="h-48 flex flex-col items-center justify-center">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-2 bg-gradient-to-t from-rose-500 to-fuchsia-500 rounded-full animate-pulse"
                        style={{ height: `${20 + Math.random() * 30}px`, animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">Creating your track...</p>
                  {status?.progress && (
                    <div className="w-full mt-4 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-rose-600 to-fuchsia-600 h-2 rounded-full transition-all"
                        style={{ width: `${status.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              )}

              {currentTrack && (
                <div className="space-y-4">
                  {/* Album Art */}
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-500">
                    {currentTrack.imageUrl ? (
                      <img src={currentTrack.imageUrl} alt={currentTrack.title} className="w-full h-full object-cover" / loading="lazy">
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music className="w-20 h-20 text-white/50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h4 className="text-white font-bold text-xl truncate">{currentTrack.title}</h4>
                      <p className="text-white/70 text-sm">{currentTrack.style || selectedGenres.join(', ')}</p>
                    </div>
                  </div>

                  {/* Waveform */}
                  {showWaveform && (
                    <div className="h-16 bg-gray-900 rounded-lg overflow-hidden">
                      <canvas ref={canvasRef} className="w-full h-full" width={300} height={64} />
                    </div>
                  )}

                  {/* Audio element */}
                  <audio ref={audioRef} src={currentTrack.audioUrl} />

                  {/* Progress bar */}
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max={duration || 100}
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-rose-500"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => setShuffle(!shuffle)}
                      className={`p-2 rounded-lg transition-colors ${shuffle ? 'text-rose-500' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      <Shuffle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleSkipBack}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
                    >
                      <SkipBack className="w-5 h-5" />
                    </button>
                    <button
                      onClick={togglePlay}
                      className="p-4 bg-gradient-to-r from-rose-600 to-fuchsia-600 text-white rounded-full hover:shadow-lg hover:scale-105 transition-all"
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                    </button>
                    <button
                      onClick={handleSkipForward}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
                    >
                      <SkipForward className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setRepeat(!repeat)}
                      className={`p-2 rounded-lg transition-colors ${repeat ? 'text-rose-500' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      <Repeat className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Volume */}
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-gray-500" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-rose-500"
                    />
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => handleDownload(currentTrack.audioUrl, currentTrack.title)}
                      className="flex flex-col items-center gap-1 p-3 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Download</span>
                    </button>
                    <button
                      onClick={handleSaveTrack}
                      className="flex flex-col items-center gap-1 p-3 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Heart className={`w-5 h-5 ${currentTrack && savedTracks.includes(currentTrack.id) ? 'text-rose-500 fill-rose-500' : 'text-gray-600 dark:text-gray-400'}`} />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Save</span>
                    </button>
                    <button
                      onClick={handleShareTrack}
                      className="flex flex-col items-center gap-1 p-3 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Share2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Share</span>
                    </button>
                    <button
                      onClick={() => extendMusic({ audioId: currentTrack.id })}
                      className="flex flex-col items-center gap-1 p-3 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Plus className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Extend</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Personas */}
            {showPersonas && personas.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Your Personas</h3>
                <div className="space-y-2">
                  {personas.map((persona) => (
                    <button
                      key={persona.id}
                      onClick={() => applyPersona(persona)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                        selectedPersona?.id === persona.id
                          ? 'bg-rose-50 dark:bg-rose-900/30 border-2 border-rose-500'
                          : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-fuchsia-500 flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium dark:text-white">{persona.name}</p>
                        <p className="text-xs text-gray-500">{persona.genre} • {persona.mood}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Track Library */}
            {tracks.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Your Tracks</h3>
                  <button
                    onClick={clearTracks}
                    className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear
                  </button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {tracks.map((track) => (
                    <button
                      key={track.id}
                      onClick={() => {
                        if (audioRef.current) {
                          audioRef.current.src = track.audioUrl
                          audioRef.current.play()
                          setIsPlaying(true)
                        }
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                        currentTrack?.id === track.id
                          ? 'bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      {track.imageUrl ? (
                        <img src={track.imageUrl} alt={track.title} className="w-12 h-12 rounded-lg object-cover" / loading="lazy">
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-rose-500 to-fuchsia-500 flex items-center justify-center">
                          <Music className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div className="flex-1 text-left">
                        <p className="font-medium dark:text-white truncate">{track.title}</p>
                        <p className="text-xs text-gray-500">{track.style || track.model}</p>
                      </div>
                      <Play className="w-4 h-4 text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Library Dialog */}
      <Dialog open={showLibraryDialog} onOpenChange={setShowLibraryDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ListMusic className="w-5 h-5 text-rose-500" />
              Music Library
            </DialogTitle>
            <DialogDescription>
              Your generated tracks and favorites
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {tracks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Music className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>No tracks yet. Generate your first track!</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {tracks.map((track) => (
                  <div
                    key={track.id}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-colors cursor-pointer ${
                      currentTrack?.id === track.id
                        ? 'bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent'
                    }`}
                    onClick={() => {
                      if (audioRef.current) {
                        audioRef.current.src = track.audioUrl
                        audioRef.current.play()
                        setIsPlaying(true)
                      }
                      setShowLibraryDialog(false)
                    }}
                  >
                    {track.imageUrl ? (
                      <img src={track.imageUrl} alt={track.title} className="w-12 h-12 rounded-lg object-cover" / loading="lazy">
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-rose-500 to-fuchsia-500 flex items-center justify-center">
                        <Music className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium dark:text-white truncate">{track.title}</p>
                      <p className="text-xs text-gray-500">{track.style || track.model}</p>
                    </div>
                    {savedTracks.includes(track.id) && (
                      <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                    )}
                    <Play className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLibraryDialog(false)}>
              Close
            </Button>
            {tracks.length > 0 && (
              <Button
                variant="destructive"
                onClick={() => {
                  clearTracks()
                  setShowLibraryDialog(false)
                  toast.success('Library cleared')
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-rose-500" />
              Share Track
            </DialogTitle>
            <DialogDescription>
              Share "{currentTrack?.title}" with others
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Share Link</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={currentTrack ? `${typeof window !== 'undefined' ? window.location.origin : ''}/shared/music/${currentTrack.id}` : ''}
                  className="bg-gray-50 dark:bg-gray-900"
                />
                <Button onClick={handleCopyShareLink} variant="outline">
                  {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Share on Social Media</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleSocialShare('twitter')}
                >
                  Twitter / X
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleSocialShare('facebook')}
                >
                  Facebook
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleSocialShare('linkedin')}
                >
                  LinkedIn
                </Button>
              </div>
            </div>

            {currentTrack && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="flex items-center gap-3">
                  {currentTrack.imageUrl ? (
                    <img src={currentTrack.imageUrl} alt={currentTrack.title} className="w-16 h-16 rounded-lg object-cover" / loading="lazy">
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-rose-500 to-fuchsia-500 flex items-center justify-center">
                      <Music className="w-8 h-8 text-white" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold dark:text-white">{currentTrack.title}</p>
                    <p className="text-sm text-gray-500">{currentTrack.style || 'AI Generated'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
