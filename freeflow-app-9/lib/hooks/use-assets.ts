'use client'

import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-query'

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
interface UseAssetsOptions {
  type?: AssetType
  status?: AssetStatus
  collectionId?: string
  isPublic?: boolean
  searchQuery?: string
}

interface UseAssetCollectionsOptions {
  isPublic?: boolean
  searchQuery?: string
}

// Assets Hook
export function useAssets(options: UseAssetsOptions = {}) {
  const { type, status, collectionId, isPublic, searchQuery } = options

  const buildQuery = (supabase: any) => {
    let query = supabase
      .from('digital_assets')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (type) {
      query = query.eq('asset_type', type)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (collectionId) {
      query = query.eq('collection_id', collectionId)
    }

    if (isPublic !== undefined) {
      query = query.eq('is_public', isPublic)
    }

    if (searchQuery) {
      query = query.ilike('asset_name', `%${searchQuery}%`)
    }

    return query
  }

  return useSupabaseQuery<DigitalAsset>('digital_assets', buildQuery, [type, status, collectionId, isPublic, searchQuery])
}

// Asset Collections Hook
export function useAssetCollections(options: UseAssetCollectionsOptions = {}) {
  const { isPublic, searchQuery } = options

  const buildQuery = (supabase: any) => {
    let query = supabase
      .from('asset_collections')
      .select('*')
      .is('deleted_at', null)
      .order('sort_order', { ascending: true })

    if (isPublic !== undefined) {
      query = query.eq('is_public', isPublic)
    }

    if (searchQuery) {
      query = query.ilike('collection_name', `%${searchQuery}%`)
    }

    return query
  }

  return useSupabaseQuery<AssetCollection>('asset_collections', buildQuery, [isPublic, searchQuery])
}

// Single Asset Hook
export function useAsset(assetId: string | null) {
  const buildQuery = (supabase: any) => {
    return supabase
      .from('digital_assets')
      .select('*')
      .eq('id', assetId)
      .single()
  }

  return useSupabaseQuery<DigitalAsset>(
    'digital_assets',
    buildQuery,
    [assetId],
    { enabled: !!assetId }
  )
}

// Asset Statistics Hook
export function useAssetStats() {
  const buildQuery = (supabase: any) => {
    return supabase
      .from('digital_assets')
      .select('asset_type, file_size, status, download_count')
      .is('deleted_at', null)
  }

  const { data, ...rest } = useSupabaseQuery<any>('digital_assets', buildQuery, [])

  const stats = data ? {
    totalAssets: data.length,
    totalSize: data.reduce((sum: number, a: any) => sum + (a.file_size || 0), 0),
    totalDownloads: data.reduce((sum: number, a: any) => sum + (a.download_count || 0), 0),
    byType: data.reduce((acc: Record<string, number>, a: any) => {
      acc[a.asset_type] = (acc[a.asset_type] || 0) + 1
      return acc
    }, {}),
    activeAssets: data.filter((a: any) => a.status === 'active').length,
    draftAssets: data.filter((a: any) => a.status === 'draft').length
  } : null

  return { stats, ...rest }
}

// Mutations
export function useAssetMutations() {
  return useSupabaseMutation()
}
