#!/usr/bin/env node

/**
 * 🎯 CONTEXT7 ENHANCED CONTENT POPULATION SCRIPT
 * 
 * This script uses Context7 best practices with Axios to fetch real content
 * from free APIs and populate FreeflowZee with diverse, realistic data for
 * comprehensive feature testing.
 * 
 * Features:
 * - Real user profiles from randomuser.me
 * - Professional images from Unsplash/Picsum
 * - Lorem ipsum content with variety
 * - Realistic project data
 * - Mock files and media
 * - AI-generated placeholder content
 */

const fs = require('fs').promises;
const path = require('path');

// Context7 Axios Configuration following best practices
const axios = require('axios').default;

// Configure Axios with Context7 patterns
const apiClient = axios.create({
  timeout: 10000,
  headers: {
    'User-Agent': 'FreeflowZee-Content-Populator/1.0', 'Accept': 'application/json'
  }
});

// Add Context7 style interceptors
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🔄 Fetching: ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ Success: ${response.config.url} (${response.status})`);
    return response;
  },
  (error) => {
    console.log(`❌ Error: ${error.config?.url} - ${error.message}`);
    return Promise.reject(error);
  }
);

/**
 * 🎭 REAL USER DATA GENERATOR
 * Uses randomuser.me API for realistic user profiles
 */
async function generateRealUsers(count = 20) {
  try {
    const response = await apiClient.get(`https://randomuser.me/api/?results=${count}&inc=name,email,picture,location,phone,dob,login`);
    
    return response.data.results.map((user, index) => ({
      id: `user_${index + 1}`,
      name: `${user.name.first} ${user.name.last}`,
      email: user.email,
      avatar: user.picture.large,
      location: `${user.location.city}, ${user.location.country}`,
      phone: user.phone,
      profession: getRandomProfession(),
      bio: generateBio(user.name.first),
      joinDate: new Date(user.registered?.date || Date.now()).toISOString(),
      skills: getRandomSkills(),
      rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0-5.0
      projectsCompleted: Math.floor(Math.random() * 50) + 5,
      hourlyRate: Math.floor(Math.random() * 80) + 20, // $20-$100
      isVerified: Math.random() > 0.3,
      isOnline: Math.random() > 0.5
    }));
  } catch (error) {
    console.log('📝 Falling back to mock users due to API error');
    return generateMockUsers(count);
  }
}

/**
 * 🖼️ PROFESSIONAL IMAGE GENERATOR
 * Uses Picsum Photos for high-quality placeholder images
 */
async function generateProjectImages(count = 30) {
  const categories = ['business', 'technology', 'design', 'architecture', 'nature', 'food', 'fashion', 'art', 'interior', 'landscape'];
  
  const images = [];
  
  for (let i = 0; i < count; i++) {
    const width = [800, 1200, 1600][Math.floor(Math.random() * 3)];
    const height = [600, 800, 900][Math.floor(Math.random() * 3)];
    const imageId = Math.floor(Math.random() * 1000) + 1;
    
    images.push({
      id: `img_${i + 1}`,
      url: `https://picsum.photos/${width}/${height}?random=${imageId}`,
      thumbnail: `https://picsum.photos/300/200?random=${imageId}`,
      title: `${categories[Math.floor(Math.random() * categories.length)]} Project ${i + 1}`,
      category: categories[Math.floor(Math.random() * categories.length)],
      width,
      height,
      size: Math.floor(Math.random() * 2000) + 500 // KB
    });
  }
  
  return images;
}

/**
 * 📝 LOREM IPSUM CONTENT GENERATOR
 * Uses Lorem Picsum for varied text content
 */
async function generateLoremContent() {
  const sentences = ["Lorem ipsum dolor sit amet, consectetur adipiscing elit.", "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.", "Ut enim ad minim veniam, quis nostrud exercitation ullamco.", "Duis aute irure dolor in reprehenderit in voluptate velit esse.", "Excepteur sint occaecat cupidatat non proident, sunt in culpa.", "Nulla pariatur excepteur sint occaecat cupidatat non proident.", "At vero eos et accusamus et iusto odio dignissimos ducimus.", "Et harum quidem rerum facilis est et expedita distinctio.", "Temporibus autem quibusdam et aut officiis debitis aut rerum.",
    "Neque porro quisquam est qui dolorem ipsum quia dolor sit."];
  
  return {
    short: sentences.slice(0, 2).join(' '),'
    medium: sentences.slice(0, 4).join(' '),'
    long: sentences.join(' '),'
    paragraph: sentences.slice(0, 6).join(' ') + ' ' + sentences.slice(3, 8).join(' ')'
  };
}

/**
 * 🚀 REALISTIC PROJECT GENERATOR
 * Creates diverse project types with real-world scenarios
 */
async function generateRealProjects(users, images, count = 25) {
  const projectTypes = ['Website Design', 'Mobile App', 'Logo Design', 'Brand Identity', 'E-commerce Store', 'Marketing Campaign', 'Social Media Design', 'Video Production', 'Content Writing', 'SEO Optimization', 'UI/UX Design', 'Web Development', 'Graphic Design', 'Photography'
  ];
  
  const industries = ['Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Food & Beverage', 'Real Estate', 'Entertainment', 'Fitness', 'Travel', 'Automotive', 'Fashion', 'Non-Profit', 'Gaming'
  ];
  
  const lorem = await generateLoremContent();
  const projects = [];
  
  for (let i = 0; i < count; i++) {
    const client = users[Math.floor(Math.random() * users.length)];
    const freelancer = users[Math.floor(Math.random() * users.length)];
    const projectImage = images[Math.floor(Math.random() * images.length)];
    const type = projectTypes[Math.floor(Math.random() * projectTypes.length)];
    const industry = industries[Math.floor(Math.random() * industries.length)];
    
    const project = {
      id: `project_${i + 1}`,
      title: `${type} for ${industry} Company`,
      description: lorem.long,
      type,
      industry,
      client: {
        id: client.id,
        name: client.name,
        avatar: client.avatar,
        email: client.email
      },
      freelancer: {
        id: freelancer.id,
        name: freelancer.name,
        avatar: freelancer.avatar,
        email: freelancer.email
      },
      budget: Math.floor(Math.random() * 8000) + 1000, // $1000-$9000
      timeline: Math.floor(Math.random() * 8) + 2, // 2-10 weeks
      status: ['active', 'completed', 'in_review', 'draft'][Math.floor(Math.random() * 4)],
      progress: Math.floor(Math.random() * 100),
      priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
      tags: getRandomTags(),
      createdAt: getRandomDate(),
      dueDate: getRandomFutureDate(),
      images: [projectImage.url],
      thumbnail: projectImage.thumbnail,
      files: generateProjectFiles(),
      milestones: generateMilestones(),
      comments: generateComments(users.slice(0, 5)),
      attachments: generateAttachments()
    };
    
    projects.push(project);
  }
  
  return projects;
}

/**
 * 🎨 COMMUNITY POSTS GENERATOR
 * Creates engaging social media style posts
 */
async function generateCommunityPosts(users, images, count = 50) {
  const postTypes = ['showcase', 'question', 'tip', 'announcement', 'collaboration'];
  const lorem = await generateLoremContent();
  const posts = [];
  
  for (let i = 0; i < count; i++) {
    const author = users[Math.floor(Math.random() * users.length)];
    const postImage = images[Math.floor(Math.random() * images.length)];
    const type = postTypes[Math.floor(Math.random() * postTypes.length)];
    
    const post = {
      id: `post_${i + 1}`,
      type,
      author: {
        id: author.id,
        name: author.name,
        avatar: author.avatar,
        profession: author.profession
      },
      content: type === 'showcase' ? lorem.medium : lorem.short,
      image: Math.random() > 0.3 ? postImage.url : null,
      likes: Math.floor(Math.random() * 200),
      comments: Math.floor(Math.random() * 50),
      shares: Math.floor(Math.random() * 30),
      views: Math.floor(Math.random() * 1000) + 50,
      tags: getRandomTags().slice(0, 3),
      createdAt: getRandomDate(),
      isLiked: Math.random() > 0.7,
      isBookmarked: Math.random() > 0.8
    };
    
    posts.push(post);
  }
  
  return posts;
}

/**
 * 📁 FILE SYSTEM GENERATOR
 * Creates realistic file structures for testing
 */
async function generateFileSystem() {
  const fileTypes = {
    documents: ['pdf', 'doc', 'docx', 'txt', 'md'],
    images: ['jpg', 'png', 'gif', 'svg', 'webp'],
    videos: ['mp4', 'avi', 'mov', 'webm'],
    audio: ['mp3', 'wav', 'aac', 'm4a'],
    archives: ['zip', 'rar', '7z', 'tar'],
    code: ['js', 'ts', 'css', 'html', 'py', 'java']
  };
  
  const files = [];
  let totalSize = 0;
  
  Object.entries(fileTypes).forEach(([category, extensions]) => {
    extensions.forEach(ext => {
      for (let i = 0; i < Math.floor(Math.random() * 5) + 1; i++) {
        const size = Math.floor(Math.random() * 10000) + 100; // 100B - 10MB
        totalSize += size;
        
        files.push({
          id: `file_${files.length + 1}`,
          name: `${category}_file_${i + 1}.${ext}`,
          type: ext,
          category,
          size,
          sizeFormatted: formatFileSize(size),
          uploadedAt: getRandomDate(),
          downloadCount: Math.floor(Math.random() * 100),
          isShared: Math.random() > 0.6,
          url: `/api/files/download/${files.length + 1}`,
          thumbnail: category === 'images' ? `https://picsum.photos/150/150?random=${files.length}` : null
        });
      }
    });
  });
  
  return { files, totalSize, totalSizeFormatted: formatFileSize(totalSize) };
}

/**
 * 💰 ESCROW TRANSACTIONS GENERATOR
 * Creates realistic financial transactions
 */
function generateEscrowTransactions(projects, count = 15) {
  const transactions = [];
  
  for (let i = 0; i < count; i++) {
    const project = projects[Math.floor(Math.random() * projects.length)];
    const amount = Math.floor(Math.random() * 5000) + 500;
    
    transactions.push({
      id: `escrow_${i + 1}`,
      projectId: project.id,
      projectTitle: project.title,
      client: project.client,
      freelancer: project.freelancer,
      amount,
      currency: 'USD',
      status: ['pending', 'active', 'released', 'disputed'][Math.floor(Math.random() * 4)],
      type: ['milestone', 'full_payment', 'partial'][Math.floor(Math.random() * 3)],
      createdAt: getRandomDate(),
      releaseDate: getRandomFutureDate(),
      description: `Payment for ${project.title} - Milestone ${i + 1}`,
      milestoneNumber: Math.floor(Math.random() * 5) + 1,
      disputeReason: Math.random() > 0.9 ? 'Quality concerns' : null
    });
  }
  
  return transactions;
}

/**
 * 📊 ANALYTICS DATA GENERATOR
 * Creates comprehensive analytics data
 */
function generateAnalyticsData() {
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return {
      date: date.toISOString().split('T')[0],'
      views: Math.floor(Math.random() * 1000) + 100,
      downloads: Math.floor(Math.random() * 200) + 10,
      uploads: Math.floor(Math.random() * 50) + 5,
      revenue: Math.floor(Math.random() * 2000) + 200,
      newUsers: Math.floor(Math.random() * 20) + 2,
      activeProjects: Math.floor(Math.random() * 15) + 5
    };
  }).reverse();
  
  return {
    overview: {
      totalViews: last30Days.reduce((sum, day) => sum + day.views, 0),
      totalDownloads: last30Days.reduce((sum, day) => sum + day.downloads, 0),
      totalRevenue: last30Days.reduce((sum, day) => sum + day.revenue, 0),
      averageRating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10,
      completionRate: Math.round((Math.random() * 20 + 75) * 10) / 10
    },
    daily: last30Days,
    topCountries: [
      { country: 'United States', views: 15420, percentage: 32.1 },
      { country: 'United Kingdom', views: 8930, percentage: 18.6 },
      { country: 'Canada', views: 6780, percentage: 14.1 },
      { country: 'Australia', views: 4560, percentage: 9.5 },
      { country: 'Germany', views: 3890, percentage: 8.1 }
    ],
    deviceTypes: [
      { device: 'Desktop', count: 28450, percentage: 59.3 },
      { device: 'Mobile', count: 15670, percentage: 32.7 },
      { device: 'Tablet', count: 3840, percentage: 8.0 }
    ]
  };
}

// Helper Functions
function getRandomProfession() {
  const professions = ['Web Designer', 'Graphic Designer', 'Developer', 'Writer', 'Photographer', 'Video Editor', 'Marketing Specialist', 'UI/UX Designer', 'Illustrator', 'Brand Strategist', 'Social Media Manager', 'Content Creator'
  ];
  return professions[Math.floor(Math.random() * professions.length)];
}

function getRandomSkills() {
  const skills = ['Adobe Photoshop', 'Figma', 'React', 'Node.js', 'WordPress', 'SEO', 'Adobe Illustrator', 'JavaScript', 'Python', 'CSS', 'HTML', 'Vue.js', 'After Effects', 'Premiere Pro', 'Sketch', 'InDesign', 'Canva'
  ];
  return skills.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 5) + 3);
}

function getRandomTags() {
  const tags = ['design', 'development', 'marketing', 'branding', 'ui-ux', 'mobile', 'web', 'creative', 'business', 'startup', 'ecommerce', 'portfolio'
  ];
  return tags.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 4) + 2);
}

function generateBio(firstName) {
  const bios = [
    `Hi, I'm ${firstName}! I'm a passionate creative professional with over 5 years of experience.`,
    `${firstName} here! I specialize in creating beautiful, functional designs that drive results.`,
    `Creative professional ${firstName} - helping businesses grow through innovative design solutions.`,
    `I'm ${firstName}, a dedicated freelancer committed to delivering exceptional work on time.`
  ];
  return bios[Math.floor(Math.random() * bios.length)];
}

function getRandomDate() {
  const start = new Date(2023, 0, 1);
  const end = new Date();
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
}

function getRandomFutureDate() {
  const start = new Date();
  const end = new Date();
  end.setMonth(end.getMonth() + 3);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];'
}

function generateProjectFiles() {
  return [
    { name: 'project_brief.pdf', size: '2.4 MB', type: 'document' },
    { name: 'design_mockup.fig', size: '15.7 MB', type: 'design' },
    { name: 'final_logo.svg', size: '245 KB', type: 'image' },
    { name: 'brand_guidelines.pdf', size: '8.9 MB', type: 'document' }
  ];
}

function generateMilestones() {
  return [
    { id: 1, title: 'Project Discovery', status: 'completed', amount: 500, dueDate: getRandomDate() },
    { id: 2, title: 'Design Phase', status: 'in_progress', amount: 1500, dueDate: getRandomFutureDate() },
    { id: 3, title: 'Development', status: 'pending', amount: 2000, dueDate: getRandomFutureDate() },
    { id: 4, title: 'Final Delivery', status: 'pending', amount: 1000, dueDate: getRandomFutureDate() }
  ];
}

function generateComments(users) {
  return users.slice(0, 3).map((user, i) => ({
    id: i + 1,
    author: user,
    content: `This looks great! I especially love the ${['color scheme', 'typography', 'layout', 'overall design'][i % 4]}.`,
    createdAt: getRandomDate(),
    likes: Math.floor(Math.random() * 10)
  }));
}

function generateAttachments() {
  return [
    { name: 'reference_image.jpg', size: '1.2 MB', url: 'https://picsum.photos/800/600' },
    { name: 'style_guide.pdf', size: '3.8 MB', url: '/docs/style-guide.pdf' }
  ];
}

function generateMockUsers(count) {
  const mockNames = ['Alex Johnson', 'Sarah Chen', 'Mike Rodriguez', 'Emma Thompson', 'David Kim', 'Lisa Anderson', 'John Smith', 'Anna Williams', 'Carlos Garcia', 'Maya Patel'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `user_${i + 1}`,
    name: mockNames[i % mockNames.length] || `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 1}`,
    location: 'Remote',
    phone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    profession: getRandomProfession(),
    bio: generateBio(mockNames[i % mockNames.length]?.split(' ')[0] || 'User'),'
    joinDate: getRandomDate(),
    skills: getRandomSkills(),
    rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
    projectsCompleted: Math.floor(Math.random() * 50) + 5,
    hourlyRate: Math.floor(Math.random() * 80) + 20,
    isVerified: Math.random() > 0.3,
    isOnline: Math.random() > 0.5
  }));
}

/**
 * 🎯 MAIN EXECUTION FUNCTION
 */
async function populateAppWithRealContent() {
  console.log('🚀 Starting Context7 Enhanced Content Population...\n');
  
  try {
    // Generate all content
    console.log('👥 Generating real user profiles...');
    const users = await generateRealUsers(25);
    
    console.log('🖼️ Generating professional images...');
    const images = await generateProjectImages(40);
    
    console.log('🚀 Creating realistic projects...');
    const projects = await generateRealProjects(users, images, 30);
    
    console.log('🎨 Building community posts...');
    const posts = await generateCommunityPosts(users, images, 60);
    
    console.log('📁 Setting up file system...');
    const fileSystem = await generateFileSystem();
    
    console.log('💰 Creating escrow transactions...');
    const transactions = generateEscrowTransactions(projects, 20);
    
    console.log('📊 Generating analytics data...');
    const analytics = generateAnalyticsData();
    
    // Create enhanced content directory
    const contentDir = path.join(process.cwd(), 'public', 'enhanced-content');
    await fs.mkdir(contentDir, { recursive: true });
    await fs.mkdir(path.join(contentDir, 'content'), { recursive: true });
    
    // Save all generated content
    const contentFiles = {
      'enhanced-users.json': users, 'enhanced-projects.json': projects, 'enhanced-posts.json': posts, 'enhanced-images.json': images, 'enhanced-files.json': fileSystem, 'enhanced-transactions.json': transactions, 'enhanced-analytics.json': analytics
    };
    
    for (const [filename, data] of Object.entries(contentFiles)) {
      const filePath = path.join(contentDir, 'content', filename);
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      console.log(`✅ Created: ${filename}`);
    }
    
    // Create summary report
    const summary = {
      generatedAt: new Date().toISOString(),
      totalUsers: users.length,
      totalProjects: projects.length,
      totalPosts: posts.length,
      totalImages: images.length,
      totalFiles: fileSystem.files.length,
      totalTransactions: transactions.length,
      totalFileSize: fileSystem.totalSizeFormatted,
      apiSources: ['randomuser.me - User profiles', 'picsum.photos - Professional images', 'Generated - Lorem ipsum content', 'Mock data - File system and analytics'
      ],
      features: ['✅ Real user profiles with photos', '✅ Professional project images', '✅ Realistic project scenarios', '✅ Engaging community posts', '✅ Comprehensive file system', '✅ Financial transactions', '✅ Analytics dashboard data',
        '✅ Context7 + Axios integration']
    };
    
    await fs.writeFile(
      path.join(contentDir, 'content-summary.json'),
      JSON.stringify(summary, null, 2)
    );
    
    console.log('\n🎉 CONTENT POPULATION COMPLETE!');
    console.log('════════════════════════════════');
    console.log(`👥 Users: ${users.length}`);
    console.log(`🚀 Projects: ${projects.length}`);
    console.log(`🎨 Posts: ${posts.length}`);
    console.log(`🖼️ Images: ${images.length}`);
    console.log(`📁 Files: ${fileSystem.files.length} (${fileSystem.totalSizeFormatted})`);
    console.log(`💰 Transactions: ${transactions.length}`);
    console.log(`📊 Analytics: Complete dataset`);
    console.log('\n✨ Your FreeflowZee app is now populated with realistic content!');
    console.log('🔗 All content saved to: /public/enhanced-content/content/');
    
  } catch (error) {
    console.error('❌ Error during content population:', error.message);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  populateAppWithRealContent();
}

module.exports = {
  populateAppWithRealContent,
  generateRealUsers,
  generateProjectImages,
  generateRealProjects,
  generateCommunityPosts,
  generateFileSystem,
  generateEscrowTransactions,
  generateAnalyticsData
}; 