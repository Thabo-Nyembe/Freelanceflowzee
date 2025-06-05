"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface CommentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (content: string, priority?: string, tags?: string[]) => void
  title: string
  description?: string
}

export function CommentDialog({ open, onOpenChange, onSubmit, title, description }: CommentDialogProps) {
  const [content, setContent] = useState("")
  const [priority, setPriority] = useState("medium")
  const [tags, setTags] = useState<string[]>([])
  const [error, setError] = useState("")

  const predefinedTags = ["Design", "Content", "Technical", "Urgent"]

  const toggleTag = (tag: string) => {
    setTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const validateContent = (value: string) => {
    const trimmed = value.trim()
    
    if (!trimmed) {
      return "Comment content is required"
    }
    
    if (trimmed.length > 2000) {
      return "Comment must be less than 2000 characters"
    }
    
    return ""
  }

  const handleSubmit = () => {
    const validationError = validateContent(content)
    
    if (validationError) {
      setError(validationError)
      return
    }

    setError("")
    onSubmit(content.trim(), priority, tags)
    
    // Reset form
    setContent("")
    setPriority("medium")
    setTags([])
  }

  const handleCancel = () => {
    setContent("")
    setPriority("medium")
    setTags([])
    setError("")
    onOpenChange(false)
  }

  const handleContentChange = (value: string) => {
    setContent(value)
    // Clear error when user starts typing
    if (error && value.trim()) {
      setError("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="comment-dialog">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Comment *</label>
            <Textarea
              placeholder="Share your feedback..."
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              rows={3}
              className={error ? "border-red-500" : ""}
              data-testid="comment-content"
            />
            {error && (
              <div className="text-red-500 text-sm mt-1" data-testid="content-error">
                {error}
              </div>
            )}
            <div className="text-xs text-gray-500 mt-1">
              {content.length}/2000 characters
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Priority</label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger data-testid="comment-priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tags</label>
            <div className="flex flex-wrap gap-2" data-testid="tag-container">
              {predefinedTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={tags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag)}
                  data-testid={`tag-${tag.toLowerCase()}`}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={handleCancel}
              data-testid="cancel-btn"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!content.trim()}
              data-testid="submit-btn"
            >
              Add Comment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
