import { isTestMode } from '@/lib/utils/test-mode'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProjectCreationForm from '@/components/projects/project-creation-form'

export default async function CreateProjectPage() {
  // Check if we're in test mode to bypass authentication
  const testMode = await isTestMode()
  
  if (!testMode) {
    // In production mode, check authentication
    const supabase = await createClient()
    
    const {
      data: { user },
    } = await supabase.auth.getUser()
    
    if (!user) {
      redirect('/login')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800">
              Create New Project
            </h1>
            <p className="text-gray-600 mt-2">
              Fill out the details below to create a new project
            </p>
          </div>
          
          <div className="p-6">
            <ProjectCreationForm />
          </div>
        </div>
      </div>
    </div>
  )
} 