/**
 * Server-side OAuth Profile Sync Utility
 * Used in API routes and server components
 */

import { SupabaseClient } from '@supabase/supabase-js'

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  provider?: string
  provider_id?: string
  metadata?: {
    github_username?: string
    linkedin_url?: string
    company?: string
    job_title?: string
    location?: string
    bio?: string
  }
}

/**
 * Extract profile data from OAuth provider metadata
 */
export function extractProviderProfile(
  provider: string,
  providerData: any
): Partial<UserProfile> {
  const profile: Partial<UserProfile> = {
    provider,
    provider_id: providerData.sub || providerData.id,
  }

  switch (provider) {
    case 'google':
      profile.full_name = providerData.name
      profile.avatar_url = providerData.picture
      profile.email = providerData.email
      break

    case 'github':
      profile.full_name = providerData.name || providerData.login
      profile.avatar_url = providerData.avatar_url
      profile.email = providerData.email
      profile.metadata = {
        github_username: providerData.login,
        company: providerData.company,
        location: providerData.location,
        bio: providerData.bio,
      }
      break

    case 'linkedin':
      profile.full_name = `${providerData.given_name || ''} ${providerData.family_name || ''}`.trim()
      profile.avatar_url = providerData.picture
      profile.email = providerData.email
      profile.metadata = {
        linkedin_url: providerData.profile_url,
      }
      break

    case 'apple':
      profile.full_name = providerData.name
        ? `${providerData.name.firstName || ''} ${providerData.name.lastName || ''}`.trim()
        : undefined
      profile.email = providerData.email
      break

    case 'figma':
      profile.full_name = providerData.name
      profile.avatar_url = providerData.img_url
      profile.email = providerData.email
      break

    case 'gitlab':
      profile.full_name = providerData.name
      profile.avatar_url = providerData.avatar_url
      profile.email = providerData.email
      profile.metadata = {
        company: providerData.organization,
        location: providerData.location,
        bio: providerData.bio,
      }
      break

    case 'notion':
      profile.full_name = providerData.name
      profile.avatar_url = providerData.avatar_url
      profile.email = providerData.person?.email
      break

    case 'slack':
      profile.full_name = providerData.user?.name || providerData.user?.real_name
      profile.avatar_url = providerData.user?.image_512 || providerData.user?.image_192
      profile.email = providerData.user?.email
      profile.metadata = {
        job_title: providerData.user?.profile?.title,
      }
      break

    case 'zoom':
      profile.full_name = `${providerData.first_name || ''} ${providerData.last_name || ''}`.trim()
      profile.avatar_url = providerData.pic_url
      profile.email = providerData.email
      break

    default:
      profile.full_name = providerData.name
      profile.avatar_url = providerData.picture || providerData.avatar_url
      profile.email = providerData.email
  }

  return profile
}

/**
 * Merge OAuth profile with existing profile (preserves user customizations)
 * Server-side version that accepts a Supabase client instance
 */
export async function mergeOAuthProfileServer(
  supabase: SupabaseClient,
  userId: string,
  newProfile: Partial<UserProfile>
) {
  try {
    // Get existing profile
    const { data: existing } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    // Merge profiles - preserve user customizations
    const merged = {
      user_id: userId,
      // Only update if not already set by user
      full_name: existing?.full_name || newProfile.full_name,
      avatar_url: existing?.avatar_url || newProfile.avatar_url,
      provider: newProfile.provider, // Always update provider
      provider_id: newProfile.provider_id,
      metadata: {
        ...(existing?.metadata || {}),
        ...(newProfile.metadata || {}),
      },
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(merged, { onConflict: 'user_id' })

    if (error) {
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    return { success: false, error }
  }
}

/**
 * Sync OAuth profile to Supabase database (server-side)
 */
export async function syncOAuthProfileServer(
  supabase: SupabaseClient,
  userId: string,
  profile: Partial<UserProfile>
) {
  try {
    // Update or insert user profile
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        provider: profile.provider,
        provider_id: profile.provider_id,
        metadata: profile.metadata || {},
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      })

    if (error) {
      console.error('Profile sync error:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Profile sync exception:', error)
    return { success: false, error }
  }
}
