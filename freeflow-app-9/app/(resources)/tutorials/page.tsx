'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, PlayCircle, Clock, BookOpen, Star, Users, Zap, TrendingUp } from 'lucide-react'

const tutorialCategories = [
  { id: 'getting-started', name: 'Getting Started', icon: BookOpen, count: 12 },
  { id: 'project-management', name: 'Project Management', icon: Zap, count: 8 },
  { id: 'client-communication', name: 'Client Communication', icon: Users, count: 6 },
  { id: 'business-growth', name: 'Business Growth', icon: TrendingUp, count: 10 },
  { id: 'advanced-features', name: 'Advanced Features', icon: Star, count: 14 }
]

const featuredTutorials = [
  {
    id: 1,
    title: 'Complete Guide to Setting Up Your FreeflowZee Account',
    description: 'Learn how to optimize your profile, set up your services, and get your first client',
    duration: '15 min',
    level: 'Beginner',
    views: '12.4k',
    rating: 4.9,
    thumbnail: '/images/tutorials/setup-guide.jpg',
    category: 'getting-started'
  },
  {
    id: 2,
    title: 'Advanced Project Management Strategies',
    description: 'Master project workflows, deadlines, and client collaboration features',
    duration: '22 min',
    level: 'Advanced',
    views: '8.7k',
    rating: 4.8,
    thumbnail: '/images/tutorials/project-mgmt.jpg',
    category: 'project-management'
  },
  {
    id: 3,
    title: 'Building Long-Term Client Relationships',
    description: 'Communication strategies that lead to repeat business and referrals',
    duration: '18 min',
    level: 'Intermediate',
    views: '15.2k',
    rating: 4.9,
    thumbnail: '/images/tutorials/client-relations.jpg',
    category: 'client-communication'
  }
]

const allTutorials = [
  ...featuredTutorials,
  {
    id: 4,
    title: 'Setting Up Automated Invoicing',
    description: 'Configure recurring invoices and payment reminders',
    duration: '12 min',
    level: 'Intermediate',
    views: '6.3k',
    rating: 4.7,
    category: 'business-growth'
  },
  {
    id: 5,
    title: 'Using AI-Powered Project Insights',
    description: 'Leverage AI analytics to optimize your freelance business',
    duration: '20 min',
    level: 'Advanced',
    views: '4.1k',
    rating: 4.8,
    category: 'advanced-features'
  },
  {
    id: 6,
    title: 'Creating Professional Proposals',
    description: 'Write compelling proposals that win clients',
    duration: '16 min',
    level: 'Beginner',
    views: '9.8k',
    rating: 4.6,
    category: 'getting-started'
  }
]

export default function TutorialsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLevel, setSelectedLevel] = useState('all')

  const filteredTutorials = allTutorials.filter(tutorial => {
    const matchesSearch = tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tutorial.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || tutorial.category === selectedCategory
    const matchesLevel = selectedLevel === 'all' || tutorial.level.toLowerCase() === selectedLevel.toLowerCase()
    
    return matchesSearch && matchesCategory && matchesLevel
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <SiteHeader />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            FreeflowZee Tutorials
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Master your freelance business with our comprehensive video tutorials. 
            From setup to advanced strategies, learn everything you need to succeed.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search tutorials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          "
          <div className="flex flex-wrap justify-center gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white"
            >"
              <option value="all">All Categories</option>
              {tutorialCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white"
            >"
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Categories Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
          {tutorialCategories.map(category => {
            const Icon = category.icon
            return (
              <Card 
                key={category.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedCategory === category.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <CardContent className="p-4 text-center">
                  <Icon className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <h3 className="font-semibold text-sm">{category.name}</h3>
                  <p className="text-xs text-gray-500">{category.count} tutorials</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Featured Tutorials */}
        {searchQuery === '' && selectedCategory === 'all' && selectedLevel === 'all' && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Tutorials</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredTutorials.map(tutorial => (
                <Card key={tutorial.id} className="group hover:shadow-lg transition-all">
                  <div className="relative">
                    <div className="aspect-video bg-gray-200 rounded-t-lg flex items-center justify-center">
                      <PlayCircle className="w-16 h-16 text-blue-600 group-hover:scale-110 transition-transform" />
                    </div>
                    <Badge className="absolute top-2 right-2 bg-blue-600">
                      {tutorial.level}
                    </Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{tutorial.title}</CardTitle>
                    <CardDescription>{tutorial.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Clock size={16} />
                        {tutorial.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star size={16} className="text-yellow-500" />
                        {tutorial.rating}
                      </div>
                    </div>
                    <Button className="w-full group-hover:bg-blue-700 transition-colors">
                      Watch Tutorial
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Tutorials */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {searchQuery || selectedCategory !== 'all' || selectedLevel !== 'all' 
                ? `Filtered Tutorials (${filteredTutorials.length})` 
                : 'All Tutorials'}
            </h2>
            <div className="text-sm text-gray-500">
              {filteredTutorials.length} tutorial{filteredTutorials.length !== 1 ? 's' : ''} found
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTutorials.map(tutorial => (
              <Card key={tutorial.id} className="group hover:shadow-lg transition-all">
                <div className="relative">
                  <div className="aspect-video bg-gray-200 rounded-t-lg flex items-center justify-center">
                    <PlayCircle className="w-12 h-12 text-blue-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <Badge className="absolute top-2 right-2 bg-blue-600">
                    {tutorial.level}
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-base">{tutorial.title}</CardTitle>
                  <CardDescription className="text-sm">{tutorial.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      {tutorial.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-yellow-500" />
                      {tutorial.rating}
                    </div>
                  </div>
                  <Button size="sm" className="w-full group-hover:bg-blue-700 transition-colors">
                    Watch Tutorial
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTutorials.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No tutorials found</h3>
              <p className="text-gray-600">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
            </div>
          )}
        </div>

        {/* Learning Path CTA */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Master FreeflowZee?</h2>
          <p className="text-xl mb-6 opacity-90">
            Follow our structured learning paths designed for your success level
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
              Start Beginner Path
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              Advanced Strategies
            </Button>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
