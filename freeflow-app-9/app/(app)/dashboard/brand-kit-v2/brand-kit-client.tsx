'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import {
  Palette, Type, Image, FileText, Download, Upload, Copy, Check,
  Pencil, Eye, Grid3X3, MoreHorizontal, Plus, Folder, Link2,
  Sparkles, Star, Shield, Globe, Layers, Wand2
} from 'lucide-react'

const brandColors = [
  { name: 'Primary', hex: '#6366F1', rgb: 'rgb(99, 102, 241)', usage: 'Main brand color, CTAs' },
  { name: 'Secondary', hex: '#8B5CF6', rgb: 'rgb(139, 92, 246)', usage: 'Accents, highlights' },
  { name: 'Accent', hex: '#EC4899', rgb: 'rgb(236, 72, 153)', usage: 'Special elements' },
  { name: 'Success', hex: '#10B981', rgb: 'rgb(16, 185, 129)', usage: 'Success states' },
  { name: 'Warning', hex: '#F59E0B', rgb: 'rgb(245, 158, 11)', usage: 'Warning states' },
  { name: 'Error', hex: '#EF4444', rgb: 'rgb(239, 68, 68)', usage: 'Error states' },
]

const fonts = [
  { name: 'Inter', category: 'Primary', weight: '400-700', usage: 'Body text, UI elements' },
  { name: 'Cal Sans', category: 'Display', weight: '600-700', usage: 'Headlines, hero text' },
  { name: 'JetBrains Mono', category: 'Monospace', weight: '400-500', usage: 'Code, technical content' },
]

const assets = [
  { id: 1, name: 'Logo Primary', type: 'svg', size: '12 KB', category: 'Logos', updated: '2024-01-10' },
  { id: 2, name: 'Logo White', type: 'svg', size: '12 KB', category: 'Logos', updated: '2024-01-10' },
  { id: 3, name: 'Logo Mark', type: 'svg', size: '8 KB', category: 'Logos', updated: '2024-01-10' },
  { id: 4, name: 'Favicon', type: 'ico', size: '4 KB', category: 'Icons', updated: '2024-01-08' },
  { id: 5, name: 'Social Banner', type: 'png', size: '245 KB', category: 'Social', updated: '2024-01-05' },
  { id: 6, name: 'Email Header', type: 'png', size: '128 KB', category: 'Email', updated: '2024-01-03' },
]

const guidelines = [
  { title: 'Logo Usage', description: 'Minimum size, clear space, and placement rules', status: 'published' },
  { title: 'Color Guidelines', description: 'When and how to use brand colors', status: 'published' },
  { title: 'Typography', description: 'Font pairing and hierarchy guidelines', status: 'published' },
  { title: 'Voice & Tone', description: 'How we communicate with our audience', status: 'draft' },
  { title: 'Photography Style', description: 'Image selection and editing guidelines', status: 'draft' },
]

export default function BrandKitClient() {
  const [activeTab, setActiveTab] = useState('colors')
  const [copiedColor, setCopiedColor] = useState<string | null>(null)

  const copyToClipboard = (text: string, colorName: string) => {
    navigator.clipboard.writeText(text)
    setCopiedColor(colorName)
    setTimeout(() => setCopiedColor(null), 2000)
  }

  const insights = [
    { icon: Palette, title: '6 Brand Colors', description: 'Primary palette defined' },
    { icon: Type, title: '3 Font Families', description: 'Typography system' },
    { icon: Image, title: '12 Assets', description: 'Logos and graphics' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Palette className="h-8 w-8 text-primary" />
            Brand Kit
          </h1>
          <p className="text-muted-foreground mt-1">Manage your brand assets and guidelines</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Kit
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Asset
          </Button>
        </div>
      </div>

      <CollapsibleInsightsPanel
        title="Brand Overview"
        insights={insights}
        defaultExpanded={true}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Brand Colors</CardTitle>
                  <CardDescription>Your primary color palette</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate Palette
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {brandColors.map((color) => (
                  <div key={color.name} className="border rounded-lg overflow-hidden">
                    <div
                      className="h-24 w-full"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{color.name}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(color.hex, color.name)}
                        >
                          {copiedColor === color.name ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">HEX</span>
                          <code className="bg-muted px-2 py-0.5 rounded">{color.hex}</code>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">RGB</span>
                          <code className="bg-muted px-2 py-0.5 rounded text-xs">{color.rgb}</code>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{color.usage}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Color Accessibility</CardTitle>
              <CardDescription>WCAG contrast ratios for text combinations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#6366F1', color: 'white' }}>
                  <p className="font-medium">Primary on White</p>
                  <Badge className="mt-2 bg-green-500">AAA Pass</Badge>
                </div>
                <div className="p-4 rounded-lg bg-white border" style={{ color: '#6366F1' }}>
                  <p className="font-medium">White on Primary</p>
                  <Badge className="mt-2 bg-green-500">AAA Pass</Badge>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#8B5CF6', color: 'white' }}>
                  <p className="font-medium">Secondary on White</p>
                  <Badge className="mt-2 bg-green-500">AA Pass</Badge>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#EC4899', color: 'white' }}>
                  <p className="font-medium">Accent on White</p>
                  <Badge className="mt-2 bg-green-500">AA Pass</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="typography" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Font Families</CardTitle>
              <CardDescription>Typography system for your brand</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {fonts.map((font) => (
                <div key={font.name} className="border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium">{font.name}</h4>
                      <p className="text-sm text-muted-foreground">{font.category} · {font.weight}</p>
                    </div>
                    <Badge variant="outline">{font.usage}</Badge>
                  </div>
                  <div className="space-y-2">
                    <p style={{ fontFamily: font.name === 'JetBrains Mono' ? 'monospace' : 'inherit' }} className="text-4xl">
                      Aa Bb Cc Dd Ee
                    </p>
                    <p style={{ fontFamily: font.name === 'JetBrains Mono' ? 'monospace' : 'inherit' }} className="text-lg text-muted-foreground">
                      The quick brown fox jumps over the lazy dog. 0123456789
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Type Scale</CardTitle>
              <CardDescription>Consistent sizing hierarchy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Display', size: '4.5rem', weight: '700' },
                  { name: 'H1', size: '3rem', weight: '700' },
                  { name: 'H2', size: '2.25rem', weight: '600' },
                  { name: 'H3', size: '1.875rem', weight: '600' },
                  { name: 'H4', size: '1.5rem', weight: '600' },
                  { name: 'Body Large', size: '1.125rem', weight: '400' },
                  { name: 'Body', size: '1rem', weight: '400' },
                  { name: 'Small', size: '0.875rem', weight: '400' },
                ].map((level) => (
                  <div key={level.name} className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground w-24">{level.name}</span>
                      <span style={{ fontSize: level.size, fontWeight: level.weight }}>Sample Text</span>
                    </div>
                    <code className="text-sm bg-muted px-2 py-1 rounded">{level.size}</code>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assets" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Brand Assets</CardTitle>
                  <CardDescription>Logos, icons, and graphics</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Grid3X3 className="h-4 w-4 mr-2" />
                    Grid View
                  </Button>
                  <Button size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assets.map((asset) => (
                  <div key={asset.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-32 bg-muted flex items-center justify-center">
                      <Image className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{asset.name}</h4>
                        <Badge variant="outline">{asset.type.toUpperCase()}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{asset.size}</span>
                        <span>{asset.updated}</span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guidelines" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Brand Guidelines</CardTitle>
                  <CardDescription>Documentation and usage rules</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Guideline
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {guidelines.map((guideline, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{guideline.title}</h4>
                        <p className="text-sm text-muted-foreground">{guideline.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={guideline.status === 'published' ? 'default' : 'secondary'}>
                        {guideline.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
