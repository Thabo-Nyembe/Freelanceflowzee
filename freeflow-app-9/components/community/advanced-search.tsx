"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import {
  Search,
  Filter,
  X,
  MapPin,
  DollarSign,
  Star,
  Briefcase,
  Clock,
  CheckCircle,
  Crown,
  Globe
} from 'lucide-react'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('AdvancedSearch')

// ============================================================================
// TYPES
// ============================================================================

export interface SearchFilters {
  query?: string
  type?: 'members' | 'posts' | 'jobs' | 'events' | 'all'
  category?: string
  skills?: string[]
  location?: string
  minRating?: number
  maxRating?: number
  minBudget?: number
  maxBudget?: number
  availability?: string[]
  verified?: boolean
  premium?: boolean
  dateRange?: {
    start?: string
    end?: string
  }
  sortBy?: 'relevance' | 'recent' | 'rating' | 'popularity' | 'budget'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
  tags?: string[]
  languages?: string[]
  timezone?: string
  experienceLevel?: string[]
  memberCategory?: string[]
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void
  initialFilters?: SearchFilters
  type?: 'members' | 'posts' | 'jobs' | 'events' | 'all'
}

// ============================================================================
// ADVANCED SEARCH COMPONENT
// ============================================================================

export function AdvancedSearch({
  onSearch,
  initialFilters = {},
  type = 'all'
}: AdvancedSearchProps) {
  // State
  const [filters, setFilters] = useState<SearchFilters>({
    type,
    sortBy: 'relevance',
    sortOrder: 'desc',
    page: 1,
    limit: 20,
    ...initialFilters
  })

  const [showFilters, setShowFilters] = useState(false)
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)

  // Skill suggestions
  const skillSuggestions = [
    'React', 'Node.js', 'Python', 'UI/UX', 'Figma',
    'TypeScript', 'AWS', 'Docker', 'GraphQL', 'MongoDB',
    'Vue.js', 'Angular', 'Django', 'Flutter', 'Swift'
  ]

  const locations = [
    'Remote', 'New York, NY', 'San Francisco, CA', 'London, UK',
    'Toronto, CA', 'Berlin, DE', 'Austin, TX', 'Seattle, WA'
  ]

  const categories = [
    'All Categories',
    'Web Development',
    'Mobile Development',
    'Design',
    'Marketing',
    'Writing',
    'Video/Animation',
    'Data Science',
    'DevOps'
  ]

  const availabilityOptions = [
    'available',
    'busy',
    'away'
  ]

  const experienceLevels = [
    'entry',
    'intermediate',
    'expert'
  ]

  const memberCategories = [
    'freelancer',
    'client',
    'agency',
    'student'
  ]

  // Update active filters count
  useEffect(() => {
    let count = 0

    if (filters.query) count++
    if (filters.category && filters.category !== 'All Categories') count++
    if (filters.skills && filters.skills.length > 0) count++
    if (filters.location) count++
    if (filters.minRating !== undefined) count++
    if (filters.minBudget !== undefined || filters.maxBudget !== undefined) count++
    if (filters.availability && filters.availability.length > 0) count++
    if (filters.verified !== undefined) count++
    if (filters.premium !== undefined) count++
    if (filters.tags && filters.tags.length > 0) count++
    if (filters.languages && filters.languages.length > 0) count++
    if (filters.experienceLevel && filters.experienceLevel.length > 0) count++
    if (filters.memberCategory && filters.memberCategory.length > 0) count++

    setActiveFiltersCount(count)
  }, [filters])

  // Handlers
  const handleSearch = () => {
    logger.info('Advanced search executed', {
      ...filters,
      activeFiltersCount
    })
    onSearch(filters)
    setShowFilters(false)
  }

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch()
  }

  const handleClearFilters = () => {
    setFilters({
      type,
      sortBy: 'relevance',
      sortOrder: 'desc',
      page: 1,
      limit: 20
    })
    logger.info('Filters cleared')
  }

  const handleAddSkill = (skill: string) => {
    const currentSkills = filters.skills || []
    if (!currentSkills.includes(skill)) {
      setFilters({ ...filters, skills: [...currentSkills, skill] })
    }
  }

  const handleRemoveSkill = (skill: string) => {
    const currentSkills = filters.skills || []
    setFilters({
      ...filters,
      skills: currentSkills.filter(s => s !== skill)
    })
  }

  const handleToggleAvailability = (availability: string) => {
    const current = filters.availability || []
    const updated = current.includes(availability)
      ? current.filter(a => a !== availability)
      : [...current, availability]

    setFilters({ ...filters, availability: updated })
  }

  const handleToggleExperience = (level: string) => {
    const current = filters.experienceLevel || []
    const updated = current.includes(level)
      ? current.filter(l => l !== level)
      : [...current, level]

    setFilters({ ...filters, experienceLevel: updated })
  }

  const handleToggleMemberCategory = (category: string) => {
    const current = filters.memberCategory || []
    const updated = current.includes(category)
      ? current.filter(c => c !== category)
      : [...current, category]

    setFilters({ ...filters, memberCategory: updated })
  }

  return (
    <div className="w-full">
      {/* Quick Search Bar */}
      <form onSubmit={handleQuickSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder={`Search ${type === 'all' ? 'community' : type}...`}
            value={filters.query || ''}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            className="pl-10 pr-10"
          />
          {filters.query && (
            <button
              type="button"
              onClick={() => setFilters({ ...filters, query: '' })}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <Dialog open={showFilters} onOpenChange={setShowFilters}>
          <DialogTrigger asChild>
            <Button variant="outline" type="button" className="relative">
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge className="ml-2 bg-blue-600 text-white">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Advanced Search Filters</DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Category */}
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={filters.category || 'All Categories'}
                  onValueChange={(value) =>
                    setFilters({ ...filters, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <Label>Skills</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(filters.skills || []).map(skill => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="cursor-pointer hover:bg-red-100"
                      onClick={() => handleRemoveSkill(skill)}
                    >
                      {skill}
                      <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {skillSuggestions
                    .filter(s => !(filters.skills || []).includes(s))
                    .slice(0, 10)
                    .map(skill => (
                      <Badge
                        key={skill}
                        variant="outline"
                        className="cursor-pointer hover:bg-blue-50"
                        onClick={() => handleAddSkill(skill)}
                      >
                        + {skill}
                      </Badge>
                    ))}
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </Label>
                <Select
                  value={filters.location || ''}
                  onValueChange={(value) =>
                    setFilters({ ...filters, location: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any location</SelectItem>
                    {locations.map(loc => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Rating */}
              {type === 'members' && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Minimum Rating
                  </Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[filters.minRating || 0]}
                      onValueChange={([value]) =>
                        setFilters({ ...filters, minRating: value })
                      }
                      min={0}
                      max={5}
                      step={0.5}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-12">
                      {(filters.minRating || 0).toFixed(1)}+
                    </span>
                  </div>
                </div>
              )}

              {/* Budget Range */}
              {type === 'jobs' && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Budget Range (USD)
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-gray-500">Min</Label>
                      <Input
                        type="number"
                        value={filters.minBudget || ''}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            minBudget: e.target.value ? parseInt(e.target.value) : undefined
                          })
                        }
                        placeholder="$0"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Max</Label>
                      <Input
                        type="number"
                        value={filters.maxBudget || ''}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            maxBudget: e.target.value ? parseInt(e.target.value) : undefined
                          })
                        }
                        placeholder="Any"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Availability */}
              {type === 'members' && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Availability
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {availabilityOptions.map(avail => (
                      <Badge
                        key={avail}
                        variant={(filters.availability || []).includes(avail) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => handleToggleAvailability(avail)}
                      >
                        {avail.charAt(0).toUpperCase() + avail.slice(1)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience Level */}
              {type === 'jobs' && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Experience Level
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {experienceLevels.map(level => (
                      <Badge
                        key={level}
                        variant={(filters.experienceLevel || []).includes(level) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => handleToggleExperience(level)}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Member Category */}
              {type === 'members' && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Member Type
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {memberCategories.map(cat => (
                      <Badge
                        key={cat}
                        variant={(filters.memberCategory || []).includes(cat) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => handleToggleMemberCategory(cat)}
                      >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Verified & Premium */}
              {type === 'members' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Verified Only
                    </Label>
                    <Switch
                      checked={filters.verified || false}
                      onCheckedChange={(checked) =>
                        setFilters({ ...filters, verified: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Crown className="w-4 h-4" />
                      Premium Members Only
                    </Label>
                    <Switch
                      checked={filters.premium || false}
                      onCheckedChange={(checked) =>
                        setFilters({ ...filters, premium: checked })
                      }
                    />
                  </div>
                </div>
              )}

              {/* Sort By */}
              <div className="space-y-2">
                <Label>Sort By</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    value={filters.sortBy || 'relevance'}
                    onValueChange={(value: any) =>
                      setFilters({ ...filters, sortBy: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="rating">Rating</SelectItem>
                      <SelectItem value="popularity">Popularity</SelectItem>
                      {type === 'jobs' && <SelectItem value="budget">Budget</SelectItem>}
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.sortOrder || 'desc'}
                    onValueChange={(value: any) =>
                      setFilters({ ...filters, sortOrder: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Descending</SelectItem>
                      <SelectItem value="asc">Ascending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleClearFilters}
                disabled={activeFiltersCount === 0}
              >
                Clear All
              </Button>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowFilters(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSearch}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Button type="submit">
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
      </form>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {filters.category && filters.category !== 'All Categories' && (
            <Badge variant="secondary">
              Category: {filters.category}
              <button
                onClick={() => setFilters({ ...filters, category: undefined })}
                className="ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {filters.location && (
            <Badge variant="secondary">
              Location: {filters.location}
              <button
                onClick={() => setFilters({ ...filters, location: undefined })}
                className="ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {filters.minRating !== undefined && filters.minRating > 0 && (
            <Badge variant="secondary">
              Rating: {filters.minRating}+
              <button
                onClick={() => setFilters({ ...filters, minRating: undefined })}
                className="ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {(filters.skills || []).map(skill => (
            <Badge key={skill} variant="secondary">
              {skill}
              <button onClick={() => handleRemoveSkill(skill)} className="ml-1">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
