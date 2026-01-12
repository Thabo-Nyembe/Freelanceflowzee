/**
 * CV PORTFOLIO UTILITIES
 * World-Class A+++ Professional Portfolio System
 *
 * Features:
 * - Comprehensive TypeScript interfaces
 * - 40+ mock projects
 * - 30+ skills across categories
 * - 10+ work experiences
 * - 35+ helper functions
 * - Export/import capabilities
 * - Analytics tracking
 * - Public portfolio URLs
 */

import { format, differenceInMonths } from 'date-fns'

// ==================== TYPESCRIPT INTERFACES ====================

export interface Project {
  id: string
  title: string
  description: string
  imageUrl: string
  technologies: string[]
  link?: string
  githubLink?: string
  liveLink?: string
  status: 'draft' | 'published' | 'featured' | 'archived'
  category: string
  dateAdded: string
  views: number
  likes: number
  featured: boolean
  order: number
  duration?: string
  role?: string
  teamSize?: number
  highlights: string[]
}

export interface Skill {
  id: string
  name: string
  category: 'Technical' | 'Soft' | 'Languages' | 'Tools'
  proficiency: number // 1-5
  yearsOfExperience: number
  endorsed: boolean
  endorsementCount: number
  projects: string[] // project IDs
  lastUsed?: string
  trending?: boolean
}

export interface Experience {
  id: string
  company: string
  companyLogo?: string
  position: string
  period: string
  location: string
  description: string
  responsibilities: string[]
  achievements: string[]
  technologies: string[]
  startDate: string
  endDate?: string
  current: boolean
  type: 'full-time' | 'part-time' | 'contract' | 'freelance'
  industry?: string
  companySize?: string
}

export interface Education {
  id: string
  institution: string
  institutionLogo?: string
  degree: string
  field: string
  period: string
  location: string
  achievements: string[]
  gpa?: string
  startDate: string
  endDate?: string
  current: boolean
  honors?: string[]
  coursework?: string[]
  thesis?: string
}

export interface Certification {
  id: string
  title: string
  issuer: string
  issuerLogo?: string
  date: string
  expiryDate?: string
  credentialId?: string
  credentialUrl?: string
  description?: string
  skills: string[]
  verified: boolean
}

export interface Testimonial {
  id: string
  author: string
  authorTitle: string
  authorCompany: string
  authorAvatar?: string
  content: string
  rating: number
  date: string
  relationship: 'colleague' | 'manager' | 'client' | 'mentor'
  featured: boolean
}

export interface Portfolio {
  id: string
  userId: string
  title: string
  subtitle: string
  bio: string
  avatar: string
  coverImage: string
  contactInfo: ContactInfo
  socialLinks: SocialLinks
  projects: Project[]
  skills: Skill[]
  experience: Experience[]
  education: Education[]
  certifications: Certification[]
  testimonials: Testimonial[]
  settings: PortfolioSettings
  analytics: PortfolioAnalytics
  createdAt: string
  updatedAt: string
}

export interface ContactInfo {
  email: string
  phone?: string
  location: string
  website?: string
  availability: 'available' | 'busy' | 'unavailable'
  timezone?: string
  preferredContact?: 'email' | 'phone' | 'linkedin'
}

export interface SocialLinks {
  github?: string
  linkedin?: string
  twitter?: string
  behance?: string
  dribbble?: string
  medium?: string
  stackoverflow?: string
  youtube?: string
  instagram?: string
  facebook?: string
}

export interface PortfolioSettings {
  isPublic: boolean
  showContact: boolean
  showSocial: boolean
  showAnalytics: boolean
  theme: 'light' | 'dark' | 'auto'
  customDomain?: string
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string[]
  allowDownload: boolean
  allowShare: boolean
  watermark?: boolean
}

export interface PortfolioAnalytics {
  views: number
  uniqueVisitors: number
  projectViews: number
  contactClicks: number
  socialClicks: number
  cvDownloads: number
  shareCount: number
  avgTimeOnPage: number
  topProjects: string[]
  topSkills: string[]
  visitorCountries: Record<string, number>
  lastUpdated: string
}

export interface PortfolioTheme {
  id: string
  name: string
  description: string
  primaryColor: string
  secondaryColor: string
  fontFamily: string
  layout: 'modern' | 'classic' | 'creative' | 'minimal'
  preview: string
}

export interface ExportOptions {
  format: 'pdf' | 'docx' | 'json' | 'html'
  includeProjects: boolean
  includeSkills: boolean
  includeExperience: boolean
  includeEducation: boolean
  includeCertifications: boolean
  includeTestimonials: boolean
  template?: string
  watermark?: boolean
}

// ==================== MOCK DATA ====================

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    title: 'E-Commerce Platform Redesign',
    description: 'Complete overhaul of a major retail platform serving 500K+ customers with advanced search, personalization, and checkout optimization',
    imageUrl: '/portfolio/ecommerce.jpg',
    technologies: ['React', 'Node.js', 'AWS', 'Stripe', 'Redis', 'PostgreSQL'],
    link: 'https://example.com/ecommerce',
    githubLink: 'https://github.com/example/ecommerce',
    liveLink: 'https://demo.example.com',
    status: 'published',
    category: 'E-Commerce',
    dateAdded: '2023-06-15',
    views: 2847,
    likes: 156,
    featured: true,
    order: 1,
    duration: '6 months',
    role: 'Lead Frontend Developer',
    teamSize: 8,
    highlights: [
      'Improved page load time by 65%',
      'Increased conversion rate by 42%',
      'Implemented real-time inventory system'
    ]
  },
  {
    id: 'proj-2',
    title: 'AI-Powered Analytics Dashboard',
    description: 'Real-time analytics platform with machine learning insights for business intelligence and predictive analytics',
    imageUrl: '/portfolio/analytics.jpg',
    technologies: ['Vue.js', 'Python', 'TensorFlow', 'D3.js', 'FastAPI', 'MongoDB'],
    link: 'https://example.com/analytics',
    githubLink: 'https://github.com/example/analytics',
    status: 'published',
    category: 'Data Analytics',
    dateAdded: '2023-09-20',
    views: 1923,
    likes: 98,
    featured: true,
    order: 2,
    duration: '8 months',
    role: 'Full-Stack Developer',
    teamSize: 5,
    highlights: [
      'Processed 10M+ data points daily',
      'ML models with 94% accuracy',
      'Real-time dashboard updates'
    ]
  },
  {
    id: 'proj-3',
    title: 'Mobile Banking Application',
    description: 'Secure mobile banking solution with biometric authentication, instant transfers, and investment tracking',
    imageUrl: '/portfolio/banking.jpg',
    technologies: ['React Native', 'Node.js', 'MongoDB', 'AWS', 'Plaid API'],
    link: 'https://example.com/banking',
    status: 'published',
    category: 'FinTech',
    dateAdded: '2024-01-10',
    views: 3521,
    likes: 203,
    featured: true,
    order: 3,
    duration: '12 months',
    role: 'Mobile Lead',
    teamSize: 10,
    highlights: [
      '250K+ active users',
      'Bank-grade security implementation',
      'Sub-second transaction processing'
    ]
  },
  {
    id: 'proj-4',
    title: 'Healthcare Patient Portal',
    description: 'Comprehensive patient management system with appointment scheduling, telemedicine, and EHR integration',
    imageUrl: '/portfolio/healthcare.jpg',
    technologies: ['React', 'Django', 'PostgreSQL', 'WebRTC', 'FHIR API'],
    link: 'https://example.com/healthcare',
    status: 'published',
    category: 'Healthcare',
    dateAdded: '2023-03-15',
    views: 1456,
    likes: 87,
    featured: false,
    order: 4,
    duration: '10 months',
    role: 'Senior Developer',
    teamSize: 7,
    highlights: [
      'HIPAA compliant architecture',
      'Integrated with 50+ clinics',
      'Video consultations with HD quality'
    ]
  },
  {
    id: 'proj-5',
    title: 'Social Media Management Tool',
    description: 'All-in-one platform for scheduling, analytics, and engagement across multiple social networks',
    imageUrl: '/portfolio/social.jpg',
    technologies: ['Next.js', 'Express', 'Redis', 'Bull Queue', 'Chart.js'],
    link: 'https://example.com/social',
    githubLink: 'https://github.com/example/social',
    status: 'published',
    category: 'SaaS',
    dateAdded: '2023-08-22',
    views: 2134,
    likes: 121,
    featured: false,
    order: 5,
    duration: '5 months',
    role: 'Tech Lead',
    teamSize: 6,
    highlights: [
      'Multi-platform integration',
      'Scheduled 1M+ posts',
      'Real-time analytics dashboard'
    ]
  },
  {
    id: 'proj-6',
    title: 'Smart Home IoT Platform',
    description: 'Centralized control system for IoT devices with automation, energy monitoring, and AI optimization',
    imageUrl: '/portfolio/iot.jpg',
    technologies: ['Angular', 'Python', 'MQTT', 'InfluxDB', 'Grafana'],
    link: 'https://example.com/iot',
    status: 'published',
    category: 'IoT',
    dateAdded: '2023-05-10',
    views: 1678,
    likes: 94,
    featured: false,
    order: 6,
    duration: '7 months',
    role: 'IoT Developer',
    teamSize: 4,
    highlights: [
      'Connected 100K+ devices',
      'Energy savings up to 35%',
      'Voice control integration'
    ]
  },
  {
    id: 'proj-7',
    title: 'Online Learning Platform',
    description: 'Interactive e-learning system with video courses, quizzes, certifications, and live classes',
    imageUrl: '/portfolio/elearning.jpg',
    technologies: ['React', 'Node.js', 'MongoDB', 'WebRTC', 'Stripe'],
    link: 'https://example.com/learning',
    status: 'published',
    category: 'Education',
    dateAdded: '2023-11-05',
    views: 2987,
    likes: 178,
    featured: true,
    order: 7,
    duration: '9 months',
    role: 'Lead Developer',
    teamSize: 9,
    highlights: [
      '50K+ enrolled students',
      '500+ courses available',
      'Live class capacity: 1000 students'
    ]
  },
  {
    id: 'proj-8',
    title: 'Restaurant Ordering System',
    description: 'Complete food ordering and delivery platform with real-time tracking and kitchen management',
    imageUrl: '/portfolio/food.jpg',
    technologies: ['React Native', 'Firebase', 'Google Maps API', 'Stripe'],
    link: 'https://example.com/food',
    status: 'published',
    category: 'Food Tech',
    dateAdded: '2023-07-18',
    views: 1834,
    likes: 102,
    featured: false,
    order: 8,
    duration: '4 months',
    role: 'Mobile Developer',
    teamSize: 5,
    highlights: [
      '200+ restaurant partners',
      'Average delivery time: 28 mins',
      '15K+ daily orders'
    ]
  },
  {
    id: 'proj-9',
    title: 'Real Estate Marketplace',
    description: 'Property listing and management platform with virtual tours, mortgage calculator, and CRM',
    imageUrl: '/portfolio/realestate.jpg',
    technologies: ['Next.js', 'PostgreSQL', 'Three.js', 'Mapbox', 'Stripe'],
    link: 'https://example.com/realestate',
    status: 'published',
    category: 'Real Estate',
    dateAdded: '2023-04-12',
    views: 2456,
    likes: 143,
    featured: false,
    order: 9,
    duration: '8 months',
    role: 'Senior Developer',
    teamSize: 7,
    highlights: [
      '10K+ property listings',
      '360° virtual tours',
      'AI-powered property matching'
    ]
  },
  {
    id: 'proj-10',
    title: 'Fitness Tracking App',
    description: 'Comprehensive fitness tracker with workout plans, nutrition tracking, and social challenges',
    imageUrl: '/portfolio/fitness.jpg',
    technologies: ['React Native', 'Node.js', 'MongoDB', 'Health Kit', 'Chart.js'],
    link: 'https://example.com/fitness',
    githubLink: 'https://github.com/example/fitness',
    status: 'published',
    category: 'Health & Fitness',
    dateAdded: '2023-10-08',
    views: 3124,
    likes: 189,
    featured: true,
    order: 10,
    duration: '6 months',
    role: 'Mobile Lead',
    teamSize: 6,
    highlights: [
      '100K+ active users',
      'Integrated with 20+ wearables',
      'AI workout recommendations'
    ]
  },
  {
    id: 'proj-11',
    title: 'Project Management Tool',
    description: 'Agile project management platform with kanban boards, time tracking, and team collaboration',
    imageUrl: '/portfolio/pm.jpg',
    technologies: ['Vue.js', 'Laravel', 'MySQL', 'Redis', 'Socket.io'],
    link: 'https://example.com/pm',
    status: 'published',
    category: 'Productivity',
    dateAdded: '2023-02-20',
    views: 1987,
    likes: 115,
    featured: false,
    order: 11,
    duration: '7 months',
    role: 'Full-Stack Developer',
    teamSize: 5,
    highlights: [
      '5K+ teams using platform',
      'Real-time collaboration',
      'Integrated with 30+ tools'
    ]
  },
  {
    id: 'proj-12',
    title: 'Video Streaming Service',
    description: 'Netflix-style streaming platform with CDN integration, adaptive bitrate, and offline viewing',
    imageUrl: '/portfolio/streaming.jpg',
    technologies: ['React', 'Node.js', 'AWS Media Services', 'DRM', 'Cloudflare'],
    link: 'https://example.com/streaming',
    status: 'published',
    category: 'Media',
    dateAdded: '2023-12-03',
    views: 4123,
    likes: 245,
    featured: true,
    order: 12,
    duration: '14 months',
    role: 'Video Platform Engineer',
    teamSize: 12,
    highlights: [
      '1M+ hours watched',
      '4K streaming support',
      '99.9% uptime'
    ]
  },
  {
    id: 'proj-13',
    title: 'Travel Booking Platform',
    description: 'Comprehensive travel booking system for flights, hotels, and activities with price comparison',
    imageUrl: '/portfolio/travel.jpg',
    technologies: ['Next.js', 'PostgreSQL', 'Amadeus API', 'Stripe', 'Redis'],
    link: 'https://example.com/travel',
    status: 'published',
    category: 'Travel',
    dateAdded: '2023-06-28',
    views: 2678,
    likes: 156,
    featured: false,
    order: 13,
    duration: '10 months',
    role: 'Senior Developer',
    teamSize: 8,
    highlights: [
      'Search 500+ airlines',
      '1M+ hotel listings',
      'Dynamic pricing engine'
    ]
  },
  {
    id: 'proj-14',
    title: 'Inventory Management System',
    description: 'Enterprise warehouse management with barcode scanning, forecasting, and supplier integration',
    imageUrl: '/portfolio/inventory.jpg',
    technologies: ['Angular', 'Java Spring', 'Oracle DB', 'SAP Integration'],
    link: 'https://example.com/inventory',
    status: 'published',
    category: 'Enterprise',
    dateAdded: '2023-03-30',
    views: 1345,
    likes: 78,
    featured: false,
    order: 14,
    duration: '12 months',
    role: 'Enterprise Developer',
    teamSize: 10,
    highlights: [
      'Managed 500K+ SKUs',
      'Reduced stockouts by 65%',
      'Multi-warehouse support'
    ]
  },
  {
    id: 'proj-15',
    title: 'Cryptocurrency Exchange',
    description: 'Secure crypto trading platform with real-time charts, order books, and wallet management',
    imageUrl: '/portfolio/crypto.jpg',
    technologies: ['React', 'Rust', 'WebSocket', 'TradingView', 'Cold Storage'],
    link: 'https://example.com/crypto',
    status: 'published',
    category: 'FinTech',
    dateAdded: '2023-09-14',
    views: 3456,
    likes: 198,
    featured: true,
    order: 15,
    duration: '16 months',
    role: 'Blockchain Developer',
    teamSize: 11,
    highlights: [
      '$50M+ daily volume',
      'Sub-millisecond trades',
      'Multi-signature security'
    ]
  },
  {
    id: 'proj-16',
    title: 'HR Management System',
    description: 'Complete HRIS with payroll, recruitment, performance reviews, and employee self-service',
    imageUrl: '/portfolio/hr.jpg',
    technologies: ['React', 'Django', 'PostgreSQL', 'Celery', 'PDF Generation'],
    link: 'https://example.com/hr',
    status: 'published',
    category: 'HR Tech',
    dateAdded: '2023-05-25',
    views: 1567,
    likes: 91,
    featured: false,
    order: 16,
    duration: '9 months',
    role: 'Senior Developer',
    teamSize: 6,
    highlights: [
      'Managing 10K+ employees',
      'Automated payroll processing',
      'ATS with AI screening'
    ]
  },
  {
    id: 'proj-17',
    title: 'Event Management Platform',
    description: 'End-to-end event platform with ticketing, virtual events, networking, and analytics',
    imageUrl: '/portfolio/events.jpg',
    technologies: ['Next.js', 'Node.js', 'MongoDB', 'Zoom API', 'Stripe'],
    link: 'https://example.com/events',
    status: 'published',
    category: 'Events',
    dateAdded: '2023-08-07',
    views: 2234,
    likes: 134,
    featured: false,
    order: 17,
    duration: '6 months',
    role: 'Full-Stack Developer',
    teamSize: 5,
    highlights: [
      '500+ events hosted',
      '50K+ attendees',
      'Hybrid event support'
    ]
  },
  {
    id: 'proj-18',
    title: 'Content Management System',
    description: 'Headless CMS with drag-and-drop builder, multi-language support, and API-first architecture',
    imageUrl: '/portfolio/cms.jpg',
    technologies: ['React', 'Node.js', 'MongoDB', 'GraphQL', 'AWS S3'],
    link: 'https://example.com/cms',
    githubLink: 'https://github.com/example/cms',
    status: 'published',
    category: 'CMS',
    dateAdded: '2023-04-18',
    views: 1876,
    likes: 108,
    featured: false,
    order: 18,
    duration: '8 months',
    role: 'Backend Lead',
    teamSize: 7,
    highlights: [
      '1000+ websites powered',
      'Multi-channel publishing',
      'GraphQL API'
    ]
  },
  {
    id: 'proj-19',
    title: 'Fleet Management System',
    description: 'GPS tracking, route optimization, fuel monitoring, and driver behavior analytics for fleets',
    imageUrl: '/portfolio/fleet.jpg',
    technologies: ['Angular', 'Python', 'PostgreSQL', 'Google Maps', 'IoT Sensors'],
    link: 'https://example.com/fleet',
    status: 'published',
    category: 'Logistics',
    dateAdded: '2023-07-02',
    views: 1432,
    likes: 83,
    featured: false,
    order: 19,
    duration: '10 months',
    role: 'IoT Developer',
    teamSize: 6,
    highlights: [
      '5000+ vehicles tracked',
      'Fuel savings: 22%',
      'Real-time route optimization'
    ]
  },
  {
    id: 'proj-20',
    title: 'Digital Wallet App',
    description: 'Mobile wallet for payments, money transfers, bill payments, and loyalty programs',
    imageUrl: '/portfolio/wallet.jpg',
    technologies: ['React Native', 'Node.js', 'PostgreSQL', 'NFC', 'Biometrics'],
    link: 'https://example.com/wallet',
    status: 'published',
    category: 'FinTech',
    dateAdded: '2023-11-22',
    views: 2890,
    likes: 167,
    featured: true,
    order: 20,
    duration: '7 months',
    role: 'Mobile Lead',
    teamSize: 8,
    highlights: [
      '500K+ users',
      'PCI-DSS compliant',
      'Contactless payments'
    ]
  },
  // Additional 20 projects
  {
    id: 'proj-21',
    title: 'Music Streaming App',
    description: 'Spotify-like music platform with personalized playlists, podcasts, and social features',
    imageUrl: '/portfolio/music.jpg',
    technologies: ['React Native', 'Node.js', 'MongoDB', 'AWS S3', 'ML Recommendations'],
    status: 'published',
    category: 'Media',
    dateAdded: '2023-01-15',
    views: 3567,
    likes: 212,
    featured: true,
    order: 21,
    duration: '11 months',
    role: 'Audio Engineer',
    teamSize: 9,
    highlights: [
      '2M+ songs library',
      'Lossless audio quality',
      'AI-powered discovery'
    ]
  },
  {
    id: 'proj-22',
    title: 'Recipe & Meal Planning App',
    description: 'Smart cooking app with recipe search, meal plans, grocery lists, and nutrition tracking',
    imageUrl: '/portfolio/recipe.jpg',
    technologies: ['Vue.js', 'Firebase', 'Algolia', 'Nutrition API'],
    status: 'published',
    category: 'Food Tech',
    dateAdded: '2023-03-08',
    views: 1923,
    likes: 118,
    featured: false,
    order: 22,
    duration: '5 months',
    role: 'Frontend Developer',
    teamSize: 4,
    highlights: [
      '10K+ recipes',
      'AI meal suggestions',
      'Dietary preference filters'
    ]
  },
  {
    id: 'proj-23',
    title: 'Insurance Claims Portal',
    description: 'Digital claims processing with document upload, AI assessment, and instant approvals',
    imageUrl: '/portfolio/insurance.jpg',
    technologies: ['React', 'Java', 'Oracle', 'OCR', 'ML Models'],
    status: 'published',
    category: 'InsurTech',
    dateAdded: '2023-06-03',
    views: 1456,
    likes: 84,
    featured: false,
    order: 23,
    duration: '9 months',
    role: 'Enterprise Developer',
    teamSize: 8,
    highlights: [
      'Process 50K+ claims/month',
      '70% faster approvals',
      'Fraud detection AI'
    ]
  },
  {
    id: 'proj-24',
    title: 'Freelance Marketplace',
    description: 'Platform connecting freelancers with clients, escrow payments, and project management',
    imageUrl: '/portfolio/freelance.jpg',
    technologies: ['Next.js', 'PostgreSQL', 'Stripe Connect', 'WebSocket'],
    status: 'published',
    category: 'Marketplace',
    dateAdded: '2023-08-19',
    views: 2345,
    likes: 145,
    featured: false,
    order: 24,
    duration: '8 months',
    role: 'Full-Stack Developer',
    teamSize: 7,
    highlights: [
      '50K+ freelancers',
      '$10M+ in transactions',
      'Escrow protection'
    ]
  },
  {
    id: 'proj-25',
    title: 'Customer Support Chatbot',
    description: 'AI-powered chatbot with NLP, multi-language support, and human handoff capabilities',
    imageUrl: '/portfolio/chatbot.jpg',
    technologies: ['Python', 'TensorFlow', 'Dialogflow', 'WebSocket', 'Redis'],
    status: 'published',
    category: 'AI/ML',
    dateAdded: '2023-05-14',
    views: 2134,
    likes: 128,
    featured: false,
    order: 25,
    duration: '6 months',
    role: 'ML Engineer',
    teamSize: 5,
    highlights: [
      '85% resolution rate',
      '24/7 availability',
      'Multi-language support'
    ]
  },
  {
    id: 'proj-26',
    title: 'Augmented Reality Shopping',
    description: 'AR try-on experience for fashion and furniture with 3D models and virtual fitting',
    imageUrl: '/portfolio/ar.jpg',
    technologies: ['React Native', 'ARKit', 'ARCore', 'Three.js', 'WebGL'],
    status: 'published',
    category: 'AR/VR',
    dateAdded: '2023-09-28',
    views: 2876,
    likes: 172,
    featured: true,
    order: 26,
    duration: '10 months',
    role: 'AR Developer',
    teamSize: 6,
    highlights: [
      '1000+ 3D models',
      '40% return reduction',
      'Virtual fitting room'
    ]
  },
  {
    id: 'proj-27',
    title: 'Gaming Tournament Platform',
    description: 'Esports tournament organizer with brackets, live streaming, and prize distribution',
    imageUrl: '/portfolio/gaming.jpg',
    technologies: ['Next.js', 'Node.js', 'MongoDB', 'Twitch API', 'Cryptocurrency'],
    status: 'published',
    category: 'Gaming',
    dateAdded: '2023-07-11',
    views: 3234,
    likes: 198,
    featured: true,
    order: 27,
    duration: '7 months',
    role: 'Gaming Platform Developer',
    teamSize: 8,
    highlights: [
      '100+ tournaments',
      '50K+ gamers',
      '$500K+ in prizes'
    ]
  },
  {
    id: 'proj-28',
    title: 'Legal Document Automation',
    description: 'AI-powered legal document generator with templates, e-signatures, and compliance checks',
    imageUrl: '/portfolio/legal.jpg',
    technologies: ['React', 'Python', 'NLP', 'DocuSign API', 'PDF Generation'],
    status: 'published',
    category: 'LegalTech',
    dateAdded: '2023-04-05',
    views: 1678,
    likes: 97,
    featured: false,
    order: 28,
    duration: '9 months',
    role: 'Legal Tech Developer',
    teamSize: 5,
    highlights: [
      '500+ legal templates',
      '80% time savings',
      'Compliance automation'
    ]
  },
  {
    id: 'proj-29',
    title: 'Carbon Footprint Tracker',
    description: 'Sustainability app tracking personal carbon emissions with offset recommendations',
    imageUrl: '/portfolio/carbon.jpg',
    technologies: ['React Native', 'Node.js', 'MongoDB', 'Climate API', 'Stripe'],
    status: 'published',
    category: 'Sustainability',
    dateAdded: '2023-10-16',
    views: 1892,
    likes: 114,
    featured: false,
    order: 29,
    duration: '5 months',
    role: 'Mobile Developer',
    teamSize: 4,
    highlights: [
      '30K+ users',
      '5K tons CO2 offset',
      'Gamified challenges'
    ]
  },
  {
    id: 'proj-30',
    title: 'Voice Assistant Platform',
    description: 'Custom voice assistant with wake word detection, NLU, and smart home integration',
    imageUrl: '/portfolio/voice.jpg',
    technologies: ['Python', 'TensorFlow', 'Speech Recognition', 'IoT', 'Cloud Functions'],
    status: 'published',
    category: 'AI/ML',
    dateAdded: '2023-12-08',
    views: 2567,
    likes: 156,
    featured: true,
    order: 30,
    duration: '11 months',
    role: 'Voice AI Engineer',
    teamSize: 7,
    highlights: [
      '95% accuracy',
      '10+ languages',
      'Custom wake words'
    ]
  },
  {
    id: 'proj-31',
    title: 'Pharmacy Management System',
    description: 'Complete pharmacy solution with inventory, prescriptions, insurance, and delivery',
    imageUrl: '/portfolio/pharmacy.jpg',
    technologies: ['Angular', 'C#', '.NET', 'SQL Server', 'Barcode Scanner'],
    status: 'published',
    category: 'Healthcare',
    dateAdded: '2023-02-14',
    views: 1345,
    likes: 78,
    featured: false,
    order: 31,
    duration: '10 months',
    role: 'Healthcare Developer',
    teamSize: 6,
    highlights: [
      '200+ pharmacies',
      'Insurance claim automation',
      'Medication interaction alerts'
    ]
  },
  {
    id: 'proj-32',
    title: 'Weather Forecasting App',
    description: 'Hyperlocal weather with radar, alerts, and AI-powered predictions',
    imageUrl: '/portfolio/weather.jpg',
    technologies: ['React Native', 'Python', 'ML Models', 'Weather APIs', 'Push Notifications'],
    status: 'published',
    category: 'Utilities',
    dateAdded: '2023-05-29',
    views: 2123,
    likes: 127,
    featured: false,
    order: 32,
    duration: '4 months',
    role: 'Mobile Developer',
    teamSize: 3,
    highlights: [
      '1M+ downloads',
      'Hyperlocal accuracy',
      'Severe weather alerts'
    ]
  },
  {
    id: 'proj-33',
    title: 'Nonprofit Donation Platform',
    description: 'Fundraising platform with campaigns, recurring donations, and impact tracking',
    imageUrl: '/portfolio/nonprofit.jpg',
    technologies: ['Next.js', 'Stripe', 'PostgreSQL', 'SendGrid', 'Analytics'],
    status: 'published',
    category: 'Social Good',
    dateAdded: '2023-08-03',
    views: 1567,
    likes: 93,
    featured: false,
    order: 33,
    duration: '6 months',
    role: 'Full-Stack Developer',
    teamSize: 4,
    highlights: [
      '$5M+ raised',
      '100+ nonprofits',
      'Impact reporting'
    ]
  },
  {
    id: 'proj-34',
    title: 'Construction Project Manager',
    description: 'Construction management with blueprints, scheduling, budgeting, and safety compliance',
    imageUrl: '/portfolio/construction.jpg',
    technologies: ['React', 'Node.js', 'PostgreSQL', 'CAD Integration', 'Mobile Apps'],
    status: 'published',
    category: 'Construction',
    dateAdded: '2023-06-21',
    views: 1234,
    likes: 71,
    featured: false,
    order: 34,
    duration: '12 months',
    role: 'Senior Developer',
    teamSize: 8,
    highlights: [
      '500+ projects managed',
      'Cost tracking accuracy: 98%',
      'Safety incident reduction: 45%'
    ]
  },
  {
    id: 'proj-35',
    title: 'Pet Care & Vet Booking',
    description: 'Pet health records, vet appointments, grooming bookings, and pet marketplace',
    imageUrl: '/portfolio/petcare.jpg',
    technologies: ['React Native', 'Firebase', 'Stripe', 'Google Calendar', 'Push Notifications'],
    status: 'published',
    category: 'Pet Tech',
    dateAdded: '2023-09-05',
    views: 1876,
    likes: 112,
    featured: false,
    order: 35,
    duration: '5 months',
    role: 'Mobile Developer',
    teamSize: 4,
    highlights: [
      '50K+ pet profiles',
      '200+ vet partners',
      'Vaccination reminders'
    ]
  },
  {
    id: 'proj-36',
    title: 'Blockchain Supply Chain',
    description: 'Product traceability and authenticity verification using blockchain technology',
    imageUrl: '/portfolio/blockchain.jpg',
    technologies: ['React', 'Ethereum', 'Solidity', 'Web3.js', 'IPFS'],
    status: 'published',
    category: 'Blockchain',
    dateAdded: '2023-11-12',
    views: 2456,
    likes: 148,
    featured: true,
    order: 36,
    duration: '13 months',
    role: 'Blockchain Developer',
    teamSize: 6,
    highlights: [
      '1M+ products tracked',
      'Counterfeit prevention',
      'Smart contract automation'
    ]
  },
  {
    id: 'proj-37',
    title: 'Language Learning App',
    description: 'Interactive language courses with AI tutoring, speech recognition, and cultural lessons',
    imageUrl: '/portfolio/language.jpg',
    technologies: ['React Native', 'Python', 'Speech API', 'ML Models', 'Gamification'],
    status: 'published',
    category: 'Education',
    dateAdded: '2023-04-27',
    views: 3123,
    likes: 189,
    featured: true,
    order: 37,
    duration: '8 months',
    role: 'EdTech Developer',
    teamSize: 7,
    highlights: [
      '15 languages',
      '200K+ learners',
      'AI pronunciation feedback'
    ]
  },
  {
    id: 'proj-38',
    title: 'Virtual Office Platform',
    description: 'Remote work hub with video rooms, virtual desks, team collaboration, and analytics',
    imageUrl: '/portfolio/virtual-office.jpg',
    technologies: ['Next.js', 'WebRTC', 'Socket.io', 'Three.js', 'MongoDB'],
    status: 'published',
    category: 'Remote Work',
    dateAdded: '2023-07-23',
    views: 2678,
    likes: 162,
    featured: true,
    order: 38,
    duration: '9 months',
    role: 'Platform Engineer',
    teamSize: 9,
    highlights: [
      '1000+ companies',
      '3D virtual offices',
      'Productivity analytics'
    ]
  },
  {
    id: 'proj-39',
    title: 'Ride Sharing Platform',
    description: 'Uber-like ride hailing with driver management, route optimization, and surge pricing',
    imageUrl: '/portfolio/rideshare.jpg',
    technologies: ['React Native', 'Node.js', 'MongoDB', 'Google Maps', 'Stripe'],
    status: 'published',
    category: 'Transportation',
    dateAdded: '2023-05-17',
    views: 3456,
    likes: 207,
    featured: true,
    order: 39,
    duration: '15 months',
    role: 'Mobile Platform Lead',
    teamSize: 12,
    highlights: [
      '10K+ drivers',
      '500K+ rides completed',
      'Dynamic pricing engine'
    ]
  },
  {
    id: 'proj-40',
    title: 'Smart Parking Solution',
    description: 'IoT parking system with real-time availability, reservations, and automated payments',
    imageUrl: '/portfolio/parking.jpg',
    technologies: ['Angular', 'Python', 'IoT Sensors', 'Google Maps', 'Stripe'],
    status: 'published',
    category: 'Smart City',
    dateAdded: '2023-10-01',
    views: 1789,
    likes: 104,
    featured: false,
    order: 40,
    duration: '7 months',
    role: 'IoT Developer',
    teamSize: 5,
    highlights: [
      '5000+ parking spots',
      'Reduced search time: 70%',
      'License plate recognition'
    ]
  }
]

export const MOCK_SKILLS: Skill[] = [
  // Technical Skills - Frontend
  { id: 'skill-1', name: 'React', category: 'Technical', proficiency: 5, yearsOfExperience: 6, endorsed: true, endorsementCount: 45, projects: ['proj-1', 'proj-2', 'proj-3'], lastUsed: '2024-01', trending: true },
  { id: 'skill-2', name: 'Vue.js', category: 'Technical', proficiency: 4, yearsOfExperience: 4, endorsed: true, endorsementCount: 28, projects: ['proj-2', 'proj-22'], lastUsed: '2023-12' },
  { id: 'skill-3', name: 'Angular', category: 'Technical', proficiency: 4, yearsOfExperience: 3, endorsed: true, endorsementCount: 22, projects: ['proj-6', 'proj-14'], lastUsed: '2023-11' },
  { id: 'skill-4', name: 'Next.js', category: 'Technical', proficiency: 5, yearsOfExperience: 4, endorsed: true, endorsementCount: 38, projects: ['proj-9', 'proj-17'], lastUsed: '2024-01', trending: true },
  { id: 'skill-5', name: 'TypeScript', category: 'Technical', proficiency: 5, yearsOfExperience: 5, endorsed: true, endorsementCount: 42, projects: ['proj-1', 'proj-3', 'proj-7'], lastUsed: '2024-01', trending: true },
  { id: 'skill-6', name: 'JavaScript', category: 'Technical', proficiency: 5, yearsOfExperience: 8, endorsed: true, endorsementCount: 56, projects: ['proj-1', 'proj-2', 'proj-3'], lastUsed: '2024-01' },
  { id: 'skill-7', name: 'HTML5', category: 'Technical', proficiency: 5, yearsOfExperience: 8, endorsed: true, endorsementCount: 34, projects: [], lastUsed: '2024-01' },
  { id: 'skill-8', name: 'CSS3', category: 'Technical', proficiency: 5, yearsOfExperience: 8, endorsed: true, endorsementCount: 31, projects: [], lastUsed: '2024-01' },
  { id: 'skill-9', name: 'Tailwind CSS', category: 'Technical', proficiency: 5, yearsOfExperience: 3, endorsed: true, endorsementCount: 29, projects: ['proj-1', 'proj-7'], lastUsed: '2024-01', trending: true },
  { id: 'skill-10', name: 'SASS/SCSS', category: 'Technical', proficiency: 4, yearsOfExperience: 5, endorsed: true, endorsementCount: 18, projects: [], lastUsed: '2023-10' },

  // Technical Skills - Backend
  { id: 'skill-11', name: 'Node.js', category: 'Technical', proficiency: 5, yearsOfExperience: 6, endorsed: true, endorsementCount: 48, projects: ['proj-1', 'proj-3', 'proj-5'], lastUsed: '2024-01', trending: true },
  { id: 'skill-12', name: 'Python', category: 'Technical', proficiency: 4, yearsOfExperience: 5, endorsed: true, endorsementCount: 35, projects: ['proj-2', 'proj-6'], lastUsed: '2023-12', trending: true },
  { id: 'skill-13', name: 'Django', category: 'Technical', proficiency: 4, yearsOfExperience: 3, endorsed: true, endorsementCount: 24, projects: ['proj-4', 'proj-16'], lastUsed: '2023-11' },
  { id: 'skill-14', name: 'Express.js', category: 'Technical', proficiency: 5, yearsOfExperience: 5, endorsed: true, endorsementCount: 32, projects: ['proj-5', 'proj-11'], lastUsed: '2024-01' },
  { id: 'skill-15', name: 'FastAPI', category: 'Technical', proficiency: 4, yearsOfExperience: 2, endorsed: true, endorsementCount: 16, projects: ['proj-2'], lastUsed: '2023-09', trending: true },
  { id: 'skill-16', name: 'GraphQL', category: 'Technical', proficiency: 4, yearsOfExperience: 3, endorsed: true, endorsementCount: 27, projects: ['proj-18'], lastUsed: '2023-12', trending: true },
  { id: 'skill-17', name: 'REST API', category: 'Technical', proficiency: 5, yearsOfExperience: 7, endorsed: true, endorsementCount: 41, projects: ['proj-1', 'proj-2', 'proj-3'], lastUsed: '2024-01' },

  // Technical Skills - Databases
  { id: 'skill-18', name: 'PostgreSQL', category: 'Technical', proficiency: 5, yearsOfExperience: 6, endorsed: true, endorsementCount: 38, projects: ['proj-1', 'proj-9'], lastUsed: '2024-01' },
  { id: 'skill-19', name: 'MongoDB', category: 'Technical', proficiency: 5, yearsOfExperience: 5, endorsed: true, endorsementCount: 36, projects: ['proj-3', 'proj-7'], lastUsed: '2023-12' },
  { id: 'skill-20', name: 'Redis', category: 'Technical', proficiency: 4, yearsOfExperience: 4, endorsed: true, endorsementCount: 22, projects: ['proj-1', 'proj-5'], lastUsed: '2023-11' },
  { id: 'skill-21', name: 'MySQL', category: 'Technical', proficiency: 4, yearsOfExperience: 6, endorsed: true, endorsementCount: 29, projects: ['proj-11'], lastUsed: '2023-10' },

  // Technical Skills - Cloud & DevOps
  { id: 'skill-22', name: 'AWS', category: 'Technical', proficiency: 4, yearsOfExperience: 5, endorsed: true, endorsementCount: 33, projects: ['proj-1', 'proj-3'], lastUsed: '2024-01', trending: true },
  { id: 'skill-23', name: 'Docker', category: 'Technical', proficiency: 4, yearsOfExperience: 4, endorsed: true, endorsementCount: 28, projects: [], lastUsed: '2024-01', trending: true },
  { id: 'skill-24', name: 'Kubernetes', category: 'Technical', proficiency: 3, yearsOfExperience: 2, endorsed: true, endorsementCount: 14, projects: [], lastUsed: '2023-09' },
  { id: 'skill-25', name: 'CI/CD', category: 'Technical', proficiency: 4, yearsOfExperience: 5, endorsed: true, endorsementCount: 26, projects: [], lastUsed: '2024-01' },
  { id: 'skill-26', name: 'Git', category: 'Technical', proficiency: 5, yearsOfExperience: 8, endorsed: true, endorsementCount: 45, projects: [], lastUsed: '2024-01' },

  // Technical Skills - Mobile
  { id: 'skill-27', name: 'React Native', category: 'Technical', proficiency: 5, yearsOfExperience: 4, endorsed: true, endorsementCount: 34, projects: ['proj-3', 'proj-8', 'proj-10'], lastUsed: '2024-01', trending: true },
  { id: 'skill-28', name: 'iOS Development', category: 'Technical', proficiency: 3, yearsOfExperience: 2, endorsed: false, endorsementCount: 8, projects: [], lastUsed: '2023-06' },
  { id: 'skill-29', name: 'Android Development', category: 'Technical', proficiency: 3, yearsOfExperience: 2, endorsed: false, endorsementCount: 9, projects: [], lastUsed: '2023-06' },

  // Technical Skills - Testing
  { id: 'skill-30', name: 'Jest', category: 'Technical', proficiency: 4, yearsOfExperience: 4, endorsed: true, endorsementCount: 19, projects: [], lastUsed: '2024-01' },
  { id: 'skill-31', name: 'Cypress', category: 'Technical', proficiency: 4, yearsOfExperience: 3, endorsed: true, endorsementCount: 17, projects: [], lastUsed: '2023-12' },
  { id: 'skill-32', name: 'Playwright', category: 'Technical', proficiency: 3, yearsOfExperience: 1, endorsed: false, endorsementCount: 6, projects: [], lastUsed: '2023-11', trending: true },

  // Tools
  { id: 'skill-33', name: 'VS Code', category: 'Tools', proficiency: 5, yearsOfExperience: 6, endorsed: true, endorsementCount: 23, projects: [], lastUsed: '2024-01' },
  { id: 'skill-34', name: 'Figma', category: 'Tools', proficiency: 4, yearsOfExperience: 4, endorsed: true, endorsementCount: 21, projects: [], lastUsed: '2024-01' },
  { id: 'skill-35', name: 'Postman', category: 'Tools', proficiency: 5, yearsOfExperience: 5, endorsed: true, endorsementCount: 18, projects: [], lastUsed: '2024-01' },
  { id: 'skill-36', name: 'Jira', category: 'Tools', proficiency: 4, yearsOfExperience: 6, endorsed: true, endorsementCount: 25, projects: [], lastUsed: '2024-01' },

  // Soft Skills
  { id: 'skill-37', name: 'Leadership', category: 'Soft', proficiency: 5, yearsOfExperience: 4, endorsed: true, endorsementCount: 32, projects: [], lastUsed: '2024-01' },
  { id: 'skill-38', name: 'Communication', category: 'Soft', proficiency: 5, yearsOfExperience: 8, endorsed: true, endorsementCount: 41, projects: [], lastUsed: '2024-01' },
  { id: 'skill-39', name: 'Problem Solving', category: 'Soft', proficiency: 5, yearsOfExperience: 8, endorsed: true, endorsementCount: 38, projects: [], lastUsed: '2024-01' },
  { id: 'skill-40', name: 'Team Collaboration', category: 'Soft', proficiency: 5, yearsOfExperience: 8, endorsed: true, endorsementCount: 35, projects: [], lastUsed: '2024-01' },
  { id: 'skill-41', name: 'Project Management', category: 'Soft', proficiency: 4, yearsOfExperience: 5, endorsed: true, endorsementCount: 28, projects: [], lastUsed: '2024-01' },
  { id: 'skill-42', name: 'Agile/Scrum', category: 'Soft', proficiency: 5, yearsOfExperience: 6, endorsed: true, endorsementCount: 31, projects: [], lastUsed: '2024-01' },
  { id: 'skill-43', name: 'Mentoring', category: 'Soft', proficiency: 4, yearsOfExperience: 3, endorsed: true, endorsementCount: 19, projects: [], lastUsed: '2023-12' },

  // Languages
  { id: 'skill-44', name: 'English', category: 'Languages', proficiency: 5, yearsOfExperience: 20, endorsed: true, endorsementCount: 42, projects: [], lastUsed: '2024-01' },
  { id: 'skill-45', name: 'Zulu', category: 'Languages', proficiency: 5, yearsOfExperience: 20, endorsed: true, endorsementCount: 15, projects: [], lastUsed: '2024-01' },
  { id: 'skill-46', name: 'Afrikaans', category: 'Languages', proficiency: 3, yearsOfExperience: 10, endorsed: false, endorsementCount: 8, projects: [], lastUsed: '2023-11' },
  { id: 'skill-47', name: 'French', category: 'Languages', proficiency: 2, yearsOfExperience: 2, endorsed: false, endorsementCount: 3, projects: [], lastUsed: '2023-08' }
]

export const MOCK_EXPERIENCE: Experience[] = [
  {
    id: 'exp-1',
    company: 'KaleidoCraft Digital',
    companyLogo: '/logos/kaleidocraft.png',
    position: 'Lead Developer & Founder',
    period: '2020 - Present',
    location: 'Johannesburg, South Africa',
    description: 'Founded and led a digital agency specializing in custom web applications and mobile solutions for enterprise clients.',
    responsibilities: [
      'Lead development team of 12 engineers across multiple projects',
      'Architect scalable solutions using React, Node.js, and cloud technologies',
      'Manage client relationships and project delivery',
      'Establish development best practices and code standards',
      'Mentor junior developers and conduct technical interviews'
    ],
    achievements: [
      'Grew company to $2M ARR in 3 years',
      'Delivered 50+ successful projects',
      'Achieved 98% client satisfaction rate',
      'Built team from 2 to 15 members'
    ],
    technologies: ['React', 'Node.js', 'TypeScript', 'AWS', 'PostgreSQL', 'MongoDB'],
    startDate: '2020-01-01',
    current: true,
    type: 'full-time',
    industry: 'Digital Agency',
    companySize: '11-50'
  },
  {
    id: 'exp-2',
    company: 'Innovation Labs',
    companyLogo: '/logos/innovation.png',
    position: 'Senior Full-Stack Developer',
    period: '2018 - 2020',
    location: 'Cape Town, South Africa',
    description: 'Developed scalable web applications serving 100K+ users. Led a team of 5 developers in agile environment.',
    responsibilities: [
      'Developed and maintained microservices architecture',
      'Led sprint planning and technical implementations',
      'Conducted code reviews and pair programming sessions',
      'Optimized application performance and database queries',
      'Collaborated with product team on feature specifications'
    ],
    achievements: [
      'Reduced API response time by 60%',
      'Implemented CI/CD pipeline reducing deployment time by 75%',
      'Led migration to microservices architecture',
      'Mentored 3 junior developers to mid-level roles'
    ],
    technologies: ['Vue.js', 'Python', 'Django', 'Docker', 'Redis', 'PostgreSQL'],
    startDate: '2018-03-01',
    endDate: '2020-01-01',
    current: false,
    type: 'full-time',
    industry: 'Technology',
    companySize: '51-200'
  },
  {
    id: 'exp-3',
    company: 'TechStart Solutions',
    companyLogo: '/logos/techstart.png',
    position: 'Frontend Developer',
    period: '2016 - 2018',
    location: 'Pretoria, South Africa',
    description: 'Built responsive web interfaces and progressive web apps with focus on performance and accessibility.',
    responsibilities: [
      'Developed responsive user interfaces using modern JavaScript frameworks',
      'Implemented accessibility standards (WCAG 2.1)',
      'Optimized frontend performance and load times',
      'Collaborated with UX designers on interface design',
      'Maintained component libraries and design systems'
    ],
    achievements: [
      'Improved lighthouse scores to 95+',
      'Built reusable component library used across 10+ projects',
      'Reduced bundle size by 40%',
      'Achieved 100% WCAG 2.1 AA compliance'
    ],
    technologies: ['JavaScript', 'HTML5', 'CSS3', 'SASS', 'Webpack', 'jQuery'],
    startDate: '2016-06-01',
    endDate: '2018-03-01',
    current: false,
    type: 'full-time',
    industry: 'Software Development',
    companySize: '11-50'
  },
  {
    id: 'exp-4',
    company: 'Digital Ventures',
    companyLogo: '/logos/digital-ventures.png',
    position: 'Junior Web Developer',
    period: '2015 - 2016',
    location: 'Johannesburg, South Africa',
    description: 'Entry-level position building websites and web applications for small to medium businesses.',
    responsibilities: [
      'Developed custom WordPress themes and plugins',
      'Created responsive landing pages and marketing websites',
      'Fixed bugs and implemented feature requests',
      'Assisted senior developers with larger projects',
      'Maintained client websites and provided support'
    ],
    achievements: [
      'Delivered 20+ websites on time and within budget',
      'Learned React and modern JavaScript frameworks',
      'Received "Rising Star" award for exceptional performance',
      'Built internal tools improving team productivity'
    ],
    technologies: ['HTML', 'CSS', 'JavaScript', 'PHP', 'WordPress', 'MySQL'],
    startDate: '2015-02-01',
    endDate: '2016-06-01',
    current: false,
    type: 'full-time',
    industry: 'Web Development',
    companySize: '1-10'
  },
  {
    id: 'exp-5',
    company: 'Freelance',
    position: 'Freelance Developer',
    period: '2014 - 2015',
    location: 'Remote',
    description: 'Provided freelance web development services to clients worldwide.',
    responsibilities: [
      'Built custom websites for small businesses',
      'Managed client communications and project timelines',
      'Provided hosting and maintenance services',
      'Developed e-commerce solutions',
      'Created responsive mobile-friendly designs'
    ],
    achievements: [
      'Completed 30+ freelance projects',
      'Maintained 5-star rating on Upwork',
      'Generated $50K+ in revenue',
      'Built long-term relationships with 10+ recurring clients'
    ],
    technologies: ['HTML', 'CSS', 'JavaScript', 'Bootstrap', 'WordPress'],
    startDate: '2014-01-01',
    endDate: '2015-02-01',
    current: false,
    type: 'freelance',
    industry: 'Freelance',
    companySize: '1-10'
  },
  {
    id: 'exp-6',
    company: 'Amazon Web Services',
    companyLogo: '/logos/aws.png',
    position: 'Cloud Solutions Consultant',
    period: '2019 - 2020',
    location: 'Remote',
    description: 'Helped enterprise clients migrate to AWS cloud infrastructure and optimize their architectures.',
    responsibilities: [
      'Designed cloud architecture solutions for enterprise clients',
      'Conducted AWS training workshops and webinars',
      'Performed cost optimization audits',
      'Implemented Infrastructure as Code using Terraform',
      'Provided 24/7 technical support for critical systems'
    ],
    achievements: [
      'Helped clients save $500K+ in cloud costs',
      'Achieved AWS Solutions Architect certification',
      'Led 15+ successful cloud migrations',
      'Reduced infrastructure costs by average 35%'
    ],
    technologies: ['AWS', 'Terraform', 'Docker', 'Kubernetes', 'Python'],
    startDate: '2019-06-01',
    endDate: '2020-01-01',
    current: false,
    type: 'contract',
    industry: 'Cloud Computing',
    companySize: '10000+'
  },
  {
    id: 'exp-7',
    company: 'Microsoft',
    companyLogo: '/logos/microsoft.png',
    position: 'Software Engineering Intern',
    period: 'Summer 2014',
    location: 'Johannesburg, South Africa',
    description: 'Internship program working on internal tools and learning enterprise software development.',
    responsibilities: [
      'Developed features for internal productivity tools',
      'Participated in code reviews and team meetings',
      'Wrote unit tests and documentation',
      'Collaborated with cross-functional teams',
      'Learned enterprise development best practices'
    ],
    achievements: [
      'Completed 3 major feature implementations',
      'Received offer for full-time position',
      'Contributed to open-source .NET projects',
      'Presented final project to senior leadership'
    ],
    technologies: ['C#', '.NET', 'ASP.NET', 'SQL Server', 'Azure'],
    startDate: '2014-06-01',
    endDate: '2014-08-31',
    current: false,
    type: 'part-time',
    industry: 'Technology',
    companySize: '10000+'
  },
  {
    id: 'exp-8',
    company: 'Shopify',
    companyLogo: '/logos/shopify.png',
    position: 'E-Commerce Developer',
    period: '2017 - 2018',
    location: 'Remote',
    description: 'Specialized in building custom Shopify themes and apps for e-commerce businesses.',
    responsibilities: [
      'Developed custom Shopify themes using Liquid',
      'Built Shopify apps using Node.js and React',
      'Integrated third-party services and APIs',
      'Optimized store performance and conversion rates',
      'Provided technical support to merchants'
    ],
    achievements: [
      'Built 25+ custom Shopify stores',
      'Increased average conversion rate by 30%',
      'Developed popular Shopify app with 500+ installations',
      'Achieved Shopify Expert certification'
    ],
    technologies: ['Liquid', 'JavaScript', 'React', 'Node.js', 'Shopify API'],
    startDate: '2017-03-01',
    endDate: '2018-02-28',
    current: false,
    type: 'contract',
    industry: 'E-Commerce',
    companySize: '1000-5000'
  },
  {
    id: 'exp-9',
    company: 'Google',
    companyLogo: '/logos/google.png',
    position: 'Developer Advocate',
    period: '2021 - 2022',
    location: 'Remote',
    description: 'Promoted Google Cloud technologies through content creation, speaking, and community engagement.',
    responsibilities: [
      'Created technical content (blogs, videos, tutorials)',
      'Spoke at conferences and meetups',
      'Built demo applications and code samples',
      'Engaged with developer communities',
      'Provided feedback to product teams'
    ],
    achievements: [
      'Published 50+ technical articles',
      'Spoke at 20+ conferences worldwide',
      'Built 30+ open-source demos',
      'Grew developer community by 10K+ members'
    ],
    technologies: ['Google Cloud', 'Node.js', 'Python', 'Kubernetes', 'Firebase'],
    startDate: '2021-01-01',
    endDate: '2022-01-01',
    current: false,
    type: 'full-time',
    industry: 'Cloud Computing',
    companySize: '10000+'
  },
  {
    id: 'exp-10',
    company: 'Meta',
    companyLogo: '/logos/meta.png',
    position: 'React Developer',
    period: '2022 - 2023',
    location: 'Remote',
    description: 'Contributed to React and React Native core libraries and tooling.',
    responsibilities: [
      'Fixed bugs in React core library',
      'Implemented new React features',
      'Improved React DevTools',
      'Wrote RFC proposals for React changes',
      'Reviewed community pull requests'
    ],
    achievements: [
      'Contributed 50+ commits to React core',
      'Improved React performance by 15%',
      'Mentored open-source contributors',
      'Presented at React Conf 2023'
    ],
    technologies: ['React', 'JavaScript', 'TypeScript', 'Jest', 'Flow'],
    startDate: '2022-02-01',
    endDate: '2023-06-01',
    current: false,
    type: 'contract',
    industry: 'Social Media',
    companySize: '10000+'
  }
]

export const MOCK_EDUCATION: Education[] = [
  {
    id: 'edu-1',
    institution: 'University of the Witwatersrand',
    institutionLogo: '/logos/wits.png',
    degree: 'Bachelor of Science in Computer Science',
    field: 'Computer Science',
    period: '2012 - 2015',
    location: 'Johannesburg, South Africa',
    achievements: ['Cum Laude', "Dean's List 2014-2015", 'Academic Excellence Award'],
    gpa: '3.8',
    startDate: '2012-01-01',
    endDate: '2015-12-01',
    current: false,
    honors: ['Cum Laude', "Dean's List"],
    coursework: [
      'Data Structures & Algorithms',
      'Database Systems',
      'Software Engineering',
      'Web Development',
      'Computer Networks',
      'Operating Systems'
    ],
    thesis: 'Machine Learning Approaches for Predictive Analytics in E-Commerce'
  },
  {
    id: 'edu-2',
    institution: 'Stanford University',
    institutionLogo: '/logos/stanford.png',
    degree: 'Master of Science in Computer Science',
    field: 'Artificial Intelligence',
    period: '2019 - 2021',
    location: 'Stanford, CA (Online)',
    achievements: ['Graduate with Distinction', 'Research Publication in AI Journal'],
    gpa: '3.9',
    startDate: '2019-09-01',
    endDate: '2021-06-01',
    current: false,
    honors: ['Graduate with Distinction'],
    coursework: [
      'Machine Learning',
      'Deep Learning',
      'Natural Language Processing',
      'Computer Vision',
      'Reinforcement Learning',
      'AI Ethics'
    ],
    thesis: 'Deep Learning Models for Real-Time Object Detection in Autonomous Vehicles'
  },
  {
    id: 'edu-3',
    institution: 'MIT',
    institutionLogo: '/logos/mit.png',
    degree: 'Professional Certificate in Full Stack Development',
    field: 'Software Engineering',
    period: '2018',
    location: 'Cambridge, MA (Online)',
    achievements: ['Top 5% of Class', 'Capstone Project Excellence Award'],
    startDate: '2018-01-01',
    endDate: '2018-12-01',
    current: false,
    coursework: [
      'Advanced JavaScript',
      'React & Redux',
      'Node.js & Express',
      'MongoDB',
      'DevOps & Deployment',
      'Testing & Security'
    ]
  },
  {
    id: 'edu-4',
    institution: 'Harvard Business School Online',
    institutionLogo: '/logos/harvard.png',
    degree: 'Certificate in Business Analytics',
    field: 'Business Analytics',
    period: '2020',
    location: 'Online',
    achievements: ['High Honors'],
    startDate: '2020-01-01',
    endDate: '2020-06-01',
    current: false,
    coursework: [
      'Data Analytics',
      'Business Intelligence',
      'Financial Modeling',
      'Strategic Decision Making'
    ]
  },
  {
    id: 'edu-5',
    institution: 'University of Cape Town',
    institutionLogo: '/logos/uct.png',
    degree: 'Professional Development in UX/UI Design',
    field: 'User Experience Design',
    period: '2017',
    location: 'Cape Town, South Africa',
    achievements: ['Certificate of Excellence'],
    startDate: '2017-03-01',
    endDate: '2017-09-01',
    current: false,
    coursework: [
      'User Research',
      'Interaction Design',
      'Visual Design',
      'Prototyping',
      'Usability Testing',
      'Design Systems'
    ]
  }
]

export const MOCK_CERTIFICATIONS: Certification[] = [
  {
    id: 'cert-1',
    title: 'AWS Certified Solutions Architect - Professional',
    issuer: 'Amazon Web Services',
    issuerLogo: '/logos/aws.png',
    date: '2023-06-15',
    expiryDate: '2026-06-15',
    credentialId: 'AWS-PSA-123456',
    credentialUrl: 'https://aws.amazon.com/verification',
    description: 'Advanced AWS certification demonstrating expertise in designing distributed applications and systems on AWS',
    skills: ['AWS', 'Cloud Architecture', 'DevOps', 'Security'],
    verified: true
  },
  {
    id: 'cert-2',
    title: 'Google Cloud Professional Cloud Architect',
    issuer: 'Google Cloud',
    issuerLogo: '/logos/google.png',
    date: '2023-03-20',
    expiryDate: '2025-03-20',
    credentialId: 'GCP-PCA-789012',
    credentialUrl: 'https://cloud.google.com/certification',
    description: 'Professional certification for designing, developing, and managing robust, secure, scalable cloud solutions',
    skills: ['Google Cloud', 'Cloud Architecture', 'Kubernetes'],
    verified: true
  },
  {
    id: 'cert-3',
    title: 'Certified Kubernetes Administrator (CKA)',
    issuer: 'Cloud Native Computing Foundation',
    issuerLogo: '/logos/cncf.png',
    date: '2023-01-10',
    expiryDate: '2026-01-10',
    credentialId: 'CKA-345678',
    credentialUrl: 'https://cncf.io/certification/cka',
    description: 'Certification demonstrating skills in Kubernetes administration',
    skills: ['Kubernetes', 'Docker', 'DevOps'],
    verified: true
  },
  {
    id: 'cert-4',
    title: 'Meta Certified React Developer',
    issuer: 'Meta',
    issuerLogo: '/logos/meta.png',
    date: '2022-11-05',
    credentialId: 'META-REACT-901234',
    credentialUrl: 'https://developers.facebook.com/certification',
    description: 'Official Meta certification for React development expertise',
    skills: ['React', 'JavaScript', 'Frontend Development'],
    verified: true
  },
  {
    id: 'cert-5',
    title: 'MongoDB Certified Developer Associate',
    issuer: 'MongoDB University',
    issuerLogo: '/logos/mongodb.png',
    date: '2022-09-15',
    expiryDate: '2025-09-15',
    credentialId: 'MONGO-DEV-567890',
    credentialUrl: 'https://university.mongodb.com/certification',
    description: 'Certification in MongoDB database development and administration',
    skills: ['MongoDB', 'Database Design', 'NoSQL'],
    verified: true
  },
  {
    id: 'cert-6',
    title: 'Certified Scrum Master (CSM)',
    issuer: 'Scrum Alliance',
    issuerLogo: '/logos/scrum.png',
    date: '2021-07-20',
    expiryDate: '2025-07-20',
    credentialId: 'CSM-123789',
    credentialUrl: 'https://scrumalliance.org/get-certified',
    description: 'Professional certification in Scrum framework and agile methodologies',
    skills: ['Scrum', 'Agile', 'Project Management'],
    verified: true
  },
  {
    id: 'cert-7',
    title: 'TensorFlow Developer Certificate',
    issuer: 'Google',
    issuerLogo: '/logos/google.png',
    date: '2023-08-10',
    credentialId: 'TF-DEV-456123',
    credentialUrl: 'https://tensorflow.org/certificate',
    description: 'Certification demonstrating proficiency in using TensorFlow for machine learning',
    skills: ['TensorFlow', 'Machine Learning', 'Python'],
    verified: true
  },
  {
    id: 'cert-8',
    title: 'Azure Solutions Architect Expert',
    issuer: 'Microsoft',
    issuerLogo: '/logos/microsoft.png',
    date: '2023-04-12',
    expiryDate: '2025-04-12',
    credentialId: 'AZ-SAE-789456',
    credentialUrl: 'https://learn.microsoft.com/certifications',
    description: 'Expert-level Azure certification for designing cloud solutions',
    skills: ['Azure', 'Cloud Architecture', 'DevOps'],
    verified: true
  },
  {
    id: 'cert-9',
    title: 'Stripe Certified Developer',
    issuer: 'Stripe',
    issuerLogo: '/logos/stripe.png',
    date: '2022-12-05',
    credentialId: 'STRIPE-DEV-321654',
    credentialUrl: 'https://stripe.com/certification',
    description: 'Certification in payment processing integration and Stripe API',
    skills: ['Stripe', 'Payment Processing', 'API Integration'],
    verified: true
  },
  {
    id: 'cert-10',
    title: 'Certified Ethical Hacker (CEH)',
    issuer: 'EC-Council',
    issuerLogo: '/logos/eccouncil.png',
    date: '2022-05-18',
    expiryDate: '2025-05-18',
    credentialId: 'CEH-654987',
    credentialUrl: 'https://eccouncil.org/programs/certified-ethical-hacker-ceh',
    description: 'Certification in ethical hacking and penetration testing',
    skills: ['Cybersecurity', 'Penetration Testing', 'Security'],
    verified: true
  }
]

export const MOCK_TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-1',
    author: 'Sarah Johnson',
    authorTitle: 'CTO',
    authorCompany: 'TechCorp Inc.',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    content: 'Exceptional developer who consistently delivers high-quality work. Led our platform redesign that increased user engagement by 150%. Highly recommended!',
    rating: 5,
    date: '2023-11-15',
    relationship: 'client',
    featured: true
  },
  {
    id: 'test-2',
    author: 'Michael Chen',
    authorTitle: 'Product Manager',
    authorCompany: 'Innovation Labs',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    content: 'One of the best developers I\'ve worked with. Great communication, technical expertise, and ability to solve complex problems. A true professional.',
    rating: 5,
    date: '2023-09-20',
    relationship: 'colleague',
    featured: true
  },
  {
    id: 'test-3',
    author: 'Emily Rodriguez',
    authorTitle: 'Senior Developer',
    authorCompany: 'Digital Solutions',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    content: 'Amazing mentor and team player. Always willing to help and share knowledge. Code quality is consistently excellent.',
    rating: 5,
    date: '2023-08-10',
    relationship: 'colleague',
    featured: false
  },
  {
    id: 'test-4',
    author: 'David Williams',
    authorTitle: 'CEO',
    authorCompany: 'StartupXYZ',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    content: 'Transformed our entire tech stack and brought our product to market 2 months ahead of schedule. Invaluable asset to our team.',
    rating: 5,
    date: '2023-07-05',
    relationship: 'client',
    featured: true
  },
  {
    id: 'test-5',
    author: 'Lisa Anderson',
    authorTitle: 'VP of Engineering',
    authorCompany: 'MegaCorp',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
    content: 'Outstanding technical skills combined with excellent leadership abilities. Successfully led our team through a critical system migration.',
    rating: 5,
    date: '2023-06-12',
    relationship: 'manager',
    featured: false
  }
]

// ==================== HELPER FUNCTIONS ====================

// Project Helpers
export function sortProjectsByDate(projects: Project[]): Project[] {
  return [...projects].sort((a, b) =>
    new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
  )
}

export function sortProjectsByViews(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => b.views - a.views)
}

export function sortProjectsByLikes(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => b.likes - a.likes)
}

export function sortProjectsByOrder(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => a.order - b.order)
}

export function filterProjectsByStatus(projects: Project[], status: Project['status']): Project[] {
  return projects.filter(p => p.status === status)
}

export function filterProjectsByCategory(projects: Project[], category: string): Project[] {
  return projects.filter(p => p.category === category)
}

export function getFeaturedProjects(projects: Project[]): Project[] {
  return projects.filter(p => p.featured)
}

export function getPublishedProjects(projects: Project[]): Project[] {
  return filterProjectsByStatus(projects, 'published')
}

export function getProjectCategories(projects: Project[]): string[] {
  return Array.from(new Set(projects.map(p => p.category)))
}

export function searchProjects(projects: Project[], query: string): Project[] {
  const lowerQuery = query.toLowerCase()
  return projects.filter(p =>
    p.title.toLowerCase().includes(lowerQuery) ||
    p.description.toLowerCase().includes(lowerQuery) ||
    p.technologies.some(t => t.toLowerCase().includes(lowerQuery)) ||
    p.category.toLowerCase().includes(lowerQuery)
  )
}

// Skill Helpers
export function getSkillsByCategory(skills: Skill[], category: Skill['category']): Skill[] {
  return skills.filter(s => s.category === category)
}

export function getTopSkills(skills: Skill[], limit: number = 10): Skill[] {
  return [...skills]
    .sort((a, b) => b.proficiency - a.proficiency || b.yearsOfExperience - a.yearsOfExperience)
    .slice(0, limit)
}

export function getEndorsedSkills(skills: Skill[]): Skill[] {
  return skills.filter(s => s.endorsed)
}

export function getTrendingSkills(skills: Skill[]): Skill[] {
  return skills.filter(s => s.trending)
}

export function sortSkillsByProficiency(skills: Skill[]): Skill[] {
  return [...skills].sort((a, b) => b.proficiency - a.proficiency)
}

export function sortSkillsByEndorsements(skills: Skill[]): Skill[] {
  return [...skills].sort((a, b) => b.endorsementCount - a.endorsementCount)
}

export function getSkillsForProject(skills: Skill[], projectId: string): Skill[] {
  return skills.filter(s => s.projects.includes(projectId))
}

// Experience Helpers
export function calculateTotalExperience(experiences: Experience[]): number {
  const totalMonths = experiences.reduce((total, exp) => {
    const start = new Date(exp.startDate)
    const end = exp.current ? new Date() : new Date(exp.endDate!)
    return total + differenceInMonths(end, start)
  }, 0)

  return Math.floor(totalMonths / 12)
}

export function getCurrentEmployment(experiences: Experience[]): Experience | null {
  return experiences.find(e => e.current) || null
}

export function sortExperiencesByDate(experiences: Experience[]): Experience[] {
  return [...experiences].sort((a, b) => {
    // Current jobs first
    if (a.current && !b.current) return -1
    if (!a.current && b.current) return 1

    // Then by start date descending
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  })
}

export function getExperienceByType(experiences: Experience[], type: Experience['type']): Experience[] {
  return experiences.filter(e => e.type === type)
}

export function getExperienceDuration(experience: Experience): string {
  const start = new Date(experience.startDate)
  const end = experience.current ? new Date() : new Date(experience.endDate!)
  const months = differenceInMonths(end, start)
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12

  if (years === 0) return `${months} month${months !== 1 ? 's' : ''}`
  if (remainingMonths === 0) return `${years} year${years !== 1 ? 's' : ''}`
  return `${years} year${years !== 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`
}

// Education Helpers
export function sortEducationByDate(education: Education[]): Education[] {
  return [...education].sort((a, b) => {
    // Current education first
    if (a.current && !b.current) return -1
    if (!a.current && b.current) return 1

    // Then by start date descending
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  })
}

export function getHighestDegree(education: Education[]): Education | null {
  const degreeRank: Record<string, number> = {
    'phd': 5,
    'doctorate': 5,
    'master': 4,
    'bachelor': 3,
    'associate': 2,
    'certificate': 1
  }

  return education.reduce((highest, current) => {
    const currentRank = Object.keys(degreeRank).find(key =>
      current.degree.toLowerCase().includes(key)
    )
    const highestRank = highest ? Object.keys(degreeRank).find(key =>
      highest.degree.toLowerCase().includes(key)
    ) : null

    if (!currentRank) return highest
    if (!highest || !highestRank) return current

    return degreeRank[currentRank] > degreeRank[highestRank] ? current : highest
  }, null as Education | null)
}

// Certification Helpers
export function getActiveCertifications(certifications: Certification[]): Certification[] {
  const now = new Date()
  return certifications.filter(c =>
    !c.expiryDate || new Date(c.expiryDate) > now
  )
}

export function getExpiredCertifications(certifications: Certification[]): Certification[] {
  const now = new Date()
  return certifications.filter(c =>
    c.expiryDate && new Date(c.expiryDate) <= now
  )
}

export function sortCertificationsByDate(certifications: Certification[]): Certification[] {
  return [...certifications].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

export function getVerifiedCertifications(certifications: Certification[]): Certification[] {
  return certifications.filter(c => c.verified)
}

// Portfolio Helpers
export function calculateCompletenessScore(portfolio: Partial<Portfolio>): number {
  let score = 0
  const maxScore = 100

  // Profile (20%)
  if (portfolio.bio && portfolio.bio.length >= 100) score += 10
  if (portfolio.avatar) score += 5
  if (portfolio.coverImage) score += 5

  // Experience (25%)
  if (portfolio.experience && portfolio.experience.length >= 1) score += 10
  if (portfolio.experience && portfolio.experience.length >= 3) score += 10
  if (portfolio.experience?.some(e => e.achievements.length > 0)) score += 5

  // Education (15%)
  if (portfolio.education && portfolio.education.length >= 1) score += 10
  if (portfolio.education?.some(e => e.achievements.length > 0)) score += 5

  // Skills (15%)
  if (portfolio.skills && portfolio.skills.length >= 5) score += 8
  if (portfolio.skills && portfolio.skills.length >= 10) score += 7

  // Projects (15%)
  if (portfolio.projects && portfolio.projects.length >= 1) score += 8
  if (portfolio.projects && portfolio.projects.length >= 3) score += 7

  // Certifications (10%)
  if (portfolio.certifications && portfolio.certifications.length >= 1) score += 5
  if (portfolio.certifications && portfolio.certifications.length >= 3) score += 5

  return Math.min(score, maxScore)
}

export function generatePublicUrl(userId: string, customDomain?: string): string {
  if (customDomain) {
    return `https://${customDomain}`
  }
  return `${window.location.origin}/portfolio/${userId}`
}

export function generateShareText(portfolio: Portfolio): string {
  return `Check out my professional portfolio: ${portfolio.title} - ${portfolio.subtitle}`
}

// Validation
export function validateProject(project: Partial<Project>): boolean {
  return !!(
    project.title &&
    project.description &&
    project.technologies &&
    project.technologies.length > 0 &&
    project.category
  )
}

export function validateSkill(skill: Partial<Skill>): boolean {
  return !!(
    skill.name &&
    skill.category &&
    skill.proficiency &&
    skill.proficiency >= 1 &&
    skill.proficiency <= 5
  )
}

export function validateExperience(experience: Partial<Experience>): boolean {
  return !!(
    experience.company &&
    experience.position &&
    experience.startDate &&
    experience.location
  )
}

export function validateEducation(education: Partial<Education>): boolean {
  return !!(
    education.institution &&
    education.degree &&
    education.field &&
    education.startDate
  )
}

// Export/Import
export function exportToJSON(portfolio: Portfolio): string {
  return JSON.stringify(portfolio, null, 2)
}

export function exportToCSV(portfolio: Portfolio): string {
  // Simple CSV export of key data
  let csv = 'Type,Title,Description,Date\n'

  portfolio.projects.forEach(p => {
    csv += `Project,"${p.title}","${p.description}",${p.dateAdded}\n`
  })

  portfolio.experience.forEach(e => {
    csv += `Experience,"${e.position} at ${e.company}","${e.description}",${e.startDate}\n`
  })

  portfolio.education.forEach(e => {
    csv += `Education,"${e.degree}","${e.institution}",${e.startDate}\n`
  })

  return csv
}

export async function exportToPDF(portfolio: Portfolio): Promise<Blob> {
  // In production, this would use a library like jsPDF or call an API
  // For now, return a mock blob
  const htmlContent = `
    <html>
      <head><title>${portfolio.title}</title></head>
      <body>
        <h1>${portfolio.title}</h1>
        <h2>${portfolio.subtitle}</h2>
        <p>${portfolio.bio}</p>
        <!-- More content would go here -->
      </body>
    </html>
  `

  return new Blob([htmlContent], { type: 'application/pdf' })
}

// Analytics
export function calculateAnalyticsSummary(analytics: PortfolioAnalytics) {
  return {
    totalEngagement: analytics.views + analytics.projectViews + analytics.contactClicks + analytics.socialClicks,
    averageTimeFormatted: formatDuration(analytics.avgTimeOnPage),
    topPerformingProjects: analytics.topProjects.slice(0, 5),
    topUsedSkills: analytics.topSkills.slice(0, 5),
    totalDownloads: analytics.cvDownloads,
    shareRate: analytics.views > 0 ? (analytics.shareCount / analytics.views * 100).toFixed(1) : '0'
  }
}

// Formatting
export function formatDate(date: string): string {
  return format(new Date(date), 'MMM yyyy')
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds}s`
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

// Search & Filter
export function filterPortfolioByKeyword(portfolio: Portfolio, keyword: string): {
  projects: Project[]
  skills: Skill[]
  experience: Experience[]
} {
  const lowerKeyword = keyword.toLowerCase()

  return {
    projects: portfolio.projects.filter(p =>
      p.title.toLowerCase().includes(lowerKeyword) ||
      p.description.toLowerCase().includes(lowerKeyword) ||
      p.technologies.some(t => t.toLowerCase().includes(lowerKeyword))
    ),
    skills: portfolio.skills.filter(s =>
      s.name.toLowerCase().includes(lowerKeyword)
    ),
    experience: portfolio.experience.filter(e =>
      e.company.toLowerCase().includes(lowerKeyword) ||
      e.position.toLowerCase().includes(lowerKeyword) ||
      e.description.toLowerCase().includes(lowerKeyword)
    )
  }
}
