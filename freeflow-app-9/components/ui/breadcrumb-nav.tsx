'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GlowEffect } from './glow-effect'

/**
 * Premium Breadcrumb Navigation
 * Animated breadcrumb trail with route segments
 */
interface BreadcrumbNavProps {
  className?: string
  homeLabel?: string
  separator?: React.ReactNode
  showHome?: boolean
  labels?: Record<string, string>
}

export function BreadcrumbNav({
  className,
  homeLabel = 'Home',
  separator = <ChevronRight className="w-4 h-4" />,
  showHome = true,
  labels = {}
}: BreadcrumbNavProps) {
  const pathname = usePathname()

  // Generate breadcrumb segments
  const segments = pathname.split('/').filter(Boolean)

  // Build breadcrumb items
  const breadcrumbs = segments.map((segment, index) => {
    const path = '/' + segments.slice(0, index + 1).join('/')
    const label = labels[segment] || segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    return { path, label, segment }
  })

  return (
    <nav className={cn('flex items-center gap-2 text-sm', className)}>
      {showHome && (
        <>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative group"
          >
            <Link
              href="/"
              className="flex items-center gap-1.5 px-2 py-1 rounded-md text-gray-400 hover:text-white transition-colors relative z-10"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">{homeLabel}</span>
            </Link>
            <GlowEffect className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-md blur opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>

          {breadcrumbs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-gray-600"
            >
              {separator}
            </motion.div>
          )}
        </>
      )}

      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1

        return (
          <motion.div
            key={crumb.path}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-2"
          >
            <div className="relative group">
              {isLast ? (
                <span className="px-2 py-1 rounded-md bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-white font-medium">
                  {crumb.label}
                </span>
              ) : (
                <>
                  <Link
                    href={crumb.path}
                    className="px-2 py-1 rounded-md text-gray-400 hover:text-white transition-colors relative z-10"
                  >
                    {crumb.label}
                  </Link>
                  <GlowEffect className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-md blur opacity-0 group-hover:opacity-100 transition-opacity" />
                </>
              )}
            </div>

            {!isLast && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 + 0.05 }}
                className="text-gray-600"
              >
                {separator}
              </motion.div>
            )}
          </motion.div>
        )
      })}
    </nav>
  )
}

/**
 * Compact Breadcrumb
 * Minimal breadcrumb for tight spaces
 */
export function CompactBreadcrumb({ className }: { className?: string }) {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)
  const currentPage = segments[segments.length - 1]

  if (!currentPage) return null

  const label = currentPage
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex items-center gap-2', className)}
    >
      <div className="h-6 w-1 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full" />
      <span className="text-sm font-medium bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
        {label}
      </span>
    </motion.div>
  )
}

export default BreadcrumbNav
