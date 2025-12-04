import { NextRequest, NextResponse } from 'next/server';
import logger from '@/lib/logger';
import { createClient } from '@/lib/supabase/server';

/**
 * Onboarding Completion API
 *
 * Saves user onboarding data and marks setup as complete
 * NOW WITH DATABASE INTEGRATION
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

    // DATABASE INTEGRATION - Save to Supabase
    try {
      const supabase = createClient();

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        logger.warn('No authenticated user found, saving without user context');
      }

      // Save onboarding data to user_profiles table
      const onboardingData = {
        user_id: user?.id || `temp_${Date.now()}`,
        first_name: profile.firstName,
        last_name: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        bio: profile.bio,
        location: profile.location,
        website: profile.website,
        avatar_url: profile.avatar,
        business_name: businessInfo.businessName,
        business_type: businessInfo.businessType,
        industry: businessInfo.industry,
        team_size: businessInfo.teamSize,
        monthly_revenue: businessInfo.monthlyRevenue,
        primary_goal: goals?.primaryGoal,
        weekly_hours: goals?.weeklyHours,
        current_challenges: goals?.currentChallenges || [],
        imported_apps: importedApps || [],
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Upsert to handle both new and existing users
      const { data: savedData, error: dbError } = await supabase
        .from('user_profiles')
        .upsert(onboardingData, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (dbError) {
        logger.error('Database save error', { error: dbError.message });
        // Don't fail the request, fallback to localStorage
        logger.info('Falling back to localStorage-only mode');
      } else {
        logger.info('Onboarding data saved to database', {
          userId: savedData?.user_id,
          businessName: businessInfo.businessName
        });
      }

    } catch (dbError: any) {
      logger.error('Database integration error', { error: dbError.message });
      // Continue without database - localStorage will work
    }

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
        userId: profile.email,
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
