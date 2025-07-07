import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)

interface ChapterSegment {
  title: string
  start: number
  end: number
  summary: string
  keywords: string[]
}

interface TranscriptSegment {
  text: string
  start: number
  end: number
}

export class ChapterGenerationService {
  private model = genAI.getGenerativeModel({ model: 'gemini-pro' })

  async generateChapters(transcript: TranscriptSegment[]): Promise<ChapterSegment[]> {
    try {
      // Group transcript segments into potential chapters based on content and timing
      const potentialChapters = await this.identifyChapterBreaks(transcript)
      
      // Generate titles and summaries for each chapter
      const chapters = await this.enrichChapters(potentialChapters)
      
      return chapters
    } catch (error) {
      console.error('Failed to generate chapters:', error)
      throw new Error('Failed to generate chapters')
    }
  }

  private async identifyChapterBreaks(transcript: TranscriptSegment[]): Promise<TranscriptSegment[][]> {
    const segments: TranscriptSegment[][] = []
    let currentSegment: TranscriptSegment[] = []
    let currentDuration = 0

    for (const segment of transcript) {
      const segmentDuration = segment.end - segment.start

      // Start a new chapter if:
      // 1. Current chapter is too long (> 5 minutes)
      // 2. Natural break in content (detected by AI)
      if (currentDuration > 300 || await this.isNaturalBreak(segment, currentSegment)) {
        if (currentSegment.length > 0) {
          segments.push(currentSegment)
          currentSegment = []
          currentDuration = 0
        }
      }

      currentSegment.push(segment)
      currentDuration += segmentDuration
    }

    if (currentSegment.length > 0) {
      segments.push(currentSegment)
    }

    return segments
  }

  private async isNaturalBreak(
    currentSegment: TranscriptSegment,
    previousSegments: TranscriptSegment[]
  ): Promise<boolean> {
    if (previousSegments.length === 0) return false

    const previousText = previousSegments
      .slice(-3) // Look at last 3 segments for context
      .map(s => s.text)
      .join(' ')

    const prompt = `
      Analyze these two pieces of text and determine if there's a natural topic or content break between them.
      Consider factors like:
      - Topic changes
      - Transition phrases
      - Conclusion of thoughts
      - Start of new ideas

      Previous content: "${previousText}"
      Current content: "${currentSegment.text}"

      Return only "true" if there's a natural break, or "false" if it's continuous content.
    `

    const result = await this.model.generateContent(prompt)
    const text = result.response.text().toLowerCase().trim()
    return text === 'true'
  }

  private async enrichChapters(segments: TranscriptSegment[][]): Promise<ChapterSegment[]> {
    const chapters: ChapterSegment[] = []

    for (const segment of segments) {
      const text = segment.map(s => s.text).join(' ')
      const start = segment[0].start
      const end = segment[segment.length - 1].end

      const prompt = `
        Analyze this transcript segment and provide:
        1. A concise but descriptive title (max 50 characters)
        2. A brief summary (max 150 characters)
        3. 3-5 relevant keywords
        
        Format the response as JSON:
        {
          "title": "string",
          "summary": "string",
          "keywords": ["string"]
        }

        Transcript:
        "${text}"
      `

      const result = await this.model.generateContent(prompt)
      const analysis = JSON.parse(result.response.text())

      chapters.push({
        title: analysis.title,
        summary: analysis.summary,
        keywords: analysis.keywords,
        start,
        end
      })
    }

    return chapters
  }
} 