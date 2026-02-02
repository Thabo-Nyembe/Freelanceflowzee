"use client"

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { createFeatureLogger } from '@/lib/logger'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  Filter,
  Star,
  Heart,
  Eye,
  ExternalLink,
  Briefcase,
  Award,
  TrendingUp,
  Crown,
  CheckCircle2,
  Grid3X3,
  List,
  MapPin,
  MessageSquare,
  Share2,
  Bookmark,
  ChevronRight,
  Sparkles,
  Image as ImageIcon,
  Play
} from 'lucide-react'

const logger = createFeatureLogger('CreatorMarketplace')

interface Portfolio {
  id: string
  userId: string
  title: string
  slug: string
  description: string
  avatar: string
  coverImage: string
  creatorName: string
  creatorUsername: string
  location: string
  skills: string[]
  rating: number
  reviewCount: number
  projectCount: number
  completedProjects: number
  views: number
  likes: number
  verified: boolean
  featured: boolean
  hourlyRate?: string
  availability: 'available' | 'busy' | 'unavailable'
  categories: string[]
  showcaseImages: string[]
  createdAt: string
}

interface CreatorMarketplaceProps {
  currentUserId: string
  onViewPortfolio?: (portfolioId: string) => void
  onContactCreator?: (creatorId: string) => void
  onHireCreator?: (creatorId: string) => void
}

// Demo portfolios for display
const DEMO_PORTFOLIOS: Portfolio[] = [
  {
    id: 'port_001',
    userId: 'user_001',
    title: 'Digital Product Design',
    slug: 'sarah-chen-design',
    description: 'Award-winning product designer specializing in SaaS, fintech, and mobile applications. 8+ years creating user-centered designs.',
    avatar: '/avatars/sarah.jpg',
    coverImage: '/portfolio/cover-1.jpg',
    creatorName: 'Sarah Chen',
    creatorUsername: '@sarahchen',
    location: 'San Francisco, CA',
    skills: ['UI/UX Design', 'Figma', 'Product Strategy', 'Design Systems', 'Prototyping'],
    rating: 4.9,
    reviewCount: 127,
    projectCount: 89,
    completedProjects: 85,
    views: 12450,
    likes: 892,
    verified: true,
    featured: true,
    hourlyRate: '$150-200',
    availability: 'available',
    categories: ['Design', 'UI/UX', 'Mobile'],
    showcaseImages: ['/projects/design-1.jpg', '/projects/design-2.jpg', '/projects/design-3.jpg'],
    createdAt: '2023-01-15'
  },
  {
    id: 'port_002',
    userId: 'user_002',
    title: 'Full-Stack Development',
    slug: 'alex-rivera-dev',
    description: 'Senior full-stack developer with expertise in React, Node.js, and cloud architecture. Building scalable solutions since 2016.',
    avatar: '/avatars/alex.jpg',
    coverImage: '/portfolio/cover-2.jpg',
    creatorName: 'Alex Rivera',
    creatorUsername: '@alexrivera',
    location: 'Austin, TX',
    skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'PostgreSQL'],
    rating: 4.8,
    reviewCount: 94,
    projectCount: 67,
    completedProjects: 65,
    views: 8920,
    likes: 654,
    verified: true,
    featured: true,
    hourlyRate: '$125-175',
    availability: 'available',
    categories: ['Development', 'Web', 'Backend'],
    showcaseImages: ['/projects/dev-1.jpg', '/projects/dev-2.jpg', '/projects/dev-3.jpg'],
    createdAt: '2023-03-20'
  },
  {
    id: 'port_003',
    userId: 'user_003',
    title: 'Brand Identity & Strategy',
    slug: 'maya-patel-brand',
    description: 'Creative director helping startups and enterprises build memorable brand identities. Former agency lead, now independent.',
    avatar: '/avatars/maya.jpg',
    coverImage: '/portfolio/cover-3.jpg',
    creatorName: 'Maya Patel',
    creatorUsername: '@mayapatel',
    location: 'New York, NY',
    skills: ['Brand Strategy', 'Logo Design', 'Visual Identity', 'Marketing', 'Adobe CC'],
    rating: 4.9,
    reviewCount: 156,
    projectCount: 112,
    completedProjects: 110,
    views: 15670,
    likes: 1023,
    verified: true,
    featured: true,
    hourlyRate: '$175-250',
    availability: 'busy',
    categories: ['Design', 'Branding', 'Marketing'],
    showcaseImages: ['/projects/brand-1.jpg', '/projects/brand-2.jpg', '/projects/brand-3.jpg'],
    createdAt: '2022-11-10'
  },
  {
    id: 'port_004',
    userId: 'user_004',
    title: 'Motion Graphics & Animation',
    slug: 'james-kim-motion',
    description: 'Motion designer creating engaging animations for ads, explainers, and product demos. Clients include Fortune 500 companies.',
    avatar: '/avatars/james.jpg',
    coverImage: '/portfolio/cover-4.jpg',
    creatorName: 'James Kim',
    creatorUsername: '@jameskim',
    location: 'Los Angeles, CA',
    skills: ['After Effects', 'Cinema 4D', '3D Animation', 'Motion Design', 'Video Editing'],
    rating: 4.7,
    reviewCount: 78,
    projectCount: 54,
    completedProjects: 52,
    views: 6340,
    likes: 445,
    verified: true,
    featured: false,
    hourlyRate: '$100-150',
    availability: 'available',
    categories: ['Video', 'Animation', 'Motion'],
    showcaseImages: ['/projects/motion-1.jpg', '/projects/motion-2.jpg', '/projects/motion-3.jpg'],
    createdAt: '2023-05-01'
  },
  {
    id: 'port_005',
    userId: 'user_005',
    title: 'Content Writing & SEO',
    slug: 'emma-wilson-content',
    description: 'Content strategist and SEO expert helping brands tell their story. Published in Forbes, TechCrunch, and HBR.',
    avatar: '/avatars/emma.jpg',
    coverImage: '/portfolio/cover-5.jpg',
    creatorName: 'Emma Wilson',
    creatorUsername: '@emmawilson',
    location: 'Remote',
    skills: ['Content Strategy', 'SEO', 'Copywriting', 'Blog Writing', 'Technical Writing'],
    rating: 4.8,
    reviewCount: 203,
    projectCount: 178,
    completedProjects: 175,
    views: 9870,
    likes: 712,
    verified: true,
    featured: false,
    hourlyRate: '$75-125',
    availability: 'available',
    categories: ['Writing', 'Marketing', 'SEO'],
    showcaseImages: ['/projects/content-1.jpg', '/projects/content-2.jpg', '/projects/content-3.jpg'],
    createdAt: '2023-02-28'
  },
  {
    id: 'port_006',
    userId: 'user_006',
    title: 'Mobile App Development',
    slug: 'david-chen-mobile',
    description: 'iOS and Android developer building beautiful, performant mobile experiences. Specializing in fintech and health apps.',
    avatar: '/avatars/david.jpg',
    coverImage: '/portfolio/cover-6.jpg',
    creatorName: 'David Chen',
    creatorUsername: '@davidchen',
    location: 'Seattle, WA',
    skills: ['Swift', 'Kotlin', 'React Native', 'Flutter', 'Firebase'],
    rating: 4.9,
    reviewCount: 89,
    projectCount: 45,
    completedProjects: 44,
    views: 7560,
    likes: 534,
    verified: true,
    featured: false,
    hourlyRate: '$150-200',
    availability: 'busy',
    categories: ['Development', 'Mobile', 'iOS', 'Android'],
    showcaseImages: ['/projects/mobile-1.jpg', '/projects/mobile-2.jpg', '/projects/mobile-3.jpg'],
    createdAt: '2023-04-15'
  }
]

export default function CreatorMarketplace({
  currentUserId,
  onViewPortfolio,
  onContactCreator,
  onHireCreator
}: CreatorMarketplaceProps) {
  const [portfolios, setPortfolios] = useState<Portfolio[]>(DEMO_PORTFOLIOS)
  const [filteredPortfolios, setFilteredPortfolios] = useState<Portfolio[]>(DEMO_PORTFOLIOS)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('featured')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [loading, setLoading] = useState(false)
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [likedPortfolios, setLikedPortfolios] = useState<Set<string>>(new Set())
  const [bookmarkedPortfolios, setBookmarkedPortfolios] = useState<Set<string>>(new Set())
  const [filters, setFilters] = useState({
    availability: 'all',
    minRating: 0,
    verified: false,
    priceRange: 'all'
  })

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'Design', label: 'Design' },
    { value: 'Development', label: 'Development' },
    { value: 'Writing', label: 'Writing' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Video', label: 'Video & Animation' },
    { value: 'Mobile', label: 'Mobile' },
    { value: 'Branding', label: 'Branding' }
  ]

  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'reviews', label: 'Most Reviews' },
    { value: 'recent', label: 'Recently Added' },
    { value: 'views', label: 'Most Viewed' }
  ]

  // Apply filters and search
  useEffect(() => {
    let result = [...portfolios]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(p =>
        p.creatorName.toLowerCase().includes(query) ||
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.skills.some(s => s.toLowerCase().includes(query))
      )
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.categories.includes(selectedCategory))
    }

    // Availability filter
    if (filters.availability !== 'all') {
      result = result.filter(p => p.availability === filters.availability)
    }

    // Rating filter
    if (filters.minRating > 0) {
      result = result.filter(p => p.rating >= filters.minRating)
    }

    // Verified filter
    if (filters.verified) {
      result = result.filter(p => p.verified)
    }

    // Sort
    switch (sortBy) {
      case 'featured':
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
        break
      case 'rating':
        result.sort((a, b) => b.rating - a.rating)
        break
      case 'reviews':
        result.sort((a, b) => b.reviewCount - a.reviewCount)
        break
      case 'recent':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'views':
        result.sort((a, b) => b.views - a.views)
        break
    }

    setFilteredPortfolios(result)
  }, [portfolios, searchQuery, selectedCategory, sortBy, filters])

  const handleLike = useCallback((portfolioId: string) => {
    setLikedPortfolios(prev => {
      const newSet = new Set(prev)
      if (newSet.has(portfolioId)) {
        newSet.delete(portfolioId)
        toast.success('Removed from favorites')
      } else {
        newSet.add(portfolioId)
        toast.success('Added to favorites')
      }
      return newSet
    })
  }, [])

  const handleBookmark = useCallback((portfolioId: string) => {
    setBookmarkedPortfolios(prev => {
      const newSet = new Set(prev)
      if (newSet.has(portfolioId)) {
        newSet.delete(portfolioId)
        toast.success('Removed from saved')
      } else {
        newSet.add(portfolioId)
        toast.success('Portfolio saved')
      }
      return newSet
    })
  }, [])

  const handleViewPortfolio = (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio)
    onViewPortfolio?.(portfolio.id)
    logger.info('Portfolio viewed', { portfolioId: portfolio.id })
  }

  const handleContactCreator = (creatorId: string) => {
    onContactCreator?.(creatorId)
    toast.success('Opening chat', { description: 'Starting conversation with creator' })
  }

  const handleHireCreator = (creatorId: string) => {
    onHireCreator?.(creatorId)
    toast.success('Creating contract', { description: 'Starting hire process' })
  }

  const PortfolioCard = ({ portfolio }: { portfolio: Portfolio }) => (
    <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Cover Image */}
      <div className="relative h-40 bg-gradient-to-br from-violet-500 to-purple-600 overflow-hidden">
        {portfolio.coverImage && (
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${portfolio.coverImage})` }} />
        )}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {portfolio.featured && (
            <Badge className="bg-yellow-500 text-white">
              <Sparkles className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
          {portfolio.verified && (
            <Badge variant="secondary" className="bg-white/90">
              <CheckCircle2 className="w-3 h-3 mr-1 text-blue-500" />
              Verified
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 bg-white/90 hover:bg-white"
            onClick={(e) => { e.stopPropagation(); handleLike(portfolio.id) }}
          >
            <Heart className={`w-4 h-4 ${likedPortfolios.has(portfolio.id) ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 bg-white/90 hover:bg-white"
            onClick={(e) => { e.stopPropagation(); handleBookmark(portfolio.id) }}
          >
            <Bookmark className={`w-4 h-4 ${bookmarkedPortfolios.has(portfolio.id) ? 'fill-blue-500 text-blue-500' : ''}`} />
          </Button>
        </div>

        {/* Avatar */}
        <div className="absolute -bottom-8 left-4">
          <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
            <AvatarImage src={portfolio.avatar} alt={portfolio.creatorName} />
            <AvatarFallback className="text-lg">{portfolio.creatorName[0]}</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <CardContent className="pt-10 pb-4">
        <div className="space-y-3">
          {/* Creator Info */}
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">{portfolio.creatorName}</h3>
              <Badge
                variant={portfolio.availability === 'available' ? 'default' : 'secondary'}
                className={portfolio.availability === 'available' ? 'bg-green-500' : ''}
              >
                {portfolio.availability === 'available' ? 'Available' : portfolio.availability === 'busy' ? 'Busy' : 'Unavailable'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{portfolio.creatorUsername}</p>
          </div>

          {/* Title & Description */}
          <div>
            <h4 className="font-medium">{portfolio.title}</h4>
            <p className="text-sm text-muted-foreground line-clamp-2">{portfolio.description}</p>
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-1">
            {portfolio.skills.slice(0, 3).map(skill => (
              <Badge key={skill} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
            {portfolio.skills.length > 3 && (
              <Badge variant="outline" className="text-xs">+{portfolio.skills.length - 3}</Badge>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
              <span className="font-medium text-foreground">{portfolio.rating}</span>
              <span>({portfolio.reviewCount})</span>
            </div>
            <div className="flex items-center gap-1">
              <Briefcase className="w-4 h-4" />
              <span>{portfolio.completedProjects} projects</span>
            </div>
          </div>

          {/* Location & Rate */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              {portfolio.location}
            </div>
            {portfolio.hourlyRate && (
              <span className="font-medium text-green-600">{portfolio.hourlyRate}/hr</span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              className="flex-1"
              onClick={() => handleViewPortfolio(portfolio)}
            >
              View Portfolio
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleContactCreator(portfolio.userId)}
            >
              <MessageSquare className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const PortfolioListItem = ({ portfolio }: { portfolio: Portfolio }) => (
    <Card className="group hover:shadow-lg transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Avatar & Badges */}
          <div className="flex-shrink-0">
            <div className="relative">
              <Avatar className="h-16 w-16">
                <AvatarImage src={portfolio.avatar} alt={portfolio.creatorName} />
                <AvatarFallback>{portfolio.creatorName[0]}</AvatarFallback>
              </Avatar>
              {portfolio.verified && (
                <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{portfolio.creatorName}</h3>
                  {portfolio.featured && (
                    <Badge className="bg-yellow-500 text-white text-xs">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{portfolio.title}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={portfolio.availability === 'available' ? 'default' : 'secondary'}
                  className={portfolio.availability === 'available' ? 'bg-green-500' : ''}
                >
                  {portfolio.availability === 'available' ? 'Available' : portfolio.availability}
                </Badge>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{portfolio.description}</p>

            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1 text-sm">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                <span className="font-medium">{portfolio.rating}</span>
                <span className="text-muted-foreground">({portfolio.reviewCount})</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Briefcase className="w-4 h-4" />
                {portfolio.completedProjects} projects
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                {portfolio.location}
              </div>
              {portfolio.hourlyRate && (
                <span className="text-sm font-medium text-green-600">{portfolio.hourlyRate}/hr</span>
              )}
            </div>

            <div className="flex flex-wrap gap-1 mt-2">
              {portfolio.skills.slice(0, 5).map(skill => (
                <Badge key={skill} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button size="sm" onClick={() => handleViewPortfolio(portfolio)}>
              View
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleContactCreator(portfolio.userId)}>
              Contact
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Creator Marketplace</h2>
          <p className="text-muted-foreground">Discover talented creators and view their portfolios</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{filteredPortfolios.length} creators</span>
        </div>
      </div>

      {/* Featured Creators Banner */}
      <Card className="bg-gradient-to-r from-violet-500 to-purple-600 text-white overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5" />
                <h3 className="font-semibold">Featured Creators</h3>
              </div>
              <p className="text-white/80 text-sm">Top-rated professionals hand-picked for quality and reliability</p>
            </div>
            <div className="flex -space-x-3">
              {filteredPortfolios.filter(p => p.featured).slice(0, 5).map(p => (
                <Avatar key={p.id} className="h-12 w-12 border-2 border-white">
                  <AvatarImage src={p.avatar} alt={p.creatorName} />
                  <AvatarFallback>{p.creatorName[0]}</AvatarFallback>
                </Avatar>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search & Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search creators, skills, or services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={showFilters} onOpenChange={setShowFilters}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Filter Creators</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Availability</label>
                  <Select value={filters.availability} onValueChange={(v) => setFilters(f => ({ ...f, availability: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="busy">Busy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Minimum Rating</label>
                  <Select value={String(filters.minRating)} onValueChange={(v) => setFilters(f => ({ ...f, minRating: Number(v) }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Any rating</SelectItem>
                      <SelectItem value="4">4+ stars</SelectItem>
                      <SelectItem value="4.5">4.5+ stars</SelectItem>
                      <SelectItem value="4.8">4.8+ stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Verified Only</label>
                  <input
                    type="checkbox"
                    checked={filters.verified}
                    onChange={(e) => setFilters(f => ({ ...f, verified: e.target.checked }))}
                    className="h-4 w-4"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setFilters({ availability: 'all', minRating: 0, verified: false, priceRange: 'all' })}
                  >
                    Clear
                  </Button>
                  <Button className="flex-1" onClick={() => setShowFilters(false)}>
                    Apply
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="rounded-r-none"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="rounded-l-none"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Portfolio Grid/List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : filteredPortfolios.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">No creators found</h3>
            <p className="text-muted-foreground text-center">
              Try adjusting your search or filters to find more creators
            </p>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPortfolios.map(portfolio => (
            <PortfolioCard key={portfolio.id} portfolio={portfolio} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPortfolios.map(portfolio => (
            <PortfolioListItem key={portfolio.id} portfolio={portfolio} />
          ))}
        </div>
      )}

      {/* Portfolio Detail Dialog */}
      <Dialog open={!!selectedPortfolio} onOpenChange={() => setSelectedPortfolio(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedPortfolio && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedPortfolio.avatar} alt={selectedPortfolio.creatorName} />
                    <AvatarFallback>{selectedPortfolio.creatorName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span>{selectedPortfolio.creatorName}</span>
                      {selectedPortfolio.verified && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
                    </div>
                    <p className="text-sm font-normal text-muted-foreground">{selectedPortfolio.title}</p>
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Star className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
                      <p className="text-2xl font-bold">{selectedPortfolio.rating}</p>
                      <p className="text-xs text-muted-foreground">{selectedPortfolio.reviewCount} reviews</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Briefcase className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                      <p className="text-2xl font-bold">{selectedPortfolio.completedProjects}</p>
                      <p className="text-xs text-muted-foreground">Projects</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Eye className="w-5 h-5 mx-auto mb-1 text-green-500" />
                      <p className="text-2xl font-bold">{(selectedPortfolio.views / 1000).toFixed(1)}k</p>
                      <p className="text-xs text-muted-foreground">Views</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Heart className="w-5 h-5 mx-auto mb-1 text-red-500" />
                      <p className="text-2xl font-bold">{selectedPortfolio.likes}</p>
                      <p className="text-xs text-muted-foreground">Likes</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-medium mb-2">About</h4>
                  <p className="text-muted-foreground">{selectedPortfolio.description}</p>
                </div>

                {/* Skills */}
                <div>
                  <h4 className="font-medium mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPortfolio.skills.map(skill => (
                      <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>

                {/* Showcase */}
                <div>
                  <h4 className="font-medium mb-2">Portfolio Showcase</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {selectedPortfolio.showcaseImages.map((img, i) => (
                      <div
                        key={i}
                        className="aspect-video bg-muted rounded-lg flex items-center justify-center"
                      >
                        <ImageIcon className="w-8 h-8 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button className="flex-1" onClick={() => handleHireCreator(selectedPortfolio.userId)}>
                    <Briefcase className="w-4 h-4 mr-2" />
                    Hire {selectedPortfolio.creatorName}
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => handleContactCreator(selectedPortfolio.userId)}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
