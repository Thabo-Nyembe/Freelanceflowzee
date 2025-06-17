import { Metadata } from 'next'
import LandingPage from './landing'

export const metadata: Metadata = {
  title: 'FreeflowZee - Create, Share & Get Paid | Ultimate Creator Platform',
  description: 'Transform your creative workflow with FreeflowZee. Upload projects, collaborate with clients, get real-time feedback, and receive payments seamlessly. Join 50K+ creators worldwide.',
  keywords: [
    'creative workflow',
    'freelancer platform',
    'client collaboration',
    'project management',
    'creative portfolio',
    'payment processing',
    'feedback system',
    'file sharing',
    'creator tools',
    'design workflow'
  ],
  authors: [{ name: 'FreeflowZee Team' }],
  creator: 'FreeflowZee',
  publisher: 'FreeflowZee',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://freeflowzee.com',
    title: 'FreeflowZee - Create, Share & Get Paid | Ultimate Creator Platform',
    description: 'Transform your creative workflow with FreeflowZee. Upload projects, collaborate with clients, get real-time feedback, and receive payments seamlessly.',
    siteName: 'FreeflowZee',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'FreeflowZee - Creative Platform for Freelancers',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FreeflowZee - Create, Share & Get Paid',
    description: 'Transform your creative workflow. Join 50K+ creators using FreeflowZee for seamless client collaboration and payments.',
    images: ['/images/twitter-card.jpg'],
    creator: '@freeflowzee',
  },
  alternates: {
    canonical: 'https://freeflowzee.com',
  },
  category: 'technology',
}

export default function Page() {
  return <LandingPage />
} 