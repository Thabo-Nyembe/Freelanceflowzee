'use client'

export const dynamic = 'force-dynamic';

/**
 * API Keys Management Page
 *
 * Allows users to manage their own API keys (BYOK)
 */

import { APIKeyManager } from '@/components/api-key-manager'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

// A+++ UTILITIES
import { useCurrentUser } from '@/hooks/use-ai-data'
import { useAnnouncer } from '@/lib/accessibility'

export default function APIKeysPage() {
  const router = useRouter()
  // A+++ UTILITIES
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:bg-none dark:bg-gray-900 p-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Main Component */}
        <APIKeyManager />
      </div>
    </div>
  )
}
