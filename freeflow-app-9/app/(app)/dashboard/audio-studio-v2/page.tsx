"use client"

import { useState } from 'react'
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
  Waveform,
  Sliders,
  Scissors,
  Zap,
  Clock
} from 'lucide-react'

/**
 * Audio Studio V2 - Groundbreaking Audio Editing & Processing
 * Showcases audio tools with modern components
 */
export default function AudioStudioV2() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedTrack, setSelectedTrack] = useState<string | null>('1')
  const [playbackTime, setPlaybackTime] = useState(45) // seconds

  const stats = [
    { label: 'Audio Files', value: '124', change: 15.2, icon: <Music className="w-5 h-5" /> },
    { label: 'Total Duration', value: '8.5h', change: 25.3, icon: <Clock className="w-5 h-5" /> },
    { label: 'Projects', value: '42', change: 12.5, icon: <Waveform className="w-5 h-5" /> },
    { label: 'Processing Time', value: '2.3s', change: -18.7, icon: <Zap className="w-5 h-5" /> }
  ]

  const audioTracks = [
    {
      id: '1',
      title: 'Podcast Episode 23',
      artist: 'Marketing Team',
      duration: '45:32',
      size: '42.3 MB',
      format: 'MP3',
      quality: 'High',
      waveform: 'https://via.placeholder.com/600x80/8B5CF6/FFFFFF?text=Waveform'
    },
    {
      id: '2',
      title: 'Background Music',
      artist: 'Audio Library',
      duration: '3:24',
      size: '8.1 MB',
      format: 'WAV',
      quality: 'Studio',
      waveform: 'https://via.placeholder.com/600x80/EC4899/FFFFFF?text=Waveform'
    },
    {
      id: '3',
      title: 'Voice Recording',
      artist: 'Client Interview',
      duration: '28:15',
      size: '26.7 MB',
      format: 'MP3',
      quality: 'Medium',
      waveform: 'https://via.placeholder.com/600x80/F59E0B/FFFFFF?text=Waveform'
    }
  ]

  const audioEffects = [
    { name: 'Normalize', description: 'Balance volume levels', icon: <Volume2 className="w-5 h-5" /> },
    { name: 'Remove Noise', description: 'AI-powered cleanup', icon: <Zap className="w-5 h-5" /> },
    { name: 'Enhance Voice', description: 'Improve clarity', icon: <Mic className="w-5 h-5" /> },
    { name: 'Trim Silence', description: 'Auto-detect gaps', icon: <Scissors className="w-5 h-5" /> }
  ]

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'Studio': return 'bg-purple-100 text-purple-700'
      case 'High': return 'bg-green-100 text-green-700'
      case 'Medium': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-700'
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
          <GradientButton from="indigo" to="purple" onClick={() => console.log('Upload')}>
            <Upload className="w-5 h-5 mr-2" />
            Upload Audio
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Mic />} title="Record" description="New audio" onClick={() => console.log('Record')} />
          <BentoQuickAction icon={<Upload />} title="Import" description="Upload files" onClick={() => console.log('Import')} />
          <BentoQuickAction icon={<Scissors />} title="Quick Edit" description="Trim & cut" onClick={() => console.log('Edit')} />
          <BentoQuickAction icon={<Zap />} title="AI Enhance" description="Auto improve" onClick={() => console.log('Enhance')} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Playback</h3>
              <div className="space-y-4">
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="h-20 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-lg mb-3 flex items-center justify-center">
                    <Waveform className="w-12 h-12 text-indigo-600/40" />
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                    <span>{formatTime(playbackTime)}</span>
                    <span>45:32</span>
                  </div>
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
                      style={{ width: `${(playbackTime / 2732) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4">
                  <ModernButton variant="outline" size="sm" onClick={() => console.log('Skip back')}>
                    <SkipBack className="w-4 h-4" />
                  </ModernButton>
                  <GradientButton
                    from="indigo"
                    to="purple"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </GradientButton>
                  <ModernButton variant="outline" size="sm" onClick={() => console.log('Skip forward')}>
                    <SkipForward className="w-4 h-4" />
                  </ModernButton>
                </div>
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Audio Library</h3>
              <div className="space-y-4">
                {audioTracks.map((track) => (
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
                        <p className="text-sm text-muted-foreground">{track.artist}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-md ${getQualityColor(track.quality)}`}>
                          {track.quality}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-700">
                          {track.format}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {track.duration}
                      </span>
                      <span>{track.size}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <ModernButton variant="outline" size="sm" onClick={() => console.log('Play', track.id)}>
                        <Play className="w-3 h-3 mr-1" />
                        Play
                      </ModernButton>
                      <ModernButton variant="outline" size="sm" onClick={() => console.log('Edit', track.id)}>
                        <Settings className="w-3 h-3 mr-1" />
                        Edit
                      </ModernButton>
                      <ModernButton variant="outline" size="sm" onClick={() => console.log('Download', track.id)}>
                        <Download className="w-3 h-3 mr-1" />
                        Export
                      </ModernButton>
                    </div>
                  </div>
                ))}
              </div>
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
                    onClick={() => console.log('Apply', effect.name)}
                    className="w-full p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
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
            </BentoCard>

            <ProgressCard
              title="Storage Used"
              current={234}
              goal={500}
              unit="MB"
              icon={<Music className="w-5 h-5" />}
            />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Performance</h3>
              <div className="space-y-3">
                <MiniKPI label="Processing Speed" value="2.3s" change={-18.7} />
                <MiniKPI label="Export Quality" value="98%" change={5.2} />
                <MiniKPI label="Files Processed" value="847" change={25.3} />
                <MiniKPI label="Avg File Size" value="18MB" change={-8.3} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
