'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import * as adapters from './adapters'
import { COMPANY_INFO, REVENUE_TREND, USER_GROWTH_TREND } from './company'
import { TOP_CUSTOMERS, TOP_COMPANIES, DEALS, CUSTOMER_STATS } from './customers'
import { TEAM_MEMBERS, COLLABORATORS, TEAM_STATS } from './team'
import { PROJECTS, TASKS, PROJECT_STATS, CURRENT_SPRINT } from './projects'
import { INVOICES, TRANSACTIONS, FINANCIAL_KPIS, PROFIT_LOSS } from './financials'
import { BUSINESS_METRICS, PRODUCT_METRICS, SALES_METRICS, REALTIME_METRICS } from './metrics'
import { RECENT_ACTIVITIES, NOTIFICATIONS, QUICK_ACTIONS } from './activities'
import { AI_INSIGHTS, PREDICTIONS, AI_RECOMMENDATIONS } from './ai-insights'
import { PRODUCTS, ORDERS, ORDER_STATS } from './products'
import { CONVERSATIONS, MESSAGES, EMAILS, CALENDAR_EVENTS } from './communications'
import { INTEGRATIONS, WEBHOOKS, API_KEYS } from './integrations'

// Complete mock data context type
interface MockDataContextType {
  // Company & Business
  company: typeof COMPANY_INFO
  revenueTrend: typeof REVENUE_TREND
  userGrowth: typeof USER_GROWTH_TREND

  // Customers & CRM
  customers: typeof TOP_CUSTOMERS
  companies: typeof TOP_COMPANIES
  deals: typeof DEALS
  customerStats: typeof CUSTOMER_STATS

  // Team
  teamMembers: typeof TEAM_MEMBERS
  collaborators: typeof COLLABORATORS
  teamStats: typeof TEAM_STATS

  // Projects
  projects: typeof PROJECTS
  tasks: typeof TASKS
  projectStats: typeof PROJECT_STATS
  currentSprint: typeof CURRENT_SPRINT

  // Financial
  invoices: typeof INVOICES
  transactions: typeof TRANSACTIONS
  financialKpis: typeof FINANCIAL_KPIS
  profitLoss: typeof PROFIT_LOSS

  // Metrics
  businessMetrics: typeof BUSINESS_METRICS
  productMetrics: typeof PRODUCT_METRICS
  salesMetrics: typeof SALES_METRICS
  realtimeMetrics: typeof REALTIME_METRICS

  // Activities & Notifications
  activities: typeof RECENT_ACTIVITIES
  notifications: typeof NOTIFICATIONS
  quickActions: typeof QUICK_ACTIONS

  // AI
  aiInsights: typeof AI_INSIGHTS
  predictions: typeof PREDICTIONS
  aiRecommendations: typeof AI_RECOMMENDATIONS

  // E-commerce
  products: typeof PRODUCTS
  orders: typeof ORDERS
  orderStats: typeof ORDER_STATS

  // Communication
  conversations: typeof CONVERSATIONS
  messages: typeof MESSAGES
  emails: typeof EMAILS
  calendarEvents: typeof CALENDAR_EVENTS

  // Integrations
  integrations: typeof INTEGRATIONS
  webhooks: typeof WEBHOOKS
  apiKeys: typeof API_KEYS

  // Adapters for specific pages
  adapters: typeof adapters
}

const MockDataContext = createContext<MockDataContextType | null>(null)

export function MockDataProvider({ children }: { children: ReactNode }) {
  const value: MockDataContextType = {
    // Company & Business
    company: COMPANY_INFO,
    revenueTrend: REVENUE_TREND,
    userGrowth: USER_GROWTH_TREND,

    // Customers & CRM
    customers: TOP_CUSTOMERS,
    companies: TOP_COMPANIES,
    deals: DEALS,
    customerStats: CUSTOMER_STATS,

    // Team
    teamMembers: TEAM_MEMBERS,
    collaborators: COLLABORATORS,
    teamStats: TEAM_STATS,

    // Projects
    projects: PROJECTS,
    tasks: TASKS,
    projectStats: PROJECT_STATS,
    currentSprint: CURRENT_SPRINT,

    // Financial
    invoices: INVOICES,
    transactions: TRANSACTIONS,
    financialKpis: FINANCIAL_KPIS,
    profitLoss: PROFIT_LOSS,

    // Metrics
    businessMetrics: BUSINESS_METRICS,
    productMetrics: PRODUCT_METRICS,
    salesMetrics: SALES_METRICS,
    realtimeMetrics: REALTIME_METRICS,

    // Activities & Notifications
    activities: RECENT_ACTIVITIES,
    notifications: NOTIFICATIONS,
    quickActions: QUICK_ACTIONS,

    // AI
    aiInsights: AI_INSIGHTS,
    predictions: PREDICTIONS,
    aiRecommendations: AI_RECOMMENDATIONS,

    // E-commerce
    products: PRODUCTS,
    orders: ORDERS,
    orderStats: ORDER_STATS,

    // Communication
    conversations: CONVERSATIONS,
    messages: MESSAGES,
    emails: EMAILS,
    calendarEvents: CALENDAR_EVENTS,

    // Integrations
    integrations: INTEGRATIONS,
    webhooks: WEBHOOKS,
    apiKeys: API_KEYS,

    // Adapters
    adapters,
  }

  return (
    <MockDataContext.Provider value={value}>
      {children}
    </MockDataContext.Provider>
  )
}

// Hook to access all mock data
export function useMockData() {
  const context = useContext(MockDataContext)
  if (!context) {
    throw new Error('useMockData must be used within a MockDataProvider')
  }
  return context
}

// Convenience hooks for specific data categories
export function useCompanyData() {
  const { company, revenueTrend, userGrowth } = useMockData()
  return { company, revenueTrend, userGrowth }
}

export function useCRMData() {
  const { customers, companies, deals, customerStats, adapters } = useMockData()
  return {
    customers,
    companies,
    deals,
    customerStats,
    contacts: adapters.crmContacts,
    activities: adapters.crmActivities,
    insights: adapters.crmAIInsights,
    predictions: adapters.crmPredictions,
  }
}

export function useFinancialData() {
  const { invoices, transactions, financialKpis, profitLoss, adapters } = useMockData()
  return {
    invoices,
    transactions,
    financialKpis,
    profitLoss,
    accounts: adapters.financialAccounts,
    bankAccounts: adapters.financialBankAccounts,
    insights: adapters.financialAIInsights,
  }
}

export function useProjectData() {
  const { projects, tasks, projectStats, currentSprint, adapters } = useMockData()
  return {
    projects,
    tasks,
    projectStats,
    currentSprint,
    insights: adapters.projectAIInsights,
    collaborators: adapters.projectCollaborators,
  }
}

export function useAnalyticsData() {
  const { businessMetrics, productMetrics, salesMetrics, realtimeMetrics, adapters } = useMockData()
  return {
    businessMetrics,
    productMetrics,
    salesMetrics,
    realtimeMetrics,
    metrics: adapters.analyticsMetrics,
    funnels: adapters.analyticsFunnels,
    cohorts: adapters.analyticsCohorts,
    reports: adapters.analyticsReports,
    dashboards: adapters.analyticsDashboards,
    insights: adapters.analyticsAIInsights,
    keyMetrics: adapters.analyticsKeyMetrics,
  }
}

export function useTeamData() {
  const { teamMembers, collaborators, teamStats, adapters } = useMockData()
  return {
    teamMembers,
    collaborators,
    teamStats,
    departments: adapters.departmentsList,
  }
}

export function useActivityData() {
  const { activities, notifications, quickActions } = useMockData()
  return { activities, notifications, quickActions }
}

export function useAIData() {
  const { aiInsights, predictions, aiRecommendations } = useMockData()
  return { aiInsights, predictions, aiRecommendations }
}

export function useEcommerceData() {
  const { products, orders, orderStats, adapters } = useMockData()
  return {
    products,
    orders,
    orderStats,
    inventory: adapters.inventorySummary,
  }
}

export function useCommunicationData() {
  const { conversations, messages, emails, calendarEvents, adapters } = useMockData()
  return {
    conversations,
    messages,
    emails,
    calendarEvents,
    stats: adapters.communicationStats,
  }
}

export function useIntegrationData() {
  const { integrations, webhooks, apiKeys, adapters } = useMockData()
  return {
    integrations,
    webhooks,
    apiKeys,
    categories: adapters.integrationCategories,
    stats: adapters.integrationStats,
  }
}
