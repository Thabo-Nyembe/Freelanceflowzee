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
import { Wand2, Camera, Video, PenTool, Music2, Code2, FileText, Library, Settings2 } from 'lucide-react'

const CREATIVE_FIELDS = [
  {
    id: 'photography',
    name: 'Photography',
    icon: Camera,
    description: 'Professional photo editing and enhancement'
  },
  {
    id: 'videography',
    name: 'Videography',
    icon: Video,
    description: 'Video production and post-processing'
  },
  {
    id: 'graphic-design',
    name: 'Graphic Design',
    icon: PenTool,
    description: 'Visual design and branding assets'
  },
  {
    id: 'music-production',
    name: 'Music Production',
    icon: Music2,
    description: 'Audio creation and sound design'
  },
  {
    id: 'web-development',
    name: 'Web Development',
    icon: Code2,
    description: 'Web components and code generation'
  },
  {
    id: 'content-writing',
    name: 'Content Writing',
    icon: FileText,
    description: 'Professional content and copywriting'
  }
]

export default function AICreatePage() {
  const [selectedField, setSelectedField] = useState('')
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

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
            <Wand2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            AI Create
          </h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Generate professional assets tailored to your creative field. From LUTs and presets to templates and components - powered by advanced AI.
        </p>
      </div>

      <Tabs defaultValue="generate" className="space-y-8">
        <TabsList className="grid w-full max-w-[600px] grid-cols-3 mx-auto">
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <Wand2 className="w-4 h-4" />
            Generate Assets
          </TabsTrigger>
          <TabsTrigger value="library" className="flex items-center gap-2">
            <Library className="w-4 h-4" />
            Asset Library
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings2 className="w-4 h-4" />
            Advanced Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold mb-2">Select Your Creative Field</h2>
            <p className="text-gray-600">Choose your area of expertise to get field-specific AI assistance</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CREATIVE_FIELDS.map((field) => {
              const Icon = field.icon
              return (
                <Card 
                  key={field.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedField === field.id ? 'border-purple-500 shadow-purple-100' : ''
                  }`}
                  onClick={() => setSelectedField(field.id)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Icon className="w-6 h-6 text-purple-600" />
                      </div>
                      <CardTitle>{field.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{field.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="library" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Asset Library</CardTitle>
              <CardDescription>Browse and manage your generated assets</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {libraryItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{item.title}</h3>
                        <p className="text-sm text-gray-500">{item.type} • {item.timestamp}</p>
                      </div>
                      <Button variant="outline" size="sm">Download</Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>Configure your AI generation preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enhanced Quality</Label>
                  <p className="text-sm text-gray-500">Generate higher quality assets (may take longer)</p>
                </div>
                <Switch
                  checked={settings.enhancedQuality}
                  onCheckedChange={(checked) => setSettings({ ...settings, enhancedQuality: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto Save</Label>
                  <p className="text-sm text-gray-500">Automatically save generated assets to library</p>
                </div>
                <Switch
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoSave: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Real-time Preview</Label>
                  <p className="text-sm text-gray-500">See generation results in real-time (Beta)</p>
                </div>
                <Switch
                  checked={settings.realTimePreview}
                  onCheckedChange={(checked) => setSettings({ ...settings, realTimePreview: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}