"use client"

import { CreativeAssetGenerator } from '@/components/ai-create/creative-asset-generator'

// A+++ UTILITIES
import { useCurrentUser } from '@/hooks/use-ai-data'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('AI-Create')

export default function AICreatePage() {
  // A+++ UTILITIES
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  return <CreativeAssetGenerator asStandalone={false} />
}
