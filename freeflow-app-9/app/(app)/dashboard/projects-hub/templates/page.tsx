'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Sparkles, Eye, Download, Star } from 'lucide-react'

const projectTemplates = [
  {
    id: 1,
    name: 'Photography Portfolio',
    description: 'Professional portfolio template for photographers with gallery features',
    category: 'Creative',
    difficulty: 'Beginner',
    features: ['Image Gallery', 'Client Proofing', 'Contact Forms', 'SEO Optimized'],
    image: '/api/placeholder/400/240',
    rating: 4.9,
    downloads: 1247
  },
  {
    id: 2,
    name: 'Design Agency',
    description: 'Complete agency website with project showcases and team profiles',
    category: 'Business',
    difficulty: 'Intermediate',
    features: ['Portfolio Showcase', 'Team Pages', 'Service Listings', 'Blog Integration'],
    image: '/api/placeholder/400/240',
    rating: 4.8,
    downloads: 856
  },
  {
    id: 3,
    name: 'E-commerce Store',
    description: 'Full-featured online store with payment integration',
    category: 'E-commerce',
    difficulty: 'Advanced',
    features: ['Product Catalog', 'Shopping Cart', 'Payment Gateway', 'Inventory Management'],
    image: '/api/placeholder/400/240',
    rating: 4.7,
    downloads: 2134
  },
  {
    id: 4,
    name: 'SaaS Landing Page',
    description: 'Modern landing page template for SaaS products',
    category: 'Technology',
    difficulty: 'Beginner',
    features: ['Hero Section', 'Feature Highlights', 'Pricing Tables', 'Contact Integration'],
    image: '/api/placeholder/400/240',
    rating: 4.9,
    downloads: 1876
  },
  {
    id: 5,
    name: 'Restaurant Website',
    description: 'Elegant restaurant website with menu and reservation system',
    category: 'Food & Beverage',
    difficulty: 'Intermediate',
    features: ['Menu Display', 'Online Reservations', 'Gallery', 'Location Map'],
    image: '/api/placeholder/400/240',
    rating: 4.6,
    downloads: 634
  },
  {
    id: 6,
    name: 'Corporate Identity',
    description: 'Professional corporate website template',
    category: 'Business',
    difficulty: 'Intermediate',
    features: ['Company Profile', 'Services', 'News & Updates', 'Contact Forms'],
    image: '/api/placeholder/400/240',
    rating: 4.8,
    downloads: 1123
  }
]

export default function TemplatesPage() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState('All')
  
  const categories = ['All', 'Creative', 'Business', 'E-commerce', 'Technology', 'Food & Beverage']
  
  const filteredTemplates = selectedCategory === 'All' 
    ? projectTemplates 
    : projectTemplates.filter(template => template.category === selectedCategory)

  const handleUseTemplate = (template: any) => {
    alert(`Starting project with "${template.name}" template...\n\nThis will create a new project with:\n• ${template.features.join('\n• ')}\n\nRedirecting to project setup...`)
    router.push(`/dashboard/projects-hub/create?template=${template.id}`)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'Advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Project Templates
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Choose from our professionally designed templates to get started quickly
            </p>
          </div>
        </div>

        {/* Category Filter */}
        <Card className="p-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white" : ""}
              >
                {category}
              </Button>
            ))}
          </div>
        </Card>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img 
                  src={template.image} 
                  alt={template.name}
                  className="w-full h-48 object-cover bg-gradient-to-r from-purple-200 to-blue-200"
                />
                <div className="absolute top-4 right-4">
                  <Badge className={getDifficultyColor(template.difficulty)}>
                    {template.difficulty}
                  </Badge>
                </div>
              </div>
              
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{template.name}</CardTitle>
                    <CardDescription className="mt-2">
                      {template.description}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">{template.category}</Badge>
                </div>
              </CardHeader>

              <CardContent>
                {/* Features */}
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-2">Features Include:</h4>
                    <div className="flex flex-wrap gap-1">
                      {template.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span>{template.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      <span>{template.downloads.toLocaleString()} uses</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1"
                      onClick={() => alert(`Previewing ${template.name} template...`)}
                    >
                      <Eye className="h-4 w-4" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 gap-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                      onClick={() => handleUseTemplate(template)}
                    >
                      <Sparkles className="h-4 w-4" />
                      Use Template
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredTemplates.length === 0 && (
          <Card className="p-12 text-center">
            <div className="space-y-4">
              <div className="text-gray-400">
                <Sparkles className="h-16 w-16 mx-auto mb-4" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">No templates found</h3>
                <p className="text-gray-600 mt-2">
                  Try selecting a different category or check back later for new templates.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setSelectedCategory('All')}
              >
                View All Templates
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
} 