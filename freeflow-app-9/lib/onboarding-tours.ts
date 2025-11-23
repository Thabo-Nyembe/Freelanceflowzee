import { OnboardingTour } from '@/components/onboarding/onboarding-tour'

// ============================================================================
// PREDEFINED ONBOARDING TOURS - USER MANUAL SPEC
// ============================================================================

export const onboardingTours: Record<string, OnboardingTour> = {
  quickStart: {
    id: 'quick-start',
    title: 'Welcome to KAZI! 🎉',
    description: 'Get started with the essentials in just 5 minutes',
    targetRole: 'both',
    steps: [
      {
        id: 'welcome',
        title: 'Welcome to Your Dashboard',
        description: 'This is your central hub where you can see all your metrics at a glance. Track your projects, earnings, and recent activity all in one place.',
        position: 'center'
      },
      {
        id: 'projects-hub',
        title: 'Projects Hub - Your Project Command Center',
        description: 'Manage all your projects here. Create new projects, track progress, manage deadlines, and collaborate with clients. This is where all your work lives.',
        action: 'Click on "Projects Hub" in the navigation to explore',
        position: 'center'
      },
      {
        id: 'ai-create',
        title: 'AI Create - Your Creative Assistant',
        description: 'Generate content with AI assistance. Choose from multiple AI models including Google AI, OpenAI, and Anthropic. Perfect for content creation, coding, and creative writing.',
        action: 'Try creating your first AI-generated content',
        position: 'center'
      },
      {
        id: 'files-hub',
        title: 'Files Hub - Intelligent Storage',
        description: 'Manage your files with our multi-cloud storage system. Get 70-80% cost savings with intelligent routing between Supabase (fast access) and Wasabi S3 (cost-effective archives).',
        position: 'center'
      },
      {
        id: 'complete',
        title: 'You\'re All Set! 🚀',
        description: 'You\'ve completed the quick start tour! Explore other features like Video Studio, Escrow System, and our AI-powered collaboration tools. Check out the other guided tours for deeper dives into specific features.',
        position: 'center'
      }
    ],
    completionReward: {
      type: 'badge',
      value: 'Quick Start Champion',
      description: 'You\'ve completed the KAZI quick start tour!'
    }
  },

  escrowGuide: {
    id: 'escrow-guide',
    title: 'Escrow System Masterclass',
    description: 'Learn how to protect your payments and build client trust',
    targetRole: 'both',
    steps: [
      {
        id: 'intro',
        title: 'Secure Payments with Escrow',
        description: 'Escrow is a secure payment system where client funds are held safely until project milestones are completed. This protects both freelancers and clients, ensuring fair payment for quality work.',
        position: 'center'
      },
      {
        id: 'benefits',
        title: 'Why Use Escrow?',
        description: 'For Freelancers: Guaranteed payment security, professional credibility, clear payment terms, and dispute protection. For Clients: Work quality assurance, milestone-based releases, refund protection, and professional service guarantee.',
        position: 'center'
      },
      {
        id: 'create',
        title: 'Creating an Escrow Project',
        description: 'When creating a new project, enable "Escrow Protection" and set up your milestone structure. Break your project into clear phases with completion criteria and payment percentages.',
        action: 'Navigate to Projects Hub and create a project with escrow enabled',
        position: 'center'
      },
      {
        id: 'milestones',
        title: 'Define Payment Milestones',
        description: 'Set up milestones for your project. Each milestone should have clear deliverables, a payment amount, and review criteria. Funds are released automatically upon client approval.',
        position: 'center'
      },
      {
        id: 'trust',
        title: 'Building Trust',
        description: 'We\'ve successfully processed 1,247+ escrow releases this month with 100% money-back guarantee and bank-level security. Your funds and work are protected!',
        position: 'center'
      }
    ],
    completionReward: {
      type: 'badge',
      value: 'Escrow Expert',
      description: 'You\'re now an escrow master! +40% trust score boost'
    }
  },

  videoStudioTour: {
    id: 'video-studio-tour',
    title: 'Video Studio Pro Guide',
    description: 'Master professional video editing and collaboration',
    targetRole: 'both',
    steps: [
      {
        id: 'recording',
        title: 'Professional Recording System',
        description: 'Record screen, webcam, or both with AI enhancements. Choose video quality, audio input, and enable features like built-in teleprompter and automatic lighting correction.',
        position: 'center'
      },
      {
        id: 'editing',
        title: 'AI-Powered Editing',
        description: 'Edit with auto-transcription for captions, smart chapters that divide content automatically, highlight detection for engaging moments, and voice enhancement for crystal-clear audio.',
        position: 'center'
      },
      {
        id: 'collaboration',
        title: 'Collaborative Review',
        description: 'Share videos with clients for review. They can add timestamp-specific comments, approve versions, and compare different edits. This speeds up the approval process by 40%!',
        action: 'Try sharing a video for collaborative review',
        position: 'center'
      },
      {
        id: 'export',
        title: 'Export & Share',
        description: 'Export in multiple formats and quality settings. Share directly to client galleries or generate secure download links with password protection and expiry dates.',
        position: 'center'
      }
    ],
    completionReward: {
      type: 'badge',
      value: 'Video Pro',
      description: 'You\'re ready to create professional videos!'
    }
  },

  projectManagement: {
    id: 'project-management',
    title: 'Project Management Excellence',
    description: 'Learn to manage projects like a pro',
    targetRole: 'both',
    steps: [
      {
        id: 'wizard',
        title: '3-Step Project Creation Wizard',
        description: 'Create projects efficiently with our guided 3-step wizard. Step 1: Project Details (title, client, budget, timeline). Step 2: Project Setup (team, files, milestones). Step 3: Review & Create.',
        position: 'center'
      },
      {
        id: 'status',
        title: 'Project Status Tracking',
        description: 'Track projects through 5 statuses: Draft (planning), Active (in progress), Paused (temporarily stopped), Completed (finished), Cancelled (terminated). Update progress percentages and log time spent.',
        position: 'center'
      },
      {
        id: 'collaboration',
        title: 'Team Collaboration',
        description: 'Add team members, share files, leave comments, and use real-time collaboration features. See other users\' cursors and edits in real-time with our multi-user editing system.',
        position: 'center'
      },
      {
        id: 'files',
        title: 'File Management',
        description: 'Upload files, create folders, use version control, and share with clients using password-protected links or time-limited downloads. All files are backed up redundantly.',
        position: 'center'
      }
    ],
    completionReward: {
      type: 'badge',
      value: 'Project Master',
      description: 'You can now manage projects with confidence!'
    }
  },

  financialMastery: {
    id: 'financial-mastery',
    title: 'Financial Management Masterclass',
    description: 'Master invoicing, analytics, and business insights',
    targetRole: 'freelancer',
    steps: [
      {
        id: 'invoicing',
        title: 'Professional Invoice Templates',
        description: 'Customize invoices with your logo, brand colors, header/footer text, and choose from 4 professional layouts (Modern, Classic, Minimal, Professional). Configure tax calculation and payment methods.',
        position: 'center'
      },
      {
        id: 'analytics',
        title: 'Revenue Tracking & Analytics',
        description: 'View monthly and yearly revenue reports, track project profitability, analyze client payment history, and see cash flow projections. Understand your business with data-driven insights.',
        position: 'center'
      },
      {
        id: 'insights',
        title: 'Business Insights Dashboard',
        description: 'Discover your top-performing services, client retention rates, average project values, and seasonal trends. Make informed decisions with quarterly performance analysis and growth rate tracking.',
        position: 'center'
      },
      {
        id: 'optimization',
        title: 'Financial Optimization',
        description: 'Our AI analyzes your financial data to suggest pricing strategies, identify profitable services, and forecast future cash flow. Get 18-month runway projections based on current burn rate.',
        position: 'center'
      }
    ],
    completionReward: {
      type: 'badge',
      value: 'Financial Guru',
      description: 'You\'re a financial management expert! +25% pricing confidence'
    }
  },

  aiFeatures: {
    id: 'ai-features',
    title: 'AI-Powered Features Tour',
    description: 'Unlock the full power of AI on KAZI',
    targetRole: 'both',
    steps: [
      {
        id: 'my-day',
        title: 'AI Daily Planning',
        description: 'Get personalized daily schedules based on your work patterns. AI analyzes your peak hours (e.g., 9-11 AM with 95% efficiency), task patterns, and energy levels to optimize your productivity.',
        position: 'center'
      },
      {
        id: 'feedback',
        title: 'AI Feedback Analysis',
        description: 'Automatically categorize client feedback by theme (Design, Performance, UX, Content, Features), identify priority issues, and get AI-generated implementation roadmaps with time estimates. Saves 10-15 hours per project!',
        position: 'center'
      },
      {
        id: 'content',
        title: 'AI Content Generation',
        description: 'Generate text, code, creative writing, and business documents with multiple AI models. Use templates, save successful prompts, and access advanced features like voice input and streaming responses.',
        position: 'center'
      },
      {
        id: 'assistant',
        title: 'AI Assistant',
        description: 'Ask questions about your projects, get optimization strategies, receive industry insights, and get help with content creation. Your AI assistant learns your preferences and provides personalized productivity tips.',
        position: 'center'
      }
    ],
    completionReward: {
      type: 'unlock',
      value: 'Advanced AI Features',
      description: 'Unlocked: Priority AI processing and extended context windows!'
    }
  }
}

// Helper function to get tour by ID
export function getTour(tourId: string): OnboardingTour | undefined {
  return onboardingTours[tourId]
}

// Helper function to get all available tours
export function getAllTours(): OnboardingTour[] {
  return Object.values(onboardingTours)
}

// Helper function to get tours by role
export function getToursByRole(role: 'freelancer' | 'client' | 'both'): OnboardingTour[] {
  return getAllTours().filter(tour => tour.targetRole === role || tour.targetRole === 'both')
}
