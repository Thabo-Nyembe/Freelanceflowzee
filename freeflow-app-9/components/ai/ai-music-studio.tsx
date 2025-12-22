'use client'

import { useState, useRef, useEffect } from 'react'
import { Music, Play, Pause, Download, RefreshCw, Sparkles, Mic, FileText, Clock, Zap, Settings2, Volume2, SkipBack, SkipForward, Loader2, Trash2, Heart, Share2 } from 'lucide-react'
import { useSunoMusic, type SunoModel, musicPresets, promptTemplates } from '@/lib/hooks/use-suno-music'

export default function AIMusicStudio() {
  const [prompt, setPrompt] = useState('')
  const [title, setTitle] = useState('')
  const [selectedModel, setSelectedModel] = useState<SunoModel>('V4')
  const [selectedGenre, setSelectedGenre] = useState('')
  const [selectedMood, setSelectedMood] = useState('')
  const [isInstrumental, setIsInstrumental] = useState(false)
  const [customMode, setCustomMode] = useState(false)
  const [customLyrics, setCustomLyrics] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const audioRef = useRef<HTMLAudioElement>(null)

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

  // Audio player controls
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [currentTrack])

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

  const handleGenerate = async () => {
    if (!prompt.trim() && !customLyrics.trim()) return

    let finalPrompt = prompt
    if (selectedGenre && selectedMood) {
      finalPrompt = `${selectedMood} ${selectedGenre} song: ${prompt}`
    } else if (selectedGenre) {
      finalPrompt = `${selectedGenre} song: ${prompt}`
    } else if (selectedMood) {
      finalPrompt = `${selectedMood} song: ${prompt}`
    }

    await generateMusic({
      prompt: finalPrompt,
      model: selectedModel,
      customMode,
      style: selectedGenre ? `${selectedMood} ${selectedGenre}`.trim() : undefined,
      title: title || undefined,
      instrumental: isInstrumental,
      lyrics: customMode ? customLyrics : undefined
    })
  }

  const handleGenerateLyrics = async () => {
    const lyricsPrompt = prompt || `Write lyrics for a ${selectedMood} ${selectedGenre} song`
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
    a.download = `${filename}.mp3`
    a.click()
    URL.revokeObjectURL(downloadUrl)
  }

  const applyTemplate = (templateKey: keyof typeof promptTemplates) => {
    let template = promptTemplates[templateKey]
    if (selectedGenre) template = template.replace('{genre}', selectedGenre)
    if (selectedMood) template = template.replace('{mood}', selectedMood)
    setPrompt(template)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 dark:bg-none dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 bg-clip-text text-transparent flex items-center gap-3">
              <Music className="w-10 h-10 text-rose-600" />
              AI Music Studio
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Powered by Suno - Create original music with AI
            </p>
          </div>
          <div className="flex gap-2">
            {musicPresets.models.map((model) => (
              <button
                key={model.value}
                onClick={() => setSelectedModel(model.value as SunoModel)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedModel === model.value
                    ? 'bg-rose-600 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {model.label}
                {model.badge && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded">
                    {model.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Genre & Mood Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Genre
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {musicPresets.genres.map((genre) => (
                      <button
                        key={genre.value}
                        onClick={() => setSelectedGenre(selectedGenre === genre.value ? '' : genre.value)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          selectedGenre === genre.value
                            ? 'bg-rose-600 text-white shadow-md'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {genre.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Mood
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {musicPresets.moods.map((mood) => (
                      <button
                        key={mood.value}
                        onClick={() => setSelectedMood(selectedMood === mood.value ? '' : mood.value)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          selectedMood === mood.value
                            ? 'bg-pink-600 text-white shadow-md'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {mood.emoji} {mood.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Prompt Input */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Describe your song
                </label>
                <div className="flex gap-2">
                  {Object.keys(promptTemplates).slice(0, 3).map((key) => (
                    <button
                      key={key}
                      onClick={() => applyTemplate(key as keyof typeof promptTemplates)}
                      className="text-xs px-2 py-1 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-full hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors capitalize"
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
                className="w-full h-24 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl resize-none focus:ring-2 focus:ring-rose-500 focus:border-transparent dark:text-white"
              />

              <div className="flex items-center gap-4 mt-4">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Song title (optional)"
                  className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl dark:text-white"
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

            {/* Custom Lyrics Mode */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
              <button
                onClick={() => setCustomMode(!customMode)}
                className="w-full px-6 py-4 flex items-center justify-between text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Custom Lyrics Mode
                </span>
                <span className={`transform transition-transform ${customMode ? 'rotate-180' : ''}`}>▼</span>
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
                    placeholder="[Verse 1]&#10;Write your lyrics here...&#10;&#10;[Chorus]&#10;..."
                    className="w-full h-40 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl resize-none focus:ring-2 focus:ring-rose-500 focus:border-transparent dark:text-white font-mono text-sm"
                  />
                </div>
              )}
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || (!prompt.trim() && !customLyrics.trim())}
              className="w-full py-4 bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
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
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl">
                {error.message}
              </div>
            )}
          </div>

          {/* Player & Tracks Panel */}
          <div className="space-y-6">
            {/* Current Track Player */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Now Playing</h3>

              {!currentTrack && !isGenerating && (
                <div className="h-48 flex flex-col items-center justify-center text-gray-400">
                  <Music className="w-16 h-16 mb-4 opacity-30" />
                  <p>Your music will appear here</p>
                </div>
              )}

              {isGenerating && (
                <div className="h-48 flex flex-col items-center justify-center">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-2 bg-rose-500 rounded-full animate-pulse"
                        style={{
                          height: `${Math.random() * 40 + 20}px`,
                          animationDelay: `${i * 0.1}s`
                        }}
                      />
                    ))}
                  </div>
                  <p className="mt-6 text-gray-600 dark:text-gray-400">Creating your track...</p>
                  {status?.progress && (
                    <div className="w-full mt-4 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-rose-600 h-2 rounded-full transition-all"
                        style={{ width: `${status.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              )}

              {currentTrack && (
                <div className="space-y-4">
                  {/* Track artwork */}
                  {currentTrack.imageUrl && (
                    <div className="relative aspect-square rounded-xl overflow-hidden">
                      <img
                        src={currentTrack.imageUrl}
                        alt={currentTrack.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <h4 className="text-white font-bold text-lg truncate">{currentTrack.title}</h4>
                        <p className="text-white/80 text-sm">{currentTrack.style}</p>
                      </div>
                    </div>
                  )}

                  {!currentTrack.imageUrl && (
                    <div className="aspect-square rounded-xl bg-gradient-to-br from-rose-500 to-fuchsia-500 flex items-center justify-center">
                      <Music className="w-20 h-20 text-white/80" />
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
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-center gap-4">
                    <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors">
                      <SkipBack className="w-5 h-5" />
                    </button>
                    <button
                      onClick={togglePlay}
                      className="p-4 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-colors shadow-lg"
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                    </button>
                    <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors">
                      <SkipForward className="w-5 h-5" />
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
                      className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex justify-center gap-2 pt-2">
                    <button
                      onClick={() => handleDownload(currentTrack.audioUrl, currentTrack.title)}
                      className="flex items-center gap-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    <button className="flex items-center gap-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      <Heart className="w-4 h-4" />
                      Save
                    </button>
                    <button className="flex items-center gap-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Track History */}
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
                          ? 'bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      {track.imageUrl ? (
                        <img src={track.imageUrl} alt={track.title} className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-500 to-fuchsia-500 flex items-center justify-center">
                          <Music className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{track.title}</p>
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
    </div>
  )
}
