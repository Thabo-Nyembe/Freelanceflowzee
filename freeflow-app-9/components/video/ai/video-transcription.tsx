'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { VideoTranscriptionData } from '@/lib/types/ai'
import { Badge } from '@/components/ui/badge'
import { FileText, Languages } from 'lucide-react'

interface VideoTranscriptionProps {
  data?: VideoTranscriptionData
  isLoading?: boolean
}

export function VideoTranscription({ data, isLoading }: VideoTranscriptionProps) {
  const [searchQuery, setSearchQuery] = useState<any>('')
  const [selectedLanguage, setSelectedLanguage] = useState<any>('en')

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Transcription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
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
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Transcription
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Languages className="h-4 w-4" />
            <div className="flex gap-2">
              {languages.map((lang) => (
                <Badge key={lang} variant="secondary">
                  {lang}
                </Badge>
              ))}
            </div>
            <Badge variant="outline">
              {Math.round(confidence * 100)}% confidence
            </Badge>
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
        </div>
      </CardContent>
    </Card>
  )
} 