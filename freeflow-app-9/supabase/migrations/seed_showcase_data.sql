-- ============================================================================
-- SHOWCASE USER & DATA SEED SCRIPT
-- ============================================================================
-- This script creates a real showcase user with real data for investor demos
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/gcinvwprtlnwuwuvmrux/sql/new
-- ============================================================================

-- Define the showcase user ID (must match what's used in the app)
DO $$
DECLARE
    showcase_user_id UUID := '00000000-0000-0000-0000-000000000001';
    client_1_id UUID := '10000000-0000-0000-0000-000000000001';
    client_2_id UUID := '10000000-0000-0000-0000-000000000002';
    client_3_id UUID := '10000000-0000-0000-0000-000000000003';
    client_4_id UUID := '10000000-0000-0000-0000-000000000004';
    client_5_id UUID := '10000000-0000-0000-0000-000000000005';
    project_1_id UUID := '20000000-0000-0000-0000-000000000001';
    project_2_id UUID := '20000000-0000-0000-0000-000000000002';
    project_3_id UUID := '20000000-0000-0000-0000-000000000003';
    project_4_id UUID := '20000000-0000-0000-0000-000000000004';
    project_5_id UUID := '20000000-0000-0000-0000-000000000005';
    project_6_id UUID := '20000000-0000-0000-0000-000000000006';
    project_7_id UUID := '20000000-0000-0000-0000-000000000007';
    project_8_id UUID := '20000000-0000-0000-0000-000000000008';
BEGIN

-- ============================================================================
-- CREATE SHOWCASE USER IN AUTH.USERS (if not exists)
-- ============================================================================

-- First, check if user exists in auth.users
IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = showcase_user_id) THEN
    -- Insert into auth.users (requires admin/service role)
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        aud,
        role
    ) VALUES (
        showcase_user_id,
        '00000000-0000-0000-0000-000000000000',
        'alex@freeflow.io',
        crypt('ShowcaseDemo2025!', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}'::jsonb,
        '{"full_name": "Alexandra Chen", "avatar_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"}'::jsonb,
        'authenticated',
        'authenticated'
    );
    RAISE NOTICE 'Created showcase user in auth.users';
END IF;

-- ============================================================================
-- CREATE USER PROFILE
-- ============================================================================

INSERT INTO profiles (id, username, full_name, avatar_url, website, bio, metadata)
VALUES (
    showcase_user_id,
    'alexandra_chen',
    'Alexandra Chen',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    'https://alexandrachen.design',
    'Creative Director & Brand Strategist with 10+ years of experience helping startups and enterprises build memorable brands.',
    '{"title": "Creative Director", "company": "FreeFlow Studio", "location": "San Francisco, CA", "skills": ["Brand Strategy", "UI/UX Design", "Motion Graphics", "Video Production"], "social": {"twitter": "@alexchen_design", "linkedin": "alexandrachen", "dribbble": "alexchen"}}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    website = EXCLUDED.website,
    bio = EXCLUDED.bio,
    metadata = EXCLUDED.metadata;

RAISE NOTICE 'Created/updated user profile';

-- ============================================================================
-- CREATE CLIENTS
-- ============================================================================

-- Delete existing clients for this user first
DELETE FROM clients WHERE user_id = showcase_user_id;

-- Client 1: TechCorp Global
INSERT INTO clients (id, user_id, name, email, phone, company, address, notes, metadata) VALUES
(client_1_id, showcase_user_id, 'Sarah Mitchell', 'sarah.mitchell@techcorp.io', '+1 (415) 555-0101', 'TechCorp Global', '100 Market Street, San Francisco, CA 94105', 'VP of Marketing. Prefers video calls on Mondays. Key decision maker for all brand initiatives.', '{"industry": "Technology", "size": "Enterprise", "annual_value": 125000, "relationship_status": "Active", "contract_type": "Retainer"}'::jsonb);

-- Client 2: Meridian Hotels
INSERT INTO clients (id, user_id, name, email, phone, company, address, notes, metadata) VALUES
(client_2_id, showcase_user_id, 'James Patterson', 'j.patterson@meridianhotels.com', '+1 (310) 555-0202', 'Meridian Hotels Group', '9000 Sunset Blvd, Los Angeles, CA 90069', 'CMO. Expanding to Asia-Pacific. Interested in multilingual content.', '{"industry": "Hospitality", "size": "Enterprise", "annual_value": 85000, "relationship_status": "Active", "contract_type": "Project-based"}'::jsonb);

-- Client 3: GreenLeaf Organics
INSERT INTO clients (id, user_id, name, email, phone, company, address, notes, metadata) VALUES
(client_3_id, showcase_user_id, 'Emily Chen', 'emily@greenleaforganics.co', '+1 (503) 555-0303', 'GreenLeaf Organics', '250 Pearl District, Portland, OR 97209', 'Founder & CEO. Sustainable packaging focus. Monthly retainer client.', '{"industry": "Food & Beverage", "size": "Startup", "annual_value": 48000, "relationship_status": "Active", "contract_type": "Retainer"}'::jsonb);

-- Client 4: Velocity Fitness
INSERT INTO clients (id, user_id, name, email, phone, company, address, notes, metadata) VALUES
(client_4_id, showcase_user_id, 'Marcus Johnson', 'marcus@velocityfitness.com', '+1 (512) 555-0404', 'Velocity Fitness', '1500 South Congress, Austin, TX 78704', 'Head of Brand. Launching new app. High-energy brand personality.', '{"industry": "Health & Fitness", "size": "Mid-Market", "annual_value": 62000, "relationship_status": "Active", "contract_type": "Project-based"}'::jsonb);

-- Client 5: Aurora Financial
INSERT INTO clients (id, user_id, name, email, phone, company, address, notes, metadata) VALUES
(client_5_id, showcase_user_id, 'David Park', 'dpark@aurorafinancial.com', '+1 (212) 555-0505', 'Aurora Financial Services', '350 Park Avenue, New York, NY 10022', 'SVP Marketing. Compliance-sensitive content. Quarterly review cycles.', '{"industry": "Financial Services", "size": "Enterprise", "annual_value": 95000, "relationship_status": "Active", "contract_type": "Retainer"}'::jsonb);

RAISE NOTICE 'Created 5 clients';

-- ============================================================================
-- CREATE PROJECTS
-- ============================================================================

-- Delete existing projects for this user first
DELETE FROM projects WHERE user_id = showcase_user_id;

-- Project 1: TechCorp Brand Refresh
INSERT INTO projects (id, user_id, client_id, title, description, status, priority, budget, spent, client_name, client_email, start_date, end_date, progress, metadata) VALUES
(project_1_id, showcase_user_id, client_1_id, 'TechCorp Brand Refresh 2025', 'Complete brand identity overhaul including logo redesign, brand guidelines, website redesign, and marketing collateral.', 'active', 'high', 85000.00, 42500.00, 'Sarah Mitchell', 'sarah.mitchell@techcorp.io', '2025-01-15', '2025-04-30', 50, '{"type": "Brand Identity", "team_size": 4, "deliverables": ["Logo", "Brand Guidelines", "Website", "Collateral"], "milestones_completed": 3, "milestones_total": 6}'::jsonb);

-- Project 2: Meridian Hotel Campaign
INSERT INTO projects (id, user_id, client_id, title, description, status, priority, budget, spent, client_name, client_email, start_date, end_date, progress, metadata) VALUES
(project_2_id, showcase_user_id, client_2_id, 'Meridian Summer Campaign', 'Multi-channel marketing campaign for summer season including video production, social media content, and print advertising.', 'active', 'high', 65000.00, 28500.00, 'James Patterson', 'j.patterson@meridianhotels.com', '2025-02-01', '2025-05-31', 44, '{"type": "Marketing Campaign", "team_size": 3, "deliverables": ["Video Ads", "Social Content", "Print Ads"], "channels": ["Instagram", "YouTube", "Print"]}'::jsonb);

-- Project 3: GreenLeaf Packaging Redesign
INSERT INTO projects (id, user_id, client_id, title, description, status, priority, budget, spent, client_name, client_email, start_date, end_date, progress, metadata) VALUES
(project_3_id, showcase_user_id, client_3_id, 'Sustainable Packaging Design', 'Eco-friendly packaging redesign for entire product line with sustainable materials and minimalist aesthetic.', 'active', 'medium', 32000.00, 24000.00, 'Emily Chen', 'emily@greenleaforganics.co', '2024-12-01', '2025-03-15', 75, '{"type": "Packaging Design", "team_size": 2, "deliverables": ["Packaging Design", "Material Specs", "Production Files"], "sustainability_focus": true}'::jsonb);

-- Project 4: Velocity App Launch
INSERT INTO projects (id, user_id, client_id, title, description, status, priority, budget, spent, client_name, client_email, start_date, end_date, progress, metadata) VALUES
(project_4_id, showcase_user_id, client_4_id, 'Velocity Fitness App UI/UX', 'Complete UI/UX design for new fitness tracking mobile app including workout features, social integration, and gamification.', 'active', 'urgent', 48000.00, 38400.00, 'Marcus Johnson', 'marcus@velocityfitness.com', '2024-11-15', '2025-02-28', 80, '{"type": "App Design", "team_size": 3, "deliverables": ["UI Design", "UX Research", "Prototypes", "Design System"], "platforms": ["iOS", "Android"]}'::jsonb);

-- Project 5: Aurora Annual Report
INSERT INTO projects (id, user_id, client_id, title, description, status, priority, budget, spent, client_name, client_email, start_date, end_date, progress, metadata) VALUES
(project_5_id, showcase_user_id, client_5_id, 'Aurora 2024 Annual Report', 'Design and production of annual report including data visualization, infographics, and executive photography.', 'completed', 'medium', 28000.00, 28000.00, 'David Park', 'dpark@aurorafinancial.com', '2024-10-01', '2024-12-20', 100, '{"type": "Print Design", "team_size": 2, "deliverables": ["Annual Report", "Infographics", "Photography"], "pages": 48}'::jsonb);

-- Project 6: TechCorp Video Series
INSERT INTO projects (id, user_id, client_id, title, description, status, priority, budget, spent, client_name, client_email, start_date, end_date, progress, metadata) VALUES
(project_6_id, showcase_user_id, client_1_id, 'TechCorp Product Demo Videos', 'Series of 6 product demonstration videos for enterprise software platform launch.', 'active', 'high', 42000.00, 14000.00, 'Sarah Mitchell', 'sarah.mitchell@techcorp.io', '2025-02-15', '2025-05-15', 33, '{"type": "Video Production", "team_size": 4, "deliverables": ["6 Demo Videos", "Social Cuts", "Thumbnails"], "video_count": 6}'::jsonb);

-- Project 7: Meridian Loyalty Program
INSERT INTO projects (id, user_id, client_id, title, description, status, priority, budget, spent, client_name, client_email, start_date, end_date, progress, metadata) VALUES
(project_7_id, showcase_user_id, client_2_id, 'Meridian Rewards Rebrand', 'Rebranding of loyalty program including new name, visual identity, app design, and marketing materials.', 'planning', 'medium', 55000.00, 5500.00, 'James Patterson', 'j.patterson@meridianhotels.com', '2025-03-01', '2025-06-30', 10, '{"type": "Brand Identity", "team_size": 3, "deliverables": ["Logo", "App Design", "Print Materials", "Digital Assets"], "status": "Discovery Phase"}'::jsonb);

-- Project 8: GreenLeaf Website
INSERT INTO projects (id, user_id, client_id, title, description, status, priority, budget, spent, client_name, client_email, start_date, end_date, progress, metadata) VALUES
(project_8_id, showcase_user_id, client_3_id, 'GreenLeaf E-commerce Redesign', 'Complete e-commerce website redesign with improved UX, sustainability storytelling, and subscription features.', 'on_hold', 'low', 38000.00, 7600.00, 'Emily Chen', 'emily@greenleaforganics.co', '2025-04-01', '2025-07-31', 20, '{"type": "Web Design", "team_size": 2, "deliverables": ["Website Design", "Development", "CMS Setup"], "status": "Awaiting client feedback"}'::jsonb);

RAISE NOTICE 'Created 8 projects';

-- ============================================================================
-- CREATE INVOICES
-- ============================================================================

-- Delete existing invoices for this user first
DELETE FROM invoices WHERE user_id = showcase_user_id;

-- Invoice 1: TechCorp - Paid
INSERT INTO invoices (id, user_id, client_id, project_id, invoice_number, amount, status, due_date, paid_date, notes, metadata) VALUES
(uuid_generate_v4(), showcase_user_id, client_1_id, project_1_id, 'INV-2025-001', 21250.00, 'paid', '2025-02-15', '2025-02-10', 'First milestone payment - Discovery & Strategy', '{"milestone": 1, "payment_method": "ACH", "payment_terms": "Net 15"}'::jsonb);

-- Invoice 2: TechCorp - Paid
INSERT INTO invoices (id, user_id, client_id, project_id, invoice_number, amount, status, due_date, paid_date, notes, metadata) VALUES
(uuid_generate_v4(), showcase_user_id, client_1_id, project_1_id, 'INV-2025-002', 21250.00, 'paid', '2025-03-15', '2025-03-12', 'Second milestone payment - Logo & Visual Identity', '{"milestone": 2, "payment_method": "ACH", "payment_terms": "Net 15"}'::jsonb);

-- Invoice 3: Meridian - Pending
INSERT INTO invoices (id, user_id, client_id, project_id, invoice_number, amount, status, due_date, notes, metadata) VALUES
(uuid_generate_v4(), showcase_user_id, client_2_id, project_2_id, 'INV-2025-003', 28500.00, 'sent', '2025-03-01', 'Video production first batch completed', '{"milestone": 1, "payment_method": "Wire", "payment_terms": "Net 30"}'::jsonb);

-- Invoice 4: GreenLeaf - Paid
INSERT INTO invoices (id, user_id, client_id, project_id, invoice_number, amount, status, due_date, paid_date, notes, metadata) VALUES
(uuid_generate_v4(), showcase_user_id, client_3_id, project_3_id, 'INV-2025-004', 16000.00, 'paid', '2025-01-15', '2025-01-14', 'Design concept approval milestone', '{"milestone": 2, "payment_method": "Credit Card", "payment_terms": "Net 15"}'::jsonb);

-- Invoice 5: GreenLeaf - Paid
INSERT INTO invoices (id, user_id, client_id, project_id, invoice_number, amount, status, due_date, paid_date, notes, metadata) VALUES
(uuid_generate_v4(), showcase_user_id, client_3_id, project_3_id, 'INV-2025-005', 8000.00, 'paid', '2025-02-15', '2025-02-18', 'Final production files delivered', '{"milestone": 3, "payment_method": "Credit Card", "payment_terms": "Net 15"}'::jsonb);

-- Invoice 6: Velocity - Paid
INSERT INTO invoices (id, user_id, client_id, project_id, invoice_number, amount, status, due_date, paid_date, notes, metadata) VALUES
(uuid_generate_v4(), showcase_user_id, client_4_id, project_4_id, 'INV-2025-006', 19200.00, 'paid', '2024-12-15', '2024-12-12', 'UX research and wireframes complete', '{"milestone": 1, "payment_method": "ACH", "payment_terms": "Net 15"}'::jsonb);

-- Invoice 7: Velocity - Paid
INSERT INTO invoices (id, user_id, client_id, project_id, invoice_number, amount, status, due_date, paid_date, notes, metadata) VALUES
(uuid_generate_v4(), showcase_user_id, client_4_id, project_4_id, 'INV-2025-007', 19200.00, 'paid', '2025-01-31', '2025-02-02', 'High-fidelity designs delivered', '{"milestone": 2, "payment_method": "ACH", "payment_terms": "Net 15"}'::jsonb);

-- Invoice 8: Aurora - Paid
INSERT INTO invoices (id, user_id, client_id, project_id, invoice_number, amount, status, due_date, paid_date, notes, metadata) VALUES
(uuid_generate_v4(), showcase_user_id, client_5_id, project_5_id, 'INV-2024-015', 28000.00, 'paid', '2024-12-31', '2024-12-28', 'Annual report completed and delivered', '{"milestone": "Final", "payment_method": "Wire", "payment_terms": "Net 30"}'::jsonb);

-- Invoice 9: TechCorp Video - Draft
INSERT INTO invoices (id, user_id, client_id, project_id, invoice_number, amount, status, due_date, notes, metadata) VALUES
(uuid_generate_v4(), showcase_user_id, client_1_id, project_6_id, 'INV-2025-008', 14000.00, 'draft', '2025-03-31', 'First 2 videos delivered', '{"milestone": 1, "payment_method": "ACH", "payment_terms": "Net 30"}'::jsonb);

-- Invoice 10: Meridian Loyalty - Draft
INSERT INTO invoices (id, user_id, client_id, project_id, invoice_number, amount, status, due_date, notes, metadata) VALUES
(uuid_generate_v4(), showcase_user_id, client_2_id, project_7_id, 'INV-2025-009', 5500.00, 'draft', '2025-03-15', 'Discovery phase deposit', '{"milestone": 0, "payment_method": "Wire", "payment_terms": "Net 15"}'::jsonb);

-- Invoice 11: Aurora Q1 Retainer
INSERT INTO invoices (id, user_id, client_id, project_id, invoice_number, amount, status, due_date, notes, metadata) VALUES
(uuid_generate_v4(), showcase_user_id, client_5_id, NULL, 'INV-2025-010', 8000.00, 'sent', '2025-02-28', 'Q1 2025 Retainer - Brand support & minor updates', '{"type": "Retainer", "period": "Q1 2025", "payment_terms": "Net 30"}'::jsonb);

-- Invoice 12: Overdue Invoice - GreenLeaf
INSERT INTO invoices (id, user_id, client_id, project_id, invoice_number, amount, status, due_date, notes, metadata) VALUES
(uuid_generate_v4(), showcase_user_id, client_3_id, project_8_id, 'INV-2025-011', 7600.00, 'overdue', '2025-02-01', 'Website discovery phase - OVERDUE', '{"milestone": 1, "payment_method": "Credit Card", "payment_terms": "Net 15", "days_overdue": 27}'::jsonb);

RAISE NOTICE 'Created 12 invoices';

-- ============================================================================
-- CREATE NOTIFICATIONS
-- ============================================================================

DELETE FROM notifications WHERE user_id = showcase_user_id;

INSERT INTO notifications (user_id, type, title, message, read, metadata) VALUES
(showcase_user_id, 'payment', 'Payment Received', 'TechCorp paid invoice INV-2025-002 for $21,250.00', true, '{"invoice_id": "INV-2025-002", "amount": 21250}'::jsonb),
(showcase_user_id, 'project', 'Project Update', 'Velocity Fitness App reached 80% completion', true, '{"project_id": "velocity-app", "progress": 80}'::jsonb),
(showcase_user_id, 'invoice', 'Invoice Overdue', 'GreenLeaf invoice INV-2025-011 is 27 days overdue', false, '{"invoice_id": "INV-2025-011", "days_overdue": 27}'::jsonb),
(showcase_user_id, 'message', 'New Message', 'Sarah Mitchell from TechCorp sent you a message about the brand refresh', false, '{"from": "Sarah Mitchell", "project": "TechCorp Brand Refresh"}'::jsonb),
(showcase_user_id, 'milestone', 'Milestone Complete', 'GreenLeaf Packaging Design: Final production files delivered', true, '{"project": "GreenLeaf Packaging", "milestone": 3}'::jsonb);

RAISE NOTICE 'Created 5 notifications';

END $$;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- Created:
-- - 1 Showcase User (alexandra_chen / alex@freeflow.io)
-- - 5 Clients (TechCorp, Meridian, GreenLeaf, Velocity, Aurora)
-- - 8 Projects (mix of active, completed, planning, on_hold)
-- - 12 Invoices (paid, sent, draft, overdue)
-- - 5 Notifications
--
-- Total Portfolio Value: ~$393,000
-- Active Revenue: ~$275,000
-- Monthly Recurring: ~$35,000
-- ============================================================================

SELECT 'Showcase data seeded successfully!' as result,
       (SELECT COUNT(*) FROM clients WHERE user_id = '00000000-0000-0000-0000-000000000001') as clients_count,
       (SELECT COUNT(*) FROM projects WHERE user_id = '00000000-0000-0000-0000-000000000001') as projects_count,
       (SELECT COUNT(*) FROM invoices WHERE user_id = '00000000-0000-0000-0000-000000000001') as invoices_count;
