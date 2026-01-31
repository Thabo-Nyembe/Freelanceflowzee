'use client'

import dynamic from 'next/dynamic'

// Dynamic import with ssr: false must be in a Client Component
const Hero3DCard = dynamic(
  () => import('@/components/marketing/hero-3d-card').then(mod => ({ default: mod.Hero3DCard })),
  {
    ssr: false,
    loading: () => <div className="w-full h-full bg-slate-800/20 rounded-xl animate-pulse" />
  }
)

export function Hero3DWrapper() {
  return (
    <div className="relative h-[400px] lg:h-[600px] w-full hidden lg:block perspective-1000">
      <Hero3DCard />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-500/20 blur-[100px] -z-10 rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none" />
    </div>
  )
}
