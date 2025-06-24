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
  WandSparkles
} from 'lucide-react'
import { SupabaseClient } from '@supabase/supabase-js'

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

export function AICreate({ supabase }: AICreateProps) {
  const [activeTab, setActiveTab] = useState('create')
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <WandSparkles className="w-6 h-6 text-primary" />
          AI Create
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create" data-testid="create-tab">
              <WandSparkles className="w-4 h-4 mr-2" />
              Create
            </TabsTrigger>
            <TabsTrigger value="library" data-testid="library-tab">
              <Library className="w-4 h-4 mr-2" />
              Library
            </TabsTrigger>
            <TabsTrigger value="settings" data-testid="settings-tab">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4 p-4">
            <div className="space-y-4">
              <div>
                <Select value={assetType} onValueChange={setAssetType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select asset type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">
                      <FileText className="w-4 h-4 mr-2 inline" />
                      Text
                    </SelectItem>
                    <SelectItem value="image">
                      <Image className="w-4 h-4 mr-2 inline" />
                      Image
                    </SelectItem>
                    <SelectItem value="code">
                      <Code className="w-4 h-4 mr-2 inline" />
                      Code
                    </SelectItem>
                    <SelectItem value="audio">
                      <Music className="w-4 h-4 mr-2 inline" />
                      Audio
                    </SelectItem>
                    <SelectItem value="video">
                      <Video className="w-4 h-4 mr-2 inline" />
                      Video
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select value={quality} onValueChange={setQuality}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Textarea 
                placeholder="Enter your prompt here..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={5}
                data-testid="prompt-input"
              />

              <Button 
                onClick={handleGenerate} 
                disabled={!prompt || generating}
                className="w-full"
                data-testid="generate-btn"
              >
                {generating ? 'Generating...' : 'Generate'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="library" className="space-y-4 p-4">
            <div className="text-center text-muted-foreground">
              Your generated assets will appear here
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 p-4">
            <div className="space-y-4">
              <div>
                <Select value={creativity} onValueChange={setCreativity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Creativity level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conservative">Conservative</SelectItem>
                    <SelectItem value="balanced">Balanced</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="experimental">Experimental</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select AI model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-3.5">GPT-3.5</SelectItem>
                    <SelectItem value="claude">Claude</SelectItem>
                    <SelectItem value="palm">PaLM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 