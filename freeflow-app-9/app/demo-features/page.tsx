'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

// A+++ UTILITIES
import { DashboardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'

export default function DemoFeaturesPage() {
  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()

  // A+++ LOAD DEMO FEATURES DATA
  useEffect(() => {
    const loadDemoFeaturesData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Simulate data loading with 5% error rate
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            if (Math.random() > 0.95) {
              reject(new Error('Failed to load demo features'))
            } else {
              resolve(null)
            }
          }, 1000)
        })

        setIsLoading(false)
        announce('Demo features loaded successfully', 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load demo features')
        setIsLoading(false)
        announce('Error loading demo features', 'assertive')
      }
    }

    loadDemoFeaturesData()
  }, [announce])

  // A+++ LOADING STATE
  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <DashboardSkeleton />
      </div>
    )
  }

  // A+++ ERROR STATE
  if (error) {
    return (
      <div className="container mx-auto p-8">
        <div className="max-w-2xl mx-auto mt-20">
          <ErrorEmptyState
            error={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8">
      <h1>Demo Features</h1>
      <div data-testid="ai-create" className="mt-4">
        <h2>AI Create Studio</h2>
        <p>Experience our AI-powered content creation tools</p>
        <Button data-testid="ai-create-button">Try AI Create</Button>
      </div>
      
      <div data-testid="file-upload" className="mt-8">
        <h2>File Upload System</h2>
        <input type="file" data-testid="file-input" />
        <Button data-testid="upload-button">Upload File</Button>
      </div>
      
      <div data-testid="download-section" className="mt-8">
        <h2>Download Manager</h2>
        <Button data-testid="download-button">Download Sample</Button>
      </div>
    </div>
  )
}