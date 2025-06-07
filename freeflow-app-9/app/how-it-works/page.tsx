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
  CheckCircle,
  ArrowRight,
  Play,
  Palette,
  Clock,
  Target,
  Rocket,
  ExternalLink
} from 'lucide-react'

const steps = [
  {
    number: 1,
    icon: Upload,
    title: "Upload Your Work",
    description: "Upload your creative projects, documents, and files to your secure workspace.",
    details: [
      "Drag & drop file uploads",
      "Support for all file types", 
      "Automatic file organization",
      "Version control system"
    ],
    time: "2 minutes"
  },
  {
    number: 2,
    icon: Palette,
    title: "Customize Your Presentation",
    description: "Brand your project pages with custom colors, logos, and layouts.",
    details: [
      "Custom branding options",
      "Professional templates",
      "Mobile-responsive design", 
      "White-label solutions"
    ],
    time: "5 minutes"
  },
  {
    number: 3,
    icon: Share2,
    title: "Share with Clients",
    description: "Send secure, password-protected links to clients for review and approval.",
    details: [
      "Secure sharing links",
      "Password protection",
      "Access controls",
      "Real-time notifications"
    ],
    time: "1 minute"
  },
  {
    number: 4,
    icon: CreditCard,
    title: "Get Paid Instantly",
    description: "Clients can approve and pay for projects directly through your branded pages.",
    details: [
      "Integrated payment processing",
      "Multiple payment methods",
      "Automated invoicing",
      "Instant notifications"
    ],
    time: "Instant"
  }
]

export default function HowItWorksPage() {
  const [activeStep, setActiveStep] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <SiteHeader />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <Badge className="mb-6 bg-green-100 text-green-800 hover:bg-green-200">
              <Target className="w-4 h-4 mr-2" />
              Simple Process
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              How FreeflowZee
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
                {" "}Works
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
              From upload to payment in just 4 simple steps. See how thousands of creatives 
              are streamlining their workflow and getting paid faster.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/demo">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  <Play className="w-5 h-5 mr-2" />
                  Watch Interactive Demo
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="lg" variant="outline">
                  <Rocket className="w-5 h-5 mr-2" />
                  Start Free Trial
                </Button>
              </Link>
            </div>

            {/* Process Overview */}
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Upload</h3>
                  <p className="text-sm text-gray-600">Add your files</p>
                </div>
                <div>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Palette className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Customize</h3>
                  <p className="text-sm text-gray-600">Brand your pages</p>
                </div>
                <div>
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Share2 className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Share</h3>
                  <p className="text-sm text-gray-600">Send to clients</p>
                </div>
                <div>
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Get Paid</h3>
                  <p className="text-sm text-gray-600">Receive payments</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Steps */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Step-by-Step Process
              </h2>
              <p className="text-xl text-gray-600">
                Follow these simple steps to transform your creative workflow
              </p>
            </div>

            <div className="space-y-16">
              {steps.map((step, index) => (
                <div key={index} className={`flex flex-col lg:flex-row items-center gap-12 ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}>
                  <div className="flex-1">
                    <Card className={`hover:shadow-xl transition-all duration-300 ${
                      activeStep === index ? 'ring-2 ring-green-500 shadow-lg' : ''
                    }`}>
                      <CardHeader>
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
                            <span className="text-green-600 font-bold text-lg">{step.number}</span>
                          </div>
                          <div className="p-3 bg-gray-100 rounded-lg">
                            <step.icon className="w-8 h-8 text-gray-700" />
                          </div>
                        </div>
                        <CardTitle className="text-2xl">{step.title}</CardTitle>
                        <CardDescription className="text-lg">{step.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3 mb-6">
                          {step.details.map((detail, idx) => (
                            <li key={idx} className="flex items-center space-x-3">
                              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                              <span className="text-gray-700">{detail}</span>
                            </li>
                          ))}
                        </ul>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>Takes {step.time}</span>
                          </div>
                          <Button 
                            onClick={() => setActiveStep(index)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Learn More
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="flex-1">
                    <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <step.icon className="w-16 h-16 mx-auto mb-4" />
                        <p className="text-lg font-medium">Step {step.number} Preview</p>
                        <p className="text-sm">{step.title}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to streamline your workflow?
            </h2>
            <p className="text-xl text-green-100 mb-10">
              Join thousands of creatives who have transformed their business with FreeflowZee.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
                  <Rocket className="w-5 h-5 mr-2" />
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                  <Play className="w-5 h-5 mr-2" />
                  Try Interactive Demo
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