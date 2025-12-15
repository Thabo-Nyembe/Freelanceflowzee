// Feedback V2 - Server Component with Real Data
// Created: December 14, 2024
// Integrated with Supabase backend

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import FeedbackClient from './feedback-client'

export const metadata = {
  title: 'Feedback | Dashboard',
  description: 'Collect and manage user feedback and suggestions'
}

export default async function FeedbackPage() {
  const supabase = createServerComponentClient({ cookies })

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch initial feedback data from database
  const { data: feedback, error } = await supabase
    .from('feedback')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching feedback:', error)
  }

  // Pass initial data to client component
  return <FeedbackClient initialFeedback={feedback || []} />
}
