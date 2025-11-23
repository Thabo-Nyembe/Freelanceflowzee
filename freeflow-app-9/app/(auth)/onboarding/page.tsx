'use client'

/**
 * Onboarding Page
 *
 * First-time user setup experience
 */

import { EasyOnboardingWizard } from '@/components/easy-onboarding-wizard'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const router = useRouter()

  return (
    <EasyOnboardingWizard
      onComplete={() => {
        // Redirect to dashboard after onboarding
        router.push('/dashboard')
      }}
    />
  )
}
