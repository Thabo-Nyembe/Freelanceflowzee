'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  MessageSquare, Play, Pause, Volume2, RotateCw, ZoomIn, ZoomOut,
  FileText, Code, Camera, Pencil, Square, Circle, Eraser, Heart,
  MessageCircle, Share, Send, Eye, VolumeX, Volume1, ChevronLeft,
  ChevronRight, Download, MoreHorizontal
} from 'lucide-react'

// Sample media files data
const mediaFiles = [
  {
    id: 'img_1',
    type: 'image',
    name: 'Brand Logo Design',
    url: '/placeholder-image.jpg',
    dimensions: { width: 800, height: 600 },
    size: '2.4 MB',
    format: 'JPG'
  },
  {
    id: 'vid_1', 
    type: 'video',
    name: 'Brand Animation',
    url: '/placeholder-video.mp4',
    duration: 45,
    size: '12.8 MB',
    format: 'MP4'
  },
  {
    id: 'audio_1',
    type: 'audio', 
    name: 'Voice Over Recording',
    url: '/placeholder-audio.mp3',
    duration: 120,
    size: '4.2 MB',
    format: 'MP3'
  },
  {
    id: 'doc_1',
    type: 'document',
    name: 'Brand Guidelines',
    url: '/placeholder-doc.pdf',
    pages: 24,
    size: '8.6 MB',
    format: 'PDF'
  },
  {
    id: 'code_1',
    type: 'code',
    name: 'Frontend Components',
    url: '/placeholder-code.tsx',
    lines: 156,
    size: '3.2 KB',
    format: 'TSX'
  },
  {
    id: 'screenshot_1',
    type: 'screenshot',
    name: 'UI Mockup',
    url: '/placeholder-screenshot.jpg',
    dimensions: { width: 1920, height: 1080 },
    size: '1.8 MB',
    format: 'JPG'
  }
]

// Sample comments for each media type
const sampleComments = {
  image: [
    { id: 1, x: 45, y: 30, content: "Love the color scheme! Can we make the logo 15% larger?", author: "Sarah M.", time: "2 min ago", status: "open" },
    { id: 2, x: 70, y: 60, content: "Perfect typography choice", author: "Mike R.", time: "5 min ago", status: "resolved" },
    { id: 3, x: 25, y: 80, content: "Consider adding more contrast here", author: "Emma L.", time: "8 min ago", status: "open" }
  ],
  video: [
    { id: 1, timestamp: 12, content: "Smooth transition! Could use a sound effect here", author: "David K.", time: "3 min ago", status: "open" },
    { id: 2, timestamp: 28, content: "Perfect timing on the logo reveal", author: "Lisa P.", time: "6 min ago", status: "resolved" },
    { id: 3, timestamp: 40, content: "End screen needs 2 more seconds", author: "Tom W.", time: "10 min ago", status: "open" }
  ],
  audio: [
    { id: 1, timestamp: 15, content: "Great voice tone! Maybe speak 10% slower here", author: "Alex B.", time: "4 min ago", status: "open" },
    { id: 2, timestamp: 45, content: "Perfect emphasis on the brand name", author: "Nina S.", time: "7 min ago", status: "resolved" },
    { id: 3, timestamp: 85, content: "Add a slight pause before the call-to-action", author: "Chris M.", time: "12 min ago", status: "open" }
  ],
  document: [
    { id: 1, page: 3, content: "Excellent brand positioning statement", author: "Jordan F.", time: "5 min ago", status: "resolved" },
    { id: 2, page: 8, content: "Color palette section needs hex values", author: "Sam L.", time: "8 min ago", status: "open" },
    { id: 3, page: 15, content: "Typography hierarchy is perfect", author: "Maya K.", time: "15 min ago", status: "resolved" }
  ],
  code: [
    { id: 1, line: 23, content: "Consider using useCallback for better performance", author: "Dev Team", time: "6 min ago", status: "open" },
    { id: 2, line: 45, content: "Great component structure!", author: "Code Review", time: "10 min ago", status: "resolved" },
    { id: 3, line: 78, content: "Add TypeScript interface for props", author: "QA Team", time: "18 min ago", status: "open" }
  ],
  screenshot: [
    { id: 1, x: 60, y: 25, content: "Navigation layout looks clean", author: "UX Team", time: "4 min ago", status: "resolved" },
    { id: 2, x: 40, y: 70, content: "CTA button could be more prominent", author: "Marketing", time: "9 min ago", status: "open" },
    { id: 3, x: 80, y: 50, content: "Sidebar width is perfect", author: "Design Lead", time: "14 min ago", status: "resolved" }
  ]
}

interface CommentPosition {
  x: number
  y: number
}

export default function UniversalMediaPreviewsEnhanced() {
  const [selectedFile, setSelectedFile] = useState(mediaFiles[0])
  const [selectedMediaType, setSelectedMediaType] = useState('image')
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(50)
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [newCommentPosition, setNewCommentPosition] = useState<CommentPosition | null>(null)
  const [showingComments, setShowingComments] = useState(true)

  const handleMediaTypeChange = (type: string) => {
    setSelectedMediaType(type)
    const file = mediaFiles.find(f => f.type === type)
    if (file) setSelectedFile(file)
  }

  const handleImageClick = (e: React.MouseEvent) => {
    if (selectedMediaType === 'image' || selectedMediaType === 'screenshot') {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      setNewCommentPosition({ x, y })
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="w-full">
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-purple-600" />
            Universal Media Previews
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Media Type Tabs */}
          <Tabs value={selectedMediaType} onValueChange={handleMediaTypeChange}>
            <TabsList className="grid w-full grid-cols-6 bg-gray-100">
              <TabsTrigger value="image" className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Images
              </TabsTrigger>
              <TabsTrigger value="video" className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                Video
              </TabsTrigger>
              <TabsTrigger value="audio" className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Audio
              </TabsTrigger>
              <TabsTrigger value="document" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Documents
              </TabsTrigger>
              <TabsTrigger value="code" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Code
              </TabsTrigger>
              <TabsTrigger value="screenshot" className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Screenshots
              </TabsTrigger>
            </TabsList>

            {/* Image Preview */}
            <TabsContent value="image" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{selectedFile.name}</h3>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(50, zoom - 25))}>
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-gray-500">{zoom}%</span>
                    <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(200, zoom + 25))}>
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setRotation((rotation + 90) % 360)}>
                      <RotateCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="relative border rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50" onClick={handleImageClick}>
                  <div 
                    className="aspect-video flex items-center justify-center cursor-crosshair"
                    style={{ transform: `scale(${zoom/100}) rotate(${rotation}deg)` }}
                  >
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                      <div className="text-white text-center">
                        <Camera className="h-16 w-16 mx-auto mb-4 opacity-80" />
                        <p className="text-lg font-medium">Brand Logo Design</p>
                        <p className="text-sm opacity-80">{selectedFile.dimensions?.width} × {selectedFile.dimensions?.height}</p>
                        <p className="text-xs mt-2 opacity-60">Click anywhere to add pin comments</p>
                      </div>
                    </div>
                  </div>

                  {/* Comment Pins */}
                  {showingComments && sampleComments.image.map((comment) => (
                    <div
                      key={comment.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                      style={{ left: `${comment.x}%`, top: `${comment.y}%` }}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold shadow-lg cursor-pointer ${
                        comment.status === 'resolved' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
                      }`}>
                        {comment.id}
                      </div>
                      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white border rounded-lg shadow-lg p-3 w-64 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <div className="flex items-start gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">{comment.author[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm">{comment.content}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-500">{comment.author}</span>
                              <Badge variant={comment.status === 'resolved' ? 'default' : 'secondary'} className="text-xs">
                                {comment.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* New Comment Position */}
                  {newCommentPosition && (
                    <div
                      className="absolute transform -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${newCommentPosition.x}%`, top: `${newCommentPosition.y}%` }}
                    >
                      <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-lg animate-pulse">
                        +
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{selectedFile.format} • {selectedFile.size}</span>
                  <span>•</span>
                  <span>{sampleComments.image.length} comments</span>
                </div>
              </div>
            </TabsContent>

            {/* Video Preview */}
            <TabsContent value="video" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{selectedFile.name}</h3>
                
                <div className="relative border rounded-lg overflow-hidden bg-black">
                  <div className="aspect-video flex items-center justify-center">
                    <div className="w-full h-full bg-gradient-to-br from-red-400 to-orange-600 flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="relative">
                          <Play className="h-20 w-20 mx-auto mb-4 opacity-80" />
                          {!isPlaying && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Button 
                                size="lg" 
                                className="rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                                onClick={() => setIsPlaying(!isPlaying)}
                              >
                                <Play className="h-8 w-8 text-white" />
                              </Button>
                            </div>
                          )}
                        </div>
                        <p className="text-lg font-medium">Brand Animation Video</p>
                        <p className="text-sm opacity-80">{formatTime(selectedFile.duration || 45)} duration</p>
                      </div>
                    </div>
                  </div>

                  {/* Video Controls */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-4">
                    <div className="space-y-2">
                      {/* Timeline with comment markers */}
                      <div className="relative">
                        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-red-500 transition-all duration-300" 
                            style={{ width: `${(currentTime / (selectedFile.duration || 45)) * 100}%` }}
                          />
                        </div>
                        {/* Comment markers on timeline */}
                        {sampleComments.video.map((comment) => (
                          <div
                            key={comment.id}
                            className="absolute top-0 transform -translate-x-1/2 group cursor-pointer"
                            style={{ left: `${(comment.timestamp / (selectedFile.duration || 45)) * 100}%` }}
                            onClick={() => setCurrentTime(comment.timestamp)}
                          >
                            <div className="w-3 h-3 bg-yellow-400 rounded-full border border-white shadow-sm mt-[-2px]" />
                            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-black/90 text-white rounded p-2 text-xs w-48 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="font-medium">{formatTime(comment.timestamp)}</div>
                              <div className="mt-1">{comment.content}</div>
                              <div className="text-gray-300 mt-1">{comment.author}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                            <SkipBack className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-white hover:bg-white/20"
                            onClick={() => setIsPlaying(!isPlaying)}
                          >
                            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                          <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                            <SkipForward className="h-4 w-4" />
                          </Button>
                          <span className="text-sm ml-2">{formatTime(currentTime)} / {formatTime(selectedFile.duration || 45)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Volume2 className="h-4 w-4" />
                          <div className="w-16 h-1 bg-white/20 rounded-full">
                            <div className="h-full bg-white rounded-full" style={{ width: `${volume}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{selectedFile.format} • {selectedFile.size}</span>
                  <span>•</span>
                  <span>{sampleComments.video.length} timestamp comments</span>
                </div>
              </div>
            </TabsContent>

            {/* Audio Preview */}
            <TabsContent value="audio" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{selectedFile.name}</h3>
                
                <div className="border rounded-lg p-6 bg-gradient-to-r from-purple-50 to-pink-50">
                  {/* Waveform Visualization */}
                  <div className="relative mb-4">
                    <div className="flex items-end justify-center h-24 gap-1">
                      {Array.from({ length: 40 }, (_, i) => (
                        <div
                          key={i}
                          className={`w-2 rounded-full transition-all duration-300 ${
                            i <= (currentTime / (selectedFile.duration || 120)) * 40 
                              ? 'bg-purple-500' 
                              : 'bg-gray-300'
                          }`}
                          style={{ height: `${20 + Math.random() * 60}%` }}
                        />
                      ))}
                    </div>

                    {/* Comment markers on waveform */}
                    {sampleComments.audio.map((comment) => (
                      <div
                        key={comment.id}
                        className="absolute bottom-0 transform -translate-x-1/2 group cursor-pointer"
                        style={{ left: `${(comment.timestamp / (selectedFile.duration || 120)) * 100}%` }}
                        onClick={() => setCurrentTime(comment.timestamp)}
                      >
                        <div className="w-4 h-4 bg-orange-400 rounded-full border-2 border-white shadow-sm mb-2" />
                        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/90 text-white rounded p-2 text-xs w-48 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="font-medium">{formatTime(comment.timestamp)}</div>
                          <div className="mt-1">{comment.content}</div>
                          <div className="text-gray-300 mt-1">{comment.author}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Audio Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button 
                        size="lg" 
                        className="rounded-full bg-purple-600 hover:bg-purple-700"
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                      </Button>
                      <div className="text-center">
                        <div className="text-lg font-medium">{formatTime(currentTime)}</div>
                        <div className="text-sm text-gray-500">/ {formatTime(selectedFile.duration || 120)}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        {volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume1 className="h-4 w-4" />}
                      </Button>
                      <div className="w-20 h-1 bg-gray-200 rounded-full">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${volume}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{selectedFile.format} • {selectedFile.size}</span>
                  <span>•</span>
                  <span>{sampleComments.audio.length} audio comments</span>
                </div>
              </div>
            </TabsContent>

            {/* Document Preview */}
            <TabsContent value="document" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{selectedFile.name}</h3>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-gray-500">Page 3 of {selectedFile.pages}</span>
                    <Button variant="outline" size="sm">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="border rounded-lg bg-white">
                  <div className="aspect-[8.5/11] p-8 bg-white text-gray-900">
                    <div className="space-y-6">
                      <div className="text-center border-b pb-4">
                        <h1 className="text-2xl font-bold text-gray-900">Brand Guidelines</h1>
                        <p className="text-gray-600">Version 2.1 • Updated December 2024</p>
                      </div>
                      
                      <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Brand Color Palette</h2>
                        
                        <div className="relative">
                          <p className="text-gray-700 leading-relaxed">
                            Our brand colors have been carefully selected to reflect our company's values
                            and create a consistent visual identity across all platforms. The primary
                            color palette consists of:
                          </p>
                          
                          {/* Highlighted text with comment */}
                          <div className="relative inline-block">
                            <span className="bg-yellow-200 px-1 rounded cursor-pointer group">
                              sophisticated purple gradients
                            </span>
                            <div className="absolute top-6 left-0 bg-white border rounded-lg shadow-lg p-3 w-64 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                              <div className="flex items-start gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs">SL</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <p className="text-sm">Color palette section needs hex values</p>
                                  <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-gray-500">Sam L.</span>
                                    <Badge variant="secondary" className="text-xs">open</Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <span className="text-gray-700"> that convey innovation and trust.</span>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-3 mt-4">
                          <div className="space-y-2">
                            <div className="w-full h-12 bg-purple-600 rounded"></div>
                            <p className="text-xs text-center">Primary</p>
                          </div>
                          <div className="space-y-2">
                            <div className="w-full h-12 bg-pink-500 rounded"></div>
                            <p className="text-xs text-center">Secondary</p>
                          </div>
                          <div className="space-y-2">
                            <div className="w-full h-12 bg-blue-500 rounded"></div>
                            <p className="text-xs text-center">Accent</p>
                          </div>
                          <div className="space-y-2">
                            <div className="w-full h-12 bg-gray-800 rounded"></div>
                            <p className="text-xs text-center">Neutral</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{selectedFile.format} • {selectedFile.size}</span>
                  <span>•</span>
                  <span>{sampleComments.document.length} page comments</span>
                </div>
              </div>
            </TabsContent>

            {/* Code Preview */}
            <TabsContent value="code" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{selectedFile.name}</h3>
                
                <div className="border rounded-lg bg-gray-900 text-gray-100 overflow-hidden">
                  <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                      <span className="text-sm text-gray-300">{selectedFile.name}</span>
                    </div>
                    <span className="text-xs text-gray-400">{selectedFile.format}</span>
                  </div>
                  
                  <div className="p-4 font-mono text-sm">
                    <div className="space-y-1">
                      <div className="flex">
                        <span className="text-gray-500 w-8">1</span>
                        <span className="text-purple-400">import</span>
                        <span className="text-gray-100"> React, &#123; useState &#125; </span>
                        <span className="text-purple-400">from</span>
                        <span className="text-green-400"> 'react'</span>
                      </div>
                      
                      <div className="flex">
                        <span className="text-gray-500 w-8">2</span>
                        <span className="text-purple-400">import</span>
                        <span className="text-gray-100"> &#123; Button &#125; </span>
                        <span className="text-purple-400">from</span>
                        <span className="text-green-400"> '@/components/ui/button'</span>
                      </div>
                      
                      <div className="flex">
                        <span className="text-gray-500 w-8">3</span>
                        <span></span>
                      </div>
                      
                      <div className="flex group relative">
                        <span className="text-gray-500 w-8">23</span>
                        <span className="bg-yellow-900/30 px-1 rounded">
                          <span className="text-purple-400">const</span>
                          <span className="text-blue-400"> handleClick</span>
                          <span className="text-gray-100"> = () {`=>`} {`{`}</span>
                        </span>
                        {/* Comment indicator */}
                        <div className="absolute right-0 top-0 w-3 h-3 bg-orange-500 rounded-full border border-gray-700 group-hover:bg-orange-400 transition-colors"></div>
                        <div className="absolute right-6 top-0 bg-gray-800 border border-gray-600 rounded-lg shadow-lg p-3 w-72 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <div className="flex items-start gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">DT</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="text-sm text-gray-100">Consider using useCallback for better performance</p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-gray-400">Dev Team</span>
                                <Badge variant="secondary" className="text-xs">open</Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex">
                        <span className="text-gray-500 w-8">24</span>
                        <span className="text-gray-100 ml-4">console.log(</span>
                        <span className="text-green-400">'Button clicked!'</span>
                        <span className="text-gray-100">)</span>
                      </div>
                      
                      <div className="flex">
                        <span className="text-gray-500 w-8">25</span>
                        <span className="text-gray-100">{`}`}</span>
                      </div>
                      
                      <div className="flex">
                        <span className="text-gray-500 w-8">26</span>
                        <span></span>
                      </div>
                      
                      <div className="flex group relative">
                        <span className="text-gray-500 w-8">45</span>
                        <span className="bg-green-900/30 px-1 rounded">
                          <span className="text-purple-400">return</span>
                          <span className="text-gray-100"> (</span>
                        </span>
                        <div className="absolute right-0 top-0 w-3 h-3 bg-green-500 rounded-full border border-gray-700"></div>
                        <div className="absolute right-6 top-0 bg-gray-800 border border-gray-600 rounded-lg shadow-lg p-3 w-64 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <div className="flex items-start gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">CR</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="text-sm text-gray-100">Great component structure!</p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-gray-400">Code Review</span>
                                <Badge className="text-xs bg-green-600">resolved</Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex">
                        <span className="text-gray-500 w-8">46</span>
                        <span className="text-gray-100 ml-4">{`<`}</span>
                        <span className="text-red-400">div</span>
                        <span className="text-gray-100"> </span>
                        <span className="text-blue-400">className</span>
                        <span className="text-gray-100">=</span>
                        <span className="text-green-400">"container"</span>
                        <span className="text-gray-100">{`>`}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{selectedFile.format} • {selectedFile.size}</span>
                  <span>•</span>
                  <span>{selectedFile.lines} lines</span>
                  <span>•</span>
                  <span>{sampleComments.code.length} code comments</span>
                </div>
              </div>
            </TabsContent>

            {/* Screenshot Preview */}
            <TabsContent value="screenshot" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{selectedFile.name}</h3>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Pencil className="h-4 w-4" />
                      Annotate
                    </Button>
                    <Button variant="outline" size="sm">
                      <Square className="h-4 w-4" />
                      Rectangle
                    </Button>
                    <Button variant="outline" size="sm">
                      <Circle className="h-4 w-4" />
                      Circle
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eraser className="h-4 w-4" />
                      Eraser
                    </Button>
                  </div>
                </div>
                
                <div className="relative border rounded-lg overflow-hidden bg-white" onClick={handleImageClick}>
                  <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    {/* Mock UI Screenshot */}
                    <div className="w-full h-full bg-white flex flex-col">
                      {/* Header */}
                      <div className="h-16 bg-gradient-to-r from-purple-600 to-pink-600 flex items-center px-6">
                        <div className="text-white font-bold text-lg">FreeflowZee</div>
                        <div className="ml-auto flex gap-4">
                          <div className="w-20 h-8 bg-white/20 rounded"></div>
                          <div className="w-8 h-8 bg-white/20 rounded-full"></div>
                        </div>
                      </div>
                      
                      {/* Sidebar and Content */}
                      <div className="flex-1 flex">
                        <div className="w-64 bg-gray-50 p-4">
                          <div className="space-y-2">
                            <div className="h-8 bg-purple-100 rounded px-3 flex items-center text-sm">Dashboard</div>
                            <div className="h-8 bg-gray-200 rounded px-3 flex items-center text-sm">Projects</div>
                            <div className="h-8 bg-gray-200 rounded px-3 flex items-center text-sm">Team</div>
                          </div>
                        </div>
                        
                        <div className="flex-1 p-6">
                          <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="h-20 bg-blue-100 rounded-lg flex items-center justify-center">
                              <span className="text-sm text-blue-800">Metrics</span>
                            </div>
                            <div className="h-20 bg-green-100 rounded-lg flex items-center justify-center">
                              <span className="text-sm text-green-800">Revenue</span>
                            </div>
                            <div className="h-20 bg-purple-100 rounded-lg flex items-center justify-center relative">
                              <span className="text-sm text-purple-800">Projects</span>
                              {/* Annotation rectangle */}
                              <div className="absolute inset-0 border-2 border-red-500 border-dashed rounded-lg"></div>
                            </div>
                          </div>
                          
                          <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-gray-500">Main Content Area</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comment Pins */}
                  {showingComments && sampleComments.screenshot.map((comment) => (
                    <div
                      key={comment.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                      style={{ left: `${comment.x}%`, top: `${comment.y}%` }}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold shadow-lg cursor-pointer ${
                        comment.status === 'resolved' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
                      }`}>
                        {comment.id}
                      </div>
                      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white border rounded-lg shadow-lg p-3 w-64 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <div className="flex items-start gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">{comment.author.split(' ')[0][0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm">{comment.content}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-500">{comment.author}</span>
                              <Badge variant={comment.status === 'resolved' ? 'default' : 'secondary'} className="text-xs">
                                {comment.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{selectedFile.format} • {selectedFile.size}</span>
                  <span>•</span>
                  <span>{selectedFile.dimensions?.width} × {selectedFile.dimensions?.height}</span>
                  <span>•</span>
                  <span>{sampleComments.screenshot.length} annotations</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Comment Controls */}
          <div className="flex items-center justify-between border-t pt-4">
            <div className="flex items-center gap-2">
              <Button 
                variant={showingComments ? "default" : "outline"} 
                size="sm"
                onClick={() => setShowingComments(!showingComments)}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                {showingComments ? 'Hide Comments' : 'Show Comments'}
              </Button>
              <Button variant="outline" size="sm">
                <Send className="h-4 w-4 mr-2" />
                Add Comment
              </Button>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Total: {sampleComments[selectedMediaType as keyof typeof sampleComments]?.length || 0} comments</span>
              <span>•</span>
              <span>{sampleComments[selectedMediaType as keyof typeof sampleComments]?.filter(c => c.status === 'resolved')?.length || 0} resolved</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}