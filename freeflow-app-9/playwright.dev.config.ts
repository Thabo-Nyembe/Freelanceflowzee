import { defineConfig } from '@playwright/test';
import base from './playwright.config'

({
  ...base,
  webServer: undefined,
}) 