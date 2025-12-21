'use client'

import { useState, useEffect } from 'react'
import {
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  MiniKPI,
  ProgressCard
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton
} from '@/components/ui/modern-buttons'
import {
  Music,
  Mic,
  Volume2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Upload,
  Download,
  Settings,
  AudioWaveform as Waveform,
  Sliders,
  Scissors,
  Zap,
  Clock,
  Trash2,
  Plus
} from 'lucide-react'
import {
  useAudioStudio,
  AudioTrack,
  AudioProject,
  getQualityColor,
  getFormatColor,
  getProcessingStatusColor,
  formatDuration,
  formatFileSize,
  formatTotalDuration
} from '@/lib/hooks/use-audio-studio'

interface AudioStudioClientProps {
  initialTracks: AudioTrack[]
  initialProjects: AudioProject[]
  initialStats: {
    totalTracks: number
    totalProjects: number
    totalDuration: number
    totalSize: number
    processedTracks: number
    avgProcessingTime: number
  }
}

export default function AudioStudioClient({
  initialTracks,
  initialProjects,
  initialStats
}: AudioStudioClientProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null)
  const [playbackTime, setPlaybackTime] = useState(0)
  const [activeTab, setActiveTab] = useState<'tracks' | 'projects'>('tracks')

  const {
    tracks,
    projects,
    stats,
    isLoading,
    error,
    fetchTracks,
    fetchProjects,
    uploadTrack,
    updateTrack,
    deleteTrack,
    applyEffect,
    createProject,
    exportProject
  } = useAudioStudio(initialTracks)

  useEffect(() => {
    fetchTracks()
    fetchProjects()
  }, [fetchTracks, fetchProjects])

  const displayStats = [
    { label: 'Audio Files', value: String(stats.totalTracks || initialStats.totalTracks), change: 15.2, icon: <Music className="w-5 h-5" /> },
    { label: 'Total Duration', value: formatTotalDuration(stats.totalDuration || initialStats.totalDuration), change: 25.3, icon: <Clock className="w-5 h-5" /> },
    { label: 'Projects', value: String(stats.totalProjects || initialStats.totalProjects), change: 12.5, icon: <Waveform className="w-5 h-5" /> },
    { label: 'Processing Time', value: `${(stats.avgProcessingTime || initialStats.avgProcessingTime).toFixed(1)}s`, change: -18.7, icon: <Zap className="w-5 h-5" /> }
  ]

  const audioEffects = [
    { name: 'Normalize', description: 'Balance volume levels', icon: <Volume2 className="w-5 h-5" />, type: 'normalize' },
    { name: 'Remove Noise', description: 'AI-powered cleanup', icon: <Zap className="w-5 h-5" />, type: 'noise_reduction' },
    { name: 'Enhance Voice', description: 'Improve clarity', icon: <Mic className="w-5 h-5" />, type: 'voice_enhance' },
    { name: 'Trim Silence', description: 'Auto-detect gaps', icon: <Scissors className="w-5 h-5" />, type: 'trim_silence' }
  ]

  const selectedTrackData = tracks.find(t => t.id === selectedTrack)

  const handleUploadTrack = async () => {
    try {
      const newTrack = await uploadTrack({
        title: 'New Audio Track',
        description: 'Uploaded audio file',
        format: 'mp3',
        duration_seconds: 0
      })
      if (newTrack) {
        setSelectedTrack(newTrack.id)
      }
    } catch (err) {
      console.error('Failed to upload track:', err)
    }
  }

  const handleDeleteTrack = async (trackId: string) => {
    if (confirm('Are you sure you want to delete this track?')) {
      try {
        await deleteTrack(trackId)
        if (selectedTrack === trackId) {
          setSelectedTrack(null)
        }
      } catch (err) {
        console.error('Failed to delete track:', err)
      }
    }
  }

  const handleApplyEffect = async (effectType: string) => {
    if (!selectedTrack) {
      alert('Please select a track first')
      return
    }
    try {
      await applyEffect(selectedTrack, effectType)
    } catch (err) {
      console.error('Failed to apply effect:', err)
    }
  }

  const handleCreateProject = async () => {
    try {
      await createProject({
        name: 'New Project',
        description: 'Audio project',
        sample_rate: 44100
      })
    } catch (err) {
      console.error('Failed to create project:', err)
    }
  }

  const handleExportProject = async (projectId: string) => {
    try {
      await exportProject(projectId, 'mp3')
    } catch (err) {
      console.error('Failed to export project:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/30 to-pink-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Music className="w-10 h-10 text-indigo-600" />
              Audio Studio
            </h1>
            <p className="text-muted-foreground">Professional audio editing and processing</p>
          </div>
          <GradientButton from="indigo" to="purple" onClick={handleUploadTrack}>
            <Upload className="w-5 h-5 mr-2" />
            Upload Audio
          </GradientButton>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <StatGrid columns={4} stats={displayStats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Mic />} title="Record" description="New audio" onClick={() => console.log('Record')} />
          <BentoQuickAction icon={<Upload />} title="Import" description="Upload files" onClick={handleUploadTrack} />
          <BentoQuickAction icon={<Scissors />} title="Quick Edit" description="Trim & cut" onClick={() => console.log('Edit')} />
          <BentoQuickAction icon={<Zap />} title="AI Enhance" description="Auto improve" onClick={() => selectedTrack && handleApplyEffect('voice_enhance')} />
        </div>

        <div className="flex items-center gap-3">
          <PillButton variant={activeTab === 'tracks' ? 'primary' : 'ghost'} onClick={() => setActiveTab('tracks')}>
            Tracks ({tracks.length})
          </PillButton>
          <PillButton variant={activeTab === 'projects' ? 'primary' : 'ghost'} onClick={() => setActiveTab('projects')}>
            Projects ({projects.length})
          </PillButton>
          <div className="ml-auto">
            <ModernButton variant="outline" size="sm" onClick={handleCreateProject}>
              <Plus className="w-4 h-4 mr-1" />
              New Project
            </ModernButton>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Playback Section */}
            <BentoCard className="p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Playback</h3>
              <div className="space-y-4">
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="h-20 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-lg mb-3 flex items-center justify-center">
                    {selectedTrackData ? (
                      <div className="text-center">
                        <p className="font-semibold text-indigo-600">{selectedTrackData.title}</p>
                        <p className="text-sm text-muted-foreground">{selectedTrackData.artist}</p>
                      </div>
                    ) : (
                      <Waveform className="w-12 h-12 text-indigo-600/40" />
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                    <span>{formatDuration(playbackTime)}</span>
                    <span>{selectedTrackData ? formatDuration(selectedTrackData.duration_seconds) : '0:00'}</span>
                  </div>
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
                      style={{ width: selectedTrackData ? `${(playbackTime / selectedTrackData.duration_seconds) * 100}%` : '0%' }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4">
                  <ModernButton variant="outline" size="sm" onClick={() => setPlaybackTime(Math.max(0, playbackTime - 10))}>
                    <SkipBack className="w-4 h-4" />
                  </ModernButton>
                  <GradientButton
                    from="indigo"
                    to="purple"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </GradientButton>
                  <ModernButton variant="outline" size="sm" onClick={() => selectedTrackData && setPlaybackTime(Math.min(selectedTrackData.duration_seconds, playbackTime + 10))}>
                    <SkipForward className="w-4 h-4" />
                  </ModernButton>
                </div>
              </div>
            </BentoCard>

            {/* Audio Library */}
            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">
                {activeTab === 'tracks' ? 'Audio Library' : 'Projects'}
              </h3>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : activeTab === 'tracks' ? (
                <div className="space-y-4">
                  {tracks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Music className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No audio tracks yet. Upload your first track!</p>
                    </div>
                  ) : (
                    tracks.map((track) => (
                      <div
                        key={track.id}
                        onClick={() => setSelectedTrack(track.id)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                          selectedTrack === track.id
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950'
                            : 'border-border bg-background hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold mb-1">{track.title}</h4>
                            <p className="text-sm text-muted-foreground">{track.artist || 'Unknown Artist'}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded-md ${getQualityColor(track.quality)}`}>
                              {track.quality}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-md ${getFormatColor(track.format)}`}>
                              {track.format.toUpperCase()}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-md ${getProcessingStatusColor(track.processing_status)}`}>
                              {track.processing_status}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDuration(track.duration_seconds)}
                          </span>
                          <span>{formatFileSize(track.file_size_bytes)}</span>
                          {track.effects_applied.length > 0 && (
                            <span className="text-indigo-600">
                              {track.effects_applied.length} effects applied
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <ModernButton
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedTrack(track.id)
                              setIsPlaying(true)
                            }}
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Play
                          </ModernButton>
                          <ModernButton variant="outline" size="sm" onClick={(e) => { e.stopPropagation() }}>
                            <Settings className="w-3 h-3 mr-1" />
                            Edit
                          </ModernButton>
                          <ModernButton variant="outline" size="sm" onClick={(e) => { e.stopPropagation() }}>
                            <Download className="w-3 h-3 mr-1" />
                            Export
                          </ModernButton>
                          <ModernButton
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteTrack(track.id)
                            }}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3" />
                          </ModernButton>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Waveform className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No projects yet. Create your first project!</p>
                    </div>
                  ) : (
                    projects.map((project) => (
                      <div
                        key={project.id}
                        className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold mb-1">{project.name}</h4>
                            <p className="text-sm text-muted-foreground">{project.description}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-md ${
                            project.status === 'completed' ? 'bg-green-100 text-green-700' :
                            project.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                            project.status === 'archived' ? 'bg-gray-100 text-gray-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {project.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                          <span>{formatTotalDuration(project.total_duration_seconds)}</span>
                          <span>{project.sample_rate}Hz</span>
                          <span>{project.channels} channels</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <ModernButton variant="outline" size="sm">
                            Open
                          </ModernButton>
                          <ModernButton
                            variant="outline"
                            size="sm"
                            onClick={() => handleExportProject(project.id)}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Export
                          </ModernButton>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </BentoCard>
          </div>

          <div className="space-y-6">
            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-600" />
                Audio Effects
              </h3>
              <div className="space-y-3">
                {audioEffects.map((effect) => (
                  <button
                    key={effect.name}
                    onClick={() => handleApplyEffect(effect.type)}
                    disabled={!selectedTrack}
                    className={`w-full p-3 rounded-lg transition-colors text-left ${
                      selectedTrack
                        ? 'bg-muted/50 hover:bg-muted'
                        : 'bg-muted/20 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600">
                        {effect.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{effect.name}</p>
                        <p className="text-xs text-muted-foreground">{effect.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              {!selectedTrack && (
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Select a track to apply effects
                </p>
              )}
            </BentoCard>

            <ProgressCard
              title="Storage Used"
              current={Math.round((stats.totalSize || initialStats.totalSize) / 1048576)}
              goal={500}
              unit="MB"
              icon={<Music className="w-5 h-5" />}
            />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Performance</h3>
              <div className="space-y-3">
                <MiniKPI
                  label="Processing Speed"
                  value={`${(stats.avgProcessingTime || initialStats.avgProcessingTime).toFixed(1)}s`}
                  change={-18.7}
                />
                <MiniKPI label="Export Quality" value="98%" change={5.2} />
                <MiniKPI
                  label="Files Processed"
                  value={String(stats.processedTracks || initialStats.processedTracks)}
                  change={25.3}
                />
                <MiniKPI
                  label="Avg File Size"
                  value={tracks.length > 0 ? formatFileSize(Math.round(stats.totalSize / tracks.length)) : '0 B'}
                  change={-8.3}
                />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
