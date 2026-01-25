/**
 * Resource Library API Routes
 *
 * REST endpoints for Resource Library:
 * GET - List resources, categories, collections, downloads, bookmarks, tags, stats
 * POST - Create resource, collection, download, rating, comment, bookmark
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('resource-library')
import {
  getResources,
  getFeaturedResources,
  getUserResources,
  searchResources,
  getCategories,
  getFeaturedCategories,
  getUserCollections,
  getPublicCollections,
  createCollection,
  getCollectionItems,
  addResourceToCollection,
  recordDownload,
  getUserDownloads,
  getResourceRatings,
  rateResource,
  getResourceComments,
  addComment,
  getUserBookmarks,
  bookmarkResource,
  getPopularTags,
  getResourcesByTag,
  getPopularResources,
  getLibraryStats,
  createResource
} from '@/lib/resource-library-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'resources'
    const resourceType = searchParams.get('resource_type') as any
    const categoryId = searchParams.get('category_id')
    const format = searchParams.get('format') as any
    const license = searchParams.get('license') as any
    const accessLevel = searchParams.get('access_level') as any
    const resourceId = searchParams.get('resource_id')
    const collectionId = searchParams.get('collection_id')
    const tagSlug = searchParams.get('tag_slug')
    const userId = searchParams.get('user_id')
    const search = searchParams.get('search')
    const sortBy = (searchParams.get('sort_by') || 'recent') as 'recent' | 'popular' | 'rating' | 'downloads'
    const timePeriod = (searchParams.get('time_period') || '7d') as '24h' | '7d' | '30d'
    const limit = parseInt(searchParams.get('limit') || '50')
    const isPremium = searchParams.get('is_premium') === 'true'
    const isFeatured = searchParams.get('is_featured') === 'true'
    const minRating = parseFloat(searchParams.get('min_rating') || '0')

    switch (type) {
      case 'resources': {
        const filters: any = {}
        if (resourceType) filters.type = resourceType
        if (categoryId) filters.category_id = categoryId
        if (format) filters.format = format
        if (license) filters.license = license
        if (accessLevel) filters.access_level = accessLevel
        if (searchParams.has('is_premium')) filters.is_premium = isPremium
        if (searchParams.has('is_featured')) filters.is_featured = isFeatured
        if (minRating > 0) filters.min_rating = minRating
        if (search) filters.search = search
        const data = await getResources(Object.keys(filters).length > 0 ? filters : undefined, sortBy, limit)
        return NextResponse.json({ data })
      }

      case 'featured': {
        const data = await getFeaturedResources(limit)
        return NextResponse.json({ data })
      }

      case 'popular': {
        const data = await getPopularResources(timePeriod, limit)
        return NextResponse.json({ data })
      }

      case 'search': {
        if (!search) {
          return NextResponse.json({ error: 'search query required' }, { status: 400 })
        }
        const data = await searchResources(search, limit)
        return NextResponse.json({ data })
      }

      case 'my-resources': {
        const data = await getUserResources(user.id, limit)
        return NextResponse.json({ data })
      }

      case 'user-resources': {
        if (!userId) {
          return NextResponse.json({ error: 'user_id required' }, { status: 400 })
        }
        const data = await getUserResources(userId, limit)
        return NextResponse.json({ data })
      }

      case 'categories': {
        const data = await getCategories()
        return NextResponse.json({ data })
      }

      case 'featured-categories': {
        const data = await getFeaturedCategories()
        return NextResponse.json({ data })
      }

      case 'my-collections': {
        const data = await getUserCollections(user.id)
        return NextResponse.json({ data })
      }

      case 'public-collections': {
        const data = await getPublicCollections(limit)
        return NextResponse.json({ data })
      }

      case 'collection-items': {
        if (!collectionId) {
          return NextResponse.json({ error: 'collection_id required' }, { status: 400 })
        }
        const data = await getCollectionItems(collectionId)
        return NextResponse.json({ data })
      }

      case 'my-downloads': {
        const data = await getUserDownloads(user.id, limit)
        return NextResponse.json({ data })
      }

      case 'ratings': {
        if (!resourceId) {
          return NextResponse.json({ error: 'resource_id required' }, { status: 400 })
        }
        const data = await getResourceRatings(resourceId, limit)
        return NextResponse.json({ data })
      }

      case 'comments': {
        if (!resourceId) {
          return NextResponse.json({ error: 'resource_id required' }, { status: 400 })
        }
        const data = await getResourceComments(resourceId, limit)
        return NextResponse.json({ data })
      }

      case 'my-bookmarks': {
        const data = await getUserBookmarks(user.id)
        return NextResponse.json({ data })
      }

      case 'popular-tags': {
        const data = await getPopularTags(limit)
        return NextResponse.json({ data })
      }

      case 'resources-by-tag': {
        if (!tagSlug) {
          return NextResponse.json({ error: 'tag_slug required' }, { status: 400 })
        }
        const data = await getResourcesByTag(tagSlug, limit)
        return NextResponse.json({ data })
      }

      case 'stats': {
        const data = await getLibraryStats()
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Resource Library API error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch Resource Library data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, ...payload } = body

    switch (action) {
      case 'create-resource': {
        const data = await createResource(payload)
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-collection': {
        const data = await createCollection({
          name: payload.name,
          description: payload.description,
          is_public: payload.is_public
        })
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'add-to-collection': {
        const data = await addResourceToCollection(
          payload.collection_id,
          payload.resource_id,
          payload.notes
        )
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'record-download': {
        const data = await recordDownload(payload.resource_id, payload.metadata)
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'rate-resource': {
        const data = await rateResource(
          payload.resource_id,
          payload.rating,
          payload.review
        )
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'add-comment': {
        const data = await addComment(
          payload.resource_id,
          payload.content,
          payload.parent_id
        )
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'bookmark-resource': {
        const data = await bookmarkResource(
          payload.resource_id,
          payload.folder,
          payload.notes
        )
        return NextResponse.json({ data }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Resource Library API error', { error })
    return NextResponse.json(
      { error: 'Failed to process Resource Library request' },
      { status: 500 }
    )
  }
}
