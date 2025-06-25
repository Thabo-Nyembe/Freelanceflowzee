module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
    '@testing-library/jest-dom/extend-expect'
  ],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/tests/e2e/'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/tests/__mocks__/fileMock.js'
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }]
  },
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/tests/e2e/**'
  ],
  testMatch: [
    '<rootDir>/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/**/*.{spec,test}.{js,jsx,ts,tsx}',
    '!<rootDir>/tests/e2e/**/*'
  ],
  // Integration test specific settings
  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/**/__tests__/unit/**/*.{js,jsx,ts,tsx}']
    },
    {
      displayName: 'integration',
      testMatch: ['<rootDir>/**/__tests__/integration/**/*.{js,jsx,ts,tsx}'],
      setupFilesAfterEnv: [
        '<rootDir>/jest.setup.js',
        '@testing-library/jest-dom/extend-expect',
        '<rootDir>/tests/setup/integration-setup.js'
      ]
    }
  ],
  verbose: true,
  testTimeout: 30000
} 