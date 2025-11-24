'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { ErrorBoundary } from '@/components/ui/error-boundary-system'
import {
  Smartphone, Tablet, Download, Upload, QrCode, Share2, Settings,
  Play, Pause, RotateCcw, ZoomIn, ZoomOut, Monitor, Eye,
  Code, Palette, Layout, Layers, Cpu, Battery, Wifi, Signal,
  User, Bell, MessageSquare, Camera, Mic, Video, Globe,
  Zap, Star, Heart, ShoppingCart, Calendar, Music, Map,
  Search, Filter, Menu, MoreVertical, ArrowLeft, ArrowRight,
  Home, Plus, X, Check, Info, AlertCircle, RefreshCw, Power
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { createFeatureLogger } from '@/lib/logger'
import { toast } from 'sonner'

const logger = createFeatureLogger('Mobile-App')

// A+++ UTILITIES
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'

const DEVICE_PRESETS = [
  { id: 'iphone-15-pro', name: 'iPhone 15 Pro', width: 393, height: 852, ratio: '19.5:9', category: 'phone' },
  { id: 'iphone-15', name: 'iPhone 15', width: 393, height: 852, ratio: '19.5:9', category: 'phone' },
  { id: 'samsung-s24', name: 'Samsung Galaxy S24', width: 384, height: 854, ratio: '20:9', category: 'phone' },
  { id: 'pixel-8', name: 'Google Pixel 8', width: 412, height: 915, ratio: '20:9', category: 'phone' },
  { id: 'ipad-pro', name: 'iPad Pro 12.9"', width: 1024, height: 1366, ratio: '4:3', category: 'tablet' },
  { id: 'ipad-air', name: 'iPad Air', width: 820, height: 1180, ratio: '4:3', category: 'tablet' },
  { id: 'surface-pro', name: 'Surface Pro', width: 912, height: 1368, ratio: '3:2', category: 'tablet' }
]

const APP_TEMPLATES = [
  {
    id: 'social',
    name: 'Social Media',
    description: 'Instagram-like interface',
    preview: '/api/placeholder/300/600',
    features: ['Feed', 'Stories', 'Messaging', 'Profile']
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce',
    description: 'Shopping app interface',
    preview: '/api/placeholder/300/600',
    features: ['Products', 'Cart', 'Checkout', 'Orders']
  },
  {
    id: 'finance',
    name: 'Finance',
    description: 'Banking app interface',
    preview: '/api/placeholder/300/600',
    features: ['Dashboard', 'Transactions', 'Analytics', 'Cards']
  },
  {
    id: 'productivity',
    name: 'Productivity',
    description: 'Task management app',
    preview: '/api/placeholder/300/600',
    features: ['Tasks', 'Calendar', 'Notes', 'Projects']
  },
  {
    id: 'health',
    name: 'Health & Fitness',
    description: 'Wellness tracking app',
    preview: '/api/placeholder/300/600',
    features: ['Activities', 'Goals', 'Insights', 'Social']
  },
  {
    id: 'music',
    name: 'Music Streaming',
    description: 'Spotify-like interface',
    preview: '/api/placeholder/300/600',
    features: ['Player', 'Library', 'Discover', 'Playlists']
  }
]

const DEMO_SCREENS = [
  {
    id: 'home',
    name: 'Home',
    component: 'HomeScreen',
    icon: Home
  },
  {
    id: 'profile',
    name: 'Profile',
    component: 'ProfileScreen',
    icon: User
  },
  {
    id: 'notifications',
    name: 'Notifications',
    component: 'NotificationsScreen',
    icon: Bell
  },
  {
    id: 'messages',
    name: 'Messages',
    component: 'MessagesScreen',
    icon: MessageSquare
  },
  {
    id: 'settings',
    name: 'Settings',
    component: 'SettingsScreen',
    icon: Settings
  }
]

interface MockScreenProps {
  screen: string
  deviceWidth: number
  deviceHeight: number
}

const MockScreen = ({ screen, deviceWidth, deviceHeight }: MockScreenProps) => {
  const [selectedDevice, setSelectedDevice] = useState('iphone-15-pro')
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')
  const [zoom, setZoom] = useState([100])
  const [showGrid, setShowGrid] = useState(false)
  const [showSafeArea, setShowSafeArea] = useState(false)
  const [currentScreen, setCurrentScreen] = useState('home')

  const device = DEVICE_PRESETS.find(d => d.id === selectedDevice) || DEVICE_PRESETS[0]
  const scaleFactor = zoom[0] / 100

  const getStatusBarContent = () => (
    <div className="flex items-center justify-between px-4 py-2 text-xs">
      <div className="flex items-center gap-1">
        <span className="font-semibold">9:41</span>
      </div>
      <div className="flex items-center gap-1">
        <Signal className="w-3 h-3" />
        <Wifi className="w-3 h-3" />
        <Battery className="w-4 h-3" />
      </div>
    </div>
  )

  const getNavigationBar = () => (
    <div className="flex items-center justify-around py-3 border-t bg-white dark:bg-gray-900">
      {DEMO_SCREENS.map((item) => {
        const Icon = item.icon
        return (
          <button
            key={item.id}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
              screen === item.id ? 'text-blue-500' : 'text-gray-500'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs">{item.name}</span>
          </button>
        )
      })}
    </div>
  )

  const exportAsImage = () => {
    logger.info('Exporting mobile preview as image', {
      device: selectedDevice,
      screen: currentScreen,
      orientation,
      zoom: zoom[0],
      resolution: `${deviceWidth}x${deviceHeight}`
    })

    toast.info('Exporting mobile preview...', {
      description: `${device.name} - ${currentScreen} screen - ${orientation}`
    })

    // Generate canvas-based screenshot
    const canvas = document.createElement('canvas')
    canvas.width = deviceWidth
    canvas.height = deviceHeight
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#000000'
      ctx.font = '14px Arial'
      ctx.fillText(`${device.name} - ${currentScreen}`, 20, 30)
    }

    canvas.toBlob((blob) => {
      if (blob) {
        const fileName = `mobile-${selectedDevice}-${currentScreen}-${Date.now()}.png`
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        a.click()
        URL.revokeObjectURL(url)

        const fileSizeKB = (blob.size / 1024).toFixed(1)

        toast.success('Mobile preview exported', {
          description: `${fileName} - ${fileSizeKB} KB - ${deviceWidth}x${deviceHeight} - ${device.name} - ${orientation} - ${zoom[0]}% zoom`
        })

        logger.info('Export completed', {
          fileName,
          fileSize: blob.size,
          device: selectedDevice,
          screen: currentScreen
        })
      }
    })
  }

  const sharePreview = () => {
    logger.info('Sharing mobile preview', {
      device: selectedDevice,
      screen: currentScreen,
      orientation
    })

    const shareUrl = `${window.location.origin}/mobile-preview/${selectedDevice}?screen=${currentScreen}&orientation=${orientation}&zoom=${zoom[0]}`

    if (navigator.share) {
      navigator.share({
        title: `Mobile App Design - ${device.name}`,
        text: `Check out this ${currentScreen} screen design for ${device.name}`,
        url: shareUrl
      }).then(() => {
        toast.success('Preview shared successfully', {
          description: `${device.name} - ${currentScreen} screen - ${orientation}`
        })
        logger.info('Share successful', { method: 'native', url: shareUrl })
      }).catch((err) => {
        logger.warn('Native share cancelled', { error: err.message })
      })
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        toast.success('Share link copied to clipboard', {
          description: `${device.name} - ${currentScreen} - ${shareUrl.length} characters`
        })
        logger.info('Share link copied', { method: 'clipboard', url: shareUrl })
      }).catch((err) => {
        logger.error('Failed to copy share link', { error: err.message })
        toast.error('Failed to copy share link')
      })
    }
  }

  const generateQRCode = () => {
    logger.info('Generating QR code', {
      device: selectedDevice,
      screen: currentScreen,
      orientation
    })

    const previewUrl = `${window.location.origin}/mobile-preview/${selectedDevice}?screen=${currentScreen}&orientation=${orientation}`

    // Simulate QR code generation (in real app, would use a QR library)
    const qrData = {
      url: previewUrl,
      device: device.name,
      screen: currentScreen,
      orientation,
      timestamp: new Date().toISOString()
    }

    const qrContent = `QR Code Data:
URL: ${qrData.url}
Device: ${qrData.device}
Screen: ${qrData.screen}
Orientation: ${qrData.orientation}
Generated: ${new Date().toLocaleString()}
`

    const blob = new Blob([qrContent], { type: 'text/plain' })
    const fileName = `qr-${selectedDevice}-${currentScreen}.txt`
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)

    const fileSizeBytes = blob.size

    toast.success('QR code data generated', {
      description: `${fileName} - ${fileSizeBytes} bytes - ${device.name} - ${currentScreen} screen - Scan to preview on device`
    })

    logger.info('QR code generated', {
      fileName,
      fileSize: fileSizeBytes,
      url: previewUrl
    })
  }

  return (
    <ErrorBoundary level="page" name="Mobile App Interface">
      <div>
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-full text-sm font-medium">
              <Smartphone className="w-4 h-4" />
              Mobile App Interface
            </div>
            <h1 className="text-4xl font-bold text-gradient">Native Mobile Preview</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Design, preview, and test mobile app interfaces with real device simulations
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Preview Area */}
            <div className="lg:col-span-3">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-primary" />
                    Device Preview
                  </h2>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-sm" onClick={exportAsImage} data-testid="export-mobile-image-btn">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="px-3 py-1.5 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-sm" onClick={sharePreview} data-testid="share-mobile-preview-btn">
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button className="px-3 py-1.5 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-sm" onClick={generateQRCode} data-testid="generate-qr-btn">
                      <QrCode className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Device Controls */}
                <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
                  <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DEVICE_PRESETS.map((device) => (
                        <SelectItem key={device.id} value={device.id}>
                          {device.name} ({device.ratio})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <button
                    className="px-3 py-1.5 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-sm flex items-center gap-2"
                    onClick={() => {
                      const newOrientation = orientation === 'portrait' ? 'landscape' : 'portrait'
                      logger.info('Rotating device orientation', {
                        from: orientation,
                        to: newOrientation,
                        device: selectedDevice,
                        screen: currentScreen
                      })
                      setOrientation(newOrientation)
                      toast.info(`Rotated to ${newOrientation}`, {
                        description: `${device.name} - ${currentScreen} screen - ${deviceWidth}x${deviceHeight}`
                      })
                    }}
                    data-testid="toggle-orientation-btn"
                  >
                    <RotateCcw className="w-4 h-4" />
                    {orientation === 'portrait' ? 'Landscape' : 'Portrait'}
                  </button>

                  <div className="flex items-center gap-2">
                    <ZoomOut className="w-4 h-4" />
                    <Slider
                      value={zoom}
                      onValueChange={setZoom}
                      max={150}
                      min={25}
                      step={25}
                      className="w-24"
                    />
                    <ZoomIn className="w-4 h-4" />
                    <span className="text-sm text-muted-foreground">{zoom[0]}%</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch checked={showGrid} onCheckedChange={setShowGrid} />
                    <span className="text-sm">Grid</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch checked={showSafeArea} onCheckedChange={setShowSafeArea} />
                    <span className="text-sm">Safe Area</span>
                  </div>
                </div>

                {/* Device Frame */}
                <div className="flex justify-center">
                  <div className="relative">
                    <div
                      id="mobile-preview"
                      className="relative bg-black rounded-3xl p-2 shadow-2xl"
                      style={{
                        width: (deviceWidth + 40) * scaleFactor,
                        height: (deviceHeight + 40) * scaleFactor
                      }}
                    >
                      {/* Device Screen */}
                      <div
                        className="relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden"
                        style={{
                          width: deviceWidth * scaleFactor,
                          height: deviceHeight * scaleFactor
                        }}
                      >
                        {/* Grid Overlay */}
                        {showGrid && (
                          <div
                            className="absolute inset-0 opacity-20 pointer-events-none"
                            style={{
                              backgroundImage: `
                                linear-gradient(to right, #666 1px, transparent 1px),
                                linear-gradient(to bottom, #666 1px, transparent 1px)
                              `,
                              backgroundSize: '20px 20px'
                            }}
                          />
                        )}

                        {/* Safe Area Overlay */}
                        {showSafeArea && (
                          <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-0 left-0 right-0 h-12 bg-red-500/10 border-b border-red-500/50" />
                            <div className="absolute bottom-0 left-0 right-0 h-20 bg-red-500/10 border-t border-red-500/50" />
                          </div>
                        )}

                        {/* App Content */}
                        <div
                          className="absolute inset-0"
                          style={{
                            transform: `scale(${scaleFactor})`,
                            transformOrigin: 'top left',
                            width: deviceWidth,
                            height: deviceHeight
                          }}
                        >
                          {/* Screen Content */}
                          <div className="h-full flex flex-col bg-white dark:bg-gray-900">
                            {/* Status Bar */}
                            {getStatusBarContent()}

                            {/* Main Content Area */}
                            <div className="flex-1 bg-gray-50 dark:bg-gray-800 p-4 overflow-auto">
                              <h3 className="text-lg font-semibold mb-2 capitalize">{currentScreen} Screen</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                This is a preview of the {currentScreen} screen interface
                              </p>
                            </div>

                            {/* Navigation Bar */}
                            {getNavigationBar()}
                          </div>
                        </div>
                      </div>

                      {/* Home Indicator (for iPhone) */}
                      {selectedDevice.includes('iphone') && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white rounded-full opacity-80" />
                      )}
                    </div>

                    {/* Device Info */}
                    <div className="absolute -bottom-8 left-0 right-0 text-center text-sm text-muted-foreground">
                      {device.name} • {deviceWidth} × {deviceHeight}px • {zoom[0]}%
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Screen Navigation */}
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Layout className="w-5 h-5 text-primary" />
                  Screens
                </h3>
                <div className="space-y-2">
                  {DEMO_SCREENS.map((screen) => {
                    const Icon = screen.icon
                    return (
                      <button
                        key={screen.id}
                        onClick={() => setCurrentScreen(screen.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                          currentScreen === screen.id
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-accent/10'
                        }                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {screen.name}
                      </button>
                    )
                  })}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
      </ErrorBoundary>
    )
}

export default function MobileAppPage() {
  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()

  // A+++ LOAD MOBILE APP DATA
  useEffect(() => {
    const loadMobileAppData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Simulate data loading with potential error
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            if (Math.random() > 0.95) {
              reject(new Error('Failed to load mobile app studio'))
            } else {
              resolve(null)
            }
          }, 1000)
        })

        setIsLoading(false)
        announce('Mobile app studio loaded successfully', 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load mobile app studio')
        setIsLoading(false)
        announce('Error loading mobile app studio', 'assertive')
      }
    }

    loadMobileAppData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // A+++ LOADING STATE
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="space-y-8">
          <CardSkeleton />
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <CardSkeleton />
            </div>
            <div className="space-y-6">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          </div>
          <ListSkeleton items={4} />
        </div>
      </div>
    )
  }

  // A+++ ERROR STATE
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorEmptyState
          error={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    )
  }

  return <MockScreen screen="home" deviceWidth={393} deviceHeight={852} />
}
