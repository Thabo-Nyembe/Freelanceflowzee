'use client'

import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'
import { useCallback, useState } from 'react'

// Types
export type AssetType = 'image' | 'video' | 'audio' | 'document' | 'font' | 'icon' | 'template' | 'brand_asset' | 'other'
export type AssetStatus = 'draft' | 'active' | 'archived' | 'expired'

export interface DigitalAsset {
  id: string
  user_id: string
  asset_name: string
  asset_type: AssetType
  file_url: string
  file_size: number
  file_format: string
  thumbnail_url: string | null
  collection_id: string | null
  tags: string[]
  metadata: Record<string, any>
  version: number
  status: AssetStatus
  is_public: boolean
  download_count: number
  license_type: string | null
  expiry_date: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface AssetCollection {
  id: string
  user_id: string
  collection_name: string
  description: string | null
  cover_image_url: string | null
  asset_count: number
  total_size: number
  is_public: boolean
  sort_order: number
  created_at: string
  updated_at: string
  deleted_at: string | null
}

// Hook Options
export interface UseAssetsOptions {
  type?: AssetType | 'all'
  status?: AssetStatus | 'all'
  collectionId?: string
  isPublic?: boolean
  limit?: number
}

export interface UseAssetCollectionsOptions {
  isPublic?: boolean
  limit?: number
}

// Assets Hook
export function useAssets(options: UseAssetsOptions = {}) {
  const { type, status, collectionId, isPublic, limit } = options
  const [mutationLoading, setMutationLoading] = useState(false)
  const [mutationError, setMutationError] = useState<Error | null>(null)

  const filters: Record<string, any> = {}
  if (type && type !== 'all') filters.asset_type = type
  if (status && status !== 'all') filters.status = status
  if (collectionId) filters.collection_id = collectionId
  if (isPublic !== undefined) filters.is_public = isPublic

  const queryOptions: any = {
    table: 'digital_assets',
    filters,
    orderBy: { column: 'created_at', ascending: false },
    limit: limit || 100,
    realtime: true,
    softDelete: true
  }

  const { data, loading, error, refetch } = useSupabaseQuery<DigitalAsset>(queryOptions)

  const { create, update, remove } = useSupabaseMutation({
    table: 'digital_assets',
    onSuccess: () => {
      refetch()
    },
    onError: (err) => {
      setMutationError(err)
    }
  })

  // Create a new asset
  const createAsset = useCallback(async (input: Partial<DigitalAsset>) => {
    setMutationLoading(true)
    setMutationError(null)
    try {
      const assetData = {
        asset_name: input.asset_name || 'Untitled Asset',
        asset_type: input.asset_type || 'other',
        file_url: input.file_url || '',
        file_size: input.file_size || 0,
        file_format: input.file_format || '',
        thumbnail_url: input.thumbnail_url || null,
        collection_id: input.collection_id || null,
        tags: input.tags || [],
        metadata: input.metadata || {},
        version: input.version || 1,
        status: input.status || 'draft',
        is_public: input.is_public || false,
        download_count: input.download_count || 0,
        license_type: input.license_type || null,
        expiry_date: input.expiry_date || null
      }
      const result = await create(assetData)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create asset')
      setMutationError(error)
      throw error
    } finally {
      setMutationLoading(false)
    }
  }, [create])

  // Update an existing asset
  const updateAsset = useCallback(async (id: string, input: Partial<DigitalAsset>) => {
    setMutationLoading(true)
    setMutationError(null)
    try {
      const result = await update(id, input)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update asset')
      setMutationError(error)
      throw error
    } finally {
      setMutationLoading(false)
    }
  }, [update])

  // Delete an asset
  const deleteAsset = useCallback(async (id: string) => {
    setMutationLoading(true)
    setMutationError(null)
    try {
      await remove(id)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete asset')
      setMutationError(error)
      throw error
    } finally {
      setMutationLoading(false)
    }
  }, [remove])

  return {
    assets: data,
    loading,
    error,
    refetch,
    mutationLoading,
    mutationError,
    createAsset,
    updateAsset,
    deleteAsset
  }
}

// Asset Collections Hook
export function useAssetCollections(options: UseAssetCollectionsOptions = {}) {
  const { isPublic, limit } = options
  const [mutationLoading, setMutationLoading] = useState(false)
  const [mutationError, setMutationError] = useState<Error | null>(null)

  const filters: Record<string, any> = {}
  if (isPublic !== undefined) filters.is_public = isPublic

  const queryOptions: any = {
    table: 'asset_collections',
    filters,
    orderBy: { column: 'sort_order', ascending: true },
    limit: limit || 50,
    realtime: true,
    softDelete: true
  }

  const { data, loading, error, refetch } = useSupabaseQuery<AssetCollection>(queryOptions)

  const { create, update, remove } = useSupabaseMutation({
    table: 'asset_collections',
    onSuccess: () => {
      refetch()
    },
    onError: (err) => {
      setMutationError(err)
    }
  })

  // Create a new collection
  const createCollection = useCallback(async (input: Partial<AssetCollection>) => {
    setMutationLoading(true)
    setMutationError(null)
    try {
      const collectionData = {
        collection_name: input.collection_name || 'Untitled Collection',
        description: input.description || null,
        cover_image_url: input.cover_image_url || null,
        asset_count: input.asset_count || 0,
        total_size: input.total_size || 0,
        is_public: input.is_public || false,
        sort_order: input.sort_order || 0
      }
      const result = await create(collectionData)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create collection')
      setMutationError(error)
      throw error
    } finally {
      setMutationLoading(false)
    }
  }, [create])

  // Update a collection
  const updateCollection = useCallback(async (id: string, input: Partial<AssetCollection>) => {
    setMutationLoading(true)
    setMutationError(null)
    try {
      const result = await update(id, input)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update collection')
      setMutationError(error)
      throw error
    } finally {
      setMutationLoading(false)
    }
  }, [update])

  // Delete a collection
  const deleteCollection = useCallback(async (id: string) => {
    setMutationLoading(true)
    setMutationError(null)
    try {
      await remove(id)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete collection')
      setMutationError(error)
      throw error
    } finally {
      setMutationLoading(false)
    }
  }, [remove])

  return {
    collections: data,
    loading,
    error,
    refetch,
    mutationLoading,
    mutationError,
    createCollection,
    updateCollection,
    deleteCollection
  }
}

// Asset Statistics Hook
export function useAssetStats() {
  const queryOptions: any = {
    table: 'digital_assets',
    select: 'asset_type, file_size, status, download_count',
    orderBy: { column: 'created_at', ascending: false },
    realtime: false,
    softDelete: true
  }

  const { data, loading, error, refetch } = useSupabaseQuery<any>(queryOptions)

  const stats = data && data.length > 0 ? {
    totalAssets: data.length,
    totalSize: data.reduce((sum: number, a: any) => sum + (a.file_size || 0), 0),
    totalDownloads: data.reduce((sum: number, a: any) => sum + (a.download_count || 0), 0),
    byType: data.reduce((acc: Record<string, number>, a: any) => {
      acc[a.asset_type] = (acc[a.asset_type] || 0) + 1
      return acc
    }, {}),
    activeAssets: data.filter((a: any) => a.status === 'active').length,
    draftAssets: data.filter((a: any) => a.status === 'draft').length
  } : {
    totalAssets: 0,
    totalSize: 0,
    totalDownloads: 0,
    byType: {},
    activeAssets: 0,
    draftAssets: 0
  }

  return { stats, loading, error, refetch }
}
