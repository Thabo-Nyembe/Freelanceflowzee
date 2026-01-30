#!/usr/bin/env node

/**
 * Comprehensive Community Hub, CV Portfolio & Profile Seeder
 * Seeds demo data for investor showcase
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

// Valid UUID generator with hex prefix codes
const uuid = (prefix, num) => {
  const prefixCodes = {
    'commember': 'a1a1a1a1',
    'compost': 'a2a2a2a2',
    'comgroup': 'a3a3a3a3',
    'grpmember': 'a4a4a4a4',
    'comevent': 'a5a5a5a5',
    'connect': 'a6a6a6a6',
    'postlike': 'a7a7a7a7',
    'comment': 'a8a8a8a8',
    'evtattend': 'a9a9a9a9',
    'portfolio': 'b1b1b1b1',
    'pfproject': 'b2b2b2b2',
    'pfskill': 'b3b3b3b3',
    'pfexp': 'b4b4b4b4',
    'pfedu': 'b5b5b5b5',
    'pfcert': 'b6b6b6b6',
    'pftest': 'b7b7b7b7',
    'pfanalytics': 'b8b8b8b8',
    'pftheme': 'b9b9b9b9',
    'profile': 'c1c1c1c1',
    'skill': 'c2c2c2c2',
    'exp': 'c3c3c3c3',
    'edu': 'c4c4c4c4',
    'pfitem': 'c5c5c5c5',
    'social': 'c6c6c6c6',
    'settings': 'c7c7c7c7',
    'stats': 'c8c8c8c8',
    'achieve': 'c9c9c9c9',
    'otheruser': 'd1d1d1d1'
  };
  const code = prefixCodes[prefix] || 'ffffffff';
  return `${code}-0000-4000-8000-${String(num).padStart(12, '0')}`;
};

const daysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
const futureDate = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

async function checkTableSchema(tableName) {
  const { data, error } = await supabase.from(tableName).select('*').limit(1);
  if (error && error.message.includes('does not exist')) {
    return null;
  }
  return data;
}

async function seedCommunityHub() {
  console.log('\n--- Seeding Community Hub ---\n');

  // Check if community_members table exists
  const memberCheck = await checkTableSchema('community_members');
  if (memberCheck === null) {
    console.log('community_members table does not exist, skipping community hub seeding');
    return { members: 0, posts: 0, groups: 0, events: 0 };
  }

  // 1. Create community member for demo user
  const communityMember = {
    id: uuid('commember', 1),
    user_id: DEMO_USER_ID,
    name: 'Alex Rivera',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    title: 'Senior Full-Stack Developer & Tech Lead',
    location: 'San Francisco, CA',
    skills: ['React', 'Node.js', 'TypeScript', 'Python', 'AWS', 'GraphQL', 'PostgreSQL', 'Docker', 'Kubernetes'],
    rating: 4.95,
    is_online: true,
    bio: 'Passionate technologist with 10+ years of experience building scalable applications. Led teams at Google, Stripe, and multiple successful startups. Open source contributor and tech community mentor.',
    total_projects: 127,
    total_earnings: 485000.00,
    completion_rate: 98,
    response_time: '< 1 hour',
    languages: ['English', 'Spanish', 'Portuguese'],
    certifications: ['AWS Solutions Architect', 'Google Cloud Professional', 'Kubernetes Administrator'],
    portfolio_url: 'https://alexrivera.dev',
    is_connected: false,
    is_premium: true,
    is_verified: true,
    is_following: false,
    followers: 2847,
    following: 342,
    posts_count: 156,
    category: 'freelancer',
    availability: 'available',
    hourly_rate: 175.00,
    currency: 'USD',
    timezone: 'America/Los_Angeles',
    badges: ['Top Rated', 'Rising Star', 'Expert', 'Community Leader', '100+ Projects'],
    achievements: ['First $100K Earned', 'Perfect Rating Streak', 'Mentor of the Year', 'Open Source Champion'],
    endorsements: 312,
    testimonials: 89
  };

  const { error: memberError } = await supabase
    .from('community_members')
    .upsert(communityMember, { onConflict: 'user_id' });

  if (memberError) {
    console.log('Community member error:', memberError.message);
  } else {
    console.log('Community member created');
  }

  // 2. Create additional community members (other users)
  const otherMembers = [];
  const memberNames = [
    { name: 'Sarah Chen', title: 'UX/UI Designer', skills: ['Figma', 'Sketch', 'Adobe XD'], location: 'New York, NY' },
    { name: 'Marcus Johnson', title: 'DevOps Engineer', skills: ['AWS', 'Terraform', 'Docker'], location: 'Austin, TX' },
    { name: 'Emma Williams', title: 'Mobile Developer', skills: ['React Native', 'Swift', 'Kotlin'], location: 'Seattle, WA' },
    { name: 'David Kim', title: 'Data Scientist', skills: ['Python', 'TensorFlow', 'PyTorch'], location: 'Boston, MA' },
    { name: 'Lisa Martinez', title: 'Product Manager', skills: ['Agile', 'Scrum', 'JIRA'], location: 'Denver, CO' },
    { name: 'James Thompson', title: 'Backend Developer', skills: ['Go', 'Rust', 'PostgreSQL'], location: 'Chicago, IL' },
    { name: 'Priya Patel', title: 'Frontend Developer', skills: ['Vue.js', 'Angular', 'TypeScript'], location: 'Los Angeles, CA' },
    { name: 'Michael Brown', title: 'Cloud Architect', skills: ['Azure', 'GCP', 'Kubernetes'], location: 'Miami, FL' },
    { name: 'Jennifer Lee', title: 'AI Engineer', skills: ['NLP', 'Computer Vision', 'MLOps'], location: 'San Jose, CA' },
    { name: 'Robert Garcia', title: 'Security Engineer', skills: ['Penetration Testing', 'SIEM', 'SOC'], location: 'Washington, DC' }
  ];

  for (let i = 0; i < memberNames.length; i++) {
    const m = memberNames[i];
    otherMembers.push({
      id: uuid('commember', 100 + i),
      user_id: uuid('otheruser', 100 + i),
      name: m.name,
      avatar: `https://randomuser.me/api/portraits/${i % 2 === 0 ? 'men' : 'women'}/${20 + i}.jpg`,
      title: m.title,
      location: m.location,
      skills: m.skills,
      rating: 4.5 + Math.random() * 0.5,
      is_online: Math.random() > 0.5,
      bio: `Experienced ${m.title} with a passion for innovation.`,
      total_projects: Math.floor(20 + Math.random() * 80),
      total_earnings: Math.floor(50000 + Math.random() * 200000),
      completion_rate: Math.floor(85 + Math.random() * 15),
      response_time: '< 2 hours',
      languages: ['English'],
      certifications: [],
      is_premium: Math.random() > 0.7,
      is_verified: Math.random() > 0.5,
      followers: Math.floor(100 + Math.random() * 1000),
      following: Math.floor(50 + Math.random() * 200),
      posts_count: Math.floor(10 + Math.random() * 50),
      category: 'freelancer',
      availability: ['available', 'busy', 'away'][Math.floor(Math.random() * 3)],
      hourly_rate: Math.floor(50 + Math.random() * 150),
      currency: 'USD',
      timezone: 'America/New_York',
      badges: ['Verified', 'Top Rated'].slice(0, Math.floor(Math.random() * 2) + 1),
      achievements: [],
      endorsements: Math.floor(20 + Math.random() * 100),
      testimonials: Math.floor(5 + Math.random() * 30)
    });
  }

  const { error: otherMembersError } = await supabase
    .from('community_members')
    .upsert(otherMembers, { onConflict: 'id' });

  if (otherMembersError) {
    console.log('Other members error:', otherMembersError.message);
  } else {
    console.log(`Created ${otherMembers.length} other community members`);
  }

  // 3. Create community posts
  const postContents = [
    { content: 'Just shipped a new AI-powered feature that increased user engagement by 40%! The key was combining GPT-4 with our custom recommendation engine. Happy to share the architecture if anyone is interested. #AI #ProductDevelopment', type: 'text', tags: ['AI', 'Engineering', 'Startup'] },
    { content: 'Looking for a React Native developer for a 3-month contract. Building a fintech app with real-time trading capabilities. Must have experience with WebSocket and Redux Toolkit. DM if interested! #Hiring #ReactNative', type: 'job', tags: ['Hiring', 'Mobile', 'Fintech'] },
    { content: 'Free workshop this Friday: "Building Scalable Microservices with Node.js and Kubernetes". Limited spots available. Link in comments! #Workshop #NodeJS #Kubernetes', type: 'event', tags: ['Workshop', 'Learning', 'DevOps'] },
    { content: 'My new open source project just hit 1000 stars on GitHub! It\'s a lightweight state management library for React. Check it out: github.com/alexrivera/zustand-lite #OpenSource #React', type: 'showcase', tags: ['OpenSource', 'React', 'Achievement'] },
    { content: 'Hot take: TypeScript strict mode should be the default for all new projects. The initial friction is worth the long-term maintainability. Agree or disagree? #TypeScript #BestPractices', type: 'text', tags: ['TypeScript', 'Opinion', 'CodeQuality'] },
    { content: 'Just completed the AWS Solutions Architect Professional certification! Here are my top study resources and tips for anyone preparing... #AWS #Certification #CloudComputing', type: 'text', tags: ['AWS', 'Certification', 'Learning'] },
    { content: 'Exciting news! Our startup just closed a $5M Series A round. We\'re hiring across all engineering roles. Join us in revolutionizing the freelance economy! #Startup #Funding #Hiring', type: 'text', tags: ['Startup', 'Funding', 'News'] },
    { content: 'Best debugging session ever: spent 4 hours tracking a bug only to find it was a missing semicolon in a YAML file. DevOps life! #DevOps #Debugging #Humor', type: 'text', tags: ['DevOps', 'Humor', 'Stories'] },
    { content: 'Poll: What\'s your preferred backend framework in 2024? Let me know in the comments! #Backend #Programming #Poll', type: 'poll', tags: ['Poll', 'Backend', 'Community'] },
    { content: 'Milestone: 100 successful projects completed on FreeFlow! Thank you to all my amazing clients. Here\'s to the next 100! #Milestone #Freelancing #Grateful', type: 'text', tags: ['Milestone', 'Freelancing', 'Success'] },
    { content: 'New blog post: "How I Increased My Freelance Rate by 3x in 2 Years" - sharing the exact strategies that worked for me. Link in bio! #Freelancing #CareerGrowth', type: 'link', tags: ['Freelancing', 'Tips', 'Career'] },
    { content: 'Working on a new side project: an AI-powered code review tool. Early beta testers needed! DM me if you\'re interested in trying it out. #AI #CodeReview #SideProject', type: 'text', tags: ['AI', 'SideProject', 'Beta'] }
  ];

  const posts = [];
  for (let i = 0; i < postContents.length; i++) {
    const p = postContents[i];
    posts.push({
      id: uuid('compost', i + 1),
      author_id: uuid('commember', 1), // Demo user's posts
      content: p.content,
      type: p.type,
      visibility: 'public',
      likes_count: Math.floor(50 + Math.random() * 200),
      comments_count: Math.floor(5 + Math.random() * 30),
      shares_count: Math.floor(2 + Math.random() * 20),
      bookmarks_count: Math.floor(10 + Math.random() * 50),
      views_count: Math.floor(200 + Math.random() * 1000),
      tags: p.tags,
      hashtags: p.tags.map(t => `#${t}`),
      is_pinned: i === 0,
      is_promoted: i < 3,
      created_at: daysAgo(i * 3)
    });
  }

  // Add posts from other members
  for (let i = 0; i < 20; i++) {
    posts.push({
      id: uuid('compost', 100 + i),
      author_id: uuid('commember', 100 + (i % 10)),
      content: `Great insights shared today at the community meetup! Always learning something new. #Community #Networking #Tech`,
      type: 'text',
      visibility: 'public',
      likes_count: Math.floor(10 + Math.random() * 100),
      comments_count: Math.floor(2 + Math.random() * 15),
      shares_count: Math.floor(1 + Math.random() * 10),
      bookmarks_count: Math.floor(5 + Math.random() * 25),
      views_count: Math.floor(100 + Math.random() * 500),
      tags: ['Community', 'Networking'],
      hashtags: ['#Community', '#Networking'],
      created_at: daysAgo(Math.floor(Math.random() * 30))
    });
  }

  const { error: postsError } = await supabase
    .from('community_posts')
    .upsert(posts, { onConflict: 'id' });

  if (postsError) {
    console.log('Posts error:', postsError.message);
  } else {
    console.log(`Created ${posts.length} community posts`);
  }

  // 4. Create community groups
  const groups = [
    { name: 'React Developers Hub', description: 'A community for React enthusiasts to share knowledge, best practices, and job opportunities.', category: 'Technology', member_count: 4523, type: 'public' },
    { name: 'Freelance Success Stories', description: 'Share and celebrate your freelancing wins, big or small!', category: 'Career', member_count: 2891, type: 'public' },
    { name: 'AI & Machine Learning', description: 'Discuss the latest in AI, ML, and their applications in software development.', category: 'Technology', member_count: 3672, type: 'public' },
    { name: 'Startup Founders Network', description: 'Connect with fellow founders, share experiences, and get advice.', category: 'Business', member_count: 1847, type: 'private' },
    { name: 'Remote Work Best Practices', description: 'Tips and tools for effective remote work and distributed teams.', category: 'Lifestyle', member_count: 5234, type: 'public' },
    { name: 'Design Systems Guild', description: 'For designers and developers building and maintaining design systems.', category: 'Design', member_count: 1456, type: 'public' },
    { name: 'Cloud Architecture Experts', description: 'Deep dive into cloud architecture, AWS, Azure, GCP, and more.', category: 'Technology', member_count: 2341, type: 'public' },
    { name: 'Tech Interview Prep', description: 'Help each other prepare for technical interviews at top companies.', category: 'Career', member_count: 6789, type: 'public' }
  ];

  const communityGroups = groups.map((g, i) => ({
    id: uuid('comgroup', i + 1),
    name: g.name,
    description: g.description,
    avatar: `https://source.unsplash.com/100x100/?${g.category.toLowerCase()}`,
    cover_image: `https://source.unsplash.com/800x200/?${g.category.toLowerCase()}`,
    category: g.category,
    type: g.type,
    member_count: g.member_count,
    admin_count: Math.floor(2 + Math.random() * 5),
    posts_count: Math.floor(100 + Math.random() * 500),
    is_verified: Math.random() > 0.5,
    is_premium: Math.random() > 0.7,
    rating: 4.5 + Math.random() * 0.5,
    tags: [g.category, 'Community', 'Professional'],
    created_at: daysAgo(180 + Math.floor(Math.random() * 180))
  }));

  const { error: groupsError } = await supabase
    .from('community_groups')
    .upsert(communityGroups, { onConflict: 'id' });

  if (groupsError) {
    console.log('Groups error:', groupsError.message);
  } else {
    console.log(`Created ${communityGroups.length} community groups`);
  }

  // 5. Create group memberships for demo user
  const groupMemberships = communityGroups.slice(0, 5).map((g, i) => ({
    id: uuid('grpmember', i + 1),
    group_id: g.id,
    member_id: uuid('commember', 1),
    role: i === 0 ? 'admin' : 'member',
    is_pending: false,
    joined_at: daysAgo(90 + Math.floor(Math.random() * 90))
  }));

  const { error: membershipsError } = await supabase
    .from('community_group_members')
    .upsert(groupMemberships, { onConflict: 'id' });

  if (membershipsError) {
    console.log('Memberships error:', membershipsError.message);
  } else {
    console.log(`Created ${groupMemberships.length} group memberships`);
  }

  // 6. Create community events
  const events = [
    { title: 'React Conf 2024 Watch Party', description: 'Join us for a live watch party of React Conf with Q&A and discussions.', category: 'Technology', type: 'online', location: 'Zoom', price: 0 },
    { title: 'Freelance Networking Mixer', description: 'Monthly networking event for freelancers in the SF Bay Area.', category: 'Networking', type: 'offline', location: 'San Francisco, CA', price: 15 },
    { title: 'AI Workshop: Building with GPT-4', description: 'Hands-on workshop on integrating GPT-4 into your applications.', category: 'Workshop', type: 'hybrid', location: 'Austin, TX + Online', price: 49 },
    { title: 'Design Systems Conference', description: 'Annual conference on building and scaling design systems.', category: 'Design', type: 'online', location: 'Virtual', price: 99 },
    { title: 'Startup Pitch Night', description: 'Present your startup idea and get feedback from investors and peers.', category: 'Business', type: 'offline', location: 'New York, NY', price: 0 }
  ];

  const communityEvents = events.map((e, i) => ({
    id: uuid('comevent', i + 1),
    organizer_id: uuid('commember', 1),
    title: e.title,
    description: e.description,
    category: e.category,
    type: e.type,
    event_date: futureDate(7 + i * 14),
    end_date: futureDate(7 + i * 14 + 0.25),
    location: e.location,
    max_attendees: 100 + i * 50,
    price: e.price,
    currency: 'USD',
    tags: [e.category, 'Community', 'Learning'],
    attendee_count: Math.floor(20 + Math.random() * 80),
    interested_count: Math.floor(50 + Math.random() * 150),
    views_count: Math.floor(200 + Math.random() * 500),
    shares_count: Math.floor(10 + Math.random() * 50),
    created_at: daysAgo(30)
  }));

  const { error: eventsError } = await supabase
    .from('community_events')
    .upsert(communityEvents, { onConflict: 'id' });

  if (eventsError) {
    console.log('Events error:', eventsError.message);
  } else {
    console.log(`Created ${communityEvents.length} community events`);
  }

  // 7. Create connections
  const connections = [];
  for (let i = 0; i < 10; i++) {
    connections.push({
      id: uuid('connect', i + 1),
      requester_id: uuid('commember', 1),
      recipient_id: uuid('commember', 100 + i),
      status: ['accepted', 'accepted', 'accepted', 'pending'][Math.floor(Math.random() * 4)],
      created_at: daysAgo(60 + Math.floor(Math.random() * 60)),
      accepted_at: daysAgo(30 + Math.floor(Math.random() * 30))
    });
  }

  const { error: connectionsError } = await supabase
    .from('community_connections')
    .upsert(connections, { onConflict: 'id' });

  if (connectionsError) {
    console.log('Connections error:', connectionsError.message);
  } else {
    console.log(`Created ${connections.length} connections`);
  }

  // 8. Create post likes and comments
  const postLikes = [];
  for (let i = 0; i < 12; i++) {
    for (let j = 0; j < 5; j++) {
      postLikes.push({
        id: uuid('postlike', i * 10 + j),
        post_id: uuid('compost', i + 1),
        user_id: uuid('commember', 100 + j),
        created_at: daysAgo(Math.floor(Math.random() * 30))
      });
    }
  }

  const { error: likesError } = await supabase
    .from('community_post_likes')
    .upsert(postLikes, { onConflict: 'id' });

  if (likesError) {
    console.log('Likes error:', likesError.message);
  } else {
    console.log(`Created ${postLikes.length} post likes`);
  }

  // Comments
  const commentTexts = [
    'Great insights! Thanks for sharing.',
    'This is exactly what I needed to hear today.',
    'Congrats on the achievement! Well deserved.',
    'Would love to learn more about this approach.',
    'Bookmarked for later. Super helpful!',
    'Can you share more details on the implementation?',
    'This resonates with my experience too.',
    'Amazing work! Keep it up!'
  ];

  const comments = [];
  for (let i = 0; i < 12; i++) {
    for (let j = 0; j < 3; j++) {
      comments.push({
        id: uuid('comment', i * 10 + j),
        post_id: uuid('compost', i + 1),
        author_id: uuid('commember', 100 + (j % 10)),
        content: commentTexts[Math.floor(Math.random() * commentTexts.length)],
        likes_count: Math.floor(Math.random() * 10),
        created_at: daysAgo(Math.floor(Math.random() * 30))
      });
    }
  }

  const { error: commentsError } = await supabase
    .from('community_comments')
    .upsert(comments, { onConflict: 'id' });

  if (commentsError) {
    console.log('Comments error:', commentsError.message);
  } else {
    console.log(`Created ${comments.length} comments`);
  }

  return { members: 11, posts: posts.length, groups: communityGroups.length, events: communityEvents.length };
}

async function seedCVPortfolio() {
  console.log('\n--- Seeding CV Portfolio ---\n');

  // Check schema first
  const { data: schemaCheck } = await supabase.from('portfolios').select('*').limit(1);

  // 1. Create portfolio - adjust based on actual schema
  const portfolio = {
    id: uuid('portfolio', 1),
    user_id: DEMO_USER_ID,
    slug: 'alex-rivera',
    title: 'Alex Rivera',
    subtitle: 'Senior Full-Stack Developer & Tech Lead',
    bio: `I'm a passionate software engineer with over 10 years of experience building scalable, user-centric applications. I've led engineering teams at Google, Stripe, and multiple successful startups, shipping products used by millions of users worldwide.

My expertise spans the full stack, from designing intuitive UIs with React and TypeScript to architecting robust backend systems with Node.js, Python, and cloud services.`,
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    cover_image_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200',
    email: 'alex@freeflow.io',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    website: 'https://alexrivera.dev',
    timezone: 'America/Los_Angeles',
    github_url: 'https://github.com/alexrivera',
    linkedin_url: 'https://linkedin.com/in/alexrivera',
    twitter_url: 'https://twitter.com/alexrivera',
    is_public: true,
    show_contact: true,
    show_social: true,
    theme: 'auto',
    last_published_at: daysAgo(1)
  };

  const { error: portfolioError } = await supabase
    .from('portfolios')
    .upsert(portfolio, { onConflict: 'id' });

  if (portfolioError) {
    console.log('Portfolio error:', portfolioError.message);
  } else {
    console.log('Portfolio created');
  }

  // 2. Portfolio Projects - without enum columns
  const projects = [
    {
      title: 'FreeFlow Platform',
      description: 'A comprehensive freelance management platform with invoicing, time tracking, project management, and AI-powered insights. Built with Next.js, TypeScript, and Supabase.',
      category: 'Web Application',
      technologies: ['Next.js', 'TypeScript', 'Supabase', 'TailwindCSS', 'OpenAI'],
      live_url: 'https://freeflow.io',
      role: 'Technical Co-founder & Lead Developer',
      team_size: 8,
      duration: '18 months',
      highlights: ['$250K+ ARR achieved', 'Used by 5000+ freelancers', '99.9% uptime'],
      featured: true
    },
    {
      title: 'AI Code Review Tool',
      description: 'An intelligent code review assistant that uses GPT-4 to provide actionable feedback on pull requests.',
      category: 'Developer Tools',
      technologies: ['Python', 'FastAPI', 'OpenAI', 'GitHub API', 'Docker'],
      github_url: 'https://github.com/alexrivera/ai-code-review',
      role: 'Creator & Maintainer',
      team_size: 1,
      duration: '6 months',
      highlights: ['5000+ GitHub stars', 'Used by 200+ teams'],
      featured: true
    },
    {
      title: 'Real-time Collaboration Suite',
      description: 'A Google Docs-like collaboration platform with real-time cursors, comments, and version history.',
      category: 'Enterprise Software',
      technologies: ['React', 'Yjs', 'WebSocket', 'Redis', 'PostgreSQL'],
      role: 'Lead Engineer',
      team_size: 5,
      duration: '12 months',
      highlights: ['Sub-50ms sync latency', 'Enterprise security certified'],
      featured: true
    },
    {
      title: 'Crypto Portfolio Tracker',
      description: 'A mobile app for tracking cryptocurrency investments with real-time prices.',
      category: 'Mobile App',
      technologies: ['React Native', 'Node.js', 'CoinGecko API', 'Firebase'],
      live_url: 'https://cryptotracker.app',
      role: 'Full-Stack Developer',
      team_size: 3,
      duration: '8 months',
      highlights: ['50K+ downloads', '4.8 star rating'],
      featured: false
    }
  ];

  const portfolioProjects = projects.map((p, i) => ({
    id: uuid('pfproject', i + 1),
    portfolio_id: uuid('portfolio', 1),
    title: p.title,
    description: p.description,
    image_url: `https://source.unsplash.com/800x600/?coding,technology`,
    category: p.category,
    live_url: p.live_url,
    github_url: p.github_url,
    technologies: p.technologies,
    duration: p.duration,
    role: p.role,
    team_size: p.team_size,
    highlights: p.highlights,
    views: Math.floor(500 + Math.random() * 2000),
    likes: Math.floor(50 + Math.random() * 200),
    featured: p.featured,
    display_order: i,
    created_at: daysAgo(180 + i * 30)
  }));

  const { error: projectsError } = await supabase
    .from('portfolio_projects')
    .upsert(portfolioProjects, { onConflict: 'id' });

  if (projectsError) {
    console.log('Portfolio projects error:', projectsError.message);
  } else {
    console.log(`Created ${portfolioProjects.length} portfolio projects`);
  }

  // 3. Portfolio Skills - without enum
  const skillsData = [
    { name: 'React', proficiency: 5, years: 8.0 },
    { name: 'TypeScript', proficiency: 5, years: 6.0 },
    { name: 'Node.js', proficiency: 5, years: 9.0 },
    { name: 'Python', proficiency: 4, years: 7.0 },
    { name: 'PostgreSQL', proficiency: 5, years: 10.0 },
    { name: 'AWS', proficiency: 4, years: 6.0 },
    { name: 'Docker', proficiency: 4, years: 5.0 },
    { name: 'Kubernetes', proficiency: 4, years: 4.0 },
    { name: 'GraphQL', proficiency: 4, years: 5.0 },
    { name: 'Git', proficiency: 5, years: 10.0 },
    { name: 'Team Leadership', proficiency: 5, years: 6.0 },
    { name: 'Technical Writing', proficiency: 4, years: 8.0 }
  ];

  const portfolioSkills = skillsData.map((s, i) => ({
    id: uuid('pfskill', i + 1),
    portfolio_id: uuid('portfolio', 1),
    name: s.name,
    proficiency: s.proficiency,
    years_of_experience: s.years,
    last_used: '2024',
    endorsed: Math.random() > 0.5,
    endorsement_count: Math.floor(10 + Math.random() * 50),
    trending: Math.random() > 0.8
  }));

  const { error: skillsError } = await supabase
    .from('portfolio_skills')
    .upsert(portfolioSkills, { onConflict: 'id' });

  if (skillsError) {
    console.log('Portfolio skills error:', skillsError.message);
  } else {
    console.log(`Created ${portfolioSkills.length} portfolio skills`);
  }

  // 4. Portfolio Experience - without enum
  const experienceData = [
    {
      company_name: 'FreeFlow',
      position: 'Technical Co-founder & CTO',
      location: 'San Francisco, CA',
      start_date: '2023-01-01',
      is_current: true,
      description: 'Leading the technical vision and engineering team for FreeFlow.',
      responsibilities: ['Architecting scalable systems', 'Leading a team of 8 engineers'],
      achievements: ['Grew to $250K+ ARR in 12 months'],
      technologies: ['Next.js', 'TypeScript', 'Supabase']
    },
    {
      company_name: 'Stripe',
      position: 'Staff Software Engineer',
      location: 'San Francisco, CA',
      start_date: '2020-03-01',
      end_date: '2022-12-31',
      description: 'Led the development of payment infrastructure.',
      responsibilities: ['Designing payment APIs', 'Leading infrastructure projects'],
      achievements: ['Reduced payment latency by 40%'],
      technologies: ['Ruby', 'Go', 'PostgreSQL']
    },
    {
      company_name: 'Google',
      position: 'Senior Software Engineer',
      location: 'Mountain View, CA',
      start_date: '2017-06-01',
      end_date: '2020-02-28',
      description: 'Worked on Google Cloud Platform.',
      responsibilities: ['Developing cloud services', 'Building developer tools'],
      achievements: ['Launched 3 major GCP features'],
      technologies: ['Java', 'Python', 'Go']
    }
  ];

  const portfolioExperience = experienceData.map((e, i) => ({
    id: uuid('pfexp', i + 1),
    portfolio_id: uuid('portfolio', 1),
    company_name: e.company_name,
    company_logo_url: `https://logo.clearbit.com/${e.company_name.toLowerCase()}.com`,
    industry: 'Technology',
    position: e.position,
    location: e.location,
    start_date: e.start_date,
    end_date: e.end_date || null,
    is_current: e.is_current || false,
    description: e.description,
    responsibilities: e.responsibilities,
    achievements: e.achievements,
    technologies: e.technologies,
    display_order: i
  }));

  const { error: expError } = await supabase
    .from('portfolio_experience')
    .upsert(portfolioExperience, { onConflict: 'id' });

  if (expError) {
    console.log('Portfolio experience error:', expError.message);
  } else {
    console.log(`Created ${portfolioExperience.length} experience entries`);
  }

  // 5. Portfolio Education
  const educationData = [
    {
      institution_name: 'Stanford University',
      location: 'Stanford, CA',
      degree: 'Master of Science',
      field_of_study: 'Computer Science',
      start_date: '2012-09-01',
      end_date: '2014-06-30',
      gpa: '3.9',
      honors: ['Distinction', 'Research Fellowship'],
      achievements: ['Published 2 papers on distributed systems']
    },
    {
      institution_name: 'UC Berkeley',
      location: 'Berkeley, CA',
      degree: 'Bachelor of Science',
      field_of_study: 'EECS',
      start_date: '2008-09-01',
      end_date: '2012-05-31',
      gpa: '3.8',
      honors: ['Cum Laude', 'Dean\'s List'],
      achievements: ['Hackathon winner (3x)']
    }
  ];

  const portfolioEducation = educationData.map((e, i) => ({
    id: uuid('pfedu', i + 1),
    portfolio_id: uuid('portfolio', 1),
    institution_name: e.institution_name,
    institution_logo_url: `https://logo.clearbit.com/stanford.edu`,
    location: e.location,
    degree: e.degree,
    field_of_study: e.field_of_study,
    start_date: e.start_date,
    end_date: e.end_date,
    is_current: false,
    gpa: e.gpa,
    honors: e.honors,
    achievements: e.achievements,
    display_order: i
  }));

  const { error: eduError } = await supabase
    .from('portfolio_education')
    .upsert(portfolioEducation, { onConflict: 'id' });

  if (eduError) {
    console.log('Portfolio education error:', eduError.message);
  } else {
    console.log(`Created ${portfolioEducation.length} education entries`);
  }

  // 6. Portfolio Certifications
  const certifications = [
    { title: 'AWS Solutions Architect Professional', issuer: 'Amazon Web Services', issue_date: '2023-06-15', expiry_date: '2026-06-15', credential_id: 'AWS-SAP-123456', verified: true },
    { title: 'Google Cloud Professional Cloud Architect', issuer: 'Google Cloud', issue_date: '2022-11-20', credential_id: 'GCP-PCA-789012', verified: true },
    { title: 'Kubernetes Administrator (CKA)', issuer: 'CNCF', issue_date: '2023-03-10', credential_id: 'CKA-345678', verified: true }
  ];

  const portfolioCertifications = certifications.map((c, i) => ({
    id: uuid('pfcert', i + 1),
    portfolio_id: uuid('portfolio', 1),
    title: c.title,
    issuer: c.issuer,
    issue_date: c.issue_date,
    expiry_date: c.expiry_date || null,
    credential_id: c.credential_id,
    verified: c.verified,
    description: `Professional certification in ${c.title.split(' ').slice(-2).join(' ').toLowerCase()}.`,
    display_order: i
  }));

  const { error: certError } = await supabase
    .from('portfolio_certifications')
    .upsert(portfolioCertifications, { onConflict: 'id' });

  if (certError) {
    console.log('Certifications error:', certError.message);
  } else {
    console.log(`Created ${portfolioCertifications.length} certifications`);
  }

  // 7. Portfolio Testimonials
  const testimonials = [
    { author: 'Sarah Chen', title: 'VP of Engineering', company: 'Stripe', content: 'Alex is one of the most talented engineers I\'ve worked with.', relationship: 'manager', rating: 5 },
    { author: 'Michael Thompson', title: 'CEO', company: 'TechStartup', content: 'Working with Alex was transformative for our company.', relationship: 'client', rating: 5 },
    { author: 'David Kim', title: 'Senior Engineer', company: 'Google', content: 'Alex\'s code reviews were legendary.', relationship: 'colleague', rating: 5 }
  ];

  const portfolioTestimonials = testimonials.map((t, i) => ({
    id: uuid('pftest', i + 1),
    portfolio_id: uuid('portfolio', 1),
    author_name: t.author,
    author_title: t.title,
    author_company: t.company,
    author_avatar_url: `https://randomuser.me/api/portraits/${i % 2 === 0 ? 'women' : 'men'}/${30 + i}.jpg`,
    content: t.content,
    rating: t.rating,
    relationship: t.relationship,
    featured: i < 2,
    approved: true,
    display_order: i
  }));

  const { error: testError } = await supabase
    .from('portfolio_testimonials')
    .upsert(portfolioTestimonials, { onConflict: 'id' });

  if (testError) {
    console.log('Testimonials error:', testError.message);
  } else {
    console.log(`Created ${portfolioTestimonials.length} testimonials`);
  }

  // 8. Portfolio Analytics
  const analytics = {
    id: uuid('pfanalytics', 1),
    portfolio_id: uuid('portfolio', 1),
    total_views: 15847,
    unique_visitors: 8234,
    project_views: 42156,
    contact_clicks: 1247,
    social_clicks: 3891,
    cv_downloads: 567,
    share_count: 234,
    avg_time_on_page: 185,
    bounce_rate: 32.5,
    top_projects: ['FreeFlow Platform', 'AI Code Review Tool'],
    top_skills: ['React', 'TypeScript', 'Node.js'],
    visitor_countries: { US: 4521, UK: 1234, Germany: 892 }
  };

  const { error: analyticsError } = await supabase
    .from('portfolio_analytics')
    .upsert(analytics, { onConflict: 'id' });

  if (analyticsError) {
    console.log('Analytics error:', analyticsError.message);
  } else {
    console.log('Portfolio analytics created');
  }

  return { projects: portfolioProjects.length, skills: portfolioSkills.length, experience: portfolioExperience.length, certifications: portfolioCertifications.length };
}

async function seedUserProfile() {
  console.log('\n--- Seeding User Profile ---\n');

  // 1. User Profile - minimal fields
  const userProfile = {
    id: uuid('profile', 1),
    user_id: DEMO_USER_ID,
    first_name: 'Alex',
    last_name: 'Rivera',
    display_name: 'Alex Rivera',
    email: 'alex@freeflow.io',
    phone: '+1 (555) 123-4567',
    bio: 'Passionate software engineer with 10+ years of experience building scalable applications.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    cover_image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200',
    location: 'San Francisco, CA',
    timezone: 'America/Los_Angeles',
    website: 'https://alexrivera.dev',
    company: 'FreeFlow',
    title: 'Technical Co-founder & CTO',
    status: 'active',
    email_verified: true,
    phone_verified: true
  };

  const { error: profileError } = await supabase
    .from('user_profiles')
    .upsert(userProfile, { onConflict: 'user_id' });

  if (profileError) {
    console.log('Profile error:', profileError.message);
  } else {
    console.log('User profile created');
  }

  // 2. Skills - without enum
  const profileSkills = [
    { name: 'JavaScript', category: 'Programming', years: 10, endorsements: 156 },
    { name: 'TypeScript', category: 'Programming', years: 6, endorsements: 134 },
    { name: 'React', category: 'Frontend', years: 8, endorsements: 189 },
    { name: 'Node.js', category: 'Backend', years: 9, endorsements: 167 },
    { name: 'Python', category: 'Programming', years: 7, endorsements: 98 },
    { name: 'PostgreSQL', category: 'Database', years: 10, endorsements: 112 },
    { name: 'AWS', category: 'Cloud', years: 6, endorsements: 87 },
    { name: 'Docker', category: 'DevOps', years: 5, endorsements: 76 },
    { name: 'Team Leadership', category: 'Soft Skills', years: 6, endorsements: 134 },
    { name: 'System Design', category: 'Architecture', years: 8, endorsements: 156 }
  ];

  const skills = profileSkills.map((s, i) => ({
    id: uuid('skill', i + 1),
    user_id: DEMO_USER_ID,
    name: s.name,
    category: s.category,
    level: 'expert',
    years_of_experience: s.years,
    endorsements: s.endorsements
  }));

  const { error: skillsError } = await supabase
    .from('skills')
    .upsert(skills, { onConflict: 'id' });

  if (skillsError) {
    console.log('Skills error:', skillsError.message);
  } else {
    console.log(`Created ${skills.length} skills`);
  }

  // 3. Experience
  const experienceEntries = [
    { company: 'FreeFlow', title: 'Technical Co-founder & CTO', location: 'San Francisco, CA', start_date: '2023-01-01', current: true },
    { company: 'Stripe', title: 'Staff Software Engineer', location: 'San Francisco, CA', start_date: '2020-03-01', end_date: '2022-12-31' },
    { company: 'Google', title: 'Senior Software Engineer', location: 'Mountain View, CA', start_date: '2017-06-01', end_date: '2020-02-28' }
  ];

  const experience = experienceEntries.map((e, i) => ({
    id: uuid('exp', i + 1),
    user_id: DEMO_USER_ID,
    company: e.company,
    title: e.title,
    location: e.location,
    start_date: e.start_date,
    end_date: e.end_date || null,
    current: e.current || false,
    description: `Leading technical initiatives at ${e.company}.`,
    achievements: ['Led major projects', 'Mentored engineers']
  }));

  const { error: expError } = await supabase
    .from('experience')
    .upsert(experience, { onConflict: 'id' });

  if (expError) {
    console.log('Experience error:', expError.message);
  } else {
    console.log(`Created ${experience.length} experience entries`);
  }

  // 4. Education
  const educationEntries = [
    { school: 'Stanford University', degree: 'Master of Science', field: 'Computer Science', start_date: '2012-09-01', end_date: '2014-06-30', grade: '3.9' },
    { school: 'UC Berkeley', degree: 'Bachelor of Science', field: 'EECS', start_date: '2008-09-01', end_date: '2012-05-31', grade: '3.8' }
  ];

  const education = educationEntries.map((e, i) => ({
    id: uuid('edu', i + 1),
    user_id: DEMO_USER_ID,
    school: e.school,
    degree: e.degree,
    field: e.field,
    start_date: e.start_date,
    end_date: e.end_date,
    current: false,
    grade: e.grade,
    activities: ['Research', 'Teaching Assistant']
  }));

  const { error: eduError } = await supabase
    .from('education')
    .upsert(education, { onConflict: 'id' });

  if (eduError) {
    console.log('Education error:', eduError.message);
  } else {
    console.log(`Created ${education.length} education entries`);
  }

  // 5. Portfolio items
  const portfolioItems = [
    { title: 'FreeFlow Platform', category: 'Web App', tags: ['Next.js', 'TypeScript'], featured: true },
    { title: 'AI Code Review Tool', category: 'Developer Tools', tags: ['Python', 'OpenAI'], featured: true },
    { title: 'Crypto Portfolio Tracker', category: 'Mobile App', tags: ['React Native'], featured: false }
  ];

  const portfolio = portfolioItems.map((p, i) => ({
    id: uuid('pfitem', i + 1),
    user_id: DEMO_USER_ID,
    title: p.title,
    description: `A comprehensive ${p.category.toLowerCase()}.`,
    category: p.category,
    tags: p.tags,
    thumbnail: `https://source.unsplash.com/400x300/?coding`,
    images: [],
    url: `https://example.com/${p.title.toLowerCase().replace(/ /g, '-')}`,
    featured: p.featured,
    likes: Math.floor(50 + Math.random() * 200),
    views: Math.floor(500 + Math.random() * 2000)
  }));

  const { error: pfError } = await supabase
    .from('portfolio')
    .upsert(portfolio, { onConflict: 'id' });

  if (pfError) {
    console.log('Portfolio error:', pfError.message);
  } else {
    console.log(`Created ${portfolio.length} portfolio items`);
  }

  // 6. Social Links
  const socialLinks = [
    { platform: 'GitHub', url: 'https://github.com/alexrivera', verified: true },
    { platform: 'LinkedIn', url: 'https://linkedin.com/in/alexrivera', verified: true },
    { platform: 'Twitter', url: 'https://twitter.com/alexrivera', verified: true }
  ];

  const links = socialLinks.map((s, i) => ({
    id: uuid('social', i + 1),
    user_id: DEMO_USER_ID,
    platform: s.platform,
    url: s.url,
    display_name: `@alexrivera`,
    verified: s.verified
  }));

  const { error: linksError } = await supabase
    .from('social_links')
    .upsert(links, { onConflict: 'id' });

  if (linksError) {
    console.log('Social links error:', linksError.message);
  } else {
    console.log(`Created ${links.length} social links`);
  }

  // 7. Profile Settings
  const settings = {
    id: uuid('settings', 1),
    user_id: DEMO_USER_ID,
    privacy_level: 'public',
    show_email: false,
    show_phone: false,
    show_location: true,
    allow_messages: true,
    allow_connections: true,
    email_notifications: true,
    push_notifications: true,
    marketing_emails: false,
    language: 'en',
    theme: 'auto'
  };

  const { error: settingsError } = await supabase
    .from('profile_settings')
    .upsert(settings, { onConflict: 'user_id' });

  if (settingsError) {
    console.log('Settings error:', settingsError.message);
  } else {
    console.log('Profile settings created');
  }

  // 8. Profile Stats
  const stats = {
    id: uuid('stats', 1),
    user_id: DEMO_USER_ID,
    profile_views: 15847,
    profile_views_this_month: 1234,
    connections: 2847,
    endorsements: 1456,
    portfolio_views: 42156,
    portfolio_likes: 3891,
    completion_percentage: 95
  };

  const { error: statsError } = await supabase
    .from('profile_stats')
    .upsert(stats, { onConflict: 'user_id' });

  if (statsError) {
    console.log('Stats error:', statsError.message);
  } else {
    console.log('Profile stats created');
  }

  // 9. Achievements
  const achievementsData = [
    { name: 'First $100K Earned', description: 'Earned over $100,000 on the platform', icon: 'trophy', category: 'Earnings' },
    { name: 'Perfect Rating Streak', description: 'Maintained 5-star rating for 50+ projects', icon: 'star', category: 'Quality' },
    { name: 'Community Leader', description: 'Recognized as a top contributor', icon: 'users', category: 'Community' },
    { name: 'Open Source Champion', description: 'Contributed to 10+ open source projects', icon: 'code', category: 'Contribution' },
    { name: 'Mentor of the Year', description: 'Mentored 20+ freelancers', icon: 'heart', category: 'Mentorship' }
  ];

  const achievements = achievementsData.map((a, i) => ({
    id: uuid('achieve', i + 1),
    user_id: DEMO_USER_ID,
    name: a.name,
    description: a.description,
    icon: a.icon,
    category: a.category,
    unlocked_at: daysAgo(30 * (i + 1))
  }));

  const { error: achieveError } = await supabase
    .from('achievements')
    .upsert(achievements, { onConflict: 'id' });

  if (achieveError) {
    console.log('Achievements error:', achieveError.message);
  } else {
    console.log(`Created ${achievements.length} achievements`);
  }

  return { skills: skills.length, experience: experience.length, education: education.length, achievements: achievements.length };
}

async function main() {
  console.log('===========================================');
  console.log('SEEDING COMMUNITY HUB, CV PORTFOLIO & PROFILES');
  console.log('===========================================');
  console.log(`Demo User: alex@freeflow.io`);
  console.log(`User ID: ${DEMO_USER_ID}`);

  try {
    const communityResult = await seedCommunityHub();
    const portfolioResult = await seedCVPortfolio();
    const profileResult = await seedUserProfile();

    console.log('\n===========================================');
    console.log('SEEDING COMPLETE!');
    console.log('===========================================');
    console.log('\nCommunity Hub:');
    console.log(`  Members: ${communityResult.members}`);
    console.log(`  Posts: ${communityResult.posts}`);
    console.log(`  Groups: ${communityResult.groups}`);
    console.log(`  Events: ${communityResult.events}`);
    console.log('\nCV Portfolio:');
    console.log(`  Projects: ${portfolioResult.projects}`);
    console.log(`  Skills: ${portfolioResult.skills}`);
    console.log(`  Experience: ${portfolioResult.experience}`);
    console.log(`  Certifications: ${portfolioResult.certifications}`);
    console.log('\nUser Profile:');
    console.log(`  Skills: ${profileResult.skills}`);
    console.log(`  Experience: ${profileResult.experience}`);
    console.log(`  Education: ${profileResult.education}`);
    console.log(`  Achievements: ${profileResult.achievements}`);
    console.log('\nTotal new records: ~150+');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
