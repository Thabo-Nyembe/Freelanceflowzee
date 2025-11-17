"use client";

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Brain, 
  Palette, 
  Sparkles, 
  Wand2, 
  Image, 
  Layers, 
  Grid, 
  Plus,
  Settings,
  Share2
} from 'lucide-react'

export default function AIDesignPage() {
  const [activeTab, setActiveTab] = useState<string>('tools')

  // Handlers
  const handleNewProject = () => { console.log('➕ NEW PROJECT'); alert('➕ Create New AI Design Project\n\nChoose project type:\n• Logo Design\n• UI/UX Layout\n• Color Palette\n• Mockup Generator') }
  const handleLaunchTool = (toolId: string, toolName: string) => { console.log('🚀 LAUNCH TOOL:', toolId); alert(`🚀 Launching ${toolName}\n\nInitializing AI design tool...`) }
  const handleGenerateLogo = () => { console.log('🎨 GENERATE LOGO'); alert('🎨 AI Logo Generator\n\nDescribe your brand:\n• Industry\n• Style preferences\n• Color preferences\n• Brand values') }
  const handleGenerateColorScheme = () => { console.log('🎨 COLOR SCHEME'); alert('🎨 AI Color Palette Generator\n\nSelect inspiration:\n• Upload image\n• Describe mood\n• Industry type\n• Brand guidelines') }
  const handleGenerateLayout = () => { console.log('📐 LAYOUT'); alert('📐 AI Layout Generator\n\nSpecify requirements:\n• Page type\n• Content sections\n• Style preference\n• Responsive breakpoints') }
  const handleGenerateMockup = () => { console.log('🖼️ MOCKUP'); alert('🖼️ AI Mockup Generator\n\nComing soon!\n\nCreate product mockups with AI') }
  const handleContinueProject = (projectId: number, projectName: string) => { console.log('▶️ CONTINUE:', projectId); alert(`▶️ Opening Project\n\n${projectName}\n\nLoading design workspace...`) }
  const handleShareProject = (projectId: number) => { console.log('🔗 SHARE:', projectId); alert('🔗 Share Project\n\nGenerate shareable link or export') }
  const handleUseTemplate = (templateId: string, templateName: string) => { console.log('✨ USE TEMPLATE:', templateId); alert(`✨ Using Template\n\n${templateName}\n\nCustomizing with AI...`) }
  const handleExportDesign = (format: 'png' | 'svg' | 'pdf') => { console.log('💾 EXPORT:', format); alert(`💾 Exporting Design\n\nFormat: ${format.toUpperCase()}\n\nPreparing download...`) }
  const handleSaveProject = (projectId: number) => { console.log('💾 SAVE:', projectId); alert('💾 Project Saved\n\nAll changes saved successfully') }
  const handleDeleteProject = (projectId: number) => { console.log('🗑️ DELETE PROJECT:', projectId); confirm('Delete this project?') && alert('✅ Project deleted') }
  const handleDuplicateProject = (projectId: number) => { console.log('📋 DUPLICATE:', projectId); alert('📋 Project Duplicated\n\nCreated copy with all assets') }
  const handleRenameProject = (projectId: number) => { console.log('✏️ RENAME:', projectId); const name = prompt('New project name:'); name && alert(`✅ Renamed to: ${name}`) }
  const handleViewProjectHistory = (projectId: number) => { console.log('📜 HISTORY:', projectId); alert('📜 Project Version History\n\nView and restore previous versions') }
  const handleConfigureAISettings = () => { console.log('⚙️ AI SETTINGS'); alert('⚙️ Configure AI Settings\n\nModel selection\nQuality settings\nStyle preferences\nOutput format') }
  const handleRefreshTemplates = () => { console.log('🔄 REFRESH TEMPLATES'); alert('🔄 Refreshing Templates\n\nLoading latest designs...') }
  const handleFilterTemplates = (category: string) => { console.log('🔍 FILTER:', category); alert(`🔍 Filtering Templates\n\nCategory: ${category}`) }
  const handleDownloadTemplate = (templateId: string) => { console.log('⬇️ DOWNLOAD:', templateId); alert('⬇️ Downloading Template\n\nTemplate files ready') }
  const handleFavoriteTemplate = (templateId: string) => { console.log('⭐ FAVORITE:', templateId); alert('⭐ Added to Favorites') }
  const handlePreviewDesign = (id: string) => { console.log('👁️ PREVIEW:', id); alert('👁️ Design Preview\n\nOpening full preview...') }
  const handleAIEnhance = (projectId: number) => { console.log('✨ AI ENHANCE:', projectId); alert('✨ AI Enhancement\n\nApplying AI improvements...') }
  const handleGenerateBrandKit = () => { console.log('🎨 BRAND KIT'); alert('🎨 Generate Brand Kit\n\nCreating:\n• Logo variations\n• Color palette\n• Typography\n• Brand guidelines') }

  const designTools = [
    {
      id: 'logo-gen',
      name: 'Logo Generator',
      description: 'Create professional logos with AI',
      icon: Sparkles,
      status: 'available',
      category: 'branding'
    },
    {
      id: 'color-palette',
      name: 'Color Palette Generator',
      description: 'Generate harmonious color schemes',
      icon: Palette,
      status: 'available',
      category: 'colors'
    },
    {
      id: 'layout-gen',
      name: 'Layout Generator',
      description: 'AI-powered layout suggestions',
      icon: Grid,
      status: 'available',
      category: 'layout'
    },
    {
      id: 'mockup-gen',
      name: 'Mockup Generator',
      description: 'Create stunning product mockups',
      icon: Image,
      status: 'coming-soon',
      category: 'mockups'
    }
  ]

  const recentProjects = [
    {
      id: 1,
      name: 'Tech Startup Branding',
      type: 'Logo & Identity',
      progress: 85,
      thumbnail: '/placeholder-logo.jpg'
    },
    {
      id: 2,
      name: 'E-commerce Website',
      type: 'UI Design',
      progress: 60,
      thumbnail: '/placeholder-ui.jpg'
    }
  ]

  return (
    <div className="min-h-screen kazi-bg-light dark:kazi-bg-dark p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold kazi-text-dark dark:kazi-text-light mb-2 kazi-headline">
                AI Design Studio
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 kazi-body">
                Create stunning designs with the power of artificial intelligence
              </p>
            </div>
            <Button className="btn-kazi-primary kazi-ripple" onClick={handleNewProject}>
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tools">AI Tools</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="tools" className="space-y-6">
            {/* AI Design Tools */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {designTools.map((tool) => {
                const IconComponent = tool.icon
                return (
                  <Card key={tool.id} className="kazi-card kazi-hover-scale">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <IconComponent className="w-8 h-8 kazi-text-primary" />
                        <Badge 
                          variant={tool.status === 'available' ? 'default' : 'secondary'}
                          className={tool.status === 'available' ? 'bg-green-100 text-green-800' : ''}
                        >
                          {tool.status === 'available' ? 'Available' : 'Coming Soon'}
                        </Badge>
                      </div>
                      <CardTitle className="kazi-headline">{tool.name}</CardTitle>
                      <CardDescription className="kazi-body">{tool.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        className="w-full btn-kazi-primary kazi-ripple"
                        disabled={tool.status !== 'available'}
                        onClick={() => handleLaunchTool(tool.id, tool.name)}
                      >
                        {tool.status === 'available' ? (
                          <>
                            <Wand2 className="w-4 h-4 mr-2" />
                            Launch Tool
                          </>
                        ) : (
                          'Coming Soon'
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Quick Actions */}
            <Card className="kazi-card">
              <CardHeader>
                <CardTitle className="kazi-headline">Quick Actions</CardTitle>
                <CardDescription className="kazi-body">
                  Start designing with these popular workflows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="flex flex-col h-20 items-center justify-center gap-2" onClick={handleGenerateLogo}>
                    <Brain className="w-5 h-5" />
                    <span className="text-xs">Generate Logo</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col h-20 items-center justify-center gap-2" onClick={handleGenerateColorScheme}>
                    <Palette className="w-5 h-5" />
                    <span className="text-xs">Color Scheme</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col h-20 items-center justify-center gap-2" onClick={handleGenerateLayout}>
                    <Layers className="w-5 h-5" />
                    <span className="text-xs">UI Layout</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col h-20 items-center justify-center gap-2" onClick={handleGenerateMockup}>
                    <Image className="w-5 h-5" />
                    <span className="text-xs">Mockup</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <Card className="kazi-card">
              <CardHeader>
                <CardTitle className="kazi-headline">Recent Projects</CardTitle>
                <CardDescription className="kazi-body">
                  Continue working on your AI-generated designs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentProjects.map((project) => (
                    <Card key={project.id} className="kazi-card">
                      <CardContent className="p-4">
                        <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                          <Image className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="font-semibold kazi-text-dark dark:kazi-text-light kazi-body-medium">
                          {project.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 kazi-body">
                          {project.type}
                        </p>
                        <div className="mt-3 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{project.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" className="flex-1" onClick={() => handleContinueProject(project.id, project.name)}>
                            Continue
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleShareProject(project.id)}>
                            <Share2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card className="kazi-card">
              <CardHeader>
                <CardTitle className="kazi-headline">Design Templates</CardTitle>
                <CardDescription className="kazi-body">
                  Start with professionally designed templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      id: '1',
                      name: 'Modern Business Card',
                      category: 'Business',
                      thumbnail: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=300&h=200&fit=crop',
                      downloads: 1234,
                      rating: 4.8
                    },
                    {
                      id: '2',
                      name: 'Social Media Post',
                      category: 'Social',
                      thumbnail: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=300&h=200&fit=crop',
                      downloads: 892,
                      rating: 4.6
                    },
                    {
                      id: '3',
                      name: 'Website Hero Section',
                      category: 'Web',
                      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop',
                      downloads: 567,
                      rating: 4.9
                    },
                    {
                      id: '4',
                      name: 'Brand Logo Design',
                      category: 'Branding',
                      thumbnail: 'https://images.unsplash.com/photo-1559028006-448665bd7c7f?w=300&h=200&fit=crop',
                      downloads: 2341,
                      rating: 4.7
                    },
                    {
                      id: '5',
                      name: 'Presentation Slide',
                      category: 'Presentation',
                      thumbnail: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=300&h=200&fit=crop',
                      downloads: 445,
                      rating: 4.5
                    },
                    {
                      id: '6',
                      name: 'Email Newsletter',
                      category: 'Marketing',
                      thumbnail: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=200&fit=crop',
                      downloads: 678,
                      rating: 4.4
                    }
                  ].map(template => (
                    <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                      <div className="relative">
                        <img 
                          src={template.thumbnail} 
                          alt={template.name}
                          className="w-full h-32 object-cover rounded-t-lg"
                        />
                        <Badge className="absolute top-2 right-2" variant="secondary">
                          {template.category}
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">{template.name}</h3>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <span>★ {template.rating}</span>
                            <span>•</span>
                            <span>{template.downloads} downloads</span>
                          </div>
                        </div>
                        <Button className="w-full mt-3" size="sm" onClick={() => handleUseTemplate(template.id, template.name)}>
                          <Wand2 className="w-4 h-4 mr-2" />
                          Use Template
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="kazi-card">
              <CardHeader>
                <CardTitle className="kazi-headline">AI Design Settings</CardTitle>
                <CardDescription className="kazi-body">
                  Configure your AI design preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Settings className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Settings Panel</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Customize AI models, output quality, and design preferences
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}