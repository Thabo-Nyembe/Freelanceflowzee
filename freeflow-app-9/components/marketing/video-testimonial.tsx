'use client'

import { useState, useRef } from 'react'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'
import { motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface VideoTestimonialProps {
    thumbnailUrl: string
    videoUrl: string
    author: {
        name: string
        role: string
        company: string
        avatarUrl: string
    }
    quote: string
}

export function VideoTestimonial({ thumbnailUrl, videoUrl, author, quote }: VideoTestimonialProps) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause()
            } else {
                videoRef.current.play()
            }
            setIsPlaying(!isPlaying)
        }
    }

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (videoRef.current) {
            videoRef.current.muted = !isMuted
            setIsMuted(!isMuted)
        }
    }

    return (
        <div className="relative rounded-2xl overflow-hidden aspect-[9/16] bg-slate-900 shadow-2xl group cursor-pointer" onClick={togglePlay}>
            {/* Video Element */}
            <video
                ref={videoRef}
                src={videoUrl}
                poster={thumbnailUrl}
                className="w-full h-full object-cover"
                loop
                playsInline
            />

            {/* Overlay Gradient (Always visible at bottom) */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/80 pointer-events-none" />

            {/* Play Button Overlay */}
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] transition-all group-hover:bg-black/10">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/50"
                    >
                        <Play className="w-8 h-8 text-white fill-current ml-1" />
                    </motion.div>
                </div>
            )}

            {/* Controls */}
            <div className="absolute top-4 right-4 z-10">
                <button
                    onClick={toggleMute}
                    className="p-2 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition-colors"
                >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
                <div className="mb-3">
                    <p className="text-lg font-medium leading-snug">"{quote}"</p>
                </div>

                <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border-2 border-white/20">
                        <AvatarImage src={author.avatarUrl} />
                        <AvatarFallback>{author.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-bold text-sm">{author.name}</div>
                        <div className="text-xs text-white/80">{author.role}, {author.company}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
