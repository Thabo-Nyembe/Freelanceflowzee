/**
 * Lighthouse CI Configuration
 *
 * Run with: npx lhci autorun
 */

module.exports = {
  ci: {
    collect: {
      // Static site directory (for local testing)
      staticDistDir: './.next',

      // URLs to test
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/login',
        'http://localhost:3000/dashboard',
      ],

      // Number of runs per URL
      numberOfRuns: 3,

      // Chrome settings
      settings: {
        preset: 'desktop',
        throttling: {
          cpuSlowdownMultiplier: 1,
        },
        skipAudits: [
          'uses-http2', // Dev server doesn't use HTTP/2
        ],
      },

      // Start server command (for CI)
      startServerCommand: 'npm run start',
      startServerReadyPattern: 'Ready',
      startServerReadyTimeout: 30000,
    },

    assert: {
      // Assertions for required scores
      assertions: {
        // Performance
        'categories:performance': ['warn', { minScore: 0.7 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 3000 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        'speed-index': ['warn', { maxNumericValue: 3500 }],

        // Accessibility
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'color-contrast': 'warn',
        'document-title': 'error',
        'html-has-lang': 'error',
        'meta-viewport': 'error',

        // Best Practices
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'is-on-https': 'off', // Dev server uses HTTP
        'no-vulnerable-libraries': 'warn',

        // SEO
        'categories:seo': ['warn', { minScore: 0.9 }],
        'meta-description': 'warn',
        'robots-txt': 'off', // May not exist in dev

        // PWA
        'categories:pwa': ['warn', { minScore: 0.7 }],
        'installable-manifest': 'warn',
        'service-worker': 'warn',
        'maskable-icon': 'warn',
      },
    },

    upload: {
      // Upload to LHCI server or temporary storage
      target: 'temporary-public-storage',

      // GitHub integration (if LHCI_GITHUB_APP_TOKEN is set)
      // target: 'lhci',
      // serverBaseUrl: 'https://your-lhci-server.example.com',
    },

    server: {
      // Local LHCI server config (optional)
      // port: 9001,
      // storage: {
      //   storageMethod: 'sql',
      //   sqlDialect: 'sqlite',
      //   sqlDatabasePath: './.lighthouseci/lhci.db',
      // },
    },
  },
};
