'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff, Wifi } from 'lucide-react'
import { useOfflineIndicator } from '@/hooks/use-online-status'

export function OfflineIndicator() {
  const { isOnline, showIndicator } = useOfflineIndicator()

  return (
    <AnimatePresence>
      {showIndicator && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-[100]"
        >
          <div
            className={`flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium ${
              isOnline
                ? 'bg-green-500 text-white'
                : 'bg-orange-500 text-white'
            }`}
          >
            {isOnline ? (
              <>
                <Wifi className="w-4 h-4" />
                <span>Back online - Syncing changes...</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4" />
                <span>You&apos;re offline - Changes will sync when reconnected</span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Compact offline badge for headers/navbars
 */
export function OfflineBadge() {
  const { isOnline } = useOfflineIndicator()

  if (isOnline) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-orange-500/10 text-orange-500 text-xs font-medium"
    >
      <WifiOff className="w-3 h-3" />
      <span>Offline</span>
    </motion.div>
  )
}
