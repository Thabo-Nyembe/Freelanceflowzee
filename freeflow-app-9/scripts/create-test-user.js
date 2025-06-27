#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

// Supabase credentials
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ouzcjoxaupimazrivyta.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91emNqb3hhdXBpbWF6cml2eXRhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDA3NzA5NiwiZXhwIjoyMDY1NjUzMDk2fQ.HIHZQ0KuRBIwZwaTPLxD1E5RQfcQ_e0ar-oC93rTGdQ'

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

console.log('🧪 FreeflowZee Test User Creation')
console.log('📍 Supabase URL: ', SUPABASE_URL)
console.log('🔑 Using Service Role Key for admin operations\n')

// Create admin client for user management
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Test user data
const TEST_USERS = [
  {
    email: 'test@freeflowzee.com',
    password: 'TestPassword123!',
    fullName: 'Test User',
    role: 'freelancer',
    bio: 'Test user for development and testing purposes. Experienced freelance developer specializing in modern web applications.',
    skills: ['Web Development', 'UI/UX Design', 'Project Management', 'React', 'Node.js'],
    hourlyRate: 75.00,
    location: 'Remote',
    timezone: 'UTC',
    avatarUrl: '/avatars/current-user.jpg',
    website: 'https://testuser.freeflowzee.com'
  },
  {
    email: 'demo@freeflowzee.com',
    password: 'DemoPassword123!',
    fullName: 'Demo Client',
    role: 'client',
    bio: 'Demo client account for showcasing client features and presentation purposes.',
    skills: ['Business Strategy', 'Digital Marketing', 'Content Creation'],
    hourlyRate: null,
    location: 'New York, NY',
    timezone: 'America/New_York',
    avatarUrl: '/avatars/client-1.jpg',
    website: 'https://democompany.com'
  },
  {
    email: 'admin@freeflowzee.com',
    password: 'AdminPassword123!',
    fullName: 'Admin User',
    role: 'admin',
    bio: 'Administrator account for platform management and system oversight.',
    skills: ['Platform Management', 'System Administration', 'User Support', 'Analytics'],
    hourlyRate: null,
    location: 'San Francisco, CA',
    timezone: 'America/Los_Angeles',
    avatarUrl: '/avatars/sarah-chen.jpg',
    website: 'https://freeflowzee.com'
  }
]

async function createTestUser(userData) {
  console.log(`\n👤 Creating user: ${userData.email}`)
  
  try {
    // Step 1: Create auth user
    console.log('  🔐 Creating authentication user...')
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true, // Auto-confirm email for testing
      user_metadata: {
        full_name: userData.fullName,
        role: userData.role
      }
    })

    if (authError) {
      if (authError.message.includes('already been registered')) {
        console.log('  ⚠️  User already exists, updating profile...')
        
        // Get existing user
        const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers()
        if (listError) throw listError
        
        const existingUser = existingUsers.users.find(u => u.email === userData.email)
        if (existingUser) {
          // Update existing user profile
          await updateUserProfile(existingUser.id, userData)
          console.log('  ✅ Updated existing user profile')
          return { success: true, user: existingUser, created: false }
        }
      } else {
        throw authError
      }
    }

    const user = authData?.user
    if (!user) {
      throw new Error('User creation failed - no user data returned')
    }

    console.log('  ✅ Authentication user created successfully')
    console.log(`     User ID: ${user.id}`)

    // Step 2: Create user profile
    await createUserProfile(user.id, userData)

    // Step 3: Create sample projects for freelancers
    if (userData.role === 'freelancer') {
      await createSampleProjects(user.id, userData)
    }

    console.log('  🎉 Test user created successfully!')
    
    return { 
      success: true, 
      user: user,
      created: true,
      credentials: {
        email: userData.email,
        password: userData.password
      }
    }

  } catch (error) {
    console.error(`  ❌ Failed to create user ${userData.email}:`, error.message)
    return { success: false, error: error.message }
  }
}

async function createUserProfile(userId, userData) {
  console.log('  👥 Creating user profile...')
  
  const profileData = {
    id: userId,
    full_name: userData.fullName,
    bio: userData.bio,
    skills: userData.skills,
    hourly_rate: userData.hourlyRate,
    location: userData.location,
    timezone: userData.timezone,
    avatar_url: userData.avatarUrl || null,
    website: userData.website || null
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .upsert(profileData)
      .select()

    if (error) throw error
    
    console.log('  ✅ User profile created successfully')
    return data
  } catch (error) {
    console.error('  ❌ Failed to create user profile:', error.message)
    
    // If table doesn't exist, create a minimal version
    if (error.message.includes('relation') && error.message.includes('does not exist')) {
      console.log('  ⚠️  user_profiles table not found, creating basic structure...')
      await createUserProfilesTable()
      
      // Retry profile creation
      const { data, error: retryError } = await supabaseAdmin
        .from('user_profiles')
        .upsert(profileData)
        .select()
        
      if (retryError) throw retryError
      console.log('  ✅ User profile created successfully (after table creation)')
      return data
    }
    throw error
  }
}

async function updateUserProfile(userId, userData) {
  console.log('  🔄 Updating user profile...')
  
  const profileData = {
    id: userId,
    full_name: userData.fullName,
    bio: userData.bio,
    skills: userData.skills,
    hourly_rate: userData.hourlyRate,
    location: userData.location,
    timezone: userData.timezone,
    avatar_url: userData.avatarUrl || null,
    website: userData.website || null
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .upsert(profileData)
      .select()

    if (error) throw error
    return data
  } catch (error) {
    console.error('  ❌ Failed to update user profile:', error.message)
    throw error
  }
}

async function createUserProfilesTable() {
  console.log('  🔧 Creating user_profiles table...')
  
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS user_profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      full_name VARCHAR(200),
      avatar_url TEXT,
      bio TEXT,
      website VARCHAR(255),
      location VARCHAR(100),
      skills TEXT[],
      hourly_rate DECIMAL(10,2),
      timezone VARCHAR(50),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Enable RLS
    ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Users can view their own profile" ON user_profiles
      FOR SELECT USING (auth.uid() = id);

    CREATE POLICY "Users can update their own profile" ON user_profiles
      FOR UPDATE USING (auth.uid() = id);

    CREATE POLICY "Users can insert their own profile" ON user_profiles
      FOR INSERT WITH CHECK (auth.uid() = id);
  `

  try {
    const { error } = await supabaseAdmin.rpc('exec_sql', { 
      sql_query: createTableSQL 
    })
    
    if (error) throw error
    console.log('  ✅ user_profiles table created successfully')
  } catch (error) {
    console.error('  ❌ Failed to create user_profiles table:', error.message)
    throw error
  }
}

async function createSampleProjects(userId, userData) {
  console.log('  📁 Creating sample projects...')
  
  const sampleProjects = [
    {
      title: 'Brand Identity Design',
      description: 'Complete brand identity package including logo, color palette, and brand guidelines',
      status: 'active',
      budget: 2500,
      client_name: 'Acme Corporation',
      client_email: 'client@acmecorp.com',
      progress: 75,
      priority: 'high',
      start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago'
      end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 14 days from now'
    },
    {
      title: 'E-commerce Website Development',
      description: 'Modern e-commerce website with payment integration and admin dashboard',
      status: 'completed',
      budget: 5000,
      client_name: 'Fashion Store LLC',
      client_email: 'store@fashionstore.com',
      progress: 100,
      priority: 'medium',
      start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago'
      end_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7 days ago'
    },
    {
      title: 'Mobile App UI/UX Design',
      description: 'User interface and experience design for iOS and Android mobile application',
      status: 'draft',
      budget: 3200,
      client_name: 'Tech Startup Inc',
      client_email: 'startup@techstartup.com',
      progress: 0,
      priority: 'medium',
      start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now'
      end_date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 28 days from now'
    }
  ]

  try {
    for (const project of sampleProjects) {
      const projectData = {
        ...project,
        user_id: userId
      }

      const { error } = await supabaseAdmin
        .from('projects')
        .insert(projectData)

      if (error) {
        console.log(`    ⚠️  Skipped project "${project.title}": ${error.message}`)
      } else {
        console.log(`    ✅ Created project: ${project.title}`)
      }
    }
  } catch (error) {
    console.log('  ⚠️  Projects table not available, skipping sample projects')
  }
}

async function verifyUserCreation() {
  console.log('\n🔍 Verifying test users...')
  
  try {
    // List all users
    const { data: users, error } = await supabaseAdmin.auth.admin.listUsers()
    if (error) throw error

    console.log(`\n📊 Total users in database: ${users.users.length}`)
    
    const testUsers = users.users.filter(user => 
      user.email && user.email.includes('freeflowzee.com')
    )

    if (testUsers.length > 0) {
      console.log('\n🧪 Test users found: ')
      testUsers.forEach(user => {
        console.log(`  ✅ ${user.email} (ID: ${user.id})`)
        console.log(`     Created: ${new Date(user.created_at).toLocaleString()}`)
        console.log(`     Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`)
      })
    } else {
      console.log('\n⚠️  No test users found')
    }

    return testUsers
  } catch (error) {
    console.error('❌ Error verifying users:', error.message)
    return []
  }
}

async function displayLoginInstructions(results) {
  console.log('\n📋 LOGIN INSTRUCTIONS')
  console.log('=' .repeat(50))'
  
  const successfulUsers = results.filter(r => r.success)
  
  if (successfulUsers.length === 0) {
    console.log('❌ No users were created successfully')
    return
  }

  console.log('\n🔐 You can now log in with these test accounts: ')
  console.log('\n📱 Application URL: http://localhost:3002/login')
  
  successfulUsers.forEach(result => {
    if (result.credentials) {
      console.log(`\n👤 ${result.credentials.email}`)
      console.log(`   Password: ${result.credentials.password}`)
      console.log(`   Role: ${result.user?.user_metadata?.role || 'freelancer'}`)
      console.log(`   Status: ${result.created ? 'Newly Created' : 'Updated'}`)
    }
  })

  console.log('\n📝 Notes:')
  console.log('• All test users have confirmed email addresses')
  console.log('• Passwords follow strong security requirements')
  console.log('• User profiles are pre-populated with sample data')
  console.log('• Freelancer accounts include sample projects')
  console.log('• Authentication bypass is enabled for testing')
}

async function main() {
  try {
    console.log('🚀 Starting test user creation process...\n')
    
    // Test database connection
    console.log('🔗 Testing database connection...')
    const { data, error } = await supabaseAdmin.auth.admin.listUsers()
    if (error) {
      throw new Error(`Database connection failed: ${error.message}`)
    }
    console.log('✅ Database connection successful\n')

    // Create test users
    const results = []
    for (const userData of TEST_USERS) {
      const result = await createTestUser(userData)
      results.push(result)
    }

    // Verify creation
    await verifyUserCreation()

    // Display login instructions
    await displayLoginInstructions(results)

    console.log('\n🎉 Test user creation process completed!')
    console.log('\n💡 Next steps:')
    console.log('• Visit http://localhost:3002/login to test authentication')
    console.log('• Use the credentials above to log in')
    console.log('• Test all dashboard features and enterprise functionality')
    console.log('• Run Playwright tests with these authenticated users')

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message)
    process.exit(1)
  }
}

// Run the script
if (require.main === module) {
  main()
}

module.exports = {
  createTestUser,
  TEST_USERS,
  verifyUserCreation
} 