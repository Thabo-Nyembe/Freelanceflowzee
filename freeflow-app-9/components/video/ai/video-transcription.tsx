'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { VideoTranscriptionData } from '@/lib/types/ai'
import { Badge } from '@/components/ui/badge'
import { FileText, Languages, Search } from 'lucide-react'

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

  const handleCopyText = () => {
    const text = segments.map(segment => 
      segment.speaker ? `${segment.speaker}: ${segment.text}` : segment.text
    ).join('\n\n')
    navigator.clipboard.writeText(text)
  }

  const generateSRT = () => {
    let srt = ''
    segments.forEach((segment, index) => {
      const startTime = formatSRTTime(segment.start)
      const endTime = formatSRTTime(segment.end)
      srt += `${index + 1}\n${startTime} --> ${endTime}\n${segment.text}\n\n`
    })
    return srt
  }

  const generateVTT = () => {
    let vtt = 'WEBVTT\n\n'
    segments.forEach((segment) => {
      const startTime = formatVTTTime(segment.start)
      const endTime = formatVTTTime(segment.end)
      vtt += `${startTime} --> ${endTime}\n${segment.text}\n\n`
    })
    return vtt
  }

  const formatSRTTime = (seconds: number) => {
    const date = new Date(seconds * 1000)
    const hours = Math.floor(seconds / 3600).toString().padStart(2, '0')
    const minutes = date.getUTCMinutes().toString().padStart(2, '0')
    const secs = date.getUTCSeconds().toString().padStart(2, '0')
    const ms = date.getUTCMilliseconds().toString().padStart(3, '0')
    return `${hours}:${minutes}:${secs},${ms}`
  }

  const formatVTTTime = (seconds: number) => {
    const date = new Date(seconds * 1000)
    const hours = Math.floor(seconds / 3600).toString().padStart(2, '0')
    const minutes = date.getUTCMinutes().toString().padStart(2, '0')
    const secs = date.getUTCSeconds().toString().padStart(2, '0')
    const ms = date.getUTCMilliseconds().toString().padStart(3, '0')
    return `${hours}:${minutes}:${secs}.${ms}`
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleDownloadSRT = () => {
    const srt = generateSRT()
    downloadFile(srt, 'transcription.srt', 'text/plain')
  }

  const handleDownloadVTT = () => {
    const vtt = generateVTT()
    downloadFile(vtt, 'transcription.vtt', 'text/vtt')
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

          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transcription..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
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
            <Button variant="outline" size="sm" onClick={handleCopyText}>
              Copy Text
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadSRT}>
              Download SRT
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadVTT}>
              Download VTT
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 