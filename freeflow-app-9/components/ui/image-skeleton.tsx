"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import Image from "next/image"
import { useState, useCallback, memo } from "react"

/**
 * Image Skeleton & Optimized Image Loading Components
 *
 * Provides:
 * - Skeleton placeholders while images load
 * - Blur placeholder support
 * - Error state handling
 * - Lazy loading by default
 * - Priority loading for above-the-fold images
 */

// Default blur placeholder data URL (gray gradient)
export const DEFAULT_BLUR_PLACEHOLDER =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAME/8QAIhAAAgEDAwUBAAAAAAAAAAAAAQIDBBEhABIxBQYTQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAgP/xAAYEQEBAQEBAAAAAAAAAAAAAAABAgADEf/aAAwDAQACEQMRAD8AyRU9NL06aKjqzBUxNulkZQWBJYEA+xYfPmtaKpqa6ljqqaZopozlHXkHTWk0w5JOp//Z"

// ============================================================================
// IMAGE SKELETON COMPONENT
// ============================================================================

interface ImageSkeletonProps {
  className?: string
  aspectRatio?: "square" | "video" | "portrait" | "auto"
  animate?: boolean
}

/**
 * ImageSkeleton - Animated placeholder while image loads
 */
export const ImageSkeleton = memo(function ImageSkeleton({
  className,
  aspectRatio = "auto",
  animate = true,
}: ImageSkeletonProps) {
  const aspectClasses = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]",
    auto: "",
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-muted",
        aspectClasses[aspectRatio],
        className
      )}
    >
      {animate && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{ x: ["-100%", "100%"] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      )}
    </div>
  )
})

// ============================================================================
// OPTIMIZED IMAGE WITH SKELETON
// ============================================================================

interface OptimizedImageWithSkeletonProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  sizes?: string
  className?: string
  containerClassName?: string
  priority?: boolean
  quality?: number
  aspectRatio?: "square" | "video" | "portrait" | "auto"
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
}

/**
 * OptimizedImageWithSkeleton - Next.js Image with loading skeleton
 *
 * @example
 * <OptimizedImageWithSkeleton
 *   src="/hero.jpg"
 *   alt="Hero image"
 *   width={1920}
 *   height={1080}
 *   priority
 * />
 */
export const OptimizedImageWithSkeleton = memo(function OptimizedImageWithSkeleton({
  src,
  alt,
  width,
  height,
  fill = false,
  sizes,
  className,
  containerClassName,
  priority = false,
  quality = 75,
  aspectRatio = "auto",
  blurDataURL = DEFAULT_BLUR_PLACEHOLDER,
  onLoad,
  onError,
}: OptimizedImageWithSkeletonProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoad = useCallback(() => {
    setIsLoading(false)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }, [onError])

  const aspectClasses = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]",
    auto: "",
  }

  if (hasError) {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center bg-muted text-muted-foreground",
          aspectClasses[aspectRatio],
          containerClassName
        )}
      >
        <svg
          className="w-8 h-8 opacity-50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        aspectClasses[aspectRatio],
        containerClassName
      )}
    >
      {/* Skeleton placeholder */}
      {isLoading && (
        <ImageSkeleton
          className="absolute inset-0"
          aspectRatio={aspectRatio}
        />
      )}

      {/* Actual image */}
      <Image
        src={src}
        alt={alt}
        {...(fill
          ? { fill: true, sizes: sizes || "100vw" }
          : { width, height }
        )}
        quality={quality}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        placeholder="blur"
        blurDataURL={blurDataURL}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  )
})

// ============================================================================
// GALLERY IMAGE COMPONENT
// ============================================================================

interface GalleryImageProps {
  src: string
  alt: string
  className?: string
  aspectRatio?: "square" | "video" | "portrait"
  onClick?: () => void
  showOverlay?: boolean
  overlayContent?: React.ReactNode
}

/**
 * GalleryImage - Optimized image for gallery/grid views
 */
export const GalleryImage = memo(function GalleryImage({
  src,
  alt,
  className,
  aspectRatio = "square",
  onClick,
  showOverlay = false,
  overlayContent,
}: GalleryImageProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <OptimizedImageWithSkeleton
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        aspectRatio={aspectRatio}
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />

      {/* Optional overlay */}
      {showOverlay && (
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {overlayContent}
          </div>
        </div>
      )}
    </div>
  )
})

// ============================================================================
// THUMBNAIL IMAGE COMPONENT
// ============================================================================

interface ThumbnailImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
}

/**
 * ThumbnailImage - Small optimized thumbnail for lists
 */
export const ThumbnailImage = memo(function ThumbnailImage({
  src,
  alt,
  width = 96,
  height = 96,
  className,
}: ThumbnailImageProps) {
  return (
    <OptimizedImageWithSkeleton
      src={src}
      alt={alt}
      width={width}
      height={height}
      quality={60}
      className={cn("object-cover rounded", className)}
      aspectRatio="square"
    />
  )
})

// ============================================================================
// HERO IMAGE COMPONENT
// ============================================================================

interface HeroImageProps {
  src: string
  alt: string
  className?: string
  containerClassName?: string
}

/**
 * HeroImage - Above-the-fold hero image with priority loading
 */
export const HeroImage = memo(function HeroImage({
  src,
  alt,
  className,
  containerClassName,
}: HeroImageProps) {
  return (
    <OptimizedImageWithSkeleton
      src={src}
      alt={alt}
      fill
      priority
      quality={90}
      sizes="100vw"
      className={cn("object-cover", className)}
      containerClassName={cn("w-full", containerClassName)}
      aspectRatio="video"
    />
  )
})

// ============================================================================
// AVATAR IMAGE WITH SKELETON
// ============================================================================

interface AvatarImageSkeletonProps {
  src?: string | null
  alt?: string
  size?: number
  className?: string
  fallback?: React.ReactNode
}

/**
 * AvatarImageSkeleton - Avatar with loading state and fallback
 */
export const AvatarImageSkeleton = memo(function AvatarImageSkeleton({
  src,
  alt = "Avatar",
  size = 40,
  className,
  fallback,
}: AvatarImageSkeletonProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  if (!src || hasError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-muted text-muted-foreground",
          className
        )}
        style={{ width: size, height: size }}
      >
        {fallback || (
          <span className="text-sm font-medium">
            {alt?.charAt(0).toUpperCase() || "?"}
          </span>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn("relative overflow-hidden rounded-full", className)}
      style={{ width: size, height: size }}
    >
      {isLoading && (
        <div className="absolute inset-0 animate-pulse bg-muted rounded-full" />
      )}
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className={cn(
          "rounded-full object-cover transition-opacity duration-200",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        placeholder="blur"
        blurDataURL={DEFAULT_BLUR_PLACEHOLDER}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false)
          setHasError(true)
        }}
      />
    </div>
  )
})

// ============================================================================
// VIDEO THUMBNAIL WITH SKELETON
// ============================================================================

interface VideoThumbnailSkeletonProps {
  src: string
  alt: string
  duration?: string
  className?: string
  onClick?: () => void
}

/**
 * VideoThumbnailSkeleton - Video thumbnail with duration badge and skeleton
 */
export const VideoThumbnailSkeleton = memo(function VideoThumbnailSkeleton({
  src,
  alt,
  duration,
  className,
  onClick,
}: VideoThumbnailSkeletonProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <OptimizedImageWithSkeleton
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        aspectRatio="video"
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />

      {/* Play button overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
          <svg className="w-5 h-5 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>

      {/* Duration badge */}
      {duration && (
        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-white text-xs font-medium">
          {duration}
        </div>
      )}
    </div>
  )
})

// ============================================================================
// IMAGE GRID WITH SKELETONS
// ============================================================================

interface ImageGridSkeletonProps {
  count?: number
  columns?: 2 | 3 | 4
  aspectRatio?: "square" | "video" | "portrait"
  className?: string
}

/**
 * ImageGridSkeleton - Grid of image skeletons for loading states
 */
export function ImageGridSkeleton({
  count = 6,
  columns = 3,
  aspectRatio = "square",
  className,
}: ImageGridSkeletonProps) {
  const colClasses = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  }

  return (
    <div className={cn("grid gap-4", colClasses[columns], className)}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.05 }}
        >
          <ImageSkeleton aspectRatio={aspectRatio} />
        </motion.div>
      ))}
    </div>
  )
}
