'use server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import type { ContentStudio } from '@/lib/hooks/use-content-studio'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('content-studio-actions')

export async function createProject(data: Partial<ContentStudio>): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: project, error } = await supabase
      .from('content_studio')
      .insert({
        ...data,
        user_id: user.id,
        content_data: data.content_data || {}
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create project', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Project created successfully', { projectId: project.id })
    revalidatePath('/dashboard/content-studio-v2')
    return actionSuccess(project, 'Project created successfully')
  } catch (error: any) {
    logger.error('Unexpected error in createProject', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateProject(id: string, data: Partial<ContentStudio>): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: project, error } = await supabase
      .from('content_studio')
      .update(data)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update project', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Project updated successfully', { id })
    revalidatePath('/dashboard/content-studio-v2')
    return actionSuccess(project, 'Project updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error in updateProject', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteProject(id: string): Promise<ActionResult<void>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { error } = await supabase
      .from('content_studio')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete project', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Project deleted successfully', { id })
    revalidatePath('/dashboard/content-studio-v2')
    return actionSuccess(undefined, 'Project deleted successfully')
  } catch (error: any) {
    logger.error('Unexpected error in deleteProject', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function autoSaveProject(id: string, canvasState: any, editorState: any): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

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

    if (error) {
      logger.error('Failed to auto-save project', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    return actionSuccess(project, 'Project auto-saved successfully')
  } catch (error: any) {
    logger.error('Unexpected error in autoSaveProject', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function exportProject(id: string, format: string): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: project } = await supabase
      .from('content_studio')
      .select('export_formats')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!project) return actionError('Project not found', 'NOT_FOUND')

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

    if (error) {
      logger.error('Failed to export project', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Project exported successfully', { id, format })
    revalidatePath('/dashboard/content-studio-v2')
    return actionSuccess(updatedProject, 'Project exported successfully')
  } catch (error: any) {
    logger.error('Unexpected error in exportProject', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function publishProject(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

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

    if (error) {
      logger.error('Failed to publish project', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Project published successfully', { id })
    revalidatePath('/dashboard/content-studio-v2')
    return actionSuccess(project, 'Project published successfully')
  } catch (error: any) {
    logger.error('Unexpected error in publishProject', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateProjectProgress(id: string, percentage: number): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

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

    if (error) {
      logger.error('Failed to update project progress', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Project progress updated successfully', { id, percentage })
    revalidatePath('/dashboard/content-studio-v2')
    return actionSuccess(project, 'Project progress updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error in updateProjectProgress', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function addCollaborator(id: string, collaboratorEmail: string): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: project } = await supabase
      .from('content_studio')
      .select('collaborators')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!project) return actionError('Project not found', 'NOT_FOUND')

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

    if (error) {
      logger.error('Failed to add collaborator', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Collaborator added successfully', { id, collaboratorEmail })
    revalidatePath('/dashboard/content-studio-v2')
    return actionSuccess(updatedProject, 'Collaborator added successfully')
  } catch (error: any) {
    logger.error('Unexpected error in addCollaborator', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
