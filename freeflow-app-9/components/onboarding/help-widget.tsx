'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
  Play
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOnboarding } from './onboarding-provider'
import { getAllTours, getTour } from '@/lib/onboarding-tours'
import { createFeatureLogger } from '@/lib/logger'
import { toast } from 'sonner'

const logger = createFeatureLogger('HelpWidget')

// ============================================================================
// HELP WIDGET COMPONENT - USER MANUAL SPEC
// ============================================================================

export function HelpWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const { startTour, completedTours } = useOnboarding()

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
                      <a
                        key={index}
                        href={link.url}
                        onClick={(e) => {
                          e.preventDefault()
                          logger.info('Help link clicked', { title: link.title, category: link.category })
                          toast.info('Coming Soon', {
                            description: `${link.title} documentation will be available soon`
                          })
                        }}
                        className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
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
                      </a>
                    ))}
                  </div>
                </div>

                {/* Live Chat Section */}
                <div className="pt-4 border-t">
                  <Button
                    onClick={() => {
                      logger.info('Live chat opened from help widget')
                      toast.info('Coming Soon', {
                        description: 'Live chat support will be available in Q2 2026'
                      })
                    }}
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
    </>
  )
}
