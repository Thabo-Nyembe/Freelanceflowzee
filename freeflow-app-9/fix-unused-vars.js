const fs = require('fs');

const fixes = [
  {
    file: 'components/payment/payment.tsx',
    pattern: 'const { supabase } = useSupabase()',
    replacement: 'const { supabase: _supabase } = useSupabase()'
  },
  {
    file: 'components/portfolio/portfolio.tsx',
    pattern: 'const { supabase } = useSupabase()',
    replacement: 'const { supabase: _supabase } = useSupabase()'
  },
  {
    file: 'components/theme-toggle.tsx',
    pattern: 'const { theme } = useTheme()',
    replacement: 'const { theme: _theme } = useTheme()'
  },
  {
    file: 'components/theme-toggle.tsx',
    pattern: 'import { cn } from',
    replacement: '// import { cn } from'
  }
];

fixes.forEach(fix => {
  if (fs.existsSync(fix.file)) {
    const content = fs.readFileSync(fix.file, 'utf8');
    if (content.includes(fix.pattern)) {
      const fixed = content.replace(fix.pattern, fix.replacement);
      fs.writeFileSync(fix.file, fixed);
      console.log(`Fixed ${fix.file}: ${fix.pattern} -> ${fix.replacement}`);
    }
  }
});
