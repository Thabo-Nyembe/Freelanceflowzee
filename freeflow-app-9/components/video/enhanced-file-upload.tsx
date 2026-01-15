'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Upload, 
  X, 
  CheckCircle, 
  AlertCircle, 
  FileVideo,
  FileAudio,
  FileImage,
  Cloud,
  Folder,
  Link,
  Plus,
  Eye
} from 'lucide-react'
import { toast } from 'sonner'

interface UploadFile extends File {
  id: string
  progress: number
  status: 'uploading' | 'completed' | 'error'
  preview?: string
  error?: string
}

interface EnhancedFileUploadProps {
  acceptedTypes: 'video' | 'audio' | 'image' | 'all'
  onUploadComplete: (files: UploadFile[]) => void
  maxFiles?: number
  maxSize?: number // in MB
}

export function EnhancedFileUpload({ 
  acceptedTypes = 'all',
  onUploadComplete,
  maxFiles = 10,
  maxSize = 100
}: EnhancedFileUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [activeTab, setActiveTab] = useState('upload')

  const getAcceptedFileTypes = () => {
    switch (acceptedTypes) {
      case 'video':
        return { 'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm'] }
      case 'audio':
        return { 'audio/*': ['.mp3', '.wav', '.aac', '.ogg'] }
      case 'image':
        return { 'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'] }
      default:
        return {
          'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
          'audio/*': ['.mp3', '.wav', '.aac', '.ogg'],
          'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp']
        }
    }
  }

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    rejectedFiles.forEach(({ file, errors }) => {
      errors.forEach((error: any) => {
        if (error.code === 'file-too-large') {
          toast.error(`File "${file.name}" is too large. Max size is ${maxSize}MB`)
        } else if (error.code === 'file-invalid-type') {
          toast.error(`File "${file.name}" has an invalid type`)
        }
      })
    })

    // Process accepted files
    const newFiles: UploadFile[] = acceptedFiles.map(file => {
      const id = Math.random().toString(36).substr(2, 9)
      
      // Create preview for images
      let preview: string | undefined
      if (file.type.startsWith('image/')) {
        preview = URL.createObjectURL(file)
      }

      return {
        ...file,
        id,
        progress: 0,
        status: 'uploading' as const,
        preview
      }
    })

    setFiles(prev => [...prev, ...newFiles])
    
    // Simulate upload process
    newFiles.forEach(file => {
      simulateUpload(file.id)
    })
  }, [maxSize])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: getAcceptedFileTypes(),
    maxFiles,
    maxSize: maxSize * 1024 * 1024, // Convert MB to bytes
    multiple: true
  })

  const simulateUpload = async (fileId: string) => {
    const updateProgress = (id: string, progress: number) => {
      setFiles(prev => prev.map(f => 
        f.id === id ? { ...f, progress } : f
      ))
    }

    const setStatus = (id: string, status: UploadFile['status'], error?: string) => {
      setFiles(prev => prev.map(f => 
        f.id === id ? { ...f, status, error } : f
      ))
    }

    try {
      // Simulate progressive upload
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100))
        updateProgress(fileId, i)
      }
      
      setStatus(fileId, 'completed')
      toast.success('File uploaded successfully!')
    } catch (error) {
      setStatus(fileId, 'error', 'Upload failed')
      toast.error('Upload failed')
    }
  }

  const removeFile = (fileId: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId)
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
      return prev.filter(f => f.id !== fileId)
    })
  }

  const retryUpload = (fileId: string) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, status: 'uploading', progress: 0, error: undefined } : f
    ))
    simulateUpload(fileId)
  }

  const getFileIcon = (file: UploadFile) => {
    if (file.type.startsWith('video/')) return <FileVideo className="w-8 h-8" />
    if (file.type.startsWith('audio/')) return <FileAudio className="w-8 h-8" />
    if (file.type.startsWith('image/')) return <FileImage className="w-8 h-8" />
    return <FileVideo className="w-8 h-8" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const completedFiles = files.filter(f => f.status === 'completed')
  const uploadingFiles = files.filter(f => f.status === 'uploading')
  const errorFiles = files.filter(f => f.status === 'error')

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload">Upload Files</TabsTrigger>
          <TabsTrigger value="url">From URL</TabsTrigger>
          <TabsTrigger value="stock">Stock Assets</TabsTrigger>
          <TabsTrigger value="cloud">Cloud Storage</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          {/* Drop Zone */}
          <Card>
            <CardContent className="p-6">
              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                  ${isDragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                  }
                `}
              >
                <input {...getInputProps()} />
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                
                {isDragActive ? (
                  <div>
                    <p className="text-lg font-medium">Drop files here</p>
                    <p className="text-muted-foreground">Release to upload</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg font-medium mb-2">
                      Drag & drop files here, or click to browse
                    </p>
                    <p className="text-muted-foreground mb-4">
                      Supports {acceptedTypes === 'all' ? 'video, audio, and image' : acceptedTypes} files up to {maxSize}MB
                    </p>
                    <Button variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Select Files
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* File List */}
          {files.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Upload Progress</span>
                  <div className="flex gap-2">
                    {completedFiles.length > 0 && (
                      <Badge variant="default">{completedFiles.length} completed</Badge>
                    )}
                    {uploadingFiles.length > 0 && (
                      <Badge variant="secondary">{uploadingFiles.length} uploading</Badge>
                    )}
                    {errorFiles.length > 0 && (
                      <Badge variant="destructive">{errorFiles.length} failed</Badge>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {files.map(file => (
                    <div key={file.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      {/* File Preview/Icon */}
                      <div className="flex-shrink-0">
                        {file.preview ? (
                          <img src={file.preview} 
                            alt={file.name}
                            className="w-12 h-12 object-cover rounded"
                          / loading="lazy">
                        ) : (
                          <div className="w-12 h-12 flex items-center justify-center bg-muted rounded">
                            {getFileIcon(file)}
                          </div>
                        )}
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium truncate">{file.name}</p>
                          <div className="flex items-center gap-2">
                            {file.status === 'completed' && (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            )}
                            {file.status === 'error' && (
                              <AlertCircle className="w-5 h-5 text-red-500" />
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(file.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                          <span>{formatFileSize(file.size)}</span>
                          <span>{file.type}</span>
                        </div>

                        {/* Progress Bar */}
                        {file.status === 'uploading' && (
                          <Progress value={file.progress} className="h-2" />
                        )}
                        
                        {/* Error Message */}
                        {file.status === 'error' && (
                          <div className="flex items-center justify-between">
                            <p className="text-red-500 text-sm">{file.error}</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => retryUpload(file.id)}
                            >
                              Retry
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {completedFiles.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <Button 
                      onClick={() => onUploadComplete(completedFiles)}
                      className="w-full"
                    >
                      Use {completedFiles.length} File{completedFiles.length !== 1 ? 's' : ''}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="url" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="w-5 h-5" />
                Import from URL
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Media URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/video.mp4"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <Button className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                Import from URL
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stock" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stock Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* Mock stock assets */}
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="aspect-video bg-muted rounded-lg relative group">
                    <img src={`https://images.unsplash.com/photo-${1500000000000 + i}?w=400&h=225&fit=crop`}
                      alt={`Stock asset ${i}`}
                      className="w-full h-full object-cover rounded-lg"
                    / loading="lazy">
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <div className="flex gap-2">
                        <Button size="sm" variant="secondary">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cloud" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="w-5 h-5" />
                Cloud Storage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex flex-col">
                  <Cloud className="w-8 h-8 mb-2" />
                  Google Drive
                </Button>
                <Button variant="outline" className="h-20 flex flex-col">
                  <Folder className="w-8 h-8 mb-2" />  
                  Dropbox
                </Button>
                <Button variant="outline" className="h-20 flex flex-col">
                  <Cloud className="w-8 h-8 mb-2" />
                  OneDrive
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default EnhancedFileUpload