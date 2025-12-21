'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'
import { uuidSchema } from '@/lib/validations'

const logger = createFeatureLogger('assets')

// Asset Types
type AssetType = 'image' | 'video' | 'audio' | 'document' | 'font' | 'icon' | 'template' | 'brand_asset' | 'other'
type AssetStatus = 'draft' | 'active' | 'archived' | 'expired'

interface CreateAssetInput {
  asset_name: string
  asset_type: AssetType
  file_url: string
  file_size: number
  file_format: string
  thumbnail_url?: string
  collection_id?: string
  tags?: string[]
  metadata?: Record<string, unknown>
  status?: AssetStatus
  is_public?: boolean
  license_type?: string
  expiry_date?: string
}

interface UpdateAssetInput {
  asset_name?: string
  asset_type?: AssetType
  file_url?: string
  file_size?: number
  file_format?: string
  thumbnail_url?: string
  collection_id?: string | null
  tags?: string[]
  metadata?: Record<string, unknown>
  status?: AssetStatus
  is_public?: boolean
  license_type?: string
  expiry_date?: string
}

interface DigitalAsset {
  id: string
  user_id: string
  asset_name: string
  asset_type: AssetType
  file_url: string
  file_size: number
  file_format: string
  thumbnail_url?: string
  collection_id?: string
  tags?: string[]
  metadata?: Record<string, unknown>
  status: AssetStatus
  is_public: boolean
  license_type?: string
  expiry_date?: string
  download_count?: number
  deleted_at?: string
  created_at?: string
  updated_at?: string
}

interface CreateCollectionInput {
  collection_name: string
  description?: string
  cover_image_url?: string
  is_public?: boolean
  sort_order?: number
}

interface UpdateCollectionInput {
  collection_name?: string
  description?: string
  cover_image_url?: string
  is_public?: boolean
  sort_order?: number
}

interface AssetCollection {
  id: string
  user_id: string
  collection_name: string
  description?: string
  cover_image_url?: string
  is_public: boolean
  sort_order: number
  asset_count?: number
  total_size?: number
  deleted_at?: string
  created_at?: string
  updated_at?: string
}

interface BulkUpdateInput {
  status?: AssetStatus
  collection_id?: string | null
  is_public?: boolean
  tags?: string[]
}

interface AssetStatsResponse {
  totalAssets: number
  totalSize: number
  totalDownloads: number
  byType: Record<string, number>
  activeAssets: number
}

interface AssetWithSize {
  file_size: number
}

// Create Asset
export async function createAsset(data: CreateAssetInput): Promise<ActionResult<DigitalAsset>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized asset creation attempt')
      return actionError('Unauthorized', 'UNAUTHORIZED')
    }

    // Validate collection_id if provided
    if (data.collection_id) {
      const collectionValidation = uuidSchema.safeParse(data.collection_id)
      if (!collectionValidation.success) {
        return actionError('Invalid collection ID format', 'VALIDATION_ERROR')
      }
    }

    const { data: asset, error } = await supabase
      .from('digital_assets')
      .insert({
        user_id: user.id,
        asset_name: data.asset_name,
        asset_type: data.asset_type,
        file_url: data.file_url,
        file_size: data.file_size,
        file_format: data.file_format,
        thumbnail_url: data.thumbnail_url,
        collection_id: data.collection_id,
        tags: data.tags || [],
        metadata: data.metadata || {},
        status: data.status || 'draft',
        is_public: data.is_public || false,
        license_type: data.license_type,
        expiry_date: data.expiry_date
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create asset', { error, userId: user.id })
      return actionError('Failed to create asset', 'DATABASE_ERROR')
    }

    // Update collection asset count if in collection
    if (data.collection_id) {
      await updateCollectionStats(data.collection_id)
    }

    logger.info('Asset created successfully', { assetId: asset.id, userId: user.id })
    revalidatePath('/dashboard/assets-v2')
    return actionSuccess(asset as DigitalAsset, 'Asset created successfully')
  } catch (error) {
    logger.error('Unexpected error creating asset', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Update Asset
export async function updateAsset(
  assetId: string,
  data: UpdateAssetInput
): Promise<ActionResult<DigitalAsset>> {
  try {
    // Validate asset ID
    const idValidation = uuidSchema.safeParse(assetId)
    if (!idValidation.success) {
      return actionError('Invalid asset ID format', 'VALIDATION_ERROR')
    }

    // Validate collection_id if provided
    if (data.collection_id !== undefined && data.collection_id !== null) {
      const collectionValidation = uuidSchema.safeParse(data.collection_id)
      if (!collectionValidation.success) {
        return actionError('Invalid collection ID format', 'VALIDATION_ERROR')
      }
    }

    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized asset update attempt', { assetId })
      return actionError('Unauthorized', 'UNAUTHORIZED')
    }

    // Get current asset to check collection change
    const { data: currentAsset } = await supabase
      .from('digital_assets')
      .select('collection_id')
      .eq('id', assetId)
      .single()

    const { data: asset, error } = await supabase
      .from('digital_assets')
      .update(data)
      .eq('id', assetId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update asset', { error, assetId, userId: user.id })
      return actionError('Failed to update asset', 'DATABASE_ERROR')
    }

    if (!asset) {
      logger.warn('Asset not found or access denied', { assetId, userId: user.id })
      return actionError('Asset not found', 'NOT_FOUND')
    }

    // Update collection stats if collection changed
    if (currentAsset?.collection_id !== data.collection_id) {
      if (currentAsset?.collection_id) {
        await updateCollectionStats(currentAsset.collection_id)
      }
      if (data.collection_id) {
        await updateCollectionStats(data.collection_id)
      }
    }

    logger.info('Asset updated successfully', { assetId, userId: user.id })
    revalidatePath('/dashboard/assets-v2')
    return actionSuccess(asset as DigitalAsset, 'Asset updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating asset', { error, assetId })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Delete Asset (soft delete)
export async function deleteAsset(assetId: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    // Validate asset ID
    const idValidation = uuidSchema.safeParse(assetId)
    if (!idValidation.success) {
      return actionError('Invalid asset ID format', 'VALIDATION_ERROR')
    }

    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized asset deletion attempt', { assetId })
      return actionError('Unauthorized', 'UNAUTHORIZED')
    }

    // Get asset to update collection
    const { data: asset } = await supabase
      .from('digital_assets')
      .select('collection_id')
      .eq('id', assetId)
      .single()

    const { error } = await supabase
      .from('digital_assets')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', assetId)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete asset', { error, assetId, userId: user.id })
      return actionError('Failed to delete asset', 'DATABASE_ERROR')
    }

    // Update collection stats
    if (asset?.collection_id) {
      await updateCollectionStats(asset.collection_id)
    }

    logger.info('Asset deleted successfully', { assetId, userId: user.id })
    revalidatePath('/dashboard/assets-v2')
    return actionSuccess({ success: true }, 'Asset deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting asset', { error, assetId })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Increment Download Count
export async function incrementAssetDownload(assetId: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    // Validate asset ID
    const idValidation = uuidSchema.safeParse(assetId)
    if (!idValidation.success) {
      return actionError('Invalid asset ID format', 'VALIDATION_ERROR')
    }

    const supabase = createServerActionClient({ cookies })

    const { error } = await supabase.rpc('increment_asset_download', { asset_id: assetId })

    if (error) {
      // Fallback if RPC doesn't exist
      const { data: asset } = await supabase
        .from('digital_assets')
        .select('download_count')
        .eq('id', assetId)
        .single()

      if (asset) {
        await supabase
          .from('digital_assets')
          .update({ download_count: (asset.download_count || 0) + 1 })
          .eq('id', assetId)
      }
    }

    logger.info('Asset download count incremented', { assetId })
    return actionSuccess({ success: true }, 'Download recorded')
  } catch (error) {
    logger.error('Unexpected error incrementing asset download', { error, assetId })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Create Collection
export async function createAssetCollection(data: CreateCollectionInput): Promise<ActionResult<AssetCollection>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized collection creation attempt')
      return actionError('Unauthorized', 'UNAUTHORIZED')
    }

    const { data: collection, error } = await supabase
      .from('asset_collections')
      .insert({
        user_id: user.id,
        collection_name: data.collection_name,
        description: data.description,
        cover_image_url: data.cover_image_url,
        is_public: data.is_public || false,
        sort_order: data.sort_order || 0
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create collection', { error, userId: user.id })
      return actionError('Failed to create collection', 'DATABASE_ERROR')
    }

    logger.info('Collection created successfully', { collectionId: collection.id, userId: user.id })
    revalidatePath('/dashboard/assets-v2')
    return actionSuccess(collection as AssetCollection, 'Collection created successfully')
  } catch (error) {
    logger.error('Unexpected error creating collection', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Update Collection
export async function updateAssetCollection(
  collectionId: string,
  data: UpdateCollectionInput
): Promise<ActionResult<AssetCollection>> {
  try {
    // Validate collection ID
    const idValidation = uuidSchema.safeParse(collectionId)
    if (!idValidation.success) {
      return actionError('Invalid collection ID format', 'VALIDATION_ERROR')
    }

    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized collection update attempt', { collectionId })
      return actionError('Unauthorized', 'UNAUTHORIZED')
    }

    const { data: collection, error } = await supabase
      .from('asset_collections')
      .update(data)
      .eq('id', collectionId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update collection', { error, collectionId, userId: user.id })
      return actionError('Failed to update collection', 'DATABASE_ERROR')
    }

    if (!collection) {
      logger.warn('Collection not found or access denied', { collectionId, userId: user.id })
      return actionError('Collection not found', 'NOT_FOUND')
    }

    logger.info('Collection updated successfully', { collectionId, userId: user.id })
    revalidatePath('/dashboard/assets-v2')
    return actionSuccess(collection as AssetCollection, 'Collection updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating collection', { error, collectionId })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Delete Collection (soft delete)
export async function deleteAssetCollection(collectionId: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    // Validate collection ID
    const idValidation = uuidSchema.safeParse(collectionId)
    if (!idValidation.success) {
      return actionError('Invalid collection ID format', 'VALIDATION_ERROR')
    }

    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized collection deletion attempt', { collectionId })
      return actionError('Unauthorized', 'UNAUTHORIZED')
    }

    // Remove collection_id from all assets in collection
    await supabase
      .from('digital_assets')
      .update({ collection_id: null })
      .eq('collection_id', collectionId)
      .eq('user_id', user.id)

    const { error } = await supabase
      .from('asset_collections')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', collectionId)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete collection', { error, collectionId, userId: user.id })
      return actionError('Failed to delete collection', 'DATABASE_ERROR')
    }

    logger.info('Collection deleted successfully', { collectionId, userId: user.id })
    revalidatePath('/dashboard/assets-v2')
    return actionSuccess({ success: true }, 'Collection deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting collection', { error, collectionId })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Helper: Update Collection Stats
async function updateCollectionStats(collectionId: string): Promise<void> {
  try {
    const supabase = createServerActionClient({ cookies })

    const { data: assets } = await supabase
      .from('digital_assets')
      .select('file_size')
      .eq('collection_id', collectionId)
      .is('deleted_at', null)

    const typedAssets = (assets || []) as AssetWithSize[]
    const assetCount = typedAssets.length
    const totalSize = typedAssets.reduce((sum, a) => sum + (a.file_size || 0), 0)

    await supabase
      .from('asset_collections')
      .update({ asset_count: assetCount, total_size: totalSize })
      .eq('id', collectionId)
  } catch (error) {
    logger.error('Failed to update collection stats', { error, collectionId })
  }
}

// Move Asset to Collection
export async function moveAssetToCollection(
  assetId: string,
  collectionId: string | null
): Promise<ActionResult<DigitalAsset>> {
  return updateAsset(assetId, { collection_id: collectionId })
}

// Bulk Update Assets
export async function bulkUpdateAssets(
  assetIds: string[],
  data: BulkUpdateInput
): Promise<ActionResult<{ success: boolean }>> {
  try {
    // Validate all asset IDs
    for (const id of assetIds) {
      const idValidation = uuidSchema.safeParse(id)
      if (!idValidation.success) {
        return actionError('Invalid asset ID format in bulk update', 'VALIDATION_ERROR')
      }
    }

    // Validate collection_id if provided
    if (data.collection_id !== undefined && data.collection_id !== null) {
      const collectionValidation = uuidSchema.safeParse(data.collection_id)
      if (!collectionValidation.success) {
        return actionError('Invalid collection ID format', 'VALIDATION_ERROR')
      }
    }

    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized bulk asset update attempt')
      return actionError('Unauthorized', 'UNAUTHORIZED')
    }

    const { error } = await supabase
      .from('digital_assets')
      .update(data)
      .in('id', assetIds)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to bulk update assets', { error, assetCount: assetIds.length, userId: user.id })
      return actionError('Failed to bulk update assets', 'DATABASE_ERROR')
    }

    logger.info('Assets bulk updated successfully', { assetCount: assetIds.length, userId: user.id })
    revalidatePath('/dashboard/assets-v2')
    return actionSuccess({ success: true }, `${assetIds.length} assets updated successfully`)
  } catch (error) {
    logger.error('Unexpected error bulk updating assets', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Get Asset Stats
export async function getAssetStats(): Promise<ActionResult<AssetStatsResponse>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized asset stats request')
      return actionError('Unauthorized', 'UNAUTHORIZED')
    }

    const { data: assets } = await supabase
      .from('digital_assets')
      .select('asset_type, file_size, status, download_count')
      .eq('user_id', user.id)
      .is('deleted_at', null)

    const stats: AssetStatsResponse = {
      totalAssets: assets?.length || 0,
      totalSize: assets?.reduce((sum, a) => sum + (a.file_size || 0), 0) || 0,
      totalDownloads: assets?.reduce((sum, a) => sum + (a.download_count || 0), 0) || 0,
      byType: assets?.reduce((acc: Record<string, number>, a) => {
        acc[a.asset_type] = (acc[a.asset_type] || 0) + 1
        return acc
      }, {}) || {},
      activeAssets: assets?.filter(a => a.status === 'active').length || 0
    }

    logger.info('Asset stats retrieved successfully', { userId: user.id })
    return actionSuccess(stats, 'Stats retrieved successfully')
  } catch (error) {
    logger.error('Unexpected error getting asset stats', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
