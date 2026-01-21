
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const supabase = createClient(envConfig.NEXT_PUBLIC_SUPABASE_URL, envConfig.SUPABASE_SERVICE_ROLE_KEY);

async function probe() {
    console.log('Probing buckets...');
    const { data, error } = await supabase.storage.listBuckets();
    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log('Buckets:', JSON.stringify(data, null, 2));
    }
}

probe();
