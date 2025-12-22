'use client'

import { useState, useEffect } from 'react'
import {
  BentoGallery,
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  ActivityFeed,
  MiniKPI
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton,
  IconButton
} from '@/components/ui/modern-buttons'
import {
  Image,
  Plus,
  Search,
  Upload,
  Download,
  Share2,
  Eye,
  Star,
  Settings,
  Filter,
  Grid,
  List,
  Folder,
  TrendingUp,
  Trash2,
  Heart
} from 'lucide-react'
import { useGalleryItems, useGalleryCollections, GalleryItem, GalleryCollection } from '@/lib/hooks/use-gallery'
import {
  createGalleryItem,
  deleteGalleryItem,
  toggleGalleryItemFeatured,
  toggleGalleryItemPortfolio,
  createCollection,
  deleteCollection
} from '@/app/actions/gallery'

interface GalleryClientProps {
  initialItems: GalleryItem[]
  initialCollections: GalleryCollection[]
  initialStats: {
    total: number
    images: number
    videos: number
    featured: number
    portfolio: number
    totalViews: number
  }
}

export default function GalleryClient({ initialItems, initialCollections, initialStats }: GalleryClientProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'images' | 'videos' | 'featured' | 'portfolio'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
  const [showAddCollection, setShowAddCollection] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState('')

  const { items, stats, fetchItems, deleteItem, toggleFeatured, togglePortfolio } = useGalleryItems(selectedCollection, initialItems)
  const { collections, fetchCollections } = useGalleryCollections(initialCollections)

  useEffect(() => {
    fetchItems()
    fetchCollections()
  }, [fetchItems, fetchCollections])

  const displayStats = stats.total > 0 ? stats : initialStats

  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === 'all' ||
      (selectedCategory === 'images' && item.file_type === 'image') ||
      (selectedCategory === 'videos' && item.file_type === 'video') ||
      (selectedCategory === 'featured' && item.is_featured) ||
      (selectedCategory === 'portfolio' && item.is_portfolio)
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const statsDisplay = [
    { label: 'Total Items', value: String(displayStats.total), change: 12.5, icon: <Image className="w-5 h-5" /> },
    { label: 'Views', value: displayStats.totalViews > 1000 ? `${(displayStats.totalViews / 1000).toFixed(1)}K` : String(displayStats.totalViews), change: 25.3, icon: <Eye className="w-5 h-5" /> },
    { label: 'Featured', value: String(displayStats.featured), change: 15.2, icon: <Star className="w-5 h-5" /> },
    { label: 'Portfolio', value: String(displayStats.portfolio), change: 8.7, icon: <Heart className="w-5 h-5" /> }
  ]

  const recentActivity = items.slice(0, 4).map(item => ({
    icon: <Upload className="w-5 h-5" />,
    title: item.title,
    description: `${item.file_type} • ${item.view_count || 0} views`,
    time: new Date(item.updated_at).toLocaleDateString(),
    status: item.is_featured ? 'success' as const : 'info' as const
  }))

  const handleAddCollection = async () => {
    if (!newCollectionName.trim()) return
    try {
      await createCollection({ name: newCollectionName })
      setNewCollectionName('')
      setShowAddCollection(false)
      fetchCollections()
    } catch (error) {
      console.error('Error creating collection:', error)
    }
  }

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteGalleryItem(id)
      fetchItems()
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  const handleToggleFeatured = async (id: string) => {
    try {
      await toggleGalleryItemFeatured(id)
      fetchItems()
    } catch (error) {
      console.error('Error toggling featured:', error)
    }
  }

  const handleTogglePortfolio = async (id: string) => {
    try {
      await toggleGalleryItemPortfolio(id)
      fetchItems()
    } catch (error) {
      console.error('Error toggling portfolio:', error)
    }
  }

  const handleDeleteCollection = async (id: string) => {
    try {
      await deleteCollection(id)
      if (selectedCollection === id) setSelectedCollection(null)
      fetchCollections()
    } catch (error) {
      console.error('Error deleting collection:', error)
    }
  }

  const galleryDisplayItems = filteredItems.map(item => ({
    id: item.id,
    src: item.thumbnail_url || item.file_url,
    alt: item.title,
    title: item.title,
    description: item.description || `${item.view_count || 0} views`
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/30 to-rose-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Image className="w-10 h-10 text-amber-600" />
              Gallery
            </h1>
            <p className="text-muted-foreground">Showcase your portfolio and creative work</p>
          </div>
          <div className="flex items-center gap-3">
            <IconButton icon={<Filter />} ariaLabel="Filter" variant="ghost" size="md" />
            <IconButton icon={<Settings />} ariaLabel="Settings" variant="ghost" size="md" />
            <GradientButton from="amber" to="orange" onClick={() => setShowAddCollection(true)}>
              <Plus className="w-5 h-5 mr-2" />
              New Collection
            </GradientButton>
          </div>
        </div>

        <StatGrid columns={4} stats={statsDisplay} />

        {/* Add Collection Form */}
        {showAddCollection && (
          <BentoCard className="p-6">
            <h3 className="text-xl font-semibold mb-4">Create New Collection</h3>
            <div className="flex gap-4">
              <input
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="Collection name"
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                autoFocus
              />
              <ModernButton variant="primary" onClick={handleAddCollection}>Create</ModernButton>
              <ModernButton variant="ghost" onClick={() => setShowAddCollection(false)}>Cancel</ModernButton>
            </div>
          </BentoCard>
        )}

        {/* Collections */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction
            icon={<Upload className="w-6 h-6" />}
            title="Upload"
            description="Add images"
            onClick={() => console.log('Upload')}
          />
          <BentoQuickAction
            icon={<Folder className="w-6 h-6" />}
            title="Collections"
            description={`${collections.length} total`}
            onClick={() => setSelectedCollection(null)}
          />
          <BentoQuickAction
            icon={<Share2 className="w-6 h-6" />}
            title="Share"
            description="Portfolio"
            onClick={() => window.location.href = '/portfolio'}
          />
          <BentoQuickAction
            icon={<Download className="w-6 h-6" />}
            title="Export"
            description="Download all"
            onClick={() => console.log('Export')}
          />
        </div>

        {/* Collection Tabs */}
        {collections.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <PillButton
              variant={selectedCollection === null ? 'primary' : 'ghost'}
              onClick={() => setSelectedCollection(null)}
            >
              All Items
            </PillButton>
            {collections.map(collection => (
              <div key={collection.id} className="relative group">
                <PillButton
                  variant={selectedCollection === collection.id ? 'primary' : 'ghost'}
                  onClick={() => setSelectedCollection(collection.id)}
                >
                  {collection.name} ({collection.item_count || 0})
                </PillButton>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteCollection(collection.id); }}
                  className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search gallery..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <PillButton variant={selectedCategory === 'all' ? 'primary' : 'ghost'} onClick={() => setSelectedCategory('all')}>All</PillButton>
            <PillButton variant={selectedCategory === 'images' ? 'primary' : 'ghost'} onClick={() => setSelectedCategory('images')}>Images</PillButton>
            <PillButton variant={selectedCategory === 'videos' ? 'primary' : 'ghost'} onClick={() => setSelectedCategory('videos')}>Videos</PillButton>
            <PillButton variant={selectedCategory === 'featured' ? 'primary' : 'ghost'} onClick={() => setSelectedCategory('featured')}>Featured</PillButton>
            <PillButton variant={selectedCategory === 'portfolio' ? 'primary' : 'ghost'} onClick={() => setSelectedCategory('portfolio')}>Portfolio</PillButton>
          </div>
          <div className="flex items-center gap-1 border border-border rounded-lg p-1">
            <IconButton icon={<Grid />} ariaLabel="Grid view" variant={viewMode === 'grid' ? 'primary' : 'ghost'} size="sm" onClick={() => setViewMode('grid')} />
            <IconButton icon={<List />} ariaLabel="List view" variant={viewMode === 'list' ? 'primary' : 'ghost'} size="sm" onClick={() => setViewMode('list')} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {filteredItems.length === 0 ? (
              <BentoCard className="p-12 text-center">
                <Image className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No items yet</h3>
                <p className="text-muted-foreground mb-4">Upload images to build your gallery</p>
              </BentoCard>
            ) : viewMode === 'grid' ? (
              <BentoGallery title="My Portfolio" items={galleryDisplayItems} columns={3} />
            ) : (
              <BentoCard className="p-6">
                <h3 className="text-xl font-semibold mb-4">Gallery Items</h3>
                <div className="space-y-3">
                  {filteredItems.map((item) => (
                    <div key={item.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <img
                          src={item.thumbnail_url || item.file_url}
                          alt={item.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold truncate">{item.title}</h4>
                            {item.is_featured && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                            {item.is_portfolio && <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span>{item.file_type}</span>
                            <span>•</span>
                            <span>{item.view_count || 0} views</span>
                            <span>•</span>
                            <span>{item.like_count || 0} likes</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <IconButton
                            icon={<Star className={`w-4 h-4 ${item.is_featured ? 'fill-yellow-500 text-yellow-500' : ''}`} />}
                            ariaLabel="Feature"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleFeatured(item.id)}
                          />
                          <IconButton
                            icon={<Heart className={`w-4 h-4 ${item.is_portfolio ? 'fill-pink-500 text-pink-500' : ''}`} />}
                            ariaLabel="Add to portfolio"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTogglePortfolio(item.id)}
                          />
                          <IconButton
                            icon={<Trash2 className="w-4 h-4" />}
                            ariaLabel="Delete"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteItem(item.id)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </BentoCard>
            )}
          </div>

          <div className="space-y-6">
            {recentActivity.length > 0 && (
              <ActivityFeed title="Recent Activity" activities={recentActivity} />
            )}

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <MiniKPI label="Uploads This Week" value={String(Math.min(displayStats.total, 12))} change={25.0} />
                <MiniKPI label="Avg. Views per Item" value={displayStats.total > 0 ? String(Math.round(displayStats.totalViews / displayStats.total)) : '0'} change={12.5} />
                <MiniKPI label="Featured Items" value={String(displayStats.featured)} change={8.3} />
                <MiniKPI label="Portfolio Items" value={String(displayStats.portfolio)} change={15.2} />
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Collections</h3>
              {collections.length === 0 ? (
                <p className="text-muted-foreground text-sm">No collections yet</p>
              ) : (
                <div className="space-y-2">
                  {collections.map(collection => (
                    <div
                      key={collection.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => setSelectedCollection(collection.id)}
                    >
                      <div className="flex items-center gap-2">
                        <Folder className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-medium">{collection.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{collection.item_count || 0}</span>
                    </div>
                  ))}
                </div>
              )}
              <ModernButton
                variant="outline"
                className="w-full mt-4"
                onClick={() => setShowAddCollection(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Collection
              </ModernButton>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
