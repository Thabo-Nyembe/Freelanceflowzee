import { execSync } from 'child_process';

// Get all v1 dashboard directories
const v1Dirs = execSync('find "app/v1/dashboard" -maxdepth 1 -type d -exec basename {} \\;')
  .toString()
  .trim()
  .split('\n')
  .filter(d => d && d !== 'dashboard');

const pages = v1Dirs.map(dir => ({
  route: '/v1/dashboard/' + dir,
  name: dir
}));

async function test() {
  let ok = 0, errors = [];

  console.log('Testing', pages.length, 'v1 pages (HTTP status only)...\n');

  for (const { route, name } of pages) {
    try {
      const response = await fetch('http://localhost:9323' + route + '?demo=true', {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });

      if (response.status >= 400) {
        errors.push({ name, status: response.status });
        process.stdout.write('x');
      } else {
        ok++;
        process.stdout.write('.');
      }
    } catch (e) {
      process.stdout.write('T');
    }
  }

  console.log('\n\n=== V1 Summary ===');
  console.log('OK:', ok, '| Errors:', errors.length);

  if (errors.length > 0) {
    console.log('\nV1 Pages with HTTP errors:');
    errors.forEach(p => console.log(`  - ${p.name}: HTTP ${p.status}`));
  }
}

test().catch(console.error);
