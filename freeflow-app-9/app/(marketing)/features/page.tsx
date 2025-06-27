'use client'

import { useState } from 'react'
import Link from 'next/link
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Star, Target, Headphones } from 'lucide-react

const testimonials = [
  {
    name: "Sarah Chen",
    role: "UX Designer", 
    company: "TechFlow Inc",
    avatar: "SC",
    rating: 5,
    content: "FreeflowZee has completely transformed how I collaborate with clients. The feedback system is amazing!
  },
  {
    name: "Mike Johnson",
    role: "Freelance Developer",
    company: "Independent",
    avatar: "MJ", 
    rating: 5,
    content: "The AI-powered features save me hours of work every week. Highly recommended!
  },
  {
    name: "Emily Davis",
    role: "Creative Director",
    company: "Design Studio",
    avatar: "ED",
    rating: 5,
    content: "Best project management tool for creative professionals. The collaboration features are top-notch.
  }
]

export default function FeaturesPage() {
  const [selectedTestimonial, setSelectedTestimonial] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-violet-50/40">
      <SiteHeader />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Powerful Features for
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Modern Creators</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Discover the comprehensive suite of tools designed to streamline your creative workflow and enhance client collaboration.
            </p>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
              What Our Users Say
            </h2>

            {/* Featured Testimonial */}
            <div className="text-center mb-12">
              <Card className="bg-white border-0 shadow-xl max-w-4xl mx-auto">
                <CardContent className="p-8">
                  <div className="flex justify-center mb-6">
                    {[...Array(testimonials[selectedTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-2xl text-gray-600 mb-8 italic">
                    &ldquo;{testimonials[selectedTestimonial].content}&rdquo;
                  </p>
                  <div className= "flex items-center justify-center">
                    <div className= "w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                      {testimonials[selectedTestimonial].avatar}
                    </div>
                    <div>
                      <p className= "font-semibold text-gray-900">{testimonials[selectedTestimonial].name}</p>
                      <p className= "text-sm text-gray-600">
                        {testimonials[selectedTestimonial].role}, {testimonials[selectedTestimonial].company}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Testimonial Navigation */}
            <div className= "flex justify-center space-x-2 mb-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    selectedTestimonial === index ? 'bg-blue-600' : 'bg-gray-300
                  }`}
                />
              ))}
            </div>

            {/* All Testimonials Grid */}
            <div className= "grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card 
                  key={index} 
                  className={`bg-white hover:shadow-lg transition-all cursor-pointer ${
                    selectedTestimonial === index ? 'ring-2 ring-blue-500' : 
                  }`}
                  onClick={() => setSelectedTestimonial(index)}
                >
                  <CardContent className= "p-6">
                    <div className= "flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className= "w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className= "text-gray-600 mb-6 italic">&ldquo;{testimonial.content}&rdquo;</p>
                    <div className= "flex items-center">
                      <div className= "w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className= "font-semibold text-gray-900">{testimonial.name}</p>
                        <p className= "text-sm text-gray-600">{testimonial.role}, {testimonial.company}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className= "py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className= "max-w-4xl mx-auto text-center">
            <h2 className= "text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Experience All These Features?
            </h2>
            <p className= "text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                             Join thousands of creative professionals who've already transformed their workflow with FreeflowZee.
            </p>
            <div className= "flex flex-col sm:flex-row gap-4 justify-center">
              <Link href= "/signup">
                <Button size= "lg" className= "bg-white text-blue-600 hover:bg-gray-100">
                  <Target className= "w-5 h-5 mr-2" />
                  Start Free Trial
                </Button>
              </Link>
              <Link href= "/contact">
                <Button size= "lg" variant= "outline" className= "border-white text-white hover:bg-white hover:text-blue-600">
                  <Headphones className= "w-5 h-5 mr-2" />
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