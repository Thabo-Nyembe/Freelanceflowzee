#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const axios = require('axios').default;

async function integrateRealContent() {
  console.log('🚀 Integrating real content into app...\n');
  
  try {
    // Read generated content
    const contentDir = path.join(process.cwd(), 'public', 'enhanced-content', 'content');
    const mockDataDir = path.join(process.cwd(), 'public', 'mock-data');
    
    const usersData = JSON.parse(await fs.readFile(path.join(contentDir, 'enhanced-users.json'), 'utf8'));
    const projectsData = JSON.parse(await fs.readFile(path.join(contentDir, 'enhanced-projects.json'), 'utf8'));
    const postsData = JSON.parse(await fs.readFile(path.join(contentDir, 'enhanced-posts.json'), 'utf8'));
    
    // Update mock data files
    await fs.mkdir(mockDataDir, { recursive: true });
    
    await fs.writeFile(
      path.join(mockDataDir, 'users.json'),
      JSON.stringify(usersData.slice(0, 15), null, 2)
    );
    
    await fs.writeFile(
      path.join(mockDataDir, 'projects.json'),
      JSON.stringify(projectsData.slice(0, 20), null, 2)
    );
    
    await fs.writeFile(
      path.join(mockDataDir, 'posts.json'),
      JSON.stringify(postsData.slice(0, 30), null, 2)
    );
    
    console.log('✅ Updated mock data files with real content');
    console.log('📁 Files updated: ');
    console.log('  - users.json (15 real users)');
    console.log('  - projects.json (20 real projects)');
    console.log('  - posts.json (30 real posts)');
    
    // Download some sample images
    console.log('\n📥 Downloading sample images...');
    const imagesDir = path.join(process.cwd(), 'public', 'images');
    
    const imageUrls = [
      { url: 'https://picsum.photos/1920/1080?random=100', name: 'hero-real.jpg' },
      { url: 'https://picsum.photos/800/600?random=101', name: 'project-real.jpg' },
      { url: 'https://picsum.photos/400/300?random=102', name: 'portfolio-real.jpg' }
    ];
    
    for (const { url, name } of imageUrls) {
      try {
        const response = await axios.get(url, { responseType: 'stream' });
        const writer = require('fs').createWriteStream(path.join(imagesDir, name));
        response.data.pipe(writer);
        
        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });
        
        console.log(`✅ Downloaded: ${name}`);
      } catch (error) {
        console.log(`❌ Failed to download ${name}`);
      }
    }
    
    console.log('\n🎉 Real content integration complete!');
    console.log('Your app now has realistic data for testing all features.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

if (require.main === module) {
  integrateRealContent();
}

module.exports = { integrateRealContent }; 