'use server'

/**
 * Extended CRM Server Actions - Covers all 6 CRM-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getCRMActivities(contactId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('crm_activities').select('*').eq('contact_id', contactId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createCRMActivity(contactId: string, userId: string, input: { type: string; subject: string; description?: string; due_date?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('crm_activities').insert({ contact_id: contactId, user_id: userId, ...input, status: 'pending' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateCRMActivity(activityId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('crm_activities').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', activityId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function completeCRMActivity(activityId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('crm_activities').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', activityId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCRMContacts(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('crm_contacts').select('*').eq('user_id', userId).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createCRMContact(userId: string, input: { name: string; email?: string; phone?: string; company?: string; title?: string; source?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('crm_contacts').insert({ user_id: userId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateCRMContact(contactId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('crm_contacts').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', contactId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteCRMContact(contactId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('crm_contacts').delete().eq('id', contactId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCRMDealProducts(dealId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('crm_deal_products').select('*').eq('deal_id', dealId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addCRMDealProduct(dealId: string, input: { product_id: string; quantity: number; price: number; discount?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('crm_deal_products').insert({ deal_id: dealId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateCRMDealProduct(dealProductId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('crm_deal_products').update(updates).eq('id', dealProductId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeCRMDealProduct(dealProductId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('crm_deal_products').delete().eq('id', dealProductId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCRMDeals(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('crm_deals').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createCRMDeal(userId: string, input: { name: string; contact_id?: string; value: number; stage: string; expected_close_date?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('crm_deals').insert({ user_id: userId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateCRMDeal(dealId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('crm_deals').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', dealId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function moveCRMDealStage(dealId: string, stage: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('crm_deals').update({ stage, updated_at: new Date().toISOString() }).eq('id', dealId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function closeCRMDeal(dealId: string, won: boolean) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('crm_deals').update({ stage: won ? 'won' : 'lost', closed_at: new Date().toISOString() }).eq('id', dealId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCRMLeads(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('crm_leads').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createCRMLead(userId: string, input: { name: string; email?: string; phone?: string; company?: string; source?: string; notes?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('crm_leads').insert({ user_id: userId, ...input, status: 'new' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateCRMLead(leadId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('crm_leads').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', leadId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function convertCRMLeadToContact(leadId: string) {
  try { const supabase = await createClient(); const { data: lead, error: leadError } = await supabase.from('crm_leads').select('*').eq('id', leadId).single(); if (leadError) throw leadError; const { data: contact, error: contactError } = await supabase.from('crm_contacts').insert({ user_id: lead.user_id, name: lead.name, email: lead.email, phone: lead.phone, company: lead.company, source: lead.source }).select().single(); if (contactError) throw contactError; await supabase.from('crm_leads').update({ status: 'converted', converted_at: new Date().toISOString() }).eq('id', leadId); return { success: true, data: contact } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCRMNotes(entityType: string, entityId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('crm_notes').select('*').eq('entity_type', entityType).eq('entity_id', entityId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createCRMNote(userId: string, entityType: string, entityId: string, content: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('crm_notes').insert({ user_id: userId, entity_type: entityType, entity_id: entityId, content }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateCRMNote(noteId: string, content: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('crm_notes').update({ content, updated_at: new Date().toISOString() }).eq('id', noteId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteCRMNote(noteId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('crm_notes').delete().eq('id', noteId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
