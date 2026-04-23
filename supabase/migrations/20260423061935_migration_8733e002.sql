-- =====================================================
-- CREAR PRIMER SUPERADMIN
-- =====================================================
-- Este usuario tiene acceso global a todo el sistema

-- Primero, insertamos el superadmin en auth.users manualmente
-- IMPORTANTE: Ejecutar esto UNA SOLA VEZ en producción

DO $$
DECLARE
  v_superadmin_id uuid;
BEGIN
  -- Crear usuario superadmin en auth.users
  -- Email: superadmin@podospro.com
  -- Password: PodosPro2024!Super
  
  -- Verificar si ya existe
  SELECT id INTO v_superadmin_id 
  FROM auth.users 
  WHERE email = 'superadmin@podospro.com';
  
  IF v_superadmin_id IS NULL THEN
    -- Insertar en auth.users (requiere acceso directo a la tabla auth)
    -- En producción, usar Supabase Dashboard o API
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'superadmin@podospro.com',
      crypt('PodosPro2024!Super', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Super Admin","is_superadmin":true}'::jsonb,
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    )
    RETURNING id INTO v_superadmin_id;
    
    -- Crear perfil público
    INSERT INTO public.users (id, email, full_name)
    VALUES (v_superadmin_id, 'superadmin@podospro.com', 'Super Admin')
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'SuperAdmin creado exitosamente';
    RAISE NOTICE 'Email: superadmin@podospro.com';
    RAISE NOTICE 'Password: PodosPro2024!Super';
  ELSE
    RAISE NOTICE 'SuperAdmin ya existe con ID: %', v_superadmin_id;
  END IF;
END $$;

-- =====================================================
-- SISTEMA DE SLUGS ÚNICOS Y DISPONIBILIDAD
-- =====================================================

-- Agregar constraint de slug único
ALTER TABLE companies 
ADD CONSTRAINT companies_slug_unique UNIQUE (slug);

-- Función para verificar disponibilidad de slug
CREATE OR REPLACE FUNCTION check_slug_available(p_slug text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM companies WHERE slug = p_slug
  );
END;
$$;

-- Función para generar slug desde nombre
CREATE OR REPLACE FUNCTION generate_slug(p_name text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  v_slug text;
  v_counter int := 1;
  v_temp_slug text;
BEGIN
  -- Limpiar y normalizar
  v_slug := lower(p_name);
  v_slug := regexp_replace(v_slug, '[^a-z0-9\s-]', '', 'g');
  v_slug := regexp_replace(v_slug, '\s+', '-', 'g');
  v_slug := regexp_replace(v_slug, '-+', '-', 'g');
  v_slug := trim(both '-' from v_slug);
  
  -- Si está disponible, retornar
  IF check_slug_available(v_slug) THEN
    RETURN v_slug;
  END IF;
  
  -- Si no, agregar número
  LOOP
    v_temp_slug := v_slug || '-' || v_counter;
    IF check_slug_available(v_temp_slug) THEN
      RETURN v_temp_slug;
    END IF;
    v_counter := v_counter + 1;
    
    -- Evitar loop infinito
    IF v_counter > 100 THEN
      RETURN v_slug || '-' || substr(md5(random()::text), 1, 6);
    END IF;
  END LOOP;
END;
$$;

-- =====================================================
-- CONFIGURACIÓN DE REGISTRO PÚBLICO
-- =====================================================

-- Agregar settings de registro a company metadata
COMMENT ON COLUMN companies.metadata IS 'JSONB with: settings.allow_public_registration, settings.allow_patient_login, settings.allow_self_booking, branding, etc';

-- Función para verificar si una empresa permite registro público
CREATE OR REPLACE FUNCTION company_allows_registration(p_slug text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_settings jsonb;
BEGIN
  SELECT metadata->'settings' INTO v_settings
  FROM companies
  WHERE slug = p_slug AND status = 'active';
  
  IF v_settings IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN COALESCE((v_settings->>'allow_public_registration')::boolean, false);
END;
$$;

-- =====================================================
-- POLÍTICAS RLS PARA ACCESO PÚBLICO POR SLUG
-- =====================================================

-- Permitir lectura pública de empresas por slug (para landing pages)
CREATE POLICY "public_read_company_by_slug" ON companies
  FOR SELECT
  USING (status = 'active');

-- Permitir lectura pública de servicios de una empresa (para booking)
CREATE POLICY "public_read_services_by_company" ON services
  FOR SELECT
  USING (
    is_active = true 
    AND EXISTS (
      SELECT 1 FROM companies 
      WHERE companies.id = services.company_id 
      AND companies.status = 'active'
    )
  );

-- Permitir creación de citas si la empresa lo permite
CREATE POLICY "public_create_appointments" ON appointments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies c
      WHERE c.id = appointments.company_id
      AND c.status = 'active'
      AND (c.metadata->'settings'->>'allow_self_booking')::boolean = true
    )
  );

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista de empresas públicas (para listados)
CREATE OR REPLACE VIEW public_companies AS
SELECT 
  id,
  name,
  slug,
  logo_url,
  website,
  metadata->'description' as description,
  metadata->'branding' as branding,
  created_at
FROM companies
WHERE status = 'active';

COMMENT ON VIEW public_companies IS 'Public companies for landing pages and directories';