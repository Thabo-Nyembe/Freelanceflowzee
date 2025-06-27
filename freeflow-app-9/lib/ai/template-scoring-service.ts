import { AIAnalysisResult } from '@/components/collaboration/types'

export interface TemplateAnalysis {
  overallScore: number
  technicalQuality: number
  creativityScore: number
  marketDemand: number
  suggestions: string[]
}

export class TemplateAnalysisService {
  calculateTemplateScore(template: Record<string, unknown>): TemplateAnalysis {
    // Base scores
    const technicalScore = this.calculateTechnicalScore(template)
    const creativityScore = this.calculateCreativityScore(template)
    const marketScore = this.calculateMarketScore(template)
    
    // Overall score is weighted average
    const overallScore = Math.round(
      (technicalScore * 0.4 + creativityScore * 0.3 + marketScore * 0.3) * 100
    ) / 100

    return {
      overallScore,
      technicalQuality: technicalScore,
      creativityScore,
      marketDemand: marketScore,
      suggestions: this.generateSuggestions(template, {
        technicalScore,
        creativityScore,
        marketScore
      })
    }
  }

  private calculateTechnicalScore(template: Record<string, unknown>): number {
    let score = 0.7 // Base score

    // Check for technical quality indicators
    if (template.complexity === 'high') score += 0.1
    if (template.aiGenerated) score += 0.05
    if (template.metadata?.fileInfo?.format === 'vector') score += 0.05
    if (template.effects?.shadow || template.effects?.glow) score += 0.05
    if (template.transform?.perspective) score += 0.05

    return Math.min(1, score)
  }

  private calculateCreativityScore(template: Record<string, unknown>): number {
    let score = 0.6 // Base score

    // Check for creative elements
    if (template.effects?.overlay) score += 0.1
    if (template.animation) score += 0.1
    if (template.filters) score += 0.1
    if (template.blendMode && template.blendMode !== 'normal') score += 0.1

    return Math.min(1, score)
  }

  private calculateMarketScore(template: Record<string, unknown>): number {
    let score = 0.5 // Base score

    // Check for market appeal indicators
    if (template.metadata?.license === 'premium') score += 0.2
    if (template.metadata?.tags?.length > 5) score += 0.1
    if (template.metadata?.category) score += 0.1
    if (template.aiStyle?.brandConsistency?.score > 0.8) score += 0.1

    return Math.min(1, score)
  }

  private generateSuggestions(
    template: Record<string, unknown>,
    scores: { technicalScore: number; creativityScore: number; marketScore: number }
  ): string[] {
    const suggestions: string[] = []

    // Technical suggestions
    if (scores.technicalScore < 0.8) {
      suggestions.push('Consider optimizing technical aspects like resolution and format')
      suggestions.push('Add more advanced effects and transformations')
    }

    // Creativity suggestions
    if (scores.creativityScore < 0.8) {
      suggestions.push('Experiment with different blend modes and effects')
      suggestions.push('Add animations to make the template more dynamic')
    }

    // Market suggestions
    if (scores.marketScore < 0.8) {
      suggestions.push('Add more detailed metadata and tags')
      suggestions.push('Consider upgrading to premium quality assets')
    }

    return suggestions
  }
} 