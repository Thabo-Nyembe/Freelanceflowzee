'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  HelpCircle,
  Search,
  Book,
  Video,
  MessageCircle,
  Mail,
  Sparkles,
  X,
  ExternalLink,
  CheckCircle,
  Trophy,
  Play,
  Send,
  Paperclip,
  Bot,
  User
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOnboarding } from './onboarding-provider'
import { getAllTours, getTour } from '@/lib/onboarding-tours'
import { createSimpleLogger } from '@/lib/simple-logger'
import { toast } from 'sonner'

const logger = createSimpleLogger('HelpWidget')

// ============================================================================
// HELP WIDGET COMPONENT - USER MANUAL SPEC
// ============================================================================

interface ChatMessage {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
}

interface HelpArticle {
  title: string
  category: string
  content: string[]
  relatedTopics: string[]
}

const helpArticles: Record<string, HelpArticle> = {
  'Getting Started Guide': {
    title: 'Getting Started Guide',
    category: 'Documentation',
    content: [
      'Welcome to KAZI! This guide will help you get started with the platform.',
      '1. Complete your profile: Navigate to Settings > Profile to add your information, skills, and portfolio.',
      '2. Explore the Dashboard: Your dashboard shows projects, tasks, messages, and earnings at a glance.',
      '3. Find Projects: Use the Marketplace to browse and apply for freelance opportunities.',
      '4. Set up Payments: Connect your payment method in Settings > Payments to receive funds.',
      '5. Enable Notifications: Stay updated on new opportunities and messages.'
    ],
    relatedTopics: ['Profile Setup', 'Marketplace Guide', 'Payment Methods']
  },
  'Video Tutorials': {
    title: 'Video Tutorials',
    category: 'Learning',
    content: [
      'Access our comprehensive video library to master KAZI features.',
      '• Platform Overview (5 min) - Learn the basics of navigating KAZI',
      '• Creating Your Profile (8 min) - Build a standout freelancer profile',
      '• Finding Projects (6 min) - Tips for discovering the best opportunities',
      '• Client Communication (7 min) - Best practices for working with clients',
      '• Managing Payments (4 min) - Understanding invoices and withdrawals'
    ],
    relatedTopics: ['Getting Started', 'Best Practices']
  },
  'FAQ': {
    title: 'Frequently Asked Questions',
    category: 'Support',
    content: [
      'Q: How do I withdraw my earnings?',
      'A: Go to Settings > Payments > Withdraw and select your preferred method.',
      '',
      'Q: How are service fees calculated?',
      'A: KAZI charges a 5% service fee on completed transactions.',
      '',
      'Q: Can I work with clients outside the platform?',
      'A: We recommend keeping all communication and payments on KAZI for security.',
      '',
      'Q: How do I get more visibility?',
      'A: Complete your profile, add portfolio items, and maintain high ratings.'
    ],
    relatedTopics: ['Payments', 'Platform Policies']
  },
  'Contact Support': {
    title: 'Contact Support',
    category: 'Support',
    content: [
      'Our support team is here to help! Here are the ways to reach us:',
      '• Live Chat: Click the "Start Live Chat" button for instant assistance',
      '• Email: support@kazi.com - We respond within 24 hours',
      '• Phone: +1 (555) 123-4567 - Available Mon-Fri, 9am-5pm EST',
      '• Community Forum: Connect with other users for tips and advice',
      'For urgent issues, use Live Chat for the fastest response.'
    ],
    relatedTopics: ['FAQ', 'Community']
  }
}

export function HelpWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const { startTour, completedTours } = useOnboarding()

  // Help article dialog state
  const [showArticleDialog, setShowArticleDialog] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null)

  // Live chat dialog state
  const [showChatDialog, setShowChatDialog] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I\'m KAZI Assistant. How can I help you today?',
      timestamp: new Date()
    }
  ])
  const [chatInput, setChatInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (showChatDialog && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages, showChatDialog])

  const handleOpenArticle = (linkTitle: string) => {
    const article = helpArticles[linkTitle]
    if (article) {
      setSelectedArticle(article)
      setShowArticleDialog(true)
      logger.info('Help article opened', { title: linkTitle })
    }
  }

  const handleSendChatMessage = async () => {
    if (!chatInput.trim()) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: chatInput,
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, userMessage])
    setChatInput('')
    setIsTyping(true)
    logger.info('Chat message sent', { message: chatInput })

    // Simulate bot response
    await new Promise(resolve => setTimeout(resolve, 1500))

    const botResponses: Record<string, string> = {
      'payment': 'For payment questions, go to Settings > Payments. You can add payment methods, view transaction history, and request withdrawals there.',
      'project': 'To find projects, visit the Marketplace. You can filter by category, budget, and deadline. Make sure your profile is complete to increase your visibility!',
      'profile': 'Your profile is your first impression! Add a professional photo, detailed bio, skills, and portfolio samples. A complete profile gets 3x more views.',
      'help': 'I can help with: payments, projects, profile setup, account settings, and more. What would you like to know?',
      'default': 'Thanks for your message! I\'ll connect you with our support team for more detailed assistance. In the meantime, check out our FAQ section for common questions.'
    }

    const lowerInput = userMessage.content.toLowerCase()
    let responseContent = botResponses.default

    for (const [keyword, response] of Object.entries(botResponses)) {
      if (lowerInput.includes(keyword)) {
        responseContent = response
        break
      }
    }

    const botMessage: ChatMessage = {
      id: `bot-${Date.now()}`,
      type: 'bot',
      content: responseContent,
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, botMessage])
    setIsTyping(false)
  }

  const handleOpenChat = () => {
    setShowChatDialog(true)
    setIsOpen(false)
    logger.info('Live chat opened from help widget')
  }

  const quickLinks = [
    { title: 'Getting Started Guide', icon: Book, url: '#', category: 'Documentation' },
    { title: 'Video Tutorials', icon: Video, url: '#', category: 'Learning' },
    { title: 'FAQ', icon: HelpCircle, url: '#', category: 'Support' },
    { title: 'Contact Support', icon: Mail, url: '#', category: 'Support' }
  ]

  const availableTours = getAllTours()

  const handleStartTour = (tourId: string) => {
    const tour = getTour(tourId)
    if (tour) {
      logger.info('Starting tour from help widget', { tourId, tourTitle: tour.title })
      startTour(tour)
      setIsOpen(false)
      toast.info('Tour started', {
        description: `${tour.title} - ${tour.steps.length} steps`
      })
    }
  }

  const handleSearch = (query: string) => {
    setSearchTerm(query)
    logger.debug('Help search query', { query })
  }

  const filteredLinks = quickLinks.filter(link =>
    link.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredTours = availableTours.filter(tour =>
    tour.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tour.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <>
      {/* Floating Help Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-40"
      >
        <Button
          onClick={() => {
            setIsOpen(!isOpen)
            logger.info(isOpen ? 'Help widget closed' : 'Help widget opened')
          }}
          size="lg"
          className="rounded-full w-14 h-14 shadow-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
        >
          {isOpen ? <X className="w-6 h-6" /> : <HelpCircle className="w-6 h-6" />}
        </Button>
      </motion.div>

      {/* Help Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-40 w-full max-w-md"
          >
            <Card className="shadow-2xl border-2 border-indigo-200">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Help & Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search help articles, tours..."
                    className="pl-10"
                  />
                </div>

                {/* Interactive Tours Section */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Play className="w-4 h-4 text-purple-600" />
                    Interactive Guided Tours
                  </h3>
                  <div className="space-y-2">
                    {filteredTours.map((tour) => {
                      const isCompleted = completedTours.includes(tour.id)

                      return (
                        <button
                          key={tour.id}
                          onClick={() => handleStartTour(tour.id)}
                          className="w-full text-left p-3 rounded-lg border-2 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold text-sm text-gray-900 group-hover:text-indigo-700">
                                  {tour.title}
                                </p>
                                {isCompleted && (
                                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-gray-600 mb-2">{tour.description}</p>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {tour.steps.length} steps
                                </Badge>
                                {tour.completionReward && (
                                  <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                                    <Trophy className="w-3 h-3 mr-1" />
                                    Reward
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Play className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-1 group-hover:scale-110 transition-transform" />
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Quick Links Section */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Book className="w-4 h-4 text-blue-600" />
                    Quick Links
                  </h3>
                  <div className="space-y-2">
                    {filteredLinks.map((link, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          logger.info('Help link clicked', { title: link.title, category: link.category })
                          handleOpenArticle(link.title)
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group text-left"
                      >
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                          <link.icon className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
                            {link.title}
                          </p>
                          <p className="text-xs text-gray-600">{link.category}</p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Chat Section */}
                <div className="pt-4 border-t">
                  <Button
                    onClick={handleOpenChat}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Start Live Chat (24/7)
                  </Button>
                </div>

                {/* Progress Indicator */}
                {completedTours.length > 0 && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-gray-700">Your Learning Progress</p>
                      <Badge className="bg-purple-100 text-purple-700">
                        {completedTours.length}/{availableTours.length}
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(completedTours.length / availableTours.length) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1 text-center">
                      {completedTours.length === availableTours.length
                        ? '🎉 All tours completed! You\'re a KAZI expert!'
                        : `${availableTours.length - completedTours.length} tour${availableTours.length - completedTours.length !== 1 ? 's' : ''} remaining`}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Article Dialog */}
      <Dialog open={showArticleDialog} onOpenChange={setShowArticleDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Book className="w-5 h-5 text-blue-600" />
              {selectedArticle?.title}
            </DialogTitle>
            <DialogDescription>
              {selectedArticle?.category}
            </DialogDescription>
          </DialogHeader>

          {selectedArticle && (
            <div className="space-y-4">
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-3">
                  {selectedArticle.content.map((line, i) => (
                    <p key={i} className={`text-sm ${line === '' ? 'h-2' : 'text-gray-700'}`}>
                      {line}
                    </p>
                  ))}
                </div>
              </ScrollArea>

              <Separator />

              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">Related Topics</p>
                <div className="flex flex-wrap gap-2">
                  {selectedArticle.relatedTopics.map((topic, i) => (
                    <Badge key={i} variant="secondary" className="cursor-pointer hover:bg-blue-100">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowArticleDialog(false)}>
              Close
            </Button>
            <Button onClick={handleOpenChat}>
              <MessageCircle className="w-4 h-4 mr-2" />
              Need More Help?
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Live Chat Dialog */}
      <Dialog open={showChatDialog} onOpenChange={setShowChatDialog}>
        <DialogContent className="max-w-md h-[600px] flex flex-col p-0">
          <DialogHeader className="px-4 py-3 border-b bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
            <DialogTitle className="flex items-center gap-2 text-white">
              <MessageCircle className="w-5 h-5" />
              KAZI Live Support
            </DialogTitle>
            <DialogDescription className="text-green-100">
              We typically respond within a few seconds
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 px-4 py-3">
            <div className="space-y-4">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className={msg.type === 'bot' ? 'bg-green-100' : 'bg-blue-100'}>
                      {msg.type === 'bot' ? <Bot className="w-4 h-4 text-green-600" /> : <User className="w-4 h-4 text-blue-600" />}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`max-w-[75%] rounded-lg p-3 ${
                      msg.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 ${msg.type === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-green-100">
                      <Bot className="w-4 h-4 text-green-600" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          </ScrollArea>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => toast.info('Attachments', { description: 'Drag and drop files or click to upload' })}>
                <Paperclip className="w-4 h-4" />
              </Button>
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type your message..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendChatMessage()}
                className="flex-1"
              />
              <Button onClick={handleSendChatMessage} disabled={!chatInput.trim() || isTyping}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              Powered by KAZI AI Assistant
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
