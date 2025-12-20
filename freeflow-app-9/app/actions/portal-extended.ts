'use server'

/**
 * Extended Portal Server Actions - Covers all 11 Portal-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getPortalClientActivities(clientId: string, limit?: number) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portal_client_activities').select('*').eq('client_id', clientId).order('created_at', { ascending: false }).limit(limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function logPortalClientActivity(clientId: string, action: string, details?: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portal_client_activities').insert({ client_id: clientId, action, details }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPortalClientMetrics(clientId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portal_client_metrics').select('*').eq('client_id', clientId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePortalClientMetrics(clientId: string, metrics: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portal_client_metrics').upsert({ client_id: clientId, ...metrics, updated_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPortalClients(ownerId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portal_clients').select('*').eq('owner_id', ownerId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createPortalClient(ownerId: string, input: { name: string; email: string; company?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portal_clients').insert({ owner_id: ownerId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePortalClient(clientId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portal_clients').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', clientId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPortalCommunications(clientId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portal_communications').select('*').eq('client_id', clientId).order('sent_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function sendPortalCommunication(clientId: string, input: { type: string; subject: string; content: string; sent_by: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portal_communications').insert({ client_id: clientId, ...input, sent_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPortalFileVersions(fileId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portal_file_versions').select('*').eq('file_id', fileId).order('version_number', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createPortalFileVersion(fileId: string, fileUrl: string, versionNumber: number, uploadedBy: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portal_file_versions').insert({ file_id: fileId, file_url: fileUrl, version_number: versionNumber, uploaded_by: uploadedBy }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPortalFiles(clientId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portal_files').select('*').eq('client_id', clientId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function uploadPortalFile(clientId: string, input: { name: string; file_url: string; file_type: string; file_size: number; uploaded_by: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portal_files').insert({ client_id: clientId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deletePortalFile(fileId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('portal_files').delete().eq('id', fileId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPortalInvoiceItems(invoiceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portal_invoice_items').select('*').eq('invoice_id', invoiceId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addPortalInvoiceItem(invoiceId: string, input: { description: string; quantity: number; unit_price: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portal_invoice_items').insert({ invoice_id: invoiceId, ...input, total: input.quantity * input.unit_price }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPortalInvoices(clientId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portal_invoices').select('*').eq('client_id', clientId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createPortalInvoice(clientId: string, input: { invoice_number: string; amount: number; due_date: string; created_by: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portal_invoices').insert({ client_id: clientId, ...input, status: 'draft' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePortalInvoiceStatus(invoiceId: string, status: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portal_invoices').update({ status, updated_at: new Date().toISOString() }).eq('id', invoiceId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPortalProjectMilestones(projectId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portal_project_milestones').select('*').eq('project_id', projectId).order('due_date', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createPortalProjectMilestone(projectId: string, input: { name: string; description?: string; due_date: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portal_project_milestones').insert({ project_id: projectId, ...input, status: 'pending' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePortalProjectMilestone(milestoneId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portal_project_milestones').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', milestoneId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPortalProjectRisks(projectId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portal_project_risks').select('*').eq('project_id', projectId).order('severity', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addPortalProjectRisk(projectId: string, input: { title: string; description: string; severity: string; mitigation?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portal_project_risks').insert({ project_id: projectId, ...input, status: 'identified' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePortalProjectRisk(riskId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portal_project_risks').update(updates).eq('id', riskId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPortalProjects(clientId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portal_projects').select('*').eq('client_id', clientId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createPortalProject(clientId: string, input: { name: string; description?: string; start_date?: string; end_date?: string; created_by: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portal_projects').insert({ client_id: clientId, ...input, status: 'active' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePortalProject(projectId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portal_projects').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', projectId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
