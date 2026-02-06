-- ============================================================================
-- KAZI Portfolio & Creative Features Demo - SQL Seed Script
-- ============================================================================
-- User: alex@freeflow.io
--
-- This script populates comprehensive portfolio and creative data:
-- - 15+ Portfolio Projects
-- - Skills Matrix (21 skills)
-- - Work Experience (4 positions)
-- - Education (2 degrees)
-- - Certifications (5)
-- - Testimonials (8)
-- - Gallery Images (16)
-- - Achievements (8)
-- - Seller Statistics & Gamification
--
-- Run after: seed-comprehensive-investor-demo.ts
-- ============================================================================

-- Get the user ID for alex@freeflow.io
DO $$
DECLARE
    v_user_id UUID;
    v_portfolio_id UUID := gen_random_uuid();
    v_album_id UUID := gen_random_uuid();
BEGIN
    -- Find the demo user
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'alex@freeflow.io' LIMIT 1;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Demo user alex@freeflow.io not found. Please create the user first.';
    END IF;

    RAISE NOTICE 'Found user ID: %', v_user_id;

    -- ============================================================================
    -- PORTFOLIO (Main Portfolio Record)
    -- ============================================================================

    INSERT INTO portfolios (
        id, user_id, slug, title, subtitle, bio, avatar_url, cover_image_url,
        email, phone, location, website, timezone, availability, preferred_contact,
        github_url, linkedin_url, twitter_url, dribbble_url, behance_url, youtube_url,
        is_public, show_contact, show_social, show_analytics, allow_download, allow_share,
        theme, seo_title, seo_description, seo_keywords, created_at, last_published_at
    ) VALUES (
        v_portfolio_id,
        v_user_id,
        'alex-demo',
        'Alex Demo',
        'Creative Director & Full-Stack Developer',
        'Award-winning creative professional with 8+ years of experience in digital design and development. I help startups and enterprises transform their digital presence through human-centered design and cutting-edge technology.

Specializing in brand identity, web/mobile development, and motion design. My work has been featured in Awwwards, Design Milk, and TechCrunch.

Currently available for select projects and consulting engagements.',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600',
        'alex@freeflow.io',
        '+1 (415) 555-0123',
        'San Francisco, CA',
        'https://alexdemo.design',
        'America/Los_Angeles',
        'available',
        'email',
        'https://github.com/alexdemo',
        'https://linkedin.com/in/alexdemo',
        'https://twitter.com/alexdemo',
        'https://dribbble.com/alexdemo',
        'https://behance.net/alexdemo',
        'https://youtube.com/@alexdemo',
        true, true, true, true, true, true,
        'auto',
        'Alex Demo - Creative Director & Full-Stack Developer',
        'Award-winning designer and developer specializing in brand identity, web development, and motion design.',
        ARRAY['designer', 'developer', 'creative director', 'UI/UX', 'branding'],
        NOW() - INTERVAL '12 months',
        NOW() - INTERVAL '1 day'
    ) ON CONFLICT (user_id) DO UPDATE SET
        slug = EXCLUDED.slug,
        title = EXCLUDED.title,
        subtitle = EXCLUDED.subtitle,
        bio = EXCLUDED.bio,
        last_published_at = NOW();

    -- ============================================================================
    -- PORTFOLIO PROJECTS (15+ Creative Projects)
    -- ============================================================================

    INSERT INTO portfolio_projects (portfolio_id, title, description, image_url, category, status, live_url, technologies, duration, role, team_size, highlights, views, likes, featured, display_order, created_at) VALUES
    -- Web Design Projects
    (v_portfolio_id, 'TechVenture Capital Website Redesign', 'Complete redesign of a venture capital firm website. Modern, sleek design with interactive investment portfolio showcase, team profiles, and lead generation forms.', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800', 'Web Design', 'published', 'https://techventure.example.com', ARRAY['Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion'], '8 weeks', 'Lead Designer & Developer', 3, ARRAY['Increased lead conversion by 45%', 'Reduced bounce rate by 30%', '100 Lighthouse performance score'], 4250, 312, true, 1, NOW() - INTERVAL '10 months'),

    (v_portfolio_id, 'GreenLeaf E-Commerce Platform', 'Built a comprehensive e-commerce platform for an organic food retailer. Features include product catalog, subscription boxes, and farm-to-table tracking.', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800', 'E-commerce', 'published', 'https://greenleaf.example.com', ARRAY['React', 'Node.js', 'PostgreSQL', 'Stripe', 'Redis'], '12 weeks', 'Full-Stack Developer', 5, ARRAY['$250K+ monthly transactions', '99.9% uptime', 'Subscription revenue increased 180%'], 3890, 287, true, 2, NOW() - INTERVAL '8 months'),

    (v_portfolio_id, 'CloudSync Mobile Banking App', 'Designed and developed a mobile banking application with biometric authentication, real-time transactions, and AI-powered financial insights.', 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800', 'Mobile App', 'published', NULL, ARRAY['React Native', 'TypeScript', 'AWS', 'Plaid API', 'TensorFlow'], '16 weeks', 'Lead Mobile Developer', 6, ARRAY['50,000+ downloads in first month', '4.8 App Store rating', 'PCI DSS compliant'], 5120, 456, true, 3, NOW() - INTERVAL '7 months'),

    -- Branding Projects
    (v_portfolio_id, 'Nordic Design Co Brand Identity', 'Complete brand identity package for a Scandinavian design studio. Logo design, typography system, color palette, and brand guidelines.', 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800', 'Branding', 'published', NULL, ARRAY['Adobe Illustrator', 'Adobe InDesign', 'Figma'], '6 weeks', 'Brand Designer', 2, ARRAY['Minimalist Scandinavian aesthetic', 'Versatile logo system', 'International design award nominee'], 2890, 234, true, 4, NOW() - INTERVAL '6 months'),

    (v_portfolio_id, 'Artisan Coffee Roasters Rebrand', 'Refreshed brand identity for a specialty coffee company. New logo, packaging design, and cafe interior guidelines.', 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800', 'Branding', 'published', NULL, ARRAY['Adobe Illustrator', 'Photoshop', 'Procreate'], '4 weeks', 'Creative Director', 3, ARRAY['Instagram-worthy packaging', 'Sales increased 35% post-rebrand', 'Featured in Design Milk'], 1890, 178, false, 5, NOW() - INTERVAL '5 months'),

    -- Video & Motion Projects
    (v_portfolio_id, 'DataPulse Product Launch Video', 'Produced a 90-second animated explainer video for AI analytics platform launch. 2D motion graphics and data visualizations.', 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800', 'Video', 'published', NULL, ARRAY['After Effects', 'Cinema 4D', 'Premiere Pro'], '3 weeks', 'Motion Designer', 2, ARRAY['1.2M+ views on LinkedIn', '45% increase in demo requests', 'Featured at TechCrunch Disrupt'], 8920, 892, true, 6, NOW() - INTERVAL '4 months'),

    (v_portfolio_id, 'Urban Fitness Promotional Series', 'Created a series of 6 promotional videos showcasing fitness classes, facility tours, and member testimonials.', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800', 'Video', 'published', NULL, ARRAY['Premiere Pro', 'After Effects', 'DaVinci Resolve'], '4 weeks', 'Video Producer & Editor', 4, ARRAY['500K+ combined views', 'Membership inquiries up 60%'], 3450, 267, false, 7, NOW() - INTERVAL '4 months'),

    -- UI/UX Design Projects
    (v_portfolio_id, 'Nexus Enterprise Dashboard', 'Designed comprehensive analytics dashboard for enterprise SaaS platform. Real-time data visualization and customizable widgets.', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800', 'UI/UX Design', 'published', 'https://nexus.example.com/dashboard', ARRAY['Figma', 'Protopie', 'Lottie', 'Chart.js'], '10 weeks', 'Senior UX Designer', 4, ARRAY['User task completion improved 40%', 'Onboarding time reduced by 50%', 'NPS score increased to 72'], 4560, 389, true, 8, NOW() - INTERVAL '3 months'),

    (v_portfolio_id, 'Bloom Education Learning Platform', 'Created intuitive learning management system for K-12 education. Gamified progress tracking and accessibility features.', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800', 'UI/UX Design', 'published', 'https://bloom.example.edu', ARRAY['Figma', 'Principle', 'Miro'], '14 weeks', 'Lead Product Designer', 5, ARRAY['WCAG 2.1 AA compliant', 'Student engagement up 85%', 'EdTech Digest Award winner'], 3780, 298, true, 9, NOW() - INTERVAL '2 months'),

    -- 3D & Illustration
    (v_portfolio_id, 'Summit Real Estate 3D Visualizations', 'Created photorealistic 3D architectural visualizations for luxury real estate listings.', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800', '3D Design', 'published', NULL, ARRAY['Blender', 'V-Ray', 'Photoshop', 'Unreal Engine'], '6 weeks', '3D Visualization Artist', 2, ARRAY['Properties sold 30% faster', 'Virtual tours for 50+ listings'], 2340, 189, false, 10, NOW() - INTERVAL '5 months'),

    (v_portfolio_id, 'Tech Product Illustrations', 'Created a series of isometric illustrations for technology brand marketing materials.', 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800', 'Illustration', 'published', NULL, ARRAY['Adobe Illustrator', 'Procreate', 'Figma'], '3 weeks', 'Illustrator', 1, ARRAY['50+ unique illustrations', 'Cohesive visual language'], 1670, 145, false, 11, NOW() - INTERVAL '6 months'),

    -- Social & Marketing
    (v_portfolio_id, 'Stellar Marketing Social Campaign', 'Designed comprehensive social media campaign for marketing agency. 100+ assets for Instagram, LinkedIn, Twitter.', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800', 'Social Media', 'published', 'https://instagram.com/stellarmarketing', ARRAY['Canva Pro', 'Adobe Creative Suite', 'Figma'], '8 weeks', 'Social Media Designer', 3, ARRAY['Engagement rate up 150%', 'Follower growth: 10K to 45K'], 2890, 234, false, 12, NOW() - INTERVAL '3 months'),

    -- App Development
    (v_portfolio_id, 'Velocity Logistics Fleet Tracker', 'Built real-time fleet management application with GPS tracking, route optimization, and analytics dashboard.', 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=800', 'Web App', 'published', 'https://velocity.example.com', ARRAY['Vue.js', 'Node.js', 'MongoDB', 'Socket.io', 'Mapbox'], '10 weeks', 'Full-Stack Developer', 4, ARRAY['Tracks 500+ vehicles in real-time', 'Fuel costs reduced 15%'], 2120, 167, false, 13, NOW() - INTERVAL '4 months'),

    (v_portfolio_id, 'AI Content Generator Tool', 'Developed AI-powered content generation tool for marketers. Blog posts, social media captions, and email copy.', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800', 'AI/ML', 'published', NULL, ARRAY['Python', 'OpenAI API', 'FastAPI', 'React', 'PostgreSQL'], '8 weeks', 'AI Engineer', 3, ARRAY['Generate content in 50+ languages', '10,000+ users'], 6780, 567, true, 14, NOW() - INTERVAL '2 months'),

    (v_portfolio_id, 'Podcast Production Suite', 'Full-service podcast production including episode editing, intro/outro creation, and show notes.', 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800', 'Audio', 'published', NULL, ARRAY['Adobe Audition', 'Logic Pro', 'Descript', 'Canva'], 'Ongoing', 'Podcast Producer', 2, ARRAY['Top 10 in Tech Podcasts', '100K+ monthly listeners', '4.9 Apple Podcasts rating'], 1890, 156, false, 15, NOW() - INTERVAL '6 months')

    ON CONFLICT DO NOTHING;

    -- ============================================================================
    -- PORTFOLIO SKILLS (21 Skills)
    -- ============================================================================

    INSERT INTO portfolio_skills (portfolio_id, name, category, proficiency, years_of_experience, last_used, endorsed, endorsement_count, trending, created_at) VALUES
    -- Technical Skills
    (v_portfolio_id, 'React / Next.js', 'Technical', 5, 6, '2025', true, 47, true, NOW() - INTERVAL '12 months'),
    (v_portfolio_id, 'TypeScript', 'Technical', 5, 5, '2025', true, 42, true, NOW() - INTERVAL '12 months'),
    (v_portfolio_id, 'Node.js', 'Technical', 5, 6, '2025', true, 38, false, NOW() - INTERVAL '12 months'),
    (v_portfolio_id, 'Python', 'Technical', 4, 4, '2025', true, 28, true, NOW() - INTERVAL '12 months'),
    (v_portfolio_id, 'PostgreSQL / MongoDB', 'Technical', 4, 5, '2025', true, 25, false, NOW() - INTERVAL '12 months'),
    (v_portfolio_id, 'AWS / Cloud Architecture', 'Technical', 4, 4, '2025', true, 31, true, NOW() - INTERVAL '12 months'),
    (v_portfolio_id, 'React Native', 'Technical', 4, 3, '2024', true, 22, false, NOW() - INTERVAL '12 months'),
    (v_portfolio_id, 'GraphQL', 'Technical', 4, 3, '2024', false, 18, false, NOW() - INTERVAL '12 months'),

    -- Design Skills
    (v_portfolio_id, 'UI/UX Design', 'Technical', 5, 7, '2025', true, 56, true, NOW() - INTERVAL '12 months'),
    (v_portfolio_id, 'Figma', 'Tools', 5, 5, '2025', true, 48, true, NOW() - INTERVAL '12 months'),
    (v_portfolio_id, 'Adobe Creative Suite', 'Tools', 5, 8, '2025', true, 45, false, NOW() - INTERVAL '12 months'),
    (v_portfolio_id, 'Motion Design / After Effects', 'Technical', 4, 5, '2025', true, 32, false, NOW() - INTERVAL '12 months'),
    (v_portfolio_id, 'Blender / 3D Modeling', 'Technical', 3, 2, '2024', false, 12, true, NOW() - INTERVAL '12 months'),
    (v_portfolio_id, 'Design Systems', 'Technical', 5, 4, '2025', true, 35, true, NOW() - INTERVAL '12 months'),

    -- Soft Skills
    (v_portfolio_id, 'Project Management', 'Soft', 5, 6, '2025', true, 41, false, NOW() - INTERVAL '12 months'),
    (v_portfolio_id, 'Client Communication', 'Soft', 5, 8, '2025', true, 52, false, NOW() - INTERVAL '12 months'),
    (v_portfolio_id, 'Team Leadership', 'Soft', 4, 4, '2025', true, 29, false, NOW() - INTERVAL '12 months'),
    (v_portfolio_id, 'Problem Solving', 'Soft', 5, 8, '2025', true, 38, false, NOW() - INTERVAL '12 months'),
    (v_portfolio_id, 'Agile / Scrum', 'Soft', 4, 5, '2025', true, 27, false, NOW() - INTERVAL '12 months'),

    -- Languages
    (v_portfolio_id, 'English', 'Languages', 5, 20, '2025', false, 0, false, NOW() - INTERVAL '12 months'),
    (v_portfolio_id, 'Spanish', 'Languages', 3, 5, '2024', false, 0, false, NOW() - INTERVAL '12 months')

    ON CONFLICT DO NOTHING;

    -- ============================================================================
    -- PORTFOLIO EXPERIENCE (Work History)
    -- ============================================================================

    INSERT INTO portfolio_experience (portfolio_id, company_name, position, employment_type, location, start_date, end_date, is_current, description, responsibilities, achievements, technologies, display_order, created_at) VALUES
    (v_portfolio_id, 'FreeFlow (Self-Employed)', 'Founder & Creative Director', 'freelance', 'San Francisco, CA (Remote)', '2022-01-01', NULL, true,
     'Founded creative agency specializing in digital transformation for startups and enterprises. Lead a team of designers and developers delivering end-to-end solutions.',
     ARRAY['Lead client engagements from discovery to delivery', 'Build and manage team of 5+ freelance contractors', 'Develop business strategy and client acquisition', 'Hands-on design and development for key projects'],
     ARRAY['Grew revenue from $0 to $172K in first 12 months', 'Achieved 92% client retention rate', '4.8/5 average client satisfaction score', '45% lead-to-client conversion rate'],
     ARRAY['React', 'Next.js', 'TypeScript', 'Figma', 'AWS', 'Supabase'],
     1, NOW() - INTERVAL '12 months'),

    (v_portfolio_id, 'Stripe', 'Senior Product Designer', 'full-time', 'San Francisco, CA', '2019-06-01', '2021-12-31', false,
     'Led design for Stripe Dashboard and developer tools. Collaborated with engineering and product teams to ship features used by millions of businesses.',
     ARRAY['Design lead for Dashboard redesign project', 'Conducted user research and usability testing', 'Mentored junior designers', 'Contributed to Stripe design system'],
     ARRAY['Dashboard redesign increased user satisfaction by 40%', 'Reduced support tickets by 25%', 'Shipped 12 major features to production', 'Promoted from Designer to Senior Designer in 18 months'],
     ARRAY['Figma', 'React', 'Storybook', 'Framer'],
     2, NOW() - INTERVAL '12 months'),

    (v_portfolio_id, 'Airbnb', 'Product Designer', 'full-time', 'San Francisco, CA', '2017-03-01', '2019-05-31', false,
     'Designed host tools and experiences for Airbnb platform. Focused on improving host onboarding, listing management, and pricing optimization.',
     ARRAY['End-to-end design for host tools', 'Cross-functional collaboration with PM and engineering', 'Design system contributions', 'A/B testing and experimentation'],
     ARRAY['Host onboarding completion improved by 35%', 'Smart Pricing adoption increased 50%', 'Won internal design award for accessibility work', 'Conducted 100+ user interviews'],
     ARRAY['Sketch', 'Principle', 'React', 'Amplitude'],
     3, NOW() - INTERVAL '12 months'),

    (v_portfolio_id, 'IDEO', 'Design Fellow', 'contract', 'Palo Alto, CA', '2016-06-01', '2017-02-28', false,
     'Participated in human-centered design projects for Fortune 500 clients. Learned design thinking methodology and applied it to complex business challenges.',
     ARRAY['User research and synthesis', 'Prototyping and testing', 'Client workshops and presentations', 'Multidisciplinary team collaboration'],
     ARRAY['Contributed to 4 client projects', 'Co-facilitated 10+ design workshops', 'Developed expertise in design thinking', 'Offered full-time position'],
     ARRAY['Sketch', 'InVision', 'Keynote', 'Miro'],
     4, NOW() - INTERVAL '12 months')

    ON CONFLICT DO NOTHING;

    -- ============================================================================
    -- PORTFOLIO EDUCATION
    -- ============================================================================

    INSERT INTO portfolio_education (portfolio_id, institution_name, degree, field_of_study, location, start_date, end_date, is_current, gpa, honors, achievements, coursework, display_order, created_at) VALUES
    (v_portfolio_id, 'Stanford University', 'Master of Science', 'Computer Science (Human-Computer Interaction)', 'Stanford, CA', '2014-09-01', '2016-06-01', false, '3.9',
     ARRAY['Dean''s List', 'Graduate Research Fellowship'],
     ARRAY['Thesis: "Adaptive Interfaces for Mobile Commerce"', 'Published 2 papers in CHI conference', 'Teaching Assistant for CS 147'],
     ARRAY['Human-Computer Interaction', 'Machine Learning', 'Data Visualization', 'Design Thinking'],
     1, NOW() - INTERVAL '12 months'),

    (v_portfolio_id, 'University of California, Berkeley', 'Bachelor of Arts', 'Cognitive Science with minor in Computer Science', 'Berkeley, CA', '2010-09-01', '2014-05-01', false, '3.7',
     ARRAY['Magna Cum Laude', 'Phi Beta Kappa'],
     ARRAY['Undergraduate Research in HCI Lab', 'President of Design Students Association', 'Hackathon winner (3x)'],
     ARRAY['Cognitive Psychology', 'Visual Perception', 'Computer Science', 'Statistics'],
     2, NOW() - INTERVAL '12 months')

    ON CONFLICT DO NOTHING;

    -- ============================================================================
    -- PORTFOLIO CERTIFICATIONS
    -- ============================================================================

    INSERT INTO portfolio_certifications (portfolio_id, title, issuer, issue_date, expiry_date, credential_id, credential_url, verified, skills, display_order, created_at) VALUES
    (v_portfolio_id, 'AWS Solutions Architect - Associate', 'Amazon Web Services', '2023-06-15', '2026-06-15', 'AWS-SAA-C03-12345', 'https://aws.amazon.com/verification/12345', true, ARRAY['AWS', 'Cloud Architecture', 'Infrastructure'], 1, NOW() - INTERVAL '6 months'),
    (v_portfolio_id, 'Google UX Design Professional Certificate', 'Google', '2022-03-20', NULL, 'GUXD-2022-67890', 'https://coursera.org/verify/67890', true, ARRAY['UX Design', 'User Research', 'Prototyping'], 2, NOW() - INTERVAL '6 months'),
    (v_portfolio_id, 'Certified Scrum Product Owner (CSPO)', 'Scrum Alliance', '2021-09-10', '2025-09-10', 'CSPO-234567', 'https://scrumalliance.org/verify/234567', true, ARRAY['Agile', 'Product Management', 'Scrum'], 3, NOW() - INTERVAL '6 months'),
    (v_portfolio_id, 'Meta Front-End Developer Professional Certificate', 'Meta', '2023-01-15', NULL, 'META-FE-345678', 'https://coursera.org/verify/345678', true, ARRAY['React', 'JavaScript', 'Web Development'], 4, NOW() - INTERVAL '6 months'),
    (v_portfolio_id, 'Figma Professional Certificate', 'Figma', '2022-11-01', NULL, 'FIGMA-PRO-456789', NULL, true, ARRAY['Figma', 'Design Systems', 'Prototyping'], 5, NOW() - INTERVAL '6 months')

    ON CONFLICT DO NOTHING;

    -- ============================================================================
    -- PORTFOLIO TESTIMONIALS
    -- ============================================================================

    INSERT INTO portfolio_testimonials (portfolio_id, author_name, author_title, author_company, content, rating, relationship, featured, approved, display_order, created_at) VALUES
    (v_portfolio_id, 'Sarah Mitchell', 'Managing Partner', 'TechVenture Capital', 'Alex transformed our digital presence completely. The new website has become our best salesperson, generating more qualified leads than our entire BD team combined.', 5, 'client', true, true, 1, NOW() - INTERVAL '8 months'),
    (v_portfolio_id, 'Jennifer Wu', 'CTO', 'CloudSync Solutions', 'Working with Alex on our mobile banking app was exceptional. He deeply understood the balance between security requirements and user experience.', 5, 'client', true, true, 2, NOW() - INTERVAL '6 months'),
    (v_portfolio_id, 'Marcus Johnson', 'Founder & CEO', 'GreenLeaf Organics', 'Alex took our small farm shop online and turned it into a regional powerhouse. The subscription feature alone tripled our predictable revenue.', 5, 'client', true, true, 3, NOW() - INTERVAL '7 months'),
    (v_portfolio_id, 'Rachel Chen', 'VP of Product', 'DataPulse Analytics', 'The dashboard redesign finally makes our complex analytics accessible to non-technical users. Support tickets dropped by 40%.', 5, 'client', false, true, 4, NOW() - INTERVAL '4 months'),
    (v_portfolio_id, 'David Park', 'Owner', 'Urban Fitness Studio', 'The video series Alex produced for us was incredible. Professional quality that rivaled major production houses at a fraction of the cost.', 5, 'client', false, true, 5, NOW() - INTERVAL '5 months'),
    (v_portfolio_id, 'Erik Lindqvist', 'Creative Director', 'Nordic Design Co', 'Alex understood our Scandinavian design philosophy perfectly. The brand identity he created captures our essence beautifully.', 5, 'client', false, true, 6, NOW() - INTERVAL '6 months'),
    (v_portfolio_id, 'Lisa Anderson', 'VP Marketing', 'Summit Real Estate', 'The 3D visualizations Alex created for our luxury listings are stunning. Properties with his renders sell 30% faster on average.', 5, 'client', false, true, 7, NOW() - INTERVAL '5 months'),
    (v_portfolio_id, 'Michael Torres', 'Engineering Manager', 'Stripe (Former Colleague)', 'I had the pleasure of working with Alex at Stripe. His designs were deeply considered from an engineering perspective.', 5, 'colleague', false, true, 8, NOW() - INTERVAL '10 months')

    ON CONFLICT DO NOTHING;

    -- ============================================================================
    -- PORTFOLIO ANALYTICS
    -- ============================================================================

    INSERT INTO portfolio_analytics (portfolio_id, total_views, unique_visitors, project_views, contact_clicks, social_clicks, cv_downloads, share_count, avg_time_on_page, bounce_rate, top_projects, top_skills, visitor_countries, last_updated)
    VALUES (
        v_portfolio_id,
        45890,
        12450,
        38750,
        890,
        2340,
        567,
        234,
        185,
        28.5,
        ARRAY['TechVenture Capital', 'CloudSync Mobile App', 'DataPulse Dashboard'],
        ARRAY['UI/UX Design', 'React', 'TypeScript'],
        '{"United States": 45, "United Kingdom": 15, "Germany": 10, "Canada": 8, "Australia": 7, "Other": 15}'::jsonb,
        NOW()
    ) ON CONFLICT (portfolio_id) DO UPDATE SET
        total_views = EXCLUDED.total_views,
        unique_visitors = EXCLUDED.unique_visitors,
        last_updated = NOW();

    -- ============================================================================
    -- GALLERY ALBUM
    -- ============================================================================

    INSERT INTO gallery_albums (id, user_id, name, description, privacy, tags, created_at)
    VALUES (v_album_id, v_user_id, 'Portfolio Showcase', 'Curated collection of my best work', 'public', ARRAY['portfolio', 'design', 'showcase'], NOW() - INTERVAL '6 months')
    ON CONFLICT DO NOTHING;

    -- ============================================================================
    -- GALLERY IMAGES (16 Images)
    -- ============================================================================

    INSERT INTO gallery_images (user_id, album_id, title, file_name, file_size, width, height, format, url, thumbnail, type, category, tags, is_favorite, is_public, views, likes, processing_status, created_at) VALUES
    (v_user_id, v_album_id, 'TechVenture Homepage Hero', 'techventure-hero.jpg', 2500000, 1920, 1080, 'jpeg', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400', 'image', 'web-design', ARRAY['hero', 'web', 'finance'], true, true, 1250, 89, 'completed', NOW() - INTERVAL '10 months'),
    (v_user_id, v_album_id, 'E-commerce Product Grid', 'ecommerce-grid.jpg', 1800000, 1920, 1080, 'jpeg', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400', 'image', 'web-design', ARRAY['ecommerce', 'product', 'grid'], false, true, 890, 67, 'completed', NOW() - INTERVAL '8 months'),
    (v_user_id, v_album_id, 'Dashboard Analytics View', 'dashboard-analytics.jpg', 2200000, 1920, 1080, 'jpeg', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400', 'image', 'web-design', ARRAY['dashboard', 'analytics', 'charts'], true, true, 1560, 112, 'completed', NOW() - INTERVAL '6 months'),
    (v_user_id, v_album_id, 'Banking App Home Screen', 'banking-home.jpg', 1500000, 1080, 1920, 'jpeg', 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200', 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400', 'image', 'mobile', ARRAY['mobile', 'fintech', 'ios'], true, true, 2340, 198, 'completed', NOW() - INTERVAL '7 months'),
    (v_user_id, v_album_id, 'Nordic Design Logo System', 'nordic-logo.jpg', 800000, 1920, 1080, 'jpeg', 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=1200', 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400', 'image', 'branding', ARRAY['logo', 'branding', 'minimal'], true, true, 1890, 156, 'completed', NOW() - INTERVAL '6 months'),
    (v_user_id, v_album_id, 'Coffee Brand Packaging', 'coffee-packaging.jpg', 1200000, 1920, 1080, 'jpeg', 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=1200', 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400', 'image', 'branding', ARRAY['packaging', 'branding', 'coffee'], false, true, 1120, 89, 'completed', NOW() - INTERVAL '5 months'),
    (v_user_id, v_album_id, 'Product Launch Video Thumbnail', 'launch-video.jpg', 2800000, 1920, 1080, 'jpeg', 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=1200', 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=400', 'image', 'video', ARRAY['video', 'motion', 'launch'], true, true, 3450, 267, 'completed', NOW() - INTERVAL '4 months'),
    (v_user_id, v_album_id, 'Architectural Visualization', 'architecture-render.jpg', 4500000, 1920, 1080, 'jpeg', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400', 'image', '3d', ARRAY['3d', 'architecture', 'render'], true, true, 1670, 134, 'completed', NOW() - INTERVAL '5 months'),
    (v_user_id, v_album_id, 'Interior Render', 'interior-render.jpg', 3800000, 1920, 1080, 'jpeg', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400', 'image', '3d', ARRAY['3d', 'interior', 'luxury'], false, true, 1230, 98, 'completed', NOW() - INTERVAL '5 months'),
    (v_user_id, v_album_id, 'Isometric Tech Illustration', 'tech-illustration.jpg', 600000, 1920, 1080, 'jpeg', 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=1200', 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=400', 'image', 'illustration', ARRAY['illustration', 'isometric', 'tech'], true, true, 890, 67, 'completed', NOW() - INTERVAL '6 months'),
    (v_user_id, v_album_id, 'Character Design Set', 'character-design.jpg', 550000, 1920, 1080, 'jpeg', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400', 'image', 'illustration', ARRAY['character', 'illustration', 'design'], false, true, 560, 45, 'completed', NOW() - INTERVAL '7 months'),
    (v_user_id, v_album_id, 'Instagram Story Template', 'ig-story.jpg', 450000, 1080, 1920, 'jpeg', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400', 'image', 'social', ARRAY['social', 'instagram', 'template'], false, true, 2340, 187, 'completed', NOW() - INTERVAL '3 months'),
    (v_user_id, v_album_id, 'LinkedIn Post Design', 'linkedin-post.jpg', 380000, 1200, 1200, 'jpeg', 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=1200', 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400', 'image', 'social', ARRAY['social', 'linkedin', 'post'], false, true, 1890, 145, 'completed', NOW() - INTERVAL '3 months'),
    (v_user_id, v_album_id, 'App Onboarding Flow', 'app-onboarding.jpg', 1600000, 1920, 1080, 'jpeg', 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200', 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400', 'image', 'mobile', ARRAY['onboarding', 'ux', 'mobile'], false, true, 780, 54, 'completed', NOW() - INTERVAL '7 months'),
    (v_user_id, v_album_id, 'Brand Guidelines Spread', 'brand-guidelines.jpg', 1100000, 1920, 1080, 'jpeg', 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=1200', 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=400', 'image', 'branding', ARRAY['guidelines', 'brand', 'typography'], false, true, 670, 45, 'completed', NOW() - INTERVAL '6 months'),
    (v_user_id, v_album_id, 'Motion Graphics Frame', 'motion-frame.jpg', 2400000, 1920, 1080, 'jpeg', 'https://images.unsplash.com/photo-1574717024453-354056aef8bc?w=1200', 'https://images.unsplash.com/photo-1574717024453-354056aef8bc?w=400', 'image', 'animation', ARRAY['motion', 'animation', 'graphics'], false, true, 980, 78, 'completed', NOW() - INTERVAL '4 months')

    ON CONFLICT DO NOTHING;

    -- ============================================================================
    -- USER PROFILE
    -- ============================================================================

    INSERT INTO user_profiles (user_id, first_name, last_name, display_name, email, phone, bio, avatar, cover_image, location, timezone, website, company, title, status, account_type, email_verified, phone_verified, created_at)
    VALUES (
        v_user_id,
        'Alex',
        'Demo',
        'Alex Demo',
        'alex@freeflow.io',
        '+1 (415) 555-0123',
        'Award-winning creative director and full-stack developer with 8+ years of experience. Specializing in brand identity, web/mobile development, and motion design.',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600',
        'San Francisco, CA',
        'America/Los_Angeles',
        'https://alexdemo.design',
        'FreeFlow',
        'Founder & Creative Director',
        'active',
        'pro',
        true,
        true,
        NOW() - INTERVAL '12 months'
    ) ON CONFLICT (user_id) DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        display_name = EXCLUDED.display_name,
        bio = EXCLUDED.bio;

    -- ============================================================================
    -- PROFILE SKILLS
    -- ============================================================================

    INSERT INTO skills (user_id, name, category, level, years_of_experience, endorsements, created_at) VALUES
    (v_user_id, 'React / Next.js', 'Technical', 'expert', 6, 47, NOW() - INTERVAL '12 months'),
    (v_user_id, 'TypeScript', 'Technical', 'expert', 5, 42, NOW() - INTERVAL '12 months'),
    (v_user_id, 'Node.js', 'Technical', 'expert', 6, 38, NOW() - INTERVAL '12 months'),
    (v_user_id, 'Python', 'Technical', 'advanced', 4, 28, NOW() - INTERVAL '12 months'),
    (v_user_id, 'UI/UX Design', 'Design', 'expert', 7, 56, NOW() - INTERVAL '12 months'),
    (v_user_id, 'Figma', 'Design', 'expert', 5, 48, NOW() - INTERVAL '12 months'),
    (v_user_id, 'Adobe Creative Suite', 'Design', 'expert', 8, 45, NOW() - INTERVAL '12 months'),
    (v_user_id, 'Motion Design', 'Design', 'advanced', 5, 32, NOW() - INTERVAL '12 months'),
    (v_user_id, 'Project Management', 'Soft Skills', 'expert', 6, 41, NOW() - INTERVAL '12 months'),
    (v_user_id, 'Client Communication', 'Soft Skills', 'expert', 8, 52, NOW() - INTERVAL '12 months'),
    (v_user_id, 'AWS', 'Technical', 'advanced', 4, 31, NOW() - INTERVAL '12 months'),
    (v_user_id, 'React Native', 'Technical', 'advanced', 3, 22, NOW() - INTERVAL '12 months'),
    (v_user_id, 'Design Systems', 'Design', 'expert', 4, 35, NOW() - INTERVAL '12 months'),
    (v_user_id, 'Agile / Scrum', 'Soft Skills', 'advanced', 5, 27, NOW() - INTERVAL '12 months'),
    (v_user_id, 'Team Leadership', 'Soft Skills', 'advanced', 4, 29, NOW() - INTERVAL '12 months')

    ON CONFLICT (user_id, name) DO UPDATE SET
        level = EXCLUDED.level,
        endorsements = EXCLUDED.endorsements;

    -- ============================================================================
    -- PROFILE EXPERIENCE
    -- ============================================================================

    INSERT INTO experience (user_id, company, title, location, start_date, end_date, current, description, achievements, created_at) VALUES
    (v_user_id, 'FreeFlow', 'Founder & Creative Director', 'San Francisco, CA (Remote)', '2022-01-01', NULL, true, 'Founded creative agency specializing in digital transformation. Lead team of designers and developers.', ARRAY['Grew revenue to $172K in 12 months', '92% client retention rate', '4.8/5 client satisfaction'], NOW() - INTERVAL '12 months'),
    (v_user_id, 'Stripe', 'Senior Product Designer', 'San Francisco, CA', '2019-06-01', '2021-12-31', false, 'Led design for Stripe Dashboard and developer tools.', ARRAY['Dashboard redesign increased satisfaction by 40%', 'Reduced support tickets by 25%', 'Promoted in 18 months'], NOW() - INTERVAL '12 months'),
    (v_user_id, 'Airbnb', 'Product Designer', 'San Francisco, CA', '2017-03-01', '2019-05-31', false, 'Designed host tools and experiences for Airbnb platform.', ARRAY['Host onboarding improved by 35%', 'Smart Pricing adoption increased 50%', 'Won internal design award'], NOW() - INTERVAL '12 months'),
    (v_user_id, 'IDEO', 'Design Fellow', 'Palo Alto, CA', '2016-06-01', '2017-02-28', false, 'Participated in human-centered design projects for Fortune 500 clients.', ARRAY['Contributed to 4 client projects', 'Co-facilitated 10+ design workshops', 'Offered full-time position'], NOW() - INTERVAL '12 months')

    ON CONFLICT DO NOTHING;

    -- ============================================================================
    -- PROFILE EDUCATION
    -- ============================================================================

    INSERT INTO education (user_id, school, degree, field, start_date, end_date, current, grade, activities, created_at) VALUES
    (v_user_id, 'Stanford University', 'Master of Science', 'Computer Science (HCI)', '2014-09-01', '2016-06-01', false, '3.9', ARRAY['Dean''s List', 'Graduate Research Fellowship', 'Published 2 CHI papers'], NOW() - INTERVAL '12 months'),
    (v_user_id, 'UC Berkeley', 'Bachelor of Arts', 'Cognitive Science', '2010-09-01', '2014-05-01', false, '3.7', ARRAY['Magna Cum Laude', 'Phi Beta Kappa', 'Design Students President'], NOW() - INTERVAL '12 months')

    ON CONFLICT DO NOTHING;

    -- ============================================================================
    -- SIMPLE PORTFOLIO TABLE
    -- ============================================================================

    INSERT INTO portfolio (user_id, title, description, category, tags, thumbnail, images, url, featured, likes, views, created_at) VALUES
    (v_user_id, 'TechVenture Capital Website', 'Complete redesign of venture capital firm website', 'Web Design', ARRAY['Next.js', 'TypeScript', 'Tailwind'], 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800', ARRAY['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200'], 'https://techventure.example.com', true, 312, 4250, NOW() - INTERVAL '10 months'),
    (v_user_id, 'GreenLeaf E-Commerce', 'E-commerce platform for organic food retailer', 'E-commerce', ARRAY['React', 'Node.js', 'Stripe'], 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800', ARRAY['https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200'], 'https://greenleaf.example.com', true, 287, 3890, NOW() - INTERVAL '8 months'),
    (v_user_id, 'CloudSync Mobile App', 'Mobile banking app with biometric auth', 'Mobile App', ARRAY['React Native', 'TypeScript', 'AWS'], 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800', ARRAY['https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200'], NULL, true, 456, 5120, NOW() - INTERVAL '7 months'),
    (v_user_id, 'Nordic Design Brand Identity', 'Brand identity for Scandinavian design studio', 'Branding', ARRAY['Illustrator', 'Figma'], 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800', ARRAY['https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=1200'], NULL, true, 234, 2890, NOW() - INTERVAL '6 months'),
    (v_user_id, 'DataPulse Launch Video', '90-second animated explainer video', 'Video', ARRAY['After Effects', 'Cinema 4D'], 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800', ARRAY['https://images.unsplash.com/photo-1536240478700-b869070f9279?w=1200'], NULL, true, 892, 8920, NOW() - INTERVAL '4 months'),
    (v_user_id, 'Nexus Dashboard', 'Enterprise analytics dashboard', 'UI/UX Design', ARRAY['Figma', 'React', 'D3.js'], 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800', ARRAY['https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200'], 'https://nexus.example.com', true, 389, 4560, NOW() - INTERVAL '3 months'),
    (v_user_id, 'Bloom Learning Platform', 'K-12 learning management system', 'UI/UX Design', ARRAY['Figma', 'Principle'], 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800', ARRAY['https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200'], 'https://bloom.example.edu', true, 298, 3780, NOW() - INTERVAL '2 months'),
    (v_user_id, 'AI Content Generator', 'AI-powered content generation tool', 'AI/ML', ARRAY['Python', 'OpenAI', 'FastAPI'], 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800', ARRAY['https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200'], NULL, true, 567, 6780, NOW() - INTERVAL '2 months'),
    (v_user_id, 'Summit 3D Visualizations', 'Architectural visualizations for real estate', '3D Design', ARRAY['Blender', 'V-Ray'], 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800', ARRAY['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200'], NULL, false, 189, 2340, NOW() - INTERVAL '5 months'),
    (v_user_id, 'Stellar Social Campaign', 'Social media campaign design', 'Social Media', ARRAY['Canva', 'Adobe CC'], 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800', ARRAY['https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200'], 'https://instagram.com/stellarmarketing', false, 234, 2890, NOW() - INTERVAL '3 months')

    ON CONFLICT DO NOTHING;

    -- ============================================================================
    -- SOCIAL LINKS
    -- ============================================================================

    INSERT INTO social_links (user_id, platform, url, display_name, verified, created_at) VALUES
    (v_user_id, 'github', 'https://github.com/alexdemo', 'alexdemo', true, NOW() - INTERVAL '6 months'),
    (v_user_id, 'linkedin', 'https://linkedin.com/in/alexdemo', 'Alex Demo', true, NOW() - INTERVAL '6 months'),
    (v_user_id, 'twitter', 'https://twitter.com/alexdemo', '@alexdemo', true, NOW() - INTERVAL '6 months'),
    (v_user_id, 'dribbble', 'https://dribbble.com/alexdemo', 'alexdemo', false, NOW() - INTERVAL '6 months'),
    (v_user_id, 'behance', 'https://behance.net/alexdemo', 'Alex Demo', false, NOW() - INTERVAL '6 months'),
    (v_user_id, 'youtube', 'https://youtube.com/@alexdemo', 'Alex Demo', false, NOW() - INTERVAL '6 months')

    ON CONFLICT (user_id, platform) DO UPDATE SET
        url = EXCLUDED.url,
        display_name = EXCLUDED.display_name;

    -- ============================================================================
    -- ACHIEVEMENTS
    -- ============================================================================

    INSERT INTO achievements (user_id, name, description, icon, category, unlocked_at) VALUES
    (v_user_id, 'Awwwards Site of the Day', 'TechVenture Capital website recognized for exceptional design', 'trophy', 'Design Award', NOW() - INTERVAL '8 months'),
    (v_user_id, 'EdTech Digest Award', 'Bloom Learning Platform won Best UX/UI in Education', 'award', 'Industry Award', NOW() - INTERVAL '2 months'),
    (v_user_id, '$100K Revenue Milestone', 'Achieved six-figure annual revenue as freelancer', 'dollar-sign', 'Business Achievement', NOW() - INTERVAL '3 months'),
    (v_user_id, 'Top 10 Tech Podcast', 'Produced podcast ranked top 10 in Apple Podcasts Tech category', 'mic', 'Content Achievement', NOW() - INTERVAL '4 months'),
    (v_user_id, '50+ Projects Delivered', 'Successfully completed 50 client projects with 94% on-time delivery', 'check-circle', 'Milestone', NOW() - INTERVAL '1 month'),
    (v_user_id, 'Featured in Design Milk', 'Coffee brand packaging featured in Design Milk magazine', 'book-open', 'Press Feature', NOW() - INTERVAL '5 months'),
    (v_user_id, 'Stanford CHI Publication', 'Research paper published in ACM CHI conference', 'file-text', 'Academic', NOW() - INTERVAL '10 months'),
    (v_user_id, 'AWS Certified', 'Achieved AWS Solutions Architect certification', 'cloud', 'Certification', NOW() - INTERVAL '6 months')

    ON CONFLICT (user_id, name) DO UPDATE SET
        description = EXCLUDED.description;

    -- ============================================================================
    -- SELLER STATISTICS
    -- ============================================================================

    INSERT INTO seller_statistics (user_id, current_level, level_achieved_at, total_orders, completed_orders, cancelled_orders, active_orders, total_earnings, earnings_this_month, earnings_last_30_days, average_order_value, average_rating, total_reviews, five_star_reviews, four_star_reviews, positive_review_rate, on_time_delivery_rate, response_rate, response_time_hours, order_completion_rate, unique_clients, repeat_clients, repeat_buyer_rate, days_since_joined, days_active_last_30, account_health_score, created_at)
    VALUES (
        v_user_id,
        'level_2',
        NOW() - INTERVAL '2 months',
        52, 50, 2, 3,
        172500, 22000, 28500, 3450,
        4.85, 42, 38, 4, 100,
        94, 98, 2.5, 96,
        35, 12, 34,
        365, 28, 95,
        NOW() - INTERVAL '12 months'
    ) ON CONFLICT (user_id) DO UPDATE SET
        total_earnings = EXCLUDED.total_earnings,
        completed_orders = EXCLUDED.completed_orders,
        average_rating = EXCLUDED.average_rating,
        updated_at = NOW();

    -- ============================================================================
    -- SELLER XP
    -- ============================================================================

    INSERT INTO seller_xp (user_id, total_xp, current_level, xp_to_next_level, xp_from_orders, xp_from_reviews, xp_from_badges, xp_from_profile, xp_from_activity, current_streak_days, longest_streak_days, streak_multiplier)
    VALUES (
        v_user_id,
        8750, 15, 1250,
        5200, 2100, 850, 300, 300,
        12, 45, 1.2
    ) ON CONFLICT (user_id) DO UPDATE SET
        total_xp = EXCLUDED.total_xp,
        current_level = EXCLUDED.current_level,
        updated_at = NOW();

    RAISE NOTICE 'Portfolio and creative demo data seeded successfully for user: %', v_user_id;

END $$;

-- ============================================================================
-- OUTPUT SUMMARY
-- ============================================================================

SELECT
    'Portfolio & Creative Demo Data Seeded' AS status,
    (SELECT COUNT(*) FROM portfolio_projects WHERE portfolio_id IN (SELECT id FROM portfolios WHERE slug = 'alex-demo')) AS portfolio_projects,
    (SELECT COUNT(*) FROM portfolio_skills WHERE portfolio_id IN (SELECT id FROM portfolios WHERE slug = 'alex-demo')) AS skills,
    (SELECT COUNT(*) FROM portfolio_experience WHERE portfolio_id IN (SELECT id FROM portfolios WHERE slug = 'alex-demo')) AS work_experience,
    (SELECT COUNT(*) FROM portfolio_education WHERE portfolio_id IN (SELECT id FROM portfolios WHERE slug = 'alex-demo')) AS education,
    (SELECT COUNT(*) FROM portfolio_certifications WHERE portfolio_id IN (SELECT id FROM portfolios WHERE slug = 'alex-demo')) AS certifications,
    (SELECT COUNT(*) FROM portfolio_testimonials WHERE portfolio_id IN (SELECT id FROM portfolios WHERE slug = 'alex-demo')) AS testimonials,
    (SELECT COUNT(*) FROM gallery_images WHERE user_id = (SELECT id FROM auth.users WHERE email = 'alex@freeflow.io' LIMIT 1)) AS gallery_images,
    (SELECT COUNT(*) FROM achievements WHERE user_id = (SELECT id FROM auth.users WHERE email = 'alex@freeflow.io' LIMIT 1)) AS achievements;
