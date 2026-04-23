-- CREAR ECOSISTEMA DEMO COMPLETO
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_company_id UUID;
  v_superadmin_id UUID;
  v_admin_user_id UUID;
  v_podo_user_id UUID;
  v_patient_user_id UUID;
BEGIN
  -- 1. SUPERADMIN GLOBAL
  SELECT id INTO v_superadmin_id FROM auth.users WHERE email = 'superadmin@demo.com';
  IF v_superadmin_id IS NULL THEN
    v_superadmin_id := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, role, aud)
    VALUES (
      v_superadmin_id, 
      '00000000-0000-0000-0000-000000000000', 
      'superadmin@demo.com', 
      crypt('Admin123!', gen_salt('bf')), 
      now(), 
      '{"provider":"email","providers":["email"]}', 
      '{"full_name":"Super Administrador"}', 
      'authenticated', 
      'authenticated'
    );
  ELSE
    UPDATE auth.users SET encrypted_password = crypt('Admin123!', gen_salt('bf')) WHERE id = v_superadmin_id;
  END IF;

  -- Crear perfil de superadmin en tabla users
  INSERT INTO public.users (id, email, full_name, is_superadmin)
  VALUES (v_superadmin_id, 'superadmin@demo.com', 'Super Administrador', true)
  ON CONFLICT (id) DO UPDATE SET is_superadmin = true;

  -- 2. CLINICA DEMO
  SELECT id INTO v_company_id FROM public.companies WHERE slug = 'demo';
  IF v_company_id IS NULL THEN
    v_company_id := gen_random_uuid();
    INSERT INTO public.companies (id, name, slug, status, metadata)
    VALUES (
      v_company_id, 
      'Clínica Podológica Demo', 
      'demo', 
      'active',
      '{"settings": {"allow_self_booking": true, "allow_public_registration": true, "allow_patient_login": true}}'::jsonb
    );
  ELSE
    UPDATE public.companies SET 
      name = 'Clínica Podológica Demo', 
      status = 'active',
      metadata = '{"settings": {"allow_self_booking": true, "allow_public_registration": true, "allow_patient_login": true}}'::jsonb
    WHERE id = v_company_id;
  END IF;

  -- 3. ADMIN DE LA CLINICA
  SELECT id INTO v_admin_user_id FROM auth.users WHERE email = 'admin@demo.com';
  IF v_admin_user_id IS NULL THEN
    v_admin_user_id := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, role, aud)
    VALUES (
      v_admin_user_id, 
      '00000000-0000-0000-0000-000000000000', 
      'admin@demo.com', 
      crypt('Admin123!', gen_salt('bf')), 
      now(), 
      '{"provider":"email","providers":["email"]}', 
      '{"full_name":"Administrador Clínica"}', 
      'authenticated', 
      'authenticated'
    );
  ELSE
    UPDATE auth.users SET encrypted_password = crypt('Admin123!', gen_salt('bf')) WHERE id = v_admin_user_id;
  END IF;

  -- Crear perfil
  INSERT INTO public.users (id, email, full_name)
  VALUES (v_admin_user_id, 'admin@demo.com', 'Administrador Clínica')
  ON CONFLICT (id) DO UPDATE SET full_name = 'Administrador Clínica';

  -- 4. PODOLOGO DE LA CLINICA
  SELECT id INTO v_podo_user_id FROM auth.users WHERE email = 'podologo@demo.com';
  IF v_podo_user_id IS NULL THEN
    v_podo_user_id := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, role, aud)
    VALUES (
      v_podo_user_id, 
      '00000000-0000-0000-0000-000000000000', 
      'podologo@demo.com', 
      crypt('Admin123!', gen_salt('bf')), 
      now(), 
      '{"provider":"email","providers":["email"]}', 
      '{"full_name":"Dr. Podólogo Demo"}', 
      'authenticated', 
      'authenticated'
    );
  ELSE
    UPDATE auth.users SET encrypted_password = crypt('Admin123!', gen_salt('bf')) WHERE id = v_podo_user_id;
  END IF;

  -- Crear perfil
  INSERT INTO public.users (id, email, full_name)
  VALUES (v_podo_user_id, 'podologo@demo.com', 'Dr. Podólogo Demo')
  ON CONFLICT (id) DO UPDATE SET full_name = 'Dr. Podólogo Demo';

  -- 5. PACIENTE
  SELECT id INTO v_patient_user_id FROM auth.users WHERE email = 'paciente@demo.com';
  IF v_patient_user_id IS NULL THEN
    v_patient_user_id := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, role, aud)
    VALUES (
      v_patient_user_id, 
      '00000000-0000-0000-0000-000000000000', 
      'paciente@demo.com', 
      crypt('Admin123!', gen_salt('bf')), 
      now(), 
      '{"provider":"email","providers":["email"]}', 
      '{"full_name":"Paciente Demo"}', 
      'authenticated', 
      'authenticated'
    );
  ELSE
    UPDATE auth.users SET encrypted_password = crypt('Admin123!', gen_salt('bf')) WHERE id = v_patient_user_id;
  END IF;

  -- Crear perfil
  INSERT INTO public.users (id, email, full_name)
  VALUES (v_patient_user_id, 'paciente@demo.com', 'Paciente Demo')
  ON CONFLICT (id) DO UPDATE SET full_name = 'Paciente Demo';

  -- 6. ASIGNAR ROLES EN LA CLINICA (company_users)
  -- Nota: 'employee' en lugar de 'podiatrist' porque el CHECK constraint solo permite: owner, admin, employee, viewer
  DELETE FROM public.company_users WHERE company_id = v_company_id;
  
  INSERT INTO public.company_users (company_id, user_id, role, status, accepted_at)
  VALUES (v_company_id, v_admin_user_id, 'owner', 'active', now());
  
  INSERT INTO public.company_users (company_id, user_id, role, status, accepted_at)
  VALUES (v_company_id, v_podo_user_id, 'employee', 'active', now());

  -- 7. CREAR REGISTRO DE PACIENTE EN CLIENTS
  DELETE FROM public.clients WHERE company_id = v_company_id AND email = 'paciente@demo.com';
  
  INSERT INTO public.clients (company_id, name, email, phone, status, auth_user_id)
  VALUES (
    v_company_id, 
    'Paciente Demo', 
    'paciente@demo.com', 
    '+56912345678',
    'active',
    v_patient_user_id
  );

  RAISE NOTICE '✅ Ecosistema demo creado exitosamente';
  RAISE NOTICE '👑 SuperAdmin: superadmin@demo.com';
  RAISE NOTICE '👔 Admin: admin@demo.com';
  RAISE NOTICE '🩺 Podólogo: podologo@demo.com';
  RAISE NOTICE '👤 Paciente: paciente@demo.com';
  RAISE NOTICE '🔑 Contraseña para todos: Admin123!';

END $$;