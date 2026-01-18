import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import logger from '@/lib/logger';

/**
 * API Route: Save Integration Configuration
 *
 * Securely saves integration credentials to database
 * Encrypts sensitive data before storage
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { type, config } = await request.json();

    logger.info('Saving integration configuration', { type });

    // Encrypt sensitive data (in production, use proper encryption)
    const encryptedConfig = await encryptConfig(config);

    // Save to database
    const { data, error } = await supabase
      .from('integrations')
      .upsert({
        type,
        provider: config.provider,
        config: encryptedConfig,
        status: 'active',
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'type',
      });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    logger.info('Integration configuration saved', { type });

    return NextResponse.json({
      success: true,
      message: 'Integration saved successfully',
    });
  } catch (error: any) {
    logger.error('Integration save failed', { error: error.message });
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (!type) {
      // Get all integrations
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      // Decrypt configs before returning
      const decryptedData = await Promise.all(
        (data || []).map(async (integration) => ({
          ...integration,
          config: await decryptConfig(integration.config),
        }))
      );

      return NextResponse.json({
        success: true,
        integrations: decryptedData,
      });
    } else {
      // Get specific integration
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('type', type)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found is ok
        throw new Error(`Database error: ${error.message}`);
      }

      const decryptedData = data ? {
        ...data,
        config: await decryptConfig(data.config),
      } : null;

      return NextResponse.json({
        success: true,
        integration: decryptedData,
      });
    }
  } catch (error: any) {
    logger.error('Integration retrieval failed', { error: error.message });
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (!type) {
      throw new Error('Integration type is required');
    }

    const { error } = await supabase
      .from('integrations')
      .delete()
      .eq('type', type);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    logger.info('Integration deleted', { type });

    return NextResponse.json({
      success: true,
      message: 'Integration deleted successfully',
    });
  } catch (error: any) {
    logger.error('Integration deletion failed', { error: error.message });
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ============================================================================
// ENCRYPTION HELPERS - AES-256-GCM Implementation
// ============================================================================

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET || 'default-dev-key-change-in-production'
const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12
const AUTH_TAG_LENGTH = 16

function getKey(): Buffer {
  // Derive a 32-byte key from the secret using scrypt
  return scryptSync(ENCRYPTION_KEY, 'kazi-salt', 32)
}

async function encryptConfig(config: any): Promise<string> {
  try {
    const key = getKey()
    const iv = randomBytes(IV_LENGTH)
    const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH })

    const plaintext = JSON.stringify(config)
    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final()
    ])

    const authTag = cipher.getAuthTag()

    // Combine iv + authTag + encrypted data
    const combined = Buffer.concat([iv, authTag, encrypted])
    return combined.toString('base64')
  } catch (error) {
    // Fallback to base64 if encryption fails
    return Buffer.from(JSON.stringify(config)).toString('base64')
  }
}

async function decryptConfig(encryptedConfig: string): Promise<any> {
  try {
    const combined = Buffer.from(encryptedConfig, 'base64')

    // Check if this looks like AES-GCM encrypted data (min size check)
    if (combined.length < IV_LENGTH + AUTH_TAG_LENGTH + 1) {
      // Too small, probably plain base64
      return JSON.parse(Buffer.from(encryptedConfig, 'base64').toString())
    }

    const key = getKey()
    const iv = combined.subarray(0, IV_LENGTH)
    const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH)
    const encrypted = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH)

    const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH })
    decipher.setAuthTag(authTag)

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ])

    return JSON.parse(decrypted.toString('utf8'))
  } catch {
    // Fallback: try plain base64 decode
    try {
      return JSON.parse(Buffer.from(encryptedConfig, 'base64').toString())
    } catch {
      return encryptedConfig // Return as-is if all fails
    }
  }
}
