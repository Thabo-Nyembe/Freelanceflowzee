import { Metadata } from "next";
import Link from 'next/link'
import { 
  Zap, 
  Upload, 
  Target,
  Brain,
  Shield,
  CheckCircle,
  Star,
  Globe,
  ArrowRight,
  Play
} from 'lucide-react'

const features = [
  {
    title: 'AI Create Studio',
    description: 'Premium AI content generation with GPT-4o, Claude, DALL-E, and Google AI for instant creative production.',
    icon: Brain,
    href: '/dashboard/ai-create',
    benefits: [
      'Access to 4 premium AI models (GPT-4o, Claude, DALL-E, Google AI)',
      'Generate images, copy, code, and multimedia content instantly',
      'Industry-specific templates for design, photography, music & video',
      'Cost-optimized AI usage with intelligent model switching'
    ]
  },
  {
    title: 'Universal Feedback',
    description: 'Revolutionary commenting system for videos, PDFs, designs with AI analysis and voice notes.',
    icon: Target,
    href: '/dashboard/collaboration',
    benefits: [
      'Comment on images, videos, PDFs, code files with precise positioning',
      'AI-powered feedback categorization and priority assessment',
      'Voice recording with waveform visualization and transcription',
      'Real-time collaboration with @mentions and emoji reactions'
    ]
  },
  {
    title: 'Secure Escrow Payments',
    description: 'Milestone-based payment protection with automated invoicing and multi-currency support.',
    icon: Shield,
    href: '/dashboard/escrow',
    benefits: [
      'Milestone-based escrow with automatic release triggers',
      'Stripe integration with global payment processing',
      'Professional invoice generation with tax calculations',
      'Real-time payment tracking and comprehensive analytics'
    ]
  },
  {
    title: 'My Day AI Planner',
    description: 'AI-powered daily productivity tool with intelligent scheduling and task optimization.',
    icon: Zap,
    href: '/dashboard/my-day',
    benefits: [
      'AI-powered daily schedule optimization and task prioritization',
      'Smart time estimates with productivity pattern analysis',
      'Automated client meeting scheduling across time zones',
      'Progress tracking with insights and efficiency recommendations'
    ]
  },
  {
    title: 'Multi-Cloud Storage',
    description: 'Smart file management with version control and 70% cost savings through intelligent routing.',
    icon: Upload,
    href: '/dashboard/files-hub',
    benefits: [
      'Hybrid cloud storage (Supabase + Wasabi S3) with smart routing',
      '70% cost optimization with automated file tier management',
      'Professional file sharing with WeTransfer-like experience',
      'Version control, permissions, and comprehensive analytics'
    ]
  }
]

const stats = [
  { value: '$15M+', label: 'Invoices Paid', subtext: 'Processed securely' },
  { value: '40+', label: 'Countries Served', subtext: 'Global reach' },
  { value: '<10min', label: 'Payout Release', subtext: 'Lightning fast' },
  { value: '25,000+', label: 'Creators & Teams', subtext: 'Growing community' }
]

const testimonials = [
  {
    quote: "Kazi transformed our workflow—saving us hours and ensuring timely payments.",
    author: "Sarah Jones",
    company: "Creative Co.",
    rating: 5
  },
  {
    quote: "Payments are lightning-fast. Kazi's integrated workspace is exceptional.",
    author: "Liam O'Reilly",
    company: "Freelance Designer",
    rating: 5
  }
]

const trustedBy = [
  "TechCrunch", "Product Hunt", "Forbes", "Wired", "Business Insider", "VentureBeat"
]

export const metadata: Metadata = {
  title: "Kazi – The Ultimate All-in-One Workspace for Freelancers & Agencies",
  description: "Kazi is your all-in-one platform for creating, collaborating, managing projects, and getting paid—seamlessly. Engineered in South Africa, used worldwide.",
  keywords: "freelance management software, AI project management platform, best freelance payment platform, escrow payment software, integrated workspace solution, secure online payments freelancers, project management for creatives, AI productivity tool, SaaS productivity solution, South African SaaS startup, global freelance workspace, Kazi workspace, AI project management, secure payments platform, all-in-one workspace, best SaaS for freelancers, creative project management, elegant productivity tools, African tech innovation",
  authors: [{ name: "Kazi Team" }],
  creator: "Kazi"
};

export default function Home() {
  return (
    <div className="min-h-screen kazi-bg-light dark:kazi-bg-dark">
      {/* Navigation Header */}
      <nav className="fixed top-0 w-full z-50 glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <img 
                src="/kazi-brand/logo.svg" 
                alt="KAZI" 
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold kazi-text-primary kazi-headline">KAZI</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/features" className="nav-item kazi-body-medium">Features</Link>
              <Link href="/pricing" className="nav-item kazi-body-medium">Pricing</Link>
              <Link href="/demo-features" className="nav-item kazi-body-medium">Demo</Link>
              <Link href="/login" className="btn-kazi-secondary px-4 py-2">Login</Link>
              <Link href="/signup" className="btn-kazi-primary px-4 py-2">Sign Up</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Kazi",
            "description": "All-in-one workspace for freelancers and agencies with AI content creation, secure payments, and project management",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "priceCurrency": "USD"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "ratingCount": "2500"
            },
            "creator": {
              "@type": "Organization",
              "name": "Kazi",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "ZA"
              }
            }
          })
        }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden kazi-fade-in pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-violet-bolt/10 dark:bg-violet-bolt/20 rounded-full kazi-text-primary text-sm font-medium mb-8 kazi-hover-scale">
              <Globe className="w-4 h-4 mr-2" />
              <span className="kazi-body-medium">Built in Africa. Engineered for the World.</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold kazi-text-dark dark:kazi-text-light mb-6 kazi-headline">
              Forget 6 tools. <span className="kazi-text-primary">Use one.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-12 kazi-body">
              Create, collaborate, manage projects, and handle payments—all beautifully integrated in one elegant workspace.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <button className="btn-kazi-primary kazi-ripple kazi-focus">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
              </Link>
              <Link href="/dashboard/video-studio">
                <button className="btn-kazi-secondary kazi-ripple kazi-focus">
                  <Play className="mr-2 w-5 h-5" />
                  Watch Demo
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="py-20 bg-white dark:bg-jet-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold kazi-text-dark dark:kazi-text-light mb-6 kazi-headline">
              Still Juggling Multiple Tools?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto kazi-body">
              Stop switching between Slack, Figma, Stripe, Dropbox, and more. Kazi integrates everything you need in one platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="kazi-fade-in">
              <h3 className="text-3xl font-bold kazi-text-dark dark:kazi-text-light mb-6 kazi-headline">
                One Platform. Infinite Possibilities.
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 kazi-body">
                Kazi integrates everything—AI content creation, project management, secure escrow payments—in one intuitive platform, enhancing productivity and cash flow.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <CheckCircle className="w-6 h-6 kazi-text-accent mr-3" />
                  <span className="text-gray-700 dark:text-gray-300 kazi-body">Reduce tool switching by 80%</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-6 h-6 kazi-text-accent mr-3" />
                  <span className="text-gray-700 dark:text-gray-300 kazi-body">Streamline payments and invoicing</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-6 h-6 kazi-text-accent mr-3" />
                  <span className="text-gray-700 dark:text-gray-300 kazi-body">Boost team productivity</span>
                </div>
              </div>
            </div>
            <div className="relative kazi-hover-scale">
              <div className="kazi-gradient-primary rounded-lg p-8 text-white text-center shadow-2xl">
                <p className="text-lg kazi-body-medium" style={{ color: '#F8F7F4' }}>Kazi Dashboard Preview</p>
                <div className="mt-4 text-sm opacity-90" style={{ color: '#F8F7F4' }}>
                  All-in-one workspace for modern teams
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 kazi-bg-light dark:kazi-bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold kazi-text-dark dark:kazi-text-light mb-6 kazi-headline">
              Everything You Need in One Place
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto kazi-body">
              Powerful features designed for modern freelancers, agencies, and creative teams
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="kazi-card kazi-hover-scale kazi-fade-in">
                <div className="p-6">
                  <div className="w-12 h-12 bg-violet-bolt/10 dark:bg-violet-bolt/20 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 kazi-text-primary" />
                  </div>
                  <h3 className="text-xl font-bold kazi-text-dark dark:kazi-text-light mb-2 kazi-headline">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 kazi-body">{feature.description}</p>
                  <Link href={feature.href}>
                    <button className="btn-kazi-secondary w-full kazi-ripple kazi-focus">
                      Learn More
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Indicators & Stats */}
      <section className="py-20 bg-white dark:bg-jet-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold kazi-text-dark dark:kazi-text-light mb-6 kazi-headline">
              Trusted by Leading Global Brands
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 kazi-body">
              Startups, agencies, and freelancers worldwide choose Kazi
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center kazi-hover-scale">
                <div className="text-4xl font-bold kazi-text-primary mb-2 kazi-headline">
                  {stat.value}
                </div>
                <div className="text-lg font-semibold kazi-text-dark dark:kazi-text-light kazi-body-medium">
                  {stat.label}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 kazi-body">
                  {stat.subtext}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 kazi-body">Featured In</p>
            <div className="flex flex-wrap justify-center gap-8">
              {trustedBy.map((brand, index) => (
                <span key={index} className="text-gray-600 dark:text-gray-300 font-medium kazi-body-medium kazi-hover-scale">
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-violet-bolt/5 dark:bg-violet-bolt/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold kazi-text-dark dark:kazi-text-light mb-6 kazi-headline">
              What Our Users Say
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="kazi-card kazi-hover-scale">
                <div className="p-8">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 kazi-text-accent fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-lg text-gray-700 dark:text-gray-300 mb-6 kazi-body">
                    "{testimonial.quote}"
                  </blockquote>
                  <cite className="kazi-text-dark dark:kazi-text-light font-semibold kazi-body-medium">
                    — {testimonial.author}, {testimonial.company}
                  </cite>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 kazi-gradient-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6 kazi-headline" style={{ color: '#F8F7F4' }}>
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto kazi-body" style={{ color: '#F8F7F4', opacity: 0.9 }}>
            Join thousands of freelancers and agencies who've streamlined their work with Kazi
          </p>
          <Link href="/login">
            <button className="bg-soft-ivory kazi-text-primary hover:bg-white px-8 py-4 text-lg font-semibold rounded-lg kazi-ripple kazi-focus kazi-hover-scale transition-all duration-300">
              Start Your Free Trial
              <ArrowRight className="ml-2 w-5 h-5 inline" />
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="kazi-bg-dark text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-300 kazi-body">
              Proudly engineered in South Africa • Serving freelancers, startups, and creative teams in 40+ countries worldwide.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}