"use client"

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { 
  ImagePlus,
  Library,
  Settings,
  Upload,
  Download,
  Eye,
  Trash2,
  Loader2,
  Sparkles,
  Sliders,
  Image as ImageIcon,
  Zap,
  Gauge,
  Palette,
  Maximize2,
  RefreshCw,
  CheckCircle
} from 'lucide-react'

interface Asset {
  id: string
  name: string
  type: string
  url: string
  createdAt: string
  status: 'ready' | 'processing' | 'failed'
}

interface AICreateTabsProps {
  onGenerate?: (prompt: string, settings: any) => Promise<void>
  onUpload?: (file: File) => Promise<void>
  onExport?: (assets: string[]) => Promise<void>
  onDelete?: (assetId: string) => Promise<void>
}

export function AICreateTabs({ onGenerate, onUpload, onExport, onDelete }: AICreateTabsProps) {
  const [activeTab, setActiveTab] = useState('generate')
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [assets, setAssets] = useState<Asset[]>([])
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])
  
  // Settings state
  const [quality, setQuality] = useState(75)
  const [enhancementOptions, setEnhancementOptions] = useState({
    autoEnhance: true,
    removeBackground: false,
    upscale: false
  })
  const [realTimeFeatures, setRealTimeFeatures] = useState({
    preview: true,
    autoSave: true,
    collaboration: false
  })

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newAsset: Asset = {
        id: Date.now().toString(),
        name: `Generated Asset ${assets.length + 1}`,
        type: 'image',
        url: '/placeholder-image.jpg',
        createdAt: new Date().toISOString(),
        status: 'ready'
      }
      
      setAssets(prev => [newAsset, ...prev])
      setPrompt('')
    } catch (error) {
      console.error('Generation failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAssetSelection = (assetId: string) => {
    setSelectedAssets(prev => 
      prev.includes(assetId)
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    )
  }

  const handleExportAll = async () => {
    if (!selectedAssets.length) return
    
    setIsLoading(true)
    try {
      await onExport?.(selectedAssets)
      setSelectedAssets([])
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="generate" data-testid="generate-assets-tab">
          <ImagePlus className="w-4 h-4 mr-2" />
          Generate Assets
        </TabsTrigger>
        <TabsTrigger value="library" data-testid="asset-library-tab">
          <Library className="w-4 h-4 mr-2" />
          Asset Library
        </TabsTrigger>
        <TabsTrigger value="settings" data-testid="settings-tab">
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </TabsTrigger>
      </TabsList>

      <TabsContent value="generate" className="space-y-4">
        <Card>
          <CardContent className="p-4 space-y-4">
            <Textarea
              placeholder="Describe the asset you want to generate..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px]"
              data-testid="generate-input"
            />
            <div className="flex justify-end gap-2">
              <Button
                onClick={handleGenerate}
                disabled={isLoading || !prompt.trim()}
                data-testid="generate-button"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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

        <ScrollArea className="h-[400px]">
          {assets.map((asset) => (
            <Card key={asset.id} className="mb-4">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">{asset.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {asset.status === 'processing' && (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    )}
                    {asset.status === 'ready' && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    <span className="text-sm text-muted-foreground">
                      {new Date(asset.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <div className="aspect-video bg-gray-100 rounded-lg mb-4">
                  {/* Asset preview would go here */}
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" data-testid="preview-button">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" data-testid="download-button">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" data-testid="delete-button">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </ScrollArea>
      </TabsContent>

      <TabsContent value="library" className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4 mb-6">
              <Input
                placeholder="Search assets..."
                className="flex-1"
                data-testid="library-search"
              />
              <Button variant="outline" data-testid="upload-button">
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
              <Button
                onClick={handleExportAll}
                disabled={!selectedAssets.length}
                data-testid="export-all-button"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Selected
              </Button>
            </div>

            <ScrollArea className="h-[400px]">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {assets.map((asset) => (
                  <Card
                    key={asset.id}
                    className={`relative cursor-pointer transition-all ${
                      selectedAssets.includes(asset.id) ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleAssetSelection(asset.id)}
                  >
                    <CardContent className="p-2">
                      <div className="aspect-square bg-gray-100 rounded-lg mb-2">
                        {/* Asset thumbnail would go here */}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm truncate">{asset.name}</span>
                        {selectedAssets.includes(asset.id) && (
                          <CheckCircle className="w-4 h-4 text-primary" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="settings" className="space-y-4">
        <Card>
          <CardContent className="p-4 space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Gauge className="w-5 h-5" />
                Quality & Performance
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Output Quality</Label>
                    <span className="text-sm text-muted-foreground">{quality}%</span>
                  </div>
                  <Slider
                    value={[quality]}
                    onValueChange={([value]) => setQuality(value)}
                    max={100}
                    step={1}
                    data-testid="quality-slider"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Enhancement Options
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-enhance">Auto-enhance</Label>
                  <Switch
                    id="auto-enhance"
                    checked={enhancementOptions.autoEnhance}
                    onCheckedChange={(checked) => 
                      setEnhancementOptions(prev => ({ ...prev, autoEnhance: checked }))
                    }
                    data-testid="auto-enhance-toggle"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="remove-bg">Remove Background</Label>
                  <Switch
                    id="remove-bg"
                    checked={enhancementOptions.removeBackground}
                    onCheckedChange={(checked) => 
                      setEnhancementOptions(prev => ({ ...prev, removeBackground: checked }))
                    }
                    data-testid="remove-bg-toggle"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="upscale">Upscale Resolution</Label>
                  <Switch
                    id="upscale"
                    checked={enhancementOptions.upscale}
                    onCheckedChange={(checked) => 
                      setEnhancementOptions(prev => ({ ...prev, upscale: checked }))
                    }
                    data-testid="upscale-toggle"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Real-time Features
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="preview">Live Preview</Label>
                  <Switch
                    id="preview"
                    checked={realTimeFeatures.preview}
                    onCheckedChange={(checked) => 
                      setRealTimeFeatures(prev => ({ ...prev, preview: checked }))
                    }
                    data-testid="preview-toggle"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-save">Auto-save</Label>
                  <Switch
                    id="auto-save"
                    checked={realTimeFeatures.autoSave}
                    onCheckedChange={(checked) => 
                      setRealTimeFeatures(prev => ({ ...prev, autoSave: checked }))
                    }
                    data-testid="auto-save-toggle"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="collab">Real-time Collaboration</Label>
                  <Switch
                    id="collab"
                    checked={realTimeFeatures.collaboration}
                    onCheckedChange={(checked) => 
                      setRealTimeFeatures(prev => ({ ...prev, collaboration: checked }))
                    }
                    data-testid="collab-toggle"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
} 