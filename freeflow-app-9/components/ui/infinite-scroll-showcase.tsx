"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './button'
import { Card } from './card'
import { Loader2, Plus, Zap } from 'lucide-react'
import { GlowEffect } from './glow-effect'
import { BorderTrail } from './border-trail'

// Enhanced InfiniteScrollContainer with intersection observer
const InfiniteScrollContainer = ({ children, onLoadMore, hasMore, ...props }: any) => {
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!hasMore || !onLoadMore) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries.length > 0 && entries[0].isIntersecting) {
          onLoadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasMore, onLoadMore])

  return (
    <div {...props}>
      {children}
      {hasMore && <div ref={loadMoreRef} className="h-10" />}
    </div>
  )
}

// Enhanced Infinite Scroll Showcase for KAZI
interface InfiniteScrollShowcaseProps {
  title: string
  data: any[]
  renderItem: (item: any, index: number) => React.ReactNode
  onLoadMore?: () => Promise<any[]>
  hasMore?: boolean
  className?: string
}

export function InfiniteScrollShowcase({
  title,
  data: initialData,
  renderItem,
  onLoadMore,
  hasMore = true,
  className
}: InfiniteScrollShowcaseProps) {
  const [items, setItems] = useState(initialData)
  const [loading, setLoading] = useState(false)
  const [hasMoreItems, setHasMoreItems] = useState(hasMore)

  const loadMoreItems = useCallback(async () => {
    if (!onLoadMore || loading || !hasMoreItems) return

    setLoading(true)
    try {
      const newItems = await onLoadMore()

      if (newItems.length === 0) {
        setHasMoreItems(false)
      } else {
        setItems(prev => [...prev, ...newItems])
      }
    } catch (error) {
      console.error('Failed to load more items:', error)
    } finally {
      setLoading(false)
    }
  }, [onLoadMore, loading, hasMoreItems])

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Enhanced Header with Premium Effects */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between relative group/header"
      >
        <GlowEffect className="absolute -inset-2 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10 rounded-lg blur opacity-0 group-hover/header:opacity-100 transition-opacity duration-500" />
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent relative z-10">{title}</h2>
        <div className="flex items-center gap-2 relative z-10">
          <Button
            variant="glass"
            size="sm"
            className="gap-2 relative group/btn"
          >
            <GlowEffect className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg blur opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
            <Plus className="w-4 h-4 relative z-10" />
            <span className="relative z-10">Add New</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 relative group/btn"
          >
            <GlowEffect className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
            <Zap className="w-4 h-4 relative z-10" />
            <span className="relative z-10">AI Enhance</span>
          </Button>
        </div>
      </motion.div>

      {/* Infinite Scroll Container */}
      <InfiniteScrollContainer
        onLoadMore={loadMoreItems}
        hasMore={hasMoreItems}
      >
        <div className="grid-2025">
          <AnimatePresence mode="popLayout">
            {items.map((item, index) => (
              <motion.div
                key={item.id || index}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  delay: (index % 12) * 0.05
                }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="group relative"
              >
                <GlowEffect className="absolute -inset-1 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Card variant="premium" hover glow className="h-full p-0 overflow-hidden relative z-10">
                  {renderItem(item, index)}
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Premium Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center py-8 relative"
          >
            <GlowEffect className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg blur-xl" />
            <Card variant="premium" className="px-6 py-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                  <div className="absolute inset-0 w-5 h-5 animate-ping text-purple-400/30">
                    <Loader2 className="w-5 h-5" />
                  </div>
                </div>
                <span className="text-sm font-medium bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Loading more amazing content...
                </span>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Premium End of Content */}
        {!hasMoreItems && items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center py-8 relative"
          >
            <GlowEffect className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg blur-xl" />
            <Card variant="gradient" className="px-8 py-6 text-center relative z-10">
              <BorderTrail className="bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500" size={40} duration={6} />
              <div className="text-sm font-medium bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                ✨ You've reached the end! All items loaded.
              </div>
            </Card>
          </motion.div>
        )}
      </InfiniteScrollContainer>
    </div>
  )
}

// Enhanced Grid Item Component
export function EnhancedGridItem({
  title,
  description,
  image,
  badge,
  actions,
  onClick
}: {
  title: string
  description?: string
  image?: string
  badge?: string
  actions?: React.ReactNode
  onClick?: () => void
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer h-full flex flex-col"
    >
      {/* Image/Visual */}
      {image && (
        <div className="relative h-48 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-t-xl overflow-hidden">
          <img src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          / loading="lazy">
          {badge && (
            <div className="absolute top-3 right-3">
              <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full shadow-lg">
                {badge}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>

        {description && (
          <p className="text-muted-foreground text-sm mb-4 line-clamp-3 flex-1">
            {description}
          </p>
        )}

        {/* Actions */}
        {actions && (
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            {actions}
          </div>
        )}
      </div>
    </motion.div>
  )
}