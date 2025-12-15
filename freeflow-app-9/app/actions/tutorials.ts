'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export interface TutorialInput {
  title: string
  description?: string
  status?: 'published' | 'draft' | 'scheduled' | 'archived'
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  format?: 'video' | 'text' | 'interactive' | 'mixed'
  duration_minutes?: number
  lessons_count?: number
  author?: string
  thumbnail_url?: string
  video_url?: string
  content?: string
  tags?: string[]
  prerequisites?: string[]
}

export async function createTutorial(input: TutorialInput) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('tutorials')
    .insert([{ ...input, user_id: user.id }])
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/tutorials-v2')
  return { data }
}

export async function updateTutorial(id: string, input: Partial<TutorialInput>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('tutorials')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/tutorials-v2')
  return { data }
}

export async function deleteTutorial(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('tutorials')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/tutorials-v2')
  return { success: true }
}

export async function publishTutorial(id: string) {
  return updateTutorial(id, { status: 'published' })
}

export async function scheduleTutorial(id: string) {
  return updateTutorial(id, { status: 'scheduled' })
}

export async function archiveTutorial(id: string) {
  return updateTutorial(id, { status: 'archived' })
}

export async function enrollInTutorial(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: tutorial } = await supabase
    .from('tutorials')
    .select('enrollments_count')
    .eq('id', id)
    .single()

  if (!tutorial) {
    return { error: 'Tutorial not found' }
  }

  const { data, error } = await supabase
    .from('tutorials')
    .update({ enrollments_count: (tutorial.enrollments_count || 0) + 1 })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/tutorials-v2')
  return { data }
}

export async function completeTutorial(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: tutorial } = await supabase
    .from('tutorials')
    .select('completions_count')
    .eq('id', id)
    .single()

  if (!tutorial) {
    return { error: 'Tutorial not found' }
  }

  const { data, error } = await supabase
    .from('tutorials')
    .update({ completions_count: (tutorial.completions_count || 0) + 1 })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/tutorials-v2')
  return { data }
}

export async function rateTutorial(id: string, rating: number) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: tutorial } = await supabase
    .from('tutorials')
    .select('rating, reviews_count')
    .eq('id', id)
    .single()

  if (!tutorial) {
    return { error: 'Tutorial not found' }
  }

  const newReviewsCount = (tutorial.reviews_count || 0) + 1
  const currentTotal = (tutorial.rating || 0) * (tutorial.reviews_count || 0)
  const newRating = (currentTotal + rating) / newReviewsCount

  const { data, error } = await supabase
    .from('tutorials')
    .update({
      rating: Math.round(newRating * 100) / 100,
      reviews_count: newReviewsCount
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/tutorials-v2')
  return { data }
}
