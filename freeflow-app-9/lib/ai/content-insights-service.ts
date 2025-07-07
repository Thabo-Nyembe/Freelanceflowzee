import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)

interface ContentInsights {
  topics: string[]
  targetAudience: string[]
  sentiment: {
    positive: number
    neutral: number
    negative: number
  }
  actionItems: string[]
  estimatedWatchTime: number
}

interface TranscriptSegment {
  text: string
  start: number
  end: number
}

export class ContentInsightsService {
  private model = genAI.getGenerativeModel({ model: 'gemini-pro' })

  async generateInsights(transcript: TranscriptSegment[]): Promise<ContentInsights> {
    try {
      const fullText = transcript.map(segment => segment.text).join(' ')
      const totalDuration = transcript[transcript.length - 1].end

      // Run analysis tasks in parallel for better performance
      const [
        topicAnalysis,
        audienceAnalysis,
        sentimentAnalysis,
        actionItemsAnalysis
      ] = await Promise.all([
        this.analyzeTopics(fullText),
        this.analyzeAudience(fullText),
        this.analyzeSentiment(fullText),
        this.extractActionItems(fullText)
      ])

      return {
        topics: topicAnalysis,
        targetAudience: audienceAnalysis,
        sentiment: sentimentAnalysis,
        actionItems: actionItemsAnalysis,
        estimatedWatchTime: this.calculateEstimatedWatchTime(totalDuration)
      }
    } catch (error) {
      console.error('Failed to generate content insights:', error)
      throw new Error('Failed to generate content insights')
    }
  }

  private async analyzeTopics(text: string): Promise<string[]> {
    const prompt = `
      Analyze this content and identify the main topics discussed.
      Return only an array of 3-5 specific topics, no other text.
      Format as JSON array of strings.
      Example: ["Web Development", "React Hooks", "Performance Optimization"]

      Content: "${text}"
    `

    const result = await this.model.generateContent(prompt)
    return JSON.parse(result.response.text())
  }

  private async analyzeAudience(text: string): Promise<string[]> {
    const prompt = `
      Analyze this content and identify the target audience segments.
      Consider factors like:
      - Technical expertise level
      - Professional roles
      - Industry focus
      - Learning objectives

      Return only an array of 2-4 audience segments, no other text.
      Format as JSON array of strings.
      Example: ["Junior Developers", "Frontend Engineers", "Tech Leads"]

      Content: "${text}"
    `

    const result = await this.model.generateContent(prompt)
    return JSON.parse(result.response.text())
  }

  private async analyzeSentiment(text: string): Promise<{ positive: number; neutral: number; negative: number }> {
    const prompt = `
      Analyze the sentiment of this content.
      Consider the overall tone, word choice, and emotional context.
      Return only a JSON object with sentiment scores (0-1), no other text.
      Format:
      {
        "positive": number,
        "neutral": number,
        "negative": number
      }
      Scores should sum to 1.

      Content: "${text}"
    `

    const result = await this.model.generateContent(prompt)
    return JSON.parse(result.response.text())
  }

  private async extractActionItems(text: string): Promise<string[]> {
    const prompt = `
      Extract key action items or takeaways from this content.
      Focus on:
      - Practical steps
      - Implementation tips
      - Learning objectives
      - Next actions

      Return only an array of 3-5 clear, actionable items, no other text.
      Format as JSON array of strings.
      Example: ["Set up error boundaries in React components", "Implement performance monitoring", "Add type safety checks"]

      Content: "${text}"
    `

    const result = await this.model.generateContent(prompt)
    return JSON.parse(result.response.text())
  }

  private calculateEstimatedWatchTime(duration: number): number {
    // Add 20% buffer for pauses, reflection, and note-taking
    return Math.ceil(duration * 1.2)
  }
} 