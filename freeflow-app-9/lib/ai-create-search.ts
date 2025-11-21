/**
 * AI CREATE A++++ SEARCH & FILTER UTILITIES
 * Advanced search and filtering for generation history
 */

import type { Generation } from './ai-create-persistence'

export type SortOption = 'recent' | 'oldest' | 'cost-high' | 'cost-low' | 'tokens-high' | 'tokens-low' | 'favorite'
export type FilterCategory = 'all' | string

export interface SearchFilters {
  query: string
  category: FilterCategory
  model: string
  dateFrom?: Date
  dateTo?: Date
  minTokens?: number
  maxTokens?: number
  minCost?: number
  maxCost?: number
  favoritesOnly: boolean
  archivedOnly: boolean
  tags: string[]
}

/**
 * Search generations by text query
 */
export function searchGenerations(generations: Generation[], query: string): Generation[] {
  if (!query.trim()) return generations

  const searchLower = query.toLowerCase()

  return generations.filter(gen => {
    // Search in title
    if (gen.title.toLowerCase().includes(searchLower)) return true

    // Search in content
    if (gen.content.toLowerCase().includes(searchLower)) return true

    // Search in model name
    if (gen.model.toLowerCase().includes(searchLower)) return true

    // Search in type/template
    if (gen.type.toLowerCase().includes(searchLower)) return true

    // Search in tags
    if (gen.tags?.some(tag => tag.toLowerCase().includes(searchLower))) return true

    return false
  })
}

/**
 * Filter generations by category
 */
export function filterByCategory(generations: Generation[], category: FilterCategory): Generation[] {
  if (category === 'all') return generations
  return generations.filter(gen => gen.type === category)
}

/**
 * Filter generations by model
 */
export function filterByModel(generations: Generation[], model: string): Generation[] {
  if (model === 'all') return generations
  return generations.filter(gen => gen.model === model)
}

/**
 * Filter generations by date range
 */
export function filterByDateRange(
  generations: Generation[],
  dateFrom?: Date,
  dateTo?: Date
): Generation[] {
  if (!dateFrom && !dateTo) return generations

  return generations.filter(gen => {
    const genDate = new Date(gen.timestamp)

    if (dateFrom && genDate < dateFrom) return false
    if (dateTo && genDate > dateTo) return false

    return true
  })
}

/**
 * Filter generations by token range
 */
export function filterByTokenRange(
  generations: Generation[],
  minTokens?: number,
  maxTokens?: number
): Generation[] {
  if (minTokens === undefined && maxTokens === undefined) return generations

  return generations.filter(gen => {
    if (minTokens !== undefined && gen.tokens < minTokens) return false
    if (maxTokens !== undefined && gen.tokens > maxTokens) return false
    return true
  })
}

/**
 * Filter generations by cost range
 */
export function filterByCostRange(
  generations: Generation[],
  minCost?: number,
  maxCost?: number
): Generation[] {
  if (minCost === undefined && maxCost === undefined) return generations

  return generations.filter(gen => {
    if (minCost !== undefined && gen.cost < minCost) return false
    if (maxCost !== undefined && gen.cost > maxCost) return false
    return true
  })
}

/**
 * Filter favorites only
 */
export function filterFavorites(generations: Generation[], favoritesOnly: boolean): Generation[] {
  if (!favoritesOnly) return generations
  return generations.filter(gen => gen.favorite === true)
}

/**
 * Filter archived only
 */
export function filterArchived(generations: Generation[], archivedOnly: boolean): Generation[] {
  if (!archivedOnly) return generations
  return generations.filter(gen => gen.archived === true)
}

/**
 * Filter by tags
 */
export function filterByTags(generations: Generation[], tags: string[]): Generation[] {
  if (!tags.length) return generations

  return generations.filter(gen => {
    if (!gen.tags || !gen.tags.length) return false
    return tags.some(tag => gen.tags.includes(tag))
  })
}

/**
 * Sort generations
 */
export function sortGenerations(generations: Generation[], sortBy: SortOption): Generation[] {
  const sorted = [...generations]

  switch (sortBy) {
    case 'recent':
      return sorted.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    case 'oldest':
      return sorted.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    case 'cost-high':
      return sorted.sort((a, b) => b.cost - a.cost)

    case 'cost-low':
      return sorted.sort((a, b) => a.cost - b.cost)

    case 'tokens-high':
      return sorted.sort((a, b) => b.tokens - a.tokens)

    case 'tokens-low':
      return sorted.sort((a, b) => a.tokens - b.tokens)

    case 'favorite':
      return sorted.sort((a, b) => {
        if (a.favorite && !b.favorite) return -1
        if (!a.favorite && b.favorite) return 1
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      })

    default:
      return sorted
  }
}

/**
 * Apply all filters and search
 */
export function applyAllFilters(
  generations: Generation[],
  filters: SearchFilters,
  sortBy: SortOption
): Generation[] {
  let filtered = generations

  // Apply text search
  if (filters.query) {
    filtered = searchGenerations(filtered, filters.query)
  }

  // Apply category filter
  if (filters.category && filters.category !== 'all') {
    filtered = filterByCategory(filtered, filters.category)
  }

  // Apply model filter
  if (filters.model && filters.model !== 'all') {
    filtered = filterByModel(filtered, filters.model)
  }

  // Apply date range filter
  if (filters.dateFrom || filters.dateTo) {
    filtered = filterByDateRange(filtered, filters.dateFrom, filters.dateTo)
  }

  // Apply token range filter
  if (filters.minTokens !== undefined || filters.maxTokens !== undefined) {
    filtered = filterByTokenRange(filtered, filters.minTokens, filters.maxTokens)
  }

  // Apply cost range filter
  if (filters.minCost !== undefined || filters.maxCost !== undefined) {
    filtered = filterByCostRange(filtered, filters.minCost, filters.maxCost)
  }

  // Apply favorites filter
  if (filters.favoritesOnly) {
    filtered = filterFavorites(filtered, true)
  }

  // Apply archived filter
  if (filters.archivedOnly) {
    filtered = filterArchived(filtered, true)
  }

  // Apply tags filter
  if (filters.tags.length > 0) {
    filtered = filterByTags(filtered, filters.tags)
  }

  // Apply sorting
  filtered = sortGenerations(filtered, sortBy)

  return filtered
}

/**
 * Get unique categories from generations
 */
export function getUniqueCategories(generations: Generation[]): string[] {
  const categories = new Set<string>()
  generations.forEach(gen => categories.add(gen.type))
  return Array.from(categories).sort()
}

/**
 * Get unique models from generations
 */
export function getUniqueModels(generations: Generation[]): string[] {
  const models = new Set<string>()
  generations.forEach(gen => models.add(gen.model))
  return Array.from(models).sort()
}

/**
 * Get unique tags from generations
 */
export function getUniqueTags(generations: Generation[]): string[] {
  const tags = new Set<string>()
  generations.forEach(gen => {
    gen.tags?.forEach(tag => tags.add(tag))
  })
  return Array.from(tags).sort()
}

/**
 * Get filter statistics
 */
export function getFilterStats(generations: Generation[], filters: SearchFilters) {
  const filtered = applyAllFilters(generations, filters, 'recent')

  return {
    total: generations.length,
    filtered: filtered.length,
    percentage: generations.length > 0 ? (filtered.length / generations.length) * 100 : 0,
    categories: getUniqueCategories(filtered),
    models: getUniqueModels(filtered),
    tags: getUniqueTags(filtered),
    totalTokens: filtered.reduce((sum, gen) => sum + gen.tokens, 0),
    totalCost: filtered.reduce((sum, gen) => sum + gen.cost, 0),
    avgTokens: filtered.length > 0 ? filtered.reduce((sum, gen) => sum + gen.tokens, 0) / filtered.length : 0,
    avgCost: filtered.length > 0 ? filtered.reduce((sum, gen) => sum + gen.cost, 0) / filtered.length : 0
  }
}

/**
 * Create default filters
 */
export function createDefaultFilters(): SearchFilters {
  return {
    query: '',
    category: 'all',
    model: 'all',
    dateFrom: undefined,
    dateTo: undefined,
    minTokens: undefined,
    maxTokens: undefined,
    minCost: undefined,
    maxCost: undefined,
    favoritesOnly: false,
    archivedOnly: false,
    tags: []
  }
}

/**
 * Check if any filters are active
 */
export function hasActiveFilters(filters: SearchFilters): boolean {
  return !!(
    filters.query ||
    (filters.category && filters.category !== 'all') ||
    (filters.model && filters.model !== 'all') ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.minTokens !== undefined ||
    filters.maxTokens !== undefined ||
    filters.minCost !== undefined ||
    filters.maxCost !== undefined ||
    filters.favoritesOnly ||
    filters.archivedOnly ||
    filters.tags.length > 0
  )
}

/**
 * Clear all filters
 */
export function clearAllFilters(): SearchFilters {
  return createDefaultFilters()
}
