'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Play,
  Pause,
  Download,
  Plus,
  Info,
  Volume2,
  VolumeX,
  Maximize,
  FileVideo,
  FileAudio,
  FileImage,
  Clock,
  Eye,
  Heart,
  Tag
} from 'lucide-react'
import { toast } from 'sonner'

export interface Asset {
  id: string
  name: string
  type: 'video' | 'audio' | 'image'
  url: string
  thumbnail?: string
  duration?: number
  size: number
  format: string
  tags: string[]
  description?: string
  createdAt: string
  dimensions?: {
    width: number
    height: number
  }
}

interface AssetPreviewModalProps {
  asset: Asset | null
  isOpen: boolean
  onClose: () => void
  onAddToProject: (asset: Asset) => void
  onDownload: (asset: Asset) => void
}

export function AssetPreviewModal({ 
  asset, 
  isOpen, 
  onClose, 
  onAddToProject, 
  onDownload 
}: AssetPreviewModalProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [loading, setLoading] = useState(false)

  if (!asset) return null

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDuration = (seconds: number) => {
    if (!seconds) return '0:00'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleAddToProject = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      onAddToProject(asset)
      toast.success(`Added "${asset.name}" to project`)
    } catch (error) {
      toast.error('Failed to add asset to project')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate download
      onDownload(asset)
      toast.success(`Downloading "${asset.name}"`)
    } catch (error) {
      toast.error('Failed to download asset')
    } finally {
      setLoading(false)
    }
  }

  const getAssetIcon = () => {
    switch (asset.type) {
      case 'video':
        return <FileVideo className="w-5 h-5" />
      case 'audio':
        return <FileAudio className="w-5 h-5" />
      case 'image':
        return <FileImage className="w-5 h-5" />
      default:
        return <FileVideo className="w-5 h-5" />
    }
  }

  const renderPreview = () => {
    switch (asset.type) {
      case 'video':
        return (
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <video
              src={asset.url}
              poster={asset.thumbnail}
              className="w-full h-full object-contain"
              muted={isMuted}
              onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            
            {/* Video Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:text-white hover:bg-white/20"
                  onClick={() => {
                    const video = document.querySelector('video')
                    if (video) {
                      if (isPlaying) {
                        video.pause()
                      } else {
                        video.play()
                      }
                    }
                  }}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:text-white hover:bg-white/20"
                  onClick={() => {
                    const video = document.querySelector('video')
                    if (video) {
                      video.muted = !isMuted
                      setIsMuted(!isMuted)
                    }
                  }}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                
                <div className="flex-1">
                  <Progress value={(currentTime / (asset.duration || 1)) * 100} className="h-1" />
                </div>
                
                <span className="text-white text-sm font-mono">
                  {formatDuration(currentTime)} / {formatDuration(asset.duration || 0)}
                </span>
              </div>
            </div>
          </div>
        )
      
      case 'audio':
        return (
          <div className="aspect-video bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
            <div className="text-center text-white">
              <FileAudio className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{asset.name}</h3>
              <p className="text-sm opacity-90">Duration: {formatDuration(asset.duration || 0)}</p>
              
              <div className="mt-6">
                <audio
                  src={asset.url}
                  controls
                  className="w-full max-w-md"
                />
              </div>
            </div>
          </div>
        )
      
      case 'image':
        return (
          <div className="aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
            <img src={asset.url}
              alt={asset.name}
              className="max-w-full max-h-full object-contain"
            loading="lazy" />
          </div>
        )
      
      default:
        return (
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              {getAssetIcon()}
              <p className="mt-2">Preview not available</p>
            </div>
          </div>
        )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getAssetIcon()}
            {asset.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Preview Area */}
          <div className="lg:col-span-2">
            {renderPreview()}
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2 mt-4">
              <Button onClick={handleAddToProject} disabled={loading}>
                <Plus className="w-4 h-4 mr-2" />
                Add to Project
              </Button>
              
              <Button variant="outline" onClick={handleDownload} disabled={loading}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              
              <Button variant="ghost" size="sm">
                <Heart className="w-4 h-4 mr-2" />
                Favorite
              </Button>
              
              <Button variant="ghost" size="sm">
                <Maximize className="w-4 h-4 mr-2" />
                Fullscreen
              </Button>
            </div>
          </div>
          
          {/* Asset Details */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Details
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <Badge variant="secondary">{asset.type.toUpperCase()}</Badge>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Format</span>
                  <span className="font-mono">{asset.format}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Size</span>
                  <span>{formatFileSize(asset.size)}</span>
                </div>
                
                {asset.duration && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(asset.duration)}
                    </span>
                  </div>
                )}
                
                {asset.dimensions && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dimensions</span>
                    <span>{asset.dimensions.width} × {asset.dimensions.height}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{new Date(asset.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            {/* Description */}
            {asset.description && (
              <div>
                <h3 className="font-semibold mb-3">Description</h3>
                <ScrollArea className="h-20">
                  <p className="text-sm text-muted-foreground">
                    {asset.description}
                  </p>
                </ScrollArea>
              </div>
            )}
            
            {/* Tags */}
            {asset.tags.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-1">
                  {asset.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Usage Stats */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Usage
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Views</span>
                  <span>1,234</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Downloads</span>
                  <span>89</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Used in projects</span>
                  <span>12</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AssetPreviewModal