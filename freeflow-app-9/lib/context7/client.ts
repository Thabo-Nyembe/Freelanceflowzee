/**
 * Context7 Client for FreeflowZee
 * 
 * Provides up-to-date documentation and code examples
 * for libraries used in the application.
 */

export interface LibraryDoc {
  id: string;
  name: string;
  version?: string;
  documentation: string;
  codeSnippets: CodeSnippet[];
  lastUpdated: Date;
}

export interface CodeSnippet {
  title: string;
  description: string;
  code: string;
  language: string;
  tags: string[];
}

export interface Context7Config {
  libraries: string[];
  defaultTokens: number;
  autoUpdate: boolean;
}

class Context7Client {
  private config: Context7Config;
  private cache: Map<string, LibraryDoc> = new Map();

  constructor(config: Context7Config) {
    this.config = config;
  }

  /**
   * Resolve library name to Context7-compatible ID
   */
  async resolveLibraryId(libraryName: string): Promise<string> {
    try {
      // This would call the actual Context7 MCP resolve-library-id tool
      // For now, we'll implement a basic mapping
      const libraryMappings: Record<string, string> = {
        'next.js': '/vercel/next.js',
        'react': '/facebook/react',
        'typescript': '/microsoft/typescript',
        'tailwindcss': '/tailwindlabs/tailwindcss',
        'supabase': '/supabase/supabase',
        '@radix-ui/react-accordion': '/radix-ui/primitives',
        '@radix-ui/react-dialog': '/radix-ui/primitives',
        '@radix-ui/react-dropdown-menu': '/radix-ui/primitives',
        '@radix-ui/react-tabs': '/radix-ui/primitives',
        '@radix-ui/react-toast': '/radix-ui/primitives',
        'lucide-react': '/lucide-icons/lucide',
        'react-hook-form': '/react-hook-form/react-hook-form',
        'zod': '/colinhacks/zod',
        'class-variance-authority': '/joe-bell/cva',
        'clsx': '/lukeed/clsx',
        'tailwind-merge': '/dcastil/tailwind-merge',
        'date-fns': '/date-fns/date-fns',
        'recharts': '/recharts/recharts'
      };

      return libraryMappings[libraryName] || libraryName;
    } catch (error) {
      console.error(`Failed to resolve library ID for ${libraryName}:`, error);
      throw error;
    }
  }

  /**
   * Get library documentation with optional topic focus
   */
  async getLibraryDocs(
    libraryName: string, 
    topic?: string, 
    tokens: number = this.config.defaultTokens
  ): Promise<LibraryDoc> {
    const cacheKey = `${libraryName}-${topic || 'default'}-${tokens}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const libraryId = await this.resolveLibraryId(libraryName);
      
      // This would call the actual Context7 MCP get-library-docs tool
      // For now, we'll return mock data
      const libraryDoc: LibraryDoc = {
        id: libraryId,
        name: libraryName,
        documentation: await this.fetchDocumentation(libraryId, topic, tokens),
        codeSnippets: await this.fetchCodeSnippets(libraryId, topic),
        lastUpdated: new Date()
      };

      // Cache the result
      this.cache.set(cacheKey, libraryDoc);
      
      return libraryDoc;
    } catch (error) {
      console.error(`Failed to get library docs for ${libraryName}:`, error);
      throw error;
    }
  }

  /**
   * Fetch documentation for a specific library and topic
   */
  private async fetchDocumentation(
    libraryId: string, 
    topic?: string, 
    tokens: number = 10000
  ): Promise<string> {
    // This would integrate with the actual Context7 MCP server
    // For now, return relevant documentation based on library
    
    const docs: Record<string, string> = {
      '/vercel/next.js': `
# Next.js Documentation

Next.js is a React framework for building full-stack web applications.

## Key Features:
- App Router with React Server Components
- Built-in optimizations (Image, Font, Script optimization)
- Server Actions for data mutations
- File-based routing
- API Routes
- Edge and Node.js runtimes

## Common Patterns:
- Use \`app/\` directory for new projects
- Create \`page.tsx\` files for routes
- Use \`layout.tsx\` for shared layouts
- Implement loading states with \`loading.tsx\`
- Handle errors with \`error.tsx\`

${topic ? `\n## ${topic} Documentation:\n[Specific documentation for ${topic} would be fetched here]` : ''}
      `,
      '/supabase/supabase': `
# Supabase Documentation

Supabase is an open-source Firebase alternative providing authentication, database, and real-time features.

## Key Features:
- PostgreSQL database with real-time subscriptions
- Authentication with multiple providers
- Row Level Security (RLS)
- Edge Functions
- File storage

## Common Patterns:
- Use \`createClient\` for client-side operations
- Use \`createServerClient\` for server-side operations
- Implement RLS policies for security
- Use TypeScript for better type safety

${topic ? `\n## ${topic} Documentation:\n[Specific documentation for ${topic} would be fetched here]` : ''}
      `,
      '/radix-ui/primitives': `
# Radix UI Documentation

Radix UI provides low-level UI primitives for building design systems and accessible user interfaces.

## Key Features:
- Unstyled, accessible components
- Full keyboard navigation
- Focus management
- Screen reader support
- Customizable with CSS-in-JS or utility classes

## Common Patterns:
- Compose components using Radix primitives
- Style with Tailwind CSS or styled-components
- Use compound components pattern
- Implement controlled and uncontrolled components

${topic ? `\n## ${topic} Documentation:\n[Specific documentation for ${topic} would be fetched here]` : ''}
      `
    };

    return docs[libraryId] || `Documentation for ${libraryId} not found in local cache. This would fetch from Context7 MCP server.`;
  }

  /**
   * Fetch code snippets for a library
   */
  private async fetchCodeSnippets(libraryId: string, topic?: string): Promise<CodeSnippet[]> {
    // This would integrate with Context7 to get real code snippets
    const snippets: Record<string, CodeSnippet[]> = {
      '/vercel/next.js': [
        {
          title: 'Basic App Router Page',
          description: 'Create a basic page component using App Router',
          code: `export default function Page() {
  return (
    <div>
      <h1>Hello, Next.js!</h1>
    </div>
  )
}`,
          language: 'typescript',
          tags: ['app-router', 'page', 'component']
        },
        {
          title: 'Server Component with Data Fetching',
          description: 'Fetch data in a server component',
          code: `async function getData() {
  const res = await fetch('https://api.example.com/data', {
    cache: 'no-store' // disable caching
  })
  return res.json()
}

export default async function Page() {
  const data = await getData()
  
  return (
    <div>
      <h1>Data: {data.title}</h1>
    </div>
  )
}`,
          language: 'typescript',
          tags: ['server-component', 'data-fetching', 'async']
        }
      ],
      '/supabase/supabase': [
        {
          title: 'Supabase Client Setup',
          description: 'Initialize Supabase client for Next.js',
          code: `import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)`,
          language: 'typescript',
          tags: ['client', 'setup', 'environment']
        },
        {
          title: 'Authentication with Supabase',
          description: 'Implement user authentication',
          code: `import { supabase } from '@/lib/supabase'

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// Sign out
const { error } = await supabase.auth.signOut()`,
          language: 'typescript',
          tags: ['authentication', 'signup', 'signin', 'signout']
        }
      ]
    };

    return snippets[libraryId] || [];
  }

  /**
   * Search across all configured libraries
   */
  async searchLibraries(query: string): Promise<LibraryDoc[]> {
    const results: LibraryDoc[] = [];
    
    for (const library of this.config.libraries) {
      try {
        const doc = await this.getLibraryDocs(library, query);
        if (doc.documentation.toLowerCase().includes(query.toLowerCase())) {
          results.push(doc);
        }
      } catch (error) {
        console.warn(`Failed to search in ${library}:`, error);
      }
    }
    
    return results;
  }

  /**
   * Get quick help for common development tasks
   */
  async getQuickHelp(task: string): Promise<CodeSnippet[]> {
    const helpMap: Record<string, { library: string; topic: string }> = {
      'authentication': { library: 'supabase', topic: 'auth' },
      'routing': { library: 'next.js', topic: 'app-router' },
      'forms': { library: 'react-hook-form', topic: 'validation' },
      'styling': { library: 'tailwindcss', topic: 'components' },
      'state': { library: 'react', topic: 'hooks' },
      'database': { library: 'supabase', topic: 'database' },
      'api': { library: 'next.js', topic: 'api-routes' }
    };

    const help = helpMap[task.toLowerCase()];
    if (help) {
      const doc = await this.getLibraryDocs(help.library, help.topic);
      return doc.codeSnippets;
    }

    return [];
  }

  /**
   * Clear cache for a specific library or all libraries
   */
  clearCache(libraryName?: string): void {
    if (libraryName) {
      for (const key of this.cache.keys()) {
        if (key.startsWith(libraryName)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }
}

// Export singleton instance
export const context7Client = new Context7Client({
  libraries: [
    'next.js',
    'react',
    'typescript',
    'tailwindcss',
    'supabase',
    '@radix-ui/react-accordion',
    '@radix-ui/react-dialog',
    '@radix-ui/react-dropdown-menu',
    '@radix-ui/react-tabs',
    '@radix-ui/react-toast',
    'lucide-react',
    'react-hook-form',
    'zod',
    'class-variance-authority',
    'clsx',
    'tailwind-merge',
    'date-fns',
    'recharts'
  ],
  defaultTokens: 10000,
  autoUpdate: true
});

export default context7Client; 