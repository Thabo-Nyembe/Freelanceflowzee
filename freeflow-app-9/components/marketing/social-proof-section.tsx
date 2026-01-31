'use client'

import { InfiniteMovingCards } from '@/components/ui/infinite-moving-cards'

const companies = [
  { name: "Acme Corp" },
  { name: "Global Design" },
  { name: "TechFlow" },
  { name: "Creative Studios" },
  { name: "Indie Hackers" },
  { name: "Freelance Union" },
  { name: "Digital Nomads" },
]

export function SocialProofSection() {
  return (
    <section className="py-10 bg-white dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800">
      <div className="text-center mb-8">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Trusted by 25,000+ Freelancers & Agencies</p>
      </div>
      <div className="flex flex-col antialiased bg-white dark:bg-gray-900 dark:bg-grid-white/[0.05] items-center justify-center relative overflow-hidden">
        <InfiniteMovingCards
          items={companies}
          direction="right"
          speed="slow"
        />
      </div>
    </section>
  )
}
