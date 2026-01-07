// Badges V2 - Digital Credentialing & Achievement System
// Features: Badge creation, awarding, sharing, downloading, gamification
'use client'

import { useState, useMemo, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge as BadgeUI } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Award,
  Trophy,
  Star,
  Crown,
  Medal,
  Target,
  Users,
  Search,
  Plus,
  Settings,
  Download,
  Share2,
  ExternalLink,
  Trash2,
  Loader2,
  Pencil,
  RefreshCw,
  Copy,
  Check,
  Gift,
  Sparkles,
  Shield,
  Flame,
  Zap,
  Heart,
  Eye,
  Pin,
  PinOff,
  Filter,
  LayoutGrid,
  List,
  ChevronRight,
  Calendar,
  TrendingUp,
  User,
  UserPlus,
} from 'lucide-react'

// Types
type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
type BadgeCategory = 'milestone' | 'achievement' | 'collaboration' | 'technical' | 'leadership' | 'community'

interface BadgeData {
  id: string
  name: string
  description: string
  image_url: string
  category: BadgeCategory
  level: number
  xp_value: number
  rarity: BadgeRarity
  skills: string[]
  requirements: { description: string; completed: boolean }[]
  is_public: boolean
  holders: number
  created_at: string
  updated_at: string
}

interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  awarded_at: string
  awarded_by: string
  is_pinned: boolean
  share_count: number
  badge: BadgeData
}

interface TeamMember {
  id: string
  name: string
  email: string
  avatar?: string
  badges_count: number
  xp: number
}

interface BadgeStats {
  total_badges: number
  earned_badges: number
  total_xp: number
  pinned_count: number
  completion_rate: number
}

// Mock data for available badges
const mockBadges: BadgeData[] = [
  {
    id: 'b1',
    name: 'Early Adopter',
    description: 'Joined during the platform beta phase and helped shape the product',
    image_url: '/badges/early-adopter.png',
    category: 'milestone',
    level: 1,
    xp_value: 100,
    rarity: 'rare',
    skills: [],
    requirements: [{ description: 'Join during beta', completed: true }],
    is_public: true,
    holders: 1234,
    created_at: '2024-01-15',
    updated_at: '2024-01-15'
  },
  {
    id: 'b2',
    name: 'Team Player',
    description: 'Successfully collaborated on 10 or more team projects',
    image_url: '/badges/team-player.png',
    category: 'collaboration',
    level: 2,
    xp_value: 250,
    rarity: 'uncommon',
    skills: ['Teamwork', 'Communication'],
    requirements: [
      { description: 'Collaborate on 10 projects', completed: true },
      { description: 'Receive positive feedback', completed: true }
    ],
    is_public: true,
    holders: 5678,
    created_at: '2024-02-20',
    updated_at: '2024-02-20'
  },
  {
    id: 'b3',
    name: 'Code Master',
    description: 'Completed advanced coding challenges with excellence',
    image_url: '/badges/code-master.png',
    category: 'technical',
    level: 3,
    xp_value: 500,
    rarity: 'epic',
    skills: ['Programming', 'Problem Solving', 'Algorithms'],
    requirements: [
      { description: 'Complete 50 coding challenges', completed: true },
      { description: 'Achieve 90%+ accuracy', completed: true },
      { description: 'Help 5 team members', completed: false }
    ],
    is_public: true,
    holders: 892,
    created_at: '2024-03-10',
    updated_at: '2024-03-10'
  },
  {
    id: 'b4',
    name: 'Innovation Pioneer',
    description: 'Proposed and implemented a breakthrough feature or improvement',
    image_url: '/badges/innovation.png',
    category: 'achievement',
    level: 4,
    xp_value: 750,
    rarity: 'epic',
    skills: ['Innovation', 'Leadership', 'Initiative'],
    requirements: [
      { description: 'Submit innovative proposal', completed: true },
      { description: 'Get proposal approved', completed: true },
      { description: 'Successfully implement', completed: true }
    ],
    is_public: true,
    holders: 234,
    created_at: '2024-04-05',
    updated_at: '2024-04-05'
  },
  {
    id: 'b5',
    name: 'Legendary Mentor',
    description: 'Mentored 20+ team members to success and received outstanding reviews',
    image_url: '/badges/mentor.png',
    category: 'leadership',
    level: 5,
    xp_value: 1500,
    rarity: 'legendary',
    skills: ['Mentoring', 'Leadership', 'Teaching', 'Patience'],
    requirements: [
      { description: 'Mentor 20 team members', completed: true },
      { description: 'All mentees achieve goals', completed: true },
      { description: 'Receive 5-star reviews', completed: true },
      { description: 'Create mentoring resources', completed: true }
    ],
    is_public: true,
    holders: 45,
    created_at: '2024-05-15',
    updated_at: '2024-05-15'
  },
  {
    id: 'b6',
    name: 'Community Champion',
    description: 'Active contributor to the community with 100+ helpful interactions',
    image_url: '/badges/community.png',
    category: 'community',
    level: 3,
    xp_value: 400,
    rarity: 'rare',
    skills: ['Community', 'Support', 'Knowledge Sharing'],
    requirements: [
      { description: 'Answer 100 questions', completed: true },
      { description: 'Create helpful resources', completed: true }
    ],
    is_public: true,
    holders: 567,
    created_at: '2024-06-20',
    updated_at: '2024-06-20'
  }
]

// Mock user's earned badges
const mockUserBadges: UserBadge[] = [
  {
    id: 'ub1',
    user_id: 'user1',
    badge_id: 'b1',
    awarded_at: '2024-01-20',
    awarded_by: 'system',
    is_pinned: true,
    share_count: 5,
    badge: mockBadges[0]
  },
  {
    id: 'ub2',
    user_id: 'user1',
    badge_id: 'b2',
    awarded_at: '2024-03-15',
    awarded_by: 'manager1',
    is_pinned: true,
    share_count: 3,
    badge: mockBadges[1]
  },
  {
    id: 'ub3',
    user_id: 'user1',
    badge_id: 'b6',
    awarded_at: '2024-07-10',
    awarded_by: 'admin1',
    is_pinned: false,
    share_count: 8,
    badge: mockBadges[5]
  }
]

// Mock team members for awarding badges
const mockTeamMembers: TeamMember[] = [
  { id: 'tm1', name: 'Alice Johnson', email: 'alice@example.com', avatar: '', badges_count: 5, xp: 1250 },
  { id: 'tm2', name: 'Bob Smith', email: 'bob@example.com', avatar: '', badges_count: 3, xp: 750 },
  { id: 'tm3', name: 'Carol Davis', email: 'carol@example.com', avatar: '', badges_count: 8, xp: 2100 },
  { id: 'tm4', name: 'David Wilson', email: 'david@example.com', avatar: '', badges_count: 2, xp: 400 },
  { id: 'tm5', name: 'Eva Martinez', email: 'eva@example.com', avatar: '', badges_count: 6, xp: 1800 },
]

// Rarity colors and icons
const rarityConfig: Record<BadgeRarity, { color: string; bgColor: string; icon: React.ReactNode }> = {
  common: { color: 'text-gray-600', bgColor: 'bg-gray-100', icon: <Star className="w-4 h-4" /> },
  uncommon: { color: 'text-green-600', bgColor: 'bg-green-100', icon: <Shield className="w-4 h-4" /> },
  rare: { color: 'text-blue-600', bgColor: 'bg-blue-100', icon: <Zap className="w-4 h-4" /> },
  epic: { color: 'text-purple-600', bgColor: 'bg-purple-100', icon: <Flame className="w-4 h-4" /> },
  legendary: { color: 'text-amber-600', bgColor: 'bg-amber-100', icon: <Crown className="w-4 h-4" /> }
}

const categoryIcons: Record<BadgeCategory, React.ReactNode> = {
  milestone: <Target className="w-4 h-4" />,
  achievement: <Trophy className="w-4 h-4" />,
  collaboration: <Users className="w-4 h-4" />,
  technical: <Zap className="w-4 h-4" />,
  leadership: <Crown className="w-4 h-4" />,
  community: <Heart className="w-4 h-4" />
}

export function BadgesClient() {
  // State
  const [activeTab, setActiveTab] = useState('my-badges')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedRarity, setSelectedRarity] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [awardDialogOpen, setAwardDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Selected items
  const [selectedBadge, setSelectedBadge] = useState<BadgeData | null>(null)
  const [selectedUserBadge, setSelectedUserBadge] = useState<UserBadge | null>(null)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)

  // Form states
  const [newBadge, setNewBadge] = useState({
    name: '',
    description: '',
    category: 'achievement' as BadgeCategory,
    rarity: 'common' as BadgeRarity,
    xp_value: 100,
    skills: '',
    is_public: true
  })
  const [awardReason, setAwardReason] = useState('')

  // Data state (would come from API in production)
  const [badges, setBadges] = useState<BadgeData[]>(mockBadges)
  const [userBadges, setUserBadges] = useState<UserBadge[]>(mockUserBadges)
  const [stats, setStats] = useState<BadgeStats>({
    total_badges: mockBadges.length,
    earned_badges: mockUserBadges.length,
    total_xp: mockUserBadges.reduce((sum, ub) => sum + ub.badge.xp_value, 0),
    pinned_count: mockUserBadges.filter(ub => ub.is_pinned).length,
    completion_rate: Math.round((mockUserBadges.length / mockBadges.length) * 100)
  })

  // Refs for download
  const badgeImageRef = useRef<HTMLDivElement>(null)

  // Filtered badges
  const filteredBadges = useMemo(() => {
    return badges.filter(badge => {
      const matchesSearch = badge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        badge.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || badge.category === selectedCategory
      const matchesRarity = selectedRarity === 'all' || badge.rarity === selectedRarity
      return matchesSearch && matchesCategory && matchesRarity
    })
  }, [badges, searchQuery, selectedCategory, selectedRarity])

  const filteredUserBadges = useMemo(() => {
    return userBadges.filter(ub => {
      const matchesSearch = ub.badge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ub.badge.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || ub.badge.category === selectedCategory
      const matchesRarity = selectedRarity === 'all' || ub.badge.rarity === selectedRarity
      return matchesSearch && matchesCategory && matchesRarity
    })
  }, [userBadges, searchQuery, selectedCategory, selectedRarity])

  // Real API handlers
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch('/api/badges')
      if (!response.ok) throw new Error('Failed to fetch badges')

      const data = await response.json()
      if (data.success) {
        if (data.badges) setBadges(data.badges)
        if (data.user_badges) setUserBadges(data.user_badges)
        if (data.stats) setStats(data.stats)
        toast.success('Badges refreshed successfully')
      }
    } catch (error) {
      console.error('Refresh error:', error)
      toast.error('Failed to refresh badges')
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  const handleCreateBadge = useCallback(async () => {
    if (!newBadge.name.trim()) {
      toast.error('Badge name is required')
      return
    }

    setIsLoading(true)

    const createPromise = fetch('/api/badges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create',
        name: newBadge.name,
        description: newBadge.description,
        category: newBadge.category,
        rarity: newBadge.rarity,
        xp_value: newBadge.xp_value,
        skills: newBadge.skills.split(',').map(s => s.trim()).filter(Boolean),
        is_public: newBadge.is_public
      })
    }).then(async (res) => {
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create badge')
      }
      return res.json()
    })

    toast.promise(createPromise, {
      loading: 'Creating badge...',
      success: (data) => {
        if (data.badge) {
          setBadges(prev => [data.badge, ...prev])
        }
        setCreateDialogOpen(false)
        setNewBadge({
          name: '',
          description: '',
          category: 'achievement',
          rarity: 'common',
          xp_value: 100,
          skills: '',
          is_public: true
        })
        return `Badge "${data.badge?.name || newBadge.name}" created successfully!`
      },
      error: (err) => err.message || 'Failed to create badge'
    })

    try {
      await createPromise
    } finally {
      setIsLoading(false)
    }
  }, [newBadge])

  const handleAwardBadge = useCallback(async () => {
    if (!selectedBadge || !selectedMember) {
      toast.error('Please select a badge and team member')
      return
    }

    setIsLoading(true)

    const awardPromise = fetch('/api/badges/award', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        badge_id: selectedBadge.id,
        user_id: selectedMember.id,
        reason: awardReason
      })
    }).then(async (res) => {
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to award badge')
      }
      return res.json()
    })

    toast.promise(awardPromise, {
      loading: `Awarding "${selectedBadge.name}" to ${selectedMember.name}...`,
      success: (data) => {
        setAwardDialogOpen(false)
        setSelectedBadge(null)
        setSelectedMember(null)
        setAwardReason('')
        return data.message || `Badge awarded to ${selectedMember.name}!`
      },
      error: (err) => err.message || 'Failed to award badge'
    })

    try {
      await awardPromise
    } finally {
      setIsLoading(false)
    }
  }, [selectedBadge, selectedMember, awardReason])

  const handleDeleteBadge = useCallback(async () => {
    if (!selectedBadge) return

    if (!confirm(`Are you sure you want to delete "${selectedBadge.name}"? This action cannot be undone.`)) {
      return
    }

    setIsLoading(true)

    const deletePromise = fetch(`/api/badges?id=${selectedBadge.id}`, {
      method: 'DELETE'
    }).then(async (res) => {
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete badge')
      }
      return res.json()
    })

    toast.promise(deletePromise, {
      loading: 'Deleting badge...',
      success: () => {
        setBadges(prev => prev.filter(b => b.id !== selectedBadge.id))
        setUserBadges(prev => prev.filter(ub => ub.badge_id !== selectedBadge.id))
        setDeleteDialogOpen(false)
        setSelectedBadge(null)
        return `Badge "${selectedBadge.name}" deleted successfully`
      },
      error: (err) => err.message || 'Failed to delete badge'
    })

    try {
      await deletePromise
    } finally {
      setIsLoading(false)
    }
  }, [selectedBadge])

  const handleShareBadge = useCallback(async (userBadge: UserBadge) => {
    const shareData = {
      title: `I earned the ${userBadge.badge.name} badge!`,
      text: userBadge.badge.description,
      url: `${window.location.origin}/badges/${userBadge.badge_id}`
    }

    // Try native Web Share API first
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)

        // Record the share in the backend
        fetch('/api/badges', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'share',
            user_badge_id: userBadge.id
          })
        }).catch(() => {})

        // Update local state
        setUserBadges(prev => prev.map(ub =>
          ub.id === userBadge.id
            ? { ...ub, share_count: ub.share_count + 1 }
            : ub
        ))

        toast.success('Badge shared successfully!')
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          // User didn't cancel, show fallback
          await fallbackShare(userBadge)
        }
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      await fallbackShare(userBadge)
    }
  }, [])

  const fallbackShare = async (userBadge: UserBadge) => {
    const shareUrl = `${window.location.origin}/badges/${userBadge.badge_id}`

    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Badge link copied to clipboard!')

      // Record the share
      fetch('/api/badges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'share',
          user_badge_id: userBadge.id
        })
      }).catch(() => {})

      setUserBadges(prev => prev.map(ub =>
        ub.id === userBadge.id
          ? { ...ub, share_count: ub.share_count + 1 }
          : ub
      ))
    } catch {
      toast.error('Failed to copy link')
    }
  }

  const handleDownloadBadge = useCallback(async (badge: BadgeData) => {
    setIsLoading(true)

    try {
      // Create a canvas to render the badge
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas not supported')

      // Set canvas size
      canvas.width = 400
      canvas.height = 400

      // Draw background based on rarity
      const gradients: Record<BadgeRarity, string[]> = {
        common: ['#9CA3AF', '#6B7280'],
        uncommon: ['#22C55E', '#16A34A'],
        rare: ['#3B82F6', '#2563EB'],
        epic: ['#A855F7', '#9333EA'],
        legendary: ['#F59E0B', '#D97706']
      }

      const gradient = ctx.createLinearGradient(0, 0, 400, 400)
      gradient.addColorStop(0, gradients[badge.rarity][0])
      gradient.addColorStop(1, gradients[badge.rarity][1])
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(200, 200, 180, 0, Math.PI * 2)
      ctx.fill()

      // Draw inner circle
      ctx.fillStyle = '#FFFFFF'
      ctx.beginPath()
      ctx.arc(200, 200, 160, 0, Math.PI * 2)
      ctx.fill()

      // Draw badge name
      ctx.fillStyle = '#1F2937'
      ctx.font = 'bold 24px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(badge.name, 200, 180)

      // Draw level
      ctx.font = '16px Arial'
      ctx.fillStyle = '#6B7280'
      ctx.fillText(`Level ${badge.level} - ${badge.rarity.toUpperCase()}`, 200, 210)

      // Draw XP
      ctx.font = '20px Arial'
      ctx.fillStyle = gradients[badge.rarity][0]
      ctx.fillText(`${badge.xp_value} XP`, 200, 250)

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error('Failed to generate badge image')
          return
        }

        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${badge.name.toLowerCase().replace(/\s+/g, '-')}-badge.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        toast.success(`Badge "${badge.name}" downloaded!`)
      }, 'image/png')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download badge')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handlePinBadge = useCallback(async (userBadge: UserBadge) => {
    const newPinned = !userBadge.is_pinned

    // Optimistic update
    setUserBadges(prev => prev.map(ub =>
      ub.id === userBadge.id ? { ...ub, is_pinned: newPinned } : ub
    ))

    try {
      const response = await fetch('/api/badges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'pin',
          user_badge_id: userBadge.id,
          is_pinned: newPinned
        })
      })

      if (!response.ok) throw new Error('Failed to update pin status')

      toast.success(newPinned ? 'Badge pinned to profile' : 'Badge unpinned')
    } catch {
      // Revert on error
      setUserBadges(prev => prev.map(ub =>
        ub.id === userBadge.id ? { ...ub, is_pinned: !newPinned } : ub
      ))
      toast.error('Failed to update pin status')
    }
  }, [])

  // Badge Card Component
  const BadgeCard = ({ badge, userBadge, showActions = true }: {
    badge: BadgeData;
    userBadge?: UserBadge;
    showActions?: boolean
  }) => {
    const rarity = rarityConfig[badge.rarity]
    const isEarned = !!userBadge

    return (
      <Card className={`group hover:shadow-lg transition-all duration-200 ${isEarned ? '' : 'opacity-75'}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Badge Icon */}
            <div className={`relative w-16 h-16 rounded-full flex items-center justify-center ${rarity.bgColor} ${rarity.color}`}>
              <Award className="w-8 h-8" />
              {userBadge?.is_pinned && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                  <Pin className="w-3 h-3 text-white" />
                </div>
              )}
            </div>

            {/* Badge Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold truncate">{badge.name}</h3>
                <BadgeUI variant="outline" className={`${rarity.color} ${rarity.bgColor} text-xs`}>
                  {badge.rarity}
                </BadgeUI>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{badge.description}</p>

              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  {categoryIcons[badge.category]}
                  {badge.category}
                </span>
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {badge.xp_value} XP
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {badge.holders}
                </span>
              </div>

              {/* Skills */}
              {badge.skills.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {badge.skills.slice(0, 3).map((skill, idx) => (
                    <BadgeUI key={idx} variant="secondary" className="text-xs">
                      {skill}
                    </BadgeUI>
                  ))}
                  {badge.skills.length > 3 && (
                    <BadgeUI variant="secondary" className="text-xs">
                      +{badge.skills.length - 3}
                    </BadgeUI>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            {showActions && (
              <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {userBadge ? (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handlePinBadge(userBadge)}
                      title={userBadge.is_pinned ? 'Unpin' : 'Pin to profile'}
                    >
                      {userBadge.is_pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleShareBadge(userBadge)}
                      title="Share badge"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDownloadBadge(badge)}
                      title="Download badge"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setSelectedBadge(badge)
                        setDetailDialogOpen(true)
                      }}
                      title="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setSelectedBadge(badge)
                        setAwardDialogOpen(true)
                      }}
                      title="Award badge"
                    >
                      <Gift className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Earned info */}
          {userBadge && (
            <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Earned {new Date(userBadge.awarded_at).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Share2 className="w-3 h-3" />
                Shared {userBadge.share_count} times
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            Badges & Achievements
          </h1>
          <p className="text-muted-foreground">
            Earn, collect, and share your achievements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Badge
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-amber-500" />
            <div className="text-2xl font-bold">{stats.earned_badges}</div>
            <div className="text-xs text-muted-foreground">Badges Earned</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{stats.total_badges}</div>
            <div className="text-xs text-muted-foreground">Total Available</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Sparkles className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">{stats.total_xp.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Total XP</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Pin className="w-8 h-8 mx-auto mb-2 text-rose-500" />
            <div className="text-2xl font-bold">{stats.pinned_count}</div>
            <div className="text-xs text-muted-foreground">Pinned</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{stats.completion_rate}%</div>
            <div className="text-xs text-muted-foreground">Completion</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search badges..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="milestone">Milestone</SelectItem>
            <SelectItem value="achievement">Achievement</SelectItem>
            <SelectItem value="collaboration">Collaboration</SelectItem>
            <SelectItem value="technical">Technical</SelectItem>
            <SelectItem value="leadership">Leadership</SelectItem>
            <SelectItem value="community">Community</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedRarity} onValueChange={setSelectedRarity}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Rarity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Rarities</SelectItem>
            <SelectItem value="common">Common</SelectItem>
            <SelectItem value="uncommon">Uncommon</SelectItem>
            <SelectItem value="rare">Rare</SelectItem>
            <SelectItem value="epic">Epic</SelectItem>
            <SelectItem value="legendary">Legendary</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center border rounded-md">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-9 w-9 rounded-r-none"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-9 w-9 rounded-l-none"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList>
          <TabsTrigger value="my-badges" className="flex items-center gap-2">
            <Medal className="h-4 w-4" />
            My Badges ({filteredUserBadges.length})
          </TabsTrigger>
          <TabsTrigger value="all-badges" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            All Badges ({filteredBadges.length})
          </TabsTrigger>
          <TabsTrigger value="award" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            Award Badges
          </TabsTrigger>
        </TabsList>

        {/* My Badges Tab */}
        <TabsContent value="my-badges" className="mt-6">
          {filteredUserBadges.length === 0 ? (
            <Card className="p-12 text-center">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No badges earned yet</h3>
              <p className="text-muted-foreground mb-4">
                Start completing achievements to earn your first badge!
              </p>
              <Button onClick={() => setActiveTab('all-badges')}>
                Browse Available Badges
              </Button>
            </Card>
          ) : (
            <div className={viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'flex flex-col gap-3'
            }>
              {filteredUserBadges.map((userBadge) => (
                <BadgeCard
                  key={userBadge.id}
                  badge={userBadge.badge}
                  userBadge={userBadge}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* All Badges Tab */}
        <TabsContent value="all-badges" className="mt-6">
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'flex flex-col gap-3'
          }>
            {filteredBadges.map((badge) => {
              const userBadge = userBadges.find(ub => ub.badge_id === badge.id)
              return (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                  userBadge={userBadge}
                />
              )
            })}
          </div>
        </TabsContent>

        {/* Award Badges Tab */}
        <TabsContent value="award" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Select Badge */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Select Badge to Award
                </CardTitle>
                <CardDescription>
                  Choose a badge to award to a team member
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {badges.map((badge) => {
                      const rarity = rarityConfig[badge.rarity]
                      const isSelected = selectedBadge?.id === badge.id
                      return (
                        <div
                          key={badge.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                          }`}
                          onClick={() => setSelectedBadge(badge)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${rarity.bgColor} ${rarity.color}`}>
                              <Award className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{badge.name}</span>
                                <BadgeUI variant="outline" className={`${rarity.color} text-xs`}>
                                  {badge.rarity}
                                </BadgeUI>
                              </div>
                              <p className="text-xs text-muted-foreground">{badge.xp_value} XP</p>
                            </div>
                            {isSelected && <Check className="w-5 h-5 text-primary" />}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Select Team Member */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Select Team Member
                </CardTitle>
                <CardDescription>
                  Choose who should receive the badge
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {mockTeamMembers.map((member) => {
                      const isSelected = selectedMember?.id === member.id
                      return (
                        <div
                          key={member.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                          }`}
                          onClick={() => setSelectedMember(member)}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback>
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="font-medium">{member.name}</div>
                              <p className="text-xs text-muted-foreground">
                                {member.badges_count} badges | {member.xp} XP
                              </p>
                            </div>
                            {isSelected && <Check className="w-5 h-5 text-primary" />}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>

                {/* Award Reason */}
                <div className="mt-4 space-y-2">
                  <Label>Reason for awarding (optional)</Label>
                  <Textarea
                    placeholder="Why is this person receiving this badge?"
                    value={awardReason}
                    onChange={(e) => setAwardReason(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Award Button */}
                <Button
                  className="w-full mt-4"
                  disabled={!selectedBadge || !selectedMember || isLoading}
                  onClick={handleAwardBadge}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Awarding...
                    </>
                  ) : (
                    <>
                      <Gift className="w-4 h-4 mr-2" />
                      Award Badge
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Badge Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create New Badge
            </DialogTitle>
            <DialogDescription>
              Design a new badge for your team to earn
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Badge Name *</Label>
              <Input
                placeholder="e.g., Innovation Champion"
                value={newBadge.name}
                onChange={(e) => setNewBadge(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe what this badge represents..."
                value={newBadge.description}
                onChange={(e) => setNewBadge(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={newBadge.category}
                  onValueChange={(v) => setNewBadge(prev => ({ ...prev, category: v as BadgeCategory }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="milestone">Milestone</SelectItem>
                    <SelectItem value="achievement">Achievement</SelectItem>
                    <SelectItem value="collaboration">Collaboration</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="leadership">Leadership</SelectItem>
                    <SelectItem value="community">Community</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Rarity</Label>
                <Select
                  value={newBadge.rarity}
                  onValueChange={(v) => setNewBadge(prev => ({ ...prev, rarity: v as BadgeRarity }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="common">Common</SelectItem>
                    <SelectItem value="uncommon">Uncommon</SelectItem>
                    <SelectItem value="rare">Rare</SelectItem>
                    <SelectItem value="epic">Epic</SelectItem>
                    <SelectItem value="legendary">Legendary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>XP Value</Label>
              <Input
                type="number"
                min={0}
                value={newBadge.xp_value}
                onChange={(e) => setNewBadge(prev => ({ ...prev, xp_value: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Skills (comma-separated)</Label>
              <Input
                placeholder="e.g., Leadership, Innovation, Teamwork"
                value={newBadge.skills}
                onChange={(e) => setNewBadge(prev => ({ ...prev, skills: e.target.value }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Public Badge</Label>
              <Switch
                checked={newBadge.is_public}
                onCheckedChange={(v) => setNewBadge(prev => ({ ...prev, is_public: v }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateBadge} disabled={isLoading || !newBadge.name.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Badge'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Badge Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-md">
          {selectedBadge && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${rarityConfig[selectedBadge.rarity].bgColor} ${rarityConfig[selectedBadge.rarity].color}`}>
                    <Award className="w-4 h-4" />
                  </div>
                  {selectedBadge.name}
                </DialogTitle>
                <DialogDescription>
                  {selectedBadge.description}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <BadgeUI variant="outline" className={rarityConfig[selectedBadge.rarity].color}>
                    {selectedBadge.rarity}
                  </BadgeUI>
                  <BadgeUI variant="secondary">
                    {selectedBadge.category}
                  </BadgeUI>
                  <BadgeUI variant="secondary">
                    Level {selectedBadge.level}
                  </BadgeUI>
                  <BadgeUI variant="secondary">
                    {selectedBadge.xp_value} XP
                  </BadgeUI>
                </div>

                {selectedBadge.skills.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Skills</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedBadge.skills.map((skill, idx) => (
                        <BadgeUI key={idx} variant="outline" className="text-xs">
                          {skill}
                        </BadgeUI>
                      ))}
                    </div>
                  </div>
                )}

                {selectedBadge.requirements.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Requirements</Label>
                    <ul className="mt-1 space-y-1">
                      {selectedBadge.requirements.map((req, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          {req.completed ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <div className="w-4 h-4 border rounded" />
                          )}
                          {req.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{selectedBadge.holders.toLocaleString()} holders</span>
                  <span>Created {new Date(selectedBadge.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setDetailDialogOpen(false)
                  setAwardDialogOpen(true)
                }}>
                  <Gift className="w-4 h-4 mr-2" />
                  Award This Badge
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
