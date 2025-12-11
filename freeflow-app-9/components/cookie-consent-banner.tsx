'use client'

/**
 * KAZI Platform - Cookie Consent Banner
 *
 * GDPR & ePrivacy Directive compliant cookie consent management
 *
 * Features:
 * - Granular consent options (Necessary, Functional, Analytics, Marketing)
 * - Easy consent withdrawal
 * - Cookie preference center
 * - LocalStorage persistence
 * - GDPR Article 7 compliant
 */

import { useState, useEffect } from 'react'
import { X, Cookie, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

interface CookiePreferences {
  necessary: boolean
  functional: boolean
  analytics: boolean
  marketing: boolean
  timestamp: number
}

const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true, // Always true
  functional: false,
  analytics: false,
  marketing: false,
  timestamp: 0,
}

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES)

  useEffect(() => {
    // Check if user has already made a choice
    const saved = localStorage.getItem('cookie-preferences')
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as CookiePreferences
        setPreferences(parsed)
        // Don't show banner if preferences exist
        setShowBanner(false)
      } catch {
        // Show banner if parsing fails
        setShowBanner(true)
      }
    } else {
      // Show banner on first visit
      setShowBanner(true)
    }
  }, [])

  const savePreferences = (prefs: CookiePreferences) => {
    const updated = { ...prefs, timestamp: Date.now() }
    localStorage.setItem('cookie-preferences', JSON.stringify(updated))
    setPreferences(updated)
    setShowBanner(false)
    setShowPreferences(false)

    // Trigger cookie consent event for analytics
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cookie-consent-updated', { detail: updated }))
    }
  }

  const acceptAll = () => {
    savePreferences({
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
      timestamp: Date.now(),
    })
  }

  const acceptNecessary = () => {
    savePreferences({
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
      timestamp: Date.now(),
    })
  }

  const updatePreference = (key: keyof Omit<CookiePreferences, 'timestamp'>, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  if (!showBanner) {
    return null
  }

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-slate-900/95 backdrop-blur-lg border-t border-slate-700 shadow-2xl">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              <Cookie className="h-6 w-6 text-blue-400" />
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  We value your privacy
                </h3>
                <p className="text-sm text-gray-300">
                  We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic.
                  By clicking "Accept All", you consent to our use of cookies. You can customize your preferences or decline non-essential cookies.
                  {' '}
                  <Link href="/cookie-policy" className="text-blue-400 hover:underline">
                    Learn more in our Cookie Policy
                  </Link>.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={acceptAll}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Accept All
                </Button>
                <Button
                  onClick={acceptNecessary}
                  variant="outline"
                  className="border-slate-600 text-white hover:bg-slate-800"
                >
                  Necessary Only
                </Button>
                <Button
                  onClick={() => {
                    setShowPreferences(true)
                    setShowBanner(false)
                  }}
                  variant="ghost"
                  className="text-white hover:bg-slate-800"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Customize
                </Button>
              </div>
            </div>

            <button
              onClick={() => setShowBanner(false)}
              className="flex-shrink-0 p-2 hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Close cookie banner"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Cookie Preferences Dialog */}
      <Dialog open={showPreferences} onOpenChange={setShowPreferences}>
        <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Cookie Preferences</DialogTitle>
            <DialogDescription className="text-gray-400">
              Manage your cookie preferences. You can enable or disable different types of cookies below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Necessary Cookies */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="necessary" className="text-white font-semibold">
                  Necessary Cookies
                </Label>
                <Switch
                  id="necessary"
                  checked={true}
                  disabled={true}
                  className="bg-blue-600"
                />
              </div>
              <p className="text-sm text-gray-400">
                Essential for the website to function properly. These cannot be disabled as they are required for basic site functionality, security, and legal compliance.
              </p>
              <p className="text-xs text-gray-500">
                Examples: Authentication, security tokens, load balancing
              </p>
            </div>

            {/* Functional Cookies */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="functional" className="text-white font-semibold">
                  Functional Cookies
                </Label>
                <Switch
                  id="functional"
                  checked={preferences.functional}
                  onCheckedChange={(checked) => updatePreference('functional', checked)}
                />
              </div>
              <p className="text-sm text-gray-400">
                Enable enhanced functionality and personalization, such as saved preferences, language settings, and customized user experience.
              </p>
              <p className="text-xs text-gray-500">
                Examples: Language preferences, theme settings, saved filters
              </p>
            </div>

            {/* Analytics Cookies */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="analytics" className="text-white font-semibold">
                  Analytics Cookies
                </Label>
                <Switch
                  id="analytics"
                  checked={preferences.analytics}
                  onCheckedChange={(checked) => updatePreference('analytics', checked)}
                />
              </div>
              <p className="text-sm text-gray-400">
                Help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our service.
              </p>
              <p className="text-xs text-gray-500">
                Examples: Google Analytics, usage statistics, page views
              </p>
            </div>

            {/* Marketing Cookies */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="marketing" className="text-white font-semibold">
                  Marketing Cookies
                </Label>
                <Switch
                  id="marketing"
                  checked={preferences.marketing}
                  onCheckedChange={(checked) => updatePreference('marketing', checked)}
                />
              </div>
              <p className="text-sm text-gray-400">
                Used to track visitors across websites to display relevant and engaging advertisements tailored to individual users.
              </p>
              <p className="text-xs text-gray-500">
                Examples: Ad targeting, conversion tracking, retargeting
              </p>
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <Button
              onClick={() => savePreferences(preferences)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save Preferences
            </Button>
            <Button
              onClick={acceptAll}
              variant="outline"
              className="flex-1 border-slate-600 text-white hover:bg-slate-800"
            >
              Accept All
            </Button>
          </div>

          <p className="text-xs text-gray-500 mt-4 text-center">
            You can change your cookie preferences at any time in your{' '}
            <Link href="/dashboard/settings/privacy" className="text-blue-400 hover:underline">
              privacy settings
            </Link>.
          </p>
        </DialogContent>
      </Dialog>
    </>
  )
}

/**
 * Hook to check if user has consented to specific cookie type
 */
export function useCookieConsent(type: keyof Omit<CookiePreferences, 'timestamp'>) {
  const [hasConsent, setHasConsent] = useState(false)

  useEffect(() => {
    const checkConsent = () => {
      const saved = localStorage.getItem('cookie-preferences')
      if (saved) {
        try {
          const prefs = JSON.parse(saved) as CookiePreferences
          setHasConsent(prefs[type])
        } catch {
          setHasConsent(false)
        }
      }
    }

    checkConsent()

    // Listen for consent updates
    const handleUpdate = () => checkConsent()
    window.addEventListener('cookie-consent-updated', handleUpdate)

    return () => {
      window.removeEventListener('cookie-consent-updated', handleUpdate)
    }
  }, [type])

  return hasConsent
}

/**
 * Get all cookie preferences
 */
export function getCookiePreferences(): CookiePreferences {
  if (typeof window === 'undefined') {
    return DEFAULT_PREFERENCES
  }

  const saved = localStorage.getItem('cookie-preferences')
  if (saved) {
    try {
      return JSON.parse(saved) as CookiePreferences
    } catch {
      return DEFAULT_PREFERENCES
    }
  }
  return DEFAULT_PREFERENCES
}
