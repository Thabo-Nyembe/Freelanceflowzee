import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, waitForHydration, mockHydrationData } from '../../fixtures/hydration';
import DashboardPage from '@/app/dashboard/page';

describe('Dashboard Hydration', () => {
  beforeEach(() => {
    // Reset any runtime handlers
    jest.clearAllMocks();
  });

  it('should hydrate dashboard with initial data', async () => {
    // Render the dashboard with test wrapper
    renderWithProviders(<DashboardPage />);

    // Wait for initial hydration
    await waitForHydration();

    // Verify that the dashboard components are present
    await waitFor(() => {
      expect(screen.getByTestId('projects-hub')).toBeInTheDocument();
      expect(screen.getByTestId('community-hub')).toBeInTheDocument();
      expect(screen.getByTestId('video-studio')).toBeInTheDocument();
      expect(screen.getByTestId('my-day')).toBeInTheDocument();
      expect(screen.getByTestId('ai-assistant')).toBeInTheDocument();
    });

    // Verify that mock data is properly hydrated
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('Test Post')).toBeInTheDocument();
  });

  it('should handle hydration errors gracefully', async () => {
    // Mock a hydration error
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Render the dashboard with test wrapper
    renderWithProviders(<DashboardPage />);

    // Wait for error boundary to catch the error
    await waitForHydration();

    // Verify that error message is displayed
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();

    // Restore console.error
    (console.error as jest.Mock).mockRestore();
  });
}); 