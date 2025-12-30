'use client'

/**
 * Easy Integration Setup Page
 *
 * Simplified integration setup experience with visual guidance
 */

import { EasyIntegrationSetup } from '@/components/easy-integration-setup'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

// A+++ UTILITIES
import { useCurrentUser } from '@/hooks/use-ai-data'
import { useAnnouncer } from '@/lib/accessibility'

export default function IntegrationSetupPage() {
  const router = useRouter()
  // A+++ UTILITIES
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:bg-none dark:bg-gray-900 p-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Main Setup Component */}
        <EasyIntegrationSetup
          onComplete={() => {
            // Navigate to integrations page or dashboard
            router.push('/dashboard/integrations')
          }}
        />
      </div>
    </div>
  )
}
