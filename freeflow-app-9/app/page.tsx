import { Metadata } from 'next'
import { generatePageSEO, generateStructuredData, SEO_CONFIG } from '@/lib/seo-optimizer'
import { InteractiveContactSystem } from '@/components/interactive-contact-system'
import { SiteHeader } from '@/components/navigation/site-header'
import { SiteFooter } from '@/components/navigation/site-footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Play, 
  ArrowRight, 
  CheckCircle, 
  Star, 
  Users, 
  Building, 
  Zap,
  Shield,
  Globe,
  MessageCircle,
  TrendingUp,
  Award,
  Clock,
  Target,
  Rocket,
  BookOpen
} from 'lucide-react'
import Link from 'next/link'

// Context7 Pattern: Enhanced SEO with structured data
export const metadata = generatePageSEO('homepage', {
  title: 'FreeflowZee - Professional Freelance Management Platform | Get Started Free',
  description: 'The ultimate freelance management platform for creators, agencies, and clients. Streamline projects, collaborate seamlessly, and get paid faster with FreeflowZee. Trusted by 10,000+ freelancers worldwide. Start your free trial today.',
  keywords: 'freelance management, project collaboration, client portal, payment processing, best freelance management software 2024, client collaboration platform for designers, automated invoicing for freelancers, freelance platform 2024',
  other: {
    'google-site-verification': 'your-google-verification-code',
    'facebook-domain-verification': 'your-facebook-verification-code'
  }
})

// Context7 Pattern: Interactive Features Data
const FEATURES_DATA = [
  {
    icon: Users,
    title: 'Client Collaboration',
    description: 'Real-time feedback, comments, and approval workflows that keep projects moving forward.',
    benefits: ['Real-time commenting', 'Approval workflows', 'Client portals'],
    demo: '/demo/collaboration',
    interactive: true
  },
  {
    icon: Zap,
    title: 'Payment Processing',
    description: 'Automated invoicing, secure payments, and escrow protection for your peace of mind.',
    benefits: ['Automated invoicing', 'Escrow protection', 'Global payments'],
    demo: '/demo/payments',
    interactive: true
  },
  {
    icon: Shield,
    title: 'Project Management',
    description: 'Keep projects organized with timelines, milestones, and team collaboration tools.',
    benefits: ['Timeline tracking', 'Milestone management', 'Team coordination'],
    demo: '/demo/projects',
    interactive: true
  },
  {
    icon: Globe,
    title: 'File Sharing',
    description: 'Secure cloud storage with version control and real-time collaboration features.',
    benefits: ['Version control', 'Secure sharing', 'Real-time sync'],
    demo: '/demo/files',
    interactive: true
  }
]

const TESTIMONIALS = [
  {
    name: 'Sarah Chen',
    role: 'Freelance Designer',
    company: 'Design Studios Inc.',
    content: 'FreeflowZee transformed how I work with clients. The collaboration features are game-changing.',
    rating: 5,
    image: '/avatars/sarah-chen.jpg'
  },
  {
    name: 'Marcus Rivera',
    role: 'Creative Director',
    company: 'Rivera Creative',
    content: 'Best investment for my agency. Client communication is now seamless and professional.',
    rating: 5,
    image: '/avatars/marcus.jpg'
  },
  {
    name: 'Emily Watson',
    role: 'Freelance Developer',
    company: 'Watson Tech',
    content: 'The payment system alone saved me hours of administrative work every week.',
    rating: 5,
    image: '/avatars/emily.jpg'
  }
]

// Context7 Pattern: Stats with real-time updates
const PLATFORM_STATS = [
  { label: 'Active Users', value: '10,000+', icon: Users, growth: '+23%' },
  { label: 'Projects Completed', value: '50,000+', icon: CheckCircle, growth: '+45%' },
  { label: 'Countries Served', value: '120+', icon: Globe, growth: '+12%' },
  { label: 'Client Satisfaction', value: '98%', icon: Star, growth: '+2%' }
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50/30 to-white">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateStructuredData('Organization'))
        }}
      />
      
      <SiteHeader />
      
      {/* Hero Section with Enhanced Interactivity */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-purple-500/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium bg-white/80 backdrop-blur-sm">
              <Star className="w-4 h-4 mr-2 text-yellow-500" />
              Trusted by 10,000+ freelancers worldwide
            </Badge>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Create, Share & Get Paid
              </span>
              <br />
              <span className="text-gray-800">Like a Pro</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              The ultimate freelance management platform that streamlines your workflow, 
              enhances client collaboration, and gets you paid faster than ever before.
            </p>
            
            {/* Interactive CTA Section */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
                asChild
              >
                <Link href="/signup">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-gray-300 hover:border-purple-500 px-8 py-4 text-lg font-semibold hover:bg-purple-50 transition-all duration-300 group"
                asChild
              >
                <Link href="/demo">
                  <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                  Watch Demo
                </Link>
              </Button>
              
              <Button 
                variant="ghost" 
                size="lg" 
                className="text-gray-600 hover:text-purple-600 px-8 py-4 text-lg font-semibold hover:bg-white/50 transition-all duration-300"
                asChild
              >
                <Link href="/projects/demo">
                  View Sample Project
                </Link>
              </Button>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                No Credit Card Required
              </div>
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-2 text-blue-500" />
                Enterprise-Grade Security
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-purple-500" />
                Setup in 2 Minutes
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* User Types Section with Enhanced Interactivity */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Path to Success
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether you're a freelancer, agency, or client, FreeflowZee adapts to your unique workflow
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Creator Path */}
            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-purple-50 to-white hover:from-purple-100 hover:to-purple-50">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-purple-500 rounded-full mr-4 group-hover:scale-110 transition-transform">
                    <Rocket className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">For Creators</h3>
                    <p className="text-purple-600 font-medium">Freelancers & Agencies</p>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {[
                    'Professional project management',
                    'Client collaboration tools',
                    'Automated invoicing & payments',
                    'Time tracking & reporting',
                    'Portfolio showcase',
                    'Team collaboration'
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <div className="flex gap-3">
                  <Button 
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                    asChild
                  >
                    <Link href="/login?redirect=/dashboard">
                      Creator Login
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-purple-200 hover:border-purple-400"
                    asChild
                  >
                    <Link href="/demo">
                      Try Demo
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Client Path */}
            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white to-purple-50 hover:from-purple-50 hover:to-purple-100">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-purple-500 rounded-full mr-4 group-hover:scale-110 transition-transform">
                    <Building className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">For Clients</h3>
                    <p className="text-purple-600 font-medium">Businesses & Organizations</p>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {[
                    'Real-time project visibility',
                    'Easy feedback & approval',
                    'Secure file collaboration',
                    'Payment protection & escrow',
                    'Progress tracking',
                    'Quality assurance'
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <div className="flex gap-3">
                  <Button 
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                    asChild
                  >
                    <Link href="/projects">
                      View Projects
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-purple-200 hover:border-purple-400"
                    asChild
                  >
                    <Link href="/contact">
                      Get Started
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Interactive Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features That Work
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage projects, collaborate with clients, and grow your business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURES_DATA.map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="p-3 bg-purple-100 rounded-full w-fit mb-4 group-hover:bg-purple-200 transition-colors">
                    <feature.icon className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <ul className="space-y-2 mb-4">
                    {feature.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                  {feature.interactive && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                      asChild
                    >
                      <Link href={feature.demo}>
                        Try Interactive Demo
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Professionals Worldwide
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of successful freelancers and agencies
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {PLATFORM_STATS.map((stat, index) => (
              <Card key={index} className="text-center p-6 bg-white hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-purple-100 rounded-full">
                      <stat.icon className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600 mb-2">{stat.label}</div>
                  <div className="flex items-center justify-center text-sm">
                    <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
                    <span className="text-green-600 font-medium">{stat.growth}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Subscription Pricing Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Perfect Plan
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start free and scale as you grow. Transparent pricing with no hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <Card className="relative hover:shadow-xl transition-all duration-300 border border-gray-200">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
                  <p className="text-gray-600 mb-4">Perfect for getting started</p>
                  <div className="flex items-baseline justify-center mb-4">
                    <span className="text-5xl font-bold text-gray-900">$0</span>
                    <span className="text-xl text-gray-500 ml-2">/month</span>
                  </div>
                </div>
                
                <Button className="w-full mb-6 bg-gray-900 hover:bg-gray-800" asChild>
                  <Link href="/signup">
                    Start Free
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Up to 3 active projects</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Basic client collaboration</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">File sharing up to 1GB</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Standard templates</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Email support</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Professional Plan - Popular */}
            <Card className="relative hover:shadow-2xl transition-all duration-300 ring-2 ring-purple-500 shadow-xl scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              </div>
              
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Professional</h3>
                  <p className="text-gray-600 mb-4">For growing freelancers</p>
                  <div className="flex items-baseline justify-center mb-4">
                    <span className="text-5xl font-bold text-gray-900">$19</span>
                    <span className="text-xl text-gray-500 ml-2">/month</span>
                  </div>
                </div>
                
                <Button className="w-full mb-6 bg-purple-600 hover:bg-purple-700" asChild>
                  <Link href="/signup?plan=professional">
                    Start Free Trial
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Unlimited projects</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Advanced client portals</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">File sharing up to 100GB</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Custom branding</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Priority support</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Payment processing</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Advanced analytics</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="relative hover:shadow-xl transition-all duration-300 border border-gray-200">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
                  <p className="text-gray-600 mb-4">For agencies and teams</p>
                  <div className="flex items-baseline justify-center mb-4">
                    <span className="text-5xl font-bold text-gray-900">$49</span>
                    <span className="text-xl text-gray-500 ml-2">/month</span>
                  </div>
                </div>
                
                <Button className="w-full mb-6 bg-indigo-600 hover:bg-indigo-700" asChild>
                  <Link href="/contact?plan=enterprise">
                    Contact Sales
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Everything in Professional</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Unlimited team members</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">White-label solution</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Advanced security</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Dedicated account manager</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">SLA guarantee</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">API access</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          {/* Trust Badges */}
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">All plans include:</p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-2 text-green-500" />
                30-day money back guarantee
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2 text-green-500" />
                No setup fees
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-green-500" />
                Cancel anytime
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600">
              Real feedback from real professionals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, index) => (
              <Card key={index} className="bg-white hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                      <div className="text-sm text-gray-500">{testimonial.company}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Strategic Call-to-Action Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Workflow?
            </h2>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Join thousands of professionals who've already upgraded their freelance business
            </p>
          </div>
          
          {/* Three Strategic CTA Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Sales CTA */}
            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white to-purple-50 hover:from-purple-50 hover:to-white">
              <CardContent className="p-8 text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-200 transition-colors">
                  <Rocket className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Start Your Journey</h3>
                <p className="text-gray-600 mb-6">
                  Join 10,000+ professionals who've transformed their workflow with FreeflowZee's powerful platform.
                </p>
                <Button 
                  size="lg" 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg group-hover:shadow-xl transition-all"
                  asChild
                >
                  <Link href="/signup">
                    Start Free Trial
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <p className="text-sm text-gray-500 mt-3">
                  No credit card required • 14-day free trial
                </p>
              </CardContent>
            </Card>

            {/* Information CTA */}
            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white to-indigo-50 hover:from-indigo-50 hover:to-white">
              <CardContent className="p-8 text-center">
                <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-200 transition-colors">
                  <Users className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">See It In Action</h3>
                <p className="text-gray-600 mb-6">
                  Experience the power of seamless project management with our interactive demo and live examples.
                </p>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white shadow-lg group-hover:shadow-xl transition-all"
                  asChild
                >
                  <Link href="/demo">
                    Watch Live Demo
                    <Play className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <p className="text-sm text-gray-500 mt-3">
                  5-minute interactive walkthrough
                </p>
              </CardContent>
            </Card>

            {/* Brand Awareness CTA */}
            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white to-gray-50 hover:from-gray-50 hover:to-white">
              <CardContent className="p-8 text-center">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-gray-200 transition-colors">
                  <Star className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Learn & Grow</h3>
                <p className="text-gray-600 mb-6">
                  Access our comprehensive resource library, tutorials, and join our thriving community of creators.
                </p>
                <Button 
                  size="lg" 
                  variant="ghost"
                  className="w-full text-gray-700 hover:bg-gray-100 border-2 border-gray-300 hover:border-gray-400 shadow-lg group-hover:shadow-xl transition-all"
                  asChild
                >
                  <Link href="/resources">
                    Explore Resources
                    <BookOpen className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <p className="text-sm text-gray-500 mt-3">
                  Free guides • Tutorials • Community
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-12">
            <p className="text-white/80 mb-4">
              Ready to take your freelance business to the next level?
            </p>
            <Button 
              size="lg" 
              className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              asChild
            >
              <Link href="/contact">
                Talk to Our Team
                <MessageCircle className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
} 