import type { Metadata } from 'next'
import { SiteHeader } from '@/components/navigation/site-header'
import { SiteFooter } from '@/components/navigation/site-footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Newspaper,
  Download,
  ExternalLink,
  Calendar,
  Users,
  ArrowRight,
  Mail,
  Image,
  FileText
} from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Press & Media | FreeflowZee - News, Updates & Brand Assets',
  description: 'Latest press coverage, company updates, and downloadable brand assets for media and partners. Stay updated with FreeflowZee news and milestones.',
  keywords: 'FreeflowZee press, media coverage, brand assets, company news, press releases'
}

const PRESS_RELEASES = [
  {
    title: 'FreeflowZee Raises $2.5M Series A to Revolutionize Freelance Workflow Management',
    date: '2024-01-15',
    excerpt: 'Leading freelance platform secures funding to expand AI-powered project management tools and global market reach.',
    url: '/press/series-a-funding',
    featured: true
  },
  {
    title: 'FreeflowZee Launches AI-Powered Client Communication Suite',
    date: '2023-12-08', 
    excerpt: 'New suite includes automated project updates, smart scheduling, and intelligent feedback management for enhanced client relationships.',
    url: '/press/ai-communication-suite'
  },
  {
    title: 'Over 50,000 Freelancers Choose FreeflowZee for Project Management',
    date: '2023-11-20',
    excerpt: 'Platform reaches major milestone with rapid user growth and 98% customer satisfaction rating.',
    url: '/press/50k-users-milestone'
  },
  {
    title: 'FreeflowZee Partners with Major Design Communities',
    date: '2023-10-30',
    excerpt: 'Strategic partnerships with leading design communities to provide enhanced resources and networking opportunities.',
    url: '/press/design-community-partnerships'
  }
]

const MEDIA_COVERAGE = [
  {
    publication: 'TechCrunch',
    title: 'FreeflowZee is making freelance project management effortless',
    date: '2024-01-20',
    url: 'https://techcrunch.com/freeflowzee-review',
    logo: '/media/techcrunch-logo.png'
  },
  {
    publication: 'Product Hunt',
    title: '#1 Product of the Day - Revolutionary Freelance Platform',
    date: '2023-12-15',
    url: 'https://producthunt.com/posts/freeflowzee',
    logo: '/media/producthunt-logo.png'
  },
  {
    publication: 'Forbes',
    title: 'Top 10 Tools Every Freelancer Needs in 2024',
    date: '2023-11-25',
    url: 'https://forbes.com/freelance-tools-2024',
    logo: '/media/forbes-logo.png'
  },
  {
    publication: 'The Verge',
    title: 'How AI is transforming the freelance economy',
    date: '2023-10-18',
    url: 'https://theverge.com/ai-freelance-economy',
    logo: '/media/verge-logo.png'
  }
]

const BRAND_ASSETS = [
  {
    type: 'Logo Package',
    description: 'PNG, SVG, and vector formats in various sizes',
    size: '2.4 MB',
    downloadUrl: '/press/downloads/freeflowzee-logo-package.zip'
  },
  {
    type: 'Brand Guidelines',
    description: 'Complete brand guidelines including colors, typography, and usage',
    size: '8.7 MB',
    downloadUrl: '/press/downloads/freeflowzee-brand-guidelines.pdf'
  },
  {
    type: 'Product Screenshots',
    description: 'High-resolution product screenshots and mockups',
    size: '15.2 MB',
    downloadUrl: '/press/downloads/freeflowzee-screenshots.zip'
  },
  {
    type: 'Executive Photos',
    description: 'Professional headshots of leadership team',
    size: '5.8 MB',
    downloadUrl: '/press/downloads/freeflowzee-executive-photos.zip'
  }
]

export default function PressPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-r from-indigo-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium bg-indigo-100 text-indigo-700">
              <Newspaper className="w-4 h-4 mr-2" />
              Press & Media Center
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              FreeflowZee in the{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                News
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Stay updated with the latest FreeflowZee news, press releases, and media coverage. 
              Download brand assets and connect with our media team.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 px-8 py-4" asChild>
                <Link href="#press-releases">
                  <Newspaper className="w-5 h-5 mr-2" />
                  Latest News
                </Link>
              </Button>
              
              <Button size="lg" variant="outline" className="px-8 py-4" asChild>
                <Link href="#brand-assets">
                  <Download className="w-5 h-5 mr-2" />
                  Brand Assets
                </Link>
              </Button>
            </div>
            
            <div className="mt-8">
              <p className="text-sm text-gray-500 mb-2">Media Contact</p>
              <Button variant="link" className="text-indigo-600" asChild>
                <Link href="mailto:press@freeflowzee.com">
                  <Mail className="w-4 h-4 mr-2" />
                  press@freeflowzee.com
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Press Releases */}
      <section id="press-releases" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Press Releases
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Official company announcements and major milestones
            </p>
          </div>
          
          <div className="space-y-8">
            {PRESS_RELEASES.map((release, index) => (
              <Card key={index} className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${release.featured ? 'bg-gradient-to-r from-indigo-50 to-purple-50' : 'bg-white'}`}>
                <CardContent className="p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        {release.featured && (
                          <Badge variant="secondary" className="mr-3 bg-indigo-100 text-indigo-700">
                            Featured
                          </Badge>
                        )}
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(release.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{release.title}</h3>
                      <p className="text-gray-600 mb-4">{release.excerpt}</p>
                    </div>
                    <div className="lg:ml-6">
                      <Button variant="outline" className="w-full lg:w-auto" asChild>
                        <Link href={release.url}>
                          Read More
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Media Coverage */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Media Coverage
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Featured stories and mentions in leading publications
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {MEDIA_COVERAGE.map((coverage, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-indigo-600 mb-1">{coverage.publication}</div>
                      <h3 className="font-bold text-gray-900 mb-2">{coverage.title}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">{new Date(coverage.date).toLocaleDateString()}</span>
                        <Button size="sm" variant="ghost" asChild>
                          <Link href={coverage.url} target="_blank">
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Assets */}
      <section id="brand-assets" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Brand Assets
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Download logos, brand guidelines, and media resources
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {BRAND_ASSETS.map((asset, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Image className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{asset.type}</h3>
                  <p className="text-sm text-gray-600 mb-4">{asset.description}</p>
                  <p className="text-xs text-gray-500 mb-4">{asset.size}</p>
                  <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700" asChild>
                    <Link href={asset.downloadUrl}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Media Inquiries?
          </h2>
          <p className="text-xl text-indigo-100 max-w-3xl mx-auto mb-8">
            We're here to help with interviews, product demos, and any press-related questions.
          </p>
          
          <Button size="lg" variant="secondary" className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-4" asChild>
            <Link href="mailto:press@freeflowzee.com">
              <Mail className="w-5 h-5 mr-2" />
              Contact Press Team
            </Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
} 