'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'

interface Chapter {
  title: string
  start: number
  end: number
  summary: string
  keywords: string[]
}

interface SmartChaptersProps {
  isLoading?: boolean
  data?: {
    chapters: Chapter[]
    totalDuration: number
  }
}

export function SmartChapters({ isLoading, data }: SmartChaptersProps) {
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

  const { chapters, totalDuration } = data

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const formatDuration = (start: number, end: number) => {
    const duration = end - start
    return `${formatTime(start)} - ${formatTime(end)} (${Math.round(duration)}s)`
  }

  const handleChapterClick = (start: number) => {
    // Find the video element and seek to the chapter start time
    const video = document.querySelector('video')
    if (video) {
      video.currentTime = start
      video.play()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Smart Chapters</span>
          <span className="text-sm text-muted-foreground">
            Total Duration: {formatTime(totalDuration)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] rounded-md border">
          <div className="space-y-4 p-4">
            {chapters.map((chapter, index) => (
              <div
                key={index}
                className="space-y-2 hover:bg-accent/50 p-3 rounded-md cursor-pointer"
                onClick={() => handleChapterClick(chapter.start)}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">
                    {index + 1}. {chapter.title}
                  </h4>
                  <span className="text-sm text-muted-foreground">
                    {formatDuration(chapter.start, chapter.end)}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground">
                  {chapter.summary}
                </p>

                <div className="flex flex-wrap gap-2">
                  {chapter.keywords.map((keyword) => (
                    <Badge key={keyword} variant="secondary">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" size="sm">
            Export Chapters
          </Button>
          <Button variant="outline" size="sm">
            Generate Thumbnail Grid
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 