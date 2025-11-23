/**
 * Modern Next.js 14 Optimized Image Component
 *
 * Following latest Next.js 14 patterns:
 * - priority prop for LCP images
 * - Proper width/height for CLS prevention
 * - loading prop for lazy loading
 * - sizes prop for responsive images
 */

'use client'

import Image, { ImageProps } from 'next/image'
import React from 'react'

interface OptimizedImageProps extends Omit<ImageProps, 'src'> {
  src: string | StaticImageData
  alt: string
  /**
   * Mark as priority if this is the Largest Contentful Paint (LCP) image
   * Typically the hero image or main banner
   */
  priority?: boolean
  /**
   * Automatically add blur placeholder for better UX
   */
  blur?: boolean
  /**
   * Custom fallback for error states
   */
  fallback?: string
  /**
   * Wrapper className for additional styling
   */
  wrapperClassName?: string
}

interface StaticImageData {
  src: string
  height: number
  width: number
  blurDataURL?: string
}

/**
 * Optimized Image Component with Next.js 14 best practices
 *
 * @example
 * // Hero image (LCP) - use priority
 * <OptimizedImageV2
 *   src="/hero.jpg"
 *   alt="Hero banner"
 *   width={1920}
 *   height={1080}
 *   priority
 * />
 *
 * @example
 * // Regular image - lazy loaded
 * <OptimizedImageV2
 *   src="/product.jpg"
 *   alt="Product image"
 *   width={800}
 *   height={600}
 * />
 *
 * @example
 * // Responsive image with sizes
 * <OptimizedImageV2
 *   src="/banner.jpg"
 *   alt="Banner"
 *   width={1200}
 *   height={600}
 *   sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
 * />
 */
export function OptimizedImageV2({
  src,
  alt,
  priority = false,
  blur = true,
  fallback = '/placeholder.png',
  wrapperClassName,
  className,
  ...props
}: OptimizedImageProps) {
  const [error, setError] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)

  // Use fallback if error occurs
  const imageSrc = error ? fallback : src

  return (
    <div className={wrapperClassName} style={{ position: 'relative' }}>
      <Image
        src={imageSrc}
        alt={alt}
        className={className}
        // Priority images bypass lazy loading and are preloaded
        priority={priority}
        // Lazy loading for non-priority images
        loading={priority ? undefined : 'lazy'}
        // Blur placeholder for better perceived performance
        placeholder={blur ? 'blur' : 'empty'}
        // Quality optimization (default is 75)
        quality={85}
        onError={() => setError(true)}
        onLoadingComplete={() => setIsLoading(false)}
        {...props}
      />

      {/* Optional loading state */}
      {isLoading && !priority && (
        <div
          className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse"
          aria-label="Loading image"
        />
      )}
    </div>
  )
}

/**
 * Hero Image Component - Pre-configured for LCP optimization
 *
 * @example
 * <HeroImage
 *   src="/hero-banner.jpg"
 *   alt="Welcome to KAZI Platform"
 *   width={1920}
 *   height={1080}
 * />
 */
export function HeroImage(props: OptimizedImageProps) {
  return (
    <OptimizedImageV2
      {...props}
      priority // Always priority for hero images
      sizes="100vw" // Full viewport width
      quality={90} // Higher quality for hero images
    />
  )
}

/**
 * Avatar Image Component - Optimized for profile pictures
 *
 * @example
 * <AvatarImage
 *   src="/avatar.jpg"
 *   alt="User avatar"
 *   width={64}
 *   height={64}
 * />
 */
export function AvatarImage({
  className = 'rounded-full object-cover',
  ...props
}: OptimizedImageProps) {
  return (
    <OptimizedImageV2
      {...props}
      className={className}
      sizes="64px" // Fixed size for avatars
    />
  )
}

/**
 * Thumbnail Image Component - Optimized for grid/list views
 *
 * @example
 * <ThumbnailImage
 *   src="/thumbnail.jpg"
 *   alt="Project thumbnail"
 *   width={300}
 *   height={200}
 * />
 */
export function ThumbnailImage(props: OptimizedImageProps) {
  return (
    <OptimizedImageV2
      {...props}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      quality={75} // Lower quality acceptable for thumbnails
    />
  )
}

/**
 * Responsive Background Image Component
 *
 * @example
 * <BackgroundImage
 *   src="/background.jpg"
 *   alt="Page background"
 *   fill
 * />
 */
export function BackgroundImage({
  className = 'object-cover',
  ...props
}: Omit<OptimizedImageProps, 'width' | 'height'>) {
  return (
    <OptimizedImageV2
      {...props}
      fill
      className={className}
      sizes="100vw"
    />
  )
}

/**
 * Product/Content Image Component - Optimized for content sections
 *
 * @example
 * <ContentImage
 *   src="/product.jpg"
 *   alt="Product showcase"
 *   width={800}
 *   height={600}
 * />
 */
export function ContentImage(props: OptimizedImageProps) {
  return (
    <OptimizedImageV2
      {...props}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 50vw"
    />
  )
}

// Export default for backward compatibility
export default OptimizedImageV2
