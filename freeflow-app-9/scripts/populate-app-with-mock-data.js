#!/usr/bin/env node

/**
 * 🎯 FreeflowZee Mock Data Population Script
 * 
 * This script populates the app with realistic mock data and free stock content
 * from various free APIs to test all features comprehensively.
 * 
 * Features tested:
 * - Projects Hub with sample projects
 * - Files Hub with various file types
 * - Community Hub with posts and creators
 * - Video Studio with sample videos
 * - AI Assistant with conversation history
 * - Escrow System with transactions
 * - User profiles and avatars
 */

const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');

console.log('🎨 FreeflowZee Mock Data Population');
console.log('=================================== ');
console.log('📦 Downloading free stock content and creating test data...\n');

class MockDataPopulator {
  constructor() {
    this.publicDir = 'public';
    this.mediaDir = path.join(this.publicDir, 'media');
    this.avatarsDir = path.join(this.publicDir, 'avatars');
    this.docsDir = path.join(this.publicDir, 'docs');
    this.videosDir = path.join(this.publicDir, 'videos');
    this.imagesDir = path.join(this.publicDir, 'images');
    
    this.downloadedFiles = [];
    this.mockData = {
      projects: [],
      users: [],
      files: [],
      posts: [],
      conversations: [],
      escrowTransactions: []
    };
  }

  async downloadFile(url, outputPath, description = '') {'
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;
      
      console.log(`📥 Downloading ${description}: ${path.basename(outputPath)}`);
      
      const file = fs.createWriteStream(outputPath);
      
      protocol.get(url, (response) => {
        if (response.statusCode === 200) {
          response.pipe(file);
          file.on('finish', () => {
            file.close();
            console.log(`✅ Downloaded: ${path.basename(outputPath)}`);
            this.downloadedFiles.push(outputPath);
            resolve(outputPath);
          });
        } else if (response.statusCode === 302 || response.statusCode === 301) {
          // Handle redirects
          const redirectUrl = response.headers.location;
          this.downloadFile(redirectUrl, outputPath, description).then(resolve).catch(reject);
        } else {
          reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        }
      }).on('error', (err) => {
        reject(err);
      });
    });
  }

  async ensureDirectories() {
    const dirs = [
      this.mediaDir,
      this.avatarsDir,
      this.docsDir,
      this.videosDir,
      this.imagesDir
    ];

    for (const dir of dirs) {
      try {
        await fsPromises.mkdir(dir, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
      } catch (error) {
        // Directory likely exists
      }
    }
  }

  async downloadFreeStockImages() {
    console.log('\n🖼️  Downloading Free Stock Images...');
    
    // Picsum Photos - Free stock images
    const images = [
      { 
        url: 'https://picsum.photos/800/600?random=1', 
        name: 'project-mockup-1.jpg',
        description: 'Brand Design Mockup'
      },
      { 
        url: 'https://picsum.photos/800/600?random=2', 
        name: 'project-mockup-2.jpg',
        description: 'Website Design Mockup'
      },
      { 
        url: 'https://picsum.photos/800/600?random=3', 
        name: 'project-mockup-3.jpg',
        description: 'Mobile App Mockup'
      },
      { 
        url: 'https://picsum.photos/1200/800?random=4', 
        name: 'hero-banner.jpg',
        description: 'Hero Banner Image'
      },
      { 
        url: 'https://picsum.photos/400/400?random=5', 
        name: 'logo-design-sample.jpg',
        description: 'Logo Design Sample'
      },
      { 
        url: 'https://picsum.photos/1920/1080?random=6', 
        name: 'portfolio-showcase.jpg',
        description: 'Portfolio Showcase'
      }
    ];

    for (const image of images) {
      try {
        const outputPath = path.join(this.imagesDir, image.name);
        await this.downloadFile(image.url, outputPath, image.description);
        await new Promise(resolve => setTimeout(resolve, 500)); // Rate limiting
      } catch (error) {
        console.log(`⚠️  Failed to download ${image.name}: ${error.message}`);
      }
    }
  }

  async downloadFreeAvatars() {
    console.log('\n👤 Downloading Free Avatar Images...');
    
    // UI Avatars - Free avatar generator
    const avatars = [
      { name: 'alex-designer.jpg', initials: 'AD', bg: '4F46E5' },
      { name: 'sarah-dev.jpg', initials: 'SD', bg: 'EF4444' },
      { name: 'mike-manager.jpg', initials: 'MM', bg: '10B981' },
      { name: 'emma-creative.jpg', initials: 'EC', bg: 'F59E0B' },
      { name: 'david-client.jpg', initials: 'DC', bg: '8B5CF6' },
      { name: 'lisa-freelancer.jpg', initials: 'LF', bg: 'EC4899' },
      { name: 'john-developer.jpg', initials: 'JD', bg: '06B6D4' },
      { name: 'anna-designer.jpg', initials: 'AD', bg: 'F97316' }
    ];

    for (const avatar of avatars) {
      try {
        const url = `https://ui-avatars.com/api/?name=${avatar.initials}&size=200&background=${avatar.bg}&color=fff&bold=true`;
        const outputPath = path.join(this.avatarsDir, avatar.name);
        await this.downloadFile(url, outputPath, `Avatar: ${avatar.name}`);
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.log(`⚠️  Failed to download ${avatar.name}: ${error.message}`);
      }
    }
  }

  async createSampleDocuments() {
    console.log('\n📄 Creating Sample Documents...');
    
    const documents = [
      {
        name: 'project-brief.md',
        content: `# Project Brief: Brand Identity Design

## Overview
Create a comprehensive brand identity for a modern tech startup.

## Deliverables
- Logo design (3 concepts)
- Brand guidelines document
- Business card design
- Letterhead template
- Social media kit

## Timeline
- Week 1: Research and concept development
- Week 2: Logo design iterations
- Week 3: Brand guidelines creation
- Week 4: Final deliverables and handoff

## Budget
$5,000 - $8,000

## Key Requirements
- Modern, clean aesthetic
- Scalable across digital and print
- Memorable and distinctive
- Appeals to tech-savvy audience
`
      },
      {
        name: 'client-feedback.md',
        content: `# Client Feedback - Website Redesign

## Overall Impression
The new design direction looks fantastic! Really loving the modern approach.

## Specific Comments

### Homepage
- ✅ Hero section is compelling
- ⚠️  Consider making the CTA button more prominent
- ✅ Navigation is intuitive

### About Page
- ✅ Team photos look professional
- ⚠️  Story section could be more concise
- ✅ Company values are well presented

### Services Page
- ❌ Pricing table needs revision
- ✅ Service descriptions are clear
- ⚠️  Add more visual elements

## Next Steps
1. Revise pricing table layout
2. Enhance CTA button visibility
3. Add icons to services section
4. Prepare for final review
`
      },
      {
        name: 'contract-template.md',
        content: `# Freelance Design Contract

## Project Details
**Client:** [Client Name]
**Project:** [Project Title]
**Start Date:** [Date]
**Deadline:** [Date]

## Scope of Work
[Detailed description of deliverables]

## Payment Terms
- 50% deposit required to begin work
- Remaining 50% due upon project completion
- Late payments incur 1.5% monthly interest

## Revision Policy
- 3 rounds of revisions included
- Additional revisions: $75/hour

## Copyright
- Client receives full rights upon final payment
- Designer retains right to display work in portfolio

## Cancellation
- 48-hour notice required for cancellation
- Non-refundable deposit for work completed
`
      }
    ];

    for (const doc of documents) {
      try {
        const outputPath = path.join(this.docsDir, doc.name);
        await fsPromises.writeFile(outputPath, doc.content);
        console.log(`✅ Created document: ${doc.name}`);
      } catch (error) {
        console.log(`⚠️  Failed to create ${doc.name}: ${error.message}`);
      }
    }
  }

  async createAudioSamples() {
    console.log('\n🎵 Creating Audio Sample Files...');
    
    // Create simple placeholder audio files (empty files with proper extensions)
    const audioFiles = ['client-voice-note-1.wav', 'project-discussion.mp3', 'feedback-recording.wav', 'team-meeting-notes.mp3'
    ];

    for (const audioFile of audioFiles) {
      try {
        const outputPath = path.join(this.mediaDir, audioFile);
        // Create a minimal WAV/MP3 header for testing
        const content = audioFile.endsWith('.wav') ? 
          'RIFF$\x00\x00\x00WAVEfmt ' : // Minimal WAV header
          'ID3\x03\x00\x00\x00'; // Minimal MP3 header
        
        await fsPromises.writeFile(outputPath, content, 'binary');
        console.log(`✅ Created audio file: ${audioFile}`);
      } catch (error) {
        console.log(`⚠️  Failed to create ${audioFile}: ${error.message}`);
      }
    }
  }

  generateMockProjects() {
    console.log('\n📊 Generating Mock Project Data...');
    
    this.mockData.projects = [
      {
        id: 'proj_001',
        title: 'TechCorp Brand Identity',
        description: 'Complete brand identity design for a cutting-edge tech startup',
        client_name: 'TechCorp Inc.',
        client_email: 'hello@techcorp.com',
        budget: 7500.00,
        spent: 3750.00,
        priority: 'high',
        status: 'active',
        progress: 65,
        start_date: '2024-12-01',
        end_date: '2024-12-31',
        estimated_hours: 80,
        actual_hours: 52,
        tags: ['branding', 'logo', 'identity', 'startup'],
        client_satisfaction_score: 5
      },
      {
        id: 'proj_002',
        title: 'E-commerce Website Redesign',
        description: 'Modern responsive redesign for online retail platform',
        client_name: 'ShopSmart Ltd.',
        client_email: 'projects@shopsmart.com',
        budget: 12000.00,
        spent: 8400.00,
        priority: 'medium',
        status: 'active',
        progress: 75,
        start_date: '2024-11-15',
        end_date: '2025-01-15',
        estimated_hours: 120,
        actual_hours: 84,
        tags: ['web design', 'ecommerce', 'responsive', 'ux'],
        client_satisfaction_score: 4
      },
      {
        id: 'proj_003',
        title: 'Mobile App UI/UX',
        description: 'User interface and experience design for fitness tracking app',
        client_name: 'FitLife Solutions',
        client_email: 'design@fitlife.app',
        budget: 9500.00,
        spent: 9500.00,
        priority: 'low',
        status: 'completed',
        progress: 100,
        start_date: '2024-10-01',
        end_date: '2024-11-30',
        estimated_hours: 100,
        actual_hours: 98,
        tags: ['mobile', 'ui', 'ux', 'fitness', 'app'],
        client_satisfaction_score: 5
      },
      {
        id: 'proj_004',
        title: 'Marketing Materials Design',
        description: 'Brochures, flyers, and digital assets for product launch',
        client_name: 'InnovateX',
        client_email: 'marketing@innovatex.co',
        budget: 4500.00,
        spent: 1125.00,
        priority: 'urgent',
        status: 'active',
        progress: 25,
        start_date: '2024-12-10',
        end_date: '2024-12-25',
        estimated_hours: 45,
        actual_hours: 11,
        tags: ['print design', 'marketing', 'brochure', 'launch'],
        client_satisfaction_score: null
      }
    ];

    console.log(`✅ Generated ${this.mockData.projects.length} mock projects`);
  }

  generateMockUsers() {
    console.log('\n👥 Generating Mock User Data...');
    
    this.mockData.users = [
      {
        id: 'user_001',
        full_name: 'Alex Rivera',
        avatar_url: '/avatars/alex-designer.jpg',
        bio: 'Senior Brand Designer with 8+ years of experience creating memorable identities',
        website: 'https://alexrivera.design',
        location: 'San Francisco, CA',
        skills: ['Brand Design', 'Logo Design', 'Typography', 'Art Direction'],
        hourly_rate: 125.00,
        timezone: 'America/Los_Angeles',
        subscription_tier: 'pro'
      },
      {
        id: 'user_002',
        full_name: 'Sarah Chen',
        avatar_url: '/avatars/sarah-dev.jpg',
        bio: 'Full-stack developer specializing in React and Node.js applications',
        website: 'https://sarahchen.dev',
        location: 'Austin, TX',
        skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'GraphQL'],
        hourly_rate: 95.00,
        timezone: 'America/Chicago',
        subscription_tier: 'pro'
      },
      {
        id: 'user_003',
        full_name: 'Mike Johnson',
        avatar_url: '/avatars/mike-manager.jpg',
        bio: 'Project manager and UX strategist helping teams deliver exceptional products',
        website: 'https://mikejohnson.pm',
        location: 'New York, NY',
        skills: ['Project Management', 'UX Strategy', 'Agile', 'Team Leadership'],
        hourly_rate: 110.00,
        timezone: 'America/New_York',
        subscription_tier: 'enterprise'
      },
      {
        id: 'user_004',
        full_name: 'Emma Martinez',
        avatar_url: '/avatars/emma-creative.jpg',
        bio: 'Creative director and visual storyteller with a passion for innovative design',
        website: 'https://emmamartinez.co',
        location: 'Los Angeles, CA',
        skills: ['Creative Direction', 'Visual Design', 'Photography', 'Video Editing'],
        hourly_rate: 140.00,
        timezone: 'America/Los_Angeles',
        subscription_tier: 'pro'
      }
    ];

    console.log(`✅ Generated ${this.mockData.users.length} mock users`);
  }

  generateMockFiles() {
    console.log('\n📁 Generating Mock File Data...');
    
    this.mockData.files = [
      {
        id: 'file_001',
        filename: 'brand-logo-concepts.psd',
        original_filename: 'TechCorp_Logo_Concepts_v3.psd',
        file_size: 15728640, // 15MB
        mime_type: 'image/vnd.adobe.photoshop',
        file_extension: 'psd',
        project_id: 'proj_001',
        folder: 'Design Files',
        tags: ['logo', 'concepts', 'photoshop'],
        access_count: 23,
        is_public: false
      },
      {
        id: 'file_002',
        filename: 'website-wireframes.fig',
        original_filename: 'ShopSmart_Wireframes_Final.fig',
        file_size: 5242880, // 5MB
        mime_type: 'application/figma',
        file_extension: 'fig',
        project_id: 'proj_002',
        folder: 'Wireframes',
        tags: ['wireframes', 'figma', 'ux'],
        access_count: 45,
        is_public: false
      },
      {
        id: 'file_003',
        filename: 'app-mockups.sketch',
        original_filename: 'FitLife_App_Mockups_v2.sketch',
        file_size: 8388608, // 8MB
        mime_type: 'application/sketch',
        file_extension: 'sketch',
        project_id: 'proj_003',
        folder: 'UI Mockups',
        tags: ['mockups', 'sketch', 'mobile'],
        access_count: 67,
        is_public: false
      },
      {
        id: 'file_004',
        filename: 'project-brief.pdf',
        original_filename: 'InnovateX_Project_Brief.pdf',
        file_size: 2097152, // 2MB
        mime_type: 'application/pdf',
        file_extension: 'pdf',
        project_id: 'proj_004',
        folder: 'Documentation',
        tags: ['brief', 'requirements', 'pdf'],
        access_count: 12,
        is_public: true
      },
      {
        id: 'file_005',
        filename: 'brand-guidelines.indd',
        original_filename: 'TechCorp_Brand_Guidelines.indd',
        file_size: 12582912, // 12MB
        mime_type: 'application/indesign',
        file_extension: 'indd',
        project_id: 'proj_001',
        folder: 'Brand Guidelines',
        tags: ['guidelines', 'indesign', 'brand'],
        access_count: 34,
        is_public: false
      }
    ];

    console.log(`✅ Generated ${this.mockData.files.length} mock files`);
  }

  generateMockPosts() {
    console.log('\n📝 Generating Mock Community Posts...');
    
    this.mockData.posts = [
      {
        id: 'post_001',
        author_id: 'user_001',
        title: 'Just completed a challenging brand identity project!',
        content: 'Excited to share this brand identity I designed for a tech startup. The process involved extensive research into their target market and competitors. What do you think of the final result?',
        tags: ['branding', 'identity', 'startup', 'design'],
        media_url: '/images/project-mockup-1.jpg',
        likes_count: 47,
        comments_count: 12,
        shares_count: 8,
        created_at: '2024-12-18T10:30:00Z'
      },
      {
        id: 'post_002',
        author_id: 'user_002',
        title: 'New React component library released',
        content: 'Just open-sourced my collection of reusable React components. Perfect for rapid prototyping and consistent design systems. Link in comments!',
        tags: ['react', 'components', 'opensource', 'development'],
        media_url: null,
        likes_count: 89,
        comments_count: 23,
        shares_count: 15,
        created_at: '2024-12-17T14:15:00Z'
      },
      {
        id: 'post_003',
        author_id: 'user_003',
        title: 'Project management tips for creative teams',
        content: 'After managing 50+ creative projects, here are my top 5 tips for keeping creative teams productive and happy. Thread below 👇',
        tags: ['management', 'productivity', 'teams', 'tips'],
        media_url: null,
        likes_count: 156,
        comments_count: 34,
        shares_count: 42,
        created_at: '2024-12-16T09:45:00Z'
      },
      {
        id: 'post_004',
        author_id: 'user_004',
        title: 'Behind the scenes: Client photoshoot',
        content: 'Had an amazing time directing this product photoshoot. The lighting setup took 3 hours but the results were worth it!',
        tags: ['photography', 'bts', 'product', 'creative'],
        media_url: '/images/portfolio-showcase.jpg',
        likes_count: 73,
        comments_count: 18,
        shares_count: 11,
        created_at: '2024-12-15T16:20:00Z'
      }
    ];

    console.log(`✅ Generated ${this.mockData.posts.length} mock community posts`);
  }

  generateMockConversations() {
    console.log('\n💬 Generating Mock AI Conversations...');
    
    this.mockData.conversations = [
      {
        id: 'conv_001',
        title: 'Logo Design Brainstorming',
        messages: [
          {
            role: 'user',
            content: 'I need help brainstorming logo concepts for a tech startup called "DataFlow". They focus on data analytics.',
            timestamp: '2024-12-18T09:00:00Z'
          },
          {
            role: 'assistant',
            content: 'Great! For DataFlow, consider these concepts:\n\n1. **Flow Symbol**: Use flowing lines or curves to represent data movement\n2. **Data Visualization**: Incorporate charts, graphs, or data points\n3. **Abstract "D"**: Create a geometric "D" with flow elements\n4. **Network Node**: Show interconnected dots representing data connections\n\nWhat industry or style preferences does the client have?',
            timestamp: '2024-12-18T09:01:00Z'
          },
          {
            role: 'user',
            content: 'They prefer modern, minimalist style. Target audience is enterprise clients.',
            timestamp: '2024-12-18T09:05:00Z'
          },
          {
            role: 'assistant',
            content: 'Perfect for enterprise! Focus on:\n\n✅ **Clean lines** - No decorative elements\n✅ **Professional colors** - Navy, gray, or deep blue\n✅ **Strong typography** - Sans-serif, easily readable\n✅ **Scalability** - Works at small sizes on business cards\n\nI recommend starting with a geometric "D" that incorporates subtle flow lines. Would you like me to suggest specific color palettes?',"
            timestamp: '2024-12-18T09:06:00Z'
          }
        ],
        created_at: '2024-12-18T09:00:00Z',
        updated_at: '2024-12-18T09:06:00Z'
      },
      {
        id: 'conv_002',
        title: 'Color Scheme Analysis',
        messages: [
          {
            role: 'user',
            content: 'Can you analyze this color scheme: #4F46E5, #EC4899, #10B981? Is it suitable for a fitness app?',
            timestamp: '2024-12-17T15:30:00Z'
          },
          {
            role: 'assistant',
            content: 'Excellent choice for a fitness app! Here\'s my analysis:\n\n🟣 **#4F46E5 (Indigo)**: Trust, reliability, premium feel\n🟡 **#EC4899 (Pink)**: Energy, motivation, fun\n🟢 **#10B981 (Green)**: Health, growth, success\n\n**Strengths:**\n- High contrast for accessibility\n- Energetic yet professional\n- Appeals to diverse demographics\n\n**Suggestions:**\n- Use indigo for primary UI elements\n- Pink for call-to-action buttons\n- Green for progress indicators\n\nThis palette balances motivation with trustworthiness!','
            timestamp: '2024-12-17T15:31:00Z'
          }
        ],
        created_at: '2024-12-17T15:30:00Z',
        updated_at: '2024-12-17T15:31:00Z'
      }
    ];

    console.log(`✅ Generated ${this.mockData.conversations.length} mock AI conversations`);
  }

  generateMockEscrowTransactions() {
    console.log('\n💰 Generating Mock Escrow Transactions...');
    
    this.mockData.escrowTransactions = [
      {
        id: 'escrow_001',
        project_id: 'proj_001',
        amount: 3750.00,
        status: 'held',
        milestone: 'Logo concepts completed',
        client_id: 'client_001',
        freelancer_id: 'user_001',
        created_at: '2024-12-01T10:00:00Z',
        release_conditions: ['Client approval', '48-hour review period'],
        auto_release_date: '2024-12-20T10:00:00Z'
      },
      {
        id: 'escrow_002',
        project_id: 'proj_002',
        amount: 6000.00,
        status: 'held',
        milestone: 'Homepage design complete',
        client_id: 'client_002',
        freelancer_id: 'user_002',
        created_at: '2024-11-20T14:30:00Z',
        release_conditions: ['Responsive testing passed', 'Client sign-off'],
        auto_release_date: '2024-12-25T14:30:00Z'
      },
      {
        id: 'escrow_003',
        project_id: 'proj_003',
        amount: 9500.00,
        status: 'released',
        milestone: 'Final app delivery',
        client_id: 'client_003',
        freelancer_id: 'user_004',
        created_at: '2024-11-30T16:45:00Z',
        released_at: '2024-12-01T10:00:00Z',
        release_conditions: ['Project completion', 'Client satisfaction'],
        satisfaction_rating: 5
      }
    ];

    console.log(`✅ Generated ${this.mockData.escrowTransactions.length} mock escrow transactions`);
  }

  async saveMockDataToFiles() {
    console.log('\n💾 Saving Mock Data to JSON Files...');
    
    const dataDir = path.join(this.publicDir, 'mock-data');
    await fsPromises.mkdir(dataDir, { recursive: true });

    const dataFiles = [
      { name: 'projects.json', data: this.mockData.projects },
      { name: 'users.json', data: this.mockData.users },
      { name: 'files.json', data: this.mockData.files },
      { name: 'posts.json', data: this.mockData.posts },
      { name: 'conversations.json', data: this.mockData.conversations },
      { name: 'escrow-transactions.json', data: this.mockData.escrowTransactions }
    ];

    for (const file of dataFiles) {
      try {
        const filePath = path.join(dataDir, file.name);
        await fsPromises.writeFile(filePath, JSON.stringify(file.data, null, 2));
        console.log(`✅ Saved: ${file.name} (${file.data.length} items)`);
      } catch (error) {
        console.log(`⚠️  Failed to save ${file.name}: ${error.message}`);
      }
    }
  }

  async createAPIEndpointsForMockData() {
    console.log('\n🔌 Creating API Endpoints for Mock Data...');
    
    const apiDir = path.join('app', 'api', 'mock');
    await fsPromises.mkdir(apiDir, { recursive: true });

    const endpoints = [
      {
        name: 'projects',
        path: path.join(apiDir, 'projects', 'route.ts'),
        data: this.mockData.projects
      },
      {
        name: 'users',
        path: path.join(apiDir, 'users', 'route.ts'),
        data: this.mockData.users
      },
      {
        name: 'files',
        path: path.join(apiDir, 'files', 'route.ts'),
        data: this.mockData.files
      },
      {
        name: 'posts',
        path: path.join(apiDir, 'posts', 'route.ts'),
        data: this.mockData.posts
      }
    ];

    for (const endpoint of endpoints) {
      try {
        await fsPromises.mkdir(path.dirname(endpoint.path), { recursive: true });
        
        const apiCode = `// Auto-generated mock API endpoint for ${endpoint.name}
import { NextRequest, NextResponse } from 'next/server';

const mockData = ${JSON.stringify(endpoint.data, null, 2)};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = parseInt(searchParams.get('offset') || '0');'
  
  const paginatedData = mockData.slice(offset, offset + limit);
  
  return NextResponse.json({
    data: paginatedData,
    total: mockData.length,
    limit,
    offset
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // In a real app, this would save to database
  const newItem = {
    id: \`${endpoint.name}_\${Date.now()}\`,
    ...body,
    created_at: new Date().toISOString()
  };
  
  return NextResponse.json(newItem, { status: 201 });
}
`;

        await fsPromises.writeFile(endpoint.path, apiCode);
        console.log(`✅ Created API endpoint: /api/mock/${endpoint.name}`);
      } catch (error) {
        console.log(`⚠️  Failed to create ${endpoint.name} endpoint: ${error.message}`);
      }
    }
  }

  generateTestingReadme() {
    const readme = `# 🎯 FreeflowZee Mock Data & Testing Guide

## 📦 Generated Content

This script has populated your FreeflowZee app with comprehensive mock data for testing all features:

### 🖼️ Images & Media
- **Stock Images**: Professional project mockups and portfolio pieces
- **Avatars**: AI-generated user profile pictures
- **Documents**: Sample project briefs, contracts, and feedback files
- **Audio Files**: Placeholder voice notes and recordings

### 📊 Mock Data
- **${this.mockData.projects.length} Projects**: Various stages (active, completed, urgent)
- **${this.mockData.users.length} Users**: Designers, developers, managers with different skills
- **${this.mockData.files.length} Files**: Different file types (PSD, Figma, Sketch, PDF)
- **${this.mockData.posts.length} Community Posts**: Social media style posts with engagement
- **${this.mockData.conversations.length} AI Conversations**: Sample chat history with AI assistant
- **${this.mockData.escrowTransactions.length} Escrow Transactions**: Payment milestones and releases

## 🧪 Testing Features

### Projects Hub
- View active, completed, and urgent projects
- Test project filtering and sorting
- Check progress tracking and budget monitoring

### Files Hub
- Upload and organize different file types
- Test file sharing and permissions
- Check storage analytics and optimization

### Community Hub
- Browse creator profiles and portfolios
- Test social interactions (likes, comments, shares)
- Check trending content and discovery

### Video Studio
- Test video upload and processing
- Check editing tools and templates
- Verify export and sharing functionality

### AI Assistant
- Continue existing conversations
- Test different design questions
- Check response quality and context

### Escrow System
- View active and completed transactions
- Test milestone tracking
- Check automatic release functionality

### My Day Today
- View AI-generated daily schedules
- Test task management features
- Check productivity insights

## 🔗 API Endpoints

Mock API endpoints have been created at:
- \`/api/mock/projects\` - Project data
- \`/api/mock/users\` - User profiles
- \`/api/mock/files\` - File metadata
- \`/api/mock/posts\` - Community posts

## 📁 File Locations

### Media Files
- \`/public/images/\` - Project mockups and portfolio images
- \`/public/avatars/\` - User profile pictures
- \`/public/docs/\` - Sample documents and contracts
- \`/public/media/\` - Audio files and recordings

### Mock Data
- \`/public/mock-data/\` - JSON files with all mock data
  - \`projects.json\`
  - \`users.json\`
  - \`files.json\`
  - \`posts.json\`
  - \`conversations.json\`
  - \`escrow-transactions.json\`

## 🚀 Next Steps

1. **Start the development server**: \`npm run dev\`
2. **Visit the dashboard**: http://localhost:3005/dashboard
3. **Test each feature** using the mock data
4. **Customize content** by editing JSON files in \`/public/mock-data/\`
5. **Add more content** by running this script again

## 🎨 Content Sources

All content is from free, royalty-free sources:
- **Images**: Picsum Photos (https://picsum.photos)
- **Avatars**: UI Avatars (https://ui-avatars.com)
- **Text Content**: AI-generated realistic examples
- **Data**: Procedurally generated with realistic values

## 🔄 Refreshing Data

To generate new mock data:
\`\`\`bash
node scripts/populate-app-with-mock-data.js
\`\`\`

This will download fresh images and regenerate all mock data files.

---

**Happy Testing!** 🎉 Your FreeflowZee app is now fully populated with realistic content.
`;

    return readme;
  }

  async run() {
    try {
      console.log('🚀 Starting mock data population...\n');

      // Create necessary directories
      await this.ensureDirectories();

      // Download free content
      await this.downloadFreeStockImages();
      await this.downloadFreeAvatars();
      
      // Create sample content
      await this.createSampleDocuments();
      await this.createAudioSamples();

      // Generate mock data
      this.generateMockProjects();
      this.generateMockUsers();
      this.generateMockFiles();
      this.generateMockPosts();
      this.generateMockConversations();
      this.generateMockEscrowTransactions();

      // Save data to files
      await this.saveMockDataToFiles();
      await this.createAPIEndpointsForMockData();

      // Create testing guide
      const readme = this.generateTestingReadme();
      await fsPromises.writeFile('TESTING_GUIDE.md', readme);

      // Final summary
      console.log('\n' + '='.repeat(60));'
      console.log('🎉 MOCK DATA POPULATION COMPLETE!');
      console.log('='.repeat(60));'
      console.log(`📁 Downloaded Files: ${this.downloadedFiles.length}`);
      console.log(`📊 Projects: ${this.mockData.projects.length}`);
      console.log(`👥 Users: ${this.mockData.users.length}`);
      console.log(`📄 Files: ${this.mockData.files.length}`);
      console.log(`📝 Posts: ${this.mockData.posts.length}`);
      console.log(`💬 Conversations: ${this.mockData.conversations.length}`);
      console.log(`💰 Escrow Transactions: ${this.mockData.escrowTransactions.length}`);
      console.log('\n🚀 Ready for comprehensive testing!');
      console.log('📖 See TESTING_GUIDE.md for detailed instructions');
      console.log('🌐 Start with: npm run dev');

    } catch (error) {
      console.error('\n❌ Error during mock data population:', error.message);
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const populator = new MockDataPopulator();
  populator.run();
}

module.exports = MockDataPopulator; 