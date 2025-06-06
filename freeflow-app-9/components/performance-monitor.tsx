'use client'

import { useEffect } from 'react'

// Simple performance monitoring
async function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return
  console.log('🚀 Performance monitoring initialized')
}

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = src
  })
}

async function preloadCriticalImages(images: string[]) {
  try {
    await Promise.all(images.map(preloadImage))
    console.log('✅ Critical images preloaded')
  } catch (error) {
    console.warn('⚠️ Failed to preload some images:', error)
  }
}

export function PerformanceMonitor() {
  useEffect(() => {
    // Initialize performance monitoring
    initPerformanceMonitoring()

    // Preload critical images
    const criticalImages = [
      '/avatars/alice.jpg',
      '/avatars/bob.jpg',
      '/avatars/jane.jpg',
      '/avatars/john.jpg',
      '/avatars/mike.jpg',
      '/avatars/client-1.jpg'
    ]

    preloadCriticalImages(criticalImages)

    // Log performance info
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 Performance monitoring initialized')
    }
  }, [])

  return null // This component doesn't render anything
} 