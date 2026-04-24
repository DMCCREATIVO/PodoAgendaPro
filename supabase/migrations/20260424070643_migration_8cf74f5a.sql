-- ============================================
-- SIMPLIFICACIÓN: AGREGAR ROLES A TABLA USERS
-- ============================================

-- 1. Agregar columnas role y company_id a users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role TEXT,
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);

-- 2. Crear índices para performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);

-- 3. Migrar datos de company_users a users
UPDATE users u
SET 
  role = cu.role,
  company_id = cu.company_id
FROM company_users cu
WHERE u.id = cu.user_id
  AND cu.status = 'active';

-- 4. Asignar role 'superadmin' a usuarios con is_superadmin = true
UPDATE users
SET role = 'superadmin'
WHERE is_superadmin = true;

-- 5. Asignar role 'patient' a usuarios sin rol
UPDATE users
SET role = 'patient'
WHERE role IS NULL 
  AND is_superadmin = false;

-- Verificación
SELECT 
  'Migración completada' as mensaje,
  COUNT(*) as total_usuarios,
  COUNT(CASE WHEN role = 'superadmin' THEN 1 END) as superadmins,
  COUNT(CASE WHEN role = 'owner' THEN 1 END) as owners,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
  COUNT(CASE WHEN role = 'employee' THEN 1 END) as employees,
  COUNT(CASE WHEN role = 'patient' THEN 1 END) as patients,
  COUNT(CASE WHEN role IS NULL THEN 1 END) as sin_rol
FROM users;

-- Ver usuarios con sus nuevos roles
SELECT 
  email,
  full_name,
  role,
  company_id,
  is_superadmin,
  is_active
FROM users
ORDER BY 
  CASE 
    WHEN role = 'superadmin' THEN 1
    WHEN role = 'owner' THEN 2
    WHEN role = 'admin' THEN 3
    WHEN role = 'employee' THEN 4
    WHEN role = 'patient' THEN 5
    ELSE 6
  END,
  email;