'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Video,
  Play,
  Clock,
  Users,
  Star,
  Search,
  Filter,
  BookOpen,
  Download,
  ExternalLink,
  CheckCircle,
  ArrowRight,
  Zap,
  Settings,
  CreditCard,
  FileText,
  BarChart3,
  Shield
} from 'lucide-react'

const tutorialCategories = [
  { id: 'all', name: 'All Tutorials', count: 24 },
  { id: 'getting-started', name: 'Getting Started', count: 6 },
  { id: 'project-management', name: 'Project Management', count: 5 },
  { id: 'payments', name: 'Payments', count: 4 },
  { id: 'customization', name: 'Customization', count: 4 },
  { id: 'advanced', name: 'Advanced Features', count: 5 }
]

const tutorials = [
  {
    id: 1,
    title: "Getting Started with FreeflowZee",
    description: "Complete walkthrough of setting up your account and creating your first project",
    duration: "12:34",
    difficulty: "Beginner",
    category: "getting-started",
    views: "15.2k",
    rating: 4.9,
    thumbnail: "/api/placeholder/400/225",
    instructor: "Sarah Johnson",
    topics: ["Account Setup", "First Project", "Basic Navigation"]
  },
  {
    id: 2,
    title: "Setting Up Payment Processing",
    description: "Learn how to integrate Stripe and configure payment settings for your projects",
    duration: "18:45",
    difficulty: "Intermediate",
    category: "payments",
    views: "12.8k",
    rating: 4.8,
    thumbnail: "/api/placeholder/400/225",
    instructor: "Mike Chen",
    topics: ["Stripe Integration", "Payment Links", "Invoice Setup"]
  },
  {
    id: 3,
    title: "Custom Branding and White Labeling",
    description: "Customize your project pages with your brand colors, logos, and custom domains",
    duration: "22:15",
    difficulty: "Advanced",
    category: "customization",
    views: "9.4k",
    rating: 4.7,
    thumbnail: "/api/placeholder/400/225",
    instructor: "Emily Rodriguez",
    topics: ["Brand Settings", "Custom Domains", "White Label"]
  },
  {
    id: 4,
    title: "Project Management Best Practices",
    description: "Organize your projects efficiently and collaborate with clients seamlessly",
    duration: "16:20",
    difficulty: "Intermediate",
    category: "project-management",
    views: "11.1k",
    rating: 4.9,
    thumbnail: "/api/placeholder/400/225",
    instructor: "David Kim",
    topics: ["File Organization", "Client Collaboration", "Version Control"]
  },
  {
    id: 5,
    title: "Analytics and Performance Tracking",
    description: "Use FreeflowZee's analytics to track project performance and client engagement",
    duration: "14:30",
    difficulty: "Intermediate",
    category: "advanced",
    views: "8.7k",
    rating: 4.6,
    thumbnail: "/api/placeholder/400/225",
    instructor: "Lisa Wang",
    topics: ["Dashboard Analytics", "Client Insights", "Revenue Tracking"]
  },
  {
    id: 6,
    title: "Security and Privacy Settings",
    description: "Configure security settings, password protection, and privacy controls",
    duration: "11:45",
    difficulty: "Beginner",
    category: "getting-started",
    views: "7.3k",
    rating: 4.8,
    thumbnail: "/api/placeholder/400/225",
    instructor: "Alex Thompson",
    topics: ["Password Protection", "Access Controls", "Privacy Settings"]
  }
]

const featuredTutorial = {
  id: 'featured',
  title: "Complete FreeflowZee Masterclass",
  description: "A comprehensive 2-hour course covering everything from basic setup to advanced features",
  duration: "2:15:30",
  difficulty: "All Levels",
  views: "25.6k",
  rating: 4.9,
  instructor: "FreeflowZee Team",
  topics: ["Complete Setup", "Advanced Features", "Best Practices", "Pro Tips"]
}

const instructors = [
  { name: "Sarah Johnson", role: "Product Manager", tutorials: 8, avatar: "SJ" },
  { name: "Mike Chen", role: "Lead Developer", tutorials: 6, avatar: "MC" },
  { name: "Emily Rodriguez", role: "UX Designer", tutorials: 5, avatar: "ER" },
  { name: "David Kim", role: "Customer Success", tutorials: 5, avatar: "DK" }
]

export default function TutorialsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('popular')
  const [watchedTutorials, setWatchedTutorials] = useState<number[]>([1, 6])
  const [currentlyWatching, setCurrentlyWatching] = useState<number | null>(null)
  const [showLearningPath, setShowLearningPath] = useState(false)
  const [userProgress, setUserProgress] = useState({
    totalTutorials: tutorials.length,
    completed: 2,
    inProgress: 1,
    timeSpent: '4h 32m'
  })

  const filteredTutorials = tutorials.filter(tutorial => {
    const matchesSearch = tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tutorial.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tutorial.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || tutorial.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const sortedTutorials = [...filteredTutorials].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return b.id - a.id
      case 'duration':
        return a.duration.localeCompare(b.duration)
      case 'rating':
        return b.rating - a.rating
      default: // popular
        return parseInt(b.views.replace('k', '')) - parseInt(a.views.replace('k', ''))
    }
  })

  const handleTutorialClick = (tutorial: typeof tutorials[0]) => {
    setCurrentlyWatching(tutorial.id)
    if (!watchedTutorials.includes(tutorial.id)) {
      setWatchedTutorials([...watchedTutorials, tutorial.id])
      setUserProgress(prev => ({
        ...prev,
        completed: prev.completed + 1,
        inProgress: Math.max(0, prev.inProgress - 1)
      }))
    }
    alert(`Now watching: ${tutorial.title}. Interactive video player simulation!`)
  }

  const handleFeaturedClick = () => {
    setCurrentlyWatching(0)
    alert('Starting featured masterclass. Premium content simulation!')
  }

  const markAsWatched = (tutorialId: number) => {
    if (!watchedTutorials.includes(tutorialId)) {
      setWatchedTutorials([...watchedTutorials, tutorialId])
      setUserProgress(prev => ({
        ...prev,
        completed: prev.completed + 1
      }))
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'Advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-purple-50 to-pink-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Video className="w-16 h-16 text-purple-600 mx-auto mb-6" />
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Video Tutorials
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Learn FreeflowZee with step-by-step video guides. From beginner basics 
                to advanced techniques, master every feature at your own pace.
              </p>
              
              {/* Search and Filter */}
              <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="Search tutorials..."
                      className="pl-12 pr-4 py-3 text-lg bg-white border-gray-300 focus:border-purple-500 rounded-lg shadow-sm"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      suppressHydrationWarning
                    />
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-3 bg-white border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                  >
                    <option value="popular">Most Popular</option>
                    <option value="newest">Newest First</option>
                    <option value="duration">By Duration</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>

                {/* Category Filters */}
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {tutorialCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-4 py-2 rounded-full font-medium transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {category.name} ({category.count})
                    </button>
                  ))}
                </div>

                {/* Learning Path Toggle */}
                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={() => setShowLearningPath(!showLearningPath)}
                    className="bg-white hover:bg-purple-50 border-purple-300"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    {showLearningPath ? 'Hide' : 'Show'} Learning Path
                  </Button>
                </div>

                {/* Learning Path */}
                {showLearningPath && (
                  <div className="mt-8 max-w-2xl mx-auto">
                    <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                      <CardHeader>
                        <CardTitle className="text-purple-800 text-center">Recommended Learning Path</CardTitle>
                        <CardDescription className="text-center">Follow this sequence for the best learning experience</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {[
                            { id: 1, title: "Getting Started with FreeflowZee", completed: watchedTutorials.includes(1) },
                            { id: 6, title: "Security and Privacy Settings", completed: watchedTutorials.includes(6) },
                            { id: 4, title: "Project Management Best Practices", completed: watchedTutorials.includes(4) },
                            { id: 2, title: "Setting Up Payment Processing", completed: watchedTutorials.includes(2) },
                            { id: 3, title: "Custom Branding and White Labeling", completed: watchedTutorials.includes(3) },
                            { id: 5, title: "Analytics and Performance Tracking", completed: watchedTutorials.includes(5) }
                          ].map((item, index) => (
                            <div key={item.id} className={`flex items-center space-x-3 p-3 rounded-lg ${
                              item.completed ? 'bg-green-50 border border-green-200' : 'bg-white border border-gray-200'
                            }`}>
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold ${
                                item.completed ? 'bg-green-500 text-white' : 'bg-purple-500 text-white'
                              }`}>
                                {item.completed ? <CheckCircle className="w-4 h-4" /> : index + 1}
                              </div>
                              <span className={`flex-1 ${item.completed ? 'text-green-800' : 'text-gray-900'}`}>
                                {item.title}
                              </span>
                              {item.completed && (
                                <Badge className="bg-green-100 text-green-800">Completed</Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">24+</div>
                <div className="text-gray-600">Video Tutorials</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">5+</div>
                <div className="text-gray-600">Hours of Content</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">50k+</div>
                <div className="text-gray-600">Total Views</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">4.8</div>
                <div className="text-gray-600">Avg Rating</div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Tutorial */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Featured Masterclass
              </h2>
              <p className="text-lg text-gray-600">
                Our most comprehensive tutorial covering everything you need to know
              </p>
            </div>

            <Card className="max-w-4xl mx-auto hover:shadow-xl transition-shadow">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 rounded-t-lg md:rounded-l-lg md:rounded-t-none flex items-center justify-center cursor-pointer group" onClick={handleFeaturedClick}>
                    <div className="text-center">
                      <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-700 transition-colors">
                        <Play className="w-8 h-8 text-white ml-1" />
                      </div>
                      <p className="text-purple-600 font-medium">Watch Masterclass</p>
                    </div>
                  </div>
                </div>
                <div className="md:w-1/2 p-8">
                  <Badge className="mb-4 bg-purple-100 text-purple-800">Featured</Badge>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{featuredTutorial.title}</h3>
                  <p className="text-gray-600 mb-6">{featuredTutorial.description}</p>
                  
                  <div className="flex items-center space-x-6 mb-6 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{featuredTutorial.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{featuredTutorial.views} views</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span>{featuredTutorial.rating}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {featuredTutorial.topics.map((topic, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>

                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={handleFeaturedClick}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Masterclass
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Tutorial Grid */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  All Tutorials
                </h2>
                <p className="text-lg text-gray-600">
                  {sortedTutorials.length} tutorial{sortedTutorials.length !== 1 ? 's' : ''} found
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedTutorials.map((tutorial) => (
                <Card key={tutorial.id} className={`hover:shadow-lg transition-all cursor-pointer group ${
                  watchedTutorials.includes(tutorial.id) ? 'ring-2 ring-green-500' : ''
                } ${currentlyWatching === tutorial.id ? 'ring-2 ring-purple-500' : ''}`} 
                onClick={() => handleTutorialClick(tutorial)}>
                  <div className="relative">
                    <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors ${
                          watchedTutorials.includes(tutorial.id) 
                            ? 'bg-green-600 group-hover:bg-green-700' 
                            : 'bg-purple-600 group-hover:bg-purple-700'
                        }`}>
                          {watchedTutorials.includes(tutorial.id) ? (
                            <CheckCircle className="w-6 h-6 text-white" />
                          ) : (
                            <Play className="w-6 h-6 text-white ml-1" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {watchedTutorials.includes(tutorial.id) ? 'Completed' : 'Click to Play'}
                        </p>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                      {tutorial.duration}
                    </div>
                    {watchedTutorials.includes(tutorial.id) && (
                      <div className="absolute top-4 left-4 bg-green-500 text-white px-2 py-1 rounded text-sm">
                        ✓ Watched
                      </div>
                    )}
                    {currentlyWatching === tutorial.id && (
                      <div className="absolute bottom-4 left-4 bg-purple-500 text-white px-2 py-1 rounded text-sm">
                        Currently Watching
                      </div>
                    )}
                  </div>
                  
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={getDifficultyColor(tutorial.difficulty)}>
                        {tutorial.difficulty}
                      </Badge>
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span>{tutorial.rating}</span>
                      </div>
                    </div>
                    <CardTitle className="text-lg group-hover:text-purple-600 transition-colors">
                      {tutorial.title}
                    </CardTitle>
                    <CardDescription>{tutorial.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                      <span>By {tutorial.instructor}</span>
                      <span>{tutorial.views} views</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {tutorial.topics.slice(0, 2).map((topic, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                      {tutorial.topics.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{tutorial.topics.length - 2} more
                        </Badge>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        className="flex-1 group-hover:bg-purple-700 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleTutorialClick(tutorial)
                        }}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {watchedTutorials.includes(tutorial.id) ? 'Rewatch' : 'Watch'}
                      </Button>
                      {!watchedTutorials.includes(tutorial.id) && (
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            markAsWatched(tutorial.id)
                          }}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Instructors */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Meet Our Instructors
              </h2>
              <p className="text-lg text-gray-600">
                Learn from the FreeflowZee team and industry experts
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {instructors.map((instructor, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                      {instructor.avatar}
                    </div>
                    <CardTitle className="text-xl">{instructor.name}</CardTitle>
                    <CardDescription>{instructor.role}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 mb-1">
                        {instructor.tutorials}
                      </div>
                      <div className="text-sm text-gray-600">Tutorials</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to start learning?
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              Get hands-on experience with FreeflowZee through our comprehensive tutorials.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                  <Zap className="w-5 h-5 mr-2" />
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/docs">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Browse Documentation
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
} 