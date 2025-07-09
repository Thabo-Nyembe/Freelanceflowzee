'use client'

import React, { useState, useReducer, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Mail,
    Phone,
    MapPin,
    Calendar,
    Copy,
    Check,
    Clock,
    Globe,
    Star,
    Shield,
    Users,
    ChevronRight,
    Zap
} from 'lucide-react'
import {
    Card,
    CardContent,
} from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from '@/components/ui/alert'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

// types
type ContactMethod = 'email' | 'phone' | 'scheduler' | 'form';
type ContactState = {
    activeMethod: ContactMethod;
    formData: {
        name: string;
        email: string;
        company: string;
        phone: string;
        subject: string;
        message: string;
        priority: 'low' | 'medium' | 'high';
        department: 'general' | 'sales' | 'support' | 'billing';
    };
    ui: {
        isSubmitting: boolean;
        isSuccess: boolean;
        showScheduler: boolean;
        copiedItem: string | null;
    };
    preferences: {
        preferredContact: 'email' | 'phone';
        timezone: string;
        language: string;
    };
};

type ContactAction =
  | { type: 'SET_ACTIVE_METHOD'; method: ContactMethod }
  | { type: 'UPDATE_FORM_FIELD'; field: keyof ContactState['formData']; value: string }
  | { type: 'SET_SUBMITTING'; submitting: boolean }
  | { type: 'SET_SUCCESS'; success: boolean }
  | { type: 'TOGGLE_SCHEDULER'; show: boolean }
  | { type: 'SET_COPIED_ITEM'; item: string | null }
  | { type: 'RESET_FORM' };

function contactReducer(state: ContactState, action: ContactAction): ContactState {
  switch (action.type) {
    case 'SET_ACTIVE_METHOD':
      return { ...state, activeMethod: action.method };
    case 'UPDATE_FORM_FIELD':
      return {
        ...state,
        formData: { ...state.formData, [action.field]: action.value }
      };
    case 'SET_SUBMITTING':
      return { ...state, ui: { ...state.ui, isSubmitting: action.submitting } };
    case 'SET_SUCCESS':
      return { ...state, ui: { ...state.ui, isSuccess: action.success } };
    case 'TOGGLE_SCHEDULER':
      return { ...state, ui: { ...state.ui, showScheduler: action.show } };
    case 'SET_COPIED_ITEM':
      return { ...state, ui: { ...state.ui, copiedItem: action.item } };
    case 'RESET_FORM':
      return {
        ...state,
        formData: {
          name: '',
          email: '',
          company: '',
          phone: '',
          subject: '',
          message: '',
          priority: 'medium',
          department: 'general'
        },
        ui: { ...state.ui, isSuccess: false }
      };
    default:
      return state;
  }
}

const initialState: ContactState = {
  activeMethod: 'email',
  formData: {
    name: '',
    email: '',
    company: '',
    phone: '',
    subject: '',
    message: '',
    priority: 'medium',
    department: 'general'
  },
  ui: {
    isSubmitting: false,
    isSuccess: false,
    showScheduler: false,
    copiedItem: null
  },
  preferences: {
    preferredContact: 'email',
    timezone: 'PST',
    language: 'en'
  }
};

interface InteractiveContactSystemProps {
  variant?: 'full' | 'compact' | 'sidebar';
  showMethods?: boolean;
  showForm?: boolean;
  _showScheduler?: boolean;
  className?: string;
}

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  subject: z.string().min(5, {
    message: 'Subject must be at least 5 characters.',
  }),
  category: z.string({
    required_error: 'Please select a category.',
  }),
  message: z.string().min(10, {
    message: 'Message must be at least 10 characters.',
  }),
})

interface ContactFormState {
  status: 'idle' | 'submitting' | 'success' | 'error'
  message?: string
}

export function InteractiveContactSystem({
  variant = 'full',
  showMethods = true,
  showForm = true,
  _showScheduler = true,
  className = ''
}: InteractiveContactSystemProps) {
  const [state, dispatch] = useReducer(contactReducer, initialState);
  const [localTime, setLocalTime] = useState('');
  const [formState, setFormState] = useState<ContactFormState>({
    status: 'idle',
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      category: '',
      message: '',
    },
  })

  // Context7 Pattern: Real-time local time display
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const pstTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
      setLocalTime(pstTime.toLocaleTimeString());
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Context7 Pattern: Copy to clipboard functionality
  const handleCopyToClipboard = async (text: string, item: string) => {
    try {
      await navigator.clipboard.writeText(text);
      dispatch({ type: 'SET_COPIED_ITEM', item });
      setTimeout(() => dispatch({ type: 'SET_COPIED_ITEM', item: null }), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Context7 Pattern: Direct contact actions
  const handleDirectAction = (action: string, value: string) => {
    switch (action) {
      case 'email':
        window.location.href = `mailto:${value}?subject=Contact from KAZI Website`;
        break;
      case 'phone':
        window.location.href = `tel:${value}`;
        break;
      case 'maps':
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}`;
        window.open(mapsUrl, '_blank', 'noopener,noreferrer');
        break;
      case 'social':
        window.open(value, '_blank', 'noopener,noreferrer');
        break;
    }
  };

  // Context7 Pattern: Form submission handler
  const _handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'SET_SUBMITTING', submitting: true });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    dispatch({ type: 'SET_SUBMITTING', submitting: false });
    dispatch({ type: 'SET_SUCCESS', success: true });
    
    // Reset form after success
    setTimeout(() => {
      dispatch({ type: 'RESET_FORM' });
    }, 3000);
  };

  // Context7 Pattern: Contact method components
  const ContactMethod = ({ 
    icon: Icon, 
    title, 
    value, 
    action, 
    description, 
    badge 
  }: {
    icon: React.ElementType;
    title: string;
    value: string;
    action: () => void;
    description?: string;
    badge?: string;
  }) => (
    <Card className="hover:shadow-lg transition-all duration-300 group cursor-pointer" onClick={action}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-indigo-100 rounded-full group-hover:bg-indigo-200 transition-colors">
            <Icon className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                {title}
              </h3>
              {badge && (
                <Badge variant="secondary" className="text-xs">
                  {badge}
                </Badge>
              )}
            </div>
            <p className="text-gray-600 group-hover:text-indigo-500 transition-colors font-medium">
              {value}
            </p>
            {description && (
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            )}
            <div className="flex items-center mt-3 space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyToClipboard(value, title);
                }}
              >
                {state.ui.copiedItem === title ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-500 group-hover:text-indigo-500" />}
                <span className="ml-2">{state.ui.copiedItem === title ? 'Copied' : 'Copy'}</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setFormState({ status: 'submitting' })
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))
      
      // Success state
      setFormState({
        status: 'success',
        message: 'Thank you for your message. We will get back to you soon!',
      })
      
      form.reset()
    } catch (error) {
      setFormState({
        status: 'error',
        message: 'Something went wrong. Please try again later.',
      })
    }
  }

  return (
    <div className={`bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl ${className}`}>
        <div className={`grid ${variant === 'full' ? 'grid-cols-1 lg:grid-cols-2 gap-12' : 'grid-cols-1 gap-8'}`}>
            {showMethods && (
                <div className="space-y-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Get in Touch</h2>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">
                            We&apos;re here to help. Reach out to us through any of the methods below.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ContactMethod
                            icon={Mail}
                            title="General Inquiries"
                            value="support@kazi-platform.com"
                            action={() => handleDirectAction('email', 'support@kazi-platform.com')}
                            description="For general questions and support."
                        />
                        <ContactMethod
                            icon={Phone}
                            title="Phone Support"
                            value="+1 (555) 123-4567"
                            action={() => handleDirectAction('phone', '+1-555-123-4567')}
                            description="Mon-Fri, 9am-5pm PST"
                        />
                         <ContactMethod
                            icon={MapPin}
                            title="Our Office"
                            value="123 Innovation Dr, Tech City"
                            action={() => handleDirectAction('maps', '123 Innovation Dr, Tech City')}
                            badge={localTime}
                        />
                        <ContactMethod
                            icon={Calendar}
                            title="Schedule a Demo"
                            value="Book a time with our team"
                            action={() => dispatch({ type: 'TOGGLE_SCHEDULER', show: !state.ui.showScheduler })}
                        />
                    </div>
                </div>
            )}
             {showForm && (
                <div>
                    <Card>
                        <CardContent className="p-8">
                            {formState.status === 'success' && (
                                <div className="text-center py-12">
                                     <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Message Sent!</h3>
                                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                                        {formState.message}
                                    </p>
                                </div>
                            )}
                            {formState.status === 'error' && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{formState.message}</AlertDescription>
                                </Alert>
                            )}
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="John Doe" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="john@example.com" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="subject"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Subject</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="What is this regarding?" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="category"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Category</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a category" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="general">General Inquiry</SelectItem>
                                                        <SelectItem value="support">Technical Support</SelectItem>
                                                        <SelectItem value="billing">Billing Question</SelectItem>
                                                        <SelectItem value="feedback">Feedback</SelectItem>
                                                        <SelectItem value="other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>
                                                    Choose the category that best matches your inquiry.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="message"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Message</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Type your message here..."
                                                        className="min-h-[120px]"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="flex justify-end">
                                        <Button
                                            type="submit"
                                            className="w-full md:w-auto"
                                            disabled={formState.status === 'submitting'}
                                        >
                                            {formState.status === 'submitting' ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Sending...
                                                </>
                                            ) : (
                                                'Send Message'
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    </div>
  )
} 