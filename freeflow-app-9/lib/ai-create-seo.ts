/**
 * AI CREATE A++++ SEO ANALYSIS ENGINE
 * Content analysis and SEO scoring
 */

export interface SEOAnalysisResult {
  score: number // 0-100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F'
  wordCount: number
  characterCount: number
  sentenceCount: number
  paragraphCount: number
  readabilityScore: number
  readabilityGrade: string
  keywordDensity: Record<string, number>
  topKeywords: Array<{ word: string; count: number; density: number }>
  headings: {
    h1: number
    h2: number
    h3: number
  }
  issues: string[]
  suggestions: string[]
  strengths: string[]
}

/**
 * Comprehensive SEO analysis of content
 */
export function analyzeSEO(content: string, targetKeyword?: string): SEOAnalysisResult {
  const words = extractWords(content)
  const sentences = extractSentences(content)
  const paragraphs = extractParagraphs(content)

  const wordCount = words.length
  const characterCount = content.length
  const sentenceCount = sentences.length
  const paragraphCount = paragraphs.length

  // Calculate readability (Flesch Reading Ease)
  const readabilityScore = calculateFleschScore(content, words, sentences)
  const readabilityGrade = getReadabilityGrade(readabilityScore)

  // Analyze keyword density
  const keywordDensity = calculateKeywordDensity(words)
  const topKeywords = getTopKeywords(keywordDensity, wordCount)

  // Analyze headings
  const headings = analyzeHeadings(content)

  // Identify issues and suggestions
  const issues: string[] = []
  const suggestions: string[] = []
  const strengths: string[] = []

  // Word count check
  if (wordCount < 300) {
    issues.push('Content is too short (< 300 words)')
    suggestions.push('Add more content to reach at least 300-500 words for better SEO')
  } else if (wordCount >= 300 && wordCount < 1000) {
    strengths.push(`Good word count (${wordCount} words)`)
  } else if (wordCount >= 1000) {
    strengths.push(`Excellent word count (${wordCount} words) - great for SEO!`)
  }

  // Readability check
  if (readabilityScore < 30) {
    issues.push('Content is very difficult to read')
    suggestions.push('Simplify sentences and use shorter words to improve readability')
  } else if (readabilityScore >= 30 && readabilityScore < 50) {
    suggestions.push('Content is challenging to read - consider simplifying')
  } else if (readabilityScore >= 60 && readabilityScore < 80) {
    strengths.push('Good readability - easy to understand')
  } else if (readabilityScore >= 80) {
    strengths.push('Excellent readability - very easy to read!')
  }

  // Paragraph length check
  const avgParagraphLength = wordCount / paragraphCount
  if (avgParagraphLength > 150) {
    issues.push('Paragraphs are too long')
    suggestions.push('Break up long paragraphs (aim for 50-100 words per paragraph)')
  } else if (avgParagraphLength >= 50 && avgParagraphLength <= 100) {
    strengths.push('Well-structured paragraphs')
  }

  // Sentence length check
  const avgSentenceLength = wordCount / sentenceCount
  if (avgSentenceLength > 25) {
    issues.push('Sentences are too long')
    suggestions.push('Use shorter sentences (aim for 15-20 words per sentence)')
  } else if (avgSentenceLength >= 15 && avgSentenceLength <= 20) {
    strengths.push('Good sentence length for readability')
  }

  // Heading structure check
  if (headings.h1 === 0) {
    issues.push('Missing H1 heading')
    suggestions.push('Add an H1 heading for better SEO structure')
  } else if (headings.h1 > 1) {
    issues.push('Multiple H1 headings detected')
    suggestions.push('Use only one H1 heading per page')
  } else {
    strengths.push('Proper H1 usage')
  }

  if (headings.h2 === 0 && wordCount > 500) {
    suggestions.push('Add H2 subheadings to break up content and improve structure')
  } else if (headings.h2 > 0) {
    strengths.push(`Good use of ${headings.h2} H2 subheadings`)
  }

  // Keyword density check (target keyword if provided)
  if (targetKeyword) {
    const targetDensity = keywordDensity[targetKeyword.toLowerCase()] || 0
    const targetDensityPercent = (targetDensity / wordCount) * 100

    if (targetDensityPercent < 0.5) {
      issues.push(`Target keyword "${targetKeyword}" appears too rarely`)
      suggestions.push(`Use "${targetKeyword}" more frequently (aim for 1-2% density)`)
    } else if (targetDensityPercent > 3) {
      issues.push(`Target keyword "${targetKeyword}" used too frequently (keyword stuffing)`)
      suggestions.push(`Reduce usage of "${targetKeyword}" to avoid penalties`)
    } else {
      strengths.push(`Good keyword density for "${targetKeyword}"`)
    }
  }

  // Calculate overall score (0-100)
  const score = calculateSEOScore({
    wordCount,
    readabilityScore,
    hasH1: headings.h1 === 1,
    hasH2: headings.h2 > 0,
    avgSentenceLength,
    avgParagraphLength,
    issuesCount: issues.length
  })

  const grade = getSEOGrade(score)

  return {
    score,
    grade,
    wordCount,
    characterCount,
    sentenceCount,
    paragraphCount,
    readabilityScore,
    readabilityGrade,
    keywordDensity,
    topKeywords,
    headings,
    issues,
    suggestions,
    strengths
  }
}

/**
 * Extract words from content
 */
function extractWords(content: string): string[] {
  return content
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0 && word.length < 50) // Filter out very long "words"
}

/**
 * Extract sentences from content
 */
function extractSentences(content: string): string[] {
  return content
    .split(/[.!?]+/)
    .filter(sentence => sentence.trim().length > 0)
}

/**
 * Extract paragraphs from content
 */
function extractParagraphs(content: string): string[] {
  return content
    .split(/\n\n+/)
    .filter(para => para.trim().length > 0)
}

/**
 * Calculate Flesch Reading Ease score
 * Score 90-100: Very Easy
 * Score 80-89: Easy
 * Score 70-79: Fairly Easy
 * Score 60-69: Standard
 * Score 50-59: Fairly Difficult
 * Score 30-49: Difficult
 * Score 0-29: Very Confusing
 */
function calculateFleschScore(content: string, words: string[], sentences: string[]): number {
  if (words.length === 0 || sentences.length === 0) return 0

  const totalSyllables = words.reduce((sum, word) => sum + countSyllables(word), 0)
  const avgSyllablesPerWord = totalSyllables / words.length
  const avgWordsPerSentence = words.length / sentences.length

  const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)

  return Math.max(0, Math.min(100, score))
}

/**
 * Count syllables in a word (simplified algorithm)
 */
function countSyllables(word: string): number {
  word = word.toLowerCase()
  if (word.length <= 3) return 1

  // Remove silent e
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')

  // Count vowel groups
  const vowelGroups = word.match(/[aeiouy]{1,2}/g)
  return vowelGroups ? vowelGroups.length : 1
}

/**
 * Get readability grade label
 */
function getReadabilityGrade(score: number): string {
  if (score >= 90) return 'Very Easy (5th grade)'
  if (score >= 80) return 'Easy (6th grade)'
  if (score >= 70) return 'Fairly Easy (7th grade)'
  if (score >= 60) return 'Standard (8th-9th grade)'
  if (score >= 50) return 'Fairly Difficult (10th-12th grade)'
  if (score >= 30) return 'Difficult (College)'
  return 'Very Confusing (College graduate)'
}

/**
 * Calculate keyword density for all words
 */
function calculateKeywordDensity(words: string[]): Record<string, number> {
  const density: Record<string, number> = {}

  // Common words to ignore
  const stopWords = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
    'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
    'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
    'into', 'your', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now',
    'only', 'come', 'its', 'over', 'also', 'back', 'after', 'use', 'two', 'how',
    'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any',
    'these', 'give', 'day', 'most', 'us', 'is', 'was', 'are', 'been', 'has', 'had',
    'were', 'said', 'did', 'having', 'may', 'should', 'am', 'being', 'might', 'must'
  ])

  words.forEach(word => {
    if (word.length >= 3 && !stopWords.has(word)) {
      density[word] = (density[word] || 0) + 1
    }
  })

  return density
}

/**
 * Get top keywords by frequency
 */
function getTopKeywords(
  density: Record<string, number>,
  totalWords: number,
  limit: number = 10
): Array<{ word: string; count: number; density: number }> {
  return Object.entries(density)
    .map(([word, count]) => ({
      word,
      count,
      density: (count / totalWords) * 100
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

/**
 * Analyze heading structure in content
 */
function analyzeHeadings(content: string): { h1: number; h2: number; h3: number } {
  // Simple heading detection (works for Markdown and plain text)
  const h1Count = (content.match(/^#\s+.+$/gm) || []).length
  const h2Count = (content.match(/^##\s+.+$/gm) || []).length
  const h3Count = (content.match(/^###\s+.+$/gm) || []).length

  return {
    h1: h1Count,
    h2: h2Count,
    h3: h3Count
  }
}

/**
 * Calculate overall SEO score (0-100)
 */
function calculateSEOScore(factors: {
  wordCount: number
  readabilityScore: number
  hasH1: boolean
  hasH2: boolean
  avgSentenceLength: number
  avgParagraphLength: number
  issuesCount: number
}): number {
  let score = 0

  // Word count (20 points max)
  if (factors.wordCount >= 1000) score += 20
  else if (factors.wordCount >= 500) score += 15
  else if (factors.wordCount >= 300) score += 10
  else score += 5

  // Readability (25 points max)
  score += Math.min(25, factors.readabilityScore / 4)

  // Heading structure (20 points max)
  if (factors.hasH1) score += 10
  if (factors.hasH2) score += 10

  // Sentence length (15 points max)
  if (factors.avgSentenceLength >= 15 && factors.avgSentenceLength <= 20) score += 15
  else if (factors.avgSentenceLength >= 10 && factors.avgSentenceLength <= 25) score += 10
  else score += 5

  // Paragraph length (10 points max)
  if (factors.avgParagraphLength >= 50 && factors.avgParagraphLength <= 100) score += 10
  else if (factors.avgParagraphLength >= 30 && factors.avgParagraphLength <= 150) score += 7
  else score += 3

  // Deduct for issues (10 points max deduction)
  score -= Math.min(10, factors.issuesCount * 3)

  return Math.max(0, Math.min(100, Math.round(score)))
}

/**
 * Get SEO grade based on score
 */
function getSEOGrade(score: number): 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 95) return 'A+'
  if (score >= 85) return 'A'
  if (score >= 70) return 'B'
  if (score >= 55) return 'C'
  if (score >= 40) return 'D'
  return 'F'
}

/**
 * Generate meta description from content
 */
export function generateMetaDescription(content: string, maxLength: number = 160): string {
  // Extract first meaningful sentence or paragraph
  const cleaned = content.replace(/[#*_`]/g, '').trim()
  const firstParagraph = cleaned.split('\n\n')[0]
  const sentences = firstParagraph.split(/[.!?]/)

  let description = sentences[0].trim()

  // Add more sentences if under length
  for (let i = 1; i < sentences.length && description.length < maxLength; i++) {
    const nextSentence = sentences[i].trim()
    if (description.length + nextSentence.length + 2 <= maxLength) {
      description += '. ' + nextSentence
    }
  }

  // Truncate if needed
  if (description.length > maxLength) {
    description = description.substring(0, maxLength - 3) + '...'
  }

  return description
}

/**
 * Generate suggested tags from content
 */
export function generateTags(content: string, limit: number = 10): string[] {
  const words = extractWords(content)
  const density = calculateKeywordDensity(words)
  const topKeywords = getTopKeywords(density, words.length, limit)

  return topKeywords.map(k => k.word)
}
