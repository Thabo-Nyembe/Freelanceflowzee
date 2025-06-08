'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Upload,
  Share2,
  CreditCard,
  Palette,
  Shield,
  BarChart3,
  Globe,
  Zap,
  Users,
  CheckCircle,
  ArrowRight,
  Star,
  Play,
  ExternalLink,
  Smartphone,
  Headphones,
  Award,
  Target,
  Rocket
} from 'lucide-react'

const mainFeatures = [
  {
    icon: Upload,
    title: "Smart File Management",
    description: "Upload, organize, and manage all your creative files in one secure workspace.",
    features: [
      "Drag & drop file uploads",
      "Automatic file organization",
      "Version control system",
      "Bulk file operations",
      "Advanced search & filtering"
    ],
    demo: "Try Upload",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Palette,
    title: "Custom Branding",
    description: "Create stunning, branded presentations that reflect your unique style.",
    features: [
      "Custom color schemes",
      "Logo integration",
      "Professional templates",
      "White-label solutions",
      "Mobile-responsive design"
    ],
    demo: "See Customization",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: Share2,
    title: "Secure Sharing",
    description: "Share your work with clients through password-protected, professional links.",
    features: [
      "Password protection",
      "Access controls",
      "Expiration dates",
      "Download permissions",
      "Real-time notifications"
    ],
    demo: "View Sharing",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: CreditCard,
    title: "Instant Payments",
    description: "Get paid faster with integrated payment processing and automated invoicing.",
    features: [
      "Stripe integration",
      "Multiple payment methods",
      "Automated invoicing",
      "Payment tracking",
      "Tax calculations"
    ],
    demo: "See Payments",
    color: "from-orange-500 to-red-500"
  }
]

const additionalFeatures = [
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    description: "Track project performance and client engagement with detailed analytics."
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-level encryption and security protocols protect your work."
  },
  {
    icon: Globe,
    title: "Global Reach",
    description: "Multi-currency support and international payment processing."
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Optimized for speed with global CDN and performance monitoring."
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Work together with team members and manage client communications."
  },
  {
    icon: Smartphone,
    title: "Mobile Optimized",
    description: "Perfect experience on all devices with responsive design."
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Get help when you need it with our dedicated support team."
  },
  {
    icon: Award,
    title: "Professional Templates",
    description: "Choose from dozens of professionally designed presentation templates."
  }
]

const featureCategories = [
  { id: 'all', name: 'All Features', count: 12 },
  { id: 'core', name: 'Core Features', count: 4 },
  { id: 'business', name: 'Business Tools', count: 3 },
  { id: 'security', name: 'Security & Privacy', count: 2 },
  { id: 'collaboration', name: 'Collaboration', count: 3 }
]

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Freelance Designer",
    company: "Creative Studio",
    content: "FreeflowZee has transformed how I present work to clients. The custom branding features make every presentation look professional.",
    rating: 5,
    avatar: "SJ"
  },
  {
    name: "Mike Chen",
    role: "Creative Director",
    company: "Design Agency",
    content: "The payment integration is seamless. We get paid 3x faster now, and clients love the professional experience.",
    rating: 5,
    avatar: "MC"
  },
  {
    name: "Emily Rodriguez",
    role: "Photographer",
    company: "Rodriguez Photography",
    content: "Perfect for sharing photo galleries with clients. The security features give me peace of mind.",
    rating: 5,
    avatar: "ER"
  }
]

const comparisonFeatures = [
  { feature: "File Upload & Management", freeflow: true, competitor1: true, competitor2: false },
  { feature: "Custom Branding", freeflow: true, competitor1: false, competitor2: true },
  { feature: "Payment Processing", freeflow: true, competitor1: false, competitor2: false },
  { feature: "Analytics Dashboard", freeflow: true, competitor1: true, competitor2: false },
  { feature: "White Label Solutions", freeflow: true, competitor1: false, competitor2: false },
  { feature: "24/7 Support", freeflow: true, competitor1: false, competitor2: true }
]

export default function FeaturesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [activeFeature, setActiveFeature] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [showComparison, setShowComparison] = useState(false)
  const [selectedTestimonial, setSelectedTestimonial] = useState(0)

  const handleDemo = (demo: string) => {
    switch (demo) {
      case "Try Upload":
        window.open('/signup', '_blank')
        break
      case "See Customization":
        window.open('/demo', '_blank')
        break
      case "View Sharing":
        window.open('/demo', '_blank')
        break
      case "See Payments":
        window.open('/payment', '_blank')
        break
      default:
        alert(`${demo} demo coming soon!`)
    }
  }

  const handleFeatureSearch = (term: string) => {
    setSearchTerm(term)
    setSelectedCategory('all')
  }

  const filteredFeatures = mainFeatures.filter(feature => {
    const matchesCategory = selectedCategory === 'all' || (() => {
      switch (selectedCategory) {
        case 'core': return ['Smart File Management', 'Custom Branding'].includes(feature.title)
        case 'business': return ['Secure Sharing', 'Instant Payments'].includes(feature.title)
        default: return true
      }
    })()
    
    const matchesSearch = searchTerm === '' || 
      feature.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feature.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feature.features.some(f => f.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <SiteHeader />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <Badge className="mb-6 bg-blue-100 text-blue-800 hover:bg-blue-200">
              <Rocket className="w-4 h-4 mr-2" />
              Powerful Features
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Everything You Need to
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {" "}Succeed
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
              From file management to payment processing, FreeflowZee provides all the tools 
              creative professionals need to streamline their workflow and grow their business.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/signup">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Play className="w-5 h-5 mr-2" />
                  Try All Features
                </Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline">
                  <ExternalLink className="w-5 h-5 mr-2" />
                  View Demo
                </Button>
              </Link>
            </div>

            {/* Search Bar */}
            <div className="max-w-md mx-auto mb-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search features..."
                  value={searchTerm}
                  onChange={(e) => handleFeatureSearch(e.target.value)}
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Feature Categories */}
            <div className="flex flex-wrap justify-center gap-2 mb-12">
              {featureCategories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="mb-2"
                >
                  {category.name}
                  <Badge variant="secondary" className="ml-2">
                    {category.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Main Features */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Core Features</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover the powerful features that make FreeflowZee the perfect solution for creative professionals.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredFeatures.map((feature, index) => (
                <Card 
                  key={index} 
                  className={`group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 ${
                    activeFeature === index ? 'border-blue-500 shadow-lg' : 'border-gray-200'
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {feature.features.map((item, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full group-hover:bg-blue-600 group-hover:text-white transition-colors"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDemo(feature.demo)
                      }}
                    >
                      {feature.demo}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Additional Features Grid */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Additional Features</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Even more tools and capabilities to enhance your creative workflow.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {additionalFeatures.map((feature, index) => (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 transition-colors">
                      <feature.icon className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Comparison */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">How We Compare</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                See how FreeflowZee stacks up against the competition.
              </p>
              <Button
                onClick={() => setShowComparison(!showComparison)}
                variant="outline"
                className="mt-4"
              >
                {showComparison ? 'Hide' : 'Show'} Detailed Comparison
              </Button>
            </div>

            {showComparison && (

            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-4 font-semibold text-gray-900">Feature</th>
                    <th className="text-center p-4 font-semibold text-blue-600">FreeflowZee</th>
                    <th className="text-center p-4 font-semibold text-gray-600">Competitor A</th>
                    <th className="text-center p-4 font-semibold text-gray-600">Competitor B</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((row, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4 text-gray-900">{row.feature}</td>
                      <td className="p-4 text-center">
                        {row.freeflow ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {row.competitor1 ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {row.competitor2 ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
          </div>
        </section>

        {/* Customer Testimonials */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Hear from creative professionals who&apos;ve transformed their workflow with FreeflowZee.
              </p>
            </div>

            {/* Featured Testimonial */}
            <div className="max-w-4xl mx-auto mb-12">
              <Card className="bg-white shadow-xl">
                <CardContent className="p-8 text-center">
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonials[selectedTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-xl text-gray-600 mb-6 italic">
                    &ldquo;{testimonials[selectedTestimonial].content}&rdquo;
                  </p>
                  <div className="flex items-center justify-center">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                      {testimonials[selectedTestimonial].avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonials[selectedTestimonial].name}</p>
                      <p className="text-sm text-gray-600">
                        {testimonials[selectedTestimonial].role}, {testimonials[selectedTestimonial].company}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Testimonial Navigation */}
            <div className="flex justify-center space-x-2 mb-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    selectedTestimonial === index ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {/* All Testimonials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card 
                  key={index} 
                  className={`bg-white hover:shadow-lg transition-all cursor-pointer ${
                    selectedTestimonial === index ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedTestimonial(index)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-600 mb-6 italic">&ldquo;{testimonial.content}&rdquo;</p>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{testimonial.name}</p>
                        <p className="text-sm text-gray-600">{testimonial.role}, {testimonial.company}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Experience All These Features?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                             Join thousands of creative professionals who&apos;ve already transformed their workflow with FreeflowZee.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  <Target className="w-5 h-5 mr-2" />
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  <Headphones className="w-5 h-5 mr-2" />
                  Contact Sales
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