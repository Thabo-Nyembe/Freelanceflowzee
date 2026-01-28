'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

export function StickyCtaBar() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            // Show after scrolling down 300px
            if (window.scrollY > 300) {
                setIsVisible(true)
            } else {
                setIsVisible(false)
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    className="fixed bottom-0 left-0 right-0 z-50 p-4 border-t border-blue-100 dark:border-blue-900 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]"
                >
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="hidden sm:flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-gray-900 dark:text-white">Ready to streamline your workflow?</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">Join 25,000+ top freelancers</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white sm:hidden whitespace-nowrap">
                                Join 25k+ Pros
                            </span>
                            <Link href="/signup" className="w-full sm:w-auto">
                                <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20">
                                    Start Free Trial
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
