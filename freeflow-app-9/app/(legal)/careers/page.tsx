'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SiteHeader } from '@/components/navigation/site-header'
import { SiteFooter } from '@/components/navigation/site-footer'
import { 
  Users, 
  MapPin, 
  Clock, 
  Briefcase, 
  Heart, 
  Zap, 
  Coffee,
  Lightbulb,
  ArrowRight,
  ExternalLink
} from 'lucide-react'

const openPositions = [
  {
    title: 'Senior Frontend Developer',
    department: 'Engineering',
    location: 'Remote / San Francisco',
    type: 'Full-time',
    description: 'Help build the future of creative collaboration with React, TypeScript, and modern web technologies.',
    requirements: ['5+ years React experience', 'TypeScript proficiency', 'Creative problem solving'],
    level: 'Senior'
  },
  {
    title: 'Product Designer',
    department: 'Design',
    location: 'Remote / New York',
    type: 'Full-time',
    description: 'Design beautiful, intuitive experiences for creators and their clients worldwide.',
    requirements: ['UI/UX design expertise', 'Figma proficiency', 'User research experience'],
    level: 'Mid-Senior'
  },
  {
    title: 'Customer Success Manager',
    department: 'Customer Success',
    location: 'Remote',
    type: 'Full-time',
    description: 'Help our customers succeed and grow their creative businesses using FreeflowZee.',
    requirements: ['Customer success experience', 'Creative industry knowledge', 'Communication skills'],
    level: 'Mid-level'
  },
  {
    title: 'DevOps Engineer',
    department: 'Engineering',
    location: 'Remote / San Francisco',
    type: 'Full-time',
    description: 'Scale our infrastructure to support millions of creative professionals worldwide.',
    requirements: ['AWS/Cloud experience', 'CI/CD pipelines', 'Monitoring & observability'],
    level: 'Senior'
  }
]

const benefits = [
  {
    icon: Heart,
    title: 'Health & Wellness',
    description: 'Comprehensive health, dental, and vision insurance plus wellness stipend'
  },
  {
    icon: Coffee,
    title: 'Remote-First Culture',
    description: 'Work from anywhere with flexible hours and home office stipend'
  },
  {
    icon: Lightbulb,
    title: 'Learning & Development',
    description: '$2,000 annual learning budget plus conference attendance'
  },
  {
    icon: Zap,
    title: 'Equity & Growth',
    description: 'Competitive equity package and clear career progression paths'
  },
  {
    icon: Users,
    title: 'Team Culture',
    description: 'Collaborative environment with quarterly team retreats'
  },
  {
    icon: Briefcase,
    title: 'Time Off',
    description: 'Unlimited PTO plus company-wide recharge weeks'
  }
]

const values = [
  {
    title: 'Creator-First',
    description: 'Everything we do is designed to empower creative professionals and help them succeed.'
  },
  {
    title: 'Quality Over Speed',
    description: 'We believe in building things right, with attention to detail and long-term thinking.'
  },
  {
    title: 'Inclusive & Diverse',
    description: 'We foster an environment where everyone can contribute their unique perspectives.'
  },
  {
    title: 'Continuous Learning',
    description: 'We embrace curiosity, experimentation, and learning from both successes and failures.'
  }
]

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      
      <main>
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-3xl mx-auto">
              <Badge className="mb-6 bg-indigo-100 text-indigo-800 px-4 py-2">
                <Users className="w-4 h-4 mr-2" />
                Join our mission
              </Badge>
              
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Build the Future of
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> Creative Work</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8">
                Join a passionate team helping millions of creators showcase their work, 
                collaborate with clients, and build successful businesses.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                  View Open Positions
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button size="lg" variant="outline">
                  Learn About Our Culture
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Our Values
              </h2>
              <p className="text-lg text-gray-600">
                The principles that guide how we work and build together
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value) => (
                <Card key={value.title} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl text-indigo-600 mb-2">
                      {value.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Why Work With Us
              </h2>
              <p className="text-lg text-gray-600">
                We invest in our people because they're the heart of everything we do
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit) => (
                <Card key={benefit.title} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center mb-4">
                      <div className="p-2 bg-indigo-100 rounded-lg mr-4">
                        <benefit.icon className="w-6 h-6 text-indigo-600" />
                      </div>
                      <CardTitle className="text-xl">
                        {benefit.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Open Positions */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Open Positions
              </h2>
              <p className="text-lg text-gray-600">
                Find your next career opportunity with us
              </p>
            </div>

            <div className="space-y-6">
              {openPositions.map((position, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="text-xl font-semibold text-gray-900 mr-3">
                            {position.title}
                          </h3>
                          <Badge className="bg-indigo-100 text-indigo-800">
                            {position.level}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600 mb-3 space-x-4">
                          <div className="flex items-center">
                            <Briefcase className="w-4 h-4 mr-1" />
                            {position.department}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {position.location}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {position.type}
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-3">
                          {position.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-2">
                          {position.requirements.map((req, reqIndex) => (
                            <Badge key={reqIndex} variant="outline" className="text-xs">
                              {req}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mt-4 lg:mt-0 lg:ml-6">
                        <Button className="w-full lg:w-auto bg-indigo-600 hover:bg-indigo-700">
                          Apply Now
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <p className="text-gray-600 mb-4">
                Don't see a role that fits? We're always looking for talented people.
              </p>
              <Link href="/contact">
                <Button variant="outline" size="lg">
                  Get in Touch
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to Make an Impact?
            </h2>
            <p className="text-xl text-indigo-100 mb-8">
              Join us in building tools that empower creative professionals worldwide
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
                <Users className="w-5 h-5 mr-2" />
                View All Positions
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-indigo-600">
                Learn About Our Mission
              </Button>
            </div>
            
            <p className="text-sm text-indigo-200 mt-6">
              Equal opportunity employer • Remote-first • Competitive benefits
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
} 