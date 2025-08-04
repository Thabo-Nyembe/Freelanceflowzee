'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Slider } from '@/components/ui/slider'
import {
  PlayIcon,
  PauseIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  StarIcon,
  ClockIcon
} from 'lucide-react'
import {
  HighlightDetectionService,
  HighlightSegment,
  KeyMoment
} from '@/lib/ai/highlight-detection-service'

interface HighlightManagerProps {
  videoStream?: MediaStream
  onHighlightsGenerated?: (highlights: HighlightSegment[]) => void
}

export function HighlightManager({
  videoStream, onHighlightsGenerated
}: HighlightManagerProps) {
  const [highlightService, setHighlightService] = useState<HighlightDetectionService | null>(null)
  const [highlights, setHighlights] = useState<HighlightSegment[]>([])
  const [selectedHighlight, setSelectedHighlight] = useState<HighlightSegment | null>(null)
  const [isPlaying, setIsPlaying] = useState<any>(false)
  const [currentTime, setCurrentTime] = useState<any>(0)
  const [confidenceThreshold, setConfidenceThreshold] = useState<any>(0.5)

  useEffect(() => {
    if (!videoStream) return

    const service = new HighlightDetectionService()
    service.initialize(videoStream)
    setHighlightService(service)

    return () => {
      service.cleanup()
    }
  }, [videoStream])

  const handleGenerateHighlights = async () => {
    if (!highlightService) return

    const generatedHighlights = await highlightService.generateHighlights()
    const filteredHighlights = generatedHighlights.filter(
      (highlight) => highlight.confidence >= confidenceThreshold
    )

    setHighlights(filteredHighlights)
    if (onHighlightsGenerated) {
      onHighlightsGenerated(filteredHighlights)
    }
  }

  const handleHighlightSelect = (highlight: HighlightSegment) => {
    setSelectedHighlight(highlight)
    setCurrentTime(highlight.startTime)
    setIsPlaying(true)
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handlePrevious = () => {
    if (!selectedHighlight) return
    const currentIndex = highlights.indexOf(selectedHighlight)
    if (currentIndex > 0) {
      handleHighlightSelect(highlights[currentIndex - 1])
    }
  }

  const handleNext = () => {
    if (!selectedHighlight) return
    const currentIndex = highlights.indexOf(selectedHighlight)
    if (currentIndex < highlights.length - 1) {
      handleHighlightSelect(highlights[currentIndex + 1])
    }
  }

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <StarIcon className="h-5 w-5" />
            Video Highlights
          </CardTitle>
          <Button onClick={handleGenerateHighlights} disabled={!highlightService}>
            Generate Highlights
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Confidence Threshold</span>
            <Slider
              value={[confidenceThreshold]}
              onValueChange={(values) => setConfidenceThreshold(values[0])}
              min={0}
              max={1}
              step={0.1}
              className="w-[200px]"
            />
            <span className="text-sm">{Math.round(confidenceThreshold * 100)}%</span>
          </div>

          <ScrollArea className="h-[300px] rounded-md border">
            <div className="space-y-2 p-4">
              {highlights.map((highlight, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-accent ${
                    selectedHighlight === highlight ? 'bg-accent' : ''
                  }`}
                  onClick={() => handleHighlightSelect(highlight)}
                >
                  <div className="flex items-center gap-3">
                    {highlight.thumbnail && (
                      <img
                        src={highlight.thumbnail}
                        alt={`Highlight ${index + 1}`}
                        className="h-16 w-24 rounded object-cover"
                      />
                    )}
                    <div>
                      <h3 className="font-medium">{highlight.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {highlight.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <ClockIcon className="h-3 w-3" />
                        <span className="text-xs">
                          {formatTime(highlight.startTime)} -{' '}
                          {formatTime(highlight.endTime)}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {Math.round(highlight.confidence * 100)}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {highlights.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No highlights generated yet. Click the button above to analyze your video.
                </p>
              )}
            </div>
          </ScrollArea>

          {selectedHighlight && (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrevious}
                  disabled={highlights.indexOf(selectedHighlight) === 0}
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePlayPause}
                >
                  {isPlaying ? (
                    <PauseIcon className="h-4 w-4" />
                  ) : (
                    <PlayIcon className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNext}
                  disabled={highlights.indexOf(selectedHighlight) === highlights.length - 1}
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(selectedHighlight.endTime)}</span>
              </div>
              <Slider
                value={[currentTime]}
                onValueChange={(values) => setCurrentTime(values[0])}
                min={selectedHighlight.startTime}
                max={selectedHighlight.endTime}
                step={100}
                className="w-full"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 