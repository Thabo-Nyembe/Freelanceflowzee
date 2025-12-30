'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Brain,
  Mic,
  Volume2,
  Sparkles,
  AlertCircle,
  Clock,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Minus,
  Star
} from 'lucide-react'
import { RealTimeAIService } from '@/lib/ai/real-time-ai-service'

interface RealTimeAnalysisProps {
  isRecording: boolean
  audioStream?: MediaStream
  onInsightGenerated?: (insight: VideoInsight) => void
}

interface VideoInsight {
  type: 'audio_quality' | 'speech_clarity' | 'background_noise' | 'pacing' | 'sentiment' | 'content_quality'
  score: number
  message: string
  timestamp: number
  severity: 'info' | 'warning' | 'error'
}

export function RealTimeAnalysis({
  isRecording, audioStream, onInsightGenerated
}: RealTimeAnalysisProps) {
  const [insights, setInsights] = useState<VideoInsight[]>([])
  const [audioLevel, setAudioLevel] = useState<any>(0)
  const [noiseLevel, setNoiseLevel] = useState<any>(0)
  const [speechClarity, setSpeechClarity] = useState<any>(0)
  const [isAnalyzing, setIsAnalyzing] = useState<any>(false)
  const [transcription, setTranscription] = useState<any>('')
  const [sentiment, setSentiment] = useState<{
    positive: number
    neutral: number
    negative: number
  }>({ positive: 0.33, neutral: 0.34, negative: 0.33 })
  const [contentQuality, setContentQuality] = useState<{
    clarity: number
    engagement: number
    professionalism: number
    effectiveness: number
  }>({
    clarity: 0,
    engagement: 0,
    professionalism: 0,
    effectiveness: 0
  })
  const [suggestions, setSuggestions] = useState<{
    category: string
    suggestion: string
    priority: 'high' | 'medium' | 'low'
  }[]>([])

  const aiServiceRef = useRef<RealTimeAIService | null>(null)

  // Initialize AI service
  useEffect(() => {
    aiServiceRef.current = new RealTimeAIService()
    return () => {
      aiServiceRef.current?.stopAnalysis()
    }
  }, [])

  // Audio analysis setup
  useEffect(() => {
    if (!audioStream || !isRecording) return

    const audioContext = new AudioContext()
    const analyser = audioContext.createAnalyser()
    const microphone = audioContext.createMediaStreamSource(audioStream)
    microphone.connect(analyser)
    analyser.fftSize = 2048

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const analyzeAudio = () => {
      if (!isRecording) return
      
      analyser.getByteFrequencyData(dataArray)
      
      // Calculate audio levels
      const average = dataArray.reduce((acc, val) => acc + val, 0) / bufferLength
      const normalizedLevel = Math.min(100, (average / 255) * 100)
      setAudioLevel(normalizedLevel)

      // Estimate noise level (simplified)
      const noise = dataArray.slice(0, 10).reduce((acc, val) => acc + val, 0) / 10
      const normalizedNoise = Math.min(100, (noise / 255) * 100)
      setNoiseLevel(normalizedNoise)

      // Generate insights based on audio analysis
      if (normalizedLevel < 20) {
        generateInsight({
          type: 'audio_quality',
          score: normalizedLevel,
          message: 'Audio level is too low. Move closer to the microphone.',
          timestamp: Date.now(),
          severity: 'warning'
        })
      } else if (normalizedNoise > 60) {
        generateInsight({
          type: 'background_noise',
          score: 100 - normalizedNoise,
          message: 'High background noise detected. Try recording in a quieter environment.',
          timestamp: Date.now(),
          severity: 'warning'
        })
      }

      requestAnimationFrame(analyzeAudio)
    }

    analyzeAudio()

    return () => {
      audioContext.close()
    }
  }, [isRecording, audioStream])

  // Start/stop AI analysis
  useEffect(() => {
    if (!isRecording || !aiServiceRef.current) return

    setIsAnalyzing(true)
    aiServiceRef.current.startAnalysis((result) => {
      switch (result.type) {
        case 'speech':
          if (result.data.isFinal) {
            setTranscription(result.data.transcript)
            generateInsight({
              type: 'speech_clarity',
              score: result.data.confidence * 100,
              message: result.data.confidence < 0.7 
                ? 'Speech could be clearer. Try speaking more slowly and distinctly.'
                : 'Good speech clarity!',
              timestamp: result.timestamp,
              severity: result.data.confidence < 0.7 ? 'warning' : 'info'
            })
          }
          break

        case 'sentiment':
          setSentiment(result.data.sentiment)
          generateInsight({
            type: 'sentiment',
            score: result.data.sentiment.positive * 100,
            message: `Current tone: ${result.data.tone}`,
            timestamp: result.timestamp,
            severity: 'info'
          })
          break

        case 'quality':
          setContentQuality(result.data.metrics)
          generateInsight({
            type: 'content_quality',
            score: result.data.score * 100,
            message: result.data.analysis,
            timestamp: result.timestamp,
            severity: result.data.score < 0.7 ? 'warning' : 'info'
          })
          break

        case 'suggestion':
          setSuggestions(result.data.suggestions)
          break
      }
    })

    return () => {
      aiServiceRef.current?.stopAnalysis()
      setIsAnalyzing(false)
    }
  }, [isRecording])

  const generateInsight = (insight: VideoInsight) => {
    // Only add new insights if they&apos;re different from recent ones
    const recentSimilarInsight = insights.find(
      i => i.type === insight.type && Date.now() - i.timestamp < 10000
    )
    
    if (!recentSimilarInsight) {
      setInsights(prev => [...prev, insight])
      onInsightGenerated?.(insight)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Real-Time Analysis
          {isAnalyzing && <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Audio Levels */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Audio Level
              </span>
              <span>{Math.round(audioLevel)}%</span>
            </div>
            <Progress value={audioLevel} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Background Noise
              </span>
              <span>{Math.round(noiseLevel)}%</span>
            </div>
            <Progress value={noiseLevel} className="bg-red-100" />
          </div>
        </div>

        {/* Live Transcription */}
        {transcription && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Live Transcription
            </h3>
            <ScrollArea className="h-20 rounded-md border p-2">
              <p className="text-sm">{transcription}</p>
            </ScrollArea>
          </div>
        )}

        {/* Sentiment Analysis */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Sentiment Analysis</h3>
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Positive
                </span>
                <span>{Math.round(sentiment.positive * 100)}%</span>
              </div>
              <Progress value={sentiment.positive * 100} className="bg-green-100" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Minus className="h-4 w-4 text-gray-500" />
                  Neutral
                </span>
                <span>{Math.round(sentiment.neutral * 100)}%</span>
              </div>
              <Progress value={sentiment.neutral * 100} className="bg-gray-100" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  Negative
                </span>
                <span>{Math.round(sentiment.negative * 100)}%</span>
              </div>
              <Progress value={sentiment.negative * 100} className="bg-red-100" />
            </div>
          </div>
        </div>

        {/* Content Quality */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Star className="h-4 w-4" />
            Content Quality
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Clarity</span>
                <span>{Math.round(contentQuality.clarity * 100)}%</span>
              </div>
              <Progress value={contentQuality.clarity * 100} className="bg-blue-100" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Engagement</span>
                <span>{Math.round(contentQuality.engagement * 100)}%</span>
              </div>
              <Progress value={contentQuality.engagement * 100} className="bg-purple-100" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Professionalism</span>
                <span>{Math.round(contentQuality.professionalism * 100)}%</span>
              </div>
              <Progress value={contentQuality.professionalism * 100} className="bg-green-100" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Effectiveness</span>
                <span>{Math.round(contentQuality.effectiveness * 100)}%</span>
              </div>
              <Progress value={contentQuality.effectiveness * 100} className="bg-yellow-100" />
            </div>
          </div>
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Improvement Suggestions</h3>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <Alert key={index} variant={
                  suggestion.priority === 'high' ? 'destructive' :
                  suggestion.priority === 'medium' ? 'default' : 'outline'
                }>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <span className="font-medium">{suggestion.category}:</span>{' '}
                    {suggestion.suggestion}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        )}

        {/* Recording Status */}
        <div className="flex items-center gap-2">
          {isRecording ? (
            <>
              <Badge variant="default" className="bg-red-500">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                  Recording & Analyzing
                </span>
              </Badge>
              <Clock className="h-4 w-4" />
            </>
          ) : (
            <Badge variant="secondary">Ready</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 