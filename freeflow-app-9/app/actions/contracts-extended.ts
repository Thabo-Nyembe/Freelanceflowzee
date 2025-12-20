'use server'

/**
 * Extended Contracts Server Actions
 * Tables: contracts, contract_versions, contract_signatures, contract_templates
 */

import { createClient } from '@/lib/supabase/server'

export async function getContract(contractId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('contracts').select('*, contract_versions(*), contract_signatures(*)').eq('id', contractId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createContract(contractData: { user_id: string; title: string; content: string; type?: string; parties: string[]; start_date?: string; end_date?: string; value?: number; currency?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('contracts').insert({ ...contractData, status: 'draft', version: 1, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateContract(contractId: string, updates: Partial<{ title: string; content: string; parties: string[]; start_date: string; end_date: string; value: number }>, createVersion?: boolean) {
  try { const supabase = await createClient(); if (createVersion) { const { data: current } = await supabase.from('contracts').select('content, version').eq('id', contractId).single(); if (current) await supabase.from('contract_versions').insert({ contract_id: contractId, version: current.version, content: current.content, created_at: new Date().toISOString() }); updates = { ...updates, version: (current?.version || 0) + 1 } as any }; const { data, error } = await supabase.from('contracts').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', contractId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteContract(contractId: string) {
  try { const supabase = await createClient(); await supabase.from('contract_versions').delete().eq('contract_id', contractId); await supabase.from('contract_signatures').delete().eq('contract_id', contractId); const { error } = await supabase.from('contracts').delete().eq('id', contractId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getContracts(options?: { user_id?: string; status?: string; type?: string; party_id?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('contracts').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.status) query = query.eq('status', options.status); if (options?.type) query = query.eq('type', options.type); if (options?.party_id) query = query.contains('parties', [options.party_id]); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function sendForSignature(contractId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('contracts').update({ status: 'pending_signature', sent_at: new Date().toISOString() }).eq('id', contractId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function signContract(contractId: string, signerId: string, signatureData: { signature_image?: string; ip_address?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('contract_signatures').insert({ contract_id: contractId, signer_id: signerId, ...signatureData, signed_at: new Date().toISOString() }).select().single(); if (error) throw error; const { data: contract } = await supabase.from('contracts').select('parties').eq('id', contractId).single(); const { count } = await supabase.from('contract_signatures').select('*', { count: 'exact', head: true }).eq('contract_id', contractId); if (count === contract?.parties?.length) await supabase.from('contracts').update({ status: 'signed', completed_at: new Date().toISOString() }).eq('id', contractId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getContractVersions(contractId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('contract_versions').select('*').eq('contract_id', contractId).order('version', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createContractFromTemplate(templateId: string, userId: string, variables: Record<string, any>) {
  try { const supabase = await createClient(); const { data: template } = await supabase.from('contract_templates').select('*').eq('id', templateId).single(); if (!template) throw new Error('Template not found'); let content = template.content; Object.entries(variables).forEach(([key, value]) => { content = content.replace(new RegExp(`{{${key}}}`, 'g'), String(value)) }); const { data, error } = await supabase.from('contracts').insert({ user_id: userId, title: template.name, content, type: template.type, template_id: templateId, status: 'draft', version: 1, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getContractTemplates(options?: { type?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('contract_templates').select('*'); if (options?.type) query = query.eq('type', options.type); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
