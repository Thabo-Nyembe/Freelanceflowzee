"use client"

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './button'
import { Card } from './card'

// Simple InfiniteScrollContainer replacement
const InfiniteScrollContainer = ({ children, onIntersect, ...props }: any) => {
  return <div {...props}>{children}</div>
}
import { Loader2, Plus, Zap } from 'lucide-react'

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
      {/* Enhanced Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h2 className="text-2xl font-bold text-gradient">{title}</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="glass"
            size="sm"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
          >
            <Zap className="w-4 h-4" />
            AI Enhance
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
                className="group"
              >
                <Card variant="default" className="h-full p-0 overflow-hidden">
                  {renderItem(item, index)}
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center py-8"
          >
            <Card className="px-6 py-4">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm font-medium">Loading more amazing content...</span>
              </div>
            </Card>
          </motion.div>
        )}

        {/* End of Content */}
        {!hasMoreItems && items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center py-8"
          >
            <Card className="px-6 py-4 text-center">
              <div className="text-muted-foreground text-sm">
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
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
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