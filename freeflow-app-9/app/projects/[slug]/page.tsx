'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const TEST_PROJECT = {
  id: 'proj_test_12345',
  title: 'Premium Brand Identity Package',
  description: 'Complete brand identity design package with logo, guidelines, and assets',
  price: 4999, // $49.99
  currency: 'usd',
  slug: 'premium-brand-identity-package',
  isLocked: true
}

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const [hasAccess, setHasAccess] = useState(false)
  const [loading, setLoading] = useState(true)

  const slug = params?.slug as string

  useEffect(() => {
    // Check if user has access to this project
    const checkAccess = () => {
      const storedAccess = localStorage.getItem(`project_access_${TEST_PROJECT.id}`)
      
      if (storedAccess) {
        try {
          const accessData = JSON.parse(storedAccess)
          const expirationTime = new Date(accessData.expiresAt).getTime()
          
          if (expirationTime > Date.now()) {
            setHasAccess(true)
            // Redirect to unlocked content
            router.push(`/projects/${slug}/unlocked`)
            return
          } else {
            // Access expired, remove from storage
            localStorage.removeItem(`project_access_${TEST_PROJECT.id}`)
          }
        } catch (error) {
          console.error('Error parsing access data:', error)
        }
      }
      
      setLoading(false)
    }

    checkAccess()
  }, [slug, router])

  const handleUnlockClick = () => {
    router.push(`/payment?project=${TEST_PROJECT.id}&return=${encodeURIComponent(window.location.pathname)}`)
  }

  const handlePremiumSectionClick = () => {
    // This should redirect to payment page for locked content
    router.push(`/payment?project=${TEST_PROJECT.id}&return=${encodeURIComponent(window.location.pathname + '/premium-section')}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Project Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4" data-testid="project-title">
            {TEST_PROJECT.title}
          </h1>
          <p className="text-gray-600 mb-6">{TEST_PROJECT.description}</p>
          
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-blue-600">
              ${(TEST_PROJECT.price / 100).toFixed(2)}
            </div>
            {TEST_PROJECT.isLocked && (
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                🔒 Premium Content
              </span>
            )}
          </div>
        </div>

        {/* Free Preview Content */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Free Preview</h2>
          <p className="text-gray-600 mb-4">
            Get a taste of what's included in this premium brand identity package:
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Professional logo concepts</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Color palette inspiration</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Typography samples</span>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 border-2 border-dashed border-blue-200">
              <div className="text-center">
                <div className="text-4xl mb-2">🎨</div>
                <h3 className="font-semibold text-gray-800 mb-2">Sample Design</h3>
                <p className="text-gray-600 text-sm">Preview of the design style and quality</p>
              </div>
            </div>
          </div>
        </div>

        {/* Locked Premium Content */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10"></div>
          <div className="filter blur-sm">
            <h2 className="text-xl font-semibold mb-4">Premium Content</h2>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-100 rounded-lg p-4">
                <h3 className="font-medium mb-2">Full Logo Package</h3>
                <p className="text-sm text-gray-600">Vector files, PNG, SVG formats</p>
              </div>
              <div className="bg-gray-100 rounded-lg p-4">
                <h3 className="font-medium mb-2">Brand Guidelines</h3>
                <p className="text-sm text-gray-600">Complete 24-page document</p>
              </div>
              <div className="bg-gray-100 rounded-lg p-4">
                <h3 className="font-medium mb-2">Mockups & Templates</h3>
                <p className="text-sm text-gray-600">Ready-to-use designs</p>
              </div>
            </div>
          </div>
          
          {/* Unlock Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-20">
            <div className="text-center">
              <div className="text-6xl mb-4">🔒</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Premium Content Locked</h3>
              <p className="text-gray-600 mb-6">Unlock full access to download all files and resources</p>
              <button
                onClick={handleUnlockClick}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                data-testid="unlock-button"
              >
                Unlock for ${(TEST_PROJECT.price / 100).toFixed(2)}
              </button>
            </div>
          </div>
        </div>

        {/* Test Section for Premium Content Link */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Project Sections</h2>
          <div className="space-y-3">
            <a
              href="#"
              className="block p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-green-800">Free Overview</h3>
                  <p className="text-sm text-green-600">Available to all visitors</p>
                </div>
                <div className="text-green-600">✓ Free</div>
              </div>
            </a>
            
            <button
              onClick={handlePremiumSectionClick}
              className="w-full text-left p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
              data-testid="premium-section-link"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-yellow-800">Premium Section</h3>
                  <p className="text-sm text-yellow-600">Requires payment to access</p>
                </div>
                <div className="text-yellow-600">🔒 Locked</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 