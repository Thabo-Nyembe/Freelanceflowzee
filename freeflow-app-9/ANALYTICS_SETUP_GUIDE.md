# 📊 FreeflowZee Analytics Setup Guide

## 🎯 Current Status
✅ **Vercel Analytics**: Fully integrated and working  
⚠️  **Custom Analytics**: Database setup required (2 minutes)

## 🚀 Manual Database Setup (Required)

Since automated setup is encountering permission issues, please follow these steps:

### Step 1: Go to Supabase SQL Editor
1. Visit: https://app.supabase.com/project/ouzcjoxaupimazrivyta/sql
2. Login to your Supabase dashboard

### Step 2: Copy and Execute This SQL

```sql
-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  event_name VARCHAR(100) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id VARCHAR(100) NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  properties JSONB DEFAULT '{}',
  page_url TEXT,
  user_agent TEXT,
  ip_address INET,
  performance_metrics JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create business_metrics table
CREATE TABLE IF NOT EXISTS business_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name VARCHAR(100) NOT NULL,
  value DECIMAL(15,2) NOT NULL,
  unit VARCHAR(20) DEFAULT 'count',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  properties JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id VARCHAR(100) UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  duration_seconds INTEGER,
  page_views INTEGER DEFAULT 0,
  events_count INTEGER DEFAULT 0,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_business_metrics_user_id ON business_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_business_metrics_timestamp ON business_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_business_metrics_metric_name ON business_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);

-- Enable Row Level Security
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY IF NOT EXISTS "Users can insert their own analytics events" 
ON analytics_events FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY IF NOT EXISTS "Users can view their own analytics events" 
ON analytics_events FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY IF NOT EXISTS "Users can insert their own business metrics" 
ON business_metrics FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY IF NOT EXISTS "Users can view their own business metrics" 
ON business_metrics FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY IF NOT EXISTS "Users can manage their own sessions" 
ON user_sessions FOR ALL 
USING (auth.uid() = user_id OR user_id IS NULL);
```

### Step 3: Verify Setup
After running the SQL, you should see a success message. Then test:

```bash
npm run dev
curl -X POST "http://localhost:3000/api/analytics/events" \
  -H "Content-Type: application/json" \
  -d '{"event_type":"test","event_name":"setup_test","session_id":"test_123"}'
```

## 🎉 What You'll Have After Setup

### ✅ Vercel Analytics (Already Working)
- Automatic page views and web vitals
- Performance tracking (LCP, FID, CLS)
- Error monitoring
- User interactions

### ✅ Custom Analytics (After Database Setup)
- **Real-time Dashboard**: `/dashboard/analytics`
- **Event Tracking**: User actions, performance, business metrics
- **Business Intelligence**: Revenue tracking, project analytics
- **Session Management**: User journey tracking

## 📊 Usage Examples

### Track Custom Events
```typescript
import { useAnalytics } from '@/hooks/use-analytics'

const { trackEvent, trackPageView, trackPayment } = useAnalytics()

// Track user actions
trackEvent('user_action', 'button_click', { button: 'upgrade' })

// Track business metrics
trackPayment(299, 'usd', 'subscription')

// Track page performance
trackPageView('/dashboard', { load_time: 1200 })
```

### View Analytics Dashboard
Visit `/dashboard/analytics` to see:
- Real-time metrics (sessions, events, revenue)
- Performance charts
- Top pages analysis
- Business KPIs

## 🔧 Technical Details

### Database Tables Created
1. **analytics_events**: User interactions, page views, performance
2. **business_metrics**: Revenue, conversions, business KPIs  
3. **user_sessions**: Session tracking and user journey

### Security Features
- Row Level Security (RLS) enabled
- User data isolation
- Authenticated API endpoints
- Privacy-compliant tracking

### Performance Optimizations
- Indexed queries for fast analytics
- Efficient data aggregation
- Real-time updates
- Minimal client-side overhead

## 🎯 Next Steps

1. **Complete Database Setup** (2 minutes)
2. **Test Analytics API** (1 minute)
3. **Visit Analytics Dashboard** (instant)
4. **Monitor Performance** (ongoing)

After setup, your FreeflowZee platform will have enterprise-grade analytics comparable to Google Analytics, but with full data ownership and privacy control!
