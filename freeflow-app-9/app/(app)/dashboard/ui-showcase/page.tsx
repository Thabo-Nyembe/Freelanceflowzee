'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Heart, Star } from 'lucide-react'

// A+++ UTILITIES
import { CardSkeleton, DashboardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('UIShowcase')

export default function UIShowcasePage() {
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  React.useEffect(() => {
    if (userId) {
      logger.info('UI Showcase loaded', { userId })
      announce('UI showcase loaded', 'polite')
    }
  }, [userId, announce])


  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [dynamicIslandExpanded, setDynamicIslandExpanded] = useState(false)
  const [morphingLoading, setMorphingLoading] = useState(false)
  const [morphingSuccess, setMorphingSuccess] = useState(false)

  // A+++ LOAD UI SHOWCASE DATA
  useEffect(() => {
    const loadUIShowcaseData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Simulate data loading with 5% error rate
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            if (Math.random() > 0.95) {
              reject(new Error('Failed to load UI showcase'))
            } else {
              resolve(null)
            }
          }, 1000)
        })

        setIsLoading(false)
        announce('UI showcase loaded successfully', 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load UI showcase')
        setIsLoading(false)
        announce('Error loading UI showcase', 'assertive')
      }
    }

    loadUIShowcaseData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.title = 'KAZI - UI Showcase'
  }, [])

  const handleMorphingClick = () => {
    setMorphingLoading(true)
    setTimeout(() => {
      setMorphingLoading(false)
      setMorphingSuccess(true)
      setTimeout(() => setMorphingSuccess(false), 2000)
    }, 2000)
  }

  // A+++ LOADING STATE
  if (isLoading) {
    return (
      <div className="h-full overflow-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 p-6">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-4 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -right-4 w-72 h-72 bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700"></div>
        </div>
        <div className="relative max-w-7xl mx-auto space-y-8">
          <CardSkeleton />
          <DashboardSkeleton />
        </div>
      </div>
    )
  }

  // A+++ ERROR STATE
  if (error) {
    return (
      <div className="h-full overflow-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 p-6">
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
    <div className="h-full overflow-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12">
        <h1 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Advanced UI Component Showcase
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 text-lg">
          Explore cutting-edge UI components inspired by the best modern design libraries
        </p>
      </div>

      {/* Enhanced Buttons Section */}
      <div className="max-w-7xl mx-auto mb-16">
        <h2 className="text-2xl font-bold mb-8 text-center">Enhanced Buttons</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 text-center bg-white/20 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg">
            <h3 className="font-semibold mb-4">Magnetic Button</h3>
            <button
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                e.currentTarget.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px) scale(1.05)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translate(0px, 0px) scale(1)';
              }}
            >
              <Heart className="w-4 h-4 mr-2" />
              Hover Me
            </button>
          </div>

          <div className="p-6 text-center bg-white/20 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg">
            <h3 className="font-semibold mb-4">Ripple Effect</h3>
            <button
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-lg hover:shadow-lg transition-all duration-300 relative overflow-hidden"
              onClick={(e) => {
                const button = e.currentTarget;
                const ripple = document.createElement('span');
                const rect = button.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;

                ripple.style.cssText = `
                  position: absolute;
                  width: ${size}px;
                  height: ${size}px;
                  background: rgba(255, 255, 255, 0.6);
                  border-radius: 50%;
                  transform: scale(0);
                  animation: ripple 0.6s linear;
                  left: ${x}px;
                  top: ${y}px;
                `;

                button.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);
              }}
            >
              <Star className="w-4 h-4 mr-2" />
              Click for Ripples
            </button>
          </div>

          <div className="p-6 text-center bg-white/20 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg">
            <h3 className="font-semibold mb-4">Morphing Button</h3>
            <button
              className={`inline-flex items-center px-6 py-3 rounded-lg transition-all duration-500 ${
                morphingLoading
                  ? 'bg-yellow-500 text-white'
                  : morphingSuccess
                    ? 'bg-green-500 text-white'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700'
              }`}
              onClick={handleMorphingClick}
            >
              <Star className="w-4 h-4 mr-2" />
              {morphingLoading ? 'Loading...' : morphingSuccess ? 'Success!' : 'Morph Me!'}
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Cards Section */}
      <div className="max-w-7xl mx-auto mb-16">
        <h2 className="text-2xl font-bold mb-8 text-center">Advanced Card Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg overflow-hidden group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="p-6 h-full flex items-center justify-center relative z-10">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Hover Me</h3>
                <p className="text-gray-600">From any direction</p>
              </div>
            </div>
          </div>

          <div className="h-64 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg overflow-hidden transform transition-transform duration-300 hover:rotate-1 hover:scale-105">
            <div className="p-6 h-full flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">3D Shift Card</h3>
                <p className="text-gray-600">Move your mouse around</p>
              </div>
            </div>
          </div>

          <div className="h-64 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            <div className="p-6 h-full flex items-center justify-center relative z-10">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Texture Card</h3>
                <p className="text-gray-600">With dot pattern</p>
              </div>
            </div>
          </div>

          <div className="h-64 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-radial from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ background: 'radial-gradient(300px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.1), transparent)' }} />
            <div className="p-6 h-full flex items-center justify-center relative z-10">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Spotlight Effect</h3>
                <p className="text-gray-400">Light follows your cursor</p>
              </div>
            </div>
          </div>

          <div className="h-64 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 11px)', backgroundSize: '20px 20px' }} />
            <div className="p-6 h-full flex items-center justify-center relative z-10">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Wave Pattern</h3>
                <p className="text-gray-600">Subtle wave texture</p>
              </div>
            </div>
          </div>

          <div className="h-64 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            <div className="p-6 h-full flex items-center justify-center relative z-10">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Grid Pattern</h3>
                <p className="text-gray-600">Clean grid overlay</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="max-w-7xl mx-auto mb-16">
        <h2 className="text-2xl font-bold mb-8 text-center">Bento Grid Layout</h2>
        <div className="grid grid-cols-6 grid-rows-4 gap-4 h-96">
          <div className="col-span-3 row-span-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Large Card</h3>
              <p>Main featured content</p>
            </div>
          </div>

          <div className="col-span-2 row-span-1 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg flex items-center justify-center">
            <div className="text-center">
              <h4 className="font-semibold">Medium Card</h4>
              <p className="text-sm text-gray-600">Secondary content</p>
            </div>
          </div>

          <div className="col-span-1 row-span-1 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg flex items-center justify-center">
            <div className="text-center">
              <h5 className="font-semibold">Small</h5>
            </div>
          </div>

          <div className="col-span-1 row-span-1 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg flex items-center justify-center">
            <div className="text-center">
              <h5 className="font-semibold">Small</h5>
            </div>
          </div>

          <div className="col-span-2 row-span-1 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg flex items-center justify-center">
            <div className="text-center">
              <h4 className="font-semibold">Medium Card</h4>
              <p className="text-sm text-gray-600">Another card</p>
            </div>
          </div>

          <div className="col-span-1 row-span-1 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg flex items-center justify-center">
            <div className="text-center">
              <h5 className="font-semibold">Small</h5>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Elements */}
      <div className="max-w-7xl mx-auto mb-16">
        <h2 className="text-2xl font-bold mb-8 text-center">Interactive Elements</h2>
        <div className="flex flex-col items-center space-y-8">
          <div className="text-center">
            <h3 className="font-semibold mb-4">Dynamic Island</h3>
            <button
              className={`bg-black text-white rounded-full transition-all duration-500 ${
                dynamicIslandExpanded ? 'px-6 py-3' : 'px-4 py-2'
              }`}
              onClick={() => setDynamicIslandExpanded(!dynamicIslandExpanded)}
            >
              {dynamicIslandExpanded ? 'Tap to Collapse' : 'Tap to Expand'}
            </button>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <Plus className="w-6 h-6" />
      </button>

      <style jsx>{`
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
        @keyframes particle-explode {
          to {
            transform: translate(var(--dx), var(--dy));
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}