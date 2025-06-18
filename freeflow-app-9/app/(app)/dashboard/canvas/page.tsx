'use client'

import React from 'react'
import { RealTimeCanvasCollaboration } from '@/components/collaboration/real-time-canvas-collaboration'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Palette, 
  Users, 
  Sparkles, 
  GitBranch, 
  Eye, 
  Download,
  Share2,
  Layers,
  MousePointer,
  Square,
  Circle,
  Type,
  Move,
  Undo,
  Redo,
  Grid,
  Zap,
  Clock,
  Star
} from 'lucide-react'

// Mock current user for demo
const currentUser = {
  id: 'user-1',
  name: 'Current User',
  email: 'user@example.com',
  avatar: '/avatars/current-user.jpg',
  color: '#6366f1'
}

export default function CanvasPage() {
  const handleSave = (objects: any[]) => {
    console.log('Canvas saved:', objects)
    // Handle save logic here
  }

  const handleShare = (shareData: any) => {
    console.log('Sharing canvas:', shareData)
    // Handle sharing logic here
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Palette className="h-8 w-8" />
              </div>
              Real-Time Canvas Collaboration
            </h1>
            <p className="text-xl text-white/90 mb-4">
              Figma-level design collaboration with live cursors, vector tools & component libraries
            </p>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <Users className="h-3 w-3 mr-1" />
                Live Collaboration
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <GitBranch className="h-3 w-3 mr-1" />
                Version Control
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <Sparkles className="h-3 w-3 mr-1" />
                A+++ Figma-Level
              </Badge>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-center">
                <div className="text-2xl font-bold">156</div>
                <div className="text-sm text-white/80">Components</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">3</div>
                <div className="text-sm text-white/80">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">42</div>
                <div className="text-sm text-white/80">Versions</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                <Eye className="h-4 w-4 mr-2" />
                View Mode
              </Button>
              <Button variant="secondary" size="sm" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                <GitBranch className="h-4 w-4 mr-2" />
                Version History
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tools Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50 hover:shadow-lg transition-all duration-200 cursor-pointer">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 bg-blue-500 text-white rounded-lg flex items-center justify-center mx-auto mb-2">
              <MousePointer className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-gray-900 text-sm">Select</h3>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50 hover:shadow-lg transition-all duration-200 cursor-pointer">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 bg-green-500 text-white rounded-lg flex items-center justify-center mx-auto mb-2">
              <Square className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-gray-900 text-sm">Rectangle</h3>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200/50 hover:shadow-lg transition-all duration-200 cursor-pointer">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 bg-orange-500 text-white rounded-lg flex items-center justify-center mx-auto mb-2">
              <Circle className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-gray-900 text-sm">Circle</h3>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/50 hover:shadow-lg transition-all duration-200 cursor-pointer">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 bg-purple-500 text-white rounded-lg flex items-center justify-center mx-auto mb-2">
              <Type className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-gray-900 text-sm">Text</h3>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200/50 hover:shadow-lg transition-all duration-200 cursor-pointer">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 bg-cyan-500 text-white rounded-lg flex items-center justify-center mx-auto mb-2">
              <Move className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-gray-900 text-sm">Move</h3>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200/50 hover:shadow-lg transition-all duration-200 cursor-pointer">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 bg-rose-500 text-white rounded-lg flex items-center justify-center mx-auto mb-2">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-gray-900 text-sm">Components</h3>
          </CardContent>
        </Card>
      </div>

      {/* Main Canvas Interface */}
      <Tabs defaultValue="canvas" className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="canvas" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Canvas
          </TabsTrigger>
          <TabsTrigger value="components" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Components
          </TabsTrigger>
          <TabsTrigger value="versions" className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Versions
          </TabsTrigger>
          <TabsTrigger value="collaborate" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Collaborate
          </TabsTrigger>
        </TabsList>

        <TabsContent value="canvas" className="mt-6">
          <RealTimeCanvasCollaboration
            projectId="current-project"
            currentUser={currentUser}
            onSave={handleSave}
            onShare={handleShare}
          />
        </TabsContent>

        <TabsContent value="components" className="mt-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Component Library */}
            <div className="col-span-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-blue-600" />
                    Component Library
                  </CardTitle>
                  <CardDescription>
                    Reusable design components for faster workflow
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Categories */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-700">Categories</h4>
                    {['Buttons', 'Cards', 'Forms', 'Navigation', 'Icons', 'Layouts'].map(category => (
                      <div
                        key={category}
                        className="p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <span className="text-sm">{category}</span>
                      </div>
                    ))}
                  </div>

                  {/* Featured Components */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-gray-700">Featured</h4>
                    {[
                      { name: 'Primary Button', category: 'Buttons', uses: 247 },
                      { name: 'Hero Card', category: 'Cards', uses: 156 },
                      { name: 'Input Field', category: 'Forms', uses: 189 },
                      { name: 'Navigation Bar', category: 'Navigation', uses: 78 }
                    ].map(component => (
                      <div
                        key={component.name}
                        className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-sm">{component.name}</span>
                          <Star className="h-4 w-4 text-yellow-500" />
                        </div>
                        <div className="text-xs text-gray-500">{component.category}</div>
                        <div className="text-xs text-gray-500 mt-1">{component.uses} uses</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Component Preview */}
            <div className="col-span-8">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Component Preview</CardTitle>
                      <CardDescription>
                        Preview and customize components before adding to canvas
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                      <Button size="sm">
                        <Palette className="h-4 w-4 mr-2" />
                        Add to Canvas
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 rounded-lg p-8 text-center min-h-[300px] flex items-center justify-center">
                    <div>
                      <Layers className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Select a Component</h3>
                      <p className="text-gray-600">
                        Choose a component from the library to preview and customize
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="versions" className="mt-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Version History */}
            <div className="col-span-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="h-5 w-5 text-green-600" />
                    Version History
                  </CardTitle>
                  <CardDescription>
                    Track changes and restore previous versions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { id: 'v1.4', name: 'Latest Version', timestamp: '2 minutes ago', author: 'You', current: true },
                    { id: 'v1.3', name: 'Added navigation', timestamp: '1 hour ago', author: 'Sarah Chen', current: false },
                    { id: 'v1.2', name: 'Updated colors', timestamp: '3 hours ago', author: 'Mike Johnson', current: false },
                    { id: 'v1.1', name: 'Initial layout', timestamp: '1 day ago', author: 'You', current: false },
                    { id: 'v1.0', name: 'Project start', timestamp: '2 days ago', author: 'You', current: false }
                  ].map(version => (
                    <div
                      key={version.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        version.current 
                          ? 'bg-green-50 border-green-200' 
                          : 'hover:bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-medium text-sm">{version.name}</span>
                          {version.current && (
                            <Badge variant="secondary" className="ml-2 text-xs">Current</Badge>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">{version.id}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {version.timestamp} • {version.author}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Version Comparison */}
            <div className="col-span-8">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Version Comparison</CardTitle>
                      <CardDescription>
                        Compare changes between different versions
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Undo className="h-4 w-4 mr-2" />
                        Restore
                      </Button>
                      <Button size="sm">
                        <GitBranch className="h-4 w-4 mr-2" />
                        Create Branch
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 rounded-lg p-8 text-center min-h-[300px] flex items-center justify-center">
                    <div>
                      <GitBranch className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Select Versions to Compare</h3>
                      <p className="text-gray-600">
                        Choose two versions to see the differences side by side
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="collaborate" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Live Collaborators */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Live Collaborators
                </CardTitle>
                <CardDescription>
                  Currently active users working on this canvas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: 'You', avatar: '/avatars/current-user.jpg', status: 'active', tool: 'Rectangle' },
                  { name: 'Sarah Chen', avatar: '/avatars/sarah-chen.jpg', status: 'active', tool: 'Text' },
                  { name: 'Mike Johnson', avatar: '/avatars/mike.jpg', status: 'viewing', tool: 'Select' }
                ].map(user => (
                  <div key={user.name} className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                        user.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-sm">{user.name}</span>
                      <div className="text-xs text-gray-500">Using {user.tool} tool</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Sharing & Permissions */}
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-purple-600" />
                  Sharing & Permissions
                </CardTitle>
                <CardDescription>
                  Manage access and collaboration settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Canvas Visibility</label>
                  <select className="w-full p-2 border rounded-lg text-sm">
                    <option>Private - Only you can access</option>
                    <option>Team - Team members can view</option>
                    <option>Public - Anyone with link can view</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Default Permission</label>
                  <select className="w-full p-2 border rounded-lg text-sm">
                    <option>View only</option>
                    <option>Can comment</option>
                    <option>Can edit</option>
                  </select>
                </div>

                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  <Share2 className="h-4 w-4 mr-2" />
                  Generate Share Link
                </Button>
              </CardContent>
            </Card>

            {/* Real-time Activity */}
            <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-emerald-600" />
                  Real-time Activity
                </CardTitle>
                <CardDescription>
                  Live updates from collaborators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { user: 'Sarah Chen', action: 'Added text element', time: '2 min ago' },
                  { user: 'Mike Johnson', action: 'Updated component color', time: '5 min ago' },
                  { user: 'You', action: 'Created new rectangle', time: '8 min ago' },
                  { user: 'Sarah Chen', action: 'Left a comment', time: '12 min ago' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm">
                        <span className="font-medium">{activity.user}</span> {activity.action}
                      </div>
                      <div className="text-xs text-gray-500">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 