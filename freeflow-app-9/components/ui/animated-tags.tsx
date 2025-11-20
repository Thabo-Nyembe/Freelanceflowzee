'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface Tag {
  id: string | number
  label: string
  color?: string
}

interface AnimatedTagsProps {
  tags: (string | Tag)[]
  onTagClick?: (tag: string | Tag, index: number) => void
  onTagRemove?: (tag: string | Tag, index: number) => void
  removable?: boolean
  className?: string
  variant?: 'default' | 'gradient' | 'outline'
  animated?: boolean
}

export function AnimatedTags({
  tags,
  onTagClick,
  onTagRemove,
  removable = false,
  className = '',
  variant = 'default',
  animated = true
}: AnimatedTagsProps) {
  const [selectedTag, setSelectedTag] = useState<string | number | null>(null)

  const normalizeTag = (tag: string | Tag): Tag => {
    if (typeof tag === 'string') {
      return { id: tag, label: tag }
    }
    return tag
  }

  const getVariantClasses = (isSelected: boolean) => {
    if (isSelected) {
      return 'bg-blue-500 text-white border-blue-500'
    }

    switch (variant) {
      case 'gradient':
        return 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-transparent'
      case 'outline':
        return 'bg-transparent text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400'
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
    }
  }

  const handleTagClick = (tag: string | Tag, index: number) => {
    const normalizedTag = normalizeTag(tag)
    setSelectedTag(selectedTag === normalizedTag.id ? null : normalizedTag.id)
    onTagClick?.(tag, index)
  }

  const handleRemove = (e: React.MouseEvent, tag: string | Tag, index: number) => {
    e.stopPropagation()
    onTagRemove?.(tag, index)
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <AnimatePresence mode="popLayout">
        {tags.map((tag, index) => {
          const normalizedTag = normalizeTag(tag)
          const isSelected = selectedTag === normalizedTag.id

          return (
            <motion.button
              key={normalizedTag.id}
              layout
              initial={animated ? { opacity: 0, scale: 0.8 } : undefined}
              animate={animated ? { opacity: 1, scale: 1 } : undefined}
              exit={animated ? { opacity: 0, scale: 0.8 } : undefined}
              whileHover={animated ? { scale: 1.05 } : undefined}
              whileTap={animated ? { scale: 0.95 } : undefined}
              transition={{
                layout: { duration: 0.2 },
                opacity: { duration: 0.2 },
                scale: { duration: 0.2 }
              }}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer',
                getVariantClasses(isSelected)
              )}
              onClick={() => handleTagClick(tag, index)}
              style={normalizedTag.color ? { backgroundColor: normalizedTag.color } : undefined}
            >
              <span>{normalizedTag.label}</span>
              {removable && (
                <motion.button
                  whileHover={{ scale: 1.2, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => handleRemove(e, tag, index)}
                  className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                  aria-label={'Remove ' + normalizedTag.label}
                >
                  <X className="h-3 w-3" />
                </motion.button>
              )}
            </motion.button>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

// Simple animated badge variant (single tag)
interface AnimatedBadgeProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  animated?: boolean
  pulse?: boolean
}

export function AnimatedBadge({
  children,
  className = '',
  variant = 'default',
  animated = true,
  pulse = false
}: AnimatedBadgeProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'info':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }
  }

  return (
    <motion.span
      initial={animated ? { opacity: 0, scale: 0.8 } : undefined}
      animate={animated ? { opacity: 1, scale: 1 } : undefined}
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        getVariantClasses(),
        className
      )}
    >
      {pulse && (
        <motion.span
          className="absolute inset-0 rounded-full opacity-75"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          style={{ backgroundColor: 'currentColor' }}
        />
      )}
      <span className="relative">{children}</span>
    </motion.span>
  )
}
