
"use client"

import { useState, useReducer, useEffect, useRef, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Users, 
  MessageSquare, 
  Search, 
  Download, 
  Share2,
  Star,
  Clock,
  MapPin,
  FileText,
  ImageIcon,
  Film,
  Plus,
  Eye,
  MoreHorizontal,
  Upload,
  Video,
  Palette,
  Layers,
  Code,
  Folder,
  Zap,
  ExternalLink,
  Cloud,
  Brain,
  Sparkles,
  LineChart,
  BarChart2,
  PieChart,
  Activity,
  Calendar,
  CheckCircle,
  AlertCircle,
  FileBarChart,
  UserPlus,
  Mic,
  Paperclip,
  Lightbulb,
  Settings,
  Maximize2,
  Minimize2,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  X,
  HelpCircle,
  Award,
  Clipboard,
  ClipboardCheck,
  Timer,
  Gauge,
  Cpu
} from 'lucide-react'
import { SmartCollaborationAI, SmartCollaborationFeatureType, CollaborationContextType, DocumentType, AISuggestionType } from '@/lib/ai/smart-collaboration-ai'

// Import existing team collaboration types
import { 
  TeamMember,
  Project,
  FileInfo,
  Collaboration,
  TeamState,
  TeamStats,
  TeamAction
} from '@/types/collaboration'

// AI-Enhanced types
interface AIEnhancedTeamState extends TeamState {
  aiFeatures: {
    enabled: boolean;
    copilot: boolean;
    documentIntelligence: boolean;
    meetingFeatures: boolean;
    collaborationIntelligence: boolean;
    realTimeFeatures: boolean;
  };
  aiInsights: {
    suggestions: AICopilotSuggestion[];
    documentAnalyses: Record<string, DocumentAnalysisResult>;
    meetingAnalyses: Record<string, MeetingAnalysis>;
    teamMetrics: TeamPerformanceMetrics | null;
    workflowPatterns: WorkflowPattern[];
  };
  aiUsage: {
    tokensUsed: number;
    totalCost: number;
    byFeature: Record<string, { tokens: number; cost: number }>;
  };
  activeSession: {
    id: string | null;
    type: 'document' | 'meeting' | 'collaboration' | null;
    contextId: string | null;
  };
  selectedDocument: string | null;
  selectedMeeting: string | null;
  documentContent: string | null;
  meetingTranscript: string | null;
  showAIPanel: boolean;
  aiPanelWidth: number;
}

// AI-Enhanced action types
type AIEnhancedTeamAction = 
  | TeamAction
  | { type: "TOGGLE_AI_FEATURES"; enabled: boolean }
  | { type: "TOGGLE_AI_FEATURE"; feature: keyof AIEnhancedTeamState['aiFeatures']; enabled: boolean }
  | { type: "SET_AI_SUGGESTIONS"; suggestions: AICopilotSuggestion[] }
  | { type: "ADD_AI_SUGGESTION"; suggestion: AICopilotSuggestion }
  | { type: "SET_DOCUMENT_ANALYSIS"; documentId: string; analysis: DocumentAnalysisResult }
  | { type: "SET_MEETING_ANALYSIS"; meetingId: string; analysis: MeetingAnalysis }
  | { type: "SET_TEAM_METRICS"; metrics: TeamPerformanceMetrics }
  | { type: "SET_WORKFLOW_PATTERNS"; patterns: WorkflowPattern[] }
  | { type: "UPDATE_AI_USAGE"; usage: Partial<AIEnhancedTeamState['aiUsage']> }
  | { type: "START_SESSION"; sessionId: string; type: 'document' | 'meeting' | 'collaboration'; contextId: string }
  | { type: "END_SESSION" }
  | { type: "SELECT_DOCUMENT"; documentId: string | null }
  | { type: "SELECT_MEETING"; meetingId: string | null }
  | { type: "SET_DOCUMENT_CONTENT"; content: string | null }
  | { type: "SET_MEETING_TRANSCRIPT"; transcript: string | null }
  | { type: "TOGGLE_AI_PANEL"; show?: boolean }
  | { type: "SET_AI_PANEL_WIDTH"; width: number }
  | { type: "APPLY_AI_SUGGESTION"; suggestionId: string; status: 'accepted' | 'rejected' | 'modified' }
  | { type: "ADD_ACTION_ITEM"; actionItem: ActionItem }
  | { type: "UPDATE_ACTION_ITEM"; actionItemId: string; updates: Partial<ActionItem> };

// Import AI types from smart-collaboration-ai
import type { 
  AICopilotSuggestion, 
  DocumentAnalysisResult,
  MeetingAnalysis,
  TeamPerformanceMetrics,
  WorkflowPattern,
  ActionItem,
  SentimentAnalysis
} from '@/lib/ai/smart-collaboration-ai';

// Sample data (extended from team-collaboration-hub.tsx)
const sampleMembers: TeamMember[] = [
  {
    id: "1",
    name: "Sarah Chen",
    email: "sarah@example.com",
    avatar: "/avatars/sarah.jpg",
    title: "Senior Designer",
    company: "Design Studio",
    location: "San Francisco, CA",
    timezone: "PST",
    skills: ["UI/UX", "Branding", "Motion Design"],
    projects: ["Brand Refresh", "Mobile App"],
    availability: 'available'
  },
  {
    id: "2",
    name: "Marcus Rodriguez",
    email: "marcus@example.com",
    avatar: "/avatars/marcus.jpg",
    title: "Frontend Developer",
    company: "Tech Solutions",
    location: "New York, NY",
    timezone: "EST",
    skills: ["React", "TypeScript", "Tailwind CSS"],
    projects: ["Web Platform", "Client Portal"],
    availability: 'busy'
  },
  {
    id: "3",
    name: "Aisha Johnson",
    email: "aisha@example.com",
    avatar: "/avatars/aisha.jpg",
    title: "Project Manager",
    company: "KAZI",
    location: "Chicago, IL",
    timezone: "CST",
    skills: ["Project Management", "Agile", "Client Relations"],
    projects: ["Brand Refresh", "Marketing Campaign"],
    availability: 'available'
  }
]

const sampleProjects: Project[] = [
  {
    id: "1",
    name: "Brand Refresh",
    description: "Complete brand identity update for client",
    status: "active",
    members: ["1", "2", "3"],
    tasks: 24,
    progress: 65,
    dueDate: '2024-03-15'
  },
  {
    id: "2",
    name: "Mobile App",
    description: "Design and development of mobile application",
    status: "active",
    members: ["1"],
    tasks: 18,
    progress: 40,
    dueDate: '2024-04-01'
  }
]

const sampleFiles: FileInfo[] = [
  {
    id: "1",
    name: "Brand Guidelines.pdf",
    type: "document",
    size: 4500000,
    lastModified: "2024-07-15T10:30:00Z",
    owner: "1",
    status: 'latest',
    version: "2.0",
    downloadCount: 15,
    tags: ["branding", "guidelines", "client-approved"],
    cloudStorage: {
      provider: "Dropbox",
      path: "/projects/brand-refresh/",
      syncStatus: 'synced'
    }
  },
  {
    id: "2",
    name: "Homepage Design.psd",
    type: "psd",
    size: 28000000,
    lastModified: "2024-07-18T14:45:00Z",
    owner: "1",
    status: 'draft',
    version: "1.3",
    downloadCount: 8,
    tags: ["website", "design", "homepage"],
    cloudStorage: {
      provider: "Google Drive",
      path: "/designs/homepage/",
      syncStatus: 'synced'
    },
    adobeIntegration: {
      app: "photoshop",
      appType: "photoshop",
      status: 'active',
      lastSync: "2024-07-18T15:00:00Z",
      collaborators: ["1", "2"],
      cloudLink: "https://adobe.com/link/abc123"
    }
  },
  {
    id: "3",
    name: "App Wireframes.fig",
    type: "fig",
    size: 15000000,
    lastModified: "2024-07-20T09:15:00Z",
    owner: "1",
    status: 'latest',
    version: "2.1",
    downloadCount: 12,
    tags: ["mobile", "wireframes", "ux"],
    cloudStorage: {
      provider: "Dropbox",
      path: "/projects/mobile-app/wireframes/",
      syncStatus: 'synced'
    }
  }
]

const sampleCollaborations: Collaboration[] = [
  {
    id: "1",
    name: "Homepage Design Review",
    description: "Collaborative review of homepage design concepts",
    participants: ["1", "2", "3"],
    files: ["2"],
    dueDate: "2024-07-25T16:00:00Z",
    status: 'active',
    adobeSession: {
      app: "photoshop",
      status: 'active',
      active: true
    }
  },
  {
    id: "2",
    name: "Mobile App Planning",
    description: "Planning session for mobile app development",
    participants: ["1", "3"],
    files: ["3"],
    dueDate: "2024-07-22T14:00:00Z",
    status: 'pending'
  }
]

// Sample AI data
const sampleAISuggestions: AICopilotSuggestion[] = [
  {
    id: "sug-1",
    type: AISuggestionType.WORKFLOW_OPTIMIZATION,
    context: {
      type: CollaborationContextType.PROJECT,
      id: "1"
    },
    suggestion: "Consider breaking the logo design task into smaller milestones",
    reasoning: "Based on previous similar projects, the logo design phase often takes longer than expected. Breaking it into concept, refinement, and finalization stages with clear deliverables will improve tracking and feedback cycles.",
    confidence: 0.87,
    alternatives: [
      "Schedule a mid-point review for the logo design task",
      "Allocate additional design resources to the logo task"
    ],
    createdAt: new Date(),
    status: 'pending'
  },
  {
    id: "sug-2",
    type: AISuggestionType.RESOURCE_ALLOCATION,
    context: {
      type: CollaborationContextType.PROJECT,
      id: "1"
    },
    suggestion: "Assign Marcus to support the website implementation tasks",
    reasoning: "Marcus has availability in his schedule and his frontend skills would accelerate the website implementation phase which is currently at risk of delay.",
    confidence: 0.92,
    alternatives: [
      "Bring in an additional frontend developer for 2 weeks",
      "Reschedule the website implementation phase"
    ],
    createdAt: new Date(),
    status: 'pending'
  },
  {
    id: "sug-3",
    type: AISuggestionType.TASK_PRIORITIZATION,
    context: {
      type: CollaborationContextType.PROJECT,
      id: "2"
    },
    suggestion: "Prioritize the user authentication flow implementation",
    reasoning: "Several dependent tasks are waiting on the authentication system. Completing this first will unblock multiple team members and prevent cascading delays.",
    confidence: 0.89,
    alternatives: [
      "Work on authentication and dashboard in parallel",
      "Use a temporary auth solution while building the permanent one"
    ],
    createdAt: new Date(),
    status: 'pending'
  }
]

// Sample document analysis
const sampleDocumentAnalysis: DocumentAnalysisResult = {
  id: "doc-analysis-1",
  documentId: "1",
  documentType: DocumentType.PDF,
  summary: "Comprehensive brand guidelines document detailing logo usage, color palette, typography, and application examples for both print and digital media. Includes sections on brand voice and messaging guidelines.",
  keyInsights: [
    "Primary color palette consists of three main colors with supporting secondary palette",
    "Typography system uses two complementary font families",
    "Logo requires minimum clearspace of 1x height around all sides",
    "Brand voice is described as 'confident, approachable, and expert'"
  ],
  actionItems: [
    {
      id: "ai-1",
      text: "Share updated color codes with development team",
      assignee: "1",
      priority: "high",
      status: "pending",
      source: {
        type: "document",
        id: "1"
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "ai-2",
      text: "License the new typography for web use",
      priority: "medium",
      status: "pending",
      source: {
        type: "document",
        id: "1"
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  tags: ["branding", "guidelines", "design-system", "typography", "color-palette"],
  entities: [
    {
      id: "ent-1",
      text: "Helvetica Neue",
      type: "product",
      relevanceScore: 0.85
    },
    {
      id: "ent-2",
      text: "Pantone 2728 C",
      type: "product",
      relevanceScore: 0.78
    }
  ],
  sentiment: {
    overall: 0.65,
    positive: 0.7,
    negative: 0.05,
    neutral: 0.25,
    emotions: {
      joy: 0.4,
      sadness: 0.05,
      fear: 0.02,
      disgust: 0.01,
      anger: 0.02,
      surprise: 0.1
    }
  },
  readabilityScore: 68,
  wordCount: 4250,
  processingTime: 3200,
  createdAt: new Date(),
  updatedAt: new Date()
}

// Sample meeting analysis
const sampleMeetingAnalysis: MeetingAnalysis = {
  id: "meeting-1",
  meetingId: "m-1",
  transcript: "Sarah: Hi everyone, let's review the homepage design...\nMarcus: I think the navigation could be improved...\nAisha: Let's make sure we're meeting the client's requirements...",
  summary: "The team reviewed the homepage design, focusing on navigation improvements and client requirements. They decided to refine the navigation menu and add more prominent call-to-action buttons.",
  keyPoints: [
    "Navigation needs simplification",
    "Call-to-action buttons should be more prominent",
    "Mobile responsiveness needs improvement",
    "Client prefers a cleaner, more minimal aesthetic"
  ],
  actionItems: [
    {
      id: "mai-1",
      text: "Redesign navigation menu with simpler structure",
      assignee: "1",
      dueDate: new Date("2024-07-25"),
      priority: "high",
      status: "pending",
      source: {
        type: "meeting",
        id: "m-1"
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "mai-2",
      text: "Create mockups with more prominent CTA buttons",
      assignee: "1",
      dueDate: new Date("2024-07-26"),
      priority: "medium",
      status: "pending",
      source: {
        type: "meeting",
        id: "m-1"
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  participantStats: [
    {
      participantId: "1",
      speakingTime: 450,
      sentimentScore: 0.7,
      engagementScore: 0.85
    },
    {
      participantId: "2",
      speakingTime: 380,
      sentimentScore: 0.6,
      engagementScore: 0.75
    },
    {
      participantId: "3",
      speakingTime: 520,
      sentimentScore: 0.8,
      engagementScore: 0.9
    }
  ],
  topics: [
    {
      name: "Navigation Design",
      duration: 540,
      sentimentScore: 0.5
    },
    {
      name: "Call-to-Action Buttons",
      duration: 320,
      sentimentScore: 0.7
    },
    {
      name: "Client Requirements",
      duration: 490,
      sentimentScore: 0.65
    }
  ],
  decisions: [
    "Simplify navigation from 7 items to 5 items",
    "Use larger, more colorful CTA buttons",
    "Schedule follow-up review with client next week"
  ],
  followUpTasks: [
    {
      id: "fut-1",
      text: "Schedule client review meeting",
      assignee: "3",
      dueDate: new Date("2024-07-23"),
      priority: "medium",
      status: "pending",
      source: {
        type: "meeting",
        id: "m-1"
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  duration: 45,
  createdAt: new Date()
}

// Sample team metrics
const sampleTeamMetrics: TeamPerformanceMetrics = {
  teamId: "team-1",
  period: {
    start: new Date("2024-06-01"),
    end: new Date("2024-07-01")
  },
  productivity: {
    tasksCompleted: 87,
    avgCompletionTime: 2.3, // days
    deadlinesMet: 72,
    deadlinesMissed: 15
  },
  collaboration: {
    communicationFrequency: 145, // interactions per week
    responseTime: 2.4, // hours
    documentCollaboration: 34, // collaborative edits
    meetingEffectiveness: 0.78 // score 0-1
  },
  workload: {
    distribution: [
      {
        memberId: "1",
        taskCount: 32,
        utilization: 0.85
      },
      {
        memberId: "2",
        taskCount: 28,
        utilization: 0.75
      },
      {
        memberId: "3",
        taskCount: 27,
        utilization: 0.72
      }
    ],
    balance: 0.88 // 0-1, higher is more balanced
  },
  sentiment: {
    overall: 0.76,
    trend: 'improving'
  }
}

// Sample workflow patterns
const sampleWorkflowPatterns: WorkflowPattern[] = [
  {
    id: "wp-1",
    name: "Design Review Cycle",
    description: "Standard pattern for design reviews including feedback collection and revision cycles",
    frequency: 12,
    avgCompletionTime: 3.5, // days
    successRate: 0.92,
    bottlenecks: [
      {
        taskId: "client-feedback",
        delayFactor: 1.8,
        reason: "Waiting for client feedback"
      }
    ],
    participants: ["1", "2", "3"],
    optimizationSuggestions: [
      "Implement structured feedback form to speed up client responses",
      "Schedule regular feedback sessions in advance"
    ]
  },
  {
    id: "wp-2",
    name: "Development Sprint",
    description: "Two-week development sprint pattern with planning, execution, and review phases",
    frequency: 6,
    avgCompletionTime: 10, // days
    successRate: 0.85,
    bottlenecks: [
      {
        taskId: "qa-testing",
        delayFactor: 1.4,
        reason: "Limited QA resources"
      }
    ],
    participants: ["2", "3"],
    optimizationSuggestions: [
      "Implement automated testing for routine checks",
      "Distribute QA tasks throughout sprint instead of end-loading"
    ]
  }
]

// AI-Enhanced reducer
function aiEnhancedTeamReducer(state: AIEnhancedTeamState, action: AIEnhancedTeamAction): AIEnhancedTeamState {
  switch (action.type) {
    // Original team reducer actions
    case "SET_MEMBERS":
      return { ...state, members: action.members, loading: false }
    case "SET_PROJECTS":
      return { ...state, projects: action.projects, loading: false }
    case "SELECT_MEMBER":
      return { ...state, selectedMember: action.memberId }
    case "SELECT_PROJECT":
      return { ...state, selectedProject: action.projectId }
    case "SET_FILTER":
      return { ...state, filter: action.filter }
    case "SET_SEARCH":
      return { ...state, search: action.search }
    case "SET_LOADING":
      return { ...state, loading: action.loading }
    case "SET_ERROR":
      return { ...state, error: action.error, loading: false }
    case "SET_CURRENT_VIEW":
      return { ...state, currentView: action.view }
    case "SET_FILE_MODAL":
      return { ...state, showFileModal: action.show }
    case "SET_COLLABORATION_MODAL":
      return { ...state, showCollaborationModal: action.show }
    case "SET_MEMBER_MODAL":
      return { ...state, showMemberModal: action.show }
    case "SET_FILE_TYPE_FILTER":
      return { ...state, fileTypeFilter: action.fileType }
      
    // AI-Enhanced actions
    case "TOGGLE_AI_FEATURES":
      return { 
        ...state, 
        aiFeatures: { 
          ...state.aiFeatures, 
          enabled: action.enabled 
        } 
      }
    case "TOGGLE_AI_FEATURE":
      return { 
        ...state, 
        aiFeatures: { 
          ...state.aiFeatures, 
          [action.feature]: action.enabled 
        } 
      }
    case "SET_AI_SUGGESTIONS":
      return { 
        ...state, 
        aiInsights: { 
          ...state.aiInsights, 
          suggestions: action.suggestions 
        } 
      }
    case "ADD_AI_SUGGESTION":
      return { 
        ...state, 
        aiInsights: { 
          ...state.aiInsights, 
          suggestions: [...state.aiInsights.suggestions, action.suggestion] 
        } 
      }
    case "SET_DOCUMENT_ANALYSIS":
      return { 
        ...state, 
        aiInsights: { 
          ...state.aiInsights, 
          documentAnalyses: { 
            ...state.aiInsights.documentAnalyses, 
            [action.documentId]: action.analysis 
          } 
        } 
      }
    case "SET_MEETING_ANALYSIS":
      return { 
        ...state, 
        aiInsights: { 
          ...state.aiInsights, 
          meetingAnalyses: { 
            ...state.aiInsights.meetingAnalyses, 
            [action.meetingId]: action.analysis 
          } 
        } 
      }
    case "SET_TEAM_METRICS":
      return { 
        ...state, 
        aiInsights: { 
          ...state.aiInsights, 
          teamMetrics: action.metrics 
        } 
      }
    case "SET_WORKFLOW_PATTERNS":
      return { 
        ...state, 
        aiInsights: { 
          ...state.aiInsights, 
          workflowPatterns: action.patterns 
        } 
      }
    case "UPDATE_AI_USAGE":
      return { 
        ...state, 
        aiUsage: { 
          ...state.aiUsage, 
          ...action.usage 
        } 
      }
    case "START_SESSION":
      return { 
        ...state, 
        activeSession: { 
          id: action.sessionId, 
          type: action.type, 
          contextId: action.contextId 
        } 
      }
    case "END_SESSION":
      return { 
        ...state, 
        activeSession: { 
          id: null, 
          type: null, 
          contextId: null 
        } 
      }
    case "SELECT_DOCUMENT":
      return { ...state, selectedDocument: action.documentId }
    case "SELECT_MEETING":
      return { ...state, selectedMeeting: action.meetingId }
    case "SET_DOCUMENT_CONTENT":
      return { ...state, documentContent: action.content }
    case "SET_MEETING_TRANSCRIPT":
      return { ...state, meetingTranscript: action.transcript }
    case "TOGGLE_AI_PANEL":
      return { 
        ...state, 
        showAIPanel: action.show !== undefined ? action.show : !state.showAIPanel 
      }
    case "SET_AI_PANEL_WIDTH":
      return { ...state, aiPanelWidth: action.width }
    case "APPLY_AI_SUGGESTION":
      return {
        ...state,
        aiInsights: {
          ...state.aiInsights,
          suggestions: state.aiInsights.suggestions.map(suggestion =>
            suggestion.id === action.suggestionId
              ? { ...suggestion, status: action.status }
              : suggestion
          )
        }
      }
    case "ADD_ACTION_ITEM":
      // Find which analysis to update
      if (action.actionItem.source.type === 'document' && state.aiInsights.documentAnalyses[action.actionItem.source.id]) {
        return {
          ...state,
          aiInsights: {
            ...state.aiInsights,
            documentAnalyses: {
              ...state.aiInsights.documentAnalyses,
              [action.actionItem.source.id]: {
                ...state.aiInsights.documentAnalyses[action.actionItem.source.id],
                actionItems: [
                  ...state.aiInsights.documentAnalyses[action.actionItem.source.id].actionItems,
                  action.actionItem
                ]
              }
            }
          }
        }
      } else if (action.actionItem.source.type === 'meeting' && state.aiInsights.meetingAnalyses[action.actionItem.source.id]) {
        return {
          ...state,
          aiInsights: {
            ...state.aiInsights,
            meetingAnalyses: {
              ...state.aiInsights.meetingAnalyses,
              [action.actionItem.source.id]: {
                ...state.aiInsights.meetingAnalyses[action.actionItem.source.id],
                actionItems: [
                  ...state.aiInsights.meetingAnalyses[action.actionItem.source.id].actionItems,
                  action.actionItem
                ]
              }
            }
          }
        }
      }
      return state
    case "UPDATE_ACTION_ITEM":
      // Find which analysis to update
      const sourceType = state.aiInsights.documentAnalyses[action.actionItemId.split('-')[0]] ? 'document' : 'meeting';
      const sourceId = action.actionItemId.split('-')[0];
      
      if (sourceType === 'document' && state.aiInsights.documentAnalyses[sourceId]) {
        return {
          ...state,
          aiInsights: {
            ...state.aiInsights,
            documentAnalyses: {
              ...state.aiInsights.documentAnalyses,
              [sourceId]: {
                ...state.aiInsights.documentAnalyses[sourceId],
                actionItems: state.aiInsights.documentAnalyses[sourceId].actionItems.map(item =>
                  item.id === action.actionItemId ? { ...item, ...action.updates } : item
                )
              }
            }
          }
        }
      } else if (sourceType === 'meeting' && state.aiInsights.meetingAnalyses[sourceId]) {
        return {
          ...state,
          aiInsights: {
            ...state.aiInsights,
            meetingAnalyses: {
              ...state.aiInsights.meetingAnalyses,
              [sourceId]: {
                ...state.aiInsights.meetingAnalyses[sourceId],
                actionItems: state.aiInsights.meetingAnalyses[sourceId].actionItems.map(item =>
                  item.id === action.actionItemId ? { ...item, ...action.updates } : item
                )
              }
            }
          }
        }
      }
      return state
    default:
      return state
  }
}

// Initial AI-enhanced state
const initialAIEnhancedState: AIEnhancedTeamState = {
  // Original team state
  members: sampleMembers,
  projects: sampleProjects,
  selectedMember: null,
  selectedProject: null,
  filter: 'all',
  search: '',
  loading: false,
  error: null,
  currentView: 'team',
  showFileModal: false,
  showCollaborationModal: false,
  showMemberModal: false,
  fileTypeFilter: 'all',
  files: sampleFiles,
  collaborations: sampleCollaborations,
  
  // AI-enhanced state
  aiFeatures: {
    enabled: true,
    copilot: true,
    documentIntelligence: true,
    meetingFeatures: true,
    collaborationIntelligence: true,
    realTimeFeatures: true
  },
  aiInsights: {
    suggestions: sampleAISuggestions,
    documentAnalyses: {
      "1": sampleDocumentAnalysis
    },
    meetingAnalyses: {
      "m-1": sampleMeetingAnalysis
    },
    teamMetrics: sampleTeamMetrics,
    workflowPatterns: sampleWorkflowPatterns
  },
  aiUsage: {
    tokensUsed: 24500,
    totalCost: 0.52,
    byFeature: {
      "ai_copilot": { tokens: 8200, cost: 0.18 },
      "document_processing": { tokens: 6300, cost: 0.14 },
      "collaboration_intelligence": { tokens: 5500, cost: 0.11 },
      "real_time_features": { tokens: 4500, cost: 0.09 }
    }
  },
  activeSession: {
    id: null,
    type: null,
    contextId: null
  },
  selectedDocument: null,
  selectedMeeting: null,
  documentContent: null,
  meetingTranscript: null,
  showAIPanel: true,
  aiPanelWidth: 320
}

export function TeamCollaborationAIEnhanced() {
  const [state, dispatch] = useReducer(aiEnhancedTeamReducer, initialAIEnhancedState);
  const [newMember, setNewMember] = useState<any>({ name: '', email: '', title: '' });
  const [isAIInitialized, setIsAIInitialized] = useState(false);
  const smartCollabAI = useRef<SmartCollaborationAI | null>(null);
  const aiPanelRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(320);
  const [activeMeeting, setActiveMeeting] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showCostWarning, setShowCostWarning] = useState(false);
  
  // Team stats (extended from original)
  const teamStats: TeamStats = {
    totalMembers: state.members.length,
    activeProjects: state.projects.filter(p => p.status === 'active').length,
    completedProjects: state.projects.filter(p => p.status === 'completed').length,
    averageRating: state.members.reduce((sum, m) => sum + m.skills.length, 0) / state.members.length,
    totalHours: 2500, // This would come from a real tracking system
    totalRevenue: 125000, // This would come from a real financial system
    onlineMembers: state.members.filter(m => m.availability === 'available').length,
    totalFiles: state.files.length,
    activeCollaborations: state.projects.filter(p => p.status === 'active').length
  }

  // Initialize AI system
  useEffect(() => {
    const initAI = async () => {
      if (!isAIInitialized) {
        try {
          // Get singleton instance
          smartCollabAI.current = SmartCollaborationAI.getInstance();
          
          // Initialize the system
          await smartCollabAI.current.initialize();
          
          // Subscribe to AI suggestions
          const subscription = smartCollabAI.current.getSuggestions().subscribe(suggestion => {
            dispatch({ type: "ADD_AI_SUGGESTION", suggestion });
          });
          
          setIsAIInitialized(true);
          
          // Cleanup subscription
          return () => {
            subscription.unsubscribe();
          };
        } catch (error) {
          console.error("Failed to initialize AI system:", error);
        }
      }
    };
    
    initAI();
  }, [isAIInitialized]);
  
  // Panel resizing handlers
  const startResizing = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsResizing(true);
    setStartX(e.clientX);
    setStartWidth(state.aiPanelWidth);
  };
  
  const stopResizing = () => {
    setIsResizing(false);
  };
  
  const resize = (e: MouseEvent) => {
    if (isResizing) {
      const newWidth = Math.max(280, Math.min(600, startWidth - (e.clientX - startX)));
      dispatch({ type: "SET_AI_PANEL_WIDTH", width: newWidth });
    }
  };
  
  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    }
    
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, startX, startWidth]);
  
  // Get status color (from original component)
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500'
      case 'completed':
        return 'bg-blue-500'
      case 'archived':
        return 'bg-gray-500'
      default:
        return 'bg-gray-500'
    }
  }

  // Get file type icon (from original component)
  const getFileTypeIcon = (type: string) => {
    const icons = {
      psd: Palette,
      ai: Palette,
      indd: FileText,
      xd: Layers,
      fig: Layers,
      sketch: Layers,
      image: ImageIcon,
      video: Film,
      document: FileText,
      code: Code
    }
    const IconComponent = icons[type as keyof typeof icons] || FileText
    return <IconComponent className="h-4 w-4" />
  }

  // Get Adobe app icon (from original component)
  const getAdobeAppIcon = (app: string) => {
    const icons = {
      photoshop: { name: 'Ps', color: '#31A8FF' },
      illustrator: { name: 'Ai', color: '#FF9A00' },
      indesign: { name: 'Id', color: '#FF3366' },
      xd: { name: 'Xd', color: '#FF61F6' },
      'after-effects': { name: 'Ae', color: '#9999FF' },
      premiere: { name: 'Pr', color: '#9999FF' }
    }
    const appInfo = icons[app as keyof typeof icons] || { name: 'Cc', color: '#DA1F26' }
    return (
      <div 
        className="w-6 h-6 rounded text-white text-xs font-bold flex items-center justify-center"
        style={{ backgroundColor: appInfo.color }}
      >
        {appInfo.name}
      </div>
    )
  }

  // Format file size (from original component)
  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }
  
  // AI-specific helper functions
  const getSuggestionTypeIcon = (type: AISuggestionType) => {
    switch (type) {
      case AISuggestionType.WORKFLOW_OPTIMIZATION:
        return <Activity className="h-4 w-4" />
      case AISuggestionType.RESOURCE_ALLOCATION:
        return <Users className="h-4 w-4" />
      case AISuggestionType.CONTENT_IMPROVEMENT:
        return <FileText className="h-4 w-4" />
      case AISuggestionType.TASK_PRIORITIZATION:
        return <CheckCircle className="h-4 w-4" />
      case AISuggestionType.MEETING_SCHEDULING:
        return <Calendar className="h-4 w-4" />
      case AISuggestionType.TEAM_FORMATION:
        return <UserPlus className="h-4 w-4" />
      case AISuggestionType.CONFLICT_RESOLUTION:
        return <AlertCircle className="h-4 w-4" />
      case AISuggestionType.SKILL_RECOMMENDATION:
        return <Award className="h-4 w-4" />
      default:
        return <Lightbulb className="h-4 w-4" />
    }
  }
  
  const getSuggestionTypeLabel = (type: AISuggestionType) => {
    switch (type) {
      case AISuggestionType.WORKFLOW_OPTIMIZATION:
        return "Workflow"
      case AISuggestionType.RESOURCE_ALLOCATION:
        return "Resources"
      case AISuggestionType.CONTENT_IMPROVEMENT:
        return "Content"
      case AISuggestionType.TASK_PRIORITIZATION:
        return "Tasks"
      case AISuggestionType.MEETING_SCHEDULING:
        return "Meetings"
      case AISuggestionType.TEAM_FORMATION:
        return "Team"
      case AISuggestionType.CONFLICT_RESOLUTION:
        return "Conflicts"
      case AISuggestionType.SKILL_RECOMMENDATION:
        return "Skills"
      default:
        return "Suggestion"
    }
  }
  
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "text-green-600"
    if (confidence >= 0.7) return "text-blue-600"
    if (confidence >= 0.5) return "text-yellow-600"
    return "text-orange-600"
  }
  
  const formatConfidence = (confidence: number) => {
    return `${Math.round(confidence * 100)}%`
  }
  
  const getSentimentColor = (score: number) => {
    if (score >= 0.7) return "text-green-600"
    if (score >= 0.4) return "text-blue-600"
    if (score >= 0) return "text-yellow-600"
    if (score >= -0.4) return "text-orange-600"
    return "text-red-600"
  }
  
  const formatCost = (cost: number) => {
    return `$${cost.toFixed(3)}`
  }
  
  const formatTokens = (tokens: number) => {
    return tokens >= 1000 ? `${(tokens / 1000).toFixed(1)}k` : tokens.toString()
  }
  
  // AI Feature handlers
  const handleProcessDocument = async (documentId: string) => {
    if (!smartCollabAI.current || !isAIInitialized) return;
    
    try {
      dispatch({ type: "SET_LOADING", loading: true });
      dispatch({ type: "SELECT_DOCUMENT", documentId });
      
      // Find document in files
      const document = state.files.find(f => f.id === documentId);
      if (!document) {
        throw new Error("Document not found");
      }
      
      // In a real implementation, we would fetch the document content
      // For this demo, we'll use placeholder content
      const documentContent = `This is the content of ${document.name}. It would contain the actual text of the document in a real implementation.`;
      dispatch({ type: "SET_DOCUMENT_CONTENT", content: documentContent });
      
      // Process document with AI
      const documentType = document.type === "document" ? DocumentType.TEXT : 
                          document.type === "psd" ? DocumentType.ADOBE_PSD :
                          document.type === "ai" ? DocumentType.ADOBE_AI :
                          document.type === "fig" ? DocumentType.FIGMA :
                          DocumentType.TEXT;
      
      const analysis = await smartCollabAI.current.processDocument(
        documentId,
        documentType,
        documentContent
      );
      
      // Update state with analysis
      dispatch({ type: "SET_DOCUMENT_ANALYSIS", documentId, analysis });
      
      // Update AI usage
      dispatch({ 
        type: "UPDATE_AI_USAGE", 
        usage: {
          tokensUsed: state.aiUsage.tokensUsed + 1000,
          totalCost: state.aiUsage.totalCost + 0.02,
          byFeature: {
            ...state.aiUsage.byFeature,
            document_processing: {
              tokens: (state.aiUsage.byFeature.document_processing?.tokens || 0) + 1000,
              cost: (state.aiUsage.byFeature.document_processing?.cost || 0) + 0.02
            }
          }
        }
      });
      
      // Show AI panel
      dispatch({ type: "TOGGLE_AI_PANEL", show: true });
      
      dispatch({ type: "SET_LOADING", loading: false });
    } catch (error) {
      console.error("Error processing document:", error);
      dispatch({ type: "SET_ERROR", error: "Failed to process document" });
    }
  }
  
  const handleStartMeeting = async () => {
    if (!smartCollabAI.current || !isAIInitialized) return;
    
    try {
      const meetingId = `meeting-${Date.now()}`;
      setActiveMeeting(meetingId);
      setIsRecording(true);
      
      // Start meeting analysis
      const sessionId = `session-${Date.now()}`;
      dispatch({ 
        type: "START_SESSION", 
        sessionId, 
        type: 'meeting', 
        contextId: meetingId 
      });
      
      // Subscribe to meeting analysis
      smartCollabAI.current.startMeetingAnalysis(meetingId, {
        participants: state.members.map(m => m.id),
        realTimeTranscription: true,
        generateSummary: true,
        extractActionItems: true
      }).subscribe(event => {
        // In a real implementation, we would handle real-time events
        console.log("Meeting event:", event);
      });
      
      // Show AI panel
      dispatch({ type: "TOGGLE_AI_PANEL", show: true });
      
      // Update AI usage (initial cost)
      dispatch({ 
        type: "UPDATE_AI_USAGE", 
        usage: {
          tokensUsed: state.aiUsage.tokensUsed + 500,
          totalCost: state.aiUsage.totalCost + 0.01,
          byFeature: {
            ...state.aiUsage.byFeature,
            real_time_features: {
              tokens: (state.aiUsage.byFeature.real_time_features?.tokens || 0) + 500,
              cost: (state.aiUsage.byFeature.real_time_features?.cost || 0) + 0.01
            }
          }
        }
      });
    } catch (error) {
      console.error("Error starting meeting:", error);
      dispatch({ type: "SET_ERROR", error: "Failed to start meeting" });
    }
  }
  
  const handleEndMeeting = async () => {
    if (!smartCollabAI.current || !isAIInitialized || !activeMeeting) return;
    
    try {
      setIsRecording(false);
      
      // End meeting analysis
      const analysis = await smartCollabAI.current.endMeetingAnalysis(activeMeeting);
      
      if (analysis) {
        // Update state with analysis
        dispatch({ type: "SET_MEETING_ANALYSIS", meetingId: activeMeeting, analysis });
        dispatch({ type: "SELECT_MEETING", meetingId: activeMeeting });
        dispatch({ type: "SET_MEETING_TRANSCRIPT", transcript: analysis.transcript });
      }
      
      // End session
      dispatch({ type: "END_SESSION" });
      
      // Update AI usage
      dispatch({ 
        type: "UPDATE_AI_USAGE", 
        usage: {
          tokensUsed: state.aiUsage.tokensUsed + 2000,
          totalCost: state.aiUsage.totalCost + 0.04,
          byFeature: {
            ...state.aiUsage.byFeature,
            real_time_features: {
              tokens: (state.aiUsage.byFeature.real_time_features?.tokens || 0) + 2000,
              cost: (state.aiUsage.byFeature.real_time_features?.cost || 0) + 0.04
            }
          }
        }
      });
      
      setActiveMeeting(null);
    } catch (error) {
      console.error("Error ending meeting:", error);
      dispatch({ type: "SET_ERROR", error: "Failed to end meeting" });
    }
  }
  
  const handleGenerateWorkflowRecommendations = async (projectId: string, teamId: string = "team-1") => {
    if (!smartCollabAI.current || !isAIInitialized) return;
    
    try {
      dispatch({ type: "SET_LOADING", loading: true });
      
      // Generate workflow recommendations
      const suggestions = await smartCollabAI.current.generateWorkflowRecommendations(projectId, teamId);
      
      // Update state with suggestions
      suggestions.forEach(suggestion => {
        dispatch({ type: "ADD_AI_SUGGESTION", suggestion });
      });
      
      // Update AI usage
      dispatch({ 
        type: "UPDATE_AI_USAGE", 
        usage: {
          tokensUsed: state.aiUsage.tokensUsed + 1500,
          totalCost: state.aiUsage.totalCost + 0.03,
          byFeature: {
            ...state.aiUsage.byFeature,
            ai_copilot: {
              tokens: (state.aiUsage.byFeature.ai_copilot?.tokens || 0) + 1500,
              cost: (state.aiUsage.byFeature.ai_copilot?.cost || 0) + 0.03
            }
          }
        }
      });
      
      // Show AI panel
      dispatch({ type: "TOGGLE_AI_PANEL", show: true });
      
      dispatch({ type: "SET_LOADING", loading: false });
    } catch (error) {
      console.error("Error generating workflow recommendations:", error);
      dispatch({ type: "SET_ERROR", error: "Failed to generate workflow recommendations" });
    }
  }
  
  const handleOptimizeResourceAllocation = async (projectId: string, teamId: string = "team-1") => {
    if (!smartCollabAI.current || !isAIInitialized) return;
    
    try {
      dispatch({ type: "SET_LOADING", loading: true });
      
      // Get project tasks (in a real implementation, we would fetch these)
      const tasks = [
        { id: "task-1", name: "Design homepage", assignee: "1", status: "in-progress", priority: "high", complexity: 2 },
        { id: "task-2", name: "Implement authentication", assignee: "2", status: "pending", priority: "high", complexity: 3 },
        { id: "task-3", name: "Create content strategy", assignee: "3", status: "pending", priority: "medium", complexity: 2 }
      ];
      
      // Optimize resource allocation
      const suggestions = await smartCollabAI.current.optimizeResourceAllocation(projectId, teamId, tasks);
      
      // Update state with suggestions
      suggestions.forEach(suggestion => {
        dispatch({ type: "ADD_AI_SUGGESTION", suggestion });
      });
      
      // Update AI usage
      dispatch({ 
        type: "UPDATE_AI_USAGE", 
        usage: {
          tokensUsed: state.aiUsage.tokensUsed + 1800,
          totalCost: state.aiUsage.totalCost + 0.035,
          byFeature: {
            ...state.aiUsage.byFeature,
            collaboration_intelligence: {
              tokens: (state.aiUsage.byFeature.collaboration_intelligence?.tokens || 0) + 1800,
              cost: (state.aiUsage.byFeature.collaboration_intelligence?.cost || 0) + 0.035
            }
          }
        }
      });
      
      // Show AI panel
      dispatch({ type: "TOGGLE_AI_PANEL", show: true });
      
      dispatch({ type: "SET_LOADING", loading: false });
    } catch (error) {
      console.error("Error optimizing resource allocation:", error);
      dispatch({ type: "SET_ERROR", error: "Failed to optimize resource allocation" });
    }
  }
  
  const handleApplySuggestion = (suggestionId: string, status: 'accepted' | 'rejected' | 'modified') => {
    dispatch({ type: "APPLY_AI_SUGGESTION", suggestionId, status });
    
    // In a real implementation, we would apply the suggestion to the relevant context
    // For example, if it's a resource allocation suggestion, we would update task assignments
  }
  
  const handleAddActionItem = (sourceType: 'document' | 'meeting', sourceId: string, text: string) => {
    const actionItem: ActionItem = {
      id: `${sourceId}-action-${Date.now()}`,
      text,
      priority: 'medium',
      status: 'pending',
      source: {
        type: sourceType,
        id: sourceId
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    dispatch({ type: "ADD_ACTION_ITEM", actionItem });
  }
  
  const handleUpdateActionItem = (actionItemId: string, updates: Partial<ActionItem>) => {
    dispatch({ type: "UPDATE_ACTION_ITEM", actionItemId, updates });
  }
  
  // Check if AI cost is getting high
  useEffect(() => {
    if (state.aiUsage.totalCost > 5 && !showCostWarning) {
      setShowCostWarning(true);
    }
  }, [state.aiUsage.totalCost]);
  
  // AI panel component
  const AISidePanel = () => (
    <div 
      className={`fixed right-0 top-0 h-full bg-white border-l border-slate-200 shadow-lg transition-all duration-300 z-10 flex flex-col ${state.showAIPanel ? 'translate-x-0' : 'translate-x-full'}`}
      style={{ width: `${state.aiPanelWidth}px` }}
      ref={aiPanelRef}
    >
      {/* Resize handle */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-blue-500 group"
        onMouseDown={startResizing}
      >
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-16 bg-slate-300 group-hover:bg-blue-500"></div>
      </div>
      
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-blue-50">
        <div className="flex items-center">
          <Brain className="h-5 w-5 text-indigo-600 mr-2" />
          <h3 className="font-semibold text-slate-800">AI Collaboration Assistant</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={() => dispatch({ type: "TOGGLE_AI_PANEL" })}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Content */}
      <Tabs defaultValue="suggestions" className="flex-1 overflow-hidden flex flex-col">
        <TabsList className="px-4 pt-2 justify-start border-b border-slate-100 w-full">
          <TabsTrigger value="suggestions" className="data-[state=active]:bg-indigo-50">
            <Sparkles className="h-4 w-4 mr-1" />
            Suggestions
          </TabsTrigger>
          <TabsTrigger value="insights" className="data-[state=active]:bg-indigo-50">
            <LineChart className="h-4 w-4 mr-1" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-indigo-50">
            <FileText className="h-4 w-4 mr-1" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="meetings" className="data-[state=active]:bg-indigo-50">
            <Video className="h-4 w-4 mr-1" />
            Meetings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="suggestions" className="flex-1 overflow-auto p-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-slate-700">AI Suggestions</h4>
                <Badge variant="outline" className="font-normal">
                  {state.aiInsights.suggestions.filter(s => s.status === 'pending').length} new
                </Badge>
              </div>
              
              {state.aiInsights.suggestions.length === 0 ? (
                <div className="text-center py-8">
                  <Lightbulb className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">No suggestions yet</p>
                  <p className="text-slate-400 text-xs mt-1">
                    AI will provide suggestions as you work
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {state.aiInsights.suggestions
                    .sort((a, b) => {
                      // Sort by status (pending first) then by confidence
                      if (a.status === 'pending' && b.status !== 'pending') return -1;
                      if (a.status !== 'pending' && b.status === 'pending') return 1;
                      return b.confidence - a.confidence;
                    })
                    .map(suggestion => (
                      <Card key={suggestion.id} className={`
                        border-l-4 shadow-sm
                        ${suggestion.status === 'pending' ? 'border-l-blue-500' : 
                          suggestion.status === 'accepted' ? 'border-l-green-500' : 
                          suggestion.status === 'rejected' ? 'border-l-red-500' : 
                          'border-l-yellow-500'}
                      `}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="bg-slate-100 rounded-full p-2 mt-1">
                              {getSuggestionTypeIcon(suggestion.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <Badge variant="outline" className="font-normal text-xs">
                                  {getSuggestionTypeLabel(suggestion.type)}
                                </Badge>
                                <span className={`text-xs font-medium ${getConfidenceColor(suggestion.confidence)}`}>
                                  {formatConfidence(suggestion.confidence)}
                                </span>
                              </div>
                              <p className="text-sm font-medium mt-1 text-slate-800">{suggestion.suggestion}</p>
                              <p className="text-xs text-slate-500 mt-1">{suggestion.reasoning}</p>
                              
                              {suggestion.status === 'pending' && (
                                <div className="flex items-center gap-2 mt-3">
                                  <Button 
                                    size="sm" 
                                    className="h-7 text-xs bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
                                    onClick={() => handleApplySuggestion(suggestion.id, 'accepted')}
                                  >
                                    Apply
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="h-7 text-xs"
                                    onClick={() => handleApplySuggestion(suggestion.id, 'modified')}
                                  >
                                    Modify
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleApplySuggestion(suggestion.id, 'rejected')}
                                  >
                                    Dismiss
                                  </Button>
                                </div>
                              )}
                              
                              {suggestion.status !== 'pending' && (
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge className={`
                                    text-xs
                                    ${suggestion.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                                      suggestion.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                                      'bg-yellow-100 text-yellow-800'}
                                  `}>
                                    {suggestion.status === 'accepted' ? 'Applied' : 
                                      suggestion.status === 'rejected' ? 'Dismissed' : 
                                      'Modified'}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="insights" className="flex-1 overflow-auto p-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-6">
              {/* Team Performance */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Team Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {state.aiInsights.teamMetrics ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-xs text-slate-500">Tasks Completed</p>
                          <p className="text-lg font-semibold">{state.aiInsights.teamMetrics.productivity.tasksCompleted}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-slate-500">Avg. Completion Time</p>
                          <p className="text-lg font-semibold">{state.aiInsights.teamMetrics.productivity.avgCompletionTime} days</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-slate-500">Deadlines Met</p>
                          <div className="flex items-end gap-2">
                            <p className="text-lg font-semibold">{state.aiInsights.teamMetrics.productivity.deadlinesMet}</p>
                            <p className="text-xs text-slate-500">of {state.aiInsights.teamMetrics.productivity.deadlinesMet + state.aiInsights.teamMetrics.productivity.deadlinesMissed}</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-slate-500">Team Sentiment</p>
                          <div className="flex items-center gap-2">
                            <p className={`text-lg font-semibold ${getSentimentColor(state.aiInsights.teamMetrics.sentiment.overall)}`}>
                              {(state.aiInsights.teamMetrics.sentiment.overall * 100).toFixed(0)}%
                            </p>
                            <Badge variant="outline" className="font-normal text-xs">
                              {state.aiInsights.teamMetrics.sentiment.trend}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-xs text-slate-500">Workload Balance</p>
                        <Progress value={state.aiInsights.teamMetrics.workload.balance * 100} className="h-2" />
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>Unbalanced</span>
                          <span>Balanced</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-slate-500 text-sm">No team metrics available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Workflow Patterns */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Workflow Patterns</CardTitle>
                </CardHeader>
                <CardContent>
                  {state.aiInsights.workflowPatterns.length > 0 ? (
                    <div className="space-y-4">
                      {state.aiInsights.workflowPatterns.map(pattern => (
                        <div key={pattern.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm">{pattern.name}</p>
                            <Badge variant="outline" className="font-normal text-xs">
                              {pattern.frequency}× used
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500">{pattern.description}</p>
                          <div className="flex items-center justify-between text-xs">
                            <span>Success rate: {(pattern.successRate * 100).toFixed(0)}%</span>
                            <span>Avg time: {pattern.avgCompletionTime} days</span>
                          </div>
                          {pattern.bottlenecks.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-amber-700">Bottlenecks:</p>
                              <ul className="text-xs text-slate-500 list-disc list-inside">
                                {pattern.bottlenecks.map((bottleneck, i) => (
                                  <li key={i}>{bottleneck.reason} ({bottleneck.delayFactor}×)</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-slate-500 text-sm">No workflow patterns detected</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* AI Usage */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">AI Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-500">Total tokens used</p>
                      <p className="font-semibold">{formatTokens(state.aiUsage.tokensUsed)}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-500">Total cost</p>
                      <p className="font-semibold">{formatCost(state.aiUsage.totalCost)}</p>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-xs font-medium">Usage by feature</p>
                      {Object.entries(state.aiUsage.byFeature).map(([feature, usage]) => (
                        <div key={feature} className="flex items-center justify-between text-xs">
                          <p className="capitalize">{feature.replace(/_/g, ' ')}</p>
                          <p>{formatCost(usage.cost)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="documents" className="flex-1 overflow-auto p-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-slate-700">Document Intelligence</h4>
                <Badge variant="outline" className="font-normal">
                  {Object.keys(state.aiInsights.documentAnalyses).length} analyzed
                </Badge>
              </div>
              
              {Object.keys(state.aiInsights.documentAnalyses).length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">No documents analyzed</p>
                  <p className="text-slate-400 text-xs mt-1">
                    Select a document to analyze
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(state.aiInsights.documentAnalyses).map(([documentId, analysis]) => {
                    const document = state.files.find(f => f.id === documentId);
                    
                    return (
                      <Card key={documentId} className="overflow-hidden">
                        <CardHeader className="bg-slate-50 pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getFileTypeIcon(document?.type || 'document')}
                              <CardTitle className="text-base">{document?.name || `Document ${documentId}`}</CardTitle>
                            </div>
                            <Badge variant="outline" className="font-normal text-xs">
                              {analysis.wordCount.toLocaleString()} words
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                          <div>
                            <p className="text-xs font-medium text-slate-500 mb-1">Summary</p>
                            <p className="text-sm">{analysis.summary}</p>
                          </div>
                          
                          <div>
                            <p className="text-xs font-medium text-slate-500 mb-1">Key Insights</p>
                            <ul className="text-sm list-disc list-inside space-y-1">
                              {analysis.keyInsights.map((insight, i) => (
                                <li key={i}>{insight}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs font-medium text-slate-500">Action Items</p>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-6 text-xs">
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Add Action Item</DialogTitle>
                                    <DialogDescription>
                                      Create a new action item from this document.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="action-text">Action Item</Label>
                                      <Textarea 
                                        id="action-text" 
                                        placeholder="Enter action item text"
                                        className="min-h-24"
                                      />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label htmlFor="action-priority">Priority</Label>
                                        <Select defaultValue="medium">
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="action-assignee">Assignee</Label>
                                        <Select>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Unassigned" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {state.members.map(member => (
                                              <SelectItem key={member.id} value={member.id}>
                                                {member.name}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button 
                                      type="submit" 
                                      onClick={() => {
                                        const textElement = document.getElementById('action-text') as HTMLTextAreaElement;
                                        if (textElement && textElement.value) {
                                          handleAddActionItem('document', documentId, textElement.value);
                                        }
                                      }}
                                    >
                                      Add Action Item
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                            
                            <div className="space-y-2">
                              {analysis.actionItems.length === 0 ? (
                                <p className="text-sm text-slate-500 italic">No action items</p>
                              ) : (
                                analysis.actionItems.map(item => (
                                  <div key={item.id} className="flex items-start gap-2 bg-slate-50 p-2 rounded-md">
                                    <Checkbox 
                                      id={`action-${item.id}`}
                                      checked={item.status === 'completed'}
                                      onCheckedChange={(checked) => {
                                        handleUpdateActionItem(item.id, {
                                          status: checked ? 'completed' : 'pending'
                                        });
                                      }}
                                    />
                                    <div className="flex-1">
                                      <label 
                                        htmlFor={`action-${item.id}`}
                                        className={`text-sm ${item.status === 'completed' ? 'line-through text-slate-500' : ''}`}
                                      >
                                        {item.text}
                                      </label>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Badge className={`text-xs ${
                                          item
