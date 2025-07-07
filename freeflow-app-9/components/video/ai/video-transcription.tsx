'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'

interface TranscriptSegment {
  start: number
  end: number
  text: string
  speaker?: string
}

interface VideoTranscriptionProps {
  isLoading?: boolean
  data?: {
    segments: TranscriptSegment[]
    languages: string[]
    confidence: number
  }
}

export function VideoTranscription({ isLoading, data }: VideoTranscriptionProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('en')

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-48" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  const { segments, languages, confidence } = data

  const filteredSegments = segments.filter((segment) =>
    segment.text.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleTimeClick = (time: number) => {
    // Find the video element and seek to the time
    const video = document.querySelector('video')
    if (video) {
      video.currentTime = time
      video.play()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Transcription</span>
          <span className="text-sm text-muted-foreground">
            Confidence: {(confidence * 100).toFixed(1)}%
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Input
            type="search"
            placeholder="Search transcript..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3"
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <ScrollArea className="h-[400px] rounded-md border p-4">
          <div className="space-y-4">
            {filteredSegments.map((segment, index) => (
              <div
                key={index}
                className="flex items-start space-x-4 hover:bg-accent/50 p-2 rounded-md"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTimeClick(segment.start)}
                  className="font-mono"
                >
                  {formatTime(segment.start)}
                </Button>
                <div className="flex-1">
                  {segment.speaker && (
                    <span className="font-medium text-sm text-primary mr-2">
                      {segment.speaker}:
                    </span>
                  )}
                  <span className="text-sm">{segment.text}</span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" size="sm">
            Copy Text
          </Button>
          <Button variant="outline" size="sm">
            Download SRT
          </Button>
          <Button variant="outline" size="sm">
            Download VTT
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 