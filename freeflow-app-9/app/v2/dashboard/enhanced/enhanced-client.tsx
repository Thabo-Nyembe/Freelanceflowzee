'use client'

import { TeamCollaborationHub } from '@/components/team-collaboration-hub'

// A+++ UTILITIES
import { useCurrentUser } from '@/hooks/use-ai-data'
import { useAnnouncer } from '@/lib/accessibility'

export default function EnhancedClient() {
  // A+++ UTILITIES
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  return (
    <div className= "container mx-auto py-6">
      <TeamCollaborationHub />
    </div>
  )
} 