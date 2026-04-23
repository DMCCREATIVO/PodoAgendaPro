-- DESACTIVAR COMPLETAMENTE RLS de company_users (tabla problemática)
ALTER TABLE company_users DISABLE ROW LEVEL SECURITY;

-- Verificar que se desactivó
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'company_users';