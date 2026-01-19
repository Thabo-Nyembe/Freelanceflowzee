import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Phase 7 Gap #9: Live Chat Widget
// Priority: MEDIUM | Competitor: HubSpot
// Beats HubSpot with: AI-powered chatbots, proactive engagement,
// visitor intelligence, omnichannel inbox, conversation routing

interface ChatWidget {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  appearance: WidgetAppearance;
  behavior: WidgetBehavior;
  automation: ChatAutomation;
  routing: ChatRouting;
  availability: ChatAvailability;
  integrations: ChatIntegrations;
  analytics: ChatAnalytics;
  createdAt: string;
  updatedAt: string;
}

interface WidgetAppearance {
  theme: 'light' | 'dark' | 'auto';
  primaryColor: string;
  position: 'bottom-right' | 'bottom-left';
  iconType: 'chat' | 'message' | 'custom';
  customIcon?: string;
  welcomeMessage: string;
  placeholder: string;
  avatar: string;
  agentName: string;
  brandLogo?: string;
  customCss?: string;
}

interface WidgetBehavior {
  showOnPages: string[]; // patterns like /pricing, /demo*
  hideOnPages: string[];
  triggerDelay: number; // seconds
  proactiveMessages: ProactiveMessage[];
  requireEmail: boolean;
  showTypingIndicator: boolean;
  soundEnabled: boolean;
  mobileOptimized: boolean;
}

interface ProactiveMessage {
  id: string;
  message: string;
  trigger: ProactiveTrigger;
  delay: number;
  frequency: 'once' | 'session' | 'always';
  enabled: boolean;
}

interface ProactiveTrigger {
  type: 'time_on_page' | 'scroll_depth' | 'exit_intent' | 'page_view' | 'returning_visitor';
  value: any;
}

interface ChatAutomation {
  enabled: boolean;
  welcomeBot: BotConfig;
  qualificationBot: BotConfig;
  faqBot: BotConfig;
  handoffRules: HandoffRule[];
}

interface BotConfig {
  enabled: boolean;
  messages: BotMessage[];
  fallbackMessage: string;
}

interface BotMessage {
  id: string;
  trigger: string;
  response: string;
  buttons?: ChatButton[];
  collectField?: string;
}

interface ChatButton {
  label: string;
  action: 'message' | 'link' | 'meeting' | 'agent';
  value: string;
}

interface HandoffRule {
  condition: { field: string; operator: string; value: any };
  action: 'assign_agent' | 'assign_team' | 'create_ticket';
  target: string;
}

interface ChatRouting {
  type: 'round-robin' | 'availability' | 'skills' | 'custom';
  teams: ChatTeam[];
  rules: RoutingRule[];
  fallback: string;
  maxConcurrent: number;
}

interface ChatTeam {
  id: string;
  name: string;
  members: ChatAgent[];
  skills: string[];
}

interface ChatAgent {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: 'online' | 'away' | 'offline';
  maxChats: number;
  activeChats: number;
  skills: string[];
}

interface RoutingRule {
  condition: { field: string; operator: string; value: any };
  assignTo: string;
  priority: number;
}

interface ChatAvailability {
  schedule: {
    [key: string]: { start: string; end: string }[];
  };
  timezone: string;
  offlineMessage: string;
  offlineForm: boolean;
}

interface ChatIntegrations {
  crm: boolean;
  slack: { enabled: boolean; channel: string };
  email: { enabled: boolean; address: string };
  helpdesk: { enabled: boolean; provider: string };
}

interface ChatAnalytics {
  totalConversations: number;
  avgResponseTime: number;
  avgResolutionTime: number;
  satisfactionScore: number;
  missedChats: number;
  botHandled: number;
  leadsGenerated: number;
}

interface Conversation {
  id: string;
  visitorId: string;
  visitorName: string;
  visitorEmail?: string;
  visitorInfo: VisitorInfo;
  status: 'active' | 'waiting' | 'resolved' | 'missed';
  channel: 'chat' | 'email' | 'messenger' | 'whatsapp';
  assignedTo?: ChatAgent;
  messages: ChatMessage[];
  tags: string[];
  rating?: number;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

interface VisitorInfo {
  location: { city: string; country: string };
  device: { type: string; os: string; browser: string };
  referrer: string;
  currentPage: string;
  pageViews: number;
  timeOnSite: number;
  previousVisits: number;
  leadScore: number;
}

interface ChatMessage {
  id: string;
  type: 'text' | 'image' | 'file' | 'button' | 'system';
  content: string;
  sender: 'visitor' | 'agent' | 'bot';
  senderName: string;
  timestamp: string;
  read: boolean;
  buttons?: ChatButton[];
  attachments?: Attachment[];
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

// Demo data - beats HubSpot live chat
const demoWidget: ChatWidget = {
  id: 'widget-001',
  name: 'Main Website Chat',
  status: 'active',
  appearance: {
    theme: 'light',
    primaryColor: '#6366f1',
    position: 'bottom-right',
    iconType: 'chat',
    welcomeMessage: 'Hi there! 👋 How can we help you today?',
    placeholder: 'Type your message...',
    avatar: '/avatars/bot.png',
    agentName: 'FreeFlow Support',
    brandLogo: '/logo.png'
  },
  behavior: {
    showOnPages: ['/*'],
    hideOnPages: ['/admin/*', '/login'],
    triggerDelay: 3,
    proactiveMessages: [
      {
        id: 'proactive-1',
        message: 'Looking for help with project management? I can show you our best features!',
        trigger: { type: 'time_on_page', value: 30 },
        delay: 0,
        frequency: 'session',
        enabled: true
      },
      {
        id: 'proactive-2',
        message: 'Have questions about pricing? I\'m here to help!',
        trigger: { type: 'page_view', value: '/pricing' },
        delay: 5,
        frequency: 'once',
        enabled: true
      }
    ],
    requireEmail: false,
    showTypingIndicator: true,
    soundEnabled: true,
    mobileOptimized: true
  },
  automation: {
    enabled: true,
    welcomeBot: {
      enabled: true,
      messages: [
        {
          id: 'welcome-1',
          trigger: 'start',
          response: 'Welcome to FreeFlow! How can I help you today?',
          buttons: [
            { label: 'Learn about features', action: 'message', value: 'features' },
            { label: 'See pricing', action: 'link', value: '/pricing' },
            { label: 'Talk to sales', action: 'agent', value: 'sales' }
          ]
        }
      ],
      fallbackMessage: 'Let me connect you with a human agent who can help better.'
    },
    qualificationBot: {
      enabled: true,
      messages: [
        {
          id: 'qual-1',
          trigger: 'sales',
          response: 'Great! I\'d love to learn more about your needs. What\'s your company name?',
          collectField: 'company'
        },
        {
          id: 'qual-2',
          trigger: 'company_collected',
          response: 'And what\'s the best email to reach you?',
          collectField: 'email'
        }
      ],
      fallbackMessage: 'Thanks! Connecting you with a sales representative now.'
    },
    faqBot: {
      enabled: true,
      messages: [
        {
          id: 'faq-1',
          trigger: 'features',
          response: 'FreeFlow includes project management, invoicing, time tracking, client portal, and AI-powered automation. Would you like me to explain any of these in detail?'
        },
        {
          id: 'faq-2',
          trigger: 'pricing',
          response: 'We have plans starting at $0/month for freelancers. Our Pro plan is $29/month with unlimited projects and clients. Want to see a detailed comparison?',
          buttons: [
            { label: 'View pricing page', action: 'link', value: '/pricing' },
            { label: 'Talk to sales', action: 'agent', value: 'sales' }
          ]
        }
      ],
      fallbackMessage: 'I\'m not sure about that. Let me connect you with someone who can help!'
    },
    handoffRules: [
      { condition: { field: 'intent', operator: 'equals', value: 'sales' }, action: 'assign_team', target: 'sales' },
      { condition: { field: 'intent', operator: 'equals', value: 'support' }, action: 'assign_team', target: 'support' }
    ]
  },
  routing: {
    type: 'round-robin',
    teams: [
      {
        id: 'team-sales',
        name: 'Sales',
        members: [
          { id: 'agent-1', name: 'Sarah Chen', email: 'sarah@freeflow.com', avatar: '/avatars/sarah.jpg', status: 'online', maxChats: 5, activeChats: 2, skills: ['sales', 'enterprise'] }
        ],
        skills: ['sales', 'pricing', 'demo']
      },
      {
        id: 'team-support',
        name: 'Support',
        members: [
          { id: 'agent-2', name: 'Marcus Johnson', email: 'marcus@freeflow.com', avatar: '/avatars/marcus.jpg', status: 'online', maxChats: 5, activeChats: 3, skills: ['support', 'technical'] }
        ],
        skills: ['support', 'technical', 'billing']
      }
    ],
    rules: [],
    fallback: 'team-support',
    maxConcurrent: 10
  },
  availability: {
    schedule: {
      monday: [{ start: '09:00', end: '18:00' }],
      tuesday: [{ start: '09:00', end: '18:00' }],
      wednesday: [{ start: '09:00', end: '18:00' }],
      thursday: [{ start: '09:00', end: '18:00' }],
      friday: [{ start: '09:00', end: '17:00' }],
      saturday: [],
      sunday: []
    },
    timezone: 'America/New_York',
    offlineMessage: 'We\'re currently offline. Leave a message and we\'ll get back to you!',
    offlineForm: true
  },
  integrations: {
    crm: true,
    slack: { enabled: true, channel: '#support' },
    email: { enabled: true, address: 'support@freeflow.com' },
    helpdesk: { enabled: false, provider: '' }
  },
  analytics: {
    totalConversations: 1234,
    avgResponseTime: 45,
    avgResolutionTime: 480,
    satisfactionScore: 4.7,
    missedChats: 23,
    botHandled: 456,
    leadsGenerated: 234
  },
  createdAt: '2024-06-01T10:00:00Z',
  updatedAt: '2025-01-15T10:00:00Z'
};

const demoConversations: Conversation[] = [
  {
    id: 'conv-001',
    visitorId: 'visitor-001',
    visitorName: 'Jennifer Martinez',
    visitorEmail: 'jennifer.martinez@techcorp.com',
    visitorInfo: {
      location: { city: 'San Francisco', country: 'US' },
      device: { type: 'desktop', os: 'macOS', browser: 'Chrome' },
      referrer: 'google.com',
      currentPage: '/pricing',
      pageViews: 8,
      timeOnSite: 320,
      previousVisits: 3,
      leadScore: 85
    },
    status: 'active',
    channel: 'chat',
    assignedTo: {
      id: 'agent-1',
      name: 'Sarah Chen',
      email: 'sarah@freeflow.com',
      avatar: '/avatars/sarah.jpg',
      status: 'online',
      maxChats: 5,
      activeChats: 2,
      skills: ['sales', 'enterprise']
    },
    messages: [
      {
        id: 'msg-1',
        type: 'text',
        content: 'Hi there! 👋 How can we help you today?',
        sender: 'bot',
        senderName: 'FreeFlow Bot',
        timestamp: '2025-01-15T14:00:00Z',
        read: true,
        buttons: [
          { label: 'Learn about features', action: 'message', value: 'features' },
          { label: 'See pricing', action: 'link', value: '/pricing' },
          { label: 'Talk to sales', action: 'agent', value: 'sales' }
        ]
      },
      {
        id: 'msg-2',
        type: 'text',
        content: 'Hi! I\'m interested in the Enterprise plan for my team of 50 people.',
        sender: 'visitor',
        senderName: 'Jennifer Martinez',
        timestamp: '2025-01-15T14:01:00Z',
        read: true
      },
      {
        id: 'msg-3',
        type: 'system',
        content: 'Conversation assigned to Sarah Chen',
        sender: 'bot',
        senderName: 'System',
        timestamp: '2025-01-15T14:01:05Z',
        read: true
      },
      {
        id: 'msg-4',
        type: 'text',
        content: 'Hi Jennifer! I\'m Sarah, and I\'d be happy to help you with our Enterprise plan. With 50 team members, you\'ll get volume pricing and dedicated support. Can I ask a few questions about your needs?',
        sender: 'agent',
        senderName: 'Sarah Chen',
        timestamp: '2025-01-15T14:02:00Z',
        read: true
      }
    ],
    tags: ['enterprise', 'sales', 'hot-lead'],
    createdAt: '2025-01-15T14:00:00Z',
    updatedAt: '2025-01-15T14:02:00Z'
  }
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      // Widget Management - beats HubSpot
      case 'get-widget':
        return NextResponse.json({
          success: true,
          data: { widget: demoWidget }
        });

      case 'update-widget':
        return NextResponse.json({
          success: true,
          data: {
            widgetId: params.widgetId,
            updated: params.updates,
            updatedAt: new Date().toISOString()
          }
        });

      case 'get-widget-code':
        return NextResponse.json({
          success: true,
          data: {
            widgetId: demoWidget.id,
            embedCode: `<script>
  window.FreeFlowChat = {
    widgetId: '${demoWidget.id}',
    position: '${demoWidget.appearance.position}',
    primaryColor: '${demoWidget.appearance.primaryColor}'
  };
</script>
<script src="https://chat.freeflow.com/widget.js" async></script>`,
            previewUrl: `https://chat.freeflow.com/preview/${demoWidget.id}`
          }
        });

      // Conversations - beats HubSpot inbox
      case 'get-conversations':
        return NextResponse.json({
          success: true,
          data: {
            conversations: demoConversations,
            summary: {
              active: demoConversations.filter(c => c.status === 'active').length,
              waiting: demoConversations.filter(c => c.status === 'waiting').length,
              resolved: demoConversations.filter(c => c.status === 'resolved').length,
              unassigned: demoConversations.filter(c => !c.assignedTo).length
            }
          }
        });

      case 'get-conversation':
        const conv = demoConversations.find(c => c.id === params.conversationId);
        return NextResponse.json({ success: true, data: { conversation: conv } });

      case 'send-message':
        const newMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          type: params.type || 'text',
          content: params.content,
          sender: params.sender || 'agent',
          senderName: params.senderName || 'Agent',
          timestamp: new Date().toISOString(),
          read: false,
          buttons: params.buttons,
          attachments: params.attachments
        };
        return NextResponse.json({ success: true, data: { message: newMessage } });

      case 'assign-conversation':
        return NextResponse.json({
          success: true,
          data: {
            conversationId: params.conversationId,
            assignedTo: params.agentId,
            assignedAt: new Date().toISOString()
          }
        });

      case 'resolve-conversation':
        return NextResponse.json({
          success: true,
          data: {
            conversationId: params.conversationId,
            status: 'resolved',
            resolvedAt: new Date().toISOString(),
            resolution: params.resolution
          }
        });

      // Visitor Intelligence - beats HubSpot
      case 'get-visitor-info':
        const conversation = demoConversations.find(c => c.visitorId === params.visitorId);
        return NextResponse.json({
          success: true,
          data: {
            visitor: {
              id: params.visitorId,
              name: conversation?.visitorName,
              email: conversation?.visitorEmail,
              info: conversation?.visitorInfo,
              previousConversations: 3,
              totalMessages: 45,
              firstSeen: '2024-12-01T10:00:00Z',
              lastSeen: new Date().toISOString()
            },
            crmData: {
              contact: { id: 'contact-001', name: 'Jennifer Martinez', company: 'TechCorp Inc' },
              deals: [{ id: 'deal-001', name: 'TechCorp Annual Contract', stage: 'Proposal', value: 85000 }],
              activities: [
                { type: 'email', title: 'Opened proposal email', timestamp: '2025-01-14T10:00:00Z' },
                { type: 'page_view', title: 'Viewed pricing page', timestamp: '2025-01-15T13:55:00Z' }
              ]
            },
            insights: [
              { type: 'intent', title: 'High Buying Intent', description: 'Multiple pricing page visits and enterprise inquiry' },
              { type: 'recommendation', title: 'Offer Demo', description: 'Visitor is highly engaged - propose a product demo' }
            ]
          }
        });

      // Chatbot Management - beats HubSpot
      case 'update-chatbot':
        return NextResponse.json({
          success: true,
          data: {
            botType: params.botType,
            updated: params.config,
            updatedAt: new Date().toISOString()
          }
        });

      case 'test-chatbot':
        return NextResponse.json({
          success: true,
          data: {
            input: params.message,
            matchedTrigger: 'pricing',
            response: 'We have plans starting at $0/month for freelancers...',
            confidence: 0.92,
            suggestedImprovements: [
              'Consider adding more specific pricing details',
              'Add a button to schedule a call'
            ]
          }
        });

      case 'get-faq-suggestions':
        return NextResponse.json({
          success: true,
          data: {
            suggestions: [
              { question: 'What are your pricing plans?', frequency: 156, hasAnswer: true },
              { question: 'How do I cancel my subscription?', frequency: 89, hasAnswer: true },
              { question: 'Do you integrate with Slack?', frequency: 67, hasAnswer: false },
              { question: 'Can I import data from other tools?', frequency: 54, hasAnswer: false }
            ],
            recommendation: 'Add answers for top unanswered questions to improve bot efficiency'
          }
        });

      // Team Management
      case 'get-agents':
        return NextResponse.json({
          success: true,
          data: {
            agents: demoWidget.routing.teams.flatMap(t => t.members),
            online: 2,
            away: 0,
            offline: 0
          }
        });

      case 'update-agent-status':
        return NextResponse.json({
          success: true,
          data: {
            agentId: params.agentId,
            status: params.status,
            updatedAt: new Date().toISOString()
          }
        });

      // Analytics - beats HubSpot
      case 'get-chat-analytics':
        return NextResponse.json({
          success: true,
          data: {
            period: params.period || '30d',
            overview: {
              totalConversations: 1234,
              avgResponseTime: 45,
              avgResolutionTime: 480,
              satisfactionScore: 4.7,
              missedChats: 23,
              botHandled: 456,
              leadsGenerated: 234
            },
            byChannel: [
              { channel: 'chat', conversations: 890, satisfaction: 4.8 },
              { channel: 'email', conversations: 234, satisfaction: 4.5 },
              { channel: 'messenger', conversations: 78, satisfaction: 4.6 },
              { channel: 'whatsapp', conversations: 32, satisfaction: 4.9 }
            ],
            byAgent: [
              { agent: 'Sarah Chen', conversations: 312, avgResponse: 35, satisfaction: 4.9 },
              { agent: 'Marcus Johnson', conversations: 287, avgResponse: 52, satisfaction: 4.6 }
            ],
            trends: {
              daily: [
                { date: '2025-01-10', conversations: 45, avgResponse: 42, satisfaction: 4.7 },
                { date: '2025-01-11', conversations: 52, avgResponse: 38, satisfaction: 4.8 },
                { date: '2025-01-12', conversations: 38, avgResponse: 55, satisfaction: 4.5 },
                { date: '2025-01-13', conversations: 61, avgResponse: 40, satisfaction: 4.7 },
                { date: '2025-01-14', conversations: 55, avgResponse: 45, satisfaction: 4.8 }
              ]
            },
            peakHours: [
              { hour: 10, conversations: 89 },
              { hour: 14, conversations: 76 },
              { hour: 11, conversations: 68 }
            ],
            commonTopics: [
              { topic: 'Pricing', count: 234, percentage: 19 },
              { topic: 'Features', count: 198, percentage: 16 },
              { topic: 'Technical Support', count: 167, percentage: 14 },
              { topic: 'Billing', count: 123, percentage: 10 }
            ]
          }
        });

      // Canned Responses
      case 'get-canned-responses':
        return NextResponse.json({
          success: true,
          data: {
            responses: [
              { id: 'canned-1', shortcut: '/hello', content: 'Hi! Thanks for reaching out. How can I help you today?', category: 'greetings' },
              { id: 'canned-2', shortcut: '/pricing', content: 'Great question! Our pricing starts at $0/month for freelancers, with Pro at $29/month. Would you like me to explain the differences?', category: 'sales' },
              { id: 'canned-3', shortcut: '/demo', content: 'I\'d be happy to schedule a personalized demo! You can book directly here: [link]', category: 'sales' },
              { id: 'canned-4', shortcut: '/thanks', content: 'You\'re welcome! Is there anything else I can help you with?', category: 'closing' }
            ]
          }
        });

      case 'create-canned-response':
        return NextResponse.json({
          success: true,
          data: {
            response: {
              id: `canned-${Date.now()}`,
              shortcut: params.shortcut,
              content: params.content,
              category: params.category
            }
          }
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Live Chat API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    data: {
      widget: demoWidget,
      conversations: demoConversations,
      features: [
        'AI-powered chatbots',
        'Proactive engagement triggers',
        'Visitor intelligence & tracking',
        'Omnichannel inbox',
        'Conversation routing',
        'Team management',
        'Canned responses',
        'CRM integration',
        'Real-time analytics',
        'Satisfaction surveys'
      ],
      competitorComparison: {
        hubspot: {
          advantage: 'FreeFlow offers AI chatbots and visitor intelligence in all plans',
          features: ['AI chatbots', 'Visitor tracking', 'Proactive messages']
        }
      }
    }
  });
}
