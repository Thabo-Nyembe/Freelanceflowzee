'use server'

/**
 * Extended Objects Server Actions
 * Tables: objects, object_types, object_properties, object_relationships, object_versions, object_permissions
 */

import { createClient } from '@/lib/supabase/server'

export async function getObject(objectId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('objects').select('*, object_types(*), object_properties(*), object_relationships(*)').eq('id', objectId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createObject(objectData: { type_id: string; name: string; description?: string; properties?: any; owner_id: string; organization_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('objects').insert({ ...objectData, status: 'active', version: 1, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateObject(objectId: string, updates: Partial<{ name: string; description: string; properties: any; status: string }>, createVersion: boolean = true) {
  try { const supabase = await createClient(); if (createVersion) { const { data: current } = await supabase.from('objects').select('*').eq('id', objectId).single(); if (current) { await supabase.from('object_versions').insert({ object_id: objectId, version: current.version, data: current, created_at: new Date().toISOString() }) } } const { data, error } = await supabase.from('objects').update({ ...updates, version: supabase.sql`version + 1`, updated_at: new Date().toISOString() }).eq('id', objectId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteObject(objectId: string) {
  try { const supabase = await createClient(); await supabase.from('object_properties').delete().eq('object_id', objectId); await supabase.from('object_relationships').delete().or(`source_id.eq.${objectId},target_id.eq.${objectId}`); await supabase.from('object_versions').delete().eq('object_id', objectId); await supabase.from('object_permissions').delete().eq('object_id', objectId); const { error } = await supabase.from('objects').delete().eq('id', objectId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getObjects(options?: { type_id?: string; owner_id?: string; organization_id?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('objects').select('*, object_types(*)'); if (options?.type_id) query = query.eq('type_id', options.type_id); if (options?.owner_id) query = query.eq('owner_id', options.owner_id); if (options?.organization_id) query = query.eq('organization_id', options.organization_id); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createType(typeData: { name: string; slug: string; description?: string; schema?: any; icon?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('object_types').insert({ ...typeData, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateType(typeId: string, updates: Partial<{ name: string; description: string; schema: any; icon: string; is_active: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('object_types').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', typeId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTypes(options?: { is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('object_types').select('*'); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function setProperty(objectId: string, key: string, value: any, valueType?: string) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('object_properties').select('id').eq('object_id', objectId).eq('key', key).single(); if (existing) { const { data, error } = await supabase.from('object_properties').update({ value, value_type: valueType, updated_at: new Date().toISOString() }).eq('id', existing.id).select().single(); if (error) throw error; return { success: true, data } } const { data, error } = await supabase.from('object_properties').insert({ object_id: objectId, key, value, value_type: valueType, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getProperties(objectId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('object_properties').select('*').eq('object_id', objectId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createRelationship(relationshipData: { source_id: string; target_id: string; relationship_type: string; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('object_relationships').insert({ ...relationshipData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteRelationship(relationshipId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('object_relationships').delete().eq('id', relationshipId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRelationships(objectId: string, options?: { direction?: 'source' | 'target' | 'both'; type?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('object_relationships').select('*, source:objects!source_id(*), target:objects!target_id(*)'); const direction = options?.direction || 'both'; if (direction === 'source') query = query.eq('source_id', objectId); else if (direction === 'target') query = query.eq('target_id', objectId); else query = query.or(`source_id.eq.${objectId},target_id.eq.${objectId}`); if (options?.type) query = query.eq('relationship_type', options.type); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getVersions(objectId: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('object_versions').select('*').eq('object_id', objectId).order('version', { ascending: false }).limit(options?.limit || 20); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function setPermission(objectId: string, permissionData: { user_id?: string; role_id?: string; permission: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('object_permissions').insert({ object_id: objectId, ...permissionData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
