'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

// Asset Types
type AssetType = 'image' | 'video' | 'audio' | 'document' | 'font' | 'icon' | 'template' | 'brand_asset' | 'other'
type AssetStatus = 'draft' | 'active' | 'archived' | 'expired'

// Create Asset
export async function createAsset(data: {
  asset_name: string
  asset_type: AssetType
  file_url: string
  file_size: number
  file_format: string
  thumbnail_url?: string
  collection_id?: string
  tags?: string[]
  metadata?: Record<string, any>
  status?: AssetStatus
  is_public?: boolean
  license_type?: string
  expiry_date?: string
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

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

  if (error) throw error

  // Update collection asset count if in collection
  if (data.collection_id) {
    await updateCollectionStats(data.collection_id)
  }

  revalidatePath('/dashboard/assets-v2')
  return asset
}

// Update Asset
export async function updateAsset(assetId: string, data: Partial<{
  asset_name: string
  asset_type: AssetType
  file_url: string
  file_size: number
  file_format: string
  thumbnail_url: string
  collection_id: string | null
  tags: string[]
  metadata: Record<string, any>
  status: AssetStatus
  is_public: boolean
  license_type: string
  expiry_date: string
}>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

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

  if (error) throw error

  // Update collection stats if collection changed
  if (currentAsset?.collection_id !== data.collection_id) {
    if (currentAsset?.collection_id) {
      await updateCollectionStats(currentAsset.collection_id)
    }
    if (data.collection_id) {
      await updateCollectionStats(data.collection_id)
    }
  }

  revalidatePath('/dashboard/assets-v2')
  return asset
}

// Delete Asset (soft delete)
export async function deleteAsset(assetId: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

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

  if (error) throw error

  // Update collection stats
  if (asset?.collection_id) {
    await updateCollectionStats(asset.collection_id)
  }

  revalidatePath('/dashboard/assets-v2')
  return { success: true }
}

// Increment Download Count
export async function incrementAssetDownload(assetId: string) {
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

  return { success: true }
}

// Create Collection
export async function createAssetCollection(data: {
  collection_name: string
  description?: string
  cover_image_url?: string
  is_public?: boolean
  sort_order?: number
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

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

  if (error) throw error

  revalidatePath('/dashboard/assets-v2')
  return collection
}

// Update Collection
export async function updateAssetCollection(collectionId: string, data: Partial<{
  collection_name: string
  description: string
  cover_image_url: string
  is_public: boolean
  sort_order: number
}>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: collection, error } = await supabase
    .from('asset_collections')
    .update(data)
    .eq('id', collectionId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/assets-v2')
  return collection
}

// Delete Collection (soft delete)
export async function deleteAssetCollection(collectionId: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

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

  if (error) throw error

  revalidatePath('/dashboard/assets-v2')
  return { success: true }
}

// Helper: Update Collection Stats
async function updateCollectionStats(collectionId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: assets } = await supabase
    .from('digital_assets')
    .select('file_size')
    .eq('collection_id', collectionId)
    .is('deleted_at', null)

  const assetCount = assets?.length || 0
  const totalSize = assets?.reduce((sum, a) => sum + (a.file_size || 0), 0) || 0

  await supabase
    .from('asset_collections')
    .update({ asset_count: assetCount, total_size: totalSize })
    .eq('id', collectionId)
}

// Move Asset to Collection
export async function moveAssetToCollection(assetId: string, collectionId: string | null) {
  return updateAsset(assetId, { collection_id: collectionId })
}

// Bulk Update Assets
export async function bulkUpdateAssets(assetIds: string[], data: Partial<{
  status: AssetStatus
  collection_id: string | null
  is_public: boolean
  tags: string[]
}>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('digital_assets')
    .update(data)
    .in('id', assetIds)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/dashboard/assets-v2')
  return { success: true }
}

// Get Asset Stats
export async function getAssetStats() {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: assets } = await supabase
    .from('digital_assets')
    .select('asset_type, file_size, status, download_count')
    .eq('user_id', user.id)
    .is('deleted_at', null)

  const stats = {
    totalAssets: assets?.length || 0,
    totalSize: assets?.reduce((sum, a) => sum + (a.file_size || 0), 0) || 0,
    totalDownloads: assets?.reduce((sum, a) => sum + (a.download_count || 0), 0) || 0,
    byType: assets?.reduce((acc: Record<string, number>, a) => {
      acc[a.asset_type] = (acc[a.asset_type] || 0) + 1
      return acc
    }, {}) || {},
    activeAssets: assets?.filter(a => a.status === 'active').length || 0
  }

  return stats
}
