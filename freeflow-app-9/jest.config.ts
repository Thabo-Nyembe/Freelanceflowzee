import type { Config } from 'jest'
import nextJest from 'next/jest'
import { StagewiseToolbar } from '@stagewise/toolbar-next';
import { ReactPlugin } from '@stagewise-plugins/react';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './'
})


// Add any custom config to be passed to Jest
const customJestConfig: Config = {
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup.ts"],
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "\\.(css|less|sass|scss)$": "identity-obj-proxy",
    "\\.(gif|ttf|eot|svg|png|jpg|jpeg)$": '<rootDir>/__mocks__/fileMock.js'
  },
  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/tests/e2e/",
    "<rootDir>/tests/integration/",
    "<rootDir>/tests/app.spec.ts",
    "<rootDir>/tests/app.test.ts",
    "<rootDir>/tests/basic.test.ts",
    "<rootDir>/tests/basic-hydration.test.ts",
    "<rootDir>/tests/hydration.test.ts",
    "<rootDir>/tests/projects-hub.test.ts",
    "<rootDir>/tests/projects-hub-hydration.test.ts",
    "<rootDir>/e2e/"
  ],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }]
  },
  transformIgnorePatterns: [
    "/node_modules/",
    "^.+\\.module\\.(css|sass|scss)$"
  ],
  testMatch: [
    "**/__tests__/**/*.[jt]s?(x)"
  ],
  globals: {
    "ts-jest": {
      tsconfig: {
        jsx: 'react'
      }
    }
  }
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(customJestConfig) 