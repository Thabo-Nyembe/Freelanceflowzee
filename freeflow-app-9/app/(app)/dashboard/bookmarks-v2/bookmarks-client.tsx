'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Bookmark, Plus, Search, Folder, Grid, List, ExternalLink, Star,
  Calendar, FileText, Link2, Image, Video, Code, Trash2, Edit,
  FolderPlus, Tag, MoreHorizontal, Globe, Lock
} from 'lucide-react'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'

interface BookmarkItem {
  id: string
  title: string
  url: string
  description: string
  folder: string
  tags: string[]
  favicon?: string
  type: 'link' | 'article' | 'video' | 'image' | 'code'
  starred: boolean
  private: boolean
  createdAt: string
  visitCount: number
}

const demoBookmarks: BookmarkItem[] = [
  {
    id: '1',
    title: 'Tailwind CSS Documentation',
    url: 'https://tailwindcss.com/docs',
    description: 'Official Tailwind CSS documentation with utility classes reference',
    folder: 'Development',
    tags: ['CSS', 'Framework', 'Design'],
    type: 'article',
    starred: true,
    private: false,
    createdAt: '2024-01-15',
    visitCount: 45
  },
  {
    id: '2',
    title: 'Next.js App Router Guide',
    url: 'https://nextjs.org/docs/app',
    description: 'Complete guide to Next.js App Router and server components',
    folder: 'Development',
    tags: ['React', 'Next.js', 'Framework'],
    type: 'article',
    starred: true,
    private: false,
    createdAt: '2024-01-20',
    visitCount: 38
  },
  {
    id: '3',
    title: 'Figma Design System',
    url: 'https://figma.com/design-systems',
    description: 'Best practices for building design systems in Figma',
    folder: 'Design',
    tags: ['Figma', 'Design System', 'UI/UX'],
    type: 'article',
    starred: false,
    private: false,
    createdAt: '2024-02-05',
    visitCount: 22
  },
  {
    id: '4',
    title: 'TypeScript Deep Dive',
    url: 'https://basarat.gitbook.io/typescript',
    description: 'Free comprehensive TypeScript book covering advanced topics',
    folder: 'Development',
    tags: ['TypeScript', 'JavaScript', 'Learning'],
    type: 'article',
    starred: true,
    private: false,
    createdAt: '2024-02-10',
    visitCount: 56
  },
  {
    id: '5',
    title: 'Stripe API Reference',
    url: 'https://stripe.com/docs/api',
    description: 'Complete Stripe API documentation for payments',
    folder: 'Business',
    tags: ['API', 'Payments', 'Stripe'],
    type: 'article',
    starred: false,
    private: true,
    createdAt: '2024-02-15',
    visitCount: 18
  },
  {
    id: '6',
    title: 'React Query Tutorial',
    url: 'https://tanstack.com/query/latest',
    description: 'TanStack Query documentation for data fetching',
    folder: 'Development',
    tags: ['React', 'Data Fetching', 'State'],
    type: 'article',
    starred: false,
    private: false,
    createdAt: '2024-03-01',
    visitCount: 29
  },
  {
    id: '7',
    title: 'UI Design Inspiration',
    url: 'https://dribbble.com/shots/popular',
    description: 'Daily UI design inspiration from Dribbble',
    folder: 'Design',
    tags: ['Inspiration', 'UI', 'Gallery'],
    type: 'image',
    starred: true,
    private: false,
    createdAt: '2024-03-10',
    visitCount: 67
  },
  {
    id: '8',
    title: 'AWS Architecture Diagrams',
    url: 'https://aws.amazon.com/architecture',
    description: 'AWS architecture patterns and best practices',
    folder: 'DevOps',
    tags: ['AWS', 'Cloud', 'Architecture'],
    type: 'article',
    starred: false,
    private: true,
    createdAt: '2024-03-15',
    visitCount: 12
  }
]

const folders = ['All', 'Development', 'Design', 'Business', 'DevOps', 'Learning']

export default function BookmarksClient() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(demoBookmarks)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFolder, setSelectedFolder] = useState('All')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [activeTab, setActiveTab] = useState('all')

  const filteredBookmarks = bookmarks.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesFolder = selectedFolder === 'All' || item.folder === selectedFolder
    const matchesTab = activeTab === 'all' ||
                       (activeTab === 'starred' && item.starred) ||
                       (activeTab === 'private' && item.private)
    return matchesSearch && matchesFolder && matchesTab
  })

  const totalBookmarks = bookmarks.length
  const starredCount = bookmarks.filter(b => b.starred).length
  const privateCount = bookmarks.filter(b => b.private).length
  const totalVisits = bookmarks.reduce((sum, b) => sum + b.visitCount, 0)

  const getTypeIcon = (type: BookmarkItem['type']) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />
      case 'image': return <Image className="h-4 w-4" />
      case 'code': return <Code className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const toggleStar = (id: string) => {
    setBookmarks(prev => prev.map(b =>
      b.id === id ? { ...b, starred: !b.starred } : b
    ))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 dark:from-slate-950 dark:via-slate-900 dark:to-amber-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent flex items-center gap-2">
              <Bookmark className="h-8 w-8 text-amber-600" />
              Bookmarks
            </h1>
            <p className="text-muted-foreground mt-1">Save and organize your favorite resources</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <FolderPlus className="h-4 w-4 mr-2" />
              New Folder
            </Button>
            <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Bookmark
            </Button>
          </div>
        </div>

        {/* AI Insights Panel */}
        <CollapsibleInsightsPanel
          title="Bookmark Insights"
          insights={[
            { label: 'Total Bookmarks', value: totalBookmarks.toString(), change: '+8', changeType: 'positive' },
            { label: 'Starred', value: starredCount.toString(), change: '+2', changeType: 'positive' },
            { label: 'Total Visits', value: totalVisits.toString(), change: '+156', changeType: 'positive' },
            { label: 'Folders', value: (folders.length - 1).toString(), change: '0', changeType: 'neutral' }
          ]}
          recommendations={[
            'You haven\'t visited 5 bookmarks in over 30 days - consider archiving',
            'Create a "Reading List" folder for articles to read later',
            'Most visited: Development resources - keep them organized'
          ]}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm">Total Bookmarks</p>
                  <p className="text-2xl font-bold">{totalBookmarks}</p>
                </div>
                <Bookmark className="h-8 w-8 text-amber-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm">Starred</p>
                  <p className="text-2xl font-bold">{starredCount}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-slate-500 to-slate-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-100 text-sm">Private</p>
                  <p className="text-2xl font-bold">{privateCount}</p>
                </div>
                <Lock className="h-8 w-8 text-slate-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Visits</p>
                  <p className="text-2xl font-bold">{totalVisits}</p>
                </div>
                <Globe className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search bookmarks, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {folders.map(folder => (
                  <Button
                    key={folder}
                    variant={selectedFolder === folder ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedFolder(folder)}
                  >
                    <Folder className="h-4 w-4 mr-1" />
                    {folder}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All ({bookmarks.length})</TabsTrigger>
            <TabsTrigger value="starred">Starred ({starredCount})</TabsTrigger>
            <TabsTrigger value="private">Private ({privateCount})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {viewMode === 'list' ? (
              <div className="space-y-2">
                {filteredBookmarks.map(item => (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-lg flex items-center justify-center">
                          {getTypeIcon(item.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold truncate">{item.title}</h3>
                            {item.private && <Lock className="h-4 w-4 text-muted-foreground" />}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{item.url}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">{item.folder}</Badge>
                            {item.tags.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                            ))}
                            <span className="text-xs text-muted-foreground">{item.visitCount} visits</span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleStar(item.id)}
                            className={item.starred ? "text-amber-500" : ""}
                          >
                            <Star className={`h-4 w-4 ${item.starred ? 'fill-current' : ''}`} />
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <a href={item.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBookmarks.map(item => (
                  <Card key={item.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-lg flex items-center justify-center">
                          {getTypeIcon(item.type)}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleStar(item.id)}
                          className={item.starred ? "text-amber-500" : ""}
                        >
                          <Star className={`h-4 w-4 ${item.starred ? 'fill-current' : ''}`} />
                        </Button>
                      </div>
                      <h3 className="font-semibold mb-1 line-clamp-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{item.description}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {item.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Folder className="h-3 w-3" />
                          {item.folder}
                        </span>
                        <span>{item.visitCount} visits</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {filteredBookmarks.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No bookmarks found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your search or add a new bookmark</p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Bookmark
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
