'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

// Validation schema for project creation
const createProjectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description must be less than 2000 characters'),
  client_name: z.string().optional(),
  client_email: z.string().email('Invalid email format').optional().or(z.literal('')),
  budget: z.coerce.number().min(0, 'Budget must be a positive number').optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  userId: z.string().min(1, 'User ID is required')
})

interface CreateProjectResult {
  success?: boolean
  error?: string
  project?: any
}

export async function createProject(formData: FormData): Promise<CreateProjectResult> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'User not authenticated' }
    }

    // Extract and validate form data
    const rawData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      client_name: formData.get('client_name') as string,
      client_email: formData.get('client_email') as string,
      budget: formData.get('budget') as string,
      priority: formData.get('priority') as string,
      start_date: formData.get('start_date') as string,
      end_date: formData.get('end_date') as string,
      userId: user.id
    }

    // Validate the data
    const validationResult = createProjectSchema.safeParse(rawData)
    
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0]
      return { error: firstError.message }
    }

    const validatedData = validationResult.data

    // Check if end date is after start date
    if (validatedData.start_date && validatedData.end_date) {
      const startDate = new Date(validatedData.start_date)
      const endDate = new Date(validatedData.end_date)
      
      if (endDate < startDate) {
        return { error: 'End date must be after start date' }
      }
    }

    // Prepare project data for insertion
    const projectData = {
      title: validatedData.title,
      description: validatedData.description,
      client_name: validatedData.client_name || null,
      client_email: validatedData.client_email || null,
      budget: validatedData.budget || 0,
      priority: validatedData.priority || 'medium',
      start_date: validatedData.start_date || null,
      end_date: validatedData.end_date || null,
      status: 'active' as const,
      progress: 0,
      spent: 0,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Insert project into database
    const { data: project, error: insertError } = await supabase
      .from('projects')
      .insert([projectData])
      .select()
      .single()

    if (insertError) {
      console.error('Project creation error:', insertError)
      return { error: 'Failed to create project. Please try again.' }
    }

    // Handle file upload if provided
    const file = formData.get('attachment') as File
    if (file && file.size > 0) {
      try {
        const fileExtension = file.name.split('.').pop()
        const fileName = `${project.id}-${Date.now()}.${fileExtension}`
        
        const { error: uploadError } = await supabase.storage
          .from('project-attachments')
          .upload(fileName, file)

        if (uploadError) {
          console.error('File upload error:', uploadError)
          // Don't fail the entire project creation for file upload issues
        }
      } catch (fileError) {
        console.error('File handling error:', fileError)
        // Don't fail the entire project creation for file issues
      }
    }

    return { success: true, project }

  } catch (error) {
    console.error('Unexpected error in createProject:', error)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
} 