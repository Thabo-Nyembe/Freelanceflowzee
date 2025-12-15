'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

// =====================================================
// SECURITY SETTINGS SERVER ACTIONS
// =====================================================

export async function updateSecuritySettings(formData: FormData) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const updates: Record<string, any> = {}

  // 2FA settings
  const twoFactorEnabled = formData.get('two_factor_enabled')
  if (twoFactorEnabled !== null) {
    updates.two_factor_enabled = twoFactorEnabled === 'true'
    if (twoFactorEnabled === 'true') {
      updates.two_factor_verified_at = new Date().toISOString()
    }
  }

  const twoFactorMethod = formData.get('two_factor_method')
  if (twoFactorMethod) updates.two_factor_method = twoFactorMethod

  // Biometric settings
  const biometricEnabled = formData.get('biometric_enabled')
  if (biometricEnabled !== null) updates.biometric_enabled = biometricEnabled === 'true'

  const biometricType = formData.get('biometric_type')
  if (biometricType) updates.biometric_type = biometricType

  // Session settings
  const sessionTimeoutMinutes = formData.get('session_timeout_minutes')
  if (sessionTimeoutMinutes) updates.session_timeout_minutes = parseInt(sessionTimeoutMinutes as string)

  const maxActiveSessions = formData.get('max_active_sessions')
  if (maxActiveSessions) updates.max_active_sessions = parseInt(maxActiveSessions as string)

  const require2faForSensitive = formData.get('require_2fa_for_sensitive')
  if (require2faForSensitive !== null) updates.require_2fa_for_sensitive = require2faForSensitive === 'true'

  // IP settings
  const ipWhitelistEnabled = formData.get('ip_whitelist_enabled')
  if (ipWhitelistEnabled !== null) updates.ip_whitelist_enabled = ipWhitelistEnabled === 'true'

  const ipWhitelist = formData.get('ip_whitelist')
  if (ipWhitelist) updates.ip_whitelist = JSON.parse(ipWhitelist as string)

  const ipBlacklist = formData.get('ip_blacklist')
  if (ipBlacklist) updates.ip_blacklist = JSON.parse(ipBlacklist as string)

  // Password policy
  const passwordMinLength = formData.get('password_min_length')
  if (passwordMinLength) updates.password_min_length = parseInt(passwordMinLength as string)

  const passwordRequireUppercase = formData.get('password_require_uppercase')
  if (passwordRequireUppercase !== null) updates.password_require_uppercase = passwordRequireUppercase === 'true'

  const passwordRequireNumbers = formData.get('password_require_numbers')
  if (passwordRequireNumbers !== null) updates.password_require_numbers = passwordRequireNumbers === 'true'

  const passwordRequireSpecial = formData.get('password_require_special')
  if (passwordRequireSpecial !== null) updates.password_require_special = passwordRequireSpecial === 'true'

  const passwordExpiryDays = formData.get('password_expiry_days')
  if (passwordExpiryDays) updates.password_expiry_days = parseInt(passwordExpiryDays as string)

  // Login settings
  const maxLoginAttempts = formData.get('max_login_attempts')
  if (maxLoginAttempts) updates.max_login_attempts = parseInt(maxLoginAttempts as string)

  const lockoutDurationMinutes = formData.get('lockout_duration_minutes')
  if (lockoutDurationMinutes) updates.lockout_duration_minutes = parseInt(lockoutDurationMinutes as string)

  const { data, error } = await supabase
    .from('security_settings')
    .update(updates)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/security-v2')
  return { success: true, data }
}

export async function enable2FA(method: 'app' | 'sms' | 'email') {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('security_settings')
    .update({
      two_factor_enabled: true,
      two_factor_method: method,
      two_factor_verified_at: new Date().toISOString()
    })
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/security-v2')
  return { success: true, data }
}

export async function disable2FA() {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('security_settings')
    .update({
      two_factor_enabled: false,
      two_factor_method: null,
      two_factor_verified_at: null
    })
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/security-v2')
  return { success: true, data }
}

export async function enableBiometric(type: 'fingerprint' | 'face_id') {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('security_settings')
    .update({
      biometric_enabled: true,
      biometric_type: type
    })
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/security-v2')
  return { success: true, data }
}

export async function disableBiometric() {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('security_settings')
    .update({
      biometric_enabled: false,
      biometric_type: null
    })
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/security-v2')
  return { success: true, data }
}

export async function addToIPBlacklist(ip: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Get current settings
  const { data: current } = await supabase
    .from('security_settings')
    .select('ip_blacklist')
    .eq('user_id', user.id)
    .single()

  const currentBlacklist = current?.ip_blacklist || []
  if (currentBlacklist.includes(ip)) {
    return { success: false, error: 'IP already in blacklist' }
  }

  const { data, error } = await supabase
    .from('security_settings')
    .update({ ip_blacklist: [...currentBlacklist, ip] })
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/security-v2')
  return { success: true, data }
}

export async function removeFromIPBlacklist(ip: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Get current settings
  const { data: current } = await supabase
    .from('security_settings')
    .select('ip_blacklist')
    .eq('user_id', user.id)
    .single()

  const currentBlacklist = current?.ip_blacklist || []

  const { data, error } = await supabase
    .from('security_settings')
    .update({ ip_blacklist: currentBlacklist.filter((i: string) => i !== ip) })
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/security-v2')
  return { success: true, data }
}

// =====================================================
// SECURITY EVENTS SERVER ACTIONS
// =====================================================

export async function resolveSecurityEvent(id: string, notes?: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('security_events')
    .update({
      is_resolved: true,
      resolved_by: user.id,
      resolved_at: new Date().toISOString(),
      resolution_notes: notes
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/security-v2')
  return { success: true, data }
}

export async function blockIPFromEvent(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Get the event
  const { data: event } = await supabase
    .from('security_events')
    .select('ip_address')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!event?.ip_address) {
    return { success: false, error: 'No IP address to block' }
  }

  // Mark event as blocked
  const { error: eventError } = await supabase
    .from('security_events')
    .update({ is_blocked: true })
    .eq('id', id)

  if (eventError) return { success: false, error: eventError.message }

  // Add to blacklist
  const result = await addToIPBlacklist(event.ip_address)

  revalidatePath('/dashboard/security-v2')
  return result
}

// =====================================================
// USER SESSIONS SERVER ACTIONS
// =====================================================

export async function terminateSession(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('user_sessions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/security-v2')
  return { success: true }
}

export async function terminateAllOtherSessions() {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('user_sessions')
    .delete()
    .eq('user_id', user.id)
    .eq('is_current', false)

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/security-v2')
  return { success: true }
}

// =====================================================
// INITIALIZE SECURITY SETTINGS
// =====================================================

export async function initializeSecuritySettings() {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Check if settings exist
  const { data: existing } = await supabase
    .from('security_settings')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (existing) {
    return { success: true, message: 'Settings already exist' }
  }

  // Create default settings
  const { data, error } = await supabase
    .from('security_settings')
    .insert({ user_id: user.id })
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/security-v2')
  return { success: true, data }
}
