import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple .env parser to avoid adding dependencies
function loadEnv() {
  try {
    const envPath = path.resolve(__dirname, '.env');
    if (!fs.existsSync(envPath)) {
      console.error('❌ .env file not found at:', envPath);
      return;
    }
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach((line) => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["'](.+)["']$/, '$1'); // Remove quotes
        process.env[key] = value;
      }
    });
    console.log('✅ Environment variables loaded.');
  } catch (error) {
    console.error('❌ Error loading .env:', error);
  }
}

loadEnv();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  console.log('URL:', supabaseUrl ? 'Found' : 'Missing');
  console.log('Key:', supabaseAnonKey ? 'Found' : 'Missing');
  process.exit(1);
}

console.log('Testing connection to Supabase...');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkConnection() {
  try {
    // Try to get the session - this verifies the client and URL/Key are somewhat valid
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Supabase Auth Connection Failed:', sessionError.message);
      // It might trigger if the URL is invalid even before hitting the auth service
    } else {
      console.log('✅ Supabase Auth Service Connection Successful!');
    }

    // Try a simple select from a likely common endpoint if possible, but auth is usually enough to verify connectivity path.
    // Let's try to query a non-existent table just to see if we reach the DB, usually returns a specific error vs network error.
    // Or better, just report success if Auth worked.
    
    if (!sessionError) {
        console.log('🎉 Connection test passed.');
    }

  } catch (err) {
    console.error('❌ Unexpected error during connection test:', err);
  }
}

checkConnection();
