-- SOLUCIÓN: Crear política que permita leer users para hacer login
-- Esto permite que CUALQUIERA pueda leer la tabla users (necesario para login)
DROP POLICY IF EXISTS "anon_read_users_for_login" ON users;
CREATE POLICY "anon_read_users_for_login" 
  ON users 
  FOR SELECT 
  USING (true);