'use client'

import { SmartChaptersData } from '@/lib/types/ai'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Clock, Tag } from 'lucide-react'

interface SmartChaptersData {
  chapters: { title: string; start: number; end: number; summary: string; keywords: string[] }[]
  totalDuration: number
}

interface SmartChaptersProps {
  data?: SmartChaptersData | { title: string; start: number; end: number; summary: string; keywords: string[] }[]
}

export function SmartChapters({ data }: SmartChaptersProps) {
  if (!data) return null

  // Transform array data into SmartChaptersData format
  const chaptersData: SmartChaptersData = Array.isArray(data) 
    ? {
        chapters: data,
        totalDuration: data.reduce((max, chapter) => Math.max(max, chapter.end), 0)
      }
    : data

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Smart Chapters
          <Badge variant="outline" className="ml-auto">
            <Clock className="h-3 w-3 mr-1" />
            {formatTime(chaptersData.totalDuration)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {chaptersData.chapters.map((chapter, index) => (
              <div key={index} className="p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{chapter.title}</h4>
                  <span className="text-sm text-muted-foreground">
                    {formatTime(chapter.start)} - {formatTime(chapter.end)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{chapter.summary}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {chapter.keywords.map((keyword, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 text-xs rounded-full bg-muted"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
} 