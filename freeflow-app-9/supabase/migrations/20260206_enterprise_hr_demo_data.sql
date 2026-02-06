-- ============================================================================
-- Enterprise HR Demo Data for alex@freeflow.io
-- ============================================================================
-- This migration seeds comprehensive HR demo data including:
-- - 36 employees across 6 departments
-- - Performance reviews with goals and feedback
-- - Onboarding programs and tasks
-- - Payroll runs and employee payroll records
-- - Training programs and enrollments
-- - Employee documents
--
-- Demo User ID: 00000000-0000-0000-0000-000000000001
-- ============================================================================

-- Set the demo user ID
DO $$
DECLARE
  demo_user_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN

-- ============================================================================
-- EMPLOYEES (36 employees across 6 departments)
-- ============================================================================

-- Engineering Department (12 employees)
INSERT INTO employees (id, user_id, employee_name, employee_id, email, phone, position, job_title, department, team, level, employment_type, status, is_remote, salary, hourly_rate, currency, bonus_eligible, health_insurance, retirement_plan, stock_options, pto_days, sick_days, used_pto_days, used_sick_days, hire_date, start_date, performance_rating, performance_score, goals_completed, goals_total, projects_count, tasks_completed, hours_logged, productivity_score, skills, certifications, education_level, onboarding_completed, onboarding_progress, created_at)
VALUES
  ('emp00000-0000-0000-000000000001', demo_user_id, 'Sarah Chen', 'EMP1001', 'sarah.chen@freeflow.io', '+1 415-555-1001', 'VP of Engineering', 'VP of Engineering', 'Engineering', 'Engineering', 'VP', 'full-time', 'active', false, 245000, 117.79, 'USD', true, true, true, 8000, 25, 10, 5, 2, '2022-03-15', '2022-03-15', 4.85, 96, 12, 12, 15, 250, 1850, 94.5, ARRAY['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'AWS'], ARRAY['AWS Solutions Architect', 'PMP'], 'Master''s', true, 100, NOW()),
  ('emp00000-0000-0000-000000000002', demo_user_id, 'James Wilson', 'EMP1002', 'james.wilson@freeflow.io', '+1 415-555-1002', 'Senior Software Engineer', 'Senior Software Engineer', 'Engineering', 'Engineering', 'Senior', 'full-time', 'active', true, 175000, 84.13, 'USD', true, true, true, 3000, 20, 10, 6, 1, '2022-06-01', '2022-06-01', 4.65, 92, 10, 11, 12, 180, 1650, 91.2, ARRAY['React', 'TypeScript', 'PostgreSQL', 'Docker'], ARRAY['AWS Developer Associate'], 'Bachelor''s', true, 100, NOW()),
  ('emp00000-0000-0000-000000000003', demo_user_id, 'Priya Sharma', 'EMP1003', 'priya.sharma@freeflow.io', '+1 415-555-1003', 'Senior Software Engineer', 'Senior Software Engineer', 'Engineering', 'Engineering', 'Senior', 'full-time', 'active', false, 170000, 81.73, 'USD', true, true, true, 2500, 20, 10, 4, 3, '2022-08-15', '2022-08-15', 4.72, 93, 11, 12, 14, 195, 1720, 92.8, ARRAY['Python', 'Machine Learning', 'TensorFlow', 'AWS'], ARRAY['Google Cloud Professional'], 'PhD', true, 100, NOW()),
  ('emp00000-0000-0000-000000000004', demo_user_id, 'Alex Rivera', 'EMP1004', 'alex.rivera@freeflow.io', '+1 415-555-1004', 'Software Engineer', 'Software Engineer', 'Engineering', 'Engineering', 'Mid', 'full-time', 'active', true, 135000, 64.90, 'USD', true, true, true, 1000, 20, 10, 7, 2, '2023-01-10', '2023-01-10', 4.35, 86, 8, 10, 8, 145, 1480, 87.5, ARRAY['JavaScript', 'React', 'Node.js', 'MongoDB'], ARRAY[], 'Bachelor''s', true, 100, NOW()),
  ('emp00000-0000-0000-000000000005', demo_user_id, 'Lisa Zhang', 'EMP1005', 'lisa.zhang@freeflow.io', '+1 415-555-1005', 'Software Engineer', 'Software Engineer', 'Engineering', 'Engineering', 'Mid', 'full-time', 'active', false, 130000, 62.50, 'USD', true, true, true, 1000, 20, 10, 3, 1, '2023-03-20', '2023-03-20', 4.42, 88, 9, 10, 10, 160, 1520, 88.3, ARRAY['TypeScript', 'React', 'GraphQL', 'Kubernetes'], ARRAY[], 'Master''s', true, 100, NOW()),
  ('emp00000-0000-0000-000000000006', demo_user_id, 'Ryan O''Connor', 'EMP1006', 'ryan.oconnor@freeflow.io', '+1 415-555-1006', 'Junior Software Engineer', 'Junior Software Engineer', 'Engineering', 'Engineering', 'Junior', 'full-time', 'active', false, 95000, 45.67, 'USD', false, true, true, 0, 15, 10, 2, 0, '2024-06-01', '2024-06-01', 4.15, 82, 5, 8, 4, 85, 920, 81.5, ARRAY['JavaScript', 'React', 'CSS'], ARRAY[], 'Bachelor''s', true, 100, NOW()),
  ('emp00000-0000-0000-000000000007', demo_user_id, 'Emma Davis', 'EMP1007', 'emma.davis@freeflow.io', '+1 415-555-1007', 'DevOps Engineer', 'DevOps Engineer', 'Engineering', 'Engineering', 'Senior', 'full-time', 'active', true, 165000, 79.33, 'USD', true, true, true, 2000, 20, 10, 5, 2, '2022-11-01', '2022-11-01', 4.68, 93, 10, 11, 11, 175, 1680, 91.8, ARRAY['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD'], ARRAY['AWS DevOps Engineer Professional'], 'Bachelor''s', true, 100, NOW()),
  ('emp00000-0000-0000-000000000008', demo_user_id, 'Kevin Park', 'EMP1008', 'kevin.park@freeflow.io', '+1 415-555-1008', 'QA Engineer', 'QA Engineer', 'Engineering', 'Engineering', 'Mid', 'full-time', 'active', false, 115000, 55.29, 'USD', true, true, true, 500, 20, 10, 4, 1, '2023-05-15', '2023-05-15', 4.28, 85, 7, 9, 9, 155, 1450, 86.2, ARRAY['Selenium', 'Cypress', 'Jest', 'Python'], ARRAY['ISTQB'], 'Bachelor''s', true, 100, NOW()),
  ('emp00000-0000-0000-000000000009', demo_user_id, 'Sophia Martinez', 'EMP1009', 'sophia.martinez@freeflow.io', '+1 415-555-1009', 'Frontend Developer', 'Frontend Developer', 'Engineering', 'Engineering', 'Mid', 'full-time', 'active', true, 128000, 61.54, 'USD', true, true, true, 800, 20, 10, 6, 2, '2023-02-01', '2023-02-01', 4.55, 90, 9, 10, 11, 168, 1560, 89.5, ARRAY['React', 'Vue.js', 'CSS', 'Tailwind', 'Figma'], ARRAY[], 'Bachelor''s', true, 100, NOW()),
  ('emp00000-0000-0000-000000000010', demo_user_id, 'Daniel Brown', 'EMP1010', 'daniel.brown@freeflow.io', '+1 415-555-1010', 'Backend Developer', 'Backend Developer', 'Engineering', 'Engineering', 'Mid', 'full-time', 'active', false, 132000, 63.46, 'USD', true, true, true, 1000, 20, 10, 5, 1, '2023-04-10', '2023-04-10', 4.48, 89, 8, 10, 10, 162, 1540, 88.8, ARRAY['Node.js', 'Python', 'PostgreSQL', 'Redis', 'RabbitMQ'], ARRAY[], 'Master''s', true, 100, NOW()),
  ('emp00000-0000-0000-000000000011', demo_user_id, 'Aisha Johnson', 'EMP1011', 'aisha.johnson@freeflow.io', '+1 415-555-1011', 'Data Engineer', 'Data Engineer', 'Engineering', 'Engineering', 'Senior', 'full-time', 'active', true, 158000, 75.96, 'USD', true, true, true, 1800, 20, 10, 4, 2, '2022-09-01', '2022-09-01', 4.62, 91, 10, 11, 12, 185, 1650, 90.5, ARRAY['Python', 'Spark', 'Airflow', 'SQL', 'AWS', 'Snowflake'], ARRAY['Databricks Certified'], 'Master''s', true, 100, NOW()),
  ('emp00000-0000-0000-000000000012', demo_user_id, 'Chris Lee', 'EMP1012', 'chris.lee@freeflow.io', '+1 415-555-1012', 'Engineering Intern', 'Engineering Intern', 'Engineering', 'Engineering', 'Intern', 'intern', 'active', false, 55000, 26.44, 'USD', false, true, false, 0, 10, 5, 1, 0, '2025-09-01', '2025-09-01', 3.95, 78, 3, 6, 2, 45, 380, 76.5, ARRAY['JavaScript', 'Python', 'Git'], ARRAY[], 'Bachelor''s', false, 75, NOW()),

-- Sales Department (8 employees)
  ('emp00000-0000-0000-000000000013', demo_user_id, 'Marcus Williams', 'EMP1013', 'marcus.williams@freeflow.io', '+1 415-555-1013', 'VP of Sales', 'VP of Sales', 'Sales', 'Sales', 'VP', 'full-time', 'active', false, 225000, 108.17, 'USD', true, true, true, 6000, 25, 10, 6, 1, '2022-02-01', '2022-02-01', 4.82, 95, 12, 12, 8, 120, 1750, 93.8, ARRAY['Salesforce', 'Negotiation', 'Strategic Planning', 'Team Leadership'], ARRAY['Certified Sales Leader'], 'MBA', true, 100, NOW()),
  ('emp00000-0000-0000-000000000014', demo_user_id, 'Ashley Taylor', 'EMP1014', 'ashley.taylor@freeflow.io', '+1 415-555-1014', 'Senior Account Executive', 'Senior Account Executive', 'Sales', 'Sales', 'Senior', 'full-time', 'active', true, 145000, 69.71, 'USD', true, true, true, 1500, 20, 10, 5, 2, '2022-07-15', '2022-07-15', 4.58, 91, 10, 11, 25, 95, 1620, 90.2, ARRAY['Salesforce', 'HubSpot', 'Enterprise Sales', 'Contract Negotiation'], ARRAY[], 'Bachelor''s', true, 100, NOW()),
  ('emp00000-0000-0000-000000000015', demo_user_id, 'Brandon Clark', 'EMP1015', 'brandon.clark@freeflow.io', '+1 415-555-1015', 'Account Executive', 'Account Executive', 'Sales', 'Sales', 'Mid', 'full-time', 'active', false, 95000, 45.67, 'USD', true, true, true, 500, 20, 10, 4, 1, '2023-06-01', '2023-06-01', 4.35, 86, 8, 10, 18, 82, 1480, 85.5, ARRAY['Salesforce', 'Cold Calling', 'Pipeline Management'], ARRAY[], 'Bachelor''s', true, 100, NOW()),
  ('emp00000-0000-0000-000000000016', demo_user_id, 'Catherine Moore', 'EMP1016', 'catherine.moore@freeflow.io', '+1 415-555-1016', 'Account Executive', 'Account Executive', 'Sales', 'Sales', 'Mid', 'full-time', 'active', true, 92000, 44.23, 'USD', true, true, true, 500, 20, 10, 3, 2, '2023-08-15', '2023-08-15', 4.42, 88, 9, 10, 16, 78, 1420, 87.2, ARRAY['HubSpot', 'Zoom', 'Presentation Skills'], ARRAY[], 'Bachelor''s', true, 100, NOW()),
  ('emp00000-0000-0000-000000000017', demo_user_id, 'Derek White', 'EMP1017', 'derek.white@freeflow.io', '+1 415-555-1017', 'Sales Development Rep', 'Sales Development Rep', 'Sales', 'Sales', 'Junior', 'full-time', 'active', false, 65000, 31.25, 'USD', false, true, true, 0, 15, 10, 2, 0, '2024-03-01', '2024-03-01', 4.18, 83, 6, 8, 8, 55, 1150, 81.8, ARRAY['Outreach', 'LinkedIn Sales Navigator', 'Cold Calling'], ARRAY[], 'Bachelor''s', true, 100, NOW()),
  ('emp00000-0000-0000-000000000018', demo_user_id, 'Elena Garcia', 'EMP1018', 'elena.garcia@freeflow.io', '+1 415-555-1018', 'Sales Development Rep', 'Sales Development Rep', 'Sales', 'Sales', 'Junior', 'full-time', 'active', false, 62000, 29.81, 'USD', false, true, true, 0, 15, 10, 3, 1, '2024-05-15', '2024-05-15', 4.25, 84, 7, 8, 6, 48, 980, 82.5, ARRAY['Salesforce', 'Email Outreach', 'Research'], ARRAY[], 'Bachelor''s', true, 100, NOW()),
  ('emp00000-0000-0000-000000000019', demo_user_id, 'Frank Harris', 'EMP1019', 'frank.harris@freeflow.io', '+1 415-555-1019', 'Sales Operations Manager', 'Sales Operations Manager', 'Sales', 'Sales', 'Manager', 'full-time', 'active', false, 125000, 60.10, 'USD', true, true, true, 1200, 20, 10, 4, 2, '2022-10-01', '2022-10-01', 4.52, 89, 9, 10, 5, 98, 1580, 88.5, ARRAY['Salesforce Admin', 'Data Analysis', 'Process Optimization'], ARRAY['Salesforce Admin Certified'], 'Bachelor''s', true, 100, NOW()),
  ('emp00000-0000-0000-000000000020', demo_user_id, 'Grace Miller', 'EMP1020', 'grace.miller@freeflow.io', '+1 415-555-1020', 'Customer Success Manager', 'Customer Success Manager', 'Sales', 'Sales', 'Mid', 'full-time', 'active', true, 98000, 47.12, 'USD', true, true, true, 600, 20, 10, 5, 1, '2023-04-01', '2023-04-01', 4.48, 89, 8, 10, 35, 110, 1520, 88.2, ARRAY['Customer Retention', 'Account Management', 'Product Training'], ARRAY[], 'Bachelor''s', true, 100, NOW()),

-- Marketing Department (5 employees)
  ('emp00000-0000-0000-000000000021', demo_user_id, 'Emily Rodriguez', 'EMP1021', 'emily.rodriguez@freeflow.io', '+1 415-555-1021', 'VP of Marketing', 'VP of Marketing', 'Marketing', 'Marketing', 'VP', 'full-time', 'active', false, 215000, 103.37, 'USD', true, true, true, 5500, 25, 10, 5, 2, '2022-04-01', '2022-04-01', 4.78, 94, 11, 12, 12, 135, 1720, 93.2, ARRAY['Brand Strategy', 'Digital Marketing', 'Team Leadership', 'Budget Management'], ARRAY['Google Marketing Platform Certified'], 'MBA', true, 100, NOW()),
  ('emp00000-0000-0000-000000000022', demo_user_id, 'Hannah Lewis', 'EMP1022', 'hannah.lewis@freeflow.io', '+1 415-555-1022', 'Content Marketing Manager', 'Content Marketing Manager', 'Marketing', 'Marketing', 'Manager', 'full-time', 'active', true, 115000, 55.29, 'USD', true, true, true, 1000, 20, 10, 6, 1, '2022-09-15', '2022-09-15', 4.55, 90, 9, 10, 8, 125, 1580, 89.5, ARRAY['Content Strategy', 'SEO', 'Copywriting', 'HubSpot'], ARRAY['HubSpot Content Marketing'], 'Bachelor''s', true, 100, NOW()),
  ('emp00000-0000-0000-000000000023', demo_user_id, 'Ian Scott', 'EMP1023', 'ian.scott@freeflow.io', '+1 415-555-1023', 'Digital Marketing Specialist', 'Digital Marketing Specialist', 'Marketing', 'Marketing', 'Mid', 'full-time', 'active', false, 85000, 40.87, 'USD', true, true, true, 400, 20, 10, 4, 2, '2023-07-01', '2023-07-01', 4.38, 87, 8, 10, 15, 95, 1420, 86.8, ARRAY['Google Ads', 'Facebook Ads', 'Analytics', 'A/B Testing'], ARRAY['Google Ads Certified'], 'Bachelor''s', true, 100, NOW()),
  ('emp00000-0000-0000-000000000024', demo_user_id, 'Julia Adams', 'EMP1024', 'julia.adams@freeflow.io', '+1 415-555-1024', 'Brand Designer', 'Brand Designer', 'Marketing', 'Marketing', 'Mid', 'full-time', 'active', true, 92000, 44.23, 'USD', true, true, true, 500, 20, 10, 5, 1, '2023-05-01', '2023-05-01', 4.62, 91, 9, 10, 22, 145, 1480, 90.2, ARRAY['Figma', 'Adobe Creative Suite', 'Brand Guidelines', 'Motion Design'], ARRAY[], 'Bachelor''s', true, 100, NOW()),
  ('emp00000-0000-0000-000000000025', demo_user_id, 'Kyle Turner', 'EMP1025', 'kyle.turner@freeflow.io', '+1 415-555-1025', 'Marketing Coordinator', 'Marketing Coordinator', 'Marketing', 'Marketing', 'Junior', 'full-time', 'active', false, 58000, 27.88, 'USD', false, true, true, 0, 15, 10, 2, 0, '2024-08-01', '2024-08-01', 4.12, 81, 5, 8, 4, 42, 680, 79.5, ARRAY['Social Media', 'Email Marketing', 'Event Planning'], ARRAY[], 'Bachelor''s', false, 85, NOW()),

-- HR Department (3 employees)
  ('emp00000-0000-0000-000000000026', demo_user_id, 'David Kim', 'EMP1026', 'david.kim@freeflow.io', '+1 415-555-1026', 'VP of HR', 'VP of HR', 'HR', 'HR', 'VP', 'full-time', 'active', false, 195000, 93.75, 'USD', true, true, true, 4500, 25, 10, 4, 2, '2022-01-15', '2022-01-15', 4.75, 94, 11, 12, 10, 115, 1680, 92.8, ARRAY['Talent Management', 'Compensation & Benefits', 'Employee Relations', 'HR Strategy'], ARRAY['SHRM-SCP', 'SPHR'], 'Master''s', true, 100, NOW()),
  ('emp00000-0000-0000-000000000027', demo_user_id, 'Laura Nelson', 'EMP1027', 'laura.nelson@freeflow.io', '+1 415-555-1027', 'HR Business Partner', 'HR Business Partner', 'HR', 'HR', 'Senior', 'full-time', 'active', false, 105000, 50.48, 'USD', true, true, true, 800, 20, 10, 5, 1, '2022-12-01', '2022-12-01', 4.52, 89, 9, 10, 8, 98, 1550, 88.5, ARRAY['Recruiting', 'Employee Development', 'HRIS', 'Compliance'], ARRAY['SHRM-CP'], 'Bachelor''s', true, 100, NOW()),
  ('emp00000-0000-0000-000000000028', demo_user_id, 'Maria Gonzalez', 'EMP1028', 'maria.gonzalez@freeflow.io', '+1 415-555-1028', 'HR Coordinator', 'HR Coordinator', 'HR', 'HR', 'Junior', 'full-time', 'active', false, 55000, 26.44, 'USD', false, true, true, 0, 15, 10, 3, 0, '2024-02-15', '2024-02-15', 4.22, 84, 6, 8, 5, 65, 1020, 82.5, ARRAY['Onboarding', 'HRIS', 'Benefits Administration'], ARRAY[], 'Bachelor''s', true, 100, NOW()),

-- Finance Department (4 employees)
  ('emp00000-0000-0000-000000000029', demo_user_id, 'Jennifer Liu', 'EMP1029', 'jennifer.liu@freeflow.io', '+1 415-555-1029', 'CFO', 'Chief Financial Officer', 'Finance', 'Finance', 'C-Level', 'full-time', 'active', false, 275000, 132.21, 'USD', true, true, true, 12000, 30, 10, 5, 1, '2021-11-01', '2021-11-01', 4.92, 97, 12, 12, 6, 85, 1850, 95.5, ARRAY['Financial Planning', 'M&A', 'Investor Relations', 'Strategic Finance'], ARRAY['CPA', 'CFA'], 'MBA', true, 100, NOW()),
  ('emp00000-0000-0000-000000000030', demo_user_id, 'Nathan Hill', 'EMP1030', 'nathan.hill@freeflow.io', '+1 415-555-1030', 'Senior Accountant', 'Senior Accountant', 'Finance', 'Finance', 'Senior', 'full-time', 'active', false, 115000, 55.29, 'USD', true, true, true, 1000, 20, 10, 4, 2, '2022-08-01', '2022-08-01', 4.58, 91, 10, 11, 4, 125, 1620, 90.2, ARRAY['GAAP', 'Financial Reporting', 'Audit', 'QuickBooks'], ARRAY['CPA'], 'Bachelor''s', true, 100, NOW()),
  ('emp00000-0000-0000-000000000031', demo_user_id, 'Olivia Carter', 'EMP1031', 'olivia.carter@freeflow.io', '+1 415-555-1031', 'Financial Analyst', 'Financial Analyst', 'Finance', 'Finance', 'Mid', 'full-time', 'active', true, 95000, 45.67, 'USD', true, true, true, 600, 20, 10, 3, 1, '2023-03-15', '2023-03-15', 4.45, 88, 8, 10, 6, 105, 1480, 87.5, ARRAY['Financial Modeling', 'Excel', 'Budgeting', 'Forecasting'], ARRAY[], 'Bachelor''s', true, 100, NOW()),
  ('emp00000-0000-0000-000000000032', demo_user_id, 'Peter Wright', 'EMP1032', 'peter.wright@freeflow.io', '+1 415-555-1032', 'Accounts Payable Specialist', 'Accounts Payable Specialist', 'Finance', 'Finance', 'Junior', 'full-time', 'active', false, 58000, 27.88, 'USD', false, true, true, 0, 15, 10, 2, 0, '2024-04-01', '2024-04-01', 4.18, 83, 6, 8, 3, 85, 1120, 81.8, ARRAY['AP Processing', 'Vendor Management', 'QuickBooks'], ARRAY[], 'Bachelor''s', true, 100, NOW()),

-- Operations Department (4 employees)
  ('emp00000-0000-0000-000000000033', demo_user_id, 'Michael Thompson', 'EMP1033', 'michael.thompson@freeflow.io', '+1 415-555-1033', 'VP of Operations', 'VP of Operations', 'Operations', 'Operations', 'VP', 'full-time', 'active', false, 205000, 98.56, 'USD', true, true, true, 5000, 25, 10, 4, 2, '2022-05-01', '2022-05-01', 4.72, 93, 11, 12, 8, 95, 1720, 92.2, ARRAY['Process Optimization', 'Vendor Management', 'Logistics', 'Team Leadership'], ARRAY['Six Sigma Black Belt', 'PMP'], 'MBA', true, 100, NOW()),
  ('emp00000-0000-0000-000000000034', demo_user_id, 'Rachel Baker', 'EMP1034', 'rachel.baker@freeflow.io', '+1 415-555-1034', 'Operations Manager', 'Operations Manager', 'Operations', 'Operations', 'Manager', 'full-time', 'active', false, 110000, 52.88, 'USD', true, true, true, 900, 20, 10, 5, 1, '2022-11-15', '2022-11-15', 4.55, 90, 9, 10, 6, 88, 1580, 89.5, ARRAY['Project Management', 'Process Improvement', 'Inventory Management'], ARRAY['Six Sigma Green Belt'], 'Bachelor''s', true, 100, NOW()),
  ('emp00000-0000-0000-000000000035', demo_user_id, 'Steven Young', 'EMP1035', 'steven.young@freeflow.io', '+1 415-555-1035', 'Facilities Coordinator', 'Facilities Coordinator', 'Operations', 'Operations', 'Mid', 'full-time', 'active', false, 68000, 32.69, 'USD', true, true, true, 200, 20, 10, 4, 2, '2023-09-01', '2023-09-01', 4.32, 86, 7, 9, 4, 72, 1380, 85.2, ARRAY['Facilities Management', 'Vendor Relations', 'Safety Compliance'], ARRAY[], 'Bachelor''s', true, 100, NOW()),
  ('emp00000-0000-0000-000000000036', demo_user_id, 'Tina Roberts', 'EMP1036', 'tina.roberts@freeflow.io', '+1 415-555-1036', 'Office Administrator', 'Office Administrator', 'Operations', 'Operations', 'Junior', 'full-time', 'active', false, 52000, 25.00, 'USD', false, true, true, 0, 15, 10, 3, 1, '2024-01-15', '2024-01-15', 4.25, 84, 6, 8, 3, 95, 1080, 83.5, ARRAY['Office Management', 'Scheduling', 'Event Coordination'], ARRAY[], 'Bachelor''s', true, 100, NOW())
ON CONFLICT (id) DO UPDATE SET
  employee_name = EXCLUDED.employee_name,
  position = EXCLUDED.position,
  department = EXCLUDED.department,
  salary = EXCLUDED.salary,
  updated_at = NOW();

-- ============================================================================
-- PERFORMANCE REVIEWS
-- ============================================================================

INSERT INTO performance_reviews (id, user_id, employee_id, employee_name, employee_email, employee_position, employee_department, reviewer_name, reviewer_position, review_period, review_year, review_quarter, review_type, overall_score, performance_score, goals_score, competency_score, behavior_score, goals_set, goals_achieved, goals_in_progress, goals_missed, status, manager_feedback, employee_feedback, strengths, areas_for_improvement, recommendations, review_date, rating, created_at)
VALUES
  -- Q4 2025 Reviews for key employees
  ('rev00000-0000-0000-000000000001', demo_user_id, 'EMP1001', 'Sarah Chen', 'sarah.chen@freeflow.io', 'VP of Engineering', 'Engineering', 'CEO', 'CEO', 'Q4 2025', 2025, 'Q4', 'quarterly', 95.5, 96.0, 94.0, 96.5, 95.5, 6, 5, 1, 0, 'completed', 'Exceptional leadership and execution. Led engineering team to deliver all major milestones ahead of schedule. Outstanding mentor and culture builder.', 'Thank you for the recognition. Looking forward to expanding our platform capabilities in the new year.', ARRAY['Technical leadership', 'Team development', 'Strategic thinking', 'Cross-functional collaboration'], ARRAY['Delegation to senior staff', 'Work-life balance'], 'Strong promotion candidate for CTO role.', '2025-12-15', 'excellent', NOW()),
  ('rev00000-0000-0000-000000000002', demo_user_id, 'EMP1002', 'James Wilson', 'james.wilson@freeflow.io', 'Senior Software Engineer', 'Engineering', 'Sarah Chen', 'VP of Engineering', 'Q4 2025', 2025, 'Q4', 'quarterly', 91.2, 92.0, 89.5, 91.0, 92.5, 5, 4, 1, 0, 'completed', 'Consistently delivers high-quality code. Strong technical mentor for junior developers. Excellent problem-solving skills.', 'Enjoyed the challenging projects this quarter. Eager to take on more architectural decisions.', ARRAY['Code quality', 'Technical expertise', 'Mentoring'], ARRAY['Public speaking', 'Documentation'], 'Consider for tech lead role in Q2.', '2025-12-18', 'excellent', NOW()),
  ('rev00000-0000-0000-000000000003', demo_user_id, 'EMP1013', 'Marcus Williams', 'marcus.williams@freeflow.io', 'VP of Sales', 'Sales', 'CEO', 'CEO', 'Q4 2025', 2025, 'Q4', 'quarterly', 94.8, 96.0, 93.0, 94.5, 95.5, 6, 6, 0, 0, 'completed', 'Exceeded annual revenue targets by 15%. Built strong enterprise client relationships. Excellent team culture.', 'Proud of what the team accomplished. Ready to scale further in 2026.', ARRAY['Revenue generation', 'Client relationships', 'Team motivation', 'Strategic planning'], ARRAY['Process documentation', 'Cross-department collaboration'], 'Exceeded all targets - consider expanded territory.', '2025-12-16', 'excellent', NOW()),
  ('rev00000-0000-0000-000000000004', demo_user_id, 'EMP1021', 'Emily Rodriguez', 'emily.rodriguez@freeflow.io', 'VP of Marketing', 'Marketing', 'CEO', 'CEO', 'Q4 2025', 2025, 'Q4', 'quarterly', 93.5, 94.0, 92.5, 93.0, 94.5, 5, 5, 0, 0, 'completed', 'Outstanding brand awareness campaign resulting in 40% increase in qualified leads. Excellent content strategy execution.', 'Excited about the brand momentum. Planning ambitious campaigns for the new year.', ARRAY['Brand strategy', 'Content marketing', 'Team leadership', 'Budget management'], ARRAY['Data analytics depth', 'Video marketing'], 'Strong performer - continue leadership development.', '2025-12-17', 'excellent', NOW()),
  ('rev00000-0000-0000-000000000005', demo_user_id, 'EMP1026', 'David Kim', 'david.kim@freeflow.io', 'VP of HR', 'HR', 'CEO', 'CEO', 'Q4 2025', 2025, 'Q4', 'quarterly', 94.2, 95.0, 93.0, 94.0, 94.5, 5, 5, 0, 0, 'completed', 'Successfully reduced turnover to 8%. Implemented comprehensive onboarding program. Strong culture advocate.', 'Happy to see the positive impact of our people initiatives.', ARRAY['Employee engagement', 'Talent acquisition', 'Culture building', 'Policy development'], ARRAY['HR technology adoption', 'Analytics'], 'Key contributor to company success.', '2025-12-19', 'excellent', NOW()),
  ('rev00000-0000-0000-000000000006', demo_user_id, 'EMP1029', 'Jennifer Liu', 'jennifer.liu@freeflow.io', 'CFO', 'Finance', 'CEO', 'CEO', 'Q4 2025', 2025, 'Q4', 'quarterly', 96.5, 97.0, 96.0, 96.0, 97.0, 6, 6, 0, 0, 'completed', 'Exceptional financial leadership. Secured Series B funding. Maintained excellent cash flow management.', 'Grateful for the trust and looking forward to continued growth.', ARRAY['Financial strategy', 'Investor relations', 'Risk management', 'Team development'], ARRAY['Operational involvement'], 'Outstanding performance - key executive.', '2025-12-14', 'excellent', NOW()),

  -- Mid-level employee reviews
  ('rev00000-0000-0000-000000000007', demo_user_id, 'EMP1004', 'Alex Rivera', 'alex.rivera@freeflow.io', 'Software Engineer', 'Engineering', 'Sarah Chen', 'VP of Engineering', 'Q4 2025', 2025, 'Q4', 'quarterly', 85.5, 86.0, 84.0, 86.0, 86.0, 5, 4, 1, 0, 'completed', 'Solid performance with good growth trajectory. Shows initiative in learning new technologies.', 'Appreciated the opportunities to grow this quarter.', ARRAY['Problem-solving', 'Collaboration', 'Quick learner'], ARRAY['System design', 'Code review skills'], 'Continue mentoring for senior role.', '2025-12-20', 'good', NOW()),
  ('rev00000-0000-0000-000000000008', demo_user_id, 'EMP1015', 'Brandon Clark', 'brandon.clark@freeflow.io', 'Account Executive', 'Sales', 'Marcus Williams', 'VP of Sales', 'Q4 2025', 2025, 'Q4', 'quarterly', 86.8, 88.0, 85.0, 86.0, 88.0, 5, 4, 1, 0, 'completed', 'Met quota consistently. Good client rapport. Improving on enterprise deal management.', 'Excited to tackle bigger deals next quarter.', ARRAY['Client relationships', 'Persistence', 'Product knowledge'], ARRAY['Enterprise sales cycle', 'Negotiation'], 'Promote to Senior AE upon hitting stretch targets.', '2025-12-21', 'good', NOW()),
  ('rev00000-0000-0000-000000000009', demo_user_id, 'EMP1023', 'Ian Scott', 'ian.scott@freeflow.io', 'Digital Marketing Specialist', 'Marketing', 'Emily Rodriguez', 'VP of Marketing', 'Q4 2025', 2025, 'Q4', 'quarterly', 87.5, 88.0, 86.5, 87.0, 88.5, 4, 3, 1, 0, 'completed', 'Strong campaign execution. Good ROI on paid channels. Growing analytics capabilities.', 'Learned a lot about attribution modeling this quarter.', ARRAY['Campaign management', 'Data analysis', 'A/B testing'], ARRAY['SEO strategy', 'Content creation'], 'Good trajectory - continue skill development.', '2025-12-22', 'good', NOW()),
  ('rev00000-0000-0000-000000000010', demo_user_id, 'EMP1031', 'Olivia Carter', 'olivia.carter@freeflow.io', 'Financial Analyst', 'Finance', 'Jennifer Liu', 'CFO', 'Q4 2025', 2025, 'Q4', 'quarterly', 88.2, 89.0, 87.0, 88.0, 89.0, 4, 4, 0, 0, 'completed', 'Excellent analytical work. Key contributor to investor materials. Strong attention to detail.', 'Enjoyed the investor presentation work. Want to learn more about M&A.', ARRAY['Financial modeling', 'Attention to detail', 'Presentation skills'], ARRAY['Strategic thinking', 'Stakeholder management'], 'Consider for senior analyst role.', '2025-12-23', 'good', NOW())
ON CONFLICT (id) DO UPDATE SET
  overall_score = EXCLUDED.overall_score,
  status = EXCLUDED.status,
  updated_at = NOW();

-- ============================================================================
-- PERFORMANCE GOALS
-- ============================================================================

INSERT INTO performance_goals (id, user_id, review_id, goal_title, goal_description, goal_category, assigned_to_name, assigned_to_email, assigned_by_name, target_value, current_value, progress_percentage, priority, weight, status, start_date, due_date, review_period, review_year, review_quarter, created_at)
VALUES
  -- Engineering goals
  ('gol00000-0000-0000-000000000001', demo_user_id, 'rev00000-0000-0000-000000000001', 'Improve system reliability to 99.9%', 'Implement monitoring, alerting, and redundancy to achieve 99.9% uptime SLA.', 'performance', 'Sarah Chen', 'sarah.chen@freeflow.io', 'CEO', 100, 99.9, 99.9, 'critical', 25, 'completed', '2025-10-01', '2025-12-31', 'Q4 2025', 2025, 'Q4', NOW()),
  ('gol00000-0000-0000-000000000002', demo_user_id, 'rev00000-0000-0000-000000000001', 'Complete platform migration to Kubernetes', 'Migrate all services to Kubernetes for better scalability and deployment.', 'project', 'Sarah Chen', 'sarah.chen@freeflow.io', 'CEO', 100, 100, 100, 'high', 25, 'completed', '2025-10-01', '2025-12-31', 'Q4 2025', 2025, 'Q4', NOW()),
  ('gol00000-0000-0000-000000000003', demo_user_id, 'rev00000-0000-0000-000000000002', 'Reduce page load time by 40%', 'Optimize frontend performance to improve user experience.', 'performance', 'James Wilson', 'james.wilson@freeflow.io', 'Sarah Chen', 100, 95, 95, 'high', 30, 'on_track', '2025-10-01', '2025-12-31', 'Q4 2025', 2025, 'Q4', NOW()),
  ('gol00000-0000-0000-000000000004', demo_user_id, 'rev00000-0000-0000-000000000002', 'Mentor 2 junior developers', 'Provide regular 1:1 mentoring and code reviews for junior team members.', 'career', 'James Wilson', 'james.wilson@freeflow.io', 'Sarah Chen', 100, 100, 100, 'medium', 20, 'completed', '2025-10-01', '2025-12-31', 'Q4 2025', 2025, 'Q4', NOW()),

  -- Sales goals
  ('gol00000-0000-0000-000000000005', demo_user_id, 'rev00000-0000-0000-000000000003', 'Achieve $5M ARR milestone', 'Close deals to reach $5M in annual recurring revenue.', 'performance', 'Marcus Williams', 'marcus.williams@freeflow.io', 'CEO', 100, 115, 100, 'critical', 40, 'completed', '2025-10-01', '2025-12-31', 'Q4 2025', 2025, 'Q4', NOW()),
  ('gol00000-0000-0000-000000000006', demo_user_id, 'rev00000-0000-0000-000000000003', 'Expand into 3 new enterprise accounts', 'Land 3 new Fortune 500 customers.', 'performance', 'Marcus Williams', 'marcus.williams@freeflow.io', 'CEO', 100, 100, 100, 'high', 30, 'completed', '2025-10-01', '2025-12-31', 'Q4 2025', 2025, 'Q4', NOW()),
  ('gol00000-0000-0000-000000000007', demo_user_id, 'rev00000-0000-0000-000000000008', 'Hit $500K in closed revenue', 'Close individual deals totaling $500K or more.', 'performance', 'Brandon Clark', 'brandon.clark@freeflow.io', 'Marcus Williams', 100, 92, 92, 'high', 40, 'on_track', '2025-10-01', '2025-12-31', 'Q4 2025', 2025, 'Q4', NOW()),

  -- Marketing goals
  ('gol00000-0000-0000-000000000008', demo_user_id, 'rev00000-0000-0000-000000000004', 'Generate 1000 qualified leads', 'Execute campaigns to generate 1000 marketing qualified leads.', 'performance', 'Emily Rodriguez', 'emily.rodriguez@freeflow.io', 'CEO', 100, 110, 100, 'critical', 35, 'completed', '2025-10-01', '2025-12-31', 'Q4 2025', 2025, 'Q4', NOW()),
  ('gol00000-0000-0000-000000000009', demo_user_id, 'rev00000-0000-0000-000000000004', 'Launch new brand identity', 'Complete brand refresh including logo, website, and marketing materials.', 'project', 'Emily Rodriguez', 'emily.rodriguez@freeflow.io', 'CEO', 100, 100, 100, 'high', 25, 'completed', '2025-10-01', '2025-12-31', 'Q4 2025', 2025, 'Q4', NOW()),
  ('gol00000-0000-0000-000000000010', demo_user_id, 'rev00000-0000-0000-000000000009', 'Reduce CAC by 20%', 'Optimize paid channels to reduce customer acquisition cost.', 'performance', 'Ian Scott', 'ian.scott@freeflow.io', 'Emily Rodriguez', 100, 85, 85, 'high', 30, 'on_track', '2025-10-01', '2025-12-31', 'Q4 2025', 2025, 'Q4', NOW()),

  -- HR goals
  ('gol00000-0000-0000-000000000011', demo_user_id, 'rev00000-0000-0000-000000000005', 'Reduce employee turnover to under 10%', 'Implement retention programs and improve employee satisfaction.', 'performance', 'David Kim', 'david.kim@freeflow.io', 'CEO', 100, 100, 100, 'critical', 35, 'completed', '2025-10-01', '2025-12-31', 'Q4 2025', 2025, 'Q4', NOW()),
  ('gol00000-0000-0000-000000000012', demo_user_id, 'rev00000-0000-0000-000000000005', 'Launch employee development program', 'Create structured career development paths for all departments.', 'project', 'David Kim', 'david.kim@freeflow.io', 'CEO', 100, 100, 100, 'high', 25, 'completed', '2025-10-01', '2025-12-31', 'Q4 2025', 2025, 'Q4', NOW()),

  -- Finance goals
  ('gol00000-0000-0000-000000000013', demo_user_id, 'rev00000-0000-0000-000000000006', 'Close Series B funding', 'Successfully raise Series B round of $25M+.', 'project', 'Jennifer Liu', 'jennifer.liu@freeflow.io', 'CEO', 100, 100, 100, 'critical', 40, 'completed', '2025-10-01', '2025-12-31', 'Q4 2025', 2025, 'Q4', NOW()),
  ('gol00000-0000-0000-000000000014', demo_user_id, 'rev00000-0000-0000-000000000006', 'Implement automated financial reporting', 'Deploy real-time financial dashboards and automated reporting.', 'project', 'Jennifer Liu', 'jennifer.liu@freeflow.io', 'CEO', 100, 100, 100, 'high', 25, 'completed', '2025-10-01', '2025-12-31', 'Q4 2025', 2025, 'Q4', NOW()),
  ('gol00000-0000-0000-000000000015', demo_user_id, 'rev00000-0000-0000-000000000010', 'Build investor materials for Series B', 'Create comprehensive financial models and presentations.', 'project', 'Olivia Carter', 'olivia.carter@freeflow.io', 'Jennifer Liu', 100, 100, 100, 'high', 35, 'completed', '2025-10-01', '2025-12-31', 'Q4 2025', 2025, 'Q4', NOW())
ON CONFLICT (id) DO UPDATE SET
  current_value = EXCLUDED.current_value,
  progress_percentage = EXCLUDED.progress_percentage,
  status = EXCLUDED.status,
  updated_at = NOW();

-- ============================================================================
-- ONBOARDING PROGRAMS (for recent hires)
-- ============================================================================

INSERT INTO onboarding_programs (id, user_id, onboarding_code, employee_name, employee_email, role, department, employee_type, status, start_date, end_date, completion_rate, tasks_completed, total_tasks, days_remaining, buddy_name, buddy_email, manager_name, manager_email, welcome_email_sent, equipment_provided, access_granted, created_at)
VALUES
  ('onb00000-0000-0000-000000000001', demo_user_id, 'ONB1001', 'Ryan O''Connor', 'ryan.oconnor@freeflow.io', 'Junior Software Engineer', 'Engineering', 'full-time', 'completed', '2024-06-01', '2024-07-01', 100, 10, 10, 0, 'James Wilson', 'james.wilson@freeflow.io', 'Sarah Chen', 'sarah.chen@freeflow.io', true, true, true, '2024-05-25'),
  ('onb00000-0000-0000-000000000002', demo_user_id, 'ONB1002', 'Chris Lee', 'chris.lee@freeflow.io', 'Engineering Intern', 'Engineering', 'intern', 'in-progress', '2025-09-01', '2025-10-01', 75, 7, 10, 5, 'Alex Rivera', 'alex.rivera@freeflow.io', 'Sarah Chen', 'sarah.chen@freeflow.io', true, true, true, '2025-08-25'),
  ('onb00000-0000-0000-000000000003', demo_user_id, 'ONB1003', 'Derek White', 'derek.white@freeflow.io', 'Sales Development Rep', 'Sales', 'full-time', 'completed', '2024-03-01', '2024-04-01', 100, 10, 10, 0, 'Ashley Taylor', 'ashley.taylor@freeflow.io', 'Marcus Williams', 'marcus.williams@freeflow.io', true, true, true, '2024-02-22'),
  ('onb00000-0000-0000-000000000004', demo_user_id, 'ONB1004', 'Elena Garcia', 'elena.garcia@freeflow.io', 'Sales Development Rep', 'Sales', 'full-time', 'completed', '2024-05-15', '2024-06-15', 100, 10, 10, 0, 'Brandon Clark', 'brandon.clark@freeflow.io', 'Marcus Williams', 'marcus.williams@freeflow.io', true, true, true, '2024-05-08'),
  ('onb00000-0000-0000-000000000005', demo_user_id, 'ONB1005', 'Kyle Turner', 'kyle.turner@freeflow.io', 'Marketing Coordinator', 'Marketing', 'full-time', 'in-progress', '2024-08-01', '2024-09-01', 85, 8, 10, 3, 'Ian Scott', 'ian.scott@freeflow.io', 'Emily Rodriguez', 'emily.rodriguez@freeflow.io', true, true, true, '2024-07-25'),
  ('onb00000-0000-0000-000000000006', demo_user_id, 'ONB1006', 'Maria Gonzalez', 'maria.gonzalez@freeflow.io', 'HR Coordinator', 'HR', 'full-time', 'completed', '2024-02-15', '2024-03-15', 100, 10, 10, 0, 'Laura Nelson', 'laura.nelson@freeflow.io', 'David Kim', 'david.kim@freeflow.io', true, true, true, '2024-02-08'),
  ('onb00000-0000-0000-000000000007', demo_user_id, 'ONB1007', 'Peter Wright', 'peter.wright@freeflow.io', 'Accounts Payable Specialist', 'Finance', 'full-time', 'completed', '2024-04-01', '2024-05-01', 100, 10, 10, 0, 'Nathan Hill', 'nathan.hill@freeflow.io', 'Jennifer Liu', 'jennifer.liu@freeflow.io', true, true, true, '2024-03-25'),
  ('onb00000-0000-0000-000000000008', demo_user_id, 'ONB1008', 'Tina Roberts', 'tina.roberts@freeflow.io', 'Office Administrator', 'Operations', 'full-time', 'completed', '2024-01-15', '2024-02-15', 100, 10, 10, 0, 'Steven Young', 'steven.young@freeflow.io', 'Michael Thompson', 'michael.thompson@freeflow.io', true, true, true, '2024-01-08')
ON CONFLICT (id) DO UPDATE SET
  completion_rate = EXCLUDED.completion_rate,
  status = EXCLUDED.status,
  updated_at = NOW();

-- ============================================================================
-- ONBOARDING TASKS
-- ============================================================================

INSERT INTO onboarding_tasks (id, user_id, program_id, task_code, task_name, description, category, status, priority, due_date, completed_date, assigned_to, order_index, is_required, created_at)
VALUES
  -- Chris Lee's onboarding tasks (in progress)
  ('obt00000-0000-0000-000000000001', demo_user_id, 'onb00000-0000-0000-000000000002', 'OBT1001', 'Complete HR paperwork', 'Fill out all required HR forms and documents', 'HR', 'completed', 'high', '2025-09-03', '2025-09-02', 'HR Team', 0, true, '2025-08-25'),
  ('obt00000-0000-0000-000000000002', demo_user_id, 'onb00000-0000-0000-000000000002', 'OBT1002', 'Set up workstation', 'Configure laptop, development environment, and tools', 'IT', 'completed', 'high', '2025-09-05', '2025-09-04', 'IT Team', 1, true, '2025-08-25'),
  ('obt00000-0000-0000-000000000003', demo_user_id, 'onb00000-0000-0000-000000000002', 'OBT1003', 'Complete security training', 'Complete mandatory security awareness training', 'Security', 'completed', 'high', '2025-09-08', '2025-09-07', 'Security Team', 2, true, '2025-08-25'),
  ('obt00000-0000-0000-000000000004', demo_user_id, 'onb00000-0000-0000-000000000002', 'OBT1004', 'Meet with manager', 'Initial 1:1 meeting with Sarah Chen', 'Orientation', 'completed', 'high', '2025-09-10', '2025-09-09', 'Sarah Chen', 3, true, '2025-08-25'),
  ('obt00000-0000-0000-000000000005', demo_user_id, 'onb00000-0000-0000-000000000002', 'OBT1005', 'Review company handbook', 'Read through employee handbook and policies', 'HR', 'completed', 'medium', '2025-09-12', '2025-09-11', 'HR Team', 4, true, '2025-08-25'),
  ('obt00000-0000-0000-000000000006', demo_user_id, 'onb00000-0000-0000-000000000002', 'OBT1006', 'Set up email and accounts', 'Configure email, Slack, and other collaboration tools', 'IT', 'completed', 'high', '2025-09-15', '2025-09-14', 'IT Team', 5, true, '2025-08-25'),
  ('obt00000-0000-0000-000000000007', demo_user_id, 'onb00000-0000-0000-000000000002', 'OBT1007', 'Complete department training', 'Engineering onboarding bootcamp', 'Training', 'completed', 'medium', '2025-09-18', '2025-09-17', 'Engineering Team', 6, true, '2025-08-25'),
  ('obt00000-0000-0000-000000000008', demo_user_id, 'onb00000-0000-0000-000000000002', 'OBT1008', 'Meet team members', 'Introduction meetings with all team members', 'Orientation', 'in-progress', 'medium', '2025-09-22', NULL, 'Alex Rivera', 7, false, '2025-08-25'),
  ('obt00000-0000-0000-000000000009', demo_user_id, 'onb00000-0000-0000-000000000002', 'OBT1009', 'Set initial goals', 'Define internship learning objectives', 'Performance', 'pending', 'medium', '2025-09-25', NULL, 'Sarah Chen', 8, true, '2025-08-25'),
  ('obt00000-0000-0000-000000000010', demo_user_id, 'onb00000-0000-0000-000000000002', 'OBT1010', '30-day review meeting', 'First month check-in with manager', 'Performance', 'pending', 'high', '2025-10-01', NULL, 'Sarah Chen', 9, true, '2025-08-25')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  completed_date = EXCLUDED.completed_date,
  updated_at = NOW();

-- ============================================================================
-- PAYROLL RUNS (last 6 months)
-- ============================================================================

INSERT INTO payroll_runs (id, user_id, run_code, period, pay_date, status, total_employees, total_amount, processed_count, pending_count, failed_count, approved_by, approved_date, currency, notes, created_at)
VALUES
  ('prl00000-0000-0000-000000000001', demo_user_id, 'PAY202601', 'January 2026', '2026-01-15', 'pending', 36, 425833.33, 0, 36, 0, NULL, NULL, 'USD', 'Pending approval', '2026-01-05'),
  ('prl00000-0000-0000-000000000002', demo_user_id, 'PAY202512', 'December 2025', '2025-12-15', 'completed', 36, 425833.33, 36, 0, 0, 'Jennifer Liu', '2025-12-12', 'USD', 'Processed successfully', '2025-12-05'),
  ('prl00000-0000-0000-000000000003', demo_user_id, 'PAY202511', 'November 2025', '2025-11-15', 'completed', 36, 425833.33, 36, 0, 0, 'Jennifer Liu', '2025-11-12', 'USD', 'Processed successfully', '2025-11-05'),
  ('prl00000-0000-0000-000000000004', demo_user_id, 'PAY202510', 'October 2025', '2025-10-15', 'completed', 36, 425833.33, 36, 0, 0, 'Jennifer Liu', '2025-10-12', 'USD', 'Processed successfully', '2025-10-05'),
  ('prl00000-0000-0000-000000000005', demo_user_id, 'PAY202509', 'September 2025', '2025-09-15', 'completed', 35, 418250.00, 35, 0, 0, 'Jennifer Liu', '2025-09-12', 'USD', 'Processed successfully', '2025-09-05'),
  ('prl00000-0000-0000-000000000006', demo_user_id, 'PAY202508', 'August 2025', '2025-08-15', 'completed', 35, 418250.00, 35, 0, 0, 'Jennifer Liu', '2025-08-12', 'USD', 'Processed successfully', '2025-08-05')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  processed_count = EXCLUDED.processed_count,
  updated_at = NOW();

-- ============================================================================
-- EMPLOYEE PAYROLL (sample records for key employees - December 2025)
-- ============================================================================

INSERT INTO employee_payroll (id, user_id, run_id, employee_code, employee_name, department, role, status, base_salary, bonuses, deductions, taxes, net_pay, payment_method, tax_rate, bank_account, payment_status, payment_date, created_at)
VALUES
  -- December 2025 payroll for key employees
  ('epl00000-0000-0000-000000000001', demo_user_id, 'prl00000-0000-0000-000000000002', 'EMP1001', 'Sarah Chen', 'Engineering', 'VP of Engineering', 'active', 20416.67, 2500.00, 1633.33, 5104.17, 16179.17, 'direct-deposit', 25.00, '****1234', 'completed', '2025-12-15', '2025-12-05'),
  ('epl00000-0000-0000-000000000002', demo_user_id, 'prl00000-0000-0000-000000000002', 'EMP1002', 'James Wilson', 'Engineering', 'Senior Software Engineer', 'active', 14583.33, 0.00, 1166.67, 3645.83, 9770.83, 'direct-deposit', 25.00, '****2345', 'completed', '2025-12-15', '2025-12-05'),
  ('epl00000-0000-0000-000000000003', demo_user_id, 'prl00000-0000-0000-000000000002', 'EMP1003', 'Priya Sharma', 'Engineering', 'Senior Software Engineer', 'active', 14166.67, 0.00, 1133.33, 3541.67, 9491.67, 'direct-deposit', 25.00, '****3456', 'completed', '2025-12-15', '2025-12-05'),
  ('epl00000-0000-0000-000000000004', demo_user_id, 'prl00000-0000-0000-000000000002', 'EMP1013', 'Marcus Williams', 'Sales', 'VP of Sales', 'active', 18750.00, 5000.00, 1500.00, 4687.50, 17562.50, 'direct-deposit', 25.00, '****4567', 'completed', '2025-12-15', '2025-12-05'),
  ('epl00000-0000-0000-000000000005', demo_user_id, 'prl00000-0000-0000-000000000002', 'EMP1021', 'Emily Rodriguez', 'Marketing', 'VP of Marketing', 'active', 17916.67, 1500.00, 1433.33, 4479.17, 13504.17, 'direct-deposit', 25.00, '****5678', 'completed', '2025-12-15', '2025-12-05'),
  ('epl00000-0000-0000-000000000006', demo_user_id, 'prl00000-0000-0000-000000000002', 'EMP1026', 'David Kim', 'HR', 'VP of HR', 'active', 16250.00, 0.00, 1300.00, 4062.50, 10887.50, 'direct-deposit', 25.00, '****6789', 'completed', '2025-12-15', '2025-12-05'),
  ('epl00000-0000-0000-000000000007', demo_user_id, 'prl00000-0000-0000-000000000002', 'EMP1029', 'Jennifer Liu', 'Finance', 'CFO', 'active', 22916.67, 3000.00, 1833.33, 5729.17, 18354.17, 'direct-deposit', 25.00, '****7890', 'completed', '2025-12-15', '2025-12-05'),
  ('epl00000-0000-0000-000000000008', demo_user_id, 'prl00000-0000-0000-000000000002', 'EMP1033', 'Michael Thompson', 'Operations', 'VP of Operations', 'active', 17083.33, 0.00, 1366.67, 4270.83, 11445.83, 'direct-deposit', 25.00, '****8901', 'completed', '2025-12-15', '2025-12-05'),

  -- January 2026 payroll (pending)
  ('epl00000-0000-0000-000000000009', demo_user_id, 'prl00000-0000-0000-000000000001', 'EMP1001', 'Sarah Chen', 'Engineering', 'VP of Engineering', 'active', 20416.67, 0.00, 1633.33, 5104.17, 13679.17, 'direct-deposit', 25.00, '****1234', 'pending', NULL, '2026-01-05'),
  ('epl00000-0000-0000-000000000010', demo_user_id, 'prl00000-0000-0000-000000000001', 'EMP1002', 'James Wilson', 'Engineering', 'Senior Software Engineer', 'active', 14583.33, 0.00, 1166.67, 3645.83, 9770.83, 'direct-deposit', 25.00, '****2345', 'pending', NULL, '2026-01-05'),
  ('epl00000-0000-0000-000000000011', demo_user_id, 'prl00000-0000-0000-000000000001', 'EMP1013', 'Marcus Williams', 'Sales', 'VP of Sales', 'active', 18750.00, 0.00, 1500.00, 4687.50, 12562.50, 'direct-deposit', 25.00, '****4567', 'pending', NULL, '2026-01-05'),
  ('epl00000-0000-0000-000000000012', demo_user_id, 'prl00000-0000-0000-000000000001', 'EMP1029', 'Jennifer Liu', 'Finance', 'CFO', 'active', 22916.67, 0.00, 1833.33, 5729.17, 15354.17, 'direct-deposit', 25.00, '****7890', 'pending', NULL, '2026-01-05')
ON CONFLICT (id) DO UPDATE SET
  payment_status = EXCLUDED.payment_status,
  updated_at = NOW();

-- ============================================================================
-- TRAINING PROGRAMS
-- ============================================================================

INSERT INTO training_programs (id, user_id, program_code, program_name, description, program_type, status, trainer_name, trainer_email, max_capacity, enrolled_count, duration_days, session_count, start_date, end_date, completion_rate, avg_score, location, format, objectives, created_at)
VALUES
  ('trn00000-0000-0000-000000000001', demo_user_id, 'TRN1001', 'Security Awareness Training', 'Comprehensive security awareness training covering phishing, password security, and data protection.', 'compliance', 'completed', 'External Vendor', 'training@securitypro.com', 50, 36, 1, 1, '2025-11-01', '2025-11-01', 100, 92.5, 'Virtual/Zoom', 'virtual', 'Ensure all employees understand security best practices.', '2025-10-15'),
  ('trn00000-0000-0000-000000000002', demo_user_id, 'TRN1002', 'Leadership Development Program', 'Advanced leadership training for managers and senior staff covering coaching, communication, and strategy.', 'leadership', 'in-progress', 'Dr. Sarah Mitchell', 'sarah.mitchell@leadershipacademy.com', 20, 12, 5, 5, '2025-12-01', '2025-12-05', 60, 88.5, 'Conference Room A', 'in-person', 'Develop next generation of company leaders.', '2025-11-15'),
  ('trn00000-0000-0000-000000000003', demo_user_id, 'TRN1003', 'Advanced React & TypeScript', 'Deep dive into React patterns, TypeScript best practices, and performance optimization.', 'technical', 'completed', 'Alex Chen', 'alex.chen@techtraining.io', 15, 10, 3, 3, '2025-10-15', '2025-10-17', 100, 91.2, 'Training Center', 'hybrid', 'Elevate engineering team React expertise.', '2025-10-01'),
  ('trn00000-0000-0000-000000000004', demo_user_id, 'TRN1004', 'Sales Excellence Workshop', 'Intensive sales training covering enterprise selling, negotiation, and account management.', 'skills', 'completed', 'John Henderson', 'john.henderson@salestraining.com', 15, 8, 2, 2, '2025-11-10', '2025-11-11', 100, 89.8, 'Conference Room B', 'in-person', 'Improve sales team close rates.', '2025-10-25'),
  ('trn00000-0000-0000-000000000005', demo_user_id, 'TRN1005', 'Project Management Fundamentals', 'Introduction to project management methodologies, tools, and best practices.', 'skills', 'completed', 'Maria Santos', 'maria.santos@pmtraining.com', 25, 18, 2, 2, '2025-09-20', '2025-09-21', 100, 87.5, 'Virtual/Zoom', 'virtual', 'Standardize project management practices across teams.', '2025-09-05'),
  ('trn00000-0000-0000-000000000006', demo_user_id, 'TRN1006', 'Diversity & Inclusion Training', 'Mandatory D&I training covering unconscious bias, inclusive communication, and workplace equity.', 'compliance', 'completed', 'External Vendor', 'training@diversitymatters.org', 50, 36, 1, 1, '2025-10-01', '2025-10-01', 100, 90.2, 'Virtual/Zoom', 'virtual', 'Foster inclusive workplace culture.', '2025-09-15'),
  ('trn00000-0000-0000-000000000007', demo_user_id, 'TRN1007', 'AWS Certification Prep', 'Preparation course for AWS Solutions Architect certification exam.', 'certification', 'in-progress', 'Tech Expert', 'aws@cloudcertprep.com', 10, 8, 10, 10, '2025-12-10', '2025-12-20', 40, 85.0, 'Virtual/Zoom', 'virtual', 'Enable team AWS certifications.', '2025-11-25'),
  ('trn00000-0000-0000-000000000008', demo_user_id, 'TRN1008', 'Customer Success Strategies', 'Training on customer retention, upselling, and building long-term client relationships.', 'skills', 'scheduled', 'Grace Miller', 'grace.miller@freeflow.io', 20, 12, 2, 2, '2026-01-15', '2026-01-16', 0, 0, 'Conference Room A', 'in-person', 'Improve customer retention rates.', '2025-12-20'),
  ('trn00000-0000-0000-000000000009', demo_user_id, 'TRN1009', 'Data Analytics with Python', 'Hands-on training in Python for data analysis, visualization, and machine learning basics.', 'technical', 'scheduled', 'Aisha Johnson', 'aisha.johnson@freeflow.io', 12, 9, 4, 4, '2026-01-20', '2026-01-23', 0, 0, 'Training Center', 'hybrid', 'Build data analytics capabilities.', '2025-12-28'),
  ('trn00000-0000-0000-000000000010', demo_user_id, 'TRN1010', 'Effective Communication Workshop', 'Training on presentation skills, written communication, and stakeholder management.', 'soft-skills', 'scheduled', 'External Vendor', 'training@commskills.com', 30, 22, 1, 1, '2026-02-01', '2026-02-01', 0, 0, 'Virtual/Zoom', 'virtual', 'Enhance communication across all levels.', '2026-01-15')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  completion_rate = EXCLUDED.completion_rate,
  updated_at = NOW();

-- ============================================================================
-- TRAINING ENROLLMENTS
-- ============================================================================

INSERT INTO training_enrollments (id, user_id, program_id, trainee_name, trainee_email, enrollment_status, enrolled_at, started_at, completed_at, progress_percent, score, certificate_issued, certificate_url, created_at)
VALUES
  -- Security Awareness Training enrollments (completed)
  ('enr00000-0000-0000-000000000001', demo_user_id, 'trn00000-0000-0000-000000000001', 'Sarah Chen', 'sarah.chen@freeflow.io', 'completed', '2025-10-20', '2025-11-01', '2025-11-01', 100, 95.0, true, '/certificates/EMP1001-TRN1001.pdf', '2025-10-15'),
  ('enr00000-0000-0000-000000000002', demo_user_id, 'trn00000-0000-0000-000000000001', 'James Wilson', 'james.wilson@freeflow.io', 'completed', '2025-10-20', '2025-11-01', '2025-11-01', 100, 92.0, true, '/certificates/EMP1002-TRN1001.pdf', '2025-10-15'),
  ('enr00000-0000-0000-000000000003', demo_user_id, 'trn00000-0000-0000-000000000001', 'Marcus Williams', 'marcus.williams@freeflow.io', 'completed', '2025-10-20', '2025-11-01', '2025-11-01', 100, 90.0, true, '/certificates/EMP1013-TRN1001.pdf', '2025-10-15'),

  -- Leadership Development enrollments (in progress)
  ('enr00000-0000-0000-000000000004', demo_user_id, 'trn00000-0000-0000-000000000002', 'Sarah Chen', 'sarah.chen@freeflow.io', 'enrolled', '2025-11-20', '2025-12-01', NULL, 60, NULL, false, NULL, '2025-11-15'),
  ('enr00000-0000-0000-000000000005', demo_user_id, 'trn00000-0000-0000-000000000002', 'Marcus Williams', 'marcus.williams@freeflow.io', 'enrolled', '2025-11-20', '2025-12-01', NULL, 60, NULL, false, NULL, '2025-11-15'),
  ('enr00000-0000-0000-000000000006', demo_user_id, 'trn00000-0000-0000-000000000002', 'Emily Rodriguez', 'emily.rodriguez@freeflow.io', 'enrolled', '2025-11-20', '2025-12-01', NULL, 60, NULL, false, NULL, '2025-11-15'),
  ('enr00000-0000-0000-000000000007', demo_user_id, 'trn00000-0000-0000-000000000002', 'David Kim', 'david.kim@freeflow.io', 'enrolled', '2025-11-20', '2025-12-01', NULL, 60, NULL, false, NULL, '2025-11-15'),
  ('enr00000-0000-0000-000000000008', demo_user_id, 'trn00000-0000-0000-000000000002', 'Jennifer Liu', 'jennifer.liu@freeflow.io', 'enrolled', '2025-11-20', '2025-12-01', NULL, 60, NULL, false, NULL, '2025-11-15'),
  ('enr00000-0000-0000-000000000009', demo_user_id, 'trn00000-0000-0000-000000000002', 'Michael Thompson', 'michael.thompson@freeflow.io', 'enrolled', '2025-11-20', '2025-12-01', NULL, 60, NULL, false, NULL, '2025-11-15'),

  -- Advanced React & TypeScript enrollments (completed)
  ('enr00000-0000-0000-000000000010', demo_user_id, 'trn00000-0000-0000-000000000003', 'James Wilson', 'james.wilson@freeflow.io', 'completed', '2025-10-05', '2025-10-15', '2025-10-17', 100, 94.5, true, '/certificates/EMP1002-TRN1003.pdf', '2025-10-01'),
  ('enr00000-0000-0000-000000000011', demo_user_id, 'trn00000-0000-0000-000000000003', 'Priya Sharma', 'priya.sharma@freeflow.io', 'completed', '2025-10-05', '2025-10-15', '2025-10-17', 100, 96.0, true, '/certificates/EMP1003-TRN1003.pdf', '2025-10-01'),
  ('enr00000-0000-0000-000000000012', demo_user_id, 'trn00000-0000-0000-000000000003', 'Sophia Martinez', 'sophia.martinez@freeflow.io', 'completed', '2025-10-05', '2025-10-15', '2025-10-17', 100, 92.0, true, '/certificates/EMP1009-TRN1003.pdf', '2025-10-01'),

  -- Sales Excellence Workshop enrollments (completed)
  ('enr00000-0000-0000-000000000013', demo_user_id, 'trn00000-0000-0000-000000000004', 'Marcus Williams', 'marcus.williams@freeflow.io', 'completed', '2025-10-30', '2025-11-10', '2025-11-11', 100, 92.0, true, '/certificates/EMP1013-TRN1004.pdf', '2025-10-25'),
  ('enr00000-0000-0000-000000000014', demo_user_id, 'trn00000-0000-0000-000000000004', 'Ashley Taylor', 'ashley.taylor@freeflow.io', 'completed', '2025-10-30', '2025-11-10', '2025-11-11', 100, 90.5, true, '/certificates/EMP1014-TRN1004.pdf', '2025-10-25'),
  ('enr00000-0000-0000-000000000015', demo_user_id, 'trn00000-0000-0000-000000000004', 'Brandon Clark', 'brandon.clark@freeflow.io', 'completed', '2025-10-30', '2025-11-10', '2025-11-11', 100, 88.0, true, '/certificates/EMP1015-TRN1004.pdf', '2025-10-25')
ON CONFLICT (id) DO UPDATE SET
  enrollment_status = EXCLUDED.enrollment_status,
  progress_percent = EXCLUDED.progress_percent,
  updated_at = NOW();

-- ============================================================================
-- EMPLOYEE DOCUMENTS
-- ============================================================================

INSERT INTO documents (id, user_id, document_title, document_type, status, access_level, is_encrypted, owner, department, created_by, last_modified_by, file_path, file_url, file_name, file_extension, file_size_bytes, mime_type, version, version_number, is_latest_version, approved_by, approved_at, view_count, download_count, tags, categories, folder_path, description, created_at, updated_at)
VALUES
  -- Sample employment contracts
  ('doc00000-0000-0000-000000000001', demo_user_id, 'Sarah Chen - Employment Contract', 'contract', 'approved', 'confidential', true, 'Sarah Chen', 'Engineering', 'HR System', 'HR Team', '/hr-documents/EMP1001/contract-1.pdf', '/api/documents/EMP1001/contract-1.pdf', 'Sarah_Chen_Employment_Contract.pdf', 'pdf', 245000, 'application/pdf', '1.0', 1, true, 'David Kim', '2022-03-10', 5, 2, ARRAY['hr', 'contract', 'engineering'], ARRAY['HR Documents', 'Engineering'], '/HR/Engineering/EMP1001', 'Employment Contract for Sarah Chen', '2022-03-08', NOW()),
  ('doc00000-0000-0000-000000000002', demo_user_id, 'Marcus Williams - Employment Contract', 'contract', 'approved', 'confidential', true, 'Marcus Williams', 'Sales', 'HR System', 'HR Team', '/hr-documents/EMP1013/contract-1.pdf', '/api/documents/EMP1013/contract-1.pdf', 'Marcus_Williams_Employment_Contract.pdf', 'pdf', 248000, 'application/pdf', '1.0', 1, true, 'David Kim', '2022-01-28', 4, 1, ARRAY['hr', 'contract', 'sales'], ARRAY['HR Documents', 'Sales'], '/HR/Sales/EMP1013', 'Employment Contract for Marcus Williams', '2022-01-25', NOW()),
  ('doc00000-0000-0000-000000000003', demo_user_id, 'Jennifer Liu - Employment Contract', 'contract', 'approved', 'confidential', true, 'Jennifer Liu', 'Finance', 'HR System', 'HR Team', '/hr-documents/EMP1029/contract-1.pdf', '/api/documents/EMP1029/contract-1.pdf', 'Jennifer_Liu_Employment_Contract.pdf', 'pdf', 252000, 'application/pdf', '1.0', 1, true, 'CEO', '2021-10-28', 6, 2, ARRAY['hr', 'contract', 'finance', 'c-level'], ARRAY['HR Documents', 'Finance'], '/HR/Finance/EMP1029', 'Employment Contract for Jennifer Liu', '2021-10-25', NOW()),

  -- NDA Agreements
  ('doc00000-0000-0000-000000000004', demo_user_id, 'Sarah Chen - NDA Agreement', 'other', 'approved', 'restricted', true, 'Sarah Chen', 'Engineering', 'Legal Team', 'Legal Team', '/hr-documents/EMP1001/nda-1.pdf', '/api/documents/EMP1001/nda-1.pdf', 'Sarah_Chen_NDA_Agreement.pdf', 'pdf', 85000, 'application/pdf', '1.0', 1, true, 'Legal Team', '2022-03-10', 2, 1, ARRAY['hr', 'nda', 'legal'], ARRAY['HR Documents', 'Legal'], '/HR/Engineering/EMP1001', 'NDA Agreement for Sarah Chen', '2022-03-08', NOW()),
  ('doc00000-0000-0000-000000000005', demo_user_id, 'James Wilson - NDA Agreement', 'other', 'approved', 'restricted', true, 'James Wilson', 'Engineering', 'Legal Team', 'Legal Team', '/hr-documents/EMP1002/nda-1.pdf', '/api/documents/EMP1002/nda-1.pdf', 'James_Wilson_NDA_Agreement.pdf', 'pdf', 84500, 'application/pdf', '1.0', 1, true, 'Legal Team', '2022-05-28', 2, 1, ARRAY['hr', 'nda', 'legal'], ARRAY['HR Documents', 'Legal'], '/HR/Engineering/EMP1002', 'NDA Agreement for James Wilson', '2022-05-25', NOW()),

  -- Government ID copies (restricted)
  ('doc00000-0000-0000-000000000006', demo_user_id, 'Sarah Chen - Government ID', 'other', 'approved', 'restricted', true, 'Sarah Chen', 'Engineering', 'HR System', 'HR Team', '/hr-documents/EMP1001/id-1.pdf', '/api/documents/EMP1001/id-1.pdf', 'Sarah_Chen_Government_ID.pdf', 'pdf', 125000, 'application/pdf', '1.0', 1, true, 'David Kim', '2022-03-10', 1, 0, ARRAY['hr', 'id-document', 'restricted'], ARRAY['HR Documents', 'Identity'], '/HR/Engineering/EMP1001', 'Government ID Copy for Sarah Chen', '2022-03-08', NOW()),
  ('doc00000-0000-0000-000000000007', demo_user_id, 'Marcus Williams - Government ID', 'other', 'approved', 'restricted', true, 'Marcus Williams', 'Sales', 'HR System', 'HR Team', '/hr-documents/EMP1013/id-1.pdf', '/api/documents/EMP1013/id-1.pdf', 'Marcus_Williams_Government_ID.pdf', 'pdf', 128000, 'application/pdf', '1.0', 1, true, 'David Kim', '2022-01-28', 1, 0, ARRAY['hr', 'id-document', 'restricted'], ARRAY['HR Documents', 'Identity'], '/HR/Sales/EMP1013', 'Government ID Copy for Marcus Williams', '2022-01-25', NOW()),

  -- Tax forms
  ('doc00000-0000-0000-000000000008', demo_user_id, 'Sarah Chen - W-4 Tax Form', 'other', 'approved', 'confidential', true, 'Sarah Chen', 'Engineering', 'HR System', 'HR Team', '/hr-documents/EMP1001/w4-2025.pdf', '/api/documents/EMP1001/w4-2025.pdf', 'Sarah_Chen_W4_2025.pdf', 'pdf', 52000, 'application/pdf', '1.0', 1, true, 'HR Team', '2025-01-15', 2, 1, ARRAY['hr', 'tax', 'w4'], ARRAY['HR Documents', 'Tax Forms'], '/HR/Engineering/EMP1001', 'W-4 Tax Form for Sarah Chen - 2025', '2025-01-10', NOW()),
  ('doc00000-0000-0000-000000000009', demo_user_id, 'James Wilson - W-4 Tax Form', 'other', 'approved', 'confidential', true, 'James Wilson', 'Engineering', 'HR System', 'HR Team', '/hr-documents/EMP1002/w4-2025.pdf', '/api/documents/EMP1002/w4-2025.pdf', 'James_Wilson_W4_2025.pdf', 'pdf', 51500, 'application/pdf', '1.0', 1, true, 'HR Team', '2025-01-15', 2, 1, ARRAY['hr', 'tax', 'w4'], ARRAY['HR Documents', 'Tax Forms'], '/HR/Engineering/EMP1002', 'W-4 Tax Form for James Wilson - 2025', '2025-01-10', NOW()),

  -- Benefits enrollment
  ('doc00000-0000-0000-000000000010', demo_user_id, 'Sarah Chen - Benefits Enrollment 2025', 'other', 'approved', 'confidential', true, 'Sarah Chen', 'Engineering', 'HR System', 'HR Team', '/hr-documents/EMP1001/benefits-2025.pdf', '/api/documents/EMP1001/benefits-2025.pdf', 'Sarah_Chen_Benefits_2025.pdf', 'pdf', 95000, 'application/pdf', '1.0', 1, true, 'HR Team', '2024-11-30', 3, 1, ARRAY['hr', 'benefits', 'enrollment'], ARRAY['HR Documents', 'Benefits'], '/HR/Engineering/EMP1001', 'Benefits Enrollment for Sarah Chen - 2025', '2024-11-15', NOW()),

  -- Policy acknowledgments
  ('doc00000-0000-0000-000000000011', demo_user_id, 'Sarah Chen - Policy Acknowledgment', 'policy', 'approved', 'internal', false, 'Sarah Chen', 'Engineering', 'HR System', 'HR Team', '/hr-documents/EMP1001/policy-ack.pdf', '/api/documents/EMP1001/policy-ack.pdf', 'Sarah_Chen_Policy_Acknowledgment.pdf', 'pdf', 35000, 'application/pdf', '1.0', 1, true, 'HR Team', '2022-03-10', 1, 0, ARRAY['hr', 'policy', 'acknowledgment'], ARRAY['HR Documents', 'Policies'], '/HR/Engineering/EMP1001', 'Signed policy acknowledgment for Sarah Chen', '2022-03-08', NOW()),
  ('doc00000-0000-0000-000000000012', demo_user_id, 'James Wilson - Policy Acknowledgment', 'policy', 'approved', 'internal', false, 'James Wilson', 'Engineering', 'HR System', 'HR Team', '/hr-documents/EMP1002/policy-ack.pdf', '/api/documents/EMP1002/policy-ack.pdf', 'James_Wilson_Policy_Acknowledgment.pdf', 'pdf', 35500, 'application/pdf', '1.0', 1, true, 'HR Team', '2022-05-28', 1, 0, ARRAY['hr', 'policy', 'acknowledgment'], ARRAY['HR Documents', 'Policies'], '/HR/Engineering/EMP1002', 'Signed policy acknowledgment for James Wilson', '2022-05-25', NOW()),

  -- Certifications
  ('doc00000-0000-0000-000000000013', demo_user_id, 'Sarah Chen - AWS Solutions Architect Certificate', 'other', 'approved', 'internal', false, 'Sarah Chen', 'Engineering', 'Sarah Chen', 'HR Team', '/hr-documents/EMP1001/cert-aws.pdf', '/api/documents/EMP1001/cert-aws.pdf', 'Sarah_Chen_AWS_Certificate.pdf', 'pdf', 150000, 'application/pdf', '1.0', 1, true, 'HR Team', '2023-06-15', 8, 3, ARRAY['certification', 'aws', 'engineering'], ARRAY['HR Documents', 'Certifications'], '/HR/Engineering/EMP1001', 'AWS Solutions Architect Certificate for Sarah Chen', '2023-06-10', NOW()),
  ('doc00000-0000-0000-000000000014', demo_user_id, 'Emma Davis - AWS DevOps Engineer Certificate', 'other', 'approved', 'internal', false, 'Emma Davis', 'Engineering', 'Emma Davis', 'HR Team', '/hr-documents/EMP1007/cert-aws-devops.pdf', '/api/documents/EMP1007/cert-aws-devops.pdf', 'Emma_Davis_AWS_DevOps_Certificate.pdf', 'pdf', 148000, 'application/pdf', '1.0', 1, true, 'HR Team', '2024-03-20', 6, 2, ARRAY['certification', 'aws', 'devops', 'engineering'], ARRAY['HR Documents', 'Certifications'], '/HR/Engineering/EMP1007', 'AWS DevOps Engineer Certificate for Emma Davis', '2024-03-15', NOW()),
  ('doc00000-0000-0000-000000000015', demo_user_id, 'David Kim - SHRM-SCP Certificate', 'other', 'approved', 'internal', false, 'David Kim', 'HR', 'David Kim', 'HR Team', '/hr-documents/EMP1026/cert-shrm.pdf', '/api/documents/EMP1026/cert-shrm.pdf', 'David_Kim_SHRM_Certificate.pdf', 'pdf', 145000, 'application/pdf', '1.0', 1, true, 'CEO', '2021-08-10', 5, 2, ARRAY['certification', 'shrm', 'hr'], ARRAY['HR Documents', 'Certifications'], '/HR/HR/EMP1026', 'SHRM-SCP Certificate for David Kim', '2021-08-05', NOW())
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = NOW();

END $$;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- This migration creates:
-- - 36 employees across 6 departments
-- - 10 performance reviews with high scores (thriving company)
-- - 15 performance goals (mostly achieved)
-- - 8 onboarding programs (mostly completed)
-- - 10 onboarding tasks
-- - 6 payroll runs (last 6 months)
-- - 10 training programs with 15 enrollments
-- - 15 employee documents (contracts, IDs, certificates)
--
-- The data portrays a thriving company with:
-- - High retention (most employees hired 1-3 years ago)
-- - Strong performance ratings (85-97%)
-- - Organized HR processes
-- - Active training and development
-- - Comprehensive documentation
-- ============================================================================
