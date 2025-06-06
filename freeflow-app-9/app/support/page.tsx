'use client'

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
  Search
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
    action: "Send Email"
  },
  {
    icon: MessageSquare,
    title: "Live Chat",
    description: "Chat with our support team",
    contact: "Available in app",
    response: "Instant response",
    action: "Start Chat"
  },
  {
    icon: Phone,
    title: "Phone Support",
    description: "Speak directly with our team",
    contact: "+1 (555) 123-4567",
    response: "Business hours",
    action: "Call Now"
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
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Thank you for contacting us! We\'ll get back to you within 24 hours.')
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
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search for help articles, guides, or features..."
                className="pl-12 pr-4 py-3 text-lg bg-white border-gray-300 focus:border-indigo-500 rounded-lg shadow-sm"
                suppressHydrationWarning
              />
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
                      <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                        {channel.action}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
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

            <div className="max-w-4xl mx-auto space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index} className="border-l-4 border-l-indigo-500">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      {faq.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 ml-8">{faq.answer}</p>
                  </CardContent>
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

        {/* Contact Form */}
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
                      required
                      className="resize-none"
                      suppressHydrationWarning
                    />
                  </div>
                  
                  <Button 
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3"
                  >
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
} 