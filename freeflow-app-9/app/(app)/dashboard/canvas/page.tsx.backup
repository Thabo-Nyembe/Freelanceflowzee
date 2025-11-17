'use client'

import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { AIEnhancedCanvasCollaboration } from '@/components/collaboration/ai-enhanced-canvas-collaboration'
import { Badge } from '@/components/ui/badge'
import { 
  Palette, 
  Monitor,
  Users, 
  Layers, 
  Zap, 
  MousePointer,
  MessageCircle
} from 'lucide-react'

export default function CanvasPage() {
  const features = [
    {
      icon: Palette,
      title: 'Visual Design Tools',
      description: 'Professional drawing and design tools with layers support'
    },
    {
      icon: Users,
      title: 'Real-time Collaboration',
      description: 'Work together with your team in real-time on the same canvas'
    },
    {
      icon: MousePointer,
      title: 'Interactive Elements',
      description: 'Add interactive components and prototyping features'
    },
    {
      icon: MessageCircle,
      title: 'Built-in Comments',
      description: 'Leave feedback and comments directly on design elements'
    },
    {
      icon: Layers,
      title: 'Advanced Layering',
      description: 'Organize your work with sophisticated layer management'
    },
    {
      icon: Zap,
      title: 'AI-Powered Suggestions',
      description: 'Get intelligent design suggestions and auto-complete'
    }
  ]

  return (
    <div className="p-6 space-y-6 kazi-bg-light min-h-screen">
      <PageHeader
        title="Canvas Collaboration"
        description="Professional design and prototyping workspace with real-time collaboration"
        icon={Monitor}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Canvas Collaboration' }
        ]}
      />

      <div className="grid gap-6">
        <Card className="kazi-card">
          <CardContent className="p-6">
            <AIEnhancedCanvasCollaboration projectId="demo-project" />
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <Card key={index} className="kazi-card">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-2 rounded-lg kazi-bg-tertiary">
                    <feature.icon className="h-5 w-5 kazi-text-secondary" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold kazi-text-primary">
                      {feature.title}
                    </h3>
                    <p className="kazi-body text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
