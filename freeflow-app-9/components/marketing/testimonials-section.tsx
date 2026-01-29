'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, Quote } from 'lucide-react'
import Image from 'next/image'
import { motion } from 'framer-motion'

const testimonials = [
  {
    quote: "KAZI has completely transformed how I run my freelance business. The escrow system gives my clients confidence, and the AI tools have doubled my productivity.",
    author: "Sarah Chen",
    role: "Video Producer",
    company: "Creative Studios LA",
    avatar: "/avatars/sarah.jpg",
    rating: 5,
  },
  {
    quote: "As an agency owner, managing multiple clients was a nightmare. KAZI's project management and invoicing features have saved us 20+ hours per week.",
    author: "Marcus Johnson",
    role: "Agency Director",
    company: "DesignForge Agency",
    avatar: "/avatars/marcus.jpg",
    rating: 5,
  },
  {
    quote: "The real-time collaboration features are game-changing. My clients can leave feedback directly on videos and designs, eliminating endless email chains.",
    author: "Emily Rodriguez",
    role: "UX Designer",
    company: "Freelance",
    avatar: "/avatars/emily.jpg",
    rating: 5,
  },
  {
    quote: "I was skeptical about another platform, but KAZI delivers. The video studio alone is worth it, and the AI transcription saves me hours on every project.",
    author: "David Park",
    role: "Documentary Filmmaker",
    company: "Parallel Films",
    avatar: "/avatars/david.jpg",
    rating: 5,
  },
  {
    quote: "The client portal is brilliant. My clients can see project progress, approve milestones, and make payments all in one place. Professionalism elevated.",
    author: "Lisa Thompson",
    role: "Brand Consultant",
    company: "Thompson & Associates",
    avatar: "/avatars/lisa.jpg",
    rating: 5,
  },
  {
    quote: "Finally, a platform built by creatives for creatives. The invoicing templates are beautiful, and the payment protection gives me peace of mind.",
    author: "James Wilson",
    role: "Motion Designer",
    company: "Freelance",
    avatar: "/avatars/james.jpg",
    rating: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4" variant="outline">Testimonials</Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Loved by{' '}
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              2,800+ Professionals
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See why freelancers, agencies, and creative professionals trust KAZI
            to manage their businesses and delight their clients.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-white dark:bg-gray-800 border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  {/* Quote Icon */}
                  <Quote className="w-10 h-10 text-purple-200 dark:text-purple-800 mb-4" />

                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                    "{testimonial.quote}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-semibold">
                      {testimonial.author.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role} at {testimonial.company}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {[
            { value: '2,800+', label: 'Active Users' },
            { value: '$12M+', label: 'Projects Managed' },
            { value: '98%', label: 'Satisfaction Rate' },
            { value: '4.9/5', label: 'Average Rating' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {stat.value}
              </p>
              <p className="text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
