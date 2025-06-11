'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare, 
  Pin, 
  Play, 
  Pause, 
  Volume2, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  FileText,
  Code,
  Camera,
  Mic,
  Clock,
  MapPin,
  Palette
} from 'lucide-react'

const mediaTypes = [
  {
    id: 'image',
    title: '📸 Image Feedback',
    description: 'Click anywhere to add pin-based comments',
    features: ['Zoom and rotate controls', 'Visual comment markers', 'Hover previews'],
    component: 'ImagePreview'
  },
  {
    id: 'video', 
    title: '🎥 Video Feedback',
    description: 'Timeline-based commenting at specific timestamps',
    features: ['Play/pause controls', 'Comment markers on timeline', 'Jump to comment functionality'],
    component: 'VideoPreview'
  },
  {
    id: 'audio',
    title: '🎵 Audio Feedback', 
    description: 'Waveform visualization with timestamp comments',
    features: ['Visual waveform display', 'Audio controls', 'Comment markers on timeline'],
    component: 'AudioPreview'
  },
  {
    id: 'pdf',
    title: '📄 Document Feedback',
    description: 'Text selection-based commenting', 
    features: ['Highlighted text comments', 'Inline comment display', 'Zoom controls'],
    component: 'PDFPreview'
  },
  {
    id: 'code',
    title: '💻 Code Feedback',
    description: 'Line-by-line commenting system',
    features: ['Syntax highlighting', 'Line number indicators', 'Comment threads'],
    component: 'CodePreview'
  },
  {
    id: 'screenshot',
    title: '📱 Screenshot Feedback', 
    description: 'Drawing tools and pin-based annotations',
    features: ['Drawing tools (pen, shapes)', 'Multiple annotation layers', 'Visual pin markers'],
    component: 'ScreenshotPreview'
  }
]

// Sample comments for each media type
const sampleComments = {
  image: [
    { id: 1, x: 65, y: 40, content: 'Love this gradient background!', author: 'Sarah', timestamp: '2 min ago' },
    { id: 2, x: 25, y: 70, content: 'The typography here needs more contrast', author: 'Alex', timestamp: '5 min ago' }
  ],
  video: [
    { id: 1, timestamp: 15, content: 'Great transition effect here', author: 'Maria', time: '0:15' },
    { id: 2, timestamp: 45, content: 'Audio levels seem low', author: 'John', time: '0:45' }
  ],
  audio: [
    { id: 1, timestamp: 12, content: 'Perfect intro music', author: 'Lisa', time: '0:12' },
    { id: 2, timestamp: 28, content: 'Consider reducing reverb', author: 'Tom', time: '0:28' }
  ],
  pdf: [
    { id: 1, page: 1, selection: 'Executive Summary', content: 'This section is very clear', author: 'Emma' },
    { id: 2, page: 2, selection: 'Market Analysis', content: 'Add more recent data', author: 'David' }
  ],
  code: [
    { id: 1, line: 15, content: 'Consider using async/await here', author: 'Jake', type: 'suggestion' },
    { id: 2, line: 23, content: 'Missing error handling', author: 'Sophie', type: 'issue' }
  ],
  screenshot: [
    { id: 1, x: 50, y: 30, content: 'Button placement is perfect', author: 'Mike', type: 'annotation' },
    { id: 2, x: 80, y: 60, content: 'Icon needs to be larger', author: 'Anna', type: 'feedback' }
  ]
}

// Image Preview Component
const ImagePreview = () => {
  const [selectedComment, setSelectedComment] = useState<number | null>(null)
  const [zoom, setZoom] = useState(100)
  
  return (
    <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 aspect-video rounded-lg overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-rose-100 via-violet-100 to-blue-100"></div>
      
      {/* Image Controls */}
      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button size="sm" variant="outline" className="bg-white/90">
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="outline" className="bg-white/90">
          <RotateCw className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Pin Comments */}
      {sampleComments.image.map((comment) => (
        <div 
          key={comment.id}
          className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${comment.x}%`, top: `${comment.y}%` }}
          onClick={() => setSelectedComment(selectedComment === comment.id ? null : comment.id)}
        >
          <div className="w-6 h-6 bg-gradient-to-r from-rose-500 to-violet-600 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-lg hover:scale-110 transition-transform">
            {comment.id}
          </div>
          
          {selectedComment === comment.id && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg min-w-64 z-10">
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-rose-100 to-violet-100 rounded-full flex items-center justify-center text-sm font-medium">
                  {comment.author[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">{comment.author}</p>
                  <p className="text-sm text-slate-600 mt-1">{comment.content}</p>
                  <p className="text-xs text-slate-400 mt-1">{comment.timestamp}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
      
      {/* Add Pin Button */}
      <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button size="sm" className="bg-gradient-to-r from-rose-500 to-violet-600 text-white">
          <Pin className="w-4 h-4 mr-2" />
          Add Pin Comment
        </Button>
      </div>
    </div>
  )
}

// Video Preview Component  
const VideoPreview = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(25)
  const duration = 60
  
  return (
    <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 aspect-video rounded-lg overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100"></div>
      
      {/* Play Button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Button 
          size="lg" 
          className="rounded-full bg-white/90 text-slate-800 hover:bg-white"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
        </Button>
      </div>
      
      {/* Video Timeline */}
      <div className="absolute bottom-4 left-4 right-4 bg-black/70 rounded-lg p-3">
        <div className="flex items-center gap-3 text-white text-sm mb-2">
          <span>{Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')}</span>
          <div className="flex-1 relative">
            <div className="h-2 bg-white/20 rounded-full">
              <div 
                className="h-full bg-gradient-to-r from-rose-500 to-violet-600 rounded-full"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              ></div>
            </div>
            
            {/* Comment Markers */}
            {sampleComments.video.map((comment) => (
              <div
                key={comment.id}
                className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-amber-400 rounded-full border-2 border-white cursor-pointer hover:scale-125 transition-transform"
                style={{ left: `${(comment.timestamp / duration) * 100}%` }}
                title={`${comment.author}: ${comment.content}`}
              ></div>
            ))}
          </div>
          <span>{Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}</span>
        </div>
        
        <div className="text-xs text-white/80">
          Comments at: {sampleComments.video.map(c => c.time).join(', ')}
        </div>
      </div>
    </div>
  )
}

// Audio Preview Component
const AudioPreview = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const waveform = [0.2, 0.5, 0.8, 0.3, 0.7, 0.4, 0.9, 0.2, 0.6, 0.1, 0.8, 0.5, 0.7, 0.3, 0.6, 0.4, 0.8, 0.2, 0.5, 0.9]
  
  return (
    <div className="bg-gradient-to-r from-rose-50 to-violet-50 p-6 rounded-lg border border-white/20">
      <div className="flex items-center gap-4 mb-4">
        <Button 
          size="sm" 
          className="rounded-full bg-gradient-to-r from-rose-500 to-violet-600 text-white"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>
        <div className="flex-1">
          <h4 className="font-medium text-slate-800">Brand Audio Track</h4>
          <p className="text-sm text-slate-600">2:34 duration</p>
        </div>
        <Volume2 className="w-5 h-5 text-slate-400" />
      </div>
      
      {/* Waveform */}
      <div className="relative mb-4">
        <div className="flex items-end gap-1 h-16">
          {waveform.map((height, i) => (
            <div
              key={i}
              className="bg-gradient-to-t from-rose-400 to-violet-500 rounded-full flex-1 min-w-0 transition-colors hover:from-rose-500 hover:to-violet-600 cursor-pointer"
              style={{ height: `${height * 100}%` }}
            />
          ))}
        </div>
        
        {/* Comment Markers */}
        {sampleComments.audio.map((comment) => (
          <div
            key={comment.id}
            className="absolute top-0 transform -translate-x-1/2"
            style={{ left: `${(comment.timestamp / 60) * 100}%` }}
          >
            <div className="w-3 h-3 bg-amber-400 rounded-full border-2 border-white mb-1 cursor-pointer hover:scale-125 transition-transform"></div>
            <div className="bg-white/90 rounded px-2 py-1 text-xs text-slate-700 whitespace-nowrap">
              {comment.time}: {comment.content}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex items-center justify-between text-sm text-slate-600">
        <span>0:00</span>
        <div className="flex items-center gap-2">
          <Mic className="w-4 h-4" />
          <span>Audio Comments: {sampleComments.audio.length}</span>
        </div>
        <span>2:34</span>
      </div>
    </div>
  )
}

// PDF Preview Component
const PDFPreview = () => {
  const [selectedText, setSelectedText] = useState<string | null>(null)
  
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-slate-800">Brand Guidelines.pdf</h4>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm text-slate-600 px-2 py-1">100%</span>
          <Button size="sm" variant="outline">
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="space-y-3 text-sm leading-relaxed">
        <div 
          className={`p-2 rounded ${selectedText === 'executive' ? 'bg-yellow-100 border-l-4 border-yellow-400' : 'hover:bg-slate-50'} cursor-pointer`}
          onClick={() => setSelectedText(selectedText === 'executive' ? null : 'executive')}
        >
          <h5 className="font-semibold text-slate-800">Executive Summary</h5>
          <p className="text-slate-600">This brand guideline document outlines the visual identity and messaging framework for our company...</p>
          {selectedText === 'executive' && (
            <div className="mt-2 p-2 bg-white rounded border-l-4 border-blue-400">
              <p className="text-xs text-blue-700 font-medium">Emma commented:</p>
              <p className="text-xs text-slate-600">This section is very clear and well-structured.</p>
            </div>
          )}
        </div>
        
        <div 
          className={`p-2 rounded ${selectedText === 'market' ? 'bg-yellow-100 border-l-4 border-yellow-400' : 'hover:bg-slate-50'} cursor-pointer`}
          onClick={() => setSelectedText(selectedText === 'market' ? null : 'market')}
        >
          <h5 className="font-semibold text-slate-800">Market Analysis</h5>
          <p className="text-slate-600">Our target market consists of small to medium businesses looking for professional branding solutions...</p>
          {selectedText === 'market' && (
            <div className="mt-2 p-2 bg-white rounded border-l-4 border-orange-400">
              <p className="text-xs text-orange-700 font-medium">David commented:</p>
              <p className="text-xs text-slate-600">Consider adding more recent market data from 2024.</p>
            </div>
          )}
        </div>
        
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <FileText className="w-3 h-3" />
          <span>Page 1 of 15 • {sampleComments.pdf.length} comments</span>
        </div>
      </div>
    </div>
  )
}

// Code Preview Component
const CodePreview = () => {
  const [selectedLine, setSelectedLine] = useState<number | null>(null)
  
  const codeLines = [
    'import React, { useState } from "react"',
    'import { Button } from "@/components/ui/button"',
    '',
    'export default function Component() {',
    '  const [isLoading, setIsLoading] = useState(false)',
    '',
    '  const handleSubmit = () => {',
    '    setIsLoading(true)',
    '    // API call logic here',
    '    fetch("/api/submit")',
    '      .then(response => response.json())',
    '      .then(data => {',
    '        console.log(data)',
    '        setIsLoading(false)',
    '      })',
    '  }',
    '',
    '  return (',
    '    <Button onClick={handleSubmit}>',
    '      Submit',
    '    </Button>',
    '  )',
    '}'
  ]
  
  return (
    <div className="bg-slate-900 rounded-lg overflow-hidden">
      <div className="bg-slate-800 px-4 py-2 flex items-center gap-2">
        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        <span className="text-slate-300 text-sm ml-2">component.tsx</span>
      </div>
      
      <div className="p-4 font-mono text-sm">
        {codeLines.map((line, index) => {
          const lineNumber = index + 1
          const hasComment = sampleComments.code.some(c => c.line === lineNumber)
          const comment = sampleComments.code.find(c => c.line === lineNumber)
          
          return (
            <div key={index} className="relative group">
              <div 
                className={`flex items-start hover:bg-slate-800/50 ${hasComment ? 'bg-slate-800/30' : ''} ${selectedLine === lineNumber ? 'bg-blue-900/30' : ''} rounded px-2 py-1 cursor-pointer`}
                onClick={() => setSelectedLine(selectedLine === lineNumber ? null : lineNumber)}
              >
                <span className="text-slate-500 w-8 text-right mr-4 select-none">{lineNumber}</span>
                <div className="flex-1">
                  <code className="text-slate-200">{line || ' '}</code>
                  {hasComment && (
                    <div className="inline-flex items-center ml-2">
                      <div className={`w-2 h-2 rounded-full ${comment?.type === 'issue' ? 'bg-red-400' : 'bg-blue-400'}`}></div>
                      <MessageSquare className="w-3 h-3 text-slate-400 ml-1" />
                    </div>
                  )}
                </div>
              </div>
              
              {selectedLine === lineNumber && comment && (
                <div className="mt-2 ml-12 p-3 bg-slate-800 rounded border-l-4 border-blue-400">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 bg-gradient-to-r from-blue-100 to-violet-100 rounded-full flex items-center justify-center text-xs font-medium">
                      {comment.author[0]}
                    </div>
                    <span className="text-slate-300 text-xs font-medium">{comment.author}</span>
                    <Badge variant="outline" className={`text-xs ${comment.type === 'issue' ? 'text-red-400 border-red-400' : 'text-blue-400 border-blue-400'}`}>
                      {comment.type}
                    </Badge>
                  </div>
                  <p className="text-slate-300 text-xs">{comment.content}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Screenshot Preview Component
const ScreenshotPreview = () => {
  const [selectedAnnotation, setSelectedAnnotation] = useState<number | null>(null)
  
  return (
    <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 aspect-video rounded-lg overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100"></div>
      
      {/* Mock UI Elements */}
      <div className="absolute inset-4 bg-white/90 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded w-32"></div>
          <div className="flex gap-2">
            <div className="w-8 h-8 bg-slate-200 rounded"></div>
            <div className="w-8 h-8 bg-slate-200 rounded"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="h-20 bg-gradient-to-br from-rose-100 to-orange-100 rounded"></div>
          <div className="h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded"></div>
          <div className="h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded"></div>
        </div>
        
        <div className="mt-6 flex justify-center">
          <div className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg">
            Action Button
          </div>
        </div>
      </div>
      
      {/* Drawing Tools */}
      <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button size="sm" variant="outline" className="bg-white/90">
          <Palette className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="outline" className="bg-white/90">
          <Camera className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Annotation Pins */}
      {sampleComments.screenshot.map((comment) => (
        <div 
          key={comment.id}
          className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${comment.x}%`, top: `${comment.y}%` }}
          onClick={() => setSelectedAnnotation(selectedAnnotation === comment.id ? null : comment.id)}
        >
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-lg hover:scale-110 transition-transform ${
            comment.type === 'feedback' ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gradient-to-r from-green-500 to-blue-500'
          }`}>
            <Pin className="w-3 h-3" />
          </div>
          
          {selectedAnnotation === comment.id && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg min-w-52 z-10">
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center text-sm font-medium">
                  {comment.author[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">{comment.author}</p>
                  <p className="text-sm text-slate-600 mt-1">{comment.content}</p>
                  <Badge variant="outline" className={`text-xs mt-1 ${
                    comment.type === 'feedback' ? 'text-orange-600 border-orange-300' : 'text-green-600 border-green-300'
                  }`}>
                    {comment.type}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default function UniversalMediaPreviews() {
  const [selectedMediaType, setSelectedMediaType] = useState('image')
  
  const renderPreview = () => {
    switch (selectedMediaType) {
      case 'image': return <ImagePreview />
      case 'video': return <VideoPreview />
      case 'audio': return <AudioPreview />
      case 'pdf': return <PDFPreview />
      case 'code': return <CodePreview />
      case 'screenshot': return <ScreenshotPreview />
      default: return <ImagePreview />
    }
  }
  
  const selectedMedia = mediaTypes.find(m => m.id === selectedMediaType)
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-extralight text-slate-800 mb-2">
          Universal Pinpoint Feedback
        </h2>
        <p className="text-slate-600 font-light">
          Context-aware commenting across all media types
        </p>
      </div>
      
      {/* Media Type Selector */}
      <div className="flex flex-wrap justify-center gap-2">
        {mediaTypes.map((media) => (
          <Button
            key={media.id}
            variant={selectedMediaType === media.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedMediaType(media.id)}
            className={`transition-all duration-300 ${
              selectedMediaType === media.id
                ? 'bg-gradient-to-r from-rose-500 to-violet-600 text-white border-0'
                : 'bg-white/60 border-white/20 text-slate-600 hover:bg-white hover:text-slate-800'
            }`}
          >
            {media.title.split(' ')[0]} {media.title.split(' ').slice(1).join(' ')}
          </Button>
        ))}
      </div>
      
      {/* Selected Media Preview */}
      <Card className="bg-white/60 backdrop-blur-xl border-white/20 shadow-luxury">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <span>{selectedMedia?.title}</span>
            <Badge variant="outline" className="bg-gradient-to-r from-rose-50 to-violet-50 border-rose-200 text-rose-700">
              Interactive Preview
            </Badge>
          </CardTitle>
          <p className="text-slate-600 font-light">{selectedMedia?.description}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Preview */}
          {renderPreview()}
          
          {/* Features List */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {selectedMedia?.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-slate-600">
                <div className="w-2 h-2 bg-gradient-to-r from-rose-400 to-violet-500 rounded-full"></div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 