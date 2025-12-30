"use client"

import React, { useState } from 'react'
import { X, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface DemoModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  videoUrl?: string
}

export function DemoModal({ isOpen, onClose, title, description, videoUrl }: DemoModalProps) {
  const [isPlaying, setIsPlaying] = useState<any>(false)
  const [volume, setVolume] = useState<any>(50)

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const togglePlayback = () => {
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl mx-4 animate-fade-in-up">
        <Card className="bg-white shadow-2xl border-0">
          <CardContent className="p-0">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                <p className="text-gray-600 mt-1">{description}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Demo Content */}
            <div className="aspect-video bg-gray-100 relative overflow-hidden">
              {videoUrl ? (
              <video
                  className="w-full h-full object-cover"
                controls
                  poster="/images/demo-placeholder.jpg"
              >
                  <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              ) : (
                <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 to-purple-50">
                  <div className="text-center">
                    <Play className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Demo Coming Soon</h3>
                    <p className="text-gray-600">
                      Interactive demo for {title} will be available soon.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 border-t">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  This is a preview of the {title} feature in action.
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={onClose}>
                    Close
                  </Button>
                  <Button>
                    Try It Now
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <style jsx>{`
        .slider {
          appearance: none;
          height: 4px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
          outline: none;
        }
        
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
      `}</style>
    </div>
  )
} 