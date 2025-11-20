'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ADMIN_NAVIGATION, getFavorites } from '@/lib/admin-navigation-config'
import type { NavigationItem } from '@/lib/admin-navigation-config'

export function MobileAdminNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const favorites = getFavorites()

  const isActive = (href: string) => pathname === href

  return (
    <>
      {/* Mobile Header with Menu Toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            <h1 className="text-xl font-bold">KAZI Admin</h1>
          </div>
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            🔔
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
            />

            {/* Slide-out Menu */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 w-[280px] bg-white dark:bg-gray-900 z-50 overflow-y-auto"
            >
              <div className="p-6">
                {/* Logo */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                    K
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">KAZI</h2>
                    <p className="text-xs text-muted-foreground">Admin Dashboard</p>
                  </div>
                </div>

                {/* Quick Access */}
                <div className="mb-6">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">
                    Quick Access
                  </div>
                  <div className="space-y-1">
                    {favorites.slice(0, 5).map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                          isActive(item.href)
                            ? 'bg-blue-500 text-white'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        )}
                      >
                        <span className="text-xl">{item.icon}</span>
                        <span className="text-sm font-medium">{item.label}</span>
                        {item.isNew && (
                          <span className="ml-auto text-xs px-1.5 py-0.5 bg-green-500 text-white rounded">
                            New
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* All Categories */}
                {ADMIN_NAVIGATION.map((group) => (
                  <div key={group.id} className="mb-6">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1 flex items-center gap-2">
                      <span>{group.icon}</span>
                      <span>{group.label}</span>
                    </div>
                    <div className="space-y-1">
                      {group.items.slice(0, 4).map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                            isActive(item.href)
                              ? 'bg-blue-500 text-white'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                          )}
                        >
                          <span className="text-xl">{item.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{item.label}</div>
                            {item.description && (
                              <div className="text-xs text-muted-foreground truncate">
                                {item.description}
                              </div>
                            )}
                          </div>
                          {item.badge && (
                            <span className="text-xs px-1.5 py-0.5 bg-red-500 text-white rounded">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      ))}
                      {group.items.length > 4 && (
                        <button
                          onClick={() => setIsOpen(false)}
                          className="w-full text-left px-3 py-2 text-xs text-blue-500 hover:text-blue-600 font-medium"
                        >
                          View all {group.items.length} →
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Logout */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                  <button
                    onClick={() => {
                      // Logout logic
                      setIsOpen(false)
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                  >
                    <span className="text-xl">🚪</span>
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Navigation Bar for Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-2 py-2">
        <div className="grid grid-cols-5 gap-1">
          {favorites.slice(0, 5).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors',
                isActive(item.href)
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              <span className="text-xl mb-0.5">{item.icon}</span>
              <span className="text-[10px] font-medium truncate w-full text-center">
                {item.label.split(' ')[0]}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
