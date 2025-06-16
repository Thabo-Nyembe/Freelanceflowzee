# 📊 FreeflowZee Analytics Integration Guide

## 🎯 Overview

FreeflowZee now has a comprehensive dual analytics system:
1. **Vercel Analytics** - For web vitals, page views, and core metrics
2. **Custom Analytics** - For detailed business metrics, user behavior, and performance tracking

## 🚀 What's Implemented

### ✅ Vercel Analytics Setup
- **Package**: `@vercel/analytics` installed
- **Integration**: Added to root layout (`app/layout.tsx`)
- **Automatic Tracking**: Page views, web vitals, and core user interactions

### ✅ Custom Analytics System
- **Database**: Complete analytics tables in Supabase
- **API Endpoints**: `/api/analytics/events` and `/api/analytics/dashboard`
- **React Hook**: `useAnalytics()` for easy tracking
- **Real-time Dashboard**: Analytics dashboard at `/dashboard/analytics`

## 📈 Key Features

### 1. Automatic Tracking
```typescript
// Page views are automatically tracked
// Performance metrics (LCP, FID, CLS) are automatically collected
// JavaScript errors are automatically captured
```

### 2. Custom Event Tracking
```typescript
import { useAnalytics } from '@/hooks/use-analytics'

const analytics = useAnalytics()

// Track user actions
analytics.trackUserAction('button_click', 'cta_signup')

// Track business metrics
analytics.trackBusinessMetric('revenue', 299.99, 'usd')

// Track file uploads
analytics.trackFileUpload('project_file', 'pdf', 2048)

// Track payments
analytics.trackPayment(299.99, 'usd', 'project_payment')
```

### 3. Performance Monitoring
- **Core Web Vitals**: LCP, FID, CLS automatically tracked
- **Page Load Times**: Complete navigation timing
- **Error Tracking**: JavaScript errors and promise rejections
- **Custom Performance Metrics**: Track any custom timing

### 4. Business Intelligence
- **User Behavior**: Track user flows and conversion funnels
- **Revenue Tracking**: Monitor payments and subscription metrics
- **Project Analytics**: Track project creation, completion rates
- **File Usage**: Monitor upload/download patterns

## 🔧 Usage Examples

### Basic Event Tracking
```typescript
// In any React component
const analytics = useAnalytics()

const handleProjectCreate = () => {
  // Your project creation logic
  createProject(projectData)
  
  // Track the event
  analytics.trackEvent('project', 'project_created', {
    project_type: 'web_design',
    estimated_value: 1500
  })
}
```

### Advanced Analytics Component
```typescript
'use client'

import { useAnalytics } from '@/hooks/use-analytics'
import { useEffect } from 'react'

export function ProjectAnalytics({ projectId }: { projectId: string }) {
  const analytics = useAnalytics()
  
  useEffect(() => {
    // Track project view
    analytics.trackPageView(`/projects/${projectId}`, 'Project Detail')
    
    // Track time spent on project
    const startTime = Date.now()
    
    return () => {
      const timeSpent = Date.now() - startTime
      analytics.trackEvent('engagement', 'project_time_spent', {
        project_id: projectId,
        time_spent_ms: timeSpent
      })
    }
  }, [projectId])
  
  return null // This is a tracking component
}
```

## 📊 Analytics Dashboard

Access the analytics dashboard at `/dashboard/analytics` to view:
- **Real-time Metrics**: Active sessions, events per hour
- **Performance Data**: Page load times, Core Web Vitals
- **User Behavior**: Top pages, user flows
- **Business Metrics**: Revenue, conversions, project stats
- **Error Monitoring**: JavaScript errors, API failures

## 🚀 Deployment Configuration

### Vercel Configuration
```bash
# Vercel automatically detects and enables analytics
# No additional configuration needed
```

### Environment Variables
```bash
# Already configured in .env.local
NEXT_PUBLIC_SUPABASE_URL=https://ouzcjoxaupimazrivyta.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Production Setup
1. **Vercel Analytics**: Automatically enabled on Vercel deployment
2. **Custom Analytics**: Database tables created in Supabase
3. **API Endpoints**: Ready for production use
4. **Performance Monitoring**: Automatic web vitals collection

## 🔒 Privacy & Compliance

### Data Collection
- **Anonymous by Default**: User ID only tracked for authenticated users
- **GDPR Compliant**: User can be excluded from tracking
- **Minimal Data**: Only essential metrics collected
- **Local Storage**: Session data stored locally

### Opt-out Support
```typescript
// Disable analytics for user
analytics.setEnabled(false)

// Check if enabled
if (analytics.isEnabled()) {
  analytics.trackEvent('user_action', 'button_click')
}
```

## 📈 Analytics Events Reference

### Standard Events
| Event Type | Event Name | Description |
|------------|------------|-------------|
| `page_view` | `page_visited` | User visits a page |
| `user_action` | `button_click` | User clicks a button |
| `user_action` | `form_submit` | User submits a form |
| `business_metric` | `project_created` | New project created |
| `business_metric` | `payment_completed` | Payment processed |
| `performance` | `page_load_time` | Page load performance |
| `error` | `javascript_error` | JavaScript error occurred |

### Custom Properties
Each event can include custom properties:
```typescript
analytics.trackEvent('user_action', 'file_upload', {
  file_type: 'pdf',
  file_size: 2048576,
  project_id: 'proj_123',
  upload_method: 'drag_drop'
})
```

## 🛠️ Development Tips

### Testing Analytics
```bash
# Test analytics API
curl -X POST http://localhost:3000/api/analytics/events \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "test",
    "event_name": "test_event",
    "session_id": "test_session",
    "properties": {"source": "api_test"}
  }'
```

### Debug Mode
```typescript
// Enable analytics debugging
if (process.env.NODE_ENV === 'development') {
  analytics.enableDebug()
}
```

## 🎯 Next Steps

1. **Custom Dashboards**: Create role-specific analytics views
2. **A/B Testing**: Integrate experimentation tracking
3. **Advanced Segmentation**: User cohort analysis
4. **Predictive Analytics**: ML-powered insights
5. **Real-time Alerts**: Automated monitoring and notifications

## 📞 Support

For analytics questions or issues:
- Check the console for debug information
- Review API responses in Network tab
- Verify database tables in Supabase
- Test events in development mode

---

**🎉 Analytics system is fully operational and ready for production!**

Track everything that matters to grow your FreeflowZee platform. 