'use client'

import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { ErrorBoundary } from 'react-error-boundary'
import {
  Monitor, Laptop, Download, Upload, Settings, Maximize2, Minimize2,
  Square, X, Minus, Circle, Chrome, Firefox, Safari, Edge,
  Monitor as Windows, Apple, Terminal as Linux, Code, Layout, Palette, Layers,
  Eye, ZoomIn, ZoomOut, RotateCcw, Share2, Save, FileText,
  Folder, Search, Menu, MoreVertical, Grid, List, Calendar,
  Mail, Calculator, Camera, Music, Video, Globe, Terminal,
  Package, Cpu, HardDrive, Wifi, Battery, Volume2, Brightness
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'

const DESKTOP_PRESETS = [
  { id: 'macbook-14', name: 'MacBook Pro 14"', width: 1512, height: 982, os: 'macOS', category: 'laptop' },
  { id: 'macbook-16', name: 'MacBook Pro 16"', width: 1728, height: 1117, os: 'macOS', category: 'laptop' },
  { id: 'imac-24', name: 'iMac 24"', width: 1920, height: 1080, os: 'macOS', category: 'desktop' },
  { id: 'surface-laptop', name: 'Surface Laptop', width: 1536, height: 1024, os: 'Windows', category: 'laptop' },
  { id: 'dell-xps', name: 'Dell XPS 13', width: 1920, height: 1200, os: 'Windows', category: 'laptop' },
  { id: 'thinkpad-x1', name: 'ThinkPad X1', width: 1920, height: 1080, os: 'Linux', category: 'laptop' },
  { id: 'ultrawide', name: 'Ultrawide Monitor', width: 3440, height: 1440, os: 'Windows', category: 'desktop' }
]

const APP_FRAMEWORKS = [
  { id: 'electron', name: 'Electron', icon: Code, description: 'Cross-platform desktop apps with web technologies' },
  { id: 'tauri', name: 'Tauri', icon: Package, description: 'Lightweight, secure desktop applications' },
  { id: 'flutter', name: 'Flutter Desktop', icon: Layers, description: 'Beautiful native desktop apps' },
  { id: 'native', name: 'Native', icon: Cpu, description: 'Platform-specific native applications' },
  { id: 'pwa', name: 'PWA', icon: Globe, description: 'Progressive Web App with desktop features' }
]

const DEMO_APPS = [
  {
    id: 'code-editor',
    name: 'Code Editor',
    icon: Code,
    category: 'Development',
    description: 'VS Code-like interface'
  },
  {
    id: 'file-manager',
    name: 'File Manager',
    icon: Folder,
    category: 'Productivity',
    description: 'Finder/Explorer-like interface'
  },
  {
    id: 'music-player',
    name: 'Music Player',
    icon: Music,
    category: 'Media',
    description: 'Spotify-like desktop app'
  },
  {
    id: 'email-client',
    name: 'Email Client',
    icon: Mail,
    category: 'Communication',
    description: 'Apple Mail-like interface'
  },
  {
    id: 'calculator',
    name: 'Calculator',
    icon: Calculator,
    category: 'Utility',
    description: 'System calculator app'
  },
  {
    id: 'terminal',
    name: 'Terminal',
    icon: Terminal,
    category: 'Development',
    description: 'Command line interface'
  }
]

interface DesktopWindowProps {
  app: string
  os: string
  width: number
  height: number
}

const DesktopWindow = ({ app, os, width, height }: DesktopWindowProps) => {
  const [isMaximized, setIsMaximized] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  const getWindowControls = () => {
    if (os === 'macOS') {
      return (
        <div className="flex items-center gap-2 p-3">
          <button className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-600" onClick={() => { setIsMinimized(true); console.log("🔻 Minimizing window"); }} data-testid="minimize-window-btn" />
          <button className="w-3 h-3 bg-yellow-500 rounded-full hover:bg-yellow-600" onClick={() => { setIsMinimized(!isMinimized); console.log(isMinimized ? "⬆️ Restoring window" : "🔻 Minimizing window"); }} data-testid="toggle-minimize-btn" />
          <button className="w-3 h-3 bg-green-500 rounded-full hover:bg-green-600" onClick={() => { setIsMaximized(!isMaximized); console.log(isMaximized ? "🗗 Restoring window" : "🗖 Maximizing window"); }} data-testid="toggle-maximize-btn" />
        </div>
      )
    } else {
      return (
        <div className="flex items-center gap-1 p-2">
          <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" onClick={() => { setIsMinimized(!isMinimized); console.log(isMinimized ? "⬆️ Restoring window" : "🔻 Minimizing window"); }} data-testid="toggle-minimize-btn">
            <Minus className="w-3 h-3" />
          </button>
          <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" onClick={() => { setIsMaximized(!isMaximized); console.log(isMaximized ? "🗗 Restoring window" : "🗖 Maximizing window"); }} data-testid="toggle-maximize-btn">
            <Square className="w-3 h-3" />
          </button>
          <button className="p-1 hover:bg-red-500 hover:text-white rounded" onClick={() => { setIsMinimized(true); console.log("🔻 Minimizing window"); }} data-testid="minimize-window-btn">
            <X className="w-3 h-3" />
          </button>
        </div>
      )
    }
  }

  const getTitleBar = () => {
    const appInfo = DEMO_APPS.find(a => a.id === app)
    return (
      <div className={`flex items-center justify-between border-b bg-gray-50 dark:bg-gray-800 ${os === 'macOS' ? '' : 'px-4'}`}>
        {os === 'macOS' && getWindowControls()}
        <div className="flex-1 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
          {appInfo?.name || 'Desktop App'}
        </div>
        {os !== 'macOS' && getWindowControls()}
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden" style={{ width, height }}>
      {getTitleBar()}
      <div className="p-6">
        <p className="text-sm text-gray-600 dark:text-gray-400">Desktop application preview</p>
      </div>
    </div>
  )
}

export default function DesktopAppPage() {
  const [selectedApp, setSelectedApp] = React.useState('code-editor')
  const [selectedDevice, setSelectedDevice] = React.useState('macbook-14')
  const [selectedFramework, setSelectedFramework] = React.useState(APP_FRAMEWORKS[0]?.id || 'electron')
  const [zoom, setZoom] = React.useState([75])
  const [showMenuBar, setShowMenuBar] = React.useState(true)
  const [showTaskbar, setShowTaskbar] = React.useState(true)

  const device = DESKTOP_PRESETS.find(d => d.id === selectedDevice) || DESKTOP_PRESETS[0]
  const framework = APP_FRAMEWORKS.find(f => f.id === selectedFramework) || APP_FRAMEWORKS[0]
  const scaleFactor = zoom[0] / 100

  const exportAsImage = () => {
    console.log('📸 Exporting as image...')
  }

  const sharePreview = () => {
    console.log('🔗 Sharing preview...')
  }

  const generateCode = () => {
    console.log('💻 Generating code...')
  }

  return (
    <div>
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-sm font-medium">
              <Monitor className="w-4 h-4" />
              Desktop Application
            </div>
            <h1 className="text-4xl font-bold text-gradient">Desktop App Builder</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Design, preview, and generate native desktop applications for Windows, macOS, and Linux
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Preview Area */}
            <div className="lg:col-span-3">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Laptop className="w-5 h-5 text-primary" />
                    Desktop Preview
                  </h2>
                  <div className="flex gap-2">
                    <button variant="outline" size="sm" onClick={() => { exportAsImage(); console.log("📸 Exporting as image..."); }} data-testid="export-image-btn">
                      <Download className="w-4 h-4" />
                    </button>
                    <button variant="outline" size="sm" onClick={() => { sharePreview(); console.log("🔗 Sharing preview..."); }} data-testid="share-preview-btn">
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button variant="outline" size="sm" onClick={() => { generateCode(); console.log("💻 Generating code..."); }} data-testid="generate-code-btn">
                      <Code className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Desktop Controls */}
                <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
                  <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DESKTOP_PRESETS.map((device) => (
                        <SelectItem key={device.id} value={device.id}>
                          {device.name} ({device.os})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedFramework} onValueChange={setSelectedFramework}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {APP_FRAMEWORKS.map((framework) => (
                        <SelectItem key={framework.id} value={framework.id}>
                          {framework.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-2">
                    <ZoomOut className="w-4 h-4" />
                    <Slider
                      value={zoom}
                      onValueChange={setZoom}
                      max={100}
                      min={30}
                      step={10}
                      className="w-24"
                    />
                    <ZoomIn className="w-4 h-4" />
                    <span className="text-sm text-muted-foreground">{zoom[0]}%</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch checked={showMenuBar} onCheckedChange={setShowMenuBar} />
                    <span className="text-sm">Menu Bar</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch checked={showTaskbar} onCheckedChange={setShowTaskbar} />
                    <span className="text-sm">Taskbar</span>
                  </div>
                </div>

                {/* Desktop Environment */}
                <div className="relative">
                  <div
                    className="relative bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-800 dark:to-gray-900 rounded-lg overflow-hidden shadow-2xl"
                    style={{
                      width: device.width * scaleFactor,
                      height: device.height * scaleFactor,
                      maxWidth: '100%',
                      aspectRatio: device.width + '/' + device.height
                    }}
                  >
                    <div className="absolute inset-0" style={{
                      transform: 'scale(' + (1 / scaleFactor) + ')',
                      transformOrigin: 'center'
                    }}>
                      <DesktopWindow
                        app={selectedApp}
                        os={device.os}
                        width={Math.min(device.width * 0.8, 1000)}
                        height={Math.min(device.height * 0.7, 700)}
                      />
                        </div>
                      </div>
                    </div>

                    {/* Taskbar (Windows/Linux) */}
                    {showTaskbar && device.os !== 'macOS' && (
                      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gray-800 dark:bg-gray-900 flex items-center px-4 z-10">
                        <div className="flex items-center gap-2">
                          {device.os === 'Windows' ? <Windows className="w-5 h-5 text-blue-400" /> : <Linux className="w-5 h-5 text-orange-400" />}
                          <div className="flex gap-1">
                            {DEMO_APPS.slice(0, 4).map((app) => (
                              <button
                                key={app.id}
                                className="p-2 rounded hover:bg-gray-700 text-white"
                                onClick={() => setSelectedApp(app.id)}
                              >
                                <app.icon className="w-4 h-4" />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="ml-auto flex items-center gap-2 text-white text-sm">
                          <Volume2 className="w-4 h-4" />
                          <Wifi className="w-4 h-4" />
                          <span>12:34 PM</span>
                        </div>
                      </div>
                    )}

                    {/* Dock (macOS) */}
                    {showTaskbar && device.os === 'macOS' && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/20 backdrop-blur-md rounded-2xl p-2 z-10">
                        <div className="flex gap-2">
                          {DEMO_APPS.slice(0, 6).map((app) => (
                            <button
                              key={app.id}
                              className="p-2 rounded-xl hover:bg-white/20 transition-all hover:scale-110"
                              onClick={() => setSelectedApp(app.id)}
                            >
                              <app.icon className="w-6 h-6 text-white" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Device Info */}
                  <div className="absolute -bottom-8 left-0 right-0 text-center text-sm text-muted-foreground">
                    {device.name} • {device.width} × {device.height}px • {framework.name} • {zoom[0]}%
                  </div>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* App Selection */}
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Layout className="w-5 h-5 text-primary" />
                  Applications
                </h3>
                <div className="space-y-2">
                  {DEMO_APPS.map((app) => {
                    const Icon = app.icon
                    return (
                      <button
                        key={app.id}
                        onClick={() => setSelectedApp(app.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                          selectedApp === app.id
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-accent/10'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{app.name}</p>
                          <p className="text-xs opacity-70">{app.description}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
