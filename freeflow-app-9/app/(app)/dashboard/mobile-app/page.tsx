'use client'

import { useState, useRef, useCallback } from 'react'
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
            }
                <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${notif.unread ? 'bg-blue-50 dark:bg-blue-950' : 'bg-gray-50 dark:bg-gray-800'}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${notif.unread ? 'bg-blue-500' : 'bg-gray-300'}
        text: `Check out this ${template.name} mobile app design`,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const generateQRCode = () => {
    // Implementation for QR code generation
    console.log('Generating QR code for mobile preview')
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
                    <button className="px-3 py-1.5 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-sm" onClick={() => { exportAsImage(); console.log("📸 Exporting mobile preview as image..."); }} data-testid="export-mobile-image-btn">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="px-3 py-1.5 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-sm" onClick={() => { sharePreview(); console.log("🔗 Sharing mobile preview..."); }} data-testid="share-mobile-preview-btn">
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button className="px-3 py-1.5 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-sm" onClick={() => { generateQRCode(); console.log("📱 Generating QR code..."); }} data-testid="generate-qr-btn">
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
                    onClick={() => { const newOrientation = orientation === 'portrait' ? 'landscape' : 'portrait'; setOrientation(newOrientation); console.log('📱 Rotating to', newOrientation); }} data-testid="toggle-orientation-btn"
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
                          <MockScreen
                            screen={currentScreen}
                            deviceWidth={deviceWidth}
                            deviceHeight={deviceHeight}
                          />
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
                        }