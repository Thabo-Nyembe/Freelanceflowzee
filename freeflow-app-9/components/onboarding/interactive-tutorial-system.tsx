'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Play, 
  CheckCircle, 
  Award, 
  HelpCircle, 
  BookOpen, 
  Video, 
  Sparkles,
  Zap,
  Star,
  MessageSquare,
  BarChart,
  Settings,
  Info
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/components/ui/use-toast';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';

// ===== TYPE DEFINITIONS =====

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  element?: string; // CSS selector for the element to highlight
  position?: 'top' | 'right' | 'bottom' | 'left' | 'center';
  image?: string; // Optional image URL
  video?: string; // Optional video URL
  action?: 'click' | 'input' | 'navigate' | 'observe'; // Action required to complete step
  route?: string; // Route to navigate to for this step
  completionCriteria?: () => boolean; // Custom function to determine if step is complete
  spotlight?: boolean; // Whether to show a spotlight effect
  tooltipOnly?: boolean; // Whether to show only as a tooltip
  requiredForCompletion?: boolean; // Whether this step is required for completion
  category: 'welcome' | 'ai' | 'feedback' | 'projects' | 'collaboration' | 'advanced';
  duration?: number; // Estimated time in seconds
}

export interface TutorialTour {
  id: string;
  title: string;
  description: string;
  steps: TutorialStep[];
  category: 'welcome' | 'ai' | 'feedback' | 'projects' | 'collaboration' | 'advanced';
  requiredForOnboarding?: boolean;
  icon: React.ReactNode;
  estimatedDuration: number; // In minutes
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  condition: (progress: UserProgress) => boolean;
  reward?: string;
  xp: number;
  unlockedAt?: Date;
}

export interface UserProgress {
  userId: string;
  completedSteps: string[]; // Array of completed step IDs
  completedTours: string[]; // Array of completed tour IDs
  lastActivity: Date;
  achievements: string[]; // Array of achievement IDs
  totalXp: number;
  level: number;
  dismissedTours: string[]; // Tours that were explicitly dismissed
  viewedVideos: string[]; // Video tutorials that were viewed
  helpArticlesRead: string[]; // Help articles that were read
}

export interface OnboardingAnalytics {
  userId: string;
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  completedSteps: string[];
  timePerStep: Record<string, number>; // Step ID to time spent in ms
  clicks: number;
  pageViews: Record<string, number>; // Route to view count
  completionRate: number; // 0-1
  dropOffStep?: string; // Step where user dropped off
  feedbackRating?: number; // 1-5
  feedbackComments?: string;
}

export interface InteractiveTutorialSystemProps {
  defaultOpen?: boolean;
  autoStart?: boolean;
  initialTour?: string;
  onComplete?: (progress: UserProgress) => void;
  onStepComplete?: (stepId: string, tourId: string) => void;
  disableAnalytics?: boolean;
  className?: string;
  customTours?: TutorialTour[];
  customAchievements?: Achievement[];
  helpCenterUrl?: string;
  videoTutorialsUrl?: string;
  onboardingVersion?: string;
}

// ===== DEFAULT TOURS AND ACHIEVEMENTS =====

const defaultTours: TutorialTour[] = [
  {
    id: 'welcome-tour',
    title: 'Welcome to KAZI',
    description: 'Get started with the essential features of the KAZI platform',
    category: 'welcome',
    requiredForOnboarding: true,
    icon: <Sparkles className="h-5 w-5 text-blue-500" />,
    estimatedDuration: 5,
    steps: [
      {
        id: 'welcome-dashboard',
        title: 'Welcome to Your Dashboard',
        description: 'This is your personalized dashboard where you can see all your projects, tasks, and analytics.',
        element: '.dashboard-overview',
        position: 'bottom',
        category: 'welcome',
        requiredForCompletion: true,
      },
      {
        id: 'navigation-sidebar',
        title: 'Navigation',
        description: 'Use the sidebar to navigate between different sections of the platform.',
        element: '.sidebar-navigation',
        position: 'right',
        category: 'welcome',
        requiredForCompletion: true,
      },
      {
        id: 'projects-hub',
        title: 'Projects Hub',
        description: 'Manage all your projects in one place. Create, edit, and track progress easily.',
        element: '.projects-hub-link',
        position: 'right',
        route: '/dashboard/projects-hub',
        category: 'welcome',
        requiredForCompletion: true,
      },
      {
        id: 'ai-assistant',
        title: 'AI Assistant',
        description: 'Your personal AI assistant can help with tasks, answer questions, and provide insights.',
        element: '.ai-assistant-link',
        position: 'right',
        route: '/dashboard/ai-assistant',
        category: 'welcome',
        requiredForCompletion: true,
        spotlight: true,
      },
      {
        id: 'feedback-system',
        title: 'Universal Feedback System',
        description: 'Click anywhere on designs, documents, or media to leave contextual feedback.',
        element: '.universal-feedback-button',
        position: 'bottom',
        category: 'welcome',
        requiredForCompletion: true,
        spotlight: true,
      }
    ]
  },
  {
    id: 'ai-features-tour',
    title: 'AI Features',
    description: 'Discover the powerful AI capabilities of KAZI',
    category: 'ai',
    icon: <Zap className="h-5 w-5 text-purple-500" />,
    estimatedDuration: 8,
    steps: [
      {
        id: 'ai-gateway',
        title: 'AI Gateway',
        description: 'The central hub for all AI features. Access different AI models and capabilities.',
        element: '.ai-gateway',
        position: 'bottom',
        route: '/dashboard/ai-assistant',
        category: 'ai',
        requiredForCompletion: true,
      },
      {
        id: 'video-intelligence',
        title: 'Video Intelligence',
        description: 'Automatically analyze videos for content, sentiment, and key moments.',
        element: '.video-intelligence',
        position: 'bottom',
        video: '/tutorials/video-intelligence-demo.mp4',
        category: 'ai',
        requiredForCompletion: false,
      },
      {
        id: 'multimodal-ai',
        title: 'Multi-modal AI',
        description: 'Work with text, images, and audio simultaneously for creative projects.',
        element: '.multimodal-ai',
        position: 'right',
        category: 'ai',
        requiredForCompletion: false,
      },
      {
        id: 'smart-collaboration',
        title: 'Smart Collaboration',
        description: 'AI-powered collaboration tools that enhance team productivity.',
        element: '.smart-collaboration',
        position: 'top',
        category: 'ai',
        requiredForCompletion: false,
      },
      {
        id: 'predictive-analytics',
        title: 'Predictive Analytics',
        description: 'Get insights and forecasts based on your project data and industry trends.',
        element: '.predictive-analytics',
        position: 'left',
        category: 'ai',
        requiredForCompletion: true,
      }
    ]
  },
  {
    id: 'feedback-system-tour',
    title: 'Universal Feedback System',
    description: 'Learn how to use the powerful feedback tools',
    category: 'feedback',
    icon: <MessageSquare className="h-5 w-5 text-green-500" />,
    estimatedDuration: 6,
    steps: [
      {
        id: 'feedback-overview',
        title: 'Feedback Overview',
        description: 'The Universal Pinpoint Feedback System allows you to comment on any part of any content.',
        element: '.feedback-system-overview',
        position: 'bottom',
        category: 'feedback',
        requiredForCompletion: true,
      },
      {
        id: 'click-anywhere',
        title: 'Click Anywhere',
        description: 'Click on any part of an image, video, document, or design to leave contextual feedback.',
        element: '.feedback-demo-area',
        position: 'center',
        action: 'click',
        category: 'feedback',
        requiredForCompletion: true,
        spotlight: true,
      },
      {
        id: 'media-support',
        title: 'Multiple Media Support',
        description: 'The system works with images, videos, PDFs, designs, code, and more.',
        element: '.media-type-selector',
        position: 'bottom',
        category: 'feedback',
        requiredForCompletion: false,
      },
      {
        id: 'realtime-collaboration',
        title: 'Real-time Collaboration',
        description: 'See team members' cursors and comments in real-time as they review content.',
        element: '.realtime-collaborators',
        position: 'right',
        video: '/tutorials/realtime-collaboration-demo.mp4',
        category: 'feedback',
        requiredForCompletion: false,
      },
      {
        id: 'voice-recording',
        title: 'Voice Comments',
        description: 'Record voice comments for more detailed feedback.',
        element: '.voice-recording-button',
        position: 'bottom',
        category: 'feedback',
        requiredForCompletion: false,
      }
    ]
  },
  {
    id: 'projects-management-tour',
    title: 'Project Management',
    description: 'Master project management workflows',
    category: 'projects',
    icon: <FolderOpen className="h-5 w-5 text-amber-500" />,
    estimatedDuration: 10,
    steps: [
      {
        id: 'project-creation',
        title: 'Create a Project',
        description: 'Learn how to create a new project and set up its basic parameters.',
        element: '.create-project-button',
        position: 'bottom',
        route: '/dashboard/projects-hub',
        category: 'projects',
        requiredForCompletion: true,
      },
      {
        id: 'project-dashboard',
        title: 'Project Dashboard',
        description: 'Get an overview of your project status, tasks, and team members.',
        element: '.project-dashboard',
        position: 'top',
        category: 'projects',
        requiredForCompletion: true,
      },
      {
        id: 'task-management',
        title: 'Task Management',
        description: 'Create, assign, and track tasks to keep your project on schedule.',
        element: '.task-management',
        position: 'right',
        category: 'projects',
        requiredForCompletion: true,
      },
      {
        id: 'timeline-view',
        title: 'Timeline View',
        description: 'Visualize your project timeline and milestones.',
        element: '.timeline-view',
        position: 'top',
        category: 'projects',
        requiredForCompletion: false,
      },
      {
        id: 'budget-tracking',
        title: 'Budget Tracking',
        description: 'Monitor project expenses and stay within budget.',
        element: '.budget-tracking',
        position: 'left',
        category: 'projects',
        requiredForCompletion: false,
      }
    ]
  },
  {
    id: 'collaboration-tour',
    title: 'Team Collaboration',
    description: 'Enhance your team productivity',
    category: 'collaboration',
    icon: <Users className="h-5 w-5 text-indigo-500" />,
    estimatedDuration: 7,
    steps: [
      {
        id: 'team-overview',
        title: 'Team Overview',
        description: 'See all team members and their current activities.',
        element: '.team-overview',
        position: 'bottom',
        route: '/dashboard/collaboration',
        category: 'collaboration',
        requiredForCompletion: true,
      },
      {
        id: 'invite-members',
        title: 'Invite Team Members',
        description: 'Add new members to your team and assign roles.',
        element: '.invite-members',
        position: 'right',
        category: 'collaboration',
        requiredForCompletion: true,
      },
      {
        id: 'communication-tools',
        title: 'Communication Tools',
        description: 'Use built-in messaging, comments, and video calls.',
        element: '.communication-tools',
        position: 'bottom',
        category: 'collaboration',
        requiredForCompletion: false,
      },
      {
        id: 'file-sharing',
        title: 'File Sharing',
        description: 'Share files securely with team members and clients.',
        element: '.file-sharing',
        position: 'top',
        category: 'collaboration',
        requiredForCompletion: false,
      },
      {
        id: 'activity-feed',
        title: 'Activity Feed',
        description: 'Stay updated with all project activities in real-time.',
        element: '.activity-feed',
        position: 'left',
        category: 'collaboration',
        requiredForCompletion: true,
      }
    ]
  }
];

const defaultAchievements: Achievement[] = [
  {
    id: 'first-login',
    title: 'First Steps',
    description: 'Completed your first login to the KAZI platform',
    icon: <Star className="h-5 w-5 text-yellow-500" />,
    condition: () => true, // Always awarded on first login
    xp: 10
  },
  {
    id: 'welcome-complete',
    title: 'Welcome Aboard',
    description: 'Completed the welcome tour',
    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
    condition: (progress) => progress.completedTours.includes('welcome-tour'),
    xp: 50
  },
  {
    id: 'ai-explorer',
    title: 'AI Explorer',
    description: 'Discovered the AI features of KAZI',
    icon: <Zap className="h-5 w-5 text-purple-500" />,
    condition: (progress) => progress.completedTours.includes('ai-features-tour'),
    xp: 100
  },
  {
    id: 'feedback-master',
    title: 'Feedback Master',
    description: 'Mastered the Universal Feedback System',
    icon: <MessageSquare className="h-5 w-5 text-blue-500" />,
    condition: (progress) => progress.completedTours.includes('feedback-system-tour'),
    xp: 100
  },
  {
    id: 'project-manager',
    title: 'Project Manager',
    description: 'Learned the project management workflows',
    icon: <FolderOpen className="h-5 w-5 text-amber-500" />,
    condition: (progress) => progress.completedTours.includes('projects-management-tour'),
    xp: 100
  },
  {
    id: 'team-player',
    title: 'Team Player',
    description: 'Explored the collaboration features',
    icon: <Users className="h-5 w-5 text-indigo-500" />,
    condition: (progress) => progress.completedTours.includes('collaboration-tour'),
    xp: 100
  },
  {
    id: 'onboarding-complete',
    title: 'Onboarding Complete',
    description: 'Completed all essential onboarding tours',
    icon: <Award className="h-5 w-5 text-yellow-500" />,
    condition: (progress) => {
      const requiredTours = defaultTours
        .filter(tour => tour.requiredForOnboarding)
        .map(tour => tour.id);
      return requiredTours.every(tourId => progress.completedTours.includes(tourId));
    },
    reward: 'Premium features unlocked for 30 days',
    xp: 500
  },
  {
    id: 'power-user',
    title: 'Power User',
    description: 'Completed all available tours and tutorials',
    icon: <Award className="h-6 w-6 text-purple-500" />,
    condition: (progress) => {
      const allTourIds = defaultTours.map(tour => tour.id);
      return allTourIds.every(tourId => progress.completedTours.includes(tourId));
    },
    reward: '1 month free subscription',
    xp: 1000
  }
];

// ===== HELPER FUNCTIONS =====

const calculateLevel = (xp: number): number => {
  // Simple level calculation: each level requires 20% more XP than the previous
  // Level 1: 0-100 XP
  // Level 2: 101-220 XP
  // Level 3: 221-364 XP
  // etc.
  
  let level = 1;
  let threshold = 100;
  let totalRequired = threshold;
  
  while (xp >= totalRequired) {
    level++;
    threshold = Math.floor(threshold * 1.2);
    totalRequired += threshold;
  }
  
  return level;
};

const calculateProgress = (currentXp: number, level: number): number => {
  // Calculate progress percentage within current level
  const prevLevelThreshold = level === 1 ? 0 : 
    Array.from({ length: level - 1 }, (_, i) => Math.floor(100 * Math.pow(1.2, i)))
      .reduce((sum, threshold) => sum + threshold, 0);
  
  const currentLevelThreshold = Math.floor(100 * Math.pow(1.2, level - 1));
  const xpInCurrentLevel = currentXp - prevLevelThreshold;
  
  return Math.min(100, Math.floor((xpInCurrentLevel / currentLevelThreshold) * 100));
};

const FolderOpen: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M6 4H2v16h20V8H12l-2-4H6z" />
    <path d="M6 4v4h10" />
  </svg>
);

// ===== MAIN COMPONENT =====

export const InteractiveTutorialSystem: React.FC<InteractiveTutorialSystemProps> = ({
  defaultOpen = false,
  autoStart = true,
  initialTour = 'welcome-tour',
  onComplete,
  onStepComplete,
  disableAnalytics = false,
  className,
  customTours = [],
  customAchievements = [],
  helpCenterUrl = 'https://help.kazi.io',
  videoTutorialsUrl = 'https://learn.kazi.io/videos',
  onboardingVersion = '1.0.0',
}) => {
  // ===== STATE MANAGEMENT =====
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [activeTourId, setActiveTourId] = useState<string | null>(initialTour);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [userProgress, setUserProgress] = useState<UserProgress>({
    userId: '',
    completedSteps: [],
    completedTours: [],
    lastActivity: new Date(),
    achievements: [],
    totalXp: 0,
    level: 1,
    dismissedTours: [],
    viewedVideos: [],
    helpArticlesRead: [],
  });
  const [analytics, setAnalytics] = useState<OnboardingAnalytics>({
    userId: '',
    sessionId: '',
    startTime: new Date(),
    completedSteps: [],
    timePerStep: {},
    clicks: 0,
    pageViews: {},
    completionRate: 0,
  });
  const [activeTab, setActiveTab] = useState<string>('tours');
  const [showTooltips, setShowTooltips] = useState(true);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [showAchievementNotification, setShowAchievementNotification] = useState(false);
  
  // ===== REFS =====
  const stepStartTimeRef = useRef<Date>(new Date());
  const tooltipRefs = useRef<Record<string, HTMLElement | null>>({});
  
  // ===== HOOKS =====
  const router = useRouter();
  const pathname = usePathname();
  const supabase = useSupabaseClient();
  const user = useUser();
  
  // ===== DERIVED STATE =====
  const tours = useMemo(() => [...defaultTours, ...customTours], [customTours]);
  const achievements = useMemo(() => [...defaultAchievements, ...customAchievements], [customAchievements]);
  
  const activeTour = useMemo(() => 
    tours.find(tour => tour.id === activeTourId) || null
  , [tours, activeTourId]);
  
  const activeStep = useMemo(() => 
    activeTour && activeTour.steps[activeStepIndex]
      ? activeTour.steps[activeStepIndex]
      : null
  , [activeTour, activeStepIndex]);
  
  const totalRequiredSteps = useMemo(() => 
    activeTour
      ? activeTour.steps.filter(step => step.requiredForCompletion !== false).length
      : 0
  , [activeTour]);
  
  const completedRequiredSteps = useMemo(() => 
    activeTour
      ? activeTour.steps
          .filter(step => step.requiredForCompletion !== false)
          .filter(step => userProgress.completedSteps.includes(step.id))
          .length
      : 0
  , [activeTour, userProgress.completedSteps]);
  
  const tourProgress = useMemo(() => 
    totalRequiredSteps > 0
      ? Math.round((completedRequiredSteps / totalRequiredSteps) * 100)
      : 0
  , [completedRequiredSteps, totalRequiredSteps]);
  
  const unlockedAchievements = useMemo(() => 
    achievements.filter(achievement => 
      userProgress.achievements.includes(achievement.id)
    )
  , [achievements, userProgress.achievements]);
  
  const lockedAchievements = useMemo(() => 
    achievements.filter(achievement => 
      !userProgress.achievements.includes(achievement.id)
    )
  , [achievements, userProgress.achievements]);
  
  // ===== EFFECTS =====
  
  // Initialize user progress from localStorage or database
  useEffect(() => {
    const loadUserProgress = async () => {
      if (!user) return;
      
      try {
        // First try to load from Supabase
        const { data, error } = await supabase
          .from('onboarding_progress')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (error || !data) {
          // If not in database, try localStorage
          const savedProgress = localStorage.getItem('kazi_onboarding_progress');
          if (savedProgress) {
            const parsedProgress = JSON.parse(savedProgress) as UserProgress;
            setUserProgress({
              ...parsedProgress,
              userId: user.id,
              lastActivity: new Date(),
            });
          } else {
            // Initialize new progress
            setUserProgress({
              userId: user.id,
              completedSteps: [],
              completedTours: [],
              lastActivity: new Date(),
              achievements: [],
              totalXp: 0,
              level: 1,
              dismissedTours: [],
              viewedVideos: [],
              helpArticlesRead: [],
            });
            
            // Award first login achievement
            checkAndAwardAchievements({
              userId: user.id,
              completedSteps: [],
              completedTours: [],
              lastActivity: new Date(),
              achievements: ['first-login'], // Auto-award first login
              totalXp: 10, // XP for first login
              level: 1,
              dismissedTours: [],
              viewedVideos: [],
              helpArticlesRead: [],
            });
          }
        } else {
          // Use data from Supabase
          setUserProgress({
            userId: data.user_id,
            completedSteps: data.completed_steps || [],
            completedTours: data.completed_tours || [],
            lastActivity: new Date(data.last_activity),
            achievements: data.achievements || [],
            totalXp: data.total_xp || 0,
            level: data.level || 1,
            dismissedTours: data.dismissed_tours || [],
            viewedVideos: data.viewed_videos || [],
            helpArticlesRead: data.help_articles_read || [],
          });
        }
      } catch (err) {
        console.error('Error loading user progress:', err);
        // Initialize with defaults
        setUserProgress({
          userId: user.id,
          completedSteps: [],
          completedTours: [],
          lastActivity: new Date(),
          achievements: ['first-login'], // Auto-award first login
          totalXp: 10, // XP for first login
          level: 1,
          dismissedTours: [],
          viewedVideos: [],
          helpArticlesRead: [],
        });
      }
    };
    
    // Initialize analytics session
    const initAnalytics = () => {
      if (disableAnalytics) return;
      
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      setAnalytics({
        userId: user?.id || 'anonymous',
        sessionId,
        startTime: new Date(),
        completedSteps: [],
        timePerStep: {},
        clicks: 0,
        pageViews: { [pathname || 'unknown']: 1 },
        completionRate: 0,
      });
    };
    
    loadUserProgress();
    initAnalytics();
    
    // Auto-start if configured
    if (autoStart && initialTour) {
      setIsOpen(true);
      setActiveTourId(initialTour);
      setActiveStepIndex(0);
    }
    
    // Track page views for analytics
    const handleRouteChange = (url: string) => {
      if (disableAnalytics) return;
      
      setAnalytics(prev => ({
        ...prev,
        pageViews: {
          ...prev.pageViews,
          [url]: (prev.pageViews[url] || 0) + 1
        }
      }));
    };
    
    // Cleanup function
    return () => {
      // Save progress to localStorage as backup
      if (user && userProgress.userId) {
        localStorage.setItem('kazi_onboarding_progress', JSON.stringify(userProgress));
      }
      
      // Submit final analytics
      if (!disableAnalytics) {
        submitAnalytics({
          ...analytics,
          endTime: new Date()
        });
      }
    };
  }, [user, supabase, autoStart, initialTour, pathname, disableAnalytics]);
  
  // Save progress whenever it changes
  useEffect(() => {
    const saveProgress = async () => {
      if (!user || !userProgress.userId) return;
      
      try {
        // Save to localStorage as backup
        localStorage.setItem('kazi_onboarding_progress', JSON.stringify(userProgress));
        
        // Save to Supabase
        const { error } = await supabase
          .from('onboarding_progress')
          .upsert({
            user_id: userProgress.userId,
            completed_steps: userProgress.completedSteps,
            completed_tours: userProgress.completedTours,
            last_activity: new Date().toISOString(),
            achievements: userProgress.achievements,
            total_xp: userProgress.totalXp,
            level: userProgress.level,
            dismissed_tours: userProgress.dismissedTours,
            viewed_videos: userProgress.viewedVideos,
            help_articles_read: userProgress.helpArticlesRead,
            onboarding_version: onboardingVersion,
          }, { onConflict: 'user_id' });
          
        if (error) {
          console.error('Error saving progress:', error);
        }
      } catch (err) {
        console.error('Error saving user progress:', err);
      }
    };
    
    saveProgress();
  }, [userProgress, user, supabase, onboardingVersion]);
  
  // Navigate to the correct route when step changes
  useEffect(() => {
    if (activeStep?.route && pathname !== activeStep.route) {
      router.push(activeStep.route);
    }
  }, [activeStep, router, pathname]);
  
  // Position tooltips when step changes
  useEffect(() => {
    if (!activeStep || !activeStep.element || !isOpen) return;
    
    const positionTooltip = () => {
      try {
        const element = document.querySelector(activeStep.element as string);
        if (!element) return;
        
        // Scroll element into view if needed
        if (
          element.getBoundingClientRect().top < 0 ||
          element.getBoundingClientRect().bottom > window.innerHeight
        ) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } catch (err) {
        console.error('Error positioning tooltip:', err);
      }
    };
    
    // Small delay to ensure DOM is ready
    const timer = setTimeout(positionTooltip, 300);
    return () => clearTimeout(timer);
  }, [activeStep, isOpen]);
  
  // Track time spent on each step
  useEffect(() => {
    if (!activeStep || disableAnalytics) return;
    
    stepStartTimeRef.current = new Date();
    
    return () => {
      const timeSpent = new Date().getTime() - stepStartTimeRef.current.getTime();
      setAnalytics(prev => ({
        ...prev,
        timePerStep: {
          ...prev.timePerStep,
          [activeStep.id]: (prev.timePerStep[activeStep.id] || 0) + timeSpent
        }
      }));
    };
  }, [activeStep, disableAnalytics]);
  
  // ===== HANDLERS =====
  
  const handleStepComplete = useCallback((stepId: string, tourId: string) => {
    // Update user progress
    setUserProgress(prev => {
      // Skip if already completed
      if (prev.completedSteps.includes(stepId)) {
        return prev;
      }
      
      const newProgress = {
        ...prev,
        completedSteps: [...prev.completedSteps, stepId],
        lastActivity: new Date()
      };
      
      // Check if tour is complete
      const tour = tours.find(t => t.id === tourId);
      if (tour) {
        const requiredSteps = tour.steps
          .filter(step => step.requiredForCompletion !== false)
          .map(step => step.id);
          
        const completedRequiredSteps = requiredSteps
          .filter(id => [...prev.completedSteps, stepId].includes(id));
          
        if (
          requiredSteps.length > 0 && 
          completedRequiredSteps.length === requiredSteps.length &&
          !prev.completedTours.includes(tourId)
        ) {
          // Tour complete! Award XP
          const tourXp = 50 * requiredSteps.length; // 50 XP per required step
          newProgress.completedTours = [...prev.completedTours, tourId];
          newProgress.totalXp = prev.totalXp + tourXp;
          newProgress.level = calculateLevel(newProgress.totalXp);
          
          // Show completion toast
          toast({
            title: `${tour.title} Complete!`,
            description: `You've earned ${tourXp} XP for completing this tour.`,
            duration: 5000,
          });
        }
      }
      
      // Call external handler if provided
      if (onStepComplete) {
        onStepComplete(stepId, tourId);
      }
      
      return newProgress;
    });
    
    // Update analytics
    if (!disableAnalytics) {
      setAnalytics(prev => ({
        ...prev,
        completedSteps: [...prev.completedSteps, stepId],
        completionRate: prev.completedSteps.length / 
          (tours.flatMap(t => t.steps).filter(s => s.requiredForCompletion !== false).length)
      }));
    }
  }, [tours, onStepComplete, disableAnalytics]);
  
  const handleNextStep = useCallback(() => {
    if (!activeTour) return;
    
    // Mark current step as complete
    if (activeStep) {
      handleStepComplete(activeStep.id, activeTour.id);
    }
    
    // Move to next step
    if (activeStepIndex < activeTour.steps.length - 1) {
      setActiveStepIndex(prev => prev + 1);
    } else {
      // Tour complete
      setIsOpen(false);
      setActiveTourId(null);
      
      // Check for achievements
      checkAndAwardAchievements({
        ...userProgress,
        completedSteps: activeStep 
          ? [...userProgress.completedSteps, activeStep.id]
          : userProgress.completedSteps,
        completedTours: [...userProgress.completedTours, activeTour.id]
      });
      
      // Call completion handler
      if (onComplete) {
        onComplete(userProgress);
      }
    }
  }, [activeTour, activeStep, activeStepIndex, handleStepComplete, onComplete, userProgress]);
  
  const handlePrevStep = useCallback(() => {
    if (activeStepIndex > 0) {
      setActiveStepIndex(prev => prev - 1);
    }
  }, [activeStepIndex]);
  
  const handleSkipTour = useCallback(() => {
    if (!activeTour) return;
    
    setUserProgress(prev => ({
      ...prev,
      dismissedTours: [...prev.dismissedTours, activeTour.id],
      lastActivity: new Date()
    }));
    
    setIsOpen(false);
    setActiveTourId(null);
    
    // Update analytics
    if (!disableAnalytics) {
      setAnalytics(prev => ({
        ...prev,
        dropOffStep: activeStep?.id
      }));
    }
  }, [activeTour, activeStep, disableAnalytics]);
  
  const handleStartTour = useCallback((tourId: string) => {
    setActiveTourId(tourId);
    setActiveStepIndex(0);
    setIsOpen(true);
    
    // Update analytics
    if (!disableAnalytics) {
      setAnalytics(prev => ({
        ...prev,
        clicks: prev.clicks + 1
      }));
    }
  }, [disableAnalytics]);
  
  const handleWatchVideo = useCallback((videoUrl: string) => {
    setActiveVideo(videoUrl);
    setVideoDialogOpen(true);
    
    // Track video view
    setUserProgress(prev => ({
      ...prev,
      viewedVideos: [...prev.viewedVideos, videoUrl],
      lastActivity: new Date()
    }));
    
    // Update analytics
    if (!disableAnalytics) {
      setAnalytics(prev => ({
        ...prev,
        clicks: prev.clicks + 1
      }));
    }
  }, [disableAnalytics]);
  
  const handleReadHelpArticle = useCallback((articleId: string) => {
    // Track article read
    setUserProgress(prev => ({
      ...prev,
      helpArticlesRead: [...prev.helpArticlesRead, articleId],
      lastActivity: new Date()
    }));
    
    // Update analytics
    if (!disableAnalytics) {
      setAnalytics(prev => ({
        ...prev,
        clicks: prev.clicks + 1
      }));
    }
  }, [disableAnalytics]);
  
  const submitAnalytics = useCallback((data: OnboardingAnalytics) => {
    if (disableAnalytics) return;
    
    try {
      // Send to analytics endpoint
      fetch('/api/onboarding-analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).catch(err => console.error('Error submitting analytics:', err));
      
      // Also store in Supabase if available
      if (supabase && user) {
        supabase
          .from('onboarding_analytics')
          .insert({
            user_id: data.userId,
            session_id: data.sessionId,
            start_time: data.startTime.toISOString(),
            end_time: data.endTime?.toISOString(),
            completed_steps: data.completedSteps,
            time_per_step: data.timePerStep,
            clicks: data.clicks,
            page_views: data.pageViews,
            completion_rate: data.completionRate,
            drop_off_step: data.dropOffStep,
            feedback_rating: data.feedbackRating,
            feedback_comments: data.feedbackComments,
            onboarding_version: onboardingVersion
          })
          .catch(err => console.error('Error storing analytics in Supabase:', err));
      }
    } catch (err) {
      console.error('Error submitting analytics:', err);
    }
  }, [disableAnalytics, supabase, user, onboardingVersion]);
  
  const checkAndAwardAchievements = useCallback((progress: UserProgress) => {
    const newlyUnlocked = achievements.filter(achievement => {
      // Skip if already awarded
      if (progress.achievements.includes(achievement.id)) {
        return false;
      }
      
      // Check if condition is met
      return achievement.condition(progress);
    });
    
    if (newlyUnlocked.length > 0) {
      // Award achievements
      const totalNewXp = newlyUnlocked.reduce((sum, a) => sum + a.xp, 0);
      
      setUserProgress(prev => {
        const updatedProgress = {
          ...prev,
          achievements: [...prev.achievements, ...newlyUnlocked.map(a => a.id)],
          totalXp: prev.totalXp + totalNewXp,
          lastActivity: new Date()
        };
        
        // Update level if needed
        updatedProgress.level = calculateLevel(updatedProgress.totalXp);
        
        return updatedProgress;
      });
      
      // Show notification
      setNewAchievements(newlyUnlocked);
      setShowAchievementNotification(true);
    }
  }, [achievements]);
  
  // ===== RENDER METHODS =====
  
  const renderTourList = () => (
    <div className="space-y-4 p-2">
      {tours.map(tour => {
        const isCompleted = userProgress.completedTours.includes(tour.id);
        const isDismissed = userProgress.dismissedTours.includes(tour.id);
        const requiredSteps = tour.steps.filter(step => step.requiredForCompletion !== false);
        const completedSteps = requiredSteps.filter(step => 
          userProgress.completedSteps.includes(step.id)
        );
        const progress = requiredSteps.length > 0 
          ? Math.round((completedSteps.length / requiredSteps.length) * 100)
          : 0;
          
        return (
          <Card 
            key={tour.id} 
            className={cn(
              "transition-all duration-200",
              isCompleted ? "border-green-200 bg-green-50" : 
              isDismissed ? "border-gray-200 bg-gray-50" : 
              "border-blue-200 hover:border-blue-300"
            )}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {tour.icon}
                  <CardTitle className="text-lg">{tour.title}</CardTitle>
                </div>
                {isCompleted && (
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" /> Completed
                  </Badge>
                )}
              </div>
              <CardDescription>{tour.description}</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>{completedSteps.length} of {requiredSteps.length} steps</span>
                <span>{tour.estimatedDuration} min</span>
              </div>
              <Progress value={progress} className="h-2" />
            </CardContent>
            <CardFooter>
              <Button 
                variant={isCompleted ? "outline" : "default"}
                size="sm"
                className="w-full"
                onClick={() => handleStartTour(tour.id)}
              >
                {isCompleted ? "Review Again" : isDismissed ? "Resume" : "Start Tour"}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
  
  const renderAchievements = () => (
    <div className="space-y-6 p-2">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="font-semibold">Level {userProgress.level}</h3>
            <p className="text-sm text-muted-foreground">
              {userProgress.totalXp} XP total
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">
              {calculateProgress(userProgress.totalXp, userProgress.level)}%
            </p>
            <p className="text-xs text-muted-foreground">
              Next level: {userProgress.level + 1}
            </p>
          </div>
        </div>
        <Progress 
          value={calculateProgress(userProgress.totalXp, userProgress.level)} 
          className="h-2" 
        />
      </div>
      
      <div>
        <h3 className="font-semibold mb-3">Unlocked Achievements</h3>
        <div className="grid grid-cols-2 gap-3">
          {unlockedAchievements.map(achievement => (
            <Card key={achievement.id} className="border-green-200 bg-green-50">
              <CardHeader className="p-3 pb-2">
                <div className="flex items-center gap-2">
                  {achievement.icon}
                  <CardTitle className="text-sm">{achievement.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <p className="text-xs text-muted-foreground">{achievement.description}</p>
                {achievement.reward && (
                  <Badge variant="outline" className="mt-2 text-xs bg-blue-50 border-blue-200">
                    Reward: {achievement.reward}
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="font-semibold mb-3">Locked Achievements</h3>
        <div className="grid grid-cols-2 gap-3">
          {lockedAchievements.map(achievement => (
            <Card key={achievement.id} className="border-gray-200 bg-gray-50 opacity-70">
              <CardHeader className="p-3 pb-2">
                <div className="flex items-center gap-2">
                  {achievement.icon}
                  <CardTitle className="text-sm">{achievement.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <p className="text-xs text-muted-foreground">{achievement.description}</p>
                <p className="text-xs text-blue-600 mt-1">+{achievement.xp} XP</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
  
  const renderHelpCenter = () => (
    <div className="space-y-4 p-2">
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Video Tutorials</h3>
        <div className="grid grid-cols-1 gap-3">
          <Card>
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-base">Getting Started with KAZI</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <p className="text-sm text-muted-foreground mb-2">
                A comprehensive overview of the KAZI platform and its features.
              </p>
              <Button 
                variant="outline" 
                size="sm"
                className="w-full"
                onClick={() => handleWatchVideo('/tutorials/getting-started.mp4')}
              >
                <Play className="h-4 w-4 mr-2" /> Watch Video (5:23)
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-base">AI Features Deep Dive</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <p className="text-sm text-muted-foreground mb-2">
                Explore all the AI capabilities of the KAZI platform.
              </p>
              <Button 
                variant="outline" 
                size="sm"
                className="w-full"
                onClick={() => handleWatchVideo('/tutorials/ai-features.mp4')}
              >
                <Play className="h-4 w-4 mr-2" /> Watch Video (8:45)
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-base">Universal Feedback System Tutorial</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <p className="text-sm text-muted-foreground mb-2">
                Learn how to use the powerful Universal Pinpoint Feedback System.
              </p>
              <Button 
                variant="outline" 
                size="sm"
                className="w-full"
                onClick={() => handleWatchVideo('/tutorials/feedback-system.mp4')}
              >
                <Play className="h-4 w-4 mr-2" /> Watch Video (6:12)
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div>
        <h3 className="font-semibold mb-2">Help Articles</h3>
        <div className="space-y-2">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-left"
            onClick={() => handleReadHelpArticle('getting-started')}
          >
            <BookOpen className="h-4 w-4 mr-2" /> 
            Getting Started Guide
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-left"
            onClick={() => handleReadHelpArticle('ai-features')}
          >
            <Zap className="h-4 w-4 mr-2" /> 
            AI Features Documentation
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-left"
            onClick={() => handleReadHelpArticle('feedback-system')}
          >
            <MessageSquare className="h-4 w-4 mr-2" /> 
            Feedback System Guide
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-left"
            onClick={() => handleReadHelpArticle('project-management')}
          >
            <FolderOpen className="h-4 w-4 mr-2" /> 
            Project Management Best Practices
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-left"
            onClick={() => handleReadHelpArticle('collaboration')}
          >
            <Users className="h-4 w-4 mr-2" /> 
            Team Collaboration Guide
          </Button>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 rounded-md border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-1">Need more help?</h4>
          <p className="text-sm text-blue-700 mb-3">
            Visit our comprehensive help center for more tutorials, guides, and support.
          </p>
          <Button 
            variant="outline" 
            size="sm"
            className="w-full bg-white"
            onClick={() => window.open(helpCenterUrl, '_blank')}
          >
            <HelpCircle className="h-4 w-4 mr-2" /> 
            Visit Help Center
          </Button>
        </div>
      </div>
    </div>
  );
  
  const renderAnalytics = () => (
    <div className="space-y-4 p-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Your Learning Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Tours Completed</span>
                <span className="text-sm text-muted-foreground">
                  {userProgress.completedTours.length} of {tours.length}
                </span>
              </div>
              <Progress 
                value={(userProgress.completedTours.length / tours.length) * 100} 
                className="h-2" 
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Steps Completed</span>
                <span className="text-sm text-muted-foreground">
                  {userProgress.completedSteps.length} of {tours.flatMap(t => t.steps).length}
                </span>
              </div>
              <Progress 
                value={(userProgress.completedSteps.length / tours.flatMap(t => t.steps).length) * 100} 
                className="h-2" 
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Achievements Unlocked</span>
                <span className="text-sm text-muted-foreground">
                  {userProgress.achievements.length} of {achievements.length}
                </span>
              </div>
              <Progress 
                value={(userProgress.achievements.length / achievements.length) * 100} 
                className="h-2" 
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Learning Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-xs text-muted-foreground">Total XP Earned</p>
              <p className="text-xl font-bold">{userProgress.totalXp}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-xs text-muted-foreground">Current Level</p>
              <p className="text-xl font-bold">{userProgress.level}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-xs text-muted-foreground">Videos Watched</p>
              <p className="text-xl font-bold">{userProgress.viewedVideos.length}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-xs text-muted-foreground">Help Articles Read</p>
              <p className="text-xl font-bold">{userProgress.helpArticlesRead.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Provide Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            How helpful was this onboarding experience?
          </p>
          <div className="flex space-x-2 mb-4">
            {[1, 2, 3, 4, 5].map(rating => (
              <Button
                key={rating}
                variant={analytics.feedbackRating === rating ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => setAnalytics(prev => ({ ...prev, feedbackRating: rating }))}
              >
                {rating}
              </Button>
            ))}
          </div>
          <textarea
            className="w-full p-2 border rounded-md h-24 text-sm"
            placeholder="Any suggestions to improve the onboarding experience?"
            value={analytics.feedbackComments || ''}
            onChange={e => setAnalytics(prev => ({ ...prev, feedbackComments: e.target.value }))}
          />
          <Button 
            className="w-full mt-2" 
            onClick={() => {
              submitAnalytics({
                ...analytics,
                endTime: new Date()
              });
              toast({
                title: "Feedback Submitted",
                description: "Thank you for your feedback!",
                duration: 3000,
              });
            }}
          >
            Submit Feedback
          </Button>
        </CardContent>
      </Card>
    </div>
  );
  
  const renderTooltip = () => {
    if (!activeStep || !isOpen) return null;
    
    return (
      <AnimatePresence>
        {activeStep.element && (
          <TooltipProvider>
            <Tooltip open={true}>
              <TooltipTrigger asChild>
                <div 
                  className="absolute"
                  style={{
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                  }}
                />
              </TooltipTrigger>
              <TooltipContent
                side={activeStep.position || 'bottom'}
                className="w-80 p-0 border-none shadow-lg"
                ref={el => {
                  if (el) tooltipRefs.current[activeStep.id] = el;
                }}
              >
                <Card className="border-none shadow-none">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{activeStep.title}</CardTitle>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0" 
                        onClick={handleSkipTour}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    {activeTour && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span>
                          Step {activeStepIndex + 1} of {activeTour.steps.length}
                        </span>
                        <Progress 
                          value={((activeStepIndex + 1) / activeTour.steps.length) * 100} 
                          className="h-1 flex-1 ml-2" 
                        />
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm">{activeStep.description}</p>
                    
                    {activeStep.image && (
                      <div className="mt-2 rounded-md overflow-hidden">
                        <Image 
                          src={activeStep.image} 
                          alt={activeStep.title} 
                          width={300} 
                          height={150} 
                          className="object-cover"
                        />
                      </div>
                    )}
                    
                    {activeStep.video && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 w-full"
                        onClick={() => handleWatchVideo(activeStep.video as string)}
                      >
                        <Play className="h-3 w-3 mr-2" /> Watch Video
                      </Button>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handlePrevStep}
                      disabled={activeStepIndex === 0}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                    </Button>
                    <Button size="sm" onClick={handleNextStep}>
                      {activeStepIndex === (activeTour?.steps.length || 1) - 1 ? (
                        'Finish'
                      ) : (
                        <>Next <ChevronRight className="h-4 w-4 ml-1" /></>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </AnimatePresence>
    );
  };
  
  // ===== MAIN RENDER =====
  
  return (
    <>
      {/* Main Dialog */}
      <Dialog open={isOpen && !activeStep?.tooltipOnly} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {activeTour ? activeTour.title : 'Interactive Tutorials'}
            </DialogTitle>
            <DialogDescription>
              {activeTour ? activeTour.description : 'Learn how to use the KAZI platform'}
            </DialogDescription>
          </DialogHeader>
          
          {!activeTour ? (
            <Tabs defaultValue="tours" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 mb-2">
                <TabsTrigger value="tours">Tours</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
                <TabsTrigger value="help">Help</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
              <TabsContent value="tours" className="max-h-[60vh] overflow-y-auto">
                {renderTourList()}
              </TabsContent>
              <TabsContent value="achievements" className="max-h-[60vh] overflow-y-auto">
                {renderAchievements()}
              </TabsContent>
              <TabsContent value="help" className="max-h-[60vh] overflow-y-auto">
                {renderHelpCenter()}
              </TabsContent>
              <TabsContent value="analytics" className="max-h-[60vh] overflow-y-auto">
                {renderAnalytics()}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="py-4">
              {activeStep && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-lg">{activeStep.title}</h3>
                    <p className="text-muted-foreground">{activeStep.description}</p>
                  </div>
                  
                  {activeStep.image && (
                    <div className="rounded-md overflow-hidden">
                      <Image 
                        src={activeStep.image} 
                        alt={activeStep.title} 
                        width={450} 
                        height={250} 
                        className="object-cover"
                      />
                    </div>
                  )}
                  
                  {activeStep.video && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleWatchVideo(activeStep.video as string)}
                    >
                      <Play className="h-4 w-4 mr-2" /> Watch Video Tutorial
                    </Button>
                  )}
                  
                  <Progress value={tourProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-center">
                    {completedRequiredSteps} of {totalRequiredSteps} required steps completed
                  </p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            {activeTour ? (
              <div className="flex w-full justify-between">
                <Button 
                  variant="outline" 
                  onClick={handleSkipTour}
                >
                  Skip Tour
                </Button>
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={handlePrevStep}
                    disabled={activeStepIndex === 0}
                  >
                    Previous
                  </Button>
                  <Button onClick={handleNextStep}>
                    {activeStepIndex === (activeTour?.steps.length || 1) - 1 ? (
                      'Finish'
                    ) : (
                      'Next'
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <Button onClick={() => setIsOpen(false)}>Close</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Tooltips for steps */}
      {renderTooltip()}
      
      {/* Video Dialog */}
      <Dialog open={videoDialogOpen} onOpenChange={setVideoDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Video Tutorial</DialogTitle>
          </DialogHeader>
          <div className="aspect-video bg-black rounded-md overflow-hidden">
            {activeVideo && (
              <video 
                src={activeVideo} 
                controls 
                autoPlay 
                className="w-full h-full"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Achievement Notification */}
      <AnimatePresence>
        {showAchievementNotification && newAchievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <Card className="w-80 border-yellow-300 bg-yellow-50">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center">
                    <Award className="h-5 w-5 text-yellow-500 mr-2" />
                    Achievement Unlocked!
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0" 
                    onClick={() => setShowAchievementNotification(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {newAchievements.map(achievement => (
                    <div key={achievement.id} className="flex items-center">
                      {achievement.icon}
                      <div className="ml-2">
                        <p className="font-medium">{achievement.title}</p>
                        <p className="text-xs text-muted-foreground">{achievement.description}</p>
                        <p className="text-xs text-blue-600">+{achievement.xp} XP</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    setShowAchievementNotification(false);
                    setIsOpen(true);
                    setActiveTourId(null);
                    setActiveTab('achievements');
                  }}
                >
                  View All Achievements
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Floating Action Button */}
      <div className={cn("fixed bottom-4 right-4 z-40", className)}>
        <Button
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg"
          onClick={() => {
            setIsOpen(true);
            setActiveTourId(null);
          }}
        >
          <HelpCircle className="h-6 w-6" />
        </Button>
      </div>
    </>
  );
};

export default InteractiveTutorialSystem;
