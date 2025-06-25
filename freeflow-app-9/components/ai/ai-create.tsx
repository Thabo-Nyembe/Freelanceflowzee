"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { 
  Sparkles, 
  Library, 
  Settings, 
  Image, 
  FileText, 
  Code, 
  Music, 
  Video,
  Sliders,
  Save,
  Download,
  Share2,
  WandSparkles,
  Camera,
  Palette
} from 'lucide-react'
import { SupabaseClient } from '@supabase/supabase-js'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

interface Asset {
  id: string
  type: string
  name: string
  preview: string
  created_at: string
}

interface AICreateProps {
  supabase: SupabaseClient
}

interface CreativeField {
  id: string
  name: string
  icon: React.ElementType
  assetTypes: number
}

const creativeFields: CreativeField[] = [
  { id: 'photography', name: 'Photography', icon: Camera, assetTypes: 6 },
  { id: 'videography', name: 'Videography', icon: Video, assetTypes: 6 },
  { id: 'graphic-design', name: 'Graphic Design', icon: Palette, assetTypes: 6 },
  { id: 'music', name: 'Music Production', icon: Music, assetTypes: 6 },
  { id: 'web', name: 'Web Development', icon: Code, assetTypes: 6 },
  { id: 'writing', name: 'Content Writing', icon: FileText, assetTypes: 6 },
]

export function AICreate({ supabase }: AICreateProps) {
  const [activeTab, setActiveTab] = useState('generate')
  const [generating, setGenerating] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [assetType, setAssetType] = useState('text')
  const [quality, setQuality] = useState('standard')
  const [creativity, setCreativity] = useState('balanced')
  const [model, setModel] = useState('gpt-4')
  const [library, setLibrary] = useState<Asset[]>([
    {
      id: '1',
      type: 'image',
      name: 'Generated Artwork',
      preview: '/images/project-mockup-1.jpg',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      type: 'code',
      name: 'React Component',
      preview: 'function MyComponent() { ... }',
      created_at: new Date().toISOString()
    }
  ])
  const [selectedField, setSelectedField] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [useCustomAPI, setUseCustomAPI] = useState(false)
  const [selectedModel, setSelectedModel] = useState('standard')

  const handleGenerate = async () => {
    if (!prompt) return

    setGenerating(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('ai_generations')
        .insert([
          {
            user_id: user.id,
            prompt,
            asset_type: assetType,
            quality,
            creativity,
            model,
            status: 'processing'
          }
        ])
        .select()
        .single()

      if (error) throw error

      // Simulate AI generation (replace with actual AI service call)
      await new Promise(resolve => setTimeout(resolve, 2000))

      await supabase
        .from('ai_generations')
        .update({ 
          status: 'completed',
          result: 'Generated content would appear here'
        })
        .eq('id', data.id)

    } catch (error) {
      console.error('Error generating content:', error)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
            <WandSparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            AI Create
          </h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Generate professional assets tailored to your creative field. From LUTs and presets to templates and components - powered by advanced AI.
        </p>
      </div>

      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Generate Assets
          </TabsTrigger>
          <TabsTrigger value="library" className="flex items-center gap-2">
            <Library className="h-4 w-4" />
            Asset Library
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Advanced Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Select Your Creative Field
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {creativeFields.map((field) => (
                  <Card 
                    key={field.id}
                    className={`cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                      selectedField === field.id ? 'ring-2 ring-purple-500 bg-purple-50/50' : 'hover:shadow-lg'
                    }`}
                    onClick={() => setSelectedField(field.id)}
                  >
                    <CardContent className="p-6 text-center space-y-3">
                      <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center`}>
                        <field.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-semibold text-lg">{field.name}</h3>
                      <p className="text-sm text-gray-600">
                        {field.assetTypes} asset types available
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedField && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5 text-purple-600" />
                  Choose Asset Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: 'luts', name: 'Professional LUTs', description: 'Cinematic color grading presets' },
                    { id: 'presets', name: 'Lightroom Presets', description: 'Professional photo editing presets' },
                    { id: 'actions', name: 'Photoshop Actions', description: 'Automated photo effects and workflows' },
                    { id: 'overlays', name: 'Photo Overlays', description: 'Light leaks, textures, bokeh effects' },
                    { id: 'templates', name: 'Portfolio Templates', description: 'Professional portfolio layouts' },
                    { id: 'filters', name: 'AI Filters', description: 'Intelligent enhancement filters' }
                  ].map((type) => (
                    <Card
                      key={type.id}
                      className={`cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                        assetType === type.id ? 'ring-2 ring-purple-500 bg-purple-50/50' : 'hover:shadow-lg'
                      }`}
                      onClick={() => setAssetType(type.id)}
                    >
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-lg mb-2">{type.name}</h4>
                        <p className="text-sm text-gray-600">{type.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {selectedField && assetType && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-purple-600" />
                  Generation Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Prompt</label>
                    <Textarea
                      placeholder="Describe what you want to generate..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Quality</label>
                      <Select value={quality} onValueChange={setQuality}>
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Select quality" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Creativity</label>
                      <Select value={creativity} onValueChange={setCreativity}>
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Select creativity level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="conservative">Conservative</SelectItem>
                          <SelectItem value="balanced">Balanced</SelectItem>
                          <SelectItem value="experimental">Experimental</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" className="glass-button">
                    <Save className="w-4 h-4 mr-2" />
                    Save Preset
                  </Button>
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white" onClick={handleGenerate}>
                    {generating ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="library" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Library className="w-5 h-5 text-purple-600" />
                Asset Library
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {library.map((asset) => (
                  <Card key={asset.id} className="glass-card">
                    <CardContent className="p-4">
                      <div className="aspect-video rounded-lg bg-gray-100 mb-3">
                        {asset.type === 'image' ? (
                          <img
                            src={asset.preview}
                            alt={asset.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Code className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{asset.name}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(asset.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="icon" variant="ghost">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost">
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-600" />
                Advanced Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">AI Model</label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select AI model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4">GPT-4 (Premium)</SelectItem>
                      <SelectItem value="gpt-3.5">GPT-3.5 (Standard)</SelectItem>
                      <SelectItem value="custom">Custom Model</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Use Custom API</label>
                    <p className="text-sm text-gray-600">
                      Use your own API key for higher rate limits
                    </p>
                  </div>
                  <Switch
                    checked={useCustomAPI}
                    onCheckedChange={setUseCustomAPI}
                  />
                </div>

                {useCustomAPI && (
                  <div>
                    <label className="text-sm font-medium">API Key</label>
                    <Input
                      type="password"
                      placeholder="Enter your API key"
                      className="mt-1.5"
                    />
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium">Model Temperature</label>
                  <div className="pt-2">
                    <Slider
                      defaultValue={[0.7]}
                      max={1}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-1.5">
                    Controls randomness in the generation process
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Asset Preview</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              Preview will appear here
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Close
              </Button>
              <Button>Download</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 