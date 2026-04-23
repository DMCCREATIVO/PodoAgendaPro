-- Eliminar TODAS las políticas antiguas de company_users
DROP POLICY IF EXISTS "Admins can manage company users" ON company_users;
DROP POLICY IF EXISTS "Users can view their company memberships" ON company_users;
DROP POLICY IF EXISTS "Users can view their own company memberships" ON company_users;
DROP POLICY IF EXISTS "Company admins can manage users" ON company_users;
DROP POLICY IF EXISTS "Users can view active memberships" ON company_users;

-- Verificar que solo queden las políticas nuevas (sin recursión)
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'company_users'
ORDER BY policyname;