import { Metadata } from 'next'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Pricing - FreeflowZee',
  description: 'Choose the perfect plan for your creative business. From free file sharing to premium AI tools and escrow payments.',
  keywords: 'pricing plans, creative business tools, AI features, file sharing, escrow payments',
  openGraph: {
    title: 'Pricing - FreeflowZee',
    description: 'Choose the perfect plan for your creative business. From free file sharing to premium AI tools and escrow payments.',
    type: 'website',
    url: 'https://freeflowzee.com/pricing'
  },
  other: {
    'application-ld+json': JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "FreeflowZee Plans",
      "description": "Choose the perfect plan for your creative business. From free file sharing to premium AI tools and escrow payments.",
      "url": "https://freeflowzee.com/pricing",
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "USD",
        "lowPrice": "0",
        "highPrice": "49",
        "offerCount": "3"
      }
    })
  }
}

export default function PricingPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Pricing Plans</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Free Plan */}
        <div className="p-6 border rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Free</h2>
          <p className="text-3xl font-bold mb-4">$0<span className="text-lg font-normal">/month</span></p>
          <ul className="space-y-2 mb-6">
            <li>✓ Basic file sharing</li>
            <li>✓ Limited AI generations</li>
            <li>✓ Community features</li>
          </ul>
          <Button className="w-full">Get Started</Button>
        </div>
        
        {/* Pro Plan */}
        <div className="p-6 border rounded-lg bg-primary/5">
          <h2 className="text-2xl font-semibold mb-4">Pro</h2>
          <p className="text-3xl font-bold mb-4">$29<span className="text-lg font-normal">/month</span></p>
          <ul className="space-y-2 mb-6">
            <li>✓ Unlimited file sharing</li>
            <li>✓ Advanced AI tools</li>
            <li>✓ Priority support</li>
            <li>✓ Custom branding</li>
          </ul>
          <Button className="w-full">Try Pro</Button>
        </div>
        
        {/* Business Plan */}
        <div className="p-6 border rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Business</h2>
          <p className="text-3xl font-bold mb-4">$49<span className="text-lg font-normal">/month</span></p>
          <ul className="space-y-2 mb-6">
            <li>✓ Everything in Pro</li>
            <li>✓ Team collaboration</li>
            <li>✓ API access</li>
            <li>✓ Advanced analytics</li>
          </ul>
          <Button className="w-full">Contact Sales</Button>
        </div>
      </div>
      
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">ROI Calculator</h2>
        <p className="text-gray-600 mb-4">Calculate your potential savings and earnings with FreeflowZee</p>
        <Button>Open Calculator</Button>
      </div>
    </main>
  )
}
