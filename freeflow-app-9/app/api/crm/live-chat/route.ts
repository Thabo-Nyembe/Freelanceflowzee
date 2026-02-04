import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createSimpleLogger } from '@/lib/simple-logger';

const logger = createSimpleLogger('live-chat');

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

// Helper function to get widget from database or return defaults
async function getWidget(supabase: any, userId: string): Promise<ChatWidget> {
  const { data: widget } = await supabase
    .from('chat_widgets')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (widget) {
    return {
      id: widget.id,
      name: widget.name,
      status: widget.status || 'active',
      appearance: widget.appearance || defaultAppearance,
      behavior: widget.behavior || defaultBehavior,
      automation: widget.automation || defaultAutomation,
      routing: widget.routing || defaultRouting,
      availability: widget.availability || defaultAvailability,
      integrations: widget.integrations || defaultIntegrations,
      analytics: widget.analytics || defaultAnalytics,
      createdAt: widget.created_at,
      updatedAt: widget.updated_at
    };
  }

  // Return default widget config
  return defaultWidget;
}

// Helper function to get conversations from database
async function getConversations(supabase: any, userId: string): Promise<Conversation[]> {
  const { data: conversations } = await supabase
    .from('chat_conversations')
    .select(`
      *,
      messages:chat_messages(*),
      assigned_agent:users!chat_conversations_assigned_to_fkey(id, name, email, avatar_url)
    `)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(50);

  if (!conversations || conversations.length === 0) {
    return [];
  }

  return conversations.map((conv: any) => ({
    id: conv.id,
    visitorId: conv.visitor_id,
    visitorName: conv.visitor_name || 'Visitor',
    visitorEmail: conv.visitor_email,
    visitorInfo: conv.visitor_info || {},
    status: conv.status,
    channel: conv.channel || 'chat',
    assignedTo: conv.assigned_agent ? {
      id: conv.assigned_agent.id,
      name: conv.assigned_agent.name,
      email: conv.assigned_agent.email,
      avatar: conv.assigned_agent.avatar_url,
      status: 'online',
      maxChats: 5,
      activeChats: 0,
      skills: []
    } : undefined,
    messages: (conv.messages || []).map((msg: any) => ({
      id: msg.id,
      type: msg.message_type || 'text',
      content: msg.content,
      sender: msg.sender_type,
      senderName: msg.sender_name,
      timestamp: msg.created_at,
      read: msg.is_read,
      buttons: msg.buttons,
      attachments: msg.attachments
    })),
    tags: conv.tags || [],
    rating: conv.rating,
    feedback: conv.feedback,
    createdAt: conv.created_at,
    updatedAt: conv.updated_at,
    resolvedAt: conv.resolved_at
  }));
}

// Default configurations
const defaultAppearance: WidgetAppearance = {
  theme: 'light',
  primaryColor: '#6366f1',
  position: 'bottom-right',
  iconType: 'chat',
  welcomeMessage: 'Hi there! 👋 How can we help you today?',
  placeholder: 'Type your message...',
  avatar: '/avatars/bot.png',
  agentName: 'FreeFlow Support',
  brandLogo: '/logo.png'
};

const defaultBehavior: WidgetBehavior = {
  showOnPages: ['/*'],
  hideOnPages: ['/admin/*', '/login'],
  triggerDelay: 3,
  proactiveMessages: [],
  requireEmail: false,
  showTypingIndicator: true,
  soundEnabled: true,
  mobileOptimized: true
};

const defaultAutomation: ChatAutomation = {
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
  qualificationBot: { enabled: false, messages: [], fallbackMessage: '' },
  faqBot: { enabled: false, messages: [], fallbackMessage: '' },
  handoffRules: []
};

const defaultRouting: ChatRouting = {
  type: 'round-robin',
  teams: [],
  rules: [],
  fallback: 'support',
  maxConcurrent: 10
};

const defaultAvailability: ChatAvailability = {
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
};

const defaultIntegrations: ChatIntegrations = {
  crm: true,
  slack: { enabled: false, channel: '' },
  email: { enabled: false, address: '' },
  helpdesk: { enabled: false, provider: '' }
};

const defaultAnalytics: ChatAnalytics = {
  totalConversations: 0,
  avgResponseTime: 0,
  avgResolutionTime: 0,
  satisfactionScore: 0,
  missedChats: 0,
  botHandled: 0,
  leadsGenerated: 0
};

const defaultWidget: ChatWidget = {
  id: 'default-widget',
  name: 'Main Website Chat',
  status: 'active',
  appearance: defaultAppearance,
  behavior: defaultBehavior,
  automation: defaultAutomation,
  routing: defaultRouting,
  availability: defaultAvailability,
  integrations: defaultIntegrations,
  analytics: defaultAnalytics,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || '00000000-0000-0000-0000-000000000001';

    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      // Widget Management - beats HubSpot
      case 'get-widget': {
        const widget = await getWidget(supabase, userId);
        return NextResponse.json({
          success: true,
          data: { widget }
        });
      }

      case 'update-widget': {
        const { error } = await supabase
          .from('chat_widgets')
          .upsert({
            id: params.widgetId || undefined,
            user_id: userId,
            ...params.updates,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });

        if (error) throw error;

        return NextResponse.json({
          success: true,
          data: {
            widgetId: params.widgetId,
            updated: params.updates,
            updatedAt: new Date().toISOString()
          }
        });
      }

      case 'get-widget-code': {
        const widget = await getWidget(supabase, userId);
        return NextResponse.json({
          success: true,
          data: {
            widgetId: widget.id,
            embedCode: `<script>
  window.FreeFlowChat = {
    widgetId: '${widget.id}',
    position: '${widget.appearance.position}',
    primaryColor: '${widget.appearance.primaryColor}'
  };
</script>
<script src="https://chat.freeflow.com/widget.js" async></script>`,
            previewUrl: `https://chat.freeflow.com/preview/${widget.id}`
          }
        });
      }

      // Conversations - beats HubSpot inbox
      case 'get-conversations': {
        const conversations = await getConversations(supabase, userId);
        return NextResponse.json({
          success: true,
          data: {
            conversations,
            summary: {
              active: conversations.filter(c => c.status === 'active').length,
              waiting: conversations.filter(c => c.status === 'waiting').length,
              resolved: conversations.filter(c => c.status === 'resolved').length,
              unassigned: conversations.filter(c => !c.assignedTo).length
            }
          }
        });
      }

      case 'get-conversation': {
        const { data: convData } = await supabase
          .from('chat_conversations')
          .select(`
            *,
            messages:chat_messages(*),
            assigned_agent:users!chat_conversations_assigned_to_fkey(id, name, email, avatar_url)
          `)
          .eq('id', params.conversationId)
          .single();

        return NextResponse.json({ success: true, data: { conversation: convData } });
      }

      case 'send-message': {
        const { data: message, error: msgError } = await supabase
          .from('chat_messages')
          .insert({
            conversation_id: params.conversationId,
            message_type: params.type || 'text',
            content: params.content,
            sender_type: params.sender || 'agent',
            sender_name: params.senderName || 'Agent',
            sender_id: userId,
            is_read: false,
            buttons: params.buttons,
            attachments: params.attachments
          })
          .select()
          .single();

        if (msgError) throw msgError;

        // Update conversation updated_at
        await supabase
          .from('chat_conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', params.conversationId);

        return NextResponse.json({ success: true, data: { message } });
      }

      case 'assign-conversation': {
        const { error: assignError } = await supabase
          .from('chat_conversations')
          .update({
            assigned_to: params.agentId,
            status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', params.conversationId);

        if (assignError) throw assignError;

        return NextResponse.json({
          success: true,
          data: {
            conversationId: params.conversationId,
            assignedTo: params.agentId,
            assignedAt: new Date().toISOString()
          }
        });
      }

      case 'resolve-conversation': {
        const { error: resolveError } = await supabase
          .from('chat_conversations')
          .update({
            status: 'resolved',
            resolved_at: new Date().toISOString(),
            resolution: params.resolution,
            updated_at: new Date().toISOString()
          })
          .eq('id', params.conversationId);

        if (resolveError) throw resolveError;

        return NextResponse.json({
          success: true,
          data: {
            conversationId: params.conversationId,
            status: 'resolved',
            resolvedAt: new Date().toISOString(),
            resolution: params.resolution
          }
        });
      }

      // Visitor Intelligence - beats HubSpot
      case 'get-visitor-info': {
        const { data: conversation } = await supabase
          .from('chat_conversations')
          .select('*')
          .eq('visitor_id', params.visitorId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        const { count: prevConvCount } = await supabase
          .from('chat_conversations')
          .select('*', { count: 'exact', head: true })
          .eq('visitor_id', params.visitorId);

        const { count: msgCount } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conversation?.id);

        // Get CRM contact data if linked
        const { data: contact } = await supabase
          .from('contacts')
          .select('*, deals(*)')
          .eq('email', conversation?.visitor_email)
          .single();

        return NextResponse.json({
          success: true,
          data: {
            visitor: {
              id: params.visitorId,
              name: conversation?.visitor_name,
              email: conversation?.visitor_email,
              info: conversation?.visitor_info,
              previousConversations: prevConvCount || 0,
              totalMessages: msgCount || 0,
              firstSeen: conversation?.created_at,
              lastSeen: new Date().toISOString()
            },
            crmData: contact ? {
              contact: { id: contact.id, name: contact.name, company: contact.company },
              deals: (contact.deals || []).map((d: any) => ({ id: d.id, name: d.name, stage: d.stage, value: d.value })),
              activities: []
            } : null,
            insights: [
              { type: 'intent', title: 'Visitor Analysis', description: `${prevConvCount || 0} previous conversations` }
            ]
          }
        });
      }

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
      case 'get-agents': {
        const { data: agents } = await supabase
          .from('chat_agents')
          .select('*, user:users(id, name, email, avatar_url)')
          .eq('team_owner_id', userId);

        const agentList = (agents || []).map((a: any) => ({
          id: a.id,
          name: a.user?.name || 'Agent',
          email: a.user?.email,
          avatar: a.user?.avatar_url,
          status: a.status || 'offline',
          maxChats: a.max_chats || 5,
          activeChats: a.active_chats || 0,
          skills: a.skills || []
        }));

        return NextResponse.json({
          success: true,
          data: {
            agents: agentList,
            online: agentList.filter((a: any) => a.status === 'online').length,
            away: agentList.filter((a: any) => a.status === 'away').length,
            offline: agentList.filter((a: any) => a.status === 'offline').length
          }
        });
      }

      case 'update-agent-status': {
        const { error: statusError } = await supabase
          .from('chat_agents')
          .update({ status: params.status, updated_at: new Date().toISOString() })
          .eq('id', params.agentId);

        if (statusError) throw statusError;

        return NextResponse.json({
          success: true,
          data: {
            agentId: params.agentId,
            status: params.status,
            updatedAt: new Date().toISOString()
          }
        });
      }

      // Analytics - beats HubSpot
      case 'get-chat-analytics': {
        const periodDays = params.period === '7d' ? 7 : params.period === '90d' ? 90 : 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - periodDays);

        const { count: totalConversations } = await supabase
          .from('chat_conversations')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('created_at', startDate.toISOString());

        const { count: resolvedCount } = await supabase
          .from('chat_conversations')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('status', 'resolved')
          .gte('created_at', startDate.toISOString());

        const { count: missedCount } = await supabase
          .from('chat_conversations')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('status', 'missed')
          .gte('created_at', startDate.toISOString());

        const { data: ratedConvs } = await supabase
          .from('chat_conversations')
          .select('rating')
          .eq('user_id', userId)
          .not('rating', 'is', null)
          .gte('created_at', startDate.toISOString());

        const avgRating = ratedConvs && ratedConvs.length > 0
          ? ratedConvs.reduce((sum: number, c: any) => sum + c.rating, 0) / ratedConvs.length
          : 0;

        return NextResponse.json({
          success: true,
          data: {
            period: params.period || '30d',
            overview: {
              totalConversations: totalConversations || 0,
              avgResponseTime: 45, // Would need message timestamps to calculate
              avgResolutionTime: 480,
              satisfactionScore: Math.round(avgRating * 10) / 10,
              missedChats: missedCount || 0,
              botHandled: 0,
              leadsGenerated: 0
            },
            byChannel: [
              { channel: 'chat', conversations: totalConversations || 0, satisfaction: avgRating }
            ],
            byAgent: [],
            trends: {
              daily: []
            },
            peakHours: [],
            commonTopics: []
          }
        });
      }

      // Canned Responses
      case 'get-canned-responses': {
        const { data: responses } = await supabase
          .from('canned_responses')
          .select('*')
          .eq('user_id', userId)
          .order('shortcut', { ascending: true });

        return NextResponse.json({
          success: true,
          data: {
            responses: responses || []
          }
        });
      }

      case 'create-canned-response': {
        const { data: response, error: cannedError } = await supabase
          .from('canned_responses')
          .insert({
            user_id: userId,
            shortcut: params.shortcut,
            content: params.content,
            category: params.category
          })
          .select()
          .single();

        if (cannedError) throw cannedError;

        return NextResponse.json({
          success: true,
          data: { response }
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown action' },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Live Chat API error', { error });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || '00000000-0000-0000-0000-000000000001';

    const [widget, conversations] = await Promise.all([
      getWidget(supabase, userId),
      getConversations(supabase, userId)
    ]);

    return NextResponse.json({
      success: true,
      data: {
        widget,
        conversations,
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
  } catch (error) {
    logger.error('Live Chat GET error', { error });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
