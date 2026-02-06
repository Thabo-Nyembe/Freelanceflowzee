/**
 * Enterprise HR Demo Data Seeder for KAZI Platform
 *
 * Creates comprehensive HR demo data including:
 * - 25+ employees with full profiles
 * - Departments (Engineering, Sales, Marketing, HR, Finance, Operations)
 * - Performance reviews with goals and feedback
 * - Time off/PTO requests and balances
 * - Onboarding programs and tasks
 * - Payroll runs and employee payroll records
 * - Training programs and enrollments
 * - Employee documents (contracts, IDs, certificates)
 *
 * Usage: npx tsx scripts/seed-enterprise-hr-demo.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Demo user ID for alex@freeflow.io
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function generateUUID(prefix: string, index: number): string {
  const paddedIndex = String(index).padStart(12, '0')
  return `${prefix}-${paddedIndex}`
}

function randomDate(daysAgo: number, daysAhead: number = 0): string {
  const now = new Date()
  const offset = Math.floor(Math.random() * (daysAhead + daysAgo)) - daysAgo
  const date = new Date(now.getTime() + offset * 24 * 60 * 60 * 1000)
  return date.toISOString().split('T')[0]
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// ============================================================================
// DEPARTMENTS DATA
// ============================================================================

const departments = [
  { name: 'Engineering', head: 'Sarah Chen', budget: 2500000, headcount: 12 },
  { name: 'Sales', head: 'Marcus Williams', budget: 1800000, headcount: 8 },
  { name: 'Marketing', head: 'Emily Rodriguez', budget: 1200000, headcount: 5 },
  { name: 'HR', head: 'David Kim', budget: 800000, headcount: 3 },
  { name: 'Finance', head: 'Jennifer Liu', budget: 950000, headcount: 4 },
  { name: 'Operations', head: 'Michael Thompson', budget: 1100000, headcount: 4 },
]

// ============================================================================
// EMPLOYEES DATA
// ============================================================================

const employeeData = [
  // Engineering Department (12 employees)
  { name: 'Sarah Chen', position: 'VP of Engineering', department: 'Engineering', level: 'VP', salary: 245000, isManager: true },
  { name: 'James Wilson', position: 'Senior Software Engineer', department: 'Engineering', level: 'Senior', salary: 175000, managerId: 0 },
  { name: 'Priya Sharma', position: 'Senior Software Engineer', department: 'Engineering', level: 'Senior', salary: 170000, managerId: 0 },
  { name: 'Alex Rivera', position: 'Software Engineer', department: 'Engineering', level: 'Mid', salary: 135000, managerId: 0 },
  { name: 'Lisa Zhang', position: 'Software Engineer', department: 'Engineering', level: 'Mid', salary: 130000, managerId: 0 },
  { name: 'Ryan O\'Connor', position: 'Junior Software Engineer', department: 'Engineering', level: 'Junior', salary: 95000, managerId: 0 },
  { name: 'Emma Davis', position: 'DevOps Engineer', department: 'Engineering', level: 'Senior', salary: 165000, managerId: 0 },
  { name: 'Kevin Park', position: 'QA Engineer', department: 'Engineering', level: 'Mid', salary: 115000, managerId: 0 },
  { name: 'Sophia Martinez', position: 'Frontend Developer', department: 'Engineering', level: 'Mid', salary: 128000, managerId: 0 },
  { name: 'Daniel Brown', position: 'Backend Developer', department: 'Engineering', level: 'Mid', salary: 132000, managerId: 0 },
  { name: 'Aisha Johnson', position: 'Data Engineer', department: 'Engineering', level: 'Senior', salary: 158000, managerId: 0 },
  { name: 'Chris Lee', position: 'Engineering Intern', department: 'Engineering', level: 'Intern', salary: 55000, managerId: 0 },

  // Sales Department (8 employees)
  { name: 'Marcus Williams', position: 'VP of Sales', department: 'Sales', level: 'VP', salary: 225000, isManager: true },
  { name: 'Ashley Taylor', position: 'Senior Account Executive', department: 'Sales', level: 'Senior', salary: 145000, managerId: 12 },
  { name: 'Brandon Clark', position: 'Account Executive', department: 'Sales', level: 'Mid', salary: 95000, managerId: 12 },
  { name: 'Catherine Moore', position: 'Account Executive', department: 'Sales', level: 'Mid', salary: 92000, managerId: 12 },
  { name: 'Derek White', position: 'Sales Development Rep', department: 'Sales', level: 'Junior', salary: 65000, managerId: 12 },
  { name: 'Elena Garcia', position: 'Sales Development Rep', department: 'Sales', level: 'Junior', salary: 62000, managerId: 12 },
  { name: 'Frank Harris', position: 'Sales Operations Manager', department: 'Sales', level: 'Manager', salary: 125000, managerId: 12 },
  { name: 'Grace Miller', position: 'Customer Success Manager', department: 'Sales', level: 'Mid', salary: 98000, managerId: 12 },

  // Marketing Department (5 employees)
  { name: 'Emily Rodriguez', position: 'VP of Marketing', department: 'Marketing', level: 'VP', salary: 215000, isManager: true },
  { name: 'Hannah Lewis', position: 'Content Marketing Manager', department: 'Marketing', level: 'Manager', salary: 115000, managerId: 20 },
  { name: 'Ian Scott', position: 'Digital Marketing Specialist', department: 'Marketing', level: 'Mid', salary: 85000, managerId: 20 },
  { name: 'Julia Adams', position: 'Brand Designer', department: 'Marketing', level: 'Mid', salary: 92000, managerId: 20 },
  { name: 'Kyle Turner', position: 'Marketing Coordinator', department: 'Marketing', level: 'Junior', salary: 58000, managerId: 20 },

  // HR Department (3 employees)
  { name: 'David Kim', position: 'VP of HR', department: 'HR', level: 'VP', salary: 195000, isManager: true },
  { name: 'Laura Nelson', position: 'HR Business Partner', department: 'HR', level: 'Senior', salary: 105000, managerId: 25 },
  { name: 'Maria Gonzalez', position: 'HR Coordinator', department: 'HR', level: 'Junior', salary: 55000, managerId: 25 },

  // Finance Department (4 employees)
  { name: 'Jennifer Liu', position: 'CFO', department: 'Finance', level: 'C-Level', salary: 275000, isManager: true },
  { name: 'Nathan Hill', position: 'Senior Accountant', department: 'Finance', level: 'Senior', salary: 115000, managerId: 28 },
  { name: 'Olivia Carter', position: 'Financial Analyst', department: 'Finance', level: 'Mid', salary: 95000, managerId: 28 },
  { name: 'Peter Wright', position: 'Accounts Payable Specialist', department: 'Finance', level: 'Junior', salary: 58000, managerId: 28 },

  // Operations Department (4 employees)
  { name: 'Michael Thompson', position: 'VP of Operations', department: 'Operations', level: 'VP', salary: 205000, isManager: true },
  { name: 'Rachel Baker', position: 'Operations Manager', department: 'Operations', level: 'Manager', salary: 110000, managerId: 32 },
  { name: 'Steven Young', position: 'Facilities Coordinator', department: 'Operations', level: 'Mid', salary: 68000, managerId: 32 },
  { name: 'Tina Roberts', position: 'Office Administrator', department: 'Operations', level: 'Junior', salary: 52000, managerId: 32 },
]

// ============================================================================
// GENERATE EMPLOYEES
// ============================================================================

function generateEmployees() {
  return employeeData.map((emp, index) => {
    const hireDate = randomDate(365 * 3, -30) // Hired between 3 years ago and 1 month ago
    const startDate = hireDate

    return {
      id: generateUUID('emp00000-0000-0000', index + 1),
      user_id: DEMO_USER_ID,
      employee_name: emp.name,
      employee_id: `EMP${String(index + 1001).padStart(4, '0')}`,
      email: `${emp.name.toLowerCase().replace(/[^a-z]/g, '.').replace(/\.+/g, '.')}@freeflow.io`,
      phone: `+1 ${randomInt(200, 999)}-${randomInt(200, 999)}-${randomInt(1000, 9999)}`,
      position: emp.position,
      job_title: emp.position,
      department: emp.department,
      team: emp.department,
      level: emp.level,
      employment_type: emp.level === 'Intern' ? 'intern' : 'full-time',
      status: 'active',
      is_remote: Math.random() > 0.7,
      manager_id: emp.managerId !== undefined ? generateUUID('emp00000-0000-0000', emp.managerId + 1) : null,
      manager_name: emp.managerId !== undefined ? employeeData[emp.managerId].name : null,
      direct_reports: emp.isManager ? randomInt(3, 10) : 0,
      office_location: randomChoice(['San Francisco HQ', 'New York Office', 'Remote']),
      country: 'United States',
      city: randomChoice(['San Francisco', 'New York', 'Austin', 'Seattle', 'Denver']),
      timezone: randomChoice(['America/Los_Angeles', 'America/New_York', 'America/Chicago']),
      salary: emp.salary,
      hourly_rate: Math.round(emp.salary / 2080 * 100) / 100,
      currency: 'USD',
      bonus_eligible: emp.level !== 'Intern' && emp.level !== 'Junior',
      commission_rate: emp.department === 'Sales' ? randomInt(5, 15) : 0,
      health_insurance: true,
      retirement_plan: emp.level !== 'Intern',
      stock_options: emp.level === 'Senior' || emp.level === 'Manager' || emp.level === 'VP' || emp.level === 'C-Level' ? randomInt(1000, 10000) : 0,
      pto_days: emp.level === 'Intern' ? 10 : emp.level === 'Junior' ? 15 : 20,
      sick_days: 10,
      used_pto_days: randomInt(0, 8),
      used_sick_days: randomInt(0, 3),
      hire_date: hireDate,
      start_date: startDate,
      probation_end_date: new Date(new Date(hireDate).getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      performance_rating: (3.5 + Math.random() * 1.5).toFixed(2),
      performance_score: randomInt(75, 98),
      last_review_date: randomDate(180, 0),
      next_review_date: randomDate(0, 180),
      goals_completed: randomInt(5, 12),
      goals_total: randomInt(8, 15),
      projects_count: randomInt(3, 15),
      tasks_completed: randomInt(50, 300),
      hours_logged: randomInt(500, 2000),
      productivity_score: (70 + Math.random() * 25).toFixed(2),
      skills: getSkillsForDepartment(emp.department),
      certifications: getCertificationsForRole(emp.position),
      languages: ['English', ...(Math.random() > 0.5 ? [randomChoice(['Spanish', 'Mandarin', 'French', 'German'])] : [])],
      education_level: randomChoice(['Bachelor\'s', 'Master\'s', 'PhD', 'Bachelor\'s', 'Bachelor\'s']),
      emergency_contact_name: `${randomChoice(['John', 'Mary', 'Robert', 'Patricia'])} ${emp.name.split(' ')[1]}`,
      emergency_contact_phone: `+1 ${randomInt(200, 999)}-${randomInt(200, 999)}-${randomInt(1000, 9999)}`,
      emergency_contact_relationship: randomChoice(['Spouse', 'Parent', 'Sibling', 'Partner']),
      contract_url: `/documents/contracts/${emp.name.toLowerCase().replace(/\s/g, '-')}-contract.pdf`,
      resume_url: `/documents/resumes/${emp.name.toLowerCase().replace(/\s/g, '-')}-resume.pdf`,
      id_document_url: `/documents/ids/${emp.name.toLowerCase().replace(/\s/g, '-')}-id.pdf`,
      onboarding_completed: true,
      onboarding_progress: 100,
      notes: `${emp.name} joined as ${emp.position}. Excellent team player with strong ${emp.department.toLowerCase()} skills.`,
      tags: [emp.department.toLowerCase(), emp.level.toLowerCase(), emp.isManager ? 'manager' : 'individual-contributor'],
      custom_fields: {
        badge_number: `BDG${String(index + 1001).padStart(4, '0')}`,
        parking_spot: Math.random() > 0.5 ? `P${randomInt(1, 200)}` : null,
        desk_location: `Floor ${randomInt(1, 5)}, Desk ${randomInt(1, 50)}`,
      },
      created_at: new Date(new Date(hireDate).getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    }
  })
}

function getSkillsForDepartment(department: string): string[] {
  const skillsByDept: Record<string, string[]> = {
    Engineering: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'Git'],
    Sales: ['Salesforce', 'HubSpot', 'Negotiation', 'Cold Calling', 'Pipeline Management', 'CRM', 'Presentations'],
    Marketing: ['SEO', 'Content Strategy', 'Social Media', 'Google Analytics', 'Adobe Creative Suite', 'Copywriting', 'Brand Strategy'],
    HR: ['Recruiting', 'HRIS', 'Employee Relations', 'Benefits Administration', 'Compliance', 'Training & Development'],
    Finance: ['Excel', 'Financial Modeling', 'QuickBooks', 'SAP', 'Budgeting', 'Forecasting', 'Audit'],
    Operations: ['Project Management', 'Process Improvement', 'Vendor Management', 'Logistics', 'Facilities Management'],
  }
  const skills = skillsByDept[department] || []
  return skills.slice(0, randomInt(3, Math.min(skills.length, 6)))
}

function getCertificationsForRole(position: string): string[] {
  const certs: string[] = []
  if (position.includes('Engineer') || position.includes('Developer')) {
    certs.push(...randomChoice([['AWS Certified Solutions Architect'], ['Google Cloud Professional'], ['Azure Administrator'], []]))
  }
  if (position.includes('Manager') || position.includes('VP') || position.includes('Director')) {
    certs.push(...randomChoice([['PMP'], ['Scrum Master'], ['Six Sigma Green Belt'], []]))
  }
  if (position.includes('HR')) {
    certs.push(...randomChoice([['SHRM-CP'], ['PHR'], []]))
  }
  if (position.includes('Finance') || position.includes('Accountant') || position.includes('CFO')) {
    certs.push(...randomChoice([['CPA'], ['CFA'], ['CMA'], []]))
  }
  return certs
}

// ============================================================================
// GENERATE PERFORMANCE REVIEWS
// ============================================================================

function generatePerformanceReviews(employees: any[]) {
  const reviews: any[] = []
  const goals: any[] = []

  employees.forEach((emp, empIndex) => {
    // Generate 2-4 reviews per employee (quarterly/annual)
    const reviewCount = randomInt(2, 4)

    for (let i = 0; i < reviewCount; i++) {
      const reviewId = generateUUID('rev00000-0000-0000', empIndex * 10 + i + 1)
      const reviewYear = 2024 + Math.floor(i / 4)
      const reviewQuarter = ['Q1', 'Q2', 'Q3', 'Q4'][i % 4]
      const overallScore = 70 + Math.random() * 28

      const review = {
        id: reviewId,
        user_id: DEMO_USER_ID,
        employee_id: emp.employee_id,
        employee_name: emp.employee_name,
        employee_email: emp.email,
        employee_position: emp.position,
        employee_department: emp.department,
        reviewer_name: emp.manager_name || 'David Kim',
        reviewer_position: 'Manager',
        review_period: `${reviewQuarter} ${reviewYear}`,
        review_year: reviewYear,
        review_quarter: reviewQuarter,
        review_type: i === 0 ? 'annual' : 'quarterly',
        overall_score: Math.round(overallScore * 100) / 100,
        performance_score: Math.round((65 + Math.random() * 30) * 100) / 100,
        goals_score: Math.round((70 + Math.random() * 28) * 100) / 100,
        competency_score: Math.round((72 + Math.random() * 25) * 100) / 100,
        behavior_score: Math.round((75 + Math.random() * 23) * 100) / 100,
        goals_set: randomInt(4, 8),
        goals_achieved: randomInt(3, 6),
        goals_in_progress: randomInt(1, 3),
        goals_missed: randomInt(0, 1),
        status: 'completed',
        manager_feedback: generateManagerFeedback(overallScore),
        employee_feedback: 'I appreciate the constructive feedback and look forward to continuing to grow in my role.',
        strengths: getStrengths(emp.department),
        areas_for_improvement: getAreasForImprovement(emp.level),
        recommendations: overallScore > 85 ? 'Consider for promotion in next cycle.' : 'Continue development and focus on identified growth areas.',
        review_date: randomDate(365, -30),
        rating: overallScore >= 90 ? 'excellent' : overallScore >= 80 ? 'good' : overallScore >= 70 ? 'satisfactory' : 'needs_improvement',
        created_at: new Date().toISOString(),
      }
      reviews.push(review)

      // Generate goals for this review
      const goalCount = randomInt(3, 6)
      for (let g = 0; g < goalCount; g++) {
        const goalProgress = randomInt(40, 100)
        goals.push({
          id: generateUUID('gol00000-0000-0000', empIndex * 100 + i * 10 + g + 1),
          user_id: DEMO_USER_ID,
          review_id: reviewId,
          goal_title: getGoalTitle(emp.department, g),
          goal_description: `Achieve target performance in ${getGoalTitle(emp.department, g).toLowerCase()}.`,
          goal_category: randomChoice(['performance', 'learning', 'career', 'project']),
          assigned_to_name: emp.employee_name,
          assigned_to_email: emp.email,
          assigned_by_name: emp.manager_name || 'David Kim',
          target_value: 100,
          current_value: goalProgress,
          progress_percentage: goalProgress,
          priority: randomChoice(['critical', 'high', 'medium']),
          weight: randomInt(10, 30),
          status: goalProgress >= 100 ? 'completed' : goalProgress >= 70 ? 'on_track' : 'in_progress',
          start_date: randomDate(180, 0),
          due_date: randomDate(0, 90),
          review_period: review.review_period,
          review_year: reviewYear,
          review_quarter: reviewQuarter,
          created_at: new Date().toISOString(),
        })
      }
    }
  })

  return { reviews, goals }
}

function generateManagerFeedback(score: number): string {
  if (score >= 90) {
    return 'Exceptional performance this quarter. Consistently exceeds expectations and demonstrates strong leadership. A valuable asset to the team.'
  } else if (score >= 80) {
    return 'Strong performance with notable achievements. Demonstrates reliability and good collaboration skills. Continue developing in key areas for advancement.'
  } else if (score >= 70) {
    return 'Satisfactory performance meeting core expectations. Shows potential for growth. Recommend focusing on specific skill development areas identified.'
  }
  return 'Performance requires improvement in several areas. Clear action plan needed with regular check-ins to ensure progress.'
}

function getStrengths(department: string): string[] {
  const strengthsByDept: Record<string, string[]> = {
    Engineering: ['Technical expertise', 'Problem-solving', 'Code quality', 'Team collaboration'],
    Sales: ['Client relationships', 'Negotiation skills', 'Pipeline management', 'Closing deals'],
    Marketing: ['Creativity', 'Campaign execution', 'Brand awareness', 'Data-driven decisions'],
    HR: ['Employee relations', 'Recruitment', 'Policy implementation', 'Conflict resolution'],
    Finance: ['Analytical skills', 'Accuracy', 'Financial reporting', 'Budget management'],
    Operations: ['Process optimization', 'Vendor management', 'Cost reduction', 'Team coordination'],
  }
  const strengths = strengthsByDept[department] || ['Dedication', 'Teamwork']
  return strengths.slice(0, randomInt(2, 4))
}

function getAreasForImprovement(level: string): string[] {
  if (level === 'Junior' || level === 'Intern') {
    return ['Technical depth', 'Independent problem-solving', 'Time management']
  } else if (level === 'Mid') {
    return ['Leadership skills', 'Strategic thinking', 'Cross-functional collaboration']
  }
  return ['Delegation', 'Executive communication', 'Long-term planning']
}

function getGoalTitle(department: string, index: number): string {
  const goalsByDept: Record<string, string[]> = {
    Engineering: ['Complete feature implementation', 'Improve code coverage', 'Reduce bug backlog', 'Learn new technology', 'Mentor junior developers', 'Optimize system performance'],
    Sales: ['Achieve revenue target', 'Expand client base', 'Improve close rate', 'Build strategic partnerships', 'Increase upsell revenue', 'Reduce churn rate'],
    Marketing: ['Launch new campaign', 'Increase brand awareness', 'Improve lead generation', 'Optimize marketing ROI', 'Build content library', 'Enhance social presence'],
    HR: ['Improve retention rate', 'Streamline onboarding', 'Enhance employee engagement', 'Update policies', 'Reduce time-to-hire', 'Build training programs'],
    Finance: ['Improve reporting accuracy', 'Reduce close time', 'Implement new system', 'Cost optimization', 'Audit preparation', 'Budget forecasting'],
    Operations: ['Process automation', 'Vendor cost reduction', 'Facility improvements', 'Safety compliance', 'Inventory optimization', 'Team efficiency'],
  }
  const goals = goalsByDept[department] || ['Improve performance', 'Skill development']
  return goals[index % goals.length]
}

// ============================================================================
// GENERATE ONBOARDING PROGRAMS & TASKS
// ============================================================================

function generateOnboardingPrograms(employees: any[]) {
  const programs: any[] = []
  const tasks: any[] = []

  // Create onboarding programs for recently hired employees (last 6 months)
  const recentHires = employees.filter(emp => {
    const hireDate = new Date(emp.hire_date)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    return hireDate > sixMonthsAgo
  }).slice(0, 8) // Limit to 8 recent onboardings

  recentHires.forEach((emp, index) => {
    const programId = generateUUID('onb00000-0000-0000', index + 1)
    const startDate = new Date(emp.hire_date)
    const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000)
    const completionRate = emp.onboarding_completed ? 100 : randomInt(40, 90)

    const program = {
      id: programId,
      user_id: DEMO_USER_ID,
      onboarding_code: `ONB${String(index + 1001).padStart(4, '0')}`,
      employee_name: emp.employee_name,
      employee_email: emp.email,
      role: emp.position,
      department: emp.department,
      employee_type: emp.employment_type,
      status: completionRate >= 100 ? 'completed' : 'in-progress',
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      completion_rate: completionRate,
      tasks_completed: Math.floor(completionRate / 10),
      total_tasks: 10,
      days_remaining: Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000))),
      buddy_name: randomChoice(employees.filter(e => e.department === emp.department && e !== emp)).employee_name,
      buddy_email: randomChoice(employees.filter(e => e.department === emp.department && e !== emp)).email,
      manager_name: emp.manager_name,
      manager_email: emp.manager_name ? `${emp.manager_name.toLowerCase().replace(/\s/g, '.')}@freeflow.io` : null,
      welcome_email_sent: true,
      equipment_provided: completionRate >= 20,
      access_granted: completionRate >= 30,
      created_at: new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    }
    programs.push(program)

    // Generate onboarding tasks
    const onboardingTasks = [
      { name: 'Complete HR paperwork', category: 'HR', priority: 'high', isRequired: true },
      { name: 'Set up workstation', category: 'IT', priority: 'high', isRequired: true },
      { name: 'Complete security training', category: 'Security', priority: 'high', isRequired: true },
      { name: 'Meet with manager', category: 'Orientation', priority: 'high', isRequired: true },
      { name: 'Review company handbook', category: 'HR', priority: 'medium', isRequired: true },
      { name: 'Set up email and accounts', category: 'IT', priority: 'high', isRequired: true },
      { name: 'Complete department training', category: 'Training', priority: 'medium', isRequired: true },
      { name: 'Meet team members', category: 'Orientation', priority: 'medium', isRequired: false },
      { name: 'Set initial goals', category: 'Performance', priority: 'medium', isRequired: true },
      { name: '30-day review meeting', category: 'Performance', priority: 'high', isRequired: true },
    ]

    onboardingTasks.forEach((task, taskIndex) => {
      const isCompleted = (taskIndex + 1) <= Math.floor(completionRate / 10)
      tasks.push({
        id: generateUUID('obt00000-0000-0000', index * 100 + taskIndex + 1),
        user_id: DEMO_USER_ID,
        program_id: programId,
        task_code: `OBT${String(index * 100 + taskIndex + 1001).padStart(4, '0')}`,
        task_name: task.name,
        description: `${task.name} for ${emp.employee_name}`,
        category: task.category,
        status: isCompleted ? 'completed' : taskIndex < Math.floor(completionRate / 10) + 2 ? 'in-progress' : 'pending',
        priority: task.priority,
        due_date: new Date(startDate.getTime() + (taskIndex + 1) * 3 * 24 * 60 * 60 * 1000).toISOString(),
        completed_date: isCompleted ? new Date(startDate.getTime() + taskIndex * 2 * 24 * 60 * 60 * 1000).toISOString() : null,
        assigned_to: emp.manager_name || 'HR Team',
        order_index: taskIndex,
        is_required: task.isRequired,
        created_at: program.created_at,
      })
    })
  })

  return { programs, tasks }
}

// ============================================================================
// GENERATE PAYROLL DATA
// ============================================================================

function generatePayrollData(employees: any[]) {
  const payrollRuns: any[] = []
  const employeePayroll: any[] = []

  // Generate last 6 months of payroll runs
  for (let month = 0; month < 6; month++) {
    const payDate = new Date()
    payDate.setMonth(payDate.getMonth() - month)
    payDate.setDate(15) // Mid-month pay date

    const runId = generateUUID('prl00000-0000-0000', month + 1)
    const totalAmount = employees.reduce((sum, emp) => sum + (emp.salary / 12), 0)

    const run = {
      id: runId,
      user_id: DEMO_USER_ID,
      run_code: `PAY${payDate.getFullYear()}${String(payDate.getMonth() + 1).padStart(2, '0')}`,
      period: `${payDate.toLocaleString('default', { month: 'long' })} ${payDate.getFullYear()}`,
      pay_date: payDate.toISOString().split('T')[0],
      status: month === 0 ? 'pending' : 'completed',
      total_employees: employees.length,
      total_amount: Math.round(totalAmount * 100) / 100,
      processed_count: month === 0 ? 0 : employees.length,
      pending_count: month === 0 ? employees.length : 0,
      failed_count: 0,
      approved_by: month === 0 ? null : 'Jennifer Liu',
      approved_date: month === 0 ? null : new Date(payDate.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      currency: 'USD',
      notes: month === 0 ? 'Pending approval' : 'Processed successfully',
      created_at: new Date(payDate.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    }
    payrollRuns.push(run)

    // Generate employee payroll records for each run
    employees.forEach((emp, empIndex) => {
      const baseSalary = emp.salary / 12
      const bonuses = emp.bonus_eligible && Math.random() > 0.8 ? randomInt(500, 3000) : 0
      const deductions = baseSalary * 0.08 // 401k, health, etc
      const taxes = baseSalary * 0.25 // Estimated tax rate
      const netPay = baseSalary + bonuses - deductions - taxes

      employeePayroll.push({
        id: generateUUID('epl00000-0000-0000', month * 100 + empIndex + 1),
        user_id: DEMO_USER_ID,
        run_id: runId,
        employee_code: emp.employee_id,
        employee_name: emp.employee_name,
        department: emp.department,
        role: emp.position,
        status: 'active',
        base_salary: Math.round(baseSalary * 100) / 100,
        bonuses: bonuses,
        deductions: Math.round(deductions * 100) / 100,
        taxes: Math.round(taxes * 100) / 100,
        net_pay: Math.round(netPay * 100) / 100,
        payment_method: 'direct-deposit',
        tax_rate: 25,
        bank_account: `****${randomInt(1000, 9999)}`,
        payment_status: month === 0 ? 'pending' : 'completed',
        payment_date: month === 0 ? null : payDate.toISOString(),
        created_at: run.created_at,
      })
    })
  }

  return { payrollRuns, employeePayroll }
}

// ============================================================================
// GENERATE TRAINING PROGRAMS
// ============================================================================

function generateTrainingPrograms(employees: any[]) {
  const programs: any[] = []
  const enrollments: any[] = []

  const trainingData = [
    { name: 'Security Awareness Training', type: 'compliance', duration: 1, mandatory: true, capacity: 50 },
    { name: 'Leadership Development Program', type: 'leadership', duration: 5, mandatory: false, capacity: 20 },
    { name: 'Advanced React & TypeScript', type: 'technical', duration: 3, mandatory: false, capacity: 15 },
    { name: 'Sales Excellence Workshop', type: 'skills', duration: 2, mandatory: false, capacity: 15 },
    { name: 'Project Management Fundamentals', type: 'skills', duration: 2, mandatory: false, capacity: 25 },
    { name: 'Diversity & Inclusion Training', type: 'compliance', duration: 1, mandatory: true, capacity: 50 },
    { name: 'Cloud Architecture Certification Prep', type: 'certification', duration: 10, mandatory: false, capacity: 10 },
    { name: 'Customer Success Strategies', type: 'skills', duration: 2, mandatory: false, capacity: 20 },
    { name: 'Data Analytics with Python', type: 'technical', duration: 4, mandatory: false, capacity: 12 },
    { name: 'Effective Communication Workshop', type: 'soft-skills', duration: 1, mandatory: false, capacity: 30 },
  ]

  trainingData.forEach((training, index) => {
    const programId = generateUUID('trn00000-0000-0000', index + 1)
    const startDate = randomDate(60, 30)
    const endDate = new Date(new Date(startDate).getTime() + training.duration * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const enrolledCount = randomInt(5, Math.min(training.capacity, 25))

    const program = {
      id: programId,
      user_id: DEMO_USER_ID,
      program_code: `TRN${String(index + 1001).padStart(4, '0')}`,
      program_name: training.name,
      description: `Comprehensive ${training.name.toLowerCase()} for professional development.`,
      program_type: training.type,
      status: new Date(startDate) > new Date() ? 'scheduled' : new Date(endDate) < new Date() ? 'completed' : 'in-progress',
      trainer_name: randomChoice(['Dr. Sarah Mitchell', 'John Henderson', 'Maria Santos', 'Alex Chen', 'External Vendor']),
      trainer_email: 'training@freeflow.io',
      max_capacity: training.capacity,
      enrolled_count: enrolledCount,
      duration_days: training.duration,
      session_count: training.duration,
      start_date: startDate,
      end_date: endDate,
      completion_rate: new Date(endDate) < new Date() ? randomInt(85, 100) : randomInt(30, 70),
      avg_score: (75 + Math.random() * 20).toFixed(2),
      location: randomChoice(['Conference Room A', 'Virtual/Zoom', 'Training Center', 'External Venue']),
      format: randomChoice(['in-person', 'virtual', 'hybrid']),
      prerequisites: training.type === 'technical' ? 'Basic knowledge required' : null,
      objectives: `Complete ${training.name.toLowerCase()} curriculum and certification.`,
      created_at: new Date(new Date(startDate).getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    }
    programs.push(program)

    // Create enrollments
    const eligibleEmployees = employees.filter(emp => {
      if (training.type === 'technical') return emp.department === 'Engineering'
      if (training.type === 'leadership') return emp.level === 'Manager' || emp.level === 'Senior'
      if (training.name.includes('Sales')) return emp.department === 'Sales'
      return true
    })

    const enrolledEmployees = eligibleEmployees.slice(0, enrolledCount)
    enrolledEmployees.forEach((emp, empIndex) => {
      const isCompleted = program.status === 'completed' || Math.random() > 0.3
      enrollments.push({
        id: generateUUID('enr00000-0000-0000', index * 100 + empIndex + 1),
        user_id: DEMO_USER_ID,
        program_id: programId,
        trainee_name: emp.employee_name,
        trainee_email: emp.email,
        enrollment_status: isCompleted ? 'completed' : 'enrolled',
        enrolled_at: new Date(new Date(startDate).getTime() - randomInt(1, 14) * 24 * 60 * 60 * 1000).toISOString(),
        started_at: startDate,
        completed_at: isCompleted ? endDate : null,
        progress_percent: isCompleted ? 100 : randomInt(20, 80),
        score: isCompleted ? (70 + Math.random() * 28).toFixed(2) : null,
        certificate_issued: isCompleted && training.type !== 'compliance',
        certificate_url: isCompleted ? `/certificates/${emp.employee_id}-${program.program_code}.pdf` : null,
        created_at: program.created_at,
      })
    })
  })

  return { programs, enrollments }
}

// ============================================================================
// GENERATE EMPLOYEE DOCUMENTS
// ============================================================================

function generateEmployeeDocuments(employees: any[]) {
  const documents: any[] = []

  const documentTypes = [
    { type: 'contract', title: 'Employment Contract', access: 'confidential' },
    { type: 'policy', title: 'Signed Policy Acknowledgment', access: 'internal' },
    { type: 'other', title: 'Government ID Copy', access: 'restricted' },
    { type: 'other', title: 'Tax Form W-4', access: 'confidential' },
    { type: 'other', title: 'Direct Deposit Authorization', access: 'confidential' },
    { type: 'other', title: 'Emergency Contact Form', access: 'internal' },
    { type: 'other', title: 'Benefits Enrollment Form', access: 'confidential' },
    { type: 'other', title: 'NDA Agreement', access: 'restricted' },
  ]

  employees.forEach((emp, empIndex) => {
    // Generate 4-8 documents per employee
    const docCount = randomInt(4, 8)
    const selectedDocs = documentTypes.slice(0, docCount)

    selectedDocs.forEach((doc, docIndex) => {
      documents.push({
        id: generateUUID('doc00000-0000-0000', empIndex * 100 + docIndex + 1),
        user_id: DEMO_USER_ID,
        document_title: `${emp.employee_name} - ${doc.title}`,
        document_type: doc.type,
        status: 'approved',
        access_level: doc.access,
        is_encrypted: doc.access === 'restricted' || doc.access === 'confidential',
        owner: emp.employee_name,
        department: emp.department,
        created_by: 'HR System',
        last_modified_by: 'HR Team',
        file_path: `/hr-documents/${emp.employee_id}/${doc.type}-${docIndex + 1}.pdf`,
        file_url: `/api/documents/${emp.employee_id}/${doc.type}-${docIndex + 1}.pdf`,
        file_name: `${emp.employee_name.replace(/\s/g, '_')}_${doc.title.replace(/\s/g, '_')}.pdf`,
        file_extension: 'pdf',
        file_size_bytes: randomInt(50000, 500000),
        file_size_mb: (randomInt(50, 500) / 1000).toFixed(2),
        mime_type: 'application/pdf',
        version: '1.0',
        version_number: 1,
        is_latest_version: true,
        approved_by: 'David Kim',
        approved_at: new Date(new Date(emp.hire_date).getTime() + randomInt(1, 7) * 24 * 60 * 60 * 1000).toISOString(),
        view_count: randomInt(1, 10),
        download_count: randomInt(0, 3),
        tags: ['hr', 'employee-records', emp.department.toLowerCase()],
        categories: ['HR Documents', emp.department],
        folder_path: `/HR/${emp.department}/${emp.employee_id}`,
        description: `${doc.title} for ${emp.employee_name}`,
        created_at: new Date(new Date(emp.hire_date).getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
    })
  })

  return documents
}

// ============================================================================
// MAIN SEEDING FUNCTION
// ============================================================================

async function seedEnterpriseHR() {
  console.log('========================================')
  console.log('Enterprise HR Demo Data Seeder')
  console.log('========================================')
  console.log('')
  console.log(`Seeding data for user: alex@freeflow.io (${DEMO_USER_ID})`)
  console.log('')

  try {
    // Generate all data
    const employees = generateEmployees()
    const { reviews, goals } = generatePerformanceReviews(employees)
    const { programs: onboardingPrograms, tasks: onboardingTasks } = generateOnboardingPrograms(employees)
    const { payrollRuns, employeePayroll } = generatePayrollData(employees)
    const { programs: trainingPrograms, enrollments: trainingEnrollments } = generateTrainingPrograms(employees)
    const documents = generateEmployeeDocuments(employees)

    // Seed Employees
    console.log('Seeding employees...')
    const { error: empError } = await supabase
      .from('employees')
      .upsert(employees, { onConflict: 'id' })

    if (empError) {
      console.log('Employees error:', empError.message)
    } else {
      console.log(`  Inserted ${employees.length} employees`)
    }

    // Seed Performance Reviews
    console.log('Seeding performance reviews...')
    const { error: revError } = await supabase
      .from('performance_reviews')
      .upsert(reviews, { onConflict: 'id' })

    if (revError) {
      console.log('Performance reviews error:', revError.message)
    } else {
      console.log(`  Inserted ${reviews.length} performance reviews`)
    }

    // Seed Performance Goals
    console.log('Seeding performance goals...')
    const { error: goalError } = await supabase
      .from('performance_goals')
      .upsert(goals, { onConflict: 'id' })

    if (goalError) {
      console.log('Performance goals error:', goalError.message)
    } else {
      console.log(`  Inserted ${goals.length} performance goals`)
    }

    // Seed Onboarding Programs
    console.log('Seeding onboarding programs...')
    const { error: onbError } = await supabase
      .from('onboarding_programs')
      .upsert(onboardingPrograms, { onConflict: 'id' })

    if (onbError) {
      console.log('Onboarding programs error:', onbError.message)
    } else {
      console.log(`  Inserted ${onboardingPrograms.length} onboarding programs`)
    }

    // Seed Onboarding Tasks
    console.log('Seeding onboarding tasks...')
    const { error: obtError } = await supabase
      .from('onboarding_tasks')
      .upsert(onboardingTasks, { onConflict: 'id' })

    if (obtError) {
      console.log('Onboarding tasks error:', obtError.message)
    } else {
      console.log(`  Inserted ${onboardingTasks.length} onboarding tasks`)
    }

    // Seed Payroll Runs
    console.log('Seeding payroll runs...')
    const { error: prlError } = await supabase
      .from('payroll_runs')
      .upsert(payrollRuns, { onConflict: 'id' })

    if (prlError) {
      console.log('Payroll runs error:', prlError.message)
    } else {
      console.log(`  Inserted ${payrollRuns.length} payroll runs`)
    }

    // Seed Employee Payroll
    console.log('Seeding employee payroll records...')
    const { error: eplError } = await supabase
      .from('employee_payroll')
      .upsert(employeePayroll, { onConflict: 'id' })

    if (eplError) {
      console.log('Employee payroll error:', eplError.message)
    } else {
      console.log(`  Inserted ${employeePayroll.length} employee payroll records`)
    }

    // Seed Training Programs
    console.log('Seeding training programs...')
    const { error: trnError } = await supabase
      .from('training_programs')
      .upsert(trainingPrograms, { onConflict: 'id' })

    if (trnError) {
      console.log('Training programs error:', trnError.message)
    } else {
      console.log(`  Inserted ${trainingPrograms.length} training programs`)
    }

    // Seed Training Enrollments
    console.log('Seeding training enrollments...')
    const { error: enrError } = await supabase
      .from('training_enrollments')
      .upsert(trainingEnrollments, { onConflict: 'id' })

    if (enrError) {
      console.log('Training enrollments error:', enrError.message)
    } else {
      console.log(`  Inserted ${trainingEnrollments.length} training enrollments`)
    }

    // Seed Documents
    console.log('Seeding employee documents...')
    const { error: docError } = await supabase
      .from('documents')
      .upsert(documents, { onConflict: 'id' })

    if (docError) {
      console.log('Documents error:', docError.message)
    } else {
      console.log(`  Inserted ${documents.length} documents`)
    }

    // Summary
    console.log('')
    console.log('========================================')
    console.log('Enterprise HR Data Summary')
    console.log('========================================')
    console.log('')
    console.log('EMPLOYEES:', employees.length)
    console.log('  By Department:')
    departments.forEach(dept => {
      const count = employees.filter(e => e.department === dept.name).length
      console.log(`    - ${dept.name}: ${count}`)
    })
    console.log('')
    console.log('PERFORMANCE MANAGEMENT:')
    console.log(`  - Reviews: ${reviews.length}`)
    console.log(`  - Goals: ${goals.length}`)
    console.log(`  - Average Score: ${(reviews.reduce((s, r) => s + r.overall_score, 0) / reviews.length).toFixed(1)}%`)
    console.log('')
    console.log('ONBOARDING:')
    console.log(`  - Programs: ${onboardingPrograms.length}`)
    console.log(`  - Tasks: ${onboardingTasks.length}`)
    console.log(`  - Completed: ${onboardingPrograms.filter(p => p.status === 'completed').length}`)
    console.log('')
    console.log('PAYROLL:')
    console.log(`  - Payroll Runs: ${payrollRuns.length}`)
    console.log(`  - Employee Records: ${employeePayroll.length}`)
    const totalPayroll = payrollRuns.reduce((s, r) => s + r.total_amount, 0)
    console.log(`  - Total Processed: $${totalPayroll.toLocaleString()}`)
    console.log('')
    console.log('TRAINING:')
    console.log(`  - Programs: ${trainingPrograms.length}`)
    console.log(`  - Enrollments: ${trainingEnrollments.length}`)
    console.log(`  - Completed: ${trainingEnrollments.filter(e => e.enrollment_status === 'completed').length}`)
    console.log('')
    console.log('DOCUMENTS:')
    console.log(`  - Total: ${documents.length}`)
    console.log(`  - Confidential: ${documents.filter(d => d.access_level === 'confidential').length}`)
    console.log(`  - Restricted: ${documents.filter(d => d.access_level === 'restricted').length}`)
    console.log('')
    console.log('Enterprise HR data seeding complete!')
    console.log('')

  } catch (error) {
    console.error('Seed failed:', error)
    process.exit(1)
  }
}

// Run the seed function
seedEnterpriseHR()
