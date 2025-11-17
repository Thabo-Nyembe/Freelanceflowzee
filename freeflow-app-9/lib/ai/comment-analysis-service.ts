import { Comment, CommentPriority, CommentStatus } from "@/components/projects-hub/universal-pinpoint-feedback-system-enhanced"

export interface AICommentAnalysis {
  id: string
  commentId: string
  sentiment: "positive" | "negative" | "neutral" | "constructive"
  confidence: number
  themes: string[]
  suggestedPriority: CommentPriority
  suggestedStatus?: CommentStatus
  actionItems: ActionItem[]
  relatedComments: string[]
  estimatedEffort: "trivial" | "small" | "medium" | "large" | "epic"
  category: "design" | "functionality" | "content" | "technical" | "process" | "general"
  keywords: string[]
  suggestions: AISuggestion[]
  timestamp: string
}

export interface ActionItem {
  id: string
  description: string
  priority: "low" | "medium" | "high"
  assignee?: string
  estimatedTime?: number // in minutes
  tags: string[]
}

export interface AISuggestion {
  type: "response" | "improvement" | "alternative" | "question" | "resource"
  content: string
  confidence: number
  reasoning?: string
}

export interface CommentInsights {
  totalComments: number
  averageSentiment: number
  topThemes: { theme: string; count: number; sentiment: number }[]
  priorityDistribution: Record<CommentPriority, number>
  statusDistribution: Record<CommentStatus, number>
  timeToResolution: { average: number; median: number }
  engagementMetrics: {
    averageReplies: number
    averageReactions: number
    mostActiveUsers: { userId: string; userName: string; commentCount: number }[]
  }
  trendAnalysis: {
    weeklyComments: number[]
    weeklyResolutions: number[]
    satisfactionTrend: number[]
  }
}

export interface SmartRecommendation {
  id: string
  type: "priority_adjustment" | "status_change" | "assignment" | "merge" | "escalation"
  title: string
  description: string
  confidence: number
  impact: "low" | "medium" | "high"
  effort: "low" | "medium" | "high"
  actions: {
    primary: string
    secondary?: string
  }
  reasoning: string[]
  affectedComments: string[]
}

class CommentAnalysisService {
  private apiKey: string
  private baseUrl: string
  private cache: Map<string, AICommentAnalysis> = new Map()
  private insightsCache: Map<string, CommentInsights> = new Map()

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || ""
    this.baseUrl = process.env.OPENAI_API_URL || "https://api.openai.com/v1"
  }

  async analyzeComment(comment: Comment): Promise<AICommentAnalysis> {
    // Check cache first
    const cacheKey = `${comment.id}-${comment.updatedAt || comment.createdAt}`
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    try {
      // In a real implementation, this would call an AI service
      // For now, we'll simulate the analysis
      const analysis = await this.simulateAIAnalysis(comment)

      // Cache the result
      this.cache.set(cacheKey, analysis)

      return analysis
    } catch (error) {
      console.error("Error analyzing comment:", error)

      // Return a fallback analysis
      return this.createFallbackAnalysis(comment)
    }
  }

  async analyzeComments(comments: Comment[]): Promise<AICommentAnalysis[]> {
    // Batch analyze comments
    const analyses = await Promise.all(
      comments.map(comment => this.analyzeComment(comment))
    )

    return analyses
  }

  async getProjectInsights(projectId: string, comments: Comment[]): Promise<CommentInsights> {
    const cacheKey = `insights-${projectId}-${comments.length}`
    if (this.insightsCache.has(cacheKey)) {
      return this.insightsCache.get(cacheKey)!
    }

    try {
      const analyses = await this.analyzeComments(comments)
      const insights = this.calculateInsights(comments, analyses)

      this.insightsCache.set(cacheKey, insights)
      return insights
    } catch (error) {
      console.error("Error generating insights:", error)
      return this.createFallbackInsights(comments)
    }
  }

  async getSmartRecommendations(comments: Comment[], analyses: AICommentAnalysis[]): Promise<SmartRecommendation[]> {
    try {
      const recommendations: SmartRecommendation[] = []

      // Priority adjustment recommendations
      const priorityRecommendations = this.analyzePriorityAdjustments(comments, analyses)
      recommendations.push(...priorityRecommendations)

      // Status change recommendations
      const statusRecommendations = this.analyzeStatusChanges(comments, analyses)
      recommendations.push(...statusRecommendations)

      // Assignment recommendations
      const assignmentRecommendations = this.analyzeAssignments(comments, analyses)
      recommendations.push(...assignmentRecommendations)

      // Merge recommendations
      const mergeRecommendations = this.analyzeMergeOpportunities(comments, analyses)
      recommendations.push(...mergeRecommendations)

      return recommendations.sort((a, b) => b.confidence - a.confidence)
    } catch (error) {
      console.error("Error generating recommendations:", error)
      return []
    }
  }

  async generateResponseSuggestions(comment: Comment, context?: string): Promise<AISuggestion[]> {
    try {
      // Simulate AI-generated response suggestions
      const suggestions: AISuggestion[] = []

      // Analyze comment content to generate appropriate responses
      const analysis = await this.analyzeComment(comment)

      if (analysis.sentiment === "negative") {
        suggestions.push({
          type: "response",
          content: `Thank you for this feedback. I understand your concern about ${analysis.themes[0] || "this issue"}. Let me address this by...`,
          confidence: 0.85,
          reasoning: "Acknowledgment and solution-oriented response for negative feedback"
        })
      }

      if (analysis.category === "design") {
        suggestions.push({
          type: "improvement",
          content: `For the design concern mentioned, we could consider: 1) Adjusting the visual hierarchy, 2) Improving color contrast, 3) Simplifying the layout`,
          confidence: 0.75,
          reasoning: "Common design improvements based on feedback category"
        })
      }

      if (analysis.estimatedEffort === "large") {
        suggestions.push({
          type: "alternative",
          content: `This is a substantial change. As an alternative, we could implement a simpler solution that addresses the core issue while requiring less development time.`,
          confidence: 0.70,
          reasoning: "Alternative approach for high-effort items"
        })
      }

      suggestions.push({
        type: "question",
        content: `Could you provide more details about ${analysis.themes[0] || "your specific use case"}? This would help us implement the most effective solution.`,
        confidence: 0.80,
        reasoning: "Clarifying question to gather more context"
      })

      return suggestions
    } catch (error) {
      console.error("Error generating response suggestions:", error)
      return []
    }
  }

  private async simulateAIAnalysis(comment: Comment): Promise<AICommentAnalysis> {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 100))

    const content = comment.content.toLowerCase()

    // Sentiment analysis
    const sentiment = this.analyzeSentiment(content)

    // Theme extraction
    const themes = this.extractThemes(content)

    // Priority suggestion
    const suggestedPriority = this.suggestPriority(content, comment.priority)

    // Category classification
    const category = this.classifyCategory(content)

    // Effort estimation
    const estimatedEffort = this.estimateEffort(content, themes)

    // Generate action items
    const actionItems = this.generateActionItems(content, themes)

    // Generate suggestions
    const suggestions = await this.generateSuggestions(comment, themes, category)

    return {
      id: `analysis-${comment.id}`,
      commentId: comment.id,
      sentiment,
      confidence: 0.75 + Math.random() * 0.2, // Simulate confidence
      themes,
      suggestedPriority,
      actionItems,
      relatedComments: [], // Would be populated by similarity analysis
      estimatedEffort,
      category,
      keywords: this.extractKeywords(content),
      suggestions,
      timestamp: new Date().toISOString()
    }
  }

  private analyzeSentiment(content: string): "positive" | "negative" | "neutral" | "constructive" {
    const positiveWords = ["good", "great", "excellent", "love", "perfect", "awesome", "nice"]
    const negativeWords = ["bad", "hate", "terrible", "awful", "wrong", "issue", "problem", "bug"]
    const constructiveWords = ["suggest", "improve", "consider", "could", "should", "recommend"]

    const words = content.split(/\s+/)
    const positiveCount = words.filter(word => positiveWords.some(pw => word.includes(pw))).length
    const negativeCount = words.filter(word => negativeWords.some(nw => word.includes(nw))).length
    const constructiveCount = words.filter(word => constructiveWords.some(cw => word.includes(cw))).length

    if (constructiveCount > 0) return "constructive"
    if (positiveCount > negativeCount) return "positive"
    if (negativeCount > positiveCount) return "negative"
    return "neutral"
  }

  private extractThemes(content: string): string[] {
    const themes: string[] = []

    if (content.includes("color") || content.includes("design") || content.includes("visual")) {
      themes.push("Visual Design")
    }
    if (content.includes("user") || content.includes("ux") || content.includes("experience")) {
      themes.push("User Experience")
    }
    if (content.includes("performance") || content.includes("speed") || content.includes("slow")) {
      themes.push("Performance")
    }
    if (content.includes("mobile") || content.includes("responsive")) {
      themes.push("Mobile Experience")
    }
    if (content.includes("accessibility") || content.includes("a11y")) {
      themes.push("Accessibility")
    }
    if (content.includes("content") || content.includes("text") || content.includes("copy")) {
      themes.push("Content")
    }

    return themes.length > 0 ? themes : ["General Feedback"]
  }

  private suggestPriority(content: string, currentPriority: CommentPriority): CommentPriority {
    const urgentWords = ["urgent", "critical", "broken", "bug", "error", "crash"]
    const importantWords = ["important", "major", "significant", "issue"]
    const minorWords = ["minor", "small", "tweak", "polish"]

    if (urgentWords.some(word => content.includes(word))) return "critical"
    if (importantWords.some(word => content.includes(word))) return "high"
    if (minorWords.some(word => content.includes(word))) return "low"

    return currentPriority // Keep current if no indicators
  }

  private classifyCategory(content: string): AICommentAnalysis["category"] {
    if (content.includes("design") || content.includes("visual") || content.includes("color")) {
      return "design"
    }
    if (content.includes("function") || content.includes("feature") || content.includes("workflow")) {
      return "functionality"
    }
    if (content.includes("text") || content.includes("content") || content.includes("copy")) {
      return "content"
    }
    if (content.includes("code") || content.includes("performance") || content.includes("bug")) {
      return "technical"
    }
    if (content.includes("process") || content.includes("workflow") || content.includes("procedure")) {
      return "process"
    }
    return "general"
  }

  private estimateEffort(content: string, themes: string[]): AICommentAnalysis["estimatedEffort"] {
    const complexWords = ["redesign", "rebuild", "architecture", "system", "complete"]
    const mediumWords = ["feature", "functionality", "improve", "enhance"]
    const smallWords = ["fix", "adjust", "tweak", "change"]
    const trivialWords = ["typo", "spelling", "minor", "small"]

    if (complexWords.some(word => content.includes(word))) return "epic"
    if (mediumWords.some(word => content.includes(word))) return "medium"
    if (smallWords.some(word => content.includes(word))) return "small"
    if (trivialWords.some(word => content.includes(word))) return "trivial"

    // Estimate based on themes
    if (themes.length > 2) return "large"
    if (themes.length > 1) return "medium"
    return "small"
  }

  private generateActionItems(content: string, themes: string[]): ActionItem[] {
    const actionItems: ActionItem[] = []

    themes.forEach((theme, index) => {
      actionItems.push({
        id: `action-${Date.now()}-${index}`,
        description: `Address ${theme.toLowerCase()} feedback`,
        priority: index === 0 ? "high" : "medium",
        estimatedTime: 30 + index * 15,
        tags: [theme.toLowerCase().replace(/\s+/g, "-")]
      })
    })

    return actionItems
  }

  private async generateSuggestions(
    comment: Comment,
    themes: string[],
    category: AICommentAnalysis["category"]
  ): Promise<AISuggestion[]> {
    const suggestions: AISuggestion[] = []

    // Add category-specific suggestions
    switch (category) {
      case "design":
        suggestions.push({
          type: "improvement",
          content: "Consider creating a design system component for consistency",
          confidence: 0.7
        })
        break
      case "functionality":
        suggestions.push({
          type: "question",
          content: "Would a progressive enhancement approach work here?",
          confidence: 0.6
        })
        break
      case "technical":
        suggestions.push({
          type: "resource",
          content: "Check the performance documentation for optimization guidelines",
          confidence: 0.8
        })
        break
    }

    return suggestions
  }

  private extractKeywords(content: string): string[] {
    const words = content.toLowerCase().split(/\s+/)
    const stopWords = new Set(["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by"])

    return words
      .filter(word => word.length > 2 && !stopWords.has(word))
      .filter((word, index, arr) => arr.indexOf(word) === index) // Remove duplicates
      .slice(0, 10) // Limit to top 10 keywords
  }

  private createFallbackAnalysis(comment: Comment): AICommentAnalysis {
    return {
      id: `fallback-${comment.id}`,
      commentId: comment.id,
      sentiment: "neutral",
      confidence: 0.5,
      themes: ["General Feedback"],
      suggestedPriority: comment.priority,
      actionItems: [],
      relatedComments: [],
      estimatedEffort: "small",
      category: "general",
      keywords: [],
      suggestions: [],
      timestamp: new Date().toISOString()
    }
  }

  private calculateInsights(comments: Comment[], analyses: AICommentAnalysis[]): CommentInsights {
    const totalComments = comments.length

    // Calculate average sentiment
    const sentimentScores = analyses.map(a => {
      switch (a.sentiment) {
        case "positive": return 1
        case "constructive": return 0.5
        case "neutral": return 0
        case "negative": return -1
        default: return 0
      }
    })
    const averageSentiment = sentimentScores.reduce((sum, score) => sum + score, 0) / sentimentScores.length

    // Calculate theme distribution
    const themeMap = new Map<string, { count: number; sentiment: number }>()
    analyses.forEach(analysis => {
      analysis.themes.forEach(theme => {
        const existing = themeMap.get(theme) || { count: 0, sentiment: 0 }
        const sentimentScore = sentimentScores[analyses.indexOf(analysis)]
        themeMap.set(theme, {
          count: existing.count + 1,
          sentiment: (existing.sentiment * existing.count + sentimentScore) / (existing.count + 1)
        })
      })
    })

    const topThemes = Array.from(themeMap.entries())
      .map(([theme, data]) => ({ theme, count: data.count, sentiment: data.sentiment }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Calculate distributions
    const priorityDistribution = comments.reduce((acc, comment) => {
      acc[comment.priority] = (acc[comment.priority] || 0) + 1
      return acc
    }, {} as Record<CommentPriority, number>)

    const statusDistribution = comments.reduce((acc, comment) => {
      acc[comment.status] = (acc[comment.status] || 0) + 1
      return acc
    }, {} as Record<CommentStatus, number>)

    return {
      totalComments,
      averageSentiment,
      topThemes,
      priorityDistribution,
      statusDistribution,
      timeToResolution: { average: 2.5, median: 2 }, // Mock data
      engagementMetrics: {
        averageReplies: comments.reduce((sum, c) => sum + c.replies.length, 0) / comments.length,
        averageReactions: 0, // Would calculate from reactions
        mostActiveUsers: [] // Would calculate from comment authors
      },
      trendAnalysis: {
        weeklyComments: [12, 15, 8, 20, 18, 10, 14], // Mock data
        weeklyResolutions: [10, 12, 8, 16, 15, 9, 11], // Mock data
        satisfactionTrend: [0.7, 0.75, 0.8, 0.72, 0.78, 0.82, 0.85] // Mock data
      }
    }
  }

  private createFallbackInsights(comments: Comment[]): CommentInsights {
    return {
      totalComments: comments.length,
      averageSentiment: 0,
      topThemes: [],
      priorityDistribution: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0
      },
      statusDistribution: {
        open: 0,
        in_progress: 0,
        resolved: 0,
        wont_fix: 0
      },
      timeToResolution: { average: 0, median: 0 },
      engagementMetrics: {
        averageReplies: 0,
        averageReactions: 0,
        mostActiveUsers: []
      },
      trendAnalysis: {
        weeklyComments: [],
        weeklyResolutions: [],
        satisfactionTrend: []
      }
    }
  }

  private analyzePriorityAdjustments(comments: Comment[], analyses: AICommentAnalysis[]): SmartRecommendation[] {
    const recommendations: SmartRecommendation[] = []

    analyses.forEach(analysis => {
      const comment = comments.find(c => c.id === analysis.commentId)
      if (!comment || comment.priority === analysis.suggestedPriority) return

      recommendations.push({
        id: `priority-${analysis.commentId}`,
        type: "priority_adjustment",
        title: `Adjust Priority: ${comment.priority} → ${analysis.suggestedPriority}`,
        description: `Based on content analysis, this comment should have ${analysis.suggestedPriority} priority`,
        confidence: analysis.confidence,
        impact: analysis.suggestedPriority === "critical" ? "high" : "medium",
        effort: "low",
        actions: {
          primary: `Change priority to ${analysis.suggestedPriority}`,
          secondary: "Review comment content"
        },
        reasoning: [`AI detected ${analysis.sentiment} sentiment`, `Themes: ${analysis.themes.join(", ")}`],
        affectedComments: [analysis.commentId]
      })
    })

    return recommendations
  }

  private analyzeStatusChanges(comments: Comment[], analyses: AICommentAnalysis[]): SmartRecommendation[] {
    // Implementation for status change recommendations
    return []
  }

  private analyzeAssignments(comments: Comment[], analyses: AICommentAnalysis[]): SmartRecommendation[] {
    // Implementation for assignment recommendations
    return []
  }

  private analyzeMergeOpportunities(comments: Comment[], analyses: AICommentAnalysis[]): SmartRecommendation[] {
    // Implementation for merge recommendations
    return []
  }
}

export const commentAnalysisService = new CommentAnalysisService()