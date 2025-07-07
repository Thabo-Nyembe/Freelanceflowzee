"use client"

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
  onClick?: () => void
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
            width={width}
            height={height}
            className={cn('transition-transform', imageStyles)}
            priority={priority}
            quality={quality}
            placeholder={placeholder}
            blurDataURL={generateBlurDataURL()}
            sizes={generateSizes()}
            fill={fill}
            loading={loading}
            onLoad={handleLoad}
            onError={handleError}
            style={imageStyles}
            objectFit={objectFit}
            objectPosition={objectPosition}
          />
          {overlay && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              {overlayContent}
            </div>
          )}
        </>
      )}
    </div>
  )
})

OptimizedImageEnhanced.displayName = "OptimizedImageEnhanced"

// Further Enhancements
// 1. <picture> element support for WebP/AVIF
// 2. Advanced error handling and reporting
// 3. Integration with a CMS or data source
// 4. More sophisticated placeholder generation (e.g., dominant color)

// Example of using <picture> element
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

// Example of a Gallery component
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
  const [dominantColors, setDominantColors] = useState<string[]>([])

  useEffect(() => {
    // Simulating dominant color extraction
    const extractedColors = images.map(() => `rgba(${Math.random()*255},${Math.random()*255},${Math.random()*255},0.2)`)
    setDominantColors(extractedColors)
  }, [images])

  return (
    <div className="grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: `${gap}px` }}>
      {images.map((image, index) => (
        <div
          key={index}
          className="gallery-item relative"
          onClick={() => onImageClick?.(index)}
          style={{ backgroundColor: dominantColors[index] }}
        >
          <OptimizedImageEnhanced
            {...image}
            placeholder="blur"
            blurDataURL={dominantColors[index]}
            zoomOnHover
            overlay
            overlayContent={<div className="text-white text-lg p-4">View Image</div>}
          />
        </div>
      ))}
    </div>
  )
}


// A more sophisticated utility for image measurements or analysis
// This is a placeholder for a more complex implementation
export const ImageAnalyzer = {
  getAspectRatio: (width: number, height: number): number => {
    if (height === 0) return 0
    return width / height
  },

  // This would be a much more complex function in a real scenario
  getDominantColor: async (imageUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      // Simulate async operation
      setTimeout(() => {
        // In a real implementation, you would use canvas to get pixel data
        // and find the dominant color.
        const randomColor = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
          Math.random() * 255
        )}, ${Math.floor(Math.random() * 255)}, 0.5)`
        resolve(randomColor)
      }, 50)
    })
  },
}

// Example of a client component using these utilities
const AdvancedImageDisplay: React.FC<{ src: string, alt: string }> = ({ src, alt }) => {
  const [aspectRatio, setAspectRatio] = useState<number | null>(null)
  const [dominantColor, setDominantColor] = useState<string>('')

  useEffect(() => {
    const analyzeImage = async () => {
      // In a real app, you might get dimensions from an API or by loading the image
      const naturalWidth = 1920
      const naturalHeight = 1080
      setAspectRatio(ImageAnalyzer.getAspectRatio(naturalWidth, naturalHeight))
      
      const color = await ImageAnalyzer.getDominantColor(src)
      setDominantColor(color)
    }

    analyzeImage()
  }, [src])

  return (
    <div className="p-4 border rounded-lg shadow-lg" style={{ backgroundColor: dominantColor }}>
      <p className="text-sm text-white mb-2">
        Image Analysis
      </p>
      {aspectRatio && <p className="text-xs text-white">Aspect Ratio: {aspectRatio.toFixed(2)}</p>}
      <OptimizedImageEnhanced
        src={src}
        alt={alt}
        width={800}
        height={450}
        className="rounded-md"
        zoomOnHover
      />
    </div>
  )
}


// Example helper function to dynamically generate image sources
// This might be used to switch between different CDN providers or image services
function buildSrc(
  basePath: string,
  {
    width,
    quality,
    format,
  }: {
    width: number
    quality?: number
    format?: 'webp' | 'avif' | 'jpeg'
  }
): string {
  const params = new URLSearchParams()
  params.set('w', width.toString())
  if (quality) {
    params.set('q', quality.toString())
  }
  if (format) {
    params.set('fm', format)
  }

  return `https://images.example.com/${basePath}?${params.toString()}`
}

function getAssetDimensions(assetId: string) {
  // In a real application, this would fetch dimensions from a database or API
  console.log('Fetching dimensions for', assetId)
  return { width: 1200, height: 800 }
}

const measureImage = (src: string) => {
  return new Promise<{width: number, height: number}>((resolve, reject) => {
    const img = document.createElement('img')
    img.onload = () => resolve({width: img.naturalWidth, height: img.naturalHeight})
    img.onerror = reject
    img.src = src
  })
}

export default OptimizedImageEnhanced 