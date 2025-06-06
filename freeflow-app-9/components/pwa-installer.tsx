'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Download, X, Smartphone, Monitor } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)
    
    if (isStandalone) {
      setIsInstalled(true)
      return
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('💾 PWA install prompt captured')
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // Show install prompt after a delay
      setTimeout(() => {
        setShowInstallPrompt(true)
      }, 3000) // Show after 3 seconds
    }

    // Listen for app installation
    const handleAppInstalled = () => {
      console.log('✅ PWA was installed')
      setIsInstalled(true)
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [isStandalone])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log('❌ No deferred prompt available')
      return
    }

    try {
      await deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      
      console.log('User choice:', choiceResult.outcome)
      
      if (choiceResult.outcome === 'accepted') {
        console.log('✅ User accepted the install prompt')
      } else {
        console.log('❌ User dismissed the install prompt')
      }
      
      setDeferredPrompt(null)
      setShowInstallPrompt(false)
    } catch (error) {
      console.error('❌ Error during installation:', error)
    }
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    // Don't show again for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true')
  }

  // Don't show if already installed or dismissed
  if (isInstalled || isStandalone || !showInstallPrompt || !deferredPrompt) {
    return null
  }

  // Check if user dismissed in this session
  if (sessionStorage.getItem('pwa-install-dismissed')) {
    return null
  }

  return (
    <>
      {/* Fixed install banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-black/20 to-transparent pointer-events-none">
        <Card className="max-w-md mx-auto pointer-events-auto shadow-lg border-indigo-200 bg-white/95 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Download className="h-5 w-5 text-indigo-600" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm mb-1">
                  Install FreeflowZee
                </h3>
                <p className="text-xs text-gray-600 mb-3">
                  Install our app for faster access and offline features
                </p>
                
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                  <Smartphone className="h-3 w-3" />
                  <span>Works on mobile</span>
                  <Monitor className="h-3 w-3 ml-2" />
                  <span>& desktop</span>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleInstallClick}
                    size="sm"
                    className="flex-1 h-8 text-xs bg-indigo-600 hover:bg-indigo-700"
                  >
                    Install App
                  </Button>
                  <Button
                    onClick={handleDismiss}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hidden button for programmatic access */}
      <button
        id="pwa-install-button"
        onClick={handleInstallClick}
        style={{ display: 'none' }}
        aria-label="Install PWA"
      />
    </>
  )
}

// Hook for checking PWA installation status
export function usePWAInstall() {
  const [isInstalled, setIsInstalled] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [canInstall, setCanInstall] = useState(false)

  useEffect(() => {
    // Check if running in standalone mode
    const checkStandalone = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches
      setIsStandalone(standalone)
      setIsInstalled(standalone)
    }

    checkStandalone()

    // Listen for media query changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    mediaQuery.addEventListener('change', checkStandalone)

    // Listen for install prompt availability
    const handleBeforeInstallPrompt = () => {
      setCanInstall(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      mediaQuery.removeEventListener('change', checkStandalone)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  return {
    isInstalled,
    isStandalone,
    canInstall,
  }
} 