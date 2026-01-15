// Test Supabase connection and verify tables exist
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Read .env file manually
const envFile = readFileSync('.env', 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length) {
    envVars[key.trim()] = values.join('=').trim();
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseAnonKey = envVars.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key (first 20 chars):', supabaseAnonKey?.substring(0, 20) + '...');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('\n=== Testing Supabase Connection ===\n');

  // Test 1: Check notifications table
  console.log('1. Testing notifications table...');
  try {
    const { data, error, count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .limit(5);

    if (error) {
      console.error('❌ Notifications table error:', error);
    } else {
      console.log(`✅ Notifications table exists. Count: ${count}`);
      console.log('Recent notifications:', data);
    }
  } catch (e) {
    console.error('❌ Exception:', e.message);
  }

  // Test 2: Check admin_users table
  console.log('\n2. Testing admin_users table...');
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('email, name, role, last_activity')
      .limit(5);

    if (error) {
      console.error('❌ Admin users table error:', error);
    } else {
      console.log('✅ Admin users table exists. Users:', data);
    }
  } catch (e) {
    console.error('❌ Exception:', e.message);
  }

  // Test 3: Check password_reset_requests table
  console.log('\n3. Testing password_reset_requests table...');
  try {
    const { data, error } = await supabase
      .from('password_reset_requests')
      .select('*')
      .limit(5);

    if (error) {
      console.error('❌ Password reset requests table error:', error);
    } else {
      console.log('✅ Password reset requests table exists. Requests:', data);
    }
  } catch (e) {
    console.error('❌ Exception:', e.message);
  }

  // Test 4: Try inserting a test notification
  console.log('\n4. Testing notification insert...');
  try {
    const testNotification = {
      type: 'SYSTEM',
      title: 'Test Notification',
      message: 'This is a test notification',
      data: { test: true },
      read: false,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('notifications')
      .insert([testNotification])
      .select()
      .single();

    if (error) {
      console.error('❌ Insert notification error:', error);
    } else {
      console.log('✅ Successfully inserted test notification:', data);

      // Clean up - delete the test notification
      await supabase
        .from('notifications')
        .delete()
        .eq('id', data.id);
      console.log('✅ Test notification cleaned up');
    }
  } catch (e) {
    console.error('❌ Exception:', e.message);
  }

  console.log('\n=== Test Complete ===\n');
}

testConnection();