'use client'

import React, { useCallback } from 'react'
import { toast } from 'sonner'
import Image from 'next/image'
import { useDropzone } from 'react-dropzone'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ImagePlus, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageBlockProps {
  id: string
  content: null
  properties: {
    alignment: 'left' | 'center' | 'right'
    url?: string
    caption?: string
  }
  onUpdate?: (id: string, updates: Partial<any>) => void
  isSelected?: boolean
}

export function ImageBlock({
  id, properties, onUpdate, isSelected
}: ImageBlockProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    // In a real app, you would upload the file to your storage service here
    // For now, we'll just create a local URL
    const url = URL.createObjectURL(file)
    onUpdate?.(id, {
      properties: { ...properties, url }
    })
  }, [id, properties, onUpdate])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: 1
  })

  if (!properties.url) {
    return (
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 transition-colors text-center cursor-pointer',
          isDragActive ? 'border-primary bg-primary/5' : 'border-gray-200',
          {
            'text-left': properties.alignment === 'left',
            'text-center': properties.alignment === 'center',
            'text-right': properties.alignment === 'right'
          }
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <ImagePlus className="w-8 h-8 text-gray-400" />
          <div className="text-sm text-gray-600">
            {isDragActive ? (
              <p>Drop the image here...</p>
            ) : (
              <p>Drag & drop an image here, or click to select</p>
            )}
          </div>
          <Button variant="outline" size="sm" className="mt-2" onClick={() => toast.info('Upload', { description: 'Click anywhere in the dropzone or drag an image' })}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Image
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', {
      'text-left': properties.alignment === 'left',
      'text-center': properties.alignment === 'center',
      'text-right': properties.alignment === 'right'
    })}>
      <div className="relative aspect-video w-full overflow-hidden rounded-lg">
        <Image src={properties.url}
          alt={properties.caption || 'Uploaded image'}
          fill
          className="object-cover"
         loading="lazy"/>
      </div>
      
      <Input
        value={properties.caption || ''}
        onChange={(e) =>
          onUpdate?.(id, {
            properties: { ...properties, caption: e.target.value }
          })
        }
        className="w-full border-none focus:ring-0 text-sm text-gray-500"
        placeholder="Add a caption..."
      />
    </div>
  )
} 