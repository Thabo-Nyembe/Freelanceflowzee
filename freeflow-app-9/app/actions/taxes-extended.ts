'use server'

/**
 * Extended Taxes Server Actions
 * Tables: taxes, tax_rates, tax_rules, tax_exemptions, tax_filings, tax_calculations
 */

import { createClient } from '@/lib/supabase/server'

export async function getTax(taxId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('taxes').select('*, tax_rates(*), tax_rules(*), tax_exemptions(*)').eq('id', taxId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createTax(taxData: { name: string; code: string; description?: string; tax_type: string; jurisdiction?: string; is_compound?: boolean; is_active?: boolean; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('taxes').insert({ ...taxData, is_compound: taxData.is_compound ?? false, is_active: taxData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTax(taxId: string, updates: Partial<{ name: string; code: string; description: string; tax_type: string; jurisdiction: string; is_compound: boolean; is_active: boolean; metadata: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('taxes').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', taxId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteTax(taxId: string) {
  try { const supabase = await createClient(); await supabase.from('tax_rates').delete().eq('tax_id', taxId); await supabase.from('tax_rules').delete().eq('tax_id', taxId); const { error } = await supabase.from('taxes').delete().eq('id', taxId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTaxes(options?: { tax_type?: string; jurisdiction?: string; is_active?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('taxes').select('*, tax_rates(*)'); if (options?.tax_type) query = query.eq('tax_type', options.tax_type); if (options?.jurisdiction) query = query.eq('jurisdiction', options.jurisdiction); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); if (options?.search) query = query.or(`name.ilike.%${options.search}%,code.ilike.%${options.search}%`); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createTaxRate(rateData: { tax_id: string; rate: number; effective_from: string; effective_to?: string; min_amount?: number; max_amount?: number; category?: string; is_default?: boolean }) {
  try { const supabase = await createClient(); if (rateData.is_default) { await supabase.from('tax_rates').update({ is_default: false }).eq('tax_id', rateData.tax_id) } const { data, error } = await supabase.from('tax_rates').insert({ ...rateData, is_default: rateData.is_default ?? false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTaxRates(taxId: string, options?: { effective_date?: string; category?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('tax_rates').select('*').eq('tax_id', taxId); if (options?.effective_date) { query = query.lte('effective_from', options.effective_date).or(`effective_to.is.null,effective_to.gte.${options.effective_date}`) } if (options?.category) query = query.eq('category', options.category); const { data, error } = await query.order('effective_from', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createTaxRule(ruleData: { tax_id: string; name: string; rule_type: string; conditions: any; priority?: number; is_active?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tax_rules').insert({ ...ruleData, is_active: ruleData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTaxRules(taxId: string, options?: { rule_type?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('tax_rules').select('*').eq('tax_id', taxId); if (options?.rule_type) query = query.eq('rule_type', options.rule_type); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('priority', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createExemption(exemptionData: { entity_type: string; entity_id: string; tax_id?: string; exemption_type: string; exemption_reason?: string; certificate_number?: string; valid_from: string; valid_until?: string; approved_by?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tax_exemptions').insert({ ...exemptionData, status: 'active', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getExemptions(options?: { entity_type?: string; entity_id?: string; tax_id?: string; status?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('tax_exemptions').select('*, taxes(*)'); if (options?.entity_type) query = query.eq('entity_type', options.entity_type); if (options?.entity_id) query = query.eq('entity_id', options.entity_id); if (options?.tax_id) query = query.eq('tax_id', options.tax_id); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('valid_from', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function calculateTax(params: { amount: number; tax_id?: string; jurisdiction?: string; category?: string; entity_type?: string; entity_id?: string; date?: string }) {
  try { const supabase = await createClient(); const effectiveDate = params.date || new Date().toISOString(); let taxQuery = supabase.from('taxes').select('*, tax_rates(*)').eq('is_active', true); if (params.tax_id) taxQuery = taxQuery.eq('id', params.tax_id); if (params.jurisdiction) taxQuery = taxQuery.eq('jurisdiction', params.jurisdiction); const { data: taxes } = await taxQuery; if (!taxes || taxes.length === 0) return { success: true, data: { taxAmount: 0, taxes: [], total: params.amount } }; if (params.entity_type && params.entity_id) { const { data: exemptions } = await supabase.from('tax_exemptions').select('tax_id').eq('entity_type', params.entity_type).eq('entity_id', params.entity_id).eq('status', 'active').lte('valid_from', effectiveDate).or(`valid_until.is.null,valid_until.gte.${effectiveDate}`); const exemptTaxIds = exemptions?.map(e => e.tax_id) || []; taxes.forEach((tax, i) => { if (exemptTaxIds.includes(tax.id)) taxes[i].rate = 0 }) } let totalTax = 0; const taxDetails: any[] = []; for (const tax of taxes) { const applicableRates = tax.tax_rates?.filter((r: any) => { const fromValid = r.effective_from <= effectiveDate; const toValid = !r.effective_to || r.effective_to >= effectiveDate; const amountValid = (!r.min_amount || params.amount >= r.min_amount) && (!r.max_amount || params.amount <= r.max_amount); const categoryValid = !params.category || !r.category || r.category === params.category; return fromValid && toValid && amountValid && categoryValid }) || []; const rate = applicableRates.find((r: any) => r.is_default) || applicableRates[0]; if (rate) { const baseAmount = tax.is_compound ? params.amount + totalTax : params.amount; const taxAmount = baseAmount * (rate.rate / 100); totalTax += taxAmount; taxDetails.push({ tax_id: tax.id, tax_name: tax.name, rate: rate.rate, taxAmount }) } } await supabase.from('tax_calculations').insert({ amount: params.amount, tax_amount: totalTax, taxes: taxDetails, ...params, calculated_at: new Date().toISOString(), created_at: new Date().toISOString() }); return { success: true, data: { taxAmount: totalTax, taxes: taxDetails, total: params.amount + totalTax } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createFiling(filingData: { tax_id: string; period_start: string; period_end: string; total_taxable: number; total_tax: number; filed_by: string; notes?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tax_filings').insert({ ...filingData, status: 'draft', filing_number: `TF-${Date.now()}`, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function submitFiling(filingId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tax_filings').update({ status: 'submitted', submitted_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', filingId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getFilings(options?: { tax_id?: string; status?: string; from_date?: string; to_date?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('tax_filings').select('*, taxes(*)'); if (options?.tax_id) query = query.eq('tax_id', options.tax_id); if (options?.status) query = query.eq('status', options.status); if (options?.from_date) query = query.gte('period_start', options.from_date); if (options?.to_date) query = query.lte('period_end', options.to_date); const { data, error } = await query.order('period_end', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

