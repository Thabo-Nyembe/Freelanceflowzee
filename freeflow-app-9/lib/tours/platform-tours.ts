/**
 * Platform Tours Configuration
 * Comprehensive guided tours for all major platform features
 */

import { Tour } from '@/components/onboarding/tour-manager'

export const platformTours: Tour[] = [
  // ==========================================
  // GETTING STARTED TOURS
  // ==========================================
  {
    id: 'dashboard-overview',
    name: 'Dashboard Overview',
    description: 'Get familiar with your KAZI dashboard and main navigation',
    category: 'getting-started',
    difficulty: 'beginner',
    estimatedTime: 3,
    steps: [
      {
        id: 'welcome',
        title: 'Welcome to KAZI!',
        description: 'Let\'s take a quick tour of your dashboard and explore the key features that will help you manage your creative projects.',
        element: '[data-tour="dashboard-main"]',
        position: 'center',
        content: {
          tip: 'You can skip or pause this tour at any time using the controls below.'
        }
      },
      {
        id: 'sidebar-nav',
        title: 'Main Navigation',
        description: 'Access all platform features from the sidebar. Your most-used pages are highlighted for quick access.',
        element: '[data-tour="sidebar-nav"]',
        position: 'right',
        highlightPadding: 16
      },
      {
        id: 'my-day',
        title: 'My Day - Your Command Center',
        description: 'View your tasks, schedule, and priorities all in one place. Stay organized with drag-and-drop task management.',
        element: '[data-tour="nav-my-day"]',
        position: 'right'
      },
      {
        id: 'projects-hub',
        title: 'Projects Hub',
        description: 'Manage all your creative projects here. Track progress, collaborate with teams, and deliver on time.',
        element: '[data-tour="nav-projects"]',
        position: 'right'
      },
      {
        id: 'video-studio',
        title: 'Video Studio',
        description: 'Record, edit, and enhance videos with professional tools including teleprompter and annotations.',
        element: '[data-tour="nav-video-studio"]',
        position: 'right'
      },
      {
        id: 'ai-tools',
        title: 'AI-Powered Features',
        description: 'Leverage AI for design creation, assistance, and automation throughout the platform.',
        element: '[data-tour="nav-ai-create"]',
        position: 'right'
      },
      {
        id: 'profile-menu',
        title: 'Your Profile & Settings',
        description: 'Access your profile, settings, notifications, and account preferences from here.',
        element: '[data-tour="user-menu"]',
        position: 'bottom',
        highlightPadding: 8
      }
    ]
  },

  // ==========================================
  // VIDEO STUDIO TOUR
  // ==========================================
  {
    id: 'video-studio-complete',
    name: 'Video Studio Mastery',
    description: 'Learn to record, edit, and enhance professional videos',
    category: 'feature',
    difficulty: 'intermediate',
    estimatedTime: 5,
    steps: [
      {
        id: 'studio-overview',
        title: 'Video Studio Overview',
        description: 'Create professional videos with recording, editing, and AI-powered enhancement tools.',
        element: '[data-tour="video-studio-main"]',
        position: 'center'
      },
      {
        id: 'record-button',
        title: 'Start Recording',
        description: 'Click here to begin recording your video. Choose from camera, screen, or both.',
        element: '[data-tour="video-record-btn"]',
        position: 'bottom',
        highlightPadding: 12
      },
      {
        id: 'teleprompter',
        title: 'Professional Teleprompter',
        description: 'Use the teleprompter to read your script smoothly while recording. Adjust speed, font size, and positioning.',
        element: '[data-tour="video-teleprompter-btn"]',
        position: 'bottom',
        content: {
          tip: 'Pro tip: Adjust scroll speed to match your speaking pace for natural delivery.'
        }
      },
      {
        id: 'annotations',
        title: 'Real-time Annotations',
        description: 'Draw, highlight, and add text annotations to your videos. Perfect for tutorials and presentations.',
        element: '[data-tour="video-annotate-btn"]',
        position: 'bottom',
        content: {
          tip: 'Use arrows and shapes to highlight key areas while recording.'
        }
      },
      {
        id: 'ai-enhancement',
        title: 'AI Video Enhancement',
        description: 'Enhance video quality, remove background noise, and apply professional effects automatically.',
        element: '[data-tour="video-ai-tools-btn"]',
        position: 'bottom'
      },
      {
        id: 'recordings-library',
        title: 'Recordings Library',
        description: 'Access all your recorded videos here. Edit, share, or export to various formats.',
        element: '[data-tour="video-recordings"]',
        position: 'top'
      }
    ]
  },

  // ==========================================
  // COMMUNITY HUB TOUR
  // ==========================================
  {
    id: 'community-hub-tour',
    name: 'Community Hub Guide',
    description: 'Connect with creators, find jobs, and showcase your portfolio',
    category: 'feature',
    difficulty: 'beginner',
    estimatedTime: 4,
    steps: [
      {
        id: 'community-overview',
        title: 'Community Hub',
        description: 'Connect with thousands of creative professionals, find opportunities, and collaborate on projects.',
        element: '[data-tour="community-main"]',
        position: 'center'
      },
      {
        id: 'search-bar',
        title: 'Advanced Search',
        description: 'Search for members, jobs, and opportunities. Use filters to find exactly what you need.',
        element: '[data-tour="community-search"]',
        position: 'bottom',
        content: {
          tip: 'Click "Advanced Filters" for detailed search options including skills, location, and ratings.'
        }
      },
      {
        id: 'member-profiles',
        title: 'Professional Profiles',
        description: 'Browse member portfolios, reviews, and expertise. Click any profile to view their full portfolio.',
        element: '[data-tour="community-members"]',
        position: 'top'
      },
      {
        id: 'job-board',
        title: 'Job Opportunities',
        description: 'Find freelance gigs and project opportunities. Filter by budget, skills, and project type.',
        element: '[data-tour="community-jobs"]',
        position: 'top'
      },
      {
        id: 'your-profile',
        title: 'Your Portfolio',
        description: 'Build your professional portfolio to attract clients. Showcase projects, skills, and testimonials.',
        element: '[data-tour="community-profile-link"]',
        position: 'right',
        content: {
          tip: 'Complete profiles with portfolios receive 3x more inquiries!'
        }
      }
    ]
  },

  // ==========================================
  // GALLERY TOUR
  // ==========================================
  {
    id: 'gallery-monetization',
    name: 'Gallery & Monetization',
    description: 'Protect, showcase, and monetize your creative work',
    category: 'feature',
    difficulty: 'intermediate',
    estimatedTime: 5,
    steps: [
      {
        id: 'gallery-overview',
        title: 'Creative Gallery',
        description: 'Showcase your work, protect it with watermarks, and monetize through tiered access.',
        element: '[data-tour="gallery-main"]',
        position: 'center'
      },
      {
        id: 'upload-content',
        title: 'Upload Your Work',
        description: 'Drag and drop files or click to upload images, videos, and creative assets.',
        element: '[data-tour="gallery-upload"]',
        position: 'bottom',
        highlightPadding: 16
      },
      {
        id: 'watermark-tool',
        title: 'Watermark Protection',
        description: 'Add text or image watermarks to protect your work. Choose from presets or customize completely.',
        element: '[data-tour="gallery-watermark-btn"]',
        position: 'bottom',
        content: {
          tip: 'Use tiled watermarks for maximum protection against unauthorized use.'
        }
      },
      {
        id: 'payment-gates',
        title: 'Monetization Tiers',
        description: 'Set up payment gates with 4 pricing tiers. Earn 85% of every sale (platform takes 15%).',
        element: '[data-tour="gallery-pricing-btn"]',
        position: 'bottom',
        content: {
          tip: 'Offer free previews with watermarks, then full resolution to paying customers.'
        }
      },
      {
        id: 'gallery-grid',
        title: 'Your Gallery',
        description: 'Organize your work in collections. Track views, downloads, and earnings for each piece.',
        element: '[data-tour="gallery-grid"]',
        position: 'top'
      },
      {
        id: 'earnings-dashboard',
        title: 'Revenue Tracking',
        description: 'Monitor your sales, track popular items, and export earnings reports.',
        element: '[data-tour="gallery-earnings"]',
        position: 'top'
      }
    ]
  },

  // ==========================================
  // PROJECTS HUB TOUR
  // ==========================================
  {
    id: 'projects-management',
    name: 'Project Management Pro',
    description: 'Master project tracking, collaboration, and delivery',
    category: 'feature',
    difficulty: 'intermediate',
    estimatedTime: 6,
    steps: [
      {
        id: 'projects-overview',
        title: 'Projects Hub',
        description: 'Manage client projects from pitch to delivery. Track progress, budgets, and team collaboration.',
        element: '[data-tour="projects-main"]',
        position: 'center'
      },
      {
        id: 'create-project',
        title: 'Create New Project',
        description: 'Start a new project with templates or from scratch. Set budgets, deadlines, and team members.',
        element: '[data-tour="projects-create-btn"]',
        position: 'bottom',
        highlightPadding: 12
      },
      {
        id: 'project-cards',
        title: 'Project Overview Cards',
        description: 'Quick view of all projects with status, progress, and upcoming deadlines.',
        element: '[data-tour="projects-grid"]',
        position: 'top',
        content: {
          tip: 'Color-coded status: Green (on track), Yellow (at risk), Red (overdue).'
        }
      },
      {
        id: 'kanban-view',
        title: 'Kanban Board',
        description: 'Drag and drop tasks across stages: To Do, In Progress, Review, and Done.',
        element: '[data-tour="projects-kanban"]',
        position: 'top'
      },
      {
        id: 'timeline-view',
        title: 'Timeline & Gantt',
        description: 'Visualize project schedules, dependencies, and critical paths.',
        element: '[data-tour="projects-timeline"]',
        position: 'top'
      },
      {
        id: 'team-collaboration',
        title: 'Team Collaboration',
        description: 'Assign tasks, share files, and communicate in real-time with your team.',
        element: '[data-tour="projects-team"]',
        position: 'right'
      }
    ]
  },

  // ==========================================
  // AI TOOLS TOUR
  // ==========================================
  {
    id: 'ai-features-tour',
    name: 'AI-Powered Creativity',
    description: 'Leverage AI for design, content, and automation',
    category: 'advanced',
    difficulty: 'advanced',
    estimatedTime: 7,
    steps: [
      {
        id: 'ai-overview',
        title: 'AI-Powered Features',
        description: 'Supercharge your creativity with AI design generation, content assistance, and workflow automation.',
        element: '[data-tour="ai-main"]',
        position: 'center'
      },
      {
        id: 'ai-create',
        title: 'AI Design Studio',
        description: 'Generate logos, graphics, and designs from text descriptions. Iterate with AI suggestions.',
        element: '[data-tour="nav-ai-create"]',
        position: 'right',
        content: {
          tip: 'Be specific in your prompts: "Modern minimalist logo for tech startup, blue and white colors"'
        }
      },
      {
        id: 'ai-assistant',
        title: 'AI Assistant',
        description: 'Get help with project planning, content writing, and creative decisions.',
        element: '[data-tour="nav-ai-assistant"]',
        position: 'right'
      },
      {
        id: 'ai-templates',
        title: 'AI Template Library',
        description: 'Start with AI-generated templates for presentations, social media, and marketing materials.',
        element: '[data-tour="ai-templates"]',
        position: 'top'
      },
      {
        id: 'ai-enhancement',
        title: 'AI Enhancement Tools',
        description: 'Upscale images, remove backgrounds, and enhance quality automatically.',
        element: '[data-tour="ai-enhance"]',
        position: 'top'
      }
    ]
  },

  // ==========================================
  // COLLABORATION TOUR
  // ==========================================
  {
    id: 'collaboration-tools',
    name: 'Real-time Collaboration',
    description: 'Work together with live editing, video calls, and shared workspaces',
    category: 'advanced',
    difficulty: 'advanced',
    estimatedTime: 5,
    steps: [
      {
        id: 'collab-overview',
        title: 'Collaboration Hub',
        description: 'Work with your team in real-time with live editing, video calls, and shared canvases.',
        element: '[data-tour="collab-main"]',
        position: 'center',
        content: {
          warning: 'Real-time features require stable internet connection for best experience.'
        }
      },
      {
        id: 'voice-rooms',
        title: 'Voice Collaboration Rooms',
        description: 'Join voice channels for quick team discussions. Create public or private rooms.',
        element: '[data-tour="nav-voice-collab"]',
        position: 'right'
      },
      {
        id: 'video-calls',
        title: 'Video Conferencing',
        description: 'Start video calls with screen sharing. Record sessions for later review.',
        element: '[data-tour="collab-video-btn"]',
        position: 'bottom'
      },
      {
        id: 'live-editing',
        title: 'Real-time Document Editing',
        description: 'See team members\' cursors and edits in real-time. Google Docs-style collaboration.',
        element: '[data-tour="collab-editor"]',
        position: 'top',
        content: {
          tip: 'Color-coded cursors show who\'s editing what. Hover to see names.'
        }
      },
      {
        id: 'shared-whiteboard',
        title: 'Shared Whiteboard',
        description: 'Brainstorm together on an infinite canvas. Draw, add sticky notes, and organize ideas.',
        element: '[data-tour="collab-whiteboard"]',
        position: 'top'
      }
    ]
  },

  // ==========================================
  // TIPS & TRICKS
  // ==========================================
  {
    id: 'power-user-tips',
    name: 'Power User Tips',
    description: 'Advanced shortcuts and productivity hacks',
    category: 'tips',
    difficulty: 'advanced',
    estimatedTime: 4,
    steps: [
      {
        id: 'keyboard-shortcuts',
        title: 'Keyboard Shortcuts',
        description: 'Press Ctrl+K (Cmd+K on Mac) to open the quick command palette from anywhere.',
        element: '[data-tour="command-palette"]',
        position: 'center',
        content: {
          tip: 'Learn these shortcuts: Ctrl+N (new project), Ctrl+S (save), Ctrl+/ (search)'
        }
      },
      {
        id: 'quick-actions',
        title: 'Quick Action Menu',
        description: 'Right-click anywhere for context menus with smart suggestions based on your selection.',
        element: '[data-tour="main-content"]',
        position: 'center'
      },
      {
        id: 'bulk-operations',
        title: 'Bulk Operations',
        description: 'Select multiple items with Shift+Click or Ctrl+Click. Perform batch actions on selections.',
        element: '[data-tour="content-grid"]',
        position: 'top',
        content: {
          tip: 'Bulk edit tags, move to folders, or apply watermarks to multiple items at once.'
        }
      },
      {
        id: 'custom-workflows',
        title: 'Workflow Automation',
        description: 'Create custom workflows to automate repetitive tasks. Set triggers and actions.',
        element: '[data-tour="settings-workflows"]',
        position: 'right'
      }
    ]
  }
]

/**
 * Get tours by category
 */
export function getToursByCategory(category: Tour['category']): Tour[] {
  return platformTours.filter(tour => tour.category === category)
}

/**
 * Get tour by ID
 */
export function getTourById(id: string): Tour | undefined {
  return platformTours.find(tour => tour.id === id)
}

/**
 * Get recommended tours for new users
 */
export function getRecommendedTours(): Tour[] {
  return [
    getTourById('dashboard-overview'),
    getTourById('video-studio-complete'),
    getTourById('community-hub-tour'),
    getTourById('gallery-monetization')
  ].filter((tour): tour is Tour => tour !== undefined)
}

/**
 * Get next suggested tour based on completed tours
 */
export function getNextTour(completedTourIds: string[]): Tour | null {
  const recommended = getRecommendedTours()

  // First, complete all recommended tours
  const nextRecommended = recommended.find(tour => !completedTourIds.includes(tour.id))
  if (nextRecommended) {
    return nextRecommended
  }

  // Then, suggest advanced tours
  const advancedTours = platformTours.filter(
    tour => tour.difficulty === 'advanced' && !completedTourIds.includes(tour.id)
  )

  return advancedTours[0] || null
}
