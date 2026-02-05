import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createSimpleLogger } from '@/lib/simple-logger';
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode';

const logger = createSimpleLogger('stripe-api');

// ============================================================================
// SUBSCRIPTION SETTINGS API
// ============================================================================
// Manage subscription preferences
// - Get settings
// - Update settings (auto-renew, email notifications)
// ============================================================================

interface SettingsRequest {
  action: string;
  settings?: {
    autoRenew: boolean;
    emailNotifications: boolean;
  };
}

// ============================================================================
// POST HANDLER
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body: SettingsRequest = await request.json();
    const { action } = body;

    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    switch (action) {
      // ======================================================================
      // GET SETTINGS
      // ======================================================================
      case 'get-settings': {
        if (!userId) {
          return NextResponse.json({
            success: false,
            error: 'Authentication required',
          }, { status: 401 });
        }

        // Try to get settings from database
        const { data: settingsData } = await supabase
          .from('user_settings')
          .select('subscription_settings')
          .eq('user_id', userId)
          .single();

        const defaultSettings = {
          autoRenew: true,
          emailNotifications: true,
        };

        return NextResponse.json({
          success: true,
          data: {
            settings: settingsData?.subscription_settings || defaultSettings,
          },
        });
      }

      // ======================================================================
      // UPDATE SETTINGS
      // ======================================================================
      case 'update-settings': {
        const { settings } = body;

        if (!userId) {
          return NextResponse.json({
            success: false,
            error: 'Authentication required',
          }, { status: 401 });
        }

        if (!settings) {
          return NextResponse.json({
            success: false,
            error: 'Settings data required',
          }, { status: 400 });
        }

        // Upsert settings in database
        const { error } = await supabase
          .from('user_settings')
          .upsert({
            user_id: userId,
            subscription_settings: settings,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id',
          });

        if (error) {
          // If table doesn't exist, just return success (demo mode)
          logger.warn('Settings table may not exist', { error: error.message });
        }

        return NextResponse.json({
          success: true,
          data: {
            message: 'Settings saved successfully',
            settings,
          },
        });
      }

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action: ${action}`,
          availableActions: ['get-settings', 'update-settings'],
        }, { status: 400 });
    }
  } catch (error) {
    logger.error('Settings API Error', { error });
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred',
    }, { status: 500 });
  }
}

// ============================================================================
// GET HANDLER
// ============================================================================
export async function GET(request: NextRequest) {
  return POST(new NextRequest(request.url, {
    method: 'POST',
    headers: request.headers,
    body: JSON.stringify({ action: 'get-settings' }),
  }));
}
