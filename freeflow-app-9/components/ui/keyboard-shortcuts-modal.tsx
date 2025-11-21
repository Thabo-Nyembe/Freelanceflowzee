'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Keyboard } from 'lucide-react'
import {
  useKeyboardShortcuts,
  formatShortcut,
  DEFAULT_SHORTCUTS,
  type ShortcutCategory
} from '@/lib/keyboard-shortcuts'
import { useFocusTrap } from '@/lib/accessibility'

interface KeyboardShortcutsModalProps {
  /** Custom shortcuts to display (defaults to DEFAULT_SHORTCUTS) */
  shortcuts?: ShortcutCategory[]
  /** Whether to show the modal initially */
  defaultOpen?: boolean
  /** Callback when modal opens/closes */
  onOpenChange?: (open: boolean) => void
}

export function KeyboardShortcutsModal({
  shortcuts = DEFAULT_SHORTCUTS,
  defaultOpen = false,
  onOpenChange
}: KeyboardShortcutsModalProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const focusTrapRef = useFocusTrap<HTMLDivElement>(isOpen)

  // Toggle modal with "?" key
  useKeyboardShortcuts([
    {
      key: '?',
      description: 'Show keyboard shortcuts',
      action: () => toggleModal()
    }
  ])

  const toggleModal = () => {
    const newState = !isOpen
    setIsOpen(newState)
    onOpenChange?.(newState)
  }

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        toggleModal()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={toggleModal}
        className="fixed bottom-6 right-6 z-40 group"
        aria-label="Show keyboard shortcuts"
        title="Show keyboard shortcuts (Press ?)"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
          <div className="relative bg-gradient-to-r from-violet-600 to-purple-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all group-hover:scale-110">
            <Keyboard className="w-5 h-5" />
          </div>
        </div>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleModal}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              aria-hidden="true"
            />

            {/* Modal Content */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                ref={focusTrapRef}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', duration: 0.3 }}
                className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
                role="dialog"
                aria-modal="true"
                aria-labelledby="shortcuts-modal-title"
              >
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Keyboard className="w-6 h-6 text-white" />
                    <h2
                      id="shortcuts-modal-title"
                      className="text-xl font-semibold text-white"
                    >
                      Keyboard Shortcuts
                    </h2>
                  </div>
                  <button
                    onClick={toggleModal}
                    className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(80vh-80px)] px-6 py-6">
                  <div className="space-y-8">
                    {shortcuts.map((category, idx) => (
                      <motion.div
                        key={category.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        {/* Category Title */}
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <div className="w-1 h-6 bg-gradient-to-b from-violet-500 to-purple-500 rounded-full" />
                          {category.name}
                        </h3>

                        {/* Shortcuts Grid */}
                        <div className="grid gap-3">
                          {category.shortcuts.map((shortcut, sidx) => (
                            <motion.div
                              key={sidx}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 + sidx * 0.05 }}
                              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                            >
                              {/* Description */}
                              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                                {shortcut.description}
                              </span>

                              {/* Shortcut Keys */}
                              <div className="flex items-center gap-1">
                                {formatShortcut(shortcut).split(' + ').map((key, kidx) => (
                                  <span key={kidx} className="flex items-center">
                                    {kidx > 0 && (
                                      <span className="text-gray-400 mx-1">+</span>
                                    )}
                                    <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-sm min-w-[2rem] text-center">
                                      {key}
                                    </kbd>
                                  </span>
                                ))}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Footer Tip */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: shortcuts.length * 0.1 + 0.2 }}
                    className="mt-8 p-4 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-lg border border-violet-200 dark:border-violet-800"
                  >
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                      <span className="font-semibold text-violet-600 dark:text-violet-400">Pro Tip:</span>{' '}
                      Press{' '}
                      <kbd className="px-2 py-0.5 text-xs font-semibold bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded mx-1">
                        ?
                      </kbd>{' '}
                      anytime to open this dialog, or{' '}
                      <kbd className="px-2 py-0.5 text-xs font-semibold bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded mx-1">
                        Esc
                      </kbd>{' '}
                      to close it.
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

/**
 * Standalone trigger button for keyboard shortcuts modal
 * Use this if you want just the floating button without the modal logic
 */
export function KeyboardShortcutsTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 group"
      aria-label="Show keyboard shortcuts"
      title="Show keyboard shortcuts (Press ?)"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
        <div className="relative bg-gradient-to-r from-violet-600 to-purple-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all group-hover:scale-110">
          <Keyboard className="w-5 h-5" />
        </div>
      </div>
    </button>
  )
}

/**
 * Display a single shortcut inline (for contextual help)
 */
export function InlineShortcut({
  keys,
  description
}: {
  keys: string[]
  description?: string
}) {
  return (
    <span className="inline-flex items-center gap-1" title={description}>
      {keys.map((key, idx) => (
        <span key={idx} className="inline-flex items-center">
          {idx > 0 && <span className="text-gray-400 mx-1">+</span>}
          <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
            {key}
          </kbd>
        </span>
      ))}
    </span>
  )
}
