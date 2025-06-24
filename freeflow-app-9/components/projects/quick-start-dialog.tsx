import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Briefcase, 
  Palette, 
  Code, 
  Camera, 
  ShoppingBag,
  CheckCircle2
} from 'lucide-react'

interface QuickStartDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (template: any) => void
}

const templates = [
  {
    id: 'brand-identity',
    name: 'Brand Identity Package',
    description: 'Complete branding including logo, style guide, and assets',
    icon: Palette,
    category: 'Design',
    deliverables: ['Logo Design', 'Color Palette', 'Typography', 'Brand Guidelines'],
    timeline: '2-3 weeks'
  },
  {
    id: 'web-development',
    name: 'Website Development',
    description: 'Modern responsive website with CMS integration',
    icon: Code,
    category: 'Development',
    deliverables: ['Website Design', 'Frontend Development', 'CMS Setup', 'Deployment'],
    timeline: '4-6 weeks'
  },
  {
    id: 'photo-shoot',
    name: 'Product Photography',
    description: 'Professional product photography and editing',
    icon: Camera,
    category: 'Photography',
    deliverables: ['Product Photos', 'Lifestyle Shots', 'Edited Images', 'Usage Rights'],
    timeline: '1-2 weeks'
  },
  {
    id: 'ecommerce',
    name: 'E-commerce Store',
    description: 'Complete online store setup with payment integration',
    icon: ShoppingBag,
    category: 'E-commerce',
    deliverables: ['Store Setup', 'Product Upload', 'Payment Gateway', 'Shipping Setup'],
    timeline: '3-4 weeks'
  }
]

export function QuickStartDialog({ open, onOpenChange, onSelect }: QuickStartDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const handleSelect = () => {
    if (selectedTemplate) {
      const template = templates.find(t => t.id === selectedTemplate)
      if (template) {
        onSelect(template)
        onOpenChange(false)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Quick Start Project</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map(template => {
              const Icon = template.icon
              return (
                <Card
                  key={template.id}
                  className={`p-4 cursor-pointer hover:border-blue-500 transition-colors ${
                    selectedTemplate === template.id ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                  data-testid={`template-${template.id}`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{template.name}</h4>
                        <Badge variant="secondary">{template.category}</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                      <div className="mt-3">
                        <p className="text-sm font-medium">Deliverables:</p>
                        <ul className="text-sm text-gray-500 mt-1 space-y-1">
                          {template.deliverables.map((item, index) => (
                            <li key={index} className="flex items-center">
                              <CheckCircle2 className="h-3 w-3 text-green-500 mr-2" />
                              {item}
                            </li>
                          ))}
                        </ul>
                        <p className="text-sm text-gray-500 mt-2">
                          Timeline: {template.timeline}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="cancel-template-btn"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSelect}
            disabled={!selectedTemplate}
            data-testid="select-template-btn"
          >
            Start Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 