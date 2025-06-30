"use client"

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'

interface FileUploadDialogProps {
  isOpen: boolean
  onClose: () => void
  onUploadComplete: (files: Record<string, unknown>[]) => void
}

export function FileUploadDialog({ isOpen, onClose, onUploadComplete }: FileUploadDialogProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<{ [key: string]: number }>({})
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true
  })

  const removeFile = (fileToRemove: File) => {
    setFiles(files.filter(file => file !== fileToRemove))
    const newProgress = { ...progress }
    delete newProgress[fileToRemove.name]
    setProgress(newProgress)
    const newErrors = { ...errors }
    delete newErrors[fileToRemove.name]
    setErrors(newErrors)
  }

  const uploadFiles = async () => {
    setUploading(true)
    const uploadedFiles: Record<string, unknown>[] = []

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      for (const file of files) {
        try {
          setProgress(prev => ({ ...prev, [file.name]: 0 }))

          // Simulate progress
          const progressInterval = setInterval(() => {
            setProgress(prev => {
              const current = prev[file.name] || 0
              if (current < 90) {
                return { ...prev, [file.name]: current + 10 }
              }
              return prev
            })
          }, 100)

          const { data, error } = await supabase.storage
            .from('files')
            .upload(`${user.id}/${file.name}`, file)

          clearInterval(progressInterval)

          if (error) throw error

          // Create file record data
          const fileRecord = {
            id: data.path,
            user_id: user.id,
            name: file.name,
            size: file.size,
            type: file.type,
            path: data.path,
            uploaded_at: new Date().toISOString()
          }

          uploadedFiles.push(fileRecord)
          setProgress(prev => ({ ...prev, [file.name]: 100 }))
        } catch (error: Record<string, unknown>) {
          console.error(`Error uploading ${file.name}:`, error)
          setErrors(prev => ({ ...prev, [file.name]: error.message }))
        }
      }

      onUploadComplete(uploadedFiles)
    } catch (error) {
      console.error('Upload error: ', error)'
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className= "sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
          <DialogDescription>
            Drag and drop files here or click to select files
          </DialogDescription>
        </DialogHeader>

        <div
          {...getRootProps()}
          className={
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
            ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300'}
          `}
        >
          <input {...getInputProps()} />
          <Upload className= "h-10 w-10 text-gray-400 mx-auto mb-4" />
          <p className= "text-sm text-gray-600">
            {isDragActive
              ? "Drop the files here
              : "Drag 'n' drop files here, or click to select files"}
          </p>
        </div>

        {files.length > 0 && (
          <div className= "mt-4 space-y-4">
            {files.map(file => (
              <div key={file.name} className= "flex items-center gap-4">
                <div className= "flex-1 space-y-1">
                  <div className= "flex items-center justify-between">
                    <p className= "text-sm font-medium">{file.name}</p>
                    <Button
                      variant="ghost"
                      size= "sm
                      onClick={() => removeFile(file)}
                    >
                      <X className= "h-4 w-4" />
                    </Button>
                  </div>
                  <Progress value={progress[file.name] || 0} />
                  {errors[file.name] && (
                    <p className= "text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className= "h-3 w-3" />
                      {errors[file.name]}
                    </p>
                  )}
                  {progress[file.name] === 100 && !errors[file.name] && (
                    <p className= "text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className= "h-3 w-3" />
                      Upload complete
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className= "flex justify-end gap-4 mt-6">
          <Button variant= "outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={uploadFiles}
            disabled={files.length === 0 || uploading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white
          >"
            {uploading ? 'Uploading...' : 'Upload Files'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 