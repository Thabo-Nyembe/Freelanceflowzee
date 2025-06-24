"use client"

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import {
  Image,
  Code,
  FileText,
  Music,
  Video,
  Settings,
  Library,
  Sparkles,
  Loader2,
  Trash2,
  Download,
  Share2
} from 'lucide-react'
import { aiService, AIGenerationResult } from '@/lib/services/ai-service'

interface AICreateProps {
  // Remove supabase prop since aiService handles its own client
}

export function AICreate({}: AICreateProps) {
  const [assetType, setAssetType] = useState<'image' | 'code' | 'text' | 'audio' | 'video'>('image')
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState('create')
  const [settings, setSettings] = useState({
    creativity: 0.7,
    quality: 'standard' as 'draft' | 'standard' | 'premium',
    model: 'default'
  })
  const [library, setLibrary] = useState<AIGenerationResult[]>([])

  useEffect(() => {
    loadLibrary()
  }, [])

  const loadLibrary = async () => {
    try {
      const assets = await aiService.getGenerationLibrary()
      setLibrary(assets)
    } catch (error) {
      console.error('Error loading library:', error)
    }
  }

  const handleGenerate = async () => {
    if (!prompt) return

    setIsGenerating(true)
    try {
      const result = await aiService.generateAsset(assetType, prompt, settings)
      setLibrary(prev => [result, ...prev])
      setPrompt('')
    } catch (error) {
      console.error('Error generating asset:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="create" className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Create
        </TabsTrigger>
        <TabsTrigger value="library" className="flex items-center gap-2">
          <Library className="h-4 w-4" />
          Library
        </TabsTrigger>
        <TabsTrigger value="settings" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Settings
        </TabsTrigger>
      </TabsList>

      <TabsContent value="create" className="space-y-4">
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <Button
                variant={assetType === 'image' ? 'default' : 'outline'}
                onClick={() => setAssetType('image')}
                className="flex-1"
              >
                <Image className="mr-2 h-4 w-4" />
                Image
              </Button>
              <Button
                variant={assetType === 'code' ? 'default' : 'outline'}
                onClick={() => setAssetType('code')}
                className="flex-1"
              >
                <Code className="mr-2 h-4 w-4" />
                Code
              </Button>
              <Button
                variant={assetType === 'text' ? 'default' : 'outline'}
                onClick={() => setAssetType('text')}
                className="flex-1"
              >
                <FileText className="mr-2 h-4 w-4" />
                Text
              </Button>
              <Button
                variant={assetType === 'audio' ? 'default' : 'outline'}
                onClick={() => setAssetType('audio')}
                className="flex-1"
              >
                <Music className="mr-2 h-4 w-4" />
                Audio
              </Button>
              <Button
                variant={assetType === 'video' ? 'default' : 'outline'}
                onClick={() => setAssetType('video')}
                className="flex-1"
              >
                <Video className="mr-2 h-4 w-4" />
                Video
              </Button>
            </div>

            <Textarea
              placeholder="Describe what you want to create..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
            />

            <div className="flex gap-4">
              <Button
                onClick={handleGenerate}
                disabled={!prompt || isGenerating}
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="library" className="space-y-4">
        {library.map(asset => (
          <Card key={asset.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {asset.type === 'image' && <Image className="h-4 w-4" />}
                {asset.type === 'code' && <Code className="h-4 w-4" />}
                {asset.type === 'text' && <FileText className="h-4 w-4" />}
                {asset.type === 'audio' && <Music className="h-4 w-4" />}
                {asset.type === 'video' && <Video className="h-4 w-4" />}
                <span className="font-medium">{asset.type}</span>
              </div>
              <Badge variant={
                asset.status === 'complete' ? 'default' :
                asset.status === 'generating' ? 'secondary' :
                'destructive'
              }>
                {asset.status}
              </Badge>
            </div>
            {asset.status === 'complete' && (
              <div className="mt-4">
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button size="sm" variant="outline">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-500">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="settings" className="space-y-4">
        <Card className="p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Quality</h3>
              <Select
                value={settings.quality}
                onValueChange={(value: 'draft' | 'standard' | 'premium') =>
                  setSettings(prev => ({ ...prev, quality: value }))
                }
              >
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

            <div className="space-y-2">
              <h3 className="text-lg font-medium">Creativity</h3>
              <div className="flex items-center gap-4">
                <Slider
                  value={[settings.creativity]}
                  min={0}
                  max={1}
                  step={0.1}
                  onValueChange={([value]) =>
                    setSettings(prev => ({ ...prev, creativity: value }))
                  }
                />
                <span className="w-12 text-right">{settings.creativity}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium">Model</h3>
              <Select
                value={settings.model}
                onValueChange={(value) =>
                  setSettings(prev => ({ ...prev, model: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="gpt4">GPT-4</SelectItem>
                  <SelectItem value="claude">Claude</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  )
} 