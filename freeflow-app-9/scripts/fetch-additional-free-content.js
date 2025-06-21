#!/usr/bin/env node

/**
 * 🌐 ADDITIONAL FREE CONTENT FETCHER
 * 
 * This script fetches additional free content from various APIs to enrich
 * the testing data for FreeflowZee features.
 */

const fs = require('fs').promises;
const path = require('path');
const axios = require('axios').default;

// Configure axios with retry logic
const apiClient = axios.create({
  timeout: 15000,
  headers: {
    'User-Agent': 'FreeflowZee-Content-Fetcher/1.0'
  }
});

/**
 * 📰 FETCH LOREM IPSUM CONTENT
 */
async function fetchLoremContent() {
  console.log('📰 Fetching Lorem Ipsum content...');
  
  try {
    // JSONPlaceholder for posts and comments
    const postsResponse = await apiClient.get('https://jsonplaceholder.typicode.com/posts');
    const commentsResponse = await apiClient.get('https://jsonplaceholder.typicode.com/comments');
    
    const posts = postsResponse.data.slice(0, 20).map(post => ({
      id: post.id,
      title: post.title,
      content: post.body,
      author: `user_${post.userId}`,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      likes: Math.floor(Math.random() * 100),
      comments: Math.floor(Math.random() * 20)
    }));
    
    const comments = commentsResponse.data.slice(0, 50).map(comment => ({
      id: comment.id,
      postId: comment.postId,
      author: comment.name,
      email: comment.email,
      content: comment.body,
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    }));
    
    return { posts, comments };
  } catch (error) {
    console.log('❌ Failed to fetch lorem content, using fallback');
    return { posts: [], comments: [] };
  }
}

/**
 * 🎨 FETCH PLACEHOLDER IMAGES
 */
async function fetchPlaceholderImages() {
  console.log('🎨 Fetching placeholder images...');
  
  const categories = ['business', 'technology', 'nature', 'abstract', 'people'];
  const images = [];
  
  for (let i = 0; i < 20; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const width = [400, 600, 800, 1200][Math.floor(Math.random() * 4)];
    const height = [300, 400, 600, 800][Math.floor(Math.random() * 4)];
    
    images.push({
      id: `placeholder_${i + 1}`,
      url: `https://picsum.photos/${width}/${height}?random=${i + 100}`,
      thumbnail: `https://picsum.photos/200/150?random=${i + 100}`,
      category,
      width,
      height,
      title: `${category} image ${i + 1}`,
      description: `High-quality ${category} placeholder image for testing`
    });
  }
  
  return images;
}

/**
 * 🏢 FETCH COMPANY DATA
 */
async function fetchCompanyData() {
  console.log('🏢 Generating company data...');
  
  const companyNames = [
    'TechFlow Solutions', 'Creative Digital Agency', 'Modern Web Studio',
    'Innovation Labs', 'Design Collective', 'Digital Pioneers',
    'NextGen Development', 'Creative Minds Studio', 'Tech Innovators',
    'Digital Craft Agency', 'Future Web Solutions', 'Creative Tech Hub'
  ];
  
  const industries = [
    'Technology', 'Design', 'Marketing', 'E-commerce', 'Healthcare',
    'Finance', 'Education', 'Entertainment', 'Real Estate', 'Automotive'
  ];
  
  const companies = companyNames.map((name, i) => ({
    id: `company_${i + 1}`,
    name,
    industry: industries[Math.floor(Math.random() * industries.length)],
    size: ['Startup', 'Small', 'Medium', 'Large'][Math.floor(Math.random() * 4)],
    location: ['San Francisco', 'New York', 'London', 'Berlin', 'Toronto'][Math.floor(Math.random() * 5)],
    website: `https://${name.toLowerCase().replace(/\s+/g, '')}.com`,
    description: `Leading ${industries[Math.floor(Math.random() * industries.length)].toLowerCase()} company focused on innovation and growth.`,
    employees: Math.floor(Math.random() * 500) + 10,
    founded: 2015 + Math.floor(Math.random() * 8),
    logo: `https://api.dicebear.com/7.x/shapes/svg?seed=${name.replace(/\s+/g, '')}`
  }));
  
  return companies;
}

/**
 * 📊 FETCH QUOTE DATA
 */
async function fetchQuoteData() {
  console.log('📊 Fetching inspirational quotes...');
  
  // Fallback quotes for inspiration
  const quotes = [
    {
      text: "The way to get started is to quit talking and begin doing.",
      author: "Walt Disney",
      category: "motivation"
    },
    {
      text: "Innovation distinguishes between a leader and a follower.",
      author: "Steve Jobs",
      category: "innovation"
    },
    {
      text: "Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work.",
      author: "Steve Jobs",
      category: "career"
    },
    {
      text: "The future belongs to those who believe in the beauty of their dreams.",
      author: "Eleanor Roosevelt",
      category: "dreams"
    },
    {
      text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      author: "Winston Churchill",
      category: "perseverance"
    },
    {
      text: "The only way to do great work is to love what you do.",
      author: "Steve Jobs",
      category: "passion"
    },
    {
      text: "Don't be afraid to give up the good to go for the great.",
      author: "John D. Rockefeller",
      category: "excellence"
    },
    {
      text: "Believe you can and you're halfway there.",
      author: "Theodore Roosevelt",
      category: "confidence"
    }
  ];
  
  return quotes.map((quote, i) => ({
    id: `quote_${i + 1}`,
    ...quote,
    createdAt: new Date().toISOString()
  }));
}

/**
 * 🎯 FETCH SKILL DATA
 */
async function fetchSkillData() {
  console.log('🎯 Generating skill data...');
  
  const skillCategories = {
    'Design': ['Photoshop', 'Illustrator', 'Figma', 'Sketch', 'InDesign', 'After Effects'],
    'Development': ['JavaScript', 'React', 'Node.js', 'Python', 'PHP', 'Vue.js'],
    'Marketing': ['SEO', 'Google Ads', 'Social Media', 'Content Marketing', 'Email Marketing'],
    'Business': ['Project Management', 'Strategy', 'Analytics', 'Consulting', 'Sales']
  };
  
  const skills = [];
  Object.entries(skillCategories).forEach(([category, skillList]) => {
    skillList.forEach((skill, i) => {
      skills.push({
        id: `skill_${skills.length + 1}`,
        name: skill,
        category,
        demand: Math.floor(Math.random() * 100) + 1,
        averageRate: Math.floor(Math.random() * 80) + 20,
        projects: Math.floor(Math.random() * 1000) + 50,
        description: `Professional ${skill} services for modern businesses`
      });
    });
  });
  
  return skills;
}

/**
 * 📈 GENERATE MARKET DATA
 */
async function generateMarketData() {
  console.log('📈 Generating market data...');
  
  const marketTrends = {
    topSkills: [
      { skill: 'React Development', growth: '+45%', demand: 'High' },
      { skill: 'UI/UX Design', growth: '+38%', demand: 'High' },
      { skill: 'Digital Marketing', growth: '+32%', demand: 'Medium' },
      { skill: 'Video Production', growth: '+28%', demand: 'Medium' },
      { skill: 'Content Writing', growth: '+25%', demand: 'High' }
    ],
    industryGrowth: [
      { industry: 'Technology', growth: '+42%', projects: 1250 },
      { industry: 'E-commerce', growth: '+35%', projects: 890 },
      { industry: 'Healthcare', growth: '+28%', projects: 650 },
      { industry: 'Education', growth: '+22%', projects: 480 },
      { industry: 'Finance', growth: '+18%', projects: 320 }
    ],
    averageRates: {
      'Web Development': '$65/hr',
      'Graphic Design': '$45/hr',
      'Content Writing': '$35/hr',
      'Digital Marketing': '$55/hr',
      'Video Editing': '$50/hr'
    },
    projectTypes: [
      { type: 'Website Development', percentage: 35, avgBudget: '$3,500' },
      { type: 'Logo Design', percentage: 20, avgBudget: '$500' },
      { type: 'Mobile App', percentage: 15, avgBudget: '$8,000' },
      { type: 'Marketing Campaign', percentage: 18, avgBudget: '$2,200' },
      { type: 'Content Creation', percentage: 12, avgBudget: '$1,200' }
    ]
  };
  
  return marketTrends;
}

/**
 * 🎯 MAIN EXECUTION FUNCTION
 */
async function fetchAdditionalFreeContent() {
  console.log('🚀 Fetching additional free content...\n');
  
  try {
    // Fetch all content
    const loremContent = await fetchLoremContent();
    const placeholderImages = await fetchPlaceholderImages();
    const companies = await fetchCompanyData();
    const quotes = await fetchQuoteData();
    const skills = await fetchSkillData();
    const marketData = await generateMarketData();
    
    // Create additional content directory
    const additionalDir = path.join(process.cwd(), 'public', 'enhanced-content', 'additional');
    await fs.mkdir(additionalDir, { recursive: true });
    
    // Save all content
    const contentFiles = {
      'lorem-posts.json': loremContent.posts,
      'lorem-comments.json': loremContent.comments,
      'placeholder-images.json': placeholderImages,
      'companies.json': companies,
      'quotes.json': quotes,
      'skills.json': skills,
      'market-data.json': marketData
    };
    
    for (const [filename, data] of Object.entries(contentFiles)) {
      await fs.writeFile(
        path.join(additionalDir, filename),
        JSON.stringify(data, null, 2)
      );
      console.log(`✅ Created: ${filename}`);
    }
    
    // Create summary
    const summary = {
      generatedAt: new Date().toISOString(),
      totalLoremPosts: loremContent.posts.length,
      totalComments: loremContent.comments.length,
      totalPlaceholderImages: placeholderImages.length,
      totalCompanies: companies.length,
      totalQuotes: quotes.length,
      totalSkills: skills.length,
      marketDataSections: Object.keys(marketData).length,
      sources: [
        'jsonplaceholder.typicode.com - Lorem posts and comments',
        'picsum.photos - Placeholder images',
        'Generated - Company, skill, and market data',
        'Curated - Inspirational quotes'
      ]
    };
    
    await fs.writeFile(
      path.join(additionalDir, 'content-summary.json'),
      JSON.stringify(summary, null, 2)
    );
    
    console.log('\n🎉 ADDITIONAL CONTENT FETCH COMPLETE!');
    console.log('════════════════════════════════════════');
    console.log(`📰 Lorem Posts: ${loremContent.posts.length}`);
    console.log(`💬 Comments: ${loremContent.comments.length}`);
    console.log(`🖼️ Placeholder Images: ${placeholderImages.length}`);
    console.log(`🏢 Companies: ${companies.length}`);
    console.log(`💭 Quotes: ${quotes.length}`);
    console.log(`🎯 Skills: ${skills.length}`);
    console.log(`📈 Market Data: Complete dataset`);
    console.log('\n✨ Your app now has comprehensive content for testing!');
    console.log('🔗 Additional content saved to: /public/enhanced-content/additional/');
    
  } catch (error) {
    console.error('❌ Error fetching additional content:', error.message);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  fetchAdditionalFreeContent();
}

module.exports = {
  fetchAdditionalFreeContent,
  fetchLoremContent,
  fetchPlaceholderImages,
  fetchCompanyData,
  fetchQuoteData,
  fetchSkillData,
  generateMarketData
}; 