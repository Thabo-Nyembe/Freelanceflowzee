-- ============================================================================
-- KAZI Comprehensive Investor Demo - SQL Seed Data
-- ============================================================================
-- Demo User: alex@freeflow.io
-- Password: investor2026
-- User ID: 00000000-0000-0000-0000-000000000001
--
-- This script populates ALL dashboard features with realistic data showing:
-- - 12-month growth trajectory from $0 to $172K revenue
-- - 12 active clients with 92% retention
-- - $163K pipeline value
-- - 94% on-time delivery
-- - 4.8/5 client satisfaction
--
-- Run with: psql $DATABASE_URL -f seeds/comprehensive-investor-demo-data.sql
-- Or through Supabase SQL editor
-- ============================================================================

-- Demo user ID
DO $$
DECLARE
  demo_user_id UUID := '00000000-0000-0000-0000-000000000001';

  -- Client IDs
  client1_id UUID := gen_random_uuid();
  client2_id UUID := gen_random_uuid();
  client3_id UUID := gen_random_uuid();
  client4_id UUID := gen_random_uuid();
  client5_id UUID := gen_random_uuid();
  client6_id UUID := gen_random_uuid();
  client7_id UUID := gen_random_uuid();
  client8_id UUID := gen_random_uuid();
  client9_id UUID := gen_random_uuid();
  client10_id UUID := gen_random_uuid();
  client11_id UUID := gen_random_uuid();
  client12_id UUID := gen_random_uuid();

  -- Project IDs
  proj1_id UUID := gen_random_uuid();
  proj2_id UUID := gen_random_uuid();
  proj3_id UUID := gen_random_uuid();
  proj4_id UUID := gen_random_uuid();
  proj5_id UUID := gen_random_uuid();
  proj6_id UUID := gen_random_uuid();
  proj7_id UUID := gen_random_uuid();
  proj8_id UUID := gen_random_uuid();
  proj9_id UUID := gen_random_uuid();
  proj10_id UUID := gen_random_uuid();
  proj11_id UUID := gen_random_uuid();
  proj12_id UUID := gen_random_uuid();

  -- Calendar ID
  calendar_id UUID := gen_random_uuid();

  -- Chat IDs
  chat1_id UUID := gen_random_uuid();
  chat2_id UUID := gen_random_uuid();
  chat3_id UUID := gen_random_uuid();

BEGIN

-- ============================================================================
-- CLEAN UP EXISTING DEMO DATA
-- ============================================================================
DELETE FROM dashboard_activities WHERE user_id = demo_user_id;
DELETE FROM dashboard_projects WHERE user_id = demo_user_id;
DELETE FROM dashboard_insights WHERE user_id = demo_user_id;
DELETE FROM dashboard_metrics WHERE user_id = demo_user_id;
DELETE FROM dashboard_goals WHERE user_id = demo_user_id;
DELETE FROM dashboard_notifications WHERE user_id = demo_user_id;
DELETE FROM dashboard_stats WHERE user_id = demo_user_id;

-- ============================================================================
-- DASHBOARD STATS
-- ============================================================================
INSERT INTO dashboard_stats (
  user_id, earnings, earnings_trend, active_projects, active_projects_trend,
  completed_projects, completed_projects_trend, total_clients, total_clients_trend,
  hours_this_month, hours_this_month_trend, revenue_this_month, revenue_this_month_trend,
  average_project_value, average_project_value_trend, client_satisfaction, client_satisfaction_trend,
  productivity_score, productivity_score_trend, pending_tasks, overdue_tasks,
  upcoming_meetings, unread_messages, last_updated, created_at
) VALUES (
  demo_user_id, 172500, 25.7, 3, 15,
  9, 25, 12, 20,
  165, 8, 22000, 25.7,
  14500, 18, 4.8, 0.2,
  92, 5, 12, 2,
  5, 8, NOW(), NOW() - INTERVAL '12 months'
) ON CONFLICT (user_id) DO UPDATE SET
  earnings = EXCLUDED.earnings,
  earnings_trend = EXCLUDED.earnings_trend,
  active_projects = EXCLUDED.active_projects,
  completed_projects = EXCLUDED.completed_projects,
  total_clients = EXCLUDED.total_clients,
  revenue_this_month = EXCLUDED.revenue_this_month,
  last_updated = NOW();

-- ============================================================================
-- DASHBOARD PROJECTS
-- ============================================================================
INSERT INTO dashboard_projects (
  id, user_id, name, client, progress, status, value, currency, priority, category,
  ai_automation, collaboration, deadline, start_date, description, tags,
  is_starred, is_pinned, completed_tasks, total_tasks, hours_logged, hours_estimated,
  budget, spent, created_at, updated_at
) VALUES
-- Completed projects
(proj1_id, demo_user_id, 'Brand Identity Refresh', 'TechVenture Capital', 100, 'Completed', 3500, 'USD', 'medium', 'design',
 true, 2, NOW() - INTERVAL '10 months', NOW() - INTERVAL '11 months', 'Complete brand refresh including logo, colors, and guidelines', ARRAY['finance', 'design'],
 false, false, 25, 25, 35, 40, 3500, 3220, NOW() - INTERVAL '11 months', NOW() - INTERVAL '10 months'),

(proj2_id, demo_user_id, 'Website Redesign', 'Urban Fitness Studio', 100, 'Completed', 5000, 'USD', 'medium', 'design',
 false, 1, NOW() - INTERVAL '9 months', NOW() - INTERVAL '10 months', 'Modern fitness studio website with booking system', ARRAY['health', 'design'],
 false, false, 20, 20, 50, 55, 5000, 4600, NOW() - INTERVAL '10 months', NOW() - INTERVAL '9 months'),

(proj3_id, demo_user_id, 'E-commerce Platform Build', 'GreenLeaf Organics', 100, 'Completed', 15000, 'USD', 'high', 'development',
 true, 3, NOW() - INTERVAL '7 months', NOW() - INTERVAL '8 months', 'Full e-commerce platform with payment processing', ARRAY['ecommerce', 'development'],
 true, false, 45, 45, 120, 130, 15000, 13800, NOW() - INTERVAL '8 months', NOW() - INTERVAL '7 months'),

(proj4_id, demo_user_id, 'Mobile App MVP', 'CloudSync Solutions', 100, 'Completed', 25000, 'USD', 'high', 'development',
 true, 4, NOW() - INTERVAL '5 months', NOW() - INTERVAL '7 months', 'Enterprise mobile app with real-time sync', ARRAY['saas', 'development', 'enterprise'],
 true, false, 60, 60, 180, 190, 25000, 23000, NOW() - INTERVAL '7 months', NOW() - INTERVAL '5 months'),

(proj5_id, demo_user_id, 'Marketing Automation Setup', 'Stellar Marketing Agency', 100, 'Completed', 8000, 'USD', 'medium', 'marketing',
 true, 2, NOW() - INTERVAL '6 months', NOW() - INTERVAL '7 months', 'HubSpot integration with custom workflows', ARRAY['marketing', 'automation'],
 false, false, 28, 28, 65, 70, 8000, 7360, NOW() - INTERVAL '7 months', NOW() - INTERVAL '6 months'),

(proj6_id, demo_user_id, 'Data Dashboard Development', 'DataPulse Analytics', 100, 'Completed', 18000, 'USD', 'high', 'development',
 true, 3, NOW() - INTERVAL '3 months', NOW() - INTERVAL '5 months', 'AI-powered analytics dashboard with custom visualizations', ARRAY['technology', 'development', 'ai'],
 true, false, 50, 50, 140, 150, 18000, 16560, NOW() - INTERVAL '5 months', NOW() - INTERVAL '3 months'),

-- In Progress projects
(proj7_id, demo_user_id, 'AI Analytics Dashboard', 'DataPulse Analytics', 75, 'In Progress', 35000, 'USD', 'high', 'development',
 true, 4, NOW() + INTERVAL '30 days', NOW() - INTERVAL '2 months', 'Phase 2: Advanced AI features and automation', ARRAY['technology', 'development', 'ai'],
 true, true, 38, 50, 85, 120, 35000, 26250, NOW() - INTERVAL '2 months', NOW() - INTERVAL '1 day'),

(proj8_id, demo_user_id, 'Enterprise Portal Redesign', 'Nexus Innovations', 45, 'In Progress', 28000, 'USD', 'high', 'design',
 false, 3, NOW() + INTERVAL '45 days', NOW() - INTERVAL '1 month', 'Complete UX overhaul for enterprise portal', ARRAY['technology', 'design', 'enterprise'],
 true, true, 18, 40, 45, 100, 28000, 12600, NOW() - INTERVAL '1 month', NOW() - INTERVAL '2 days'),

(proj9_id, demo_user_id, 'Supply Chain Optimization', 'Velocity Logistics', 30, 'In Progress', 22000, 'USD', 'high', 'consulting',
 true, 2, NOW() + INTERVAL '60 days', NOW() - INTERVAL '1 month', 'Supply chain digitization and optimization', ARRAY['logistics', 'consulting'],
 false, true, 12, 40, 30, 100, 22000, 6600, NOW() - INTERVAL '1 month', NOW() - INTERVAL '1 day'),

-- Pipeline projects
(proj10_id, demo_user_id, 'Brand Strategy Consulting', 'Nordic Design Co', 0, 'Not Started', 15000, 'USD', 'medium', 'consulting',
 false, 0, NOW() + INTERVAL '90 days', NOW() + INTERVAL '30 days', 'Comprehensive brand strategy engagement', ARRAY['design', 'consulting'],
 false, false, 0, 25, 0, 75, 15000, 0, NOW(), NOW()),

(proj11_id, demo_user_id, 'Mobile App Phase 2', 'CloudSync Solutions', 0, 'Not Started', 30000, 'USD', 'high', 'development',
 true, 0, NOW() + INTERVAL '120 days', NOW() + INTERVAL '45 days', 'Phase 2 features: offline mode, team collaboration', ARRAY['saas', 'development'],
 true, false, 0, 65, 0, 200, 30000, 0, NOW(), NOW()),

(proj12_id, demo_user_id, 'Q2 Marketing Campaign', 'Artisan Coffee Roasters', 0, 'Not Started', 8000, 'USD', 'low', 'marketing',
 false, 0, NOW() + INTERVAL '75 days', NOW() + INTERVAL '30 days', 'Social media and content marketing campaign', ARRAY['fnb', 'marketing'],
 false, false, 0, 20, 0, 60, 8000, 0, NOW(), NOW());

-- ============================================================================
-- DASHBOARD ACTIVITIES
-- ============================================================================
INSERT INTO dashboard_activities (
  user_id, type, message, description, time, status, impact, is_read, created_at
) VALUES
(demo_user_id, 'payment', 'Payment received from DataPulse Analytics', '$17,500 for AI Dashboard milestone', NOW() - INTERVAL '1 day', 'success', 'high', false, NOW() - INTERVAL '1 day'),
(demo_user_id, 'project', 'Project milestone completed', 'AI Analytics Dashboard - Phase 2 delivered', NOW() - INTERVAL '2 days', 'success', 'high', false, NOW() - INTERVAL '2 days'),
(demo_user_id, 'client', 'New enterprise client signed', 'Nexus Innovations - $28,000 contract', NOW() - INTERVAL '3 days', 'success', 'critical', false, NOW() - INTERVAL '3 days'),
(demo_user_id, 'feedback', '5-star review received', 'CloudSync Solutions: "Exceptional work on the mobile app!"', NOW() - INTERVAL '4 days', 'success', 'medium', true, NOW() - INTERVAL '4 days'),
(demo_user_id, 'project', 'Project started', 'Supply Chain Optimization for Velocity Logistics', NOW() - INTERVAL '5 days', 'info', 'medium', true, NOW() - INTERVAL '5 days'),
(demo_user_id, 'message', 'Client message received', 'Sarah Mitchell wants to discuss Q2 roadmap', NOW() - INTERVAL '5 days', 'info', 'low', true, NOW() - INTERVAL '5 days'),
(demo_user_id, 'action', 'Invoice sent', 'INV-2026-042 to Nexus Innovations - $14,000', NOW() - INTERVAL '6 days', 'info', 'medium', true, NOW() - INTERVAL '6 days'),
(demo_user_id, 'system', 'Weekly report generated', 'Revenue up 12% from last week', NOW() - INTERVAL '7 days', 'success', 'low', true, NOW() - INTERVAL '7 days'),
(demo_user_id, 'payment', 'Largest payment received', '$25,000 from CloudSync Solutions', NOW() - INTERVAL '2 months', 'success', 'critical', true, NOW() - INTERVAL '2 months'),
(demo_user_id, 'client', 'Hit 10 client milestone', 'Growing client base showing strong retention', NOW() - INTERVAL '3 months', 'success', 'high', true, NOW() - INTERVAL '3 months'),
(demo_user_id, 'project', 'First $20K+ project completed', 'Mobile App MVP for CloudSync Solutions', NOW() - INTERVAL '5 months', 'success', 'critical', true, NOW() - INTERVAL '5 months'),
(demo_user_id, 'action', 'First recurring client', 'TechVenture Capital signed retainer agreement', NOW() - INTERVAL '8 months', 'success', 'high', true, NOW() - INTERVAL '8 months');

-- ============================================================================
-- DASHBOARD INSIGHTS (AI-Generated)
-- ============================================================================
INSERT INTO dashboard_insights (
  user_id, type, title, description, impact, action, action_url, confidence, priority,
  category, is_ai_generated, acted_upon, created_at, expires_at, updated_at
) VALUES
(demo_user_id, 'revenue', 'Revenue milestone approaching', 'You''re on track to hit $200K annual revenue. At current pace, you''ll reach this in 8 weeks.', 'high', 'Review pricing strategy', '/dashboard/analytics', 92, 1, 'financial', true, false, NOW() - INTERVAL '2 days', NOW() + INTERVAL '14 days', NOW()),
(demo_user_id, 'opportunity', 'High-value lead ready to convert', 'Thomas Wright from Horizon Tech (score: 92) has viewed your proposal 5 times. Consider follow-up call.', 'critical', 'Schedule call', '/dashboard/leads', 88, 2, 'sales', true, false, NOW() - INTERVAL '1 day', NOW() + INTERVAL '14 days', NOW()),
(demo_user_id, 'productivity', 'Optimal billing rate identified', 'Analysis shows you could increase hourly rate by 15% without losing clients. Current avg: $135/hr, suggested: $155/hr.', 'high', 'Update rate card', '/dashboard/settings', 85, 3, 'pricing', true, false, NOW() - INTERVAL '3 days', NOW() + INTERVAL '14 days', NOW()),
(demo_user_id, 'client', 'Upsell opportunity detected', 'GreenLeaf Organics engagement score is 95%. They may be ready for ongoing retainer ($3K/month potential).', 'medium', 'Send proposal', '/dashboard/clients', 78, 4, 'sales', true, false, NOW() - INTERVAL '4 days', NOW() + INTERVAL '14 days', NOW()),
(demo_user_id, 'risk', 'Project timeline at risk', 'Enterprise Portal Redesign is 5 days behind schedule. Consider reallocating 10 hours this week.', 'high', 'Review timeline', '/dashboard/projects', 91, 5, 'project', true, false, NOW() - INTERVAL '1 day', NOW() + INTERVAL '14 days', NOW());

-- ============================================================================
-- DASHBOARD METRICS
-- ============================================================================
INSERT INTO dashboard_metrics (
  user_id, name, value, previous_value, change, change_percent, trend, unit, icon, color, is_positive, category, last_updated, created_at
) VALUES
(demo_user_id, 'Total Revenue', 172500, 129375, 43125, 33.3, 'up', 'USD', 'dollar-sign', 'green', true, 'financial', NOW(), NOW() - INTERVAL '12 months'),
(demo_user_id, 'Active Projects', 3, 2, 1, 50, 'up', 'count', 'folder', 'blue', true, 'projects', NOW(), NOW() - INTERVAL '12 months'),
(demo_user_id, 'Pipeline Value', 163000, 120000, 43000, 35.8, 'up', 'USD', 'trending-up', 'purple', true, 'sales', NOW(), NOW() - INTERVAL '12 months'),
(demo_user_id, 'Billable Hours', 165, 152, 13, 8.6, 'up', 'hours', 'clock', 'orange', true, 'time', NOW(), NOW() - INTERVAL '12 months'),
(demo_user_id, 'Client Satisfaction', 4.8, 4.6, 0.2, 4.3, 'up', 'rating', 'star', 'yellow', true, 'quality', NOW(), NOW() - INTERVAL '12 months'),
(demo_user_id, 'Conversion Rate', 45, 38, 7, 18.4, 'up', '%', 'target', 'teal', true, 'sales', NOW(), NOW() - INTERVAL '12 months'),
(demo_user_id, 'Avg Project Value', 14500, 11000, 3500, 31.8, 'up', 'USD', 'bar-chart', 'indigo', true, 'financial', NOW(), NOW() - INTERVAL '12 months'),
(demo_user_id, 'On-time Delivery', 94, 89, 5, 5.6, 'up', '%', 'check-circle', 'green', true, 'quality', NOW(), NOW() - INTERVAL '12 months');

-- ============================================================================
-- DASHBOARD GOALS
-- ============================================================================
INSERT INTO dashboard_goals (
  user_id, title, description, target, current, progress, unit, deadline, status, category, created_at, updated_at
) VALUES
(demo_user_id, 'Hit $200K Annual Revenue', 'Reach $200,000 in total revenue for the year', 200000, 172500, 86, 'USD', NOW() + INTERVAL '60 days', 'on-track', 'financial', NOW() - INTERVAL '6 months', NOW()),
(demo_user_id, 'Acquire 5 Enterprise Clients', 'Sign contracts with 5 enterprise-level clients', 5, 4, 80, 'clients', NOW() + INTERVAL '90 days', 'on-track', 'sales', NOW() - INTERVAL '6 months', NOW()),
(demo_user_id, 'Maintain 95% On-time Delivery', 'Deliver all projects on or before deadline', 95, 94, 99, '%', NOW() + INTERVAL '30 days', 'on-track', 'quality', NOW() - INTERVAL '6 months', NOW()),
(demo_user_id, 'Build $250K Pipeline', 'Grow sales pipeline to $250K potential value', 250000, 163000, 65, 'USD', NOW() + INTERVAL '45 days', 'on-track', 'sales', NOW() - INTERVAL '6 months', NOW());

-- ============================================================================
-- DASHBOARD NOTIFICATIONS
-- ============================================================================
INSERT INTO dashboard_notifications (
  user_id, title, message, type, is_read, created_at, priority
) VALUES
(demo_user_id, 'Payment Received', 'DataPulse Analytics paid $17,500 for AI Dashboard milestone', 'success', false, NOW() - INTERVAL '1 day', 'high'),
(demo_user_id, 'Meeting Reminder', 'Client call with TechVenture Capital in 1 hour', 'info', false, NOW() - INTERVAL '2 hours', 'normal'),
(demo_user_id, 'Project Update', 'Enterprise Portal Redesign reached 45% completion', 'info', false, NOW() - INTERVAL '2 days', 'normal'),
(demo_user_id, 'New Lead', 'Horizon Tech requested a quote for mobile app development', 'success', false, NOW() - INTERVAL '3 days', 'high'),
(demo_user_id, 'Invoice Overdue', 'INV-2026-038 from Stellar Marketing is 5 days overdue', 'warning', false, NOW() - INTERVAL '5 days', 'urgent'),
(demo_user_id, 'Team Update', 'Sarah Johnson completed UI designs for Nexus project', 'info', true, NOW() - INTERVAL '4 days', 'low'),
(demo_user_id, 'AI Insight', 'Optimal time to follow up with GreenLeaf Organics', 'info', true, NOW() - INTERVAL '1 day', 'normal'),
(demo_user_id, 'Weekly Report', 'Your weekly revenue report is ready to view', 'info', true, NOW() - INTERVAL '7 days', 'low');

-- ============================================================================
-- INVOICES
-- ============================================================================
-- Try to insert invoices (table schema may vary)
INSERT INTO invoices (
  user_id, invoice_number, client_name, client_email, subtotal, tax_rate, tax_amount, discount, total, currency, status, issue_date, due_date, paid_date, notes, terms, created_at, updated_at
) VALUES
-- Paid invoices
(demo_user_id, 'INV-2026-001', 'Sarah Mitchell', 'sarah@techventure.io', 3500, 10, 350, 0, 3850, 'USD', 'paid', NOW() - INTERVAL '11 months', (NOW() - INTERVAL '10 months')::date, (NOW() - INTERVAL '10 months')::date, 'Brand Identity Refresh project', 'Net 30', NOW() - INTERVAL '11 months', NOW()),
(demo_user_id, 'INV-2026-002', 'David Park', 'david@urbanfitness.com', 5000, 10, 500, 0, 5500, 'USD', 'paid', NOW() - INTERVAL '10 months', (NOW() - INTERVAL '9 months')::date, (NOW() - INTERVAL '9 months')::date, 'Website Redesign project', 'Net 30', NOW() - INTERVAL '10 months', NOW()),
(demo_user_id, 'INV-2026-003', 'Marcus Johnson', 'marcus@greenleaf.co', 15000, 10, 1500, 0, 16500, 'USD', 'paid', NOW() - INTERVAL '8 months', (NOW() - INTERVAL '7 months')::date, (NOW() - INTERVAL '7 months')::date, 'E-commerce Platform Build', 'Net 30', NOW() - INTERVAL '8 months', NOW()),
(demo_user_id, 'INV-2026-004', 'Jennifer Wu', 'jennifer@cloudsync.io', 25000, 10, 2500, 0, 27500, 'USD', 'paid', NOW() - INTERVAL '6 months', (NOW() - INTERVAL '5 months')::date, (NOW() - INTERVAL '5 months')::date, 'Mobile App MVP', 'Net 30', NOW() - INTERVAL '6 months', NOW()),
(demo_user_id, 'INV-2026-005', 'Rachel Chen', 'rachel@datapulse.ai', 18000, 10, 1800, 0, 19800, 'USD', 'paid', NOW() - INTERVAL '4 months', (NOW() - INTERVAL '3 months')::date, (NOW() - INTERVAL '3 months')::date, 'Data Dashboard Development', 'Net 30', NOW() - INTERVAL '4 months', NOW()),
(demo_user_id, 'INV-2026-006', 'Rachel Chen', 'rachel@datapulse.ai', 17500, 0, 0, 0, 17500, 'USD', 'paid', NOW() - INTERVAL '15 days', (NOW() - INTERVAL '1 day')::date, (NOW() - INTERVAL '1 day')::date, 'AI Dashboard Phase 2 - Milestone 1', 'Net 15', NOW() - INTERVAL '15 days', NOW()),
-- Pending invoices
(demo_user_id, 'INV-2026-007', 'James Wilson', 'james@nexusinnovations.io', 14000, 10, 1400, 0, 15400, 'USD', 'sent', NOW() - INTERVAL '5 days', (NOW() + INTERVAL '25 days')::date, NULL, 'Enterprise Portal Redesign - Milestone 1', 'Net 30', NOW() - INTERVAL '5 days', NOW()),
(demo_user_id, 'INV-2026-008', 'Robert Kim', 'robert@velocitylogistics.com', 11000, 10, 1100, 0, 12100, 'USD', 'sent', NOW() - INTERVAL '10 days', (NOW() + INTERVAL '20 days')::date, NULL, 'Supply Chain Optimization - Phase 1', 'Net 30', NOW() - INTERVAL '10 days', NOW()),
-- Overdue
(demo_user_id, 'INV-2026-009', 'Amanda Torres', 'amanda@stellarmarketing.co', 4682, 10, 468, 0, 5150, 'USD', 'overdue', NOW() - INTERVAL '35 days', (NOW() - INTERVAL '5 days')::date, NULL, 'Marketing Automation - Additional Work', 'Net 30', NOW() - INTERVAL '35 days', NOW()),
-- Draft
(demo_user_id, 'INV-2026-010', 'Rachel Chen', 'rachel@datapulse.ai', 17500, 0, 0, 0, 17500, 'USD', 'draft', NOW(), (NOW() + INTERVAL '30 days')::date, NULL, 'AI Dashboard Phase 2 - Milestone 2', 'Net 30', NOW(), NOW())
ON CONFLICT (invoice_number) DO UPDATE SET
  total = EXCLUDED.total,
  status = EXCLUDED.status,
  updated_at = NOW();

-- ============================================================================
-- LEAD GENERATION LEADS
-- ============================================================================
INSERT INTO lead_gen_leads (
  user_id, first_name, last_name, company, email, status, score, score_label, source, tags, created_at, updated_at
) VALUES
(demo_user_id, 'Thomas', 'Wright', 'Horizon Tech', 'thomas@horizontech.io', 'qualified', 92, 'hot', 'website', ARRAY['website', 'priority'], NOW() - INTERVAL '2 months', NOW() - INTERVAL '1 day'),
(demo_user_id, 'Emily', 'Chen', 'Spark Ventures', 'emily@sparkventures.co', 'qualified', 88, 'hot', 'referral', ARRAY['referral', 'priority'], NOW() - INTERVAL '3 months', NOW() - INTERVAL '2 days'),
(demo_user_id, 'Daniel', 'Martinez', 'Blue Ocean Media', 'daniel@blueocean.media', 'contacted', 78, 'warm', 'social-media', ARRAY['social-media', 'nurture'], NOW() - INTERVAL '1 month', NOW() - INTERVAL '5 days'),
(demo_user_id, 'Katie', 'Johnson', 'Pulse Digital', 'katie@pulsedigital.co', 'contacted', 72, 'warm', 'website', ARRAY['website', 'nurture'], NOW() - INTERVAL '2 months', NOW() - INTERVAL '7 days'),
(demo_user_id, 'Ryan', 'OBrien', 'Celtic Innovations', 'ryan@celticinnovations.ie', 'new', 65, 'warm', 'email', ARRAY['email', 'nurture'], NOW() - INTERVAL '1 month', NOW() - INTERVAL '3 days'),
(demo_user_id, 'Maria', 'Santos', 'Verde Solutions', 'maria@verde.solutions', 'new', 61, 'warm', 'website', ARRAY['website', 'nurture'], NOW() - INTERVAL '3 weeks', NOW() - INTERVAL '2 days'),
(demo_user_id, 'Alex', 'Turner', 'North Star LLC', 'alex@northstar.llc', 'new', 45, 'cold', 'organic', ARRAY['organic', 'nurture'], NOW() - INTERVAL '2 weeks', NOW() - INTERVAL '1 day'),
(demo_user_id, 'Jessica', 'Lee', 'Summit Partners', 'jessica@summitpartners.com', 'new', 38, 'cold', 'landing-page', ARRAY['landing-page', 'nurture'], NOW() - INTERVAL '1 week', NOW())
ON CONFLICT DO NOTHING;

RAISE NOTICE 'Demo data seeding complete for user: %', demo_user_id;

END $$;

-- ============================================================================
-- SUMMARY OUTPUT
-- ============================================================================
SELECT
  'Demo Data Summary' as info,
  (SELECT COUNT(*) FROM dashboard_projects WHERE user_id = '00000000-0000-0000-0000-000000000001') as projects_count,
  (SELECT COUNT(*) FROM dashboard_activities WHERE user_id = '00000000-0000-0000-0000-000000000001') as activities_count,
  (SELECT COUNT(*) FROM dashboard_insights WHERE user_id = '00000000-0000-0000-0000-000000000001') as insights_count,
  (SELECT COUNT(*) FROM dashboard_metrics WHERE user_id = '00000000-0000-0000-0000-000000000001') as metrics_count,
  (SELECT COUNT(*) FROM dashboard_goals WHERE user_id = '00000000-0000-0000-0000-000000000001') as goals_count,
  (SELECT COUNT(*) FROM dashboard_notifications WHERE user_id = '00000000-0000-0000-0000-000000000001') as notifications_count;
