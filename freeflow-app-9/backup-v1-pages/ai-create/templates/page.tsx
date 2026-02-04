"use client"

import { useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Download, Eye, Star, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

// A+++ UTILITIES
import { useCurrentUser } from '@/hooks/use-ai-data'
import { useAnnouncer } from '@/lib/accessibility'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('AI-Create-Templates')

interface Template {
  id: number
  name: string
  description: string
  uses: number
  prompt?: string
  isFavorite?: boolean
}

const INITIAL_TEMPLATES = [
  {
    name: 'Content Writing',
    templates: [
      { id: 1, name: 'Blog Post Outline', description: '5-section blog structure', uses: 2453, prompt: 'Create a comprehensive blog post outline with: 1) Hook introduction, 2) Problem statement, 3) Solution details, 4) Key benefits, 5) Call to action' },
      { id: 2, name: 'Social Media Thread', description: 'Twitter/X thread template', uses: 1892, prompt: 'Write a viral Twitter thread with: Hook tweet, 5-7 value tweets, engagement prompt, and summary tweet' },
      { id: 3, name: 'Product Description', description: 'E-commerce product copy', uses: 3201, prompt: 'Write compelling product copy: headline, key features (3-5 bullets), benefits, social proof element, CTA' }
    ]
  },
  {
    name: 'Code Generation',
    templates: [
      { id: 4, name: 'React Component', description: 'TypeScript React component', uses: 4523, prompt: 'Generate a TypeScript React functional component with: props interface, state management, event handlers, proper types' },
      { id: 5, name: 'API Endpoint', description: 'REST API with validation', uses: 3456, prompt: 'Create a REST API endpoint with: input validation, error handling, type safety, proper HTTP status codes' },
      { id: 6, name: 'Database Schema', description: 'SQL table definitions', uses: 2134, prompt: 'Design SQL schema with: tables, relationships, indexes, constraints, and migration scripts' }
    ]
  },
  {
    name: 'Creative Assets',
    templates: [
      { id: 7, name: 'Color Palette', description: '5-color scheme generator', uses: 5432, prompt: 'Generate a cohesive 5-color palette with: primary, secondary, accent, background, text colors with hex values' },
      { id: 8, name: 'LUT Preset', description: 'Cinematic color grading', uses: 4321, prompt: 'Create cinematic color grading settings: contrast, saturation, highlights, shadows, color wheels' },
      { id: 9, name: 'Synth Preset', description: 'EDM lead synth', uses: 1765, prompt: 'Design synthesizer preset: oscillators, filters, envelopes, LFOs, effects chain for EDM lead sound' }
    ]
  }
]

export default function TemplatesPage() {
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  const [categories, setCategories] = useState(INITIAL_TEMPLATES)
  const [favorites, setFavorites] = useState<Set<number>>(new Set())
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newTemplate, setNewTemplate] = useState({ name: '', description: '', prompt: '', category: 'Content Writing' })

  // Toggle favorite
  const handleToggleFavorite = useCallback((templateId: number, templateName: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(templateId)) {
        newFavorites.delete(templateId)
        toast.success('Removed from favorites')
        logger.info('Template unfavorited', { templateId })
      } else {
        newFavorites.add(templateId)
        toast.success('Added to favorites', { description: templateName })
        logger.info('Template favorited', { templateId, templateName })
      }
      return newFavorites
    })
    announce('Favorite toggled', 'polite')
  }, [announce])

  // Preview template
  const handlePreview = useCallback((template: Template) => {
    setPreviewTemplate(template)
    logger.info('Template preview opened', { templateId: template.id })
  }, [])

  // Download template
  const handleDownload = useCallback((template: Template) => {
    const content = {
      name: template.name,
      description: template.description,
      prompt: template.prompt,
      exportedAt: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `template-${template.name.toLowerCase().replace(/\s+/g, '-')}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Template Downloaded', { description: template.name })
    logger.info('Template downloaded', { templateId: template.id })
  }, [])

  // Use template (copy to clipboard)
  const handleUseTemplate = useCallback((template: Template) => {
    if (template.prompt) {
      navigator.clipboard.writeText(template.prompt)
      toast.success('Copied to Clipboard', { description: 'Paste the prompt in AI Create Studio' })
      logger.info('Template prompt copied', { templateId: template.id })
    }
  }, [])

  // Create custom template
  const handleCreateTemplate = useCallback(() => {
    if (!newTemplate.name || !newTemplate.prompt) {
      toast.error('Please fill in name and prompt')
      return
    }

    const template = {
      id: Date.now(),
      name: newTemplate.name,
      description: newTemplate.description || 'Custom template',
      uses: 0,
      prompt: newTemplate.prompt
    }

    setCategories(prev => {
      const updated = [...prev]
      const categoryIndex = updated.findIndex(c => c.name === newTemplate.category)
      if (categoryIndex >= 0) {
        updated[categoryIndex].templates.push(template)
      }
      return updated
    })

    setShowCreateDialog(false)
    setNewTemplate({ name: '', description: '', prompt: '', category: 'Content Writing' })
    toast.success('Template Created', { description: newTemplate.name })
    logger.info('Custom template created', { name: newTemplate.name })
    announce('Template created successfully', 'polite')
  }, [newTemplate, announce])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Prompt Templates</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Pre-built templates to accelerate your creative workflow
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Custom Template
        </Button>
      </div>

      {categories.map((category) => (
        <Card key={category.name} className="p-6">
          <h3 className="text-lg font-semibold mb-4">{category.name}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {category.templates.map((template) => (
              <Card key={template.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 cursor-pointer" onClick={() => handleUseTemplate(template)}>
                    <h4 className="font-semibold">{template.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {template.description}
                    </p>
                  </div>
                  <Star
                    className={`h-4 w-4 cursor-pointer transition-colors ${
                      favorites.has(template.id) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400 hover:text-yellow-500'
                    }`}
                    onClick={() => handleToggleFavorite(template.id, template.name)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {template.uses.toLocaleString()} uses
                  </Badge>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handlePreview(template)} title="Preview">
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDownload(template)} title="Download">
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      ))}

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{previewTemplate?.name}</DialogTitle>
            <DialogDescription>{previewTemplate?.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h4 className="font-semibold mb-2">Prompt Template:</h4>
              <p className="text-sm whitespace-pre-wrap">{previewTemplate?.prompt}</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setPreviewTemplate(null)}>Close</Button>
              <Button onClick={() => { handleUseTemplate(previewTemplate!); setPreviewTemplate(null); }}>
                Use Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Template Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Custom Template</DialogTitle>
            <DialogDescription>Build your own reusable prompt template</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Template Name</label>
              <Input
                placeholder="My Custom Template"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                placeholder="Brief description of what this template does"
                value={newTemplate.description}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Prompt Template</label>
              <Textarea
                placeholder="Enter your prompt template..."
                rows={5}
                value={newTemplate.prompt}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, prompt: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateTemplate}>Create Template</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
