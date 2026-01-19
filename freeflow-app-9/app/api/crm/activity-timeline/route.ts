import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Phase 7 Gap #6: Contact Activity Timeline
// Priority: HIGH | Competitor: HubSpot
// Beats HubSpot with: AI-powered activity insights, cross-channel timeline,
// predictive engagement, relationship scoring, automated activity logging

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  title: string;
  avatar: string;
  lifecycleStage: string;
  leadScore: number;
  relationshipScore: number;
  lastActivity: string;
  createdAt: string;
  owner: ContactOwner;
  tags: string[];
  customFields: Record<string, any>;
}

interface ContactOwner {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface Activity {
  id: string;
  contactId: string;
  type: ActivityType;
  subtype?: string;
  title: string;
  description: string;
  timestamp: string;
  source: string;
  channel: string;
  direction?: 'inbound' | 'outbound';
  metadata: ActivityMetadata;
  engagement: EngagementMetrics;
  associations: Association[];
  createdBy?: string;
  automated: boolean;
}

type ActivityType =
  | 'email'
  | 'call'
  | 'meeting'
  | 'note'
  | 'task'
  | 'deal_update'
  | 'form_submission'
  | 'page_view'
  | 'content_download'
  | 'chat'
  | 'social'
  | 'invoice'
  | 'payment'
  | 'support_ticket'
  | 'custom';

interface ActivityMetadata {
  // Email
  subject?: string;
  emailId?: string;
  opens?: number;
  clicks?: number;
  replied?: boolean;
  bounced?: boolean;

  // Call
  duration?: number;
  outcome?: string;
  recordingUrl?: string;
  transcriptUrl?: string;

  // Meeting
  attendees?: string[];
  location?: string;
  meetingLink?: string;

  // Page View
  pageUrl?: string;
  pageTitle?: string;
  referrer?: string;
  sessionDuration?: number;

  // Form
  formName?: string;
  formData?: Record<string, any>;

  // Content
  contentTitle?: string;
  contentType?: string;

  // Deal
  dealId?: string;
  dealName?: string;
  fromStage?: string;
  toStage?: string;
  valueChange?: number;

  // Generic
  [key: string]: any;
}

interface EngagementMetrics {
  score: number;
  quality: 'high' | 'medium' | 'low';
  sentiment?: 'positive' | 'neutral' | 'negative';
  intent?: 'buying' | 'researching' | 'comparing' | 'unknown';
}

interface Association {
  type: 'deal' | 'company' | 'ticket' | 'quote' | 'task';
  id: string;
  name: string;
}

interface TimelineFilters {
  types?: ActivityType[];
  channels?: string[];
  dateRange?: { start: string; end: string };
  direction?: 'inbound' | 'outbound';
  sentiment?: string;
  searchQuery?: string;
}

interface ActivityInsight {
  type: 'pattern' | 'recommendation' | 'alert' | 'prediction';
  title: string;
  description: string;
  confidence: number;
  action?: string;
  priority: 'high' | 'medium' | 'low';
}

interface RelationshipScore {
  overall: number;
  engagement: number;
  recency: number;
  frequency: number;
  depth: number;
  sentiment: number;
  trend: 'improving' | 'stable' | 'declining';
  factors: ScoreFactor[];
}

interface ScoreFactor {
  name: string;
  impact: number;
  description: string;
}

// Demo data - beats HubSpot activity timeline
const demoContacts: Contact[] = [
  {
    id: 'contact-001',
    firstName: 'Jennifer',
    lastName: 'Martinez',
    email: 'jennifer.martinez@techcorp.com',
    phone: '+1-555-0123',
    company: 'TechCorp Inc',
    title: 'VP of Operations',
    avatar: '/avatars/jennifer.jpg',
    lifecycleStage: 'opportunity',
    leadScore: 92,
    relationshipScore: 85,
    lastActivity: '2025-01-15T14:30:00Z',
    createdAt: '2024-10-15T10:00:00Z',
    owner: { id: 'user-1', name: 'Sarah Chen', email: 'sarah@freeflow.com', avatar: '/avatars/sarah.jpg' },
    tags: ['enterprise', 'high-value', 'decision-maker'],
    customFields: { industry: 'Technology', source: 'Webinar', budget: '$50K-$100K' }
  }
];

const demoActivities: Activity[] = [
  {
    id: 'act-001',
    contactId: 'contact-001',
    type: 'email',
    subtype: 'marketing',
    title: 'Opened: Q1 Product Update Newsletter',
    description: 'Jennifer opened the newsletter and clicked on the pricing link',
    timestamp: '2025-01-15T14:30:00Z',
    source: 'marketing_email',
    channel: 'email',
    direction: 'outbound',
    metadata: {
      subject: 'Q1 Product Updates & New Features',
      emailId: 'email-123',
      opens: 3,
      clicks: 2,
      replied: false
    },
    engagement: { score: 85, quality: 'high', sentiment: 'positive', intent: 'researching' },
    associations: [{ type: 'deal', id: 'deal-001', name: 'TechCorp Annual Contract' }],
    automated: true
  },
  {
    id: 'act-002',
    contactId: 'contact-001',
    type: 'page_view',
    title: 'Viewed Pricing Page',
    description: 'Visited pricing page for 4 minutes, compared Enterprise plans',
    timestamp: '2025-01-15T14:35:00Z',
    source: 'website',
    channel: 'web',
    metadata: {
      pageUrl: '/pricing',
      pageTitle: 'Pricing - FreeFlow',
      sessionDuration: 240,
      referrer: 'email'
    },
    engagement: { score: 90, quality: 'high', intent: 'buying' },
    associations: [],
    automated: true
  },
  {
    id: 'act-003',
    contactId: 'contact-001',
    type: 'call',
    subtype: 'discovery',
    title: 'Discovery Call - 45 min',
    description: 'Discussed requirements, budget approved, timeline Q1',
    timestamp: '2025-01-14T10:00:00Z',
    source: 'zoom',
    channel: 'phone',
    direction: 'outbound',
    metadata: {
      duration: 2700,
      outcome: 'positive',
      recordingUrl: '/recordings/call-123.mp3',
      transcriptUrl: '/transcripts/call-123.txt',
      attendees: ['Jennifer Martinez', 'Sarah Chen', 'Mike Thompson']
    },
    engagement: { score: 95, quality: 'high', sentiment: 'positive', intent: 'buying' },
    associations: [{ type: 'deal', id: 'deal-001', name: 'TechCorp Annual Contract' }],
    createdBy: 'Sarah Chen',
    automated: false
  },
  {
    id: 'act-004',
    contactId: 'contact-001',
    type: 'meeting',
    subtype: 'demo',
    title: 'Product Demo Scheduled',
    description: 'Full platform demo with technical team',
    timestamp: '2025-01-13T15:00:00Z',
    source: 'calendar',
    channel: 'meeting',
    metadata: {
      attendees: ['Jennifer Martinez', 'Sarah Chen', 'Dev Team Lead'],
      location: 'Zoom',
      meetingLink: 'https://zoom.us/j/123456789'
    },
    engagement: { score: 88, quality: 'high', intent: 'buying' },
    associations: [{ type: 'deal', id: 'deal-001', name: 'TechCorp Annual Contract' }],
    createdBy: 'Sarah Chen',
    automated: false
  },
  {
    id: 'act-005',
    contactId: 'contact-001',
    type: 'content_download',
    title: 'Downloaded ROI Calculator',
    description: 'Downloaded ROI calculator spreadsheet',
    timestamp: '2025-01-12T11:00:00Z',
    source: 'website',
    channel: 'web',
    metadata: {
      contentTitle: 'FreeFlow ROI Calculator',
      contentType: 'spreadsheet'
    },
    engagement: { score: 80, quality: 'high', intent: 'buying' },
    associations: [],
    automated: true
  },
  {
    id: 'act-006',
    contactId: 'contact-001',
    type: 'form_submission',
    title: 'Demo Request Form',
    description: 'Submitted demo request with enterprise requirements',
    timestamp: '2025-01-10T09:30:00Z',
    source: 'website',
    channel: 'web',
    metadata: {
      formName: 'demo-request',
      formData: {
        companySize: '200-500',
        useCase: 'Team collaboration',
        timeline: 'This quarter'
      }
    },
    engagement: { score: 92, quality: 'high', intent: 'buying' },
    associations: [],
    automated: true
  },
  {
    id: 'act-007',
    contactId: 'contact-001',
    type: 'deal_update',
    title: 'Deal moved to Proposal',
    description: 'Deal advanced from Discovery to Proposal stage',
    timestamp: '2025-01-14T16:00:00Z',
    source: 'crm',
    channel: 'internal',
    metadata: {
      dealId: 'deal-001',
      dealName: 'TechCorp Annual Contract',
      fromStage: 'Discovery',
      toStage: 'Proposal',
      valueChange: 0
    },
    engagement: { score: 75, quality: 'medium' },
    associations: [{ type: 'deal', id: 'deal-001', name: 'TechCorp Annual Contract' }],
    createdBy: 'Sarah Chen',
    automated: false
  },
  {
    id: 'act-008',
    contactId: 'contact-001',
    type: 'note',
    title: 'Call Follow-up Notes',
    description: 'Key points from discovery call: budget approved, need security review',
    timestamp: '2025-01-14T11:30:00Z',
    source: 'crm',
    channel: 'internal',
    metadata: {},
    engagement: { score: 50, quality: 'medium' },
    associations: [{ type: 'deal', id: 'deal-001', name: 'TechCorp Annual Contract' }],
    createdBy: 'Sarah Chen',
    automated: false
  }
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      // Timeline - beats HubSpot activity feed
      case 'get-timeline':
        let activities = demoActivities.filter(a => a.contactId === params.contactId);

        // Apply filters
        if (params.filters) {
          const filters: TimelineFilters = params.filters;
          if (filters.types?.length) {
            activities = activities.filter(a => filters.types!.includes(a.type));
          }
          if (filters.channels?.length) {
            activities = activities.filter(a => filters.channels!.includes(a.channel));
          }
          if (filters.direction) {
            activities = activities.filter(a => a.direction === filters.direction);
          }
          if (filters.dateRange) {
            activities = activities.filter(a =>
              a.timestamp >= filters.dateRange!.start && a.timestamp <= filters.dateRange!.end
            );
          }
        }

        // Sort by timestamp descending
        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        return NextResponse.json({
          success: true,
          data: {
            contactId: params.contactId,
            activities,
            summary: {
              total: activities.length,
              byType: {
                email: activities.filter(a => a.type === 'email').length,
                call: activities.filter(a => a.type === 'call').length,
                meeting: activities.filter(a => a.type === 'meeting').length,
                pageView: activities.filter(a => a.type === 'page_view').length
              },
              avgEngagement: activities.reduce((sum, a) => sum + a.engagement.score, 0) / activities.length,
              lastActivity: activities[0]?.timestamp
            }
          }
        });

      case 'get-contact':
        const contact = demoContacts.find(c => c.id === params.contactId);
        return NextResponse.json({ success: true, data: { contact } });

      // AI Activity Insights - beats HubSpot
      case 'get-activity-insights':
        const insights: ActivityInsight[] = [
          {
            type: 'pattern',
            title: 'High Engagement Pattern',
            description: 'Jennifer engages most on Tuesday-Thursday between 10 AM - 2 PM EST',
            confidence: 0.92,
            priority: 'medium'
          },
          {
            type: 'recommendation',
            title: 'Schedule Follow-up Call',
            description: 'Based on recent pricing page visits and content downloads, Jennifer is ready for a follow-up',
            confidence: 0.88,
            action: 'schedule_call',
            priority: 'high'
          },
          {
            type: 'prediction',
            title: 'Likely to Convert',
            description: 'Engagement pattern matches 85% of contacts who converted within 14 days',
            confidence: 0.85,
            priority: 'high'
          },
          {
            type: 'alert',
            title: 'Multiple Stakeholders',
            description: 'Activity detected from 3 other contacts at TechCorp - consider multi-threading',
            confidence: 0.90,
            action: 'view_related_contacts',
            priority: 'medium'
          }
        ];

        return NextResponse.json({
          success: true,
          data: {
            contactId: params.contactId,
            insights,
            engagementTrend: 'increasing',
            buyingSignals: ['Pricing page visits', 'ROI calculator download', 'Demo request'],
            nextBestAction: {
              action: 'Send proposal',
              reason: 'Contact has shown buying intent and budget is approved',
              confidence: 0.89
            }
          }
        });

      // Relationship Score - beats HubSpot
      case 'get-relationship-score':
        const relationshipScore: RelationshipScore = {
          overall: 85,
          engagement: 92,
          recency: 95,
          frequency: 78,
          depth: 82,
          sentiment: 88,
          trend: 'improving',
          factors: [
            { name: 'Regular email engagement', impact: 15, description: 'Opens 80% of emails, clicks 40%' },
            { name: 'Recent high-value interactions', impact: 20, description: '3 meetings in past 2 weeks' },
            { name: 'Content consumption', impact: 12, description: 'Downloaded 5 resources' },
            { name: 'Response time', impact: 8, description: 'Responds within 4 hours on average' },
            { name: 'Deal progression', impact: 15, description: 'Deal moved to Proposal stage' }
          ]
        };

        return NextResponse.json({
          success: true,
          data: {
            contactId: params.contactId,
            score: relationshipScore,
            comparison: {
              vsAverage: { difference: 32, percentile: 92 },
              vsSimilarContacts: { difference: 18, percentile: 85 }
            },
            recommendations: [
              { action: 'Maintain engagement', reason: 'Relationship is strong, continue regular touchpoints' },
              { action: 'Introduce to customer success', reason: 'Prep for smooth handoff if deal closes' }
            ]
          }
        });

      // Log Activity - beats HubSpot activity logging
      case 'log-activity':
        const newActivity: Activity = {
          id: `act-${Date.now()}`,
          contactId: params.contactId,
          type: params.type,
          subtype: params.subtype,
          title: params.title,
          description: params.description || '',
          timestamp: params.timestamp || new Date().toISOString(),
          source: params.source || 'manual',
          channel: params.channel || 'internal',
          direction: params.direction,
          metadata: params.metadata || {},
          engagement: params.engagement || { score: 50, quality: 'medium' },
          associations: params.associations || [],
          createdBy: params.createdBy || 'Current User',
          automated: false
        };

        return NextResponse.json({ success: true, data: { activity: newActivity } });

      case 'bulk-log':
        return NextResponse.json({
          success: true,
          data: {
            logged: params.activities?.length || 0,
            contactsUpdated: [...new Set(params.activities?.map((a: Activity) => a.contactId))].length,
            timestamp: new Date().toISOString()
          }
        });

      // Activity Search - beats HubSpot search
      case 'search-activities':
        const searchResults = demoActivities.filter(a =>
          a.title.toLowerCase().includes(params.query?.toLowerCase() || '') ||
          a.description.toLowerCase().includes(params.query?.toLowerCase() || '')
        );

        return NextResponse.json({
          success: true,
          data: {
            query: params.query,
            results: searchResults,
            totalResults: searchResults.length,
            facets: {
              types: [...new Set(searchResults.map(a => a.type))],
              channels: [...new Set(searchResults.map(a => a.channel))],
              dateRange: {
                earliest: searchResults[searchResults.length - 1]?.timestamp,
                latest: searchResults[0]?.timestamp
              }
            }
          }
        });

      // Engagement Analytics - beats HubSpot reporting
      case 'get-engagement-analytics':
        return NextResponse.json({
          success: true,
          data: {
            contactId: params.contactId,
            period: params.period || '30d',
            metrics: {
              totalActivities: 45,
              avgEngagementScore: 82,
              totalTouchpoints: 12,
              responseRate: 78,
              avgResponseTime: '2.4 hours'
            },
            byChannel: [
              { channel: 'email', activities: 18, avgEngagement: 75, trend: 'up' },
              { channel: 'web', activities: 15, avgEngagement: 85, trend: 'up' },
              { channel: 'phone', activities: 5, avgEngagement: 92, trend: 'stable' },
              { channel: 'meeting', activities: 4, avgEngagement: 95, trend: 'up' },
              { channel: 'social', activities: 3, avgEngagement: 60, trend: 'down' }
            ],
            timeline: [
              { date: '2025-01-10', activities: 3, engagement: 85 },
              { date: '2025-01-11', activities: 2, engagement: 78 },
              { date: '2025-01-12', activities: 4, engagement: 82 },
              { date: '2025-01-13', activities: 3, engagement: 88 },
              { date: '2025-01-14', activities: 5, engagement: 92 },
              { date: '2025-01-15', activities: 4, engagement: 87 }
            ],
            peakEngagementTimes: [
              { day: 'Tuesday', hour: 10, score: 92 },
              { day: 'Wednesday', hour: 14, score: 88 },
              { day: 'Thursday', hour: 11, score: 85 }
            ]
          }
        });

      // Related Activities - multi-threading
      case 'get-related-activities':
        return NextResponse.json({
          success: true,
          data: {
            contactId: params.contactId,
            companyActivities: {
              company: 'TechCorp Inc',
              totalContacts: 5,
              activeContacts: 3,
              recentActivities: [
                { contactName: 'Mike Thompson', type: 'email', title: 'Opened pricing email', timestamp: '2025-01-15T10:00:00Z' },
                { contactName: 'Lisa Wong', type: 'page_view', title: 'Viewed case studies', timestamp: '2025-01-14T16:00:00Z' }
              ]
            },
            dealActivities: [
              { dealName: 'TechCorp Annual Contract', stage: 'Proposal', lastActivity: '2025-01-15T14:30:00Z', health: 'good' }
            ],
            insights: [
              { type: 'opportunity', title: 'Multi-threading opportunity', description: 'Engage with Mike Thompson (CTO) who has been active on pricing' }
            ]
          }
        });

      // Activity Templates - beats HubSpot templates
      case 'get-activity-templates':
        return NextResponse.json({
          success: true,
          data: {
            templates: [
              { id: 'template-1', type: 'call', name: 'Discovery Call', fields: ['duration', 'outcome', 'nextSteps'], popular: true },
              { id: 'template-2', type: 'meeting', name: 'Product Demo', fields: ['attendees', 'feedback', 'objections'], popular: true },
              { id: 'template-3', type: 'call', name: 'Follow-up Call', fields: ['duration', 'outcome', 'proposal_sent'], popular: true },
              { id: 'template-4', type: 'note', name: 'Competitive Intel', fields: ['competitor', 'concerns', 'positioning'], popular: false },
              { id: 'template-5', type: 'task', name: 'Send Proposal', fields: ['deadline', 'value', 'customizations'], popular: true }
            ]
          }
        });

      // Export Timeline
      case 'export-timeline':
        return NextResponse.json({
          success: true,
          data: {
            contactId: params.contactId,
            format: params.format || 'pdf',
            downloadUrl: `/exports/timeline-${params.contactId}-${Date.now()}.${params.format || 'pdf'}`,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          }
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Activity Timeline API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const contactId = searchParams.get('contactId');

  if (contactId) {
    const contact = demoContacts.find(c => c.id === contactId);
    const activities = demoActivities.filter(a => a.contactId === contactId);

    return NextResponse.json({
      success: true,
      data: { contact, activities }
    });
  }

  return NextResponse.json({
    success: true,
    data: {
      contacts: demoContacts,
      features: [
        'Cross-channel activity timeline',
        'AI-powered engagement insights',
        'Relationship scoring',
        'Automated activity logging',
        'Sentiment analysis',
        'Buying intent detection',
        'Multi-threading visibility',
        'Activity templates',
        'Engagement analytics',
        'Export & reporting'
      ],
      competitorComparison: {
        hubspot: {
          advantage: 'FreeFlow offers AI insights and relationship scoring in all plans',
          features: ['AI insights', 'Relationship scoring', 'Intent detection']
        }
      }
    }
  });
}
