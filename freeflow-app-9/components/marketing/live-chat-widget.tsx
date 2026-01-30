'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function LiveChatWidget() {
    const [isOpen, setIsOpen] = useState(false)
    const [message, setMessage] = useState('')
    const [hasSent, setHasSent] = useState(false)

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault()
        if (!message.trim()) return

        // Simulate sending
        setHasSent(true)
        setMessage('')

        // Simulate support reply
        setTimeout(() => {
            toast.success('Message sent! Our team will reply shortly via email.')
        }, 1000)
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="mb-4 w-[350px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-blue-600 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Avatar className="w-10 h-10 border-2 border-white/20">
                                        <AvatarImage src="/avatars/support-agent.jpg" />
                                        <AvatarFallback>KZ</AvatarFallback>
                                    </Avatar>
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-blue-600"></span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-sm">KAZI Support</h3>
                                    <p className="text-blue-100 text-xs">Replies in &lt; 5m</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-blue-100 hover:text-white transition-colors"
                                aria-label="Close chat window"
                            >
                                <X className="w-5 h-5" aria-hidden="true" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="h-[300px] p-4 overflow-y-auto bg-slate-50 dark:bg-slate-950 flex flex-col gap-4">
                            <div className="flex items-start gap-2 max-w-[85%]">
                                <Avatar className="w-8 h-8 mt-1">
                                    <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">KZ</AvatarFallback>
                                </Avatar>
                                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-3 rounded-2xl rounded-tl-none text-sm text-gray-700 dark:text-gray-200 shadow-sm">
                                    <p>Hi there! 👋 How can I help you streamline your freelance business today?</p>
                                </div>
                            </div>

                            {hasSent && (
                                <div className="flex items-start gap-2 max-w-[85%] self-end flex-row-reverse">
                                    <div className="bg-blue-600 p-3 rounded-2xl rounded-tr-none text-sm text-white shadow-sm">
                                        <p>Thanks for reaching out! We've received your message and will get back to you shortly.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSend} className="p-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800">
                            <div className="relative">
                                <Input
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="pr-10"
                                />
                                <button
                                    type="submit"
                                    disabled={!message.trim()}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 disabled:text-gray-300 transition-colors"
                                    aria-label="Send message"
                                >
                                    <Send className="w-5 h-5" aria-hidden="true" />
                                </button>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2 text-center">
                                Powered by KAZI Intercom
                            </p>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg shadow-blue-600/30 flex items-center justify-center transition-colors"
                aria-label={isOpen ? "Close chat" : "Open chat support"}
                aria-expanded={isOpen}
            >
                {isOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <MessageSquare className="w-6 h-6" aria-hidden="true" />}
            </motion.button>
        </div>
    )
}
