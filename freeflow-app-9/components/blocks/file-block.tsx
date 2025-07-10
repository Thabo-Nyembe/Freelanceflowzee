'use client'

import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  FileIcon,
  Upload,
  Download,
  Trash2,
  File,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileBlockProps {
  id: string
  content: null
  properties: {
    alignment: 'left' | 'center' | 'right'
    url?: string
    name?: string
    size?: number
    type?: string
  }
  onUpdate?: (id: string, updates: Partial<any>) => void
  isSelected?: boolean
}

function getFileIcon(type: string) {
  if (type.startsWith('text/')) return FileText
  if (type.startsWith('image/')) return FileImage
  if (type.startsWith('video/')) return FileVideo
  if (type.startsWith('audio/')) return FileAudio
  if (type.includes('zip') || type.includes('tar') || type.includes('rar')) return FileArchive
  return File
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function FileBlock({
  id: unknown, properties: unknown, onUpdate: unknown, isSelected
}: FileBlockProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    // In a real app, you would upload the file to your storage service here
    // For now, we'll just create a local URL
    const url = URL.createObjectURL(file)
    onUpdate?.(id, {
      properties: {
        ...properties,
        url,
        name: file.name,
        size: file.size,
        type: file.type
      }
    })
  }, [id, properties, onUpdate])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1
  })

  const removeFile = () => {
    onUpdate?.(id, {
      properties: {
        ...properties,
        url: undefined,
        name: undefined,
        size: undefined,
        type: undefined
      }
    })
  }

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
          <FileIcon className="w-8 h-8 text-gray-400" />
          <div className="text-sm text-gray-600">
            {isDragActive ? (
              <p>Drop the file here...</p>
            ) : (
              <p>Drag & drop a file here, or click to select</p>
            )}
          </div>
          <Button variant="outline" size="sm" className="mt-2">
            <Upload className="w-4 h-4 mr-2" />
            Upload File
          </Button>
        </div>
      </div>
    )
  }

  const FileTypeIcon = properties.type ? getFileIcon(properties.type) : File

  return (
    <div className={cn('flex items-center gap-4 p-4 border rounded-lg', {
      'justify-start': properties.alignment === 'left',
      'justify-center': properties.alignment === 'center',
      'justify-end': properties.alignment === 'right'
    })}>
      <FileTypeIcon className="w-8 h-8 text-gray-400 flex-shrink-0" />
      
      <div className="flex-1 min-w-0">
        <Input
          value={properties.name || ''}
          onChange={(e) =>
            onUpdate?.(id, {
              properties: { ...properties, name: e.target.value }
            })
          }
          className="border-none p-0 font-medium"
          placeholder="File name"
        />
        {properties.size && (
          <p className="text-sm text-gray-500">
            {formatFileSize(properties.size)}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => window.open(properties.url, '_blank')}
        >
          <Download className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={removeFile}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
} 