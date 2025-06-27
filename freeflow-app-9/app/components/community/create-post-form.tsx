"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Image as ImageIcon, Link as LinkIcon, Video, Loader2 } from 'lucide-react

interface CreatePostFormProps {
  onSubmit: (data: {
    title: string
    content: string
    category: string
    mediaUrls: string[]
  }) => Promise<void>
  isLoading?: boolean
}

export function CreatePostForm({ onSubmit, isLoading }: CreatePostFormProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('general')
  const [mediaUrls, setMediaUrls] = useState<string[]>([])
  const [mediaType, setMediaType] = useState<&apos;image&apos; | &apos;video&apos; | &apos;link&apos;>('image')
  const [mediaUrl, setMediaUrl] = useState('')

  const handleAddMedia = () => {
    if (mediaUrl && !mediaUrls.includes(mediaUrl)) {
      setMediaUrls(prev => [...prev, mediaUrl])
      setMediaUrl('')
    }
  }

  const handleRemoveMedia = (url: string) => {
    setMediaUrls(prev => prev.filter(u => u !== url))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !content) return

    await onSubmit({
      title,
      content,
      category,
      mediaUrls
    })

    // Reset form
    setTitle('')
    setContent('')
    setCategory('general')
    setMediaUrls([])
    setMediaUrl('')
  }

  return (
    <form onSubmit={handleSubmit} className= "space-y-4">
      <Input
        placeholder= "Post title
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <Textarea
        placeholder= "Write your post content...
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
        rows={4}
      />

      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger>
          <SelectValue placeholder= "Select category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value= "general">General</SelectItem>
          <SelectItem value= "design">Design</SelectItem>
          <SelectItem value= "development">Development</SelectItem>
          <SelectItem value= "marketing">Marketing</SelectItem>
          <SelectItem value= "other">Other</SelectItem>
        </SelectContent>
      </Select>

      <div className= "space-y-2">
        <div className= "flex gap-2">
          <Button
            type= "button"
            variant={mediaType === 'image' ? 'default' : 'outline'}
            onClick={() => setMediaType('image')}
            size= "sm
          >
            <ImageIcon className= "mr-2 h-4 w-4" />
            Image
          </Button>
          <Button
            type= "button"
            variant={mediaType === 'video' ? 'default' : 'outline'}
            onClick={() => setMediaType('video')}
            size= "sm
          >
            <Video className= "mr-2 h-4 w-4" />
            Video
          </Button>
          <Button
            type= "button"
            variant={mediaType === 'link' ? 'default' : 'outline'}
            onClick={() => setMediaType('link')}
            size= "sm
          >
            <LinkIcon className= "mr-2 h-4 w-4" />
            Link
          </Button>
        </div>

        <div className= "flex gap-2">
          <Input
            placeholder={`Add ${mediaType} URL`}
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            type= "url
          />
          <Button
            type= "button"
            onClick={handleAddMedia}
            disabled={!mediaUrl}
            size= "sm
          >
            Add
          </Button>
        </div>

        {mediaUrls.length > 0 && (
          <div className= "grid grid-cols-2 gap-2">
            {mediaUrls.map((url, index) => (
              <div key={index} className= "relative group">
                {url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                  <img src={url} alt={`Media ${index + 1}>
                ) : (
                  <div >
                    {url.match(/\.(mp4|webm)$/i) ? (
                      <Video >
                    ) : (
                      <LinkIcon >
                    )}
                  </div>
                )}
                <Button > handleRemoveMedia(url)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button disabled={isLoading || !title || !content}>
        {isLoading ? (
          <>
            <Loader2 >
            Creating Post...
          </>
        ) : (
          'Create Post
        )}
      </Button>
    </form>
  )
} 