'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Layers, Plus, Search, Star, Heart, Bell, Settings, User, Download } from 'lucide-react'

export default function ComponentsShowcaseClient() {
  const [progress, setProgress] = useState(65)

  const insights = [
    { icon: Layers, title: '50+', description: 'Components' },
    { icon: Star, title: '4.9', description: 'Average rating' },
    { icon: Download, title: '10k+', description: 'Downloads' },
    { icon: User, title: '500+', description: 'Active users' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Layers className="h-8 w-8 text-primary" />Components Showcase</h1>
          <p className="text-muted-foreground mt-1">Explore UI components and patterns</p>
        </div>
      </div>

      <CollapsibleInsightsPanel title="Component Stats" insights={insights} defaultExpanded={true} />

      <Tabs defaultValue="buttons">
        <TabsList>
          <TabsTrigger value="buttons">Buttons</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="buttons" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Button Variants</CardTitle>
              <CardDescription>Different button styles and states</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button size="sm">Small</Button>
                <Button>Medium</Button>
                <Button size="lg">Large</Button>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button><Plus className="h-4 w-4 mr-2" />With Icon</Button>
                <Button disabled>Disabled</Button>
                <Button className="w-full">Full Width</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cards" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Simple Card</CardTitle>
                <CardDescription>Basic card with header</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This is a simple card component with a title and description.
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50/30">
              <CardHeader>
                <CardTitle>Colored Card</CardTitle>
                <CardDescription>Card with custom styling</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Cards can have custom colors and backgrounds.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  With Icon
                </CardTitle>
                <CardDescription>Card with icon in title</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Icons can enhance card headers for better visual hierarchy.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="forms" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Form Elements</CardTitle>
              <CardDescription>Input fields and controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Text Input</label>
                <Input placeholder="Enter text..." />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Search Input</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search..." className="pl-9" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Select</label>
                <select className="w-full border rounded-md px-3 py-2">
                  <option>Option 1</option>
                  <option>Option 2</option>
                  <option>Option 3</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Progress Bar</label>
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => setProgress(Math.max(0, progress - 10))}>-10</Button>
                    <Button size="sm" onClick={() => setProgress(Math.min(100, progress + 10))}>+10</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Badges</CardTitle>
              <CardDescription>Status indicators and labels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge className="bg-green-100 text-green-700">Success</Badge>
                <Badge className="bg-yellow-100 text-yellow-700">Warning</Badge>
                <Badge className="bg-red-100 text-red-700">Error</Badge>
                <Badge className="bg-blue-100 text-blue-700">Info</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Avatars</CardTitle>
              <CardDescription>User profile pictures and placeholders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <Avatar className="h-10 w-10">
                  <AvatarFallback>SC</AvatarFallback>
                </Avatar>
                <Avatar className="h-8 w-8">
                  <AvatarFallback>MJ</AvatarFallback>
                </Avatar>
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">ED</AvatarFallback>
                </Avatar>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Icons</CardTitle>
              <CardDescription>Icon library examples</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Heart className="h-6 w-6" />
                <Star className="h-6 w-6" />
                <Bell className="h-6 w-6" />
                <Settings className="h-6 w-6" />
                <User className="h-6 w-6" />
                <Download className="h-6 w-6" />
                <Search className="h-6 w-6" />
                <Plus className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
