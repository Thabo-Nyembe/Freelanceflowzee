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
    <div className="space-y-6">
      <Tabs defaultValue="generate" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="generate">Generate Assets</TabsTrigger>
          <TabsTrigger value="library">Asset Library</TabsTrigger>
          <TabsTrigger value="settings">Advanced Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4">
          <div className="grid gap-4">
            <h3 className="text-lg font-medium">Select Your Creative Field</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {creativeFields.map((field) => (
                <Card 
                  key={field.id}
                  className={`p-4 cursor-pointer hover:border-primary transition-colors ${
                    selectedField === field.id ? 'border-primary' : ''
                  }`}
                  onClick={() => setSelectedField(field.id)}
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    <field.icon className="h-8 w-8" />
                    <h4 className="font-medium">{field.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {field.assetTypes} asset types available
                    </p>
                  </div>
                </Card>
              ))}
            </div>

            {selectedField && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Generation Parameters</h3>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label>Model Selection</Label>
                    <div className="flex space-x-2">
                      <Button
                        variant={selectedModel === 'standard' ? 'default' : 'outline'}
                        onClick={() => setSelectedModel('standard')}
                      >
                        Standard
                      </Button>
                      <Button
                        variant={selectedModel === 'professional' ? 'default' : 'outline'}
                        onClick={() => setSelectedModel('professional')}
                      >
                        Professional
                      </Button>
                      <Button
                        variant={selectedModel === 'enterprise' ? 'default' : 'outline'}
                        onClick={() => setSelectedModel('enterprise')}
                      >
                        Enterprise
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Quality Level</Label>
                    <Slider defaultValue={[75]} max={100} step={1} />
                  </div>

                  <div className="space-y-2">
                    <Label>Custom API Key</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={useCustomAPI}
                        onCheckedChange={setUseCustomAPI}
                      />
                      <span className="text-sm text-muted-foreground">
                        Use custom API key
                      </span>
                    </div>
                  </div>

                  {useCustomAPI && (
                    <div className="space-y-2">
                      <Label>API Key</Label>
                      <Input type="password" placeholder="Enter your API key" />
                    </div>
                  )}

                  <Button size="lg" className="w-full" onClick={handleGenerate}>
                    Generate Asset
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="library" className="space-y-4">
          <div className="grid gap-4">
            <h3 className="text-lg font-medium">Your Generated Assets</h3>
            <p className="text-muted-foreground">No assets generated yet. Start by creating your first asset!</p>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid gap-4">
            <h3 className="text-lg font-medium">Advanced Settings</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Default Model</Label>
                <select className="w-full p-2 border rounded">
                  <option value="standard">Standard</option>
                  <option value="professional">Professional</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>API Configuration</Label>
                <Input placeholder="API Endpoint" />
              </div>

              <div className="space-y-2">
                <Label>Performance Settings</Label>
                <div className="flex items-center space-x-2">
                  <Switch defaultChecked />
                  <span className="text-sm text-muted-foreground">
                    Enable high-performance mode
                  </span>
                </div>
              </div>
            </div>
          </div>
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