'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { LiquidGlassCard, LiquidGlassCardHeader, LiquidGlassCardContent } from '@/components/ui/liquid-glass-card'
import { Badge } from '@/components/ui/badge'
import { Star, Play } from 'lucide-react'
import { ReactNode } from 'react'

// Animated stat card - opacity only to prevent CLS
export function AnimatedStatCard({
  stat,
  index
}: {
  stat: { value: string; label: string; icon: any }
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card
        className="text-center border-2 hover:border-blue-600 transition-all hover:shadow-xl"
        role="status"
        aria-label={`${stat.label}: ${stat.value}`}
      >
        <CardContent className="p-6">
          <stat.icon className="w-8 h-8 mx-auto mb-3 text-blue-600" aria-hidden="true" />
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1" role="status">{stat.value}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Animated testimonial card - opacity only to prevent CLS
export function AnimatedTestimonialCard({
  testimonial,
  index
}: {
  testimonial: {
    quote: string
    author: string
    role: string
    company: string
    rating: number
    metric: string
  }
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      role="listitem"
    >
      <LiquidGlassCard
        variant="gradient"
        className="h-full"
        role="article"
        aria-label={`Testimonial from ${testimonial.author}, ${testimonial.role} at ${testimonial.company}`}
      >
        <LiquidGlassCardHeader>
          <div
            className="flex gap-1 mb-4"
            role="img"
            aria-label={`${testimonial.rating} out of 5 stars`}
          >
            {[...Array(testimonial.rating)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
            ))}
          </div>
          <Badge
            className="mb-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white"
            role="status"
            aria-label={`Result: ${testimonial.metric}`}
          >
            {testimonial.metric}
          </Badge>
        </LiquidGlassCardHeader>
        <LiquidGlassCardContent>
          <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">{testimonial.quote}</p>
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold"
              aria-hidden="true"
            >
              {testimonial.author.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">{testimonial.author}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</div>
              <div className="text-xs text-gray-500 dark:text-gray-500">{testimonial.company}</div>
            </div>
          </div>
        </LiquidGlassCardContent>
      </LiquidGlassCard>
    </motion.div>
  )
}

// Animated video thumbnail - opacity only to prevent CLS
export function AnimatedVideoThumbnail({
  video,
  index,
  onSelect
}: {
  video: { title: string; duration: string; file: string; poster: string }
  index: number
  onSelect: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group cursor-pointer"
      onClick={onSelect}
    >
      <div
        className="relative rounded-lg overflow-hidden border border-slate-700 group-hover:border-blue-500 transition-all"
        style={{ aspectRatio: '16/9' }}
      >
        <Image
          src={`/demo-captures/${video.poster}`}
          alt={video.title}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform"
          loading="lazy"
          style={{ objectFit: 'cover' }}
        />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 text-slate-900 ml-0.5" />
          </div>
        </div>
        <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-0.5 rounded text-xs text-white">
          {video.duration}
        </div>
      </div>
      <p className="text-slate-300 text-sm mt-2 text-center group-hover:text-white transition-colors">
        {video.title}
      </p>
    </motion.div>
  )
}

// Animated CTA section - opacity only to prevent CLS
export function AnimatedCTASection({ children }: { children: ReactNode }) {
  return (
    <>
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: 'reverse'
        }}
        style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}
        aria-hidden="true"
      />
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        {children}
      </motion.div>
    </>
  )
}
