'use client'

import React from 'react'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download, ExternalLink, Maximize2, Minimize2 } from 'lucide-react'

interface MediaFile {
  id: string
  type: 'image' | 'video' | 'audio' | 'document' | 'pdf'
  url: string
  title: string
  description?: string
  thumbnailUrl?: string
  fileSize?: string
  dimensions?: {
    width: number
    height: number
  }
  duration?: string
  metadata?: Record<string, unknown>
}

interface UniversalMediaPreviewProps {
  file: MediaFile
  onDownload?: (file: MediaFile) => void
  onOpenExternal?: (file: MediaFile) => void
}

export default function UniversalMediaPreview({
  file,
  onDownload,
  onOpenExternal,
}: UniversalMediaPreviewProps) {
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<string>('preview')

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const renderPreview = () => {
    switch (file.type) {
      case 'image':
        return (
          <div className="relative w-full aspect-video">
            <Image src={file.url}
              alt={file.title}
              fill
              className="object-contain"
             loading="lazy"/>
          </div>
        )
      case 'video':
        return (
          <video
            src={file.url}
            controls
            className="w-full aspect-video"
            poster={file.thumbnailUrl}
          >
            Your browser does not support the video tag.
          </video>
        )
      case 'audio':
        return (
          <div className="p-4">
            <audio src={file.url} controls className="w-full">
              Your browser does not support the audio tag.
            </audio>
          </div>
        )
      case 'pdf':
        return (
          <iframe
            src={file.url}
            className="w-full aspect-[4/3]"
            title={file.title}
          />
        )
      case 'document':
        return (
          <div className="p-4 text-center">
            <p className="text-muted-foreground">
              Preview not available for this document type.
            </p>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => onOpenExternal?.(file)}
            >
              Open in new window
            </Button>
          </div>
        )
      default:
        return (
          <div className="p-4 text-center text-muted-foreground">
            Preview not available
          </div>
        )
    }
  }

  const renderMetadata = () => {
    return (
      <div className="space-y-4 p-4">
        <div>
          <h3 className="text-sm font-medium">File Information</h3>
          <dl className="mt-2 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Type</dt>
              <dd className="font-medium">{file.type}</dd>
            </div>
            {file.fileSize && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Size</dt>
                <dd className="font-medium">{file.fileSize}</dd>
              </div>
            )}
            {file.dimensions && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Dimensions</dt>
                <dd className="font-medium">
                  {file.dimensions.width} x {file.dimensions.height}
                </dd>
              </div>
            )}
            {file.duration && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Duration</dt>
                <dd className="font-medium">{file.duration}</dd>
              </div>
            )}
          </dl>
        </div>

        {file.metadata && Object.keys(file.metadata).length > 0 && (
          <div>
            <h3 className="text-sm font-medium">Additional Metadata</h3>
            <dl className="mt-2 space-y-2 text-sm">
              {Object.entries(file.metadata).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <dt className="text-muted-foreground">{key}</dt>
                  <dd className="font-medium">{String(value)}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card
      className={`overflow-hidden ${
        isFullscreen
          ? 'fixed inset-0 z-50 m-0 rounded-none'
          : 'w-full max-w-3xl'
      }`}
    >
      <div className="flex items-center justify-between border-b p-4">
        <div>
          <h2 className="text-lg font-semibold">{file.title}</h2>
          {file.description && (
            <p className="text-sm text-muted-foreground">{file.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDownload?.(file)}
            title="Download"
          >
            <Download className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenExternal?.(file)}
            title="Open in new window"
          >
            <ExternalLink className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="h-5 w-5" />
            ) : (
              <Maximize2 className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
          <TabsTrigger
            value="preview"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            Preview
          </TabsTrigger>
          <TabsTrigger
            value="info"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            Information
          </TabsTrigger>
        </TabsList>
        <TabsContent value="preview" className="m-0">
          {renderPreview()}
        </TabsContent>
        <TabsContent value="info" className="m-0">
          {renderMetadata()}
        </TabsContent>
      </Tabs>
    </Card>
  )
} 