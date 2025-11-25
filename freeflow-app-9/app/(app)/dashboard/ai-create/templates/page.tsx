"use client"

import { Card } from '@/components/ui/card'
import { FileText, Download, Eye, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const TEMPLATE_CATEGORIES = [
  {
    name: 'Content Writing',
    templates: [
      { id: 1, name: 'Blog Post Outline', description: '5-section blog structure', uses: 2453 },
      { id: 2, name: 'Social Media Thread', description: 'Twitter/X thread template', uses: 1892 },
      { id: 3, name: 'Product Description', description: 'E-commerce product copy', uses: 3201 }
    ]
  },
  {
    name: 'Code Generation',
    templates: [
      { id: 4, name: 'React Component', description: 'TypeScript React component', uses: 4523 },
      { id: 5, name: 'API Endpoint', description: 'REST API with validation', uses: 3456 },
      { id: 6, name: 'Database Schema', description: 'SQL table definitions', uses: 2134 }
    ]
  },
  {
    name: 'Creative Assets',
    templates: [
      { id: 7, name: 'Color Palette', description: '5-color scheme generator', uses: 5432 },
      { id: 8, name: 'LUT Preset', description: 'Cinematic color grading', uses: 4321 },
      { id: 9, name: 'Synth Preset', description: 'EDM lead synth', uses: 1765 }
    ]
  }
]

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Prompt Templates</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Pre-built templates to accelerate your creative workflow
          </p>
        </div>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          Create Custom Template
        </Button>
      </div>

      {TEMPLATE_CATEGORIES.map((category) => (
        <Card key={category.name} className="p-6">
          <h3 className="text-lg font-semibold mb-4">{category.name}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {category.templates.map((template) => (
              <Card key={template.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{template.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {template.description}
                    </p>
                  </div>
                  <Star className="h-4 w-4 text-gray-400 hover:text-yellow-500 cursor-pointer" />
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {template.uses.toLocaleString()} uses
                  </Badge>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost">
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      ))}
    </div>
  )
}
