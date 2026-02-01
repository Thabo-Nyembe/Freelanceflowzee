'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Download, X, Smartphone, Monitor, Share } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if running in standalone mode
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                      (window.navigator as Record<string, unknown>).standalone === true
    setIsStandalone(standalone)
    if (standalone) return

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as Record<string, unknown>).MSStream
    setIsIOS(iOS)

    // Check if user previously dismissed
    const wasDismissed = localStorage.getItem('pwa-install-dismissed')
    if (wasDismissed) {
      const dismissedTime = parseInt(wasDismissed, 10)
      // Show again after 7 days
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        setDismissed(true)
        return
      }
    }

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)

      // Show prompt after 60 seconds on the page
      setTimeout(() => {
        if (!dismissed) setShowPrompt(true)
      }, 60000)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // For iOS, show after 60 seconds
    if (iOS && !dismissed) {
      setTimeout(() => setShowPrompt(true), 60000)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [dismissed])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        console.log('PWA installed successfully')
      }

      setDeferredPrompt(null)
      setShowPrompt(false)
    } catch (error) {
      console.error('PWA install error:', error)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setDismissed(true)
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  // Don't render if already installed or no prompt available
  if (isStandalone || (!deferredPrompt && !isIOS) || dismissed) {
    return null
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">K</span>
                </div>
                <div>
                  <DialogTitle>Install KAZI App</DialogTitle>
                  <DialogDescription>
                    Get the full experience
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4">
              {/* Benefits */}
              <div className="grid grid-cols-2 gap-3">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-2 p-3 rounded-lg bg-muted"
                >
                  <Smartphone className="w-5 h-5 text-violet-500" />
                  <span className="text-sm">Works offline</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-2 p-3 rounded-lg bg-muted"
                >
                  <Monitor className="w-5 h-5 text-violet-500" />
                  <span className="text-sm">Faster loading</span>
                </motion.div>
              </div>

              {isIOS ? (
                // iOS Instructions
                <div className="space-y-3 p-4 rounded-lg bg-muted">
                  <p className="text-sm font-medium">To install on iOS:</p>
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-500/10 text-violet-500 flex items-center justify-center text-xs">1</span>
                      <span>Tap the <Share className="inline w-4 h-4" /> Share button in Safari</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-500/10 text-violet-500 flex items-center justify-center text-xs">2</span>
                      <span>Scroll and tap &quot;Add to Home Screen&quot;</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-500/10 text-violet-500 flex items-center justify-center text-xs">3</span>
                      <span>Tap &quot;Add&quot; to confirm</span>
                    </li>
                  </ol>
                </div>
              ) : (
                // Android/Desktop Install Button
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleDismiss}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Maybe Later
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                    onClick={handleInstall}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Install App
                  </Button>
                </div>
              )}

              {isIOS && (
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={handleDismiss}
                >
                  I&apos;ll do this later
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}

/**
 * Floating install button for easy access
 */
export function PWAInstallButton() {
  const [canInstall, setCanInstall] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches
    if (standalone) return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setCanInstall(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setCanInstall(false)
    }
    setDeferredPrompt(null)
  }

  if (!canInstall) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
    >
      <Button
        size="sm"
        variant="outline"
        onClick={handleInstall}
        className="gap-2"
      >
        <Download className="w-4 h-4" />
        Install App
      </Button>
    </motion.div>
  )
}
