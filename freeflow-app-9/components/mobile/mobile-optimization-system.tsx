'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import {
  Smartphone,
  Monitor,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  Touch,
  Zap,
  Eye,
  Maximize2,
  Minimize2,
  Settings
} from 'lucide-react'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
import { useContext7GUI } from '@/components/ui/enhanced-gui-2025'

interface MobileOptimizationSystemProps {
  children: React.ReactNode
  enableGestures?: boolean
  enableAdaptiveUI?: boolean
  enablePerformanceMode?: boolean
}

export default function MobileOptimizationSystem({
  children,
  enableGestures = true,
  enableAdaptiveUI = true,
  enablePerformanceMode = true
}: MobileOptimizationSystemProps) {
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showMobileToolbar, setShowMobileToolbar] = useState(false)
  const [performanceMode, setPerformanceMode] = useState(enablePerformanceMode)

  const { features, updateFeatures } = useContext7GUI()
  const containerRef = useRef<HTMLDivElement>(null)

  // Touch gesture handling
  const dragX = useMotionValue(0)
  const dragOpacity = useTransform(dragX, [-100, 0, 100], [0.5, 1, 0.5])

  useEffect(() => {
    detectDevice()
    detectOrientation()

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', detectOrientation)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', detectOrientation)
    }
  }, [])

  useEffect(() => {
    if (enableAdaptiveUI) {
      adaptUIForDevice()
    }
  }, [deviceType, orientation, enableAdaptiveUI])

  const detectDevice = () => {
    const width = window.innerWidth
    if (width < 768) {
      setDeviceType('mobile')
    } else if (width < 1024) {
      setDeviceType('tablet')
    } else {
      setDeviceType('desktop')
    }
  }

  const detectOrientation = () => {
    const isLandscape = window.innerWidth > window.innerHeight
    setOrientation(isLandscape ? 'landscape' : 'portrait')
  }

  const handleResize = () => {
    detectDevice()
    detectOrientation()
  }

  const adaptUIForDevice = () => {
    if (deviceType === 'mobile') {
      updateFeatures({
        microInteractions: true,
        spatialMode: false, // Disable for performance on mobile
        compactMode: true,
        gestureNavigation: true
      })
    } else if (deviceType === 'tablet') {
      updateFeatures({
        microInteractions: true,
        spatialMode: true,
        compactMode: false,
        gestureNavigation: true
      })
    } else {
      updateFeatures({
        microInteractions: true,
        spatialMode: true,
        compactMode: false,
        gestureNavigation: false
      })
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const handleSwipeNavigation = (event: any, info: PanInfo) => {
    const { offset, velocity } = info

    // Swipe right (back navigation)
    if (offset.x > 100 && velocity.x > 500) {
      window.history.back()
    }

    // Swipe up (show toolbar)
    if (offset.y < -100 && velocity.y < -500) {
      setShowMobileToolbar(true)
    }

    // Swipe down (hide toolbar)
    if (offset.y > 100 && velocity.y > 500) {
      setShowMobileToolbar(false)
    }
  }

  const getDeviceClasses = () => {
    const baseClasses = 'w-full min-h-screen'

    switch (deviceType) {
      case 'mobile':
        return `${baseClasses} ${orientation === 'portrait' ? 'max-w-sm' : 'max-w-2xl'} mx-auto`
      case 'tablet':
        return `${baseClasses} ${orientation === 'portrait' ? 'max-w-2xl' : 'max-w-4xl'} mx-auto`
      default:
        return baseClasses
    }
  }

  return (
    <div className={getDeviceClasses()}>
      {/* Mobile Toolbar */}
      {deviceType === 'mobile' && (
        <MobileToolbar
          isVisible={showMobileToolbar}
          onToggle={() => setShowMobileToolbar(!showMobileToolbar)}
          performanceMode={performanceMode}
          onPerformanceModeToggle={() => setPerformanceMode(!performanceMode)}
          onFullscreenToggle={toggleFullscreen}
          isFullscreen={isFullscreen}
        />
      )}

      {/* Main Content with Touch Gestures */}
      <motion.div
        ref={containerRef}
        className={`relative ${deviceType === 'mobile' ? 'pb-safe-bottom' : ''}`}
        style={{
          x: enableGestures ? dragX : 0,
          opacity: enableGestures ? dragOpacity : 1
        }}
        drag={enableGestures && deviceType === 'mobile' ? 'x' : false}
        dragConstraints={{ left: -100, right: 100 }}
        dragElastic={0.2}
        onDragEnd={handleSwipeNavigation}
        whileTap={{ scale: 0.995 }}
      >
        {/* Performance Overlay for Mobile */}
        {performanceMode && deviceType === 'mobile' && (
          <PerformanceOverlay />
        )}

        {/* Adaptive Container */}
        <div className={`
          ${deviceType === 'mobile' ? 'px-4 py-2' : deviceType === 'tablet' ? 'px-6 py-4' : 'px-8 py-6'}
          ${orientation === 'landscape' && deviceType === 'mobile' ? 'py-1' : ''}
        `}>
          {children}
        </div>

        {/* Touch Indicators for Gestures */}
        {enableGestures && deviceType !== 'desktop' && (
          <TouchIndicators />
        )}
      </motion.div>

      {/* Mobile Navigation Enhancement */}
      {deviceType === 'mobile' && (
        <MobileNavigationEnhancement />
      )}
    </div>
  )
}

interface MobileToolbarProps {
  isVisible: boolean
  onToggle: () => void
  performanceMode: boolean
  onPerformanceModeToggle: () => void
  onFullscreenToggle: () => void
  isFullscreen: boolean
}

function MobileToolbar({
  isVisible,
  onToggle,
  performanceMode,
  onPerformanceModeToggle,
  onFullscreenToggle,
  isFullscreen
}: MobileToolbarProps) {
  return (
    <>
      {/* Toolbar Toggle Button */}
      <motion.button
        className="fixed top-4 right-4 z-50 w-10 h-10 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
        onClick={onToggle}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isVisible ? <X className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
      </motion.button>

      {/* Toolbar Panel */}
      <motion.div
        initial={{ opacity: 0, y: -100 }}
        animate={{
          opacity: isVisible ? 1 : 0,
          y: isVisible ? 0 : -100
        }}
        className="fixed top-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-sm text-white p-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onPerformanceModeToggle}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                performanceMode ? 'bg-green-600' : 'bg-gray-600'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span className="text-sm">Performance</span>
            </button>

            <button
              onClick={onFullscreenToggle}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-600 hover:bg-gray-500 transition-colors"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
              <span className="text-sm">Fullscreen</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Smartphone className="w-4 h-4" />
            <span>Mobile Mode</span>
          </div>
        </div>
      </motion.div>
    </>
  )
}

function PerformanceOverlay() {
  const [fps, setFps] = useState(60)
  const [memoryUsage, setMemoryUsage] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      // Simple FPS counter
      const start = performance.now()
      requestAnimationFrame(() => {
        const end = performance.now()
        const frameDuration = end - start
        setFps(Math.round(1000 / frameDuration))
      })

      // Memory usage (if available)
      if ('memory' in performance) {
        const memory = (performance as Record<string, unknown>).memory
        setMemoryUsage(Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100))
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed bottom-4 left-4 z-50 bg-black/70 backdrop-blur-sm rounded-lg p-2 text-white text-xs"
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${fps > 30 ? 'bg-green-400' : 'bg-red-400'}`} />
          <span>{fps} FPS</span>
        </div>
        {memoryUsage > 0 && (
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${memoryUsage < 80 ? 'bg-green-400' : 'bg-yellow-400'}`} />
            <span>{memoryUsage}% RAM</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function TouchIndicators() {
  return (
    <div className="fixed bottom-4 right-4 z-40 space-y-2">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white text-xs"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Touch className="w-3 h-3" />
            <span>Swipe right: Back</span>
          </div>
          <div className="flex items-center gap-2">
            <ChevronUp className="w-3 h-3" />
            <span>Swipe up: Toolbar</span>
          </div>
          <div className="flex items-center gap-2">
            <ChevronDown className="w-3 h-3" />
            <span>Swipe down: Hide</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function MobileNavigationEnhancement() {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false)

  return (
    <>
      {/* Bottom Sheet for Mobile Navigation */}
      <Drawer open={isBottomSheetOpen} onOpenChange={setIsBottomSheetOpen}>
        <DrawerTrigger asChild>
          <button className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white shadow-lg">
            <Menu className="w-6 h-6" />
          </button>
        </DrawerTrigger>
        <DrawerContent className="max-h-[80vh]">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Navigation</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: 'Dashboard', icon: <Monitor className="w-5 h-5" />, href: '/dashboard' },
                { name: 'AI Create', icon: <Zap className="w-5 h-5" />, href: '/dashboard/ai-create-v2' },
                { name: 'Projects', icon: <Eye className="w-5 h-5" />, href: '/dashboard/projects-hub-v2' },
                { name: 'Analytics', icon: <Settings className="w-5 h-5" />, href: '/dashboard/analytics-v2' }
              ].map((item) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsBottomSheetOpen(false)}
                >
                  {item.icon}
                  <span className="text-sm font-medium">{item.name}</span>
                </motion.a>
              ))}
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Mobile Safe Area Spacer */}
      <div className="h-safe-bottom" />
    </>
  )
}

// Mobile-first responsive hook
export function useMobileOptimization() {
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')

  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth
      if (width < 768) {
        setDeviceType('mobile')
      } else if (width < 1024) {
        setDeviceType('tablet')
      } else {
        setDeviceType('desktop')
      }
    }

    const detectOrientation = () => {
      const isLandscape = window.innerWidth > window.innerHeight
      setOrientation(isLandscape ? 'landscape' : 'portrait')
    }

    detectDevice()
    detectOrientation()

    window.addEventListener('resize', detectDevice)
    window.addEventListener('orientationchange', detectOrientation)

    return () => {
      window.removeEventListener('resize', detectDevice)
      window.removeEventListener('orientationchange', detectOrientation)
    }
  }, [])

  const isMobile = deviceType === 'mobile'
  const isTablet = deviceType === 'tablet'
  const isDesktop = deviceType === 'desktop'
  const isLandscape = orientation === 'landscape'
  const isPortrait = orientation === 'portrait'

  return {
    deviceType,
    orientation,
    isMobile,
    isTablet,
    isDesktop,
    isLandscape,
    isPortrait,
    // Utility functions
    getResponsiveValue: <T,>(mobile: T, tablet: T, desktop: T): T => {
      if (isMobile) return mobile
      if (isTablet) return tablet
      return desktop
    },
    getOrientationValue: <T,>(portrait: T, landscape: T): T => {
      return isPortrait ? portrait : landscape
    }
  }
}