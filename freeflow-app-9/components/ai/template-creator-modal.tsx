/**
 * AI CREATE A++++ CUSTOM TEMPLATE CREATOR
 * Modal for creating and editing custom content templates
 */

"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  Plus,
  Save,
  X,
  FileText,
  MessageSquare,
  Mail,
  ShoppingCart,
  Code2,
  Pen,
  Sparkles,
  Info,
  AlertCircle
} from 'lucide-react'

interface CustomTemplate {
  id: string
  title: string
  description: string
  prompt: string
  category: string
  tags: string[]
  createdAt: Date
  usageCount: number
}

interface TemplateCreatorModalProps {
  open: boolean
  onClose: () => void
  onSave: (template: CustomTemplate) => void
  editingTemplate?: CustomTemplate | null
  existingTemplates?: CustomTemplate[]
}

const TEMPLATE_CATEGORIES = [
  { value: 'content', label: 'Content Writing', icon: FileText },
  { value: 'social', label: 'Social Media', icon: MessageSquare },
  { value: 'marketing', label: 'Marketing', icon: Mail },
  { value: 'ecommerce', label: 'E-commerce', icon: ShoppingCart },
  { value: 'technical', label: 'Technical', icon: Code2 },
  { value: 'creative', label: 'Creative', icon: Pen },
  { value: 'custom', label: 'Custom', icon: Sparkles }
]

const SUGGESTED_TAGS = [
  'SEO', 'Marketing', 'Sales', 'Content', 'Social', 'Blog',
  'Email', 'Copy', 'Ads', 'Product', 'Technical', 'Creative',
  'Business', 'Education', 'News', 'Tutorial', 'Review', 'Guide'
]

export function TemplateCreatorModal({
  open,
  onClose,
  onSave,
  editingTemplate,
  existingTemplates = []
}: TemplateCreatorModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [prompt, setPrompt] = useState('')
  const [category, setCategory] = useState('custom')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load editing template data
  useEffect(() => {
    if (editingTemplate) {
      setTitle(editingTemplate.title)
      setDescription(editingTemplate.description)
      setPrompt(editingTemplate.prompt)
      setCategory(editingTemplate.category)
      setTags(editingTemplate.tags || [])
    } else {
      resetForm()
    }
  }, [editingTemplate, open])

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setPrompt('')
    setCategory('custom')
    setTags([])
    setTagInput('')
    setErrors({})
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) {
      newErrors.title = 'Title is required'
    } else if (title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters'
    } else if (title.length > 50) {
      newErrors.title = 'Title must be less than 50 characters'
    }

    // Check for duplicate title (only if creating new template)
    if (!editingTemplate) {
      const duplicate = existingTemplates.find(
        t => t.title.toLowerCase() === title.trim().toLowerCase()
      )
      if (duplicate) {
        newErrors.title = 'A template with this title already exists'
      }
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required'
    } else if (description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters'
    } else if (description.length > 200) {
      newErrors.description = 'Description must be less than 200 characters'
    }

    if (!prompt.trim()) {
      newErrors.prompt = 'Prompt template is required'
    } else if (prompt.length < 20) {
      newErrors.prompt = 'Prompt must be at least 20 characters'
    } else if (prompt.length > 2000) {
      newErrors.prompt = 'Prompt must be less than 2000 characters'
    }

    if (!category) {
      newErrors.category = 'Category is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validateForm()) {
      toast.error('Please fix the errors before saving')
      return
    }

    const template: CustomTemplate = {
      id: editingTemplate?.id || `custom-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      prompt: prompt.trim(),
      category,
      tags,
      createdAt: editingTemplate?.createdAt || new Date(),
      usageCount: editingTemplate?.usageCount || 0
    }

    onSave(template)
    toast.success(editingTemplate ? 'Template updated!' : 'Template created!')
    resetForm()
    onClose()
  }

  const handleAddTag = () => {
    const tag = tagInput.trim()
    if (tag && !tags.includes(tag)) {
      if (tags.length >= 10) {
        toast.warning('Maximum 10 tags allowed')
        return
      }
      setTags([...tags, tag])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleAddSuggestedTag = (tag: string) => {
    if (!tags.includes(tag)) {
      if (tags.length >= 10) {
        toast.warning('Maximum 10 tags allowed')
        return
      }
      setTags([...tags, tag])
    }
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const promptLength = prompt.length
  const promptLengthColor =
    promptLength === 0 ? 'text-gray-400' :
    promptLength < 20 ? 'text-red-500' :
    promptLength > 2000 ? 'text-red-500' :
    promptLength > 1500 ? 'text-yellow-500' :
    'text-green-500'

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {editingTemplate ? (
              <>
                <Pen className="h-5 w-5 text-purple-500" />
                Edit Template
              </>
            ) : (
              <>
                <Plus className="h-5 w-5 text-purple-500" />
                Create Custom Template
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {editingTemplate
              ? 'Update your custom content template'
              : 'Create a reusable template for AI content generation'}
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 py-4"
        >
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Template Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Product Launch Email"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.title}
              </p>
            )}
            <p className="text-xs text-gray-500">
              {title.length}/50 characters
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe what this template generates..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.description}
              </p>
            )}
            <p className="text-xs text-gray-500">
              {description.length}/200 characters
            </p>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">
              Category <span className="text-red-500">*</span>
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATE_CATEGORIES.map((cat) => {
                  const Icon = cat.icon
                  return (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {cat.label}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Prompt Template */}
          <div className="space-y-2">
            <Label htmlFor="prompt">
              Prompt Template <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Textarea
                id="prompt"
                placeholder={`Write a detailed prompt template...\n\nTip: Use [PLACEHOLDERS] for dynamic content.\nExample: "Write a blog post about [TOPIC] that includes [REQUIREMENTS]"`}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={8}
                className={`font-mono text-sm ${errors.prompt ? 'border-red-500' : ''}`}
              />
              <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 px-2 py-1 rounded border">
                <span className={`text-xs font-medium ${promptLengthColor}`}>
                  {promptLength}
                </span>
                <span className="text-xs text-gray-400">/2000</span>
              </div>
            </div>
            {errors.prompt && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.prompt}
              </p>
            )}
            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-700 dark:text-blue-300">
                <strong>Tip:</strong> Use square brackets [LIKE THIS] for placeholders that users can fill in when using the template.
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (optional)</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Current Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center gap-1 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/20"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag}
                    <X className="h-3 w-3" />
                  </Badge>
                ))}
              </div>
            )}

            {/* Suggested Tags */}
            {tags.length < 10 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500">Suggested tags:</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_TAGS.filter(tag => !tags.includes(tag))
                    .slice(0, 12)
                    .map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/20"
                        onClick={() => handleAddSuggestedTag(tag)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Save className="h-4 w-4 mr-2" />
            {editingTemplate ? 'Update Template' : 'Create Template'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
