'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  Lightbulb,
  AlertCircle,
  CheckCircle,
  Info,
  Star,
  Timer,
  Volume2,
  Mic,
  Camera,
  Layout,
  Sun,
  Users
} from 'lucide-react'

interface SmartRecordingTipsProps {
  isRecording: boolean
  audioLevel: number
  noiseLevel: number
  contentQuality?: {
    clarity: number
    engagement: number
    professionalism: number
    effectiveness: number
  }
  recordingDuration: number
}

interface Tip {
  id: string
  category: 'setup' | 'audio' | 'video' | 'content' | 'engagement'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  icon: React.ReactNode
  condition: (props: SmartRecordingTipsProps) => boolean
}

const tips: Tip[] = [
  // Setup Tips
  {
    id: 'lighting',
    category: 'setup',
    title: 'Check Your Lighting',
    description: 'Ensure your face is well-lit and avoid strong backlighting.',
    priority: 'high',
    icon: <Sun className="h-4 w-4" />,
    condition: () => true // Always show before recording
  },
  {
    id: 'background',
    category: 'setup',
    title: 'Clean Background',
    description: 'Use a clean, professional background without distractions.',
    priority: 'medium',
    icon: <Layout className="h-4 w-4" />,
    condition: () => true
  },

  // Audio Tips
  {
    id: 'low-audio',
    category: 'audio',
    title: 'Audio Level Too Low',
    description: 'Move closer to the microphone or increase input volume.',
    priority: 'high',
    icon: <Volume2 className="h-4 w-4" />,
    condition: (props) => props.isRecording && props.audioLevel < 20
  },
  {
    id: 'noise',
    category: 'audio',
    title: 'High Background Noise',
    description: 'Find a quieter environment or use noise cancellation.',
    priority: 'high',
    icon: <Mic className="h-4 w-4" />,
    condition: (props) => props.isRecording && props.noiseLevel > 60
  },

  // Content Tips
  {
    id: 'clarity',
    category: 'content',
    title: 'Improve Speech Clarity',
    description: 'Speak slowly and enunciate clearly for better understanding.',
    priority: 'medium',
    icon: <Info className="h-4 w-4" />,
    condition: (props) => props.isRecording && props.contentQuality?.clarity! < 0.7
  },
  {
    id: 'engagement',
    category: 'content',
    title: 'Boost Engagement',
    description: 'Use vocal variety and gestures to maintain viewer interest.',
    priority: 'medium',
    icon: <Users className="h-4 w-4" />,
    condition: (props) => props.isRecording && props.contentQuality?.engagement! < 0.7
  },

  // Duration Tips
  {
    id: 'duration',
    category: 'content',
    title: 'Consider Video Length',
    description: 'Keep your video concise. Consider breaking into shorter segments.',
    priority: 'low',
    icon: <Timer className="h-4 w-4" />,
    condition: (props) => props.isRecording && props.recordingDuration > 600 // 10 minutes
  }
]

export function SmartRecordingTips({
  isRecording,
  audioLevel,
  noiseLevel,
  contentQuality,
  recordingDuration
}: SmartRecordingTipsProps) {
  const [activeTips, setActiveTips] =<Tip[]>([])

  // Update active tips based on current conditions
  useEffect(() => {
    const newTips = tips.filter(tip => tip.condition({
      isRecording,
      audioLevel,
      noiseLevel,
      contentQuality,
      recordingDuration
    }))
    setActiveTips(newTips)
  }, [isRecording, audioLevel, noiseLevel, contentQuality, recordingDuration])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Smart Recording Tips
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-3">
            {!isRecording && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Review these tips before starting your recording for best results.
                </AlertDescription>
              </Alert>
            )}

            {activeTips.map(tip => (
              <Alert
                key={tip.id}
                variant={
                  tip.priority === 'high' ? 'destructive' :
                  tip.priority === 'medium' ? 'default' : 'outline'
                }
              >
                <div className="flex items-start gap-2">
                  {tip.icon}
                  <div>
                    <div className="flex items-center gap-2 font-medium">
                      {tip.title}
                      <Badge variant="outline" className="text-xs">
                        {tip.category}
                      </Badge>
                    </div>
                    <AlertDescription>
                      {tip.description}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            ))}

            {isRecording && activeTips.length === 0 && (
              <Alert>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription>
                  Great job! Your recording setup looks good.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
} 