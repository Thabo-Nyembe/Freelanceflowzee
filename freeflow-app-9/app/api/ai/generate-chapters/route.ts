import { NextResponse } from 'next/server'
import { ChapterGenerationService } from '@/lib/ai/chapter-generation-service'

export async function POST(request: Request) {
  try {
    const { transcript } = await request.json()

    if (!transcript || !Array.isArray(transcript)) {
      return NextResponse.json(
        { error: 'Valid transcript array is required' },
        { status: 400 }
      )
    }

    const chapterService = new ChapterGenerationService()
    const chapters = await chapterService.generateChapters(transcript)

    return NextResponse.json({
      chapters,
      totalDuration: chapters[chapters.length - 1].end
    })
  } catch (error) {
    console.error('Failed to generate chapters:', error)
    return NextResponse.json(
      { error: 'Failed to generate chapters' },
      { status: 500 }
    )
  }
} 