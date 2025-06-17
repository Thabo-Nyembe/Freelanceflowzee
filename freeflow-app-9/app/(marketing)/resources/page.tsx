import type { Metadata } from 'next'
import { SiteHeader } from '@/components/navigation/site-header'
import { SiteFooter } from '@/components/navigation/site-footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  Video, 
  FileText, 
  Download, 
  Users, 
  ArrowRight,
  Star,
  Play,
  Clock,
  CheckCircle,
  Award,
  Lightbulb,
  TrendingUp,
  Target,
  Shield,
  Zap
} from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Free Resources & Guides | FreeflowZee - Grow Your Freelance Business',
  description: 'Access our comprehensive library of free guides, templates, tutorials, and tools designed to help freelancers and agencies scale their business and optimize workflows.',
  keywords: 'freelance resources, business templates, workflow guides, project management tools, client communication, pricing guides',
  openGraph: {
    title: 'Free Resources & Guides for Freelancers | FreeflowZee',
    description: 'Download free business templates, guides, and tools to grow your freelance business. Join thousands of successful creators.',
    type: 'website',
    url: 'https://freeflowzee.com/resources',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Freelance Resources & Business Growth Guides',
    description: 'Access premium business templates, pricing guides, and workflow optimization tools completely free.',
  }
}

const RESOURCE_CATEGORIES = [
  {
    id: 'templates',
    title: 'Business Templates',
    description: 'Professional templates to streamline your workflow',
    icon: FileText,
    count: '25+ templates',
    color: 'bg-purple-100 text-purple-600'
  },
  {
    id: 'guides',
    title: 'Business Guides',
    description: 'Comprehensive guides to grow your freelance business',
    icon: BookOpen,
    count: '15+ guides',
    color: 'bg-blue-100 text-blue-600'
  },
  {
    id: 'tutorials',
    title: 'Video Tutorials',
    description: 'Step-by-step video tutorials and walkthroughs',
    icon: Video,
    count: '30+ videos',
    color: 'bg-green-100 text-green-600'
  },
  {
    id: 'tools',
    title: 'Free Tools',
    description: 'Calculators, generators, and productivity tools',
    icon: Zap,
    count: '12+ tools',
    color: 'bg-orange-100 text-orange-600'
  }
]

const FEATURED_RESOURCES = [
  {
    title: 'Complete Freelance Business Starter Kit',
    description: 'Everything you need to launch a successful freelance business including contracts, proposals, and pricing guides.',
    category: 'Business Kit',
    downloadCount: '12,540',
    rating: 4.9,
    image: '/docs/brand-guidelines.pdf',
    downloadUrl: '/resources/download/starter-kit',
    features: ['Contract Templates', 'Proposal Framework', 'Pricing Calculator', 'Client Onboarding Checklist']
  },
  {
    title: 'Project Management Mastery Course',
    description: '5-hour comprehensive video course covering advanced project management techniques for creative professionals.',
    category: 'Video Course',
    downloadCount: '8,920',
    rating: 4.8,
    image: '/videos/brand-animation.mp4',
    downloadUrl: '/resources/watch/project-management',
    features: ['5 Hours of Content', 'Real Project Examples', 'Templates Included', 'Certificate of Completion']
  },
  {
    title: 'Client Communication Templates',
    description: 'Pre-written email templates for every stage of the client relationship, from initial contact to project completion.',
    category: 'Email Templates',
    downloadCount: '15,680',
    rating: 4.9,
    image: '/docs/brand-guidelines.pdf',
    downloadUrl: '/resources/download/email-templates',
    features: ['20+ Email Templates', 'Follow-up Sequences', 'Rejection Handling', 'Upselling Scripts']
  }
]

const FREE_TOOLS = [
  {
    title: 'Freelance Rate Calculator',
    description: 'Calculate your optimal hourly rate based on expenses, profit goals, and market conditions.',
    icon: Target,
    url: '/tools/rate-calculator',
    users: '25,000+',
    category: 'Pricing'
  },
  {
    title: 'Project Scope Generator',
    description: 'Generate detailed project scopes and statements of work in minutes.',
    icon: FileText,
    url: '/tools/scope-generator', 
    users: '18,500+',
    category: 'Planning'
  },
  {
    title: 'Time Tracking ROI Calculator',
    description: 'Discover how much money you could save with better time tracking.',
    icon: Clock,
    url: '/tools/time-roi-calculator',
    users: '12,300+',
    category: 'Productivity'
  },
  {
    title: 'Client Health Score Analyzer',
    description: 'Evaluate client relationships and identify potential issues early.',
    icon: TrendingUp,
    url: '/tools/client-analyzer',
    users: '9,800+',
    category: 'Analysis'
  }
]

const LEARNING_PATHS = [
  {
    title: 'Freelance Business Foundation',
    level: 'Beginner',
    duration: '2 weeks',
    modules: 8,
    description: 'Master the fundamentals of running a successful freelance business',
    skills: ['Business Setup', 'Legal Basics', 'Pricing Strategy', 'Client Acquisition'],
    url: '/learn/foundation'
  },
  {
    title: 'Advanced Project Management',
    level: 'Intermediate',
    duration: '3 weeks', 
    modules: 12,
    description: 'Advanced techniques for managing complex projects and client relationships',
    skills: ['Agile Methods', 'Risk Management', 'Team Coordination', 'Quality Control'],
    url: '/learn/project-management'
  },
  {
    title: 'Business Growth & Scaling',
    level: 'Advanced',
    duration: '4 weeks',
    modules: 16,
    description: 'Strategies for scaling your freelance business into an agency',
    skills: ['Team Building', 'Process Automation', 'Financial Management', 'Strategic Planning'],
    url: '/learn/scaling'
  }
]

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-r from-purple-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium bg-purple-100 text-purple-700">
              <Award className="w-4 h-4 mr-2" />
              100% Free • No Email Required
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Free Resources to{' '}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Grow Your Business
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Access our comprehensive library of templates, guides, and tools designed by successful freelancers and agencies. 
              Everything you need to build, optimize, and scale your creative business.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 px-8 py-4" asChild>
                <Link href="/signup">
                  <Download className="w-5 h-5 mr-2" />
                  Get Started Free
                </Link>
              </Button>
              
              <Button size="lg" variant="outline" className="px-8 py-4" asChild>
                <Link href="/demo">
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </Link>
              </Button>
            </div>
            
            <div className="flex items-center justify-center gap-8 mt-8 text-sm text-gray-500">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                50,000+ Downloads
              </div>
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-2 text-yellow-500" />
                4.9/5 Average Rating
              </div>
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-2 text-blue-500" />
                Always Free
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resource Categories */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need in One Place
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Organized by category for easy access. All resources are created by industry experts and updated regularly.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {RESOURCE_CATEGORIES.map((category) => (
              <Card key={category.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white">
                <CardContent className="p-8 text-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${category.color}`}>
                    <category.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{category.title}</h3>
                  <p className="text-gray-600 mb-4">{category.description}</p>
                  <Badge variant="secondary" className="mb-4">{category.count}</Badge>
                  <Button variant="ghost" className="w-full group-hover:bg-purple-50 group-hover:text-purple-600" asChild>
                    <Link href={`/resources/${category.id}`}>
                      Explore {category.title}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Resources */}
      <section id="featured-resources" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Most Popular Downloads
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our top-rated resources trusted by thousands of freelancers worldwide
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {FEATURED_RESOURCES.map((resource, index) => (
              <Card key={index} className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white to-gray-50">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      {resource.category}
                    </Badge>
                    <div className="flex items-center text-sm text-gray-500">
                      <Download className="w-4 h-4 mr-1" />
                      {resource.downloadCount}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{resource.title}</h3>
                  <p className="text-gray-600 mb-6">{resource.description}</p>
                  
                  <div className="flex items-center mb-6">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < Math.floor(resource.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">({resource.rating})</span>
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    {resource.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  
                  <Button className="w-full bg-purple-600 hover:bg-purple-700" asChild>
                    <Link href={resource.downloadUrl}>
                      {resource.category.includes('Video') ? (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Watch Now
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Download Free
                        </>
                      )}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Free Tools */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Free Business Tools
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful calculators and generators to optimize your business operations
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FREE_TOOLS.map((tool, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <tool.icon className="w-6 h-6 text-purple-600" />
                    </div>
                    <Badge variant="outline" className="text-xs">{tool.category}</Badge>
                  </div>
                  
                  <h3 className="font-bold text-gray-900 mb-2">{tool.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{tool.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{tool.users} users</span>
                    <Button size="sm" variant="ghost" className="group-hover:bg-purple-50 group-hover:text-purple-600" asChild>
                      <Link href={tool.url}>
                        Try Tool
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Paths */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Structured Learning Paths
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Follow our curated learning paths designed to take your skills to the next level
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {LEARNING_PATHS.map((path, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-purple-50">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-4">
                    <Badge 
                      variant="secondary" 
                      className={`${
                        path.level === 'Beginner' ? 'bg-green-100 text-green-700' :
                        path.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}
                    >
                      {path.level}
                    </Badge>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {path.duration}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{path.title}</h3>
                  <p className="text-gray-600 mb-4">{path.description}</p>
                  <p className="text-sm text-gray-500 mb-6">{path.modules} modules</p>
                  
                  <div className="space-y-2 mb-6">
                    {path.skills.map((skill, skillIndex) => (
                      <div key={skillIndex} className="flex items-center text-sm text-gray-600">
                        <Lightbulb className="w-4 h-4 mr-2 text-purple-500" />
                        {skill}
                      </div>
                    ))}
                  </div>
                  
                  <Button className="w-full bg-purple-600 hover:bg-purple-700" asChild>
                    <Link href={path.url}>
                      Start Learning Path
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Freelance Business?
          </h2>
          <p className="text-xl text-purple-100 max-w-3xl mx-auto mb-8">
            Join FreeflowZee and get access to our complete platform, plus exclusive premium resources and tools.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4" asChild>
              <Link href="/signup">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600 px-8 py-4" asChild>
              <Link href="/demo">
                Watch Demo
                <Play className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
} 