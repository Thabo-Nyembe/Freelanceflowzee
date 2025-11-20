'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { searchNavigation, QUICK_ACTIONS } from '@/lib/admin-navigation-config'
import type { NavigationItem } from '@/lib/admin-navigation-config'

export function AdminSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<NavigationItem[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)

  // Global keyboard shortcut (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Update search results
  useEffect(() => {
    if (query.trim()) {
      const searchResults = searchNavigation(query)
      setResults(searchResults)
      setSelectedIndex(0)
    } else {
      setResults([])
    }
  }, [query])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault()
      handleNavigate(results[selectedIndex].href)
    }
  }

  const handleNavigate = (href: string) => {
    router.push(href)
    setIsOpen(false)
    setQuery('')
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-sm text-muted-foreground"
      >
        <span>🔍</span>
        <span>Search admin...</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs bg-background rounded border">
          <span>⌘</span>K
        </kbd>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-20">
      <div ref={searchRef} className="w-full max-w-2xl mx-4">
        <div className="bg-background rounded-lg shadow-2xl border">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b">
            <span className="text-xl">🔍</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search admin features, actions, and tools..."
              className="flex-1 bg-transparent outline-none text-lg"
              autoFocus
            />
            <button
              onClick={() => setIsOpen(false)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ESC
            </button>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {query.trim() === '' ? (
              // Quick Actions when no query
              <div className="p-2">
                <div className="px-3 py-2 text-xs text-muted-foreground font-semibold">Quick Actions</div>
                {QUICK_ACTIONS.map((action, index) => (
                  <button
                    key={action.id}
                    onClick={() => handleNavigate(action.action)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted rounded-lg transition-colors text-left"
                  >
                    <span className="text-xl">{action.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium">{action.label}</div>
                      <div className="text-xs text-muted-foreground">{action.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            ) : results.length > 0 ? (
              // Search Results
              <div className="p-2">
                <div className="px-3 py-2 text-xs text-muted-foreground font-semibold">
                  {results.length} result{results.length !== 1 ? 's' : ''}
                </div>
                {results.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => handleNavigate(result.href)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                      index === selectedIndex ? 'bg-muted' : 'hover:bg-muted/50'
                    }`}
                  >
                    <span className="text-xl">{result.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium flex items-center gap-2">
                        {result.label}
                        {result.isNew && (
                          <span className="text-xs px-2 py-0.5 rounded bg-green-500 text-white">New</span>
                        )}
                        {result.isPremium && (
                          <span className="text-xs px-2 py-0.5 rounded bg-purple-500 text-white">Premium</span>
                        )}
                        {result.badge && (
                          <span className="text-xs px-2 py-0.5 rounded bg-red-500 text-white">{result.badge}</span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">{result.description}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {result.href}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              // No Results
              <div className="p-8 text-center text-muted-foreground">
                <div className="text-4xl mb-2">🔍</div>
                <div>No results found for "{query}"</div>
                <div className="text-sm mt-2">Try searching for analytics, invoices, clients, or campaigns</div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t bg-muted/30 text-xs text-muted-foreground flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-background rounded border">↑↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-background rounded border">↵</kbd>
                Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-background rounded border">ESC</kbd>
                Close
              </span>
            </div>
            <div className="text-muted-foreground/50">
              Press <kbd className="px-1.5 py-0.5 bg-background rounded border text-xs">⌘K</kbd> anytime
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
