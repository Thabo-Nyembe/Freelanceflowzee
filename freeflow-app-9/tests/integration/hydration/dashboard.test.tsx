import React from &apos;react&apos;;
import { screen, waitFor } from &apos;@testing-library/react&apos;;
import { renderWithProviders, waitForHydration, mockHydrationData } from &apos;../../fixtures/hydration&apos;;
import DashboardPage from &apos;@/app/dashboard/page&apos;;

describe(&apos;Dashboard Hydration&apos;, () => {
  beforeEach(() => {
    // Reset any runtime handlers
    jest.clearAllMocks();
  });

  it(&apos;should hydrate dashboard with initial data&apos;, async () => {
    // Render the dashboard with test wrapper
    renderWithProviders(<DashboardPage />);

    // Wait for initial hydration
    await waitForHydration();

    // Verify that the dashboard components are present
    await waitFor(() => {
      expect(screen.getByTestId(&apos;projects-hub&apos;)).toBeInTheDocument();
      expect(screen.getByTestId(&apos;community-hub&apos;)).toBeInTheDocument();
      expect(screen.getByTestId(&apos;video-studio&apos;)).toBeInTheDocument();
      expect(screen.getByTestId(&apos;my-day&apos;)).toBeInTheDocument();
      expect(screen.getByTestId(&apos;ai-assistant&apos;)).toBeInTheDocument();
    });

    // Verify that mock data is properly hydrated
    expect(screen.getByText(&apos;Test Project&apos;)).toBeInTheDocument();
    expect(screen.getByText(&apos;Test Post&apos;)).toBeInTheDocument();
  });

  it(&apos;should handle hydration errors gracefully&apos;, async () => {
    // Mock a hydration error
    jest.spyOn(console, &apos;error&apos;).mockImplementation(() => {});
    
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