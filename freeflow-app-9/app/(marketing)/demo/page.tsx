'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { 
  Download, 
  Eye, 
  Heart, 
  Share2, 
  Star, 
  Calendar,
  User,
  Clock,
  DollarSign,
  CheckCircle,
  Play,
  Image as ImageIcon,
  FileText,
  Code,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  ThumbsUp,
  MessageCircle,
  Bookmark,
  ExternalLink
} from 'lucide-react'

type PreviewItem = {
  title: string
  description: string
  image: string
}

type PreviewItems = {
  [key: string]: PreviewItem
}

export default function DemoPage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [likes, setLikes] = useState(89)
  const [views, setViews] = useState(1247)
  const [selectedPreview, setSelectedPreview] = useState('logo')
  const [showComments, setShowComments] = useState(false)
  const [showLiveChat, setShowLiveChat] = useState(false)
  const [chatMessages, setChatMessages] = useState([
    { user: 'Sarah (Designer)', message: 'Hi! I&apos;m here to answer any questions about this project.', time: '2 min ago' },
    { user: 'You', message: 'This looks amazing! Can I see more color variations?', time: '1 min ago' }
  ])
  const [newMessage, setNewMessage] = useState('')
  const [selectedColor, setSelectedColor] = useState('blue')
  const [selectedStyle, setSelectedStyle] = useState('modern')

  const handlePlay = () => {
    setIsPlaying(!isPlaying)
    if (!isPlaying) {
      setViews(prev => prev + 1)
    }
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikes(prev => isLiked ? prev - 1 : prev + 1)
  }

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
  }

  const previewItems: PreviewItems = {
    logo: {
      title: 'Logo Variations',
      description: 'Primary, secondary, and monogram versions',
      image: '/api/placeholder/400/300'
    },
    brand: {
      title: 'Brand Guidelines',
      description: 'Color palette, typography, and usage rules',
      image: '/api/placeholder/400/300'
    },
    social: {
      title: 'Social Media Kit',
      description: 'Profile pictures, cover photos, and post templates',
      image: '/api/placeholder/400/300'
    },
    business: {
      title: 'Business Cards',
      description: 'Professional business card designs',
      image: '/api/placeholder/400/300'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <SiteHeader variant="minimal" />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-indigo-100 text-indigo-800 hover:bg-indigo-200">
                🎯 Interactive Demo
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Brand Identity Design Package
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Experience how FreeflowZee works with this fully interactive demo. See how clients can view, 
                purchase, and download creative work seamlessly.
              </p>
              
              {/* Interactive Project Stats */}
              <div className="flex flex-wrap justify-center gap-6 mb-8">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Eye className="w-5 h-5" />
                  <span>{views.toLocaleString()} views</span>
                </div>
                <button 
                  onClick={handleLike}
                  className={`flex items-center space-x-2 transition-colors ${
                    isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{likes} likes</span>
                </button>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span>4.9 rating</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Download className="w-5 h-5" />
                  <span>156 downloads</span>
                </div>
              </div>

              {/* Interactive Action Buttons */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <button
                  onClick={handleBookmark}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                    isBookmarked 
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700' 
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                  <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
                </button>
                <button
                  onClick={() => setShowComments(!showComments)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg border bg-white border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Comments (12)</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 rounded-lg border bg-white border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
                <button
                  onClick={() => setShowLiveChat(!showLiveChat)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg border bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Live Chat</span>
                </button>
              </div>
            </div>

            {/* Interactive Project Preview */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12">
              <div className="relative aspect-video bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <div className="text-center text-white">
                  <button
                    onClick={handlePlay}
                    className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8" />
                    ) : (
                      <Play className="w-8 h-8 ml-1" />
                    )}
                  </button>
                  <p className="text-lg font-medium">
                    {isPlaying ? 'Playing Project Preview' : 'Click to view full presentation'}
                  </p>
                  <p className="text-sm opacity-80">
                    {isPlaying ? 'Brand Identity Showcase' : 'Interactive demo experience'}
                  </p>
                </div>
                
                {/* Video Controls */}
                <div className="absolute bottom-4 right-4 flex space-x-2">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2 bg-black/30 rounded-lg hover:bg-black/50 transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <button className="p-2 bg-black/30 rounded-lg hover:bg-black/50 transition-colors">
                    <Maximize className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Interactive Preview Tabs */}
              <div className="border-b border-gray-200">
                <div className="flex overflow-x-auto">
                  {Object.entries(previewItems).map(([key, item]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedPreview(key)}
                      className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                        selectedPreview === key
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {item.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview Content */}
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                      <div className="text-center text-gray-500">
                        <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                        <p className="text-sm">{previewItems[selectedPreview].title}</p>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {previewItems[selectedPreview].title}
                    </h3>
                    <p className="text-gray-600">
                      {previewItems[selectedPreview].description}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Project Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <User className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600">Created by Sarah Johnson</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600">Completed: December 2024</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600">Delivery: 5 business days</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-gray-600">100% Satisfaction Guaranteed</span>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">What's Included</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <ImageIcon className="w-4 h-4 text-indigo-500" />
                          <span className="text-sm text-gray-600">Logo variations (5 formats)</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <FileText className="w-4 h-4 text-indigo-500" />
                          <span className="text-sm text-gray-600">Brand guidelines PDF</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Code className="w-4 h-4 text-indigo-500" />
                          <span className="text-sm text-gray-600">Source files (AI, PSD)</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Share2 className="w-4 h-4 text-indigo-500" />
                          <span className="text-sm text-gray-600">Social media kit</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            {showComments && (
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Comments (12)</h3>
                <div className="space-y-6">
                  {[
                    { name: 'Alex Chen', comment: 'Amazing work! The brand identity is so cohesive.', time: '2 hours ago' },
                    { name: 'Maria Rodriguez', comment: 'Love the color palette choices. Very professional.', time: '5 hours ago' },
                    { name: 'David Kim', comment: 'The logo variations are perfect for different use cases.', time: '1 day ago' }
                  ].map((comment, index) => (
                    <div key={index} className="flex space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {comment.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-gray-900">{comment.name}</span>
                          <span className="text-sm text-gray-500">{comment.time}</span>
                        </div>
                        <p className="text-gray-700">{comment.comment}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-indigo-600">
                            <ThumbsUp className="w-4 h-4" />
                            <span>Like</span>
                          </button>
                          <button className="text-sm text-gray-500 hover:text-indigo-600">Reply</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live Chat Section */}
            {showLiveChat && (
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Live Chat with Designer</h3>
                <div className="border rounded-lg p-4 h-64 overflow-y-auto mb-4 bg-gray-50">
                  {chatMessages.map((msg, index) => (
                    <div key={index} className={`mb-3 ${msg.user === 'You' ? 'text-right' : 'text-left'}`}>
                      <div className={`inline-block p-3 rounded-lg max-w-xs ${
                        msg.user === 'You' 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-white border border-gray-200'
                      }`}>
                        <p className="text-sm">{msg.message}</p>
                        <p className={`text-xs mt-1 ${msg.user === 'You' ? 'text-indigo-200' : 'text-gray-500'}`}>
                          {msg.user} • {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newMessage.trim()) {
                        setChatMessages([...chatMessages, {
                          user: 'You',
                          message: newMessage,
                          time: 'now'
                        }])
                        setNewMessage('')
                        // Simulate designer response
                        setTimeout(() => {
                          setChatMessages(prev => [...prev, {
                            user: 'Sarah (Designer)',
                            message: 'Thanks for your question! I&apos;ll get back to you shortly.',
                            time: 'now'
                          }])
                        }, 1000)
                      }
                    }}
                  />
                  <Button
                    onClick={() => {
                      if (newMessage.trim()) {
                        setChatMessages([...chatMessages, {
                          user: 'You',
                          message: newMessage,
                          time: 'now'
                        }])
                        setNewMessage('')
                      }
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    Send
                  </Button>
                </div>
              </div>
            )}

            {/* Project Customization */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Customize This Project</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Color Scheme</h4>
                  <div className="grid grid-cols-4 gap-3">
                    {['blue', 'purple', 'green', 'red'].map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-12 h-12 rounded-lg border-2 transition-all ${
                          selectedColor === color ? 'border-gray-900 scale-110' : 'border-gray-300'
                        } ${
                          color === 'blue' ? 'bg-blue-500' :
                          color === 'purple' ? 'bg-purple-500' :
                          color === 'green' ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Style</h4>
                  <div className="space-y-2">
                    {['modern', 'classic', 'minimal', 'bold'].map((style) => (
                      <button
                        key={style}
                        onClick={() => setSelectedStyle(style)}
                        className={`w-full p-3 text-left rounded-lg border transition-colors ${
                          selectedStyle === style 
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <span className="font-medium capitalize">{style}</span>
                        <p className="text-sm text-gray-600 mt-1">
                          {style === 'modern' && 'Clean lines and contemporary feel'}
                          {style === 'classic' && 'Timeless and professional approach'}
                          {style === 'minimal' && 'Simple and elegant design'}
                          {style === 'bold' && 'Strong and impactful presence'}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
                <p className="text-indigo-800">
                  <strong>Current Selection:</strong> {selectedColor.charAt(0).toUpperCase() + selectedColor.slice(1)} color scheme with {selectedStyle} style
                </p>
                <Button className="mt-3 bg-indigo-600 hover:bg-indigo-700">
                  Request Custom Quote
                </Button>
              </div>
            </div>

            {/* Interactive Pricing Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card className="border-2 border-gray-200 hover:border-indigo-300 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Preview Access</span>
                    <Badge variant="secondary">Free</Badge>
                  </CardTitle>
                  <CardDescription>
                    View project details and low-res previews
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 mb-4">$0</div>
                  <Button 
                    variant="outline" 
                    className="w-full mb-4"
                    onClick={() => alert('Preview access granted! You can now view all project details.')}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Preview
                  </Button>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>✓ Project overview</li>
                    <li>✓ Low-resolution previews</li>
                    <li>✓ Basic project details</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-indigo-500 shadow-lg relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-indigo-500 text-white">Most Popular</Badge>
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Standard License</span>
                    <Badge className="bg-indigo-100 text-indigo-800">Recommended</Badge>
                  </CardTitle>
                  <CardDescription>
                    Full access with commercial usage rights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 mb-4">
                    $299
                    <span className="text-lg font-normal text-gray-500">/project</span>
                  </div>
                  <Link href="/payment">
                    <Button className="w-full mb-4 bg-indigo-600 hover:bg-indigo-700">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Purchase Now
                    </Button>
                  </Link>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>✓ High-resolution files</li>
                    <li>✓ Commercial usage rights</li>
                    <li>✓ Source files included</li>
                    <li>✓ 30-day support</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-200 hover:border-indigo-300 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Extended License</span>
                    <Badge variant="outline">Premium</Badge>
                  </CardTitle>
                  <CardDescription>
                    Everything + unlimited usage and revisions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 mb-4">
                    $599
                    <span className="text-lg font-normal text-gray-500">/project</span>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full mb-4"
                    onClick={() => alert('Extended license selected! Redirecting to checkout...')}
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Get Extended
                  </Button>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>✓ Everything in Standard</li>
                    <li>✓ Unlimited usage rights</li>
                    <li>✓ 2 free revisions</li>
                    <li>✓ Priority support</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Call to Action */}
            <div className="text-center bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Create Your Own Project?
              </h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Join thousands of creators who use FreeflowZee to showcase their work, 
                manage clients, and get paid instantly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                    Start Creating
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline">
                    Contact Sales
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
} 