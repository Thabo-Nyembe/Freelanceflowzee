const fs = require('fs');
const path = require('path');

// Create the icons directory if it doesn't exist
const iconsDir = path.join(process.cwd(), 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Simple SVG icon template for FreeflowZee
const createSVGIcon = (size) => {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.15}"/>
  <text x="50%" y="50%" text-anchor="middle" dy="0.35em" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="${size * 0.4}">F</text>
</svg>`;
};

// Convert SVG to PNG (simplified - for production, use a proper image processing library)
// For now, we'll create a simple data URL placeholder
const createDataURLIcon = (size) => {
  const svg = createSVGIcon(size);
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
};

// Icon sizes needed by the manifest
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create simple placeholder files for each size
iconSizes.forEach(size => {
  const filename = `icon-${size}x${size}.png`;
  const filepath = path.join(iconsDir, filename);
  
  // Create a simple text file as placeholder (in production, generate actual PNG)
  const placeholder = `<!-- SVG Icon Placeholder for ${size}x${size} -->
<!-- In production, replace with actual PNG file -->
${createSVGIcon(size)}`;
  
  fs.writeFileSync(filepath, placeholder);
  console.log(`Created placeholder icon: ${filename}`);
});

// Create shortcut icons
const shortcutIcons = [
  'dashboard-icon-96x96.png',
  'projects-icon-96x96.png', 
  'payment-icon-96x96.png',
  'new-project-icon-96x96.png'
];

shortcutIcons.forEach(filename => {
  const filepath = path.join(iconsDir, filename);
  const placeholder = `<!-- SVG Shortcut Icon Placeholder -->
${createSVGIcon(96)}`;
  
  fs.writeFileSync(filepath, placeholder);
  console.log(`Created placeholder shortcut icon: ${filename}`);
});

console.log('✅ All placeholder icons created successfully!');
console.log('📝 Note: Replace these with actual PNG files for production.'); 