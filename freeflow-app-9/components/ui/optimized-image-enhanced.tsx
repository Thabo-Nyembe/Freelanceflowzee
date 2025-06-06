'use client'

import React, { useState, useEffect, useRef, memo } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

// Enhanced Optimized Image Component for Phase 9
interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  sizes?: string
  fill?: boolean
  loading?: 'lazy' | 'eager'
  onLoad?: () => void
  onError?: () => void
  style?: React.CSSProperties
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  objectPosition?: string
  fallbackSrc?: string
  enableWebP?: boolean
  enableAVIF?: boolean
  responsive?: boolean
  lazyRoot?: string
  threshold?: number
  fadeIn?: boolean
  zoomOnHover?: boolean
  overlay?: boolean
  overlayContent?: React.ReactNode
}

// Performance optimized image component with memoization
const OptimizedImageEnhanced = memo<OptimizedImageProps>(({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 75,
  placeholder = 'blur',
  blurDataURL,
  sizes,
  fill = false,
  loading = 'lazy',
  onLoad,
  onError,
  style,
  objectFit = 'cover',
  objectPosition = 'center',
  fallbackSrc,
  enableWebP = true,
  enableAVIF = true,
  responsive = true,
  lazyRoot,
  threshold = 0.1,
  fadeIn = true,
  zoomOnHover = false,
  overlay = false,
  overlayContent
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(src)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!imgRef.current || priority) {
      setIsInView(true)
      return
    }

    const currentRef = imgRef.current

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observerRef.current?.disconnect()
        }
      },
      {
        threshold: threshold,
        rootMargin: '50px'
      }
    )

    observerRef.current.observe(currentRef)

    return () => {
      observerRef.current?.disconnect()
    }
  }, [priority, threshold])

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  // Handle image error with fallback
  const handleError = () => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc)
      setHasError(false)
    } else {
      setHasError(true)
    }
    onError?.()
  }

  // Generate responsive sizes
  const generateSizes = () => {
    if (sizes) return sizes
    if (!responsive) return undefined
    
    return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
  }

  // Generate optimized image source with format support
  const getOptimizedSrc = (originalSrc: string) => {
    if (originalSrc.startsWith('http')) {
      return originalSrc // External images - rely on CDN optimization
    }

    // For local images, let Next.js handle optimization
    return originalSrc
  }

  // Generate blur placeholder
  const generateBlurDataURL = () => {
    if (blurDataURL) return blurDataURL
    
    // Simple base64 placeholder
    return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
  }

  // Image container styles
  const containerClasses = cn(
    'relative overflow-hidden',
    {
      'group cursor-pointer': zoomOnHover,
      'transition-opacity duration-500 ease-in-out': fadeIn,
      'opacity-0': fadeIn && !isLoaded,
      'opacity-100': fadeIn && isLoaded,
    },
    className
  )

  // Image styles
  const imageStyles: React.CSSProperties = {
    objectFit,
    objectPosition,
    transition: zoomOnHover ? 'transform 0.3s ease-in-out' : undefined,
    transform: zoomOnHover ? 'scale(1)' : undefined,
    ...style
  }

  // Error fallback component
  const ErrorFallback = () => (
    <div className={cn(
      'flex items-center justify-center bg-gray-100 text-gray-400 text-sm',
      fill ? 'absolute inset-0' : '',
      !fill && width && height ? `w-[${width}px] h-[${height}px]` : 'min-h-[200px]'
    )}>
      <div className="text-center">
        <svg className="mx-auto h-12 w-12 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p>Image failed to load</p>
      </div>
    </div>
  )

  // Loading placeholder
  const LoadingPlaceholder = () => (
    <div className={cn(
      'animate-pulse bg-gray-200',
      fill ? 'absolute inset-0' : '',
      !fill && width && height ? `w-[${width}px] h-[${height}px]` : 'min-h-[200px]'
    )} />
  )

  return (
    <div ref={imgRef} className={containerClasses}>
      {hasError ? (
        <ErrorFallback />
      ) : !isInView && !priority ? (
        <LoadingPlaceholder />
      ) : (
        <>
          <Image
            src={getOptimizedSrc(currentSrc)}
            alt={alt}
            width={fill ? undefined : width}
            height={fill ? undefined : height}
            fill={fill}
            priority={priority}
            quality={quality}
            placeholder={placeholder}
            blurDataURL={generateBlurDataURL()}
            sizes={generateSizes()}
            loading={loading}
            onLoad={handleLoad}
            onError={handleError}
            style={imageStyles}
            className={cn(
              'transition-all duration-300',
              {
                'group-hover:scale-110': zoomOnHover,
                'opacity-0': !isLoaded && fadeIn,
                'opacity-100': isLoaded || !fadeIn,
              }
            )}
          />

          {/* Overlay */}
          {overlay && overlayContent && (
            <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              {overlayContent}
            </div>
          )}

          {/* Loading indicator */}
          {!isLoaded && !hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
        </>
      )}
    </div>
  )
})

OptimizedImageEnhanced.displayName = 'OptimizedImageEnhanced'

// Higher-order component for lazy loading images
export const withLazyLoading = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return React.forwardRef<any, P>((props, ref) => {
    const [isVisible, setIsVisible] = useState(false)
    const elementRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observer.disconnect()
          }
        },
        { threshold: 0.1 }
      )

      if (elementRef.current) {
        observer.observe(elementRef.current)
      }

      return () => observer.disconnect()
    }, [])

    return (
      <div ref={elementRef}>
        {isVisible && <Component {...props} ref={ref} />}
      </div>
    )
  })
}

// Picture component for better format support
export const PictureComponent: React.FC<OptimizedImageProps & {
  webpSrc?: string
  avifSrc?: string
}> = ({ webpSrc, avifSrc, src, alt, ...props }) => {
  return (
    <picture>
      {avifSrc && <source srcSet={avifSrc} type="image/avif" />}
      {webpSrc && <source srcSet={webpSrc} type="image/webp" />}
      <OptimizedImageEnhanced src={src} alt={alt} {...props} />
    </picture>
  )
}

// Gallery component with optimized loading
export const ImageGallery: React.FC<{
  images: Array<{
    src: string
    alt: string
    width?: number
    height?: number
  }>
  columns?: number
  gap?: number
  onImageClick?: (index: number) => void
}> = ({ images, columns = 3, gap = 16, onImageClick }) => {
  return (
    <div 
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap}px`
      }}
    >
      {images.map((image, index) => (
        <OptimizedImageEnhanced
          key={index}
          {...image}
          className="w-full h-auto cursor-pointer hover:opacity-80 transition-opacity"
          zoomOnHover
          onClick={() => onImageClick?.(index)}
        />
      ))}
    </div>
  )
}

// Progressive image loading hook
export const useProgressiveImage = (src: string, fallbackSrc?: string) => {
  const [currentSrc, setCurrentSrc] = useState(fallbackSrc || '')
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const img = new window.Image()
    
    img.onload = () => {
      setCurrentSrc(src)
      setIsLoading(false)
    }
    
    img.onerror = () => {
      setHasError(true)
      setIsLoading(false)
      if (fallbackSrc) {
        setCurrentSrc(fallbackSrc)
      }
    }
    
    img.src = src
  }, [src, fallbackSrc])

  return { src: currentSrc, isLoading, hasError }
}

// Performance monitoring for images
export const useImagePerformance = () => {
  const [metrics, setMetrics] = useState<{
    loadTime: number
    renderTime: number
    size: number
  }>()

  const measureImage = (src: string) => {
    const startTime = performance.now()
    const img = new window.Image()
    
    img.onload = () => {
      const loadTime = performance.now() - startTime
      
      // Get image size if available
      fetch(src, { method: 'HEAD' })
        .then(response => {
          const size = parseInt(response.headers.get('content-length') || '0')
          
          setMetrics({
            loadTime,
            renderTime: performance.now() - startTime,
            size
          })
        })
        .catch(() => {
          setMetrics({
            loadTime,
            renderTime: performance.now() - startTime,
            size: 0
          })
        })
    }
    
    img.src = src
  }

  return { metrics, measureImage }
}

export default OptimizedImageEnhanced 