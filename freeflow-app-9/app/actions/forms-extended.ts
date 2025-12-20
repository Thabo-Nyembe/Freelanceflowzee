'use server'

/**
 * Extended Forms Server Actions
 * Tables: forms, form_fields, form_submissions, form_responses, form_templates, form_analytics
 */

import { createClient } from '@/lib/supabase/server'

export async function getForm(formId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('forms').select('*, form_fields(*)').eq('id', formId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createForm(formData: { title: string; description?: string; created_by: string; type?: string; settings?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('forms').insert({ ...formData, status: 'draft', submission_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateForm(formId: string, updates: Partial<{ title: string; description: string; status: string; settings: any; thank_you_message: string; redirect_url: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('forms').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', formId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteForm(formId: string) {
  try { const supabase = await createClient(); await supabase.from('form_responses').delete().eq('form_id', formId); await supabase.from('form_submissions').delete().eq('form_id', formId); await supabase.from('form_fields').delete().eq('form_id', formId); const { error } = await supabase.from('forms').delete().eq('id', formId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getForms(options?: { created_by?: string; status?: string; type?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('forms').select('*'); if (options?.created_by) query = query.eq('created_by', options.created_by); if (options?.status) query = query.eq('status', options.status); if (options?.type) query = query.eq('type', options.type); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addFormField(fieldData: { form_id: string; type: string; label: string; name: string; required?: boolean; options?: any; validation?: any; order?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('form_fields').insert({ ...fieldData, required: fieldData.required ?? false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateFormField(fieldId: string, updates: Partial<{ label: string; required: boolean; options: any; validation: any; order: number }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('form_fields').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', fieldId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteFormField(fieldId: string) {
  try { const supabase = await createClient(); await supabase.from('form_responses').delete().eq('field_id', fieldId); const { error } = await supabase.from('form_fields').delete().eq('id', fieldId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getFormFields(formId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('form_fields').select('*').eq('form_id', formId).order('order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function submitForm(submissionData: { form_id: string; submitted_by?: string; responses: { field_id: string; value: any }[] }) {
  try { const supabase = await createClient(); const { data: submission, error: subError } = await supabase.from('form_submissions').insert({ form_id: submissionData.form_id, submitted_by: submissionData.submitted_by, submitted_at: new Date().toISOString() }).select().single(); if (subError) throw subError; const responses = submissionData.responses.map(r => ({ ...r, form_id: submissionData.form_id, submission_id: submission.id })); await supabase.from('form_responses').insert(responses); await supabase.from('forms').update({ submission_count: (await supabase.from('forms').select('submission_count').eq('id', submissionData.form_id).single()).data?.submission_count + 1 || 1 }).eq('id', submissionData.form_id); return { success: true, data: submission } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getFormSubmissions(formId: string, options?: { from_date?: string; to_date?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('form_submissions').select('*, form_responses(*)').eq('form_id', formId); if (options?.from_date) query = query.gte('submitted_at', options.from_date); if (options?.to_date) query = query.lte('submitted_at', options.to_date); const { data, error } = await query.order('submitted_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getFormTemplates(options?: { category?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('form_templates').select('*'); if (options?.category) query = query.eq('category', options.category); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function duplicateForm(formId: string, newTitle: string, userId: string) {
  try { const supabase = await createClient(); const { data: original } = await supabase.from('forms').select('*, form_fields(*)').eq('id', formId).single(); if (!original) throw new Error('Form not found'); const { data: newForm, error } = await supabase.from('forms').insert({ title: newTitle, description: original.description, type: original.type, settings: original.settings, created_by: userId, status: 'draft', submission_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; if (original.form_fields?.length) { const fields = original.form_fields.map((f: any) => ({ form_id: newForm.id, type: f.type, label: f.label, name: f.name, required: f.required, options: f.options, validation: f.validation, order: f.order, created_at: new Date().toISOString() })); await supabase.from('form_fields').insert(fields) }; return { success: true, data: newForm } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
