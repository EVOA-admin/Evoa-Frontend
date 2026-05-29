import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config({ path: '.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  // Let's create a temp user to get a token
  const email = `test-${Date.now()}@example.com`;
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: 'password123'
  });
  
  if (authError) {
    console.error("Auth error:", authError.message);
    return;
  }
  
  const token = authData.session?.access_token;
  if (!token) {
    console.log("No token, maybe email confirmation required?");
    return;
  }
  
  console.log("Got token. Fetching /api/posts/rising-startups...");
  
  try {
    const res = await fetch('http://localhost:3000/api/posts/rising-startups', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const status = res.status;
    const text = await res.text();
    console.log(`Status: ${status}`);
    console.log(`Response: ${text.slice(0, 500)}`);
  } catch(e) {
    console.error("Fetch error:", e.message);
  }
}
run();
