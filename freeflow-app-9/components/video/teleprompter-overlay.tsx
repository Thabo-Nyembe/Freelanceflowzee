"use client"

import React, { useState, useRef, useEffect } from 'react'
import {
  Play,
  Pause,
  RotateCcw,
  Settings,
  X,
  Minimize2,
  Maximize2,
  ChevronUp,
  ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('TeleprompterOverlay')

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface TeleprompterOverlayProps {
  isVisible: boolean
  onClose: () => void
  initialScript?: string
  className?: string
}

// ============================================================================
// TELEPROMPTER OVERLAY COMPONENT
// ============================================================================

export function TeleprompterOverlay({
  isVisible,
  onClose,
  initialScript = '',
  className = ''
}: TeleprompterOverlayProps) {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  const [script, setScript] = useState(initialScript)
  const [isScrolling, setIsScrolling] = useState(false)
  const [scrollSpeed, setScrollSpeed] = useState([30])
  const [fontSize, setFontSize] = useState([24])
  const [isMinimized, setIsMinimized] = useState(false)
  const [position, setPosition] = useState({ x: 20, y: 20 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [showSettings, setShowSettings] = useState(false)
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center')
  const [backgroundColor, setBackgroundColor] = useState('rgba(0, 0, 0, 0.8)')
  const [textColor, setTextColor] = useState('#FFFFFF')
  const [width, setWidth] = useState([60]) // percentage

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  // ============================================================================
  // AUTO-SCROLL LOGIC
  // ============================================================================

  useEffect(() => {
    if (isScrolling && scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const pixelsPerSecond = scrollSpeed[0] * 2 // Convert speed to pixels

      scrollIntervalRef.current = setInterval(() => {
        container.scrollTop += pixelsPerSecond / 60 // 60 FPS

        // Stop at end
        if (container.scrollTop >= container.scrollHeight - container.clientHeight) {
          setIsScrolling(false)
          logger.info('Teleprompter reached end')
        }
      }, 1000 / 60)
    } else {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current)
        scrollIntervalRef.current = null
      }
    }

    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current)
      }
    }
  }, [isScrolling, scrollSpeed])

  // ============================================================================
  // DRAGGING LOGIC
  // ============================================================================

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      logger.debug('Teleprompter drag ended', { position })
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset, position])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleDragStart = (e: React.MouseEvent) => {
    if (!overlayRef.current) return

    const rect = overlayRef.current.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
    setIsDragging(true)

    logger.debug('Teleprompter drag started')
  }

  const toggleScrolling = () => {
    setIsScrolling(!isScrolling)
    logger.info('Teleprompter scrolling toggled', { isScrolling: !isScrolling })
  }

  const resetScroll = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0
      setIsScrolling(false)
      logger.info('Teleprompter reset')
    }
  }

  const handleClose = () => {
    setIsScrolling(false)
    onClose()
    logger.info('Teleprompter closed')
  }

  const adjustFontSize = (delta: number) => {
    setFontSize([Math.max(12, Math.min(48, fontSize[0] + delta))])
  }

  const adjustSpeed = (delta: number) => {
    setScrollSpeed([Math.max(10, Math.min(100, scrollSpeed[0] + delta))])
  }

  if (!isVisible) return null

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      {/* Teleprompter Overlay */}
      <div
        ref={overlayRef}
        className={`fixed z-50 shadow-2xl rounded-lg overflow-hidden ${className}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: isMinimized ? '300px' : `${width[0]}%`,
          maxWidth: isMinimized ? '300px' : '90vw',
          backgroundColor,
          transition: isDragging ? 'none' : 'all 0.3s ease'
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-3 border-b border-gray-700 cursor-move select-none"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
          onMouseDown={handleDragStart}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-white font-medium text-sm">Teleprompter</span>
            {isScrolling && (
              <span className="text-xs text-green-400 animate-pulse">Scrolling...</span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(true)}
              className="h-7 w-7 p-0 text-white hover:bg-white/10"
            >
              <Settings className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-7 w-7 p-0 text-white hover:bg-white/10"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-7 w-7 p-0 text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Script Display */}
            <div
              ref={scrollContainerRef}
              className="overflow-y-auto overflow-x-hidden scrollbar-hide"
              style={{
                height: '400px',
                color: textColor,
                fontSize: `${fontSize[0]}px`,
                textAlign,
                lineHeight: '1.8',
                padding: '40px 30px',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              {script ? (
                <div className="whitespace-pre-wrap">{script}</div>
              ) : (
                <div className="text-center text-gray-400 text-base">
                  Open settings to add your script
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="p-4 border-t border-gray-700" style={{ backgroundColor: 'rgba(0, 0, 0, 0.95)' }}>
              <div className="flex items-center justify-between gap-4">
                {/* Playback Controls */}
                <div className="flex items-center gap-2">
                  <Button
                    variant={isScrolling ? 'default' : 'outline'}
                    size="sm"
                    onClick={toggleScrolling}
                    className={isScrolling ? 'bg-green-600 hover:bg-green-700' : ''}
                  >
                    {isScrolling ? (
                      <>
                        <Pause className="w-4 h-4 mr-1" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-1" />
                        Play
                      </>
                    )}
                  </Button>

                  <Button variant="outline" size="sm" onClick={resetScroll}>
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>

                {/* Speed Control */}
                <div className="flex items-center gap-3 flex-1 max-w-xs">
                  <span className="text-white text-xs whitespace-nowrap">Speed</span>
                  <div className="flex items-center gap-2 flex-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => adjustSpeed(-10)}
                      className="h-7 w-7 p-0 text-white"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                    <Slider
                      value={scrollSpeed}
                      onValueChange={setScrollSpeed}
                      min={10}
                      max={100}
                      step={5}
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => adjustSpeed(10)}
                      className="h-7 w-7 p-0 text-white"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                  </div>
                  <span className="text-white text-xs w-8">{scrollSpeed[0]}</span>
                </div>

                {/* Font Size */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => adjustFontSize(-2)}
                    className="h-7 w-7 p-0 text-white"
                    title="Decrease font size"
                  >
                    <span className="text-lg">A</span>
                  </Button>
                  <span className="text-white text-xs">{fontSize[0]}px</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => adjustFontSize(2)}
                    className="h-7 w-7 p-0 text-white"
                    title="Increase font size"
                  >
                    <span className="text-xl font-bold">A</span>
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Teleprompter Settings</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Script Input */}
            <div>
              <label className="text-sm font-medium mb-2 block">Script</label>
              <Textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder="Enter your teleprompter script here..."
                rows={10}
                className="w-full font-mono"
              />
            </div>

            {/* Appearance */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Text Alignment</label>
                <Select value={textAlign} onValueChange={(value: any) => setTextAlign(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Width (%)</label>
                <div className="flex items-center gap-2">
                  <Slider
                    value={width}
                    onValueChange={setWidth}
                    min={30}
                    max={100}
                    step={5}
                    className="flex-1"
                  />
                  <span className="text-sm w-12">{width[0]}%</span>
                </div>
              </div>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Text Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-12 h-10 rounded border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Background</label>
                <Select value={backgroundColor} onValueChange={setBackgroundColor}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rgba(0, 0, 0, 0.95)">Black (95%)</SelectItem>
                    <SelectItem value="rgba(0, 0, 0, 0.8)">Black (80%)</SelectItem>
                    <SelectItem value="rgba(0, 0, 0, 0.6)">Black (60%)</SelectItem>
                    <SelectItem value="rgba(0, 0, 0, 0.4)">Black (40%)</SelectItem>
                    <SelectItem value="rgba(30, 30, 30, 0.9)">Dark Gray</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Font & Speed Presets */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Font Size</label>
                <Slider
                  value={fontSize}
                  onValueChange={setFontSize}
                  min={12}
                  max={48}
                  step={2}
                  className="flex-1"
                />
                <div className="text-sm text-gray-500 mt-1">{fontSize[0]}px</div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Default Speed</label>
                <Slider
                  value={scrollSpeed}
                  onValueChange={setScrollSpeed}
                  min={10}
                  max={100}
                  step={5}
                  className="flex-1"
                />
                <div className="text-sm text-gray-500 mt-1">{scrollSpeed[0]}</div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Close
            </Button>
            <Button onClick={() => setShowSettings(false)}>
              Apply Settings
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* CSS for hiding scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  )
}
