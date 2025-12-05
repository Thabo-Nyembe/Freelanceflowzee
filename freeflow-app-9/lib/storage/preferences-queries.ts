import { createClient } from '@/lib/supabase/client'

export interface UserPreferences {
  id: string
  user_id: string
  storage_onboarding_completed: boolean
  storage_onboarding_completed_at: string | null
  storage_onboarding_skipped: boolean
  files_view_mode: 'grid' | 'list'
  theme: 'light' | 'dark' | 'system'
  auto_sync_enabled: boolean
  cache_files_locally: boolean
  show_hidden_files: boolean
  created_at: string
  updated_at: string
}

/**
 * Get or create user preferences
 * Will automatically create default preferences if they don't exist
 */
export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  const supabase = createClient()

  // Try to get existing preferences
  const { data: existing, error: selectError } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (existing) {
    return existing
  }

  // If not found, create default preferences
  if (selectError?.code === 'PGRST116') {
    const { data: created, error: insertError } = await supabase
      .from('user_preferences')
      .insert({
        user_id: userId,
        storage_onboarding_completed: false,
        storage_onboarding_skipped: false,
        files_view_mode: 'grid',
        theme: 'system',
        auto_sync_enabled: true,
        cache_files_locally: true,
        show_hidden_files: false
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating user preferences:', insertError)
      return null
    }

    return created
  }

  console.error('Error fetching user preferences:', selectError)
  return null
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(
  userId: string,
  updates: Partial<Omit<UserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<UserPreferences | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_preferences')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating user preferences:', error)
    return null
  }

  return data
}

/**
 * Mark storage onboarding as completed
 */
export async function completeStorageOnboarding(userId: string): Promise<boolean> {
  const result = await updateUserPreferences(userId, {
    storage_onboarding_completed: true,
    storage_onboarding_completed_at: new Date().toISOString(),
    storage_onboarding_skipped: false
  })

  return result !== null
}

/**
 * Mark storage onboarding as skipped
 */
export async function skipStorageOnboarding(userId: string): Promise<boolean> {
  const result = await updateUserPreferences(userId, {
    storage_onboarding_skipped: true,
    storage_onboarding_completed: false
  })

  return result !== null
}

/**
 * Check if user should see storage onboarding wizard
 */
export async function shouldShowStorageOnboarding(userId: string): Promise<boolean> {
  const preferences = await getUserPreferences(userId)

  if (!preferences) {
    return true // Show if we can't determine (safe default)
  }

  // Don't show if already completed or skipped
  if (preferences.storage_onboarding_completed || preferences.storage_onboarding_skipped) {
    return false
  }

  return true
}

/**
 * Update files view mode preference
 */
export async function updateFilesViewMode(
  userId: string,
  viewMode: 'grid' | 'list'
): Promise<boolean> {
  const result = await updateUserPreferences(userId, {
    files_view_mode: viewMode
  })

  return result !== null
}

/**
 * Update theme preference
 */
export async function updateThemePreference(
  userId: string,
  theme: 'light' | 'dark' | 'system'
): Promise<boolean> {
  const result = await updateUserPreferences(userId, {
    theme
  })

  return result !== null
}

/**
 * Toggle auto-sync preference
 */
export async function toggleAutoSync(userId: string, enabled: boolean): Promise<boolean> {
  const result = await updateUserPreferences(userId, {
    auto_sync_enabled: enabled
  })

  return result !== null
}

/**
 * Toggle cache files locally preference
 */
export async function toggleCacheFiles(userId: string, enabled: boolean): Promise<boolean> {
  const result = await updateUserPreferences(userId, {
    cache_files_locally: enabled
  })

  return result !== null
}

/**
 * Toggle show hidden files preference
 */
export async function toggleShowHiddenFiles(userId: string, enabled: boolean): Promise<boolean> {
  const result = await updateUserPreferences(userId, {
    show_hidden_files: enabled
  })

  return result !== null
}

/**
 * Reset storage onboarding (for testing or re-showing wizard)
 */
export async function resetStorageOnboarding(userId: string): Promise<boolean> {
  const result = await updateUserPreferences(userId, {
    storage_onboarding_completed: false,
    storage_onboarding_completed_at: null,
    storage_onboarding_skipped: false
  })

  return result !== null
}
