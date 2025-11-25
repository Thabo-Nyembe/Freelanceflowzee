-- Setup Test User and Sample Data
-- Run this in Supabase SQL Editor AFTER creating a user via Auth dashboard

-- ============================================================================
-- STEP 1: Check if user exists
-- ============================================================================
SELECT
  id,
  email,
  created_at,
  CASE
    WHEN email = 'test@kazi.dev' THEN '✅ Test user found!'
    ELSE '⚠️  User found but not test@kazi.dev'
  END as status
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- ============================================================================
-- STEP 2: Create profile for existing user
-- ============================================================================
-- This will only work if you have already created a user via the Auth dashboard

DO $$
DECLARE
  test_user_id UUID;
BEGIN
  -- Get the user ID (adjust email if you used a different one)
  SELECT id INTO test_user_id
  FROM auth.users
  WHERE email = 'test@kazi.dev'
  LIMIT 1;

  -- Check if user exists
  IF test_user_id IS NULL THEN
    RAISE NOTICE '❌ No user found with email test@kazi.dev';
    RAISE NOTICE '📝 Please create a user first:';
    RAISE NOTICE '   1. Go to Auth > Users in Supabase Dashboard';
    RAISE NOTICE '   2. Click "Add user" > "Create new user"';
    RAISE NOTICE '   3. Email: test@kazi.dev, Password: Trapster103';
    RAISE NOTICE '   4. Enable "Auto-confirm user"';
    RAISE NOTICE '   5. Then run this script again';
    RETURN;
  END IF;

  -- Create profile
  INSERT INTO profiles (id, username, full_name, avatar_url, bio, metadata)
  VALUES (
    test_user_id,
    'testuser',
    'Test User',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=testuser',
    'Test user for Kazi platform',
    '{}'::JSONB
  ) ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    bio = EXCLUDED.bio,
    updated_at = NOW();

  RAISE NOTICE '✅ Profile created for user: %', test_user_id;
END $$;

-- ============================================================================
-- STEP 3: Create sample data for testing
-- ============================================================================

DO $$
DECLARE
  test_user_id UUID;
  test_client_id UUID;
  test_project_id UUID;
BEGIN
  -- Get user ID
  SELECT id INTO test_user_id
  FROM auth.users
  WHERE email = 'test@kazi.dev'
  LIMIT 1;

  IF test_user_id IS NULL THEN
    RAISE NOTICE '⚠️  Skipping sample data - no test user found';
    RETURN;
  END IF;

  -- Sample client
  INSERT INTO clients (user_id, name, email, company, phone, notes)
  VALUES (
    test_user_id,
    'Acme Corporation',
    'contact@acme.com',
    'Acme Corp',
    '+1-555-0123',
    'Test client for development'
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO test_client_id;

  -- Get client_id if it already existed
  IF test_client_id IS NULL THEN
    SELECT id INTO test_client_id
    FROM clients
    WHERE user_id = test_user_id AND name = 'Acme Corporation'
    LIMIT 1;
  END IF;

  RAISE NOTICE '✅ Client created: %', test_client_id;

  -- Sample project
  INSERT INTO projects (user_id, client_id, title, description, status, priority, budget, progress)
  VALUES (
    test_user_id,
    test_client_id,
    'Website Redesign',
    'Complete redesign of company website with modern UI/UX',
    'active',
    'high',
    15000.00,
    45
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO test_project_id;

  -- Get project_id if it already existed
  IF test_project_id IS NULL THEN
    SELECT id INTO test_project_id
    FROM projects
    WHERE user_id = test_user_id AND title = 'Website Redesign'
    LIMIT 1;
  END IF;

  RAISE NOTICE '✅ Project created: %', test_project_id;

  -- Sample tasks
  INSERT INTO tasks (user_id, project_id, title, description, status, priority, due_date)
  VALUES
    (
      test_user_id,
      test_project_id,
      'Design homepage mockup',
      'Create initial design concepts for homepage',
      'completed',
      'high',
      NOW() + INTERVAL '3 days'
    ),
    (
      test_user_id,
      test_project_id,
      'Develop responsive layout',
      'Implement responsive CSS grid system',
      'in_progress',
      'high',
      NOW() + INTERVAL '7 days'
    ),
    (
      test_user_id,
      test_project_id,
      'Setup deployment pipeline',
      'Configure CI/CD for automatic deployments',
      'todo',
      'medium',
      NOW() + INTERVAL '14 days'
    )
  ON CONFLICT DO NOTHING;

  RAISE NOTICE '✅ Tasks created: 3';

  -- Sample notification
  INSERT INTO notifications (user_id, title, message, type, read)
  VALUES (
    test_user_id,
    'Welcome to Kazi!',
    'Your database is fully wired and ready. Start creating projects!',
    'info',
    false
  )
  ON CONFLICT DO NOTHING;

  RAISE NOTICE '✅ Notification created';

  -- Sample invoice
  INSERT INTO invoices (user_id, client_id, project_id, invoice_number, amount, status, due_date, notes)
  VALUES (
    test_user_id,
    test_client_id,
    test_project_id,
    'INV-2025-001',
    5000.00,
    'sent',
    NOW() + INTERVAL '30 days',
    'First milestone payment - Design phase'
  )
  ON CONFLICT DO NOTHING;

  RAISE NOTICE '✅ Invoice created';

END $$;

-- ============================================================================
-- STEP 4: Verify the data was created
-- ============================================================================

SELECT
  '🎉 Setup Complete!' as status,
  'Test user and sample data ready!' as message;

-- Show summary
SELECT
  'Users' as category,
  COUNT(*)::text as count,
  '✅' as status
FROM auth.users
WHERE email = 'test@kazi.dev'
UNION ALL
SELECT 'Profiles', COUNT(*)::text, '✅' FROM profiles
WHERE id IN (SELECT id FROM auth.users WHERE email = 'test@kazi.dev')
UNION ALL
SELECT 'Clients', COUNT(*)::text, '✅' FROM clients
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'test@kazi.dev')
UNION ALL
SELECT 'Projects', COUNT(*)::text, '✅' FROM projects
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'test@kazi.dev')
UNION ALL
SELECT 'Tasks', COUNT(*)::text, '✅' FROM tasks
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'test@kazi.dev')
UNION ALL
SELECT 'Notifications', COUNT(*)::text, '✅' FROM notifications
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'test@kazi.dev')
UNION ALL
SELECT 'Invoices', COUNT(*)::text, '✅' FROM invoices
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'test@kazi.dev');
