// AI Insights Data - Intelligent recommendations across the platform
// These insights appear in AI panels and provide actionable recommendations

export interface AIInsight {
  id: string
  query: string
  insight: string
  confidence: number // 0-1
  category: 'revenue' | 'engagement' | 'conversion' | 'retention' | 'efficiency' | 'risk'
  priority: 'high' | 'medium' | 'low'
  timestamp: string
  actionable: boolean
  suggestedAction?: string
  impact?: string
  relatedMetrics?: string[]
}

export interface Prediction {
  id: string
  metric: string
  currentValue: number
  predictedValue: number
  confidence: number
  trend: 'up' | 'down' | 'stable'
  timeframe: string
  factors: string[]
  accuracy?: number
}

// AI Insights for different contexts
export const AI_INSIGHTS = {
  dashboard: [
    {
      id: 'ai-dash-001',
      query: "What's driving our growth?",
      insight: "Enterprise customer acquisition is up 35% this quarter, primarily from referrals. Your top 10 customers have referred 23 new accounts worth $2.3M in pipeline.",
      confidence: 0.94,
      category: 'revenue' as const,
      priority: 'high' as const,
      timestamp: new Date().toISOString(),
      actionable: true,
      suggestedAction: 'Launch a formal referral program with incentives for enterprise customers',
      impact: '+$500K ARR potential',
      relatedMetrics: ['New MRR', 'Enterprise Customers', 'Referral Rate']
    },
    {
      id: 'ai-dash-002',
      query: "Where should we focus this week?",
      insight: "3 enterprise deals worth $580K are in negotiation stage with expected close this month. Prioritize calls with Nike, Spotify, and Airbnb.",
      confidence: 0.89,
      category: 'conversion' as const,
      priority: 'high' as const,
      timestamp: new Date().toISOString(),
      actionable: true,
      suggestedAction: 'Schedule executive sponsor calls for each deal',
      impact: '$580K potential revenue',
      relatedMetrics: ['Pipeline Value', 'Win Rate', 'Deal Velocity']
    },
    {
      id: 'ai-dash-003',
      query: "Any risks I should know about?",
      insight: "Media Masters has shown declining engagement over 3 weeks. Health score dropped from 78 to 45. High risk of churn ($25K ARR).",
      confidence: 0.91,
      category: 'risk' as const,
      priority: 'high' as const,
      timestamp: new Date().toISOString(),
      actionable: true,
      suggestedAction: 'Schedule urgent customer success call and offer personalized training',
      impact: 'Save $25K ARR',
      relatedMetrics: ['Health Score', 'Churn Risk', 'Engagement']
    },
  ],

  analytics: [
    {
      id: 'ai-an-001',
      query: "What's driving the conversion rate increase?",
      insight: "Mobile users show 45% higher conversion after the checkout redesign. Desktop conversion unchanged. Consider expanding mobile-first features.",
      confidence: 0.92,
      category: 'conversion' as const,
      priority: 'medium' as const,
      timestamp: new Date().toISOString(),
      actionable: true,
      suggestedAction: 'A/B test mobile-first checkout on desktop',
      impact: '+15% overall conversion',
      relatedMetrics: ['Mobile Conversion', 'Desktop Conversion', 'Checkout Rate']
    },
    {
      id: 'ai-an-002',
      query: "Which traffic sources are underperforming?",
      insight: "Organic search traffic dropped 12% this week. Meta descriptions need updating on top 10 landing pages. Competitor X ranking higher for 5 key terms.",
      confidence: 0.87,
      category: 'engagement' as const,
      priority: 'medium' as const,
      timestamp: new Date().toISOString(),
      actionable: true,
      suggestedAction: 'Update meta descriptions and create competitor comparison content',
      impact: '+8% organic traffic',
      relatedMetrics: ['Organic Traffic', 'SEO Rankings', 'Click-through Rate']
    },
    {
      id: 'ai-an-003',
      query: "How can we reduce bounce rate?",
      insight: "Pages with video content have 34% lower bounce rates. Only 15% of high-traffic pages have video. Product demo videos perform best.",
      confidence: 0.89,
      category: 'engagement' as const,
      priority: 'low' as const,
      timestamp: new Date().toISOString(),
      actionable: true,
      suggestedAction: 'Add product demo videos to top 20 landing pages',
      impact: '-10% bounce rate',
      relatedMetrics: ['Bounce Rate', 'Time on Page', 'Video Engagement']
    },
  ],

  crm: [
    {
      id: 'ai-crm-001',
      query: "Which leads should I prioritize?",
      insight: "Focus on TechStart Inc and Growth Partners - both show high engagement (8+ touchpoints) and 60%+ close probability. Combined value: $110K.",
      confidence: 0.91,
      category: 'conversion' as const,
      priority: 'high' as const,
      timestamp: new Date().toISOString(),
      actionable: true,
      suggestedAction: 'Schedule discovery calls this week',
      impact: '$110K potential revenue',
      relatedMetrics: ['Lead Score', 'Engagement Score', 'Pipeline Value']
    },
    {
      id: 'ai-crm-002',
      query: "How can I improve win rate?",
      insight: "Deals with 3+ touchpoints in proposal stage close 40% more often. Enterprise Inc deal has only 2 touchpoints. Add a technical demo.",
      confidence: 0.85,
      category: 'conversion' as const,
      priority: 'medium' as const,
      timestamp: new Date().toISOString(),
      actionable: true,
      suggestedAction: 'Schedule technical deep-dive for Enterprise Inc',
      impact: '+$85K deal probability',
      relatedMetrics: ['Win Rate', 'Touchpoints', 'Sales Cycle']
    },
    {
      id: 'ai-crm-003',
      query: "What's the revenue forecast?",
      insight: "Pipeline value of $2.45M with weighted forecast of $1.47M for this quarter. On track to exceed target by 12%.",
      confidence: 0.88,
      category: 'revenue' as const,
      priority: 'medium' as const,
      timestamp: new Date().toISOString(),
      actionable: false,
      relatedMetrics: ['Pipeline Value', 'Weighted Pipeline', 'Forecast Accuracy']
    },
  ],

  financial: [
    {
      id: 'ai-fin-001',
      query: "How's our cash flow looking?",
      insight: "Operating cash flow is strong at $64K. Consider accelerating AR collections - $185K in receivables are 30+ days overdue.",
      confidence: 0.93,
      category: 'efficiency' as const,
      priority: 'medium' as const,
      timestamp: new Date().toISOString(),
      actionable: true,
      suggestedAction: 'Send follow-up on 30+ day invoices',
      impact: 'Improve cash position by $185K',
      relatedMetrics: ['Cash Flow', 'AR Days', 'Collection Rate']
    },
    {
      id: 'ai-fin-002',
      query: "Where can we reduce expenses?",
      insight: "Marketing spend increased 15% but lead quality dropped. Email campaigns show 3x better ROI than paid ads. Consider reallocation.",
      confidence: 0.87,
      category: 'efficiency' as const,
      priority: 'medium' as const,
      timestamp: new Date().toISOString(),
      actionable: true,
      suggestedAction: 'Shift $15K from paid ads to email marketing',
      impact: '+22% marketing ROI',
      relatedMetrics: ['Marketing Spend', 'CAC', 'Marketing ROI']
    },
    {
      id: 'ai-fin-003',
      query: "What's our runway?",
      insight: "At current burn rate of $425K/month, runway is 24 months. Net income trend is positive - could extend to 30+ months with current trajectory.",
      confidence: 0.85,
      category: 'efficiency' as const,
      priority: 'low' as const,
      timestamp: new Date().toISOString(),
      actionable: false,
      relatedMetrics: ['Runway', 'Burn Rate', 'Net Income']
    },
  ],

  projects: [
    {
      id: 'ai-proj-001',
      query: "Which projects are at risk?",
      insight: "Mobile App Redesign is 2 weeks behind schedule with only 58% complete. Resource constraint identified - Lisa Park is overallocated by 40%.",
      confidence: 0.90,
      category: 'risk' as const,
      priority: 'high' as const,
      timestamp: new Date().toISOString(),
      actionable: true,
      suggestedAction: 'Reassign 2 tasks to junior designer or extend timeline',
      impact: 'Reduce project risk by 60%',
      relatedMetrics: ['Project Progress', 'Resource Utilization', 'Deadline Risk']
    },
    {
      id: 'ai-proj-002',
      query: "How's team velocity trending?",
      insight: "Sprint velocity increased 15% over last 3 sprints. Team can take on 8-10 additional story points next sprint.",
      confidence: 0.86,
      category: 'efficiency' as const,
      priority: 'low' as const,
      timestamp: new Date().toISOString(),
      actionable: true,
      suggestedAction: 'Consider adding Analytics Dashboard to next sprint',
      relatedMetrics: ['Velocity', 'Story Points', 'Sprint Completion']
    },
  ],
}

// Predictions for various metrics
export const PREDICTIONS: Prediction[] = [
  {
    id: 'pred-001',
    metric: 'Monthly Revenue',
    currentValue: 987000,
    predictedValue: 1150000,
    confidence: 0.85,
    trend: 'up',
    timeframe: 'Next 30 days',
    factors: ['Seasonal trend', 'Enterprise deals closing', 'Expansion revenue'],
    accuracy: 92
  },
  {
    id: 'pred-002',
    metric: 'User Growth',
    currentValue: 24892,
    predictedValue: 28500,
    confidence: 0.78,
    trend: 'up',
    timeframe: 'Next 30 days',
    factors: ['Referral program', 'PR coverage', 'Product launch'],
    accuracy: 88
  },
  {
    id: 'pred-003',
    metric: 'Churn Rate',
    currentValue: 2.1,
    predictedValue: 1.8,
    confidence: 0.72,
    trend: 'down',
    timeframe: 'Next 30 days',
    factors: ['Support improvements', 'Feature releases', 'Customer success initiatives'],
    accuracy: 85
  },
  {
    id: 'pred-004',
    metric: 'NPS Score',
    currentValue: 72,
    predictedValue: 76,
    confidence: 0.80,
    trend: 'up',
    timeframe: 'Next quarter',
    factors: ['Product improvements', 'Support response time', 'New features'],
    accuracy: 90
  },
  {
    id: 'pred-005',
    metric: 'Enterprise Customers',
    currentValue: 156,
    predictedValue: 185,
    confidence: 0.75,
    trend: 'up',
    timeframe: 'End of Q1',
    factors: ['Pipeline quality', 'Sales team expansion', 'Enterprise features'],
    accuracy: 87
  },
]

// AI-generated recommendations
export const AI_RECOMMENDATIONS = [
  {
    id: 'rec-001',
    title: 'Launch Customer Referral Program',
    description: 'Your top customers have referred 23 accounts organically. A formal program could 3x this.',
    impact: 'High',
    effort: 'Medium',
    category: 'Growth',
    potentialValue: 500000,
    timeToImplement: '2 weeks'
  },
  {
    id: 'rec-002',
    title: 'Add Video Content to Landing Pages',
    description: 'Pages with video have 34% lower bounce rate. Add demos to top 20 pages.',
    impact: 'Medium',
    effort: 'Low',
    category: 'Conversion',
    potentialValue: 120000,
    timeToImplement: '1 week'
  },
  {
    id: 'rec-003',
    title: 'Automate AR Follow-up',
    description: '$185K in receivables are 30+ days. Automated reminders could reduce this by 60%.',
    impact: 'High',
    effort: 'Low',
    category: 'Operations',
    potentialValue: 111000,
    timeToImplement: '3 days'
  },
  {
    id: 'rec-004',
    title: 'Enterprise Customer Onboarding',
    description: 'Enterprise customers with dedicated onboarding show 45% higher retention. Scale this program.',
    impact: 'High',
    effort: 'Medium',
    category: 'Retention',
    potentialValue: 380000,
    timeToImplement: '4 weeks'
  },
]
