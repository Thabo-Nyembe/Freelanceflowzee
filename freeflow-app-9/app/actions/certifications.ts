'use server'
import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import type { Certification } from '@/lib/hooks/use-certifications'

export async function createCertification(data: Partial<Certification>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: certification, error } = await supabase
    .from('certifications')
    .insert({
      ...data,
      user_id: user.id
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/certifications-v2')
  return certification
}

export async function updateCertification(id: string, data: Partial<Certification>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: certification, error } = await supabase
    .from('certifications')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/certifications-v2')
  return certification
}

export async function deleteCertification(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('certifications')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/dashboard/certifications-v2')
}

export async function verifyCertification(id: string, verificationCode: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: certification, error } = await supabase
    .from('certifications')
    .update({
      verification_status: 'verified',
      verification_code: verificationCode,
      verified_at: new Date().toISOString(),
      verified_by: user.id
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/certifications-v2')
  return certification
}

export async function renewCertification(id: string, newExpiryDate: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: certification, error } = await supabase
    .from('certifications')
    .update({
      status: 'active',
      is_expired: false,
      requires_renewal: false,
      expiry_date: newExpiryDate,
      last_renewed_at: new Date().toISOString(),
      renewal_date: newExpiryDate
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/certifications-v2')
  return certification
}

export async function markExpired(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: certification, error } = await supabase
    .from('certifications')
    .update({
      status: 'expired',
      is_expired: true,
      is_valid: false
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/certifications-v2')
  return certification
}

export async function updateCEHours(id: string, hours: number) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: cert } = await supabase
    .from('certifications')
    .select('continuing_education_hours, required_ce_hours')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!cert) throw new Error('Certification not found')

  const newCEHours = (cert.continuing_education_hours || 0) + hours
  const requiresRenewal = cert.required_ce_hours ? newCEHours >= cert.required_ce_hours : false

  const { data: certification, error } = await supabase
    .from('certifications')
    .update({
      continuing_education_hours: newCEHours,
      requires_renewal: requiresRenewal
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/certifications-v2')
  return certification
}
