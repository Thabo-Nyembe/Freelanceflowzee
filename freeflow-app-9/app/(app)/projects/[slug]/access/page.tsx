'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

const TEST_PROJECT = {
  id: 'proj_test_12345',
  title: 'Premium Brand Identity Package',
  description: 'Complete brand identity design package with logo, guidelines, and assets',
  price: 4999, // $49.99
  slug: 'premium-brand-identity-package'
}

export default function ProjectAccessPage() {
  const params = useParams()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [accessCode, setAccessCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const slug = params?.slug as string

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!password && !accessCode) {
      setError('Please enter either a password or access code')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/projects/${slug}/access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: password || undefined,
          accessCode: accessCode || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Invalid credentials')
        return
      }

      // Store access token
      localStorage.setItem(`project_access_${TEST_PROJECT.id}`, JSON.stringify({
        accessToken: data.accessToken,
        expiresAt: data.expiresAt,
        projectId: TEST_PROJECT.id
      }))

      setSuccess('Access granted! Redirecting...')
      
      // Redirect to unlocked content
      setTimeout(() => {
        router.push(`/projects/${slug}/unlocked`)
      }, 1500)

    } catch (err: any) {
      console.error('Access error:', err)
      setError('Failed to verify credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentClick = () => {
    router.push(`/payment?project=${TEST_PROJECT.id}&return=${encodeURIComponent(window.location.pathname)}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Access Premium Content</h1>
          
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800">{TEST_PROJECT.title}</h2>
            <p className="text-gray-600 text-sm">{TEST_PROJECT.description}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter password"
                data-testid="access-password"
              />
            </div>

            <div className="text-center text-gray-500 text-sm">OR</div>

            <div>
              <label htmlFor="accessCode" className="block text-sm font-medium text-gray-700 mb-2">
                Access Code
              </label>
              <input
                type="text"
                id="accessCode"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter access code"
                data-testid="access-code"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded" data-testid="access-error">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded" data-testid="access-success">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="unlock-btn"
            >
              {loading ? 'Verifying...' : 'Unlock Content'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-3">Don't have access credentials?</p>
              <button
                onClick={handlePaymentClick}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                data-testid="buy-access-btn"
              >
                Purchase Access - ${(TEST_PROJECT.price / 100).toFixed(2)}
              </button>
            </div>
          </div>
        </div>

        {/* Test credentials info for development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded text-sm">
            <strong>Test Credentials:</strong><br />
            Password: secure-unlock-2024<br />
            Access Code: BRAND2024
          </div>
        )}
      </div>
    </div>
  )
} 