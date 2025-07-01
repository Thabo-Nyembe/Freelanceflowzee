import { Metadata } from 'next'
import { ContactForm } from '@/components/contact-form'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact Us - FreeflowZee',
  description: 'Get in touch with our team for support, sales inquiries, or partnership opportunities. We\'re here to help you succeed.',
  keywords: 'contact, support, sales, partnership, creative business',
  openGraph: {
    title: 'Contact Us - FreeflowZee',
    description: 'Get in touch with our team for support, sales inquiries, or partnership opportunities. We\'re here to help you succeed.',
    type: 'website',
    url: 'https://freeflowzee.com/contact'
  },
  other: {
    'application-ld+json': JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "name": "Contact FreeflowZee",
      "description": "Get in touch with our team for support, sales inquiries, or partnership opportunities. We're here to help you succeed.",
      "url": "https://freeflowzee.com/contact"
    })
  }
}

export default function ContactPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Contact Us</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Send us a message</h2>
          <ContactForm />
        </div>
        
        {/* Contact Information */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">Get in touch</h2>
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <MapPin className="w-6 h-6 text-primary mt-1" />
              <div>
                <h3 className="font-medium">Address</h3>
                <address className="not-italic text-gray-600">
                  123 Innovation Drive<br />
                  San Francisco, CA 94105<br />
                  United States
                </address>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <Phone className="w-6 h-6 text-primary mt-1" />
              <div>
                <h3 className="font-medium">Phone</h3>
                <a href="tel:+1-555-FREEFLOW" className="text-gray-600 hover:text-primary">
                  +1 (555) FREEFLOW
                </a>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <Mail className="w-6 h-6 text-primary mt-1" />
              <div>
                <h3 className="font-medium">Email</h3>
                <a href="mailto:hello@freeflowzee.com" className="text-gray-600 hover:text-primary">
                  hello@freeflowzee.com
                </a>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <Clock className="w-6 h-6 text-primary mt-1" />
              <div>
                <h3 className="font-medium">Hours</h3>
                <div className="text-gray-600">
                  <p>Monday - Friday: 9am - 6pm PST</p>
                  <p>24/7 Support Available</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
