"use client";

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Brain, 
  Palette, 
  Sparkles, 
  Wand2, 
  Image, 
  Layers, 
  Grid, 
  Plus,
  Settings,
  Share2
} from 'lucide-react'

export default function AIDesignPage() {
  const [activeTab, setActiveTab] = useState('tools')

  const designTools = [
    {
      id: 'logo-gen',
      name: 'Logo Generator',
      description: 'Create professional logos with AI',
      icon: Sparkles,
      status: 'available',
      category: 'branding'
    },
    {
      id: 'color-palette',
      name: 'Color Palette Generator',
      description: 'Generate harmonious color schemes',
      icon: Palette,
      status: 'available',
      category: 'colors'
    },
    {
      id: 'layout-gen',
      name: 'Layout Generator',
      description: 'AI-powered layout suggestions',
      icon: Grid,
      status: 'available',
      category: 'layout'
    },
    {
      id: 'mockup-gen',
      name: 'Mockup Generator',
      description: 'Create stunning product mockups',
      icon: Image,
      status: 'coming-soon',
      category: 'mockups'
    }
  ]

  const recentProjects = [
    {
      id: 1,
      name: 'Tech Startup Branding',
      type: 'Logo & Identity',
      progress: 85,
      thumbnail: '/placeholder-logo.jpg'
    },
    {
      id: 2,
      name: 'E-commerce Website',
      type: 'UI Design',
      progress: 60,
      thumbnail: '/placeholder-ui.jpg'
    }
  ]

  return (
    <div className="min-h-screen kazi-bg-light dark:kazi-bg-dark p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold kazi-text-dark dark:kazi-text-light mb-2 kazi-headline">
                AI Design Studio
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 kazi-body">
                Create stunning designs with the power of artificial intelligence
              </p>
            </div>
            <Button className="btn-kazi-primary kazi-ripple">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tools">AI Tools</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="tools" className="space-y-6">
            {/* AI Design Tools */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {designTools.map((tool) => {
                const IconComponent = tool.icon
                return (
                  <Card key={tool.id} className="kazi-card kazi-hover-scale">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <IconComponent className="w-8 h-8 kazi-text-primary" />
                        <Badge 
                          variant={tool.status === 'available' ? 'default' : 'secondary'}
                          className={tool.status === 'available' ? 'bg-green-100 text-green-800' : ''}
                        >
                          {tool.status === 'available' ? 'Available' : 'Coming Soon'}
                        </Badge>
                      </div>
                      <CardTitle className="kazi-headline">{tool.name}</CardTitle>
                      <CardDescription className="kazi-body">{tool.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        className="w-full btn-kazi-primary kazi-ripple"
                        disabled={tool.status !== 'available'}
                      >
                        {tool.status === 'available' ? (
                          <>
                            <Wand2 className="w-4 h-4 mr-2" />
                            Launch Tool
                          </>
                        ) : (
                          'Coming Soon'
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Quick Actions */}
            <Card className="kazi-card">
              <CardHeader>
                <CardTitle className="kazi-headline">Quick Actions</CardTitle>
                <CardDescription className="kazi-body">
                  Start designing with these popular workflows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="flex flex-col h-20 items-center justify-center gap-2">
                    <Brain className="w-5 h-5" />
                    <span className="text-xs">Generate Logo</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col h-20 items-center justify-center gap-2">
                    <Palette className="w-5 h-5" />
                    <span className="text-xs">Color Scheme</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col h-20 items-center justify-center gap-2">
                    <Layers className="w-5 h-5" />
                    <span className="text-xs">UI Layout</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col h-20 items-center justify-center gap-2">
                    <Image className="w-5 h-5" />
                    <span className="text-xs">Mockup</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <Card className="kazi-card">
              <CardHeader>
                <CardTitle className="kazi-headline">Recent Projects</CardTitle>
                <CardDescription className="kazi-body">
                  Continue working on your AI-generated designs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentProjects.map((project) => (
                    <Card key={project.id} className="kazi-card">
                      <CardContent className="p-4">
                        <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                          <Image className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="font-semibold kazi-text-dark dark:kazi-text-light kazi-body-medium">
                          {project.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 kazi-body">
                          {project.type}
                        </p>
                        <div className="mt-3 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{project.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" className="flex-1">
                            Continue
                          </Button>
                          <Button size="sm" variant="outline">
                            <Share2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card className="kazi-card">
              <CardHeader>
                <CardTitle className="kazi-headline">Design Templates</CardTitle>
                <CardDescription className="kazi-body">
                  Start with professionally designed templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Sparkles className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Templates Coming Soon</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Explore hundreds of AI-generated design templates
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="kazi-card">
              <CardHeader>
                <CardTitle className="kazi-headline">AI Design Settings</CardTitle>
                <CardDescription className="kazi-body">
                  Configure your AI design preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Settings className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Settings Panel</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Customize AI models, output quality, and design preferences
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}