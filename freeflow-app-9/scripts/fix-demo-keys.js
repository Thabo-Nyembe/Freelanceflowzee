const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../components/demo/standalone-demo.tsx');

fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error(`Error reading file: ${err}`);
    return;
  }

  let modifiedData = data;

  // Add key to demoData.projects.map
  modifiedData = modifiedData.replace(
    /({\s*demoData\.projects\.map\((project, index)\s*=>\s*\(\s*)(<Card)/,
    '$1<Card key={index}'
  );

  // Add key to demoData.testimonials.map
  modifiedData = modifiedData.replace(
    /({\s*demoData\.testimonials\.map\((testimonial, index)\s*=>\s*\(\s*)(<Card)/,
    '$1<Card key={index}'
  );

  // Add key to testimonial.rating map
  modifiedData = modifiedData.replace(
    /(\{\s*\[\.\.\.Array\(testimonial\.rating\)\]\.map\(\(_,\s*i\)\s*=>\s*\(\s*)(<Star)/,
    '$1<Star key={i}'
  );

  // Add key to slides.map
  modifiedData = modifiedData.replace(
    /({\s*slides\.map\(\(_,\s*index\)\s*=>\s*\(\s*)(<button)/,
    '$1<button key={index}'
  );

  // Add key to demoTypes.map
  modifiedData = modifiedData.replace(
    /({\s*demoTypes\.map\(\(demo\)\s*=>\s*\(\s*)(<Card)/,
    '$1<Card key={demo.id}');

  fs.writeFile(filePath, modifiedData, 'utf8', (err) => {
    if (err) {
      console.error(`Error writing file: ${err}`);
      return;
    }
    console.log('Successfully added missing key props to standalone-demo.tsx');
  });
}); 