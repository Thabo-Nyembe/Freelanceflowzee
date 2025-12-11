"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

/**
 * Skeleton Screens & Loading States - A+++ UI/UX
 * Premium loading experiences with smooth animations
 */

// ============================================================================
// BASE SKELETON COMPONENTS
// ============================================================================

interface SkeletonProps {
  className?: string
  variant?: "light" | "dark"
}

/**
 * Skeleton - Base skeleton with shimmer effect
 */
export function Skeleton({ className, variant = "light" }: SkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md",
        variant === "light"
          ? "bg-gray-200 dark:bg-gray-800"
          : "bg-gray-300 dark:bg-gray-700",
        className
      )}
    >
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{
          x: ["-100%", "100%"],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  )
}

/**
 * SkeletonText - Text placeholder
 */
export function SkeletonText({ className, variant }: SkeletonProps) {
  return <Skeleton className={cn("h-4 w-full", className)} variant={variant} />
}

/**
 * SkeletonCircle - Circular placeholder (avatars)
 */
export function SkeletonCircle({ className, variant }: SkeletonProps) {
  return <Skeleton className={cn("h-12 w-12 rounded-full", className)} variant={variant} />
}

/**
 * SkeletonButton - Button placeholder
 */
export function SkeletonButton({ className, variant }: SkeletonProps) {
  return <Skeleton className={cn("h-10 w-24 rounded-lg", className)} variant={variant} />
}

// ============================================================================
// COMPLEX SKELETON LAYOUTS
// ============================================================================

/**
 * SkeletonCard - Card with image and text
 */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-6 space-y-4", className)}>
      {/* Image placeholder */}
      <Skeleton className="h-48 w-full rounded-xl" />

      {/* Title */}
      <SkeletonText className="h-6 w-3/4" />

      {/* Description lines */}
      <div className="space-y-2">
        <SkeletonText className="h-4 w-full" />
        <SkeletonText className="h-4 w-5/6" />
        <SkeletonText className="h-4 w-4/6" />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4">
        <SkeletonCircle className="h-8 w-8" />
        <SkeletonButton className="h-8 w-20" />
      </div>
    </div>
  )
}

/**
 * SkeletonList - List items with avatar and text
 */
export function SkeletonList({ items = 5, className }: { items?: number; className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <motion.div
          key={i}
          className="flex items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <SkeletonCircle />
          <div className="flex-1 space-y-2">
            <SkeletonText className="h-4 w-3/4" />
            <SkeletonText className="h-3 w-1/2" />
          </div>
        </motion.div>
      ))}
    </div>
  )
}

/**
 * SkeletonTable - Table with rows
 */
export function SkeletonTable({ rows = 5, cols = 4, className }: { rows?: number; cols?: number; className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonText key={i} className="h-6 w-full" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <motion.div
          key={rowIndex}
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: rowIndex * 0.05 }}
        >
          {Array.from({ length: cols }).map((_, colIndex) => (
            <SkeletonText key={colIndex} className="h-4 w-full" />
          ))}
        </motion.div>
      ))}
    </div>
  )
}

/**
 * SkeletonDashboard - Dashboard grid layout
 */
export function SkeletonDashboard({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={i}
            className="rounded-xl border border-border bg-card p-6 space-y-3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <SkeletonText className="h-4 w-20" />
            <Skeleton className="h-8 w-24" />
            <SkeletonText className="h-3 w-16" />
          </motion.div>
        ))}
      </div>

      {/* Chart placeholder */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <SkeletonText className="h-6 w-48 mb-6" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border bg-card p-6">
          <SkeletonText className="h-6 w-32 mb-6" />
          <SkeletonList items={3} />
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <SkeletonText className="h-6 w-32 mb-6" />
          <SkeletonList items={3} />
        </div>
      </div>
    </div>
  )
}

/**
 * SkeletonProfile - User profile layout
 */
export function SkeletonProfile({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with avatar and name */}
      <div className="flex items-center gap-6">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="flex-1 space-y-3">
          <SkeletonText className="h-6 w-48" />
          <SkeletonText className="h-4 w-64" />
          <SkeletonText className="h-4 w-32" />
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <SkeletonText className="h-4 w-full" />
        <SkeletonText className="h-4 w-5/6" />
        <SkeletonText className="h-4 w-4/6" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="text-center space-y-2">
            <Skeleton className="h-8 w-16 mx-auto" />
            <SkeletonText className="h-3 w-20 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// SPECIALIZED LOADING STATES
// ============================================================================

/**
 * SkeletonGallery - Image gallery grid
 */
export function SkeletonGallery({ items = 9, className }: { items?: number; className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
        >
          <Skeleton className="aspect-square rounded-xl" />
        </motion.div>
      ))}
    </div>
  )
}

/**
 * SkeletonTimeline - Timeline/feed layout
 */
export function SkeletonTimeline({ items = 5, className }: { items?: number; className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <motion.div
          key={i}
          className="flex gap-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          {/* Timeline dot */}
          <div className="flex flex-col items-center">
            <SkeletonCircle className="h-10 w-10" />
            {i < items - 1 && <Skeleton className="w-0.5 flex-1 mt-2" />}
          </div>

          {/* Content */}
          <div className="flex-1 space-y-3 pb-8">
            <SkeletonText className="h-5 w-2/3" />
            <div className="space-y-2">
              <SkeletonText className="h-4 w-full" />
              <SkeletonText className="h-4 w-5/6" />
            </div>
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        </motion.div>
      ))}
    </div>
  )
}

/**
 * SkeletonChat - Chat message layout
 */
export function SkeletonChat({ messages = 5, className }: { messages?: number; className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: messages }).map((_, i) => {
        const isOwn = i % 2 === 0
        return (
          <motion.div
            key={i}
            className={cn("flex gap-3", isOwn && "flex-row-reverse")}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <SkeletonCircle className="h-8 w-8" />
            <div className={cn("space-y-2", isOwn ? "items-end" : "items-start")}>
              <Skeleton className={cn("h-16 rounded-2xl", isOwn ? "rounded-tr-sm" : "rounded-tl-sm")} style={{ width: `${Math.random() * 100 + 150}px` }} />
              <SkeletonText className="h-3 w-16" />
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

/**
 * SkeletonForm - Form layout with inputs
 */
export function SkeletonForm({ fields = 5, className }: { fields?: number; className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <motion.div
          key={i}
          className="space-y-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <SkeletonText className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </motion.div>
      ))}

      <div className="flex gap-4 pt-4">
        <SkeletonButton className="h-10 w-24" />
        <SkeletonButton className="h-10 w-24" />
      </div>
    </div>
  )
}

// ============================================================================
// CONTENT-SPECIFIC SKELETONS
// ============================================================================

/**
 * SkeletonBlogPost - Blog post layout
 */
export function SkeletonBlogPost({ className }: { className?: string }) {
  return (
    <article className={cn("max-w-4xl mx-auto space-y-8", className)}>
      {/* Header */}
      <div className="space-y-4">
        <SkeletonText className="h-10 w-3/4" />
        <div className="flex items-center gap-4">
          <SkeletonCircle className="h-10 w-10" />
          <div className="space-y-2 flex-1">
            <SkeletonText className="h-4 w-32" />
            <SkeletonText className="h-3 w-24" />
          </div>
        </div>
      </div>

      {/* Featured image */}
      <Skeleton className="h-96 w-full rounded-2xl" />

      {/* Content */}
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <SkeletonText className="h-4 w-full" />
            <SkeletonText className="h-4 w-full" />
            <SkeletonText className="h-4 w-5/6" />
          </div>
        ))}
      </div>
    </article>
  )
}

/**
 * SkeletonProductCard - E-commerce product
 */
export function SkeletonProductCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card overflow-hidden", className)}>
      {/* Product image */}
      <Skeleton className="aspect-square w-full" />

      {/* Product details */}
      <div className="p-6 space-y-4">
        <SkeletonText className="h-5 w-3/4" />
        <SkeletonText className="h-4 w-1/2" />
        <Skeleton className="h-8 w-24" />
        <SkeletonButton className="h-10 w-full" />
      </div>
    </div>
  )
}

/**
 * SkeletonVideoPlayer - Video player layout
 */
export function SkeletonVideoPlayer({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Video container */}
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-black">
        <Skeleton className="w-full h-full" variant="dark" />

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Skeleton className="h-16 w-16 rounded-full" />
        </div>

        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
          <Skeleton className="h-1 w-full" />
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-16 rounded" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Video info */}
      <div className="space-y-3">
        <SkeletonText className="h-6 w-3/4" />
        <div className="flex items-center gap-3">
          <SkeletonCircle className="h-10 w-10" />
          <div className="flex-1 space-y-2">
            <SkeletonText className="h-4 w-32" />
            <SkeletonText className="h-3 w-24" />
          </div>
          <SkeletonButton className="h-9 w-28" />
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// FULL PAGE LOADERS
// ============================================================================

/**
 * PageLoader - Full page loading state
 */
export function PageLoader({ className }: { className?: string }) {
  return (
    <div className={cn("min-h-screen flex items-center justify-center", className)}>
      <div className="text-center space-y-4">
        <motion.div
          className="h-16 w-16 mx-auto border-4 border-violet-200 border-t-violet-600 rounded-full"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <SkeletonText className="h-4 w-32 mx-auto" />
        </motion.div>
      </div>
    </div>
  )
}

/**
 * SplashLoader - Brand splash screen loader
 */
export function SplashLoader({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn("min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-600 to-purple-600", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="text-center">
        <motion.div
          className="text-6xl font-bold text-white mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.8 }}
        >
          KAZI
        </motion.div>

        <motion.div
          className="h-1 w-64 mx-auto bg-white/20 rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            className="h-full bg-white rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        </motion.div>
      </div>
    </motion.div>
  )
}
