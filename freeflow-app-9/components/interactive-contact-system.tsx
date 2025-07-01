'use client''

import React, { useState, useReducer, useEffect } from 'react''
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
 field: keyof ContactState['formData']; value: string }'
  | { type: 'SET_SUBMITTING'; submitting: boolean }'
  | { type: 'SET_SUCCESS'; success: boolean }'
  | { type: 'TOGGLE_SCHEDULER'; show: boolean }'
  | { type: 'SET_COPIED_ITEM'; item: string | null }'
  | { type: 'RESET_FORM' }'

function contactReducer(state: ContactState, action: ContactAction): ContactState {
  switch (action.type) {
    case 'SET_ACTIVE_METHOD': "
      return { ...state, activeMethod: action.method }"
    case 'UPDATE_FORM_FIELD': "
      return {
        ...state,
        formData: { ...state.formData, [action.field]: action.value }
      }"
    case 'SET_SUBMITTING': "
      return { ...state, ui: { ...state.ui, isSubmitting: action.submitting } }"
    case 'SET_SUCCESS': "
      return { ...state, ui: { ...state.ui, isSuccess: action.success } }"
    case 'TOGGLE_SCHEDULER': "
      return { ...state, ui: { ...state.ui, showScheduler: action.show } }"
    case 'SET_COPIED_ITEM': "
      return { ...state, ui: { ...state.ui, copiedItem: action.item } }"
    case 'RESET_FORM': "
      return {
        ...state,
        formData: {"
          name: '','
          email: '','
          company: '','
          phone: '','
          subject: '','
          message: '','
          priority: 'medium','
          department: 'general'
        },
        ui: { ...state.ui, isSuccess: false }
      }
    default:
      return state
  }
}

const initialState: ContactState = {
  activeMethod: 'email','
  formData: {
    name: '','
    email: '','
    company: '','
    phone: '','
    subject: '','
    message: '','
    priority: 'medium','
    department: 'general'
  },
  ui: {
    isSubmitting: false,
    isSuccess: false,
    showScheduler: false,
    copiedItem: null
  },
  preferences: {
    preferredContact: 'email','
    timezone: 'PST','
    language: 'en'
  }
}

interface InteractiveContactSystemProps {
  variant?: 'full' | 'compact' | 'sidebar'
  showMethods?: boolean
  showForm?: boolean
  showScheduler?: boolean
  className?: string
}

export function InteractiveContactSystem({
  variant = 'full','
  showMethods = true,
  showForm = true,
  showScheduler = true,
  className = 
}: InteractiveContactSystemProps) {
  const [state, dispatch] = useReducer(contactReducer, initialState)
  const [localTime, setLocalTime] = useState('')'

  // Context7 Pattern: Real-time local time display
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const pstTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }))
      setLocalTime(pstTime.toLocaleTimeString())
    }
    
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  // Context7 Pattern: Copy to clipboard functionality
  const handleCopyToClipboard = async (text: string, item: string) => {
    try {
      await navigator.clipboard.writeText(text)
      dispatch({ type: 'SET_COPIED_ITEM', item })'
      setTimeout(() => dispatch({ type: 'SET_COPIED_ITEM', item: null }), 2000)'
    } catch (error) {
      console.error('Failed to copy:', error)'
    }
  }

  // Context7 Pattern: Direct contact actions
  const handleDirectAction = (action: string, value: string) => {
    switch (action) {
      case 'email': "
        window.location.href = `mailto:${value}?subject=Contact from FreeflowZee Website
        break"
      case 'phone': "
        window.location.href = `tel:${value}
        break"
      case 'maps': "
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}"
        window.open(mapsUrl, '_blank', 'noopener,noreferrer')'
        break
      case 'social':'
        window.open(value, '_blank', 'noopener,noreferrer')'
        break
    }
  }

  // Context7 Pattern: Form submission handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch({ type: 'SET_SUBMITTING', submitting: true })'
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    dispatch({ type: 'SET_SUBMITTING', submitting: false })'
    dispatch({ type: 'SET_SUCCESS', success: true })'
    
    // Reset form after success
    setTimeout(() => {
      dispatch({ type: 'RESET_FORM' })'
    }, 3000)
  }

  // Context7 Pattern: Contact method components
  const ContactMethod = ({ 
    icon: Icon, 
    title, 
    value, 
    action, 
    description, 
    badge 
  }: {
    icon: React.ElementType
    title: string
    value: string
    action: () => void
    description?: string
    badge?: string
  }) => (
    <Card className= "hover:shadow-lg transition-all duration-300 group cursor-pointer" onClick={action}>
      <CardContent className= "p-6">
        <div className= "flex items-start space-x-4">
          <div className= "p-3 bg-indigo-100 rounded-full group-hover:bg-indigo-200 transition-colors">
            <Icon className= "w-6 h-6 text-indigo-600" />
          </div>
          <div className= "flex-1">
            <div className= "flex items-center justify-between mb-2">
              <h3 className= "font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                {title}
              </h3>
              {badge && (
                <Badge variant= "secondary" className= "text-xs">
                  {badge}
                </Badge>
              )}
            </div>
            <p className= "text-gray-600 group-hover:text-indigo-500 transition-colors font-medium">
              {value}
            </p>
            {description && (
              <p className= "text-sm text-gray-500 mt-1">{description}</p>
            )}
            <div className= "flex items-center mt-3 space-x-2">
              <Button
                variant="ghost"
                size= "sm
                onClick={(e) => {
                  e.stopPropagation()
                  handleCopyToClipboard(value, title)
                }}
                className="h-8 px-2
              >
                {state.ui.copiedItem === title ? ("
                  <Check className= "w-3 h-3 text-green-600" />
                ) : (
                  <Copy className= "w-3 h-3" />
                )}
              </Button>
              <ExternalLink className= "w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (variant === 'compact') {'
    return (
      <div className={`space-y-4 ${className}`}>
        <div className= "grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button
            variant="outline"
            onClick={() => handleDirectAction('email', CONTACT_CONFIG.email.primary)}'
            className="justify-start h-auto p-4
          >"
            <Mail className= "w-5 h-5 mr-3" />
            <div className= "text-left">
              <div className= "font-medium">Email Us</div>
              <div className= "text-sm text-gray-500">{CONTACT_CONFIG.email.primary}</div>
            </div>
          </Button>
          <Button
            variant="outline"
            onClick={() => handleDirectAction('phone', CONTACT_CONFIG.phone.primary)}'
            className="justify-start h-auto p-4
          >"
            <Phone className= "w-5 h-5 mr-3" />
            <div className= "text-left">
              <div className= "font-medium">Call Us</div>
              <div className= "text-sm text-gray-500">{CONTACT_CONFIG.phone.primary}</div>
            </div>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-8 ${className}`} suppressHydrationWarning>
      {/* Contact Methods */}
      {showMethods && (
        <div className= "space-y-6">
          <div className= "text-center">
            <h2 className= "text-3xl font-bold text-gray-900 mb-4">Get in Touch</h2>
            <p className= "text-lg text-gray-600 mb-6">
              Choose the best way to reach our team. We're here to help!'
            </p>
            <div className= "flex items-center justify-center text-sm text-gray-500">
              <Clock className= "w-4 h-4 mr-2" />
              <span>PST Time: {localTime}</span>
            </div>
          </div>

          <div className= "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ContactMethod
              icon={Mail}
              title= "Email
              value={CONTACT_CONFIG.email.primary}
              action={() => handleDirectAction('email', CONTACT_CONFIG.email.primary)}'
              description={`Response time: ${CONTACT_CONFIG.responseTime.general}`}
              badge= "Primary
            />
            <ContactMethod
              icon={Phone}
              title= "Phone
              value={CONTACT_CONFIG.phone.primary}
              action={() => handleDirectAction('phone', CONTACT_CONFIG.phone.primary)}'
              description= "Available during business hours
              badge= "Direct
            />
            <ContactMethod
              icon={MessageCircle}
              title= "Live Chat
              value= "Start Chat
              action={() => dispatch({ type: 'SET_ACTIVE_METHOD', method: 'chat' })}'
              description= "Available 24/7
              badge= "Instant
            />
            <ContactMethod
              icon={Calendar}
              title= "Schedule Call
              value= "Book Meeting
              action={() => dispatch({ type: 'TOGGLE_SCHEDULER', show: true })}'
              description= "Choose your preferred time
              badge= "Personal
            />
          </div>

          {/* Specialized Contact Options */}
          <div className= "bg-gray-50 rounded-lg p-6">
            <h3 className= "font-semibold text-gray-900 mb-4">Specialized Support</h3>
            <div className= "grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="ghost"
                onClick={() => handleDirectAction('email', CONTACT_CONFIG.email.sales)}'
                className="justify-start h-auto p-4 hover:bg-green-50
              >"
                <div className= "flex items-center space-x-3">
                  <div className= "p-2 bg-green-100 rounded-full">
                    <Star className= "w-4 h-4 text-green-600" />
                  </div>
                  <div className= "text-left">
                    <div className= "font-medium">Sales Inquiries</div>
                    <div className= "text-sm text-gray-500">
                      {CONTACT_CONFIG.email.sales}
                    </div>
                  </div>
                </div>
              </Button>
              <Button
                variant="ghost"
                onClick={() => handleDirectAction('email', CONTACT_CONFIG.email.support)}'
                className="justify-start h-auto p-4 hover:bg-blue-50
              >"
                <div className= "flex items-center space-x-3">
                  <div className= "p-2 bg-blue-100 rounded-full">
                    <Shield className= "w-4 h-4 text-blue-600" />
                  </div>
                  <div className= "text-left">
                    <div className= "font-medium">Technical Support</div>
                    <div className= "text-sm text-gray-500">
                      {CONTACT_CONFIG.email.support}
                    </div>
                  </div>
                </div>
              </Button>
              <Button
                variant="ghost"
                onClick={() => handleDirectAction('email', CONTACT_CONFIG.email.partnerships)}'
                className="justify-start h-auto p-4 hover:bg-purple-50
              >"
                <div className= "flex items-center space-x-3">
                  <div className= "p-2 bg-purple-100 rounded-full">
                    <Users className= "w-4 h-4 text-purple-600" />
                  </div>
                  <div className= "text-left">
                    <div className= "font-medium">Partnerships</div>
                    <div className= "text-sm text-gray-500">
                      {CONTACT_CONFIG.email.partnerships}
                    </div>
                  </div>
                </div>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Form */}
      {showForm && (
        <Card className= "bg-white shadow-xl">
          <CardHeader>
            <CardTitle className= "text-2xl">Send us a Message</CardTitle>
            <CardDescription>
              Fill out the form below and we'll get back to you within 24 hours.'
            </CardDescription>
          </CardHeader>
          <CardContent>
            {state.ui.isSuccess ? (
              <Alert>
                <Check className= "h-4 w-4" />
                <AlertDescription>
                  Thank you for your message! We'll get back to you soon.'
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleFormSubmit} className= "space-y-6" suppressHydrationWarning>
                <div className= "grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className= "block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <Input
                      required
                      value={state.formData.name}
                      onChange={(e) => dispatch({ 
                        type: 'UPDATE_FORM_FIELD', '
                        field: 'name', '
                        value: e.target.value 
                      })}
                      placeholder="Your full name
                      suppressHydrationWarning
                    />
                  </div>
                  <div>"
                    <label className= "block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <Input
                      type="email
                      required
                      value={state.formData.email}
                      onChange={(e) => dispatch({ "
                        type: 'UPDATE_FORM_FIELD', '
                        field: 'email', '
                        value: e.target.value 
                      })}
                      placeholder="your@email.com
                      suppressHydrationWarning
                    />
                  </div>
                </div>
"
                <div className= "grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className= "block text-sm font-medium text-gray-700 mb-1">
                      Company
                    </label>
                    <Input
                      value={state.formData.company}
                      onChange={(e) => dispatch({ 
                        type: 'UPDATE_FORM_FIELD', '
                        field: 'company', '
                        value: e.target.value 
                      })}
                      placeholder="Your company name
                      suppressHydrationWarning
                    />
                  </div>
                  <div>"
                    <label className= "block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <Input
                      type="tel
                      value={state.formData.phone}
                      onChange={(e) => dispatch({ "
                        type: 'UPDATE_FORM_FIELD', '
                        field: 'phone', '
                        value: e.target.value 
                      })}
                      placeholder="+1 (555) 123-4567
                      suppressHydrationWarning
                    />
                  </div>
                </div>

                <div>"
                  <label className= "block text-sm font-medium text-gray-700 mb-1">
                    Subject *
                  </label>
                  <Input
                    required
                    value={state.formData.subject}
                    onChange={(e) => dispatch({ 
                      type: 'UPDATE_FORM_FIELD', '
                      field: 'subject', '
                      value: e.target.value 
                    })}
                    placeholder="How can we help you?
                    suppressHydrationWarning
                  />
                </div>

                <div>"
                  <label className= "block text-sm font-medium text-gray-700 mb-1">
                    Message *
                  </label>
                  <Textarea
                    required
                    rows={4}
                    value={state.formData.message}
                    onChange={(e) => dispatch({ 
                      type: 'UPDATE_FORM_FIELD', '
                      field: 'message', '
                      value: e.target.value 
                    })}
                    placeholder="Tell us more about your project and how we can help...
                    suppressHydrationWarning
                  />
                </div>

                <Button"
                  type="submit
                  disabled={state.ui.isSubmitting}"
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700
                  suppressHydrationWarning
                >
                  {state.ui.isSubmitting ? ("
                    'Sending...'
                  ) : (
                    <>
                      Send Message
                      <ChevronRight className= "ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {/* Business Information */}
      <div className= "bg-gray-50 rounded-lg p-6">
        <h3 className= "font-semibold text-gray-900 mb-4">Visit Our Office</h3>
        <div className= "grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className= "space-y-3">
            <div className= "flex items-center space-x-3">
              <MapPin className= "w-5 h-5 text-indigo-600" />
              <div>
                <p className= "font-medium text-gray-900">Headquarters</p>
                <p className= "text-gray-600">{CONTACT_CONFIG.location.address}</p>
              </div>
            </div>
            <div className= "flex items-center space-x-3">
              <Clock className= "w-5 h-5 text-indigo-600" />
              <div>
                <p className= "font-medium text-gray-900">Business Hours</p>
                <div className= "text-sm text-gray-600">
                  <p>{CONTACT_CONFIG.businessHours.weekdays}</p>
                  <p>{CONTACT_CONFIG.businessHours.weekend}</p>
                  <p>{CONTACT_CONFIG.businessHours.sunday}</p>
                </div>
              </div>
            </div>
          </div>
          <div className= "space-y-3">
            <div className= "flex items-center space-x-3">
              <Globe className= "w-5 h-5 text-indigo-600" />
              <div>
                <p className= "font-medium text-gray-900">Global Reach</p>
                <p className= "text-gray-600">Supporting clients worldwide</p>
              </div>
            </div>
            <div className= "flex items-center space-x-3">
              <Zap className= "w-5 h-5 text-indigo-600" />
              <div>
                <p className= "font-medium text-gray-900">Response Time</p>
                <p className= "text-gray-600">Average response under 4 hours</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 