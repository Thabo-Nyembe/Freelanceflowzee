/**
 * Knowledge Base System - Database Queries
 *
 * Comprehensive query library for help center, documentation, and tutorials
 * with full-text search, analytics, and content management.
 *
 * Database Schema: 12 tables
 * - kb_categories: Categories for organizing content
 * - kb_articles: Help articles and documentation
 * - kb_article_versions: Version history for articles
 * - kb_video_tutorials: Video tutorials and guides
 * - kb_faqs: Frequently asked questions
 * - kb_article_feedback: User feedback on articles
 * - kb_video_feedback: User feedback on videos
 * - kb_search_queries: Search query tracking
 * - kb_article_views: Article view analytics
 * - kb_video_views: Video view analytics
 * - kb_bookmarks: User bookmarks
 * - kb_suggested_topics: User-suggested content topics
 */

import { createClient } from '@/lib/supabase/client'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type ArticleStatus = 'draft' | 'published' | 'archived' | 'scheduled'
export type ContentType = 'article' | 'video' | 'faq' | 'guide' | 'tutorial'
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced'
export type FeedbackType = 'helpful' | 'not_helpful'
export type SuggestionStatus = 'pending' | 'planned' | 'in-progress' | 'completed' | 'rejected'

export interface KBCategory {
  id: string
  user_id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string | null
  parent_id: string | null
  sort_order: number
  is_visible: boolean
  is_featured: boolean
  article_count: number
  total_views: number
  created_at: string
  updated_at: string
}

export interface KBArticle {
  id: string
  user_id: string
  category_id: string | null
  title: string
  slug: string
  description: string | null
  content: string
  excerpt: string | null
  status: ArticleStatus
  content_type: ContentType
  difficulty_level: DifficultyLevel
  meta_title: string | null
  meta_description: string | null
  keywords: string[]
  author_id: string | null
  published_at: string | null
  scheduled_for: string | null
  read_time_minutes: number
  views: number
  unique_views: number
  helpful_count: number
  not_helpful_count: number
  rating: number
  tags: string[]
  related_article_ids: string[]
  is_featured: boolean
  is_popular: boolean
  version: number
  last_reviewed_at: string | null
  reviewed_by: string | null
  created_at: string
  updated_at: string
}

export interface KBArticleVersion {
  id: string
  article_id: string
  version_number: number
  title: string
  content: string
  description: string | null
  changed_by: string | null
  change_summary: string | null
  created_at: string
}

export interface KBVideoTutorial {
  id: string
  user_id: string
  category_id: string | null
  title: string
  slug: string
  description: string | null
  video_url: string
  thumbnail_url: string | null
  duration: string | null
  duration_seconds: number | null
  status: ArticleStatus
  difficulty_level: DifficultyLevel
  views: number
  likes: number
  tags: string[]
  related_video_ids: string[]
  related_article_ids: string[]
  is_featured: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface KBFAQ {
  id: string
  user_id: string
  category_id: string | null
  question: string
  answer: string
  status: ArticleStatus
  views: number
  helpful_count: number
  not_helpful_count: number
  sort_order: number
  is_featured: boolean
  tags: string[]
  created_at: string
  updated_at: string
}

export interface KBArticleFeedback {
  id: string
  article_id: string
  user_id: string
  feedback_type: FeedbackType
  rating: number | null
  comment: string | null
  created_at: string
}

export interface KBBookmark {
  id: string
  user_id: string
  article_id: string | null
  video_id: string | null
  notes: string | null
  folder: string | null
  tags: string[]
  created_at: string
}

export interface KBSuggestedTopic {
  id: string
  user_id: string | null
  title: string
  description: string | null
  category_suggestion: string | null
  votes: number
  status: SuggestionStatus
  admin_notes: string | null
  assigned_to: string | null
  created_at: string
  updated_at: string
}

// ============================================================================
// CATEGORY QUERIES
// ============================================================================

/**
 * Get all categories with optional filtering
 */
export async function getCategories(filters?: {
  parent_id?: string | null
  is_visible?: boolean
  is_featured?: boolean
}): Promise<KBCategory[]> {
  const supabase = createClient()

  let query = supabase
    .from('kb_categories')
    .select('*')
    .order('sort_order', { ascending: true })

  if (filters?.parent_id !== undefined) {
    query = query.eq('parent_id', filters.parent_id)
  }

  if (filters?.is_visible !== undefined) {
    query = query.eq('is_visible', filters.is_visible)
  }

  if (filters?.is_featured !== undefined) {
    query = query.eq('is_featured', filters.is_featured)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

/**
 * Get a single category by ID or slug
 */
export async function getCategory(idOrSlug: string): Promise<KBCategory | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('kb_categories')
    .select('*')
    .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
    .single()

  if (error) throw error
  return data
}

/**
 * Create a new category
 */
export async function createCategory(category: {
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  parent_id?: string
  is_visible?: boolean
  is_featured?: boolean
}): Promise<KBCategory> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('kb_categories')
    .insert({
      ...category,
      user_id: user.id
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update a category
 */
export async function updateCategory(
  categoryId: string,
  updates: Partial<Omit<KBCategory, 'id' | 'user_id' | 'created_at'>>
): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('kb_categories')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', categoryId)
    .eq('user_id', user.id)

  if (error) throw error
}

/**
 * Delete a category
 */
export async function deleteCategory(categoryId: string): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('kb_categories')
    .delete()
    .eq('id', categoryId)
    .eq('user_id', user.id)

  if (error) throw error
}

// ============================================================================
// ARTICLE QUERIES
// ============================================================================

/**
 * Get articles with optional filtering and search
 */
export async function getArticles(filters?: {
  category_id?: string
  status?: ArticleStatus
  difficulty_level?: DifficultyLevel
  tags?: string[]
  search?: string
  is_featured?: boolean
  is_popular?: boolean
  limit?: number
  offset?: number
}): Promise<KBArticle[]> {
  const supabase = createClient()

  let query = supabase
    .from('kb_articles')
    .select('*')
    .order('created_at', { ascending: false })

  if (filters?.category_id) {
    query = query.eq('category_id', filters.category_id)
  }

  if (filters?.status) {
    query = query.eq('status', filters.status)
  } else {
    // Default to published only for non-authenticated or non-owner users
    query = query.eq('status', 'published')
  }

  if (filters?.difficulty_level) {
    query = query.eq('difficulty_level', filters.difficulty_level)
  }

  if (filters?.is_featured !== undefined) {
    query = query.eq('is_featured', filters.is_featured)
  }

  if (filters?.is_popular !== undefined) {
    query = query.eq('is_popular', filters.is_popular)
  }

  if (filters?.tags && filters.tags.length > 0) {
    query = query.contains('tags', filters.tags)
  }

  if (filters?.search) {
    query = query.textSearch('title', filters.search, {
      type: 'websearch',
      config: 'english'
    })
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

/**
 * Get a single article by ID or slug
 */
export async function getArticle(idOrSlug: string): Promise<KBArticle | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('kb_articles')
    .select('*')
    .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
    .single()

  if (error) throw error
  return data
}

/**
 * Create a new article
 */
export async function createArticle(article: {
  title: string
  slug: string
  content: string
  description?: string
  category_id?: string
  status?: ArticleStatus
  content_type?: ContentType
  difficulty_level?: DifficultyLevel
  tags?: string[]
  read_time_minutes?: number
}): Promise<KBArticle> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('kb_articles')
    .insert({
      ...article,
      user_id: user.id,
      author_id: user.id
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update an article
 */
export async function updateArticle(
  articleId: string,
  updates: Partial<Omit<KBArticle, 'id' | 'user_id' | 'created_at'>>
): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('kb_articles')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', articleId)
    .eq('user_id', user.id)

  if (error) throw error
}

/**
 * Delete an article
 */
export async function deleteArticle(articleId: string): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('kb_articles')
    .delete()
    .eq('id', articleId)
    .eq('user_id', user.id)

  if (error) throw error
}

/**
 * Publish an article
 */
export async function publishArticle(articleId: string): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('kb_articles')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', articleId)
    .eq('user_id', user.id)

  if (error) throw error
}

/**
 * Increment article view count
 */
export async function incrementArticleViews(articleId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('kb_articles')
    .update({
      views: supabase.sql`views + 1`
    })
    .eq('id', articleId)

  if (error) throw error
}

/**
 * Get related articles
 */
export async function getRelatedArticles(articleId: string, limit: number = 5): Promise<KBArticle[]> {
  const supabase = createClient()

  // First get the article to find its tags and category
  const article = await getArticle(articleId)
  if (!article) return []

  let query = supabase
    .from('kb_articles')
    .select('*')
    .eq('status', 'published')
    .neq('id', articleId)
    .limit(limit)

  // Prioritize same category
  if (article.category_id) {
    query = query.eq('category_id', article.category_id)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

// ============================================================================
// VIDEO TUTORIAL QUERIES
// ============================================================================

/**
 * Get video tutorials with filtering
 */
export async function getVideoTutorials(filters?: {
  category_id?: string
  status?: ArticleStatus
  difficulty_level?: DifficultyLevel
  is_featured?: boolean
  tags?: string[]
  limit?: number
}): Promise<KBVideoTutorial[]> {
  const supabase = createClient()

  let query = supabase
    .from('kb_video_tutorials')
    .select('*')
    .order('created_at', { ascending: false })

  if (filters?.category_id) {
    query = query.eq('category_id', filters.category_id)
  }

  if (filters?.status) {
    query = query.eq('status', filters.status)
  } else {
    query = query.eq('status', 'published')
  }

  if (filters?.difficulty_level) {
    query = query.eq('difficulty_level', filters.difficulty_level)
  }

  if (filters?.is_featured !== undefined) {
    query = query.eq('is_featured', filters.is_featured)
  }

  if (filters?.tags && filters.tags.length > 0) {
    query = query.contains('tags', filters.tags)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

/**
 * Get a single video tutorial
 */
export async function getVideoTutorial(idOrSlug: string): Promise<KBVideoTutorial | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('kb_video_tutorials')
    .select('*')
    .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
    .single()

  if (error) throw error
  return data
}

/**
 * Create a video tutorial
 */
export async function createVideoTutorial(video: {
  title: string
  slug: string
  video_url: string
  description?: string
  category_id?: string
  thumbnail_url?: string
  duration?: string
  difficulty_level?: DifficultyLevel
  tags?: string[]
}): Promise<KBVideoTutorial> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('kb_video_tutorials')
    .insert({
      ...video,
      user_id: user.id
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update a video tutorial
 */
export async function updateVideoTutorial(
  videoId: string,
  updates: Partial<Omit<KBVideoTutorial, 'id' | 'user_id' | 'created_at'>>
): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('kb_video_tutorials')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', videoId)
    .eq('user_id', user.id)

  if (error) throw error
}

/**
 * Increment video view count
 */
export async function incrementVideoViews(videoId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('kb_video_tutorials')
    .update({
      views: supabase.sql`views + 1`
    })
    .eq('id', videoId)

  if (error) throw error
}

// ============================================================================
// FAQ QUERIES
// ============================================================================

/**
 * Get FAQs with filtering
 */
export async function getFAQs(filters?: {
  category_id?: string
  is_featured?: boolean
  tags?: string[]
  limit?: number
}): Promise<KBFAQ[]> {
  const supabase = createClient()

  let query = supabase
    .from('kb_faqs')
    .select('*')
    .eq('status', 'published')
    .order('sort_order', { ascending: true })

  if (filters?.category_id) {
    query = query.eq('category_id', filters.category_id)
  }

  if (filters?.is_featured !== undefined) {
    query = query.eq('is_featured', filters.is_featured)
  }

  if (filters?.tags && filters.tags.length > 0) {
    query = query.contains('tags', filters.tags)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

/**
 * Create a FAQ
 */
export async function createFAQ(faq: {
  question: string
  answer: string
  category_id?: string
  tags?: string[]
  sort_order?: number
}): Promise<KBFAQ> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('kb_faqs')
    .insert({
      ...faq,
      user_id: user.id
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update a FAQ
 */
export async function updateFAQ(
  faqId: string,
  updates: Partial<Omit<KBFAQ, 'id' | 'user_id' | 'created_at'>>
): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('kb_faqs')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', faqId)
    .eq('user_id', user.id)

  if (error) throw error
}

/**
 * Delete a FAQ
 */
export async function deleteFAQ(faqId: string): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('kb_faqs')
    .delete()
    .eq('id', faqId)
    .eq('user_id', user.id)

  if (error) throw error
}

// ============================================================================
// FEEDBACK QUERIES
// ============================================================================

/**
 * Submit article feedback
 */
export async function submitArticleFeedback(feedback: {
  article_id: string
  feedback_type: FeedbackType
  rating?: number
  comment?: string
}): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('kb_article_feedback')
    .insert({
      ...feedback,
      user_id: user.id
    })

  if (error) throw error

  // Update article helpful/not helpful counts
  const updateField = feedback.feedback_type === 'helpful' ? 'helpful_count' : 'not_helpful_count'
  await supabase
    .from('kb_articles')
    .update({
      [updateField]: supabase.sql`${updateField} + 1`
    })
    .eq('id', feedback.article_id)
}

/**
 * Submit video feedback
 */
export async function submitVideoFeedback(feedback: {
  video_id: string
  is_helpful: boolean
  comment?: string
}): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('kb_video_feedback')
    .insert({
      ...feedback,
      user_id: user.id
    })

  if (error) throw error

  // Update video likes if helpful
  if (feedback.is_helpful) {
    await supabase
      .from('kb_video_tutorials')
      .update({
        likes: supabase.sql`likes + 1`
      })
      .eq('id', feedback.video_id)
  }
}

// ============================================================================
// BOOKMARK QUERIES
// ============================================================================

/**
 * Get user bookmarks
 */
export async function getBookmarks(filters?: {
  folder?: string
  type?: 'article' | 'video'
}): Promise<KBBookmark[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  let query = supabase
    .from('kb_bookmarks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (filters?.folder) {
    query = query.eq('folder', filters.folder)
  }

  if (filters?.type === 'article') {
    query = query.not('article_id', 'is', null)
  } else if (filters?.type === 'video') {
    query = query.not('video_id', 'is', null)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

/**
 * Create a bookmark
 */
export async function createBookmark(bookmark: {
  article_id?: string
  video_id?: string
  notes?: string
  folder?: string
  tags?: string[]
}): Promise<KBBookmark> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('kb_bookmarks')
    .insert({
      ...bookmark,
      user_id: user.id
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Delete a bookmark
 */
export async function deleteBookmark(bookmarkId: string): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('kb_bookmarks')
    .delete()
    .eq('id', bookmarkId)
    .eq('user_id', user.id)

  if (error) throw error
}

// ============================================================================
// SEARCH QUERIES
// ============================================================================

/**
 * Search knowledge base content
 */
export async function searchKnowledgeBase(query: string): Promise<{
  articles: KBArticle[]
  videos: KBVideoTutorial[]
  faqs: KBFAQ[]
}> {
  const supabase = createClient()

  // Log the search query
  const { data: { user } } = await supabase.auth.getUser()
  await supabase
    .from('kb_search_queries')
    .insert({
      query,
      user_id: user?.id || null
    })

  const [articlesData, videosData, faqsData] = await Promise.all([
    supabase
      .from('kb_articles')
      .select('*')
      .eq('status', 'published')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%,tags.cs.{${query}}`)
      .limit(10),
    supabase
      .from('kb_video_tutorials')
      .select('*')
      .eq('status', 'published')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`)
      .limit(10),
    supabase
      .from('kb_faqs')
      .select('*')
      .eq('status', 'published')
      .or(`question.ilike.%${query}%,answer.ilike.%${query}%`)
      .limit(10)
  ])

  return {
    articles: articlesData.data || [],
    videos: videosData.data || [],
    faqs: faqsData.data || []
  }
}

// ============================================================================
// SUGGESTED TOPICS QUERIES
// ============================================================================

/**
 * Get suggested topics
 */
export async function getSuggestedTopics(filters?: {
  status?: SuggestionStatus
  limit?: number
}): Promise<KBSuggestedTopic[]> {
  const supabase = createClient()

  let query = supabase
    .from('kb_suggested_topics')
    .select('*')
    .order('votes', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

/**
 * Create a suggested topic
 */
export async function createSuggestedTopic(topic: {
  title: string
  description?: string
  category_suggestion?: string
}): Promise<KBSuggestedTopic> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('kb_suggested_topics')
    .insert({
      ...topic,
      user_id: user?.id || null
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Vote for a suggested topic
 */
export async function voteForSuggestedTopic(topicId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('kb_suggested_topics')
    .update({
      votes: supabase.sql`votes + 1`
    })
    .eq('id', topicId)

  if (error) throw error
}

// ============================================================================
// ANALYTICS & DASHBOARD QUERIES
// ============================================================================

/**
 * Get knowledge base statistics
 */
export async function getKnowledgeBaseStats(): Promise<{
  totalArticles: number
  publishedArticles: number
  totalVideos: number
  totalFAQs: number
  totalViews: number
  averageRating: number
  popularArticles: KBArticle[]
  recentArticles: KBArticle[]
}> {
  const supabase = createClient()

  const [articlesData, videosCount, faqsCount, popularArticles, recentArticles] = await Promise.all([
    supabase
      .from('kb_articles')
      .select('status, views, rating'),
    supabase
      .from('kb_video_tutorials')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published'),
    supabase
      .from('kb_faqs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published'),
    supabase
      .from('kb_articles')
      .select('*')
      .eq('status', 'published')
      .order('views', { ascending: false })
      .limit(5),
    supabase
      .from('kb_articles')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(5)
  ])

  const articles = articlesData.data || []
  const publishedArticles = articles.filter(a => a.status === 'published')
  const totalViews = articles.reduce((sum, a) => sum + a.views, 0)
  const averageRating = publishedArticles.length > 0
    ? publishedArticles.reduce((sum, a) => sum + a.rating, 0) / publishedArticles.length
    : 0

  return {
    totalArticles: articles.length,
    publishedArticles: publishedArticles.length,
    totalVideos: videosCount.count || 0,
    totalFAQs: faqsCount.count || 0,
    totalViews,
    averageRating,
    popularArticles: popularArticles.data || [],
    recentArticles: recentArticles.data || []
  }
}

/**
 * Log article view with analytics
 */
export async function logArticleView(articleId: string, analytics?: {
  time_spent_seconds?: number
  scroll_percentage?: number
  completed_reading?: boolean
  referrer?: string
}): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  await supabase
    .from('kb_article_views')
    .insert({
      article_id: articleId,
      user_id: user?.id || null,
      ...analytics
    })

  await incrementArticleViews(articleId)
}

/**
 * Log video view with analytics
 */
export async function logVideoView(videoId: string, analytics?: {
  watch_time_seconds?: number
  completion_percentage?: number
  completed_video?: boolean
  referrer?: string
}): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  await supabase
    .from('kb_video_views')
    .insert({
      video_id: videoId,
      user_id: user?.id || null,
      ...analytics
    })

  await incrementVideoViews(videoId)
}
