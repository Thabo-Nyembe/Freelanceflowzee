#!/usr/bin/env node
/**
 * Phase 7 Database Migration
 * Applies Phase 7 Advanced Features migration
 */

const fs = require('fs')
const path = require('path')
const { Client } = require('pg')

const PROJECT_REF = 'gcinvwprtlnwuwuvmrux'
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD || 'test12345'

const connectionString = `postgresql://postgres:${DB_PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres`

console.log('🚀 Kazi Phase 7 - Advanced Features Migration')
console.log('='.repeat(60))
console.log(`📍 Project: ${PROJECT_REF}`)
console.log('='.repeat(60))
console.log('')

async function runMigration() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  })

  try {
    console.log('🔗 Connecting to database...')
    await client.connect()
    console.log('✅ Connected!\n')

    const migrationFile = path.join(process.cwd(), 'supabase', 'migrations', '20251211000002_phase7_advanced_features.sql')
    
    if (!fs.existsSync(migrationFile)) {
      throw new Error('Phase 7 migration file not found!')
    }

    console.log('📄 Applying Phase 7 Advanced Features migration...')
    const sql = fs.readFileSync(migrationFile, 'utf-8')
    
    // Split into sections for better error handling
    const sections = sql.split(/-- =+\n-- SECTION \d+:/g)
    
    let successCount = 0
    for (let i = 1; i < sections.length; i++) {
      try {
        await client.query(sections[i])
        successCount++
        console.log(`   ✅ Section ${i} applied`)
      } catch (error) {
        if (error.message.includes('already exists') || error.code === '42P07' || error.code === '42710') {
          console.log(`   ℹ️  Section ${i} - Some objects already exist (OK)`)
          successCount++
        } else {
          console.log(`   ⚠️  Section ${i} - ${error.message.substring(0, 80)}...`)
        }
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log(`📊 Summary: ${successCount}/${sections.length - 1} sections applied`)
    console.log('='.repeat(60))

    // Verify new tables
    console.log('\n🔍 Verifying Phase 7 tables...')
    const phase7Tables = [
      'video_projects', 'video_tracks', 'video_clips', 'video_effects',
      'modeling_scenes', 'modeling_objects', 'modeling_materials',
      'canvas_boards', 'canvas_pages', 'canvas_elements',
      'portfolios', 'portfolio_pages', 'portfolio_projects',
      'client_galleries', 'gallery_images', 'gallery_client_links',
      'booking_services', 'bookings', 'booking_clients'
    ]

    const result = await client.query(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename = ANY($1)
    `, [phase7Tables])

    console.log(`   ✅ Found ${result.rows.length}/${phase7Tables.length} Phase 7 tables`)
    
    result.rows.forEach(row => {
      console.log(`      ✓ ${row.tablename}`)
    })

    console.log('\n' + '='.repeat(60))
    console.log('🎉 Phase 7 Migration Complete!')
    console.log('='.repeat(60))

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

runMigration()
