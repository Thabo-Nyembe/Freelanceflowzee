'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

const TEST_PROJECT = {
  id: 'proj_test_12345',
  title: 'Premium Brand Identity Package',
  description: 'Complete brand identity design package with logo, guidelines, and assets',
  slug: 'premium-brand-identity-package'
}

export default function UnlockedProjectPage() {
  const params = useParams()
  const router = useRouter()
  const [hasAccess, setHasAccess] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user has valid access
    const checkAccess = () => {
      const storedAccess = localStorage.getItem(`project_access_${TEST_PROJECT.id}`)
      
      if (storedAccess) {
        try {
          const accessData = JSON.parse(storedAccess)
          const expirationTime = new Date(accessData.expiresAt).getTime()
          
          if (expirationTime > Date.now()) {
            setHasAccess(true)
          } else {
            // Access expired
            localStorage.removeItem(`project_access_${TEST_PROJECT.id}`)
            router.push('/payment?project=' + TEST_PROJECT.id)
          }
        } catch (error) {
          console.error('Error parsing access data:', error)
          router.push('/payment?project=' + TEST_PROJECT.id)
        }
      } else {
        // No access found
        router.push('/payment?project=' + TEST_PROJECT.id)
      }
      
      setLoading(false)
    }

    checkAccess()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Validating access...</p>
        </div>
      </div>
    )
  }

  if (!hasAccess) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Banner */}
        <div className="bg-green-100 border border-green-400 rounded-lg p-4 mb-8" data-testid="unlock-success">
          <h2 className="text-xl font-semibold text-green-800">🎉 Content Unlocked!</h2>
          <p className="text-green-700 mt-1">You now have full access to {TEST_PROJECT.title}</p>
        </div>

        {/* Project Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-3xl font-bold text-gray-900" data-testid="unlocked-title">
              {TEST_PROJECT.title}
            </h1>
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm font-medium" data-testid="premium-badge">
              Premium Content
            </span>
          </div>
          <p className="text-gray-600">{TEST_PROJECT.description}</p>
        </div>

        {/* Premium Content */}
        <div className="grid md:grid-cols-2 gap-8" data-testid="premium-content">
          {/* Download Section */}
          <div className="bg-white rounded-lg shadow-md p-6" data-testid="download-section">
            <h2 className="text-xl font-semibold mb-4">📁 Project Files</h2>
            <div className="space-y-3">
              <a
                href="#"
                className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                data-testid="download-logo"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white text-sm font-bold">AI</span>
                  </div>
                  <div>
                    <div className="font-medium">Logo Package</div>
                    <div className="text-sm text-gray-600">Vector files, PNG, SVG</div>
                  </div>
                </div>
                <span className="text-blue-600 font-medium">Download</span>
              </a>

              <a
                href="#"
                className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                data-testid="download-guidelines"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                    <span className="text-white text-sm font-bold">📖</span>
                  </div>
                  <div>
                    <div className="font-medium">Brand Guidelines</div>
                    <div className="text-sm text-gray-600">PDF, 24 pages</div>
                  </div>
                </div>
                <span className="text-green-600 font-medium">Download</span>
              </a>

              <a
                href="#"
                className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                data-testid="download-mockups"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
                    <span className="text-white text-sm font-bold">🎨</span>
                  </div>
                  <div>
                    <div className="font-medium">Mockups & Templates</div>
                    <div className="text-sm text-gray-600">PSD, Figma files</div>
                  </div>
                </div>
                <span className="text-purple-600 font-medium">Download</span>
              </a>
            </div>
          </div>

          {/* Exclusive Content */}
          <div className="bg-white rounded-lg shadow-md p-6" data-testid="exclusive-content">
            <h2 className="text-xl font-semibold mb-4">✨ Exclusive Content</h2>
            <p className="text-gray-600 mb-4">
              This is premium content only available after payment or valid access credentials.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>High-resolution logo files (300 DPI)</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Complete brand guidelines document</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Color palettes and typography specifications</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Application mockups and examples</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Source files and working documents</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">💡 Pro Tip</h3>
              <p className="text-blue-700 text-sm">
                All files are production-ready and include detailed usage instructions. 
                Perfect for immediate implementation or further customization.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">📞 Support & Contact</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Need Help?</h3>
              <p className="text-gray-600 text-sm mb-3">
                Our team is here to help you make the most of your premium content.
              </p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                Contact Support
              </button>
            </div>
            <div>
              <h3 className="font-medium mb-2">License Information</h3>
              <p className="text-gray-600 text-sm">
                Commercial use allowed. Full rights included with purchase. 
                Reselling or redistribution prohibited.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 