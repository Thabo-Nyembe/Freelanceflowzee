'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Mail, 
  Check, 
  Star,
  TrendingUp,
  Lightbulb,
  Clock,
  Users,
  ArrowRight
} from 'lucide-react'

const benefits = [
  {
    icon: Lightbulb,
    title: "Expert Tips & Insights",
    description: "Get actionable advice from industry professionals to improve your creative workflow."
  },
  {
    icon: TrendingUp,
    title: "Latest Industry Trends",
    description: "Stay ahead of the curve with the newest developments in creative technology and business."
  },
  {
    icon: Clock,
    title: "Time-Saving Strategies",
    description: "Learn proven techniques to streamline your processes and work more efficiently."
  },
  {
    icon: Users,
    title: "Community Updates",
    description: "Connect with other creatives and get featured case studies from our community."
  }
]

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Graphic Designer",
    content: "The newsletter has completely transformed how I approach my projects. The weekly tips are pure gold!",
    rating: 5
  },
  {
    name: "Michael Chen",
    role: "Creative Director",
    content: "I look forward to every edition. The insights have helped me grow my agency significantly.",
    rating: 5
  },
  {
    name: "Emily Rodriguez",
    role: "Freelance Illustrator",
    content: "Finally, a newsletter that actually provides value. The productivity tips alone are worth subscribing.",
    rating: 5
  }
]

export default function NewsletterPage() {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const interestOptions = [
    'Workflow Optimization',
    'Client Management',
    'Business Growth',
    'Creative Tools',
    'Pricing Strategies',
    'Technology Updates'
  ]

  const handleInterestChange = (interest: string, checked: boolean) => {
    if (checked) {
      setInterests(prev => [...prev, interest])
    } else {
      setInterests(prev => prev.filter(i => i !== interest))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      console.log('Newsletter signup:', { email, firstName, interests })
      setIsSubscribed(true)
      setIsLoading(false)
    }, 1000)
  }

  if (isSubscribed) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SiteHeader />
        
        <main className="pt-16">
          <section className="py-24 bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                🎉 Welcome to the FreeflowZee Community!
              </h1>
              
              <p className="text-xl text-gray-600 mb-8">
                Thank you for subscribing! You'll receive your first newsletter shortly.
              </p>

              <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">What happens next?</h2>
                <div className="space-y-4 text-left">
                  <div className="flex items-start space-x-3">
                    <div className="bg-indigo-100 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-indigo-600 font-bold text-sm">1</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Check your email</h3>
                      <p className="text-gray-600">We've sent a confirmation email to {email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="bg-indigo-100 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-indigo-600 font-bold text-sm">2</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Get your welcome guide</h3>
                      <p className="text-gray-600">Receive your free "Creative Workflow Optimization" guide</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="bg-indigo-100 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-indigo-600 font-bold text-sm">3</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Weekly newsletter</h3>
                      <p className="text-gray-600">Get actionable tips every Tuesday morning</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/blog">
                  <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                    Explore Our Blog
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="lg" variant="outline">
                    Start Free Trial
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-24 bg-gradient-to-br from-indigo-50 to-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge variant="secondary" className="mb-4 bg-indigo-100 text-indigo-800">
                  Weekly Newsletter
                </Badge>
                
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                  Get Better at What You Love Doing
                </h1>
                
                <p className="text-xl text-gray-600 mb-8">
                  Join 25,000+ creative professionals who get actionable tips, industry insights, 
                  and workflow strategies delivered to their inbox every Tuesday.
                </p>

                <div className="flex items-center space-x-6 mb-8">
                  <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="text-gray-700 font-medium">4.9/5 rating</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-indigo-600" />
                    <span className="text-gray-700 font-medium">25K+ subscribers</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {benefits.map((benefit) => (
                    <div key={benefit.title} className="flex items-start space-x-3">
                      <benefit.icon className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{benefit.title}</h3>
                        <p className="text-gray-600 text-sm">{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Card className="shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Mail className="w-6 h-6 mr-2 text-indigo-600" />
                      Subscribe to Our Newsletter
                    </CardTitle>
                    <CardDescription>
                      Get weekly insights delivered straight to your inbox. No spam, unsubscribe anytime.
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            type="text"
                            placeholder="John"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                            suppressHydrationWarning
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="john@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            suppressHydrationWarning
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-base font-medium text-gray-900">
                          What are you most interested in? (Optional)
                        </Label>
                        <div className="mt-3 grid grid-cols-2 gap-3">
                          {interestOptions.map((interest) => (
                            <div key={interest} className="flex items-center space-x-2">
                              <Checkbox
                                id={interest}
                                checked={interests.includes(interest)}
                                onCheckedChange={(checked) => 
                                  handleInterestChange(interest, checked as boolean)
                                }
                              />
                              <Label 
                                htmlFor={interest} 
                                className="text-sm font-normal text-gray-700 cursor-pointer"
                              >
                                {interest}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full bg-indigo-600 hover:bg-indigo-700" 
                        size="lg"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          'Subscribing...'
                        ) : (
                          <>
                            Subscribe Now <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>

                      <p className="text-xs text-gray-500 text-center">
                        By subscribing, you agree to receive weekly emails from FreeflowZee. 
                        You can unsubscribe at any time.
                      </p>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                What Our Subscribers Say
              </h2>
              <p className="text-lg text-gray-600">
                Join thousands of creative professionals who love our newsletter
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.name} className="shadow-lg">
                  <CardContent className="pt-6">
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    
                    <p className="text-gray-700 mb-4 italic">
                      "{testimonial.content}"
                    </p>
                    
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-indigo-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Level Up Your Creative Game?
            </h2>
            <p className="text-xl text-indigo-100 mb-8">
              Don't miss out on the tips and strategies that could transform your workflow.
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => document.getElementById('email')?.focus()}
            >
              Subscribe Now - It's Free!
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
} 