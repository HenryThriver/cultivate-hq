// Script to create a development user for local testing
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'; // Default local service key

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createDevUser() {
  try {
    console.log('Creating development user...');
    
    // Create user with admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email: `${TEST_CONFIG.auth.email}`,
      password: `${TEST_CONFIG.auth.password}`,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name: 'Henry (Dev)',
        full_name: 'Henry (Dev)'
      }
    });

    if (error) {
      console.error('Error creating user:', error);
      return;
    }

    console.log('✅ Dev user created successfully!');
    console.log('📧 Email: ${TEST_CONFIG.auth.email}');
    console.log('🔐 Password: ${TEST_CONFIG.auth.password}');
    console.log('🆔 User ID:', data.user.id);

    // Update the actions to use this user ID
    const userId = data.user.id;
    
    const { error: updateError } = await supabase
      .from('actions')
      .update({ user_id: userId })
      .eq('user_id', '0fa5e172-1cc0-4c5e-aca5-d2f43a3ce8f0');

    if (updateError) {
      console.error('Error updating actions:', updateError);
      return;
    }

    console.log('✅ Actions updated to use new user ID');

    // Mark onboarding as completed for dev user
    const { error: onboardingError } = await supabase
      .from('users')
      .update({ 
        onboarding_completed_at: new Date().toISOString(),
        name: 'Henry (Dev)'
      })
      .eq('id', userId);

    if (onboardingError) {
      console.error('Error updating onboarding status:', onboardingError);
      return;
    }

    console.log('✅ Onboarding marked as completed - will skip onboarding flow');
    console.log('🎯 You can now log in at http://localhost:3000/auth/login');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createDevUser();