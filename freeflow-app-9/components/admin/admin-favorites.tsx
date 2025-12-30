'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Star } from 'lucide-react'
import { getFavorites } from '@/lib/admin-navigation-config'
import type { NavigationItem } from '@/lib/admin-navigation-config'

export function AdminFavorites() {
  const pathname = usePathname()
  const [favorites, setFavorites] = useState<NavigationItem[]>([])
  const [showFavorites, setShowFavorites] = useState(true)

  useEffect(() => {
    // Load favorites from localStorage or use defaults
    const savedFavorites = localStorage.getItem('kazi-admin-favorites')
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites))
      } catch {
        setFavorites(getFavorites())
      }
    } else {
      setFavorites(getFavorites())
    }

    // Load visibility preference
    const showPref = localStorage.getItem('kazi-show-favorites')
    if (showPref !== null) {
      setShowFavorites(showPref === 'true')
    }
  }, [])

  const isActive = (href: string) => {
    return pathname === href
  }

  if (!showFavorites || favorites.length === 0) return null

  return (
    <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
          <Star className="h-3.5 w-3.5" />
          <span>Quick Access</span>
        </div>
      </div>
      <div className="space-y-0.5">
        {favorites.slice(0, 5).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-all duration-200',
              isActive(item.href)
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            )}
          >
            <span className="text-base">{item.icon}</span>
            <span className="flex-1 truncate">{item.label}</span>
            {item.isPremium && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500 text-white">
                Pro
              </span>
            )}
            {item.isNew && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-green-500 text-white">
                New
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
