// Test directo de Supabase Auth - Ejecutar con: node test-supabase-auth.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xfikudmztphbtgnmlkmr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmaWt1ZG16dHBoYnRnbm1sa21yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MDM2MTAsImV4cCI6MjA5MjQ3OTYxMH0.as0PoGt5dAMg5xQWOiszyYm0zpdTRFx2jKdO9RqrB6I';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
  console.log('🧪 TEST 1: Intentando login con superadmin@demo.com...');
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'superadmin@demo.com',
      password: 'Admin123!'
    });
    
    if (error) {
      console.error('❌ ERROR EN LOGIN:', error.message);
      console.error('Detalles:', JSON.stringify(error, null, 2));
      
      // Test 2: Intentar crear el usuario
      console.log('\n🧪 TEST 2: Intentando crear usuario...');
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email: 'superadmin@demo.com',
        password: 'Admin123!',
        options: {
          data: {
            full_name: 'Super Admin',
            is_superadmin: true
          }
        }
      });
      
      if (signupError) {
        console.error('❌ ERROR EN SIGNUP:', signupError.message);
      } else {
        console.log('✅ Usuario creado exitosamente');
        console.log('User ID:', signupData.user?.id);
        console.log('Email confirmado:', signupData.user?.email_confirmed_at ? 'SÍ' : 'NO');
      }
    } else {
      console.log('✅ LOGIN EXITOSO!');
      console.log('User ID:', data.user?.id);
      console.log('Email:', data.user?.email);
      console.log('Session:', data.session ? 'Activa' : 'No activa');
    }
  } catch (err) {
    console.error('❌ ERROR FATAL:', err);
  }
}

testAuth();