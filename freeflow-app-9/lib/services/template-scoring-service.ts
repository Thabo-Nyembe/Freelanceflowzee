import { Template, TemplateAnalysis } from '@/components/collaboration/canvas-types'

export class TemplateAnalysisService {
  calculateTemplateScore(template: Template): TemplateAnalysis {
    let score = 0.5 // Base score

    // Check for market appeal indicators
    if (template.metadata?.license === 'premium') score += 0.2
    if ((template.metadata?.tags ?? []).length > 5) score += 0.1
    if (template.metadata?.category) score += 0.1
    if ((template.aiStyle?.brandConsistency?.score ?? 0) > 0.8) score += 0.1

    // Generate suggestions based on the analysis
    const suggestions: string[] = []

    if (!template.metadata?.license) {
      suggestions.push('Consider adding a license to increase market appeal')
    }

    if (!template.metadata?.tags || template.metadata.tags.length < 5) {
      suggestions.push('Add more descriptive tags to improve discoverability')
    }

    if (!template.metadata?.category) {
      suggestions.push('Specify a category to help users find your template')
    }

    if (!template.aiStyle?.brandConsistency?.score) {
      suggestions.push('Run brand consistency analysis to improve template quality')
    }

    return {
      score: Math.min(1, score),
      suggestions
    }
  }
}
