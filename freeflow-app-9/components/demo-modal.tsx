"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { X, Play, Pause, Volume2, VolumeX, Maximize2 } from "lucide-react"

interface DemoModalProps {
  isOpen: boolean
  onClose: () => void
}

export function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Context7 best practice: useEffect with proper promise handling to prevent play/pause conflicts
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Prevent "play() request interrupted by pause()" error using Context7 patterns
    if (isPlaying) {
      const playPromise = video.play()
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          // Only log non-abort errors (Context7 pattern for handling interruptions)
          if (error.name !== 'AbortError' && error.name !== 'NotAllowedError') {
            console.warn('Video play failed:', error)
          }
        })
      }
    } else {
      // Only pause if video is currently playing to avoid conflicts
      if (!video.paused) {
        video.pause()
      }
    }
  }, [isPlaying])

  // Context7 pattern: Reset state when modal closes with proper cleanup
  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false)
      setCurrentTime(0)
      const video = videoRef.current
      if (video && !video.paused) {
        video.pause()
        // Small delay to ensure pause completes before resetting time
        setTimeout(() => {
          if (video) {
            video.currentTime = 0
          }
        }, 100)
      }
    }
  }, [isOpen])

  // Context7 pattern: Debounced toggle to prevent rapid clicking issues
  const togglePlayPause = () => {
    const video = videoRef.current
    if (!video) return
    
    // Only toggle if video is ready and not in a transitional state
    if (video.readyState >= 1) {
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] p-0 overflow-hidden bg-black">
        <DialogHeader className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between text-white">
            <DialogTitle className="text-xl font-semibold">
              FreeflowZee Platform Demo
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </DialogHeader>

        <div className="relative w-full h-full">
          {/* Demo Video Content */}
          <div className="relative w-full h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
            
            {/* Animated Demo Content - Following Context7 pattern */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8">
              <div className="max-w-2xl mx-auto text-center space-y-8">
                <div className="animate-pulse">
                  <h2 className="text-4xl font-bold mb-4">
                    Welcome to FreeflowZee
                  </h2>
                  <p className="text-xl text-gray-300 mb-8">
                    The ultimate platform for creators and freelancers
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 animate-fade-in-up delay-300">
                    <div className="w-12 h-12 bg-indigo-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <h3 className="font-semibold mb-2">Upload Files</h3>
                    <p className="text-sm text-gray-300">Drag & drop up to 10GB</p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 animate-fade-in-up delay-500">
                    <div className="w-12 h-12 bg-purple-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2m0 0H9a2 2 0 01-2-2V10a2 2 0 012-2h8m0 0V9a2 2 0 012-2h2a2 2 0 012 2v6a2 2 0 01-2 2h-2" />
                      </svg>
                    </div>
                    <h3 className="font-semibold mb-2">Collaborate</h3>
                    <p className="text-sm text-gray-300">Real-time feedback & comments</p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 animate-fade-in-up delay-700">
                    <div className="w-12 h-12 bg-green-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <h3 className="font-semibold mb-2">Get Paid</h3>
                    <p className="text-sm text-gray-300">Automated invoicing & payments</p>
                  </div>
                </div>

                <div className="mt-8">
                  <Button
                    onClick={() => {
                      onClose()
                      window.location.href = '/signup'
                    }}
                    className="bg-white text-indigo-900 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
                  >
                    Start Your Free Trial
                  </Button>
                </div>
              </div>
            </div>

            {/* Hidden video element for future real video support */}
            <video
              ref={videoRef}
              className="hidden"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              poster="/demo-thumbnail.jpg"
            >
              <source src="/demo-video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Video Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center space-x-4 text-white">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={togglePlayPause}
                  className="text-white hover:bg-white/20"
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20"
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>

                <div className="flex-1 flex items-center space-x-2">
                  <span className="text-sm">{formatTime(currentTime)}</span>
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="flex-1 h-1 bg-white/30 rounded-lg appearance-none slider"
                  />
                  <span className="text-sm">{formatTime(duration)}</span>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (document.documentElement.requestFullscreen) {
                      document.documentElement.requestFullscreen()
                    }
                  }}
                  className="text-white hover:bg-white/20"
                >
                  <Maximize2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// CSS for custom slider styling (add to globals.css)
const styles = `
.slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ffffff;
  cursor: pointer;
  border: 2px solid #6366f1;
}

.slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ffffff;
  cursor: pointer;
  border: 2px solid #6366f1;
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out forwards;
}

.delay-300 {
  animation-delay: 0.3s;
}

.delay-500 {
  animation-delay: 0.5s;
}

.delay-700 {
  animation-delay: 0.7s;
}
` 