'use client'

import { useState, useEffect } from 'react'
import { useMarketingContent } from '@/hooks/use-dynamic-content'
import { X, Megaphone, ChevronRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface Announcement {
  id: string
  title: string
  content?: string
  cta_link?: string
  cta_text?: string
  type?: 'info' | 'success' | 'warning' | 'feature'
}

export function AnnouncementsBanner() {
  const { content, loading } = useMarketingContent()
  const [dismissed, setDismissed] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  // Get featured announcements
  const announcements = content
    .filter(c => c.is_featured)
    .map(c => {
      const meta = c.metadata as { cta_link?: string; cta_text?: string; type?: 'info' | 'success' | 'warning' | 'feature' }
      return {
        id: c.id,
        title: c.title,
        content: c.subtitle || c.content,
        cta_link: meta?.cta_link,
        cta_text: meta?.cta_text,
        type: meta?.type || 'feature' as const
      }
    })
    .filter(a => !dismissed.includes(a.id))

  // Auto-rotate announcements
  useEffect(() => {
    if (announcements.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % announcements.length)
    }, 8000)

    return () => clearInterval(interval)
  }, [announcements.length])

  if (loading || announcements.length === 0) return null

  const current = announcements[currentIndex]

  const typeStyles = {
    info: 'from-blue-500/10 to-cyan-500/10 border-blue-500/20',
    success: 'from-green-500/10 to-emerald-500/10 border-green-500/20',
    warning: 'from-amber-500/10 to-orange-500/10 border-amber-500/20',
    feature: 'from-purple-500/10 to-pink-500/10 border-purple-500/20'
  }

  const iconStyles = {
    info: 'text-blue-500',
    success: 'text-green-500',
    warning: 'text-amber-500',
    feature: 'text-purple-500'
  }

  return (
    <div className={cn(
      "relative flex items-center gap-4 px-4 py-3 rounded-lg border bg-gradient-to-r mb-4",
      typeStyles[current.type || 'feature']
    )}>
      <div className={cn("flex-shrink-0", iconStyles[current.type || 'feature'])}>
        {current.type === 'feature' ? (
          <Sparkles className="h-5 w-5" />
        ) : (
          <Megaphone className="h-5 w-5" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{current.title}</p>
        {current.content && (
          <p className="text-sm text-muted-foreground truncate">{current.content}</p>
        )}
      </div>

      {current.cta_link && (
        <Link href={current.cta_link}>
          <Button size="sm" variant="ghost" className="flex-shrink-0">
            {current.cta_text || 'Learn More'}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      )}

      {announcements.length > 1 && (
        <div className="flex items-center gap-1">
          {announcements.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                i === currentIndex
                  ? "bg-primary w-4"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
            />
          ))}
        </div>
      )}

      <button
        onClick={() => setDismissed(prev => [...prev, current.id])}
        className="flex-shrink-0 p-1 rounded hover:bg-black/5 dark:hover:bg-white/5"
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </button>
    </div>
  )
}

export function CompactAnnouncementsBanner() {
  const { content, loading } = useMarketingContent()
  const [dismissed, setDismissed] = useState(false)

  const featured = content.find(c => c.is_featured)

  if (loading || !featured || dismissed) return null

  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4" />
        <span className="font-medium">{featured.title}</span>
        {featured.subtitle && (
          <span className="hidden sm:inline text-white/80">— {featured.subtitle}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Link href="/dashboard/ai-create-v2" className="hover:underline">
          Learn more <ChevronRight className="h-3 w-3 inline" />
        </Link>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded hover:bg-white/10"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}
