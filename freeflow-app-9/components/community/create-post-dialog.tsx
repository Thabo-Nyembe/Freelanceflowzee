"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Image, Video, X } from 'lucide-react'

interface CreatePostDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (formData: FormData) => void
}

export function CreatePostDialog({ open, onOpenChange, onSubmit }: CreatePostDialogProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setIsSubmitting(true)
    const formData = new FormData()
    formData.append('title', title)
    formData.append('content', content)
    selectedFiles.forEach(file => {
      formData.append('media', file)
    })

    try {
      await onSubmit(formData)
      setTitle('')
      setContent('')
      setSelectedFiles([])
      onOpenChange(false)
    } catch (error) {
      console.error('Error creating post: ', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setSelectedFiles(prev => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your post a title..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What&apos;s on your mind?"
              rows={4}
            />
          </div>
          
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Files</Label>
              <div className="grid grid-cols-2 gap-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    {file.type.startsWith('image/') ? (
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <img src={URL.createObjectURL(file)} alt={`Selected file ${index + 1}`} />
                      </div>
                    ) : (
                      <div>
                        <Video />
                      </div>
                    )}
                    <Button onClick={() => removeFile(index)}>
                      <X />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <Button onClick={() => document.getElementById('image-upload')?.click()}>
              <Image />
              Add Image
            </Button>
            <Button onClick={() => document.getElementById('video-upload')?.click()}>
              <Video />
              Add Video
            </Button>
            <input type="file" id="image-upload" hidden accept="image/*" onChange={handleFileSelect} />
            <input type="file" id="video-upload" hidden accept="video/*" onChange={handleFileSelect} />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting || !content.trim()}>
              {isSubmitting ? 'Creating...' : 'Create Post'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 