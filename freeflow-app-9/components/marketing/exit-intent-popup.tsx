'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Gift, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { usePathname } from 'next/navigation'

export function ExitIntentPopup() {
    const [isVisible, setIsVisible] = useState(false)
    const [hasShown, setHasShown] = useState(false)
    const [email, setEmail] = useState('')
    const pathname = usePathname()

    useEffect(() => {
        // Don't show on login/signup pages
        if (pathname?.includes('/login') || pathname?.includes('/signup')) return

        const handleMouseLeave = (e: MouseEvent) => {
            if (e.clientY <= 0 && !hasShown && !localStorage.getItem('kazi_exit_popup_dismissed')) {
                setIsVisible(true)
                setHasShown(true)
            }
        }

        document.addEventListener('mouseleave', handleMouseLeave)
        return () => document.removeEventListener('mouseleave', handleMouseLeave)
    }, [hasShown, pathname])

    const handleClose = () => {
        setIsVisible(false)
        localStorage.setItem('kazi_exit_popup_dismissed', 'true')
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return

        toast.success('Free Toolkit Sent! 🚀', {
            description: 'Check your email for the Ultimate Freelance Growth Kit.'
        })

        // In a real app, send to API here

        handleClose()
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />

                    {/* Popup */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-0 m-auto w-full max-w-lg h-fit z-[101] p-4"
                    >
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-blue-100 dark:border-slate-800 relative">
                            <button
                                onClick={handleClose}
                                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex flex-col md:flex-row">
                                {/* Left Side (Visual) */}
                                <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-8 flex flex-col justify-center items-center text-white md:w-2/5 text-center">
                                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
                                        <Gift className="w-8 h-8" />
                                    </div>
                                    <h3 className="font-bold text-lg mb-1">Wait!</h3>
                                    <p className="text-blue-100 text-sm">Don't leave empty handed.</p>
                                </div>

                                {/* Right Side (Content) */}
                                <div className="p-8 md:w-3/5">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        Get the Freelance Toolkit
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
                                        Join 25,000+ peers. Get our free guide on <strong>"Scaling to $10k/mo"</strong> + 5 free contract templates.
                                    </p>

                                    <form onSubmit={handleSubmit} className="space-y-3">
                                        <Input
                                            type="email"
                                            placeholder="Enter your best email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="w-full"
                                        />
                                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                            Send Me The Toolkit
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </form>
                                    <p className="text-xs text-center text-gray-400 mt-4">
                                        No spam. Unsubscribe anytime.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
