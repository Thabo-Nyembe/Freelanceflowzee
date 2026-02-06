'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  Video,
  Image as ImageIcon,
  Music,
  Play,
  Star,
  Clock,
  Search,
  Eye,
  Download,
  Wand2,
  Sparkles
} from 'lucide-react'
import { toast } from 'sonner'
import NextImage from 'next/image'

// Blur placeholder for template thumbnails
const THUMBNAIL_BLUR_PLACEHOLDER =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAME/8QAIhAAAgEDAwUBAAAAAAAAAAAAAQIDBBEhABIxBQYTQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAgP/xAAYEQEBAQEBAAAAAAAAAAAAAAABAgADEf/aAAwDAQACEQMRAD8AyRU9NL06aKjqzBUxNulkZQWBJYEA+xYfPmtaKpqa6ljqqaZopozlHXkHTWk0w5JOp//Z"

export interface VideoTemplate {
  id: string
  name: string
  description: string
  category: 'business' | 'social' | 'educational' | 'promotional' | 'creative'
  duration: number
  thumbnail: string
  previewUrl?: string
  rating: number
  downloads: number
  isPremium: boolean
  tags: string[]
  assets: {
    videos: number
    images: number
    audio: number
  }
}

const mockTemplates: VideoTemplate[] = [
  {
    id: '1',
    name: 'Modern Business Intro',
    description: 'Professional introduction template perfect for business presentations',
    category: 'business',
    duration: 30,
    thumbnail: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=400&h=225&fit=crop',
    rating: 4.8,
    downloads: 1247,
    isPremium: false,
    tags: ['business', 'intro', 'professional', 'corporate'],
    assets: { videos: 3, images: 5, audio: 2 }
  },
  {
    id: '2',
    name: 'Social Media Story',
    description: 'Engaging vertical template optimized for Instagram and TikTok stories',
    category: 'social',
    duration: 15,
    thumbnail: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=225&fit=crop',
    rating: 4.6,
    downloads: 892,
    isPremium: true,
    tags: ['social', 'vertical', 'instagram', 'story'],
    assets: { videos: 2, images: 8, audio: 3 }
  },
  {
    id: '3',
    name: 'Educational Explainer',
    description: 'Clean template for educational content and tutorials',
    category: 'educational',
    duration: 60,
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop',
    rating: 4.9,
    downloads: 2156,
    isPremium: false,
    tags: ['education', 'tutorial', 'clean', 'explainer'],
    assets: { videos: 4, images: 6, audio: 1 }
  },
  {
    id: '4',
    name: 'Product Showcase',
    description: 'Dynamic template to highlight products and features',
    category: 'promotional',
    duration: 45,
    thumbnail: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=225&fit=crop',
    rating: 4.7,
    downloads: 1673,
    isPremium: true,
    tags: ['product', 'showcase', 'promotional', 'dynamic'],
    assets: { videos: 5, images: 7, audio: 4 }
  }
]

interface VideoTemplatesProps {
  onSelectTemplate: (template: VideoTemplate) => void
  onPreviewTemplate: (template: VideoTemplate) => void
}

export function VideoTemplates({ onSelectTemplate, onPreviewTemplate }: VideoTemplatesProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedTemplate, setSelectedTemplate] = useState<VideoTemplate | null>(null)

  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'business', name: 'Business' },
    { id: 'social', name: 'Social Media' },
    { id: 'educational', name: 'Educational' },
    { id: 'promotional', name: 'Promotional' },
    { id: 'creative', name: 'Creative' }
  ]

  const filteredTemplates = mockTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const handleUseTemplate = (template: VideoTemplate) => {
    if (template.isPremium) {
      toast.info(`Premium template "${template.name}" - Upgrade to use this template`)
      return
    }
    
    toast.success(`Applied template: ${template.name}`)
    onSelectTemplate(template)
  }

  const handlePreview = (template: VideoTemplate) => {
    setSelectedTemplate(template)
    onPreviewTemplate(template)
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Video Templates</h2>
          <p className="text-muted-foreground">Professional templates to jumpstart your video creation</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-6">
          {categories.map(category => (
            <TabsTrigger key={category.id} value={category.id} className="text-xs">
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => (
          <Card key={template.id} className="group hover:shadow-lg transition-all duration-200">
            <div className="relative h-48">
              <NextImage
                src={template.thumbnail}
                alt={template.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover rounded-t-lg"
                placeholder="blur"
                blurDataURL={THUMBNAIL_BLUR_PLACEHOLDER}
                loading="lazy"
              />

              {/* Premium Badge */}
              {template.isPremium && (
                <Badge className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              )}
              
              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-t-lg flex items-center justify-center">
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => handlePreview(template)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle>{template.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <Play className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-muted-foreground">Template preview would play here</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-muted-foreground">{template.description}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-sm flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {formatDuration(template.duration)}
                              </span>
                              <span className="text-sm flex items-center gap-1">
                                <Download className="w-4 h-4" />
                                {template.downloads.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <Button onClick={() => handleUseTemplate(template)}>
                            Use Template
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button 
                    size="sm"
                    onClick={() => handleUseTemplate(template)}
                  >
                    <Wand2 className="w-4 h-4 mr-1" />
                    Use
                  </Button>
                </div>
              </div>
            </div>
            
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold">{template.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {template.description}
                  </p>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{template.rating}</span>
                    </div>
                    <span className="text-muted-foreground">•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDuration(template.duration)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Video className="w-3 h-3" />
                      {template.assets.videos}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Image className="w-3 h-3"  loading="lazy"/>
                      {template.assets.images}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Music className="w-3 h-3" />
                      {template.assets.audio}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {template.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {template.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{template.tags.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <Video className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No templates found</h3>
          <p className="text-muted-foreground">Try adjusting your search or category filter</p>
        </div>
      )}
    </div>
  )
}

export default VideoTemplates