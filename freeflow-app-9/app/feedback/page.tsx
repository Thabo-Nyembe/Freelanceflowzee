import React from 'react'
import { isTestMode } from '@/lib/utils/test-mode'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import FeedbackWrapper from '@/components/feedback/feedback-wrapper'

interface FeedbackPageProps {
  searchParams: Promise<{
    type?: 'video' | 'audio' | 'image'
    file?: string
  }>
}

export default async function FeedbackPage({ searchParams }: FeedbackPageProps) {
  // Check if we're in test mode to bypass authentication
  const testMode = await isTestMode()
  
  if (!testMode) {
    // Create Supabase client for authentication check
    const supabase = createServerComponentClient({ cookies })
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session) {
        redirect('/login')
      }
    } catch (error) {
      console.error('Authentication check failed:', error)
      redirect('/login')
    }
  }

  // Await searchParams to fix Next.js 15 async requirement
  const { type = 'video', file } = await searchParams

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800">
              Media Feedback System
            </h1>
            <p className="text-gray-600 mt-2">
              Review and provide feedback on {type} content
            </p>
          </div>
          
          <div className="p-6">
            <FeedbackWrapper
              type={type}
              src={file || `/demo/sample-${type === 'image' ? 'image.jpg' : type === 'video' ? 'video.mp4' : 'audio.mp3'}`}
              title={file || `Sample ${type}`}
              alt={file || `Sample ${type}`}
            />
          </div>
        </div>
      </div>
    </div>
  )
} 