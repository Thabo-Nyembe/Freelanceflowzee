'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { DemoModal } from '@/components/demo-modal'

export function HomePageClient() {
  const router = useRouter()
  const [showDemoDialog, setShowDemoDialog] = useState(false)

  const handleGetStarted = () => {
    router.push('/signup')
  }

  const handleWatchDemo = () => {
    setShowDemoDialog(true)
  }

  return (
    <main className="flex-1">
      <section className="relative py-20 lg:py-32" data-testid="hero-section">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6" data-testid="hero-title">
              Create, Share & Get Paid Like a Pro
            </h1>
            <p className="text-xl text-gray-600 mb-8" data-testid="hero-subtitle">
              Generate creative assets with AI, share files like WeTransfer, manage projects with escrow payments, and build your creative business - all in one revolutionary platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center" data-testid="hero-cta-buttons">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700" data-testid="hero-cta-primary" onClick={handleGetStarted}>
                Get Started Free
              </Button>
              <Button size="lg" variant="outline" data-testid="hero-cta-demo" onClick={handleWatchDemo}>
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      <DemoModal
        isOpen={showDemoDialog}
        onClose={() => setShowDemoDialog(false)}
        title="KAZI Platform Overview"
        description="See how KAZI helps you manage projects, track time, and grow your freelance business."
        videoUrl="/demo-captures/final/01-platform-overview-with-voiceover.mp4"
      />
    </main>
  )
}
