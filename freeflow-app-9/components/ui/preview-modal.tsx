"use client"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Download } from 'lucide-react'
import { downloadFromUrlOrData } from '@/lib/client/download'
import Image from 'next/image'
import { useState } from 'react'

// Blur placeholder for preview images
const PREVIEW_BLUR_PLACEHOLDER =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAME/8QAIhAAAgEDAwUBAAAAAAAAAAAAAQIDBBEhABIxBQYTQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAgP/xAAYEQEBAQEBAAAAAAAAAAAAAAABAgADEf/aAAwDAQACEQMRAD8AyRU9NL06aKjqzBUxNulkZQWBJYEA+xYfPmtaKpqa6ljqqaZopozlHXkHTWk0w5JOp//Z"

type Props = {
  open: boolean
  title: string
  description?: string
  src?: string
  fallbackData?: string
  onOpenChange: (open: boolean) => void
  downloadName?: string
}

export default function PreviewModal({ open, title, description, src, fallbackData, onOpenChange, downloadName }: Props) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Reset state when modal opens/closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setIsLoading(true)
      setHasError(false)
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="w-full aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center relative">
          {src && !hasError ? (
            <>
              {/* Loading skeleton */}
              {isLoading && (
                <div className="absolute inset-0 bg-muted animate-pulse" />
              )}
              <Image
                src={src}
                alt={title}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className={`object-contain transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                placeholder="blur"
                blurDataURL={PREVIEW_BLUR_PLACEHOLDER}
                priority
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false)
                  setHasError(true)
                }}
              />
            </>
          ) : (
            <div className="text-sm text-gray-500">
              {hasError ? 'Failed to load preview' : 'No preview available'}
            </div>
          )}
        </div>
        <DialogFooter>
          <button
            onClick={() => downloadFromUrlOrData({ url: src, filename: downloadName || 'download', dataText: fallbackData })}
            className="inline-flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-muted transition-colors"
          >
            <Download className="w-4 h-4" /> Download
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


