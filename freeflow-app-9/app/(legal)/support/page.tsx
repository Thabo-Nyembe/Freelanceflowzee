'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  HelpCircle, 
  Mail, 
  Phone, 
  MessageSquare, 
  Book, 
  Video, 
  Users,
  Clock,
  CheckCircle,
  ArrowRight,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

const faqs = [
  {
    question: "How do I get started with FreeflowZee?",
    answer: "Getting started is easy! Simply sign up for a free account, create your first project, and start sharing your work with clients. Our onboarding guide will walk you through each step."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, Apple Pay, Google Pay, and bank transfers. All payments are processed securely through Stripe."
  },
  {
    question: "How do I set up payments for my projects?",
    answer: "You can configure payment settings in your project dashboard. Set your rates, payment terms, and preferred payment methods. Clients can pay instantly through our secure payment system."
  },
  {
    question: "Is there a free trial available?",
    answer: "Yes! We offer a 14-day free trial with access to all features. No credit card required to start your trial."
  },
  {
    question: "How do I invite clients to view my projects?",
    answer: "Simply share your project link with clients via email, or use our built-in invitation system. You can set access controls and require passwords for sensitive projects."
  },
  {
    question: "Can I customize the appearance of my project pages?",
    answer: "Absolutely! You can customize colors, fonts, logos, and layout to match your brand. Premium plans include advanced customization options."
  },
  {
    question: "What file types are supported?",
    answer: "We support all common file formats including images (JPG, PNG, GIF, SVG), documents (PDF, DOC, DOCX), videos (MP4, MOV, AVI), and more. Files up to 100MB per upload."
  },
  {
    question: "How do I upgrade or downgrade my plan?",
    answer: "You can change your plan anytime from your account settings. Upgrades take effect immediately, and downgrades take effect at your next billing cycle."
  }
]

const supportChannels = [
  {
    icon: Mail,
    title: "Email Support",
    description: "Get detailed help via email",
    contact: "support@freelanceflowzee.com",
    response: "Within 24 hours",
    action: "Send Email",
    href: "mailto:support@freelanceflowzee.com"
  },
  {
    icon: MessageSquare,
    title: "Live Chat",
    description: "Chat with our support team",
    contact: "Available in app",
    response: "Instant response",
    action: "Start Chat",
    href: "#chat"
  },
  {
    icon: Phone,
    title: "Phone Support",
    description: "Speak directly with our team",
    contact: "+1 (555) 123-4567",
    response: "Business hours",
    action: "Call Now",
    href: "tel:+15551234567"
  }
]

const resources = [
  {
    icon: Book,
    title: "Documentation",
    description: "Comprehensive guides and tutorials",
    link: "/docs"
  },
  {
    icon: Video,
    title: "Video Tutorials",
    description: "Step-by-step video guides",
    link: "/tutorials"
  },
  {
    icon: Users,
    title: "Community Forum",
    description: "Connect with other users",
    link: "/community"
  }
]

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showLiveChat, setShowLiveChat] = useState(false)
  const [chatMessages, setChatMessages] = useState([
    { sender: 'Support', message: 'Hi! How can I help you today?', time: '2:34 PM' },
    { sender: 'You', message: 'I need help with payment setup', time: '2:35 PM' },
    { sender: 'Support', message: 'I\'d be happy to help! Let me guide you through the payment setup process.', time: '2:35 PM' }
  ])
  const [newMessage, setNewMessage] = useState('')
  const [supportStatus] = useState({
    online: true,
    responseTime: '< 2 minutes',
    queuePosition: 0,
    agentName: 'Sarah Johnson'
  })

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    alert('Thank you for contacting us! We\'ll get back to you within 24 hours.')
    setFormData({ name: '', email: '', subject: '', message: '' })
    setIsSubmitting(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }))
  }

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleChannelClick = (channel: typeof supportChannels[0]) => {
    if (channel.title === "Live Chat") {
      setShowLiveChat(true)
    } else {
      window.open(channel.href, '_blank')
    }
  }

  const sendMessage = () => {
    if (newMessage.trim()) {
      setChatMessages([...chatMessages, {
        sender: 'You',
        message: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }])
      setNewMessage('')
      
      // Simulate support response
      setTimeout(() => {
        setChatMessages(prev => [...prev, {
          sender: 'Support',
          message: 'Thanks for your message! Let me help you with that.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }])
      }, 1500)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-indigo-50 to-purple-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <HelpCircle className="w-16 h-16 text-indigo-600 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              How can we help you?
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Find answers to common questions, browse our documentation, or contact our support team.
            </p>
            
            {/* Interactive Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search for help articles, guides, or features..."
                className="pl-12 pr-4 py-3 text-lg bg-white border-gray-300 focus:border-indigo-500 rounded-lg shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                suppressHydrationWarning
              />
              {searchQuery && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-2 z-10">
                  <div className="p-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Found {filteredFaqs.length} result{filteredFaqs.length !== 1 ? 's' : ''}
                    </p>
                    {filteredFaqs.slice(0, 3).map((faq, index) => (
                      <div key={index} className="py-2 border-b border-gray-100 last:border-b-0">
                        <p className="text-sm font-medium text-gray-900">{faq.question}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Support Channels */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Contact Support
              </h2>
              <p className="text-lg text-gray-600">
                Choose the best way to reach our support team
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {supportChannels.map((channel) => (
                <Card key={channel.title} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <channel.icon className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                    <CardTitle className="text-xl">{channel.title}</CardTitle>
                    <CardDescription>{channel.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="font-medium text-gray-900">{channel.contact}</p>
                      <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{channel.response}</span>
                      </div>
                      <Button 
                        className="w-full bg-indigo-600 hover:bg-indigo-700"
                        onClick={() => handleChannelClick(channel)}
                      >
                        {channel.action}
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive FAQ Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-gray-600">
                Quick answers to common questions
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-4">
              {filteredFaqs.map((faq, index) => (
                <Card key={index} className="border-l-4 border-l-indigo-500 hover:shadow-md transition-shadow">
                  <CardHeader 
                    className="cursor-pointer"
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  >
                    <CardTitle className="text-lg flex items-center justify-between">
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        {faq.question}
                      </div>
                      {expandedFaq === index ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </CardTitle>
                  </CardHeader>
                  {expandedFaq === index && (
                    <CardContent>
                      <p className="text-gray-600 ml-8">{faq.answer}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Resources Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Help Resources
              </h2>
              <p className="text-lg text-gray-600">
                Explore our comprehensive help resources
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {resources.map((resource) => (
                <Link key={resource.title} href={resource.link}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                    <CardHeader className="text-center">
                      <resource.icon className="w-12 h-12 text-indigo-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                      <CardTitle className="text-xl group-hover:text-indigo-600">
                        {resource.title}
                      </CardTitle>
                      <CardDescription>{resource.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="flex items-center justify-center text-indigo-600 group-hover:text-indigo-700">
                        <span className="mr-2">Learn More</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Contact Form */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Still Need Help?
              </h2>
              <p className="text-lg text-gray-600">
                Can't find what you're looking for? Send us a message and we'll get back to you.
              </p>
            </div>

            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl">Contact Our Support Team</CardTitle>
                <CardDescription>
                  We typically respond within 24 hours during business days.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        suppressHydrationWarning
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        suppressHydrationWarning
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      type="text"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      suppressHydrationWarning
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      rows={6}
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      className="resize-none"
                      suppressHydrationWarning
                    />
                  </div>
                  
                  <Button 
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Live Chat Interface */}
        {showLiveChat && (
          <div className="fixed bottom-4 right-4 w-96 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50">
            <div className="flex items-center justify-between p-4 bg-indigo-600 text-white rounded-t-lg">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="font-medium">Live Chat - {supportStatus.agentName}</span>
              </div>
              <button 
                onClick={() => setShowLiveChat(false)}
                className="text-white hover:text-gray-200"
              >
                ×
              </button>
            </div>
            
            <div className="h-64 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs p-3 rounded-lg ${
                    msg.sender === 'You' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm">{msg.message}</p>
                    <p className="text-xs opacity-75 mt-1">{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1"
                  suppressHydrationWarning
                />
                <Button onClick={sendMessage} size="sm">
                  Send
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Support Status Dashboard */}
        <section className="py-8 bg-indigo-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${supportStatus.online ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  Support Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${supportStatus.online ? 'text-green-600' : 'text-red-600'}`}>
                      {supportStatus.online ? 'Online' : 'Offline'}
                    </div>
                    <div className="text-sm text-gray-600">Support Team</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{supportStatus.responseTime}</div>
                    <div className="text-sm text-gray-600">Avg Response</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{supportStatus.queuePosition}</div>
                    <div className="text-sm text-gray-600">Queue Position</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">24/7</div>
                    <div className="text-sm text-gray-600">Availability</div>
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <Button 
                    onClick={() => setShowLiveChat(true)}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Start Live Chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
} 