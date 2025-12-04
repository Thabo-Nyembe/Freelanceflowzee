'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface Testimonial {
  id: string
  name: string
  role: string
  company: string
  avatar?: string
  rating: number
  quote: string
  metrics?: {
    label: string
    value: string
  }
  featured?: boolean
  verified?: boolean
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'Creative Director',
    company: 'Design Studio Pro',
    rating: 5,
    quote: "KAZI transformed how we work with clients. The universal feedback system eliminated endless email chains, and we're billing 40% faster with the escrow payments. Best investment we've made.",
    metrics: { label: 'Time Saved', value: '15 hrs/week' },
    featured: true,
    verified: true
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    role: 'Freelance Developer',
    company: 'Independent',
    rating: 5,
    quote: "Finally, a platform that doesn't nickel-and-dime you. I cancelled 6 subscriptions and still saved $300/month. The AI features alone are worth it—GPT-4o, Claude, and DALL-E in one place.",
    metrics: { label: 'Cost Savings', value: '$300/mo' },
    featured: true,
    verified: true
  },
  {
    id: '3',
    name: 'Priya Patel',
    role: 'Agency Owner',
    company: 'Digital Spark Agency',
    rating: 5,
    quote: "We manage 50+ projects now with half the tools. The real-time collaboration and video studio mean we're faster and more professional. Revenue up 60% since switching.",
    metrics: { label: 'Revenue Growth', value: '+60%' },
    featured: true,
    verified: true
  },
  {
    id: '4',
    name: 'James Rodriguez',
    role: 'Video Producer',
    company: 'Motion Media',
    rating: 5,
    quote: "The video studio with AI transcription is incredible. What took hours now takes minutes. Client feedback system means no more version confusion. Game changer.",
    metrics: { label: 'Production Speed', value: '5x faster' },
    verified: true
  },
  {
    id: '5',
    name: 'Emily Watson',
    role: 'Content Creator',
    company: 'Creative Collective',
    rating: 5,
    quote: "I was skeptical about 'all-in-one' platforms, but KAZI actually delivers. Payment protection gives me peace of mind, and the multi-cloud storage saves me hundreds.",
    metrics: { label: 'Storage Savings', value: '70%' },
    verified: true
  },
  {
    id: '6',
    name: 'David Kim',
    role: 'Marketing Consultant',
    company: 'Growth Labs',
    rating: 5,
    quote: "Built in Africa, world-class quality. The analytics show ROI clearly, and clients love the branded portals. We're closing deals 30% faster.",
    metrics: { label: 'Sales Cycle', value: '-30%' },
    verified: true
  }
]

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const featuredTestimonials = TESTIMONIALS.filter(t => t.featured)
  const currentTestimonial = featuredTestimonials[currentIndex]

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredTestimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredTestimonials.length) % featuredTestimonials.length)
  }

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Trusted by 25,000+ Creatives
          </Badge>
          <h2 className="text-4xl font-bold mb-4">
            Real Results from Real Users
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Join thousands of freelancers and agencies who've transformed their workflow
          </p>
        </div>

        {/* Featured Testimonial Carousel */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="relative overflow-hidden border-2 shadow-xl">
            <CardContent className="p-8 md:p-12">
              <Quote className="w-12 h-12 text-blue-500 mb-6 opacity-50" />

              <div className="mb-8">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(currentTestimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <blockquote className="text-xl md:text-2xl font-medium leading-relaxed mb-6">
                  "{currentTestimonial.quote}"
                </blockquote>

                {currentTestimonial.metrics && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-950 rounded-lg mb-6">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {currentTestimonial.metrics.label}:
                    </span>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {currentTestimonial.metrics.value}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="w-14 h-14 ring-2 ring-blue-500">
                    <AvatarImage src={currentTestimonial.avatar} alt={currentTestimonial.name} />
                    <AvatarFallback>{currentTestimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-lg">{currentTestimonial.name}</p>
                      {currentTestimonial.verified && (
                        <Badge variant="secondary" className="text-xs">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      {currentTestimonial.role} • {currentTestimonial.company}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={prevTestimonial}
                    className="rounded-full"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={nextTestimonial}
                    className="rounded-full"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Carousel Indicators */}
              <div className="flex justify-center gap-2 mt-6">
                {featuredTestimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? 'bg-blue-600 w-8'
                        : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* All Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((testimonial) => (
            <Card key={testimonial.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <blockquote className="text-sm leading-relaxed mb-4 line-clamp-4">
                  "{testimonial.quote}"
                </blockquote>

                {testimonial.metrics && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-950 rounded text-xs mb-4">
                    <span className="text-gray-600 dark:text-gray-400">
                      {testimonial.metrics.label}:
                    </span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {testimonial.metrics.value}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-4 border-t">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="font-semibold text-sm truncate">{testimonial.name}</p>
                      {testimonial.verified && (
                        <Badge variant="secondary" className="text-xs px-1">✓</Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Join 25,000+ satisfied users
          </p>
          <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
            Start Free Trial
          </Button>
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection
