/**
 * Storage Connection Database Queries
 */

import { createClient } from '@/lib/supabase/client'
import type { StorageConnection, StorageProvider } from './providers'

export async function getStorageConnections(userId: string): Promise<StorageConnection[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('storage_connections')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching storage connections:', error)
    return []
  }

  return data || []
}

export async function getStorageConnection(
  userId: string,
  provider: StorageProvider
): Promise<StorageConnection | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('storage_connections')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', provider)
    .single()

  if (error) {
    console.error('Error fetching storage connection:', error)
    return null
  }

  return data
}

export async function createStorageConnection(
  connection: Omit<StorageConnection, 'id' | 'createdAt' | 'updatedAt'>
): Promise<StorageConnection | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('storage_connections')
    .insert({
      user_id: connection.userId,
      provider: connection.provider,
      access_token: connection.accessToken,
      refresh_token: connection.refreshToken,
      expires_at: connection.expiresAt,
      account_email: connection.accountEmail,
      account_name: connection.accountName,
      total_space: connection.totalSpace,
      used_space: connection.usedSpace,
      connected: connection.connected,
      last_sync: connection.lastSync
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating storage connection:', error)
    return null
  }

  return data
}

export async function updateStorageConnection(
  id: string,
  updates: Partial<StorageConnection>
): Promise<StorageConnection | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('storage_connections')
    .update({
      access_token: updates.accessToken,
      refresh_token: updates.refreshToken,
      expires_at: updates.expiresAt,
      account_email: updates.accountEmail,
      account_name: updates.accountName,
      total_space: updates.totalSpace,
      used_space: updates.usedSpace,
      connected: updates.connected,
      last_sync: updates.lastSync
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating storage connection:', error)
    return null
  }

  return data
}

export async function deleteStorageConnection(id: string): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from('storage_connections')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting storage connection:', error)
    return false
  }

  return true
}

export async function syncStorageConnection(
  id: string
): Promise<StorageConnection | null> {
  const supabase = createClient()

  const { data, error} = await supabase
    .from('storage_connections')
    .update({
      last_sync: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error syncing storage connection:', error)
    return null
  }

  return data
}

/**
 * Get all files from all connected storage providers
 */
export async function getAllFiles(userId: string) {
  const connections = await getStorageConnections(userId)
  const allFiles = []

  for (const connection of connections) {
    if (!connection.connected) continue

    try {
      const { UnifiedStorageClient } = await import('./providers')
      const client = new UnifiedStorageClient(
        connection.provider,
        connection.access_token
      )
      const files = await client.listFiles()
      allFiles.push(...files)
    } catch (error) {
      console.error(`Error fetching files from ${connection.provider}:`, error)
    }
  }

  return allFiles
}

/**
 * Search files across all connected storage providers
 */
export async function searchFiles(userId: string, query: string) {
  const allFiles = await getAllFiles(userId)

  return allFiles.filter(file =>
    file.name.toLowerCase().includes(query.toLowerCase())
  )
}

/**
 * Get storage quota across all providers
 */
export async function getTotalStorageQuota(userId: string) {
  const connections = await getStorageConnections(userId)

  let totalSpace = 0
  let usedSpace = 0

  for (const connection of connections) {
    if (!connection.connected) continue

    totalSpace += connection.total_space || 0
    usedSpace += connection.used_space || 0
  }

  return {
    total: totalSpace,
    used: usedSpace,
    available: totalSpace - usedSpace,
    usagePercentage: totalSpace > 0 ? (usedSpace / totalSpace) * 100 : 0
  }
}
