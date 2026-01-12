'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'
import { hasPermission } from '@/lib/auth/permissions'

const logger = createFeatureLogger('security-actions')

// =====================================================
// SECURITY SETTINGS SERVER ACTIONS
// =====================================================

export async function updateSecuritySettings(formData: FormData): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    // Permission check - admin or manage_team required for security settings
    if (!(await hasPermission(user.id, 'manage_team'))) {
      logger.warn('Permission denied for security settings update', { userId: user.id })
      return actionError('Insufficient permissions to modify security settings', 'FORBIDDEN')
    }

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

    if (error) return actionError(error.message, 'DATABASE_ERROR')

    revalidatePath('/dashboard/security-v2')
    return actionSuccess(data, 'Security settings updated successfully')
  } catch (error: any) {
    logger.error('Error updating security settings:', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function enable2FA(method: 'app' | 'sms' | 'email'): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

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

    if (error) return actionError(error.message, 'DATABASE_ERROR')

    revalidatePath('/dashboard/security-v2')
    return actionSuccess(data, '2FA enabled successfully')
  } catch (error: any) {
    logger.error('Error enabling 2FA:', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function disable2FA(): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

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

    if (error) return actionError(error.message, 'DATABASE_ERROR')

    revalidatePath('/dashboard/security-v2')
    return actionSuccess(data, '2FA disabled successfully')
  } catch (error: any) {
    logger.error('Error disabling 2FA:', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function enableBiometric(type: 'fingerprint' | 'face_id'): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('security_settings')
      .update({
        biometric_enabled: true,
        biometric_type: type
      })
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) return actionError(error.message, 'DATABASE_ERROR')

    revalidatePath('/dashboard/security-v2')
    return actionSuccess(data, 'Biometric authentication enabled successfully')
  } catch (error: any) {
    logger.error('Error enabling biometric:', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function disableBiometric(): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('security_settings')
      .update({
        biometric_enabled: false,
        biometric_type: null
      })
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) return actionError(error.message, 'DATABASE_ERROR')

    revalidatePath('/dashboard/security-v2')
    return actionSuccess(data, 'Biometric authentication disabled successfully')
  } catch (error: any) {
    logger.error('Error disabling biometric:', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function addToIPBlacklist(ip: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    // Get current settings
    const { data: current } = await supabase
      .from('security_settings')
      .select('ip_blacklist')
      .eq('user_id', user.id)
      .single()

    const currentBlacklist = current?.ip_blacklist || []
    if (currentBlacklist.includes(ip)) {
      return actionError('IP already in blacklist', 'VALIDATION_ERROR')
    }

    const { data, error } = await supabase
      .from('security_settings')
      .update({ ip_blacklist: [...currentBlacklist, ip] })
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) return actionError(error.message, 'DATABASE_ERROR')

    revalidatePath('/dashboard/security-v2')
    return actionSuccess(data, 'IP added to blacklist successfully')
  } catch (error: any) {
    logger.error('Error adding IP to blacklist:', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function removeFromIPBlacklist(ip: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

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

    if (error) return actionError(error.message, 'DATABASE_ERROR')

    revalidatePath('/dashboard/security-v2')
    return actionSuccess(data, 'IP removed from blacklist successfully')
  } catch (error: any) {
    logger.error('Error removing IP from blacklist:', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// =====================================================
// SECURITY EVENTS SERVER ACTIONS
// =====================================================

export async function resolveSecurityEvent(id: string, notes?: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

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

    if (error) return actionError(error.message, 'DATABASE_ERROR')

    revalidatePath('/dashboard/security-v2')
    return actionSuccess(data, 'Security event resolved successfully')
  } catch (error: any) {
    logger.error('Error resolving security event:', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function blockIPFromEvent(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    // Get the event
    const { data: event } = await supabase
      .from('security_events')
      .select('ip_address')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!event?.ip_address) {
      return actionError('No IP address to block', 'VALIDATION_ERROR')
    }

    // Mark event as blocked
    const { error: eventError } = await supabase
      .from('security_events')
      .update({ is_blocked: true })
      .eq('id', id)

    if (eventError) return actionError(eventError.message, 'DATABASE_ERROR')

    // Add to blacklist
    const result = await addToIPBlacklist(event.ip_address)

    revalidatePath('/dashboard/security-v2')
    return result
  } catch (error: any) {
    logger.error('Error blocking IP from event:', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// =====================================================
// USER SESSIONS SERVER ACTIONS
// =====================================================

export async function terminateSession(id: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { error } = await supabase
      .from('user_sessions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) return actionError(error.message, 'DATABASE_ERROR')

    revalidatePath('/dashboard/security-v2')
    return actionSuccess(undefined, 'Session terminated successfully')
  } catch (error: any) {
    logger.error('Error terminating session:', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function terminateAllOtherSessions(): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { error } = await supabase
      .from('user_sessions')
      .delete()
      .eq('user_id', user.id)
      .eq('is_current', false)

    if (error) return actionError(error.message, 'DATABASE_ERROR')

    revalidatePath('/dashboard/security-v2')
    return actionSuccess(undefined, 'All other sessions terminated successfully')
  } catch (error: any) {
    logger.error('Error terminating all other sessions:', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// =====================================================
// INITIALIZE SECURITY SETTINGS
// =====================================================

export async function initializeSecuritySettings(): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    // Check if settings exist
    const { data: existing } = await supabase
      .from('security_settings')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existing) {
      return actionSuccess(existing, 'Settings already exist')
    }

    // Create default settings
    const { data, error } = await supabase
      .from('security_settings')
      .insert({ user_id: user.id })
      .select()
      .single()

    if (error) return actionError(error.message, 'DATABASE_ERROR')

    revalidatePath('/dashboard/security-v2')
    return actionSuccess(data, 'Security settings initialized successfully')
  } catch (error: any) {
    logger.error('Error initializing security settings:', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
