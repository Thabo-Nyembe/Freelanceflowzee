'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  X, 
  Image, 
  Video, 
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'

interface UploadFile {
  id: string
  file: File
  progress: number
  status: 'uploading' | 'completed' | 'error'
  preview?: string
  type: 'video' | 'image' | 'document'
}

interface FileUploadZoneProps {
  onUploadComplete: (files: UploadFile[]) => void
  maxFiles?: number
  acceptedTypes?: string[]
}

export function FileUploadZone({ 
  onUploadComplete, 
  maxFiles = 5,
  acceptedTypes = ['image/*', 'video/*', '.pdf', '.doc', '.docx']
}: FileUploadZoneProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const [isDragActive, setIsDragActive] = useState(false)

  const getFileType = (file: File): 'video' | 'image' | 'document' => {
    if (file.type.startsWith('video/')) return 'video'
    if (file.type.startsWith('image/')) return 'image'
    return 'document'
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-5 w-5 text-blue-600" />
      case 'image': return <Image className="h-5 w-5 text-green-600" />
      default: return <FileText className="h-5 w-5 text-purple-600" />
    }
  }

  const simulateUpload = (file: UploadFile) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 15
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        setUploadFiles(prev => prev.map(f => 
          f.id === file.id 
            ? { ...f, progress: 100, status: 'completed' as const }
            : f
        ))
      } else {
        setUploadFiles(prev => prev.map(f => 
          f.id === file.id 
            ? { ...f, progress }
            : f
        ))
      }
    }, 200)
  }

  const handleFileInput = (files: FileList | null) => {
    if (!files) return
    
    const fileArray = Array.from(files)
    const newFiles: UploadFile[] = fileArray.map(file => {
      const id = `${Date.now()}_${file.name}`
      const type = getFileType(file)
      
      let preview: string | undefined
      if (type === 'image') {
        preview = URL.createObjectURL(file)
      }

      return {
        id,
        file,
        progress: 0,
        status: 'uploading' as const,
        preview,
        type
      }
    })

    setUploadFiles(prev => [...prev, ...newFiles])
    newFiles.forEach(simulateUpload)
  }

  const removeFile = (id: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== id))
  }

  const completedFiles = uploadFiles.filter(f => f.status === 'completed')

  return (
    <div className="space-y-6">
      <Card className={`border-2 border-dashed transition-colors ${
        isDragActive 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-300 hover:border-gray-400'
      }`}>
        <CardContent className="p-8">
          <div 
            className="text-center cursor-pointer"
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragActive(true)
            }}
            onDragLeave={() => setIsDragActive(false)}
            onDrop={(e) => {
              e.preventDefault()
              setIsDragActive(false)
              handleFileInput(e.dataTransfer.files)
            }}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <input 
              id="file-upload"
              type="file"
              multiple
              accept={acceptedTypes.join(',')}
              onChange={(e) => handleFileInput(e.target.files)}
              className="hidden"
            />
            <Upload className={`mx-auto h-12 w-12 mb-4 ${
              isDragActive ? 'text-blue-500' : 'text-gray-400'
            }`} />
            <h3 className="text-lg font-semibold mb-2">
              {isDragActive ? 'Drop files here' : 'Upload project files'}
            </h3>
            <p className="text-gray-600 mb-4">
              Drag & drop or click to upload videos, images, and documents
            </p>
            <Button variant="outline">
              Choose Files
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Supports: MP4, MOV, JPG, PNG, PDF, DOC (Max {maxFiles} files)
            </p>
          </div>
        </CardContent>
      </Card>

      {uploadFiles.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading Files ({uploadFiles.length})
            </h4>
            
            <div className="space-y-4">
              {uploadFiles.map((file) => (
                <div key={file.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {file.preview ? (
                      <img 
                        src={file.preview} 
                        alt={file.file.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                        {getFileIcon(file.type)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium truncate">
                        {file.file.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {file.type}
                        </Badge>
                        {file.status === 'completed' && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        {file.status === 'error' && (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Progress value={file.progress} className="flex-1" />
                      <span className="text-xs text-gray-500 min-w-0">
                        {Math.round(file.progress)}%
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-1">
                      {(file.file.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {completedFiles.length > 0 && (
              <div className="mt-6 pt-4 border-t">
                <Button 
                  onClick={() => onUploadComplete(completedFiles)}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Add {completedFiles.length} files to project
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
} 