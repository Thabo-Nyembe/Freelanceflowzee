'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Star, Target, Headphones } from 'lucide-react'

const testimonials = [
  {
    name: "Sarah Connor",
    company: "TechFlow Inc",
    avatar: "SC",
    rating: 5,
    content: "FreeflowZee has completely transformed how I collaborate with clients. The feedback system is amazing!"
  },
  {
    name: "Mike Johnson",
    company: "Independent",
    avatar: "MJ", 
    rating: 5,
    content: "The AI-powered features save me hours of work every week. Highly recommended!"
  },
  {
    name: "Emily Chen",
    company: "Design Studios Pro",
    avatar: "EC",
    rating: 5,
    content: "The real-time collaboration features are game-changing for our remote team."
  }
]

export default function FeaturesPage() {
  const [selectedTestimonial, setSelectedTestimonial] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-violet-50/40">
      <SiteHeader />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-violet-600 via-rose-500 to-orange-400 bg-clip-text text-transparent mb-6">
                Powerful Features for
                <br />
                Creative Professionals
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Discover the comprehensive suite of tools designed to streamline your creative workflow,
                enhance collaboration, and deliver exceptional results.
              </p>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
              {[
                {
                  icon: Target,
                  title: "AI-Powered Creation",
                  description: "Advanced AI tools for content generation, editing, and optimization.",
                  features: ["GPT-4 Integration", "Smart Templates", "Auto-optimization"]
                },
                {
                  icon: Star,
                  title: "Real-time Collaboration",
                  description: "Work together seamlessly with your team in real-time.",
                  features: ["Live Editing", "Comment System", "Version Control"]
                },
                {
                  icon: Headphones,
                  title: "24/7 Support",
                  description: "Get help whenever you need it with our dedicated support team.",
                  features: ["Live Chat", "Video Calls", "Priority Support"]
                }
              ].map((feature, index) => (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/60 backdrop-blur-sm">
                  <CardContent className="p-8">
                    <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-rose-500 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-gray-600 mb-4">{feature.description}</p>
                    <ul className="space-y-2">
                      {feature.features.map((item, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-500">
                          <div className="w-1.5 h-1.5 bg-violet-500 rounded-full mr-3" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Testimonials Section */}
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-12">What Our Users Say</h2>
              <div className="max-w-4xl mx-auto">
                <Card className="border-0 bg-white/60 backdrop-blur-sm">
                  <CardContent className="p-8">
                    <div className="flex justify-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <blockquote className="text-lg italic text-gray-700 mb-6">
                      "{testimonials[selectedTestimonial].content}"
                    </blockquote>
                    <div className="flex items-center justify-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-rose-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {testimonials[selectedTestimonial].avatar}
                      </div>
                      <div>
                        <div className="font-semibold">{testimonials[selectedTestimonial].name}</div>
                        <div className="text-sm text-gray-500">{testimonials[selectedTestimonial].company}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Testimonial Navigation */}
                <div className="flex justify-center mt-6 space-x-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedTestimonial(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        selectedTestimonial === index
                          ? 'bg-violet-500'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center mt-20">
              <div className="bg-gradient-to-r from-violet-600 to-rose-500 rounded-2xl p-12 text-white">
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
                <p className="text-xl mb-8 opacity-90">
                  Join thousands of creative professionals who trust FreeflowZee
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" variant="secondary" className="bg-white text-violet-600 hover:bg-gray-100">
                    Start Free Trial
                  </Button>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-violet-600">
                    View Pricing
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
} 