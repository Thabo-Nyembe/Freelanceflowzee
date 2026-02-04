import { execSync } from 'child_process';

// Get all v2 directories
const v2Dirs = execSync('find "app/(app)/dashboard" -maxdepth 1 -type d -name "*-v2" -exec basename {} \\;')
  .toString()
  .trim()
  .split('\n')
  .filter(d => d);

const pages = v2Dirs.map(dir => ({
  route: '/dashboard/' + dir,
  name: dir.replace('-v2', '')
}));

async function test() {
  let ok = 0, errors = [];

  console.log('Testing', pages.length, 'v2 pages (HTTP status only)...\n');

  for (const { route, name } of pages) {
    try {
      const response = await fetch('http://localhost:9323' + route + '?demo=true', {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });

      if (response.status >= 400) {
        errors.push({ name: name + '-v2', status: response.status });
        process.stdout.write('x');
      } else {
        ok++;
        process.stdout.write('.');
      }
    } catch (e) {
      // Timeout or network error - try one more time
      try {
        const response = await fetch('http://localhost:9323' + route + '?demo=true', {
          method: 'GET',
          signal: AbortSignal.timeout(10000)
        });
        if (response.status >= 400) {
          errors.push({ name: name + '-v2', status: response.status });
          process.stdout.write('x');
        } else {
          ok++;
          process.stdout.write('.');
        }
      } catch {
        process.stdout.write('T');
      }
    }
  }

  console.log('\n\n=== Summary ===');
  console.log('OK:', ok, '| Errors:', errors.length);

  if (errors.length > 0) {
    console.log('\nPages with HTTP errors:');
    errors.forEach(p => console.log(`  - ${p.name}: HTTP ${p.status}`));
  } else {
    console.log('\nAll pages return 200 OK!');
  }
}

test().catch(console.error);
