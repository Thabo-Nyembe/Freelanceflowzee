'use client'

import { useRef, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Play } from 'lucide-react'
import { AnimatedVideoThumbnail } from './animated-sections'

const videos = [
  { title: 'Getting Started', duration: '51s', file: '02-getting-started-with-voiceover.mp4', poster: 'gallery-my-day.jpg' },
  { title: 'Invoicing', duration: '19s', file: '03-invoicing-with-voiceover.mp4', poster: 'gallery-invoices.jpg' },
  { title: 'AI Features', duration: '27s', file: '04-ai-features-with-voiceover.mp4', poster: '30-ai-dashboard.jpg' },
  { title: 'Full Tour', duration: '25s', file: '05-full-gallery-with-voiceover.mp4', poster: 'gallery-analytics.jpg' },
]

export function VideoDemoSection() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)

  const handlePlayClick = () => {
    setIsVideoLoaded(true)
    // Allow React to render the video, then play
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play()
      }
    }, 50)
  }

  const handleVideoSelect = (file: string) => {
    setIsVideoLoaded(true)
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.src = `/demo-captures/final/${file}`
        videoRef.current.play()
        videoRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 50)
  }

  return (
    <section
      className="py-20 bg-gradient-to-b from-slate-900 to-slate-800"
      aria-labelledby="demo-video-heading"
      role="region"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge
            variant="secondary"
            className="mb-4 bg-blue-500/20 text-blue-300 border-blue-500/30"
          >
            <Play className="w-3 h-3 mr-1" />
            Watch Demo
          </Badge>
          <h2 id="demo-video-heading" className="text-4xl sm:text-5xl font-bold text-white mb-4">
            See KAZI in Action
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Watch how KAZI helps you manage projects, track time, and grow your freelance business.
          </p>
        </div>

        {/* Main Demo Video - Lazy loaded to prevent CLS */}
        <div className="max-w-4xl mx-auto mb-12">
          <div
            className="relative rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/20 border border-slate-700 bg-slate-900 cursor-pointer"
            style={{ aspectRatio: '16 / 9' }}
            onClick={!isVideoLoaded ? handlePlayClick : undefined}
          >
            {isVideoLoaded ? (
              <video
                ref={videoRef}
                controls
                poster="/demo-captures/gallery-projects.jpg"
                className="absolute inset-0 w-full h-full object-cover"
                preload="auto"
                width={1280}
                height={720}
                playsInline
              >
                <source src="/demo-captures/final/01-platform-overview-with-voiceover.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <>
                {/* Static poster image - no video controls to cause CLS */}
                <img
                  src="/demo-captures/gallery-projects.jpg"
                  alt="KAZI Platform Overview"
                  className="absolute inset-0 w-full h-full object-cover"
                  width={1280}
                  height={720}
                />
                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/20 transition-colors">
                  <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                    <Play className="w-10 h-10 text-slate-900 ml-1" />
                  </div>
                </div>
              </>
            )}
          </div>
          <p className="text-center text-slate-400 mt-4 text-sm">
            Platform Overview - 2 minutes • Click to play
          </p>
        </div>

        {/* Video Thumbnails */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {videos.map((video, index) => (
            <AnimatedVideoThumbnail
              key={index}
              video={video}
              index={index}
              onSelect={() => handleVideoSelect(video.file)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
