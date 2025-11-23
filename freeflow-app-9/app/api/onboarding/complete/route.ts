import { NextRequest, NextResponse } from 'next/server';
import logger from '@/lib/logger';

/**
 * Onboarding Completion API
 *
 * Saves user onboarding data and marks setup as complete
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profile, businessInfo, goals, importedApps } = body;

    logger.info('Completing onboarding', {
      hasProfile: !!profile,
      hasBusiness: !!businessInfo,
      hasGoals: !!goals,
      importedAppsCount: importedApps?.length || 0
    });

    // Validate required fields
    if (!profile?.firstName || !profile?.email) {
      return NextResponse.json(
        { error: 'Profile information is required' },
        { status: 400 }
      );
    }

    if (!businessInfo?.businessName) {
      return NextResponse.json(
        { error: 'Business information is required' },
        { status: 400 }
      );
    }

    // In production, you would:
    // 1. Save profile to database
    // 2. Save business info to database
    // 3. Save goals and preferences
    // 4. Create onboarding completion record
    // 5. Trigger welcome email
    // 6. Set up initial workspace/templates

    // Mock successful save
    await new Promise(resolve => setTimeout(resolve, 1000));

    logger.info('Onboarding completed successfully', {
      email: profile.email,
      businessName: businessInfo.businessName,
      primaryGoal: goals?.primaryGoal,
      importedApps: importedApps
    });

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully',
      data: {
        userId: 'user_' + Math.random().toString(36).substr(2, 9),
        onboardingCompletedAt: new Date().toISOString(),
        nextSteps: [
          'Configure automation rules',
          'Connect integrations',
          'Import or create first project',
          'Invite team members'
        ]
      }
    });

  } catch (error: any) {
    logger.error('Onboarding completion failed', { error: error.message });

    return NextResponse.json(
      { error: error.message || 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // In production, fetch onboarding status from database
    const mockOnboardingStatus = {
      completed: false,
      currentStep: 'welcome',
      progress: 0,
      startedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: mockOnboardingStatus
    });

  } catch (error: any) {
    logger.error('Failed to fetch onboarding status', { error: error.message });

    return NextResponse.json(
      { error: error.message || 'Failed to fetch onboarding status' },
      { status: 500 }
    );
  }
}
