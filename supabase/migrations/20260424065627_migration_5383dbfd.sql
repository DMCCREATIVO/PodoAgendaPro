-- ============================================
-- POLÍTICAS RLS PARA SUPERADMIN
-- ============================================

-- 1. TABLA USERS - Políticas para SuperAdmin
-- ============================================

-- Verificar si RLS está habilitado en users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: SuperAdmin puede SELECT todos los usuarios
DROP POLICY IF EXISTS "superadmin_read_all_users" ON users;
CREATE POLICY "superadmin_read_all_users" ON users
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.is_superadmin = true
  )
);

-- Policy: SuperAdmin puede INSERT nuevos usuarios
DROP POLICY IF EXISTS "superadmin_insert_users" ON users;
CREATE POLICY "superadmin_insert_users" ON users
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.is_superadmin = true
  )
);

-- Policy: SuperAdmin puede UPDATE todos los usuarios
DROP POLICY IF EXISTS "superadmin_update_users" ON users;
CREATE POLICY "superadmin_update_users" ON users
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.is_superadmin = true
  )
);

-- Policy: SuperAdmin puede DELETE usuarios
DROP POLICY IF EXISTS "superadmin_delete_users" ON users;
CREATE POLICY "superadmin_delete_users" ON users
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.is_superadmin = true
  )
);

-- Policy: Usuarios pueden ver su propio perfil
DROP POLICY IF EXISTS "users_read_own_profile" ON users;
CREATE POLICY "users_read_own_profile" ON users
FOR SELECT
USING (id = auth.uid());

-- Policy: Usuarios pueden actualizar su propio perfil
DROP POLICY IF EXISTS "users_update_own_profile" ON users;
CREATE POLICY "users_update_own_profile" ON users
FOR UPDATE
USING (id = auth.uid());


-- 2. TABLA COMPANY_USERS - Políticas para SuperAdmin
-- ============================================

-- Verificar si RLS está habilitado en company_users
ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;

-- Policy: SuperAdmin puede SELECT todas las relaciones
DROP POLICY IF EXISTS "superadmin_read_all_company_users" ON company_users;
CREATE POLICY "superadmin_read_all_company_users" ON company_users
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.is_superadmin = true
  )
);

-- Policy: SuperAdmin puede INSERT nuevas relaciones
DROP POLICY IF EXISTS "superadmin_insert_company_users" ON company_users;
CREATE POLICY "superadmin_insert_company_users" ON company_users
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.is_superadmin = true
  )
);

-- Policy: SuperAdmin puede UPDATE relaciones
DROP POLICY IF EXISTS "superadmin_update_company_users" ON company_users;
CREATE POLICY "superadmin_update_company_users" ON company_users
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.is_superadmin = true
  )
);

-- Policy: SuperAdmin puede DELETE relaciones
DROP POLICY IF EXISTS "superadmin_delete_company_users" ON company_users;
CREATE POLICY "superadmin_delete_company_users" ON company_users
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.is_superadmin = true
  )
);

-- Policy: Owners pueden SELECT usuarios de su empresa
DROP POLICY IF EXISTS "owners_read_company_users" ON company_users;
CREATE POLICY "owners_read_company_users" ON company_users
FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM company_users
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'admin')
    AND status = 'active'
  )
);

-- Policy: Owners pueden INSERT usuarios en su empresa
DROP POLICY IF EXISTS "owners_insert_company_users" ON company_users;
CREATE POLICY "owners_insert_company_users" ON company_users
FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT company_id FROM company_users
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'admin')
    AND status = 'active'
  )
);

-- Policy: Owners pueden UPDATE usuarios de su empresa
DROP POLICY IF EXISTS "owners_update_company_users" ON company_users;
CREATE POLICY "owners_update_company_users" ON company_users
FOR UPDATE
USING (
  company_id IN (
    SELECT company_id FROM company_users
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'admin')
    AND status = 'active'
  )
);

-- Policy: Usuarios pueden ver sus propias asignaciones
DROP POLICY IF EXISTS "users_read_own_company_users" ON company_users;
CREATE POLICY "users_read_own_company_users" ON company_users
FOR SELECT
USING (user_id = auth.uid());


-- 3. TABLA COMPANIES - Políticas para SuperAdmin
-- ============================================

-- Verificar si RLS está habilitado en companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Policy: SuperAdmin puede SELECT todas las empresas
DROP POLICY IF EXISTS "superadmin_read_all_companies" ON companies;
CREATE POLICY "superadmin_read_all_companies" ON companies
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.is_superadmin = true
  )
);

-- Policy: SuperAdmin puede INSERT empresas
DROP POLICY IF EXISTS "superadmin_insert_companies" ON companies;
CREATE POLICY "superadmin_insert_companies" ON companies
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.is_superadmin = true
  )
);

-- Policy: SuperAdmin puede UPDATE empresas
DROP POLICY IF EXISTS "superadmin_update_companies" ON companies;
CREATE POLICY "superadmin_update_companies" ON companies
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.is_superadmin = true
  )
);

-- Policy: SuperAdmin puede DELETE empresas
DROP POLICY IF EXISTS "superadmin_delete_companies" ON companies;
CREATE POLICY "superadmin_delete_companies" ON companies
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.is_superadmin = true
  )
);

-- Policy: Owners/Admins pueden ver su propia empresa
DROP POLICY IF EXISTS "users_read_own_company" ON companies;
CREATE POLICY "users_read_own_company" ON companies
FOR SELECT
USING (
  id IN (
    SELECT company_id FROM company_users
    WHERE user_id = auth.uid()
    AND status = 'active'
  )
);

-- Policy: Owners pueden actualizar su empresa
DROP POLICY IF EXISTS "owners_update_company" ON companies;
CREATE POLICY "owners_update_company" ON companies
FOR UPDATE
USING (
  id IN (
    SELECT company_id FROM company_users
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'admin')
    AND status = 'active'
  )
);

-- Policy: Páginas públicas pueden ver empresas activas (para landing/disponibilidad)
DROP POLICY IF EXISTS "public_read_active_companies" ON companies;
CREATE POLICY "public_read_active_companies" ON companies
FOR SELECT
USING (is_active = true);

-- Mensaje de confirmación
SELECT 
  'RLS Policies creadas exitosamente' as mensaje,
  'SuperAdmin tiene acceso completo a users, company_users y companies' as detalle;