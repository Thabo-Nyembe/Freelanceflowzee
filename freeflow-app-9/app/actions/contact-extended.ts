'use server'

/**
 * Extended Contact Server Actions - Covers all Contact-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getContacts(userId: string, contactType?: string, groupId?: string, limit = 100) {
  try { const supabase = await createClient(); let query = supabase.from('contacts').select('*').eq('user_id', userId).order('name', { ascending: true }).limit(limit); if (contactType) query = query.eq('contact_type', contactType); if (groupId) query = query.contains('group_ids', [groupId]); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getContact(contactId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('contacts').select('*').eq('id', contactId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createContact(input: { user_id: string; name: string; email?: string; phone?: string; company?: string; title?: string; contact_type?: string; notes?: string; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('contacts').insert({ ...input, is_active: true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateContact(contactId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('contacts').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', contactId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteContact(contactId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('contacts').delete().eq('id', contactId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function searchContacts(userId: string, query: string, limit = 20) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('contacts').select('*').eq('user_id', userId).or(`name.ilike.%${query}%,email.ilike.%${query}%,company.ilike.%${query}%`).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getContactGroups(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('contact_groups').select('*').eq('user_id', userId).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createContactGroup(input: { user_id: string; name: string; description?: string; color?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('contact_groups').insert(input).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateContactGroup(groupId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('contact_groups').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', groupId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteContactGroup(groupId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('contact_groups').delete().eq('id', groupId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addContactToGroup(contactId: string, groupId: string) {
  try { const supabase = await createClient(); const { data: contact, error: getError } = await supabase.from('contacts').select('group_ids').eq('id', contactId).single(); if (getError) throw getError; const groupIds = contact?.group_ids || []; if (!groupIds.includes(groupId)) { groupIds.push(groupId); const { data, error } = await supabase.from('contacts').update({ group_ids: groupIds }).eq('id', contactId).select().single(); if (error) throw error; return { success: true, data }; } return { success: true, data: contact } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeContactFromGroup(contactId: string, groupId: string) {
  try { const supabase = await createClient(); const { data: contact, error: getError } = await supabase.from('contacts').select('group_ids').eq('id', contactId).single(); if (getError) throw getError; const groupIds = (contact?.group_ids || []).filter((id: string) => id !== groupId); const { data, error } = await supabase.from('contacts').update({ group_ids: groupIds }).eq('id', contactId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function submitContactForm(formId: string, data: any, metadata?: any) {
  try { const supabase = await createClient(); const { data: submission, error } = await supabase.from('contact_form_submissions').insert({ form_id: formId, data, metadata, status: 'new' }).select().single(); if (error) throw error; return { success: true, data: submission } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getContactFormSubmissions(formId: string, status?: string, limit = 50) {
  try { const supabase = await createClient(); let query = supabase.from('contact_form_submissions').select('*').eq('form_id', formId).order('created_at', { ascending: false }).limit(limit); if (status) query = query.eq('status', status); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function updateContactFormSubmissionStatus(submissionId: string, status: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('contact_form_submissions').update({ status, updated_at: new Date().toISOString() }).eq('id', submissionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
