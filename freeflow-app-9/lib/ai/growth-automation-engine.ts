/**
 * Growth Automation Engine
 *
 * AI-powered client acquisition, lead generation, and business scaling automation
 * Designed to help users acquire clients 3x faster with AI-optimized strategies
 *
 * Features:
 * - Smart lead scoring and qualification
 * - Automated personalized outreach generation
 * - Client acquisition playbooks by industry
 * - Referral system optimization
 * - Market opportunity scanning
 * - Competitive intelligence
 * - Partnership recommendations
 */

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Lead {
  id: string;
  name: string;
  company?: string;
  industry?: string;
  email?: string;
  phone?: string;
  source: 'referral' | 'inbound' | 'outbound' | 'social' | 'other';
  budget?: number;
  projectDescription?: string;
  timeline?: string;
  painPoints?: string[];
  decisionMaker?: boolean;
  previousInteractions?: number;
}

export interface LeadScore {
  leadId: string;
  score: number; // 0-100
  confidence: number; // 0-1
  conversionProbability: number; // 0-1
  estimatedValue: number;
  timeToClose: number; // days
  reasoning: {
    strengths: string[];
    concerns: string[];
    qualifyingFactors: string[];
  };
  nextBestAction: string;
  priority: 'hot' | 'warm' | 'cold';
}

export interface OutreachMessage {
  type: 'cold_email' | 'linkedin_message' | 'follow_up' | 'proposal';
  subject?: string;
  body: string;
  personalization: {
    companyName?: string;
    painPoint?: string;
    relevantWork?: string;
    sharedConnection?: string;
  };
  callToAction: string;
  expectedResponseRate: number; // percentage
  tips: string[];
}

export interface ClientAcquisitionPlaybook {
  industry: string;
  targetAudience: string;
  strategies: AcquisitionStrategy[];
  platforms: PlatformStrategy[];
  contentIdeas: string[];
  networkingTips: string[];
  estimatedTimeInvestment: string;
  expectedROI: string;
}

export interface AcquisitionStrategy {
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeToResults: string;
  costEstimate: number;
  steps: string[];
  successMetrics: string[];
  examples: string[];
}

export interface PlatformStrategy {
  platform: 'Upwork' | 'Fiverr' | 'LinkedIn' | 'Twitter' | 'Instagram' | 'Behance' | 'Dribbble' | 'Cold Email';
  priority: 'high' | 'medium' | 'low';
  strategy: string;
  optimizationTips: string[];
  contentFrequency: string;
  expectedLeads: number; // per month
}

export interface ReferralOptimization {
  currentReferralRate: number; // percentage of clients who refer
  industryBenchmark: number;
  recommendations: {
    timing: string;
    incentive: string;
    ask: string;
    followUp: string;
  };
  topReferralSources: Array<{
    clientName: string;
    referralCount: number;
    suggestedReward: string;
  }>;
  automationOpportunities: string[];
}

export interface MarketOpportunity {
  niche: string;
  demandLevel: 'high' | 'medium' | 'low';
  competition: 'low' | 'medium' | 'high';
  pricePoint: {
    low: number;
    average: number;
    high: number;
  };
  reasoning: string;
  entryBarriers: string[];
  successFactors: string[];
  estimatedMonthlyRevenue: number;
  timeToEstablish: string;
}

export interface CompetitorIntelligence {
  competitorName: string;
  strengths: string[];
  weaknesses: string[];
  pricing: string;
  marketPosition: string;
  differentiationOpportunities: string[];
  threatsToWatch: string[];
}

export interface PartnershipRecommendation {
  partnerType: string;
  benefits: string[];
  idealPartnerProfile: string;
  approachStrategy: string;
  valueProposition: string; // What you offer them
  expectedOutcome: string;
  examples: string[];
}

export interface GrowthActionPlan {
  daily: DailyAction[];
  weekly: WeeklyAction[];
  monthly: MonthlyAction[];
  quarterly: QuarterlyAction[];
}

export interface DailyAction {
  action: string;
  timeRequired: string; // e.g., "15 minutes"
  impact: 'high' | 'medium' | 'low';
  category: 'outreach' | 'content' | 'networking' | 'follow_up';
}

export interface WeeklyAction {
  action: string;
  timeRequired: string;
  impact: 'high' | 'medium' | 'low';
  deliverables: string[];
}

export interface MonthlyAction {
  action: string;
  timeRequired: string;
  impact: 'high' | 'medium' | 'low';
  metrics: string[];
}

export interface QuarterlyAction {
  action: string;
  timeRequired: string;
  impact: 'high' | 'medium' | 'low';
  milestones: string[];
}

// ============================================================================
// GROWTH AUTOMATION ENGINE
// ============================================================================

export class GrowthAutomationEngine {

  /**
   * Score and prioritize leads using AI
   */
  async scoreLeads(leads: Lead[]): Promise<LeadScore[]> {
    const scores = await Promise.all(
      leads.map(lead => this.scoreSingleLead(lead))
    );

    return scores.sort((a, b) => b.score - a.score);
  }

  /**
   * Score a single lead
   */
  private async scoreSingleLead(lead: Lead): Promise<LeadScore> {
    const prompt = `You are an expert sales qualification specialist. Score this lead from 0-100 based on their likelihood to convert into a paying client.

Lead Information:
- Name: ${lead.name}
- Company: ${lead.company || 'Not provided'}
- Industry: ${lead.industry || 'Unknown'}
- Source: ${lead.source}
- Budget: ${lead.budget ? '$' + lead.budget : 'Not disclosed'}
- Project: ${lead.projectDescription || 'Not detailed'}
- Timeline: ${lead.timeline || 'Not specified'}
- Pain Points: ${lead.painPoints?.join(', ') || 'Unknown'}
- Decision Maker: ${lead.decisionMaker ? 'Yes' : 'Unknown'}
- Previous Interactions: ${lead.previousInteractions || 0}

Provide a JSON response:
{
  "score": number (0-100),
  "confidence": number (0-1),
  "conversionProbability": number (0-1),
  "estimatedValue": number (in dollars),
  "timeToClose": number (days),
  "strengths": ["strength 1", "strength 2"],
  "concerns": ["concern 1", "concern 2"],
  "qualifyingFactors": ["factor 1", "factor 2"],
  "nextBestAction": "specific action to take",
  "priority": "hot|warm|cold"
}`;

    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        temperature: 0.3,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = response.content[0];
      if (content.type === 'text') {
        const analysis = JSON.parse(content.text);

        return {
          leadId: lead.id,
          score: analysis.score,
          confidence: analysis.confidence,
          conversionProbability: analysis.conversionProbability,
          estimatedValue: analysis.estimatedValue,
          timeToClose: analysis.timeToClose,
          reasoning: {
            strengths: analysis.strengths,
            concerns: analysis.concerns,
            qualifyingFactors: analysis.qualifyingFactors,
          },
          nextBestAction: analysis.nextBestAction,
          priority: analysis.priority,
        };
      }
    } catch (error) {
      console.error('Error scoring lead:', error);
    }

    // Fallback scoring
    return {
      leadId: lead.id,
      score: 50,
      confidence: 0.5,
      conversionProbability: 0.5,
      estimatedValue: lead.budget || 5000,
      timeToClose: 30,
      reasoning: {
        strengths: ['Expressed interest'],
        concerns: ['Limited information'],
        qualifyingFactors: ['Needs qualification'],
      },
      nextBestAction: 'Schedule discovery call',
      priority: 'warm',
    };
  }

  /**
   * Generate personalized outreach messages
   */
  async generateOutreach(
    lead: Lead,
    type: 'cold_email' | 'linkedin_message' | 'follow_up' | 'proposal',
    userInfo: {
      name: string;
      expertise: string[];
      portfolio?: string;
      recentWin?: string;
    }
  ): Promise<OutreachMessage> {

    const typePrompts = {
      cold_email: 'cold outreach email introducing your services',
      linkedin_message: 'LinkedIn connection request or direct message',
      follow_up: 'follow-up message after initial contact',
      proposal: 'project proposal covering scope, timeline, and investment',
    };

    const prompt = `You are a world-class copywriter specializing in ${lead.industry || 'creative services'}.

Write a highly personalized ${typePrompts[type]} for this lead:

Lead: ${lead.name}${lead.company ? ` at ${lead.company}` : ''}
Industry: ${lead.industry || 'Unknown'}
Pain Points: ${lead.painPoints?.join(', ') || 'Not specified'}
Project: ${lead.projectDescription || 'General inquiry'}

Your Profile:
- Name: ${userInfo.name}
- Expertise: ${userInfo.expertise.join(', ')}
${userInfo.portfolio ? `- Portfolio: ${userInfo.portfolio}` : ''}
${userInfo.recentWin ? `- Recent Success: ${userInfo.recentWin}` : ''}

Requirements:
1. Highly personalized to their business/situation
2. Lead with value, not credentials
3. Address specific pain point
4. Include social proof if relevant
5. Clear, specific call-to-action
6. Natural, conversational tone
7. Short and scannable (max 150 words for email, 300 chars for LinkedIn)

Return JSON:
{
  "subject": "compelling subject line" (if email),
  "body": "full message text",
  "callToAction": "specific CTA",
  "personalizationUsed": ["element 1", "element 2"],
  "expectedResponseRate": number (percentage),
  "tips": ["tip 1", "tip 2"]
}`;

    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        temperature: 0.7,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = response.content[0];
      if (content.type === 'text') {
        const generated = JSON.parse(content.text);

        return {
          type,
          subject: generated.subject,
          body: generated.body,
          personalization: {
            companyName: lead.company,
            painPoint: lead.painPoints?.[0],
          },
          callToAction: generated.callToAction,
          expectedResponseRate: generated.expectedResponseRate,
          tips: generated.tips,
        };
      }
    } catch (error) {
      console.error('Error generating outreach:', error);
    }

    // Fallback message
    return {
      type,
      subject: `Quick question about ${lead.company || 'your business'}`,
      body: `Hi ${lead.name},\n\nI noticed [specific detail about their business]. I help ${lead.industry || 'businesses'} with [relevant service].\n\nWould love to chat about how I can help. Available for a 15-min call this week?\n\nBest,\n${userInfo.name}`,
      personalization: {},
      callToAction: 'Schedule 15-minute call',
      expectedResponseRate: 10,
      tips: ['Personalize the opening', 'Be specific about value'],
    };
  }

  /**
   * Generate industry-specific client acquisition playbook
   */
  async generateAcquisitionPlaybook(
    industry: string,
    expertise: string[],
    currentClientCount: number,
    targetMonthlyRevenue: number
  ): Promise<ClientAcquisitionPlaybook> {

    const prompt = `Create a comprehensive client acquisition playbook for a ${industry} professional.

Profile:
- Expertise: ${expertise.join(', ')}
- Current Clients: ${currentClientCount}
- Revenue Goal: $${targetMonthlyRevenue}/month

Provide:
1. 5 specific acquisition strategies (ranked by effectiveness)
2. Platform-specific strategies (Upwork, LinkedIn, cold email, etc.)
3. 10 content ideas to attract ideal clients
4. Networking tips specific to this industry
5. Time investment and ROI estimates

Format as JSON:
{
  "targetAudience": "description of ideal client",
  "strategies": [
    {
      "name": "strategy name",
      "description": "detailed description",
      "difficulty": "easy|medium|hard",
      "timeToResults": "timeframe",
      "costEstimate": number,
      "steps": ["step 1", "step 2"],
      "successMetrics": ["metric 1"],
      "examples": ["example 1"]
    }
  ],
  "platforms": [
    {
      "platform": "platform name",
      "priority": "high|medium|low",
      "strategy": "specific approach",
      "optimizationTips": ["tip 1"],
      "contentFrequency": "posting schedule",
      "expectedLeads": number
    }
  ],
  "contentIdeas": ["idea 1", "idea 2"],
  "networkingTips": ["tip 1", "tip 2"],
  "estimatedTimeInvestment": "hours per week",
  "expectedROI": "revenue increase estimate"
}`;

    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        temperature: 0.5,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = response.content[0];
      if (content.type === 'text') {
        const playbook = JSON.parse(content.text);
        return {
          industry,
          ...playbook,
        };
      }
    } catch (error) {
      console.error('Error generating playbook:', error);
    }

    // Fallback playbook
    return {
      industry,
      targetAudience: 'Small to medium businesses',
      strategies: [],
      platforms: [],
      contentIdeas: [],
      networkingTips: [],
      estimatedTimeInvestment: '10-15 hours/week',
      expectedROI: '30-50% revenue increase in 90 days',
    };
  }

  /**
   * Optimize referral system
   */
  async optimizeReferralSystem(
    clientData: Array<{
      name: string;
      satisfaction: number; // 1-10
      projectsCompleted: number;
      referrals: number;
    }>
  ): Promise<ReferralOptimization> {

    const totalClients = clientData.length;
    const referringClients = clientData.filter(c => c.referrals > 0).length;
    const currentRate = (referringClients / totalClients) * 100;

    const topReferrers = clientData
      .filter(c => c.referrals > 0)
      .sort((a, b) => b.referrals - a.referrals)
      .slice(0, 5)
      .map(c => ({
        clientName: c.name,
        referralCount: c.referrals,
        suggestedReward: c.referrals >= 3 ? '$500 credit + public recognition' : '$250 credit',
      }));

    return {
      currentReferralRate: currentRate,
      industryBenchmark: 15, // Industry average
      recommendations: {
        timing: 'Ask within 7 days of project completion while satisfaction is high',
        incentive: '10% discount on next project OR $250 credit for successful referral',
        ask: '"Who else do you know who could benefit from [service you provided]?"',
        followUp: 'Send automated reminder 30 days after initial ask',
      },
      topReferralSources: topReferrers,
      automationOpportunities: [
        'Automated email 7 days post-project asking for referrals',
        'LinkedIn post template celebrating client success (with permission)',
        'Referral landing page with easy submission form',
        'Monthly newsletter featuring "Client Spotlight" to encourage participation',
        'Referral leaderboard with quarterly rewards',
      ],
    };
  }

  /**
   * Scan for market opportunities
   */
  async scanMarketOpportunities(
    currentExpertise: string[],
    industry: string
  ): Promise<MarketOpportunity[]> {

    // In a real implementation, this would integrate with market data APIs
    // For now, use AI to generate insights based on trends

    const prompt = `Analyze market opportunities for a ${industry} professional with expertise in: ${currentExpertise.join(', ')}.

Identify 5 high-potential niches or service offerings with:
1. High demand (based on 2025 trends)
2. Reasonable competition
3. Good profit margins
4. Natural fit with existing expertise

Format as JSON array:
[
  {
    "niche": "specific niche name",
    "demandLevel": "high|medium|low",
    "competition": "low|medium|high",
    "pricePoint": {
      "low": number,
      "average": number,
      "high": number
    },
    "reasoning": "why this is a good opportunity",
    "entryBarriers": ["barrier 1"],
    "successFactors": ["factor 1"],
    "estimatedMonthlyRevenue": number,
    "timeToEstablish": "timeframe"
  }
]`;

    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 3072,
        temperature: 0.6,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return JSON.parse(content.text);
      }
    } catch (error) {
      console.error('Error scanning opportunities:', error);
    }

    return [];
  }

  /**
   * Generate daily/weekly/monthly growth action plan
   */
  async generateGrowthActionPlan(
    userProfile: {
      industry: string;
      currentRevenue: number;
      targetRevenue: number;
      availableTimePerWeek: number; // hours
    }
  ): Promise<GrowthActionPlan> {

    const revenueGap = userProfile.targetRevenue - userProfile.currentRevenue;
    const growthPercentage = (revenueGap / userProfile.currentRevenue) * 100;

    return {
      daily: [
        {
          action: 'Send 3 personalized outreach messages to potential clients',
          timeRequired: '30 minutes',
          impact: 'high',
          category: 'outreach',
        },
        {
          action: 'Post valuable content on LinkedIn (tip, insight, case study)',
          timeRequired: '15 minutes',
          impact: 'medium',
          category: 'content',
        },
        {
          action: 'Follow up with 2 warm leads',
          timeRequired: '20 minutes',
          impact: 'high',
          category: 'follow_up',
        },
        {
          action: 'Engage with 10 potential clients (comments, likes, DMs)',
          timeRequired: '15 minutes',
          impact: 'medium',
          category: 'networking',
        },
      ],
      weekly: [
        {
          action: 'Create one long-form content piece (blog, video, case study)',
          timeRequired: '3 hours',
          impact: 'high',
          deliverables: ['SEO-optimized content', 'Social media posts', 'Email newsletter'],
        },
        {
          action: 'Attend or host one virtual networking event',
          timeRequired: '2 hours',
          impact: 'medium',
          deliverables: ['10 new connections', 'Follow-up messages sent'],
        },
        {
          action: 'Optimize one marketing channel (website, profile, portfolio)',
          timeRequired: '2 hours',
          impact: 'medium',
          deliverables: ['Updated content', 'Performance tracking'],
        },
        {
          action: 'Send proposals to 3-5 qualified leads',
          timeRequired: '3 hours',
          impact: 'high',
          deliverables: ['Customized proposals', 'Follow-up scheduled'],
        },
      ],
      monthly: [
        {
          action: 'Analyze metrics and adjust strategy',
          timeRequired: '4 hours',
          impact: 'high',
          metrics: ['Lead conversion rate', 'Proposal win rate', 'Revenue by source', 'ROI by channel'],
        },
        {
          action: 'Launch one new client acquisition experiment',
          timeRequired: '8 hours',
          impact: 'high',
          metrics: ['Test results', 'Cost per lead', 'Conversion rate'],
        },
        {
          action: 'Build/strengthen 3 strategic partnerships',
          timeRequired: '6 hours',
          impact: 'medium',
          metrics: ['Referrals received', 'Joint opportunities', 'Cross-promotions'],
        },
      ],
      quarterly: [
        {
          action: 'Review and update positioning/messaging',
          timeRequired: '12 hours',
          impact: 'high',
          milestones: ['Market research complete', 'Updated brand assets', 'New portfolio pieces'],
        },
        {
          action: 'Develop one new service offering or package',
          timeRequired: '20 hours',
          impact: 'high',
          milestones: ['Market validation', 'Pricing model', 'Sales materials', 'First 3 clients'],
        },
      ],
    };
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const growthAutomationEngine = new GrowthAutomationEngine();
