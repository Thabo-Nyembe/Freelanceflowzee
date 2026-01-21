
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables manually since we might not have dotenv configured for script
const envPath = path.resolve(__dirname, '../.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = envConfig.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.log('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function probe() {
    console.log('Probing tables...');

    const tables = ['files', 'folders', 'file_shares'];
    const results = {};

    for (const table of tables) {
        try {
            const { data, error } = await supabase.from(table).select('id').limit(1);
            if (error) {
                results[table] = { exists: false, error: error.message };
            } else {
                results[table] = { exists: true };
            }
        } catch (e) {
            results[table] = { exists: false, error: e.message };
        }
    }

    console.log(JSON.stringify(results, null, 2));
}

probe();
