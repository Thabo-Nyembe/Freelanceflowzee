import bcrypt from 'bcryptjs';

const SUPABASE_URL = 'https://gcinvwprtlnwuwuvmrux.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjaW52d3BydGxud3V3dXZtcnV4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDA1ODU5MiwiZXhwIjoyMDc5NjM0NTkyfQ.pFnOu-jsRChBCQigpNOSpyIFF_grbHTwrv0eBh9JYbo';

const EMAIL = 'alex@freeflow.io';
const PASSWORD = 'investor2026';
const USER_ID = '00000000-0000-0000-0000-000000000001';

// Hash the password
const passwordHash = await bcrypt.hash(PASSWORD, 10);
console.log('Password hashed');

// Check if user exists in users table
const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/users?email=eq.${EMAIL}`, {
  headers: {
    'Authorization': `Bearer ${SERVICE_KEY}`,
    'apikey': SERVICE_KEY
  }
});
const existingUsers = await checkRes.json();
console.log('Existing users:', existingUsers);

if (Array.isArray(existingUsers) && existingUsers.length > 0) {
  // Update password
  console.log('Updating existing user password...');
  const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/users?email=eq.${EMAIL}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'apikey': SERVICE_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      password_hash: passwordHash,
      email_verified: true
    })
  });

  if (updateRes.ok) {
    console.log('✅ Password updated!');
  } else {
    console.log('Update failed:', await updateRes.text());
  }
} else {
  // Create user
  console.log('Creating new user in users table...');
  const createRes = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'apikey': SERVICE_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      id: USER_ID,
      email: EMAIL,
      name: 'Alex Demo',
      password_hash: passwordHash,
      email_verified: true,
      role: 'user',
      created_at: new Date().toISOString()
    })
  });

  if (createRes.ok) {
    const newUser = await createRes.json();
    console.log('✅ User created:', newUser);
  } else {
    console.log('Create failed:', await createRes.text());
  }
}

console.log('\n=== DEMO LOGIN ===');
console.log('Email:', EMAIL);
console.log('Password:', PASSWORD);
