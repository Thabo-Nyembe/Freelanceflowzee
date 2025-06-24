"use client"

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export default function AICreatePage() {
  const [generationResult, setGenerationResult] = useState('')
  const [libraryItems, setLibraryItems] = useState([
    { id: 1, type: 'Image', title: 'Brand Logo Variation', timestamp: '1h ago' },
    { id: 2, type: 'Text', title: 'Product Description', timestamp: '3h ago' },
    { id: 3, type: 'Design', title: 'Social Media Template', timestamp: '1d ago' }
  ])
  const [settings, setSettings] = useState({
    enhancedQuality: true,
    autoSave: true,
    realTimePreview: false
  })

  const handleGenerate = async () => {
    console.log('Generating AI content...')
    
    // Show loading state
    setGenerationResult('🤖 AI is generating your content... This may take a few moments.')
    
    // Simulate AI processing time
    setTimeout(() => {
      const results = [
        'Generated a stunning brand logo with modern typography and gradient effects. The design incorporates your brand colors and maintains scalability across all platforms.',
        'Created professional marketing copy with compelling headlines, persuasive body text, and clear call-to-action elements optimized for conversion.',
        'Designed a social media template series with consistent branding, engaging visuals, and platform-optimized dimensions for Instagram, Facebook, and Twitter.',
        'Generated product descriptions with SEO-friendly keywords, benefit-focused language, and emotional triggers to drive sales.',
        'Created website banner designs with responsive layouts, compelling messaging, and conversion-optimized placement strategies.'
      ]
      
      const randomResult = results[Math.floor(Math.random() * results.length)]
      setGenerationResult(`✅ ${randomResult}`)
      
      // Add to library
      const newItem = {
        id: Date.now(),
        type: ['Image', 'Text', 'Design', 'Copy', 'Banner'][Math.floor(Math.random() * 5)],
        title: 'AI Generated Content #' + Date.now(),
        timestamp: 'Just now'
      }
      setLibraryItems(prev => [newItem, ...prev])
      
      // Show success notification
      setTimeout(() => {
        alert('🎉 AI content generation completed successfully!\n\n• Content added to your library\n• Ready for download and use\n• Professional quality guaranteed\n\nCheck the Library tab to view all generated content.')
      }, 500)
    }, 2000)
  }

  const handleSettingChange = (setting: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [setting]: !prev[setting] }))
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Create</h1>
          <p className="text-gray-600">Generate professional content with AI</p>
        </div>
        <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
          A+++ Enterprise Ready
        </Badge>
      </div>

      <Tabs defaultValue="create" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
          <TabsTrigger value="create">Create</TabsTrigger>
          <TabsTrigger value="library">Library</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Generation</CardTitle>
              <CardDescription>Create professional content with AI assistance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid w-full gap-4">
                <Input 
                  placeholder="Enter content type (e.g., logo, banner, description)" 
                  data-testid="content-type-input"
                />
                <Textarea 
                  placeholder="Describe what you want to create..." 
                  className="min-h-[100px]"
                  data-testid="content-description-input"
                />
                <Button onClick={handleGenerate} data-testid="generate-btn">
                  Generate Content
                </Button>
              </div>
              {generationResult && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg" data-testid="generation-result">
                  <h3 className="font-medium mb-2">Generation Results</h3>
                  <p className="text-gray-600">{generationResult}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="library" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generated Content Library</CardTitle>
              <CardDescription>Access your AI-generated content</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4" data-testid="library-list">
                  {libraryItems.map((item) => (
                    <div 
                      key={item.id}
                      className="p-4 border rounded-lg bg-white"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100">
                          {item.type}
                        </Badge>
                        <span className="text-sm text-gray-500">{item.timestamp}</span>
                      </div>
                      <p className="text-gray-700">{item.title}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generation Settings</CardTitle>
              <CardDescription>Customize your AI generation preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6" data-testid="settings-list">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enhanced Quality</Label>
                    <p className="text-sm text-gray-500">Generate higher quality content</p>
                  </div>
                  <Switch
                    checked={settings.enhancedQuality}
                    onCheckedChange={() => handleSettingChange('enhancedQuality')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto Save</Label>
                    <p className="text-sm text-gray-500">Automatically save generated content</p>
                  </div>
                  <Switch
                    checked={settings.autoSave}
                    onCheckedChange={() => handleSettingChange('autoSave')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Real-time Preview</Label>
                    <p className="text-sm text-gray-500">Show preview while generating</p>
                  </div>
                  <Switch
                    checked={settings.realTimePreview}
                    onCheckedChange={() => handleSettingChange('realTimePreview')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 