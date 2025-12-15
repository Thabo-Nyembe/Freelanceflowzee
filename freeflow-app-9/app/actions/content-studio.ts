'use server'
import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import type { ContentStudio } from '@/lib/hooks/use-content-studio'

export async function createProject(data: Partial<ContentStudio>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: project, error } = await supabase
    .from('content_studio')
    .insert({
      ...data,
      user_id: user.id,
      content_data: data.content_data || {}
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/content-studio-v2')
  return project
}

export async function updateProject(id: string, data: Partial<ContentStudio>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: project, error } = await supabase
    .from('content_studio')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/content-studio-v2')
  return project
}

export async function deleteProject(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('content_studio')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/dashboard/content-studio-v2')
}

export async function autoSaveProject(id: string, canvasState: any, editorState: any) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: project, error } = await supabase
    .from('content_studio')
    .update({
      canvas_state: canvasState,
      editor_state: editorState,
      last_auto_saved_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  return project
}

export async function exportProject(id: string, format: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: project } = await supabase
    .from('content_studio')
    .select('export_formats')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!project) throw new Error('Project not found')

  const exportFormats = Array.isArray(project.export_formats) ? project.export_formats : []
  if (!exportFormats.includes(format)) {
    exportFormats.push(format)
  }

  const { data: updatedProject, error } = await supabase
    .from('content_studio')
    .update({
      export_formats: exportFormats,
      last_exported_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/content-studio-v2')
  return updatedProject
}

export async function publishProject(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: project, error } = await supabase
    .from('content_studio')
    .update({
      status: 'published',
      completion_percentage: 100
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/content-studio-v2')
  return project
}

export async function updateProjectProgress(id: string, percentage: number) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  let status: 'draft' | 'in_progress' | 'review' | 'approved' | 'published' | 'archived' = 'in_progress'
  if (percentage === 0) status = 'draft'
  if (percentage === 100) status = 'review'

  const { data: project, error } = await supabase
    .from('content_studio')
    .update({
      completion_percentage: percentage,
      status: status
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/content-studio-v2')
  return project
}

export async function addCollaborator(id: string, collaboratorEmail: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: project } = await supabase
    .from('content_studio')
    .select('collaborators')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!project) throw new Error('Project not found')

  const collaborators = Array.isArray(project.collaborators) ? project.collaborators : []
  if (!collaborators.includes(collaboratorEmail)) {
    collaborators.push(collaboratorEmail)
  }

  const { data: updatedProject, error } = await supabase
    .from('content_studio')
    .update({
      collaborators: collaborators,
      is_collaborative: true
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/content-studio-v2')
  return updatedProject
}
