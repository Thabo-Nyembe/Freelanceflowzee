'use server'

/**
 * Extended Contract Server Actions - Covers all Contract-related tables
 * Tables: contracts, contract_templates, contract_signatures, contract_revisions
 */

import { createClient } from '@/lib/supabase/server'

export async function getContract(contractId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('contracts').select('*, contract_signatures(*), contract_revisions(*)').eq('id', contractId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createContract(contractData: { title: string; description?: string; user_id: string; client_id?: string; project_id?: string; contract_type?: string; content: string; terms?: Record<string, any>; value?: number; currency?: string; start_date?: string; end_date?: string; template_id?: string }) {
  try { const supabase = await createClient(); const contractNumber = `CTR-${Date.now()}`; const { data, error } = await supabase.from('contracts').insert({ ...contractData, contract_number: contractNumber, status: 'draft', version: 1, currency: contractData.currency || 'USD', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateContract(contractId: string, updates: Partial<{ title: string; description: string; content: string; terms: Record<string, any>; value: number; currency: string; start_date: string; end_date: string; status: string }>) {
  try { const supabase = await createClient(); const { data: current } = await supabase.from('contracts').select('content, version').eq('id', contractId).single(); if (current && updates.content && updates.content !== current.content) { await supabase.from('contract_revisions').insert({ contract_id: contractId, version: current.version, content: current.content, created_at: new Date().toISOString() }); updates = { ...updates, version: current.version + 1 } as any } const { data, error } = await supabase.from('contracts').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', contractId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteContract(contractId: string) {
  try { const supabase = await createClient(); await supabase.from('contract_signatures').delete().eq('contract_id', contractId); await supabase.from('contract_revisions').delete().eq('contract_id', contractId); const { error } = await supabase.from('contracts').delete().eq('id', contractId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getContracts(userId: string, options?: { status?: string; client_id?: string; project_id?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('contracts').select('*, contract_signatures(*)').eq('user_id', userId); if (options?.status) query = query.eq('status', options.status); if (options?.client_id) query = query.eq('client_id', options.client_id); if (options?.project_id) query = query.eq('project_id', options.project_id); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function sendContractForSignature(contractId: string, signers: { email: string; name: string; role?: string }[]) {
  try { const supabase = await createClient(); const signatureData = signers.map((signer, index) => ({ contract_id: contractId, signer_email: signer.email, signer_name: signer.name, signer_role: signer.role || 'signer', order: index + 1, status: 'pending', created_at: new Date().toISOString() })); const { data: signatures } = await supabase.from('contract_signatures').insert(signatureData).select(); await supabase.from('contracts').update({ status: 'pending_signature', sent_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', contractId); return { success: true, data: signatures } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function signContract(signatureId: string, signatureData: { signature_image?: string; ip_address?: string; user_agent?: string }) {
  try { const supabase = await createClient(); const { data: signature, error } = await supabase.from('contract_signatures').update({ status: 'signed', signed_at: new Date().toISOString(), signature_image: signatureData.signature_image, ip_address: signatureData.ip_address, user_agent: signatureData.user_agent }).eq('id', signatureId).select().single(); if (error) throw error; const { data: allSignatures } = await supabase.from('contract_signatures').select('status').eq('contract_id', signature.contract_id); const allSigned = allSignatures?.every(s => s.status === 'signed'); if (allSigned) { await supabase.from('contracts').update({ status: 'signed', signed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', signature.contract_id) } return { success: true, data: signature } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function declineContract(signatureId: string, reason?: string) {
  try { const supabase = await createClient(); const { data: signature, error } = await supabase.from('contract_signatures').update({ status: 'declined', declined_at: new Date().toISOString(), decline_reason: reason }).eq('id', signatureId).select().single(); if (error) throw error; await supabase.from('contracts').update({ status: 'declined', updated_at: new Date().toISOString() }).eq('id', signature.contract_id); return { success: true, data: signature } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getContractSignatures(contractId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('contract_signatures').select('*').eq('contract_id', contractId).order('order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getContractRevisions(contractId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('contract_revisions').select('*').eq('contract_id', contractId).order('version', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getContractTemplate(templateId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('contract_templates').select('*').eq('id', templateId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createContractTemplate(templateData: { name: string; description?: string; user_id: string; content: string; category?: string; variables?: string[]; is_public?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('contract_templates').insert({ ...templateData, is_public: templateData.is_public ?? false, use_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateContractTemplate(templateId: string, updates: Partial<{ name: string; description: string; content: string; category: string; variables: string[]; is_public: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('contract_templates').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', templateId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getContractTemplates(userId: string, options?: { category?: string; include_public?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('contract_templates').select('*'); if (options?.include_public) { query = query.or(`user_id.eq.${userId},is_public.eq.true`) } else { query = query.eq('user_id', userId) } if (options?.category) query = query.eq('category', options.category); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createContractFromTemplate(templateId: string, contractData: { title: string; user_id: string; client_id?: string; project_id?: string; variables?: Record<string, string> }) {
  try { const supabase = await createClient(); const { data: template } = await supabase.from('contract_templates').select('*').eq('id', templateId).single(); if (!template) return { success: false, error: 'Template not found' }; let content = template.content; if (contractData.variables) { for (const [key, value] of Object.entries(contractData.variables)) { content = content.replace(new RegExp(`{{${key}}}`, 'g'), value) } } await supabase.from('contract_templates').update({ use_count: template.use_count + 1 }).eq('id', templateId); const contractNumber = `CTR-${Date.now()}`; const { data, error } = await supabase.from('contracts').insert({ title: contractData.title, user_id: contractData.user_id, client_id: contractData.client_id, project_id: contractData.project_id, template_id: templateId, content, contract_number: contractNumber, status: 'draft', version: 1, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function duplicateContract(contractId: string) {
  try { const supabase = await createClient(); const { data: original } = await supabase.from('contracts').select('*').eq('id', contractId).single(); if (!original) return { success: false, error: 'Contract not found' }; const { id, contract_number, created_at, updated_at, sent_at, signed_at, status, version, ...rest } = original; const newContractNumber = `CTR-${Date.now()}`; const { data, error } = await supabase.from('contracts').insert({ ...rest, title: `${original.title} (Copy)`, contract_number: newContractNumber, status: 'draft', version: 1, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getContractStats(userId: string) {
  try { const supabase = await createClient(); const { data: contracts } = await supabase.from('contracts').select('status, value').eq('user_id', userId); if (!contracts) return { success: true, data: { total: 0, draft: 0, pending: 0, signed: 0, declined: 0, totalValue: 0 } }; const total = contracts.length; const draft = contracts.filter(c => c.status === 'draft').length; const pending = contracts.filter(c => c.status === 'pending_signature').length; const signed = contracts.filter(c => c.status === 'signed').length; const declined = contracts.filter(c => c.status === 'declined').length; const totalValue = contracts.reduce((sum, c) => sum + (c.value || 0), 0); return { success: true, data: { total, draft, pending, signed, declined, totalValue } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
