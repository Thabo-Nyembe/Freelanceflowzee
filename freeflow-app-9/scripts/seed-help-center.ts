/**
 * Help Center Seed Script
 *
 * Populates the help center with comprehensive articles and categories
 * Run with: npx tsx scripts/seed-help-center.ts
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING')
  console.error('- SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'SET' : 'MISSING')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Demo user ID for seeding
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'

// Help Categories (matching actual schema)
const categories = [
  { name: 'Getting Started', slug: 'getting-started', description: 'Learn the basics of KAZI', icon: 'rocket', color: '#10B981', sort_order: 1 },
  { name: 'Projects', slug: 'projects', description: 'Managing projects and tasks', icon: 'folder', color: '#3B82F6', sort_order: 2 },
  { name: 'Time Tracking', slug: 'time-tracking', description: 'Track time and generate reports', icon: 'clock', color: '#F59E0B', sort_order: 3 },
  { name: 'Invoicing', slug: 'invoicing', description: 'Create invoices and manage payments', icon: 'file-text', color: '#8B5CF6', sort_order: 4 },
  { name: 'Clients', slug: 'clients', description: 'Manage clients and the client portal', icon: 'users', color: '#EC4899', sort_order: 5 },
  { name: 'Team', slug: 'team', description: 'Collaborate with team members', icon: 'users-2', color: '#06B6D4', sort_order: 6 },
  { name: 'Integrations', slug: 'integrations', description: 'Connect with other tools', icon: 'plug', color: '#84CC16', sort_order: 7 },
  { name: 'AI Features', slug: 'ai-features', description: 'Using AI-powered tools', icon: 'sparkles', color: '#F472B6', sort_order: 8 },
  { name: 'Account', slug: 'account', description: 'Manage your account', icon: 'settings', color: '#6B7280', sort_order: 9 },
  { name: 'Troubleshooting', slug: 'troubleshooting', description: 'Common issues and solutions', icon: 'help-circle', color: '#EF4444', sort_order: 10 },
]

// Help Articles (matching actual schema - uses 'category' as string, not category_id)
const articles = [
  // Getting Started
  {
    category: 'guide',
    title: 'Welcome to KAZI',
    slug: 'welcome-to-kazi',
    excerpt: 'Get started with KAZI and learn what you can accomplish.',
    content: `# Welcome to KAZI

KAZI is your all-in-one freelance business management platform. Whether you're a solo freelancer or running a small agency, KAZI helps you manage projects, track time, send invoices, and grow your business.

## What Can You Do with KAZI?

### Manage Projects
- Create projects with tasks and milestones
- Track progress with Kanban boards, lists, or calendars
- Collaborate with clients and team members

### Track Time
- One-click timer for accurate time logging
- Manual time entry for flexibility
- Detailed reports and analytics

### Send Invoices
- Professional invoice templates
- Automatic invoicing from tracked time
- Multiple payment options (Stripe, PayPal, Crypto)

### Grow Your Business
- AI-powered proposal generator
- Client portal for transparency
- Analytics and insights

## Getting Started Checklist

1. Complete your profile setup
2. Connect your payment methods
3. Add your first client
4. Create your first project
5. Start tracking time

Ready to begin? Check out our Quick Start Guide.`,
    meta_title: 'Welcome to KAZI - Freelance Business Management',
    meta_description: 'Learn how to use KAZI to manage your freelance business.',
    keywords: ['welcome', 'overview', 'introduction'],
  },
  {
    category: 'guide',
    title: 'Quick Start Guide',
    slug: 'quick-start-guide',
    excerpt: 'Get up and running with KAZI in under 10 minutes.',
    content: `# Quick Start Guide

Get up and running with KAZI in under 10 minutes.

## Step 1: Create a Client (1 minute)

1. Click **Clients** in the sidebar
2. Click **+ Add Client**
3. Enter client details (name, email)
4. Click **Save**

## Step 2: Create a Project (2 minutes)

1. Click **Projects Hub** in the sidebar
2. Click **+ New Project**
3. Fill in project details
4. Select your client
5. Click **Create Project**

## Step 3: Start Tracking Time (1 minute)

1. Click **Time Tracking** in the sidebar
2. Click **Start Timer**
3. Select your project
4. Timer starts automatically

## Step 4: Create an Invoice (1 minute)

1. Click **Invoices** in the sidebar
2. Click **+ New Invoice**
3. Select client and project
4. Time entries auto-populate
5. Click **Send Invoice**

## You're Ready!

Explore other features like AI tools, team collaboration, integrations, and analytics.`,
    meta_title: 'KAZI Quick Start Guide',
    meta_description: 'Follow this quick start guide to set up KAZI in minutes.',
    keywords: ['quick-start', 'tutorial', 'basics'],
  },
  {
    category: 'guide',
    title: 'Account Setup',
    slug: 'account-setup',
    excerpt: 'Complete your KAZI account setup step by step.',
    content: `# Account Setup Guide

Complete your KAZI account setup to get the most out of the platform.

## Profile Setup

### Personal Information
1. Click your avatar in the top right
2. Select **Profile Settings**
3. Fill in:
   - Full name
   - Profile photo
   - Job title
   - Location and timezone

### Business Information
- Business name (for invoices)
- Business address
- Tax ID / VAT number
- Default hourly rate
- Currency preference

## Payment Setup

### Connecting Stripe
1. Go to **Settings > Payments**
2. Click **Connect Stripe**
3. Complete Stripe onboarding
4. Start accepting card payments

### Other Payment Methods
- PayPal
- Bank transfer
- Cryptocurrency

## Security

1. Enable Two-Factor Authentication
2. Review active sessions
3. Set session timeout preferences`,
    meta_title: 'KAZI Account Setup Guide',
    meta_description: 'Step-by-step guide to setting up your KAZI account.',
    keywords: ['account', 'setup', 'profile', 'payments'],
  },
  // Projects
  {
    category: 'tutorial',
    title: 'Creating Your First Project',
    slug: 'creating-first-project',
    excerpt: 'Learn how to create and configure a new project.',
    content: `# Creating Your First Project

Projects are the foundation of your work in KAZI.

## Create a New Project

1. Navigate to **Projects Hub**
2. Click **+ New Project**
3. Complete the project wizard

## Project Details

### Basic Information
- **Project Name**: Clear, descriptive title
- **Client**: Select from your clients
- **Description**: Project scope and objectives

### Timeline
- **Start Date**: When work begins
- **End Date**: Target completion
- **Milestones**: Key deliverables

### Budget & Billing
- **Billing Type**: Hourly, Fixed, or Retainer
- **Budget**: Maximum spend limit
- **Hourly Rate**: Override default if needed

## Adding Tasks

Once your project is created:
1. Click **+ Add Task**
2. Enter task details
3. Assign to team member
4. Set due date and priority

## Project Views

Switch between:
- **Kanban**: Visual workflow
- **List**: Traditional task list
- **Calendar**: Timeline view
- **Gantt**: Dependencies and timeline`,
    meta_title: 'How to Create a Project in KAZI',
    meta_description: 'Learn how to create and configure projects in KAZI.',
    keywords: ['projects', 'create', 'setup', 'tasks'],
  },
  // Time Tracking
  {
    category: 'tutorial',
    title: 'How to Track Time',
    slug: 'how-to-track-time',
    excerpt: 'Master KAZI time tracking for accurate billing.',
    content: `# How to Track Time

Accurate time tracking is essential for billing and productivity.

## Using the Timer

### Start Timer
1. Click **Time Tracking** in sidebar
2. Enter description
3. Select project
4. Click **Start**

### Stop Timer
- Click **Stop** when done
- Entry saves automatically

### Keyboard Shortcut
- Press **Ctrl/Cmd + T** from anywhere

## Manual Time Entry

1. Click **+ Manual Entry**
2. Select date
3. Enter start/end time
4. Choose project
5. Click **Save**

## Time Entry Fields

- **Duration**: Hours and minutes
- **Project**: Link to project
- **Task**: Specific task (optional)
- **Description**: What was done
- **Billable**: Mark for invoicing

## Best Practices

1. Start timer when you begin work
2. Add descriptions immediately
3. Review entries daily
4. Mark non-billable time appropriately`,
    meta_title: 'How to Track Time in KAZI',
    meta_description: 'Learn how to use KAZI time tracking features.',
    keywords: ['time-tracking', 'timer', 'billing'],
  },
  // Invoicing
  {
    category: 'tutorial',
    title: 'Creating Invoices',
    slug: 'creating-invoices',
    excerpt: 'Create professional invoices and get paid faster.',
    content: `# Creating Invoices

Get paid with professional invoices in just a few clicks.

## New Invoice

1. Go to **Invoices**
2. Click **+ New Invoice**
3. Select client
4. Set invoice date and due date

## Adding Items

### From Time Entries
1. Click **Import Time**
2. Select date range
3. Check entries to include
4. Time converts to line items

### Manual Items
1. Click **+ Add Item**
2. Enter description
3. Set quantity and rate

## Customization

- Add discounts
- Apply tax rates
- Include notes
- Attach files

## Sending

1. Click **Preview** to review
2. Click **Send Invoice**
3. Customize email message
4. Click **Send**

## Payment Options

Clients can pay via:
- Credit/debit card (Stripe)
- PayPal
- Bank transfer
- Cryptocurrency`,
    meta_title: 'How to Create Invoices in KAZI',
    meta_description: 'Step-by-step guide to creating invoices with KAZI.',
    keywords: ['invoices', 'billing', 'payments'],
  },
  // Integrations
  {
    category: 'guide',
    title: 'Connecting Stripe',
    slug: 'connecting-stripe',
    excerpt: 'Accept credit card payments by connecting Stripe.',
    content: `# Connecting Stripe

Accept credit and debit card payments from clients with Stripe.

## Setup

1. Go to **Settings > Integrations**
2. Find **Stripe**
3. Click **Connect**
4. Log into Stripe
5. Authorize KAZI

## Features

- Accept cards on invoices
- Automatic payment processing
- Payment links
- Subscription billing support

## Configuration

- Toggle Live/Test mode
- View webhook status
- Set default currency
- Configure payment methods

## Troubleshooting

**Connection failed?**
- Ensure Stripe account is verified
- Check popup blocker
- Try different browser

**Payments not processing?**
- Verify live mode is enabled
- Check Stripe dashboard
- Contact support`,
    meta_title: 'How to Connect Stripe to KAZI',
    meta_description: 'Accept credit card payments by connecting Stripe.',
    keywords: ['stripe', 'payments', 'integrations'],
  },
  {
    category: 'guide',
    title: 'Calendar Sync',
    slug: 'calendar-sync',
    excerpt: 'Sync KAZI with Google Calendar or Outlook.',
    content: `# Calendar Sync

Keep your schedule in sync with Google Calendar or Outlook.

## Google Calendar

1. Go to **Settings > Integrations**
2. Find **Google Calendar**
3. Click **Connect**
4. Sign in with Google
5. Select calendars to sync

## Outlook Calendar

1. Go to **Settings > Integrations**
2. Find **Outlook**
3. Click **Connect**
4. Sign in with Microsoft
5. Configure sync options

## Sync Options

- **One-way (KAZI → Calendar)**: KAZI events appear in calendar
- **One-way (Calendar → KAZI)**: Calendar events appear in KAZI
- **Two-way**: Full synchronization

## What Syncs

- Project deadlines
- Task due dates
- Meetings (if enabled)
- Time blocks

## Troubleshooting

**Events not syncing?**
- Check sync direction settings
- Verify calendar permissions
- Wait for sync interval
- Try manual sync`,
    meta_title: 'How to Sync Calendar with KAZI',
    meta_description: 'Sync KAZI with Google Calendar or Outlook.',
    keywords: ['calendar', 'google', 'outlook', 'integrations'],
  },
  // AI Features
  {
    category: 'guide',
    title: 'AI Writing Assistant',
    slug: 'ai-writing-assistant',
    excerpt: 'Use AI to write proposals, emails, and more.',
    content: `# AI Writing Assistant

Let AI help you write faster and better.

## Accessing AI Writer

- Click **AI** button in any text field
- Use **Ctrl/Cmd + J** shortcut
- Go to **AI Tools > Writer**

## Use Cases

### Proposals
1. Click **Generate Proposal**
2. Enter project details
3. AI creates professional proposal
4. Edit and send

### Emails
1. Select email template
2. Choose tone
3. AI drafts the email
4. Review and send

### Contracts
1. Select contract template
2. Enter party details
3. AI generates draft
4. Review with legal

## Writing Commands

In any text field:
- **/expand** - Expand text
- **/shorten** - Make concise
- **/formal** - Formal tone
- **/casual** - Casual tone
- **/proofread** - Check errors

## Tips

1. Be specific in prompts
2. Always review AI output
3. Maintain your voice
4. Use as starting point`,
    meta_title: 'KAZI AI Writing Assistant Guide',
    meta_description: 'Use AI to create proposals, emails, and contracts faster.',
    keywords: ['ai', 'writing', 'proposals', 'emails'],
  },
  // Troubleshooting
  {
    category: 'troubleshooting',
    title: 'Login Issues',
    slug: 'login-issues',
    excerpt: 'Solutions for common login problems.',
    content: `# Login Issues

Having trouble logging in? Try these solutions.

## Can't Log In

1. Check email/password for typos
2. Click "Forgot Password" to reset
3. Check if Caps Lock is on
4. Try a different browser
5. Clear browser cache

## 2FA Problems

1. Ensure device time is synced
2. Wait for new code
3. Use backup codes
4. Contact support to disable 2FA

## Session Expired

1. Log in again
2. Check "Remember Me" option
3. Disable privacy extensions
4. Enable cookies

## Account Locked

After multiple failed attempts:
1. Wait 15 minutes
2. Try password reset
3. Contact support if persistent

## Still Need Help?

Contact support@kazi.com with:
- Your account email
- Browser and device info
- Screenshots of errors`,
    meta_title: 'KAZI Login Troubleshooting',
    meta_description: 'Solutions for common KAZI login issues.',
    keywords: ['login', 'password', '2fa', 'troubleshooting'],
  },
  {
    category: 'troubleshooting',
    title: 'Timer Not Working',
    slug: 'timer-not-working',
    excerpt: 'Troubleshoot time tracking and timer issues.',
    content: `# Timer Not Working

Timer not starting or time entries missing? Try these fixes.

## Timer Won't Start

1. Refresh the page
2. Check internet connection
3. Clear browser cache
4. Disable ad blockers
5. Try incognito mode
6. Use different browser

## Time Entry Missing

1. Check date filter
2. Check project filter
3. Look in "All Projects"
4. Check if deleted
5. Verify sync completed

## Time Not Syncing

1. Refresh both devices
2. Check internet
3. Wait a few minutes
4. Log out and back in

## Browser Extension Issues

1. Update extension
2. Reinstall extension
3. Check permissions
4. Try web version

## Still Having Issues?

Contact support with:
- Browser version
- Steps to reproduce
- Screenshots`,
    meta_title: 'KAZI Timer Troubleshooting',
    meta_description: 'Fix time tracking and timer issues in KAZI.',
    keywords: ['timer', 'time-tracking', 'troubleshooting'],
  },
  // FAQ
  {
    category: 'faq',
    title: 'Frequently Asked Questions',
    slug: 'faq',
    excerpt: 'Answers to common questions about KAZI.',
    content: `# Frequently Asked Questions

## Getting Started

### What is KAZI?
KAZI is an all-in-one freelance business management platform combining project management, time tracking, invoicing, and AI tools.

### Is KAZI free?
KAZI offers a free tier with basic features. Premium plans unlock advanced features.

### What devices can I use?
KAZI works on any modern browser on desktop, tablet, and mobile.

## Account & Billing

### How do I upgrade?
Go to Settings > Billing and click "Upgrade Plan".

### Can I cancel anytime?
Yes, cancel anytime. You keep access until the billing period ends.

### Do you offer refunds?
14-day money-back guarantee for annual plans.

## Features

### How many projects can I create?
Free: 3 active projects. Pro: Unlimited.

### Does the timer work offline?
The browser extension works offline and syncs when reconnected.

### What payment methods do clients have?
Credit/debit cards, PayPal, bank transfer, or cryptocurrency.

## Security

### Is my data secure?
Yes, we use 256-bit encryption and are SOC 2 compliant.

### Can I enable 2FA?
Yes, go to Settings > Security to enable Two-Factor Authentication.

## Support

### How do I contact support?
Email: support@kazi.com
Live chat: Available in-app`,
    meta_title: 'KAZI FAQ - Frequently Asked Questions',
    meta_description: 'Answers to common questions about using KAZI.',
    keywords: ['faq', 'questions', 'help'],
  },
]

async function seedCategories(): Promise<{ created: number; skipped: number; errors: number }> {
  console.log('Seeding categories...')
  let created = 0, skipped = 0, errors = 0

  for (const cat of categories) {
    // Check if category already exists
    const { data: existing } = await supabase
      .from('help_categories')
      .select('id')
      .eq('slug', cat.slug)
      .single()

    if (existing) {
      console.log(`⏭ Category already exists: ${cat.name}`)
      skipped++
      continue
    }

    const { error } = await supabase
      .from('help_categories')
      .insert({
        user_id: DEMO_USER_ID,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        color: cat.color,
        sort_order: cat.sort_order,
        status: 'active',
        article_count: 0,
      })

    if (error) {
      console.error(`Error creating category ${cat.name}:`, error.message)
      errors++
    } else {
      console.log(`✓ Created category: ${cat.name}`)
      created++
    }
  }

  return { created, skipped, errors }
}

async function seedArticles(): Promise<{ created: number; skipped: number; errors: number }> {
  console.log('\nSeeding articles...')
  let created = 0, skipped = 0, errors = 0

  for (const article of articles) {
    // Check if article already exists
    const { data: existing } = await supabase
      .from('help_articles')
      .select('id')
      .eq('slug', article.slug)
      .single()

    if (existing) {
      console.log(`⏭ Article already exists: ${article.title}`)
      skipped++
      continue
    }

    const { error } = await supabase
      .from('help_articles')
      .insert({
        user_id: DEMO_USER_ID,
        title: article.title,
        slug: article.slug,
        content: article.content,
        excerpt: article.excerpt,
        category: article.category,
        status: 'published',
        published_at: new Date().toISOString(),
        views: Math.floor(Math.random() * 500) + 100,
        helpful_count: Math.floor(Math.random() * 50) + 10,
        not_helpful_count: Math.floor(Math.random() * 5),
        read_time_minutes: Math.ceil(article.content.length / 1000),
        meta_title: article.meta_title,
        meta_description: article.meta_description,
        keywords: article.keywords,
      })

    if (error) {
      console.error(`Error creating article ${article.title}:`, error.message)
      errors++
    } else {
      console.log(`✓ Created article: ${article.title}`)
      created++
    }
  }

  return { created, skipped, errors }
}

async function main() {
  console.log('=== KAZI Help Center Seed Script ===\n')

  try {
    const catStats = await seedCategories()
    const artStats = await seedArticles()

    console.log('\n=== Seeding Complete ===')
    console.log('\nCategories:')
    console.log(`  ✓ Created: ${catStats.created}`)
    console.log(`  ⏭ Skipped: ${catStats.skipped}`)
    if (catStats.errors > 0) console.log(`  ✗ Errors: ${catStats.errors}`)

    console.log('\nArticles:')
    console.log(`  ✓ Created: ${artStats.created}`)
    console.log(`  ⏭ Skipped: ${artStats.skipped}`)
    if (artStats.errors > 0) console.log(`  ✗ Errors: ${artStats.errors}`)

    console.log('\nTotal in database: up to', categories.length, 'categories and', articles.length, 'articles')
  } catch (error) {
    console.error('Seeding failed:', error)
    process.exit(1)
  }
}

main()
