'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Volume2,
  WaveformIcon,
  Mic,
  SpeakerIcon,
  Settings2,
  RefreshCw
} from 'lucide-react'
import { VoiceEnhancementService } from '@/lib/ai/voice-enhancement-service'

interface VoiceEnhancementControlsProps {
  audioStream?: MediaStream
  onEnhancedStream?: (stream: MediaStream) => void
}

export function VoiceEnhancementControls({
  audioStream, onEnhancedStream
}: VoiceEnhancementControlsProps) {
  const [isEnabled, setIsEnabled] = useState<any>(false)
  const [voiceService, setVoiceService] = useState<VoiceEnhancementService | null>(null)
  const [metrics, setMetrics] = useState<any>({
    volume: 0,
    noiseLevel: 0,
    clarity: 0
  })
  const [settings, setSettings] = useState<any>({
    gainLevel: 1,
    compressionRatio: 12,
    noiseThreshold: 0.01,
    filterFrequency: 80
  })

  // Initialize voice enhancement service
  useEffect(() => {
    const service = new VoiceEnhancementService()
    setVoiceService(service)

    return () => {
      service.cleanup()
    }
  }, [])

  // Handle audio processing
  useEffect(() => {
    if (!audioStream || !voiceService || !isEnabled) return

    let metricsInterval: NodeJS.Timeout

    const setupAudio = async () => {
      try {
        const enhancedStream = await voiceService.setupAudioProcessing(audioStream)
        if (onEnhancedStream) {
          onEnhancedStream(enhancedStream)
        }

        // Update metrics periodically
        metricsInterval = setInterval(() => {
          const newMetrics = voiceService.getAudioMetrics()
          setMetrics(newMetrics)
        }, 100)
      } catch (error) {
        console.error('Failed to setup audio processing:', error)
      }
    }

    setupAudio()

    return () => {
      if (metricsInterval) {
        clearInterval(metricsInterval)
      }
      voiceService.cleanup()
    }
  }, [audioStream, voiceService, isEnabled, onEnhancedStream])

  // Update voice enhancement settings
  useEffect(() => {
    if (!voiceService || !isEnabled) return
    voiceService.updateSettings(settings)
  }, [settings, voiceService, isEnabled])

  const handleSettingChange = (setting: keyof typeof settings, value: number | number[]) => {
    setSettings(prev => ({
      ...prev,
      [setting]: Array.isArray(value) ? value[0] : value
    }))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <WaveformIcon className="h-5 w-5" />
            Voice Enhancement
          </CardTitle>
          <Switch
            checked={isEnabled}
            onCheckedChange={setIsEnabled}
            aria-label="Enable voice enhancement"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Audio Metrics */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Audio Metrics</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Volume2 className="h-4 w-4" />
                    Volume
                  </span>
                  <Badge variant="secondary">{Math.round(metrics.volume)}%</Badge>
                </div>
                <Slider
                  value={[metrics.volume]}
                  max={100}
                  step={1}
                  disabled
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <RefreshCw className="h-4 w-4" />
                    Noise
                  </span>
                  <Badge variant="secondary">{Math.round(metrics.noiseLevel)}%</Badge>
                </div>
                <Slider
                  value={[metrics.noiseLevel]}
                  max={100}
                  step={1}
                  disabled
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Mic className="h-4 w-4" />
                    Clarity
                  </span>
                  <Badge variant="secondary">{Math.round(metrics.clarity)}%</Badge>
                </div>
                <Slider
                  value={[metrics.clarity]}
                  max={100}
                  step={1}
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Enhancement Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Enhancement Settings</h3>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <SpeakerIcon className="h-4 w-4" />
                  Gain Level
                </span>
                <span className="text-muted-foreground">
                  {settings.gainLevel.toFixed(1)}x
                </span>
              </div>
              <Slider
                value={[settings.gainLevel]}
                min={0.1}
                max={2}
                step={0.1}
                disabled={!isEnabled}
                onValueChange={value => handleSettingChange('gainLevel', value)}
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Settings2 className="h-4 w-4" />
                  Compression
                </span>
                <span className="text-muted-foreground">
                  {settings.compressionRatio}:1
                </span>
              </div>
              <Slider
                value={[settings.compressionRatio]}
                min={1}
                max={20}
                step={1}
                disabled={!isEnabled}
                onValueChange={value => handleSettingChange('compressionRatio', value)}
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Volume2 className="h-4 w-4" />
                  Noise Gate
                </span>
                <span className="text-muted-foreground">
                  {settings.noiseThreshold.toFixed(3)}
                </span>
              </div>
              <Slider
                value={[settings.noiseThreshold]}
                min={0.001}
                max={0.1}
                step={0.001}
                disabled={!isEnabled}
                onValueChange={value => handleSettingChange('noiseThreshold', value)}
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <WaveformIcon className="h-4 w-4" />
                  Filter Frequency
                </span>
                <span className="text-muted-foreground">
                  {settings.filterFrequency} Hz
                </span>
              </div>
              <Slider
                value={[settings.filterFrequency]}
                min={20}
                max={200}
                step={1}
                disabled={!isEnabled}
                onValueChange={value => handleSettingChange('filterFrequency', value)}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 