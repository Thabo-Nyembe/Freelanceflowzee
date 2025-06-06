import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { 
  Download, 
  Eye, 
  Heart, 
  Share2, 
  Star, 
  Calendar,
  User,
  Clock,
  DollarSign,
  CheckCircle,
  Play,
  Image as ImageIcon,
  FileText,
  Code
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Demo Project - FreeflowZee',
  description: 'Experience how FreeflowZee works with this interactive demo project showcasing our platform\'s capabilities.',
  keywords: ['demo', 'project', 'freelance', 'portfolio', 'showcase'],
}

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <SiteHeader variant="minimal" />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-indigo-100 text-indigo-800 hover:bg-indigo-200">
                🎯 Interactive Demo
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Brand Identity Design Package
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Experience how FreeflowZee works with this sample project. See how clients can view, 
                purchase, and download creative work seamlessly.
              </p>
              
              {/* Project Stats */}
              <div className="flex flex-wrap justify-center gap-6 mb-8">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Eye className="w-5 h-5" />
                  <span>1,247 views</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span>89 likes</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span>4.9 rating</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Download className="w-5 h-5" />
                  <span>156 downloads</span>
                </div>
              </div>
            </div>

            {/* Project Preview */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12">
              <div className="aspect-video bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <div className="text-center text-white">
                  <Play className="w-16 h-16 mx-auto mb-4 opacity-80" />
                  <p className="text-lg font-medium">Project Preview</p>
                  <p className="text-sm opacity-80">Click to view full presentation</p>
                </div>
              </div>
              
              {/* Project Info */}
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Project Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <User className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600">Created by Sarah Johnson</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600">Completed: December 2024</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600">Delivery: 5 business days</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-gray-600">100% Satisfaction Guaranteed</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">What's Included</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <ImageIcon className="w-5 h-5 text-indigo-500" />
                        <span className="text-gray-600">Logo variations (5 formats)</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-indigo-500" />
                        <span className="text-gray-600">Brand guidelines PDF</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Code className="w-5 h-5 text-indigo-500" />
                        <span className="text-gray-600">Source files (AI, PSD)</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Share2 className="w-5 h-5 text-indigo-500" />
                        <span className="text-gray-600">Social media kit</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card className="border-2 border-gray-200 hover:border-indigo-300 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Preview Access</span>
                    <Badge variant="secondary">Free</Badge>
                  </CardTitle>
                  <CardDescription>
                    View project details and low-res previews
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 mb-4">$0</div>
                  <Button variant="outline" className="w-full mb-4">
                    <Eye className="w-4 h-4 mr-2" />
                    View Preview
                  </Button>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>✓ Project overview</li>
                    <li>✓ Low-resolution previews</li>
                    <li>✓ Basic project details</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-indigo-500 shadow-lg relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-indigo-500 text-white">Most Popular</Badge>
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Standard License</span>
                    <Badge className="bg-indigo-100 text-indigo-800">Recommended</Badge>
                  </CardTitle>
                  <CardDescription>
                    Full access with commercial usage rights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 mb-4">
                    $299
                    <span className="text-lg font-normal text-gray-500">/project</span>
                  </div>
                  <Link href="/payment">
                    <Button className="w-full mb-4 bg-indigo-600 hover:bg-indigo-700">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Purchase Now
                    </Button>
                  </Link>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>✓ High-resolution files</li>
                    <li>✓ Commercial usage rights</li>
                    <li>✓ Source files included</li>
                    <li>✓ 30-day support</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-200 hover:border-indigo-300 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Extended License</span>
                    <Badge variant="outline">Premium</Badge>
                  </CardTitle>
                  <CardDescription>
                    Everything + unlimited usage and revisions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 mb-4">
                    $599
                    <span className="text-lg font-normal text-gray-500">/project</span>
                  </div>
                  <Button variant="outline" className="w-full mb-4">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Get Extended
                  </Button>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>✓ Everything in Standard</li>
                    <li>✓ Unlimited usage rights</li>
                    <li>✓ 2 free revisions</li>
                    <li>✓ Priority support</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Call to Action */}
            <div className="text-center bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Create Your Own Project?
              </h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Join thousands of creators who use FreeflowZee to showcase their work, 
                manage clients, and get paid instantly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                    Start Creating
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline">
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
} 